// import certificateRead from './arianee-privacy-gateway-client/certificateRead';
// import walletApiLanding from './wallet-api-client/landing';
// import walletApiWallet from './wallet-api-client/wallet';
// import arianeeApiClient from './arianee-api-client/arianee-api-client';
// import links from './wallet-api-client/links';
// import protocolClient from './arianee-protocol-client';
//import createAndStore from './creator/createAndStore';
// import protocolClientV2 from './arianee-protocol-client/protocolClientV2';

import ArianeeProtocolClient, {
  callWrapper,
} from '@arianee/arianee-protocol-client';
import Core from '@arianee/core';
import { calculateImprint, defaultFetchLike } from '@arianee/utils';

(async () => {
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

  const t = new ArianeeProtocolClient(Core.fromRandom());

  const imprint = await callWrapper(t, 'testnet', {
    protocolV1Action: (v1) => v1.smartAssetContract.tokenImprint(179389138),
    protocolV2Action: (v2) => '' as any,
  });

  const imprint2 = await calculateImprint(
    {
      $schema:
        'https://cert.arianee.org/version5/ArianeeProductCertificate-i18n.json',
      parentCertificates: [
        {
          type: 'Full',
          arianeeLink: 'https://test.arianee.net/40307546,nerh7lcg49u9',
        },
      ],
      customAttributes: [
        {
          type: 'deferred_claim',
          value: 'https://bdh-enduser.api.staging.arianee.com',
        },
      ],
    },
    defaultFetchLike
  );

  console.log('imprint', imprint);
  console.log('imprint2', imprint2);
})();
