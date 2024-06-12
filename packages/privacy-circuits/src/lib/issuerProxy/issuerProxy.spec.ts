/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ProtocolClientV1 } from '@arianee/arianee-protocol-client';
import { ProtocolDetailsV1 } from '@arianee/common-types';
import { Core } from '@arianee/core';
import { ZeroAddress } from 'ethers';

import { Prover } from '../prover';

describe('issuerProxy', () => {
  let core: Core;
  let prover: Prover;

  let mockProtocolV1: ProtocolClientV1;

  beforeAll(() => {
    core = Core.fromPrivateKey(
      '0x56cbf37399c2b170e098f12f6720ecf66e87a25feb20ccb9891f3145e7b5f0e0'
    );
    prover = new Prover({ core, useCreditNotePool: false });

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any,
      mockProtocolDetails,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any
    );
  });

  it('should throw if `Prover.init` was not called before using `Prover.issuerProxy`', () => {
    expect(() => {
      prover.issuerProxy;
    }).toThrowError('must call `Prover.init`');
  });

  describe('after `Prover.init` was called', () => {
    beforeAll(async () => {
      await prover.init();
    });

    it('should compute a commitment hash', async () => {
      const commitmentHashRes = await prover.issuerProxy.computeCommitmentHash({
        protocolV1: mockProtocolV1,
        tokenId: '123',
      });

      expect(commitmentHashRes).toBeDefined();
      expect(commitmentHashRes.commitmentHashAsStr).toBe(
        '2652870961255495342182117702851620041725895102271380010954073244293719616449'
      );
    });

    it('should compute an intent hash for `acceptEvent`', async () => {
      const intentHashRes = await prover.issuerProxy.computeIntentHash({
        protocolV1: mockProtocolV1,
        fragment: 'acceptEvent',
        values: [456, ZeroAddress],
        needsCreditNoteProof: false,
      });

      expect(intentHashRes).toBeDefined();
      expect(intentHashRes.intentHashAsStr).toBe(
        '9201098343524139513634960756263607417331964026843972394706360022151153323406'
      );
    });

    it('should compute an intent hash for `createMessage`', async () => {
      const intentHashRes = await prover.issuerProxy.computeIntentHash({
        protocolV1: mockProtocolV1,
        fragment: 'createMessage',
        values: [ZeroAddress, 789, 123, `0x${'00'.repeat(32)}`],
        needsCreditNoteProof: true,
      });

      expect(intentHashRes).toBeDefined();
      expect(intentHashRes.intentHashAsStr).toBe(
        '20906233059032000477416693345147302226173014334549097275189782287655475634837'
      );
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

      const proofRes = await prover.issuerProxy.generateProof({
        protocolV1: mockProtocolV1,
        tokenId: '123',
        intentHashAsStr,
      });
      expect(proofRes).toBeDefined();
      expect(proofRes.proof).toBeDefined();
      expect(proofRes.callData).toBeDefined();

      const { commitmentHashAsStr } =
        await prover.issuerProxy.computeCommitmentHash({
          protocolV1: mockProtocolV1,
          tokenId: '123',
        });
      expect(proofRes.publicSignals[0]).toBe(commitmentHashAsStr);
      expect(proofRes.publicSignals[1]).toBe(intentHashAsStr);
      expect(Number(proofRes.publicSignals[2])).not.toBeNaN();
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

      const { proof, publicSignals } = await prover.issuerProxy.generateProof({
        protocolV1: mockProtocolV1,
        tokenId: '123',
        intentHashAsStr,
      });

      const isValid = await prover.issuerProxy.verifyProof({
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

      const { proof, publicSignals } = await prover.issuerProxy.generateProof({
        protocolV1: mockProtocolV1,
        tokenId: '123',
        intentHashAsStr,
      });
      // Modify the proof
      proof.pi_a[0] = proof.pi_a[0].slice(0, -3) + '123';
      proof.pi_b[2][0] = proof.pi_b[0][0].slice(0, -3) + '456';
      proof.pi_c[1] = proof.pi_c[0].slice(0, -3) + '789';

      const isValid = await prover.issuerProxy.verifyProof({
        proof,
        publicSignals,
      });
      expect(isValid).toBeFalsy();
    });
  });
});
