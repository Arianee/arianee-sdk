import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import ArianeeProtocolClient, {
  checkV2NftInterface,
} from '@arianee/arianee-protocol-client';
import {
  NonPayableOverrides,
  transactionWrapper,
} from '@arianee/arianee-protocol-client';
import {
  ChainType,
  Event,
  Protocol,
  SmartAsset,
  TokenAccessType,
} from '@arianee/common-types';
import Core from '@arianee/core';
import { createLink, generateRandomPassphrase } from '@arianee/utils';
import { WalletAbstraction } from '@arianee/wallet-abstraction';
import WalletApiClient from '@arianee/wallet-api-client';
import { ContractTransactionReceipt, ethers } from 'ethers';

import { getPreferredLanguages, I18NStrategy } from '../../utils/i18n';
import {
  getWalletReward,
  WalletRewards,
} from '../../utils/walletReward/walletReward';
import EventManager from '../eventManager/eventManager';
import SmartAssetInstance from './instances/smartAssetInstance';

export default class SmartAssetService<T extends ChainType> {
  public readonly received: EventManager<T>['smartAssetReceived'];
  public readonly transferred: EventManager<T>['smartAssetTransferred'];
  /**
   * warning: not implemented yet
   */
  public readonly updated: EventManager<T>['smartAssetUpdated'];
  public readonly arianeeEventReceived: EventManager<T>['arianeeEventReceived'];

  private walletAbstraction: WalletAbstraction;
  private eventManager: EventManager<T>;
  private i18nStrategy: I18NStrategy;
  private arianeeAccessToken: ArianeeAccessToken;
  private arianeeProtocolClient: ArianeeProtocolClient;
  private walletRewards: WalletRewards;
  private core: Core;

  constructor({
    walletAbstraction,
    eventManager,
    i18nStrategy,
    arianeeAccessToken,
    arianeeProtocolClient,
    walletRewards,
    core,
  }: {
    walletAbstraction: WalletAbstraction;
    eventManager: EventManager<T>;
    i18nStrategy: I18NStrategy;
    arianeeAccessToken: ArianeeAccessToken;
    arianeeProtocolClient: ArianeeProtocolClient;
    walletRewards: WalletRewards;
    core: Core;
  }) {
    this.walletAbstraction = walletAbstraction;
    this.eventManager = eventManager;
    this.i18nStrategy = i18nStrategy;
    this.arianeeAccessToken = arianeeAccessToken;
    this.arianeeProtocolClient = arianeeProtocolClient;
    this.walletRewards = walletRewards;
    this.core = core;

    this.received = this.eventManager.smartAssetReceived;
    this.transferred = this.eventManager.smartAssetTransferred;
    this.updated = this.eventManager.smartAssetUpdated;
    this.arianeeEventReceived = this.eventManager.arianeeEventReceived;
  }

  /**
   * Returns a smart asset with its events for
   * a given protocol name and smart asset id
   * @param protocolName name of the protocol on which the smart asset is
   * @param smartAsset id and optionally passphrase of the smart asset
   * @param params additional parameters
   * @returns a smart asset with its events
   */
  async get(
    protocolName: Protocol['name'],
    smartAsset: {
      id: SmartAsset['certificateId'];
      passphrase?: string;
    },
    params?: { i18nStrategy?: I18NStrategy }
  ): Promise<SmartAssetInstance<T>> {
    const preferredLanguages = getPreferredLanguages(
      params?.i18nStrategy ?? this.i18nStrategy
    );

    const [_smartAsset, arianeeEvents] = await Promise.all([
      this.walletAbstraction.getSmartAsset(protocolName, smartAsset, {
        preferredLanguages,
      }),

      this.walletAbstraction.getSmartAssetEvents(protocolName, smartAsset, {
        preferredLanguages,
      }),
    ]);

    return new SmartAssetInstance(
      this,
      {
        data: _smartAsset,
        arianeeEvents,
        userAddress: this.core.getAddress(),
      },
      {
        passphrase: smartAsset.passphrase,
      }
    );
  }

