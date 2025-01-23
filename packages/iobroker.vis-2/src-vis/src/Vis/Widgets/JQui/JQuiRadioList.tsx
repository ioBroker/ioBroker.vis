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

import JQuiState from './JQuiState';
import type {
    RxWidgetInfo,
    RxWidgetInfoAttributesFieldSelect,
    Writeable,
    RxWidgetInfoAttributesField,
} from '@iobroker/types-vis-2';

class JQuiRadioList extends JQuiState {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo: RxWidgetInfo = JQuiState.getWidgetInfo();
        const newWidgetInfo: RxWidgetInfo = {
            id: 'tplJquiRadioList',
            visSet: 'jqui',
            visName: 'Radiobuttons ValueList',
            visWidgetLabel: 'jqui_radio_list',
            visPrev: 'widgets/jqui/img/Prev_RadioList.png',
            visOrder: 15,
            visAttrs: widgetInfo.visAttrs,
            visDefaultStyle: {
                width: 250,
                height: 45,
            },
        };

        const type = JQuiState.findField<RxWidgetInfoAttributesFieldSelect>(newWidgetInfo, 'type');
        type.default = 'radio';

        // Add note
        (newWidgetInfo.visAttrs[0].fields as Writeable<RxWidgetInfoAttributesField[]>).unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_state_note',
        });

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return JQuiRadioList.getWidgetInfo();
    }
}

export default JQuiRadioList;
