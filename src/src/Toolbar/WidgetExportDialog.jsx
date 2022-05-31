import PropTypes from 'prop-types';
import I18n from '@iobroker/adapter-react-v5/i18n';
import copy from 'copy-to-clipboard';
import AceEditor from 'react-ace';

import FileCopyIcon from '@mui/icons-material/FileCopy';

import IODialog from '../Components/IODialog';

import ace from 'ace-builds/src-noconflict/ace';
import jsonWorkerUrl from 'ace-builds/src-noconflict/worker-json?url';

ace.config.setModuleUrl('ace/mode/json_worker', jsonWorkerUrl);
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/theme-clouds_midnight';
import 'ace-builds/src-noconflict/theme-chrome';

const WidgetExportDialog = props => {
    const widgets = props.selectedWidgets.map(wid => {
        const w = JSON.parse(JSON.stringify(props.widgets[wid]));
        w._id = wid;
        return w;
    });

    const groupWidgets = [];

    let gIdx = 1;
    let wIdx = 1;
    const len = widgets.length;
    for (let w = 0; w < len; w++) {
        const widget = widgets[w];
        if (widget.tpl === '_tplGroup') {
            const newId = `f${gIdx.toString().padStart(6, '0')}`;
            gIdx++;

            if (widget.data && widget.data.members) {
                const members = [];
                widget.data.members.forEach(member => {
                    if (groupWidgets.includes(member)) {
                        return;
                    }
                    const memberWidget = JSON.parse(JSON.stringify(props.widgets[member]));
                    memberWidget._id = `i${wIdx.toString().padStart(6, '0')}`;
                    wIdx++;
                    members.push(memberWidget._id);
                    memberWidget.groupid = newId;
                    memberWidget.grouped = true;
                    widgets.push(memberWidget);
                    groupWidgets.push(member);
                });

                widget.data.members = members;
            }
            widget._id = newId;
        } else if (widget._id.startsWith('w')) {
            if (widget.grouped) {
                delete widget.grouped;
                delete widget.groupid;
                delete widget._id;
            } else {
                widget._id = `i${wIdx.toString().padStart(6, '0')}`;
                wIdx++;
            }
        }
    }

    return <IODialog
        open={props.open}
        onClose={props.onClose}
        title="Export widgets"
        closeTitle="Close"
        action={() => {
            copy(JSON.stringify(widgets, null, 2));
            props.onClose();
            window.alert(I18n.t('Copied to clipboard'));
        }}
        actionTitle="Copy to clipboard"
        actionNoClose
        ActionIcon={FileCopyIcon}
    >
        <AceEditor
            mode="json"
            theme={props.themeName === 'dark' ? 'clouds_midnight' : 'chrome'}
            value={JSON.stringify(widgets, null, 2)}
            height="200px"
        />
    </IODialog>;
};

WidgetExportDialog.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    themeName: PropTypes.string,
    widgets: PropTypes.objects,
    selectedWidgets: PropTypes.object,
};

export default WidgetExportDialog;
