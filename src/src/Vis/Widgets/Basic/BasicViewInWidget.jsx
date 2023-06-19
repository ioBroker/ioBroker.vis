/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2022-2023 bluefox https://github.com/GermanBluefox,
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

import {
    DialogContent,
    ListItemText,
    ListSubheader,
    MenuItem,
    IconButton,
    Dialog,
    DialogTitle,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import { FaFolderOpen as FolderOpenedIcon } from 'react-icons/fa';

import { I18n } from '@iobroker/adapter-react-v5';

import VisRxWidget from '../../visRxWidget';

class BasicViewInWidget extends VisRxWidget {
    static getWidgetInfo() {
        return {
            id: 'tplContainerView',
            visSet: 'basic',
            visName: 'View in widget',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'contains_view',
                            label: 'vis_2_widgets_basic_contains_view',
                            type: 'views',
                        },
                        /*
                        {
                            name: 'test',
                            label: 'vis_2_widgets_basic_test',
                            type: 'custom',
                            component: (
                                field,
                                data,
                                onDataChange,
                                // socket,
                                // widgetID,
                                // view,
                                // project,
                            ) => <TextField
                                fullWidth
                                value={data[field.name]}
                                onChange={e => {
                                    onDataChange({ [field.name]: e.target.value });
                                }}
                            />,
                        },
                        */
                    ],
                },
            ],
            visPrev: 'widgets/basic/img/Prev_ContainerView.png',
            visWidgetLabel: 'vis_2_widgets_basic_view_in_widget',  // Label of widget
            visSetLabel: 'set_basic',
            visDefaultStyle: {
                width: 300,
                height: 200,
            },
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return BasicViewInWidget.getWidgetInfo();
    }

    getViewOptions(project, options = [], parentId = null, level = 0) {
        project.___settings.folders
            .filter(folder => (folder.parentId || null) === parentId)
            .forEach(folder => {
                options.push({
                    type: 'folder',
                    folder,
                    level: level + 1,
                });

                this.getViewOptions(project, options, folder.id, level + 1);
            });

        const keys = Object.keys(project)
            .filter(view => (project[view].parentId || null) === parentId && !view.startsWith('__'));

        keys.forEach(view => {
            options.push({
                type: 'view',
                view,
                level: level + 1,
            });
        });

        return options;
    }

    renderViewSelector() {
        const options = this.getViewOptions(this.props.context.views, [], null, 0, true)
            .filter(option => option.type === 'folder' || option.view !== this.props.view);

        return [
            <IconButton
                key="button"
                className={this.props.context.editModeComponentClass}
                onMouseDown={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    // Say to view to ignore next clicks on view to hold the widget selection
                    this.props.onIgnoreMouseEvents(true);
                    this.setState({ showViewSelector: true });
                }}
            >
                <EditIcon />
            </IconButton>,
            this.state.showViewSelector ? <Dialog
                key="dialog"
                open={!0}
                onClose={() =>
                    this.setState({ showViewSelector: false }, () =>
                        // Say to view to cancel ignoring clicks
                        this.props.onIgnoreMouseEvents(false))}
            >
                <DialogTitle>{I18n.t('vis_2_widgets_basic_contains_view')}</DialogTitle>
                <DialogContent>
                    {options.map((option, key) => (option.type === 'view' ?
                        <MenuItem
                            value={option.view}
                            key={key.toString()}
                            onClick={() =>
                                this.setState({ showViewSelector: false }, () => {
                                    // Say to view to cancel ignoring clicks
                                    this.props.onIgnoreMouseEvents(false);
                                    this.props.onWidgetsChanged([{
                                        wid: this.props.id,
                                        view: this.props.view,
                                        data: {
                                            contains_view: option.view,
                                        },
                                    }]);
                                })}
                            style={{ paddingLeft: option.level * 16, lineHeight: '36px' }}
                        >
                            <FileIcon style={{ verticalAlign: 'middle', marginRight: 4 }} />
                            <ListItemText primary={option.view} style={{ verticalAlign: 'middle' }} />
                        </MenuItem>
                        :
                        <ListSubheader key={key} style={{ paddingLeft: option.level * 16, lineHeight: '36px', backgroundColor: 'inherit' }}>
                            <FolderOpenedIcon
                                // className={this.props.classes.icon}
                                style={{
                                    verticalAlign: 'middle',
                                    marginRight: 6,
                                    marginTop: -3,
                                    fontSize: 20,
                                    color: '#00dc00',
                                }}
                            />
                            <span style={{ fontSize: '1rem' }}>{option.folder.name}</span>
                        </ListSubheader>))}
                </DialogContent>
            </Dialog> : null,
        ];
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
        const view = this.state.rxData.contains_view;

        if (view === this.props.view) {
            return <div className="vis-widget-body" style={{ overflow: 'hidden', position: 'absolute' }}>
                {I18n.t('vis_2_widgets_basic_cannot_recursive')}
            </div>;
        }
        if (!view) {
            return <div className="vis-widget-body" style={{ overflow: 'hidden', position: 'absolute' }}>
                {I18n.t('vis_2_widgets_basic_view_not_defined')}
                {this.props.editMode ? this.renderViewSelector() : null}
            </div>;
        }

        return <div className="vis-widget-body" style={{ overflow: 'hidden', position: 'absolute' }}>
            {this.state.editMode ? <div className="editmode-helper" /> : null}
            {super.getWidgetView(view)}
        </div>;
    }
}

BasicViewInWidget.propTypes = {
    id: PropTypes.string.isRequired,
    VisView: PropTypes.any.isRequired,
    views: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    editModeComponentClass: PropTypes.string,
    onIgnoreMouseEvents: PropTypes.func,
};

export default BasicViewInWidget;
