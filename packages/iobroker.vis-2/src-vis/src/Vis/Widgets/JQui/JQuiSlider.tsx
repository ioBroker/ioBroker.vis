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

import { FormControl, FormLabel, Slider, Stack, LinearProgress } from '@mui/material';

import { Icon, type LegacyConnection } from '@iobroker/adapter-react-v5';

import VisRxWidget, { type VisRxWidgetState } from '../../visRxWidget';
import type {
    RxRenderWidgetProps,
    RxWidgetInfo,
    RxWidgetInfoAttributesField,
    VisBaseWidgetProps,
    WidgetData,
    Writeable,
} from '@iobroker/types-vis-2';

interface RxData extends WidgetData {
    type: 'single' | 'range';
    oid: string;
    click_id: string;

    min?: number | null;
    max?: number | null;
    min_distance: number;
    shift_min_distance: boolean;
    step: number;
    unit: string;
    timeout: number;
    'oid-working': string;
    orientation: 'horizontal' | 'vertical';

    text: string;
    inverted: boolean;
    image: string;
    icon: string;

    'oid-2': string;
    'text-2': string;
    'inverted-2': boolean;
    'click_id-2': string;
    'image-2': string;
    'icon-2': string;

    valueLabelDisplay: 'auto' | 'on' | 'off';
    widgetTitle: string;
}

interface JQuiSliderState extends VisRxWidgetState {
    value: string;
    valueMax: number | null;
}

class JQuiSlider<P extends RxData = RxData, S extends JQuiSliderState = JQuiSliderState> extends VisRxWidget<P, S> {
    private controlTimeout: ReturnType<typeof setTimeout> | null = null;
    private lastChanged = 0;

