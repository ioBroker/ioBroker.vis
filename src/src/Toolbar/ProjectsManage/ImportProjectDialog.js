import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import I18n from '@iobroker/adapter-react-v5/i18n';
import {
    TextField,
} from '@mui/material';

import IODialog from '../../Components/IODialog';

const ImportProjectDialog = props => {
    const [files, setFiles] = useState(null);
    const [projectName, setProjectName] = useState(null);
    useEffect(() => {
        setFiles(null);
        setProjectName(props.projectName);
    }, [props.open]);

    const onDrop = useCallback(acceptedFiles => {
        setFiles(acceptedFiles);
    }, []);

    const importProject = () => {
        let uploaded = 0;

        files.forEach(file => {
            const reader = new FileReader();

            reader.onload = async () => {
                await props.socket.writeFile64('vis.0', `${projectName}/${file.name}`, reader.result);
                uploaded++;
                if (uploaded === files.length) {
                    props.refreshProjects();
                }
            };
            reader.readAsText(file);
        });
    };

    const {
        getRootProps, getInputProps, isDragActive, draggedFiles,
    } = useDropzone({ onDrop, accept: ['.json', '.css'] });

    return (
        <IODialog
            title="Import project"
            open={props.open}
            onClose={props.onClose}
            action={importProject}
            actionTitle="Import"
            actionDisabled={!projectName || !projectName.length || !files || !files.length}
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
                    borderStyle: isDragActive ? 'solid' : 'dashed',
                    borderWidth: 1,
                }}
            >
                <input {...getInputProps()} />
                <p>
                    {files && files.length
                        ? files.map(file => <div>{file.name}</div>)
                        : (isDragActive
                            ? `${I18n.t('Files')}: ${draggedFiles.length}`
                            : I18n.t('Drop the files here ...'))}
                </p>
            </div>
            <div>
                <TextField
                    variant="standard"
                    label={I18n.t('Project name')}
                    value={projectName}
                    onChange={e => setProjectName(e.target.value.replace(/[^0-9a-zA-Z\-_.]/, ''))}
                />
            </div>
        </IODialog>
    );
};

ImportProjectDialog.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    projectName: PropTypes.string,
    refreshProjects: PropTypes.func,
    socket: PropTypes.object,
};

export default ImportProjectDialog;
