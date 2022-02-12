import { useState } from 'react';
import ObjectBrowser from '@iobroker/adapter-react/Components/ObjectBrowser';
import I18n from '@iobroker/adapter-react/i18n';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@material-ui/core';

import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import ListIcon from '@material-ui/icons/List';
import ToolbarItems from './ToolbarItems';

import Settings from './Settings';
import ProjectsManage from './ProjectsManage';

const Tools = props => {
    const [settingsDialog, setSettingsDialog] = useState(false);
    const [objectsDialog, setObjectsDialog] = useState(false);
    const [projectsDialog, setProjectsDialog] = useState(false);

    const toolbar = {
        name: 'Projects',
        items: [
            {
                type: 'icon-button', Icon: SettingsIcon, name: 'Settings', onClick: () => setSettingsDialog(true),
            },
            {
                type: 'icon-button', Icon: MenuIcon, name: 'Manage projects', onClick: () => setProjectsDialog(true),
            },
            {
                type: 'icon-button', Icon: ListIcon, name: 'Objects', onClick: () => setObjectsDialog(true),
            },
        ],
    };

    return <>
        <ToolbarItems group={toolbar} last {...props} />
        <Settings open={settingsDialog} onClose={() => setSettingsDialog(false)} {...props} />
        <ProjectsManage open={projectsDialog} onClose={() => setProjectsDialog(false)} {...props} />
        <Dialog
            open={objectsDialog}
            onClose={() => setObjectsDialog(false)}
        >
            <DialogTitle>{I18n.t('Select object')}</DialogTitle>
            <DialogContent>
                <ObjectBrowser
                    socket={props.socket}
                    t={I18n.t}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setObjectsDialog(false)}>{I18n.t('Close')}</Button>
            </DialogActions>
        </Dialog>
    </>;
};

export default Tools;
