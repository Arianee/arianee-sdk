import { ChainType } from '@arianee/common-types';
import { SmartAssetInstance } from '@arianee/wallet';
import { TransactionReceipt } from 'ethers';
import { useEffect, useState } from 'react';

export interface ArianeeEventProps {
  event: SmartAssetInstance<ChainType>['arianeeEvents'][number];
  refreshNfts: () => void;
}

export default function Message({ event, refreshNfts }: ArianeeEventProps) {
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);

  const accept = async () => {
    if (txLoading) return;

    setTxLoading(true);
    const receipt = await event.acceptEvent();
    setReceipt(receipt);
    setTxLoading(false);
    refreshNfts();
  };

  const refuse = async () => {
    if (txLoading) return;

    setTxLoading(true);
    const receipt = await event.refuseEvent();
    setReceipt(receipt);
    setTxLoading(false);
    refreshNfts();
  };

  useEffect(() => {
    setTxLoading(false);
    setReceipt(null);
  }, [event]);

  return (
    <div
      style={{
        background: '#aaa',
        padding: '4px',
        borderRadius: '4px',
        margin: '4px 0',
      }}
    >
      <b>{event.content.title ?? 'untitled event'}</b> (authenticity:{' '}
      {event.isAuthentic ? '✅' : '❌'})
      <br />
      <i>id: {event.id}</i>
      <div className="receipt">
        {receipt && (
          <>
            <h5>TX Receipt</h5>
            <textarea
              readOnly={true}
              value={JSON.stringify(receipt, undefined, 2)}
            ></textarea>
          </>
        )}
      </div>
      <div
        className="actions"
        style={{
          marginBottom: '16px',
        }}
      >
        {event.pending ? (
          <>
            <button disabled={txLoading} onClick={accept}>
              {txLoading ? 'loading...' : 'Accept'}
            </button>
            <button disabled={txLoading} onClick={refuse}>
              {txLoading ? 'loading...' : 'Refuse'}
            </button>
          </>
        ) : (
          '✅ event accepted'
        )}
      </div>
    </div>
  );
}
