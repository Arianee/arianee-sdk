export class InsufficientMessageCreditsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientMessageCreditsError';
    Object.setPrototypeOf(this, InsufficientMessageCreditsError.prototype);
  }
}
