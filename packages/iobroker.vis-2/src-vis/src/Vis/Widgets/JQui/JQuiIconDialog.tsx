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

import JQuiButton from './JQuiButton';
import type {
    RxWidgetInfo,
    RxWidgetInfoAttributesField,
    RxWidgetInfoAttributesFieldCheckbox,
    RxWidgetInfoAttributesFieldSimple,
    Writeable,
} from '@iobroker/types-vis-2';

class JQuiIconDialog extends JQuiButton {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo: RxWidgetInfo = JQuiButton.getWidgetInfo();

        const newWidgetInfo = {
            id: 'tplJquiIconDialog',
            visSet: 'jqui',
            visName: 'Icon - Dialog',
            visWidgetLabel: 'jqui_icon_dialog',
            visPrev: 'widgets/jqui/img/Prev_JquiIconDialog.png',
            visOrder: 6,
            visAttrs: widgetInfo.visAttrs,
        };

        // Add note
        (newWidgetInfo.visAttrs[0].fields as Writeable<RxWidgetInfoAttributesField[]>).unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_link_blank_note',
        });

        // set resizable to true
        const visResizable = JQuiButton.findField<RxWidgetInfoAttributesFieldCheckbox>(newWidgetInfo, 'visResizable');
        visResizable.default = true;

        const buttonText = JQuiButton.findField<RxWidgetInfoAttributesFieldSimple>(newWidgetInfo, 'buttontext');
        buttonText.default = 'Icon Dialog';

        const htmlDialog = JQuiButton.findField<RxWidgetInfoAttributesFieldSimple>(newWidgetInfo, 'html_dialog');
        htmlDialog.default = '<div>HTML Dialog</div>';

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return JQuiIconDialog.getWidgetInfo();
    }
}

export default JQuiIconDialog;
