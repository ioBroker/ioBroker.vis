import PropTypes from 'prop-types';

import {
    TextField,
} from '@mui/material';
import I18n from '@iobroker/adapter-react-v5/i18n';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import IODialog from '../../Components/IODialog';
import { useFocus } from '../../Utils';

const ProjectDialog = props => {
    const inputField = useFocus(props.dialog && props.dialog !== 'delete', props.dialog === 'add');

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
                variant="standard"
                label={dialogInputs[props.dialog]}
                inputRef={inputField}
                fullWidth
                value={props.dialogName}
                onChange={e => props.setDialogName(e.target.value)}
            /> }
    </IODialog>;
};

ProjectDialog.propTypes = {
    dialog: PropTypes.string,
    dialogProject: PropTypes.string,
    dialogName: PropTypes.string,
    setDialog: PropTypes.func,
    setDialogProject: PropTypes.func,
    setDialogName: PropTypes.func,
};

export default ProjectDialog;
