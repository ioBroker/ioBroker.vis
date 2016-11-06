/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2013-2016 bluefox https://github.com/GermanBluefox, hobbyquaker https://github.com/hobbyquaker
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 */
/* jshint browser:true */
/* global document */
/* global console */
/* global session */
/* global window */
/* global location */
/* global setTimeout */
/* global clearTimeout */
/* global io */
/* global visConfig */
/* global systemLang:true */
/* global _ */
/* global can */
/* global storage */
/* global servConn */
/* global systemDictionary */
/* global $ */
/* global translateAll */
/* global jQuery */
/* global document */
/* jshint -W097 */// jshint strict:false
'use strict';

if (typeof systemDictionary !== 'undefined') {
    $.extend(systemDictionary, {
        'No connection to Server':  {'en': 'No connection to Server',   'de': 'Keine Verbindung zu Server', 'ru': 'Нет соединения с сервером'},
        'Loading Views...':         {'en': 'Loading Views...',          'de': 'Lade Views...',          'ru': 'Загрузка пользовательских страниц...'},
        'Connecting to Server...':  {'en': 'Connecting to Server...',   'de': 'Verbinde mit Server...', 'ru': 'Соединение с сервером...'},
        'Loading data objects...':  {'en': 'Loading data...',           'de': 'Lade Daten...',          'ru': 'Загрузка данных...'},
        'Loading data values...':   {'en': 'Loading values...',         'de': 'Lade Werte...',          'ru': 'Загрузка значений...'},
        'error - View doesn\'t exist': {'en': 'View doesn\'t exist!',   'de': 'View existiert nicht!',  'ru': 'Страница не существует!'},
        'no views found!':          {'en': 'No views found!',           'de': 'Keine Views gefunden!',  'ru': 'Не найдено страниц!'},
        'No Views found on Server': {
            'en': 'No Views found on Server',
            'de': 'Keine Views gefunden am Server.',
            'ru': 'На сервере не найдено никаких страниц.'
        },
        'All changes are saved locally. To reset changes clear the cache.': {
            'en': 'All changes are saved locally. To reset changes clear the browser cache.',
            'de': 'Alle Änderungen sind lokal gespeichert. Um Änderungen zu löschen, lösche Browsercache.',
            'ru': 'Все изменения сохранены локально. Для отмены локальных изменений очистите кеш броузера.'
        },
        'please use /vis/edit.html instead of /vis/?edit': {
            'en': 'Please use /vis/edit.html instead of /vis/?edit',
            'de': 'Bitte geben Sie /vis/edit.html statt /vis/?edit',
            'ru': 'Используйте /vis/edit.html вместо /vis/?edit'
        },
        'no views found on server.\nCreate new %s ?': {
            'en': 'no views found on server.\nCreate new %s?',
            'de': 'Keine Views gefunden am Server.\nErzeugen %s?',
            'ru': 'На сервере не найдено никаких страниц. Создать %s?'
        },
        'Update found, loading new Files...': {
            'en': 'Update found.<br/>Loading new Files...',
            'de': 'Neue Version gefunden.<br/>Lade neue Dateien...',
            'ru': 'Обнаружено Обновление.<br/>Загружаю новые файлы...'
        },
        'Loading Widget-Sets...': {
            'en': 'Loading Widget-Sets...',
            'de': 'Lade Widget-Sätze...',
            'ru': 'Загрузка наборов элементов...'
        },
        'error: view not found.': {
            'en': 'Error: view not found',
            'de': 'Fehler: View ist nicht gefunden',
            'ru': 'Ошибка: Страница не существует'
        },
        'error: view container recursion.': {
            'en': 'Error: view container recursion',
            'de': 'Fehler: View ist rekursiv',
            'ru': 'Ошибка: Страница вызывет саму себя'
        },
        "Cannot execute %s for %s, because of insufficient permissions": {
            "en": "Cannot execute %s for %s, because of insufficient permissions.",
            "de": "Kann das Kommando \"%s\" für %s nicht ausführen, weil nicht genügend Zugriffsrechte vorhanden.",
            "ru": "Не могу выполнить \"%s\" для %s, так как недостаточно прав."
        },
        "Insufficient permissions": {
            "en": "Insufficient permissions",
            "de": "Nicht genügend Zugriffsrechte",
            "ru": "Недостаточно прав"
        },
        "View disabled for user %s": {
            "en": "View disabled for user <b>%s</b>",
            "de": "View ist für Anwender <b>%s</b> deaktiviert",
            "ru": "Страница недоступна для пользователя <b>%s</b>"
        }
    });
}

if (typeof systemLang !== 'undefined' && typeof cordova === 'undefined') {
    systemLang = visConfig.language || systemLang;
}

