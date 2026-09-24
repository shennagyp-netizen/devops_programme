import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["tests/unit/**/*.test.mjs", "tests/integration/**/*.test.mjs"],
    clearMocks: true,
    restoreMocks: true,
    passWithNoTests: false
  }
});
