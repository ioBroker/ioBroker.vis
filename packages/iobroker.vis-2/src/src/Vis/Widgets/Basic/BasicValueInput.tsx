/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2022-2023 Denis Haev https://github.com/GermanBluefox,
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

import { IconButton, TextField } from '@mui/material';

import { KeyboardReturn as EnterIcon } from '@mui/icons-material';

// eslint-disable-next-line import/no-cycle
import type { RxRenderWidgetProps } from '@iobroker/types-vis-2';
import VisRxWidget, { type VisRxWidgetState } from '../../visRxWidget';

// eslint-disable-next-line no-use-before-define
type RxData = {
    oid: string;
    html_prepend?: string;
    html_append?: string;
    numeric?: boolean;
    min?: number;
    max?: number;
    autoSet?: boolean;
    readOnly?: boolean;
    autoFocus?: boolean;
    withEnter?: boolean;
    noStyle?: boolean;
    autoSetDelay?: number;
    variant?: 'standard' | 'outlined' | 'filled';
};

interface BasicValueInputState extends VisRxWidgetState {
    value: string;
    sentValue: boolean;
}

class BasicValueInput extends VisRxWidget<RxData, BasicValueInputState> {
    private setTimer: ReturnType<typeof setTimeout> | null = null;

    static getWidgetInfo() {
        return {
            id: 'tplValueInput',
            visSet: 'basic',
            visName: 'Input val',
            visWidgetLabel: 'vis-2-widgets-basic-input_value',   // Label of widget
            visPrev: 'widgets/basic/img/Prev_ValueInput.png',
            visAttrs: [{
                name: 'common',
                fields: [
                    { name: 'oid', type: 'id' },
                    { name: 'html_prepend', type: 'html' },
                    { name: 'html_append', type: 'html' },
                    { name: 'numeric', type: 'checkbox' },
                    { name: 'min', type: 'number', hidden: '!data.numeric' },
                    { name: 'max', type: 'number', hidden: '!data.numeric' },
                    { name: 'autoSet', type: 'checkbox' },
                    {
                        name: 'autoSetDelay',
                        label: 'vis-2-widgets-basic-autoSetDelay',
                        type: 'number',
                        hidden: '!data.autoSet',
                        default: 1000,
                    },
                    { name: 'readOnly', type: 'checkbox' },
                    { name: 'autoFocus', type: 'checkbox' },
                    { name: 'noStyle', type: 'checkbox', label: 'vis-2-widgets-basic-noStyle' },
                    { name: 'withEnter', type: 'checkbox', hidden: '!!data.noStyle' },
                    {
                        name: 'variant',
                        type: 'select',
                        hidden: '!!data.noStyle',
                        noTranslation: true,
                        options: [
                            { value: 'standard', label: 'standard' },
                            { value: 'outlined', label: 'outlined' },
                            { value: 'standard', label: 'standard' },
                        ],
                        default: 'standard',
                    },
                ],
            }],
            visDefaultStyle: {
                width: 150,
                height: 70,
            },
        } as const;
    }

    componentDidMount() {
        super.componentDidMount();

        const oid = this.state.rxData.oid && this.state.rxData.oid !== 'nothing_selected' && this.state.rxData.oid.includes('"') ? '' : this.state.rxData.oid || '';
        let value: string;
        if (this.state.rxData.oid) {
            if (this.state.rxData.oid.includes('"')) {
                value = this.state.rxData.oid.substring(1, this.state.rxData.oid.length - 1);
            } else if (oid) {
                value = this.state.values[`${oid}.val`] !== null && this.state.values[`${oid}.val`] !== undefined ? this.state.values[`${oid}.val`].toString() : '';
            } else {
                value = '';
            }
        } else {
            value = '';
        }

        this.setState({ value, sentValue: true });
    }

