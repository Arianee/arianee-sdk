import { ArianeeAccessToken } from '../arianee-access-token';

export function isExpInLessThan(
  aat: string,
  timeBeforeExpInSec: number
): boolean {
  const decoded = ArianeeAccessToken.decodeJwt(aat, true);
  const now = new Date().getTime();
  return decoded.payload.exp - now < timeBeforeExpInSec * 1000;
}
