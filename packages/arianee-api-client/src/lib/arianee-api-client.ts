import {
  BlockchainEvent,
  blockchainEventsName,
  ChainType,
  Protocol,
  SmartContractNames,
} from '@arianee/common-types';

import { blockchainEventFilters } from './types/blockchainEventFilters';
import { smartAssetInfo } from './types/smartAssetInfo';
import { decentralizedMessageInfo } from './types/decentralizedMessageInfo';
import { brandIdentityInfo } from './types/brandIdentityInfo';
import { convertObjectToDotNotation } from './utils/dotNotation/dotNotation';
import { contractNameToArianeeApiContractName } from './utils/contracts/contractName';

export class ArianeeApiClient {
  private fetchLike: typeof fetch;
  constructor(
    private readonly arianeeApiUrl?: string,
    fetchLike?: typeof fetch
  ) {
    if (typeof window === 'undefined') {
      this.fetchLike = fetchLike ?? require('node-fetch');
    } else {
      this.fetchLike = fetchLike ?? window.fetch.bind(window);
    }

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
    ): Promise<BlockchainEvent[]> => {
      const queryParams = filters
        ? '?' + convertObjectToDotNotation(filters)
        : '';

      const arianeeApiContractName =
        contractNameToArianeeApiContractName[smartContractName];

      return this.fetchArianeeApi(
        `/multichain/${chainType}/contract/${arianeeApiContractName}/${eventName}${queryParams}`,
        'fetch events on arianee api'
      );
    },
    getOwnedNfts: async (
      chainType: ChainType,
      address: string,
      populateEvents = true
    ): Promise<smartAssetInfo[]> => {
      return this.fetchArianeeApi(
        `/multichain/${chainType}/nft/${address}/list?populateEvent=${populateEvents}`,
        'fetch nfts on arianee api'
      );
    },
    getReceivedMessages: async (
      chainType: ChainType,
      address: string
    ): Promise<decentralizedMessageInfo[]> => {
      return this.fetchArianeeApi(
        `/multichain/${chainType}/dmessage/${address}/list`,
        'fetch messages on arianee api'
      );
    },
    getIdentity: async (address: string): Promise<brandIdentityInfo> => {
      return this.fetchArianeeApi(
        `/identity/${address}`,
        'fetch identity on arianee api'
      );
    },
  };

  public network = {
    getEvents: async (
      chainId: string,
      contractAddress: string,
      eventName: blockchainEventsName,
      filters?: blockchainEventFilters
    ): Promise<BlockchainEvent[]> => {
      const queryParams = filters
        ? '?' + convertObjectToDotNotation(filters)
        : '';
      return this.fetchArianeeApi(
        `/report/${chainId}/contract/${contractAddress}/${eventName}${queryParams}`,
        'fetch events on arianee api'
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
        'fetch count events on arianee api'
      );
    },
    getOwnedNfts: async (
      protocolName: Protocol['name'],
      address: string
    ): Promise<smartAssetInfo[]> => {
      return this.fetchArianeeApi(
        `/report/nft/${address}/list?network=${protocolName}`,
        'fetch owned nft on arianee api'
      );
    },
    getNftOwner: async (
      protocolName: Protocol['name'],
      tokenId: string
    ): Promise<string> => {
      return this.fetchArianeeApi(
        `/report/nft/${protocolName}/ownerOf/${tokenId}`,
        "fetch nft's owner on arianee api"
      );
    },
    getNft: async (
      protocolName: Protocol['name'],
      tokenId: string
    ): Promise<smartAssetInfo> => {
      return this.fetchArianeeApi(
        `/report/nft/${protocolName}/${tokenId}`,
        'fetch nft on arianee api'
      );
    },
    getNftArianeeEvents: async (
      protocolName: Protocol['name'],
      tokenId: string
    ): Promise<BlockchainEvent[]> => {
      return this.fetchArianeeApi(
        `/report/nft/${protocolName}/${tokenId}/arianeeEvents`,
        'fetch nft arianee events on arianee api'
      );
    },
    getIdentity: async (
      protocolName: Protocol['name'],
      address: string
    ): Promise<brandIdentityInfo> => {
      return this.fetchArianeeApi(
        `/identity/${protocolName}/${address}`,
        'fetch identity on arianee api'
      );
    },
  };
}
