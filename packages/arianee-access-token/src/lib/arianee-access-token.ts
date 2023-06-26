import { Core } from '@arianee/core';
import { ArianeeAccessTokenPayload } from './types/arianeeAccessTokenPayload';
import { JWTGeneric } from './helpers/jwtGeneric';
import { ethers } from 'ethers';
import { JwtHeaderInterface } from './types/JwtHeaderInterface';
import { isExpInLessThan } from './helpers/timeBeforeExp';
import { MemoryStorage } from '@arianee/utils';

interface PayloadOverride {
  exp?: number;
  iat?: number;
}

export class ArianeeAccessToken {
  private storage: Storage;

  private static readonly LAST_AAT_KEY = 'arianee__lastAAT';

  constructor(
    private core: Core,
    params?: {
      storage?: Storage;
    }
  ) {
    this.storage = params?.storage ?? new MemoryStorage();
  }

  public async getValidWalletAccessToken(
    payloadOverride: PayloadOverride = {},
    params?: {
      timeBeforeExp?: number;
      prefix?: string;
    }
  ): Promise<string> {
    const { timeBeforeExp = 10, prefix } = params ?? {};

    let aat = this.storage.getItem(ArianeeAccessToken.LAST_AAT_KEY);

    if (!aat || isExpInLessThan(aat, timeBeforeExp)) {
      aat = await this.createWalletAccessToken(payloadOverride, prefix);
      this.storage.setItem(ArianeeAccessToken.LAST_AAT_KEY, aat);
    }

    return aat;
  }

  public createWalletAccessToken(
    payloadOverride: PayloadOverride = {},
    prefix?: string
  ): Promise<string> {
    return this.generateAAT(payloadOverride, prefix);
  }

  public createCertificateArianeeAccessToken(
    certificateId: number,
    network: string,
    payloadOverride: PayloadOverride = {}
  ): Promise<string> {
    return this.generateAAT({
      subId: certificateId,
      sub: 'certificate',
      network: network,
      ...payloadOverride,
    });
  }

  public async createActionArianeeAccessTokenLink(
    url: string,
    certificateId: number,
    network: string
  ): Promise<string> {
    const urlObject = new URL(url);
    const arianeeAccessToken = await this.createCertificateArianeeAccessToken(
      certificateId,
      network
    );
    urlObject.searchParams.append('arianeeAccessToken', arianeeAccessToken);
    return urlObject.toString();
  }

  static isArianeeAccessTokenValid(
    arianeeAccessToken: string,
    ignoreExpiration = false
  ): boolean {
    const recover = (message: string, signature: string): string =>
      ethers.verifyMessage(message, signature);
    const jwtGenerator = new JWTGeneric({ recover });
    const jwt = jwtGenerator.setToken(arianeeAccessToken);
    const iss = jwt.decode().payload.iss;

    return jwt.verify(iss, ignoreExpiration);
  }

  static decodeJwt(
    arianeeAccessToken: string,
    ignoreExpiration = false
  ): {
    header: JwtHeaderInterface;
    payload: ArianeeAccessTokenPayload;
    signature: string;
  } {
    const isAatValid = ArianeeAccessToken.isArianeeAccessTokenValid(
      arianeeAccessToken,
      ignoreExpiration
    );
    if (!isAatValid) {
      throw new Error('ArianeeAccessToken is not valid');
    }
    const jwtGenerator = new JWTGeneric({});
    const jwt = jwtGenerator.setToken(arianeeAccessToken);
    return jwt.decode();
  }

  private async generateAAT(
    payload: Partial<ArianeeAccessTokenPayload> = {},
    prefix?: string
  ): Promise<string> {
    const signer = async (data: string) => {
      return (await this.core.signMessage(data)).signature;
    };
    const jwtGenerator = new JWTGeneric({ signer });
    const now = Date.now();
    const basicPayload: ArianeeAccessTokenPayload = {
      iss: this.core.getAddress(),
      sub: 'wallet',
      exp: now + 5 * 60 * 1000,
      iat: now,
      ...payload,
    };

    const jwt = await jwtGenerator.setPayload(basicPayload);
    return jwt.sign(prefix);
  }
}
