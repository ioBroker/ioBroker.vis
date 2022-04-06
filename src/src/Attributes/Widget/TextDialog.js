import PropTypes from 'prop-types';
import AceEditor from 'react-ace';

import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/theme-clouds_midnight';
import 'ace-builds/src-noconflict/theme-chrome';
import { useEffect, useState } from 'react';
import IODialog from '../../Components/IODialog';

const TextDialog = props => {
    const [value, changeValue] = useState('');
    useEffect(() => {
        changeValue(props.value);
    }, [props.open]);

    return <IODialog
        keyboardDisabled
        title="Text edit"
        open={props.open}
        actionTitle="Save"
        action={() => props.onChange(value)}
        onClose={props.onClose}
    >
        <div style={{ width: 800 }}>
            <AceEditor
                mode={props.type}
                theme={props.themeName === 'dark' ? 'clouds_midnight' : 'chrome'}
                width="100%"
                value={value}
                onChange={newValue => {
                    changeValue(newValue);
                }}
                setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true,
                }}
            />
        </div>
    </IODialog>;
};

TextDialog.propTypes = {
    onChange: PropTypes.func,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    themeName: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.string,
};

export default TextDialog;
