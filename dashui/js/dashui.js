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
;
//console.log("DashUI");
// dui - the DashUI Engine
var dui = {

    version:            '0.7.9',
    storageKeyViews:    'dashuiViews',
    storageKeySettings: 'dashuiSettings',
    storageKeyInstance: 'dashuiInstance',
    fileViews:          '/usr/local/addons/dashui/views.dui',
    instance:           null,
    urlParams:          {},
    settings:           {},
    views:              {},
    widgets:            {},
    activeView:         "",
    defaultHmInterval:  7500,
    listval:            [],
    widgetSets:         ["basic","colorpicker","fancyswitch","knob","jqplot","jqui","jqui-mfd","dev"],

    binds: {},
    startInstance: function () {
        $("#dashui_instance").val(dui.instance);
        $("#create_instance").hide();
        $("#instance").show();

        var name = "dashui_"+dui.instance;
        $.homematic("addStringVariable", name+"_view", "automatisch angelegt von DashUI.")
        $.homematic("addStringVariable", name+"_cmd", "automatisch angelegt von DashUI.")
        $.homematic("addStringVariable", name+"_data", "automatisch angelegt von DashUI.")

        $.homematic("addUiState", name+"_view");
        $.homematic("addUiState", name+"_cmd");
        $.homematic("addUiState", name+"_data");


        $("body").append('<div class="dashui-dummy" data-hm-id="'+name+'_view"></div>')
            .append('<div class="dashui-dummy" data-hm-id="'+name+'_cmd"></div>')
            .append('<div class="dashui-dummy" data-hm-id="'+name+'_data"></div>');

        homematic.uiState.bind("change", function( e, attr, how, newVal, oldVal ) {
            if (attr == ("_" + name + "_cmd.Value")) {
                var cmd = newVal;
                //console.log("change " + attr + " " + newVal);
                if (cmd !== "") {
                    setTimeout(function () {
                        var data = homematic.uiState.attr("_"+name+"_data.Value");

                        // external Commands
                        $.homematic("script",
                            "object o = dom.GetObject(\""+name+"_data\");\n" +
                                "o.State(\"\");\n" +
                                "o = dom.GetObject(\""+name+"_cmd\");\n" +
                                "o.State(\"\");"
                        );
                        switch (cmd) {
                            case "alert":
                                alert(data);
                                break;
                            case "changeView":
                                dui.changeView(data);
                                break;
                            case "refresh":
                                break;
                            case "reload":
                                setTimeout(function () {window.location.reload();}, 150);
                            case "dialog":
                                break;
                            case "popup":
                                window.open(data);
                                break;
                            default:
                        }


                    }, 50);
                }
            }
        });

    },
    removeInstance: function () {
        storage.set(dui.storageKeyInstance, null);
        var name = "dashui_"+dui.instance;
        $.homematic("delVariable", name + "_cmd",
            function () {
                $.homematic("delVariable", name + "_data",
                    function () {
                        $.homematic("delVariable", name + "_view", function() { window.location.reload(); });
                    }
                );
            }
        );


    },
    createInstance: function () {
        dui.instance = (Math.random() * 4294967296).toString(16);
        dui.instance = "0000000" + dui.instance;
        dui.instance = dui.instance.substr(-8);
        storage.set(dui.storageKeyInstance, dui.instance);
        dui.startInstance();
    },
    loadWidgetSet: function (name) {
        //console.log("loadWidgetSet("+name+")");
        $.ajax({
            url: "widgets/"+name+".html",
            type: "get",
            async: false,
            dataType: "text",
            cache: true,
            success: function (data) {
                jQuery("head").append(data);
            }
        });
    },
    loadWidgetSets: function () {
        for (var i = 0; i < dui.widgetSets.length; i++) {
            dui.loadWidgetSet(dui.widgetSets[i]);

        }
    },
    initInstance: function () {
        dui.instance = storage.get(dui.storageKeyInstance);
        if (!dui.instance) {
            $("#instance").hide();
            return;
        } else {
            dui.startInstance();
        }
    },
    init: function () {

        dui.loadWidgetSets();

        dui.initInstance();

        var settings = storage.get(dui.storageKeySettings);
        if (settings) {
            dui.settings = $.extend(dui.settings, settings);
        }

        dui.loadLocal();

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

        // View ausgewählt?
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
                window.location.href = "./?edit";
                $.error("dui Error can't find view");
            }
        }

        if (dui.views[dui.activeView] && dui.views[dui.activeView].settings != undefined && dui.views[dui.activeView].settings.style != undefined && dui.views[dui.activeView].settings.style['background'] != undefined) {
            $("#duiview_"+dui.activeView).css("background", dui.views[dui.activeView].settings.style['background']);
        }

        $("#active_view").html(dui.activeView);

        dui.changeView(dui.activeView);

        // Navigation
        $(window).bind( 'hashchange', function(e) {
            dui.changeView(window.location.hash.slice(1));
        });




