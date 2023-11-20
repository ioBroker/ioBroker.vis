import PropTypes from 'prop-types';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';

import {
    TextField,
} from '@mui/material';
import I18n from '@iobroker/adapter-react-v5/i18n';

import IODialog from '../../Components/IODialog';
import { useFocus } from '../../Utils';
import { store } from '../../Store';

const ViewDialog = props => {
    const inputField = useFocus(!!props.dialog && props.dialog !== 'delete', props.dialog === 'add');

    const deleteView = async () => {
        const view = props.dialogView || props.selectedView;
        const project = JSON.parse(JSON.stringify(store.getState().visProject));
        delete project[view];
        await props.changeView(Object.keys(project).filter(foundView => !foundView.startsWith('__'))[0]);
        await props.changeProject(project);
        props.setDialog(null); // close dialog
    };

    const addView = async () => {
        const project = JSON.parse(JSON.stringify(store.getState().visProject));
        project[props.dialogName] = {
            name: props.dialogName,
            parentId: props.dialogParentId,
            settings: {
                style: {},
            },
            widgets: {},
            activeWidgets: {},
        };
        await props.changeProject(project);
        await props.changeView(props.dialogName);
        props.setDialog(null); // close dialog
        props.dialogCallback?.cb(props.dialogName);
    };

    const renameView = async () => {
        const view = props.dialogView || props.selectedView;
        const project = JSON.parse(JSON.stringify(store.getState().visProject));
        project[props.dialogName] = project[view];
        delete project[view];
        await props.changeProject(project);
        await props.changeView(props.dialogName);
        props.setDialog(null);
        props.dialogCallback?.cb(props.dialogName);
    };

    const copyView = async () => {
        const view = props.dialogView || props.selectedView;
        const project = JSON.parse(JSON.stringify(store.getState().visProject));
        project[props.dialogName] = project[view];
        await props.changeProject(project);
        await props.changeView(props.dialogName);
        props.setDialog(null);
        props.dialogCallback?.cb(props.dialogName);
    };

    const dialogTitles = {
        delete: I18n.t('Do you want to delete view "%s"?', props.dialogView || props.selectedView),
        copy: I18n.t('Copy view "%s"', props.dialogView || props.selectedView),
        rename: I18n.t('Rename view "%s"', props.dialogView || props.selectedView),
        add: I18n.t('Add view'),
    };

    const dialogButtons = {
        delete: I18n.t('Delete'),
        copy: I18n.t('Create copy'),
        rename: I18n.t('Rename'),
        add: I18n.t('Add'),
    };

    const dialogActions = {
        delete: deleteView,
        copy: copyView,
        rename: renameView,
        add: addView,
    };

    const dialogInputs = {
        copy: I18n.t('Name of copy'),
        rename: I18n.t('New name'),
        add: I18n.t('Name'),
    };

    const dialogIcons = {
        delete: DeleteIcon,
        copy: FileCopyIcon,
        rename: EditIcon,
        add: AddIcon,
    };

    const DialogIcon = dialogIcons[props.dialog];

    let dialogDisabled = false;
    if (props.dialog !== 'delete') {
        if (store.getState().visProject[props.dialogName]) {
            dialogDisabled = true;
        }
    }

    if (!props.dialog) {
        return null;
    }

    return <IODialog
        title={dialogTitles[props.dialog]}
        noTranslation={props.noTranslation}
        actionTitle={dialogButtons[props.dialog]}
        open={!!props.dialog}
        onClose={() => {
            props.setDialog(null);
            props.setDialogView(null);
            props.setDialogParentId(null);
        }}
        ActionIcon={DialogIcon || null}
        action={dialogActions[props.dialog]}
        actionColor={props.dialog === 'delete' ? 'secondary' : 'primary'}
        actionDisabled={dialogDisabled}
    >
        {props.dialog === 'delete' ? null
            : <TextField
                inputRef={inputField}
                variant="standard"
                label={dialogInputs[props.dialog]}
                fullWidth
                value={props.dialogName}
                onChange={e => props.setDialogName(e.target.value)}
            /> }
    </IODialog>;
};

ViewDialog.propTypes = {
    changeProject: PropTypes.func,
    changeView: PropTypes.func,
    dialog: PropTypes.string,
    dialogName: PropTypes.string,
    dialogView: PropTypes.string,
    dialogCallback: PropTypes.object,
    selectedView: PropTypes.string,
    setDialog: PropTypes.func,
    setDialogName: PropTypes.func,
    setDialogView: PropTypes.func,
};

export default ViewDialog;
