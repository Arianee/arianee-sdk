import Wallet, {
  IdentityUpdatedEvent,
  MessageInstance,
  MessageReadEvent,
  MessageReceivedEvent,
} from '@arianee/wallet';
import { useEffect, useState } from 'react';
import { ChainType } from '@arianee/common-types';
import { getTime } from '../utils/misc';

export interface WalletMessagesProps {
  wallet: Wallet<ChainType>;
}

export default function WalletMessages({ wallet }: WalletMessagesProps) {
  const [messages, setMessages] = useState<MessageInstance[]>([]);
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

    wallet.message.getReceived().then((messages) => {
      setMessages(messages);
      setLoading(false);
    });

    return () => {
      wallet.message.received.removeAllListeners();
      wallet.message.read.removeAllListeners();
    };
  }, [wallet]);

  return (
    <div id="messages">
      <h3>Messages</h3>
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
          {messages.map((message, index) => {
            const { data } = message;
            const id = data.id;

            return (
              <div
                key={id}
                style={{
                  background: index % 2 === 0 ? '#cfe4ff' : '#e3efff',
                  padding: '16px',
                  margin: '8px',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <b>ID:</b> {id}
                </div>
                <div>
                  <b>Title:</b> {data.content.title}
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