    onStateUpdated(id: string, state: ioBroker.State | null) {
        if (id === this.state.rxData.oid && state && state.val !== null && state.val !== undefined) {
            const valStr = state.val.toString();
            if (this.state.value.toString() !== valStr) {
                this.setState({ value: valStr });
            }
        }
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return BasicValueInput.getWidgetInfo();
    }

    renderWidgetBody(props: RxRenderWidgetProps) {
        super.renderWidgetBody(props);

        // set default width and height
        if (props.style.width === undefined) {
            props.style.width = 100;
        }
        if (props.style.height === undefined) {
            props.style.height = 25;
        }
        const oid = this.state.rxData.oid && this.state.rxData.oid !== 'nothing_selected' && this.state.rxData.oid.includes('"') ? '' : this.state.rxData.oid || '';

        let value;
        if (this.state.rxData.oid) {
            if (this.state.rxData.oid.includes('"')) {
                value = this.state.rxData.oid.substring(1, this.state.rxData.oid.length - 1);
            } else if (oid) {
                value = this.state.value;
                if (value === undefined || value === null) {
                    value = '';
                }
            } else {
                value = '';
            }
        } else {
            value = '';
        }

        let content;
        if (this.state.rxData.noStyle) {
            content = <input
                type={this.state.rxData.numeric ? 'number' : 'text'}
                style={{
                    flexGrow: 1,
                    height: 'calc(100% - 6px)',
                    backgroundColor: this.props.context.themeType === 'dark' ? '#333' : '#fff',
                    color: this.props.context.themeType === 'dark' ? '#FFF' : '#000',
                }}
                readOnly={this.state.rxData.readOnly || this.props.editMode}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={this.state.rxData.autoFocus}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    this.setState({ value: e.target.value, sentValue: false }, () => {
                        if (this.state.rxData.autoSet) {
                            this.setTimer && clearTimeout(this.setTimer);
                            this.setTimer = setTimeout(() => {
                                this.setTimer = null;
                                this.setState({ sentValue: true }, () =>
                                    this.props.context.setValue(oid, this.state.value));
                            }, this.state.rxData.autoSetDelay || 1000);
                        }
                    })}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter' && oid) {
                        this.setState({ sentValue: true }, () =>
                            this.props.context.setValue(oid, this.state.value));
                    }
                }}
            />;
        } else {
            content = <TextField
                type={this.state.rxData.numeric ? 'number' : 'text'}
                style={{ flexGrow: 1, height: '100%' }}
                sx={{
                    '& .MuiInputBase-root': {
                        height: '100%',
                    },
                }}
                variant={this.state.rxData.variant}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                    readOnly: this.state.rxData.readOnly || this.props.editMode,
                    endAdornment: !this.props.editMode && this.state.rxData.withEnter && oid && !this.state.sentValue ? <IconButton
                        size="small"
                        onClick={() => this.setState({ sentValue: true }, () =>
                            this.props.context.setValue(oid, this.state.value))}
                    >
                        <EnterIcon />
                    </IconButton> : null,
                }}
                label={this.state.rxData.html_prepend}
                helperText={this.state.rxData.html_append}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    this.setState({ value: e.target.value, sentValue: false }, () => {
                        if (this.state.rxData.autoSet && oid) {
                            this.setTimer && clearTimeout(this.setTimer);
                            this.setTimer = setTimeout(() => {
                                this.setTimer = null;
                                this.setState({ sentValue: true }, () =>
                                    this.props.context.setValue(oid, this.state.value));
                            }, this.state.rxData.autoSetDelay || 1000);
                        }
                    });
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter' && oid) {
                        this.setState({ sentValue: true }, () =>
                            this.props.context.setValue(oid, this.state.value));
                    }
                }}
            />;
        }

        return <div className="vis-widget-body" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {this.state.rxData.noStyle ? <span
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: this.state.rxData.html_prepend ?? '' }}
            /> : null}
            {content}
            {this.state.rxData.noStyle ? <span
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: this.state.rxData.html_append ?? '' }}
            /> : null}
        </div>;
    }
}

export default BasicValueInput;
