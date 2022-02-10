import I18n from '@iobroker/adapter-react/i18n';
import {
    FormControl, InputLabel, MenuItem, Select, TextField, Typography, withStyles,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import Widget from './Widget';

const selectItems = [
    { value: 'all', name: '*' },
    { value: 'basic', name: 'basic' },
    { value: 'echarts', name: 'echarts' },
    { value: 'eventlist', name: 'eventlist' },
    { value: 'info', name: 'info' },
    { value: 'jqplot', name: 'jqplot' },
    { value: 'jqui', name: 'jqui' },
    { value: 'swipe', name: 'swipe' },
    { value: 'tabs', name: 'tabs' },
];

const styles = () => ({
    widgets: { textAlign: 'center' },
    toggle: { width: 30, height: 30 },
    right: {
        float: 'right',
    },
    button: {
        padding: '0px 4px',
    },
});

const Widgets = props => <>
    <Typography variant="h6" gutterBottom>
        {I18n.t('Add widget')}
    </Typography>
    <div>
        <Autocomplete
            freeSolo
            options={[]}
            renderInput={params => (
                <TextField {...params} label={I18n.t('filter')} />
            )}
        />
    </div>
    <div>
        <FormControl fullWidth>
            <InputLabel>{I18n.t('type')}</InputLabel>
            <Select>
                {selectItems.map(selectItem => <MenuItem
                    value={selectItem.value}
                    key={selectItem.value}
                >
                    {I18n.t(selectItem.name)}
                </MenuItem>)}
            </Select>
        </FormControl>
    </div>
    <div className={props.classes.widgets}>
        {
            Array(4).fill(null).map((value, key) => <Widget key={key} />)
        }
    </div>
</>;

export default withStyles(styles)(Widgets);
