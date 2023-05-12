import Wallet, {
  ArianeeEventReceivedEvent,
  SmartAssetInstance,
  SmartAssetReceivedEvent,
  SmartAssetTransferedEvent,
  SmartAssetUpdatedEvent,
} from '@arianee/wallet';
import { useEffect, useState } from 'react';
import { ChainType } from '@arianee/common-types';
import { getTime } from '../utils/misc';

export interface WalletNftsProps {
  wallet: Wallet<ChainType>;
}

export default function WalletNfts({ wallet }: WalletNftsProps) {
  const [nfts, setNfts] = useState<SmartAssetInstance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [eventsLog, setEventsLog] = useState<string>('');

  const pushToEventsLog = (message: string) => {
    setEventsLog((oldEventsLog) => message + '\n' + oldEventsLog);
  };

  const nftUpdated = (event: SmartAssetUpdatedEvent) => {
    pushToEventsLog(
      `[${getTime()}] NFT #${event.certificateId} updated on ${
        event.protocol.name
      }`
    );
  };

  const nftReceived = (event: SmartAssetReceivedEvent) => {
    pushToEventsLog(
      `[${getTime()}] NFT #${event.certificateId} received on ${
        event.protocol.name
      }`
    );
  };

  const nftTransferred = (event: SmartAssetTransferedEvent) => {
    pushToEventsLog(
      `[${getTime()}] NFT #${event.certificateId} transferred on ${
        event.protocol.name
      }`
    );
  };

  const arianeeEventReceived = (event: ArianeeEventReceivedEvent) => {
    pushToEventsLog(
      `[${getTime()}] NFT #${
        event.certificateId
      } received an arianee event (id ${event.eventId}) on ${
        event.protocol.name
      }`
    );
  };

  useEffect(() => {
    setLoading(true);
    setEventsLog('');

    wallet.smartAsset.updated.addListener(nftUpdated);
    wallet.smartAsset.transferred.addListener(nftTransferred);
    wallet.smartAsset.received.addListener(nftReceived);
    wallet.smartAsset.arianeeEventReceived.addListener(arianeeEventReceived);

    wallet.smartAsset.getOwned().then((nfts) => {
      setNfts(nfts);
      setLoading(false);
    });

    return () => {
      wallet.smartAsset.updated.removeAllListeners();
      wallet.smartAsset.transferred.removeAllListeners();
      wallet.smartAsset.received.removeAllListeners();
      wallet.smartAsset.arianeeEventReceived.removeAllListeners();
    };
  }, [wallet]);

  return (
    <div>
      <h3>NFTs</h3>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div
            style={{
              margin: '8px',
            }}
          >
            <h4>Events log</h4>
            <textarea
              spellCheck={false}
              style={{ width: '500px', height: '100px' }}
              readOnly={true}
              value={eventsLog}
            ></textarea>
          </div>
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
                  <b>Issuer:</b>{' '}
                  <a href={'#identity-' + data.issuer.toLowerCase()}>
                    {data.issuer}
                  </a>
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
                  <textarea
                    spellCheck={false}
                    readOnly={true}
                    style={{ width: '300px', height: '50px' }}
                    value={JSON.stringify(nft.arianeeEvents, undefined, 4)}
                  ></textarea>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
