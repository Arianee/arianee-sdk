export class InsufficientSmartAssetCreditsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientSmartAssetCreditsError';
    Object.setPrototypeOf(this, InsufficientSmartAssetCreditsError.prototype);
  }
}
