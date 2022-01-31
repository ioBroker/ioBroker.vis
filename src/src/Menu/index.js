import {
    Tab, Tabs, Button, IconButton, Tooltip, Menu as DropMenu, MenuItem as DropMenuItem, Typography,
} from '@material-ui/core';

import I18n from '@iobroker/adapter-react/i18n';
import { useRef, useState } from 'react';

import {
    Menu,
    MenuItem,
    SubMenu,
} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';

import UndoIcon from '@material-ui/icons/Undo';
import CloseIcon from '@material-ui/icons/Close';
import SyncIcon from '@material-ui/icons/Sync';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { withStyles } from '@material-ui/styles';

import Toolbar from '../Toolbar';
import Settings from './Settings';

const styles = () => ({
    right: {
        marginLeft: 'auto',
    },
    header: {
        padding: '0px 10px',
        fontSize: '140%',
    },
});

const toolbarItems = ['View', 'Widgets', 'Tools'];

const MainMenu = props => {
    const [selected, setSelected] = useState(window.localStorage.getItem('selectedMenu')
        ? window.localStorage.getItem('selectedMenu')
        : 'View');
    const [settingsDialog, setSettingsDialog] = useState(false);

    const [right, setRight] = useState(false);
    const rightRef = useRef(null);

    const menuItems = [
        {
            name: 'Setup',
            submenu: [
                {
                    name: 'Projects',
                    submenu: [
                        { name: 'main' },
                    ],
                },
                {
                    name: 'Project export/import',
                    submenu: [
                        { name: 'Export (normal)' },
                        { name: 'Export (anonymized)' },
                        { name: 'Import' },
                    ],
                },
                { name: 'New project...' },
                { name: 'File manager...' },
                { name: 'Settings...', onClick: () => setSettingsDialog(true) },
                { name: 'Object browser...' },
            ],
        },
        {
            name: 'Help',
            submenu: [
                { name: 'Shortcuts' },
                { name: 'About' },
            ],
        }];

    return <>
        <div className={props.classes.menu}>
            <Tabs className={props.classes.viewTabs} value={selected}>
                {
                    toolbarItems.map(tab => <Tab
                        label={I18n.t(tab)}
                        value={tab}
                        className={props.classes.viewTab}
                        onClick={() => {
                            setSelected(tab);
                            window.localStorage.setItem('selectedMenu', tab);
                        }}
                        key={tab}
                    />)
                }
            </Tabs>
            {
                menuItems.map(level1 => <Menu key={level1.name} menuButton={<Button>{level1.name}</Button>}>
                    {level1.submenu.map(level2 => (level2.submenu
                        ? <SubMenu key={level2.name} label={level2.name}>
                            {level2.submenu.map(level3 => <MenuItem key={level3.name}>{level3.name}</MenuItem>)}
                        </SubMenu>
                        : <MenuItem
                            key={level2.name}
                            onClick={level2.onClick}
                        >
                            {level2.name}
                        </MenuItem>))}
                </Menu>)
            }
            <Tooltip title={I18n.t('Undo')}>
                <IconButton size="small">
                    <UndoIcon />
                </IconButton>
            </Tooltip>
            <span className={props.classes.right}>
                <Tooltip title={I18n.t('Close editor')}>
                    <IconButton size="small">
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
                <IconButton ref={rightRef} onClick={() => setRight(!right)} size="small">
                    <ArrowDropDownIcon />
                </IconButton>
                <DropMenu
                    open={right}
                    anchorEl={rightRef.current}
                    onClose={() => setRight(false)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    getContentAnchorEl={null}
                >
                    <DropMenuItem>
                        <CloseIcon />
                        {I18n.t('Close editor')}
                    </DropMenuItem>
                    <DropMenuItem>
                        <PlayArrowIcon />
                        {I18n.t('Open runtime in new window')}
                    </DropMenuItem>
                    <DropMenuItem>
                        <SyncIcon />
                        {I18n.t('Reload all runtimes')}
                    </DropMenuItem>
                </DropMenu>
            </span>
        </div>
        <Toolbar
            selected={selected}
            {...props}
        />
        <Settings open={settingsDialog} onClose={() => setSettingsDialog(false)} {...props} />
    </>;
};

export default withStyles(styles)(MainMenu);
