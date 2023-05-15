import { ethers } from 'ethers';

/**
 * @param address address to normalize and checksum
 * @returns normalized and checksumed address (e.g. 0x19fbcf704e4ca7089d8382fbeb8cacde568710ca -> 0x19FBcF704e4CA7089D8382FBeB8cacdE568710ca)
 */
export const checksumAddress = (address: string): string => {
  return ethers.getAddress(address);
};
