/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2022 bluefox https://github.com/GermanBluefox,
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
import PropTypes from 'prop-types';
import VisRxWidget from '../../visRxWidget';

class BasicViewInWidget extends VisRxWidget {
    static getWidgetInfo() {
        return {
            id: 'tplContainerView',
            visSet: 'basic',
            visName: 'View in widget',
            visAttrs: 'contains_view/views',
            visPrev: 'widgets/basic/img/Prev_ContainerView.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return BasicViewInWidget.getWidgetInfo();
    }

    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        // set default width and height
        if (props.style.width === undefined) {
            props.style.width = 400;
        }
        if (props.style.height === undefined) {
            props.style.height = 270;
        }

        /*
        <div className="vis-widget <%== this.data.attr('class') %>" style="width:400px; height: 270px;" id="<%= this.data.attr('wid') %>">
            <% if (vis.editMode) {%>
                <div class="editmode-helper"></div>
            <%} %>
            <div data-vis-contains="<%= this.data.attr('contains_view') %>" className="vis-widget-body vis-view-container">
            </div>
        </div>
         */
        const VisView = this.props.VisView;

        const view = this.state.rxData.contains_view;

        if (view === this.props.view) {
            return <div className="vis-widget-body" style={{ overflow: 'hidden', position: 'absolute' }}>
                Cannot use recursive views
            </div>;
        }

        return <div className="vis-widget-body" style={{ overflow: 'hidden', position: 'absolute' }}>
            { this.state.editMode ? <div className="editmode-helper" /> : null}
            <VisView
                key={`${this.props.id}_${view}`}
                view={view}
                activeView={view}
                views={this.props.views}
                editMode={this.props.editMode}
                can={this.props.can}
                canStates={this.props.canStates}
                user={this.props.user}
                userGroups={this.props.userGroups}
                allWidgets={this.props.allWidgets}
                jQuery={this.props.jQuery}
                $$={this.props.$$}
                adapterName={this.props.adapterName}
                instance={this.props.instance}
                projectName={this.props.projectName}
                socket={this.props.socket}
                viewsActiveFilter={this.props.viewsActiveFilter}
                setValue={this.props.setValue}
                linkContext={this.props.linkContext}
                formatUtils={this.props.formatUtils}
                selectedWidgets={this.props.runtime ? null : this.props.selectedWidgets}
                setSelectedWidgets={this.props.runtime ? null : this.props.setSelectedWidgets}
                onWidgetsChanged={this.props.runtime ? null : this.props.onWidgetsChanged}
                showWidgetNames={this.props.showWidgetNames}
            />
        </div>;
    }
}

BasicViewInWidget.propTypes = {
    id: PropTypes.string.isRequired,
    views: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
};

export default BasicViewInWidget;