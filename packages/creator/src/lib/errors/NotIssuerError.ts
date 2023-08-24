export class NotIssuerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotIssuerError';
    Object.setPrototypeOf(this, NotIssuerError.prototype);
  }
}
