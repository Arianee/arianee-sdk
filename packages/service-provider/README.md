# @arianee/service-provider

A library for services and applications that need to use **S**mart Asset **S**haring **T**okens (SST), a type of token that can be used to share the content and transfer rights of a smart asset on the Arianee protocol without losing ownership of the underlying smart asset.

## Installation

```bash
npm install @arianee/service-provider
```

With older versions of npm, you may need to install the peer dependencies manually, see the peer depencies in the `package.json` file.

## Usage

In order to instantiate a `ServiceProvider`, you need:

- a `Core` instance of the service provider (that will be used to try transfering the smart asset using the SST through the permit721 contract)

```typescript
import { ServiceProvider } from '@arianee/service-provider';

const serviceProvider = new ServiceProvider(
  Core.fromPrivateKey('0xSERVICE_PROVIDER_PRIVATE_KEY...') // Core instance of the service provider
);
```

Extract an SST from an URL using the `extractSST` utility function:

```typescript
const sst = serviceProvider.extractSST('https://service-provider.com?SST=eySST...');
```

To check if an SST is valid using the `isValidSST` function:

```typescript
const isValid = await serviceProvider.isValidSST({
  sst: 'eySST...', // an SST (Smart Asset Sharing Token)
  performDryRun: false, // OPTIONAL: set to true to perform a transfer dry run in addition to the other checks (default is false)
  shouldThrow: false, // OPTIONAL: set to true to throw an error if the SST is not valid (default is false, prints a console error instead)
});
```

To get a smart asset (and its content) from an SST using the `getSmartAssetFromSST` function (this will also check if the SST is valid using the `isValidSST` function before trying to get the smart asset):

```typescript
const smartAsset = await serviceProvider.getSmartAssetFromSST({
  sst: 'eySST...', // an SST (Smart Asset Sharing Token)
  performDryRun: false, // OPTIONAL: for the internal `isValidSST` call, set to true to perform a transfer dry run in addition to the other checks (default is false)
});
```

To transfer a smart asset with an SST using the `transferSmartAsset` function (this will also check if the SST is valid using the `isValidSST` function before trying to transfer the smart asset):

```typescript
const tx = await serviceProvider.transferSmartAsset({
  sst: 'eySST...', // an SST (Smart Asset Sharing Token)
  to: '0xRECIPIENT_ADDRESS', // the address of the recipient of the smart asset
  performDryRun: false, // OPTIONAL: set to true to perform a transfer dry run before the actual transfer (default is false)
});
```

The SST are typically generated by the `@arianee/token-provider` library.
