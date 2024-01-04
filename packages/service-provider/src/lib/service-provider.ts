// eslint-disable @typescript-eslint/no-non-null-assertion
import {
  ArianeeAccessToken,
  JwtHeaderInterface,
  SmartAssetSharingTokenPayload,
} from '@arianee/arianee-access-token';
import {
  ArianeeProtocolClient,
  ArianeeProtocolClientOptions,
  ProtocolClientV2,
} from '@arianee/arianee-protocol-client';
import Core from '@arianee/core';
import { ISignatureTransfer as ISignatureTransferNs } from '@arianee/permit721-contracts';
import { ptfAdapter } from '@arianee/permit721-sdk';
import { PERMIT721_ADDRESS, PermitTransferFrom } from '@arianee/permit721-sdk';
import { getChainTypeOf } from '@arianee/utils';
import { Wallet } from '@arianee/wallet';
import WalletApiClient from '@arianee/wallet-api-client';
import { ethers } from 'ethers';

// Don't try to use address(0) for a `transferFrom` call as it will fail with a `revert` error (not allowed by the ERC721 standard)
const DRY_RUN_ADDRESS = '0x0000000000000000000000000000000000000001';

export interface ServiceProviderOptions {
  protocolClientOptions?: ArianeeProtocolClientOptions;
}

export class ServiceProvider {
  static readonly SST_SEARCH_PARAM_KEY = 'SST';

  private readonly protocolClient: ArianeeProtocolClient;

  constructor(core: Core, options?: ServiceProviderOptions) {
    this.protocolClient = new ArianeeProtocolClient(
      core,
      options?.protocolClientOptions
    );
  }

  public extractSST(url: string): string | undefined {
    try {
      const parsedURL = new URL(url);
      if (parsedURL.searchParams.has(ServiceProvider.SST_SEARCH_PARAM_KEY)) {
        const sst = parsedURL.searchParams.get(
          ServiceProvider.SST_SEARCH_PARAM_KEY
        );
        if (!sst)
          throw new Error(`${ServiceProvider.SST_SEARCH_PARAM_KEY} is empty`);
        return sst;
      } else {
        throw new Error(
          `${ServiceProvider.SST_SEARCH_PARAM_KEY} is not present in the URL`
        );
      }
    } catch (err) {
      console.error(`An error occurred while extracting SST: ${err}`);
      return undefined;
    }
  }

  public async isValidSST({
    sst,
    performDryRun = false,
    shouldThrow = false,
  }: {
    sst: string;
    performDryRun?: boolean;
    shouldThrow?: boolean;
  }): Promise<boolean> {
    const { valid } = await this._isValidSST(sst, performDryRun, shouldThrow);
    return valid;
  }

  private async _isValidSST(
    sst: string,
    performDryRun: boolean,
    shouldThrow = false
  ): Promise<{
    valid: boolean;
    owner: string | undefined;
    tokenId: string | undefined;
    permit: PermitTransferFrom | undefined;
    permitSig: string | undefined;
    protocolSlug?: string;
  }> {
    try {
      // An SST is valid if is a valid ArianeAccessToken AND a valid SmartAssetSharingToken
      const isValidAAT = ArianeeAccessToken.isArianeeAccessTokenValid(sst);
      if (!isValidAAT) {
        throw new Error('SST is not a valid AAT');
      }

      const parsedSST = ServiceProvider.parseSST(sst);
      // Some deeps checks on the SST, guess would be useful for brands debugging
      if (!parsedSST || !parsedSST.payload) {
        throw new Error('Could not parse SST');
      }
      if (!parsedSST.payload.sub || parsedSST.payload.sub !== 'certificate') {
        throw new Error('Invalid AAT scope, should be "certificate"');
      }
      if (!parsedSST.payload.network) {
        throw new Error('Invalid AAT network');
      }
      if (!parsedSST.payload.permit || !parsedSST.payload.permit.permitted) {
        throw new Error('Invalid SST permit');
      }
      if (
        !parsedSST.payload.permit.permitted.tokenId ||
        parsedSST.payload.permit.permitted.tokenId !== parsedSST.payload.subId
      ) {
        throw new Error('Invalid SST permit tokenId, not matching AAT subId');
      }
      if (!parsedSST.payload.permitSig) {
        throw new Error('Invalid SST permit signature');
      }

      const protocolSlug = parsedSST.payload.network;

      const { permit, permitSig } = parsedSST.payload;
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (Number(permit.deadline) > nowSeconds) {
        // Retrieve owner from ERC721 contract
        const { tokenId } = permit.permitted;
        const tokenIdAsStr = tokenId.toString();

        const { smartAssetContract } = await this.getProtocolClientInstance(
          protocolSlug
        );

        const owner = (
          await smartAssetContract.ownerOf(tokenIdAsStr)
        )?.toLowerCase();
        const sstIssuer = parsedSST.payload.iss?.toLowerCase();
        if (!sstIssuer) {
          throw new Error('Invalid SST issuer');
        }

        // Check if owner is the same as the one who signed the permit
        if (owner !== sstIssuer) {
          throw new Error(
            `Owner address ${owner} is not the same as the one who signed the permit ${sstIssuer}`
          );
        }

        // Check if owner has approved Permit721 contract to transfer the token
        const approvedAddress = (
          await smartAssetContract.getApproved(tokenIdAsStr)
        )?.toLowerCase();
        const permit721Address = PERMIT721_ADDRESS.toLowerCase();

        const isApproved =
          approvedAddress && approvedAddress === permit721Address;
        if (!isApproved)
          throw new Error(
            `Owner ${owner} has not approved Permit721 contract ${permit721Address}`
          );

        if (performDryRun) {
          // Simulate the transfer through Permit721 contract
          await this._transferSmartAsset(
            owner,
            tokenIdAsStr,
            permit,
            permitSig,
            DRY_RUN_ADDRESS,
            protocolSlug,
            true
          );
        }

        return {
          valid: true,
          owner,
          tokenId: tokenIdAsStr,
          permit,
          permitSig,
          protocolSlug,
        };
      } else {
        throw new Error(
          `SST is expired (deadline: ${permit.deadline}, now: ${nowSeconds})`
        );
      }
    } catch (err) {
      if (shouldThrow) throw err;
      console.error(`An error occurred while validating SST: ${err}`);
      return {
        valid: false,
        owner: undefined,
        tokenId: undefined,
        permit: undefined,
        permitSig: undefined,
      };
    }
  }

