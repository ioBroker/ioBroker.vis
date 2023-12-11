import React from 'react';
// eslint-disable-next-line import/no-cycle
import VisRxWidget from '@/Vis/visRxWidget';
import { GetRxDataFromWidget, RxRenderWidgetProps } from '@/types';
import { NOTHING_SELECTED } from '@/Utils/utils';

type RxData = GetRxDataFromWidget<typeof BasicBulb>

export default class BasicBulb extends VisRxWidget<RxData> {
    /**
     * Enables calling widget info on the class instance itself
     */
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return BasicBulb.getWidgetInfo();
    }

    /**
     * Returns the widget info which is rendered in the edit mode
     */
    static getWidgetInfo() {
        return {
            id: 'tplBulbOnOffCtrl',
            visSet: 'basic',
            visName: 'Bulb on/off',
            visPrev: 'widgets/basic/img/Prev_BulbOnOffCtrl.png',
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'oid',
                        type: 'id',
                    },
                    {
                        name: 'min',
                    },
                    {
                        name: 'max',
                    },
                    {
                        name: 'icon_off',
                        type: 'image',
                        default: 'img/bulb_off.png',
                    },
                    {
                        name: 'icon_on',
                        type: 'image',
                        default: 'img/bulb_on.png',
                    },
                    {
                        name: 'readOnly',
                        type: 'checkbox',
                    },
                ],
            },
            {
                name: 'ccontrol',
                fields: [
                    {
                        name: 'urlTrue',
                    },
                    {
                        name: 'urlFalse',
                    },
                    {
                        name: 'oidTrue',
                        type: 'id',
                    },
                    {
                        name: 'oidFalse',
                        type: 'id',
                    },
                    {
                        name: 'oidTrueValue',
                    },
                    {
                        name: 'oidFalseValue',
                    },
                ],
            }],
        } as const;
    }

    /**
     * Handle a click event
     */
    toggle(): void {
        if (this.state.rxData.oid === NOTHING_SELECTED || this.state.rxData.readOnly) {
            return;
        }

        let val = this.state.values[`${this.state.rxData.oid}.val`];

        const {
            oidTrue, urlTrue, oid, min, max, oidTrueValue, oidFalseValue,
        } = this.state.rxData;
        let {
            urlFalse, oidFalse,
        } = this.state.rxData;

        let finalMin: string | boolean = min ?? '';
        let finalMax: string | boolean = max ?? '';
        let oidTrueValueFinal: string | boolean | number = oidTrueValue ?? '';
        let oidFalseValueFinal: string | boolean | number = oidFalseValue ?? '';

        if (oidTrue || urlTrue) {
            if (!oidFalse && oidTrue) oidFalse = oidTrue;
            if (!urlFalse && urlTrue) urlFalse = urlTrue;

            if (finalMax !== '') {
                if (finalMax === 'true')  finalMax = true;
                if (finalMax === 'false') finalMax = false;
                if (val === 'true')  val = true;
                if (val === 'false') val = false;
                val = (val === finalMax);
            } else {
                val = (val === 1 || val === '1' || val === true || val === 'true');
            }
            val = !val; // invert

            if (finalMin === '' || finalMin === 'false' || finalMin === null) finalMin = false;
            if (finalMax === '' || finalMax === 'true'  || finalMax === null) finalMax = true;

            if (oidTrue) {
                if (val) {
                    if (oidTrueValueFinal === '') oidTrueValueFinal = finalMax;
                    if (oidTrueValueFinal === 'false') oidTrueValueFinal = false;
                    if (oidTrueValueFinal === 'true')  oidTrueValueFinal = true;
                    if (typeof oidTrueValueFinal === 'string') {
                        const f = parseFloat(oidTrueValueFinal);
                        if (f.toString() === oidTrueValueFinal) oidTrueValueFinal = f;
                    }
                    this.props.context.setValue(oidTrue, oidTrueValueFinal);
                } else {
                    if (oidFalseValueFinal === '') oidFalseValueFinal = finalMin;
                    if (oidFalseValueFinal === 'false') oidFalseValueFinal = false;
                    if (oidFalseValueFinal === 'true')  oidFalseValueFinal = true;
                    if (typeof oidFalseValueFinal === 'string') {
                        const f = parseFloat(oidFalseValueFinal);
                        if (f.toString() === oidFalseValueFinal) oidFalseValueFinal = f;
                    }
                    this.props.context.setValue(oidFalse, oidFalseValueFinal);
                }
            }

            if (urlTrue) {
                if (val) {
                    this.props.socket.getRawSocket().emit('httpGet', urlTrue);
                } else {
                    this.props.socket.getRawSocket().emit('httpGet', urlFalse);
                }
            }
        } else if ((finalMin === '' && (val === null || val === '' || val === undefined || val === false || val === 'false')) ||
                        (finalMin !== '' && finalMin === val)) {
            this.props.context.setValue(oid, finalMax !== '' ? finalMax : true);
        } else
            if ((finalMax === '' && (val === true || val === 'true')) ||
                        (finalMax !== '' && val === finalMax)) {
                this.props.context.setValue(oid,  finalMin !== '' ? finalMin : false);
            } else {
                val = parseFloat(val);
                if (finalMin !== '' && finalMax !== '') {
                    if (val >= (parseFloat(finalMax) - parseFloat(finalMin)) / 2) {
                        val = finalMin;
                    } else {
                        val = finalMax;
                    }
                } else if (val >= 0.5) {
                    val = 0;
                } else {
                    val = 1;
                }

                this.props.context.setValue(oid,  val);
            }
    }

    /**
     * Determine if the value is true or false
     *
     * @param val the value to calc result for
     * @param min min value
     * @param max max value
     */
    // eslint-disable-next-line class-methods-use-this
    isFalse(val: any, min?: any, max?: any): boolean {
        if (min !== undefined && min !== null && min !== '') {
            if (val === 'true') {
                val = true;
            }
            if (val === 'false') {
                val = false;
            }

            if (max !== undefined && max !== null && max !== '') {
                if (max === 'false') {
                    max = false;
                }
                if (max === 'true') {
                    max = true;
                }
                return val !== max;
            }
            if (min === 'false') {
                min = false;
            }
            if (min === 'true') {
                min = true;
            }
            return val === min;
        }

        if (val === undefined || val === null || val === false || val === 'false' || val === 'FALSE' || val === 'False' || val === 'OFF' || val === 'Off' || val === 'off' || val === '') return true;
        if (val === '0' || val === 0) return true;
        const f = parseFloat(val);
        if (f.toString() !== 'NaN') return !f;
        return false;
    }

    /**
     * Renders the widget
     *
     * @param props props passed to the parent classes render method
     */
    renderWidgetBody(props: RxRenderWidgetProps) {
        super.renderWidgetBody(props);

        const val = this.state.values[`${this.state.rxData.oid}.val`];
        const isOff = this.isFalse(val, this.state.rxData.min, this.state.rxData.max);

        let src;

        if (isOff) {
            src = this.state.rxData.icon_off || 'img/bulb_off.png';
        } else {
            src = this.state.rxData.icon_on || 'img/bulb_on.png';
        }

        return <div className="vis-widget-body">
            <img src={src} alt="tplBulbOnOffCtrl" width="100%" onClick={() => this.toggle()} />
        </div>;
    }
}
