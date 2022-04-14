import minimist from 'minimist';
import YAML from 'yamljs';
import Tree from '../tree/Tree.js';
import fs from 'fs-extra';

const pkg = fs.readJsonSync('./package.json');

const args = minimist(process.argv.slice(2));

export const config = new Tree({
    data: {
        ...pkg,
        ...YAML.load(`./src/config/config.yml`)
    }
})

// 'config-env' => compat with rollup
export const env = args.env || args['config-env'] || 'dev';

export const jsonOptions = env === 'dev' ? {
    spaces: '\t'
} : {};