export class IdentityNotApproved extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IdentityNotApproved';
    Object.setPrototypeOf(this, IdentityNotApproved.prototype);
  }
}
