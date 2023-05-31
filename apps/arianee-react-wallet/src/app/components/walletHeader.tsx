import Wallet from '@arianee/wallet';
import { ChainType, Language } from '@arianee/common-types';

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

  const nextChainType = wallet.chainType === 'testnet' ? 'mainnet' : 'testnet';

  return (
    <div>
      <div>
        <strong>Wallet:</strong> {wallet.getAddress()} (
        <button onClick={authenticate}>authenticate</button> / preferred
        language:{' '}
        <select
          defaultValue={language}
          onChange={(event) => setUserLanguage(event.target.value as Language)}
        >
          {LANGUAGES.map((_language) => (
            <option key={_language}>{_language}</option>
          ))}
        </select>
        )
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
      <ul>
        <li>
          <a href="#nfts">NFTs</a>
        </li>
        <li>
          <a href="#identities">Identities</a>
        </li>
        <li>
          <a href="#messages">Messages</a>
        </li>
      </ul>
    </div>
  );
}
