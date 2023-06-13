export class InvalidConfigError extends Error {
    public readonly name = "InvalidConfigError";
    public readonly error: string;

    public constructor(message: string, error: string) {
        super(message);
        this.error = error;
    }
}
