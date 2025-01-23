/**
 *  ioBroker.vis-2
 *  https://github.com/ioBroker/ioBroker.vis-2
 *
 *  Copyright (c) 2023-2025 Denis Haev https://github.com/GermanBluefox,
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */

import JQuiInput from './JQuiInput';
import type {
    RxWidgetInfo,
    RxWidgetInfoAttributesField,
    RxWidgetInfoAttributesFieldCheckbox,
    RxWidgetInfoAttributesFieldSimple,
    Writeable,
} from '@iobroker/types-vis-2';

class JQuiInputSet extends JQuiInput {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo = JQuiInput.getWidgetInfo();
        const newWidgetInfo: RxWidgetInfo = {
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
        (newWidgetInfo.visAttrs[0].fields as Writeable<RxWidgetInfoAttributesField[]>).unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_input_note',
        });

        const withEnter = JQuiInput.findField<RxWidgetInfoAttributesFieldCheckbox>(newWidgetInfo, 'withEnter');
        if (withEnter) {
            withEnter.default = true;
        }

        const buttonText = JQuiInput.findField<RxWidgetInfoAttributesFieldSimple>(newWidgetInfo, 'buttontext');
        if (buttonText) {
            buttonText.default = 'OK';
        }

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return JQuiInputSet.getWidgetInfo();
    }
}

export default JQuiInputSet;
