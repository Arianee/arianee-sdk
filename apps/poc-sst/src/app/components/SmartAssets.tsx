import Wallet, { SmartAssetInstance } from '@arianee/wallet';
import React, { useCallback, useEffect, useState } from 'react';

export interface SmartAssetsProps {
  wallet: Wallet;
  onClickSell: (smartAsset: SmartAssetInstance<'testnet'>) => void;
  onClickResetPermit721Approve: (
    smartAsset: SmartAssetInstance<'testnet'>
  ) => void;
}

function SmartAssets({
  wallet,
  onClickSell,
  onClickResetPermit721Approve,
}: Readonly<SmartAssetsProps>) {
  const [smartAssets, setSmartAssets] = useState<
    SmartAssetInstance<'testnet'>[]
  >([]);

  const [loading, setLoading] = useState(false);

  const _onClickSell = useCallback(
    (smartAsset: SmartAssetInstance<'testnet'>) => () =>
      onClickSell(smartAsset),
    [onClickSell]
  );

  const _onClickResetPermit721Approve = useCallback(
    (smartAsset: SmartAssetInstance<'testnet'>) => () =>
      onClickResetPermit721Approve(smartAsset),
    [onClickResetPermit721Approve]
  );

  useEffect(() => {
    // to prevent race condition
    let isCurrent = true;
    setLoading(true);

    const getSmartAssets = async () => {
      try {
        const smartAssetInstances = await wallet.smartAsset.getOwned();
        if (isCurrent) {
          setSmartAssets(smartAssetInstances);
          setLoading(false);
        }
      } catch (e) {
        console.error('Error while loading smart assets', e);
      }
    };

    getSmartAssets();

    return () => {
      isCurrent = false;
      setSmartAssets([]);
      setLoading(false);
    };
  }, [wallet]);
  return (
    <div>
      <h2>Smart Assets</h2>
      {loading && <p>loading...</p>}

      <ul>
        {smartAssets.map((smartAsset) => (
          <li key={smartAsset.data.certificateId}>
            {smartAsset.data.content.name}{' '}
            <button
              style={{ width: '100px', height: '30px', cursor: 'pointer' }}
              onClick={_onClickSell(smartAsset)}
            >
              Sell
            </button>
            <button
              style={{ width: '180px', height: '30px', cursor: 'pointer' }}
              onClick={_onClickResetPermit721Approve(smartAsset)}
            >
              Reset permit721 approve
            </button>
          </li>
        ))}
      </ul>

      {!loading && smartAssets.length === 0 && 'No smart asset found'}
    </div>
  );
}

export default SmartAssets;
