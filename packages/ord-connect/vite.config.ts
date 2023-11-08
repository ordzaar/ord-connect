import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import * as packageJson from "./package.json";
import eslint from "vite-plugin-eslint";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
    },
    include: [...Object.keys(packageJson.peerDependencies)],
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [...Object.keys(packageJson.peerDependencies)],
    },
    commonjsOptions: {
      include: [/node_modules/, ...Object.keys(packageJson.peerDependencies)],
    },
  },
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
    eslint(),
    cssInjectedByJsPlugin(),
    nodePolyfills({
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true, // can also be 'build', 'dev', or false
      },
    }),
  ],
});