  /**
   * Returns all the smart assets and their events
   * owned by the user
   * @param params additional parameters
   * @param params.onlyFromBrands only return smart assets issued by these brands (leave empty to return all)
   * @returns all the smart assets and their events
   */
  async getOwned(params?: {
    onlyFromBrands?: string[];
    i18nStrategy?: I18NStrategy;
  }): Promise<SmartAssetInstance<T>[]> {
    const { onlyFromBrands, i18nStrategy } = params ?? {};

    const preferredLanguages = getPreferredLanguages(
      i18nStrategy ?? this.i18nStrategy
    );

    const smartAssets = await this.walletAbstraction.getOwnedSmartAssets({
      onlyFromBrands,
      preferredLanguages,
    });

    const smartAssetsInstances = await Promise.all(
      smartAssets.map(async (smartAsset) => {
        const arianeeEvents = await this.walletAbstraction.getSmartAssetEvents(
          smartAsset.protocol.name,
          {
            id: smartAsset.certificateId,
          },
          {
            preferredLanguages,
          }
        );

        return new SmartAssetInstance(this, {
          data: smartAsset,
          arianeeEvents,
          userAddress: this.core.getAddress(),
        });
      })
    );

    return smartAssetsInstances;
  }

  async getFromLink(
    link: string,
    resolveFinalNft = false,
    i18nStrategy?: I18NStrategy
  ): Promise<SmartAssetInstance<T>> {
    if (!(this.walletAbstraction instanceof WalletApiClient))
      throw new Error(
        'The wallet abstraction you use do not support this method (try using @arianee/wallet-api-client)'
      );

    try {
      const { network, certificateId, passphrase } = await (
        this.walletAbstraction as WalletApiClient<T>
      ).handleLink(
        link,
        resolveFinalNft
          ? {
              resolveFinalNft: true,
              arianeeAccessToken:
                await this.arianeeAccessToken.getValidWalletAccessToken(),
            }
          : {}
      );

      return await this.get(
        network,
        {
          id: certificateId,
          passphrase,
        },
        { i18nStrategy: i18nStrategy ?? this.i18nStrategy }
      );
    } catch (e) {
      throw new Error(
        'Could not retrieve a smart asset from this link: ' + link
      );
    }
  }

