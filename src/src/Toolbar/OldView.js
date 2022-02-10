import { useState } from 'react';

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import { TextField } from '@material-ui/core';
import I18n from '@iobroker/adapter-react/i18n';
import ToolbarItems from './OldToolbarItems';
import IODialog from '../Components/IODialog';

const View = props => {
    const [dialog, setDialog] = useState(null);
    const [dialogName, setDialogName] = useState('');

    const toolbar = [
        {
            type: 'select',
            name: 'Active view',
            value: props.selectedView,
            onChange: event => props.changeView(event.target.value),
            width: 120,
            items: Object.keys(props.project)
                .filter(view => !view.startsWith('__'))
                .map(view => ({ name: view, value: view })),
        },
        {
            type: 'icon-button', Icon: AddIcon, name: 'Add new view', onClick: () => showDialog('add'),
        },
        {
            type: 'icon-button', Icon: EditIcon, name: 'Rename view', onClick: () => showDialog('rename'),
        },
        {
            type: 'icon-button', Icon: DeleteIcon, name: 'Delete actual view', onClick: () => showDialog('delete'),
        },
        {
            type: 'icon-button', Icon: FileCopyIcon, name: 'Copy view', onClick: () => showDialog('copy'),
        },
        { type: 'divider' },
        { type: 'button', name: 'Export item' },
        { type: 'button', name: 'Import item' },
    ];

    const deleteView = () => {
        const project = JSON.parse(JSON.stringify(props.project));
        delete project[props.selectedView];
        props.changeView(Object.keys(project).filter(view => !view.startsWith('__'))[0]);
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
        const project = JSON.parse(JSON.stringify(props.project));
        project[dialogName] = project[props.selectedView];
        delete project[props.selectedView];
        props.changeProject(project);
        props.changeView(dialogName);
        setDialog(null);
    };

    const copyView = () => {
        const project = JSON.parse(JSON.stringify(props.project));
        project[dialogName] = project[props.selectedView];
        props.changeProject(project);
        props.changeView(dialogName);
        setDialog(null);
    }; const dialogTitles = {
        delete: `${I18n.t('Are you want to delete view ') + props.selectedView}?`,
        copy: `${I18n.t('Copy view ') + props.selectedView}`,
        rename: `${I18n.t('Rename view ') + props.selectedView}`,
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

    const dialogDefaultName = {
        add: 'New view',
        rename: props.selectedView,
        copy: `${props.selectedView} ${I18n.t('Copy')}`,
    };

    const showDialog = type => {
        setDialog(type);
        setDialogName(dialogDefaultName[type]);
    };

    return <div className={props.classes.toolbar}>
        <ToolbarItems items={toolbar} {...props} />
        <IODialog
            title={dialogTitles[dialog]}
            actionTitle={dialogButtons[dialog]}
            open={!!dialog}
            onClose={() => setDialog(null)}
            ActionIcon={DialogIcon || null}
            action={dialogActions[dialog]}
            actionColor={dialog === 'delete' ? 'secondary' : 'primary'}
            actionDisabled={dialogDisabled}
        >
            {dialog === 'delete' ? null
                : <TextField label={dialogInputs[dialog]} value={dialogName} onChange={e => setDialogName(e.target.value)} /> }
        </IODialog>
    </div>;
};

export default View;
