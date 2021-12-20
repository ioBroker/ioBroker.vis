import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/ext-language_tools';

import { IconButton } from '@material-ui/core';

import SaveIcon from '@material-ui/icons/Save';

const Scripts = props => <div>
    <IconButton>
        <SaveIcon />
    </IconButton>
    <AceEditor
        mode="javascript"
        width="100%"
        setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
        }}
    />
</div>;

export default Scripts;
