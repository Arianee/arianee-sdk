export class UnavailableMessageIdError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnavailableMessageIdError';
    Object.setPrototypeOf(this, UnavailableMessageIdError.prototype);
  }
}
