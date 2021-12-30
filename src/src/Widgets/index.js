import I18n from '@iobroker/adapter-react/i18n';
import {
    FormControl, InputLabel, MenuItem, Select, TextField, Tooltip, Typography, withStyles,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ToggleButton from '@material-ui/lab/ToggleButton';

import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';

import { useState } from 'react';
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
});

const Widgets = props => {
    const [small, setSmall] = useState(false);
    const [type, setType] = useState(false);

    return <>
        <Typography variant="h6" gutterBottom>
            {I18n.t('Add widget')}
            <Tooltip title={I18n.t('Small widgets')}>
                <ToggleButton className={props.classes.toggle} size="small" selected={small} onClick={() => setSmall(!small)}>
                    <ZoomOutIcon fontSize="small" />
                </ToggleButton>
            </Tooltip>
            <Tooltip title={I18n.t('Show type of widgets')}>
                <ToggleButton className={props.classes.toggle} size="small" selected={type} onClick={() => setType(!type)}>
                    <LocalOfferIcon fontSize="small" />
                </ToggleButton>
            </Tooltip>
        </Typography>
        <div>
            <Autocomplete
                freeSolo
                options={[]}
                renderInput={params => (
                    <TextField {...params} label={I18n.t('filter')} margin="normal" />
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
                Array(4).fill(null).map((value, key) => <Widget key={key} small={small} type={type} />)
            }
        </div>
    </>;
};

export default withStyles(styles)(Widgets);
