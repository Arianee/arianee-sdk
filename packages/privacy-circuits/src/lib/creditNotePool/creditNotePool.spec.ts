/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Core } from '@arianee/core';
import { ProtocolClientV1 } from '@arianee/arianee-protocol-client';
import { ProtocolDetailsV1 } from '@arianee/common-types';
import { Prover } from '../prover';
import { Filter, ZeroAddress } from 'ethers';

interface MockLog {
  data: string;
  topics: string[];
}

describe('creditNotePool', () => {
  let core: Core;
  let prover: Prover;

  let mockLogs: MockLog[] = [];
  let mockProvider: { getLogs: (filter: Filter) => Promise<MockLog[]> };
  let mockProtocolV1: ProtocolClientV1;

  let purchasedTopic: string;

  beforeAll(async () => {
    core = Core.fromPrivateKey(
      '0x56cbf37399c2b170e098f12f6720ecf66e87a25feb20ccb9891f3145e7b5f0e0'
    );
    prover = new Prover({ core, useCreditNotePool: true });

    mockProvider = {
      getLogs: async () => {
        return mockLogs;
      },
    };

    const mockProtocolDetails: ProtocolDetailsV1 = {
      protocolVersion: '1.0',
      chainId: 77,
      httpProvider: 'https://sokol.arianee.net',
      gasStation: 'https://cert.arianee.net/gasStation/testnet.json',
      contractAdresses: {
        aria: '0xB81AFe27c103bcd42f4026CF719AF6D802928765',
        creditHistory: '0x9C868D9bf85CA649f219204D16d99A240cB1F011',
        eventArianee: '0x8e8de8fe625c376f6d4fb2fc351337268a73388b',
        identity: '0x6f5d3ac15576f0da108cde3b7bbbf8f89eb8e7b2',
        smartAsset: '0x512C1FCF401133680f373a386F3f752b98070BC5',
        store: '0x5360DbFF3546b920431A20268D2B5DFf8bF9b4dD',
        lost: '0x6f5d3ac15576f0da108cde3b7bbbf8f89eb8e7b2',
        whitelist: '0x3579669219DC20Aa79E74eEFD5fB2EcB0CE5fE0D',
        message: '0xadD562C6c8D8755E0FaB1c12705831E759b77D00',
        userAction: '0x6bDb54FB6227C360b95F9A08Fb670f8207D3476f',
        updateSmartAssets: '0x3ae108bF0Ee8bB9D810BfC80aC73394ee1509C7b',
        issuerProxy: '0xAbc11cB9d19DF123e41717FC7c8eBa18a4fFA75B',
        creditNotePool: '0xDef0dA91835f068f86a5782583Bc5fBF5FB71D07',
      },
      soulbound: false,
    };
    mockProtocolV1 = new ProtocolClientV1(
      { provider: mockProvider } as any,
      mockProtocolDetails,
      {} as any
    );

    const topicFilter = await mockProtocolV1
      .arianeeCreditNotePool!.filters.Purchased()
      .getTopicFilter();
    purchasedTopic = topicFilter.at(0) as string;
  });

  it('should throw if `Prover.init` was not called before using `Prover.creditNotePool`', () => {
    expect(() => {
      prover.creditNotePool;
    }).toThrowError('must call `Prover.init`');
  });

  describe('after `Prover.init` was called', () => {
    beforeAll(async () => {
      await prover.init();
    });

    it('should compute a commitment hash with pre-defined nullifier and commitment', async () => {
      const nullifier =
        BigInt(
          225419600084372919177771477098581908777493546797331974371994161892969007965
        );
      const secret =
        BigInt(
          2629704292272696733357979480643425354687872034244798833018070660373019489
        );

      const commitmentHashRes =
        await prover.creditNotePool.computeCommitmentHash({
          nullifier,
          secret,
          protocolV1: mockProtocolV1,
          creditType: 1,
          issuerProxy: ZeroAddress,
        });

      expect(commitmentHashRes).toBeDefined();
      expect(commitmentHashRes.nullifier).toBe(nullifier);
      expect(commitmentHashRes.secret).toBe(secret);
      expect(commitmentHashRes.commitmentHashAsStr).toBe(
        '5832339015184359478215187071172511832509829872380202138561005740931628655900'
      );
    });

    it('should compute a commitment hash without pre-defined nullifier and commitment', async () => {
      const commitmentHashRes =
        await prover.creditNotePool.computeCommitmentHash({
          protocolV1: mockProtocolV1,
          creditType: 1,
          issuerProxy: ZeroAddress,
        });

      expect(commitmentHashRes).toBeDefined();
      expect(commitmentHashRes.nullifier).toEqual(expect.any(BigInt));
      expect(commitmentHashRes.secret).toEqual(expect.any(BigInt));
      expect(commitmentHashRes.commitmentHashAsStr).toBeDefined();
      expect(commitmentHashRes.commitmentHashAsStr).toEqual(expect.any(String));
    });

    it('should generate a proof', async () => {
      const { intentHashAsStr } = await prover.issuerProxy.computeIntentHash({
        protocolV1: mockProtocolV1,
        fragment: 'createEvent',
        values: [
          ZeroAddress,
          123,
          456,
          `0x${'00'.repeat(32)}`,
          'https://example.com',
          ZeroAddress,
        ],
        needsCreditNoteProof: true,
      });

      const nullifier =
        BigInt(
          225419600084372919177771477098581908777493546797331974371994161892969007965
        );
      const nullifierDerivationIndex = BigInt(1);
      const secret =
        BigInt(
          2629704292272696733357979480643425354687872034244798833018070660373019489
        );
      const creditType = 1;
      const issuerProxy = ZeroAddress;

      const { commitmentHashAsHex } =
        await prover.creditNotePool.computeCommitmentHash({
          nullifier,
          secret,
          protocolV1: mockProtocolV1,
          creditType,
          issuerProxy,
        });

      // Mock the logs so the sdk can reconstruct the merkle tree
      const leafIndex = 0;
      const timestamp = Math.floor(Date.now() / 1000);
      mockLogs = [
        {
          ...(mockProtocolV1.arianeeCreditNotePool?.interface.encodeEventLog(
            'Purchased',
            [creditType, commitmentHashAsHex, leafIndex, issuerProxy, timestamp]
          ) as unknown as MockLog),
        },
      ];

      const proofRes = await prover.creditNotePool.generateProof({
        protocolV1: mockProtocolV1,
        nullifier,
        nullifierDerivationIndex,
        secret,
        creditType,
        intentHashAsStr,
        issuerProxy,
        performValidation: false, // NOTE: We don't perform any validation here (neither on-chain nor off-chain)
      });
      expect(proofRes).toBeDefined();
      expect(proofRes.proof).toBeDefined();
      expect(proofRes.callData).toBeDefined();

      const { nullifierHashAsStr } =
        await prover.creditNotePool.computeNullifierHash({
          protocolV1: mockProtocolV1,
          nullifier,
          nullifierDerivationIndex,
        });
      expect(proofRes.publicSignals[0]).toBeDefined();
      expect(Number(proofRes.publicSignals[1])).toBe(creditType);
      expect(Number(proofRes.publicSignals[2])).toBe(Number(issuerProxy));
      expect(proofRes.publicSignals[3]).toBe(nullifierHashAsStr);
      expect(proofRes.publicSignals[4]).toBe(intentHashAsStr);
    });

    it('should mark a valid proof as valid', async () => {
      const { intentHashAsStr } = await prover.issuerProxy.computeIntentHash({
        protocolV1: mockProtocolV1,
        fragment: 'createEvent',
        values: [
          ZeroAddress,
          123,
          456,
          `0x${'00'.repeat(32)}`,
          'https://example.com',
          ZeroAddress,
        ],
        needsCreditNoteProof: true,
      });

      const nullifier =
        BigInt(
          225419600084372919177771477098581908777493546797331974371994161892969007965
        );
      const nullifierDerivationIndex = BigInt(1);
      const secret =
        BigInt(
          2629704292272696733357979480643425354687872034244798833018070660373019489
        );
      const creditType = 1;
      const issuerProxy = ZeroAddress;

      const { proof, publicSignals } =
        await prover.creditNotePool.generateProof({
          protocolV1: mockProtocolV1,
          nullifier,
          nullifierDerivationIndex,
          secret,
          creditType,
          intentHashAsStr,
          issuerProxy,
          performValidation: false, // NOTE: We don't perform any validation here (neither on-chain nor off-chain)
        });

      const isValid = await prover.creditNotePool.verifyProof({
        proof,
        publicSignals,
      });
      expect(isValid).toBeTruthy();
    });

    it('should not mark an invalid proof as valid', async () => {
      const { intentHashAsStr } = await prover.issuerProxy.computeIntentHash({
        protocolV1: mockProtocolV1,
        fragment: 'createEvent',
        values: [
          ZeroAddress,
          123,
          456,
          `0x${'00'.repeat(32)}`,
          'https://example.com',
          ZeroAddress,
        ],
        needsCreditNoteProof: true,
      });

      const nullifier =
        BigInt(
          225419600084372919177771477098581908777493546797331974371994161892969007965
        );
      const nullifierDerivationIndex = BigInt(1);
      const secret =
        BigInt(
          2629704292272696733357979480643425354687872034244798833018070660373019489
        );
      const creditType = 1;
      const issuerProxy = ZeroAddress;

      const { proof, publicSignals } =
        await prover.creditNotePool.generateProof({
          protocolV1: mockProtocolV1,
          nullifier,
          nullifierDerivationIndex,
          secret,
          creditType,
          intentHashAsStr,
          issuerProxy,
          performValidation: false, // NOTE: We don't perform any validation here (neither on-chain nor off-chain)
        });
      // Modify the proof
      proof.pi_a[0] = proof.pi_a[0].slice(0, -3) + '123';
      proof.pi_b[2][0] = proof.pi_b[0][0].slice(0, -3) + '456';
      proof.pi_c[1] = proof.pi_c[0].slice(0, -3) + '789';

      const isValid = await prover.creditNotePool.verifyProof({
        proof,
        publicSignals,
      });
      expect(isValid).toBeFalsy();
    });
  });
});
