import PropTypes from 'prop-types';
import AceEditor from 'react-ace';

import 'ace-builds/src-min-noconflict/mode-css';
import 'ace-builds/src-min-noconflict/worker-css';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import 'ace-builds/src-min-noconflict/theme-clouds_midnight';
import 'ace-builds/src-min-noconflict/theme-chrome';

import {
    MenuItem, Select, Dialog, DialogTitle, Button, DialogContent, DialogActions, IconButton, CircularProgress,
} from '@mui/material';

import { HelpOutline, Check as CheckIcon } from '@mui/icons-material';

import I18n from '@iobroker/adapter-react-v5/i18n';
import { useEffect, useState } from 'react';

// eslint-disable-next-line no-undef
ace.config.set('basePath', 'lib/js/ace');

const CSS = props => {
    const [type, setType] = useState('global');

    const [localCss, setLocalCss] = useState('');
    const [globalCss, setGlobalCss] = useState('');
    const [showHelp, setShowHelp] = useState(false);

    const [localCssTimer, setLocalCssTimer] = useState(null);
    const [globalCssTimer, setGlobalCssTimer] = useState(null);

    const timers = {
        global: {
            timer: globalCssTimer,
            setTimer: setGlobalCssTimer,
            value: globalCss,
            setValue: setGlobalCss,
            directory: props.adapterName,
            file: 'css/vis-common-user.css',
        },
        local: {
            timer: localCssTimer,
            setTimer: setLocalCssTimer,
            value: localCss,
            setValue: setLocalCss,
            directory: props.adapterId,
            file: `${props.projectName}/vis-user.css`,
        },
    };

    useEffect(() => {
        const load = async () => {
            try {
                const commonCss = await props.socket.readFile(props.adapterId.split('.')[0], 'css/vis-common-user.css');
                if (commonCss.type) {
                    setGlobalCss(commonCss.data);
                } else {
                    setGlobalCss(commonCss);
                }
            } catch (e) {
                if (e !== 'Not exists') {
                    console.warn(`Cannot loading global CSS: ${e}`);
                }
            }
            try {
                const userCss = await props.socket.readFile(props.adapterId, `${props.projectName}/vis-user.css`);
                if (userCss.type) {
                    setLocalCss(userCss.data);
                } else {
                    setLocalCss(userCss);
                }
            } catch (e) {
                if (e !== 'Not exists') {
                    console.warn(`Cannot load project CSS: ${e}`);
                }
            }
            if (window.localStorage.getItem('CSS.type')) {
                setType(window.localStorage.getItem('CSS.type'));
            }
        };

        load()
            .catch(e => console.error('Error loading CSS: ', e));
    }, []);

    const save = (value, saveType) => {
        timers[saveType].setValue(value);
        clearTimeout(timers[saveType].timer);
        timers[saveType].setTimer(setTimeout(() => {
            timers[saveType].setTimer(null);
            // inform views about changed CSS
            props.saveCssFile(timers[saveType].directory, timers[saveType].file, value);
        }, 1000));
    };

    let value = type === 'global' ? globalCss : localCss;
    if (typeof value === 'object') {
        value = value.data;
    }

    return <div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {showHelp ? <Dialog
                open={!0}
                maxWidth={props.maxWidth || 'md'}
            >
                <DialogTitle>{I18n.t('Explanation')}</DialogTitle>
                <DialogContent>
                    {type === 'global' ? I18n.t('help_css_global') : I18n.t('help_css_project')}
                </DialogContent>
                <DialogActions>
                    <Button
                        color="grey"
                        variant="contained"
                        onClick={() => setShowHelp(false)}
                        startIcon={<CheckIcon />}
                    >
                        {I18n.t('Ok')}
                    </Button>
                </DialogActions>
            </Dialog> : null}
            <Select
                variant="standard"
                value={type}
                onChange={e => {
                    setType(e.target.value);
                    window.localStorage.setItem('CSS.type', e.target.value);
                }}
            >
                <MenuItem value="global">{I18n.t('Global')}</MenuItem>
                <MenuItem value="local">{I18n.t('css_project')}</MenuItem>
            </Select>
            <IconButton onClick={() => setShowHelp(true)} size="small"><HelpOutline /></IconButton>
            {globalCssTimer || localCssTimer ? <CircularProgress size={20} /> : null}
        </div>
        <AceEditor
            mode="css"
            theme={props.themeName === 'dark' ? 'clouds_midnight' : 'chrome'}
            readOnly={!props.editMode}
            value={value}
            onChange={newValue => save(newValue, type)}
            width="100%"
            setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
            }}
        />
    </div>;
};

CSS.propTypes = {
    projectName: PropTypes.string,
    socket: PropTypes.object,
    themeName: PropTypes.string,
    saveCssFile: PropTypes.func.isRequired,
    adapterId: PropTypes.string.isRequired,
    adapterName: PropTypes.string.isRequired,
};

export default CSS;
