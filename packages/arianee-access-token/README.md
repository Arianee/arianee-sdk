# @arianee-sdk/ArianeeAccessToken

The ArianeeAccessToken class is a module that allows you to create and manage Arianee Access Tokens (AAT). This class requires the Core class from the @arianee-sdk/core module

## Usage

You need to instanciate the class with a core instance and a wallet address.

```typescript
const core = core.fromPrivateKey("0x...");
const arianeeAccessToken = new ArianeeAccessToken(core);
```

Then you can use the following methods:

### `createWalletAccessToken(): Promise<string>`

This method generates an Arianee Access Token (AAT) for the wallet scope. It returns a `Promise` that resolves to the AAT as a `string`.

### `createCertificateArianeeAccessToken(certificateId: number, network: string): Promise<string>`

This method generates an Arianee Access Token (AAT) for the certificate scope. It takes two parameters: `certificateId`, which is the ID of the certificate, and `network`, which is the name of the Arianee network. It returns a `Promise` that resolves to the AAT as a `string`.

### `createActionArianeeAccessTokenLink(url: string, certificateId: number, network: string): Promise<string>`

This method creates a link with an Arianee Access Token (AAT) attached to it. It takes three parameters: `url`, which is the URL to attach the AAT to, `certificateId`, which is the ID of the certificate, and `network`, which is the name of the Arianee network. It returns a `Promise` that resolves to the link with the AAT as a `string`.

<br>

If you only need to decode existing arianee access token, you don't need to instanciate the class. 

You can use the following static methods

### `static isArianeeAccessTokenValid(arianeeAccessToken: string): boolean`

This static method checks if an Arianee Access Token (AAT) is valid. It takes an `arianeeAccessToken` parameter as a `string` and returns a `boolean` indicating whether the AAT is valid or not.

### `static decodeJwt(arianeeAccessToken: string): {header: JwtHeaderInterface, payload: ArianeeAccessTokenPayload, signature: string}`

This static method decodes an Arianee Access Token (AAT). It takes an `arianeeAccessToken` parameter as a `string` and returns an object with the decoded AAT, containing the header, payload, and signature.

