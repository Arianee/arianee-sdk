type HexUInt256 = string;

export type OwnershipProofCallData = [
  [HexUInt256, HexUInt256],
  [[HexUInt256, HexUInt256], [HexUInt256, HexUInt256]],
  [HexUInt256, HexUInt256],
  [HexUInt256, HexUInt256, HexUInt256]
];
