export * from './lib/walletApiClient';
import WalletApiClient from './lib/walletApiClient';
export default WalletApiClient;
export { BadRequestError } from './lib/errors/BadRequestError';
export { ForbiddenError } from './lib/errors/ForbiddenError';
export { NotFoundError } from './lib/errors/NotFoundError';
