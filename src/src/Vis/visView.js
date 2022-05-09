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
import VisCanWidget from './visCanWidget';
import { addClass, parseDimension } from './visUtils';
import WIDGETS from './Widgets';

class VisView extends React.Component {
    // 1300 z-index is the React dialog
    static Z_INDEXES = {
        VIEW_SELECT_RECTANGLE: 1201,
        WIDGET_SERVICE_DIV: 1200,
    };

    static widgets = null;

    constructor(props) {
        super(props);

        VisView.collectInformation();

        this.state = {
            mounted: false,
            rulers: [],
        };

        this.refView = React.createRef();
        this.refRelativeView = React.createRef();
        this.widgetsRefs = {};
        this.selectDiv = null;
        this.movement = null;
    }

    static collectInformation() {
        if (!VisView.widgets) {
            VisView.widgets = {};
            WIDGETS.forEach(Widget => {
                if (!Widget.getWidgetInfo) {
                    console.error(`Invalid widget without getWidgetInfo: ${Widget.constructor.name}`);
                } else {
                    const info = Widget.getWidgetInfo();
                    if (!info.visSet) {
                        console.error(`No visSet in info for "${Widget.constructor.name}"`);
                    }

                    if (!info.id) {
                        console.error(`No id in info for "${Widget.constructor.name}"`);
                    } else {
                        VisView.widgets[info.id] = Widget;
                    }
                }
            });
        }

        return VisView.widgets;
    }

    componentDidMount() {
        this.props.linkContext.registerViewRef(this.props.view, this.refView, this.onCommand);

        this.setState({ mounted: true }, () =>
            this.registerEditorHandlers());
    }

    componentWillUnmount() {
        this.props.linkContext.unregisterViewRef(this.props.view, this.refView);

        if (this.refView.current && this.refView.current._originalParent) {
            this.refView.current._originalParent.appendChild(this.refView.current);
            this.refView.current._originalParent = null;
        }

        if (this.selectDiv) {
            this.selectDiv.remove();
            this.selectDiv = null;
        }
        this.widgetsRefs = {};
        this.registerEditorHandlers(true);
    }

    onCommand = (command, options) => {
        if (command === 'updateContainers') {
            // send to all widgets the command
            Object.keys(this.widgetsRefs).forEach(wid =>
                this.widgetsRefs[wid].onCommand && this.widgetsRefs[wid].onCommand(command));

            return null;
        }
        if (command === 'changeFilter') {
            this.changeFilter(options);
            return null;
        }

        if (command === 'collectFilters') {
            const widgets = this.props.views[this.props.view].widgets;
            const filterList = [];

            Object.keys(widgets).forEach(wid => {
                let filterValues;
                if (this.widgetsRefs[wid]?.onCommand) {
                    // take bound information
                    filterValues = this.widgetsRefs[wid]?.onCommand('collectFilters');
                } else {
                    filterValues = widgets[wid]?.data?.filterkey;
                    if (filterValues && typeof filterValues === 'string') {
                        filterValues = filterValues.split(',').map(f => f.trim()).filter(f => f);
                    }
                }
                if (filterValues) {
                    filterValues.forEach(f => !filterList.includes(f) && filterList.push(f));
                }
            });

            return filterList;
        }
        return null;
    }

    changeFilter(options) {
        options = { filter: '', ...options };

        if (typeof options.filter === 'string') {
            options.filter = options.filter.split(',').map(f => f.trim()).filter(f => f);
        }

        this.props.viewsActiveFilter[this.props.view] = options.filter;

        // inform every widget about changed filter
        Object.keys(this.widgetsRefs).forEach(wid =>
            this.widgetsRefs[wid].onCommand('changeFilter', options));

        // inform bars about changed filter
        if (window.vis.binds.bars && window.vis.binds.bars.filterChanged) {
            try {
                window.vis.binds.bars.filterChanged(this.props.view, options.filter.join(','));
            } catch (error) {
                console.error(`Cannot change filter: ${error}`);
            }
        }

        return null;
    }

    registerRef = (id, widDiv, refService, onMove, onResize, onTempSelect, onCommand) => {
        if (onMove) {
            this.widgetsRefs[id] = {
                widDiv,
                refService,
                onMove,
                onResize,
                onTempSelect,
                onCommand,
            };
        } else {
            delete this.widgetsRefs[id];
        }
    };

