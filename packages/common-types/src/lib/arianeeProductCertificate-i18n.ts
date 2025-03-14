import { ArianeeEventI18N } from './arianeeEvent-i18n';

export interface ArianeeProductCertificateI18N {
  $schema: string;
  language?: ProductLanguageCode;
  name?: string;
  sku?: string;
  gtin?: string;
  brandInternalId?: string;
  category?: ProductCategory;
  subCategory?: ProductSubCategory;
  intended?: ProductIntended;
  serialnumber?: Array<{
    type: ProductSerialNumberType;
    value: string;
  }>;
  subBrand?: string;
  model?: string;
  description?: string;
  subDescription?: ProductSubDescription[];
  externalContents?: ProductExternalContent[];
  msrp?: Array<{
    msrp: string;
    currency: ProductCurrency;
    msrpCountry: string;
  }>;
  medias?: ProductMedia[];
  customAttributes?: ProductCustomAttribute[];
  attributes?: ProductAttributeType[];
  materials?: ProductMaterial[];
  size?: ProductSize[];
  manufacturingCountry?: string;
  manufacturer?: string;
  facilityId?: string;
  productCertification?: ProductCertification[];
  transparencyItems?: ProductTransparencyItem[];
  i18n?: ProductI18n[];
  parentCertificates?: ProductParentCertificate[];
  image?: string;
  image_data?: string;
  external_url?: string;
  background_color?: string;
  animation_url?: string;
  youtube_url?: string;
  thread?: Thread;
  issuerSignature?: string;
  EAN?: string;
  technicalReference?: string;
  commercialReference?: string;
  postSaleManufacturerWarrantyPeriod?: ValueUnit;
  reparabilityIndex?: ValueYear;
  energyConsumption?: ValueUnitWithLabel;
  waterConsumption?: ValueUnit;
  energyClass?: ValueYear;
  dangerousSubstance?: boolean;
  recyclabilityMention?: string;
  preciousOrCriticalMetals?: boolean;
  recycledContent?: boolean;
  ecoModulation?: string;
  services?: LinkItem[];
  externalContent?: LinkItem[];
  ecosystem?: Ecosystem;
}

export interface TypeEquipementNiveau {
  id: string;
  label: string;
}
export interface Ecosystem {
  categorieReglementaire: string;
  secteur: string;
  fluxNiveau1: string;
  fluxNiveau2: string;
  typeEquipementNiveau1: TypeEquipementNiveau;
  typeEquipementNiveau2: TypeEquipementNiveau;
}

export type ValueUnit = {
  value: string;
  unit: string;
};

export type ValueUnitWithLabel = {
  value: string;
  unit: string;
  label?: string;
};

export type ValueYear = {
  value: string;
  indexDefinitionYear: string;
};

export type LinkItem = {
  title: string;
  icon: string;
  url: string;
};

export type ProductLanguageCode =
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
export type ProductCategory = 'apparel' | 'accessory' | string;
export type ProductSubCategory = 'shirt' | 'dress' | 'watch' | 'Digital Asset';
export type ProductIntended = 'womens' | 'mens' | 'neutral';
export type ProductSerialNumberType =
  | 'serialnumber'
  | 'casenumber'
  | 'movementnumber'
  | 'vin'
  | 'pgeneve'
  | 'millesimation';
export type ProductSubDescriptionType = 'service' | 'recycling' | 'other';
export type ProductCurrency = 'USD' | 'EUR' | 'GBP';
export type ProductMediaType =
  | 'picture'
  | 'youtube'
  | '3dModel'
  | 'video'
  | 'AR';
export type ProductMediaTypeEnum =
  | 'product'
  | 'brandItemBackgroundPicture'
  | 'itemBackgroundPicture'
  | 'certificateBackgroundPicture'
  | '3dModelPreview'
  | '3dModelAsset'
  | 'videoPreview'
  | 'videoSource'
  | 'ARPreview'
  | 'ARAsset'
  | 'ARPrimaryAsset';
export type ProductMaterialEnum =
  | 'cashmere'
  | 'cotton'
  | 'denim-jeans'
  | 'gold'
  | 'silver';
export type ProductSizeTypeEnum =
  | 'weight'
  | 'height'
  | 'width'
  | 'depth'
  | 'size';
