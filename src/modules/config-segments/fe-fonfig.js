import {
    config,
    jsonOptions
} from "../bootstrap/bootstrap.js";
import fs from 'fs-extra';

const feConfig = {};
[
    'version',
    'label',
    'title',
    'url',
    'ns',
    'kofi',
    'targetUrl'
].forEach(entry => {
    feConfig[entry] = config.get(entry);
})

fs.writeJsonSync('./src/config/segments/frontend.json', feConfig, jsonOptions);