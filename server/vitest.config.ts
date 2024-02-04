import {defineConfig} from "vitest/config";

export default defineConfig({
  test: {
    maxConcurrency: 1,
    coverage: {
      include: ["src/**/*.{js,jsx,ts,tsx}"],
    },
  },
});
