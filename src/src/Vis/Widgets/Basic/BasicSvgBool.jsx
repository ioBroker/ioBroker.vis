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

// eslint-disable-next-line import/no-cycle
import VisRxWidget from '../../visRxWidget';

class BasicSvgBool extends VisRxWidget {
    static getWidgetInfo() {
        return {
            id: 'tplValueBoolCtrlSvg',
            visSet: 'basic',
            visName: 'Bool SVG',
            visWidgetLabel: 'qui_Bool SVG',
            visPrev: 'widgets/basic/img/Prev_ValueBoolCtrlSvg.png',
            visAttrs: [{
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
                        default: '<polygon points=\'100,10 40,198 190,78 10,78 160,198\' style=\'fill:lime; stroke:purple; stroke-width:5; fill-rule:nonzero\' transform=\'scale(0.4)\' />',
                    },
                    {
                        name: 'svg_true',
                        type: 'html',
                        default: '<polygon points=\'100,10 40,198 190,78 10,78 160,198\' style=\'fill:yellow; stroke:red; stroke-width:5; fill-rule:nonzero\' transform=\'scale(0.4)\' />',
                    },
                    {
                        name: 'svg_opacity',
                        type: 'slider',
                        min: 0,
                        max: 1,
                        step: 0.05,
                    },
                ],
            }],
            // visWidgetLabel: 'value_string',  // Label of widget
            visDefaultStyle: {
                width: 85,
                height: 85,
            },
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return BasicSvgBool.getWidgetInfo();
    }

    onSvgClick() {
        const oid = this.state.rxData.oid;
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

    renderSvg() {
        let str = this.state.values[`${this.state.rxData.oid}.val`];
        if (typeof str === 'string') {
            str = str.toLowerCase();
        }
        const val = parseFloat(str);
        let opacity = this.state.rxData.svg_opacity;
        if (this.props.editMode) {
            if (opacity === undefined || opacity === null || opacity === '') {
                opacity = 1;
            }

            if (parseFloat(opacity) < 0.2) {
                opacity = 0.2;
            }
        }
        let svg;
        if (val === 0 || str === 'false' || str === '0' || str === 'off' || str === false || str === null || str === undefined) {
            svg = this.state.rxData.svg_false;
        } else {
            svg = this.state.rxData.svg_true;
        }

        return <svg
            style={{
                width: '100%',
                height: '100%',
                opacity,
            }}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: svg }}
        />;
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        return <div
            onClick={this.props.editMode ? null : () => this.onSvgClick()}
            className="vis-widget-body"
        >
            {this.renderSvg()}
        </div>;
    }
}

BasicSvgBool.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default BasicSvgBool;
