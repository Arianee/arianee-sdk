# @arianee/creator

The creator library makes it easy for builders to create content on the Arianee protocol through a higher level API. It is essentially a wrapper around the `@arianee/arianee-protocol-client` and the `@arianee/arianee-privacy-gateway-client` libraries.

## Installation

The library requires the `@arianee/core` package, it is used for message and transaction signing / sending.

```bash
npm install @arianee/creator @arianee/core
```

## Usage

Instantiate a new `Creator` instance and pass the required params `core`, `creatorAddress` and `transactionStrategy`.

```typescript
import { Creator } from '@arianee/creator';
import { Core } from '@arianee/core';

const creator = new Creator({
  core: Core.fromRandom(),
  creatorAddress: '0x...',
  transactionStrategy: 'WAIT_TRANSACTION_RECEIPT',
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

Most methods of the library require a connection prior to being used. If you try to use a method without being connected, it will throw a `NotConnectedError`.

## Constructor

The constructor takes different parameters:

```typescript
export type TransactionStrategy = 'WAIT_TRANSACTION_RECEIPT' | 'DO_NOT_WAIT_TRANSACTION_RECEIPT';

export type CreatorParams<T extends TransactionStrategy> = {
  creatorAddress: string;
  core: Core;
  transactionStrategy: T;
  fetchLike?: typeof fetch;
  protocolDetailsResolver?: ProtocolDetailsResolver;
};
```

- `creatorAddress`: the address that will receive the Arianee protocol rewards
- `core`: an `@arianee/core` instance
- `transactionStrategy`: either to wait for transaction receipt or not. **The recommended value for most users is `'WAIT_TRANSACTION_RECEIPT'`**. If `'WAIT_TRANSACTION_RECEIPT'` is passed, the `Creator` will wait for the transaction receipt, ensuring that the transaction has been successful, and methods will return a `ContractTransactionReceipt`. If `'DO_NOT_WAIT_TRANSACTION_RECEIPT'` is passed, the `Creator` will not wait for the receipt and methods will return a `ContractTransactionResponse`. This means the transaction might fail without notification. The latter is suitable for programs that utilize transaction queues and cannot wait for transaction confirmations. If the `@arianee/core` instance you are using has a custom `sendTransaction` method for queuing transactions (one that resolves to `{ skipResponse: true }`), you need to use `'DO_NOT_WAIT_TRANSACTION_RECEIPT'`.
- `fetchLike`: this is the fetch-like function used for making HTTP requests. It can be any function that has the same signature as the `fetch` function. By default, it uses the `defaultFetchLike` of `@arianee/utils`.
- `protocolDetailsResolver`: you can provide a custom protocol details resolver, it can be any function that has the same signature as the `protocolDetailsResolver` function of `@arianee/arianee-protocol-client`.

## Examples

We've built a minimalistic Angular application that leverages some of the `@arianee/creator` features.

It can be ran with

```bash
npm run angular-creator
```

Code is available in the `apps/angular-creator` folder.

You can also find examples of usage in the `apps/arianee-sdk-example/creator` folder.

### Main features

Creator features are separated by type:

- Smart assets
- Messages
- Events
- Utils

#### `buyCredit`

A method to buy smart asset, message, event or update credits.

```typescript
public async buyCredit(
  creditType: CreditType,
  amount: number,
  overrides: NonPayableOverrides = {}
)
```

Implementation example :

```typescript
await this.creator.buyCredit(parseInt(this.creditType) as CreditType, parseInt(this.amount.trim()));
```

```typescript
enum CreditType {
  smartAsset = 0,
  message = 1,
  event = 2,
  update = 3,
}
```

### <u>Smart assets </u>

#### `reserveSmartAssetId`

Reserve a particular smart asset id that can be used later to create a smart asset.

```typescript
public async reserveSmartAssetId(
    id?: number,
    overrides: NonPayableOverrides = {}
)
```

Implementation example :

```typescript
await this.creator.smartAssets.reserveSmartAssetId(this.id ? parseInt(this.id.trim()) : undefined);
```

#### `createAndStoreSmartAsset`

_⚠️ Requires the core address to have an identity URI_.

Create a smart asset and store its content in the Arianee Privacy Gateway set in the core address's identity and return a `LinkObject` .

```typescript
public async createAndStoreSmartAsset(
  params: CreateAndStoreSmartAssetParameters,
  overrides: NonPayableOverrides = {}
) : Promise<LinkObject>
```

Implementation example :

```typescript
await this.creator.smartAssets.createAndStoreSmartAsset({
  smartAssetId: this.id && this.id !== '' ? parseInt(this.id) : undefined,
  content,
});
```

```typescript
interface CreateAndStoreSmartAssetParameters {
  smartAssetId?: number;
  tokenAccess?: { fromPassphrase: string } | { address: string };
  tokenRecoveryTimestamp?: number;
  sameRequestOwnershipPassphrase?: boolean;
  content: ArianeeProductCertificateI18N;
}

