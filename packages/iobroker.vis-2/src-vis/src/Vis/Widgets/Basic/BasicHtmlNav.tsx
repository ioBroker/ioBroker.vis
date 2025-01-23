/**
 *  ioBroker.vis-2
 *  https://github.com/ioBroker/ioBroker.vis-2
 *
 *  Copyright (c) 2023-2025 Denis Haev https://github.com/GermanBluefox,
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

import type { GetRxDataFromWidget, RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';
import VisRxWidget from '@/Vis/visRxWidget';

import DangerousHtmlWithScript from '../Utils/DangerousHtmlWithScript';

// eslint-disable-next-line no-use-before-define
type RxData = GetRxDataFromWidget<typeof BasicHtmlNav>;

class BasicHtmlNav extends VisRxWidget<RxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplHtmlNav',
            visSet: 'basic',
            visName: 'HTML navigation',
            visPrev: 'widgets/basic/img/Prev_HTMLnavigation.png',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'html',
                            type: 'html',
                        },
                        {
                            name: 'nav_view',
                            type: 'views',
                        },
                        {
                            name: 'sub_view',
                            label: 'basic_sub_view',
                            type: 'text',
                            tooltip: 'sub_view_tooltip',
                            hidden: '!data.nav_view',
                        },
                    ],
                },
            ],
            // visWidgetLabel: 'value_string',  // Label of widget
            visDefaultStyle: {
                width: 200,
                height: 130,
            },
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return BasicHtmlNav.getWidgetInfo();
    }

    onNavigate = (): void => {
        if (this.state.rxData.nav_view) {
            this.props.context.changeView(
                (this.state.rxData.nav_view || '').toString(),
                this.state.rxData.sub_view ? this.state.rxData.sub_view.toString() : undefined,
            );
        }
    };

    /**
     * Renders the widget
     */
    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        if (props.style.width === undefined) {
            props.style.width = 200;
        }
        if (props.style.height === undefined) {
            props.style.height = 130;
        }

        return (
            <DangerousHtmlWithScript
                className="vis-widget-body"
                html={(this.state.rxData.html || '').toString()}
                isDiv
                wid={this.props.id}
                onClick={this.props.editMode ? null : this.onNavigate}
            />
        );
    }
}

export default BasicHtmlNav;
