import React from 'react';
import PropTypes from 'prop-types';

import $ from 'jquery';
import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/selectable.css';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/datepicker';
import 'jquery-ui/ui/widgets/selectable';
import 'jquery-ui/ui/widgets/progressbar';
import 'jquery-ui/ui/widgets/dialog';
import './lib/can.custom.js';
import $$ from './lib/quo.standalone'; // Gestures library
import './visWords';
import Vis from './vis';
import VisView from './visView';
import { extractBinding } from './visUtils';

class VisEngine extends React.Component {
    constructor(props) {
        super(props);
        window.jQuery = $;
        window.$ = $; // jQuery library
        window.$$ = $$; // Gestures library
        window.systemDictionary = {};

        this.state = {
            ready: false,
            editMode: !!props.editMode,
        };
        this.jsonViews = JSON.stringify(props.views);

        this.divRef = React.createRef();

        const visConfig = {
            widgetSets: [
                {
                    name: 'bars',
                    depends: [],
                },
                'basic',
                'dwd',
                'echarts',
                'eventlist',
                { name: 'google-fonts', always: true },
                'jqplot',
                {
                    name: 'jqui',
                    depends: [
                        'basic',
                    ],
                },
                {
                    name: 'metro',
                    depends: [
                        'jqui-mfd',
                        'basic',
                    ],
                },
                'swipe',
                'tabs',
            ],
        };

        this.vis = new Vis({
            $: window.jQuery,
            can: window.can,
            views: props.views,
            visConfig,
            lang: props.lang || 'en',
            socket: props.socket,
            _: window._,
        });

        this.can = window.can;

        this.subscribes = {};
        this.allWidgets = {};
        this.wakeUpCallbacks = [];
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

        this.linkContext = {
            visibility: {},
            signals: {},
            lastChanges: {},
            bindings: {},
            denis: true
        };

        this.createConnection();
        this.initCanObjects();

        window.vis = {
            states: this.canStates,
            navChangeCallbacks: [],
            editMode: this.props.editMode,
            binds: {},
            views: this.props.views,
            activeView: this.props.activeView,
            language: this.props.lang,
            viewsActiveFilter: this.viewsActiveFilter,
            onChangeCallbacks: this.onChangeCallbacks,
            conn: this.conn,
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
            setValue: (id, val) => this.setValue(id, val),
            changeView: (viewDiv, view, hideOptions, showOptions, sync, cb) => {
                console.warn('changeView not implemented: ', viewDiv, view, hideOptions, showOptions, sync);
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
                }
            },
            registerOnChange: (callback, arg, wid) => {
                !wid && console.warn('No widget ID for registerOnChange callback! Please fix');

                if (!this.onChangeCallbacks.find(item =>
                    item.callback === callback &&
                    item.arg === arg &&
                    (!wid || item.wid === wid))
                ) {
                    this.onChangeCallbacks.push({ callback, arg, wid });
                }
            },

            unregisterOnChange(callback, arg, wid) {
                !wid && console.warn('No widget ID for unregisterOnChange callback! Please fix');

                const index = this.onChangeCallbacks.findIndex(item =>
                    item.callback === callback &&
                    (arg === undefined || arg === null || item.arg === arg) &&
                    (!wid || item.wid === wid));

                if (index >= 0) {
                    this.onChangeCallbacks.splice(index, 1);
                }
            },
        };

