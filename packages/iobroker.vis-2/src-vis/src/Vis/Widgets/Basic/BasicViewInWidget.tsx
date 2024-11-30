/**
 *  ioBroker.vis-2
 *  https://github.com/ioBroker/ioBroker.vis-2
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

import { DialogContent, ListItemText, ListSubheader, MenuItem, IconButton, Dialog, DialogTitle } from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import { FaFolderOpen as FolderOpenedIcon } from 'react-icons/fa';

import { I18n } from '@iobroker/adapter-react-v5';

import type { Project, RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';
import VisRxWidget, { type VisRxWidgetState } from '../../visRxWidget';

type RxData = {
    contains_view: string;
};

interface BasicViewInWidgetState extends VisRxWidgetState {
    showViewSelector: boolean;
}

type BasicViewInWidgetOptions =
    | {
          type: 'folder';
          folder: {
              id: string;
              name: string;
              parentId: string;
          };
          level: number;
      }
    | {
          type: 'view';
          view: string;
          level: number;
      };

class BasicViewInWidget extends VisRxWidget<RxData, BasicViewInWidgetState> {
    static getWidgetInfo(): RxWidgetInfo {
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
                                options, // {context: {adapterName, instance, projectName, socket, views}, selectedView, selectedWidget, selectedWidgets}
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
            visWidgetLabel: 'vis_2_widgets_basic_view_in_widget', // Label of widget
            visSetLabel: 'set_basic',
            visDefaultStyle: {
                width: 300,
                height: 200,
            },
        } as const;
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return BasicViewInWidget.getWidgetInfo();
    }

    getViewOptions(
        project: Project,
        options: BasicViewInWidgetOptions[],
        parentId: string = null,
        level = 0,
    ): BasicViewInWidgetOptions[] {
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

        const keys = Object.keys(project).filter(
            view => (project[view].parentId || null) === parentId && !view.startsWith('__'),
        );

        keys.forEach(view => {
            options.push({
                type: 'view',
                view,
                level: level + 1,
            });
        });

        return options;
    }

    renderViewSelector(): React.JSX.Element[] {
        const options = this.getViewOptions(this.props.context.views, [], null, 0).filter(
            option => option.type === 'folder' || option.view !== this.props.view,
        );

        return [
            <IconButton
                key="button"
                style={this.props.context.editModeComponentStyle}
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
            this.state.showViewSelector ? (
                <Dialog
                    key="dialog"
                    open={!0}
                    onClose={() =>
                        this.setState({ showViewSelector: false }, () =>
                            // Say to view to cancel ignoring clicks
                            this.props.onIgnoreMouseEvents(false),
                        )
                    }
                >
                    <DialogTitle>{I18n.t('vis_2_widgets_basic_contains_view')}</DialogTitle>
                    <DialogContent>
                        {options.map((option, key) =>
                            option.type === 'view' ? (
                                <MenuItem
                                    value={option.view}
                                    key={key.toString()}
                                    onClick={() =>
                                        this.setState({ showViewSelector: false }, () => {
                                            // Say to view to cancel ignoring clicks
                                            this.props.onIgnoreMouseEvents(false);
                                            this.props.context.onWidgetsChanged([
                                                {
                                                    wid: this.props.id,
                                                    view: this.props.view,
                                                    data: {
                                                        contains_view: option.view,
                                                    },
                                                },
                                            ]);
                                        })
                                    }
                                    style={{ paddingLeft: option.level * 16, lineHeight: '36px' }}
                                >
                                    <FileIcon style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                    <ListItemText
                                        primary={option.view}
                                        style={{ verticalAlign: 'middle' }}
                                    />
                                </MenuItem>
                            ) : (
                                <ListSubheader
                                    key={key}
                                    style={{
                                        paddingLeft: option.level * 16,
                                        lineHeight: '36px',
                                        backgroundColor: 'inherit',
                                    }}
                                >
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
                                </ListSubheader>
                            ),
                        )}
                    </DialogContent>
                </Dialog>
            ) : null,
        ];
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

        const view = this.state.rxData.contains_view;

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
        if (!view) {
            return (
                <div
                    className="vis-widget-body"
                    style={{ overflow: 'hidden', position: 'absolute' }}
                >
                    {I18n.t('vis_2_widgets_basic_view_not_defined')}
                    {this.props.editMode ? this.renderViewSelector() : null}
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

export default BasicViewInWidget;
