/**
 *  ioBroker.vis-2
 *  https://github.com/ioBroker/ioBroker.vis-2
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
import JQuiWriteState from './JQuiWriteState';

class JQuiIconInc extends JQuiWriteState {
    static getWidgetInfo() {
        const widgetInfo = JQuiWriteState.getWidgetInfo();

        const newWidgetInfo = {
            id: 'tplIconInc',
            visSet: 'jqui',
            visName: 'Icon Increment',
            visWidgetLabel: 'jqui_icon_increment',
            visPrev: 'widgets/jqui/img/Prev_IconInc.png',
            visOrder: 27,
            visAttrs: widgetInfo.visAttrs,
        };

        // Add note
        newWidgetInfo.visAttrs[0].fields.unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_write_state_note',
        });

        const target = JQuiWriteState.findField(newWidgetInfo, 'type');
        target.default = 'change';

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiIconInc.getWidgetInfo();
    }
}

JQuiIconInc.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiIconInc;
