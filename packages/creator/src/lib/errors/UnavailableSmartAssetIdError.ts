export class UnavailableSmartAssetIdError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnavailableSmartAssetIdError';
    Object.setPrototypeOf(this, UnavailableSmartAssetIdError.prototype);
  }
}
