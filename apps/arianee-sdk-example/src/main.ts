// import certificateRead from './arianee-privacy-gateway-client/certificateRead';
// import walletApiLanding from './wallet-api-client/landing';
// import walletApiWallet from './wallet-api-client/wallet';
// import arianeeApiClient from './arianee-api-client/arianee-api-client';
// import links from './wallet-api-client/links';
// import protocolClient from './arianee-protocol-client';
// import protocolClientV2 from './arianee-protocol-client/protocolClientV2';
// import createAndStore from './creator/createAndStore';
// import privacyMode from './creator/privacy';
import { createLink } from '@arianee/utils';

(async () => {
  // console.log('Uncomment the code you want to run');

  // await certificateRead();
  // await walletApiLanding();
  // await walletApiWallet();
  // await wallet();
  // await arianeeApiClient();
  // await arianeeApiClient();
  // await links();
  // await protocolClient();
  // await createAndStore();
  // await protocolClientV2();
  // await privacyMode();
  console.log(
    createLink({
      slug: 'richemontSupernet',
      tokenId: '1',
      passphrase: 'test',
    })
  );
})();
