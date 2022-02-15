import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

import {
    TextField,
} from '@material-ui/core';
import I18n from '@iobroker/adapter-react/i18n';

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

import IODialog from '../../Components/IODialog';

const ProjectDialog = props => {
    if (!props.dialog) {
        return null;
    }

    const dialogTitles = {
        delete: `${I18n.t('Are you want to delete project ') + props.dialogProject}?`,
        rename: `${I18n.t('Rename project ') + props.dialogProject}`,
        add: I18n.t('Add project '),
    };

    const dialogButtons = {
        delete: I18n.t('Delete'),
        rename: I18n.t('Rename'),
        add: I18n.t('Add'),
    };

    const addProject = () => {
        props.addProject(props.dialogName);
    };

    const deleteProject = () => {
        props.deleteProject(props.dialogProject);
    };

    const renameProject = () => {
        props.renameProject(props.dialogProject, props.dialogName);
    };

    const dialogActions = {
        delete: deleteProject,
        rename: renameProject,
        add: addProject,
    };

    const dialogInputs = {
        rename: I18n.t('New name'),
        add: I18n.t('Name'),
    };

    const dialogIcons = {
        delete: DeleteIcon,
        rename: EditIcon,
        add: AddIcon,
    };

    const DialogIcon = dialogIcons[props.dialog];

    let dialogDisabled = false;
    if (props.dialog !== 'delete') {
        dialogDisabled = props.dialogName === '' || props.projects.includes(props.dialogName);
    }

    return <IODialog
        title={dialogTitles[props.dialog]}
        actionTitle={dialogButtons[props.dialog]}
        open={!!props.dialog}
        onClose={() => {
            props.setDialog(null);
            props.setDialogProject(null);
        }}
        ActionIcon={DialogIcon || null}
        action={dialogActions[props.dialog]}
        actionColor={props.dialog === 'delete' ? 'secondary' : 'primary'}
        actionDisabled={dialogDisabled}
    >
        {props.dialog === 'delete' ? null
            : <TextField
                label={dialogInputs[props.dialog]}
                fullWidth
                value={props.dialogName}
                onChange={e => props.setDialogName(e.target.value)}
            /> }
    </IODialog>;
};

ProjectDialog.propTypes = {
    changeProject: PropTypes.func,
    dialog: PropTypes.string,
    dialogProject: PropTypes.string,
    dialogName: PropTypes.string,
    setDialog: PropTypes.func,
    setDialogProject: PropTypes.func,
    setDialogName: PropTypes.func,
};

export default ProjectDialog;
