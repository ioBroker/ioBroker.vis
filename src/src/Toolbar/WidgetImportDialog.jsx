import PropTypes from 'prop-types';
import { useRef, useState } from 'react';

import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@mui/material';

import { Close as CloseIcon, ImportExport } from '@mui/icons-material';

import { I18n } from '@iobroker/adapter-react-v5';

import { useFocus } from '../Utils';
import CustomAceEditor from '../Components/CustomAceEditor';
import { store } from '../Store';

const WidgetImportDialog = props => {
    const [data, setData] = useState('');
    const [error, setError] = useState(false);

    const inputField = useFocus(true, true, true);

    const editor = useRef(null);

    const importWidgets = () => {
        const project = JSON.parse(JSON.stringify(store.getState().visProject));
        const widgets = JSON.parse(data);
        let newKeyNumber = props.getNewWidgetIdNumber();
        let newGroupKeyNumber = props.getNewWidgetIdNumber(true);
        const newWidgets = {};

        widgets.forEach(widget => {
            if (widget.tpl === '_tplGroup') {
                const newKey = `g${newGroupKeyNumber.toString().padStart(6, '0')}`;
                newWidgets[newKey] = widget;
                // find all widgets that belong to this group and change groupid
                let w;
                do {
                    w = widgets.find(item => item.groupid === widget._id);
                    if (w) {
                        w.groupid = newKey;
                    }
                } while (w);

                newGroupKeyNumber++;
            } else {
                const newKey = `w${newKeyNumber.toString().padStart(6, '0')}`;
                newWidgets[newKey] = widget;
                if (widget.grouped && newWidgets[widget.groupid] && newWidgets[widget.groupid].data && newWidgets[widget.groupid].data.members) {
                    // find group
                    const pos = newWidgets[widget.groupid].data.members.indexOf(widget._id);
                    if (pos !== -1) {
                        newWidgets[widget.groupid].data.members[pos] = newKey;
                    }
                }
                newKeyNumber++;
            }
        });

        Object.keys(newWidgets).forEach(wid => delete newWidgets[wid]._id);

        project[props.selectedView].widgets = { ...project[props.selectedView].widgets, ...newWidgets };

        props.changeProject(project);
    };

    return <Dialog
        onClose={props.onClose}
        fullWidth
        open={!0}
        maxWidth="lg"
    >
        <DialogTitle>{I18n.t('Import widgets')}</DialogTitle>
        <DialogContent
            onKeyUp={e => {
                if (props.action) {
                    if (!props.actionDisabled && !props.keyboardDisabled) {
                        if (e.keyCode === 13) {
                            props.action();
                            if (!props.actionNoClose) {
                                props.onClose();
                            }
                        }
                    }
                }
            }}
        >
            <CustomAceEditor
                type="json"
                error={error}
                themeType={props.themeType}
                refEditor={node => {
                    editor.current = node;
                    inputField.current = node;
                }}
                value={data}
                onChange={newValue => {
                    try {
                        newValue && JSON.parse(newValue);
                        setError(false);
                    } catch (e) {
                        setError(true);
                    }
                    setData(newValue);
                }}
                height={300}
            />
        </DialogContent>
        <DialogActions>
            <Button
                variant="contained"
                onClick={() => {
                    importWidgets();
                    props.onClose();
                }}
                color="primary"
                disabled={!data || error}
                startIcon={<ImportExport />}
            >
                {I18n.t('Import')}
            </Button>
            <Button
                variant="contained"
                color="grey"
                onClick={props.onClose}
                startIcon={<CloseIcon />}
            >
                {I18n.t('Close')}
            </Button>
        </DialogActions>
    </Dialog>;
};

WidgetImportDialog.propTypes = {
    changeProject: PropTypes.func,
    onClose: PropTypes.func,
    themeType: PropTypes.string,
    selectedView: PropTypes.string,
};
export default WidgetImportDialog;
