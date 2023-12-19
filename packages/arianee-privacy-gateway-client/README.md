## @arianee/arianee-privacy-gateway-client

This is a TypeScript library that provides a client to interact with the Arianee Privacy Gateway. The Arianee Privacy Gateway is used to retrieve content of private non-fungible tokens (NFTs).

### Usage

To use the library, you need to import the `ArianeePrivacyGatewayClient` class and create a new instance of it with the following parameters:

- `auth`: An instance of the `Core` class from the `@arianee/core` package, an Arianee access token as a string, or an object containing a message and a signature.
- `fetchLike`: A function that behaves like the `fetch` function, used to make HTTP requests.

The `ArianeePrivacyGatewayClient` class provides the following methods:

#### `certificateRead`

This method retrieves the (original) content of a NFT. If the NFT was updated, you need to use `updateRead` instead.

```typescript
async certificateRead(
  rpcUrl: RpcUrl,
  {
    certificateId,
    passphrase,
  }: {
    certificateId: string;
    passphrase?: string;
  }
): Promise<ArianeeProductCertificateI18N>;
```

- rpcUrl: The URL of the arianee privacy gateway rpc.
- certificateId: The ID of the certificate to retrieve the content of.
- passphrase (optional): The passphrase of the certificate

#### `updateRead`

This method retrieves the updated content of a NFT.

```typescript
async updateRead(
  rpcUrl: RpcUrl,
  {
    certificateId,
    passphrase,
  }: {
    certificateId: string;
    passphrase?: string;
  }
): Promise<ArianeeProductCertificateI18N>;
```

- rpcUrl: The URL of the arianee privacy gateway rpc.
- certificateId: The ID of the certificate to retrieve the updated content of.
- passphrase (optional): The passphrase of the certificate

#### `messageRead`

This method retrieves the content of a private NFT message.

```typescript
async messageRead(
  rpcUrl: RpcUrl,
  {
    messageId,
  }: {
    messageId: string;
  }
): Promise<ArianeeMessageI18N>;
```

- rpcUrl: The URL of the arianee privacy gateway rpc.
- messageId: The ID of the message to retrieve content of.

#### `eventRead`

This method retrieves the content of a private NFT event.

```typescript
async eventRead(
  rpcUrl: RpcUrl,
  {
    certificateId,
    eventId,
    passphrase,
  }: {
    certificateId: string;
    eventId: string;
    passphrase?: string;
  }
): Promise<ArianeeEventI18N>;
```

- rpcUrl: The URL of the arianee privacy gateway rpc.
- certificateId: The ID of the certificate that the event belongs to.
- eventId: The ID of the event to retrieve the content of.
- passphrase (optional): The passphrase of the certificate

### Authentication

The library supports two types of authentication: Arianee access tokens and message/signature authentication. If you pass an instance of the Core class as the auth parameter, the library will use an Arianee access token generated using the Core instance to authenticate requests. If you pass an object with a message and a signature property, the library will use message/signature authentication.
