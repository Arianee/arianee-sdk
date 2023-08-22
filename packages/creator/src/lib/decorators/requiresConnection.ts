import { NotConnectedError } from '../errors';

type Creator = {
  connected?: boolean;
  slug?: string;
  protocolDetails?: unknown;
};

// A decorator that checks if the creator is connected before calling the decorated method.
export function requiresConnection() {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor & Creator
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      let creator: Creator;

      if ('creator' in this) {
        creator = this.creator as Creator;
      } else {
        creator = this as Creator;
      }

      // Property check instead of instanceof to avoid cyclic dependency
      if (!creator.connected || !creator.slug || !creator.protocolDetails)
        throw new NotConnectedError(
          'Creator is not connected, you must call the connect method once before calling other methods'
        );

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
