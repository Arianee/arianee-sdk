import { ArianeeMessageI18N } from './arianeeMessage-i18n';
import { Protocol } from './protocol';

export interface DecentralizedMessage {
  id: string;
  certificateId: string;
  content: ArianeeMessageI18N;
  rawContent: ArianeeMessageI18N;
  imprint: string;
  timestamp: number;
  isRead: boolean;
  sender: string;
  receiver: string;
  protocol: Protocol;
}
