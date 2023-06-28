import Wallet, {
  MessageInstance,
  MessageReadEvent,
  MessageReceivedEvent,
} from '@arianee/wallet';
import { useEffect, useState } from 'react';
import { ChainType, Language } from '@arianee/common-types';
import { getTime } from '../utils/misc';
import Message from './message';

export interface WalletMessagesProps {
  wallet: Wallet<ChainType>;
  language: Language;
}

export default function WalletMessages({
  wallet,
  language,
}: WalletMessagesProps) {
  const [messages, setMessages] = useState<MessageInstance<ChainType>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [eventsLog, setEventsLog] = useState<string>('');

  const pushToEventsLog = (message: string) => {
    setEventsLog((oldEventsLog) => message + '\n' + oldEventsLog);
  };

  const messageReceived = (event: MessageReceivedEvent) => {
    pushToEventsLog(
      `[${getTime()}] Message (${event.messageId}) received on ${
        event.protocol.name
      }`
    );
  };

  const messageRead = (event: MessageReadEvent) => {
    pushToEventsLog(
      `[${getTime()}] Message (${event.messageId}) read on ${
        event.protocol.name
      }`
    );
  };

  useEffect(() => {
    setLoading(true);
    setEventsLog('');

    wallet.message.received.addListener(messageReceived);
    wallet.message.read.addListener(messageRead);
    console.time('wallet.message.getReceived');

    wallet.message
      .getReceived({ i18nStrategy: { useLanguages: [language] } })
      .then((messages) => {
        console.timeEnd('wallet.message.getReceived');

        setMessages(messages);
        setLoading(false);
      });

    return () => {
      wallet.message.received.removeAllListeners();
      wallet.message.read.removeAllListeners();
    };
  }, [wallet, language]);

  return (
    <div id="messages">
      <h3>Messages {!loading ? `(${messages.length})` : null}</h3>
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
            {messages.map((message, index) => {
              const { data } = message;
              const id = data.id;

              return (
                <Message index={index} messageInstance={message} key={id} />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