var vis = {
    version: '0.10.15',
    requiredServerVersion:  '0.0.0',

    storageKeyViews:        'visViews',
    storageKeySettings:     'visSettings',
    storageKeyInstance:     'visInstance',

    instance:               null,
    urlParams:              {},
    settings:               {},
    views:                  null,
    widgets:                {},
    activeView:             '',
    widgetSets:             visConfig.widgetSets,
    initialized:            false,
    toLoadSetsCount:        0, // Count of widget sets that should be loaded
    isFirstTime:            true,
    useCache:               false,
    authRunning:            false,
    cssChecked:             false,
    isTouch:                'ontouchstart' in document.documentElement,
    binds:                  {},
    onChangeCallbacks:      [],
    viewsActiveFilter:      {},
    projectPrefix:          window.location.search ? window.location.search.slice(1) + '/' : 'main/',
    navChangeCallbacks:     [],
    editMode:               false,
    language:               (typeof systemLang !== 'undefined') ? systemLang : visConfig.language,
    statesDebounce:         {},
    visibility:             {},
    signals:                {},
    bindings:               {},
    bindingsCache:          {},
    commonStyle:            null,
    _setValue: function (id, state, isJustCreated) {
        var that = this;
        var oldValue = this.states.attr(id + '.val');
        this.conn.setState(id, state[id + '.val'], function (err) {
            if (err) {
                //state[id + '.val'] = oldValue;
                that.showMessage(_('Cannot execute %s for %s, because of insufficient permissions', 'setState', id), _('Insufficient permissions'), 'alert', 600);
            }

            if (that.states.attr(id) || that.states.attr(id + '.val') !== undefined) {
                that.states.attr(state);

                // If error set value back, but we need generate the edge
                if (err) {
                    if (isJustCreated) {
                        that.states.removeAttr(id + '.val');
                        that.states.removeAttr(id + '.q');
                        that.states.removeAttr(id + '.from');
                        that.states.removeAttr(id + '.ts');
                        that.states.removeAttr(id + '.lc');
                        that.states.removeAttr(id + '.ack');
                    } else {
                        state[id + '.val'] = oldValue;
                        that.states.attr(state);
                    }
                }

                // Inform other widgets, that does not support canJS
                for (var i = 0, len = that.onChangeCallbacks.length; i < len; i++) {
                    that.onChangeCallbacks[i].callback(that.onChangeCallbacks[i].arg, id, state);
                }
            }
        });
    },
    setValue: function (id, val) {
        if (!id) {
            console.log('ID is null for val=' + val);
            return;
        }

        var d = new Date();
        var t = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + " " + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
        var o = {};
        var created = false;
        if (this.states.attr(id + '.val') != val) {
            o[id + '.lc'] = t;
        } else {
            o[id + '.lc'] = this.states.attr(id + '.lc');
        }
        o[id + '.val'] = val;
        o[id + '.ts']  = t;
        o[id + '.ack'] = false;

        // Create this value
        if (this.states.attr(id + '.val') === undefined) {
            created = true;
            this.states.attr(o);
        }

        var that = this;

        // if no de-bounce running
        if (!this.statesDebounce[id]) {
            // send control command
            this._setValue(id, o, created);
            // Start timeout
            this.statesDebounce[id] = {
                timeout: _setTimeout(function () {
                    if (that.statesDebounce[id]) {
                        if (that.statesDebounce[id].state) that._setValue(id, that.statesDebounce[id].state);
                        delete that.statesDebounce[id];
                    }
                }, 1000, id),
                state: null
            };
        } else {
            // If some de-bounce running, change last value
            this.statesDebounce[id].state = o;
        }
    },
    loadWidgetSet: function (name, callback) {
        var url = './widgets/' + name + '.html?visVersion=' + this.version;
        var that = this;
        $.ajax({
            url:      url,
            type:     'GET',
            dataType: 'html',
            cache:    this.useCache,
            success:  function (data) {
                setTimeout(function () {
                    try {
                        $('head').append(data);
                    } catch (e) {
                        console.error('Cannot load widget set "' + name + '": ' + e);
                    }
                    that.toLoadSetsCount -= 1;
                    if (that.toLoadSetsCount <= 0) {
                        that.showWaitScreen(true, null, null, 100);
                        setTimeout(function () {
                            callback.call(that);
                        }, 100);
                    } else {
                        that.showWaitScreen(true, null, null, parseInt((100 - that.waitScreenVal) / that.toLoadSetsCount, 10));
                    }
                }, 0);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                that.conn.logError('Cannot load widget set ' + name + ' ' + errorThrown);
            }
        });
    },
    // Return as array used widgetSets or null if no information about it
    getUsedWidgetSets: function () {
        var widgetSets = [];

        if (!this.views) {
            console.log('Check why views are not yet loaded!');
            return null;
        }

        // Convert visConfig.widgetSets to object for easier dependency search
        var widgetSetsObj = {};
        for (var i = 0; i < visConfig.widgetSets.length; i++) {
            if (typeof visConfig.widgetSets[i] === 'object') {
                if (!visConfig.widgetSets[i].depends) {
                    visConfig.widgetSets[i].depends = [];
                }
                widgetSetsObj[visConfig.widgetSets[i].name] = visConfig.widgetSets[i];

            } else {
                widgetSetsObj[visConfig.widgetSets[i]] = {depends: []};
            }
        }

        for (var view in this.views) {
            if (view === '___settings') continue;
            for (var id in this.views[view].widgets) {
                if (!this.views[view].widgets[id].widgetSet) {

                    // Views are not yet converted and have no widgetSet information)
                    return null;

                } else if (widgetSets.indexOf(this.views[view].widgets[id].widgetSet) === -1) {

                    var wset = this.views[view].widgets[id].widgetSet;
                    widgetSets.push(wset);

                    // Add dependencies
                    if (widgetSetsObj[wset]) {
                        for (var u = 0, ulen = widgetSetsObj[wset].depends.length; u < ulen; u++) {
                            if (widgetSets.indexOf(widgetSetsObj[wset].depends[u]) === -1) {
                                widgetSets.push(widgetSetsObj[wset].depends[u]);
                            }
                        }
                    }
                }
            }
        }
        return widgetSets;
    },
    // Return as array used widgetSets or null if no information about it
    getUsedObjectIDs: function () {
        var widgetSets = [];

        if (!this.views) {
            console.log('Check why views are not yet loaded!');
            return null;
        }

        var IDs         = [];
        this.visibility = {};
        this.bindings   = {};

        for (var view in this.views) {
            if (view === '___settings') continue;
            for (var id in this.views[view].widgets) {
                // Check all attributes
                var data  = this.views[view].widgets[id].data;
                var style = this.views[view].widgets[id].style;
                // rename hqWidgets => hqwidgets
                if (this.views[view].widgets[id].widgetSet === 'hqWidgets') {
                    this.views[view].widgets[id].widgetSet = 'hqwidgets';
                }

                // rename RGraph => rgraph
                if (this.views[view].widgets[id].widgetSet === 'RGraph') {
                    this.views[view].widgets[id].widgetSet = 'rgraph';
                }

                // rename timeAndWeather => timeandweather
                if (this.views[view].widgets[id].widgetSet === 'timeAndWeather') {
                    this.views[view].widgets[id].widgetSet = 'timeandweather';
                }

                // convert "Show on Value" to HTML
                if (this.views[view].widgets[id].tpl === 'tplShowValue') {
                    this.views[view].widgets[id].tpl = 'tplHtml';
                    this.views[view].widgets[id].data['visibility-oid'] = this.views[view].widgets[id].data.oid;
                    this.views[view].widgets[id].data['visibility-val'] = this.views[view].widgets[id].data.value;
                    delete this.views[view].widgets[id].data.oid;
                    delete this.views[view].widgets[id].data.value;
                }

                // convert "Hide on >0/True" to HTML
                if (this.views[view].widgets[id].tpl === 'tplHideTrue') {
                    this.views[view].widgets[id].tpl = 'tplHtml';
                    this.views[view].widgets[id].data['visibility-cond'] = '!=';
                    this.views[view].widgets[id].data['visibility-oid'] = this.views[view].widgets[id].data.oid;
                    this.views[view].widgets[id].data['visibility-val'] = true;
                    delete this.views[view].widgets[id].data.oid;
                }

                // convert "Hide on 0/False" to HTML
                if (this.views[view].widgets[id].tpl === 'tplHide') {
                    this.views[view].widgets[id].tpl = 'tplHtml';
                    this.views[view].widgets[id].data['visibility-cond'] = '!=';
                    this.views[view].widgets[id].data['visibility-oid'] = this.views[view].widgets[id].data.oid;
                    this.views[view].widgets[id].data['visibility-val'] = false;
                    delete this.views[view].widgets[id].data.oid;
                }

                // convert "Door/Window sensor" to HTML
                if (this.views[view].widgets[id].tpl === 'tplHmWindow') {
                    this.views[view].widgets[id].tpl = 'tplValueBool';
                    this.views[view].widgets[id].data.html_false = this.views[view].widgets[id].data.html_closed;
                    this.views[view].widgets[id].data.html_true  = this.views[view].widgets[id].data.html_open;
                    delete this.views[view].widgets[id].data.html_closed;
                    delete this.views[view].widgets[id].data.html_open;
                }

                // convert "Door/Window sensor" to HTML
                if (this.views[view].widgets[id].tpl === 'tplHmWindowRotary') {
                    this.views[view].widgets[id].tpl = 'tplValueListHtml8';
                    this.views[view].widgets[id].data.count = 2;
                    this.views[view].widgets[id].data.value0 = this.views[view].widgets[id].data.html_closed;
                    this.views[view].widgets[id].data.value1 = this.views[view].widgets[id].data.html_open;
                    this.views[view].widgets[id].data.value2 = this.views[view].widgets[id].data.html_tilt;
                    delete this.views[view].widgets[id].data.html_closed;
                    delete this.views[view].widgets[id].data.html_open;
                    delete this.views[view].widgets[id].data.html_tilt;
                }

                // convert "tplBulbOnOff" to tplBulbOnOffCtrl
                if (this.views[view].widgets[id].tpl === 'tplBulbOnOff') {
                    this.views[view].widgets[id].tpl = 'tplBulbOnOffCtrl';
                    this.views[view].widgets[id].data.readOnly = true;
                }

                // convert "tplValueFloatBarVertical" to tplValueFloatBar
                if (this.views[view].widgets[id].tpl === 'tplValueFloatBarVertical') {
                    this.views[view].widgets[id].tpl = 'tplValueFloatBar';
                    this.views[view].widgets[id].data.orientation = 'vertical';
                }

                for (var attr in data) {
                    /* TODO DO do not forget remove it after a while. Required for import from DashUI */
                    if (attr === 'state_id') {
                        data.state_oid = data[attr];
                        delete data[attr];
                        attr = 'state_oid';
                    } else
                    if (attr === 'number_id') {
                        data.number_oid = data[attr];
                        delete data[attr];
                        attr = 'number_oid';
                    } else
                    if (attr === 'toggle_id') {
                        data.toggle_oid = data[attr];
                        delete data[attr];
                        attr = 'toggle_oid';
                    } else
                    if (attr === 'set_id') {
                        data.set_oid = data[attr];
                        delete data[attr];
                        attr = 'set_oid';
                    } else
                    if (attr === 'temp_id') {
                        data.temp_oid = data[attr];
                        delete data[attr];
                        attr = 'temp_oid';
                    } else
                    if (attr === 'drive_id') {
                        data.drive_oid = data[attr];
                        delete data[attr];
                        attr = 'drive_oid';
                    } else
                    if (attr === 'content_id') {
                        data.content_oid = data[attr];
                        delete data[attr];
                        attr = 'content_oid';
                    } else
                    if (attr === 'dialog_id') {
                        data.dialog_oid = data[attr];
                        delete data[attr];
                        attr = 'dialog_oid';
                    } else
                    if (attr === 'max_value_id') {
                        data.max_value_oid = data[attr];
                        delete data[attr];
                        attr = 'max_value_oid';
                    } else
                    if (attr === 'dialog_id') {
                        data.dialog_oid = data[attr];
                        delete data[attr];
                        attr = 'dialog_oid';
                    } else
                    if (attr === 'weoid') {
                        data.woeid = data[attr];
                        delete data[attr];
                        attr = 'woeid';
                    }

                    if (typeof data[attr] === 'string') {
                        var oids = this.extractBinding(data[attr]);
                        if (oids) {
                            for (var t = 0; t < oids.length; t++) {
                                if (oids[t].systemOid) {
                                    if (IDs.indexOf(oids[t].systemOid) === -1) IDs.push(oids[t].systemOid);
                                    if (!this.bindings[oids[t].systemOid]) this.bindings[oids[t].systemOid] = [];
                                    oids[t].type   = 'data';
                                    oids[t].attr   = attr;
                                    oids[t].view   = view;
                                    oids[t].widget = id;

                                    this.bindings[oids[t].systemOid].push(oids[t]);
                                }


                                if (oids[t].operations && oids[t].operations[0].arg instanceof Array) {
                                    for (var w = 0; w < oids[t].operations[0].arg.length; w++) {
                                        if (IDs.indexOf(oids[t].operations[0].arg[w].systemOid) === -1) IDs.push(oids[t].operations[0].arg[w].systemOid);
                                        if (!this.bindings[oids[t].operations[0].arg[w].systemOid]) this.bindings[oids[t].operations[0].arg[w].systemOid] = [];
                                        this.bindings[oids[t].operations[0].arg[w].systemOid].push(oids[t]);
                                    }
                                }
                            }
                        } else if (attr !== 'oidTrueValue' && attr !== 'oidFalseValue' && ((attr.match(/oid\d{0,2}$/) || attr.match(/^oid/) || attr.match(/^signals-oid-/)) && data[attr])) {
                            if (data[attr] !== 'nothing_selected' && IDs.indexOf(data[attr]) === -1) IDs.push(data[attr]);

                            // Visibility binding
                            if (attr === 'visibility-oid' && data['visibility-oid']) {
                                var oid = data['visibility-oid'];
                                if (!this.visibility[oid]) this.visibility[oid] = [];
                                this.visibility[oid].push({view: view, widget: id});
                            }

                            // Signal binding
                            if (attr.match(/^signals-oid-/) && data[attr]) {
                                var oid = data[attr];
                                if (!this.signals[oid]) this.signals[oid] = [];
                                this.signals[oid].push({view: view, widget: id, index: parseInt(attr.substring('signals-oid-'.length), 10)});
                            }
                        }
                    }
                }

                // build bindings for styles
                if (style) {
                    for (var css in style) {
                        if (typeof style[css] === 'string') {
                            var oids = this.extractBinding(style[css]);
                            if (oids) {
                                for (var t = 0; t < oids.length; t++) {
                                    if (IDs.indexOf(oids[t].systemOid) === -1) IDs.push(oids[t].systemOid);
                                    if (!this.bindings[oids[t].systemOid]) this.bindings[oids[t].systemOid] = [];

                                    oids[t].type   = 'style';
                                    oids[t].attr   = css;
                                    oids[t].view   = view;
                                    oids[t].widget = id;

                                    this.bindings[oids[t].systemOid].push(oids[t]);
                                    if (oids[t].operations && oids[t].operations[0].arg instanceof Array) {
                                        for (var w = 0; w < oids[t].operations[0].arg.length; w++) {
                                            if (IDs.indexOf(oids[t].operations[0].arg[w].systemOid) === -1) IDs.push(oids[t].operations[0].arg[w].systemOid);
                                            if (!this.bindings[oids[t].operations[0].arg[w].systemOid]) this.bindings[oids[t].operations[0].arg[w].systemOid] = [];
                                            this.bindings[oids[t].operations[0].arg[w].systemOid].push(oids[t]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return IDs;
    },
    loadWidgetSets: function (callback) {
        this.showWaitScreen(true, '<br>' + _('Loading Widget-Sets...') + ' <span id="widgetset_counter"></span>', null, 20);
        var arrSets = [];

        // If widgets are preloaded
        if (this.binds && this.binds.stateful !== undefined) {
            this.toLoadSetsCount = 0;
        } else {
            // Get list of used widget sets. if Edit mode list is null.
            var widgetSets = this.editMode ? null : this.getUsedWidgetSets();

            // First calculate how many sets to load
            for (var i = 0; i < this.widgetSets.length; i++) {
                var name = this.widgetSets[i].name || this.widgetSets[i];

                // Skip unused widget sets in non-edit mode
                if (!this.widgetSets[i].always) {
                    if (this.widgetSets[i].widgetSets && widgetSets.indexOf(name) === -1) {
                        continue;
                    }
                } else {
                    if (widgetSets && widgetSets.indexOf(name) === -1) widgetSets.push(name);
                }

                arrSets[arrSets.length] = name;

                if (this.editMode && this.widgetSets[i].edit) {
                    arrSets[arrSets.length] = this.widgetSets[i].edit;
                }
            }
            this.toLoadSetsCount = arrSets.length;
            $("#widgetset_counter").html("<span style='font-size:10px'>(" + (this.toLoadSetsCount) + ")</span>");
        }

        var that = this;
        if (this.toLoadSetsCount) {
            for (var j = 0, len = this.toLoadSetsCount; j < len; j++) {
                _setTimeout(function (_i) {
                    that.loadWidgetSet(arrSets[_i], callback);
                }, 100, j);
            }
        } else {
            if (callback) callback.call(this);
        }
    },
    bindInstance: function () {
        if (typeof app !== 'undefined' && app.settings) {
            this.instance = app.settings.instance;
        }
        if (typeof storage !== 'undefined') this.instance = this.instance || storage.get(this.storageKeyInstance);
        if (this.editMode) this.bindInstanceEdit();
    },
    init: function () {
        if (this.initialized) return;

        if (typeof storage !== 'undefined') {
            var settings = storage.get(this.storageKeySettings);
            if (settings) {
                this.settings = $.extend(this.settings, settings);
            }
        }

        // Late initialization (used only for debug)
        /*if (this.binds.hqWidgetsExt) {
         this.binds.hqWidgetsExt.hqInit();
         }*/

        //this.loadRemote(this.loadWidgetSets, this.initNext);
        this.loadWidgetSets(this.initNext);
    },
    initNext: function () {
        this.showWaitScreen(false);
        var that = this;
        // First start.
        if (!this.views) {
            this.initViewObject();
        } else {
            this.showWaitScreen(false);
        }

        var hash = window.location.hash.substring(1);

        // create demo states
        if (this.views && this.views.DemoView) this.createDemoStates();

        if (!this.views || (!this.views[hash] && typeof app !== 'undefined')) hash = null;

        // View selected?
        if (!hash) {
            // Take first view in the list
            this.activeView = this.findNearestResolution(true);

            // Create default view in demo mode
            if (typeof io === 'undefined') {
                if (!this.activeView) {
                    if (!this.editMode) {
                        window.alert(_('error - View doesn\'t exist'));
                        if (typeof app === 'undefined') {
                            // try to find first view
                            window.location.href = 'edit.html?' + this.projectPrefix.substring(0, this.projectPrefix.length - 1);
                        }
                    } else {
                        this.views.DemoView = this.createDemoView ? this.createDemoView() : {settings: {style: {}}, widgets: {}};
                        this.activeView = 'DemoView';
                        //vis.showWaitScreen(false);
                    }
                }
            } else if (!this.activeView) {
                if (!this.editMode) {
                    if (typeof app === 'undefined') {
                        window.alert(_('error - View doesn\'t exist'));
                        window.location.href = 'edit.html?' + this.projectPrefix.substring(0, this.projectPrefix.length - 1);
                    }
                } else {
                    // All views were deleted, but file exists. Create demo View
                    //window.alert("unexpected error - this should not happen :(");
                    //$.error("this should not happen :(");
                    // create demoView
                    this.views.DemoView = this.createDemoView ? this.createDemoView() : {settings: {style: {}}, widgets: {}};
                    this.activeView = 'DemoView';
                }
            }
        } else {
            if (this.views[hash]) {
                this.activeView = hash;
            } else {
                window.alert(_("error - View doesn't exist"));
                if (typeof app === 'undefined') window.location.href = 'edit.html?' + this.projectPrefix.substring(0, this.projectPrefix.length - 1);
                $.error("vis Error can't find view");
            }
        }

        if (this.views && this.views.___settings) {
            if (this.views.___settings.reloadOnSleep !== undefined) this.conn.setReloadTimeout(this.views.___settings.reloadOnSleep);
            if (this.views.___settings.darkReloadScreen) {
                $('#server-disconnect').removeClass('disconnect-light').addClass('disconnect-dark');
            }
            if (this.views.___settings.reconnectInterval !== undefined) this.conn.setReconnectInterval(this.views.___settings.reconnectInterval);
            if (this.views.___settings.destroyViewsAfter !== undefined) this.views.___settings.destroyViewsAfter = parseInt(this.views.___settings.destroyViewsAfter, 10);
        }

        // Navigation
        $(window).bind('hashchange', function (e) {
            that.changeView(window.location.hash.slice(1));
        });

        this.bindInstance();

        // EDIT mode
        if (this.editMode) this.editInitNext();

        this.initialized = true;

        // If this function called earlier, it makes problems under FireFox.
        // render all views, that should be always rendered
        if (this.views && !this.editMode) {
            for (var view in this.views) {
                if (view === '___settings') continue;
                if (this.views[view].settings.alwaysRender) {
                    this.renderView(view, false, true);
                }
            }
        }

        if (this.activeView) this.changeView(this.activeView);
    },
    initViewObject: function () {
        if (!this.editMode) {
            if (typeof app !== 'undefined') {
                this.showMessage(_('no views found!'));
            } else {
                window.location.href = 'edit.html?' + this.projectPrefix.substring(0, this.projectPrefix.length - 1);
            }
        } else {
            if (window.confirm(_('no views found on server.\nCreate new %s ?', this.projectPrefix + 'vis-views.json'))) {
                this.views = {};
                this.views.DemoView = this.createDemoView ? this.createDemoView() : {settings: {style: {}}, widgets: {}};
                if (this.saveRemote) {
                    this.saveRemote(true, function () {
                        //window.location.reload();
                    });
                }
            } else {
                window.location.reload();
            }
        }
    },
    setViewSize: function (view) {
        var $view = $('#visview_' + view);
        // Because of background, set the width and height of the view
        var width = parseInt(this.views[view].settings.sizex, 10);
        var height = parseInt(this.views[view].settings.sizey, 10);
        var $vis_container = $('#vis_container');
        if (!width || width < $vis_container.width()) {
            width = '100%';
        }
        if (!height || height < $vis_container.height()) {
            height = '100%';
        }
        $view.css({width: width});
        $view.css({height: height});
    },
    updateContainers: function (view) {
        var that = this;
        // Set ths views for containers
        $('#visview_' + view).find('.vis-view-container').each(function () {
            var cview = $(this).attr('data-vis-contains');
            if (!that.views[cview]) {
                $(this).html('<span style="color: red">' + _('error: view not found.') + '</span>');
            } else if (cview === view) {
                $(this).html('<span style="color: red">' + _('error: view container recursion.') + '</span>');
            } else {
                $(this).html('');
                that.renderView(cview, true);
                $('#visview_' + cview)
                    .appendTo(this)
                    .show();
            }
        });
    },
    renderView: function (view, noThemeChange, hidden) {
        var that = this;

        if (!this.editMode && !$('#commonTheme').length) {
            $('head').prepend('<link rel="stylesheet" type="text/css" href="' + ((typeof app === 'undefined') ? '../../' : '') + 'lib/css/themes/jquery-ui/' + (this.calcCommonStyle() || 'redmond') + '/jquery-ui.min.css" id="commonTheme"/>');
        }

        if (!this.views[view] || !this.views[view].settings) {
            window.alert('Cannot render view ' + view + '. Invalid settings');
            return false;
        }

        var isViewsConverted = false; // Widgets in the views hav no information which WidgetSet they use, this info must be added and this flag says if that happens to store the views

        this.views[view].settings.theme = this.views[view].settings.theme || 'redmond';

        if (this.views[view].settings.filterkey) {
            this.viewsActiveFilter[view] = this.views[view].settings.filterkey.split(',');
        } else {
            this.viewsActiveFilter[view] = [];
        }
        //noinspection JSJQueryEfficiency
        var $view = $('#visview_' + view);
        // apply group policies
        if (!this.editMode && this.views[view].settings.group && this.views[view].settings.group.length) {
            if (this.views[view].settings.group_action === 'hide') {
                if (!this.isUserMemeberOf(this.conn.getUser(), this.views[view].settings.group)) {
                    if (!$view.length) {
                        $('#vis_container').append('<div id="visview_' + view + '" class="vis-view vis-user-disabled"></div>');
                        $view = $('#visview_' + view);
                    }
                    $view.html('<div class="vis-view-disabled-text">' + _('View disabled for user %s', this.conn.getUser()) + '</div>');
                    return;
                }
            }
        }

        if (!$view.length) {

            $('#vis_container').append('<div style="display: none;" id="visview_' + view + '" class="vis-view"></div>');
            this.addViewStyle(view, this.views[view].settings.theme);

            $view = $('#visview_' + view);

            $view.css(this.views[view].settings.style);
            if (this.views[view].settings.style.background_class) $view.addClass(this.views[view].settings.style.background_class);

            this.setViewSize(view);
            this.views[view].rerender = true;

            // Render all simple widgets
            for (var id in this.views[view].widgets) {
                // Try to complete the widgetSet information to optimize the loading of widgetSets
                if (!this.views[view].widgets[id].widgetSet) {
                    var obj = $('#' + this.views[view].widgets[id].tpl);
                    if (obj) {
                        this.views[view].widgets[id].widgetSet = obj.attr("data-vis-set");
                        isViewsConverted = true;
                    }
                }

                if (!this.views[view].widgets[id].renderVisible) this.renderWidget(view, id);
            }

            if (this.editMode) {
                if (this.binds.jqueryui) this.binds.jqueryui._disable();
                this.droppable(view);
            }
        }

        // move views in container
        $view.find('div[id$="container"]').each(function () {
            var cview = $(this).attr('data-vis-contains');
            if (!that.views[cview]) {
                $(this).append('error: view not found.');
                return false;
            } else if (cview === view) {
                $(this).append('error: view container recursion.');
                return false;
            }
            that.renderView(cview, true);
            $('#visview_' + cview)
                .appendTo(this)
                .show();
        });

        if (!hidden) {
            $view.show();

            if (this.views[view].rerender) {
                this.views[view].rerender = false;
                // render all copmlex widgets, like hqWidgets or bars
                for (var _id in this.views[view].widgets) {
                    if (this.views[view].widgets[_id].renderVisible) this.renderWidget(view, _id);
                }
            }
        }

        // Store modified view
        if (isViewsConverted && this.saveRemote) this.saveRemote();

        if (this.editMode && $('#wid_all_lock_function').prop('checked')) {
            $('.vis-widget').addClass('vis-widget-lock');
        }

        setTimeout(function(){
            $('#visview_' + view).trigger('rendered');
        }, 0);

        // apply group policies
        if (!this.editMode && this.views[view].settings.group && this.views[view].settings.group.length) {
            if (this.views[view].settings.group_action !== 'hide') {
                if (!this.isUserMemeberOf(this.conn.getUser(), this.views[view].settings.group)) {
                    $view.addClass('vis-user-disabled');
                }
            }
        }
    },
    addViewStyle: function (view, theme) {
        var _view = 'visview_' + view;

        if (this.calcCommonStyle() === theme) return;

        $.ajax({
            url: ((typeof app === 'undefined') ? '../../' : '') + 'lib/css/themes/jquery-ui/' + theme + '/jquery-ui.min.css',
            cache: false,
            success: function (data) {
                $('#' + view + '_style').remove();
                data = data.replace('.ui-helper-hidden', '#' + _view + ' .ui-helper-hidden');
                data = data.replace(/(}.)/g, '}#' + _view + ' .');
                data = data.replace(/,\./g, ',#' + _view + ' .');
                data = data.replace(/images/g, ((typeof app === 'undefined') ? '../../' : '') + 'lib/css/themes/jquery-ui/' + theme + '/images');
                var $view = $('#' + _view);
                $view.append('<style id="' + view + '_style">' + data + '</style>');

                $('#' + view + '_style_common_user').remove();
                $view.append('<style id="' + view + '_style_common_user" class="vis-common-user">' + $('#vis-common-user').html() + '</style>');

                $('#' + view + '_style_user').remove();
                $view.append('<style id="' + view + '_style_user" class="vis-user">' + $('#vis-user').html() + '</style>');

            }
        });
    },
    preloadImages: function (srcs) {
        if (!this.preloadImages.cache) {
            this.preloadImages.cache = [];
        }
        var img;
        for (var i = 0; i < srcs.length; i++) {
            img = new Image();
            img.src = srcs[i];
            this.preloadImages.cache.push(img);
        }
    },
    reRenderWidget: function (view, widget) {
        var $widget = $('#' + widget);
        var updateContainers = $widget.find('.vis-view-container').length;

        this.renderWidget(view || this.activeView, widget);

        if (updateContainers) this.updateContainers(view || this.activeView);
    },
    changeFilter: function (filter, showEffect, showDuration, hideEffect, hideDuration) {
        var widgets = this.views[this.activeView].widgets;
        var that = this;
        var widget;
        var mWidget;
        if (!filter) {
            // show all
            for (widget in widgets) {
                if (widgets[widget].data.filterkey) {
                    $('#' + widget).show(showEffect, null, parseInt(showDuration));
                }
            }
            // Show complex widgets
            setTimeout(function () {
                var mWidget;
                for (var widget in widgets) {
                    mWidget = document.getElementById(widget);
                    if (widgets[widget].data.filterkey &&
                        mWidget &&
                        mWidget._customHandlers &&
                        mWidget._customHandlers.onShow) {
                        mWidget._customHandlers.onShow(mWidget, widget);
                    }
                }
            }, parseInt(showDuration) + 10);

        } else if (filter === '$') {
            // hide all
            for (widget in widgets) {
                mWidget = document.getElementById(widget);
                if (mWidget &&
                    mWidget._customHandlers &&
                    mWidget._customHandlers.onHide) {
                    mWidget._customHandlers.onHide(mWidget, widget);
                }
                $('#' + widget).hide(hideEffect, null, parseInt(hideDuration));
            }
        } else {
            this.viewsActiveFilter[this.activeView] = filter.split(',');
            for (widget in widgets) {
                //console.log(widgets[widget]);
                if (widgets[widget].data.filterkey) {
                    if (this.viewsActiveFilter[this.activeView].length > 0 &&
                        this.viewsActiveFilter[this.activeView].indexOf(widgets[widget].data.filterkey) === -1) {
                        mWidget = document.getElementById(widget);
                        if (mWidget &&
                            mWidget._customHandlers &&
                            mWidget._customHandlers.onHide) {
                            mWidget._customHandlers.onHide(mWidget, widget);
                        }
                        $('#' + widget).hide(hideEffect, null, parseInt(hideDuration));
                    } else {
                        $('#' + widget).show(showEffect, null, parseInt(showDuration));
                    }
                }
            }
            setTimeout(function () {
                var mWidget;

                // Show complex widgets like hqWidgets or bars
                for (var widget in widgets) {
                    mWidget = document.getElementById(widget);
                    if (mWidget &&
                        mWidget._customHandlers &&
                        mWidget._customHandlers.onShow) {
                        if (widgets[widget].data.filterkey) {
                            if (!(that.viewsActiveFilter[that.activeView].length > 0 &&
                                that.viewsActiveFilter[that.activeView].indexOf(widgets[widget].data.filterkey) === -1)) {
                                mWidget._customHandlers.onShow(mWidget, widget);
                            }
                        }
                    }
                }
            }, parseInt(showDuration) + 10);
        }

        if (this.binds.bars && this.binds.bars.filterChanged) {
            this.binds.bars.filterChanged(this.activeView, filter);
        }
    },
    isSignalVisible: function (view, widget, index, val) {
        var oid = this.views[view].widgets[widget].data['signals-oid-' + index];

        if (oid) {
            if (val === undefined) val = this.states.attr(oid + '.val');
            if (val === undefined) return (condition === 'not exist') ? true : false;

            var condition = this.views[view].widgets[widget].data['signals-cond-' + index];
            var value     = this.views[view].widgets[widget].data['signals-val-'  + index];

            if (!condition || value === undefined) return (condition === 'not exist') ? true : false;

            var t = typeof val;
            if (t === 'boolean' || val === 'false' || val === 'true') {
                value = (value === 'true' || value === true || value === 1 || value === '1');
            } else if (t === 'number') {
                value = parseFloat(value);
            }  else if (t === 'object') {
                val = JSON.stringify(val);
            }

            switch (condition) {
                case '==':
                    value = value.toString();
                    val   = val.toString();
                    if (val   === '1') val   = 'true';
                    if (value === '1') value = 'true';
                    if (val   === '0') val   = 'false';
                    if (value === '0') value = 'false';
                    return value === val;
                case '!=':
                    value = value.toString();
                    val   = val.toString();
                    if (val   === '1') val   = 'true';
                    if (value === '1') value = 'true';
                    if (val   === '0') val   = 'false';
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
                    val   = val.toString();
                    return (val.toString().indexOf(value) !== -1);
                case 'not consist':
                    value = value.toString();
                    val   = val.toString();
                    return (val.toString().indexOf(value) === -1);
                case 'exist':
                    if (value === 'null') return true;
                    return false;
                case 'not exist':
                    if (value === 'null') return false;
                    return true;
                default:
                    console.log('Unknown signals condition for ' + widget + ': ' + condition);
                    return false;
            }
        } else {
            return false;
        }
    },
    addSignalIcon: function (view, wid, data, index) {
        // show icon
        var display = (this.editMode || this.isSignalVisible(view, wid, index)) ? '' : 'none';
        if (this.editMode && data['signals-hide-edit-' + index]) display = 'none';

        $('#' + wid).append('<div class="vis-signal ' + (data['signals-blink-' + index] ? 'vis-signals-blink' : '') + ' ' + (data['signals-text-class-' + index] || '') + ' " data-index="' + index + '" style="display: ' + display + '; pointer-events: none; position: absolute; z-index: 10; top: ' + (data['signals-vert-' + index] || 0)+ '%; left: ' + (data['signals-horz-' + index] || 0)+ '%"><img class="vis-signal-icon" src="' + data['signals-icon-' + index] + '" style="width: ' + (data['signals-icon-size-' + index] || 32) + 'px; height: auto;' + (data['signals-icon-style-' + index] || '') + '"/>' +
            (data['signals-text-' + index] ? ('<div class="vis-signal-text " style="' + (data['signals-text-style-' + index] || '') + '">' + data['signals-text-' + index] + '</div>') : '') + '</div>');
    },
    addGestures: function (id, wdata) {
        // gestures
        var gestures = ['swipeRight', 'swipeLeft', 'swipeUp', 'swipeDown', 'rotateLeft', 'rotateRight', 'pinchIn', 'pinchOut', 'swiping', 'rotating', 'pinching'];
        var $$wid   = $$('#' + id);
        var $wid    = $('#' + id);
        var offsetX = parseInt(wdata['gestures-offsetX']) || 0;
        var offsetY = parseInt(wdata['gestures-offsetY']) || 0;
        var that    = this;

        gestures.forEach(function (gesture) {
            if (wdata && wdata['gestures-' + gesture + '-oid']) {
                var oid = wdata['gestures-' + gesture + '-oid'];
                if (oid) {
                    var val      = wdata['gestures-' + gesture + '-value'];
                    var delta    = parseInt(wdata['gestures-' + gesture + '-delta'])     || 10;
                    var limit    = parseFloat(wdata['gestures-' + gesture + '-limit'])   || false;
                    var max      = parseFloat(wdata['gestures-' + gesture + '-maximum']) || 100;
                    var min      = parseFloat(wdata['gestures-' + gesture + '-minimum']) || 0;
                    var valState = that.states.attr(oid + '.val');
                    var newVal   = null;
                    var $indicator;
                    if (valState !== undefined){
                        $wid.on('touchmove', function(evt) {
                            evt.preventDefault();
                        });

                        $wid.css({
                            '-webkit-user-select':  'none',
                            '-khtml-user-select':   'none',
                            '-moz-user-select':     'none',
                            '-ms-user-select':      'none',
                            'user-select':          'none'
                        });
                        $$wid[gesture](function (data) {
                            valState = that.states.attr(oid + '.val');
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
                                if (newVal === null){
                                    $indicator = $('#' + wdata['gestures-indicator']);
                                    // create default indicator
                                    if (!$indicator.length) {
                                        $indicator = $('#gestureIndicator');
                                        if (!$indicator.length) {
                                            $('body').append('<div id="gestureIndicator" style="position: absolute; pointer-events: none; z-index: 100; box-shadow: 2px 2px 5px 1px gray;height: 21px; border: 1px solid #c7c7c7; border-radius: 5px; text-align: center; padding-top: 6px; padding-left: 2px; padding-right: 2px; background: lightgray;"></div>');
                                            $indicator = $('#gestureIndicator');

                                            $indicator.on('gestureUpdate', function(event, evData) {
                                                if (evData.val === null) {
                                                    $(this).hide();
                                                } else {
                                                    $(this).html(evData.val);
                                                    $(this).css({
                                                        left: parseInt(evData.x) - $(this).width()  / 2 + 'px',
                                                        top:  parseInt(evData.y) - $(this).height() / 2 + 'px'
                                                    }).show();
                                                }
                                            });
                                        }
                                    }

                                    $('#vis_container').css({
                                        '-webkit-user-select':  'none',
                                        '-khtml-user-select':   'none',
                                        '-moz-user-select':     'none',
                                        '-ms-user-select':      'none',
                                        'user-select':          'none'
                                    });

                                    $(document).on('mouseup.gesture touchend.gesture', function () {
                                        if (newVal !== null) {
                                            that.setValue(oid, newVal);
                                            newVal = null;
                                        }
                                        $indicator.trigger('gestureUpdate', {val: null});
                                        $(document).off('mouseup.gesture touchend.gesture');

                                        $('#vis_container').css({
                                            '-webkit-user-select':  'text',
                                            '-khtml-user-select':   'text',
                                            '-moz-user-select':     'text',
                                            '-ms-user-select':      'text',
                                            'user-select':          'text'
                                        });
                                    });
                                }
                                var swipeDelta, indicatorX, indicatorY = 0;
                                switch (gesture){
                                    case 'swiping':
                                        swipeDelta = Math.abs(data.touch.delta.x) > Math.abs(data.touch.delta.y) ? data.touch.delta.x : data.touch.delta.y * (-1);
                                        swipeDelta = swipeDelta > 0 ? Math.floor(swipeDelta / delta) : Math.ceil(swipeDelta / delta);
                                        indicatorX = data.touch.x;
                                        indicatorY = data.touch.y;
                                        break;

                                    case 'rotating':
                                        swipeDelta = data.touch.delta;
                                        swipeDelta = swipeDelta > 0 ? Math.floor(swipeDelta / delta) : Math.ceil(swipeDelta / delta);
                                        if (data.touch.touches[0].y < data.touch.touches[1].y){
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
                                $indicator.trigger('gestureUpdate', {val: newVal, x: indicatorX + offsetX, y: indicatorY + offsetY});
                                return;
                            } else if (limit !== false) {
                                newVal = (parseFloat(valState) || 0) + (parseFloat(val) || 1);
                                if (parseFloat(val) > 0 && newVal > limit) {
                                    newVal = limit;
                                } else if (parseFloat(val) < 0 && newVal < limit){
                                    newVal = limit;
                                }
                            } else {
                                newVal = val;
                            }
                            that.setValue(oid,newVal);
                            newVal = null;
                        });
                    }
                }
            }
        });
    },
    isUserMemeberOf: function (user, groups) {
        if (!this.userGroups) return true;
        if (typeof groups !== 'object') groups = [groups];
        for (var g = 0; g < groups.length; g++) {
            var group = this.userGroups['system.group.' + groups[g]];
            if (!group || !group.common || !group.common.members || !group.common.members.length) continue;
            if (group.common.members.indexOf('system.user.' + user) !== -1) return true;
        }
        return false;
    },
    renderWidget: function (view, id) {
        var $view = $('#visview_' + view);
        if (!$view.length) return;

        var widget = this.views[view].widgets[id];
        var isRelative = widget && widget.style && (widget.style.position === 'relative' || widget.style.position === 'static' || widget.style.position === 'sticky');

        // if widget has relative position => insert it into relative div
        if (this.editMode && isRelative) {
            if (this.views[view].settings && this.views[view].settings.sizex) {
                var $relativeView = $view.find('.vis-edit-relative');
                if (!$relativeView.length) {
                    $view.append('<div class="vis-edit-relative" style="width: ' + this.views[view].settings.sizex + 'px; height: ' + this.views[view].settings.sizey + 'px"></div>');
                    $view = $view.find('.vis-edit-relative');
                } else {
                    $view = $relativeView;
                }
            }
        }

        //console.log("renderWidget("+view+","+id+")");
        // Add to the global array of widgets
        try {
            var groups;
            if (!this.editMode && widget.data['visibility-groups'] && widget.data['visibility-groups'].length) {
                groups = widget.data['visibility-groups'];

                if (widget.data['visibility-groups-action'] === 'hide') {
                    if (!this.isUserMemeberOf(this.conn.getUser(), groups)) return;
                    groups = null;
                }
            }

            this.widgets[id] = {
                wid: id,
                data: new can.Map($.extend({
                    wid: id
                }, widget.data))
            };
        } catch (e) {
            console.log('Cannot bind data of widget widget:' + id);
            return;
        }
        // Register oid to detect changes
        // if (widget.data.oid !== 'nothing_selected')
        //   $.homematic("advisState", widget.data.oid, widget.data.hm_wid);

        var widgetData = this.widgets[id].data;

        try {
            //noinspection JSJQueryEfficiency
            var $widget = $('#' + id);
            if ($widget.length) {
                var destroy = $widget.data('destroy');
                if (typeof destroy === 'function') destroy(id, $widget);
                if (isRelative && !$view.find('#' + id).length) {
                    $widget.remove();
                    $widget.length = 0;
                } else {
                    $widget.html('<div></div>').attr('id', id + '_removed');
                }
            }

            var canWidget;
            // Append html element to view
            if (widget.data && widget.data.oid) {
                canWidget = can.view(widget.tpl, {
                    val: this.states.attr(widget.data.oid + '.val'),
                    //ts:  this.states.attr(widget.data.oid + '.ts'),
                    //ack: this.states.attr(widget.data.oid + '.ack'),
                    //lc:  this.states.attr(widget.data.oid + '.lc'),
                    data: widgetData,
                    view: view
                });
                if ($widget.length) {
                    $widget.replaceWith(canWidget);
                } else {
                    $view.append(canWidget);
                }
            } else if (widget.tpl) {
                canWidget = can.view(widget.tpl, {
                    data: widgetData,
                    view: view
                });
                if ($widget.length) {
                    $widget.replaceWith(canWidget);
                } else {
                    $view.append(canWidget);
                }
            } else {
                console.error('Widget "' + id + '" is invalid. Please delete it.');
                return;
            }
            var $wid = null;

            if (widget.style && !widgetData._no_style) {
                $wid = $wid || $('#' + id);

                // fix position
                for (var attr in widget.style) {
                    if (attr === 'top' || attr === 'left' || attr === 'width' || attr === 'height') {
                        var val = widget.style[attr];
                        if (val !== '0' && val !== 0 && val !== null && val !== '' && val.toString().match(/^[-+]\d+$/)) {
                            widget.style[attr] = val + 'px';
                        }
                    }
                }

                $wid.css(widget.style);
            }

            if (widget.data && widget.data.class) {
                $wid = $wid || $('#' + id);
                $wid.addClass(widget.data.class);
            }

            if (!this.editMode) {
                if (this.isWidgetFilteredOut(view, id) || this.isWidgetHidden(view, id)) {
                    var mWidget = document.getElementById(id);
                    $(mWidget).hide();
                    if (mWidget &&
                        mWidget._customHandlers &&
                        mWidget._customHandlers.onHide) {
                        mWidget._customHandlers.onHide(mWidget, id);
                    }
                }

                // Processing of gestures
                if (typeof $$ !== 'undefined') this.addGestures(id, widget.data);
            }

            // processing of signals
            var s = 0;
            while (widget.data['signals-oid-' + s]) {
                this.addSignalIcon(view, id, widget.data, s);
                s++;
            }

            // If edit mode, bind on click event to open this widget in edit dialog
            if (this.editMode) {
                this.bindWidgetClick(view, id);

                // @SJ cannot select menu and dialogs if it is enabled
                /*if ($('#wid_all_lock_f').hasClass("ui-state-active")) {
                 $('#' + id).addClass("vis-widget-lock")
                 }*/
            }

            $(document).trigger('wid_added', id);
        } catch (e) {
            this.conn.logError('Error: can\'t render ' + widget.tpl + ' ' + id + ' (' + e + ')');
        }

        if (groups && $wid && $wid.length) {
            if (!this.isUserMemeberOf(this.conn.getUser(), groups)) {
                $wid.addClass('vis-user-disabled');
            }
        }
    },
    changeView: function (view, hideOptions, showOptions, sync) {
        var that = this;
        var effect = (hideOptions !== undefined) && (hideOptions.effect !== undefined) && hideOptions.effect;
        if (!effect) {
            effect = (showOptions !== undefined) && (showOptions.effect !== undefined) && showOptions.effect;
        }
        if (effect && ((showOptions === undefined) || !showOptions.effect)) {
            showOptions = {effect: hideOptions.effect, options: {}, duration: hideOptions.duration};
        }
        if (effect && ((hideOptions === undefined) || !hideOptions.effect)) {
            hideOptions = {effect: showOptions.effect, options: {}, duration: showOptions.duration};
        }
        hideOptions = $.extend(true, {effect: undefined, options: {}, duration: 0}, hideOptions);
        showOptions = $.extend(true, {effect: undefined, options: {}, duration: 0}, showOptions);
        if (hideOptions.effect === 'show') effect = false;

        if (!this.views[view]) {
            view = null;
            for (var prop in this.views) {
                if (prop === '___settings') continue;
                view = prop;
                break;
            }
        }

        var $view;
        // If really changed
        if (this.activeView !== view) {
            if (effect) {
                this.renderView(view, true, true);

                $view = $('#visview_' + view);

                // Get the view, if required, from Container
                if ($view.parent().attr('id') !== 'vis_container') $view.appendTo('#vis_container');

                // If hide and show at the same time
                if (sync) {
                    $('#visview_' + view).show(showOptions.effect, showOptions.options, parseInt(showOptions.duration, 10), function () {
                        if (that.views[view].rerender) {
                            that.views[view].rerender = false;
                            for (var id in that.views[view].widgets) {
                                if (that.views[view].widgets[id].tpl.substring(0, 5) === 'tplHq' ||
                                    that.views[view].widgets[id].renderVisible)
                                    that.renderWidget(view, id);
                            }
                        }
                    }).dequeue();
                }

                $('#visview_' + this.activeView).hide(hideOptions.effect, hideOptions.options, parseInt(hideOptions.duration, 10), function () {
                    // If first hide, than show
                    if (!sync) {
                        $('#visview_' + view).show(showOptions.effect, showOptions.options, parseInt(showOptions.duration, 10), function () {
                            if (that.views[view].rerender) {
                                that.views[view].rerender = false;
                                for (var id in that.views[view].widgets) {
                                    if (!that.views[view].widgets[id] && !that.views[view].widgets[id].tpl) {
                                        console.error('Widget "' + id + '" is invalid. Please delete it.');
                                        continue;
                                    }

                                    if (that.views[view].widgets[id].tpl.substring(0, 5) === 'tplHq' ||
                                        that.views[view].widgets[id].renderVisible)
                                        that.renderWidget(view, id);
                                }
                            }
                            that.destroyUnusedViews();
                        });
                    } else {
                        that.destroyUnusedViews();
                    }
                });
            } else {

                this.renderView(view, true);

                $view = $('#visview_' + view);

                // Get the view, if required, from Container
                if ($view.parent().attr('id') !== 'vis_container') $view.appendTo('#vis_container');

                $view.show();
                $('#visview_' + this.activeView).hide();

                this.destroyUnusedViews();
            }
            // remember last click for debounce
            this.lastChange = (new Date()).getTime();
        } else {
            this.renderView(view);

            $view = $('#visview_' + view);
            
            // Get the view, if required, from Container
            if ($view.parent().attr('id') !== 'vis_container') $view.appendTo('#vis_container');

            this.destroyUnusedViews();
        }
        this.activeView = view;

        /*$('#visview_' + view).find('div[id$="container"]').each(function () {
         $('#visview_' + $(this).attr('data-vis-contains')).show();
         });*/

        this.updateContainers(view);

        if (!this.editMode) {
            this.conn.sendCommand(this.instance, 'changedView', this.projectPrefix ? (this.projectPrefix + this.activeView) : this.activeView);
            $(window).trigger('viewChanged', view);
        }

        if (window.location.hash.slice(1) !== view) {
            if (history && history.pushState) {
                history.pushState({}, '', '#' + view);
            }
        }

        // Navigation-Widgets
        for (var i = 0; i < this.navChangeCallbacks.length; i++) {
            this.navChangeCallbacks[i](view);
        }

        // --------- Editor -----------------
        if (this.editMode) this.changeViewEdit(view);
    },
    loadRemote: function (callback, callbackArg) {
        var that = this;
        if (!this.projectPrefix) {
            if (callback) callback.call(that, callbackArg);
            return;
        }
        this.conn.readFile(this.projectPrefix + 'vis-views.json', function (err, data) {
            if (err) {
                window.alert(that.projectPrefix + 'vis-views.json ' + err);
                if (err === 'permissionError') {
                    that.showWaitScreen(true, '', _('Loading stopped', location.protocol + '//' + location.host, location.protocol + '//' + location.host), 0);
                    // do nothing any more
                    return;
                }
            }

            if (data) {
                if (typeof data === 'string') {
                    try {
                        that.views = JSON.parse(data.trim());
                    } catch (e) {
                        console.log('Cannot parse views file "' + that.projectPrefix + 'vis-views.json"');
                        window.alert('Cannot parse views file "' + that.projectPrefix + 'vis-views.json');
                        that.views = null;
                    }
                } else {
                    that.views = data;
                }
                that.IDs = that.getUsedObjectIDs();
            } else {
                that.views = null;
            }

            if (callback) callback.call(that, callbackArg);
        });
    },
    wakeUpCallbacks: [],
    initWakeUp: function () {
        var that = this;
        var oldTime = (new Date()).getTime();
        setInterval(function () {
            var currentTime = (new Date()).getTime();
            //console.log("checkWakeUp "+ (currentTime - oldTime));
            if (currentTime > (oldTime + 10000)) {
                oldTime = currentTime;
                for (var i = 0; i < that.wakeUpCallbacks.length; i++) {
                    //console.log("calling wakeUpCallback!");
                    that.wakeUpCallbacks[i]();
                }
            } else {
                oldTime = currentTime;
            }
        }, 2500);
    },
    onWakeUp: function (callback) {
        this.wakeUpCallbacks.push(callback);
    },
    showMessage: function (message, title, icon, width, callback) {
        // load some theme to show message
        if (!this.editMode && !$('#commonTheme').length) {
            $('head').prepend('<link rel="stylesheet" type="text/css" href="' + ((typeof app === 'undefined') ? '../../' : '') + 'lib/css/themes/jquery-ui/' + (this.calcCommonStyle() || 'redmond') + '/jquery-ui.min.css" id="commonTheme"/>');
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
            this.$dialogMessage = $('#dialog-message');
            this.$dialogMessage.dialog({
                autoOpen: false,
                modal:    true,
                open: function () {
                    $(this).parent().css({'z-index': 1003});
                    var callback = $(this).data('callback');
                    if (callback) {
                        $(this).find('#dialog_message_cancel').show();
                    } else {
                        $(this).find('#dialog_message_cancel').hide();
                    }
                },
                buttons: [
                    {
                        text: _('Ok'),
                        click: function () {
                            var callback = $(this).data('callback');
                            $(this).dialog('close');
                            if (typeof callback === 'function') {
                                callback(true);
                                $(this).data('callback', null);
                            }
                        }
                    },
                    {
                        id:  'dialog_message_cancel',
                        text: _('Cancel'),
                        click: function () {
                            var callback = $(this).data('callback');
                            $(this).dialog('close');
                            if (typeof callback === 'function') {
                                callback(false);
                                $(this).data('callback', null);
                            }
                        }
                    }
                ]
            });
        }
        this.$dialogMessage.dialog('option', 'title', title || _('Message'));
        if (width) {
            this.$dialogMessage.dialog('option', 'width', width);
        } else {
            this.$dialogMessage.dialog('option', 'width', 300);
        }
        $('#dialog-message-text').html(message);

        this.$dialogMessage.data('callback', callback ? callback : null);

        if (icon) {
            $('#dialog-message-icon')
                .show()
                .attr('class', '')
                .addClass('ui-icon ui-icon-' + icon);
        } else {
            $('#dialog-message-icon').hide();
        }
        this.$dialogMessage.dialog('open');
    },
    showError: function (error) {
        this.showMessage(error, _('Error'), 'alert', 400);
    },
    waitScreenVal: 0,
    showWaitScreen: function (isShow, appendText, newText, step) {
        var waitScreen = document.getElementById("waitScreen");
        if (!waitScreen && isShow) {
            $('body').append('<div id="waitScreen" class="vis-wait-screen"><div id="waitDialog" class="waitDialog"><div class="vis-progressbar"></div><div class="vis-wait-text" id="waitText"></div></div></div>');
            waitScreen = document.getElementById("waitScreen");
            this.waitScreenVal = 0;
        }

        $('.vis-progressbar').progressbar({value: this.waitScreenVal}).height(19);

        if (isShow) {
            $(waitScreen).show();
            if (newText !== null && newText !== undefined) {
                $('#waitText').html(newText);
            }
            if (appendText !== null && appendText !== undefined) {
                $('#waitText').append(appendText);
            }
            if (step !== undefined) {
                this.waitScreenVal += step;
                _setTimeout(function (_val) {
                    $(".vis-progressbar").progressbar('value', _val);
                }, 0, this.waitScreenVal);

            }
        } else if (waitScreen) {
            $(waitScreen).remove();
        }
    },
    registerOnChange: function (callback, arg) {
        for (var i = 0, len = this.onChangeCallbacks.length; i < len; i++) {
            if (this.onChangeCallbacks[i].callback === callback &&
                this.onChangeCallbacks[i].arg === arg) {
                return;
            }
        }
        this.onChangeCallbacks[this.onChangeCallbacks.length] = {callback: callback, arg: arg};
    },
    unregisterOnChange: function (callback, arg) {
        for (var i = 0, len = this.onChangeCallbacks.length; i < len; i++) {
            if (this.onChangeCallbacks[i].callback === callback &&
                (arg === undefined || this.onChangeCallbacks[i].arg === arg)) {
                this.onChangeCallbacks.slice(i, 1);
                return;
            }
        }
    },
    isWidgetHidden: function (view, widget, val) {
        var oid       = this.views[view].widgets[widget].data['visibility-oid'];
        var condition = this.views[view].widgets[widget].data['visibility-cond'];
        if (oid) {
            if (val === undefined) val = this.states.attr(oid + '.val');
            if (val === undefined) return (condition === 'not exist') ? true : false;

            var value = this.views[view].widgets[widget].data['visibility-val'];

            if (!condition || value === undefined) return (condition === 'not exist') ? true : false;

            var t = typeof val;
            if (t === 'boolean' || val === 'false' || val === 'true') {
                value = (value === 'true' || value === true || value === 1 || value === '1');
            } else if (t === 'number') {
                value = parseFloat(value);
            }  else if (t === 'object') {
                val = JSON.stringify(val);
            }

            // Take care: return true if widget is hidden!
            switch (condition) {
                case '==':
                    value = value.toString();
                    val   = val.toString();
                    if (val   === '1') val   = 'true';
                    if (value === '1') value = 'true';
                    if (val   === '0') val   = 'false';
                    if (value === '0') value = 'false';
                    return value !== val;
                case '!=':
                    value = value.toString();
                    val   = val.toString();
                    if (val   === '1') val   = 'true';
                    if (value === '1') value = 'true';
                    if (val   === '0') val   = 'false';
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
                    val   = val.toString();
                    return (val.toString().indexOf(value) === -1);
                case 'not consist':
                    value = value.toString();
                    val   = val.toString();
                    return (val.toString().indexOf(value) !== -1);
                case 'exist':
                    if (val === 'null') return false;
                    return true;
                case 'not exist':
                    if (val === 'null') return true;
                    return false;
                default:
                    console.log('Unknown visibility condition for ' + widget + ': ' + condition);
                    return false;
            }
        } else {
            return (condition === 'not exist') ? true : false;
        }
    },
    isWidgetFilteredOut: function (view, widget) {
        return (
        this.views[view].widgets[widget].data.filterkey &&
        this.viewsActiveFilter[view].length > 0 &&
        this.viewsActiveFilter[view].indexOf(widget.data.filterkey) === -1);
    },
    calcCommonStyle: function (recalc) {
        if (!this.commonStyle || recalc) {
            if (this.editMode) {
                this.commonStyle = this.config.editorTheme || 'redmond';
                return this.commonStyle;
            }
            var styles = {};
            if (this.views) {
                for (var view in this.views) {
                    if (view === '___settings') continue;
                    if (!this.views[view] || !this.views[view].settings.theme) continue;
                    if (this.views[view].settings.theme && styles[this.views[view].settings.theme]) {
                        styles[this.views[view].settings.theme]++;
                    } else {
                        styles[this.views[view].settings.theme] = 1;
                    }
                }
            }
            var max = 0;
            this.commonStyle = '';
            for (var s in styles) {
                if (styles[s] > max) {
                    max = styles[s];
                    this.commonStyle = s;
                }
            }
        }
        return this.commonStyle;
    },
    formatValue: function formatValue(value, decimals, _format) {
        if (typeof decimals !== 'number') {
            decimals = 2;
            _format = decimals;
        }

        //format = (_format === undefined) ? (that.isFloatComma) ? ".," : ",." : _format;
        // does not work...
        // using default german...
        var format = (_format === undefined) ? ".," : _format;

        if (typeof value !== "number") value = parseFloat(value);
        return isNaN(value) ? "" : value.toFixed(decimals || 0).replace(format[0], format[1]).replace(/\B(?=(\d{3})+(?!\d))/g, format[0]);
    },
    formatDate: function formatDate(dateObj, isSeconds, _format) {

        var duration = false;
        if ((typeof isSeconds === 'string') && (isSeconds.toLowerCase() === 'duration')) {
            isSeconds = true;
            duration = true;
        }
        if (typeof isSeconds !== 'boolean') {
            _format = isSeconds;
            isSeconds = false;
        }

        var format = _format || 'DD.MM.YYYY';

        if (!dateObj) return '';
        var text = typeof dateObj;
        if (text === 'string') {
            var pos = dateObj.indexOf('.');
            if (pos !== -1) dateObj = dateObj.substring(0, pos);
            return dateObj;
        }
        if (text !== 'object') dateObj = isSeconds ? new Date(dateObj * 1000) : new Date(dateObj);
        if (duration) dateObj.setMilliseconds(dateObj.getMilliseconds() + dateObj.getTimezoneOffset() * 60 * 1000);

        var validFormatChars = 'YJГMDДhSчmмsс';
        var s = "", result = '';

        function put(s) {
            var v = '';
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
                    v = dateObj.getMonth() + 1;
                    if ((v < 10) && (s.length === 2)) v = '0' + v;
                    break;
                case 'DD':
                case 'TT':
                case 'D':
                case 'T':
                case 'ДД':
                case 'Д':
                    v = dateObj.getDate();
                    if ((v < 10) && (s.length === 2)) v = '0' + v;
                    break;
                case 'hh':
                case 'SS':
                case 'h':
                case 'S':
                case 'чч':
                case 'ч':
                    v = dateObj.getHours();
                    if ((v < 10) && (s.length === 2)) v = '0' + v;
                    break;
                case 'mm':
                case 'm':
                case 'мм':
                case 'м':
                    v = dateObj.getMinutes();
                    if ((v < 10) && (s.length === 2)) v = '0' + v;
                    break;
                case 'sss':
                case 'ccc':
                    v = dateObj.getMilliseconds();
                    if (v < 10) {
                        v = '00' + v;
                    } else if (v < 100) {
                        v = '0' + v;
                    }
                    v = v.toString();
                    break;
                case 'ss':
                case 's':
                case 'cc':
                case 'c':
                    v = dateObj.getSeconds();
                    if ((v < 10) && (s.length === 2)) v = '0' + v;
                    v = v.toString();
                    break;
            }
            return result += v;
        }

        for (var i = 0; i < format.length; i++) {
            if (validFormatChars.indexOf(format[i]) >= 0)
                s += format[i];
            else {
                put(s);
                s = '';
                result += format[i];
            }
        }
        put(s);
        return result;
    },
    extractBinding: function (format) {
        if (this.editMode) return null;
        if (this.bindingsCache[format]) return JSON.parse(JSON.stringify(this.bindingsCache[format]));

        var oid = format.match(/{(.+?)}/g);
        var result = null;
        if (oid) {
            for (var p = 0; p < oid.length; p++) {
                var _oid = oid[p].substring(1, oid[p].length - 1);
                if (_oid[0] === '{') continue;
                // If first symbol '"' => it is JSON
                if (_oid && _oid[0] === '"') continue;
                var parts = _oid.split(';');
                result = result || [];
                var systemOid = parts[0].trim();
                var visOid    = systemOid;

                var test1 = visOid.substring(visOid.length - 4);
                var test2 = visOid.substring(visOid.length - 3);

                if (visOid && test1 !== '.val' && test2 !== '.ts' && test2 !== '.lc' && test1 !== '.ack') {
                    visOid = visOid + '.val';
                }

                var isSeconds = (test2 === '.ts' || test2 === '.lc');

                var test1 = systemOid.substring(systemOid.length - 4);
                var test2 = systemOid.substring(systemOid.length - 3);

                if (test1 === '.val' || test1 === '.ack') {
                    systemOid = systemOid.substring(0, systemOid.length - 4);
                } else if (test2 === '.lc' || test2 === '.ts') {
                    systemOid = systemOid.substring(0, systemOid.length - 3);
                }
                var operations = null;
                var isEval = visOid.match(/[\d\w_\.]+:[\d\w_\.]+/) || (!visOid.length && parts.length > 0);//(visOid.indexOf(':') !== -1) && (visOid.indexOf('::') === -1);

                if (isEval) {
                    var xx = visOid.split(':', 2);
                    var yy = systemOid.split(':', 2);
                    visOid = xx[1];
                    systemOid = yy[1];
                    operations = operations || [];
                    operations.push({
                        op: 'eval',
                        arg: [{
                            name:       xx[0],
                            visOid:     visOid,
                            systemOid:  systemOid
                        }]
                    });
                }


                for (var u = 1; u < parts.length; u++) {
                    // eval construction
                    if (isEval) {
                        if (parts[u].match(/[\d\w_\.]+:[\d\w_\.]+/)) {//parts[u].indexOf(':') !== -1 && parts[u].indexOf('::') === -1) {
                            var _systemOid = parts[u].trim();
                            var _visOid    = _systemOid;

                            var test1 = _visOid.substring(_visOid.length - 4);
                            var test2 = _visOid.substring(_visOid.length - 3);

                            if (test1 !== '.val' && test2 !== '.ts' && test2 !== '.lc' && test1 !== '.ack') {
                                _visOid = _visOid + '.val';
                            }

                            test1 = systemOid.substring(_systemOid.length - 4);
                            test2 = systemOid.substring(_systemOid.length - 3);

                            if (test1 === '.val' || test1 === '.ack') {
                                _systemOid = _systemOid.substring(0, _systemOid.length - 4);
                            } else if (test2 === '.lc' || test2 === '.ts') {
                                _systemOid = _systemOid.substring(0, _systemOid.length - 3);
                            }
                            var xx = _visOid.split(':', 2);
                            var yy = _systemOid.split(':', 2);
                            operations[0].arg.push({
                                name:      xx[0],
                                visOid:    xx[1],
                                systemOid: yy[1]
                            });
                        } else {
                            parts[u] = parts[u].replace(/::/g, ':');
                            if (operations[0].formula) {
                                var n = JSON.parse(JSON.stringify(operations[0]));
                                n.formula = parts[u];
                                operations.push(n);
                            } else {
                                operations[0].formula = parts[u];
                            }
                        }
                    } else {
                        var parse = parts[u].match(/([\w\s\/\+\*\-]+)(\(.+\))?/);
                        if (parse && parse[1]) {
                            parse[1] = parse[1].trim();
                            // operators requires parameter
                            if (parse[1] === '*' ||
                                parse[1] === '+' ||
                                parse[1] === '-' ||
                                parse[1] === '/' ||
                                parse[1] === '%' ||
                                parse[1] === 'min' ||
                                parse[1] === 'max') {
                                if (parse[2] === undefined) {
                                    console.log('Invalid format of format string: ' + format);
                                    parse[2] = null;
                                } else {
                                    parse[2] = parse[2].trim().replace(',', '.');
                                    parse[2] = parse[2].substring(1, parse[2].length - 1);
                                    parse[2] = parseFloat(parse[2].trim());

                                    if (parse[2].toString() === 'NaN') {
                                        console.log('Invalid format of format string: ' + format);
                                        parse[2] = null;
                                    } else {
                                        operations = operations || [];
                                        operations.push({op: parse[1], arg: parse[2]});
                                    }
                                }
                            } else
                            // date formatting
                            if (parse[1] === 'date') {
                                operations = operations || [];
                                parse[2] = parse[2].trim();
                                parse[2] = parse[2].substring(1, parse[2].length - 1);
                                operations.push({op: parse[1], arg: parse[2]});
                            } else
                            // value formatting
                            if (parse[1] === 'value') {
                                operations = operations || [];
                                var param = (parse[2]===undefined) ? '(2)' : parse[2];
                                param = param.trim();
                                param = param.substring(1, param.length - 1);
                                operations.push({ op: parse[1], arg: param });
                            } else
                            // operators have optional parameter
                            if (parse[1] === 'pow' || parse[1] === 'round' || parse[1] === 'random') {
                                if (parse[2] === undefined) {
                                    operations = operations || [];
                                    operations.push({op: parse[1]});
                                } else {
                                    parse[2] = parse[2].trim().replace(',', '.');
                                    parse[2] = parse[2].substring(1, parse[2].length - 1);
                                    parse[2] = parseFloat(parse[2].trim());

                                    if (parse[2].toString() === 'NaN') {
                                        console.log('Invalid format of format string: ' + format);
                                        parse[2] = null;
                                    } else {
                                        operations = operations || [];
                                        operations.push({op: parse[1], arg: parse[2]});
                                    }
                                }
                            } else
                            // operators without parameter
                            {
                                operations = operations || [];
                                operations.push({op: parse[1]});
                            }
                        } else {
                            console.log('Invalid format ' + format);
                        }
                    }
                }

                result.push({
                    visOid:     visOid,
                    systemOid:  systemOid,
                    token:      oid[p],
                    operations: operations ? operations : undefined,
                    format:     format,
                    isSeconds:  isSeconds
                });
            }
        }
        // cache bindings
        if (result) {
            this.bindingsCache = this.bindingsCache || {};
            this.bindingsCache[format] = JSON.parse(JSON.stringify(result));
        }

        return result;
    },
    formatBinding: function (format, view, wid, widget) {
        var oids = this.extractBinding(format);
        for (var t = 0; t < oids.length; t++) {
            var value;
            if (oids[t].visOid) switch (oids[t].visOid) {
                case 'username.val':
                    value = this.conn.getUser();
                    break;
                case 'language.val':
                    value = this.language;
                    break;
                case 'wid.val':
                    value = wid;
                    break;
                case 'wname.val':
                    value = widget.data.name || wid;
                    break;
                case 'view.val':
                    value = view;
                    break;
                default:
                    value = this.states.attr(oids[t].visOid);
                    break;
            }
            if (oids[t].operations) for (var k = 0; k < oids[t].operations.length; k++) {

                switch (oids[t].operations[k].op) {
                    case 'eval':
                        var string = '';//'(function() {';
                        for (var a = 0; a < oids[t].operations[k].arg.length; a++) {
                            if (!oids[t].operations[k].arg[a].name) continue;
                            switch (oids[t].operations[k].arg[a].visOid) {
                                case 'wid.val':
                                    value = wid;
                                    break;
                                case 'view.val':
                                    value = view;
                                    break;
                                case 'username.val':
                                    value = this.conn.getUser();
                                    break;
                                case 'language.val':
                                    value = this.language;
                                    break;
                                case 'wname.val':
                                    value = widget.data.name || wid;
                                    break;
                                default:
                                    value = this.states.attr(oids[t].operations[k].arg[a].visOid);
                                    break;
                            }
                            string += 'var ' + oids[t].operations[k].arg[a].name + ' = "' + value + '";';
                        }
                        if (oids[t].operations[k].formula.indexOf('widget.') !== -1) {
                            string += 'var widget = ' + JSON.stringify(widget) + ';';
                        }
                        string += 'return ' + oids[t].operations[k].formula + ';';
                        //string += '}())';
                        try {
                            value = new Function(string)();
                        } catch (e) {
                            console.error('Error in eval[value]     : ' + format);
                            console.error('Error in eval[script]: ' + string);
                            console.error('Error in eval[error] : ' + e);
                            value = 0;
                        }
                        break;
                    case '*':
                        if (oids[t].operations[k].arg !== undefined) {
                            value = parseFloat(value) * oids[t].operations[k].arg;
                        }
                        break;
                    case '/':
                        if (oids[t].operations[k].arg !== undefined) {
                            value = parseFloat(value) / oids[t].operations[k].arg;
                        }
                        break;
                    case '+':
                        if (oids[t].operations[k].arg !== undefined) {
                            value = parseFloat(value) + oids[t].operations[k].arg;
                        }
                        break;
                    case '-':
                        if (oids[t].operations[k].arg !== undefined) {
                            value = parseFloat(value) - oids[t].operations[k].arg;
                        }
                        break;
                    case '%':
                        if (oids[t].operations[k].arg !== undefined) {
                            value = parseFloat(value) % oids[t].operations[k].arg;
                        }
                        break;
                    case 'round':
                        if (oids[t].operations[k].arg === undefined) {
                            value = Math.round(parseFloat(value));
                        } else {
                            value = parseFloat(value).toFixed(oids[t].operations[k].arg);
                        }
                        break;
                    case 'pow':
                        if (oids[t].operations[k].arg === undefined) {
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
                        if (value.length < 2) value = '0' + value;
                        break;
                    case 'HEX':
                        value = Math.round(parseFloat(value)).toString(16).toUpperCase();
                        break;
                    case 'HEX2':
                        value = Math.round(parseFloat(value)).toString(16).toUpperCase();
                        if (value.length < 2) value = '0' + value;
                        break;
                    case 'value':
                        value = this.formatValue(value, parseInt(oids[t].operations[k].arg, 10));
                        break;
                    case 'date':
                        var number = parseInt(value, 10);
                        // This seconds or milliseconds
                        if (number.toString() == value) {
                            value = this.formatDate(value, oids[t].isSeconds, oids[t].operations[k].arg);
                        } else {
                            value = this.formatDate(value, false, oids[t].operations[k].arg);
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
                        if (oids[t].operations[k].arg === undefined) {
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
                } //switch
            } //if for
            format = format.replace(oids[t].token, value);
        }//for
        format = format.replace(/{{/g, '{').replace(/}}/g, '}');
        return format;
    },
    findNearestResolution: function (resultRequiredOrX, height) {
        var w;
        var h;
        if (height !== undefined) {
            w = resultRequiredOrX;
            h = height;
            resultRequiredOrX = false;
        } else {
            w = $(window).width();
            h = $(window).height();
        }
        var result = null;
        var views = [];
        var difference = 10000;

        // First find all with best fitting width
        for (var view in this.views) {
            if (view === '___settings') continue;
            if (this.views[view].settings && this.views[view].settings.useAsDefault) {
                // If difference less than 20%
                if (Math.abs(this.views[view].settings.sizex - w) / this.views[view].settings.sizex < 0.2) {
                    views.push(view);
                }
            }
        }

        for (var i in views) {
            if (Math.abs(this.views[views[i]].settings.sizey - h) < difference) {
                result = views[i];
                difference = Math.abs(this.views[views[i]].settings.sizey - h);
            }
        }

        // try to find by ratio
        if (!result) {
            var ratio = w / h;
            difference = 10000;

            for (var view in this.views) {
                if (view === '___settings') continue;
                if (this.views[view].settings && this.views[view].settings.useAsDefault) {
                    // If difference less than 20%
                    if (this.views[view].settings.sizey && Math.abs(ratio - (this.views[view].settings.sizex / this.views[view].settings.sizey)) < difference) {
                        result = view;
                        difference = Math.abs(ratio - (this.views[view].settings.sizex / this.views[view].settings.sizey));
                    }
                }
            }
        }

        if (!result && resultRequiredOrX) {
            for (view in this.views) {
                if (view === '___settings') continue;
                return view;
            }
        }

        return result;
    },
    orientationChange: function () {
        if (this.resolutionTimer) return;
        var that = this;
        this.resolutionTimer = setTimeout(function () {
            that.resolutionTimer = null;
            var view = that.findNearestResolution();
            if (view && view !== that.activeView) {
                that.changeView(view);
            }
        }, 200);
    },
    detectBounce: function (el, isUp) {
        if (!this.isTouch) return false;

        // Protect against two events
        var now = (new Date()).getTime();
        //console.log('gclick: ' + this.lastChange + ' ' + (now - this.lastChange));
        if (this.lastChange && now - this.lastChange < 700) {
            //console.log('gclick: filtered');
            return true;
        }
        var $el = $(el);
        var tag = $(el).prop('tagName').toLowerCase();
        while (tag !== 'div') {
            $el = $el.parent();
            tag = $el.prop('tagName').toLowerCase();
        }
        var lastClick = $el.data(isUp ? 'lcu' : 'lc');
        //console.log('click: ' + lastClick + ' ' + (now - lastClick));
        if (lastClick && now - lastClick < 700) {
            //console.log('click: filtered');
            return true;
        }
        $el.data(isUp ? 'lcu' : 'lc', now);
        return false;
    },
    createDemoStates: function () {
        // Create demo variables
        vis.states.attr({'demoTemperature.val': 25.4});
        vis.states.attr({'demoHumidity.val': 55});
    },
    getHistory: function (id, options, callback) {
        // Possible options:
        // - **instance - (mandatory) sql.x or history.y
        // - **start** - (optional) time in ms - *new Date().getTime()*'
        // - **end** - (optional) time in ms - *new Date().getTime()*', by default is (now + 5000 seconds)
        // - **step** - (optional) used in aggregate (m4, max, min, average, total) step in ms of intervals
        // - **count** - number of values if aggregate is 'onchange' or number of intervals if other aggregate method. Count will be ignored if step is set.
        // - **from** - if *from* field should be included in answer
        // - **ack** - if *ack* field should be included in answer
        // - **q** - if *q* field should be included in answer
        // - **addId** - if *id* field should be included in answer
        // - **limit** - do not return more entries than limit
        // - **ignoreNull** - if null values should be include (false), replaced by last not null value (true) or replaced with 0 (0)
        // - **aggregate** - aggregate method:
        //    - *minmax* - used special algorithm. Splice the whole time range in small intervals and find for every interval max, min, start and end values.
        //    - *max* - Splice the whole time range in small intervals and find for every interval max value and use it for this interval (nulls will be ignored).
        //    - *min* - Same as max, but take minimal value.
        //    - *average* - Same as max, but take average value.
        //    - *total* - Same as max, but calculate total value.
        //    - *count* - Same as max, but calculate number of values (nulls will be calculated).
        //    - *none* - no aggregation

        this.conn.getHistory(id, options, callback);
    },
    findAndDestroyViews: function () {
        if (this.destroyTimeout) {
            clearTimeout(this.destroyTimeout);
            this.destroyTimeout = null;
        }
        var containers = [];
        var $createdViews = $('.vis-view');
        for (var view in this.views) {
            if (view === '___settings') continue;
            if (this.views[view].settings.alwaysRender || view === this.activeView) {
                if (containers.indexOf(view) === -1) containers.push(view);
                var $containers = $('#visview_' + view).find('.vis-view-container');
                $containers.each(function () {
                    var cview = $(this).attr('data-vis-contains');
                    if (containers.indexOf(cview) === -1) containers.push(cview);
                });
            }
        }
        var that = this;
        $createdViews.each(function () {
            var view = $(this).attr('id').substring('visview_'.length);
            // If this view is used as container
            if (containers.indexOf(view) !== -1) return;

            console.debug('Destroy ' + view);

            // Get all widgets and try to destroy them
            for (var wid in that.views[view].widgets) {
                if (!that.views[view].widgets.hasOwnProperty(wid)) continue;
                var $widget = $('#' + wid);
                if ($widget.length) {
                    try {
                        // get array of bound OIDs
                        var bound = $widget.data('bound');
                        if (bound) {
                            var bindHandler = $widget.data('bindHandler');
                            for (var b = 0; b < bound.length; b++) {
                                if (typeof bindHandler === 'function') {
                                    that.states.unbind(bound[b], bindHandler);
                                } else {
                                    that.states.unbind(bound[b], bindHandler[b]);
                                }
                            }
                            $widget.data('bindHandler', null);
                            $widget.data('bound', null);
                        }
                        // If destroy function exists => destroy it
                        var destroy = $widget.data('destroy');
                        if (typeof destroy === 'function') {

                            destroy(wid, $widget);
                        }
                    } catch (e) {
                        console.error('Cannot destroy "' + wid + '": ' + e);
                    }
                }
            }
            
            $(this).remove();
        });
    },
    destroyUnusedViews: function () {
        if (this.destroyTimeout) clearTimeout(this.destroyTimeout);
        var timeout = 30000;
        if (this.views.___settings && this.views.___settings.destroyViewsAfter !== undefined) {
            timeout = this.views.___settings.destroyViewsAfter * 1000;
        }
        if (timeout) {
            this.destroyTimeout = _setTimeout(function (that) {
                that.destroyTimeout = null;
                that.findAndDestroyViews();
            }, timeout, this);
        }
    },
    generateInstance: function () {
        if (typeof storage !== 'undefined') {
            this.instance = (Math.random() * 4294967296).toString(16);
            this.instance = '0000000' + this.instance;
            this.instance = this.instance.substring(this.instance.length - 8);
            $('#vis_instance').val(this.instance);
            storage.set(this.storageKeyInstance, this.instance);
        }
    }
};

// WebApp Cache Management
if ('applicationCache' in window) {
    window.addEventListener('load', function (e) {
        window.applicationCache.addEventListener('updateready', function (e) {
            if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                vis.showWaitScreen(true, null, _('Update found, loading new Files...'), 100);
                $('#waitText').attr('id', 'waitTextDisabled');
                $('.vis-progressbar').hide();
                try {
                    window.applicationCache.swapCache();
                } catch (_e) {
                    servConn.logError('Cannot execute window.applicationCache.swapCache - ' + _e);
                }
                setTimeout(function () {
                    window.location.reload();
                }, 1000);
            }
        }, false);
    }, false);
}

// Parse Querystring
window.onpopstate = function () {
    var match,
        pl = /\+/g,
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) {
            return decodeURIComponent(s.replace(pl, ' '));
        },
        query = window.location.search.substring(1);
    vis.urlParams = {};

    while ((match = search.exec(query))) {
        vis.urlParams[decode(match[1])] = decode(match[2]);
    }

    vis.editMode = (window.location.href.indexOf('edit.html') !== -1 || vis.urlParams.edit === '');
};
window.onpopstate();

if (!vis.editMode) {
    // Protection after view change
    $(window).on('click touchstart mousedown', function (e) {
        if (vis.lastChange) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
    });
    $(window).on('touchend mouseup', function (e) {
        vis.lastChange = null;
    });
}

function main($) {
    // parse arguments
    var args = document.location.href.split('?')[1];
    vis.args = {};
    if (args) {
        vis.projectPrefix = 'main/';
        var pos = args.indexOf('#');
        if (pos !== -1) {
            args = args.substring(0, pos);
        }
        args = args.split('&');
        for (var a = 0; a < args.length; a++) {
            var parts = args[a].split('=');
            vis.args[parts[0]] = parts[1];
            if (!parts[1]) vis.projectPrefix = parts[0] + '/';
        }
        if (vis.args.project) vis.projectPrefix = vis.args.project + '/';
    }
    // If cordova project => take cordova project name
    if (typeof app !== 'undefined') vis.projectPrefix = app.settings.project ? app.settings.project + '/' : null;

    // On some platforms, the can.js is not immediately ready
    vis.states = new can.Map({
        'nothing_selected.val': null
    });

    if (vis.editMode) {
        vis.states.__attrs = vis.states.attr;
        vis.states.attr = function (attr, val) {
            var type = typeof attr;
            if (type !== 'string' && type !== 'number') {
                for (var o in attr) {
                    // allow only dev1, dev2, ... to be bound
                    if (o.match(/^dev\d+(.val|.ack|.tc|.lc)+/)) {
                        return this.__attrs(attr, val);
                    }
                }
            } else if (arguments.length === 1) {
                if (attr.match(/^dev\d+(.val|.ack|.tc|.lc)+/)) {
                    can.__reading(this, attr);
                    return this._get(attr);
                } else {
                    return vis.states[attr];
                }
            } else {
                console.log('This is ERROR!');
                this._set(attr, val);
                return this;
            }
        };

        // binding
        vis.states.___bind = vis.states.bind;
        vis.states.bind = function (id, callback) {
            // allow only dev1, dev2, ... to be bound
            if (id.match(/^dev\d+(.val|.ack|.tc|.lc)+/)) {
                return vis.states.___bind(id, callback);
            }
            //console.log('ERROR: binding in edit mode is not allowed on ' + id);
        };
    }

    // für iOS Safari - wirklich notwendig?
    $('body').on('touchmove', function (e) {
        if (!$(e.target).closest('body').length) e.preventDefault();
    });

    vis.preloadImages(['img/disconnect.png']);

    /*$('#server-disconnect').dialog({
     modal:         true,
     closeOnEscape: false,
     autoOpen:      false,
     dialogClass:   'noTitle',
     width:         400,
     height:        90
     });*/

    $('.vis-version').html(vis.version);

    vis.showWaitScreen(true, null, _('Connecting to Server...') + '<br/>', 0);

    function compareVersion(instVersion, availVersion) {
        var instVersionArr = instVersion.replace(/beta/, '.').split('.');
        var availVersionArr = availVersion.replace(/beta/, '.').split('.');

        var updateAvailable = false;

        for (var k = 0; k < 3; k++) {
            instVersionArr[k] = parseInt(instVersionArr[k], 10);
            if (isNaN(instVersionArr[k])) instVersionArr[k] = -1;
            availVersionArr[k] = parseInt(availVersionArr[k], 10);
            if (isNaN(availVersionArr[k])) availVersionArr[k] = -1;
        }

        if (availVersionArr[0] > instVersionArr[0]) {
            updateAvailable = true;
        } else if (availVersionArr[0] === instVersionArr[0]) {
            if (availVersionArr[1] > instVersionArr[1]) {
                updateAvailable = true;
            } else if (availVersionArr[1] === instVersionArr[1]) {
                if (availVersionArr[2] > instVersionArr[2]) {
                    updateAvailable = true;
                }
            }
        }
        return updateAvailable;
    }

    vis.conn = servConn;

    // old !!!
    // First of all load project/vis-user.css
    //$('#project_css').attr('href', '/' + vis.conn.namespace + '/' + vis.projectPrefix + 'vis-user.css');
    if (typeof app === 'undefined') {
        $.ajax({
            url:      'css/vis-common-user.css',
            type:     'GET',
            dataType: 'html',
            cache:    vis.useCache,
            success:  function (data) {
                $('head').append('<style id="vis-common-user" class="vis-common-user">' + data + '</style>');
                $(document).trigger('vis-common-user');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                vis.conn.logError('Cannot load vis-common-user.css - ' + errorThrown);
                $('head').append('<style id="vis-common-user" class="vis-common-user"></style>');
                $(document).trigger('vis-common-user');
            }
        });

        $.ajax({
            url:      '/' + vis.conn.namespace + '/' + vis.projectPrefix + 'vis-user.css',
            type:     'GET',
            dataType: 'html',
            cache:    vis.useCache,
            success:  function (data) {
                $('head').append('<style id="vis-user" class="vis-user">' + data + '</style>');
                $(document).trigger('vis-user');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                vis.conn.logError('Cannot load /' + vis.conn.namespace + '/' + vis.projectPrefix + 'vis-user.css - ' + errorThrown);
                $('head').append('<style id="vis-user" class="vis-user"></style>');
                $(document).trigger('vis-user');
            }
        });
    }

    vis.conn.init(null, {
        mayReconnect: typeof app !== 'undefined' ? app.mayReconnect : null,
        onAuthError:  typeof app !== 'undefined' ? app.onAuthError  : null,
        onConnChange: function (isConnected) {
            //console.log("onConnChange isConnected="+isConnected);
            if (isConnected) {
                //$('#server-disconnect').dialog('close');
                if (vis.isFirstTime) {
                    vis.conn.getVersion(function (version) {
                        if (version) {
                            if (compareVersion(version, vis.requiredServerVersion)) {
                                vis.showMessage(_('Warning: requires Server version %s - found Server version %s - please update Server.',  vis.requiredServerVersion, version));
                            }
                        }
                        //else {
                        // Possible not authenticated, wait for request from server
                        //}
                    });

                    vis.showWaitScreen(true, _('Loading data values...') + '<br>', null, 20);
                }

                // first of all try to load views
                vis.loadRemote(function () {
                    vis.IDs = vis.IDs || [];

                    // first of all add custom scripts
                    if (!vis.editMode && vis.views && this.views.___settings) {
                        if (vis.views.___settings.scripts) {
                            var script = document.createElement('script');
                            script.innerHTML = this.views.___settings.scripts;
                            document.head.appendChild(script);
                        }
                    }

                    // Read all states from server
                    vis.conn.getStates(vis.editMode ? null: vis.IDs, function (error, data) {
                        if (error) {
                            vis.showError(error);
                        }
                        if (data) {
                            for (var id in data) {
                                var obj = data[id];
                                if (!obj) continue;

                                try {
                                    if (vis.editMode) {
                                        vis.states[id + '.val'] = obj.val;
                                        vis.states[id + '.ts']  = obj.ts;
                                        vis.states[id + '.ack'] = obj.ack;
                                        vis.states[id + '.lc']  = obj.lc;
                                        if (obj.q !== undefined) vis.states[id + '.q'] = obj.q;
                                    } else {
                                        var oo = {};
                                        oo[id + '.val'] = obj.val;
                                        oo[id + '.ts']  = obj.ts;
                                        oo[id + '.ack'] = obj.ack;
                                        oo[id + '.lc']  = obj.lc;
                                        if (obj.q !== undefined) oo[id + '.q'] = obj.q;
                                        vis.states.attr(oo);
                                    }
                                } catch (e) {
                                    vis.conn.logError('Error: can\'t create states object for ' + id + '(' + e + ')');
                                }

                                if (!vis.editMode && vis.bindings[id]) {
                                    for (var i = 0; i < vis.bindings[id].length; i++) {
                                        var widget = vis.views[vis.bindings[id][i].view].widgets[vis.bindings[id][i].widget];
                                        widget[vis.bindings[id][i].type][vis.bindings[id][i].attr] = vis.formatBinding(vis.bindings[id][i].format, vis.bindings[id][i].view, vis.bindings[id][i].widget, widget);
                                    }
                                }
                            }
                        }

                        // Create non-existing IDs
                        if (vis.IDs) {
                            var now = new Date().getTime() / 1000;
                            for (var id in vis.IDs) {
                                if (vis.states[vis.IDs[id] + '.val'] === undefined) {
                                    if (!vis.IDs[id] || !vis.IDs[id].match(/^dev\d+$/)) {
                                        console.log('Create inner vis object ' + vis.IDs[id]);
                                    }
                                    if (vis.editMode) {
                                        vis.states[id + '.val'] = 0;
                                        vis.states[id + '.ts']  = now;
                                        vis.states[id + '.ack'] = false;
                                        vis.states[id + '.lc']  = now;
                                    } else {
                                        var o = {};
                                        o[id + '.val'] = 0;
                                        o[id + '.ts']  = now;
                                        o[id + '.ack'] = false;
                                        o[id + '.lc']  = now;

                                        try {
                                            vis.states.attr(o);
                                        } catch (e) {
                                            vis.conn.logError('Error: can\'t create states object for ' + id + '(' + e + ')');
                                        }
                                    }

                                    if (!vis.editMode && vis.bindings[id]) {
                                        for (var i = 0; i < vis.bindings[id].length; i++) {
                                            var widget = vis.views[vis.bindings[id][i].view].widgets[vis.bindings[id][i].widget];
                                            widget[vis.bindings[id][i].type][vis.bindings[id][i].attr] = vis.formatBinding(vis.bindings[id][i].format, vis.bindings[id][i].view, vis.bindings[id][i].widget, widget);
                                        }
                                    }
                                }
                            }
                        }

                        if (error) {
                            console.log('Possibly not authenticated, wait for request from server');
                            // Possibly not authenticated, wait for request from server
                        } else {
                            // Get groups info
                            vis.conn.getGroups(function (err, groups) {
                                vis.userGroups = groups || {};
                                // Get Server language
                                vis.conn.getConfig(function (err, config) {
                                    systemLang = vis.args.lang || config.language || systemLang;
                                    vis.language = systemLang;
                                    vis.dateFormat = config.dateFormat;
                                    vis.isFloatComma = config.isFloatComma;
                                    translateAll();
                                    if (vis.isFirstTime) {
                                        // Init edit dialog
                                        if (vis.editMode && vis.editInit) vis.editInit();
                                        vis.isFirstTime = false;
                                        vis.init();
                                    }
                                });
                            });

                            // If metaIndex required, load it
                            if (vis.editMode) {
                                /* socket.io */
                                if (vis.isFirstTime) vis.showWaitScreen(true, _('Loading data objects...'), null, 20);

                                // Read all data objects from server
                                vis.conn.getObjects(function (err, data) {
                                    vis.objects = data;
                                    // Detect if objects are loaded
                                    for (var ob in data) {
                                        vis.objectSelector = true;
                                        break;
                                    }
                                    if (vis.editMode && vis.objectSelector) {
                                        vis.inspectWidgets(true);
                                    }
                                });
                            }

                            //console.log((new Date()) + " socket.io reconnect");
                            if (vis.isFirstTime) {
                                setTimeout(function () {
                                    if (vis.isFirstTime) {
                                        // Init edit dialog
                                        if (vis.editMode && vis.editInit) vis.editInit();
                                        vis.isFirstTime = false;
                                        vis.init();
                                    }
                                }, 1000);
                            }
                        }
                    });
                });
            } else {
                //console.log((new Date()) + " socket.io disconnect");
                //$('#server-disconnect').dialog('open');
            }
        },
        onRefresh:    function () {
            window.location.reload();
        },
        onUpdate:     function (id, state) {
            _setTimeout(function (id, state) {
                if (vis.editMode) {
                    vis.states[id + '.val'] = state.val;
                    vis.states[id + '.ts']  = state.ts;
                    vis.states[id + '.ack'] = state.ack;
                    vis.states[id + '.lc']  = state.lc;
                    if (state.q !== undefined) vis.states[id + '.q'] = state.q;
                } else {
                    var o = {};
                    // Check new model
                    o[id + '.val'] = state.val;
                    o[id + '.ts']  = state.ts;
                    o[id + '.ack'] = state.ack;
                    o[id + '.lc']  = state.lc;
                    if (state.q !== undefined) o[id + '.q'] = state.q;
                    try {
                        vis.states.attr(o);
                    } catch (e) {
                        vis.conn.logError('Error: can\'t create states object for ' + id + '(' + e + ')');
                    }
                }

                if (!vis.editMode && vis.visibility[id]) {
                    for (var i = 0; i < vis.visibility[id].length; i++) {
                        var mWidget = document.getElementById(vis.visibility[id][i].widget);
                        if (!mWidget) continue;
                        if (vis.isWidgetHidden(vis.visibility[id][i].view, vis.visibility[id][i].widget, state.val) ||
                            vis.isWidgetFilteredOut(vis.visibility[id][i].view, vis.visibility[id][i].widget)) {
                            $(mWidget).hide();
                            if (mWidget &&
                                mWidget._customHandlers &&
                                mWidget._customHandlers.onHide) {
                                mWidget._customHandlers.onHide(mWidget, id);
                            }
                        } else {
                            $(mWidget).show();
                            if (mWidget &&
                                mWidget._customHandlers &&
                                mWidget._customHandlers.onShow) {
                                mWidget._customHandlers.onShow(mWidget, id);
                            }
                        }
                    }
                }

                // process signals
                if (!vis.editMode && vis.signals[id]) {
                    for (var s = 0; s < vis.signals[id].length; s++) {
                        var signal = vis.signals[id][s];
                        var mWidget = document.getElementById(signal.widget);

                        if (!mWidget) continue;

                        if (vis.isSignalVisible(signal.view, signal.widget, signal.index, state.val)) {
                            $(mWidget).find('.vis-signal[data-index="' + signal.index + '"]').show();
                        } else {
                            $(mWidget).find('.vis-signal[data-index="' + signal.index + '"]').hide();
                        }
                    }
                }

                // Bindings on every element
                if (!vis.editMode && vis.bindings[id]) {
                    for (var i = 0; i < vis.bindings[id].length; i++) {
                        var widget = vis.views[vis.bindings[id][i].view].widgets[vis.bindings[id][i].widget];
                        var value = vis.formatBinding(vis.bindings[id][i].format, vis.bindings[id][i].view, vis.bindings[id][i].widget, widget);

                        widget[vis.bindings[id][i].type][vis.bindings[id][i].attr] = value;
                        if (vis.widgets[vis.bindings[id][i].widget] && vis.bindings[id][i].type === 'data') {
                            vis.widgets[vis.bindings[id][i].widget][vis.bindings[id][i].type + '.' + vis.bindings[id][i].attr] = value;
                        }
                        vis.reRenderWidget(vis.bindings[id][i].view, vis.bindings[id][i].widget);
                    }
                }

                // Inform other widgets, that do not support canJS
                for (var j = 0, len = vis.onChangeCallbacks.length; j < len; j++) {
                    vis.onChangeCallbacks[j].callback(vis.onChangeCallbacks[j].arg, id, state.val, state.ack);
                }
                if (vis.editMode && $.fn.selectId) $.fn.selectId('stateAll', id, state);
            }, 0, id, state);
        },
        onAuth:       function (message, salt) {
            if (vis.authRunning) {
                return;
            }
            vis.authRunning = true;
            var users;
            if (visConfig.auth.users && visConfig.auth.users.length) {
                users = '<select id="login-username" value="' + visConfig.auth.users[0] + '" class="login-input-field">';
                for (var z = 0; z < visConfig.auth.users.length; z++) {
                    users += '<option value="' + visConfig.auth.users[z] + '">' + visConfig.auth.users[z] + '</option>';
                }
                users += '</select>';
            } else {
                users = '<input id="login-username" value="" type="text" autocomplete="on" class="login-input-field" placeholder="' + _('User name') + '">';
            }

            var text = '<div id="login-box" class="login-popup" style="display:none">' +
                '<div class="login-message">' + message + '</div>' +
                '<div class="login-input-field">' +
                '<label class="username">' +
                '<span class="_">' + _('User name') + '</span>' +
                users +
                '</label>' +
                '<label class="password">' +
                '<span class="_">' + _('Password') + '</span>' +
                '<input id="login-password" value="" type="password" class="login-input-field" placeholder="' + _('Password') + '">' +
                '</label>' +
                '<button class="login-button" type="button"  class="_">' + _('Sign in') + '</button>' +
                '</div>' +
                '</div>';

            // Add the mask to body            
            $('body')
                .append(text)
                .append('<div id="login-mask"></div>');

            var loginBox = $('#login-box');

            //Fade in the Popup
            $(loginBox).fadeIn(300);

            //Set the center alignment padding + border see css style
            var popMargTop = ($(loginBox).height() + 24) / 2;
            var popMargLeft = ($(loginBox).width() + 24) / 2;

            $(loginBox).css({
                'margin-top': -popMargTop,
                'margin-left': -popMargLeft
            });
            
            $('#login-mask').fadeIn(300);
            // When clicking on the button close or the mask layer the popup closed
            $('#login-password').keypress(function (e) {
                if (e.which === 13) {
                    $('.login-button').trigger('click');
                }
            });
            $('.login-button').bind('click', function () {
                var user = $('#login-username').val();
                var pass = $('#login-password').val();
                $('#login_mask , .login-popup').fadeOut(300, function () {
                    $('#login-mask').remove();
                    $('#login-box').remove();
                });
                setTimeout(function () {
                    vis.authRunning = false;
                    console.log('user ' + user + ', ' + pass + ' ' + salt);
                    vis.conn.authenticate(user, pass, salt);
                }, 500);
                return true;
            });
        },
        onCommand:    function (instance, command, data) {
            var parts;
            if (!instance || (instance !== vis.instance && instance !== 'FFFFFFFF' && instance.indexOf('*') === -1)) return false;
            if (command) {
                if (vis.editMode && command !== 'tts' && command !== 'playSound') return;
                // external Commands
                switch (command) {
                    case 'alert':
                        parts = data.split(';');
                        vis.showMessage(parts[0], parts[1], parts[2]);
                        break;
                    case 'changedView':
                        // Do nothing
                        return false;
                    case 'changeView':
                        parts = data.split('/');
                        //if (parts[1]) {
                        // Todo switch to desired project
                        //}
                        vis.changeView(parts[1] || parts[0]);
                        break;
                    case 'refresh':
                    case 'reload':
                        setTimeout(function () {
                            window.location.reload();
                        }, 1);
                        break;
                    case 'dialog':
                    case 'dialogOpen':
                        $('#' + data + '_dialog').dialog('open');
                        break;
                    case 'dialogClose':
                        $('#' + data + '_dialog').dialog('close');
                        break;
                    case 'popup':
                        window.open(data);
                        break;
                    case 'playSound':
                        setTimeout(function () {
                            var href;
                            if (data.match(/^http(s)?:\/\//)) {
                                href = data;
                            } else {
                                href = location.protocol + '//' + location.hostname + ':' + location.port + data;
                            }
                            // force read from server
                            href += '?' + (new Date()).getTime();

                            if (typeof Audio !== 'undefined') {
                                var snd = new Audio(href); // buffers automatically when created
                                snd.play();
                            } else {
                                if (!$('#external_sound').length) {
                                    $('body').append('<audio id="external_sound"></audio>');
                                }
                                $('#external_sound').attr('src', href);
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
                        vis.conn.logError('unknown external command ' + command);
                }
            }

            return true;
        },
        onObjectChange: function(id, obj) {
            if (!vis.objects || !vis.editMode) return;
            if (obj) {
                vis.objects[id] = obj;
            } else {
                if (vis.objects[id]) delete vis.objects[id];
            }

            if ($.fn.selectId) $.fn.selectId('objectAll', id, obj);
        },
        onError:      function (err) {
            if (err.arg === 'vis.0.control.instance' || err.arg === 'vis.0.control.data' || err.arg === 'vis.0.control.command') {
                console.warn('Cannot set ' + err.arg + ', because of insufficient permissions');
            } else {
                vis.showMessage(_('Cannot execute %s for %s, because of insufficient permissions', err.command, err.arg), _('Insufficient permissions'), 'alert', 600);
            }
        }
    }, vis.editMode);

    if (!vis.editMode) {
        // Listen for resize changes
        window.addEventListener('orientationchange', function () {
            vis.orientationChange();
        }, false);
        window.addEventListener('resize', function () {
            vis.orientationChange();
        }, false);
    }

    //vis.preloadImages(["../../lib/css/themes/jquery-ui/redmond/images/modalClose.png"]);
    vis.initWakeUp();
}

// Start of initialisation: main ()
if (typeof app === 'undefined') {
    $(document).ready(function () {
        main(jQuery);
    });
}

// IE8 indexOf compatibility
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) {
                return i;
            }
        }
        return -1;
    };
}
function _setTimeout(func, timeout, arg1, arg2, arg3, arg4, arg5, arg6) {
    return setTimeout(function () {
        func(arg1, arg2, arg3, arg4, arg5, arg6);
    }, timeout);
}
function _setInterval(func, timeout, arg1, arg2, arg3, arg4, arg5, arg6) {
    return setInterval(function () {
        func(arg1, arg2, arg3, arg4, arg5, arg6);
    }, timeout);
}

/*if (window.location.search === '?edit') {
    window.alert(_('please use /vis/edit.html instead of /vis/?edit'));
    location.href = './edit.html' + window.location.hash;
}*/
