import Core from '@arianee/core';
import ArianeeProtocolClient from './arianeeProtocolClient';

jest.mock('@arianee/core');

describe('ArianeeProtocolClient', () => {
  it('should work', () => {
    expect(new ArianeeProtocolClient(Core.fromRandom())).toBeInstanceOf(
      ArianeeProtocolClient
    );
  });
});
