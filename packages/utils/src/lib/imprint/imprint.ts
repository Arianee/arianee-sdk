import { Cert } from '@arianee/0xcert-cert';
import {
  ArianeeBrandIdentityI18N,
  ArianeeEventI18N,
  ArianeeMessageI18N,
  ArianeeProductCertificateI18N,
} from '@arianee/common-types';

export const calculateImprint = async (
  content:
    | ArianeeProductCertificateI18N
    | ArianeeMessageI18N
    | ArianeeEventI18N
    | ArianeeBrandIdentityI18N,
  fetchLike: typeof fetch
): Promise<string> => {
  let cert: Cert;

  try {
    const $schema = await fetchLike(content.$schema);
    cert = new Cert({
      schema: await $schema.json(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error';
    throw new InvalidContentError(
      'The content is not valid (check that there is a $schema field and that it is valid) (err:' +
        message +
        ') '
    );
  }

  const cleanData = cleanObject(content);

  const imprint = await cert.imprint(cleanData);

  return '0x' + imprint;
};

export const cleanObject = (obj: any) => {
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
};

export class InvalidContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidContentError';
    Object.setPrototypeOf(this, InvalidContentError.prototype);
  }
}
