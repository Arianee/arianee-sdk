// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { approvePermit721, generateSST } from '@arianee/token-provider';
import { SmartAssetInstance } from '@arianee/wallet';
import { ethers } from 'ethers';
import { useCallback, useState } from 'react';

import { environment } from '../../environments/environment';
import SmartAssets from '../components/SmartAssets';
import WalletSelector from '../components/WalletSelector';
import { CORES, WALLETS } from '../utils/wallet';

export function Client() {
  const [currentWalletName, setCurrentWalletName] =
    useState<keyof typeof WALLETS>('userWallet');

  const [loading, setLoading] = useState(false);

  const onClickSell = useCallback(
    async (smartAsset: SmartAssetInstance<'testnet'>) => {
      try {
        setLoading(true);
        const sst = await generateSST({
          core: CORES[currentWalletName],
          smartAsset: smartAsset.data,
          spender: environment.serviceProviderAddress,
          permit721Address: environment.permit721Address,
        });
        window.open(`${environment.serviceProviderCallbackUrl}?SST=${sst}`);
      } finally {
        setLoading(false);
      }
    },
    [currentWalletName]
  );
  const onClickResetPermit721Approve = useCallback(
    async (smartAsset: SmartAssetInstance<'testnet'>) => {
      try {
        setLoading(true);
        const sst = await approvePermit721({
          tokenId: smartAsset.data.certificateId,
          core: CORES[currentWalletName],
          protocolName: smartAsset.data.protocol.name,
          permit721Address: ethers.ZeroAddress,
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <div>
      <h1>SST POC: Client</h1>
      <WalletSelector
        walletsRecord={WALLETS}
        currentWallet={WALLETS[currentWalletName]}
        setCurrentWallet={setCurrentWalletName}
      />
      <br />
      <br />
      <b>
        If the transaction takes some time after clicking sell, your browser may
        block the popup, ensure that you've allowed popups for this website
      </b>
      {loading ? (
        <p>loading...</p>
      ) : (
        <SmartAssets
          onClickSell={onClickSell}
          onClickResetPermit721Approve={onClickResetPermit721Approve}
          wallet={WALLETS[currentWalletName]}
        />
      )}
    </div>
  );
}

export default Client;
