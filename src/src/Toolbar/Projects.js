import PropTypes from 'prop-types';
import { useState } from 'react';
import ObjectBrowser from '@iobroker/adapter-react/Components/ObjectBrowser';
import I18n from '@iobroker/adapter-react/i18n';

import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import ListIcon from '@material-ui/icons/List';
import ToolbarItems from './ToolbarItems';

import Settings from './Settings';
import ProjectsManage from './ProjectsManage';
import IODialog from '../Components/IODialog';

const Tools = props => {
    const [settingsDialog, setSettingsDialog] = useState(false);
    const [objectsDialog, setObjectsDialog] = useState(false);

    const toolbar = {
        name: 'Projects',
        items: [
            {
                type: 'icon-button', Icon: SettingsIcon, name: 'Settings', onClick: () => setSettingsDialog(true),
            },
            {
                type: 'icon-button', Icon: MenuIcon, name: 'Manage projects', onClick: () => props.setProjectsDialog(true),
            },
            {
                type: 'icon-button', Icon: ListIcon, name: 'Objects', onClick: () => setObjectsDialog(true),
            },
        ],
    };

    return <>
        <ToolbarItems group={toolbar} last {...props} />
        <Settings open={settingsDialog} onClose={() => setSettingsDialog(false)} {...props} />
        <ProjectsManage open={props.projectsDialog} onClose={() => props.setProjectsDialog(false)} {...props} />
        <IODialog
            open={objectsDialog}
            onClose={() => setObjectsDialog(false)}
            title="Browse objects"
            maxWidth="lg"
            closeTitle={I18n.t('Close')}
        >
            <div>
                <ObjectBrowser
                    socket={props.socket}
                    t={I18n.t}
                />
            </div>
        </IODialog>
    </>;
};

Tools.propTypes = {
    socket: PropTypes.object,
};

export default Tools;
