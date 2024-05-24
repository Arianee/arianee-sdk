import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import { Core } from '@arianee/core';

import { BadRequestError } from '../errors/BadRequestError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { NotFoundError } from '../errors/NotFoundError';

export type AuthorizationType =
  | { certificateId: string; passphrase: string }
  | 'arianeeAccessToken';

export default class HttpClient {
  constructor(
    private core: Core,
    private fetchLike: typeof fetch,
    private arianeeAccessToken: ArianeeAccessToken,
    private arianeeAccessTokenPrefix?: string
  ) {}

  private async getAuthorization(authorizationType: AuthorizationType) {
    let authorization: string;
    if (authorizationType === 'arianeeAccessToken') {
      const aat = encodeURIComponent(
        await this.arianeeAccessToken.getValidWalletAccessToken(
          {},
          { prefix: this.arianeeAccessTokenPrefix }
        )
      );

      authorization = 'Bearer ' + aat;
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
    const res = await this.fetchLike(url, {
      headers: {
        Accept: 'application/json, text/plain',
        'Content-Type': 'application/json;charset=UTF-8',
        mode: 'no-cors',
        ...extraHeaders,
      },
    });

    return this.handleResponse(res);
  }

  public async post(
    url: string,
    data: { [key: string | number]: unknown },
    extraHeaders: HeadersInit = {}
  ) {
    const res = await this.fetchLike(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Accept: 'application/json, text/plain',
        'Content-Type': 'application/json;charset=UTF-8',
        mode: 'no-cors',
        ...extraHeaders,
      },
    });

    return this.handleResponse(res);
  }

  private async handleResponse(res: Response) {
    if (res.status === 200) {
      return res;
    } else if (res.status === 400) {
      throw new BadRequestError(res.statusText);
    } else if (res.status === 403) {
      throw new ForbiddenError(res.statusText);
    } else if (res.status === 404) {
      throw new NotFoundError(res.statusText);
    } else {
      throw new Error(res.statusText);
    }
  }
}
