/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Cert } from '@0xcert/cert';
import {
  callWrapper,
  transactionWrapper,
} from '@arianee/arianee-protocol-client';
import { ArianeeProductCertificateI18N } from '@arianee/common-types';
import { BigNumberish } from 'ethers';

import Creator from '../creator';
import { CreditType } from '../types/credit';

export default class Utils {
  constructor(private creator: Creator) {}

  public requiresCreatorToBeConnected(): void {
    if (
      !this.creator.connected ||
      !this.creator.slug ||
      !this.creator.protocolDetails
    )
      throw new Error(
        'Creator is not connected, you must call the connect method once before calling other methods'
      );
  }

  public async isSmartAssetIdAvailable(id: number): Promise<boolean> {
    this.requiresCreatorToBeConnected();

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

  public async canCreateSmartAsset(smartAssetId: number): Promise<boolean> {
    this.requiresCreatorToBeConnected();

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

  public async getCreditBalance(
    creditType: CreditType,
    address?: string
  ): Promise<bigint> {
    this.requiresCreatorToBeConnected();

    return callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.creditHistoryContract.balanceOf(
            address ?? this.creator.core.getAddress(),
            creditType
          ),
      },
      this.creator.connectOptions
    );
  }

  public async getCreditPrice(creditType: CreditType): Promise<bigint> {
    this.requiresCreatorToBeConnected();

    return callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.storeContract.getCreditPrice(creditType),
      },
      this.creator.connectOptions
    );
  }

  public async getAriaBalance(address?: string): Promise<bigint> {
    this.requiresCreatorToBeConnected();

    return callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.ariaContract.balanceOf(
            address ?? this.creator.core.getAddress()
          ),
      },
      this.creator.connectOptions
    );
  }

  public async getNativeBalance(address?: string): Promise<bigint> {
    this.requiresCreatorToBeConnected();

    return callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.getNativeBalance(
            address ?? this.creator.core.getAddress()
          ),
      },
      this.creator.connectOptions
    );
  }

  public async getAvailableSmartAssetId(): Promise<number> {
    this.requiresCreatorToBeConnected();

    let idCandidate: number;
    let isFree = false;

    do {
      idCandidate = Math.ceil(Math.random() * 1000000000);
      isFree = await this.isSmartAssetIdAvailable(idCandidate);
    } while (!isFree);

    return idCandidate;
  }

  public async getAriaAllowance(spender: string, address?: string) {
    this.requiresCreatorToBeConnected();

    return callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.ariaContract.allowance(
            address ?? this.creator.core.getAddress(),
            spender
          ),
      },
      this.creator.connectOptions
    );
  }

  public async approveAriaSpender(
    spender: string,
    amount: BigNumberish = '10000000000000000000000000000'
  ) {
    this.requiresCreatorToBeConnected();

    return transactionWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          protocolV1.ariaContract.approve(spender, amount),
      },
      this.creator.connectOptions
    );
  }

  public async getSmartAssetOwner(id: string): Promise<string> {
    return callWrapper(
      this.creator.arianeeProtocolClient,
      this.creator.slug!,
      {
        protocolV1Action: async (protocolV1) =>
          await protocolV1.smartAssetContract.ownerOf(id),
      },
      this.creator.connectOptions
    );
  }

  private cleanObject(obj: any) {
    for (const propName in obj) {
      if (
        obj[propName] &&
        obj[propName].constructor === Array &&
        obj[propName].length === 0
      ) {
        delete obj[propName];
      }
    }

    return obj;
  }
  public async calculateImprint(
    content: ArianeeProductCertificateI18N
  ): Promise<string> {
    const $schema = await this.creator.fetchLike(content.$schema);
    const cert = new Cert({
      schema: await $schema.json(),
    });

    const cleanData = this.cleanObject(content);

    const imprint = await cert.imprint(cleanData);

    return '0x' + imprint;
  }
}

export { Utils };
