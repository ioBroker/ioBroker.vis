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

import React from 'react';
import PropTypes from 'prop-types';
import {
    replaceGroupAttr,
    addClass,
    getUsedObjectIDsInWidget,
} from './visUtils';
import VisBaseWidget from './visBaseWidget';
import { calculateOverflow } from './utils';

const analyzeDraggableResizable = (el, result, widgetStyle) => {
    result = result || {};
    result.resizable = true;
    result.draggable = true;

    if (el && el.dataset) {
        let resizableOptions = el.dataset.visResizable;
        if (resizableOptions) {
            try {
                resizableOptions = JSON.parse(resizableOptions);
            } catch (error) {
                console.error(`Cannot parse resizable options by ${el.getAttribute('id')}: ${resizableOptions}`);
                resizableOptions = null;
            }
            if (resizableOptions) {
                if (resizableOptions.disabled !== undefined) {
                    result.resizable = !resizableOptions.disabled;
                }
                if (resizableOptions.handles !== undefined) {
                    result.resizeHandles = resizableOptions.handles.split(',').map(h => h.trim());
                }
            }
            if (widgetStyle && !result.resizable && (!widgetStyle.width || !widgetStyle.height)) {
                result.virtualHeight = el.clientHeight;
                result.virtualWidth = el.clientWidth;
            }
        }

        let draggableOptions = el.dataset.visDraggable;
        if (draggableOptions) {
            try {
                draggableOptions = JSON.parse(draggableOptions);
            } catch (error) {
                console.error(`Cannot parse draggable options by ${el.getAttribute('id')}: ${draggableOptions}`);
                draggableOptions = null;
            }
            if (draggableOptions) {
                if (draggableOptions.disabled !== undefined) {
                    result.draggable = !draggableOptions.disabled;
                }
            }
        }

        result.hideHelper = el.dataset.visHideHelper === 'true';
    }
    return result;
};

class VisCanWidget extends VisBaseWidget {
    constructor(props) {
        super(props);

        this.refViews = {};

        this.isCanWidget = true;

        this.state = {
            mounted: false,
            legacyViewContainers: [],
            hideHelper: false,
            resizable: true,
            draggable: true,
            ...this.state,
        };

        this.setupSubscriptions();

        this.props.context.linkContext.registerChangeHandler(this.props.id, this.changeHandler);

        // legacy support
        // if (props.tpl?.includes('materialdesign') && this.props.context.buildLegacyStructures) {
        // event if no materialdesign widget used, the legacy structures must build,
        // because the materialdesign set tries to call vis.subscribing.byViews
        this.props.context.buildLegacyStructures();
        // }
    }

    setupSubscriptions() {
        this.bindings = {};

        const linkContext = {
            IDs: [],
            bindings: this.bindings,
            visibility: this.props.context.linkContext.visibility,
            lastChanges: this.props.context.linkContext.lastChanges,
            signals: this.props.context.linkContext.signals,
        };

        getUsedObjectIDsInWidget(this.props.context.views, this.props.view, this.props.id, linkContext);

        this.IDs = linkContext.IDs;

        // merge bindings
        Object.keys(this.bindings).forEach(id => {
            this.props.context.linkContext.bindings[id] = this.props.context.linkContext.bindings[id] || [];
            this.bindings[id].forEach(item => this.props.context.linkContext.bindings[id].push(item));
        });

        // free mem
        Object.keys(linkContext).forEach(attr => linkContext[attr] = null);
    }

