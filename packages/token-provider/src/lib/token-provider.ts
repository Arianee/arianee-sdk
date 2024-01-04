import {
  ArianeeAccessToken,
  PayloadOverride,
} from '@arianee/arianee-access-token';
import ArianeeProtocolClient, {
  callWrapper,
  ProtocolClientV2,
  transactionWrapper,
} from '@arianee/arianee-protocol-client';
import { SmartAsset } from '@arianee/common-types';
import Core from '@arianee/core';
import {
  PERMIT721_ADDRESS,
  PermitTransferFrom,
  SignatureTransfer,
} from '@arianee/permit721-sdk';
import { tddAdapter, toDeadline } from '@arianee/permit721-sdk';

export const generateSST = async ({
  smartAsset,
  core,
  spender,
  deadline,
  nonce,
  permit721Address,
}: {
  smartAsset: SmartAsset;
  core: Core;
  spender: string;
  deadline?: number;
  nonce?: number;
  permit721Address?: string;
}) => {
  const aatInstance = new ArianeeAccessToken(core);

  const _permit721Address = permit721Address ?? PERMIT721_ADDRESS;

  await approvePermit721({
    core,
    tokenId: smartAsset.certificateId,
    protocolName: smartAsset.protocol.name,
    permit721Address: _permit721Address,
  });

  const arianeeProtocolClient = new ArianeeProtocolClient(core);
  const protocol = await arianeeProtocolClient.connect(
    smartAsset.protocol.name
  );
  if (protocol instanceof ProtocolClientV2)
    throw new Error('unsupported protocol version');

  const expUnixTimestamp =
    deadline ?? toDeadline(/* 30 days= */ 1000 * 60 * 60 * 24 * 30);

  const permitTransferFrom: PermitTransferFrom = {
    permitted: {
      token: protocol.protocolDetails.contractAdresses.smartAsset,
      tokenId: parseInt(smartAsset.certificateId), // make sure it's a int since the subId is an int in an AAT
    },
    spender,
    nonce: nonce ?? Math.floor(Math.random() * 1000000),
    deadline: expUnixTimestamp,
  };
  const { domain, types, values } = SignatureTransfer.getPermitData(
    permitTransferFrom,
    _permit721Address,
    smartAsset.protocol.chainId
  );

  const permitSignature = (
    await core.signTypedData!(tddAdapter(domain), types, values)
  )?.signature;

  const sst = await aatInstance.createCertificateArianeeAccessToken(
    parseInt(smartAsset.certificateId),
    smartAsset.protocol.name,
    {
      permit: permitTransferFrom,
      permitSig: permitSignature,
      exp: expUnixTimestamp * 1000, // convert to ms, as AAT exp is in ms
    } as unknown as PayloadOverride
  );

  return sst;
};

export const approvePermit721 = async ({
  core,
  tokenId,
  protocolName,
  permit721Address,
}: {
  core: Core;
  tokenId: string;
  protocolName: string;
  permit721Address: string;
}) => {
  const arianeeProtocolClient = new ArianeeProtocolClient(core);

  const approvedAddress = (
    await callWrapper(arianeeProtocolClient, protocolName, {
      protocolV1Action: (v1) => {
        return v1.smartAssetContract.getApproved(tokenId);
      },
      protocolV2Action: (v2) => {
        throw new Error('not yet implemented');
      },
    })
  )?.toLowerCase();

  const _permit721Address = permit721Address.toLowerCase();
  const isApproved = approvedAddress && approvedAddress === _permit721Address;

  if (!isApproved) {
    await transactionWrapper(arianeeProtocolClient, protocolName, {
      protocolV1Action: (v1) => {
        return v1.smartAssetContract.approve(
          _permit721Address,
          tokenId
        ) as unknown as ReturnType<
          Parameters<typeof transactionWrapper>[2]['protocolV1Action']
        >;
      },
      protocolV2Action: (v2) => {
        throw new Error('not yet implemented');
      },
    });
  }
};
