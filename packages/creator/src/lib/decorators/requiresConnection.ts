// A decorator that calls Utils.requiresCreatorToBeConnected() before calling the decorated method.
export function requiresConnection() {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      // Property check instead of instanceof to avoid cyclic dependency
      if (
        'requiresCreatorToBeConnected' in this &&
        typeof this.requiresCreatorToBeConnected === 'function'
      )
        this.requiresCreatorToBeConnected(); // this is instance of Utils
      else if (
        'utils' in this &&
        this.utils &&
        typeof this.utils === 'object' &&
        'requiresCreatorToBeConnected' in this.utils &&
        typeof this.utils.requiresCreatorToBeConnected === 'function'
      )
        this.utils.requiresCreatorToBeConnected(); // this is instance of Creator

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
