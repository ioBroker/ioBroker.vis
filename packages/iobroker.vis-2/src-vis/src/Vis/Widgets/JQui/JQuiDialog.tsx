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
    RxWidgetInfoAttributesField,
    RxWidgetInfoAttributesFieldCheckbox,
    RxWidgetInfoAttributesFieldSimple,
    WidgetStyle,
    Writeable,
    RxWidgetInfo,
} from '@iobroker/types-vis-2';

class JQuiDialog extends JQuiButton {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo = JQuiButton.getWidgetInfo();

        const newWidgetInfo: RxWidgetInfo = {
            id: 'tplJquiDialog',
            visSet: 'jqui',
            visName: 'HTML - Dialog',
            visWidgetLabel: 'jqui_html_dialog',
            visPrev: 'widgets/jqui/img/Prev_JquiDialog.png',
            visOrder: 5,
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

        const html = JQuiButton.findField<RxWidgetInfoAttributesFieldSimple>(newWidgetInfo, 'html');
        html.default = '<div>HTML</div>';

        const buttonText = JQuiButton.findField<RxWidgetInfoAttributesFieldSimple>(newWidgetInfo, 'buttontext');
        delete buttonText.default;

        const htmlDialog = JQuiButton.findField<RxWidgetInfoAttributesFieldSimple>(newWidgetInfo, 'html_dialog');
        htmlDialog.default = '<div>HTML Dialog</div>';

        (newWidgetInfo.visDefaultStyle as Writeable<WidgetStyle>) = {
            'border-width': '1px',
            'border-style': 'solid',
            'border-color': '#000',
            width: '200px',
            height: '130px',
            cursor: 'pointer',
        };

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return JQuiDialog.getWidgetInfo();
    }
}

export default JQuiDialog;
