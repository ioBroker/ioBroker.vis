/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2023 bluefox https://github.com/GermanBluefox,
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

import { Button } from '@mui/material';
import { Icon } from '@iobroker/adapter-react-v5';

import VisRxWidget from '../../visRxWidget';

class JQuiButton extends VisRxWidget {
    constructor(props) {
        super(props);
        this.state.width = 0;
        this.state.height = 0;
        this.buttonRef = React.createRef();
    }

    static getWidgetInfo() {
        return {
            id: 'tplJquiButtonLink',
            visSet: 'jqui',
            visName: 'Button Link',
            visSetLabel: 'jqui_set_label',
            visWidgetLabel: 'jqui_button_link',
            visPrev: 'widgets/jqui/img/Prev_ButtonLink.png',
            visResizable: false,
            visOrder: 1,
            visAttrs: [{
                name: 'common',
                fields: [
                    { name: 'buttontext', type: 'text', default: 'Text' },
                    { name: 'href', type: 'url' },
                    { name: 'html_prepend', type: 'html' },
                    { name: 'html_append', type: 'html' },
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
                        hidden: data => !data.no_style && !data.jquery_style,
                    },
                    {
                        name: 'target',
                        type: 'auto',
                        options: ['_blank', '_self', '_parent', '_top'],
                    },
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
                    {
                        name: 'variant',
                        label: 'jqui_variant',
                        type: 'select',
                        noTranslation: true,
                        options: ['contained', 'outlined', 'standard'],
                        default: 'contained',
                        hidden: data => data.jquery_style || data.no_style,
                    },
                ],
            }],
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiButton.getWidgetInfo();
    }

    async componentDidUpdate() {
        if (this.buttonRef.current) {
            if (this.state.rxData.jquery_style && !this.buttonRef.current._jQueryDone) {
                this.buttonRef.current._jQueryDone = true;
                window.jQuery(this.buttonRef.current).button();
            }
            if (this.buttonRef.current.clientWidth !== this.state.width || this.buttonRef.current.clientHeight !== this.state.height) {
                this.setState({ width: this.buttonRef.current.clientWidth, height: this.buttonRef.current.clientHeight });
            }
        }
    }

    onClick() {
        if (!this.props.editMode && this.state.rxData.href) {
            if (this.state.rxData.target ||
                (this.props.tpl === 'tplJquiButtonLinkBlank' && this.state.rxData.target === undefined)
            ) {
                window.open(this.state.rxData.href, this.state.rxData.target);
            } else {
                window.location.href = this.state.rxData.href;
            }
        }
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

        const icon = !this.state.rxData.jquery_style ? <Icon
            src={this.state.rxData.src || this.state.rxData.icon}
            style={iconStyle}
        /> : null;

        return <div className="vis-widget-body">
            {this.state.rxData.html_prepend ? <span
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: this.state.rxData.html_prepend }}
            /> : null}
            {this.state.rxData.no_style || this.state.rxData.jquery_style ?
                <button
                    ref={this.buttonRef}
                    type="button"
                    style={{ padding: this.state.rxData.padding }}
                    onClick={() => this.onClick()}
                >
                    {icon}
                    {this.state.rxData.buttontext}
                </button>
                :
                <Button
                    ref={this.buttonRef}
                    style={this.props.tpl === 'tplIconLink' ? { width: '100%', height: '100%' } : undefined}
                    variant={this.state.rxData.variant === undefined ? 'contained' : this.state.rxData.variant}
                    onClick={() => this.onClick()}
                >
                    {icon}
                    {this.state.rxData.buttontext}
                </Button>}
            {this.state.rxData.html_append ? <span
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: this.state.rxData.html_append }}
            /> : null}
        </div>;
    }
}

JQuiButton.propTypes = {
    id: PropTypes.string.isRequired,
    views: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiButton;
