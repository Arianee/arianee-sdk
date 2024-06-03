import { getChainTypeOf, protocolNameToChainId } from './chain';

jest.spyOn(console, 'warn').mockImplementation();

describe('protocolNameToChainId', () => {
  it('should return the correct chain ID for a regular protocol', () => {
    expect(protocolNameToChainId('mainnet')).toBe(99);
  });

  it('should return the correct chain ID for a regular protocol (testnet)', () => {
    expect(protocolNameToChainId('testnet')).toBe(77);
  });

  it('should return the correct chain ID for a protocol with "-"', () => {
    expect(protocolNameToChainId('137-0-arianee-0')).toBe(137);
  });

  it('should return the default chain ID for an unknown protocol', () => {
    expect(protocolNameToChainId('unknown')).toBe(137);
  });
});

describe('getChainTypeOf', () => {
  it('should return "mainnet" for a regular protocol', () => {
    expect(getChainTypeOf('mainnet')).toBe('mainnet');
  });

  it('should return "testnet" for a testnet protocol', () => {
    expect(getChainTypeOf('testnet')).toBe('testnet');
    expect(getChainTypeOf('mumbai')).toBe('testnet');
    expect(getChainTypeOf('arianeeTestnet')).toBe('testnet');
  });

  it('should return "mainnet" for an unknown protocol', () => {
    expect(getChainTypeOf('unknown')).toBe('mainnet');
  });
});
