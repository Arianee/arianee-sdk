import { Core } from '@arianee/core';
import { ArianeeAccessToken } from '@arianee/arianee-access-token';

export type AuthorizationType =
  | { certificateId: string; passphrase: string }
  | 'arianeeAccessToken';

export default class HttpClient {
  constructor(
    private core: Core,
    private fetchLike: typeof fetch,
    private arianeeAccessToken: ArianeeAccessToken
  ) {}

  private async getAuthorization(authorizationType: AuthorizationType) {
    let authorization: string;
    if (authorizationType === 'arianeeAccessToken') {
      authorization =
        'Bearer ' + (await this.arianeeAccessToken.getValidWalletAccessToken());
    } else {
      const { certificateId, passphrase } = authorizationType;
      const core = Core.fromPassPhrase(passphrase);

      const { message, signature } = await core.signMessage(
        JSON.stringify({
          certificateId,
          timestamp: new Date(),
        })
      );

      authorization = `Bearer {"message": ${JSON.stringify(
        message
      )}, "signature": "${signature}"}`;
    }

    return authorization;
  }

  public async authorizedGet(
    {
      url,
      authorizationType = 'arianeeAccessToken',
    }: {
      url: string;
      authorizationType?: AuthorizationType;
    },
    extraHeaders: HeadersInit = {}
  ) {
    return this.get(url, {
      authorization: await this.getAuthorization(authorizationType),
      ...extraHeaders,
    });
  }

  public async get(url: string, extraHeaders: HeadersInit = {}) {
    return this.fetchLike(url, {
      headers: {
        Accept: 'application/json, text/plain',
        'Content-Type': 'application/json;charset=UTF-8',
        mode: 'no-cors',
        ...extraHeaders,
      },
    });
  }

  public async post(
    url: string,
    data: { [key: string | number]: unknown },
    extraHeaders: HeadersInit = {}
  ) {
    return this.fetchLike(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Accept: 'application/json, text/plain',
        'Content-Type': 'application/json;charset=UTF-8',
        mode: 'no-cors',
        ...extraHeaders,
      },
    });
  }
}
