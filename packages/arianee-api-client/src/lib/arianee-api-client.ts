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
      address: string
    ): Promise<smartAssetInfo[]> => {
      return this.fetchArianeeApi(
        `/multichain/${chainType}/nft/${address}/list?populateEvent=true`,
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
      protocol: Protocol,
      address: string
    ): Promise<smartAssetInfo[]> => {
      return this.fetchArianeeApi(
        `/nft/${address}/list?network=${protocol.name}`,
        'fetch owned nft on arianee api'
      );
    },
    getNftOwner: async (
      protocol: Protocol,
      tokenId: string
    ): Promise<string> => {
      return this.fetchArianeeApi(
        `/nft/${protocol.name}/ownerOf/${tokenId}`,
        "fetch nft's owner on arianee api"
      );
    },
    getNft: async (
      protocol: Protocol,
      tokenId: string
    ): Promise<smartAssetInfo> => {
      return this.fetchArianeeApi(
        `/nft/${protocol.name}/${tokenId}`,
        'fetch nft on arianee api'
      );
    },
    getNftArianeeEvents: async (
      protocol: Protocol,
      tokenId: string
    ): Promise<BlockchainEvent[]> => {
      return this.fetchArianeeApi(
        `/nft/${protocol.name}/${tokenId}/arianeeEvents`,
        'fetch nft arianee events on arianee api'
      );
    },
    getIdentity: async (
      protocol: Protocol,
      address: string
    ): Promise<brandIdentityInfo> => {
      return this.fetchArianeeApi(
        `/identity/${protocol.name}/${address}`,
        'fetch identity on arianee api'
      );
    },
  };
}
