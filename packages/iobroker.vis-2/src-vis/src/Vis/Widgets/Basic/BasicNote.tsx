import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, IconButton, TextareaAutosize } from '@mui/material';
import { Check, Close, Delete } from '@mui/icons-material';

import type { RxRenderWidgetProps, RxWidgetInfo, VisBaseWidgetProps } from '@iobroker/types-vis-2';
import VisRxWidget, { type VisRxWidgetState } from '@/Vis/visRxWidget';

type RxData = {
    oid: string;
    max_width: number;
    html_prepend: string;
    html_append: string;
    test_text: string;
    hide_corner: boolean;
};

interface BasicNoteState extends VisRxWidgetState {
    dialog: boolean;
    text: string;
}

export default class BasicNote extends VisRxWidget<RxData, BasicNoteState> {
    constructor(props: VisBaseWidgetProps) {
        super(props);
        Object.assign(this.state, {
            dialog: false,
            text: '',
        });
    }

    /**
     * Returns the widget info which is rendered in the edit mode
     */
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplNote',
            visSet: 'basic',
            visName: 'Note',
            visPrev: 'widgets/basic/img/Prev_Note.png',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'oid',
                            type: 'id',
                        },
                        {
                            name: 'html_prepend',
                            type: 'html',
                        },
                        {
                            name: 'html_append',
                            type: 'html',
                        },
                        {
                            name: 'test_text',
                            type: 'html',
                        },
                        {
                            name: 'hide_corner',
                            label: 'basic_node_hide_corner',
                            type: 'checkbox',
                        },
                    ],
                },
            ],
            // visWidgetLabel: 'value_string',  // Label of widget
            visDefaultStyle: {
                width: 100,
                height: 70,
                'border-radius': '5px',
                'border-style': 'solid',
                'border-width': '1px',
                'border-color': '#888',
                'background-color': 'rgba(255,255,105,0.8)',
            },
        } as const;
    }

    /**
     * Enables calling widget info on the class instance itself
     */
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return BasicNote.getWidgetInfo();
    }

    renderDialog(): React.JSX.Element | null {
        if (!this.state.dialog) {
            return null;
        }
        return (
            <Dialog
                open={!0}
                onClose={() => this.setState({ dialog: false })}
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        // maxWidth: this.state.rxData.max_width,
                    },
                }}
            >
                <DialogContent>
                    <TextareaAutosize
                        style={{
                            width: 'calc(100% - 6px)',
                            minHeight: 200,
                            backgroundColor: this.props.context.themeType === 'dark' ? 'black' : 'white',
                            resize: 'vertical',
                            color: this.props.context.themeType === 'dark' ? 'white' : 'black',
                        }}
                        value={this.state.text}
                        onChange={e => this.setState({ text: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    {this.state.text ? (
                        <IconButton
                            onClick={e => {
                                e.stopPropagation();
                                this.setState({ text: '' });
                            }}
                        >
                            {<Delete />}
                        </IconButton>
                    ) : null}
                    <div style={{ flex: 1 }} />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={e => {
                            e.stopPropagation();
                            this.setState({ dialog: false });
                            this.props.context.setValue(this.state.rxData.oid, this.state.text);
                        }}
                    >
                        {<Check />}
                    </Button>
                    <Button
                        variant="contained"
                        color="grey"
                        onClick={e => {
                            e.stopPropagation();
                            this.setState({ dialog: false });
                        }}
                    >
                        {<Close />}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    /**
     * Renders the widget
     *
     * @param props props passed to the parent classes render method
     */
    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | null {
        super.renderWidgetBody(props);

        let corner: React.JSX.Element | null = null;
        if (!this.state.rxData.hide_corner) {
            corner = (
                <div
                    style={{
                        position: 'absolute',
                        right: -10,
                        bottom: -10,
                        width: 20,
                        height: 20,
                        backgroundColor: this.state.rxStyle['border-color'],
                        transform: 'rotate(45deg)',
                    }}
                />
            );
        }

        return (
            <div
                className="vis-widget-body"
                onClick={() =>
                    !this.props.editMode &&
                    this.setState({ dialog: true, text: this.state.values[`${this.state.rxData.oid}.val`] })
                }
            >
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        overflow: this.state.rxData.hide_corner ? undefined : 'hidden',
                    }}
                >
                    <div
                        style={{
                            padding: 10,
                            cursor: this.props.editMode ? 'default' : 'pointer',
                            width: 'calc(100% - 20px)',
                            height: 'calc(100% - 20px)',
                        }}
                    >
                        {!this.props.editMode ? this.renderDialog() : null}
                        {this.state.rxData.html_prepend || ''}
                        {this.props.editMode && this.state.rxData.test_text
                            ? this.state.rxData.test_text
                            : this.state.values[`${this.state.rxData.oid}.val`] || ''}
                        {this.state.rxData.html_append || ''}
                    </div>
                    {corner}
                </div>
            </div>
        );
    }
}
