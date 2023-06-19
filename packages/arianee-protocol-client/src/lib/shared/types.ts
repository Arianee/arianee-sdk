export type ProtocolDetails = {
  contractAdresses: {
    smartAsset: string;
    identity: string;
    aria: string;
    store: string;
    creditHistory: string;
    whitelist: string;
    eventArianee: string;
    message: string;
    userAction: string;
    updateSmartAssets: string;
  };
  httpProvider: string;
  gasStation: string;
  chainId: number;
  protocolVersion: '1' | '1.0' | '1.1' | '2';
};
