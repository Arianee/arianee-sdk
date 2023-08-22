export class NotOwnerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotOwnerError';
    Object.setPrototypeOf(this, NotOwnerError.prototype);
  }
}