  public async claim(
    protocolName: Protocol['name'],
    tokenId: SmartAsset['certificateId'],
    passphrase: string,
    params?: { receiver?: string; overrides?: NonPayableOverrides }
  ): Promise<ContractTransactionReceipt> {
    const requestWallet = Core.fromPassPhrase(passphrase);
    const _receiver = params?.receiver ?? this.core.getAddress();

    const message = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['uint', 'address'],
        [tokenId, _receiver]
      )
    );

    const messageBytes = ethers.getBytes(message);
    const messageHash = ethers.hashMessage(messageBytes);

    const { signature } = await requestWallet.signMessage(
      new Uint8Array(messageBytes) as unknown as string
    );

    const walletReward = getWalletReward(protocolName, this.walletRewards);

    return transactionWrapper(this.arianeeProtocolClient, protocolName, {
      protocolV1Action: async (v1) => {
        return v1.storeContract[
          'requestToken(uint256,bytes32,bool,address,bytes,address)'
        ](
          parseInt(tokenId),
          messageHash,
          false,
          walletReward,
          signature,
          _receiver,
          params?.overrides ?? {}
        );
      },
      protocolV2Action: async (protocolV2) => {
        // Get the issuer of the NFT
        const {
          data: { issuer },
        } = await this.get(protocolName, {
          id: tokenId,
          passphrase,
        });
        // Check if the issuer has enough credit for the claim
        const credit = await protocolV2.creditManagerContract.balanceOf(
          issuer,
          protocolV2.protocolDetails.contractAdresses.nft
        );
        if (credit === BigInt(0)) {
          throw new Error('Issuer has not enough credit to claim this token');
        }
        return protocolV2.smartAssetBaseContract.requestToken(
          parseInt(tokenId),
          signature,
          _receiver,
          false,
          walletReward
        );
      },
    });
  }

  public async acceptEvent(
    protocolName: Protocol['name'],
    eventId: Event['id'],
    overrides: NonPayableOverrides = {}
  ): Promise<ContractTransactionReceipt> {
    return transactionWrapper(this.arianeeProtocolClient, protocolName, {
      protocolV1Action: async (v1) => {
        return v1.storeContract.acceptEvent(
          eventId,
          getWalletReward(protocolName, this.walletRewards),
          overrides
        );
      },
      protocolV2Action: async (protocolV2) => {
        return protocolV2.eventHubContract.acceptEvent(
          protocolV2.protocolDetails.contractAdresses.nft,
          eventId,
          getWalletReward(protocolName, this.walletRewards)
        );
      },
    });
  }

  public async refuseEvent(
    protocolName: Protocol['name'],
    eventId: Event['id'],
    overrides: NonPayableOverrides = {}
  ): Promise<ContractTransactionReceipt> {
    return transactionWrapper(this.arianeeProtocolClient, protocolName, {
      protocolV1Action: async (v1) => {
        return v1.storeContract.refuseEvent(
          eventId,
          getWalletReward(protocolName, this.walletRewards),
          overrides
        );
      },
      protocolV2Action: async (protocolV2) => {
        return protocolV2.eventHubContract.refuseEvent(
          protocolV2.protocolDetails.contractAdresses.nft,
          eventId
        );
      },
    });
  }

  public async createLink(
    linkType: 'proof' | 'requestOwnership',
    protocolName: Protocol['name'],
    tokenId: SmartAsset['certificateId'],
    params?: {
      passphrase?: string;
      overrides?: NonPayableOverrides;
    }
  ): Promise<string> {
    const _passphrase = params?.passphrase ?? generateRandomPassphrase();
    const passphraseWallet = Core.fromPassPhrase(_passphrase);

    const accessType =
      linkType === 'requestOwnership'
        ? TokenAccessType.request
        : TokenAccessType.proof;
    const suffix = linkType === 'requestOwnership' ? '' : '/proof';

    await transactionWrapper(this.arianeeProtocolClient, protocolName, {
      protocolV1Action: async (v1) => {
        return v1.smartAssetContract.addTokenAccess(
          tokenId,
          passphraseWallet.getAddress(),
          true,
          accessType,
          params?.overrides ?? {}
        );
      },
      protocolV2Action: async (protocolV2) => {
        // check if feature is enabled
        if (accessType === TokenAccessType.request) {
          checkV2NftInterface({
            nftInterface: 'SmartAssetSoulbound',
            protocolClientV2: protocolV2,
            need: 'NotImplemented',
          });

          return protocolV2.smartAssetBaseContract.setTokenTransferKey(
            tokenId,
            passphraseWallet.getAddress()
          );
        } else {
          return protocolV2.smartAssetBaseContract.setTokenViewKey(
            tokenId,
            passphraseWallet.getAddress()
          );
        }
      },
    });

    return createLink({
      slug: protocolName,
      tokenId,
      passphrase: _passphrase,
      suffix,
    });
  }

  public async transfer(
    protocolName: Protocol['name'],
    tokenId: SmartAsset['certificateId'],
    to: string,
    overrides: NonPayableOverrides = {}
  ): Promise<ContractTransactionReceipt> {
    return transactionWrapper(this.arianeeProtocolClient, protocolName, {
      protocolV1Action: async (v1) => {
        return v1.smartAssetContract.transferFrom(
          this.core.getAddress(),
          to,
          tokenId,
          overrides
        );
      },
      protocolV2Action: async (protocolV2) => {
        checkV2NftInterface({
          nftInterface: 'SmartAssetSoulbound',
          protocolClientV2: protocolV2,
          need: 'NotImplemented',
        });

        return protocolV2.smartAssetBaseContract.transferFrom(
          this.core.getAddress(),
          to,
          tokenId,
          overrides
        );
      },
    });
  }
}

export { SmartAssetService as SmartAsset };
