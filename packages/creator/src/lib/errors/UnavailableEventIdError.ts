export class UnavailableEventIdError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnavailableEventIdError';
    Object.setPrototypeOf(this, UnavailableEventIdError.prototype);
  }
}