type LinkObject = {
  smartAssetId: SmartAsset['certificateId'];
  deeplink?: string;
  passphrase?: string;
};
```

The method can throw different errors:

- `UnavailableSmartAssetIdError` if the smart asset id is not available
- `InsufficientSmartAssetCreditsError` if the core address does not have enough smart asset credits
- `NoIdentityError` if the core address does not have an identity URI
- `ArianeePrivacyGatewayError` if an error occurred while interacting with the Arianee privacy gateway

#### `createSmartAsset`

Create a smart asset and return a `LinkObject`. This method does not store the content in the Arianee Privacy Gateway, use `createAndStoreSmartAsset` instead if you need to.

```typescript
public async createSmartAsset(
  params: CreateSmartAssetParameters,
  overrides: NonPayableOverrides = {}
): Promise<LinkObject>
```

Implementation example :

```typescript
await this.creator.smartAssets.createSmartAsset({
  smartAssetId: this.id && this.id !== '' ? parseInt(this.id) : undefined,
  uri: this.uri,
});
```

```typescript
interface CreateSmartAssetParameters {
  smartAssetId?: number;
  tokenAccess?: { fromPassphrase: string } | { address: string };
  tokenRecoveryTimestamp?: number;
  sameRequestOwnershipPassphrase?: boolean;
  uri: string;
}

type LinkObject = {
  smartAssetId: SmartAsset['certificateId'];
  deeplink?: string;
  passphrase?: string;
};
```

The method can throw different errors:

- `UnavailableSmartAssetIdError` if the smart asset id is not available
- `InsufficientSmartAssetCreditsError` if the core address does not have enough smart asset credits

#### `createSmartAssetRaw`

Create a smart asset and return a `LinkObject`. This method does not store the content in the Arianee Privacy Gateway nor retrieve the content from an URI, use `createAndStoreSmartAsset` or `createSmartAsset` instead if you need to.

```typescript
public async createSmartAssetRaw(
  params: CreateSmartAssetCommonParameters,
  overrides: NonPayableOverrides = {}
): Promise<LinkObject>
```

Implementation example :

```typescript
await this.creator.smartAssets.createSmartAssetRaw({
  smartAssetId: this.id && this.id !== '' ? parseInt(this.id) : undefined,
  content,
});
```

```typescript
interface CreateSmartAssetCommonParameters {
  smartAssetId?: number;
  tokenAccess?: { fromPassphrase: string } | { address: string };
  tokenRecoveryTimestamp?: number;
  sameRequestOwnershipPassphrase?: boolean;
  content: ArianeeProductCertificateI18N;
}

