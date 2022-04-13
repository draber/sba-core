import YAML from 'yamljs';
import pkg from '../../../package.json' assert {
    type: 'json'
};
import Tree from '../tree/Tree.js';
import fs from 'fs-extra';
//import console from 'a-nicer-console'



let confRoot = './src/config/'

let store = new Tree({
    data: {
        ...pkg,
        ...YAML.load(`${confRoot}/config.yml`)
    }
})

store.resolveVars();

//console.log(store.toJson().match(varRe))
fs.outputJson('./test.json', store.obj, {spaces: '\t'})

let data;
for(let [type, paths] of Object.entries(YAML.load(`${confRoot}/meta.yml`))) {
    data = {};
    
    for(let [key, path] of Object.entries(paths)) {
        data[key] = store.get(path);
    }    
    fs.outputJson(`${confRoot}/segments/${type}.json`, data, {spaces : '\t'})
}