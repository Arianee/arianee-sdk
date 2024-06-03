import { ProtocolClientV1 } from '@arianee/arianee-protocol-client';

export type IssuerProxyGenerateProofParameters = {
  protocolV1: ProtocolClientV1;
  tokenId: string;
  intentHashAsStr: string;
};
