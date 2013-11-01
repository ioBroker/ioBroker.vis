/**
 *  DashUI
 *  https://github.com/hobbyquaker/dashui/
 *
 *  Copyright (c) 2013 hobbyquaker https://github.com/hobbyquaker
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

    version:            '0.9beta27',
    storageKeyViews:    'dashuiViews',
    storageKeySettings: 'dashuiSettings',
    storageKeyInstance: 'dashuiInstance',
    fileViews:          duiConfig.fileViews,
    instance:           null,
    urlParams:          {},
    settings:           {},
    views:              {},
    widgets:            {},
    activeView:         "",
    defaultHmInterval:  duiConfig.defaultHmInterval,
    listval:            [],
    widgetSets:         duiConfig.widgetSets,
    words:              null,
    currentLang:        duiConfig.currentLang,
    initialized:        false,
    useCache:           true,
    socket: {},
    binds: {},
    ccuIoDisconnected:  false,
    instanceView: undefined,
    instanceData: undefined,
    instanceCmd: undefined,
    viewsActiveFilter: {},
    bindInstance: function () {
        if (!dui.instanceCmd) {
            //console.log("can't bind instance :-(");
            return false;
        }
        //console.log("bind instance id="+dui.instanceCmd);

        homematic.uiState.bind("_" + dui.instanceCmd + ".Value", function(e, newVal) {
            var cmd = newVal;
            //console.log("external command cmd=" + cmd);

            if (cmd !== "") {
                var data = homematic.uiState.attr("_"+dui.instanceData+".Value");
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
                        setTimeout(function () {window.location.reload();}, 1);
                    case "dialog":
                        break;
                    case "popup":
                        window.open(data);
                        break;
                    default:
                }

                // remove command
                homematic.setValue(dui.instanceCmd, "");

            }

        });
    },
    removeInstance: function () {
        //storage.set(dui.storageKeyInstance, null);
        //var name = "dashui_"+dui.instance;
        // TODO REMOVE INSTANCE
       /* $.homematic("delVariable", name + "_cmd",
            function () {
                $.homematic("delVariable", name + "_data",
                    function () {
                        $.homematic("delVariable", name + "_view", function() { window.location.reload(); });
                    }
                );
            }
        );*/


    },
    loadWidgetSet: function (name) {
        //console.log("loadWidgetSet("+name+")");
        $.ajax({
            url: "widgets/"+name+".html",
            type: "get",
            async: false,
            dataType: "text",
            cache: dui.useCache,
            success: function (data) {
                jQuery("head").append(data);
            }
        });
    },
    loadWidgetSets: function () {
        for (var i = 0; i < dui.widgetSets.length; i++) {

            if (dui.widgetSets[i].name !== undefined) {
                dui.loadWidgetSet(dui.widgetSets[i].name);
                
                if (dui.urlParams['edit'] === "" && dui.widgetSets[i].edit) {
                    dui.loadWidgetSet(dui.widgetSets[i].edit);
                }
            } else {
                dui.loadWidgetSet(dui.widgetSets[i]);
            }
        }
    },
    initInstance: function () {
        dui.instance = storage.get(dui.storageKeyInstance);
        if (dui.instance) {



            $("#dashui_instance").val(dui.instance);
            $("#create_instance").hide();
            $("#instance").show();

            var cmdVarName = "dashui_"+dui.instance+"_cmd";
            var viewVarName = "dashui_"+dui.instance+"_view";
            var dataVarName = "dashui_"+dui.instance+"_data";

            var cmdId = homematic.regaIndex.Name[cmdVarName];
            if (cmdId) {

                $("body").append('<div class="dashui-dummy" data-hm-id="'+dui.instanceView+'"></div>')
                    .append('<div class="dashui-dummy" data-hm-id="'+dui.instanceCmd+'"></div>')
                    .append('<div class="dashui-dummy" data-hm-id="'+dui.instanceData+'"></div>');

                dui.instanceCmd = cmdId[0];
                dui.instanceView = homematic.regaIndex.Name[viewVarName][0];
                dui.instanceData = homematic.regaIndex.Name[dataVarName][0];

                dui.bindInstance();

            } else {
                //console.log("init instance failed - variables "+cmdVarName+" missing?");
            }
        }
    },
    init: function () {
        if (this.initialized) {
            return;
        }

        dui.loadWidgetSets();

        $("#loading").append(" done.<br/>");



        dui.initInstance();
        
        var settings = storage.get(dui.storageKeySettings);
        if (settings) {
            dui.settings = $.extend(dui.settings, settings);
        }

        // Late initialization (used only for debug)
        if (dui.binds.hqWidgetsExt) {
            dui.binds.hqWidgetsExt.hqInit ();
        }
            
        //dui.loadLocal();
        dui.loadRemote(dui.initNext);



    },
    initNext: function () {
        if (!dui.views) {
            dui.loadRemote(function() {
                $("#loading").html("").hide();
                // Erststart.
                dui.initViewObject();
            });
            return false;
        } else {
            $("#loading").html("").hide();
        }

        var hash = window.location.hash.substring(1);

        // View ausgewäfhlt?
        if (hash == "") {
            for (var view in dui.views) {
                dui.activeView = view;
                break;
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

        dui.changeView(dui.activeView);

        // Navigation
        $(window).bind( 'hashchange', function(e) {
            dui.changeView(window.location.hash.slice(1));
        });


        // EDIT mode
        if (dui.urlParams["edit"] === "") {
            // DashUI Editor Init

            var sel;

            var keys = Object.keys(dui.views),
                i, k, len = keys.length;

            keys.sort();

            for (i = 0; i < len; i++) {
                k = keys[i];

                if (k == dui.activeView) {
                    $("#inspect_view").html(dui.activeView);
                    sel = " selected";
                } else {
                    sel = "";
                }
                $("#select_view").append("<option value='"+k+"'"+sel+">"+k+"</option>")
                $("#select_view_copy").append("<option value='"+k+"'"+sel+">"+k+"</option>")
            }
            $("#select_view").multiselect("refresh");
            $("#select_view_copy").multiselect("refresh");
            $("#select_view").change(function () {
                dui.changeView($(this).val());
            });

            $("#select_set").change(dui.refreshWidgetSelect);
            $("#select_set").html ("");

            for (i = 0; i < dui.widgetSets.length; i++) {
                if (dui.widgetSets[i].name !== undefined)
                    $("#select_set").append("<option value='"+dui.widgetSets[i].name+"'>"+dui.widgetSets[i].name+"</option>");
                else
                    $("#select_set").append("<option value='"+dui.widgetSets[i]+"'>"+dui.widgetSets[i]+"</option>");
            }
            $("#select_set").multiselect("refresh");
            dui.refreshWidgetSelect();


            //console.log("TOOLBOX OPEN");
            $("#dui_editor").dialog("open");
            dui.binds.jqueryui._disable();

            // Create background_class property if does not exist
            if (dui.views[dui.activeView] != undefined) {
                if (dui.views[dui.activeView].settings == undefined) {
                    dui.views[dui.activeView].settings = new Object ();
                }
                if (dui.views[dui.activeView].settings.style == undefined) {
                    dui.views[dui.activeView].settings.style = new Object ();
                }
                if (dui.views[dui.activeView].settings.style['background_class'] == undefined) {
                    dui.views[dui.activeView].settings.style['background_class'] = "";
                }
            }


            // Init background selector
            if (dui.styleSelector) {
                dui.styleSelector.Show ({ width: 202,
                    name:       "inspect_view_bkg_def",
                    filterFile: "backgrounds.css",
                    style:      dui.views[dui.activeView].settings.style['background_class'],
                    parent:     $('#inspect_view_bkg_parent'),
                    onchange:   function (newStyle, obj) {
                        if (dui.views[dui.activeView].settings.style['background_class']) {
                            $("#duiview_"+dui.activeView).removeClass(dui.views[dui.activeView].settings.style['background_class']);
                        }
                        dui.views[dui.activeView].settings.style['background_class'] = newStyle;
                        $("#duiview_"+dui.activeView).addClass(dui.views[dui.activeView].settings.style['background_class']);
                    }
                });
            }


            
        }
        this.initialized = true;
    },
    refreshWidgetSelect: function () {
        $("#select_tpl").html("");
        var current_set = $("#select_set option:selected").val();
        $(".dashui-tpl[data-dashui-set='"+current_set+"']").each(function () {
            $("#select_tpl").append("<option value='"+$(this).attr("id")+"'>"+$(this).attr("data-dashui-name")+"</option>")
        });
        $("#select_tpl").multiselect("refresh");
    },
    initViewObject: function () {
        dui.views = {view1:{settings:{style:{}},widgets:{}}};
        dui.saveRemote();
        window.location.href='./?edit';
    },
    renderView: function (view, noThemeChange, showEffectComing) {

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
            $("head").prepend('<link rel="stylesheet" type="text/css" href="css/'+dui.views[view].settings.theme+'/jquery-ui.min.css" id="jqui_theme" />');
        }

        if ($("#dui_container").find("#duiview_"+view).html() === undefined) {
            $("#dui_container").append("<div style='display:none;' id='duiview_"+view+"' class='dashui-view'></div>");
            $("#duiview_"+view).css(dui.views[view].settings.style);
            if (dui.views[view].settings.style.background_class) {
                $("#duiview_"+view).addClass(dui.views[view].settings.style.background_class);
            }

            for (var id in dui.views[view].widgets) {
                dui.renderWidget(view, id);
            }

            //if (dui.activeView != view) {
            //    $("#duiview_"+view).hide();
            //}

            if (dui.urlParams["edit"] === "") {
                dui.binds.jqueryui._disable();
            }

        }

        /* Das versursacht "Flicker" beim Wechsel der VIew und sollte an dieser Stelle
            nicht notwendig sein (background_class wird bereits in Zeile 350 beim
            Rendern der View gesetzt)

        else
        // Set background style
        if (dui.views[view].settings.style.background_class !== undefined) {
            $("#duiview_"+view).addClass(dui.views[view].settings.style.background_class);
        } */

        // Views in Container verschieben
        $("#duiview_"+view).find("div[id$='container']").each(function () {
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
            $("#duiview_"+cview).appendTo(this);
            $("#duiview_"+cview).show();

        });

        if (!showEffectComing) { $("#duiview_"+view).show(); }
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
        $("#"+widget).remove();
        dui.renderWidget(dui.activeView, widget);
    },
    changeFilter: function (filter, showEffect, showDuration, hideEffect, hideDuration) {

        var widgets = dui.views[dui.activeView].widgets;
        if (filter == "") {
            // show all
            for (var widget in widgets) {
                $("#"+widget).show(showEffect, null, showDuration);
            }
        } else {
            dui.viewsActiveFilter[dui.activeView] = filter.split(",");
            for (var widget in widgets) {
                if (widgets[widget].data.filterkey && widgets[widget].data.filterkey != "" && dui.viewsActiveFilter[dui.activeView].length > 0 &&  dui.viewsActiveFilter[dui.activeView].indexOf(widgets[widget].data.filterkey) == -1) {
                    $("#"+widget).hide(hideEffect, null, hideDuration);
                } else {
                    $("#"+widget).show(showEffect, null, showDuration);
                }
            }
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
        
        // Append html element to view
        $("#duiview_"+view).append(can.view(widget.tpl, {hm: homematic.uiState["_"+widget.data.hm_id], data: widgetData, view: view}));

        if (dui.urlParams["edit"] !== "") {
            if (widget.data.filterkey && widget.data.filterkey != "" && dui.viewsActiveFilter[view].length > 0 &&  dui.viewsActiveFilter[view].indexOf(widget.data.filterkey) == -1) {
                $("#"+id).hide();
            }
        }

        if (widget.style) {
            $("#"+id).css(widget.style);
        }
        
        // If edit mode, bind on click event to open this widget in edit dialog
        if (dui.urlParams["edit"] === "") {
            $("#"+id).click(function (e) {
                if (dui.activeWidget != id) {
                    dui.inspectWidget(id);
                };
                e.preventDefault();
                return false;
            });
        }
    },
    changeView: function (view, hideOptions, showOptions, sync) {
        var effect = hideOptions && hideOptions.effect && hideOptions.effect !== "";
        hideOptions = $.extend(true, {effect:undefined,options:{},duration:0}, hideOptions);
        showOptions = $.extend(true, {effect:undefined,options:{},duration:0}, showOptions);

        if (dui.inspectWidget) {
            dui.inspectWidget("none");
            dui.clearWidgetHelper();
            $("#select_active_widget").html("<option value='none'>none selected</option>");
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
                console.log("effect");
                dui.renderView(view, true, true);

                // View ggf aus Container heraus holen
                if ($("#duiview_"+view).parent().attr("id") !== "dui_container") {
                    $("#duiview_"+view).appendTo("#dui_container");
                }

                if (sync) {
                    $("#duiview_"+view).show(showOptions.effect, showOptions.options, parseInt(showOptions.duration,10), function () { });
                }
                $("#duiview_"+dui.activeView).hide(hideOptions.effect, hideOptions.options, parseInt(hideOptions.duration,10), function () {



                    if ($("link[href$='jquery-ui.min.css']").length ==  0) {
                        $("head").prepend('<link rel="stylesheet" type="text/css" href="css/'+dui.views[view].settings.theme+'/jquery-ui.min.css" id="jqui_theme" />');
                    } else {
                        $("link[href$='jquery-ui.min.css']").attr("href", 'css/'+dui.views[view].settings.theme+'/jquery-ui.min.css');
                    }
                    $("style[data-href$='jquery-ui.min.css']").remove();

                    if (!sync) {
                        $("#duiview_"+view).show(showOptions.effect, showOptions.options, parseInt(showOptions.duration,10), function () { });
                    }
                });
            } else {

                dui.renderView(view, true);

                // View ggf aus Container heraus holen
                if ($("#duiview_"+view).parent().attr("id") !== "dui_container") {
                    $("#duiview_"+view).appendTo("#dui_container");
                }

                if (dui.views[dui.activeView].settings.theme != dui.views[view].settings.theme) {
                    if ($("link[href$='jquery-ui.min.css']").length ==  0) {
                        $("head").prepend('<link rel="stylesheet" type="text/css" href="css/'+dui.views[view].settings.theme+'/jquery-ui.min.css" id="jqui_theme" />');
                    } else {
                        $("link[href$='jquery-ui.min.css']").attr("href", 'css/'+dui.views[view].settings.theme+'/jquery-ui.min.css');
                    }
                    $("style[data-href$='jquery-ui.min.css']").remove();
                }
                $("#duiview_"+view).show();
                $("#duiview_"+dui.activeView).hide();

            }

        } else {
            dui.renderView(view);

            // View ggf aus Container heraus holen
            if ($("#duiview_"+view).parent().attr("id") !== "dui_container") {
                $("#duiview_"+view).appendTo("#dui_container");
            }
        }

        //console.log("changeView("+view+")");
        dui.activeView = view;

        $("#duiview_"+view).find("div[id$='container']").each(function () {
            var cview = $(this).attr("data-dashui-contains");
            $("#duiview_"+cview).show();
        });

        if (dui.instance) {
            homematic.setValue(dui.instanceView, dui.activeView);
        }

        if (window.location.hash.slice(1) != view) {
            history.pushState({}, "", "#" + view);
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
            // Init background selector
            if (dui.styleSelector) {
                dui.styleSelector.Show ({ width: 202,
                    name:       "inspect_view_bkg_def",
                    filterFile: "backgrounds.css",
                    style:      dui.views[view].settings.style.background_class,
                    parent:     $('#inspect_view_bkg_parent'),
                    onchange:   function (newStyle, obj) {
                        if (dui.views[dui.activeView].settings.style['background_class']) {
                            $("#duiview_"+dui.activeView).removeClass(dui.views[dui.activeView].settings.style['background_class']);
                        }
                        dui.views[dui.activeView].settings.style['background_class'] = newStyle;
                        $("#duiview_"+dui.activeView).addClass(dui.views[dui.activeView].settings.style['background_class']);
                    }
                });
            }


            $("#inspect_view").html(view);

            $("#select_active_widget").html("<option value='none'>none selected</option>");
            for (var widget in dui.views[dui.activeView].widgets) {
                var obj = $("#"+dui.views[dui.activeView].widgets[widget].tpl);
                $("#select_active_widget").append("<option value='"+widget+"'>"+widget+" ("+obj.attr("data-dashui-set")+ " " +obj.attr("data-dashui-name")+")</option>");
            }
            //console.log($("#select_active_widget").html());
            $("#select_active_widget").multiselect("refresh");

            if ($("#select_view option:selected").val() != view) {
                $("#select_view option").removeAttr("selected");
                $("#select_view option[value='"+view+"']").prop("selected", "selected");
                $("#select_view").multiselect("refresh");
            }
            $("#select_view_copy option").removeAttr("selected");
            $("#select_view_copy option[value='"+view+"']").prop("selected", "selected");
            $("#select_view_copy").multiselect("refresh");
            $(".dashui-inspect-view-css").each(function () {
                var $this = $(this);
                var attr = $this.attr("id").slice(17);
                $("#"+$this.attr("id")).val(dui.views[dui.activeView].settings.style[attr]);
            });
            $(".dashui-inspect-view").each(function () {
                var $this = $(this);
                var attr = $this.attr("id").slice(13);
                $("#"+$this.attr("id")).val(dui.views[dui.activeView].settings[attr]);
            });
            if (!dui.views[dui.activeView].settings["theme"]) {
                dui.views[dui.activeView].settings["theme"] = "dhive";
            }
            $("#inspect_view_theme option[value='"+dui.views[dui.activeView].settings.theme+"']").prop("selected", true);
            $("#inspect_view_theme").multiselect("refresh");


        }


        //console.log("activeView="+dui.activeView);
        return;
    },
    addView: function (view) {
        if (dui[view]) {
            return false;
        }
        dui.views[view] = {settings:{style:{}},widgets:{}};
        dui.saveRemote();
        dui.changeView(view);
        window.location.reload();
    },
    loadRemote: function (callback) {
        $("#loading").append("Please wait! Trying to load views from CCU.IO");
        dui.socket.emit("readFile", "dashui-views.json", function (data) {
            dui.views = data;
            if (!dui.views) {
                alert("No Views found on CCU.IO");
            }
            callback();
        });

    },
    saveRemote: function () {
        dui.socket.emit("writeFile", "dashui-views.json", dui.views, function () {
            //console.log("Saved views on CCU.IO");
        });
    },
    getObjDesc: function (id) {
        if (homematic.regaObjects[id] !== undefined) {
            var parent = "";
            var p = homematic.regaObjects[id]["Parent"];
            if (p !== undefined && homematic.regaObjects[p]["DPs"] !== undefined) {
                parent = homematic.regaObjects[p]["Name"] + "/";
            } else if (homematic.regaObjects[id]["TypeName"] !== undefined) {
                if (homematic.regaObjects[id]["TypeName"] == "VARDP") {  
                    parent = dui.translate("Variable") + " / ";
                } else if (homematic.regaObjects[id]["TypeName"] == "PROGRAM") {
                    parent = dui.translate("Program") + " / ";
                }
            }
        
            if (homematic.regaObjects[id]["Address"] !== undefined) {
                return parent + homematic.regaObjects[id]["Name"] + "/" + homematic.regaObjects[id]["Address"];
            } else {
                return parent + homematic.regaObjects[id]["Name"];
            }

        } else if (id == 41) {
            return dui.translate("Service messages");
        } else if (id == 40) {
            return dui.translate("Alarms");
        }
        return "";
    },
    translate: function (text) {
        return text;
    }
};

