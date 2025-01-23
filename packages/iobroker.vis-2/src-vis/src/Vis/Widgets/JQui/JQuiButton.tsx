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

import type { CSSProperties } from 'react';
import React from 'react';

import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Popper,
    Paper,
    TextField,
    DialogActions,
} from '@mui/material';

import { Close, Check } from '@mui/icons-material';

import { I18n, Icon, Utils, IconCopy } from '@iobroker/adapter-react-v5';

import VisBaseWidget from '@/Vis/visBaseWidget';
import type {
    RxRenderWidgetProps,
    RxWidgetInfo,
    RxWidgetInfoAttributesField,
    RxWidgetInfoWriteable,
    Writeable,
    VisBaseWidgetProps,
    VisWidgetCommand,
} from '@iobroker/types-vis-2';
import { isVarFinite } from '../../../Utils/utils';
import VisRxWidget, { type VisRxWidgetState } from '../../visRxWidget';

// eslint-disable-next-line no-use-before-define
export type JQuiButtonDataProps = {
    buttontext: string;
    html: string;
    Password: string;
    nav_view: string;
    buttontext_view: boolean;
    sub_view: string;
    href: string;
    url: string;
    target: string;
    no_style: boolean;
    jquery_style: boolean;
    padding: number;
    variant: string;
    color: string;
    html_prepend: string;
    html_append: string;
    visResizable: boolean;
    src: string;
    icon: string;
    invert_icon: boolean;
    imageHeight: number;
    html_dialog: string;
    contains_view: string;
    title: string;
    modal: boolean;
    dialog_width: string;
    dialog_height: string;
    dialog_class: string;
    persistent: boolean;
    preload: boolean;
    closeOnClick: boolean;
    hideCloseButton: boolean;
    dialogBackgroundColor: string;
    dialogTitleColor: string;
    overflowX: string;
    overflowY: string;
    setId: string;
    setValue: string;
    dialogName: string;
    externalDialog: boolean;
    autoclose: number | string | boolean;
    text: string;
};

export interface JQuiButtonState extends VisRxWidgetState {
    width: number;
    height: number;
    dialogVisible: boolean;
    showPassword: boolean;
    password: string;
    passwordError: boolean;
}

class JQuiButton<
    P extends JQuiButtonDataProps = JQuiButtonDataProps,
    S extends JQuiButtonState = JQuiButtonState,
