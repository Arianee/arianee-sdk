# @arianee/token-provider

A library for services and applications that need to generate **S**mart Asset **S**haring **T**okens (SST), a type of token that can be used to share the content and transfer rights of a smart asset on the Arianee protocol without losing ownership of the underlying smart asset.

## Installation

```bash
npm install @arianee/token-provider
```

With older versions of npm, you may need to install the peer dependencies manually, see the peer depencies in the `package.json` file.

## Usage

To generate a SST for the smart asset of id `123` owned by `User A` and to be consumed by `User B`, you need:

- a `Core` instance of the smart asset owner (`User A`) (to sign the permit721 transaction needed to generate the SST)
- the public key of the spender (`User B`) (the address that will be allowed to transfer the smart asset using the generated SST)
- the address of the permit721 contract (permit721 addresses deployed by arianee are well known and can be found in the [contract addresses JSONs](https://github.com/Arianee/conventions/tree/main/public/contractAddresses))

```typescript
import { generateSST } from '@arianee/token-provider';
import { SmartAsset } from '@arianee/common-types';
import { Wallet } from '@arianee/wallet';

const core = Core.fromPrivateKey('0xSMART_ASSET_OWNER_PRIVATE_KEY...'); // Core instance of the smart asset owner (User A)

const wallet = new Wallet({
  auth: {
    core,
  },
});

const smartAsset = await wallet.smartAsset.get('testnet', {
  id: '123',
}); // retrieve the smart asset with id 123 owned by User A (since the Wallet instance was initialized with the Core instance of User A, the smart asset can be retrieved without the view key)

const sst = await generateSST({
  core: core,
  smartAsset: smartAsset.data, // smart asset to generate a SST for
  spender: '0xSPENDER_ADDRESS', // the address that will be able to transfer the smart asset using the SST
  permit721Address: '0xPERMIT_ADDRESS', // the address of the permit721 contract
});
```

Once generated, the SST can be consumed using the `@arianee/service-provider` library.
