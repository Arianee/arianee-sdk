import {
  ethers,
  Mnemonic,
  SigningKey,
  TransactionLike,
  TransactionResponse,
  TypedDataDomain,
  TypedDataField,
} from 'ethers';
import { TransactionRequest } from 'ethers/lib.esm';

export default class Core {
  public signMessage!: (
    message: string
  ) => Promise<{ message: string; signature: string }>;
  public signTransaction!:
    | ((
        transaction: TransactionLike
      ) => Promise<{ transaction: TransactionLike; signature: string }>)
    | undefined;

  public sendTransaction!:
    | ((
        transaction: TransactionRequest
      ) => Promise<TransactionResponse | { skipResponse: true }>)
    | undefined;

  public getAddress!: () => string;

  public signTypedData!:
    | ((
        domain: TypedDataDomain,
        types: Record<string, Array<TypedDataField>>,
        value: Record<string, any>
      ) => Promise<{ signature: string }>)
    | undefined;

  constructor(params: {
    signMessage: (
      message: string
    ) => Promise<{ message: string; signature: string }>;
    getAddress: () => string;
    signTransaction?:
      | ((
          transaction: TransactionLike
        ) => Promise<{ transaction: TransactionLike; signature: string }>)
      | undefined;
    sendTransaction?:
      | ((transaction: TransactionRequest) => Promise<TransactionResponse>)
      | undefined;
    signTypedData?:
      | ((
          domain: TypedDataDomain,
          types: Record<string, Array<TypedDataField>>,
          value: Record<string, any>
        ) => Promise<{ signature: string }>)
      | undefined;
  }) {
    if (
      params.signTransaction !== undefined &&
      params.sendTransaction !== undefined
    ) {
      throw new Error(
        'You can not use signTransaction and sendTransaction at the same time'
      );
    }

    if (
      params.signTransaction === undefined &&
      params.sendTransaction === undefined
    ) {
      throw new Error(
        'You must provide a signTransaction or a sendTransaction function'
      );
    }

    if (params.signMessage === undefined)
      throw new Error('You must provide a signMessage function');

    if (params.getAddress === undefined)
      throw new Error('You must provide a getAddress function');

    this.getAddress = params.getAddress;
    this.signMessage = params.signMessage;
    this.signTransaction = params.signTransaction;
    this.sendTransaction = params.sendTransaction;
    this.signTypedData = params.signTypedData;
  }

  static fromWallet(wallet: ethers.Wallet): Core {
    return new Core({
      signMessage: async (message: string) => {
        const signature = await wallet.signMessage(message);
        return { message, signature };
      },
      signTransaction: async (data: TransactionLike) => {
        const signature = await wallet.signTransaction(data);
        return { transaction: data, signature };
      },
      getAddress: () => wallet.address,
      signTypedData: async (
        domain: TypedDataDomain,
        types: Record<string, Array<TypedDataField>>,
        value: Record<string, any>
      ) => {
        const signature = await wallet.signTypedData(domain, types, value);
        return { signature };
      },
    });
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

export { Core };
