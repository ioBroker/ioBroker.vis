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
    Button, Dialog, DialogContent, DialogTitle, DialogActions,
} from '@mui/material';

import I18n from '@iobroker/adapter-react-v5/i18n';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import AlertIcon from '@mui/icons-material/Warning';

import './css/vis.css';
// import './lib/can.custom.js';
// import $$ from './lib/quo.standalone'; // Gestures library
import './visWords';

import VisView from './visView';
import VisFormatUtils from './visFormatUtils';
import { getUrlParameter } from './visUtils';

function _translateWord(text, lang, dictionary) {
    if (!text) {
        return '';
    }
    lang = lang || window.systemLang;
    dictionary = dictionary || window.systemDictionary;

    if (dictionary[text]) {
        let newText = dictionary[text][lang];
        if (newText) {
            return newText;
        }
        if (lang !== 'en') {
            newText = dictionary[text].en;
            if (newText) {
                return newText;
            }
        }
    } else if (typeof text === 'string' && !text.match(/_tooltip$/)) {
        // console.log(`"${text}": {en: "${text}", de: "${text}", ru: "${text}"},`);
    } else if (typeof text !== 'string') {
        console.warn(`Trying to translate non-text: ${text}`);
    }

    return text;
}

function translate(text, arg1, arg2, arg3) {
    text = _translateWord(text);

    let pos = text.includes('%s');
    if (pos !== -1) {
        text = text.replace('%s', arg1);
    } else {
        return text;
    }

    pos = text.includes('%s');
    if (pos !== -1) {
        text = text.replace('%s', arg2);
    } else {
        return text;
    }

    pos = text.includes('%s');
    if (pos !== -1) {
        text = text.replace('%s', arg3);
    }

    return text;
}

class VisEngine extends React.Component {
    constructor(props) {
        super(props);
        window.jQuery = window.$;
        window.$ = window.jQuery; // jQuery library
        // window.$$ = $$; // Gestures library
        window.systemLang = props.lang || window.systemLang || 'en';

        // modify jquery dialog to add it to view (originally dialog was added to body) (because of styles)
        // eslint-disable-next-line func-names
        window.$.ui.dialog.prototype._appendTo = function () {
            const wid = this.options.wid;
            const view = Object.keys(props.views).find(v => props.views[v].widgets && props.views[v].widgets[wid]);
            return this.document.find(view ? `#visview_${view}` : 'body').eq(0);
        };

        this.state = {
            ready: false,

            timeInterval: JSON.parse(window.localStorage.getItem('timeInterval')) || 'week',
            timeStart: JSON.parse(window.localStorage.getItem('timeStart')) || null,
        };

        // this.jsonViews = JSON.stringify(props.views);

        // this.divRef = React.createRef();

        this.can = window.can;
        this.scripts = null;
        this.isTouch = 'ontouchstart' in document.documentElement;
        this.debounceInterval = 700;

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

        this.refSound = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent) ? React.createRef() : null;

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
                this.vis.language = systemConfig.common.language || 'en';
                this.systemConfig = systemConfig;

                this.props.socket.subscribeState(this.idControlInstance, this.onStateChange);
                this.props.socket.subscribeState(this.idControlData, this.onStateChange);
                this.props.socket.subscribeState(this.idControlCommand, this.onStateChange);

