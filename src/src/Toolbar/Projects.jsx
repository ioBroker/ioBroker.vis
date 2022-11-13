import PropTypes from 'prop-types';
import { useState } from 'react';
import withStyles from '@mui/styles/withStyles';
import copy from 'copy-to-clipboard';

import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import ListIcon from '@mui/icons-material/List';

import SelectID from '@iobroker/adapter-react-v5/Dialogs/SelectID';
import I18n from '@iobroker/adapter-react-v5/i18n';

import ToolbarItems from './ToolbarItems';

import Settings from './Settings';
import ProjectsManage from './ProjectsManage';

const styles = () => ({
    objectsDialog: {
        minWidth: 800,
        height: '100%',
        overflow: 'hidden',
    },
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
        <ToolbarItems group={toolbar} last {...props} classes={{}} />
        <Settings open={settingsDialog} onClose={() => setSettingsDialog(false)} {...props} classes={{}} />
        <ProjectsManage
            open={props.projectsDialog}
            onClose={() => props.setProjectsDialog(false)}
            {...props}
            classes={{}}
        />
        {
            objectsDialog ? <SelectID
                ready
                onClose={() => setObjectsDialog(false)}
                socket={props.socket}
                title={I18n.t('Browse objects')}
                columns={['role', 'func', 'val', 'name']}
                notEditable={false}
                statesOnly
                onOk={selected => {
                    copy(selected);
                    setObjectsDialog(false);
                    window.alert(I18n.t('Copied'));
                }}
                ok={I18n.t('Copy to clipboard')}
                cancel={I18n.t('Close')}
            /> : null
        }
    </>;
};

Tools.propTypes = {
    socket: PropTypes.object,
};

export default withStyles(styles)(Tools);
