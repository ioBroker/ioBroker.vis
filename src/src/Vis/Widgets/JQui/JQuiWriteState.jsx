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
} from '@mui/material';

import {
    Icon,
} from '@iobroker/adapter-react-v5';

// eslint-disable-next-line import/no-cycle
import VisRxWidget from '../../visRxWidget';

class JQuiWriteState extends VisRxWidget {
    constructor(props) {
        super(props);
        this.state.value = '';
        this.state.valueType = null;
    }

    static getWidgetInfo() {
        return {
            id: 'tplIconState',
            visSet: 'jqui',
            visName: 'Icon State',
            visWidgetLabel: 'Write value',
            visPrev: 'widgets/jqui/img/Prev_WriteState.png',
            visOrder: 26,
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
                                        } else if (data.minmax !== obj.common.min) {
                                            data.minmax = obj.common.min;
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
                            name: 'type',
                            label: 'jqui_type',
                            type: 'select',
                            default: 'value',
                            options: [
                                { value: 'value', label: 'jqui_from_value' },
                                { value: 'oid', label: 'jqui_from_oid' },
                                { value: 'toggle', label: 'jqui_toggle' },
                                { value: 'change', label: 'jqui_increment_decrement' },
                            ],
                        },
                        {
                            name: 'value_oid',
                            type: 'id',
                            hidden: data => data.type !== 'oid',
                        },
                        {
                            name: 'value',
                            type: 'text',
                            hidden: data => data.type !== 'value',
                        },
                        {
                            name: 'step',
                            type: 'number',
                            hidden: data => data.type !== 'change',
                            default: 1,
                        },
                        {
                            name: 'minmax',
                            label: 'jqui_max',
                            type: 'number',
                            hidden: data => data.type !== 'change' || (parseFloat(data.step) || 0) < 0,
                            default: 1,
                        },                        {
                            name: 'minmax',
                            label: 'jqui_min',
                            type: 'number',
                            hidden: data => data.type !== 'change' || (parseFloat(data.step) || 0) >= 0,
                            default: 1,
                        },
                        {
                            name: 'repeat_delay',
                            type: 'number',
                            label: 'jqui_repeat_delay',
                            hidden: data => data.type !== 'change',
                            default: 800,
                        },
                        {
                            name: 'repeat_interval',
                            type: 'number',
                            label: 'jqui_repeat_interval',
                            hidden: data => data.type !== 'change',
                            default: 300,
                        },
                        {
                            name: 'min',
                            type: 'number',
                            label: 'jqui_min',
                            hidden: data => data.type !== 'toggle',
                            default: 0,
                        },
                        {
                            name: 'max',
                            label: 'jqui_max',
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
                            name: 'variant',
                            label: 'jqui_variant',
                            type: 'select',
                            noTranslation: true,
                            options: ['contained', 'outlined', 'standard'],
                            default: 'contained',
                        },
                        {
                            name: 'text',
                            type: 'text',
                            default: 'Write state',
                        },
                        {
                            name: 'src',
                            type: 'image',
                            label: 'jqui_image',
                            hidden: data => !!data.icon,
                        },
                        {
                            name: 'icon',
                            type: 'icon64',
                            label: 'jqui_icon',
                            hidden: data => !!data.src,
                        },
                        {
                            name: 'text_active',
                            label: 'jqui_text_active',
                            type: 'text',
                        },
                        {
                            name: 'src_active',
                            type: 'image',
                            label: 'jqui_image_active',
                            hidden: data => !!data.icon_active,
                        },
                        {
                            name: 'icon_active',
                            type: 'icon64',
                            label: 'jqui_icon_active',
                            hidden: data => !!data.src_active,
                        },
                        {
                            name: 'invert_icon',
                            type: 'checkbox',
                            hidden: data => !data.icon || !data.src,
                        },
                        {
                            name: 'invert_icon_active',
                            type: 'checkbox',
                            hidden: data => !data.icon_active || !data.src_active,
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
            try {
                const state = await this.props.context.socket.getState(this.state.rxData.oid);
                this.onStateUpdated(this.state.rxData.oid, state);
            } catch (e) {
                console.error(`Cannot get state ${this.state.rxData.oid}: ${e}`);
            }
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

    async onClick() {
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
                value = parseFloat(this.state.values[`${this.state.rxData.oid}.val`]) || 0;
                value = value.toString() === (this.state.rxData.max || 0).toString() ? this.state.rxData.min : this.state.rxData.max;
                break;
            case 'change':
                value = parseFloat(this.state.values[`${this.state.rxData.oid}.val`]) || 0;
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
                this.props.context.socket.setState(oid, parseFloat(value));
            } else {
                this.props.context.socket.setState(oid, value);
            }
        }
        this.setState({ value });
    }

    renderIcon(isActive) {
        let color;
        let icon;
        let invertIcon = null;
        if (isActive) {
            invertIcon = this.state.rxData.invert_icon_active;
            icon = this.state.rxData.icon_active || this.state.rxData.src_active;
            color = this.state.rxData.color_active;
        }
        if (!icon) {
            icon = this.state.rxData.icon || this.state.rxData.src;
            invertIcon = this.state.rxData.invert_icon;
            color = this.state.rxData.color;
        }

        if (icon) {
            return <Icon
                key="icon"
                style={{
                    color,
                    filter: invertIcon ? 'invert(100%)' : undefined,
                    width: '100%',
                    height: '100%',
                }}
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

        if (!text) {
            if (this.state.rxData.type === 'oid') {
                text = this.state.values[`${this.state.rxData.value_oid}.val`];
            } else if (this.state.rxData.type === 'value') {
                text = this.state.rxData.value;
            } else if (this.state.rxData.type === 'change') {
                text = this.state.rxData.step;
                if (text > 0) {
                    text = `+${text}`;
                }
            }
        }

        return text ? <span style={{ color }}>{text}</span> : null;
    }

    getIsActive() {
        let actualValue = this.state.value;
        if (actualValue === undefined || actualValue === null) {
            actualValue = '';
        }

        switch (this.state.rxData.type) {
            case 'value': {
                let desiredValue = this.state.rxData.value;
                if (desiredValue === undefined || desiredValue === null) {
                    desiredValue = '';
                }
                return actualValue.toString() === desiredValue.toString();
            }
            case 'oid': {
                let oidValue = this.state.values[`${this.state.rxData.value_oid}.val`];
                if (oidValue === undefined || oidValue === null) {
                    oidValue = '';
                }
                return actualValue.toString() === oidValue.toString();
            }
            case 'toggle':
                return actualValue.toString() === (this.state.rxData.max || 0).toString();
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

        const text = this.renderText(isActive);

        const content = <Button
            style={{
                width: '100%',
                height: '100%',
            }}
            color={isActive ? 'primary' : 'grey'}
            startIcon={text ? this.renderIcon(isActive) : null}
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
                        this.iterateInterval && clearInterval(this.iterateInterval);
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
            {text || this.renderIcon(isActive)}
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
