import Wallet from '@arianee/wallet';
import React from 'react';

import { WALLETS, WalletsRecord } from '../utils/wallet';

export interface WalletSelectorProps {
  walletsRecord: WalletsRecord;
  currentWallet: Wallet;
  setCurrentWallet: (walletName: keyof typeof WALLETS) => void;
}

function WalletSelector({
  walletsRecord,
  currentWallet,
  setCurrentWallet,
}: Readonly<WalletSelectorProps>) {
  return (
    <div>
      <b>Selected wallet: </b>
      <select
        name="currentSelect"
        onChange={(event) =>
          setCurrentWallet(event.target.value as keyof typeof WALLETS)
        }
      >
        {Object.entries(walletsRecord).map(([name, wallet]) => (
          <option key={name} value={name}>
            {name} ({wallet.getAddress().slice(0, 20)}...)
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          navigator.clipboard.writeText(currentWallet.getAddress());
        }}
      >
        Copy address
      </button>
    </div>
  );
}

export default WalletSelector;
