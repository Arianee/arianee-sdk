import ArianeeProtocolClient from '@arianee/arianee-protocol-client';
import { ChainType } from '@arianee/common-types';
import {
  calculateImprint,
  getIssuerSigTemplate__Event,
  getIssuerSigTemplate__Message,
  getIssuerSigTemplate__SmartAsset,
} from '@arianee/utils';
import { verifyMessage, ZeroAddress } from 'ethers';

import MessageInstance from '../../services/message/instances/messageInstance';
import ArianeeEventInstance from '../../services/smartAsset/instances/arianeeEventInstance';
import SmartAssetInstance from '../../services/smartAsset/instances/smartAssetInstance';
import { TransactionStrategy } from '../../wallet';

type SupportedClass<T extends ChainType, S extends TransactionStrategy> =
  | typeof SmartAssetInstance<T, S>
  | typeof ArianeeEventInstance<T, S>
  | typeof MessageInstance<T, S>;

/**
 * Creates an instance of a supported class (smart asset, arianee event or message)
 * and computes the authenticity of the content with the imprint and set the isAuthentic property
 * @param supportedClass the class of the instance to create
 */
export const instanceFactory = async <
  T extends ChainType,
  S extends TransactionStrategy,
  I extends SupportedClass<T, S>
>(
  supportedClass: I,
  params: ConstructorParameters<I>,
  fetchLike: typeof fetch,
  protocolClient: ArianeeProtocolClient
): Promise<InstanceType<I>> => {
  const instance = new (supportedClass as any)(...params);

  // override instance issuer (or sender) if signature is present in the content
  if (
    instance instanceof ArianeeEventInstance &&
    instance.rawContent.issuer_signature
  ) {
    try {
      const protocolName = instance.protocol.name;
      const { protocolDetails } = await protocolClient.connect(protocolName);
      const message = getIssuerSigTemplate__Event(
        protocolDetails,
        parseInt(instance.id)
      );
      const sig = instance.rawContent.issuer_signature;
      const issuerAddress = verifyMessage(message, sig);

      Object.assign(instance, {
        sender: issuerAddress,
      });
    } catch (e) {
      console.error('Error while recovering issuer address from signature', e);
      Object.assign(instance, {
        sender: ZeroAddress,
      });
    }
  } else if (
    (instance instanceof SmartAssetInstance ||
      instance instanceof MessageInstance) &&
    instance.data.rawContent.issuer_signature
  ) {
    try {
      const protocolName = instance.data.protocol.name;
      const { protocolDetails } = await protocolClient.connect(protocolName);

      let message: string;
      if (instance instanceof SmartAssetInstance) {
        message = getIssuerSigTemplate__SmartAsset(
          protocolDetails,
          parseInt(instance.data.certificateId)
        );
      } else {
        message = getIssuerSigTemplate__Message(
          protocolDetails,
          parseInt(instance.data.id)
        );
      }
      const sig = instance.data.rawContent.issuer_signature;
      const issuerAddress = verifyMessage(message, sig);

      if (instance instanceof SmartAssetInstance) {
        instance.data.issuer = issuerAddress;
      } else {
        instance.data.sender = issuerAddress;
      }
    } catch (e) {
      console.error('Error while recovering issuer address from signature', e);
      if (instance instanceof SmartAssetInstance) {
        instance.data.issuer = ZeroAddress;
      } else {
        instance.data.sender = ZeroAddress;
      }
    }
  }

  // assert that the imprint is correct
  if (instance instanceof ArianeeEventInstance) {
    try {
      const calculatedImprint = await calculateImprint(
        instance.rawContent,
        fetchLike
      );

      Object.assign(instance, {
        isAuthentic:
          calculatedImprint.toLowerCase() === instance.imprint.toLowerCase(),
      });
    } catch (e) {
      console.error('Error while calculating arianee event imprint', e);
      Object.assign(instance, {
        isAuthentic: false,
      });
    }
  } else {
    try {
      const calculatedImprint = await calculateImprint(
        instance.data.rawContent,
        fetchLike
      );

      instance.data.isAuthentic =
        calculatedImprint.toLowerCase() === instance.data.imprint.toLowerCase();
    } catch (e) {
      console.error('Error while calculating smart asset imprint', e);
      instance.data.isAuthentic = false;
    }
  }

  return instance as InstanceType<I>;
};
