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

class JQuiDialog extends JQuiButton {
    static getWidgetInfo() {
        const widgetInfo = JQuiButton.getWidgetInfo();

        const newWidgetInfo = {
            id: 'tplJquiDialog',
            visSet: 'jqui',
            visName: 'HTML - Dialog',
            visWidgetLabel: 'jqui_html_dialog',
            visPrev: 'widgets/jqui/img/Prev_JquiDialog.png',
            visOrder: 5,
            visAttrs: widgetInfo.visAttrs,
        };

        // Add note
        newWidgetInfo.visAttrs[0].fields.unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_link_blank_note',
        });

        // set resizable to true
        const visResizable = JQuiButton.findField(newWidgetInfo, 'visResizable');
        visResizable.default = true;

        const html = JQuiButton.findField(newWidgetInfo, 'html');
        html.default = '<div>HTML</div>';

        const buttonText = JQuiButton.findField(newWidgetInfo, 'buttontext');
        delete buttonText.default;

        const htmlDialog = JQuiButton.findField(newWidgetInfo, 'html_dialog');
        htmlDialog.default = '<div>HTML Dialog</div>';

        newWidgetInfo.visDefaultStyle = {
            'border-width': 1,
            'border-style': 'solid',
            'border-color': '#000',
            width: '200px',
            height: '130px',
            cursor: 'pointer',
        };

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiDialog.getWidgetInfo();
    }
}

JQuiDialog.propTypes = {
    id: PropTypes.string.isRequired,
    views: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default JQuiDialog;
