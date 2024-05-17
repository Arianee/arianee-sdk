import { ArianeeAccessToken as ArianeeAccessTokenClass } from '@arianee/arianee-access-token';
import {
  ArianeeBrandIdentityI18N,
  ArianeeEventI18N,
  ArianeeMessageI18N,
  ArianeeProductCertificateI18N,
  PrivacyGatewayErrorEnum,
} from '@arianee/common-types';
import { Core } from '@arianee/core';
import { defaultFetchLike } from '@arianee/utils';

import { PrivacyGatewayError } from './errors/PrivacyGatewayError';

export type ArianeeAccessToken = string;
export type RpcUrl = NonNullable<ArianeeBrandIdentityI18N['rpcEndpoint']>;

export type Authentication =
  | Awaited<ReturnType<ArianeePrivacyGatewayClient['getAuthentication']>>
  | Awaited<ReturnType<ArianeePrivacyGatewayClient['getAuthenticationFrom']>>;

export default class ArianeePrivacyGatewayClient {
  private aat?: ArianeeAccessTokenClass;
  private readonly fetchLike: typeof fetch;

  constructor(
    private readonly auth:
      | Core
      | ArianeeAccessToken
      | { message: string; signature: string },
    fetchLike?: typeof fetch
  ) {
    this.fetchLike = fetchLike ?? defaultFetchLike;
  }

  private async getArianeeAccessToken(): Promise<ArianeeAccessToken> {
    if (this.auth instanceof Core) {
      if (!this.aat) {
        this.aat = new ArianeeAccessTokenClass(this.auth);
      }

      return this.aat.getValidWalletAccessToken();
    } else if (typeof this.auth === 'string') {
      return this.auth;
    } else {
      throw new Error(
        'Cannot get an arianee access token from this auth (message/signature)'
      );
    }
  }

  private async rpcCall(
    rpcUrl: RpcUrl,
    method: string,
    params: { [key: string]: string | number | object }
  ) {
    return this.fetchLike(rpcUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      mode: 'no-cors',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: 2,
      }),
    });
  }

  private async getAuthentication() {
    if (
      typeof this.auth === 'object' &&
      'message' in this.auth &&
      'signature' in this.auth
    ) {
      return {
        ...this.auth,
      };
    } else {
      return {
        bearer: await this.getArianeeAccessToken(),
      };
    }
  }

  private async getAuthenticationFrom(
    certificateId: string,
    passphrase: string
  ) {
    const core = Core.fromPassPhrase(passphrase);

    return core.signMessage(
      JSON.stringify({
        certificateId,
        timestamp: new Date(),
      })
    );
  }

  public async certificateRead(
    rpcUrl: RpcUrl,
    {
      certificateId,
      passphrase,
    }: {
      certificateId: string;
      passphrase?: string;
    }
  ): Promise<ArianeeProductCertificateI18N> {
    let authentication: Authentication;

    if (passphrase) {
      authentication = await this.getAuthenticationFrom(
        certificateId,
        passphrase
      );
    } else {
      authentication = await this.getAuthentication();
    }

    const res = await this.rpcCall(rpcUrl, 'certificate.read', {
      certificateId,
      authentification: authentication,
    });

    return this.handleRpcResponse(res.json());
  }

  public async certificateCreate(
    rpcUrl: RpcUrl,
    {
      certificateId,
      content,
    }: { certificateId: string; content: ArianeeProductCertificateI18N }
  ): Promise<string> {
    const res = await this.rpcCall(rpcUrl, 'certificate.create', {
      certificateId,
      json: content,
    });

    return this.handleRpcResponse(res.json());
  }

  public async updateRead(
    rpcUrl: RpcUrl,
    {
      certificateId,
      passphrase,
    }: {
      certificateId: string;
      passphrase?: string;
    }
  ): Promise<ArianeeProductCertificateI18N> {
    let authentication: Authentication;

    if (passphrase) {
      authentication = await this.getAuthenticationFrom(
        certificateId,
        passphrase
      );
    } else {
      authentication = await this.getAuthentication();
    }

    const res = await this.rpcCall(rpcUrl, 'update.read', {
      certificateId,
      authentification: authentication,
    });

    return this.handleRpcResponse(res.json());
  }

  public async updateCreate(
    rpcUrl: RpcUrl,
    {
      certificateId,
      content,
    }: { certificateId: string; content: ArianeeProductCertificateI18N }
  ): Promise<string> {
    const res = await this.rpcCall(rpcUrl, 'update.create', {
      certificateId,
      json: content,
    });

    return this.handleRpcResponse(res.json());
  }

  public async messageRead(
    rpcUrl: RpcUrl,
    {
      messageId,
    }: {
      messageId: string;
    }
  ): Promise<ArianeeMessageI18N> {
    const authentication = await this.getAuthentication();

    if ('message' in authentication || 'signature' in authentication) {
      throw new Error(
        'Cannot read message with message/signature authentication'
      );
    }

    const res = await this.rpcCall(rpcUrl, 'message.read', {
      messageId,
      authentification: authentication,
    });

    return this.handleRpcResponse(res.json());
  }

  public async messageCreate(
    rpcUrl: RpcUrl,
    { messageId, content }: { messageId: string; content: ArianeeMessageI18N }
  ): Promise<string> {
    const res = await this.rpcCall(rpcUrl, 'message.create', {
      messageId,
      json: content,
    });

    return this.handleRpcResponse(res.json());
  }

  public async eventRead(
    rpcUrl: RpcUrl,
    {
      certificateId,
      eventId,
      passphrase,
    }: {
      certificateId: string;
      eventId: string;
      passphrase?: string;
    }
  ): Promise<ArianeeEventI18N> {
    let authentication: Authentication;

    if (passphrase) {
      authentication = await this.getAuthenticationFrom(
        certificateId,
        passphrase
      );
    } else {
      authentication = await this.getAuthentication();
    }

    const res = await this.rpcCall(rpcUrl, 'event.read', {
      certificateId,
      eventId,
      authentification: authentication,
    });

    return this.handleRpcResponse(res.json());
  }

  public async eventCreate(
    rpcUrl: RpcUrl,
    { eventId, content }: { eventId: string; content: ArianeeEventI18N }
  ): Promise<string> {
    const res = await this.rpcCall(rpcUrl, 'event.create', {
      eventId,
      json: content,
    });

    return this.handleRpcResponse(res.json());
  }

  private async handleRpcResponse<T>(
    res: Promise<{ result: T } | { error: { code: number; message: string } }>
  ): Promise<T> {
    const response = await res;

    if ('error' in response) {
      throw new PrivacyGatewayError(
        response.error.message,
        Object.values(PrivacyGatewayErrorEnum)[
          response.error.code
        ] as PrivacyGatewayErrorEnum
      );
    }

    return response.result;
  }
}
export { ArianeePrivacyGatewayClient };
