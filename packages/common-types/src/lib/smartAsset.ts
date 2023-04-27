import { ArianeeProductCertificateI18N } from './arianeeProductCertificate-i18n';
import { BlockchainEvent } from './blockchainEvent';
import { Protocol } from './protocol';

export interface SmartAsset {
  certificateId: string;
  isRequestable: boolean;
  issuer: string;
  owner: string;
  content: ArianeeProductCertificateI18N;
  rawContent: ArianeeProductCertificateI18N;
  imprint: string;
  protocol: Protocol;
  blockchainEvents: BlockchainEvent[];
  isAuthentic: boolean;
}
