module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/tests/mobile/**/*.test.tsx'],
  collectCoverageFrom: ['src/features/**/*.tsx', 'src/shared/ui/**/*.tsx'],
  coverageDirectory: 'coverage/mobile',
};
