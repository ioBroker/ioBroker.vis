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

import './css/vis.css';
/*
import $ from 'jquery';
import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/selectable.css';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/datepicker';
import 'jquery-ui/ui/widgets/selectable';
import 'jquery-ui/ui/widgets/progressbar';
import 'jquery-ui/ui/widgets/dialog';
import 'jquery-ui/ui/widgets/slider';
*/
import './lib/can.custom.js';
import $$ from './lib/quo.standalone'; // Gestures library
import './visWords';
import VisView from './visView';
import VisFormatUtils from './visFormatUtils';
import { getUrlParameter } from './visUtils';

class VisEngine extends React.Component {
    constructor(props) {
        super(props);
        window.jQuery = window.$;
        window.$ = window.jQuery; // jQuery library
        window.$$ = $$; // Gestures library
        window.systemLang = this.props.lang || window.systemLang || 'en';

        this.state = {
            ready: false,
        };

        // this.jsonViews = JSON.stringify(props.views);

        // this.divRef = React.createRef();

        this.can = window.can;

        this.subscribes = {};
        this.allWidgets = {};
        this.wakeUpCallbacks = [];
        this.widgetChangeHandlers = {};
        this.refViews = []; // List of views (refs)
        this.fontNames = [
            'Verdana, Geneva, sans-serif',
            'Georgia, "Times New Roman", Times, serif',
            '"Courier New", Courier, monospace',
            'Arial, Helvetica, sans-serif',
            'Tahoma, Geneva, sans-serif',
            '"Trebuchet MS", Arial, Helvetica, sans-serif',
            '"Arial Black", Gadget, sans-serif',
            '"Times New Roman", Times, serif',
            '"Palatino Linotype", "Book Antiqua", Palatino, serif',
            '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
            '"MS Serif", "New York", serif',
            '"Comic Sans MS", cursive',
        ];
        this.viewsActiveFilter = {};
        this.statesDebounce = {};
        this.onChangeCallbacks = [];
        this.bindingsCache = {};

        this.idControlInstance = `${this.props.adapterName}.${this.props.instance}.control.instance`;
        this.idControlData = `${this.props.adapterName}.${this.props.instance}.control.data`;
        this.idControlCommand = `${this.props.adapterName}.${this.props.instance}.control.command`;

        this.linkContext = {
            visibility: {},
            signals: {},
            lastChanges: {},
            bindings: {},
            unregisterChangeHandler: this.unregisterChangeHandler,
            registerChangeHandler: this.registerChangeHandler,
            subscribe: this.subscribe,
            unsubscribe: this.unsubscribe,
            getViewRef: this.getViewRef,
            registerViewRef: this.registerViewRef,
            unregisterViewRef: this.unregisterViewRef,
        };

        this.conn = this.createConnection();
        this.canStates = this.initCanObjects();
        this.vis = this.createLegacyVisObject();

        window.vis = this.vis;

        this.formatUtils = new VisFormatUtils({ vis: this.vis });

        this.loadLegacyObjects()
            .then(() => this.loadEditWords())
            .then(() => this.readGroups())
            .then(userGroups => {
                this.userGroups = userGroups;
                return this.props.socket.getCurrentUser();
            })
            .then(user => {
                this.user = user;
                this.vis.user = user;
                this.vis.loginRequired = this.props.socket.isSecure;
                return this.props.socket.getSystemConfig();
            })
            .then(systemConfig => {
                this.vis.dateFormat = systemConfig.common.dateFormat;
                this.vis.isFloatComma = systemConfig.common.isFloatComma;
                this.systemLang = systemConfig.common.language || 'en';
                this.vis.language = systemConfig.common.language || 'en';
                return this.loadWidgets();
            })
            .then(() => this.setState({ ready: true }));
    }

    componentDidMount() {
        window.document.addEventListener('keydown', this.onKeyPress);
    }

    componentWillUnmount() {
        // unsubscribe all
        Object.keys(this.subscribes).forEach(id =>
            this.props.socket.unsubscribeState(id, this.onStateChange));

        window.document.removeEventListener('keydown', this.onKeyPress);

        this.subscribes = {};
    }

    onKeyPress = e => {
        console.log(e.key);
        if (e.key === 'Delete') {

        }
    }

    loadLegacyObjects() {
        if (this.props.runtime) {
            return Promise.resolve();
        }

        return this.conn.getObjects()
            .then(objects => this.vis.objects = objects);
    }

