import React from 'react';
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
    Menu,
    type SelectChangeEvent,
} from '@mui/material';

import { Menu as MenuIcon } from '@mui/icons-material';

import { I18n, type ThemeType } from '@iobroker/adapter-react-v5';
import type { ViewSettings, VisTheme } from '@iobroker/types-vis-2';

import { deepClone } from '@/Utils/utils';
import { store } from '@/Store';
import type Editor from '@/Editor';
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
        display: 'flex',
        flexDirection: 'row',
        flex: 1,
    },
    toolbarCol: {
        display: 'flex',
        flexDirection: 'column',
    },
    toolbarRow: {
        display: 'flex',
        flexDirection: 'row',
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
    onAction?: (value: any) => void;
}

export interface SelectToolbarItem extends BaseToolbarItem {
    type: 'select';
    items: { name: string; value: string }[];
    width: number;
    value?: string;
    onAction?: (value: SelectChangeEvent) => void;
}

export interface MultiselectToolbarItem extends BaseToolbarItem {
    type: 'multiselect';
    items: { name: string | React.JSX.Element; subName?: string; value: string; color?: string; icon?: string }[];
    width: number;
    value?: string[];
    onAction: (value: string[]) => void;
    id?: string;
}

export interface CheckboxToolbarItem extends BaseToolbarItem {
    type: 'checkbox';
    value?: boolean;
    onAction?: (value: string) => void;
}

export interface IconButtonToolbarItem extends BaseToolbarItem {
    type: 'icon-button';
    Icon: React.FC<any>;
    onAction: () => void;
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
    onAction: () => void;
}

export interface DividerToolbarItem extends BaseToolbarItem {
    type: 'divider';
}

export interface TextFieldToolbarItem extends BaseToolbarItem {
    type?: 'password' | 'number';
    value: string;
    onAction: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export type ToolbarItem =
    | SelectToolbarItem
    | MultiselectToolbarItem
    | CheckboxToolbarItem
    | IconButtonToolbarItem
    | TextToolbarItem
    | ButtonToolbarItem
    | DividerToolbarItem
    | TextFieldToolbarItem;

export interface ToolbarGroup {
    name: string | React.JSX.Element;
    doNotTranslateName?: boolean;
    items: (ToolbarItem[][] | ToolbarItem[] | ToolbarItem)[];
    compact?: { tooltip: 'Projects'; icon: React.JSX.Element } | undefined;
}

interface ToolbarItemsProps {
    theme: VisTheme;
    themeType: ThemeType;
    group: ToolbarGroup;
    last?: boolean;
    toolbarHeight: 'full' | 'narrow' | 'veryNarrow';
    changeProject: Editor['changeProject'];
    selectedView: string;
    setSelectedWidgets: Editor['setSelectedWidgets'];
}

interface ToolbarItemsState {
    opened: HTMLButtonElement | null;
}

class ToolbarItems extends React.Component<ToolbarItemsProps, ToolbarItemsState> {
    constructor(props: ToolbarItemsProps) {
        super(props);
        this.state = { opened: null };
    }

    closeMenu(): void {
        this.setState({ opened: null });
    }

    onAction = (item: ToolbarItem, changeValue?: any): void => {
        this.closeMenu();

        if (item.onAction) {
            item.onAction(changeValue);
            return;
        }

        if (changeValue !== undefined && item.field) {
            const { visProject } = store.getState();
            const project = deepClone(visProject);
            (project[this.props.selectedView].settings[item.field] as any) = changeValue;

            void this.props.changeProject(project);
        }
    };

