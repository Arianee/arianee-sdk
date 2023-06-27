# @arianee/ArianeeAccessToken

The ArianeeAccessToken class is a module that allows you to create and manage Arianee Access Tokens (AAT). This class requires the Core class from the @arianee/core module

## Usage

You need to instanciate the class with a core instance and a wallet address.

```typescript
const core = core.fromPrivateKey('0x...');
const arianeeAccessToken = new ArianeeAccessToken(core);
```

Then you can use the following methods:

### `getValidWalletAccessToken(payloadOverride: PayloadOverride = {}, params?: { timeBeforeExp?: number; prefix?: string; }): Promise<string>`

This method generates a wallet scoped Arianee Access Token (AAT) and stores it in memory. On subsequent calls, if the stored AAT is still valid, it will return it. Otherwise if it has expired or the expiration is in less than `timeBeforeExp` seconds, it will regenerate a new one and return it.

You can use the `prefix` parameter to add a string before the arianee access token payload in the message to be signed.

### `createWalletAccessToken(payloadOverride: PayloadOverride = {}, prefix?: string): Promise<string>`

This method generates an Arianee Access Token (AAT) for the wallet scope. It returns a `Promise` that resolves to the AAT as a `string`.
It takes two optional parameters, a `payloadOverride` parameter to override the default payload and a `prefix` parameter to add a string before the arianee access token payload in the message to be signed.

### `createCertificateArianeeAccessToken(certificateId: number, network: string): Promise<string>`

This method generates an Arianee Access Token (AAT) for the certificate scope. It takes two parameters: `certificateId`, which is the ID of the certificate, and `network`, which is the name of the Arianee network. It returns a `Promise` that resolves to the AAT as a `string`.

### `createActionArianeeAccessTokenLink(url: string, certificateId: number, network: string): Promise<string>`

This method creates a link with an Arianee Access Token (AAT) attached to it. It takes three parameters: `url`, which is the URL to attach the AAT to, `certificateId`, which is the ID of the certificate, and `network`, which is the name of the Arianee network. It returns a `Promise` that resolves to the link with the AAT as a `string`.

<br>

If you only need to decode existing arianee access token, you don't need to instanciate the class.

You can use the following static methods. These methods will automatically detect if the arianee access token is prefixed and handle it. In order for this to work seamlessly, the arianee access tokens must be signed with one of these two signature algorithms (alg prop in header): `secp256k1` or `ETH`.

### `static isArianeeAccessTokenValid(arianeeAccessToken: string): boolean`

This static method checks if an Arianee Access Token (AAT) is valid. It takes an `arianeeAccessToken` parameter as a `string` and returns a `boolean` indicating whether the AAT is valid or not.

### `static decodeJwt(arianeeAccessToken: string): {header: JwtHeaderInterface, payload: ArianeeAccessTokenPayload, signature: string}`

This static method decodes an Arianee Access Token (AAT). It takes an `arianeeAccessToken` parameter as a `string` and returns an object with the decoded AAT, containing the header, payload, and signature.

## Storage

You can pass a `storage` object (that implements the [`Web Storage API`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)) to the constructor under the `params.storage` key. \
This storage will be used for caching the generated arianee access token. Make sure that you do not pass an unsafe / public storage as it may expose the generated arianee access token.
