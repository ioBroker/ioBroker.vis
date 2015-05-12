/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2013-2015 bluefox https://github.com/GermanBluefox, hobbyquaker https://github.com/hobbyquaker
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
        'No connection to Server': {'en': 'No connection to Server', 'de': 'Keine Verbindung zu Server', 'ru': 'Нет соединения с сервером'},
        'Loading Views...': {'en': 'Loading Views...', 'de': 'Lade Views...', 'ru': 'Загрузка пользовательских страниц...'},
        'Connecting to Server...': {'en': 'Connecting to Server...', 'de': 'Verbinde mit Server...', 'ru': 'Соединение с сервером...'},
        'Loading data objects...': {'en': 'Loading data...', 'de': 'Lade Daten...', 'ru': 'Загрузка данных...'},
        'Loading data values...':  {'en': 'Loading values...', 'de': 'Lade Werte...', 'ru': 'Загрузка значений...'},
        'error - View doesn\'t exist': {'en': 'View doesn\'t exist!', 'de': 'View existiert nicht!', 'ru': 'Страница не существует!'},
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
        }
    });
}

if (typeof systemLang !== 'undefined') systemLang = visConfig.language || systemLang;

var vis = {

    version:                '0.4.0',
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

    binds:                  {},
    onChangeCallbacks:      [],
    viewsActiveFilter:      {},
    projectPrefix:          window.location.search ? window.location.search.slice(1) + '/' : 'main/',
    navChangeCallbacks:     [],
    editMode:               false,
    language:               (typeof systemLang !== 'undefined') ? systemLang : visConfig.language,
    statesDebounce:         {},
    visibility:             {},
    bindings:               {},
    bindingsCache:          {},
    commonStyle:            null,
    _setValue: function (id, state) {
        this.conn.setState(id, state[id + '.val']);

        if (this.states.attr(id) || this.states.attr(id + '.val') !== undefined) {
            this.states.attr(state);

            // Inform other widgets, that does not support canJS
            for (var i = 0, len = this.onChangeCallbacks.length; i < len; i++) {
                this.onChangeCallbacks[i].callback(this.onChangeCallbacks[i].arg, id, state);
            }
        }
    },
    setValue: function (id, val) {
        if (!id) {
            console.log('ID is null for val=' + val);
            return;
        }

        var d = new Date();
        var t = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + " " + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
        var o = {};
        if (this.states.attr(id + '.val') != val) {
            o[id + '.lc'] = t;
        } else {
            o[id + '.lc'] = this.states.attr(id + '.lc');
        }
        o[id + '.val'] = val;
        o[id + '.ts']  = t;
        o[id + '.ack'] = false;

        // Create this value
        if (this.states.attr(id + '.val') === undefined) this.states.attr(o);

        var that = this;

        // if no de-bounce running
        if (!this.statesDebounce[id]) {
            // send control command
            this._setValue(id, o);
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
                    $('head').append(data);
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
            if (typeof visConfig.widgetSets[i] == "object") {
                if (!visConfig.widgetSets[i].depends) {
                    visConfig.widgetSets[i].depends = [];
                }
                widgetSetsObj[visConfig.widgetSets[i].name] = visConfig.widgetSets[i];

            } else {
                widgetSetsObj[visConfig.widgetSets[i]] = {depends: []};
            }
        }

        for (var view in this.views) {
            for (var id in this.views[view].widgets) {
                if (!this.views[view].widgets[id].widgetSet) {

                    // Views are not yet converted and have no widgetSet information)
                    return null;

                } else if (widgetSets.indexOf(this.views[view].widgets[id].widgetSet) == -1) {

                    var wset = this.views[view].widgets[id].widgetSet;
                    widgetSets.push(wset);

                    // Add dependencies
                    if (widgetSetsObj[wset]) {
                        for (var u = 0, ulen = widgetSetsObj[wset].depends.length; u < ulen; u++) {
                            if (widgetSets.indexOf(widgetSetsObj[wset].depends[u]) == -1) {
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
            for (var id in this.views[view].widgets) {
                // Check all attributes
                var data  = this.views[view].widgets[id].data;
                var style = this.views[view].widgets[id].style;
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
                    }  else
                    if (attr === 'max_value_id') {
                        data.max_value_oid = data[attr];
                        delete data[attr];
                        attr = 'max_value_oid';
                    }  else
                    if (attr === 'dialog_id') {
                        data.dialog_oid = data[attr];
                        delete data[attr];
                        attr = 'dialog_oid';
                    }

                    if (typeof data[attr] === 'string') {
                        var oids = this.extractBinding(data[attr]);
                        if (oids) {
                            for (var t = 0; t < oids.length; t++) {
                                if (IDs.indexOf(oids[t].systemOid) === -1) IDs.push(oids[t].systemOid);
                                if (!this.bindings[oids[t].systemOid]) this.bindings[oids[t].systemOid] = [];

                                oids[t].type = 'data';
                                oids[t].attr = attr;
                                oids[t].view = view;
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
                        } else if ((attr.match(/oid$/) || attr.match(/^oid/)) && data[attr]) {
                            if (data[attr] != 'nothing_selected' && IDs.indexOf(data[attr]) === -1) IDs.push(data[attr]);

                            // Visibility binding
                            if (attr == 'visibility-oid' && data['visibility-oid']) {
                                var oid = data['visibility-oid'];
                                if (!this.visibility[oid]) this.visibility[oid] = [];
                                this.visibility[oid].push({view: view, widget: id});
                            }
                        }
                    }
                }

                // build bindings for styles
                if (style) {
                    for (var css in style) {
                        if (typeof style[css] == 'string') {
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

            // Firts calculate how many sets to load
            for (var i = 0; i < this.widgetSets.length; i++) {
                var name = this.widgetSets[i].name || this.widgetSets[i];

                // Skip unused widget sets in non-edit mode
                if (widgetSets && widgetSets.indexOf(name) === -1) {
                    continue;
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
        if (typeof storage !== 'undefined') this.instance = storage.get(this.storageKeyInstance);
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

        // First start.
        if (!this.views) {
            this.initViewObject();
            return false;
        } else {
            this.showWaitScreen(false);
        }

        var hash = window.location.hash.substring(1);

        // View selected?
        if (!hash) {
            // Take first view in the list
            this.activeView = this.findNearestResolution(true);

            // Create default view in demo mode
            if (typeof io == 'undefined') {
                if (!this.activeView) {
                    if (!this.editMode) {
                        window.alert(_("error - View doesn't exist"));
                        window.location.href = "./edit.html";
                    } else {
                        this.views.DemoView = this.createDemoView ? this.createDemoView() : {settings: {style: {}}, widgets: {}};
                        this.activeView = "DemoView";
                        //vis.showWaitScreen(false);
                    }
                }
            }

            if (!this.activeView) {
                if (!this.editMode) {
                    window.alert(_('error - View doesn\'t exist'));
                    window.location.href = 'edit.html';
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
                window.location.href = "./edit.html";
                $.error("vis Error can't find view");
            }
        }


        $('#active_view').html(this.activeView);

        // Navigation
        $(window).bind('hashchange', function (e) {
            this.changeView(window.location.hash.slice(1));
        });

        this.bindInstance();

        // EDIT mode
        if (this.editMode) {
                this.editInitNext();
            }
        this.initialized = true;
        // If this function called earlier, it makes problems under FireFox.
        if(this.views["_project"]){
            this.renderView("_project",false,true);
        }

        this.changeView(this.activeView);
    },
    initViewObject: function () {
        if (!this.editMode) {
            window.location.href = './edit.html' + window.location.search;
        } else {
            if (window.confirm(_("no views found on server.\nCreate new %s ?", this.projectPrefix + 'vis-views.json'))) {
                this.views = {};
                this.views.DemoView = this.createDemoView ? this.createDemoView() : {settings: {style: {}}, widgets: {}};
                this.saveRemote(function () {
                    //window.location.reload();
                });
            } else {
                window.location.reload();
            }
        }
    },
    setViewSize: function (view) {
        var $view = $("#visview_" + view);
        // Because of background, set the width and height of the view
        var width = parseInt(this.views[view].settings.sizex, 10);
        var height = parseInt(this.views[view].settings.sizey, 10);
        if (!width || width < $("#vis_container").width()) {
            width = '100%';
        }
        if (!height || height < $("#vis_container").height()) {
            height = '100%';
        }
        $view.css({width: width});
        $view.css({height: height});
    },
    updateContainers: function (view) {
        var that = this;
        // Set ths views for containers
        $("#visview_" + view).find('.vis-view-container').each(function () {
            var cview = $(this).attr('data-vis-contains');
            if (!that.views[cview]) {
                $(this).html('<span style="color:red">' + _('error: view not found.') + '</span>');
            } else if (cview == view) {
                $(this).html('<span style="color:red">' + _('error: view container recursion.') + '</span>');
            } else {
                $(this).html('');
                that.renderView(cview, true);
                $('#visview_' + cview).appendTo(this);
                $('#visview_' + cview).show();
            }
        });
    },
    renderView: function (view, noThemeChange, hidden) {
        var that = this;

        if (!this.editMode && !$('#commonTheme').length) {
            console.log('Set common theme ' + this.calcCommonStyle());
            $('head').prepend('<link rel="stylesheet" type="text/css" href="lib/css/themes/jquery-ui/' + this.calcCommonStyle() + '/jquery-ui.min.css" id="commonTheme"/>');
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

        //if (!noThemeChange) {
        //    $("style[data-href$='jquery-ui.min.css']").remove();
        //    $("link[href$='jquery-ui.min.css']").remove();
        //    $("head").prepend('<link rel="stylesheet" type="text/css" href="../lib/css/themes/jquery-ui/' + vis.views[view].settings.theme + '/jquery-ui.min.css" id="jqui_theme" />');
        //    vis.additionalThemeCss(vis.views[view].settings.theme);
        //}

        if ($('#visview_' + view).html() === undefined) {

            $('#vis_container').append('<div style="display:none;" id="visview_' + view + '" class="vis-view"></div>');
            this.addViewStyle(view, this.views[view].settings.theme);

            var $view = $("#visview_" + view);
            $view.css(this.views[view].settings.style);
            if (this.views[view].settings.style.background_class) $view.addClass(this.views[view].settings.style.background_class);

            this.setViewSize(view);
            this.views[view].rerender = true;

            // Render all simple widgets
            for (var id in this.views[view].widgets) {
                // Try to complete the widgetSet information to optimize the loading of widgetSets
                if (!this.views[view].widgets[id].widgetSet) {
                    var obj = $("#" + this.views[view].widgets[id].tpl);
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
        $("#visview_" + view).find("div[id$='container']").each(function () {
            var cview = $(this).attr("data-vis-contains");
            if (!that.views[cview]) {
                $(this).append("error: view not found.");
                return false;
            } else if (cview == view) {
                $(this).append("error: view container recursion.");
                return false;
            }
            that.renderView(cview, true);
            $("#visview_" + cview).appendTo(this);
            $("#visview_" + cview).show();
        });

        if (!hidden) {
            $("#visview_" + view).show();

            if (this.views[view].rerender) {
                this.views[view].rerender = false;
                // render all copmlex widgets, like hqWidgets or bars
                for (var _id in this.views[view].widgets) {
                    if (this.views[view].widgets[_id].renderVisible) this.renderWidget(view, _id);
                }
            }
        }

        // Store modified view
        if (isViewsConverted) {
            this.saveRemote();
        }
        if (this.editMode) {
            if ($('#wid_all_lock_function').prop('checked')) {
                $(".vis-widget").addClass("vis-widget-lock");
            }
        }
        setTimeout(function(){
            $("#visview_"+view).trigger("rendered")
        })

    },
    addViewStyle: function (view, theme) {
        var _view = 'visview_' + view;
        if (this.calcCommonStyle() == theme) return;
        $.ajax({
            url: 'lib/css/themes/jquery-ui/' + theme + '/jquery-ui.min.css',
            cache: false,
            success: function (data) {
                console.log('Add theme ' + theme + ' for ' + view);
                $('#' + view + '_style').remove();
                data = data.replace('.ui-helper-hidden', '#' + _view + ' .ui-helper-hidden');
                data = data.replace(/(}.)/g, '}#' + _view + ' .');
                data = data.replace(/,\./g, ',#' + _view + ' .');
                data = data.replace(/images/g, "lib/css/themes/jquery-ui/" + theme + "/images/");
                $('#' + _view).append('<style id="' + view + '_style">' + data + '</style>');
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
        $("#" + widget).remove();
        this.renderWidget(view || this.activeView, widget);
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
                    $("#" + widget).show(showEffect, null, parseInt(showDuration));
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

        } else if (filter == "$") {
            // hide all
            for (widget in widgets) {
                mWidget = document.getElementById(widget);
                if (mWidget &&
                    mWidget._customHandlers &&
                    mWidget._customHandlers.onHide) {
                    mWidget._customHandlers.onHide(mWidget, widget);
                }
                $("#" + widget).hide(hideEffect, null, parseInt(hideDuration));
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
                        $("#" + widget).hide(hideEffect, null, parseInt(hideDuration));
                    } else {
                        $("#" + widget).show(showEffect, null, parseInt(showDuration));
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
    renderWidget: function (view, id) {
        var $view = $('#visview_' + view);
        if (!$view.length) return;

        var widget = this.views[view].widgets[id];

        //console.log("renderWidget("+view+","+id+")");
        // Add to the global array of widgets
        this.widgets[id] = {
            wid: id,
            data: new can.Map($.extend({
                "wid": id
            }, widget.data))
        };
        //console.log(widget);
        // Register oid to detect changes
        // if (widget.data.oid != 'nothing_selected')
        //   $.homematic("advisState", widget.data.oid, widget.data.hm_wid);

        var widgetData = this.widgets[id].data;

        try {
            // Append html element to view
            if (widget.data && widget.data.oid) {
                $view.append(can.view(widget.tpl, {
                    val: this.states.attr(widget.data.oid + '.val'),
                    //ts:  this.states.attr(widget.data.oid + '.ts'),
                    //ack: this.states.attr(widget.data.oid + '.ack'),
                    //lc:  this.states.attr(widget.data.oid + '.lc'),
                    data: widgetData,
                    view: view
                }));
            } else {
                $view.append(can.view(widget.tpl, {
                    data: widgetData,
                    view: view
                }));
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
            }

            if (widget.style && !widgetData._no_style) {
                $("#" + id).css(widget.style);
            }

            // If edit mode, bind on click event to open this widget in edit dialog
            if (this.editMode) {
                this.bindWidgetClick(id);

                // @SJ cannot select menu and dialogs if it is enabled
                /*if ($('#wid_all_lock_f').hasClass("ui-state-active")) {
                    $("#" + id).addClass("vis-widget-lock")
                }*/
            }

            $(document).trigger("wid_added",id)
        } catch (e) {
           this.conn.logError('Error: can\'t render ' + widget.tpl + ' ' + id + ' (' + e + ')');
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
        if (hideOptions.effect == 'show') effect = false;

        if (!this.views[view]) {
            var prop;
            for (prop in this.views) {
                // object[prop]
                break;
            }
            view = prop;
        }

        // If really changed
        if (this.activeView !== view) {
            if (effect) {
                //console.log("effect");
                this.renderView(view, true, true);

                // View ggf aus Container heraus holen
                if ($('#visview_' + view).parent().attr("id") !== 'vis_container') {
                    $('#visview_' + view).appendTo('#vis_container');
                }

                // If hide and show at the same time
                if (sync) {
                    $('#visview_' + view).show(showOptions.effect, showOptions.options, parseInt(showOptions.duration, 10), function () {
                        if (that.views[view].rerender) {
                            that.views[view].rerender = false;
                            for (var id in this.views[view].widgets) {
                                if (that.views[view].widgets[id].tpl.substring(0, 5) == "tplHq" ||
                                    that.views[view].widgets[id].renderVisible)
                                    that.renderWidget(view, id);
                            }
                        }
                    }).dequeue();
                }

                $("#visview_" + this.activeView).hide(hideOptions.effect, hideOptions.options, parseInt(hideOptions.duration, 10), function () {
                    // If first hide, than show
                    if (!sync) {
                        $("#visview_" + view).show(showOptions.effect, showOptions.options, parseInt(showOptions.duration, 10), function () {
                            if (that.views[view].rerender) {
                                that.views[view].rerender = false;
                                for (var id in that.views[view].widgets) {
                                    if (that.views[view].widgets[id].tpl.substring(0, 5) == "tplHq" ||
                                        that.views[view].widgets[id].renderVisible)
                                        that.renderWidget(view, id);
                                }
                            }
                        });
                    }
                });
            } else {

                this.renderView(view, true);

                // View ggf aus Container heraus holen
                if ($("#visview_" + view).parent().attr("id") !== "vis_container") {
                    $("#visview_" + view).appendTo("#vis_container");
                }

                //if (this.views[view] && this.views[view].settings) {
                    //if (this.views[vis.activeView] && this.views[vis.activeView].settings &&
                    //    this.views[vis.activeView].settings.theme != this.views[view].settings.theme) {
                    //    if ($("link[href$='jquery-ui.min.css']").length == 0) {
                    //        $("head").prepend('<link rel="stylesheet" type="text/css" href="../lib/css/themes/jquery-ui/' + this.views[view].settings.theme + '/jquery-ui.min.css" id="jqui_theme" />');
                    //    } else {
                    //        $("link[href$='jquery-ui.min.css']").attr("href", '../lib/css/themes/jquery-ui/' + this.views[view].settings.theme + '/jquery-ui.min.css');
                    //    }
                    //    $("style[data-href$='jquery-ui.min.css']").remove();
                    //}
                    //this.additionalThemeCss(this.views[view].settings.theme);
                //}
                $("#visview_" + view).show();
                $("#visview_" + this.activeView).hide();
            }

        } else {
            this.renderView(view);

            // View ggf aus Container heraus holen
            if ($("#visview_" + view).parent().attr("id") !== "vis_container") {
                $("#visview_" + view).appendTo("#vis_container");
            }
        }
        this.activeView = view;


        /*$('#visview_' + view).find('div[id$="container"]').each(function () {
            $('#visview_' + $(this).attr('data-vis-contains')).show();
        });*/

        this.updateContainers(view);

        if (!this.editMode) {
            this.conn.sendCommand(this.instance, 'changedView', this.projectPrefix ? (this.projectPrefix + this.activeView) : this.activeView);
        }

        if (window.location.hash.slice(1) != view) {
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


        // update resolution tool widget

        return;
    },
    loadRemote: function (callback, callbackArg) {
        var that = this;
        this.conn.readFile(this.projectPrefix + 'vis-views.json', function (err, data) {
            if (err) window.alert(that.projectPrefix + 'vis-views.json ' + err);

            if (data) {
                if (typeof data == 'string') {
                    try {
                        that.views = JSON.parse(data);
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
    saveRemoteActive: 0,
    saveRemote: function (callback) {
        var that = this;

        if (this.saveRemoteActive % 10) {
            this.saveRemoteActive--;
            setTimeout(function () {
                that.saveRemote(callback);
            }, 1000);
        }else {
            if (!this.saveRemoteActive) this.saveRemoteActive = 30;
            if (this.saveRemoteActive == 10) {
                console.log('possible no connection');
                this.saveRemoteActive = 0;
                return;
            }
            // Sync widget before it will be saved
            if (this.activeWidgets) {
                for (var t = 0; t < this.activeWidgets.length; t++) {
                    if (this.activeWidgets[t].indexOf('_') != -1 && this.syncWidgets) {
                        this.syncWidgets(this.activeWidgets);
                        break;
                    }
                }
            }

            // replace all bounded variables with initial values
            var viewsToSave = JSON.parse(JSON.stringify(this.views));
            for (var b in this.bindings) {
                for (var h = 0; h < this.bindings[b].length; h++) {
                    viewsToSave[this.bindings[b][h].view].widgets[this.bindings[b][h].widget][this.bindings[b][h].type][this.bindings[b][h].attr] = this.bindings[b][h].format;
                }
            }

            this.conn.writeFile(this.projectPrefix + 'vis-views.json', JSON.stringify(viewsToSave, null, 2), function () {
                that.saveRemoteActive = 0;
                if (callback) callback();

                // If not yet checked => check if project css file exists
                if (!that.cssChecked) {
                    that.conn.readFile(that.projectPrefix + 'vis-user.css', function (err, data) {
                        that.cssChecked = true;
                        // Create vis-user.css file if not exist
                        if (err || data === null || data === undefined) {
                            // Create empty css file
                            that.conn.writeFile(that.projectPrefix + 'vis-user.css', '');
                        }
                    });
                }
            });
        }
    },
    //additionalThemeCss: function (theme) {
    //    if (theme == "kian") {
    //        $("#additional_theme_css").remove();
    //        $("link[href$='jquery-ui.min.css']").after('<link rel="stylesheet" href="css/add_' + theme + '.css" id="additional_theme_css" type="text/css"/>');
    //    } else {
    //        $("#additional_theme_css").remove();
    //    }
    //},
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
    showMessage: function (message, title, icon, width) {
        if (!this.$dialogMessage) {
            this.$dialogMessage = $('#dialog-message');
            this.$dialogMessage.dialog({
                autoOpen: false,
                modal:    true,
                open: function () {
                    $(this).parent().css({'z-index': 1001});
                },
                buttons: [
                    {
                        text: _('Ok'),
                        click: function () {
                            $(this).dialog('close');
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
        if (icon) {
            $('#dialog-message-icon').show();
            $('#dialog-message-icon').attr('class', '');
            $('#dialog-message-icon').addClass('ui-icon ui-icon-' + icon);
        } else {
            $('#dialog-message-icon').hide();
        }
        this.$dialogMessage.dialog('open');
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
                setTimeout(function (_val) {
                    $(".vis-progressbar").progressbar("value", _val);
                }, 0, this.waitScreenVal);

            }
        } else if (waitScreen) {
            $(waitScreen).remove();
        }
    },
    registerOnChange: function (callback, arg) {
        for (var i = 0, len = this.onChangeCallbacks.length; i < len; i++) {
            if (this.onChangeCallbacks[i].callback == callback &&
                this.onChangeCallbacks[i].arg == arg) {
                return;
            }
        }
        this.onChangeCallbacks[this.onChangeCallbacks.length] = {callback: callback, arg: arg};
    },
    unregisterOnChange: function (callback, arg) {
        for (var i = 0, len = this.onChangeCallbacks.length; i < len; i++) {
            if (this.onChangeCallbacks[i].callback == callback &&
                (arg === undefined || this.onChangeCallbacks[i].arg == arg)) {
                this.onChangeCallbacks.slice(i, 1);
                return;
            }
        }
    },
    isWidgetHidden: function (view, widget, val) {
        var oid = this.views[view].widgets[widget].data['visibility-oid'];
        if (oid) {
            if (val === undefined) val = this.states.attr(oid + '.val');
            if (val === undefined) return false;

            var condition = this.views[view].widgets[widget].data['visibility-cond'];
            var value     = this.views[view].widgets[widget].data['visibility-val'];

            if (!condition || value === undefined) return false;

            var t = typeof val;
            if (t == 'boolean') {
                value = (value === 'true' || value === true || value === 1);
            } else if (t == 'number') {
                value = parseFloat(value);
            }  else if (t == 'object') {
                val = JSON.stringify(val);
            }

            // Take care: return true if widget is hidden!
            switch (condition) {
                case '==':
                    return value != val;
                case '!=':
                    return value == val;
                case '>=':
                    return val < value;
                case '<=':
                    return val > value;
                case '>':
                    return val <= value;
                case '<':
                    return val >= value;
                case 'consist':
                    return (val.toString().indexOf(value) === -1);
                default:
                    console.log('Unknown visibility condition for ' + widget + ': ' + condition);
                    return false;
            }
        } else {
            return false;
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
            for (var view in this.views) {
                if (this.views[view].settings.theme && styles[this.views[view].settings.theme]) {
                    styles[this.views[view].settings.theme]++;
                } else {
                    styles[this.views[view].settings.theme] = 1;
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
    formatDate: function formatDate(dateObj, isSeconds, _format) {
        if (typeof isSeconds != 'boolean') {
            _format = isSeconds;
            isSeconds = false;
        }

        var format = _format || 'DD.MM.YYYY';

        if (!dateObj) return '';
        if (typeof dateObj != 'object') dateObj = isSeconds ? new Date(dateObj * 1000) : new Date(dateObj);

        var v;
        // Year
        if (format.indexOf('YYYY') != -1 || format.indexOf('JJJJ') != -1 || format.indexOf('ГГГГ') != -1) {
            v = dateObj.getFullYear();
            format = format.replace('YYYY', v);
            format = format.replace('JJJJ', v);
            format = format.replace('ГГГГ', v);
        } else if (format.indexOf('YY') != -1 || format.indexOf('JJ') != -1 || format.indexOf('ГГ') != -1) {
            v = dateObj.getFullYear() % 100;
            format = format.replace('YY', v);
            format = format.replace('JJ', v);
            format = format.replace('ГГ', v);
        }
        // Month
        if (format.indexOf('MM') != -1 || format.indexOf('ММ') != -1) {
            v =  dateObj.getMonth() + 1;
            if (v < 10) v = '0' + v;
            format = format.replace('MM', v);
            format = format.replace('ММ', v);
        } else if (format.indexOf('M') != -1 || format.indexOf('М') != -1) {
            v =  dateObj.getMonth() + 1;
            format = format.replace('M', v);
            format = format.replace('М', v);
        }

        // Day
        if (format.indexOf('DD') != -1 || format.indexOf('TT') != -1 || format.indexOf('ДД') != -1) {
            v =  dateObj.getDate();
            if (v < 10) v = '0' + v;
            format = format.replace('DD', v);
            format = format.replace('TT', v);
            format = format.replace('ДД', v);
        } else if (format.indexOf('D') != -1 || format.indexOf('TT') != -1 || format.indexOf('Д') != -1) {
            v =  dateObj.getDate();
            format = format.replace('D', v);
            format = format.replace('T', v);
            format = format.replace('Д', v);
        }

        // hours
        if (format.indexOf('hh') != -1 || format.indexOf('SS') != -1 || format.indexOf('чч') != -1) {
            v =  dateObj.getHours();
            if (v < 10) v = '0' + v;
            format = format.replace('hh', v);
            format = format.replace('SS', v);
            format = format.replace('чч', v);
        } else if (format.indexOf('h') != -1 || format.indexOf('S') != -1 || format.indexOf('ч') != -1) {
            v =  dateObj.getHours();
            format = format.replace('h', v);
            format = format.replace('S', v);
            format = format.replace('ч', v);
        }

        // minutes
        if (format.indexOf('mm') != -1 || format.indexOf('мм') != -1) {
            v =  dateObj.getMinutes();
            if (v < 10) v = '0' + v;
            format = format.replace('mm', v);
            format = format.replace('мм', v);
        } else if (format.indexOf('m') != -1 ||  format.indexOf('м') != -1) {
            v =  dateObj.getMinutes();
            format = format.replace('m', v);
            format = format.replace('v', v);
        }

        // seconds
        if (format.indexOf('ss') != -1 || format.indexOf('сс') != -1) {
            v =  dateObj.getSeconds();
            if (v < 10) v = '0' + v;
            format = format.replace('ss', v);
            format = format.replace('cc', v);
        } else if (format.indexOf('s') != -1 || format.indexOf('с') != -1) {
            v =  dateObj.getHours();
            format = format.replace('s', v);
            format = format.replace('с', v);
        }
        return format;
    },
    extractBinding: function (format) {
        if (this.editMode) return null;
        if (this.bindingsCache[format]) return JSON.parse(JSON.stringify(this.bindingsCache[format]));

        var oid = format.match(/{(.+?)}/g);
        var result = null;
        if (oid) {
            for (var p = 0; p < oid.length; p++) {
                var _oid = oid[p].substring(1, oid[p].length - 1);
                var parts = _oid.split(';');
                result = result || [];
                var systemOid = parts[0].trim();
                var visOid    = systemOid;

                var test1 = visOid.substring(visOid.length - 4);
                var test2 = visOid.substring(visOid.length - 3);
                if (test1 !== '.val' && test2 != '.ts' && test2 != '.lc' && test1 != '.ack') {
                    visOid = visOid + '.val';
                }

                var isSeconds = (test2 == '.ts' || test2 == '.lc');

                var test1 = systemOid.substring(systemOid.length - 4);
                var test2 = systemOid.substring(systemOid.length - 3);
                if (test1 === '.val' || test1 === '.ack') {
                    systemOid = systemOid.substring(0, systemOid.length - 4);
                } else if (test2 === '.lc' || test2 === '.ts') {
                    systemOid = systemOid.substring(0, systemOid.length - 3);
                }
                var operations = null;
                var isEval = visOid.indexOf(':') != -1;

                if (isEval) {
                    var xx = visOid.split(':', 2);
                    var yy = systemOid.split(':', 2);
                    visOid = xx[1];
                    systemOid = yy[1];
                    operations = operations || [];
                    operations.push({
                        op: 'eval',
                        arg: [{
                            name:      xx[0],
                            visOid:    xx[1],
                            systemOid: yy[1]
                        }]
                    });
                }


                for (var u = 1; u < parts.length; u++) {
                    // eval construction
                    if (isEval) {
                        if (parts[u].indexOf(':') != -1) {
                            var _systemOid = parts[u].trim();
                            var _visOid    = _systemOid;

                            var test1 = _visOid.substring(_visOid.length - 4);
                            var test2 = _visOid.substring(_visOid.length - 3);
                            if (test1 !== '.val' && test2 != '.ts' && test2 != '.lc' && test1 != '.ack') {
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
                            // operators requires paremeter
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
                            if (parse[1] == 'date') {
                                operations = operations || [];
                                parse[2] = parse[2].trim();
                                parse[2] = parse[2].substring(1, parse[2].length - 1);
                                operations.push({op: parse[1], arg: parse[2]});
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
    formatBinding: function (format) {
        var oids = this.extractBinding(format);
        for (var t = 0; t < oids.length; t++) {
            var value = this.states.attr(oids[t].visOid);
            if (oids[t].operations) {
                for (var k = 0; k < oids[t].operations.length; k++) {
                    if (oids[t].operations[k].op === 'eval') {
                        var string = '';//'(function() {';
                        for (var a = 0; a < oids[t].operations[k].arg.length; a++) {
                            string += 'var ' + oids[t].operations[k].arg[a].name + ' = "' + this.states.attr(oids[t].operations[k].arg[a].visOid) + '";';
                        }
                        string += 'return ' + oids[t].operations[k].formula + ';';
                        //string += '}())';
                        try{
                            value = new Function(string)();
                        } catch(e)
                        {
                            console.log('Error in eval: ' + string);
                            value = 0;
                        }
                    } else
                    if (oids[t].operations[k].op === '*' && oids[t].operations[k].arg !== undefined) {
                        value = parseFloat(value) * oids[t].operations[k].arg;
                    } else
                    if (oids[t].operations[k].op === '/' && oids[t].operations[k].arg !== undefined) {
                        value = parseFloat(value) / oids[t].operations[k].arg;
                    } else
                    if (oids[t].operations[k].op === '+' && oids[t].operations[k].arg !== undefined) {
                        value = parseFloat(value) + oids[t].operations[k].arg;
                    } else
                    if (oids[t].operations[k].op === '-' && oids[t].operations[k].arg !== undefined) {
                        value = parseFloat(value) - oids[t].operations[k].arg;
                    } else
                    if (oids[t].operations[k].op === '%' && oids[t].operations[k].arg !== undefined) {
                        value = parseFloat(value) % oids[t].operations[k].arg;
                    } else
                    if (oids[t].operations[k].op === 'round') {
                        if (oids[t].operations[k].arg === undefined) {
                            value = Math.round(parseFloat(value));
                        } else {
                            value = parseFloat(value).toFixed(oids[t].operations[k].arg);
                        }
                    } else
                    if (oids[t].operations[k].op === 'pow') {
                        if (oids[t].operations[k].arg === undefined) {
                            value = Math.pow(parseFloat(value), 2);
                        } else {
                            value = Math.pow(parseFloat(value), oids[t].operations[k].arg);
                        }
                    } else
                    if (oids[t].operations[k].op === 'sqrt') {
                        value = Math.sqrt(parseFloat(value));
                    } else
                    if (oids[t].operations[k].op === 'hex') {
                        value = Math.round(parseFloat(value)).toString(16);
                    } else
                    if (oids[t].operations[k].op === 'hex2') {
                        value = Math.round(parseFloat(value)).toString(16);
                        if (value.length < 2) value = '0' + value;
                    } else
                    if (oids[t].operations[k].op === 'HEX') {
                        value = Math.round(parseFloat(value)).toString(16).toUpperCase();
                    } else
                    if (oids[t].operations[k].op === 'HEX2') {
                        value = Math.round(parseFloat(value)).toString(16).toUpperCase();
                        if (value.length < 2) value = '0' + value;
                    } else
                    if (oids[t].operations[k].op === 'date') {
                        var number = parseInt(value);

                        // This seconds or milliseconds
                        if (number.toString() == value) {
                            value = this.formatDate(value, oids[t].isSeconds, oids[t].operations[k].arg);
                        } else {
                            value = this.formatDate(value, false, oids[t].operations[k].arg);
                        }
                    } else
                    if (oids[t].operations[k].op === 'min') {
                        value = parseFloat(value);
                        value = (value < oids[t].operations[k].arg) ? oids[t].operations[k].arg : value;
                    } else
                    if (oids[t].operations[k].op === 'max') {
                        value = parseFloat(value);
                        value = (value > oids[t].operations[k].arg) ? oids[t].operations[k].arg : value;
                    } else
                    if (oids[t].operations[k].op === 'random') {
                        if (oids[t].operations[k].arg === undefined) {
                            value = Math.random();
                        } else {
                            value = Math.random() * oids[t].operations[k].arg;
                        }
                    } else
                    if (oids[t].operations[k].op === 'floor') {
                        value = Math.floor(parseFloat(value));
                    } else
                    if (oids[t].operations[k].op === 'ceil') {
                        value = Math.ceil(parseFloat(value));
                    }
                }
            }
            format = format.replace(oids[t].token, value);
        }
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
            if (view && view != that.activeView) {
                that.changeView(view);
            }
        }, 200);
    }
};

// WebApp Cache Management
if ('applicationCache' in window) {
    window.addEventListener('load', function (e) {
        window.applicationCache.addEventListener('updateready', function (e) {
            if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                vis.showWaitScreen(true, null, _('Update found, loading new Files...'), 100);
                $("#waitText").attr("id", "waitTextDisabled");
                $(".vis-progressbar").hide();
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

    vis.editMode = (window.location.href.indexOf('edit.html') != -1 || vis.urlParams.edit === '');
};
window.onpopstate();

// Start of initialisation: main ()
(function ($) {
    $(document).ready(function () {
        // On some platforms, the can.js is not immediately ready
        vis.states = new can.Map({
            'nothing_selected.val': null
        });

        if (vis.editMode) {
            vis.states.attr = function (attr, val) {
                var type = typeof attr;
                if (type !== 'string' && type !== 'number') {
                    for (var o in attr) {
                        // allow only dev1, dev2, ... to be bound
                        if (o.match(/^dev\d+(.val|.ack|.tc|.lc)+/)) {
                            return this._attrs(attr, val);
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
            if (!$(e.target).closest("body").length) e.preventDefault();
        });

        vis.preloadImages(["img/disconnect.png"]);

        $("#server-disconnect").dialog({
            modal:         true,
            closeOnEscape: false,
            autoOpen:      false,
            dialogClass:   'noTitle',
            width:         400,
            height:        90
        });

        $(".vis-version").html(vis.version);

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
            } else if (availVersionArr[0] == instVersionArr[0]) {
                if (availVersionArr[1] > instVersionArr[1]) {
                    updateAvailable = true;
                } else if (availVersionArr[1] == instVersionArr[1]) {
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

        $.ajax({
            url:      'css/vis-common-user.css',
            type:     'GET',
            dataType: 'html',
            cache:    this.useCache,
            success:  function (data) {
                $('head').append('<style id="vis-common-user">' + data + '</style>');
                $(document).trigger('vis-common-user');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                vis.conn.logError('Cannot load vis-common-user.css - ' + errorThrown);
                $('head').append('<style id="vis-common-user"></style>');
                $(document).trigger('vis-common-user');
            }
        });

        $.ajax({
            url:      '/' + vis.conn.namespace + '/' + vis.projectPrefix + 'vis-user.css',
            type:     'GET',
            dataType: 'html',
            cache:    this.useCache,
            success:  function (data) {
                $('head').append('<style id="vis-user">' + data + '</style>');
                $(document).trigger('vis-user');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                vis.conn.logError('Cannot load /' + vis.conn.namespace + '/' + vis.projectPrefix + 'vis-user.css - ' + errorThrown);
                $('head').append('<style id="vis-user"></style>');
                $(document).trigger('vis-user');
            }
        });

        vis.conn.init(null, {
            onConnChange: function (isConnected) {
                //console.log("onConnChange isConnected="+isConnected);
                if (isConnected) {
                    $("#server-disconnect").dialog("close");
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
                        // Read all states from server
                        vis.conn.getStates(vis.editMode ? null: vis.IDs, function (error, data) {
                            if (data) {
                                for (var id in data) {
                                    var obj = data[id];

                                    try {
                                        if (vis.editMode) {
                                            vis.states[id + '.val'] = obj.val;
                                            vis.states[id + '.ts']  = obj.ts;
                                            vis.states[id + '.ack'] = obj.ack;
                                            vis.states[id + '.lc']  = obj.lc;
                                        } else {
                                            var o = {};
                                            o[id + '.val'] = obj.val;
                                            o[id + '.ts']  = obj.ts;
                                            o[id + '.ack'] = obj.ack;
                                            o[id + '.lc']  = obj.lc;
                                            vis.states.attr(o);
                                        }
                                    } catch (e) {
                                        vis.conn.logError('Error: can\'t create states object for ' + id + '(' + e + ')');
                                    }

                                    if (!vis.editMode && vis.bindings[id]) {
                                        for (var i = 0; i < vis.bindings[id].length; i++) {
                                            vis.views[vis.bindings[id][i].view].widgets[vis.bindings[id][i].widget][vis.bindings[id][i].type][vis.bindings[id][i].attr] = vis.formatBinding(vis.bindings[id][i].format);
                                        }
                                    }
                                }
                            }

                            // Create non-existing IDs
                            if (vis.IDs) {
                                var now = new Date().getTime() / 1000;
                                for (var id in vis.IDs) {
                                    if (vis.states[vis.IDs[id] + '.val'] === undefined) {
                                        if (!vis.IDs[id].match(/^dev\d+$/)) {
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
                                                vis.views[vis.bindings[id][i].view].widgets[vis.bindings[id][i].widget][vis.bindings[id][i].type][vis.bindings[id][i].attr] = vis.formatBinding(vis.bindings[id][i].format);
                                            }
                                        }
                                    }
                                }
                            }

                            if (error) {
                                console.log("Possibly not authenticated, wait for request from server");
                                // Possibly not authenticated, wait for request from server
                            } else {
                                // Get Server language
                                vis.conn.getConfig(function (err, config) {
                                    systemLang = config.language || systemLang;
                                    vis.language = systemLang;
                                    vis.dateFormat = config.dateFormat;
                                    translateAll();
                                    if (vis.isFirstTime) {
                                        // Init edit dialog
                                        if (vis.editMode && vis.editInit) vis.editInit();
                                        vis.isFirstTime = false;
                                        vis.init();
                                    }
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
                    $("#server-disconnect").dialog("open");
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
                    } else {
                        var o = {};
                        // Check new model
                        o[id + '.val'] = state.val;
                        o[id + '.ts']  = state.ts;
                        o[id + '.ack'] = state.ack;
                        o[id + '.lc']  = state.lc;
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

                    // Bindings on every element
                    if (!vis.editMode && vis.bindings[id]) {
                        for (var i = 0; i < vis.bindings[id].length; i++) {
                            var value = vis.formatBinding(vis.bindings[id][i].format);

                            vis.views[vis.bindings[id][i].view].widgets[vis.bindings[id][i].widget][vis.bindings[id][i].type][vis.bindings[id][i].attr] = value;
                            if (vis.widgets[vis.bindings[id][i].widget] && vis.bindings[id][i].type == 'data') {
                                vis.widgets[vis.bindings[id][i].widget][vis.bindings[id][i].type + '.' + vis.bindings[id][i].attr] = value;
                            }
                            vis.reRenderWidget(vis.bindings[id][i].view, vis.bindings[id][i].widget);
                        }
                    }

                    // Inform other widgets, that do not support canJS
                    for (var j = 0, len = vis.onChangeCallbacks.length; j < len; j++) {
                        vis.onChangeCallbacks[j].callback(vis.onChangeCallbacks[j].arg, id, state.val, state.ack);
                    }
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

                $('body').append(text);

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

                // Add the mask to body
                $('body').append('<div id="login-mask"></div>');
                $('#login-mask').fadeIn(300);
                // When clicking on the button close or the mask layer the popup closed
                $('#login-password').keypress(function (e) {
                    if (e.which == 13) {
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
                        console.log("user " + user + ", " + pass + " " + salt);
                        vis.conn.authenticate(user, pass, salt);
                    }, 500);
                    return true;
                });
            },
            onCommand:    function (instance, command, data) {
                var parts;
                if (instance != vis.instance && instance != 'FFFFFFFF') return false;
                if (command) {
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
                            $('#' + data + '_dialog').dialog('open');
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

                                if (typeof Audio != 'undefined') {
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
                        default:
                            vis.conn.logError('unknown external command ' + command);
                    }
                }

                return true;
            }
        });

        if (!vis.editMode) {
            // Listen for resize changes
            window.addEventListener("orientationchange", function () {
                vis.orientationChange();
            }, false);
            window.addEventListener("resize", function () {
                vis.orientationChange();
            }, false);
        }
    });

    //vis.preloadImages(["../lib/css/themes/jquery-ui/redmond/images/modalClose.png"]);

    vis.initWakeUp();
})(jQuery);

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

if (window.location.search == "?edit") {
    window.alert(_('please use /vis/edit.html instead of /vis/?edit'));
    location.href = './edit.html' + window.location.hash;
}
