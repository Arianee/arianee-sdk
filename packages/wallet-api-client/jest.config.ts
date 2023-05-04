/* eslint-disable */
export default {
  displayName: 'wallet-api-client',
  preset: '../../jest.preset.js',
  testEnvironment: 'jest-environment-node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/wallet-api-client',
};
