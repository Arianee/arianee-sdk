import { BrandIdentity } from '@arianee/common-types';

import { createLink } from './createLink';

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
      expectedLink: 'https://arian.ee/123,test',
    },
    {
      slug: 'mainnet',
      suffix: '/proof',
      tokenId: '123',
      passphrase: 'test',
      expectedLink: 'https://arian.ee/proof/123,test',
    },
    {
      slug: 'testnet',
      suffix: '/proof',
      tokenId: '123',
      passphrase: 'test',
      expectedLink: 'https://test.arian.ee/proof/123,test',
    },
    {
      slug: 'testnet',
      suffix: '/proof',
      tokenId: '123',
      passphrase: 'test',
      brandIdentity: getTestBrandIdentity('http://domain1.com'),
      expectedLink: 'https://domain1.com/proof/123,test',
    },
    {
      slug: 'testnet',
      suffix: undefined,
      tokenId: '123',
      passphrase: 'test',
      brandIdentity: getTestBrandIdentity('https://domain2.com'),
      expectedLink: 'https://domain2.com/123,test',
    },
    {
      slug: 'testnet',
      suffix: undefined,
      tokenId: '123',
      passphrase: 'test',
      brandIdentity: getTestBrandIdentity('domain3.org/'),
      expectedLink: 'https://domain3.org/123,test',
    },
  ])(
    'should return a link for protocol v1',
    ({ slug, suffix, tokenId, passphrase, expectedLink, brandIdentity }) => {
      expect(
        createLink({
          slug,
          suffix,
          tokenId,
          passphrase,
          brandIdentity: brandIdentity as BrandIdentity,
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
