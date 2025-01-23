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

import { IconButton, TextField, InputAdornment, Button } from '@mui/material';

import { KeyboardReturn } from '@mui/icons-material';

import { I18n, type LegacyConnection } from '@iobroker/adapter-react-v5';

import VisRxWidget, { type VisRxWidgetState } from '../../visRxWidget';
import type {
    RxRenderWidgetProps,
    RxWidgetInfo,
    RxWidgetInfoAttributesField,
    VisBaseWidgetProps,
    Writeable,
} from '@iobroker/types-vis-2';

type RxData = {
    label: string;
    oid: string;
    asString: boolean;
    autoFocus: boolean;
    readOnly: boolean;
    withEnter: boolean;
    buttontext: string;
    selectAllOnFocus: boolean;
    unit: string;
    no_style: boolean;
    jquery_style: boolean;
    variant: 'filled' | 'outlined' | 'standard';
    size: number;
};

interface JQuiInputState extends VisRxWidgetState {
    input: string;
}

class JQuiInput<P extends RxData = RxData, S extends JQuiInputState = JQuiInputState> extends VisRxWidget<P, S> {
    private focused: boolean = false;
    private readonly inputRef: React.RefObject<HTMLInputElement>;
    private jQueryDone: boolean = false;
    private object: ioBroker.StateObject | null = null;

    constructor(props: VisBaseWidgetProps) {
        super(props);
        Object.assign(this.state, {
            input: '',
        });
        this.inputRef = React.createRef();
    }

    static getWidgetInfo(): RxWidgetInfo {
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
                            onChange: async (
                                _field: RxWidgetInfoAttributesField,
                                data: RxData,
                                changeData: (newData: RxData) => void,
                                socket: LegacyConnection,
                            ): Promise<void> => {
                                if (data.oid && data.oid !== 'nothing_selected') {
                                    const obj = await socket.getObject(data.oid);
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
                    fields: [
                        { name: 'no_style', type: 'checkbox', hidden: (data: RxData): boolean => data.jquery_style },
                        {
                            name: 'jquery_style',
                            label: 'jqui_jquery_style',
                            type: 'checkbox',
                            hidden: (data: RxData): boolean => data.no_style,
                        },
                        {
                            name: 'variant',
                            label: 'jqui_variant',
                            type: 'select',
                            noTranslation: true,
                            options: ['filled', 'outlined', 'standard'],
                            default: 'standard',
                            hidden: (data: RxData): boolean => data.jquery_style || data.no_style,
                        },
                        {
                            name: 'size',
                            type: 'slider',
                            min: 4,
                            max: 100,
                            default: 10,
                            hidden: (data: RxData): boolean => !data.no_style,
                        },
                    ],
                },
            ],
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return JQuiInput.getWidgetInfo();
    }

    static findField<Field extends { [x: string]: any } = RxWidgetInfoAttributesField>(
        widgetInfo: RxWidgetInfo,
        name: string,
    ): Writeable<Field> | null {
        return VisRxWidget.findField(widgetInfo, name) as unknown as Writeable<Field>;
    }

    async componentDidMount(): Promise<void> {
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

        if (
            this.inputRef.current &&
            this.state.rxData.autoFocus &&
            !this.props.editMode &&
            (this.state.rxData.jquery_style || this.state.rxData.no_style)
        ) {
            setTimeout(() => this.inputRef.current.focus(), 100);
        }
    }

    onStateUpdated(id: string, state: ioBroker.State | null | undefined): void {
        super.onStateUpdated(id, state);
        if (state?.val || state?.val === 0) {
            if (id === this.state.rxData.oid && !this.focused) {
                if (state.val.toString() !== this.state.input.toString()) {
                    this.setState({ input: state.val as string });
                }
            }
        }
    }

    componentDidUpdate(): void {
        if (this.inputRef.current) {
            if (this.state.rxData.jquery_style && !this.jQueryDone) {
                this.jQueryDone = true;
                (window as any).jQuery(this.inputRef.current).button().addClass('ui-state-default');
            }
        }
    }

    async setValue(value: string): Promise<void> {
        if (this.object?._id !== this.state.rxData.oid) {
            this.object = (await this.props.context.socket.getObject(this.state.rxData.oid)) as
                | ioBroker.StateObject
                | null
                | undefined;
            if (!this.object) {
                return;
            }
        }
        if (this.object?.common?.type === 'number') {
            let fValue = parseFloat(value.replace(',', '.'));
            if (Number.isNaN(value)) {
                fValue = 0;
            }
            this.props.context.setValue(this.state.rxData.oid, fValue);
        } else {
            this.props.context.setValue(this.state.rxData.oid, value);
        }
    }

    onChange(value: string): void {
        this.setState({ input: value });
        if (!this.state.rxData.withEnter) {
            void this.setValue(value);
        }
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);

        props.style.overflow = 'visible';

        let content;
        const label = this.state.rxData.label; // title for back compatibility with tplJquiInputSet
        if (!this.state.rxData.jquery_style && !this.state.rxData.no_style) {
            content = (
                <TextField
                    fullWidth
                    value={
                        this.state.input === null || this.state.input === undefined
                            ? ''
                            : this.state.rxData.asString
                              ? this.state.input.toString()
                              : this.state.input
                    }
                    type={this.state.rxData.asString ? 'text' : 'number'}
                    onFocus={e => {
                        this.focused = true;
                        if (this.state.rxData.selectAllOnFocus) {
                            e.target.select();
                        }
                    }}
                    onBlur={() => (this.focused = false)}
                    autoFocus={!this.props.editMode && this.state.rxData.autoFocus}
                    variant={this.state.rxData.variant === undefined ? 'standard' : this.state.rxData.variant}
                    slotProps={{
                        htmlInput: {
                            readOnly: this.state.rxData.readOnly,
                        },
                        input: {
                            endAdornment:
                                this.state.rxData.withEnter && !this.state.rxData.readOnly ? (
                                    <InputAdornment position="end">
                                        {this.state.rxData.buttontext ? (
                                            <Button
                                                onClick={() => this.setValue(this.state.input)}
                                                variant="contained"
                                                style={{ marginBottom: 10, minWidth: 40 }}
                                            >
                                                {this.state.rxData.buttontext}
                                            </Button>
                                        ) : (
                                            <IconButton
                                                onClick={() => this.setValue(this.state.input)}
                                                edge="end"
                                            >
                                                <KeyboardReturn />
                                            </IconButton>
                                        )}
                                    </InputAdornment>
                                ) : undefined,
                            startAdornment: this.state.rxData.unit ? (
                                <InputAdornment position="start">{this.state.rxData.unit}</InputAdornment>
                            ) : undefined,
                        },
                    }}
                    label={label}
                    onChange={e => this.onChange(e.target.value)}
                />
            );
        } else {
            content = [
                <div
                    key="label"
                    style={{ marginRight: 8 }}
                >
                    {label}
                </div>,
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
                    onBlur={() => (this.focused = false)}
                    onChange={e => this.onChange(e.target.value)}
                />,
                this.state.rxData.withEnter && !this.state.rxData.readOnly ? (
                    <IconButton
                        style={{ marginRight: 5 }}
                        key="button"
                        onClick={() => this.setValue(this.state.input)}
                        edge="end"
                    >
                        <KeyboardReturn />
                    </IconButton>
                ) : undefined,
            ];
        }

        return (
            <div
                className="vis-widget-body"
                style={{ display: 'flex', alignItems: 'center' }}
            >
                {content}
            </div>
        );
    }
}

export default JQuiInput;
