/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2022 bluefox https://github.com/GermanBluefox,
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
import VisRxWidget from '../../visRxWidget';

class BasicValueString extends VisRxWidget {
    static getWidgetInfo() {
        return {
            id: 'tplValueString',
            visSet: 'basic',
            visName: 'String',
            visAttrs: 'oid;html_prepend;html_append;test_html',
            visPrev: 'widgets/basic/img/Prev_ValueString.png',
        };
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);

        const widget = this.props.views[this.props.view].widgets[this.props.id];

        const oid = widget.data.oid && widget.data.oid.includes('"') ? '' : widget.data.oid || '';

        let body;
        if (this.props.editMode && widget.data.test_html) {
            body = widget.data.test_html;
        } else if (widget.data.oid) {
            if (widget.data.oid.includes('"')) {
                body = widget.data.oid.substring(1, widget.data.oid.length - 1);
            } else if (oid) {
                body = this.state.values[`${oid}.val`];
            } else {
                body = '';
            }
        } else {
            body = '';
        }

        return <div className="vis-widget-body">
            <div data-oid={oid}>
                { widget.data.html_prepend || '' }
                { body }
                { widget.data.html_append || '' }
            </div>
        </div>;
    }
}

BasicValueString.propTypes = {
    id: PropTypes.string.isRequired,
    views: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default BasicValueString;