var homematic = {
    uiState: new can.Observe({"_65535":{"Value":null}}),
    setState: new can.Observe({"_65535":{"Value":null}}),
    regaIndex: {},
    regaObjects: {},
    setStateTimers: {},
    setValue: function (id, val) {
        //console.log("setValue("+id+","+val+")");

        // Check if this ID is a programm
        if (homematic.regaObjects [id] &&
            homematic.regaObjects [id]["TypeName"] !== undefined &&
            homematic.regaObjects [id]["TypeName"] == "PROGRAM") {
            dui.socket.emit("programExecute", [id]);
        }  else {
            this.setState.attr("_"+id, {Value:val});
            var d = new Date();
            var t = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            var o = {};
            o["_"+id+".Value"]     = val;
            o["_"+id+".Timestamp"] = t;
            o["_"+id+".Certain"]   = false;
            this.uiState.attr(o);
        }
    },
    stateDelayed: function (id, val) {
        var attr = "_"+id;
        if (!this.setStateTimers[id]) {
            //console.log("setState id="+id+" val="+val);
            dui.socket.emit("setState", [id, val]);

            this.setState.removeAttr(attr);
            this.setStateTimers[id] = setTimeout(function () {
                if (homematic.setState[attr]) {
                    homematic.setStateTimers[id] = undefined;
                    homematic.stateDelayed(id, homematic.setState.attr(attr + ".Value"));
                }
                homematic.setStateTimers[id] = undefined;
            }, 1000);
        }
    }
}

