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
import { addClass } from './visUtils';
import BasicValueString from './Widgets/Basic/BasicValueString';
import BasicViewInWidget from './Widgets/Basic/BasicViewInWidget';
import BasicViewInWidget8 from './Widgets/Basic/BasicViewInWidget8';

const WIDGETS = [
    BasicValueString,
    BasicViewInWidget,
    BasicViewInWidget8,
];

// 1300 is the React dialog
class VisView extends React.Component {
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
    }

    componentDidMount() {
        this.props.linkContext.registerViewRef(this.props.view, this.refView, this.onCommand);

        this.setState({ mounted: true }, () =>
            this.registerEditorHandlers());
    }

    componentWillUnmount() {
        this.props.linkContext.unregisterViewRef(this.props.view, this.refView);

        if (this.refView.current._originalParent) {
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

    onCommand = command => {
        if (command === 'updateContainers') {
            // send to all widgets the command
            Object.keys(this.widgetsRefs).forEach(wid =>
                this.widgetsRefs[wid].onCommand && this.widgetsRefs[wid].onCommand(command));
        }
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
        e.stopPropagation();

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
            if (this.props.views[this.props.view].widgets[id].groupid) {
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
            widgets.forEach(id => !this.movement.selectedWidgetsWithRectangle.includes(id) && this.widgetsRefs[id] && this.widgetsRefs[id].onTempSelect(true));
            // deselect
            this.movement.selectedWidgetsWithRectangle.forEach(id => !widgets.includes(id) && this.widgetsRefs[id] && this.widgetsRefs[id].onTempSelect(false));
            this.movement.selectedWidgetsWithRectangle = widgets;
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

    onMouseWidgetDown = this.props.runtime ? null : (e, wid) => {
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

        this.refView.current.addEventListener('mousemove', this.onMouseWidgetMove);
        window.document.addEventListener('mouseup', this.onMouseWidgetUp);

        this.movement = {
            moved: false,
            startX: e.pageX,
            startY: e.pageY,
            x: 0,
            y: 0,
        };

        this.props.selectedWidgets.forEach(wid => {
            if (this.widgetsRefs[wid]?.onMove) {
                this.widgetsRefs[wid]?.onMove(); // indicate start of movement
            }
        });
    }

    onMouseWidgetMove = !this.props.runtime ? e => {
        this.movement.moved = true;
        this.movement.x = e.pageX - this.movement.startX;
        this.movement.y = e.pageY - this.movement.startY;

        this.props.selectedWidgets.forEach(wid => {
            const widgetsRefs = this.widgetsRefs;
            if (widgetsRefs[wid]?.onMove) {
                widgetsRefs[wid]?.onMove(this.movement.x, this.movement.y, false);
            }
        });
    } : null;

    onMouseWidgetUp = !this.props.runtime ? e => {
        e && e.stopPropagation();
        this.refView.current.removeEventListener('mousemove', this.onMouseWidgetMove);
        window.document.removeEventListener('mouseup', this.onMouseWidgetUp);

        if (this.movement.moved) {
            this.props.selectedWidgets.forEach(wid => {
                if (this.widgetsRefs[wid]?.onMove) {
                    this.widgetsRefs[wid]?.onMove(this.movement.x, this.movement.y, true); // indicate end of movement
                }
            });
        }
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
    }

    registerEditorHandlers(unregister) {
        if (this.props.registerEditorCallback) {
            if (!unregister && this.props.activeView === this.props.view) {
                if (!this.regsiterDone) {
                    this.regsiterDone = true;
                    this.props.registerEditorCallback('onStealStyle', this.props.view, this.onStealStyle);
                    this.props.registerEditorCallback('onPxToPercent', this.props.view, this.onPxToPercent);
                    this.props.registerEditorCallback('onPercentToPx', this.props.view, this.onPercentToPx);
                }
            } else {
                this.regsiterDone = false;
                this.props.registerEditorCallback('onStealStyle', this.props.view);
                this.props.registerEditorCallback('onPxToPercent', this.props.view);
                this.props.registerEditorCallback('onPercentToPx', this.props.view);
            }
        }
    }

    componentDidUpdate() {
        this.registerEditorHandlers();
    }

    render() {
        const rxAbsoluteWidgets = [];
        const rxRelativeWidgets = [];

        if (this.state.mounted && this.props.views) {
            const widgets = this.props.views[this.props.view]?.widgets;
            if (widgets) {
                Object.keys(widgets).forEach(id => {
                    const widget = this.props.views[this.props.view].widgets[id];
                    if (!widget) {
                        return;
                    }

                    if (widget.grouped) {
                        return;
                    }

                    const isRelative = widget.style && (
                        widget.style.position === 'relative' ||
                        widget.style.position === 'static' ||
                        widget.style.position === 'sticky'
                    );

                    const Widget = VisView.widgets[widget.tpl] || VisCanWidget;

                    const props = {
                        key: id,
                        id,
                        view: this.props.view,
                        views: this.props.views,
                        userGroups: this.props.userGroups,
                        editMode: this.props.editMode,
                        user: this.props.user,
                        allWidgets: this.props.allWidgets,
                        socket: this.props.socket,
                        isRelative,
                        viewsActiveFilter: this.props.viewsActiveFilter,
                        setValue: this.props.setValue,
                        refParent: isRelative ? this.refRelativeView : this.refView,
                        linkContext: this.props.linkContext,
                        formatUtils: this.props.formatUtils,
                        selectedWidgets: this.movement?.selectedWidgetsWithRectangle || this.props.selectedWidgets,
                        setSelectedWidgets: this.props.setSelectedWidgets,
                        runtime: this.props.runtime,
                        mouseDownOnView: this.onMouseWidgetDown,
                        registerRef: this.props.runtime ? null : this.registerRef,
                        onWidgetsChanged: this.props.onWidgetsChanged,
                        showWidgetNames: this.props.showWidgetNames,
                        adapterName: this.props.adapterName,
                        instance: this.props.instance,
                        projectName: this.props.projectName,
                        VisView,
                    };

                    // we must add it because of view in widget
                    props.can = this.props.can;
                    props.canStates = this.props.canStates;
                    props.jQuery = this.props.jQuery;
                    props.$$ = this.props.$$;

                    const rxWidget = <Widget {...props} />;

                    if (isRelative) {
                        rxRelativeWidgets.push(rxWidget);
                    } else {
                        rxAbsoluteWidgets.push(rxWidget);
                    }
                });
            }
        }

        let className = 'vis-view';
        const relativeStyle = {};
        const style = {
            width: '100%',
            height: '100%',
        };
        if (this.props.views && this.props.views[this.props.view]) {
            const settings = this.props.views[this.props.view].settings;
            // this was only if this.props.editMode
            if (rxRelativeWidgets.length && settings.sizex) {
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
        }

        if (this.props.view !== this.props.activeView) {
            style.display = 'none';
        }

        if (this.props.container) {
            style.overflow = 'hidden';
        }

        return <div
            className={className}
            ref={this.refView}
            id={`visview_${this.props.view}`}
            onMouseDown={!this.props.runtime ? e => this.props.editMode && this.onMouseViewDown(e) : undefined}
            style={style}
        >
            {rxRelativeWidgets.length ?
                <div ref={this.refRelativeView} style={relativeStyle}>
                    { rxRelativeWidgets }
                </div>
                : null}
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
