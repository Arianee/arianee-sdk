// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useCallback, useEffect, useState } from 'react';

import Wallet from '@arianee/wallet';
import WalletHeader from './components/walletHeader';
import WalletNfts from './components/walletNfts';
import { ChainType } from '@arianee/common-types';
import { wallets } from './utils/wallet';
import WalletIdentities from './components/walletIdentities';
import WalletMessages from './components/walletMessages';

export function App() {
  const [wallet, setWallet] = useState<Wallet<ChainType> | null>(null);
  const [chainType, setChainType] = useState<ChainType>('testnet');

  const setChainTypeCallback = useCallback(
    (newChainType: ChainType) => {
      setChainType(newChainType);
    },
    [setChainType]
  );

  useEffect(() => {
    (async () => {
      const wallet = wallets[chainType];
      await wallet.authenticate();
      setWallet(wallet);
    })();
  }, [chainType]);

  return (
    <>
      {!wallet ? (
        <div>Loading ({chainType})...</div>
      ) : (
        <>
          <WalletHeader wallet={wallet} setChainType={setChainTypeCallback} />
          <WalletNfts wallet={wallet} />
          <WalletIdentities wallet={wallet} />
          <WalletMessages wallet={wallet} />
        </>
      )}
    </>
  );
}

export default App;
