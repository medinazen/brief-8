import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/functional/**/*.spec.ts"],
  clearMocks: true,
  testTimeout: 15000,
};

export default config;
