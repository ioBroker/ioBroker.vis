import PropTypes from 'prop-types';
import AceEditor from 'react-ace';

import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/theme-clouds_midnight';
import 'ace-builds/src-noconflict/theme-chrome';

import {MenuItem, Select, Dialog, DialogTitle, Button, DialogContent, DialogActions, IconButton} from '@material-ui/core';

import {HelpOutline, Check as CheckIcon} from '@material-ui/icons';

import I18n from '@iobroker/adapter-react/i18n';
import { useEffect, useState } from 'react';

const CSS = props => {
    const [type, setType] = useState('global');

    const [localCss, setLocalCss] = useState('');
    const [globalCss, setGlobalCss] = useState('');
    const [showHelp, setShowHelp] = useState(false);

    useEffect(async () => {
        setGlobalCss(await props.socket.readFile('vis', 'css/vis-common-user.css'));
        setLocalCss(await props.socket.readFile('vis.0', `${props.projectName}/vis-user.css`));
    }, []);

    useEffect(() => {
        const saveInterval = setInterval(() => {
            props.socket.writeFile64('vis', 'css/vis-common-user.css', globalCss);
            props.socket.writeFile64('vis.0', `${props.projectName}/vis-user.css`, localCss);
        }, 2000);

        return () => clearInterval(saveInterval);
    }, [globalCss, localCss]);

    return <div>
        <div>
            <Dialog
                open={!!showHelp}
                maxWidth={props.maxWidth || 'md'}
            >
                <DialogTitle>{I18n.t('Explanation')}</DialogTitle>
                <DialogContent>
                    {type === 'global' ? I18n.t('help_css_global') : I18n.t('help_css_project')}
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={() => setShowHelp(false)}
                        startIcon={<CheckIcon />}
                    >
                        {I18n.t('Ok')}
                    </Button>
                </DialogActions>
            </Dialog>
            <Select value={type} onChange={e => setType(e.target.value)}>
                <MenuItem value="global">{I18n.t('Global')}</MenuItem>
                <MenuItem value="project">{I18n.t('Project')}</MenuItem>
            </Select>
            <IconButton onClick={ () => setShowHelp(true) } size="small"><HelpOutline /></IconButton>
        </div>
        <AceEditor
            mode="css"
            theme={props.themeName === 'dark' ? 'clouds_midnight' : 'chrome'}
            value={type === 'global' ? globalCss : localCss}
            onChange={newValue => (type === 'global' ? setGlobalCss(newValue) : setLocalCss(newValue))}
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
};

export default CSS;
