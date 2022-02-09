import I18n from '@iobroker/adapter-react/i18n';
import {
    Button,
    Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField,
} from '@material-ui/core';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { BiImport, BiExport } from 'react-icons/bi';
import { useState } from 'react';
import IODialog from '../Components/IODialog';

const ProjectsManage = props => {
    const [addDialog, setAddDialog] = useState(false);

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

    return <IODialog open={props.open} onClose={props.onClose} title="Manage projects">
        <div>
            <IconButton onClick={() => setAddDialog('')}>
                <AddIcon />
            </IconButton>
        </div>
        {props.projects.map(projectName => <div>
            <Button onClick={() => props.loadProject(projectName)}>{projectName}</Button>
            <IconButton onClick={() => props.deleteProject(projectName)} size="small">
                <DeleteIcon />
            </IconButton>
            <IconButton size="small">
                <BiImport fontSize="20" />
            </IconButton>
            <IconButton onClick={() => exportProject(projectName)} size="small">
                <BiExport fontSize="20" />
            </IconButton>
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
    </IODialog>;
};

export default ProjectsManage;
