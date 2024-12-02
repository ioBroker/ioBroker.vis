import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';
import VisRxWidget from '@/Vis/visRxWidget';
import { I18n } from '@iobroker/adapter-react-v5';

type RxData = {
    title: string;
    title_font: string;
    title_color: string;
    title_back: string;
    title_top: number;
    title_left: number;
    header_height: number;
    header_color: string;
};

export default class BasicFrame extends VisRxWidget<RxData> {
    /**
     * Returns the widget info which is rendered in the edit mode
     */
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplFrame',
            visSet: 'basic',
            visName: 'Border',
            visPrev: 'widgets/basic/img/Prev_tplFrame.png',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'title',
                            type: 'text',
                            default: I18n.t('jqui_widgetTitle'),
                        },
                        {
                            name: 'title_back',
                            type: 'color',
                        },
                        {
                            name: 'title_top',
                            type: 'slider',
                            min: -20,
                            max: 20,
                            default: -10,
                        },
                        {
                            name: 'title_left',
                            type: 'slider',
                            min: -20,
                            max: 30,
                            default: 20,
                        },
                        {
                            name: 'header_height',
                            type: 'slider',
                            min: 0,
                            max: 100,
                        },
                        {
                            name: 'header_color',
                            type: 'color',
                        },
                    ],
                },
            ],
            // visWidgetLabel: 'value_string',  // Label of widget
            visDefaultStyle: {
                width: 100,
                height: 70,
                'border-style': 'solid',
                'border-width': '1px',
                'border-color': '#888',
                'overflow-x': 'visible',
                'overflow-y': 'visible',
            },
        } as const;
    }

    /**
     * Enables calling widget info on the class instance itself
     */
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return BasicFrame.getWidgetInfo();
    }

    /**
     * Renders the widget
     *
     * @param props props passed to the parent classes render method
     */
    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | null {
        super.renderWidgetBody(props);

        let content = (
            <div
                style={{
                    position: 'absolute',
                    top: this.state.rxData.title_top,
                    left: this.state.rxData.title_left,
                    backgroundColor:
                        this.state.rxData.title_back ||
                        (this.state.rxData.header_height
                            ? undefined
                            : this.props.context.themeType === 'dark'
                              ? '#000'
                              : '#fff'),
                    padding: '0 5px',
                }}
            >
                {this.state.rxData.title}
            </div>
        );

        if (this.state.rxData.header_height) {
            content = (
                <div
                    style={{
                        width: '100%',
                        height: this.state.rxData.header_height,
                        backgroundColor:
                            this.state.rxData.header_color ||
                            (this.props.context.themeType === 'dark' ? '#000' : '#fff'),
                    }}
                >
                    {content}
                </div>
            );
        }

        return <div className="vis-widget-body">{content}</div>;
    }
}
