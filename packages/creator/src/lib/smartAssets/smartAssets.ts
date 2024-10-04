import { ArianeePrivacyGatewayClient } from '@arianee/arianee-privacy-gateway-client';
import { NonPayableOverrides } from '@arianee/arianee-protocol-client';
import {
  ArianeeProductCertificateI18N,
  SmartAsset,
  TokenAccessType,
} from '@arianee/common-types';
import {
  DEFAULT_CREDIT_PROOF,
  DEFAULT_OWNERSHIP_PROOF,
} from '@arianee/privacy-circuits';
import { createLink } from '@arianee/utils';
import {
  ContractTransactionReceipt,
  ContractTransactionResponse,
  ethers,
} from 'ethers';

import Creator, { TransactionStrategy } from '../creator';
import { requiresConnection } from '../decorators/requiresConnection';
import {
  ArianeePrivacyGatewayError,
  UnavailableSmartAssetIdError,
} from '../errors';
import { checkCreditsBalance } from '../helpers/checkCredits/checkCredits';
import { getTokenAccessParams } from '../helpers/getTokenAccessParams/getTokenAccessParams';
import { getCreatorIdentity } from '../helpers/identity/getIdentity';
import { getOwnershipProofStruct } from '../helpers/privacy/getOwnershipProofStruct';
import { injectIssuerSig__SmartAsset } from '../helpers/privacy/injectIssuerSig';
import { assertSmartAssetIssuedBy } from '../helpers/smartAsset/assertSmartAssetIssuedBy';
import { checkCreateSmartAssetParameters } from '../helpers/smartAsset/checkCreateSmartAssetParameters';
import { getCreateSmartAssetParams } from '../helpers/smartAsset/getCreateSmartAssetParams';
import { getContentFromURI } from '../helpers/uri/getContentFromURI';
import {
  CreateAndStoreSmartAssetParameters,
  CreateSmartAssetCommonParameters,
  CreateSmartAssetParameters,
  CreditType,
  LinkObject,
  TokenAccess,
} from '../types';

export default class SmartAssets<Strategy extends TransactionStrategy> {
  constructor(private creator: Creator<Strategy>) {}