type LinkObject = {
  smartAssetId: SmartAsset['certificateId'];
  deeplink?: string;
  passphrase?: string;
};
```

The method can throw different errors:

- `UnavailableSmartAssetIdError` if the smart asset id is not available
- `InsufficientSmartAssetCreditsError` if the core address does not have enough smart asset credits

#### `updateSmartAsset`

Update the certificate content imprint on chain. Returns the imprint of the new content.

```typescript
public async updateSmartAsset(
  smartAssetId: SmartAsset['certificateId'],
  content: SmartAsset['content'],
  overrides: NonPayableOverrides = {}
): Promise<{ imprint: string }>
```

Implementation example :

```typescript
await this.creator.smartAssets.updateSmartAsset(this.smartAssetId, content);
```

The method can throw different errors:

- `InsufficientUpdateCreditsError` if the core address does not have enough update credits
- `ArianeePrivacyGatewayError` if an error occurred while interacting with the Arianee privacy gateway

#### `updateAndStoreSmartAsset`

_⚠️ Requires the core address to have an identity URI_.

Update the content of a smart asset in the Arianee privacy gateway and update its imprint on chain. Returns the imprint of the new content.

```typescript
public async updateAndStoreSmartAsset(
  smartAssetId: SmartAsset['certificateId'],
  content: SmartAsset['content'],
  overrides: NonPayableOverrides = {}
): Promise<{ imprint: string }>
```

Implementation example :

```typescript
await this.creator.smartAssets.updateAndStoreSmartAsset(this.smartAssetId, content);
```

The method can throw different errors:

- `InsufficientUpdateCreditsError` if the core address does not have enough update credits
- `NoIdentityError` if the core address does not have an identity URI
- `ArianeePrivacyGatewayError` if an error occurred while interacting with the Arianee privacy gateway

#### `recoverSmartAsset`

A method to recover a smart asset issued by the core address.

```typescript
public async recoverSmartAsset(
  id: string,
  overrides: NonPayableOverrides = {}
)
```

Implementation example :

```typescript
await this.creator.smartAssets.recoverSmartAsset(this.id);
```

#### `destroySmartAsset`

A method to destroy a smart asset owned by the core address.

```typescript
public async destroySmartAsset(
  id: string,
  overrides: NonPayableOverrides = {}
)
```

Implementation example :

```typescript
await this.creator.smartAssets.destroySmartAsset(this.id);
```

The method can throw:

- `NotOwnerError` if the core address is not the owner of the smart asset

#### `setTokenAccess`

A method to set the token access (request / view) of a smart asset owned by the core address.

```typescript
public async setTokenAccess(
  smartAssetId: SmartAsset['certificateId'],
  tokenAccessType: TokenAccessType,
  tokenAccess?: TokenAccess,
  overrides: NonPayableOverrides = {}
): Promise<LinkObject>
```

The method can throw:

- `NotOwnerError` if the core address is not the owner of the smart asset

#### `setRequestKey`

A method to set the request key of a smart asset owned by the core address.

```typescript
public async setRequestKey(
  smartAssetId: SmartAsset['certificateId'],
  tokenAccess?: TokenAccess,
  overrides: NonPayableOverrides = {}
): Promise<LinkObject>
```

Implementation example :

```typescript
await this.creator.smartAssets.setRequestKey(this.id, tokenAccess);
```

The method can throw:

- `NotOwnerError` if the core address is not the owner of the smart asset

#### `updateTokenURI`

Update the public URI of a smart asset.

```typescript
public async updateTokenURI(
  smartAssetId: SmartAsset['certificateId'],
  uri: string,
  overrides: NonPayableOverrides = {}
)
```

Implementation example :

```typescript
await this.creator.smartAssets.updateTokenURI(this.id, this.uri);
```

The method can throw:

- `NotIssuerError` if the core address is not the issuer of the smart asset
- `InvalidURIError` if the uri is not valid

### <u>Messages </u>

#### `createAndStoreMessage`

_⚠️ Requires the core address to have an identity URI_.

Create a message and store its content in the Arianee Privacy Gateway set in the core address's identity and return a `CreatedMessage`.

```typescript
public async createAndStoreMessage(
  params: CreateAndStoreMessageParameters,
  overrides: NonPayableOverrides = {}
): Promise<CreatedMessage>
```

Implementation example :

```typescript
await this.creator.messages.createAndStoreMessage({
  smartAssetId: parseInt(this.smartAssetId),
  content,
  messageId: this.id && this.id !== '' ? parseInt(this.id) : undefined,
});
```

```typescript
type CreatedMessage = {
  imprint: string;
  id: number;
};

