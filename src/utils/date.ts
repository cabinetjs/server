import dayjs from "dayjs";
import cronParser from "cron-parser";
import cronstrue from "cronstrue";
import ms from "ms";

export function getTimestamp() {
    // get timestamp in milliseconds
    return dayjs().valueOf();
}

export function isCronExpression(value: string) {
    try {
        cronParser.parseExpression(value);
        return true;
    } catch {
        return false;
    }
}

export function formatInterval(value: string | number) {
    if (typeof value === "number") {
        return `every ${ms(value, { long: true })}`;
    }

    if (isCronExpression(value)) {
        return cronstrue.toString(value).toLowerCase();
    }

    const milliseconds = ms(value);
    return `every ${ms(milliseconds, { long: true })}`;
}
