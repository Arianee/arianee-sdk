export class InvalidURIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidURIError';
    Object.setPrototypeOf(this, InvalidURIError.prototype);
  }
}
