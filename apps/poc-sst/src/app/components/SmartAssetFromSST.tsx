import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import Core from '@arianee/core';
import { ServiceProvider } from '@arianee/service-provider';
import { SmartAssetInstance } from '@arianee/wallet';
import React, { useEffect, useState } from 'react';

import { WALLETS } from '../utils/wallet';

export interface SmartAssetFromSSTProps {
  sst: string;
  onClickTransfer: (address: string) => void;
}

function SmartAssetFromSST({
  sst,
  onClickTransfer,
}: Readonly<SmartAssetFromSSTProps>) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [smartAsset, setSmartAsset] = useState<SmartAssetInstance<
    'testnet',
    'WAIT_TRANSACTION_RECEIPT'
  > | null>(null);

  useEffect(() => {
    // to prevent race condition
    let isCurrent = true;
    setLoading(true);

    const getSmartAssetFromSST = async () => {
      try {
        const serviceProvider = new ServiceProvider(Core.fromRandom());

        const valid = await serviceProvider.isValidSST({ sst });
        if (!valid) {
          setError('Invalid SST');
          return;
        }

        const { network, subId: tokenId } = (
          await ArianeeAccessToken.decodeJwt(sst)
        ).payload;
        const _smartAsset = await serviceProvider.getSmartAssetFromSST({ sst });

        if (isCurrent) {
          setSmartAsset(_smartAsset);
        }
      } catch (e: unknown) {
        console.error('Error while loading smart asset', e);
        setError(e instanceof Error ? e.message : 'unknown error');
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    getSmartAssetFromSST();

    return () => {
      isCurrent = false;
      setSmartAsset(null);
      setLoading(false);
    };
  }, []);

  return (
    <div>
      {loading && <p>loading...</p>}

      {smartAsset ? (
        <div>
          <span>SST:</span> <input value={sst} readOnly />
          <br />
          <span>You are selling this smart asset:</span>{' '}
          <b>{smartAsset.data.content.name}</b>{' '}
          <button
            style={{ cursor: 'pointer' }}
            onClick={() =>
              onClickTransfer(WALLETS.secondUserWallet.getAddress())
            }
          >
            Proceed (transfer to second user{' '}
            {WALLETS.secondUserWallet.getAddress().slice(0, 10)}...)
          </button>{' '}
          <button
            style={{ cursor: 'pointer' }}
            onClick={() => onClickTransfer(WALLETS.userWallet.getAddress())}
          >
            Proceed (transfer to first user{' '}
            {WALLETS.userWallet.getAddress().slice(0, 10)}
            ...)
          </button>
        </div>
      ) : (
        <></>
      )}
      {error && 'An error has occurred: ' + error}
    </div>
  );
}

export default SmartAssetFromSST;
