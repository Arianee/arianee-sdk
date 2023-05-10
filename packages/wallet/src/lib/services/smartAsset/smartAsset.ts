import { ChainType, Event, Protocol, SmartAsset } from '@arianee/common-types';
import { WalletAbstraction } from '@arianee/wallet-abstraction';
import { I18NStrategy, getPreferredLanguages } from '../../utils/i18n';
import EventManager from '../eventManager/eventManager';

export type SmartAssetInstance = {
  data: SmartAsset;
  arianeeEvents: Event[];
};

export default class SmartAssetService<T extends ChainType> {
  public readonly received: EventManager<T>['smartAssetReceived'];
  public readonly transferred: EventManager<T>['smartAssetTransferred'];
  public readonly updated: EventManager<T>['smartAssetUpdated'];
  public readonly arianeeEventReceived: EventManager<T>['arianeeEventReceived'];

  constructor(
    private walletAbstraction: WalletAbstraction,
    private eventManager: EventManager<T>,
    private i18nStrategy: I18NStrategy
  ) {
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

  async getFromLink(link: string): Promise<SmartAssetInstance> {
    // todo: implement handleLinkService in wallet-api and call it using the wallet-api-client

    throw new Error('Not implemented');
  }
}

export { SmartAssetService as SmartAsset };
