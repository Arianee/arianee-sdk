// TypeScript test
// If there is a regression in the types, then the typescript server will report an error and the build will fail.

import { ArianeeMessageI18N } from '../arianeeMessage-i18n';

// Minimal case
const minimalMessage: ArianeeMessageI18N = {
  $schema: 'my-schema',
};

// Real case
const realMessage: ArianeeMessageI18N = {
  $schema: 'https://cert.arianee.org/version1/ArianeeMessage-i18n.json',
  title: 'test media',
  content: 'test media',
  pictures: [
    {
      mediaType: 'picture',
      type: 'product',
      url: 'https://bdh-maxime.api.staging.arianee.com/pub/1673515070642-u13313121b1a1-superocean-heritage-chronograph-44-soldier.png',
    },
  ],
};

it('should be valid', () => {
  expect(true).toBeTruthy(); // this test will fail if there is an issue in the typing
})
