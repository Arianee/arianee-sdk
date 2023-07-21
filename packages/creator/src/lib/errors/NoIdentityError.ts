export class NoIdentityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoIdentityError';
    Object.setPrototypeOf(this, NoIdentityError.prototype);
  }
}
