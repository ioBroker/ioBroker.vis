/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var socketUrl;
var socketSession;
systemLang = 'en';

$.extend(systemDictionary, {
    'Ok':           {'en': 'Ok',                'de': 'Ok',                 'ru': 'Ok'},
    'Cancel':       {'en': 'Cancel',            'de': 'Abbrechen',          'ru': 'Отмена'},
    'Settings':     {'en': 'Settings',          'de': 'Einstellungen',      'ru': 'Настройки'},
    'Language':     {'en': 'Language',          'de': 'Language/Sprache',   'ru': 'Language/Язык'},
    'Socket':       {'en': 'ioBroker socket',   'de': 'ioBroker socket',    'ru': 'ioBroker сокет'},
    'System':       {'en': 'system',            'de': 'System',             'ru': 'системный'},
    'Reload':       {'en': 'Reload',            'de': 'Neuladen',           'ru': 'Обновить'},
    "Prevent from sleep": {
        "en": "Prevent from sleep",
        "de": "Nicht einschlaffen",
        "ru": "Не засыпать"
    }
});

var app = {
    settings: {
        socketUrl:  'http://localhost:8084',
        systemLang: navigator.language || navigator.userLanguage || 'en',
        noSleep:    false,
        project:    'main',
        resync:     false
    },
    loaded: false,
    projects: [],
    localDir: null,
    getLocalDir: function (dir, create, cb, index) {
        if (typeof create === 'function') {
            index  = cb;
            cb     = create;
            create = true;
        }

        if (!app.localDir) {
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dirHandler) {
                app.localDir = dirHandler;
                app.getLocalDir(dir, create, cb);
            });
            return;
        }
        index = index || 0;
        var parts = dir.split('/');

        app.localDir.getDirectory(parts[index], {
                create:    create,
                exclusive: false
            }, function (dirHandler) {
                if (parts.length - 1 == index) {
                    cb(null, dirHandler);
                } else {
                    app.getLocalDir(dir, create, cb, index + 1);
                }
            }, function (err) {
                cb(err);
        });
    },
    writeLocalFile: function (fileName, data, cb) {
        var parts = fileName.split('/');
        var fileN = parts.pop();
        this.getLocalDir(parts.join('/'), true, function (err, dirHandler) {
            if (err) console.error(err);
            if (dirHandler) {
                dirHandler.getFile(fileN, {create: true}, function (fileHandler) {
                    fileHandler.createWriter(function (fileWriter) {
                        fileWriter.truncate(0);
                        fileWriter.write(new Blob([data], {type:'text/plain'}));
                        cb();
                    }, function (error) {
                        cb(error);
                        console.error('Cannot write file: ' + error);
                    });
                }, function (error) {
                    cb(error);
                    console.error('Cannot create file')
                });
            }
        });
    },
    readLocalFile: function (fileName, cb) {
        var parts = fileName.split('/');
        var fileN = parts.pop();

        this.getLocalDir(parts.join('/'), false, function (err, dir) {
            if (err) console.error(err);
            if (dir) {
                dir.getFile(fileN, {create: false}, function (fileEntry) {
                    fileEntry.file(function(file) {
                        var reader = new FileReader();

                        reader.onloadend = function(e) {
                            cb(null, this.result, fileName);
                        };

                        reader.readAsText(file);
                    });
                }, function (error) {
                    cb(error, null, fileName);
                    console.error('Cannot read file: ' + error);
                });
            }
        });
    },
    loadSettings: function () {
        if (typeof(Storage) !== 'undefined') {
            var value = localStorage.getItem('cordova');
            if (value) {
                try {
                    value = JSON.parse(value);
                } catch (err) {
                    console.error('Cannot parse settings');
                    value = {};
                }
            } else {
                value = {};
            }
            this.settings = $.extend(this.settings, value);

            systemLang   = this.settings.systemLang || navigator.language || navigator.userLanguage;
            socketUrl = this.settings.socketUrl;
        }
    },
    saveSettings: function () {
        if (typeof(Storage) !== 'undefined') {
            localStorage.setItem('cordova', JSON.stringify(this.settings));
        }
    },
    // Application Constructor
    initialize: function() {
        if (this.settings.systemLang.indexOf('-') != -1) {
            this.settings.systemLang = this.settings.systemLang.split('-')[0];
            systemLang = this.settings.systemLang;
        }
        app.loadSettings();

        console.log(navigator.connection.type);

        if (window.plugins.insomnia) {
            if (this.settings.noSleep) {
                window.plugins.insomnia.keepAwake();
            } else {
                window.plugins.insomnia.allowSleepAgain();
            }
        }

        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        app.installMenu();
        app.readLocalFile(app.settings.project + '/vis-views.json', function (err, result) {
            if (err) console.error(err);
            if (!result || app.settings.resync) {
                app.syncVis(app.settings.project, function () {
                    app.settings.resync = false;
                    app.saveSettings();
                });
            }
            app.readProjects();
        });
    },
    readProjects: function (cb) {
        if (vis.conn.getIsConnected()) {
            app.projects = [];
            vis.conn.readDir('/vis.0', function (err, files) {
                var text = '';
                for (var f = 0; f < files.length; f++) {
                    if (files[f].isDir) {
                        text += '<option value="' + files[f].file + '" ' + (files[f].file == app.settings.project ? 'selected' : '') + '>' + files[f].file + '</option>';

                        app.projects.push(files[f].file);
                    }
                }
                $('#cordova_project').html(text);
                cb && cb();
            });
        } else {
            setTimeout(function () {
                this.readProjects(cb);
            }.bind(this), 1000);
        }
    },
    syncVis: function (dir, cb) {
        dir = dir || '';

        if (vis.conn.getIsConnected()) {
            vis.conn.readDir('/vis.0/' + dir, function (err, files) {
                if (files) {
                    var count = 0;
                    for (var f = 0; f < files.length; f++) {
                        if (files[f].isDir) {
                            count++;
                            app.syncVis(dir + '/' + files[f].file, function () {
                                if (!--count) {
                                    cb && cb();
                                }
                            });
                        } else {
                            vis.conn.readFile(dir + '/' + files[f].file, function (err, data, filename) {
                                if (err) console.error(err);
                                if (filename && filename.indexOf('views.json') != -1) {
                                    console.log(filename);
                                    var m = data.match(/"\/vis\.0\/.+"/g);
                                    if (m) {
                                        for (var mm = 0; mm < m.length; mm++) {
                                            //file:///data/data/net.iobroker.vis/files/main/vis-user.css
                                            //cdvfile://localhost/persistent
                                            data = data.replace(m[mm], '"file:///data/data/net.iobroker.vis/files' + m[mm].substring(7));
                                        }
                                    }

                                    m = data.match(/"\/vis\/.+"/g);
                                    if (m) {
                                        for (var mm = 0; mm < m.length; mm++) {
                                            data = data.replace(m[mm], '"' + m[mm].substring(6));
                                        }
                                    }
                                }
                                if (data) {
                                    app.writeLocalFile(filename.replace(/^\/vis\.0\//, ''), data, function (err) {
                                        if (err) console.error(err);
                                    });
                                }
                            }, true);
                        }
                    }
                    if (!count) {
                        cb && cb();
                    }
                } else {
                    cb && cb();
                }
            });
        } else {
            setTimeout(function () {
                this.syncVis(dir, cb);
            }.bind(this), 1000);
        }
    },
    installMenu: function () {
        // install menu button
        $('body').append('<div id="cordova_menu"   style="bottom: 0.5em; left: 0.5em; padding-left: 0.5em; padding-right: 0.5em; position: absolute; background: rgba(0,0,0,0.1); border-radius: 20px; z-index: 5001" id="cordova_menu">...</div>');
        $('body').append('<div id="cordova_dialog" style="background: #d3d3d3; top: 1em; left: 1em; bottom: 1em; right: 1em; position: absolute; border-radius: 0.3em; border: 1px solid grey; display: none; z-index: 5002">' +
            '<h1>' + _('Settings') + '</h1>' +
            '<table style="width: 100%; padding: 1em">' +
            '<tr><td>' + _('Language') + ':</td><td><select data-name="systemLang" class="cordova-setting" style="width: 100%">' +
            '<option value="">' + _('System') + '</option>' +
            '<option value="en">english</option>' +
            '<option value="de">deutsch</option>' +
            '<option value="ru">русский</option>' +
            '</select></td></tr>'+
            '<tr><td>' + _('Socket') + ':</td><td><input data-name="socketUrl"  class="cordova-setting" style="width: 100%"></td></tr>'+
            '<tr><td>' + _('Prevent from sleep') + ':</td><td><input type="checkbox" data-name="noSleep"  class="cordova-setting" style="width: 100%"></td></tr>'+
            '<tr><td>' + _('Project') + ':</td><td><select data-name="project" id="cordova_project" class="cordova-setting" style="width: 100%">' +
            '</select></td></tr>'+
            '</table>' +
            '<div style="position: absolute; bottom: 1em; right: 1em; display: inline-block">' +
            '<button id="cordova_reload">' + _('Reload') + '</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
            '<button id="cordova_ok">' + _('Ok') + '</button>&nbsp;' +
            '<button id="cordova_cancel">' + _('Cancel') + '</button></div>' +
            '</div>');

        $('#cordova_menu').click(function () {
            // load settings
            $('#cordova_dialog .cordova-setting').each(function() {
                if ($(this).attr('type') === 'checkbox') {
                    $(this).prop('checked', app.settings[$(this).data('name')]);
                } else {
                    $(this).val(app.settings[$(this).data('name')]);
                }
            });

            $('#cordova_dialog').show();
        });
        $('#cordova_cancel').click(function () {
            $('#cordova_dialog').hide();
        }).css({height: '2em'});

        $('#cordova_reload').click(function () {
            $('#cordova_dialog').hide();
            app.settings.resync = true;
            app.saveSettings();
            window.location.reload();
        }).css({height: '2em'});

        $('#cordova_ok').click(function () {
            $('#cordova_dialog').hide();
            var changed = false;

            // save settings
            $('#cordova_dialog .cordova-setting').each(function() {
                if ($(this).attr('type') === 'checkbox') {
                    if (app.settings[$(this).data('name')] != $(this).prop('checked')) {
                        app.settings[$(this).data('name')] = $(this).prop('checked');
                        changed = true;
                    }
                } else {
                    if (app.settings[$(this).data('name')] != $(this).val()) {
                        app.settings[$(this).data('name')] = $(this).val();
                        changed = true;
                    }
                }
            });

            if (changed) {
                app.saveSettings();
                window.location.reload();
            }
        }).css({height: '2em'});
    },
    receivedEvent: function(event) {
        console.log('Received Event: ' + event);

    }
};

app.initialize();