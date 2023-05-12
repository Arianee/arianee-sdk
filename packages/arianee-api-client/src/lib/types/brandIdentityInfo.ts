import { ArianeeBrandIdentityI18N, Protocol } from '@arianee/common-types';

export type brandContentInfo = {
  uri: string;
  imprint: string;
  data: ArianeeBrandIdentityI18N;
};

export type brandIdentityInfo = {
  waiting: brandContentInfo;
  validated: brandContentInfo;
  address: string;
  network: Protocol['name'];
  createdAt: string;
  updatedAt: string;
};