    onMouseWindowDown = e => {
        if (!this.refView.current.contains(e.target)) {
            // Clicked outside the box
            this.cancelStealMode(null);
        }
    }

    onStealStyle = (attr, cb) => {
        if (!attr) {
            this.cancelStealMode(null);
            return;
        }
        // next click will be processed as steal
        this.nextClickIsSteal = {
            attr,
            cb,
            cursors: {},
        };
        Object.keys(this.widgetsRefs).forEach(wid =>
            this.widgetsRefs[wid].onCommand && this.widgetsRefs[wid].onCommand('startStealMode'));

        window.document.addEventListener('mousedown', this.onMouseWindowDown);
    }

    cancelStealMode(result) {
        if (this.nextClickIsSteal) {
            window.document.removeEventListener('mousedown', this.onMouseWindowDown);
            this.nextClickIsSteal.cb(result);
            Object.keys(this.widgetsRefs).forEach(wid =>
                this.widgetsRefs[wid].onCommand && this.widgetsRefs[wid].onCommand('cancelStealMode'));
            this.nextClickIsSteal = null;
        }
    }

    onMouseViewDown = this.props.runtime ? null : e => {
        if (e.button === 2) {
            return;
        }

        if (this.nextClickIsSteal) {
            // click canceled
            this.cancelStealMode(null);
            return;
        }

        this.props.setSelectedWidgets([]);

        window.document.addEventListener('mousemove', this.onMouseViewMove);
        window.document.addEventListener('mouseup', this.onMouseViewUp);

        const rect = this.refView.current.getBoundingClientRect();

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
    }

    getWidgetsInRect(rect, simpleMode) {
        // take actual position
        const widgets = Object.keys(this.widgetsRefs).filter(id => {
            if (this.props.views[this.props.view].widgets[id].groupid && !this.props.selectedGroup) {
                return null;
            }
            const widDiv = this.widgetsRefs[id].widDiv || this.widgetsRefs[id].refService.current;
            if (widDiv) {
                const wRect = widDiv.getBoundingClientRect();
                if (simpleMode) {
                    // top left corner
                    if (wRect.top >= rect.top && wRect.top <= rect.bottom && wRect.left >= rect.left && wRect.left <= rect.right) {
                        return true;
                    }
                    // bottom right corner
                    if (wRect.bottom >= rect.top && wRect.bottom <= rect.bottom && wRect.right >= rect.left && wRect.right <= rect.right) {
                        return true;
                    }
                    // top right corner
                    if (wRect.top >= rect.top && wRect.top <= rect.bottom && wRect.right >= rect.left && wRect.right <= rect.right) {
                        return true;
                    }
                    // bottom left corner
                    if (wRect.bottom >= rect.top && wRect.bottom <= rect.bottom && wRect.left >= rect.left && wRect.left <= rect.right) {
                        return true;
                    }
                } else if (wRect.top >= rect.top && wRect.top <= rect.bottom &&
                    wRect.left >= rect.left && wRect.left <= rect.right &&
                    wRect.bottom >= rect.top && wRect.bottom <= rect.bottom &&
                    wRect.right >= rect.left && wRect.right <= rect.right
                ) {
                    return true;
                }
            }

            return false;
        });

        widgets.sort();
        return widgets;
    }

