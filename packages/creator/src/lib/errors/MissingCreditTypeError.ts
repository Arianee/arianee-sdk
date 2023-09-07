export class MissingCreditTypeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingCreditTypeError';
    Object.setPrototypeOf(this, MissingCreditTypeError.prototype);
  }
}
