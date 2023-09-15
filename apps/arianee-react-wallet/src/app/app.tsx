// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ChainType, Language } from '@arianee/common-types';
import Wallet from '@arianee/wallet';
import { useCallback, useEffect, useState } from 'react';

import WalletHeader from './components/walletHeader';
import WalletIdentities from './components/walletIdentities';
import WalletMessages from './components/walletMessages';
import WalletNfts from './components/walletNfts';
import { getWallet } from './utils/wallet';

export function App() {
  const [wallet, setWallet] = useState<Wallet<ChainType> | null>(null);
  const [walletApiUrl, setWalletApiUrl] = useState<string | null>(null);
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

  const connectToProductionApiUrl = useCallback(() => {
    setWalletApiUrl('https://wallet-api.arianee.com/');
  }, [setWalletApiUrl]);

  const connectToLocalhostApiUrl = useCallback(() => {
    setWalletApiUrl('http://localhost:3000/');
  }, [setWalletApiUrl]);

  useEffect(() => {
    (async () => {
      if (!walletApiUrl) return;

      const wallet = getWallet(chainType, walletApiUrl);
      await wallet.authenticate();
      setWallet(wallet);
    })();
  }, [chainType, walletApiUrl]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (walletApiUrl) return;

      if (event.key === '0') {
        connectToProductionApiUrl();
      } else if (event.key === '1') {
        connectToLocalhostApiUrl();
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [walletApiUrl, setWalletApiUrl]);

  return (
    <>
      {!walletApiUrl ? (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <h1>ReactWallet</h1>
          <div>
            Choose Wallet API url (or press <i>'0'</i> or <i>'1'</i>):
          </div>
          <button
            style={{
              width: '250px',
              height: '40px',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: '5px',
            }}
            onClick={connectToProductionApiUrl}
          >
            (0) https://wallet-api.arianee.com/
          </button>
          <br />
          <button
            style={{
              width: '250px',
              height: '40px',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: '5px',
            }}
            onClick={connectToLocalhostApiUrl}
          >
            (1) http://localhost:3000/
          </button>
        </div>
      ) : (
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
      )}
    </>
  );
}

export default App;
