import { ChainType } from '@arianee/common-types';
import { calculateImprint } from '@arianee/utils';

import MessageInstance from '../../services/message/instances/messageInstance';
import ArianeeEventInstance from '../../services/smartAsset/instances/arianeeEventInstance';
import SmartAssetInstance from '../../services/smartAsset/instances/smartAssetInstance';
import { TransactionStrategy } from '../../wallet';

type SupportedClass<T extends ChainType, S extends TransactionStrategy> =
  | typeof SmartAssetInstance<T, S>
  | typeof ArianeeEventInstance<T, S>
  | typeof MessageInstance<T, S>;

/**
 * Creates an instance of a supported class (smart asset, arianee event or message)
 * and computes the authenticity of the content with the imprint and set the isAuthentic property
 * @param supportedClass the class of the instance to create
 */
export const instanceFactory = async <
  T extends ChainType,
  S extends TransactionStrategy,
  I extends SupportedClass<T, S>
>(
  supportedClass: I,
  params: ConstructorParameters<I>,
  fetchLike: typeof fetch
): Promise<InstanceType<I>> => {
  const instance = new (supportedClass as any)(...params);

  if (instance instanceof ArianeeEventInstance) {
    const calculatedImprint = await calculateImprint(
      instance.rawContent,
      fetchLike
    );

    Object.assign(instance, {
      isAuthentic:
        calculatedImprint.toLowerCase() === instance.imprint.toLowerCase(),
    });
  } else {
    const calculatedImprint = await calculateImprint(
      instance.data.rawContent,
      fetchLike
    );

    instance.data.isAuthentic =
      calculatedImprint.toLowerCase() === instance.data.imprint.toLowerCase();
  }

  return instance as InstanceType<I>;
};
