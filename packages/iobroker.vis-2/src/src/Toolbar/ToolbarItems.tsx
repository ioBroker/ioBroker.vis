import React from 'react';
import type { SelectChangeEvent } from '@mui/material';
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

import { I18n, type ThemeType } from '@iobroker/adapter-react-v5';

import { deepClone } from '@/Utils/utils';
import type { ViewSettings, VisTheme } from '@iobroker/types-vis-2';
import { store } from '@/Store';
import type Editor from '@/Editor';
import commonStyles from '@/Utils/styles';
import MultiSelect from './MultiSelect';

const styles: Record<string, any> = {
    toolbarBlock: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRightStyle: 'solid',
        padding: '0px 10px',
        borderWidth: 1,
    },
    disabled: (theme: VisTheme) => ({
        color: theme.palette.action.disabled,
    }),
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
};

export interface BaseToolbarItem {
    name?: string;
    field?: keyof ViewSettings;
    hide?: boolean;
    doNotTranslateName?: boolean;
}

export interface SelectToolbarItem extends BaseToolbarItem {
    type: 'select';
    items: { name: string; value: string }[];
    width: number;
    value?: string;
    onChange?: (value: SelectChangeEvent) => void;
}

export interface MultiselectToolbarItem extends BaseToolbarItem {
    type: 'multiselect';
    items: { name: string | React.JSX.Element;
        subName?: string;
        value: string;
        color?: string;
        icon?: string;
     }[];
    width: number;
    value?: string[];
    onChange: (value: string[]) => void;
}

export interface CheckboxToolbarItem extends BaseToolbarItem {
    type: 'checkbox';
    value?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface IconButtonToolbarItem extends BaseToolbarItem {
    type: 'icon-button';
    Icon: React.FC<any>;
    onClick: () => void;
    disabled?: boolean;
    selected?: boolean;
    size?: 'small' | 'inherit' | 'default' | 'large' | 'normal';
    color?: string;
    subName?: string;
}

export interface TextToolbarItem extends BaseToolbarItem {
    type: 'text';
    text: string;
}

export interface ButtonToolbarItem extends BaseToolbarItem {
    type: 'button';
    onClick: () => void;
}

export interface DividerToolbarItem extends BaseToolbarItem {
    type: 'divider';
}

export interface TextFieldToolbarItem extends BaseToolbarItem {
    type?: 'password' | 'number';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export type ToolbarItem = SelectToolbarItem | MultiselectToolbarItem | CheckboxToolbarItem | IconButtonToolbarItem | TextToolbarItem | ButtonToolbarItem | DividerToolbarItem | TextFieldToolbarItem;

interface ToolbarItemsProps {
    theme: VisTheme;
    // eslint-disable-next-line react/no-unused-prop-types
    themeType: ThemeType;
    group: { name: string | React.JSX.Element; doNotTranslateName?: boolean; items: (ToolbarItem[][] | ToolbarItem[] | ToolbarItem)[] };
    last?: boolean;
    toolbarHeight: 'full' | 'narrow' | 'veryNarrow';
    // eslint-disable-next-line react/no-unused-prop-types
    changeProject: Editor['changeProject'];
    // eslint-disable-next-line react/no-unused-prop-types
    selectedView: string;
    // eslint-disable-next-line react/no-unused-prop-types
    setSelectedWidgets: Editor['setSelectedWidgets'];
}

// eslint-disable-next-line no-use-before-define
function getItem(
    item: ToolbarItem,
    key: number,
    props: ToolbarItemsProps,
    theme: VisTheme,
    full?: boolean,
): null | React.JSX.Element {
    const { visProject } = store.getState();
    const view = visProject[props.selectedView];

    if (!item || item.hide) {
        !item && console.warn(`Strange item: ${key}`);
        return null;
    }

    let value = view && item.field ? view.settings[item.field] : null;
    if (item.field && (value === null || value === undefined)) {
        value = '';
    }

    const change = (changeValue: any) => {
        if (!item.field) {
            return;
        }
        const project = deepClone(visProject);
        (project[props.selectedView].settings[item.field] as any) = changeValue;

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
            theme={theme}
            key={key}
            // style={{ margin: '0px 10px' }}
            label={props.toolbarHeight !== 'veryNarrow' ? (item.doNotTranslateName ? item.name : I18n.t(item.name)) : null}
            width={item.width}
            value={item.value ? item.value : value as string[]}
            onChange={_value => item.onChange(_value)}
            setSelectedWidgets={props.setSelectedWidgets}
            options={item.items.map(option => ({
                name: option.name as string,
                subname: option.subName,
                value: option.value,
                color: option.color,
                icon: option.icon,
            }))}
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
                checked={value as boolean}
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
                    sx={item.disabled ? styles.disabled : undefined}
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
                    <div><item.Icon fontSize={item.size ? item.size : 'small'} /></div>
                    <div>{I18n.t(item.name)}</div>
                    {item.subName ? <div style={{ fontSize: 10, opacity: 0.6 }}>{item.subName}</div> : null}
                </ButtonBase>
            </div>
            :
            <Tooltip key={key} title={I18n.t(item.name)} componentsProps={{ popper: { sx: commonStyles.tooltip } }}>
                <div>
                    <IconButton
                        color={item.selected ? 'primary' : undefined}
                        size="small"
                        key={key}
                        disabled={item.disabled}
                        onClick={item.onClick}
                        style={{ height: full ? '100%' : null, color: item.color }}
                    >
                        <item.Icon fontSize={(item.size ? item.size : 'small') as any} />
                    </IconButton>
                </div>
            </Tooltip>;
    }

    if (item.type === 'text') {
        return <span key={key} style={styles.text}>{`${I18n.t(item.text)}:`}</span>;
    }

    if (item.type === 'button') {
        return <Button
            key={key}
            variant="outlined"
            onClick={item.onClick}
            size="small"
            style={styles.button}
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
        style={styles.textInput}
    />;
}

const ToolbarItems: React.FC<ToolbarItemsProps> = props => {
    let items = props.group.items;
    const name = props.group.name;
    const doNotTranslateName = props.group.doNotTranslateName;

    // flatten buttons
    if (props.toolbarHeight === 'veryNarrow') {
        const _items: ToolbarItem[] = [];
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
        style={{ ...styles.toolbarBlock, borderRightWidth: props.last ? 0 : undefined }}
    >
        <div style={styles.toolbarItems}>
            {items.map((item, key) => {
                if (Array.isArray(item)) {
                    return <div key={key} style={styles.toolbarCol}>
                        {(item as ToolbarItem[][]).map((subItem, subKey) => <div key={subKey} style={styles.toolbarRow}>
                            {subItem.map((subItem2, subKey2) => getItem(subItem2, subKey2, props, props.theme))}
                        </div>)}
                    </div>;
                }
                return getItem(item, key, props, props.theme, true);
            })}
        </div>
        {props.toolbarHeight === 'full' ? <div style={styles.toolbarLabel}>
            <span>{typeof name === 'string' ? (doNotTranslateName ? name : I18n.t(name)) : name}</span>
        </div> : null}
    </div>;
};

export default ToolbarItems;
