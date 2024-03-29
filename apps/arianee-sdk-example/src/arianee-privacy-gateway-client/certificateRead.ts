/**
 * The following is an example of how to use the ArianeePrivacyGatewayClient to
 * retrieve the data of a certificate from the Arianee Privacy Gateway.
 *
 * It demonstrates how the content can be retrieved from:
 * - an arianee access token generated by the smart asset's owner wallet
 * - from a signature by the smart asset's owner wallet
 * - from a signature by a wallet generated from the smart asset's passphrase
 */

import { ArianeePrivacyGatewayClient } from '@arianee/arianee-privacy-gateway-client';
import { Core } from '@arianee/core';

export default async () => {
  const ownerApg = new ArianeePrivacyGatewayClient(
    Core.fromMnemonic(
      'sunset setup moral spoil stomach flush document expand rent siege perfect gauge'
    ),
    fetch as any
  );

  const randomApg = new ArianeePrivacyGatewayClient(
    Core.fromRandom(),
    fetch as any
  );

  const [
    resFromArianeeAccessToken,
    resFromSignatureByWallet,
    resFromSignatureByPassphrase,
  ] = await Promise.all([
    ownerApg.certificateRead(
      'https://bdh-enduser.api.staging.arianee.com/rpc',
      {
        certificateId: '92988157',
      }
    ),
    ownerApg.certificateRead(
      'https://bdh-enduser.api.staging.arianee.com/rpc',
      {
        certificateId: '92988157',
        passphrase: '6y59oc401esl',
      }
    ),
    randomApg.certificateRead(
      'https://bdh-enduser.api.staging.arianee.com/rpc',
      {
        certificateId: '92988157',
        passphrase: '6y59oc401esl',
      }
    ),
  ]);

  const allEqual =
    JSON.stringify(resFromSignatureByPassphrase) ===
      JSON.stringify(resFromSignatureByWallet) &&
    JSON.stringify(resFromSignatureByWallet) ===
      JSON.stringify(resFromArianeeAccessToken);

  console.log(JSON.stringify(resFromArianeeAccessToken, undefined, 2) + '\n\n');
  console.log(`${allEqual ? '✅' : '❌'} All equal: ${allEqual}`);
};
