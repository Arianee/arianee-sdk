import { ProtocolClientV1 } from '@arianee/arianee-protocol-client';

export type CreditNotePoolGenerateProofParameters = {
  protocolV1: ProtocolClientV1;
  nullifier: bigint;
  nullifierDerivationIndex: bigint;
  secret: bigint;
  /**
   * @dev WARNING: The parameter `zkCreditType` is the credit type that the user wants to purchase BUT it is 1-indexed.
   * This is done on purpose for easier circuit implementation.
   * Example: If the user wants to purchase a "certificate" credit (type 0), the `zkCreditType` should be 1.
   */
  zkCreditType: 1 | 2 | 3 | 4;
  issuerProxy: string;
  intentHashAsStr: string;
  performValidation?: boolean;
};
