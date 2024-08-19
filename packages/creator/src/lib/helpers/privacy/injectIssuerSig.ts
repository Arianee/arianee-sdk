import {
  ArianeeEventI18N,
  ArianeeMessageI18N,
  ArianeeProductCertificateI18N,
  ProtocolDetails,
} from '@arianee/common-types';
import Core from '@arianee/core';
import {
  getIssuerSigTemplate__Event,
  getIssuerSigTemplate__Message,
  getIssuerSigTemplate__SmartAsset,
} from './getIssuerSigTemplate';

export const injectIssuerSig__SmartAsset = async (
  core: Core,
  protocolDetails: ProtocolDetails,
  smartAssetId: number,
  content: ArianeeProductCertificateI18N
): Promise<ArianeeProductCertificateI18N> => {
  const { signature } = await core.signMessage(
    getIssuerSigTemplate__SmartAsset(protocolDetails, smartAssetId)
  );

  return {
    ...content,
    issuer_signature: signature,
  };
};

export const injectIssuerSig__Message = async (
  core: Core,
  protocolDetails: ProtocolDetails,
  messageId: number,
  content: ArianeeMessageI18N
): Promise<ArianeeMessageI18N> => {
  const { signature } = await core.signMessage(
    getIssuerSigTemplate__Message(protocolDetails, messageId)
  );

  return {
    ...content,
    issuer_signature: signature,
  };
};

export const injectIssuerSig__Event = async (
  core: Core,
  protocolDetails: ProtocolDetails,
  eventId: number,
  content: ArianeeEventI18N
): Promise<ArianeeEventI18N> => {
  const { signature } = await core.signMessage(
    getIssuerSigTemplate__Event(protocolDetails, eventId)
  );

  return {
    ...content,
    issuer_signature: signature,
  };
};
