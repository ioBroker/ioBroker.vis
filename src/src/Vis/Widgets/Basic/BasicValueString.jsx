/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
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
import PropTypes from 'prop-types';

import { Icon } from '@iobroker/adapter-react-v5';

// eslint-disable-next-line import/no-cycle
import VisRxWidget from '../../visRxWidget';

class BasicValueString extends VisRxWidget {
    static getWidgetInfo() {
        return {
            id: 'tplValueString',
            visSet: 'basic',
            visName: 'String',
            visPrev: 'widgets/basic/img/Prev_ValueString.png',
            visAttrs: [{
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
            }],
            visWidgetLabel: 'value_string',  // Label of widget
            visDefaultStyle: {
                width: 100,
                height: 30,
            },
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return BasicValueString.getWidgetInfo();
    }

    renderWidgetBody(props) {
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

        const style = this.state.rxData.icon ? {
            display: 'flex',
            alignItems: 'center',
        } : {};
        return <div className="vis-widget-body">
            <div data-oid={oid} style={style}>
                {this.state.rxData.icon ? <Icon
                    src={this.state.rxData.icon}
                    style={{
                        width: this.state.rxData.iconSize || 24,
                        height: this.state.rxData.iconSize || 24,
                    }}
                /> : null}
                {/* eslint-disable-next-line react/no-danger */}
                <div style={{ display: 'inline' }} dangerouslySetInnerHTML={{ __html: this.state.rxData.html_prepend ?? '' }}></div>
                <span>{body}</span>
                {/* eslint-disable-next-line react/no-danger */}
                <div style={{ display: 'inline' }} dangerouslySetInnerHTML={{ __html: this.state.rxData.html_append ?? '' }}></div>
            </div>
        </div>;
    }
}

BasicValueString.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default BasicValueString;
