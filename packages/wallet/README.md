# @arianee/wallet

The wallet library is a high level library that allows for easy interaction with the Arianee protocol in a multichain wallet context.

## Installation

```bash
npm install @arianee/wallet
```

## Usage

The libray can be initialized without any parameter. \
Default values are:

- `chainType`: `"testnet"`
- `auth`: a randomly generated wallet using `@arianee/core`
- `i18nStrategy`: `"raw"`
- `fetchLike`: `window.fetch` in browser environment, `node-fetch` in node environment
- `eventManagerParams`: undefined
- `arianeeAccessToken`: a `ArianeeAccessToken` instance from `@arianee/arianee-access-token` using the core instance derived from passed auth
- `arianeeAccessTokenPrefix`: an optional `string` that can be added before the arianee access token payload to sign. This is useful to let the user know what they are signing and why.
- `storage`: a `MemoryStorage` from `@arianee/utils`
- `transactionStrategy`: either to wait for transaction receipt or not. **The recommended value for most users is `'WAIT_TRANSACTION_RECEIPT'` (its default value)**. If `'WAIT_TRANSACTION_RECEIPT'` is passed, the `Wallet` will wait for the transaction receipt, ensuring that the transaction has been successful, and methods will return a `ContractTransactionReceipt`. If `'DO_NOT_WAIT_TRANSACTION_RECEIPT'` is passed, the `Wallet` will not wait for the receipt and methods will return a `ContractTransactionResponse`. This means the transaction might fail without notification. The latter is suitable for programs that utilize transaction queues and cannot wait for transaction confirmations. If the `@arianee/core` instance you are using has a custom `sendTransaction` method for queuing transactions (one that resolves to `{ skipResponse: true }`), you need to use `'DO_NOT_WAIT_TRANSACTION_RECEIPT'`.

First, you need to import the `Wallet` class:

```typescript
import { Wallet } from '@arianee/wallet';
```

### Testnet

```typescript
const wallet = new Wallet();
```

### Mainnet

```typescript
const wallet = new Wallet({
  chainType: 'mainnet',
});
```

### Authentication

The wallet supports 3 ways of authentication:

- an `@arianee/core` instance
- mnemonic
- private key

Authentication is passed to the constructor under the `auth` key.

```typescript
// with core instance
const wallet = new Wallet({
  auth: {
    core: Core.fromRandom(),
  },
});

// with mnemonic
const wallet = new Wallet({
  auth: {
    mnemonic: 'your mnemonic ...',
  },
});

// with private key
const wallet = new Wallet({
  auth: {
    privateKey: '123456',
  },
});
```

### Storage

You can pass a `storage` object (that implements the [`Web Storage API`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)) to the wallet constructor under the `storage` key. \
This is particularly useful for frontend applications, as it allows for the wallet to persist data such as the arianee access token between page reloads through the use of the `sessionStorage` or `localStorage` object of the browser.

Example, persisting arianee access token over page refresh:

```typescript
const wallet = new Wallet({
  storage: sessionStorage,
});
```

### I18N

You can pass an array of user preferred languages to the wallet constructor under the `i18nStrategy` key. \
When this key is passed, all i18n content will be returned in one of the preferred languages if possible. The languages should be sorted in order of preference, with the lowest index corresponding to the highest preference. If no content is available in any of the preferred languages, the content will be returned in the default language.

```typescript
const wallet = new Wallet({
  i18nStrategy: {
    useLanguages: ['en-US', 'fr-FR'],
  },
});
```

### Arianee Access Token