export type ProductUnitEnum =
  | 'in'
  | 'cm'
  | 'mm'
  | 'eu'
  | 'uk'
  | 'us'
  | 'kg'
  | 'lb';
export type ProductCertificationEnum = 'fairtrade' | 'wwf';

export interface ProductMedia {
  mediaType: ProductMediaType;
  type: ProductMediaTypeEnum;
  url: string;
  hash?: string;
  order?: number;
}

export interface ProductCustomAttribute {
  type: string;
  value: string;
}

export type ProductAttributeType = {
  trait_type?: string;
  type?: 'color' | 'printed' | 'complication';
  value: string;
};

export interface ProductMaterial {
  material: ProductMaterialEnum;
  value: string;
  pourcentage: string;
}

export interface ProductSize {
  type: ProductSizeTypeEnum;
  value: string;
  unit: ProductUnitEnum;
}

export interface ProductCertification {
  name: ProductCertificationEnum;
}
export type ProductTransparencyCategory = 'material' | 'assembly' | 'impact';
export type ProductTransparencyType =
  | 'responsible_procurement'
  | 'eco_design'
  | 'packaging';
export type ProductTransparencySubtype =
  | 'material-responsible_procurement-ethical_purchasing'
  | 'material-responsible_procurement-organic organic';

export type ProductTransparencyMediaTypeEnum = 'icon' | 'transparencyPicture';
export type ProductExternalContentTypeEnum =
  | 'website'
  | 'proofLinkAction'
  | 'transparency'
  | 'arianeeAccessTokenAuthLink'
  | 'youtube'
  | 'authRedirectTo'
  | 'userManual';

export interface ProductTransparencyMedia extends Omit<ProductMedia, 'type'> {
  type: ProductTransparencyMediaTypeEnum;
}

export interface ProductExternalContent {
  type: ProductExternalContentTypeEnum;
  title: string;
  url: string;
  order?: number;
}

export interface ProductTransparencyItem {
  category: ProductTransparencyCategory;
  type: ProductTransparencyType;
  subtype: ProductTransparencySubtype;
  title: string;
  subtitle: string;
  description: string;
  medias: ProductTransparencyMedia[];
  externalContents?: ProductExternalContent[];
}

export type ProductParentCertificateType = 'full' | 'Full';

export type ProductSubDescription = {
  type: ProductSubDescriptionType;
  title: string;
  content: string;
  order?: number;
};

export interface ProductParentCertificate {
  type: ProductParentCertificateType;
  arianeeLink: string;
  order?: number;
}

export interface ProductI18n {
  language?: ProductLanguageCode;
  name?: string;
  model?: string;
  subBrand?: string;
  description?: string;
  subDescription?: ProductSubDescription[];
  medias?: ProductMedia[];
  externalContents?: ProductExternalContent[];
  customAttributes?: ProductCustomAttribute[];
  transparencyItems?: ProductTransparencyItem[];
}

export type Thread = {
  origin: ThreadPoint;
  destination: ThreadPoint;
  events: {
    hydrate: ThreadEvent<ThreadHydrateReturnValues>;
    transfers: ThreadEvent<ThreadTransferReturnValues>[];
  };
  arianeeEvents: ThreadArianeeEvent[];
}[];

export type ThreadPoint = {
  protocolName: string;
  tokenId: number;
  chainId: number;
  smartContractAddress: string;
};

export type ThreadHydrateReturnValues = {
  _tokenId: string;
  _imprint: string;
  _uri: string;
  _initialKey: string;
  _tokenRecoveryTimestamp: string;
  _initialKeyIsRequestKey: boolean;
  _tokenCreation: string;
};

export type ThreadTransferReturnValues = {
  _from: string;
  _to: string;
  _tokenId: string;
};

export type ThreadEvent<ReturnValuesType> = {
  address: string;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  logIndex: number;
  removed: boolean;
  id: string;
  returnValues: ReturnValuesType;
  event: string;
  signature: string;
  timestamp: number;
  raw: {
    data: string;
    topics: string[];
  };
};

export type ThreadArianeeEvent = {
  id: string;
  certificateId: string;
  pending?: boolean;
  sender: string;
  timestamp: number;
  content: ArianeeEventI18N;
  rawContent: ArianeeEventI18N;
  imprint: string;
  protocol: {
    name: string;
    chainId: number;
  };
};
