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
    RxWidgetInfoAttributesFieldSimple,
    RxWidgetInfoAttributesFieldText,
    RxWidgetInfoWriteable,
} from '@iobroker/types-vis-2';
import JQuiButton from './JQuiButton';

class JQuiContainerButtonDialog extends JQuiButton {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo = JQuiButton.getWidgetInfo() as unknown as RxWidgetInfoWriteable;

        const newWidgetInfo = {
            id: 'tplContainerButtonDialog',
            visSet: 'jqui',
            visName: 'container - Button - view in jqui Dialog',
            visWidgetLabel: 'jqui_container_button_dialog',
            visPrev: 'widgets/jqui/img/Prev_ContainerButtonDialog.png',
            visOrder: 11,
            visAttrs: widgetInfo.visAttrs,
        };

        // Add note
        newWidgetInfo.visAttrs[0].fields.unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_link_blank_note',
        });

        const buttonText = JQuiButton.findField<RxWidgetInfoAttributesFieldText>(newWidgetInfo, 'buttontext');
        buttonText.default = 'Container Dialog';

        const containsView = JQuiButton.findField<RxWidgetInfoAttributesFieldSimple>(
            newWidgetInfo,
            'contains_view',
        );
        containsView.default = '';

        return newWidgetInfo as RxWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiContainerButtonDialog.getWidgetInfo();
    }
}

export default JQuiContainerButtonDialog;
