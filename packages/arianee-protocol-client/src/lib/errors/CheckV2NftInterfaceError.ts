export class CheckV2NftInterfaceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckV2NftInterfaceError';
    Object.setPrototypeOf(this, CheckV2NftInterfaceError.prototype);
  }
}
