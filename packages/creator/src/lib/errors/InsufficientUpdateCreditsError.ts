export class InsufficientUpdateCreditsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientUpdateCreditsError';
    Object.setPrototypeOf(this, InsufficientUpdateCreditsError.prototype);
  }
}
