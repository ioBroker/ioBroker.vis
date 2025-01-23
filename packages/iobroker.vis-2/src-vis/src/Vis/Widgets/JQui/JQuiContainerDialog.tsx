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
    RxWidgetInfoAttributesFieldHTML,
    RxWidgetInfoAttributesFieldText,
    RxWidgetInfoWriteable,
} from '@iobroker/types-vis-2';
import JQuiButton from './JQuiButton';

class JQuiContainerDialog extends JQuiButton {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo = JQuiButton.getWidgetInfo() as unknown as RxWidgetInfoWriteable;

        const newWidgetInfo = {
            id: 'tplContainerDialog',
            visSet: 'jqui',
            visName: 'container - HTML - view in jqui Dialog',
            visWidgetLabel: 'jqui_container_dialog',
            visPrev: 'widgets/jqui/img/Prev_ContainerDialog.png',
            visOrder: 7,
            visAttrs: widgetInfo.visAttrs,
        };

        // Add note
        newWidgetInfo.visAttrs[0].fields.unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_link_blank_note',
        });

        // set resizable to true
        const visResizable = JQuiButton.findField<RxWidgetInfoAttributesFieldCheckbox>(newWidgetInfo, 'visResizable');
        visResizable.default = true;

        const buttonText = JQuiButton.findField<RxWidgetInfoAttributesFieldText>(newWidgetInfo, 'buttontext');
        buttonText.default = 'Container Dialog';

        const htmlDialog = JQuiButton.findField<RxWidgetInfoAttributesFieldHTML>(newWidgetInfo, 'html_dialog');
        htmlDialog.default = '<div>HTML Dialog</div>';

        return newWidgetInfo as RxWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiContainerDialog.getWidgetInfo();
    }
}

export default JQuiContainerDialog;
