import { useState, useCallback, useEffect } from 'react';
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
                console.log(file.name);
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

    return <IODialog
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
                label={I18n.t('Project name')}
                value={projectName}
                onChange={e => setProjectName(e.target.value.replace(/[^0-9a-zA-Z\-_.]/, ''))}
            />
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
            <Tooltip title={I18n.t('Add')} size="small">
                <IconButton onClick={() => setAddDialog('')}>
                    <AddIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title={I18n.t('Import')}>
                <IconButton size="small">
                    <BiImport fontSize="20" onClick={() => setImportDialog('')} />
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
        <ImportProjectDialog
            open={importDialog !== false}
            onClose={() => setImportDialog(false)}
            projectName={importDialog}
            socket={props.socket}
            refreshProjects={props.refreshProjects}
        />
    </IODialog>;
};

export default ProjectsManage;
