import React, { Component } from 'react';
import { v4 as uuid } from 'uuid';

import {
    Button,
    Dialog, DialogActions, DialogContent, DialogTitle, Fab,
    IconButton, Menu, MenuItem,
    Table, TableBody,
    TableCell, TableHead,
    TableRow,
    TextField,
    Checkbox,
} from '@mui/material';

import {
    Add,
    Check, Clear as ClearIcon,
    Close,
    Delete,
} from '@mui/icons-material';

import {
    ColorPicker,
    I18n,
    Icon,
    SelectFile as SelectFileDialog,
} from '@iobroker/adapter-react-v5';

import { Context } from '@/Vis/visBaseWidget';

import MaterialIconSelector from '../../../Components/MaterialIconSelector';

interface Item {
    id?: string;
    label: string;
    value: string;
    icon?: string;
    image?: string;
    color?: string;
    activeColor?: string;
    default?: boolean;
}

interface FiltersEditorDialogProps {
    items: Item[] | undefined;
    onClose: (items?: Item[]) => void;
    context: Context;
    multiple?: boolean;
}

interface FiltersEditorDialogState {
    filters: any[];
    items: any[];
    applyItems: string;
    selectIcon: null | number;
    selectImage: null | number;
    anchorEl: any;
}

class FiltersEditorDialog extends Component<FiltersEditorDialogProps, FiltersEditorDialogState> {
    private readonly originalItems: string;

    constructor(props: FiltersEditorDialogProps) {
        super(props);
        const items: Item[] = (props.items || []).map((item: Item) => ({ ...item, id: uuid() }));

        this.state = {
            filters: window.vis?.updateFilter() || [],
            items,
            applyItems: JSON.stringify(props.items || []),
            selectIcon: null,
            selectImage: null,
            anchorEl: null,
        };
        this.originalItems = this.state.applyItems;
    }

    updateItems(items: Item[]) {
        const applyItems = JSON.parse(JSON.stringify(items));
        applyItems.forEach((item: Item) => delete item.id);

        this.setState({ items, applyItems: JSON.stringify(applyItems) });
    }

    renderSelectIconDialog() {
        if (this.state.selectIcon === null) {
            return null;
        }
        return <MaterialIconSelector
            themeType={this.props.context.themeType}
            value={this.state.items[this.state.selectIcon]}
            onClose={(icon: string | null) => {
                if (icon !== null) {
                    const items = JSON.parse(JSON.stringify(this.state.items));
                    items[this.state.selectIcon as number].icon = icon;
                    this.updateItems(items);
                }
                this.setState({ selectIcon: null });
            }}
        />;
    }

    renderFilterSelector() {
        if (!this.state.anchorEl) {
            return null;
        }
        const filters = this.state.filters.filter(filter => !this.state.items.find(item => item.filter === filter.value));

        return <Menu
            anchorEl={this.state.anchorEl}
            open={!0}
            onClose={() => this.setState({ anchorEl: null })}
        >
            {filters?.map(filter => <MenuItem
                onClick={async () => {
                    const items = JSON.parse(JSON.stringify(this.state.items));
                    items.push({
                        label: filter,
                        value: filter,
                        id: uuid(),
                    });
                    this.setState({ anchorEl: null }, () => this.updateItems(items));
                }}
                key={filter}
                value={filter}
            >
                {filter}
            </MenuItem>)}
            <MenuItem
                sx={theme => ({ color: theme.palette.primary.main })}
                onClick={() => {
                    const items = JSON.parse(JSON.stringify(this.state.items));
                    items.push({
                        label: '',
                        value: '',
                        id: uuid(),
                    });
                    this.setState({ anchorEl: null }, () => this.updateItems(items));
                }}
            >
                {I18n.t('Custom')}
            </MenuItem>
            {filters.length > 1 ? <MenuItem
                sx={theme => ({ color: theme.palette.primary.main })}
                onClick={() => {
                    const items = JSON.parse(JSON.stringify(this.state.items));
                    filters.forEach(filter => items.push({
                        label: filter,
                        value: filter,
                        id: uuid(),
                    }));

                    this.setState({ anchorEl: null }, () => this.updateItems(items));
                }}
            >
                {I18n.t('basic_all_filters')}
            </MenuItem> : null}
        </Menu>;
    }

