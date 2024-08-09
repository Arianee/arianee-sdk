import {
  ArianeeEventI18N,
  ArianeeMessageI18N,
  ArianeeProductCertificateI18N,
  ProtocolDetails,
} from '@arianee/common-types';
import Core from '@arianee/core';

export const injectProductIssuerSignature = async (
  core: Core,
  protocolDetails: ProtocolDetails,
  smartAssetId: number,
  content: ArianeeProductCertificateI18N
): Promise<ArianeeProductCertificateI18N> => {
  const { signature } = await core.signMessage(
    getProductIssuerSignatureMsg(protocolDetails, smartAssetId)
  );

  return {
    ...content,
    issuer_signature: signature,
  };
};

export const getProductIssuerSignatureMsg = (
  protocolDetails: ProtocolDetails,
  smartAssetId: number
) => {
  return `SmartAsset(${protocolDetails.chainId}:${getSmartAssetContractAddr(
    protocolDetails
  )}:${smartAssetId})`;
};

export const injectMessageIssuerSignature = async (
  core: Core,
  protocolDetails: ProtocolDetails,
  messageId: number,
  content: ArianeeMessageI18N
): Promise<ArianeeMessageI18N> => {
  const { signature } = await core.signMessage(
    getMessageIssuerSignatureMsg(protocolDetails, messageId)
  );

  return {
    ...content,
    issuer_signature: signature,
  };
};

export const getMessageIssuerSignatureMsg = (
  protocolDetails: ProtocolDetails,
  messageId: number
) => {
  return `Message(${protocolDetails.chainId}:${getSmartAssetContractAddr(
    protocolDetails
  )}:${messageId})`;
};

export const injectEventIssuerSignature = async (
  core: Core,
  protocolDetails: ProtocolDetails,
  eventId: number,
  content: ArianeeEventI18N
): Promise<ArianeeEventI18N> => {
  const { signature } = await core.signMessage(
    getEventIssuerSignatureMsg(protocolDetails, eventId)
  );

  return {
    ...content,
    issuer_signature: signature,
  };
};

export const getEventIssuerSignatureMsg = (
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
