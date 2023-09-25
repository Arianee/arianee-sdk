import Creator from '@arianee/creator';

export const isConnectedToV2Protocol = (
  creator: Creator<'WAIT_TRANSACTION_RECEIPT'>
): boolean => {
  if (!creator.connectedProtocolClient)
    throw new Error('No protocol client connected');

  return creator.connectedProtocolClient.protocolDetails.protocolVersion.startsWith(
    '2'
  );
};
