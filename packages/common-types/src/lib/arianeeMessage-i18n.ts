export interface ArianeeMessageI18N {
  $schema: string;
  language?: MessageLanguageCode;
  title?: string;
  content?: string;
  i18n?: MessageI18nContent[];
  pictures?: MessageMedia[];
  externalContents?: MessageExternalContent[];
  issuer_signature?: string;
}

export type MessageLanguageCode =
  | 'fr-FR'
  | 'en-US'
  | 'zh-TW'
  | 'zh-CN'
  | 'ko-KR'
  | 'ja-JP'
  | 'de-DE'
  | 'es'
  | 'it';

export type MessageMediaType = 'picture' | 'youtube';

export type MessageExternalContentType =
  | 'website'
  | 'proofLinkAction'
  | 'arianeeAccessTokenAuthLink'
  | 'actionButton';

export interface MessageExternalContent {
  type: MessageExternalContentType;
  title: string;
  url: string;
  order?: number;
}

export interface MessageMedia {
  mediaType: MessageMediaType;
  type: 'product';
  url: string;
  hash?: string;
}

export interface MessageI18nContent {
  language?: MessageLanguageCode;
  title?: string;
  content?: string;
  externalContents?: MessageExternalContent[];
}
