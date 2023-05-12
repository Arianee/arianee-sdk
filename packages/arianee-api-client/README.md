## @arianee/ariane-api-client

The `ariane-api-client` library allows you to interact with the Arianee blockchain through the Arianee API. It provides methods to get information related to multichain, network, and identities.

### Constructor

#### `new ArianeeApiClient(arianeeApiUrl?, fetchLike?)`

- `arianeeApiUrl` (optional): A string representing the Arianee API URL. The default value is `'https://api.arianee.com'`.
- `fetchLike` (optional): A function to perform HTTP requests. The default value is `fetch` if running in a browser environment, and `node-fetch` if running in a Node.js environment.


### Methods

#### `multichain`

An object containing methods related to the multichain protocol.

##### `getEvents(chainType, smartContractName, eventName, filters?)`

Returns an array of `BlockchainEvent` objects representing an event in the blockchain.

- `chainType`: A `ChainType` enum value representing the chain type (mainnet or testnet).
- `smartContractName`: A `SmartContractNames` enum value representing the smart contract name.
- `eventName`: A `blockchainEventsName` enum value representing the event name.
- `filters` (optional): An object containing additional parameters to filter the events.

```typescript
const events = await client.multichain.getEvents('mainnet', 'ArianeeSmartAsset', 'Transfer');
```

##### `getOwnedNfts(chainType, address)`

Returns an array of `smartAssetInfo` objects representing the owned NFTs by the specified address.

- `chainType`: A `ChainType` enum value representing the chain type (mainnet or testnet).
- `address`: A string representing the owner's address.

```typescript
const nfts = await client.multichain.getOwnedNfts('mainnet', '0x1234567890123456789012345678901234567890');
```

##### `getReceivedMessages(chainType, address)`

Returns an array of `decentralizedMessageInfo` objects representing the received decentralized messages by the specified address.

- `chainType`: A `ChainType` enum value representing the chain type (mainnet or testnet).
- `address`: A string representing the recipient's address.
```typescript
const messages = await client.multichain.getReceivedMessages('mainnet', '0x1234567890123456789012345678901234567890');
```

##### `getIdentity(address)`

Returns a `brandIdentityInfo` object representing the brand identity associated with the specified address.

- `address`: A string representing the brand identity address.
```typescript
const identity = await client.multichain.getIdentity('0x1234567890123456789012345678901234567890');
```

#### `network`

An object containing methods related to the network protocol.

##### `getEvents(chainId, contractAddress, eventName, filters?)`

Returns an array of `BlockchainEvent` objects corresponding to the specified parameters.

- `chainId`: A string representing the chain identifier.
- `contractAddress`: A string representing the smart contract address.
- `eventName`: A `blockchainEventsName` enum value representing the event name.
- `filters` (optional): An object containing additional parameters to filter the events.
```typescript
const events = await client.network.getEvents('polygon', '0x1234567890123456789012345678901234567890', 'Transfer');
```

##### `countEvents(chainId, contractAddress, eventName, filters?)`

Returns the number of events corresponding to the specified parameters.

- `chainId`: A string representing the chain identifier.
- `contractAddress`: A string representing the smart contract address.
- `eventName`: A `blockchainEventsName` enum value representing the event name.
- `filters` (optional): An object containing additional parameters to filter the events.
```typescript
const events = await client.network.countEvents('polygon', '0x1234567890123456789012345678901234567890', 'Transfer');
```
##### `getOwnedNfts(protocol, address)`

Returns an array of `smartAssetInfo` objects representing the owned NFTs by the specified address on a specific network.

- `protocol`: A `Protocol` object representing the protocol (mainnet, testnet, polygon, arialabs...).
- `address`: A string representing the owner's address.
```typescript
const events = await client.network.getOwnedNfts('polygon', '0x1234567890123456789012345678901234567890');
```

##### `getNft(protocol, tokenId)`

Returns a `smartAssetInfo` objects representing a specific NFT on a specific network.

- `protocol`: A `Protocol` object representing the protocol (mainnet, testnet, polygon, arialabs...).
- `tokenId`: A string representing the token id.
```typescript
const events = await client.network.smartAssetInfo('polygon', '12');
```

##### `getNftArianeeEvents(protocol, tokenId)`

Returns an array of `BlockchainEvent` objects representing an event in the blockchain for a specific NFT.

- `protocol`: A `Protocol` object representing the protocol (mainnet, testnet, polygon, arialabs...).
- `tokenId`: A string representing the token id.
```typescript
const events = await client.network.smartAssetInfo('polygon', '12');
```

##### `getNftOwner(protocol, tokenId)`

Returns a string representing the owner of the specified NFT

- `protocol`: A `Protocol` object representing the protocol (mainnet, testnet, polygon, arialabs...).
- `tokenId`: A string representing the token id.
```typescript
const events = await client.network.getNftOwner('polygon', '12');
```

##### `getIdentity(protocol, address)`

Returns a `brandIdentityInfo` object representing the brand identity associated with the specified address.

- `protocol`: A `Protocol` object representing the protocol (mainnet, testnet, polygon, arialabs...).
- `address`: A string representing the brand identity address.
```typescript
const events = await client.network.getIdentity('polygon', '0x1234567890123456789012345678901234567890');
```
