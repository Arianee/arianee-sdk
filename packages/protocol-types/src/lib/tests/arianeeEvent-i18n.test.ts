// TypeScript test
// If there is a regression in the types, then the typescript server will report an error and the build will fail.

import { ArianeeEventI18N } from '../arianeeEvent-i18n';

// Minimal case
const minimalEvent: ArianeeEventI18N = {
  $schema: 'my-schema',
};

// Real case
const realEvent: ArianeeEventI18N = {
  $schema: 'https://cert.arianee.org/version1/ArianeeEvent-i18n.json',
  eventType: 'repair',
  description:
    'Congratulations on having your Breitling watch repaired at one of our authorized boutiques! \nAs a Breitling owner with a related product passport, you have the peace of mind of knowing that your watch is not only authentic, but also fully documented. Our product passport allows us to timestamp each repair and service your watch receives, creating a permanent and immutable record of its history. This not only enhances the value of your watch as a collectible, but also makes it easier to sell or trade in the future.',
  externalContents: [
    {
      type: 'website',
      title: 'Discover our nearest Breitling boutique',
      url: 'https://www.breitling.com/us-en/',
    },
  ],
  medias: [
    {
      mediaType: 'picture',
      type: 'product',
      url: 'https://bdh-breitling.api.pre-production.arianee.com/pub/m2294',
    },
  ],
};

it('should be valid', () => {
  expect(true).toBeTruthy(); // this test will fail if there is an issue in the typing
})
