export interface ArianeeEventI18N {
  $schema: string;
  eventType?: EventType;
  language?: EventLanguageCode;
  title?: string;
  description?: string;
  externalContents?: EventExternalContent[];
  i18n?: EventI18nContent[];
  medias?: EventMedia[];
  attributes?: EventAttribute[];
  valuePrice?: string;
  currencyPrice?: EventCurrency;
  location?: string;
  issuer_signature?: string;
}

export type EventLanguageCode =
  | 'fr-FR'
  | 'en-US'
  | 'zh-TW'
  | 'zh-CN'
  | 'ko-KR'
  | 'ja-JP'
  | 'de-DE'
  | 'es'
  | 'it';

export type EventType =
  | 'service'
  | 'auction'
  | 'initialSale'
  | 'warranty'
  | 'resell'
  | 'repair'
  | 'experience';

export type EventExternalContentType = 'website' | 'eshop' | 'other';

export type EventMediaMediaType = 'picture' | 'youtube';

export type EventMediaType = 'product';

export type EventAttributeType = 'color' | 'material' | 'printed';

export type EventCurrency = 'USD' | 'EUR' | 'GBP';

export interface EventExternalContent {
  type: EventExternalContentType;
  title: string;
  url: string;
  order?: number;
}

export interface EventMedia {
  mediaType: EventMediaMediaType;
  type: EventMediaType;
  url: string;
  hash?: string;
  order?: number;
}

export interface EventAttribute {
  type: EventAttributeType;
  value: string;
}

export interface EventI18nContent {
  language?: EventLanguageCode;
  title?: string;
  description?: string;
  externalContents?: EventExternalContent[];
}
