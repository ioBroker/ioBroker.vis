import React, { useEffect, useRef, useState } from 'react';

import { TextField } from '@mui/material';

import { I18n, type ThemeType } from '@iobroker/adapter-react-v5';

import IODialog from '../../Components/IODialog';
import CustomEditor from '../../Components/CustomEditor';
import { useFocus } from '../../Utils';
import { store } from '../../Store';

interface ImportDialogProps {
    importViewAction: (view: string, data: string) => void;
    onClose: () => void;
    view: string;
    themeType: ThemeType;
}

const ImportDialog: React.FC<ImportDialogProps> = props => {
    const visProject = store.getState().visProject;

    const [data, setData] = useState(
        visProject[props.view]
            ? JSON.stringify(visProject[props.view], null, 2)
            : `{
  "settings": {
    "style": {}
  },
  "widgets": {},
  "activeWidgets": {}
}`,
    );
    const [view, setView] = useState(props.view);
    const [errors, setErrors] = useState([]);

    const inputField = useFocus(true, true, true);

    const editor = useRef(null);

    useEffect(() => {
        editor.current?.editor.getSession().on('changeAnnotation', () => {
            if (editor.current) {
                setErrors(editor.current.editor.getSession().getAnnotations());
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor.current]);

    return (
        <IODialog
            onClose={props.onClose}
            title="Import view"
            closeTitle="Close"
            actionTitle="Import"
            action={() => props.importViewAction(view, data)}
            actionDisabled={!view.length || !!errors.length}
        >
            <CustomEditor
                type="json"
                themeType={props.themeType}
                refEditor={node => {
                    editor.current = node;
                    inputField.current = node;
                }}
                value={data}
                onChange={newValue => setData(newValue)}
                height={200}
            />
            <div>
                <TextField
                    variant="standard"
                    fullWidth
                    label={I18n.t('View name')}
                    value={view}
                    onChange={e => setView(e.target.value)}
                />
            </div>
        </IODialog>
    );
};

export default ImportDialog;
