import { Wallet } from './wallet';

describe('wallet', () => {
  it('should work', () => {
    const wallet = new Wallet();

    expect(wallet).toBeDefined();
  });
});
