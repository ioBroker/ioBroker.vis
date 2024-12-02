import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';
import VisRxWidget from '@/Vis/visRxWidget';
import { I18n, Icon } from '@iobroker/adapter-react-v5';
import { Button } from '@mui/material';
import { Close } from '@mui/icons-material';

type RxData = {
    html: string;
    redirect_url: string;
    in_app_close: boolean;
    variant: 'contained' | 'outlined' | 'text';
    icon: string;
    image: string;
};

export default class BasicLogout extends VisRxWidget<RxData> {
    /**
     * Returns the widget info which is rendered in the edit mode
     */
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplHtmlLogout',
            visSet: 'basic',
            visName: 'HTML logout',
            visPrev: 'widgets/basic/img/Prev_HtmlLogout.png',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'html',
                            type: 'html',
                            default: 'Logout',
                        },
                        {
                            name: 'redirect_url',
                            type: 'url',
                        },
                        {
                            name: 'in_app_close',
                            type: 'checkbox',
                        },
                        {
                            name: 'variant',
                            label: 'jqui_variant',
                            type: 'select',
                            noTranslation: true,
                            options: ['contained', 'outlined', 'text'],
                            default: 'contained',
                        },
                        {
                            name: 'icon',
                            label: 'jqui_icon',
                            type: 'icon64',
                            hidden: '!!data.image',
                        },
                        {
                            name: 'image',
                            type: 'image',
                            label: 'jqui_image',
                            hidden: '!!data.icon',
                        },
                    ],
                },
            ],
            // visWidgetLabel: 'value_string',  // Label of widget
            visDefaultStyle: {
                width: 70,
                height: 30,
            },
        } as const;
    }

    /**
     * Enables calling widget info on the class instance itself
     */
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return BasicLogout.getWidgetInfo();
    }

    async onLogout(): Promise<void> {
        if (this.props.editMode) {
            return;
        }

        if (this.state.rxData.in_app_close) {
            if (typeof (window as any).logout === 'function') {
                (window as any).logout();
            } else {
                window.alert(I18n.t('This option works only in APP'));
            }
        } else {
            if (!this.props.context.socket.isSecure) {
                window.alert(I18n.t('This option works only for connection with authentication'));
                return;
            }

            await this.props.context.socket.logout();

            if (this.state.rxData.redirect_url) {
                window.location.href = this.state.rxData.redirect_url;
            } else {
                window.location.reload();
            }
        }
    }

    /**
     * Renders the widget
     *
     * @param props props passed to the parent classes render method
     */
    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | null {
        super.renderWidgetBody(props);

        return (
            <div className="vis-widget-body">
                <Button
                    style={{
                        width: '100%',
                        height: '100%',
                        minWidth: 30,
                        background: this.state.rxStyle.background || undefined,
                        backgroundColor: this.state.rxStyle['background-color'] || undefined,
                        color: this.state.rxStyle.color || undefined,
                        borderStyle: this.state.rxStyle['border-style'] || undefined,
                        borderWidth: this.state.rxStyle['border-width'] || undefined,
                        borderColor: this.state.rxStyle['border-color'] || undefined,
                        borderRadius: this.state.rxStyle['border-radius'] || undefined,
                    }}
                    variant={this.state.rxData.variant}
                    onClick={() => this.onLogout()}
                    startIcon={
                        this.state.rxData.html && (this.state.rxData.icon || this.state.rxData.image) ? (
                            <Icon src={this.state.rxData.icon || this.state.rxData.image} />
                        ) : undefined
                    }
                >
                    {this.state.rxData.html ? (
                        <div dangerouslySetInnerHTML={{ __html: this.state.rxData.html }} />
                    ) : this.state.rxData.icon || this.state.rxData.image ? (
                        <Icon src={this.state.rxData.icon || this.state.rxData.image} />
                    ) : (
                        <Close />
                    )}
                </Button>
            </div>
        );
    }
}
