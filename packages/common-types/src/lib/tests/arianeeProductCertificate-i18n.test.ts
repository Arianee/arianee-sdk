// TypeScript test
// If there is a regression in the types, then the typescript server will report an error and the build will fail.
import { ArianeeProductCertificateI18N } from '../arianeeProductCertificate-i18n';

// Minimal case
const minimalArianeeProductCertificate: ArianeeProductCertificateI18N = {
  $schema: 'my-schema',
};

// Real use case (parent link)
const yslBeautyProductCertificate: ArianeeProductCertificateI18N = {
  $schema:
    'https://cert.arianee.org/version5/ArianeeProductCertificate-i18n.json',
  parentCertificates: [
    {
      type: 'Full',
      arianeeLink: 'https://polygon.yslbeauty.com/53751427,axyyjm1qpk60',
    },
  ],
};

const yslBeautyProductCertificateParent: ArianeeProductCertificateI18N = {
  $schema:
    'https://cert.arianee.org/version5/ArianeeProductCertificate-i18n.json',
  medias: [
    {
      mediaType: 'video',
      type: 'videoPreview',
      url: 'https://api.bdh-ysl-polygon.arianee.com/pub/1674762111821-STILL_SQ_RARE.png',
    },
    {
      mediaType: 'video',
      type: 'videoSource',
      url: 'https://cdn-prod-1.arianee.com/ysl/SQ_RARE.mp4',
    },
    {
      mediaType: 'picture',
      type: 'brandItemBackgroundPicture',
      url: 'https://cdn-prod-1.arianee.com/ysl/STILL_WALLET_RARE.png',
    },
  ],
  externalContents: [
    {
      type: 'arianeeAccessTokenAuthLink',
      title: 'Claim Your Voucher',
      url: 'https://web3.yslbeauty.com/rewards/voucher',
    },
    {
      type: 'arianeeAccessTokenAuthLink',
      title: 'Receive Your Black Opium Gift Set',
      url: 'https://web3.yslbeauty.com/rewards/look-kit',
    },
    {
      type: 'arianeeAccessTokenAuthLink',
      title: 'Learn more about your Night Block',
      url: 'https://web3.yslbeauty.com/nightblocks',
    },
  ],
  i18n: [
    {
      language: 'fr-FR',
      name: 'YSL Beauty Night Block - The Nocturnal Dancer',
      description:
        "La collection des YSL Beauty Blocks s'agrandit avec l'arrivée de 2014 Night Blocks qui célèbrent l'univers unique du parfum Black Opium. Partez à la conquête de la nuit en collectant l'un de ces NFTs aussi hypnotiques que minimalistes.\n\nParmi les 2014 Night Blocks, 14 constituent l'édition ultra rare dont le nom, Nocturnal Dancer, a été choisi par la communauté YSL Beauté. En plus des avantages de l'édition originale tels que l'accès à la vente privée du prochain drop YSL Beauty Night Masters, ces 14 pièces débloquent des rewards exclusifs comme un coffret parfum et maquillage Black Opium.",
      subDescription: [],
      medias: [
        {
          mediaType: 'video',
          type: 'videoPreview',
          url: 'https://api.bdh-ysl-polygon.arianee.com/pub/1674762111821-STILL_SQ_RARE.png',
        },
        {
          mediaType: 'video',
          type: 'videoSource',
          url: 'https://cdn-prod-1.arianee.com/ysl/SQ_RARE.mp4',
        },
        {
          mediaType: 'picture',
          type: 'brandItemBackgroundPicture',
          url: 'https://cdn-prod-1.arianee.com/ysl/STILL_WALLET_RARE.png',
        },
      ],
      externalContents: [
        {
          type: 'arianeeAccessTokenAuthLink',
          title: 'Découvrez Votre Bon Cadeau',
          url: 'https://web3.yslbeauty.com/rewards/voucher',
        },
        {
          type: 'arianeeAccessTokenAuthLink',
          title: 'Obtenez Votre Coffret Black Opium',
          url: 'https://web3.yslbeauty.com/rewards/look-kit',
        },
        {
          type: 'arianeeAccessTokenAuthLink',
          title: 'Découvrez en plus sur votre Night block',
          url: 'https://web3.yslbeauty.com/nightblocks',
        },
      ],
      customAttributes: [],
      transparencyItems: [],
    },
  ],
  category: 'Digital Asset',
  language: 'en-US',
  name: 'YSL Beauty Night Block - The Nocturnal Dancer',
  description:
    'This addition to the YSL Beauty Blocks collection comes with the release of 2014 Night Blocks which capture the essence of the Black Opium universe in a hypnotic yet minimalistic NFT.\n\nOut of this collection, 14 were minted as the Rare Edition - the theme of Nocturnal Dancer was chosen by the YSL Beauty community. This ultra-rare NFT offers premium rewards, including a curated Black Opium gift, presale access to the YSL Beauty Night Masters NFT drop, and more.',
  attributes: [
    {
      trait_type: 'Block',
      value: 'Transparent with coral glitter and Black Opium Le Parfum bottle',
    },
    { trait_type: 'Background', value: 'Black with glitter floor' },
  ],
  image:
    'https://api.bdh-ysl-polygon.arianee.com/pub/1674762111821-STILL_SQ_RARE.png',
  animation_url: 'https://cdn-prod-1.arianee.com/ysl/SQ_RARE.mp4',
};

it('should be valid', () => {
  expect(true).toBeTruthy(); // this test will fail if there is an issue in the typing
});
