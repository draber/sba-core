import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import {
    importAssertionsPlugin
} from 'rollup-plugin-import-assert';
import {
    importAssertions
} from 'acorn-import-assertions';

export default [{
	input: './main-in-test.js',
	output: {
		file: './main-out-test.js',
		format: 'iife'
	},
	
    acornInjectPlugins: [
        importAssertions
    ],
    plugins: [
        importAssertionsPlugin(),
        resolve(),
        commonjs(),
        cleanup()
    ]
}];