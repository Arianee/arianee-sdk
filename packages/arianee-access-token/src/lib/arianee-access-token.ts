import { Core } from '@arianee/core';
import { MemoryStorage } from '@arianee/utils';
import { ethers, JsonRpcProvider } from 'ethers';
import memoizee from 'memoizee';

import { JWTGeneric } from './helpers/jwtGeneric';
import { ArianeeAccessTokenPayload } from './types/ArianeeAccessTokenPayload';
import { JwtHeaderInterface } from './types/JwtHeaderInterface';
export interface PayloadOverride {
  exp?: number;
  iat?: number;
  [key: string]: string | number | object | undefined;
}

const JSON_RPC_PROVIDER = new JsonRpcProvider(
  'https://eth-mainnet.public.blastapi.io'
);

export class ArianeeAccessToken {
  private storage: Storage;

  private static readonly LAST_AAT_KEY = 'arianee__lastAAT';

  private static memoizedResolveAddress = memoizee(ethers.resolveAddress, {
    promise: true,
    maxAge: 1000 * 60 * 60 * 4, // cache the resolved address for up to 4 hours
  });

  constructor(
    private core: Core,
    params?: {
      initialValues?: {
        walletAccessToken?: string;
      };
      storage?: Storage;
    }
  ) {
    this.storage = params?.storage ?? new MemoryStorage();

    const initialWalletAccessToken = params?.initialValues?.walletAccessToken;

    if (initialWalletAccessToken) {
      this.storage.setItem(
        ArianeeAccessToken.LAST_AAT_KEY,
        initialWalletAccessToken
      );
    }
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

    const jwtGenerator = new JWTGeneric({});

    const shouldRegenerateAAT = aat
      ? !jwtGenerator.setToken(aat).arePropertiesValid() // if property are all valid, we don't need to regenerate AAT
      : true;

    if (!aat || shouldRegenerateAAT) {
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

  static async isArianeeAccessTokenValid(
    arianeeAccessToken: string,
    ignoreExpiration = false,
    options?: {
      ethereumProvider?: ethers.Provider;
      /** resolved addresses are cached by default, disable cache to always resolve ENS names */
      disableENSResolverCache?: boolean;
    }
  ): Promise<boolean> {
    const recover = (message: string, signature: string): string =>
      ethers.verifyMessage(message, signature);
    const jwtGenerator = new JWTGeneric({ recover });
    const jwt = jwtGenerator.setToken(arianeeAccessToken);
    const iss = jwt.decode().payload.iss;

    let resolvedIss: string | null = null;
    if (ethers.isAddress(iss) === false) {
      try {
        const addressResolver = options?.disableENSResolverCache
          ? ethers.resolveAddress
          : ArianeeAccessToken.memoizedResolveAddress;

        resolvedIss = await addressResolver(
          iss,
          options?.ethereumProvider ?? JSON_RPC_PROVIDER
        );
      } catch (e) {
        if (e instanceof Error && e.message.match(/unconfigured name/gi))
          throw new Error('Unconfigured ENS name: ' + iss);
        else throw e;
      }
    }

    const expBeforeExpiration = ignoreExpiration ? -1 : 10;

    return jwt.verify(resolvedIss ?? iss, expBeforeExpiration);
  }

  static async decodeJwt(
    arianeeAccessToken: string,
    ignoreExpiration = false
  ): Promise<{
    header: JwtHeaderInterface;
    payload: ArianeeAccessTokenPayload;
    signature: string;
  }> {
    const isAatValid = await ArianeeAccessToken.isArianeeAccessTokenValid(
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
    payload: Partial<ArianeeAccessTokenPayload> & PayloadOverride = {},
    prefix?: string
  ): Promise<string> {
    const signer = async (data: string) => {
      return (await this.core.signMessage(data)).signature;
    };
    const jwtGenerator = new JWTGeneric({ signer });
    const nowInSeconds = Math.floor(Date.now() / 1000);

    const basicPayload: ArianeeAccessTokenPayload = {
      iss: this.core.getAddress(),
      sub: 'wallet',
      exp: nowInSeconds + 5 * 60, // default to 5 minutes
      iat: nowInSeconds,
      ...payload,
    };

    const jwt = await jwtGenerator.setPayload(basicPayload);
    return jwt.sign(prefix);
  }
}
