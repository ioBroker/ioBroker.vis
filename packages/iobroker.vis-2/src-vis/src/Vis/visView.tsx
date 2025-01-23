/**
 *  ioBroker.vis-2
 *  https://github.com/ioBroker/ioBroker.vis-2
 *
 *  Copyright (c) 2022-2024 Denis Haev https://github.com/GermanBluefox,
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
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import { Utils } from '@iobroker/adapter-react-v5';

import type VisRxWidget from '@/Vis/visRxWidget';
import createTheme from '@/theme';
import type {
    AnyWidgetId,
    GroupWidgetId,
    Widget,
    ViewSettings,
    VisContext,
    WidgetStyle,
    VisViewProps,
    SingleWidget,
    GroupWidget,
    AskViewCommand,
    WidgetReference,
} from '@iobroker/types-vis-2';
import { hasWidgetAccess, isVarFinite } from '@/Utils/utils';
import { recalculateFields, selectView, store } from '@/Store';
import type { Property } from 'csstype';

import VisBaseWidget from './visBaseWidget';
import VisCanWidget from './visCanWidget';
import { addClass, parseDimension } from './visUtils';
import VisNavigation from './visNavigation';
import VisWidgetsCatalog from './visWidgetsCatalog';

const MAX_COLUMNS = 8;

export type ViewCommand = 'updateContainers' | 'changeFilter' | 'closeDialog' | 'openDialog' | 'collectFilters';
export type ViewCommandOptions = {
    filter?: string[];
} | null;

declare global {
    interface Window {
        _lastAppliedStyle: string;
    }
}

interface VisViewMovement {
    selectedWidgetsWithRectangle?: AnyWidgetId[];
    moved?: boolean;
    x: number;
    y: number;
    startX?: number;
    startY?: number;
    w?: number;
    h?: number;
    simpleMode?: boolean;
    isResize?: boolean;
    startWidget?: DOMRect;
}

interface ViewElement extends HTMLDivElement {
    _originalParent?: HTMLElement;
}

interface CreateWidgetOptions {
    context: VisContext;
    editMode: boolean;
    id: AnyWidgetId;
    isRelative: boolean;
    mouseDownOnView:
        | null
        | ((
              e: React.MouseEvent,
              wid: AnyWidgetId,
              isRelative: boolean,
              isResize?: boolean,
              isDoubleClick?: boolean,
          ) => void);
    moveAllowed: boolean;
    ignoreMouseEvents?: boolean | undefined;
    onIgnoreMouseEvents?: (ignore: boolean) => void;
    refParent: React.RefObject<HTMLElement>;
    askView: (command: AskViewCommand, props?: WidgetReference) => any;
    relativeWidgetOrder: AnyWidgetId[];
    selectedGroup: GroupWidgetId;
    selectedWidgets: AnyWidgetId[];
    view: string;
    viewsActiveFilter: Record<string, string[]>;
    customSettings: Record<string, any> | undefined;
    index?: number;
}

interface VisViewState {
    mounted: boolean;
    rulers: { type: 'horizontal' | 'vertical'; value: number }[];
    loadedjQueryTheme: string;
    themeCode: string;
    width: number;
    menuWidth: 'hidden' | 'full' | 'narrow';
}

class VisView extends React.Component<VisViewProps, VisViewState> {
    // 1300 z-index is the React dialog
    static Z_INDEXES = {
        VIEW_SELECT_RECTANGLE: 1201,
        WIDGET_SERVICE_DIV: 1200,
    };

    private calculateRelativeWidgetPosition?: null = null;

    static themeCache: Record<string, string> = {};

    private readonly promiseToCollect: Promise<Record<string, VisRxWidget<any>>>;

    private readonly refView: React.RefObject<ViewElement>;

    private readonly refRelativeView: React.RefObject<HTMLDivElement>;

    private readonly refRelativeColumnsView: React.RefObject<HTMLDivElement>[];

    private widgetsRefs: Record<AnyWidgetId, WidgetReference>;

    private selectDiv: HTMLDivElement | null;

    private movement: VisViewMovement | null;

    private readonly theme: Record<string, any>;

    private ignoreMouseEvents: boolean;

    private oldFilter: string;

    private registerDone = false;

    private lastClick = 0;

    private nextClickIsSteal: {
        attr: string;
        cb: (value: string | number | boolean | null) => void;
    } | null = null;

    private loadingTheme = false;

    private moveTimer: ReturnType<typeof setTimeout> | null = null;

    private keysHandlerInstalled = false;

    constructor(props: VisViewProps) {
        super(props);
        this.promiseToCollect = VisWidgetsCatalog.collectRxInformation(
            props.context.socket,
            store.getState().visProject,
            props.context.changeProject,
        );

        this.state = {
            mounted: false,
            rulers: [],
            loadedjQueryTheme: '',
            themeCode: '',
            width: 0,
            menuWidth: (window.localStorage.getItem('vis.menuWidth') as null | 'narrow' | 'full' | 'hidden') || 'full',
        };

        this.refView = React.createRef();
        this.refRelativeView = React.createRef();
        this.refRelativeColumnsView = new Array(MAX_COLUMNS);
        for (let r = 0; r < MAX_COLUMNS; r++) {
            this.refRelativeColumnsView[r] = React.createRef();
        }
        this.widgetsRefs = {};
        this.selectDiv = null;
        this.movement = null;
        this.theme = {}; // cache for custom themes
        this.ignoreMouseEvents = false;

        // remember filter
        this.oldFilter = JSON.stringify((props.viewsActiveFilter && props.viewsActiveFilter[this.props.view]) || []);
    }

    async componentDidMount(): Promise<void> {
        this.updateViewWidth();

        await this.promiseToCollect;
        this.props.context.linkContext.registerViewRef(this.props.view, this.refView, this.onCommand);

        await this.loadJqueryTheme(this.getJQueryThemeName());
        this.setState({ mounted: true }, () => this.registerEditorHandlers());
    }

    componentWillUnmount(): void {
        this.props.context.linkContext.unregisterViewRef(this.props.view, this.refView);

        if (this.refView.current?._originalParent) {
            this.refView.current._originalParent.appendChild(this.refView.current);
            this.refView.current._originalParent = null;
        }

        if (this.selectDiv) {
            this.selectDiv.remove();
            this.selectDiv = null;
        }
        this.widgetsRefs = {};
        this.registerEditorHandlers(true);
        this.uninstallKeyHandlers();
    }

    onCommand = (command: ViewCommand, options?: ViewCommandOptions): string[] | null => {
        if (command === 'updateContainers') {
            // send to all widgets the command
            Object.keys(this.widgetsRefs).forEach(wid => {
                if (this.widgetsRefs[wid as AnyWidgetId]?.onCommand) {
                    this.widgetsRefs[wid as AnyWidgetId].onCommand('updateContainers');
                }
            });

            return null;
        }

        if (command === 'changeFilter') {
            this.changeFilter(options);
            return null;
        }

        if (command === 'closeDialog' || command === 'openDialog') {
            if (this.widgetsRefs[options as AnyWidgetId]?.onCommand) {
                this.widgetsRefs[options as AnyWidgetId].onCommand(command);
            }
            return null;
        }

        if (command === 'collectFilters') {
            const widgets = store.getState().visProject[this.props.view].widgets;
            const filterList: string[] = [];

            Object.keys(widgets).forEach(wid => {
                let filterValues: string[] | string;
                if (this.widgetsRefs[wid as AnyWidgetId]?.onCommand) {
                    // take bound information
                    filterValues = this.widgetsRefs[wid as AnyWidgetId]?.onCommand('collectFilters') as string[];
                } else {
                    filterValues = widgets[wid as AnyWidgetId]?.data?.filterkey as string[] | string;
                }
                if (filterValues) {
                    if (filterValues && typeof filterValues === 'string') {
                        filterValues = filterValues
                            .split(',')
                            .map((f: string) => f.trim())
                            .filter(f => f);
                    }
                    (filterValues as string[]).forEach((f: string) => !filterList.includes(f) && filterList.push(f));
                }
            });

            return filterList;
        }
        return null;
    };

    changeFilter(options?: ViewCommandOptions): null {
        options = { filter: [], ...options };

        // if (typeof options.filter === 'string') {
        //     options.filter = options.filter.split(',').map(f => f.trim()).filter(f => f);
        // }

        if (options.filter) {
            this.props.viewsActiveFilter[this.props.view] = options.filter;

            // inform every widget about changed filter
            Object.keys(this.widgetsRefs).forEach(wid => {
                if (this.widgetsRefs[wid as AnyWidgetId]?.onCommand) {
                    this.widgetsRefs[wid as AnyWidgetId].onCommand('changeFilter');
                }
            });

            // inform bars about changed filter
            if (window.vis.binds.bars && window.vis.binds.bars.filterChanged) {
                try {
                    window.vis.binds.bars.filterChanged(this.props.view, options.filter.join(','));
                } catch (error) {
                    console.error(`Cannot change filter: ${error}`);
                }
            }
        }

        return null;
    }

    askView = (command: AskViewCommand, props?: WidgetReference): any => {
        const widgetsRefs = this.widgetsRefs;
        if (command === 'register') {
            if (props) {
                const id = props.id;
                widgetsRefs[id] = props;
            }
        } else if (command === 'unregister') {
            if (props && widgetsRefs[props.id] && widgetsRefs[props.id].uuid === props.uuid) {
                delete widgetsRefs[props.id];
            }
        } else if (command === 'update') {
            if (props && widgetsRefs[props.id] && widgetsRefs[props.id].uuid === props.uuid) {
                Object.assign(widgetsRefs[props.id], props);
            }
        } else if (command === 'getRef') {
            if (props) {
                return widgetsRefs[props.id];
            }
        } else if (command === 'getViewClass') {
            return this;
        }
        return null;
    };

    onMouseWindowDown = (e: MouseEvent): void => {
        if (!this.refView.current?.contains(e.target as Node)) {
            // Clicked outside the box
            this.cancelStealMode(null);
        }
    };

    onStealStyle = (attr: string, cb: (value: string | number | boolean | null) => void): void => {
        if (!attr) {
            this.cancelStealMode(null);
            return;
        }
        // next click will be processed as steal
        this.nextClickIsSteal = {
            attr,
            cb,
        };
        Object.keys(this.widgetsRefs).forEach(wid => {
            if (this.widgetsRefs[wid as AnyWidgetId]?.onCommand) {
                this.widgetsRefs[wid as AnyWidgetId].onCommand('startStealMode');
            }
        });

        window.document.addEventListener('mousedown', this.onMouseWindowDown);
    };

    cancelStealMode(result: string | number | boolean | null): void {
        if (this.nextClickIsSteal) {
            window.document.removeEventListener('mousedown', this.onMouseWindowDown);
            this.nextClickIsSteal.cb(result);
            Object.keys(this.widgetsRefs).forEach(wid => {
                const onCommand = this.widgetsRefs[wid as AnyWidgetId]?.onCommand;
                if (onCommand) {
                    onCommand('cancelStealMode');
                }
            });
            this.nextClickIsSteal = null;
        }
    }

    mouseDownLocal = this.props.context.runtime
        ? null
        : (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
              if (this.ignoreMouseEvents) {
                  return;
              }
              if (e.button === 2) {
                  return;
              }

              if (this.nextClickIsSteal) {
                  // click canceled
                  this.cancelStealMode(null);
                  return;
              }

              this.props.context.setSelectedWidgets([]);

              this.onMouseViewMove && window.document.addEventListener('mousemove', this.onMouseViewMove);
              this.onMouseViewUp && window.document.addEventListener('mouseup', this.onMouseViewUp);

              const rect = this.refView.current?.getBoundingClientRect();

              if (!rect) {
                  return;
              }

              this.movement = {
                  moved: false,
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  startX: e.pageX,
                  startY: e.pageY,
                  w: 0,
                  h: 0,
                  selectedWidgetsWithRectangle: [],
                  simpleMode: e.shiftKey || e.ctrlKey,
              };
          };

    doubleClickOnView = (): void => {
        if (
            this.props.editMode &&
            this.props.selectedWidgets?.length === 1 &&
            store.getState().visProject[this.props.view].widgets[this.props.selectedWidgets[0]].tpl === '_tplGroup'
        ) {
            this.props.context.setSelectedGroup(this.props.selectedWidgets[0]);
        }
    };

    getWidgetsInRect(
        rect: { top: number; left: number; bottom: number; right: number },
        simpleMode: boolean,
    ): AnyWidgetId[] {
        // take actual position
        const widgets: (string | null)[] = Object.keys(this.widgetsRefs).filter(id => {
            if (!store.getState().visProject[this.props.view].widgets[id as AnyWidgetId]) {
                // orphaned widget
                id !== 'fakeId' && console.warn(`Orphaned widget ${id} found!`);
                return null;
            }

            if (
                store.getState().visProject[this.props.view].widgets[id as AnyWidgetId].groupid &&
                !this.props.selectedGroup
            ) {
                return null;
            }
            const widDiv =
                this.widgetsRefs[id as AnyWidgetId].widDiv || this.widgetsRefs[id as AnyWidgetId].refService?.current;
            if (widDiv) {
                const wRect = widDiv.getBoundingClientRect();
                if (simpleMode) {
                    // top left corner
                    if (
                        wRect.top >= rect.top &&
                        wRect.top <= rect.bottom &&
                        wRect.left >= rect.left &&
                        wRect.left <= rect.right
                    ) {
                        return true;
                    }
                    // bottom right corner
                    if (
                        wRect.bottom >= rect.top &&
                        wRect.bottom <= rect.bottom &&
                        wRect.right >= rect.left &&
                        wRect.right <= rect.right
                    ) {
                        return true;
                    }
                    // top right corner
                    if (
                        wRect.top >= rect.top &&
                        wRect.top <= rect.bottom &&
                        wRect.right >= rect.left &&
                        wRect.right <= rect.right
                    ) {
                        return true;
                    }
                    // bottom left corner
                    if (
                        wRect.bottom >= rect.top &&
                        wRect.bottom <= rect.bottom &&
                        wRect.left >= rect.left &&
                        wRect.left <= rect.right
                    ) {
                        return true;
                    }
                } else if (
                    wRect.top >= rect.top &&
                    wRect.top <= rect.bottom &&
                    wRect.left >= rect.left &&
                    wRect.left <= rect.right &&
                    wRect.bottom >= rect.top &&
                    wRect.bottom <= rect.bottom &&
                    wRect.right >= rect.left &&
                    wRect.right <= rect.right
                ) {
                    return true;
                }
            }

            return false;
        });

        widgets.sort();
        return widgets as AnyWidgetId[];
    }

    onMouseViewMove = !this.props.context.runtime
        ? (e: MouseEvent) => {
              if (this.ignoreMouseEvents || !this.movement) {
                  return;
              }
              if (!this.selectDiv && this.refView.current) {
                  // create selectDiv
                  this.selectDiv = window.document.createElement('div');
                  this.selectDiv.style.position = 'absolute';
                  this.selectDiv.style.zIndex = VisView.Z_INDEXES.VIEW_SELECT_RECTANGLE.toString();
                  this.selectDiv.className = 'vis-editmode-select-rect';
                  this.refView.current.appendChild(this.selectDiv);
              }

              this.movement.moved = true;
              this.movement.w = e.pageX - (this.movement.startX || 0);
              this.movement.h = e.pageY - (this.movement.startY || 0);

              if (this.selectDiv) {
                  if (this.movement.w >= 0) {
                      this.selectDiv.style.left = `${this.movement.x}px`;
                      this.selectDiv.style.width = `${this.movement.w}px`;
                  } else {
                      this.selectDiv.style.left = `${this.movement.x + this.movement.w}px`;
                      this.selectDiv.style.width = `${-this.movement.w}px`;
                  }
                  if (this.movement.h >= 0) {
                      this.selectDiv.style.top = `${this.movement.y}px`;
                      this.selectDiv.style.height = `${this.movement.h}px`;
                  } else {
                      this.selectDiv.style.top = `${this.movement.y + this.movement.h}px`;
                      this.selectDiv.style.height = `${-this.movement.h}px`;
                  }
                  // get selected widgets
                  const widgets: AnyWidgetId[] = this.getWidgetsInRect(
                      this.selectDiv.getBoundingClientRect(),
                      this.movement.simpleMode || false,
                  );
                  if (
                      this.movement.selectedWidgetsWithRectangle &&
                      JSON.stringify(widgets) !== JSON.stringify(this.movement.selectedWidgetsWithRectangle)
                  ) {
                      // select
                      widgets.forEach(id => {
                          if (
                              !this.movement?.selectedWidgetsWithRectangle?.includes(id) &&
                              this.widgetsRefs[id] &&
                              !store.getState().visProject[this.props.view].widgets[id].data.locked &&
                              this.props.selectedGroup !== id
                          ) {
                              if (this.widgetsRefs[id]?.onTempSelect) {
                                  this.widgetsRefs[id].onTempSelect(true);
                              }
                          }
                      });
                      // deselect
                      this.movement.selectedWidgetsWithRectangle.forEach(id => {
                          if (!widgets.includes(id) && this.widgetsRefs[id]?.onTempSelect) {
                              this.widgetsRefs[id].onTempSelect(false);
                          }
                      });
                      this.movement.selectedWidgetsWithRectangle = widgets.filter(
                          widget => !store.getState().visProject[this.props.view].widgets[widget].data.locked,
                      );
                  }
              }
          }
        : null;

    onMouseViewUp = !this.props.context.runtime
        ? (e: MouseEvent) => {
              if (this.ignoreMouseEvents) {
                  return;
              }
              e && e.stopPropagation();
              this.onMouseViewMove && window.document.removeEventListener('mousemove', this.onMouseViewMove);
              this.onMouseViewUp && window.document.removeEventListener('mouseup', this.onMouseViewUp);
              if (this.selectDiv) {
                  this.selectDiv.remove();
                  this.selectDiv = null;
              }

              // deselect widgets
              this.movement?.selectedWidgetsWithRectangle &&
                  this.props.context.setSelectedWidgets(this.movement.selectedWidgetsWithRectangle);

              this.movement = null;
          }
        : null;

    // Called from Widget
    mouseDownOnView = this.props.context.runtime
        ? null
        : (
              e: React.MouseEvent,
              wid: AnyWidgetId,
              _isRelative: boolean,
              isResize?: boolean,
              isDoubleClick?: boolean,
          ) => {
              if (this.ignoreMouseEvents) {
                  return;
              }
              if (this.nextClickIsSteal) {
                  // send to App.js the stolen attribute

                  if (this.widgetsRefs[wid]) {
                      const ref = this.widgetsRefs[wid].widDiv || this.widgetsRefs[wid].refService?.current;
                      this.cancelStealMode(ref ? (ref.style as Record<string, any>)[this.nextClickIsSteal.attr] : null);
                  } else {
                      this.cancelStealMode(null);
                  }
                  return;
              }

              if (
                  this.props.context.disableInteraction ||
                  this.props.context.lockDragging ||
                  this.props.selectedWidgets
                      .map(
                          (selectedWidget: AnyWidgetId) =>
                              store.getState().visProject[this.props.view].widgets[selectedWidget],
                      )
                      .find((widget: GroupWidget | SingleWidget) => widget.data.locked)
              ) {
                  return;
              }

              // detect double click
              if ((this.lastClick && Date.now() - this.lastClick < 250) || isDoubleClick) {
                  this.lastClick = Date.now();
                  if (
                      this.props.selectedWidgets.length === 1 &&
                      store.getState().visProject[this.props.view].widgets[this.props.selectedWidgets[0]].tpl ===
                          '_tplGroup'
                  ) {
                      this.props.context.setSelectedGroup(this.props.selectedWidgets[0]);
                  }
                  return;
              }

              this.lastClick = Date.now();

              if (this.props.selectedWidgets.includes(this.props.selectedGroup) && !isResize) {
                  return;
              }

              this.onMouseWidgetMove && this.refView.current?.addEventListener('mousemove', this.onMouseWidgetMove);
              this.onMouseWidgetUp && window.document.addEventListener('mouseup', this.onMouseWidgetUp);

              this.movement = {
                  moved: false,
                  startX: e.pageX,
                  startY: e.pageY,
                  isResize,
                  x: 0,
                  y: 0,
              };

              const widgetsRefs = this.widgetsRefs;

              this.props.selectedWidgets.forEach((selectedWidget: AnyWidgetId) => {
                  const widgetRect = widgetsRefs[selectedWidget].refService?.current?.getBoundingClientRect();
                  if (
                      this.movement &&
                      widgetRect &&
                      e.pageX <= widgetRect.right &&
                      e.pageX >= widgetRect.left &&
                      e.pageY <= widgetRect.bottom &&
                      e.pageY >= widgetRect.top
                  ) {
                      this.movement.startWidget =
                          widgetsRefs[selectedWidget].refService?.current?.getBoundingClientRect();
                  }
              });

              this.props.selectedWidgets.forEach((_wid: AnyWidgetId) => {
                  if (widgetsRefs[_wid]?.onMove) {
                      widgetsRefs[_wid].onMove(); // indicate the start of movement
                  }
              });

              // Indicate about movement start
              Object.keys(widgetsRefs).forEach(_wid => {
                  if (widgetsRefs[_wid as AnyWidgetId]?.onCommand) {
                      widgetsRefs[_wid as AnyWidgetId].onCommand('startMove');
                  }
              });
          };

    onIgnoreMouseEvents = (ignore: boolean): void => {
        if (this.props.editMode) {
            this.ignoreMouseEvents = ignore;

            this.props.context.onIgnoreMouseEvents(ignore);

            if (ignore && this.movement) {
                this.onMouseWidgetMove &&
                    this.refView.current?.removeEventListener('mousemove', this.onMouseWidgetMove);
                this.onMouseWidgetUp && window.document.removeEventListener('mouseup', this.onMouseWidgetUp);
                this.movement = null;
            }
        }
    };

    onMouseWidgetMove = !this.props.context.runtime
        ? (e: MouseEvent) => {
              if (
                  !this.movement ||
                  !this.refView.current ||
                  (this.props.selectedWidgets.includes(this.props.selectedGroup) && !this.movement.isResize)
              ) {
                  return;
              }
              const widgetsRefs = this.widgetsRefs;
              this.movement.moved = true;
              this.movement.x = e.pageX - (this.movement.startX || 0);
              this.movement.y = e.pageY - (this.movement.startY || 0);

              const viewRect = this.refView.current.getBoundingClientRect();

              if (!this.movement.isResize && store.getState().visProject[this.props.view].settings?.snapType === 2) {
                  const gridSize =
                      parseInt(
                          (store.getState().visProject[this.props.view].settings?.gridSize || 0) as unknown as string,
                          10,
                      ) || 10;
                  this.movement.x -= Math.ceil(
                      ((this.movement.startWidget?.left || 0) - viewRect.left + this.movement.x) % gridSize,
                  );
                  this.movement.y -= Math.ceil(
                      ((this.movement.startWidget?.top || 0) - viewRect.top + this.movement.y) % gridSize,
                  );
              }

              if (!this.movement.isResize && store.getState().visProject[this.props.view].settings?.snapType === 1) {
                  const left = (this.movement.startWidget?.left || 0) + this.movement.x;
                  const right = (this.movement.startWidget?.right || 0) + this.movement.x;
                  const top = (this.movement.startWidget?.top || 0) + this.movement.y;
                  const bottom = (this.movement.startWidget?.bottom || 0) + this.movement.y;
                  for (const wid in widgetsRefs) {
                      const widgetId = wid as AnyWidgetId;
                      // do not snap to itself
                      if (this.props.selectedWidgets.includes(widgetId)) {
                          continue;
                      }
                      const widgetRect = widgetsRefs[widgetId].refService?.current?.getBoundingClientRect();

                      if (widgetRect) {
                          if (
                              Math.abs(widgetRect.top - bottom) <= 10 &&
                              left <= widgetRect.right &&
                              right >= widgetRect.left
                          ) {
                              this.movement.y += Math.round(widgetRect.top - bottom);
                              break;
                          }
                          if (
                              Math.abs(widgetRect.bottom - top) <= 10 &&
                              left <= widgetRect.right &&
                              right >= widgetRect.left
                          ) {
                              this.movement.y += Math.round(widgetRect.bottom - top);
                              break;
                          }
                          if (
                              Math.abs(widgetRect.left - right) <= 10 &&
                              top <= widgetRect.bottom &&
                              bottom >= widgetRect.top
                          ) {
                              this.movement.x += Math.round(widgetRect.left - right);
                              break;
                          }
                          if (
                              Math.abs(widgetRect.right - left) <= 10 &&
                              top <= widgetRect.bottom &&
                              bottom >= widgetRect.top
                          ) {
                              this.movement.x += Math.round(widgetRect.right - left);
                              break;
                          }
                      }
                  }
              }

              this.showRulers();

              this.props.selectedWidgets.forEach((wid: AnyWidgetId) => {
                  const onMove = widgetsRefs[wid]?.onMove;
                  if (onMove && this.movement) {
                      onMove(this.movement.x, this.movement.y, false, this.calculateRelativeWidgetPosition);
                  }

                  // If widget has included widgets => inform them about the new size or position.
                  // This code could be disabled; as in the end, the widgets will be informed anyway.
                  const oWidget = store.getState().visProject[this.props.view].widgets[wid];
                  const attrs = Object.keys(oWidget.data);
                  attrs.forEach(attr => {
                      if (attr.startsWith('widget') && oWidget.data[attr]) {
                          const onCommand = widgetsRefs[oWidget.data[attr]]?.onCommand;
                          if (onCommand) {
                              onCommand('updatePosition');
                          }
                      }
                  });
              });

              // if only one widget selected => check if it can be added to the other widget
              if (
                  this.props.selectedWidgets.length === 1 &&
                  widgetsRefs[this.props.selectedWidgets[0]]?.refService?.current
              ) {
                  let found = false;
                  for (const wid in widgetsRefs) {
                      const widgetId = wid as AnyWidgetId;
                      // do not snap to itself
                      if (
                          this.props.selectedWidgets.includes(widgetId) ||
                          !widgetsRefs[widgetId] ||
                          !widgetsRefs[widgetId].canHaveWidgets ||
                          widgetsRefs[widgetId].doNotWantIncludeWidgets ||
                          !widgetsRefs[widgetId].onCommand ||
                          !widgetsRefs[widgetId].refService?.current
                      ) {
                          continue;
                      }
                      const baseRect =
                          widgetsRefs[this.props.selectedWidgets[0]].refService?.current?.getBoundingClientRect();
                      const rect = widgetsRefs[widgetId].refService?.current?.getBoundingClientRect();
                      const onCommand = widgetsRefs[widgetId]?.onCommand;
                      // check if widget can have other widgets inside
                      if (
                          !found &&
                          baseRect &&
                          rect &&
                          baseRect.top >= rect.top &&
                          baseRect.left >= rect.left &&
                          baseRect.right <= rect.right &&
                          baseRect.bottom <= rect.bottom
                      ) {
                          found = true;
                          // we can add only to one widget
                          if (onCommand) {
                              onCommand('includePossible');
                          }
                      } else if (onCommand) {
                          // inform all other widgets that they do not have inclusion
                          onCommand('includePossibleNOT');
                      }
                  }
              }
          }
        : null;

    showRulers = (hide?: boolean): void => {
        const rulers: { type: 'horizontal' | 'vertical'; value: number }[] = [];
        if (hide) {
            this.setState({ rulers });
            return;
        }

        const verticals = [];
        const horizontals = [];

        const viewRect = this.refView.current?.getBoundingClientRect();

        if (!viewRect) {
            return;
        }

        for (const wid of Object.keys(this.widgetsRefs)) {
            const widgetId = wid as AnyWidgetId;
            const { widgets } = selectView(store.getState(), this.props.view);
            if (
                !this.props.selectedWidgets.includes(widgetId) &&
                widgets[widgetId] &&
                ((this.props.selectedGroup && widgets[this.props.selectedGroup].data.members.includes(widgetId)) ||
                    !this.props.selectedGroup) &&
                (!widgets[widgetId].grouped || this.props.selectedGroup)
            ) {
                if (!this.widgetsRefs[widgetId].refService?.current) {
                    console.error(`CHECK WHY!!! ${widgetId} has no refService.current`);
                } else {
                    const boundingRect = this.widgetsRefs[widgetId].refService?.current?.getBoundingClientRect();
                    if (boundingRect) {
                        horizontals.push(Math.round(boundingRect.top));
                        horizontals.push(Math.round(boundingRect.bottom));
                        verticals.push(Math.round(boundingRect.left));
                        verticals.push(Math.round(boundingRect.right));
                    }
                }
            }
        }

        const selectedHorizontals: number[] = [];
        const selectedVerticals: number[] = [];
        for (const wid of this.props.selectedWidgets) {
            const { widgets } = selectView(store.getState(), this.props.view);
            // check if not in group
            if (widgets[wid] && (!widgets[wid].grouped || this.props.selectedGroup)) {
                const boundingRect = this.widgetsRefs[wid].refService?.current?.getBoundingClientRect();
                if (boundingRect) {
                    selectedHorizontals.push(Math.round(boundingRect.top));
                    selectedHorizontals.push(Math.round(boundingRect.bottom));
                    selectedVerticals.push(Math.round(boundingRect.left));
                    selectedVerticals.push(Math.round(boundingRect.right));
                }
            }
        }

        horizontals.forEach(horizontal =>
            selectedHorizontals.forEach(selectedHorizontal => {
                if (Math.abs(horizontal - selectedHorizontal) <= 0.3) {
                    rulers.push({ type: 'horizontal', value: horizontal - viewRect.top });
                }
            }),
        );

        verticals.forEach(vertical =>
            selectedVerticals.forEach(selectedVertical => {
                if (Math.abs(vertical - selectedVertical) <= 0.3) {
                    rulers.push({ type: 'vertical', value: vertical - viewRect.left });
                }
            }),
        );

        this.setState({ rulers });
    };

    onMouseWidgetUp = !this.props.context.runtime
        ? (e: MouseEvent) => {
              const widgetsRefs = this.widgetsRefs;
              e && e.stopPropagation();
              this.onMouseWidgetMove && this.refView.current?.removeEventListener('mousemove', this.onMouseWidgetMove);
              this.onMouseWidgetUp && window.document.removeEventListener('mouseup', this.onMouseWidgetUp);

              if (this.movement?.moved) {
                  this.props.selectedWidgets.forEach((wid: AnyWidgetId) => {
                      const onMove = widgetsRefs[wid]?.onMove;
                      if (onMove && this.movement) {
                          onMove(this.movement.x, this.movement.y, true); // indicate end of movement
                      }
                  });

                  store.dispatch(recalculateFields(true));
              }

              // Indicate every widget about movement stop
              Object.keys(widgetsRefs).forEach(_wid => {
                  const onCommand = widgetsRefs[_wid as AnyWidgetId]?.onCommand;
                  if (onCommand) {
                      onCommand('stopMove');
                  }
              });

              // if only one widget selected => check if it can be added to another widget
              if (
                  this.props.selectedWidgets.length === 1 &&
                  widgetsRefs[this.props.selectedWidgets[0]]?.refService?.current
              ) {
                  for (const wid in widgetsRefs) {
                      const widgetId = wid as AnyWidgetId;
                      // do not add to itself
                      if (
                          this.props.selectedWidgets.includes(widgetId) ||
                          !widgetsRefs[widgetId] ||
                          !widgetsRefs[widgetId].canHaveWidgets ||
                          widgetsRefs[widgetId].doNotWantIncludeWidgets ||
                          !widgetsRefs[widgetId].onCommand ||
                          !widgetsRefs[widgetId].refService?.current
                      ) {
                          continue;
                      }
                      const baseRect =
                          widgetsRefs[this.props.selectedWidgets[0]].refService?.current?.getBoundingClientRect();
                      const rect = widgetsRefs[widgetId].refService?.current?.getBoundingClientRect();
                      // check if widget can have other widgets inside
                      if (
                          rect &&
                          baseRect &&
                          baseRect.top >= rect.top &&
                          baseRect.left >= rect.left &&
                          baseRect.right <= rect.right &&
                          baseRect.bottom <= rect.bottom
                      ) {
                          this.props.context.askAboutInclude(
                              this.props.selectedWidgets[0],
                              widgetId,
                              (_wid: AnyWidgetId, toWid: AnyWidgetId) => {
                                  const onCommand = widgetsRefs[toWid]?.onCommand;
                                  if (onCommand) {
                                      onCommand('include', _wid);
                                  }
                              },
                          );
                      }
                  }
              }

              this.showRulers(true);
          }
        : null;

    editWidgetsRect(widget: AnyWidgetId): { top: number; left: number; width: number; height: number } | null {
        if (!this.refView.current) {
            return null;
        }
        const viewLeft = this.refView.current.offsetLeft;
        const viewTop = this.refView.current.offsetTop;

        // find common coordinates
        const ref: HTMLElement | null | undefined =
            this.widgetsRefs[widget].widDiv || this.widgetsRefs[widget].refService?.current;

        if (!ref) {
            return null;
        }
        let top = ref.offsetTop - viewTop;
        let left = ref.offsetLeft - viewLeft;
        // Maybe bug?
        if (!left && !top) {
            const style = store.getState().visProject[this.props.view].widgets[widget].style;
            left = parseInt((style?.left as string) || '0', 10) + parseInt(ref.offsetLeft as unknown as string, 10);
            top = parseInt((style?.top as string) || '0', 10) + parseInt(ref.offsetTop as unknown as string, 10);
            left = left || 0;
            top = top || 0;
        }

        return {
            top,
            left,
            width: ref.clientWidth,
            height: ref.clientHeight,
        };
    }

    pxToPercent = (oldStyle: WidgetStyle, newStyle: WidgetStyle): null | WidgetStyle => {
        if (!this.refView.current) {
            return null;
        }
        const pRect = {
            left: this.refView.current.clientLeft,
            top: this.refView.current.clientTop,
            height: this.refView.current.clientHeight,
            width: this.refView.current.clientWidth,
        };

        if (oldStyle.position === 'relative') {
            delete newStyle.top;
            delete newStyle.left;
            if (oldStyle.width === '100%') {
                delete newStyle.width;
            }
            if (oldStyle.height === '100%') {
                delete newStyle.height;
            }
        }

        const resultStyle = { ...newStyle };
        if (
            newStyle.top &&
            parseDimension(oldStyle.top).dimension === '%' &&
            parseDimension(newStyle.top).dimension !== '%'
        ) {
            resultStyle.top = (parseDimension(newStyle.top).value * 100) / pRect.height;
            resultStyle.top = `${Math.round(resultStyle.top * 100) / 100}%`;
        }
        if (
            newStyle.left &&
            parseDimension(oldStyle.left).dimension === '%' &&
            parseDimension(newStyle.left).dimension !== '%'
        ) {
            resultStyle.left = (parseDimension(newStyle.left).value * 100) / pRect.width;
            resultStyle.left = `${Math.round(resultStyle.left * 100) / 100}%`;
        }
        if (
            newStyle.width &&
            parseDimension(oldStyle.width).dimension === '%' &&
            parseDimension(newStyle.width).dimension !== '%'
        ) {
            resultStyle.width = (parseDimension(newStyle.width).value / pRect.width) * 100;
            resultStyle.width = `${Math.round(resultStyle.width * 100) / 100}%`;
        }
        if (
            newStyle.height &&
            parseDimension(oldStyle.height).dimension === '%' &&
            parseDimension(newStyle.height).dimension !== '%'
        ) {
            resultStyle.height = (parseDimension(newStyle.height).value / pRect.height) * 100;
            resultStyle.height = `${Math.round(resultStyle.height * 100) / 100}%`;
        }
        return { ...oldStyle, ...resultStyle };
    };

    onPxToPercent = (
        wids: AnyWidgetId[],
        attr: string,
        cb: (results: (string | null)[]) => void,
    ): (string | null)[] => {
        if (!this.refView.current) {
            return [];
        }
        const pRect = {
            // left: this.refView.current.clientLeft,
            // top: this.refView.current.clientTop,
            height: this.refView.current.clientHeight,
            width: this.refView.current.clientWidth,
        };

        const results: (string | null)[] = wids.map(wid => {
            const wRect = this.editWidgetsRect(wid);
            if (!wRect) {
                return null;
            }
            /*
            if (isShift) {
                wRect.top  -= pRect.top;
                wRect.left -= pRect.left;
            }
            */
            let value: number;
            if (attr === 'top') {
                value = (wRect.top * 100) / pRect.height;
            } else if (attr === 'left') {
                value = (wRect.left * 100) / pRect.width;
            } else if (attr === 'width') {
                value = (wRect.width / pRect.width) * 100;
            } else {
                // height
                value = (wRect.height / pRect.height) * 100;
            }

            return `${Math.round(value * 100) / 100}%`;
        });

        cb && cb(results);

        return results;
    };

    onPercentToPx = (
        wids: AnyWidgetId[],
        attr: string,
        cb: (results: (string | null)[]) => void,
    ): (string | null)[] => {
        const results = wids.map(wid => {
            const wRect = this.editWidgetsRect(wid);
            if (!wRect) {
                return null;
            }

            return `${Math.round((wRect as Record<string, number>)[attr])}px`;
        });

        cb && cb(results);

        return results;
    };

    registerEditorHandlers(unregister?: boolean): void {
        if (this.props.context.registerEditorCallback) {
            if (!unregister && this.props.activeView === this.props.view) {
                if (!this.registerDone) {
                    this.registerDone = true;
                    this.props.context.registerEditorCallback('onStealStyle', this.props.view, this.onStealStyle);
                    this.props.context.registerEditorCallback('onPxToPercent', this.props.view, this.onPxToPercent);
                    this.props.context.registerEditorCallback('pxToPercent', this.props.view, this.pxToPercent);
                    this.props.context.registerEditorCallback('onPercentToPx', this.props.view, this.onPercentToPx);
                }
            } else {
                this.registerDone = false;
                this.props.context.registerEditorCallback('onStealStyle', this.props.view);
                this.props.context.registerEditorCallback('onPxToPercent', this.props.view);
                this.props.context.registerEditorCallback('pxToPercent', this.props.view);
                this.props.context.registerEditorCallback('onPercentToPx', this.props.view);
            }
        }
    }

    updateViewWidth(): void {
        if (this.refRelativeView.current) {
            if (this.refRelativeView.current.offsetWidth !== this.state.width) {
                this.setState({ width: this.refRelativeView.current.offsetWidth });
            }
        }
    }

    componentDidUpdate(): void {
        this.registerEditorHandlers();
        this.updateViewWidth();
        // detect filter changes
        if (!this.props.editMode) {
            const newFilter = JSON.stringify(
                (this.props.viewsActiveFilter && this.props.viewsActiveFilter[this.props.view]) || [],
            );
            if (this.oldFilter !== newFilter) {
                this.oldFilter = newFilter;
                this.changeFilter({ filter: JSON.parse(newFilter) });
            }
        }
    }

    static renderGitter(step: number, color: string): React.JSX.Element {
        color = color || '#D0D0D0';
        step = step || 10;
        const bigWidth = step * 5;
        const smallWidth = step;

        const gitterPattern = btoa(`<svg width="${bigWidth}" height="${bigWidth}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <pattern id="grid" width="${bigWidth}" height="${bigWidth}" patternUnits="userSpaceOnUse">
            <path d="M 0 ${smallWidth} L ${bigWidth} ${smallWidth} M ${smallWidth} 0 L ${smallWidth} ${bigWidth} M 0 ${2 * smallWidth} L ${bigWidth} ${2 * smallWidth} M ${2 * smallWidth} 0 L ${2 * smallWidth} ${bigWidth} M 0 ${3 * smallWidth} L ${bigWidth} ${3 * smallWidth} M ${3 * smallWidth} 0 L ${3 * smallWidth} ${bigWidth} M 0 ${4 * smallWidth} L ${bigWidth} ${4 * smallWidth} M ${4 * smallWidth} 0 L ${4 * smallWidth} ${bigWidth}" fill="none" stroke="${color}" opacity="0.2" stroke-width="1"/>
            <path d="M ${bigWidth} 0 L 0 0 0 ${bigWidth}" fill="none" stroke="${color}" stroke-width="1"/>
        </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)"/>
</svg>`);
        const backgroundImage = `url(data:image/svg+xml;base64,${gitterPattern})`;

        return (
            <div
                style={{
                    opacity: 0.2,
                    zIndex: -1,
                    userSelect: 'none',
                    pointerEvents: 'none',
                    width: '100%',
                    height: '100%',
                    backgroundImage,
                    backgroundPosition: '-1px -1px',
                }}
            />
        );
    }

    static getOneWidget(index: number, widget: Widget, options: CreateWidgetOptions): React.JSX.Element | null {
        if (!VisWidgetsCatalog.rxWidgets) {
            return null;
        }
        // context, id, isRelative, refParent, askView, mouseDownOnView, view,
        // relativeWidgetOrder, moveAllowed, editMode, multiView, ignoreMouseEvents, selectedGroup
        // viewsActiveFilter, customSettings, onIgnoreMouseEvents
        const WidgetEl =
            VisWidgetsCatalog.rxWidgets[widget.tpl] ||
            (VisWidgetsCatalog.allWidgetsList?.includes(widget.tpl) ? VisCanWidget : VisBaseWidget);

        return (
            // @ts-expect-error fix later
            <WidgetEl
                key={`${index}_${options.id}`}
                tpl={widget.tpl}
                {...options}
            />
        );
    }

    async loadJqueryTheme(jQueryTheme: string): Promise<void> {
        if (VisView.themeCache[jQueryTheme] && this.props.view) {
            let data = VisView.themeCache[jQueryTheme];
            const _view = `visview_${this.props.view.replace(/\s/g, '_')}`;
            data = data.replace('.ui-helper-hidden', `\n#${_view} .ui-helper-hidden`);
            data = data.replace(/(}.)/g, `}\n#${_view} .`);
            data = data.replace(/,\./g, `,#${_view} .`);
            data = data.replace(/images/g, `../../lib/css/themes/jquery-ui/${jQueryTheme}/images`);

            this.setState({ loadedjQueryTheme: jQueryTheme, themeCode: data });
        } else {
            try {
                const resp = await fetch(`../../lib/css/themes/jquery-ui/${jQueryTheme}/jquery-ui.min.css`);
                let data = await resp.text();
                VisView.themeCache[jQueryTheme] = data;

                const _view = `visview_${this.props.view.replace(/\s/g, '_')}`;
                data = data.replace('.ui-helper-hidden', `\n#${_view} .ui-helper-hidden`);
                data = data.replace(/(}.)/g, `}\n#${_view} .`);
                data = data.replace(/,\./g, `,#${_view} .`);
                data = data.replace(/images/g, `../../lib/css/themes/jquery-ui/${jQueryTheme}/images`);

                this.setState({ loadedjQueryTheme: jQueryTheme, themeCode: data });
            } catch (e) {
                console.warn(`Cannot load jQueryUI theme "${jQueryTheme}": ${e.stack}`);
            }
        }

        this.loadingTheme = false;
    }

    getJQueryThemeName(): string {
        const settings = this.props.view && store.getState().visProject[this.props.view]?.settings;

        return settings?.theme || 'redmond';
    }

    installKeyHandlers(): void {
        if (!this.keysHandlerInstalled) {
            this.keysHandlerInstalled = true;
            window.addEventListener('keydown', this.onKeyDown, false);
        }
    }

    uninstallKeyHandlers(): void {
        if (this.keysHandlerInstalled) {
            this.keysHandlerInstalled = false;
            window.removeEventListener('keydown', this.onKeyDown, false);
        }
    }

    // eslint-disable-next-line react/no-unused-class-component-methods
    moveWidgets = (leftShift: number, topShift: number): void => {
        if (!this.moveTimer) {
            this.movement = {
                x: 0,
                y: 0,
            };
            this.props.selectedWidgets.forEach((_wid: AnyWidgetId) => {
                const onMove = this.widgetsRefs[_wid]?.onMove;
                if (onMove) {
                    onMove(); // indicate the start of movement
                }
            });

            // Indicate about movement start
            Object.keys(this.widgetsRefs).forEach(_wid => {
                const onCommand = this.widgetsRefs[_wid as AnyWidgetId]?.onCommand;
                if (onCommand) {
                    onCommand('startMove');
                }
            });
        }

        if (!this.movement) {
            return;
        }
        this.movement.x += leftShift;
        this.movement.y += topShift;

        this.props.selectedWidgets.forEach((wid: AnyWidgetId) => {
            const widgetsRefs = this.widgetsRefs;
            const onMove = widgetsRefs[wid]?.onMove;
            if (onMove && this.movement) {
                onMove(this.movement.x, this.movement.y, false, this.calculateRelativeWidgetPosition);
            }
        });

        this.showRulers();

        this.moveTimer && clearTimeout(this.moveTimer);
        this.moveTimer = setTimeout(() => {
            this.moveTimer = null;
            this.showRulers(true);
            store.dispatch(recalculateFields(true));

            this.props.selectedWidgets.forEach((wid: AnyWidgetId) => {
                const onMove = this.widgetsRefs[wid]?.onMove;
                if (onMove && this.movement) {
                    onMove(this.movement.x, this.movement.y, true, this.calculateRelativeWidgetPosition); // indicate end of movement
                }
            });
            this.movement = null;

            // Indicate about movement start
            Object.keys(this.widgetsRefs).forEach(_wid => {
                const onCommand = this.widgetsRefs[_wid as AnyWidgetId]?.onCommand;
                if (onCommand) {
                    onCommand('stopMove');
                }
            });
        }, 800);
    };

    // eslint-disable-next-line react/no-unused-class-component-methods
    resizeWidgets = (widthShift: number, heightShift: number): void => {
        if (!this.moveTimer) {
            this.movement = {
                x: 0,
                y: 0,
                isResize: true,
            };
            // Indicate about movement start
            Object.keys(this.widgetsRefs).forEach(_wid => {
                const onCommand = this.widgetsRefs[_wid as AnyWidgetId]?.onCommand;
                if (onCommand) {
                    onCommand('startResize');
                }
            });

            this.props.selectedWidgets.forEach((_wid: AnyWidgetId) => {
                const onMove = this.widgetsRefs[_wid]?.onMove;
                if (onMove) {
                    onMove(); // indicate the start of resizing
                }
            });
        }
        if (!this.movement) {
            return;
        }

        this.movement.x += widthShift;
        this.movement.y += heightShift;

        this.props.selectedWidgets.forEach((wid: AnyWidgetId) => {
            const widgetsRefs = this.widgetsRefs;
            const onMove = widgetsRefs[wid]?.onMove;
            if (onMove && this.movement) {
                onMove(this.movement.x, this.movement.y, false, this.calculateRelativeWidgetPosition);
            }
        });

        this.showRulers();

        this.moveTimer && clearTimeout(this.moveTimer);
        this.moveTimer = setTimeout(() => {
            this.moveTimer = null;
            this.showRulers(true);

            this.props.selectedWidgets.forEach((wid: AnyWidgetId) => {
                const onMove = this.widgetsRefs[wid]?.onMove;
                // indicate end of movement
                if (onMove && this.movement) {
                    onMove(this.movement.x, this.movement.y, true, this.calculateRelativeWidgetPosition);
                }
            });

            // Indicate about movement start
            Object.keys(this.widgetsRefs).forEach(_wid => {
                const onCommand = this.widgetsRefs[_wid as AnyWidgetId]?.onCommand;
                if (onCommand) {
                    onCommand('stopResize');
                }
            });
            this.movement = null;
        }, 800);
    };

    onKeyDown = (e: KeyboardEvent): void => {
        if (!this.props.editMode) {
            return;
        }
        if (document.activeElement?.tagName === 'BODY') {
            if (this.props.selectedWidgets.length) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this[e.shiftKey ? 'resizeWidgets' : 'moveWidgets'](e.ctrlKey ? -10 : -1, 0);
                }
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this[e.shiftKey ? 'resizeWidgets' : 'moveWidgets'](e.ctrlKey ? 10 : 1, 0);
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this[e.shiftKey ? 'resizeWidgets' : 'moveWidgets'](0, e.ctrlKey ? -10 : -1);
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this[e.shiftKey ? 'resizeWidgets' : 'moveWidgets'](0, e.ctrlKey ? 10 : 1);
                }
            }
        }
    };

    renderScreenSize(): React.JSX.Element[] | null {
        const ww = parseInt(
            (store.getState().visProject[this.props.view].settings?.sizex || 0) as unknown as string,
            10,
        );
        const hh = parseInt(
            (store.getState().visProject[this.props.view].settings?.sizey || 0) as unknown as string,
            10,
        );

        if (!this.props.editMode || !this.props.view || !ww || !hh) {
            return null;
        }
        return [
            <div
                key="black"
                style={{
                    top: 0,
                    left: 0,
                    width: `${ww}px`,
                    height: `${hh}px`,
                    position: 'absolute',
                    borderTopWidth: 0,
                    borderLeftWidth: 0,
                    borderRightWidth: 1,
                    borderBottomWidth: 1,
                    boxSizing: 'content-box',
                    borderStyle: 'dashed',
                    borderColor: 'black',
                    zIndex: 1000,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    opacity: 0.7,
                }}
            />,
            <div
                key="white"
                style={{
                    top: 0,
                    left: 0,
                    width: `${ww + 1}px`,
                    height: `${hh + 1}px`,
                    position: 'absolute',
                    borderTopWidth: 0,
                    borderLeftWidth: 0,
                    borderRightWidth: 1,
                    borderBottomWidth: 1,
                    boxSizing: 'content-box',
                    borderStyle: 'dashed',
                    borderColor: 'white',
                    zIndex: 1000,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    opacity: 0.7,
                }}
            />,
        ];
    }

    getRelativeStyle(settings: ViewSettings, groupId: GroupWidgetId, limitScreenSize?: boolean): React.CSSProperties {
        const relativeStyle: React.CSSProperties = {};
        if (groupId) {
            const groupWidgetStyle = store.getState().visProject[this.props.view].widgets[groupId].style;
            relativeStyle.width = groupWidgetStyle?.width || '100%';
            relativeStyle.height = groupWidgetStyle?.height || '100%';
        } else {
            // this was only if this.props.editMode
            if (settings.sizex && !limitScreenSize) {
                let ww: number | string = settings.sizex;
                let hh: number | string = settings.sizey || 0;
                if (isVarFinite(ww)) {
                    ww = parseFloat(ww as unknown as string);
                }
                if (isVarFinite(hh)) {
                    hh = parseFloat(hh as unknown as string);
                }

                if (typeof ww === 'number' || (ww as string).match(/\d$/)) {
                    ww = `${ww.toString()}px`;
                }
                if (typeof hh === 'number' || (hh as string).match(/\d$/)) {
                    hh = `${hh.toString()}px`;
                }
                relativeStyle.width = ww;
                relativeStyle.height = hh;
            } else {
                relativeStyle.width = '100%';
                relativeStyle.height = '100%';
            }

            relativeStyle.display = settings.style?.display || 'flex';

            if (relativeStyle.display === 'flex') {
                relativeStyle.flexWrap = 'wrap';
                relativeStyle.columnGap = 8;

                if (isVarFinite(settings.columnGap)) {
                    relativeStyle.columnGap = parseInt(settings.columnGap as unknown as string, 10);
                }
            }
        }
        relativeStyle.position = 'absolute';
        relativeStyle.top = 0;
        relativeStyle.left = 0;

        return relativeStyle;
    }

    getCountOfRelativeColumns(settings: ViewSettings, relativeWidgetsCount: number): number {
        // number of columns
        const width = this.state.width;
        if (width) {
            if (settings.columnWidth && isVarFinite(settings.columnWidth)) {
                return Math.floor(this.state.width / settings.columnWidth) + 1;
            }

            let columns;
            if (width < 600) {
                columns = 1;
            } else if (width < 900) {
                columns = 2;
            } else if (width < 1200) {
                columns = 3;
            } else if (width < 2064) {
                columns = 4;
            } else {
                columns = Math.floor(width / 500) + 1;
            }

            if (columns > relativeWidgetsCount) {
                columns = relativeWidgetsCount;
            }
            if (columns > MAX_COLUMNS) {
                columns = MAX_COLUMNS;
            }

            return columns;
        }

        return 1;
    }

    renderNavigation(content: React.JSX.Element): React.JSX.Element {
        return (
            <VisNavigation
                context={this.props.context}
                activeView={this.props.activeView}
                view={this.props.view}
                editMode={this.props.editMode}
                menuWidth={this.state.menuWidth}
                theme={this.props.context.theme}
                setMenuWidth={(menuWidth: 'hidden' | 'narrow' | 'full'): Promise<void> => {
                    window.localStorage.setItem('vis.menuWidth', menuWidth);
                    this.setState({ menuWidth });

                    return new Promise(resolve => {
                        // re-calculate the width of the view
                        setTimeout(() => {
                            this.updateViewWidth();
                            resolve(null);
                        }, 400);
                    });
                }}
            >
                {content}
            </VisNavigation>
        );
    }

    render(): React.JSX.Element {
        let rxAbsoluteWidgets: (React.JSX.Element | null)[] = [];
        let rxRelativeWidgets: React.JSX.Element[] | null = [];
        let rxGroupWidget;

        const contextView = store.getState().visProject[this.props.view];

        if (!this.props.view || !contextView) {
            return null;
        }

        const settings = contextView.settings;

        if (this.props.view === this.props.activeView && this.props.editMode && !this.keysHandlerInstalled) {
            this.installKeyHandlers();
        } else if ((this.props.view !== this.props.activeView || !this.props.editMode) && this.keysHandlerInstalled) {
            this.uninstallKeyHandlers();
        }

        // wait till view has real div (ref), because of CanJS widgets. they really need a DOM div
        // and wait for themes too
        if (this.state.mounted && this.state.themeCode && this.refView.current) {
            // save initial filter
            if (!this.props.viewsActiveFilter?.[this.props.view]) {
                this.props.viewsActiveFilter[this.props.view] = (contextView.settings?.filterkey || '')
                    .split(',')
                    .map(f => f.trim())
                    .filter(f => f);
            }

            const widgets = contextView.widgets;
            let moveAllowed = true;
            if (widgets) {
                let relativeWidgetOrder: AnyWidgetId[] = [];

                if (this.props.selectedGroup) {
                    relativeWidgetOrder = [...(widgets[this.props.selectedGroup]?.data?.members ?? [])];
                } else if (contextView.settings?.order) {
                    relativeWidgetOrder = [...contextView.settings.order];
                }

                // by group editing first relative, then absolute
                if (this.props.selectedGroup) {
                    relativeWidgetOrder.sort((a, b) => {
                        const widgetA = widgets[a];
                        const widgetB = widgets[b];
                        const isRelativeA =
                            widgetA.style &&
                            (widgetA.style.position === 'relative' ||
                                widgetA.style.position === 'static' ||
                                widgetA.style.position === 'sticky');
                        const isRelativeB =
                            widgetB.style &&
                            (widgetB.style.position === 'relative' ||
                                widgetB.style.position === 'static' ||
                                widgetB.style.position === 'sticky');
                        if (isRelativeA && isRelativeB) {
                            return 0;
                        }
                        if (isRelativeA) {
                            return -1;
                        }
                        return 1;
                    });
                }

                const relativeWidgets = [];
                const absoluteWidgets = [];
                const unknownWidgets = [];

                if (this.props.editMode && this.props.selectedWidgets?.length) {
                    this.props.selectedWidgets.forEach((id: AnyWidgetId) => {
                        const widget = contextView.widgets[id];
                        if (!widget || (widget.groupid && !this.props.selectedGroup)) {
                            return;
                        }
                        if (widget.style) {
                            if (widget.style.position === 'relative') {
                                relativeWidgets.push(id);
                            } else if (!widget.style.position || widget.style.position === 'absolute') {
                                absoluteWidgets.push(id);
                            } else {
                                unknownWidgets.push(id);
                            }
                        } else {
                            absoluteWidgets.push(id);
                        }
                    });

                    // sticky widgets cannot be moved
                    if (unknownWidgets.length) {
                        moveAllowed = false;
                    } else if (relativeWidgets.length && absoluteWidgets.length) {
                        // absolute and relative widgets cannot be moved together
                        moveAllowed = false;
                    }
                }

                const listRelativeWidgetsOrder: AnyWidgetId[] = [];
                const listAbsoluteWidgetsOrder: AnyWidgetId[] = [];
                const filterWidgets = contextView.filterWidgets;
                const filterInvert = contextView.filterInvert;

                // calculate the order of relative widgets
                Object.keys(widgets).forEach(id => {
                    // the group will be rendered apart
                    if (id === this.props.selectedGroup) {
                        return;
                    }

                    const widget = contextView.widgets[id as AnyWidgetId];
                    // Ignore grouped widgets in non-group-edit mode. They will be rendered in BasicGroup
                    if (!widget || (widget.grouped && !this.props.selectedGroup)) {
                        return;
                    }

                    if (!this.props.selectedGroup && widget.usedInWidget) {
                        // do not show built in widgets on view directly
                        return;
                    }

                    if (
                        !hasWidgetAccess({
                            view: this.props.view,
                            editMode: this.props.editMode,
                            project: store.getState().visProject,
                            user: store.getState().activeUser,
                            wid: id as AnyWidgetId,
                        })
                    ) {
                        // do not show widget because user has no access
                        return;
                    }

                    // if group edition, ignore all widgets from other groups
                    if (
                        this.props.selectedGroup &&
                        id !== this.props.selectedGroup &&
                        widget.groupid !== this.props.selectedGroup
                    ) {
                        return;
                    }

                    // filter out the widgets in edit mode
                    if (this.props.editMode && filterWidgets?.length) {
                        if (widget.data?.filterkey) {
                            let filterValues: string[] | string = widget.data.filterkey;
                            if (filterValues && typeof filterValues === 'string') {
                                filterValues = filterValues
                                    .split(',')
                                    .map(f => f.trim())
                                    .filter(f => f);
                            }
                            // if filterInvert, then show only widgets with filterkey
                            if (filterInvert) {
                                if (!filterWidgets.find(f => filterValues.includes(f))) {
                                    return;
                                }
                            } else if (filterWidgets.find(f => filterValues.includes(f))) {
                                // Else hide widgets with filterkey in filterWidgets
                                return;
                            }
                        } else if (filterInvert) {
                            return;
                        }
                    }

                    const isRelative =
                        widget.style &&
                        (widget.style.position === 'relative' ||
                            widget.style.position === 'static' ||
                            widget.style.position === 'sticky');
                    if (isRelative && id !== this.props.selectedGroup) {
                        if (!listRelativeWidgetsOrder.includes(id as AnyWidgetId)) {
                            listRelativeWidgetsOrder.push(id as AnyWidgetId);
                        }
                    } else {
                        const pos = listRelativeWidgetsOrder.indexOf(id as AnyWidgetId);
                        // if this widget is in relative order, remove it
                        pos !== -1 && listRelativeWidgetsOrder.splice(pos, 1);

                        if (!listAbsoluteWidgetsOrder.includes(id as AnyWidgetId)) {
                            listAbsoluteWidgetsOrder.push(id as AnyWidgetId);
                        }
                    }
                });

                if (!this.props.selectedGroup) {
                    for (let t = relativeWidgetOrder.length - 1; t >= 0; t--) {
                        if (!contextView.widgets[relativeWidgetOrder[t]]) {
                            relativeWidgetOrder.splice(t, 1);
                        }
                    }
                }

                // sort relative widgets according to order
                listRelativeWidgetsOrder.sort((a, b) => {
                    const posA = relativeWidgetOrder.indexOf(a);
                    const posB = relativeWidgetOrder.indexOf(b);
                    if (posA === -1 && posB === -1) {
                        return 0;
                    }
                    if (posA === -1) {
                        return 1;
                    }
                    if (posB === -1) {
                        return -1;
                    }
                    return posA - posB;
                });

                const columns =
                    this.props.selectedGroup || !settings
                        ? 1
                        : this.getCountOfRelativeColumns(settings, listRelativeWidgetsOrder.length);
                const wColumns = new Array(columns);
                for (let w = 0; w < wColumns.length; w++) {
                    wColumns[w] = [];
                }

                const view = this.props.view;

                rxAbsoluteWidgets = listAbsoluteWidgetsOrder.map((id, index) =>
                    VisView.getOneWidget(index, contextView.widgets[id], {
                        context: this.props.context,
                        editMode: this.props.editMode,
                        id,
                        isRelative: false,
                        mouseDownOnView: this.mouseDownOnView,
                        moveAllowed,
                        ignoreMouseEvents: this.ignoreMouseEvents,
                        onIgnoreMouseEvents: this.onIgnoreMouseEvents,
                        refParent: this.props.selectedGroup ? this.refRelativeView : this.refView,
                        askView: this.askView,
                        relativeWidgetOrder,
                        selectedGroup: this.props.selectedGroup,
                        selectedWidgets: this.movement?.selectedWidgetsWithRectangle || this.props.selectedWidgets,
                        view,
                        viewsActiveFilter: this.props.viewsActiveFilter,
                        customSettings: this.props.customSettings,
                    }),
                );

                if (listRelativeWidgetsOrder.length) {
                    let columnIndex = 0;

                    listRelativeWidgetsOrder.forEach((id, index) => {
                        const widget = store.getState().visProject[view].widgets[id];
                        // if newLine, start from the beginning
                        if (widget.style.newLine) {
                            columnIndex = 0;
                        }

                        const w = VisView.getOneWidget(index, widget, {
                            // custom attributes
                            context: this.props.context,
                            editMode: this.props.editMode, // relative widget cannot be multi-view
                            id,
                            isRelative: true,
                            mouseDownOnView: this.mouseDownOnView,
                            moveAllowed,
                            ignoreMouseEvents: this.ignoreMouseEvents,
                            onIgnoreMouseEvents: this.onIgnoreMouseEvents,
                            refParent: this.props.selectedGroup
                                ? this.refRelativeView
                                : this.refRelativeColumnsView[columnIndex],
                            askView: this.askView,
                            relativeWidgetOrder: this.props.selectedGroup
                                ? relativeWidgetOrder
                                : listRelativeWidgetsOrder,
                            selectedWidgets: this.movement?.selectedWidgetsWithRectangle || this.props.selectedWidgets,
                            selectedGroup: this.props.selectedGroup,
                            view,
                            customSettings: this.props.customSettings,
                            viewsActiveFilter: this.props.viewsActiveFilter,
                        });
                        wColumns[columnIndex].push(w);
                        columnIndex++;
                        if (columnIndex >= columns) {
                            columnIndex = 0;
                        }
                    });

                    if (this.props.selectedGroup) {
                        rxRelativeWidgets = wColumns[0];
                    } else {
                        const style: React.CSSProperties = {};
                        if (settings?.columnWidth && isVarFinite(settings.columnWidth)) {
                            style.maxWidth = parseFloat(settings.columnWidth as unknown as string);
                        }
                        rxRelativeWidgets = wColumns.map((column, i) => (
                            <div
                                ref={this.refRelativeColumnsView[i]}
                                key={i}
                                style={style}
                                className={Utils.clsx('vis-view-column', this.props.editMode && 'vis-view-column-edit')}
                            >
                                {column}
                            </div>
                        ));
                    }
                } else {
                    rxRelativeWidgets = null;
                }

                // render group widget apart
                if (this.props.selectedGroup) {
                    rxGroupWidget = VisView.getOneWidget(0, contextView.widgets[this.props.selectedGroup], {
                        context: this.props.context,
                        editMode: this.props.editMode,
                        id: this.props.selectedGroup,
                        isRelative: false,
                        mouseDownOnView: this.mouseDownOnView,
                        moveAllowed,
                        ignoreMouseEvents: this.ignoreMouseEvents,
                        onIgnoreMouseEvents: this.onIgnoreMouseEvents,
                        refParent: this.refView,
                        askView: this.askView,
                        relativeWidgetOrder,
                        selectedGroup: this.props.selectedGroup,
                        selectedWidgets: this.movement?.selectedWidgetsWithRectangle || this.props.selectedWidgets,
                        view,
                        viewsActiveFilter: this.props.viewsActiveFilter,
                        customSettings: this.props.customSettings,
                    });
                }
            }
        }

        let className = 'vis-view';
        const style: React.CSSProperties = {
            width: '100%',
            height: '100%',
        };

        if (this.state.loadedjQueryTheme !== this.getJQueryThemeName() && this.props.view) {
            if (!this.loadingTheme) {
                this.loadingTheme = true;
                setTimeout(
                    () => this.loadJqueryTheme(this.getJQueryThemeName()),
                    this.state.loadedjQueryTheme ? 50 : 0,
                );
            }
        }
        const backgroundStyle: React.CSSProperties = {};
        const backgroundClass: string = settings?.style?.background_class || '';

        settings?.style &&
            Object.keys(settings.style).forEach(attr => {
                if (attr === 'background_class') {
                    className = addClass(className, settings.style?.background_class);
                } else {
                    const isBg = attr.startsWith('background');
                    if (!settings['bg-image'] || !isBg) {
                        const value: string = (settings.style as Record<string, string>)[attr];
                        // convert background-color => backgroundColor
                        attr = attr.replace(/(-\w)/g, text => text[1].toUpperCase());
                        (style as Record<string, string>)[attr] = value;
                        if (isBg) {
                            (backgroundStyle as Record<string, string>)[attr] = value;
                        }
                    }
                }
            });

        // Check if custom theme should be used
        let theme = this.props.context.theme;
        const customThemeType = this.props.customSettings?.themeType;
        // if custom theme differs from the current one => create new theme
        if (this.props.customSettings?.viewStyle?.overrides) {
            // override the theme with custom settings
            theme = createTheme(
                customThemeType || this.props.context.theme.palette.mode,
                this.props.customSettings.viewStyle.overrides,
            );
        } else if (customThemeType && customThemeType !== theme.palette.mode) {
            if (!this.theme[customThemeType]) {
                // cache theme
                this.theme[customThemeType] = createTheme(customThemeType);
            }
            theme = this.theme[customThemeType];
        }

        if (!style.backgroundColor && !style.background) {
            if (this.props.customSettings?.viewStyle?.backgroundColor) {
                backgroundStyle.backgroundColor = this.props.customSettings.viewStyle.backgroundColor;
            } else if (this.props.customSettings?.themeType === 'dark') {
                backgroundStyle.backgroundColor = '#000';
            } else {
                backgroundStyle.backgroundColor = theme.palette.mode === 'dark' ? '#000' : '#fff';
            }
        }

        if (!style.color) {
            // override the text color from custom settings
            if (this.props.customSettings?.viewStyle?.color) {
                style.color = this.props.customSettings.viewStyle.color;
            } else {
                // or set according to theme
                style.color = theme.palette.mode === 'dark' ? '#fff' : '#000';
            }
        }

        // override font family from custom settings
        if (!style.fontFamily && this.props.customSettings?.viewStyle?.fontFamily) {
            style.fontFamily = this.props.customSettings.viewStyle.fontFamily;
        }

        // if the current view is not active, so hide it and show only if it is active
        if (this.props.view !== this.props.activeView) {
            style.display = 'none';
        }

        if (this.props.context.container) {
            style.overflow = 'hidden';
        }

        let gridDiv = null;
        if (store.getState().visProject[this.props.view].settings?.snapType === 2 && this.props.editMode) {
            gridDiv = VisView.renderGitter(contextView.settings?.gridSize, contextView.settings?.snapColor);
        }

        if (this.props.style) {
            Object.assign(style, this.props.style);
        }

        // apply image
        if (settings && settings['bg-image']) {
            backgroundStyle.backgroundImage = `url("../${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}${settings['bg-image'].substring(9)}")`; // "_PRJ_NAME".length = 9
            backgroundStyle.backgroundRepeat = 'no-repeat';
            backgroundStyle.backgroundPosition = 'top left';
            if (settings['bg-color']) {
                backgroundStyle.backgroundColor = settings['bg-color'];
            }
            if (settings['bg-position-x']) {
                // eslint-disable-next-line no-restricted-properties
                backgroundStyle.backgroundPositionX = isVarFinite(settings['bg-position-x'])
                    ? `${settings['bg-position-x']}px`
                    : settings['bg-position-x'];
            }
            if (settings['bg-position-y']) {
                // eslint-disable-next-line no-restricted-properties
                backgroundStyle.backgroundPositionY = isVarFinite(settings['bg-position-y'])
                    ? `${settings['bg-position-y']}px`
                    : settings['bg-position-y'];
            }
            if (settings['bg-width'] && settings['bg-height']) {
                // eslint-disable-next-line no-restricted-properties
                const w = isVarFinite(settings['bg-width']) ? `${settings['bg-width']}px` : settings['bg-width'];
                // eslint-disable-next-line no-restricted-properties
                const h = isVarFinite(settings['bg-height']) ? `${settings['bg-height']}px` : settings['bg-height'];
                backgroundStyle.backgroundSize = `${w} ${h}`;
            } else if (settings['bg-width']) {
                // eslint-disable-next-line no-restricted-properties
                backgroundStyle.backgroundSize = `${isVarFinite(settings['bg-width']) ? `${settings['bg-width']}px` : settings['bg-width']} auto`;
            } else if (settings['bg-height']) {
                // eslint-disable-next-line no-restricted-properties
                const w = isVarFinite(settings['bg-height']) ? `${settings['bg-height']}px` : settings['bg-height'];
                backgroundStyle.backgroundSize = `auto ${w}`;
            }
        }
        Object.assign(style, backgroundStyle);

        let renderedWidgets;

        let limitScreenStyle: React.CSSProperties | null = null;
        // limit screen size of desired
        if (
            settings?.limitScreen &&
            ((window.screen.width >= 800 && window.screen.height >= 800) || !settings.limitScreenDesktop)
        ) {
            let ignore = false;
            if (settings.limitForInstances) {
                const visInstance = window.localStorage.getItem('visInstance');
                if (visInstance) {
                    const instances = settings.limitForInstances
                        .split(',')
                        .map(i => i.trim())
                        .filter(i => i);
                    if (instances.length && !instances.includes(visInstance)) {
                        ignore = true;
                    }
                } else {
                    ignore = true;
                }
            }
            if (!ignore) {
                const ww = isVarFinite(settings.sizex) ? parseFloat(settings.sizex as unknown as string) : 0;
                const hh = isVarFinite(settings.sizey) ? parseFloat(settings.sizey as unknown as string) : 0;
                if (ww && hh) {
                    const borderWidth = parseFloat(settings.limitScreenBorderWidth as unknown as string) || 0;
                    const borderColor = settings.limitScreenBorderColor || '#333';
                    const borderStyle = settings.limitScreenBorderStyle || 'dotted';
                    const bgColor = settings.limitScreenBackgroundColor || null;

                    limitScreenStyle = {
                        ...backgroundStyle,
                        width: ww + borderWidth * 2,
                        height: hh + borderWidth * 2,
                        minWidth: ww + borderWidth * 2,
                        minHeight: hh + borderWidth * 2,
                        overflow: 'auto',
                        position: 'relative',
                        boxSizing: 'border-box',
                        borderWidth,
                        borderColor,
                        borderStyle,
                    };
                    style.display = 'flex';
                    style.justifyContent = 'center';
                    style.alignItems = 'center';
                    style.backgroundColor = bgColor as Property.BackgroundColor;
                }
            }
        }

        if (this.props.selectedGroup) {
            // draw all widgets in div, that has exact size of the group
            renderedWidgets = rxGroupWidget;
        } else if (settings) {
            renderedWidgets = (
                <>
                    {rxRelativeWidgets ? (
                        <div
                            ref={this.refRelativeView}
                            style={this.getRelativeStyle(settings, this.props.selectedGroup, !!limitScreenStyle)}
                            className="vis-relative-view"
                        >
                            {rxRelativeWidgets}
                        </div>
                    ) : null}
                    {rxAbsoluteWidgets}
                </>
            );
        }

        if (limitScreenStyle) {
            renderedWidgets = (
                <div
                    style={limitScreenStyle}
                    className="vis-limit-screen"
                >
                    {renderedWidgets}
                </div>
            );
        }

        let renderedView = (
            <div
                className={`${className} visview_${this.props.view.replace(/\s/g, '_')}`}
                ref={this.refView}
                id={`visview_${this.props.view.replace(/\s/g, '_')}`}
                onMouseDown={
                    !this.props.context.runtime
                        ? e => this.props.editMode && this.mouseDownLocal && this.mouseDownLocal(e)
                        : undefined
                }
                onDoubleClick={
                    this.props.context.runtime
                        ? () => this.props.editMode && this.doubleClickOnView && this.doubleClickOnView()
                        : undefined
                }
                style={style}
            >
                <style>{this.state.themeCode}</style>
                {gridDiv}
                {limitScreenStyle ? null : this.renderScreenSize()}
                {this.state.rulers.map((ruler, key) => (
                    <div
                        key={key}
                        style={{
                            pointerEvents: 'none',
                            userSelect: 'none',
                            position: 'absolute',
                            width: ruler.type === 'horizontal' ? '100%' : 10,
                            height: ruler.type === 'horizontal' ? 10 : '100%',
                            borderStyle: 'solid',
                            borderColor: 'red',
                            borderWidth: 0,
                            borderLeftWidth: ruler.type === 'horizontal' ? 0 : 1,
                            borderTopWidth: ruler.type === 'horizontal' ? 1 : 0,
                            left: ruler.type === 'horizontal' ? 0 : ruler.value,
                            top: ruler.type === 'horizontal' ? ruler.value : 0,
                            zIndex: 1000,
                        }}
                    />
                ))}
                {renderedWidgets}
            </div>
        );

        // render the menu if enabled and not in widget;
        // only if the view is now active (not alwaysRender)
        if (settings && (settings.navigation || settings.navigationBar) && this.props.view === this.props.activeView) {
            renderedView = this.renderNavigation(renderedView);
        }

        // apply a view background to a whole document
        if (!this.props.visInWidget && this.props.activeView === this.props.view) {
            const bgStyle = JSON.stringify(backgroundStyle);
            if (!window._lastAppliedStyle || window._lastAppliedStyle !== bgStyle) {
                window._lastAppliedStyle = bgStyle;
                window.document.documentElement.removeAttribute('style');
                // apply background style to html
                Object.keys(backgroundStyle).forEach(
                    attr =>
                        ((window.document.documentElement.style as Record<string, any>)[attr] = (
                            backgroundStyle as Record<string, any>
                        )[attr]),
                );
            }
            window.document.documentElement.className = backgroundClass;
        }

        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>{renderedView}</ThemeProvider>
            </StyledEngineProvider>
        );
    }
}

export interface VisEngineHandlers {
    onStealStyle: (attr: string, cb: (value: string | number | boolean | null) => void) => void;
    pxToPercent: (oldStyle: WidgetStyle, newStyle: WidgetStyle) => null | WidgetStyle;

    onPxToPercent: (wids: AnyWidgetId[], attr: string, cb: (results: (string | null)[]) => void) => (string | null)[];
    onPercentToPx: (wids: AnyWidgetId[], attr: string, cb: (results: (string | null)[]) => void) => (string | null)[];
}

export default VisView;
