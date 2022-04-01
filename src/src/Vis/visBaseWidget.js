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
    getUsedObjectIDsInWidget,
    addClass,
    removeClass,
} from './visUtils';

class VisBaseWidget extends React.Component {
    static FORBIDDEN_CHARS = /[^._\-/ :!#$%&()+=@^{}|~]+/g; // from https://github.com/ioBroker/ioBroker.js-controller/blob/master/packages/common/lib/common/tools.js

    constructor(props) {
        super(props);

        const widget = this.props.views[this.props.view].widgets[this.props.id];
        this.editMode = this.props.editMode;
        this.refService = React.createRef();
        this.resize = false;
        this.widDiv = null;

        this.state = {
            data: JSON.parse(JSON.stringify(widget.data)),
            style: JSON.parse(JSON.stringify(widget.style)),
        };

        this.bindings = {};

        const linkContext = {
            IDs: [],
            bindings: this.bindings,
            visibility: this.props.linkContext.visibility,
            lastChanges: this.props.linkContext.lastChanges,
            signals: this.props.linkContext.signals,
        };

        getUsedObjectIDsInWidget(this.props.views, this.props.view, this.props.id, linkContext);

        this.IDs = linkContext.IDs;

        // merge bindings
        Object.keys(this.bindings).forEach(id => {
            this.props.linkContext.bindings[id] = this.props.linkContext.bindings[id] || [];
            this.bindings[id].forEach(item => this.props.linkContext.bindings[id].push(item));
        });

        // free mem
        Object.keys(linkContext).forEach(attr => linkContext[attr] = null);
    }

    componentDidMount() {
        this.onStateChangeBound = this.onStateChange.bind(this);
        // subscribe on all IDs
        this.props.linkContext.subscribe(this.IDs, this.props.id, this.onStateChangeBound);
        this.props.registerRef(this.props.id, this.widDiv, this.refService, this.onMove, this.onResize, this.onTempSelect, this.onCommand);
    }

    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    onStateChange(id, state) {
        // ignore
    }

    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    changeHandler(type, item, stateId) {
        // ignore
        // called when signal, visibility or lastChange or bindings changed
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

    componentWillUnmount() {
        this.props.registerRef && this.props.registerRef(this.props.id);

        this.bindings = {};

        if (this.props.linkContext) {
            if (this.props.linkContext && this.props.linkContext.unsubscribe) {
                this.props.linkContext.unsubscribe(this.IDs, this.props.id, this.onStateChangeBound);
            }

            // remove all bindings from prop.linkContexts
            VisBaseWidget.removeFromArray(this.props.linkContext.visibility, this.IDs, this.props.view, this.props.id);
            VisBaseWidget.removeFromArray(this.props.linkContext.lastChanges, this.IDs, this.props.view, this.props.id);
            VisBaseWidget.removeFromArray(this.props.linkContext.signals, this.IDs, this.props.view, this.props.id);
            VisBaseWidget.removeFromArray(this.props.linkContext.bindings, this.IDs, this.props.view, this.props.id);
        }
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
                        if (value !== '0' && value.match(/^[-+]?\d+$/)) {
                            value = `${value}px`;
                        }
                    }
                    if (value) {
                        result[attr] = value;
                    }
                }
            }
        });

        return result;
    }

    static applyStyle(el, style) {
        if (typeof style === 'string') {
            // style is a string
            // "height: 10; width: 20"
            style = VisBaseWidget.parseStyle(style);
            Object.keys(style).forEach(attr => {
                el.style[attr] = style[attr];
            });
        } else if (style) {
            // style is an object
            // {
            //      height: 10,
            // }
            Object.keys(style).forEach(attr => {
                if (attr && style[attr] !== undefined && style[attr] !== null) {
                    let value = style[attr];
                    if (attr === 'top' || attr === 'left' || attr === 'width' || attr === 'height') {
                        if (value !== '0' && value !== 0 && value !== null && value !== '' && value.toString().match(/^[-+]?\d+$/)) {
                            value = `${value}px`;
                        }
                    }
                    if (value) {
                        el.style[attr] = value;
                    }
                }
            });
        }
    }

    applyBindings(doNotAllyStyles) {
        Object.keys(this.bindings).forEach(id => this.applyBinding(id, doNotAllyStyles));
    }

    applyBinding(stateId, doNotAllyStyles) {
        this.bindings[stateId].forEach(item => {
            const widgetContext = this.props.allWidgets[this.props.id];

            const value = this.props.formatUtils.formatBinding(
                item.format,
                item.view,
                this.props.id,
                this.props.views[item.view].widgets[this.props.id],
                widgetContext.data,
            );

            // console.log(`[${new Date().toISOString()}](${item.widget}) BINDINGS: ${stateId}`);

            if (widgetContext) {
                if (item.type === 'data') {
                    // trigger observable
                    widgetContext.data.attr(item.attr, value);
                } else if (item.type === 'style') {
                    widgetContext.style[item.attr] = value;
                    // update style
                    !doNotAllyStyles && VisBaseWidget.applyStyle(this.widDiv, widgetContext.style);
                }
            }
            // TODO
            // this.subscribeOidAtRuntime(value);
            // this.visibilityOidBinding(binding, value);
            // this.reRenderWidget(binding.view, binding.view, bid);
        });
    }

    static onClick(e) {
        // do nothing, just block the handler of view
        e.stopPropagation();
    }

    onMouseDown(e) {
        e.stopPropagation();
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
        } else {
            this.props.mouseDownOnView(e);
        }
    }

    onMove = (x, y, save) => {
        if (this.resize) {
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
                resizers.forEach(item => item.style.opacity = 0.5);
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
            } else if (this.resize === 'bottom-right') {
                this.refService.current.style.height = `${this.movement.height + y}px`;
                this.refService.current.style.width = `${this.movement.width + x}px`;
                if (this.widDiv) {
                    this.widDiv.style.height = `${this.movement.height + y}px`;
                    this.widDiv.style.width = `${this.movement.width + x}px`;
                }
            }

            // end of movement
            if (save) {
                const resizers = this.refService.current.querySelectorAll('.vis-editmode-resizer');
                resizers.forEach(item => item.style.opacity = 1);
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
            // initiate movement
            this.movement = {
                top: this.refService.current.offsetTop,
                left: this.refService.current.offsetLeft,
            };
        } else if (this.movement) {
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

            if (save) {
                this.props.onWidgetsChanged && this.props.onWidgetsChanged([{
                    wid: this.props.id,
                    view: this.props.view,
                    style: {
                        left: this.movement.left + x,
                        top: this.movement.top + y,
                    },
                }]);

                this.movement = null;
            }
        }
    }

    onTempSelect = selected => {
        if (selected === null || selected === undefined)  {
            // restore original state
            if (this.props.selectedWidgets.includes(this.props.id)) {
                this.refService.current.style.backgroundColor = 'green';
                if (!this.refService.current.className.includes('vis-editmode-selected')) {
                    this.refService.current.className = addClass('vis-editmode-selected', this.refService.current.className);
                }
            } else {
                this.refService.current.style.backgroundColor = '';
                this.refService.current.className = removeClass(this.refService.current.className, 'vis-editmode-selected');
            }
        } else {
            this.refService.current.style.backgroundColor = selected ? 'green' : '';

            if (selected) {
                if (!this.refService.current.className.includes('vis-editmode-selected')) {
                    this.refService.current.className = addClass('vis-editmode-selected', this.refService.current.className);
                }
            } else {
                this.refService.current.className = removeClass(this.refService.current.className, 'vis-editmode-selected');
            }
        }
    }

    onResizeStart(e, type) {
        e.stopPropagation();
        this.resize = type;
        this.props.mouseDownOnView();
    }

    getResizeHandlers() {
        return [
            // top
            <div
                key="top"
                className="vis-editmode-resizer"
                style={{
                    position: 'absolute',
                    top: -5,
                    height: 7,
                    left: 4,
                    right: 4,
                    cursor: 'ns-resize',
                    zIndex: 1,
                    background: 'blue',
                }}
                onMouseDown={e => this.onResizeStart(e, 'top')}
            />,
            // bottom
            <div
                key="bottom"
                className="vis-editmode-resizer"
                style={{
                    position: 'absolute',
                    bottom: -5,
                    height: 7,
                    left: 4,
                    right: 4,
                    cursor: 'ns-resize',
                    zIndex: 1,
                    background: 'blue',
                }}
                onMouseDown={e => this.onResizeStart(e, 'bottom')}
            />,
            // left
            <div
                key="left"
                className="vis-editmode-resizer"
                style={{
                    position: 'absolute',
                    top: 4,
                    bottom: 4,
                    left: -5,
                    width: 7,
                    cursor: 'ew-resize',
                    zIndex: 1,
                    background: 'blue',
                }}
                onMouseDown={e => this.onResizeStart(e, 'left')}
            />,
            // right
            <div
                key="right"
                className="vis-editmode-resizer"
                style={{
                    position: 'absolute',
                    top: 4,
                    bottom: 4,
                    right: -5,
                    width: 7,
                    cursor: 'ew-resize',
                    zIndex: 1,
                    background: 'blue',
                }}
                onMouseDown={e => this.onResizeStart(e, 'right')}
            />,
            // top left
            <div
                key="top-left"
                className="vis-editmode-resizer"
                style={{
                    position: 'absolute',
                    top: -5,
                    height: 9,
                    left: -5,
                    width: 9,
                    cursor: 'nwse-resize',
                    zIndex: 1,
                    background: 'blue',
                }}
                onMouseDown={e => this.onResizeStart(e, 'top-left')}
            />,
            // top right
            <div
                key="top-right"
                className="vis-editmode-resizer"
                style={{
                    position: 'absolute',
                    top: -5,
                    height: 9,
                    right: -5,
                    width: 9,
                    cursor: 'nesw-resize',
                    zIndex: 1,
                    background: 'blue',
                }}
                onMouseDown={e => this.onResizeStart(e, 'top-right')}
            />,
            // bottom left
            <div
                key="bottom-left"
                className="vis-editmode-resizer"
                style={{
                    position: 'absolute',
                    bottom: -5,
                    height: 9,
                    left: -5,
                    width: 9,
                    cursor: 'nesw-resize',
                    zIndex: 1,
                    background: 'blue',
                }}
                onMouseDown={e => this.onResizeStart(e, 'bottom-left')}
            />,
            // bottom right
            <div
                key="bottom-right"
                className="vis-editmode-resizer"
                style={{
                    position: 'absolute',
                    bottom: -5,
                    height: 9,
                    right: -5,
                    width: 9,
                    cursor: 'nwse-resize',
                    zIndex: 1,
                    background: 'blue',
                }}
                onMouseDown={e => this.onResizeStart(e, 'bottom-right')}
            />,
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

    isWidgetFilteredOut() {
        const widgetData = this.props.allWidgets[this.props.id].data;
        const v = this.props.viewsActiveFilter[this.props.view];

        return widgetData?.filterkey && v?.length > 0 && !v.includes(widgetData.filterkey);
    }

    // eslint-disable-next-line class-methods-use-this,no-unused-vars
    renderWidgetBody(classNames, style) {
        return <div><pre>{ JSON.stringify(this.state.data, null, 2) }</pre></div>;
    }

    render() {
        const widget = this.props.views[this.props.view].widgets[this.props.id];
        const style = {};
        const selected = this.props.selectedWidgets?.includes(this.props.id);
        const selectedOne = selected && this.props.selectedWidgets.length === 1;
        let classNames = selected ? 'vis-editmode-selected' : '';

        if (!this.editMode && this.props.userGroups && !this.isUserMemberOfGroup(this.props.user, this.props.userGroups)) {
            this.widDiv.className = addClass(this.widDiv.className, 'vis-user-disabled');
        }

        if (this.editMode && !widget.groupid) {
            if (Object.prototype.hasOwnProperty.call(this.state.style, 'top')) {
                style.top = this.state.style.top;
            }
            if (Object.prototype.hasOwnProperty.call(this.state.style, 'left')) {
                style.left = this.state.style.left;
            }
            if (Object.prototype.hasOwnProperty.call(this.state.style, 'width')) {
                style.width = this.state.style.width;
            }
            if (Object.prototype.hasOwnProperty.call(this.state.style, 'height')) {
                style.height = this.state.style.height;
            }
            if (Object.prototype.hasOwnProperty.call(this.state.style, 'right')) {
                style.right = this.state.style.right;
            }
            if (Object.prototype.hasOwnProperty.call(this.state.style, 'bottom')) {
                style.bottom = this.state.style.bottom;
            }

            style.zIndex = this.props.VisView.Z_INDEXES.VIEW_SELECT_RECTANGLE; // 1300 is the React dialog
            style.position = this.props.isRelative ? 'relative' : 'absolute';
            style.userSelect = 'none';

            style.opacity = 0.3;

            style.cursor = selected ? 'move' : 'pointer';

            if (selected) {
                style.backgroundColor = 'green';
            }

            if (widget.tpl.toLowerCase().includes('image')) {
                classNames += ' vis-editmode-helper';
                style.opacity = style.opacity || 0.3;
            }
        }

        // style.display = 'none';
        style.overflow = 'hidden';

        const rxWidget = this.renderWidgetBody(classNames, style);

        return <div
            className={classNames}
            id={`rx_${this.props.id}`}
            ref={this.refService}
            style={style}
            // onClick={!this.props.runtime ? e => this.editMode && this.props.setSelectedWidgets && VisBaseWidget.onClick(e) : undefined}
            onMouseDown={!this.props.runtime ? e => this.editMode && this.props.setSelectedWidgets && this.onMouseDown(e) : undefined}
        >
            { this.props.editMode && !widget.groupid && this.props.showWidgetNames !== false ?
                <div className="vis-editmode-widget-name">{ this.props.id }</div>
                : null }
            { selectedOne ? this.getResizeHandlers() : null }
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
    user: PropTypes.string.isRequired,
    allWidgets: PropTypes.object.isRequired,
    isRelative: PropTypes.bool,
    viewsActiveFilter: PropTypes.object.isRequired,
    linkContext: PropTypes.object.isRequired,
    formatUtils: PropTypes.object,
    selectedWidgets: PropTypes.array,
    setSelectedWidgets: PropTypes.func,
    mouseDownOnView: PropTypes.func,
    onWidgetsChanged: PropTypes.func,
    showWidgetNames: PropTypes.bool,
    VisView: PropTypes.any,

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
