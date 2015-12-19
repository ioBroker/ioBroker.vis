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
    'Reload':       {'en': 'Reload',            'de': 'Neuladen',           'ru': 'Обновить'}
});

var app = {
    settings: {
        socketUrl:  'http://localhost:8084',
        systemLang: navigator.language || navigator.userLanguage || 'en',
        noSleep:    false
    },
    checkLocalFiles: function () {
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
            console.log("got main dir", dir);
            dir.getFile("main/index.html", {create: true}, function (file) {
                console.log("got the file", file);
                var logOb = file;

                logOb.createWriter(function (fileWriter) {
                    fileWriter.seek(fileWriter.length);

                    var blob = new Blob(['text'], {type:'text/plain'});
                    fileWriter.write(blob);
                    console.log("ok, in theory i worked");
                }, function (error) {
                    console.error(error);
                });
            });
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
        this.httpd = this.httpd || ((cordova && cordova.plugins && cordova.plugins.CorHttpd ) ? cordova.plugins.CorHttpd : null);

        console.log(navigator.connection.type);

        if (window.plugins.insomnia) {
            if (this.settings.noSleep) {
                window.plugins.insomnia.keepAwake();
            } else {
                window.plugins.insomnia.allowSleepAgain();
            }
        }

        //this.checkLocalFiles();

        this.loadSettings();
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
        app.syncVis()
    },
    syncVis: function (dir) {
        dir = dir || 'vis.0';

        if (vis.conn.getIsConnected()) {
            vis.conn.readDir(dir, function(err, files) {
                console.log(files);
            });
        } else {
            setTimeout(function () {
                this.syncVis();
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