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

import {
    addClass,
    removeClass,
} from './visUtils';

class VisBaseWidget extends React.Component {
    static FORBIDDEN_CHARS = /[^._\-/ :!#$%&()+=@^{}|~]+/g; // from https://github.com/ioBroker/ioBroker.js-controller/blob/master/packages/common/lib/common/tools.js

    constructor(props) {
        super(props);

        const widget = this.props.views[this.props.view].widgets[this.props.id];
        this.refService = React.createRef();
        this.refName = React.createRef();
        this.resize = false;
        this.widDiv = null;

        const selected = this.props.editMode && this.props.selectedWidgets && this.props.selectedWidgets.includes(this.props.id);

        this.state = {
            data: JSON.parse(JSON.stringify(widget.data || {})),
            style: JSON.parse(JSON.stringify(widget.style || {})),
            // eslint-disable-next-line react/no-unused-state
            applyBindings: false,
            editMode: this.props.editMode,
            selected,
            selectedOne: selected && this.props.selectedWidgets.length === 1,
            resizable: true,
            resizeHandles: ['n', 'e', 's', 'w', 'nw', 'ne', 'sw', 'se'],
        };

        this.onCommandBound = this.onCommand.bind(this);
    }

    componentDidMount() {
        // register service ref by view for resize and move
        this.props.registerRef(this.props.id, this.widDiv, this.refService, this.onMove, this.onResize, this.onTempSelect, this.onCommandBound);
    }

    componentWillUnmount() {
        // delete service ref from view
        this.props.registerRef && this.props.registerRef(this.props.id);
        if (this.shadowDiv) {
            this.shadowDiv.remove();
            this.shadowDiv = null;
        }
    }

    // this method may be not in form onCommand = command => {}
    onCommand(command) {
        if (command === 'startStealMode') {
            this.stealCursor = this.refService.current.style.cursor || 'nocursor';
            this.refService.current.style.cursor = 'crosshair';
            this.refService.current.className = addClass(this.refService.current.className, 'vis-editmode-steal-style');
            const resizers = this.refService.current?.querySelectorAll('.vis-editmode-resizer');
            resizers?.forEach(item => item.style.display = 'none');
            return true;
        }

        if (command === 'cancelStealMode') {
            if (this.stealCursor !== 'nocursor') {
                this.refService.current.style.cursor = this.stealCursor;
            }
            this.stealCursor = null;
            this.refService.current.className = removeClass(this.refService.current.className, 'vis-editmode-steal-style');
            const resizers = this.refService.current?.querySelectorAll('.vis-editmode-resizer');
            resizers?.forEach(item => item.style.display = '');
            return true;
        }

        if (command === 'startMove' || command === 'startResize') {
            const overlay = this.refService.current?.querySelector('.vis-editmode-overlay');
            if (overlay) {
                if (this.state.selected) {
                    overlay.className = removeClass(overlay.className, 'vis-editmode-selected');
                } else {
                    overlay.className = removeClass(overlay.className, 'vis-editmode-overlay-not-selected');
                }
            }

            if (command === 'startResize') {
                this.resize = true;
            }
            return true;
        }

        if (command === 'stopMove' || command === 'stopResize') {
            const overlay = this.refService.current?.querySelector('.vis-editmode-overlay');
            if (overlay) {
                if (this.state.selected) {
                    overlay.className = addClass(overlay.className, 'vis-editmode-selected');
                } else {
                    overlay.className = addClass(overlay.className, 'vis-editmode-overlay-not-selected');
                }
            }
            if (command === 'stopResize') {
                this.resize = false;
            }
            return true;
        }

        return false;
    }

    static getDerivedStateFromProps(props, state) {
        const widget = props.views[props.view].widgets[props.id];

        if (JSON.stringify(widget.style || {}) !== JSON.stringify(state.style) ||
            JSON.stringify(widget.data || {}) !== JSON.stringify(state.data)
        ) {
            Object.keys(state.style).forEach(attr => {
                if (state.style[attr] !== widget.style[attr]) {
                    console.log(`[${Date.now()}] Rerender because of ${attr}: ${state.style[attr]} !== ${widget.style[attr]}`);
                }
            });
            const data = JSON.parse(JSON.stringify(widget.data || {}));
            // detect for CanWidgets if size was changed
            const style = JSON.parse(JSON.stringify(widget.style || {}));

            // replace all _PRJ_NAME with vis.0/name
            Object.keys(data).forEach(attr => {
                if (attr && data[attr] && typeof data[attr] === 'string' && (attr.startsWith('src') || attr.endsWith('src') || attr.includes('icon')) && data[attr].startsWith('_PRJ_NAME')) {
                    // "_PRJ_NAME".length = 9
                    data[attr] = `${props.adapterName}.${props.instance}/${props.projectName}${data[attr].substring(9)}`;
                }
            });

            Object.keys(style).forEach(attr => {
                if (attr === 'background-image' && style[attr] && style[attr].startsWith('_PRJ_NAME')) {
                    // "_PRJ_NAME".length = 9
                    style[attr] = `${props.adapterName}.${props.instance}/${props.projectName}${style[attr].substring(9)}`;
                }
            });

            return {
                style,
                data,
                applyBindings: { top: widget.style.top, left: widget.style.left },
            };
        }

        if (props.editMode !== state.editMode) {
            return { editMode: props.editMode, applyBindings: true };
        }

        const selected = props.editMode && props.selectedWidgets && props.selectedWidgets.includes(props.id);
        const selectedOne = selected && props.selectedWidgets.length === 1;

        if (selected !== state.selected || selectedOne !== state.selectedOne) {
            return { selected, selectedOne };
        }

        return null; // No change to state
    }

    static removeFromArray(items, IDs, view, widget) {
        items && Object.keys(items).forEach(id => {
            if (!IDs || IDs.includes(id)) {
                for (let i = items[id].length - 1; i >= 0; i--) {
                    const item = items[id][i];
                    if (item.view === view && item.widget === widget) {
                        items[id].splice(i, 1);
                    }
                }
            }
        });
    }

    static parseStyle(style, isRxStyle) {
        const result = {};
        // style is a string
        // "height: 10; width: 20"
        (style || '').split(';').forEach(part => {
            part = part.trim();
            if (part) {
                let [attr, value] = part.split(':');
                attr = attr.trim();
                if (attr && value) {
                    value = value.trim();
                    if (!isRxStyle && (attr === 'top' || attr === 'left' || attr === 'width' || attr === 'height')) {
                        if (!isRxStyle) {
                            if (value !== '0' && value.match(/^[-+]?\d+$/)) {
                                value = `${value}px`;
                            }
                        } else {
                            const f = parseFloat(value);
                            if (value === f.toString()) {
                                value = f;
                            }
                        }
                    }

                    if (value) {
                        if (isRxStyle) {
                            attr = attr.replace(/(-\w)/, text => text[1].toUpperCase());
                        }

                        result[attr] = value;
                    }
                }
            }
        });

        return result;
    }

    onMouseDown(e) {
        e.stopPropagation();
        if (this.stealCursor) {
            this.props.mouseDownOnView(e, this.props.id, this.props.isRelative);
            return;
        }
        if (this.props.views[this.props.view].widgets[this.props.id].data.locked) {
            return;
        }
        if (!this.props.selectedWidgets.includes(this.props.id)) {
            if (e.shiftKey || e.ctrlKey) {
                // add or remove
                const pos = this.props.selectedWidgets.indexOf(this.props.id);
                if (pos === -1) {
                    const selectedWidgets = [...this.props.selectedWidgets, this.props.id];
                    this.props.setSelectedWidgets(selectedWidgets);
                } else {
                    const selectedWidgets = [...this.props.selectedWidgets];
                    selectedWidgets.splice(pos, 1);
                    this.props.setSelectedWidgets(selectedWidgets);
                }
            } else {
                // set select
                this.props.setSelectedWidgets([this.props.id]);
            }
        } else if (this.props.moveAllowed && this.state.draggable !== false) {
            // User can drag only objects of the same type
            this.props.mouseDownOnView(e, this.props.id, this.props.isRelative);
        }
    }

    createWidgetMovementShadow() {
        if (this.shadowDiv) {
            this.shadowDiv.remove();
            this.shadowDiv = null;
        }
        this.shadowDiv = window.document.createElement('div');
        this.shadowDiv.setAttribute('id', `${this.props.id}_shadow`);
        this.shadowDiv.className = 'vis-editmode-widget-shadow';
        this.shadowDiv.style.width = `${this.refService.current.clientWidth}px`;
        this.shadowDiv.style.height = `${this.refService.current.clientHeight}px`;
        if (this.refService.current.style.borderRadius) {
            this.shadowDiv.style.borderRadius = this.refService.current.style.borderRadius;
        }

        let parentDiv = this.props.refParent;
        if (Object.prototype.hasOwnProperty.call(parentDiv, 'current')) {
            parentDiv = parentDiv.current;
        }

        if (this.widDiv) {
            parentDiv.insertBefore(this.shadowDiv, this.widDiv);
            this.widDiv.style.position = 'absolute';
            this.widDiv.style.left = `${this.movement.left}px`;
            this.widDiv.style.top = `${this.movement.top}px`;
        } else {
            parentDiv.insertBefore(this.shadowDiv, this.refService.current);
            this.refService.current.style.position = 'absolute';
        }
        this.refService.current.style.left = `${this.movement.left}px`;
        this.refService.current.style.top = `${this.movement.top}px`;
    }

    onMove = (x, y, save, calculateRelativeWidgetPosition) => {
        if (this.resize) {
            if (this.state.resizable === false) {
                return;
            }
            if (x === undefined) {
                // start of resizing
                const rect = (this.widDiv || this.refService.current).getBoundingClientRect();

                this.movement = {
                    top: this.refService.current.offsetTop,
                    left: this.refService.current.offsetLeft,
                    width: rect.width,
                    height: rect.height,
                };
                const resizers = this.refService.current.querySelectorAll('.vis-editmode-resizer');
                resizers.forEach(item => item.style.opacity = 0.2);
            } else if (this.resize === 'top') {
                this.refService.current.style.top = `${this.movement.top + y}px`;
                this.refService.current.style.height = `${this.movement.height - y}px`;
                if (this.widDiv) {
                    this.widDiv.style.top = `${this.movement.top + y}px`;
                    this.widDiv.style.height = `${this.movement.height - y}px`;
                }
            } else if (this.resize === 'bottom') {
                this.refService.current.style.height = `${this.movement.height + y}px`;
                this.widDiv && (this.widDiv.style.height = `${this.movement.height + y}px`);
            } else if (this.resize === 'left') {
                this.refService.current.style.left = `${this.movement.left + x}px`;
                this.refService.current.style.width = `${this.movement.width - x}px`;
                if (this.widDiv) {
                    this.widDiv.style.left = `${this.movement.left + x}px`;
                    this.widDiv.style.width = `${this.movement.width - x}px`;
                }
            } else if (this.resize === 'right') {
                this.refService.current.style.width = `${this.movement.width + x}px`;
                this.widDiv && (this.widDiv.style.width = `${this.movement.width + x}px`);
            } else if (this.resize === 'top-left') {
                this.refService.current.style.top = `${this.movement.top + y}px`;
                this.refService.current.style.left = `${this.movement.left + x}px`;
                this.refService.current.style.height = `${this.movement.height - y}px`;
                this.refService.current.style.width = `${this.movement.width - x}px`;
                if (this.widDiv) {
                    this.widDiv.style.top = `${this.movement.top + y}px`;
                    this.widDiv.style.left = `${this.movement.left + x}px`;
                    this.widDiv.style.height = `${this.movement.height - y}px`;
                    this.widDiv.style.width = `${this.movement.width - x}px`;
                }
            } else if (this.resize === 'top-right') {
                this.refService.current.style.top = `${this.movement.top + y}px`;
                this.refService.current.style.height = `${this.movement.height - y}px`;
                this.refService.current.style.width = `${this.movement.width + x}px`;
                if (this.widDiv) {
                    this.widDiv.style.top = `${this.movement.top + y}px`;
                    this.widDiv.style.height = `${this.movement.height - y}px`;
                    this.widDiv.style.width = `${this.movement.width + x}px`;
                }
            } else if (this.resize === 'bottom-left') {
                this.refService.current.style.left = `${this.movement.left + x}px`;
                this.refService.current.style.height = `${this.movement.height + y}px`;
                this.refService.current.style.width = `${this.movement.width - x}px`;
                if (this.widDiv) {
                    this.widDiv.style.left = `${this.movement.left + x}px`;
                    this.widDiv.style.height = `${this.movement.height + y}px`;
                    this.widDiv.style.width = `${this.movement.width - x}px`;
                }
            } else { // bottom-right
                this.refService.current.style.height = `${this.movement.height + y}px`;
                this.refService.current.style.width = `${this.movement.width + x}px`;
                if (this.widDiv) {
                    this.widDiv.style.height = `${this.movement.height + y}px`;
                    this.widDiv.style.width = `${this.movement.width + x}px`;
                }
            }

            // end of resize
            if (save) {
                const resizers = this.refService.current.querySelectorAll('.vis-editmode-resizer');
                resizers.forEach(item => item.style.opacity = 0.3);
                this.resize = false;
                this.props.onWidgetsChanged && this.props.onWidgetsChanged([{
                    wid: this.props.id,
                    view: this.props.view,
                    style: {
                        top: this.refService.current.style.top,
                        left: this.refService.current.style.left,
                        width: this.refService.current.style.width,
                        height: this.refService.current.style.height,
                    },
                }]);

                this.movement = null;
            }
        } else if (x === undefined) {
            if (this.state.draggable === false) {
                return;
            }

            // initiate movement
            this.movement = {
                top: this.refService.current.offsetTop,
                left: this.refService.current.offsetLeft,
                order: [...this.props.relativeWidgetOrder],
            };

            // hide resizers
            const resizers = this.refService.current.querySelectorAll('.vis-editmode-resizer');
            resizers.forEach(item => item.style.display = 'none');

            if (this.props.isRelative) {
                // create shadow widget
                this.createWidgetMovementShadow();
            }
        } else if (this.movement) {
            // move widget
            const left = `${this.movement.left + x}px`;
            const top = `${this.movement.top + y}px`;

            this.refService.current.style.left = left;
            this.refService.current.style.top = top;

            if (this.widDiv) {
                this.widDiv.style.left = left;
                this.widDiv.style.top = top;

                if (this.widDiv._customHandlers && this.widDiv._customHandlers.onMove) {
                    this.widDiv._customHandlers.onMove(this.widDiv, this.props.id);
                }
            }

            if (this.props.isRelative && calculateRelativeWidgetPosition) {
                // calculate widget position
                calculateRelativeWidgetPosition(this.props.id, left, top, this.shadowDiv, this.movement.order);
            }
            console.log(this.movement.order.join(', '));

            // End of movement
            if (save) {
                // show resizers
                const resizers = this.refService.current.querySelectorAll('.vis-editmode-resizer');
                resizers.forEach(item => item.style.display = 'block');

                if (this.props.isRelative) {
                    let parentDiv = this.props.refParent;
                    if (Object.prototype.hasOwnProperty.call(parentDiv, 'current')) {
                        parentDiv = parentDiv.current;
                    }
                    // create shadow widget
                    if (this.widDiv) {
                        this.widDiv.style.position = 'relative';
                        this.widDiv.style.top = 0;
                        this.widDiv.style.left = 0;
                        parentDiv.insertBefore(this.widDiv, this.shadowDiv);
                        this.refService.current.style.top = `${this.widDiv.offsetTop}px`;
                        this.refService.current.style.left = `${this.widDiv.offsetLeft}px`;
                    } else {
                        parentDiv.insertBefore(this.refService.current, this.shadowDiv);
                        this.refService.current.style.position = 'relative';
                        this.refService.current.style.top = 0;
                        this.refService.current.style.left = 0;
                    }
                    this.shadowDiv.remove();
                    this.shadowDiv = null;

                    this.props.onWidgetsChanged && this.props.onWidgetsChanged([{
                        wid: this.props.id,
                        view: this.props.view,
                        style: {
                            left: null,
                            top: null,
                        },
                    }], this.props.view, { order: this.movement.order });
                } else {
                    this.props.onWidgetsChanged && this.props.onWidgetsChanged([{
                        wid: this.props.id,
                        view: this.props.view,
                        style: {
                            left: this.movement.left + x,
                            top: this.movement.top + y,
                        },
                    }]);
                }

                this.movement = null;
            }
        }
    }

    onTempSelect = selected => {
        const ref = this.refService.current?.querySelector('.vis-editmode-overlay');
        if (!ref) {
            return;
        }
        if (selected === null || selected === undefined)  {
            // restore original state
            if (this.props.selectedWidgets.includes(this.props.id)) {
                if (!ref.className.includes('vis-editmode-selected')) {
                    ref.className = addClass('vis-editmode-selected', ref.className);
                }
            } else {
                ref.style.backgroundColor = '';
                ref.className = removeClass(ref.className, 'vis-editmode-selected');
            }
        } else if (selected) {
            if (!ref.className.includes('vis-editmode-selected')) {
                ref.className = addClass('vis-editmode-selected', ref.className);
            }
        } else {
            ref.className = removeClass(ref.className, 'vis-editmode-selected');
        }
    }

    onResizeStart(e, type) {
        e.stopPropagation();
        this.resize = type;
        this.props.mouseDownOnView(e, this.props.id, this.props.isRelative, true);
    }

    getResizeHandlers() {
        if (!this.state.resizable) {
            return null;
        }
        const thickness = 0.4;
        const shift = 0.15;
        const square = 0.4;

        const squareShift = `${shift - square}em`;
        const squareWidthHeight = `${square}em`;
        const shiftEm = `${shift}em`;
        const thicknessEm = `${thickness}em`;
        const offsetEm = `${shift - thickness}em`;
        return [
            // top
            !this.props.isRelative && this.state.resizeHandles.includes('n') ? <div
                key="top"
                className="vis-editmode-resizer"
                style={{
                    position: 'absolute',
                    top: offsetEm,
                    height: thicknessEm,
                    left: shiftEm,
                    right: shiftEm,
                    cursor: 'ns-resize',
                    zIndex: 1001,
                    background: 'blue',
                    opacity: 0.3,
                }}
                onMouseDown={e => this.onResizeStart(e, 'top')}
            /> : null,
            // bottom
            this.state.resizeHandles.includes('s') ? <div
                key="bottom"
                className="vis-editmode-resizer"
                style={{
                    position: 'absolute',
                    bottom: offsetEm,
                    height: thicknessEm,
                    left:  shiftEm,
                    right:  shiftEm,
                    cursor: 'ns-resize',
                    zIndex: 1001,
                    background: 'blue',
                    opacity: 0.3,
                }}
                onMouseDown={e => this.onResizeStart(e, 'bottom')}
            /> : null,
            // left
            !this.props.isRelative && this.state.resizeHandles.includes('w') ? <div
                key="left"
                className="vis-editmode-resizer"
                style={{
                    position: 'absolute',
                    top: shiftEm,
                    bottom: shiftEm,
                    left: offsetEm,
                    width: thicknessEm,
                    cursor: 'ew-resize',
                    zIndex: 1001,
                    background: 'blue',
                    opacity: 0.3,
                }}
                onMouseDown={e => this.onResizeStart(e, 'left')}
            /> : null,
            // right
            this.state.resizeHandles.includes('e') ? <div
                key="right"
                className="vis-editmode-resizer"
                style={{
                    position: 'absolute',
                    top: shiftEm,
                    bottom: shiftEm,
                    right: offsetEm,
                    width: thicknessEm,
                    cursor: 'ew-resize',
                    zIndex: 1001,
                    background: 'blue',
                    opacity: 0.3,
                }}
                onMouseDown={e => this.onResizeStart(e, 'right')}
            /> : null,
            // top left
            !this.props.isRelative && this.state.resizeHandles.includes('nw') ? <div
                key="top-left"
                className="vis-editmode-resizer"
                style={{
                    position: 'absolute',
                    top: squareShift,
                    height: squareWidthHeight,
                    left: squareShift,
                    width: squareWidthHeight,
                    cursor: 'nwse-resize',
                    zIndex: 1001,
                    background: 'blue',
                    opacity: 0.3,
                }}
                onMouseDown={e => this.onResizeStart(e, 'top-left')}
            /> : null,
            // top right
            !this.props.isRelative && this.state.resizeHandles.includes('ne') ? <div
                key="top-right"
                className="vis-editmode-resizer"
                style={{
                    position: 'absolute',
                    top: squareShift,
                    height: squareWidthHeight,
                    right: squareShift,
                    width: squareWidthHeight,
                    cursor: 'nesw-resize',
                    zIndex: 1001,
                    background: 'blue',
                    opacity: 0.3,
                }}
                onMouseDown={e => this.onResizeStart(e, 'top-right')}
            /> : null,
            // bottom left
            !this.props.isRelative && this.state.resizeHandles.includes('sw') ? <div
                key="bottom-left"
                className="vis-editmode-resizer"
                style={{
                    position: 'absolute',
                    bottom: squareShift,
                    height: squareWidthHeight,
                    left: squareShift,
                    width: squareWidthHeight,
                    cursor: 'nesw-resize',
                    zIndex: 1001,
                    background: 'blue',
                    opacity: 0.3,
                }}
                onMouseDown={e => this.onResizeStart(e, 'bottom-left')}
            /> : null,
            // bottom right
            this.state.resizeHandles.includes('se') ? <div
                key="bottom-right"
                className="vis-editmode-resizer"
                style={{
                    position: 'absolute',
                    bottom: squareShift,
                    height: squareWidthHeight,
                    right: squareShift,
                    width: squareWidthHeight,
                    cursor: 'nwse-resize',
                    zIndex: 1001,
                    background: 'blue',
                    opacity: 0.3,
                }}
                onMouseDown={e => this.onResizeStart(e, 'bottom-right')}
            /> : null,
        ];
    }

    isUserMemberOfGroup(user, userGroups) {
        if (!userGroups) {
            return true;
        }
        if (!Array.isArray(userGroups)) {
            userGroups = [userGroups];
        }

        return !!userGroups.find(groupId => {
            const group = this.props.userGroups[`system.group.${groupId}`];
            return group?.common?.members?.length && group.common.members.includes(`system.user.${user}`);
        });
    }

    isWidgetFilteredOut(widgetData) {
        const vf = this.props.viewsActiveFilter[this.props.view];
        if (widgetData?.filterkey && vf?.length) {
            if (vf[0] === '$') {
                return true;
            }

            // we cannot use here find as filterkey could be observable (can) and is not normal array
            for (let f = 0; f < widgetData.filterkey.length; f++) {
                if (vf.includes(widgetData.filterkey[f])) {
                    return false;
                }
            }
            return true;
        }

        return false;
    }

    isWidgetHidden(widgetData, states) {
        const oid = widgetData['visibility-oid'];
        const condition = widgetData['visibility-cond'];

        if (oid) {
            let val = states[`${oid}.val`];

            if (val === undefined || val === null) {
                return condition === 'not exist';
            }

            let value = widgetData['visibility-val'];

            if (!condition || value === undefined || value === null) {
                return condition === 'not exist';
            }

            if (val === 'null' && condition !== 'exist' && condition !== 'not exist') {
                return false;
            }

            const t = typeof val;
            if (t === 'boolean' || val === 'false' || val === 'true') {
                value = value === 'true' || value === true || value === 1 || value === '1';
            } else
            if (t === 'number') {
                value = parseFloat(value);
            } else
            if (t === 'object') {
                val = JSON.stringify(val);
            }

            // Take care: return true if widget is hidden!
            switch (condition) {
                case '==':
                    value = value.toString();
                    val = val.toString();
                    if (val === '1') val = 'true';
                    if (value === '1') value = 'true';
                    if (val === '0') val = 'false';
                    if (value === '0') value = 'false';
                    return value !== val;
                case '!=':
                    value = value.toString();
                    val = val.toString();
                    if (val === '1') val = 'true';
                    if (value === '1') value = 'true';
                    if (val === '0') val = 'false';
                    if (value === '0') value = 'false';
                    return value === val;
                case '>=':
                    return val < value;
                case '<=':
                    return val > value;
                case '>':
                    return val <= value;
                case '<':
                    return val >= value;
                case 'consist':
                    value = value.toString();
                    val = val.toString();
                    return !val.toString().includes(value);
                case 'not consist':
                    value = value.toString();
                    val = val.toString();
                    return val.toString().includes(value);
                case 'exist':
                    return val === 'null';
                case 'not exist':
                    return val !== 'null';
                default:
                    console.log(`[${this.props.id}] Unknown visibility condition: ${condition}`);
                    return false;
            }
        } else {
            return condition && condition === 'not exist';
        }
    }

    // eslint-disable-next-line class-methods-use-this,no-unused-vars
    renderWidgetBody(classNames, style) {
        return <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}><pre>{ JSON.stringify(this.state.data, null, 2) }</pre></div>;
    }

