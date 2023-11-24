import { TransactionRequest } from 'ethers';
import { decodeTransaction } from './tx';

describe('tx', () => {
  it('should decode an ArianeeStore(updateSmartAsset) transaction', () => {
    const transactionRequest: TransactionRequest = {
      data: '0xfa4b78b90000000000000000000000000000000000000000000000000000000000e2822cd9e24b5a93b5c2d8a9747e508e4aad5217ee0c9654b799bb75654adbfd960b51000000000000000000000000a79b29ad7e0196c95b87f4663ded82fbf2e3add8',
      from: '0x305051e9a023fe881EE21cA43fd90c460B427Caa',
      to: '0x5360DbFF3546b920431A20268D2B5DFf8bF9b4dD',
    };
    const decodedTx = decodeTransaction(transactionRequest);
    expect(decodedTx.contractName).toBe('ArianeeStore_v1');
    expect(decodedTx.functionName).toBe('updateSmartAsset');
    expect(decodedTx.functionArgs.map((fnArg) => fnArg.value)).toEqual([
      BigInt(14844460),
      '0xd9e24b5a93b5c2d8a9747e508e4aad5217ee0c9654b799bb75654adbfd960b51',
      '0xA79B29AD7e0196C95B87f4663ded82Fbf2E3ADD8',
    ]);
  });

  it('should decode an ArianeeStore(createMessage) transaction', () => {
    const transactionRequest: TransactionRequest = {
      data: '0x9452d60000000000000000000000000000000000000000000000000000000000230d09a10000000000000000000000000000000000000000000000000000000000de19294e54ea6b6550122e0fb49987a5426e86082d4b6fd0d23d98ded0f8544ffb88f9000000000000000000000000a79b29ad7e0196c95b87f4663ded82fbf2e3add8',
      from: '0x305051e9a023fe881EE21cA43fd90c460B427Caa',
      to: '0x512C1FCF401133680f373a386F3f752b98070BC5',
    };
    const decodedTx = decodeTransaction(transactionRequest);
    expect(decodedTx.contractName).toBe('ArianeeStore_v1');
    expect(decodedTx.functionName).toBe('createMessage');
    expect(decodedTx.functionArgs.map((fnArg) => fnArg.value)).toEqual([
      BigInt(588056993),
      BigInt(14555433),
      '0x4e54ea6b6550122e0fb49987a5426e86082d4b6fd0d23d98ded0f8544ffb88f9',
      '0xA79B29AD7e0196C95B87f4663ded82Fbf2E3ADD8',
    ]);
  });

  it('should decode an ArianeeSmartAsset(hydrateToken) transaction', () => {
    const transactionRequest: TransactionRequest = {
      data: '0xec046d0a00000000000000000000000000000000000000000000000000000000155cb7ba8b6654acf341b9887066f7d08c02c31437157a063f2fe499c25efac89042c33900000000000000000000000000000000000000000000000000000000000000e00000000000000000000000003caf9db876ed99df1b9015b48d3cb94cfcc27167000000000000000000000000000000000000000000000000000000006eb0696e0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a79b29ad7e0196c95b87f4663ded82fbf2e3add80000000000000000000000000000000000000000000000000000000000000000',
      from: '0x305051e9a023fe881EE21cA43fd90c460B427Caa',
      to: '0x5360DbFF3546b920431A20268D2B5DFf8bF9b4dD',
    };
    const decodedTx = decodeTransaction(transactionRequest);
    expect(decodedTx.contractName).toBe('ArianeeSmartAsset_v1');
    expect(decodedTx.functionName).toBe('hydrateToken');
    expect(decodedTx.functionArgs.map((fnArg) => fnArg.value)).toEqual([
      BigInt(358397882),
      '0x8b6654acf341b9887066f7d08c02c31437157a063f2fe499c25efac89042c339',
      '',
      '0x3caf9db876ed99DF1B9015B48D3Cb94CfcC27167',
      BigInt(1857055086),
      true,
      '0xA79B29AD7e0196C95B87f4663ded82Fbf2E3ADD8',
    ]);
  });

  it('should decode an ArianeeSmartAsset(addTokenAccess) transaction', () => {
    const transactionRequest: TransactionRequest = {
      data: '0xb71c34d50000000000000000000000000000000000000000000000000000000000de1929000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
      from: '0x305051e9a023fe881EE21cA43fd90c460B427Caa',
      to: '0x512C1FCF401133680f373a386F3f752b98070BC5',
    };
    const decodedTx = decodeTransaction(transactionRequest);
    expect(decodedTx.contractName).toBe('ArianeeSmartAsset_v1');
    expect(decodedTx.functionName).toBe('addTokenAccess');
    expect(decodedTx.functionArgs.map((fnArg) => fnArg.value)).toEqual([
      BigInt(14555433),
      '0x0000000000000000000000000000000000000000',
      false,
      BigInt(1),
    ]);
  });

  it('should not decode a 1inch transaction', () => {
    const transactionRequest: TransactionRequest = {
      data: '0x9570eeee0000000000000000000000000000000000000000655f8fabb6728cda49bfe8fd000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000008207c1ffc5b6804f6024322ccf34f29c3541ae26000000000000000000000000807cf9a772d5a3f9cefbc1192e939d62f0d9bd380000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001cedbe518fbe51000000000000000000000000000000000000000000000007ef88ccb9a20c800064980fba1c38c6cb93b80b1206206804d1f0dcd22411bacba2b315c741ec5f85c636fe2a6d178a57db3a70428298a550cccdd2c91994149c354bed6b6ac16cfd100000000000000000000000000000000000000000000007ef88ccb9a20c8000ab000280e26b9977',
      value: 0,
      from: '0x66d4908E053F7150038b1bF3579cF384fde0BA72',
      to: '0x1111111254EEB25477B68fb85Ed929f73A960582',
    };
    expect(() => decodeTransaction(transactionRequest)).toThrow(
      /No matching interface$/
    );
  });
});
