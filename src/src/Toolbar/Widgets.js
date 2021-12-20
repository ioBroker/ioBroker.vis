import {
    Button, Divider, IconButton, Select, MenuItem,
} from '@material-ui/core';
import {
    MdAlignHorizontalCenter, MdAlignHorizontalLeft, MdAlignHorizontalRight, MdAlignVerticalBottom, MdAlignVerticalCenter, MdAlignVerticalTop,
} from 'react-icons/md';
import { CgArrowAlignH, CgArrowAlignV } from 'react-icons/cg';

import I18n from '@iobroker/adapter-react/i18n';

import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import InfoIcon from '@material-ui/icons/Info';
import LockIcon from '@material-ui/icons/Lock';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

const widgetButtons = [
    { Icon: DeleteIcon },
    { Icon: FileCopyIcon },
    { Icon: InfoIcon },
];

const widgetsButtons = [
    { Icon: LockIcon },
    { Icon: OpenInNewIcon },
];

const alignButtons = [
    { Icon: MdAlignHorizontalLeft },
    { Icon: MdAlignHorizontalRight },
    { Icon: MdAlignVerticalTop },
    { Icon: MdAlignVerticalBottom },
    { Icon: MdAlignHorizontalCenter },
    { Icon: MdAlignVerticalCenter },
    { Icon: CgArrowAlignH },
    { Icon: CgArrowAlignV },
];

const Widgets = props => <div className={props.classes.toolbar}>
    Widgets
    <Select>
        {Object.keys(props.project[props.selectedView].widgets).map(widget => <MenuItem
            value={widget}
            key={widget}
        >
            {I18n.t(widget)}
        </MenuItem>)}
    </Select>
    {widgetButtons.map((button, key) => <IconButton size="small" key={key}><button.Icon fontSize="small" /></IconButton>)}
    <Divider orientation="vertical" flexItem />
    {alignButtons.map((button, key) => <IconButton size="small" key={key}><button.Icon fontSize="small" /></IconButton>)}
    {widgetsButtons.map((button, key) => <IconButton size="small" key={key}><button.Icon fontSize="small" /></IconButton>)}
    <Button>{I18n.t('Export Widgets')}</Button>
    <Button>{I18n.t('Import Widgets')}</Button>
</div>;

export default Widgets;
