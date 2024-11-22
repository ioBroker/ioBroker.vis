/**
 *  ioBroker.vis-2
 *  https://github.com/ioBroker/ioBroker.vis-2
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

class JQuiRadio extends JQuiBinaryState {
    static getWidgetInfo() {
        const widgetInfo = JQuiBinaryState.getWidgetInfo();
        const newWidgetInfo = {
            id: 'tplJquiRadio',
            visSet: 'jqui',
            visName: 'Radiobuttons on/off',
            visWidgetLabel: 'jqui_radio_buttons_on_off',
            visPrev: 'widgets/jqui/img/Prev_RadioButtonsOnOff.png',
            visOrder: 15,
            visAttrs: widgetInfo.visAttrs,
            visDefaultStyle: {
                width: 150,
                height: 45,
            },
        };

        // Add note
        newWidgetInfo.visAttrs[0].fields.unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_binary_control_note',
        });

        const type = JQuiBinaryState.findField(newWidgetInfo, 'type');
        if (type) {
            type.default = 'radio';
        }

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiRadio.getWidgetInfo();
    }
}

JQuiRadio.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiRadio;
