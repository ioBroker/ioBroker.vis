/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2023 Denis Haev https://github.com/GermanBluefox,
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */

import PropTypes from 'prop-types';

// eslint-disable-next-line import/no-cycle
import JQuiBinaryState from './JQuiBinaryState';

class JQuiToggle extends JQuiBinaryState {
    constructor(props) {
        super(props);
        this.state.isOn = false;
        this.state.height = 0;
        this.state.width = 0;
    }

    static getWidgetInfo() {
        const widgetInfo = JQuiBinaryState.getWidgetInfo();
        const newWidgetInfo = {
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
        newWidgetInfo.visAttrs[0].fields.unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_binary_control_note',
        });

        const iconFalse = JQuiBinaryState.findField(newWidgetInfo, 'icon_false');
        if (iconFalse) {
            iconFalse.default = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMyAzaC0ydjEwaDJWM3ptNC44MyAyLjE3bC0xLjQyIDEuNDJBNi45MiA2LjkyIDAgMCAxIDE5IDEyYzAgMy44Ny0zLjEzIDctNyA3QTYuOTk1IDYuOTk1IDAgMCAxIDcuNTggNi41OEw2LjE3IDUuMTdBOC45MzIgOC45MzIgMCAwIDAgMyAxMmE5IDkgMCAwIDAgMTggMGMwLTIuNzQtMS4yMy01LjE4LTMuMTctNi44M3oiLz48L3N2Zz4=';
        }

        const colorTrue = JQuiBinaryState.findField(newWidgetInfo, 'color_true');
        if (colorTrue) {
            colorTrue.default = '#93ff93';
        }

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiToggle.getWidgetInfo();
    }
}

JQuiToggle.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiToggle;