  @requiresConnection()
  public async reserveSmartAssetId(
    id?: number,
    overrides: NonPayableOverrides = {},
    skipCheck = false
  ) {
    if (id && !skipCheck) {
      const isFree = await this.creator.utils.isSmartAssetIdAvailable(id);
      if (!isFree) {
        throw new UnavailableSmartAssetIdError(`The id ${id} is not available`);
      }
    }

    const _id = id ?? (await this.creator.utils.getAvailableSmartAssetId());

    return this.creator.transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          if (!this.creator.privacyMode) {
            if (!skipCheck) {
              await checkCreditsBalance(
                this.creator.utils,
                CreditType.smartAsset,
                BigInt(1)
              );
            }

            return protocolV1.storeContract.reserveToken(
              _id,
              this.creator.core.getAddress(),
              overrides
            );
          } else {
            // INFO: If privacy mode is enabled, we reserve the token through the "ArianeeIssuerProxy" contract

            const { commitmentHashAsStr } =
              await this.creator.prover!.issuerProxy.computeCommitmentHash({
                protocolV1,
                tokenId: String(_id),
              });

            return protocolV1.arianeeIssuerProxy!.reserveToken(
              commitmentHashAsStr,
              _id,
              overrides
            );
          }
        },
        protocolV2Action: async (protocolV2) =>
          protocolV2.smartAssetBaseContract.reserveToken(
            this.creator.core.getAddress(),
            _id
          ),
      },
      this.creator.connectOptions
    ) as Promise<
      Strategy extends 'WAIT_TRANSACTION_RECEIPT'
        ? ContractTransactionReceipt
        : ContractTransactionResponse
    >;
  }

  @requiresConnection()
  public async destroySmartAsset(
    id: string,
    overrides: NonPayableOverrides = {}
  ) {
    return this.creator.transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          if (!this.creator.privacyMode) {
            return protocolV1.smartAssetContract[
              'safeTransferFrom(address,address,uint256)'
            ](
              this.creator.core.getAddress(),
              '0x000000000000000000000000000000000000dead',
              id,
              overrides
            );
          } else {
            // INFO: If privacy mode is enabled, we destroy the token through the "ArianeeIssuerProxy" contract

            const fragment = 'safeTransferFrom'; // Fragment: safeTransferFrom(_ownershipProof, _from, _to, _tokenId, _data)
            const from = await protocolV1.arianeeIssuerProxy!.getAddress();
            const to = '0x000000000000000000000000000000000000dead';
            const data = '0x';
            const _values = [from, to, id, data];

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
                tokenId: id,
                intentHashAsStr,
              });
            return protocolV1.arianeeIssuerProxy!.safeTransferFrom(
              getOwnershipProofStruct(callData),
              from,
              to,
              id,
              data,
              overrides
            );
          }
        },
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    ) as Promise<
      Strategy extends 'WAIT_TRANSACTION_RECEIPT'
        ? ContractTransactionReceipt
        : ContractTransactionResponse
    >;
  }

  @requiresConnection()
  public async recoverSmartAsset(
    id: string,
    overrides: NonPayableOverrides = {}
  ) {
    // INFO: If privacy mode is enabled, we don't need to check the issuer (because the issuer of the token is the ArianeeIssuerProxy contract)
    if (!this.creator.privacyMode) {
      await assertSmartAssetIssuedBy(
        {
          smartAssetId: id,
          expectedIssuer: this.creator.core.getAddress(),
        },
        this.creator.utils
      );
    }

    return this.creator.transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          if (!this.creator.privacyMode) {
            return protocolV1.smartAssetContract.recoverTokenToIssuer(
              id,
              overrides
            );
          } else {
            // INFO: If privacy mode is enabled, we recover the token through the "ArianeeIssuerProxy" contract

            const fragment = 'recoverTokenToIssuer'; // Fragment: recoverTokenToIssuer(_ownershipProof, _tokenId)
            const _values = [id];

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
                tokenId: id,
                intentHashAsStr,
              });
            return protocolV1.arianeeIssuerProxy!.recoverTokenToIssuer(
              getOwnershipProofStruct(callData),
              id,
              overrides
            );
          }
        },
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    ) as Promise<
      Strategy extends 'WAIT_TRANSACTION_RECEIPT'
        ? ContractTransactionReceipt
        : ContractTransactionResponse
    >;
  }

  @requiresConnection()
  public async createSmartAsset(
    params: CreateSmartAssetParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<LinkObject> {
    const content = await getContentFromURI<ArianeeProductCertificateI18N>(
      params.uri,
      this.creator.fetchLike
    );

    return this.createSmartAssetCommon(
      {
        ...params,
        content,
      },
      null,
      overrides
    );
  }

  @requiresConnection()
  public async createAndStoreSmartAsset(
    params: CreateAndStoreSmartAssetParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<LinkObject> {
    await getCreatorIdentity(this.creator); // assert has identity

    return this.createSmartAssetCommon(
      params,
      async (smartAssetId, content) => {
        await this.storeSmartAsset(smartAssetId, content);
      },
      overrides
    );
  }

  @requiresConnection()
  public async createSmartAssetRaw(
    params: CreateSmartAssetCommonParameters,
    overrides: NonPayableOverrides = {}
  ): Promise<LinkObject> {
    return this.createSmartAssetCommon(params, null, overrides);
  }

  @requiresConnection()
  public async updateSmartAsset(
    smartAssetId: SmartAsset['certificateId'],
    content: SmartAsset['content'],
    overrides: NonPayableOverrides = {},
    afterTransaction?:
      | ((
          smartAssetId: NonNullable<SmartAsset['certificateId']>,
          content: SmartAsset['content']
        ) => Promise<void>)
      | null
  ): Promise<{ imprint: string }> {
    await getCreatorIdentity(this.creator); // assert has identity

    // INFO: If privacy mode is enabled, we don't need to check the issuer (because the issuer of the token is the ArianeeIssuerProxy contract)
    if (!this.creator.privacyMode) {
      await assertSmartAssetIssuedBy(
        {
          smartAssetId,
          expectedIssuer: this.creator.core.getAddress(),
        },
        this.creator.utils
      );
    }

    if (this.creator.privacyMode && !content.issuer_signature) {
      content = await injectIssuerSig__SmartAsset(
        this.creator.core,
        this.creator.connectedProtocolClient!.protocolDetails,
        parseInt(smartAssetId),
        content
      );
    }

    const imprint = await this.creator.utils.calculateImprint(content);

    await this.creator.transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          if (!this.creator.privacyMode) {
            await checkCreditsBalance(
              this.creator.utils,
              CreditType.update,
              BigInt(1)
            );
            return protocolV1.storeContract.updateSmartAsset(
              smartAssetId,
              imprint,
              this.creator.creatorAddress,
              overrides
            );
          } else {
            // INFO: If privacy mode is enabled, we update the token through the "ArianeeIssuerProxy" contract

            const fragment = 'updateSmartAsset'; // Fragment: updateSmartAsset(_ownershipProof, _creditNoteProof, _creditNotePool, _tokenId, _imprint, _interfaceProvider)
            const creditNotePool = ethers.ZeroAddress;
            const _values = [
              creditNotePool,
              smartAssetId,
              imprint,
              this.creator.creatorAddress,
            ];

            const { intentHashAsStr } =
              await this.creator.prover!.issuerProxy.computeIntentHash({
                protocolV1,
                fragment,
                values: _values,
                needsCreditNoteProof: true,
              });

            const { callData } =
              await this.creator.prover!.issuerProxy.generateProof({
                protocolV1,
                tokenId: smartAssetId,
                intentHashAsStr,
              });
            return protocolV1.arianeeIssuerProxy!.updateSmartAsset(
              getOwnershipProofStruct(callData),
              DEFAULT_CREDIT_PROOF,
              creditNotePool,
              smartAssetId,
              imprint,
              this.creator.creatorAddress
            );
          }
        },
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );

    if (afterTransaction) await afterTransaction(smartAssetId, content);

    return {
      imprint,
    };
  }

  @requiresConnection()
  public async updateAndStoreSmartAsset(
    smartAssetId: SmartAsset['certificateId'],
    content: SmartAsset['content'],
    overrides: NonPayableOverrides = {}
  ) {
    const { imprint } = await this.updateSmartAsset(
      smartAssetId,
      content,
      overrides,
      async (smartAssetId, content) => {
        await this.updateSmartAssetContent(parseInt(smartAssetId), content);
      }
    );

    return { imprint };
  }

  @requiresConnection()
  public async setTokenAccess(
    smartAssetId: SmartAsset['certificateId'],
    tokenAccessType: TokenAccessType,
    tokenAccess?: TokenAccess,
    overrides: NonPayableOverrides = {}
  ): Promise<LinkObject> {
    const { publicKey, passphrase } = getTokenAccessParams(tokenAccess);

    await this.creator.transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          if (!this.creator.privacyMode) {
            return protocolV1.smartAssetContract.addTokenAccess(
              smartAssetId,
              publicKey,
              true,
              tokenAccessType,
              overrides
            );
          } else {
            // INFO: If privacy mode is enabled, we add the token access through the "ArianeeIssuerProxy" contract

            const fragment = 'addTokenAccess'; // Fragment: addTokenAccess(_ownershipProof, _tokenId, _key, _enable, _tokenType)
            const _values = [smartAssetId, publicKey, true, tokenAccessType];

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
            return protocolV1.arianeeIssuerProxy!.addTokenAccess(
              getOwnershipProofStruct(callData),
              smartAssetId,
              publicKey,
              true,
              tokenAccessType
            );
          }
        },
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );

    return this.createLinkObject(smartAssetId, passphrase);
  }

  @requiresConnection()
  public async setRequestKey(
    smartAssetId: SmartAsset['certificateId'],
    tokenAccess?: TokenAccess,
    overrides: NonPayableOverrides = {}
  ): Promise<LinkObject> {
    return this.setTokenAccess(
      smartAssetId,
      TokenAccessType.request,
      tokenAccess,
      overrides
    );
  }

  @requiresConnection()
  public async updateTokenURI(
    smartAssetId: SmartAsset['certificateId'],
    uri: string,
    overrides: NonPayableOverrides = {}
  ): Promise<void> {
    // INFO: If privacy mode is enabled, we don't need to check the issuer (because the issuer of the token is the ArianeeIssuerProxy contract)
    if (!this.creator.privacyMode) {
      await assertSmartAssetIssuedBy(
        {
          smartAssetId,
          expectedIssuer: this.creator.core.getAddress(),
        },
        this.creator.utils
      );
    }

    await getContentFromURI(uri, this.creator.fetchLike);

    await this.creator.transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          if (!this.creator.privacyMode) {
            return protocolV1.smartAssetContract.updateTokenURI(
              smartAssetId,
              uri,
              overrides
            );
          } else {
            // INFO: If privacy mode is enabled, we update the token URI through the "ArianeeIssuerProxy" contract

            const fragment = 'updateTokenURI'; // Fragment: updateTokenURI(_ownershipProof, _tokenId, _uri)
            const _values = [smartAssetId, uri];

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
            return protocolV1.arianeeIssuerProxy!.updateTokenURI(
              getOwnershipProofStruct(callData),
              smartAssetId,
              uri
            );
          }
        },
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );
  }

  @requiresConnection()
  private async createSmartAssetCommon(
    params: CreateSmartAssetCommonParameters,
    afterTransaction:
      | ((
          smartAssetId: NonNullable<
            CreateSmartAssetCommonParameters['smartAssetId']
          >,
          content: CreateAndStoreSmartAssetParameters['content']
        ) => Promise<void>)
      | null,
    overrides: NonPayableOverrides = {}
  ): Promise<LinkObject> {
    const {
      smartAssetId,
      initialKeyIsRequestKey,
      passphrase,
      publicKey,
      tokenRecoveryTimestamp,
      uri,
    } = await getCreateSmartAssetParams(this.creator.utils, params);

    // INFO: If privacy mode is enabled, we don't need to check the issuer (because the issuer of the token is the ArianeeIssuerProxy contract)
    // To improve this, we could instead only check if the imprint is empty instead of skipping the entire check (but it's not a big deal)
    if (!this.creator.privacyMode) {
      await checkCreateSmartAssetParameters(this.creator.utils, {
        ...params,
        smartAssetId,
      });
    }

    let content = params.content;
    if (this.creator.privacyMode) {
      content = await injectIssuerSig__SmartAsset(
        this.creator.core,
        this.creator.connectedProtocolClient!.protocolDetails,
        smartAssetId,
        params.content
      );
    }

    const imprint = await this.creator.utils.calculateImprint(content);

    await this.creator.transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          if (!this.creator.privacyMode) {
            await checkCreditsBalance(
              this.creator.utils,
              CreditType.smartAsset,
              BigInt(1)
            );

            return protocolV1.storeContract.hydrateToken(
              smartAssetId,
              imprint,
              uri,
              publicKey,
              tokenRecoveryTimestamp,
              initialKeyIsRequestKey,
              this.creator.creatorAddress,
              overrides
            );
          } else {
            // INFO: If privacy mode is enabled, we hydrate the token through the "ArianeeIssuerProxy" contract

            // We first check if the token is already reserved
            let commitmentHash =
              await protocolV1.arianeeIssuerProxy!.commitmentHashes(
                smartAssetId
              );
            const isAlreadyReserved = commitmentHash !== BigInt(0);
            if (!isAlreadyReserved) {
              // If the token is not yet reserved, we need a new commitment hash to hydrate it
              const { commitmentHashAsStr } =
                await this.creator.prover!.issuerProxy.computeCommitmentHash({
                  protocolV1,
                  tokenId: String(smartAssetId),
                });
              commitmentHash = BigInt(commitmentHashAsStr);
            }

            // We prepare the others parameters for the hydrateToken function
            const creditNotePool = ethers.ZeroAddress;

            const fragment = 'hydrateToken'; // Fragment: hydrateToken(_ownershipProof, _creditNoteProof, _creditNotePool, _commitmentHash,
            // _tokenId, _imprint, _uri, _encryptedInitialKey, _tokenRecoveryTimestamp, _initialKeyIsRequestKey, _interfaceProvider)
            const _values = [
              creditNotePool,
              commitmentHash,
              smartAssetId,
              imprint,
              uri,
              publicKey,
              tokenRecoveryTimestamp,
              initialKeyIsRequestKey,
              this.creator.creatorAddress,
            ];

            const { intentHashAsStr } =
              await this.creator.prover!.issuerProxy.computeIntentHash({
                protocolV1,
                fragment,
                values: _values,
                needsCreditNoteProof: true,
              });

            const { callData } =
              await this.creator.prover!.issuerProxy.generateProof({
                protocolV1,
                tokenId: String(smartAssetId),
                intentHashAsStr,
              });
            const ownershipProofStruct = getOwnershipProofStruct(callData);

            return protocolV1.arianeeIssuerProxy!.hydrateToken(
              ownershipProofStruct,
              DEFAULT_CREDIT_PROOF,
              creditNotePool,
              commitmentHash,
              smartAssetId,
              imprint,
              uri,
              publicKey,
              tokenRecoveryTimestamp,
              initialKeyIsRequestKey,
              this.creator.creatorAddress,
              overrides
            );
          }
        },
        protocolV2Action: async (protocolV2) => {
          return protocolV2.smartAssetBaseContract.hydrateToken(
            {
              tokenId: smartAssetId,
              imprint,
              viewKey: publicKey,
              transferKey: initialKeyIsRequestKey
                ? publicKey
                : ethers.ZeroAddress,
              creatorProvider: this.creator.creatorAddress,
              otherParams: [
                uri ? ethers.hexlify(ethers.toUtf8Bytes(uri)) : ethers.ZeroHash,
                ethers.toBeHex(tokenRecoveryTimestamp, 32),
              ],
            },
            overrides
          );
        },
      },
      this.creator.connectOptions
    );

    if (afterTransaction) await afterTransaction(smartAssetId, content);

    return this.createLinkObject(smartAssetId, passphrase);
  }

  @requiresConnection()
  public async storeSmartAsset(
    smartAssetId: number,
    content: CreateAndStoreSmartAssetParameters['content']
  ) {
    const identity = await getCreatorIdentity(this.creator);

    const client = new ArianeePrivacyGatewayClient(
      this.creator.core,
      this.creator.fetchLike
    );

    try {
      await client.certificateCreate(identity.rpcEndpoint, {
        certificateId: smartAssetId.toString(),
        content,
      });
    } catch (e) {
      throw new ArianeePrivacyGatewayError(
        `Error while storing smart asset on Arianee Privacy Gateway\n${
          e instanceof Error ? e.message : 'unknown reason'
        }`
      );
    }
  }

  @requiresConnection()
  private async updateSmartAssetContent(
    smartAssetId: number,
    content: SmartAsset['content']
  ) {
    const identity = await getCreatorIdentity(this.creator);

    const client = new ArianeePrivacyGatewayClient(
      this.creator.core,
      this.creator.fetchLike
    );

    try {
      await client.updateCreate(identity.rpcEndpoint, {
        certificateId: smartAssetId.toString(),
        content,
      });
    } catch (e) {
      throw new ArianeePrivacyGatewayError(
        `Error while updating smart asset on Arianee Privacy Gateway\n${
          e instanceof Error ? e.message : 'unknown reason'
        }`
      );
    }
  }

  private createLinkObject(
    smartAssetId: number | string,
    passphrase?: string
  ): LinkObject {
    const deeplink = passphrase
      ? createLink({
          slug: this.creator.slug!,
          tokenId: smartAssetId.toString(),
          passphrase,
        })
      : undefined;

    return {
      deeplink,
      smartAssetId: smartAssetId.toString(),
      passphrase,
    };
  }
}
