import { ChainType } from '@arianee/common-types';

import { ArianeeApiClient } from './arianee-api-client';

const fetchMock = jest.fn();

describe('ArianeeApiClient', () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
