/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { callWrapper } from '@arianee/arianee-protocol-client';
import {
  ArianeeBrandIdentityI18N,
  ArianeeEventI18N,
  ArianeeMessageI18N,
  ArianeeProductCertificateI18N,
} from '@arianee/common-types';
import { calculateImprint } from '@arianee/utils';
import {
  BigNumberish,
  ContractTransactionReceipt,
  ContractTransactionResponse,
} from 'ethers';

import Creator, { TransactionStrategy } from '../creator';
import { requiresConnection } from '../decorators/requiresConnection';
import { ProtocolCompatibilityError } from '../errors';
import { MissingCreditContractAddressError } from '../errors/MissingCreditTypeContractAddressError';
import { MissingCreditTypeError } from '../errors/MissingCreditTypeError';
import { TxInfos, CreditType } from '../types';

export default class Utils<Strategy extends TransactionStrategy> {
  constructor(private creator: Creator<Strategy>) {}

  @requiresConnection()
  public async isSmartAssetIdAvailable(id: number): Promise<boolean> {
    let isFree = false;

    await callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          // NFTs assigned to zero address are considered invalid, and queries about them do throw
          // See https://raw.githubusercontent.com/0xcert/framework/master/packages/0xcert-ethereum-erc721-contracts/src/contracts/nf-token-metadata-enumerable.sol
          try {
            await protocolV1.smartAssetContract.ownerOf(id);
          } catch (err: any) {
            if (err.code === 'CALL_EXCEPTION') {
              isFree = true;
            } else {
              throw err;
            }
          }

          return '';
        },
        protocolV2Action: async (protocolV2) => {
          try {
            await protocolV2.smartAssetBaseContract.ownerOf(id);
          } catch {
            isFree = true;
          }

          return '';
        },
      },
      this.creator.connectOptions
    );

    return isFree;
  }

  @requiresConnection()
  public async isMessageIdAvailable(id: number): Promise<boolean> {
    return callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          const message = await protocolV1.messageContract.messages(id);
          return (
            message.sender === '0x0000000000000000000000000000000000000000'
          );
        },
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );
  }

  @requiresConnection()
  public async isEventIdAvailable(id: number): Promise<boolean> {
    return callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          const tokenId = await protocolV1.eventContract.eventIdToToken(id);
          return tokenId === BigInt(0);
        },
        protocolV2Action: async (protocolV2) => {
          const tokenId =
            await protocolV2.eventHubContract.eventIdToEventsIndex(
              protocolV2.protocolDetails.contractAdresses.nft,
              id
            );
          return tokenId === BigInt(0);
        },
      },
      this.creator.connectOptions
    );
  }

  @requiresConnection()
  public async canCreateSmartAsset(smartAssetId: number): Promise<boolean> {
    try {
      const available = await this.isSmartAssetIdAvailable(smartAssetId);
      if (available) return true;

      const owner = await callWrapper(
        this.creator.arianeeProtocolClient,
        this.creator.slug!,
        {
          protocolV1Action: async (protocolV1) => {
            return protocolV1.smartAssetContract.ownerOf(smartAssetId);
          },
          protocolV2Action: async (protocolV2) => {
            throw new Error('not yet implemented');
          },
        },
        this.creator.connectOptions
      );

      const imprint = await callWrapper(
        this.creator.arianeeProtocolClient,
        this.creator.slug!,
        {
          protocolV1Action: async (protocolV1) => {
            return protocolV1.smartAssetContract.tokenImprint(smartAssetId);
          },
          protocolV2Action: async (protocolV2) => {
            throw new Error('not yet implemented');
          },
        },
        this.creator.connectOptions
      );

      const isOwner =
        owner.toLowerCase() === this.creator.core.getAddress().toLowerCase();

      const imprintIsEmpty =
        !imprint ||
        imprint ===
          '0x0000000000000000000000000000000000000000000000000000000000000000';

      const tokenIsReserved = isOwner && imprintIsEmpty;

      return tokenIsReserved;
    } catch {
      return false;
    }
  }

  @requiresConnection()
  public async getCreditBalance(
    creditType?: CreditType,
    address?: string,
    contractAddress?: string
  ): Promise<bigint> {
    return callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          if (creditType === undefined) {
            throw new MissingCreditTypeError(
              'Missing creditType parameter in getCreditBalance'
            );
          }
          return protocolV1.creditHistoryContract.balanceOf(
            address ?? this.creator.core.getAddress(),
            creditType
          );
        },
        protocolV2Action: async (protocolV2) => {
          if (!contractAddress) {
            throw new MissingCreditContractAddressError(
              'Missing contractAddress parameter in getCreditBalance'
            );
          }
          return protocolV2.creditManagerContract.balanceOf(
            address ?? this.creator.core.getAddress(),
            contractAddress
          );
        },
      },
      this.creator.connectOptions
    );
  }

  @requiresConnection()
  public async getCreditPrice(creditType: CreditType): Promise<bigint> {
    return callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.storeContract.getCreditPrice(creditType),
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );
  }

  @requiresConnection()
  public async getAriaBalance(address?: string): Promise<bigint> {
    return callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.ariaContract.balanceOf(
            address ?? this.creator.core.getAddress()
          ),
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );
  }

  @requiresConnection()
  public async getNativeBalance(address?: string): Promise<bigint> {
    return callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.getNativeBalance(
            address ?? this.creator.core.getAddress()
          ),
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );
  }

  @requiresConnection()
  public async getAvailableId(
    idType: 'smartAsset' | 'message' | 'event'
  ): Promise<number> {
    let idCandidate: number;
    let isFree = false;

    do {
      idCandidate = Math.ceil(Math.random() * 1000000000);

      if (idType === 'smartAsset') {
        isFree = await this.isSmartAssetIdAvailable(idCandidate);
      } else if (idType === 'message') {
        isFree = await this.isMessageIdAvailable(idCandidate);
      } else if (idType === 'event') {
        isFree = await this.isEventIdAvailable(idCandidate);
      } else {
        isFree = true;
      }
    } while (!isFree);

    return idCandidate;
  }

  @requiresConnection()
  public async getAvailableSmartAssetId(): Promise<number> {
    return this.getAvailableId('smartAsset');
  }

  @requiresConnection()
  public async getAvailableMessageId(): Promise<number> {
    return this.getAvailableId('message');
  }

  @requiresConnection()
  public async getAvailableEventId(): Promise<number> {
    return this.getAvailableId('event');
  }

  @requiresConnection()
  public async getAriaAllowance(
    spender: { address: string } | 'STORE_CONTRACT_ADDRESS',
    address?: string
  ) {
    return callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          let _spender: string;
          if (spender === 'STORE_CONTRACT_ADDRESS') {
            _spender = protocolV1.protocolDetails.contractAdresses.store;
          } else {
            _spender = spender.address;
          }

          return protocolV1.ariaContract.allowance(
            address ?? this.creator.core.getAddress(),
            _spender
          );
        },
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );
  }

  @requiresConnection()
  public async approveAriaSpender(
    spender: { address: string } | 'STORE_CONTRACT_ADDRESS',
    amount: BigNumberish = '10000000000000000000000000000'
  ) {
    return this.creator.transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) => {
          let _spender: string;
          if (spender === 'STORE_CONTRACT_ADDRESS') {
            _spender = protocolV1.protocolDetails.contractAdresses.store;
          } else {
            _spender = spender.address;
          }

          return protocolV1.ariaContract.approve(_spender, amount);
        },
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    ) as Promise<
      Strategy extends 'WAIT_TRANSACTION_RECEIPT'
        ? ContractTransactionReceipt
        : ContractTransactionResponse
    >;
  }

  @requiresConnection()
  public async getSmartAssetOwner(id: string): Promise<string> {
    return callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          await protocolV1.smartAssetContract.ownerOf(id),
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );
  }

  public async calculateImprint(
    content:
      | ArianeeProductCertificateI18N
      | ArianeeMessageI18N
      | ArianeeEventI18N
      | ArianeeBrandIdentityI18N
  ): Promise<string> {
    return calculateImprint(content, this.creator.fetchLike);
  }

  @requiresConnection()
  public async requestTestnetAria20(address?: string) {
    if (this.creator.slug !== 'testnet')
      throw new ProtocolCompatibilityError(
        'This method is only available for the protocol with slug testnet'
      );

    const res = await this.creator.fetchLike(
      `https://faucet.arianee.net/faucet/testnet/${
        address ?? this.creator.core.getAddress()
      }/aria`
    );

    return res.ok;
  }

  @requiresConnection()
  public async getSmartAssetIssuer(id: string) {
    return callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          await protocolV1.smartAssetContract.issuerOf(id),
        protocolV2Action: async (protocolV2) => {
          throw new Error('not yet implemented');
        },
      },
      this.creator.connectOptions
    );
  }

  public getTxInfos(
    txRes: ContractTransactionResponse | ContractTransactionReceipt
  ): TxInfos {
    const txInfos: TxInfos = {
      txHash: txRes.hash,
    };
    if (txRes instanceof ContractTransactionReceipt) {
      txInfos.gasUsed = txRes.gasUsed;
      txInfos.gasPrice = txRes.gasPrice;
      txInfos.blobGasPrice = txRes.blobGasPrice;
      txInfos.blobGasUsed = txRes.blobGasUsed;
      txInfos.cumulativeGasUsed = txRes.cumulativeGasUsed;
      txInfos.fee = txRes.fee;
    }
    return txInfos;
  }
}

export { Utils };
