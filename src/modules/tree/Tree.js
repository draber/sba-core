import getCmpFn from "./cmp-functions.js";
import {
    deepClone
} from "../deep-clone/deep-clone.js";

/**
 * Private function area
 * Functions in this area could be implemented as `#fn()` inside the class.
 * Unfortunately this seem to confuse some formatters and they turn `#fn()` into `# fn()`
 */

/**
 * Check whether a value is a plain object
 * @param {Any} value 
 * @returns {Boolean}
 */
const _isPlainObject = value => {
    return !!(value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype);
}

/**
 * Check whether a value is a plain object or an array
 * @param {Any} value 
 * @returns {Boolean}
 */
const _isCollection = value => {
    return _isPlainObject(value) || Array.isArray(value);
}

/**
 * Retrieve all paths as an array in dot-notation
 * @param {Object} obj 
 * @param {Array} [dotArr] 
 * @param {String} [propStr] 
 * @returns 
 */
const _keysToDotNotation = (obj, dotArr = [], propStr = '') => {
    if(typeof obj === 'undefined' || obj === null){
        return dotArr;
    }
    if (Array.isArray(obj)) {
        obj = {
            ...obj
        }
    }
    Object.entries(obj).forEach(([key, val]) => {
        const nestedPropStr = propStr + (propStr ? '.' : '') + key;
        if (_isCollection(val)) {
            _keysToDotNotation(val, dotArr, nestedPropStr);
        }
        else {
            dotArr.push(nestedPropStr);
        }
    });
    return dotArr;
}

/**
 * Returns a value based on a key, can also be `foo.bar`
 * @param {Object} obj
 * @param {String} keyStr
 * @returns {String|undefined}
 * @private
 */
const _get = (obj, keyStr) => {
    const keys = keyStr.toString().split('.');
    return keys.reduce(
        (current, token) => {
            return current?.[token]
        },
        obj
    )
}

/**
 * Sets or deletes a value
 * @param {Object} obj
 * @param {String} keyStr
 * @param {Any|undefined}
 * @returns {Object}
 * @private
 */
const _update = (obj, keyStr, value) => {       
    const keys = keyStr.toString().split('.');
    const last = keys.pop();
    for (let token of keys) {
        if (!obj[token]) {
            obj[token] = {};
        }
        if (!_isPlainObject(obj)) {
            throw (`${token} is not of the type Object`);
        }
        obj = obj[token];
    }
    if(typeof value !== 'undefined'){
        obj[last] = value;
    }
    else {
        delete obj[last];
    }    
    return obj;
}

/**
 * Retrieve an object with all {{templates}} and their respective values
 * @param {Tree} tree 
 * @returns {Object}
 */
const _getTplMatchData = tree => {
    let objStr = tree.toJson();
    let matchPaths = [...objStr.matchAll(tree.tplRe)].map(e => e.groups.path);
    matchPaths = Array.from(new Set(matchPaths));
    let matchData = {};
    // 1st round
    matchPaths.forEach(entry => {
        const data = tree.get(entry);
        if (['string', 'number'].includes(typeof data) || _isCollection(data)) {
            matchData[`{{${entry}}}`] = data;
        }
    })

    // 2nd round
    for (let [placeholder, entryData] of Object.entries(matchData)) {
        if (_isCollection(entryData)) {
            for (let path of _keysToDotNotation(entryData)) {
                const value = _get(entryData, path)
                if (['string', 'number'].includes(typeof value)){
                    _update(entryData, path, value.replace(tree.tplRe, (full, capture) => {
                        return typeof matchData[capture] !== 'undefined' ? matchData[capture] : capture
                    }))
                }
            }
            matchData[placeholder] = entryData;
        } else {      
            matchData[placeholder] = entryData.replace(tree.tplRe, (full, capture) => {
                return typeof matchData[capture] !== 'undefined' ? matchData[capture] : capture
            })
        }
    }
    return matchData;
}

/**
 * CRUD extension of a plain object
 */
class Tree {

    /**
     * Equivalent to Array.length
     */
    get length() {
        return this.keys().length;
    }

    /**
     * Remove all data
     */
    flush() {
        this.obj = {};
        this.save();
    }

    /**
     * Storage handling: write to local storage
     */
    save() {
        return this.lsKey ? localStorage.setItem(this.lsKey, this.toJson()) : null;
    }

    /**
     * Set a new or overwrite an existing value
     * @param {String} keyStr
     * @param {*} value
     */
    set(keyStr, value) {     
        _update(this.obj, keyStr, value);
        this.save();
        return this;
    }

    /**
     * Delete an existing value
     * @param {String} keyStr
     */
    unset(keyStr) {    
        _update(this.obj, keyStr);
        this.save();
        return this;
    }

