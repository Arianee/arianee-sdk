/* eslint-disable */
export default {
  displayName: 'privacy-circuits',
  preset: '../../jest.preset.js',
  testEnvironment: 'jest-environment-node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/privacy-circuits',
};
