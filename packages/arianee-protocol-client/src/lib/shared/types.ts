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
  version: '1' | '1.1' | '2';
};
