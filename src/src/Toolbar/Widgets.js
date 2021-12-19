import { Button, Divider, IconButton } from '@material-ui/core';
import {
    MdAlignHorizontalCenter, MdAlignHorizontalLeft, MdAlignHorizontalRight, MdAlignVerticalBottom, MdAlignVerticalCenter, MdAlignVerticalTop,
} from 'react-icons/md';
import { CgArrowAlignH, CgArrowAlignV } from 'react-icons/cg';

import I18n from '@iobroker/adapter-react/i18n';

const alignButtons = [
    { icon: <MdAlignHorizontalLeft /> },
    { icon: <MdAlignHorizontalRight /> },
    { icon: <MdAlignVerticalTop /> },
    { icon: <MdAlignVerticalBottom /> },
    { icon: <MdAlignHorizontalCenter /> },
    { icon: <MdAlignVerticalCenter /> },
    { icon: <CgArrowAlignH /> },
    { icon: <CgArrowAlignV /> },
];

const Widgets = props => <div className={props.classes.toolbar}>
    Widgets
    <Divider orientation="vertical" flexItem />
    {alignButtons.map((button, key) => <IconButton size="small" key={key}>{button.icon}</IconButton>)}
    <Button>{I18n.t('Export Widgets')}</Button>
    <Button>{I18n.t('Import Widgets')}</Button>
</div>;

export default Widgets;
