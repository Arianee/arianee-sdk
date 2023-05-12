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
  const nextChainType = wallet.chainType === 'testnet' ? 'mainnet' : 'testnet';

  return (
    <div>
      <strong>Wallet:</strong> {wallet.getAddress()}
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
