export interface ArianeeProductCertificateI18N {
  $schema: string;
  language?: LanguageCode;
  name?: string;
  sku?: string;
  gtin?: string;
  brandInternalId?: string;
  category?: Category;
  subCategory?: SubCategory;
  intended?: Intended;
  serialnumber?: Array<{
    type: SerialNumberType;
    value: string;
  }>;
  subBrand?: string;
  model?: string;
  description?: string;
  subDescription?: SubDescription[];
  externalContents?: ExternalContent[];
  msrp?: Array<{
    msrp: string;
    currency: Currency;
    msrpCountry: string;
  }>;
  medias?: Media[];
  customAttributes?: CustomAttribute[];
  attributes?: AttributeType[];
  materials?: Material[];
  size?: Size[];
  manufacturingCountry?: string;
  facilityId?: string;
  productCertification?: ProductCertification[];
  transparencyItems?: TransparencyItem[];
  i18n?: I18n[];
  parentCertificates?: ParentCertificate[];
  image?: string;
  image_data?: string;
  external_url?: string;
  background_color?: string;
  animation_url?: string;
  youtube_url?: string;
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
  | 'it'
  | 'ru';
export type Category = 'apparel' | 'accessory' | string;
export type SubCategory = 'shirt' | 'dress' | 'watch';
export type Intended = 'womens' | 'mens' | 'neutral';
export type SerialNumberType =
  | 'serialnumber'
  | 'casenumber'
  | 'movementnumber'
  | 'vin'
  | 'pgeneve'
  | 'millesimation';
export type SubDescriptionType = 'service' | 'recycling' | 'other';
export type Currency = 'USD' | 'EUR' | 'GBP';
export type MediaType = 'picture' | 'youtube' | '3dModel' | 'video';
export type MediaTypeEnum =
  | 'product'
  | 'brandItemBackgroundPicture'
  | 'itemBackgroundPicture'
  | 'certificateBackgroundPicture'
  | '3dModelPreview'
  | '3dModelAsset'
  | 'videoPreview'
  | 'videoSource';
export type MaterialEnum =
  | 'cashmere'
  | 'cotton'
  | 'denim-jeans'
  | 'gold'
  | 'silver';
export type SizeTypeEnum = 'height' | 'width' | 'depth' | 'size';
export type UnitEnum = 'in' | 'cm' | 'mm' | 'eu' | 'uk' | 'us';
export type CertificationEnum = 'fairtrade' | 'wwf';

export interface Media {
  mediaType: MediaType;
  type: MediaTypeEnum;
  url: string;
  hash?: string;
  order?: number;
}

export interface CustomAttribute {
  type: string;
  value: string;
}

export type AttributeType = {
  trait_type?: string;
  type?: 'color' | 'printed' | 'complication';
  value: string;
};

export interface Material {
  material: MaterialEnum;
  value: string;
  pourcentage: string;
}

export interface Size {
  type: SizeTypeEnum;
  value: string;
  unit: UnitEnum;
}

export interface ProductCertification {
  name: CertificationEnum;
}
export type TransparencyCategory = 'material' | 'assembly' | 'impact';
export type TransparencyType =
  | 'responsible_procurement'
  | 'eco_design'
  | 'packaging';
export type TransparencySubtype =
  | 'material-responsible_procurement-ethical_purchasing'
  | 'material-responsible_procurement-organic organic';

export type TransparencyMediaTypeEnum = 'icon' | 'transparencyPicture';
export type ExternalContentTypeEnum =
  | 'website'
  | 'proofLinkAction'
  | 'transparency'
  | 'arianeeAccessTokenAuthLink'
  | 'youtube'
  | 'authRedirectTo';

export interface TransparencyMedia extends Omit<Media, 'type'> {
  type: TransparencyMediaTypeEnum;
}

export interface ExternalContent {
  type: ExternalContentTypeEnum;
  title: string;
  url: string;
  order?: number;
}

export interface TransparencyItem {
  category: TransparencyCategory;
  type: TransparencyType;
  subtype: TransparencySubtype;
  title: string;
  subtitle: string;
  description: string;
  medias: TransparencyMedia[];
  externalContents?: ExternalContent[];
}

export type ParentCertificateType = 'full' | 'Full';

export type SubDescription = {
  type: SubDescriptionType;
  title: string;
  content: string;
  order?: number;
};

export interface ParentCertificate {
  type: ParentCertificateType;
  arianeeLink: string;
  order?: number;
}

export interface I18n {
  language: LanguageCode;
  name?: string;
  model?: string;
  subBrand?: string;
  description?: string;
  subDescription?: SubDescription[];
  medias?: Media[];
  externalContents?: ExternalContent[];
  customAttributes?: CustomAttribute[];
  transparencyItems?: TransparencyItem[];
}
