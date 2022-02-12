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

const FolderDialog = props => {
    if (!props.dialog) {
        return null;
    }

    const folderObject = props.project.___settings.folders.find(folder => folder.id === props.dialogFolder);

    const dialogTitles = {
        delete: `${I18n.t('Are you want to delete folder ') + folderObject?.name}?`,
        rename: `${I18n.t('Rename folder ') + folderObject?.name}`,
        add: props.dialogParentId ? I18n.t('Add subfolder ') : I18n.t('Add folder '),
    };

    const dialogButtons = {
        delete: I18n.t('Delete'),
        rename: I18n.t('Rename'),
        add: I18n.t('Add'),
    };

    const addFolder = () => {
        const project = JSON.parse(JSON.stringify(props.project));
        project.___settings.folders.push({
            id: uuidv4(),
            name: props.dialogName,
            parentId: props.dialogParentId,
        });
        props.changeProject(project);
    };

    const deleteFolder = () => {
        const project = JSON.parse(JSON.stringify(props.project));
        project.___settings.folders.splice(project.___settings.folders.findIndex(folder => folder.id === props.dialogFolder), 1);
        props.changeProject(project);
    };

    const renameFolder = () => {
        const project = JSON.parse(JSON.stringify(props.project));
        project.___settings.folders.find(folder => folder.id === props.dialogFolder).name = props.dialogName;
        props.changeProject(project);
    };

    const dialogActions = {
        delete: deleteFolder,
        rename: renameFolder,
        add: addFolder,
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
        dialogDisabled = props.dialogName === '' || props.dialogName === folderObject?.name;
    }

    return <IODialog
        title={dialogTitles[props.dialog]}
        actionTitle={dialogButtons[props.dialog]}
        open={!!props.dialog}
        onClose={() => {
            props.setDialog(null);
            props.setDialogFolder(null);
        }}
        ActionIcon={DialogIcon || null}
        action={dialogActions[props.dialog]}
        actionColor={props.dialog === 'delete' ? 'secondary' : 'primary'}
        actionDisabled={dialogDisabled}
    >
        {props.dialog === 'delete' ? null
            : <TextField
                label={dialogInputs[props.dialog]}
                value={props.dialogName}
                onChange={e => props.setDialogName(e.target.value)}
            /> }
    </IODialog>;
};

FolderDialog.propTypes = {
    changeProject: PropTypes.func,
    dialog: PropTypes.string,
    dialogFolder: PropTypes.string,
    dialogName: PropTypes.string,
    dialogParentId: PropTypes.string,
    project: PropTypes.object,
    setDialog: PropTypes.func,
    setDialogFolder: PropTypes.func,
    setDialogName: PropTypes.func,
};

export default FolderDialog;