Sometimes you may want to use a custom `WalletApiClient` instance or your own arianee access token instance. In such case, make sure to use the same instance of `ArianeeAccessToken` both for the `WalletApiClient` instance and the `Wallet` instance. This way, the lib will request you to sign an arianee access token only once (it would request it twice if you don't share the instances).

Example:

```ts
const core = Core.fromRandom();
const arianeeAccessToken = new ArianeeAccessToken(core);
const prefix = 'Sign this Arianee access token to authenticate\n\n';

const testnetWalletApiClient = new WalletApiClient('testnet', core, {
  apiURL: 'http://127.0.0.1:3000/',
  arianeeAccessToken,
  arianeeAccessTokenPrefix: prefix,
});

const testnetWallet = new Wallet({
  auth: { core },
  walletAbstraction: testnetWalletApiClient,
  arianeeAccessToken,
  arianeeAccessTokenPrefix: prefix,
});
```

### Methods

The wallet exposes several methods to interact with the Arianee protocol. \
It allows for retrieval of content of smart assets, messages, identities.

```typescript
const wallet = new Wallet();

// smart asset methods
wallet.smartAsset.get(...);
wallet.smartAsset.getOwned(...);
wallet.smartAsset.getFromLink(...);
wallet.smartAsset.claim(...);
wallet.smartAsset.acceptEvent(...);
wallet.smartAsset.refuseEvent(...);
wallet.smartAsset.createLink(...);
wallet.smartAsset.isProofValidFromLink(...);

// events
wallet.smartAsset.received // emits when user received a smart asset from someone
wallet.smartAsset.transferred // emits when user transferred a smart asset to someone
wallet.smartAsset.updated
wallet.smartAsset.arianeeEventReceived

// message methods
wallet.message.get(...);
wallet.message.getReceived(...);
wallet.message.readMessage(...);

// events
wallet.message.received
wallet.message.read

// identity methods
wallet.identity.get(...);
wallet.identity.getOwnedSmartAssetsIdentities(...);

// events
wallet.identity.updated

// utils
wallet.getAddress();
wallet.authenticate(); // force generate a wallet scoped arianee access token, useful when you want to control when a signature request is made to the user with metamask / walletconnect etc.
```

### Events

The wallet emits events that can be listened to. It uses a pull mechanism under the hood, the pull interval can be passed to the constructor under the `eventManagerParams.pullInterval` key. Events will be pulled every `pullInterval` milliseconds if and only if there is at least one listener.

Default pull interval is -1 (disabled), to enable it, pass any value above 0 (e.g. 5000 for 5 seconds).
If you use this feature, make sure to call `wallet.close()` when you are done with the wallet to stop the event manager and associated interval / listeners.

```typescript
// pull events every 2 seconds
const wallet = new Wallet({
  eventManagerParams: {
    pullInterval: 2000,
  },
});

// listen to smart asset received event
wallet.smartAsset.received.addListener((event) => {
  const { certificateId, protocol } = event;
  console.log(`Smart asset (id ${certificateId}) received on ${protocol.name} (chain ${protocol.chainId})`);
});

// remove listener
wallet.smartAsset.received.removeListener(listener);

// remove all listeners
wallet.smartAsset.received.removeAllListeners();

// once you are done with the wallet, make sure to close it to stop the event manager (if you enabled it / set pull interval > 0)
wallet.close();
```

### Proofs

Smart asset proofs can be verified using the `isProofValidFromLink` method either by importing it or from the `smartAsset` property of the `Wallet` class.

If the proof is valid, the method resolves to true, otherwise it throws an error explaining why the proof is invalid.
Possible errors are: `ProofCreatorIsNotOwnerError`, `ProofExpiredError`, `ProofKeyNotValidError`, `NotAProofLinkError`, `ProofKeyNotFoundError`.

The method accepts one required parameter (the proof link) and two optional parameters (arianeeApiUrl and proofValidityWindow).

- proofLink: the proof link to verify
- arianeeApiUrl (optional): the url of arianee api to use to fetch NFT data etc.
- proofValidityWindow (optional): the validity window of the proof in seconds. Default is 3 days (86400 \* 3). This means that any proof generated between now and 3 days ago is considered valid (if all the other criterias are valid).

```typescript
import Wallet, { isProofValidFromLink } from '@arianee/wallet';

try {
  const wallet = new Wallet();

  const isValid = await wallet.smartAsset.isProofValidFromLink('https://test.arian.ee/proof/9995851,d8cbfwnz12lh');

  console.log('isValid', isValid);
} catch (e) {
  console.log('Proof not valid', e?.message);
}

// or

try {
  const isValid = await isProofValidFromLink('https://test.arian.ee/proof/9995851,d8cbfwnz12lh');
  console.log('isValid', isValid);
} catch (e) {
  console.log('Proof not valid', e?.message);
}
```

## Tests

Unit tests can be ran with:

```bash
npm run test:wallet
```

## Examples

We created examples of a simple multichain wallet using various web frameworks. \

### React

A multichain wallet built with React, you can run it with:

```bash
npm run react-wallet
```

The source is located in `apps/arianee-react-wallet/`

### Angular

A multichain wallet built with Angular, you can run it with:

```bash
npm run angular-wallet
```

The source is located in `apps/angular-wallet/`

## Polyfills

When using the lib in browser environment, you may need to install polyfills because the library uses `ethers` under the hood.

### React

You need to use react-app-rewired to override the webpack config. \
Install these packages:

```bash
npm install --save-dev react-app-rewired crypto-browserify stream-browserify browserify-zlib assert stream-http https-browserify os-browserify url buffer process
```

Create a `config-overrides.js` file in the root of your project folder

```javascript
const webpack = require('webpack');

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
    zlib: require.resolve('browserify-zlib'),
    tls: false,
    net: false,
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);
  config.ignoreWarnings = [/Failed to parse source map/];
  config.module.rules.push({
    test: /\.(js|mjs|jsx)$/,
    enforce: 'pre',
    loader: require.resolve('source-map-loader'),
    resolve: {
      fullySpecified: false,
    },
  });
  return config;
};
```

Update your `package.json` with:

```json
"scripts": {
    "start": "react-app-rewired start",
    "build": "react-app-rewired build",
    "test": "react-app-rewired test",
    "eject": "react-scripts eject"
},
```

### Angular

Install these packages:

```bash
npm install --save-dev crypto-browserify stream-browserify browserify-zlib assert stream-http https-browserify os-browserify process buffer url
```

Create empty `tls.d.ts` and `net.d.ts` at the root of your project (or wherever you want but make sure to include the correct path) and update your `tsconfig.json` with

```json
{
  "compilerOptions": {
    "paths": {
      "crypto": ["./node_modules/crypto-browserify"],
      "stream": ["./node_modules/stream-browserify"],
      "assert": ["./node_modules/assert"],
      "http": ["./node_modules/stream-http"],
      "https": ["./node_modules/https-browserify"],
      "os": ["./node_modules/os-browserify"],
      "process": ["./node_modules/process"],
      "zlib": ["./node_modules/browserify-zlib"]
    }
  },
  "include": ["src/**/*.ts", "tls.d.ts", "net.d.ts"]
}
```

Add to `polyfills.ts`

```typescript
import { Buffer } from 'buffer';

(window as any).global = window;
global.Buffer = Buffer;
global.process = {
  env: { DEBUG: undefined },
  version: '',
} as any;
```
