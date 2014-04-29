/**
 *  DashUI
 *  https://github.com/hobbyquaker/dashui/
 *
 *  Copyright (c) 2013-2014 hobbyquaker https://github.com/hobbyquaker, bluefox https://github.com/GermanBluefox
 *  MIT License (MIT)
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 *  documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 *  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 *  permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 *  the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 *  THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 *  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

"use strict";

var dui = {

    version:                '0.9beta94',
    requiredServerVersion:  '1.0.28',
    storageKeyViews:        'dashuiViews',
    storageKeySettings:     'dashuiSettings',
    storageKeyInstance:     'dashuiInstance',
    instance:               null,
    urlParams:              {},
    settings:               {},
    views:                  {},
    widgets:                {},
    activeView:             "",
    widgetSets:             duiConfig.widgetSets,
    words:                  null,
    language:               (typeof ccuIoLang === 'undefined') ? 'en': (ccuIoLang || 'en'),
    initialized:            false,
    useCache:               true,
    binds:                  {},
    serverDisconnected:     false,
    instanceView:           undefined,
    instanceData:           undefined,
    instanceCmd:            undefined,
    instanceReady:          false,
    onChangeCallbacks:      [],
    viewsActiveFilter:      {},
    toLoadSetsCount:        0, // Count of widget sets that should be loaded
    isFirstTime:            true,
    authRunning:            false,
    viewFile:               window.location.search ? "dashui-views-" + window.location.search.slice(1) + ".json" : "dashui-views.json",

    loadWidgetSet: function (name, callback) {
        //console.log("loadWidgetSet("+name+")");
        $.ajax({
            url: "widgets/" + name + ".html?duiVersion="+dui.version,
            type: "get",
            async: false,
            dataType: "text",
            cache: dui.useCache,
            success: function (data) {
                jQuery("head").append(data);
                dui.toLoadSetsCount -= 1;
                if (dui.toLoadSetsCount <= 0) {
                    dui.showWaitScreen(true, null, null, 100);
                    setTimeout(callback, 100);
                } else {
                    dui.showWaitScreen(true, null /*" <span style='font-size: 10px;'>" + dui.toLoadSetsCount+ "</span>"*/, null, parseInt((100-dui.waitScreenVal) / dui.toLoadSetsCount, 10));
                }
            }
        });
    },
    // Return as array used widgetSets or null if no information about it
    getUsedWidgetSets: function () {
        var widgetSets = [];

        if (!dui.views) return null;

        // Convert duiConfig.widgetSets to object for easier dependency search
        var widgetSetsObj = {};
        for (var i = 0; i < duiConfig.widgetSets.length; i++) {
            if (typeof duiConfig.widgetSets[i] == "object") {
                if (!duiConfig.widgetSets[i].depends) {
                    duiConfig.widgetSets[i].depends = [];
                }
                widgetSetsObj[duiConfig.widgetSets[i].name] = duiConfig.widgetSets[i];

            } else {
                widgetSetsObj[duiConfig.widgetSets[i]] = {depends: []};
            }
        }

        for (var view in dui.views) {
            for (var id in dui.views[view].widgets) {
                if (!dui.views[view].widgets[id].widgetSet) {

                    // Views are not yet converted and have no widgetSet information)
                    return null;

                } else if (widgetSets.indexOf(dui.views[view].widgets[id].widgetSet) == -1) {

                    var wset = dui.views[view].widgets[id].widgetSet;
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
        dui.showWaitScreen(true, 'Loading Widget-Sets... <span id="widgetset_counter"></span>', null, 20);
        var arrSets = [];

        // Get list of used widget sets. if Edit mode list is null.
        var widgetSets = (dui.urlParams['edit'] === "") ? null: dui.getUsedWidgetSets();

        // Firts calculate how many sets to load
        for (var i = 0; i < dui.widgetSets.length; i++) {
            var name = dui.widgetSets[i].name || dui.widgetSets[i];

            // Skip unused widget sets in non-edit mode
            if (widgetSets && widgetSets.indexOf(name) == -1) {
                continue;
            }

            arrSets[arrSets.length] = name;

            if (dui.urlParams['edit'] === "" && dui.widgetSets[i].edit) {
                arrSets[arrSets.length] = dui.widgetSets[i].edit;
            }
        }
        dui.toLoadSetsCount = arrSets.length;
        $("#widgetset_counter").html("<span style='font-size:10px'>("+(dui.toLoadSetsCount)+")</span>");

        if (dui.toLoadSetsCount) {
            for(var i = 0, len = dui.toLoadSetsCount; i < len; i++) {
                _setTimeout (dui.loadWidgetSet, 100, arrSets[i], callback);
            }
        } else {
            if (callback) {
                callback();
            }
        }

    },
    bindInstance: function () {

        if (dui.instanceReady) {
            //console.log("instance already binded");
            return;
        }

        if (!dui.instanceCmd) {
            //console.log("can't bind instance :-(");
            return false;
        }
        //console.log("bind instance id="+dui.instanceCmd);

        //localData.uiState.attr("_"+ dui.instanceCmd, {Value:''});
        //localData.uiState.attr("_"+ dui.instanceData, {Value:''});
        localData.uiState.attr("_"+ dui.instanceView, {Value:dui.activeView});

        localData.uiState.bind("_" + dui.instanceCmd + ".Value", function (e, newVal) {
            var cmd = newVal;
            //console.log("external command cmd=" + cmd);

            if (cmd !== "") {
                var data = localData.uiState.attr("_" + dui.instanceData + ".Value");
                //console.log("external command cmd=" + cmd + " data=" + data);

                // external Commands
                switch (cmd) {
                    case "alert":
                        alert(data);
                        break;
                    case "changeView":
                        dui.changeView(data);
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
                        console.log("unknown external command "+cmd);
                }

                // remove command
                localData.setValue(dui.instanceCmd, "");

            }

        });
        dui.instanceReady = true;

    },
    removeInstance: function () {
        if (typeof storage !== 'undefined') {
            storage.set(dui.storageKeyInstance, null);
        }
        dui.conn.delObject(dui.instanceCmd);
        dui.conn.delObject(dui.instanceData);
        dui.conn.delObject(dui.instanceView);
        $("#instance").hide();
        $("#create_instance").show();
        dui.instanceReady = false;
    },
    createInstance: function () {
        dui.instance = (Math.random() * 4294967296).toString(16);
        dui.instance = "0000000" + dui.instance;
        dui.instance = dui.instance.substr(-8);
        if (typeof storage !== 'undefined') {
            storage.set(dui.storageKeyInstance, dui.instance);
        }
        $("#dashui_instance").val(dui.instance);
        $("#create_instance").hide();
        $("#instance").show();

        //console.log("create instance "+dui.instance);

        dui.conn.addObject(69800, {
            _findNextId: true,
            _persistent: true,
            Name: "dashui_"+dui.instance+"_cmd",
            TypeName: "VARDP"
        }, function (cid) {
            //console.log("create var "+cid);
            dui.instanceCmd = cid;
            dui.conn.addObject(69801, {
                _findNextId: true,
                _persistent: true,
                Name: "dashui_"+dui.instance+"_view",
                TypeName: "VARDP"
            }, function (vid) {
                //console.log("create var "+vid);
                dui.instanceView = vid;
                dui.conn.addObject(69802, {
                    _findNextId: true,
                    _persistent: true,
                    Name: "dashui_"+dui.instance+"_data",
                    TypeName: "VARDP"
                }, function (did) {
                    //console.log("create var "+did);
                    dui.instanceData = did;
                    dui.bindInstance();
                });
            });
        });
    },
    initInstance: function () {
        if (typeof storage !== 'undefined') {
            dui.instance = storage.get(dui.storageKeyInstance);
        }
        //console.log("initInstance "+dui.instance);
        if (dui.instance) {

            $("#dashui_instance").val(dui.instance);
            $("#create_instance").hide();
            $("#instance").show();

            var cmdVarName =  "dashui_" + dui.instance + "_cmd";
            var viewVarName = "dashui_" + dui.instance + "_view";
            var dataVarName = "dashui_" + dui.instance + "_data";
            //console.log(cmdVarName);
            var cmdId = localData.metaIndex.Name[cmdVarName];
            if (cmdId) {

                dui.instanceCmd = cmdId[0];
                if (localData.metaIndex.Name[viewVarName]) {
                    dui.instanceView = localData.metaIndex.Name[viewVarName][0];
                }
                if (localData.metaIndex.Name[dataVarName]) {
                    dui.instanceData = localData.metaIndex.Name[dataVarName][0];
                }

                dui.bindInstance();

            } else {
               console.log("instance var not found");
            }
        } else {
            dui.createInstance();
        }
    },
    init: function () {
        if (this.initialized) {
            return;
        }

        if (typeof storage !== 'undefined') {
            var settings = storage.get(dui.storageKeySettings);
            if (settings) {
                dui.settings = $.extend(dui.settings, settings);
            }
        }

        // Late initialization (used only for debug)
        if (dui.binds.hqWidgetsExt) {
            dui.binds.hqWidgetsExt.hqInit();
        }

        dui.loadRemote(dui.loadWidgetSets, dui.initNext);
    },
    initNext: function () {
        if (!dui.views) {
            dui.loadRemote(function () {
                dui.showWaitScreen(false);

                // First start.
                dui.initViewObject();
            });
            return false;
        } else {
            dui.showWaitScreen(false);
        }

        var hash = window.location.hash.substring(1);

        // View selected?
        if (hash == "") {
            // Take first view in the list
            for (var view in dui.views) {
                dui.activeView = view;
                break;
            }
            // Create default view in demo mode
            if (typeof io == "undefined") {
                if (dui.activeView == "") {
                    dui.views["DemoView"] = {};
                    dui.activeView = "DemoView";
                }
                dui.showWaitScreen(false);
            }

            if (dui.activeView == "") {
                // TODO Translate
                alert("unexpected error - this should not happen :(")
                $.error("this should not happen :(");
            }
        } else {
            if (dui.views[hash]) {
                dui.activeView = hash;
            } else {
                // TODO Translate
                alert("error - View doesn't exist :-(");
                window.location.href = "./edit.html";
                $.error("dui Error can't find view");
            }
        }

        $("#active_view").html(dui.activeView);


        // Navigation
        $(window).bind('hashchange', function (e) {
            dui.changeView(window.location.hash.slice(1));
        });


        // EDIT mode
        if (dui.urlParams["edit"] === "") {
            dui.editInitNext();
        }
        this.initialized = true;
        // If this function called earlier, it makes problems under FireFox.
        dui.changeView(dui.activeView);
    },
    initViewObject: function () {
        // TODO Translate
        if (confirm("no views found on server.\nCreate new " + dui.viewFile + "?")) {
            dui.views = {view1: {settings: {style: {}}, widgets: {}}};
            dui.saveRemote();
            window.location.href = './edit.html' + window.location.search;
        } else {
            window.location.reload();
        }
    },
    renderView: function (view, noThemeChange, hidden) {
        //console.log("renderView("+view+","+noThemeChange+","+hidden+")");

        if (!dui.views[view]) {
            return false;
        }

        var isViewsConverted = false; // Widgets in the views hav no information which WidgetSet they use, this info must be added and this flag says if that happens to store the views

        if (!dui.views[view].settings.theme) {
            dui.views[view].settings.theme = "dhive";
        }

        if (dui.views[view].settings.filterkey) {
            dui.viewsActiveFilter[view] = dui.views[view].settings.filterkey.split(",");
        } else {
            dui.viewsActiveFilter[view] = [];
        }

        if (!noThemeChange) {
            $("style[data-href$='jquery-ui.min.css']").remove();
            $("link[href$='jquery-ui.min.css']").remove();
            $("head").prepend('<link rel="stylesheet" type="text/css" href="../lib/css/themes/jquery-ui/' + dui.views[view].settings.theme + '/jquery-ui.min.css" id="jqui_theme" />');
            dui.additionalThemeCss(dui.views[view].settings.theme);
        }

        if ($("#duiview_" + view).html() === undefined) {

            $("#dui_container").append("<div style='display:none;' id='duiview_" + view + "' class='dashui-view'></div>");
            $("#duiview_" + view).css(dui.views[view].settings.style);
            if (dui.views[view].settings.style.background_class) {
                $("#duiview_" + view).addClass(dui.views[view].settings.style.background_class);
            }

            dui.views[view].rerender = true;

            // Render all non-hqWidgets widgets
            for (var id in dui.views[view].widgets) {
                if (dui.views[view].widgets[id].tpl.substring(0,5) != "tplHq" && !dui.views[view].widgets[id].renderVisible) {
                    dui.renderWidget(view, id);

                    // Try to complete the widgetSet information to optimize the loading of widgetSets
                    if (!dui.views[view].widgets[id].widgetSet) {
                        var obj = $("#" + dui.views[view].widgets[id].tpl);
                        if (obj) {
                            dui.views[view].widgets[id].widgetSet = obj.attr("data-dashui-set");
                            isViewsConverted = true;
                        }
                    }
                } else {
                    // It is hqWidgets
                    if (!dui.views[view].widgets[id].widgetSet) {
                        dui.views[view].widgets[id].widgetSet = "hqWidgets";
                        isViewsConverted = true;
                    }
                }
            }

            if (dui.urlParams["edit"] === "") {
                jQuery(".editmode-helper").show();
                if (dui.binds.jqueryui) {
                    dui.binds.jqueryui._disable();
                }
            }
        } else {
            //console.log("renderView("+view+") - view already rendered");
        }
        // Views in Container verschieben
        $("#duiview_" + view).find("div[id$='container']").each(function () {
            //console.log($(this).attr("id")+ " contains " + $(this).attr("data-dashui-contains"));
            var cview = $(this).attr("data-dashui-contains");
            if (!dui.views[cview]) {
                $(this).append("error: view not found.");
                return false;
            } else if (cview == view) {
                $(this).append("error: view container recursion.");
                return false;
            }
            dui.renderView(cview, true);
            $("#duiview_" + cview).appendTo(this);
            $("#duiview_" + cview).show();

        });

        if (!hidden) {
            $("#duiview_" + view).show();

            if (dui.views[view].rerender) {
                dui.views[view].rerender = false;
                // render all hqWidgets
                for (var id in dui.views[view].widgets) {
                    if (dui.views[view].widgets[id].tpl.substring(0,5) == "tplHq" || dui.views[view].widgets[id].renderVisible) {
                        dui.renderWidget(view, id);
                    }
                }
            }
        }

        // Store modified view
        if (isViewsConverted) {
            dui.saveRemote();
        }
    },
    preloadImages: function (srcs) {
        if (!dui.preloadImages.cache) {
            dui.preloadImages.cache = [];
        }
        var img;
        for (var i = 0; i < srcs.length; i++) {
            img = new Image();
            img.src = srcs[i];
            dui.preloadImages.cache.push(img);
        }
    },
    reRenderWidget: function (widget) {
        $("#" + widget).remove();
        dui.renderWidget(dui.activeView, widget);
    },
    changeFilter: function (filter, showEffect, showDuration, hideEffect, hideDuration) {

        var widgets = dui.views[dui.activeView].widgets;
        if (filter == "") {
            // show all
            for (var widget in widgets) {
                if (widgets[widget].data.filterkey && widgets[widget].data.filterkey != "") {
                    $("#" + widget).show(showEffect, null, parseInt(showDuration));
                }
            }
            // Show hqWidgets
            if (typeof hqWidgets != "undefined") {
                setTimeout(function () {
                    var btn;
                    for (var widget in widgets) {
                        if (widgets[widget].data.filterkey && widgets[widget].data.filterkey != "" && (btn = hqWidgets.Get(widget))) {
                            btn.show();
                        }
                    }
                }, parseInt(showDuration) + 10);
            }
        } else if (filter == "$") {
            var btn;
            // hide all
            for (var widget in widgets) {
                if (hqWidgets && (btn = hqWidgets.Get(widget))) {
                    btn.hide(true);
                }
                $("#" + widget).hide(hideEffect, null, parseInt(hideDuration));
            }
        } else {
            dui.viewsActiveFilter[dui.activeView] = filter.split(",");
            for (var widget in widgets) {
                //console.log(widgets[widget]);
                if (widgets[widget].data.filterkey && widgets[widget].data.filterkey != "") {
                    if (dui.viewsActiveFilter[dui.activeView].length > 0 && dui.viewsActiveFilter[dui.activeView].indexOf(widgets[widget].data.filterkey) == -1) {
                        var btn;
                        if (typeof hqWidgets != "undefined") {
                            if (btn = hqWidgets.Get(widget)) {
                                btn.hide(true);
                            }
                        }
                        $("#" + widget).hide(hideEffect, null, parseInt(hideDuration));
                    } else {
                        $("#" + widget).show(showEffect, null, parseInt(showDuration));
                    }
                }
            }
            if (typeof hqWidgets != "undefined") {
                setTimeout(function () {
                    var btn;
                    // Show hqWidgets
                    for (var widget in widgets) {
                        if (btn = hqWidgets.Get(widget)) {
                            if (widgets[widget].data.filterkey && widgets[widget].data.filterkey != "") {
                                if (!(dui.viewsActiveFilter[dui.activeView].length > 0 && dui.viewsActiveFilter[dui.activeView].indexOf(widgets[widget].data.filterkey) == -1)) {
                                    btn.show();
                                }
                            }
                        }
                    }
                }, parseInt(showDuration) + 10);
            }

        }

        if (dui.binds.bars && dui.binds.bars.filterChanged) {
            dui.binds.bars.filterChanged(dui.activeView, filter);
        }
    },
    renderWidget: function (view, id) {
        var widget = dui.views[view].widgets[id];

        //console.log("renderWidget("+view+","+id+")");
        // Add to the global array of widgets
        dui.widgets[id] = {
            wid: id,
            data: new can.Observe($.extend({
                "wid": id
            }, widget.data))
        };
        //console.log(widget);
        // Register hm_id to detect changes
        // if (widget.data.hm_id != 65535)
        //   $.homematic("addUiState", widget.data.hm_id, widget.data.hm_wid);

        var widgetData = dui.widgets[id]["data"];
        widgetData.hm_id = widgetData.hm_id; //$.homematic("escape", widgetData.hm_id);

        try {
            // Append html element to view
            $("#duiview_" + view).append(can.view(widget.tpl, {hm: localData.uiState['_' + widget.data.hm_id], data: widgetData, view: view}));

            if (dui.urlParams["edit"] !== "") {
                if (widget.data.filterkey && widget.data.filterkey != "" && dui.viewsActiveFilter[view].length > 0 &&  dui.viewsActiveFilter[view].indexOf(widget.data.filterkey) == -1) {
                    $("#" + id).hide();
                    var btn;
                    if (hqWidgets && (btn = hqWidgets.Get(id))) {
                        btn.hide(true);
                    }
                }

            }

            if (widget.style && !widgetData._no_style) {
                $("#" + id).css(widget.style);
            }

            // If edit mode, bind on click event to open this widget in edit dialog
            if (dui.urlParams["edit"] === "") {
                $("#" + id).click(function (e) {

                    if (e.shiftKey) {
                        if (dui.activeWidget && dui.activeWidget != "none" && dui.activeWidget != id) {
                            if ($("#widget_multi_helper_"+id).html()) {
                                $("#widget_multi_helper_"+id).remove();
                                dui.multiSelectedWidgets.splice(dui.multiSelectedWidgets.indexOf(id), 1);
                            } else {
                                dui.inspectWidgetMulti(id);
                            }

                        } else {
                            if (dui.activeWidget != id) {
                                dui.inspectWidget(id);
                            }
                        }
                    } else {
                        if (dui.activeWidget != id) {
                            dui.inspectWidget(id);
                        }
                    }

                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                });

                if (dui.activeWidget == id) {
                    if (!widgetData || !widgetData._no_move) {
                        dui.draggable($("#"+id));
                    }
                    if (!widgetData || !widgetData._no_resize) {
                        dui.resizable($("#"+id));
                    }  
                }
            }
        } catch (e) {
            console.log("Error: can't render "+widget.tpl+" "+id+"\n\n"+e);
        }

    },
    changeView: function (view, hideOptions, showOptions, sync) {
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

        if (dui.inspectWidget) {
            dui.inspectWidget("none");
            dui.clearWidgetHelper();
            $("#select_active_widget").html("<option value='none' class='translate'>none selected</option>");
        }

        if (!dui.views[view]) {
            for (var prop in dui.views) {
                // object[prop]
                break;
            }
            view = prop;
        }

        if (dui.activeView !== view) {

            if (effect) {
                //console.log("effect");
                dui.renderView(view, true, true);

                // View ggf aus Container heraus holen
                if ($("#duiview_" + view).parent().attr("id") !== "dui_container") {
                    $("#duiview_" + view).appendTo("#dui_container");
                }

                if (sync) {
                    $("#duiview_" + view).show(showOptions.effect, showOptions.options, parseInt(showOptions.duration, 10), function () {
                        if (dui.views[view].rerender) {
                            dui.views[view].rerender = false;
                            for (var id in dui.views[view].widgets) {
                                if (dui.views[view].widgets[id].tpl.substring(0,5) == "tplHq" ||
                                    dui.views[view].widgets[id].renderVisible)
                                    dui.renderWidget(view, id);
                            }
                        }
                    }).dequeue();
                }
                $("#duiview_" + dui.activeView).hide(hideOptions.effect, hideOptions.options, parseInt(hideOptions.duration, 10), function () {
                    var list = $("link[href$='jquery-ui.min.css']");

                    if (list.length ==  0) {
                        $("head").prepend('<link rel="stylesheet" type="text/css" href="../lib/css/themes/jquery-ui/' + dui.views[view].settings.theme + '/jquery-ui.min.css" id="jqui_theme" />');
                    } else {
                        list.attr("href", '../lib/css/themes/jquery-ui/' + dui.views[view].settings.theme + '/jquery-ui.min.css');
                    }
                    $("style[data-href$='jquery-ui.min.css']").remove();
                    dui.additionalThemeCss(dui.views[view].settings.theme);

                    if (!sync) {
                        $("#duiview_" + view).show(showOptions.effect, showOptions.options, parseInt(showOptions.duration, 10), function () {
                            if (dui.views[view].rerender) {
                                dui.views[view].rerender = false;
                                for (var id in dui.views[view].widgets) {
                                    if (dui.views[view].widgets[id].tpl.substring(0,5) == "tplHq" ||
                                        dui.views[view].widgets[id].renderVisible)
                                        dui.renderWidget(view, id);
                                }
                            }
                        });
                    }
                });
            } else {

                dui.renderView(view, true);

                // View ggf aus Container heraus holen
                if ($("#duiview_" + view).parent().attr("id") !== "dui_container") {
                    $("#duiview_" + view).appendTo("#dui_container");
                }

                if (dui.views[dui.activeView].settings.theme != dui.views[view].settings.theme) {
                    if ($("link[href$='jquery-ui.min.css']").length ==  0) {
                        $("head").prepend('<link rel="stylesheet" type="text/css" href="../lib/css/themes/jquery-ui/' + dui.views[view].settings.theme + '/jquery-ui.min.css" id="jqui_theme" />');
                    } else {
                        $("link[href$='jquery-ui.min.css']").attr("href", '../lib/css/themes/jquery-ui/' + dui.views[view].settings.theme + '/jquery-ui.min.css');
                    }
                    $("style[data-href$='jquery-ui.min.css']").remove();
                }
                dui.additionalThemeCss(dui.views[view].settings.theme);
                $("#duiview_" + view).show();
                $("#duiview_" + dui.activeView).hide();

            }

        } else {
            dui.renderView(view);



            // View ggf aus Container heraus holen
            if ($("#duiview_" + view).parent().attr("id") !== "dui_container") {
                $("#duiview_" + view).appendTo("#dui_container");
            }
        }

        dui.activeView = view;

        $("#duiview_" + view).find("div[id$='container']").each(function () {
            var cview = $(this).attr("data-dashui-contains");
            $("#duiview_" + cview).show();
        });

        if (dui.instanceView) {
            localData.setValue(dui.instanceView, dui.activeView);
        }

        if (window.location.hash.slice(1) != view) {
            if (history && history.pushState) {
                history.pushState({}, "", "#" + view);
            }
        }

        // Navigation-Widgets

        $(".jqui-nav-state").each(function () {
            var $this = $(this);
            if ($this.attr("data-dashui-nav") == view) {
                $this.removeClass("ui-state-default")
                $this.addClass("ui-state-active");
            } else {
                $this.addClass("ui-state-default")
                $this.removeClass("ui-state-active");
            }
        });

        // --------- Editor -----------------

        if (dui.urlParams['edit'] === "") {
            dui.changeViewEdit(view);
        }

        return;
    },
    addView: function (view) {
        if (dui[view]) {
            return false;
        }
        dui.views[view] = {settings: {style: {}}, widgets: {}};
        dui.saveRemote(function () {
            dui.changeView(view);
            window.location.reload();
        });
    },
    loadRemote: function (callback, callbackArg) {
        dui.showWaitScreen(true, "<br/>Loading Views...<br/>", null, 12.5);
        dui.conn.readFile(dui.viewFile, function (data, err) {
            if (err) {
                alert(dui.viewFile + " " + err);
            }
            if (data) {
                if (typeof data == "string") {
                    dui.views = JSON.parse(data);
                } else {
                    dui.views = data;
                }
            } else {
                dui.views = null;
            }

            if (callback) {
                callback(callbackArg);
            }
            if (!dui.views) {
                //alert("No Views found on Server");
            }            
        });       
    },
    saveRemoteActive: false,
    saveRemote: function (cb) {
        if (dui.saveRemoteActive) {
            setTimeout(function (_cb) {
                dui.saveRemote(_cb);
            }, 1000, cb);
            return;
        }
        dui.saveRemoteActive = true;
        // Sync widget before it will be saved
        if (dui.activeWidget && dui.activeWidget.indexOf('_') != -1 && dui.syncWidget) {
            dui.syncWidget(dui.activeWidget);
        }
        
        dui.conn.writeFile(dui.viewFile, dui.views, function () {
            dui.saveRemoteActive = false;
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
        var oldTime = (new Date()).getTime();
        setInterval(function() {
            var currentTime = (new Date()).getTime();
            //console.log("checkWakeUp "+ (currentTime - oldTime));
            if (currentTime > (oldTime + 10000)) {
                oldTime = currentTime;
                for (var i = 0; i < dui.wakeUpCallbacks.length; i++) {
                    //console.log("calling wakeUpCallback!");
                    dui.wakeUpCallbacks[i]();
                }
            } else {
                oldTime = currentTime;
            }
        }, 2500);
    },
    onWakeUp: function (callback) {
        dui.wakeUpCallbacks.push(callback);
    },
    getObjDesc: function (id) {
        if (localData.metaObjects[id] !== undefined) {
            var parent = "";
            var p = localData.metaObjects[id]["Parent"];
            if (p !== undefined && localData.metaObjects[p]["DPs"] !== undefined) {
                parent = localData.metaObjects[p]["Name"] + "/";
            } else if (localData.metaObjects[id]["TypeName"] !== undefined) {
                if (localData.metaObjects[id]["TypeName"] == "VARDP") {
                    parent = dui.translate("Variable") + " / ";
                } else if (localData.metaObjects[id]["TypeName"] == "PROGRAM") {
                    parent = dui.translate("Program") + " / ";
                }
            }

            if (localData.metaObjects[id]["Address"] !== undefined) {
                return parent + localData.metaObjects[id]["Name"] + "/" + localData.metaObjects[id]["Address"];
            } else if (localData.metaObjects[id]["Name"]) {
                return parent + localData.metaObjects[id]["Name"];
            } else if (localData.metaObjects[id]["name"]) {
                return parent + localData.metaObjects[id]["name"];
            }
        } else if (id == 41) {
            return dui.translate("Service messages");
        } else if (id == 40) {
            return dui.translate("Alarms");
        }
        return id;
    },
    translateAll: function (lang) {
        lang  = lang || dui.language || 'en';

        $(".translate").each(function (idx) {
            var curlang = $(this).attr('data-lang');
            var text    = $(this).html();
            if (curlang != lang) {
                if (curlang) {
                    text = dui.translateBack(text, curlang);
                }

                var transText = dui.translate(text, lang);
                if (transText) {
                    $(this).html(transText);
                    $(this).attr('data-lang', lang);
                }
            }
        });
    },
    translate: function (text) {
        if (!this.words) {
            this.words = {
                'No connection to Server'      : {'en' : 'No connection to Server',      'de': 'Keine Verbindung zu Server',  'ru': 'Нет соединения с сервером'},
                ' done.<br/>'                  : {'en' : ' done.<br/>',                  'de': ' - erledigt.<br/>',           'ru': '. Закончено.<br/>'},
                '<br/>Loading Views...<br/>'   : {'en' : '<br/>Loading Views...<br/>',   'de': '<br/>Lade Views...<br/>',     'ru': '<br/>Загрузка пользовательских страниц...<br/>'},
                'Connecting to Server...<br/>' : {'en' : 'Connecting to Server...<br/>', 'de': 'Verbinde mit Server...<br/>', 'ru': 'Соединение с сервером...<br/>'},
                'Loading data objects...'      : {'en' : 'Loading data...',              'de': 'Lade Daten...',               'ru': 'Загрузка данных...'},
                'Loading data values...'       : {'en' : 'Loading values...<br/>',       'de': 'Lade Werte...<br/>',          'ru': 'Загрузка значений...<br/>'},
                'Loading Widget-Sets... <span id="widgetset_counter"></span>' : {
                    'en': 'Loading Widget-Sets... <span id="widgetset_counter"></span>',
                    'de': 'Lade Widget-Sätze... <span id="widgetset_counter"></span>',
                    'ru': 'Загрузка наборов элементов... <span id="widgetset_counter"></span>'}
            };
        }
        if (this.words[text]) {
            if (this.words[text][this.language]) {
                return this.words[text][this.language];
            } else if (this.words[text]["en"]) {
                return this.words[text]["en"];
            }
        }

        return text;
    },
    waitScreenVal: 0,
    showWaitScreen: function (isShow, appendText, newText, step) {
        var waitScreen = document.getElementById("waitScreen");
        if (!waitScreen && isShow) {
            $('body').append("<div id='waitScreen' class='dashui-wait-screen'><div id='waitDialog' class='waitDialog'><div class='dashui-progressbar '></div><div class='dashui-wait-text' id='waitText'></div></div></div>");
            waitScreen = document.getElementById("waitScreen");
            dui.waitScreenVal = 0;
        }

        $(".dashui-progressbar").progressbar({value: dui.waitScreenVal}).height(19);

        if (isShow) {
            $(waitScreen).show();
            if (newText !== null && newText !== undefined) {
                $('#waitText').html(dui.translate(newText));
            }
            if (appendText !== null && appendText !== undefined) {
                $('#waitText').append(dui.translate(appendText));
            }
            if (step !== undefined) {
                dui.waitScreenVal += step;
                setTimeout(function (_val) {
                    $(".dashui-progressbar").progressbar("value", _val);
                }, 0, dui.waitScreenVal)

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

var localData = {
    // All values of objects
    uiState:        new can.Observe({"_65535": {"Value": null}}),
    // Set values of objects
    setState:       new can.Observe({"_65535": {"Value": null}}),
    // Index arrays, like "functions", "rooms", "devices", and so on
    metaIndex:      {},
    // Array with all objects (Descriptions of objects)
    metaObjects:    {},
    setStateTimers: {},
    setValue: function (id, val) {
        //console.log("setValue("+id+","+val+")");

        // Check if this ID is a programm
        if (localData.metaObjects[id] &&
            localData.metaObjects[id]["TypeName"] !== undefined &&
            localData.metaObjects[id]["TypeName"] == "PROGRAM") {
            dui.conn.execProgramm(id);
        } else {
            this.setState.attr("_" + id, {Value: val});
            var d = new Date();
            var t = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
            var o = {};
            if (this.uiState.attr("_"+id+".Value") != val) {
                o["_" + id + ".LastChange"] = t;
            } else {
                o["_" + id + ".LastChange"] = this.uiState.attr("_"+id+".LastChange");
            }
            o["_" + id + ".Value"] = val;
            o["_" + id + ".Timestamp"] = t;
            o["_" + id + ".Certain"] = false;

            if (this.uiState["_" + id]) {
                this.uiState.attr(o);

                // Inform other widgets, that does not support canJS
                for (var i = 0, len = dui.onChangeCallbacks.length; i < len; i++) {
                    dui.onChangeCallbacks[i].callback(dui.onChangeCallbacks[i].arg, id, val);
                }
            }
        }
    },
    stateDelayed: function (id, val) {
        var attr = '_' + id;
        if (!this.setStateTimers[id]) {
            //console.log("setState id="+id+" val="+val);
            dui.conn.setPointValue(id, val);

            this.setState.removeAttr(attr);
            this.setStateTimers[id] = setTimeout(function () {
                if (localData.setState[attr]) {
                    localData.setStateTimers[id] = undefined;
                    localData.stateDelayed(id, localData.setState.attr(attr + ".Value"));
                }
                localData.setStateTimers[id] = undefined;
            }, 1000);
        }
    }
};

// WebApp Cache Management
if ('applicationCache' in window) {
    window.addEventListener('load', function(e) {
        window.applicationCache.addEventListener('updateready', function(e) {
            if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                dui.showWaitScreen(true, null, 'Update found, loading new Files...', 100);
                jQuery("#waitText").attr("id", "waitTextDisabled");
                jQuery(".dashui-progressbar").hide();
                try {
                    window.applicationCache.swapCache();
                } catch (e) {
                    console.log(e);
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
    dui.urlParams = {};
    while (match = search.exec(query)) {
        dui.urlParams[decode(match[1])] = decode(match[2]);
    }

    if (window.location.href.indexOf('edit.html') != -1) {
        dui.urlParams['edit'] = "";
    }
})();

// Start of initialisation: main ()
(function ($) {
    $(document).ready(function () {
        // Bind on change of some state
        localData.setState.bind("change", function (e, attr, how, newVal, oldVal) {
            //console.log("localData setState change "+how+" "+attr+" "+JSON.stringify(newVal));
            if (how == "set" || how == "add") {
                var id = attr.slice(1);//parseInt(attr.slice(1), 10);
                localData.stateDelayed(id, newVal.Value);
            }
        });

        // für iOS Safari - wirklich notwendig?
        $('body').on('touchmove', function (e) {
            if ($(e.target).closest("body").length == 0) {
                e.preventDefault();
            }
        });
        dui.translateAll();
        dui.preloadImages(["img/disconnect.png"]);

        $("#ccu-io-disconnect").dialog({
            modal: true,
            closeOnEscape: false,
            autoOpen: false,
            dialogClass: "noTitle",
            width: 400,
            height: 90
        });

        $(".dashui-version").html(dui.version);

        // Autorefresh nur wenn wir nicht im Edit-Modus sind
        var autoRefresh = dui.urlParams["edit"] !== "";
        if (!autoRefresh && dui.editInit) {
            dui.editInit();
        }

        dui.showWaitScreen(true, null, "Connecting to Server...<br/>", 0);

        function compareVersion (instVersion, availVersion) {
            var instVersionArr = instVersion.replace(/beta/, '.').split('.');
            var availVersionArr = availVersion.replace(/beta/,'.').split('.');

            var updateAvailable = false;

            for (var k = 0; k<3; k++) {
                instVersionArr[k] = parseInt(instVersionArr[k], 10);
                if (isNaN(instVersionArr[k])) { instVersionArr[k] = -1; }
                availVersionArr[k] = parseInt(availVersionArr[k], 10);
                if (isNaN(availVersionArr[k])) { availVersionArr[k] = -1; }
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

        dui.conn = servConn;
        dui.conn.init({
            onConnChange: function (isConnected) {
                if (isConnected) {
                    if (dui.isFirstTime) {
                        dui.conn.getVersion(function (version) {
                            if (!version) {
                                // Possible not authenticated, wait for request from server
                            } else {
                                dui.conn.touchFile("www/dashui/css/dashui-user.css");

                                if (compareVersion(version, dui.requiredServerVersion)) {
                                    // TODO Translate
                                    alert("Warning: requires Server version "+dui.requiredServerVersion+" - found Server version "+version+" - please update Server.");
                                }
                            }
                        });
                    }

                    $("#ccu-io-disconnect").dialog("close");
                    //console.log((new Date()) + " socket.io connect");

                    // Read all datapoints from server
                    if (dui.isFirstTime) {
                        dui.showWaitScreen(true, 'Loading data values...', null, 20);
                    }
                    dui.conn.getDataPoints(function (error) {
                        if (error) {
                            console.log("Possibly not authenticated, wait for request from server");
                            // Possibly not authenticated, wait for request from server
                        } else {
                            // Get Server language
                            var l = localData.uiState.attr("_69999.Value") || localData.uiState.attr("_System_Language.Value");
                            dui.language = l || dui.language;

                            // If metaIndex required, load it
                            if (dui.conn.getType() == 1) {
                                /* socket.io */
                                if (dui.isFirstTime) {
                                    dui.showWaitScreen(true, 'Loading data objects...', null, 20);
                                }
                                // Read all dataobjects from server
                                dui.conn.getDataObjects(function (data) {
                                    localData.metaObjects = data;
                                });
                                dui.conn.getDataIndex(function (data) {
                                    localData.metaIndex = data;
                                    if (typeof storage !== 'undefined' && storage.get(dui.storageKeyInstance)) {
                                        dui.initInstance();
                                    }
                                });
                            }

                            //console.log((new Date()) + " socket.io reconnect");
                            if (dui.isFirstTime) {
                                setTimeout(dui.init, 10);
                            }
                            dui.isFirstTime = false;
                        }
                    });

                    dui.serverDisconnected = false;
                } else{
                    //console.log((new Date()) + " socket.io disconnect");
                    $("#ccu-io-disconnect").dialog("open");
                    dui.serverDisconnected = true;
                }
            },
            onRefresh: function () {
                window.location.reload();
            },
            onUpdate: function (obj) {
                var name;
                // Check new model
                if (obj != null && obj.name && (name = obj.name.replace(/\./g, '_')) && localData.uiState['_' + name] !== undefined) {
                    var o = {};
                    o['_' + name + '.Value']      = obj.val;
                    o['_' + name + '.Timestamp']  = obj.ts;
                    o['_' + name + '.Certain']    = obj.ack;
                    o["_" + name + ".LastChange"] = obj.lc;

                    localData.uiState.attr(o);

                    // Inform other widgets, that do not support canJS
                    for (var i = 0, len = dui.onChangeCallbacks.length; i < len; i++) {
                        dui.onChangeCallbacks[i].callback(dui.onChangeCallbacks[i].arg, name, obj.val, obj.ack || (localData.metaObjects[name] && localData.metaObjects[name]["TypeName"] == "VARDP"));
                    }
                } else {
                    //console.log('Datenpunkte sind noch nicht geladen!');
                }
            },
            onAuth: function (message, salt) {
                if (dui.authRunning) {
                    return;
                }
                dui.authRunning = true;
                var users;
                if (duiConfig.auth.users && duiConfig.auth.users.length) {
                    users = '<select id="login-username" value="'+duiConfig.auth.users[0]+'" class="login-input-field">';
                    for (var z = 0; z < duiConfig.auth.users.length; z++) {
                        users += '<option value="'+duiConfig.auth.users[z]+'">'+duiConfig.auth.users[z]+'</option>';
                    }
                    users += '</select>';
                } else {
                    users = '<input id="login-username" value="" type="text" autocomplete="on" class="login-input-field" placeholder="'+dui.translate('User name')+'">'
                }

                var text = '<div id="login-box" class="login-popup" style="display:none">'+
                            '<div class="login-message">'+message+'</div>'+
                            '<div class="login-input-field">'+
                                '<label class="username">'+
                                    '<span class="translate">'+dui.translate('User name')+'</span>'+
                                    users +
                                '</label>'+
                                '<label class="password">'+
                                    '<span class="translate">'+dui.translate('Password')+'</span>'+
                                    '<input id="login-password" value="" type="password" class="login-input-field" placeholder="'+dui.translate('Password')+'">'+
                                '</label>'+
                                '<button class="login-button" type="button"  class="translate">'+dui.translate('Sign in')+'</button>'+
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
                        dui.authRunning = false;
                        console.log("user "+  user + ", " + pass + " " + salt);
                        dui.conn.authenticate(user, pass, salt);
                    }, 500);
                    return true;
                });
            }
        });

    });
    // Auto-Reconnect
    setInterval(function () {
        if (dui.serverDisconnected) {
            //console.log("trying to force reconnect...");
            $.ajax({
                url: "/dashui/index.html",
                success: function () {
                    window.location.reload();
                }
            });
        }
    }, 30000);

    dui.preloadImages(["../lib/css/themes/jquery-ui/kian/images/modalClose.png"]);

    dui.initWakeUp();

})(jQuery);

////// ----------------------- Connection "class" ---------------------- ////////////

// Todo - Why not members of the dui Object? Keep the global Namespace clean. Don't rely on $ === jQuery.

var connCallbacks = {
    onConnChange: null,
    onUpdate:     null,
    onRefresh:    null,
    onAuth:  null
};

var servConn = {
    _socket: null,
    _hub :   null,
    _onConnChange: null,
    _onUpdate: null,
    _isConnected: false,
    _connCallbacks: null,
    _authInfo: null,
    _isAuthDone: false,
    _isAuthRequired: false,
    _authRunning: false,
    _cmdQueue: [],
    _type:   1, // 0 - SignalR, 1 - socket.io, 2 - local demo

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
            if (typeof io != "undefined") {
                type = 1; // socket.io
            } else if (typeof $ != "undefined" && typeof $.connection != "undefined") {
                type = 0; // SignalR
            } else {
                type = 2; // local demo
            }
        }

        this._connCallbacks = connCallbacks;

        if (type == 0 || type == 'signalr') {
            this._type = 0;
            if (duiConfig.connLink) {
                $.connection.hub.url = duiConfig.connLink+"/signalr";
            }
            this._hub = $.connection.serverHub;
            if (!this._hub) {
                // Auto-Reconnect
                setInterval(function () {
                    $.ajax({
                        url: "/dashui/index.html",
                        success: function () {
                            window.location.reload();
                        }
                    })
                }, 10000);
                return;
            }
//            this._hub._myParent = this;

            var that = this;

            this._hub.client.updatePointValue = function (model) {
                if (that._connCallbacks.onUpdate) {
                    that._connCallbacks.onUpdate({name: model.name, val: model.val, ts: model.ts, ack: model.ack});
                }
            };

            this._hub.client.authRequest = function (message, salt) {
                this._isAuthRequired = true;
                this._isAuthDone     = false;

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

            };
            this._hub.client.refresh = function () {
                if (that._connCallbacks.onRefresh) {
                    that._connCallbacks.onRefresh();
                }
            };
            $.connection.hub.start().done(function () {
                that._isConnected = true;
                if (that._connCallbacks.onConnChange) {
                    that._connCallbacks.onConnChange(that._isConnected);
                }
            });
            $.connection.hub.reconnecting(function() {
                that._isConnected = false;
                if (that._connCallbacks.onConnChange) {
                    that._connCallbacks.onConnChange(that._isConnected);
                }
            });
            $.connection.hub.reconnected(function() {
                that._isConnected = true;
                if (that._connCallbacks.onConnChange) {
                    that._connCallbacks.onConnChange(that._isConnected);
                }
            });
            $.connection.hub.disconnected(function() {
                that._isConnected = false;
                if (that._connCallbacks.onConnChange) {
                    that._connCallbacks.onConnChange(that._isConnected);
                }
            });
        } else if (type == 1 || type == "socket.io") {
            this._type = 1;
            if (typeof io != "undefined") {
                if (typeof socketSession == 'undefined') {
                    socketSession = 'nokey';
                }
                var url;
                if (duiConfig.connLink) {
                    url = duiConfig.connLink;
                } else {
                    url = $(location).attr('protocol') + '//' + $(location).attr('host');
                }

                this._socket = io.connect(url + '?key=' + socketSession);
                this._socket._myParent = this;

                this._socket.on('connect', function () {
                    this._myParent._isConnected = true;
                    if (this._myParent._connCallbacks.onConnChange) {
                        this._myParent._connCallbacks.onConnChange(this._myParent._isConnected);
                    }
                });

                this._socket.on('disconnect', function () {
                    this._myParent._isConnected = false;
                    if (this._myParent._connCallbacks.onConnChange) {
                        this._myParent._connCallbacks.onConnChange(this._myParent._isConnected);
                    }
                });
                this._socket.on('reconnect', function () {
                    this._myParent._isConnected = true;
                    if (this._myParent._connCallbacks.onConnChange) {
                        this._myParent._connCallbacks.onConnChange(this._myParent._isConnected);
                    }
                });
                this._socket.on('refreshAddons', function () {
                    if (this._myParent._connCallbacks.onRefresh) {
                        this._myParent._connCallbacks.onRefresh();
                    }
                });

                this._socket.on('event', function (obj) {
                    if (obj == null) {
                        return;
                    }

                    var o = {};
                    o.name = obj[0]+"";
                    o.val  = obj[1];
                    o.ts   = obj[2];
                    o.ack  = obj[3];
                    o.lc   = obj[4];

                    if (this._myParent._connCallbacks.onUpdate) {
                        this._myParent._connCallbacks.onUpdate(o);
                    }

                });
            } else {
                //console.log("socket.io not initialized");
            }
        } else if (type == 2 || type == "local") {
            this._type       = 2;
            this._isAuthDone = true;

            this._isConnected = true;
            if (this._connCallbacks.onConnChange) {
                this._connCallbacks.onConnChange(this._isConnected);
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
        if (this._type == 0) {
            this._hub.server.getVersion().done(function (version) {
                if (callback) {
                    callback(version);
                }
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
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
        if (this._type == 0) {
            //SignalR
            this._hub.server.getVersion().done(function (version) {
                if (callback)
                    callback(version);
            })
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
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

        if (this._type == 0) {
            //SignalR
            this._hub.server.readFile(filename).done(function (data) {
                if (callback) {
                    callback(data);
                }
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
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
            // Load from ../datastore/dashui-views.json the demo views
            $.ajax({
                url: '../datastore/' + filename,
                type: 'get',
                async: false,
                dataType: 'text',
                cache: dui.useCache,
                success: function (data) {
                    try {
                        dui.views = $.parseJSON(data);
                        if (typeof dui.views == 'string') {
                            dui.views = $.parseJSON(dui.views);
                        }
                    } catch (e) {
                        // TODO Translate
                        alert('Invalid ' + filename + ' json format');
                    }
                    callback(dui.views);
                    if (!dui.views) {
                        // TODO Translate
                        alert('No Views found on Server');
                    }
                },
                error: function (state) {
                    // TODO Translate
                    alert('Cannot get '+ location.href+'datastore/'+filename + '\n' + state.statusText);
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

        if (this._type == 0) {
            //SignalR
            this._hub.server.touchFile (filename);
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('touchFile', filename);
        }
    },
    writeFile: function (filename, data, callback) {

        if (this._type == 0) {
            //SignalR
            this._hub.server.writeFile (filename, JSON.stringify(data)).done(function (isOk) {
                if (callback) {
                    callback(isOk);
                }
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('writeFile', filename, data, function (isOk) {
                if (callback) {
                    callback(isOk);
                }
            });
        }
    },
    readDir: function (dirname, callback) {
        if (this._type == 0) {
            //SignalR
            this._hub.server.readDir (dirname).done(function (jsonString) {
                var data;
                try {
                    data = JSON.parse(jsonString);
                } catch (e) {
                    console.log("readDir: Invalid JSON string - " + e);
                    data = null;
                }

                if (callback) {
                    callback (data);
                }
            });
        } else if (this._type == 1) {
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
        }
    },
    setPointValue: function (pointName, value) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }

        if (this._queueCmdIfRequired("setPointValue", pointName, value)) {
            return;
        }

        if (this._type == 0) {
            //SignalR
            this._hub.server.setDataPoint({name: pointName, val: value});
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('setState', [pointName, value]);
        } else if (this._type == 2) {
            //local
            console.log('This is only demo. No one point will be controlled.');
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

        if (this._type == 0) {
            //SignalR

            this._hub.server.getDataPoints().done(function (jsonString) {
                var data = {};
                if (jsonString === null) {
                    if (callback) {
                        callback('Authentication required');
                    }                    
                } else  if (jsonString !== undefined) {
                    try {
                        var _data = JSON.parse(jsonString);
                    } catch (e) {
                        console.log('getDataPoints: Invalid JSON string - ' + e);
                        data = null;
                        if (callback) {
                            callback('getDataPoints: Invalid JSON string - ' + e);
                        }
                    }
                }
                // Convert array to mapped object {name1: object1, name2: object2}
                for (var i = 0, len = _data.length; i < len; i++) {
                    if (_data[i]) {
                        var obj  = _data[i];
                        var dp   = obj.id;

                        data[dp] = obj;
                        if (!localData.uiState['_' + dp]) {
                            localData.uiState.attr('_' + dp, { Value: data[dp].val, Timestamp: data[dp].ts, Certain: data[dp].ack, LastChange: data[dp].lc});
                        } else {
                            var o = {};
                            o['_' + dp + '.Value']      = obj.val;
                            o['_' + dp + '.Timestamp']  = obj.ts;
                            o['_' + dp + '.Certain']    = obj.ack;
                            o['_' + dp + '.LastChange'] = obj.lc;
                        }
                    }
                }

                if (callback) {
                    callback();
                }
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
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
                        if (!localData.uiState['_' + dp]) {
                            try {
                                localData.uiState.attr('_' + dp, { Value: data[dp][0], Timestamp: data[dp][1], Certain: data[dp][2], LastChange: data[dp][3]});
                            } catch (e) {
                                console.log("Error: can't create uiState object for "+dp);
                                console.log(e);
                            }
                        } else {
                            var o = {};
                                o['_' + dp + '.Value']      = obj[0];
                                o['_' + dp + '.Timestamp']  = obj[1];
                                o['_' + dp + '.Certain']    = obj[2];
                                o['_' + dp + '.LastChange'] = obj[3];
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
            $.ajax({
                url: '../datastore/local-data.json',
                type: 'get',
                async: false,
                dataType: 'text',
                cache: dui.useCache,
                success: function (data) {
                    var _localData = $.parseJSON(data);
                    localData.metaIndex   = _localData.metaIndex;
                    localData.metaObjects = _localData.metaObjects;
                    for (var dp in _localData.uiState) {
                        localData.uiState.attr(dp, _localData.uiState[dp]);
                    }
                    callback(null);
                },
                error: function (state) {
                    console.log(state.statusText);
                    localData.uiState.attr('_no', { Value: false, Timestamp: null, Certain: true, LastChange: null});
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

        if (this._type == 0) {
            //SignalR
            this._hub.server.getDataObjects().done(function (jsonString) {
                var data = {};
                try {
                    var _data = JSON.parse(jsonString);
                    // Convert array to mapped object {name1: object1, name2: object2}
                    for (var i = 0, len = _data.length; i < len; i++) {
                        if (_data[i]) {
                            data[_data[i].id] = _data[i];
                            delete data[_data[i].id].id;
                        }
                    }
                } catch (e) {
                    console.log("getDataObjects: Invalid JSON string - " + e);
                    data = null;
                }

                if (callback) {
                    callback(data);
                }
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
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
        if (this._type == 0) {
            //SignalR
            if (callback) {
                callback([]);
            }
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
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
        if (this._type == 0) {
            //SignalR
            this._hub.server.addObject (objId, obj).done(function (cid) {
                if (callback) {
                    callback(cid);
                }
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
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
        if (this._type == 0) {
            //SignalR
            this._hub.server.deleteObject(objId);
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
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
            if (this._socket == null) {
                console.log('socket.io not initialized');
                return;
            }
            this._socket.emit('programExecute', [objId]);
        }
    },
    getUrl: function (url, callback) {
        if (!this._isConnected) {
            console.log("No connection!");
            return;
        }        
        if (this._type == 0) {
            //SignalR
            this._hub.server.getUrl(url).done(function (jsonString) {
                if (callback) {
                    callback(jsonString);
                }
            });
        } else if (this._type == 1) {
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
        if (this._type == 0) {
            //SignalR
            //this._hub.server.getUrl(url).done(function (jsonString) {
                if (callback) {
                    callback(null);
                }
            //});
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
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
        if (this._type == 0) {
            //SignalR
            //this._hub.server.getUrl(url).done(function (jsonString) {
            //});
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
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

        //SignalR
        if (this._type == 0) {
            var that = this;
            this._hub.server.authenticate(that._authInfo.user, that._authInfo.hash, that._authInfo.salt).done(function (error) {
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
                        that[__cmdQueue[t].func](__cmdQueue[t].args[0],__cmdQueue[t].args[1], __cmdQueue[t].args[2], __cmdQueue[t].args[3]);
                    }
                } else {
                    // Another authRequest should come, wait for this
                    console.log("Cannot authenticate: " + error);
                    this._authInfo = null;
                }
            });
        }
    }
}

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


if (window.location.search == "?edit") {
    alert("please use /dashui/edit.html instead of /dashui/?edit");
    location.href="./edit.html";
}