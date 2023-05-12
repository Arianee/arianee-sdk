import { EventEmitter } from 'eventemitter3';
import { WalletAbstraction } from '@arianee/wallet-abstraction';
import { EventMap } from './types/events';
import WrappedEventEmitter from './helpers/wrappedEventEmitter';
import { ChainType } from '@arianee/common-types';

type WrappedEventEmitters = {
  readonly [eventName in keyof EventMap]: WrappedEventEmitter<eventName>;
};

export type EventManagerParams = {
  /**
   * Interval between each pull in ms
   * @default 5000
   */
  pullInterval?: number;
};

export default class EventManager<T extends ChainType>
  implements WrappedEventEmitters
{
  private pullInterval: number;
  private pullAfter: Date = new Date();

  constructor(
    private chainType: T,
    private walletAbstraction: WalletAbstraction,
    params?: EventManagerParams
  ) {
    this.pullInterval = params?.pullInterval ?? 5000;

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

  private updatePullAfter() {
    this.pullAfter = new Date();
  }

  private emit<E extends keyof EventMap>(eventName: E, event: EventMap[E]) {
    this.arianee.emit(eventName, event);
  }

  private atLeastOneListener() {
    const listenersCount = this.arianee
      .eventNames()
      .reduce((acc, eventName) => {
        return acc + this.arianee.listenerCount(eventName);
      }, 0);

    return listenersCount > 0;
  }

  private async pull() {
    if (!this.atLeastOneListener()) return;

    const [arianeeEvents, smartAssetEvents, identitiesEvents] =
      await Promise.all([
        this.pullArianeeEvents(),
        this.pullSmartAssetsEvents(),
        this.pullIdentitiesEvents(),
      ]);

    this.emitArianeeEvents(arianeeEvents);
    this.emitSmartAssetsEvents(smartAssetEvents);
    this.emitIdentitiesEvents(identitiesEvents);

    this.updatePullAfter();
  }

  private async pullArianeeEvents() {
    // get events created after this.date using arianee-api-client
    return;
  }

  private async pullSmartAssetsEvents() {
    // get smart assets events created after this.date using arianee-api-client
    return;
  }

  private async pullIdentitiesEvents() {
    // get identities events created after this.date using arianee-api-client
    return;
  }

  private async emitArianeeEvents(arianeeEvents: any) {
    return;
  }

  private async emitSmartAssetsEvents(smartAssetEvents: any) {
    return;
  }

  private async emitIdentitiesEvents(identitiesEvents: any) {
    return;
  }
}