homematic.setState.bind("change", function (e, attr, how, newVal, oldVal) {
    //console.log("homematic setState change "+how+" "+attr+" "+newVal);
    if (how == "set" || how == "add") {
        var id = parseInt(attr.slice(1), 10);
        homematic.stateDelayed(id, newVal.Value);
    }
});


// Parse Querystring
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);
    dui.urlParams = {};
    while (match = search.exec(query)) {
        dui.urlParams[decode(match[1])] = decode(match[2]);
    }
    // if old edit type
    if (dui.urlParams['edit'] === "") {
        window.location.href = "./edit.html" + window.location.hash;
    }
    if (window.location.href.indexOf("edit.html") != -1) {
        dui.urlParams['edit'] = "";
    }
})();

(function($) {
    $(document).ready(function() {
        // für iOS Safari - wirklich notwendig?
        $('body').on('touchmove', function (e) {
            if ($(e.target).closest("body").length == 0) {
                e.preventDefault();
            }
        });

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
            dui.editInit ();
        }
        
        //console.log("socket.io")
        $("#loading").append("Connecting to CCU.IO ...<br/>");

        dui.socket = io.connect( $(location).attr('protocol') + '//' +  $(location).attr('host'));
        dui.socket.on('event', function(obj) {
            if (homematic.uiState["_"+obj[0]] !== undefined) {
                var o = {};
                o["_"+obj[0]+".Value"]     = obj[1];
                o["_"+obj[0]+".Timestamp"] = obj[2];
                o["_"+obj[0]+".Certain"]   = obj[3];            
                homematic.uiState.attr(o);
                
                // Ich habe keine Ahnung, aber bind("change") funktioniert einfach nicht 
                if (dui.binds.hqWidgetsExt && dui.binds.hqWidgetsExt.hqMonitor && obj[3])
                    dui.binds.hqWidgetsExt.hqMonitor (obj[0], obj[1]);
            }
            else {
                //console.log("Datenpunkte sind noch nicht geladen!");
            }
        });

        dui.socket.on('connect', function () {
            $("#ccu-io-disconnect").dialog("close");
            //console.log((new Date()) + " socket.io connect");
        });

        dui.socket.on('connecting', function () {
            //console.log((new Date()) + " socket.io connecting");
        });

        dui.socket.on('disconnect', function () {
            //console.log((new Date()) + " socket.io disconnect");
            $("#ccu-io-disconnect").dialog("open");
            dui.ccuIoDisconnected = true;
        });

        dui.socket.on('disconnecting', function () {
            //console.log((new Date()) + " socket.io disconnecting");
        });

        dui.socket.on('reconnect', function () {
            $("#ccu-io-disconnect").dialog("close");
            dui.ccuIoDisconnected = false;
            //console.log((new Date()) + " socket.io reconnect");
        });

        dui.socket.on('reconnecting', function () {
            //console.log((new Date()) + " socket.io reconnecting");
        });

        dui.socket.on('reconnect_failed', function () {
            //console.log((new Date()) + " socket.io reconnect failed");
        });

        dui.socket.on('error', function () {
            //console.log((new Date()) + " socket.io error");
        });

        $("#loading").append("Loading ReGa Data");

        dui.socket.emit("getIndex", function (index) {
            $("#loading").append(".");
            //console.log("index loaded");
            homematic.regaIndex = index;
            dui.socket.emit("getObjects", function (obj) {
                $("#loading").append(".");
                //console.log("objects loaded")
                homematic.regaObjects = obj;
                dui.socket.emit("getDatapoints", function (data) {
                    $("#loading").append(".<br/>");
                    //console.log("datapoints loaded");
                    for (var dp in data) {
                        homematic.uiState.attr("_"+dp, { Value: data[dp][0], Timestamp: data[dp][1], LastChange: data[dp][3]});
                    }
                    $("#loading").append("Loading Widget-Sets...");
                    setTimeout(dui.init, 10);

                });
            });
        });

    });

    // Auto-Reconnect
    setInterval(function () {
        if (dui.ccuIoDisconnected) {
            //console.log("trying to force reconnect...");
            $.ajax({
                url: "/dashui/index.html",
                success: function () {
                    window.location.reload();
                }
            })
        }
    }, 30000);

    dui.preloadImages(["/dashui/css/kian/images/modalClose.png"])

})(jQuery);
