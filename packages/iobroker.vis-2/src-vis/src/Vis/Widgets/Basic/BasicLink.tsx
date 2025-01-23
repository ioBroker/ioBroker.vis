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

import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';
import VisRxWidget from '@/Vis/visRxWidget';

import DangerousHtmlWithScript from '../Utils/DangerousHtmlWithScript';

type RxData = {
    html: string;
    href: string;
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    target: 'auto' | '_blank' | '_self' | '_parent' | '_top' | string;
};

class BasicLink extends VisRxWidget<RxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplLink',
            visSet: 'basic',
            visName: 'link',
            visPrev: 'widgets/basic/img/Prev_tplLink.png',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'html',
                            type: 'html',
                        },
                        {
                            name: 'href',
                            type: 'url',
                        },
                        {
                            name: 'target',
                            label: 'target',
                            type: 'auto',
                            options: ['auto', '_blank', '_self', '_parent', '_top'],
                            hidden: '!data.href',
                        },
                    ],
                },
            ],
            // visWidgetLabel: 'value_string',  // Label of widget
            visDefaultStyle: {
                width: 200,
                height: 130,
            },
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return BasicLink.getWidgetInfo();
    }

    /**
     * Renders the widget
     *
     * @return {Element}
     */
    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        if (props.style.width === undefined) {
            props.style.width = 200;
        }
        if (props.style.height === undefined) {
            props.style.height = 130;
        }

        return (
            <a
                href={this.state.rxData.href}
                target={this.state.rxData.target}
                style={{
                    textDecoration: 'none',
                    width: '100%',
                    height: '100%',
                }}
            >
                <DangerousHtmlWithScript
                    className="vis-widget-body"
                    html={this.state.rxData.html}
                    isDiv
                    wid={this.props.id}
                />
            </a>
        );
    }
}

export default BasicLink;
