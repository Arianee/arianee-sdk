export interface ArianeeMessageI18N {
  $schema: string;
  language?: LanguageCode;
  title?: string;
  content?: string;
  i18n?: i18nContent[];
  pictures?: Media[];
  externalContents?: ExternalContent[];
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

export type MediaType = 'picture' | 'youtube';

export type ExternalContentType =
  | 'website'
  | 'proofLinkAction'
  | 'arianeeAccessTokenAuthLink'
  | 'actionButton';

export interface ExternalContent {
  type: ExternalContentType;
  title: string;
  url: string;
  order?: number;
}

export interface Media {
  mediaType: MediaType;
  type: 'product';
  url: string;
  hash?: string;
}

export interface i18nContent {
  language: LanguageCode;
  title?: string;
  content?: string;
  externalContents?: ExternalContent[];
}
