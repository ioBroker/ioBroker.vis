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
import type { RxWidgetInfo, Writeable, RxWidgetInfoAttributesField } from '@iobroker/types-vis-2';

class JQuiRadioSteps extends JQuiState {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo: RxWidgetInfo = JQuiState.getWidgetInfo();
        const newWidgetInfo: RxWidgetInfo = {
            id: 'tplJquiRadioSteps',
            visSet: 'jqui',
            visName: 'Radiobuttons 25%',
            visWidgetLabel: 'jqui_radio_steps',
            visPrev: 'widgets/jqui/img/Prev_RadioSteps.png',
            visOrder: 25,
            visAttrs: widgetInfo.visAttrs,
            visDefaultStyle: {
                width: 350,
                height: 35,
            },
        };

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
        return JQuiRadioSteps.getWidgetInfo();
    }
}

export default JQuiRadioSteps;
