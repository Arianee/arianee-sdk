import { OwnedSmartAssetInstance } from '@arianee/wallet';
import { useEffect, useState } from 'react';
import ArianeeEvent from './arianeeEvent';

export interface NftProps {
  ownedSmartAssetInstance: OwnedSmartAssetInstance;
  index: number;
  refreshNfts: () => void;
}

export default function Nft({
  ownedSmartAssetInstance,
  index,
  refreshNfts,
}: NftProps) {
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [link, setLink] = useState<string | null>(null);

  const createProofLink = async () => {
    if (txLoading) return;

    setTxLoading(true);
    const link = await ownedSmartAssetInstance.createProofLink();
    setLink(link);
    setTxLoading(false);
  };

  const createRequestLink = async () => {
    if (txLoading) return;

    setTxLoading(true);
    const link = await ownedSmartAssetInstance.createRequestLink();
    setLink(link);
    setTxLoading(false);
  };

  const { data } = ownedSmartAssetInstance;

  useEffect(() => {
    setTxLoading(false);
    setLink(null);
  }, [ownedSmartAssetInstance]);

  return (
    <div
      style={{
        background: index % 2 === 0 ? '#bbb' : '#eee',
        padding: '16px',
        margin: '8px',
        borderRadius: '8px',
      }}
    >
      <h3>{data.content.name ?? 'unnamed'}</h3>
      <div
        className="actions"
        style={{
          marginBottom: '16px',
        }}
      >
        <button disabled={txLoading} onClick={createProofLink}>
          {txLoading ? 'loading...' : 'Create proof link'}
        </button>
        <button disabled={txLoading} onClick={createRequestLink}>
          {txLoading ? 'loading...' : 'Create request link'}
        </button>
      </div>
      {link && (
        <div className="link" style={{ margin: '16px 0' }}>
          <input style={{ width: '100%' }} value={link} readOnly={true} />
        </div>
      )}

      <div>
        <b>ID:</b> {ownedSmartAssetInstance.data.certificateId}
      </div>
      <div>
        <b>Protocol:</b> {JSON.stringify(data.protocol, undefined, 2)}
      </div>
      <div>
        <b>Issuer:</b>{' '}
        <a href={'#identity-' + data.issuer.toLowerCase()}>{data.issuer}</a>
      </div>
      <div>
        <b>Content:</b>
        <br />
        <textarea
          spellCheck={false}
          readOnly={true}
          style={{ width: '300px', height: '50px' }}
          value={JSON.stringify(data.content, undefined, 4)}
        ></textarea>
      </div>
      <div>
        <b>Blockchain events:</b>
        <br />
        <textarea
          spellCheck={false}
          readOnly={true}
          value={JSON.stringify(data.blockchainEvents, undefined, 4)}
          style={{ width: '300px', height: '50px' }}
        ></textarea>
      </div>
      <div>
        <b>Arianee events:</b>
        <br />
        {ownedSmartAssetInstance.arianeeEvents.map((event) => (
          <ArianeeEvent
            event={event}
            key={event.id}
            refreshNfts={refreshNfts}
          />
        ))}
      </div>
    </div>
  );
}
