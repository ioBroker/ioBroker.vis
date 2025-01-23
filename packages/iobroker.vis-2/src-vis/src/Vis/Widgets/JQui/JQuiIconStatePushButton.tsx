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
    RxWidgetInfoAttributesField,
    RxWidgetInfoAttributesFieldCheckbox,
    Writeable,
} from '@iobroker/types-vis-2';

class JQuiIconStatePushButton extends JQuiBinaryState {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo: RxWidgetInfo = JQuiBinaryState.getWidgetInfo();
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

        const pushMode = JQuiBinaryState.findField<RxWidgetInfoAttributesFieldCheckbox>(newWidgetInfo, 'pushMode');
        if (pushMode) {
            pushMode.default = true;
        }

        // Add note
        (newWidgetInfo.visAttrs[0].fields as Writeable<RxWidgetInfoAttributesField[]>).unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_binary_control_note',
        });

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return JQuiIconStatePushButton.getWidgetInfo();
    }
}

export default JQuiIconStatePushButton;
