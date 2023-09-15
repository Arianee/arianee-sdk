import { isProtocolV2FromSlug } from './slug';

describe('slug', () => {
  it('should return true if it is a v2 slug', () => {
    expect(isProtocolV2FromSlug('137-0-arianee-0')).toEqual(true);
  });

  it('should return false if it is not a v2 slug', () => {
    expect(isProtocolV2FromSlug('mainnet')).toEqual(false);
  });
});
