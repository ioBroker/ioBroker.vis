import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import ToolbarItems from './ToolbarItems';

const View = props => {
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
        { type: 'icon-button', Icon: AddIcon },
        { type: 'icon-button', Icon: EditIcon },
        { type: 'icon-button', Icon: DeleteIcon },
        { type: 'icon-button', Icon: FileCopyIcon },
        { type: 'divider' },
        { type: 'button', name: 'Export item' },
        { type: 'button', name: 'Import item' },
    ];

    return <div className={props.classes.toolbar}>
        <ToolbarItems items={toolbar} {...props} />
    </div>;
};

export default View;