//console.log("EDIT??");

        if (dui.urlParams["edit"] === "") {
            // DashUI Editor Init

            var sel;

            var keys = Object.keys(dui.views),
                i, k, len = keys.length;

            keys.sort();


            for (i = 0; i < len; i++) {
                k = keys[i];

                if (k == dui.activeView) {
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

            for (i = 0; i < dui.widgetSets.length; i++) {
                $("#select_set").append("<option value='"+dui.widgetSets[i]+"'>"+dui.widgetSets[i]+"</option>")

            }
            $("#select_set").multiselect("refresh");
            dui.refreshWidgetSelect();


            //console.log("TOOLBOX OPEN");
            $("#dui_editor").dialog("open");
            dui.binds.jqueryui._disable();
        }

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
        dui.saveLocal();
        window.location.href='./?edit';
    },
    renderView: function (view) {
        //console.log("renderView("+view+")");

        //console.log(dui.views[view].settings.style);
        if (!dui.views[view].settings.theme) {
            dui.views[view].settings.theme = "dhive";
        }
        if (!dui.views[view].settings.interval) {
            dui.views[view].settings.interval = dui.defaultHmInterval;
        }
        $("#jqui_theme").attr("href", "css/"+dui.views[view].settings.theme+"/jquery-ui.min.css");
        if ($("#dui_container").find("#duiview_"+view).html() == undefined) {
            $("#dui_container").append("<div id='duiview_"+view+"' class='dashui-view'></div>");
            $("#duiview_"+view).css(dui.views[view].settings.style);


            for (var id in dui.views[view].widgets) {
                dui.renderWidget(view, id);
            }


            if (dui.activeView != view) {
                $("#duiview_"+view).hide();
            }

            if (dui.urlParams["edit"] === "") {
                dui.binds.jqueryui._disable();
            }

        } else {
            //console.log(" - nothing to do");
        }

        // Views in Container verschieben
        $("#duiview_"+view).find("div[id$='container']").each(function () {
            //console.log($(this).attr("id")+ " contains " + $(this).attr("data-dashui-contains"));
            var cview = $(this).attr("data-dashui-contains")
            if (!dui.views[cview]) {
                $(this).append("error: view not found.");
                return false;
            } else if (cview == dui.activeView) {
                $(this).append("error: view container recursion.");
                return false;
            }
            dui.renderView(cview);
            $("#duiview_"+cview).appendTo(this).show();

        });

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
    renderWidget: function (view, id) {
        var widget = dui.views[view].widgets[id];
        //console.log("renderWidget("+view+","+id+")");
        dui.widgets[id] = {
            wid: id,
            data: new can.Observe($.extend({
                "wid": id
            }, widget.data))
        };
        //console.log(widget);

        $.homematic("addUiState", widget.data.hm_id);
        var widgetData = dui.widgets[id]["data"];
        widgetData.hm_id = $.homematic("escape", widgetData.hm_id);
        $("#duiview_"+view).append(can.view(widget.tpl, {hm: homematic.uiState["_"+widget.data.hm_id], data: widgetData}));

        if (widget.style) {
            $("#"+id).css(widget.style);
        }
        if (dui.urlParams["edit"] === "") {
            $("#"+id).click(function (e) {
                dui.inspectWidget(id);
                e.preventDefault();
                return false;
            });
        }

    },
    changeView: function (view, hideOptions, showOptions) {
        console.log("changeView("+view+","+hideOptions+","+showOptions+")");
        var effect = (hideOptions && hideOptions.effect && hideOptions.effect !== "" ? true : false);
        hideOptions = $.extend(true, {effect:undefined,options:{},duration:0}, hideOptions);
        showOptions = $.extend(true, {effect:undefined,options:{},duration:0}, showOptions);


        //console.log("changeView("+view+")");
        dui.inspectWidget("none");
        dui.clearWidgetHelper();
        //$("#duiview_"+dui.activeView).hide();
        $("#select_active_widget").html("<option value='none'>none selected</option>");
        //console.log($("#select_active_widget").html());

        if (!dui.views[view]) {
            for (var prop in dui.views) {
                // object[prop]
                break;
            }
            view = prop;
        }

        dui.renderView(view);



        if (dui.activeView !== view) {
            // View ggf aus Container heraus holen
            if ($("#duiview_"+dui.activeView).parent().attr("id") !== "dui_container") {
                $("#duiview_"+dui.activeView).appendTo("#dui_container");
            }
            console.log("hide "+dui.activeView);

            if (effect) {
                console.log("hideoptions..."); console.log(hideOptions);
                $("#duiview_"+dui.activeView).hide(hideOptions.effect, hideOptions.options, hideOptions.duration, function () {
                    console.log("show");
                    $("#jqui_theme").attr("href", "css/"+dui.views[view].settings.theme+"/jquery-ui.min.css");
                    $("#duiview_"+view).show(showOptions.effect, showOptions.options, showOptions.duration, function () {
                        console.log("show done");
                    });
                    console.log("hide done");
                });
            } else {
                $("#duiview_"+dui.activeView).hide();
                console.log("hide "+dui.activeView);
                $("#jqui_theme").attr("href", "css/"+dui.views[view].settings.theme+"/jquery-ui.min.css");
                $("#duiview_"+view).show();
                console.log("show "+view);
            }




        }

        //console.log("changeView("+view+")");
        dui.activeView = view;



        if (dui.views[view].settings.interval) {
            //console.log("setInterval "+dui.views[view].settings.interval);
            $.homematic("setInterval", dui.views[view].settings.interval);
        }








        if (dui.instance) {
            $.homematic("script", "object o = dom.GetObject('dashui_"+dui.instance+"_view');\no.State('"+dui.activeView+"');");
        }

        if (window.location.hash.slice(1) != view) {
            history.pushState({}, "", "#" + view);
        }


        // Editor
        $("#inspect_view").html(view);


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




        //console.log("activeView="+dui.activeView);
        return;


    },
    addView: function (view) {
        if (dui[view]) {
            return false;
        }
        dui.views[view] = {settings:{style:{}},widgets:{}};
        dui.saveLocal();
        dui.changeView(view);
        window.location.reload();
    },
    loadLocal: function () {
        dui.views = storage.get(dui.storageKeyViews);

        if (!dui.views) {
            //dui.views = {};
            //dui.loadRemote();
        }
    },
    loadRemote: function (err) {
        var cmd = "cat " + dui.fileViews + " | gzip -d\nexit 0\n";
        $("#loading").append("Please wait! Trying to load views from CCU.");
        $.homematic("shell", cmd, function (data) {
            if ($.trim(data) == "") {
                if (err) { err(); }
            } else {
                dui.views = $.parseJSON($.base64.decode($.trim(data)))
                storage.set(dui.storageKeyViews, null);
                dui.saveLocal();
                window.location.reload();
            }
        },
        function () {
            $("#loading").append("CCU Communication Error");
            $.error("CCU Communication Error")
        });
    }
};

// duiEdit - the DashUI Editor
dui = $.extend(true, dui, {
    toolbox:            $("#dui_editor"),
    selectView:         $("#select_view"),
    activeWidget:       "",

    renameView: function () {
        var val = $("#new_name").val();
        if (val != "" && dui.views[val] === undefined) {
            dui.views[val] = $.extend(true, {}, dui.views[dui.activeView]);
            delete(dui.views[dui.activeView]);
            storage.set(dui.storageKeyViews, dui.views);
            dui.renderView(val);
            dui.changeView(val);
            window.location.reload();
        }
    },
    delView: function () {
        if (confirm("Really delete view "+dui.activeView+"?")) {
                //console.log("delView "+dui.activeView);
                delete dui.views[dui.activeView];
                //console.log(dui.views);
                storage.set(dui.storageKeyViews, dui.views);
                window.location.href = "?edit";
           }
    },
    dupView: function (val) {
        if (val != "" && dui.views[val] === undefined) {
            dui.views[val] = $.extend(true, {}, dui.views[dui.activeView]);
            // Allen Widgets eine neue ID verpassen...
            for (var widget in dui.views[val].widgets) {
                dui.views[val].widgets[dui.nextWidget()] = dui.views[val].widgets[widget];
                delete dui.views[val].widgets[widget];
            }
            dui.saveLocal();
            dui.renderView(val);
            dui.changeView(val);
            window.location.reload();
        }
    },
    saveLocal: function () {
        //console.log(dui.views);

        storage.extend(dui.storageKeyViews, dui.views);
        storage.extend(dui.storageKeySettings, dui.settings);
    },
    saveRemote: function () {
        var content = $.base64.encode(JSON.stringify(dui.views));
        var cmd = "echo \"" + content + "\" | gzip > " + dui.fileViews + "\nexit 0\n";
        $.homematic("shell", cmd, function () {
            alert("Successfully saved views on Homematic CCU.");
        });
    },
    nextWidget: function () {
        var next = 1;
        var used = [];
        var key = "w" + (("000000" + next).slice(-5));
        for (var view in dui.views) {
            for (var wid in dui.views[view].widgets) {
                used.push(wid);
            }
            while (used.indexOf(key) > -1) {
                next += 1;
                key = "w" + (("000000" + next).slice(-5));
            }
        }
        return key;
    },
    delWidget: function () {
        dui.clearWidgetHelper();
        $("#select_active_widget option[value='"+dui.activeWidget+"']").remove();
        $("#select_active_widget").multiselect("refresh");
        $("#"+dui.activeWidget).remove();
        delete(dui.views[dui.activeView].widgets[dui.activeWidget]);
        dui.saveLocal();
        dui.inspectWidget("none");
    },
    addWidget: function (tpl, data, style) {
        if (!$("#dui_container").find("#duiview_"+dui.activeView)) {
            $("#dui_container").append("<div id='"+dui.activeView+"'></div>");
        }
        dui.clearWidgetHelper();

        var widgetId = dui.nextWidget();

        dui.widgets[widgetId] = {
            wid: widgetId,
            data: new can.Observe($.extend({
                "wid": widgetId,
                "title": undefined,
                "subtitle": undefined,
                "html": undefined,
                "hm_id": 65535,
                "hm_wid": undefined,
                "factor": 1,
                "digits": 6,
                off_text: undefined,
                on_text: undefined,
                buttontext: undefined
            }, data))
        };

        $("#duiview_"+dui.activeView).append(can.view(tpl, {hm: homematic.uiState["_"+dui.widgets[widgetId].data.hm_id], "data": dui.widgets[widgetId]["data"]}));

        if (!dui.views[dui.activeView]) {
            //console.log("views["+dui.activeView+"]==undefined :-(");
        }

        if (!dui.views[dui.activeView].widgets) {
            dui.views[dui.activeView].widgets = {};
        }
        if (!dui.views[dui.activeView].widgets[widgetId]) {
            dui.views[dui.activeView].widgets[widgetId] = {};
        }

        dui.views[dui.activeView].widgets[widgetId] = {
            tpl: tpl,
            data: data,
            style: style
        };

        if (style) {
            $("#"+widgetId).css(style);
        }


        dui.binds.jqueryui._disable();
        $("#"+widgetId).click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            dui.inspectWidget(widgetId);
            return false;
        });
        dui.activeWidget = widgetId;
        return widgetId;

    },
    dupWidget: function () {
        var activeView = dui.activeView;
        var targetView = $("#select_view_copy option:selected").val();
        //console.log(activeView + "." + dui.activeWidget + " -> " + targetView);
        var tpl = dui.views[dui.activeView].widgets[dui.activeWidget].tpl;
        var data = $.extend({}, dui.views[dui.activeView].widgets[dui.activeWidget].data);
        var style = $.extend({}, dui.views[dui.activeView].widgets[dui.activeWidget].style);
        if (activeView == targetView) {
            style.top += 10;
            style.left += 10;
            dui.activeWidget = dui.addWidget(tpl, data, style);

            $("#select_active_widget").append("<option value='"+dui.activeWidget+"'>"+dui.activeWidget+" ("+$("#"+dui.views[dui.activeView].widgets[dui.activeWidget].tpl).attr("data-dashui-name")+")</option>").multiselect("refresh");

            setTimeout(function() {
                dui.inspectWidget(dui.activeWidget);
                dui.saveLocal();
            }, 50);
        } else {
            if ($("#dui_container").find("#duiview_"+targetView).html() == undefined) {
                dui.renderView(targetView);
            }
            dui.activeView = targetView;
            dui.addWidget(tpl, data, style);
            dui.saveLocal();
            dui.activeView = activeView;
            alert("Widget copied to view " + targetView + ".");
        }
    },
    inspectWidget: function (id) {
        //console.log("inspectWidget("+id+")");

        $("#select_active_widget option[value='"+id+"']").prop("selected", true);
        $("#select_active_widget").multiselect("refresh");

        // Alle Widgets de-selektieren und Interaktionen entfernen
        $(".dashui-widget").each(function() { $(this).removeClass("dashui-widget-edit");
            if ($(this).hasClass("ui-draggable")) {
                $(this).draggable("destroy").resizable("destroy");
            }
        });

        // Inspector leeren
        $("#widget_attrs").html("");
        $(".dashui-inspect-css").each(function () {
            $(this).val("");
        });

        if (id === "none") {
            dui.clearWidgetHelper();
            $(".dashui-widget-tools").hide();
            return false;
        }

        var $this = $("#"+id);
        dui.activeWidget = id;
        var widget = dui.views[dui.activeView].widgets[id];

        // Inspector aufbauen
        $(".dashui-widget-tools").show();

        $(".dashui-inspect-widget").each(function () {
            var $this = $(this);
            var attr = $this.attr("id").slice(8);
            $this.val(dui.views[dui.activeView].widgets[dui.activeWidget].data[attr]);
        });

        var widget_attrs = $("#" + widget.tpl).attr("data-dashui-attrs").split(";");

        for (var attr in widget_attrs) {
            if (widget_attrs[attr] != "") {
                if (widget_attrs[attr].slice(0,4) !== "html") {
                    $("#widget_attrs").append('<tr id="option_'+widget_attrs[attr]+'" class="dashui-add-option"><td>'+widget_attrs[attr]+'</td><td><input type="text" id="inspect_'+widget_attrs[attr]+'" size="44"/></td></tr>');

                } else {
                    $("#widget_attrs").append('<tr id="option_'+widget_attrs[attr]+'" class="dashui-add-option"><td>'+widget_attrs[attr]+'</td><td><textarea id="inspect_'+widget_attrs[attr]+'" rows="2" cols="44"></textarea></td></tr>');

                }

                $("#inspect_"+widget_attrs[attr])
                    .val(widget.data[widget_attrs[attr]])
                    .change(function () {
                        var attribute = $(this).attr("id").slice(8);
                        //console.log("change "+attribute);
                        dui.widgets[dui.activeWidget].data.attr(attribute, $(this).val());
                        dui.views[dui.activeView].widgets[dui.activeWidget].data[attribute] = $(this).val();
                        dui.saveLocal();
                        dui.reRenderWidget(dui.activeWidget);
                    });
            }
        }


        $(".dashui-inspect-css").each(function () {
            $(this).val($this.css($(this).attr("id").slice(12)));
        });


        // Widget selektieren
        $("#select_active_widget option").removeAttr("selected");
        $("#select_active_widget option[value='"+id+"']").prop("selected", true);
        //console.log($("#select_active_widget").html());
        $("#select_active_widget").multiselect("refresh");

        //console.log("left:"+$this.css("left"));
        //console.log("top:"+$this.css("top"));
        //console.log("height:"+$this.outerHeight());
        //console.log("width:"+$this.outerWidth());

        $("#widget_helper")
            .css("left", pxAdd($this.css("left"), -2))
            .css("top", pxAdd($this.css("top"), -2))
            .css("height", $this.outerHeight()+2)
            .css("width", $this.outerWidth()+2)
            .show();

        $("#widget_inner_helper")
            .css("left", pxAdd($this.css("left"), -1))
            .css("top", pxAdd($this.css("top"), -1))
            .css("height", $this.outerHeight())
            .css("width", $this.outerWidth())
            .show();


        // Interaktionen
        var resizableOptions;
        if ($this.attr("data-dashui-resizable")) {
            resizableOptions = $.parseJSON($this.attr("data-dashui-resizable"));
        }
        if (!resizableOptions) {
            resizableOptions = {};
        }
        $this.draggable({
            cancel: false,
            stop: function(event, ui) {
                var widget = ui.helper.attr("id")
                $("#inspect_css_top").val(ui.position.top + "px");
                $("#inspect_css_left").val(ui.position.left + "px");

                if (!dui.views[dui.activeView].widgets[widget].style) {
                    dui.views[dui.activeView].widgets[widget].style = {};
                }
                dui.views[dui.activeView].widgets[widget].style.left = ui.position.left;
                dui.views[dui.activeView].widgets[widget].style.top = ui.position.top;
                dui.saveLocal();

            },
            drag: function(event, ui) {
                $("#widget_helper")
                    .css("left", (ui.position.left - 2) + "px")
                    .css("top", (ui.position.top - 2) + "px");
                $("#widget_inner_helper")
                    .css("left", (ui.position.left - 1) + "px")
                    .css("top", (ui.position.top - 1) + "px");

            }
        }).resizable($.extend({
            stop: function(event, ui) {
                var widget = ui.helper.attr("id")
                $("#inspect_css_width").val(ui.size.width + "px");
                $("#inspect_css_height").val(ui.size.height + "px");
                if (!dui.views[dui.activeView].widgets[widget].style) {
                    dui.views[dui.activeView].widgets[widget].style = {};
                }
                dui.views[dui.activeView].widgets[widget].style.width = ui.size.width;
                dui.views[dui.activeView].widgets[widget].style.height = ui.size.height;
                dui.saveLocal();

            },
            resize: function (event,ui) {
                $("#widget_helper")
                    .css("width", (ui.element.outerWidth() + 2) + "px")
                    .css("height", (ui.element.outerHeight() + 2)+ "px");
                $("#widget_inner_helper")
                    .css("width", ui.element.outerWidth() + "px")
                    .css("height", ui.element.outerHeight() + "px");
            }
        }, resizableOptions));

        // Inspector aufrufen
        $("#inspect_wid").html(id);
        $("#inspect_wid2").html(id);
        var tabActive = $("#tabs").tabs("option", "active");
        if (tabActive !== 1 && tabActive !== 2) {
            $("#tabs").tabs("option", "active", 1);
        }
    },
    clearWidgetHelper: function () {
        $("#widget_helper")
            .css("left", 0)
            .css("top", 0)
            .css("height", 0)
            .css("width", 0)
            .hide();
        $("#widget_inner_helper")
            .css("left", 0)
            .css("top", 0)
            .css("height", 0)
            .css("width", 0)
            .hide();
    }
});

