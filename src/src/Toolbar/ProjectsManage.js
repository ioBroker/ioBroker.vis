import I18n from '@iobroker/adapter-react/i18n';
import {
    Dialog, DialogActions, DialogContent, DialogTitle,
} from '@material-ui/core';

import DeleteIcon from '@material-ui/icons/Delete';
import { BiImport, BiExport } from 'react-icons/bi';

const ProjectsManage = props => {
    if (!props.projects) {
        return null;
    }
    return <Dialog open={props.open} onClose={props.onClose}>
        <DialogTitle>{I18n.t('Manage projects')}</DialogTitle>
        <DialogContent>
            {props.projects.map(projectName => <div onClick={() => props.loadProject(projectName)}>
                <span>{projectName}</span>
                <DeleteIcon />
                <BiImport />
                <BiExport />
            </div>)}
        </DialogContent>
        <DialogActions></DialogActions>
    </Dialog>;
};

export default ProjectsManage;
