/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/config/singleton.ts'],
  testMatch: [
    '<rootDir>/test/unit/**/*.(spec|test).ts',
    '<rootDir>/test/integration/**/*.(spec|test).ts',
  ],
};