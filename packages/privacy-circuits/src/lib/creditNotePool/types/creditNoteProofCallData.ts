type HexUInt256 = string;

export type CreditNoteProofCallData = [
  [HexUInt256, HexUInt256],
  [[HexUInt256, HexUInt256], [HexUInt256, HexUInt256]],
  [HexUInt256, HexUInt256],
  [HexUInt256, HexUInt256, HexUInt256, HexUInt256]
];
