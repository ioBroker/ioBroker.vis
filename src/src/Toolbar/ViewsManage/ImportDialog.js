import PropTypes from 'prop-types';
import I18n from '@iobroker/adapter-react-v5/i18n';
import AceEditor from 'react-ace';

import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/theme-clouds_midnight';
import 'ace-builds/src-noconflict/theme-chrome';

import { useEffect, useRef, useState } from 'react';
import { TextField } from '@mui/material';
import IODialog from '../../Components/IODialog';
import { useFocus } from '../../Utils';

const ImportDialog = props => {
    const [data, setData] = useState('');
    const [view, setView] = useState('');
    const [errors, setErrors] = useState([]);

    const inputField = useFocus(props.open, true, true);

    useEffect(() => {
        setErrors([]);
        setView(props.view);
        setData(
            props.project[props.view]
                ? JSON.stringify(props.project[props.view], null, 2)
                : `{
  "settings": {
    "style": {}
  },
  "widgets": {},
  "activeWidgets": {}
}`,
        );
    }, [props.open]);

    const editor = useRef(null);

    useEffect(() => {
        if (editor.current) {
            editor.current.editor.getSession().on('changeAnnotation', () => {
                if (editor.current) {
                    setErrors(editor.current.editor.getSession().getAnnotations());
                }
            });
        }
    }, [editor.current]);
    return <IODialog
        open={props.open}
        onClose={props.onClose}
        title="Import view"
        closeTitle="Close"
        actionTitle="Import"
        action={() => props.importViewAction(view, data)}
        actionDisabled={!view.length || !!errors.length}
    >
        <div>
            <AceEditor
                mode="json"
                theme={props.themeName === 'dark' ? 'clouds_midnight' : 'chrome'}
                ref={node => {
                    editor.current = node;
                    inputField.current = node;
                }}
                value={data}
                onChange={newValue => {
                    setData(newValue);
                }}
                height="200px"
            />
        </div>
        <div>
            <TextField variant="standard" label={I18n.t('View name')} value={view} onChange={e => setView(e.target.value)} />
        </div>
    </IODialog>;
};

ImportDialog.propTypes = {
    importViewAction: PropTypes.func,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    project: PropTypes.object,
    themeName: PropTypes.string,
    view: PropTypes.string,
};
export default ImportDialog;
