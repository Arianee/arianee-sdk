import { Injectable } from '@angular/core';
import Wallet from '@arianee/wallet';
import { ChainType } from '@arianee/common-types';
import { BehaviorSubject, Subject } from 'rxjs';
import Core from '@arianee/core';
import WalletApiClient from '@arianee/wallet-api-client';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private wallets: Record<ChainType, Wallet<ChainType>>;

  private _wallet: BehaviorSubject<Wallet<ChainType>>;
  private _chainType!: ChainType;

  constructor() {
    const mnemonic =
      'sunset setup moral spoil stomach flush document expand rent siege perfect gauge';

    const apiURL = 'http://127.0.0.1:3000/';

    const core = Core.fromMnemonic(mnemonic);

    this.wallets = {
      mainnet: new Wallet({
        chainType: 'mainnet',
        auth: {
          core,
        },
        walletAbstraction: new WalletApiClient('mainnet', core, {
          apiURL,
        }),
      }),
      testnet: new Wallet({
        chainType: 'testnet',
        auth: { mnemonic },
        walletAbstraction: new WalletApiClient('testnet', core, {
          apiURL,
        }),
      }),
    };

    this._wallet = new BehaviorSubject(this.wallets.testnet);

    this.switchChainType('testnet');
  }

  public get wallet() {
    return this._wallet.pipe();
  }

  public get chainType() {
    return this._chainType;
  }

  public switchChainType(chainType: ChainType) {
    this._chainType = chainType;
    this._wallet.next(this.wallets[chainType]);
  }
}
