import BasicImageGeneric, { type RxDataBasicImageGeneric } from './BasicImageGeneric';

interface RxData extends RxDataBasicImageGeneric {
    src: string;
}

export default class BasicImage extends BasicImageGeneric<RxData> {
    /**
     * Returns the widget info which is rendered in the edit mode
     */
    static getWidgetInfo() {
        return {
            id: 'tplImage',
            visSet: 'basic',
            visName: 'Image',
            visPrev: 'widgets/basic/img/Prev_Image.png',
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'src',
                        type: 'image',
                    },
                    {
                        name: 'stretch',
                        type: 'checkbox',
                    },
                    {
                        name: 'refreshInterval',
                        tooltip: 'basic_refreshInterval_tooltip',
                        type: 'slider',
                        min: 0,
                        max: 180000,
                        step: 100,
                        default: 0,
                    },
                    {
                        name: 'refreshOnWakeUp',
                        type: 'checkbox',
                    },
                    {
                        name: 'refreshOnViewChange',
                        type: 'checkbox',
                    },
                    {
                        name: 'refreshWithNoQuery',
                        type: 'checkbox',
                    },
                    {
                        name: 'allowUserInteractions',
                        type: 'checkbox',
                    },
                ],
            }],
            // visWidgetLabel: 'value_string',  // Label of widget
            visDefaultStyle: {
                width: 200,
                height: 130,
            },
        } as const;
    }

    /**
     * Enables calling widget info on the class instance itself
     */
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return BasicImage.getWidgetInfo();
    }

    getImage(): string {
        return this.state.rxData.src || '';
    }
}
