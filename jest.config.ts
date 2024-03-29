/** @type {import('ts-jest').JestConfigWithTsJest} */
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.paths.json';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/(*.)+(spec|test).[jt]s'],
  testPathIgnorePatterns: ['/node_modules/', '/.github/', '/.vscode/', '.serverless'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: '.',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  modulePaths: ['<rootDir>'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths)
};
