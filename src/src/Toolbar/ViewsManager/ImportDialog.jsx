import PropTypes from 'prop-types';

import { useEffect, useRef, useState } from 'react';

import { TextField } from '@mui/material';

import I18n from '@iobroker/adapter-react-v5/i18n';

import IODialog from '../../Components/IODialog';
import CustomAceEditor from '../../Components/CustomAceEditor';
import { useFocus } from '../../Utils';
import { store } from '../../Store';

const ImportDialog = props => {
    const [data, setData] = useState('');
    const [view, setView] = useState('');
    const [errors, setErrors] = useState([]);

    const inputField = useFocus(props.open, true, true);

    useEffect(() => {
        setErrors([]);
        setView(props.view);
        setData(
            store.getState().visProject[props.view]
                ? JSON.stringify(store.getState().visProject[props.view], null, 2)
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
        <CustomAceEditor
            type="json"
            theme={props.themeType}
            refEditor={node => {
                editor.current = node;
                inputField.current = node;
            }}
            value={data}
            onChange={newValue => setData(newValue)}
            height={200}
        />
        <div>
            <TextField variant="standard" fullWidth label={I18n.t('View name')} value={view} onChange={e => setView(e.target.value)} />
        </div>
    </IODialog>;
};

ImportDialog.propTypes = {
    importViewAction: PropTypes.func,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    project: PropTypes.object,
    view: PropTypes.string,
};
export default ImportDialog;
