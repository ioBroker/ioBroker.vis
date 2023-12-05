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

import PropTypes from 'prop-types';

// eslint-disable-next-line import/no-cycle
import JQuiBinaryState from './JQuiBinaryState';

class JQuiToggle extends JQuiBinaryState {
    constructor(props) {
        super(props);
        this.state.isOn = false;
        this.state.height = 0;
        this.state.width = 0;
    }

    static getWidgetInfo() {
        const widgetInfo = JQuiBinaryState.getWidgetInfo();
        return {
            id: 'tplJquiToogle',
            visSet: 'jqui',
            visName: 'Icon Toggle',
            visWidgetLabel: 'jqui_icon_toggle',
            visPrev: 'widgets/jqui/img/Prev_IconToggle.png',
            visOrder: 32,
            visAttrs: widgetInfo.visAttrs,
            visDefaultStyle: {
                width: 76,
                height: 76,
            },
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiToggle.getWidgetInfo();
    }
}

JQuiToggle.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiToggle;
