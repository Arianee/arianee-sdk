import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import { ChainType } from '@arianee/common-types';
import Core from '@arianee/core';
import Wallet from '@arianee/wallet';
import WalletApiClient from '@arianee/wallet-api-client';

const mnemonic =
  'sunset setup moral spoil stomach flush document expand rent siege perfect gauge';

const prefix = '';

const core = Core.fromMnemonic(mnemonic);

export const arianeeAccessToken = new ArianeeAccessToken(core, {
  initialValues: {
    walletAccessToken: '',
    //   'eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweEE5QmM5MEQyNEQwYjg0OTUwNDNBYjU4NTc0NTU0NDQ2MzAwMjhDQUYiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjE3MDIzMjMyNDAwNzEsImlhdCI6MTcwMTk2MzI0MDA3MX0=.0x0c4e0094873e36b54c670fa01555213300da2abe2b51728a4f735b69cf5bb5b709f407108d40bfa40a9498394a92aa1e973ba0a3a4cbf561c840039108f5a7481c',
  },
});

export const getWallet = (chainType: ChainType, walletApiUrl: string) => {
  const walletApiClient = new WalletApiClient(chainType, core, {
    apiURL: walletApiUrl,
    arianeeAccessToken,
    arianeeAccessTokenPrefix: prefix,
  });

  const wallet = new Wallet({
    auth: { core },
    walletAbstraction: walletApiClient,
    chainType,
    arianeeAccessToken,
    arianeeAccessTokenPrefix: prefix,
  });

  return wallet;
};
