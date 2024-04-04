const { defaults } = require('jest-config')

/** @type {import('jest').Config} */
const config = {
  moduleFileExtensions: [
    ...defaults.moduleFileExtensions,
    'mts',
    'cts',
    'd.ts',
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    'node_modules/variables/.+\\.(j|t)sx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!variables/.*)'],
  coverageReporters: [
    "json-summary",
    "text",
    "lcov"
  ]
}

module.exports = config
