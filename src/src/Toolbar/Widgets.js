import {
    MdAlignHorizontalCenter, MdAlignHorizontalLeft, MdAlignHorizontalRight, MdAlignVerticalBottom, MdAlignVerticalCenter, MdAlignVerticalTop,
} from 'react-icons/md';
import { CgArrowAlignH, CgArrowAlignV } from 'react-icons/cg';

import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import InfoIcon from '@material-ui/icons/Info';
import LockIcon from '@material-ui/icons/Lock';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import ToolbarItems from './ToolbarItems';

const Widgets = props => {
    const toolbar = [
        {
            type: 'select',
            name: 'Active widget',
            value: props.selectedView,
            items: Object.keys(props.project[props.selectedView].widgets).map(widget => ({ name: widget, value: widget })),
            width: 120,
        },
        { type: 'icon-button', Icon: DeleteIcon },
        { type: 'icon-button', Icon: FileCopyIcon },
        { type: 'icon-button', Icon: InfoIcon },
        { type: 'divider' },
        { type: 'text', text: 'Align widgets' },
        { type: 'icon-button', Icon: MdAlignHorizontalLeft },
        { type: 'icon-button', Icon: MdAlignHorizontalRight },
        { type: 'icon-button', Icon: MdAlignVerticalTop },
        { type: 'icon-button', Icon: MdAlignVerticalBottom },
        { type: 'icon-button', Icon: MdAlignHorizontalCenter },
        { type: 'icon-button', Icon: MdAlignVerticalCenter },
        { type: 'icon-button', Icon: CgArrowAlignH },
        { type: 'icon-button', Icon: CgArrowAlignV },
        { type: 'divider' },
        { type: 'text', text: 'All widgets' },
        { type: 'icon-button', Icon: LockIcon },
        { type: 'icon-button', Icon: OpenInNewIcon },
        { type: 'divider' },
        { type: 'button', name: 'Export Widgets' },
        { type: 'button', name: 'Import Widgets' },
    ];

    return <div className={props.classes.toolbar}>
        <ToolbarItems items={toolbar} {...props} />
    </div>;
};

export default Widgets;
