/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2022-2023 Denis Haev https://github.com/GermanBluefox,
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */

import React, { type CSSProperties } from 'react';

import { I18n } from '@iobroker/adapter-react-v5';

import type { RxRenderWidgetProps, RxWidgetInfo, RxWidgetInfoGroup, WidgetData } from '@iobroker/types-vis-2';
import VisRxWidget from '../../visRxWidget';

interface RxData extends WidgetData {
    oid: string;
    count: number;
    [key: `contains_view_${number}`]: string;
}

class BasicViewInWidget8 extends VisRxWidget<RxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplStatefulContainerView8',
            visSet: 'basic',
            visName: 'View in widget 8',
            visAttrs: 'oid;count[1]/number;group.views;contains_view_(0-count)/views' as unknown as RxWidgetInfoGroup[],
            visPrev: 'widgets/basic/img/Prev_StatefulContainerView8.png',
        } as const;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return BasicViewInWidget8.getWidgetInfo();
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        // set default width and height
        if (props.style.width === undefined) {
            props.style.width = 400;
        }
        if (props.style.height === undefined) {
            props.style.height = 270;
        }

        const viewArr = [];
        let i = 0;
        while (this.state.rxData[`contains_view_${i}`] !== undefined) {
            viewArr.push(this.state.rxData[`contains_view_${i}`]);
            i++;
        }

        const oid = this.state.rxData.oid;
        let val = this.state.values[`${oid}.val`];
        let view;

        if (oid !== 'nothing_selected' && val !== undefined) {
            if (val === 'true' || val === true) {
                val = 1;
            }
            if (val === 'false' || val === false) {
                val = 0;
            }
            view = viewArr[val];
        } else {
            view = viewArr[0];
        }
        /*
        <% if (vis.editMode) { %>
            <div class="editmode-helper" />
        <% } %>
        <%
            var viewArr = [];
            var i = 0;
            while (data.attr('contains_view_' + i) !== undefined) {
                viewArr.push(data.attr('contains_view_' + i));
                i++;
            }
        %>
        <div class="vis-widget-body">
            <div class="vis-view-container" data-oid="<%= data.attr('oid') %>" data-vis-contains="<%= vis.binds.stateful.value(viewArr, data.attr('oid')) %>" <%= (el) -> vis.binds.stateful.view(el, viewArr, data.attr('persistent'), data.attr('notIfInvisible')) %> />
        </div>
         */
        if (view === this.props.view) {
            return (
                <div
                    className="vis-widget-body"
                    style={{ overflow: 'hidden', position: 'absolute' }}
                >
                    {I18n.t('vis_2_widgets_basic_cannot_recursive')}
                </div>
            );
        }

        const style: CSSProperties = {
            position: 'absolute',
        };
        if (this.state.rxStyle['overflow-x'] && this.state.rxStyle['overflow-y']) {
            delete props.style.overflow;
            if (this.state.rxStyle['overflow-y'] === this.state.rxStyle['overflow-x']) {
                style.overflow = this.state.rxStyle['overflow-x'];
            } else {
                style.overflowX = this.state.rxStyle['overflow-x'];
                style.overflowY = this.state.rxStyle['overflow-y'];
            }
        } else if (this.state.rxStyle['overflow-x']) {
            style.overflowX = this.state.rxStyle['overflow-x'];
            delete props.style.overflow;
        } else if (this.state.rxStyle['overflow-y']) {
            style.overflowY = this.state.rxStyle['overflow-y'];
            delete props.style.overflow;
        } else if ((this.state.rxStyle as any).overflow) {
            style.overflow = (this.state.rxStyle as any).overflow;
        } else {
            style.overflow = 'hidden';
        }
        delete props.style.overflow;
        delete props.style.overflowX;
        delete props.style.overflowY;

        return (
            <div
                className="vis-widget-body"
                style={style}
            >
                {this.state.editMode ? <div className="vis-editmode-helper" /> : null}
                {super.getWidgetView(view, undefined)}
            </div>
        );
    }
}

export default BasicViewInWidget8;
