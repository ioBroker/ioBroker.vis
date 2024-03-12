import React from 'react';

import type { GetRxDataFromWidget, RxRenderWidgetProps } from '@/types';
import { store, recalculateFields } from '@/Store';
import VisRxWidget from '@/Vis/visRxWidget';

// eslint-disable-next-line no-use-before-define
type RxData = GetRxDataFromWidget<typeof BasicImage8>;

export default class BasicImage8 extends VisRxWidget<RxData> {
    /**
     * Returns the widget info which is rendered in the edit mode
     */
    static getWidgetInfo() {
        return {
            id: 'tplStatefulImage8',
            visSet: 'basic',
            visName: 'Image 8',
            visPrev: 'widgets/basic/img/Prev_StatefulImage.png',
            visDefaultStyle: {
                width: 200,
                height: 130,
            },
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'oid',
                        type: 'id',
                    },
                    {
                        name: 'count',
                        type: 'number',
                        default: 0,
                        onChange: async (_field: unknown, data: Record<string, any>, changeData: (newData: Record<string, any>) => void) => {
                            const { count } = data;

                            for (let i = 0;  i < count; i++) {
                                data[`g_images-${i}`] = true;
                            }

                            changeData(data);
                            store.dispatch(recalculateFields(true));
                        },
                    },
                ],
            }, {
                name: 'images',
                label: 'Image',
                indexFrom: 0,
                indexTo: 'count',
                fields: [
                    {
                        name: 'src_',
                        type: 'image',
                    },
                ],
            }],
        } as const;
    }

    /**
     * Enables calling widget info on the class instance itself
     */
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return BasicImage8.getWidgetInfo();
    }

    /**
     * Renders the widget
     *
     * @param props props passed to the parent classes render method
     */
    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const classes = ['vis-widget-body'];

        const srcArr: string[] = [];

        for (let i = 0; i <= this.state.rxData.count; i++) {
            // @ts-expect-error check this
            if (this.state.rxData[`src_${i}`])  {
                // @ts-expect-error check this
                srcArr.push(this.state.rxData[`src_${i}`]);
            }
        }

        return <div className={classes.join(' ')}>
            <img
                className="vis-widget-element"
                style={{ position: 'absolute', width: '100%' }}
                src={this.getImage(srcArr)}
                alt="selected_image"
            />
        </div>;
    }

    /**
     * Get image according to current state
     *
     * @param images array of images
     */
    getImage(images: string[]) {
        if (this.state.rxData.oid !== 'nothing_selected' && this.state.values[`${this.state.rxData.oid}.val`] !== undefined) {
            let val = this.state.values[`${this.state.rxData.oid}.val`];
            if (val === 'true'  || val === true)  {
                val = 1;
            }

            if (val === 'false' || val === false) {
                val = 0;
            }
            return images[val];
        }
        return images[0];
    }
}
