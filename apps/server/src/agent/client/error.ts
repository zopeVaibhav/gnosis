export class NotConnectedError extends Error {
    constructor(public provider: string) {
        super(`${provider} not connected`);
        this.name = "NotConnectedError";
    }
}
