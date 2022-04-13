/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import config from '../../config/segments/frontend.json' assert { type: 'json' };
import Tree from '../../modules/tree/Tree.js';

const confStore = new Tree({
    data: config
})

export default confStore;