interface CreateAndStoreMessageParameters {
  messageId?: number;
  smartAssetId: number;
  content: ArianeeMessageI18N;
}
```

The method can throw:

- `InsufficientMessageCreditsError` if the core address does not have enough message credits
- `UnavailableMessageIdError` if the message id is not available
- `NoIdentityError` if the core address does not have an identity URI
- `ArianeePrivacyGatewayError` if an error occurred while interacting with the Arianee privacy gateway

#### `createMessage`

Create a message and return a `CreatedMessage`.

```typescript
public async createMessage(
  params: CreateMessageParameters,
  overrides: NonPayableOverrides = {}
): Promise<CreatedMessage>
```

Implementation example :

```typescript
await this.creator.messages.createMessage({
  smartAssetId: parseInt(this.smartAssetId),
  uri: this.uri,
  messageId: this.id && this.id !== '' ? parseInt(this.id) : undefined,
});
```

```typescript
type CreatedMessage = {
  imprint: string;
  id: number;
};

interface CreateMessageParameters {
  messageId?: number;
  smartAssetId: number;
  uri: string;
}
```

The method can throw:

- `InsufficientMessageCreditsError` if the core address does not have enough message credits
- `UnavailableMessageIdError` if the message id is not available

#### `createMessageRaw`

Create a message and return a `CreatedMessage`. This method does not store the content in the Arianee Privacy Gateway nor retrieve the content from an URI, use `createAndStoreMessage` or `createMessage` instead if you need to.

```typescript
public async createMessageRaw(
  params: CreateMessageCommonParameters,
  overrides: NonPayableOverrides = {}
): Promise<CreatedMessage>
```

Implementation example :

```typescript
await this.creator.messages.createMessageRaw({
  smartAssetId: parseInt(this.smartAssetId),
  content,
  messageId: this.id && this.id !== '' ? parseInt(this.id) : undefined,
});
```

```typescript
type CreatedMessage = {
  imprint: string;
  id: number;
};

interface CreateMessageCommonParameters {
  messageId?: number;
  smartAssetId: number;
  content: ArianeeMessageI18N;
}
```

The method can throw:

- `InsufficientMessageCreditsError` if the core address does not have enough message credits
- `UnavailableMessageIdError` if the message id is not available

### <u>Events </u>

#### `createAndStoreEvent`

_⚠️ Requires the core address to have an identity URI_.

Create an event and store its content in the Arianee Privacy Gateway set in the core address's identity and return a `CreatedEvent`.

```typescript
public async createAndStoreEvent(
  params: CreateAndStoreEventParameters,
  overrides: NonPayableOverrides = {}
): Promise<CreatedEvent>
```

Implemenation example :

```typescript
await this.creator.events.createAndStoreEvent({
  smartAssetId: parseInt(this.smartAssetId),
  content,
  eventId: this.id && this.id !== '' ? parseInt(this.id) : undefined,
});
```

```typescript
type CreatedEvent = {
  imprint: string;
  id: number;
};

interface CreateAndStoreEventParameters {
  eventId?: number;
  smartAssetId: number;
  content: ArianeeEventI18N;
}
```

The method can throw:

- `InsufficientEventCreditsError` if the core address does not have enough event credits
- `UnavailableEventIdError` if the event id is not available
- `NoIdentityError` if the core address does not have an identity URI
- `ArianeePrivacyGatewayError` if an error occurred while interacting with the Arianee privacy gateway

#### `createEvent`

Create an event and return a `CreatedEvent`.

```typescript
public async createEvent(
  params: CreateEventParameters,
  overrides: NonPayableOverrides = {}
): Promise<CreatedEvent>
```

Implementation example :

```typescript
await this.creator.events.createEvent({
  smartAssetId: parseInt(this.smartAssetId),
  uri: this.uri,
  eventId: this.id && this.id !== '' ? parseInt(this.id) : undefined,
});
```

```typescript
type CreatedEvent = {
  imprint: string;
  id: number;
};

