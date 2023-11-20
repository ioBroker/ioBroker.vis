import PropTypes from 'prop-types';
import { useState } from 'react';

import Tooltip from '@mui/material/Tooltip';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuIcon from '@mui/icons-material/Menu';

import { I18n } from '@iobroker/adapter-react-v5';

import withStyles from '@mui/styles/withStyles';
import ViewsManager from './ViewsManager';
import ToolbarItems from './ToolbarItems';

import ViewDialog from './ViewsManager/ViewDialog';
import { store } from '../Store';

const styles = () => ({
    label: {
        maxWidth: 180,
        textOverflow: 'ellipsis',
        display: 'inline-block',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    projectLabel: {
        cursor: 'pointer',
        fontWeight: 'bold',
    },
});

const Views = props => {
    const [dialog, setDialog] = useState(null);
    const [dialogCallback, setDialogCallback] = useState(null);
    const [dialogName, setDialogName] = useState('');
    const [dialogView, setDialogView] = useState(null);
    const [dialogParentId, setDialogParentId] = useState(null);

    const showDialog = (type, view, parentId, cb) => {
        view = view || props.selectedView;

        const dialogDefaultName = {
            add: I18n.t('New view'),
            rename: view,
            copy: `${view} ${I18n.t('Copy noun')}`,
        };

        setDialog(type);
        setDialogView(view);
        setDialogParentId(parentId);
        setDialogName(dialogDefaultName[type]);
        setDialogCallback(cb ? { cb } : null);
    };

    const toolbar = {
        name: <span className={props.classes.label}>
            <Tooltip title={I18n.t('Current project')}>
                <span
                    className={props.classes.projectLabel}
                    onClick={() => props.setProjectsDialog(true)}
                >
                    {props.projectName}
                </span>
            </Tooltip>
        </span>,
        items: [
            {
                type: 'icon-button', Icon: AddIcon, name: 'Add new view', onClick: () => showDialog('add'), disabled: !!props.selectedGroup || !props.editMode,
            },
            [
                [
                    {
                        type: 'icon-button', Icon: EditIcon, name: 'Rename view', onClick: () => showDialog('rename'), disabled: !!props.selectedGroup || !props.editMode,
                    },
                ],
                [
                    {
                        type: 'icon-button', Icon: DeleteIcon, name: 'Delete actual view', onClick: () => showDialog('delete'), disabled: !!props.selectedGroup || !props.editMode,
                    },
                ],
            ],
            {
                type: 'icon-button', Icon: MenuIcon, name: 'Manage views', onClick: () => props.setViewsManager(true), disabled: !!props.selectedGroup,
            },
        ],
    };

    return <>
        <ToolbarItems group={toolbar} {...props} classes={{}} />
        <ViewsManager open={props.viewsManager} onClose={() => props.setViewsManager(false)} showDialog={showDialog} {...props} classes={{}} />
        <ViewDialog
            dialog={dialog}
            dialogView={dialogView}
            dialogName={dialogName}
            dialogCallback={dialogCallback}
            noTranslation
            dialogParentId={dialogParentId}
            setDialog={setDialog}
            setDialogView={setDialogView}
            setDialogName={setDialogName}
            setDialogParentId={setDialogParentId}
            classes={{}}
            project={store.getState().visProject}
        />
    </>;
};

Views.propTypes = {
    projectName: PropTypes.string,
    selectedView: PropTypes.string,
    setViewsManager: PropTypes.func,
    viewsManager: PropTypes.bool,
    selectedGroup: PropTypes.string,
    editMode: PropTypes.bool,
};

export default withStyles(styles)(Views);
