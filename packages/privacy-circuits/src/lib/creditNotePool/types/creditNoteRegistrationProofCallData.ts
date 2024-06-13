type HexUInt256 = string;

export type CreditNoteRegistrationProofCallData = [
  [HexUInt256, HexUInt256],
  [[HexUInt256, HexUInt256], [HexUInt256, HexUInt256]],
  [HexUInt256, HexUInt256],
  [HexUInt256, HexUInt256]
];
