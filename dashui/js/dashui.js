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

var dui = {

    version:                '0.9beta70',
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

    loadWidgetSet: function (name, callback) {
        //console.log("loadWidgetSet("+name+")");
        $.ajax({
            url: "widgets/" + name + ".html",
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

        for (var view in dui.views) {
            for (var id in dui.views[view].widgets) {
                // Views are not yet converted and have no widgetSet information)
                if (!dui.views[view].widgets[id].widgetSet) {
                    return null;
                } else if (widgetSets.indexOf(dui.views[view].widgets[id].widgetSet) == -1) {
                    var wset = dui.views[view].widgets[id].widgetSet;
                    widgetSets.push(wset);

                    if (duiConfig.dependencies && duiConfig.dependencies[wset]) {
                        for (var u = 0, ulen = duiConfig.dependencies[wset].length; u < ulen; u++) {
                            if (widgetSets.indexOf(duiConfig.dependencies[wset][u]) == -1) {
                                widgetSets.push(duiConfig.dependencies[wset][u]);
                            }
                        }
                    }
                }
            }
        }
        return widgetSets;
    },
    loadWidgetSets: function (callback) {
        dui.showWaitScreen(true, "Loading Widget-Sets ... <span id='widgetset_counter'></span>", null, 20);
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
        $("#widgetset_counter").html("<span style='font-size:10px'>("+(dui.toLoadSetsCount-1)+")</span>");

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

        localData.uiState.attr("_"+ dui.instanceCmd, {Value:''});
        localData.uiState.attr("_"+ dui.instanceData, {Value:''});
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
                        // Todo break;
                    case "reload":
                        setTimeout(function () {
                            window.location.reload();
                        }, 1);
                        break;
                    case "dialog":
                        // Todo Open Dialogs - special jqui dialog widgets attribute
                        break;
                    case "popup":
                        window.open(data);
                        break;
                    default:
                }

                // remove command
                localData.setValue(dui.instanceCmd, "");

            }

        });
        dui.instanceReady = true;

    },
    removeInstance: function () {
        storage.set(dui.storageKeyInstance, null);
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
        storage.set(dui.storageKeyInstance, dui.instance);
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
        dui.instance = storage.get(dui.storageKeyInstance);
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

                $("body").append('<div class="dashui-dummy" data-hm-id="' + dui.instanceView + '"></div>')
                    .append('<div class="dashui-dummy" data-hm-id="' + dui.instanceCmd + '"></div>')
                    .append('<div class="dashui-dummy" data-hm-id="' + dui.instanceData + '"></div>');

                dui.instanceCmd = cmdId[0];
                if (localData.metaIndex.Name[viewVarName]) {
                    dui.instanceView = localData.metaIndex.Name[viewVarName][0];
                }
                if (localData.metaIndex.Name[dataVarName]) {
                    dui.instanceData = localData.metaIndex.Name[dataVarName][0];
                }

                //console.log("instance ids: "+dui.instanceCmd+" "+dui.instanceView+" "+dui.instanceData);

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

        var settings = storage.get(dui.storageKeySettings);
        if (settings) {
            dui.settings = $.extend(dui.settings, settings);
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
                alert("unexpected error - this should not happen :(")
                $.error("this should not happen :(");
            }
        } else {
            if (dui.views[hash]) {
                dui.activeView = hash;
            } else {
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
            dui.editInitNext ();
        }
        this.initialized = true;
        // If this function called earlier, it makes problems under FireFox.
        dui.changeView(dui.activeView);
    },
    initViewObject: function () {
        dui.views = {view1: {settings: {style: {}}, widgets: {}}};
        dui.saveRemote();
        window.location.href = './?edit';
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
        }

        if ($("#dui_container").find("#duiview_" + view).html() === undefined) {
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

            if (widget.style) {
                $("#" + id).css(widget.style);
            }

            // If edit mode, bind on click event to open this widget in edit dialog
            if (dui.urlParams["edit"] === "") {
                $("#" + id).click(function (e) {
                    if (dui.activeWidget != id) {
                        dui.inspectWidget(id);
                    }

                    e.preventDefault();
                    return false;
                });

                if (dui.activeWidget == id) {
                    dui.draggable($("#"+id));
                    dui.resizable($("#"+id));
                }
            }
        } catch (e) {
            console.log("Error: can't render "+widget.tpl+" "+id+"\n\n"+e);
        }

    },
    changeView: function (view, hideOptions, showOptions, sync) {
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

            // Load meta data if not yet loaded
            var isMetaLoaded = false;
            for (var v in localData.metaObjects) {
                isMetaLoaded = true;
                break;
            }
            if (!isMetaLoaded) {
                // Read all dataobjects from server
                dui.conn.getDataObjects(function (data) {
                    localData.metaObjects = data;
                });
                dui.conn.getDataIndex(function (data) {
                    localData.metaIndex = data;
                });
            }


            // Init background selector
            if (dui.styleSelect) {
                dui.styleSelect.Show({ width: 180,
                    name:       "inspect_view_bkg_def",
                    filterFile: "backgrounds.css",
                    style:      dui.views[view].settings.style.background_class,
                    parent:     $('#inspect_view_bkg_parent'),
                    onchange:   function (newStyle, obj) {
                        if (dui.views[dui.activeView].settings.style['background_class']) {
                            $("#duiview_" + dui.activeView).removeClass(dui.views[dui.activeView].settings.style['background_class']);
                        }
                        dui.views[dui.activeView].settings.style['background_class'] = newStyle;
                        $("#duiview_" + dui.activeView).addClass(dui.views[dui.activeView].settings.style['background_class']);
                    }
                });
            }


            $("#inspect_view").html(view);

            $("#screen_size_x").val(dui.views[dui.activeView].settings.sizex || "").trigger("change");
            $("#screen_size_y").val(dui.views[dui.activeView].settings.sizey || "").trigger("change");

            $("#select_active_widget").html("<option value='none'>none selected</option>");
            for (var widget in dui.views[dui.activeView].widgets) {
                var obj = $("#" + dui.views[dui.activeView].widgets[widget].tpl);
                $("#select_active_widget").append("<option value='" + widget + "'>" + widget + " (" + obj.attr("data-dashui-set") + " " + obj.attr("data-dashui-name") + ")</option>");
            }
            //console.log($("#select_active_widget").html());
            $("#select_active_widget").multiselect("refresh");

            if ($("#select_view option:selected").val() != view) {
                $("#select_view option").removeAttr("selected");
                $("#select_view option[value='" + view + "']").prop("selected", "selected");
                $("#select_view").multiselect("refresh");
            }
            $("#select_view_copy option").removeAttr("selected");
            $("#select_view_copy option[value='" + view + "']").prop("selected", "selected");
            $("#select_view_copy").multiselect("refresh");
            $(".dashui-inspect-view-css").each(function () {
                var $this = $(this);
                var attr = $this.attr("id").slice(17);
                $("#" + $this.attr("id")).val(dui.views[dui.activeView].settings.style[attr]);
            });
            $(".dashui-inspect-view").each(function () {
                var $this = $(this);
                var attr = $this.attr("id").slice(13);
                $("#" + $this.attr("id")).val(dui.views[dui.activeView].settings[attr]);
            });
            if (!dui.views[dui.activeView].settings["theme"]) {
                dui.views[dui.activeView].settings["theme"] = "dhive";
            }
            $("#inspect_view_theme option[value='" + dui.views[dui.activeView].settings.theme + "']").prop("selected", true);
            $("#inspect_view_theme").multiselect("refresh");


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
        dui.conn.readFile("dashui-views.json", function (data, err) {
            if (err) {
                alert("dashui-views.json "+err);
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
                alert("No Views found on Server");
            }            
        });       
    },
    saveRemote: function (cb) {
        // Sync widget before it will be saved
        if (dui.activeWidget && dui.activeWidget.indexOf('_') != -1 && dui.syncWidget) {
            dui.syncWidget(dui.activeWidget);
        }
        
        dui.conn.writeFile("dashui-views.json", dui.views, function () {
            if (cb) {
                cb();
            }
            //console.log("Saved views on Server");
        });
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
            } else if (localData.metaObjects[id]["Name"]){
                return parent + localData.metaObjects[id]["Name"];
            } else if (localData.metaObjects[id]["name"]){
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
                "No connection to Server"    : {"en" : "No connection to Server", "de": "Keine Verbindung zu Server", "ru": "Нет соединения с Server"},
                "Loading Widget-Sets..."    : {"en" : "Loading Widget-Sets...", "de": "Lade Widget-Sätze...", "ru": "Загрузка наборов элементов..."},
                " done.<br/>"      : {"en" : " done.<br/>",     "de": " - erledigt.<br/>",         "ru": ". Закончено.<br/>"},
                "<br/>Loading Views...<br/>" : {"en" : "<br/>Loading Views...<br/>","de": "<br/>Lade Views...<br/>",     "ru": "<br/>Загрузка пользовательских страниц...<br/>"},
                "Connecting to Server ...<br/>": {"en" : "Connecting to Server ...<br/>", "de": "Verbinde mit Server ...<br/>", "ru": "Соединение с Server ...<br/>"},
                "Loading data objects": {"en" : "Loading data...", "de": "Lade Daten...", "ru": "Загрузка данных..."}
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
        }  else {
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
            dui.conn.setPointValue(this.uiState[attr].Name, val);

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
    // if old edit type
    if (dui.urlParams['edit'] === '') {
        window.location.href = './edit.html' + window.location.hash;
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
            //console.log("localData setState change "+how+" "+attr+" "+newVal);
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
        dui.translateAll ();
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

        dui.showWaitScreen(true, null, "Connecting to Server ...<br/>", 0);

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
                        dui.conn.touchFile("www/dashui/css/dashui-user.css");

                        dui.conn.getVersion(function (version) {
                            if (compareVersion(version, dui.requiredServerVersion)) {
                                alert("Warning: requires Server version "+dui.requiredServerVersion+" - found Server version "+version+" - please update Server.");
                            }
                        });
                    }

                    $("#ccu-io-disconnect").dialog("close");
                    //console.log((new Date()) + " socket.io connect");

                    // Read all datapoints from server
                    dui.conn.getDataPoints(function () {

                        // Get Server language
                        var l = localData.uiState.attr("_69999.Value") || localData.uiState.attr("_System_Language");
                        dui.language = l || dui.language;

                        // If metaIndex required, load it
                        if (dui.conn.getType() == 1) {
                            /* socket.io */
                            // Read all dataobjects from server
                            dui.conn.getDataObjects(function (data) {
                                localData.metaObjects = data;
                            });
                            dui.conn.getDataIndex(function (data) {
                                localData.metaIndex = data;
                                if (storage.get(dui.storageKeyInstance)) {
                                    dui.initInstance();
                                }
                            });
                        }
                    });

                    dui.serverDisconnected = false;
                    //console.log((new Date()) + " socket.io reconnect");
                    if (dui.isFirstTime) {
                        setTimeout(dui.init, 10);
                    }
                    dui.isFirstTime = false;
                } else {
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
            }
        });

        dui.showWaitScreen(true, 'Loading data objects', null, 15);
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

    dui.preloadImages(["../lib/css/themes/jquery-ui/kian/images/modalClose.png"])

})(jQuery);

