import PropTypes from 'prop-types';
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
import LockIcon from '@mui/icons-material/Lock';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import UndoIcon from '@mui/icons-material/Undo';

import ToolbarItems from './ToolbarItems';

const Widgets = props => {
    if (!props.openedViews.length) {
        return null;
    }
    if (!props.project[props.selectedView]) {
        return null;
    }

    const widgets = props.project[props.selectedView].widgets;

    const toolbar = {
        name: 'Widgets',
        items: [
            {
                type: 'multiselect',
                name: 'Active widget',
                items: Object.keys(widgets).filter(widget => !widgets[widget].groupid).map(widget => ({
                    name: `${widget} (${widgets[widget].tpl})`,
                    value: widget,
                })),
                width: 240,
                value: props.selectedWidgets,
                onChange: e => props.setSelectedWidgets(e.target.value),
            },
            [[
                { type: 'icon-button', Icon: DeleteIcon, name: 'Delete widget' },
            ], [
                { type: 'icon-button', Icon: FileCopyIcon, name: 'Copy widget' },
            ]],
            { type: 'divider' },
            [[
                {
                    type: 'icon-button', Icon: BiCut, name: 'Cut', size: 'normal',
                },
                {
                    type: 'icon-button', Icon: BiCopy, name: 'Copy', size: 'normal',
                },
            ], [
                {
                    type: 'icon-button', Icon: BiPaste, name: 'Paste', size: 'normal',
                },
            ]],
            {
                type: 'icon-button', Icon: UndoIcon, name: 'Undo',
            },

            { type: 'divider' },
            [
                [
                    {
                        type: 'icon-button', Icon: MdAlignHorizontalLeft, name: 'Align horizontal/left', size: 'normal',
                    },
                    {
                        type: 'icon-button', Icon: MdAlignHorizontalRight, name: 'Align horizontal/right', size: 'normal',
                    },
                    {
                        type: 'icon-button', Icon: MdAlignVerticalTop, name: 'Align vertical/top', size: 'normal',
                    },
                    {
                        type: 'icon-button', Icon: MdAlignVerticalBottom, name: 'Align vertical/bottom', size: 'normal',
                    },
                    {
                        type: 'icon-button', Icon: MdAlignHorizontalCenter, name: 'Align horizontal/center', size: 'normal',
                    },
                    { type: 'icon-button', Icon: LockIcon, name: 'Disable interaction' },
                    {
                        type: 'icon-button', Icon: RiBringToFront, name: 'Bring to front', size: 'normal',
                    },
                ],
                [
                    {
                        type: 'icon-button', Icon: MdAlignVerticalCenter, name: 'Align vertical/center', size: 'normal',
                    },
                    {
                        type: 'icon-button', Icon: CgArrowAlignH, name: 'Align horizontal/equal', size: 'normal',
                    },
                    {
                        type: 'icon-button', Icon: CgArrowAlignV, name: 'Align vertical/equal', size: 'normal',
                    },
                    {
                        type: 'icon-button', Icon: AiOutlineColumnWidth, name: 'Align width. Press more time to get the desired width.', size: 'normal',
                    },
                    {
                        type: 'icon-button', Icon: AiOutlineColumnHeight, name: 'Align height. Press more time to get the desired height.', size: 'normal',
                    },
                    { type: 'icon-button', Icon: OpenInNewIcon, name: 'Lock dragging' },
                    {
                        type: 'icon-button', Icon: RiSendToBack, name: 'Send to back', size: 'normal',
                    },
                ],
            ],
            { type: 'divider' },
            [
                [{
                    type: 'icon-button', Icon: BiImport, name: 'Import widgets', size: 'normal',
                }],
                [{
                    type: 'icon-button', Icon: BiExport, name: 'Export widgets', size: 'normal',
                }],
            ],
        ],
    };

    return <ToolbarItems group={toolbar} {...props} classes={{}} />;
};

Widgets.propTypes = {
    openedViews: PropTypes.array,
    project: PropTypes.object,
    selectedView: PropTypes.string,
    selectedWidgets: PropTypes.array,
    setSelectedWidgets: PropTypes.func,
};

export default Widgets;
