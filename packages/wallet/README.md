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
- `walletAbstraction`: a `WalletApiClient` instance from `@arianee/wallet-api-client`

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

### Methods

The wallet exposes several methods to interact with the Arianee protocol. \
It allows for retrieval of content of smart assets, messages, identities.

```typescript
const wallet = new Wallet();

// smart asset methods
wallet.smartAsset.get(...);
wallet.smartAsset.getOwned(...);
wallet.smartAsset.getFromLink(...); // to be implemented in subsequent versions

// events
wallet.smartAsset.received
wallet.smartAsset.transferred
wallet.smartAsset.updated
wallet.smartAsset.arianeeEventReceived

// message methods
wallet.message.get(...);
wallet.message.getReceived(...);

// events
wallet.message.received
wallet.message.read

// identity methods
wallet.identity.get(...);
wallet.identity.getOwnedSmartAssetsIdentities(...);

// events
wallet.identity.updated

// utils
wallet.getAddress()
```

### Events

The wallet emits events that can be listened to. It uses a pull mechanism under the hood, the pull interval can be passed to the constructor under the `eventManagerParams.pullInterval` key. Events will be pulled every `pullInterval` milliseconds if and only if there is at least one listener.

Default pull interval is 5 seconds.

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
```

## Tests

Unit tests can be ran with:

```bash
npm run test:wallet
```

## Examples

We created a simple multichain React Wallet using the library, you can run it with:

```bash
npm run react-wallet
```

The source is located in `apps/arianee-react-wallet/`

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
    },
    "include": ["src/**/*.ts", "tls.d.ts", "net.d.ts"]
  }
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
  nextTick: require('next-tick'),
} as any;
```
