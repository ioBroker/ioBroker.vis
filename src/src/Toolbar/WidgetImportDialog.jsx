import PropTypes from 'prop-types';
import AceEditor from 'react-ace';

import ace from 'ace-builds/src-noconflict/ace';
import jsonWorkerUrl from 'ace-builds/src-noconflict/worker-json?url';

ace.config.setModuleUrl('ace/mode/json_worker', jsonWorkerUrl);
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/theme-clouds_midnight';
import 'ace-builds/src-noconflict/theme-chrome';

import { useEffect, useRef, useState } from 'react';
import IODialog from '../Components/IODialog';
import { useFocus } from '../Utils';

const WidgetImportDialog = props => {
    const [data, setData] = useState('');
    const [errors, setErrors] = useState([]);

    const inputField = useFocus(props.open, true, true);

    useEffect(() => {
        setErrors([]);
        setData('[]');
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

    const importWidgets = () => {
        const project = JSON.parse(JSON.stringify(props.project));
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

    return <IODialog
        open={props.open}
        onClose={props.onClose}
        title="Import widgets"
        closeTitle="Close"
        actionTitle="Import"
        action={() => {
            importWidgets();
            props.onClose();
        }}
        actionDisabled={!!errors.length}
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
    </IODialog>;
};

WidgetImportDialog.propTypes = {
    changeProject: PropTypes.func,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    project: PropTypes.object,
    themeName: PropTypes.string,
    selectedView: PropTypes.string,
};
export default WidgetImportDialog;
