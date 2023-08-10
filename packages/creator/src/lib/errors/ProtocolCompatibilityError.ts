export class ProtocolCompatibilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProtocolCompatibilityError';
    Object.setPrototypeOf(this, ProtocolCompatibilityError.prototype);
  }
}
