import React from 'react';

import { GetRxDataFromWidget, RxRenderWidgetProps } from '@/types';
import VisRxWidget from '@/Vis/visRxWidget';

type RxData = GetRxDataFromWidget<typeof BasicImage>

export default class BasicImage extends VisRxWidget<RxData> {
    private refreshInterval: ReturnType<typeof setInterval> | null = null;

    private readonly imageRef: React.RefObject<HTMLImageElement>;

    private hashInstalled = false;

    private onWakeUpInstalled = false;

    private startedInterval = 0;

    constructor(props: RxRenderWidgetProps) {
        // @ts-expect-error refactor types to extend from parent types
        super(props);
        this.imageRef = React.createRef();
    }

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
        return BasicImage.getWidgetInfo();
    }

    onHashChange = () => {
        if (this.props.context.activeView === this.props.view) {
            this.refreshImage();
        }
    };

    refreshImage() {
        if (this.imageRef.current) {
            if (this.state.rxData.refreshWithNoQuery === true) {
                this.imageRef.current.src = this.state.rxData.src;
            } else {
                this.imageRef.current.src = `${this.state.rxData.src}${this.state.rxData.src.includes('?') ? '&' : '?'}_refts=${Date.now()}`;
            }
        }
    }

    static isHidden(el: HTMLElement) {
        return el.offsetParent === null;
    }

    static getParents(el: HTMLImageElement): HTMLElement[] {
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
        const refreshInterval = parseFloat(this.state.rxData.refreshInterval) || 0;
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
                    if (this.imageRef.current && !BasicImage.isHidden(this.imageRef.current as HTMLElement)) {
                        const parents = BasicImage.getParents(this.imageRef.current).filter(el => BasicImage.isHidden(el));
                        if (!parents.length || parents[0].tagName === 'BODY' || parents[0].id === 'materialdesign-vuetify-container') {
                            this.refreshImage();
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
                window.vis.onWakeUp(this.props.id);
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
            padding: 0,
            margin: 0,
            border: 0,
            width: '100%',
            height: 'auto',
        };
        if (this.state.rxData.stretch) {
            style.height = '100%';
        }
        if (!this.state.rxData.allowUserInteractions) {
            style.touchAction = 'none';
            style.userSelect = 'none';
        }

        const src = this.state.rxData.src || '';

        return src ? <div className="vis-widget-body" style={{ overflow: 'hidden' }}>
            <img
                style={style}
                ref={this.imageRef}
                src={this.state.rxData.src}
                alt={this.props.id}
            />
        </div> : null;
    }
}
