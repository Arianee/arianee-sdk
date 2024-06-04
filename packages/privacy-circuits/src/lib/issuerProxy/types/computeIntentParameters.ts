import { ProtocolClientV1 } from '@arianee/arianee-protocol-client';

export type IssuerProxyComputeIntentParameters = {
  protocolV1: ProtocolClientV1;
  fragment: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: readonly any[];
  needsCreditNoteProof: boolean;
};