    changeOrder(e, dir) {
        e.stopPropagation();

        const order = [...this.props.relativeWidgetOrder];
        const pos = order.indexOf(this.props.id);
        if (dir > 0) {
            if (pos === order.length - 1) {
                return;
            }
            const nextId = order[pos + 1];
            order[pos + 1] = this.props.id;
            order[pos] = nextId;
        } else if (!pos) {
            return;
        } else {
            const nextId = order[pos - 1];
            order[pos - 1] = this.props.id;
            order[pos] = nextId;
        }

        this.props.onWidgetsChanged(null, this.props.view, { order });
    }

    render() {
        const widget = this.props.views[this.props.view].widgets[this.props.id];
        if (!widget || typeof widget !== 'object') {
            console.error(`EMPTY Widget: ${this.props.id}`);
            return null;
        }

        const style = {};
        const selected = this.state.editMode && this.props.selectedWidgets?.includes(this.props.id);
        let classNames = selected ? 'vis-editmode-selected' : 'vis-editmode-overlay-not-selected';

        if (this.state.editMode && !(widget.groupid && !this.props.selectedGroup)) {
            if (!this.props.isRelative && Object.prototype.hasOwnProperty.call(this.state.style, 'top')) {
                style.top = this.state.style.top;
            }
            if (!this.props.isRelative && Object.prototype.hasOwnProperty.call(this.state.style, 'left')) {
                style.left = this.state.style.left;
            }
            if (Object.prototype.hasOwnProperty.call(this.state.style, 'width')) {
                style.width = this.state.style.width;
            }
            if (Object.prototype.hasOwnProperty.call(this.state.style, 'height')) {
                style.height = this.state.style.height;
            }
            if (!this.props.isRelative && Object.prototype.hasOwnProperty.call(this.state.style, 'right')) {
                style.right = this.state.style.right;
            }
            if (!this.props.isRelative && Object.prototype.hasOwnProperty.call(this.state.style, 'bottom')) {
                style.bottom = this.state.style.bottom;
            }

            style.position = this.props.isRelative ? 'relative' : 'absolute';
            style.userSelect = 'none';

            if (selected) {
                if (this.props.moveAllowed && this.state.draggable !== false) {
                    style.cursor = 'move';
                } else {
                    style.cursor = 'default';
                }
            } else if (widget.data?.locked) {
                style.cursor = 'default';
            } else {
                style.cursor = 'pointer';
            }

            if (widget.tpl && widget.tpl.toLowerCase().includes('image')) {
                classNames = addClass(classNames, 'vis-editmode-helper');
                style.opacity = style.opacity || 0.3;
            }
        }

        const props = {
            className: '',
            style,
            id: `rx_${this.props.id}`,
            refService: this.refService,
        };

        const rxWidget = this.renderWidgetBody(props);
        if (this.props.id === this.props.selectedGroup) {
            style.top = 0;
            style.left = 0;
        }
        classNames = addClass(classNames, 'vis-editmode-overlay');

        let widgetName = null;
        if (this.props.widgetHint !== 'hide' && !this.state.hideHelper && this.state.editMode && !(widget.groupid && !this.props.selectedGroup) && this.props.showWidgetNames !== false) {
            widgetName = <div ref={this.refName} className={`vis-editmode-widget-name ${this.props.widgetHint}`}>{ this.props.id }</div>;
            style.overflow = 'visible';
        }

        const overlay = this.state.hideHelper || this.props.runtime || !this.state.editMode || (widget.groupid && !this.props.selectedGroup) || widget.data.locked ? null : <div
            className={classNames}
            onMouseDown={e => this.props.setSelectedWidgets && this.onMouseDown(e)}
        />;

        return <div
            id={props.id}
            className={props.className}
            ref={this.refService}
            style={props.style}
        >
            { widgetName }
            { overlay }
            { this.state.selectedOne ? this.getResizeHandlers() : null }
            { rxWidget }
        </div>;
    }
}

VisBaseWidget.propTypes = {
    id: PropTypes.string.isRequired,
    views: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool.isRequired,
    runtime: PropTypes.bool,
    registerRef: PropTypes.func.isRequired,
    userGroups: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    user: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    allWidgets: PropTypes.object.isRequired,
    isRelative: PropTypes.bool,
    viewsActiveFilter: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    linkContext: PropTypes.object.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    formatUtils: PropTypes.object,
    selectedWidgets: PropTypes.array,
    setSelectedWidgets: PropTypes.func,
    mouseDownOnView: PropTypes.func,
    onWidgetsChanged: PropTypes.func,
    showWidgetNames: PropTypes.bool,
    // eslint-disable-next-line react/no-unused-prop-types
    VisView: PropTypes.any,
    relativeWidgetOrder: PropTypes.array,
    moveAllowed: PropTypes.bool,

    // eslint-disable-next-line react/no-unused-prop-types
    editGroup: PropTypes.bool,
    // eslint-disable-next-line react/no-unused-prop-types
    setValue: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    socket: PropTypes.object.isRequired,

    // eslint-disable-next-line react/no-unused-prop-types
    adapterName: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    instance: PropTypes.number.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    projectName: PropTypes.string.isRequired,
};

export default VisBaseWidget;
