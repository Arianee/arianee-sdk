export class ArianeePrivacyGatewayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArianeePrivacyGatewayError';
    Object.setPrototypeOf(this, ArianeePrivacyGatewayError.prototype);
  }
}
