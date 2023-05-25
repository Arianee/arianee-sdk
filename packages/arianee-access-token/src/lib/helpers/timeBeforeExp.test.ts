import { isExpInLessThan } from './timeBeforeExp';
import { ArianeeAccessToken } from '../arianee-access-token';

describe('isExpInLessThan', () => {
  it('returns true if expiration is less than given time', () => {
    const aat = 'your-aat-string';
    const timeBeforeExpInSec = 60;
    const expirationTimestamp = new Date().getTime(); // this will be expired before the test
    jest.spyOn(ArianeeAccessToken, 'decodeJwt').mockReturnValue({
      header: {} as any,
      signature: '0x0',
      payload: {
        exp: expirationTimestamp,
      } as any,
    });

    const result = isExpInLessThan(aat, timeBeforeExpInSec);
    expect(result).toBe(true);
  });

  it('returns false if expiration is greater than or equal to given time', () => {
    const aat = 'your-aat-string';
    const timeBeforeExpInSec = 60;
    const expirationTimestamp = new Date().getTime() + 70000;

    jest.spyOn(ArianeeAccessToken, 'decodeJwt').mockReturnValue({
      header: {} as any,
      signature: '0x0',
      payload: {
        exp: expirationTimestamp,
      } as any,
    });

    const result = isExpInLessThan(aat, timeBeforeExpInSec);
    expect(result).toBe(false);
  });
});
