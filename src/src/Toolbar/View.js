import {
    Button,
    Divider,
    FormControl, InputLabel, MenuItem, Select,
    IconButton,
} from '@material-ui/core';

import I18n from '@iobroker/adapter-react/i18n';

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';

const viewButtons = [
    { icon: <AddIcon /> },
    { icon: <EditIcon /> },
    { icon: <DeleteIcon /> },
    { icon: <FileCopyIcon /> },
];

const View = props => <div className={props.classes.toolbar}>
    <FormControl>
        <InputLabel>{I18n.t('Active view')}</InputLabel>
        <Select
            value={props.selectedView}
        >
            { Object.keys(props.project)
                .filter(view => !view.startsWith('__'))
                .map(view => <MenuItem
                    value={view}
                    onClick={() => props.changeView(view)}
                    key={view}
                >
                    {I18n.t(view)}
                </MenuItem>)}
        </Select>
    </FormControl>
    {viewButtons.map((button, key) => <IconButton size="small" key={key}>{button.icon}</IconButton>)}
    <Divider orientation="vertical" flexItem />
    <Button>{I18n.t('Export Item')}</Button>
    <Button>{I18n.t('Import Item')}</Button>
</div>;

export default View;
