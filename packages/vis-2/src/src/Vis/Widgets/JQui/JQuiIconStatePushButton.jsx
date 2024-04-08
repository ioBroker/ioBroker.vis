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

class JQuiIconStatePushButton extends JQuiBinaryState {
    static getWidgetInfo() {
        const widgetInfo = JQuiBinaryState.getWidgetInfo();
        const newWidgetInfo = {
            id: 'tplIconStatePushButton',
            visSet: 'jqui',
            visName: 'Binary Icon Push Button',
            visWidgetLabel: 'jqui_icon_state_push_button',
            visPrev: 'widgets/jqui/img/Prev_IconPushButton.png',
            visOrder: 15,
            visAttrs: widgetInfo.visAttrs,
            visDefaultStyle: {
                width: 70,
                height: 30,
            },
        };

        const pushMode = JQuiBinaryState.findField(newWidgetInfo, 'pushMode');
        if (pushMode) {
            pushMode.default = true;
        }

        // Add note
        newWidgetInfo.visAttrs[0].fields.unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_binary_control_note',
        });

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiIconStatePushButton.getWidgetInfo();
    }
}

JQuiIconStatePushButton.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiIconStatePushButton;
