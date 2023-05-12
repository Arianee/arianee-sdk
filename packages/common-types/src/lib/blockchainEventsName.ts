export type arianeeStoreEventsName =
  | 'SetAddress'
  | 'NewCreditPrice'
  | 'NewAriaUSDExchange'
  | 'CreditBought'
  | 'NewDispatchPercent'
  | 'CreditSpended';

export type erc721EventsName = 'Transfer' | 'Approval' | 'ApprovalForAll';

export type arianeeSmartAssetEventsName =
  | 'Hydrated'
  | 'RecoveryRequestUpdated'
  | 'TokenRecovered'
  | 'TokenURIUpdated'
  | 'TokenAccessAdded'
  | 'TokenDestroyed'
  | erc721EventsName;

export type ArianeeEventEventsName =
  | 'EventCreated'
  | 'EventAccepted'
  | 'EventRefused'
  | 'EventDestroyed'
  | 'DestroyRequestUpdated'
  | 'EventDestroyDelayUpdated';

export type ArianeeIdentityEventsName =
  | 'AddressApprovedAdded'
  | 'AddressApprovedRemoved'
  | 'URIUpdated'
  | 'URIValidate'
  | 'IdentityCompromised'
  | 'SetAddress';

export type ArianeeWhitelistEventsName =
  | 'WhitelistedAddressAdded'
  | 'BlacklistedAddresAdded';

export type ArianeeCreditHistoryEventsName = 'SetAddress';

export type ArianeeMessageEventsName = 'MessageSent' | 'MessageRead';

export type ArianeeUpdateEventsName =
  | 'SmartAssetUpdated'
  | 'StoreAddressUpdated'
  | 'SmartAssetUpdateReaded';

export type erc20EventsName = 'Transfer' | 'Approval';

export type blockchainEventsName =
  | arianeeStoreEventsName
  | arianeeSmartAssetEventsName
  | ArianeeEventEventsName
  | ArianeeIdentityEventsName
  | ArianeeWhitelistEventsName
  | ArianeeCreditHistoryEventsName
  | ArianeeMessageEventsName
  | ArianeeUpdateEventsName
  | erc20EventsName;
