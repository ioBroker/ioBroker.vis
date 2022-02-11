import AceEditor from 'react-ace';

import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/ext-language_tools';

import { MenuItem, Select } from '@material-ui/core';

import I18n from '@iobroker/adapter-react/i18n';
import { useEffect, useState } from 'react';

const CSS = props => {
    const [type, setType] = useState('global');

    const [localCss, setLocalCss] = useState('');
    const [globalCss, setGlobalCss] = useState('');

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
            <Select value={type} onChange={e => setType(e.target.value)}>
                <MenuItem value="global">{I18n.t('Global')}</MenuItem>
                <MenuItem value="project">{I18n.t('Project')}</MenuItem>
            </Select>
        </div>
        <AceEditor
            mode="css"
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

export default CSS;
