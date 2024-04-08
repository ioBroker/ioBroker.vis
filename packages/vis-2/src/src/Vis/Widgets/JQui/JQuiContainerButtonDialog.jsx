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
import JQuiButton from './JQuiButton';

class JQuiContainerButtonDialog extends JQuiButton {
    static getWidgetInfo() {
        const widgetInfo = JQuiButton.getWidgetInfo();

        const newWidgetInfo = {
            id: 'tplContainerButtonDialog',
            visSet: 'jqui',
            visName: 'container - Button - view in jqui Dialog',
            visWidgetLabel: 'jqui_container_button_dialog',
            visPrev: 'widgets/jqui/img/Prev_ContainerButtonDialog.png',
            visOrder: 11,
            visAttrs: widgetInfo.visAttrs,
        };

        // Add note
        newWidgetInfo.visAttrs[0].fields.unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_button_link_blank_note',
        });

        const buttonText = JQuiButton.findField(newWidgetInfo, 'buttontext');
        buttonText.default = 'Container Dialog';

        const containsView = JQuiButton.findField(newWidgetInfo, 'contains_view');
        containsView.default = '';

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiContainerButtonDialog.getWidgetInfo();
    }
}

JQuiContainerButtonDialog.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default JQuiContainerButtonDialog;
