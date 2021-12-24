import {
    Button,
    Checkbox, Divider, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, TextField,
} from '@material-ui/core';

import I18n from '@iobroker/adapter-react/i18n';

const ToolbarItems = props => props.items.map((item, key) => {
    if (item.type === 'select') {
        return <FormControl key={key} style={{ margin: '0px 10px' }}>
            <InputLabel>{I18n.t(item.name)}</InputLabel>
            <Select value={item.value} onChange={item.onChange}>
                {item.items.map(selectItem => <MenuItem
                    value={selectItem.value}
                    key={selectItem.value}
                >
                    {I18n.t(selectItem.name)}
                </MenuItem>)}
            </Select>
        </FormControl>;
    }
    if (item.type === 'checkbox') {
        return <FormControlLabel
            key={key}
            control={<Checkbox />}
            label={I18n.t(item.name)}
        />;
    }
    if (item.type === 'icon-button') {
        return <IconButton size="small" key={key}><item.Icon fontSize="small" /></IconButton>;
    }
    if (item.type === 'text') {
        return <span key={key}>{I18n.t(item.text)}</span>;
    }
    if (item.type === 'button') {
        return <Button key={key}>{I18n.t(item.name)}</Button>;
    }
    if (item.type === 'divider') {
        return <Divider key={key} orientation="vertical" flexItem style={{ margin: '0px 10px' }} />;
    }
    return <TextField key={key} label={I18n.t(item.name)} />;
});

export default ToolbarItems;
