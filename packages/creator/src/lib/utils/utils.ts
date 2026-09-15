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
  ZeroAddress,
} from 'ethers';

import Creator, { TransactionStrategy } from '../creator';
import { requiresConnection } from '../decorators/requiresConnection';
import { ProtocolCompatibilityError } from '../errors';
import { MissingCreditContractAddressError } from '../errors/MissingCreditTypeContractAddressError';
import { MissingCreditTypeError } from '../errors/MissingCreditTypeError';
import { getSmartAssetFromApi } from '../helpers/smartAsset/getSmartAssetFromApi';
import { CreditType } from '../types/credit';

export default class Utils<Strategy extends TransactionStrategy> {
  constructor(private creator: Creator<Strategy>) {}

  /**
   * Availability is decided by the Arianee API alone, with no RPC call on any
   * branch. A token the API does not know is treated as free.
   *
   * The API is an indexer, so it lags a fresh mint: a token minted seconds ago
   * can still read as free here and be handed out twice. That window is accepted
   * knowingly, in exchange for a check that no longer fails when the protocol's
   * RPC gateway is down. Nothing is silently corrupted when it happens, the mint
   * transaction reverts on chain.
   */
  @requiresConnection()
  public async isSmartAssetIdAvailable(id: number): Promise<boolean> {
    const fromApi = await getSmartAssetFromApi(this.creator, id);

    // A token owned by the zero address is invalid for the contract, so it does
    // not make the id taken either.
    return !fromApi?.owner || fromApi.owner === ZeroAddress;
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

      // Not available means the API knows this token, so the record carries both
      // fields. One HTTP call replaces the `ownerOf` and `tokenImprint` RPC round
      // trips this used to make.
      const fromApi = await getSmartAssetFromApi(this.creator, smartAssetId);
      if (!fromApi?.owner) return false;

      const { owner, imprint } = fromApi;

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

  /** Served by the Arianee API, with no RPC call. */
  @requiresConnection()
  public async getSmartAssetOwner(id: string): Promise<string> {
    const fromApi = await getSmartAssetFromApi(this.creator, id);

    if (!fromApi?.owner)
      throw new Error(
        `The Arianee API has no owner for smart asset ${id} on ${this.creator.slug}`
      );

    return fromApi.owner;
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

  /**
   * Served by the Arianee API, with no RPC call. Falls back to the zero address
   * when the API carries no issuer, which is what `issuerOf` returned on chain
   * for a reserved NFT and what callers branch on (see `events.ts`).
   */
  @requiresConnection()
  public async getSmartAssetIssuer(id: string): Promise<string> {
    const fromApi = await getSmartAssetFromApi(this.creator, id);

    return fromApi?.issuer ?? ZeroAddress;
  }
}

export { Utils };
