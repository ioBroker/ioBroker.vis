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

class BasicHtmlNav extends VisRxWidget {
    static getWidgetInfo() {
        return {
            id: 'tplHtmlNav',
            visSet: 'basic',
            visName: 'HTML navigation',
            visPrev: 'widgets/basic/img/Prev_HTMLnavigation.png',
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'html',
                        type: 'html',
                    },
                    {
                        name: 'nav_view',
                        type: 'views',
                    },
                    {
                        name: 'sub_view',
                        label: 'basic_sub_view',
                        type: 'text',
                        tooltip: 'sub_view_tooltip',
                        hidden: data => !data.nav_view,
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
        return BasicHtmlNav.getWidgetInfo();
    }

    onNavigate = () => {
        if (this.state.rxData.nav_view) {
            this.props.context.changeView(this.state.rxData.nav_view, this.state.rxData.sub_view || null);
        }
    };

    /**
     * Renders the widget
     *
     * @return {Element}
     */
    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        if (props.style.width === undefined) {
            props.style.width = 200;
        }
        if (props.style.height === undefined) {
            props.style.height = 130;
        }

        return <DangerousHtmlWithScript
            className="vis-widget-body"
            html={this.state.rxData.html}
            isDiv
            wid={this.props.id}
            onClick={this.props.editMode ? null : this.onNavigate}
        />;
    }
}

BasicHtmlNav.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default BasicHtmlNav;
