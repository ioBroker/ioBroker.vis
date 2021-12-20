import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/ext-language_tools';

import { IconButton } from '@material-ui/core';

import SaveIcon from '@material-ui/icons/Save';

const CSS = props => <div>
    <IconButton>
        <SaveIcon />
    </IconButton>
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

export default CSS;
