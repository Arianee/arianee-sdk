import Wallet from '@arianee/wallet';
import { ChainType } from '@arianee/common-types';

export interface WalletHeaderProps {
  wallet: Wallet<ChainType>;
  setChainType: (newChainType: ChainType) => void;
}

export default function WalletHeader({
  wallet,
  setChainType,
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
        <a href="#" onClick={authenticate}>
          authenticate
        </a>
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
