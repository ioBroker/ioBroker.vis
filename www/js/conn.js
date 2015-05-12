////// ----------------------- Connection "class" ---------------------- ////////////
/* jshint browser:true */
/* global document*/
/* global console*/
/* global session*/
/* global window*/
/* global location*/
/* global setTimeout*/
/* global clearTimeout*/
/* global io*/
/* global $*/
/* global socketNamespace */
/* global socketUrl */
/* global socketSession */
/* jshint -W097 */// jshint strict:false

"use strict";

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
        onConnChange: null,
        onUpdate:     null,
        onRefresh:    null,
        onAuth:       null,
        onCommand:    null
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
    _subscribes:        [],
    _cmdData:           null,
    _cmdInstance:       null,
    namespace:          'vis.0',
    getType:          function () {
        return this._type;
    },
    getIsConnected:   function () {
        return this._isConnected;
    },
    _checkConnection: function (func, _arguments) {
        if (!this._isConnected) {
            console.log('No connection!');
            return false;
        }

        if (this._queueCmdIfRequired(func, _arguments)) return false;

        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return false;
        }
        return true;
    },
    init:             function (connOptions, connCallbacks) {
        // To start vis as local use one of:
        // - start vis from directory with name local, e.g. c:/blbla/local/ioBroker.vis/www/index.html
        // - do not create "_socket/info.js" file in "www" directory
        // - create "_socket/info.js" file with
        //   var socketUrl = "local"; var socketSession = ""; sysLang="en";
        //   in this case you can overwrite browser language settings
        if ((document.URL.split('/local/')[1] || (typeof socketUrl === 'undefined' || socketUrl === 'local'))) {
            this._type =  'local';
        }

        // init namespace
        if (typeof socketNamespace != 'undefined') this.namespace = socketNamespace;

        connOptions = connOptions || {};
        var that = this;
        if (!connOptions.name) connOptions.name = this.namespace;

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

        that._connCallbacks = connCallbacks;

        var connLink = connOptions.connLink || window.localStorage.getItem("connLink");

        // Connection data from "/_socket/info.js"
        if (!connLink && typeof socketUrl != 'undefined') connLink = socketUrl;
        if (!connOptions.socketSession && typeof socketSession != 'undefined') connOptions.socketSession = socketSession;

        // if no remote data
        if (this._type === 'local') {
            // report connected state
            that._isConnected = true;
            if (that._connCallbacks.onConnChange) that._connCallbacks.onConnChange(that._isConnected);
        } else
        if (typeof io != 'undefined') {
            connOptions.socketSession = connOptions.socketSession || 'nokey';

            var url;
            if (connLink) {
                url = connLink;
                if (typeof connLink != 'undefined') {
                    if (connLink[0] == ':') connLink = location.protocol + '://' + location.hostname + connLink;
                }
            } else {
                url = location.protocol + '//' + location.host;
            }

            that._socket = io.connect(url, {
                'query': 'key=' + connOptions.socketSession,
                'reconnection limit': 10000,
                'max reconnection attempts': Infinity
            });

            that._socket.on('connect', function () {
                this.emit('subscribe', '*');
                this.emit('name', connOptions.name);

                if (that._disconnectTimeout) {
                    clearTimeout(that._disconnectTimeout);
                    that._disconnectTimeout = null;
                }
                //console.log("socket.io connect");
                if (that._isConnected === true) {
                    // This seems to be a reconnect because we're already connected!
                    // -> prevent firing onConnChange twice
                    return;
                }
                that._isConnected = true;
                if (that._connCallbacks.onConnChange) {
                    setTimeout(function () {
                        that._connCallbacks.onConnChange(that._isConnected);
                    }, 0);
                }
                //this._myParent._autoReconnect();
            });

            that._socket.on('disconnect', function () {
                //console.log("socket.io disconnect");
                that._disconnectedSince = (new Date()).getTime();

                that._isConnected = false;
                if (that._connCallbacks.onConnChange) {
                    that.disconnectTimeout = setTimeout(function () {
                        that._connCallbacks.onConnChange(that._isConnected);
                    }, 5000);
                }
            });
            // after reconnect the "connect" event will be called
            that._socket.on('reconnect', function () {
                //console.log("socket.io reconnect");
                var offlineTime = (new Date()).getTime() - that._disconnectedSince;
                console.log('was offline for ' + (offlineTime / 1000) + 's');

                // TODO does this make sense?
                //if (offlineTime > 12000) {
                    //window.location.reload();
                //}
                //that._autoReconnect();
            });
            that._socket.on('objectChange', function (id, obj) {
                if (that._connCallbacks.onObjectChange) that._connCallbacks.onObjectChange(id, obj);
            });

            that._socket.on('stateChange', function (id, state) {
                if (!id || state === null || typeof state != 'object') return;

                if (that._connCallbacks.onCommand && id == that.namespace + '.control.command') {
                    if (state.ack) return;

                    if (state.val &&
                        typeof state.val == 'string' &&
                        state.val[0] == '{' &&
                        state.val[state.val.length - 1] == '}') {
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
                    } else {
                        if (that._connCallbacks.onCommand(that._cmdInstance, state.val, that._cmdData)) {
                            // clear state
                            that.setState(id, {val: '', ack: true});
                        }
                    }
                } else if (id == that.namespace + '.control.data') {
                    that._cmdData = state.val;
                } else if (id == that.namespace + '.control.instance') {
                    that._cmdInstance = state.val;
                } else if (that._connCallbacks.onUpdate) {
                    that._connCallbacks.onUpdate(id, state);
                }
            });
        }
    },
    getVersion:       function (callback) {
        if (!this._checkConnection('getVersion', arguments)) return;

        this._socket.emit('getVersion', function (version) {
            if (callback) callback(version);
        });
    },
    _checkAuth:       function (callback) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('getVersion', function (version) {
            if (callback)
                callback(version);
        });
    },
    readFile:         function (filename, callback) {
        if (!callback) throw 'No callback set';

        if (this._type === 'local') {
            try {
                var data = storage.get(filename);
                callback(null, data ? JSON.parse(storage.get(filename)) : null);
            } catch (err) {
                callback(err, null);
            }
        } else {
            if (!this._checkConnection('readFile', arguments)) return;

            this._socket.emit('readFile', this.namespace, filename, function (err, data) {
                setTimeout(function () {
                    callback(err, data);
                }, 0);
            });
        }
    },
    readFile64:       function (filename, callback) {
        if (!callback) {
            throw 'No callback set';
        }
        this._socket.emit('readFile', this.namespace, filename, function (err, data) {
            if (data) {
                var ext = filename.match(/\.[^.]+$/);
                var _mimeType;
                if (ext == '.css') {
                    _mimeType = 'text/css';
                } else if (ext == '.bmp') {
                    _mimeType = 'image/bmp';
                } else if (ext == '.png') {
                    _mimeType = 'image/png';
                } else if (ext == '.jpg') {
                    _mimeType = 'image/jpeg';
                } else if (ext == '.jpeg') {
                    _mimeType = 'image/jpeg';
                } else if (ext == '.gif') {
                    _mimeType = 'image/gif';
                } else if (ext == '.tif') {
                    _mimeType = 'image/tiff';
                } else if (ext == '.js') {
                    _mimeType = 'application/javascript';
                } else if (ext == '.html') {
                    _mimeType = 'text/html';
                } else if (ext == '.htm') {
                    _mimeType = 'text/html';
                } else if (ext == '.json') {
                    _mimeType = 'application/json';
                } else if (ext == '.xml') {
                    _mimeType = 'text/xml';
                } else if (ext == '.svg') {
                    _mimeType = 'image/svg+xml';
                } else if (ext == '.eot') {
                    _mimeType = 'application/vnd.ms-fontobject';
                } else if (ext == '.ttf') {
                    _mimeType = 'application/font-sfnt';
                } else if (ext == '.woff') {
                    _mimeType = 'application/font-woff';
                } else if (ext == '.wav') {
                    _mimeType = 'audio/wav';
                } else if (ext == '.mp3') {
                    _mimeType = 'audio/mpeg3';
                } else {
                    _mimeType = 'text/javascript';
                }

                callback(err, {mime: _mimeType, data: btoa(data)});
            } else {
                callback(err);
            }
        });
    },
    writeFile:        function (filename, data, callback) {
        var that = this;
        if (this._type === 'local') {
            storage.set(filename, JSON.stringify(data));
            if (callback) callback();
        } else {
            if (!this._checkConnection('writeFile', arguments)) return;

            if (typeof data == 'object') data = JSON.stringify(data, null, 2);

            this._socket.emit('writeFile', this.namespace, filename, data, callback);
        }
    },
    // Write file base 64
    writeFile64:      function (filename, data, callback) {
        var that = this;
        if (!this._checkConnection('writeFile', arguments)) return;

        var parts = filename.split('/');
        var adapter = parts[1];
        parts.splice(0, 2);

        this._socket.emit('writeFile', adapter, parts.join('/'), atob(data), callback);
    },
    readDir:          function (dirname, callback) {
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return;
        }
        if (!dirname) dirname = '/';
        var parts = dirname.split('/');
        var adapter = parts[1];
        parts.splice(0, 2);

        this._socket.emit('readDir', adapter, parts.join('/'), function (err, data) {
            if (callback) callback(err, data);
        });
    },
    mkdir:            function (dirname, callback) {
        var parts = dirname.split('/');
        var adapter = parts[1];
        parts.splice(0, 2);

        this._socket.emit('mkdir', adapter, parts.join('/'), function (err) {
            if (callback) callback(err);
        });
    },
    unlink:           function (name, callback) {
        var parts = name.split('/');
        var adapter = parts[1];
        parts.splice(0, 2);

        this._socket.emit('unlink', adapter, parts.join('/'), function (err) {
            if (callback) callback(err);
        });
    },
    renameFile:       function (oldname, newname, callback) {
        var parts1 = oldname.split('/');
        var adapter = parts1[1];
        parts1.splice(0, 2);
        var parts2 = newname.split('/');
        parts2.splice(0, 2);
        this._socket.emit('rename', adapter, parts1.join('/'), parts2.join('/'), function (err) {
            if (callback) callback(err);
        });
    },
    setState:         function (pointId, value) {
        //socket.io
        if (this._socket === null) {
            //console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('setState', pointId, value);
    },
    // callback(err, data)
    getStates:        function (IDs, callback) {
        if (this._type === 'local') {
            return callback(null, []);
        }else {

            if (typeof IDs == 'function') {
                callback = IDs;
                IDs = null;
            }

            if (!this._checkConnection('getStates', arguments)) return;

            this._socket.emit('getStates', IDs, function (err, data) {
                if (err || !data) {
                    if (callback) {
                        callback(err || 'Authentication required');
                    }
                } else if (callback) {
                    callback(null, data);
                }
            });
        }
    },
    // callback(err, data)
    getObjects:       function (callback) {
        if (!this._checkConnection('getObjects', arguments)) return;
        var that = this;
        this._socket.emit('getObjects', function (err, data) {

            // Read all enums
            that._socket.emit('getObjectView', 'system', 'enum', {startkey: 'enum.', endkey: 'enum.\u9999'}, function (err, res) {
                if (err) {
                    callback(err);
                    return;
                }
                var result = {};
                for (var i = 0; i < res.rows.length; i++) {
                    data[res.rows[i].id] = res.rows[i].value;
                }

                // Read all adapters for images
                that._socket.emit('getObjectView', 'system', 'instance', {startkey: 'system.adapter.', endkey: 'system.adapter.\u9999'}, function (err, res) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    var result = {};
                    for (var i = 0; i < res.rows.length; i++) {
                        data[res.rows[i].id] = res.rows[i].value;
                    }

                    // Read all channels for images
                    that._socket.emit('getObjectView', 'system', 'channel', {startkey: '', endkey: '\u9999'}, function (err, res) {
                        if (err) {
                            callback(err);
                            return;
                        }
                        var result = {};
                        for (var i = 0; i < res.rows.length; i++) {
                            data[res.rows[i].id] = res.rows[i].value;
                        }

                        // Read all devices for images
                        that._socket.emit('getObjectView', 'system', 'device', {startkey: '', endkey: '\u9999'}, function (err, res) {
                            if (err) {
                                callback(err);
                                return;
                            }
                            var result = {};
                            for (var i = 0; i < res.rows.length; i++) {
                                data[res.rows[i].id] = res.rows[i].value;
                            }

                            if (callback) callback(err, data);
                        });
                    });
                });
            });
        });
    },
    addObject:        function (objId, obj, callback) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return;
        }
    },
    delObject:        function (objId) {
        if (!this._checkConnection('delObject', arguments)) return;

        this._socket.emit('delObject', objId);
    },
    getUrl:           function (url, callback) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('getUrl', url, function (data) {
            if (callback) {
                callback(data);
            }
        });
    },
    logError:         function (errorText) {
        console.log("Error: " + errorText);
        if (!this._isConnected) {
            //console.log("No connection!");
            return;
        }
        //socket.io
        if (this._socket === null) {
            console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('log', 'error', 'Addon DashUI  ' + errorText);
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
            console.log("No connection!");
            return;
        }

        if (!this._authInfo) {
            console.log("No credentials!");
        }
    },
    getConfig:        function (callback) {
        if (!this._checkConnection('getLanguage', arguments)) return;

        this._socket.emit('getObject', 'system.config', function (err, obj) {
            if (callback && obj && obj.common) {
                callback(null, obj.common);
            } else {
                callback('Cannot read language');
            }
        });
    },
    sendCommand:      function (instance, command, data) {
        this.setState(this.namespace + '.control.instance', {val: instance || 'notdefined', ack: true});
        this.setState(this.namespace + '.control.data',     {val: data,    ack: true});
        this.setState(this.namespace + '.control.command',  {val: command, ack: true});
    }
};
