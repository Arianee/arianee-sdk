import { ProtocolDetails } from '@arianee/common-types';

export type ProtocolDetailsResolver = (
  slug: string
) => Promise<ProtocolDetails>;
