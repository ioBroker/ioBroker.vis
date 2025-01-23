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
import VisRxWidget from '../../visRxWidget';

// eslint-disable-next-line no-use-before-define
type RxData = {
    oid: string;
    no_control: boolean;
    svg_false: string;
    svg_true: string;
    svg_opacity: number;
};

class BasicSvgBool extends VisRxWidget<RxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplValueBoolCtrlSvg',
            visSet: 'basic',
            visName: 'Bool SVG',
            visWidgetLabel: 'qui_Bool SVG',
            visPrev: 'widgets/basic/img/Prev_ValueBoolCtrlSvg.png',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'oid',
                            type: 'id',
                        },
                        {
                            name: 'no_control',
                            type: 'checkbox',
                        },
                        {
                            name: 'svg_false',
                            type: 'html',
                            default:
                                "<polygon points='100,10 40,198 190,78 10,78 160,198' style='fill:lime; stroke:purple; stroke-width:5; fill-rule:nonzero' transform='scale(0.4)' />",
                        },
                        {
                            name: 'svg_true',
                            type: 'html',
                            default:
                                "<polygon points='100,10 40,198 190,78 10,78 160,198' style='fill:yellow; stroke:red; stroke-width:5; fill-rule:nonzero' transform='scale(0.4)' />",
                        },
                        {
                            name: 'svg_opacity',
                            type: 'slider',
                            min: 0,
                            max: 1,
                            step: 0.05,
                        },
                    ],
                },
            ],
            // visWidgetLabel: 'value_string',  // Label of widget
            visDefaultStyle: {
                width: 85,
                height: 85,
            },
        } as const;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return BasicSvgBool.getWidgetInfo();
    }

    onSvgClick(): void {
        const oid: string = this.state.rxData.oid;
        let val = this.state.values[`${this.state.rxData.oid}.val`];
        if (val === null || val === '' || val === undefined || val === false || val === 'false') {
            this.props.context.setValue(oid, true);
        } else if (val === true || val === 'true') {
            this.props.context.setValue(oid, false);
        } else {
            val = parseFloat(val);
            if (val >= 0.5) {
                val = 1;
            } else {
                val = 0;
            }
            this.props.context.setValue(oid, 1 - val);
        }
    }

    renderSvg(): React.JSX.Element {
        let str = this.state.values[`${this.state.rxData.oid}.val`];
        if (typeof str === 'string') {
            str = str.toLowerCase();
        }
        const val = parseFloat(str);
        let opacity = this.state.rxData.svg_opacity;
        if (this.props.editMode) {
            if (opacity === undefined || opacity === null || (opacity as unknown as string) === '') {
                opacity = 1;
            }

            if (parseFloat(opacity as unknown as string) < 0.2) {
                opacity = 0.2;
            }
        }
        let svg;
        if (
            val === 0 ||
            str === 'false' ||
            str === '0' ||
            str === 'off' ||
            str === false ||
            str === null ||
            str === undefined
        ) {
            svg = this.state.rxData.svg_false;
        } else {
            svg = this.state.rxData.svg_true;
        }

        return (
            <svg
                style={{
                    width: '100%',
                    height: '100%',
                    opacity: opacity,
                }}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: svg }}
            />
        );
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);

        return (
            <div
                onClick={this.props.editMode ? null : () => this.onSvgClick()}
                className="vis-widget-body"
            >
                {this.renderSvg()}
            </div>
        );
    }
}

export default BasicSvgBool;
