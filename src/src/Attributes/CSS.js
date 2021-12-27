import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/ext-language_tools';

import { IconButton, MenuItem, Select } from '@material-ui/core';

import SaveIcon from '@material-ui/icons/Save';
import I18n from '@iobroker/adapter-react/i18n';
import { useState } from 'react';

const CSS = () => {
    const [type, setType] = useState('global');

    return <div>
        <div>
            <Select value={type} onChange={e => setType(e.target.value)}>
                <MenuItem value="global">{I18n.t('Global')}</MenuItem>
                <MenuItem value="project">{I18n.t('Project')}</MenuItem>
            </Select>
            <IconButton>
                <SaveIcon />
            </IconButton>
        </div>
        <AceEditor
            mode="css"
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
