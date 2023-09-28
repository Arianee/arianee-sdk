import Creator, { CreditType } from '@arianee/creator';
import { ProtocolDetailsV2 } from '@arianee/common-types';

export const getV2ContractAddressForCreditType = (
  creditType: number,
  creator: Creator<'WAIT_TRANSACTION_RECEIPT'>
): string => {
  const v2ProtocolDetails = creator.connectedProtocolClient
    ?.protocolDetails as ProtocolDetailsV2;

  let contractAddress: string;
  switch (creditType) {
    case CreditType.smartAsset:
      contractAddress = v2ProtocolDetails.contractAdresses.nft;
      break;
    case CreditType.event:
      contractAddress = v2ProtocolDetails.contractAdresses.eventHub;
      break;
    case CreditType.message:
      contractAddress = v2ProtocolDetails.contractAdresses.messageHub;
      break;
    case CreditType.update:
      contractAddress = v2ProtocolDetails.contractAdresses.nft;
      break;
    default:
      throw new Error('Invalid credit type');
  }

  return contractAddress;
};