    componentDidMount() {
        super.componentDidMount();

        this.props.context.linkContext.subscribe(this.IDs);

        if (!this.widDiv) {
            // link could be a ref or direct a div (e.g., by groups)
            // console.log('Widget mounted');
            this.renderWidget(() => {
                const newState = { mounted: true };

                if (this.props.context.allWidgets[this.props.id]) {
                    // try to read resize handlers
                    analyzeDraggableResizable(this.widDiv, newState, this.props.context.allWidgets[this.props.id].style);
                }

                this.setState(newState);
            });
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        if (this.props.context.linkContext) {
            if (this.props.context.linkContext && this.props.context.linkContext.unregisterChangeHandler) {
                this.props.context.linkContext.unregisterChangeHandler(this.props.id, this.changeHandler);
            }
        }

        this.bindings = {};

        if (this.props.context.linkContext) {
            if (this.props.context.linkContext.unsubscribe) {
                this.props.context.linkContext.unsubscribe(this.IDs);
            }

            // remove all bindings from prop.linkContexts
            VisBaseWidget.removeFromArray(this.props.context.linkContext.visibility, this.IDs, this.props.view, this.props.id);
            VisBaseWidget.removeFromArray(this.props.context.linkContext.lastChanges, this.IDs, this.props.view, this.props.id);
            VisBaseWidget.removeFromArray(this.props.context.linkContext.signals, this.IDs, this.props.view, this.props.id);
            VisBaseWidget.removeFromArray(this.props.context.linkContext.bindings, this.IDs, this.props.view, this.props.id);
        }

        this.destroy();
    }

    static applyStyle(el, style, isSelected, editMode) {
        if (typeof style === 'string') {
            // style is a string
            // "height: 10; width: 20"
            style = VisBaseWidget.parseStyle(style);
            Object.keys(style).forEach(attr => {
                if (!attr.startsWith('_')) {
                    let value = style[attr];
                    if (attr === 'top' || attr === 'left' || attr === 'width' || attr === 'height') {
                        if (value !== '0' && value !== 0 && value !== null && value !== '' && value.toString().match(/^[+-]?([0-9]*[.])?[0-9]+$/)) {
                            value = `${value}px`;
                        }
                    }

                    if (attr.includes('-')) {
                        console.log(`${attr} to ${value}`);
                        attr = attr.replace(/-([a-z])/g, g => g[1].toUpperCase());
                    }
                    if (value) {
                        el.style[attr] = value;
                    } else if (el.style[attr]) { // delete style
                        el.style[attr] = '';
                    }
                }
            });
        } else if (style) {
            // style is an object
            // {
            //      height: 10,
            // }
            Object.keys(style).forEach(attr => {
                if (attr && style[attr] !== undefined && style[attr] !== null && !attr.startsWith('_')) {
                    let value = style[attr];
                    if (attr === 'top' || attr === 'left' || attr === 'width' || attr === 'height') {
                        if (value !== '0' && value !== 0 && value !== null && value !== '' && value.toString().match(/^[+-]?([0-9]*[.])?[0-9]+$/)) {
                            value = `${value}px`;
                        }
                    }
                    // a-b => aB
                    if (attr.includes('-')) {
                        attr = attr.replace(/-([a-z])/g, g => g[1].toUpperCase());
                    }
                    if (value) {
                        el.style[attr] = value;
                    } else if (el.style[attr]) { // delete style
                        el.style[attr] = '';
                    }
                }
            });

            if (editMode) {
                if (isSelected) {
                    // z-index
                    el.style.zIndex = (500 + (parseInt(style['z-index'], 10) || 0)).toString();
                }

                const zIndex = parseInt(el.style.zIndex, 10) || 0;
                // apply zIndex to parent
                const overlay = el.parentNode.querySelector(`#rx_${el.id}`);
                if (overlay) {
                    overlay.style.zIndex = zIndex + 1;
                }
                el.style.userSelect = 'none';
                el.style.pointerEvents = 'none';
            }

            // absolute widgets must have top and left
            if (el.style.position === 'absolute') {
                if (!el.style.top) {
                    el.style.top = '0px';
                }
                if (!el.style.left) {
                    el.style.left = '0px';
                }
            }
        }
    }

    // this method may be not in form onCommand = command => {}
    onCommand(command, options) {
        const result = super.onCommand(command, options);
        if (result === false) {
            if (command === 'updatePosition') {
                // move by canJS widgets the name and overlapping div
                if (this.refService.current && this.widDiv) {
                    this.refService.current.style.width = `${this.widDiv.offsetWidth}px`;
                    this.refService.current.style.height = `${this.widDiv.offsetHeight}px`;
                    // Move helper to actual widget
                    this.refService.current.style.left = `${this.widDiv.offsetLeft}px`;
                    this.refService.current.style.top = `${this.widDiv.offsetTop}px`;
                }
            } else if (command === 'updateContainers') {
                // try to find 'vis-view-container' in it
                const containers = this.widDiv.querySelectorAll('.vis-view-container');
                if (containers.length) {
                    const legacyViewContainers = [];
                    for (let v = 0; v < containers.length; v++) {
                        const view = (containers[v].dataset.visContains || '').trim();
                        if (view && view !== 'undefined' && view !== 'null') {
                            legacyViewContainers.push(view);
                            containers[v].className = addClass(containers[v].className, 'vis-editmode-helper');
                        }
                    }

                    legacyViewContainers.sort();

                    if (JSON.stringify(legacyViewContainers) !== JSON.stringify(this.state.legacyViewContainers)) {
                        this.setState({ legacyViewContainers });
                    }
                }
            } else if (command === 'changeFilter') {
                if (!this.widDiv) {
                    return null;
                }

                // if filter was disabled
                if (!options || !options.filter.length) {
                    // just show if it was hidden
                    if (this.filterDisplay !== undefined) {
                        this.widDiv.style.display = this.filterDisplay;
                        if (this.widDiv._customHandlers?.onShow) {
                            this.widDiv._customHandlers.onShow(this.widDiv, this.props.id);
                        }
                    }
                } else if (options.filter[0] === '$') {
                    // hide all
                    if (this.props.context.allWidgets[this.props.id]?.data?.filterkey) {
                        if (this.widDiv.style.display !== 'none') {
                            this.filterDisplay = this.widDiv.style.display;
                            this.widDiv.style.display = 'none';
                            if (this.widDiv._customHandlers?.onHide) {
                                this.widDiv._customHandlers.onHide(this.widDiv, this.props.id);
                            }
                        }
                    }
                } else {
                    const wFilters = this.props.context.allWidgets[this.props.id]?.data.filterkey;

                    if (wFilters) {
                        // we cannot use "find", as it is "can" observable
                        let found = false;
                        for (let w = 0; w < wFilters.length; w++) {
                            if (options.filter.includes(wFilters[w])) {
                                found = true;
                                break;
                            }
                        }

                        // this widget was not found in desired filters
                        if (!found) {
                            // if it was not hidden
                            if (this.widDiv.style.display !== 'none') {
                                // remember display mode
                                this.filterDisplay = this.widDiv.style.display;
                                // hide it
                                this.widDiv.style.display = 'none';
                                if (this.widDiv._customHandlers?.onHide) {
                                    this.widDiv._customHandlers?.onHide(this.widDiv, this.props.id);
                                }
                            }
                        } else if (this.filterDisplay !== undefined && this.widDiv.style.display === 'none') {
                            // if it was hidden => restore it
                            this.widDiv.style.display = this.filterDisplay;
                            if (this.widDiv._customHandlers?.onShow) {
                                this.widDiv._customHandlers?.onShow(this.widDiv, this.props.id);
                            }
                        }
                    }
                }
            } else if (command === 'collectFilters') {
                return this.props.context.allWidgets[this.props.id]?.data?.filterkey;
            }
        }

        return result;
    }

    componentDidUpdate(/* prevProps, prevState, snapshot */) {
        if (this.state.legacyViewContainers.length) {
            console.log('widget updated');
            // place all views to corresponding containers
            Object.keys(this.refViews).forEach(view => {
                if (this.refViews[view].current) {
                    const container = this.widDiv.querySelector(`.vis-view-container[data-vis-contains="${view}"]`);
                    const current = this.refViews[view].current;
                    if (current && !current.refView?.current) {
                        // it is just div
                        if (current.parentNode !== container) {
                            // current._originalParent = current.parentNode;
                            // container.appendChild(current);
                        }
                    } else if (current?.refView?.current && container && current.refView.current.parentNode !== container) {
                        current.refView.current._originalParent = current.refView.current.parentNode;
                        container.appendChild(current.refView.current);
                    }
                }
            });
        }
    }

    destroy = update => {
        // !update && console.log('destroy ' + this.props.id);
        // destroy map
        if (this.props.context.allWidgets[this.props.id]) {
            delete this.props.context.allWidgets[this.props.id];
        }

        // do not destroy groups by update
        if (this.widDiv && (!update || !this.props.id.startsWith('g'))) {
            const $wid = this.props.context.jQuery(this.widDiv);
            const destroy = $wid.data('destroy');

            if (typeof destroy === 'function') {
                destroy(this.props.id, $wid);
                $wid.data('destroy', null);
            }

            // remove from DOM
            this.widDiv.remove();
            this.widDiv = null;
        }
    };

    changeHandler = (type, item, stateId) => {
        // console.log(`[${this.props.id}] update widget because of "${type}" "${stateId}": ${JSON.stringify(state)}`);
        if (this.widDiv) {
            if (type === 'style') {
                if (this.props.context.allWidgets[this.props.id]) {
                    // apply style from this.props.context.allWidgets.style
                    VisCanWidget.applyStyle(this.widDiv, this.props.context.allWidgets[this.props.id].style, this.state.selected, this.state.editMode);
                }
            } else if (type === 'signal') {
                this.updateSignal(item);
            } else if (type === 'visibility') {
                this.updateVisibility(item);
            } else if (type === 'lastChange') {
                this.updateLastChange();
            } else if (type === 'binding') {
                this.applyBinding(stateId);
            }
        }
    };

    updateSignal(item) {
        if (this.widDiv) {
            const signalDiv = this.widDiv.querySelector(`.vis-signal[data-index="${item.index}"]`);
            if (signalDiv) {
                if (this.isSignalVisible(item.index)) {
                    signalDiv.style.display = '';
                } else {
                    signalDiv.style.display = 'none';
                }
            }
        }
    }

    updateLastChange() {
        if (this.widDiv) {
            const widgetData = this.props.context.allWidgets[this.props.id]?.data;
            if (widgetData) {
                const lcDiv = this.widDiv.querySelector('.vis-last-change');
                if (lcDiv) {
                    lcDiv.innerHTML = window.vis.binds.basic.formatDate(
                        this.props.context.canStates.attr(`${widgetData['lc-oid']}.${widgetData['lc-type'] === 'last-change' ? 'lc' : 'ts'}`),
                        widgetData['lc-format'],
                        widgetData['lc-is-interval'],
                        widgetData['lc-is-moment'],
                    );
                } else {
                    console.warn(`[${this.props.id}] Last change not found!`);
                }
            }
        }
    }

    updateVisibility() {
        if (this.widDiv && !this.state.editMode) {
            const widgetData = this.props.context.allWidgets[this.props.id]?.data;
            if (widgetData) {
                if (VisBaseWidget.isWidgetHidden(widgetData, this.props.context.canStates, this.props.id) || this.isWidgetFilteredOut(widgetData)) {
                    this.widDiv._storedDisplay = this.widDiv.style.display;
                    this.widDiv.style.display = 'none';

                    if (this.widDiv
                        && this.widDiv._customHandlers
                        && this.widDiv._customHandlers.onHide
                    ) {
                        this.widDiv._customHandlers.onHide(this.widDiv, this.props.id);
                    }
                } else {
                    this.widDiv.style.display = this.widDiv._storedDisplay || '';
                    this.widDiv._storedDisplay = '';

                    if (this.widDiv &&
                        this.widDiv._customHandlers &&
                        this.widDiv._customHandlers.onShow
                    ) {
                        this.widDiv._customHandlers.onShow(this.widDiv, this.props.id);
                    }
                }
            }
        }
    }

    addGestures(widgetData) {
        // gestures
        const gestures = ['swipeRight', 'swipeLeft', 'swipeUp', 'swipeDown', 'rotateLeft', 'rotateRight', 'pinchIn', 'pinchOut', 'swiping', 'rotating', 'pinching'];
        const $$wid = this.props.context.$$(`#${this.props.id}`);
        const $wid = this.props.context.jQuery(this.widDiv);
        const offsetX = parseInt(widgetData['gestures-offsetX']) || 0;
        const offsetY = parseInt(widgetData['gestures-offsetY']) || 0;

        gestures.forEach(gesture => {
            const oid = widgetData[`gestures-${gesture}-oid`];
            if (widgetData && oid) {
                const val = widgetData[`gestures-${gesture}-value`];
                const delta = parseInt(widgetData[`gestures-${gesture}-delta`]) || 10;
                const limit = parseFloat(widgetData[`gestures-${gesture}-limit`]) || false;
                const max = parseFloat(widgetData[`gestures-${gesture}-maximum`]) || 100;
                const min = parseFloat(widgetData[`gestures-${gesture}-minimum`]) || 0;

                let newVal = null;
                let valState = this.props.context.canStates.attr(`${oid}.val`);
                let $indicator;
                if (valState !== undefined && valState !== null) {
                    $wid.on('touchmove', evt => evt.preventDefault());

                    $wid.css({
                        '-webkit-user-select': 'none',
                        '-khtml-user-select': 'none',
                        '-moz-user-select': 'none',
                        '-ms-user-select': 'none',
                        'user-select': 'none',
                    });

                    $$wid[gesture](data => {
                        valState = this.props.context.canStates.attr(`${oid}.val`);

                        if (val === 'toggle') {
                            if (valState === true) {
                                newVal = false;
                            } else if (valState === false) {
                                newVal = true;
                            } else {
                                newVal = null;
                                return;
                            }
                        } else if (gesture === 'swiping' || gesture === 'rotating' || gesture === 'pinching') {
                            if (newVal === null) {
                                $indicator = this.$(`#${widgetData['gestures-indicator']}`);
                                // create default indicator
                                if (!$indicator.length) {
                                    // noinspection JSJQueryEfficiency
                                    $indicator = this.$('#gestureIndicator');
                                    if (!$indicator.length) {
                                        this.$('body').append('<div id="gestureIndicator" style="position: absolute; pointer-events: none; z-index: 100; box-shadow: 2px 2px 5px 1px gray;height: 21px; border: 1px solid #c7c7c7; border-radius: 5px; text-align: center; padding-top: 6px; padding-left: 2px; padding-right: 2px; background: lightgray;"></div>');
                                        $indicator = this.$('#gestureIndicator');

                                        // eslint-disable-next-line @typescript-eslint/no-this-alias
                                        const that = this;
                                        // eslint-disable-next-line func-names
                                        $indicator.on('gestureUpdate', function (event, evData) {
                                            const $el = that.$(this);
                                            if (evData.val === null) {
                                                $el.hide();
                                            } else {
                                                $el.html(evData.val);
                                                $el.css({
                                                    left: `${parseInt(evData.x) - $el.width() / 2}px`,
                                                    top: `${parseInt(evData.y) - $el.height() / 2}px`,
                                                }).show();
                                            }
                                        });
                                    }
                                }

                                this.$(this.root).css({
                                    '-webkit-user-select': 'none',
                                    '-khtml-user-select': 'none',
                                    '-moz-user-select': 'none',
                                    '-ms-user-select': 'none',
                                    'user-select': 'none',
                                });

                                this.$(document).on('mouseup.gesture touchend.gesture', () => {
                                    if (newVal !== null) {
                                        this.props.context.setValue(oid, newVal);
                                        newVal = null;
                                    }
                                    $indicator.trigger('gestureUpdate', { val: null });
                                    this.$(document).off('mouseup.gesture touchend.gesture');

                                    this.$(this.root).css({
                                        '-webkit-user-select': 'text',
                                        '-khtml-user-select': 'text',
                                        '-moz-user-select': 'text',
                                        '-ms-user-select': 'text',
                                        'user-select': 'text',
                                    });
                                });
                            }
                            let swipeDelta;
                            let indicatorX;
                            let indicatorY = 0;

                            switch (gesture) {
                                case 'swiping':
                                    swipeDelta = Math.abs(data.touch.delta.x) > Math.abs(data.touch.delta.y) ? data.touch.delta.x : data.touch.delta.y * (-1);
                                    swipeDelta = swipeDelta > 0 ? Math.floor(swipeDelta / delta) : Math.ceil(swipeDelta / delta);
                                    indicatorX = data.touch.x;
                                    indicatorY = data.touch.y;
                                    break;

                                case 'rotating':
                                    swipeDelta = data.touch.delta;
                                    swipeDelta = swipeDelta > 0 ? Math.floor(swipeDelta / delta) : Math.ceil(swipeDelta / delta);
                                    if (data.touch.touches[0].y < data.touch.touches[1].y) {
                                        indicatorX = data.touch.touches[1].x;
                                        indicatorY = data.touch.touches[1].y;
                                    } else {
                                        indicatorX = data.touch.touches[0].x;
                                        indicatorY = data.touch.touches[0].y;
                                    }
                                    break;

                                case 'pinching':
                                    swipeDelta = data.touch.delta;
                                    swipeDelta = swipeDelta > 0 ? Math.floor(swipeDelta / delta) : Math.ceil(swipeDelta / delta);
                                    if (data.touch.touches[0].y < data.touch.touches[1].y) {
                                        indicatorX = data.touch.touches[1].x;
                                        indicatorY = data.touch.touches[1].y;
                                    } else {
                                        indicatorX = data.touch.touches[0].x;
                                        indicatorY = data.touch.touches[0].y;
                                    }
                                    break;

                                default:
                                    break;
                            }

                            newVal = (parseFloat(valState) || 0) + (parseFloat(val) || 1) * swipeDelta;
                            newVal = Math.max(min, Math.min(max, newVal));
                            $indicator.trigger('gestureUpdate', {
                                val: newVal,
                                x: indicatorX + offsetX,
                                y: indicatorY + offsetY,
                            });
                            return;
                        } else if (limit !== false) {
                            newVal = (parseFloat(valState) || 0) + (parseFloat(val) || 1);
                            if (parseFloat(val) > 0 && newVal > limit) {
                                newVal = limit;
                            } else if (parseFloat(val) < 0 && newVal < limit) {
                                newVal = limit;
                            }
                        } else {
                            newVal = val;
                        }
                        this.props.context.setValue(oid, newVal);
                        newVal = null;
                    });
                }
            }
        });
    }

    isSignalVisible(index, widgetData) {
        widgetData = widgetData || this.props.context.allWidgets[this.props.id].data;

        if (!widgetData) {
            return false;
        }

        if (this.state.editMode) {
            return !widgetData[`signals-hide-edit-${index}`];
        }

        const oid = widgetData[`signals-oid-${index}`];

        if (oid) {
            let val = this.props.context.canStates.attr(`${oid}.val`);

            const condition = widgetData[`signals-cond-${index}`];
            let value = widgetData[`signals-val-${index}`];

            if (val === undefined || val === null) {
                return condition === 'not exist';
            }

            if (!condition || value === undefined || value === null) {
                return condition === 'not exist';
            }

            if (val === 'null' && condition !== 'exist' && condition !== 'not exist') {
                return false;
            }

            const t = typeof val;
            if (t === 'boolean' || val === 'false' || val === 'true') {
                value = value === 'true' || value === true || value === 1 || value === '1';
            } else if (t === 'number') {
                value = parseFloat(value);
            } else if (t === 'object') {
                val = JSON.stringify(val);
            }

            switch (condition) {
                case '==':
                    value = value.toString();
                    val = val.toString();
                    if (val === '1') val = 'true';
                    if (value === '1') value = 'true';
                    if (val === '0') val = 'false';
                    if (value === '0') value = 'false';
                    return value === val;
                case '!=':
                    value = value.toString();
                    val = val.toString();
                    if (val === '1') val = 'true';
                    if (value === '1') value = 'true';
                    if (val === '0') val = 'false';
                    if (value === '0') value = 'false';
                    return value !== val;
                case '>=':
                    return val >= value;
                case '<=':
                    return val <= value;
                case '>':
                    return val > value;
                case '<':
                    return val < value;
                case 'consist':
                    value = value.toString();
                    val = val.toString();
                    return val.toString().includes(value);
                case 'not consist':
                    value = value.toString();
                    val = val.toString();
                    return !val.toString().includes(value);
                case 'exist':
                    return value !== 'null';
                case 'not exist':
                    return value === 'null';
                default:
                    console.log(`[${this.props.id}] Unknown signals condition: ${condition}`);
                    return false;
            }
        } else {
            return false;
        }
    }

    addSignalIcon(widgetData, index) {
        widgetData = widgetData || this.props.context.allWidgets[this.props.id]?.data;
        if (!widgetData) {
            return;
        }

        // <div class="vis-signal ${data[`signals-blink-${index}`] ? 'vis-signals-blink' : ''} ${data[`signals-text-class-${index}`] || ''} " data-index="${index}" style="display: ${display}; pointer-events: none; position: absolute; z-index: 10; top: ${data[`signals-vert-${index}`] || 0}%; left: ${data[`signals-horz-${index}`] || 0}%">
        const divSignal = window.document.createElement('div');
        divSignal.className = `vis-signal ${widgetData[`signals-blink-${index}`] ? 'vis-signals-blink' : ''} ${widgetData[`signals-text-class-${index}`] || ''}`;
        divSignal.dataset.index = index;
        divSignal.style.display = this.isSignalVisible(index) ? '' : 'none';
        divSignal.style.pointerEvents = 'none';
        divSignal.style.position = 'absolute';
        divSignal.style.zIndex = '10';
        divSignal.style.top = `${widgetData[`signals-vert-${index}`] || 0}%`;
        divSignal.style.left = `${widgetData[`signals-horz-${index}`] || 0}%`;

        // <img class="vis-signal-icon" src="${data[`signals-icon-${index}`]}" style="width: ${data[`signals-icon-size-${index}`] || 32}px; height: auto;${data[`signals-icon-style-${index}`] || ''}"/>
        const divIcon = window.document.createElement('img');
        divIcon.className = 'vis-signal-icon';
        let src = widgetData[`signals-icon-${index}`];
        if (src) {
            if (src.startsWith('/vis/')) {
                src = src.substring(5);
            } else if (src.startsWith('/vis-2/')) {
                src = src.substring(5);
            } else if (src.startsWith('/vis-2-beta/')) {
                src = src.substring(12);
            }
        }
        divIcon.src = src;
        divIcon.style.width = `${widgetData[`signals-icon-size-${index}`] || 32}px`;
        divIcon.style.height = 'auto';
        VisCanWidget.applyStyle(divIcon, widgetData[`signals-icon-style-${index}`]);
        divSignal.appendChild(divIcon);

        // <div class="vis-signal-text " style="${data[`signals-text-style-${index}`] || ''}">${data[`signals-text-${index}`]}</div>
        const text = widgetData[`signals-text-${index}`];
        if (text) {
            const divText = window.document.createElement('div');
            divText.className = 'vis-signal-text';
            VisCanWidget.applyStyle(divText, widgetData[`signals-text-style-${index}`]);
            divText.innerHTML = text;
            divSignal.appendChild(divText);
        }

        this.widDiv.appendChild(divSignal);
    }

    addLastChange(widgetData) {
        // show last change
        const border = `${parseInt(widgetData['lc-border-radius'], 10) || 0}px`;
        const css = {
            background: 'rgba(182,182,182,0.6)',
            fontFamily: 'Tahoma',
            position: 'absolute',
            zIndex: 0,
            borderRadius: widgetData['lc-position-horz'] === 'left' ? (`${border} 0 0 ${border}`) : (widgetData['lc-position-horz'] === 'right' ? `0 ${border} ${border} 0` : border),
            whiteSpace: 'nowrap',
        };
        if (widgetData['lc-font-size']) {
            css.fontSize = widgetData['lc-font-size'];
        }
        if (widgetData['lc-font-style']) {
            css.fontStyle = widgetData['lc-font-style'];
        }
        if (widgetData['lc-font-family']) {
            css.fontFamily = widgetData['lc-font-family'];
        }
        if (widgetData['lc-bkg-color']) {
            css.background = widgetData['lc-bkg-color'];
        }
        if (widgetData['lc-color']) {
            css.color = widgetData['lc-color'];
        }
        if (widgetData['lc-border-width']) {
            css.borderWidth = parseInt(widgetData['lc-border-width'], 10) || 0;
        }
        if (widgetData['lc-border-style']) {
            css.borderStyle = widgetData['lc-border-style'];
        }
        if (widgetData['lc-border-color']) {
            css.borderColor = widgetData['lc-border-color'];
        }
        if (widgetData['lc-padding']) {
            css.padding = widgetData['lc-padding'];
        } else {
            css.paddingTop = 3;
            css.paddingBottom = 3;
        }
        if (widgetData['lc-zindex']) {
            css.zIndex = widgetData['lc-zindex'];
        }
        if (widgetData['lc-position-vert'] === 'top') {
            css.top = parseInt(widgetData['lc-offset-vert'], 10);
        } else if (widgetData['lc-position-vert'] === 'bottom') {
            css.bottom = parseInt(widgetData['lc-offset-vert'], 10);
        } else if (widgetData['lc-position-vert'] === 'middle') {
            css.top = `calc(50% + ${parseInt(widgetData['lc-offset-vert'], 10) - 10}px)`;
        }
        const offset = parseFloat(widgetData['lc-offset-horz']) || 0;
        if (widgetData['lc-position-horz'] === 'left') {
            css.right = `calc(100% - ${offset}px)`;
            if (!widgetData['lc-padding']) {
                css.paddingRight = 10;
                css.paddingLeft = 10;
            }
        } else if (widgetData['lc-position-horz'] === 'right') {
            css.left = `calc(100% + ${offset}px)`;
            if (!widgetData['lc-padding']) {
                css.paddingRight = 10;
                css.paddingLeft = 10;
            }
        } else if (widgetData['lc-position-horz'] === 'middle') {
            css.left = `calc(50% + ${offset}px)`;
        }

        const divLastChange = window.document.createElement('div');
        // `<div class="vis-last-change" data-type="${data['lc-type']}" data-format="${data['lc-format']}" data-interval="${data['lc-is-interval']}">${this.binds.basic.formatDate(this.states.attr(`${data['lc-oid']}.${data['lc-type'] === 'last-change' ? 'lc' : 'ts'}`), data['lc-format'], data['lc-is-interval'], data['lc-is-moment'])}</div>`
        divLastChange.className = 'vis-last-change';
        divLastChange.innerHTML = this.formatDate(
            this.props.context.canStates.attr(`${widgetData['lc-oid']}.${widgetData['lc-type'] === 'last-change' ? 'lc' : 'ts'}`),
            widgetData['lc-format'],
            widgetData['lc-is-interval'],
            widgetData['lc-is-moment'],
        );
        Object.keys(css).forEach(attr => divLastChange.style[attr] = css[attr]);

        this.widDiv.prepend(divLastChange);
        calculateOverflow(this.widDiv.style);
    }

    addChart(widgetData) {
        this.widDiv.onclick = () => {
            // not yet implemented
            console.log(`[${this.props.id}] Show dialog with chart for ${widgetData['echart-oid']}`);
        };
    }

    visibilityOidBinding(binding, oid) {
        // if attribute 'visibility-oid' contains binding
        if (binding.attr === 'visibility-oid') {
            // runs only if we have a valid id
            if (oid && oid.length < 300 && (/^[^.]*\.\d*\..*|^[^.]*\.[^.]*\.[^.]*\.\d*\..*/).test(oid) && VisBaseWidget.FORBIDDEN_CHARS.test(oid)) {
                const obj = {
                    view: binding.view,
                    widget: binding.widget,
                };

                // on runtime load oid, check if oid needs to be subscribed
                Object.keys(this.props.context.linkContext.visibility).forEach(id => {
                    const widgetIndex = this.props.context.linkContext.visibility[id].findIndex(x => x.widget === obj.widget);

                    // remove or add widget to existing oid's in visibility list
                    if (widgetIndex >= 0 && id !== oid) {
                        // widget exists in the visibility list
                        this.props.context.linkContext.visibility[id].splice(widgetIndex, 1);
                    } else if (widgetIndex < 0 && id === oid) {
                        // widget does not exists in the visibility list
                        this.props.context.linkContext.visibility[id].push(obj);
                    }
                });

                if (!this.props.context.linkContext.visibility[oid]) {
                    // oid not exist in visibility list -> add oid and widget to the visibility list
                    this.props.context.linkContext.visibility[oid] = [obj];
                }

                // on runtime load oid, check if oid does need to be subscribed
                if (!this.state.editMode) {
                    if (this.IDs.includes(oid)) {
                        this.updateVisibility();
                    } else {
                        this.IDs.push(oid);
                        const val = this.props.context.canStates.attr(`${oid}.val`);
                        if (val !== undefined) {
                            this.updateVisibility();
                        }

                        this.props.context.linkContext.subscribe([oid]);
                    }
                }
            }
        }
    }

    applyBindings(doNotApplyStyles, widgetData, widgetStyle) {
        Object.keys(this.bindings).forEach(id =>
            this.applyBinding(id, doNotApplyStyles, widgetData, widgetStyle));
    }

    applyBinding(stateId, doNotApplyStyles, widgetData, widgetStyle) {
        const widgetContext = this.props.context.allWidgets[this.props.id];
        if (!widgetContext && (!widgetData || !widgetStyle)) {
            return;
        }

        const widget = this.props.context.views[this.props.view].widgets[this.props.id];

        this.bindings[stateId].forEach(item => {
            widgetStyle = widgetStyle || widgetContext.style;

            const value = this.props.context.formatUtils.formatBinding({
                format: item.format,
                view: item.view,
                wid: this.props.id,
                widget,
                widgetData: widgetData || widgetContext.data,
                moment: this.props.context.moment,
            });

            if (item.type === 'data') {
                if (widgetData) {
                    widgetData[item.attr] = value;
                } else if (widgetContext) {
                    // trigger observable
                    widgetContext.data.attr(item.attr, value);
                }
            } else if (item.type === 'style') {
                if (widgetStyle) {
                    widgetStyle[item.attr] = value;
                    // update style
                    !doNotApplyStyles && VisCanWidget.applyStyle(this.widDiv, widgetStyle, this.state.selected, this.state.editMode);
                } else if (widgetContext) {
                    // trigger observable
                    widgetContext.style.attr(item.attr, value);
                    // update style
                    !doNotApplyStyles && VisCanWidget.applyStyle(this.widDiv, widgetContext.style, this.state.selected, this.state.editMode);
                }
            }
            // TODO
            // this.subscribeOidAtRuntime(value);
            // this.visibilityOidBinding(binding, value);
            // this.reRenderWidget(binding.view, binding.view, bid);
        });
    }

    calcData(wid, widget, newWidgetData, newWidgetStyle) {
        let widgetData;
        let widgetStyle;
        let isRelative;

        try {
            widgetData = { wid, ...(widget.data || {}) };
            widgetStyle = JSON.parse(JSON.stringify(newWidgetStyle || widget.style || {}));
            // Replace _PRJ_NAME
            Object.keys(widgetData).forEach(attr => {
                if (attr &&
                    widgetData[attr] &&
                    typeof widgetData[attr] === 'string' &&
                    (attr.startsWith('src') || attr.endsWith('src') || attr.includes('icon')) && widgetData[attr].startsWith('_PRJ_NAME')
                ) {
                    // "_PRJ_NAME".length = 9
                    widgetData[attr] = `../${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}${widgetData[attr].substring(9)}`;
                }
            });
            if (widgetStyle['background-image'] && widgetStyle['background-image'].startsWith('_PRJ_NAME')) {
                widgetStyle['background-image'] = `../${this.props.context.adapterName}.${this.props.context.instance}/${this.props.context.projectName}${widgetStyle['background-image'].substring(9)}`;  // "_PRJ_NAME".length = 9
            }

            this.applyBindings(true, widgetData, widgetStyle);

            if (widgetData.filterkey && typeof widgetData.filterkey === 'string') {
                widgetData.filterkey = widgetData.filterkey.split(',')
                    .map(f => f.trim())
                    .filter(f => f);
            }

            isRelative = this.props.isRelative !== undefined ? this.props.isRelative :
                widgetStyle && (
                    widgetStyle.position === 'relative' ||
                    widgetStyle.position === 'static' ||
                    widgetStyle.position === 'sticky'
                );

            if (isRelative) {
                delete widgetStyle.top;
                delete widgetStyle.left;
                if (Number.isFinite(this.props.context.views[this.props.view].settings.rowGap)) {
                    widgetStyle['margin-bottom'] = `${parseFloat(this.props.context.views[this.props.view].settings.rowGap)}px`;
                }
            }

            // if multi-view widget dim it in edit mode
            if (this.state.multiViewWidget && this.state.editMode) {
                if (widgetStyle.opacity === undefined || widgetStyle.opacity === null || widgetStyle.opacity > 0.3) {
                    widgetStyle.opacity = 0.3;
                }
            }
        } catch (e) {
            console.warn(`[${wid}] Cannot bind data of widget: ${e}`);
            return { widgetData: null, widgetStyle: null, isRelative: false };
        }

        return { widgetData, widgetStyle, isRelative };
    }

    renderWidget(update, newWidgetData, newWidgetStyle, _count, cb) {
        if (typeof update === 'function') {
            cb = update;
            update = false;
        }
        _count = _count || 0;
        // console.log(`[${Date.now()}] Render widget`);
        let parentDiv = this.props.refParent;
        if (Object.prototype.hasOwnProperty.call(parentDiv, 'current')) {
            parentDiv = parentDiv.current;
        }

        if (!parentDiv) {
            if (_count < 5) {
                setTimeout(() => this.renderWidget(update, newWidgetData, newWidgetStyle, _count + 1, cb), 50);
            }
            return;
        }

        const wid = this.props.id;
        let widget = this.props.context.views[this.props.view].widgets[wid];
        if (!widget || typeof widget !== 'object') {
            return;
        }

        // replace groupAttrX in groups
        if (widget?.groupid) {
            // this widget belongs to group
            const parentWidgetData = this.props.context.views[this.props.view].widgets[widget.groupid].data;
            // extract attribute names
            const names = Object.keys(parentWidgetData)
                .map(attr => (attr.startsWith('attrType_') ? attr.substring(9) : null))
                .filter(attr => attr);

            if (names.length && widget.data) {
                let copied = false;

                Object.keys(widget.data).forEach(attr => {
                    if (typeof widget.data[attr] === 'string' && names.find(a => widget.data[attr].includes(a))) {
                        const result = replaceGroupAttr(widget.data[attr], parentWidgetData);
                        if (result.doesMatch) {
                            if (!copied) {
                                copied = true;
                                // create a copy as we will substitute the values
                                widget = JSON.parse(JSON.stringify(widget));
                            }
                            widget.data[attr] = result.newString || '';
                        }
                    }
                });
            }
        }

        // calculate current styles and data (apply current bindings)
        if (!update) {
            const { isRelative, widgetData, widgetStyle } = this.calcData(wid, widget, newWidgetData, newWidgetStyle);
            const newData = JSON.stringify(widgetData);
            const newStyle = JSON.stringify(widgetStyle);
            // detect if update required
            if (this.widDiv) {
                if (this.oldEditMode === this.state.editMode) {
                    if (this.oldData === newData && !update) {
                        if (this.oldStyle === newStyle || widgetData._no_style) {
                            // ignore changes
                            // console.log('Rerender ignored as no changes');
                            return;
                        }

                        if (!this.updateOnStyle) {
                            this.oldStyle = newStyle;
                            // update global styles
                            if (this.props.context.allWidgets[wid] && this.props.context.allWidgets[wid].style) {
                                const mStyle = this.props.context.allWidgets[wid].style;
                                Object.keys(widgetStyle).forEach(attr => {
                                    if (mStyle[attr] !== widgetStyle[attr]) {
                                        mStyle.attr(attr, widgetStyle[attr]);
                                    }
                                });
                            }

                            // apply new style changes directly on DOM
                            VisCanWidget.applyStyle(this.widDiv, widgetStyle, this.state.selected, this.state.editMode);
                            // fix position
                            this.widDiv.style.position = isRelative ? (widgetStyle.position || 'relative') : 'absolute';
                            console.log('Rerender ignored as only style applied');
                            return;
                        }
                    }
                }
            }
        }

        this.destroy(update);

        const oldIDs = this.IDs;

        // remove all bindings from prop.linkContexts
        VisBaseWidget.removeFromArray(this.props.context.linkContext.visibility, this.IDs, this.props.view, wid);
        VisBaseWidget.removeFromArray(this.props.context.linkContext.lastChanges, this.IDs, this.props.view, wid);
        VisBaseWidget.removeFromArray(this.props.context.linkContext.signals, this.IDs, this.props.view, wid);
        VisBaseWidget.removeFromArray(this.props.context.linkContext.bindings, this.IDs, this.props.view, wid);

        // here will be extracted new bindings
        this.setupSubscriptions();

        // subscribe on some new IDs and remove old IDs
        const unsubscribe = oldIDs.filter(id => !this.IDs.includes(id));
        if (unsubscribe.length) {
            this.props.context.linkContext.unsubscribe(unsubscribe);
        }

        const subscribe = this.IDs.filter(id => !oldIDs.includes(id));
        if (subscribe.length) {
            this.props.context.linkContext.subscribe(subscribe);
        }

        // calculate new widgetData and widgetStyle
        const { isRelative, widgetData, widgetStyle } = this.calcData(wid, widget, newWidgetData, newWidgetStyle);

        const newData = JSON.stringify(widgetData);
        const newStyle = JSON.stringify(widgetStyle);

        this.oldEditMode = this.state.editMode;
        this.oldData = newData; // with replaced bindings
        this.oldStyle = newStyle; // with replaced bindings

        widgetData.wid = wid; // legacy
        // try to apply bindings to every attribute
        this.props.context.allWidgets[wid] = {
            style: new this.props.context.can.Map(widgetStyle),
            data: new this.props.context.can.Map(widgetData),
            wid, // legacy
        };

        // Add to the global array of widgets
        let userGroups = widgetData['visibility-groups'];
        if (!this.state.editMode && userGroups?.length) {
            if (widgetData['visibility-groups-action'] === 'hide') {
                if (!this.isUserMemberOfGroup(this.props.context.user, userGroups)) {
                    return;
                }
                userGroups = null; // mark as processed
            }
        } else {
            userGroups = null;
        }

        try {
            // Append html element to view
            if (this.props.tpl) {
                if (!this.widDiv || !update || !widget?.data?.members.length) {
                    const options = {
                        data: this.props.context.allWidgets[wid].data,
                        viewDiv: this.props.view,
                        view: this.props.view,
                        style: this.props.context.allWidgets[wid].style,
                    };

                    if (widgetData?.oid) {
                        options.val = this.props.context.canStates.attr(`${widgetData.oid}.val`);
                    }
                    const widgetFragment = this.props.context.can.view(this.props.tpl, options);

                    // replace all scripts in the widget
                    const scripts = Array.from(widgetFragment.querySelectorAll('script'));
                    for (let i = 0; i < scripts.length; i++) {
                        const script = scripts[i];
                        const newScript = document.createElement('script');
                        newScript.innerHTML = script.innerHTML;
                        script.parentNode.replaceChild(newScript, script);
                    }

                    if (isRelative) {
                        // add widget according to the relativeWidgetOrder
                        const pos = this.props.relativeWidgetOrder.indexOf(wid);
                        if (pos === 0) {
                            parentDiv.prepend(widgetFragment);
                        } else if (pos === this.props.relativeWidgetOrder.length - 1) {
                            parentDiv.appendChild(widgetFragment);
                        } else {
                            // find any existing prepending widget
                            let div;
                            for (let i = pos + 1; i < this.props.relativeWidgetOrder.length; i++) {
                                div = parentDiv.querySelector(`#${this.props.relativeWidgetOrder[i]}`);
                                if (div) {
                                    parentDiv.insertBefore(widgetFragment, div);
                                    break;
                                }
                            }
                            // no existing prepending widgets found, so place first
                            if (!div) {
                                parentDiv.appendChild(widgetFragment);
                            }
                        }
                    } else {
                        parentDiv.appendChild(widgetFragment);
                    }
                }
            } else {
                console.error(`[${wid}] Widget is invalid. Please delete it.`);
                return;
            }

            this.widDiv = parentDiv.querySelector(`#${wid}`);

            if (this.widDiv) {
                if (this.props.context.allWidgets[wid].style && !widgetData._no_style) {
                    // fix position
                    VisCanWidget.applyStyle(this.widDiv, this.props.context.allWidgets[wid].style, this.state.selected, this.state.editMode);
                }

                this.widDiv.style.position = isRelative ? (this.props.context.allWidgets[wid].style.position || 'relative') : 'absolute';

                // by default, it is border-box
                this.widDiv.style.boxSizing = 'border-box';

                if (widgetData && widgetData.class) {
                    this.widDiv.className = addClass(this.widDiv.className, widgetData.class);
                }

                // add template classes to div
                const tplEl = window.document.getElementById(this.props.tpl);
                const visName = tplEl.dataset.visName || (wid[0] === 'g' ? 'group' : 'noname');
                const visSet = tplEl.dataset.visSet || 'noset';
                this.updateOnStyle = tplEl.dataset.visUpdateStyle === 'true';
                this.resizeLocked = tplEl.dataset.visResizeLocked === 'true';
                this.widDiv.className = addClass(this.widDiv.className, `vis-tpl-${visSet}-${visName.replace(/\s/g, '-')}`);

                if (!this.state.editMode) {
                    this.updateVisibility();

                    // Processing of gestures
                    if (this.props.context.$$) {
                        this.addGestures(widgetData);
                    }
                } else if (this.props.context.allWidgets[this.props.id]) {
                    const newState = analyzeDraggableResizable(this.widDiv, null, this.props.context.allWidgets[this.props.id].style);

                    if (this.state.resizable !== newState.resizable ||
                        this.state.hideHelper !== newState.hideHelper ||
                        this.state.draggable !== newState.draggable
                    ) {
                        setTimeout(() =>
                            this.setState(newState), 50);
                    }
                }

                // processing of signals
                let s = 0;
                while (widgetData[`signals-oid-${s}`]) {
                    this.addSignalIcon(widgetData, s);
                    s++;
                }

                if (widgetData['lc-oid']) {
                    this.addLastChange(widgetData);
                }

                if (!this.state.editMode && widgetData['echart-oid']) {
                    this.addChart(widgetData);
                }

                if (userGroups && widget.data['visibility-groups-action'] === 'disabled' && !this.isUserMemberOfGroup(this.props.context.user, userGroups)) {
                    this.widDiv.className = addClass(this.widDiv.className, 'vis-user-disabled');
                }

                if (this.refService.current) {
                    setTimeout(() => {
                        if (this.refService.current && this.widDiv) {
                            this.refService.current.style.width = `${this.widDiv.offsetWidth}px`;
                            this.refService.current.style.height = `${this.widDiv.offsetHeight}px`;
                            // Move helper to actual widget
                            if (isRelative) {
                                this.refService.current.style.left = `${this.widDiv.offsetLeft}px`;
                                this.refService.current.style.top = `${this.widDiv.offsetTop}px`;
                            }
                        }
                    }, 50);
                }

                this.onCommand('updateContainers');
            } else {
                console.log('Div not yet rendered');
            }

            this.props.askView && this.props.askView('register', {
                id: wid,
                winDiv: this.widDiv || null,
                refService: this.refService,
                onMove: this.onMove,
                onResize: this.onResize,
                onTempSelect: this.onTempSelect,
                onCommand: this.onCommandBound,
            });
        } catch (e) {
            const lines = (e.toString() + e.stack.toString()).split('\n');
            const error = `can't render ${this.props.tpl} ${wid} on "${this.props.view}": `;
            this.props.context.socket.log(error, 'error');
            console.error(error);
            for (let l = 0; l < lines.length; l++) {
                const line = `${l} - ${lines[l]}`;
                this.props.context.socket.log(line, 'error');
                console.error(line);
            }
        }
        cb && cb();
    }

    shouldComponentUpdate(nextProps, nextState) {
        const lastState = JSON.stringify(nextState);
        // if no widget yet rendered, we can update as frequent as we want
        if (!this.widDiv) {
            this.lastState = lastState;
            return true;
        }

        if (!this.lastState || lastState !== this.lastState) {
            this.lastState = lastState;
            return true;
        }

        return false;
    }

    renderWidgetBody(props) {
        if (this.state.applyBindings && !this.bindingsTimer) {
            this.bindingsTimer = setTimeout(() => {
                this.bindingsTimer = null;
                // console.log(`[${Date.now()}] Widget bindings ${JSON.stringify(this.state.applyBindings)}`);
                this.renderWidget(true);
            }, 10);
        }

        // this.widDiv is a body of normal can widget
        // props.style is a style of overlay

        if (this.widDiv && this.state.editMode && this.props.context.allWidgets[this.props.id]) {
            const zIndexProp = this.props.context.allWidgets[this.props.id].style['z-index'];
            const zIndex = parseInt((zIndexProp || 0), 10);
            if (this.state.selected) {
                // move widget overlay in foreground
                this.widDiv.style.zIndex = 500 + (zIndex || 0);
            } else if (zIndexProp !== undefined) {
                // overlay must be always on top of the widget itself
                this.widDiv.style.zIndex = parseInt((zIndexProp || 0), 10);
            }

            if (this.state.selected) {
                props.style.zIndex = 500 + (zIndex || 0) + 1; // + 800
            } else {
                props.style.zIndex = (zIndex || 0) + 1; // + 800
            }

            this.widDiv.style.userSelect = 'none';
            this.widDiv.style.pointerEvents = 'none';

            // restore visibility
            if (this.filterDisplay !== undefined) {
                this.widDiv.style.display = this.filterDisplay;
                delete this.filterDisplay;
            }
        }

        // the helper div is always absolute
        props.style.position = 'absolute';

        // this code is used only to represent containers, but sometime all of them should be rewritten in React
        const legacyViewContainers = this.state.legacyViewContainers.length ? this.state.legacyViewContainers.map(view => {
            const context = this.props.context;
            const VisView = context.VisView;
            this.refViews[view] = this.refViews[view] || React.createRef();
            const otherRef = context.linkContext.getViewRef(view);
            if (otherRef && otherRef !== this.refViews[view]) {
                console.log('View is not rendered as used somewhere else!');
                return null;
                /*
                <div ref={this.refViews[view]} key={view + Math.random() * 10000}>
                    View is not rendered as used somewhere else!
                </div>;
                */
            }
            if (view && context.views[view]) {
                return <VisView
                    context={context}
                    activeView={view}
                    editMode={false}
                    key={view}
                    ref={this.refViews[view]}
                    askView={props.askView}
                    view={view}
                    visInWidget
                />;
            }
            return null;
        }) : null;

        if (!this.state.editMode) {
            props.style.display = 'none';
        }

        return legacyViewContainers;
    }
}

VisCanWidget.propTypes = {
    id: PropTypes.string.isRequired,
    view: PropTypes.string.isRequired,
    editMode: PropTypes.bool,
    isRelative: PropTypes.bool,
    refParent: PropTypes.object.isRequired,
    selectedWidgets: PropTypes.array,
    relativeWidgetOrder: PropTypes.array,
    tpl: PropTypes.string.isRequired,
};

export default VisCanWidget;
