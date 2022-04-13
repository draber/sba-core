/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import {
    prefix
} from './string.js';
import Tree from '../../modules/tree/Tree.js';

class DataTree extends Tree {

    update(foundTerms) {
        if (!this.app) {
            console.error(`dataStore.app is not defined`);
            return false
        }
        this.set('foundTerms', this.get('foundTerms').concat(foundTerms));
        this.set('foundPangrams', this.get('foundTerms').filter(term => this.get('pangrams').includes(term)));
        this.set('remainders', this.get('answers').filter(term => !this.get('foundTerms').includes(term)));
        this.app.trigger(prefix('refreshUi'));
        return this;
    }

    getPoints(type) {
        const data = this.get(type);
        let points = 0;
        data.forEach(term => {
            if (this.get('pangrams').includes(term)) {
                points += term.length + 7;
            } else if (term.length > 4) {
                points += term.length;
            } else {
                points += 1;
            }
        });
        return points;
    }

    getCount(type) {
        return this.get(type).length;
    }

    setApp(app) {
        this.app = app;
        this.app.on(prefix('newWord'), evt => {
            dataStore.update([evt.detail]);
        });
        return this;
    }

    constructor({
        data = {}
    } = {}) {
        super({
            data
        });
    }

}

const dataStore = new DataTree({
    data: {
        ...window.gameData.today,
        ...{
            foundTerms: [],
            foundPangrams: [],
            remainders: []
        }
    }
});


export default dataStore;