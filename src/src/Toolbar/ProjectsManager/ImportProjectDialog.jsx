import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    TextField,
} from '@mui/material';

import { BiImport } from 'react-icons/bi';

import { I18n, Confirm as ConfirmDialog, Utils } from '@iobroker/adapter-react-v5';

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
    const [files, setFiles] = useState(null);
    const [projectName, setProjectName] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [askOpenProject, setAskOpenProject] = useState(false);
    const [working, setWorking] = useState(false);

    const onDrop = useCallback(acceptedFiles => {
        setFiles(acceptedFiles);
        if (acceptedFiles?.length) {
            if (acceptedFiles[0].name.match(/^\d\d\d\d-\d\d-\d\d-/)) {
                setProjectName(acceptedFiles[0].name.substring(11).replace(/\.zip$|\.json$/i, ''));
            } else {
                setProjectName(acceptedFiles[0].name.replace(/\.zip$|\.json$/i, ''));
            }
        }
    }, []);

    const importProject = () => {
        if (props.projects.includes(projectName) && !showConfirmation) {
            setShowConfirmation(true);
            return false;
        }

        setWorking(true);

        const reader = new FileReader();

        reader.onload = async evt => {
            const host = await getLiveHost(props.socket);
            if (!host) {
                window.alert(I18n.t('No live hosts found!'));
                return;
            }

            let timeout = setTimeout(() => {
                timeout = null;
                setWorking(false);
                window.alert(I18n.t('Cannot upload project: timeout'));
            }, 40000);

            props.socket.getRawSocket().emit('sendToHost', host, 'writeDirAsZip', {
                id: `${props.adapterName}.${props.instance}`,
                name: projectName || 'main',
                data: evt.target.result.split(',')[1],
            }, async result => {
                setWorking(false);
                timeout && clearTimeout(timeout);
                timeout = null;
                if (result.error) {
                    window.alert(I18n.t('Cannot upload project: %s', result.error));
                } else if (props.projectName !== projectName || props.openNewProjectOnCreate) {
                    if (props.openNewProjectOnCreate) {
                        props.onClose(true, projectName); // open new project immediately
                    } else {
                        await props.refreshProjects(false);
                        setAskOpenProject(true);
                    }
                } else {
                    await props.refreshProjects(true);
                    props.onClose(true, projectName);
                }
            });
        };

        reader.readAsDataURL(files[0]);
        return false;
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'application/zip': ['.zip'],
            'application/json': ['.json'],
        },
    });

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
        actionDisabled={!projectName?.length || !files?.length || working}
        closeDisabled={working}
    >
        <div
            {...getRootProps()}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: 200,
                borderRadius: 4,
                boxSizing: 'border-box',
                borderStyle: 'dashed',
                borderWidth: 1,
                borderColor: isDragActive ? (props.themeType === 'dark' ? 'lightgreen' : 'green') : 'inherit',
            }}
        >
            {working ? null : <input {...getInputProps()} />}
            <p style={{ textAlign: 'center', olor: isDragActive ? (props.themeType === 'dark' ? 'lightgreen' : 'green') : 'inherit' }}>
                {files && files.length ? <>
                    <span>{files[0].name}</span>
                    <span style={{ fontSize: 10, opacity: 0.5, display: 'block' }}>
                        (
                        {Utils.formatBytes(files[0].size)}
                        )
                    </span>
                </> : I18n.t('Drop the files here ...')}
            </p>
        </div>
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
