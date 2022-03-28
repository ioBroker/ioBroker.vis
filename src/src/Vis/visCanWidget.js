import React from 'react';
import PropTypes from 'prop-types';
import { getUsedObjectIDsInWidget, replaceGroupAttr } from './visUtils';

class VisCanWidget extends React.Component {
    constructor(props) {
        super(props);

        const outputs = {
            IDs: [],
            visibility: this.props.linkContext.visibility,
            bindings: this.props.linkContext.bindings,
            lastChanges: this.props.linkContext.lastChanges,
            signals: this.props.linkContext.signals,
        };

        this.widDiv = null; // div with widget

        getUsedObjectIDsInWidget(this.props.views, this.props.view, this.props.id, outputs);

        const widget = this.props.views[this.props.view].widgets[this.props.id];
        if (widget?.data?.members) {
            widget.data.members.forEach(wid =>
                getUsedObjectIDsInWidget(this.props.views, this.props.view, wid, outputs));
        }

        this.IDs = outputs.IDs;
        // attributes must exist before canJS renders the widget
        this.IDs.forEach(id => {
            if (this.props.canStates.attr(`${id}.val`) === undefined) {
                const o = {};
                // Check new model
                o[`${id}.val`] = null;
                o[`${id}.ts`] = null;
                o[`${id}.ack`] = null;
                o[`${id}.lc`] = null;
                o[`${id}.q`] = null;

                try {
                    this.props.canStates.attr(o);
                } catch (e) {
                    this.props.socket.log(`Error: can't create states object for ${id}(${e}): ${JSON.stringify(e.stack)}`, 'error');
                }
            }
        });
    }

    componentDidMount() {
        // subscribe on all IDs
        this.props.subscribe(this.IDs);
        if (!this.widDiv) {
            this.renderWidget(this.props.id, this.props.refParent.current);
        }
    }

    componentWillUnmount() {
        this.props.unsubscribe(this.IDs);
        this.destroy(this.props.id, this.widDiv);
    }

