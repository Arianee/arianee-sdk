import Wallet from '@arianee/wallet';
import { ChainType, Language } from '@arianee/common-types';
import { arianeeAccessToken } from '../utils/wallet';
import { readLink } from '@arianee/utils';

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
  const authenticate = async () => {
    await wallet.authenticate();
    alert('authenticated');
  };

  const handleLink = () => {
    const link = prompt('Enter link');
    if (!link) return;
    try {
      const decodedLink = readLink(link);
      alert('Link read (see console), handling will be implemented later...');
      console.log(decodedLink);
    } catch (e) {
      console.error(e);
      alert('Error while reading link (see console)');
    }

    // todo: add handle link call from wallet when implemented later
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
        <button onClick={handleLink}>handle link</button>
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
