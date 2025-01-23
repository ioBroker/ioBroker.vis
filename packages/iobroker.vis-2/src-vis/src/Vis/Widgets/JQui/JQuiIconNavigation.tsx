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

class JQuiIconNavigation extends JQuiButton {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo = JQuiButton.getWidgetInfo();

        const newWidgetInfo: RxWidgetInfo = {
            id: 'tplJquiIconNav',
            visSet: 'jqui',
            visName: 'Navigation Icon',
            visWidgetLabel: 'jqui_navigation_icon',
            visPrev: 'widgets/jqui/img/Prev_IconNav.png',
            visOrder: 9,
            visAttrs: widgetInfo.visAttrs,
        };

        // Add note
        (newWidgetInfo.visAttrs[0].fields as Writeable<RxWidgetInfoAttributesField[]>).unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_nav_blank_note',
        });

        const buttonText = JQuiButton.findField<RxWidgetInfoAttributesFieldSimple>(newWidgetInfo, 'buttontext');
        delete buttonText.default;

        const modal = JQuiButton.findField<RxWidgetInfoAttributesFieldCheckbox>(newWidgetInfo, 'modal');
        delete modal.default;

        const navView = JQuiButton.findField<RxWidgetInfoAttributesFieldSimple>(newWidgetInfo, 'nav_view');
        navView.default = '';

        const icon = JQuiButton.findField<RxWidgetInfoAttributesFieldSimple>(newWidgetInfo, 'icon');
        icon.default =
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0yMSAzTDMgMTAuNTN2Ljk4bDYuODQgMi42NUwxMi40OCAyMWguOThMMjEgM3oiLz48L3N2Zz4=';

        // set resizable to true
        const visResizable = JQuiButton.findField<RxWidgetInfoAttributesFieldCheckbox>(newWidgetInfo, 'visResizable');
        visResizable.default = true;

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return JQuiIconNavigation.getWidgetInfo();
    }
}

export default JQuiIconNavigation;
