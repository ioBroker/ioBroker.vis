import MenuIcon from '@material-ui/icons/Menu';

import { useState } from 'react';
import ObjectBrowser from '@iobroker/adapter-react/Components/ObjectBrowser';
import I18n from '@iobroker/adapter-react/i18n';
import { Dialog } from '@material-ui/core';
import ToolbarItems from './NewToolbarItems';

import Settings from '../Menu/Settings';
import ProjectsManage from './ProjectsManage';

const Tools = props => {
    const [settingsDialog, setSettingsDialog] = useState(false);
    const [objectsDialog, setObjectsDialog] = useState(false);
    const [projectsDialog, setProjectsDialog] = useState(false);

    const toolbar = {
        name: 'Projects',
        items: [
            {
                type: 'icon-button', Icon: MenuIcon, name: 'Settings', onClick: () => setSettingsDialog(true),
            },
            {
                type: 'icon-button', Icon: MenuIcon, name: 'Manage projects', onClick: () => setProjectsDialog(true),
            },
            {
                type: 'icon-button', Icon: MenuIcon, name: 'Objects', onClick: () => setObjectsDialog(true),
            },
        ],
    };

    return <>
        <ToolbarItems group={toolbar} {...props} />
        <Settings open={settingsDialog} onClose={() => setSettingsDialog(false)} {...props} />
        <ProjectsManage open={projectsDialog} onClose={() => setProjectsDialog(false)} {...props} />
        <Dialog
            open={objectsDialog}
            onClose={() => setObjectsDialog(false)}
        >
            <ObjectBrowser
                socket={props.socket}
                t={I18n.t}
            />
        </Dialog>
    </>;
};

export default Tools;