  public async getSmartAssetFromSST({
    sst,
    performDryRun = false,
  }: {
    sst: string;
    performDryRun?: boolean;
  }) {
    const { tokenId, protocolSlug } = await this._isValidSST(
      sst,
      performDryRun,
      true // throw the underlying error if the SST is not valid
    );

    const core = Core.fromRandom(); // We use a random core here, as we don't need to sign anything
    const aat = new ArianeeAccessToken(core, {
      initialValues: {
        walletAccessToken: sst,
      },
    });

    const walletApiClient = new WalletApiClient(
      getChainTypeOf(protocolSlug!),
      core,
      {
        arianeeAccessToken: aat,
      }
    );

    const wallet = new Wallet({
      auth: { core },
      walletAbstraction: walletApiClient,
    });
    return wallet.smartAsset.get(protocolSlug!, {
      id: tokenId!,
    });
  }

  public async transferSmartAsset({
    sst,
    to,
    performDryRun = false,
  }: {
    sst: string;
    to: string;
    performDryRun?: boolean;
  }) {
    const { owner, tokenId, protocolSlug, permit, permitSig } =
      await this._isValidSST(
        sst,
        false, // don't perform dry run here, as its eventually done below
        true // throw the underlying error if the SST is not valid
      );

    const transferSmartAssetParams: Parameters<
      typeof this._transferSmartAsset
    > = [owner!, tokenId!, permit!, permitSig!, to, protocolSlug!, false];

    if (performDryRun) {
      const dryRunTransferSmartAssetParams: typeof transferSmartAssetParams = [
        ...transferSmartAssetParams,
      ];
      // Set the last parameter `isDryRun` to true
      dryRunTransferSmartAssetParams[6] = true;
      await this._transferSmartAsset(...dryRunTransferSmartAssetParams);
    }

    return this._transferSmartAsset(
      ...transferSmartAssetParams
    ) as Promise<ethers.TransactionResponse>;
  }

  private async _transferSmartAsset(
    owner: string,
    tokenId: string,
    permit: PermitTransferFrom,
    permitSig: string,
    to: string,
    protocolSlug: string,
    isDryRun = false
  ) {
    const { permit721Contract } = await this.getProtocolClientInstance(
      protocolSlug
    );

    return await permit721Contract[
      'permitTransferFrom(((address,uint256),uint256,uint256),(address,uint256),address,bytes)'
    ][isDryRun ? 'staticCall' : 'send'](
      ptfAdapter(permit),
      await this.getTransferDetails(to, tokenId.toString()),
      owner,
      permitSig
    );
  }

  public static parseSST(sst: string): {
    header: JwtHeaderInterface;
    payload: SmartAssetSharingTokenPayload;
    signature: string;
  } {
    const parsedSST = ArianeeAccessToken.decodeJwt(sst);
    return {
      header: parsedSST.header,
      payload: parsedSST.payload as SmartAssetSharingTokenPayload,
      signature: parsedSST.signature,
    };
  }

  private async getTransferDetails(
    to: string,
    tokenId: string
  ): Promise<ISignatureTransferNs.SignatureTransferDetailsStruct> {
    return {
      to,
      requestedTokenId: tokenId,
    };
  }

  private async getProtocolClientInstance(protocolSlug: string) {
    const protocolClientInstance = await this.protocolClient.connect(
      protocolSlug
    );

    if (protocolClientInstance instanceof ProtocolClientV2) {
      throw new Error('Protocol v2 is not supported yet');
    }
    return protocolClientInstance;
  }
}
