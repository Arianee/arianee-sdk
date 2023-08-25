export class InsufficientEventCreditsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientEventCreditsError';
    Object.setPrototypeOf(this, InsufficientEventCreditsError.prototype);
  }
}
