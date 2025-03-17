import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import { Core } from '@arianee/core';

export const example = async () => {
  const pk =
    '0x1fdc1c1014447d770b85ef507c256ffa5a186095948aadb0c28a76688d99d288';

  const core = Core.fromPrivateKey(pk);
  const arianeeAccessToken = new ArianeeAccessToken(core);
  const aat = await arianeeAccessToken.getValidWalletAccessToken({
    id: 'monSecondzefUser',
  });
  console.log(aat);

  const decoded = await ArianeeAccessToken.decodeJwt(aat);
  console.log(decoded);

  /*console.time('aatAddress');
  console.log(
    'Verifying validity of AAT issued by an eth address (0xf77e196a1ecfdafa444b7aef0967f973aae0e712)'
  );
  console.log(
    'JWT content',
    atob(
      'eyJpc3MiOiIweGY3N0UxOTZBMUVDZmRBRkE0NDRCN0FlZjA5NjdGOTczYUFlMEU3MTIiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjIyMDUzMjQ3MjQsImlhdCI6MTczMjI4NDcyM30='
    )
  );
  const valid1 = await ArianeeAccessToken.isArianeeAccessTokenValid(
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweGY3N0UxOTZBMUVDZmRBRkE0NDRCN0FlZjA5NjdGOTczYUFlMEU3MTIiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjIyMDUzMjQ3MjQsImlhdCI6MTczMjI4NDcyM30=.0x4a527c4b27231291e38e65c549f3a978b56f3b3d7d66118cf6332dc30360ccb66a3d75c679480d23131467e90ea8260b9a014f4f4f2a13226332eac698e1d12b1c'
  );
  console.log('valid', valid1);
  console.timeEnd('aatAddress');*/
};
