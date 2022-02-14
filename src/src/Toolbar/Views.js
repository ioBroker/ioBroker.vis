import PropTypes from 'prop-types';
import { useState } from 'react';

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

import MenuIcon from '@material-ui/icons/Menu';
import I18n from '@iobroker/adapter-react/i18n';

import { withStyles } from '@material-ui/core';
import ViewsManage from './ViewsManage';
import ToolbarItems from './ToolbarItems';

import ViewDialog from './ViewsManage/ViewDialog';

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

const View = props => {
    const [dialog, setDialog] = useState(null);
    const [dialogName, setDialogName] = useState('');
    const [dialogView, setDialogView] = useState(null);

    const toolbar = {
        name: <span className={props.classes.label}>
            <span>{I18n.t('Views of ')}</span>
            <span
                className={props.classes.projectLabel}
                onClick={() => props.setProjectsDialog(true)}
            >
                {props.projectName}
            </span>
        </span>,
        items: [
            {
                type: 'icon-button', Icon: AddIcon, name: 'Add new view', onClick: () => showDialog('add'),
            },
            [[
                {
                    type: 'icon-button', Icon: EditIcon, name: 'Rename view', onClick: () => showDialog('rename'),
                },
            ], [
                {
                    type: 'icon-button', Icon: DeleteIcon, name: 'Delete actual view', onClick: () => showDialog('delete'),
                },
            ]],
            {
                type: 'icon-button', Icon: MenuIcon, name: 'Manage views', onClick: () => props.setViewsManage(true),
            },
        ],
    };

    const showDialog = (type, view) => {
        view = view || props.selectedView;

        const dialogDefaultName = {
            add: 'New view',
            rename: view,
            copy: `${view} ${I18n.t('Copy noun')}`,
        };

        setDialog(type);
        setDialogView(view);
        setDialogName(dialogDefaultName[type]);
    };

    return <>
        <ToolbarItems group={toolbar} {...props} />
        <ViewDialog
            dialog={dialog}
            dialogView={dialogView}
            dialogName={dialogName}
            setDialog={setDialog}
            setDialogView={setDialogView}
            setDialogName={setDialogName}
            {...props}
        />
        <ViewsManage open={props.viewsManage} onClose={() => props.setViewsManage(false)} showDialog={showDialog} {...props} />
    </>;
};

View.propTypes = {
    projectName: PropTypes.string,
    selectedView: PropTypes.string,
    setViewsManage: PropTypes.func,
    viewsManage: PropTypes.bool,
};

export default withStyles(styles)(View);