////// ----------------------- Connection "class" ---------------------- ////////////

// Todo - Why not members of the dui Object? Keep the global Namespace clean. Don't rely on $ === jQuery.

var connCallbacks = {
    onConnChange: null,
    onUpdate:     null,
    onRefresh:    null
};

var servConn = {
    _socket: null,
    _hub :   null,
    _onConnChange: null,
    _onUpdate: null,
    _isConnected: false,
    _connCallbacks: null,
    _type:   1, // 0 - SignalR, 1 - socket.io, 2 - local demo

    getType: function () {
        return this._type;
    },
    init: function (connCallbacks, type) {
        if (typeof type == "string") {
            type = type.toLowerCase();
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
            this._hub.client.refresh = function () {
                if (that._connCallbacks.onRefresh) {
                    that._connCallbacks.onRefresh();
                }
            };
            $.connection.hub.start().done(function () {
                that._isConnected = true;
                if (that._connCallbacks.onConnChange){
                    that._connCallbacks.onConnChange(that._isConnected);
                }
            });
            $.connection.hub.reconnecting(function() {
                that._isConnected = false;
                if (that._connCallbacks.onConnChange){
                    that._connCallbacks.onConnChange(that._isConnected);
                }
            });
            $.connection.hub.reconnected(function() {
                that._isConnected = true;
                if (that._connCallbacks.onConnChange){
                    that._connCallbacks.onConnChange(that._isConnected);
                }
            });
            $.connection.hub.disconnected(function() {
                that._isConnected = false;
                if (that._connCallbacks.onConnChange){
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
                    if (this._myParent._connCallbacks.onConnChange){
                        this._myParent._connCallbacks.onConnChange(this._myParent._isConnected);
                    }
                });

                this._socket.on('disconnect', function () {
                    this._myParent._isConnected = false;
                    if (this._myParent._connCallbacks.onConnChange){
                        this._myParent._connCallbacks.onConnChange(this._myParent._isConnected);
                    }
                });
                this._socket.on('reconnect', function () {
                    this._myParent._isConnected = true;
                    if (this._myParent._connCallbacks.onConnChange){
                        this._myParent._connCallbacks.onConnChange(this._myParent._isConnected);
                    }
                });
                this._socket.on('refreshAddons', function () {
                    if (this._myParent._connCallbacks.onRefresh){
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

                    if (this._myParent._connCallbacks.onUpdate){
                        this._myParent._connCallbacks.onUpdate(o);
                    }

                });
            } else {
                console.log("socket.io not initialized");
            }
        } else if (type == 2 || type == "local") {
            this._type = 2;

            this._isConnected = true;
            if (this._connCallbacks.onConnChange){
                this._connCallbacks.onConnChange(this._isConnected);
            }
       }
    },
    getVersion: function (callback) {
        if (this._type == 0) {
            //SignalR
            this._hub.server.getVersion().done(function (version) {
                if (callback)
                    callback(version);
            })
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
                console.log("socket.io not initialized");
                return;
            }
            this._socket.emit('getVersion', function(version) {
                if (callback)
                    callback(version);
            });
        }
    },
    readFile: function (filename, callback) {
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
                console.log("socket.io not initialized");
                return;
            }
            this._socket.emit('readFile', filename, function(data, err) {
                if (callback) {
                    callback(data, err);
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
                    dui.views = $.parseJSON(data);
                    if (typeof dui.views == "string") {
                        dui.views = $.parseJSON(dui.views);
                    }
                    callback(dui.views);
                    if (!dui.views) {
                        alert("No Views found on Server");
                    }
                },
                error: function (state) {
                    window.alert('Cannot get '+ location.href+'datastore/'+filename + '\n' + state.statusText);
                }
            });
        }
    },
    touchFile: function (filename) {
        if (this._type == 0) {
            //SignalR
            this._hub.server.touchFile (filename);
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {console.log("socket.io not initialized"); return; }
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
            if (this._socket == null) {console.log("socket.io not initialized"); return; }
            this._socket.emit('writeFile', filename, data, function(isOk) {
                if (callback) {
                    callback(isOk);
                }
            });
        }
    },
    readDir: function (dirname, callback) {
        //SignalR
        if (this._type == 0) {
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
                console.log("socket.io not initialized");
                return;
            }
            this._socket.emit('readdir', dirname, function(data) {
                if (callback) {
                    callback(data);
                }
            });
        }
    },
    setPointValue: function (pointName, value) {
        if (this._type == 0) {
            //SignalR
            this._hub.server.setDataPoint({name: pointName, val: value});
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
                console.log("socket.io not initialized");
                return;
            }
            this._socket.emit('setState', [pointName, value]);
        }
    },
    getDataPoints: function (callback) {

        // @Bluefox: befüllen des Canjs Observable direkt hier, keine Übergabe mehr an Callback - imho schöner als 2x über das Array zu laufen
        //              im Socket.IO Teil passt das, aber für SignalR wird das Array immer noch 2x durchlaufen...

        if (this._type == 0) {
            //SignalR

            this._hub.server.getDataPoints().done(function (jsonString) {
                var data = {};
                try {
                    var _data = JSON.parse(jsonString);
                    // Convert array to mapped object {name1: object1, name2: object2}
                    for (var i = 0, len = _data.length; i < len; i++) {
                        if (_data[i]) {
                            data[_data[i].name.replace(/\./g, '_')] = _data[i];
                        }
                    }
                } catch (e) {
                    console.log("getDataPoints: Invalid JSON string - " + e);
                    data = null;
                }

                for (var dp in data) {
                    // Todo check if this works
                    var obj = data[dp];
                    if (!localData.uiState["_"+dp]) {
                        localData.uiState.attr("_" + dp, { Value: data[dp][0], Timestamp: data[dp][1], Certain: data[dp][2], LastChange: data[dp][3]});
                    } else {
                        var o = {};
                        o["_" + dp + ".Value"]     = obj.val;
                        o["_" + dp + ".Timestamp"] = obj.ts;
                        o["_" + dp + ".Certain"]   = obj.ack;
                        o["_" + dp + ".LastChange"]   = obj.lc;
                        // Todo - wofür ist das .Name Attribut?
                        o["_" + dp + ".Name"] = dp;
                    }
                }
                if (callback) {
                    callback();
                }
            });

        } else if (this._type == 1) {
            //socket.io

            if (this._socket == null) {
                return;
            }
            this._socket.emit('getDatapoints', function(data) {
                for (var dp in data) {
                    var obj = data[dp];
                    if (!localData.uiState["_"+dp]) {
                        localData.uiState.attr("_" + dp, { Value: data[dp][0], Timestamp: data[dp][1], Certain: data[dp][2], LastChange: data[dp][3]});
                    } else {
                        var o = {};
                        o["_" + dp + ".Value"]     = obj[0];
                        o["_" + dp + ".Timestamp"] = obj[1];
                        o["_" + dp + ".Certain"]   = obj[2];
                        o["_" + dp + ".LastChange"]   = obj[3];
                        // Todo - wofür ist das .Name Attribut?
                        o["_" + dp + ".Name"] = dp;
                        localData.uiState.attr(o);
                    }

                }
                if (callback) {
                    callback();
                }
            });

        }
    },
    getDataObjects: function (callback) {
        //console.log("getDataObjects");
        if (this._type == 0) {
            //SignalR
            this._hub.server.getDataObjects ().done(function (jsonString) {
                var data = {};
                try {
                    var _data = JSON.parse(jsonString);
                    // Convert array to mapped object {name1: object1, name2: object2}
                    for (var i = 0, len = _data.length; i < len; i++) {
                        if (_data[i]) {
                            data[_data[i].name.replace(/\./g, '_')] = _data[i];
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
                console.log("socket.io not initialized");
                return;
            }
            this._socket.emit('getObjects', function(data) {
                if (callback) {
                    callback(data);
                }
            });
        }
    },
    getDataIndex: function (callback) {
        //console.log("getDataIndex");
        if (this._type == 0) {
            //SignalR
            if (callback) {
                callback(null);
            }
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
                console.log("socket.io not initialized");
                return;
            }
            this._socket.emit('getIndex', function(data) {
                if (callback)
                    callback(data);
            });
        }
    },
    addObject: function (objId, obj, callback) {
        //SignalR
        if (this._type == 0) {
            this._hub.server.addObject (objId, obj).done(function (cid) {
                if (callback) {
                    callback(cid);
                }
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
                console.log("socket.io not initialized");
                return;
            }
            this._socket.emit('setObject', objId, obj, function(cid) {
                if (callback) {
                    callback(cid);
                }
            });
        }
    },
    delObject: function (objId) {
        if (this._type == 0) {
            //SignalR
            this._hub.server.deleteObject(objId);
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
                console.log("socket.io not initialized");
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
        //socket.io
        if (this._type == 1) {
            if (this._socket == null) {
                console.log("socket.io not initialized");
                return;
            }
            this._socket.emit('programExecute', [objId]);
        }
    },
    getUrl: function (url, callback) {
        if (this._type == 0) {
            //SignalR
            this._hub.server.getUrl (url).done(function (jsonString) {
                if (callback) {
                    callback(data);
                }
            });
        } else if (this._type == 1) {
            //socket.io
            if (this._socket == null) {
                console.log("socket.io not initialized");
                return;
            }
            this._socket.emit('getUrl', url, function(data) {
                if (callback) {
                    callback(data);
                }
            });
        }
    }
}

// IE8 indexOf compatibility
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    }
}
function _setTimeout(func, timeout, arg1, arg2, arg3, arg4, arg5, arg6) {
    setTimeout(function () {func(arg1, arg2, arg3, arg4, arg5, arg6);}, timeout);
}
