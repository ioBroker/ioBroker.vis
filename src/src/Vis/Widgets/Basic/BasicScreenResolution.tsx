import React from 'react';

import { I18n } from '@iobroker/adapter-react-v5';

import {
    RxRenderWidgetProps, VisLegacy,
    RxWidgetState, RxWidgetProps, GetRxDataFromWidget,
} from '@/types';
import VisRxWidget from '@/Vis/visRxWidget';

declare global {
    interface Window {
        vis: VisLegacy;
    }
}

interface BasicScreenResolutionState extends RxWidgetState {
    width: number;
    height: number;
    defaultView: string;
    essentialData: string;
}

type RxData = GetRxDataFromWidget<typeof BasicScreenResolution>

export default class BasicScreenResolution extends VisRxWidget<RxData, BasicScreenResolutionState> {
    private essentialData: string;

    constructor(props: RxWidgetProps) {
        // @ts-expect-error refactor types to extend from parent types
        super(props);
        const state = this.state;
        state.width = document.documentElement.clientWidth;
        state.height = document.documentElement.clientHeight;
        this.essentialData = JSON.stringify(this.buildEssentialProjectData());
    }

    buildEssentialProjectData() {
        return Object.keys(this.props.context.views)
            .sort()
            .filter(f => f !== '___settings')
            .map((viewId: string) => ({
                id: viewId,
                sizex: this.props.context.views[viewId].settings.sizex,
                sizey: this.props.context.views[viewId].settings.sizey,
                useAsDefault: this.props.context.views[viewId].settings.useAsDefault,
            }));
    }

    /**
     * Returns the widget info which is rendered in the edit mode
     */
    static getWidgetInfo() {
        return {
            id: 'tplScreenResolution',
            visSet: 'basic',
            visName: 'Screen Resolution',
            visPrev: 'widgets/basic/img/Prev_ScreenResolution.png',
            visAttrs: [],
            // visWidgetLabel: 'value_string',  // Label of widget
            visDefaultStyle: {
                width: 170,
                height: 75,
            },
        };
    }

    async componentDidMount(): Promise<void> {
        await super.componentDidMount();
        window.addEventListener('resize', this.onResize);
        window.addEventListener('hashchange', this.onResize);
        this.onResize();
    }

    async componentWillUnmount(): Promise<void> {
        super.componentWillUnmount();
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('hashchange', this.onResize);
    }

    /**
     * Enables calling widget info on the class instance itself
     */
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return BasicScreenResolution.getWidgetInfo();
    }

    createScreenText() {
        return <span
            style={{
                fontWeight: 'bold',
                cursor: 'pointer',
            }}
            onClick={() => {
                if (!window.vis.instance) {
                    window.vis.generateInstance();
                    if (window.vis.instance) {
                        this.forceUpdate();
                    } else {
                        window.alert('Cannot generate!');
                    }
                }
            }}
        >
            {I18n.t('click to create')}
        </span>;
    }

    onResize = () => {
        let width;
        let height;
        let defaultView;
        if (this.props.editMode) {
            width = this.props.context.views[this.props.context.activeView].settings.sizex || window.document.documentElement.clientWidth;
            height = this.props.context.views[this.props.context.activeView].settings.sizey || window.document.documentElement.clientHeight;
            defaultView = window.vis.findNearestResolution(width, height);
        } else {
            width = document.documentElement.clientWidth;
            height = document.documentElement.clientHeight;
            defaultView = window.vis.findNearestResolution();
        }
        this.setState({
            width,
            height,
            defaultView,
        });
    };

    /**
     * Renders the widget
     *
     * @param props props passed to the parent classes render method
     */
    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | null {
        super.renderWidgetBody(props);
        const state = this.state;

        const essentialData = JSON.stringify(this.buildEssentialProjectData());
        if (essentialData !== this.essentialData) {
            this.essentialData = essentialData;
            setTimeout(() => this.onResize(), 100);
        }

        const style: React.CSSProperties = {
            border: '1px solid #888',
            fontSize: 12,
            opacity: 0.8,
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            justifyContent: 'center',
        };
        const valueStyle: React.CSSProperties = {
            marginLeft: 8,
            fontWeight: 'bold',
        };

        return <div className="vis-widget-body" style={style}>
            <div>
                {I18n.t('Default view')}
                :
                <span style={valueStyle}>{state.defaultView}</span>
            </div>
            <div>
                {I18n.t('Width')}
                :
                <span style={valueStyle}>
                    {state.width}
                    px
                </span>
            </div>
            <div>
                {I18n.t('Height')}
                :
                <span style={valueStyle}>
                    {state.height}
                    px
                </span>
            </div>
            <div>
                {I18n.t('Instance')}
                :
                <span style={valueStyle}>{window.vis.instance || this.createScreenText()}</span>
            </div>
        </div>;
    }
}
