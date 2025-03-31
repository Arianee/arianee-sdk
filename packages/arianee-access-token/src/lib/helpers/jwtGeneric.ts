import { ArianeeAccessTokenPayload } from '../types/ArianeeAccessTokenPayload';
import { JwtHeaderInterface } from '../types/JwtHeaderInterface';

export class JWTGeneric {
  private static readonly JWT_HEADER_ETH = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFVEgifQ';

  private static readonly JWT_HEADER_secp256k1 =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ';

  private header = { typ: 'JWT', alg: 'secp256k1' };
  private payload!: ArianeeAccessTokenPayload;
  private encodedToken!: string;

  constructor(
    private params: {
      signer?: (data: string) => Promise<string> | string;
      recover?: (message: string, signature: string) => string;
    }
  ) {}

  /**
   * Set payload to be signed
   * @param payload
   */
  public setPayload = async (
    payload: ArianeeAccessTokenPayload
  ): Promise<JWTGeneric> => {
    this.payload = payload;
    return this;
  };

  /**
   * Set payload to be signed
   * @param payload
   */
  public setHeader = async (payload: JwtHeaderInterface) => {
    this.header = payload;
    return this;
  };

  /**
   * Set token to be verified or decoded
   * @param encodedToken
   */
  public setToken = (encodedToken: string) => {
    this.encodedToken = encodedToken;
    return this;
  };

  private static base64Stringified(
    data: ArianeeAccessTokenPayload | JwtHeaderInterface
  ): string {
    const stringified = JSON.stringify(data);
    // https://datatracker.ietf.org/doc/html/rfc7515#appendix-C
    return Buffer.from(stringified).toString('base64');
    /* TO uncomment when sdk is deployed everywhere because we have a compatibility issue with the token
    .replace(/[=]/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    */
  }

  private static fromBase64JSONParse(data: string) {
    let s = data;
    s = s.replace(/-/g, '+');
    s = s.replace(/_/g, '/');
    switch (s.length % 4) {
      case 0:
        break;
      case 2:
        s += '==';
        break;
      case 3:
        s += '=';
        break;
      default:
        throw new Error('Illegal base64url string!');
    }
    const buffer = Buffer.from(s, 'base64');
    const string = buffer.toString('utf8');
    return JSON.parse(string);
  }

  public async sign(prefix?: string) {
    const header = JWTGeneric.base64Stringified(this.header);
    const payload = JWTGeneric.base64Stringified(this.payload);
    const signature = await this.signature(prefix ?? '');
    return `${prefix ?? ''}${header}.${payload}.${signature}`;
  }

  /**
   * Verify if signature was signed by pubKey and return true/false
   * @param pubKey
   */
  public verify = (pubKey: string, timeBeforeExp?: number): boolean => {
    if (!this.params.recover) {
      throw new Error('You should provide a decoder to verify your token');
    }

    const [header, payload, signature] = this.encodedToken.split('.');
    const signedMessage = header + '.' + payload;
    const decode = this.params.recover(signedMessage, signature);

    const arePropertyValid = this.arePropertiesValid(timeBeforeExp);

    if (!arePropertyValid) {
      return false;
    }
    return pubKey.toLowerCase() === decode.toLowerCase();
  };

  /**
   * Check if expiration is before now + timeBeforeExpInSec.
   * If timeBeforeExpInSec === -1 we skip the expiration check
   * ex: does my token expires in the next 10 minutes
   * @param timeBeforeExpInSec
   * @returns
   */
  public isExpValid = (timeBeforeExpInSec = 0): boolean => {
    if (timeBeforeExpInSec === -1) {
      return true;
    }
    const decoded = this.decode();
    const now = new Date().getTime();
    const isExpInMilliseconds = decoded.payload.exp.toString().length === 13;
    const expInMilliseconds = isExpInMilliseconds
      ? decoded.payload.exp
      : decoded.payload.exp * 1000;

    return now + timeBeforeExpInSec * 1000 < expInMilliseconds;
  };

  public arePropertiesValid = (timeBeforeExpInSec = 0): boolean => {
    const { payload } = this.decode();

    const isExpired = !this.isExpValid(timeBeforeExpInSec);
    if (isExpired) {
      return false;
    }

    if (payload.nbf) {
      const nbfInMS = payload.nbf * 1000;
      const isBefore = new Date(nbfInMS).getTime() > Date.now();
      if (isBefore) {
        return false;
      }
    }

    return true;
  };

  public decode = (): {
    prefix: string;
    header: JwtHeaderInterface;
    payload: ArianeeAccessTokenPayload;
    signature: string;
  } => {
    let headerType = this.encodedToken.includes(JWTGeneric.JWT_HEADER_ETH)
      ? JWTGeneric.JWT_HEADER_ETH
      : this.encodedToken.includes(JWTGeneric.JWT_HEADER_secp256k1)
      ? JWTGeneric.JWT_HEADER_secp256k1
      : null;

    // AAT used to not match RFC 7515. But we need to be retro-compatible until fix is used everywhere
    if (this.encodedToken.includes('==')) {
      headerType = headerType + '==';
    }

    let prefix;
    let remainder;
    let header, payload, signature;
    if (headerType) {
      [prefix, remainder] = this.encodedToken.split(`${headerType}.`);
      [header, payload, signature] = [headerType, ...remainder.split('.')];
    } else {
      remainder = this.encodedToken;
      [header, payload, signature] = remainder.split('.');
    }

    return {
      prefix: prefix ?? '',
      header: JWTGeneric.fromBase64JSONParse(
        header
      ) as unknown as JwtHeaderInterface,
      payload: JWTGeneric.fromBase64JSONParse(
        payload
      ) as unknown as ArianeeAccessTokenPayload,
      signature: signature,
    };
  };

  private signature(prefix: string) {
    if (!this.params.signer) {
      throw new Error('You must provide a signer');
    }

    return this.params.signer(
      prefix +
        JWTGeneric.base64Stringified(this.header) +
        '.' +
        JWTGeneric.base64Stringified(this.payload)
    );
  }
}
