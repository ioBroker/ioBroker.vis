import { store, recalculateFields } from '@/Store';
import BasicImageGeneric, { type RxDataBasicImageGeneric } from './BasicImageGeneric';
import type { RxWidgetInfo } from '@iobroker/types-vis-2';

interface RxData extends RxDataBasicImageGeneric {
    count: number;
    oid: string;
    [key: `src_${number}`]: string;
}

export default class BasicImage8 extends BasicImageGeneric<RxData> {
    /**
     * Returns the widget info which is rendered in the edit mode
     */
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplStatefulImage8',
            visSet: 'basic',
            visName: 'Image 8',
            visPrev: 'widgets/basic/img/Prev_StatefulImage.png',
            visDefaultStyle: {
                width: 200,
                height: 130,
            },
            visAttrs: [
                {
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
                            onChange: (
                                _field: unknown,
                                data: Record<string, any>,
                                changeData: (newData: Record<string, any>) => void,
                            ): Promise<void> => {
                                const { count } = data;

                                for (let i = 0; i < count; i++) {
                                    data[`g_images-${i}`] = true;
                                }

                                changeData(data);
                                store.dispatch(recalculateFields(true));

                                return Promise.resolve();
                            },
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
                },
                {
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
                },
            ],
        } as const;
    }

    /**
     * Enables calling widget info on the class instance itself
     */
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return BasicImage8.getWidgetInfo();
    }

    /** Get image according to current state */
    getImage(): string {
        const images: string[] = [];

        for (let i = 0; i <= this.state.rxData.count; i++) {
            if (this.state.rxData[`src_${i}`]) {
                images.push(this.state.rxData[`src_${i}`]);
            }
        }

        if (
            this.state.rxData.oid !== 'nothing_selected' &&
            this.state.values[`${this.state.rxData.oid}.val`] !== undefined
        ) {
            let val = this.state.values[`${this.state.rxData.oid}.val`];
            if (val === 'true' || val === true) {
                val = 1;
            }

            if (val === 'false' || val === false) {
                val = 0;
            }
            return images[val] || '';
        }

        return images[0] || '';
    }
}
