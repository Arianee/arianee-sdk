import { ethers6_v1, ethers6_v1_5, ethers6_v1_6 } from '@arianee/arianee-abi';
import { Interface, TransactionDescription, TransactionRequest } from 'ethers';

const ArianeeFactoriesV1 = Object.keys(ethers6_v1.factories).map((key) => {
  return {
    name: `${key.split('__')[0]}_v1`,
    abi: (ethers6_v1.factories as any)[key].abi,
  };
});
const ArianeeFactoriesV1_5 = Object.keys(ethers6_v1_5.factories).map((key) => {
  return {
    name: `${key.split('__')[0]}_v1-1`,
    abi: (ethers6_v1_5.factories as any)[key].abi,
  };
});
const ArianeeFactoriesV1_6 = Object.keys(ethers6_v1_6.factories).map((key) => {
  return {
    name: `${key.split('__')[0]}_v1-1`,
    abi: (ethers6_v1_6.factories as any)[key].abi,
  };
});
const ArianeeContracts = [
  ...ArianeeFactoriesV1,
  ...ArianeeFactoriesV1_5,
  ...ArianeeFactoriesV1_6,
];

interface DecodedArianeeTransaction {
  contractName: string;
  functionName: string;
  functionArgs: { name: string; type: string; value: any }[];
}

class DecodedArianeeTransactionError extends Error {
  constructor(message: string) {
    super(`An error occured while decoding transaction: ${message}`);
    this.name = 'DecodedArianeeTransactionError';
  }
}

function decodeTransaction(
  transactionRequest: TransactionRequest
): DecodedArianeeTransaction {
  const { data, value } = transactionRequest;
  if (!data) throw new DecodedArianeeTransactionError('Missing data');

  let matchingContractName: string | null = null;
  let decoded: TransactionDescription | null = null;
  for (const contract of ArianeeContracts) {
    const iface = new Interface(contract.abi);
    decoded = iface.parseTransaction({ data, value: value ?? undefined });
    if (decoded !== null) {
      matchingContractName = contract.name;
      break;
    }
  }
  if (!decoded) {
    throw new DecodedArianeeTransactionError('No matching interface');
  }

  return {
    contractName: matchingContractName!,
    functionName: decoded.name,
    functionArgs: decoded.args.map((argValue, argIndex) => {
      return {
        name: decoded!.fragment.inputs[argIndex].name,
        type: decoded!.fragment.inputs[argIndex].type,
        value: argValue,
      };
    }),
  };
}

export {
  DecodedArianeeTransaction,
  DecodedArianeeTransactionError,
  decodeTransaction,
};
