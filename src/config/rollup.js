import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import {
    importAssertionsPlugin
} from 'rollup-plugin-import-assert';
import {
    importAssertions
} from 'acorn-import-assertions';

import cleanup from 'rollup-plugin-cleanup';
import {
    terser
} from 'rollup-plugin-terser';
import svg from 'rollup-plugin-svg';
import {
    string
} from 'rollup-plugin-string';
import minimist from 'minimist';
const args = minimist(process.argv.slice(2));

const env = args.env || args['config-env'] || 'dev';
// import {
//     config,
//     env
// } from '../js/builder/bootstrap.js';
//import feConfig from '../config/segments/frontend.json'  assert { type: 'json' };


const plugins = [
    resolve(),
    importAssertionsPlugin(),
    commonjs(),
    cleanup(),
    string({
        include: '**/*.css'
    }),
    svg()
]

if (env === 'prod') {
    plugins.push(terser());
}

export default [{
    input: 'src/app/main.js',
    output: {
        file: 'assets/js/spelling-bee-assistant.js',
        format: 'iife'
    },
    acornInjectPlugins: [importAssertions],
    plugins
}];