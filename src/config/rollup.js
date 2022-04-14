import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { importAssertionsPlugin } from "rollup-plugin-import-assert";
import { importAssertions } from "acorn-import-assertions";

import cleanup from "rollup-plugin-cleanup";
import { terser } from "rollup-plugin-terser";
import svg from "rollup-plugin-svg";
import { string } from "rollup-plugin-string";

import { config, env } from "../modules/bootstrap/bootstrap.js";

let outputFile = config.get("rollup.uncompressed");

const plugins = [
  resolve(),
  importAssertionsPlugin(),
  commonjs(),
  cleanup(),
  string({
    include: "**/*.css",
  }),
  svg(),
];

if (env === "prod") {
  plugins.push(terser());
  outputFile = config.get("rollup.compressed");
}

export default [
  {
    input: config.get("rollup.input"),
    output: {
      file: outputFile,
      format: config.get("rollup.format"),
    },
    acornInjectPlugins: [importAssertions],
    plugins,
  },
];
