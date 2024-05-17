import { PrivacyGatewayErrorEnum } from '@arianee/common-types';

export class PrivacyGatewayError extends Error {
  constructor(
    message: string,
    public privacyGatewayErrorEnum: PrivacyGatewayErrorEnum
  ) {
    super(message);
    this.name = 'PrivacyGatewayError';
    Object.setPrototypeOf(this, PrivacyGatewayError.prototype);
  }
}
