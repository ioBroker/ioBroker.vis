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
import DangerousHtmlWithScript from '../Utils/DangerousHtmlWithScript';

class BasicHtml extends VisRxWidget {
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
        };
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
        if (this.state.rxData.refreshInterval) {
            this.interval = setInterval(() => this.forceUpdate(), this.state.rxData.refreshInterval);
        }
    }

    onRxDataChanged(prevRxData) {
        super.onRxDataChanged(prevRxData);
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.state.rxData.refreshInterval) {
            this.interval = setInterval(() => this.forceUpdate(), this.state.rxData.refreshInterval);
        }
    }

    /**
     * Renders the widget
     *
     * @return {Element}
     */
    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        return <DangerousHtmlWithScript className="vis-widget-body" html={this.state.rxData.html} isDiv />;
    }
}

BasicHtml.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default BasicHtml;
