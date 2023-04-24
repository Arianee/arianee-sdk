// TypeScript test
// If there is a regression in the types, then the typescript server will report an error and the build will fail.

import { ArianeeBrandIdentityI18N } from '../arianeeBrandIdentity-i18n';

// Minimal case
const minimalBrandIdentity: ArianeeBrandIdentityI18N = {
  $schema: 'my-schema',
};

// Real use case
const arianeeBrandIdentityPolygon: ArianeeBrandIdentityI18N = {
  $schema: 'https://cert.arianee.org/version2/ArianeeBrandIdentity-i18n.json',
  name: 'Arianee',
  description:
    '<b>The Digital Identity Consortium</b><br/>\nConsumption behaviors are changing, new generations have a digital life of their own and the demand for data privacy is increasing.\nWhat if brands could propose a modern way of owning their creations? What if, thanks to technology, we could augment the ownership of goods?\n\nAt Arianee we are building perpetual relationships between brands and owners, made of trust, respect and transparency.\n\nWith the Arianee protocol, ownership is augmented and groundbreaking features are added to the most valuable items.',
  arianeeMembership: 'associate_member',
  address: {
    street_address: '12 Rue Philippe de Girard',
    zipcode: '75010',
    city: 'Paris',
    country: 'France',
  },
  pictures: [
    {
      type: 'brandLogoHeader',
      url: 'https://theseus.arianee.org/pub/-LvRQM23uL73ArIyshF0',
    },
    {
      type: 'brandLogoHeaderReversed',
      url: 'https://api.bdh-arianee-test.arianee.com/pub/1631629031152-BrandLogoHeaderblanc.png',
    },
    {
      type: 'brandLogoSquare',
      url: 'https://theseus.arianee.org/pub/-M0vj64EKf288-E08H_K_arianeeResized',
    },
    {
      type: 'brandHomePicture',
      url: 'https://api.bdh-arianee-test.arianee.com/pub/1631629074766-Brand-ID-BrandCollection.jpg',
    },
    {
      type: 'brandItemBackgroundPicture',
      url: 'https://api.bdh-arianee-test.arianee.com/pub/1631629163892-Brand-ID-BrandItemBackGround.jpg',
    },
    {
      type: 'itemBackgroundPicture',
      url: 'https://api.bdh-arianee-test.arianee.com/pub/1631629017747-Brand-ID-ItemBackGroundPicture.jpg',
    },
    {
      type: 'brandBackgroundPicture',
      url: 'https://api.bdh-arianee-test.arianee.com/pub/1631629203194-Brand-ID-BackGround-CertificateBackGround.jpg',
    },
    {
      type: 'certificateBackgroundPicture',
      url: 'https://api.bdh-arianee-test.arianee.com/pub/1631629203194-Brand-ID-BackGround-CertificateBackGround.jpg',
    },
  ],
  socialmedia: [
    { type: 'facebook', value: '208072396631649' },
    { type: 'twitter', value: 'arianeeproject' },
    { type: 'instagram', value: 'arianee_project' },
  ],
  rpcEndpoint: 'https://api.bdh-demo-polygon.arianee.com/rpc',
};

// Real use case 2
const breitlingBrandIdentityPreprod: ArianeeBrandIdentityI18N = {
  $schema: 'https://cert.arianee.org/version2/ArianeeBrandIdentity-i18n.json',
  name: 'Breitling',
  companyName: 'Breitling AG',
  description:
    'Breitling AG is a leading Swiss\nluxury watchmaker based in\nGrenchen, Switzerland. The\ncompany was founded in 1884 by\nLéon Breitling in Saint-Imier.',
  externalContents: [
    {
      type: 'website',
      title: 'Breitling.com',
      url: 'https://www.breitling.com',
    },
  ],
  arianeeMembership: 'maison_member',
  address: {
    street_address:
      'Schlachthausstrasse 2 (as of 1.1.2020 “Léon Breitling-Strasse 2)',
    zipcode: '2540',
    city: 'Grenchen',
    country: 'Switzerland,',
  },
  pictures: [
    {
      type: 'brandLogoHeader',
      url: 'https://bdh-breitling-preprod.firebaseapp.com/pub/-M-j0rivm7OR9ycnwSWl_arianeeResized',
    },
    {
      type: 'brandLogoHeaderReversed',
      url: 'https://bdh-breitling-preprod.firebaseapp.com/pub/-M-j0qO25GHgasOeBYwU_arianeeResized',
    },
    {
      type: 'brandLogoSquare',
      url: 'https://bdh-breitling-preprod.firebaseapp.com/pub/-M-neb6DCbwhT77Y751Q_arianeeResized',
    },
    {
      type: 'brandHomePicture',
      url: 'https://bdh-breitling-preprod.firebaseapp.com/pub/-M02UmBSSB6NXa1Wef0q_arianeeResized',
    },
    {
      type: 'brandItemBackgroundPicture',
      url: 'https://bdh-breitling-preprod.firebaseapp.com/pub/-M02UrNNi3KOTb3qyyoi_arianeeResized',
    },
    {
      type: 'itemBackgroundPicture',
      url: 'https://bdh-breitling.api.pre-production.arianee.com/pub/1678729026304-10.About-Page-Squadonamission.jpg',
    },
    {
      type: 'brandBackgroundPicture',
      url: 'https://bdh-breitling-preprod.firebaseapp.com/pub/-M02W-aQCwiyFBYkenlV_arianeeResized',
    },
    {
      type: 'certificateBackgroundPicture',
      url: 'https://bdh-breitling-preprod.firebaseapp.com/pub/-M02W0c-Gymu-9rOUVlC_arianeeResized',
    },
  ],
  socialmedia: [
    { type: 'facebook', value: '132650476760454' },
    { type: 'instagram', value: 'breitling' },
    { type: 'twitter', value: 'breitling' },
    {
      type: 'youtube',
      value: 'https://www.youtube.com/user/BreitlingOfficial',
    },
  ],
  rpcEndpoint: 'https://bdh-breitling.api.pre-production.arianee.com/rpc',
};

