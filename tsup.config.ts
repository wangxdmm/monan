import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "./index.ts",
    helpers: "./utils/helpers/index.ts",
    http: "./utils/http/index.ts",
  },
  format: ["cjs", "esm"],
  splitting: true,
  sourcemap: false,
  dts: process.env.DEV
    ? false
    : {
        compilerOptions: {
          composite: false,
        },
      },
  clean: true,
  tsconfig: "./tsconfig.json",
});
