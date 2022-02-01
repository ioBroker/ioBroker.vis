import I18n from '@iobroker/adapter-react/i18n';
import {
    Dialog, DialogActions, DialogContent, DialogTitle,
} from '@material-ui/core';

const ProjectsManage = props => {
    if (!props.projects) {
        return null;
    }
    return <Dialog open={props.open} onClose={props.onClose}>
        <DialogTitle>{I18n.t('Manage projects')}</DialogTitle>
        <DialogContent>
            {props.projects.map(projectName => <div>{projectName}</div>)}
        </DialogContent>
        <DialogActions></DialogActions>
    </Dialog>;
};

export default ProjectsManage;
