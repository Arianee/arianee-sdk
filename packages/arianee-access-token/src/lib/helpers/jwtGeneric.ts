import { ArianeeAccessTokenPayload } from '../types/arianeeAccessTokenPayload';
import { JwtHeaderInterface } from '../types/JwtHeaderInterface';

export class JWTGeneric {
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
  public setToken(encodedToken: string) {
    this.encodedToken = encodedToken;
    return {
      decode: this.decode.bind(this),
      verify: this.verify.bind(this),
    };
  }

  private static base64Stringified(
    data: ArianeeAccessTokenPayload | JwtHeaderInterface
  ): string {
    const stringified = JSON.stringify(data);
    const buffer = Buffer.from(stringified);
    return buffer.toString('base64');
  }

  private static fromBase64JSONParse(data: string) {
    const buffer = new Buffer(data, 'base64');
    const string = buffer.toString('utf8');
    return JSON.parse(string);
  }

  public async sign() {
    const header = JWTGeneric.base64Stringified(this.header);
    const payload = JWTGeneric.base64Stringified(this.payload);
    const signature = await this.signature();
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Verify if signature was signed by pubKey and return true/false
   * @param pubKey
   */
  private verify(pubKey: string, ignoreExpiration = false): boolean {
    if (!this.params.recover) {
      throw new Error('You should provide a decoder to verify your token');
    }

    const { header, signature, payload } = this.decode();
    const joinedHeaderPayload =
      JWTGeneric.base64Stringified(header) +
      '.' +
      JWTGeneric.base64Stringified(payload);

    const decode = this.params.recover(joinedHeaderPayload, signature);

    const arePropertyValid = this.arePropertiesValid(payload, ignoreExpiration);

    if (!arePropertyValid) {
      return false;
    }
    return pubKey.toLowerCase() === decode.toLowerCase();
  }

  private arePropertiesValid = (
    payload: ArianeeAccessTokenPayload,
    ignoreExpiration = false
  ) => {
    if (payload.exp && !ignoreExpiration) {
      const isExpired = new Date(payload.exp).getTime() < Date.now();
      if (isExpired) {
        return false;
      }
    }
    if (payload.nbf) {
      const isBefore = new Date(payload.nbf).getTime() > Date.now();
      if (isBefore) {
        return false;
      }
    }

    return true;
  };

  private decode(): {
    header: JwtHeaderInterface;
    payload: ArianeeAccessTokenPayload;
    signature: string;
  } {
    const [header, payload, signature] = this.encodedToken.split('.');
    return {
      header: JWTGeneric.fromBase64JSONParse(
        header
      ) as unknown as JwtHeaderInterface,
      payload: JWTGeneric.fromBase64JSONParse(
        payload
      ) as unknown as ArianeeAccessTokenPayload,
      signature: signature,
    };
  }

  private signature() {
    if (!this.params.signer) {
      throw new Error('You must provide a signer');
    }
    return this.params.signer(
      JWTGeneric.base64Stringified(this.header) +
        '.' +
        JWTGeneric.base64Stringified(this.payload)
    );
  }
}
