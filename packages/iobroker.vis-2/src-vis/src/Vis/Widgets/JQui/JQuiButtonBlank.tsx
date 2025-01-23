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

import type {
    RxWidgetInfo,
    RxWidgetInfoAttributesFieldCheckbox,
    RxWidgetInfoAttributesFieldSelect,
    RxWidgetInfoAttributesFieldText,
    RxWidgetInfoWriteable,
} from '@iobroker/types-vis-2';
import JQuiButton from './JQuiButton';

class JQuiButtonBlank extends JQuiButton {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo = JQuiButton.getWidgetInfo() as unknown as RxWidgetInfoWriteable;
        const newWidgetInfo = {
            id: 'tplJquiButtonLinkBlank',
            visSet: 'jqui',
            visName: 'Button Link',
            visWidgetLabel: 'jqui_button_link_blank',
            visPrev: 'widgets/jqui/img/Prev_ButtonLinkBlank.png',
            visOrder: 2,
            visAttrs: widgetInfo.visAttrs,
        };

        // Add note
        newWidgetInfo.visAttrs[0].fields.unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_link_blank_note',
        });
        const target = JQuiButton.findField<RxWidgetInfoAttributesFieldSelect>(newWidgetInfo, 'target');
        target.default = '_blank';

        const visResizable = JQuiButton.findField<RxWidgetInfoAttributesFieldCheckbox>(newWidgetInfo, 'visResizable');
        visResizable.default = false;

        const text = JQuiButton.findField<RxWidgetInfoAttributesFieldText>(newWidgetInfo, 'buttontext');
        text.default = 'URL Browser';

        return newWidgetInfo as RxWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return JQuiButtonBlank.getWidgetInfo();
    }
}

export default JQuiButtonBlank;
