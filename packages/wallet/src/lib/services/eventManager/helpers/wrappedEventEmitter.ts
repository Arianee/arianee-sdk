import { EventEmitter } from 'eventemitter3';
import { EventMap } from '../types/events';

export default class WrappedEventEmitter<E extends keyof EventMap> {
  constructor(private eventEmitter: EventEmitter, private eventName: E) {}

  addListener(fn: (event: EventMap[E]) => void) {
    this.eventEmitter.addListener(this.eventName, fn);
  }

  removeListener(fn: (event: EventMap[E]) => void) {
    this.eventEmitter.removeListener(this.eventName, fn);
  }

  removeAllListeners() {
    this.eventEmitter.removeAllListeners(this.eventName);
  }
}

export { WrappedEventEmitter };
