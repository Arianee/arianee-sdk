import { ChainType, Event, Protocol, SmartAsset } from '@arianee/common-types';
import { WalletAbstraction } from '@arianee/wallet-abstraction';
import { I18NStrategy, getPreferredLanguages } from '../../utils/i18n';
import EventManager from '../eventManager/eventManager';
import WalletApiClient from '@arianee/wallet-api-client';
import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import ArianeeProtocolClient from '@arianee/arianee-protocol-client';
import {
  WalletRewards,
  getWalletReward,
} from '../../utils/walletReward/walletReward';
import { ContractTransactionReceipt, ethers } from 'ethers';
import Core from '@arianee/core';

export type SmartAssetInstance = {
  data: SmartAsset;
  arianeeEvents: Event[];
};

export type ClaimableSmartAssetInstance = SmartAssetInstance & {
  claim: (receiver?: string) => Promise<ContractTransactionReceipt>;
};

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
  ): Promise<SmartAssetInstance> {
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

    return {
      data: _smartAsset,
      arianeeEvents,
    };
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
  }): Promise<SmartAssetInstance[]> {
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

        return {
          data: smartAsset,
          arianeeEvents,
        };
      })
    );

    return smartAssetsInstances;
  }

  async getFromLink(
    link: string,
    resolveFinalNft = false,
    i18nStrategy?: I18NStrategy
  ): Promise<ClaimableSmartAssetInstance> {
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

      const smartAssetInstance = await this.get(
        network,
        {
          id: certificateId,
          passphrase,
        },
        { i18nStrategy: i18nStrategy ?? this.i18nStrategy }
      );

      return {
        ...smartAssetInstance,
        claim: (receiver?: string) =>
          this.claim(network, certificateId, passphrase!, receiver),
      };
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
    receiver?: string
  ): Promise<ContractTransactionReceipt> {
    const protocol = await this.arianeeProtocolClient.connect(protocolName);

    if ('v1' in protocol) {
      const requestWallet = Core.fromPassPhrase(passphrase);
      const _receiver = receiver ?? this.core.getAddress();

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

      const tx = await protocol.v1.storeContract[
        'requestToken(uint256,bytes32,bool,address,bytes,address)'
      ](
        parseInt(tokenId),
        messageHash,
        false,
        walletReward,
        signature,
        _receiver
      );

      const receipt = await tx.wait();

      if (!receipt)
        throw new Error('Could not retrieve the receipt of the transaction');

      return receipt;
    } else {
      throw new Error('The claim is not yet supported for this protocol');
    }
  }
}

export { SmartAssetService as SmartAsset };
