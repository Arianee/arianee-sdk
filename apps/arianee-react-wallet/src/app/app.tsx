// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useCallback, useEffect, useState } from 'react';

import Wallet from '@arianee/wallet';
import WalletHeader from './components/walletHeader';
import WalletNfts from './components/walletNfts';
import { ChainType } from '@arianee/common-types';
import { wallets } from './utils/wallet';
import WalletIdentities from './components/walletIdentities';

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
    setWallet(wallets[chainType]);
  }, [chainType]);

  return (
    <>
      {!wallet ? (
        <div>Loading...</div>
      ) : (
        <>
          <WalletHeader wallet={wallet} setChainType={setChainTypeCallback} />
          <WalletNfts wallet={wallet} />
          <WalletIdentities wallet={wallet} />
        </>
      )}
    </>
  );
}

export default App;
