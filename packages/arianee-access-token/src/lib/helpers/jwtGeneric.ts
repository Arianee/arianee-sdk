import { ArianeeAccessTokenPayload } from '../types/ArianeeAccessTokenPayload';
import { JwtHeaderInterface } from '../types/JwtHeaderInterface';

export class JWTGeneric {
  private static readonly JWT_HEADER_ETH =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJFVEgifQ==';

  private static readonly JWT_HEADER_secp256k1 =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==';

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
    const buffer = Buffer.from(stringified);
    return buffer.toString('base64');
  }

  private static fromBase64JSONParse(data: string) {
    const buffer = Buffer.from(data, 'base64');
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

    const { prefix, header, payload, signature } = this.decode();
    const signedMessage = `${prefix}${JWTGeneric.base64Stringified(
      header
    )}.${JWTGeneric.base64Stringified(payload)}`;

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
    const headerType = this.encodedToken.includes(JWTGeneric.JWT_HEADER_ETH)
      ? JWTGeneric.JWT_HEADER_ETH
      : JWTGeneric.JWT_HEADER_secp256k1;

    const [prefix, remainder] = this.encodedToken.split(`${headerType}.`);

    const [header, payload, signature] = [headerType, ...remainder.split('.')];

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
