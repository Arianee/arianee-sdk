import { readArianeeLink, readLink } from './readLink';

describe('readLink', () => {
  it.each([
    {
      link: 'https://test.arian.ee/983190220,kj1ed3hq3a4y',
      expected: {
        certificateId: '983190220',
        passphrase: 'kj1ed3hq3a4y',
        aat: undefined,
        method: 'requestOwnership',
        network: 'testnet',
        link: 'https://test.arian.ee/983190220,kj1ed3hq3a4y',
      },
    },
    {
      link: 'https://arianee.net/799709261,rrlr160hhjhj',
      expected: {
        certificateId: '799709261',
        passphrase: 'rrlr160hhjhj',
        aat: undefined,
        method: 'requestOwnership',
        network: 'mainnet',
        link: 'https://arianee.net/799709261,rrlr160hhjhj',
      },
    },
    {
      link: 'https://test.arian.ee/983190220,kj1ed3hq3a4y?arianeeAccessToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweEE5QmM5MEQyNEQwYjg0OTUwNDNBYjU4NTc0NTU0NDQ2MzAwMjhDQUYiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjE2ODU5NTcxMDYyNzMsImlhdCI6MTY4NTk1NjgwNjI3M30=.0x58c72886153f2a80834378450bff77a0cd23226c41bb572cf2b7690d770ac75a74500e4c2cef27f01384bf41706199dd4d9b3bb6ce420c930a8052d99c692c771c',
      expected: {
        certificateId: '983190220',
        passphrase: 'kj1ed3hq3a4y',
        aat: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweEE5QmM5MEQyNEQwYjg0OTUwNDNBYjU4NTc0NTU0NDQ2MzAwMjhDQUYiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjE2ODU5NTcxMDYyNzMsImlhdCI6MTY4NTk1NjgwNjI3M30=.0x58c72886153f2a80834378450bff77a0cd23226c41bb572cf2b7690d770ac75a74500e4c2cef27f01384bf41706199dd4d9b3bb6ce420c930a8052d99c692c771c',
        method: 'requestOwnership',
        network: 'testnet',
        link: 'https://test.arian.ee/983190220,kj1ed3hq3a4y?arianeeAccessToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweEE5QmM5MEQyNEQwYjg0OTUwNDNBYjU4NTc0NTU0NDQ2MzAwMjhDQUYiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjE2ODU5NTcxMDYyNzMsImlhdCI6MTY4NTk1NjgwNjI3M30=.0x58c72886153f2a80834378450bff77a0cd23226c41bb572cf2b7690d770ac75a74500e4c2cef27f01384bf41706199dd4d9b3bb6ce420c930a8052d99c692c771c',
      },
    },
    {
      link: 'https://test.arian.ee/983190220?arianeeAccessToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweEE5QmM5MEQyNEQwYjg0OTUwNDNBYjU4NTc0NTU0NDQ2MzAwMjhDQUYiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjE2ODU5NTcxMDYyNzMsImlhdCI6MTY4NTk1NjgwNjI3M30=.0x58c72886153f2a80834378450bff77a0cd23226c41bb572cf2b7690d770ac75a74500e4c2cef27f01384bf41706199dd4d9b3bb6ce420c930a8052d99c692c771c',
      expected: {
        certificateId: '983190220',
        passphrase: undefined,
        aat: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweEE5QmM5MEQyNEQwYjg0OTUwNDNBYjU4NTc0NTU0NDQ2MzAwMjhDQUYiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjE2ODU5NTcxMDYyNzMsImlhdCI6MTY4NTk1NjgwNjI3M30=.0x58c72886153f2a80834378450bff77a0cd23226c41bb572cf2b7690d770ac75a74500e4c2cef27f01384bf41706199dd4d9b3bb6ce420c930a8052d99c692c771c',
        method: 'requestOwnership',
        network: 'testnet',
        link: 'https://test.arian.ee/983190220?arianeeAccessToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweEE5QmM5MEQyNEQwYjg0OTUwNDNBYjU4NTc0NTU0NDQ2MzAwMjhDQUYiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjE2ODU5NTcxMDYyNzMsImlhdCI6MTY4NTk1NjgwNjI3M30=.0x58c72886153f2a80834378450bff77a0cd23226c41bb572cf2b7690d770ac75a74500e4c2cef27f01384bf41706199dd4d9b3bb6ce420c930a8052d99c692c771c',
      },
    },
    {
      link: 'https://test.arian.ee/983190220',
      expected: {
        certificateId: '983190220',
        passphrase: undefined,
        aat: undefined,
        method: 'requestOwnership',
        network: 'testnet',
        link: 'https://test.arian.ee/983190220',
      },
    },
    {
      link: 'https://poly.arian.ee/proof/1089345,yh3y8yfwfpxo',
      expected: {
        certificateId: '1089345',
        passphrase: 'yh3y8yfwfpxo',
        aat: undefined,
        method: 'proof',
        network: 'polygon',
        link: 'https://poly.arian.ee/proof/1089345,yh3y8yfwfpxo',
      },
    },
    {
      link: 'https://poly.arian.ee/proof/1089345,yh3y8yfwfpxo?arianeeAccessToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweEE5QmM5MEQyNEQwYjg0OTUwNDNBYjU4NTc0NTU0NDQ2MzAwMjhDQUYiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjE2ODU5NTcxMDYyNzMsImlhdCI6MTY4NTk1NjgwNjI3M30=.0x58c72886153f2a80834378450bff77a0cd23226c41bb572cf2b7690d770ac75a74500e4c2cef27f01384bf41706199dd4d9b3bb6ce420c930a8052d99c692c771c',
      expected: {
        certificateId: '1089345',
        passphrase: 'yh3y8yfwfpxo',
        aat: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweEE5QmM5MEQyNEQwYjg0OTUwNDNBYjU4NTc0NTU0NDQ2MzAwMjhDQUYiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjE2ODU5NTcxMDYyNzMsImlhdCI6MTY4NTk1NjgwNjI3M30=.0x58c72886153f2a80834378450bff77a0cd23226c41bb572cf2b7690d770ac75a74500e4c2cef27f01384bf41706199dd4d9b3bb6ce420c930a8052d99c692c771c',
        method: 'proof',
        network: 'polygon',
        link: 'https://poly.arian.ee/proof/1089345,yh3y8yfwfpxo?arianeeAccessToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweEE5QmM5MEQyNEQwYjg0OTUwNDNBYjU4NTc0NTU0NDQ2MzAwMjhDQUYiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjE2ODU5NTcxMDYyNzMsImlhdCI6MTY4NTk1NjgwNjI3M30=.0x58c72886153f2a80834378450bff77a0cd23226c41bb572cf2b7690d770ac75a74500e4c2cef27f01384bf41706199dd4d9b3bb6ce420c930a8052d99c692c771c',
      },
    },
    {
      link: 'https://stadetoulousain.arian.ee/proof/89592037,xakos7t8700d',
      expected: {
        certificateId: '89592037',
        passphrase: 'xakos7t8700d',
        aat: undefined,
        method: 'proof',
        network: 'stadetoulousain',
        link: 'https://stadetoulousain.arian.ee/proof/89592037,xakos7t8700d',
      },
    },
    {
      link: 'https://test.ee/proof/89592037,xakos7t8700d,137-0-arianee-0',
      expected: {
        certificateId: '89592037',
        passphrase: 'xakos7t8700d',
        aat: undefined,
        method: 'proof',
        network: '137-0-arianee-0',
        link: 'https://test.ee/proof/89592037,xakos7t8700d,137-0-arianee-0',
      },
    },
  ])(
    'should return the expected value from the link (case %#)',
    ({ link, expected }) => {
      const result = readLink(link);
      expect(result).toEqual(expected);
    }
  );
  it.each([
    {
      caseName: 'invalid url',
      link: 'https/invalidUrl',
      errorRegExp: /not a valid url/gi,
    },
    {
      caseName: 'no protocol found for hostname',
      link: 'https://no.protocol.found/983190220,kj1ed3hq3a4y',
      errorRegExp: /no protocol found/gi,
    },
  ])('should throw ($errorRegExp)', ({ link, errorRegExp }) => {
    expect(() => readLink(link)).toThrowError(errorRegExp);
  });
});

