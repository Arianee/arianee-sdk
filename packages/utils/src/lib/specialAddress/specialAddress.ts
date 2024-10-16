export enum SpecialAddressEnum {
  nullAddress = '0x0000000000000000000000000000000000000000',
  bridgeAddress = '0x0000000000000000000000000000000B7269d67e',
  burnAddress = '0x000000000000000000000000000000000000dEaD',
}

export const SpecialAddressInLowerCaseEnum = Object.fromEntries(
  Object.entries(SpecialAddressEnum).map(([key, value]) => [
    key,
    value.toLowerCase(),
  ])
) as { [key in keyof typeof SpecialAddressEnum]: string };
