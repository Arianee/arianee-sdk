import Core from '@arianee/core';
import { ethersWalletFromCore } from './ethersCustom';
import { TransactionResponse, ethers } from 'ethers';
import GasStation from '../gasStation/gasStation';

jest.mock('../gasStation/gasStation');

const MNEMONIC =
  'icon hawk eight machine ball fold acoustic boring lady jacket silly secret';
const ADDRESS = '0x85014957FA3EF8C30B5fDe2592e909469728c9F3'; // public address of the mnemonic above

describe('ethersWalletFromCore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an ethers wallet with methods overridden with the Core ones', async () => {
    const core = Core.fromMnemonic(MNEMONIC);

    const coreWallet = ethersWalletFromCore({
      core,
      httpProvider: 'https://localhost:8545',
      chainId: 1,
    });

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

  describe('CoreWallet', () => {
    beforeEach(() => {
      jest.mock('ethers');
    });

    afterEach(() => {
      jest.unmock('ethers');
    });

    it.each([
      {
        tx: {
          to: '0x85014957FA3EF8C30B5fDe2592e909469728c9F3',
          gasPrice: BigInt(123),
        },
        expectedGasPrice: BigInt(123),
        getGasPriceCalled: false,
      },
      {
        tx: { to: '0x85014957FA3EF8C30B5fDe2592e909469728c9F3' },
        expectedGasPrice: BigInt(1),
        getGasPriceCalled: true,
      },
    ])(
      'should fetch from the gas station if set and if gas price not yet set in the transaction',
      async ({ tx, expectedGasPrice, getGasPriceCalled }) => {
        const core = Core.fromMnemonic(MNEMONIC);

        const gasStation = new GasStation('https://gasStation.com/', jest.fn());

        const coreWallet = ethersWalletFromCore({
          core,
          httpProvider: 'https://localhost:8545',
          chainId: 1,
          gasStation,
        });

        const getGasPriceSpy = jest
          .spyOn(gasStation, 'getGasPrice')
          .mockResolvedValue(BigInt(1));

        const sendTransactionSpy = jest
          .spyOn(ethers.Wallet.prototype, 'sendTransaction')
          .mockResolvedValue({} as unknown as TransactionResponse);

        await coreWallet.sendTransaction(tx);

        expect(sendTransactionSpy).toHaveBeenCalledWith({
          to: '0x85014957FA3EF8C30B5fDe2592e909469728c9F3',
          gasPrice: expectedGasPrice,
        });

        expect(getGasPriceSpy).toHaveBeenCalledTimes(getGasPriceCalled ? 1 : 0);
      }
    );

    it('should work even if the gas station fails (should not set gasPrice in that case)', async () => {
      const core = Core.fromMnemonic(MNEMONIC);

      const gasStation = new GasStation('https://gasStation.com/', jest.fn());

      const coreWallet = ethersWalletFromCore({
        core,
        httpProvider: 'https://localhost:8545',
        chainId: 1,
        gasStation,
      });

      const getGasPriceSpy = jest
        .spyOn(gasStation, 'getGasPrice')
        .mockRejectedValue(new Error('error'));

      const sendTransactionSpy = jest
        .spyOn(ethers.Wallet.prototype, 'sendTransaction')
        .mockResolvedValue({} as unknown as TransactionResponse);

      await coreWallet.sendTransaction({
        to: '0x85014957FA3EF8C30B5fDe2592e909469728c9F3',
      });

      expect(sendTransactionSpy).toHaveBeenCalledWith({
        to: '0x85014957FA3EF8C30B5fDe2592e909469728c9F3',
      });

      expect(getGasPriceSpy).toHaveBeenCalledTimes(1);
    });
  });
});
