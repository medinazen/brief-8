import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Cherche tous les fichiers .spec.ts dans le dossier tests/
  testMatch: ["**/tests/**/*.spec.ts"],
  // Reset les mocks automatiquement entre chaque test
  clearMocks: true,
  // Couverture de code
  collectCoverageFrom: [
    "src/modules/**/*.ts",
    "src/middleware/**/*.ts",
    "!src/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};

export default config;
