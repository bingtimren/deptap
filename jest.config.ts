import { createDefaultPreset, type JestConfigWithTsJest } from 'ts-jest'

const presetConfig = createDefaultPreset({
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["<rootDir>/test/**/*.test.ts"],
})

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
}

export default jestConfig