import { ArianeeAccessToken } from '@arianee/arianee-access-token';

export const example = async () => {
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

  console.time('aatDomain');
  console.log('Verifying validity of AAT issued by arianee.com');
  console.log(
    'JWT content',
    atob(
      'eyJpc3MiOiJhcmlhbmVlLmNvbSIsInN1YiI6IndhbGxldCIsImV4cCI6MjIwNTEzOTUyOSwiaWF0IjoxNzMyMDk5NTI5fQ=='
    )
  );

  for (let i = 0; i < 20; i++) {
    console.log('wait...');
    const valid2 = await ArianeeAccessToken.isArianeeAccessTokenValid(
      'redacted token', // put an ENS issued token here to test
      false,
      { disableENSResolverCache: false }
    );
    console.log('valid', valid2);
  }
  console.timeEnd('aatDomain');
};
