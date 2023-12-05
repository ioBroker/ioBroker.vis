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
    Fab, FormControlLabel,
    Tooltip,
    Checkbox, Switch, ButtonGroup,
    FormControl, FormLabel,
} from '@mui/material';

import {
    I18n, Icon,
} from '@iobroker/adapter-react-v5';

// eslint-disable-next-line import/no-cycle
import VisRxWidget from '../../visRxWidget';

class JQuiBinaryState extends VisRxWidget {
    constructor(props) {
        super(props);
        this.state.isOn = false;
        this.state.height = 0;
        this.state.width = 0;
    }

    static getWidgetInfo() {
        return {
            id: 'tplJquiBool',
            visSet: 'jqui',
            visName: 'Html Bool',
            visWidgetLabel: 'jqui_binary_control',
            visPrev: 'widgets/jqui/img/Prev_BinaryControl.png',
            visOrder: 14,
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'type',
                            label: 'jqui_type',
                            type: 'select',
                            noTranslation: true,
                            default: 'button',
                            options: ['button', 'round-button', 'html', 'radio', 'checkbox', 'image', 'switch'],
                        },
                        {
                            name: 'oid',
                            type: 'id',
                        },
                        {
                            name: 'readOnly',
                            type: 'checkbox',
                        },
                        {
                            name: 'click_id',
                            type: 'id',
                            noSubscribe: true,
                            hidden: data => !!data.readOnly,
                        },
                        {
                            name: 'invert',
                            label: 'jqui_inverted',
                            type: 'checkbox',
                        },
                        {
                            name: 'test',
                            type: 'select',
                            label: 'jqui_test',
                            options: [
                                { value: '', label: 'none' },
                                { value: true, label: 'jqui_true' },
                                { value: false, label: 'jqui_false' },
                            ],
                        },
                    ],
                },
                {
                    name: 'html',
                    label: 'jqui_html',
                    hidden: data => data.type !== 'html',
                    fields: [
                        {
                            name: 'html_true',
                            type: 'html',
                            label: 'jqui_html_true',
                        },
                        {
                            name: 'html_false',
                            type: 'html',
                            label: 'jqui_html_false',
                        },
                    ],
                },
                {
                    name: 'text',
                    label: 'group_text',
                    fields: [
                        {
                            name: 'text_false',
                            type: 'text',
                            label: 'text_false',
                            default: I18n.t('jqui_off').replace('jqui_', ''),
                            hidden: data => data.type === 'image' || data.type === 'html',
                        },
                        {
                            name: 'text_true',
                            type: 'text',
                            label: 'text_true',
                            default: I18n.t('jqui_on').replace('jqui_', ''),
                            hidden: data => data.type === 'image' || data.type === 'html' || data.type === 'round-button',
                        },
                        {
                            name: 'color_false',
                            type: 'color',
                            label: 'color_false',
                            hidden: data => data.type === 'image' || data.type === 'html' || !data.text_false,
                        },
                        {
                            name: 'color_true',
                            type: 'color',
                            label: 'color_true',
                            hidden: data => data.type === 'image' || data.type === 'html' || !data.text_true,
                        },
                        {
                            name: 'alt_false',
                            type: 'text',
                            label: 'alt_false',
                        },
                        {
                            name: 'alt_true',
                            type: 'text',
                            label: 'alt_true',
                        },
                    ],
                },
                {
                    name: 'style',
                    fields: [
                        {
                            name: 'jquery_style',
                            label: 'jqui_jquery_style',
                            type: 'checkbox',
                            hidden: data => data.type !== 'button',
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
                            hidden: data => data.type !== 'button' && data.type !== 'radio',
                        },
                        { name: 'html_prepend', type: 'html' },
                        { name: 'html_append', type: 'html' },
                    ],
                },
                {
                    name: 'icon_false',
                    label: 'group_icon_false',
                    fields: [
                        {
                            name: 'src_false',
                            label: 'jqui_image',
                            type: 'image',
                            hidden: data => data.icon_false,
                        },
                        {
                            name: 'icon_false',
                            label: 'jqui_icon',
                            type: 'icon64',
                            hidden: data => data.src_false,
                        },
                        {
                            name: 'icon_color_false',
                            label: 'jqui_color',
                            type: 'color',
                            hidden: data => !data.icon_false,
                        },

                        {
                            name: 'invert_icon_false',
                            label: 'jqui_invert_icon',
                            type: 'checkbox',
                            hidden: data => !data.src_false && !data.icon_false,
                        },
                        {
                            name: 'imageHeight_false',
                            label: 'jqui_image_height',
                            type: 'slider',
                            min: 0,
                            max: 200,
                            hidden: data => !data.src_false && !data.icon_false,
                        },
                    ],
                },
                {
                    name: 'icon_true',
                    label: 'group_icon_true',
                    fields: [
                        {
                            name: 'src_true',
                            label: 'jqui_image',
                            type: 'image',
                            hidden: data => data.icon_true,
                        },
                        {
                            name: 'icon_true',
                            label: 'jqui_icon',
                            type: 'icon64',
                            hidden: data => data.src_true,
                        },
                        {
                            name: 'icon_color_true',
                            label: 'jqui_color',
                            type: 'color',
                            hidden: data => !data.icon_true && !data.icon_false,
                        },
                        {
                            name: 'invert_icon_true',
                            label: 'jqui_invert_icon',
                            type: 'checkbox',
                            hidden: data => !data.src_true && !data.icon_true,
                        },
                        {
                            name: 'imageHeight_true',
                            label: 'jqui_image_height',
                            type: 'slider',
                            min: 0,
                            max: 200,
                            hidden: data => !data.src_true && !data.icon_true,
                        },
                    ],
                },
            ],
        };
    }

    async componentDidMount() {
        super.componentDidMount();
        if (this.state.rxData.oid && this.state.rxData.oid !== 'nothing_selected') {
            try {
                const state = await this.props.context.socket.getState(this.state.rxData.oid);
                this.onStateUpdated(this.state.rxData.oid, state);
            } catch (error) {
                console.error(`Cannot get state ${this.state.rxData.oid}: ${error}`);
            }
        }
    }

    static findField(widgetInfo, name) {
        return VisRxWidget.findField(widgetInfo, name);
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiBinaryState.getWidgetInfo();
    }

    onStateUpdated(id, state) {
        if (id === this.state.rxData.oid && state) {
            const isOn = state.val === true || state.val === 'true' || state.val === 1 || state.val === '1' || state.val === 'on' || state.val === 'ON' || state.val === 'On';
            if (this.state.isOn !== isOn) {
                this.setState({ isOn });
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

    onClick(isOn) {
        if (this.state.rxData.readOnly || this.props.editMode) {
            return;
        }
        if (isOn !== false && isOn !== true) {
            isOn = !this.isOn(); // toggle
        }

        const oid = this.getControlOid();
        if (oid) {
            this.props.context.setValue(oid, isOn);
        }

        this.setState({ isOn });
    }

    isOn() {
        let value;
        if (this.props.editMode && (this.state.rxData.test === true || this.state.rxData.test === false)) {
            value = this.state.rxData.test;
        } else {
            value = this.state.isOn;
        }

        if (value === undefined || value === null) {
            value = false;
        }
        if (this.state.rxData.invert) {
            value = !value;
        }
        return value;
    }

    renderIcon(isOn, doNotFallback) {
        let icon;
        let invert;
        let height;
        let color;
        if (isOn) {
            icon = this.state.rxData.src_true || this.state.rxData.icon_true;
            if (icon) {
                invert = this.state.rxData.invert_icon_true;
                height = this.state.rxData.imageHeight_true;
                color = this.state.rxData.icon_color_true;
            }
        }
        if (!icon && (!isOn || !doNotFallback)) {
            icon = this.state.rxData.src_false || this.state.rxData.icon_false;
            if (icon) {
                invert = this.state.rxData.invert_icon_false;
                height = this.state.rxData.imageHeight_false;
                color = this.state.rxData.icon_color_false;
            }
        }
        const style = {};
        if (invert) {
            style.filter = 'invert(1)';
        }
        if (color) {
            style.color = color;
        }
        if (height) {
            style.height = height;
            style.width = 'auto';
        } else if (this.state.width && this.state.rxData.type === 'image') {
            if (this.state.width < this.state.height) {
                style.width = `calc(100% - ${(this.state.rxData.padding || 0) * 2}px)`;
                style.height = 'auto';
                style.maxHeight = '100%';
            } else {
                style.height = `calc(100% - ${(this.state.rxData.padding || 0) * 2}px)`;
                style.width = 'auto';
                style.maxWidth = '100%';
            }
        } else if (this.state.rxData.type === 'round-button') {
            if (this.state.width < this.state.height) {
                style.width = `calc(70% - ${(this.state.rxData.padding || 0) * 2}px)`;
                style.height = 'auto';
                style.maxHeight = '100%';
            } else {
                style.height = `calc(70% - ${(this.state.rxData.padding || 0) * 2}px)`;
                style.width = 'auto';
                style.maxWidth = '100%';
            }
        } else if (this.state.width < this.state.height) {
            style.width = `calc(100% - ${(this.state.rxData.padding || 0) * 2}px)`;
            style.height = 'auto';
            style.maxHeight = '100%';
        } else {
            style.height = `calc(100% - ${(this.state.rxData.padding || 0) * 2}px)`;
            style.width = 'auto';
            style.maxWidth = '100%';
        }

        if (this.state.rxData.padding) {
            style.padding = this.state.rxData.padding;
        }

        if (icon) {
            if (icon.startsWith('_PRJ_NAME/')) {
                icon = icon.replace('_PRJ_NAME/', `../${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}/`);
            }

            return <Icon
                key="icon"
                style={style}
                src={icon}
            />;
        }
        return null;
    }

    renderText(isOn) {
        let text;
        let color;

        if (isOn) {
            text = this.state.rxData.text_true;
            color = this.state.rxData.color_true;
        }
        text = text || this.state.rxData.text_false;
        color = color || this.state.rxData.color_false;

        return { text, color };
    }

    renderButton(isOn, style) {
        const icon = this.renderIcon(isOn);
        const text = this.renderText(isOn);

        style.color = text.color || undefined;

        // Button
        return <Button
            variant={this.state.rxData.variant === undefined ? 'contained' : this.state.rxData.variant}
            color={isOn ? 'primary' : 'grey'}
            onClick={() => this.onClick()}
            style={style}
        >
            {icon}
            {text.text}
        </Button>;
    }

    renderFab(isOn, style) {
        const icon = this.renderIcon(isOn);
        const text = this.renderText(isOn);

        style.zIndex = this.props.editMode ? 0 : undefined;
        // Fab
        return <Fab
            style={style}
            color={isOn ? 'primary' : 'grey'}
            onClick={() => this.onClick()}
        >
            {icon || text.text}
        </Fab>;
    }

    renderHtml(isOn) {
        let html;
        if (isOn) {
            html = this.state.rxData.html_true;
        }
        if (!html) {
            html = this.state.rxData.html_false;
        }

        const icon = this.renderIcon(isOn);

        return [
            this.state.rxData.html_prepend ? <span
                key="prepend"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: this.state.rxData.html_prepend }}
            /> : null,
            icon,
            html ? <span
                key="content"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: html }}
            /> : null,
            this.state.rxData.html_append ? <span
                key="append"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: this.state.rxData.html_append }}
            /> : null,
        ];
    }

    renderSwitch(isOn, style) {
        const on = this.state.rxData.text_true;
        const textColorOn = this.state.rxData.color_true;
        const off = this.state.rxData.text_false;
        const textColorOff = this.state.rxData.color_false;

        const onIcon = this.renderIcon(true, true);
        const offIcon = this.renderIcon(false);

        if ((on || onIcon) && (off || offIcon)) {
            style.display = 'flex';
            style.alignItems = 'center';

            return <div style={style}>
                <div style={{ marginTop: -2, color: textColorOff }}>{off}</div>
                <div>{offIcon}</div>
                <Switch
                    checked={isOn}
                    onChange={() => this.onClick()}
                />
                <div>{onIcon}</div>
                <div style={{ marginTop: -2, color: textColorOn }}>{on}</div>
            </div>;
        }
        if (off || offIcon) {
            let text;
            if (offIcon && off) {
                text = <div style={{ display: 'flex', alignItems: 'center', color: textColorOff }}>
                    {offIcon}
                    {off}
                </div>;
            } else {
                text = off || offIcon;
            }
            style.marginLeft = 5;
            return <FormControlLabel
                style={style}
                control={<Switch
                    checked={isOn}
                    onChange={() => this.onClick()}
                />}
                label={text}
            />;
        }

        return <div style={style}>
            <Switch
                checked={false}
                onChange={() => this.onClick()}
            />
        </div>;
    }

    renderCheckbox(isOn, style) {
        let text = isOn ? this.state.rxData.text_true : this.state.rxData.text_false;
        if (!text) {
            text = this.state.rxData.text_false;
        }
        const icon = isOn ? this.renderIcon(true) : this.renderIcon(false);
        style.marginLeft = 5;

        if (text || icon) {
            return <FormControlLabel
                style={style}
                control={<Checkbox
                    checked={isOn}
                    onChange={() => this.onClick()}
                />}
                label={<div style={{ display: 'flex', alignItems: 'center' }}>
                    {icon}
                    {text}
                </div>}
            />;
        }

        return <Checkbox
            style={style}
            checked={isOn}
            onChange={() => this.onClick()}
        />;
    }

    renderRadio(isOn, style) {
        const on = this.state.rxData.text_true;
        const off = this.state.rxData.text_false;
        const onIcon = this.renderIcon(true);
        const offIcon = this.renderIcon(false);

        let variant = this.state.rxData.variant === undefined ? 'contained' : this.state.rxData.variant;
        if (variant === 'standard') {
            variant = 'text';
        }

        return <ButtonGroup
            style={style}
            variant={variant}
        >
            <Button
                startIcon={offIcon}
                color={isOn ? 'grey' : 'primary'}
                onClick={() => this.onClick(false)}
            >
                {off || I18n.t('off')}
            </Button>
            <Button
                color={isOn ? 'primary' : 'grey'}
                startIcon={onIcon}
                onClick={() => this.onClick(true)}
            >
                {on || I18n.t('on')}
            </Button>
        </ButtonGroup>;
    }

    componentDidUpdate(/* prevProps, prevState */) {
        if (!this.refService.current) {
            return;
        }
        if (this.state.rxData.type === 'image' ||
            this.state.rxData.type === 'html' ||
            (this.state.rxData.type === 'button' && this.state.rxData.jquery_style)
        ) {
            if (this.state.rxData.type === 'button') {
                const el = this.refService.current.getElementsByClassName('vis-widget-body');
                if (el?.length && !this.refService.current._jQueryDone) {
                    this.refService.current._jQueryDone = true;
                    window.jQuery(el[0]).button();
                    const textEl = el[0].getElementsByClassName('ui-button-text');
                    if (textEl?.length) {
                        textEl[0].style.display = 'flex';
                        textEl[0].style.alignItems = 'center';
                    }
                }
            }

            if (this.refService.current.clientWidth !== this.state.width ||
                this.refService.current.clientHeight !== this.state.height
            ) {
                this.setState({
                    width: this.refService.current.clientWidth,
                    height: this.refService.current.clientHeight,
                });
            }
        }
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        const isOn = this.isOn();

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
        buttonStyle.width = '100%';
        buttonStyle.height = '100%';
        let content;
        const bodyStyle = { textAlign: 'center' };
        if (this.state.rxData.type === 'radio') {
            content = this.renderRadio(isOn, buttonStyle);
        } else if (this.state.rxData.type === 'html' || (this.state.rxData.type === 'button' && this.state.rxData.jquery_style)) {
            bodyStyle.display = 'flex';
            bodyStyle.flexDirection = this.state.height > this.state.width ? 'column' : 'row';
            bodyStyle.alignItems = 'center';
            bodyStyle.justifyContent = 'center';
            bodyStyle.cursor = !this.state.rxData.readOnly ? 'pointer' : undefined;

            content = this.renderHtml(isOn);
        } else if (this.state.rxData.type === 'switch') {
            content = this.renderSwitch(isOn, buttonStyle);
        } else if (this.state.rxData.type === 'checkbox') {
            content = this.renderCheckbox(isOn, buttonStyle);
        } else if (this.state.rxData.type === 'image') {
            bodyStyle.cursor = !this.state.rxData.readOnly ? 'pointer' : undefined;
            content = this.renderIcon(isOn, buttonStyle);
        } else if (this.state.rxData.type === 'round-button') {
            content = this.renderFab(isOn, buttonStyle);
        }else if (!this.state.rxData.jquery_style) {
            content = this.renderButton(isOn, buttonStyle);
        }

        const result = <div
            className="vis-widget-body"
            style={bodyStyle}
            onClick={this.state.rxData.type === 'image' || this.state.rxData.type === 'html' ? () => this.onClick() : undefined}
        >
            {content}
        </div>;
        if (isOn && this.state.rxData.alt_true) {
            return <Tooltip title={this.state.rxData.alt_true}>{result}</Tooltip>;
        }
        if (!isOn && this.state.rxData.alt_false) {
            return <Tooltip title={this.state.rxData.alt_false}>{result}</Tooltip>;
        }
        return result;
    }
}

JQuiBinaryState.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiBinaryState;
