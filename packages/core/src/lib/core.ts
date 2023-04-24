import { ethers, Mnemonic, SigningKey, TransactionLike } from 'ethers';

export class Core {
  constructor(
    public signMessage: (
      message: string
    ) => Promise<{ message: string; signature: string }>,
    public signTransaction: (
      transaction: TransactionLike
    ) => Promise<{ message: TransactionLike; signature: string }>,
    public getAddress: () => string
  ) {}

  static fromWallet(wallet: ethers.Wallet): Core {
    return new Core(
      async (message: string) => {
        const signature = await wallet.signMessage(message);
        return { message, signature };
      },
      async (data: TransactionLike) => {
        const signature = await wallet.signTransaction(data);
        return { message: data, signature };
      },
      () => wallet.address
    );
  }

  static fromPrivateKey(privateKey: string): Core {
    try {
      new SigningKey(privateKey);
    } catch (e) {
      throw new Error('invalid private key');
    }

    const wallet = new ethers.Wallet(privateKey);
    return Core.fromWallet(wallet);
  }

  static fromMnemonic(phrase: string): Core {
    const isValidMnemonic = Mnemonic.isValidMnemonic(phrase);
    if (!isValidMnemonic) {
      throw new Error('invalid mnemonic');
    }
    const mnemonic = Mnemonic.fromPhrase(phrase);
    const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonic);
    return Core.fromPrivateKey(wallet.privateKey);
  }

  static fromPassPhrase(passphrase: string | number): Core {
    let hexpassphrase: string;
    if (!isNaN(+passphrase)) {
      let numberToString = passphrase.toString(16);
      if (numberToString.length < 10) {
        numberToString =
          '0'.repeat(10 - numberToString.length) + numberToString;
      }
      hexpassphrase = '0x' + numberToString; //0x4d2
    } else {
      const stringPassphrase = passphrase as string;
      const bytelike = Uint8Array.from(stringPassphrase, (c) =>
        c.charCodeAt(0)
      );
      hexpassphrase = ethers.hexlify(bytelike);
    }

    const privateKey = ethers.zeroPadValue(hexpassphrase, 32);
    return Core.fromPrivateKey(privateKey);
  }

  static fromRandom(): Core {
    const privateKey = ethers.Wallet.createRandom().privateKey;
    return Core.fromPrivateKey(privateKey);
  }
}
