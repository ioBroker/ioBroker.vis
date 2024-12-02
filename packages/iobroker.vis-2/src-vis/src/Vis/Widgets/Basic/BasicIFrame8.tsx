import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo, VisBaseWidgetProps } from '@iobroker/types-vis-2';
import VisRxWidget from '@/Vis/visRxWidget';

type RxData = {
    oid: string;
    refreshInterval: number;
    refreshOnWakeUp: boolean;
    refreshOnViewChange: boolean;
    refreshWithNoQuery: boolean;
    scrollX: boolean;
    scrollY: boolean;
    seamless: boolean;
    count: number;
    [key: `src_${number}`]: string;
    [key: `noSandbox${number}`]: boolean;
};

export default class BasicIFrame8 extends VisRxWidget<RxData> {
    private refreshInterval: ReturnType<typeof setInterval> | null = null;

    private readonly frameRef: React.RefObject<HTMLIFrameElement>;

    private hashInstalled = false;

    private onWakeUpInstalled = false;

    private startedInterval = 0;

    constructor(props: VisBaseWidgetProps) {
        super(props);
        this.frameRef = React.createRef();
    }

    /**
     * Returns the widget info which is rendered in the edit mode
     */
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplStatefulIFrame8',
            visSet: 'basic',
            visName: 'iFrame 8',
            visPrev: 'widgets/basic/img/Prev_StatefulIFrame8.png',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'oid',
                            type: 'id',
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
                            name: 'scrollX',
                            type: 'checkbox',
                        },
                        {
                            name: 'scrollY',
                            type: 'checkbox',
                        },
                        {
                            name: 'seamless',
                            type: 'checkbox',
                            default: true,
                        },
                        {
                            name: 'count',
                            type: 'slider',
                            min: 1,
                            max: 20,
                            default: 2,
                        },
                    ],
                },
                {
                    name: 'frames',
                    label: 'frames',
                    indexFrom: 0,
                    indexTo: 'count',
                    fields: [
                        {
                            name: 'src_',
                            type: 'id',
                        },
                        {
                            name: 'noSandbox',
                            type: 'checkbox',
                        },
                    ],
                },
            ],
            // visWidgetLabel: 'value_string',  // Label of widget
            visDefaultStyle: {
                width: 600,
                height: 320,
            },
        } as const;
    }

    componentDidMount(): void {
        super.componentDidMount();
        this.onPropertyUpdate();
    }

    componentWillUnmount(): void {
        super.componentWillUnmount();
        this.refreshInterval && clearInterval(this.refreshInterval);
        if (this.hashInstalled) {
            this.hashInstalled = false;
            window.removeEventListener('hashchange', this.onHashChange);
        }
    }

    /**
     * Enables calling widget info on the class instance itself
     */
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return BasicIFrame8.getWidgetInfo();
    }

    getSrc(): string {
        const value = this.state.values[`${this.state.rxData.oid}.val`];
        if (value === undefined || value === null) {
            return this.state.rxData.src_1;
        }
        return this.state.rxData[`src_${value}`] || '';
    }

    getNoSandBox(): boolean {
        const value = this.state.values[`${this.state.rxData.oid}.val`];
        if (value === undefined || value === null) {
            return this.state.rxData.noSandbox1;
        }

        return (
            this.state.rxData[`noSandbox${value}`] === true ||
            // @ts-expect-error back compatibility
            this.state.rxData[`noSandbox${value}`] === 'true'
        );
    }

    onHashChange = (): void => {
        if (this.props.context.activeView === this.props.view) {
            this.refreshIFrame();
        }
    };

    refreshIFrame(): void {
        if (this.state.rxData.refreshWithNoQuery === true) {
            this.frameRef.current?.contentWindow?.location.reload();
        } else if (this.frameRef.current) {
            const src = this.getSrc();
            this.frameRef.current.src = `${src}${src.includes('?') ? '&' : '?'}_refts=${Date.now()}`;
        }
    }

    static isHidden(el: HTMLElement): boolean {
        return el.offsetParent === null;
    }

    static getParents(el: HTMLIFrameElement): HTMLElement[] {
        const els = [];
        let pel = el as HTMLElement;
        do {
            pel = pel.parentNode as HTMLElement;
            els.unshift(el);
        } while (pel);

        return els;
    }

    onPropertyUpdate(): void {
        const src = this.getSrc();
        const refreshInterval = Number(this.state.rxData.refreshInterval) || 0;
        const refreshOnViewChange = this.state.rxData.refreshOnViewChange === true;
        const refreshOnWakeUp = this.state.rxData.refreshOnWakeUp === true;

        if (src) {
            if (refreshOnViewChange) {
                // install on view changed handler
                if (!this.hashInstalled) {
                    this.hashInstalled = true;
                    window.addEventListener('hashchange', this.onHashChange);
                }
            } else if (this.hashInstalled) {
                this.hashInstalled = false;
                window.removeEventListener('hashchange', this.onHashChange);
            }

            if (refreshInterval > 0) {
                if (this.startedInterval !== refreshInterval) {
                    this.startedInterval = refreshInterval;
                    this.refreshInterval && clearInterval(this.refreshInterval);
                    this.refreshInterval = null;
                }
                // install refresh handler
                this.refreshInterval =
                    this.refreshInterval ||
                    setInterval(() => {
                        if (this.frameRef.current && !BasicIFrame8.isHidden(this.frameRef.current as HTMLElement)) {
                            const parents = BasicIFrame8.getParents(this.frameRef.current).filter(el =>
                                BasicIFrame8.isHidden(el),
                            );
                            if (
                                !parents.length ||
                                parents[0].tagName === 'BODY' ||
                                parents[0].id === 'materialdesign-vuetify-container'
                            ) {
                                this.refreshIFrame();
                            }
                        }
                    }, refreshInterval);
            } else if (this.refreshInterval) {
                this.startedInterval = 0;
                clearInterval(this.refreshInterval);
                this.refreshInterval = null;
            }

            if (refreshOnWakeUp) {
                // install on wake-up handler
                if (!this.onWakeUpInstalled) {
                    this.onWakeUpInstalled = true;
                    window.vis.onWakeUp(this.onHashChange, this.props.id);
                }
            } else if (this.onWakeUpInstalled) {
                this.onWakeUpInstalled = false;
                window.vis.onWakeUp(null, this.props.id);
            }
        }
    }

    onRxDataChanged(): void {
        this.onPropertyUpdate();
    }

    /**
     * Renders the widget
     *
     * @param props props passed to the parent classes render method
     */
    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | null {
        super.renderWidgetBody(props);

        if (this.props.editMode) {
            props.overlayClassNames.push('vis-editmode-helper');
        }

        const style: React.CSSProperties = {
            position: 'absolute',
            boxSizing: 'border-box',
            padding: 0,
            margin: 0,
            border: 0,
            width: '100%',
            height: '100%',
            overflowX: this.state.rxData.scrollX ? 'scroll' : 'hidden',
            overflowY: this.state.rxData.scrollY ? 'scroll' : 'hidden',
        };
        const src = this.getSrc();
        const noSandbox = this.getNoSandBox();

        return src ? (
            <div className="vis-widget-body">
                <iframe
                    style={style}
                    ref={this.frameRef}
                    title={this.props.id}
                    src={src}
                    sandbox={
                        noSandbox
                            ? 'allow-modals allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts'
                            : undefined
                    }
                    seamless={this.state.rxData.seamless}
                />
            </div>
        ) : null;
    }
}
