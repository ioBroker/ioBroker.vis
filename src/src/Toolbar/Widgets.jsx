import PropTypes from 'prop-types';
import { useState } from 'react';

import {
    MdAlignHorizontalCenter, MdAlignHorizontalLeft, MdAlignHorizontalRight, MdAlignVerticalBottom, MdAlignVerticalCenter, MdAlignVerticalTop,
} from 'react-icons/md';
import { CgArrowAlignH, CgArrowAlignV } from 'react-icons/cg';
import { AiOutlineColumnWidth, AiOutlineColumnHeight } from 'react-icons/ai';
import {
    BiImport, BiExport, BiCut, BiCopy, BiPaste,
} from 'react-icons/bi';
import {
    RiBringToFront, RiSendToBack,
} from 'react-icons/ri';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { I18n } from '@iobroker/adapter-react-v5';

import ToolbarItems from './ToolbarItems';
import { getWidgetTypes } from '../Utils';
import WidgetImportDialog from './WidgetImportDialog';
import WidgetExportDialog from './WidgetExportDialog';

const Widgets = props => {
    const [exportDialog, setExportDialog] = useState(false);
    const [importDialog, setImportDialog] = useState(false);

    if (!props.widgetsLoaded) {
        return null;
    }
    if (!props.openedViews.length) {
        return null;
    }
    if (!props.project[props.selectedView]) {
        return null;
    }

    const widgets = props.project[props.selectedView].widgets;

    const widgetTypes = getWidgetTypes();

    const toolbar = {
        name: 'Widgets',
        items: [
            {
                type: 'multiselect',
                name: 'Active widget(s)',
                items: Object.keys(widgets).filter(widget => (props.selectedGroup ?
                    widgets[widget].groupid === props.selectedGroup || widget === props.selectedGroup :
                    !widgets[widget].groupid)).map(widget => {
                    const tpl = widgets[widget].tpl;
                    const widgetType = widgetTypes.find(w => w.name === tpl);
                    let widgetLabel = widgetType?.title;
                    let widgetColor = widgetType?.setColor;
                    if (widgetType?.label) {
                        widgetLabel = I18n.t(widgetType.label);
                    }
                    let setLabel = widgetType?.set;
                    if (widgetType?.setLabel) {
                        setLabel = I18n.t(widgetType.setLabel);
                    } else if (setLabel) {
                        const widgetWithSetLabel = widgetTypes.find(w => w.set === setLabel && w.setLabel);
                        if (widgetWithSetLabel) {
                            widgetColor = widgetWithSetLabel.setColor;
                            setLabel = I18n.t(widgetWithSetLabel.setLabel);
                        }
                    }

                    let widgetIcon = widgetType?.preview || '';
                    if (widgetIcon.startsWith('<img')) {
                        const prev = widgetIcon.match(/src="([^"]+)"/);
                        if (prev && prev[1]) {
                            widgetIcon = prev[1];
                        }
                    }

                    return {
                        name: widget,
                        subName: widgetType ? `(${setLabel} - ${tpl === '_tplGroup' ? I18n.t('group') : widgetLabel})` : '',
                        value: widget,
                        color: widgetColor,
                        icon: widgetIcon.startsWith('<') ? '' : widgetIcon,
                    };
                }),
                width: 240,
                value: props.selectedWidgets,
                onChange: value => props.setSelectedWidgets(value),
            },
            [[
                {
                    type: 'icon-button',
                    Icon: DeleteIcon,
                    name: 'Delete widgets',
                    disabled: !props.selectedWidgets.length || (props.selectedGroup && props.selectedWidgets.includes(props.selectedGroup)),
                    onClick: () => props.deleteWidgets(),
                },
            ], [
                {
                    type: 'icon-button',
                    Icon: FileCopyIcon,
                    name: 'Clone widget',
                    disabled: !props.selectedWidgets.length || (props.selectedGroup && props.selectedWidgets.includes(props.selectedGroup)),
                    onClick: () => props.cloneWidgets(),
                },
            ]],
            { type: 'divider' },
            [[
                {
                    type: 'icon-button',
                    Icon: BiCut,
                    name: 'Cut',
                    size: 'normal',
                    disabled: !props.selectedWidgets.length || (props.selectedGroup && props.selectedWidgets.includes(props.selectedGroup)),
                    onClick: () => props.cutWidgets(),
                },
                {
                    type: 'icon-button',
                    Icon: BiCopy,
                    name: 'Copy',
                    size: 'normal',
                    disabled: !props.selectedWidgets.length || (props.selectedGroup && props.selectedWidgets.includes(props.selectedGroup)),
                    onClick: () => props.copyWidgets(),
                },
            ], [
                {
                    type: 'icon-button',
                    Icon: BiPaste,
                    name: 'Paste',
                    size: 'normal',
                    disabled: !Object.keys(props.widgetsClipboard.widgets).length,
                    onClick: () => props.pasteWidgets(),
                },
            ]],
            {
                type: 'icon-button',
                Icon: UndoIcon,
                name: 'Undo',
                subName: `(${props.historyCursor + 1} / ${props.history.length})`,
                onClick: props.undo,
                disabled: !props.editMode || props.historyCursor === 0,
            },
            {
                type: 'icon-button',
                Icon: RedoIcon,
                name: 'Redo',
                onClick: props.redo,
                disabled: !props.editMode || props.historyCursor === props.history.length - 1,
            },

            { type: 'divider' },

            [
                [
                    {
                        type: 'icon-button',
                        Icon: MdAlignHorizontalLeft,
                        name: 'Align horizontal/left',
                        size: 'normal',
                        disabled: props.selectedWidgets.length < 2,
                        onClick: () => props.alignWidgets('left'),
                    },
                    {
                        type: 'icon-button',
                        Icon: MdAlignVerticalTop,
                        name: 'Align vertical/top',
                        size: 'normal',
                        disabled: props.selectedWidgets.length < 2,
                        onClick: () => props.alignWidgets('top'),
                    },
                    {
                        type: 'icon-button',
                        Icon: MdAlignHorizontalCenter,
                        name: 'Align horizontal/center',
                        size: 'normal',
                        disabled: props.selectedWidgets.length < 2,
                        onClick: () => props.alignWidgets('horizontal-center'),
                    },
                    {
                        type: 'icon-button',
                        Icon: CgArrowAlignH,
                        name: 'Align horizontal/equal',
                        size: 'normal',
                        disabled: props.selectedWidgets.length < 2,
                        onClick: () => props.alignWidgets('horizontal-equal'),
                    },
                    {
                        type: 'icon-button',
                        Icon: AiOutlineColumnWidth,
                        name: 'Align width. Press more time to get the desired width.',
                        size: 'normal',
                        disabled: props.selectedWidgets.length < 2,
                        onClick: () => props.alignWidgets('width'),
                    },
                    {
                        type: 'icon-button',
                        Icon: RiBringToFront,
                        name: 'Bring to front',
                        size: 'normal',
                        disabled: !props.selectedWidgets.length,
                        onClick: () => props.orderWidgets('front'),
                    },
                ],
                [
                    {
                        type: 'icon-button',
                        Icon: MdAlignHorizontalRight,
                        name: 'Align horizontal/right',
                        size: 'normal',
                        disabled: props.selectedWidgets.length < 2,
                        onClick: () => props.alignWidgets('right'),
                    },
                    {
                        type: 'icon-button',
                        Icon: MdAlignVerticalBottom,
                        name: 'Align vertical/bottom',
                        size: 'normal',
                        disabled: props.selectedWidgets.length < 2,
                        onClick: () => props.alignWidgets('bottom'),
                    },
                    {
                        type: 'icon-button',
                        Icon: MdAlignVerticalCenter,
                        name: 'Align vertical/center',
                        size: 'normal',
                        disabled: props.selectedWidgets.length < 2,
                        onClick: () => props.alignWidgets('vertical-center'),
                    },
                    {
                        type: 'icon-button',
                        Icon: CgArrowAlignV,
                        name: 'Align vertical/equal',
                        size: 'normal',
                        disabled: props.selectedWidgets.length < 2,
                        onClick: () => props.alignWidgets('vertical-equal'),
                    },
                    {
                        type: 'icon-button',
                        Icon: AiOutlineColumnHeight,
                        name: 'Align height. Press more time to get the desired height.',
                        size: 'normal',
                        disabled: props.selectedWidgets.length < 2,
                        onClick: () => props.alignWidgets('height'),
                    },
                    {
                        type: 'icon-button',
                        Icon: RiSendToBack,
                        name: 'Send to back',
                        size: 'normal',
                        disabled: !props.selectedWidgets.length,
                        onClick: () => props.orderWidgets('back'),
                    },
                ],
            ],
            { type: 'divider' },
            [
                [{
                    type: 'icon-button',
                    Icon: OpenInNewIcon,
                    name: 'Lock dragging',
                    selected: props.lockDragging,
                    onClick: () => props.toggleLockDragging(),
                }],
                [{
                    type: 'icon-button',
                    Icon: props.widgetHint === 'hide' ? VisibilityOffIcon : VisibilityIcon,
                    color: props.widgetHint === 'light' ? 'white' : 'black',
                    name: `Toggle widget hint (${props.widgetHint})`,
                    onClick: () => props.toggleWidgetHint(),
                }],
            ],
            { type: 'divider' },
            [
                [{
                    type: 'icon-button',
                    Icon: BiImport,
                    name: 'Import widgets',
                    size: 'normal',
                    disabled: !props.editMode || !!props.selectedGroup,
                    onClick: () => setImportDialog(true),
                }],
                [{
                    type: 'icon-button',
                    Icon: BiExport,
                    name: 'Export widgets',
                    size: 'normal',
                    disabled: !props.selectedWidgets.length,
                    onClick: () => setExportDialog(true),
                }],
            ],
        ],
    };

    return <>
        <ToolbarItems group={toolbar} {...props} classes={{}} />
        {importDialog ? <WidgetImportDialog
            open={importDialog}
            onClose={() => setImportDialog(false)}
            changeProject={props.changeProject}
            selectedView={props.selectedView}
            project={props.project}
            themeName={props.themeName}
            getNewWidgetIdNumber={props.getNewWidgetIdNumber}
        /> : null}
        {exportDialog ? <WidgetExportDialog
            open={exportDialog}
            onClose={() => setExportDialog(false)}
            widgets={props.project[props.selectedView].widgets}
            selectedWidgets={props.selectedWidgets}
            themeName={props.themeName}
        /> : null}
    </>;
};

Widgets.propTypes = {
    openedViews: PropTypes.array,
    themeType: PropTypes.string,
    project: PropTypes.object,
    selectedView: PropTypes.string,
    selectedWidgets: PropTypes.array,
    setSelectedWidgets: PropTypes.func,
    selectedGroup: PropTypes.string,
};

export default Widgets;