> extends VisRxWidget<P, S> {
    refButton: React.RefObject<HTMLButtonElement>;

    refDialog: React.RefObject<HTMLDivElement>;

    hideTimeout: ReturnType<typeof setTimeout>;

    setObjectType: string;

    constructor(props: VisBaseWidgetProps) {
        super(props);
        (this.state as JQuiButtonState).width = 0;
        (this.state as JQuiButtonState).height = 0;
        (this.state as JQuiButtonState).dialogVisible = false;
        (this.state as JQuiButtonState).showPassword = false;
        (this.state as JQuiButtonState).password = '';
        this.refButton = React.createRef();
        this.refDialog = React.createRef();
    }

    static getWidgetInfo(): RxWidgetInfo {
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
                            hidden: (data: any) =>
                                !!data.html || !!(data.buttontext_view && data.nav_view) || !!data.externalDialog,
                        },
                        {
                            name: 'html',
                            type: 'html',
                            default: '',
                            tooltip: 'jqui_html_tooltip',
                            disabled: (data: any) =>
                                !!data.buttontext || !!data.icon || !!data.src || !!data.externalDialog,
                        },
                        {
                            name: 'Password',
                            type: 'password',
                            label: 'password',
                            tooltip: 'jqui_password_tooltip',
                            disabled: (data: any) =>
                                !data.nav_view && !data.url && !data.href && !data.html_dialog && !data.contains_view,
                        },
                    ],
                },
                {
                    name: 'view',
                    label: 'jqui_view_group',
                    hidden: (data: any) => !!data.url || !!data.href || !!data.html_dialog || !!data.contains_view,
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
                            hidden: (data: any) => !data.nav_view,
                        },
                        {
                            name: 'sub_view',
                            label: 'basic_sub_view',
                            type: 'text',
                            tooltip: 'sub_view_tooltip',
                            hidden: (data: any) => !data.nav_view,
                        },
                    ],
                },
                {
                    name: 'URL',
                    label: 'jqui_url_group',
                    hidden: (data: any) => !!data.html_dialog || !!data.contains_view || !!data.nav_view,
                    fields: [
                        {
                            name: 'href',
                            label: 'jqui_url_in_browser',
                            type: 'url',
                            hidden: (data: any) => !!data.url,
                            tooltip: 'jqui_href_tooltip',
                        },
                        {
                            name: 'url',
                            label: 'jqui_url_in_background',
                            type: 'url',
                            hidden: (data: any) => !!data.href,
                            tooltip: 'jqui_url_tooltip',
                        },
                        {
                            name: 'target',
                            type: 'auto',
                            options: ['_blank', '_self', '_parent', '_top'],
                            hidden: (data: any) => !!data.url || !data.href,
                        },
                    ],
                },
                {
                    name: 'style',
                    label: 'Style',
                    hidden: (data: any) => !!data.externalDialog,
                    fields: [
                        { name: 'no_style', type: 'checkbox', hidden: (data: any) => data.jquery_style },
                        {
                            name: 'jquery_style',
                            label: 'jqui_jquery_style',
                            type: 'checkbox',
                            hidden: (data: any) => data.no_style,
                        },
                        {
                            name: 'padding',
                            type: 'slider',
                            min: 0,
                            max: 100,
                            default: 5,
                            // hidden: (data: any) => !data.no_style && !data.jquery_style,
                        },
                        {
                            name: 'variant',
                            label: 'jqui_variant',
                            type: 'select',
                            noTranslation: true,
                            options: ['contained', 'outlined', 'standard'],
                            default: 'contained',
                            hidden: (data: any) => data.jquery_style || data.no_style,
                        },
                        {
                            name: 'color',
                            label: 'jqui_button_color',
                            type: 'select',
                            noTranslation: true,
                            options: ['', 'primary', 'secondary'],
                            default: '',
                            hidden: (data: any) => data.jquery_style || data.no_style,
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
                    hidden: (data: any) => !!data.externalDialog || data.jquery_style,
                    fields: [
                        {
                            name: 'src',
                            label: 'jqui_image',
                            type: 'image',
                            hidden: (data: any) => data.icon,
                        },
                        {
                            name: 'icon',
                            label: 'jqui_icon',
                            type: 'icon64',
                            hidden: (data: any) => data.src,
                        },
                        {
                            name: 'invert_icon',
                            type: 'checkbox',
                            hidden: (data: any) => !data.icon && !data.src,
                        },
                        {
                            name: 'imageHeight',
                            type: 'slider',
                            min: 0,
                            max: 200,
                            default: 100,
                            hidden: (data: any) => !data.src,
                        },
                    ],
                },
                {
                    name: 'dialog',
                    hidden: (data: any) => !!data.url || !!data.href || !!data.nav_view,
                    fields: [
                        {
                            name: 'html_dialog',
                            type: 'html',
                            hidden: (data: any) => !!data.contains_view,
                        },
                        {
                            name: 'contains_view',
                            type: 'views',
                            hidden: (data: any) => !!data.html_dialog,
                        },
                        {
                            name: 'title',
                            type: 'text',
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'autoclose',
                            type: 'slider',
                            min: 0,
                            max: 30000,
                            step: 100,
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'modal',
                            type: 'checkbox',
                            default: true,
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'dialog_width',
                            type: 'text',
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'dialog_height',
                            type: 'text',
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'dialog_class',
                            label: 'CSS Class',
                            type: 'text',
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'persistent',
                            type: 'checkbox',
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'preload',
                            type: 'checkbox',
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'closeOnClick',
                            type: 'checkbox',
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'hideCloseButton',
                            label: 'jqui_hide_close_button',
                            type: 'checkbox',
                            hidden: (data: any) => !data.html_dialog && !data.contains_view && !!data.closeOnClick,
                        },
                        {
                            name: 'dialogBackgroundColor',
                            label: 'Background color',
                            type: 'color',
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'dialogTitleColor',
                            type: 'color',
                            label: 'Text color',
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        /*
                        {
                            name: 'dialog_top',
                            type: 'text',
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'dialog_left',
                            type: 'text',
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        */
                        {
                            name: 'overflowX',
                            type: 'select',
                            noTranslation: true,
                            options: ['', 'auto', 'hidden', 'visible', 'scroll', 'initial', 'inherit'],
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'overflowY',
                            type: 'select',
                            noTranslation: true,
                            options: ['', 'auto', 'hidden', 'visible', 'scroll', 'initial', 'inherit'],
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'setId',
                            type: 'id',
                            tooltip: 'jqui_dialog_set_id_tooltip',
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'setValue',
                            type: 'text',
                            hidden: (data: any) => !data.setId || (!data.html_dialog && !data.contains_view),
                        },
                        {
                            name: 'dialogName',
                            label: 'jqui_dialog_name',
                            type: 'text',
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                        {
                            name: 'externalDialog',
                            label: 'jqui_external_dialog',
                            tooltip: 'jqui_external_dialog_tooltip',
                            type: 'checkbox',
                            hidden: (data: any) => !data.html_dialog && !data.contains_view,
                        },
                    ],
                },
            ],
        } as const;
    }

    static findField<Field extends { [x: string]: any } = RxWidgetInfoAttributesField>(
        widgetInfo: RxWidgetInfo | RxWidgetInfoWriteable,
        name: string,
    ): Writeable<Field> | null {
        return VisRxWidget.findField(widgetInfo as RxWidgetInfo, name) as unknown as Writeable<Field>;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
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
            if (this.state.rxData.jquery_style && !(this.refButton.current as any)._jQueryDone) {
                (this.refButton.current as any)._jQueryDone = true;
                (window.jQuery as any)(this.refButton.current).button();
            }
            if (
                this.refButton.current.clientWidth !== this.state.width ||
                this.refButton.current.clientHeight !== this.state.height
            ) {
                this.setState({
                    width: this.refButton.current.clientWidth,
                    height: this.refButton.current.clientHeight,
                });
            }
        }
        // from base class
        if (
            this.refService.current &&
            (this.state.rxData.html_dialog || this.state.rxData.contains_view) &&
            !(this.refService.current as any)._showDialog
        ) {
            (this.refService.current as any)._showDialog = this.showDialog;
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

    showDialog = (show: boolean) => {
        this.setState({ dialogVisible: show });

        // Auto-close
        let timeout = this.state.rxData.autoclose;
        if (timeout === true || timeout === 'true') {
            timeout = 10000;
        }
        if (timeout === null || timeout === undefined || timeout === '') {
            return;
        }
        timeout = parseInt(timeout as string, 10);
        if (timeout < 60) {
            // maybe this is seconds
            timeout *= 1000;
        }
        timeout = timeout || 1000;

        if (timeout) {
            if (show) {
                this.hideTimeout = setTimeout(() => {
                    this.hideTimeout = null;
                    this.showDialog(false);
                }, timeout);
            } else if (this.hideTimeout) {
                clearTimeout(this.hideTimeout);
                this.hideTimeout = null;
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
        return (
            <Dialog
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
                        onKeyUp={e => e.key === 'Enter' && this.onPasswordEnter()}
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
            </Dialog>
        );
    }

    async setObjectWithState(oid: string, value: ioBroker.State['val']) {
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
            value =
                value === 'true' || value === true || value === '1' || value === 1 || value === 'on' || value === 'ON';
        } else if (this.setObjectType === 'number') {
            value = parseFloat(value as string);
        } else if (value !== null && value !== undefined) {
            value = value.toString();
        }

        await this.props.context.setValue(oid, value);
    }

    onCommand(command: VisWidgetCommand) {
        super.onCommand(command);
        if (command === 'openDialog') {
            this.showDialog(true);
            return true;
        }
        if (command === 'closeDialog') {
            this.showDialog(false);
            return true;
        }
        return false;
    }

    onClick(passwordChecked?: boolean) {
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
            if (
                this.state.rxData.target ||
                (this.props.tpl === 'tplJquiButtonLinkBlank' && this.state.rxData.target === undefined)
            ) {
                window.open(this.state.rxData.href, this.state.rxData.target);
            } else {
                window.location.href = this.state.rxData.href;
            }
        } else if (this.state.rxData.url) {
            this.props.context.socket
                .getRawSocket()
                .emit('httpGet', this.state.rxData.url, (data: any) =>
                    console.log('httpGet', this.state.rxData.url, data),
                );
        }

        if (this.state.rxData.html_dialog || this.state.rxData.contains_view) {
            if (this.state.rxData.setId) {
                this.setObjectWithState(this.state.rxData.setId, this.state.rxData.setValue).catch(error =>
                    console.warn(`Cannot set state: ${error}`),
                );
            }
            // show dialog
            this.showDialog(true);
        }
    }

    renderRxDialog(dialogStyle: CSSProperties, content: React.JSX.Element) {
        console.log('test');
        if (this.state.rxData.modal) {
            console.log('in');
            return (
                <Dialog
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
                    <div style={{ backgroundColor: this.state.rxData.dialogBackgroundColor }}>
                        {this.state.rxData.title ? (
                            <DialogTitle sx={{ color: this.state.rxData.dialogTitleColor }}>
                                {this.state.rxData.title}
                            </DialogTitle>
                        ) : null}
                        {!this.state.rxData.hideCloseButton || !this.state.rxData.closeOnClick ? (
                            <IconButton
                                sx={{ color: this.state.rxData.dialogTitleColor }}
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
                        ) : null}
                        <DialogContent>{content}</DialogContent>
                    </div>
                </Dialog>
            );
        }

        if (!this.state.dialogVisible) {
            dialogStyle.display = 'none';
        }

        if (!dialogStyle.minWidth || (dialogStyle.minWidth as number) < 200) {
            dialogStyle.minWidth = 200;
        }
        if (!dialogStyle.minHeight || (dialogStyle.minHeight as number) < 100) {
            dialogStyle.minHeight = 100;
        }

        dialogStyle.backgroundColor = 'blue';
        const paperStyle = { ...dialogStyle };
        delete paperStyle.top;
        delete paperStyle.left;
        paperStyle.padding = this.state.rxData.title ? '0 24px 24px 24px' : '26px 24px 24px 24px';

        return (
            <Popper
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
                <Paper style={{ ...paperStyle, background: 'red !important' }}>
                    {this.state.rxData.title ? (
                        <DialogTitle style={{ padding: '16px 0 0 0' }}>
                            <div>{this.state.rxData.title}</div>
                        </DialogTitle>
                    ) : null}
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
            </Popper>
        );
    }

    renderJQueryDialog(dialogStyle: CSSProperties, content: React.JSX.Element) {
        return (
            <div
                id={`${this.props.id}_dialog`}
                className="vis-widget-dialog"
                title={this.state.rxData.title}
                style={dialogStyle}
                ref={this.refDialog}
            >
                {this.state.rxData.preload ? content : null}
            </div>
        );
    }

    renderDialog() {
        if (
            this.props.editMode ||
            (!this.state.dialogVisible && !this.state.rxData.persistent && !this.state.rxData.externalDialog) ||
            (!this.state.rxData.html_dialog && !this.state.rxData.contains_view)
        ) {
            return null;
        }

        // eslint-disable-next-line no-restricted-properties
        // const top = isVarFinite(this.state.rxData.dialog_top) ? parseFloat(this.state.rxData.dialog_top) : this.state.rxData.dialog_top;
        // eslint-disable-next-line no-restricted-properties
        // const left = isVarFinite(this.state.rxData.dialog_left) ? parseFloat(this.state.rxData.dialog_left) : this.state.rxData.dialog_left;
        // eslint-disable-next-line no-restricted-properties
        const width = isVarFinite(this.state.rxData.dialog_width)
            ? parseFloat(this.state.rxData.dialog_width)
            : this.state.rxData.dialog_width;
        // eslint-disable-next-line no-restricted-properties
        const height = isVarFinite(this.state.rxData.dialog_height)
            ? parseFloat(this.state.rxData.dialog_height)
            : this.state.rxData.dialog_height;

        const dialogStyle: CSSProperties = {
            minWidth: width || window.innerWidth - 50,
            minHeight: height || window.innerHeight - 50,
            // top: top || top === 0 ? top : undefined,
            // left: left || left === 0 ? left : undefined,
            overflowX: this.state.rxData.overflowX as any,
            overflowY: this.state.rxData.overflowY as any,
        };

        let content;
        if (this.state.rxData.contains_view) {
            content = (
                <div
                    style={dialogStyle}
                    className={this.state.rxData.dialog_class}
                >
                    {super.getWidgetView(this.state.rxData.contains_view, undefined)}
                </div>
            );
        } else {
            content = (
                <div
                    style={dialogStyle}
                    className={this.state.rxData.dialog_class}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: this.state.rxData.html_dialog }}
                />
            );
        }

        if (this.state.rxData.jquery_style) {
            // return this.renderJQueryDialog(dialogStyle, content);
        }

        return this.renderRxDialog(dialogStyle, content);
    }

    renderWidgetBody(props: RxRenderWidgetProps) {
        super.renderWidgetBody(props);

        const iconStyle: CSSProperties = {
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
        let iconSrc = !this.state.rxData.jquery_style && (this.state.rxData.src || this.state.rxData.icon);

        if (iconSrc && iconSrc.startsWith('_PRJ_NAME/')) {
            iconSrc = iconSrc.replace(
                '_PRJ_NAME/',
                `../${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}/`,
            );
        }
        const icon = iconSrc ? (
            <Icon
                src={iconSrc}
                style={iconStyle}
            />
        ) : null;

        const buttonStyle: CSSProperties = { textTransform: 'none' };
        // apply style from the element
        Object.keys(this.state.rxStyle).forEach(attr => {
            const value = (this.state.rxStyle as any)[attr];
            if (value !== null && value !== undefined && VisRxWidget.POSSIBLE_MUI_STYLES.includes(attr)) {
                attr = attr.replace(/(-\w)/g, text => text[1].toUpperCase());
                (buttonStyle as any)[attr] = value;
            }
        });
        if (buttonStyle.borderWidth) {
            buttonStyle.borderWidth = VisBaseWidget.correctStylePxValue(buttonStyle.borderWidth);
        }
        if (buttonStyle.fontSize) {
            buttonStyle.fontSize = VisBaseWidget.correctStylePxValue(buttonStyle.fontSize);
        }

        // the following widgets are resizable by default
        let visResizable = this.state.data.visResizable;
        if (visResizable === undefined || visResizable === null) {
            if (
                this.props.tpl === 'tplJquiButtonNav' ||
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
        buttonStyle.minWidth = 'unset';

        let buttonText;
        if (this.state.rxData.html) {
            // ignore
        } else if (this.state.rxData.nav_view && this.state.rxData.buttontext_view) {
            buttonText =
                this.props.context.views[this.state.rxData.nav_view]?.settings?.navigationTitle ||
                this.state.rxData.nav_view;
        } else if (this.state.rxData.buttontext === undefined) {
            buttonText = this.state.rxData.text || ''; // back compatibility
        } else {
            buttonText = this.state.rxData.buttontext;
        }

        let content;
        if (this.state.rxData.externalDialog) {
            content = this.props.editMode ? (
                <div
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
                            ...this.props.context.editModeComponentStyle,
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            opacity: 0.4,
                        }}
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
                    <div
                        style={{ fontSize: 10 }}
                    >{`setState('${this.props.context.adapterName}.${this.props.context.instance}.control.command', '${JSON.stringify({ command: 'dialog', instance: window.localStorage.getItem('visInstance'), data: this.state.rxData.dialogName || this.props.id })}')`}</div>
                </div>
            ) : null;
        } else {
            content = [
                this.state.rxData.html_prepend ? (
                    <span
                        key="prepend"
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: this.state.rxData.html_prepend }}
                    />
                ) : null,
                this.state.rxData.html ? (
                    <span
                        key="content"
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: this.state.rxData.html }}
                    />
                ) : this.state.rxData.no_style || this.state.rxData.jquery_style ? (
                    <button
                        key="content"
                        className={
                            this.state.rxData.nav_view && this.state.rxData.nav_view === window.location.hash.slice(1)
                                ? 'ui-state-active'
                                : undefined
                        }
                        ref={this.refButton}
                        type="button"
                        style={buttonStyle}
                        onClick={() => this.onClick()}
                    >
                        {icon}
                        {buttonText}
                    </button>
                ) : (
                    <Button
                        key="content"
                        ref={this.refButton}
                        style={buttonStyle}
                        color={
                            this.state.rxData.nav_view && this.state.rxData.nav_view === window.location.hash.slice(1)
                                ? this.state.rxData.color === 'primary'
                                    ? 'secondary'
                                    : 'primary'
                                : ((this.state.rxData.color || 'grey') as any)
                        }
                        variant={
                            this.state.rxData.variant === undefined ? 'contained' : (this.state.rxData.variant as any)
                        }
                        onClick={() => this.onClick()}
                    >
                        {icon}
                        {buttonText}
                    </Button>
                ),
                this.state.rxData.html_append ? (
                    <span
                        key="append"
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: this.state.rxData.html_append }}
                    />
                ) : null,
            ];
        }

        return (
            <div
                className="vis-widget-body"
                onClick={this.state.rxData.html ? () => this.onClick() : undefined}
            >
                {content}
                {this.renderDialog()}
                {this.renderPasswordDialog()}
            </div>
        );
    }
}

export default JQuiButton;
