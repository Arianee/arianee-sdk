export interface ArianeeAccessTokenPayload {
  iss: string;
  exp: number;
  iat: number;
  network?: string;
  sub?: 'wallet' | 'certificate';
  subId?: number;
  nbf?: number;
}
