export class Response {
    status: 'success' | 'error';
    message?: string;
    body?: object|Array<any>;

    constructor(status: 'success' | 'error', message?: string) {
        this.status = status;
        this.message = message;
    }
}
