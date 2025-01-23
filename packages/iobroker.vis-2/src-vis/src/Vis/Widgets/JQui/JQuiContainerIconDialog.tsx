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

class JQuiContainerIconDialog extends JQuiButton {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo = JQuiButton.getWidgetInfo();

        const newWidgetInfo: RxWidgetInfo = {
            id: 'tplContainerIconDialog',
            visSet: 'jqui',
            visName: 'container - Icon - view in jqui Dialog',
            visWidgetLabel: 'jqui_container_icon_dialog',
            visPrev: 'widgets/jqui/img/Prev_ContainerIconDialog.png',
            visOrder: 12,
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

        const icon = JQuiButton.findField<RxWidgetInfoAttributesFieldSimple>(newWidgetInfo, 'icon');
        icon.default =
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xOSAxOUg1VjVoN1YzSDVhMiAyIDAgMCAwLTIgMnYxNGEyIDIgMCAwIDAgMiAyaDE0YzEuMSAwIDItLjkgMi0ydi03aC0ydjd6TTE0IDN2MmgzLjU5bC05LjgzIDkuODNsMS40MSAxLjQxTDE5IDYuNDFWMTBoMlYzaC03eiIvPjwvc3ZnPg==';

        const buttonText = JQuiButton.findField<RxWidgetInfoAttributesFieldSimple>(newWidgetInfo, 'buttontext');
        delete buttonText.default;

        const containsView = JQuiButton.findField<RxWidgetInfoAttributesFieldSimple>(newWidgetInfo, 'contains_view');
        containsView.default = '';

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return JQuiContainerIconDialog.getWidgetInfo();
    }
}

export default JQuiContainerIconDialog;
