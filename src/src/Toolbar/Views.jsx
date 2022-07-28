import PropTypes from 'prop-types';
import { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import MenuIcon from '@mui/icons-material/Menu';
import I18n from '@iobroker/adapter-react-v5/i18n';

import withStyles from '@mui/styles/withStyles';
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
    const [dialogParentId, setDialogParentId] = useState(null);

    const showDialog = (type, view, parentId) => {
        view = view || props.selectedView;

        const dialogDefaultName = {
            add: 'New view',
            rename: view,
            copy: `${view} ${I18n.t('Copy noun')}`,
        };

        setDialog(type);
        setDialogView(view);
        setDialogParentId(parentId);
        setDialogName(dialogDefaultName[type]);
    };

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
                type: 'icon-button', Icon: AddIcon, name: 'Add new view', onClick: () => showDialog('add'), disabled: !!props.selectedGroup,
            },
            [
                [
                    {
                        type: 'icon-button', Icon: EditIcon, name: 'Rename view', onClick: () => showDialog('rename'), disabled: !!props.selectedGroup,
                    },
                ],
                [
                    {
                        type: 'icon-button', Icon: DeleteIcon, name: 'Delete actual view', onClick: () => showDialog('delete'), disabled: !!props.selectedGroup,
                    },
                ],
            ],
            {
                type: 'icon-button', Icon: MenuIcon, name: 'Manage views', onClick: () => props.setViewsManage(true), disabled: !!props.selectedGroup,
            },
        ],
    };

    return <>
        <ToolbarItems group={toolbar} {...props} classes={{}} />
        <ViewsManage open={props.viewsManage} onClose={() => props.setViewsManage(false)} showDialog={showDialog} {...props} classes={{}} />
        <ViewDialog
            dialog={dialog}
            dialogView={dialogView}
            dialogName={dialogName}
            dialogParentId={dialogParentId}
            setDialog={setDialog}
            setDialogView={setDialogView}
            setDialogName={setDialogName}
            setDialogParentId={setDialogParentId}
            classes={{}}
            {...props}
        />
    </>;
};

View.propTypes = {
    projectName: PropTypes.string,
    selectedView: PropTypes.string,
    setViewsManage: PropTypes.func,
    viewsManage: PropTypes.bool,
    selectedGroup: PropTypes.string,
};

export default withStyles(styles)(View);
