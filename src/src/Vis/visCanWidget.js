import React from 'react';
import PropTypes from 'prop-types';
import { getUsedObjectIDsInWidget, replaceGroupAttr } from './visUtils';

const FORBIDDEN_CHARS = /[^._\-/ :!#$%&()+=@^{}|~]+/g; // from https://github.com/ioBroker/ioBroker.js-controller/blob/master/packages/common/lib/common/tools.js
// var FORBIDDEN_CHARS = /[^._\-/ :!#$%&()+=@^{}|~\p{Ll}\p{Lu}\p{Nd}]+/gu; // it must be like this, but old browsers does not support Unicode


class VisCanWidget extends React.Component {
    constructor(props) {
        super(props);

        const widget = this.props.views[this.props.view].widgets[this.props.id];

        this.editMode = this.props.editMode;

        this.state = {
            data: JSON.stringify(widget.data),
            style: JSON.stringify(widget.style),
            groupid: widget.groupid,
            mounted: false,
        };

        this.bindings = {};
        this.bindingsCache = {};

        const linkContext = {
            IDs: [],
            bindings: this.bindings,
            visibility: this.props.linkContext.visibility,
            lastChanges: this.props.linkContext.lastChanges,
            signals: this.props.linkContext.signals,
        };

        this.widDiv = null; // div with widget

        getUsedObjectIDsInWidget(this.props.views, this.props.view, this.props.id, linkContext);

        this.IDs = linkContext.IDs;

        // merge bindings
        Object.keys(this.bindings).forEach(id => {
            this.props.linkContext.bindings[id] = this.props.linkContext.bindings[id] || [];
            this.bindings[id].forEach(item => this.props.linkContext.bindings[id].push(item));
        });

        // free mem
        Object.keys(linkContext).forEach(attr => linkContext[attr] = null);

        this.props.linkContext.registerChangeHandler(this.props.id, this.changeHandler);
    }

    componentDidMount() {
        // subscribe on all IDs
        this.props.linkContext.subscribe(this.IDs);

        if (!this.widDiv) {
            // link could be a ref or direct a div (e.g. by groups)
            this.renderWidget();
            this.setState({ mounted: true });
        }
    }

    static removeFromArray(items, IDs, view, widget) {
        Object.keys(items).forEach(id => {
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
        this.props.linkContext.unsubscribe(this.IDs);
        this.props.linkContext.unregisterChangeHandler(this.props.id, this.changeHandler);
        this.bindings = {};

        // remove all bindings from prop.linkContexts
        VisCanWidget.removeFromArray(this.props.linkContext.visibility, this.IDs, this.props.view, this.props.id);
        VisCanWidget.removeFromArray(this.props.linkContext.lastChanges, this.IDs, this.props.view, this.props.id);
        VisCanWidget.removeFromArray(this.props.linkContext.signals, this.IDs, this.props.view, this.props.id);
        VisCanWidget.removeFromArray(this.props.linkContext.bindings, this.IDs, this.props.view, this.props.id);

        this.destroy(this.props.id, this.widDiv);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const views = JSON.stringify(nextProps.views);
        /*if (views !== this.jsonViews) {
            //this.jsonViews = views;
            //this.vis.updateViews(JSON.parse(JSON.stringify(nextProps.views)));
        }*/

        if (nextProps.editMode !== this.editMode) {
            this.editMode = nextProps.editMode;
            // rerender Widget
            this.renderWidget(true);
        }
    }

    destroy(update) {
        // destroy map
        if (this.props.allWidgets[this.props.id]) {
            delete this.props.allWidgets[this.props.id];
        }

        // do not destory groups by update
        if (this.widDiv && (!update || !this.props.id.startsWith('g'))) {
            const $wid = this.props.jQuery(this.widDiv);
            const destroy = $wid.data('destroy');

            if (typeof destroy === 'function') {
                destroy(this.props.id, $wid);
                $wid.data('destroy', null);
            }

            // remove from DOM
            this.widDiv.remove();
            this.widDiv = null;
        }
    }

    changeHandler = (type, item, stateId) => {
        // console.log(`[${this.props.id}] update widget because of "${type}" "${stateId}": ${JSON.stringify(state)}`);
        if (this.widDiv) {
            if (type === 'style') {
                // apply style from this.props.allWidgets.style
                VisCanWidget.applyStyle(this.widDiv, this.props.allWidgets[this.props.id].style);
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
    }

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
            const widgetData = this.props.allWidgets[this.props.id].data;
            const lcDiv = this.widDiv.querySelector('.vis-last-change');
            if (lcDiv) {
                lcDiv.innerHTML = this.binds.basic.formatDate(
                    this.props.canStates.attr(`${widgetData['lc-oid']}.${widgetData['lc-type'] === 'last-change' ? 'lc' : 'ts'}`),
                    widgetData['lc-format'], widgetData['lc-is-interval'],
                    widgetData['lc-is-moment'],
                );
            } else {
                console.warn(`[${this.props.id}] Last change not found!`);
            }
        }
    }

    updateVisibility() {
        if (this.widDiv && !this.editMode) {
            if (this.isWidgetHidden() || this.isWidgetFilteredOut()) {
                this.widDiv._storedDisplay = this.widDiv.style.display;
                this.widDiv.style.display = 'none';

                if (this.widDiv
                    && this.widDiv._customHandlers
                    && this.widDiv._customHandlers.onHide
                ) {
                    this.widDiv._customHandlers.onHide(this.widDiv, this.props.id);
                }
            } else {
                this.widDiv.style.display = this.widDiv._storedDisplay || 'block';
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

    isUserMemberOfGroup(user, userGroups) {
        if (!userGroups) {
            return true;
        }
        if (!Array.isArray(userGroups)) {
            userGroups = [userGroups];
        }

        return !!userGroups.find(groupId => {
            const group = this.props.userGroups[`system.group.${groupId}`];
            if (group?.common?.members?.length && group.common.members.includes(`system.user.${user}`)) {
                return true;
            }
        });
    }

    isWidgetFilteredOut() {
        const widgetData = this.props.allWidgets[this.props.id].data;
        const v = this.props.viewsActiveFilter[this.props.view];

        return widgetData?.filterkey && v?.length > 0 && !v.includes(widgetData.filterkey);
    }

    isWidgetHidden() {
        const widgetData = this.props.allWidgets[this.props.id].data;

        const oid = widgetData['visibility-oid'];
        const condition = widgetData['visibility-cond'];

        if (oid) {
            let val = this.props.canStates.attr(`${oid}.val`);

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
            return condition === 'not exist';
        }
    }

    addGestures(widgetData) {
        // gestures
        const gestures = ['swipeRight', 'swipeLeft', 'swipeUp', 'swipeDown', 'rotateLeft', 'rotateRight', 'pinchIn', 'pinchOut', 'swiping', 'rotating', 'pinching'];
        const $$wid = this.props.$$(`#${this.props.id}`);
        const $wid = this.props.jQuery(this.widDiv);
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
                let valState = this.props.canStates.attr(`${oid}.val`);
                let $indicator;
                if (valState !== undefined && valState !== null) {
                    $wid.on('touchmove', evt =>
                        evt.preventDefault());

                    $wid.css({
                        '-webkit-user-select': 'none',
                        '-khtml-user-select': 'none',
                        '-moz-user-select': 'none',
                        '-ms-user-select': 'none',
                        'user-select': 'none',
                    });

                    $$wid[gesture](data => {
                        valState = this.props.canStates.attr(`${oid}.val`);

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

                                        const that = this;
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
                                        this.props.setValue(oid, newVal);
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
                        this.props.setValue(oid, newVal);
                        newVal = null;
                    });
                }
            }
        });
    }

    isSignalVisible(index, widgetData) {
        widgetData = widgetData || this.props.allWidgets[this.props.id].data;

        if (this.editMode) {
            return !widgetData[`signals-hide-edit-${index}`];
        }

        const oid = widgetData[`signals-oid-${index}`];

        if (oid) {
            let val = this.props.canStates.attr(`${oid}.val`);

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
            } else
            if (t === 'number') {
                value = parseFloat(value);
            } else
            if (t === 'object') {
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

    static applyStyle(el, style) {
        if (typeof style === 'string') {
            // style is a string
            // "height: 10; width: 20"
            (style || '').split(';').forEach(part => {
                part = part.trim();
                if (part) {
                    let [attr, value] = part.split(':');
                    attr = attr.trim();
                    if (attr && value) {
                        value = value.trim();
                        if (attr === 'top' || attr === 'left' || attr === 'width' || attr === 'height') {
                            if (value !== '0' && value.toString().match(/^[-+]?\d+$/)) {
                                value = `${value}px`;
                            }
                        }
                        if (value) {
                            el.style[attr] = value;
                        }
                    }
                }
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

    addSignalIcon(widgetData, index) {
        widgetData = widgetData || this.props.allWidgets[this.props.id].data;

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
        if (src && src.startsWith('/vis/')) {
            src = src.substring(5);
        }
        divIcon.src = src;
        divIcon.style.width = (widgetData[`signals-icon-size-${index}`] || 32) + 'px';
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
                css.paddingRight = '10px';
                css.paddingLeft = '10px';
            }
        } else if (widgetData['lc-position-horz'] === 'right') {
            css.left = `calc(100% + ${offset}px)`;
            if (!widgetData['lc-padding']) {
                css.paddingRight = '10px';
                css.paddingLeft = '10px';
            }
        } else if (widgetData['lc-position-horz'] === 'middle') {
            css.left = `calc(50% + ${offset}px)`;
        }

        const divLastChange = window.document.createElement('div');
        // `<div class="vis-last-change" data-type="${data['lc-type']}" data-format="${data['lc-format']}" data-interval="${data['lc-is-interval']}">${this.binds.basic.formatDate(this.states.attr(`${data['lc-oid']}.${data['lc-type'] === 'last-change' ? 'lc' : 'ts'}`), data['lc-format'], data['lc-is-interval'], data['lc-is-moment'])}</div>`
        divLastChange.className = 'vis-last-change';
        divLastChange.innerHTML = this.binds.basic.formatDate(
            this.props.canStates.attr(`${widgetData['lc-oid']}.${widgetData['lc-type'] === 'last-change' ? 'lc' : 'ts'}`),
            widgetData['lc-format'],
            widgetData['lc-is-interval'],
            widgetData['lc-is-moment'],
        );
        Object.keys(css).forEach(attr => divLastChange.style[attr] = css[attr]);

        this.widDiv.prepend(divLastChange);
        this.widDiv.style.overflow = 'visible';
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
            if (oid && oid.length < 300 && (/^[^.]*\.\d*\..*|^[^.]*\.[^.]*\.[^.]*\.\d*\..*/).test(oid) && FORBIDDEN_CHARS.test(oid)) {
                const obj = {
                    view: binding.view,
                    widget: binding.widget,
                };

                // on runtime load oid, check if oid needs to be subscribed
                Object.keys(this.props.linkContext.visibility).forEach(id => {
                    const widgetIndex = this.props.linkContext.visibility[id].findIndex(x => x.widget === obj.widget);

                    // remove or add widget to existing oid's in visibility list
                    if (widgetIndex >= 0 && id !== oid) {
                        // widget exists in visibility list
                        this.props.linkContext.visibility[id].splice(widgetIndex, 1);
                    } else if (widgetIndex < 0 && id === oid) {
                        // widget not exists in visibility list
                        this.props.linkContext.visibility[id].push(obj);
                    }
                });

                if (!this.props.linkContext.visibility[oid]) {
                    // oid not exist in visibility list -> add oid and widget to visibility list
                    this.props.linkContext.visibility[oid] = [obj];
                }

                // on runtime load oid, check if oid need subscribe
                if (!this.editMode) {
                    if (this.IDs.includes(oid)) {
                        this.updateVisibility();
                    } else {
                        this.IDs.push(oid);
                        const val = this.props.canStates.attr(`${oid}.val`);
                        if (val !== undefined) {
                            this.updateVisibility();
                        }

                        this.props.linkContext.subscribe([oid]);
                    }
                }
            }
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
                    !doNotAllyStyles && VisCanWidget.applyStyle(this.widDiv, widgetContext.style);
                }
            }
            // TODO
            // this.subscribeOidAtRuntime(value);
            // this.visibilityOidBinding(binding, value);
            // this.reRenderWidget(binding.view, binding.view, bid);
        });
    }

    renderWidget(update) {
        let parentDiv = this.props.refParent;
        if (parentDiv.hasOwnProperty('current')) {
            parentDiv = parentDiv.current;
        }

        const wid = this.props.id;
        let widget = this.props.views[this.props.view].widgets[wid];

        // replace groupAttrX in groups
        if (widget?.groupid) {
            // this widget belongs to group
            const parentWidgetData = this.props.views[this.props.view].widgets[widget.groupid].data;
            const aCount = parseInt(parentWidgetData.attrCount, 10);

            if (aCount && widget.data) {
                widget = JSON.parse(JSON.stringify(widget));

                Object.keys(widget.data).forEach(attr => {
                    if (typeof widget.data[attr] === 'string') {
                        const result = replaceGroupAttr(widget.data[attr], parentWidgetData);
                        if (result.doesMatch) {
                            widget.data[attr] = result.newString || '';
                        }
                    }
                });
            }
        }

        this.destroy(update);

        // Add to the global array of widgets
        let userGroups = widget.data['visibility-groups'];
        if (!this.editMode && userGroups?.length) {
            if (widget.data['visibility-groups-action'] === 'hide') {
                if (!this.isUserMemberOfGroup(this.props.user, userGroups)) {
                    return;
                }
                userGroups = null; // mark as processed
            }
        }

        try {
            // try to apply bindings to every attribute
            this.props.allWidgets[wid] = {
                style: JSON.parse(JSON.stringify(widget.style)),
                data: new this.props.can.Map({ wid, ...widget.data }),
            };

            this.applyBindings(true);
        } catch (e) {
            return console.log(`[${this.props.id}] Cannot bind data of widget: ${e}`);
        }

        try {
            const widgetData = this.props.allWidgets[wid].data;
            const widgetStyle = this.props.allWidgets[wid].style;

            // Append html element to view
            if (widget.tpl) {
                if (!this.widDiv || !update || !widget?.data?.members.length) {
                    const options = {
                        data: widgetData,
                        viewDiv: this.props.view,
                        view: this.props.view,
                        style: widgetStyle,
                    };

                    if (widgetData?.oid) {
                        options.val = this.props.canStates.attr(`${widgetData.oid}.val`);
                    }
                    const widgetFragment = this.props.can.view(widget.tpl, options);
                    parentDiv.appendChild(widgetFragment);
                }
            } else {
                console.error(`[${this.props.id}] Widget is invalid. Please delete it.`);
                return;
            }

            this.widDiv = parentDiv.querySelector('#' + wid);

            if (this.widDiv) {
                if (widgetStyle && !widgetData._no_style) {
                    // fix position
                    VisCanWidget.applyStyle(this.widDiv, widgetStyle);
                }

                const isRelative = this.props.isRelative !== undefined ? this.props.isRelative :
                    widgetStyle && (
                        widgetStyle.position === 'relative' ||
                        widgetStyle.position === 'static' ||
                        widgetStyle.position === 'sticky'
                    );

                if (!isRelative) {
                    this.widDiv.style.position = 'absolute';
                }

                if (widgetData && widgetData.class) {
                    this.widDiv.className += ' ' + widgetData.class;
                }

                // add template classes to div
                const tplEl = window.document.getElementById(widget.tpl);
                const visName = tplEl.dataset.visName || (wid[0] === 'g' ? 'group' : 'noname');
                const visSet = tplEl.dataset.visSet || 'noset';
                this.widDiv.className += ` vis-tpl-${visSet}-${visName.replace(/\s/g, '-')}`;

                if (!this.editMode) {
                    this.updateVisibility();

                    // Processing of gestures
                    if (this.props.$$) {
                        this.addGestures(widgetData);
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

                if (!this.editMode && widgetData['echart-oid']) {
                    this.addChart(widgetData);
                }

                // If edit mode, bind on click event to open this widget in edit dialog
                if (this.editMode) {
                    // this.bindWidgetClick(viewDiv, view, id);

                    // @SJ cannot select menu and dialogs if it is enabled
                    /* if (this.$('#wid_all_lock_f').hasClass("ui-state-active")) {
                     this.$('#' + id).addClass("vis-widget-lock")
                     } */
                }

                // this.$(document).trigger('wid_added', id);

                if (userGroups && this.widDiv) {
                    if (!this.isUserMemberOfGroup(this.props.user, userGroups)) {
                        this.widDiv.className += ' vis-user-disabled';
                    }
                }
            }
        } catch (e) {
            const lines = (e.toString() + e.stack.toString()).split('\n');
            this.props.socket.log.error(`can't render ${widget.tpl} ${wid} on "${this.props.view}": `);
            for (let l = 0; l < lines.length; l++) {
                this.props.socket.log.error(`${l} - ${lines[l]}`);
            }
        }
    }

    render() {
        const widget = this.props.views[this.props.view].widgets[this.props.id];
        const groupWidgets = widget?.data?.members;
        let rxGroupWidgets = null;
        if (groupWidgets?.length && this.state.mounted && this.widDiv) {
            rxGroupWidgets = groupWidgets.map(wid =>
                <VisCanWidget
                    key={wid}
                    id={wid}
                    views={this.props.views}
                    view={this.props.view}
                    can={this.props.can}
                    canStates={this.props.canStates}
                    userGroups={this.props.userGroups}
                    user={this.props.user}
                    allWidgets={this.props.allWidgets}
                    refParent={this.widDiv}
                    editMode={this.props.editMode}
                    jQuery={this.props.jQuery}
                    socket={this.props.socket}
                    viewsActiveFilter={this.props.viewsActiveFilter}
                    setValue={this.props.setValue}
                    $$={this.props.$$}
                    linkContext={this.props.linkContext}
                    formatUtils={this.props.formatUtils}
                />);
        }

        return <div id={`rx_${this.props.id}`} style={{ display: 'none' }}>{ rxGroupWidgets }</div>;
    }
}

VisCanWidget.propTypes = {
    id: PropTypes.string.isRequired,
    views: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    can: PropTypes.object.isRequired,
    canStates: PropTypes.object.isRequired,
    editMode: PropTypes.bool.isRequired,
    userGroups: PropTypes.object.isRequired,
    user: PropTypes.string.isRequired,
    allWidgets: PropTypes.object.isRequired,
    jQuery: PropTypes.func.isRequired,
    socket: PropTypes.object.isRequired,
    isRelative: PropTypes.bool,
    viewsActiveFilter: PropTypes.object.isRequired,
    setValue: PropTypes.func.isRequired,
    $$: PropTypes.func, // Gestures library
    refParent: PropTypes.object.isRequired,
    linkContext: PropTypes.object.isRequired,
    formatUtils: PropTypes.object,
};

export default VisCanWidget;