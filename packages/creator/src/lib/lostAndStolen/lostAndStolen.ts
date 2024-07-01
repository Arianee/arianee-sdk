import {
  callWrapper,
  NonPayableOverrides,
} from '@arianee/arianee-protocol-client';
import { SmartAsset } from '@arianee/common-types';

import Creator, { TransactionStrategy } from '../creator';
import { requiresConnection } from '../decorators/requiresConnection';
import { assertSmartAssetIssuedBy } from '../helpers/smartAsset/assertSmartAssetIssuedBy';
import { getOwnershipProofStruct } from '../helpers/privacy/getOwnershipProofStruct';

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
    // If privacy mode is enabled, we don't need to check the issuer (because the issuer of the token is the ArianeeIssuerProxy contract)
    if (!this.creator.privacyMode) {
      await assertSmartAssetIssuedBy(
        {
          smartAssetId,
          expectedIssuer: this.creator.core.getAddress(),
        },
        this.creator.utils
      );
    }

    await this.creator.transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          const isMissingOnChain = await protocolV1.arianeeLost.isMissing(
            smartAssetId
          );

          if (isMissing === isMissingOnChain) {
            throw new Error(`Missing status is already set as ${isMissing}`);
          }

          if (!this.creator.privacyMode) {
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
          } else {
            // If privacy mode is enabled, we set or unset the missing status through the "ArianeeIssuerProxy" contract

            const fragment = isMissing
              ? 'setMissingStatus'
              : 'unsetMissingStatus';
            // ^ Fragment: setMissingStatus(_ownershipProof, _tokenId) || unsetMissingStatus(_ownershipProof, _tokenId)
            const _values = [smartAssetId];

            const { intentHashAsStr } =
              await this.creator.prover!.issuerProxy.computeIntentHash({
                protocolV1,
                fragment,
                values: _values,
                needsCreditNoteProof: false,
              });

            const { callData } =
              await this.creator.prover!.issuerProxy.generateProof({
                protocolV1,
                tokenId: smartAssetId,
                intentHashAsStr,
              });

            if (isMissing === true) {
              return protocolV1.arianeeIssuerProxy!.setMissingStatus(
                getOwnershipProofStruct(callData),
                smartAssetId
              );
            } else {
              return protocolV1.arianeeIssuerProxy!.unsetMissingStatus(
                getOwnershipProofStruct(callData),
                smartAssetId
              );
            }
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
    // If privacy mode is enabled, we don't need to check the issuer (because the issuer of the token is the ArianeeIssuerProxy contract)
    if (!this.creator.privacyMode) {
      await assertSmartAssetIssuedBy(
        {
          smartAssetId,
          expectedIssuer: this.creator.core.getAddress(),
        },
        this.creator.utils
      );
    }

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

          if (!this.creator.privacyMode) {
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
          } else {
            // If privacy mode is enabled, we set or unset the stolen status through the "ArianeeIssuerProxy" contract

            const fragment = isStolen ? 'setStolenStatus' : 'unsetStolenStatus';
            // ^ Fragment: setStolenStatus(_ownershipProof, _tokenId) || unsetStolenStatus(_ownershipProof, _tokenId)
            const _values = [smartAssetId];

            const { intentHashAsStr } =
              await this.creator.prover!.issuerProxy.computeIntentHash({
                protocolV1,
                fragment,
                values: _values,
                needsCreditNoteProof: false,
              });

            const { callData } =
              await this.creator.prover!.issuerProxy.generateProof({
                protocolV1,
                tokenId: smartAssetId,
                intentHashAsStr,
              });

            if (isStolen === true) {
              return protocolV1.arianeeIssuerProxy!.setStolenStatus(
                getOwnershipProofStruct(callData),
                smartAssetId
              );
            } else {
              return protocolV1.arianeeIssuerProxy!.unsetStolenStatus(
                getOwnershipProofStruct(callData),
                smartAssetId
              );
            }
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
