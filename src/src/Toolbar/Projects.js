import PropTypes from 'prop-types';
import { useState } from 'react';
import ObjectBrowser from '@iobroker/adapter-react-v5/Components/ObjectBrowser';
import I18n from '@iobroker/adapter-react-v5/i18n';

import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import ListIcon from '@mui/icons-material/List';
import withStyles from '@mui/styles/withStyles';
import ToolbarItems from './ToolbarItems';

import Settings from './Settings';
import ProjectsManage from './ProjectsManage';
import IODialog from '../Components/IODialog';

const styles = () => ({
});

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
                    lang={I18n.lang}
                />
            </div>
        </IODialog>
    </>;
};

Tools.propTypes = {
    socket: PropTypes.object,
};

export default withStyles(styles)(Tools);
