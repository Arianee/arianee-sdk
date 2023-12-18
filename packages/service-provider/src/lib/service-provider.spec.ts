import Core from '@arianee/core';
import { PERMIT721_ADDRESS } from '@arianee/permit721-sdk';

import { ServiceProvider } from './service-provider';
import Wallet from '@arianee/wallet';

jest.spyOn(console, 'error').mockImplementation();

const OWNER_PRIVATE_KEY =
  '0xd224a8452655425be26b94a493c21b5c4b4a46f8b3a5c51bfee31eba5bd501cc';
const VALID_SST =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweDU3NzQzNzQ4NDgzNjc0ZmFhOEEzMzk1YTUxNDJGODFDYjYzQjI4NDkiLCJzdWIiOiJjZXJ0aWZpY2F0ZSIsImV4cCI6MzM1NzQ1NjAxMzEwMDAsImlhdCI6MTcwMjA0MDYyNjIxNywic3ViSWQiOjc0OTQzMCwibmV0d29yayI6InRlc3RuZXQiLCJwZXJtaXQiOnsicGVybWl0dGVkIjp7InRva2VuIjoiMHhkN2UzY2M0MzgyRERmNmQ3MDI2M0NjMTIzMjlFMTg5RkU0MDQ0QTRlIiwidG9rZW5JZCI6NzQ5NDMwfSwic3BlbmRlciI6IjB4N0Y5RDk1NDU2MjlkNzg0NDcwMDQ1MTA5ZTIyMDZEOTk3YjVFODkyNiIsIm5vbmNlIjowLCJkZWFkbGluZSI6NDg1NTY0MDYyNn0sInBlcm1pdFNpZyI6IjB4NzYxNjJlZmZhNWNjYTMzZjRmY2Q4NTQxZTA5Njg1NWJkZWYxMDJiNTJlYWEyYjE3NDE0YTM2OTNlZjgxMzQxMzBjYzEzZDI5NDY3ODkxYzFjYTdlYWRmZmVmNDk5ZmEzZjU4NjQ3ZmFiMjUyNWZiYmRhZmU0YTQzNWRjMmM2NTQxYiJ9.0x7da9f93342bd4f60a19e175d114afd626ad0228597d080b4e2755e63fe50116376a2db6a1360b8105b4924d99bfaabd1312f8333f1786ddc9000fea326be36de1b';
const INVALID_SST_PERMIT_WRONG_SIG =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweDREOTUwOTAzOTVCMjA4MjU5Mjk1OWY4ZDhFQzhEMzRCYjBCRDdkMTMiLCJzdWIiOiJjZXJ0aWZpY2F0ZSIsImV4cCI6MzM1NzQ1NjAxMzEwMDAsImlhdCI6MTcwMjA0MDU4MTAxOSwic3ViSWQiOjc0OTQzMCwibmV0d29yayI6InRlc3RuZXQiLCJwZXJtaXQiOnsicGVybWl0dGVkIjp7InRva2VuIjoiMHhkN2UzY2M0MzgyRERmNmQ3MDI2M0NjMTIzMjlFMTg5RkU0MDQ0QTRlIiwidG9rZW5JZCI6NzQ5NDMwfSwic3BlbmRlciI6IjB4N0Y5RDk1NDU2MjlkNzg0NDcwMDQ1MTA5ZTIyMDZEOTk3YjVFODkyNiIsIm5vbmNlIjowLCJkZWFkbGluZSI6NDg1NTY0MDU4MX0sInBlcm1pdFNpZyI6IjB4OTk4ZDdhM2QwOGZlNDA3MjIyMWY5ODA0ZGRkNjE4YTk0Njg5YzgzMmZiMjU2ODY1ZWExZmExNmRmNjQzYzM3ZjViODk1ZDZhNjRiOTAxOTliZTc5ZTJmOWUxMGFkZWVjYTEyMzA2NTRmNmRmMzc2MjE3ZmUyMWZlMTI3NTc0NTgxYyJ9.0x19930b0977fda4e569d5462887e6b8638c1b97dcd8a322fc632ef2f233d4c5071cd4f8bfb2cfd1e9ca3f8462aad716c83fd6596420b8af9059fde72d8cc8a48c1b';
const INVALID_SST_PERMIT_EXPIRED =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweDU3NzQzNzQ4NDgzNjc0ZmFhOEEzMzk1YTUxNDJGODFDYjYzQjI4NDkiLCJzdWIiOiJjZXJ0aWZpY2F0ZSIsImV4cCI6MzM1NzQ1NjAxMzEwMDAsImlhdCI6MTcwMjA0MDY0ODk1MCwic3ViSWQiOjc0OTQzMCwibmV0d29yayI6InRlc3RuZXQiLCJwZXJtaXQiOnsicGVybWl0dGVkIjp7InRva2VuIjoiMHhkN2UzY2M0MzgyRERmNmQ3MDI2M0NjMTIzMjlFMTg5RkU0MDQ0QTRlIiwidG9rZW5JZCI6NzQ5NDMwfSwic3BlbmRlciI6IjB4N0Y5RDk1NDU2MjlkNzg0NDcwMDQ1MTA5ZTIyMDZEOTk3YjVFODkyNiIsIm5vbmNlIjowLCJkZWFkbGluZSI6MTcwMjA0MDY0OH0sInBlcm1pdFNpZyI6IjB4N2UxY2ExNmFjZDY1ODU1OTIyOTllMWEyMTAxZDQ1NTBkZmM3N2VjMTQwODU1ZTEwMTNhMDg2Mzg3ZTczNWJiNDI0NTg5ZjA2ZDAyNWQ3NmQ1MmEzZmNkMTE2MjM2OTJiMmU1NzBjODk4Njc1Y2Q1ZWQ2ZTVkZmUzOThhNzU2OWMxYyJ9.0xd5bbcd677fd2030c51516c1e03b495eb8cb1f8b98c65b47356ebf904c06c6afb3991c630077831c94ff52c4e38bc2702ff28e61f63530703001796eb9d0ab3ff1c';

