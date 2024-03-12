import React from 'react';

import { GetRxDataFromWidget, RxRenderWidgetProps } from '@/types';
import VisRxWidget from '@/Vis/visRxWidget';

// eslint-disable-next-line no-use-before-define
type RxData = GetRxDataFromWidget<typeof BasicIFrame>

export default class BasicIFrame extends VisRxWidget<RxData> {
    private refreshInterval: ReturnType<typeof setInterval> | null = null;

    private readonly frameRef: React.RefObject<HTMLIFrameElement>;

    private hashInstalled = false;

    private onWakeUpInstalled = false;

    private startedInterval = 0;

    constructor(props: RxRenderWidgetProps) {
        // @ts-expect-error refactor types to extend from parent types
        super(props);
        this.frameRef = React.createRef();
    }

    /**
     * Returns the widget info which is rendered in the edit mode
     */
    static getWidgetInfo() {
        return {
            id: 'tplIFrame',
            visSet: 'basic',
            visName: 'iFrame',
            visPrev: 'widgets/basic/img/Prev_iFrame.png',
            visAttrs: [{
                name: 'common',
                fields: [
                    {
                        name: 'src',
                        type: 'url',
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
                        name: 'noSandbox',
                        type: 'checkbox',
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
                ],
            }],
            // visWidgetLabel: 'value_string',  // Label of widget
            visDefaultStyle: {
                width: 600,
                height: 320,
            },
        } as const;
    }

    async componentDidMount(): Promise<void> {
        super.componentDidMount();
        this.onPropertyUpdate();
    }

    async componentWillUnmount(): Promise<void> {
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
    getWidgetInfo() {
        return BasicIFrame.getWidgetInfo();
    }

    onHashChange = () => {
        if (this.props.context.activeView === this.props.view) {
            this.refreshIFrame();
        }
    };

    refreshIFrame() {
        if (this.state.rxData.refreshWithNoQuery === true) {
            this.frameRef.current?.contentWindow?.location.reload();
        } else if (this.frameRef.current) {
            this.frameRef.current.src = `${this.state.rxData.src}${this.state.rxData.src.includes('?') ? '&' : '?'}_refts=${Date.now()}`;
        }
    }

    static isHidden(el: HTMLElement) {
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

    onPropertyUpdate() {
        const src     = this.state.rxData.src || '';
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
                this.refreshInterval = this.refreshInterval || setInterval(() => {
                    if (this.frameRef.current && !BasicIFrame.isHidden(this.frameRef.current as HTMLElement)) {
                        const parents = BasicIFrame.getParents(this.frameRef.current).filter(el => BasicIFrame.isHidden(el));
                        if (!parents.length || parents[0].tagName === 'BODY' || parents[0].id === 'materialdesign-vuetify-container') {
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

    onRxDataChanged() {
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
        const src = this.state.rxData.src || '';

        return src ? <div className="vis-widget-body">
            <iframe
                style={style}
                ref={this.frameRef}
                title={this.props.id}
                src={this.state.rxData.src}
                sandbox={this.state.rxData.noSandbox ? 'allow-modals allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts' : undefined}
                seamless={this.state.rxData.seamless}
            />
        </div> : null;
    }
}
