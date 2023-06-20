import Wallet, {
  ArianeeEventReceivedEvent,
  OwnedSmartAssetInstance,
  SmartAssetReceivedEvent,
  SmartAssetTransferedEvent,
  SmartAssetUpdatedEvent,
} from '@arianee/wallet';
import { useCallback, useEffect, useState } from 'react';
import { ChainType, Language } from '@arianee/common-types';
import { getTime } from '../utils/misc';
import Nft from './nft';

export interface WalletNftsProps {
  wallet: Wallet<ChainType>;
  language: Language;
}

export default function WalletNfts({ wallet, language }: WalletNftsProps) {
  const [nfts, setNfts] = useState<OwnedSmartAssetInstance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [brandsFilter, setBrandsFilter] = useState<string | 'all'>('all');

  const [lastFetch, setLastFetch] = useState<Date>(new Date());

  const refreshNfts = useCallback(() => {
    setLastFetch(new Date());
  }, [setLastFetch]);

  const [eventsLog, setEventsLog] = useState<string>('');

  const pushToEventsLog = (message: string) => {
    setEventsLog((oldEventsLog) => message + '\n' + oldEventsLog);
  };

  const nftUpdated = (event: SmartAssetUpdatedEvent) => {
    pushToEventsLog(
      `[${getTime()}] NFT #${event.certificateId} updated on ${
        event.protocol?.name || '?'
      }`
    );
  };

  const nftReceived = (event: SmartAssetReceivedEvent) => {
    pushToEventsLog(
      `[${getTime()}] NFT #${event.certificateId} received on ${
        event.protocol?.name || '?'
      }`
    );
  };

  const nftTransferred = (event: SmartAssetTransferedEvent) => {
    pushToEventsLog(
      `[${getTime()}] NFT #${event.certificateId} transferred on ${
        event.protocol?.name || '?'
      }`
    );
  };

  const arianeeEventReceived = (event: ArianeeEventReceivedEvent) => {
    pushToEventsLog(
      `[${getTime()}] NFT #${
        event.certificateId
      } received an arianee event (id ${event.eventId}) on ${
        event.protocol?.name || '?'
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

    console.time('wallet.smartAsset.getOwned');

    wallet.smartAsset
      .getOwned({
        i18nStrategy: { useLanguages: [language] },
        onlyFromBrands: brandsFilter === 'all' ? undefined : [brandsFilter],
      })
      .then((nfts) => {
        console.timeEnd('wallet.smartAsset.getOwned');
        setNfts(nfts);
        setLoading(false);
      });

    return () => {
      wallet.smartAsset.updated.removeAllListeners();
      wallet.smartAsset.transferred.removeAllListeners();
      wallet.smartAsset.received.removeAllListeners();
      wallet.smartAsset.arianeeEventReceived.removeAllListeners();
    };
  }, [wallet, language, brandsFilter, lastFetch]);

  return (
    <div id="nfts">
      <h3>
        NFTs {!loading ? `(${nfts.length})` : null}{' '}
        <button onClick={refreshNfts}>🔄</button>
      </h3>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div
            style={{
              margin: '8px',
            }}
          >
            <h4>
              Events log (live)
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: 'lightgreen',
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  marginLeft: '8px',
                }}
              ></div>
            </h4>
            <textarea
              spellCheck={false}
              style={{ width: '500px', height: '100px' }}
              readOnly={true}
              value={eventsLog}
            ></textarea>
          </div>
          <div>
            <b>Filters</b>
            <br />
            <b>Only from brand:</b>
            <select
              defaultValue={brandsFilter}
              onChange={(event) => setBrandsFilter(event.target.value)}
            >
              {Array.from(
                new Set([
                  'all',
                  brandsFilter,
                  ...nfts.map((nft) => nft.data.issuer),
                ])
              ).map((issuer) => (
                <option key={issuer}>{issuer}</option>
              ))}
            </select>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              overflowX: 'auto',
            }}
          >
            {nfts.map((nft, index) => {
              const { data } = nft;
              const id = data.certificateId;

              return (
                <Nft
                  key={id}
                  ownedSmartAssetInstance={nft}
                  index={index}
                  refreshNfts={refreshNfts}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
