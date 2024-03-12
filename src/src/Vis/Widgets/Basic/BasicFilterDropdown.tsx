/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2024 Denis Haev https://github.com/GermanBluefox,
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */

import React, { useState } from 'react';

import {
    Button, ButtonGroup,
    FormControl,
    InputLabel, MenuItem,
    Select,
} from '@mui/material';
import { Edit } from '@mui/icons-material';

import { I18n, Icon } from '@iobroker/adapter-react-v5';

import {
    GetRxDataFromWidget, RxRenderWidgetProps, RxWidgetInfo, WidgetData,
} from '@/types';
import VisRxWidget from '@/Vis/visRxWidget';
import { RxWidgetInfoAttributesField, RxWidgetInfoCustomComponentProperties, RxWidgetInfoCustomComponentContext } from '@/allInOneTypes';
import { VisWidgetCommand } from '@/Vis/visBaseWidget';
import FiltersEditorDialog from './FiltersEditorDialog';

// eslint-disable-next-line no-use-before-define
type RxData = GetRxDataFromWidget<typeof BasicFilterDropdown>

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

function processFilter(filters: string[]) {
    const len = filters.length;
    for (let f = 0; f < len; f++) {
        const filter = filters[f];
        if (filter.includes(',')) {
            const ff = filter.split(',').map(t => t.trim()).filter(t => t);
            const first = ff.shift();
            if (first) {
                filters[f] = first;
                if (ff.length) {
                    filters.push(...ff);
                }
            }
        } else if (filter.includes(';')) {
            const ff = filter.split(';').map(t => t.trim()).filter(t => t);
            const first = ff.shift();
            if (first) {
                filters[f] = first;
                if (ff.length) {
                    filters.push(...ff);
                }
            }
        }
    }
}

interface ItemsEditorProps {
    data: any;
    setData: (data: any) => void;
    context: RxWidgetInfoCustomComponentContext;
}

const ItemsEditor = (props: ItemsEditorProps) => {
    const [open, setOpen] = useState(false);

    let items = props.data.items;
    // convert data from "filters" to "items"
    if (open && !items && props.data.filters) {
        items = props.data.filters.split(';')
            .map((item: string) => ({ label: item.trim(), value: item.trim() }))
            .filter((item: Item) => item.value);
    }
    if (open && typeof items === 'string') {
        try {
            items = JSON.parse(items);
        } catch (e) {
            items = [];
        }
    }

    return <>
        <Button
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => setOpen(true)}
            variant="outlined"
            startIcon={<Edit />}
        >
            {I18n.t('Edit')}
        </Button>
        {open ? <FiltersEditorDialog
            context={props.context}
            items={items || []}
            multiple={props.data.multiple}
            onClose={(newItems: Item[]) => {
                if (newItems) {
                    const data = JSON.parse(JSON.stringify(props.data));
                    data.items = JSON.stringify(newItems);
                    props.setData(data);
                }
                setOpen(false);
            }}
        /> : null}
    </>;
};

class BasicFilterDropdown extends VisRxWidget<RxData> {
    private editMode: boolean | undefined;

