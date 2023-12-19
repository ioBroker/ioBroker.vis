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
    IconButton,
    TextField,
    InputAdornment, Button,
} from '@mui/material';

import { KeyboardReturn } from '@mui/icons-material';

import { I18n } from '@iobroker/adapter-react-v5';

// eslint-disable-next-line import/no-cycle
import VisRxWidget from '../../visRxWidget';

class JQuiInput extends VisRxWidget {
    constructor(props) {
        super(props);
        this.state.input = '';
        this.focused = false;
        this.inputRef = React.createRef();
    }

    static getWidgetInfo() {
        return {
            id: 'tplJquiInput',
            visSet: 'jqui',
            visName: 'Input',
            visWidgetLabel: 'jqui_input',
            visPrev: 'widgets/jqui/img/Prev_Input.png',
            visOrder: 13,
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'label',
                            type: 'text',
                            default: I18n.t('jqui_input').replace('jqui_', ''),
                        },
                        {
                            name: 'oid',
                            type: 'id',
                            onChange: async (field, data, changeData, socket) => {
                                if (data[field.name] && data[field.name] !== 'nothing_selected') {
                                    const obj = await socket.getObject(data[field.name]);
                                    let changed = false;
                                    if (obj?.common?.unit) {
                                        if (data.unit !== obj.common.unit) {
                                            data.unit = obj.common.unit;
                                            changed = true;
                                        }
                                    }
                                    if (obj?.common?.type !== 'number') {
                                        if (!data.asString) {
                                            data.asString = true;
                                            changed = true;
                                        }
                                    } else if (obj?.common?.type === 'number') {
                                        if (data.asString) {
                                            data.asString = false;
                                            changed = true;
                                        }
                                    }
                                    changed && changeData(data);
                                }
                            },
                        },
                        {
                            name: 'asString',
                            type: 'checkbox',
                            label: 'jqui_as_string',
                        },
                        // {
                        //     name: 'digits',
                        //     type: 'slider',
                        //     min: 0,
                        //     max: 5,
                        //     hidden: data => !!data.asString,
                        // },
                        {
                            name: 'autoFocus',
                            type: 'checkbox',
                            min: 0,
                            max: 5,
                        },
                        {
                            name: 'readOnly',
                            type: 'checkbox',
                            label: 'jqui_read_only',
                        },
                        {
                            name: 'withEnter',
                            type: 'checkbox',
                            label: 'jqui_with_enter_button',
                            hidden: '!!data.readOnly',
                        },
                        {
                            name: 'buttontext',
                            type: 'text',
                            label: 'jqui_button_text',
                            hidden: '!data.withEnter || !!data.readOnly',
                        },
                        {
                            name: 'selectAllOnFocus',
                            type: 'checkbox',
                            label: 'jqui_select_all_on_focus',
                            tooltip: 'jqui_select_all_on_focus_tooltip',
                        },
                        {
                            name: 'unit',
                            type: 'text',
                            label: 'jqui_unit',
                        },
                    ],
                },
                {
                    name: 'style',
                    hidden: data => !!data.externalDialog,
                    fields: [
                        { name: 'no_style', type: 'checkbox', hidden: data => data.jquery_style },
                        {
                            name: 'jquery_style',
                            label: 'jqui_jquery_style',
                            type: 'checkbox',
                            hidden: data => data.no_style,
                        },
                        {
                            name: 'variant',
                            label: 'jqui_variant',
                            type: 'select',
                            noTranslation: true,
                            options: ['filled', 'outlined', 'standard'],
                            default: 'standard',
                            hidden: data => data.jquery_style || data.no_style,
                        },
                        {
                            name: 'size',
                            type: 'slider',
                            min: 4,
                            max: 100,
                            default: 10,
                            hidden: data => !data.no_style,
                        },
                    ],
                },
            ],
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiInput.getWidgetInfo();
    }

    static findField(widgetInfo, name) {
        return super.findField(widgetInfo, name);
    }

    async componentDidMount() {
        super.componentDidMount();

        try {
            const input = await this.props.context.socket.getState(this.state.rxData.oid);
            if (input && input.val !== undefined && input.val !== null) {
                input.val = input.val.toString();
                this.setState({ input: input.val });
            }
        } catch (error) {
            console.error(`Cannot get state ${this.state.rxData.oid}: ${error}`);
        }

        if (this.inputRef.current &&
            this.state.rxData.autoFocus &&
            !this.props.editMode &&
            (this.state.rxData.jquery_style || this.state.rxData.no_style)
        ) {
            setTimeout(() => this.inputRef.current.focus(), 100);
        }
    }

    onStateUpdated(id, state) {
        super.onStateUpdated(id, state);
        if (state?.val || state?.val === 0) {
            if (id === this.state.rxData.oid && !this.focused) {
                if (state.val.toString() !== this.state.input.toString()) {
                    this.setState({ input: state.val });
                }
            }
        }
    }

    async componentDidUpdate() {
        if (this.inputRef.current) {
            if (this.state.rxData.jquery_style && !this.inputRef.current._jQueryDone) {
                this.inputRef.current._jQueryDone = true;
                window.jQuery(this.inputRef.current).button().addClass('ui-state-default');
            }
        }
    }

    async setValue(value) {
        if (this.object?._id !== this.state.rxData.oid) {
            this.object = await this.props.context.socket.getObject(this.state.rxData.oid);
            if (!this.object) {
                return;
            }
        }
        if (this.object?.common?.type === 'number') {
            value = parseFloat(value.replace(',', '.'));
            if (Number.isNaN(value)) {
                value = 0;
            }
        }
        await this.props.context.setValue(this.state.rxData.oid, value);
    }

    onChange(value) {
        this.setState({ input: value });
        if (!this.state.rxData.withEnter) {
            this.setValue(value);
        }
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        props.style.overflow = 'visible';

        let content;
        const label = this.state.rxData.label === undefined ? this.state.rxData.title : this.state.rxData.label; // title for back compatibility with tplJquiInputSet
        if (!this.state.rxData.jquery_style && !this.state.rxData.no_style) {
            content = <TextField
                fullWidth
                value={this.state.input === null || this.state.input === undefined ? '' : (this.state.rxData.asString ? this.state.input.toString() : this.state.input)}
                type={this.state.rxData.asString ? 'text' : 'number'}
                onFocus={e => {
                    this.focused = true;
                    if (this.state.rxData.selectAllOnFocus) {
                        e.target.select();
                    }
                }}
                onBlur={() => this.focused = false}
                autoFocus={!this.props.editMode && this.state.rxData.autoFocus}
                variant={this.state.rxData.variant === undefined ? 'standard' : this.state.rxData.variant}
                inputProps={{ readOnly: this.state.rxData.readOnly }}
                // eslint-disable-next-line react/jsx-no-duplicate-props
                InputProps={{
                    endAdornment: this.state.rxData.withEnter && !this.state.rxData.readOnly ? <InputAdornment position="end">
                        {this.state.rxData.buttontext? <Button
                            onClick={() => this.setValue(this.state.input)}
                            variant="contained"
                            style={{ marginBottom: 10, minWidth: 40 }}
                        >
                            {this.state.rxData.buttontext}
                        </Button> :
                            <IconButton
                                onClick={() => this.setValue(this.state.input)}
                                edge="end"
                            >
                                <KeyboardReturn />
                            </IconButton>}
                    </InputAdornment> : undefined,
                    startAdornment: this.state.rxData.unit ? <InputAdornment position="start">
                        {this.state.rxData.unit}
                    </InputAdornment> : undefined,
                }}
                label={label}
                onChange={e => this.onChange(e.target.value)}
            />;
        } else {
            content = [
                <div key="label" style={{ marginRight: 8 }}>{label}</div>,
                <input
                    style={{ flexGrow: 1 }}
                    key="input"
                    readOnly={this.state.rxData.readOnly}
                    value={this.state.input || ''}
                    ref={this.inputRef}
                    size={this.state.rxData.size || 10}
                    onFocus={e => {
                        this.focused = true;
                        if (this.state.rxData.selectAllOnFocus) {
                            e.target.select();
                        }
                    }}
                    onBlur={() => this.focused = false}
                    onChange={e => this.onChange(e.target.value)}
                />,
                this.state.rxData.withEnter && !this.state.rxData.readOnly ? <IconButton
                    style={{ marginRight: 5 }}
                    key="button"
                    onClick={() => this.setValue(this.state.input)}
                    edge="end"
                >
                    <KeyboardReturn />
                </IconButton> : undefined,
            ];
        }

        return <div className="vis-widget-body" style={{ display: 'flex', alignItems: 'center' }}>
            {content}
        </div>;
    }
}

JQuiInput.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiInput;
