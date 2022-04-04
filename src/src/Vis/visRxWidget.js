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

import PropTypes from 'prop-types';
import VisBaseWidget from './visBaseWidget';

class VisRxWidget extends VisBaseWidget {
    constructor(props) {
        super(props, true);
    }

    render() {
        const rx = super.render();

        return rx;
    }
}

VisRxWidget.propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    id: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    views: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    view: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    can: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    canStates: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    editMode: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    runtime: PropTypes.bool,
    // eslint-disable-next-line react/no-unused-prop-types
    userGroups: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    user: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    allWidgets: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    jQuery: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    socket: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    isRelative: PropTypes.bool,
    // eslint-disable-next-line react/no-unused-prop-types
    viewsActiveFilter: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    setValue: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    $$: PropTypes.func, // Gestures library
    // eslint-disable-next-line react/no-unused-prop-types
    refParent: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    linkContext: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    formatUtils: PropTypes.object,
    // eslint-disable-next-line react/no-unused-prop-types
    selectedWidgets: PropTypes.array,
    // eslint-disable-next-line react/no-unused-prop-types
    setSelectedWidgets: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    mouseDownOnView: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    registerRef: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    onWidgetsChanged: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    showWidgetNames: PropTypes.bool,
    // eslint-disable-next-line react/no-unused-prop-types
    editGroup: PropTypes.bool,
    // eslint-disable-next-line react/no-unused-prop-types
    VisView: PropTypes.any,

    // eslint-disable-next-line react/no-unused-prop-types
    adapterName: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    instance: PropTypes.number.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    projectName: PropTypes.string.isRequired,
};

export default VisRxWidget;
