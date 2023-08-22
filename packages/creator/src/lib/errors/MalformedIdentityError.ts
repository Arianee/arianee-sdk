export class MalformedIdentityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MalformedIdentityError';
    Object.setPrototypeOf(this, MalformedIdentityError.prototype);
  }
}
