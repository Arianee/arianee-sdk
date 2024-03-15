import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import { Core } from '@arianee/core';
import WalletApiClient from '@arianee/wallet-api-client';

export default async () => {
  const core = Core.fromPrivateKey(
    '0x56b56751c357d857162301e9ffb4249bcf4269263afa7464fc4bf2de068c1de5'
  );
  const arianeeAccessToken = new ArianeeAccessToken(core);

  const client = new WalletApiClient('testnet', core, {
    apiURL: 'http://127.0.0.1:3000/',
    arianeeAccessToken,
  });

  const linkDetails = await client.handleLink(
    'https://test.arian.ee/47967078,wkauvo3mrny4'
  );

  const one2manyFinalLinkDetails = await client.handleLink(
    'https://test.arian.ee/47967078,wkauvo3mrny4',
    {
      resolveFinalNft: true,
      arianeeAccessToken: await arianeeAccessToken.getValidWalletAccessToken(),
    }
  );

  console.log(linkDetails, one2manyFinalLinkDetails);
};
