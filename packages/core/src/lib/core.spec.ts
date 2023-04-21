import { Core } from './core';

describe('core', () => {
  it('from private key', async () => {
    const core = Core.fromPrivateKey(
      '0x353eb24be50ce3a8b8dc2518733625c66aa1b773b05913846f9c77bdad1ecd42'
    );
    const signature = await core.signMessage('hello');
    expect(signature.signature).toEqual(
      '0x9a7468e4e52fa4f3c41dbe56b1473914fc5e117d9de5a5041d2ea60c32fceb63600a968e087e06736e6e343ecb31bad668b0d2cabdf34e4ab35b67adea2cc1ad1c'
    );
    expect(signature.message).toEqual('hello');
  });

  it('should throw an error if private key is invalid', async () => {
    try {
      Core.fromPrivateKey('wrong private key');
      expect(true).toEqual(false);
    } catch (e) {
      expect(true).toEqual(true);
    }
  });

  it('from mnemonic', async () => {
    const core = Core.fromMnemonic(
      'between pulse elite special cinnamon poem gauge rhythm book sorry collect consider'
    );
    const signature = await core.signMessage('hello');
    expect(signature.signature).toEqual(
      '0x520ea8c1ef83e84474d0daf943df40c639bba0fa73a284be5390312fbe4030252aaccf6512ec8e900637a7df3db4101361a764f42c4e7f42c5db479efa7084f31c'
    );
    expect(signature.message).toEqual('hello');
  });

  it('should throw an error if mnemonic is invalid', async () => {
    try {
      Core.fromMnemonic('wrong private mnemonics');
      expect(true).toEqual(false);
    } catch (e) {
      expect(true).toEqual(true);
    }
  });

  it('from passphrase utf8', async () => {
    const core = Core.fromPassPhrase('test');
    expect(core.getAddress()).toEqual(
      '0x43356BFEec01583dfE787E3D1FA319AE069C1e98'
    );
    const signature = await core.signMessage('hello');
    expect(signature.signature).toEqual(
      '0x81aaaca0ec53c2170a2db3acf06eb00648e9427fa46903852465dcd2bea454862c04d956586bf0dd10b0e71567b259f7e1b10cc97b247c9d2b854ef4d467841a1b'
    );
  });

  it('from passphrase number big', async () => {
    const core = Core.fromPassPhrase(1234567890);
    expect(core.getAddress()).toEqual(
      '0x75416b6b372c3a1121C3B1BA80170d87F59603B7'
    );
    const signature = await core.signMessage('hello');
    expect(signature.signature).toEqual(
      '0xb5ef6878470b89a386b4867ce46dd17b0185b5c33612ad7d9c8e61a6a19bcdbf249ec7e165ebba35eae0f020c8120b2846d49e7c73a843860297e8f830ff5bce1b'
    );
  });

  it('from passphrase number small', async () => {
    const core = Core.fromPassPhrase(1234);
    expect(core.getAddress()).toEqual(
      '0xD60349c24dB7F1053086eF0D6364b64B1e0313f0'
    );
    const signature = await core.signMessage('hello');
    expect(signature.signature).toEqual(
      '0xebd1a9894316607e539d057a8096eea2064ede4e9d4ab63a00542d086842ffc67186b9e8101387174f1959909b2f1231c401b07e77981f89af498e234cf4f7101c'
    );
  });

  it('from random', async () => {
    const core = Core.fromRandom();
    expect(core.getAddress()).toBeDefined();
  });
});
