import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  oxc: false,
  esbuild: {
    jsx: "automatic",
  } as never,
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
  test: {
    environment: "node",
  },
});
