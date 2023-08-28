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

Most methods of the library require a connection prior to being used. If you try to use a method without being connected, it will throw a `NotConnectedError`.

## Examples

We've built a minimalistic Angular application that leverages some of the `@arianee/creator` features.

It can be ran with

```bash
npm run angular-creator
```

Code is available in the `apps/angular-creator` folder.

You can also find examples of usage in the `apps/arianee-sdk-example/creator` folder.

### Main features

#### `reserveSmartAssetId`

Reserve a particular smart asset id that can be used later to create a smart asset.

```typescript
public async reserveSmartAssetId(
    id?: number,
    overrides: NonPayableOverrides = {}
)
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

#### `createSmartAsset`

Create a smart asset and return a `LinkObject`. This method does not store the content in the Arianee Privacy Gateway, use `createAndStoreSmartAsset` instead if you need to.

```typescript
public async createSmartAsset(
  params: CreateSmartAssetParameters,
  overrides: NonPayableOverrides = {}
): Promise<LinkObject>
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

#### `buyCredit`

A method to buy smart asset, message, event or update credits.

```typescript
public async buyCredit(
  creditType: CreditType,
  amount: number,
  overrides: NonPayableOverrides = {}
)
```

```typescript
enum CreditType {
  smartAsset = 0,
  message = 1,
  event = 2,
  update = 3,
}
```

#### `recoverSmartAsset`

A method to recover a smart asset issued by the core address.

```typescript
public async recoverSmartAsset(
  id: string,
  overrides: NonPayableOverrides = {}
)
```

#### `destroySmartAsset`

A method to destroy a smart asset owned by the core address.

```typescript
public async destroySmartAsset(
  id: string,
  overrides: NonPayableOverrides = {}
)
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

The method can throw:

- `NotOwnerError` if the core address is not the owner of the smart asset

#### `createAndStoreMessage`

_⚠️ Requires the core address to have an identity URI_.

Create a message and store its content in the Arianee Privacy Gateway set in the core address's identity and return a `CreatedMessage`.

```typescript
public async createAndStoreMessage(
  params: CreateAndStoreMessageParameters,
  overrides: NonPayableOverrides = {}
): Promise<CreatedMessage>
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

#### `createMessage`

Create a message and return a `CreatedMessage`.

```typescript
public async createMessage(
  params: CreateMessageParameters,
  overrides: NonPayableOverrides = {}
): Promise<CreatedMessage>
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

#### `createAndStoreEvent`

_⚠️ Requires the core address to have an identity URI_.

Create an event and store its content in the Arianee Privacy Gateway set in the core address's identity and return a `CreatedEvent`.

```typescript
public async createAndStoreEvent(
  params: CreateAndStoreEventParameters,
  overrides: NonPayableOverrides = {}
): Promise<CreatedEvent>
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

#### `createEvent`

Create an event and return a `CreatedEvent`.

```typescript
public async createEvent(
  params: CreateEventParameters,
  overrides: NonPayableOverrides = {}
): Promise<CreatedEvent>
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

#### `updateTokenURI`

Update the public URI of a smart asset.

```typescript
public async updateTokenURI(
  smartAssetId: SmartAsset['certificateId'],
  uri: string,
  overrides: NonPayableOverrides = {}
)
```

The method can throw:

- `NotIssuerError` if the core address is not the issuer of the smart asset
- `InvalidURIError` if the uri is not valid

### Utils

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
