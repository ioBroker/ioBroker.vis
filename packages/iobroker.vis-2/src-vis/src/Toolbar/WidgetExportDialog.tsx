import { FileCopy as FileCopyIcon } from '@mui/icons-material';

import { Utils, I18n, type ThemeType } from '@iobroker/adapter-react-v5';

import type { AnyWidgetId, GroupWidgetId, Widget } from '@iobroker/types-vis-2';
import React from 'react';
import IODialog from '../Components/IODialog';
import CustomAceEditor from '../Components/CustomAceEditor';
import { deepClone } from '../Utils/utils';

interface WidgetExportDialogProps {
    onClose: () => void;
    themeType: ThemeType;
    widgets: Record<string, Widget>;
    selectedWidgets: string[];
}

const WidgetExportDialog: React.FC<WidgetExportDialogProps> = props => {
    const widgets = props.selectedWidgets.map(wid => {
        const w = deepClone(props.widgets[wid]);
        w._id = wid;
        return w;
    });

    const groupWidgets: AnyWidgetId[] = [];

    let gIdx = 1;
    let wIdx = 1;
    const len = widgets.length;
    for (let w = 0; w < len; w++) {
        const widget = widgets[w];
        if (widget.tpl === '_tplGroup') {
            const newId = `f${gIdx.toString().padStart(6, '0')}`;
            gIdx++;

            if (widget.data?.members) {
                const members: string[] = [];
                for (let m = 0; m < widget.data.members.length; m++) {
                    const member = widget.data.members[m];
                    if (groupWidgets.includes(member)) {
                        continue;
                    }
                    const memberWidget = deepClone(props.widgets[member]);
                    memberWidget._id = `i${wIdx.toString().padStart(6, '0')}`;
                    wIdx++;
                    members.push(memberWidget._id);
                    memberWidget.groupid = newId as GroupWidgetId;
                    memberWidget.grouped = true;
                    widgets.push(memberWidget);
                    groupWidgets.push(member);
                }

                widget.data.members = members as AnyWidgetId[];
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

    return (
        <IODialog
            onClose={props.onClose}
            title="Export widgets"
            closeTitle="Close"
            action={() => {
                Utils.copyToClipboard(JSON.stringify(widgets, null, 2));
                props.onClose();
                window.alert(I18n.t('Copied to clipboard'));
            }}
            actionTitle="Copy to clipboard"
            actionNoClose
            ActionIcon={FileCopyIcon}
        >
            <CustomAceEditor
                type="json"
                themeType={props.themeType}
                value={JSON.stringify(widgets, null, 2)}
                height={200}
            />
        </IODialog>
    );
};

export default WidgetExportDialog;
