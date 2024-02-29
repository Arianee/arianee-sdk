import {
  callWrapper,
  NonPayableOverrides,
} from '@arianee/arianee-protocol-client';
import { SmartAsset } from '@arianee/common-types';

import Creator, { TransactionStrategy } from '../creator';
import { requiresConnection } from '../decorators/requiresConnection';
import { getCreatorIdentity } from '../helpers/identity/getIdentity';
import { assertSmartAssetIssuedBy } from '../helpers/smartAsset/assertSmartAssetIssuedBy';

export default class LostAndStolen<Strategy extends TransactionStrategy> {
  constructor(private creator: Creator<Strategy>) {}

  @requiresConnection()
  public async isMissing(
    smartAssetId: SmartAsset['certificateId']
  ): Promise<{ isMissing: boolean }> {
    const isMissing = await callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          return protocolV1.arianeeLost.isMissing(smartAssetId);
        },
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );

    return {
      isMissing,
    };
  }

  @requiresConnection()
  public async isStolen(
    smartAssetId: SmartAsset['certificateId']
  ): Promise<{ isStolen: boolean }> {
    const isStolen = await callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          return protocolV1.arianeeLost.isStolen(smartAssetId);
        },
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );

    return {
      isStolen,
    };
  }

  @requiresConnection()
  public async setMissingStatus(
    smartAssetId: SmartAsset['certificateId'],
    isMissing: boolean,
    overrides: NonPayableOverrides = {}
  ): Promise<{
    missingStatus: boolean;
    smartAssetId: SmartAsset['certificateId'];
  }> {
    await getCreatorIdentity(this.creator); // assert has identity
    await assertSmartAssetIssuedBy(
      {
        smartAssetId,
        expectedIssuer: this.creator.core.getAddress(),
      },
      this.creator.utils
    );

    await this.creator.transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          const isMissingOnChain = await protocolV1.arianeeLost.isMissing(
            smartAssetId
          );
          console.log('is missing', isMissing);
          if (isMissing === isMissingOnChain) {
            throw new Error(`Missing status is already set as ${isMissing}`);
          }

          if (isMissing === true) {
            return protocolV1.arianeeLost.setMissingStatus(
              smartAssetId,
              overrides
            );
          } else {
            return protocolV1.arianeeLost.unsetMissingStatus(
              smartAssetId,
              overrides
            );
          }
        },
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );

    return {
      smartAssetId,
      missingStatus: isMissing,
    };
  }

  @requiresConnection()
  public async setStolenStatus(
    smartAssetId: SmartAsset['certificateId'],
    isStolen: boolean,
    overrides: NonPayableOverrides = {}
  ): Promise<{
    stolenStatus: boolean;
    smartAssetId: SmartAsset['certificateId'];
  }> {
    await getCreatorIdentity(this.creator); // assert has identity
    await assertSmartAssetIssuedBy(
      {
        smartAssetId,
        expectedIssuer: this.creator.core.getAddress(),
      },
      this.creator.utils
    );

    await this.creator.transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          const isStolenOnChain = await protocolV1.arianeeLost.isStolen(
            smartAssetId
          );
          if (isStolen === isStolenOnChain) {
            throw new Error(`Stolen status is already set as ${isStolen}`);
          }

          if (isStolen === true) {
            return protocolV1.arianeeLost.setStolenStatus(
              smartAssetId,
              overrides
            );
          } else {
            return protocolV1.arianeeLost.unsetStolenStatus(
              smartAssetId,
              overrides
            );
          }
        },
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );

    return {
      smartAssetId,
      stolenStatus: isStolen,
    };
  }
}
