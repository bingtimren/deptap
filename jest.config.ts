import { createDefaultPreset, type JestConfigWithTsJest } from 'ts-jest'

const presetConfig = createDefaultPreset({
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["<rootDir>/test/**/*.test.ts"],
  moduleNameMapper: {
    '^#deptap$': '<rootDir>/src/index.ts',
  },      

  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
    },
  },  

})

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
}

export default jestConfig