    getItemSelect(item: SelectToolbarItem, key: number, value: string): React.JSX.Element {
        return (
            <FormControl
                variant="standard"
                key={key}
                style={{ margin: '0px 10px' }}
            >
                {this.props.toolbarHeight !== 'veryNarrow' ? <InputLabel shrink>{I18n.t(item.name)}</InputLabel> : null}
                <Select
                    variant="standard"
                    style={{ width: item.width }}
                    value={item.value ? item.value : value}
                    onChange={e => this.onAction(item, e.target.value)}
                >
                    {item.items.map(selectItem => (
                        <MenuItem
                            value={selectItem.value}
                            key={selectItem.value}
                        >
                            {I18n.t(selectItem.name)}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }

    getItemMultiselect(item: MultiselectToolbarItem, key: number, value: string[]): React.JSX.Element {
        return (
            <MultiSelect
                theme={this.props.theme}
                key={key}
                // style={{ margin: '0px 10px' }}
                id={item.id}
                label={
                    this.props.toolbarHeight !== 'veryNarrow'
                        ? item.doNotTranslateName
                            ? item.name
                            : I18n.t(item.name)
                        : null
                }
                width={item.width}
                value={item.value ? item.value : value}
                onChange={_value => this.onAction(item, _value)}
                setSelectedWidgets={this.props.setSelectedWidgets}
                options={item.items.map(option => ({
                    name: option.name as string,
                    subname: option.subName,
                    value: option.value,
                    color: option.color,
                    icon: option.icon,
                }))}
                themeType={this.props.themeType}
            />
        );
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

    getItemCheckbox(item: CheckboxToolbarItem, key: number, value: boolean): React.JSX.Element {
        return (
            <FormControlLabel
                key={key}
                control={
                    <Checkbox
                        checked={value}
                        onChange={e => this.onAction(item, e.target.checked)}
                        size="small"
                    />
                }
                label={I18n.t(item.name)}
            />
        );
    }

    getItemIconButton(item: IconButtonToolbarItem, key: number, full: boolean): React.JSX.Element {
        return this.props.toolbarHeight !== 'veryNarrow' && full ? (
            <div
                key={key}
                style={{ textAlign: 'center' }}
            >
                <ButtonBase
                    sx={item.disabled ? styles.disabled : undefined}
                    onClick={() => this.onAction(item)}
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
                    <div>
                        <item.Icon fontSize={item.size ? item.size : 'small'} />
                    </div>
                    <div>{I18n.t(item.name)}</div>
                    {item.subName ? <div style={{ fontSize: 10, opacity: 0.6 }}>{item.subName}</div> : null}
                </ButtonBase>
            </div>
        ) : (
            <Tooltip
                key={key}
                title={I18n.t(item.name)}
                slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
            >
                <div>
                    <IconButton
                        color={item.selected ? 'primary' : undefined}
                        size="small"
                        key={key}
                        disabled={item.disabled}
                        onClick={() => this.onAction(item)}
                        style={{ height: full ? '100%' : null, color: item.color }}
                    >
                        <item.Icon fontSize={(item.size ? item.size : 'small') as any} />
                    </IconButton>
                </div>
            </Tooltip>
        );
    }

    getItem(item: ToolbarItem, key: number, full?: boolean): null | React.JSX.Element {
        const { visProject } = store.getState();
        const view = visProject[this.props.selectedView];

        if (!item || item.hide) {
            return null;
        }

        let value = view && item.field ? view.settings[item.field] : null;
        if (item.field && (value === null || value === undefined)) {
            value = '';
        }

        if (item.type === 'select') {
            return this.getItemSelect(item, key, value as string);
        }

        if (item.type === 'multiselect') {
            return this.getItemMultiselect(item, key, value as string[]);
        }

        if (item.type === 'checkbox') {
            return this.getItemCheckbox(item, key, value as boolean);
        }

        if (item.type === 'icon-button') {
            return this.getItemIconButton(item, key, full);
        }

        if (item.type === 'text') {
            return (
                <span
                    key={key}
                    style={styles.text}
                >{`${I18n.t(item.text)}:`}</span>
            );
        }

        if (item.type === 'button') {
            return (
                <Button
                    key={key}
                    variant="outlined"
                    onClick={() => this.onAction(item)}
                    size="small"
                    style={styles.button}
                >
                    {I18n.t(item.name)}
                </Button>
            );
        }

        if (item.type === 'divider') {
            return (
                <Divider
                    key={key}
                    orientation="vertical"
                    flexItem
                    style={{ margin: '0px 10px' }}
                />
            );
        }

        return (
            <TextField
                variant="standard"
                key={key}
                value={value}
                type={item.type}
                onChange={e => this.onAction(item, e.target.value)}
                InputLabelProps={{ shrink: true }}
                label={this.props.toolbarHeight !== 'veryNarrow' ? I18n.t(item.name) : null}
                style={styles.textInput}
            />
        );
    }

    render(): React.JSX.Element | React.JSX.Element[] {
        let items = this.props.group.items;
        const name = this.props.group.name;
        const doNotTranslateName = this.props.group.doNotTranslateName;

        // flatten buttons
        if (this.props.toolbarHeight === 'veryNarrow') {
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

        const div = (
            <div style={{ ...styles.toolbarBlock, borderRightWidth: this.props.last ? 0 : undefined }}>
                <div style={styles.toolbarItems}>
                    {items.map((item, key) => {
                        if (Array.isArray(item)) {
                            return (
                                <div
                                    key={key}
                                    style={styles.toolbarCol}
                                >
                                    {(item as ToolbarItem[][]).map((subItem, subKey) => (
                                        <div
                                            key={subKey}
                                            style={styles.toolbarRow}
                                        >
                                            {subItem.map((subItem2, subKey2) => this.getItem(subItem2, subKey2, false))}
                                        </div>
                                    ))}
                                </div>
                            );
                        }
                        return this.getItem(item, key, true);
                    })}
                </div>
                {this.props.toolbarHeight === 'full' ? (
                    <div style={styles.toolbarLabel}>
                        <span>{typeof name === 'string' ? (doNotTranslateName ? name : I18n.t(name)) : name}</span>
                    </div>
                ) : null}
            </div>
        );

        if (this.props.group.compact) {
            return [
                <Tooltip
                    title={I18n.t(this.props.group.compact.tooltip)}
                    key="icon"
                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                >
                    <IconButton
                        onClick={e => this.setState({ opened: this.state.opened ? null : e.currentTarget })}
                        style={{ height: '100%' }}
                    >
                        {this.props.group.compact.icon || <MenuIcon />}
                    </IconButton>
                </Tooltip>,
                <Menu
                    key="menu"
                    onClose={() => this.closeMenu()}
                    open={!!this.state.opened}
                    anchorEl={this.state.opened}
                    sx={{
                        '& .MuiList-root': {
                            border: '2px solid grey',
                            borderRadius: 4,
                        },
                    }}
                >
                    {div}
                </Menu>,
            ];
        }

        return div;
    }
}

export default ToolbarItems;
