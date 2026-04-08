import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  testMatch: ["**/tests/**/*.spec.ts"],

  clearMocks: true,

  collectCoverageFrom: [
    "src/modules/**/*.ts",
    "src/middleware/**/*.ts",
    "!src/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};

export default config;
