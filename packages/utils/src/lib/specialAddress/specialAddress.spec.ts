import {
  SpecialAddressEnum,
  SpecialAddressInLowerCaseEnum,
} from './specialAddress';

describe('SpecialAddressEnum and SpecialAddressInLowerCaseEnum', () => {
  it('should have correct values in SpecialAddressEnum', () => {
    expect(SpecialAddressEnum.nullAddress).toBe(
      '0x0000000000000000000000000000000000000000'
    );
    expect(SpecialAddressEnum.bridgeAddress).toBe(
      '0x0000000000000000000000000000000B7269d67e'
    );
    expect(SpecialAddressEnum.burnAddress).toBe(
      '0x000000000000000000000000000000000000dEaD'
    );
  });

  it('should convert SpecialAddressEnum values to lowercase in SpecialAddressInLowerCaseEnum', () => {
    expect(SpecialAddressInLowerCaseEnum.nullAddress).toBe(
      '0x0000000000000000000000000000000000000000'
    );
    expect(SpecialAddressInLowerCaseEnum.bridgeAddress).toBe(
      '0x0000000000000000000000000000000b7269d67e'
    );
    expect(SpecialAddressInLowerCaseEnum.burnAddress).toBe(
      '0x000000000000000000000000000000000000dead'
    );
  });

  it('should have same keys in both enums', () => {
    const enumKeys = Object.keys(SpecialAddressEnum);
    const lowerCaseKeys = Object.keys(SpecialAddressInLowerCaseEnum);
    expect(lowerCaseKeys.sort()).toEqual(enumKeys.sort());
  });
  it('should have same value in both enums', () => {
    const enumKeys = Object.values(SpecialAddressEnum).map((d) =>
      d.toLowerCase()
    );
    const lowerCaseKeys = Object.values(SpecialAddressInLowerCaseEnum);
    expect(lowerCaseKeys.sort()).toEqual(enumKeys.sort());
  });
});
