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
    RxWidgetInfoAttributesField,
    RxWidgetInfoAttributesFieldHelp,
    RxWidgetInfoAttributesFieldSimple,
    Writeable,
} from '@iobroker/types-vis-2';
import JQuiBinaryState from './JQuiBinaryState';

class JQuiToggle extends JQuiBinaryState {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo: RxWidgetInfo = JQuiBinaryState.getWidgetInfo();
        const newWidgetInfo: RxWidgetInfo = {
            id: 'tplJquiToogle',
            visSet: 'jqui',
            visName: 'Icon Toggle',
            visWidgetLabel: 'jqui_icon_toggle',
            visPrev: 'widgets/jqui/img/Prev_IconToggle.png',
            visOrder: 32,
            visAttrs: widgetInfo.visAttrs,
            visDefaultStyle: {
                width: 92,
                height: 36,
            },
        };

        // Add note
        (newWidgetInfo.visAttrs[0].fields as Writeable<RxWidgetInfoAttributesField[]>).unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_binary_control_note',
        } as Writeable<RxWidgetInfoAttributesFieldHelp>);

        const iconFalse: Writeable<RxWidgetInfoAttributesFieldSimple> =
            JQuiBinaryState.findField<RxWidgetInfoAttributesFieldSimple>(newWidgetInfo, 'icon_false');
        if (iconFalse) {
            iconFalse.default =
                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMyAzaC0ydjEwaDJWM3ptNC44MyAyLjE3bC0xLjQyIDEuNDJBNi45MiA2LjkyIDAgMCAxIDE5IDEyYzAgMy44Ny0zLjEzIDctNyA3QTYuOTk1IDYuOTk1IDAgMCAxIDcuNTggNi41OEw2LjE3IDUuMTdBOC45MzIgOC45MzIgMCAwIDAgMyAxMmE5IDkgMCAwIDAgMTggMGMwLTIuNzQtMS4yMy01LjE4LTMuMTctNi44M3oiLz48L3N2Zz4=';
        }

        const colorTrue = JQuiBinaryState.findField<RxWidgetInfoAttributesFieldSimple>(newWidgetInfo, 'color_true');

        if (colorTrue) {
            colorTrue.default = '#93ff93';
        }

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return JQuiToggle.getWidgetInfo();
    }
}

export default JQuiToggle;
