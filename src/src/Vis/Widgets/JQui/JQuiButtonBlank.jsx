/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2023 bluefox https://github.com/GermanBluefox,
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

import JQuiButton from './JQuiButton';

class JQuiButtonBlank extends JQuiButton {
    static getWidgetInfo() {
        const widgetInfo = JQuiButton.getWidgetInfo();
        const newWidgetInfo = {
            id: 'tplJquiButtonLinkBlank',
            visSet: 'jqui',
            visName: 'Button Link',
            visWidgetLabel: 'jqui_button_link_blank',
            visPrev: 'widgets/jqui/img/Prev_ButtonLinkBlank.png',
            visOrder: 2,
            visAttrs: widgetInfo.visAttrs,
        };

        // Add note
        newWidgetInfo.visAttrs[0].fields.unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_link_blank_note',
        });
        const target = JQuiButton.findField(newWidgetInfo, 'target');
        target.default = '_blank';

        const visResizable = JQuiButton.findField(newWidgetInfo, 'visResizable');
        visResizable.default = false;

        const text = JQuiButton.findField(newWidgetInfo, 'buttontext');
        text.default = 'URL Browser';

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiButtonBlank.getWidgetInfo();
    }
}

JQuiButtonBlank.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default JQuiButtonBlank;
