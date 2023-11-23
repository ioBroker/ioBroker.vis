import React from 'react';

// eslint-disable-next-line import/no-cycle
import VisRxWidget from '../../visRxWidget';

interface RxRenderWidgetProps {
    className: string;
    style: React.CSSProperties;
    id: string;
    refService: React.RefObject<HTMLDivElement>;
    widget: object;
}

export default class BasicBar extends VisRxWidget {
    /**
     * Returns the widget info which is rendered in the edit mode
     */
    static getWidgetInfo() {
        return {
            id: 'tplValueFloatBar',
            visSet: 'basic',
            visName: 'Bar',
            visPrev: 'widgets/basic/img/Prev_ValueFloatBar.png',
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
                        default: 0,
                    },
                    {
                        name: 'max',
                        type: 'number',
                        default: 100,
                    },
                    {
                        name: 'orientation',
                        type: 'select',
                        default: 'horizontal',
                        options: [
                            { value: 'horizontal', label: 'horizontal' },
                            { value: 'vertical', label: 'vertical' },
                        ],
                    },
                    {
                        name: 'color',
                        type: 'color',
                        default: 'blue',
                    },
                    {
                        name: 'border',
                        type: 'text',
                    },
                    {
                        name: 'shadow',
                        type: 'text',
                    },
                    {
                        name: 'reverse',
                        type: 'checkbox',
                    },
                ],
            }],
            // visWidgetLabel: 'value_string',  // Label of widget
            visDefaultStyle: {
                width: 200,
                height: 130,
            },
        };
    }

    /**
     * Enables calling widget info on the class instance itself
     */
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return BasicBar.getWidgetInfo();
    }

    /**
     * Calculate width or height of the bar w.r.t. to the border
     *
     * @param css the border css attribute
     * @param multiplier number of borders, normally 2
     */
    // eslint-disable-next-line class-methods-use-this
    extractWidth(css: string, multiplier: number): number | string | undefined {
        // extract from "2px solid #aabbcc" => 2px
        const m = css.match(/([0-9]+)(px|em)?/);
        if (m) {
            if (m[1] && m[2]) {
                return parseInt(m[1], 10) * (multiplier || 1) + m[2];
            }
            return parseInt(m[1], 10) * (multiplier || 1);
        }

        return undefined;
    }

    /**
     * Calculate length of the bar
     */
    getCalc(): string {
        const min = (this.state.rxData.min || this.state.rxData.min === 0) ? parseFloat(this.state.rxData.min) : 0;
        const max = (this.state.rxData.max || this.state.rxData.max === 0) ? parseFloat(this.state.rxData.max) : 100;
        let val = parseFloat(this.state.values[`${this.state.rxData.oid}.val`]) || 0;
        val = (val - min) / (max - min);
        return (this.state.rxData.border) ? (`calc(${Math.round(val * 100)}% - ${this.extractWidth(this.state.rxData.border, 2)})`) : (`${Math.round(val * 100)}%`);
    }

    /**
     * Renders the widget
     *
     * @param props props passed to the parent classes render method
     */
    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);

        let style: React.CSSProperties;

        if (this.state.rxData.orientation === 'vertical') {
            style = { height: this.getCalc() };
            if (this.state.rxData.reverse) {
                style = {
                    ...style, left: 0, position: 'absolute', bottom: '0',
                };
            }

            if (this.state.rxData.border) {
                style = { ...style, border: this.state.rxData.border, width: `calc(100% - ${this.extractWidth(this.state.rxData.border, 2)}` };
            }
        } else {
            style = { width: this.getCalc() };
            if (this.state.rxData.reverse) {
                style = {
                    ...style, float: 'right',
                };
            }

            if (this.state.rxData.border) {
                style = { ...style, border: this.state.rxData.border, height: `calc(100% - ${this.extractWidth(this.state.rxData.border, 2)}` };
            }
        }

        if (this.state.rxData.shadow) {
            style = { ...style, boxShadow: this.state.rxData.shadow };
        }

        if (this.state.rxData.color) {
            style = { ...style, backgroundColor: this.state.rxData.color };
        }

        return <div className="vis-widget-body">
            <div data-oid={this.state.rxData.oid} className="vis-widget-body" style={style}>
            </div>
        </div>;
    }
}