    renderSelectImageDialog() {
        if (this.state.selectImage === null) {
            return null;
        }

        let _value = this.state.items[this.state.selectImage as number].image || '';
        if (_value.startsWith('../')) {
            _value = _value.substring(3);
        } else if (_value.startsWith('_PRJ_NAME/')) {
            _value = _value.replace('_PRJ_NAME/', `../${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}/`);
        }

        return <SelectFileDialog
            title={I18n.t('Select file')}
            onClose={() => this.setState({ selectImage: null })}
            restrictToFolder={`${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}`}
            allowNonRestricted
            allowUpload
            allowDownload
            allowCreateFolder
            allowDelete
            allowView
            showToolbar
            imagePrefix="../"
            selected={_value}
            filterByType="images"
            onOk={selected => {
                const projectPrefix = `${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}/`;
                if (selected.startsWith(projectPrefix)) {
                    selected = `_PRJ_NAME/${selected.substring(projectPrefix.length)}`;
                } else if (selected.startsWith('/')) {
                    selected = `..${selected}`;
                } else if (!selected.startsWith('.')) {
                    selected = `../${selected}`;
                }
                const items = JSON.parse(JSON.stringify(this.state.items));
                items[this.state.selectImage as number].image = selected;
                this.updateItems(items);
                this.setState({ selectImage: null });
            }}
            socket={this.props.context.socket}
        />;
    }

    renderTableRow(item: Item, index: number) {
        return <TableRow key={item.id}>
            <TableCell style={{ cursor: 'grab' }}>
                {index + 1}
                .
            </TableCell>
            <TableCell>
                <TextField
                    variant="standard"
                    fullWidth
                    value={item.value || ''}
                    onChange={e => {
                        const items = JSON.parse(JSON.stringify(this.state.items));
                        items[index].value = e.target.value;
                        this.updateItems(items);
                    }}
                    InputLabelProps={{ shrink: true }}
                />
            </TableCell>
            <TableCell>
                <TextField
                    variant="standard"
                    fullWidth
                    value={item.label || ''}
                    onChange={e => {
                        const items = JSON.parse(JSON.stringify(this.state.items));
                        items[index].label = e.target.value;
                        this.updateItems(items);
                    }}
                    InputLabelProps={{ shrink: true }}
                />
            </TableCell>
            <TableCell>
                {item.image ? null : <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        size="small"
                        variant="standard"
                        value={item.icon}
                        onChange={e => {
                            const items = JSON.parse(JSON.stringify(this.state.items));
                            items[index].icon = e.target.value;
                            this.updateItems(items);
                        }}
                        InputProps={{
                            endAdornment: item.icon ? <IconButton
                                size="small"
                                onClick={() => {
                                    const items = JSON.parse(JSON.stringify(this.state.items));
                                    items[index].icon = '';
                                    this.updateItems(items);
                                }}
                            >
                                <ClearIcon />
                            </IconButton> : null,
                        }}
                    />
                    <Button
                        variant={item.icon ? 'outlined' : undefined}
                        // @ts-expect-error grey is correct
                        color={item.icon ? 'grey' : undefined}
                        onClick={() => this.setState({ selectIcon: index })}
                    >
                        {item.icon ? <Icon src={item.icon} style={{ width: 36, height: 36 }} /> : '...'}
                    </Button>
                </div>}
            </TableCell>
            <TableCell>
                {item.icon ? null : <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                        variant="standard"
                        fullWidth
                        InputProps={{
                            endAdornment: item.image ? <IconButton
                                size="small"
                                onClick={() => {
                                    const items = JSON.parse(JSON.stringify(this.state.items));
                                    items[index].image = '';
                                    this.updateItems(items);
                                }}
                            >
                                <ClearIcon />
                            </IconButton> : null,
                        }}
                        value={item.image}
                        onChange={e => {
                            const items = JSON.parse(JSON.stringify(this.state.items));
                            items[index].image = e.target.value;
                            this.updateItems(items);
                        }}
                    />
                    <Button
                        variant={item.image ? 'outlined' : undefined}
                        // @ts-expect-error grey is correct
                        color={item.image ? 'grey' : undefined}
                        onClick={() => this.setState({ selectImage: index })}
                    >
                        {item.image ? <Icon src={item.image} style={{ width: 36, height: 36 }} /> : '...'}
                    </Button>
                </div>}
            </TableCell>
            <TableCell>
                <ColorPicker
                    style={{ width: '100%' }}
                    value={item.color}
                    onChange={color => {
                        const items = JSON.parse(JSON.stringify(this.state.items));
                        items[index].color = color;
                        this.updateItems(items);
                    }}
                />
            </TableCell>
            <TableCell>
                <ColorPicker
                    style={{ width: '100%' }}
                    value={item.activeColor}
                    onChange={color => {
                        const items = JSON.parse(JSON.stringify(this.state.items));
                        items[index].activeColor = color;
                        this.updateItems(items);
                    }}
                />
            </TableCell>
            <TableCell>
                <Checkbox
                    checked={!!item.default}
                    onChange={e => {
                        const items = JSON.parse(JSON.stringify(this.state.items));
                        if (!this.props.multiple && e.target.checked) {
                            items.forEach((_item: Item) => _item.default = false);
                        }
                        items[index].default = e.target.checked;
                        this.updateItems(items);
                    }}
                />
            </TableCell>
            <TableCell>
                <IconButton
                    size="small"
                    onClick={() => {
                        const items = JSON.parse(JSON.stringify(this.state.items));
                        items.splice(index, 1);
                        this.updateItems(items);
                    }}
                >
                    <Delete />
                </IconButton>
            </TableCell>
        </TableRow>;
    }

