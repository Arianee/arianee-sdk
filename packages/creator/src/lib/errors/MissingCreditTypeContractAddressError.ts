export class MissingCreditContractAddressError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingCreditContractAddressError';
    Object.setPrototypeOf(this, MissingCreditContractAddressError.prototype);
  }
}
