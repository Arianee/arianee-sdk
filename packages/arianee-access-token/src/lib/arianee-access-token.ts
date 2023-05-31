import { Core } from '@arianee/core';
import { ArianeeAccessTokenPayload } from './types/arianeeAccessTokenPayload';
import { JWTGeneric } from './helpers/jwtGeneric';
import { ethers } from 'ethers';
import { JwtHeaderInterface } from './types/JwtHeaderInterface';
import { isExpInLessThan } from './helpers/timeBeforeExp';

interface PayloadOverride {
  exp?: number;
  iat?: number;
}

export class ArianeeAccessToken {
  private lastAAT!: string;

  constructor(private core: Core) {}

  public async getValidWalletAccessToken(
    payloadOverride: PayloadOverride = {},
    timeBeforeExp = 10
  ): Promise<string> {
    if (!this.lastAAT || isExpInLessThan(this.lastAAT, timeBeforeExp)) {
      this.lastAAT = await this.createWalletAccessToken(payloadOverride);
    }
    return this.lastAAT;
  }

  public createWalletAccessToken(
    payloadOverride: PayloadOverride = {}
  ): Promise<string> {
    return this.generateAAT(payloadOverride);
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
    payload: Partial<ArianeeAccessTokenPayload> = {}
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
    return jwt.sign();
  }
}
