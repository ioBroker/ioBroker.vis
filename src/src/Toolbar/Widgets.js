import {
    MdAlignHorizontalCenter, MdAlignHorizontalLeft, MdAlignHorizontalRight, MdAlignVerticalBottom, MdAlignVerticalCenter, MdAlignVerticalTop,
} from 'react-icons/md';
import { CgArrowAlignH, CgArrowAlignV } from 'react-icons/cg';
import { AiOutlineColumnWidth, AiOutlineColumnHeight } from 'react-icons/ai';

import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import InfoIcon from '@material-ui/icons/Info';
import LockIcon from '@material-ui/icons/Lock';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import ToolbarItems from './ToolbarItems';

const Widgets = props => {
    if (!Object.keys(props.project).find(view => !view.startsWith('__'))) {
        return null;
    }

    if (!props.project[props.selectedView]) {
        return null;
    }

    const toolbar = [
        {
            type: 'select',
            name: 'Active widget',
            items: Object.keys(props.project[props.selectedView].widgets).map(widget => ({ name: widget, value: widget })),
            width: 120,
        },
        { type: 'icon-button', Icon: DeleteIcon, name: 'Delete widget' },
        { type: 'icon-button', Icon: FileCopyIcon, name: 'Copy widget' },
        { type: 'icon-button', Icon: InfoIcon, name: 'Help about widget' },
        { type: 'divider' },
        { type: 'text', text: 'Align widgets' },
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
        { type: 'divider' },
        { type: 'text', text: 'All widgets' },
        { type: 'icon-button', Icon: LockIcon, name: 'Disable interaction with widget' },
        { type: 'icon-button', Icon: OpenInNewIcon, name: 'Lock widget dragging' },
        { type: 'divider' },
        { type: 'button', name: 'Export Widgets' },
        { type: 'button', name: 'Import Widgets' },
    ];

    return <div className={props.classes.toolbar}>
        <ToolbarItems items={toolbar} {...props} />
    </div>;
};

export default Widgets;
