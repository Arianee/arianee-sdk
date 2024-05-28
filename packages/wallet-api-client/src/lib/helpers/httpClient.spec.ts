/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import { Core } from '@arianee/core';
import _fetch from 'node-fetch';

import HttpClient from './httpClient';

jest.mock('node-fetch');

const mockedFetch = _fetch as jest.MockedFunction<typeof _fetch>;
mockedFetch.mockImplementation(() => ({ mock: 'mock', status: 200 } as any));

const core = Core.fromMnemonic(
  'art success hello fold once ignore arrow damp note affair razor vital'
);

describe('httpClient', () => {
  let httpClient: HttpClient;
  let arianeeAccessToken: ArianeeAccessToken;
  beforeEach(() => {
    jest.clearAllMocks();
    arianeeAccessToken = new ArianeeAccessToken(Core.fromRandom());
    httpClient = new HttpClient(
      core,
      mockedFetch as unknown as typeof fetch,
      arianeeAccessToken
    );
  });

  describe('get', () => {
    it('should call fetch with the right url and return the response', async () => {
      const res = await httpClient.get('https://mock/');

      expect(mockedFetch).toHaveBeenCalledWith('https://mock/', {
        headers: {
          Accept: 'application/json, text/plain',
          'Content-Type': 'application/json;charset=UTF-8',
          mode: 'no-cors',
        },
      });

      expect(res).toMatchObject({ mock: 'mock' });
    });
  });
  describe('authorizedGet', () => {
    it('should call fetch with the right url and authorization (aat) and return the response', async () => {
      const res = await httpClient.authorizedGet({
        url: 'https://mock/',
        authorizationType: 'arianeeAccessToken',
      });

      expect(mockedFetch).toHaveBeenCalledWith('https://mock/', {
        headers: {
          Accept: 'application/json, text/plain',
          'Content-Type': 'application/json;charset=UTF-8',
          mode: 'no-cors',
          authorization: expect.any(String),
        },
      });

      expect(
        (mockedFetch.mock.calls[0][1] as any)!.headers.authorization
      ).toMatch(/^Bearer ([%a-zA-Z0-9_]+\.){2}[%a-zA-Z0-9_-]+$/);

      expect(res).toMatchObject({ mock: 'mock' });
    });

    it('should call fetch with the right url and authorization (prefixed aat) and return the response', async () => {
      const httpClient = new HttpClient(
        core,
        mockedFetch as unknown as typeof fetch,
        arianeeAccessToken,
        'prefix\r\n'
      );

      const res = await httpClient.authorizedGet({
        url: 'https://mock/',
        authorizationType: 'arianeeAccessToken',
      });

      expect(mockedFetch).toHaveBeenCalledWith('https://mock/', {
        headers: {
          Accept: 'application/json, text/plain',
          'Content-Type': 'application/json;charset=UTF-8',
          mode: 'no-cors',
          authorization: expect.stringMatching(
            /^Bearer prefix%0D%0A([%a-zA-Z0-9_]+\.){2}[%a-zA-Z0-9_-]+$/
          ),
        },
      });

      expect(
        (mockedFetch.mock.calls[0][1] as any)!.headers.authorization
      ).toMatch(/^Bearer prefix%0D%0A([%a-zA-Z0-9_]+\.){2}[%a-zA-Z0-9_-]+$/);

      expect(res).toMatchObject({ mock: 'mock' });
    });

    it('should call fetch with the right url and authorization (id, passphrase) and return the response', async () => {
      const res = await httpClient.authorizedGet({
        url: 'https://mock/',
        authorizationType: {
          certificateId: '123456',
          passphrase: 'gokruwa5ftuv',
        },
      });

      expect(mockedFetch).toHaveBeenCalledWith('https://mock/', {
        headers: {
          Accept: 'application/json, text/plain',
          'Content-Type': 'application/json;charset=UTF-8',
          mode: 'no-cors',
          authorization: expect.any(String),
        },
      });

      expect(
        (mockedFetch.mock.calls[0][1] as any)!.headers.authorization
      ).toMatch(/^Bearer {[{:,\s"\\a-zA-Z0-9_\-.}]+}$/);

      expect(res).toMatchObject({ mock: 'mock' });
    });
  });

  describe('post', () => {
    it('should call fetch with the right url and return the response', async () => {
      const res = await httpClient.post(
        'https://mock/',
        {
          mock: 'mock',
        },
        {
          testHeader: 'testValue',
        }
      );

      expect(mockedFetch).toHaveBeenCalledWith('https://mock/', {
        method: 'POST',
        body: JSON.stringify({ mock: 'mock' }),
        headers: {
          testHeader: 'testValue',
          Accept: 'application/json, text/plain',
          'Content-Type': 'application/json;charset=UTF-8',
          mode: 'no-cors',
        },
      });

      expect(res).toMatchObject({ mock: 'mock' });
    });
  });
});
