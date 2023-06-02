// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useCallback, useEffect, useState } from 'react';

import Wallet from '@arianee/wallet';
import WalletHeader from './components/walletHeader';
import WalletNfts from './components/walletNfts';
import { ChainType, Language } from '@arianee/common-types';
import { wallets } from './utils/wallet';
import WalletIdentities from './components/walletIdentities';
import WalletMessages from './components/walletMessages';

export function App() {
  const [wallet, setWallet] = useState<Wallet<ChainType> | null>(null);
  const [chainType, setChainType] = useState<ChainType>('testnet');
  const [userLanguage, setUserLanguage] = useState<Language>('en-US');

  const setChainTypeCallback = useCallback(
    (newChainType: ChainType) => {
      setChainType(newChainType);
    },
    [setChainType]
  );

  const setUserLanguageCallback = useCallback(
    (newLanguage: Language) => {
      setUserLanguage(newLanguage);
    },
    [setUserLanguage]
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
          <WalletHeader
            wallet={wallet}
            language={userLanguage}
            setChainType={setChainTypeCallback}
            setUserLanguage={setUserLanguageCallback}
          />
          <div style={{ marginTop: '80px' }}>
            <WalletNfts wallet={wallet} language={userLanguage} />
            <WalletIdentities wallet={wallet} language={userLanguage} />
            <WalletMessages wallet={wallet} language={userLanguage} />
          </div>
        </>
      )}
    </>
  );
}

export default App;
