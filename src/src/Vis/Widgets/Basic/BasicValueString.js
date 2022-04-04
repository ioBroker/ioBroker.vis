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

    componentDidMount() {
        super.componentDidMount();
        // subscribe on OID
        const widget = this.props.views[this.props.view].widgets[this.props.id];
        this.oid = widget.data.oid && widget.data.oid.includes('"') ? '' : widget.data.oid || '';
        this.oid && this.props.socket.subscribeState(this.oid, this.onStateChanged);
    }

    componentWillUnmount() {
        this.oid && this.props.socket.unsubscribeState(this.oid, this.onStateChanged);
        super.componentWillUnmount();
    }

    onStateChanged = (id, state) => {
        this.setState({ [`${id}.val`]: state ? state.val : '' });
    }

    renderWidgetBody() {
        const widget = this.props.views[this.props.view].widgets[this.props.id];

        const oid = widget.data.oid && widget.data.oid.includes('"') ? '' : widget.data.oid || '';

        let body;
        if (this.props.editMode && widget.data.test_html) {
            body = widget.data.test_html;
        } else if (widget.data.oid) {
            if (widget.data.oid.includes('"')) {
                body = widget.data.oid.substring(1, widget.data.oid.length - 1);
            } else if (this.oid) {
                body = this.state[`${this.oid}.val`];
            } else {
                body = '';
            }
        } else {
            body = '';
        }

        const style = {
            ...widget.style,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        };

        return <div
            className={`vis-widget ${widget.class || ''}`}
            style={style}
            id={this.props.id}
        >
            <div className="vis-widget-body">
                <div data-oid={oid}>
                    { widget.data.html_prepend || '' }
                    { body }
                    { widget.data.html_append || '' }
                </div>
            </div>
        </div>;
    }
}

BasicValueString.propTypes = {
    id: PropTypes.string.isRequired,
    views: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    runtime: PropTypes.bool,
    userGroups: PropTypes.object.isRequired,
    user: PropTypes.string.isRequired,
    allWidgets: PropTypes.object.isRequired,
    jQuery: PropTypes.func.isRequired,
    socket: PropTypes.object.isRequired,
    isRelative: PropTypes.bool,
    viewsActiveFilter: PropTypes.object.isRequired,
    setValue: PropTypes.func.isRequired,
    $$: PropTypes.func, // Gestures library
    refParent: PropTypes.object.isRequired,
    linkContext: PropTypes.object.isRequired,
    formatUtils: PropTypes.object,
    selectedWidgets: PropTypes.array,
    setSelectedWidgets: PropTypes.func,
    mouseDownOnView: PropTypes.func,
    registerRef: PropTypes.func,
    onWidgetsChanged: PropTypes.func,
    showWidgetNames: PropTypes.bool,
    editGroup: PropTypes.bool,
    VisView: PropTypes.any,

    adapterName: PropTypes.string.isRequired,
    instance: PropTypes.number.isRequired,
    projectName: PropTypes.string.isRequired,
};

export default BasicValueString;
