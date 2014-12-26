////// ----------------------- Connection "class" ---------------------- ////////////


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
    _connCallbacks: {
        onConnChange: null,
        onUpdate:     null,
        onRefresh:    null,
        onAuth:       null
    },
    _authInfo:          null,
    _isAuthDone:        false,
    _isAuthRequired:    false,
    _authRunning:       false,
    _cmdQueue:          [],
    _connTimer:         null,
    _type:              1, // 0 - SignalR, 1 - socket.io, 2 - local demo
    _timeout:           0, // 0 - use transport default timeout to detect disconnect
    _reconnectInterval: 10000, // reconnect interval
    getType: function () {
        return 'socket.io';
    },
    getIsConnected: function () {
        return this._isConnected;
    },
    _checkConnection: function (func, arguments) {
        if (!this._isConnected) {
            console.log('No connection!');
            return false;
        }

        if (this._queueCmdIfRequired(func, arguments)) return false;

        //socket.io
        if (this._socket == null) {
            console.log('socket.io not initialized');
            return false;
        }
        return true;
    },
    init: function (connOptions, connCallbacks) {
        connOptions = connOptions || {};
        var that = this;

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

        if (typeof io != "undefined") {
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
                if (that._disconnectTimeout){
                    clearTimeout(that._disconnectTimeout);
                    that._disconnectTimeout = null;
                }
                //console.log("socket.io connect");
                if (that._isConnected == true) {
                    // This seems to be a reconnect because we're already connected!
                    // -> prevent firing onConnChange twice
                    return;
                }
                that._isConnected = true;
                if (that._connCallbacks.onConnChange) that._connCallbacks.onConnChange(that._isConnected);
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
            that._socket.on('reconnect', function () {
                //console.log("socket.io reconnect");
                var offlineTime = (new Date()).getTime() - that._disconnectedSince;
                //console.log("was offline for " + (offlineTime / 1000) + "s");

                // TODO does this make sense?
                if (offlineTime > 12000) {
                    //window.location.reload();
                }
                that._isConnected = true;
                if (that._connCallbacks.onConnChange) {
                    that._connCallbacks.onConnChange(that._isConnected);
                }
                //that._autoReconnect();
            });
            that._socket.on('objectChange', function () {
                if (that._connCallbacks.onObjectChange) that._connCallbacks.onObjectChange();
            });

            that._socket.on('stateChanged', function (obj) {
                if (obj == null) return;

                var o = {};
                o.name = obj[0]+"";
                o.val  = obj[1];
                o.ts   = obj[2];
                o.ack  = obj[3];
                o.lc   = obj[4];

                if (that._connCallbacks.onUpdate) this._connCallbacks.onUpdate(o);
            });
        } else {
            //console.log("socket.io not initialized");
        }
    },
    getVersion: function (callback) {
        if (!this._checkConnection('getVersion', arguments)) return;

        this._socket.emit('getVersion', function (version) {
            if (callback) {
                callback(version);
            }
        });
    },
    _checkAuth: function (callback) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }
        //socket.io
        if (this._socket == null) {
            console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('getVersion', function (version) {
            if (callback)
                callback(version);
        });
    },
    readFile: function (filename, callback) {
        if (!callback) {
            throw 'No callback set';
        }
        if (!this._checkConnection('readFile', arguments)) return;

        this._socket.emit('readFile', 'vis.0', filename, function (err, data) {
            callback(err, data);
        });
    },
    writeFile: function (filename, data, callback) {
        if (!this._checkConnection('writeFile', arguments)) return;

        this._socket.emit('writeFile', 'vis.0', filename, data, function (err) {
            if (callback) callback(err);
        });
    },
    readDir: function (dirname, callback) {
        //socket.io
        if (this._socket == null) {
            console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('readdir', dirname, function (data) {
            if (callback) {
                callback(data);
            }
        });
    },
    setState: function (pointId, value) {
        //socket.io
        if (this._socket == null) {
            console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('setState', [pointId, value]);
    },
    // callback (err, data)
    getStates: function (callback) {
        if (!this._checkConnection('getStates', arguments)) return;

        this._socket.emit('getStates', function (err, data) {
            if (err || !data) {
                if (callback) {
                    callback(err || 'Authentication required');
                }
            } else if (callback) {
                callback(null, data);
            }
        });
    },
    // callback (err, data)
    getObjects: function (callback) {
        if (!this._checkConnection('getObjects', arguments)) return;

        this._socket.emit('getObjects', function (err, data) {
            if (callback) callback(err, data);
        });
    },
    addObject: function (objId, obj, callback) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }
        //socket.io
        if (this._socket == null) {
            console.log('socket.io not initialized');
            return;
        }
    },
    delObject: function (objId) {
        if (!this._checkConnection('delObject', arguments)) return;

        this._socket.emit('delObject', objId);
    },
    getUrl: function (url, callback) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }
        //socket.io
        if (this._socket == null) {
            console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('getUrl', url, function (data) {
            if (callback) {
                callback(data);
            }
        });
    },
    logError: function (errorText) {
        console.log("Error: " + errorText);
        if (!this._isConnected) {
            //console.log("No connection!");
            return;
        }
        //socket.io
        if (this._socket == null) {
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
    authenticate: function (user, password, salt) {
        this._authRunning = true;

        if (user !== undefined) {
            this._authInfo = {
                user: user,
                hash: password+salt,
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
    getLanguage: function (callback) {
        if (!this._checkConnection('getLanguage', arguments)) return;

        this._socket.emit('getObject', 'system.config', function (err, obj){
            if (callback && obj && obj.common) {
                callback(null, obj.common.language);
            } else{
                callback('Cannot read language');
            }
        });
    }
};
