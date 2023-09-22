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
    Button,
    Tooltip,
    ButtonGroup, Radio,
    RadioGroup,
    FormControlLabel, MenuItem,
    Select,
    FormControl,
    InputLabel,
    FormLabel, Slider,
} from '@mui/material';

import {
    I18n,
    Icon,
} from '@iobroker/adapter-react-v5';

// eslint-disable-next-line import/no-cycle
import VisRxWidget from '../../visRxWidget';
import BulkEditor from './BulkEditor';

class JQuiWriteState extends VisRxWidget {
    constructor(props) {
        super(props);
        this.state.value = '';
        this.state.valueType = null;
    }

    static getWidgetInfo() {
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
                                    }
                                    if (obj?.common?.max !== undefined && obj?.common?.max !== null) {
                                        if (data.max !== obj.common.max) {
                                            data.max = obj.common.max;
                                            changed = true;
                                        }
                                        if (data.step > 0) {
                                            if (data.minmax !== obj.common.max) {
                                                data.minmax = obj.common.max;
                                                changed = true;
                                            }
                                        } else {
                                            if (data.minmax !== obj.common.min) {
                                                data.minmax = obj.common.min;
                                                changed = true;
                                            }
                                        }
                                    }
                                    if (obj?.common?.step !== undefined && obj?.common?.step !== null) {
                                        if (data.step !== obj.common.step) {
                                            data.step = obj.common.step;
                                            changed = true;
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
                            name: 'type',
                            label: 'jqui_type',
                            type: 'select',
                            default: 'value',
                            options: [
                                { value: 'value', title: 'jqui_from_value' },
                                { value: 'oid', title: 'jqui_from_oid' },
                                { value: 'toggle', title: 'jqui_toggle' },
                                { value: 'change', title: 'jqui_increment_decrement' },
                            ],
                        },
                        {
                            name: 'value_oid',
                            type: 'id',
                            hidden: data => data.type !== 'oid',
                        },
                        {
                            name: 'value',
                            type: 'id',
                            hidden: data => data.type !== 'value',
                        },
                        {
                            name: 'variant',
                            label: 'jqui_variant',
                            type: 'select',
                            noTranslation: true,
                            options: ['contained', 'outlined', 'standard'],
                            default: 'contained',
                        },
                        {
                            name: 'minmax',
                            type: 'number',
                            hidden: data => data.type !== 'change',
                            default: 1,
                        },
                        {
                            name: 'step',
                            type: 'number',
                            hidden: data => data.type !== 'change',
                            default: 1,
                        },
                        {
                            name: 'repeat_delay',
                            type: 'number',
                            hidden: data => data.type !== 'change',
                            default: 800,
                        },
                        {
                            name: 'repeat_interval',
                            type: 'number',
                            hidden: data => data.type !== 'change',
                            default: 300,
                        },
                        {
                            name: 'min',
                            type: 'number',
                            hidden: data => data.type !== 'toggle',
                            default: 0,
                        },
                        {
                            name: 'max',
                            type: 'number',
                            hidden: data => data.type !== 'toggle',
                            default: 100,
                        },
                    ],
                },
                {
                    name: 'style',
                    fields: [
                        {
                            name: 'text',
                            type: 'text',
                            default: 'Write state',
                        },
                        {
                            name: 'image',
                            type: 'image',
                            label: 'image',
                            hidden: data => !!data.icon,
                        },
                        {
                            name: 'icon',
                            type: 'icon64',
                            label: 'icon',
                            hidden: data => !!data.image,
                        },
                        {
                            name: 'text_active',
                            type: 'text',
                        },
                        {
                            name: 'image_active',
                            type: 'image',
                            label: 'image',
                            hidden: data => !!data.icon_active,
                        },
                        {
                            name: 'icon_active',
                            type: 'icon64',
                            label: 'icon',
                            hidden: data => !!data.image_active,
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: 100,
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
    }

    static findField(widgetInfo, name) {
        return VisRxWidget.findField(widgetInfo, name);
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiWriteState.getWidgetInfo();
    }

    onStateUpdated(id, state) {
        if (id === this.state.rxData.oid && state) {
            const value = state.val === null || state.val === undefined ? '' : state.val;

            if (this.state.value !== value.toString()) {
                this.setState({ value: value.toString() });
            }
        }
    }

    getControlOid() {
        if (this.state.rxData.click_id && this.state.rxData.click_id !== 'nothing_selected') {
            return this.state.rxData.click_id;
        }
        if (this.state.rxData.oid && this.state.rxData.oid !== 'nothing_selected') {
            return this.state.rxData.oid;
        }
        return '';
    }

    async onClick(indexOrValue) {
        if (this.props.editMode) {
            return;
        }

        let value;
        switch (this.state.rxData.type) {
            case 'value':
                value = this.state.rxData.value.toString();
                break;
            case 'oid': {
                value = this.state.values[`${this.state.rxData.value_oid}.val`];
                if (value === undefined || value === null) {
                    return;
                }
                break;
            }
            case 'toggle':
                value = this.state.value.toString() === (this.state.rxData.max || 0).toString() ? this.state.rxData.min : this.state.rxData.max;
                break;
            case 'change':
                value = parseFloat(this.state.rxData.value) || 0;
                value += parseFloat(this.state.rxData.step) || 0;
                if (this.state.rxData.step > 0) {
                    if (value > parseFloat(this.state.rxData.minmax)) {
                        value = parseFloat(this.state.rxData.minmax);
                    }
                } else if (value < parseFloat(this.state.rxData.minmax)) {
                    value = parseFloat(this.state.rxData.minmax);
                }

                break;
            default:
                return;
        }

        const oid = this.getControlOid();
        if (oid) {
            if (this.state.valueType === 'number') {
                this.props.context.socket.setState(oid, parseFloat(this.state.rxData[`value${indexOrValue}`]));
            } else {
                this.props.context.socket.setState(oid, this.state.rxData[`value${indexOrValue}`]);
            }
        }
        this.setState({ value: this.state.rxData[`value${indexOrValue}`] });
    }

    renderIcon(isActive) {
        let color;
        const icon = this.state.rxData.icon;
        if (icon && this.state.rxData.color) {
            color = this.state.rxData.color;
            if (isActive && this.state.rxData.color_active) {
                color = this.state.rxData.color_active;
            }
        }

        if (icon) {
            return <Icon
                key="icon"
                style={{ color }}
                src={icon}
            />;
        }
        return null;
    }

    renderText(isActive) {
        let text = this.state.rxData.text;
        let color = this.state.rxData.color;
        if (isActive && this.state.rxData.color_active) {
            color = this.state.rxData.color_active;
        }

        if (!text && this.state.rxData.type === 'oid') {
            text = this.state.values[`${this.state.rxData.value_oid}.val`];
        }

        return <span style={{ color }}>{text}</span>;
    }

    getIsActive() {
        switch (this.state.rxData.type) {
            case 'value':
                return this.state.value.toString() === this.state.rxData.value.toString();
            case 'oid': {
                let oidValue = this.state.values[`${this.state.rxData.value_oid}.val`];
                if (oidValue === undefined || oidValue === null) {
                    oidValue = '';
                }
                return this.state.value.toString() === oidValue.toString();
            }
            case 'toggle':
                return this.state.value.toString() === (this.state.rxData.max || 0).toString();
            default:
                return false;
        }
    }

    async componentWillUnmount() {
        super.componentWillUnmount();
        this.iterateInterval && clearInterval(this.iterateInterval);
        this.iterateInterval = null;
        this.iterateTimeout && clearTimeout(this.iterateTimeout);
        this.iterateTimeout = null;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        const isActive = this.getIsActive();

        const buttonStyle = {};
        // apply style from the element
        Object.keys(this.state.rxStyle).forEach(attr => {
            const value = this.state.rxStyle[attr];
            if (value !== null &&
                value !== undefined &&
                VisRxWidget.POSSIBLE_MUI_STYLES.includes(attr)
            ) {
                attr = attr.replace(
                    /(-\w)/g,
                    text => text[1].toUpperCase(),
                );
                buttonStyle[attr] = value;
            }
        });

        const content = <Button
            startIcon={this.renderIcon(isActive)}
            onClick={() => this.onClick()}
            onMouseDown={() => {
                if (this.props.editMode) {
                    return;
                }
                const delay = parseInt(this.state.rxData.repeat_delay, 10);
                if (delay) {
                    this.iterateTimeout && clearTimeout(this.iterateTimeout);
                    this.iterateTimeout = setTimeout(async () => {
                        this.iterateTimeout = null;
                        this.iterateInterval = setInterval(() => this.onClick(), parseInt(this.state.rxData.repeat_interval, 10) || 500);
                        await this.onClick();
                    }, delay);
                }
            }}
            onMouseUp={() => {
                if (this.props.editMode) {
                    return;
                }
                this.iterateInterval && clearInterval(this.iterateInterval);
                this.iterateInterval = null;
                this.iterateTimeout && clearTimeout(this.iterateTimeout);
                this.iterateTimeout = null;
            }}
            variant={this.state.rxData.variant || 'contained'}
        >
            {this.renderText(isActive)}
        </Button>;

        return <div className="vis-widget-body">
            {content}
        </div>;
    }
}

JQuiWriteState.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiWriteState;
