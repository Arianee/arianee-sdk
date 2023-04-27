export interface ArianeeEventI18N {
  $schema: string;
  eventType?: EventType;
  language?: LanguageCode;
  title?: string;
  description?: string;
  externalContents?: ExternalContent[];
  i18n?: i18nContent[];
  medias?: Media[];
  attributes?: Attribute[];
  valuePrice?: string;
  currencyPrice?: Currency;
  location?: string;
}

export type LanguageCode =
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

export type ExternalContentType = 'website' | 'eshop' | 'other';

export type MediaType = 'picture' | 'youtube';

export type MediaTypeType = 'product';

export type AttributeType = 'color' | 'material' | 'printed';

export type Currency = 'USD' | 'EUR' | 'GBP';

export interface ExternalContent {
  type: ExternalContentType;
  title: string;
  url: string;
  order?: number;
}

export interface Media {
  mediaType: MediaType;
  type: MediaTypeType;
  url: string;
  hash?: string;
  order?: number;
}

export interface Attribute {
  type: AttributeType;
  value: string;
}

export interface i18nContent {
  language: LanguageCode;
  title?: string;
  description?: string;
  externalContents?: ExternalContent[];
}
