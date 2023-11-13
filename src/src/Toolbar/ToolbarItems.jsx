import PropTypes from 'prop-types';
import {
    Button,
    ButtonBase,
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

import { I18n } from '@iobroker/adapter-react-v5';

import MultiSelect from './MultiSelect';

const styles = theme => ({
    toolbarBlock: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRightStyle: 'solid',
        padding: '0px 10px',
        borderWidth: 1,
    },
    disabled: {
        color: theme.palette.action.disabled,
    },
    toolbarItems: {
        display: 'flex', flexDirection: 'row', flex: 1,
    },
    toolbarCol: {
        display: 'flex', flexDirection: 'column',
    },
    toolbarRow: {
        display: 'flex', flexDirection: 'row',
    },
    toolbarLabel: {
        fontSize: '72%',
        opacity: '80%',
        paddingTop: 4,
    },
    toolbarTooltip: {
        pointerEvents: 'none',
    },
});

const getItem = (item, key, props, full) => {
    const view = props.project[props.selectedView];

    if (!item || item.hide) {
        !item && console.warn(`Strange item: ${key}`);
        return null;
    }

    let value = view && item.field ? view.settings[item.field] : null;
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
        return <FormControl variant="standard" key={key} style={{ margin: '0px 10px' }}>
            {props.toolbarHeight !== 'veryNarrow' ? <InputLabel shrink>{I18n.t(item.name)}</InputLabel> : null}
            <Select
                variant="standard"
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

    if (item.type === 'multiselect') {
        return <MultiSelect
            key={key}
            // style={{ margin: '0px 10px' }}
            label={props.toolbarHeight !== 'veryNarrow' ? (item.doNotTranslateName ? item.name : I18n.t(item.name)) : null}
            width={item.width}
            value={item.value ? item.value : value}
            onChange={_value => item.onChange(_value)}
            setSelectedWidgets={props.setSelectedWidgets}
            options={item.items}
            themeType={props.themeType}
        />;
        /*
        return <FormControl variant="standard" key={key} style={{ margin: '0px 10px' }}>
            {props.toolbarHeight !== 'veryNarrow' ? <InputLabel shrink>{I18n.t(item.name)}</InputLabel> : null}
            <Select
                variant="standard"
                style={{ width: item.width }}
                multiple
                value={item.value ? item.value : value}
                renderValue={selected => selected.map(selectedItem => {
                    const _item = item.items.find(foundItem => foundItem.value === selectedItem);
                    return _item ? _item.name : selectedItem;
                }).join(', ')}
                onChange={item.onChange ? item.onChange : e => change(e.target.value)}
            >
                {item.items.map(selectItem => <MenuItem
                    value={selectItem.value}
                    key={selectItem.value}
                >
                    {selectItem.subName ?
                        <div style={{ display: 'flex' }}>
                            <div><Checkbox checked={(item.value ? item.value : value).includes(selectItem.value)} /></div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{selectItem.name}</div>
                                <div style={{ fontSize: 10, fontStyle: 'italic' }}>{selectItem.subName}</div>
                            </div>
                        </div>
                        :
                        <>
                            <Checkbox checked={(item.value ? item.value : value).includes(selectItem.value)} />
                            {I18n.t(selectItem.name)}
                        </>}
                </MenuItem>)}
            </Select>
        </FormControl>;
        */
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
        return props.toolbarHeight !== 'veryNarrow' && full ?
            <div key={key} style={{ textAlign: 'center' }}>
                <ButtonBase
                    className={item.disabled ? props.classes.disabled : null}
                    onClick={item.onClick}
                    disabled={item.disabled}
                    style={{
                        flexDirection: 'column',
                        width: 60,
                        borderRadius: 4,
                        height: '100%',
                        justifyContent: 'start',
                        color: item.color || undefined,
                    }}
                >
                    <div><item.Icon fontSize={item.size && props.toolbarHeight !== 'veryNarrow' ? item.size : 'small'} /></div>
                    <div>{I18n.t(item.name)}</div>
                    {item.subName ? <div style={{ fontSize: 10, opacity: 0.6 }}>{item.subName}</div> : null}
                </ButtonBase>
            </div>
            :
            <Tooltip key={key} title={I18n.t(item.name)} classes={{ popper: props.classes.toolbarTooltip }}>
                <div>
                    <IconButton
                        color={item.selected ? 'primary' : undefined}
                        size="small"
                        key={key}
                        disabled={item.disabled}
                        onClick={item.onClick}
                        style={{ height: full ? '100%' : null, color: item.color }}
                    >
                        <item.Icon fontSize={item.size ? item.size : 'small'} />
                    </IconButton>
                </div>
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
        variant="standard"
        key={key}
        value={value}
        type={item.type}
        onChange={item.onChange ? item.onChange : e => change(e.target.value)}
        InputLabelProps={{ shrink: true }}
        label={props.toolbarHeight !== 'veryNarrow' ? I18n.t(item.name) : null}
        className={props.classes.textInput}
    />;
};

const ToolbarItems = props => {
    let items = props.group.items;
    const name = props.group.name;
    const doNotTranslateName = props.group.doNotTranslateName;

    // flatten buttons
    if (props.toolbarHeight === 'veryNarrow') {
        const _items = [];
        items.forEach(item => {
            if (Array.isArray(item)) {
                item.forEach(_item => {
                    if (Array.isArray(_item)) {
                        _item.forEach(__item => _items.push(__item));
                    } else {
                        _items.push(_item);
                    }
                });
            } else {
                _items.push(item);
            }
        });
        items = _items;
    }

    return <div
        className={props.classes.toolbarBlock}
        style={props.last ? { borderRightWidth: 0 } : null}
    >
        <div className={props.classes.toolbarItems}>
            {
                items.map((item, key) => {
                    if (Array.isArray(item)) {
                        return <div key={key} className={props.classes.toolbarCol}>
                            {item.map((subItem, subKey) => <div key={subKey} className={props.classes.toolbarRow}>
                                {subItem.map((subItem2, subKey2) => getItem(subItem2, subKey2, props))}
                            </div>)}
                        </div>;
                    }
                    return getItem(item, key, props, true);
                })
            }
        </div>
        {props.toolbarHeight === 'full' ? <div className={props.classes.toolbarLabel}>
            <span>{typeof name === 'string' ? (doNotTranslateName ? name : I18n.t(name)) : name}</span>
        </div> : null}
    </div>;
};

ToolbarItems.propTypes = {
    classes: PropTypes.object,
    // eslint-disable-next-line react/no-unused-prop-types
    themeType: PropTypes.string,
    group: PropTypes.object,
    last: PropTypes.bool,
    toolbarHeight: PropTypes.string,
};

export default withStyles(styles)(ToolbarItems);