const mockSmartAssetContract = {
  ownerOf: jest
    .fn()
    .mockImplementation(() =>
      Core.fromPrivateKey(OWNER_PRIVATE_KEY).getAddress()
    ),
  getApproved: jest.fn().mockImplementation(() => PERMIT721_ADDRESS),
};

jest.mock('@arianee/arianee-protocol-client', () => {
  const ArianeeProtocolClient = jest.requireActual(
    '@arianee/arianee-protocol-client'
  );

  return {
    ...ArianeeProtocolClient,
    ArianeeProtocolClient: jest.fn().mockImplementation(() => {
      return {
        connect: jest.fn().mockImplementation(() => {
          return Object.assign(ArianeeProtocolClient.ProtocolClientV1, {
            smartAssetContract: mockSmartAssetContract,
          });
        }),
      };
    }),
  };
});

const mockSmartAssetService = {
  get: jest.fn().mockImplementation(() => {
    return {
      content: {
        data: {
          content: {
            name: 'test',
          },
        },
      },
    };
  }),
};

jest.mock('@arianee/wallet', () => {
  return {
    Wallet: jest.fn().mockImplementation(() => {
      return {
        smartAsset: mockSmartAssetService,
      };
    }),
  };
});

describe('ServiceProvider', () => {
  const serviceProviderCore = Core.fromRandom();
  let serviceProvider: ServiceProvider;

  beforeEach(() => {
    serviceProvider = new ServiceProvider(serviceProviderCore);
    jest.clearAllMocks();
  });

  it('should extract SST from the given URL', () => {
    const url1 = `https://service-provider.com?${ServiceProvider.SST_SEARCH_PARAM_KEY}=${VALID_SST}`;
    const sst1 = serviceProvider.extractSST(url1);
    expect(sst1).toEqual(VALID_SST);

    const url2 = `https://service-provider.com?key=value&${ServiceProvider.SST_SEARCH_PARAM_KEY}=${VALID_SST}`;
    const sst2 = serviceProvider.extractSST(url2);
    expect(sst2).toEqual(VALID_SST);
  });

  it('should return true if VALID_SST is given to isValidSST', async () => {
    const isValid = await serviceProvider.isValidSST({ sst: VALID_SST });
    expect(mockSmartAssetContract.ownerOf).toHaveBeenCalledTimes(1);
    expect(mockSmartAssetContract.getApproved).toHaveBeenCalledTimes(1);
    expect(isValid).toBe(true);
  });

  it('should return false if INVALID_SST_PERMIT_WRONG_SIG is given to isValidSST', async () => {
    const isValid = await serviceProvider.isValidSST({
      sst: INVALID_SST_PERMIT_WRONG_SIG,
    });
    expect(mockSmartAssetContract.ownerOf).toHaveBeenCalledTimes(1);
    expect(mockSmartAssetContract.getApproved).toHaveBeenCalledTimes(0);
    expect(isValid).toBe(false);
  });

  it('should return false if INVALID_SST_PERMIT_EXPIRED is given to isValidSST', async () => {
    const isValid = await serviceProvider.isValidSST({
      sst: INVALID_SST_PERMIT_EXPIRED,
    });
    expect(mockSmartAssetContract.ownerOf).toHaveBeenCalledTimes(0);
    expect(mockSmartAssetContract.getApproved).toHaveBeenCalledTimes(0);
    expect(isValid).toBe(false);
  });

  it('should return smartAsset if VALID_SST is given', async () => {
    const _smartAsset = await serviceProvider.getSmartAssetFromSST({
      sst: VALID_SST,
    });

    const parsedSST = ServiceProvider.parseSST(VALID_SST);

    expect(mockSmartAssetService.get).toHaveBeenCalledWith(
      parsedSST.payload.network,
      { id: parsedSST.payload.subId?.toString() }
    );
  });
});
