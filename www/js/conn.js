////// ----------------------- Connection "class" ---------------------- ////////////
/* jshint browser: true */
/* global document */
/* global console */
/* global session */
/* global window */
/* global location */
/* global setTimeout */
/* global clearTimeout */
/* global io */
/* global $ */
/* global socketNamespace */
/* global socketUrl */
/* global socketSession */
/* global storage */
/* jshint -W097 */
/* jshint strict: false */

'use strict';

// The idea of servConn is to use this class later in every addon.
// The addon just must say, what must be loaded (values, objects, indexes) and
// the class loads it for addon. Authentication will be done automatically, so addon does not care about it.
// It will be .js file with localData and servConn

var servConn = {
    _socket:            null,
    _onConnChange:      null,
    _onUpdate:          null,
    _isConnected:       false,
    _disconnectedSince: null,
    _connCallbacks:     {
        onConnChange:   null,
        onUpdate:       null,
        onRefresh:      null,
        onAuth:         null,
        onCommand:      null,
        onError:        null
    },
    _authInfo:          null,
    _isAuthDone:        false,
    _isAuthRequired:    false,
    _authRunning:       false,
    _cmdQueue:          [],
    _connTimer:         null,
    _type:              'socket.io', // [SignalR | socket.io | local]
    _timeout:           0,           // 0 - use transport default timeout to detect disconnect
    _reconnectInterval: 10000,       // reconnect interval
    _reloadInterval:    30,          // if connection was absent longer than 30 seconds
    _reconnectionCount: 0,           // if we have many reconnections in a row, try to reload instead - workaround for https://github.com/ioBroker/ioBroker.vis/issues/332
    _cmdData:           null,
    _cmdInstance:       null,
    _isSecure:          false,
    _defaultMode:       0x644,
    _useStorage:        false,
    _objects:           null,        // used if _useStorage === true
    _enums:             null,        // used if _useStorage === true
    _autoSubscribe:     true,
    namespace:          'vis.0',

    getType:          function () {
        return this._type;
    },
    getIsConnected:   function () {
        return this._isConnected;
    },
    getIsLoginRequired: function () {
        return this._isSecure;
    },
    getUser:          function () {
        return this._user;
    },
    setReloadTimeout: function (timeout){
        this._reloadInterval = parseInt(timeout, 10);
    },
    setReconnectInterval: function (interval){
        this._reconnectInterval = parseInt(interval, 10);
    },
    _checkConnection: function (func, _arguments) {
        if (!this._isConnected) {
            console.log('No connection!');
            return false;
        }

        if (this._queueCmdIfRequired(func, _arguments)) {
            return false;
        }

        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return false;
        } else {
            return true;
        }
    },
    _monitor:         function () {
        if (this._timer) {
            return;
        }

        var ts = Date.now();
        if (this._reloadInterval && ts - this._lastTimer > this._reloadInterval * 1000) {
            // It seems, that PC was in a sleep => Reload page to request authentication anew
            this.reload();
        } else {
            this._lastTimer = ts;
        }

        var that = this;
        this._timer = setTimeout(function () {
            that._timer = null;
            that._monitor();
        }, 10000);
    },
    _onAuth:          function (objectsRequired, isSecure) {
        var that = this;

        this._isSecure = isSecure;

        if (this._isSecure) {
            that._lastTimer = Date.now();
            this._monitor();
        }

        this._autoSubscribe && this._socket.emit('subscribe', '*');
        objectsRequired && this._socket.emit('subscribeObjects', '*');

        if (this._isConnected === true) {
            // This seems to be a reconnect because we're already connected!
            // -> prevent firing onConnChange twice
            return;
        }

        this._isConnected = true;
        if (this._connCallbacks.onConnChange) {
            setTimeout(function () {
                that._socket.emit('authEnabled', function (auth, user) {
                    that._user = user;
                    that._connCallbacks.onConnChange(that._isConnected);
                    typeof app !== 'undefined' && app.onConnChange(that._isConnected);
                });
            }, 0);
        }
    },
    reconnect:        function (connOptions) {
        var that = this;
        if (++this._reconnectionCount >= 5) {
            this._reconnectionCount = 0; // reset counter
            // try reload instead
            this.reload();
            return;
        }
        // reconnect
        if ((!connOptions.mayReconnect || connOptions.mayReconnect()) && !this._connectInterval) {
            this._connectInterval = setInterval(function () {
                console.log('Trying connect...');
                that._socket.connect();
                that._countDown = Math.floor(that._reconnectInterval / 1000);
                if (typeof $ !== 'undefined') {
                    $('.splash-screen-text').html(that._countDown + '...').css('color', 'red');
                }
            }, this._reconnectInterval);

            this._countDown = Math.floor(this._reconnectInterval / 1000);
            if (typeof $ !== 'undefined') {
                $('.splash-screen-text').html(this._countDown + '...');
            }

            this._countInterval = setInterval(function () {
                that._countDown--;
                if (typeof $ !== 'undefined') {
                    $('.splash-screen-text').html(that._countDown + '...');
                }
            }, 1000);
        }
    },
    reload:           function () {
        if (window.location.host === 'iobroker.net' ||
            window.location.host === 'iobroker.biz' ||
            window.location.host === 'iobroker.pro') {
            window.location = '/';
        } else {
            window.location.reload();
        }
    },
    init:             function (connOptions, connCallbacks, objectsRequired, autoSubscribe) {
        var that = this; // support of old safari
        // init namespace
        if (typeof socketNamespace !== 'undefined') {
            this.namespace = socketNamespace;
        }

        connOptions = connOptions || {};
        if (!connOptions.name) {
            connOptions.name = this.namespace;
        }

        if (autoSubscribe !== undefined) {
            this._autoSubscribe = autoSubscribe;
        }

        // To start vis as local use one of:
        // - start vis from directory with name local, e.g. c:/blbla/local/ioBroker.vis/www/index.html
        // - do not create "_socket/info.js" file in "www" directory
        // - create "_socket/info.js" file with
        //   var socketUrl = "local"; var socketSession = ""; sysLang="en";
        //   in this case you can overwrite browser language settings
        if (document.URL.split('/local/')[1] || (typeof socketUrl === 'undefined' && !connOptions.connLink) || (typeof socketUrl !== 'undefined' && socketUrl === 'local')) {
            this._type = 'local';
        }

        if (typeof session !== 'undefined') {
            var user = session.get('user');
            if (user) {
                that._authInfo = {
                    user: user,
                    hash: session.get('hash'),
                    salt: session.get('salt')
                };
            }
        }

        this._connCallbacks = connCallbacks;

        var connLink = connOptions.connLink || window.localStorage.getItem('connLink');

        // Connection data from "/_socket/info.js"
        if (!connLink && typeof socketUrl !== 'undefined') {
            connLink = socketUrl;
        }
        if (!connOptions.socketSession && typeof socketSession !== 'undefined') {
            connOptions.socketSession = socketSession;
        }
        if (connOptions.socketForceWebSockets === undefined && typeof socketForceWebSockets !== 'undefined') {
            connOptions.socketForceWebSockets = socketForceWebSockets;
        }

        // if no remote data
        if (this._type === 'local') {
            // report connected state
            this._isConnected = true;
            this._connCallbacks.onConnChange && this._connCallbacks.onConnChange(this._isConnected);
            typeof app !== 'undefined' && app.onConnChange(this._isConnected);
        } else
        if (typeof io !== 'undefined') {
            connOptions.socketSession = connOptions.socketSession || 'nokey';

            var url;
            if (connLink) {
                if (typeof connLink !== 'undefined') {
                    if (connLink[0] === ':') {
                        connLink = location.protocol + '//' + location.hostname + connLink;
                    }
                }
                url = connLink;
            } else {
                url = location.protocol + '//' + location.host;
            }

            // remove port if via cloud
            if (url.match(/iobroker\.pro|iobroker\.net/)) {
                url = url.replace(/:\d+/, '');
            }

            this._socket = io.connect(url, {
                query:                          'key=' + connOptions.socketSession,
                'reconnection limit':           10000,
                'max reconnection attempts':    Infinity,
                reconnection:                   false,
                upgrade:                        !connOptions.socketForceWebSockets,
                rememberUpgrade:                connOptions.socketForceWebSockets,
                transports:                     connOptions.socketForceWebSockets ? ['websocket'] : undefined
            });

            this._socket.on('connect', function () {
                that._reconnectionCount = 0; // reset counter

                if (that._disconnectedSince) {
                    var offlineTime = Date.now() - that._disconnectedSince;
                    console.log('was offline for ' + (offlineTime / 1000) + 's');

                    // reload whole page if no connection longer than some period
                    if (that._reloadInterval && offlineTime > that._reloadInterval * 1000 && !that.authError) {
                        that.reload();
                    }

                    that._disconnectedSince = null;
                }

                if (that._connectInterval) {
                    clearInterval(that._connectInterval);
                    that._connectInterval = null;
                }
                if (that._countInterval) {
                    clearInterval(that._countInterval);
                    that._countInterval = null;
                }
                var elem = document.getElementById('server-disconnect');
                if (elem) {
                    elem.style.display = 'none';
                }

                that._socket.emit('name', connOptions.name);
                console.log(new Date().toISOString() + ' Connected => authenticate');

                setTimeout(function () {
                    var timeOut = 6000;
                    // If online give more time
                    if (window.location.href.indexOf('iobroker.') !== -1) {
                        timeOut = 12000;
                    }
                    that.waitConnect = setTimeout(function() {
                        console.error('No answer from server');
                        if (!that.authError) {
                            that.reload();
                        }
                    }, timeOut);

                    that._socket.emit('authenticate', function (isOk, isSecure) {
                        if (that.waitConnect) {
                            clearTimeout(that.waitConnect);
                            that.waitConnect = null;
                        }

                        console.log(new Date().toISOString() + ' Authenticated: ' + isOk);

                        if (isOk) {
                            that._onAuth(objectsRequired, isSecure);
                        } else {
                            console.log('permissionError');
                        }
                    });
                }, 50);
            });

            this._socket.on('reauthenticate', function (err) {
                if (that._connCallbacks.onConnChange) {
                    that._connCallbacks.onConnChange(false);
                    typeof app !== 'undefined' && !that.authError &&  app.onConnChange(false);
                }
                console.warn('reauthenticate');
                if (that.waitConnect) {
                    clearTimeout(that.waitConnect);
                    that.waitConnect = null;
                }

                if (connCallbacks.onAuthError) {
                    if (!that.authError) {
                        that.authError = true;
                        connCallbacks.onAuthError(err);
                    }
                } else {
                    that.reload();
                }
            });

            this._socket.on('connect_error', function () {
                if (typeof $ !== 'undefined') {
                    $('.splash-screen-text').css('color', '#002951');
                }

                that.reconnect(connOptions);
            });

            this._socket.on('disconnect', function () {
                that._disconnectedSince = Date.now();

                // called only once when connection lost (and it was here before)
                that._isConnected = false;
                if (that._connCallbacks.onConnChange) {
                    setTimeout(function () {
                        //show server disconnect layer only when socket is not reconnected in the 5s timeout
                        if (that._isConnected) {
                            return
                        }
                        var elem = document.getElementById('server-disconnect');
                        if (elem) {
                            elem.style.display = '';
                        }
                        that._connCallbacks.onConnChange(that._isConnected);
                        typeof app !== 'undefined' && app.onConnChange(that._isConnected);
                    }, 5000);
                } else {
                    var elem = document.getElementById('server-disconnect');
                    if (elem) {
                        elem.style.display = '';
                    }
                }

                // reconnect
                that.reconnect(connOptions);
            });

            // after reconnect the "connect" event will be called
            this._socket.on('reconnect', function () {
                var offlineTime = Date.now() - that._disconnectedSince;
                console.log('was offline for ' + (offlineTime / 1000) + 's');

                // reload whole page if no connection longer than one minute
                if (that._reloadInterval && offlineTime > that._reloadInterval * 1000) {
                    that.reload();
                }
                // anyway "on connect" is called
            });

            this._socket.on('objectChange', function (id, obj) {
                // If cache used
                if (that._useStorage && typeof storage !== 'undefined') {
                    var objects = that._objects || storage.get('objects');
                    if (objects) {
                        if (obj) {
                            objects[id] = obj;
                        } else if (objects[id]) {
                            delete objects[id];
                        }
                        storage.set('objects',  objects);
                    }
                }

                that._connCallbacks.onObjectChange && that._connCallbacks.onObjectChange(id, obj);
            });

            this._socket.on('stateChange', function (id, state) {
                if (!id || state === null || typeof state !== 'object') {
                    return;
                }

                if (that._connCallbacks.onCommand && id === that.namespace + '.control.command') {
                    if (state.ack) {
                        return;
                    }

                    if (state.val &&
                        typeof state.val === 'string' &&
                        state.val[0] === '{' &&
                        state.val[state.val.length - 1] === '}') {
                        try {
                            state.val = JSON.parse(state.val);
                        } catch (e) {
                            console.log('Command seems to be an object, but cannot parse it: ' + state.val);
                        }
                    }

                    // if command is an object {instance: 'iii', command: 'cmd', data: 'ddd'}
                    if (state.val && state.val.instance) {
                        if (that._connCallbacks.onCommand(state.val.instance, state.val.command, state.val.data)) {
                            // clear state
                            that.setState(id, {val: '', ack: true});
                        }
                    } else if (that._connCallbacks.onCommand(that._cmdInstance, state.val, that._cmdData)) {
                        // clear state
                        that.setState(id, {val: '', ack: true});
                    }
                } else if (id === that.namespace + '.control.data') {
                    that._cmdData = state.val;
                } else if (id === that.namespace + '.control.instance') {
                    that._cmdInstance = state.val;
                } else if (that._connCallbacks.onUpdate) {
                    that._connCallbacks.onUpdate(id, state);
                }
            });

            this._socket.on('permissionError', function (err) {
                if (that._connCallbacks.onError) {
                    /* {
                     command:
                     type:
                     operation:
                     arg:
                     }*/
                    that._connCallbacks.onError(err);
                } else {
                    console.log('permissionError');
                }
            });

            this._socket.on('error', function (err) {
                if (err === 'Invalid password or user name') {
                    console.warn('reauthenticate');
                    if (that.waitConnect) {
                        clearTimeout(that.waitConnect);
                        that.waitConnect = null;
                    }

                    if (connCallbacks.onAuthError) {
                        if (!that.authError) {
                            that.authError = true;
                            connCallbacks.onAuthError(err);
                        }
                    } else {
                        that.reload();
                    }
                } else {
                    console.error('Socket error: ' + err);
                    if (typeof $ !== 'undefined') {
                        $('.splash-screen-text').css('color', '#002951');
                    }

                    that.reconnect(connOptions);
                }
            });
        }
    },
    logout:           function (callback) {
        if (!this._isConnected) {
            console.log('No connection!');
            return;
        }

        this._socket.emit('logout', callback);
    },
    getVersion:       function (callback) {
        if (!this._checkConnection('getVersion', arguments)) {
            return;
        }

        this._socket.emit('getVersion', function (error, version) {
            callback && callback(version || error);
        });
    },
    subscribe:        function (idOrArray, callback) {
        if (!this._checkConnection('subscribe', arguments)) {
            return;
        }

        this._socket.emit('subscribe', idOrArray, callback);
    },
    unsubscribe:      function (idOrArray, callback) {
        if (!this._checkConnection('unsubscribe', arguments)) {
            return;
        }

        this._socket.emit('unsubscribe', idOrArray, callback);
    },
    _checkAuth:       function (callback) {
        if (!this._isConnected) {
            console.log('No connection!');
            return;
        }
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('getVersion', function (error, version) {
            callback && callback(version || error);
        });
    },
    readFile:         function (filename, callback, isRemote) {
        if (!callback) {
            throw 'No callback set';
        }

        if (this._type === 'local') {
            try {
                var data = storage.get(filename);
                callback(null, data ? JSON.parse(storage.get(filename)) : null);
            } catch (err) {
                callback(err, null);
            }
        } else {
            if (!this._checkConnection('readFile', arguments)) {
                return;
            }

            if (!isRemote && typeof app !== 'undefined' && !app.settings.dontCache) {
                app.readLocalFile(filename.replace(/^\/vis\.0\//, ''), callback);
            } else {
                var adapter = this.namespace;
                if (filename[0] === '/') {
                    var p = filename.split('/');
                    adapter = p[1];
                    p.splice(0, 2);
                    filename = p.join('/');
                }

                this._socket.emit('readFile', adapter, filename, function (err, data, mimeType) {
                    setTimeout(function () {
                        callback(err, data, filename, mimeType);
                    }, 0);
                });
            }
        }
    },
    getMimeType:      function (ext) {
        if (ext.indexOf('.') !== -1) {
            ext = ext.toLowerCase().match(/\.[^.]+$/);
        }
        var _mimeType;
        if (ext === '.css') {
            _mimeType = 'text/css';
        } else if (ext === '.bmp') {
            _mimeType = 'image/bmp';
        } else if (ext === '.png') {
            _mimeType = 'image/png';
        } else if (ext === '.jpg') {
            _mimeType = 'image/jpeg';
        } else if (ext === '.jpeg') {
            _mimeType = 'image/jpeg';
        } else if (ext === '.gif') {
            _mimeType = 'image/gif';
        } else if (ext === '.tif') {
            _mimeType = 'image/tiff';
        } else if (ext === '.js') {
            _mimeType = 'application/javascript';
        } else if (ext === '.html') {
            _mimeType = 'text/html';
        } else if (ext === '.htm') {
            _mimeType = 'text/html';
        } else if (ext === '.json') {
            _mimeType = 'application/json';
        } else if (ext === '.xml') {
            _mimeType = 'text/xml';
        } else if (ext === '.svg') {
            _mimeType = 'image/svg+xml';
        } else if (ext === '.eot') {
            _mimeType = 'application/vnd.ms-fontobject';
        } else if (ext === '.ttf') {
            _mimeType = 'application/font-sfnt';
        } else if (ext === '.woff') {
            _mimeType = 'application/font-woff';
        } else if (ext === '.wav') {
            _mimeType = 'audio/wav';
        } else if (ext === '.mp3') {
            _mimeType = 'audio/mpeg3';
        } else {
            _mimeType = 'text/javascript';
        }
        return _mimeType;
    },
    readFile64:       function (filename, callback, isRemote) {
        var that = this;
        if (!callback) {
            throw 'No callback set';
        }

        if (!this._checkConnection('readFile64', arguments)) {
            return;
        }

        if (!isRemote && typeof app !== 'undefined' && !app.settings.dontCache) {
            app.readLocalFile(filename.replace(/^\/vis\.0\//, ''), function (err, data, mimeType) {
                setTimeout(function () {
                    if (data) {
                        callback(err, {mime: mimeType || that.getMimeType(filename), data: btoa(data)}, filename);
                    } else {
                        callback(err, filename);
                    }
                }, 0);
            });
        } else {
            var adapter = this.namespace;
            if (filename[0] === '/') {
                var p = filename.split('/');
                adapter = p[1];
                p.splice(0, 2);
                filename = p.join('/');
            }

            this._socket.emit('readFile64', adapter, filename, function (err, data, mimeType) {
                setTimeout(function () {
                    if (data) {
                        callback(err, {mime: mimeType || that.getMimeType(filename), data: data}, filename);
                    } else {
                        callback(err, {mime: mimeType || that.getMimeType(filename)}, filename);
                    }
                }, 0);
            });
        }
    },
    writeFile:        function (filename, data, mode, callback) {
        if (typeof mode === 'function') {
            callback = mode;
            mode = null;
        }
        if (this._type === 'local') {
            storage.set(filename, JSON.stringify(data));
            callback && callback();
        } else {
            if (!this._checkConnection('writeFile', arguments)) {
                return;
            }

            if (typeof data === 'object') {
                data = JSON.stringify(data, null, 2);
            }

            var parts = filename.split('/');
            var adapter = parts[1];
            parts.splice(0, 2);
            if (adapter === 'vis') {
                this._socket.emit('writeFile', adapter, parts.join('/'), data, mode ? {mode: this._defaultMode} : {}, callback);
            } else {
                this._socket.emit('writeFile', this.namespace, filename, data, mode ? {mode: this._defaultMode} : {}, callback);
            }
        }
    },
    // Write file base 64
    writeFile64:      function (filename, data, callback) {
        if (!this._checkConnection('writeFile64', arguments)) {
            return;
        }

        var parts = filename.split('/');
        var adapter = parts[1];
        parts.splice(0, 2);

        this._socket.emit('writeFile64', adapter, parts.join('/'), data, {mode: this._defaultMode}, callback);
    },
    readDir:          function (dirname, callback) {
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return;
        }
        dirname = dirname || '/';
        var parts = dirname.split('/');
        var adapter = parts[1];
        parts.splice(0, 2);

        this._socket.emit('readDir', adapter, parts.join('/'), {filter: true}, function (err, data) {
            callback && callback(err, data);
        });
    },
    mkdir:            function (dirname, callback) {
        var parts = dirname.split('/');
        var adapter = parts[1];
        parts.splice(0, 2);

        this._socket.emit('mkdir', adapter, parts.join('/'), function (err) {
            callback && callback(err);
        });
    },
    unlink:           function (name, callback) {
        var parts = name.split('/');
        var adapter = parts[1];
        parts.splice(0, 2);

        this._socket.emit('unlink', adapter, parts.join('/'), function (err) {
            callback && callback(err);
        });
    },
    renameFile:       function (oldname, newname, callback) {
        var parts1 = oldname.split('/');
        var adapter = parts1[1];
        parts1.splice(0, 2);
        var parts2 = newname.split('/');
        parts2.splice(0, 2);
        this._socket.emit('rename', adapter, parts1.join('/'), parts2.join('/'), function (err) {
            callback && callback(err);
        });
    },
    setState:         function (pointId, value, callback) {
        //socket.io
        if (this._socket === null) {
            //console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('setState', pointId, value, callback);
    },
    sendTo:         function (instance, command, payload, callback) {
        //socket.io
        if (this._socket === null) {
            //console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('sendTo', instance, command, payload, callback);
    },
    // callback(err, data)
    getStates:        function (IDs, callback) {
        if (typeof IDs === 'function') {
            callback = IDs;
            IDs = null;
        }

        if (this._type === 'local') {
            return callback(null, []);
        } else {
            if (!this._checkConnection('getStates', arguments)) {
                return;
            }
            var that = this;
            this.gettingStates = this.gettingStates || 0;
            if (this.gettingStates > 0) {
                // fix for slow devices -> if getStates still in progress, wait and try again
                console.log('Trying to get states again, because emitted getStates still pending');
                setTimeout(function () {
                    that.getStates(IDs, callback);
                }, 50);
                return;
            }

            this.gettingStates++;

            this._socket.emit('getStates', IDs, function (err, data) {
                that.gettingStates--;
                if (err || !data) {
                    callback && callback(err || 'Authentication required');
                } else if (callback) {
                    callback(null, data);
                }
            });
        }
    },
    _fillChildren:    function (objects) {
        var items = [];

        for (var id in objects) {
            if (!objects.hasOwnProperty(id)) {
                continue;
            }
            items.push(id);
        }
        items.sort();

        for (var i = 0; i < items.length; i++) {
            if (objects[items[i]].common) {
                var j = i + 1;
                var children = [];
                var len      = items[i].length + 1;
                var name     = items[i] + '.';
                while (j < items.length && items[j].substring(0, len) === name) {
                    children.push(items[j++]);
                }

                objects[items[i]].children = children;
            }
        }
    },
    getCharts: function (data, callback) {
        var that = this;
        // Check if chart view exists
        this._socket.emit('getObject', '_design/chart', function (err, obj) {
            if (obj && obj.views && obj.views.chart) {
                // Read all charts
                that._socket.emit('getObjectView', 'chart', 'chart', {startkey: '', endkey: '\u9999'}, function (err, res) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    for (var i = 0; i < res.rows.length; i++) {
                        data[res.rows[i].value._id] = res.rows[i].value;
                    }
                    callback();
                });
            } else {
                callback();
            }
        });
    },
    // callback(err, data)
    getObjects:       function (useCache, callback) {
        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }
        // If cache used
        if (this._useStorage && useCache) {
            if (typeof storage !== 'undefined') {
                var objects = this._objects || storage.get('objects');
                if (objects) {
                    return callback(null, objects);
                }
            } else if (this._objects) {
                return callback(null, this._objects);
            }
        }

        if (!this._checkConnection('getObjects', arguments)) {
            return;
        }
        var that = this;
        this._socket.emit('getObjects', function (err, data) {
            // Read all enums
            that._socket.emit('getObjectView', 'system', 'enum', {startkey: 'enum.', endkey: 'enum.\u9999'}, function (err, res) {
                if (err) {
                    return callback(err);
                }
                var enums = {};
                for (var i = 0; i < res.rows.length; i++) {
                    data[res.rows[i].id] = res.rows[i].value;
                    enums[res.rows[i].id] = res.rows[i].value;
                }

                // Read all adapters for images
                that._socket.emit('getObjectView', 'system', 'instance', {startkey: 'system.adapter.', endkey: 'system.adapter.\u9999'}, function (err, res) {
                    if (err) {
                        return callback(err);
                    }
                    for (var i = 0; i < res.rows.length; i++) {
                        data[res.rows[i].id] = res.rows[i].value;
                    }
                    // find out default file mode
                    if (data['system.adapter.' + that.namespace] &&
                        data['system.adapter.' + that.namespace].native &&
                        data['system.adapter.' + that.namespace].native.defaultFileMode) {
                        that._defaultMode = data['system.adapter.' + that.namespace].native.defaultFileMode;
                    }

                    // Read all charts
                    that.getCharts(data, function () {
                        // Read all channels for images
                        that._socket.emit('getObjectView', 'system', 'channel', {startkey: '', endkey: '\u9999'}, function (err, res) {
                            if (err) {
                                callback(err);
                                return;
                            }
                            for (var i = 0; i < res.rows.length; i++) {
                                data[res.rows[i].id] = res.rows[i].value;
                            }
                            // Read all devices for images
                            that._socket.emit('getObjectView', 'system', 'device', {
                                startkey: '',
                                endkey: '\u9999'
                            }, function (err, res) {
                                if (err) {
                                    return callback(err);
                                }
                                for (var i = 0; i < res.rows.length; i++) {
                                    data[res.rows[i].id] = res.rows[i].value;
                                }

                                if (that._useStorage) {
                                    that._fillChildren(data);
                                    that._objects = data;
                                    that._enums = enums;

                                    if (typeof storage !== 'undefined') {
                                        storage.set('objects', data);
                                        storage.set('enums', enums);
                                        storage.set('timeSync', Date.now());
                                    }
                                }

                                callback && callback(err, data);
                            });
                        });
                    });
                });
            });
        });
    },
    getChildren:      function (id, useCache, callback) {
        if (!this._checkConnection('getChildren', arguments)) {
            return;
        }

        if (typeof id === 'function') {
            callback = id;
            id = null;
            useCache = false;
        }
        if (typeof id === 'boolean') {
            callback = useCache;
            useCache = id;
            id = null;
        }
        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }

        if (!id) {
            return callback('getChildren: no id given');
        }

        var that = this;
        var data = [];

        if (this._useStorage && useCache) {
            if (typeof storage !== 'undefined') {
                var objects = storage.get('objects');
                if (objects && objects[id] && objects[id].children) {
                    return callback(null, objects[id].children);
                }
            } else if (this._objects && this._objects[id] && this._objects[id].children) {
                return callback(null, this._objects[id].children);
            }
        }

        // Read all devices
        that._socket.emit('getObjectView', 'system', 'device', {startkey: id + '.', endkey: id + '.\u9999'}, function (err, res) {
            if (err) {
                return callback(err);
            }
            for (var i = 0; i < res.rows.length; i++) {
                data[res.rows[i].id] = res.rows[i].value;
            }

            that._socket.emit('getObjectView', 'system', 'channel', {startkey: id + '.', endkey: id + '.\u9999'}, function (err, res) {
                if (err) {
                    return callback(err);
                }
                for (var i = 0; i < res.rows.length; i++) {
                    data[res.rows[i].id] = res.rows[i].value;
                }

                // Read all adapters for images
                that._socket.emit('getObjectView', 'system', 'state', {startkey: id + '.', endkey: id + '.\u9999'}, function (err, res) {
                    if (err) {
                        return callback(err);
                    }
                    for (var i = 0; i < res.rows.length; i++) {
                        data[res.rows[i].id] = res.rows[i].value;
                    }
                    var list = [];

                    var count = id.split('.').length;

                    // find direct children
                    for (var _id in data) {
                        if (data.hasOwnProperty(_id)) {
                            var parts = _id.split('.');
                            if (count + 1 === parts.length) {
                                list.push(_id);
                            }
                        }
                    }
                    list.sort();

                    if (that._useStorage && typeof storage !== 'undefined') {
                        var objects = storage.get('objects') || {};

                        for (var id_ in data) {
                            if (data.hasOwnProperty(id_)) {
                                objects[id_] = data[id_];
                            }
                        }
                        if (objects[id] && objects[id].common) {
                            objects[id].children = list;
                        }
                        // Store for every element theirs children
                        var items = [];
                        for (var __id in data) {
                            if (data.hasOwnProperty(__id)) {
                                items.push(__id);
                            }
                        }
                        items.sort();

                        for (var k = 0; k < items.length; k++) {
                            if (objects[items[k]].common) {
                                var j = k + 1;
                                var children = [];
                                var len  = items[k].length + 1;
                                var name = items[k] + '.';
                                while (j < items.length && items[j].substring(0, len) === name) {
                                    children.push(items[j++]);
                                }

                                objects[items[k]].children = children;
                            }
                        }

                        storage.set('objects', objects);
                    }

                    callback && callback(err, list);
                });
            });
        });
    },
    getObject:        function (id, useCache, callback) {
        if (typeof id === 'function') {
            callback = id;
            id = null;
            useCache = false;
        }
        if (typeof id === 'boolean') {
            callback = useCache;
            useCache = id;
            id = null;
        }
        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }
        if (!id)
            return callback('no id given');

        // If cache used
        if (this._useStorage && useCache && typeof storage !== 'undefined') {
            if (typeof storage !== 'undefined') {
                var objects = this._objects || storage.get('objects');
                if (objects && objects[id]) {
                    return callback(null, objects[id]);
                }
            } else if (this._enums) {
                return callback(null, this._enums);
            }
        }

        var that = this;

        this._socket.emit('getObject', id, function (err, obj) {
            if (err) {
                callback(err);
                return;
            }
            if (that._useStorage && typeof storage !== 'undefined') {
                var objects = storage.get('objects') || {};
                objects[id] = obj;
                storage.set('objects', objects);
            }
            return callback(null, obj);
        });
    },
    getGroups:        function (groupName, useCache, callback) {
        if (typeof groupName === 'function') {
            callback = groupName;
            groupName = null;
            useCache = false;
        }
        if (typeof groupName === 'boolean') {
            callback = useCache;
            useCache = groupName;
            groupName = null;
        }
        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }
        groupName = groupName || '';

        // If cache used
        if (this._useStorage && useCache) {
            if (typeof storage !== 'undefined') {
                var groups = this._groups || storage.get('groups');
                if (groups) {
                    return callback(null, groups);
                }
            } else if (this._groups) {
                return callback(null, this._groups);
            }
        }
        if (this._type === 'local') {
            return callback(null, []);
        } else {
            var that = this;
            // Read all enums
            this._socket.emit('getObjectView', 'system', 'group', {startkey: 'system.group.' + groupName, endkey: 'system.group.' + groupName + '\u9999'}, function (err, res) {
                if (err) {
                    return callback(err);
                }
                var groups = {};
                for (var i = 0; i < res.rows.length; i++) {
                    var obj = res.rows[i].value;
                    groups[obj._id] = obj;
                }
                if (that._useStorage) {
                    that._groups  = groups;

                    if (typeof storage !== 'undefined') {
                        storage.set('groups', groups);
                    }
                }

                callback(null, groups);
            });
        }
    },
    getEnums:         function (enumName, useCache, callback) {
        if (typeof enumName === 'function') {
            callback = enumName;
            enumName = null;
            useCache = false;
        }
        if (typeof enumName === 'boolean') {
            callback = useCache;
            useCache = enumName;
            enumName = null;
        }
        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }

        // If cache used
        if (this._useStorage && useCache) {
            if (typeof storage !== 'undefined') {
                var enums = this._enums || storage.get('enums');
                if (enums) {
                    return callback(null, enums);
                }
            } else if (this._enums) {
                return callback(null, this._enums);
            }
        }

        if (this._type === 'local') {
            return callback(null, []);
        } else {

            enumName = enumName ? enumName + '.' : '';
            var that = this;
            // Read all enums
            this._socket.emit('getObjectView', 'system', 'enum', {startkey: 'enum.' + enumName, endkey: 'enum.' + enumName + '\u9999'}, function (err, res) {
                if (err) {
                    return callback(err);
                }
                var enums = {};
                for (var i = 0; i < res.rows.length; i++) {
                    var obj = res.rows[i].value;
                    enums[obj._id] = obj;
                }
                if (that._useStorage && typeof storage !== 'undefined') {
                    storage.set('enums', enums);
                }
                callback(null, enums);
            });
        }
    },
    getLoggedUser:    function (callback) {
        this._socket.emit('authEnabled', callback);
    },
    // return time when the objects were synchronized
    getSyncTime:      function () {
        if (this._useStorage && typeof storage !== 'undefined') {
            var timeSync = storage.get('timeSync');
            if (timeSync) {
                return new Date(timeSync);
            }
        }
        return null;
    },
    addObject:        function (objId, obj, callback) {
        if (!this._isConnected) {
            console.log('No connection!');
        } else
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
        }
    },
    delObject:        function (objId) {
        if (!this._checkConnection('delObject', arguments)) {
            return;
        }

        this._socket.emit('delObject', objId);
    },
    httpGet:          function (url, callback) {
        if (!this._isConnected) {
            return console.log('No connection!');
        }
        //socket.io
        if (this._socket === null) {
            return console.log('socket.io not initialized');
        }
        this._socket.emit('httpGet', url, function (data) {
            callback && callback(data);
        });
    },
    logError:         function (errorText) {
        console.log('Error: ' + errorText);
        if (!this._isConnected) {
            //console.log('No connection!');
            return;
        }
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('log', 'error', 'Addon vis ' + errorText);
    },
    _queueCmdIfRequired: function (func, args) {
        var that = this;
        if (!this._isAuthDone) {
            // Queue command
            this._cmdQueue.push({func: func, args: args});

            if (!this._authRunning) {
                this._authRunning = true;
                // Try to read version
                this._checkAuth(function (version) {
                    // If we have got version string, so there is no authentication, or we are authenticated
                    that._authRunning = false;
                    if (version) {
                        that._isAuthDone  = true;
                        // Repeat all stored requests
                        var __cmdQueue = that._cmdQueue;
                        // Trigger GC
                        that._cmdQueue = null;
                        that._cmdQueue = [];
                        for (var t = 0, len = __cmdQueue.length; t < len; t++) {
                            that[__cmdQueue[t].func].apply(that, __cmdQueue[t].args);
                        }
                    } else {
                        // Auth required
                        that._isAuthRequired = true;
                        // What for AuthRequest from server
                    }
                });
            }

            return true;
        } else {
            return false;
        }
    },
    authenticate:     function (user, password, salt) {
        this._authRunning = true;

        if (user !== undefined) {
            this._authInfo = {
                user: user,
                hash: password + salt,
                salt: salt
            };
        }

        if (!this._isConnected) {
            return console.log('No connection!');
        }

        if (!this._authInfo) {
            console.log("No credentials!");
        }
    },
    getConfig:        function (useCache, callback) {
        if (!this._checkConnection('getConfig', arguments)) {
            return;
        }

        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }
        if (this._useStorage && useCache) {
            if (typeof storage !== 'undefined') {
                var objects = storage.get('objects');
                if (objects && objects['system.config']) {
                    return callback(null, objects['system.config'].common);
                }
            } else if (this._objects && this._objects['system.config']) {
                return callback(null, this._objects['system.config'].common);
            }
        }
        var that = this;
        this._socket.emit('getObject', 'system.config', function (err, obj) {
            if (callback && obj && obj.common) {
                if (that._useStorage && typeof storage !== 'undefined') {
                    var objects = storage.get('objects') || {};
                    objects['system.config'] = obj;
                    storage.set('objects', objects);
                }

                callback(null, obj.common);
            } else {
                callback('Cannot read language');
            }
        });
    },
    sendCommand:      function (instance, command, data, ack) {
        this.setState(this.namespace + '.control.instance', {val: instance || 'notdefined', ack: true});
        this.setState(this.namespace + '.control.data',     {val: data,    ack: true});
        this.setState(this.namespace + '.control.command',  {val: command, ack: ack === undefined ? true : ack});
    },
    _detectViews:     function (projectDir, callback) {
        this.readDir('/' + this.namespace + '/' + projectDir, function (err, dirs) {
            // find vis-views.json
            for (var f = 0; f < dirs.length; f++) {
                if (dirs[f].file === 'vis-views.json' && (!dirs[f].acl || dirs[f].acl.read)) {
                    return callback(err, {name: projectDir, readOnly: (dirs[f].acl && !dirs[f].acl.write), mode: dirs[f].acl ? dirs[f].acl.permissions : 0});
                }
            }
            callback(err);
        });
    },
    readProjects:     function (callback) {
        var that = this;
        this.readDir('/' + this.namespace, function (err, dirs) {
            var result = [];
            var count = 0;
            for (var d = 0; d < dirs.length; d++) {
                if (dirs[d].isDir) {
                    count++;
                    that._detectViews(dirs[d].file, function (subErr, project) {
                        project && result.push(project);
                        err = err || subErr;
                        !--count && callback(err, result);
                    });
                }
            }
        });
    },
    chmodProject:     function (projectDir, mode, callback) {
        //socket.io
        if (this._socket === null) {
            return console.log('socket.io not initialized');
        }
        this._socket.emit('chmodFile', this.namespace, projectDir + '*', {mode: mode}, function (err, data) {
            callback && callback(err, data);
        });
    },
    clearCache:       function () {
        if (typeof storage !== 'undefined') {
            storage.empty();
        }
    },
    getHistory:       function (id, options, callback) {
        if (!this._checkConnection('getHistory', arguments)) {
            return;
        }

        options = options || {};
        options.timeout = options.timeout || 2000;

        var timeout = setTimeout(function () {
            timeout = null;
            callback('timeout');
        }, options.timeout);

        this._socket.emit('getHistory', id, options, function (err, result) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            callback(err, result);
        });
    },
    getLiveHost:      function (cb) {
        var that = this;
        this._socket.emit('getObjectView', 'system', 'host', {startkey: 'system.host.', endkey: 'system.host.\u9999'}, function (err, res) {
            var _hosts = [];
            for (var h = 0; h < res.rows.length; h++) {
                _hosts.push(res.rows[h].id + '.alive');
            }
            if (!_hosts.length) {
                return cb('');
            }
            that.getStates(_hosts, function (err, states) {
                for (var h in states) {
                    if (states.hasOwnProperty(h) && (states[h].val === 'true' || states[h].val === true)) {
                        return cb(h.substring(0, h.length - '.alive'.length));
                    }
                }

                cb('');
            });
        });
    },
    readDirAsZip:     function (project, useConvert, callback) {
        if (!callback) {
            callback = useConvert;
            useConvert = undefined;
        }
        if (!this._isConnected) {
            return console.log('No connection!');
        }
        //socket.io
        if (this._socket === null) {
            return console.log('socket.io not initialized');
        }
        if (project.match(/\/$/)) {
            project = project.substring(0, project.length - 1);
        }

        var that = this;
        this.getLiveHost(function (host) {
            if (!host) {
                return window.alert('No active host found');
            }
            // to do find active host
            that._socket.emit('sendToHost', host, 'readDirAsZip', {
                id: that.namespace,
                name: project || 'main',
                options: {
                    settings: useConvert
                }
            }, function (data) {
                data.error && console.error(data.error);
                callback && callback(data.error, data.data);
            });

        });
    },
    writeDirAsZip:    function (project, base64, callback) {
        if (!this._isConnected) {
            return console.log('No connection!');
        }
        //socket.io
        if (this._socket === null) {
            return console.log('socket.io not initialized');
        }
        if (project.match(/\/$/)) {
            project = project.substring(0, project.length - 1);
        }
        var that = this;
        this.getLiveHost(function (host) {
            if (!host) {
                return window.alert('No active host found');
            }
            that._socket.emit('sendToHost', host, 'writeDirAsZip', {
                id:   that.namespace,
                name: project || 'main',
                data: base64
            }, function (data) {
                data.error && console.error(data.error);
                callback && callback(data.error);
            });
        });
    }
};
