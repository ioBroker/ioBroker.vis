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
/* global document*/
/* global console*/
/* global session*/
/* global window*/
/* global location*/
/* global setTimeout*/
/* global clearTimeout*/
/* global io*/
/* global $*/
"use strict";

// we should detect either local path here and not online.
// I want to have possibility to start vis not only from broker web server, but from some others too.

// ok But I need the local flag in Webstorm too (faster Page reload) 
var local = false;
if (document.URL.split('/local/')[1] || document.URL.split('/localhost:63343/')[1] || document.URL.split('/localhost:63342/')[1]) {
    local = true;
}


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

if (typeof systemLang != 'undefined') systemLang = visConfig.language || systemLang;

var vis = {

    version:                '0.2.3',
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
    useCache:               true,
    authRunning:            false,
    cssChecked:             false,

    binds:                  {},
    onChangeCallbacks:      [],
    viewsActiveFilter:      {},
    projectPrefix:          window.location.search ? window.location.search.slice(1) + '/' : 'main/',
    navChangeCallbacks:     [],
    editMode:               false,
    language:               (typeof systemLang != 'undefined') ? systemLang : visConfig.language,
    statesDebounce:         {},

    _setValue: function (id, state) {
        this.conn.setState(id, state[id + '.val']);

        if (this.states[id] || this.states[id + '.val'] !== undefined) {
            this.states.attr(state);

            // Inform other widgets, that does not support canJS
            for (var i = 0, len = this.onChangeCallbacks.length; i < len; i++) {
                this.onChangeCallbacks[i].callback(this.onChangeCallbacks[i].arg, id, val);
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
        if (this.states.attr(id + '.val') === undefined) {
            vis.states.attr(o);
        }

        var that = this;

        // if no de-bounce running
        if (!this.statesDebounce[id]) {
            // send control command
            this._setValue(id, o);
            // Start timeout
            this.statesDebounce[id] = {
                timeout: _setTimeout(function () {
                        if (that.statesDebounce[id].state) that._setValue(id, that.statesDebounce[id].state);
                        delete that.statesDebounce[id];
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

        if (!vis.views) return null;

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

        for (var view in vis.views) {
            for (var id in vis.views[view].widgets) {
                if (!vis.views[view].widgets[id].widgetSet) {

                    // Views are not yet converted and have no widgetSet information)
                    return null;

                } else if (widgetSets.indexOf(vis.views[view].widgets[id].widgetSet) == -1) {

                    var wset = vis.views[view].widgets[id].widgetSet;
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
    loadWidgetSets: function (callback) {
        this.showWaitScreen(true, '<br>' + _('Loading Widget-Sets...') + ' <span id="widgetset_counter"></span>', null, 20);
        var arrSets = [];

        // Get list of used widget sets. if Edit mode list is null.
        var widgetSets = this.editMode ? null : this.getUsedWidgetSets();

        // Firts calculate how many sets to load
        for (var i = 0; i < this.widgetSets.length; i++) {
            var name = this.widgetSets[i].name || this.widgetSets[i];

            // Skip unused widget sets in non-edit mode
            if (widgetSets && widgetSets.indexOf(name) == -1) {
                continue;
            }

            arrSets[arrSets.length] = name;

            if (this.editMode && this.widgetSets[i].edit) {
                arrSets[arrSets.length] = this.widgetSets[i].edit;
            }
        }
        this.toLoadSetsCount = arrSets.length;
        $("#widgetset_counter").html("<span style='font-size:10px'>(" + (vis.toLoadSetsCount) + ")</span>");

        var that = this;
        if (this.toLoadSetsCount) {
            for (var j = 0, len = this.toLoadSetsCount; j < len; j++) {
                _setTimeout(function (_i) {
                    that.loadWidgetSet(arrSets[_i], callback);
                }, 100, j);
            }
        } else {
            if (callback) {
                callback();
            }
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
        this.loadRemote(function () {
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
                for (var view in this.views) {
                    this.activeView = view;
                    break;
                }
                // Create default view in demo mode
                if (typeof io == 'undefined') {
                    if (!this.activeView) {
                        if (!this.editMode) {
                            alert(_("error - View doesn't exist"));
                            window.location.href = "./edit.html";
                        } else {
                            this.views.DemoView = this.createDemoView ? this.createDemoView() : {settings: {style: {}}, widgets: {}};
                            this.activeView = "DemoView";
                            //vis.showWaitScreen(false);
                        }
                    }
                }

                if (this.activeView == '') {
                    if (!this.editMode) {
                        alert(_('error - View doesn\'t exist'));
                        window.location.href = 'edit.html';
                    } else {
                        // All views were deleted, but file exists. Create demo View
                        //alert("unexpected error - this should not happen :(");
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
                    alert(_("error - View doesn't exist"));
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
            this.changeView(this.activeView);



        });
    },
    initViewObject: function () {
        if (!this.editMode) {
            window.location.href = './edit.html' + window.location.search;
        } else {
            if (confirm(_("no views found on server.\nCreate new %s ?", this.projectPrefix + 'vis-views.json'))) {
                this.views = {};
                this.views.DemoView = this.createDemoView ? this.createDemoView() : {settings: {style: {}}, widgets: {}};
                this.saveRemote(function () {
                    window.location.reload()
                });
            } else {
                window.location.reload();
            }
        }
    },
    setViewSize: function (view) {
        var $view = $("#visview_" + view);
        // Because of background, set the width and height of the view
        var width = parseInt(vis.views[view].settings.sizex, 10);
        var height = parseInt(vis.views[view].settings.sizey, 10);
        if (!width || width < $(window).width()) {
            width = '100%';
        }
        if (!height || height < $(window).height()) {
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
        if (!this.views[view] || !this.views[view].settings) {
            alert('Cannot render view ' + view + '. Invalid settings');
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
            if (!vis.views[cview]) {
                $(this).append("error: view not found.");
                return false;
            } else if (cview == view) {
                $(this).append("error: view container recursion.");
                return false;
            }
            vis.renderView(cview, true);
            $("#visview_" + cview).appendTo(this);
            $("#visview_" + cview).show();
        });

        if (!hidden) {
            $("#visview_" + view).show();

            if (this.views[view].rerender) {
                this.views[view].rerender = false;
                // render all copmlex widgets, like hqWidgets or bars
                for (var id in this.views[view].widgets) {
                    if (this.views[view].widgets[id].renderVisible) {
                        this.renderWidget(view, id);
                    }
                }
            }
        }

        // Store modified view
        if (isViewsConverted) {
            this.saveRemote();
        }
    },
    addViewStyle: function (view,theme) {
        var _view = 'visview_' + view;
        $.ajax({
            url: 'lib/css/themes/jquery-ui/' + theme + '/jquery-ui.min.css',
            cache: false,
            success: function (data) {
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
    reRenderWidget: function (widget) {
        $("#" + widget).remove();
        this.renderWidget(this.activeView, widget);
    },
    changeFilter: function (filter, showEffect, showDuration, hideEffect, hideDuration) {
        var widgets = this.views[vis.activeView].widgets;
        var that = this;
        if (filter == "") {
            // show all
            for (var widget in widgets) {
                if (widgets[widget].data.filterkey && widgets[widget].data.filterkey != "") {
                    $("#" + widget).show(showEffect, null, parseInt(showDuration));
                }
            }
            // Show complex widgets
            setTimeout(function () {
                var mWidget;
                for (var widget in widgets) {
                    mWidget = document.getElementById(widget);
                    if (widgets[widget].data.filterkey &&
                        widgets[widget].data.filterkey != "" &&
                        mWidget &&
                        mWidget._customHandlers &&
                        mWidget._customHandlers.onShow) {
                        mWidget._customHandlers.onShow(mWidget, widget);
                    }
                }
            }, parseInt(showDuration) + 10);

        } else if (filter == "$") {
            var mWidget;
            // hide all
            for (var widget in widgets) {
                mWidget = document.getElementById(widget);
                if (mWidget &&
                    mWidget._customHandlers &&
                    mWidget._customHandlers.onHide) {
                    mWidget._customHandlers.onHide(mWidget, widget);
                }
                $("#" + widget).hide(hideEffect, null, parseInt(hideDuration));
            }
        } else {
            this.viewsActiveFilter[vis.activeView] = filter.split(",");
            var mWidget;
            for (var widget in widgets) {
                //console.log(widgets[widget]);
                if (widgets[widget].data.filterkey && widgets[widget].data.filterkey != "") {
                    if (this.viewsActiveFilter[this.activeView].length > 0 && this.viewsActiveFilter[this.activeView].indexOf(widgets[widget].data.filterkey) == -1) {
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
                        if (widgets[widget].data.filterkey && widgets[widget].data.filterkey != "") {
                            if (!(that.viewsActiveFilter[that.activeView].length > 0 && that.viewsActiveFilter[that.activeView].indexOf(widgets[widget].data.filterkey) == -1)) {
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
                $('#visview_' + view).append(can.view(widget.tpl, {
                    val: this.states[widget.data.oid + '.val'],
                    ts:  this.states[widget.data.oid + '.ts'],
                    ack: this.states[widget.data.oid + '.ack'],
                    lc:  this.states[widget.data.oid + '.lc'],
                    data: widgetData,
                    view: view
                }));
            } else {
                $('#visview_' + view).append(can.view(widget.tpl, {data: widgetData, view: view}));
            }

            if (!this.editMode) {
                if (widget.data.filterkey && widget.data.filterkey != "" && this.viewsActiveFilter[view].length > 0 && this.viewsActiveFilter[view].indexOf(widget.data.filterkey) == -1) {
                    var mWidget = document.getElementById(id);
                    $('#' + id).hide();
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
        } catch (e) {
            this.conn.logError('Error: can\'t render ' + widget.tpl + ' ' + id + ' (' + e + ')');
        }
    },
    changeView: function (view, hideOptions, showOptions, sync) {
        var that = this;
        var effect = (hideOptions !== undefined) && (hideOptions.effect !== undefined) && (hideOptions.effect != "");
        if (!effect) {
            effect = (showOptions !== undefined) && (showOptions.effect !== undefined) && (showOptions.effect != "")
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

        if (!this.editMode && this.instance) {
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

        return;
    },
    loadRemote: function (callback, callbackArg) {
        var that = this;
        if (local) {
            try {
                this.showWaitScreen(true, '<br/>' + _('Loading Views...') + '<br/>', null, 12.5);
                that.views = JSON.parse(storage.get(this.storageKeyViews));
                if (callback) callback.call(that, callbackArg);
            } catch (err) {
                that.views = null
                if (callback) callback.call(that, callbackArg);
            }

        } else {

            this.conn.readFile(this.projectPrefix + 'vis-views.json', function (err, data) {
                if (err) alert(that.projectPrefix + 'vis-views.json ' + err);

                if (data) {
                    if (typeof data == 'string') {
                        try {
                            that.views = JSON.parse(data);
                        } catch (e) {
                            console.log('Cannot parse views file "' + that.projectPrefix + 'vis-views.json"');
                            alert('Cannot parse views file "' + that.projectPrefix + 'vis-views.json');
                            that.views = null;
                        }
                    } else {
                        that.views = data;
                    }
                } else {
                    that.views = null;
                }

                if (callback) callback.call(that, callbackArg);
            });
        }
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
            for (var t = 0; t < this.activeWidgets.length; t++) {
                if (this.activeWidgets[t].indexOf('_') != -1 && this.syncWidgets) {
                    this.syncWidgets(this.activeWidgets);
                    break;
                }
            }

            if (local) {

                storage.set(this.storageKeyViews, JSON.stringify(this.views, null, 2));
                that.saveRemoteActive = 0;
                if (callback) callback();
            } else {
                this.conn.writeFile(this.projectPrefix + 'vis-views.json', JSON.stringify(this.views, null, 2), function () {
                    that.saveRemoteActive = 0;
                    if (callback) callback();

                    // If not yet checked => check if project css file exists
                    if (!that.cssChecked) {
                        that.conn.readFile(that.projectPrefix + 'vis-user.css', function (err, data) {
                            that.cssChecked = true;
                            // Create vis-user.css file if not exist
                            if (err || data == null || data == undefined) {
                                // Create empty css file
                                that.conn.writeFile(that.projectPrefix + 'vis-user.css', '');
                            }
                        });
                    }
                });
            }
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
                (arg == undefined || this.onChangeCallbacks[i].arg == arg)) {
                this.onChangeCallbacks.slice(i, 1);
                return;
            }
        }
    }
};

// WebApp Cache Management
if ('applicationCache' in window) {
    window.addEventListener('load', function (e) {
        window.applicationCache.addEventListener('updateready', function (e) {
            if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                vis.showWaitScreen(true, null, _('Update found, loading new Files...'), 100);
                jQuery("#waitText").attr("id", "waitTextDisabled");
                jQuery(".vis-progressbar").hide();
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
(window.onpopstate = function () {
    var match,
        pl = /\+/g,
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) {
            return decodeURIComponent(s.replace(pl, ' '));
        },
        query = window.location.search.substring(1);
    vis.urlParams = {};
    while (match = search.exec(query)) {
        vis.urlParams[decode(match[1])] = decode(match[2]);
    }

    if (window.location.href.indexOf('edit.html') != -1 || vis.urlParams['edit'] === "") {
        vis.editMode = true;
    }
})();

// Start of initialisation: main ()
(function ($) {
    $(document).ready(function () {
        // On some platfors, the can.js is not immediately ready
        vis.states = new can.Map({'nothing_selected.val': null});

        // für iOS Safari - wirklich notwendig?
        $('body').on('touchmove', function (e) {
            if ($(e.target).closest("body").length == 0) {
                e.preventDefault();
            }
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


        if (!local) {
            // First of all load project/vis-user.css
            $('#project_css').attr('href', '/' + vis.conn.namespace + '/' + vis.projectPrefix + 'vis-user.css');

            vis.conn.init(null, {
                onConnChange: function (isConnected) {
                    //console.log("onConnChange isConnected="+isConnected);
                    if (isConnected) {
                        $("#server-disconnect").dialog("close");
                        if (vis.isFirstTime) {
                            vis.conn.getVersion(function (version) {
                                if (version) {
                                    //vis.conn.readFile("www/vis/css/vis-user.css");

                                    if (compareVersion(version, vis.requiredServerVersion)) {
                                        // TODO Translate
                                        vis.showMessage('Warning: requires Server version ' + vis.requiredServerVersion + ' - found Server version ' + version + ' - please update Server.');
                                    }
                                } //else {
                                    // Possible not authenticated, wait for request from server
                                //}
                            });

                            vis.showWaitScreen(true, _('Loading data values...') + '<br>', null, 20);
                        }

                        // Read all states from server
                        vis.conn.getStates(function (error, data) {
                            if (data) {
                                for (var id in data) {
                                    var obj = data[id];
                                    var o = {};
                                    o[id + '.val'] = obj.val;
                                    o[id + '.ts']  = obj.ts;
                                    if (vis.states[id + '.val'] !== undefined) {
                                        o[id + '.ack'] = obj.ack;
                                        o[id + '.lc']  = obj.lc;
                                    }
                                    try {
                                        vis.states.attr(o);
                                    } catch (e) {
                                        vis.conn.logError('Error: can\'t create states object for ' + id + '(' + e + ')');
                                    }
                                }
                            }


                            if (error) {
                                console.log("Possibly not authenticated, wait for request from server");
                                // Possibly not authenticated, wait for request from server
                            } else {
                                // Get Server language
                                vis.conn.getLanguage(function (err, lang) {
                                    systemLang = lang || systemLang;
                                    vis.language = systemLang;
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
                    } else {
                        //console.log((new Date()) + " socket.io disconnect");
                        $("#server-disconnect").dialog("open");
                    }
                },
                onRefresh: function () {
                    window.location.reload();
                },
                onUpdate: function (id, state) {
                    var o = {};
                    // Check new model
                    o[id + '.val'] = state.val;
                    o[id + '.ts'] = state.ts;
                    if (vis.states[id + '.val'] !== undefined) {
                        o[id + '.ack'] = state.ack;
                        o[id + '.lc'] = state.lc;
                    }
                    try {
                        vis.states.attr(o);
                    } catch (e) {
                        vis.conn.logError('Error: can\'t create states object for ' + id + '(' + e + ')');
                    }

                    // Inform other widgets, that do not support canJS
                    for (var i = 0, len = vis.onChangeCallbacks.length; i < len; i++) {
                        vis.onChangeCallbacks[i].callback(vis.onChangeCallbacks[i].arg, id, state.val, state.ack);
                    }
                },
                onAuth: function (message, salt) {
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
                        users = '<input id="login-username" value="" type="text" autocomplete="on" class="login-input-field" placeholder="' + _('User name') + '">'
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
                onCommand: function (instance, command, data) {
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
        } else {
            // Init edit dialog
            if (vis.editMode && vis.editInit) vis.editInit();
            vis.init();
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
    alert(_('please use /vis/edit.html instead of /vis/?edit'));
    location.href = './edit.html' + window.location.hash;
}
