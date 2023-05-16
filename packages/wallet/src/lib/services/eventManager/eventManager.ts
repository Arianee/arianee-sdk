import { EventEmitter } from 'eventemitter3';
import { WalletAbstraction } from '@arianee/wallet-abstraction';
import { EventMap } from './types/events';
import WrappedEventEmitter from './helpers/wrappedEventEmitter';
import {
  BlockchainEvent,
  BrandIdentity,
  ChainType,
  SmartAsset,
  blockchainEventsName,
} from '@arianee/common-types';
import { ArianeeApiClient } from '@arianee/arianee-api-client';
import { checksumAddress } from '../../utils/address/address';
import { hashCode } from '../../utils/hash';

type WrappedEventEmitters = {
  readonly [eventName in keyof EventMap]: WrappedEventEmitter<eventName>;
};

export type EventManagerParams = {
  /**
   * Interval between each pull in ms
   * @default 5000
   */
  pullInterval?: number;
  arianeeApiUrl?: string;
};

export default class EventManager<T extends ChainType>
  implements WrappedEventEmitters
{
  private pullInterval: number;
  private pullAfter!: Date;
  private arianeeApiClient: ArianeeApiClient;

  private userTokenIds: SmartAsset['certificateId'][] = [];
  private userTokenIssuers: BrandIdentity['address'][] = [];

  private emittedEventsHashCodes = new Set<number>();

  constructor(
    private chainType: T,
    private walletAbstraction: WalletAbstraction,
    private address: string,
    private fetchLike: typeof fetch,
    params?: EventManagerParams
  ) {
    this.pullInterval = params?.pullInterval ?? 5000;

    this.arianeeApiClient = new ArianeeApiClient(
      params?.arianeeApiUrl ?? 'https://api.arianee.com',
      this.fetchLike
    );

    this.updatePullAfter();

    if (this.pullInterval > 0)
      setInterval(this.pull.bind(this), this.pullInterval);
  }

  private readonly arianee: EventEmitter = new EventEmitter();

  public readonly smartAssetReceived = new WrappedEventEmitter(
    this.arianee,
    'smartAssetReceived'
  );

  public readonly smartAssetTransferred = new WrappedEventEmitter(
    this.arianee,
    'smartAssetTransferred'
  );

  public readonly smartAssetUpdated = new WrappedEventEmitter(
    this.arianee,
    'smartAssetUpdated'
  );

  public readonly arianeeEventReceived = new WrappedEventEmitter(
    this.arianee,
    'arianeeEventReceived'
  );

  public readonly identityUpdated = new WrappedEventEmitter(
    this.arianee,
    'identityUpdated'
  );

  public readonly messageRead = new WrappedEventEmitter(
    this.arianee,
    'messageRead'
  );

  public readonly messageReceived = new WrappedEventEmitter(
    this.arianee,
    'messageReceived'
  );

  private updatePullAfter() {
    this.pullAfter = new Date(new Date().getTime() - 10 * 1000);
  }

  private emit<E extends keyof EventMap>(eventName: E, event: EventMap[E]) {
    this.arianee.emit(eventName, event);
  }

  /**
   * Calls emit if and only if the event was not emitted before
   * @param eventName name of the event to emit
   * @param event content of the event
   */
  private emitUnique<E extends keyof EventMap>(
    eventName: E,
    event: EventMap[E],
    rawEvent: BlockchainEvent
  ) {
    const _hashCode = hashCode(`${eventName}-${JSON.stringify(rawEvent)}`);

    if (!this.emittedEventsHashCodes.has(_hashCode)) {
      this.emit(eventName, event);
      this.emittedEventsHashCodes.add(_hashCode);
    }
  }

  private atLeastOneListener(events: (keyof EventMap)[]) {
    const listenersCount = events.reduce((acc, eventName) => {
      return acc + this.arianee.listenerCount(eventName);
    }, 0);

    return listenersCount > 0;
  }

  private async pull() {
    await this.fetchUserDataIfNeeded();

    const [arianeeEvents, smartAssetEvents, identitiesEvents, messagesEvents] =
      await Promise.all([
        this.pullArianeeEvents(),
        this.pullSmartAssetsEvents(),
        this.pullIdentitiesEvents(),
        this.pullMessagesEvents(),
      ]);

    this.emitArianeeEvents(arianeeEvents);
    this.emitSmartAssetsEvents(smartAssetEvents);
    this.emitIdentitiesEvents(identitiesEvents);
    this.emitMessagesEvents(messagesEvents);

    this.updatePullAfter();
  }

  private async fetchUserDataIfNeeded() {
    if (!this.atLeastOneListener(['identityUpdated', 'arianeeEventReceived']))
      return;

    const ownedNfts = await this.arianeeApiClient.multichain.getOwnedNfts(
      this.chainType,
      checksumAddress(this.address),
      false
    );

    this.userTokenIssuers = ownedNfts.map((nft) =>
      checksumAddress(
        nft.issuer ?? '0x0000000000000000000000000000000000000000'
      )
    );

    this.userTokenIds = ownedNfts.map((nft) => nft.tokenId);
  }

  private async pullSmartAssetsEvents() {
    if (
      !this.atLeastOneListener([
        'smartAssetReceived',
        'smartAssetTransferred',
        'smartAssetUpdated',
      ])
    )
      return {
        transferred: [],
        received: [],
      };

    const getEvents = (
      eventName: blockchainEventsName,
      returnValuesFilters: {
        [key: string]: string | number;
      }
    ) =>
      this.arianeeApiClient.multichain.getEvents(
        this.chainType,
        'ArianeeSmartAsset',
        eventName,
        {
          createdAfter: this.pullAfter.toISOString(),
          returnValues: {
            ...returnValuesFilters,
          },
        }
      );

    const [transferred, received] = await Promise.all([
      getEvents('Transfer', {
        _from: checksumAddress(this.address),
      }),
      getEvents('Transfer', {
        _to: checksumAddress(this.address),
      }),
    ]);

    // smart asset updated event to be added / groomed later

    return {
      transferred,
      received,
    };
  }

  private async pullArianeeEvents() {
    if (!this.atLeastOneListener(['arianeeEventReceived'])) return [];

    const eventsCreated = await this.arianeeApiClient.multichain.getEvents(
      this.chainType,
      'ArianeeEvent',
      'EventCreated',
      {
        createdAfter: this.pullAfter.toISOString(),
        tokenIdsIn: JSON.stringify(this.userTokenIds),
      }
    );

    return eventsCreated;
  }

  private async pullIdentitiesEvents() {
    if (!this.atLeastOneListener(['identityUpdated'])) return [];

    const identitiesEvents = await this.arianeeApiClient.multichain.getEvents(
      this.chainType,
      'ArianeeIdentity',
      'URIUpdated',
      {
        createdAfter: this.pullAfter.toISOString(),
        identitiesIn: JSON.stringify(this.userTokenIssuers),
      }
    );

    return identitiesEvents;
  }

  private async pullMessagesEvents() {
    if (!this.atLeastOneListener(['messageRead', 'messageReceived'])) return [];

    const messagesEvents = await this.arianeeApiClient.multichain.getEvents(
      this.chainType,
      'ArianeeMessage',
      'MessageSent',
      {
        createdAfter: this.pullAfter.toISOString(),
        returnValues: {
          _receiver: checksumAddress(this.address),
        },
      }
    );

    return messagesEvents;
  }

  private async emitArianeeEvents(arianeeEvents: BlockchainEvent[]) {
    arianeeEvents.forEach((event) => {
      this.emitUnique(
        'arianeeEventReceived',
        {
          certificateId: event.returnValues['_tokenId'] as string,
          eventId: event.returnValues['_eventId'] as string,
          protocol: event.protocol,
        },
        event
      );
    });
  }

  private async emitSmartAssetsEvents(smartAssetEvents: {
    transferred: BlockchainEvent[];
    received: BlockchainEvent[];
  }) {
    const { transferred, received } = smartAssetEvents;

    transferred.forEach((event) => {
      const { _to, _tokenId } = event.returnValues;

      this.emitUnique(
        'smartAssetTransferred',
        {
          certificateId: _tokenId as string,
          to: _to as string,
          protocol: event.protocol,
        },
        event
      );
    });

    received.forEach((event) => {
      const { _from, _tokenId } = event.returnValues;

      this.emitUnique(
        'smartAssetReceived',
        {
          certificateId: _tokenId as string,
          from: _from as string,
          protocol: event.protocol,
        },
        event
      );
    });
  }

  private async emitIdentitiesEvents(identitiesEvents: BlockchainEvent[]) {
    identitiesEvents.forEach((event) => {
      this.emitUnique(
        'identityUpdated',
        {
          issuer: event.returnValues['_identity'] as string,
          protocol: event.protocol,
        },
        event
      );
    });
  }

  private async emitMessagesEvents(messagesEvents: BlockchainEvent[]) {
    messagesEvents.forEach((event) => {
      this.emitUnique(
        'messageReceived',
        {
          messageId: event.returnValues['_messageId'] as string,
          protocol: event.protocol,
        },
        event
      );
    });
  }
}
