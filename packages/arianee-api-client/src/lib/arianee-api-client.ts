import {
  ArianeeBrandIdentityI18N,
  blockchainEventsName,
  ChainType,
  Protocol,
  ProtocolDetails,
  SmartContractNames,
  UnnestedBlockchainEvent,
} from '@arianee/common-types';
import { defaultFetchLike } from '@arianee/utils';

import { ArianeeEvent } from './types/arianeeEvent';
import { blockchainEventFilters } from './types/blockchainEventFilters';
import { brandIdentityInfo } from './types/brandIdentityInfo';
import { decentralizedMessageInfo } from './types/decentralizedMessageInfo';
import { smartAssetInfo } from './types/smartAssetInfo';
import { contractNameToArianeeApiContractName } from './utils/contracts/contractName';
import { convertObjectToDotNotation } from './utils/dotNotation/dotNotation';

export class ArianeeApiClient {
  private fetchLike: typeof fetch;
  constructor(
    private readonly arianeeApiUrl?: string,
    fetchLike?: typeof fetch
  ) {
    this.fetchLike = fetchLike ?? defaultFetchLike;

    if (!arianeeApiUrl) {
      this.arianeeApiUrl = 'https://api.arianee.com';
    }
  }

  private fetchArianeeApi = async (path: string, errorMessage?: string) => {
    try {
      const response = await this.fetchLike(this.arianeeApiUrl + path);

      if (!response.ok) {
        throw new Error(`${response.statusText}`);
      }

      return await response.json();
    } catch (e) {
      const message = errorMessage ?? 'fetch arianee api';
      throw new Error(`Failed to ${message}: ${(e as Error).message}`);
    }
  };

  public multichain = {
    getEvents: async (
      chainType: ChainType,
      smartContractName: SmartContractNames,
      eventName: blockchainEventsName,
      filters?: blockchainEventFilters
    ): Promise<UnnestedBlockchainEvent[]> => {
      const queryParams = filters
        ? '?' + convertObjectToDotNotation(filters)
        : '';

      const arianeeApiContractName =
        contractNameToArianeeApiContractName[smartContractName];

      return this.fetchArianeeApi(
        `/multichain/${chainType}/contract/${arianeeApiContractName}/${eventName}${queryParams}`,
        `fetch events on arianee api (${eventName}) ` + JSON.stringify(filters)
      );
    },
    getOwnedNfts: async (
      chainType: ChainType,
      address: string,
      populateEvents = true
    ): Promise<smartAssetInfo[]> => {
      return this.fetchArianeeApi(
        `/multichain/${chainType}/nft/${address}/list?populateEvent=${populateEvents}`,
        `fetch nfts on arianee api (${address} / ${chainType})`
      );
    },
    getReceivedMessages: async (
      chainType: ChainType,
      address: string
    ): Promise<decentralizedMessageInfo[]> => {
      return this.fetchArianeeApi(
        `/multichain/${chainType}/dmessage/${address}/list`,
        `fetch messages on arianee api (${address} / ${chainType})`
      );
    },
    getIdentity: async (
      address: string
    ): Promise<{ [protocolName: string]: brandIdentityInfo }> => {
      return this.fetchArianeeApi(
        `/identity/${address}`,
        `fetch identity on arianee api (${address})`
      );
    },
  };

  public network = {
    getEvents: async (
      chainId: string,
      contractAddress: string,
      eventName: blockchainEventsName,
      filters?: blockchainEventFilters
    ): Promise<UnnestedBlockchainEvent[]> => {
      const queryParams = filters
        ? '?' + convertObjectToDotNotation(filters)
        : '';
      return this.fetchArianeeApi(
        `/report/${chainId}/contract/${contractAddress}/${eventName}${queryParams}`,
        `fetch events on arianee api (${eventName}) ` + JSON.stringify(filters)
      );
    },
    countEvents: async (
      chainId: string,
      contractAddress: string,
      eventName: blockchainEventsName,
      filters?: blockchainEventFilters
    ): Promise<number> => {
      const queryParams = filters
        ? '?' + convertObjectToDotNotation(filters)
        : '';
      return this.fetchArianeeApi(
        `/report/${chainId}/contract/${contractAddress}/${eventName}/count${queryParams}`,
        `fetch count events on arianee api (${chainId} / ${contractAddress} / ${eventName})`
      );
    },
    getOwnedNfts: async (
      protocolName: Protocol['name'],
      address: string
    ): Promise<smartAssetInfo[]> => {
      return this.fetchArianeeApi(
        `/report/nft/${address}/list?network=${protocolName}`,
        `fetch owned nft on arianee api  (${address} / ${protocolName})`
      );
    },
    getNftOwner: async (
      protocolName: Protocol['name'],
      tokenId: string
    ): Promise<string> => {
      return this.fetchArianeeApi(
        `/report/nft/${protocolName}/ownerOf/${tokenId}`,
        `fetch nft's owner on arianee api  (${tokenId})`
      );
    },
    getNft: async (
      protocolName: Protocol['name'],
      tokenId: string,
      populateEvents = false
    ): Promise<smartAssetInfo> => {
      return this.fetchArianeeApi(
        `/report/nft/${protocolName}/${tokenId}?populateEvent=${populateEvents}`,
        `fetch nft on arianee api (${protocolName} / ${tokenId})`
      );
    },
    getNftArianeeEvents: async (
      protocolName: Protocol['name'],
      tokenId: string
    ): Promise<ArianeeEvent[]> => {
      return this.fetchArianeeApi(
        `/report/nft/${protocolName}/${tokenId}/arianeeEvents`,
        `fetch nft arianee events on arianee api  (${protocolName} / ${tokenId})`
      );
    },
    getArianeeEvent: async (
      protocolName: Protocol['name'],
      eventId: string
    ): Promise<ArianeeEvent> => {
      return this.fetchArianeeApi(
        `/report/arianeeEvent/${protocolName}/${eventId}`,
        `fetch arianeeEvent on arianee api  (${protocolName} / ${eventId})`
      );
    },
    getIdentity: async (
      protocolName: Protocol['name'],
      address: string
    ): Promise<ArianeeBrandIdentityI18N> => {
      return this.fetchArianeeApi(
        `/identity/${protocolName}/${address}`,
        `fetch identity on arianee api  (${protocolName} / ${address})`
      );
    },
    getMessage: async (
      protocolName: Protocol['name'],
      messageId: string
    ): Promise<decentralizedMessageInfo> => {
      return this.fetchArianeeApi(
        `/report/message/${protocolName}/${messageId}`,
        `fetch message on arianee api (${protocolName} / ${messageId})`
      );
    },
  };

  public protocol = {
    getProtocolDetails: async (
      slugOrNetwork: string
    ): Promise<ProtocolDetails> => {
      const queryParams = `?q=${slugOrNetwork}`;
      return this.fetchArianeeApi(
        `/protocol${queryParams}`,
        `fetch protocol details on arianee api (${slugOrNetwork})`
      );
    },
  };
}
