import dayjs from "dayjs";
import chalk from "chalk";

import { Fn } from "@utils/types";
import { getTimestamp } from "@utils/date";

type LogLevel = "log" | "info" | "warn" | "error" | "debug" | "verbose";

type LoggerFunctions = {
    [key in Exclude<LogLevel, "error">]: (message: string, ...args: any[]) => void;
} & {
    error: (message: string, stack?: string, ...args: any[]) => void;
};

const COLOR_FUNCTION_MAP: Record<LogLevel, Fn<string, string>> = {
    log: chalk.green,
    info: chalk.blue,
    debug: chalk.magenta,
    error: chalk.red,
    verbose: chalk.cyan,
    warn: chalk.yellow,
};

interface WorkOptionsBase<T> {
    level: LogLevel;
    message: string;
    work: Fn<[], Promise<T>>;
    args?: any[];
    successMessage?: string;
    errorMessage?: string;
}

interface ErrorForwardedWorkOption<T> extends WorkOptionsBase<T> {
    forwardError?: true;
}
interface NormalWorkOption<T> extends WorkOptionsBase<T> {
    forwardError: false;
}

interface LogOption {
    level: LogLevel;
    message: string;
    stack?: string;
    args?: any[];
    breakLine?: boolean;
    withoutPrefixes?: boolean;
    force?: boolean;
    context?: string;
}

const BLACKLISTED_CONTEXTS = ["InstanceLoader", "NestFactory", "NestApplication"];

export class Logger implements LoggerFunctions {
    private static isLocked = false;
    private static buffer = "";

    public constructor(private readonly name?: string) {}

    private setLock(lock: boolean): void {
        Logger.isLocked = lock;

        if (!lock) {
            process.stdout.write(Logger.buffer);
            Logger.buffer = "";
        }
    }

    public async doWork<T>(option: ErrorForwardedWorkOption<T>): Promise<T>;
    public async doWork<T>(option: NormalWorkOption<T>): Promise<T | undefined>;
    public async doWork<T>({
        level,
        message,
        work,
        args = [],
        successMessage = "succeeded.",
        errorMessage = chalk.red("failed."),
        forwardError = true,
    }: ErrorForwardedWorkOption<T> | NormalWorkOption<T>): Promise<T | undefined> {
        this.printLog({
            level,
            message: `${message} ... `,
            args,
            breakLine: false,
        });
        this.setLock(true);

        const startedAt: number = getTimestamp();
        let finishedAt: number;
        let resultMessage = "";
        let result: T | undefined;

        const printResult = () => {
            const elapsedTime = finishedAt - startedAt;

            this.printLog({
                level,
                message: `${resultMessage} {gray}`,
                args: [`(${elapsedTime}ms)`],
                withoutPrefixes: true,
                force: true,
            });
        };

        try {
            result = await work();
            resultMessage = successMessage;
        } catch (e) {
            resultMessage = errorMessage;

            if (forwardError) {
                throw e;
            }
        } finally {
            finishedAt = getTimestamp();
            printResult();

            this.setLock(false);
        }

        return result;
    }

    public log(message: string, context?: string, ...args: any[]): void {
        this.printLog({ level: "log", message, args, context });
    }
    public info(message: string, context?: string, ...args: any[]): void {
        this.printLog({ level: "info", message, args, context });
    }
    public warn(message: string, context?: string, ...args: any[]): void {
        this.printLog({ level: "warn", message, args, context });
    }
    public error(message: string, stack?: string, context?: string, ...args: any[]): void {
        this.printLog({ level: "error", message, args, stack, context });
    }
    public verbose(message: string, context?: string, ...args: any[]): void {
        this.printLog({ level: "verbose", message, args, context });
    }
    public debug(message: string, context?: string, ...args: any[]): void {
        this.printLog({ level: "debug", message, args, context });
    }

    private printLog({
        level,
        message,
        stack,
        breakLine = true,
        withoutPrefixes = false,
        force = false,
        args = [],
        context: name = this.name || Logger.name,
    }: LogOption): void {
        if (BLACKLISTED_CONTEXTS.includes(name)) {
            return;
        }

        const colorize = COLOR_FUNCTION_MAP[level];
        const currentTime = dayjs();
        const prefixes = [
            colorize(level.toUpperCase().padStart(7, " ")),
            currentTime.format("YYYY. MM. DD. HH:mm:ss.SSS"),
            chalk.yellow(`[${name}]`),
        ].join(colorize(" - "));

        let formattedMessage = message;
        if (args) {
            [...formattedMessage.matchAll(/\{(.*?)\}/g)].forEach((match, index) => {
                const [full, key] = match;
                let value = args[index];
                if (!!value) {
                    value = chalk[key](value);
                }

                formattedMessage = formattedMessage.replace(full, value);
            });
        }

        const shouldBreakLine = breakLine || !!stack;
        let targetMessage = `${colorize(formattedMessage)}${shouldBreakLine ? "\n" : ""}`;
        if (!withoutPrefixes) {
            targetMessage = `${prefixes} ${targetMessage}`;
        }

        if (Logger.isLocked && !force) {
            Logger.buffer += targetMessage;
            if (stack) {
                Logger.buffer += `${this.stripStack(stack)}\n`;
            }
        } else {
            process.stdout.write(targetMessage);
            if (stack) {
                console.log(this.stripStack(stack));
            }
        }
    }

    private stripStack(stack: string): string {
        return stack
            .split("\n")
            .filter(line => line.trim().startsWith("at"))
            .join("\n");
    }
}