interface CreateEventParameters {
  eventId?: number;
  smartAssetId: number;
  uri: string;
}
```

The method can throw:

- `InsufficientEventCreditsError` if the core address does not have enough event credits
- `UnavailableEventIdError` if the event id is not available

### <u>Identities</u>

#### `updateIdentity`

_⚠️ Requires the core address to have an identity URI_.

Updates the identity of the core address with passed URI and imprint.

```typescript
public async updateIdentity(
  {
    uri,
    imprint,
  }: {
    uri: string;
    imprint: string;
  },
  overrides: NonPayableOverrides = {}
)
```

The method can throw:

- `NoIdentityError` if the core address does not have an identity URI

### <u>Utils</u>

#### `isSmartAssetIdAvailable`

A method to check if the passed smart asset id is available.

```typescript
public async isSmartAssetIdAvailable(id: number): Promise<boolean>
```

#### `canCreateSmartAsset`

A method to check if the creator's address can create the smart asset with the passed id.

```typescript
public async canCreateSmartAsset(id: number): Promise<boolean>
```

#### `getCreditBalance`

Get the balance of the passed credit type. If address is not passed, the creator's address will be used.

```typescript
public async getCreditBalance(
  creditType: CreditType,
  address?: string
): Promise<bigint>
```

#### `getCreditPrice`

Get the credit price of the passed credit type on the current protocol.

```typescript
public async getCreditPrice(creditType: CreditType): Promise<bigint>
```

#### `getAriaBalance`

Get the aria balance. If address is not passed, the creator's address will be used.

```typescript
public async getAriaBalance(address?: string): Promise<bigint>
```

#### `getNativeBalance`

Get the native balance. If address is not passed, the creator's address will be used.

```typescript
public async getNativeBalance(address?: string): Promise<bigint>
```

#### `getAvailableSmartAssetId`

Return a randomly generated available smart asset id.

```typescript
public async getAvailableSmartAssetId(): Promise<number>
```

#### `getAriaAllowance`

Return the aria allowance of the passed address for the passed spender address. If the address is not passed, the creator's address will be used.

```typescript
public async getAriaAllowance(spender: string, address?: string)
```

#### `approveAriaSpender`

Approve the passed spender for the passed amount on the aria contract.

```typescript
public async approveAriaSpender(
  spender: string,
  amount: BigNumberish = '10000000000000000000000000000'
)
```

#### `getSmartAssetOwner`

Get the owner of the passed smart asset id.

```typescript
public async getSmartAssetOwner(id: string): Promise<string>
```

#### `calculateImprint`

Calculate the imprint of the passed content.

```typescript
public async calculateImprint(
  content: ArianeeProductCertificateI18N
): Promise<string>
```

#### `requestTestnetAria20`

_For developers, only available on testnet_

Request testnet aria20 tokens, if address is not passed, the creator's address will be used.

```typescript
public async requestTestnetAria20(address?: string)
```

The method can throw:

- `ProtocolCompatibilityError` if called on a protocol that is not the testnet protocol

#### `getSmartAssetIssuer`

A method to get the issuer of a smart asset.

```typescript
public async getSmartAssetIssuer(id: string)
```

#### `getSmartAssetIssuer`

A method to get the issuer of a smart asset.

```typescript
public async getSmartAssetIssuer(id: string)
```

#### `getAvailableId`

A method to get a randomly generated available id for the passed type.

```typescript
public async getAvailableId(
    idType: 'smartAsset' | 'message' | 'event'
): Promise<number>
```

#### `getAvailableSmartAssetId`

A method to get a randomly generated available id for the a smart asset.

```typescript
public async getAvailableSmartAssetId(): Promise<number>
```

#### `getAvailableMessageId`

A method to get a randomly generated available id for the a message.

```typescript
public async getAvailableMessageId(): Promise<number>
```

#### `isMessageIdAvailable`

A method to check whether or not a given id is available for use as a message id.

```typescript
public async isMessageIdAvailable(id: number): Promise<boolean>
```

## Tests

Unit tests can be ran with:

```bash
npm run test:creator
```