    renderTable() {
        return <Table stickyHeader size="small">
            <TableHead>
                <TableRow>
                    <TableCell style={{ width: 40 }}>
                        <Fab
                            size="small"
                            onClick={event => this.setState({ anchorEl: event.currentTarget })}
                        >
                            <Add />
                        </Fab>
                    </TableCell>
                    <TableCell style={{ width: 70 }}>{I18n.t('Value')}</TableCell>
                    <TableCell style={{ width: 'calc(100% - 700px)' }}>{I18n.t('Title')}</TableCell>
                    <TableCell style={{ width: 150 }}>{I18n.t('Icon')}</TableCell>
                    <TableCell style={{ width: 150 }}>{I18n.t('Image')}</TableCell>
                    <TableCell style={{ width: 150 }}>{I18n.t('Text color')}</TableCell>
                    <TableCell style={{ width: 150 }}>{I18n.t('jqui_active_color')}</TableCell>
                    <TableCell style={{ width: 70 }}>{I18n.t('Default')}</TableCell>
                    <TableCell style={{ width: 40 }} />
                </TableRow>
            </TableHead>
            <TableBody>
                {this.state.items.map((item, index) => this.renderTableRow(item, index))}
            </TableBody>
        </Table>;
    }

    render() {
        return <Dialog
            fullWidth
            maxWidth="xl"
            open={!0}
            onClose={() => this.props.onClose()}
        >
            <DialogTitle>{I18n.t('Edit')}</DialogTitle>
            <DialogContent style={{ minHeight: 'calc(90vh - 164px)' }}>
                {this.renderSelectIconDialog()}
                {this.renderSelectImageDialog()}
                {this.renderFilterSelector()}
                {this.renderTable()}
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={this.originalItems === this.state.applyItems}
                    variant="contained"
                    onClick={() => this.props.onClose(JSON.parse(this.state.applyItems))}
                    color="primary"
                    startIcon={<Check />}
                >
                    {I18n.t('Apply')}
                </Button>
                <Button
                    variant="contained"
                    // @ts-expect-error grey is correct
                    color="grey"
                    onClick={() => this.props.onClose()}
                    startIcon={<Close />}
                >
                    {I18n.t('Cancel')}
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

export default FiltersEditorDialog;
