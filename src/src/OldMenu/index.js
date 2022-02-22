import {
    Tab, Tabs, Button,
} from '@mui/material';

import I18n from '@iobroker/adapter-react-v5/i18n';
import { useState } from 'react';

import {
    Menu,
    MenuItem,
    SubMenu,
} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';

import { withStyles } from '@mui/styles';

import Toolbar from '../Toolbar/OldToolbar';
import Settings from '../Toolbar/Settings';

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
        </div>
        <Toolbar
            selected={selected}
            {...props}
        />
        <Settings open={settingsDialog} onClose={() => setSettingsDialog(false)} {...props} />
    </>;
};

export default withStyles(styles)(MainMenu);
