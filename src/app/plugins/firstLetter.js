/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import dataStore from '../modules/data.js';
import TablePane from './tablePane.js';
import fn from 'fancy-node';

/**
 * FirstLetter plugin
 *
 * @param {App} app
 * @returns {Plugin} FirstLetter
 */
class FirstLetter extends TablePane {

    /**
     * Get the data for the table cells
     * @returns {Array}
     */
    getData() {
        const letters = {};
        const answers = dataStore.get('answers').sort((a, b) => {
            if (a.startsWith(this.centerLetter)) {
                return -1;
            }
            if (b.startsWith(this.centerLetter)) {
                return 1;
            }
            return a < b ? -1 : 1;
        });
        const remainders = dataStore.get('remainders');
        const tpl = {
            foundTerms: 0,
            remainders: 0,
            total: 0
        }
        answers.forEach(term => {
            const letter = term.charAt(0);
            if (typeof letters[letter] === 'undefined') {
                letters[letter] = {
                    ...tpl
                };
            }
            if (remainders.includes(term)) {
                letters[letter].remainders++;
            } else {
                letters[letter].foundTerms++;
            }
            letters[letter].total++;
        })

        const cellData = [
            ['', '✓', '?', '∑']
        ];
        for (let [letter, values] of Object.entries(letters)) {
            values = Object.values(values);
            values.unshift(letter);
            cellData.push(values);
        }
        return cellData;
    }


    /**
     * FirstLetter constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'First letter', 'The number of words by first letter', {
            cssMarkers: {
                completed: (rowData, i) => rowData[2] === 0,
                preeminent: (rowData, i) => rowData[0] === dataStore.get('centerLetter')
            }
        });

        this.ui = fn.details({
            content: [
                fn.summary({
                    content: this.title
                }),
                this.getPane()
            ]
        });

        this.toggle(this.getState());
    }
}

export default FirstLetter;