import { useState } from 'react';

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import {
    TextField,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import I18n from '@iobroker/adapter-react/i18n';
import { BiImport, BiExport } from 'react-icons/bi';

import ViewsManage from './ViewsManage';
import ToolbarItems from './ToolbarItems';
import IODialog from '../Components/IODialog';

const View = props => {
    const [viewsManage, setViewsManage] = useState(false);
    const [dialog, setDialog] = useState(null);
    const [dialogName, setDialogName] = useState('');
    const [dialogView, setDialogView] = useState(null);

    const toolbar = {
        name: `Views of ${props.projectName}`,
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
                type: 'icon-button', Icon: MenuIcon, name: 'Manage views', onClick: () => setViewsManage(true),
            },
        ],
    };

    const deleteView = () => {
        const view = dialogView || props.selectedView;
        const project = JSON.parse(JSON.stringify(props.project));
        delete project[view];
        props.changeView(Object.keys(project).filter(foundView => !foundView.startsWith('__'))[0]);
        props.changeProject(project);
        setDialog(null);
    };

    const addView = () => {
        const project = JSON.parse(JSON.stringify(props.project));
        const newProject = {
            name: dialogName,
            settings: {
                style: {},
            },
            widgets: {},
            activeWidgets: {},
        };
        project[dialogName] = newProject;
        props.changeProject(project);
        props.changeView(dialogName);
        setDialog(null);
    };

    const renameView = () => {
        const view = dialogView || props.selectedView;
        const project = JSON.parse(JSON.stringify(props.project));
        project[dialogName] = project[view];
        delete project[view];
        props.changeProject(project);
        props.changeView(dialogName);
        setDialog(null);
    };

    const copyView = () => {
        const view = dialogView || props.selectedView;
        const project = JSON.parse(JSON.stringify(props.project));
        project[dialogName] = project[view];
        props.changeProject(project);
        props.changeView(dialogName);
        setDialog(null);
    };

    const dialogTitles = {
        delete: `${I18n.t('Are you want to delete view ') + (dialogView || props.selectedView)}?`,
        copy: `${I18n.t('Copy view ') + (dialogView || props.selectedView)}`,
        rename: `${I18n.t('Rename view ') + (dialogView || props.selectedView)}`,
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

    const DialogIcon = dialogIcons[dialog];

    let dialogDisabled = false;
    if (dialog !== 'delete') {
        if (props.project[dialogName]) {
            dialogDisabled = true;
        }
    }

    const showDialog = (type, view) => {
        view = view || props.selectedView;

        const dialogDefaultName = {
            add: 'New view',
            rename: view,
            copy: `${view} ${I18n.t('Copy')}`,
        };

        setDialog(type);
        setDialogView(view);
        setDialogName(dialogDefaultName[type]);
    };

    return <>
        <ToolbarItems group={toolbar} {...props} />
        <IODialog
            title={dialogTitles[dialog]}
            actionTitle={dialogButtons[dialog]}
            open={!!dialog}
            onClose={() => {
                setDialog(null);
                setDialogView(null);
            }}
            ActionIcon={DialogIcon || null}
            action={dialogActions[dialog]}
            actionColor={dialog === 'delete' ? 'secondary' : 'primary'}
            actionDisabled={dialogDisabled}
        >
            {dialog === 'delete' ? null
                : <TextField label={dialogInputs[dialog]} value={dialogName} onChange={e => setDialogName(e.target.value)} /> }
        </IODialog>
        <ViewsManage open={viewsManage} onClose={() => setViewsManage(false)} showDialog={showDialog} {...props} />
    </>;
};

export default View;
