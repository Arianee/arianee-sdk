import Wallet, {
  IdentityInstance,
  IdentityUpdatedEvent,
} from '@arianee/wallet';
import { useEffect, useState } from 'react';
import { BrandIdentityWithOwned, ChainType } from '@arianee/common-types';
import { getTime } from '../utils/misc';

export interface WalletIdentitiesProps {
  wallet: Wallet<ChainType>;
}

export default function WalletIdentities({ wallet }: WalletIdentitiesProps) {
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

    wallet.identity.getOwnedSmartAssetsIdentities().then((identities) => {
      setIdentities(identities);
      setLoading(false);
    });

    return () => {
      wallet.identity.updated.removeAllListeners();
    };
  }, [wallet]);

  return (
    <div id="identities">
      <h3>Identities</h3>
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
                <div>
                  <b>Issuer:</b> {issuer}
                </div>
                <div>
                  <b>Name:</b> {data.content.name}
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
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
