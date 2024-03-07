/* eslint-disable */
export default {
  displayName: 'utils',
  preset: '../../jest.preset.js',
  testEnvironment: 'jest-environment-node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/utils',
  maxWorkers: 1,
};
