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

import { GetRxDataFromWidget, RxRenderWidgetProps } from '@/types';
import VisRxWidget from '@/Vis/visRxWidget';
import { Context } from '@/Vis/visBaseWidget';
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

interface ItemsEditorProps {
    data: any;
    setData: (data: any) => void;
    context: Context;
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
            onClose={newItems => {
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
                        component: (_field: any, data: any, setData: (_data: any) => void, props: { context: Context }) => <ItemsEditor
                            data={data}
                            setData={setData}
                            context={props.context}
                        />,
                        default: '[]',
                    },
                    {
                        name: 'widgetTitle',
                        label: 'name',
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
                                value: 'contained',
                                label: 'contained',
                            },
                            {
                                value: 'outlined',
                                label: 'outlined',
                            },
                            {
                                value: 'text',
                                label: 'text',
                            },
                        ],
                        default: 'contained',
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
        return BasicFilterDropdown.getWidgetInfo();
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
                setTimeout(() => {
                    const ref = this.props.askView('getRef', { id: this.props.view });
                    ref?.onCommand('changeFilter', { filter });
                }, 0);
            }
        } else {
            this.editMode = true;
        }
    }

    onCommand(command: string): void {
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
                value={value}
                onChange={e => {
                    let filter = e.target.value;
                    if (typeof filter === 'string') {
                        filter = filter.split(',');
                    }
                    if (filter.includes('')) {
                        filter = [];
                    }
                    const ref = this.props.askView('getRef', { id: this.props.view });
                    ref?.onCommand('changeFilter', { filter });
                }}
                multiple={!!this.state.rxData.multiple}
                autoFocus={!!this.state.rxData.autoFocus}
            >
                {this.state.rxData.noAllOption ? null : <MenuItem value=""><em>{this.state.rxData.noFilterText || I18n.t('basic_no_filter')}</em></MenuItem>}
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
                            alt={option.label}
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
                onClick={() => {
                    const ref = this.props.askView('getRef', { id: this.props.view });
                    ref?.onCommand('changeFilter', { filter: [] });
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
                        const ref = this.props.askView('getRef', { id: this.props.view });
                        ref?.onCommand('changeFilter', { filter });
                    }}
                    sx={theme => ({
                        backgroundColor: viewsActiveFilter.includes(option.value) ? theme.palette.primary.main : undefined,
                        color: viewsActiveFilter.includes(option.value) ? theme.palette.primary.contrastText : undefined,
                    })}
                    startIcon={image ? <Icon src={image} alt={option.label} style={{ height: 24 }} /> : null}
                    style={{
                        flexGrow: 1,
                        color: viewsActiveFilter.includes(option.value) ? option.color : (option.activeColor || option.color),
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
                setTimeout(() => {
                    const ref = this.props.askView('getRef', { id: this.props.view });
                    ref?.onCommand('changeFilter', { filter });
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