    createLegacyVisObject() {
        return {
            states: this.canStates,
            objects: {},
            activeWidgets: [],
            navChangeCallbacks: [],
            editMode: !!this.props.editMode,
            binds: {},
            views: this.props.views,
            activeView: this.props.activeView,
            language: this.props.lang,
            user: '',
            _: window._,
            dateFormat: '',
            instance: this.props.instance,
            loginRequired: false,
            viewsActiveFilter: this.viewsActiveFilter,
            onChangeCallbacks: this.onChangeCallbacks,
            conn: this.conn,
            updateContainers: () => {
                const refViews = this.refViews;
                Object.keys(refViews).forEach(view => refViews[view].onCommand('updateContainers'));
            },
            renderView: (viewDiv, view, hidden, cb) => {
                console.warn('renderView not implemented: ', viewDiv, view, hidden);
                cb && cb(viewDiv, view);
            },
            destroyUnusedViews: () => {
                console.warn('destroyUnusedViews not implemented');
            },
            changeFilter: (view, filter, showEffect, showDuration, hideEffect, hideDuration) => {
                console.warn('changeFilter not implemented: ', view, filter, showEffect, showDuration, hideEffect, hideDuration);
            },
            detectBounce: (el, isUp) => {
                console.warn('detectBounce not implemented: ', el, isUp);
            },
            setValue: this.setValue,
            changeView: (viewDiv, view, hideOptions, showOptions, sync, cb) => {
                window.location.hash = `#${encodeURIComponent(view)}`;
                cb && cb(viewDiv, view);
            },
            onWakeUp: (cb, wid) => {
                if (!wid) {
                    console.warn('No widget ID for onWakeUp callback! Please fix');
                }
                console.warn('onWakeUp not implemented');
                this.wakeUpCallbacks.push({ cb, wid });
            },
            inspectWidgets: (viewDiv, view, addWidget, delWidget, onlyUpdate) => {
                console.warn('inspectWidgets not implemented: ', viewDiv, view, addWidget, delWidget, onlyUpdate);
            },
            showMessage: (message, title, icon, width, callback) => {
                console.warn('showMessage not implemented: ', message, title, icon, width);
            },
            showWidgetHelper: (viewDiv, view, wid, isShow) => {
                console.warn('showWidgetHelper not implemented: ', viewDiv, view, wid, isShow);
            },
            findNearestResolution: (resultRequiredOrX, height) => this.findNearestResolution(resultRequiredOrX, height),
            addFont: fontName => {
                if (!this.fontNames.includes(fontName)) {
                    this.fontNames.push(fontName);
                    if (this.props.onFontsUpdate) {
                        this.fontTimer && clearTimeout(this.fontTimer);
                        this.fontTimer = setTimeout(() => {
                            this.fontTimer = null;
                            this.props.onFontsUpdate(this.fontNames);
                        });
                    }
                }
            },
            registerOnChange: (callback, arg, wid) => {
                !wid && console.warn('No widget ID for registerOnChange callback! Please fix');

                if (!this.onChangeCallbacks.find(item => item.callback === callback && item.arg === arg && (!wid || item.wid === wid))) {
                    this.onChangeCallbacks.push({ callback, arg, wid });
                }
            },
            unregisterOnChange(callback, arg, wid) {
                !wid && console.warn('No widget ID for unregisterOnChange callback! Please fix');

                const index = this.onChangeCallbacks.findIndex(item => item.callback === callback &&
                    (arg === undefined || arg === null || item.arg === arg) &&
                    (!wid || item.wid === wid));

                if (index >= 0) {
                    this.onChangeCallbacks.splice(index, 1);
                }
            },
        };
    }

