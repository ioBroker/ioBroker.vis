import React from 'react';
// eslint-disable-next-line import/no-cycle
import VisRxWidget from '@/Vis/visRxWidget';
import { RxRenderWidgetProps } from '@/types';
import { NOTHING_SELECTED } from '@/Vis/utils';

export default class BasicBulb extends VisRxWidget {
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
                        type: 'number',
                    },
                    {
                        name: 'max',
                        type: 'number',
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
        };
    }

    /**
     * Handle a click event
     */
    toggle(): void {
        if (this.state.rxData.oid === NOTHING_SELECTED || this.state.rxData.readOnly) {
            return;
        }

        let val = this.state.values[`${this.state.rxData.oid}.val`];

        const { oidTrue, urlTrue, oid } = this.state.rxData;
        let {
            min, urlFalse, oidFalse, max, oidTrueVal, oidFalseVal,
        } = this.state.rxData;

        if (oidTrue || urlTrue) {
            if (!oidFalse && oidTrue) oidFalse = oidTrue;
            if (!urlFalse && urlTrue) urlFalse = urlTrue;

            if (max !== undefined) {
                if (max === 'true')  max = true;
                if (max === 'false') max = false;
                if (val === 'true')  val = true;
                if (val === 'false') val = false;
                val = (val === max);
            } else {
                val = (val === 1 || val === '1' || val === true || val === 'true');
            }
            val = !val; // invert

            if (min === undefined || min === 'false' || min === null) min = false;
            if (max === undefined || max === 'true'  || max === null) max = true;

            if (oidTrue) {
                if (val) {
                    if (oidTrueVal === undefined || oidTrueVal === null) oidTrueVal = max;
                    if (oidTrueVal === 'false') oidTrueVal = false;
                    if (oidTrueVal === 'true')  oidTrueVal = true;
                    const f = parseFloat(oidTrueVal);
                    if (f.toString() === oidTrueVal) oidTrueVal = f;
                    this.props.context.setValue(oidTrue, oidTrueVal);
                } else {
                    if (oidFalseVal === undefined || oidFalseVal === null) oidFalseVal = min;
                    if (oidFalseVal === 'false') oidFalseVal = false;
                    if (oidFalseVal === 'true')  oidFalseVal = true;
                    const f = parseFloat(oidFalseVal);
                    if (f.toString() === oidFalseVal) oidFalseVal = f;
                    this.props.context.setValue(oidFalse, oidFalseVal);
                }
            }

            if (urlTrue) {
                if (val) {
                    this.props.socket.getRawSocket().emit('httpGet', urlTrue);
                } else {
                    this.props.socket.getRawSocket().emit('httpGet', urlFalse);
                }
            }
        } else if ((min === undefined && (val === null || val === '' || val === undefined || val === false || val === 'false')) ||
                        (min !== undefined && min === val)) {
            this.props.context.setValue(oid, max !== undefined ? max : true);
        } else
            if ((max === undefined && (val === true || val === 'true')) ||
                        (max !== undefined && val === max)) {
                this.props.context.setValue(oid,  min !== undefined ? min : false);
            } else {
                val = parseFloat(val);
                if (min !== undefined && max !== undefined) {
                    if (val >= (max - min) / 2) {
                        val = min;
                    } else {
                        val = max;
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
