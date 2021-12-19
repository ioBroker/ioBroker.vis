import {
    Button,
    Divider,
    FormControl, InputLabel, MenuItem, Select,
} from '@material-ui/core';

import I18n from '@iobroker/adapter-react/i18n';

const View = props => <div>
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
                >
                    {I18n.t(view)}
                </MenuItem>)}
        </Select>
    </FormControl>
    <Divider orientation="vertical" flexItem />
    <Button>{I18n.t('Export Item')}</Button>
    <Button>{I18n.t('Import Item')}</Button>
</div>;

export default View;
