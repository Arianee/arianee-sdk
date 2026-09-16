import { ChainType } from '@arianee/common-types';
import * as utils from '@arianee/utils';

import { ArianeeApiClient } from './arianee-api-client';

jest.mock('@arianee/utils', () => {
  const originalUtils = jest.requireActual('@arianee/utils');
  return {
    ...originalUtils,
    retryFetchLike: jest.fn(),
    cachedFetchLike: jest.fn(),
  };
});

const fetchMock = jest.fn();

describe('ArianeeApiClient', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should use a cachedFetchLike and retryFetchLike created with the defaultFetchLike if no fetch like passed', () => {
    const mockFetchLike = jest.fn();

    (utils.retryFetchLike as jest.Mock).mockReturnValue(
      mockFetchLike as unknown as typeof utils.defaultFetchLike
    );

    (utils.cachedFetchLike as jest.Mock).mockReturnValue(mockFetchLike);

    const client = new ArianeeApiClient();

    expect(client['fetchLike']).toBe(mockFetchLike);
    expect(utils.retryFetchLike).toHaveBeenCalledWith(
      utils.defaultFetchLike,
      3
    );
    expect(utils.cachedFetchLike).toHaveBeenCalledWith(mockFetchLike, {
      timeToLive: 5 * 60 * 1000,
    });
  });

  it('should throw if reponse is not ok', async () => {
    const apiClient = new ArianeeApiClient(
      'https://api.arianee.com',
      fetchMock
    );

    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: () => {
        return {};
      },
      statusText: 'nope',
    });

    try {
      await apiClient['fetchArianeeApi']('path');
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toEqual(new Error('Failed to fetch arianee api: nope'));
    }
  });

  it('should throw if fetch fail', async () => {
    const apiClient = new ArianeeApiClient(
      'https://api.arianee.com',
      fetchMock
    );
    fetchMock.mockRejectedValueOnce({ message: 'test' });

    try {
      await apiClient['fetchArianeeApi']('path');
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toEqual(new Error('Failed to fetch arianee api: test'));
    }
  });

  it('should carry the HTTP status on the thrown error', async () => {
    // Callers must be able to tell "this resource does not exist" from "the API
    // did not answer": only the first licenses concluding anything.
    const apiClient = new ArianeeApiClient(
      'https://api.arianee.com',
      fetchMock
    );

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => ({}),
    });

    await expect(apiClient['fetchArianeeApi']('path')).rejects.toMatchObject({
      status: 404,
    });
  });

  it('should leave the status undefined when the fetch itself failed', async () => {
    const apiClient = new ArianeeApiClient(
      'https://api.arianee.com',
      fetchMock
    );

    fetchMock.mockRejectedValueOnce({ message: 'network down' });

    const error = await apiClient['fetchArianeeApi']('path').catch(
      (e: unknown) => e
    );

    expect(error).toBeInstanceOf(Error);
    expect((error as { status?: number }).status).toBeUndefined();
  });

  it('should get owned NFTs from the API', async () => {
    const apiClient = new ArianeeApiClient(
      'https://api.arianee.com',
      fetchMock
    );

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => {
        return {};
      },
    });

    const chainType: ChainType = 'mainnet';
    const address = '0x123456789';

    const result = await apiClient.multichain.getOwnedNfts(chainType, address);

    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.arianee.com/multichain/${chainType}/nft/${address}/list?populateEvent=true`
    );
  });
});
