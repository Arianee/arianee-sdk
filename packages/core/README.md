# @arianee/core

The Core class is a TypeScript class that provides an interface for signing messages and transactions on the Ethereum blockchain. It uses the [ethers library](https://ethers.org/), which is a popular library for interacting with Ethereum.

## Usage

You can instantiate core with :

- Mnemonic
- Passphrase
- PrivateKey

**Example :**

```typescript
import { Core } from '@arianee/core';
Core.fromMnemonic(mnemonic);
Core.fromPassPhrase(passphrase);
Core.fromPrivateKey(privateKey);
Core.fromRandom();
```

The returned instance will have 4 methods (see [TransactionLike](https://docs.ethers.org/v6/api/transaction/#TransactionLike)):

```typescript
signMessage(message:string)

signTransaction(transaction: TransactionLike))

sendTransaction(transaction: TransactionRequest) : Promise<TransactionResponse | { skipResponse: true }>

getAddress():string
```

**Note**: If you are using `sendTransaction` in an asynchronous context (e.g. adding the transaction to a queue instead of sending it directly), you **must** return `{ skipResponse: true }` instead of a `TransactionResponse` so that the `@arianee/*` packages won't try to fetch the transaction receipt.

If you need to implement core with an external wallet (like metamask), you need to instantiate the class with 3 functions:

- signMessage is a function that behaves like the [signMessage from ethers](https://docs.ethers.io/v6/api/signer/#Signer-signMessage)
- signTransaction is a function that behaves like the [signTransaction from ethers](https://docs.ethers.io/v6/api/signer/#Signer-signTransaction)
- getAddress is a function that returns the address of the wallet

```typescript
import { Core } from '@arianee/core';
const core = new Core(signMessage, signTransaction, getAddress);
```
