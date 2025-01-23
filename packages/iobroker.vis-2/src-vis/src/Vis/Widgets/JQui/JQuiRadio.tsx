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

import JQuiBinaryState from './JQuiBinaryState';
import type {
    RxWidgetInfo,
    RxWidgetInfoAttributesFieldSelect,
    Writeable,
    RxWidgetInfoAttributesField,
} from '@iobroker/types-vis-2';

class JQuiRadio extends JQuiBinaryState {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo: RxWidgetInfo = JQuiBinaryState.getWidgetInfo();
        const newWidgetInfo: RxWidgetInfo = {
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
        (newWidgetInfo.visAttrs[0].fields as Writeable<RxWidgetInfoAttributesField[]>).unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_binary_control_note',
        });

        const type = JQuiBinaryState.findField<RxWidgetInfoAttributesFieldSelect>(newWidgetInfo, 'type');
        if (type) {
            type.default = 'radio';
        }

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return JQuiRadio.getWidgetInfo();
    }
}

export default JQuiRadio;
