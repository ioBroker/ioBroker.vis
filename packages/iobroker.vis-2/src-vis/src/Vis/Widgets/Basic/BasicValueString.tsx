/**
 *  ioBroker.vis-2
 *  https://github.com/ioBroker/ioBroker.vis-2
 *
 *  Copyright (c) 2022-2023 Denis Haev https://github.com/GermanBluefox,
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

import { Icon } from '@iobroker/adapter-react-v5';

import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';
import VisRxWidget from '../../visRxWidget';

type RxData = {
    oid: string;
    html_prepend: string;
    html_append: string;
    test_html: string;
    icon: string;
    iconSize: number;
};

class BasicValueString extends VisRxWidget<RxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplValueString',
            visSet: 'basic',
            visName: 'String',
            visPrev: 'widgets/basic/img/Prev_ValueString.png',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        { name: 'oid', type: 'id' },
                        { name: 'html_prepend', type: 'html' },
                        { name: 'html_append', type: 'html' },
                        { name: 'test_html', type: 'html' },
                        { name: 'icon', type: 'icon64' },
                        {
                            name: 'iconSize',
                            label: 'icon_size_in_pixels',
                            type: 'slider',
                            min: 5,
                            max: 200,
                            hidden: '!data.icon',
                        },
                    ],
                },
            ],
            visWidgetLabel: 'value_string', // Label of widget
            visDefaultStyle: {
                width: 100,
                height: 30,
            },
        } as const;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return BasicValueString.getWidgetInfo();
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);

        // set default width and height
        if (props.style.width === undefined) {
            props.style.width = 50;
        }
        if (props.style.height === undefined) {
            props.style.height = 20;
        }

        const oid = this.state.rxData.oid && this.state.rxData.oid.includes('"') ? '' : this.state.rxData.oid || '';

        let body;
        if (this.props.editMode && this.state.rxData.test_html) {
            body = this.state.rxData.test_html;
        } else if (this.state.rxData.oid) {
            if (this.state.rxData.oid.includes('"')) {
                body = this.state.rxData.oid.substring(1, this.state.rxData.oid.length - 1);
            } else if (oid) {
                body = this.state.values[`${oid}.val`];
            } else {
                body = '';
            }
        } else {
            body = '';
        }

        const style = this.state.rxData.icon
            ? {
                  display: 'flex',
                  alignItems: 'center',
              }
            : {};

        return (
            <div className="vis-widget-body">
                <div
                    data-oid={oid}
                    style={style}
                >
                    {this.state.rxData.icon ? (
                        <Icon
                            src={this.state.rxData.icon}
                            style={{
                                width: this.state.rxData.iconSize || 24,
                                height: this.state.rxData.iconSize || 24,
                            }}
                        />
                    ) : null}
                    <span dangerouslySetInnerHTML={{ __html: this.state.rxData.html_prepend ?? '' }} />
                    <span>{body}</span>
                    <span dangerouslySetInnerHTML={{ __html: this.state.rxData.html_append ?? '' }} />
                </div>
            </div>
        );
    }
}

export default BasicValueString;
