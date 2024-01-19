import { ArianeeApiClient } from '@arianee/arianee-api-client';

import {
  ProofCreatorIsNotOwnerError,
  ProofExpiredError,
  ProofKeyNotValidError,
} from './errors';
import * as isProofValidFromLinkModule from './isProofValidFromLink';

jest.mock('@arianee/arianee-api-client');

const owner = '0xabcdef';
const issuer = '0xffffff';
const idToNft = {
  123456: {
    events: [],
    tokenId: '123456',
    network: 'testnet',
    owner,
    issuer,
    createAt: '2021-01-01',
    updatedAt: '2021-01-01',
    imprint: '0x000000000',
    requestKey: '0x000000000',
    viewKey: '0x000000000',
    proofKey: '0x000000000',
    tokenRecoveryTimestamp: '123456789',
  },
};

const isProofPassphraseValidSpy = jest.spyOn(
  isProofValidFromLinkModule,
  'isProofPassphraseValid'
);

const isProofExpiredSpy = jest.spyOn(
  isProofValidFromLinkModule,
  'isProofExpired'
);
const isProofCreatedByCurrentOwnerSpy = jest.spyOn(
  isProofValidFromLinkModule,
  'isProofCreatedByCurrentOwner'
);
const getLastTokenAccessAddedEventForSpy = jest.spyOn(
  isProofValidFromLinkModule,
  'getLastTokenAccessAddedEventFor'
);

const getNftSpy = jest.fn();

Object.defineProperty(ArianeeApiClient.prototype, 'network', {
  value: {
    getNft: getNftSpy,
  },
});

describe('isProofValidFromLink', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be valid if the address derived from passphrase equals the viewkey, the proof has not expired and the smart asset owner is the proof creator', async () => {
    const passphrase = 'abcdef';
    const tokenId = '123456';
    const proofLink = `https://test.arian.ee/proof/${tokenId},${passphrase}`;
    const arianeeApiUrl = 'https://api.arianee.org/';
    const lastTokenAccessAddedEvent = {} as any;

    getNftSpy.mockResolvedValue(idToNft[123456]);
    isProofPassphraseValidSpy.mockResolvedValue(true);
    getLastTokenAccessAddedEventForSpy.mockResolvedValue(
      lastTokenAccessAddedEvent
    );
    isProofExpiredSpy.mockResolvedValue(false);
    isProofCreatedByCurrentOwnerSpy.mockResolvedValue(true);

    const isValid = await isProofValidFromLinkModule.isProofValidFromLink(
      proofLink,
      { arianeeApiUrl }
    );

    expect(ArianeeApiClient).toHaveBeenCalledWith(arianeeApiUrl);
    expect(getNftSpy).toHaveBeenCalledWith('testnet', '123456', true);
    expect(isValid).toBe(true);

    expect(isProofExpiredSpy).toHaveBeenCalledWith({
      lastTokenAccessAddedEvent,
    });

    expect(isProofPassphraseValidSpy).toHaveBeenCalledWith({
      passphrase,
      nft: idToNft[123456],
    });

    expect(getLastTokenAccessAddedEventForSpy).toHaveBeenCalledWith({
      network: 'testnet',
      certificateId: '123456',
      proofKey: idToNft[123456].proofKey,
      arianeeApiClient: expect.any(ArianeeApiClient),
      proofValidityWindow: 259200,
    });

    expect(isProofCreatedByCurrentOwnerSpy).toHaveBeenCalledWith({
      lastTokenAccessAddedEvent,
      network: 'testnet',
      nft: idToNft[123456],
    });
  });

  it('should throw if the passphrase is not valid', async () => {
    const passphrase = 'abcdef';
    const tokenId = '123456';
    const proofLink = `https://test.arian.ee/proof/${tokenId},${passphrase}`;
    const arianeeApiUrl = 'https://api.arianee.org/';

    getNftSpy.mockResolvedValue(idToNft[123456]);
    isProofPassphraseValidSpy.mockResolvedValue(false);

    expect(
      isProofValidFromLinkModule.isProofValidFromLink(proofLink, {
        arianeeApiUrl,
      })
    ).rejects.toThrow(ProofKeyNotValidError);
  });

  it('should throw if the proof creator is not the proof owner', async () => {
    const passphrase = 'abcdef';
    const tokenId = '123456';
    const proofLink = `https://test.arian.ee/proof/${tokenId},${passphrase}`;
    const arianeeApiUrl = 'https://api.arianee.org/';

    getNftSpy.mockResolvedValue(idToNft[123456]);
    isProofPassphraseValidSpy.mockResolvedValue(true);
    isProofCreatedByCurrentOwnerSpy.mockResolvedValue(false);

    expect(
      isProofValidFromLinkModule.isProofValidFromLink(proofLink, {
        arianeeApiUrl,
      })
    ).rejects.toThrow(ProofCreatorIsNotOwnerError);
  });

  it('should throw if the proof is expired', async () => {
    const passphrase = 'abcdef';
    const tokenId = '123456';
    const proofLink = `https://test.arian.ee/proof/${tokenId},${passphrase}`;
    const arianeeApiUrl = 'https://api.arianee.org/';

    getNftSpy.mockResolvedValue(idToNft[123456]);
    isProofPassphraseValidSpy.mockResolvedValue(true);
    isProofCreatedByCurrentOwnerSpy.mockResolvedValue(true);
    isProofExpiredSpy.mockResolvedValue(true);

    expect(
      isProofValidFromLinkModule.isProofValidFromLink(proofLink, {
        arianeeApiUrl,
      })
    ).rejects.toThrow(ProofExpiredError);
  });
});
