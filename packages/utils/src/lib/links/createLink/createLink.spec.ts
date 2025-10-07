import { BrandIdentity } from '@arianee/common-types';

import { createLink, createResolverLink } from './createLink';

const getTestBrandIdentity = (
  customDomain: string
): Pick<BrandIdentity, 'rawContent'> => ({
  rawContent: {
    $schema: 'https://cert.arianee.org/version1/ArianeeBrandIdentity-i18n.json',
    externalContents: [
      {
        type: 'deepLinkDomain',
        url: customDomain,
      },
    ],
  },
});

describe('createLink', () => {
  it.each([
    {
      slug: 'mainnet',
      suffix: undefined,
      tokenId: '123',
      passphrase: 'test',
      expectedLink: 'https://arian.ee/123,test,mainnet',
    },
    {
      slug: 'mainnet',
      suffix: '/proof',
      tokenId: '123',
      passphrase: 'test',
      expectedLink: 'https://arian.ee/proof/123,test,mainnet',
    },
    {
      slug: 'testnet',
      suffix: '/proof',
      tokenId: '123',
      passphrase: 'test',
      expectedLink: 'https://test.arian.ee/proof/123,test,testnet',
    },
    {
      slug: 'testnet',
      suffix: '/proof',
      tokenId: '123',
      passphrase: 'test',
      brandIdentity: getTestBrandIdentity('http://domain1.com'),
      expectedLink: 'https://domain1.com/proof/123,test,testnet',
    },
    {
      slug: 'testnet',
      suffix: undefined,
      tokenId: '123',
      passphrase: 'test',
      brandIdentity: getTestBrandIdentity('https://domain2.com'),
      expectedLink: 'https://domain2.com/123,test,testnet',
    },
    {
      slug: 'testnet',
      suffix: undefined,
      tokenId: '123',
      passphrase: 'test',
      brandIdentity: getTestBrandIdentity('domain3.org/'),
      expectedLink: 'https://domain3.org/123,test,testnet',
    },
    {
      slug: 'customnetwork',
      suffix: '/proof',
      tokenId: '123',
      passphrase: 'test',
      expectedLink:
        'https://customnetwork.arianee.net/proof/123,test,customnetwork',
    },
    {
      slug: 'customnetwork',
      suffix: '/proof',
      tokenId: '123',
      passphrase: 'test',
      brandIdentity: getTestBrandIdentity('domain3.org/'),
      expectedLink: 'https://domain3.org/proof/123,test,customnetwork',
    },
    {
      slug: 'anotherNetwork',
      suffix: undefined,
      tokenId: '123',
      passphrase: 'test',
      expectedLink:
        'https://anotherNetwork.arianee.net/123,test,anotherNetwork',
    },
    {
      slug: 'customnetwork',
      suffix: '/proof',
      tokenId: '123',
      passphrase: 'test',
      brandIdentity: getTestBrandIdentity('domain3.org?autoclaim=true'),
      expectedLink:
        'https://domain3.org/proof/123,test,customnetwork?autoclaim=true',
    },
    {
      slug: 'customnetwork',
      suffix: '/proof2queryParams',
      tokenId: '123',
      passphrase: 'test',
      brandIdentity: getTestBrandIdentity(
        'domain3.org?autoclaim=true&blipbloup=blapal'
      ),
      expectedLink:
        'https://domain3.org/proof2queryParams/123,test,customnetwork?autoclaim=true&blipbloup=blapal',
    },
    {
      slug: 'customnetwork',
      suffix: '/proof2queryParamsAnd2Params',
      tokenId: '123',
      passphrase: 'test',
      brandIdentity: getTestBrandIdentity(
        'domain3.org/param1/param2/?autoclaim=true&blipbloup=blapal'
      ),
      expectedLink:
        'https://domain3.org/proof2queryParamsAnd2Params/param1/param2/123,test,customnetwork?autoclaim=true&blipbloup=blapal',
    },
    {
      slug: 'customnetwork',
      suffix: '/proof2queryParamsAnd2Params',
      tokenId: '123',
      passphrase: 'test',
      identityAddress: '0x305051e9a023fe881EE21cA43fd90c460B427Caa',
      brandIdentity: getTestBrandIdentity(
        'domain3.org/param1/param2/?autoclaim=true&blipbloup=blapal'
      ),
      expectedLink:
        'https://domain3.org/proof2queryParamsAnd2Params/param1/param2/123,test,customnetwork,0x305051e9a023fe881EE21cA43fd90c460B427Caa?autoclaim=true&blipbloup=blapal',
    },
    {
      slug: 'customnetwork',
      suffix: '/proof2queryParamsAnd2Params',
      tokenId: '123',
      passphrase: 'test',
      identityAddress: '0x305051e9a023fe881EE21cA43fd90c460B427Caa',
      brandIdentity: getTestBrandIdentity(
        'domain3.org/param1/param2/?autoclaim=true&blipbloup=blapal'
      ),
      expectedLink:
        'https://domain3.org/proof2queryParamsAnd2Params/param1/param2/123,test,customnetwork,0x305051e9a023fe881EE21cA43fd90c460B427Caa?autoclaim=true&blipbloup=blapal',
    },
  ])(
    'should return a link for protocol v1',
    ({
      slug,
      suffix,
      tokenId,
      passphrase,
      expectedLink,
      brandIdentity,
      identityAddress,
    }) => {
      expect(
        createLink({
          slug,
          suffix,
          tokenId,
          passphrase,
          brandIdentity: brandIdentity as BrandIdentity,
          identityAddress,
        })
      ).toEqual(expectedLink);
    }
  );
  it.each([
    {
      slug: '137-0-arianee-0',
      suffix: undefined,
      tokenId: '123',
      passphrase: 'test',
      expectedLink: 'https://arian.ee/123,test,137-0-arianee-0',
    },
    {
      slug: '137-0-arianee-0',
      suffix: '/proof',
      tokenId: '123',
      passphrase: 'test',
      expectedLink: 'https://arian.ee/proof/123,test,137-0-arianee-0',
    },
    {
      slug: '99-0-arianee-0',
      suffix: '/proof',
      tokenId: '123',
      passphrase: 'test',
      expectedLink: 'https://arian.ee/proof/123,test,99-0-arianee-0',
    },
  ])(
    'should return a link for protocol v2',
    ({ slug, suffix, tokenId, passphrase, expectedLink }) => {
      expect(
        createLink({
          slug,
          suffix,
          tokenId,
          passphrase,
        })
      ).toEqual(expectedLink);
    }
  );
});

