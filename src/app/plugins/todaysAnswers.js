/**
 *  Spelling Bee Assistant is an add-on for Spelling Bee, the New York Times’ popular word puzzle
 *
 *  Copyright (C) 2020  Dieter Raber
 *  https://www.gnu.org/licenses/gpl-3.0.en.html
 */
import dataStore from '../modules/data.js';
import {
    prefix
} from '../modules/string.js';
import Plugin from '../modules/plugin.js';
import Popup from './popup.js';
import fn from 'fancy-node';

/**
 * TodaysAnswers plugin
 *
 * @param {App} app
 * @returns {Plugin} TodaysAnswers
 */
class TodaysAnswers extends Plugin {

    /**
     * Display pop-up
     * @param {Event} evt
     * @returns {TodaysAnswers}
     */
    display() {
        const foundTerms = dataStore.get('foundTerms');
        const pangrams = dataStore.get('pangrams');

        const pane = fn.ul({
            classNames: ['sb-modal-wordlist-items']
        })

        dataStore.get('answers').forEach(term => {
            pane.append(fn.li({
                classNames: pangrams.includes(term) ? [prefix('pangram', 'd')] : [],
                content: [
                    fn.span({
                        classNames: foundTerms.includes(term) ? ['check', 'checked'] : ['check']
                    }), fn.span({
                        classNames: ['sb-anagram'],
                        content: term
                    })
                ]
            }));
        });

        this.popup
            .setContent('body', [
                fn.div({
                    content: dataStore.get('validLetters').join(''),
                    classNames: ['sb-modal-letters']
                }),
                pane
            ])
            .toggle(true);

        return this;
    }

    /**
     * TodaysAnswers constructor
     * @param {App} app
     */
    constructor(app) {

        super(app, 'Today’s Answers', 'Reveals the solution of the game', {
            canChangeState: true,
            defaultState: false,
            key: 'todaysAnswers'
        });

        this.marker = prefix('resolved', 'd');
        this.popup = new Popup(this.app, this.key)
            .setContent('title', this.title)
            .setContent('subtitle', dataStore.get('displayDate'));

        this.menuAction = 'popup';
        this.menuIcon = 'warning';
    }
}

export default TodaysAnswers;