describe('readArianeeLink', () => {
  it.each([
    {
      link: 'https://test.arian.ee/789455599,4p3nw5wfsmll,testnet,0x305051e9a023fe881EE21cA43fd90c460B427Caa',
      expected: {
        tokenId: '789455599',
        passphrase: '4p3nw5wfsmll',
        network: 'testnet',
        issuer: '0x305051e9a023fe881EE21cA43fd90c460B427Caa',
        link: 'https://test.arian.ee/789455599,4p3nw5wfsmll,testnet,0x305051e9a023fe881EE21cA43fd90c460B427Caa',
      },
    },
    {
      link: 'https://arian.ee/799709261,rrlr160hhjhj,mainnet,0x1234567890123456789012345678901234567890',
      expected: {
        tokenId: '799709261',
        passphrase: 'rrlr160hhjhj',
        network: 'mainnet',
        issuer: '0x1234567890123456789012345678901234567890',
        link: 'https://arian.ee/799709261,rrlr160hhjhj,mainnet,0x1234567890123456789012345678901234567890',
      },
    },
    {
      link: 'https://custom.domain.com/123456,abcdef,testnet,0xABCDEF1234567890',
      expected: {
        tokenId: '123456',
        passphrase: 'abcdef',
        network: 'testnet',
        issuer: '0xABCDEF1234567890',
        link: 'https://custom.domain.com/123456,abcdef,testnet,0xABCDEF1234567890',
      },
    },
    {
      link: 'https://test.arian.ee/983190220,kj1ed3hq3a4y,testnet',
      expected: {
        tokenId: '983190220',
        passphrase: 'kj1ed3hq3a4y',
        network: 'testnet',
        issuer: undefined,
        link: 'https://test.arian.ee/983190220,kj1ed3hq3a4y,testnet',
      },
    },
  ])(
    'should return the expected value from the link (case %#)',
    ({ link, expected }) => {
      const result = readArianeeLink(link);
      expect(result).toEqual(expected);
    }
  );

  it.each([
    {
      caseName: 'invalid url',
      link: 'https/invalidUrl',
      errorRegExp: /invalid arianee link format/gi,
    },
    {
      caseName: 'missing parts - only 2 parts',
      link: 'https://test.arian.ee/983190220,kj1ed3hq3a4y',
      errorRegExp: /invalid arianee link format/gi,
    },
    {
      caseName: 'missing parts - only 1 part',
      link: 'https://test.arian.ee/983190220',
      errorRegExp: /invalid arianee link format/gi,
    },
    {
      caseName: 'empty tokenId',
      link: 'https://test.arian.ee/,kj1ed3hq3a4y,testnet,0x123',
      errorRegExp: /invalid arianee link format/gi,
    },
    {
      caseName: 'empty passphrase',
      link: 'https://test.arian.ee/983190220,,testnet,0x123',
      errorRegExp: /invalid arianee link format/gi,
    },
    {
      caseName: 'empty network',
      link: 'https://test.arian.ee/983190220,kj1ed3hq3a4y,,0x123',
      errorRegExp: /invalid arianee link format/gi,
    },
    {
      caseName: 'invalid format - no commas',
      link: 'https://test.arian.ee/983190220',
      errorRegExp: /invalid arianee link format/gi,
    },
    {
      caseName: 'invalid format - wrong separator',
      link: 'https://test.arian.ee/983190220;kj1ed3hq3a4y;testnet',
      errorRegExp: /invalid arianee link format/gi,
    },
  ])('should throw ($errorRegExp)', ({ link, errorRegExp }) => {
    expect(() => readArianeeLink(link)).toThrowError(errorRegExp);
  });
});