        this.loadWidgets()
            .then(() => this.readGroups())
            .then(userGroups => {
                this.userGroups = userGroups;
                return this.props.socket.getCurrentUser();
            })
            .then(user => {
                this.user = user;
                this.setState({ ready: true });
            });
    }

    createConnection() {
        // props.socket
        this.conn = {
            namespace: 'vis.0',
            logError: errorText => {
                console.error(`Error: ${errorText}`);
                this.socket.log(errorText, 'error');
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

                return this.socket.getGroups(!useCache)
                    .then(groups => {
                        const result = {};
                        if (groupName) {
                            groups = groups.filter(group => group._id.startsWith('system.group.' + groupName + '.') || group._id === 'system.group.' + groupName);
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

                return this.socket.getSystemConfig(!useCache)
                    .then(systemConfig => cb(null, systemConfig.common))
                    .catch(error => cb(error));
            },
            getObjects: (useCache, cb) => {
                if (typeof useCache === 'function') {
                    cb = useCache;
                    useCache = false;
                }
                let objects = null;

                return this.socket.getObjects(!useCache)
                    .then(_objects => {
                        objects = _objects;
                        return this.socket.getEnums(!useCache);
                    })
                    .then(enums => {
                        Object.assign(objects, enums);
                        return this.socket.getAdapterInstances(!useCache);
                    })
                    .then(instances => {
                        instances.forEach(instance => objects[instance._id] = instance);
                        return this.socket.getObjectView('', '\u9999', 'chart');
                    })
                    .then(charts => {
                        Object.assign(objects, charts);
                        return this.socket.getObjectView('', '\u9999', 'channel');
                    })
                    .then(channels => {
                        Object.assign(objects, channels);
                        return this.socket.getObjectView('', '\u9999', 'device');
                    })
                    .then(devices => {
                        Object.assign(objects, devices);
                        cb(null, objects);
                    })
                    .catch(error =>
                        cb(error));
            },
            getLoggedUser: cb => {
                return this.socket.getCurrentUser()
                    .then(user => cb(this.socket.isSecure, user));
            },
            subscribe: IDs => this.subscribe,
            unsubscribe: IDs => this.unsubscribe,
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
            getStates: (IDs, cb) => {
                return this.socket.getForeignStates(IDs)
                    .then(data => cb(null, data))
                    .catch(error => cb(error || 'Authentication required'));
            },
            setState: (id, val, cb) => {
                return this.socket.setState(id, val)
                    .then(() => cb && cb())
                    .catch(error => cb && cb(error));
            },
            setReloadTimeout: () => {

            },
            setReconnectInterval: () => {

            },
            getUser: () => this.user,
            sendCommand: (instance, command, data, ack) =>
                this.socket.setState(`${this.conn.namespace}.control.instance`, { val: instance || 'notdefined', ack: true })
                    .then(() => this.socket.setState(`${this.conn.namespace}.control.data`, { val: data, ack: true }))
                    .then(() => this.socket.setState(`${this.conn.namespace}.control.command`, { val: command, ack: ack === undefined ? true : ack }))
            ,
            readFile: (filename, cb) => {
                let adapter = this.conn.namespace;
                if (filename[0] === '/') {
                    const p = filename.split('/');
                    adapter = p[1];
                    p.splice(0, 2);
                    filename = p.join('/');
                }

                return this.socket.readFile(adapter, filename)
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

                this.socket.getHistory(id, options)
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
            getHttp: (url, callback) =>
                this.socket.getRawSocket().emit('httpGet', url, data =>
                    callback && callback(data)),
        };
    }

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
                    groups = groups.filter(group => group._id.startsWith('system.group.' + groupName + '.') || group._id === 'system.group.' + groupName);
                }

                groups.forEach(group => result[group._id] = group);
                return result;
            });
    }

    initCanObjects() {
        // creat Can objects
        this.canStates = new this.can.Map({ 'nothing_selected.val': null });

        if (this.state.editMode) {
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


                /*const type = typeof attr;
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
                }*/
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
    }

    _setValue(id, state, isJustCreated) {
        const oldValue = this.canStates.attr(`${id}.val`);

        // If ID starts from 'local_', do not send changes to the server, we assume that it is a local variable of the client
        if (id.startsWith('local_')) {
            this.canStates.attr(state);

            // Inform other widgets, that does not support canJS
            for (let i = 0, len = this.onChangeCallbacks.length; i < len; i++) {
                try {
                    this.onChangeCallbacks[i].callback(this.onChangeCallbacks[i].arg, id, state);
                } catch (e) {
                    this.conn.logError(`Error: can't update states object for ${id}(${e}): ${JSON.stringify(e.stack)}`);
                }
            }

            // update local variable state -> needed for binding, etc.
            this.updateState(id, state);

            return;
        }

        this.conn.setState(id, state[`${id}.val`], err => {
            if (err) {
                // state[id + '.val'] = oldValue;
                this.showMessage(this._('Cannot execute %s for %s, because of insufficient permissions', 'setState', id), this._('Insufficient permissions'), 'alert', 600);
            }

            const val = this.canStates.attr(`${id}.val`);

            if (this.canStates.attr(id) || val !== undefined || val !== null) {
                this.canStates.attr(state);

                // If error set value back, but we need generate the edge
                if (err) {
                    if (isJustCreated) {
                        this.canStates.removeAttr(`${id}.val`);
                        this.canStates.removeAttr(`${id}.q`);
                        this.canStates.removeAttr(`${id}.from`);
                        this.canStates.removeAttr(`${id}.ts`);
                        this.canStates.removeAttr(`${id}.lc`);
                        this.canStates.removeAttr(`${id}.ack`);
                    } else {
                        state[`${id}.val`] = oldValue;
                        this.canStates.attr(state);
                    }
                }

                // Inform other widgets, that does not support canJS
                this.onChangeCallbacks.forEach(item => {
                    try {
                        item.callback(item.arg, id, state);
                    } catch (e) {
                        this.props.socket.log(`Error: can't update states object for ${id}(${e}): ${JSON.stringify(e.stack)}`, 'error');
                    }
                });
            }
        });
    }

    setValue = (id, val) => {
        if (!id) {
            return console.log(`ID is null for val=${val}`);
        }

        const d = new Date();
        const t = `${d.getFullYear()}-${(`0${d.getMonth() + 1}`).slice(-2)}-${(`0${d.getDate()}`).slice(-2)} ${(`0${d.getHours()}`).slice(-2)}:${(`0${d.getMinutes()}`).slice(-2)}:${(`0${d.getSeconds()}`).slice(-2)}`;
        const o = {};
        let created = false;
        if (this.canStates.attr(`${id}.val`) !== val) {
            o[`${id}.lc`] = t;
        } else {
            o[`${id}.lc`] = this.canStates.attr(`${id}.lc`);
        }
        o[`${id}.val`] = val;
        o[`${id}.ts`] = t;
        o[`${id}.ack`] = false;

        const _val = this.canStates.attr(`${id}.val`);
        // Create this value
        if (_val === undefined || _val === null) {
            created = true;
            this.canStates.attr(o);
        }

        // if no de-bounce running
        if (!this.statesDebounce[id]) {
            // send control command
            this._setValue(id, o, created);
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
            this.statesDebounce[id].state = o;
        }
    }

    // eslint-disable-next-line camelcase
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

    static getSpecialValues(name, view, wid, widget) {
        switch (name) {
            case 'username.val':
                return this.user;
            case 'login.val':
                return this.loginRequired;
            case 'instance.val':
                return this.instance;
            case 'language.val':
                return this.language;
            case 'wid.val':
                return wid;
            case 'wname.val':
                return widget && (widget.data.name || wid);
            case 'view.val':
                return view;
            default:
                return undefined;
        }
    }

    extractBinding(format) {
        if (!format) {
            return null;
        }
        if (!this.props.editMode && this.bindingsCache[format]) {
            return JSON.parse(JSON.stringify(this.bindingsCache[format]));
        }

        const result = extractBinding(format);

        // cache bindings
        if (result && !this.props.editMode) {
            this.bindingsCache[format] = JSON.parse(JSON.stringify(result));
        }

        return result;
    }

    formatBinding(format, view, wid, widget, doNotIgnoreEditMode) {
        const oids = this.extractBinding(format, doNotIgnoreEditMode);
        for (let t = 0; t < oids.length; t++) {
            let value;
            if (oids[t].visOid) {
                value = VisEngine.getSpecialValues(oids[t].visOid, view, wid, widget);
                if (value === undefined || value === null) {
                    value = this.canStates.attr(oids[t].visOid);
                }
            }
            if (oids[t].operations) {
                for (let k = 0; k < oids[t].operations.length; k++) {
                    switch (oids[t].operations[k].op) {
                        case 'eval':
                            let string = '';// '(function() {';
                            for (let a = 0; a < oids[t].operations[k].arg.length; a++) {
                                if (!oids[t].operations[k].arg[a].name) {
                                    continue;
                                }
                                value = this.getSpecialValues(oids[t].operations[k].arg[a].visOid, view, wid, widget);
                                if (value === undefined || value === null) {
                                    value = this.canStates.attr(oids[t].operations[k].arg[a].visOid);
                                }
                                try {
                                    value = JSON.parse(value);
                                    // if array or object, we format it correctly, else it should be a string
                                    if (typeof value === 'object') {
                                        string += `const ${oids[t].operations[k].arg[a].name} = JSON.parse("${JSON.stringify(value).replace(/\x22/g, '\\\x22')}");`;
                                    } else {
                                        string += `const ${oids[t].operations[k].arg[a].name} = "${value}";`;
                                    }
                                } catch (e) {
                                    string += `const ${oids[t].operations[k].arg[a].name} = "${value}";`;
                                }
                            }
                            const { formula } = oids[t].operations[k];
                            if (formula && formula.indexOf('widget.') !== -1) {
                                string += `const widget = ${JSON.stringify(widget)};`;
                            }
                            string += `return ${oids[t].operations[k].formula};`;

                            if (string.indexOf('\\"') >= 0) {
                                string = string.replace(/\\"/g, '"');
                            }

                            // string += '}())';
                            try {
                                value = new Function(string)();
                            } catch (e) {
                                console.error(`Error in eval[value]: ${format}`);
                                console.error(`Error in eval[script]: ${string}`);
                                console.error(`Error in eval[error]: ${e}`);
                                value = 0;
                            }
                            break;
                        case '*':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                value = parseFloat(value) * oids[t].operations[k].arg;
                            }
                            break;
                        case '/':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                value = parseFloat(value) / oids[t].operations[k].arg;
                            }
                            break;
                        case '+':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                value = parseFloat(value) + oids[t].operations[k].arg;
                            }
                            break;
                        case '-':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                value = parseFloat(value) - oids[t].operations[k].arg;
                            }
                            break;
                        case '%':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                value = parseFloat(value) % oids[t].operations[k].arg;
                            }
                            break;
                        case 'round':
                            if (oids[t].operations[k].arg === undefined && oids[t].operations[k].arg !== null) {
                                value = Math.round(parseFloat(value));
                            } else {
                                value = parseFloat(value).toFixed(oids[t].operations[k].arg);
                            }
                            break;
                        case 'pow':
                            if (oids[t].operations[k].arg === undefined && oids[t].operations[k].arg !== null) {
                                value = Math.pow(parseFloat(value), 2);
                            } else {
                                value = Math.pow(parseFloat(value), oids[t].operations[k].arg);
                            }
                            break;
                        case 'sqrt':
                            value = Math.sqrt(parseFloat(value));
                            break;
                        case 'hex':
                            value = Math.round(parseFloat(value)).toString(16);
                            break;
                        case 'hex2':
                            value = Math.round(parseFloat(value)).toString(16);
                            if (value.length < 2) {
                                value = `0${value}`;
                            }
                            break;
                        case 'HEX':
                            value = Math.round(parseFloat(value)).toString(16).toUpperCase();
                            break;
                        case 'HEX2':
                            value = Math.round(parseFloat(value)).toString(16).toUpperCase();
                            if (value.length < 2) {
                                value = `0${value}`;
                            }
                            break;
                        case 'value':
                            value = this.formatValue(value, parseInt(oids[t].operations[k].arg, 10));
                            break;
                        case 'array':
                            value = oids[t].operations[k].arg[~~value];
                            break;
                        case 'date':
                            value = this.formatDate(value, oids[t].operations[k].arg);
                            break;
                        case 'momentDate':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                const params = oids[t].operations[k].arg.split(',');

                                if (params.length === 1) {
                                    value = this.formatMomentDate(value, params[0]);
                                } else if (params.length === 2) {
                                    value = this.formatMomentDate(value, params[0], params[1]);
                                } else {
                                    value = 'error';
                                }
                            }
                            break;
                        case 'min':
                            value = parseFloat(value);
                            value = (value < oids[t].operations[k].arg) ? oids[t].operations[k].arg : value;
                            break;
                        case 'max':
                            value = parseFloat(value);
                            value = (value > oids[t].operations[k].arg) ? oids[t].operations[k].arg : value;
                            break;
                        case 'random':
                            if (oids[t].operations[k].arg === undefined && oids[t].operations[k].arg !== null) {
                                value = Math.random();
                            } else {
                                value = Math.random() * oids[t].operations[k].arg;
                            }
                            break;
                        case 'floor':
                            value = Math.floor(parseFloat(value));
                            break;
                        case 'ceil':
                            value = Math.ceil(parseFloat(value));
                            break;
                    } // switch
                }
            } // if for
            format = format.replace(oids[t].token, value);
        }// for

        format = format.replace(/{{/g, '{').replace(/}}/g, '}');
        return format;
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
                        this.props.onLoaded && this.props.onLoaded();
                    });
            })
            .catch(error =>
                console.error(`Cannot load widgets: ${error}`));
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.divRef.current) {
            this.vis.main(this.divRef.current);
        }
    }

    onStateChange = (id, state) => {
        console.log(`onStateChange: ${id} = ${JSON.stringify(state)}`);
        if (!id || state === null || typeof state !== 'object') {
            return;
        }

        if (id === `${this.conn.namespace}.control.command`) {
            if (state.ack) {
                return;
            } else
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
                    this.conn.setState(id, { val: '', ack: true });
                }
            } else if (this.onCommand(this._cmdInstance, state.val, this._cmdData)) {
                // clear state
                this.conn.setState(id, { val: '', ack: true });
            }

            return;
        } else if (id === `${this.conn.namespace}.control.data`) {
            this._cmdData = state.val;
            return;
        } else if (id === `${this.conn.namespace}.control.instance`) {
            this._cmdInstance = state.val;
            return;
        }

        if (!id.startsWith('local_')) {
            // not needed for local variables
            if (this.props.editMode) {
                const o = {};
                // Check new model
                o[`${id}.val`] = state.val;
                o[`${id}.ts`] = state.ts;
                o[`${id}.ack`] = state.ack;
                o[`${id}.lc`] = state.lc;

                if (state.q !== undefined && state.q !== null) {
                    o[`${id}.q`] = state.q;
                }

                try {
                    this.canStates.attr(o);
                } catch (e) {
                    this.conn.logError(`Error: can't create states object for ${id}(${e}): ${JSON.stringify(e.stack)}`);
                }
                /*this.canStates.attr(`${id}.val`, state.val);
                this.canStates.attr(`${id}.ts`, state.ts);
                this.canStates.attr(`${id}.ack`, state.ack);
                this.canStates.attr(`${id}.lc`, state.lc);
                if (state.q !== undefined && state.q !== null) {
                    this.canStates.attr(`${id}.q`, state.q);
                }*/
            } else {
                const o = {};
                // Check new model
                o[`${id}.val`] = state.val;
                o[`${id}.ts`] = state.ts;
                o[`${id}.ack`] = state.ack;
                o[`${id}.lc`] = state.lc;

                if (state.q !== undefined && state.q !== null) {
                    o[`${id}.q`] = state.q;
                }

                try {
                    this.canStates.attr(o);
                } catch (e) {
                    this.conn.logError(`Error: can't create states object for ${id}(${e}): ${JSON.stringify(e.stack)}`);
                }
            }
        }

        if (!this.props.editMode && this.linkContext.visibility[id]) {
            this.linkContext.visibility[id].forEach(visItem => {
                const mmWidget = document.getElementById(visItem.widget);
                if (!mmWidget) {
                    return;
                }
                if (this.isWidgetHidden(visItem.view, visItem.widget, state.val) ||
                    this.isWidgetFilteredOut(visItem.view, visItem.widget)
                ) {
                    mmWidget._storedDisplay = mmWidget.style.display;
                    mmWidget.style.display = 'none';

                    if (mmWidget
                        && mmWidget._customHandlers
                        && mmWidget._customHandlers.onHide
                    ) {
                        mmWidget._customHandlers.onHide(mmWidget, id);
                    }
                } else {
                    mmWidget.style.display = mmWidget._storedDisplay ||'block';
                    mmWidget._storedDisplay = '';

                    if (mmWidget &&
                        mmWidget._customHandlers &&
                        mmWidget._customHandlers.onShow
                    ) {
                        mmWidget._customHandlers.onShow(mmWidget, id);
                    }
                }
            });
        }

        // process signals
        if (this.linkContext.signals[id]) {
            this.linkContext.signals[id].forEach(signal => {
                const mWidget = document.getElementById(signal.widget);

                if (!mWidget) {
                    return;
                }

                if (this.isSignalVisible(signal.view, signal.widget, signal.index, state.val)) {
                    // TODO
                    this.jQuery(mWidget).find(`.vis-signal[data-index="${signal.index}"]`).show();
                } else {
                    // TODO
                    this.jQuery(mWidget).find(`.vis-signal[data-index="${signal.index}"]`).hide();
                }
            });
        }

        // Process last update
        if (this.linkContext.lastChanges[id]) {
            this.linkContext.lastChanges[id].forEach(update => {
                const uWidget = document.getElementById(update.widget);
                if (uWidget) {
                    const lcDiv = uWidget.querySelector('.vis-last-change');
                    const isInterval = lcDiv.dataset.interval;
                    lcDiv.innerHTML = this.binds.basic.formatDate(lcDiv.dataset.type === 'last-change' ? state.lc : state.ts, lcDiv.dataset.format, isInterval === 'true' || isInterval === true);
                }
            });
        }

        // Bindings on every element
        if (this.linkContext.bindings[id]) {
            this.linkContext.bindings[id].forEach(binding => {
                const bid = binding.widget;
                const widget = this.props.views[binding.view].widgets[bid];
                const value = this.formatBinding(binding.format, binding.view, bid, widget);

                widget[binding.type][binding.attr] = value;

                if (this.allWidgets[bid] && binding.type === 'data') {
                    this.allWidgets[bid].attr(`${binding.attr}`, value);
                }

                // TODO
                // this.subscribeOidAtRuntime(value);
                // this.visibilityOidBinding(binding, value);
                // this.reRenderWidget(binding.view, binding.view, bid);
            });
        }

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
                this.props.socket.subscribeState(id, this.onStateChange);
                this.createCanState(id);
            }
        });
    }

    createCanState(id) {
        const _val = `${id}.val`;

        const now = Date.now();

        const bindings = this.linkContext.bindings[id];
        const obj = {};
        let created;

        if (this.canStates[_val] === undefined || this.canStates[_val] === null) {
            created = true;
            if (this.state.editMode) {
                this.canStates[_val] = 'null';
                this.canStates[`${id}.ts`] = now;
                this.canStates[`${id}.ack`] = false;
                this.canStates[`${id}.lc`] = now;
            } else {
                // set all together
                obj[_val] = 'null';
                obj[`${id}.ts`] = now;
                obj[`${id}.ack`] = false;
                obj[`${id}.lc`] = now;
            }
        }

        // Check if some bindings installed for this widget
        if (bindings && (created || id === 'username' || id === 'login')) {
            bindings.forEach(binding => {
                const widget = this.props.views[binding.view].widgets[binding.widget];
                if (binding.type === 'data' && this.allWidgets[binding.widget]) {
                    this.allWidgets[binding.widget].attr(binding.attr, this.formatBinding(binding.format, binding.view, binding.widget, widget));
                } else if (!this.props.editMode) {
                    widget[binding.type][binding.attr] =
                        this.formatBinding(binding.format, binding.view, binding.widget, widget);
                }
            });
        }

        if (created) {
            try {
                this.canStates.attr(obj);
            } catch (e) {
                this.socket.log(`Error: can't create states objects (${e})`, 'error');
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
                    this.props.socket.unsubscribeState(id, this.onStateChange);
                    delete this.subscribes[id];
                }
            }
        });
    }

    render() {
        if (!this.state.ready) {
            return null;
        }

        // return <div id="vis_container" ref={this.divRef} style={{ width: '100%', height: '100%' }} />;
        return <VisView
            view={this.props.activeView}
            views={this.props.views}
            editMode={this.props.editMode}
            subscribe={this.subscribe}
            unsubscribe={this.unsubscribe}
            can={this.can}
            canStates={this.canStates}
            user={this.user}
            userGroups={this.userGroups}
            allWidgets={this.allWidgets}
            jQuery={window.jQuery}
            $$={window.$$}
            socket={this.props.socket}
            viewsActiveFilter={this.viewsActiveFilter}
            setValue={this.setValue}
            linkContext={this.linkContext}
        />;
    }
}

VisEngine.propTypes = {
    onLoaded: PropTypes.func,
    socket: PropTypes.object.isRequired,
    views: PropTypes.object,
    activeView: PropTypes.string,
    editMode: PropTypes.bool,
    lang: PropTypes.string,
};

export default VisEngine;
