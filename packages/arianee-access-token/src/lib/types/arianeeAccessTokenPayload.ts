export interface ArianeeAccessTokenPayload {
  iss: string;
  scope: 'wallet' | 'certificate';
  exp: number;
  iat: number;
  network?: string;
  sub?: string;
  subId?: number;
  nbf?: number;
}
