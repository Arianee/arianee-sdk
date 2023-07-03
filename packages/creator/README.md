# @arianee/creator

The creator library makes it easy for builders to create content on the Arianee protocol through a higher level API. It is essentially a wrapper around the `@arianee/arianee-protocol-client` and the `@arianee/arianee-privacy-gateway-client` libraries.

## Installation

The library requires the `@arianee/core` package, it is used for message and transaction signing / sending.

```bash
npm install @arianee/creator @arianee/core
```

## Usage

Instantiate a new `Creator` instance and pass the required params `core` and `creatorAddress`. \

```typescript
import { Creator } from '@arianee/creator';
import { Core } from '@arianee/core';

const creator = new Creator({
  core: Core.fromRandom(),
  creatorAddress: '0x...',
});
```

You then need to connect to the desired protocol instance using the `connect` method, the parameter must be the protocol's slug (e.g. `testnet`). This will set the `connected` property of the `Creator` instance to `true` if the connection was successful. In case of failure, it will throw an error.

```typescript
(async () => {
  try {
    const connected = await creator.connect('testnet');
    console.log(connected); // true
  } catch {
    console.log('connection failed');
  }

  // you can also use creator.connected
  console.log(creator.connected); // true
})();
```

## Tests

Unit tests can be ran with:

```bash
npm run test:creator
```

## Examples

We built a minimalistic Angular application that leverages some of the `@arianee/creator` features.

It can be ran with

```bash
npm run angular-creator
```

Code is available in the `apps/angular-creator` folder.
