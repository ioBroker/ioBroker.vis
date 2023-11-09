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
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Popper,
    Paper, TextField, DialogActions,
} from '@mui/material';

import { Close, Check } from '@mui/icons-material';

import {
    I18n, Icon,
    Utils, IconCopy,
} from '@iobroker/adapter-react-v5';

// eslint-disable-next-line import/no-cycle
import VisRxWidget from '../../visRxWidget';

class JQuiButton extends VisRxWidget {
    constructor(props) {
        super(props);
        this.state.width = 0;
        this.state.height = 0;
        this.state.dialogVisible = false;
        this.state.showPassword = false;
        this.state.password = '';
        this.refButton = React.createRef();
        this.refDialog = React.createRef();
    }

    static getWidgetInfo() {
        return {
            id: 'tplJquiButtonLink',
            visSet: 'jqui',
            visName: 'Button Link',
            visSetLabel: 'jqui_set_label',
            visWidgetLabel: 'jqui_button_link',
            visPrev: 'widgets/jqui/img/Prev_ButtonLink.png',
            visOrder: 1,
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'buttontext',
                            type: 'text',
                            default: 'URL',
                            hidden: data => !!data.html || !!(data.buttontext_view && data.nav_view) || !!data.externalDialog,
                        },
                        {
                            name: 'html',
                            type: 'html',
                            default: '',
                            tooltip: 'jqui_html_tooltip',
                            disabled: data => !!data.buttontext || !!data.icon || !!data.src || !!data.externalDialog,
                        },
                        {
                            name: 'Password',
                            type: 'password',
                            label: 'password',
                            tooltip: 'jqui_password_tooltip',
                            disabled: data => !data.nav_view && !data.url && !data.href && !data.html_dialog && !data.contains_view,
                        },
                    ],
                },
                {
                    name: 'view',
                    label: 'jqui_view_group',
                    hidden: data => !!data.url || !!data.href || !!data.html_dialog || !!data.contains_view,
                    fields: [
                        {
                            name: 'nav_view',
                            label: 'jqui_nav_view',
                            type: 'views',
                        },
                        {
                            name: 'buttontext_view',
                            label: 'jqui_buttontext_view',
                            type: 'checkbox',
                            hidden: data => !data.nav_view,
                        },
                    ],
                },
                {
                    name: 'URL',
                    label: 'jqui_url_group',
                    hidden: data => !!data.html_dialog || !!data.contains_view || !!data.nav_view,
                    fields: [
                        {
                            name: 'href',
                            label: 'jqui_url_in_browser',
                            type: 'url',
                            hidden: data => !!data.url,
                            tooltip: 'jqui_href_tooltip',
                        },
                        {
                            name: 'url',
                            label: 'jqui_url_in_background',
                            type: 'url',
                            hidden: data => !!data.href,
                            tooltip: 'jqui_url_tooltip',
                        },
                        {
                            name: 'target',
                            type: 'auto',
                            options: ['_blank', '_self', '_parent', '_top'],
                            hidden: data => !!data.url || !data.href,
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
                    hidden: data => !!data.externalDialog,
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
                {
                    name: 'dialog',
                    hidden: data => !!data.url || !!data.href || !!data.nav_view,
                    fields: [
                        {
                            name: 'html_dialog',
                            type: 'html',
                            hidden: data => !!data.contains_view,
                        },
                        {
                            name: 'contains_view',
                            type: 'views',
                            hidden: data => !!data.html_dialog,
                        },
                        {
                            name: 'title',
                            type: 'text',
                            hidden: data => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'autoclose',
                            type: 'slider',
                            min: 0,
                            max: 30000,
                            step: 100,
                            hidden: data => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'modal',
                            type: 'checkbox',
                            default: true,
                            hidden: data => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'dialog_width',
                            type: 'text',
                            hidden: data => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'dialog_height',
                            type: 'text',
                            hidden: data => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'dialog_class',
                            type: 'text',
                            hidden: data => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'persistent',
                            type: 'checkbox',
                            hidden: data => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'preload',
                            type: 'checkbox',
                            hidden: data => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'closeOnClick',
                            type: 'checkbox',
                            hidden: data => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'hideCloseButton',
                            label: 'jqui_hide_close_button',
                            type: 'checkbox',
                            hidden: data => !data.html_dialog && !data.contains_view && !!data.closeOnClick,
                        },
                        /*
                        {
                            name: 'dialog_top',
                            type: 'text',
                            hidden: data => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'dialog_left',
                            type: 'text',
                            hidden: data => !data.html_dialog && !data.contains_view,
                        },
                        */
                        {
                            name: 'overflowX',
                            type: 'select',
                            noTranslation: true,
                            options: ['', 'auto', 'hidden', 'visible', 'scroll', 'initial', 'inherit'],
                            hidden: data => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'overflowY',
                            type: 'select',
                            noTranslation: true,
                            options: ['', 'auto', 'hidden', 'visible', 'scroll', 'initial', 'inherit'],
                            hidden: data => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'setId',
                            type: 'id',
                            tooltip: 'jqui_dialog_set_id_tooltip',
                            hidden: data => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'setValue',
                            type: 'text',
                            hidden: data => !data.setId || (!data.html_dialog && !data.contains_view),
                        },
                        {
                            name: 'dialogName',
                            label: 'jqui_dialog_name',
                            type: 'text',
                            hidden: data => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'externalDialog',
                            label: 'jqui_external_dialog',
                            tooltip: 'jqui_external_dialog_tooltip',
                            type: 'checkbox',
                            hidden: data => !data.html_dialog && !data.contains_view,
                        },
                    ],
                },
            ],
        };
    }

    static findField(widgetInfo, name) {
        return VisRxWidget.findField(widgetInfo, name);
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiButton.getWidgetInfo();
    }

    async componentDidMount() {
        super.componentDidMount();
        await this.componentDidUpdate();
    }

    async componentWillUnmount() {
        this.hideTimeout && clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
        super.componentWillUnmount();
    }

    async componentDidUpdate() {
        if (this.refButton.current) {
            if (this.state.rxData.jquery_style && !this.refButton.current._jQueryDone) {
                this.refButton.current._jQueryDone = true;
                window.jQuery(this.refButton.current).button();
            }
            if (this.refButton.current.clientWidth !== this.state.width || this.refButton.current.clientHeight !== this.state.height) {
                this.setState({ width: this.refButton.current.clientWidth, height: this.refButton.current.clientHeight });
            }
        }
        // from base class
        if (this.refService.current && (this.state.rxData.html_dialog || this.state.rxData.contains_view) && !this.refService.current._showDialog) {
            this.refService.current._showDialog = this.showDialog;
        }
        if (this.refService.current) {
            const dialogName = this.refService.current.dataset.dialogName;
            if ((dialogName || '') !== (this.state.rxData.dialogName || '')) {
                if (!this.state.rxData.dialogName) {
                    delete this.refService.current.dataset.dialogName;
                } else {
                    this.refService.current.dataset.dialogName = this.state.rxData.dialogName;
                }
            }
        }
    }

    showDialog = show => {
        const that = this;

        that.setState({ dialogVisible: show });

        // Auto-close
        let timeout = this.state.rxData.autoclose;
        if (timeout === true || timeout === 'true') {
            timeout = 10000;
        }
        if (timeout === null || timeout === undefined || timeout === '') {
            return;
        }
        timeout = parseInt(timeout, 10);
        if (timeout < 60) {
            // maybe this is seconds
            timeout *= 1000;
        }
        timeout = timeout || 1000;

        if (timeout) {
            if (show) {
                that.hideTimeout = setTimeout(() => {
                    that.hideTimeout = null;
                    that.showDialog(false);
                }, timeout);
            } else if (that.hideTimeout) {
                clearTimeout(that.hideTimeout);
                that.hideTimeout = null;
            }
        }
    };

    onPasswordEnter() {
        if (this.state.password === this.state.rxData.Password) {
            this.setState({ showPassword: false }, () => this.onClick(true));
        } else {
            window.alert(I18n.t('Wrong password'));
            this.setState({ passwordError: true }, () => {
                setTimeout(() => this.setState({ passwordError: false }), 3000);
            });
        }
    }

    renderPasswordDialog() {
        if (!this.state.showPassword) {
            return null;
        }
        return <Dialog
            open={!0}
            onClose={() => this.setState({ showPassword: false })}
        >
            <DialogTitle>{I18n.t('Enter password')}</DialogTitle>
            <DialogContent>
                <TextField
                    label={I18n.t('Password')}
                    error={this.state.passwordError}
                    helperText={this.state.passwordError ? I18n.t('Wrong password') : null}
                    type="password"
                    autoFocus
                    fullWidth
                    variant="standard"
                    value={this.state.password || ''}
                    onChange={e => this.setState({ password: e.target.value })}
                    onKeyUp={e => e.keyCode === 13 && this.onPasswordEnter()}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={!this.state.password}
                    startIcon={<Check />}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.onPasswordEnter();
                    }}
                    color="primary"
                    variant="contained"
                >
                    {I18n.t('Enter')}
                </Button>
                <Button
                    startIcon={<Close />}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.setState({ showPassword: false });
                    }}
                    color="grey"
                    variant="contained"
                >
                    {I18n.t('Cancel')}
                </Button>
            </DialogActions>
        </Dialog>;
    }

    async setObjectWithState(oid, value) {
        if (this.setObjectType === undefined) {
            try {
                const obj = await this.props.context.socket.getObject(oid);
                this.setObjectType = obj?.common?.type || 'string';
                await this.setObjectWithState(oid, value);
            } catch (error) {
                console.warn(`Object ${oid} not found: ${error}`);
            }
            return;
        }
        if (this.setObjectType === 'boolean') {
            value = value === 'true' || value === true || value === '1' || value === 1 || value === 'on' || value === 'ON';
        } else if (this.setObjectType === 'number') {
            value = parseFloat(value);
        } else if (value !== null && value !== undefined) {
            value = value.toString();
        }

        await this.props.context.socket.setState(oid, value);
    }

    onClick(passwordChecked) {
        if (this.state.dialogVisible) {
            return;
        }

        if (!passwordChecked && this.state.rxData.Password) {
            if (this.props.editMode) {
                window.alert(I18n.t('Ignored in edit mode'));
            } else {
                this.setState({ showPassword: true, password: '' });
            }
            return;
        }

        if (this.state.rxData.nav_view) {
            this.props.context.changeView(this.state.rxData.nav_view);
        } else if (!this.props.editMode && this.state.rxData.href) {
            if (this.state.rxData.target ||
                (this.props.tpl === 'tplJquiButtonLinkBlank' && this.state.rxData.target === undefined)
            ) {
                window.open(this.state.rxData.href, this.state.rxData.target);
            } else {
                window.location.href = this.state.rxData.href;
            }
        } else if (this.state.rxData.url) {
            this.props.socket.getRawSocket().emit('httpGet', this.state.rxData.url, data =>
                console.log('httpGet', this.state.rxData.url, data));
        }

        if (this.state.rxData.html_dialog || this.state.rxData.contains_view) {
            if (this.state.rxData.setId) {
                this.setObjectWithState(this.state.rxData.setId, this.state.rxData.setValue)
                    .catch(error => console.warn(`Cannot set state: ${error}`));
            }
            // show dialog
            this.showDialog(true);
        }
    }

    renderRxDialog(dialogStyle, content) {
        if (this.state.rxData.modal) {
            return <Dialog
                // fullWidth
                maxWidth="xl"
                id={`${this.props.id}_dialog`}
                ref={this.refDialog}
                open={this.state.dialogVisible}
                onClick={() => {
                    if (this.state.rxData.closeOnClick) {
                        this.showDialog(false);
                    }
                }}
            >
                {this.state.rxData.title ? <DialogTitle>{this.state.rxData.title}</DialogTitle> : null}
                {!this.state.rxData.hideCloseButton || !this.state.rxData.closeOnClick ? <IconButton
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        zIndex: 800,
                    }}
                    onClick={() => this.showDialog(false)}
                >
                    <Close />
                </IconButton> : null}
                <DialogContent>{content}</DialogContent>
            </Dialog>;
        }

        if (!this.state.dialogVisible) {
            dialogStyle.display = 'none';
        }

        if (!dialogStyle.minWidth || dialogStyle.minWidth < 200) {
            dialogStyle.minWidth = 200;
        }
        if (!dialogStyle.minHeight || dialogStyle.minHeight < 100) {
            dialogStyle.minHeight = 100;
        }

        const paperStyle = { ...dialogStyle };
        delete paperStyle.top;
        delete paperStyle.left;
        paperStyle.padding = this.state.rxData.title ? '0 24px 24px 24px' : '26px 24px 24px 24px';

        return <Popper
            open={this.state.dialogVisible}
            id={`${this.props.id}_dialog`}
            ref={this.refDialog}
            anchorEl={this.refButton.current}
            style={dialogStyle}
            onClick={() => {
                if (this.state.rxData.closeOnClick) {
                    this.showDialog(false);
                }
            }}
        >
            <Paper
                style={paperStyle}
            >
                {this.state.rxData.title ?
                    <DialogTitle style={{ padding: '16px 0 0 0' }}>
                        <div>{this.state.rxData.title}</div>
                    </DialogTitle>
                    :
                    null}
                <IconButton
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        zIndex: 800,
                    }}
                    onClick={() => this.showDialog(false)}
                >
                    <Close />
                </IconButton>
                <DialogContent>{content}</DialogContent>
            </Paper>
        </Popper>;
    }

    renderJQueryDialog(dialogStyle, content) {
        return <div
            id={`${this.props.id}_dialog`}
            className="vis-widget-dialog"
            title={this.state.rxData.title}
            style={dialogStyle}
            ref={this.refDialog}
        >
            {this.state.rxData.preload ? content : null}
        </div>;
    }

    renderDialog() {
        if (this.props.editMode ||
            (!this.state.dialogVisible && !this.state.rxData.persistent && !this.state.rxData.externalDialog) ||
            (!this.state.rxData.html_dialog && !this.state.rxData.contains_view)
        ) {
            return null;
        }

        // eslint-disable-next-line no-restricted-properties
        // const top = window.isFinite(this.state.rxData.dialog_top) ? parseFloat(this.state.rxData.dialog_top) : this.state.rxData.dialog_top;
        // eslint-disable-next-line no-restricted-properties
        // const left = window.isFinite(this.state.rxData.dialog_left) ? parseFloat(this.state.rxData.dialog_left) : this.state.rxData.dialog_left;
        // eslint-disable-next-line no-restricted-properties
        const width = window.isFinite(this.state.rxData.dialog_width) ? parseFloat(this.state.rxData.dialog_width) : this.state.rxData.dialog_width;
        // eslint-disable-next-line no-restricted-properties
        const height = window.isFinite(this.state.rxData.dialog_height) ? parseFloat(this.state.rxData.dialog_height) : this.state.rxData.dialog_height;

        const dialogStyle = {
            minWidth: width || (window.innerWidth - 50),
            minHeight: height || (window.innerHeight - 50),
            // top: top || top === 0 ? top : undefined,
            // left: left || left === 0 ? left : undefined,
            overflowX: this.state.rxData.overflowX,
            overflowY: this.state.rxData.overflowY,
        };

        let content;
        if (this.state.rxData.contains_view) {
            content = <div
                style={dialogStyle}
                className={this.state.rxData.dialog_class}
            >
                {super.getWidgetView(this.state.rxData.contains_view)}
            </div>;
        } else {
            content = <div
                style={dialogStyle}
                className={this.state.rxData.dialog_class}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: this.state.rxData.html_dialog }}
            />;
        }

        if (this.state.rxData.jquery_style) {
            // return this.renderJQueryDialog(dialogStyle, content);
        }

        return this.renderRxDialog(dialogStyle, content);
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const iconStyle = {
            marginRight: 4,
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

        const icon = !this.state.rxData.jquery_style && (this.state.rxData.src || this.state.rxData.icon) ? <Icon
            src={this.state.rxData.src || this.state.rxData.icon}
            style={iconStyle}
        /> : null;

        const buttonStyle = { textTransform: 'none' };
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

        // the following widgets are resizable by default
        let visResizable = this.state.data.visResizable;
        if (visResizable === undefined || visResizable === null) {
            if (this.props.tpl === 'tplJquiButtonNav' ||
                this.props.tpl === 'tplJquiNavPw' ||
                this.props.tpl === 'tplContainerDialog' ||
                this.props.tpl === 'tplContainerIconDialog' ||
                this.props.tpl === 'tplJquiDialog' ||
                this.props.tpl === 'tplJquiIconDialog' ||
                this.props.tpl === 'tplIconHttpGet' ||
                this.props.tpl === 'tplIconLink' ||
                this.props.tpl === 'tplJquiIconNav'
            ) {
                visResizable = true;
            }
        }

        // extra no rxData here, as it is not possible to set it with bindings
        if (visResizable) {
            buttonStyle.width = '100%';
            buttonStyle.height = '100%';
        } else {
            buttonStyle.padding = this.state.rxData.padding;
        }

        let buttonText;
        if (this.state.rxData.html) {
            // ignore
        } else if (this.state.rxData.nav_view && this.state.rxData.buttontext_view) {
            buttonText = this.props.context.views[this.state.rxData.nav_view]?.settings?.navigationTitle || this.state.rxData.nav_view;
        } else if (this.state.rxData.buttontext === undefined) {
            buttonText = this.state.rxData.text || ''; // back compatibility
        } else {
            buttonText = this.state.rxData.buttontext;
        }

        let content;
        if (this.state.rxData.externalDialog) {
            content = this.props.editMode ? <div
                style={{
                    width: '100%',
                    height: '100%',
                    border: '2px dashed red',
                    backgroundColor: 'grey',
                    color: 'white',
                    boxSizing: 'border-box',
                }}
            >
                <IconButton
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        opacity: 0.4,
                    }}
                    className={this.props.context.editModeComponentClass}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        const text = `setState('${this.props.context.adapterName}.${this.props.context.instance}.control.command', '${JSON.stringify({ command: 'dialog', instance: window.localStorage.getItem('visInstance'), data: this.state.rxData.dialogName || this.props.id })}')`;
                        window.alert(I18n.t('Copied %s', text));
                        Utils.copyToClipboard(text);
                    }}
                >
                    <IconCopy />
                </IconButton>
                <div>{I18n.t('External dialog')}</div>
                <div>{this.state.rxData.html_dialog ? 'HTML' : `View: ${this.state.rxData.contains_view}`}</div>
                <div>{`Name: ${this.state.rxData.dialogName ? `${this.state.rxData.dialogName} (${this.props.id})` : this.props.id}`}</div>
                <div style={{ fontSize: 10 }}>{I18n.t('You can open dialog with following script:')}</div>
                <div style={{ fontSize: 10 }}>{`setState('${this.props.context.adapterName}.${this.props.context.instance}.control.command', '${JSON.stringify({ command: 'dialog', instance: window.localStorage.getItem('visInstance'), data: this.state.rxData.dialogName || this.props.id })}')`}</div>
            </div> : null;
        } else {
            content = [
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
                            className={this.state.rxData.nav_view && this.state.rxData.nav_view === window.location.hash.slice(1) ? 'ui-state-active' : undefined}
                            ref={this.refButton}
                            type="button"
                            style={buttonStyle}
                            onClick={() => this.onClick()}
                        >
                            {icon}
                            {buttonText}
                        </button>
                        :
                        <Button
                            key="content"
                            ref={this.refButton}
                            style={buttonStyle}
                            color={this.state.rxData.nav_view && this.state.rxData.nav_view === window.location.hash.slice(1) ?
                                (this.state.rxData.color === 'primary' ? 'secondary' : 'primary') :
                                (this.state.rxData.color || 'grey')}
                            variant={this.state.rxData.variant === undefined ? 'contained' : this.state.rxData.variant}
                            onClick={() => this.onClick()}
                        >
                            {icon}
                            {buttonText}
                        </Button>),
                this.state.rxData.html_append ? <span
                    key="append"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: this.state.rxData.html_append }}
                /> : null,
            ];
        }

        return <div
            className="vis-widget-body"
            onClick={this.state.rxData.html ? () => this.onClick() : undefined}
        >
            {content}
            {this.renderDialog()}
            {this.renderPasswordDialog()}
        </div>;
    }
}

JQuiButton.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiButton;
