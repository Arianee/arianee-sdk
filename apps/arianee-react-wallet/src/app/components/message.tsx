import { ChainType } from '@arianee/common-types';
import { MessageInstance } from '@arianee/wallet';
import { TransactionReceipt } from 'ethers';
import { useEffect, useState } from 'react';

export interface MessageProps {
  messageInstance: MessageInstance<ChainType, 'WAIT_TRANSACTION_RECEIPT'>;
  index: number;
}

export default function Message({ messageInstance, index }: MessageProps) {
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);

  const markAsRead = async () => {
    if (txLoading) return;

    setTxLoading(true);
    const receipt = await messageInstance.readMessage();
    setReceipt(receipt);
    setTxLoading(false);
  };

  const { data } = messageInstance;
  useEffect(() => {
    setTxLoading(false);
    setReceipt(null);
  }, [messageInstance]);

  return (
    <div
      style={{
        background: index % 2 === 0 ? '#cfe4ff' : '#e3efff',
        padding: '16px',
        margin: '8px',
        borderRadius: '8px',
      }}
    >
      <h3>{data.content.title ?? 'untitled'}</h3>
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
        <button disabled={txLoading} onClick={markAsRead}>
          {txLoading ? 'loading...' : 'Mark as read'}
        </button>
      </div>
      <div>
        <b>ID:</b> {messageInstance.data.id}
      </div>
      <div>
        <b>Protocol:</b> {JSON.stringify(data.protocol, undefined, 2)}
      </div>
      <div>
        <b>Content:</b>
        <br />
        <textarea
          spellCheck={false}
          style={{ width: '300px', height: '50px' }}
          value={JSON.stringify(data.content, undefined, 4)}
          readOnly={true}
        ></textarea>
      </div>
      <div>
        <b>Message:</b>
        <p style={{ height: 'auto' }}>{data.content.content}</p>
      </div>
    </div>
  );
}
