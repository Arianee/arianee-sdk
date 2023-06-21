import {
  JsonRpcProvider,
  Provider,
  Transaction,
  TransactionLike,
  TransactionRequest,
  TransactionResponse,
  Wallet,
  resolveProperties,
} from 'ethers';
import Core from '@arianee/core';
import { Protocol } from '@arianee/common-types';
import GasStation from '../gasStation/gasStation';

/**
 * Returns an ethers wallet with signTransaction, signMessage and getAddress methods
 * replaced with the Core instance ones and property address replaced with the address of the Core instance
 * @param core the Core instance that will be used to sign transactions and messages
 * @param httpProvider the http provider used to connect to the blockchain
 * @returns a proxified ethers wallet
 */
export const ethersWalletFromCore = ({
  core,
  httpProvider,
  chainId,
  gasStation,
}: {
  core: Core;
  httpProvider: string;
  chainId: Protocol['chainId'];
  gasStation?: GasStation;
}): Wallet => {
  return new CoreWallet(
    core,
    new UncheckedJsonRpcProvider(httpProvider, chainId, {
      batchMaxSize: 1,
    }),
    gasStation
  );
};

class CoreWallet extends Wallet {
  // Needed to instantiate a Wallet, not used, better performance wise than generating a random one each time
  private static readonly READ_ONLY_PRIVATE_KEY =
    '0x42a6d505e27450660adae0618ce3753b17dfd88d188202fd571a42a188b7cd08';

  constructor(
    private core: Core,
    provider: Provider,
    private gasStation?: GasStation
  ) {
    super(CoreWallet.READ_ONLY_PRIVATE_KEY, provider);
    this.overrideAddress();
  }

  private overrideAddress() {
    Object.defineProperty(this, 'address', {
      enumerable: true,
      value: this.core.getAddress(),
      writable: false,
    });
  }

  override async signTransaction(transaction: TransactionLike) {
    if (!this.core.signTransaction)
      throw new Error('signTransaction is not implemented in Core');
    const { signature } = await this.core.signTransaction(transaction);
    return signature;
  }

  override async signMessage(message: string) {
    const { signature } = await this.core.signMessage(message);
    return signature;
  }

  override async getAddress() {
    return this.core.getAddress();
  }

  override async sendTransaction(tx: TransactionRequest) {
    let gasPrice: bigint | null = null;

    if (!tx.gasPrice && this.gasStation) {
      try {
        gasPrice = await this.gasStation.getGasPrice();
      } catch {
        // NOOP
      }
    }

    if (this.core.sendTransaction) {
      return this.core.sendTransaction({
        ...tx,
        ...(gasPrice && { gasPrice }),
      });
    }

    return super.sendTransaction({
      ...tx,
      ...(gasPrice && { gasPrice }),
    });
  }
}

class UncheckedJsonRpcProvider extends JsonRpcProvider {
  /**
   * Broadcast a transaction without checking that output hash is the computed hash
   * (this is needed for our relayed claim mechanism, as the output hash is NOT the computed
   * hash by design since a new transaction is forged)
   * */
  override async broadcastTransaction(
    signedTx: string
  ): Promise<TransactionResponse> {
    const { blockNumber, hash, network } = await resolveProperties({
      blockNumber: this.getBlockNumber(),
      hash: this._perform({
        method: 'broadcastTransaction',
        signedTransaction: signedTx,
      }),
      network: this.getNetwork(),
    });

    const tx = Transaction.from(signedTx);

    Object.defineProperty(tx, 'hash', {
      enumerable: true,
      value: hash,
      writable: false,
    });

    return this._wrapTransactionResponse(
      <any>tx,
      network
    ).replaceableTransaction(blockNumber);
  }
}
