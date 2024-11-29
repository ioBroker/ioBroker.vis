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
import JQuiInput from './JQuiInput';

class JQuiInputSet extends JQuiInput {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo = JQuiInput.getWidgetInfo();
        const newWidgetInfo = {
            id: 'tplJquiInputSet',
            visSet: 'jqui',
            visName: 'Input + Button',
            visWidgetLabel: 'jqui_input_with_button',
            visPrev: 'widgets/jqui/img/Prev_InputWithButton.png',
            visOrder: 14,
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
            text: 'jqui_button_input_note',
        });

        const withEnter = JQuiInput.findField(newWidgetInfo, 'withEnter');
        if (withEnter) {
            withEnter.default = true;
        }

        const buttonText = JQuiInput.findField(newWidgetInfo, 'buttontext');
        if (buttonText) {
            buttonText.default = 'OK';
        }

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiInputSet.getWidgetInfo();
    }
}

JQuiInputSet.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiInputSet;
