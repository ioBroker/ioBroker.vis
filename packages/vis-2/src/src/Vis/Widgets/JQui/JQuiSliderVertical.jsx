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
import JQuiSlider from './JQuiSlider';

class JQuiSliderVertical extends JQuiSlider {
    static getWidgetInfo() {
        const widgetInfo = JQuiSlider.getWidgetInfo();
        const newWidgetInfo = {
            id: 'tplJquiSliderVertical',
            visSet: 'jqui',
            visName: 'Vertical slider ',
            visWidgetLabel: 'jqui_slider_vertical',
            visPrev: 'widgets/jqui/img/Prev_SliderVertical.png',
            visOrder: 25,
            visAttrs: widgetInfo.visAttrs,
            visDefaultStyle: {
                width: 40,
                height: 300,
            },
        };
        newWidgetInfo.visAttrs[0].fields.unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_slider_note',
        });

        const orientation = JQuiSlider.findField(newWidgetInfo, 'orientation');
        orientation.default = 'vertical';

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return JQuiSliderVertical.getWidgetInfo();
    }
}

JQuiSliderVertical.propTypes = {
    id: PropTypes.string.isRequired,
    context: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    tpl: PropTypes.string.isRequired,
};

export default JQuiSliderVertical;
