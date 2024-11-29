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
import JQuiState from './JQuiState';

class JQuiRadioList extends JQuiState {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo = JQuiState.getWidgetInfo();
        const newWidgetInfo = {
            id: 'tplJquiRadioList',
            visSet: 'jqui',
            visName: 'Radiobuttons ValueList',
            visWidgetLabel: 'jqui_radio_list',
            visPrev: 'widgets/jqui/img/Prev_RadioList.png',
            visOrder: 15,
            visAttrs: widgetInfo.visAttrs,
            visDefaultStyle: {
                width: 250,
                height: 45,
            },
        };

        const type = JQuiState.findField(newWidgetInfo, 'type');
        type.default = 'radio';

        // Add note
        newWidgetInfo.visAttrs[0].fields.unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_state_note',
        });

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiRadioList.getWidgetInfo();
    }
}

JQuiRadioList.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiRadioList;
