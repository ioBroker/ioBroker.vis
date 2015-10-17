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

// The idea of servConn is to use this class later in every addon (Yahui, Control and so on).
// The addon just must say, what must be loaded (values, objects, indexes) and
// the class loads it for addon. Authentication will be done automatically, so addon does not care about it.
// It will be .js file with localData and servConn

var servConn = {
    _socket:            null,
    _hub:               null,
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

    getIsConnected: function () {
        return this._isConnected;
    },
    getType: function () {
        return this._type;
    },
    init: function (connCallbacks, type) {
        if (typeof type == "string") {
            type = type.toLowerCase();
        }

        if (typeof session !== 'undefined') {
            var user = session.get('user');
            if (user) {
                this._authInfo = {
                    user: user,
                    hash: session.get('hash'),
                    salt: session.get('salt')
                };
            }
        }

        // If autodetect
        if (type === undefined) {
            type = visConfig.connType;

            if (type === undefined || type === null) {
                if (typeof io != "undefined") {
                    type = 1; // socket.io
                } else if (typeof $ != "undefined" && typeof $.connection != "undefined") {
                    type = 0; // SignalR
                } else {
                    type = 2; // local demo
                }
            }
        }

        this._connCallbacks = connCallbacks;

        var connLink = visConfig.connLink || window.localStorage.getItem("connLink");
        if (type === 0 || type == 'signalr') {
            this._type = 0;

            this.connection = $.hubConnection(connLink);
            this._hub = this.connection.createHubProxy("serverHub");
            //this._hub = $.connection.serverHub;
            if (!this._hub) {
                this._autoReconnect();
                return;
            }

            var that = this;
            this._hub.on("updatePointValue", function (model) {
                if (that._connCallbacks.onUpdate) {
                    that._connCallbacks.onUpdate({name: model.name, val: model.val, ts: model.ts, ack: model.ack});
                }
            });

            this._hub.on("authRequest", function (message, salt) {
                that._isAuthRequired = true;
                that._isAuthDone     = false;

                console.log('Auth request: ' + message);

                if (that._authInfo) {
                    // If we have auth information, send it automatically
                    that.authenticate();
                } else if (that._connCallbacks.onAuth) {
                    // Else request from GUI input of user, pass and data (salt)
                    that._connCallbacks.onAuth(message, salt);
                } else {
                    // TODO Translate
                    alert('server requires authentication, but no onAuth callback is installed!');
                }

            });
            this._hub.on("refresh", function () {
                if (that._connCallbacks.onRefresh) {
                    that._connCallbacks.onRefresh();
                }
            });
            this.connection.start().done(function () {
                that._isConnected = true;
                if (that._connCallbacks.onConnChange) {
                    that._connCallbacks.onConnChange(that._isConnected);
                }
                that._autoReconnect();
            });
            this.connection.reconnecting(function () {
                that._isConnected = false;
                if (that._connCallbacks.onConnChange) {
                    that._connCallbacks.onConnChange(that._isConnected);
                }
                that._autoReconnect();
            });
            this.connection.reconnected(function () {
                that._isConnected = true;
                if (that._connCallbacks.onConnChange) {
                    that._connCallbacks.onConnChange(that._isConnected);
                }
                that._autoReconnect();
            });
            this.connection.disconnected(function () {
                that._isConnected = false;
                if (that._connCallbacks.onConnChange) {
                    that._connCallbacks.onConnChange(that._isConnected);
                }
                that._autoReconnect();
            });
        } else if (type == 1 || type == "socket.io") {
            this._type = 1;
            if (typeof io != "undefined") {
                if (typeof socketSession == 'undefined') {
                    socketSession = 'nokey';
                }
                var url;
                if (connLink) {
                    url = connLink;
                } else {
                    url = jQuery(location).attr('protocol') + '//' + jQuery(location).attr('host');
                }

                this._socket = io.connect(url, {
                    'query': 'key=' + socketSession,
                    'reconnection limit': 10000,
                    'max reconnection attempts': Infinity
                });

                this._socket._myParent = this;

                this._socket.on('connect', function () {
                    //console.log("socket.io connect");
                    if (this._myParent._isConnected === true) {
                        // This seems to be a reconnect because we're already connected!
                        // -> prevent firing onConnChange twice
                        return;
                    }
                    this._myParent._isConnected = true;
                    if (this._myParent._connCallbacks.onConnChange) {
                        this._myParent._connCallbacks.onConnChange(this._myParent._isConnected);
                    }
                    //this._myParent._autoReconnect();
                });

                this._socket.on('disconnect', function () {
                    //console.log("socket.io disconnect");
                    this._myParent._disconnectedSince = (new Date()).getTime();
                    this._myParent._isConnected = false;
                    if (this._myParent._connCallbacks.onConnChange) {
                        this._myParent._connCallbacks.onConnChange(this._myParent._isConnected);
                    }
                    // Auto-Reconnect
                    //this._myParent._autoReconnect();
                });
                this._socket.on('reconnect', function () {
                    //console.log("socket.io reconnect");
                    var offlineTime = (new Date()).getTime() - this._myParent._disconnectedSince;
                    //console.log("was offline for " + (offlineTime / 1000) + "s");

                    // TODO does this make sense?
                    //if (offlineTime > 12000) {
                        //window.location.reload();
                    //}
                    this._myParent._isConnected = true;
                    if (this._myParent._connCallbacks.onConnChange) {
                        this._myParent._connCallbacks.onConnChange(this._myParent._isConnected);
                    }
                    //this._myParent._autoReconnect();
                });
                this._socket.on('refreshAddons', function () {
                    if (this._myParent._connCallbacks.onRefresh) {
                        this._myParent._connCallbacks.onRefresh();
                    }
                });

                this._socket.on('event', function (obj) {
                    if (obj === null) {
                        return;
                    }

                    var o = {};
                    o.name = obj[0] + "";
                    o.val  = obj[1];
                    o.ts   = obj[2];
                    o.ack  = obj[3];
                    o.lc   = obj[4];

                    if (this._myParent._connCallbacks.onUpdate) {
                        this._myParent._connCallbacks.onUpdate(o);
                    }

                });
            } //else {
                //console.log("socket.io not initialized");
            //}
        } else if (type == 2 || type == "local") {
            this._type       = 2;
            this._isAuthDone = true;

            this._isConnected = true;
            if (this._connCallbacks.onConnChange) {
                this._connCallbacks.onConnChange(this._isConnected);
            }
        }

        // start connection timer
        //this._autoReconnect();
        // Detect if running under cordova
        var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
        if (app) {
            $('body').append('<div id="system_menu" style="z-index:3000;width: 30%; height:30px; background-color: white; position:absolute; bottom: 0; left: 35%; display: none; border:1px solid black; text-align:center">' + _('Settings') + '</a></div>');
            $("#system_menu").click(function () {
                console.log("Goto settings");
                if (window.localStorage) {
                    window.localStorage.setItem("connSettings", true);
                }
                // Call settings window
                window.location.href = '../index.html';
            });
            // Install menu on menu button
            document.addEventListener("menubutton", function () {
                var menuDiv = $("#system_menu");
                if (servConn.menuOpen) {
                    console.log("close the menu");
                    menuDiv.hide();
                    servConn.menuOpen = false;
                } else {
                    console.log("open the menu");
                    menuDiv.show();
                    servConn.menuOpen = true;
                }
            }, false);
        }
    },
    // After 3 hours debugging...
    // It is questionable if ths function really required.
    // Socket.io automatically reconnects to the server and sets _isConnected to true, so
    // it will never happened...
    // And in the future we will have two servers - one for static pages and one for socket.io.

    // @Bluefox: i introduced this function because socket.io didn't reconnect sometimes after a long
    // offline period (several minutes/hours). Since 0.9beta97 it's buggy and causes a reload-loop with android
    // stock browser:
    // http://homematic-forum.de/forum/viewtopic.php?f=48&t=18271
    // so i deactivated it for now

    _autoReconnect: function () {
        // If connected
        if (this._isConnected) {
            if (window.localStorage) {
                window.localStorage.setItem("connCounter", 0);
            }
            // Stop connection timer
            if (this._connTimer) {
                clearInterval(this._connTimer);
                this._connTimer = null;
            }
        } else {
            // If not connected and the timer not yet started
            if (!this._connTimer) {
                // Start connection timer
                this._connTimer = _setInterval(function (conn) {
                    if (!conn._isConnected) {
                        var counter = 0;
                        if (window.localStorage) {
                            counter = parseInt(window.localStorage.getItem("connCounter") || 0);
                            window.localStorage.setItem("connCounter", counter++);
                        }
                        // Auto-Reconnect. DashUI can be located in any path.
                        var url = document.location.href;
                        var k = url.indexOf('#');
                        if (k != -1) {
                            url = url.substring(0, k);
                        }
                        if (url.indexOf('.html') == -1) {
                            url += 'index.html';
                        }
                        k = url.indexOf('?');
                        if (k != -1) {
                            url = url.substring(0, k);
                        }
                        url += '?random=' + Date.now().toString();
                        var parts = url.split('/');
                        parts = parts.slice(3);
                        url = '/' + parts.join('/');

                        // Detect if running under cordova
                        var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
                        if (app && counter > 3) {
                            url = url.replace('dashui/index.html', 'index.html');
                        }

                        $.ajax({
                            url: url,
                            cache: false,
                            success: function (data) {
                                // Check if it really index.html and not offline.html as fallback
                                if (data && data.length > 1000) {
                                    if (window.localStorage) {
                                        window.localStorage.setItem("connSettings", true);
                                    }
                                    window.location.reload();
                                }
                            }
                        });
                    } else {
                        clearInterval(conn._connTimer);
                        conn._connTimer = null;
                    }
                }, this._reconnectInterval, this);
            }
        }
    },
    getVersion: function (callback) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }

        if (this._queueCmdIfRequired('getVersion', callback)) {
            return;
        }

        //SignalR
        if (this._type === 0) {
            this._hub.invoke('getVersion').done(function (version) {
                if (callback) {
                    callback(version);
                }
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('getVersion', function (version) {
                if (callback) {
                    callback(version);
                }
            });
        }
    },
    _checkAuth: function (callback) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }
        if (this._type === 0) {
            //SignalR
            this._hub.invoke('getVersion').done(function (version) {
                if (callback)
                    callback(version);
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('getVersion', function (version) {
                if (callback)
                    callback(version);
            });
        }
    },
    readFile: function (filename, callback) {
        if (!this._isConnected) {
            console.log('No connection!');
            return;
        }

        if (this._queueCmdIfRequired("readFile", filename, callback)) {
            return;
        }

        if (this._type === 0) {
            //SignalR
            this._hub.invoke('readFile', filename).done(function (data) {
                if (callback) {
                    callback(data);
                }
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('readFile', filename, function (data) {
                if (callback) {
                    callback(data);
                }
            });
        } else if (this._type == 2) {
            //local

            // Try load views from local storage
            if (filename.indexOf('dashui-views') != -1) {
                if (typeof storage !== 'undefined') {
                    vis.views = storage.get(filename);
                    if (vis.views) {
                        callback(vis.views);
                        return;
                    } else {
                        vis.views = {};
                    }
                }
            }

            // Load from ../datastore/dashui-views.json the demo views
            jQuery.ajax({
                url: '../datastore/' + filename,
                type: 'get',
                async: false,
                dataType: 'text',
                cache: true,
                success: function (data) {
                    try {
                        vis.views = jQuery.parseJSON(data);
                        if (typeof vis.views == 'string') {
                            vis.views = (JSON && JSON.parse(vis.views)) || jQuery.parseJSON(vis.views);
                        }
                    } catch (e) {
                        // TODO Translate
                        alert('Invalid ' + filename + ' json format');
                    }
                    callback(vis.views);
                    if (!vis.views) {
                        alert(_('No Views found on Server'));
                    }
                },
                error: function (state) {
                    // TODO Translate
                    alert('Cannot get ' + location.href + '/../datastore/' + filename + '\n' + state.statusText);
                    callback([]);
                }
            });
        }
    },
    touchFile: function (filename) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }

        if (this._type === 0) {
            //SignalR
            this._hub.invoke('touchFile', filename);
        } else if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('touchFile', filename);
        }
    },
    writeFile: function (filename, data, callback) {
        if (this._type === 0) {
            //SignalR
            this._hub.invoke('writeFile', filename, JSON.stringify(data)).done(function (isOk) {
                if (callback) {
                    callback(isOk);
                }
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('writeFile', filename, data, function (isOk) {
                if (callback) {
                    callback(isOk);
                }
            });
        } else if (this._type == 2) {
            if (filename.indexOf('dashui-views') != -1) {
                if (typeof storage !== 'undefined') {
                    storage.set(filename, vis.views);
                    if (!storage.get('localWarnShown')) {
                        alert(_('All changes are saved locally. To reset changes clear the cache.'));
                        storage.set('localWarnShown', true);
                    }
                    if (callback) {
                        callback(true);
                    }
                }
            }
        }
    },
    readDir: function (dirname, callback) {
        if (this._type === 0) {
            //SignalR
            this._hub.invoke('readDir', dirname).done(function (jsonString) {
                var data;
                try {
                    data = JSON.parse(jsonString);
                } catch (e) {
                    servConn.logError('readDir: Invalid JSON string - ' + e);
                    data = null;
                }

                if (callback) {
                    callback (data);
                }
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('readdir', dirname, function (data) {
                if (callback) {
                    callback(data);
                }
            });
        } else if (this._type == 2) {
            if (dirname.indexOf('www/dashui/img') != -1) {
                // Load from img the list of files. To make it possible, call "dir /B /O > list.txt" in every img directory.
                jQuery.ajax({
                    url: dirname.replace('www/dashui/', '') + '/list.txt',
                    type: 'get',
                    async: false,
                    dataType: 'text',
                    cache: true,
                    success: function (data) {
                        var files = (data) ? data.split('\n') : [];
                        if (callback) {
                            callback(files);
                        }
                    },
                    error: function (state) {
                        // TODO Translate
                        alert('Cannot get ' + location.href + dirname.replace('www/dashui/', '') + '/list.txt' + '\n' + state.statusText);
                        callback([]);
                    }
                });
            }
        }
    },
    setPointValue: function (pointId, value) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }

        if (this._queueCmdIfRequired("setPointValue", pointId, value)) {
            return;
        }

        if (this._type === 0) {
            //SignalR
            this._hub.invoke('setDataPoint', {id: pointId, val: value});
        } else if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('setState', [pointId, value]);
        } else if (this._type == 2) {
            //local
            console.log('This is only demo. No point will be controlled.');
        }
    },
    getDataPoints: function (callback) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }
        if (this._queueCmdIfRequired("getDataPoints", callback)) {
            return;
        }

        if (this._type === 0) {
            //SignalR

            this._hub.invoke('getDataPoints').done(function (jsonString) {
                var data = {};
                if (jsonString === null) {
                    if (callback) {
                        callback('Authentication required');
                    }
                } else if (jsonString !== undefined) {
                    try {
                        data = (JSON && JSON.parse(jsonString)) || jQuery.parseJSON(jsonString);
                    } catch (e) {
                        servConn.logError('getDataPoints: Invalid JSON string - ' + e);
                        data = null;
                        if (callback) {
                            callback('getDataPoints: Invalid JSON string - ' + e);
                        }
                    }
                }
                // Convert array to mapped object {name1: object1, name2: object2}
                for (var i = 0, len = data.length; i < len; i++) {
                    if (data[i]) {
                        var obj  = data[i];
                        var dp   = obj.id;
                        var o;

                        data[dp] = obj;
                        if (localData.uiState['_' + dp + '.Value'] === undefined) {
                            o = {};
                            o['_' + dp] = {Value: data[dp].val, Timestamp: data[dp].ts, Certain: data[dp].ack, LastChange: data[dp].lc};
                            localData.uiState.attr(o);
                        } else {
                            o = {};
                            var id = ' ' + dp;//.replace(/\./g, '\\.');
                            o[id + '.Value']      = obj.val;
                            o[id + '.Timestamp']  = obj.ts;
                            o[id + '.Certain']    = obj.ack;
                            o[id + '.LastChange'] = obj.lc;
                        }
                    }
                }

                if (callback) {
                    callback();
                }
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('getDatapoints', function (data) {
                if (data === null) {
                    if (callback) {
                        callback('Authentication required');
                    }
                } else if (data !== undefined) {
                    for (var dp in data) {
                        var obj = data[dp];
                        var o = {};
                        var id = dp;//.replace(/\./g, '\\.');
                        if (localData.uiState['_' + dp/*.replace(/\./g, '\\.')*/ + '.Value'] === undefined) {
                            try {
                                o['_' + dp + '.Value'] = obj[0];
                                o['_' + dp + '.Timestamp'] = obj[1];
                                localData.uiState.attr(o);
                            } catch (e) {
                                servConn.logError('Error: can\'t create uiState object for ' + dp + '(' + e + ')');
                            }
                        } else {
                            o['_' + id + '.Value']      = obj[0];
                            o['_' + id + '.Timestamp']  = obj[1];
                            o['_' + id + '.Certain']    = obj[2];
                            o['_' + id + '.LastChange'] = obj[3];
                            console.log(o);
                            localData.uiState.attr(o);
                        }
                    }
                }
                if (callback) {
                    callback();
                }
            });
        } else if (this._type == 2) {
            // local
            // Load from ../datastore/local-data.json the demo views
            jQuery.ajax({
                url: '../datastore/local-data' + vis.viewFileSuffix + '.json',
                type: 'get',
                async: false,
                dataType: 'text',
                cache: vis.useCache,
                success: function (data) {
                    var _localData = (JSON && JSON.parse(data)) || jQuery.parseJSON(data);
                    localData.metaIndex   = _localData.metaIndex;
                    localData.metaObjects = _localData.metaObjects;
                    for (var dp in _localData.uiState) {
                        try {
                            // TODO possible problem with legacy
                            console.log(dp);
                            localData.uiState.attr(dp, _localData.uiState[dp]);
                        } catch (e) {
                            servConn.logError('Cannot export ' + dp);
                        }
                    }
                    callback(null);
                },
                error: function (state) {
                    console.log(state.statusText);
                    localData.uiState.attr('_no', {Value: false, Timestamp: null, Certain: true, LastChange: null});
                    // Local
                    if(callback) {
                        callback(null);
                    }
                }
            });

        }
    },
    getDataObjects: function (callback) {
        if (!this._isConnected) {
            console.log('No connection!');
            return;
        }

        if (this._queueCmdIfRequired("getDataObjects", callback)) {
            return;
        }

        if (this._type === 0) {
            //SignalR
            this._hub.invoke('getDataObjects').done(function (jsonString) {
                var data = {};
                try {
                    data = JSON.parse(jsonString);
                    // Convert array to mapped object {name1: object1, name2: object2}
                    for (var i = 0, len = data.length; i < len; i++) {
                        if (data[i]) {
                            data[data[i].id] = data[i];
                            delete data[data[i].id].id;
                        }
                    }
                } catch (e) {
                    servConn.logError('getDataObjects: Invalid JSON string - ' + e);
                    data = null;
                }

                if (callback) {
                    callback(data);
                }
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('getObjects', function (data) {
                if (callback) {
                    callback(data);
                }
            });
        } else if (this._type == 2) {
            if (callback) {
                callback(localData.metaObjects);
            }
        }
    },
    getDataIndex: function (callback) {
        if (!this._isConnected) {
            console.log('No connection!');
            return;
        }
        if (this._type === 0) {
            //SignalR
            if (callback) {
                callback([]);
            }
        } else if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('getIndex', function (data) {
                if (callback)
                    callback(data);
            });
        } else if (this._type == 2) {
            if (callback) {
                callback(localData.metaIndex);
            }
        }
    },
    addObject: function (objId, obj, callback) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }
        if (this._type === 0) {
            //SignalR
            this._hub.invoke('addObject', objId, obj).done(function (cid) {
                if (callback) {
                    callback(cid);
                }
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('setObject', objId, obj, function (cid) {
                if (callback) {
                    callback(cid);
                }
            });
        }
    },
    delObject: function (objId) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }
        if (this._type === 0) {
            //SignalR
            this._hub.invoke('deleteObject', objId);
        } else if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('delObject', objId);
        }
    }, // Deprecated
    // TODO @Bluefox: Why deprecated? Ursprüngliches Konzept war dass der Value eines Homematic-Programms true/false ist und angibt
    // ob ein Programm aktiv/inaktiv ist -> HM-Script Methode .Active()
    // Eigentlich wirft der Umbau den Du da vor geraumer Zeit in CCU.IO vorgenommen hast (damit über den Value ein Programm
    // angetriggert werden kann) dieses Konzept über den Haufen. Wirkt sich bei mir persönlich an der Stelle nicht aus
    // da ich keine Homematic-Programme verwende, aber ...
    // ... LessonsLearned: Wir müssen häufiger und mehr kommunizieren bevor wir solche Änderungen vornehmen :)
    execProgramm: function (objId) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }
        if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('programExecute', [objId]);
        }
    },
    httpGet: function (url, callback) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }
        if (this._type === 0) {
            //SignalR
            this._hub.invoke('httpGet', url).done(function (jsonString) {
                if (callback) {
                    callback(jsonString);
                }
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('httpGet', url, function (data) {
                if (callback) {
                    callback(data);
                }
            });
        } else if (this._type == 2) {
            if (callback) {
                callback('');
            }
        }
    },
    getStringtable: function (callback) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }
        if (this._type === 0) {
            //SignalR
            //this._hub.invoke('getUrl(url).done(function (jsonString) {
            if (callback) {
                callback(null);
            }
            //});
        } else if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('getStringtable', function (data) {
                if (callback) {
                    callback(data);
                }
            });
        } else if (this._type == 2) {
            if (callback) {
                callback(null);
            }
        }
    },
    alarmReceipt: function (alarm) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }
        //if (this._type === 0) {
            //SignalR
            //this._hub.invoke('getUrl(url).done(function (jsonString) {
            //});
        //} else
        if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('alarmReceipt', alarm);
        } else if (this._type == 2) {
            if (callback) {
                callback(null);
            }
        }
    },
    logError: function (errorText) {
        console.log("Error: " + errorText);
        if (!this._isConnected) {
            //console.log("No connection!");
            return;
        }
        //if (this._type === 0) {
            //SignalR
            //this._hub.server.log(errorText);
        //} else
        if (this._type == 1) {
            //socket.io
            if (this._socket === null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('log', 'error', 'Addon DashUI  ' + errorText);
        } else if (this._type == 2) {
            // Do nothing
        }
    },
    _queueCmdIfRequired: function (func, arg1, arg2, arg3, arg4) {
        if (!this._isAuthDone) {
            // Queue command
            this._cmdQueue.push({func: func, args:[arg1, arg2, arg3, arg4]});

            if (!this._authRunning) {
                this._authRunning = true;
                var that = this;
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
                            that[__cmdQueue[t].func](__cmdQueue[t].args[0], __cmdQueue[t].args[1], __cmdQueue[t].args[2], __cmdQueue[t].args[3]);
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

        //SignalR
        if (this._type === 0) {
            var that = this;
            this._hub.invoke('authenticate', that._authInfo.user, that._authInfo.hash, that._authInfo.salt).done(function (error) {
                this._authRunning = false;
                if (!error) {
                    that._isAuthDone  = true;
                    if (typeof session !== 'undefined') {
                        session.set("user", that._authInfo.user);
                        session.set("hash", that._authInfo.hash);
                        session.set("salt", that._authInfo.salt);
                    }

                    // Repeat all stored requests
                    var __cmdQueue = that._cmdQueue;
                    // Trigger garbage collector
                    that._cmdQueue = null;
                    that._cmdQueue = [];
                    for (var t = 0, len = __cmdQueue.length; t < len; t++) {
                        that[__cmdQueue[t].func](__cmdQueue[t].args[0], __cmdQueue[t].args[1], __cmdQueue[t].args[2], __cmdQueue[t].args[3]);
                    }
                } else {
                    // Another authRequest should come, wait for this
                    console.log("Cannot authenticate: " + error);
                    this._authInfo = null;
                }
            });
        }
    }
};
