import { ProtocolClientV1 } from '@arianee/arianee-protocol-client';

export type IssuerProxyComputeIntentParameters = {
  protocolV1: ProtocolClientV1;
  fragment: string;
  values: readonly any[];
  needsCreditNoteProof: boolean;
};
