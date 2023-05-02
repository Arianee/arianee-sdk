import { ArianeeBrandIdentityI18N } from './arianeeBrandIdentity-i18n';
import { Protocol } from './protocol';

export interface BrandIdentity {
  address: string;
  imprint: string;
  isApproved: boolean;
  isAuthentic: boolean;
  content: ArianeeBrandIdentityI18N;
  rawContent: ArianeeBrandIdentityI18N;
  protocol: Protocol;
  ownedCount: number;
}
