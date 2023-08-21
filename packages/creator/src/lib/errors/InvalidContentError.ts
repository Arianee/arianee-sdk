export class InvalidContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidContentError';
    Object.setPrototypeOf(this, InvalidContentError.prototype);
  }
}
