import React from 'react';

import {
    TextField,
} from '@mui/material';

import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';

import { I18n } from '@iobroker/adapter-react-v5';

import IODialog from '../../Components/IODialog';
import { useFocus } from '../../Utils';

interface ProjectDialogProps {
    dialog: 'delete' | 'rename' | 'add';
    dialogProject: string;
    dialogName: string;
    projects: string[];
    setDialog: (dialog: null | 'delete' | 'rename' | 'add') => void;
    setDialogProject: (project: null | string) => void;
    setDialogName: (name: string) => void;
    addProject: (name: string) => void;
    deleteProject: (project: string) => void;
    renameProject: (project: string, name: string) => void;
}

const ProjectDialog:React.FC<ProjectDialogProps> = props => {
    const inputField = useFocus(props.dialog && props.dialog !== 'delete', props.dialog === 'add');

    if (!props.dialog) {
        return null;
    }

    const dialogTitles = {
        delete: I18n.t('Do you want to delete project "%s"?', props.dialogProject),
        rename: I18n.t('Rename project "%s"', props.dialogProject),
        add: I18n.t('Add project'),
    };

    const dialogButtons = {
        delete: I18n.t('Delete'),
        rename: I18n.t('Rename'),
        add: I18n.t('Add'),
    };

    const addProject = () => props.addProject(props.dialogName);

    const deleteProject = () => props.deleteProject(props.dialogProject);

    const renameProject = () => props.renameProject(props.dialogProject, props.dialogName);

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
        noTranslation
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

export default ProjectDialog;
