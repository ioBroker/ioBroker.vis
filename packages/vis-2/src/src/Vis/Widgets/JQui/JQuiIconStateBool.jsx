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

class JQuiIconStateBool extends JQuiBinaryState {
    static getWidgetInfo() {
        const widgetInfo = JQuiBinaryState.getWidgetInfo();
        const newWidgetInfo = {
            id: 'tplIconStateBool',
            visSet: 'jqui',
            visName: 'Binary Icon State',
            visWidgetLabel: 'jqui_icon_state_bool',
            visPrev: 'widgets/jqui/img/Prev_IconStateBool.png',
            visOrder: 15,
            visAttrs: widgetInfo.visAttrs,
            visDefaultStyle: {
                width: 70,
                height: 30,
            },
        };

        const iconFalse = JQuiBinaryState.findField(newWidgetInfo, 'icon_false');
        if (iconFalse) {
            iconFalse.default = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik05IDIxYzAgLjUuNCAxIDEgMWg0Yy42IDAgMS0uNSAxLTF2LTFIOXYxem0zLTE5QzguMSAyIDUgNS4xIDUgOWMwIDIuNCAxLjIgNC41IDMgNS43VjE3YzAgLjUuNCAxIDEgMWg2Yy42IDAgMS0uNSAxLTF2LTIuM2MxLjgtMS4zIDMtMy40IDMtNS43YzAtMy45LTMuMS03LTctN3oiLz48L3N2Zz4=';
        }

        // Add note
        newWidgetInfo.visAttrs[0].fields.unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_binary_control_note',
        });

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiIconStateBool.getWidgetInfo();
    }
}

JQuiIconStateBool.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiIconStateBool;
