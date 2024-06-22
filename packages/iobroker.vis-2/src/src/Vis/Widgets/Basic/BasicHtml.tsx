/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2023-2024 Denis Haev https://github.com/GermanBluefox,
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

// eslint-disable-next-line import/no-cycle
import type { GetRxDataFromWidget, RxRenderWidgetProps } from '@iobroker/types-vis-2';
import VisRxWidget from '../../visRxWidget';
import DangerousHtmlWithScript from '../Utils/DangerousHtmlWithScript';

// eslint-disable-next-line no-use-before-define
type RxData = GetRxDataFromWidget<typeof BasicHtml>;

class BasicHtml extends VisRxWidget<RxData> {
    interval: ReturnType<typeof setInterval> | null = null;

    static getWidgetInfo() {
        return {
            id: 'tplHtml',
            visSet: 'basic',
            visName: 'HTML',
            visPrev: 'widgets/basic/img/Prev_HTML.png',
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'html',
                        type: 'html',
                    },
                    {
                        name: 'refreshInterval',
                        type: 'slider',
                        min: 0,
                        max: 180000,
                        step: 100,
                    },
                ],
            }],
            // visWidgetLabel: 'value_string',  // Label of widget
            visDefaultStyle: {
                width: 200,
                height: 130,
            },
        } as const;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return BasicHtml.getWidgetInfo();
    }

    async componentWillUnmount() {
        this.interval && clearInterval(this.interval);
        this.interval = null;
        super.componentWillUnmount();
    }

    async componentDidMount() {
        super.componentDidMount();
        if (parseInt(this.state.rxData.refreshInterval as unknown as string, 10)) {
            this.interval = setInterval(() => this.forceUpdate(), parseInt(this.state.rxData.refreshInterval as unknown as string, 10));
        }
    }

    onRxDataChanged(prevRxData: typeof this.state.rxData) {
        super.onRxDataChanged(prevRxData);
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (parseInt(this.state.rxData.refreshInterval as unknown as string, 10)) {
            this.interval = setInterval(() => this.forceUpdate(), parseInt(this.state.rxData.refreshInterval as unknown as string, 10));
        }
    }

    /**
     * Renders the widget
     *
     * @return {Element}
     */
    renderWidgetBody(props: RxRenderWidgetProps) {
        super.renderWidgetBody(props);

        return <DangerousHtmlWithScript className="vis-widget-body" html={this.state.rxData.html} isDiv wid={this.props.id} />;
    }
}

export default BasicHtml;
