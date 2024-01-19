/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2013-2022 Denis Haev https://github.com/GermanBluefox,
 *  Copyright (c) 2013-2014 hobbyquaker https://github.com/hobbyquaker
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */

import {
    getUsedObjectIDs,
    extractBinding,
    getWidgetGroup,
    replaceGroupAttr,
} from './visUtils';

import './css/vis.css';

const FORBIDDEN_CHARS = /[^._\-/ :!#$%&()+=@^{}|~]+/g; // from https://github.com/ioBroker/ioBroker.js-controller/blob/master/packages/common/lib/common/tools.js
// const FORBIDDEN_CHARS = /[^._\-/ :!#$%&()+=@^{}|~\p{Ll}\p{Lu}\p{Nd}]+/gu; // it must be like this, but old browsers does not support Unicode

function parseSearch() {
    let match;
    const pl = /\+/g;
    const search = /([^&=]+)=?([^&]*)/g;
    const decode = s => decodeURIComponent(s.replace(pl, ' '));
    const query = window.location.search.substring(1);
    const urlParams = {};

    while ((match = search.exec(query))) {
        urlParams[decode(match[1])] = decode(match[2]);
    }

    return urlParams;
}

class Vis {
    // expected options
    //  editMode
    //  visConfig
    //  $
    //  can
    //  socket
    //  views
    //  project
    //  lang
    //  root
    //  _
    constructor(props) {
        this.storageKeyViews = 'visViews';
        this.storageKeySettings = 'visSettings';
        this.storageKeyInstance = 'visInstance';

        this.instance = null;
        this.urlParams = {};
        this.settings = {};
        this.views = null;
        this.widgets = {};
        this.activeView = '';
        this.activeViewDiv = '';
        this.widgetSets = null;
        this.initialized = false;
        this.toLoadSetsCount = 0; // Count of widget sets that should be loaded
        this.isFirstTime = true;
        this.useCache = false;
        this.authRunning = false;
        this.cssChecked = false;
        this.isTouch = 'ontouchstart' in document.documentElement;
        this.binds = {};
        this.onChangeCallbacks = [];
        this.viewsActiveFilter = {};
        this.navChangeCallbacks = [];
        this.editMode = false;
        this.language = typeof window.systemLang !== 'undefined' ? window.systemLang : props.visConfig.language;
        this.statesDebounce = {};
        this.statesDebounceTime = 1000;
        this.visibility = {};
        this.signals = {};
        this.lastChanges = {};
        this.bindings = {};
        this.bindingsCache = {};
        this.subscribing = {
            IDs: [],
            byViews: {},
            active: [],
            activeViews: [],
        };
        this.commonStyle = null;
        this.debounceInterval = 700;
        this.user = ''; // logged in user
        this.loginRequired = false;
        this.sound = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent) ? $('<audio id="external_sound" autoplay muted></audio>').appendTo('body') : null;
        this.visConfig = props.visConfig;
        this.widgetSets = props.visConfig.widgetSets;
        this.wakeUpCallbacks = [];
        this.waitScreenVal = 0;

        this.urlParams = parseSearch();
        this.socket = props.socket;

        this.$ = props.$;
        this.can = props.can;
        this.project = props.project || 'main';
        this.lang = props.lang || window.systemLang;
        this.projectPrefix = `${this.project}/`;
        this.views = props.views || null;
        this._ = props._;

        this.createConnection();
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
                            groups = groups.filter(group => group._id.startsWith(`system.group.${groupName}.`) || group._id === `system.group.${groupName}`);
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
            getLoggedUser: cb => this.socket.getCurrentUser()
                .then(user => cb(this.socket.isSecure, user)),
            subscribe: IDs => {
                if (!Array.isArray(IDs)) {
                    IDs = [IDs];
                }
                for (let i = 0; i < IDs.length; i++) {
                    this.socket.subscribeState(IDs[i], this.updateState);
                }
            },
            unsubscribe: IDs => {
                if (!Array.isArray(IDs)) {
                    IDs = [IDs];
                }
                for (let i = 0; i < IDs.length; i++) {
                    this.socket.unsubscribeState(IDs[i], this.updateState);
                }
            },
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
            getStates: (IDs, cb) => this.socket.getForeignStates(IDs)
                .then(data => cb(null, data))
                .catch(error => cb(error || 'Authentication required')),
            setState: (id, val, cb) => this.socket.setState(id, val)
                .then(() => cb && cb())
                .catch(error => cb && cb(error)),
            setReloadTimeout: () => {

            },
            setReconnectInterval: () => {

            },
            getUser: () => this.user,
            sendCommand: (instance, command, data, ack) =>
                this.socket.setState(`${this.conn.namespace}.control.instance`, { val: instance || 'notdefined', ack: true })
                    .then(() => this.socket.setState(`${this.conn.namespace}.control.data`, { val: data, ack: true }))
                    .then(() => this.socket.setState(`${this.conn.namespace}.control.command`, { val: command, ack: ack === undefined ? true : ack })),
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

        this.socket.registerConnectionHandler(this.onConnectionChanged);
    }

    destroy() {
        this.socket.unregisterConnectionHandler(this.onConnectionChanged);
    }

    createIds(IDs, index, resolve) {
        if (!resolve) {
            return new Promise(_resolve => this.createIds(IDs, 0, _resolve));
        }
        let j;
        index = index || 0;
        const now = Date.now();
        const obj = {};
        for (j = index; j < this.subscribing.IDs.length && j < index + 100; j++) {
            const _id = this.subscribing.IDs[j];
            const _val = `${_id}.val`;
            if (this.states[_val] === undefined || this.states[_val] === null) {
                if (!_id || !_id.match(/^dev\d+$/)) {
                    console.log(`Create inner vis object ${_id}`);
                }
                if (this.editMode) {
                    this.states[_val] = 'null';
                    this.states[`${_id}.ts`] = now;
                    this.states[`${_id}.ack`] = false;
                    this.states[`${_id}.lc`] = now;
                } else {
                    obj[_val] = 'null';
                    obj[`${_id}.ts`] = now;
                    obj[`${_id}.ack`] = false;
                    obj[`${_id}.lc`] = now;
                }

                if (!this.editMode && this.bindings[_id]) {
                    for (let kk = 0; kk < this.bindings[_id].length; kk++) {
                        const __widget = this.views[this.bindings[_id][kk].view].widgets[this.bindings[_id][kk].widget];
                        __widget[this.bindings[_id][kk].type][this.bindings[_id][kk].attr] =
                            this.formatBinding(this.bindings[_id][kk].format, this.bindings[_id][kk].view, this.bindings[_id][kk].widget, __widget);
                    }
                }
            } else if (!this.editMode && this.bindings[_id] && (_id === 'username' || _id === 'login')) {
                for (let k = 0; k < this.bindings[_id].length; k++) {
                    const _widget = this.views[this.bindings[_id][k].view].widgets[this.bindings[_id][k].widget];
                    _widget[this.bindings[_id][k].type][this.bindings[_id][k].attr] =
                        this.formatBinding(this.bindings[_id][k].format, this.bindings[_id][k].view, this.bindings[_id][k].widget, _widget);
                }
            }
        }

        if (!this.editMode) {
            try {
                this.states.attr(obj);
            } catch (e) {
                this.conn.logError(`Error: can't create states objects (${e})`);
            }
        }

        if (j < this.subscribing.IDs.length) {
            setTimeout(() =>
                this.createIds(IDs, j, resolve), 0);
        } else {
            resolve();
        }
    }

    async afterInit() {
        // Get user groups info
        this.userGroups = await this.socket.getGroups();
        this.userGroups = this.userGroups || {};

        // Get Server language
        const systemConfig = await this.socket.getSystemConfig();

        window.systemLang = systemConfig.language || window.systemLang;
        this.language = window.systemLang;
        this.dateFormat = systemConfig.dateFormat;
        this.isFloatComma = systemConfig.isFloatComma;

        // set moment language
        if (typeof moment !== 'undefined') {
            // moment.lang(this.language);
            moment.locale(this.language);
        }

        // If metaIndex required, load it
        if (this.editMode) {
            /* socket.io */
            this.isFirstTime && this.showWaitScreen(true, _('Loading data objects...'), null, 20);

            // Read all data objects from server
            this.conn.getObjects((err, data) => {
                this.objects = data;
                // Detect if objects are loaded
                for (const ob in data) {
                    if (data.hasOwnProperty(ob)) {
                        this.objectSelector = true;
                        break;
                    }
                }
                if (this.editMode && this.objectSelector) {
                    this.inspectWidgets(this.activeViewDiv, this.activeView, true);
                }
            });
        }

        // console.log((new Date()) + " socket.io reconnect");
        if (this.isFirstTime) {
            // Init edit dialog
            this.editMode && this.editInit && this.editInit();
            this.isFirstTime = false;
            await this.init();
        }
    }

    onConnectionChanged = async isConnected => {
        // console.log("onConnChange isConnected="+isConnected);
        if (isConnected) {
            // this.$('#server-disconnect').dialog('close');
            if (this.isFirstTime) {
                this.showWaitScreen(true, `${_('Loading data values...')}<br>`, null, 20);
            }

            this.user = await this.socket.getCurrentUser();
            this.loginRequired = this.socket.isSecure;

            this.states.attr({
                'username.val': this.user,
                'login.val': this.loginRequired,
                username: this.user,
                login: this.loginRequired,
            });

            // first try to load views
            await this.loadRemote();

            if (!this.controlsSubscribed) {
                this.controlsSubscribed = true;

                this.conn.subscribe([
                    `${this.conn.namespace}.control.instance`,
                    `${this.conn.namespace}.control.data`,
                    `${this.conn.namespace}.control.command`,
                ]);
            }

            // then add custom scripts
            if (!this.editMode && this.views && this.views.___settings) {
                if (this.views.___settings.scripts) {
                    const script = document.createElement('script');
                    script.innerHTML = this.views.___settings.scripts;
                    document.head.appendChild(script);
                }
            }

            // Hide old disabled layer
            this.$('.vis-view-disabled').hide();

            // Read all states from server
            console.debug(`Request ${this.editMode ? 'all' : this.subscribing.active.length} states.`);

            let error;
            try {
                const data = await this.socket.getForeignStates(this.editMode ? null : this.subscribing.active);
                this.updateStates(data);
            } catch (_error) {
                error = _error;
                this.showError(error);
            }

            if (this.subscribing.active.length) {
                this.conn.subscribe(this.subscribing.active);
            }

            // Create non-existing IDs
            if (this.subscribing.IDs) {
                await this.createIds(this.subscribing.IDs);
            }
            if (!error) {
                await this.afterInit();
            }
        } else {
            // console.log((new Date()) + " socket.io disconnect");
            // this.$('#server-disconnect').dialog('open');
        }
    };

    onCommand(instance, command, data) {
        let parts;
        if (!instance || (instance !== this.instance && instance !== 'FFFFFFFF' && !instance.includes('*'))) {
            return false;
        } if (command) {
            if (this.editMode && command !== 'tts' && command !== 'playSound') {
                return;
            }
            // external Commands
            switch (command) {
                case 'alert':
                    parts = data.split(';');
                    this.showMessage(parts[0], parts[1], parts[2]);
                    break;
                case 'changedView':
                    // Do nothing
                    return false;
                case 'changeView':
                    parts = data.split('/');
                    if (parts[1]) {
                        // detect actual project
                        const actual = this.projectPrefix ? this.projectPrefix.substring(0, this.projectPrefix.length - 1) : 'main';
                        if (parts[0] !== actual) {
                            document.location.href = `index.html?${actual}#${parts[1]}`;
                            return;
                        }
                    }
                    const view = parts[1] || parts[0];
                    this.changeView(view, view);
                    break;
                case 'refresh':
                case 'reload':
                    setTimeout(() => {
                        window.location.reload();
                    }, 1);
                    break;
                case 'dialog':
                case 'dialogOpen':
                    // noinspection JSJQueryEfficiency
                    this.$(`#${data}_dialog`).dialog('open');
                    break;
                case 'dialogClose':
                    // noinspection JSJQueryEfficiency
                    this.$(`#${data}_dialog`).dialog('close');
                    break;
                case 'popup':
                    window.open(data);
                    break;
                case 'playSound':
                    setTimeout(() => {
                        let href;

                        if (data && data.match(/^http(s)?:\/\//)) {
                            href = data;
                        } else {
                            href = `${location.protocol}//${location.hostname}:${location.port}${data}`;
                        }
                        // force read from server
                        href += `?${Date.now()}`;
                        if (this.sound) {
                            this.sound.attr('src', href);
                            this.sound.attr('muted', false);
                            document.getElementById('external_sound').play();
                        } else if (typeof Audio !== 'undefined') {
                            const snd = new Audio(href); // buffers automatically when created
                            snd.play();
                        } else {
                            // noinspection JSJQueryEfficiency
                            let $sound = this.$('#external_sound');
                            if (!$sound.length) {
                                this.$('body').append('<audio id="external_sound"></audio>');
                                $sound = this.$('#external_sound');
                            }
                            $sound.attr('src', href);
                            document.getElementById('external_sound').play();
                        }
                    }, 1);
                    break;
                case 'tts':
                    if (typeof app !== 'undefined') {
                        app.tts(data);
                    }
                    break;
                default:
                    this.conn.logError(`unknown external command ${command}`);
            }
        }

        return true;
    }

    main(root) {
        this.root = root || this.root;

        if (!root) {
            return;
        }

        // If cordova project => take cordova project name
        if (typeof app !== 'undefined') {
            this.projectPrefix = app.settings.project ? `${app.settings.project}/` : null;
        }

        // On some platforms, the can.js is not immediately ready
        this.states = new this.can.Map({ 'nothing_selected.val': null });

        if (this.editMode) {
            this.states.__attrs = this.states.attr;

            const that = this;
            this.states.attr = function (attr, val) {
                const type = typeof attr;
                if (type !== 'string' && type !== 'number') {
                    for (const o in attr) {
                        // allow only dev1, dev2, ... to be bound
                        if (o && attr.hasOwnProperty(o) && o.match(/^dev\d+(.val|.ack|.tc|.lc)+/)) {
                            return this.__attrs(attr, val);
                        }
                    }
                } else if (arguments.length === 1 && attr) {
                    if (attr.match(/^dev\d+(.val|.ack|.tc|.lc)+/)) {
                        this.can.__reading(this, attr);
                        return this._get(attr);
                    }
                    return that.states[attr];
                } else {
                    console.log('This is ERROR!');
                    this._set(attr, val);
                    return this;
                }
            };

            // binding
            this.states.___bind = this.states.bind;
            this.states.bind = (id, callback) => {
                // allow only dev1, dev2, ... to be bound
                if (id && id.match(/^dev\d+(.val|.ack|.tc|.lc)+/)) {
                    return this.states.___bind(id, callback);
                }
                // console.log('ERROR: binding in edit mode is not allowed on ' + id);
            };
        }

        // für iOS Safari - wirklich notwendig?
        this.$('body').on('touchmove', e =>
            !this.$(e.target).closest('body').length && e.preventDefault());

        this.preloadImages(['img/disconnect.png']);

        /* this.$('#server-disconnect').dialog({
         modal:         true,
         closeOnEscape: false,
         autoOpen:      false,
         dialogClass:   'noTitle',
         width:         400,
         height:        90
         }); */

        this.showWaitScreen(true, null, `${this._('Connecting to Server...')}<br/>`, 0);

        // old !!!
        // First of all load project/vis-user.css
        // this.$('#project_css').attr('href', '/' + vis.conn.namespace + '/' + vis.projectPrefix + 'vis-user.css');
        if (typeof app === 'undefined') {
            const fetchCommonCss = fetch('css/vis-common-user.css')
                .then(data => data.text())
                .then(data => {
                    if (data && typeof app !== 'undefined' && app.replaceFilesInViewsWeb) {
                        data = app.replaceFilesInViewsWeb(data);
                    }

                    if (data || this.editMode) {
                        this.$('head').append(`<style id="vis-common-user" class="vis-common-user">${data}</style>`);
                    }

                    // this.$(document).trigger('vis-common-user');
                })
                .catch(error => {
                    this.conn.logError(`Cannot load vis-common-user.css - ${error}`);
                    this.$('head').append('<style id="vis-common-user" class="vis-common-user"></style>');
                    // this.$(document).trigger('vis-common-user');
                });

            const fetchUserCss = fetch(`/${this.conn.namespace}/${this.projectPrefix}vis-user.css`)
                .then(data => data.text())
                .then(data => {
                    if (data && typeof app !== 'undefined' && app.replaceFilesInViewsWeb) {
                        data = app.replaceFilesInViewsWeb(data);
                    }
                    if (data || this.editMode) {
                        this.$('head').append(`<style id="vis-user" class="vis-user">${data}</style>`);
                    }
                    // this.$(document).trigger('vis-user');
                })
                .catch(error => {
                    this.conn.logError(`Cannot load /${this.conn.namespace}/${this.projectPrefix}vis-user.css - ${error}`);
                    this.$('head').append('<style id="vis-user" class="vis-user"></style>');
                    // this.$(document).trigger('vis-user');
                });

            Promise.all([fetchCommonCss, fetchUserCss])
                .then(() => {
                    console.log('css loaded');
                });
        }

        if (!this.editMode) {
            // Listen for resize changes
            window.addEventListener('orientationchange', () => this.orientationChange(), false);

            window.addEventListener('resize', () => this.orientationChange(), false);
        }

        this.initWakeUp();

        if (this.socket.isConnected()) {
            this.onConnectionChanged(true);
        }
    }

    updateViews(views) {
        this.views = views;
        this.onConnectionChanged(true);
    }

    setEditMode(editMode) {
        this.editMode = editMode;
        // re-render
    }

    _setValue(id, state, isJustCreated) {
        const oldValue = this.states.attr(`${id}.val`);

        // If ID starts from 'local_', do not send changes to the server, we assume that it is a local constiable of the client
        if (id.startsWith('local_')) {
            this.states.attr(state);

            // Inform other widgets, that does not support canJS
            for (let i = 0, len = this.onChangeCallbacks.length; i < len; i++) {
                try {
                    this.onChangeCallbacks[i].callback(this.onChangeCallbacks[i].arg, id, state);
                } catch (e) {
                    this.conn.logError(`Error: can't update states object for ${id}(${e}): ${JSON.stringify(e.stack)}`);
                }
            }

            // update local constiable state -> needed for binding, etc.
            this.updateState(id, state);

            return;
        }

        this.conn.setState(id, state[`${id}.val`], err => {
            if (err) {
                // state[id + '.val'] = oldValue;
                this.showMessage(this._('Cannot execute %s for %s, because of insufficient permissions', 'setState', id), this._('Insufficient permissions'), 'alert', 600);
            }

            const val = this.states.attr(`${id}.val`);

            if (this.states.attr(id) || val !== undefined || val !== null) {
                this.states.attr(state);

                // If error set value back, but we need generate the edge
                if (err) {
                    if (isJustCreated) {
                        this.states.removeAttr(`${id}.val`);
                        this.states.removeAttr(`${id}.q`);
                        this.states.removeAttr(`${id}.from`);
                        this.states.removeAttr(`${id}.ts`);
                        this.states.removeAttr(`${id}.lc`);
                        this.states.removeAttr(`${id}.ack`);
                    } else {
                        state[`${id}.val`] = oldValue;
                        this.states.attr(state);
                    }
                }

                // Inform other widgets, that does not support canJS
                for (let i = 0, len = this.onChangeCallbacks.length; i < len; i++) {
                    try {
                        this.onChangeCallbacks[i].callback(this.onChangeCallbacks[i].arg, id, state);
                    } catch (e) {
                        this.conn.logError(`Error: can't update states object for ${id}(${e}): ${JSON.stringify(e.stack)}`);
                    }
                }
            }
        });
    }

    setValue(id, val) {
        if (!id) {
            console.log(`ID is null for val=${val}`);
            return;
        }

        const d = new Date();
        const t = `${d.getFullYear()}-${(`0${d.getMonth() + 1}`).slice(-2)}-${(`0${d.getDate()}`).slice(-2)} ${(`0${d.getHours()}`).slice(-2)}:${(`0${d.getMinutes()}`).slice(-2)}:${(`0${d.getSeconds()}`).slice(-2)}`;
        const o = {};
        let created = false;
        if (this.states.attr(`${id}.val`) !== val) {
            o[`${id}.lc`] = t;
        } else {
            o[`${id}.lc`] = this.states.attr(`${id}.lc`);
        }
        o[`${id}.val`] = val;
        o[`${id}.ts`] = t;
        o[`${id}.ack`] = false;

        const _val = this.states.attr(`${id}.val`);
        // Create this value
        if (_val === undefined || _val === null) {
            created = true;
            this.states.attr(o);
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

    loadWidgetSet(name) {
        const url = `./widgets/${name}.html?visVersion=${this.version}`;

        return fetch(url)
            .then(data => data.text())
            .then(text => {
                try {
                    this.$('head').append(text);
                } catch (e) {
                    console.error(`Cannot load widget set "${name}": ${e}`);
                }
            })
            .catch(error =>
                this.conn.logError(`Cannot load widget set ${name} ${error}`));
    }

    // Return as array used widgetSets or null if no information about it
    getUsedWidgetSets() {
        const widgetSets = [];

        if (!this.views) {
            console.log('Check why views are not yet loaded!');
            return null;
        }

        // Convert visConfig.widgetSets to object for easier dependency search
        const widgetSetsObj = {};
        for (let i = 0; i < this.visConfig.widgetSets.length; i++) {
            if (typeof this.visConfig.widgetSets[i] === 'object') {
                if (!this.visConfig.widgetSets[i].depends) {
                    this.visConfig.widgetSets[i].depends = [];
                }
                widgetSetsObj[this.visConfig.widgetSets[i].name] = this.visConfig.widgetSets[i];
            } else {
                widgetSetsObj[this.visConfig.widgetSets[i]] = { depends: [] };
            }
        }

        for (const view in this.views) {
            if (!this.views.hasOwnProperty(view) || view === '___settings') {
                continue;
            }
            for (const id in this.views[view].widgets) {
                if (!this.views[view].widgets.hasOwnProperty(id)) {
                    continue;
                }

                if (!this.views[view].widgets[id].widgetSet) {
                    // Views are not yet converted and have no widgetSet information)
                    return null;
                } if (!widgetSets.includes(this.views[view].widgets[id].widgetSet)) {
                    const wset = this.views[view].widgets[id].widgetSet;
                    widgetSets.push(wset);

                    // Add dependencies
                    if (widgetSetsObj[wset]) {
                        for (let u = 0, ulen = widgetSetsObj[wset].depends.length; u < ulen; u++) {
                            if (!widgetSets.includes(widgetSetsObj[wset].depends[u])) {
                                widgetSets.push(widgetSetsObj[wset].depends[u]);
                            }
                        }
                    }
                }
            }
        }

        return widgetSets;
    }

    // Return as array used widgetSets or null if no information about it
    getUsedObjectIDs() {
        const result = getUsedObjectIDs(!this.editMode);
        if (!result) {
            return result;
        }
        this.visibility  = result.visibility;
        this.bindings    = result.bindings;
        this.signals     = result.signals;
        this.lastChanges = result.lastChanges;

        return { IDs: result.IDs, byViews: result.byViews };
    }

    getWidgetGroup(view, widget) {
        return getWidgetGroup(this.views, view, widget);
    }

    async loadWidgetSets() {
        this.showWaitScreen(true, `<br>${this._('Loading Widget-Sets...')} <span id="widgetset_counter"></span>`, null, 20);
        const arrSets = [];

        // If widgets are preloaded
        if (this.binds && this.binds.stateful !== undefined && this.binds.stateful !== null) {
            this.toLoadSetsCount = 0;
        } else {
            // Get list of used widget sets. if Edit mode list is null.
            const widgetSets = this.editMode ? null : this.getUsedWidgetSets();

            // First calculate how many sets to load
            for (let i = 0; i < this.widgetSets.length; i++) {
                const name = this.widgetSets[i].name || this.widgetSets[i];

                // Skip unused widget sets in non-edit mode
                if (!this.widgetSets[i].always) {
                    if (this.widgetSets[i].widgetSets && !widgetSets.includes(name)) {
                        continue;
                    }
                } else if (widgetSets && !widgetSets.includes(name)) {
                    widgetSets.push(name);
                }

                arrSets[arrSets.length] = name;

                if (this.editMode && this.widgetSets[i].edit) {
                    arrSets[arrSets.length] = this.widgetSets[i].edit;
                }
            }
            this.toLoadSetsCount = arrSets.length;
            this.$('#widgetset_counter').html(`<span style="font-size: 10px">(${this.toLoadSetsCount})</span>`);
        }

        for (let j = 0, len = this.toLoadSetsCount; j < len; j++) {
            await this.loadWidgetSet(arrSets[j]);
            this.toLoadSetsCount--;
            if (!this.toLoadSetsCount) {
                this.showWaitScreen(true, null, null, 100);
            } else {
                this.showWaitScreen(true, null, null, parseInt((100 - this.waitScreenVal) / this.toLoadSetsCount, 10));
            }
        }
    }

    bindInstance() {
        if (typeof app !== 'undefined' && app.settings) {
            this.instance = app.settings.instance;
        }
        this.instance = this.instance || window.localStorage.getItem(this.storageKeyInstance);

        // if (this.editMode) {
        //     this.bindInstanceEdit();
        // }
        this.states.attr({ 'instance.val': this.instance, instance: this.instance });
    }

    async init() {
        if (this.initialized) {
            return;
        }

        const settings = window.localStorage.getItem(this.storageKeySettings);
        if (settings) {
            this.settings = Object.assign(this.settings, settings);
        }

        // Late initialization (used only for debug)
        /* if (this.binds.hqWidgetsExt) {
         this.binds.hqWidgetsExt.hqInit();
         } */

        // this.loadRemote(this.loadWidgetSets, this.initNext);
        await this.loadWidgetSets();
        this.initNext();
    }

    initNext(onReady) {
        this.showWaitScreen(false);

        // First start.
        if (!this.views) {
            this.initViewObject();
        } else {
            this.showWaitScreen(false);
        }

        let hash = decodeURIComponent(window.location.hash.substring(1));

        // create demo states
        if (this.views && this.views.DemoView) {
            this.createDemoStates();
        }

        if (!this.views || (!this.views[hash] && typeof app !== 'undefined')) {
            hash = null;
        }

        // View selected?
        if (!hash) {
            // Take the first view in the list
            this.activeView = this.findNearestResolution(true);
            this.activeViewDiv = this.activeView;

            // Create default view in demo mode
            if (typeof io === 'undefined') {
                if (!this.activeView) {
                    if (!this.editMode) {
                        window.alert(this._('error - View doesn\'t exist'));
                        if (typeof app === 'undefined') {
                            // try to find first view
                            window.location.href = `edit.html?${this.projectPrefix.substring(0, this.projectPrefix.length - 1)}`;
                        }
                    } else {
                        this.views.DemoView = this.createDemoView ? this.createDemoView() : {
                            settings: { style: {} },
                            widgets: {},
                        };
                        this.activeView = 'DemoView';
                        this.activeViewDiv = this.activeView;
                    }
                }
            } else if (!this.activeView) {
                if (!this.editMode) {
                    if (typeof app === 'undefined') {
                        window.alert(this._('error - View doesn\'t exist'));
                        window.location.href = `edit.html?${this.projectPrefix.substring(0, this.projectPrefix.length - 1)}`;
                    }
                } else {
                    // All views were deleted, but file exists. Create demo View
                    // window.alert("unexpected error - this should not happen :(");
                    // $.error("this should not happen :(");
                    // create demoView
                    this.views.DemoView = this.createDemoView ? this.createDemoView() : {
                        settings: { style: {} },
                        widgets: {},
                    };
                    this.activeView = 'DemoView';
                    this.activeViewDiv = this.activeView;
                }
            }
        } else if (this.views[hash]) {
            this.activeView = hash;
            this.activeViewDiv = this.activeView;
        } else {
            window.alert(this._('error - View doesn\'t exist'));
            if (typeof app === 'undefined') {
                window.location.href = `edit.html?${this.projectPrefix.substring(0, this.projectPrefix.length - 1)}`;
            }

            $.error('vis Error can\'t find view');
        }

        if (this.views && this.views.___settings) {
            if (this.views.___settings.reloadOnSleep !== undefined) {
                this.conn.setReloadTimeout(this.views.___settings.reloadOnSleep);
            }
            if (this.views.___settings.darkReloadScreen) {
                this.$('#server-disconnect').removeClass('disconnect-light').addClass('disconnect-dark');
            }
            if (this.views.___settings.reconnectInterval !== undefined) {
                this.conn.setReconnectInterval(this.views.___settings.reconnectInterval);
            }
            if (this.views.___settings.destroyViewsAfter !== undefined) {
                this.views.___settings.destroyViewsAfter = parseInt(this.views.___settings.destroyViewsAfter, 10);
            }
            if (this.views.___settings.statesDebounceTime > 0) {
                this.statesDebounceTime = parseInt(this.views.___settings.statesDebounceTime);
            }
        }

        // Navigation
        this.$(window).bind('hashchange', (/* e */) => {
            const view = window.location.hash.slice(1);
            this.changeView(view, view);
        });

        this.bindInstance();

        // EDIT mode
        // this.editMode && this.editInitNext();

        this.initialized = true;

        // If this function called earlier, it makes problems under FireFox.
        // render all views, that should be always rendered
        const containers = [];
        let cnt = 0;
        if (this.views && !this.editMode) {
            for (const view in this.views) {
                if (!this.views.hasOwnProperty(view) || view === '___settings') {
                    continue;
                }
                if (this.views[view].settings.alwaysRender) {
                    containers.push({ view });
                }
            }
            if (containers.length) {
                cnt++;
                this.renderViews(this.activeViewDiv, containers, () => {
                    cnt--;
                    if (this.activeView) {
                        this.changeView(this.activeViewDiv, this.activeView, () =>
                            !cnt && onReady && onReady());
                    }
                });
            }

            this.checkLicense();
        }

        if (!containers.length && this.activeView) {
            this.changeView(this.activeViewDiv, this.activeView, onReady);
        }
    }

    initViewObject() {
        if (!this.editMode) {
            if (typeof app !== 'undefined') {
                this.showMessage(this._('no views found!'));
            } else {
                window.location.href = `edit.html?${this.projectPrefix.substring(0, this.projectPrefix.length - 1)}`;
            }
        } else if (window.confirm(this._('no views found on server.\nCreate new %s ?', `${this.projectPrefix}vis-views.json`))) {
            this.views = {};
            this.views.DemoView = this.createDemoView ? this.createDemoView() : {
                settings: { style: {} },
                widgets: {},
            };
            this.saveRemote && this.saveRemote(true, () => {});
        } else {
            window.location.reload();
        }
    }

    setViewSize(viewDiv, view) {
        const $view = this.$(`#visview_${viewDiv}`);
        let width;
        let height;
        if (this.views[view]) {
            // Because of background, set the width and height of the view
            width = parseInt(this.views[view].settings.sizex, 10);
            height = parseInt(this.views[view].settings.sizey, 10);
        }
        const $vis_container = $(this.root);
        if (!width || width < $vis_container.width()) {
            width = '100%';
        }
        if (!height || height < $vis_container.height()) {
            height = '100%';
        }
        $view.css({ width, height });
    }

    updateContainers(viewDiv, view) {
        const that = this;
        // Set ths views for containers
        this.$(`#visview_${viewDiv}`).find('.vis-view-container').each(() => {
            const cView = that.$(this).attr('data-vis-contains');
            if (!that.views[cView]) {
                that.$(this).html(`<span style="color: red" class="container-error">${this._('error: view not found.')}</span>`);
            } else if (cView === view || cView === viewDiv) {
                that.$(this).html(`<span style="color: red" class="container-error">${this._('error: view container recursion.')}</span>`);
            } else {
                if (that.$(this).find('.container-error').length) {
                    that.$(this).html('');
                }
                const targetView = this;
                if (!that.$(this).find('.vis-widget:first').length) {
                    that.renderView(cView, cView, _viewDiv =>
                        that.$(`#visview_${_viewDiv}`)
                            .appendTo(targetView)
                            .show());
                } else {
                    that.$(`#visview_${cView}`)
                        .appendTo(targetView)
                        .show();
                }
            }
        });
    }

    renderViews(viewDiv, views, index, callback) {
        if (typeof index === 'function') {
            callback = index;
            index = 0;
        }
        index = index || 0;

        if (!views || index >= views.length) {
            return callback && callback(viewDiv, views);
        }
        const item = views[index];
        this.renderView(this.views[item.view] ? item.view : viewDiv, item.view, true, () =>
            this.renderViews(viewDiv, views, index + 1, callback));
    }

    renderView(viewDiv, view, hidden, callback) {
        if (typeof hidden === 'function') {
            callback = hidden;
            hidden = undefined;
        }
        if (typeof view === 'boolean') {
            callback = hidden;
            hidden = undefined;
            view = viewDiv;
        }

        viewDiv = decodeURIComponent(viewDiv);
        view = decodeURIComponent(view);

        if (!this.editMode && !this.$('#commonTheme').length) {
            this.$('head').prepend(`<link rel="stylesheet" type="text/css" href="${(typeof app === 'undefined') ? '../../' : ''}lib/css/themes/jquery-ui/${this.calcCommonStyle() || 'redmond'}/jquery-ui.min.css" id="commonTheme"/>`);
        }

        if (!this.views[view] || !this.views[view].settings) {
            window.alert(`Cannot render view ${view}. Invalid settings`);
            callback && setTimeout(() =>
                callback(viewDiv, view), 0);
            return false;
        }

        // try to render background

        // collect all IDs, used in this view and in containers
        this.subscribeStates(view, () => {
            let isViewsConverted = false; // Widgets in the views hav no information which WidgetSet they use, this info must be added and this flag says if that happens to store the views

            this.views[view].settings.theme = this.views[view].settings.theme || 'redmond';

            if (this.views[view].settings.filterkey) {
                this.viewsActiveFilter[view] = this.views[view].settings.filterkey.split(',');
            } else {
                this.viewsActiveFilter[view] = [];
            }
            // noinspection JSJQueryEfficiency
            let $view = this.$(`#visview_${viewDiv}`);

            // apply group policies
            if (!this.editMode && this.views[view].settings.group && this.views[view].settings.group.length) {
                if (this.views[view].settings.group_action === 'hide') {
                    if (!this.isUserMemberOf(this.conn.getUser(), this.views[view].settings.group)) {
                        if (!$view.length) {
                            this.$(this.root).append(`<div id="visview_${viewDiv}" class="vis-view vis-user-disabled"></div>`);
                            $view = this.$(`#visview_${viewDiv}`);
                        }
                        $view.html(`<div class="vis-view-disabled-text">${this._('View disabled for user %s', this.conn.getUser())}</div>`);
                        return callback && setTimeout(() =>
                            callback(viewDiv, view), 0);
                    }
                }
            }
            if (!$view.length) {
                this.$(this.root).append(`<div style="display: none;" id="visview_${viewDiv}" `
                    + `data-view="${view}" `
                    + `class="vis-view ${viewDiv !== view ? 'vis-edit-group' : ''}" ${
                        this.views[view].settings.alwaysRender ? 'data-persistent="true"' : ''}>`
                    + '<div class="vis-view-disabled" style="display: none"></div>'
                    + '</div>');

                this.addViewStyle(viewDiv, view, this.views[view].settings.theme);

                $view = this.$(`#visview_${viewDiv}`);

                $view.css(this.views[view].settings.style);

                if (this.views[view].settings.style.background_class) {
                    $view.addClass(this.views[view].settings.style.background_class);
                }

                if (viewDiv !== view && this.editMode) {
                    // noinspection JSJQueryEfficiency
                    let $widget = this.$(`#${viewDiv}`);
                    if (!$widget.length) {
                        this.renderWidget(view, view, viewDiv);
                        $widget = this.$(`#${viewDiv}`);
                    }
                    $view.append(`<div class="group-edit-header" data-view="${viewDiv}">${this._('Edit group:')} <b>${viewDiv}</b><button class="group-edit-close"></button></div>`);

                    const that = this;
                    $view.find('.group-edit-close')
                        .button({
                            icons: {
                                primary: 'ui-icon-close',
                            },
                            text: false,
                        })
                        .data('view', view)
                        .css({ width: 20, height: 20 })
                        .click(function () {
                            const view = this.$(this).data('view');
                            that.changeView(view, view);
                        });

                    $widget.appendTo($view);
                    $widget.css({ top: 0, left: 0 });
                    /* $widget.unbind('click dblclick');
                     $widget.find('.vis-widget').each(function () {
                     const id = this.$(this).attr('id');
                     this.bindWidgetClick(view, id, true);
                     }); */
                } else {
                    this.setViewSize(viewDiv, view);
                    // Render all widgets
                    for (const id in this.views[view].widgets) {
                        if (!this.views[view].widgets.hasOwnProperty(id)) {
                            continue;
                        }
                        // Try to complete the widgetSet information to optimize the loading of widgetSets
                        if (id[0] !== 'g' && !this.views[view].widgets[id].widgetSet) {
                            const obj = this.$(`#${this.views[view].widgets[id].tpl}`);
                            if (obj) {
                                this.views[view].widgets[id].widgetSet = obj.attr('data-vis-set');
                                isViewsConverted = true;
                            }
                        }

                        if (!this.views[view].widgets[id].renderVisible && !this.views[view].widgets[id].grouped) {
                            this.renderWidget(viewDiv, view, id);
                        }
                    }
                }

                if (this.editMode) {
                    if (this.binds.jqueryui) {
                        this.binds.jqueryui._disable();
                    }
                    this.droppable(viewDiv, view);
                }
            }

            // move views in container
            const containers = [];
            const that = this;
            $view.find('.vis-view-container').each(function () {
                const cView = that.$(this).attr('data-vis-contains');
                if (!that.views[cView]) {
                    that.$(this).append('error: view not found.');
                    return false;
                } if (cView === view) {
                    that.$(this).append('error: view container recursion.');
                    return false;
                }
                containers.push({ thisView: this, view: cView });
            });
            // add view class
            if (this.views[view].settings.class) {
                $view.addClass(this.views[view].settings.class);
            }

            let wait = false;
            if (containers.length) {
                wait = true;
                this.renderViews(viewDiv, containers, (_viewDiv, _containers) => {
                    for (let c = 0; c < _containers.length; c++) {
                        this.$(`#visview_${_containers[c].view}`)
                            .appendTo(_containers[c].thisView)
                            .show();
                    }
                    !hidden && $view.show();

                    this.$(`#visview_${_viewDiv}`).trigger('rendered');
                    callback && callback(_viewDiv, view);
                });
            }

            // Store modified view
            isViewsConverted && this.saveRemote && this.saveRemote();

            if (this.editMode && this.$('#wid_all_lock_function').prop('checked')) {
                this.$('.vis-widget').addClass('vis-widget-lock');
                if (viewDiv !== view) {
                    this.$(`#${viewDiv}`).removeClass('vis-widget-lock');
                }
            }

            if (!wait) {
                !hidden && $view.show();

                setTimeout(() => {
                    this.$(`#visview_${viewDiv}`).trigger('rendered');
                    callback && callback(viewDiv, view);
                }, 0);
            }

            // apply group policies
            if (!this.editMode && this.views[view].settings.group && this.views[view].settings.group.length) {
                if (this.views[view].settings.group_action !== 'hide') {
                    if (!this.isUserMemberOf(this.conn.getUser(), this.views[view].settings.group)) {
                        $view.addClass('vis-user-disabled');
                    }
                }
            }
        });
    }

    addViewStyle(viewDiv, view, theme) {
        const _view = `visview_${viewDiv}`;

        if (this.calcCommonStyle() === theme) {
            return;
        }

        fetch(`${(typeof app === 'undefined') ? '../../' : ''}lib/css/themes/jquery-ui/${theme}/jquery-ui.min.css`)
            .then(data => data.text())
            .then(data => {
                this.$(`#${viewDiv}_style`).remove();
                data = data.replace('.ui-helper-hidden', `#${_view} .ui-helper-hidden`);
                data = data.replace(/(}.)/g, `}#${_view} .`);
                data = data.replace(/,\./g, `,#${_view} .`);
                data = data.replace(/images/g, `${typeof app === 'undefined' ? '../../' : ''}lib/css/themes/jquery-ui/${theme}/images`);
                const $view = this.$(`#${_view}`);
                $view.append(`<style id="${viewDiv}_style">${data}</style>`);

                this.$(`#${viewDiv}_style_common_user`).remove();
                $view.append(`<style id="${viewDiv}_style_common_user" class="vis-common-user">${this.$('#vis-common-user').html()}</style>`);

                this.$(`#${viewDiv}_style_user`).remove();
                $view.append(`<style id="${viewDiv}_style_user" class="vis-user">${this.$('#vis-user').html()}</style>`);
            });
    }

    preloadImages(srcs) {
        this.preloadImages.cache = this.preloadImages.cache || [];

        let img;
        for (let i = 0; i < srcs.length; i++) {
            img = new Image();
            img.src = srcs[i];
            this.preloadImages.cache.push(img);
        }
    }

    destroyWidget(viewDiv, view, widget) {
        const $widget = this.$(`#${widget}`);
        if ($widget.length) {
            const widgets = this.views[view].widgets[widget].data.members;

            if (widgets) {
                for (let w = 0; w < widgets.length; w++) {
                    if (widgets[w] !== widget) {
                        this.destroyWidget(viewDiv, view, widgets[w]);
                    } else {
                        console.warn(`Cyclic structure in ${widget}!`);
                    }
                }
            }

            try {
                // get an array of bound OIDs
                const bound = $widget.data('bound');
                if (bound) {
                    const bindHandler = $widget.data('bindHandler');
                    for (let b = 0; b < bound.length; b++) {
                        if (typeof bindHandler === 'function') {
                            this.states.unbind(bound[b], bindHandler);
                        } else {
                            this.states.unbind(bound[b], bindHandler[b]);
                        }
                    }
                    $widget.data('bindHandler', null);
                    $widget.data('bound', null);
                }
                // If destroy function exists => destroy it
                const destroy = $widget.data('destroy');
                if (typeof destroy === 'function') {
                    destroy(widget, $widget);
                }
            } catch (e) {
                console.error(`Cannot destroy "${widget}": ${e}`);
            }
        }
    }

    reRenderWidget(viewDiv, view, widget) {
        const $widget = this.$(`#${widget}`);
        const updateContainers = $widget.find('.vis-view-container').length;
        view = view || this.activeView;
        viewDiv = viewDiv || this.activeViewDiv;

        this.destroyWidget(viewDiv, view, widget);
        this.renderWidget(viewDiv, view, widget, !this.views[viewDiv] && viewDiv !== widget
            ? viewDiv
            : (this.views[view].widgets[widget].groupid ? this.views[view].widgets[widget].groupid : null));

        updateContainers && this.updateContainers(viewDiv, view);
    }

    changeFilter(view, filter, showEffect, showDuration, hideEffect, hideDuration) {
        view = view || this.activeView;
        // convert from old style
        if (!this.views[view]) {
            hideDuration = hideEffect;
            hideEffect = showDuration;
            showDuration = showEffect;
            showEffect = filter;
            filter = view;
            view = this.activeView;
        }

        const { widgets } = this.views[view];
        let mWidget;
        if (!(filter || '').trim()) {
            // show all
            for (const widget in widgets) {
                if (!widgets.hasOwnProperty(widget)) {
                    continue;
                }
                if (widgets[widget] && widgets[widget].data && widgets[widget].data.filterkey) {
                    this.$(`#${widget}`).show(showEffect, null, parseInt(showDuration));
                }
            }
            // Show complex widgets
            setTimeout(() => {
                let mWidget;
                for (const widget in widgets) {
                    if (!widgets.hasOwnProperty(widget)) {
                        continue;
                    }
                    mWidget = document.getElementById(widget);
                    if (widgets[widget]
                        && widgets[widget].data
                        && widgets[widget].data.filterkey
                        && mWidget
                        && mWidget._customHandlers
                        && mWidget._customHandlers.onShow) {
                        mWidget._customHandlers.onShow(mWidget, widget);
                    }
                }
            }, parseInt(showDuration) + 10);
        } else if (filter === '$') {
            // hide all
            for (const widget in widgets) {
                if (!widgets.hasOwnProperty(widget)) {
                    continue;
                }
                if (!widgets[widget] || !widgets[widget].data || !widgets[widget].data.filterkey) {
                    continue;
                }
                mWidget = document.getElementById(widget);
                if (mWidget
                    && mWidget._customHandlers
                    && mWidget._customHandlers.onHide) {
                    mWidget._customHandlers.onHide(mWidget, widget);
                }
                this.$(`#${widget}`).hide(hideEffect, null, parseInt(hideDuration));
            }
        } else {
            this.viewsActiveFilter[this.activeView] = filter.split(',');
            const vFilters = this.viewsActiveFilter[this.activeView];
            for (const widget in widgets) {
                if (!widgets.hasOwnProperty(widget) || !widgets[widget] || !widgets[widget].data) {
                    continue;
                }
                let wFilters = widgets[widget].data.filterkey;

                if (wFilters) {
                    if (typeof wFilters !== 'object') {
                        widgets[widget].data.filterkey = wFilters.split(/[;,]+/);
                        wFilters = widgets[widget].data.filterkey;
                    }
                    let found = false;
                    // optimization
                    if (wFilters.length === 1) {
                        found = vFilters.includes(wFilters[0]);
                    } else if (vFilters.length === 1) {
                        found = wFilters.includes(vFilters[0]);
                    } else {
                        for (let f = 0; f < wFilters.length; f++) {
                            if (vFilters.includes(wFilters[f])) {
                                found = true;
                                break;
                            }
                        }
                    }

                    if (!found) {
                        mWidget = document.getElementById(widget);
                        if (mWidget
                            && mWidget._customHandlers
                            && mWidget._customHandlers.onHide) {
                            mWidget._customHandlers.onHide(mWidget, widget);
                        }
                        this.$(`#${widget}`).hide(hideEffect, null, parseInt(hideDuration));
                    } else {
                        mWidget = document.getElementById(widget);
                        if (mWidget && mWidget._customHandlers && mWidget._customHandlers.onShow) {
                            mWidget._customHandlers.onShow(mWidget, widget);
                        }
                        this.$(`#${widget}`).show(showEffect, null, parseInt(showDuration));
                    }
                }
            }

            setTimeout(() => {
                let mWidget;

                // Show complex widgets like hqWidgets or bars
                for (const widget in widgets) {
                    if (!widgets.hasOwnProperty(widget)) {
                        continue;
                    }

                    mWidget = document.getElementById(widget);

                    if (mWidget &&
                        mWidget._customHandlers &&
                        mWidget._customHandlers.onShow &&
                        widgets[widget] &&
                        widgets[widget].data &&
                        widgets[widget].data.filterkey &&
                        (!this.viewsActiveFilter[this.activeView].length ||
                            this.viewsActiveFilter[this.activeView].includes(widgets[widget].data.filterkey))
                    ) {
                        mWidget._customHandlers.onShow(mWidget, widget);
                    }
                }
            }, parseInt(showDuration) + 10);
        }

        if (this.binds.bars && this.binds.bars.filterChanged) {
            this.binds.bars.filterChanged(view, filter);
        }
    }

    isSignalVisible(view, widget, index, val, widgetData) {
        widgetData = widgetData || this.views[view].widgets[widget].data;
        const oid = widgetData[`signals-oid-${index}`];

        if (oid) {
            if (val === undefined || val === null) {
                val = this.states.attr(`${oid}.val`);
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
                    return val.toString().indexOf(value) !== -1;
                case 'not consist':
                    value = value.toString();
                    val = val.toString();
                    return val.toString().indexOf(value) === -1;
                case 'exist':
                    return (value !== 'null');
                case 'not exist':
                    return (value === 'null');
                default:
                    console.log(`Unknown signals condition for ${widget}: ${condition}`);
                    return false;
            }
        } else {
            return false;
        }
    }

    addSignalIcon(view, wid, data, index) {
        // show icon
        let display = (this.editMode || this.isSignalVisible(view, wid, index, undefined, data)) ? '' : 'none';
        if (this.editMode && data[`signals-hide-edit-${index}`]) {
            display = 'none';
        }

        this.$(`#${wid}`).append(`<div class="vis-signal ${data[`signals-blink-${index}`] ? 'vis-signals-blink' : ''} ${data[`signals-text-class-${index}`] || ''} " data-index="${index}" style="display: ${display}; pointer-events: none; position: absolute; z-index: 10; top: ${data[`signals-vert-${index}`] || 0}%; left: ${data[`signals-horz-${index}`] || 0}%"><img class="vis-signal-icon" src="${data[`signals-icon-${index}`]}" style="width: ${data[`signals-icon-size-${index}`] || 32}px; height: auto;${data[`signals-icon-style-${index}`] || ''}"/>${
            data[`signals-text-${index}`] ? (`<div class="vis-signal-text " style="${data[`signals-text-style-${index}`] || ''}">${data[`signals-text-${index}`]}</div>`) : ''}</div>`);
    }

    addChart($wid, wData) {
        $wid.on('click', () =>
            console.log(`Show dialog with chart for ${wData['echart-oid']}`));
    }

    addGestures(id, wdata) {
        // gestures
        const gestures = ['swipeRight', 'swipeLeft', 'swipeUp', 'swipeDown', 'rotateLeft', 'rotateRight', 'pinchIn', 'pinchOut', 'swiping', 'rotating', 'pinching'];
        const $$wid = $$(`#${id}`);
        const $wid = this.$(`#${id}`);
        const offsetX = parseInt(wdata['gestures-offsetX']) || 0;
        const offsetY = parseInt(wdata['gestures-offsetY']) || 0;

        gestures.forEach(gesture => {
            if (wdata && wdata[`gestures-${gesture}-oid`]) {
                const oid = wdata[`gestures-${gesture}-oid`];
                if (oid) {
                    const val = wdata[`gestures-${gesture}-value`];
                    const delta = parseInt(wdata[`gestures-${gesture}-delta`]) || 10;
                    const limit = parseFloat(wdata[`gestures-${gesture}-limit`]) || false;
                    const max = parseFloat(wdata[`gestures-${gesture}-maximum`]) || 100;
                    const min = parseFloat(wdata[`gestures-${gesture}-minimum`]) || 0;
                    let newVal = null;
                    let valState = this.states.attr(`${oid}.val`);
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
                            valState = this.states.attr(`${oid}.val`);
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
                                    $indicator = this.$(`#${wdata['gestures-indicator']}`);
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
                                            this.setValue(oid, newVal);
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
                            this.setValue(oid, newVal);
                            newVal = null;
                        });
                    }
                }
            }
        });
    }

    addLastChange(view, wid, data) {
        // show last change
        const border = `${parseInt(data['lc-border-radius'], 10) || 0}px`;
        const css = {
            background: 'rgba(182,182,182,0.6)',
            'font-family': 'Tahoma',
            position: 'absolute',
            'z-index': 0,
            'border-radius': data['lc-position-horz'] === 'left' ? (`${border} 0 0 ${border}`) : (data['lc-position-horz'] === 'right' ? `0 ${border} ${border} 0` : border),
            'white-space': 'nowrap',
        };
        if (data['lc-font-size']) {
            css['font-size'] = data['lc-font-size'];
        }
        if (data['lc-font-style']) {
            css['font-style'] = data['lc-font-style'];
        }
        if (data['lc-font-family']) {
            css['font-family'] = data['lc-font-family'];
        }
        if (data['lc-bkg-color']) {
            css.background = data['lc-bkg-color'];
        }
        if (data['lc-color']) {
            css.color = data['lc-color'];
        }
        if (data['lc-border-width']) {
            css['border-width'] = parseInt(data['lc-border-width'], 10) || 0;
        }
        if (data['lc-border-style']) {
            css['border-style'] = data['lc-border-style'];
        }
        if (data['lc-border-color']) {
            css['border-color'] = data['lc-border-color'];
        }
        if (data['lc-padding']) {
            css.padding = data['lc-padding'];
        } else {
            css['padding-top'] = 3;
            css['padding-bottom'] = 3;
        }
        if (data['lc-zindex']) {
            css['z-index'] = data['lc-zindex'];
        }
        if (data['lc-position-vert'] === 'top') {
            css.top = `${parseInt(data['lc-offset-vert'], 10)}px`;
        } else if (data['lc-position-vert'] === 'bottom') {
            css.bottom = `${parseInt(data['lc-offset-vert'], 10)}px`;
        } else if (data['lc-position-vert'] === 'middle') {
            css.top = `calc(50% + ${parseInt(data['lc-offset-vert'], 10) - 10}px)`;
        }
        const offset = parseFloat(data['lc-offset-horz']) || 0;
        if (data['lc-position-horz'] === 'left') {
            css.right = `calc(100% - ${offset}px)`;
            if (!data['lc-padding']) {
                css['padding-right'] = 10;
                css['padding-left'] = 10;
            }
        } else if (data['lc-position-horz'] === 'right') {
            css.left = `calc(100% + ${offset}px)`;
            if (!data['lc-padding']) {
                css['padding-right'] = 10;
                css['padding-left'] = 10;
            }
        } else if (data['lc-position-horz'] === 'middle') {
            css.left = `calc(50% + ${offset}px)`;
        }
        const text = `<div class="vis-last-change" data-type="${data['lc-type']}" data-format="${data['lc-format']}" data-interval="${data['lc-is-interval']}">${this.binds.basic.formatDate(this.states.attr(`${data['lc-oid']}.${data['lc-type'] === 'last-change' ? 'lc' : 'ts'}`), data['lc-format'], data['lc-is-interval'], data['lc-is-moment'])}</div>`;
        this.$(`#${wid}`).prepend(this.$(text).css(css)).css('overflow', 'visible');
    }

    isUserMemberOf(user, userGroups) {
        if (!userGroups) {
            return true;
        }
        if (!Array.isArray(userGroups)) {
            userGroups = [userGroups];
        }

        for (let g = 0; g < userGroups.length; g++) {
            const group = this.userGroups[`system.group.${userGroups[g]}`];
            if (!group || !group.common || !group.common.members || !group.common.members.length) {
                continue;
            }
            if (group.common.members.includes(`system.user.${user}`)) {
                return true;
            }
        }
        return false;
    }

    renderWidget(viewDiv, view, id, groupId) {
        let $view;

        if (!groupId) {
            $view = this.$(`#visview_${viewDiv}`);
        } else {
            $view = this.$(`#${groupId}`);
        }
        if (!$view.length) {
            return;
        }

        let widget = this.views[view].widgets[id];

        if (groupId && widget) {
            widget = JSON.parse(JSON.stringify(widget));

            const aCount = parseInt(this.views[view].widgets[groupId].data.attrCount, 10);
            if (aCount) {
                $.map(widget.data, (val, key) => {
                    if (typeof val === 'string') {
                        const result = replaceGroupAttr(val, this.views[view].widgets[groupId].data);
                        if (result.doesMatch) {
                            widget.data[key] = result.newString || '';
                        }
                    }
                });
            }
        }

        const isRelative = widget && widget.style && (widget.style.position === 'relative' || widget.style.position === 'static' || widget.style.position === 'sticky');

        // if widget has relative position => insert it into relative div
        if (this.editMode && isRelative && viewDiv === view) {
            if (this.views[view].settings && this.views[view].settings.sizex) {
                const $relativeView = $view.find('.vis-edit-relative');
                if (!$relativeView.length) {
                    let ww = this.views[view].settings.sizex;
                    let hh = this.views[view].settings.sizey;
                    if (parseFloat(ww).toString() === ww.toString()) {
                        ww = parseFloat(ww);
                    }
                    if (parseFloat(hh).toString() === hh.toString()) {
                        hh = parseFloat(hh);
                    }

                    if (typeof ww === 'number' || ww[ww.length - 1] < '0' || ww[ww.length - 1] > '9') {
                        ww += 'px';
                    }
                    if (typeof hh === 'number' || hh[hh.length - 1] < '0' || hh[hh.length - 1] > '9') {
                        hh += 'px';
                    }

                    $view.append(`<div class="vis-edit-relative" style="width: ${ww}; height: ${hh}"></div>`);
                    $view = $view.find('.vis-edit-relative');
                } else {
                    $view = $relativeView;
                }
            }
        }

        // Add to the global array of widgets
        let userGroups;
        try {
            if (!this.editMode && widget.data['visibility-groups'] && widget.data['visibility-groups'].length) {
                userGroups = widget.data['visibility-groups'];

                if (widget.data['visibility-groups-action'] === 'hide') {
                    if (!this.isUserMemberOf(this.conn.getUser(), userGroups)) {
                        return;
                    }
                    userGroups = null;
                }
            }

            this.widgets[id] = {
                wid: id,
                data: new this.can.Map({ wid: id, ...widget.data }),
            };
        } catch (e) {
            console.log(`Cannot bind data of widget widget: ${id}`);
            return;
        }
        // Register oid to detect changes
        // if (widget.data.oid !== 'nothing_selected')
        //   $.homematic("advisState", widget.data.oid, widget.data.hm_wid);

        const widgetData = this.widgets[id].data;
        let $wid = null;

        try {
            // noinspection JSJQueryEfficiency
            const $widget = this.$(`#${id}`);
            if ($widget.length) {
                const destroy = $widget.data('destroy');

                if (typeof destroy === 'function') {
                    $widget.off('resize'); // remove resize handler
                    destroy(id, $widget);
                    $widget.data('destroy', null);
                }
                if (isRelative && !$view.find(`#${id}`).length) {
                    $widget.remove();
                    $widget.length = 0;
                } else {
                    $widget.html('<div></div>').attr('id', `${id}_removed`);
                }
            }

            let canWidget;
            // Append html element to view
            if (widget.data && widget.data.oid) {
                canWidget = this.can.view(widget.tpl, {
                    val: this.states.attr(`${widget.data.oid}.val`),
                    data: widgetData,
                    viewDiv,
                    view,
                    style: widget.style,
                });
                if ($widget.length) {
                    if ($widget.parent().attr('id') !== $view.attr('id')) {
                        $widget.appendTo($view);
                    }
                    $widget.replaceWith(canWidget);
                    // shift widget to group if required
                } else {
                    $view.append(canWidget);
                }
            } else if (widget.tpl) {
                canWidget = this.can.view(widget.tpl, {
                    data: widgetData,
                    viewDiv,
                    view,
                    style: widget.style,
                });
                if ($widget.length) {
                    if ($widget.parent().attr('id') !== $view.attr('id')) {
                        $widget.appendTo($view);
                    }
                    $widget.replaceWith(canWidget);
                    // shift widget to group if required
                } else {
                    $view.append(canWidget);
                }
            } else {
                console.error(`Widget "${id}" is invalid. Please delete it.`);
                return;
            }

            if (widget.style && !widgetData._no_style) {
                $wid = this.$(`#${id}`);

                // fix position
                for (const attr in widget.style) {
                    if (!widget.style.hasOwnProperty(attr)) {
                        continue;
                    }
                    if (attr === 'top' || attr === 'left' || attr === 'width' || attr === 'height') {
                        const val = widget.style[attr];
                        if (val !== '0' && val !== 0 && val !== null && val !== '' && val.toString().match(/^[-+]?\d+$/)) {
                            widget.style[attr] = `${val}px`;
                        }
                    }
                }

                $wid.css(widget.style);
            }

            if (widget.data && widget.data.class) {
                $wid = $wid || this.$(`#${id}`);
                $wid.addClass(widget.data.class);
            }

            const $tpl = this.$(`#${widget.tpl}`);

            $wid && $wid.addClass(`vis-tpl-${$tpl.data('vis-set')}-${$tpl.data('vis-name')}`);

            if (!this.editMode) {
                if (this.isWidgetFilteredOut(view, id) || this.isWidgetHidden(view, id, undefined, widget.data)) {
                    const mWidget = document.getElementById(id);
                    this.$(mWidget).hide();
                    if (mWidget
                        && mWidget._customHandlers
                        && mWidget._customHandlers.onHide) {
                        mWidget._customHandlers.onHide(mWidget, id);
                    }
                }

                // Processing of gestures
                if (typeof $$ !== 'undefined') {
                    this.addGestures(id, widget.data);
                }
            }

            // processing of signals
            let s = 0;
            while (widget.data[`signals-oid-${s}`]) {
                this.addSignalIcon(view, id, widget.data, s);
                s++;
            }
            if (widget.data['lc-oid']) {
                this.addLastChange(view, id, widget.data);
            }
            if (!this.editMode && widget.data['echart-oid']) {
                this.addChart($wid, widget.data);
            }

            // If edit mode, bind on click event to open this widget in edit dialog
            if (this.editMode) {
                this.bindWidgetClick(viewDiv, view, id);

                // @SJ cannot select menu and dialogs if it is enabled
                /* if (this.$('#wid_all_lock_f').hasClass("ui-state-active")) {
                 this.$('#' + id).addClass("vis-widget-lock")
                 } */
            }

            this.$(document).trigger('wid_added', id);

            if (id[0] === 'g') {
                for (let w = 0; w < widget.data.members.length; w++) {
                    if (widget.data.members[w] !== id) {
                        this.renderWidget(viewDiv, view, widget.data.members[w], id);
                    }
                }
            }
        } catch (e) {
            const lines = (e.toString() + e.stack.toString()).split('\n');
            this.conn.logError(`can't render ${widget.tpl} ${id} on "${view}": `);
            for (let l = 0; l < lines.length; l++) {
                this.conn.logError(`${l} - ${lines[l]}`);
            }
        }

        if (userGroups && $wid && $wid.length) {
            if (!this.isUserMemberOf(this.conn.getUser(), userGroups)) {
                $wid.addClass('vis-user-disabled');
            }
        }
    }

    changeView(viewDiv, view, hideOptions, showOptions, sync, callback) {
        if (typeof view === 'object') {
            callback = sync;
            sync = showOptions;
            hideOptions = showOptions;
            view = viewDiv;
        }

        if (!view && viewDiv) {
            view = viewDiv;
        }

        if (typeof hideOptions === 'function') {
            callback = hideOptions;
            hideOptions = undefined;
        }
        if (typeof showOptions === 'function') {
            callback = showOptions;
            showOptions = undefined;
        }
        if (typeof sync === 'function') {
            callback = sync;
            sync = undefined;
        }

        let effect = hideOptions !== undefined && hideOptions !== null && hideOptions.effect !== undefined && hideOptions.effect !== null && hideOptions.effect;
        if (!effect) {
            effect = showOptions !== undefined && showOptions !== null && showOptions.effect !== undefined && showOptions.effect !== null && showOptions.effect;
        }
        if (effect && (showOptions === undefined || showOptions === null || !showOptions.effect)) {
            showOptions = { effect: hideOptions.effect, options: {}, duration: hideOptions.duration };
        }
        if (effect && (hideOptions === undefined || hideOptions === null || !hideOptions.effect)) {
            hideOptions = { effect: showOptions.effect, options: {}, duration: showOptions.duration };
        }
        hideOptions = $.extend(true, { effect: undefined, options: {}, duration: 0 }, hideOptions);
        showOptions = $.extend(true, { effect: undefined, options: {}, duration: 0 }, showOptions);
        if (hideOptions.effect === 'show') {
            effect = false;
        }

        if (this.editMode && this.activeView !== this.activeViewDiv) {
            this.destroyGroupEdit(this.activeViewDiv, this.activeView);
        }

        if (!this.views[view]) {
            // noinspection JSUnusedAssignment
            view = null;
            for (const prop in this.views) {
                if (prop === '___settings') {
                    continue;
                }
                view = prop;
                break;
            }
        }

        // If really changed
        if (this.activeView !== viewDiv) {
            if (effect) {
                this.renderView(viewDiv, view, true, (_viewDiv, _view) => {
                    const $view = this.$(`#visview_${_viewDiv}`);

                    // Get the view, if required, from Container
                    if ($view.parent().attr('id') !== 'vis_container') {
                        $view.appendTo('#vis_container');
                    }

                    const oldView = this.activeView;
                    this.postChangeView(_viewDiv, _view, callback);

                    // If hide and show at the same time
                    if (sync) {
                        $view.show(showOptions.effect, showOptions.options, parseInt(showOptions.duration, 10)).dequeue();
                    }

                    this.$(`#visview_${oldView}`).hide(hideOptions.effect, hideOptions.options, parseInt(hideOptions.duration, 10), () => {
                        // If first hide, then show
                        if (!sync) {
                            $view.show(showOptions.effect, showOptions.options, parseInt(showOptions.duration, 10), () => {
                                this.destroyUnusedViews();
                            });
                        } else {
                            this.destroyUnusedViews();
                        }
                    });
                });
            } else {
                const $oldView = this.$(`#visview_${this.activeViewDiv}`);
                // disable view and show some action
                $oldView.find('> .vis-view-disabled').show();
                this.renderView(viewDiv, view, true, (_viewDiv, _view) => {
                    let $oldView;
                    if (this.activeViewDiv !== _viewDiv) {
                        $oldView = this.$(`#visview_${this.activeViewDiv}`);
                        // hide old view
                        $oldView.hide();
                        $oldView.find('.vis-view-disabled').hide();
                    }
                    const $view = this.$(`#visview_${_viewDiv}`);

                    // Get the view, if required, from Container
                    if ($view.parent().attr('id') !== 'vis_container') {
                        $view.appendTo('#vis_container');
                    }

                    // show new view
                    $view.show();
                    $view.find('.vis-view-disabled').hide();

                    if (this.activeViewDiv !== _viewDiv) {
                        if ($oldView.hasClass('vis-edit-group')) {
                            this.destroyView(this.activeViewDiv, this.activeView);
                        } else {
                            $oldView.hide();
                        }
                    }

                    this.postChangeView(_viewDiv, _view, callback);
                    this.destroyUnusedViews();
                });
            }
            // remember last click for de-bounce
            this.lastChange = Date.now();
        } else {
            this.renderView(viewDiv, view, false, (_viewDiv, _view) => {
                const $view = this.$(`#visview_${_viewDiv}`);

                // Get the view, if required, from Container
                if ($view.parent().attr('id') !== 'vis_container') {
                    $view.appendTo('#vis_container');
                }
                $view.show();

                this.postChangeView(_viewDiv, _view, callback);
                this.destroyUnusedViews();
            });
        }
    }

    selectAutoFocus() {
        const $view = this.$(`#visview_${this.activeView}`);
        let $inputs = $view.find('input[autofocus]');

        if (!$inputs.length) {
            $inputs = $view.find('select[autofocus]');
        }

        if ($inputs.length) {
            if ($inputs[0] !== document.activeElement) {
                $inputs[0].focus();
            }
            $inputs[0].select();
        }
    }

    postChangeView(viewDiv, view, callback) {
        this.activeView = view;
        this.activeViewDiv = viewDiv;
        /* this.$('#visview_' + viewDiv).find('.vis-view-container').each(function () {
         this.$('#visview_' + this.$(this).attr('data-vis-contains')).show();
         }); */

        this.updateContainers(viewDiv, view);

        if (!this.editMode) {
            this.conn.sendCommand(this.instance, 'changedView', this.projectPrefix ? (this.projectPrefix + this.activeView) : this.activeView);
            this.$(window).trigger('viewChanged', viewDiv);
        }

        if (window.location.hash.slice(1) !== view) {
            if (history && history.pushState) {
                history.pushState({}, '', `#${viewDiv}`);
            }
        }

        // Navigation-Widgets
        for (let i = 0; i < this.navChangeCallbacks.length; i++) {
            this.navChangeCallbacks[i](viewDiv, view);
        }

        this.selectAutoFocus();

        // --------- Editor -----------------
        if (this.editMode) {
            this.changeViewEdit(viewDiv, view, false, callback);
        } else if (typeof callback === 'function') {
            callback(viewDiv, view);
        }
        this.updateIframeZoom();
    }

    async loadRemote() {
        if (this.projectPrefix && !this.views) {
            try {
                let { data } = this.socket.readFile(`${this.projectPrefix}vis-views.json`);

                if (typeof app !== 'undefined' && app.replaceFilesInViewsWeb) {
                    data = app.replaceFilesInViewsWeb(data);
                }

                if (data) {
                    if (typeof data === 'string') {
                        try {
                            this.views = JSON.parse(data.trim());
                        } catch (e) {
                            console.log(`Cannot parse views file "${this.projectPrefix}vis-views.json"`);
                            window.alert(`Cannot parse views file "${this.projectPrefix}vis-views.json"`);
                            this.views = null;
                        }
                    } else {
                        this.views = data;
                    }
                }
            } catch (error) {
                window.alert(`${this.projectPrefix}vis-views.json ${error}`);
                if (error === 'permissionError') {
                    this.showWaitScreen(true, '', this._('Loading stopped', `${location.protocol}//${location.host}`, `${location.protocol}//${location.host}`), 0);
                }
            }
        }

        if (this.views) {
            const _data = this.getUsedObjectIDs();
            this.subscribing.IDs = _data.IDs || [];
            this.subscribing.byViews = _data.byViews || {};
        } else {
            this.subscribing.IDs = [];
            this.subscribing.byViews = {};
        }
    }

    initWakeUp() {
        let oldTime = Date.now();
        setInterval(() => {
            const currentTime = Date.now();
            if (currentTime > oldTime + 10000) {
                oldTime = currentTime;
                for (let i = 0; i < this.wakeUpCallbacks.length; i++) {
                    // console.log("calling wakeUpCallback!");
                    this.wakeUpCallbacks[i]();
                }
            } else {
                oldTime = currentTime;
            }
        }, 2500);
    }

    onWakeUp(callback, wid) {
        if (!wid) {
            console.warn('No widget ID for onWakeUp callback! Please fix');
        }
        this.wakeUpCallbacks.push(callback);
    }

    showMessage(message, title, icon, width, callback) {
        // load some theme to show message
        if (!this.editMode && !this.$('#commonTheme').length) {
            this.$('head').prepend(`<link rel="stylesheet" type="text/css" href="${(typeof app === 'undefined') ? '../../' : ''}lib/css/themes/jquery-ui/${this.calcCommonStyle() || 'redmond'}/jquery-ui.min.css" id="commonTheme"/>`);
        }
        if (typeof icon === 'number') {
            callback = width;
            width = icon;
            icon = null;
        }
        if (typeof title === 'function') {
            callback = title;
            title = null;
        } else if (typeof icon === 'function') {
            callback = icon;
            icon = null;
        } else if (typeof width === 'function') {
            callback = width;
            width = null;
        }

        if (!this.$dialogMessage) {
            const that = this;
            this.$dialogMessage = this.$('#dialog-message');
            this.$dialogMessage.dialog({
                autoOpen: false,
                modal: true,
                open() {
                    const $el = that.$(this);
                    $el.parent().css({ 'z-index': 1003 });
                    const callback = $el.data('callback');
                    if (callback) {
                        $el.find('#dialog_message_cancel').show();
                    } else {
                        $el.find('#dialog_message_cancel').hide();
                    }
                },
                buttons: [
                    {
                        text: this._('Ok'),
                        click() {
                            const $el = that.$(this);
                            const callback = $el.data('callback');
                            $el.dialog('close');
                            if (typeof callback === 'function') {
                                callback(true);
                                $el.data('callback', null);
                            }
                        },
                    },
                    {
                        id: 'dialog_message_cancel',
                        text: this._('Cancel'),
                        click() {
                            const $el = that.$(this);
                            const callback = $el.data('callback');
                            $el.dialog('close');
                            if (typeof callback === 'function') {
                                callback(false);
                                $el.data('callback', null);
                            }
                        },
                    },
                ],
            });
        }

        this.$dialogMessage.dialog('option', 'title', title || this._('Message'));

        if (width) {
            this.$dialogMessage.dialog('option', 'width', width);
        } else {
            this.$dialogMessage.dialog('option', 'width', 300);
        }

        this.$('#dialog-message-text').html(message);

        this.$dialogMessage.data('callback', callback || null);

        if (icon) {
            this.$('#dialog-message-icon')
                .show()
                .attr('class', '')
                .addClass(`ui-icon ui-icon-${icon}`);
        } else {
            this.$('#dialog-message-icon').hide();
        }
        this.$dialogMessage.dialog('open');
    }

    showError(error) {
        this.showMessage(error, this._('Error'), 'alert', 400);
    }

    showWaitScreen(isShow, appendText, newText, step) {
        let waitScreen = document.getElementById('waitScreen');
        if (!waitScreen && isShow) {
            this.$('#vis-react-container').append('<div id="waitScreen" class="vis-wait-screen"><div id="waitDialog" class="waitDialog"><div class="vis-progressbar"></div><div class="vis-wait-text" id="waitText"></div></div></div>');
            waitScreen = document.getElementById('waitScreen');
            this.waitScreenVal = 0;
        }

        this.$('.vis-progressbar').progressbar({ value: this.waitScreenVal }).height(19);

        if (isShow) {
            this.$(waitScreen).show();
            if (newText !== null && newText !== undefined) {
                this.$('#waitText').html(newText);
            }
            if (appendText !== null && appendText !== undefined) {
                this.$('#waitText').append(appendText);
            }
            if (step !== undefined && step !== null) {
                this.waitScreenVal += step;
                setTimeout(_val =>
                    this.$('.vis-progressbar').progressbar('value', _val), 0, this.waitScreenVal);
            }
        } else if (waitScreen) {
            this.$(waitScreen).remove();
        }
    }

    registerOnChange(callback, arg) {
        for (let i = 0, len = this.onChangeCallbacks.length; i < len; i++) {
            if (this.onChangeCallbacks[i].callback === callback
                && this.onChangeCallbacks[i].arg === arg) {
                return;
            }
        }
        this.onChangeCallbacks[this.onChangeCallbacks.length] = { callback, arg };
    }

    unregisterOnChange(callback, arg) {
        for (let i = 0, len = this.onChangeCallbacks.length; i < len; i++) {
            if (this.onChangeCallbacks[i].callback === callback
                && (arg === undefined || arg === null || this.onChangeCallbacks[i].arg === arg)) {
                this.onChangeCallbacks.slice(i, 1);
                return;
            }
        }
    }

    isWidgetHidden(view, widget, val, widgetData) {
        widgetData = widgetData || this.views[view].widgets[widget].data;
        const oid = widgetData['visibility-oid'];
        const condition = widgetData['visibility-cond'];
        if (oid) {
            if (val === undefined || val === null) {
                val = this.states.attr(`${oid}.val`);
            }
            if (val === undefined || val === null) {
                return (condition === 'not exist');
            }

            let value = widgetData['visibility-val'];

            if (!condition || value === undefined || value === null) {
                return (condition === 'not exist');
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
                    return val.toString().indexOf(value) === -1;
                case 'not consist':
                    value = value.toString();
                    val = val.toString();
                    return val.toString().indexOf(value) !== -1;
                case 'exist':
                    return val === 'null';
                case 'not exist':
                    return val !== 'null';
                default:
                    console.log(`Unknown visibility condition for ${widget}: ${condition}`);
                    return false;
            }
        } else {
            return (condition === 'not exist');
        }
    }

    isWidgetFilteredOut(view, widget) {
        const w = this.views[view].widgets[widget];
        const v = this.viewsActiveFilter[view];

        return w &&
            w.data &&
            w.data.filterkey &&
            v.length > 0 &&
            !v.includes(widget.data.filterkey);
    }

    calcCommonStyle(recalc) {
        if (!this.commonStyle || recalc) {
            if (this.editMode) {
                this.commonStyle = this.config.editorTheme || 'redmond';
                return this.commonStyle;
            }
            const styles = {};
            if (this.views) {
                for (const view in this.views) {
                    if (!this.views.hasOwnProperty(view)
                        || view === '___settings'
                        || !this.views[view]
                        || !this.views[view].settings.theme
                    ) {
                        continue;
                    }
                    if (this.views[view].settings.theme && styles[this.views[view].settings.theme]) {
                        styles[this.views[view].settings.theme]++;
                    } else {
                        styles[this.views[view].settings.theme] = 1;
                    }
                }
            }

            let max = 0;
            this.commonStyle = '';
            for (const s in styles) {
                if (styles[s] > max) {
                    max = styles[s];
                    this.commonStyle = s;
                }
            }
        }
        return this.commonStyle;
    }

    formatValue(value, decimals, _format) {
        if (typeof decimals !== 'number') {
            decimals = 2;
            _format = decimals;
        }

        // format = (_format === undefined) ? (this.isFloatComma) ? ".," : ",." : _format;
        // does not work...
        // using default german...
        const format = _format === undefined || _format === null ? '.,' : _format;

        if (typeof value !== 'number') {
            value = parseFloat(value);
        }
        return isNaN(value) ? '' : value.toFixed(decimals || 0).replace(format[0], format[1]).replace(/\B(?=(\d{3})+(?!\d))/g, format[0]);
    }

    formatMomentDate(dateObj, _format, useTodayOrYesterday) {
        useTodayOrYesterday = typeof useTodayOrYesterday !== 'undefined' ? useTodayOrYesterday : false;

        if (!dateObj) return '';
        const type = typeof dateObj;
        if (type === 'string') {
            dateObj = moment(dateObj);
        }

        if (type !== 'object') {
            const j = parseInt(dateObj, 10);
            if (j === dateObj) {
                // may this is interval
                if (j < 946681200) {
                    dateObj = moment(dateObj);
                } else {
                    // if less 2000.01.01 00:00:00
                    dateObj = (j < 946681200000) ? moment(j * 1000) : moment(j);
                }
            } else {
                dateObj = moment(dateObj);
            }
        }
        const format = _format || this.dateFormat || 'DD.MM.YYYY';

        if (useTodayOrYesterday) {
            if (dateObj.isSame(moment(), 'day')) {
                const todayStr = this._('Today');
                return moment(dateObj).format(format.replace('dddd', todayStr).replace('ddd', todayStr).replace('dd', todayStr));
            } if (dateObj.isSame(moment().subtract(1, 'day'), 'day')) {
                const yesterdayStr = this._('Yesterday');
                return moment(dateObj).format(format.replace('dddd', yesterdayStr).replace('ddd', yesterdayStr).replace('dd', yesterdayStr));
            }
        } else {
            return moment(dateObj).format(format);
        }
    }

    formatDate(dateObj, isDuration, _format) {
        // copied from js-controller/lib/adapter.js
        if ((typeof isDuration === 'string' && isDuration.toLowerCase() === 'duration') || isDuration === true) {
            isDuration = true;
        }
        if (typeof isDuration !== 'boolean') {
            _format = isDuration;
            isDuration = false;
        }

        if (!dateObj) {
            return '';
        }
        const type = typeof dateObj;
        if (type === 'string') dateObj = new Date(dateObj);

        if (type !== 'object') {
            const j = parseInt(dateObj, 10);
            if (j === dateObj) {
                // may this is interval
                if (j < 946681200) {
                    isDuration = true;
                    dateObj = new Date(dateObj);
                } else {
                    // if less 2000.01.01 00:00:00
                    dateObj = (j < 946681200000) ? new Date(j * 1000) : new Date(j);
                }
            } else {
                dateObj = new Date(dateObj);
            }
        }
        const format = _format || this.dateFormat || 'DD.MM.YYYY';

        isDuration && dateObj.setMilliseconds(dateObj.getMilliseconds() + dateObj.getTimezoneOffset() * 60 * 1000);

        const validFormatChars = 'YJГMМDTДhSчmмsс';
        let s = '';
        let result = '';

        function put(s) {
            let v = '';

            switch (s) {
                case 'YYYY':
                case 'JJJJ':
                case 'ГГГГ':
                case 'YY':
                case 'JJ':
                case 'ГГ':
                    v = dateObj.getFullYear();
                    if (s.length === 2) v %= 100;
                    break;
                case 'MM':
                case 'M':
                case 'ММ':
                case 'М':
                    v = dateObj.getMonth() + 1;
                    if ((v < 10) && (s.length === 2)) v = `0${v}`;
                    break;
                case 'DD':
                case 'TT':
                case 'D':
                case 'T':
                case 'ДД':
                case 'Д':
                    v = dateObj.getDate();
                    if (v < 10 && s.length === 2) v = `0${v}`;
                    break;
                case 'hh':
                case 'SS':
                case 'h':
                case 'S':
                case 'чч':
                case 'ч':
                    v = dateObj.getHours();
                    if (v < 10 && s.length === 2) v = `0${v}`;
                    break;
                case 'mm':
                case 'm':
                case 'мм':
                case 'м':
                    v = dateObj.getMinutes();
                    if (v < 10 && s.length === 2) v = `0${v}`;
                    break;
                case 'ss':
                case 's':
                case 'cc':
                case 'c':
                    v = dateObj.getSeconds();
                    if (v < 10 && s.length === 2) v = `0${v}`;
                    v = v.toString();
                    break;
                case 'sss':
                case 'ссс':
                    v = dateObj.getMilliseconds();
                    if (v < 10) {
                        v = `00${v}`;
                    } else if (v < 100) {
                        v = `0${v}`;
                    }
                    v = v.toString();
            }
            return result += v;
        }

        for (let i = 0; i < format.length; i++) {
            if (validFormatChars.includes(format[i])) {
                s += format[i];
            } else {
                put(s);
                s = '';
                result += format[i];
            }
        }
        put(s);
        return result;
    }

    extractBinding(format, doNotIgnoreEditMode) {
        if ((!doNotIgnoreEditMode && this.editMode) || !format) {
            return null;
        }
        if (this.bindingsCache[format]) {
            return JSON.parse(JSON.stringify(this.bindingsCache[format]));
        }

        const result = extractBinding(format);

        // cache bindings
        if (result) {
            this.bindingsCache = this.bindingsCache || {};
            this.bindingsCache[format] = JSON.parse(JSON.stringify(result));
        }

        return result;
    }

    getSpecialValues(name, view, wid, widget) {
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

    formatBinding(format, view, wid, widget, doNotIgnoreEditMode) {
        const oids = this.extractBinding(format, doNotIgnoreEditMode);
        for (let t = 0; t < oids.length; t++) {
            let value;
            if (oids[t].visOid) {
                value = this.getSpecialValues(oids[t].visOid, view, wid, widget);
                if (value === undefined || value === null) {
                    value = this.states.attr(oids[t].visOid);
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
                                    value = this.states.attr(oids[t].operations[k].arg[a].visOid);
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
                                value = parseFloat(value) ** 2;
                            } else {
                                value = parseFloat(value) ** oids[t].operations[k].arg;
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

    findNearestResolution(resultRequiredOrX, height) {
        let w;
        let h;

        if (height !== undefined && height !== null) {
            w = resultRequiredOrX;
            h = height;
            resultRequiredOrX = false;
        } else {
            w = this.$(window).width();
            h = this.$(window).height();
        }

        let result = null;
        const views = [];
        let difference = 10000;

        // First, find all with the best fitting width
        for (const view in this.views) {
            if (!this.views.hasOwnProperty(view) || view === '___settings') {
                continue;
            }
            if (this.views[view].settings && this.views[view].settings.useAsDefault
                // If difference less than 20%
                && Math.abs(this.views[view].settings.sizex - w) / this.views[view].settings.sizex < 0.2
            ) {
                views.push(view);
            }
        }

        for (let i = 0; i < views.length; i++) {
            if (Math.abs(this.views[views[i]].settings.sizey - h) < difference) {
                result = views[i];
                difference = Math.abs(parseInt(this.views[views[i]].settings.sizey, 10) - h);
            }
        }

        // try to find by ratio
        if (!result) {
            const ratio = w / h;
            difference = 10000;

            for (const view_ in this.views) {
                if (!this.views.hasOwnProperty(view_) || view_ === '___settings') {
                    continue;
                }
                if (this.views[view_].settings &&
                    this.views[view_].settings.useAsDefault &&
                    // If difference less than 20%
                    parseInt(this.views[view_].settings.sizey, 10) &&
                    Math.abs(ratio - (parseInt(this.views[view_].settings.sizex, 10) / parseInt(this.views[view_].settings.sizey, 10)) < difference)
                ) {
                    result = view_;
                    difference = Math.abs(ratio - (parseInt(this.views[view_].settings.sizex, 10) / parseInt(this.views[view_].settings.sizey, 10)));
                }
            }
        }

        if (!result && resultRequiredOrX) {
            for (const view__ in this.views) {
                if (this.views.hasOwnProperty(view__) && view__ !== '___settings') {
                    return view__;
                }
            }
        }

        return result;
    }

    orientationChange() {
        if (this.resolutionTimer) {
            return;
        }
        this.resolutionTimer = setTimeout(() => {
            this.resolutionTimer = null;
            const view = this.findNearestResolution();
            if (view && view !== this.activeView) {
                this.changeView(view, view);
            }
        }, 200);
    }

    detectBounce(el, isUp) {
        if (!this.isTouch) {
            return false;
        }

        // Protect against two events
        const now = Date.now();
        // console.log('gclick: ' + this.lastChange + ' ' + (now - this.lastChange));
        if (this.lastChange && now - this.lastChange < this.debounceInterval) {
            // console.log('gclick: filtered');
            return true;
        }
        let $el = this.$(el);
        let tag = this.$(el).prop('tagName').toLowerCase();
        while (tag !== 'div') {
            $el = $el.parent();
            tag = $el.prop('tagName').toLowerCase();
        }
        const lastClick = $el.data(isUp ? 'lcu' : 'lc');
        // console.log('click: ' + lastClick + ' ' + (now - lastClick));
        if (lastClick && now - lastClick < this.debounceInterval) {
            // console.log('click: filtered');
            return true;
        }
        $el.data(isUp ? 'lcu' : 'lc', now);
        return false;
    }

    createDemoStates() {
        // Create demo variables
        this.states.attr({ 'demoTemperature.val': 25.4 });
        this.states.attr({ 'demoHumidity.val': 55 });
    }

    getHistory(id, options, callback) {
        // Possible options:
        // - **instance - (mandatory) sql.x or history.y
        // - **start** - (optional) time in ms - *Date.now()*'
        // - **end** - (optional) time in ms - *Date.now()*', by default is (now + 5000 seconds)
        // - **step** - (optional) used in aggregate (m4, max, min, average, total) step in ms of intervals
        // - **count** - number of values if aggregate is 'onchange' or number of intervals if other aggregate method. Count will be ignored if step is set.
        // - **from** - if *from* field should be included in answer
        // - **ack** - if *ack* field should be included in answer
        // - **q** - if *q* field should be included in answer
        // - **addId** - if *id* field should be included in answer
        // - **limit** - do not return more entries than limit
        // - **ignoreNull** - if null values should be included (false), replaced by last not null value (true) or replaced with 0 (0)
        // - **aggregate** - aggregate method:
        //    - *minmax* - used special algorithm. Splice the whole time range in small intervals and find for every interval max, min, start and end values.
        //    - *max* - Splice the whole time range in small intervals and find for every interval max value and use it for this interval (nulls will be ignored).
        //    - *min* - Same as max, but take minimal value.
        //    - *average* - Same as max, but take average value.
        //    - *total* - Same as max, but calculate total value.
        //    - *count* - Same as max, but calculate number of values (nulls will be calculated).
        //    - *none* - no aggregation

        this.conn.getHistory(id, options, callback);
    }

    destroyView(viewDiv, view) {
        const $view = this.$(`#visview_${viewDiv}`);

        console.debug(`Destroy ${view}`);

        // Get all widgets and try to destroy them
        for (const wid in this.views[view].widgets) {
            if (!this.views[view].widgets.hasOwnProperty(wid)) {
                continue;
            }
            this.destroyWidget(viewDiv, view, wid);
        }

        $view.remove();
        this.unsubscribeStates(view);
    }

    checkLicense() {
        if (!this.licTimeout && (typeof this.visConfig === 'undefined' || this.visConfig.license === false)) {
            this.licTimeout = setTimeout(() => {
                this.licTimeout = setTimeout(() => {
                    this.$(this.root).hide();
                    this.$('#vis_license').css('background', '#000');
                }, 10000);

                const $lic = this.$('#vis_license');
                const $text = $lic.find('.vis-license-text');
                $text.text(this._($text.text()));
                $lic.show();
            }, 10000);
        }
    }

    findAndDestroyViews() {
        if (this.destroyTimeout) {
            clearTimeout(this.destroyTimeout);
            this.destroyTimeout = null;
        }
        const containers = [];
        const $createdViews = this.$('.vis-view');
        const that = this;
        for (const view in this.views) {
            if (!this.views.hasOwnProperty(view) || view === '___settings') {
                continue;
            }
            if (this.views[view].settings.alwaysRender || view === this.activeView) {
                if (!containers.includes(view)) {
                    containers.push(view);
                }
                const $containers = this.$(`#visview_${view}`).find('.vis-view-container');
                $containers.each(function () {
                    const cView = that.$(this).attr('data-vis-contains');
                    if (!containers.includes(cView)) {
                        containers.push(cView);
                    }
                });
                // check dialogs too
                const $dialogs = that.$('.vis-widget-dialog');
                $dialogs.each(function () {
                    if (that.$(this).is(':visible')) {
                        const $containers = that.$(this).find('.vis-view-container');
                        $containers.each(function () {
                            const cView = that.$(this).attr('data-vis-contains');
                            if (!containers.includes(cView)) {
                                containers.push(cView);
                            }
                        });
                    }
                });
            }
        }

        $createdViews.each(function () {
            const $this = that.$(this);
            const view = $this.data('view');
            const viewDiv = $this.attr('id').substring('visview_'.length);
            // If this view does not used as container
            if (!containers.includes(viewDiv) &&
                !$this.hasClass('vis-edit-group') &&
                !$this.data('persistent')
            ) {
                that.destroyView(viewDiv, view);
            }
        });
    }

    destroyUnusedViews() {
        this.destroyTimeout && clearTimeout(this.destroyTimeout);
        this.destroyTimeout = null;
        let timeout = 30000;
        if (this.views.___settings && this.views.___settings.destroyViewsAfter !== undefined) {
            timeout = this.views.___settings.destroyViewsAfter * 1000;
        }
        if (timeout) {
            this.destroyTimeout = setTimeout(() => {
                this.destroyTimeout = null;
                this.findAndDestroyViews();
            }, timeout);
        }
    }

    generateInstance() {
        if (typeof window.localStorage !== 'undefined') {
            this.instance = (Math.random() * 4294967296).toString(16);
            this.instance = `0000000${this.instance}`;
            this.instance = this.instance.substring(this.instance.length - 8);
            this.$('#vis_instance').val(this.instance);
            window.localStorage.set(this.storageKeyInstance, this.instance);
        }
    }

    subscribeStates(view, callback) {
        if (!view || this.editMode) {
            return callback && callback();
        }

        // view yet active
        if (this.subscribing.activeViews.includes(view)) {
            return callback && callback();
        }

        this.subscribing.activeViews.push(view);

        this.subscribing.byViews[view] = this.subscribing.byViews[view] || [];

        // subscribe
        const oids = [];
        for (let i = 0; i < this.subscribing.byViews[view].length; i++) {
            if (!this.subscribing.active.includes(this.subscribing.byViews[view][i])) {
                this.subscribing.active.push(this.subscribing.byViews[view][i]);
                oids.push(this.subscribing.byViews[view][i]);
            }
        }

        if (oids.length) {
            console.debug(`[${Date.now()}] Request ${oids.length} states.`);
            this.conn.getStates(oids, (error, data) => {
                error && this.showError(error);
                this.updateStates(data);
                this.conn.subscribe(oids);
                callback && callback();
            });
        } else {
            callback && callback();
        }
    }

    unsubscribeStates(view) {
        if (!view || this.editMode) {
            return;
        }

        // view yet active
        let pos = this.subscribing.activeViews.indexOf(view);
        if (pos === -1) {
            return;
        }
        this.subscribing.activeViews.splice(pos, 1);

        // unsubscribe
        const oids = [];
        // check every OID
        for (let i = 0; i < this.subscribing.byViews[view].length; i++) {
            const id = this.subscribing.byViews[view][i];

            pos = this.subscribing.active.indexOf(id);
            if (pos !== -1) {
                let isUsed = false;
                // Is OID is used something else
                for (let v = 0; v < this.subscribing.activeViews.length; v++) {
                    if (this.subscribing.byViews[this.subscribing.activeViews[v]].indexOf(id) !== -1) {
                        isUsed = true;
                        break;
                    }
                }
                if (!isUsed) {
                    oids.push(id);
                    this.subscribing.active.splice(pos, 1);
                }
            }
        }
        oids.length && this.conn.unsubscribe(oids);
    }

    updateState = (id, state) => {
        if (id === `${this.conn.namespace}.control.command`) {
            if (state.ack) {
                return;
            } if (state.val &&
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
        } if (id === `${this.conn.namespace}.control.data`) {
            this._cmdData = state.val;
            return;
        } if (id === `${this.conn.namespace}.control.instance`) {
            this._cmdInstance = state.val;
            return;
        }

        if (!id.startsWith('local_')) {
            // not needed for local variables
            if (this.editMode) {
                this.states[`${id}.val`] = state.val;
                this.states[`${id}.ts`] = state.ts;
                this.states[`${id}.ack`] = state.ack;
                this.states[`${id}.lc`] = state.lc;
                if (state.q !== undefined && state.q !== null) {
                    this.states[`${id}.q`] = state.q;
                }
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
                    this.states.attr(o);
                } catch (e) {
                    this.conn.logError(`Error: can't create states object for ${id}(${e}): ${JSON.stringify(e.stack)}`);
                }
            }
        }

        if (!this.editMode && this.visibility[id]) {
            for (let k = 0; k < this.visibility[id].length; k++) {
                const mmWidget = document.getElementById(this.visibility[id][k].widget);
                if (!mmWidget) {
                    continue;
                }
                if (this.isWidgetHidden(this.visibility[id][k].view, this.visibility[id][k].widget, state.val) ||
                    this.isWidgetFilteredOut(this.visibility[id][k].view, this.visibility[id][k].widget)
                ) {
                    this.$(mmWidget).hide();
                    if (mmWidget
                        && mmWidget._customHandlers
                        && mmWidget._customHandlers.onHide) {
                        mmWidget._customHandlers.onHide(mmWidget, id);
                    }
                } else {
                    this.$(mmWidget).show();
                    if (mmWidget &&
                        mmWidget._customHandlers &&
                        mmWidget._customHandlers.onShow
                    ) {
                        mmWidget._customHandlers.onShow(mmWidget, id);
                    }
                }
            }
        }

        // process signals
        if (!this.editMode && this.signals[id]) {
            for (let s = 0; s < this.signals[id].length; s++) {
                const signal = this.signals[id][s];
                const mWidget = document.getElementById(signal.widget);

                if (!mWidget) {
                    continue;
                }

                if (this.isSignalVisible(signal.view, signal.widget, signal.index, state.val)) {
                    this.$(mWidget).find(`.vis-signal[data-index="${signal.index}"]`).show();
                } else {
                    this.$(mWidget).find(`.vis-signal[data-index="${signal.index}"]`).hide();
                }
            }
        }

        // Process last update
        if (!this.editMode && this.lastChanges[id]) {
            for (let l = 0; l < this.lastChanges[id].length; l++) {
                const update = this.lastChanges[id][l];
                const uWidget = document.getElementById(update.widget);
                if (uWidget) {
                    const $lc = this.$(uWidget).find('.vis-last-change');
                    const isInterval = $lc.data('interval');
                    $lc.html(this.binds.basic.formatDate($lc.data('type') === 'last-change' ? state.lc : state.ts, $lc.data('format'), isInterval === 'true' || isInterval === true));
                }
            }
        }

        // Bindings on every element
        if (!this.editMode && this.bindings[id]) {
            for (let i = 0; i < this.bindings[id].length; i++) {
                const bid = this.bindings[id][i].widget;
                const widget = this.views[this.bindings[id][i].view].widgets[bid];
                const value = this.formatBinding(this.bindings[id][i].format, this.bindings[id][i].view, bid, widget);

                widget[this.bindings[id][i].type][this.bindings[id][i].attr] = value;

                if (this.widgets[bid] && this.bindings[id][i].type === 'data') {
                    this.widgets[bid][`${this.bindings[id][i].type}.${this.bindings[id][i].attr}`] = value;
                }

                this.subscribeOidAtRuntime(value);
                this.visibilityOidBinding(this.bindings[id][i], value);

                this.reRenderWidget(this.bindings[id][i].view, this.bindings[id][i].view, bid);
            }
        }

        // Inform other widgets, that do not support canJS
        for (let j = 0, len = this.onChangeCallbacks.length; j < len; j++) {
            try {
                this.onChangeCallbacks[j].callback(this.onChangeCallbacks[j].arg, id, state.val, state.ack);
            } catch (e) {
                this.conn.logError(`Error: can't update states object for ${id}(${e}): ${JSON.stringify(e.stack)}`);
            }
        }

        this.editMode && $.fn.selectId && $.fn.selectId('stateAll', id, state);
    };

    updateStates(data) {
        if (data) {
            for (const id in data) {
                if (!data.hasOwnProperty(id)) {
                    continue;
                }
                let obj = data[id];

                if (id.startsWith('local_')) {
                    // if it is a local constiable, we have to initiate this
                    obj = {
                        val: this.getUrlParameter(id), // using url parameter to set initial value of local constiable
                        ts: Date.now(),
                        lc: Date.now(),
                        ack: false,
                        from: 'system.adapter.vis.0',
                        user: this.user ? `system.user.${this.user}` : 'system.user.admin',
                        q: 0,
                    };
                }

                if (!obj) {
                    continue;
                }

                try {
                    if (this.editMode) {
                        this.states[`${id}.val`] = obj.val;
                        this.states[`${id}.ts`] = obj.ts;
                        this.states[`${id}.ack`] = obj.ack;
                        this.states[`${id}.lc`] = obj.lc;
                        if (obj.q !== undefined && obj.q !== null) {
                            this.states[`${id}.q`] = obj.q;
                        }
                    } else {
                        const oo = {};
                        oo[`${id}.val`] = obj.val;
                        oo[`${id}.ts`] = obj.ts;
                        oo[`${id}.ack`] = obj.ack;
                        oo[`${id}.lc`] = obj.lc;
                        if (obj.q !== undefined && obj.q !== null) {
                            oo[`${id}.q`] = obj.q;
                        }
                        this.states.attr(oo);
                    }
                } catch (e) {
                    this.conn.logError(`Error: can't create states object for ${id}(${e})`);
                }

                if (!this.editMode && this.bindings[id]) {
                    for (let i = 0; i < this.bindings[id].length; i++) {
                        const widget = this.views[this.bindings[id][i].view].widgets[this.bindings[id][i].widget];
                        const value = this.formatBinding(this.bindings[id][i].format, this.bindings[id][i].view, this.bindings[id][i].widget, widget);

                        widget[this.bindings[id][i].type][this.bindings[id][i].attr] = value;

                        this.subscribeOidAtRuntime(value);
                        this.visibilityOidBinding(this.bindings[id][i], value);
                    }
                }
            }
        }
    }

    updateIframeZoom(zoom) {
        if (zoom === undefined || zoom === null) {
            zoom = document.body.style.zoom;
        }
        if (zoom) {
            this.$('iframe')
                // function is important here. let it be
                // eslint-disable-next-line func-names
                .each(function () {
                    if (this.contentWindow.document.body) {
                        this.contentWindow.document.body.style.zoom = zoom;
                    }
                })
                .unbind('onload')
                // function is important here. let it be
                // eslint-disable-next-line func-names
                .load(function () {
                    if (this.contentWindow.document.body) {
                        this.contentWindow.document.body.style.zoom = zoom;
                    }
                });
        }
    }

    getUrlParameter(localId) {
        const sPageURL = window.location.search.substring(1);
        const sURLVariables = sPageURL.split('&');
        let sParameterName;

        for (let i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === localId) {
                return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }

        return '';
    }

    subscribeOidAtRuntime(oid, callback, force) {
        // if state value is an oid, and it is not subscribed then subscribe it at runtime, can happen if binding are used in oid attributes
        // the id with invalid contains characters not allowed in oid's
        if (!FORBIDDEN_CHARS.test(oid) && (!this.subscribing.active.includes(oid) || force)) {
            if ((/^[^.]*\.\d*\..*|^[^.]*\.[^.]*\.[^.]*\.\d*\..*/).test(oid) && FORBIDDEN_CHARS.test(oid) && oid.length < 300) {
                this.subscribing.active.push(oid);

                this.conn.getStates(oid, (error, data) => {
                    console.log(`Create inner vis object ${oid}at runtime`);
                    this.updateStates(data);
                    this.conn.subscribe(oid);

                    callback && callback();
                });
            }
        }
    }

    visibilityOidBinding(binding, oid) {
        // if attribute 'visibility-oid' contains binding
        if (binding.attr === 'visibility-oid') {
            // runs only if we have a valid id
            if ((/^[^.]*\.\d*\..*|^[^.]*\.[^.]*\.[^.]*\.\d*\..*/).test(oid)) {
                const obj = {
                    view: binding.view,
                    widget: binding.widget,
                };

                for (const id in this.visibility) {
                    // remove or add widget to existing oid's in visibility list
                    if (this.visibility.hasOwnProperty(id)) {
                        const widgetIndex = this.visibility[id].findIndex(x => x.widget === obj.widget);

                        if (widgetIndex >= 0) {
                            // widget exists in visibility list
                            if (id !== oid) {
                                this.visibility[id].splice(widgetIndex, 1);
                                // console.log('widget ' + obj.widget + ' removed from ' + id);
                            }
                        } else {
                            // widget not exists in visibility list
                            if (id === oid) {
                                this.visibility[id].push(obj);
                                // console.log('widget ' + obj.widget + ' added to ' + id);
                            }
                        }
                    }
                }

                if (!this.visibility[oid]) {
                    // oid not exist in visibility list -> add oid and widget to visibility list
                    this.visibility[oid] = [];
                    this.visibility[oid].push(obj);
                    // console.log('widget ' + obj.widget + ' added to ' + id + ' - oid not exist in visibility list');
                }

                // on runtime load oid, check if oid need subscribe
                if (!this.editMode) {
                    const val = this.states.attr(`${oid}.val`);
                    if (val === undefined || val === null || val === 'null') {
                        this.subscribeOidAtRuntime(oid, () => {
                            if (this.isWidgetHidden(obj.view, obj.widget)) {
                                const mWidget = document.getElementById(obj.widget);
                                this.$(mWidget).hide();

                                if (mWidget &&
                                    mWidget._customHandlers &&
                                    mWidget._customHandlers.onHide
                                ) {
                                    mWidget._customHandlers.onHide(mWidget, obj.widget);
                                }
                            }
                        }, true);
                    }
                }
            }
        }
    }
}

export default Vis;

// if (!vis.editMode) {
//     // Protection after view change
//     /*this.$(window).on('click touchstart mousedown', e => {
//         if (Date.now() - vis.lastChange < vis.debounceInterval) {
//             e.stopPropagation();
//             e.preventDefault();
//             return false;
//         }
//     });*/
//     /* this.$(window).on('touchend mouseup', function () {
//         vis.lastChange = null;
//         const $log = this.$('#w00039');
//         const $log1 = this.$('#w00445');
//         $log.append('<br>gclick touchend: ' + vis.lastChange);
//         $log1.append('<br>gclick touchend: ' + vis.lastChange);
//     }); */
// }
