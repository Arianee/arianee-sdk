import { TransactionStrategy } from '../../creator';
import {
  InsufficientEventCreditsError,
  InsufficientMessageCreditsError,
  InsufficientSmartAssetCreditsError,
} from '../../errors';
import { CreditType } from '../../types';
import Utils from '../../utils/utils';

export const checkCreditsBalance = async <Strategy extends TransactionStrategy>(
  utils: Utils<Strategy>,
  creditType: CreditType,
  minAmount = BigInt(1),
  contractAddress?: string
): Promise<void> => {
  const creditsBalance = await utils.getCreditBalance(
    creditType,
    undefined,
    contractAddress
  );

  if (creditsBalance >= minAmount) return;

  switch (creditType) {
    case CreditType.smartAsset:
      throw new InsufficientSmartAssetCreditsError(
        `You do not have enough smart asset credits (required: ${minAmount}, balance: ${creditsBalance})`
      );
    case CreditType.message:
      throw new InsufficientMessageCreditsError(
        `You do not have enough message credits (required: ${minAmount}, balance: ${creditsBalance})`
      );
    case CreditType.event:
      throw new InsufficientEventCreditsError(
        `You do not have enough event credits (required: ${minAmount}, balance: ${creditsBalance})`
      );
    case CreditType.update:
      throw new InsufficientEventCreditsError(
        `You do not have enough update credits (required: ${minAmount}, balance: ${creditsBalance})`
      );
    default:
      throw new Error('Invalid credit type');
  }
};