    calculateRelativeWidgetPosition = (widgetId, left, top, shadowDiv, widgetsOrder) => {
        left = parseFloat(left);
        top = parseFloat(top);

        const viewRect = this.refRelativeView.current.getBoundingClientRect();
        const sRect = shadowDiv.getBoundingClientRect();
        const rect = {
            top: sRect.top - viewRect.top,
            left: sRect.left - viewRect.left,
            bottom: sRect.bottom - viewRect.top,
            right: sRect.right - viewRect.left,
        };

        if (left <= 0) {
            const pos = widgetsOrder.indexOf(widgetId);
            if (pos) {
                // console.log('Place first');
                widgetsOrder.splice(pos, 1);
                widgetsOrder.unshift(widgetId);
                this.refRelativeView.current.prepend(shadowDiv);
            }

            return;
        }

        // if point is in widget rect
        if (top >= rect.top && top <= rect.bottom && left >= rect.left && left <= rect.right) {
            // nothing changed
            return;
        }

        let afterWid = widgetsOrder.find(wid => {
            if (wid === widgetId || !this.widgetsRefs[wid]) {
                return false;
            }
            const widDiv = this.widgetsRefs[wid].widDiv || this.widgetsRefs[wid].refService.current;
            if (widDiv) {
                const wRect = widDiv.getBoundingClientRect();
                const _rect = {
                    top: wRect.top - viewRect.top,
                    left: wRect.left - viewRect.left,
                    bottom: wRect.bottom - viewRect.top,
                    right: wRect.right - viewRect.left,
                };

                // if point is in rect
                if (top >= _rect.top && top <= _rect.bottom && left >= _rect.left && left <= _rect.right) {
                    return true;
                }
            }

            return false;
        });

        // Try to find position only by X axis
        afterWid = afterWid || widgetsOrder.find(wid => {
            if (wid === widgetId || !this.widgetsRefs[wid]) {
                return false;
            }
            const widDiv = this.widgetsRefs[wid].widDiv || this.widgetsRefs[wid].refService.current;
            if (widDiv) {
                const wRect = widDiv.getBoundingClientRect();
                const _rect = {
                    top: wRect.top - viewRect.top,
                    left: wRect.left - viewRect.left,
                    bottom: wRect.bottom - viewRect.top,
                    right: wRect.right - viewRect.left,
                };
                // if point is in rect
                if (left >= _rect.left && left <= _rect.right) {
                    return true;
                }
            }

            return false;
        });

        if (afterWid) {
            const pos = widgetsOrder.indexOf(widgetId);
            const newPos = widgetsOrder.indexOf(afterWid);
            if (pos !== newPos + 1) {
                widgetsOrder.splice(pos, 1);
                widgetsOrder.splice(newPos, 0, widgetId);

                const afterDiv = this.widgetsRefs[afterWid].widDiv || this.widgetsRefs[afterWid].refService.current;
                if (afterDiv.nextSibling) {
                    // console.log(`Place after ${afterWid}`);
                    this.refRelativeView.current.insertBefore(shadowDiv, afterDiv.nextSibling);
                } else {
                    // console.log('Place last');
                    this.refRelativeView.current.appendChild(shadowDiv);
                }
            }
        }
    }

    onMouseViewMove = !this.props.runtime ? e => {
        if (!this.selectDiv && this.refView.current) {
            // create selectDiv
            this.selectDiv = window.document.createElement('div');
            this.selectDiv.style.position = 'absolute';
            this.selectDiv.style.zIndex = VisView.Z_INDEXES.VIEW_SELECT_RECTANGLE;
            this.selectDiv.className = 'vis-editmode-select-rect';
            this.refView.current.appendChild(this.selectDiv);
        }

        this.movement.moved = true;
        this.movement.w = e.pageX - this.movement.startX;
        this.movement.h = e.pageY - this.movement.startY;

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
        }

