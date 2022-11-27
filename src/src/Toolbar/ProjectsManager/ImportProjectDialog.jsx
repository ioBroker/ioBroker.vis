import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    TextField,
} from '@mui/material';

import I18n from '@iobroker/adapter-react-v5/i18n';
import ConfirmDialog from '@iobroker/adapter-react-v5/Dialogs/Confirm';
import Utils from '@iobroker/adapter-react-v5/Components/Utils';

import IODialog from '../../Components/IODialog';

const ImportProjectDialog = props => {
    const [files, setFiles] = useState(null);
    const [projectName, setProjectName] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [askOpenProject, setAskOpenProject] = useState(false);

    useEffect(() => {
        setFiles(null);
        setProjectName('');
        if (props.open) {
            props.refreshProjects();
        }
    }, [props.open]);

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

        const reader = new FileReader();

        reader.onload = async evt => {
            const host = await props.getLiveHost();
            if (!host) {
                window.alert(I18n.t('No live hosts found!'));
                return;
            }

            props.socket.getRawSocket().emit('sendToHost', host, 'writeDirAsZip', {
                id: `${props.adapterName}.${props.instance}`,
                name: projectName || 'main',
                data: evt.target.result.split(',')[1],
            }, async result => {
                if (result.error) {
                    window.alert(I18n.t('Cannot upload project: %s', result.error));
                } else {
                    await props.refreshProjects(props.projectName === projectName);
                    if (props.projectName !== projectName) {
                        setAskOpenProject(true);
                    } else {
                        props.onClose(true);
                    }
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
            if (isYes) {
                importProject();
            }
        }}
    /> : null;

    const askOpenDialog = askOpenProject ? <ConfirmDialog
        title={I18n.t('Project "%s" was successfully imported', projectName)}
        text={I18n.t('Open it?', projectName)}
        ok={I18n.t('Open')}
        cancel={I18n.t('Ignore')}
        onClose={isYes => {
            setAskOpenProject(false);

            if (isYes) {
                props.loadProject(projectName);
            }
            props.onClose(isYes);
        }}
    /> : null;

    return <IODialog
        title="Import project"
        open={props.open}
        onClose={props.onClose}
        actionNoClose
        action={importProject}
        actionTitle="Import"
        actionDisabled={!projectName?.length || !files?.length}
    >
        <div
            {...getRootProps()}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 200,
                height: 200,
                borderRadius: 4,
                borderStyle: 'dashed',
                borderWidth: 1,
                borderColor: isDragActive ? (props.themeType === 'dark' ? 'lightgreen' : 'green') : 'inherit',
            }}
        >
            <input {...getInputProps()} />
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
        <div>
            <TextField
                variant="standard"
                label={I18n.t('Project name')}
                helperText={props.projects.includes(projectName) ? I18n.t('Project already exists') : ''}
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
    open: PropTypes.bool,
    projectName: PropTypes.string,
    refreshProjects: PropTypes.func,
    socket: PropTypes.object,
    themeType: PropTypes.string,
    getLiveHost: PropTypes.func,
    loadProject: PropTypes.func,
    adapterName: PropTypes.string,
    instance: PropTypes.number,
};

export default ImportProjectDialog;
