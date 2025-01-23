import React from 'react';

import { Icon } from '@iobroker/adapter-react-v5';
import type { RxRenderWidgetProps, VisBaseWidgetProps, WidgetData } from '@iobroker/types-vis-2';
import VisRxWidget from '@/Vis/visRxWidget';

export interface RxDataBasicImageGeneric extends WidgetData {
    stretch: boolean;
    refreshInterval: number;
    refreshOnWakeUp: boolean;
    refreshOnViewChange: boolean;
    refreshWithNoQuery: boolean;
    allowUserInteractions: boolean;
}

export default abstract class BasicImageGeneric<T extends RxDataBasicImageGeneric> extends VisRxWidget<T> {
    private refreshInterval: ReturnType<typeof setInterval> | null = null;

    private readonly imageRef: React.RefObject<HTMLImageElement>;

    private hashInstalled = false;

    private onWakeUpInstalled = false;

    private startedInterval = 0;

    constructor(props: VisBaseWidgetProps) {
        super(props);
        this.imageRef = React.createRef<HTMLImageElement>();
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

    onHashChange = (): void => {
        if (this.props.context.activeView === this.props.view) {
            this.refreshImage();
        }
    };

    abstract getImage(): string;

    refreshImage(): void {
        if (this.imageRef.current) {
            const str = this.getImage();
            if (this.state.rxData.refreshWithNoQuery === true) {
                this.imageRef.current.src = str;
            } else {
                this.imageRef.current.src = `${str}${str.includes('?') ? '&' : '?'}_refts=${Date.now()}`;
            }
        }
    }

    static isHidden(el: HTMLElement): boolean {
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

    onPropertyUpdate(): void {
        const src = this.getImage();
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
                        if (
                            this.imageRef.current &&
                            !BasicImageGeneric.isHidden(this.imageRef.current as HTMLElement)
                        ) {
                            const parents = BasicImageGeneric.getParents(this.imageRef.current).filter(el =>
                                BasicImageGeneric.isHidden(el),
                            );
                            if (
                                !parents.length ||
                                parents[0].tagName === 'BODY' ||
                                parents[0].id === 'materialdesign-vuetify-container'
                            ) {
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
        } else if (!this.state.rxData.allowUserInteractions) {
            props.style.pointerEvents = 'none';
            props.style.userSelect = 'none';
            props.style.touchAction = 'none';
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
            style.pointerEvents = 'none';
        }

        const src = this.getImage();

        return src ? (
            <div
                className="vis-widget-body"
                style={{
                    overflow: 'hidden',
                    pointerEvents: this.state.rxData.allowUserInteractions ? undefined : 'none',
                    touchAction: this.state.rxData.allowUserInteractions ? undefined : 'none',
                    userSelect: this.state.rxData.allowUserInteractions ? undefined : 'none',
                }}
            >
                <Icon
                    style={style}
                    ref={this.imageRef}
                    src={src}
                    alt={this.props.id}
                />
            </div>
        ) : null;
    }
}
