import Wallet, { SmartAssetInstance } from '@arianee/wallet';
import { useEffect, useState } from 'react';
import { ChainType } from '@arianee/common-types';

export interface WalletNftsProps {
  wallet: Wallet<ChainType>;
}

export default function WalletNfts({ wallet }: WalletNftsProps) {
  const [nfts, setNfts] = useState<SmartAssetInstance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    wallet.smartAsset.getOwned().then((nfts) => {
      setNfts(nfts);
      setLoading(false);
    });
  }, [wallet]);

  return (
    <div>
      <h3>NFTs</h3>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {nfts.map((nft, index) => {
            const { data } = nft;
            const id = data.certificateId;

            return (
              <div
                key={id}
                style={{
                  background: index % 2 === 0 ? '#bbb' : '#eee',
                  padding: '16px',
                  margin: '8px',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <b>ID:</b> {id}
                </div>
                <div>
                  <b>Name:</b> {data.content.name}
                </div>
                <div>
                  <b>Protocol:</b> {JSON.stringify(data.protocol, undefined, 2)}
                </div>
                <div>
                  <b>Issuer:</b> {data.issuer}
                </div>
                <div>
                  <b>Content:</b>
                  <br />
                  <textarea
                    spellCheck={false}
                    style={{ width: '300px', height: '50px' }}
                  >
                    {JSON.stringify(data.content, undefined, 4)}
                  </textarea>
                </div>
                <div>
                  <b>Blockchain events:</b>
                  <br />
                  <textarea
                    spellCheck={false}
                    style={{ width: '300px', height: '50px' }}
                  >
                    {JSON.stringify(data.blockchainEvents, undefined, 4)}
                  </textarea>
                </div>
                <div>
                  <b>Arianee events:</b>
                  <br />
                  <textarea
                    spellCheck={false}
                    style={{ width: '300px', height: '50px' }}
                  >
                    {JSON.stringify(nft.arianeeEvents, undefined, 4)}
                  </textarea>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
