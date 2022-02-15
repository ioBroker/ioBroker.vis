import PropTypes from 'prop-types';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import {
    TextField,
} from '@material-ui/core';
import I18n from '@iobroker/adapter-react/i18n';

import IODialog from '../../Components/IODialog';

const ViewDialog = props => {
    const deleteView = () => {
        const view = props.dialogView || props.selectedView;
        const project = JSON.parse(JSON.stringify(props.project));
        delete project[view];
        props.changeView(Object.keys(project).filter(foundView => !foundView.startsWith('__'))[0]);
        props.changeProject(project);
        props.setDialog(null);
    };

    const addView = () => {
        const project = JSON.parse(JSON.stringify(props.project));
        const newProject = {
            name: props.dialogName,
            parentId: props.dialogParentId,
            settings: {
                style: {},
            },
            widgets: {},
            activeWidgets: {},
        };
        project[props.dialogName] = newProject;
        props.changeProject(project);
        props.changeView(props.dialogName);
        props.setDialog(null);
    };

    const renameView = () => {
        const view = props.dialogView || props.selectedView;
        const project = JSON.parse(JSON.stringify(props.project));
        project[props.dialogName] = project[view];
        delete project[view];
        props.changeProject(project);
        props.changeView(props.dialogName);
        props.setDialog(null);
    };

    const copyView = () => {
        const view = props.dialogView || props.selectedView;
        const project = JSON.parse(JSON.stringify(props.project));
        project[props.dialogName] = project[view];
        props.changeProject(project);
        props.changeView(props.dialogName);
        props.setDialog(null);
    };

    const dialogTitles = {
        delete: `${I18n.t('Are you want to delete view ') + (props.dialogView || props.selectedView)}?`,
        copy: `${I18n.t('Copy view ') + (props.dialogView || props.selectedView)}`,
        rename: `${I18n.t('Rename view ') + (props.dialogView || props.selectedView)}`,
        add: I18n.t('Add view '),
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
        if (props.project[props.dialogName]) {
            dialogDisabled = true;
        }
    }

    return <IODialog
        title={dialogTitles[props.dialog]}
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
    project: PropTypes.object,
    selectedView: PropTypes.string,
    setDialog: PropTypes.func,
    setDialogName: PropTypes.func,
    setDialogView: PropTypes.func,
};

export default ViewDialog;