    constructor(props: VisBaseWidgetProps) {
        super(props);
        Object.assign(this.state, {
            value: '',
            valueMax: null,
        });
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplJquiSlider',
            visSet: 'jqui',
            visName: 'Slider',
            visWidgetLabel: 'jqui_slider',
            visPrev: 'widgets/jqui/img/Prev_Slider.png',
            visOrder: 24,
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'type',
                            label: 'jqui_type',
                            type: 'select',
                            options: [
                                { value: 'single', label: 'jqui_single' },
                                { value: 'range', label: 'jqui_range' },
                            ],
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
                                if (data.oid && data.oid !== 'nothing_selected') {
                                    const obj = await socket.getObject(data.oid);
                                    let changed = false;
                                    if (obj?.common?.min !== undefined && obj?.common?.min !== null) {
                                        if (data.min !== obj.common.min) {
                                            data.min = obj.common.min;
                                            changed = true;
                                        }
                                        if (data.text !== obj.common.min.toString() + (obj.common.unit || '')) {
                                            data.text = obj.common.min.toString() + (obj.common.unit || '');
                                            changed = true;
                                        }
                                    }
                                    if (obj?.common?.max !== undefined && obj?.common?.max !== null) {
                                        if (data.max !== obj.common.max) {
                                            data.max = obj.common.max;
                                            changed = true;
                                        }
                                        if (data['text-2'] !== obj.common.max.toString() + (obj.common.unit || '')) {
                                            data['text-2'] = obj.common.max.toString() + (obj.common.unit || '');
                                            changed = true;
                                        }
                                    }
                                    if (obj?.common?.unit) {
                                        if (data.unit !== obj.common.unit) {
                                            data.unit = obj.common.unit;
                                            changed = true;
                                        }
                                    }
                                    if (!data.step) {
                                        if (obj?.common?.step !== undefined && obj?.common?.step !== null) {
                                            if (data.step !== obj.common.step) {
                                                data.step = obj.common.step;
                                                changed = true;
                                            }
                                        }
                                    }
                                    changed && changeData(data);
                                }
                            },
                        },
                        {
                            name: 'click_id',
                            type: 'id',
                            noSubscribe: true,
                        },
                        {
                            name: 'inverted',
                            type: 'checkbox',
                            label: 'jqui_inverted',
                        },
                        {
                            name: 'min',
                            type: 'number',
                            label: 'jqui_min',
                        },
                        {
                            name: 'max',
                            type: 'number',
                            label: 'jqui_max',
                        },
                        {
                            name: 'min_distance',
                            type: 'number',
                            hidden: (data: RxData): boolean => data.type !== 'range',
                        },
                        {
                            name: 'shift_min_distance',
                            type: 'checkbox',
                            hidden: (data: RxData): boolean => data.type !== 'range' || !data.min_distance,
                        },
                        {
                            name: 'step',
                            type: 'number',
                            min: 0,
                        },
                        {
                            name: 'unit',
                        },
                        {
                            name: 'timeout',
                            label: 'jqui_set_timeout',
                            type: 'number',
                        },
                        {
                            name: 'oid-working',
                            label: 'jqui_oid_working',
                            type: 'id',
                        },
                    ],
                },
                {
                    name: 'second',
                    hidden: (data: RxData): boolean => data.type !== 'range',
                    fields: [
                        {
                            name: 'inverted-2',
                            type: 'checkbox',
                            label: 'jqui_inverted',
                        },
                        {
                            name: 'oid-2',
                            type: 'id',
                            hidden: (data: RxData): boolean => data.type !== 'range',
                        },
                        {
                            name: 'click_id-2',
                            type: 'id',
                            noSubscribe: true,
                            hidden: (data: RxData): boolean => !data['oid-2'] || data.type !== 'range',
                        },
                    ],
                },
                {
                    name: 'style',
                    fields: [
                        {
                            name: 'widgetTitle',
                            label: 'jqui_name',
                            type: 'text',
                        },
                        {
                            name: 'orientation',
                            label: 'orientation',
                            type: 'select',
                            options: ['horizontal', 'vertical'],
                            default: 'horizontal',
                        },
                        {
                            name: 'text',
                            label: 'jqui_text',
                            hidden: (data: RxData): boolean => !!data.icon || !!data.image,
                        },
                        {
                            name: 'text-2',
                            label: 'jqui_text_max',
                            hidden: (data: RxData): boolean => !!data['icon-2'] || !!data['image-2'],
                        },
                        {
                            name: 'image',
                            label: 'jqui_image',
                            type: 'image',
                            hidden: (data: RxData): boolean => !!data.icon || !!data.text,
                        },
                        {
                            name: 'icon',
                            label: 'jqui_icon',
                            type: 'icon64',
                            hidden: (data: RxData): boolean => !!data.image || !!data.text,
                        },
                        {
                            name: 'image-2',
                            label: 'jqui_image_max',
                            type: 'image',
                            hidden: (data: RxData): boolean => !!data['icon-2'] || !!data['text-2'],
                        },
                        {
                            name: 'icon-2',
                            label: 'jqui_icon_max',
                            type: 'icon64',
                            hidden: (data: RxData): boolean => !!data['image-2'] || !!data['text-2'],
                        },
                        {
                            name: 'valueLabelDisplay',
                            type: 'select',
                            label: 'jqui_value_label_display',
                            options: [
                                { value: 'auto', label: 'jqui_auto' },
                                { value: 'on', label: 'jqui_on' },
                                { value: 'off', label: 'jqui_off' },
                            ],
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: 300,
                height: 40,
            },
        };
    }

    async componentDidMount(): Promise<void> {
        super.componentDidMount();
        if (this.state.rxData.oid && this.state.rxData.oid !== 'nothing_selected') {
            try {
                const state = await this.props.context.socket.getState(this.state.rxData.oid);
                this.onStateUpdated(this.state.rxData.oid, state);
            } catch (error) {
                console.error(`Cannot get state ${this.state.rxData.oid}: ${error}`);
            }
        }
        if (
            this.state.rxData.type === 'range' &&
            this.state.rxData['oid-2'] &&
            this.state.rxData['oid-2'] !== 'nothing_selected'
        ) {
            try {
                const state = await this.props.context.socket.getState(this.state.rxData['oid-2']);
                this.onStateUpdated(this.state.rxData['oid-2'], state);
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
        return JQuiSlider.getWidgetInfo();
    }

    onStateUpdated(id: string, state: ioBroker.State | null): void {
        if (id === this.state.rxData.oid && state) {
            let value = parseFloat(state.val === null || state.val === undefined ? '0' : (state.val as string)) || 0;
            if (this.state.rxData.inverted) {
                value =
                    parseFloat(this.state.rxData.max as unknown as string) -
                    value +
                    parseFloat(this.state.rxData.min as unknown as string);
            }

            if (this.state.value !== value.toString()) {
                this.setState({ value: value.toString() });
            }
        } else if (id === this.state.rxData['oid-2'] && state) {
            let value = parseFloat(state.val === null || state.val === undefined ? '0' : (state.val as string)) || 0;

            if (this.state.rxData['inverted-2']) {
                value =
                    parseFloat(this.state.rxData.max as unknown as string) -
                    value +
                    parseFloat(this.state.rxData.min as unknown as string);
            }

            if (this.state.valueMax !== value) {
                this.setState({ valueMax: value });
            }
        }
    }

    getControlOid(isMax?: boolean): string {
        if (isMax) {
            if (this.state.rxData['click_id-2'] && this.state.rxData['click_id-2'] !== 'nothing_selected') {
                return this.state.rxData['click_id-2'];
            }
            if (this.state.rxData['oid-2'] && this.state.rxData['oid-2'] !== 'nothing_selected') {
                return this.state.rxData['oid-2'];
            }
        } else {
            if (this.state.rxData.click_id && this.state.rxData.click_id !== 'nothing_selected') {
                return this.state.rxData.click_id;
            }
            if (this.state.rxData.oid && this.state.rxData.oid !== 'nothing_selected') {
                return this.state.rxData.oid;
            }
        }

        return '';
    }

    onChange(value: number | number[], isMax?: boolean, immediate?: boolean): void {
        if (this.props.editMode) {
            return;
        }

        this.newState = this.newState || {};

        const minDistance =
            isMax || this.state.rxData.type === 'range'
                ? parseFloat(this.state.rxData.min_distance as unknown as string) || 0
                : 0;

        let valueMax: number;
        let _value: number;

        if (isMax) {
            if (Array.isArray(value)) {
                console.log(`Set ${value[0]} - ${value[1]}`);
                _value = value[0];
                valueMax = value[1];

                if (minDistance) {
                    if (this.lastChanged === 2) {
                        if (this.state.rxData.shift_min_distance) {
                            valueMax = Math.max(
                                valueMax,
                                parseFloat(this.state.rxData.min as unknown as string) + minDistance,
                            );
                            if (valueMax - minDistance < _value) {
                                _value = valueMax - minDistance;
                            }
                        } else {
                            valueMax = Math.max(valueMax, parseFloat(this.state.value) + minDistance);
                        }
                    } else if (this.state.rxData.shift_min_distance) {
                        _value = Math.min(_value, parseFloat(this.state.rxData.max as unknown as string) - minDistance);
                        valueMax = this.state.valueMax;
                        if (valueMax - minDistance < _value) {
                            valueMax = _value + minDistance;
                        }
                    } else {
                        _value = Math.min(_value, this.state.valueMax - minDistance);
                    }
                }
                console.log(`Set ${_value} - ${valueMax}`);
            } else {
                this.lastChanged = 2;
                valueMax = value;
                if (minDistance) {
                    if (this.state.rxData.shift_min_distance) {
                        valueMax = Math.max(
                            valueMax,
                            parseFloat(this.state.rxData.min as unknown as string) + minDistance,
                        );
                        _value = parseFloat(this.state.value);
                        if (valueMax - minDistance < _value) {
                            _value = valueMax - minDistance;
                        }
                    } else {
                        valueMax = Math.max(value, parseFloat(this.state.value) + minDistance);
                    }
                }
                console.log(`Set (${_value || this.state.value}) - ${valueMax}`);
            }
        } else {
            this.lastChanged = 1;
            _value = value as number;

            if (minDistance) {
                if (this.state.rxData.shift_min_distance) {
                    _value = Math.min(_value, parseFloat(this.state.rxData.max as unknown as string) - minDistance);
                    valueMax = this.state.valueMax;
                    if (valueMax - minDistance < _value) {
                        valueMax = _value + minDistance;
                    }
                } else {
                    _value = Math.min(_value, this.state.valueMax - minDistance);
                }
            }
            console.log(`Set ${_value} - (${valueMax || this.state.valueMax})`);
        }
        this.newState.valueMax = valueMax;
        this.newState.value = _value.toString();

        if (this.controlTimeout) {
            clearTimeout(this.controlTimeout);
        }
        this.controlTimeout = setTimeout(
            (): void => {
                this.controlTimeout = null;
                const newState = this.newState;
                this.newState = null;
                if (!newState) {
                    console.error("This can't be true!");
                    return;
                }

                if (newState.value !== undefined) {
                    const oid: string = this.getControlOid();
                    if (oid) {
                        let val = parseFloat(newState.value);
                        if (this.state.rxData.inverted) {
                            val =
                                parseFloat(this.state.rxData.max as unknown as string) -
                                val +
                                parseFloat(this.state.rxData.min as unknown as string);
                        }

                        if (this.state.values[`${this.state.rxData.oid}.val`] !== val) {
                            this.props.context.setValue(oid, val);
                        }
                    }
                }
                if (newState.valueMax !== undefined) {
                    const oidMax = this.getControlOid(true);
                    if (oidMax) {
                        let val = newState.valueMax;
                        if (this.state.rxData['inverted-2']) {
                            val =
                                parseFloat(this.state.rxData.max as unknown as string) -
                                val +
                                parseFloat(this.state.rxData.min as unknown as string);
                        }

                        if (this.state.values[`${this.state.rxData['oid-2']}.val`] !== val) {
                            this.props.context.setValue(oidMax, val);
                        }
                    }
                }
            },
            immediate ? 0 : parseInt(this.state.rxData.timeout as unknown as string, 10) || 300,
        );

        // @ts-expect-error should cast it somehow
        this.setState(this.newState);
    }

    renderIcon(isMax: boolean): React.JSX.Element | null {
        let icon;
        if (isMax) {
            icon = this.state.rxData['icon-2'] || this.state.rxData['image-2'];
        } else {
            icon = this.state.rxData.icon || this.state.rxData.image;
        }

        if (icon) {
            if (icon && icon.startsWith('_PRJ_NAME/')) {
                icon = icon.replace(
                    '_PRJ_NAME/',
                    `../${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}/`,
                );
            }
            return <Icon src={icon} />;
        }
        return null;
    }

    renderText(isMax: boolean): string {
        return isMax ? this.state.rxData['text-2'] : this.state.rxData.text;
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);

        props.style.overflow = 'visible';
        const step =
            this.state.rxData.step === undefined || this.state.rxData.step === null
                ? 0
                : parseFloat(this.state.rxData.step as unknown as string);

        let content;

        if (this.state.rxData.type === 'range') {
            content = (
                <Slider
                    key="control"
                    // style={!this.state.rxData.orientation || this.state.rxData.orientation === 'horizontal' ?
                    //    { marginLeft: 20, marginRight: 20, width: 'calc(100% - 40px)' } :
                    //    { marginTop: 10, marginBottom: 10 }}
                    valueLabelFormat={value => value + (this.state.rxData.unit || '')}
                    value={[parseFloat(this.state.value) || 0, this.state.valueMax || 0]}
                    valueLabelDisplay={this.state.rxData.valueLabelDisplay || 'auto'}
                    min={parseFloat(
                        this.state.rxData.min === undefined || this.state.rxData.min === null
                            ? '0'
                            : (this.state.rxData.min as unknown as string),
                    )}
                    max={parseFloat(
                        this.state.rxData.max === undefined || this.state.rxData.max === null
                            ? '100'
                            : (this.state.rxData.max as unknown as string),
                    )}
                    orientation={this.state.rxData.orientation || 'horizontal'}
                    disabled={!!this.state.values[`${this.state.rxData['oid-working']}.val`]}
                    step={step === 0 ? undefined : step}
                    disableSwap={this.state.rxData.type === 'range' ? true : undefined}
                    marks={step === 0 ? undefined : true}
                    onChangeCommitted={(_e, value: number) => this.onChange(value, true, true)}
                    onChange={(_e, value: number[], activeThumb) => this.onChange(value[activeThumb], !!activeThumb)}
                />
            );
        } else {
            content = (
                <Slider
                    key="control2"
                    // style={!this.state.rxData.orientation || this.state.rxData.orientation === 'horizontal' ?
                    //    { marginLeft: 20, marginRight: 20, width: 'calc(100% - 40px)' } :
                    //    { marginTop: 10, marginBottom: 10 }}
                    valueLabelFormat={value => value + (this.state.rxData.unit || '')}
                    value={parseFloat(this.state.value) || 0}
                    valueLabelDisplay={this.state.rxData.valueLabelDisplay || 'auto'}
                    min={parseFloat(
                        this.state.rxData.min === undefined || this.state.rxData.min === null
                            ? '0'
                            : (this.state.rxData.min as unknown as string),
                    )}
                    max={parseFloat(
                        this.state.rxData.max === undefined || this.state.rxData.max === null
                            ? '100'
                            : (this.state.rxData.max as unknown as string),
                    )}
                    disabled={!!this.state.values[`${this.state.rxData['oid-working']}.val`]}
                    orientation={this.state.rxData.orientation || 'horizontal'}
                    step={step === 0 ? undefined : step}
                    marks={step === 0 ? undefined : true}
                    onChangeCommitted={(_e, value: number | number[]) => this.onChange(value, false, true)}
                    onChange={(_e, value: number | number[]) => this.onChange(value)}
                />
            );
        }

        if (
            this.state.rxData.text ||
            this.state.rxData['text-2'] ||
            this.state.rxData.icon ||
            this.state.rxData['icon-2'] ||
            this.state.rxData.image ||
            this.state.rxData['image-2']
        ) {
            content = (
                <Stack
                    key="stack"
                    spacing={1}
                    style={{ width: '100%', height: '100%' }}
                    direction={this.state.rxData.orientation === 'vertical' ? 'column' : 'row'}
                    sx={{ mb: 1 }}
                    alignItems="center"
                >
                    {this.renderText(this.state.rxData.orientation === 'vertical')}
                    {this.renderIcon(this.state.rxData.orientation === 'vertical')}
                    {content}
                    {this.renderIcon(this.state.rxData.orientation !== 'vertical')}
                    {this.renderText(this.state.rxData.orientation !== 'vertical')}
                </Stack>
            );
        }

        if (this.state.rxData.widgetTitle) {
            content = (
                <FormControl
                    fullWidth
                    key="form"
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                >
                    <FormLabel style={{ marginLeft: 10 }}>{this.state.rxData.widgetTitle}</FormLabel>
                    {content}
                </FormControl>
            );
        }

        if (this.state.rxData['oid-working'] && this.state.values[`${this.state.rxData['oid-working']}.val`]) {
            content = [
                content,
                <LinearProgress
                    key="progress"
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                    }}
                />,
            ];
        }

        return (
            <div
                className="vis-widget-body"
                style={{ position: 'relative' }}
            >
                {content}
            </div>
        );
    }
}

export default JQuiSlider;
