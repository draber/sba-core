/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */

import Tree from '../../modules/tree/Tree.js';
import confStore from './settings.js';

const lsKey = confStore.get('ns') + '-prefs';

const prefStore = new Tree({
    data: JSON.parse(localStorage.getItem(lsKey) || '{}'),
    lsKey
})

export default prefStore;