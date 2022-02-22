import {
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip,
} from '@mui/material';

import withStyles from '@mui/styles/withStyles';

import I18n from '@iobroker/adapter-react-v5/i18n';

const styles = () => ({
    text: { paddingRight: 4 },
    button: { margin: 4 },
    textInput: { margin: '0px 4px', width: 120 },
});

const ToolbarItems = props => {
    const view = props.project[props.selectedView];

    return props.items.map((item, key) => {
        if (item.hide) {
            return null;
        }

        let value = view ? view.settings[item.field] : null;
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
                <InputLabel shrink>{I18n.t(item.name)}</InputLabel>
                <Select
                    style={{ width: item.width }}
                    value={item.value ? item.value : value}
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
                    size="small"
                />}
                label={I18n.t(item.name)}
            />;
        }
        if (item.type === 'icon-button') {
            return <Tooltip title={item.name} key={key}>
                <IconButton size="small" key={key} onClick={item.onClick}>
                    <item.Icon fontSize={item.size ? item.size : 'small'} />
                </IconButton>
            </Tooltip>;
        }
        if (item.type === 'text') {
            return <span key={key} className={props.classes.text}>{`${I18n.t(item.text)}:`}</span>;
        }
        if (item.type === 'button') {
            return <Button
                key={key}
                variant="outlined"
                onClick={item.onClick}
                size="small"
                className={props.classes.button}
            >
                {I18n.t(item.name)}
            </Button>;
        }
        if (item.type === 'divider') {
            return <Divider key={key} orientation="vertical" flexItem style={{ margin: '0px 10px' }} />;
        }
        return <TextField
            key={key}
            value={value}
            type={item.type}
            onChange={item.onChange ? item.onChange : e => change(e.target.value)}
            InputLabelProps={{
                shrink: true,
            }}
            label={I18n.t(item.name)}
            className={props.classes.textInput}
        />;
    });
};

export default withStyles(styles)(ToolbarItems);