    static getWidgetInfo() {
        return {
            id: 'tplFilterDropdown',
            visSet: 'basic',
            visName: 'filter - dropdown',
            visPrev: 'widgets/basic/img/Prev_FilterDropdown.png',
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'items',
                        label: 'editor',
                        type: 'custom',
                        noBinding: true,
                        component: (
                            _field: RxWidgetInfoAttributesField,
                            data: WidgetData,
                            onDataChange: (newData: WidgetData) => void,
                            props: RxWidgetInfoCustomComponentProperties,
                        ) => <ItemsEditor
                            data={data}
                            setData={onDataChange}
                            context={props.context}
                        />,
                        default: '[]',
                    },
                    {
                        name: 'type',
                        label: 'Type',
                        type: 'select',
                        options: [
                            {
                                value: 'dropdown',
                                label: 'basic_filter_type_dropdown',
                            },
                            {
                                value: 'horizontal_buttons',
                                label: 'basic_filter_type_horizontal_buttons',
                            },
                            {
                                value: 'vertical_buttons',
                                label: 'basic_filter_type_vertical_buttons',
                            },
                        ],
                        default: 'horizontal_buttons',
                    },
                    {
                        name: 'widgetTitle',
                        label: 'name',
                        hidden: 'data.type !== "dropdown"',
                    },
                    {
                        name: 'autoFocus',
                        type: 'checkbox',
                        hidden: 'data.type !== "dropdown"',
                    },
                    {
                        name: 'multiple',
                        label: 'basic_filter_multiple',
                        type: 'checkbox',
                    },
                    {
                        name: 'noAllOption',
                        label: 'basic_no_all_option',
                        type: 'checkbox',
                    },
                    {
                        name: 'noFilterText',
                        label: 'basic_no_filter_text',
                        type: 'text',
                        hidden: '!!data.noAllOption',
                    },
                    {
                        name: 'dropdownVariant',
                        label: 'jqui_variant',
                        type: 'select',
                        noTranslation: true,
                        options: [
                            {
                                value: 'standard',
                                label: 'standard',
                            },
                            {
                                value: 'outlined',
                                label: 'outlined',
                            },
                            {
                                value: 'filled',
                                label: 'filled',
                            },
                        ],
                        default: 'standard',
                        hidden: 'data.type !== "dropdown"',
                    },
                    {
                        name: 'buttonsVariant',
                        label: 'jqui_variant',
                        type: 'select',
                        noTranslation: true,
                        options: [
                            {
                                value: 'outlined',
                                label: 'outlined',
                            },
                            {
                                value: 'contained',
                                label: 'contained',
                            },
                            {
                                value: 'text',
                                label: 'text',
                            },
                        ],
                        default: 'outlined',
                        hidden: 'data.type === "dropdown"',
                    },
                    {
                        name: 'dropdownSmall',
                        label: 'basic_small',
                        default: false,
                        type: 'checkbox',
                        hidden: 'data.type !== "dropdown"',
                    },
                ],
            }],
            // visWidgetLabel: 'value_string',  // Label of widget
            visDefaultStyle: {
                width: 200,
                height: 50,
            },
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return BasicFilterDropdown.getWidgetInfo() as RxWidgetInfo;
    }

    async componentDidMount() {
        super.componentDidMount();
        // apply default filter
        if (!this.props.editMode) {
            this.editMode = false;
            const items = this.getItems();
            if (items.find((item: Item) => item.default && item.value)) {
                const filter: string[] = [];
                items.forEach((item: Item) => item.default && filter.push(item.value));
                processFilter(filter);
                setTimeout(() => {
                    const view = this.props.askView('getViewClass', {});
                    view.onCommand('changeFilter', { filter });
                }, 0);
            }
        } else {
            this.editMode = true;
        }
    }

    onCommand(command: VisWidgetCommand): void {
        if (command === 'changeFilter') {
            // analyse filter
            this.forceUpdate();
        }
        super.onCommand(command);
    }

    renderDropdown(items: Item[]): React.JSX.Element {
        const viewsActiveFilter: string[] = (this.props.viewsActiveFilter[this.props.view] as string[]) || [];
        let value;
        if (this.state.rxData.multiple) {
            value = viewsActiveFilter;
        } else {
            value = viewsActiveFilter[0] || '';
        }
        return <FormControl
            fullWidth
            variant={(this.state.rxData.dropdownVariant as 'standard' | 'outlined' | 'filled' | undefined) || 'standard'}
        >
            {this.state.rxData.widgetTitle ? <InputLabel>{this.state.rxData.widgetTitle}</InputLabel> : null}
            <Select
                fullWidth
                value={value || '_'}
                onChange={e => {
                    let filter: string | string[] = e.target.value === '_' ? [] : e.target.value;
                    if (typeof filter === 'string') {
                        filter = filter.split(',');
                    }
                    if (filter.includes('') || filter.includes('_')) {
                        filter = [];
                    }
                    processFilter(filter);
                    const view = this.props.askView('getViewClass', {});
                    view.onCommand('changeFilter', { filter });
                }}
                renderValue={val => {
                    const option = items.find(item => item.value === val);
                    if (option) {
                        return <span style={{ color: option.color }}>{option.label}</span>;
                    }
                    if (val === '_' || !val) {
                        return this.state.rxData.noAllOption ? '' : I18n.t('basic_no_filter');
                    }
                    return val;
                }}
                multiple={!!this.state.rxData.multiple}
                autoFocus={!!this.state.rxData.autoFocus}
            >
                {this.state.rxData.noAllOption ? null : <MenuItem value="_"><em>{this.state.rxData.noFilterText || I18n.t('basic_no_filter')}</em></MenuItem>}
                {items.map(option => {
                    let image = option.icon;
                    if (!image && option.image) {
                        image = option.image;
                        if (image.startsWith('_PRJ_NAME/')) {
                            image = image.replace('_PRJ_NAME/', `../${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}/`);
                        }
                    }

                    return <MenuItem
                        key={option.value}
                        value={option.value}
                        selected={viewsActiveFilter.includes(option.value)}
                        style={{ color: viewsActiveFilter.includes(option.value) ? option.color : (option.activeColor || option.color) }}
                    >
                        {image ? <Icon
                            src={image}
                            style={{ width: 24, height: 24, marginRight: 8 }}
                        /> : null}
                        {option.label}
                    </MenuItem>;
                })}
            </Select>
        </FormControl>;
    }

    renderButtons(items: Item[]): React.JSX.Element {
        const viewsActiveFilter: string[] = (this.props.viewsActiveFilter[this.props.view] as string[]) || [];
        return <ButtonGroup
            variant={(this.state.rxData.buttonsVariant as 'text' | 'outlined' | 'contained' | undefined) || 'contained'}
            orientation={this.state.rxData.type === 'horizontal_buttons' ? 'horizontal' : 'vertical'}
            style={{ width: '100%', height: '100%' }}
        >
            {this.state.rxData.noAllOption ? null : <Button
                style={{
                    flexGrow: 1,
                }}
                onClick={() => {
                    const view = this.props.askView('getViewClass', {});
                    view.onCommand('changeFilter', { filter: [] });
                }}
            >
                <em>{this.state.rxData.noFilterText || I18n.t('basic_no_filter')}</em>
            </Button>}
            {items.map(option => {
                let image = option.icon;
                if (!image && option.image) {
                    image = option.image;
                    if (image.startsWith('_PRJ_NAME/')) {
                        image = image.replace('_PRJ_NAME/', `../${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}/`);
                    }
                }
                return <Button
                    key={option.value}
                    onClick={() => {
                        let filter: string[];
                        if (this.state.rxData.multiple) {
                            filter = viewsActiveFilter.includes(option.value) ?
                                viewsActiveFilter.filter(f => f !== option.value) :
                                [...viewsActiveFilter, option.value];
                        } else {
                            filter = [option.value];
                        }
                        const view = this.props.askView('getViewClass', {});
                        processFilter(filter);
                        view.onCommand('changeFilter', { filter });
                    }}
                    color={viewsActiveFilter.includes(option.value) ? 'primary' : undefined}
                    sx={theme => ({
                        backgroundColor: viewsActiveFilter.includes(option.value) ? (this.state.rxData.buttonsVariant === 'contained' ? theme.palette.secondary.main : theme.palette.primary.main) : undefined,
                        color: viewsActiveFilter.includes(option.value) ? (this.state.rxData.buttonsVariant === 'contained' ? theme.palette.secondary.contrastText : theme.palette.primary.contrastText) : undefined,
                        '&:hover': {
                            backgroundColor: viewsActiveFilter.includes(option.value) ? (this.state.rxData.buttonsVariant === 'contained' ? theme.palette.secondary.light : theme.palette.primary.light) : undefined,
                            color: viewsActiveFilter.includes(option.value) ? (this.state.rxData.buttonsVariant === 'contained' ? theme.palette.secondary.contrastText : theme.palette.primary.contrastText) : undefined,
                        },
                    })}
                    startIcon={image ? <Icon src={image} alt={option.label} style={{ height: 24 }} /> : null}
                    style={{
                        flexGrow: 1,
                        color: viewsActiveFilter.includes(option.value) ? (option.activeColor || option.color) : option.color,
                    }}
                >
                    {option.label}
                </Button>;
            })}
        </ButtonGroup>;
    }

    getItems() {
        let items = this.state.data.items;
        // convert data from "filters" to "items"
        if (!items && this.state.data.filters) {
            items = this.state.data.filters.split(';')
                .map((item: string) => ({ label: item.trim(), value: item.trim() }))
                .filter((item: Item) => item.value);
        }
        if (typeof items === 'string') {
            try {
                items = JSON.parse(items);
            } catch (e) {
                items = [];
            }
        }
        items = items || [];
        return items;
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        if (props.style.width === undefined) {
            props.style.width = 200;
        }
        if (props.style.height === undefined) {
            props.style.height = 50;
        }

        const items = this.getItems();
        if (this.editMode !== undefined && this.editMode !== this.props.editMode) {
            this.editMode = this.props.editMode;
            // apply default filter if not in edit mode
            if (!this.editMode && items.find((item: Item) => item.default && item.value)) {
                const filter: string[] = [];
                items.forEach((item: Item) => item.default && filter.push(item.value));
                processFilter(filter);
                setTimeout(() => {
                    const view = this.props.askView('getViewClass', {});
                    view.onCommand('changeFilter', { filter });
                }, 0);
            }
        }

        const type = this.state.rxData.type || 'dropdown';
        if (type === 'horizontal_buttons' || type === 'vertical_buttons') {
            return this.renderButtons(items);
        }

        return this.renderDropdown(items);
    }
}

export default BasicFilterDropdown;