// Real use case 3
const yslBeautyBrandIdentityProd: ArianeeBrandIdentityI18N = {
  $schema: 'https://cert.arianee.org/version2/ArianeeBrandIdentity-i18n.json',
  name: 'YSL Beauty',
  description:
    'YSL has always been committed to being a pioneer, striving to be a daring change-maker. <br>\nToday, we are witnessing the rise of web3, a complex new world full of discovery, possibilities and opportunity.<br>\nTrue to our desire to dress the change, we are thrilled to join this new experimental playground.\n <br><br>\nTo us, web3 holds the promise of intensified experiences, where artistic reinvention and genuine emotions collide.<br>\nWe wish to take you on this journey so you can EXPLORE DEEPLY and LIVE INTENSELY.<br>\nTogether, let’s invent a place where everyone can feel confident, audacious, empowered and most of all, FREE.<br>\nOn this path into the unknown, we believe there is room to play with the codes of beauty, to push the boundaries of creativity and technology and to help shape a bolder present.<br><br>\n\nOn the edge of reality. <br>\nTo live unapologetically.',
  externalContents: [
    {
      type: 'website',
      title: '@yslbeauty',
      url: 'https://instagram.com/yslbeauty?igshid=YmMyMTA2M2Y=',
    },
    { type: 'deepLinkDomain', url: 'https://polygon.yslbeauty.com' },
  ],
  i18n: [
    {
      language: 'fr-FR',
      description:
        "YSL Beauté s'est toujours positionné comme acteur du changement. <br>\nL'essor actuel du web3 promet l'émergence d'un monde complexe et passionnant, porteur de découvertes et d'opportunités illimitées. <br>\nFidèle à notre esprit pionnier et à notre volonté volonté d'encourager et d'accompagner les transformations culturelles, nous sommes ravis d'explorer ce nouveau terrain de jeu avec audace et créativité.\n  <br><br>\nPour nous, le web3 recèle la promesse d'expériences augmentées, où réinvention artistique et émotions authentiques se rencontrent d'une manière inédite.<br>\nNous souhaitons vous inviter à nous rejoindre dans cette aventure afin que vous puissiez EXPLORER PLEINEMENT et VIVRE INTENSEMENT.<br>\nEnsemble, inventons un lieu où chacun peut se sentir confiant et fort, en toute liberté.<br>\nSur ce chemin vers l'inconnu, nous pensons qu'il est possible de jouer avec les codes de la beauté, de repousser les limites de la créativité et de la technologie et de contribuer à façonner un présent plus audacieux.\n <br><br>\n Aux confins de la réalité. Sans compromis.",
    },
  ],
  pictures: [
    {
      type: 'brandLogoHeader',
      url: 'https://api.bdh-ysl-poa.arianee.com/pub/1652288539676-YSLLOGOYVESSAINTLAURENTBEAUTEBLACK.png',
    },
    {
      type: 'brandLogoHeaderReversed',
      url: 'https://api.bdh-ysl-poa.arianee.com/pub/1652288552156-YSLLOGOYVESSAINTLAURENTBEAUTEWHITE.png',
    },
    {
      type: 'brandLogoSquare',
      url: 'https://api.bdh-ysl-poa.arianee.com/pub/1652290197648-Sanstitre.png',
    },
    {
      type: 'brandHomePicture',
      url: 'https://api.bdh-ysl-poa.arianee.com/pub/1652288605256-3200X1900-C.png',
    },
    {
      type: 'brandBackgroundPicture',
      url: 'https://api.bdh-ysl-poa.arianee.com/pub/1652288633973-1900X3200-A.png',
    },
    {
      type: 'brandItemBackgroundPicture',
      url: 'https://api.bdh-ysl-poa.arianee.com/pub/1652288826129-1650648704006-3200x1900noire.jpeg',
    },
    {
      type: 'itemBackgroundPicture',
      url: 'https://api.bdh-ysl-poa.arianee.com/pub/1652288845321-1650648478041-3.png',
    },
    {
      type: 'certificateBackgroundPicture',
      url: 'https://api.bdh-ysl-preprod.arianee.com/pub/1650648478041-3.png',
    },
  ],
  rpcEndpoint: 'https://api.bdh-ysl-polygon.arianee.com/rpc',
};

it('should be valid', () => {
  expect(true).toBeTruthy(); // this test will fail if there is an issue in the typing
});
