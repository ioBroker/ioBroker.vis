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
import JQuiButton from './JQuiButton';

class JQuiDialogExternal extends JQuiButton {
    static getWidgetInfo() {
        const widgetInfo = JQuiButton.getWidgetInfo();

        const newWidgetInfo = {
            id: 'tplContainerDialogExternal',
            visSet: 'jqui',
            visName: 'External Dialog',
            visWidgetLabel: 'jqui_html_external_dialog',
            visPrev: 'widgets/jqui/img/Prev_JquiExternalDialog.png',
            visOrder: 11,
            visAttrs: widgetInfo.visAttrs,
        };

        // Add note
        newWidgetInfo.visAttrs[0].fields.unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_link_blank_note',
        });

        const externalDialog = JQuiButton.findField(newWidgetInfo, 'externalDialog');
        externalDialog.default = true;

        const htmlDialog = JQuiButton.findField(newWidgetInfo, 'html_dialog');
        htmlDialog.default = '<div>HTML Dialog</div>';

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiDialogExternal.getWidgetInfo();
    }
}

JQuiDialogExternal.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default JQuiDialogExternal;
