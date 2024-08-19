import { ProtocolDetails } from '@arianee/common-types';

export const getIssuerSigTemplate__SmartAsset = (
  protocolDetails: ProtocolDetails,
  smartAssetId: number
) => {
  return `SmartAsset(${protocolDetails.chainId}:${getSmartAssetContractAddr(
    protocolDetails
  )}:${smartAssetId})`;
};

export const getIssuerSigTemplate__Message = (
  protocolDetails: ProtocolDetails,
  messageId: number
) => {
  return `Message(${protocolDetails.chainId}:${getSmartAssetContractAddr(
    protocolDetails
  )}:${messageId})`;
};

export const getIssuerSigTemplate__Event = (
  protocolDetails: ProtocolDetails,
  eventId: number
) => {
  return `Event(${protocolDetails.chainId}:${getSmartAssetContractAddr(
    protocolDetails
  )}:${eventId})`;
};

const getSmartAssetContractAddr = (protocolDetails: ProtocolDetails) => {
  let smartAssetContractAddr: string;
  if ('smartAsset' in protocolDetails.contractAdresses) {
    smartAssetContractAddr = protocolDetails.contractAdresses.smartAsset;
  } else {
    smartAssetContractAddr = protocolDetails.contractAdresses.nft;
  }
  return smartAssetContractAddr;
};
