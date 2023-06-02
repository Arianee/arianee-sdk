import Wallet, {
  IdentityInstance,
  IdentityUpdatedEvent,
} from '@arianee/wallet';
import { useEffect, useState } from 'react';
import {
  BrandIdentityWithOwned,
  ChainType,
  Language,
} from '@arianee/common-types';
import { getTime } from '../utils/misc';

export interface WalletIdentitiesProps {
  wallet: Wallet<ChainType>;
  language: Language;
}

export default function WalletIdentities({
  wallet,
  language,
}: WalletIdentitiesProps) {
  const [identities, setIdentities] = useState<
    IdentityInstance<BrandIdentityWithOwned>[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [eventsLog, setEventsLog] = useState<string>('');

  const pushToEventsLog = (message: string) => {
    setEventsLog((oldEventsLog) => message + '\n' + oldEventsLog);
  };

  const identityUpdated = (event: IdentityUpdatedEvent) => {
    pushToEventsLog(
      `[${getTime()}] Identity (${event.issuer}) updated on ${
        event.protocol.name
      }`
    );
  };

  useEffect(() => {
    setLoading(true);
    setEventsLog('');

    wallet.identity.updated.addListener(identityUpdated);
    console.time('wallet.identity.getOwnedSmartAssetsIdentities');

    wallet.identity
      .getOwnedSmartAssetsIdentities({
        i18nStrategy: { useLanguages: [language] },
      })
      .then((identities) => {
        console.timeEnd('wallet.identity.getOwnedSmartAssetsIdentities');
        setIdentities(identities);
        setLoading(false);
      });

    return () => {
      wallet.identity.updated.removeAllListeners();
    };
  }, [wallet, language]);

  return (
    <div id="identities">
      <h3>Identities {!loading ? `(${identities.length})` : null}</h3>
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              overflowX: 'auto',
            }}
          >
            {identities.map((identity, index) => {
              const { data } = identity;
              const issuer = data.address;

              return (
                <div
                  id={'identity-' + issuer.toLowerCase()}
                  key={issuer}
                  style={{
                    background: index % 2 === 0 ? '#d2baff' : '#ede3ff',
                    padding: '16px',
                    margin: '8px',
                    borderRadius: '8px',
                  }}
                >
                  <h3>{data.content.name ?? 'unnamed'}</h3>
                  <div>
                    <b>Issuer:</b> {issuer}
                  </div>
                  <div>
                    <b>Owned NFTs:</b> {data.ownedCount}
                  </div>
                  <div>
                    <b>Protocol:</b>{' '}
                    {JSON.stringify(data.protocol, undefined, 2)}
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
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
