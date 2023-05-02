import { walletApiClient } from './wallet-api-client';

describe('walletApiClient', () => {
  it('should work', () => {
    expect(walletApiClient()).toEqual('wallet-api-client');
  });
});
