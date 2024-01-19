import { ArianeeApiClient, smartAssetInfo } from '@arianee/arianee-api-client';
import ArianeeProtocolClient from '@arianee/arianee-protocol-client';
import {
  TokenAccessType,
  UnnestedBlockchainEvent,
} from '@arianee/common-types';
import Core from '@arianee/core';
import { protocolNameToChainType, readLink } from '@arianee/utils';

import {
  NotAProofLinkError,
  ProofCreatorIsNotOwnerError,
  ProofExpiredError,
  ProofKeyNotFoundError,
  ProofKeyNotValidError,
} from './errors';

/**
 * Checks whether the passed proof link is valid or not (not expired, created by the current owner, and the proof key is the current proof key)
 * @param proofLink the link to check validity of
 * @param params
 * @param params.arianeeApiUrl (optional) url of arianee api
 * @param params.proofValidityWindow (optional) validity window of the proof in seconds (default: 3 days)
 * @returns true if the proof is valid, throws an error with more details about the invalidity of the proof otherwise
 */
export const isProofValidFromLink = async (
  proofLink: string,
  params?: { arianeeApiUrl?: string; proofValidityWindow?: number }
) => {
  const { certificateId, passphrase, network, method } = readLink(proofLink);
  const proofValidityWindow = params?.proofValidityWindow ?? 86400 * 3;

  if (method !== 'proof') throw new NotAProofLinkError('Not a proof link');
  if (!passphrase)
    throw new ProofKeyNotFoundError('No passphrase found in proof link');

  const arianeeApiClient = new ArianeeApiClient(params?.arianeeApiUrl);
  const nft = await arianeeApiClient.network.getNft(
    network,
    certificateId,
    true
  );

  const _isProofPassphraseValid = await isProofPassphraseValid({
    passphrase,
    nft,
  });

  if (!_isProofPassphraseValid)
    throw new ProofKeyNotValidError(
      'The proof key does not correspond to the current nft proof key'
    );

  const lastTokenAccessAddedEvent = await getLastTokenAccessAddedEventFor({
    network,
    certificateId,
    proofKey: nft.proofKey!,
    arianeeApiClient,
    proofValidityWindow,
  });

  const _isProofExpired = await isProofExpired({
    lastTokenAccessAddedEvent,
  });

  if (_isProofExpired) throw new ProofExpiredError('The proof is expired');

  const _isProofCreatedByCurrentOwner = await isProofCreatedByCurrentOwner({
    lastTokenAccessAddedEvent,
    network,
    nft,
  });

  if (!_isProofCreatedByCurrentOwner)
    throw new ProofCreatorIsNotOwnerError(
      'The proof creator is not the current smart asset owner'
    );

  return (
    _isProofPassphraseValid && _isProofCreatedByCurrentOwner && !_isProofExpired
  );
};

/**
 * Check that the public key derived from the passphrase is the current proof key
 */
export const isProofPassphraseValid = async ({
  passphrase,
  nft,
}: {
  passphrase: string;
  nft: smartAssetInfo;
}) => {
  if (!nft.proofKey)
    throw new ProofKeyNotFoundError(
      'Could not find proof key in NFT, cannot verify proof key validity'
    );

  const passphraseWallet = Core.fromPassPhrase(passphrase);

  return (
    passphraseWallet.getAddress().toLowerCase() === nft.proofKey.toLowerCase()
  );
};

/**
 * Check that the proof is not expired (not older than 3 days)
 */
export const isProofExpired = async ({
  lastTokenAccessAddedEvent,
}: {
  lastTokenAccessAddedEvent?: UnnestedBlockchainEvent;
}) => {
  /* since the lastTokenAccessAddedEvent is the last event of type TokenAcccessAdded
   * in the last 3 days, if undefined, it implies that the proof is older than 3 days and thus expired */
  if (!lastTokenAccessAddedEvent) return true;

  return false;
};

/**
 * Check that the proof was created by the current owner of the smart asset
 */
export const isProofCreatedByCurrentOwner = async ({
  nft,
  network,
  lastTokenAccessAddedEvent,
}: {
  nft: smartAssetInfo;
  network: string;
  lastTokenAccessAddedEvent?: UnnestedBlockchainEvent;
}) => {
  if (!nft.owner)
    throw new Error(
      'Could not find owner in NFT, cannot verify proof key and ownership matching'
    );

  if (!lastTokenAccessAddedEvent)
    throw new Error('Could not find TokenAccessAdded event');

  const arianeeProtocolClient = new ArianeeProtocolClient(Core.fromRandom());
  const instance = await arianeeProtocolClient.connect(network);
  const transaction = await instance.provider.getTransaction(
    lastTokenAccessAddedEvent.transactionHash
  );

  if (!transaction)
    throw new Error(
      'Could not retrieve transaction associated to the TokenAccessAdded event'
    );

  return transaction.from.toLowerCase() === nft.owner.toLowerCase();
};

/**
 * Get the last enabled TokenAccessAdded event for the current proof key, token id and token type
 */
export const getLastTokenAccessAddedEventFor = async ({
  arianeeApiClient,
  network,
  proofKey,
  proofValidityWindow,
  certificateId,
}: {
  network: string;
  proofKey: string;
  certificateId: string;
  proofValidityWindow: number;
  arianeeApiClient: ArianeeApiClient;
}): Promise<UnnestedBlockchainEvent | undefined> => {
  const events = await arianeeApiClient.multichain.getEvents(
    protocolNameToChainType(network),
    'ArianeeSmartAsset',
    'TokenAccessAdded',
    {
      returnValues: {
        _tokenId: certificateId,
      },
      network,
      createdAfter: new Date(
        Date.now() - proofValidityWindow * 1000
      ).toISOString(), // created in the last 3 days
    }
  );

  events
    .filter((event) => {
      return (
        event.returnValues['_tokenId'] === certificateId.toString() &&
        event.returnValues['_tokenType'] === TokenAccessType.proof.toString() &&
        (event.returnValues['_encryptedTokenKey'] as string).toLowerCase() ===
          proofKey.toLowerCase() &&
        event.returnValues['_enable'] === true
      );
    })
    .sort((a, b) => b.blockNumber - a.blockNumber);

  return events[0];
};
