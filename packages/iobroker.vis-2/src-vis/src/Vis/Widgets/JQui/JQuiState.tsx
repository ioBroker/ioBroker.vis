/**
 *  ioBroker.vis-2
 *  https://github.com/ioBroker/ioBroker.vis-2
 *
 *  Copyright (c) 2023-2025 Denis Haev https://github.com/GermanBluefox,
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */

import React from 'react';

import {
    Button,
    Tooltip,
    ButtonGroup,
    Radio,
    RadioGroup,
    FormControlLabel,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    FormLabel,
    Slider,
    List,
} from '@mui/material';

import { I18n, Icon, type LegacyConnection } from '@iobroker/adapter-react-v5';

import VisBaseWidget from '@/Vis/visBaseWidget';
import { deepClone } from '@/Utils/utils';

import VisRxWidget, { type VisRxWidgetState } from '../../visRxWidget';
import BulkEditor from './BulkEditor';
import type {
    RxRenderWidgetProps,
    RxWidgetInfo,
    RxWidgetInfoAttributesField,
    RxWidgetInfoAttributesFieldCheckbox,
    RxWidgetInfoCustomComponentProperties,
    VisBaseWidgetProps,
    WidgetData,
    Writeable,
} from '@iobroker/types-vis-2';

interface BulkEditorData {
    variant?: 'outlined' | 'contained';
    type: 'select' | 'radio';
    oid: string;
    count: number;
    [colors: `color${number}`]: string;
    [values: `value${number}`]: string | number;
    [values: `text${number}`]: string;
    [values: `icon${number}`]: string | null;
    [values: `g_states-${number}`]: boolean;
    [values: `image${number}`]: string;
    [values: `activeColor${number}`]: string;
    [values: `tooltip${number}`]: string;
}

type RxData = {
    oid: string;
    count: number;

    type: 'button' | 'select' | 'radio' | 'slider';
    readOnly: boolean;
    click_id: string;
    variant: 'contained' | 'outlined' | 'text' | 'standard';
    orientation: 'horizontal' | 'vertical';
    widgetTitle: string;
    timeout: number;
    open: boolean;

    [key: `value${number}`]: string | number;
    [key: `color${number}`]: string;
    [key: `text${number}`]: string;
    [key: `icon${number}`]: string | null;
    [key: `g_states-${number}`]: boolean;
    [key: `image${number}`]: string;
    [key: `activeColor${number}`]: string;
    [key: `tooltip${number}`]: string;

    [key: `onlyIcon${number}`]: boolean;
    [key: `test${number}`]: boolean;
};

interface JQuiStateState extends VisRxWidgetState {
    value: string | number | boolean;
    object: ioBroker.StateObject | null | false;
}

