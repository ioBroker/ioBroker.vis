import PropTypes from 'prop-types';
import AceEditor from 'react-ace';

import 'ace-builds/webpack-resolver';
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
        widgets.forEach(widget => {
            const newKey = `w${newKeyNumber.toString().padStart(6, 0)}`;
            project[props.selectedView].widgets[newKey] = widget;
            newKeyNumber++;
        });
        props.changeProject(project);
    };

    return <IODialog
        open={props.open}
        onClose={props.onClose}
        title="Import widgets"
        closeTitle="Close"
        actionTitle="Import"
        action={() => importWidgets()}
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