    destroy(wid, widDiv) {
        // destroy map
        if (this.props.allWidgets[wid]) {
            delete this.props.allWidgets[wid];
        }

        if (widDiv) {
            const $wid = this.props.jQuery(widDiv);
            const destroy = $wid.data('destroy');

            if (typeof destroy === 'function') {
                destroy(this.props.id, $wid);
                $wid.data('destroy', null);
            }

            // if group => destroy every group element
            const widget = this.props.views[this.props.view].widgets[wid];
            if (widget.members) {
                widget.members.forEach(_wid => this.destroy(_wid, widDiv.querySelector('#' + _wid)));
            }

            // remove from DOM
            widDiv.remove();
            widDiv = null;
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

    isWidgetFilteredOut(wid) {
        const widget = this.props.views[this.props.view].widgets[wid];
        const v = this.props.viewsActiveFilter[this.props.view];

        return widget?.data?.filterkey && v?.length > 0 && !v.includes(widget.data.filterkey);
    }

    isWidgetHidden(wid, val, widgetData) {
        widgetData = widgetData || this.props.views[this.props.view].widgets[wid];
        const oid = widgetData['visibility-oid'];
        const condition = widgetData['visibility-cond'];

        if (oid) {
            if (val === undefined || val === null) {
                val = this.props.canStates.attr(`${oid}.val`);
            }
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
                    console.log(`Unknown visibility condition for ${wid}: ${condition}`);
                    return false;
            }
        } else {
            return condition === 'not exist';
        }
    }

    addGestures(wid, widDiv, widgetData) {
        // gestures
        const gestures = ['swipeRight', 'swipeLeft', 'swipeUp', 'swipeDown', 'rotateLeft', 'rotateRight', 'pinchIn', 'pinchOut', 'swiping', 'rotating', 'pinching'];
        const $$wid = this.props.$$(`#${wid}`);
        const $wid = this.props.jQuery(widDiv);
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

    isSignalVisible(wid, index, val, widgetData) {
        widgetData = widgetData || this.props.views[this.props.view].widgets[wid].data;
        const oid = widgetData[`signals-oid-${index}`];

        if (oid) {
            if (val === undefined || val === null) {
                val = this.props.canStates.attr(`${oid}.val`);
            }

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
                    console.log(`Unknown signals condition for ${wid}: ${condition}`);
                    return false;
            }
        } else {
            return false;
        }
    }

    static applyStyle(el, style) {
        (style || '').split(';').forEach(part => {
            part = part.trim();
            if (part) {
                const [attr, value] = part.split(':');
                el.style[attr.trim()] = value.trim();
            }
        });
    }

    addSignalIcon(wid, widDiv, data, index) {
        // show icon
        let display = this.editMode || this.isSignalVisible(wid, index, undefined, data) ? '' : 'none';
        if (this.editMode && data[`signals-hide-edit-${index}`]) {
            display = 'none';
        }

        // <div class="vis-signal ${data[`signals-blink-${index}`] ? 'vis-signals-blink' : ''} ${data[`signals-text-class-${index}`] || ''} " data-index="${index}" style="display: ${display}; pointer-events: none; position: absolute; z-index: 10; top: ${data[`signals-vert-${index}`] || 0}%; left: ${data[`signals-horz-${index}`] || 0}%">
        const divSignal = window.document.createElement('div');
        divSignal.className = `vis-signal ${data[`signals-blink-${index}`] ? 'vis-signals-blink' : ''} ${data[`signals-text-class-${index}`] || ''}`;
        divSignal.dataset.index = index;
        divSignal.style.display = display;
        divSignal.style.pointerEvents = 'none';
        divSignal.style.position = 'absolute';
        divSignal.style.zIndex = '10';
        divSignal.style.top = `${data[`signals-vert-${index}`] || 0}%`;
        divSignal.style.left = `${data[`signals-horz-${index}`] || 0}%`;

        // <img class="vis-signal-icon" src="${data[`signals-icon-${index}`]}" style="width: ${data[`signals-icon-size-${index}`] || 32}px; height: auto;${data[`signals-icon-style-${index}`] || ''}"/>
        const divIcon = window.document.createElement('div');
        divIcon.className = 'vis-signal-icon';
        divIcon.src = data[`signals-icon-${index}`];
        divIcon.style.width = (data[`signals-icon-size-${index}`] || 32) + 'px';
        divIcon.style.height = 'auto';
        VisCanWidget.applyStyle(divIcon, data[`signals-icon-style-${index}`]);

        // <div class="vis-signal-text " style="${data[`signals-text-style-${index}`] || ''}">${data[`signals-text-${index}`]}</div>
        const text = data[`signals-text-${index}`];
        if (text) {
            const divText = window.document.createElement('div');
            divText.className = 'vis-signal-text';
            VisCanWidget.applyStyle(divText, data[`signals-text-style-${index}`]);
            divText.innerHTML = text;
            divSignal.appendChild(divText);
        }

        widDiv.appendChild(divSignal);
    }

    addLastChange(widDiv, data) {
        // show last change
        const border = `${parseInt(data['lc-border-radius'], 10) || 0}px`;
        const css = {
            background: 'rgba(182,182,182,0.6)',
            fontFamily: 'Tahoma',
            position: 'absolute',
            zIndex: 0,
            borderRadius: data['lc-position-horz'] === 'left' ? (`${border} 0 0 ${border}`) : (data['lc-position-horz'] === 'right' ? `0 ${border} ${border} 0` : border),
            whiteSpace: 'nowrap',
        };
        if (data['lc-font-size']) {
            css.fontSize = data['lc-font-size'];
        }
        if (data['lc-font-style']) {
            css.fontStyle = data['lc-font-style'];
        }
        if (data['lc-font-family']) {
            css.fontFamily = data['lc-font-family'];
        }
        if (data['lc-bkg-color']) {
            css.background = data['lc-bkg-color'];
        }
        if (data['lc-color']) {
            css.color = data['lc-color'];
        }
        if (data['lc-border-width']) {
            css.borderWidth = parseInt(data['lc-border-width'], 10) || 0;
        }
        if (data['lc-border-style']) {
            css.borderStyle = data['lc-border-style'];
        }
        if (data['lc-border-color']) {
            css.borderColor = data['lc-border-color'];
        }
        if (data['lc-padding']) {
            css.padding = data['lc-padding'];
        } else {
            css.paddingTop = 3;
            css.paddingBottom = 3;
        }
        if (data['lc-zindex']) {
            css.zIndex = data['lc-zindex'];
        }
        if (data['lc-position-vert'] === 'top') {
            css.top = parseInt(data['lc-offset-vert'], 10);
        } else if (data['lc-position-vert'] === 'bottom') {
            css.bottom = parseInt(data['lc-offset-vert'], 10);
        } else if (data['lc-position-vert'] === 'middle') {
            css.top = `calc(50% + ${parseInt(data['lc-offset-vert'], 10) - 10}px)`;
        }
        const offset = parseFloat(data['lc-offset-horz']) || 0;
        if (data['lc-position-horz'] === 'left') {
            css.right = `calc(100% - ${offset}px)`;
            if (!data['lc-padding']) {
                css.paddingRight = '10px';
                css.paddingLeft = '10px';
            }
        } else if (data['lc-position-horz'] === 'right') {
            css.left = `calc(100% + ${offset}px)`;
            if (!data['lc-padding']) {
                css.paddingRight = '10px';
                css.paddingLeft = '10px';
            }
        } else if (data['lc-position-horz'] === 'middle') {
            css.left = `calc(50% + ${offset}px)`;
        }

        const divLastChange = window.document.createElement('div');
        // `<div class="vis-last-change" data-type="${data['lc-type']}" data-format="${data['lc-format']}" data-interval="${data['lc-is-interval']}">${this.binds.basic.formatDate(this.states.attr(`${data['lc-oid']}.${data['lc-type'] === 'last-change' ? 'lc' : 'ts'}`), data['lc-format'], data['lc-is-interval'], data['lc-is-moment'])}</div>`
        divLastChange.className = 'vis-last-change';
        divLastChange.dataset.lcType = data['lc-type'];
        divLastChange.dataset.format = data['lc-format'];
        divLastChange.dataset.interval = data['lc-is-interval'];
        divLastChange.innerHTML = this.binds.basic.formatDate(this.props.canStates.attr(`${data['lc-oid']}.${data['lc-type'] === 'last-change' ? 'lc' : 'ts'}`), data['lc-format'], data['lc-is-interval'], data['lc-is-moment']);
        Object.keys(css).forEach(attr => divLastChange.style[attr] = css[attr]);

        widDiv.prepend(divLastChange);
        widDiv.style.overflow = 'visible';
    }

    addChart(widDiv, wData) {
        widDiv.onclick = () => {
            // not yet implemented
            console.log(`Show dialog with chart for ${wData['echart-oid']}`);
        };
    }

    renderWidget(wid, parentDiv) {
        let widget = this.props.views[this.props.view].widgets[wid];

        if (widget?.groupid) {
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

        // Add to the global array of widgets
        let userGroups = widget.data['visibility-groups'];
        if (!this.props.editMode && userGroups?.length) {
            if (widget.data['visibility-groups-action'] === 'hide') {
                if (!this.isUserMemberOfGroup(this.props.user, userGroups)) {
                    return;
                }
                userGroups = null; // mark as processed
            }
        }

        try {
            let widDiv = parentDiv.querySelector('#' + wid);
            this.destroy(wid, widDiv);

            try {
                this.props.allWidgets[wid] = new this.props.can.Map({ wid, ...widget.data });
            } catch (e) {
                console.log(`Cannot bind data of widget widget: ${wid}`);
                return;
            }

            const widgetData = this.props.allWidgets[wid];

            // Append html element to view
            if (widget.tpl) {
                const options = {
                    data: widgetData,
                    viewDiv: this.props.view,
                    view: this.props.view,
                    style: widget.style,
                };
                if (widgetData?.oid) {
                    options.val = this.props.canStates.attr(`${widgetData.oid}.val`);
                }
                const widgetFragment = this.props.can.view(widget.tpl, options);
                parentDiv.appendChild(widgetFragment);
            } else {
                console.error(`Widget "${wid}" is invalid. Please delete it.`);
                return;
            }

            widDiv = parentDiv.querySelector('#' + wid);
            this.widDiv = this.widDiv || widDiv; // remember main div (group or simple)

            if (widDiv) {
                if (widget.style && !widgetData._no_style) {
                    // fix position
                    Object.keys(widget.style).forEach(attr => {
                        const val = widget.style[attr];
                        if (attr === 'top' || attr === 'left' || attr === 'width' || attr === 'height') {
                            if (val !== '0' && val !== 0 && val !== null && val !== '' && val.toString().match(/^[-+]?\d+$/)) {
                                widget.style[attr] = `${val}px`;
                            }
                        }
                        widDiv.style[attr] = val;
                    });
                }

                if (!this.props.isRelative) {
                    widDiv.style.position = 'absolute';
                }

                if (widgetData && widgetData.class) {
                    widDiv.className += ' ' + widgetData.class;
                }

                // add template classes to div
                const tplEl = window.document.getElementById(widget.tpl);
                const visName = tplEl.dataset.visName || (wid[0] === 'g' ? 'group' : 'noname');
                const visSet = tplEl.dataset.visSet || 'noset';
                widDiv.className += ` vis-tpl-${visSet}-${visName.replace(/\s/g, '-')}`;

                if (!this.editMode) {
                    if (this.isWidgetFilteredOut(wid) || this.isWidgetHidden(wid, undefined, widgetData)) {
                        widDiv._storedDisplay = widDiv.style.display;
                        widDiv.style.display = 'none';

                        if (widDiv._customHandlers?.onHide) {
                            widDiv._customHandlers.onHide(widDiv, wid);
                        }
                    }

                    // Processing of gestures
                    if (this.props.$$) {
                        this.addGestures(wid, widDiv, widgetData);
                    }
                }

                // processing of signals
                let s = 0;
                while (widgetData[`signals-oid-${s}`]) {
                    this.addSignalIcon(wid, widDiv, widgetData, s);
                    s++;
                }

                if (widgetData['lc-oid']) {
                    this.addLastChange(widDiv, widgetData);
                }

                if (!this.editMode && widgetData['echart-oid']) {
                    this.addChart(widDiv, widgetData);
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

                if (userGroups && widDiv) {
                    if (!this.isUserMemberOfGroup(this.props.user, userGroups)) {
                        widDiv.className += ' vis-user-disabled';
                    }
                }

                // if it is a group, render all sub widgets in this group
                widgetData.members && widgetData.members.forEach(_wid =>
                    _wid !== wid && this.renderWidget(_wid, widDiv));
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
        return <div id={'rx_' + this.props.id} style={{ display: 'none' }} />;
    }
}

VisCanWidget.propTypes = {
    id: PropTypes.string.isRequired,
    views: PropTypes.object.isRequired,
    view: PropTypes.string.isRequired,
    subscribe: PropTypes.func.isRequired,
    unsubscribe: PropTypes.func.isRequired,
    can: PropTypes.object.isRequired,
    canStates: PropTypes.object.isRequired,
    editMode: PropTypes.bool,
    userGroups: PropTypes.object.isRequired,
    user: PropTypes.string.isRequired,
    allWidgets: PropTypes.object.isRequired,
    jQuery: PropTypes.func,
    socket: PropTypes.object,
    isRelative: PropTypes.bool,
    viewsActiveFilter: PropTypes.object,
    setValue: PropTypes.func,
    $$: PropTypes.func, // Gestures library
    refParent: PropTypes.object.isRequired,
    linkContext: PropTypes.object,
};

export default VisCanWidget;
