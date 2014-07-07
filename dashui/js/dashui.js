/**
 *  DashUI
 *  https://github.com/hobbyquaker/dashui/
 *
 *  Copyright (c) 2013-2014 hobbyquaker https://github.com/hobbyquaker, bluefox https://github.com/GermanBluefox
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 */

"use strict";

var dui = {

    version:                '0.9beta117',
    requiredServerVersion:  '1.0.28',
    storageKeyViews:        'dashuiViews',
    storageKeySettings:     'dashuiSettings',
    storageKeyInstance:     'dashuiInstance',
    instance:               null,
    instanceId:             undefined,
    instanceData:           undefined,
    instanceCmd:            undefined,
    urlParams:              {},
    settings:               {},
    views:                  {},
    widgets:                {},
    activeView:             "",
    widgetSets:             duiConfig.widgetSets,
    words:                  null,
    // TODO Rename ccuIoLang to server lang in the next version. (Server must support this new name)
    language:               (typeof ccuIoLang === 'undefined') ? 'en': (ccuIoLang || 'en'),
    initialized:            false,
    useCache:               true,
    binds:                  {},
    onChangeCallbacks:      [],
    viewsActiveFilter:      {},
    toLoadSetsCount:        0, // Count of widget sets that should be loaded
    isFirstTime:            true,
    authRunning:            false,
    viewFileSuffix:         window.location.search ? "-" + window.location.search.slice(1) : "",
    navChangeCallbacks:     [],
    editMode:               false,

    loadWidgetSet: function (name, callback) {
        var url = "./widgets/" + name + ".html?duiVersion="+dui.version;
        $.ajax({

            url: url,
            type: "GET",
            async: false,
            dataType: "html",
            cache: dui.useCache,
            success: function (data) {

                jQuery("head").append(data);
                dui.toLoadSetsCount -= 1;
                if (dui.toLoadSetsCount <= 0) {
                    dui.showWaitScreen(true, null, null, 100);
                    setTimeout(callback, 100);
                } else {
                    dui.showWaitScreen(true, null , null, parseInt((100-dui.waitScreenVal) / dui.toLoadSetsCount, 10));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                servConn.logError("Cannot load widget set " + name + " " + errorThrown);
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
        var widgetSets = dui.editMode ? null: dui.getUsedWidgetSets();

        // Firts calculate how many sets to load
        for (var i = 0; i < dui.widgetSets.length; i++) {
            var name = dui.widgetSets[i].name || dui.widgetSets[i];

            // Skip unused widget sets in non-edit mode
            if (widgetSets && widgetSets.indexOf(name) == -1) {
                continue;
            }

            arrSets[arrSets.length] = name;

            if (dui.editMode && dui.widgetSets[i].edit) {
                arrSets[arrSets.length] = dui.widgetSets[i].edit;
            }
        }
        dui.toLoadSetsCount = arrSets.length;
        $("#widgetset_counter").html("<span style='font-size:10px'>("+(dui.toLoadSetsCount)+")</span>");

        if (dui.toLoadSetsCount) {
            for (var i = 0, len = dui.toLoadSetsCount; i < len; i++) {
                _setTimeout(dui.loadWidgetSet, 100, arrSets[i], callback);
            }
        } else {
            if (callback) {
                callback();
            }
        }
    },
    bindInstance: function () {
        if (typeof storage !== 'undefined') {
            dui.instance = storage.get(dui.storageKeyInstance);
            $('#dashui_instance').val(dui.instance);
        }
        if (!dui.instance && dui.editMode){
            dui.generateInstance();
        }

        dui.instanceId   = 69800;
        dui.instanceCmd  = dui.instanceId + 1;
        dui.instanceData = dui.instanceCmd + 1;
        if (!localData.metaObjects[dui.instanceId]) {
            localData.metaObjects[dui.instanceId] = {
                _persistent: true,
                Name: "dashui.instanceID",
                TypeName: "VARDP"
            };
            dui.conn.addObject(dui.instanceId, localData.metaObjects[dui.instanceId]);
            localData.metaObjects[dui.instanceCmd] = {
                _persistent: true,
                Name: "dashui.command",
                TypeName: "VARDP"
            };
            dui.conn.addObject(dui.instanceCmd, localData.metaObjects[dui.instanceCmd]);
            localData.metaObjects[dui.instanceData] = {
                _persistent: true,
                Name: "dashui.data",
                TypeName: "VARDP"
            };
            dui.conn.addObject(dui.instanceData, localData.metaObjects[dui.instanceData]);
        }

        localData.uiState.bind("_" + dui.instanceCmd + ".Value", function (e, newVal) {
            var cmd = newVal;
             if (cmd !== "" &&
                 (localData.uiState["_" + dui.instanceId].Value == 'FFFFFFFF' ||
                  (dui.instance && localData.uiState["_" + dui.instanceId].Value == dui.instance))) {
                var data = localData.uiState.attr("_" + dui.instanceData + ".Value");
                // external Commands
                switch (cmd) {
                    case "alert":
                        alert(data);
                        break;
                    case "changedView":
                    	// Do nothing
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
                        servConn.logError("unknown external command "+cmd);
                }

                // remove command
                localData.setValue(dui.instanceCmd, "");
            }
        });

        $('#dashui_instance').change(function () {
            dui.instance = $(this).val();
            if (typeof storage !== 'undefined') {
                storage.set(dui.storageKeyInstance, dui.instance);
            }
        });
    },
    generateInstance: function () {
        dui.instance = (Math.random() * 4294967296).toString(16);
        dui.instance = "0000000" + dui.instance;
        dui.instance = dui.instance.substr(-8);
        $("#dashui_instance").val(dui.instance);
        if (typeof storage !== 'undefined') {
            storage.set(dui.storageKeyInstance, dui.instance);
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
                    if (!dui.editMode){
                        alert(dui.translate("error - View doesn't exist"));
                        window.location.href = "./edit.html";
                    } else {
                        dui.views["DemoView"] = dui.createDemoView ? dui.createDemoView() : {settings: {style: {}}, widgets: {}};
                        dui.activeView = "DemoView";
                        //dui.showWaitScreen(false);
                    }
                }
            }

            if (dui.activeView == "") {
                if (!dui.editMode) {
                    alert(dui.translate("error - View doesn't exist"));
                    window.location.href = "./edit.html";
                } else {
                    // All views were deleted, but file exists. Create demo View
                    //alert("unexpected error - this should not happen :(");
                    //$.error("this should not happen :(");
                    // create demoView
                    dui.views["DemoView"] = dui.createDemoView ? dui.createDemoView() : {settings: {style: {}}, widgets: {}};
                    dui.activeView = "DemoView";
                }
            }
        } else {
            if (dui.views[hash]) {
                dui.activeView = hash;
            } else {
                alert(dui.translate("error - View doesn't exist"));
                window.location.href = "./edit.html";
                $.error("dui Error can't find view");
            }
        }

        $("#active_view").html(dui.activeView);

        // Navigation
        $(window).bind('hashchange', function (e) {
            dui.changeView(window.location.hash.slice(1));
        });

        dui.bindInstance();

        // EDIT mode
        if (dui.editMode) {
            dui.editInitNext();
        }
        this.initialized = true;
        // If this function called earlier, it makes problems under FireFox.
        dui.changeView(dui.activeView);
    },
    initViewObject: function () {
        if (!dui.editMode) {
            window.location.href = './edit.html' + window.location.search;
        }
        else {
            if (confirm(dui.translate("no views found on server.\nCreate new %s ?", "dashui-views" + dui.viewFileSuffix + ".json"))) {
                dui.views = {};
                dui.views["DemoView"] = dui.createDemoView ? dui.createDemoView() : {settings: {style: {}}, widgets: {}};
                dui.saveRemote(function () {
                    window.location.reload()
                });
            } else {
                window.location.reload();
            }
        }
    },
    setViewSize: function (view) {
        var $view = $("#duiview_" + view);
        // Because of background, set the width and height of the view
        var width  = parseInt(dui.views[view].settings.sizex, 10);
        var height = parseInt(dui.views[view].settings.sizey, 10);
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
        //console.log("renderView("+view+","+noThemeChange+","+hidden+")");

        if (!dui.views[view] || !dui.views[view].settings) {
            alert("Cannot render view " + view + ". Invalid settings");
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
            var $view = $("#duiview_" + view);
            $view.css(dui.views[view].settings.style);
            if (dui.views[view].settings.style.background_class) {
                $view.addClass(dui.views[view].settings.style.background_class);
            }
            dui.setViewSize(view);
            dui.views[view].rerender = true;

            // Render all simple widgets
            for (var id in dui.views[view].widgets) {
                // Try to complete the widgetSet information to optimize the loading of widgetSets
                if (!dui.views[view].widgets[id].widgetSet) {
                    var obj = $("#" + dui.views[view].widgets[id].tpl);
                    if (obj) {
                        dui.views[view].widgets[id].widgetSet = obj.attr("data-dashui-set");
                        isViewsConverted = true;
                    }
                }

                if (!dui.views[view].widgets[id].renderVisible) {
                    dui.renderWidget(view, id);
                }
            }

            if (dui.editMode) {
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
                // render all copmlex widgets, like hqWidgets or bars
                for (var id in dui.views[view].widgets) {
                    if (dui.views[view].widgets[id].renderVisible) {
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
            dui.viewsActiveFilter[dui.activeView] = filter.split(",");
            var mWidget;
            for (var widget in widgets) {
                //console.log(widgets[widget]);
                if (widgets[widget].data.filterkey && widgets[widget].data.filterkey != "") {
                    if (dui.viewsActiveFilter[dui.activeView].length > 0 && dui.viewsActiveFilter[dui.activeView].indexOf(widgets[widget].data.filterkey) == -1) {
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
                            if (!(dui.viewsActiveFilter[dui.activeView].length > 0 && dui.viewsActiveFilter[dui.activeView].indexOf(widgets[widget].data.filterkey) == -1)) {
                                mWidget._customHandlers.onShow(mWidget, widget);
                            }
                        }
                    }
                }
            }, parseInt(showDuration) + 10);
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

        try {
        // Append html element to view
            if (widget.data && widget.data.hm_id) {
                $("#duiview_" + view).append(can.view(widget.tpl, {hm: localData.uiState['_' + widget.data.hm_id], data: widgetData, view: view}));
            }else {
                $("#duiview_" + view).append(can.view(widget.tpl, {data: widgetData, view: view}));
            }
            if (!dui.editMode) {
                if (widget.data.filterkey && widget.data.filterkey != "" && dui.viewsActiveFilter[view].length > 0 &&  dui.viewsActiveFilter[view].indexOf(widget.data.filterkey) == -1) {
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
            if (dui.editMode) {
                dui.bindWidgetClick(id);
            }
        } catch (e) {
            servConn.logError('Error: can\'t render ' + widget.tpl + ' ' + id + ' (' + e + ')');
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
            $("#select_active_widget").html('<option value="none">' + dui.translate('none selected') + '</option>');
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

                if (dui.views[view] && dui.views[view].settings) {
                    if (dui.views[dui.activeView] && dui.views[dui.activeView].settings &&
                        dui.views[dui.activeView].settings.theme != dui.views[view].settings.theme) {
                        if ($("link[href$='jquery-ui.min.css']").length ==  0) {
                            $("head").prepend('<link rel="stylesheet" type="text/css" href="../lib/css/themes/jquery-ui/' + dui.views[view].settings.theme + '/jquery-ui.min.css" id="jqui_theme" />');
                        } else {
                            $("link[href$='jquery-ui.min.css']").attr("href", '../lib/css/themes/jquery-ui/' + dui.views[view].settings.theme + '/jquery-ui.min.css');
                        }
                        $("style[data-href$='jquery-ui.min.css']").remove();
                    }
                    dui.additionalThemeCss(dui.views[view].settings.theme);
                }
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

        if (!dui.editMode) {
            localData.setValue(dui.instanceData, dui.activeView);
            localData.setValue(dui.instanceId, dui.instance);
            localData.setValue(dui.instanceCmd, "changedView");
        }

        if (window.location.hash.slice(1) != view) {
            if (history && history.pushState) {
                history.pushState({}, "", "#" + view);
            }
        }

        // Navigation-Widgets
        for (var i = 0; i < dui.navChangeCallbacks.length; i++) {
            dui.navChangeCallbacks[i](view);
        }

        // --------- Editor -----------------
        if (dui.editMode) {
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
            $(window).off('hashchange');
            window.location.hash = "#" + view;
            window.location.reload();
        });
    },
    loadRemote: function (callback, callbackArg) {
        dui.showWaitScreen(true, "<br/>Loading Views...<br/>", null, 12.5);
        dui.conn.readFile("dashui-views" + dui.viewFileSuffix + ".json", function (data, err) {
            if (err) {
                alert("dashui-views" + dui.viewFileSuffix + ".json" + " " + err);
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
        
        dui.conn.writeFile("dashui-views" + dui.viewFileSuffix + ".json", dui.views, function () {
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
    translateAll: function () {
        var lang  = dui.language || 'en';

        $(".translate").each(function (idx) {
            var text = $(this).attr('data-lang');
            if (!text) {
                text = $(this).html();
                $(this).attr('data-lang', text);
            }

            var transText = dui.translate(text);
            if (transText) {
                $(this).html(transText);
            }
        });
    },
    translate: function (text, arg) {
        var lang = dui.language || 'en';
        if (!this.words) {
            this.words = {
                'No connection to Server'      : {'en' : 'No connection to Server',      'de': 'Keine Verbindung zu Server',  'ru': 'Нет соединения с сервером'},
                ' done.<br/>'                  : {'en' : ' done.<br/>',                  'de': ' - erledigt.<br/>',           'ru': '. Закончено.<br/>'},
                '<br/>Loading Views...<br/>'   : {'en' : '<br/>Loading Views...<br/>',   'de': '<br/>Lade Views...<br/>',     'ru': '<br/>Загрузка пользовательских страниц...<br/>'},
                'Connecting to Server...<br/>' : {'en' : 'Connecting to Server...<br/>', 'de': 'Verbinde mit Server...<br/>', 'ru': 'Соединение с сервером...<br/>'},
                'Loading data objects...'      : {'en' : 'Loading data...',              'de': 'Lade Daten...',               'ru': 'Загрузка данных...'},
                'Loading data values...'       : {'en' : 'Loading values...<br/>',       'de': 'Lade Werte...<br/>',          'ru': 'Загрузка значений...<br/>'},
                'error - View doesn\'t exist'  : {'en' : 'View doesn\'t exist!',         'de': 'View existiert nicht!',       'ru': 'Страница не существует!'},
                'No Views found on Server' : {
                    'en': 'No Views found on Server',
                    'de': 'Keine Views gefunden am Server.',
                    'ru': 'На сервере не найдено никаких страниц.'
                },
                'All changes are saved locally. To reset changes clear the cache.'      : {
                    'en': 'All changes are saved locally. To reset changes clear the browser cache.',
                    'de': 'Alle Änderungen sind lokal gespeichert. Um Änderungen zu löschen, lösche Browsercache.',
                    'ru': 'Все изменения сохранены локально. Для отмены локальных изменений очистите кеш броузера.'
                },
                'please use /dashui/edit.html instead of /dashui/?edit': {
                    'en': 'Please use /dashui/edit.html instead of /dashui/?edit',
                    'de': 'Bitte geben Sie /dashui/edit.html statt /dashui/?edit',
                    'ru': 'Используйте /dashui/edit.html вместо /dashui/?edit'
                },
                'no views found on server.\nCreate new %s ?' : {
                    'en' : 'no views found on server.\nCreate new %s?',
                    'de': 'Keine Views gefunden am Server.\nErzeugen %s?',
                    'ru': 'На сервере не найдено никаких страниц. Создать %s?'
                },
                'Update found, loading new Files...'  : {
                    'en' : 'Update found.<br/>Loading new Files...',
                    'de': 'Neue Version gefunden.<br/>Lade neue Dateien...',
                    'ru': 'Обнаружено Обновление.<br/>Загружаю новые файлы...'
                },
                'Loading Widget-Sets... <span id="widgetset_counter"></span>' : {
                    'en': 'Loading Widget-Sets... <span id="widgetset_counter"></span>',
                    'de': 'Lade Widget-Sätze... <span id="widgetset_counter"></span>',
                    'ru': 'Загрузка наборов элементов... <span id="widgetset_counter"></span>'}
            };
        }
        if (this.words[text]) {
            var newText = this.words[text][lang];
            if (newText) {
                text = newText;
            } else {
                newText = this.words[text]["en"];
                if (newText) {
                    text = newText;
                }
            }
        }

        if (arg !== undefined) {
            text = text.replace('%s', arg);
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
    uiState:        null,
    // Set values of objects
    setState:       null,
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
    window.addEventListener('load', function (e) {
        window.applicationCache.addEventListener('updateready', function (e) {
            if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                dui.showWaitScreen(true, null, 'Update found, loading new Files...', 100);
                jQuery("#waitText").attr("id", "waitTextDisabled");
                jQuery(".dashui-progressbar").hide();
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
    dui.urlParams = {};
    while (match = search.exec(query)) {
        dui.urlParams[decode(match[1])] = decode(match[2]);
    }

    if (window.location.href.indexOf('edit.html') != -1 || dui.urlParams['edit'] === "") {
        dui.editMode = true;
    }
})();

// Start of initialisation: main ()
(function ($) {
    $(document).ready(function () {
        // On some platforms, the can.js is not immediately ready
        localData.uiState  = new can.Observe({"_65535": {"Value": null}});
        localData.setState = new can.Observe({"_65535": {"Value": null}});

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

        // Init edit dialog
        if (dui.editMode && dui.editInit) {
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
                //console.log("onConnChange isConnected="+isConnected);
                if (isConnected) {
                    $("#ccu-io-disconnect").dialog("close");
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

                        dui.showWaitScreen(true, 'Loading data values...', null, 20);
                    }

                    // Read all datapoints from server
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
                                });
                            }

                            //console.log((new Date()) + " socket.io reconnect");
                            if (dui.isFirstTime) {
                                setTimeout(dui.init, 10);
                            }
                            dui.isFirstTime = false;
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

    dui.preloadImages(["../lib/css/themes/jquery-ui/kian/images/modalClose.png"]);

    dui.initWakeUp();

})(jQuery);

////// ----------------------- Connection "class" ---------------------- ////////////


// The idea of servConn is to use this class later in every addon (Yahui, Control and so on).
// The addon just must say, what must be loaded (values, objects, indexes) and
// the class loads it for addon. Authentication will be done automatically, so addon does not care about it.
// It will be .js file with localData and servConn

// @Bluefox: ah ok - I understand, that makes sense.

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
            type = duiConfig.connType;

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

        var connLink = duiConfig.connLink || window.localStorage.getItem("connLink");
        if (type == 0 || type == 'signalr') {
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
            this.connection.reconnecting(function() {
                that._isConnected = false;
                if (that._connCallbacks.onConnChange) {
                    that._connCallbacks.onConnChange(that._isConnected);
                }
                that._autoReconnect();
            });
            this.connection.reconnected(function() {
                that._isConnected = true;
                if (that._connCallbacks.onConnChange) {
                    that._connCallbacks.onConnChange(that._isConnected);
                }
                that._autoReconnect();
            });
            this.connection.disconnected(function() {
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
                    if (this._myParent._isConnected == true) {
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
                    if (offlineTime > 12000) {
                        //window.location.reload();
                    }
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

        // start connection timer
        //this._autoReconnect();
		// Detect if running under cordova
		var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
		if (app) {
			$('body').append('<div id="system_menu" style="z-index:3000;width: 30%; height:30px; background-color: white; position:absolute; bottom: 0; left: 35%; display: none; border:1px solid black; text-align:center">' + dui.translate('Settings') + '</a></div>');
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
                        url += '?random='+Date.now().toString();
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
        if (this._type == 0) {
            this._hub.invoke('getVersion').done(function (version) {
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
            this._hub.invoke('getVersion').done(function (version) {
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
            this._hub.invoke('readFile', filename).done(function (data) {
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

            // Try load views from local storage
            if (filename.indexOf('dashui-views') != -1) {
                if (typeof storage !== 'undefined') {
                    dui.views = storage.get(filename);
                    if (dui.views) {
                        callback(dui.views);
                        return;
                    } else {
                        dui.views = {};
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
                        dui.views = jQuery.parseJSON(data);
                        if (typeof dui.views == 'string') {
                            dui.views = (JSON && JSON.parse(dui.views)) || jQuery.parseJSON(dui.views);
                        }
                    } catch (e) {
                        // TODO Translate
                        alert('Invalid ' + filename + ' json format');
                    }
                    callback(dui.views);
                    if (!dui.views) {
                        alert(dui.translate('No Views found on Server'));
                    }
                },
                error: function (state) {
                    // TODO Translate
                    alert('Cannot get ' + location.href + '/../datastore/'+filename + '\n' + state.statusText);
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
            this._hub.invoke('touchFile',filename);
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
            this._hub.invoke('writeFile', filename, JSON.stringify(data)).done(function (isOk) {
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
        } else if (this._type == 2) {
            if (filename.indexOf('dashui-views') != -1) {
                if (typeof storage !== 'undefined') {
                    storage.set(filename, dui.views);
                    if (!storage.get('localWarnShown')) {
                        alert(dui.translate('All changes are saved locally. To reset changes clear the cache.'));
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
        if (this._type == 0) {
            //SignalR
            this._hub.invoke('readDir',dirname).done(function (jsonString) {
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
            if (this._socket == null) {
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

        if (this._type == 0) {
            //SignalR
            this._hub.invoke('setDataPoint', {id: pointId, val: value});
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
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

        if (this._type == 0) {
            //SignalR

            this._hub.invoke('getDataPoints').done(function (jsonString) {
                var data = {};
                if (jsonString === null) {
                    if (callback) {
                        callback('Authentication required');
                    }                    
                } else  if (jsonString !== undefined) {
                    try {
                        var _data = (JSON && JSON.parse(jsonString)) || jQuery.parseJSON(jsonString);
                    } catch (e) {
                        servConn.logError('getDataPoints: Invalid JSON string - ' + e);
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
                                servConn.logError('Error: can\'t create uiState object for ' + dp + '(' + e + ')');
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
            jQuery.ajax({
                url: '../datastore/local-data' + dui.viewFileSuffix + '.json',
                type: 'get',
                async: false,
                dataType: 'text',
                cache: dui.useCache,
                success: function (data) {
                    var _localData = (JSON && JSON.parse(data)) || jQuery.parseJSON(data);
                    localData.metaIndex   = _localData.metaIndex;
                    localData.metaObjects = _localData.metaObjects;
                    for (var dp in _localData.uiState) {
                        try {
                            localData.uiState.attr(dp, _localData.uiState[dp]);
                        } catch(e) {
                            servConn.logError('Cannot export ' + dp);
                        }
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
            this._hub.invoke('getDataObjects').done(function (jsonString) {
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
                    servConn.logError('getDataObjects: Invalid JSON string - ' + e);
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
            this._hub.invoke('addObject', objId, obj).done(function (cid) {
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
            this._hub.invoke('deleteObject', objId);
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
            this._hub.invoke('getUrl', url).done(function (jsonString) {
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
            //this._hub.invoke('getUrl(url).done(function (jsonString) {
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
            //this._hub.invoke('getUrl(url).done(function (jsonString) {
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
    logError: function (errorText) {
        console.log("Error: " + errorText);
        if (!this._isConnected) {
            //console.log("No connection!");
            return;
        }
        if (this._type == 0) {
            //SignalR
            //this._hub.server.log(errorText);
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
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
};

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
    alert(dui.translate("please use /dashui/edit.html instead of /dashui/?edit"));
    location.href="./edit.html" + window.location.hash;
}
