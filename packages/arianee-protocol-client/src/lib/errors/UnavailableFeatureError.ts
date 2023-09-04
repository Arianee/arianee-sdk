export class UnavailableFeatureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnavailableFeatureError';
    Object.setPrototypeOf(this, UnavailableFeatureError.prototype);
  }
}
