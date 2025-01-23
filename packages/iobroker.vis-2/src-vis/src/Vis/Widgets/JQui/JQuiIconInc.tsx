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

import JQuiWriteState from './JQuiWriteState';
import type {
    RxWidgetInfo,
    RxWidgetInfoAttributesFieldSelect,
    RxWidgetInfoAttributesField,
    Writeable,
} from '@iobroker/types-vis-2';

class JQuiIconInc extends JQuiWriteState {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo: RxWidgetInfo = JQuiWriteState.getWidgetInfo();

        const newWidgetInfo: RxWidgetInfo = {
            id: 'tplIconInc',
            visSet: 'jqui',
            visName: 'Icon Increment',
            visWidgetLabel: 'jqui_icon_increment',
            visPrev: 'widgets/jqui/img/Prev_IconInc.png',
            visOrder: 27,
            visAttrs: widgetInfo.visAttrs,
        };

        // Add note
        (newWidgetInfo.visAttrs[0].fields as Writeable<RxWidgetInfoAttributesField[]>).unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_write_state_note',
        });

        const target = JQuiWriteState.findField<RxWidgetInfoAttributesFieldSelect>(newWidgetInfo, 'type');
        target.default = 'change';

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return JQuiIconInc.getWidgetInfo();
    }
}

export default JQuiIconInc;
