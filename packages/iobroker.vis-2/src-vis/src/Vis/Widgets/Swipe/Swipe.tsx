/**
 *  ioBroker.vis-2
 *  https://github.com/ioBroker/ioBroker.vis-2
 *
 *  Copyright (c) 2024-2025 Denis Haev https://github.com/GermanBluefox,
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */

import React from 'react';

import { I18n } from '@iobroker/adapter-react-v5';
import type { RxRenderWidgetProps, RxWidgetInfo, WidgetData } from '@iobroker/types-vis-2';
import VisRxWidget from '../../visRxWidget';
import InstallSwipe from './InstallSwipe';

interface RxData extends WidgetData {
    left_nav_view: string;
    right_nav_view: string;
    hideIndication: boolean;
    threshold: number;
}

class Swipe extends VisRxWidget<RxData> {
    private swipeable: InstallSwipe | null = null;

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplSwipe',
            visSet: 'swipe',
            visName: 'Swipe Navigation',
            visSetLabel: 'vis_2_widgets_widgets_swipe_label', // label of the widget set
            visPrev: 'widgets/swipe/img/Prev_Swipe.png',
            visWidgetLabel: 'vis_2_widgets_widgets_swipe_label', // Label of widget
            visSetIcon: 'widgets/swipe/img/Prev_Swipe.png', // Icon of a widget set
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'left_nav_view',
                            type: 'select-views',
                            multiple: false,
                        },
                        {
                            name: 'right_nav_view',
                            type: 'select-views',
                            multiple: false,
                        },
                        {
                            name: 'hideIndication',
                            label: 'vis_2_widgets_swipe_hide_indication_label', // 'Hide indication',
                            type: 'checkbox',
                        },
                        {
                            name: 'threshold',
                            label: 'vis_2_widgets_swipe_threshold_label', // 'Hide indication',
                            type: 'number',
                            default: 30,
                        },
                    ],
                },
            ],
            visDefaultStyle: {
                width: 160,
                height: 82,
            },
        } as const;
    }

    componentDidMount(): void {
        super.componentDidMount();

        this.swipeable =
            this.swipeable ||
            new InstallSwipe({
                onSwipeLeft: () => {
                    if (this.state.rxData.left_nav_view) {
                        this.props.context.changeView(this.state.rxData.left_nav_view);
                    }
                },
                onSwipeRight: () => {
                    if (this.state.rxData.right_nav_view) {
                        this.props.context.changeView(this.state.rxData.right_nav_view);
                    }
                },
            });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return Swipe.getWidgetInfo();
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);

        if (this.props.editMode) {
            this.swipeable?.destroy();

            return (
                <div className="vis-widget-body">
                    <div style={{ fontWeight: 'bold' }}>{I18n.t('Swipe Navigation')}</div>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{ width: 40 }}>{I18n.t('left')}</td>
                                <td style={{ width: 20 }}>&gt;</td>
                                <td>{this.state.rxData.left_nav_view}</td>
                            </tr>
                            <tr>
                                <td style={{ width: 40 }}>{I18n.t('right')}</td>
                                <td style={{ width: 20 }}>&lt;</td>
                                <td>{this.state.rxData.right_nav_view}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        }

        const viewEl = this.props.refParent?.current;
        if (this.swipeable && viewEl) {
            this.swipeable.install(viewEl, {
                hideIndication: this.state.rxData.hideIndication,
                indicationRight: this.state.rxData.right_nav_view
                    ? this.props.context.views[this.state.rxData.right_nav_view]?.name ||
                      this.state.rxData.right_nav_view
                    : '',
                indicationLeft: this.state.rxData.left_nav_view
                    ? this.props.context.views[this.state.rxData.left_nav_view]?.name || this.state.rxData.left_nav_view
                    : '',
                swipeThreshold: this.state.rxData.threshold || 30,
            });
        }

        return null;
    }
}

export default Swipe;
