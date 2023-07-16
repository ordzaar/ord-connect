import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import * as packageJson from "./package.json";
import commonjs from "@rollup/plugin-commonjs";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({ buffer: true }),
        NodeModulesPolyfillPlugin(),
      ],
    },
    include: [...Object.keys(packageJson.peerDependencies)],
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "sado-connect",
      fileName: "sado-connect",
    },
    rollupOptions: {
      external: [...Object.keys(packageJson.peerDependencies)],
    },
    commonjsOptions: {
      include: [/node_modules/, ...Object.keys(packageJson.peerDependencies)]
    }
  },
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
    commonjs(),
    cssInjectedByJsPlugin(),
  ],
});
