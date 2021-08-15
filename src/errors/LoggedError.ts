export class LoggedError extends Error {
    constructor(text: string) {
        super(text);

        Object.setPrototypeOf(this, LoggedError.prototype);
    }

}
