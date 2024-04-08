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
    Autocomplete,
    Button, Fab, TextField,
} from '@mui/material';

import {
    I18n, Icon,
} from '@iobroker/adapter-react-v5';

// eslint-disable-next-line import/no-cycle
import VisRxWidget from '../../visRxWidget';

class JQuiButtonDialogClose extends VisRxWidget {
    constructor(props) {
        super(props);
        this.state.width = 0;
        this.state.height = 0;
    }

    static getWidgetInfo() {
        return {
            id: 'tplJquiButtonDialogClose',
            visSet: 'jqui',
            visName: 'Button dialog close',
            visWidgetLabel: 'jqui_button_dialog_close',
            visPrev: 'widgets/jqui/img/Prev_ButtonDialogClose.png',
            visOrder: 13,
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'dlgName',
                            label: 'jqui_dialog_name',
                            tooltip: 'jqui_dialog_name_tooltip',
                            type: 'custom',
                            component: (
                                field,
                                data,
                                onDataChange,
                                options, // {context: {adapterName, instance, projectName, socket, views}, selectedView, selectedWidget, selectedWidgets}
                            ) => {
                                // find all possible dialogs
                                const names = [];
                                Object.keys(options.context.views).forEach(id => {
                                    const widgets = options.context.views[id].widgets;
                                    widgets && Object.keys(widgets).forEach(widget => {
                                        if (widgets[widget].data?.html_dialog || widgets[widget].data?.contains_view || widgets[widget].data?.externalDialog) {
                                            if (widgets[widget].data.dialogName) {
                                                names.push({ label: `${widgets[widget].data.dialogName} (${widget})`, value: widgets[widget].data.dialogName });
                                            } else {
                                                names.push({ label: widget, value: widget });
                                            }
                                        }
                                    });
                                });
                                return <Autocomplete
                                    freeSolo
                                    options={names}
                                    variant="standard"
                                    value={data[field.name] || ''}
                                    sx={{ width: '100%' }}
                                    onInputChange={(e, inputValue) => {
                                        if (typeof inputValue === 'object' && inputValue !== null) {
                                            inputValue = inputValue.value;
                                        }
                                        onDataChange({ [field.name]: inputValue });
                                    }}
                                    onChange={(e, inputValue) => {
                                        if (typeof inputValue === 'object' && inputValue !== null) {
                                            inputValue = inputValue.value;
                                        }
                                        onDataChange({ [field.name]: inputValue });
                                    }}
                                    getOptionLabel={option => {
                                        if (typeof option === 'string') {
                                            return option;
                                        }
                                        return option.label;
                                    }}
                                    renderInput={params => <TextField variant="standard" {...params} />}
                                />;
                            },
                        },
                        {
                            name: 'buttontext',
                            type: 'text',
                            default: I18n.t('jqui_Close').replace('jqui_', ''),
                            hidden: data => !!data.html,
                        },
                        {
                            name: 'html',
                            type: 'html',
                            default: '',
                            tooltip: 'jqui_html_tooltip',
                            disabled: data => !!data.buttontext || !!data.icon || !!data.src,
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
                            name: 'padding',
                            type: 'slider',
                            min: 0,
                            max: 100,
                            default: 5,
                            // hidden: data => !data.no_style && !data.jquery_style,
                        },
                        {
                            name: 'variant',
                            label: 'jqui_variant',
                            type: 'select',
                            noTranslation: true,
                            options: ['contained', 'outlined', 'standard'],
                            default: 'contained',
                            hidden: data => data.jquery_style || data.no_style,
                        },
                        {
                            name: 'color',
                            label: 'jqui_button_color',
                            type: 'select',
                            noTranslation: true,
                            options: ['', 'primary', 'secondary'],
                            default: '',
                            hidden: data => data.jquery_style || data.no_style,
                        },
                        { name: 'html_prepend', type: 'html' },
                        { name: 'html_append', type: 'html' },
                        {
                            name: 'visResizable', // reserved name for resizable
                            label: 'visResizable',
                            type: 'checkbox',
                            default: false,
                            desiredSize: false, // If sizes should be deleted or set to specific value. `false` - delete sizes, or {width: 100, height: 100}
                        },
                    ],
                },
                {
                    name: 'icon',
                    hidden: data => !!data.html,
                    fields: [
                        {
                            name: 'src',
                            label: 'jqui_image',
                            type: 'image',
                            hidden: data => data.icon || data.jquery_style,
                        },
                        {
                            name: 'icon',
                            label: 'jqui_icon',
                            type: 'icon64',
                            default: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xOSA2LjQxTDE3LjU5IDVMMTIgMTAuNTlMNi40MSA1TDUgNi40MUwxMC41OSAxMkw1IDE3LjU5TDYuNDEgMTlMMTIgMTMuNDFMMTcuNTkgMTlMMTkgMTcuNTlMMTMuNDEgMTJ6Ii8+PC9zdmc+',
                            hidden: data => data.src || data.jquery_style,
                        },
                        {
                            name: 'invert_icon',
                            type: 'checkbox',
                            hidden: data => (!data.icon || !data.image) && data.jquery_style,
                        },
                        {
                            name: 'imageHeight',
                            type: 'slider',
                            min: 0,
                            max: 200,
                            default: 100,
                            hidden: data => !data.src || data.jquery_style,
                        },
                    ],
                },
            ],
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiButtonDialogClose.getWidgetInfo();
    }

    onClick() {
        let dlgName = this.state.rxData.dlgName;
        if (!dlgName) {
            // go through all widgets and find the one with dialog content as this view
            const views = Object.keys(this.props.context.views);
            for (let i = 0; i < views.length; i++) {
                const widgets = this.props.context.views[views[i]].widgets;
                if (widgets) {
                    const wids = Object.keys(widgets);
                    for (let j = 0; j < wids.length; j++) {
                        if (widgets[wids[j]].data?.contains_view === this.props.view) {
                            dlgName = wids[j];
                            break;
                        }
                    }
                }
                if (dlgName) {
                    break;
                }
            }
        }
        if (dlgName) {
            const el = window.document.getElementById(dlgName) || window.document.querySelector(`[data-dialog-name="${dlgName}"]`);

            const viewName = Object.keys(this.props.context.views).find(view => this.props.context.views[view].widgets[dlgName]);
            this.props.context.onCommand('closeDialog', viewName, dlgName);

            if (el?._showDialog) {
                el._showDialog(false);
            } else {
                // noinspection JSJQueryEfficiency
                window.jQuery(`#${dlgName}_dialog`).dialog('close');
            }
        } else {
            window.alert('Dialog not found');
        }
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const iconStyle = {
            filter: this.state.rxData.invert_icon ? 'invert(1)' : undefined,
        };

        if (!this.state.rxData.jquery_style && this.state.rxData.src) {
            if (this.state.width > this.state.height) {
                iconStyle.height = `${this.state.rxData.imageHeight || 100}%`;
                iconStyle.width = 'auto';
            } else {
                iconStyle.width = `${this.state.rxData.imageHeight || 100}%`;
                iconStyle.height = 'auto';
            }
        }
        let iconSrc = !this.state.rxData.jquery_style && (this.state.rxData.src || this.state.rxData.icon);

        if (iconSrc && iconSrc.startsWith('_PRJ_NAME/')) {
            iconSrc = iconSrc.replace('_PRJ_NAME/', `../${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}/`);
        }

        const icon = iconSrc ? <Icon
            src={iconSrc}
            style={iconStyle}
        /> : null;

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

        // extra no rxData here, as it is not possible to set it with bindings
        if (this.state.data.visResizable) {
            buttonStyle.width = '100%';
            buttonStyle.height = '100%';
        } else {
            buttonStyle.padding = this.state.rxData.padding;
        }

        let buttonText;
        if (this.state.rxData.html) {
            // ignore
        } else {
            buttonText = this.state.rxData.buttontext;
        }

        const content = [
            this.state.rxData.html_prepend ? <span
                key="prepend"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: this.state.rxData.html_prepend }}
            /> : null,
            this.state.rxData.html ?
                <span
                    key="content"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: this.state.rxData.html }}
                />
                :
                (this.state.rxData.no_style || this.state.rxData.jquery_style ?
                    <button
                        key="content"
                        type="button"
                        style={buttonStyle}
                        onClick={() => this.onClick()}
                    >
                        {icon}
                        {buttonText}
                    </button>
                    :
                    (!buttonText ?
                        <Fab
                            style={{
                                zIndex: this.props.editMode ? 0 : undefined,
                            }}
                            key="content"
                            color={this.state.rxData.color || 'grey'}
                            onClick={() => this.onClick()}
                            size="small"
                        >
                            {icon}
                        </Fab> :
                        <Button
                            key="content"
                            style={buttonStyle}
                            color={this.state.rxData.color || 'grey'}
                            variant={this.state.rxData.variant === undefined ? 'contained' : this.state.rxData.variant}
                            onClick={() => this.onClick()}
                            startIcon={icon}
                        >
                            {buttonText}
                        </Button>)),
            this.state.rxData.html_append ? <span
                key="append"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: this.state.rxData.html_append }}
            /> : null,
        ];

        return <div
            className="vis-widget-body"
            onClick={this.state.rxData.html ? () => this.onClick() : undefined}
        >
            {content}
        </div>;
    }
}

JQuiButtonDialogClose.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiButtonDialogClose;
