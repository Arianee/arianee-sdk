import { Protocol } from '@arianee/common-types';
import ArianeeProtocolClient from '../../arianeeProtocolClient';
import ProtocolClientV1 from '../../v1/protocolClientV1';

export const callWrapper = async <T>(
  arianeeProtocolClient: ArianeeProtocolClient,
  protocolName: Protocol['name'],
  actions: {
    protocolV1Action: (v1: ProtocolClientV1) => Promise<T>;
  },
  connectOptions?: Parameters<ArianeeProtocolClient['connect']>[1]
): Promise<T> => {
  const protocol = await arianeeProtocolClient.connect(
    protocolName,
    connectOptions
  );

  if ('v1' in protocol) {
    try {
      return await actions.protocolV1Action(protocol.v1);
    } catch (e) {
      console.error(e);
      throw new Error('Error while executing the protocol v1 action');
    }
  } else {
    throw new Error(`This protocol is not yet supported (${protocolName})`);
  }
};
