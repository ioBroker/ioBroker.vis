import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import Ace from 'ace-builds';

import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/theme-clouds_midnight';
import 'ace-builds/src-noconflict/theme-chrome';

import 'ace-builds/src-noconflict/worker-css';
import 'ace-builds/src-noconflict/snippets/css';
import 'ace-builds/src-noconflict/mode-css';

import 'ace-builds/src-noconflict/worker-json';
import 'ace-builds/src-noconflict/snippets/json';
import 'ace-builds/src-noconflict/mode-json';

import 'ace-builds/src-noconflict/worker-javascript';
import 'ace-builds/src-noconflict/snippets/javascript';
import 'ace-builds/src-noconflict/mode-javascript';

import 'ace-builds/src-noconflict/worker-html';
import 'ace-builds/src-noconflict/snippets/html';
import 'ace-builds/src-noconflict/mode-html';

import { I18n } from '@iobroker/adapter-react-v5';

Ace.config.set('basePath', './lib/js/ace');
Ace.config.setModuleUrl('ace/ext/language_tools', './lib/js/ace/ext-language_tools.js');
Ace.config.setModuleUrl('ace/theme/clouds_midnight', './lib/js/ace/theme-clouds_midnight.js');
Ace.config.setModuleUrl('ace/theme/chrome', './lib/js/ace/theme-chrome.js');
Ace.config.setModuleUrl('ace/ext/searchbox', './lib/js/ace/ext-searchbox.js');

Ace.config.setModuleUrl('ace/snippets/html', './lib/js/ace/snippets/html.js');
Ace.config.setModuleUrl('ace/mode/html_worker', './lib/js/ace/worker-html.js');
Ace.config.setModuleUrl('ace/mode/html', './lib/js/ace/mode-html.js');

Ace.config.setModuleUrl('ace/snippets/css', './lib/js/ace/snippets/css.js');
Ace.config.setModuleUrl('ace/mode/css_worker', './lib/js/ace/worker-css.js');
Ace.config.setModuleUrl('ace/mode/css', './lib/js/ace/mode-css.js');

Ace.config.setModuleUrl('ace/snippets/javascript', './lib/js/ace/snippets/javascript.js');
Ace.config.setModuleUrl('ace/mode/javascript_worker', './lib/js/ace/worker-javascript.js');
Ace.config.setModuleUrl('ace/mode/javascript', './lib/js/ace/mode-javascript.js');

Ace.config.setModuleUrl('ace/snippets/html', './lib/js/ace/snippets/html.js');
Ace.config.setModuleUrl('ace/mode/html_worker', './lib/js/ace/worker-html.js');
Ace.config.setModuleUrl('ace/mode/html', './lib/js/ace/mode-html.js');

const CustomAceEditor = props => {
    const refEditor = useRef();

    useEffect(() => {
        let content;
        let timer;
        const keyDown = e => {
            if (e.key === 'f' && e.ctrlKey) {
                // make translations
                timer = setInterval(() => {
                    const parent = content.parentNode;
                    let el = parent.querySelector('.ace_search_field');
                    if (el) {
                        clearInterval(timer);
                        timer = null;
                    }
                    if (el?.placeholder === 'Search for') {
                        el.placeholder = I18n.t('ace_Search for');
                    }
                    el = parent.querySelector('.ace_searchbtn[action="findAll"]');
                    if (el?.innerHTML === 'All') {
                        el.innerHTML = I18n.t('ace_All');
                    }
                    el = parent.querySelector('.ace_button[action="toggleRegexpMode"]');
                    if (el?.title === 'RegExp Search') {
                        el.title = I18n.t('ace_RegExp Search');
                    }
                    el = parent.querySelector('.ace_button[action="toggleCaseSensitive"]');
                    if (el?.title === 'CaseSensitive Search') {
                        el.title = I18n.t('ace_CaseSensitive Search');
                    }
                    el = parent.querySelector('.ace_button[action="toggleWholeWords"]');
                    if (el?.title === 'Whole Word Search') {
                        el.title = I18n.t('ace_Whole Word Search');
                    }
                    el = parent.querySelector('.ace_button[action="searchInSelection"]');
                    if (el?.title === 'Search In Selection') {
                        el.title = I18n.t('ace_Search In Selection');
                    }
                    el = parent.querySelector('.ace_button[action="toggleReplace"]');
                    if (el?.title === 'Toggle Replace mode') {
                        el.title = I18n.t('ace_Toggle Replace mode');
                    }

                    content?.removeEventListener('keydown', keyDown);
                    content = null;
                }, 100);
            }
        };

        if (I18n.getLanguage() !== 'en') {
            setTimeout(() => {
                content = window.document.querySelector('.ace_text-input');
                content?.addEventListener('keydown', keyDown);
            }, 200);
        }

        return () => {
            timer && clearTimeout(timer);
            timer = null;
            content?.removeEventListener('keydown', keyDown);
            content = null;
        };
    }, []);

    return <div
        style={{
            width: props.width || '100%',
            height: props.height || '100%',
            border: props.error ? '1px solid #800' : '1px solid transparent',
        }}
        ref={refEditor}
    >
        <AceEditor
            mode={props.type === 'text' ? 'html' : props.type}
            theme={props.themeType === 'dark' ? 'clouds_midnight' : 'chrome'}
            width="100%"
            height="100%"
            value={props.value}
            onChange={newValue => props.onChange(newValue)}
            readOnly={props.readOnly || false}
            focus={props.focus}
            ref={props.refEditor}
            highlightActiveLine
            enableBasicAutocompletion
            enableLiveAutocompletion
            enableSnippets
        />
    </div>;
};

CustomAceEditor.propTypes = {
    onChange: PropTypes.func,
    themeType: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.string,
    readOnly: PropTypes.bool,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    refEditor: PropTypes.func,
    error: PropTypes.bool,
};

export default CustomAceEditor;