    /**
     * Retrieve a single (sub-)entry, supports 'a.b.c.d' string syntax
     * @param {String|Number} key 
     * @returns {String|Object}
     */
    get(key) {
        return _get(this.obj, key);
    }

    /**
     * Retrieve a deep clone of a single (sub-)entry, supports 'a.b.c.d' string syntax
     * @param {String|Number} key 
     * @returns {String|Object}
     */
    getClone(key) {
        return deepClone(this.get(key))
    }

    /**
     * Whether or not a certain key exists in this tree
     * @param {String|Number} key 
     * @returns {Boolean}
     */
    has(key) {
        return typeof this.get(key) !== 'undefined';
    }

    /**
     * Syntactical sugar to make condition building easy
     * @param {String} searchKey Path to the value to compare against. 
     *                           The first key is ommited and added in the loop, e.g. 'b.c.d' looks for a.b.c.d, b.b.c.d etc.
     * @param {String|Function} cmpFn Any function from ./cmp-functions.js or a custom function. They receive to arguments, the found and the expected value
     * @param {Any} [expected] Whatever you need to compare against. Can be omitted when `cmpFn` is a function and does all the magic itself
     * @returns {Array}
     */
    where(searchKey, cmpFn, expected = null) {
        return [searchKey, cmpFn, expected];
    }

    /**
     * Retrieve all or some data 
     * @param {Array} [...conditions] Unlimited set of conditions that can be built with `this.where()`. Conditions are always joined with `AND`!
     * @returns {Object}
     */
    object(...conditions) {        
        conditions = conditions.filter(e => Array.isArray(e));
        if (!conditions.length) {
            return this.obj;
        }

        const result = {};
        for (let [key, entry] of Object.entries(this.obj)) {
            conditions.forEach(condition => {
                const comperator = _get(this.obj, `${key}.${condition[0]}`);
                const expected = condition[2];
                const fn = getCmpFn(condition[1]);
                if (fn(comperator, expected)) {
                    result[key] = entry;
                }
            })
        }
        return result;
    }

    /**
     * Retrieve all or some entries 
     * @param {Array} [...conditions] Unlimited set of conditions that can be built with `this.where()`. Conditions are always joined with `AND`!
     * @returns {Iterator}
     */
    entries(...conditions) {
        return Object.entries(this.object.apply(this, conditions));
    }

    /**
     * Retrieve all or some entries 
     * @param {Array} [...conditions] Unlimited set of conditions that can be built with `this.where()`. Conditions are always joined with `AND`!
     * @returns {Array}
     */
    values(...conditions) {
        return Object.values(this.object.apply(this, conditions));
    }

    /**
     * Get all or some keys
     * @param {Array} [...conditions] Unlimited set of conditions that can be built with `this.where()`. Conditions are always joined with `AND`!
     * @returns {Array}
     */
    keys(...conditions) {
        return Object.keys(this.object.apply(this, conditions));
    }

    /**
     * Remove one or multiple entries
     * @param {...String|Number} keys 
     */
    remove(...keys) {
        keys.forEach(key => {
            delete this.obj[key]
        })
        this.save();
    }

    /**
     * Resolve placeholders in the style {{path.to.whatever}} to their respective values
     */
    resolveVars() {
        // collection of all templates
        const matchData = _getTplMatchData(this);
        // flat version of the data object in dot notation
        for (let path of _keysToDotNotation(this.obj)) {
            const value = this.get(path);
            // if the template value is an object
            if(matchData[value] && _isPlainObject(matchData[value])){
                this.set(path, matchData[value]);
                continue;
            }
            // if the object value is null|undefined|bool
            if (!['string', 'number'].includes(typeof value) ||
                !(this.tplRe.test(value.toString()))) {
                continue;
            }
            this.set(path, value.replace(this.tplRe, (full, capture) => {
                if(typeof matchData[capture] === 'undefined') {
                    return capture;
                }
                // if a string is mixed with an object
                if(_isCollection(matchData[capture]) && value !== full){
                    console.error(`Incompatible types: '${path}' contains '${full}' which resolves to an object or array`)
                }
                return typeof matchData[capture] !== 'undefined' ? matchData[capture] : capture
            }))
        }
        return this;
    }

    /**
     * Convert this.obj to JSON
     * @param {Boolean} pretty 
     * @returns 
     */
    toJson(pretty = false) {
        return JSON.stringify(this.obj, null, (pretty ? '\t' : null));
    }

    constructor({
        data = {},
        lsKey = false
    } = {}) {
        this.obj = data;
        this.lsKey = lsKey;
        this.tplRe = /(?<full>{{(?<path>[^}]+)}})/g;
    }
}

export default Tree;