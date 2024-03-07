import { ArianeeEventI18N } from './arianeeEvent-i18n';
import { Protocol } from './protocol';

// ArianeeEvent
export interface Event {
  id: string;
  certificateId: string;
  pending: boolean;
  sender: string;
  timestamp: number;
  content: ArianeeEventI18N;
  rawContent: ArianeeEventI18N;
  imprint: string;
  protocol: Protocol;
  isAuthentic: boolean;
}
