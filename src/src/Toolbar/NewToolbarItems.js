import {
    Button,
    ButtonBase,
    Checkbox, Divider, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, withStyles,
} from '@material-ui/core';

import MenuIcon from '@material-ui/icons/Menu';

import I18n from '@iobroker/adapter-react/i18n';

import widgetsToolbar from './NewWidgets';

const styles = () => ({
    text: { paddingRight: 4 },
    button: { margin: 4 },
    textInput: { margin: '0px 4px', width: 120 },
});

const getItem = (item, key, props, full) => {
    const view = props.project[props.selectedView];

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
        return full
            ? <div style={{ textAlign: 'center' }}>
                <ButtonBase style={{ flexDirection: 'column', width: 60, borderRadius: 4 }}>
                    <div><item.Icon fontSize={item.size ? item.size : 'small'} /></div>
                    <div>{I18n.t(item.name)}</div>
                </ButtonBase>
            </div>
            : <Tooltip title={item.name}>
                <IconButton size="small" key={key} onClick={item.onClick} style={{ height: full ? '100%' : null }}>
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
};

const NewToolbarItems = props.group => {
    const toolbar = [
        {
            name: 'Views',
            items: [
                {
                    type: 'icon-button', Icon: MenuIcon, name: 'Manage views',
                },
            ],
        },
        widgetsToolbar(props),
        {
            name: 'Projects',
            items: [
                {
                    type: 'icon-button', Icon: MenuIcon, name: 'Manage projects',
                },
            ],
        },
    ];
    return <div className={props.classes.toolbar} style={{ alignItems: 'initial' }}>
        {toolbar.map((group, groupKey) => <div
            key={groupKey}
            style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', borderStyle: 'solid', borderWidth: 1,
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
                {
                    group.items.map((item, key) => {
                        if (Array.isArray(item)) {
                            return <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
                                {item.map((subItem, subKey) => <div key={subKey} style={{ display: 'flex', flexDirection: 'row' }}>
                                    {subItem.map((subItem2, subKey2) => getItem(subItem2, subKey2, props))}
                                </div>)}
                            </div>;
                        }
                        return <div>
                            {
                                getItem(item, key, props, true)
                            }
                        </div>;
                    })
                }
            </div>
            <div>{I18n.t(group.name)}</div>
        </div>)}
    </div>;
};

export default NewToolbar;
