# @arianee/core

The Core class is a TypeScript class that provides an interface for signing messages and transactions on the Ethereum blockchain. It uses the [ethers library](https://ethers.org/), which is a popular library for interacting with Ethereum.

## Usage

You can instanciante core with :

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

The returned instance will have 2 method:

- signMessage(message:string)
- signTransaction(transaction:[TransactionLike](https://docs.ethers.org/v6/api/transaction/#TransactionLike))
- getAddress():string

If you need to implement core with an external wallet (like metamask), you need to instantiate the class with 2 functions:

- signMessage is a function that behaves like the [signMessage from ethers](https://docs.ethers.io/v6/api/signer/#Signer-signMessage)
- signTransaction is a function that behaves like the [signTransaction from ethers](https://docs.ethers.io/v6/api/signer/#Signer-signTransaction)
- getAddress is a function that returns the address of the wallet

```typescript
import { Core } from '@arianee/core';
const core = new Core(signMessage, signTransaction, getAddress);
```
