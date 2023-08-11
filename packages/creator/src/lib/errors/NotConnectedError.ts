export class NotConnectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotConnectedError';
    Object.setPrototypeOf(this, NotConnectedError.prototype);
  }
}
