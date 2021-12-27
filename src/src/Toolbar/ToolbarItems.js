import {
    Button,
    Checkbox, Divider, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, TextField,
} from '@material-ui/core';

import I18n from '@iobroker/adapter-react/i18n';

const ToolbarItems = props => {
    const view = props.project[props.selectedView];

    return props.items.map((item, key) => {
        let value = view.settings[item.field];
        if (item.field && (value === null || value === undefined)) {
            value = '';
        }

        const change = changeValue => {
            if (!item.field) {
                return;
            }
            const project = JSON.parse(JSON.stringify(props.project));
            project[props.selectedView].settings[item.field] = changeValue;

            props.changeProject(project);
        };

        if (item.type === 'select') {
            return <FormControl key={key} style={{ margin: '0px 10px' }}>
                <InputLabel>{I18n.t(item.name)}</InputLabel>
                <Select
                    style={{ width: item.width }}
                    value={value}
                    onChange={item.onChange ? item.onChange : e => change(e.target.value)}
                >
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
                control={<Checkbox
                    checked={value}
                    onChange={item.onChange ? item.onChange : e => change(e.target.checked)}
                />}
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
        return <TextField
            key={key}
            value={value}
            onChange={item.onChange ? item.onChange : e => change(e.target.value)}
            label={I18n.t(item.name)}
        />;
    });
};

export default ToolbarItems;
