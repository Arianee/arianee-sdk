import { Protocol } from '@arianee/common-types';

import ArianeeProtocolClient from '../../arianeeProtocolClient';
import ProtocolClientV1 from '../../v1/protocolClientV1';
import ProtocolClientV2 from '../../v2/protocolClientV2';

export const callWrapper = async <T>(
  arianeeProtocolClient: ArianeeProtocolClient,
  protocolName: Protocol['name'],
  actions: {
    protocolV1Action: (v1: ProtocolClientV1) => Promise<T>;
    protocolV2Action: (v2: ProtocolClientV2) => Promise<T>;
  },
  connectOptions?: Parameters<ArianeeProtocolClient['connect']>[1]
): Promise<T> => {
  const protocol = await arianeeProtocolClient.connect(
    protocolName,
    connectOptions
  );

  if (
    !(protocol instanceof ProtocolClientV1) &&
    !(protocol instanceof ProtocolClientV2)
  )
    throw new Error(
      `The wrapper does not support this protocol (${protocolName} / ${protocol})`
    );

  if (protocol instanceof ProtocolClientV1) {
    try {
      return await actions.protocolV1Action(protocol);
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : '';
      throw new Error(
        'Error while executing the protocol v1 action  ' + message
      );
    }
  } else {
    try {
      return await actions.protocolV2Action(protocol);
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : '';
      throw new Error(
        'Error while executing the protocol v2 action ' + message
      );
    }
  }
};
