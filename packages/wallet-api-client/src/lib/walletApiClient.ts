import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import {
  BrandIdentity,
  BrandIdentityWithOwned,
  ChainType,
  DecentralizedMessage,
  Event,
  Protocol,
  SmartAsset,
} from '@arianee/common-types';
import { Core } from '@arianee/core';
import { defaultFetchLike, ReadLink } from '@arianee/utils';
import { WalletAbstraction } from '@arianee/wallet-abstraction';

import { WALLET_API_URL } from './constants';
import { generateQueryString, removeTrailingSlash } from './helpers';
import HttpClient, { AuthorizationType } from './helpers/httpClient';

export default class WalletApiClient<T extends ChainType>
  implements WalletAbstraction
{
  private fetchLike: typeof fetch;
  private apiURL: string;
  private httpClient: HttpClient;

  constructor(
    private chainType: T,
    private core: Core,
    options?: {
      apiURL?: string;
      httpClient?: HttpClient;
      arianeeAccessToken?: ArianeeAccessToken;
      arianeeAccessTokenPrefix?: string;
    },
    fetchLike?: typeof fetch
  ) {
    this.fetchLike = fetchLike ?? defaultFetchLike;

    this.apiURL = removeTrailingSlash(options?.apiURL ?? WALLET_API_URL);

    const arianeeAccessToken =
      options?.arianeeAccessToken ?? new ArianeeAccessToken(this.core);

    this.httpClient =
      options?.httpClient ??
      new HttpClient(
        this.core,
        this.fetchLike,
        arianeeAccessToken,
        options?.arianeeAccessTokenPrefix
      );
  }

  private getAuthorizationType(
    certificateId?: string,
    passphrase?: string
  ): AuthorizationType {
    if (certificateId && passphrase) {
      return { certificateId, passphrase };
    } else {
      return 'arianeeAccessToken';
    }
  }

  async getSmartAsset(
    protocolName: Protocol['name'],
    smartAsset: {
      id: SmartAsset['certificateId'];
      passphrase?: string;
    },
    params?: {
      preferredLanguages?: string[];
    }
  ): Promise<SmartAsset> {
    const { id, passphrase } = smartAsset;
    const { preferredLanguages } = params || {};
    const authorizationType = this.getAuthorizationType(id, passphrase);

    const query = generateQueryString({
      languages: preferredLanguages,
    });

    try {
      const response = await this.httpClient.authorizedGet({
        url: `${this.apiURL}/arianee/smartAsset/${protocolName}/${id}${query}`,
        authorizationType,
      });

      if (!response.ok) {
        throw new Error(`Error fetching smart asset: ${response.statusText}`);
      }

      return await response.json();
    } catch (e) {
      throw new Error(`Failed to fetch smart asset: ${(e as Error).message}`);
    }
  }

  async getSmartAssetFromArianeeAccessToken(
    arianeeAccessToken: string,
    params?: {
      preferredLanguages?: string[];
    }
  ): Promise<SmartAsset> {
    const { preferredLanguages } = params || {};

    const { payload } = ArianeeAccessToken.decodeJwt(arianeeAccessToken);

    if (payload?.sub !== 'certificate') {
      throw new Error(`Arianee Access Token should be certificate scoped`);
    }

    const query = generateQueryString({
      languages: preferredLanguages,
    });

    try {
      const response = await this.httpClient.get(
        `${this.apiURL}/arianee/smartAsset/${payload.network}/${payload.subId}${query}`,
        {
          authorization: `Bearer ${arianeeAccessToken}`,
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching smart asset: ${response.statusText}`);
      }

      return await response.json();
    } catch (e) {
      throw new Error(`Failed to fetch smart asset: ${(e as Error).message}`);
    }
  }

  async getSmartAssetEvents(
    protocolName: Protocol['name'],
    smartAsset: {
      id: SmartAsset['certificateId'];
      passphrase?: string;
    },
    params?: {
      preferredLanguages?: string[];
    }
  ): Promise<Event[]> {
    const { id, passphrase } = smartAsset;
    const { preferredLanguages } = params || {};
    const authorizationType = this.getAuthorizationType(id, passphrase);

    const query = generateQueryString({
      languages: preferredLanguages,
    });

    try {
      const response = await this.httpClient.authorizedGet({
        url: `${this.apiURL}/arianee/events/${protocolName}/${id}${query}`,
        authorizationType,
      });

      if (!response.ok) {
        throw new Error(
          `Error fetching smart asset events: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (e) {
      throw new Error(
        `Failed to fetch smart asset events: ${(e as Error).message}`
      );
    }
  }

  async getSmartAssetEventsFromArianeeAccessToken(
    arianeeAccessToken: string,
    params?: {
      preferredLanguages?: string[];
    }
  ): Promise<Event[]> {
    const { preferredLanguages } = params || {};

    const { payload } = ArianeeAccessToken.decodeJwt(arianeeAccessToken);

    if (payload?.sub !== 'certificate') {
      throw new Error(`Arianee Access Token should be certificate scoped`);
    }

    const query = generateQueryString({
      languages: preferredLanguages,
    });

    try {
      const response = await this.httpClient.get(
        `${this.apiURL}/arianee/events/${payload.network}/${payload.subId}${query}`,
        {
          authorization: `Bearer ${arianeeAccessToken}`,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching smart asset events: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (e) {
      throw new Error(
        `Failed to fetch smart asset events: ${(e as Error).message}`
      );
    }
  }

  async getOwnedSmartAssets(params?: {
    onlyFromBrands?: string[];
    preferredLanguages?: string[];
  }): Promise<SmartAsset[]> {
    const { preferredLanguages, onlyFromBrands } = params || {};

    const query = generateQueryString({
      brands: onlyFromBrands,
      languages: preferredLanguages,
    });

    try {
      const response = await this.httpClient.authorizedGet({
        url: `${this.apiURL}/arianee/smartAssets/${this.chainType}/owned${query}`,
      });

      if (!response.ok) {
        throw new Error(
          `Error fetching owned smart assets: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (e) {
      throw new Error(
        `Failed to fetch owned smart assets: ${(e as Error).message}`
      );
    }
  }

  async getMessage(
    id: DecentralizedMessage['id'],
    protocolName: Protocol['name'],
    params?: {
      preferredLanguages?: string[];
    }
  ): Promise<DecentralizedMessage> {
    const { preferredLanguages } = params || {};

    const query = generateQueryString({
      languages: preferredLanguages,
    });

    try {
      const response = await this.httpClient.authorizedGet({
        url: `${this.apiURL}/arianee/message/${protocolName}/${id}${query}`,
      });

      if (!response.ok) {
        throw new Error(`Error fetching message: ${response.statusText}`);
      }

      return await response.json();
    } catch (e) {
      throw new Error(`Failed to fetch message: ${(e as Error).message}`);
    }
  }

  async getReceivedMessages(params?: {
    preferredLanguages?: string[];
  }): Promise<DecentralizedMessage[]> {
    const { preferredLanguages } = params || {};

    const query = generateQueryString({
      languages: preferredLanguages,
    });

    try {
      const response = await this.httpClient.authorizedGet({
        url: `${this.apiURL}/arianee/messages/${this.chainType}/received${query}`,
      });

      if (!response.ok) {
        throw new Error(
          `Error fetching received messages: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (e) {
      throw new Error(
        `Failed to fetch received messages: ${(e as Error).message}`
      );
    }
  }

  async getBrandIdentity(
    address: BrandIdentity['address'],
    params?: {
      preferredLanguages?: string[];
    }
  ): Promise<BrandIdentity> {
    const { preferredLanguages } = params || {};

    const query = generateQueryString({
      languages: preferredLanguages,
    });

    try {
      const response = await this.httpClient.get(
        `${this.apiURL}/arianee/brandIdentity/${address}${query}`
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching brand identity: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (e) {
      throw new Error(
        `Failed to fetch brand identity: ${(e as Error).message}`
      );
    }
  }

  async getOwnedSmartAssetsBrandIdentities(params?: {
    preferredLanguages?: string[];
  }): Promise<BrandIdentityWithOwned[]> {
    const { preferredLanguages } = params || {};

    const query = generateQueryString({
      languages: preferredLanguages,
    });

    try {
      const response = await this.httpClient.get(
        `${this.apiURL}/arianee/brandIdentities/${
          this.chainType
        }/owned/${this.core.getAddress()}${query}`
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching owned smart assets brand identities: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (e) {
      throw new Error(
        `Failed to fetch owned smart assets brand identities: ${
          (e as Error).message
        }`
      );
    }
  }

  async handleLink(
    link: string,
    params?: {
      resolveFinalNft?: boolean;
      arianeeAccessToken?: string;
    }
  ): Promise<ReadLink> {
    try {
      const response = await this.httpClient.post(
        `${this.apiURL}/arianee/link/handle`,
        {
          link,
          ...(params?.resolveFinalNft && { resolveFinalNft: true }),
          ...(params?.arianeeAccessToken && {
            arianeeAccessToken: params.arianeeAccessToken,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`${response.statusText}`);
      }

      return await response.json();
    } catch (e) {
      throw new Error(`Failed to handle link: ${(e as Error).message}`);
    }
  }

  async linkToSmartAsset(
    link: string,
    params?: {
      resolveFinalNft?: boolean;
      arianeeAccessToken?: string;
    }
  ): Promise<SmartAsset> {
    try {
      const response = await this.httpClient.post(
        `${this.apiURL}/arianee/link/toSmartAsset`,
        {
          link,
          ...(params?.resolveFinalNft && { resolveFinalNft: true }),
          ...(params?.arianeeAccessToken && {
            arianeeAccessToken: params.arianeeAccessToken,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`${response.statusText}`);
      }

      return await response.json();
    } catch (e) {
      throw new Error(
        `Failed to get smart asset from link (${link}): ${(e as Error).message}`
      );
    }
  }
}