function pxAdd(val, add) {
    if (!val) { val = "0px"; }
    var ret = parseInt(val.slice(0, -2), 10) + add;
    return ret + "px";
}

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
})();

(function($) {
    $(document).ready(function() {

        // für iOS Safari - wirklich notwendig?
        $('body').on('touchmove', function (e) {
            if ($(e.target).closest("body").length == 0) {
                e.preventDefault();
            }
        });

        $(".dashui-version").html(dui.version);

        $("#dui_editor").dialog({
            modal: false,
            autoOpen: false,
            width: 540,
            height: 610,
            position: { my: "right top", at: "right top", of: window },
            close: function () {
                dui.saveLocal();
                location.href = "./#"+dui.activeView;
            }
        });

        $("#tabs").tabs();
        $("#widget_helper").hide();
        $("#widget_inner_helper").hide();

        $("input.dashui-editor").each(function () {
            $(this).button();
        });
        $("select.dashui-editor").each(function () {
            $(this).multiselect({
                multiple: false,
                header: false,
                noneSelectedText: false,
                selectedList: 1,
                minWidth: $(this).attr("data-multiselect-width"),
                height: $(this).attr("data-multiselect-height")


            });
        });
        $("select.dashui-editor-large").each(function () {
            $(this).multiselect({
                multiple: false,
                header: false,
                noneSelectedText: false,
                selectedList: 1,
                minWidth: 320,
                height: 410

            });
        });
        $("select.dashui-editor-xlarge").each(function () {
            $(this).multiselect({
                multiple: false,
                header: false,
                noneSelectedText: false,
                selectedList: 1,
                minWidth: 420,
                height: 340

            });
        });


        // Button Click Handler
        $("#clear_cache").click(function() {
            $.homematic("clearCache");
        });
        $("#refresh").click(function() {
            $.homematic("refreshVisible");
        });
        $("#del_widget").click(dui.delWidget);
        $("#dup_widget").click(dui.dupWidget);
        $("#add_widget").click(function () {
            var tpl = $("#select_tpl option:selected").val();
            var data = {
                hm_id: 65535,
                digits: 6,
                factor: 1
            };
            dui.addWidget(tpl, data);
            $("#select_active_widget").append("<option value='"+dui.activeWidget+"'>"+dui.activeWidget+" ("+$("#"+dui.views[dui.activeView].widgets[dui.activeWidget].tpl).attr("data-dashui-name")+")</option>").multiselect("refresh");

            setTimeout(function () { dui.inspectWidget(dui.activeWidget) }, 50);

        });
        $("#add_view").click(function () {
            dui.addView($("#new_view_name").val());
        });
        $("#dup_view").click(function () {
            dui.dupView($("#new_view_name").val());
        });
        $("#del_view").click(function () {
            dui.delView(dui.activeView);
        });
        $("#rename_view").click(function () {
            dui.renameView(dui.activeView, $("#new_name").val());
        });

        $("#create_instance").click(dui.createInstance);
        $("#remove_instance").click(dui.removeInstance);

        $("#save_ccu").click(dui.saveRemote);

        $("#load_ccu").click(function () {
            dui.loadRemote(function () { alert("Load from CCU failed."); });
        });

        // Inspector Change Handler
        $(".dashui-inspect-widget").change(function () {
            var $this = $(this);
            var attr = $this.attr("id").slice(8);
            dui.views[dui.activeView].widgets[dui.activeWidget].data[attr] = $this.val();
            dui.saveLocal();
            dui.reRenderWidget(dui.activeWidget);
        });
        $(".dashui-inspect-css").change(function () {
            var $this = $(this);
            var style = $this.attr("id").substring(12);
            dui.views[dui.activeView].widgets[dui.activeWidget].style[style] = $this.val();
            dui.saveLocal();
            $("#"+dui.activeWidget).css(style, $this.val());
            $("#widget_helper")
                .css("left", pxAdd($("#"+dui.activeWidget).css("left"), -2))
                .css("top", pxAdd($("#"+dui.activeWidget).css("top"), -2))
                .css("height", $("#"+dui.activeWidget).outerHeight()+2)
                .css("width", $("#"+dui.activeWidget).outerWidth()+2);

            $("#widget_inner_helper")
                .css("left", pxAdd($("#"+dui.activeWidget).css("left"), -1))
                .css("top", pxAdd($("#"+dui.activeWidget).css("top"), -1))
                .css("height", $("#"+dui.activeWidget).outerHeight())
                .css("width", $("#"+dui.activeWidget).outerWidth());


        });
        $(".dashui-inspect-view-css").change(function () {
            var $this = $(this);
            var attr = $this.attr("id").slice(17);
            var val = $this.val();
            //console.log("change "+attr+" "+val);
            $("#duiview_"+dui.activeView).css(attr, val);
            dui.views[dui.activeView].settings.style[attr] = val;
            dui.saveLocal();
        });
        $(".dashui-inspect-view").change(function () {
            var $this = $(this);
            var attr = $this.attr("id").slice(13);
            var val = $this.val();
            //console.log("change "+attr+" "+val);
            dui.views[dui.activeView].settings[attr] = val;
            dui.saveLocal();
        });
        $("#inspect_view_theme").change(function () {
            var theme = $("#inspect_view_theme option:selected").val();
            //console.log("change theme "+theme);
            dui.views[dui.activeView].settings.theme = theme;
            $("#jqui_theme").attr("href", "css/"+theme+"/jquery-ui.min.css");
            dui.saveLocal();
        });
        $("#select_active_widget").change(function () {
            dui.inspectWidget($(this).val());
        });



        // Autorefresh nur wenn wir nicht im Edit-Modus sind
        var autoRefresh = dui.urlParams["edit"] !== "";

        // jqHomematic Plugin Init
        $.homematic({
            loadCcuData: false,
            autoRefresh: autoRefresh,
            ready: function () {
                dui.init();
            },
            loading: function (txt) {
                $("#loading").append(txt + "<br/>");
            }
        });
        //console.log("autoRefresh: " + autoRefresh);
    });


})(jQuery);