import Core from '@arianee/core';
import { ethersWalletFromCore } from './ethersCustom';
import { TransactionResponse, ethers } from 'ethers';

const MNEMONIC =
  'icon hawk eight machine ball fold acoustic boring lady jacket silly secret';
const ADDRESS = '0x85014957FA3EF8C30B5fDe2592e909469728c9F3'; // public address of the mnemonic above

describe('ethersWalletFromCore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an ethers wallet with methods overridden with the Core ones', async () => {
    const core = Core.fromMnemonic(MNEMONIC);

    const coreWallet = ethersWalletFromCore(core, 'https://localhost:8545', 1);

    const ethersWallet = ethers.Wallet.fromPhrase(MNEMONIC);

    const expectedMessageSignature = await ethersWallet.signMessage(
      'hello world'
    );
    const profixiedMessageSignature = await coreWallet.signMessage(
      'hello world'
    );

    const expectedTransactionSignature = await ethersWallet.signTransaction({
      type: 1,
    });

    const profixiedTransactionSignature = await coreWallet.signTransaction({
      type: 1,
    });

    expect(profixiedMessageSignature).toEqual(expectedMessageSignature);
    expect(profixiedTransactionSignature).toBe(expectedTransactionSignature);
    expect(coreWallet.address).toBe(ADDRESS);
    expect(await coreWallet.getAddress()).toBe(ADDRESS);
  });

  it.each([
    {
      chainId: 77, // sokol
      expectedType: 0,
    },
    {
      chainId: 99, // poa
      expectedType: 0,
    },
    {
      chainId: 1,
      expectedType: undefined,
    },
  ])(
    'should add type 0 to the transaction if the chain id is sokol or poa',
    async ({ chainId, expectedType }) => {
      jest.mock('ethers');

      const core = Core.fromMnemonic(MNEMONIC);

      const coreWallet = ethersWalletFromCore(
        core,
        'https://localhost:8545',
        chainId
      );

      const spy = jest
        .spyOn(ethers.Wallet.prototype, 'sendTransaction')
        .mockResolvedValue({} as unknown as TransactionResponse);

      await coreWallet.sendTransaction({
        to: '0x85014957FA3EF8C30B5fDe2592e909469728c9F3',
      });

      expect(spy).toHaveBeenCalledWith({
        to: '0x85014957FA3EF8C30B5fDe2592e909469728c9F3',
        type: expectedType,
      });

      jest.unmock('ethers');
    }
  );
});
