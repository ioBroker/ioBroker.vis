/**
 *  vis
 *  https://github.com/hobbyquaker/vis/
 *
 *  Copyright (c) 2013-2014 hobbyquaker https://github.com/hobbyquaker, bluefox https://github.com/GermanBluefox
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 */

"use strict";

if (typeof systemDictionary !== 'undefined') {
    $.extend(systemDictionary, {
        'No connection to Server': {'en': 'No connection to Server', 'de': 'Keine Verbindung zu Server', 'ru': 'Нет соединения с сервером'},
        ' done.<br/>': {'en': ' done.<br/>', 'de': ' - erledigt.<br/>', 'ru': '. Закончено.<br/>'},
        '<br/>Loading Views...<br/>': {'en': '<br/>Loading Views...<br/>', 'de': '<br/>Lade Views...<br/>', 'ru': '<br/>Загрузка пользовательских страниц...<br/>'},
        'Connecting to Server...<br/>': {'en': 'Connecting to Server...<br/>', 'de': 'Verbinde mit Server...<br/>', 'ru': 'Соединение с сервером...<br/>'},
        'Loading data objects...': {'en': 'Loading data...', 'de': 'Lade Daten...', 'ru': 'Загрузка данных...'},
        'Loading data values...': {'en': 'Loading values...<br/>', 'de': 'Lade Werte...<br/>', 'ru': 'Загрузка значений...<br/>'},
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
        'Loading Widget-Sets... <span id="widgetset_counter"></span>': {
            'en': 'Loading Widget-Sets... <span id="widgetset_counter"></span>',
            'de': 'Lade Widget-Sätze... <span id="widgetset_counter"></span>',
            'ru': 'Загрузка наборов элементов... <span id="widgetset_counter"></span>'}
    });
}

systemLang = visConfig.language;

