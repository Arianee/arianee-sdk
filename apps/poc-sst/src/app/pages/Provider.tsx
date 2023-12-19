import { ServiceProvider } from '@arianee/service-provider';
import React, { useCallback, useEffect, useState } from 'react';

import SmartAssetFromSST from '../components/SmartAssetFromSST';
import { CORES } from '../utils/wallet';

function Provider() {
  const [sst, setSST] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [transfered, setTransfered] = useState(false);

  const onClickTransfer = useCallback(
    async (address: string) => {
      if (!sst) throw new Error('cannot transfer without sst');

      try {
        setLoading(true);

        const serviceProvider = new ServiceProvider(
          CORES['serviceProviderWallet']
        );

        await serviceProvider.transferSmartAsset({ sst, to: address });

        await new Promise((resolve, _) => setTimeout(resolve, 5000));
        setTransfered(true);
      } finally {
        setLoading(false);
      }
    },
    [sst]
  );

  useEffect(() => {
    setSST(new URLSearchParams(window.location.search).get('SST'));
  }, [sst]);
  return (
    <div>
      <h1>provider page</h1>

      {loading && <p>loading...</p>}
      {!loading && !transfered && sst && (
        <SmartAssetFromSST sst={sst} onClickTransfer={onClickTransfer} />
      )}
      {!loading && transfered && (
        <p>
          transfered <a href={window.location.origin}>(go to wallets)</a>
        </p>
      )}
    </div>
  );
}

export default Provider;