describe('createResolverLink', () => {
  it.each([
    {
      identityAddress: '0x305051e9a023fe881EE21cA43fd90c460B427Caa',
      tokenId: '23864720',
      passphrase: 'l4o8ju71796i',
      slug: 'testnet',
      resolverBaseURL: 'http://localhost:3000/',
      suffix: '/proof',
      expectedLink:
        'http://localhost:3000/proof/23864720,l4o8ju71796i,testnet,0x305051e9a023fe881EE21cA43fd90c460B427Caa',
    },
    {
      identityAddress: '0x305051e9a023fe881EE21cA43fd90c460B427Caa',
      tokenId: '23864720',
      passphrase: 'l4o8ju71796i',
      slug: 'testnet',
      resolverBaseURL: 'http://localhost:3000/',
      expectedLink:
        'http://localhost:3000/23864720,l4o8ju71796i,testnet,0x305051e9a023fe881EE21cA43fd90c460B427Caa',
    },
    {
      identityAddress: '0x305051e9a023fe881EE21cA43fd90c460B427Caa',
      tokenId: '23864720',
      passphrase: 'l4o8ju71796i',
      slug: 'testnet',
      expectedLink:
        'https://q.arianee.net/23864720,l4o8ju71796i,testnet,0x305051e9a023fe881EE21cA43fd90c460B427Caa',
    },
  ])(
    'should return a valid resolver link',
    ({
      slug,
      suffix,
      tokenId,
      passphrase,
      expectedLink,
      identityAddress,
      resolverBaseURL,
    }) => {
      expect(
        createResolverLink({
          slug,
          suffix,
          tokenId,
          passphrase,
          identityAddress,
          resolverBaseURL,
        })
      ).toEqual(expectedLink);
    }
  );

  it('should throw if identityAddress is not a valid address', () => {
    expect(() =>
      createResolverLink({
        slug: 'testnet',
        tokenId: '23864720',
        passphrase: 'l4o8ju71796i',
        identityAddress: 'invalidAddress',
      })
    ).toThrow(/invalid identity address/gi);
  });
});