        // get selected widgets
        const widgets = this.getWidgetsInRect(this.selectDiv.getBoundingClientRect(), this.movement.simpleMode);
        if (JSON.stringify(widgets) !== JSON.stringify(this.movement.selectedWidgetsWithRectangle)) {
            // select
            widgets.forEach(id => !this.movement.selectedWidgetsWithRectangle.includes(id) && this.widgetsRefs[id] && !this.props.views[this.props.view].widgets[id].data.locked && this.widgetsRefs[id].onTempSelect(true));
            // deselect
            this.movement.selectedWidgetsWithRectangle.forEach(id => !widgets.includes(id) && this.widgetsRefs[id] && this.widgetsRefs[id].onTempSelect(false));
            this.movement.selectedWidgetsWithRectangle = widgets.filter(widget => !this.props.views[this.props.view].widgets[widget].data.locked);
        }
    } : null;

    onMouseViewUp = !this.props.runtime ? e => {
        e && e.stopPropagation();
        window.document.removeEventListener('mousemove', this.onMouseViewMove);
        window.document.removeEventListener('mouseup', this.onMouseViewUp);
        if (this.selectDiv) {
            this.selectDiv.remove();
            this.selectDiv = null;
        }

        // deselect widgets
        this.movement.selectedWidgetsWithRectangle.forEach(id => this.widgetsRefs[id] && this.widgetsRefs[id].onTempSelect());

        this.props.setSelectedWidgets(this.movement.selectedWidgetsWithRectangle);

        this.movement = null;
    } : null;

    onMouseWidgetDown = this.props.runtime ? null : (e, wid, isRelative, isResize) => {
        if (this.nextClickIsSteal) {
            // send to App.js the stolen attribute

            if (this.widgetsRefs[wid]) {
                const ref = this.widgetsRefs[wid].widDiv || this.widgetsRefs[wid].refService?.current;
                this.cancelStealMode(ref ? ref.style[this.nextClickIsSteal.attr] : null);
            } else {
                this.cancelStealMode(null);
            }
            return;
        }

        if (this.props.disableInteraction || this.props.lockDragging ||
            this.props.selectedWidgets
                .map(selectedWidget => this.props.views[this.props.view].widgets[selectedWidget])
                .find(widget => widget.data.locked)
        ) {
            return;
        }

        this.refView.current.addEventListener('mousemove', this.onMouseWidgetMove);
        window.document.addEventListener('mouseup', this.onMouseWidgetUp);

        this.movement = {
            moved: false,
            startX: e.pageX,
            startY: e.pageY,
            isResize,
            x: 0,
            y: 0,
        };

        this.props.selectedWidgets.forEach(selectedWidget => {
            const widgetRect = this.widgetsRefs[selectedWidget].refService.current.getBoundingClientRect();
            if (e.pageX <= widgetRect.right && e.pageX >= widgetRect.left && e.pageY <= widgetRect.bottom && e.pageY >= widgetRect.top) {
                this.movement.startWidget = this.widgetsRefs[selectedWidget].refService.current.getBoundingClientRect();
            }
        });

        this.props.selectedWidgets.forEach(_wid => {
            if (this.widgetsRefs[_wid]?.onMove) {
                this.widgetsRefs[_wid].onMove(); // indicate start of movement
            }
        });

        // Indicate about movement start
        Object.keys(this.widgetsRefs).forEach(_wid => {
            if (this.widgetsRefs[_wid]?.onCommand) {
                this.widgetsRefs[_wid].onCommand('startMove');
            }
        });
    }

    onMouseWidgetMove = !this.props.runtime ? e => {
        this.movement.moved = true;
        this.movement.x = e.pageX - this.movement.startX;
        this.movement.y = e.pageY - this.movement.startY;

        const viewRect = this.refRelativeView.current.getBoundingClientRect();

        if (!this.movement.isResize && this.props.views[this.props.view].settings.snapType === 2) {
            this.movement.x -= Math.round(((this.movement.startWidget.left - viewRect.left + this.movement.x) % this.props.views[this.props.view].settings.gridSize));
            this.movement.y -= Math.round(((this.movement.startWidget.top - viewRect.top + this.movement.y) % this.props.views[this.props.view].settings.gridSize));
        }

        if (!this.movement.isResize && this.props.views[this.props.view].settings.snapType === 1) {
            const left = this.movement.startWidget.left + this.movement.x;
            const right = this.movement.startWidget.right + this.movement.x;
            const top = this.movement.startWidget.top + this.movement.y;
            const bottom = this.movement.startWidget.bottom + this.movement.y;
            for (const wid in this.widgetsRefs) {
                if (wid === this.props.selectedWidgets[0]) {
                    continue;
                }
                const widgetRect = this.widgetsRefs[wid].refService.current.getBoundingClientRect();

                if (Math.abs(widgetRect.top - bottom) <= 10 && left <= widgetRect.right && right >= widgetRect.left) {
                    this.movement.y += Math.round(widgetRect.top - bottom);
                    break;
                }
                if (Math.abs(widgetRect.bottom - top) <= 10 && left <= widgetRect.right && right >= widgetRect.left) {
                    this.movement.y += Math.round(widgetRect.bottom - top);
                    break;
                }
                if (Math.abs(widgetRect.left - right) <= 10 && top <= widgetRect.bottom && bottom >= widgetRect.top) {
                    this.movement.x += Math.round(widgetRect.left - right);
                    break;
                }
                if (Math.abs(widgetRect.right - left) <= 10 && top <= widgetRect.bottom && bottom >= widgetRect.top) {
                    this.movement.x += Math.round(widgetRect.right - left);
                    break;
                }
            }
        }

        const verticals = [];
        const horizontals = [];
        const rulers = [];

        Object.keys(this.widgetsRefs).forEach(wid => {
            if (!this.props.selectedWidgets.includes(wid)) {
                const boundingRect = this.widgetsRefs[wid].refService.current.getBoundingClientRect();
                horizontals.push(Math.round(boundingRect.top));
                horizontals.push(Math.round(boundingRect.bottom));
                verticals.push(Math.round(boundingRect.left));
                verticals.push(Math.round(boundingRect.right));
            }
        });
        const selectedHorizontals = [];
        const selectedVerticals = [];
        this.props.selectedWidgets.forEach(wid => {
            const boundingRect = this.widgetsRefs[wid].refService.current.getBoundingClientRect();
            selectedHorizontals.push(Math.round(boundingRect.top));
            selectedHorizontals.push(Math.round(boundingRect.bottom));
            selectedVerticals.push(Math.round(boundingRect.left));
            selectedVerticals.push(Math.round(boundingRect.right));
        });
        horizontals.forEach(horizontal => selectedHorizontals.forEach(selectedHorizontal => {
            if (Math.abs(horizontal - selectedHorizontal) <= 4) {
                rulers.push({ type: 'horizontal', value: horizontal - viewRect.top });
            }
        }));
        verticals.forEach(vertical => selectedVerticals.forEach(selectedVertical => {
            if (Math.abs(vertical - selectedVertical) <= 4) {
                rulers.push({ type: 'vertical', value: vertical - viewRect.left });
            }
        }));
        this.setState({ rulers });

        this.props.selectedWidgets.forEach(wid => {
            const widgetsRefs = this.widgetsRefs;
            if (widgetsRefs[wid]?.onMove) {
                widgetsRefs[wid].onMove(this.movement.x, this.movement.y, false, this.calculateRelativeWidgetPosition);
            }
        });
    } : null;

    onMouseWidgetUp = !this.props.runtime ? e => {
        e && e.stopPropagation();
        this.refView.current?.removeEventListener('mousemove', this.onMouseWidgetMove);
        window.document.removeEventListener('mouseup', this.onMouseWidgetUp);

        if (this.movement.moved) {
            this.props.selectedWidgets.forEach(wid => {
                if (this.widgetsRefs[wid]?.onMove) {
                    this.widgetsRefs[wid]?.onMove(this.movement.x, this.movement.y, true); // indicate end of movement
                }
            });
        }

        // Indicate about movement start
        Object.keys(this.widgetsRefs).forEach(_wid => {
            if (this.widgetsRefs[_wid]?.onCommand) {
                this.widgetsRefs[_wid].onCommand('stopMove');
            }
        });

        this.setState({ rulers: [] });
    } : null;

    editWidgetsRect(widget) {
        const viewLeft = this.refView.current.offsetLeft;
        const viewTop = this.refView.current.offsetTop;

        // find common coordinates
        const ref = this.widgetsRefs[widget].widDiv || this.widgetsRefs[widget].refService?.current;

        if (!ref) {
            return null;
        }
        let top  = ref.offsetTop - viewTop;
        let left = ref.offsetLeft - viewLeft;
        // May be bug?
        if (!left && !top) {
            const style = this.props.views[this.props.view].widgets[widget].style;
            left = parseInt(style?.left || '0', 10) + parseInt(ref.offsetLeft, 10);
            top  = parseInt(style?.top  || '0', 10) + parseInt(ref.offsetTop, 10);
            left = left || 0;
            top  = top || 0;
        }

        return {
            top,
            left,
            width:  ref.clientWidth,
            height: ref.clientHeight,
        };
    }

    pxToPercent = (oldStyle, newStyle) => {
        const pRect = {};
        pRect.left   = this.refView.current.clientLeft;
        pRect.top    = this.refView.current.clientTop;
        pRect.height = this.refView.current.clientHeight;
        pRect.width  = this.refView.current.clientWidth;

        const resultStyle = { ...newStyle };
        if (newStyle.top && parseDimension(oldStyle.top).dimension === '%' && parseDimension(newStyle.top).dimension !== '%') {
            resultStyle.top    = (parseDimension(newStyle.top).value  * 100) / pRect.height;
            resultStyle.top    = `${Math.round(resultStyle.top * 100) / 100}%`;
        }
        if (newStyle.left && parseDimension(oldStyle.left).dimension === '%' && parseDimension(newStyle.left).dimension !== '%') {
            resultStyle.left   = (parseDimension(newStyle.left).value * 100) / pRect.width;
            resultStyle.left   = `${Math.round(resultStyle.left * 100) / 100}%`;
        }
        if (newStyle.width && parseDimension(oldStyle.width).dimension === '%' && parseDimension(newStyle.width).dimension !== '%') {
            resultStyle.width  = (parseDimension(newStyle.width).value  / pRect.width)  * 100;
            resultStyle.width  = `${Math.round(resultStyle.width * 100) / 100}%`;
        }
        if (newStyle.height && parseDimension(oldStyle.height).dimension === '%' && parseDimension(newStyle.height).dimension !== '%') {
            resultStyle.height = (parseDimension(newStyle.height).value / pRect.height) * 100;
            resultStyle.height = `${Math.round(resultStyle.height * 100) / 100}%`;
        }
        return { ...oldStyle, ...resultStyle };
    }

    onPxToPercent = (wids, attr, cb) => {
        const pRect = {};
        pRect.left   = this.refView.current.clientLeft;
        pRect.top    = this.refView.current.clientTop;
        pRect.height = this.refView.current.clientHeight;
        pRect.width  = this.refView.current.clientWidth;

        const results = wids.map(wid => {
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
            wRect.top    = (wRect.top  * 100) / pRect.height;
            wRect.left   = (wRect.left * 100) / pRect.width;
            wRect.width  = (wRect.width  / pRect.width)  * 100;
            wRect.height = (wRect.height / pRect.height) * 100;
            wRect.top    = `${Math.round(wRect.top * 100) / 100}%`;
            wRect.left   = `${Math.round(wRect.left * 100) / 100}%`;
            wRect.width  = `${Math.round(wRect.width * 100) / 100}%`;
            wRect.height = `${Math.round(wRect.height * 100) / 100}%`;

            return wRect[attr];
        });

        cb && cb(results);

        return results;
    }

    onPercentToPx = (wids, attr, cb) => {
        const results = wids.map(wid => {
            const wRect = this.editWidgetsRect(wid);
            if (!wRect) {
                return null;
            }

            wRect.top    = `${Math.round(wRect.top)}px`;
            wRect.left   = `${Math.round(wRect.left)}px`;
            wRect.width  = `${Math.round(wRect.width)}px`;
            wRect.height = `${Math.round(wRect.height)}px`;
            return wRect[attr];
        });

        cb && cb(results);

        return results;
    }

    onKeyPress = e => {
        console.log(e.key);
    }

    registerEditorHandlers(unregister) {
        if (this.props.registerEditorCallback) {
            if (!unregister && this.props.activeView === this.props.view) {
                if (!this.regsiterDone) {
                    this.regsiterDone = true;
                    this.props.registerEditorCallback('onStealStyle', this.props.view, this.onStealStyle);
                    this.props.registerEditorCallback('onPxToPercent', this.props.view, this.onPxToPercent);
                    this.props.registerEditorCallback('pxToPercent', this.props.view, this.pxToPercent);
                    this.props.registerEditorCallback('onPercentToPx', this.props.view, this.onPercentToPx);
                }
            } else {
                this.regsiterDone = false;
                this.props.registerEditorCallback('onStealStyle', this.props.view);
                this.props.registerEditorCallback('onPxToPercent', this.props.view);
                this.props.registerEditorCallback('pxToPercent', this.props.view);
                this.props.registerEditorCallback('onPercentToPx', this.props.view);
            }
        }
    }

    componentDidUpdate() {
        this.registerEditorHandlers();
    }

    static renderGitter(step, color) {
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

        return <div
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
        />;
    }

    static getOneWidget(props, index, id, widget, registerRef, refAbsoluteView, refRelativeView, onMouseWidgetDown, relativeWidgetOrder, moveAllowed) {
        const isRelative = widget.style && (
            widget.style.position === 'relative' ||
            widget.style.position === 'static' ||
            widget.style.position === 'sticky'
        );

        const Widget = VisView.widgets[widget.tpl] || VisCanWidget;

        const _props = {
            key: `${index}_${id}`,
            id,
            view: props.view,
            views: props.views,
            userGroups: props.userGroups,
            editMode: props.editMode,
            user: props.user,
            allWidgets: props.allWidgets,
            socket: props.socket,
            isRelative,
            viewsActiveFilter: props.viewsActiveFilter,
            setValue: props.setValue,
            refParent: isRelative ? refRelativeView : refAbsoluteView,
            linkContext: props.linkContext,
            formatUtils: props.formatUtils,
            selectedWidgets: this.movement?.selectedWidgetsWithRectangle || props.selectedWidgets,
            setSelectedWidgets: props.setSelectedWidgets,
            runtime: props.runtime,
            mouseDownOnView: onMouseWidgetDown,
            registerRef: props.runtime ? null : registerRef,
            onWidgetsChanged: props.onWidgetsChanged,
            showWidgetNames: props.showWidgetNames,
            adapterName: props.adapterName,
            instance: props.instance,
            projectName: props.projectName,
            relativeWidgetOrder,
            moveAllowed,
            selectedGroup: props.selectedGroup,
            VisView,
        };

        // we must add it because of view in widget
        _props.can = props.can;
        _props.canStates = props.canStates;
        _props.jQuery = props.jQuery;
        _props.$$ = props.$$;

        const rxWidget = <Widget {..._props} />;

        return { rxWidget, isRelative };
    }

    loadJqueryTheme(jQueryTheme) {
        if (this.loadedjQueryTheme) {
            // unload old
            let style = this.refView.current.querySelector(`#${this.props.view}_style`);
            if (style) {
                style.remove();
                style = null;
            }
        }
        this.loadedjQueryTheme = jQueryTheme;

        return fetch(`../../lib/css/themes/jquery-ui/${this.loadedjQueryTheme}/jquery-ui.min.css`)
            .then(resp => resp.text())
            .then(data => {
                const _view = `visview_${this.props.view.replace(/\s/g, '_')}`;
                data = data.replace('.ui-helper-hidden', `#${_view} .ui-helper-hidden`);
                data = data.replace(/(}.)/g, `}#${_view} .`);
                data = data.replace(/,\./g, `,#${_view} .`);
                data = data.replace(/images/g, `../../lib/css/themes/jquery-ui/${this.loadedjQueryTheme}/images`);

                const style = window.document.createElement('style');
                style.innerHTML = data;
                style.setAttribute('id', `${this.props.view.replace(/\s/g, '_')}_style`);
                this.refView.current.prepend(style);
            })
            .catch(error => console.warn(`Cannot load jQueryUI theme "${this.loadedjQueryTheme}": ${error}`));
    }

    render() {
        const rxAbsoluteWidgets = [];
        const rxRelativeWidgets = [];

        if (!this.props.views || !this.props.view || !this.props.views[this.props.view]) {
            return null;
        }

        // wait till view has real div (ref), because of CanJS widgets. they really need a DOM div
        if (this.state.mounted) {
            // save initial filter
            this.props.viewsActiveFilter[this.props.view] = (this.props.views[this.props.view].settings.filterkey || '').split(',').map(f => f.trim()).filter(f => f);
            const widgets = this.props.views[this.props.view].widgets;
            let moveAllowed = true;
            if (widgets) {
                const relativeWidgetOrder = this.props.views[this.props.view].settings?.order || [];
                const relativeWidgets = [];
                const absoluteWidgets = [];
                const unknownWidgets = [];

                if (this.props.editMode && this.props.selectedWidgets?.length) {
                    this.props.selectedWidgets.forEach(id => {
                        const widget = this.props.views[this.props.view].widgets[id];
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
                    } else
                    // absolute and relative widgets cannot be moved together
                    if (relativeWidgets.length && absoluteWidgets.length) {
                        moveAllowed = false;
                    }
                }

                Object.keys(widgets).forEach(id => {
                    const widget = this.props.views[this.props.view].widgets[id];
                    if (!widget || (widget.grouped && !this.props.selectedGroup)) {
                        return;
                    }

                    if (this.props.selectedGroup) {
                        if (!(id === this.props.selectedGroup || widget.groupid === this.props.selectedGroup)) {
                            return;
                        }
                    }

                    const { rxWidget, isRelative } = VisView.getOneWidget(this.props, relativeWidgetOrder.indexOf(id), id, widget, this.registerRef, this.refView, this.refRelativeView, this.onMouseWidgetDown, relativeWidgetOrder, moveAllowed);

                    if (isRelative) {
                        if (!relativeWidgetOrder.includes(id)) {
                            relativeWidgetOrder.push(id);
                        }
                        rxRelativeWidgets.push({ id, rxWidget });
                    } else {
                        const pos = relativeWidgetOrder.indexOf(id);
                        if (pos !== -1) {
                            relativeWidgetOrder.splice(pos, 1);
                        }
                        rxAbsoluteWidgets.push(rxWidget);
                    }
                });

                for (let t = relativeWidgetOrder.length - 1; t >= 0; t--) {
                    if (!this.props.views[this.props.view].widgets[relativeWidgetOrder[t]]) {
                        relativeWidgetOrder.splice(t, 1);
                    }
                }

                // sort relative widgets according to order
                rxRelativeWidgets.sort((a, b) => {
                    const posA = relativeWidgetOrder.indexOf(a.id);
                    const posB = relativeWidgetOrder.indexOf(b.id);
                    return posA - posB;
                });
            }
        }

        let className = 'vis-view';
        const relativeStyle = {};
        const style = {
            width: '100%',
            height: '100%',
        };

        const settings = this.props.views[this.props.view].settings;

        const jQueryTheme = settings?.theme || 'redmond';

        if (this.refView.current && this.loadedjQueryTheme !== jQueryTheme) {
            this.loadJqueryTheme(jQueryTheme)
                .then(() => {});
        }

        // this was only if this.props.editMode
        if (settings.sizex) {
            let ww = settings.sizex;
            let hh = settings.sizey;
            if (parseFloat(ww).toString() === ww.toString()) {
                ww = parseFloat(ww);
            }
            if (parseFloat(hh).toString() === hh.toString()) {
                hh = parseFloat(hh);
            }

            if (typeof ww === 'number' || ww.match(/\d$/)) {
                ww += 'px';
            }
            if (typeof hh === 'number' || hh.match(/\d$/)) {
                hh += 'px';
            }
            relativeStyle.width = ww;
            relativeStyle.height = hh;
        }

        relativeStyle.display = settings.style.display || 'flex';

        settings.style && Object.keys(settings.style).forEach(attr => {
            if (attr === 'background_class') {
                className = addClass(className, settings.style.background_class);
            } else {
                const value = settings.style[attr];
                // convert background-color => backgroundColor
                attr = attr.replace(/(-\w)/g, text => text[1].toUpperCase());
                style[attr] = value;
            }
        });

        if (this.props.view !== this.props.activeView) {
            style.display = 'none';
        }

        if (this.props.container) {
            style.overflow = 'hidden';
        }

        let gridDiv = null;
        if (this.props.views[this.props.view].settings.snapType === 2) {
            const gridStyle = {
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
            };
            gridStyle.backgroundSize = `${this.props.views[this.props.view].settings.gridSize}px ${this.props.views[this.props.view].settings.gridSize}px`;
            // // style.backgroundPosition = `${this.props.views[this.props.view].settings.gridSize / 2}px ${this.props.views[this.props.view].settings.gridSize / 2}px`;
            gridStyle.backgroundImage = 'radial-gradient(circle at 1px 1px, black 1px, rgba(0, 0, 0, 0) 1px), radial-gradient(circle at 2px 2px, white 1px, rgba(0, 0, 0, 0) 1px)';
            gridDiv = <div style={gridStyle}></div>;
        }

        return <div
            className={className}
            ref={this.refView}
            id={`visview_${this.props.view.replace(/\s/g, '_')}`}
            onMouseDown={!this.props.runtime ? e => this.props.editMode && this.onMouseViewDown(e) : undefined}
            style={style}
        >
            {gridDiv}
            { /* VisView.renderGitter() */ }
            {this.state.rulers.map((ruler, key) =>
                <div
                    key={key}
                    style={{
                        pointerEvents: 'none',
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
                ></div>)}
            <div ref={this.refRelativeView} style={relativeStyle}>
                { rxRelativeWidgets.map(item => item.rxWidget) }
            </div>
            { rxAbsoluteWidgets }
        </div>;
    }
}

VisView.propTypes = {
    views: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    activeView: PropTypes.string.isRequired,
    can: PropTypes.object.isRequired,
    canStates: PropTypes.object.isRequired,
    editMode: PropTypes.bool,
    user: PropTypes.string,
    userGroups: PropTypes.object,
    allWidgets: PropTypes.object,
    jQuery: PropTypes.func,
    socket: PropTypes.object,
    viewsActiveFilter: PropTypes.object,
    setValue: PropTypes.func,
    $$: PropTypes.func, // Gestures library
    linkContext: PropTypes.object,
    formatUtils: PropTypes.object,
    selectedWidgets: PropTypes.array,
    setSelectedWidgets: PropTypes.func,
    runtime: PropTypes.bool,
    onWidgetsChanged: PropTypes.func,
    showWidgetNames: PropTypes.bool,
    container: PropTypes.bool,
    registerEditorCallback: PropTypes.func,

    adapterName: PropTypes.string.isRequired,
    instance: PropTypes.number.isRequired,
    projectName: PropTypes.string.isRequired,
};

export default VisView;
