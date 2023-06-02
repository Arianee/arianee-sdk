export interface ArianeeEvent {
  _id: string;
  tokenId?: string;
  eventId: string;
  imprint?: string;
  uri?: string;
  issuer?: string;
  mintDate?: number | string;
  accepted?: boolean;
  accepter?: string;
  network: string;
}
