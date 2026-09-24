import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: false,
    include: ["tests/unit/**/*.test.mjs", "tests/integration/**/*.test.mjs"],
    clearMocks: true,
    restoreMocks: true,
    passWithNoTests: false
  }
});