class JQuiState<P extends RxData = RxData, S extends JQuiStateState = JQuiStateState> extends VisRxWidget<P, S> {
    private controlTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(props: VisBaseWidgetProps) {
        super(props);
        Object.assign(this.state, {
            value: '',
            object: null,
        });
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplJquiButtonState',
            visSet: 'jqui',
            visName: 'States control',
            visWidgetLabel: 'jqui_states_control',
            visPrev: 'widgets/jqui/img/Prev_ButtonState.png',
            visOrder: 14,
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'type',
                            label: 'jqui_type',
                            type: 'select',
                            noTranslation: true,
                            default: 'button',
                            options: ['button', 'select', 'radio', 'slider'],
                        },
                        {
                            name: 'oid',
                            type: 'id',
                            onChange: async (
                                _field: RxWidgetInfoAttributesField,
                                data: RxData,
                                changeData: (newData: RxData) => void,
                                socket: LegacyConnection,
                            ): Promise<void> => {
                                if (data.oid) {
                                    // unknown bug by compilation
                                    if (await (BulkEditor.generateFields as any)(data, socket)) {
                                        changeData(data);
                                    }
                                }
                            },
                        },
                        {
                            name: 'readOnly',
                            type: 'checkbox',
                        },
                        {
                            name: 'click_id',
                            type: 'id',
                            noSubscribe: true,
                            hidden: (data: Record<string, any>): boolean => !!data.readOnly,
                        },
                        {
                            name: 'count',
                            type: 'slider',
                            min: 0,
                            default: 1,
                            max: 10,
                            hidden: (data: Record<string, any>): boolean => !!data.percents,
                        },
                        {
                            type: 'custom',
                            component: (
                                _field: RxWidgetInfoAttributesField,
                                data: WidgetData,
                                onDataChange: (newData: WidgetData) => void,
                                props: RxWidgetInfoCustomComponentProperties,
                            ) => (
                                <BulkEditor
                                    // TODO: if multiple widgets of this type selected data will get undefined, check why
                                    theme={props.context.theme}
                                    data={(data as BulkEditorData) || ({} as BulkEditorData)}
                                    onDataChange={onDataChange}
                                    socket={props.context.socket}
                                    themeType={props.context.theme.palette.mode === 'dark' ? 'dark' : 'light'}
                                    adapterName={props.context.adapterName}
                                    instance={props.context.instance}
                                    projectName={props.context.projectName}
                                />
                            ),
                        },
                        {
                            name: 'variant',
                            label: 'jqui_variant',
                            type: 'select',
                            noTranslation: true,
                            options: ['contained', 'outlined', 'text', 'standard'],
                            default: 'contained',
                            hidden: (data: Record<string, any>): boolean =>
                                data.type !== 'button' && data.type !== 'select',
                        },
                        {
                            name: 'orientation',
                            label: 'orientation',
                            type: 'select',
                            options: ['horizontal', 'vertical'],
                            default: 'horizontal',
                            hidden: (data: Record<string, any>): boolean =>
                                data.type !== 'button' && data.type !== 'slider',
                        },
                        {
                            name: 'widgetTitle',
                            label: 'jqui_name',
                            type: 'text',
                        },
                        {
                            name: 'timeout',
                            label: 'jqui_set_timeout',
                            type: 'number',
                            hidden: (data: Record<string, any>): boolean => data.type !== 'slider',
                        },
                        {
                            name: 'open',
                            label: 'jqui_open',
                            type: 'checkbox',
                            hidden: (data: Record<string, any>): boolean => data.type !== 'select',
                        },
                    ],
                },
                {
                    name: 'states',
                    label: 'jqui_group_value',
                    indexFrom: 1,
                    indexTo: 'count',
                    hidden: (data: Record<string, any>): boolean => !!data.percents,
                    fields: [
                        {
                            name: 'value',
                            type: 'text',
                            label: 'jqui_value',
                            default: '0',
                        },
                        {
                            name: 'test',
                            type: 'checkbox',
                            label: 'jqui_test',
                            onChange: (
                                field: RxWidgetInfoAttributesField,
                                data: Record<string, any>,
                                changeData: (newData: Record<string, any>) => void,
                                _socket: LegacyConnection,
                                index?: number,
                            ): Promise<void> => {
                                if (data[(field as RxWidgetInfoAttributesFieldCheckbox).name]) {
                                    let changed = false;
                                    // deactivate all other tests
                                    for (let i = 1; i <= data.count; i++) {
                                        if (i !== index) {
                                            if (data[`test${i}`]) {
                                                changed = true;
                                                data[`test${i}`] = false;
                                            }
                                        }
                                    }
                                    changed && changeData(data);
                                }
                                return Promise.resolve();
                            },
                            hidden: (data, index) =>
                                data.type === 'slider' ||
                                data[`value${index}`] === '' ||
                                data[`value${index}`] === null ||
                                data[`value${index}`] === undefined,
                        },
                        {
                            name: 'onlyIcon',
                            type: 'checkbox',
                            label: 'jqui_only_icon',
                        },
                        {
                            name: 'text',
                            default: I18n.t('Value'),
                            type: 'text',
                            label: 'jqui_text',
                            hidden: (data, index) =>
                                !!data[`onlyIcon${index}`] ||
                                data[`value${index}`] === '' ||
                                data[`value${index}`] === null ||
                                data[`value${index}`] === undefined,
                        },
                        {
                            name: 'color',
                            type: 'color',
                            label: 'color',
                            hidden: (data, index) =>
                                data.type === 'slider' ||
                                data[`value${index}`] === '' ||
                                data[`value${index}`] === null ||
                                data[`value${index}`] === undefined,
                        },
                        {
                            name: 'activeColor',
                            type: 'color',
                            label: 'jqui_active_color',
                            hidden: (data, index) =>
                                data.type === 'slider' ||
                                data[`value${index}`] === '' ||
                                data[`value${index}`] === null ||
                                data[`value${index}`] === undefined,
                        },
                        {
                            name: 'image',
                            label: 'jqui_image',
                            type: 'image',
                            hidden: (data, index) =>
                                data.type === 'slider' ||
                                !!data.icon ||
                                data[`value${index}`] === '' ||
                                data[`value${index}`] === null ||
                                data[`value${index}`] === undefined,
                        },
                        {
                            name: 'icon',
                            label: 'jqui_icon',
                            type: 'icon64',
                            hidden: (data, index) =>
                                data.type === 'slider' ||
                                !!data.image ||
                                data[`value${index}`] === '' ||
                                data[`value${index}`] === null ||
                                data[`value${index}`] === undefined,
                        },
                        {
                            name: 'tooltip',
                            label: 'jqui_tooltip',
                            type: 'text',
                            hidden: (data, index) =>
                                data.type === 'slider' ||
                                data[`value${index}`] === '' ||
                                data[`value${index}`] === null ||
                                data[`value${index}`] === undefined,
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: 300,
                height: 45,
            },
        };
    }

    async componentDidMount(): Promise<void> {
        super.componentDidMount();

        // convert old tplJquiRadioSteps data to JquiState data
        if (
            this.props.tpl === 'tplJquiRadioSteps' &&
            this.state.data &&
            this.props.context.onWidgetsChanged &&
            this.state.data.count === undefined
        ) {
            const data = deepClone(this.state.data);

            data.count = 5;
            const min = parseFloat(data.min || 0);
            const max = parseFloat(data.max || 100);

            data.value1 = min;
            data.text1 = I18n.t('jqui_off');
            data['g_states-1'] = true;

            data.value5 = max;
            data.text5 = '100%';
            data['g_states-5'] = true;

            data.value2 = (max - min) * 0.25 + min;
            data.text2 = '25%';
            data['g_states-2'] = true;

            data.value3 = (max - min) * 0.5 + min;
            data.text3 = '50%';
            data['g_states-3'] = true;

            data.value4 = (max - min) * 0.75 + min;
            data.text4 = '75%';
            data['g_states-4'] = true;

            data.min = null;
            data.max = null;

            setTimeout(
                () =>
                    this.props.context.onWidgetsChanged([
                        {
                            wid: this.props.id,
                            view: this.props.view,
                            data,
                        },
                    ]),
                100,
            );
        }

        // convert old tplJquiRadioList data to JquiState data
        if (
            (this.props.tpl === 'tplJquiRadioList' || this.props.tpl === 'tplJquiSelectList') &&
            this.state.data &&
            this.state.data.values &&
            this.state.data.texts &&
            this.props.context.onWidgetsChanged
        ) {
            // convert
            const values = this.state.data.values.split(';');
            const texts = this.state.data.texts.split(';');
            const data = deepClone(this.state.data);
            data.values = null;
            data.texts = null;
            data.count = values.length;
            for (let i = 1; i <= values.length; i++) {
                data[`value${i}`] = values[i - 1];
                data[`text${i}`] = texts[i - 1];
                data[`g_states-${i}`] = true;
            }
            data.type = this.props.tpl === 'tplJquiRadioList' ? 'radio' : 'select';
            if (this.props.context.onWidgetsChanged) {
                setTimeout(
                    () =>
                        this.props.context.onWidgetsChanged([
                            {
                                wid: this.props.id,
                                view: this.props.view,
                                data,
                            },
                        ]),
                    100,
                );
            }
        }

        if (this.state.rxData.oid && this.state.rxData.oid !== 'nothing_selected') {
            try {
                const state = await this.props.context.socket.getState(this.state.rxData.oid);
                this.onStateUpdated(this.state.rxData.oid, state);
            } catch (error) {
                console.error(`Cannot get state ${this.state.rxData.oid}: ${error}`);
            }
        }
    }

    componentWillUnmount(): void {
        super.componentWillUnmount();
        if (this.controlTimeout) {
            clearTimeout(this.controlTimeout);
            this.controlTimeout = null;
        }
    }

    static findField<Field extends { [x: string]: any } = RxWidgetInfoAttributesField>(
        widgetInfo: RxWidgetInfo,
        name: string,
    ): Writeable<Field> | null {
        return VisRxWidget.findField(widgetInfo, name) as unknown as Writeable<Field>;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return JQuiState.getWidgetInfo();
    }

    onStateUpdated(id: string, state: ioBroker.State): void {
        if (id === this.state.rxData.oid && state) {
            const value = state.val === null || state.val === undefined ? '' : state.val;

            if (this.state.value !== value.toString()) {
                this.setState({ value: value.toString() });
            }
        }
    }

    getControlOid(): string {
        if (this.state.rxData.click_id && this.state.rxData.click_id !== 'nothing_selected') {
            return this.state.rxData.click_id;
        }
        if (this.state.rxData.oid && this.state.rxData.oid !== 'nothing_selected') {
            return this.state.rxData.oid;
        }
        return '';
    }

    onClick(indexOrValue: string | number, immediately?: boolean): void {
        if (this.state.rxData.readOnly || this.props.editMode) {
            return;
        }

        if (this.state.rxData.type === 'slider') {
            if (this.controlTimeout) {
                clearTimeout(this.controlTimeout);
            }
            this.controlTimeout = setTimeout(
                () => {
                    this.controlTimeout = null;
                    const oid = this.getControlOid();
                    if (oid) {
                        this.props.context.setValue(oid, parseFloat(indexOrValue as string));
                    }
                },
                immediately ? 0 : parseInt(this.state.rxData.timeout as unknown as string, 10) || 300,
            );
            this.setState({ value: indexOrValue });
        } else {
            const oid = this.getControlOid();
            if (oid) {
                if (typeof this.state.object === 'object' && this.state.object?.common.type === 'number') {
                    this.props.context.setValue(
                        oid,
                        parseFloat(this.state.rxData[`value${indexOrValue as number}`] as string),
                    );
                } else {
                    this.props.context.setValue(oid, this.state.rxData[`value${indexOrValue as number}`]);
                }
            }
            this.setState({ value: this.state.rxData[`value${indexOrValue as number}`] });
        }
    }

    getSelectedIndex(value?: string | number | boolean): number {
        if (value === undefined) {
            value = this.state.value;
        }

        if (this.props.editMode) {
            for (let i = 1; i <= this.state.rxData.count; i++) {
                if ((this.state.rxData as unknown as Record<string, boolean>)[`test${i}`]) {
                    return i;
                }
            }
        }
        for (let i = 1; i <= this.state.rxData.count; i++) {
            if ((this.state.rxData as unknown as Record<string, string>)[`value${i}`] === value) {
                return i;
            }
        }
        return 0;
    }

    renderIcon(i: number, selectedIndex: number): React.JSX.Element | null {
        let color: string;
        const rxData = this.state.rxData as unknown as Record<string, string>;
        let icon: string = rxData[`icon${i}`] || rxData[`image${i}`];
        if (icon && rxData[`color${i}`]) {
            color = rxData[`color${i}`];
            if (i === selectedIndex && rxData[`activeColor${i}`]) {
                color = rxData[`activeColor${i}`];
            }
        }

        if (icon) {
            if (icon.startsWith('_PRJ_NAME/')) {
                icon = icon.replace(
                    '_PRJ_NAME/',
                    `../${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}/`,
                );
            }
            const style: React.CSSProperties = { color };
            style.width = 'auto';
            style.height = 24;

            return (
                <Icon
                    key="icon"
                    style={style}
                    src={icon}
                />
            );
        }
        return null;
    }

    renderText(i: number, selectedIndex: number): React.JSX.Element | null {
        const rxData = this.state.rxData as unknown as Record<string, string>;
        if (rxData[`onlyIcon${i}`]) {
            return null;
        }
        let text = rxData[`text${i}`];
        let color = rxData[`color${i}`];
        if (i === selectedIndex && rxData[`activeColor${i}`]) {
            color = rxData[`activeColor${i}`];
        }

        text = text || rxData[`value${i}`];

        return <span style={{ color }}>{text}</span>;
    }

    renderButton(i: number, selectedIndex: number, buttonStyle?: React.CSSProperties): React.JSX.Element | null {
        const rxData = this.state.rxData as unknown as Record<string, boolean>;
        const icon = this.renderIcon(i, selectedIndex);
        const text = this.renderText(i, selectedIndex);

        // Button
        const button = (
            <Button
                disabled={this.props.editMode}
                key={i}
                style={{ ...buttonStyle, flexGrow: 1 }}
                startIcon={text ? icon : undefined}
                color={selectedIndex === i ? 'primary' : 'grey'}
                onClick={() => this.onClick(i)}
            >
                {text || icon}
            </Button>
        );

        if (rxData[`tooltip${i}`]) {
            return (
                <Tooltip
                    key={i}
                    title={rxData[`tooltip${i}`]}
                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                >
                    {button}
                </Tooltip>
            );
        }

        return button;
    }

    renderRadio(i: number, selectedIndex: number, buttonStyle?: React.CSSProperties): React.JSX.Element {
        const rxData = this.state.rxData as unknown as Record<string, boolean>;
        const icon = this.renderIcon(i, selectedIndex);
        let text = this.renderText(i, selectedIndex);

        if (icon && text) {
            text = (
                <div style={{ display: 'flex', gap: 4 }}>
                    {icon}
                    {text}
                </div>
            );
        }

        // Button
        const button = (
            <FormControlLabel
                key={i}
                style={buttonStyle}
                control={
                    <Radio
                        disabled={this.props.editMode}
                        onClick={() => this.onClick(i)}
                        checked={selectedIndex === i}
                    />
                }
                labelPlacement="end"
                label={text || icon}
            />
        );

        if (rxData[`tooltip${i}`]) {
            return (
                <Tooltip
                    key={i}
                    title={rxData[`tooltip${i}`]}
                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                >
                    {button}
                </Tooltip>
            );
        }
        return button;
    }

    renderMenuItem(i: number, selectedIndex: number, buttonStyle?: React.CSSProperties): React.JSX.Element {
        const rxData = this.state.rxData as unknown as Record<string, string>;
        const icon = this.renderIcon(i, selectedIndex);
        let text = this.renderText(i, selectedIndex);

        if (icon && text) {
            text = (
                <div style={{ display: 'flex', gap: 4 }}>
                    {icon}
                    {text}
                </div>
            );
        }

        // Button
        return (
            <MenuItem
                title={rxData[`tooltip${i}`]}
                disabled={this.props.editMode}
                key={i}
                selected={selectedIndex === i}
                style={buttonStyle}
                value={rxData[`value${i}`]}
                onClick={rxData.open ? () => this.onClick(i) : undefined}
            >
                {text || icon}
            </MenuItem>
        );
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const selectedIndex = this.getSelectedIndex();
        const rxData = this.state.rxData as unknown as Record<string, string>;

        if ((this.state.object as ioBroker.StateObject)?._id !== this.state.rxData.oid && this.state.object !== false) {
            Object.assign(this.state, { object: false });
            setTimeout(async () => {
                if (this.state.rxData.oid && this.state.rxData.oid !== 'nothing_selected') {
                    const obj = await this.props.context.socket.getObject(this.state.rxData.oid);
                    if (obj?.common?.type) {
                        this.setState({
                            object: {
                                _id: obj._id,
                                common: { type: obj.common.type } as ioBroker.StateCommon,
                                type: 'state',
                                native: {},
                            },
                        });
                        return;
                    }
                }
                this.setState({
                    object: {
                        _id: this.state.rxData.oid,
                        common: { type: 'string' } as ioBroker.StateCommon,
                        type: 'state',
                        native: {},
                    },
                });
            }, 0);
        }

        const buttonStyle: React.CSSProperties = {};
        // apply style from the element
        Object.keys(this.state.rxStyle).forEach(attr => {
            const value = rxData[attr];
            if (value !== null && value !== undefined && VisRxWidget.POSSIBLE_MUI_STYLES.includes(attr)) {
                attr = attr.replace(/(-\w)/g, text => text[1].toUpperCase());
                (buttonStyle as unknown as Record<string, string>)[attr] = value;
            }
        });
        buttonStyle.minWidth = 'unset';
        if (buttonStyle.borderWidth) {
            buttonStyle.borderWidth = VisBaseWidget.correctStylePxValue(buttonStyle.borderWidth);
        }
        if (buttonStyle.fontSize) {
            buttonStyle.fontSize = VisBaseWidget.correctStylePxValue(buttonStyle.fontSize);
        }

        let content;
        if (
            (!this.state.rxData.count ||
                (this.state.rxData.count === 1 && !rxData.text0 && !rxData.icon0 && !rxData.image0)) &&
            (!this.state.rxData.oid || this.state.rxData.oid === 'nothing_selected')
        ) {
            content = (
                <Button
                    variant="outlined"
                    style={{ width: '100%', height: '100%' }}
                >
                    {I18n.t('Select object ID')}
                </Button>
            );
        } else if (!this.state.rxData.count) {
            content = (
                <Button
                    variant="outlined"
                    style={{ width: '100%', height: '100%' }}
                >
                    {I18n.t('Please define states')}
                </Button>
            );
        } else if (this.state.rxData.type === 'radio') {
            const buttons = [];
            for (let i = 1; i <= this.state.rxData.count; i++) {
                buttons.push(this.renderRadio(i, selectedIndex, buttonStyle));
            }

            content = <RadioGroup style={{ width: '100%', height: '100%' }}>{buttons}</RadioGroup>;
        } else if (this.state.rxData.type === 'select') {
            const buttons = [];
            for (let i = 1; i <= this.state.rxData.count; i++) {
                buttons.push(this.renderMenuItem(i, selectedIndex, buttonStyle));
            }

            let variant: 'standard' | 'filled' | 'outlined' = 'standard';
            if (this.state.rxData.variant === 'contained') {
                variant = 'filled';
            } else if (this.state.rxData.variant === 'outlined') {
                variant = 'outlined';
            }

            if (this.state.rxData.open) {
                content = <List style={{ width: '100%', height: '100%' }}>{buttons}</List>;
            } else {
                content = (
                    <Select
                        disabled={this.props.editMode}
                        style={{ width: '100%', height: '100%' }}
                        value={this.state.value === undefined ? '' : this.state.value}
                        onChange={e => this.onClick(this.getSelectedIndex(e.target.value))}
                        variant={variant}
                        sx={{
                            '& .MuiSelect-select':
                                variant === 'filled'
                                    ? {
                                          mb: '10px',
                                      }
                                    : undefined,
                        }}
                    >
                        {buttons}
                    </Select>
                );
            }
        } else if (this.state.rxData.type === 'slider') {
            props.style.overflow = 'visible';
            const marks = [];
            for (let i = 1; i <= this.state.rxData.count; i++) {
                marks.push({
                    value: parseFloat(rxData[`value${i}`]) || 0,
                    label: rxData[`text${i}`] || 0,
                });
            }

            content = (
                <Slider
                    disabled={this.props.editMode}
                    style={
                        !this.state.rxData.orientation || this.state.rxData.orientation === 'horizontal'
                            ? { marginLeft: 20, marginRight: 20, width: 'calc(100% - 40px)' }
                            : { marginTop: 10, marginBottom: 10 }
                    }
                    value={parseFloat(this.state.value as string) || 0}
                    valueLabelDisplay="auto"
                    min={marks[0].value}
                    max={marks[marks.length - 1].value}
                    orientation={this.state.rxData.orientation || 'horizontal'}
                    marks={marks}
                    onChangeCommitted={(_e, value: number) => this.onClick(value, true)}
                    onChange={(_e, value: number) => this.onClick(value)}
                />
            );
        } else {
            const buttons = [];
            for (let i = 1; i <= this.state.rxData.count; i++) {
                buttons.push(this.renderButton(i, selectedIndex, buttonStyle));
            }

            content = (
                <ButtonGroup
                    disabled={this.props.editMode}
                    style={{ width: '100%', height: '100%' }}
                    orientation={this.state.rxData.orientation || 'horizontal'}
                    // "contained" | "outlined" | "text"
                    variant={
                        this.state.rxData.variant === undefined
                            ? 'contained'
                            : this.state.rxData.variant === 'standard'
                              ? 'text'
                              : this.state.rxData.variant
                    }
                >
                    {buttons}
                </ButtonGroup>
            );
        }

        if (this.state.rxData.widgetTitle) {
            content = (
                <FormControl
                    fullWidth
                    // "outlined" | "standard" | "filled"
                    variant={
                        this.state.rxData.variant === undefined || this.state.rxData.variant === 'text'
                            ? 'standard'
                            : this.state.rxData.variant === 'contained'
                              ? 'filled'
                              : this.state.rxData.variant
                    }
                    style={{
                        marginTop:
                            this.state.rxData.type === 'select' && this.state.rxData.variant === 'outlined'
                                ? 5
                                : undefined,
                        width: '100%',
                        height:
                            this.state.rxData.type === 'select' && this.state.rxData.variant === 'outlined'
                                ? 'calc(100% - 5px)'
                                : '100%',
                    }}
                >
                    {this.state.rxData.type === 'select' ? (
                        <InputLabel>{this.state.rxData.widgetTitle}</InputLabel>
                    ) : (
                        <FormLabel style={this.state.rxData.type === 'slider' ? { marginLeft: 10 } : undefined}>
                            {this.state.rxData.widgetTitle}
                        </FormLabel>
                    )}
                    {content}
                </FormControl>
            );
        }

        return <div className="vis-widget-body">{content}</div>;
    }
}

export default JQuiState;
