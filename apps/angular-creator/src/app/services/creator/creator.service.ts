import { Injectable } from '@angular/core';
import Creator from '@arianee/creator';
import Core from '@arianee/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CreatorService {
  private _creator: BehaviorSubject<Creator | null> =
    new BehaviorSubject<Creator | null>(null);

  public get connected() {
    return this._creator.getValue()?.connected || false;
  }

  public get creator() {
    return this._creator;
  }

  public async connect(
    auth: { privateKey: string } | { mnemonic: string },
    creatorAddress: string,
    slug: string
  ) {
    let core: Core;

    if ('privateKey' in auth) core = Core.fromPrivateKey(auth.privateKey);
    else if ('mnemonic' in auth) core = Core.fromMnemonic(auth.mnemonic);
    else throw new Error('auth should be privateKey or mnemonic');

    this._creator.next(
      new Creator({
        core,
        creatorAddress,
      })
    );

    await this._creator.getValue()?.connect(slug);
    return this.creator;
  }
}
