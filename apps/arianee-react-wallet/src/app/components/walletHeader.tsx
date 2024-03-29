import { ChainType, Language } from '@arianee/common-types';
import Wallet from '@arianee/wallet';
import { useState } from 'react';

import { arianeeAccessToken } from '../utils/wallet';

export interface WalletHeaderProps {
  wallet: Wallet<ChainType>;
  language: Language;
  setChainType: (newChainType: ChainType) => void;
  setUserLanguage: (newLanguage: Language) => void;
}

const LANGUAGES: Language[] = [
  'fr-FR',
  'en-US',
  'zh-TW',
  'zh-CN',
  'ko-KR',
  'ja-JP',
  'de-DE',
  'es',
  'it',
];

const logArianeeAccessToken = async () => {
  console.log('Arianee access token');
  console.log(await arianeeAccessToken.getValidWalletAccessToken());
};

export default function WalletHeader({
  wallet,
  language,
  setChainType,
  setUserLanguage,
}: WalletHeaderProps) {
  const [handlingLink, setHandlingLink] = useState<boolean>(false);
  const [handlingSuccess, setHandlingSuccess] = useState<boolean | null>(null);

  const authenticate = async () => {
    await wallet.authenticate();
    alert('authenticated');
  };

  const handleLink = async (resolveFinalNft = false) => {
    const link = prompt(
      `Enter link (resolveFinalNft=${resolveFinalNft})\nResult will be logged in the console `
    );
    if (!link) return;
    setHandlingLink(true);
    try {
      const smartAsset = await wallet.smartAsset.getFromLink(
        link,
        resolveFinalNft
      );
      setHandlingSuccess(true);
      console.log(
        `handle link result (link: ${link}, resolveFinalNft: ${resolveFinalNft})`,
        smartAsset
      );
    } catch (e) {
      console.error(e);
      setHandlingSuccess(false);
    } finally {
      setHandlingLink(false);
      setTimeout(() => setHandlingSuccess(null), 2000);
    }
  };

  const nextChainType = wallet.chainType === 'testnet' ? 'mainnet' : 'testnet';

  return (
    <div
      style={{
        position: 'fixed',
        background: '#aaa',
        width: '100%',
        margin: 0,
        left: 0,
        top: 0,
        height: '50px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '8px',
        zIndex: '1000',
      }}
    >
      <div>
        <strong>Wallet:</strong> {wallet.getAddress()} (preferred language:{' '}
        <select
          defaultValue={language}
          onChange={(event) => setUserLanguage(event.target.value as Language)}
        >
          {LANGUAGES.map((_language) => (
            <option key={_language}>{_language}</option>
          ))}
        </select>
        ) <button onClick={authenticate}>force authenticate</button>{' '}
        <button onClick={logArianeeAccessToken}>
          log arianee access token
        </button>{' '}
        <button
          disabled={handlingLink}
          onClick={() => handleLink(false)}
          style={{
            background: colorFromHandlingSuccess(handlingSuccess),
          }}
        >
          {handlingLink ? 'loading...' : 'handle link (without resolve)'}
        </button>{' '}
        <button
          disabled={handlingLink}
          onClick={() => handleLink(true)}
          style={{
            background: colorFromHandlingSuccess(handlingSuccess),
          }}
        >
          {handlingLink ? 'loading...' : 'handle link (with resolve)'}
        </button>
        <br />
        <strong>Chain type:</strong>{' '}
        {nextChainType === 'testnet' ? (
          <a href="#" onClick={() => setChainType(nextChainType)}>
            testnet
          </a>
        ) : (
          <a>testnet</a>
        )}{' '}
        /{' '}
        {nextChainType === 'mainnet' ? (
          <a href="#" onClick={() => setChainType(nextChainType)}>
            mainnet
          </a>
        ) : (
          <a>mainnet</a>
        )}
      </div>
    </div>
  );
}

const colorFromHandlingSuccess = (handlingSuccess: boolean | null) => {
  switch (handlingSuccess) {
    case true:
      return 'lightgreen';
    case false:
      return 'crimson';
    default:
      return undefined;
  }
};
