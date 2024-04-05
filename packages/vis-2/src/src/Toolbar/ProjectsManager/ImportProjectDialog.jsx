import PropTypes from 'prop-types';
import { useState } from 'react';
import {
    TextField,
} from '@mui/material';

import { BiImport } from 'react-icons/bi';

import { I18n, Confirm as ConfirmDialog } from '@iobroker/adapter-react-v5';

import UploadFile from '../../Components/UploadFile';
import IODialog from '../../Components/IODialog';

export const getLiveHost = async socket => {
    const res = await socket.getObjectViewSystem('host', 'system.host.', 'system.host.\u9999');
    const hosts = Object.keys(res).map(id => `${id}.alive`);
    if (!hosts.length) {
        return null;
    }
    const states = await socket.getForeignStates(hosts);
    for (const h in states) {
        if (states[h]?.val) {
            return h.substring(0, h.length - '.alive'.length);
        }
    }

    return null;
};

const ImportProjectDialog = props => {
    const [projectName, setProjectName] = useState('');
    const [projectData, setProjectData] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [askOpenProject, setAskOpenProject] = useState(false);
    const [working, setWorking] = useState(false);

    const importProject = () => {
        if (props.projects.includes(projectName) && !showConfirmation) {
            setShowConfirmation(true);
            return false;
        }

        setWorking(true);

        getLiveHost(props.socket)
            .then(host => {
                if (!host) {
                    window.alert(I18n.t('No live hosts found!'));
                    setWorking(false);
                    return;
                }

                let timeout = setTimeout(() => {
                    timeout = null;
                    setWorking(false);
                    window.alert(I18n.t('Cannot upload project: timeout'));
                }, 60_000);

                props.socket.getRawSocket().emit('sendToHost', host, 'writeDirAsZip', {
                    id: `${props.adapterName}.${props.instance}`,
                    name: projectName || 'main',
                    data: projectData.split(',')[1],
                }, async result => {
                    setWorking(false);
                    timeout && clearTimeout(timeout);
                    timeout = null;

                    if (result.error) {
                        window.alert(I18n.t('Cannot upload project: %s', result.error));
                    } else if (props.projectName !== projectName || props.openNewProjectOnCreate) {
                        if (props.openNewProjectOnCreate) {
                            props.onClose(true, projectName); // open the new project immediately
                        } else {
                            await props.refreshProjects(false);
                            setAskOpenProject(true);
                        }
                    } else {
                        await props.refreshProjects(true);
                        props.onClose(true, projectName);
                    }
                });
            });

        return false;
    };

    const confirmDialog = showConfirmation ? <ConfirmDialog
        title={I18n.t('Project already exists.')}
        text={I18n.t('Do you want to overwrite it?')}
        ok={I18n.t('Overwrite')}
        cancel={I18n.t('Cancel')}
        onClose={isYes => {
            setShowConfirmation(false);
            isYes && importProject();
        }}
    /> : null;

    const askOpenDialog = askOpenProject ? <ConfirmDialog
        title={I18n.t('Project "%s" was successfully imported', projectName)}
        text={I18n.t('Open it?', projectName)}
        ok={I18n.t('Open')}
        cancel={I18n.t('Ignore')}
        onClose={isYes => {
            setAskOpenProject(false);
            isYes && props.loadProject(projectName);
            props.onClose(isYes, projectName);
        }}
    /> : null;

    return <IODialog
        title="Import project"
        open={!0}
        onClose={() => props.onClose()}
        actionNoClose
        action={importProject}
        actionTitle="Import"
        ActionIcon={BiImport}
        actionDisabled={!projectName?.length || !projectData || working}
        closeDisabled={working}
    >
        <UploadFile
            disabled={working}
            themeType={props.themeType}
            onUpload={(name, data) => {
                if (name.match(/^\d\d\d\d-\d\d-\d\d-/)) {
                    setProjectName(name.substring(11).replace(/\.zip$/i, ''));
                } else {
                    setProjectName(name.replace(/\.zip$/i, ''));
                }
                setProjectData(data);
            }}
            accept={{
                'application/zip': ['.zip'],
            }}
        />
        <div style={{ marginTop: 10 }}>
            <TextField
                variant="standard"
                fullWidth
                disabled={working}
                label={I18n.t('Project name')}
                helperText={props.projects.includes(projectName) ? I18n.t('Project already exists') : ''}
                error={props.projects.includes(projectName)}
                value={projectName}
                onChange={e => setProjectName(e.target.value.replace(/[^\da-zA-Z\-_.]/, ''))}
            />
        </div>
        {confirmDialog}
        {askOpenDialog}
    </IODialog>;
};

ImportProjectDialog.propTypes = {
    onClose: PropTypes.func,
    projectName: PropTypes.string,
    refreshProjects: PropTypes.func,
    socket: PropTypes.object,
    themeType: PropTypes.string,
    loadProject: PropTypes.func,
    adapterName: PropTypes.string,
    instance: PropTypes.number,
    openNewProjectOnCreate: PropTypes.bool,
};

export default ImportProjectDialog;
