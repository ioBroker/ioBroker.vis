import PropTypes from 'prop-types';
import { useState } from 'react';
import { withStyles } from '@mui/styles';

import {
    Menu as MenuIcon,
    Settings as SettingsIcon,
    List as ListIcon,
    FileCopy as FilesIcon,
} from '@mui/icons-material';

import {
    SelectID,
    I18n,
    SelectFile as SelectFileDialog,
    Utils,
} from '@iobroker/adapter-react-v5';

import ToolbarItems from './ToolbarItems';
import Settings from './Settings';
import ProjectsManager from './ProjectsManager';

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
    const [filesDialog, setFilesDialog] = useState(false);

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
            {
                type: 'icon-button', Icon: FilesIcon, name: 'Files', onClick: () => setFilesDialog(true),
            },
        ],
    };

    return <>
        <ToolbarItems group={toolbar} last {...props} classes={{}} />
        {settingsDialog ? <Settings
            onClose={() => setSettingsDialog(false)}
            {...props}
            classes={{}}
            adapterName={props.adapterName}
            instance={props.instance}
            projectName={props.projectName}
        /> : null}
        {props.projectsDialog ? <ProjectsManager
            open={!0}
            onClose={() => props.setProjectsDialog(false)}
            {...props}
            classes={{}}
        /> : null}
        {
            objectsDialog ? <SelectID
                imagePrefix="../.."
                ready
                onClose={() => setObjectsDialog(false)}
                socket={props.socket}
                title={I18n.t('Browse objects')}
                columns={['role', 'func', 'val', 'name']}
                notEditable={false}
                statesOnly
                onOk={selected => {
                    Utils.copyToClipboard(selected);
                    setObjectsDialog(false);
                    window.alert(I18n.t('Copied'));
                }}
                ok={I18n.t('Copy to clipboard')}
                cancel={I18n.t('ra_Close')}
            /> : null
        }
        {
            filesDialog ? <SelectFileDialog
                title={I18n.t('Browse files')}
                onClose={() => setFilesDialog(false)}
                restrictToFolder={`${props.adapterName}.${props.instance}/${props.projectName}`}
                allowNonRestricted
                ready
                allowUpload
                allowDownload
                allowCreateFolder
                allowDelete
                allowView
                showToolbar
                imagePrefix="../"
                selected=""
                showTypeSelector
                onSelect={(selected, isDoubleClick) => {
                    const projectPrefix = `${props.adapterName}.${props.instance}/${props.projectName}/`;
                    if (selected.startsWith(projectPrefix)) {
                        selected = `_PRJ_NAME/${selected.substring(projectPrefix.length)}`;
                    } else if (selected.startsWith('/')) {
                        selected = `..${selected}`;
                    } else if (!selected.startsWith('.')) {
                        selected = `../${selected}`;
                    }
                    if (isDoubleClick) {
                        Utils.copyToClipboard(selected);
                        setFilesDialog(false);
                        window.alert(I18n.t('ra_Copied %s', selected));
                    }
                }}
                onOk={selected => {
                    const projectPrefix = `${props.adapterName}.${props.instance}/${props.projectName}/`;
                    if (selected.startsWith(projectPrefix)) {
                        selected = `_PRJ_NAME/${selected.substring(projectPrefix.length)}`;
                    } else if (selected.startsWith('/')) {
                        selected = `..${selected}`;
                    } else if (!selected.startsWith('.')) {
                        selected = `../${selected}`;
                    }
                    Utils.copyToClipboard(selected);
                    setFilesDialog(false);
                    window.alert(I18n.t('ra_Copied %s', selected));
                }}
                socket={props.socket}
                ok={I18n.t('Copy to clipboard')}
                cancel={I18n.t('ra_Close')}
            /> : null
        }
    </>;
};

Tools.propTypes = {
    socket: PropTypes.object,
    projectsDialog: PropTypes.bool,
    setProjectsDialog: PropTypes.func,
    adapterName: PropTypes.string,
    instance: PropTypes.number,
    projectName: PropTypes.string,
};

export default withStyles(styles)(Tools);
