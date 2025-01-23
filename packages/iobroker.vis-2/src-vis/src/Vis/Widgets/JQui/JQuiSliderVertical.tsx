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

import JQuiSlider from './JQuiSlider';
import type {
    RxWidgetInfo,
    RxWidgetInfoAttributesFieldSelect,
    Writeable,
    RxWidgetInfoAttributesField,
} from '@iobroker/types-vis-2';

class JQuiSliderVertical extends JQuiSlider {
    static getWidgetInfo(): RxWidgetInfo {
        const widgetInfo: RxWidgetInfo = JQuiSlider.getWidgetInfo();
        const newWidgetInfo: RxWidgetInfo = {
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
        (newWidgetInfo.visAttrs[0].fields as Writeable<RxWidgetInfoAttributesField[]>).unshift({
            name: '_note',
            type: 'help',
            text: 'jqui_slider_note',
        });

        const orientation = JQuiSlider.findField<RxWidgetInfoAttributesFieldSelect>(newWidgetInfo, 'orientation');
        orientation.default = 'vertical';

        return newWidgetInfo;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return JQuiSliderVertical.getWidgetInfo();
    }
}

export default JQuiSliderVertical;