var vis = {

    version:                '0.0.1',
    requiredServerVersion:  '0.0.0',
    
    storageKeyViews:        'visViews',
    storageKeySettings:     'visSettings',
    storageKeyInstance:     'visInstance',
    
    instance:               null,
    instanceId:             undefined,
    instanceData:           undefined,
    instanceCmd:            undefined,
    
    urlParams:              {},
    settings:               {},
    views:                  {},
    widgets:                {},
    activeView:             '',
    widgetSets:             visConfig.widgetSets,
    initialized:            false,
    toLoadSetsCount:        0, // Count of widget sets that should be loaded
    isFirstTime:            true,
    useCache:               true,
    authRunning:            false,
    
    binds:                  {},
    onChangeCallbacks:      [],
    viewsActiveFilter:      {},
    viewFileSuffix:         window.location.search ? "-" + window.location.search.slice(1) : "",
    navChangeCallbacks:     [],
    editMode:               false,

    // Array with all objects (Descriptions of objects)
    objects:                null,
    setValue: function (id, val) {
        // Check if this ID is a programm
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

        this.conn.setState(id, val);

        if (this.states[id] || this.states[id + '.val'] !== undefined) {
            this.states.attr(o);

            // Inform other widgets, that does not support canJS
            for (var i = 0, len = this.onChangeCallbacks.length; i < len; i++) {
                this.onChangeCallbacks[i].callback(this.onChangeCallbacks[i].arg, id, val);
            }
        }
    },
    loadWidgetSet: function (name, callback) {
        var url = './widgets/' + name + '.html?visVersion=' + this.version;
        var that = this;
        $.ajax({
            url:      url,
            type:     'GET',
            async:    false,
            dataType: 'html',
            cache:    this.useCache,
            success:  function (data) {

                jQuery("head").append(data);
                that.toLoadSetsCount -= 1;
                if (that.toLoadSetsCount <= 0) {
                    that.showWaitScreen(true, null, null, 100);
                    setTimeout(function () {
                        callback.call(that);
                    }, 100);
                } else {
                    that.showWaitScreen(true, null , null, parseInt((100 - that.waitScreenVal) / that.toLoadSetsCount, 10));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                that.conn.logError("Cannot load widget set " + name + " " + errorThrown);
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

                    // Add dependecies
                    for (var u = 0, ulen = widgetSetsObj[wset].depends.length; u < ulen; u++) {
                        if (widgetSets.indexOf(widgetSetsObj[wset].depends[u]) == -1) {
                            widgetSets.push(widgetSetsObj[wset].depends[u]);
                        }
                    }

                }
            }
        }
        return widgetSets;
    },
    loadWidgetSets: function (callback) {
        this.showWaitScreen(true, 'Loading Widget-Sets... <span id="widgetset_counter"></span>', null, 20);
        var arrSets = [];

        // Get list of used widget sets. if Edit mode list is null.
        var widgetSets = this.editMode ? null: this.getUsedWidgetSets();

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
        $("#widgetset_counter").html("<span style='font-size:10px'>("+(vis.toLoadSetsCount)+")</span>");

        var that = this;
        if (this.toLoadSetsCount) {
            for (var i = 0, len = this.toLoadSetsCount; i < len; i++) {
                _setTimeout(function (_i) {
                    that.loadWidgetSet(arrSets[_i], callback);
                }, 100, i);
            }
        } else {
            if (callback) {
                callback();
            }
        }
    },
    bindInstance: function () {
        if (typeof storage !== 'undefined') {
            this.instance = storage.get(this.storageKeyInstance);
            $('#vis_instance').val(this.instance);
        }
        if (!this.instance && this.editMode){
            this.generateInstance();
        }

        /*this.instanceId   = 69800;
         this.instanceCmd  = this.instanceId + 1;
         this.instanceData = this.instanceCmd + 1;

        if (!vis.objects[vis.instanceId]) {
            vis.objects[vis.instanceId] = {
                _persistent: true,
                Name: "vis.instanceID",
                TypeName: "VARDP"
            };
            vis.conn.addObject(vis.instanceId, vis.objects[vis.instanceId]);
            vis.objects[vis.instanceCmd] = {
                _persistent: true,
                Name: "vis.command",
                TypeName: "VARDP"
            };
            vis.conn.addObject(vis.instanceCmd, vis.objects[vis.instanceCmd]);
            vis.objects[vis.instanceData] = {
                _persistent: true,
                Name: "vis.data",
                TypeName: "VARDP"
            };
            vis.conn.addObject(vis.instanceData, vis.objects[vis.instanceData]);
        }

        vis.states.bind(vis.instanceCmd + ".Value", function (e, newVal) {
            var cmd = newVal;
             if (cmd !== "" &&
                 (vis.states[vis.instanceId + '.Value'] == 'FFFFFFFF' ||
                  (vis.instance && vis.states[vis.instanceId + '.Value'] == vis.instance))) {
                var data = vis.states.attr(vis.instanceData + ".Value");
                // external Commands
                switch (cmd) {
                    case "alert":
                        alert(data);
                        break;
                    case "changedView":
                    	// Do nothing
					    return;                        
                    case "changeView":
                        vis.changeView(data);
                        break;
                    case "refresh":
                    case "reload":
                        setTimeout(function () {
                            window.location.reload();
                        }, 1);
                        break;
                    case "dialog":
                        $("#" + data + "_dialog").dialog("open");
                        break;
                    case "popup":
                        window.open(data);
                        break;
                    case "playSound":
                        $("#external_sound").attr("src", data);
                        setTimeout(function () {
                            document.getElementById("external_sound").play();
                        }, 1);
                        break;
                    default:
                    vis.conn.logError("unknown external command "+cmd);
                }

                // remove command
                localData.setValue(vis.instanceCmd, "");
            }
        });

        $('#vis_instance').change(function () {
            vis.instance = $(this).val();
            if (typeof storage !== 'undefined') {
                storage.set(vis.storageKeyInstance, vis.instance);
            }
        });*/
    },
    generateInstance: function () {
        this.instance = (Math.random() * 4294967296).toString(16);
        this.instance = "0000000" + this.instance;
        this.instance = this.instance.substring(this.instance.length - 8);
        $("#vis_instance").val(this.instance);
        if (typeof storage !== 'undefined') {
            storage.set(this.storageKeyInstance, this.instance);
        }
    },
    init: function () {
        if (this.initialized) {
            return;
        }

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

        this.loadRemote(this.loadWidgetSets, this.initNext);
    },
    initNext: function () {
        if (!this.views) {
            this.loadRemote(function () {
                this.showWaitScreen(false);

                // First start.
                this.initViewObject();
            });
            return false;
        } else {
            this.showWaitScreen(false);
        }

        var hash = window.location.hash.substring(1);

        // View selected?
        if (hash == '') {
            // Take first view in the list
            for (var view in this.views) {
                this.activeView = view;
                break;
            }
            // Create default view in demo mode
            if (typeof io == 'undefined') {
                if (this.activeView == "") {
                    if (!this.editMode){
                        alert(_("error - View doesn't exist"));
                        window.location.href = "./edit.html";
                    } else {
                        this.views["DemoView"] = this.createDemoView ? this.createDemoView() : {settings: {style: {}}, widgets: {}};
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
                    this.views['DemoView'] = this.createDemoView ? this.createDemoView() : {settings: {style: {}}, widgets: {}};
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
    },
    initViewObject: function () {
        if (!vis.editMode) {
            window.location.href = './edit.html' + window.location.search;
        }
        else {
            if (confirm(_("no views found on server.\nCreate new %s ?", "vis-views" + vis.viewFileSuffix + ".json"))) {
                vis.views = {};
                vis.views["DemoView"] = vis.createDemoView ? vis.createDemoView() : {settings: {style: {}}, widgets: {}};
                vis.saveRemote(function () {
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
        var width  = parseInt(vis.views[view].settings.sizex, 10);
        var height = parseInt(vis.views[view].settings.sizey, 10);
        if (!width || width < $( window ).width()) {
            width = '100%';
        }
        if (!height || height < $( window ).height()) {
            height = '100%';
        }
        $view.css({width:  width});
        $view.css({height: height});
    },
    renderView: function (view, noThemeChange, hidden) {
        if (!vis.views[view] || !vis.views[view].settings) {
            alert('Cannot render view ' + view + '. Invalid settings');
            return false;
        }

        var isViewsConverted = false; // Widgets in the views hav no information which WidgetSet they use, this info must be added and this flag says if that happens to store the views

        vis.views[view].settings.theme = vis.views[view].settings.theme || 'redmond';

        if (vis.views[view].settings.filterkey) {
            vis.viewsActiveFilter[view] = vis.views[view].settings.filterkey.split(',');
        } else {
            vis.viewsActiveFilter[view] = [];
        }

        if (!noThemeChange) {
            $("style[data-href$='jquery-ui.min.css']").remove();
            $("link[href$='jquery-ui.min.css']").remove();
            $("head").prepend('<link rel="stylesheet" type="text/css" href="../lib/css/themes/jquery-ui/' + vis.views[view].settings.theme + '/jquery-ui.min.css" id="jqui_theme" />');
            vis.additionalThemeCss(vis.views[view].settings.theme);
        }

        if ($('#visview_' + view).html() === undefined) {

            $('#vis_container').append('<div style="display:none;" id="visview_' + view + '" class="vis-view"></div>');
            var $view = $("#visview_" + view);
            $view.css(vis.views[view].settings.style);
            if (vis.views[view].settings.style.background_class) $view.addClass(vis.views[view].settings.style.background_class);

            vis.setViewSize(view);
            vis.views[view].rerender = true;

            // Render all simple widgets
            for (var id in vis.views[view].widgets) {
                // Try to complete the widgetSet information to optimize the loading of widgetSets
                if (!vis.views[view].widgets[id].widgetSet) {
                    var obj = $("#" + vis.views[view].widgets[id].tpl);
                    if (obj) {
                        vis.views[view].widgets[id].widgetSet = obj.attr("data-vis-set");
                        isViewsConverted = true;
                    }
                }

                if (!vis.views[view].widgets[id].renderVisible) {
                    vis.renderWidget(view, id);
                }
            }
            if (vis.binds.jqueryui && vis.editMode) {
                vis.binds.jqueryui._disable();
            }
        }
        
        // Views in Container verschieben
        $("#visview_" + view).find("div[id$='container']").each(function () {
            //console.log($(this).attr("id")+ " contains " + $(this).attr("data-vis-contains"));
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

            if (vis.views[view].rerender) {
                vis.views[view].rerender = false;
                // render all copmlex widgets, like hqWidgets or bars
                for (var id in vis.views[view].widgets) {
                    if (vis.views[view].widgets[id].renderVisible) {
                        vis.renderWidget(view, id);
                    }
                }
            }
        }

        // Store modified view
        if (isViewsConverted) {
            vis.saveRemote();
        }
    },
    preloadImages: function (srcs) {
        if (!vis.preloadImages.cache) {
            vis.preloadImages.cache = [];
        }
        var img;
        for (var i = 0; i < srcs.length; i++) {
            img = new Image();
            img.src = srcs[i];
            vis.preloadImages.cache.push(img);
        }
    },
    reRenderWidget: function (widget) {
        $("#" + widget).remove();
        vis.renderWidget(vis.activeView, widget);
    },
    changeFilter: function (filter, showEffect, showDuration, hideEffect, hideDuration) {

        var widgets = vis.views[vis.activeView].widgets;
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
            vis.viewsActiveFilter[vis.activeView] = filter.split(",");
            var mWidget;
            for (var widget in widgets) {
                //console.log(widgets[widget]);
                if (widgets[widget].data.filterkey && widgets[widget].data.filterkey != "") {
                    if (vis.viewsActiveFilter[vis.activeView].length > 0 && vis.viewsActiveFilter[vis.activeView].indexOf(widgets[widget].data.filterkey) == -1) {
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
                // Show copmlex widgets like hqWidgets or bars
                for (var widget in widgets) {
                    mWidget = document.getElementById(widget);
                    if (mWidget &&
                        mWidget._customHandlers &&
                        mWidget._customHandlers.onShow) {
                        if (widgets[widget].data.filterkey && widgets[widget].data.filterkey != "") {
                            if (!(vis.viewsActiveFilter[vis.activeView].length > 0 && vis.viewsActiveFilter[vis.activeView].indexOf(widgets[widget].data.filterkey) == -1)) {
                                mWidget._customHandlers.onShow(mWidget, widget);
                            }
                        }
                    }
                }
            }, parseInt(showDuration) + 10);
        }

        if (vis.binds.bars && vis.binds.bars.filterChanged) {
            vis.binds.bars.filterChanged(vis.activeView, filter);
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
        // Register hm_id to detect changes
        // if (widget.data.hm_id != 'nothing_selected')
        //   $.homematic("advisState", widget.data.hm_id, widget.data.hm_wid);

        var widgetData = this.widgets[id]["data"];

        try {
        // Append html element to view
            if (widget.data && widget.data.hm_id) {
                $("#visview_" + view).append(can.view(widget.tpl, {
                    hm:   this.states[widget.data.hm_id + '.Value'],
                    ts:   this.states[widget.data.hm_id + '.TimeStamp'],
                    ack:  this.states[widget.data.hm_id + '.Certain'],
                    lc:   this.states[widget.data.hm_id + '.LastChange'],
                    data: widgetData,
                    view: view
                }));
            }else {
                $("#visview_" + view).append(can.view(widget.tpl, {data: widgetData, view: view}));
            }
            if (!this.editMode) {
                if (widget.data.filterkey && widget.data.filterkey != "" && this.viewsActiveFilter[view].length > 0 &&  this.viewsActiveFilter[view].indexOf(widget.data.filterkey) == -1) {
                    var mWidget = document.getElementById(id);
                    $("#" + id).hide();
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
            }
        } catch (e) {
            this.conn.logError('Error: can\'t render ' + widget.tpl + ' ' + id + ' (' + e + ')');
        }
    },
    changeView: function (view, hideOptions, showOptions, sync) {
        var that = this;
        //console.log("changeView "+view);
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
        if (hideOptions.effect == "show") {
            effect = false;
        }

        if (this.inspectWidget) {
            this.inspectWidget("none");
            this.clearWidgetHelper();
            $("#select_active_widget").html('<option value="none">' + _('none selected') + '</option>');
        }

        if (!this.views[view]) {
            for (var prop in this.views) {
                // object[prop]
                break;
            }
            view = prop;
        }

        if (this.activeView !== view) {

            if (effect) {
                //console.log("effect");
                this.renderView(view, true, true);

                // View ggf aus Container heraus holen
                if ($("#visview_" + view).parent().attr("id") !== "vis_container") {
                    $("#visview_" + view).appendTo("#vis_container");
                }

                if (sync) {
                    $("#visview_" + view).show(showOptions.effect, showOptions.options, parseInt(showOptions.duration, 10), function () {
                        if (that.views[view].rerender) {
                            that.views[view].rerender = false;
                            for (var id in this.views[view].widgets) {
                                if (that.views[view].widgets[id].tpl.substring(0,5) == "tplHq" ||
                                    that.views[view].widgets[id].renderVisible)
                                    that.renderWidget(view, id);
                            }
                        }
                    }).dequeue();
                }
                $("#visview_" + this.activeView).hide(hideOptions.effect, hideOptions.options, parseInt(hideOptions.duration, 10), function () {
                    var list = $("link[href$='jquery-ui.min.css']");

                    if (list.length ==  0) {
                        $("head").prepend('<link rel="stylesheet" type="text/css" href="../lib/css/themes/jquery-ui/' + that.views[view].settings.theme + '/jquery-ui.min.css" id="jqui_theme" />');
                    } else {
                        list.attr("href", '../lib/css/themes/jquery-ui/' + that.views[view].settings.theme + '/jquery-ui.min.css');
                    }
                    $("style[data-href$='jquery-ui.min.css']").remove();
                    that.additionalThemeCss(that.views[view].settings.theme);

                    if (!sync) {
                        $("#visview_" + view).show(showOptions.effect, showOptions.options, parseInt(showOptions.duration, 10), function () {
                            if (that.views[view].rerender) {
                                that.views[view].rerender = false;
                                for (var id in that.views[view].widgets) {
                                    if (that.views[view].widgets[id].tpl.substring(0,5) == "tplHq" ||
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

                if (this.views[view] && this.views[view].settings) {
                    if (this.views[vis.activeView] && this.views[vis.activeView].settings &&
                        this.views[vis.activeView].settings.theme != this.views[view].settings.theme) {
                        if ($("link[href$='jquery-ui.min.css']").length ==  0) {
                            $("head").prepend('<link rel="stylesheet" type="text/css" href="../lib/css/themes/jquery-ui/' + this.views[view].settings.theme + '/jquery-ui.min.css" id="jqui_theme" />');
                        } else {
                            $("link[href$='jquery-ui.min.css']").attr("href", '../lib/css/themes/jquery-ui/' + this.views[view].settings.theme + '/jquery-ui.min.css');
                        }
                        $("style[data-href$='jquery-ui.min.css']").remove();
                    }
                    this.additionalThemeCss(this.views[view].settings.theme);
                }
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

        $("#visview_" + view).find("div[id$='container']").each(function () {
            $("#visview_" + $(this).attr("data-vis-contains")).show();
        });

        if (!this.editMode) {
            this.setValue(this.instanceData, this.activeView);
            this.setValue(this.instanceId,  this.instance);
            this.setValue(this.instanceCmd, 'changedView');
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
    addView: function (view) {
        if (this[view]) {
            return false;
        }
        this.views[view] = {settings: {style: {}}, widgets: {}};
        this.saveRemote(function () {
            $(window).off('hashchange');
            window.location.hash = "#" + view;
            window.location.reload();
        });
    },
    loadRemote: function (callback, callbackArg) {
        var that = this;
        this.showWaitScreen(true, "<br/>Loading Views...<br/>", null, 12.5);
        this.conn.readFile("vis-views" + vis.viewFileSuffix + ".json", function (err, data) {
            if (err) {
                alert("vis-views" + vis.viewFileSuffix + ".json" + " " + err);
            }
            if (data) {
                if (typeof data == "string") {
                    that.views = JSON.parse(data);
                } else {
                    that.views = data;
                }
            } else {
                that.views = null;
            }

            if (callback) {
                callback.call(that, callbackArg);
            }
            if (!that.views) {
                //alert("No Views found on Server");
            }            
        });       
    },
    saveRemoteActive: false,
    saveRemote: function (cb) {
        var that = this;
        if (this.saveRemoteActive) {
            setTimeout(function (_cb) {
                this.saveRemote(_cb);
            }, 1000, cb);
            return;
        }
        this.saveRemoteActive = true;
        // Sync widget before it will be saved
        if (this.activeWidget && this.activeWidget.indexOf('_') != -1 && this.syncWidget) {
            this.syncWidget(this.activeWidget);
        }

        this.conn.writeFile("vis-views" + this.viewFileSuffix + ".json", this.views, function () {
            that.saveRemoteActive = false;
            if (cb) {
                cb();
            }
            //console.log("Saved views on Server");
        });
    },
    additionalThemeCss: function (theme) {
        if (theme == "kian") {
            $("#additional_theme_css").remove();
            $("link[href$='jquery-ui.min.css']").after('<link rel="stylesheet" href="css/add_' + theme + '.css" id="additional_theme_css" type="text/css"/>');
        } else {
            $("#additional_theme_css").remove();
        }
    },
    wakeUpCallbacks: [],
    initWakeUp: function () {
        var that = this;
        var oldTime = (new Date()).getTime();
        setInterval(function() {
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
    getObjDesc: function (id) {
        if (this.objects[id] !== undefined) {
            var parent = "";
            var p = this.objects[id]["Parent"];
            //console.log('parent metaObject', id, p, vis.objects[p]);
            if (p !== undefined && this.objects[p]["DPs"] !== undefined) {
                parent = this.objects[p]["Name"] + "/";
            } else if (this.objects[id]["TypeName"] !== undefined) {
                if (this.objects[id]["TypeName"] == "VARDP") {
                    parent = _("Variable") + " / ";
                } else if (this.objects[id]["TypeName"] == "PROGRAM") {
                    parent = _("Program") + " / ";
                }
            }

            if (this.objects[id]["Address"] !== undefined) {
                return parent + vis.objects[id]["Name"] + "/" + this.objects[id]["Address"];
            } else if (this.objects[id]["Name"]) {
                return parent + this.objects[id]["Name"];
            } else if (this.objects[id]["name"]) {
                return parent + this.objects[id]["name"];
            }
        } else if (id == 41) {
            return _("Service messages");
        } else if (id == 40) {
            return _("Alarms");
        }
        return id;
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
                $('#waitText').html(_(newText));
            }
            if (appendText !== null && appendText !== undefined) {
                $('#waitText').append(_(appendText));
            }
            if (step !== undefined) {
                this.waitScreenVal += step;
                setTimeout(function (_val) {
                    $(".vis-progressbar").progressbar("value", _val);
                }, 0, this.waitScreenVal)

            }
        } else if (waitScreen) {
            $(waitScreen).remove();
        }
    },
    registerOnChange: function (callback, arg) {
        for (var i = 0, len = this.onChangeCallbacks.length; i < len; i++) {
            if (this.onChangeCallbacks[i].callback == callback &&
                this.onChangeCallbacks[i].arg      == arg) {
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
                vis.showWaitScreen(true, null, 'Update found, loading new Files...', 100);
                jQuery("#waitText").attr("id", "waitTextDisabled");
                jQuery(".vis-progressbar").hide();
                try {
                    window.applicationCache.swapCache();
                } catch (e) {
                    servConn.logError('Cannot execute window.applicationCache.swapCache - ' + e);
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
        pl     = /\+/g,
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) {
            return decodeURIComponent(s.replace(pl, ' '));
        },
        query  = window.location.search.substring(1);
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

        $("#ccu-io-disconnect").dialog({
            modal:         true,
            closeOnEscape: false,
            autoOpen:      false,
            dialogClass:   'noTitle',
            width:         400,
            height:        90
        });

        $(".vis-version").html(vis.version);

        // Init edit dialog
        if (vis.editMode && vis.editInit) vis.editInit();

        vis.showWaitScreen(true, null, "Connecting to Server...<br/>", 0);

        function compareVersion (instVersion, availVersion) {
            var instVersionArr  = instVersion.replace(/beta/, '.').split('.');
            var availVersionArr = availVersion.replace(/beta/,'.').split('.');

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
        vis.conn.init(null, {
            onConnChange: function (isConnected) {
                //console.log("onConnChange isConnected="+isConnected);
                if (isConnected) {
                    $("#ccu-io-disconnect").dialog("close");
                    if (vis.isFirstTime) {
                        vis.conn.getVersion(function (version) {
                            if (!version) {
                                // Possible not authenticated, wait for request from server
                            } else {
                                //vis.conn.readFile("www/vis/css/vis-user.css");

                                if (compareVersion(version, vis.requiredServerVersion)) {
                                    // TODO Translate
                                    alert("Warning: requires Server version " + vis.requiredServerVersion + " - found Server version " + version + " - please update Server.");
                                }
                            }
                        });

                        vis.showWaitScreen(true, 'Loading data values...', null, 20);
                    }

                    // Read all states from server
                    vis.conn.getStates(function (error, data) {
                        if (data) {
                            for (var dp in data) {
                                var obj = data[dp];
                                if (vis.states[dp + '.val'] === undefined) {
                                    var id = dp;
                                    try {
                                        var o = {};
                                        o[dp + '.val'] = obj[0];
                                        o[dp + '.ts']  = obj[1];
                                        vis.states.attr(o);
                                    } catch (e) {
                                        servConn.logError('Error: can\'t create states object for ' + dp + '(' + e + ')');
                                    }
                                } else {
                                    var o = {};
                                    var id = dp;
                                    o['_' + id + '.val'] = obj[0];
                                    o['_' + id + '.ts']  = obj[1];
                                    o['_' + id + '.ack'] = obj[2];
                                    o['_' + id + '.lc']  = obj[3];
                                    vis.states.attr(o);
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
                                translateAll();
                            });

                            // If metaIndex required, load it
                            if (vis.editMode) {
                                /* socket.io */
                                if (vis.isFirstTime) {
                                    vis.showWaitScreen(true, 'Loading data objects...', null, 20);
                                }
                                // Read all data objects from server
                                vis.conn.getObjects(function (err, data) {
                                    vis.objects = data;
                                });
                            }

                            //console.log((new Date()) + " socket.io reconnect");
                            if (vis.isFirstTime) setTimeout(function () {
                                vis.init();
                            }, 10);
                            vis.isFirstTime = false;
                        }
                    });
                } else {
                    //console.log((new Date()) + " socket.io disconnect");
                    $("#ccu-io-disconnect").dialog("open");
                }
            },
            onRefresh: function () {
                window.location.reload();
            },
            onUpdate: function (obj) {
                var name;
                // Check new model
                if (obj != null && obj.name && (name = obj.name/*.replace(/\./g, '\\.')*/) && vis.states[name + '.Value'] !== undefined) {
                    var o = {};
                    o['_' + name + '.Value']      = obj.val;
                    o['_' + name + '.Timestamp']  = obj.ts;
                    o['_' + name + '.Certain']    = obj.ack;
                    o["_" + name + ".LastChange"] = obj.lc;

                    vis.states.attr(o);

                    // Inform other widgets, that do not support canJS
                    for (var i = 0, len = vis.onChangeCallbacks.length; i < len; i++) {
                        vis.onChangeCallbacks[i].callback(vis.onChangeCallbacks[i].arg, name, obj.val, obj.ack || (vis.objects[name] && vis.objects[name]["TypeName"] == "VARDP"));
                    }
                } else {
                    //console.log('Datenpunkte sind noch nicht geladen!');
                }
            },
            onAuth: function (message, salt) {
                if (vis.authRunning) {
                    return;
                }
                vis.authRunning = true;
                var users;
                if (visConfig.auth.users && visConfig.auth.users.length) {
                    users = '<select id="login-username" value="'+visConfig.auth.users[0]+'" class="login-input-field">';
                    for (var z = 0; z < visConfig.auth.users.length; z++) {
                        users += '<option value="' + visConfig.auth.users[z] + '">' + visConfig.auth.users[z] + '</option>';
                    }
                    users += '</select>';
                } else {
                    users = '<input id="login-username" value="" type="text" autocomplete="on" class="login-input-field" placeholder="' + _('User name')+'">'
                }

                var text = '<div id="login-box" class="login-popup" style="display:none">'+
                            '<div class="login-message">'+message+'</div>'+
                            '<div class="login-input-field">'+
                                '<label class="username">'+
                                    '<span class="_">'+_('User name')+'</span>'+
                                    users +
                                '</label>'+
                                '<label class="password">'+
                                    '<span class="_">'+_('Password')+'</span>'+
                                    '<input id="login-password" value="" type="password" class="login-input-field" placeholder="' + _('Password')+'">'+
                                '</label>'+
                                '<button class="login-button" type="button"  class="_">'+_('Sign in')+'</button>'+
                            '</div>'+
                        '</div>';

                $('body').append(text);

                var loginBox = $('#login-box');

                //Fade in the Popup
                $(loginBox).fadeIn(300);

                //Set the center alignment padding + border see css style
                var popMargTop = ($(loginBox).height() + 24) / 2;
                var popMargLeft = ($(loginBox).width() + 24) / 2;

                $(loginBox).css({
                    'margin-top' : -popMargTop,
                    'margin-left' : -popMargLeft
                });

                // Add the mask to body
                $('body').append('<div id="login-mask"></div>');
                $('#login-mask').fadeIn(300);
                // When clicking on the button close or the mask layer the popup closed
                $('#login-password').keypress(function(e) {
                    if(e.which == 13) {
                        $('.login-button').trigger('click');
                    }
                });
                $('.login-button').bind('click', function() {
                    var user = $('#login-username').val();
                    var pass = $('#login-password').val();
                    $('#login_mask , .login-popup').fadeOut(300 , function() {
                        $('#login-mask').remove();
                        $('#login-box').remove();
                    });
                    setTimeout (function () {
                        vis.authRunning = false;
                        console.log("user "+  user + ", " + pass + " " + salt);
                        vis.conn.authenticate(user, pass, salt);
                    }, 500);
                    return true;
                });
            }
        });
    });

    //vis.preloadImages(["../lib/css/themes/jquery-ui/redmond/images/modalClose.png"]);

    vis.initWakeUp();
})(jQuery);

// IE8 indexOf compatibility
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    }
}
function _setTimeout(func, timeout, arg1, arg2, arg3, arg4, arg5, arg6) {
    return setTimeout(function () {func(arg1, arg2, arg3, arg4, arg5, arg6);}, timeout);
}
function _setInterval(func, timeout, arg1, arg2, arg3, arg4, arg5, arg6) {
    return setInterval(function () {func(arg1, arg2, arg3, arg4, arg5, arg6);}, timeout);
}

if (window.location.search == "?edit") {
    alert(_('please use /vis/edit.html instead of /vis/?edit'));
    location.href = './edit.html' + window.location.hash;
}