                return this.loadWidgets();
            })
            .then(() => this.setState({ ready: true }));
    }

    setTimeInterval = timeInterval => {
        this.setState({ timeInterval });
        window.localStorage.setItem('timeInterval', JSON.stringify(timeInterval));
    };

    setTimeStart = timeStart => {
        this.setState({ timeStart });
        window.localStorage.setItem('timeStart', JSON.stringify(timeStart));
    };

    detectWakeUp() {
        this.oldTime = Date.now();
        this.wakeUpDetectorInterval = this.wakeUpDetectorInterval || setInterval(() => {
            const currentTime = Date.now();
            if (currentTime > this.oldTime + 10000) {
                this.oldTime = currentTime;
                this.wakeUpCallbacks.forEach(item => {
                    if (typeof item.cb === 'function') {
                        try {
                            item.cb(item.wid);
                        } catch (error) {
                            console.error(`Cannot wakeup ${item.wid}: ${error}`);
                        }
                    }
                });
            } else {
                this.oldTime = currentTime;
            }
        }, 2500);
    }

    componentDidMount() {
        this.detectWakeUp();
    }

    componentWillUnmount() {
        this.wakeUpDetectorInterval && clearInterval(this.wakeUpDetectorInterval);
        this.wakeUpDetectorInterval = null;

        // unsubscribe all
        Object.keys(this.subscribes).forEach(id =>
            this.props.socket.unsubscribeState(id, this.onStateChange));

        this.props.socket.unsubscribeState(this.idControlInstance, this.onStateChange);
        this.props.socket.unsubscribeState(this.idControlData, this.onStateChange);
        this.props.socket.unsubscribeState(this.idControlCommand, this.onStateChange);

        let userScript = window.document.getElementById('#vis_user_scripts');
        if (userScript) {
            userScript.remove();
            userScript = null;
        }

        let userCommonCss = window.document.getElementById('#vis_common_user');
        if (userCommonCss) {
            userCommonCss.remove();
            userCommonCss = null;
        }

        let userUserCss = window.document.getElementById('#vis_user');
        if (userUserCss) {
            userUserCss.remove();
            userUserCss = null;
        }

        this.subscribes = {};
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
            isTouch: this.isTouch,
            activeWidgets: [],
            navChangeCallbacks: [],
            editMode: !!this.props.editMode,
            binds: {},
            views: this.props.views,
            activeView: this.props.activeView,
            language: this.props.lang,
            user: '',
            _: translate,
            dateFormat: '',
            instance: window.localStorage.getItem('visInstance'),
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
            updateFilter: view => {
                view = view || this.props.activeView;
                if (this.refViews[view]) {
                    // collect all possible filter of widgets
                    if (this.refViews[view]?.onCommand) {
                        return this.refViews[view]?.onCommand('collectFilters');
                    }
                }
                return [];
            },
            destroyUnusedViews: () => {
                console.warn('destroyUnusedViews not implemented');
            },
            changeFilter: (view, filter, showEffect, showDuration, hideEffect, hideDuration) =>
                this.changeFilter(view, filter, showEffect, showDuration, hideEffect, hideDuration),
            detectBounce: (el, isUp) => {
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
                let tag = el.tagName.toLowerCase();
                while (tag !== 'div') {
                    el = el.parentNode;
                    tag = el.tagName.toLowerCase();
                }
                const lastClick = el[`__vis_${isUp ? 'lcu' : 'lc'}`];
                // console.log('click: ' + lastClick + ' ' + (now - lastClick));
                if (lastClick && now - lastClick < this.debounceInterval) {
                    console.log('click: filtered out');
                    return true;
                }
                el[`__vis_${isUp ? 'lcu' : 'lc'}`] = now;
                return false;
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
            showMessage: (message, title, icon, width, callback) => this.showMessage(message, title, icon, width, callback),
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
            generateInstance() {
                let instance = (Math.random() * 4294967296).toString(16);
                instance = `0000000${instance}`;
                instance = instance.substring(instance.length - 8);
                window.vis.instance = instance;
                window.localStorage.setItem('visInstance', instance);
                return this.instance;
            },
        };
    }

    changeFilter(view, filter, showEffect, showDuration, hideEffect, hideDuration) {
        view = view || this.props.activeView;
        if (this.refViews[view]?.onCommand) {
            this.refViews[view]?.onCommand('changeFilter', {
                filter, showEffect, showDuration, hideEffect, hideDuration,
            });
        }
    }

    showMessage(message, title, icon, width, callback) {
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

        this.setState({
            showMessage: {
                message, title, icon, width, callback,
            },
        });
    }

    renderMessageDialog() {
        if (!this.state.showMessage) {
            return null;
        }

        return <Dialog
            key="__messageDialog"
            open={!0}
            onClose={() => {
                const callback = this.state.showMessage.callback;
                if (typeof callback === 'function') {
                    callback(false);
                }
                this.setState({ showMessage: null });
            }}
            maxWidth="md"
        >
            <DialogTitle>{this.state.showMessage.title || I18n.t('Message')}</DialogTitle>
            <DialogContent>
                { this.state.showMessage.icon === 'alert' ? <AlertIcon /> : null }
                { this.state.showMessage.message }
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={() => {
                        const callback = this.state.showMessage.callback;
                        if (typeof callback === 'function') {
                            callback(true);
                        }
                        this.setState({ showMessage: null });
                    }}
                    color="primary"
                    startIcon={<CheckIcon />}
                >
                    {I18n.t('Ok')}
                </Button>
                { this.state.showMessage.callback ? <Button
                    variant="contained"
                    color="grey"
                    onClick={() => {
                        const callback = this.state.showMessage.callback;
                        if (typeof callback === 'function') {
                            callback(false);
                        }
                        this.setState({ showMessage: null });
                    }}
                    startIcon={<CloseIcon />}
                >
                    {I18n.t('Cancel')}
                </Button> : null }
            </DialogActions>
        </Dialog>;
    }

    createConnection() {
        // props.socket
        return {
            namespace: this.props.adapterId,
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

                return new Promise((resolve, reject) => {
                    this.props.socket.getRawSocket().emit('getObjects', (err, res) => {
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
                    });
                })
                    .then(() => this.props.socket.getEnums(!useCache))
                    .then(enums => {
                        Object.assign(objects, enums);
                        return new Promise((resolve, reject) => {
                            this.props.socket.getRawSocket().emit(
                                'getObjectView',
                                'system',
                                'instance',
                                {
                                    startkey: 'system.adapter.',
                                    endkey: 'system.adapter.\u9999',
                                },
                                (err, res) => {
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
                            );
                        });
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
    };

    unregisterViewRef = (view, ref) => {
        if (this.refViews[view] && this.refViews[view].ref === ref) {
            delete this.refViews[view];
        } else if (this.refViews[view]) {
            this.refViews[view] && console.error(`Someone tries to unregister new ref for view ${view}`);
            delete this.refViews[view];
        }
    };

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
        // creat "Can" objects
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
    };

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
                        try {
                            newScript.setAttribute(attr.name, attr.value);
                            if (attr.name === 'src') {
                                onLoad = true;
                            }
                        } catch (error) {
                            console.error(`WTF?? in ${attr.ownerElement.id}: ${error}`);
                        }
                    });

                if (onLoad) {
                    const promise = new Promise(resolve => {
                        newScript.onload = resolve;
                    });
                    loadPromises.push(promise);
                }

                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });

        // console.log(loadPromises);

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

    async loadWidgets() {
        try {
            const data = await fetch('widgets.html');
            const text = await data.text();
            const div = document.createElement('div');
            document.body.appendChild(div);

            await VisEngine.setInnerHTML(div, text);
            // console.log('Loaded');

            // Send react widgets to App only in edit mode
            const arrayWidgets = [];
            !this.props.runtime && Object.keys((await VisView.collectInformation(this.props.socket))).forEach(item => arrayWidgets.push(item));
            this.props.onLoaded && this.props.onLoaded(arrayWidgets);
        } catch (error) {
            console.error(`Cannot load widgets: ${error}`);
            console.error(`Cannot load widgets: ${JSON.stringify(error.stack)}`);
        }
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
    };

    unregisterChangeHandler = (wid, cb) => {
        if (this.widgetChangeHandlers[wid] === cb) {
            delete this.widgetChangeHandlers[wid];
        }
    };

    onUserCommand(instance, command, data) {
        const currentInstance = window.localStorage.getItem('visInstance');
        if (!instance || (instance !== currentInstance && instance !== 'FFFFFFFF' && !instance.includes('*'))) {
            return false;
        }
        if (this.props.editMode && command !== 'tts' && command !== 'playSound') {
            // show command
            if (command !== 'changedView') {
                window.alert(I18n.t('Received user command: %s', JSON.stringify({ instance, command, data })));
            }
            return true;
        }
        // external Commands
        switch (command) {
            case 'alert': {
                const [message, title, icon] = data.split(';');
                this.showMessage(message, title, icon);
                break;
            }
            case 'changedView':
                // Do nothing
                return false;
            case 'changeView': {
                const [project, view] = data.split('/');
                if (view) {
                    // detect actual project
                    if (project !== this.props.projectName) {
                        if (window.location.search.includes('runtime=')) {
                            document.location.href = `./?${project}&runtime=true#${view}`;
                        } else {
                            document.location.href = `./?${project}#${view}`;
                        }
                        return true;
                    }
                }

                window.vis.changeView(view || project, view || project);
                break;
            }
            case 'refresh':
            case 'reload':
                setTimeout(() =>
                    window.location.reload(), 1);
                break;
            case 'dialog':
            case 'dialogOpen':
                // noinspection JSJQueryEfficiency
                window.jQuery(`#${data}_dialog`).dialog('open');
                break;
            case 'dialogClose':
                // noinspection JSJQueryEfficiency
                window.jQuery(`#${data}_dialog`).dialog('close');
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
                        href = `${window.location.protocol}//${window.location.hostname}:${window.location.port}${data}`;
                    }
                    // force read from server
                    href += `?${Date.now()}`;
                    if (this.refSound?.current) {
                        this.refSound.current.setAttribute('src', href);
                        this.refSound.current.setAttribute('muted', false);
                        this.refSound.current.play();
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
                        window.document.getElementById('external_sound').play();
                    }
                }, 1);
                break;
            case 'tts':
                if (typeof window.app !== 'undefined') {
                    window.app.tts(data);
                }
                break;
            default:
                this.conn.logError(`unknown external command ${command}`);
        }

        return false;
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
                    console.warn(`Command seems to be an object, but cannot parse it: ${state.val}`);
                }
            }

            // if command is an object {instance: 'iii', command: 'cmd', data: 'ddd'}
            if (state.val && state.val.instance) {
                if (this.onUserCommand(state.val.instance, state.val.command, state.val.data)) {
                    // clear state
                    this.props.socket.setState(id, { val: '', ack: true })
                        .catch(error => console.error(`Cannot reset ${id}: ${error}`));
                }
            } else if (this.onUserCommand(this._cmdInstance, state.val, this._cmdData)) {
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
                item.callback(item.arg, id, state.val, state.ack, state.ts);
            } catch (e) {
                this.props.socket.log(`Error: can't update states object for ${id}(${e}): ${JSON.stringify(e.stack)}`, 'error');
            }
        });
    };

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
    };

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
    };

    updateCustomScripts() {
        if (this.props.views) {
            if (!this.props.editMode) {
                if (this.props.views.___settings) {
                    if (this.scripts !== (this.props.views.___settings.scripts || '')) {
                        this.scripts = this.props.views.___settings.scripts || '';
                        let userScript = window.document.getElementById('#vis_user_scripts');
                        if (!userScript) {
                            userScript = window.document.createElement('script');
                            userScript.setAttribute('id', 'vis_user_scripts');
                            userScript.innerHTML = `try {
${this.scripts}
} catch (error) {
    console.error('Cannot execute user script: ' + error);
}`;
                            try {
                                window.document.head.appendChild(userScript);
                            } catch (error) {
                                console.error(`Cannot execute user script: ${error}`);
                            }
                        } else {
                            userScript.innerHTML = this.scripts;
                        }
                    }
                }
            } else if (this.scripts) {
            // unload scripts in edit mode
                this.scripts = null;
                let userScript = window.document.getElementById('#vis_user_scripts');
                if (userScript) {
                    userScript.remove();
                    userScript = null;
                }
            }
        }
    }

    static applyUserStyles(id, styles) {
        let styleEl = window.document.getElementById(id);
        if (styleEl) {
            styleEl.innerHTML = styles;
        } else {
            styleEl = window.document.createElement('style');
            styleEl.setAttribute('id', id);
            styleEl.innerHTML = styles;
            // insert common always first and then user css, as user CSS has bigger priority
            if (id === 'vis_common_user') {
                // try to find vis_user
                const styleUserEl = window.document.getElementById('vis_user');
                if (styleUserEl) {
                    window.document.head.insertBefore(styleEl, styleUserEl);
                } else {
                    window.document.head.appendChild(styleEl);
                }
            } else if (id === 'vis_user') {
                // try to find vis_user
                window.document.head.appendChild(styleEl);
            }
        }
    }

    updateCommonCss() {
        if (!this.visCommonCssLoaded || (this.props.visCommonCss && this.visCommonCssLoaded !== this.props.visCommonCss)) {
            this.visCommonCssLoaded = this.props.visCommonCss || true;
            if (this.props.visCommonCss) {
                VisEngine.applyUserStyles('vis_common_user', this.visCommonCssLoaded || '');
            } else {
                this.props.socket.readFile(this.props.adapterName, 'css/vis-common-user.css')
                    .then(file => {
                        if (file.type) {
                            file = file.data;
                        }
                        this.visCommonCssLoaded = file || true;
                        VisEngine.applyUserStyles('vis_common_user', file || '');
                    })
                    .catch(e => console.warn(`Common user CSS not found: ${e}`));
            }
        }
    }

    updateUserCss() {
        if (!this.visUserCssLoaded || (this.props.visUserCss && this.visUserCssLoaded !== this.props.visUserCss)) {
            this.visUserCssLoaded = this.props.visUserCss || true;
            if (this.props.visUserCss) {
                VisEngine.applyUserStyles('vis_user', this.visUserCssLoaded || '');
            } else {
                this.props.socket.readFile(`${this.props.adapterName}.${this.props.instance}`, `${this.props.projectName}/vis-user.css`)
                    .then(file => {
                        if (file.type) {
                            file = file.data;
                        }
                        this.visUserCssLoaded = file || true;
                        VisEngine.applyUserStyles('vis_user', file || '');
                    });
            }
        }
    }

    render() {
        if (!this.state.ready) {
            return null;
        }

        this.vis.editMode = this.props.editMode;
        this.vis.activeView = this.props.activeView;
        this.vis.views = this.props.views;

        this.updateCustomScripts();
        this.updateCommonCss();
        this.updateUserCss();

        const views = Object.keys(this.props.views).map(view => {
            if (view !== '___settings' && (view === this.props.activeView || this.props.views[view].settings?.alwaysRender)) {
                // return <div id="vis_container" ref={this.divRef} style={{ width: '100%', height: '100%' }} />;
                return <VisView
                    key={view}
                    view={view}
                    activeView={this.props.activeView}
                    views={this.props.views}
                    editMode={this.props.editMode}
                    editModeComponentClass={this.props.editModeComponentClass}
                    can={this.can}
                    canStates={this.canStates}
                    user={this.user}
                    dateFormat={this.vis.dateFormat}
                    userGroups={this.userGroups}
                    allWidgets={this.allWidgets}
                    jQuery={window.jQuery}
                    lang={this.props.lang}
                    $$={window.$$}
                    adapterName={this.props.adapterName}
                    instance={this.props.instance}
                    projectName={this.props.projectName}
                    socket={this.props.socket}
                    viewsActiveFilter={this.viewsActiveFilter}
                    setValue={this.setValue}
                    linkContext={this.linkContext}
                    formatUtils={this.formatUtils}
                    widgetHint={this.props.widgetHint}
                    selectedWidgets={this.props.runtime ? null : this.props.selectedWidgets}
                    setSelectedWidgets={this.props.runtime ? null : this.props.setSelectedWidgets}
                    onWidgetsChanged={this.props.runtime ? null : this.props.onWidgetsChanged}
                    selectedGroup={this.props.selectedGroup}
                    setSelectedGroup={this.props.setSelectedGroup}
                    timeInterval={this.state.timeInterval}
                    setTimeInterval={this.setTimeInterval}
                    timeStart={this.state.timeStart}
                    setTimeStart={this.setTimeStart}
                    showWidgetNames={this.props.showWidgetNames}
                    lockDragging={this.props.lockDragging}
                    disableInteraction={this.props.disableInteraction}
                    registerEditorCallback={this.props.runtime ? null : this.props.registerEditorCallback}
                    systemConfig={this.systemConfig}
                    themeType={this.props.themeType}
                    themeName={this.props.themeName}
                    theme={this.props.theme}
                    project={this.props.project}
                />;
            }

            return null;
        });

        if (this.refSound) {
            views.push(<audio ref={this.refSound} key="__audio_145" id="external_sound" autoPlay muted></audio>);
        }

        views.push(this.renderMessageDialog());

        return views;
    }
}

VisEngine.propTypes = {
    socket: PropTypes.object.isRequired,
    views: PropTypes.object.isRequired, // project
    activeView: PropTypes.string,
    lang: PropTypes.string.isRequired,
    editMode: PropTypes.bool,
    editModeComponentClass: PropTypes.string,
    onLoaded: PropTypes.func,
    selectedWidgets: PropTypes.array,
    setSelectedWidgets: PropTypes.func,
    runtime: PropTypes.bool,
    onWidgetsChanged: PropTypes.func,
    onFontsUpdate: PropTypes.func,
    showWidgetNames: PropTypes.bool,
    registerEditorCallback: PropTypes.func,
    visCommonCss: PropTypes.string,
    visUserCss: PropTypes.string,
    setSelectedGroup: PropTypes.func,
    widgetHint: PropTypes.string,
    themeType: PropTypes.string,
    themeName: PropTypes.string,
    theme: PropTypes.object,

    adapterName: PropTypes.string.isRequired,
    instance: PropTypes.number.isRequired,
    projectName: PropTypes.string.isRequired,
    adapterId: PropTypes.string.isRequired, // vis.0
};

export default VisEngine;
