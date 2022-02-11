import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import I18n from '@iobroker/adapter-react/i18n';
import {
    Button, IconButton, TextField, Tooltip,
} from '@material-ui/core';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { BiImport, BiExport } from 'react-icons/bi';
import IODialog from '../Components/IODialog';

const ImportProjectDialog = props => {
    const onDrop = useCallback(acceptedFiles => {
        acceptedFiles.forEach(file => {
            const reader = new FileReader();

            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
            reader.onload = () => {
            // Do whatever you want with the file contents
                console.log(reader.result);
            };
            reader.readAsText(file);
        });
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return <IODialog
        title="Import project"
        open={props.open}
        onClose={props.onClose}
    >
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {
                isDragActive
                    ? <p>Drop the files here ...</p>
                    : <p>Drag 'n' drop some files here, or click to select files</p>
            }
        </div>
    </IODialog>;
};

const ProjectsManage = props => {
    const [addDialog, setAddDialog] = useState(false);
    const [importDialog, setImportDialog] = useState(false);

    if (!props.projects) {
        return null;
    }

    const exportProject = projectName => {
        props.socket.readFile('vis.0', `${projectName}/vis-views.json`).then(project => {
            const zip = new JSZip();

            zip.file(`${projectName}.json`, project);

            zip.generateAsync({ type: 'blob' }).then(content => {
                saveAs(content, `${projectName}.zip`);
            });
        });
    };

    return <IODialog open={props.open} onClose={props.onClose} title="Manage projects" closeTitle="Close">
        <div>
            <Tooltip title={I18n.t('Add')}>
                <IconButton onClick={() => setAddDialog('')}>
                    <AddIcon />
                </IconButton>
            </Tooltip>
        </div>
        {props.projects.map((projectName, key) => <div key={key}>
            <Button onClick={() => props.loadProject(projectName)}>{projectName}</Button>
            <Tooltip title={I18n.t('Delete')}>
                <IconButton onClick={() => props.deleteProject(projectName)} size="small">
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title={I18n.t('Import')}>
                <IconButton size="small">
                    <BiImport fontSize="20" onClick={() => setImportDialog(projectName)} />
                </IconButton>
            </Tooltip>
            <Tooltip title={I18n.t('Export')}>
                <IconButton onClick={() => exportProject(projectName)} size="small">
                    <BiExport fontSize="20" />
                </IconButton>
            </Tooltip>
        </div>)}
        <IODialog
            title="Add project"
            action={() => props.addProject(addDialog)}
            actionTitle="Add project"
            ActionIcon={AddIcon}
            open={addDialog !== false}
            onClose={() => setAddDialog(false)}
        >
            <TextField value={addDialog} onChange={e => setAddDialog(e.target.value)} label={I18n.t('Project name')} />
        </IODialog>
        <ImportProjectDialog open={!!importDialog} onClose={() => setImportDialog(false)} />
    </IODialog>;
};

export default ProjectsManage;
