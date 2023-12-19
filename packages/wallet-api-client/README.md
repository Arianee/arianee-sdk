# @arianee/wallet-api-client

WalletApiClient is a TypeScript client for the Arianee's Wallet API. It provides an easy-to-use interface to interact with all available API routes and handles the authorization process using the Core instance passed to the constructor or a smart asset's passphrase when provided. The client returns typed objects that match the return types of the API routes.

## Installation

This class is part of the `@arianee/wallet-api-client` package. You can install it using npm:

```bash
npm install @arianee/wallet-api-client
```

## Tests

Unit tests can be ran using the command:

```bash
npm run test:wallet-api-client
```

## Usage

First, you need to import the class:

```typescript
import WalletApiClient from '@arianee/wallet-api-client';
```

Then, create an instance of the `WalletApiClient` class:

```typescript
const walletApiClient = new WalletApiClient(chainType, core, options?, fetchLike?);

const smartAsset = await walletApiClient.getSmartAsset('mainnet', {
  id,
  passphrase,
});
```

### Constructor Parameters

- `chainType`: A string representing the chain type ('mainnet' or 'testnet').
- `core`: An instance of the `@arianee/core` class.
- `options`: Optional configuration object containing:
  - `apiURL`: The base URL of the API (default is `WALLET_API_URL` (from `./constants`)).
  - `httpClient`: A custom HTTP client instance.
  - `arianeeAccessToken`: An `@arianee/arianee-access-token` instance, used for authorization generation.
  - `arianeeAccessTokenPrefix`: The prefix to use for arianee access tokens generated for authorization.
- `fetchLike`: An optional fetch-like function (default is fetch in browser environment, and node-fetch in node environment).

## Methods

The WalletApiClient class provides methods to interact with all available routes of the Wallet API. These methods handle the authorization process and return typed objects that match the return types of the API routes. Please refer to the [API documentation](https://docs.arianee.org/v2.0/docs/wallet-api-introduction) for more information about each route and its return type.

Examples of methods provided by the WalletApiClient class are:

- getSmartAsset
- getSmartAssetEvents
- getOwnedSmartAssets
- getReceivedMessages
- getBrandIdentity
- getOwnedSmartAssetsBrandIdentities
