import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    env: {
      apiUrl: "http://localhost:3310/api",
    },
    specPattern: "...",
    supportFile: "...",
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 6000,
  },
});
