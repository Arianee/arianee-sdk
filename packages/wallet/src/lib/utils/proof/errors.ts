export class NotAProofLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotAProofLinkError';
    Object.setPrototypeOf(this, NotAProofLinkError.prototype);
  }
}

export class ProofKeyNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProofKeyNotFoundError';
    Object.setPrototypeOf(this, ProofKeyNotFoundError.prototype);
  }
}

export class ProofKeyNotValidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProofKeyNotValidError';
    Object.setPrototypeOf(this, ProofKeyNotValidError.prototype);
  }
}
export class ProofCreatorIsNotOwnerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProofCreatorIsNotOwnerError';
    Object.setPrototypeOf(this, ProofCreatorIsNotOwnerError.prototype);
  }
}

export class ProofExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProofExpiredError';
    Object.setPrototypeOf(this, ProofExpiredError.prototype);
  }
}
