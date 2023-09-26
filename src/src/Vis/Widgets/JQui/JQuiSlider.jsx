/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2023 Denis Haev https://github.com/GermanBluefox,
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
import PropTypes from 'prop-types';

import {
    FormControl,
    InputLabel,
    FormLabel, Slider, Stack, LinearProgress,
} from '@mui/material';

import {
    Icon,
} from '@iobroker/adapter-react-v5';

// eslint-disable-next-line import/no-cycle
import VisRxWidget from '../../visRxWidget';

class JQuiSlider extends VisRxWidget {
    constructor(props) {
        super(props);
        this.state.value = '';
        this.state.valueMax = '';
    }

    static getWidgetInfo() {
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
                            onChange: async (field, data, changeData, socket) => {
                                if (data[field.name] && data[field.name] !== 'nothing_selected') {
                                    const obj = await socket.getObject(data[field.name]);
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
                            hidden: data => !!data.readOnly,
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
                            hidden: data => data.type !== 'range',
                        },
                        {
                            name: 'shift_min_distance',
                            type: 'checkbox',
                            hidden: data => data.type !== 'range' || !data.min_distance,
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
                    hidden: data => data.type !== 'range',
                    fields: [
                        {
                            name: 'inverted-2',
                            type: 'checkbox',
                            label: 'jqui_inverted',
                        },
                        {
                            name: 'oid-2',
                            type: 'id',
                            hidden: data => data.type !== 'range',
                        },
                        {
                            name: 'click_id-2',
                            type: 'id',
                            noSubscribe: true,
                            hidden: data => !data['oid-2'] || data.type !== 'range',
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
                            hidden: data => !!data.icon || !!data.image,
                        },
                        {
                            name: 'text-2',
                            label: 'jqui_text_max',
                            hidden: data => !!data['icon-2'] || !!data['image-2'],
                        },
                        {
                            name: 'image',
                            label: 'jqui_image',
                            type: 'image',
                            hidden: data => !!data.icon || !!data.text,
                        },
                        {
                            name: 'icon',
                            label: 'jqui_icon',
                            type: 'icon64',
                            hidden: data => !!data.image || !!data.text,
                        },
                        {
                            name: 'image-2',
                            label: 'jqui_image_max',
                            type: 'image',
                            hidden: data => !!data['icon-2'] || !!data['text-2'],
                        },
                        {
                            name: 'icon-2',
                            label: 'jqui_icon_max',
                            type: 'icon64',
                            hidden: data => !!data['image-2'] || !!data['text-2'],
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

    async componentDidMount() {
        super.componentDidMount();
        if (this.state.rxData.oid && this.state.rxData.oid !== 'nothing_selected') {
            const state = await this.props.context.socket.getState(this.state.rxData.oid);
            this.onStateUpdated(this.state.rxData.oid, state);
        }
        if (this.state.rxData.type === 'range' && this.state.rxData['oid-2'] && this.state.rxData['oid-2'] !== 'nothing_selected') {
            const state = await this.props.context.socket.getState(this.state.rxData['oid-2']);
            this.onStateUpdated(this.state.rxData['oid-2'], state);
        }
    }

    static findField(widgetInfo, name) {
        return VisRxWidget.findField(widgetInfo, name);
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiSlider.getWidgetInfo();
    }

    onStateUpdated(id, state) {
        if (id === this.state.rxData.oid && state) {
            let value = parseFloat(state.val === null || state.val === undefined ? 0 : state.val) || 0;
            if (this.state.rxData.inverted) {
                value = parseFloat(this.state.rxData.max) - value + parseFloat(this.state.rxData.min);
            }

            if (this.state.value !== value) {
                this.setState({ value });
            }
        } else if (id === this.state.rxData['oid-2'] && state) {
            let value = parseFloat(state.val === null || state.val === undefined ? 0 : state.val) || 0;

            if (this.state.rxData['inverted-2']) {
                value = parseFloat(this.state.rxData.max) - value + parseFloat(this.state.rxData.min);
            }

            if (this.state.valueMax !== value) {
                this.setState({ valueMax: value.toString() });
            }
        }
    }

    getControlOid(isMax) {
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

    async onChange(value, isMax, immediate) {
        if (this.props.editMode) {
            return;
        }

        this.newState = this.newState || {};

        const minDistance = isMax || this.state.rxData.type === 'range' ? (parseFloat(this.state.rxData.min_distance) || 0) : 0;
        if (isMax) {
            if (Array.isArray(value)) {
                console.log(`Set ${value[0]} - ${value[1]}`);
                this.newState.value = value[0];
                this.newState.valueMax = value[1];

                if (minDistance) {
                    if (this.lastChanged === 2) {
                        if (this.state.rxData.shift_min_distance) {
                            this.newState.valueMax = Math.max(this.newState.valueMax, parseFloat(this.state.rxData.min) + minDistance);
                            if (this.newState.valueMax - minDistance < this.newState.value) {
                                this.newState.value = this.newState.valueMax - minDistance;
                            }
                        } else {
                            this.newState.valueMax = Math.max(this.newState.valueMax, this.state.value + minDistance);
                        }
                    } else if (this.state.rxData.shift_min_distance) {
                        this.newState.value = Math.min(this.newState.value, parseFloat(this.state.rxData.max) - minDistance);
                        this.newState.valueMax = this.state.valueMax;
                        if (this.newState.valueMax - minDistance < this.newState.value) {
                            this.newState.valueMax = this.newState.value + minDistance;
                        }
                    } else {
                        this.newState.value = Math.min(this.newState.value, this.state.valueMax - minDistance);
                    }
                }
                console.log(`Set ${this.newState.value} - ${this.newState.valueMax}`);
            } else {
                this.lastChanged = 2;
                this.newState.valueMax = value;
                if (minDistance) {
                    if (this.state.rxData.shift_min_distance) {
                        this.newState.valueMax = Math.max(this.newState.valueMax, parseFloat(this.state.rxData.min) + minDistance);
                        this.newState.value = this.state.value;
                        if (this.newState.valueMax - minDistance < this.newState.value) {
                            this.newState.value = this.newState.valueMax - minDistance;
                        }
                    } else {
                        this.newState.valueMax = Math.max(value, this.state.value + minDistance);
                    }
                }
                console.log(`Set (${this.newState.value || this.state.value}) - ${this.newState.valueMax}`);
            }
        } else {
            this.lastChanged = 1;
            this.newState.value = value;

            if (minDistance) {
                if (this.state.rxData.shift_min_distance) {
                    this.newState.value = Math.min(this.newState.value, parseFloat(this.state.rxData.max) - minDistance);
                    this.newState.valueMax = this.state.valueMax;
                    if (this.newState.valueMax - minDistance < this.newState.value) {
                        this.newState.valueMax = this.newState.value + minDistance;
                    }
                } else {
                    this.newState.value = Math.min(value, this.state.valueMax - minDistance);
                }
            }
            console.log(`Set ${this.newState.value} - (${this.newState.valueMax || this.state.valueMax})`);
        }

        this.setTimeout && clearTimeout(this.setTimeout);
        this.setTimeout = setTimeout(async () => {
            this.setTimeout = null;
            const newState = this.newState;
            this.newState = null;
            if (!newState) {
                console.error('This can\'t be true!');
                return;
            }

            if (newState.value !== undefined) {
                const oid = this.getControlOid();
                if (oid) {
                    let val = parseFloat(newState.value);
                    if (this.state.rxData.inverted) {
                        val = parseFloat(this.state.rxData.max) - val + parseFloat(this.state.rxData.min);
                    }

                    if (this.state.values[`${this.state.rxData.oid}.val`] !== val) {
                        this.props.context.socket.setState(oid, val);
                    }
                }
            }
            if (newState.valueMax !== undefined) {
                const oidMax = this.getControlOid(true);
                if (oidMax) {
                    let val = parseFloat(newState.valueMax);
                    if (this.state.rxData['inverted-2']) {
                        val = parseFloat(this.state.rxData.max) - val + parseFloat(this.state.rxData.min);
                    }

                    if (this.state.values[`${this.state.rxData['oid-2']}.val`] !== val) {
                        this.props.context.socket.setState(oidMax, val);
                    }
                }
            }
        }, immediate ? 0 : parseInt(this.state.rxData.timeout, 10) || 300);

        this.setState(this.newState);
    }

    renderIcon(isMax) {
        let icon;
        if (isMax) {
            icon = this.state.rxData['icon-2'] || this.state.rxData['image-2'];
        } else {
            icon = this.state.rxData.icon || this.state.rxData.image;
        }

        if (icon) {
            return <Icon
                src={icon}
            />;
        }
        return null;
    }

    renderText(isMax) {
        return isMax ? this.state.rxData['text-2'] : this.state.rxData.text;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        props.style.overflow = 'visible';
        const step = this.state.rxData.step === undefined || this.state.rxData.step === null ? 0 : parseFloat(this.state.rxData.step);

        let content;

        if (this.state.rxData.type === 'range') {
            content = <Slider
                key="control"
                // style={!this.state.rxData.orientation || this.state.rxData.orientation === 'horizontal' ?
                //    { marginLeft: 20, marginRight: 20, width: 'calc(100% - 40px)' } :
                //    { marginTop: 10, marginBottom: 10 }}
                valueLabelFormat={value => value + (this.state.rxData.unit || '')}
                value={[parseFloat(this.state.value) || 0, parseFloat(this.state.valueMax) || 0]}
                valueLabelDisplay={this.state.rxData.valueLabelDisplay || 'auto'}
                min={parseFloat(this.state.rxData.min === undefined || this.state.rxData.min === null ? 0 : this.state.rxData.min)}
                max={parseFloat(this.state.rxData.max === undefined || this.state.rxData.max === null ? 100 : this.state.rxData.max)}
                orientation={this.state.rxData.orientation || 'horizontal'}
                disabled={!!this.state.values[`${this.state.rxData['oid-working']}.val`]}
                step={step === 0 ? undefined : step}
                disableSwap={this.state.rxData.type === 'range' ? true : undefined}
                marks={step === 0 ? undefined : true}
                onChangeCommitted={(e, value) => this.onChange(value, true, true)}
                onChange={(e, value, activeThumb) => this.onChange(value[activeThumb], !!activeThumb)}
            />;
        } else {
            content = <Slider
                key="control2"
                // style={!this.state.rxData.orientation || this.state.rxData.orientation === 'horizontal' ?
                //    { marginLeft: 20, marginRight: 20, width: 'calc(100% - 40px)' } :
                //    { marginTop: 10, marginBottom: 10 }}
                valueLabelFormat={value => value + (this.state.rxData.unit || '')}
                value={parseFloat(this.state.value) || 0}
                valueLabelDisplay={this.state.rxData.valueLabelDisplay || 'auto'}
                min={parseFloat(this.state.rxData.min === undefined || this.state.rxData.min === null ? 0 : this.state.rxData.min)}
                max={parseFloat(this.state.rxData.max === undefined || this.state.rxData.max === null ? 100 : this.state.rxData.max)}
                disabled={!!this.state.values[`${this.state.rxData['oid-working']}.val`]}
                orientation={this.state.rxData.orientation || 'horizontal'}
                step={step === 0 ? undefined : step}
                marks={step === 0 ? undefined : true}
                onChangeCommitted={(e, value) => this.onChange(value, false, true)}
                onChange={(e, value) => this.onChange(value)}
            />;
        }

        if (this.state.rxData.text || this.state.rxData['text-2'] || this.state.rxData.icon || this.state.rxData['icon-2'] || this.state.rxData.image || this.state.rxData['image-2']) {
            content = <Stack
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
            </Stack>;
        }

        if (this.state.rxData.widgetTitle) {
            content = <FormControl
                fullWidth
                key="form"
                style={{
                    marginTop: this.state.rxData.type === 'select' ? 5 : undefined,
                    width: '100%',
                    height: '100%',
                }}
            >
                {this.state.rxData.type === 'select' ?
                    <InputLabel>{this.state.rxData.widgetTitle}</InputLabel> :
                    <FormLabel style={this.state.rxData.type === 'slider' ? { marginLeft: 10 } : undefined}>{this.state.rxData.widgetTitle}</FormLabel>}
                {content}
            </FormControl>;
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

        return <div className="vis-widget-body" style={{ position: 'relative' }}>
            {content}
        </div>;
    }
}

JQuiSlider.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiSlider;
