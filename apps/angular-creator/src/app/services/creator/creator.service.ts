import { Injectable } from '@angular/core';
import Creator from '@arianee/creator';
import Core from '@arianee/core';

@Injectable({
  providedIn: 'root',
})
export class CreatorService {
  private _creator?: Creator;

  public get connected() {
    return this._creator?.connected || false;
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

    this._creator = new Creator({
      core,
      creatorAddress,
    });

    await this._creator.connect(slug);
    return this._creator;
  }
}
