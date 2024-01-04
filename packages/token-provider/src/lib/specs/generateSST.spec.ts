import {
  ArianeeAccessToken,
  SmartAssetSharingTokenPayload,
} from '@arianee/arianee-access-token';
import Core from '@arianee/core';
import { toDeadline } from '@arianee/permit721-sdk';
import Wallet from '@arianee/wallet';

import * as tokenProviderModule from '../token-provider';

const PRIVATE_KEY =
  '0xe6963e7d7ce3f10373417abfc802aa781c432c309b2233f31e7c6c2edb198225'; //  0xD75f91b003D53ACf804049ead52661a28868bcCE

const SPENDER = '0x87c12DE015Ba6bbbd2c4e88Fb3DD4d98B8b2e193';

describe('generateSST', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a SST', async () => {
    const core = Core.fromPrivateKey(PRIVATE_KEY);
    const wallet = new Wallet({ auth: { core } });

    const approvePermit721Spy = jest.spyOn(
      tokenProviderModule,
      'approvePermit721'
    );

    const smartAsset = await wallet.smartAsset.get('testnet', {
      id: '467440080',
    });

    const sst = await tokenProviderModule.generateSST({
      core,
      smartAsset: smartAsset.data,
      spender: SPENDER,
      deadline: toDeadline(/* 7 days= */ 1000 * 60 * 60 * 24 * 7),
      nonce: 123456789,
    });

    const payload = ArianeeAccessToken.decodeJwt(sst)
      .payload as unknown as Required<SmartAssetSharingTokenPayload>;

    expect(payload.iss).toEqual('0xD75f91b003D53ACf804049ead52661a28868bcCE');

    const deadlineDuration =
      parseInt(payload.permit.deadline.toString()) - Date.now() / 1000;

    const expectedDeadlineDuration = 60 * 60 * 24 * 7;

    expect(deadlineDuration).toBeLessThan(expectedDeadlineDuration);
    expect(deadlineDuration).toBeGreaterThan(expectedDeadlineDuration - 3);

    expect(payload.permit.spender).toEqual(SPENDER);
    expect(payload.permit.nonce).toEqual(123456789);
    expect(payload.permit.permitted.tokenId).toEqual(467440080);
    expect(payload.permit.permitted.token).toEqual(
      '0x512C1FCF401133680f373a386F3f752b98070BC5'
    ); // arianee testnet smart asset contract

    expect(payload.sub).toEqual('certificate');
    expect(payload.network).toEqual('testnet');

    expect(approvePermit721Spy).toHaveBeenCalledWith({
      core,
      tokenId: '467440080',
      protocolName: 'testnet',
      permit721Address: '0x9d6ac3167db03d0b0aee75f5ed90c8b780f93585',
    });
  });
});