    createConnection() {
        // props.socket
        return {
            namespace: 'vis.0',
            logError: errorText => {
                console.error(`Error: ${errorText}`);
                this.props.socket.log(errorText, 'error');
            },
            getGroups: (groupName, useCache, cb) => {
                if (typeof groupName === 'function') {
                    cb = groupName;
                    groupName = null;
                    useCache = false;
                }
                if (typeof groupName === 'boolean') {
                    cb = useCache;
                    useCache = groupName;
                    groupName = null;
                }
                if (typeof useCache === 'function') {
                    cb = useCache;
                    useCache = false;
                }
                groupName = groupName || '';

                return this.props.socket.getGroups(!useCache)
                    .then(groups => {
                        const result = {};
                        if (groupName) {
                            const gr = `system.group.${groupName}`;
                            groups = groups.filter(group => group._id.startsWith(`${gr}.`) || group._id === gr);
                        }

                        groups.forEach(group => result[group._id] = group);
                        cb(result);
                    })
                    .catch(error => cb(error));
            },
            getConfig: (useCache, cb) => {
                if (typeof useCache === 'function') {
                    cb = useCache;
                    useCache = false;
                }

                return this.props.socket.getSystemConfig(!useCache)
                    .then(systemConfig => cb(null, systemConfig.common))
                    .catch(error => cb(error));
            },
            getObjects: (useCache, cb) => {
                if (typeof useCache === 'function') {
                    cb = useCache;
                    useCache = false;
                }
                let objects = {};

                return new Promise((resolve, reject) => this.props.socket.getRawSocket().emit('getObjects', (err, res) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (res && res.rows) {
                        for (let i = 0; i < res.rows.length; i++) {
                            objects[res.rows[i].id] = res.rows[i].value;
                        }
                    } else {
                        objects = res;
                        resolve(objects);
                    }
                }))
                    .then(() => this.props.socket.getEnums(!useCache))
                    .then(enums => {
                        Object.assign(objects, enums);
                        return new Promise((resolve, reject) =>
                            this.props.socket.getRawSocket().emit(
                                'getObjectView',
                                'system',
                                'instance',
                                {
                                    startkey: 'system.adapter.',
                                    endkey: 'system.adapter.\u9999',
                                }, (err, res) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        for (let i = 0; i < res.rows.length; i++) {
                                            objects[res.rows[i].id] = res.rows[i].value;
                                        }

                                        const instance = `system.adapter.${this.props.adapterName}.${this.props.instance}`;
                                        // find out default file mode
                                        if (objects[instance]?.native?.defaultFileMode) {
                                            this.defaultMode = objects[instance].native.defaultFileMode;
                                        }
                                        resolve();
                                    }
                                },
                            ));
                    })
                    .then(() => this.props.socket.getObjectView('', '\u9999', 'chart')
                        .catch(() => null))
                    .then(charts => {
                        charts && Object.assign(objects, charts);
                        return this.props.socket.getObjectView('', '\u9999', 'channel');
                    })
                    .then(channels => {
                        Object.assign(objects, channels);
                        return this.props.socket.getObjectView('', '\u9999', 'device');
                    })
                    .then(devices => {
                        Object.assign(objects, devices);
                        if (cb) {
                            cb(null, objects);
                            return null;
                        }

                        return objects;
                    })
                    .catch(error => {
                        console.error(`Cannot load objects: ${error}`);
                        if (cb) {
                            cb(error);
                            return null;
                        }

                        return Promise.reject(error);
                    });
            },
            getLoggedUser: cb => this.props.socket.getCurrentUser()
                .then(user => cb(this.props.socket.isSecure, user)),
            subscribe: IDs => this.subscribe(IDs),
            unsubscribe: IDs => this.unsubscribe(IDs),
            authenticate: (user, password, salt) => {
                this._authRunning = true;

                if (user !== undefined) {
                    this._authInfo = {
                        user,
                        hash: password + salt,
                        salt,
                    };
                }
            },
            getStates: (IDs, cb) => this.props.socket.getForeignStates(IDs)
                .then(data => cb(null, data))
                .catch(error => cb(error || 'Authentication required')),
            setState: (id, val, cb) => this.props.socket.setState(id, val)
                .then(() => cb && cb())
                .catch(error => cb && cb(error)),
            setReloadTimeout: () => {

            },
            setReconnectInterval: () => {

            },
            getUser: () => this.user,
            sendCommand: (instance, command, data, ack) => this.props.socket.setState(this.idControlInstance, { val: instance || 'notdefined', ack: true })
                .then(() => this.props.socket.setState(this.idControlData, { val: data, ack: true }))
                .then(() => this.props.socket.setState(this.idControlCommand, { val: command, ack: ack === undefined ? true : ack })),
            readFile: (filename, cb) => {
                let adapter = this.conn.namespace;
                if (filename[0] === '/') {
                    const p = filename.split('/');
                    adapter = p[1];
                    p.splice(0, 2);
                    filename = p.join('/');
                }

                return this.props.socket.readFile(adapter, filename)
                    .then(data => setTimeout(() => cb(null, data.data, filename, data.type), 0))
                    .catch(error => cb(error));
            },
            getHistory: (id, options, cb) => {
                options = options || {};
                options.timeout = options.timeout || 2000;

                let timeout = setTimeout(() => {
                    timeout = null;
                    cb('timeout');
                }, options.timeout);

                this.props.socket.getHistory(id, options)
                    .then(result => {
                        if (timeout) {
                            clearTimeout(timeout);
                            timeout = null;
                        }
                        cb(null, result);
                    })
                    .catch(error => {
                        if (timeout) {
                            clearTimeout(timeout);
                            timeout = null;
                        }
                        cb(error);
                    });
            },
            getHttp: (url, callback) => this.props.socket.getRawSocket().emit('httpGet', url, data => callback && callback(data)),
        };
    }

    registerViewRef = (view, ref, onCommand) => {
        if (this.refViews[view] && this.refViews[view].ref === ref) {
            console.error(`Someone tries to register same ref for view ${view}`);
        } else {
            this.refViews[view] && console.error(`Someone tries to register new ref for view ${view}`);
            this.refViews[view] = { ref, onCommand };
        }
    }

    unregisterViewRef = (view, ref) => {
        if (this.refViews[view] && this.refViews[view].ref === ref) {
            delete this.refViews[view];
        } else if (this.refViews[view]) {
            this.refViews[view] && console.error(`Someone tries to unregister new ref for view ${view}`);
            delete this.refViews[view];
        }
    }

    getViewRef = view => this.refViews[view]?.ref;

    findNearestResolution(resultRequiredOrX, height) {
        let w;
        let h;

        if (height !== undefined && height !== null) {
            w = resultRequiredOrX;
            h = height;
            resultRequiredOrX = false;
        } else {
            w = window.document.body.clientWidth;
            h = window.document.body.clientHeight;
        }

        let result = null;
        const views = [];
        let difference = 10000;

        // First find all with best fitting width
        Object.keys(this.props.views).forEach(view => {
            if (view !== '___settings' &&
                this.props.views[view].settings &&
                this.props.views[view].settings.useAsDefault &&
                // If difference less than 20%
                Math.abs(this.props.views[view].settings.sizex - w) / this.props.views[view].settings.sizex < 0.2
            ) {
                views.push(view);
            }
        });

        views.forEach(view => {
            if (Math.abs(this.props.views[view].settings.sizey - h) < difference) {
                result = view;
                difference = Math.abs(this.props.views[view].settings.sizey - h);
            }
        });

        // try to find by ratio
        if (!result) {
            const ratio = w / h;
            difference = 10000;

            Object.keys(this.props.views).forEach(view => {
                if (view !== '___settings' &&
                    this.props.views[view].settings?.useAsDefault &&
                    // If difference less than 20%
                    this.props.views[view].settings.sizey &&
                    Math.abs(ratio - (this.props.views[view].settings.sizex / this.props.views[view].settings.sizey)) < difference
                ) {
                    result = view;
                    difference = Math.abs(ratio - (this.props.views[view].settings.sizex / this.props.views[view].settings.sizey));
                }
            });
        }

        if (!result && resultRequiredOrX) {
            result = Object.keys(this.props.views).find(view => view !== '___settings');
        }

        return result;
    }

    readGroups(groupName) {
        return this.props.socket.getGroups()
            .then(groups => {
                const result = {};
                if (groupName) {
                    const gg = `system.group.${groupName}`;
                    groups = groups.filter(group => group._id.startsWith(`${gg}.`) || group._id === gg);
                }

                groups.forEach(group => result[group._id] = group);
                return result;
            });
    }

    initCanObjects() {
        // creat Can objects
        return new this.can.Map({ 'nothing_selected.val': null });

        /*
        if (false && this.props.editMode) {
           this.canStates.__attr = this.canStates.attr; // save original attr

           const that = this;
           this.canStates.attr = function (attr, val) {
               if (val === undefined) {
                   if (typeof attr === 'string') {
                       // read
                       return this.__attr(attr);
                   } else {
                       // write
                       return this.__attr(attr);
                   }
               } else {
                   return this.__attr(attr, val);
               }

               const type = typeof attr;
               if (type !== 'string' && type !== 'number') {
                   // allow only dev1, dev2, ... to be bound
                   if (Object.keys(attr).find(o => o && o.match(/^dev\d+(.val|.ack|.tc|.lc)+/))) {
                       return this.__attr(attr, val);
                   }
               } else if (arguments.length === 1 && attr) {
                   if (attr.match(/^dev\d+(.val|.ack|.tc|.lc)+/)) {
                       this.can.__reading(this, attr);
                       return this._get(attr);
                   }
                   return that.canStates[attr];
               } else {
                   console.log('This is ERROR!');
                   this._set(attr, val);
                   return this;
               }
           };

           // binding
           this.canStates.___bind = this.canStates.bind; // save original bind
           this.canStates.bind = function (id, callback) {
               return this.___bind(id, callback);
               // allow only dev1, dev2, ... to be bound
               //if (id && id.match(/^dev\d+(.val|.ack|.tc|.lc)+/)) {
               //    return this.___bind(id, callback);
               //}
               // console.log('ERROR: binding in edit mode is not allowed on ' + id);
           };

        }
        */
    }

    _setValue(id, val) {
        const oldVal = this.canStates.attr(`${id}.val`);

        // Send ack=false with new value to all widgets
        this.onStateChange(id, { val, ack: false });

        if (id.startsWith('local_')) {
            // update local variable state -> needed for binding, etc.
            return;
        }

        // save actual value to restore it in case of error
        this.props.socket.setState(id, { val, ack: false })
            .catch(error => {
                console.error(`Cannot set ${id} with "${val}: ${error}`);
                if (oldVal === undefined) {
                    this.canStates.removeAttr(`${id}.val`);
                    this.canStates.removeAttr(`${id}.q`);
                    this.canStates.removeAttr(`${id}.from`);
                    this.canStates.removeAttr(`${id}.ts`);
                    this.canStates.removeAttr(`${id}.lc`);
                    this.canStates.removeAttr(`${id}.ack`);
                } else {
                    // If error set value back, but we need generate the edge
                    this.canStates.attr(`${id}.val`, oldVal);
                }
            });
    }

    setValue = (id, val) => {
        if (!id) {
            console.log(`ID is null for val=${val}`);
            return;
        }

        // if no de-bounce running
        if (!this.statesDebounce[id]) {
            // send control command
            this._setValue(id, val);

            // Start timeout
            this.statesDebounce[id] = {
                timeout: setTimeout(() => {
                    if (this.statesDebounce[id]) {
                        if (this.statesDebounce[id].state) {
                            this._setValue(id, this.statesDebounce[id].state);
                        } else {
                            delete this.statesDebounce[id];
                        }
                    }
                }, this.statesDebounceTime, id),
                state: null,
            };
        } else {
            // If some de-bounce running, change last value
            this.statesDebounce[id].state = val;
        }
    }

    // Following code is only required if legacy vis is used
    // eslint-disable-next-line camelcase
    /*
    UNSAFE_componentWillReceiveProps(nextProps) {
        const views = JSON.stringify(nextProps.views);
        if (views !== this.jsonViews) {
            this.jsonViews = views;
            this.vis.updateViews(JSON.parse(JSON.stringify(nextProps.views)));
        }

        if (nextProps.editMode !== this.state.editMode) {
            this.vis.setEditMode(nextProps.editMode);
            this.setState({ editMode: nextProps.editMode });
        }
    }
    */

    static setInnerHTML(elm, html) {
        elm.innerHTML = html;
        const loadPromises = [];
        Array.from(elm.querySelectorAll('script'))
            .forEach(oldScript => {
                const newScript = document.createElement('script');
                let onLoad = false;
                Array.from(oldScript.attributes)
                    .forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                        if (attr.name === 'src') {
                            onLoad = true;
                        }
                    });

                if (onLoad) {
                    const promise = new Promise(resolve => newScript.onload = resolve);
                    loadPromises.push(promise);
                }

                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });

        return Promise.all(loadPromises);
    }

    loadEditWords() {
        if (!this.props.runtime) {
            return new Promise(resolve => {
                const newScript = document.createElement('script');
                newScript.setAttribute('src', 'lib/js/visEditWords.js');
                newScript.onload = resolve;
                window.document.head.appendChild(newScript);
            });
        }

        return Promise.resolve();
    }

    loadWidgets() {
        return fetch('widgets.html')
            .then(data => data.text())
            .then(text => {
                const div = document.createElement('div');
                document.body.appendChild(div);

                return VisEngine.setInnerHTML(div, text)
                    .then(() => {
                        console.log('Loaded');

                        // Send react widgets to App only in edit mode
                        const arrayWidgets = [];
                        !this.props.runtime && Object.keys(VisView.collectInformation()).forEach(item => arrayWidgets.push(item));
                        this.props.onLoaded && this.props.onLoaded(arrayWidgets);
                    });
            })
            .catch(error => console.error(`Cannot load widgets: ${error}`));
    }

    /*
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.divRef.current) {
            this.vis.main(this.divRef.current);
        }
    }
    */

    updateWidget(view, wid, type, item, stateId, state) {
        if (this.widgetChangeHandlers[wid]) {
            this.widgetChangeHandlers[wid](type, item, stateId, state);
        }
    }

    registerChangeHandler = (wid, cb) => {
        if (this.props.editMode && this.widgetChangeHandlers[wid]) {
            console.error('Someone installs handler without to remove it!');
        }
        this.widgetChangeHandlers[wid] = cb;
    }

    unregisterChangeHandler = (wid, cb) => {
        if (this.widgetChangeHandlers[wid] === cb) {
            delete this.widgetChangeHandlers[wid];
        }
    }

    onStateChange = (id, state) => {
        // console.log(`[${new Date().toISOString()}] STATE_CHANGE: ${id}`);
        if (!id || state === null || typeof state !== 'object') {
            return;
        }

        if (id === this.idControlCommand) {
            if (state.ack) {
                return;
            }

            if (state.val &&
                typeof state.val === 'string' &&
                state.val[0] === '{' &&
                state.val[state.val.length - 1] === '}'
            ) {
                try {
                    state.val = JSON.parse(state.val);
                } catch (e) {
                    console.log(`Command seems to be an object, but cannot parse it: ${state.val}`);
                }
            }

            // if command is an object {instance: 'iii', command: 'cmd', data: 'ddd'}
            if (state.val && state.val.instance) {
                if (this.onCommand(state.val.instance, state.val.command, state.val.data)) {
                    // clear state
                    this.props.socket.setState(id, { val: '', ack: true })
                        .catch(error => console.error(`Cannot reset ${id}: ${error}`));
                }
            } else if (this.onCommand(this._cmdInstance, state.val, this._cmdData)) {
                // clear state
                this.props.socket.setState(id, { val: '', ack: true })
                    .catch(error => console.error(`Cannot reset ${id}: ${error}`));
            }

            return;
        }

        if (id === this.idControlData) {
            this._cmdData = state.val;
            return;
        }

        if (id === this.idControlInstance) {
            this._cmdInstance = state.val;
            return;
        }

        // Do not update locals
        // not needed for local variables
        const o = {};
        // Check new model
        o[`${id}.val`] = state.val;

        if (state.ts !== undefined) {
            o[`${id}.ts`] = state.ts;
        }
        if (state.ack !== undefined) {
            o[`${id}.ack`] = state.ack;
        }
        if (state.lc !== undefined) {
            o[`${id}.lc`] = state.lc;
        }
        if (state.q !== undefined && state.q !== null) {
            o[`${id}.q`] = state.q;
        }

        try {
            this.canStates.attr(o);
        } catch (e) {
            this.props.socket.log(`Error: can't create states object for ${id}(${e}): ${JSON.stringify(e.stack)}`, 'error');
        }

        // process visibility
        this.linkContext.visibility[id]?.forEach(item => {
            // console.log('[' + new Date().toISOString() + '](' + item.widget + ') UPDATE_VISIBILITY: ' + id);
            this.updateWidget(item.view, item.widget, 'visibility', item);
        });

        // process signals
        this.linkContext.signals[id]?.forEach(item => {
            // console.log('[' + new Date().toISOString() + '](' + item.widget + ') UPDATE_SIGNAL: ' + id);
            this.updateWidget(item.view, item.widget, 'signal', item, id);
        });

        // Process last update
        this.linkContext.lastChanges[id]?.forEach(item => {
            // console.log('[' + new Date().toISOString() + '](' + item.widget + ') UPDATE_LAST_CHANGE: ' + id);
            this.updateWidget(item.view, item.widget, 'lastChange', item, id);
        });

        // Bindings on every element
        this.linkContext.bindings[id]?.forEach(item => this.updateWidget(item.view, item.widget, 'binding', item, id));

        // Inform other widgets, that do not support canJS
        this.onChangeCallbacks.forEach(item => {
            try {
                item.callback(item.arg, id, state);
            } catch (e) {
                this.props.socket.log(`Error: can't update states object for ${id}(${e}): ${JSON.stringify(e.stack)}`, 'error');
            }
        });
    }

    subscribe = IDs => {
        if (!Array.isArray(IDs)) {
            IDs = [IDs];
        }
        IDs.forEach(id => {
            if (this.subscribes[id]) {
                this.subscribes[id]++;
            } else {
                this.subscribes[id] = 1;
                console.log(`[${new Date().toISOString()}] +SUBSCRIBE: ${id}`);
                this.createCanState(id);
                if (!id.startsWith('local_')) {
                    this.props.socket.subscribeState(id, this.onStateChange);
                }
            }
        });
    }

    createCanState(id) {
        const _val = `${id}.val`;

        if (this.canStates[_val] === undefined || this.canStates[_val] === null) {
            const now = Date.now();
            const o = {};
            // set all together
            if (id.startsWith('local_')) {
                o[_val] = getUrlParameter(id);
            } else {
                o[_val] = 'null';
                o[`${id}.ts`] = now;
                o[`${id}.ack`] = false;
                o[`${id}.lc`] = now;
                o[`${id}.q`] = 0;
            }

            try {
                this.canStates.attr(o);
            } catch (e) {
                this.props.socket.log(`Error: can't create states object for ${id}(${e}): ${JSON.stringify(e.stack)}`, 'error');
            }
        }
    }

    unsubscribe = IDs => {
        if (!Array.isArray(IDs)) {
            IDs = [IDs];
        }

        IDs.forEach(id => {
            if (this.subscribes[id]) {
                this.subscribes[id]--;
                if (!this.subscribes[id]) {
                    console.log(`[${new Date().toISOString()}] -UNSUBSCRIBE: ${id}`);

                    if (!id.startsWith('local_')) {
                        this.props.socket.unsubscribeState(id, this.onStateChange);
                    }
                    delete this.subscribes[id];
                }
            }
        });
    }

    render() {
        if (!this.state.ready) {
            return null;
        }

        this.vis.editMode = this.props.editMode;
        this.vis.activeView = this.props.activeView;

        return Object.keys(this.props.views).map(view => {
            if (view !== '___settings' && (view === this.props.activeView || this.props.views[view].settings?.alwaysRender)) {
                // return <div id="vis_container" ref={this.divRef} style={{ width: '100%', height: '100%' }} />;
                return <VisView
                    key={view}
                    view={view}
                    activeView={this.props.activeView}
                    views={this.props.views}
                    editMode={this.props.editMode}
                    can={this.can}
                    canStates={this.canStates}
                    user={this.user}
                    userGroups={this.userGroups}
                    allWidgets={this.allWidgets}
                    jQuery={window.jQuery}
                    $$={window.$$}
                    adapterName={this.props.adapterName}
                    instance={this.props.instance}
                    projectName={this.props.projectName}
                    socket={this.props.socket}
                    viewsActiveFilter={this.viewsActiveFilter}
                    setValue={this.setValue}
                    linkContext={this.linkContext}
                    formatUtils={this.formatUtils}
                    selectedWidgets={this.props.runtime ? null : this.props.selectedWidgets}
                    setSelectedWidgets={this.props.runtime ? null : this.props.setSelectedWidgets}
                    onWidgetsChanged={this.props.runtime ? null : this.props.onWidgetsChanged}
                    showWidgetNames={this.props.showWidgetNames}
                    registerEditorCallback={this.props.runtime ? null : this.props.registerEditorCallback}
                />;
            }

            return null;
        });
    }
}

VisEngine.propTypes = {
    socket: PropTypes.object.isRequired,
    views: PropTypes.object.isRequired,
    activeView: PropTypes.string,
    lang: PropTypes.string.isRequired,
    editMode: PropTypes.bool,
    onLoaded: PropTypes.func,
    selectedWidgets: PropTypes.array,
    setSelectedWidgets: PropTypes.func,
    runtime: PropTypes.bool,
    onWidgetsChanged: PropTypes.func,
    onFontsUpdate: PropTypes.func,
    showWidgetNames: PropTypes.bool,
    registerEditorCallback: PropTypes.func,

    adapterName: PropTypes.string.isRequired,
    instance: PropTypes.number.isRequired,
    projectName: PropTypes.string.isRequired,
};

export default VisEngine;
