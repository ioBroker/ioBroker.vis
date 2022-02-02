import I18n from '@iobroker/adapter-react/i18n';
import {
    Button,
    Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { BiImport, BiExport } from 'react-icons/bi';

const ProjectsManage = props => {
    if (!props.projects) {
        return null;
    }
    return <Dialog open={props.open} onClose={props.onClose}>
        <DialogTitle>{I18n.t('Manage projects')}</DialogTitle>
        <DialogContent>
            <div>
                <IconButton onClick={() => props.addProject('new')}>
                    <AddIcon />
                </IconButton>
            </div>
            {props.projects.map(projectName => <div>
                <Button onClick={() => props.loadProject(projectName)}>{projectName}</Button>
                <IconButton onClick={() => props.deleteProject(projectName)}>
                    <DeleteIcon />
                </IconButton>
                <BiImport fontSize="20" />
                <BiExport fontSize="20" />
            </div>)}
        </DialogContent>
        <DialogActions></DialogActions>
    </Dialog>;
};

export default ProjectsManage;
