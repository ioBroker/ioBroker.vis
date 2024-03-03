import React from 'react';

import { GetRxDataFromWidget, RxRenderWidgetProps } from '@/types';
import VisRxWidget from '@/Vis/visRxWidget';

// eslint-disable-next-line no-use-before-define
type RxData = GetRxDataFromWidget<typeof BasicSvgShape>;

export default class BasicSvgShape extends VisRxWidget<RxData> {
    /**
     * Returns the widget info which is rendered in the edit mode
     */
    static getWidgetInfo() {
        return {
            id: 'tplShapes',
            visSet: 'basic',
            visName: 'SVG shape',
            visPrev: 'widgets/basic/img/Prev_SvgShape.png',
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'svgType',
                        type: 'select',
                        options: [
                            { value: 'line', label: 'basic_line' },
                            { value: 'triangle', label: 'basic_triangle' },
                            { value: 'square', label: 'basic_square' },
                            { value: 'pentagone', label: 'basic_pentagone' },
                            { value: 'hexagone', label: 'basic_hexagone' },
                            { value: 'octagone', label: 'basic_octagone' },
                            { value: 'circle', label: 'basic_circle' },
                            { value: 'star', label: 'basic_star' },
                            { value: 'arrow', label: 'basic_arrow' },
                            { value: 'custom', label: 'basic_custom' },
                        ],
                        default: 'circle',
                    },
                    {
                        name: 'points',
                        type: 'slider',
                        min: 3,
                        max: 20,
                        default: 3,
                        hidden: 'data.svgType !== "custom"',
                    },
                    {
                        name: 'strokeColor',
                        type: 'color',
                        default: '#009cb3',
                    },
                    {
                        name: 'fill',
                        type: 'color',
                        default: '#00b3ac',
                    },
                    {
                        name: 'strokeWidth',
                        type: 'slider',
                        min: 0,
                        max: 100,
                        default: 5,
                    },
                    {
                        name: 'rotate',
                        type: 'slider',
                        min: 0,
                        max: 360,
                        default: 0,
                    },
                    {
                        name: 'scaleWidth',
                        type: 'slider',
                        min: 0,
                        max: 1,
                        step: 0.05,
                        default: 1,
                    },
                    {
                        name: 'scaleHeight',
                        type: 'slider',
                        min: 0,
                        max: 1,
                        step: 0.05,
                        default: 1,
                    },
                ],
            }],
            visDefaultStyle: {
                width: 100,
                height: 100,
            },
        } as const;
    }

    /**
     * Enables calling widget info on the class instance itself
     */
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return BasicSvgShape.getWidgetInfo();
    }

    static circlePoints(radius: number, num: number, step?: number): string {
        step = step || (360 / num);
        const points = [];
        let text = '';
        const radian = Math.PI / 180;
        for (let i = 0; i < num; i++) {
            const angle = radian * (i * step - 180);
            //         var point = {x:Math.sin(Math.PI / 180 * (i * step - 180)) * radius, y:Math.cos(Math.PI / 180 * (i * step - 180)) * radius};
            const point = {
                x: Math.sin(angle) * radius,
                y: Math.cos(angle) * radius,
            };
            points.push(point);
            text += `${point.x}, ${point.y} `;
        }

        return text;
    }

    /**
     * Renders the widget
     *
     * @param props props passed to the parent classes render method
     */
    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | null {
        super.renderWidgetBody(props);

        let svg: React.JSX.Element | null = null;
        const rotate      = Number(this.state.rxData.rotate) || 0;
        const scaleWidth  = Number(this.state.rxData.scaleWidth) || 1;
        const scaleHeight = Number(this.state.rxData.scaleHeight) || 1;
        const strokeWidth = Number(this.state.rxData.strokeWidth) || 0;

        const transform = `rotate(${rotate}) scale(${scaleWidth}, ${scaleHeight})`;

        if (this.state.rxData.svgType === 'triangle') {
            svg = <polygon
                transform={transform}
                points={BasicSvgShape.circlePoints(50 - strokeWidth, 3)}
            />;
        } else if (this.state.rxData.svgType === 'line') {
            svg = <line
                vectorEffect="non-scaling-stroke"
                transform={`rotate(${rotate})`}
                x1="-50"
                y1="0"
                x2="50"
                y2="0"
            />;
        } else if (this.state.rxData.svgType === 'circle') {
            svg = <circle
                transform={transform}
                cx="0"
                cy="0"
                r={50 - strokeWidth / 2}
            />;
        } else if (this.state.rxData.svgType === 'pentagone') {
            svg = <polygon
                transform={transform}
                points={BasicSvgShape.circlePoints(50 - strokeWidth, 5)}
            />;
        } else if (this.state.rxData.svgType === 'square') {
            svg = <polygon
                transform={transform}
                points={BasicSvgShape.circlePoints(50 - strokeWidth, 4)}
            />;
        } else if (this.state.rxData.svgType === 'hexagone') {
            svg = <polygon
                transform={transform}
                points={BasicSvgShape.circlePoints(50 - strokeWidth, 6)}
            />;
        } else if (this.state.rxData.svgType === 'octagone') {
            svg = <polygon
                transform={transform}
                points={BasicSvgShape.circlePoints(50 - strokeWidth, 8)}
            />;
        }  else if (this.state.rxData.svgType === 'custom') {
            svg = <polygon
                transform={transform}
                points={BasicSvgShape.circlePoints(50 - strokeWidth, Number(this.state.rxData.points) || 3)}
            />;
        } else if (this.state.rxData.svgType === 'star') {
            svg = <polygon
                transform={transform}
                points={BasicSvgShape.circlePoints(50 - strokeWidth, 5, 144)}
            />;
        } else if (this.state.rxData.svgType === 'arrow') {
            svg = <polygon
                transform={`${transform} translate(0,10)`}
                points="0, -50 -43.3, 25 0,0 43.3, 25"
            />;
        }

        return <div className="vis-widget-body">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                viewBox="-50 -50 100 100"
                style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    fill: this.state.rxData.fill,
                    stroke: this.state.rxData.strokeColor,
                    strokeWidth: this.state.rxData.strokeWidth,
                }}
            >
                {svg}
            </svg>
        </div>;
    }
}
