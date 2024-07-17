import {
  ArianeeCreditNotePool,
  ArianeeIssuerProxy,
} from '@arianee/arianee-abi/dist/ethers6/v1_1';
import {
  CreditNoteProofCallData,
  OwnershipProofCallData,
} from '@arianee/privacy-circuits';

export const getOwnershipProofStruct = (
  callData: OwnershipProofCallData
): ArianeeIssuerProxy.OwnershipProofStruct => {
  return {
    _pA: [callData[0][0], callData[0][1]],
    _pB: [
      [callData[1][0][0], callData[1][0][1]],
      [callData[1][1][0], callData[1][1][1]],
    ],
    _pC: [callData[2][0], callData[2][1]],
    _pubSignals: [callData[3][0], callData[3][1], callData[3][2]],
  };
};

export const getCreditNoteProofStruct = (
  callData: CreditNoteProofCallData
): ArianeeCreditNotePool.CreditNoteProofStruct => {
  return {
    _pA: [callData[0][0], callData[0][1]],
    _pB: [
      [callData[1][0][0], callData[1][0][1]],
      [callData[1][1][0], callData[1][1][1]],
    ],
    _pC: [callData[2][0], callData[2][1]],
    _pubSignals: [
      callData[3][0],
      callData[3][1],
      callData[3][2],
      callData[3][3],
    ],
  };
};
