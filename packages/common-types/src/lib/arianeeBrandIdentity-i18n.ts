export type ArianeeBrandIdentityI18N = {
  $schema: string;
  name?: string;
  companyName?: string;
  parentCompanyName?: string;
  description?: string;
  externalContents?: ExternalContent[];
  i18n?: I18n[];
  arianeeMembership?: ArianeeMembershipType;
  address?: Address;
  contacts?: Contact[];
  pictures?: Picture[];
  socialmedia?: SocialMedia[];
  providers?: Provider[];
  rpcEndpoint?: string;
};

export type ExternalContent = {
  type: ExternalContentType;
  title?: string;
  url?: string;
  order?: number;
};

export type I18n = {
  language?: Language;
  description?: string;
  externalContents?: ExternalContent[];
};

export type Address = {
  street_address?: string;
  street_address2?: string;
  zipcode?: string;
  city?: string;
  state?: string;
  country?: string;
};

export type Contact = {
  name?: string;
  email?: string;
  title?: string;
  type?: ContactType;
};

export type Picture = {
  type: PictureType;
  url?: string;
  hash?: string;
};

export type SocialMedia = {
  type: SocialMediaType;
  value?: string;
};

export type Provider = {
  type: ProviderType;
  address?: string;
  url?: string;
};

export type ArianeeMembershipType =
  | 'not_member'
  | 'associate_member'
  | 'group_member'
  | 'maison_member';

export type ExternalContentType =
  | 'website'
  | 'eshop'
  | 'label'
  | 'iosScheme'
  | 'androidScheme'
  | 'other'
  | 'deepLinkDomain'
  | 'hostedWallet';

export type Language =
  | 'fr-FR'
  | 'en-US'
  | 'zh-TW'
  | 'zh-CN'
  | 'ko-KR'
  | 'ja-JP'
  | 'de-DE'
  | 'es'
  | 'it';

export type ContactType = 'support' | 'sales' | 'hq' | 'other';

export type PictureType =
  | 'brandLogoHeader'
  | 'brandLogoHeaderReversed'
  | 'brandLogoSquare'
  | 'brandHomePicture'
  | 'brandItemBackgroundPicture'
  | 'itemBackgroundPicture'
  | 'brandBackgroundPicture'
  | 'certificateBackgroundPicture';

export type SocialMediaType = 'facebook' | 'instagram' | 'twitter' | 'youtube';

export type ProviderType = 'missing' | 'custodialWallet';
