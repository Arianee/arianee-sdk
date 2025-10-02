import { GasStation } from '@arianee/common-types';
import Core from '@arianee/core';
import { ethers, TransactionResponse } from 'ethers';

import {
  CoreWallet,
  ethersWalletFromCore,
  UncheckedJsonRpcProvider,
} from './ethersCustom';

jest.mock('@arianee/common-types', () => {
  const originalCommonTypes = jest.requireActual('@arianee/common-types');
  return {
    ...originalCommonTypes,
    GasStation: jest.fn().mockImplementation(() => {
      return { getGasPrice: jest.fn() };
    }),
  };
});

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

        const provider = new UncheckedJsonRpcProvider(
          'https://localhost:8545',
          1,
          {
            batchMaxSize: 1,
          }
        );

        const coreWallet = new CoreWallet(core, provider, gasStation);

        const getGasPriceSpy = jest
          .spyOn(gasStation, 'getGasPrice')
          .mockResolvedValue(BigInt(1));

        const getNetwork = jest
          .spyOn(provider, 'getNetwork')
          .mockResolvedValue({ chainId: BigInt(1) } as any);

        const sendTransactionSpy = jest
          .spyOn(ethers.Wallet.prototype, 'sendTransaction')
          .mockResolvedValue({} as unknown as TransactionResponse);

        await coreWallet.sendTransaction(tx);

        expect(sendTransactionSpy).toHaveBeenCalledWith({
          chainId: BigInt(1),
          to: '0x85014957FA3EF8C30B5fDe2592e909469728c9F3',
          gasPrice: expectedGasPrice,
        });

        expect(getGasPriceSpy).toHaveBeenCalledTimes(getGasPriceCalled ? 1 : 0);
      }
    );

    it('should work even if the gas station fails (should not set gasPrice in that case)', async () => {
      const core = Core.fromMnemonic(MNEMONIC);

      const gasStation = new GasStation('https://gasStation.com/', jest.fn());

      const provider = new UncheckedJsonRpcProvider(
        'https://localhost:8545',
        1,
        {
          batchMaxSize: 1,
        }
      );
      const coreWallet = new CoreWallet(core, provider, gasStation);

      const getGasPriceSpy = jest
        .spyOn(gasStation, 'getGasPrice')
        .mockRejectedValue(new Error('error'));

      const getNetwork = jest
        .spyOn(provider, 'getNetwork')
        .mockResolvedValue({ chainId: BigInt(1) } as any);

      const sendTransactionSpy = jest
        .spyOn(ethers.Wallet.prototype, 'sendTransaction')
        .mockResolvedValue({} as unknown as TransactionResponse);

      await coreWallet.sendTransaction({
        to: '0x85014957FA3EF8C30B5fDe2592e909469728c9F3',
      });

      expect(sendTransactionSpy).toHaveBeenCalledWith({
        chainId: BigInt(1),
        to: '0x85014957FA3EF8C30B5fDe2592e909469728c9F3',
      });

      expect(getGasPriceSpy).toHaveBeenCalledTimes(1);
    });

    it('should timeout after 5 seconds when estimateGas takes too long', async () => {
      const core = Core.fromMnemonic(MNEMONIC);
      const provider = new UncheckedJsonRpcProvider(
        'https://localhost:8545',
        1,
        {
          batchMaxSize: 1,
        }
      );
      const coreWallet = new CoreWallet(core, provider);

      // Mock estimateGas to never resolve (simulating a hanging call)
      const estimateGasSpy = jest
        .spyOn(ethers.Wallet.prototype, 'estimateGas')
        .mockImplementation(
          () =>
            new Promise(() => {
              return 'not empty';
            })
        ); // Never resolves

      const tx = {
        to: '0x85014957FA3EF8C30B5fDe2592e909469728c9F3',
        value: BigInt(1000),
      };

      const startTime = Date.now();

      await expect(coreWallet.estimateGas(tx)).rejects.toThrow('estimateGas');

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should timeout after approximately 5 seconds (allow some tolerance)
      expect(duration).toBeGreaterThanOrEqual(4900); // At least 4.9 seconds
      expect(duration).toBeLessThan(6000); // Less than 6 seconds

      expect(estimateGasSpy).toHaveBeenCalledWith({
        to: '0x85014957FA3EF8C30B5fDe2592e909469728c9F3',
        value: BigInt(1000),
      });
    }, 10000); // Increase Jest timeout to 10 seconds

    it('should not mutate the original transaction object', async () => {
      const core = Core.fromMnemonic(MNEMONIC);
      const provider = new UncheckedJsonRpcProvider(
        'https://localhost:8545',
        1,
        {
          batchMaxSize: 1,
        }
      );
      const coreWallet = new CoreWallet(core, provider);

      const estimateGasSpy = jest
        .spyOn(ethers.Wallet.prototype, 'estimateGas')
        .mockResolvedValue(BigInt(21000));

      const originalTx = {
        to: '0x85014957FA3EF8C30B5fDe2592e909469728c9F3',
        value: BigInt(1000),
        gasPrice: BigInt(20000000000),
        gasLimit: BigInt(21000),
        maxFeePerGas: BigInt(20000000000),
        maxPriorityFeePerGas: BigInt(1000000000),
      };

      await coreWallet.estimateGas(originalTx);

      // Original transaction should remain unchanged
      expect(originalTx).toEqual({
        to: '0x85014957FA3EF8C30B5fDe2592e909469728c9F3',
        value: BigInt(1000),
        gasPrice: BigInt(20000000000),
        gasLimit: BigInt(21000),
        maxFeePerGas: BigInt(20000000000),
        maxPriorityFeePerGas: BigInt(1000000000),
      });

      // But the cleaned transaction passed to estimateGas should have gas fields removed
      expect(estimateGasSpy).toHaveBeenCalledWith({
        to: '0x85014957FA3EF8C30B5fDe2592e909469728c9F3',
        value: BigInt(1000),
      });
    });
  });
});
