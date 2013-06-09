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

//console.log("DashUI");
// dui - the DashUI Engine
var dui = {

    version:            '0.8.1',
    storageKeyViews:    'dashuiViews',
    storageKeySettings: 'dashuiSettings',
    storageKeyInstance: 'dashuiInstance',
    fileViews:          '/usr/local/etc/config/addons/www/dashui/views.dui',
    instance:           null,
    urlParams:          {},
    settings:           {},
    views:              {},
    widgets:            {},
    activeView:         "",
    defaultHmInterval:  7500,
    listval:            [],
    widgetSets:         ["basic","colorpicker","fancyswitch","knob","jqplot","jqui","jqui-mfd","dev"],
    words:              null,
    currentLang:        "de",
    initialized:        false,

    binds: {},
    startInstance: function () {
        $("#dashui_instance").val(dui.instance);
        $("#create_instance").hide();
        $("#instance").show();

        var name = "dashui_"+dui.instance;
        $.homematic("addStringVariable", name+"_view", "automatisch angelegt von DashUI.")
        $.homematic("addStringVariable", name+"_cmd",  "automatisch angelegt von DashUI.")
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
        if (this.initialized)
            return;
        
        dui.loadWidgetSets();

        dui.initInstance();

        var activeBkgClass = "";
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

        $("#active_view").html(dui.activeView);

        dui.changeView(dui.activeView);
        
        // Set background style
        if (dui.views[dui.activeView] && dui.views[dui.activeView].settings != undefined && dui.views[dui.activeView].settings.style != undefined) {
            if (dui.views[dui.activeView].settings.style['background'] != undefined) {
               $("#duiview_"+dui.activeView).css("background", dui.views[dui.activeView].settings.style['background']);
            }
            if (dui.views[dui.activeView].settings.style['background_class'] != undefined) {
                activeBkgClass = dui.views[dui.activeView].settings.style['background_class'];
                $("#duiview_"+dui.activeView).addClass(activeBkgClass);
            }
        }

        // Navigation
        $(window).bind( 'hashchange', function(e) {
            dui.changeView(window.location.hash.slice(1));
        });
//console.log("EDIT??");

        // EDIT mode
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
            $("#select_set").html ("");

            for (i = 0; i < dui.widgetSets.length; i++) {
                $("#select_set").append("<option value='"+dui.widgetSets[i]+"'>"+dui.widgetSets[i]+"</option>")

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
            hqStyleSelector.init ({ width: 202,
                            name: "inspect_view_bkg_def",
                            style: activeBkgClass,     
                            styles: {
							"Blue marine lines": "hq-background-blue-marine-lines",
							"Blue marine": "hq-background-blue-marine",
							"Blue flowers": "hq-background-blue-flowers",
							"Blue radial": "hq-background-radial-blue",
							"Black hor. gradient 0": "hq-background-h-gradient-black-0",
							"Black hor. gradient 1": "hq-background-h-gradient-black-1",
							"Black hor. gradient 2": "hq-background-h-gradient-black-2",
							"Black hor. gradient 3": "hq-background-h-gradient-black-3",
							"Black hor. gradient 4": "hq-background-h-gradient-black-4",
							"Black hor. gradient 5": "hq-background-h-gradient-black-5",
							"Orange hor. gradient 0": "hq-background-h-gradient-orange-0",
							"Orange hor. gradient 1": "hq-background-h-gradient-orange-1",
							"Orange hor. gradient 2": "hq-background-h-gradient-orange-2",
							"Orange hor. gradient 3": "hq-background-h-gradient-orange-3",
							"Blue hor. gradient 0": "hq-background-h-gradient-blue-0",
							"Blue hor. gradient 1": "hq-background-h-gradient-blue-1",
							"Blue hor. gradient 2": "hq-background-h-gradient-blue-2",
							"Blue hor. gradient 3": "hq-background-h-gradient-blue-3",
							"Blue hor. gradient 4": "hq-background-h-gradient-blue-4",
							"Blue hor. gradient 5": "hq-background-h-gradient-blue-5",
							"Blue hor. gradient 6": "hq-background-h-gradient-blue-6",
							"Blue hor. gradient 7": "hq-background-h-gradient-blue-7",
							"Yellow hor. gradient 0": "hq-background-h-gradient-yellow-0",
							"Yellow hor. gradient 1": "hq-background-h-gradient-yellow-1",
							"Yellow hor. gradient 2": "hq-background-h-gradient-yellow-2",
							"Yellow hor. gradient 3": "hq-background-h-gradient-yellow-3",
							"Green hor. gradient 0": "hq-background-h-gradient-green-0",
							"Green hor. gradient 1": "hq-background-h-gradient-green-1",
							"Green hor. gradient 2": "hq-background-h-gradient-green-2",
							"Green hor. gradient 3": "hq-background-h-gradient-green-3",
							"Green hor. gradient 4": "hq-background-h-gradient-green-4",
							"Gray flat 0": "hq-background-gray-0",
							"Gray flat 1": "hq-background-gray-1",
							"Gray hor. gradient 0": "hq-background-h-gradient-gray-0",
							"Gray hor. gradient 1": "hq-background-h-gradient-gray-1",
							"Gray hor. gradient 2": "hq-background-h-gradient-gray-2",
							"Gray hor. gradient 3": "hq-background-h-gradient-gray-3",
							"Gray hor. gradient 4": "hq-background-h-gradient-gray-4",
							"Gray hor. gradient 5": "hq-background-h-gradient-gray-5",
							"Gray hor. gradient 6": "hq-background-h-gradient-gray-6",
							"Gray graident": "hq-background-gradient-box",
                            },
                            parent: $('#inspect_view_bkg_parent'),
							onchange: function (newStyle, obj) {
                                if (dui.views[dui.activeView].settings.style['background_class'])
                                    $("#duiview_"+dui.activeView).removeClass(dui.views[dui.activeView].settings.style['background_class']);
								dui.views[dui.activeView].settings.style['background_class'] = newStyle;
								$("#duiview_"+dui.activeView).addClass(dui.views[dui.activeView].settings.style['background_class']);
							},
                          });
            
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
    },
    translate: function (text) {
        if (!this.words) {
            this.words = {
                "hm_id"   : {"en": "Homematic ID", "de": "Homematic ID",   "ru" : "Homematic ID"},
                "comment" : {"en" : "Comments",    "de": "Kommentare",     "ru" : "Êîììåíòàðèé"},	
                "Select HM parameter" : {"en" : "Select HM parameter", "de": "HM parameter ausw&auml;hlen",   "ru" : "Âûáðàòü HM àäðåñ"},	
                "Select"  : {"en" : "Select",      "de": "Auswahlen",      "ru" : "Âûáðàòü"},	
                "Cancel"  : {"en" : "Cancel",      "de": "Abbrechen",      "ru" : "Îòìåíà"},	
                "Name"    : {"en" : "Name",        "de": "Name",           "ru" : "Èìÿ"},	
                "Location": {"en" : "Location",    "de": "Raum",           "ru" : "Ïîëîæåíèå"},	
                "Interface"  : {"en" : "Interface","de": "Schnittstelle",  "ru" : "Èíòåðôåéñ"},	
                "Type"    : {"en" : "Type",        "de": "Typ",            "ru" : "Òèï"},	
                "Address" : {"en" : "Address",     "de": "Adresse",        "ru" : "Àäðåñ"},	
                "Function": {"en" : "Function",    "de": "Gewerk",         "ru" : "Íàçíà÷åíèå"},	
            };
        }
        // Search the array 
        /*for (var i = 0; i < this.words.length; i++)
        {
            if (this.words[i]["Text"] == text) {
                return (this.words[i][this.currentLang]) ? this.words[i][this.currentLang] : text;
            }
        }*/
        if (this.words[text] && this.words[text][this.currentLang])
            return this.words[text][this.currentLang];

        return text;
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
                if (widget_attrs[attr] === "hm_id") {
                    $("#widget_attrs").append('<tr id="option_'+widget_attrs[attr]+'" class="dashui-add-option"><td>'+this.translate(widget_attrs[attr])+'</td><td><input type="text" id="inspect_'+widget_attrs[attr]+'" size="44" style="width:90%"/><input type="button" id="inspect_'+widget_attrs[attr]+'_hmid" value="..."  style="width:8%"></td></tr>');
                    document.getElementById ("inspect_"+widget_attrs[attr]+"_hmid").jControl = widget_attrs[attr];
                    // Select Homematic ID Dialog
                    $("#inspect_"+widget_attrs[attr]+"_hmid").click ( function () {
                        hmSelect.value = $("#inspect_"+this.jControl).val();
                        hmSelect.show (homematic.ccu, this.jControl, function (obj, value) {
                            $("#inspect_"+obj).val(value);
                        });
                    });
                } else
                if (widget_attrs[attr] === "src") {
                    $("#widget_attrs").append('<tr id="option_'+widget_attrs[attr]+'" class="dashui-add-option"><td>'+this.translate(widget_attrs[attr])+'</td><td><input type="text" id="inspect_'+widget_attrs[attr]+'" size="44"/><input type="button" id="inspect_'+widget_attrs[attr]+'_btn" value="..."></td></tr>');
                    document.getElementById ("inspect_"+widget_attrs[attr]+"_btn").jControl = widget_attrs[attr];
                    // Select image Dialog
                    $("#inspect_"+widget_attrs[attr]+"_btn").click ( function () {
                        var settings = {
                            current: $("#inspect_"+this.jControl).val(),
                            onselectArg: this.jControl,
                            onselect:    function (img, obj)
                            {
                                $("#inspect_"+obj).val(img);
                                $("#inspect_"+obj).trigger("change");
                            }};
                        imageSelect.Show (settings);
                    });
                } else
                if (widget_attrs[attr].slice(0,4) !== "html") {
                    $("#widget_attrs").append('<tr id="option_'+widget_attrs[attr]+'" class="dashui-add-option"><td>'+this.translate(widget_attrs[attr])+'</td><td><input type="text" id="inspect_'+widget_attrs[attr]+'" size="44"/></td></tr>');

                } else {
                    $("#widget_attrs").append('<tr id="option_'+widget_attrs[attr]+'" class="dashui-add-option"><td>'+this.translate(widget_attrs[attr])+'</td><td><textarea id="inspect_'+widget_attrs[attr]+'" rows="2" cols="44"></textarea></td></tr>');

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

        if ($("#snap_type option:selected").val() == 2) {
            var gridWidth = parseInt($("#grid_size").val(),10);

            if (gridWidth < 1 || isNaN(gridWidth) ) {
                gridWidth = 10;
            }

            var x = parseFloat($this.css("left").slice(0,-2)),
                y = parseFloat($this.css("top").slice(0,-2));

            x = Math.floor(x / gridWidth) * gridWidth;
            y = Math.floor(y / gridWidth) * gridWidth;

            $this.css("left",x+"px").css("top",y+"px");

        }


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
        var draggableOptions = {
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
        };
        if ($("#snap_type option:selected").val() == 1) {
            draggableOptions.snap = "#dui_container div.dashui-widget";
        }
        if ($("#snap_type option:selected").val() == 2) {
            draggableOptions.grid = [gridWidth,gridWidth];
        }
        $this.draggable(draggableOptions).resizable($.extend({
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

// Image selection Dialog
var imageSelect = {
    // possible settings
    settings: {
                iwidth:      32,
                iheight:     32,
                withName:    false,
                onselect:    null,
                onselectArg: null,
                result:      "",
                current:     null,   // current image
                parent:      $('body'), 
                elemName:    "idialog_",
           },
    _pictDir: "./img/",
    _rootDir: null,
    _curDir: null,
    _selectText: "",
    _cancelText: "",    
    _titleText:  "",
    _dirImage: "kde_folder.png",
    _curImage: "",
    Show:  function (options){
        var i = 0;
        
        if (this._selectText == "") {
            this._selectText = dui.translate ("Select");
            this._cancelText = dui.translate ("Cancel");
            this._titleText  = dui.translate ("Selected image: ");
        }
           
        if (!options.elemName || options.elemName == "") {
            options.elemName = "idialog_";
        }
        if (!options.parent) {
            options.parent = $('body');
        }
        
        if (document.getElementById (options.elemName) != undefined) {
            $('#'+options.elemName).remove ();
        }
        options.parent.append("<div class='dialog' id='imageSelect' title='" + this._titleText + "'></div>");
        var htmlElem = document.getElementById ("imageSelect");
        htmlElem.settings = {};
        htmlElem.settings = $.extend (htmlElem.settings, this.settings);
        htmlElem.settings = $.extend (htmlElem.settings, options);
        
         // Define dialog buttons
        var dialog_buttons = {}; 
        dialog_buttons[this._selectText] = function() { 
            $( this ).dialog( "close" ); 
            if (this.settings.onselect)
                this.settings.onselect (imageSelect._pictDir+this.settings.result, this.settings.onselectArg);
            $( this ).remove ();
        }
        dialog_buttons[this._cancelText] = function(){ 
            $( this ).dialog( "close" ); 
            $( this ).remove ();
        }   
        $('#imageSelect')
        .dialog({
            resizable: true,
            height: $(window).height(),
            modal: true,
            width: 600,
            buttons: dialog_buttons
        });     
        // Show wait icon
        if (!document.getElementById ('waitico'))
            $('#imageSelect').append("<p id='waitico'>Please wait...</p>");
        $('#waitico').show();
        this._rootDir = "/www/addons/dashui/img/";
        this._curDir = "";
        htmlElem.settings.result = htmlElem.settings.current;
        // Find current directory
        if (htmlElem.settings.result && htmlElem.settings.result != "") { 
            var str = htmlElem.settings.result;
            if (str.substring (0, this._pictDir.length) == this._pictDir) {
                str = str.substring (this._pictDir.length);
            }
            if (str.indexOf ('/') != -1) {
                var disr = str.split ("/");
                for (var z=0; z < disr.length -1; z++)
                    this._curDir += disr[z]+"/";
            }
        }
        
        this.getImageList (htmlElem);
    },
    getImageList: function (htmlElem)
    {
        // find selected image
        imageSelect._curImage = "";
        
        if (htmlElem.settings.result && htmlElem.settings.result != "") { 
            var str = htmlElem.settings.result;
            if (str.substring (0, imageSelect._pictDir.length) == imageSelect._pictDir) {
                str = str.substring (imageSelect._pictDir.length);
            }
            if  (str.substring (0, imageSelect._curDir.length) == imageSelect._curDir) {
                str = str.substring (imageSelect._curDir.length);
                if (str.indexOf ('/') == -1) {
                    imageSelect._curImage = str;
                }
            }
        }
        
        // Load directory
        $.homematic("getImageList", this._rootDir + this._curDir, this.showImages, htmlElem)
    },
    showImages: function (aImages, obj)
    {	
        // Remove wait icon
        $('#waitico').hide ();
        obj.settings.columns = Math.floor (($(obj).width()-40) / (obj.settings.iwidth+5));
        obj.settings.rows    = Math.floor (aImages.length / obj.settings.columns)+1;
        
        if (document.getElementById (obj.settings.elemName+"_tbl"))
            $('#'+obj.settings.elemName+"_tbl").remove ();
        
        // Remove directory image and place directories first
        var bImages = new Array ();
        var j = 0;
        if (imageSelect._curDir != null && imageSelect._curDir != "")
            bImages[j++] = "..";
        for (var i = 0; i < aImages.length; i++)
            if (aImages[i].indexOf ('.') == -1)
                bImages[j++] = aImages[i];
                
        for (var i = 0; i < aImages.length; i++)
            if (aImages[i].indexOf ('.') != -1 && aImages[i] != imageSelect._dirImage)
                bImages[j++] = aImages[i];
            
        aImages = bImages;
        
        var sText = "<table id='"+obj.settings.elemName+"_tbl'>";
        var row = 0;
        var col;
        for (row = 0; row < obj.settings.rows; row++)
        {
            sText += "<tr>";
            for (col = 0; col < obj.settings.columns; col++)
            {
                var k=row*obj.settings.columns+col;
                sText += "<td id='"+obj.settings.elemName+"_"+k+"' style='text-align: center; width:"+obj.settings.iwidth+";height:"+obj.settings.iheight+"'>";
                if (aImages.length > k) {
                    var isDir = (aImages[k].indexOf ('.') == -1) || (aImages[k] == "..");
                    if (obj.settings.withName || isDir) {
                        sText += "<table><tr><td>";
                    }
                
                    sText += "<img id='"+obj.settings.elemName+"_img"+k+"'";
                    // File or directory
                    if (aImages[k] == "..") {
                        sText += " src=\""+imageSelect._pictDir+imageSelect._dirImage+"\" title='"+dui.translate ("Back")+"'";
                    }
                    else if (isDir) {
                        sText += " src=\""+imageSelect._pictDir+imageSelect._dirImage+"\" title='"+aImages[k]+"' ";
                    }
                    else {
                        sText += "title='"+aImages[k]+"' ";
                    }
                    sText += " />";
                    
                    if (obj.settings.withName || isDir) {
                        sText += "</td></tr><tr><td style='font-size:0.6em;font-weight:normal'>";
                        if (aImages[k] == "..") {
                            sText += "<span class='ui-icon ui-icon-arrowreturnthick-1-w' style='top:50%; left:50%; margin: -10 0 0 -10'></span>";
                        }
                        else {
                            sText += aImages[k];
                        }
                        sText += "</td></tr></table>";
                    }
                }
                sText += "</td>";	
            }
            sText += "</tr>";
        }
        
        sText += "</table>";//</div>";
        
        $(obj).append (sText);
        $(obj).css ({overflow: 'auto'});
        obj.settings.table = $('#'+obj.settings.elemName+'_tbl').addClass("h-no-select");
        obj.settings.table.css({padding: 0, 'mapping': 0});
        
        obj.curElement = null;
        
        for (i = 0; i < aImages.length; i++)
        {
            var img   = $('#'+obj.settings.elemName+"_"+i);
            var image = $('#'+obj.settings.elemName+'_img'+i);
            img.addClass ("ui-state-default ui-widget-content").css({width: obj.settings.iwidth+4, height: obj.settings.iheight+4});           
            img.parent = obj;
            img.result = aImages[i];
            image.parent = img;
            image.iwidth = obj.settings.iwidth;
            image.iheight = obj.settings.iheight;
            image.i = i;
            image.isLast = (i == aImages.length-1);
            img.image = image;
            if (imageSelect._curImage == aImages[i]) {	
                obj.settings.curElement = img;
                img.removeClass ("ui-state-default").addClass ("ui-state-active");
            }
            
            if (image.isLast && obj.settings.curElement) image.current = obj.settings.curElement; 
            
            image.bind ("load", {msg: image}, function (event){
                var obj_ = event.data.msg;
                if (obj_.width() > obj_.iwidth || obj_.height() > obj_.iheight)
                {
                    if (obj_.width() > obj_.height())
                        obj_.css ({height: (obj_.height() / obj_.width())  *obj._iwidth,  width:  obj_.iwidth});
                    else
                        obj_.css ({width:  (obj_.width()  / obj_.height()) *obj_.iheight, height: obj_.iheight});
                } 
                if (obj_.isLast && obj_.current)
                    $(obj_.parent.parent).animate ({scrollTop: obj_.current.image.position().top + obj_.current.image.height()}, 'fast');			
            });
            image.error (function (){
                $(this).hide();
            });
            img.bind ("mouseenter", {msg: img}, function (event)
            {
                var obj = event.data.msg;
                obj.removeClass("ui-state-default").removeClass("ui-state-active").addClass("ui-state-hover");
            });
            img.bind ("mouseleave", {msg: img}, function (event)
            {			
                var obj = event.data.msg;
                obj.removeClass("ui-state-hover");
                if (obj == obj.parent.settings.curElement)
                    obj.addClass  ("ui-state-active");
                else
                    obj.addClass  ("ui-state-default");
            });				
            img.bind ("click", {msg: img}, function (event)
            {			
                var obj_ = event.data.msg;
                // back directory
                if (obj_.result == "..") {
                    var dirs = imageSelect._curDir.split ('/');
                    imageSelect._curDir = "";
                    for (var t = 0; t < dirs.length - 2; t++)
                        imageSelect._curDir += dirs[t]+"/";
                    imageSelect.getImageList (obj);
                }
                else
                if (obj_.result.indexOf ('.') == -1) {
                    imageSelect._curDir += obj_.result+"/";
                    imageSelect.getImageList (obj);
                }
                else {
                    obj.settings.result = imageSelect._curDir+obj_.result;
                    if (obj.settings.curElement) {
                        obj.settings.curElement.removeClass("ui-state-active").addClass("ui-state-default");
                    }
                    obj.settings.curElement = obj_;
                    obj_.removeClass("ui-state-hover").addClass ("ui-state-active");
                    $(obj).dialog('option', 'title', imageSelect._titleText + obj.settings.result);
                }
            });				
            img.bind ("dblclick", {msg: img}, function (event)
            {			
                var obj_ = event.data.msg;
                obj.settings.result = imageSelect._pictDir + imageSelect._curDir + obj_.result;
                if (obj.settings.onselect)
                    obj.settings.onselect (obj.settings.result, obj.settings.onselectArg);
                $( obj ).dialog( "close" );
                $( obj ).remove ();
            });				
            // If File
            if (aImages[i] != ".." && aImages[i].indexOf ('.') != -1) {
                image.attr('src', imageSelect._pictDir+imageSelect._curDir+aImages[i]);
            }
        }
        // Show active image
        if (imageSelect._curImage != null && imageSelect._curImage != "") { 
            $(obj).dialog('option', 'title', imageSelect._titleText + imageSelect._curDir + imageSelect._curImage);
        }
        else {
            $(obj).dialog('option', 'title', imageSelect._titleText + imageSelect._curDir);
        }
    }
};

// Device selection dialog
var hmSelect = {
	timeoutHnd:   null, // timeout for search
	value:        null,
	_userArg:     null,
	_onsuccess:   null,
	images:       null,
	mydata:       null,
	_selectText:  null,
	_cancelText:  null,
    _buttonsLoc:  null, // Array with rooms buttons for filter
    _buttonsFunc: null, // Array with function buttons for filter 
    _filterLoc:   "",   // rooms filter
    _filterFunc:  "",   // functions filter
    _filter:      null, // current filter
    
	convertName: function (text)
	{
		var oldText = text;
		do
		{
			oldText = text;
			text = text.replace ("%C4", "&Auml;");
			text = text.replace ("%E4", "&auml;");
			text = text.replace ("%D6", "&Ouml;");
			text = text.replace ("%F6", "&ouml;");
			text = text.replace ("%DC", "&Uuml;");
			text = text.replace ("%FC", "&uuml;");
			text = text.replace ("%DF", "&szlig;");
			text = text.replace ("%20", " ");
			text = text.replace ("%3A", ".");
		}while (text != oldText);
		
		return text;
	}, // Convert name
	getImage: function (type)
	{
		if (this.images == null) {
			this.deviceImgPath = '/config/img/devices/50/';
			// Devices -> Images
			this.images =  {
				'HM-LC-Dim1TPBU-FM': 'PushButton-2ch-wm_thumb.png',
				'HM-LC-Sw1PBU-FM':   'PushButton-2ch-wm_thumb.png',
				'HM-LC-Bl1PBU-FM':   'PushButton-2ch-wm_thumb.png',
				'HM-LC-Sw1-PB-FM':   'PushButton-2ch-wm_thumb.png',
				'HM-PB-2-WM':        'PushButton-2ch-wm_thumb.png',
				'HM-LC-Sw2-PB-FM':   'PushButton-4ch-wm_thumb.png',
				'HM-PB-4-WM':        'PushButton-4ch-wm_thumb.png',
				'HM-LC-Dim1L-Pl':    'OM55_DimmerSwitch_thumb.png',
				'HM-LC-Dim1T-Pl':    'OM55_DimmerSwitch_thumb.png',
				'HM-LC-Sw1-Pl':      'OM55_DimmerSwitch_thumb.png',
				'HM-LC-Dim1L-Pl-2':  'OM55_DimmerSwitch_thumb.png',
				'HM-LC-Sw1-Pl-OM54': 'OM55_DimmerSwitch_thumb.png',
				'HM-Sys-sRP-Pl':     'OM55_DimmerSwitch_thumb.png',
				'HM-LC-Dim1T-Pl-2':  'OM55_DimmerSwitch_thumb.png',
				'HM-LC-Sw1-Pl-2':    'OM55_DimmerSwitch_thumb.png',
				'HM-Sen-WA-OD':      '82_hm-sen-wa-od_thumb.png',
				'HM-Dis-TD-T':       '81_hm-dis-td-t_thumb.png',
				'HM-Sen-MDIR-O':     '80_hm-sen-mdir-o_thumb.png',
				'HM-OU-LED16':       '78_hm-ou-led16_thumb.png',
				'HM-LC-Sw1-Ba-PCB':  '77_hm-lc-sw1-ba-pcb_thumb.png',
				'HM-LC-Sw4-WM':      '76_hm-lc-sw4-wm_thumb.png',
				'HM-PB-2-WM55':      '75_hm-pb-2-wm55_thumb.png',
				'atent':             '73_hm-atent_thumb.png',
				'HM-RC-BRC-H':       '72_hm-rc-brc-h_thumb.png',
				'HMW-IO-12-Sw14-DR': '71_hmw-io-12-sw14-dr_thumb.png',
				'HM-PB-4Dis-WM':     '70_hm-pb-4dis-wm_thumb.png',
				'HM-LC-Sw2-DR':      '69_hm-lc-sw2-dr_thumb.png',
				'HM-LC-Sw4-DR':      '68_hm-lc-sw4-dr_thumb.png',
				'HM-SCI-3-FM':       '67_hm-sci-3-fm_thumb.png',
				'HM-LC-Dim1T-CV':    '66_hm-lc-dim1t-cv_thumb.png',
				'HM-LC-Dim1T-FM':    '65_hm-lc-dim1t-fm_thumb.png',
				'HM-LC-Dim2T-SM':    '64_hm-lc-dim2T-sm_thumb.png',
				'HM-LC-Bl1-pb-FM':   '61_hm-lc-bl1-pb-fm_thumb.png',
				'HM-LC-Bi1-pb-FM':   '61_hm-lc-bi1-pb-fm_thumb.png',
				'HM-OU-CF-Pl':       '60_hm-ou-cf-pl_thumb.png',
				'HM-OU-CFM-Pl':      '60_hm-ou-cf-pl_thumb.png',
				'HMW-IO-12-FM':      '59_hmw-io-12-fm_thumb.png',
				'HMW-Sen-SC-12-FM':  '58_hmw-sen-sc-12-fm_thumb.png',
				'HM-CC-SCD':         '57_hm-cc-scd_thumb.png',
				'HMW-Sen-SC-12-DR':  '56_hmw-sen-sc-12-dr_thumb.png',
				'HM-Sec-SFA-SM':     '55_hm-sec-sfa-sm_thumb.png',
				'HM-LC-ddc1':        '54a_lc-ddc1_thumb.png',
				'HM-LC-ddc1-PCB':    '54_hm-lc-ddc1-pcb_thumb.png',
				'HM-Sen-MDIR-SM':    '53_hm-sen-mdir-sm_thumb.png',
				'HM-Sec-SD-Team':    '52_hm-sec-sd-team_thumb.png',
				'HM-Sec-SD':         '51_hm-sec-sd_thumb.png',
				'HM-Sec-MDIR':       '50_hm-sec-mdir_thumb.png',
				'HM-Sec-WDS':        '49_hm-sec-wds_thumb.png',
				'HM-Sen-EP':         '48_hm-sen-ep_thumb.png',
				'HM-Sec-TiS':        '47_hm-sec-tis_thumb.png',
				'HM-LC-Sw4-PCB':     '46_hm-lc-sw4-pcb_thumb.png',
				'HM-LC-Dim2L-SM':    '45_hm-lc-dim2l-sm_thumb.png',
				'HM-EM-CCM':         '44_hm-em-ccm_thumb.png',
				'HM-CC-VD':          '43_hm-cc-vd_thumb.png',
				'HM-CC-TC':          '42_hm-cc-tc_thumb.png',
				'HM-Swi-3-FM':       '39_hm-swi-3-fm_thumb.png',
				'HM-PBI-4-FM':       '38_hm-pbi-4-fm_thumb.png',
				'HMW-Sys-PS7-DR':    '36_hmw-sys-ps7-dr_thumb.png',
				'HMW-Sys-TM-DR':     '35_hmw-sys-tm-dr_thumb.png',
				'HMW-Sys-TM':        '34_hmw-sys-tm_thumb.png',
				'HMW-Sec-TR-FM':     '33_hmw-sec-tr-fm_thumb.png',
				'HMW-WSTH-SM':       '32_hmw-wsth-sm_thumb.png',
				'HMW-WSE-SM':        '31_hmw-wse-sm_thumb.png',
				'HMW-IO-12-Sw7-DR':  '30_hmw-io-12-sw7-dr_thumb.png',
				'HMW-IO-4-FM':       '29_hmw-io-4-fm_thumb.png',
				'HMW-LC-Dim1L-DR':   '28_hmw-lc-dim1l-dr_thumb.png',
				'HMW-LC-Bl1-DR':     '27_hmw-lc-bl1-dr_thumb.png',
				'HMW-LC-Sw2-DR':     '26_hmw-lc-sw2-dr_thumb.png',
				'HM-EM-CMM':         '25_hm-em-cmm_thumb.png',
				'HM-CCU-1':          '24_hm-cen-3-1_thumb.png',
				'HM-RCV-50':         '24_hm-cen-3-1_thumb.png',
				'HMW-RCV-50':        '24_hm-cen-3-1_thumb.png',
				'HM-RC-Key3':        '23_hm-rc-key3-b_thumb.png',
				'HM-RC-Key3-B':      '23_hm-rc-key3-b_thumb.png',
				'HM-RC-Sec3':        '22_hm-rc-sec3-b_thumb.png',
				'HM-RC-Sec3-B':      '22_hm-rc-sec3-b_thumb.png',
				'HM-RC-P1':          '21_hm-rc-p1_thumb.png',
				'HM-RC-19':          '20_hm-rc-19_thumb.png',
				'HM-RC-19-B':        '20_hm-rc-19_thumb.png',
				'HM-RC-12':          '19_hm-rc-12_thumb.png',
				'HM-RC-12-B':        '19_hm-rc-12_thumb.png',
				'HM-RC-4':           '18_hm-rc-4_thumb.png',
				'HM-RC-4-B':         '18_hm-rc-4_thumb.png',
				'HM-Sec-RHS':        '17_hm-sec-rhs_thumb.png',
				'HM-Sec-SC':         '16_hm-sec-sc_thumb.png',
				'HM-Sec-Win':        '15_hm-sec-win_thumb.png',
				'HM-Sec-Key':        '14_hm-sec-key_thumb.png',
				'HM-Sec-Key-S':      '14_hm-sec-key_thumb.png',
				'HM-WS550STH-I':     '13_hm-ws550sth-i_thumb.png',
				'HM-WDS40-TH-I':     '13_hm-ws550sth-i_thumb.png',
				'HM-WS550-US':       '9_hm-ws550-us_thumb.png',
				'WS550':             '9_hm-ws550-us_thumb.png',
				'HM-WDC7000':        '9_hm-ws550-us_thumb.png',
				'HM-LC-Sw1-SM':      '8_hm-lc-sw1-sm_thumb.png',
				'HM-LC-Bl1-FM':      '7_hm-lc-bl1-fm_thumb.png',
				'HM-LC-Bl1-SM':      '6_hm-lc-bl1-sm_thumb.png',
				'HM-LC-Sw2-FM':      '5_hm-lc-sw2-fm_thumb.png',
				'HM-LC-Sw1-FM':      '4_hm-lc-sw1-fm_thumb.png',
				'HM-LC-Sw4-SM':      '3_hm-lc-sw4-sm_thumb.png',
				'HM-LC-Dim1L-CV':    '2_hm-lc-dim1l-cv_thumb.png',
				'HM-LC-Dim1PWM-CV':  '2_hm-lc-dim1l-cv_thumb.png',
				'HM-WS550ST-IO':     'IP65_G201_thumb.png',
				'HM-WDS30-T-O':      'IP65_G201_thumb.png',
				'HM-WDS100-C6-O':    'WeatherCombiSensor_thumb.png',
				'HM-WDS10-TH-O':     'TH_CS_thumb.png',
				'HM-WS550STH-O':     'TH_CS_thumb.png'
			};	
		}
		if (this.images[type])
			return this.deviceImgPath + this.images[type];
		else
			return "";
	}, // Get image for type
    show: function (ccu, userArg, onSuccess)
	{
        this._onsuccess = onSuccess;
        this._userArg   = userArg;
        var devices   = ccu['devices'];
        var rooms     = ccu['rooms'];
        var functions = ccu['functions'];
        var veriables = ccu['veriables'];
        
		_userArg = userArg || null;
		_onsuccess = onSuccess || null;
		if (!document.getElementById ("hmSelect")) {
			$("body").append("<div class='dialog' id='hmSelect' title='" + dui.translate ("Select HM parameter") + "'></div>");
            var text = "<div id='hmSelect_tabs'>";
            text += "  <ul>";
            text += "    <li><a href='#tabs-devs'>Devices</a></li>";
            text += "    <li><a href='#tabs-vars'>Variables</a></li>";
            text += "    <li><a href='#tabs-progs'>Functions</a></li>";
            text += "  </ul>";
            text += "  <div id='tabs-devs' style='padding: 3px'></div><div id='tabs-vars' style='padding: 3px'></div><div id='tabs-progs' style='padding: 3px'></div>";
            text += "</div>";
            $("#hmSelect").append(text);
            $("#tabs-devs").append("<table id='hmSelectContent'></table>");
        
            $('#tabs-devs').prepend ("<div id='hmSelectFunctions' class='ui-state-highlight'></div>");
            $('#tabs-devs').prepend ("<div id='hmSelectLocations' class='ui-state-error'></div>");
            $('#tabs-devs').prepend ("<p id='waitico'>Please wait...</p>");
		}
        $("#hmSelect_tabs").tabs();
        
        // Define dialog buttons
		this._selectText = dui.translate ("Select");
		this._cancelText = dui.translate ("Cancel");
        
		var dialog_buttons = {}; 
		dialog_buttons[this._selectText] = function() { 
			$( this ).dialog( "close" ); 
			if (_onsuccess)
				_onsuccess (_userArg, value);
			$('#hmSelectContent').jqGrid('GridUnload');
		}
		dialog_buttons[this._cancelText] = function(){ 
			$( this ).dialog( "close" ); 
			$('#hmSelectContent').jqGrid('GridUnload'); 
		}   
		//$('#instanceDialog').dialog({ buttons: dialog_buttons });		
		
		$('#hmSelect')
		.dialog({
			resizable: true,
			height: $(window).height(),
			modal: true,
			width: 870,
			resize: function(event, ui) { 
                $('#hmSelect_tabs').width ($('#hmSelect').width() - 30);
                $('#hmSelect_tabs').height ($('#hmSelect').height() - 12);
                $('#hmSelectLocations').width ($('#tabs-devs').width()-6);
                $('#hmSelectFunctions').width ($('#tabs-devs').width()-6);
                $('#tabs-devs').width ($('#hmSelect_tabs').width() - 6);
                $('#tabs-devs').height ($('#hmSelect_tabs').height() - 60);
				$("#hmSelectContent").setGridWidth ($('#tabs-devs').width()  - 6);
				$("#hmSelectContent").setGridHeight($('#tabs-devs').height() - 35 - $('#hmSelectLocations').height () - $('#hmSelectFunctions').height ());
			},
			buttons: dialog_buttons
		});
        $('#waitico').show();
        if (devices == undefined || devices == null)
        {
            // request list of devices anew
            $.homematic ("loadCcuDataAll", function () {hmSelect.show (homematic.ccu, hmSelect._userArg, hmSelect._onsuccess)});
            return;
        }
        $('#waitico').hide();
        $('#hmSelect_tabs').width ($('#hmSelect').width());
        $('#hmSelect_tabs').height ($('#hmSelect').height() - 12);
        $('#tabs-devs').width ($('#hmSelect_tabs').width() - 6);
        $('#tabs-devs').height ($('#hmSelect_tabs').height() - 60);
        
        // Fill the locations toolbar
        if (this._buttonsLoc == null) {
            this._buttonsLoc = new Array ();
            var l = 0;
            for (var room in rooms) {
                $("#hmSelectLocations").append('<button id="hmSelectLocations' + l + '" />');
                $('#hmSelectLocations' + l).button ({label: room, height: 20}).click (function (obj) { 
                    // toggle state
                    if (hmSelect._filterLoc == "")
                    {
                        
                        hmSelect._filterLoc = $(this).button('option', 'label');
                        for (var i =0 ; i < hmSelect._buttonsLoc.length; i++) {
                            if (hmSelect._buttonsLoc[i].button('option', 'label') == hmSelect._filterLoc)
                                continue;
                            hmSelect._buttonsLoc[i].button("disable");
                        }
                    }
                    else
                    {
                        hmSelect._filterLoc = "";
                        for (var i =0 ; i < hmSelect._buttonsLoc.length; i++) {
                            hmSelect._buttonsLoc[i].button("enable");
                        }
                    }
                    hmSelect.filterApply ();
                });
                this._buttonsLoc[l] =  $('#hmSelectLocations' + l);
                this._buttonsLoc[l].css({"font-size": ".8em", 'padding': '.01em'});
                l++;
            }
        }
        $('#hmSelectLocations').width ($('#tabs-devs').width()-6);
        
        // Fill the functions toolbar
        if (this._buttonsFunc == null) {
            this._buttonsFunc = new Array ();
            var l = 0;
            for (var func in functions) {
                $("#hmSelectFunctions").append('<button id="hmSelectFunctions' + l + '" />');
                $('#hmSelectFunctions' + l).button ({label: func, height: 20}).click (function (obj) { 
                    // toggle state
                    if (hmSelect._filterFunc == "") {
                        hmSelect._filterFunc = $(this).button('option', 'label');
                        for (var i =0 ; i < hmSelect._buttonsFunc.length; i++) {
                            if (hmSelect._buttonsFunc[i].button('option', 'label') == hmSelect._filterFunc)
                                continue;
                            hmSelect._buttonsFunc[i].button("disable");
                        }
                    }
                    else {
                        hmSelect._filterFunc = "";
                        for (var i =0 ; i < hmSelect._buttonsFunc.length; i++) {
                            hmSelect._buttonsFunc[i].button("enable");
                        }
                    }
                    hmSelect.filterApply ();
                });
                this._buttonsFunc[l] =  $('#hmSelectFunctions' + l);
                this._buttonsFunc[l].css({"font-size": ".8em", 'padding': '.01em'});
                l++;
            }
        }
        $('#hmSelectFunctions').width ($('#tabs-devs').width()-6);
        
        // Build the data tree together
		if (this.mydata == null)
		{
            this.mydata = new Array ();
		    var i = 0;
			var selectedId = null;
			// Add all elements
			for(var dev in devices){
				// Try to find room
				if (devices[dev].room === undefined || devices[dev].room === null){
					var arr = new Object ();
					devices[dev].room = "";
					for (var chn in devices[dev].Channels){
						devices[dev].Channels[chn].room = "";
						for (var room in rooms) {
							for (var k = 0; k < rooms[room].channels.length; k++){
								if (rooms[room].channels[k] == chn){
									devices[dev].Channels[chn].room = room;
									if (!arr[rooms[room]["id"]]) {
										arr[rooms[room]["id"]] = 1;
										if (devices[dev].room != "") devices[dev].room += ", ";
										devices[dev].room += room;
									}
									break;
								}
							}
						}
					}
				}
                
                // Try to find function
				if (devices[dev].func === undefined || devices[dev].func === null){
					var arr = new Object ();
					devices[dev].func = "";
					for (var chn in devices[dev].Channels){
						devices[dev].Channels[chn].func = "";
						for (var func in functions) {
							for (var k = 0; k < functions[func].channels.length; k++){
								if (functions[func].channels[k] == chn){
									devices[dev].Channels[chn].func = func;
									if (!arr[functions[func]["id"]]) {
										arr[functions[func]["id"]] = 1;
										if (devices[dev].func != "") devices[dev].func += ", ";
										devices[dev].func += func;
									}
									break;
								}
							}
						}
					}
				}
			
				this.mydata[i] = {
					id:          ""+(i+1), 
					"Image":     "<img src='"+this.getImage(devices[dev].HssType)+"' width=25 height=25 />",
					"Location":  devices[dev].room,
					"Interface": devices[dev].Interface,
					"Type":      devices[dev].HssType,
					"Function":  devices[dev].func,
					"Address":   devices[dev].Address,
					"Name":      this.convertName(devices[dev].Name),
					isLeaf:      false,
					level:       "0",
					parent:      "null",
					expanded:   false, 
					loaded:     true
				};
				if (hmSelect.value && this.mydata[i]["Address"] == hmSelect.value) {
					selectedId = this.mydata[i].id;
				}
				var _parent = this.mydata[i].id;
				i++;
				for (var chn in devices[dev].Channels)
				{
					var channel = devices[dev].Channels[chn];
					this.mydata[i] = {
						id:          ""+(i+1), 
						"Image":     "",//"<img src='"+this.getImage(channel.HssType)+"' width=25 height=25 />",
						"Location":  channel.room,
						"Interface": devices[dev].Interface,
						"Type":      channel.HssType,
						"Function":  channel.func,
						"Address":   channel.Address,
						"Name":      this.convertName(channel.Name),
						isLeaf:      false,
						level:       "1",
						parent:      _parent,
						expanded:    false, 
						loaded:      true
					};
					if (hmSelect.value && this.mydata[i]["Address"] == hmSelect.value) {
						selectedId = this.mydata[i].id;
					}
					var parent1 = this.mydata[i].id;
					i++;
					for (var dp in channel.DPs)
					{	
						var point = channel.DPs[dp];
						this.mydata[i] = {
							id:          ""+(i+1), 
							"Image":     "",
							"Location":  channel.room,
							"Interface": devices[dev].Interface,
							"Type":      point.ValueUnit,
							"Function":  channel.func,
							"Address":   this.convertName(point.Name),
							"Name":      point.Type,
							isLeaf:      true,
							level:       "2",
							parent:      parent1,
							expanded:    false, 
							loaded:      true
						};
						if (hmSelect.value && this.mydata[i]["Address"] == hmSelect.value) {
							selectedId = this.mydata[i].id;
						}
						i++;
					}
				}				
			}
		}

        // Create the grid
		$("#hmSelectContent").jqGrid({
			datatype:    "jsonstring",
			datastr:     this.mydata,
			height:      $('#tabs-devs').height() - 35 - $('#hmSelectLocations').height () - $('#hmSelectFunctions').height (),
			autowidth:   true,
			shrinkToFit: false,
			colNames:['Id', dui.translate ('Name'), '', dui.translate ('Location'), dui.translate ('Interface'), dui.translate ('Type'), dui.translate ('Function'), dui.translate ('Address')],
			colModel:[
                {name:'id',       index:'id',        width:1,   hidden:true, key:true},
				{name:'Name',     index:'Name',      width:250, sortable:"text"},
				{name:'Image',    index:'Image',     width:22,  sortable:false, align:"right", search: false},
				{name:'Location', index:'Location',  width:110, sorttype:"text", search: false},
				{name:'Interface',index:'Interface', width:80,  sorttype:"text"},
				{name:'Type',     index:'Type',      width:120, sorttype:"text"},		
				{name:'Function', index:'Function',  width:120, hidden:true, search: false, sorttype:"text"},		
				{name:'Address',  index:'Address',   width:220, sorttype:"text"}
			],
			onSelectRow: function(id){ 
				value = $("#hmSelectContent").jqGrid ('getCell', id, 'Address');
				if (value != null && value != "") {
					$(":button:contains('"+hmSelect._selectText+"')").prop("disabled", false).removeClass("ui-state-disabled");
				}
			},
			
			sortname: 'id',
			multiselect: false,
			gridview: true,
			scrollrows : true,
            treeGrid: true,
            treeGridModel: 'adjacency',
            treedatatype: "local",
            ExpandColumn: 'Name',
			ExpandColClick: true, 
			pgbuttons: true,
			viewrecords: true,
			jsonReader: {
				repeatitems: false,
				root: function (obj) { return obj; },
				page: function (obj) { return 1; },
				total: function (obj) { return 1; },
				records: function (obj) { return obj.length; }
			}
		});
        // Add the filter column
		$("#hmSelectContent").jqGrid('filterToolbar',{searchOperators : false,
			beforeSearch: function () {
				var searchData = jQuery.parseJSON(this.p.postData.filters);
                hmSelect._filter = searchData;
				
                hmSelect.filterLocation ();
			}
		});
        // Select current element
		if (selectedId != null) {
			$("#hmSelectContent").setSelection(selectedId, true);
			$("#"+$("#hmSelectContent").jqGrid('getGridParam','selrow')).focus();
		}	
		// Show dialog
		$('#hmSelect').dialog("open");
        // Increase dialog because of bug in jqGrid
		$('#hmSelect').dialog("option", "width", 900);
		// Disable "Select" button if nothing selected
		if (selectedId == null)	{
			$(":button:contains('"+this._selectText+"')").prop("disabled", true).addClass("ui-state-disabled");
		}
        // Filter items with last filter
        this.filterApply ();
	},
    filterApply: function ()
    {
        // Custom filter
        var rows = $("#hmSelectContent").jqGrid('getGridParam', 'data');
        for (var i = 0; i < rows.length; i++){
            var isShow = true;
            if (rows[i].level!="0")
                continue;
            if (hmSelect._filter != null) {
                for (var j = 0; j < hmSelect._filter.rules.length; j++) {
                    if (rows[i][hmSelect._filter.rules[j].field].indexOf (hmSelect._filter.rules[j].data) == -1) {
                        isShow = false;
                        break;
                    }
                }
            }
            if (isShow && hmSelect._filterLoc != "" && rows[i]['Location'].indexOf (hmSelect._filterLoc) == -1) {
                isShow = false;
            }
            if (isShow && hmSelect._filterFunc != "" && rows[i]['Function'].indexOf (hmSelect._filterFunc) == -1) {
                isShow = false;
            }            
            $("#"+rows[i].id,"#hmSelectContent").css({display: (isShow) ? "":"none"});
        }
    }
};

// Selector of styles (uses jquery themes)
var hqStyleSelector = {
    // local variables
    _currentElement: 0,
	_scrollWidth: -1,
    // Default settings
    settings: {
        // List of styles
        styles:        null,
        width:         100,
        style:         "",     // Init style as text
        onchange:      null,   // onchange fuction: handler (newStyle, onchangeParam);
        onchangeParam: null,   // user parameter for onchange function
        parent:        null,
        height:        30,
        dropOpened:    false,
        name:          null,
        id:            -1,
    },
    _findTitle: function (styles, style)
    {
        for(var st in styles) {
            if (styles[st] == style)
                return ((st == "") ? style : st);
        }
        return style;
    },
    
    // Functions
    init: function (options) {
		// Detect scrollbar width
		if (this._scrollWidth == -1)
		{
			// Create the measurement node
			var scrollDiv = document.createElement("div");
			scrollDiv.style.width = 100;
			scrollDiv.style.height = 100;
			scrollDiv.style.overflow = "scroll";
			scrollDiv.style.position = "absolute";
			scrollDiv.style.top = "-9999px";
			document.body.appendChild(scrollDiv);

			// Get the scrollbar width
			this._scrollWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
			
			// Delete the DIV 
			document.body.removeChild(scrollDiv);
		}
        if (options.name == undefined || options.name == "") {
            options.name = ""+ this._currentElement;
        }
        
        var nameImg  = "styleSelectorImg" +options.name;
        var nameText = "styleSelectorText"+options.name;
        var nameBtn  = "styleSelectorB"   +options.name;
        var nameElem = "styleSelector"    +options.name;
        if (document.getElementById (nameElem) != undefined) {
            $('#'+nameElem).remove ();
            $('#styleSelectorBox'+options.name).remove ();
        }
        var text = "<table id='"+nameElem+"'><tr><td>";
            text += "<table><tr><td><div id='"+nameImg+"'></div></td><td width=10></td><td style='text-align: left; vertical-align: middle;'><div  style='text-align: left; vertical-align: middle;' id='"+nameText+"'></div>";
            text += "</td></tr></table></td><td>";
            text += "<button id='"+nameBtn+"' />";
            text += "</td></tr></table>";
        var parent = (options.parent == null) ? $("body") : options.parent;
        parent.append (text);
        var htmlElem = document.getElementById (nameElem);
        htmlElem.settings = {};
        htmlElem.settings = $.extend (htmlElem.settings, this.settings);
        htmlElem.settings = $.extend (htmlElem.settings, options);
        htmlElem.settings.parent = parent;
        htmlElem.settings.id = options.name;
        htmlElem.settings.styles = $.extend ({"None": ""}, options.styles ? options.styles : {});
        
        $('#'+nameImg).css  ({width: htmlElem.settings.height*2, height: htmlElem.settings.height - 4}).addClass ('ui-corner-all');
        $('#'+nameText).css ({width: htmlElem.settings.width});
        $('#'+nameBtn).button ({icons: {primary: "ui-icon-circle-triangle-s"}, text: false});
        $('#'+nameBtn).click (htmlElem, function (e){
            hqStyleSelector._toggleDrop(e.data);
        });
        $('#'+nameBtn).height(htmlElem.settings.height).width(htmlElem.settings.height);
        var elem = $('#styleSelector'+options.name);
        elem.addClass ('ui-corner-all ui-widget-content');
        if (htmlElem.settings.style != "") {
            $('#'+nameImg).addClass (htmlElem.settings.style);
            $('#'+nameText).html (this._findTitle(htmlElem.settings.styles, htmlElem.settings.style));
        }
        else {
            $('#'+nameText).html ("None");
        }
		
        // Build dropdown box
        if (document.getElementById ("styleSelectorBox"+options.name) == undefined)
        {
            var text = "<form id='styleSelectorBox"+options.name+"'>";
            var i = 0;
            for (var st in htmlElem.settings.styles) {
                text += "<input type='radio' id='styleSelectorBox"+options.name+""+i+"' name='radio' /><label for='styleSelectorBox"+options.name+""+i+"'>";
                text += "<table><tr><td width='"+(htmlElem.settings.height*2+4)+"px'><div class='ui-corner-all "+htmlElem.settings.styles[st]+"' style='width:"+(htmlElem.settings.height*2)+"px; height:"+(htmlElem.settings.height-4)+"px'></div></td><td width=10></td><td style='text-align: left; vertical-align: middle;'><div style='text-align: left; vertical-align: middle;'>";
                text += ((st != "")?st:htmlElem.settings.styles[st])+"</div></td></tr></table>";
                text += "</label><br>";
                i++;
            }
            text += "</form>";            
            htmlElem.settings.parent.append (text);
        }
        
        var box = $('#styleSelectorBox'+options.name);
        box.buttonset();
        $('#styleSelectorBox'+options.name+" :radio").click(htmlElem, function(e) {
            var rawElement = this;
            hqStyleSelector._select (e.data, rawElement.iStyle);
            hqStyleSelector._toggleDrop(e.data);
        });
        i = 0;
        // Set context
        for (var st in htmlElem.settings.styles) {
            document.getElementById ("styleSelectorBox"+options.name+""+i).iStyle = htmlElem.settings.styles[st];
            // Select current button
            if (htmlElem.settings.style == htmlElem.settings.styles[st]) {
                $("#styleSelectorBox"+options.name+""+i).attr("checked","checked");
                box.buttonset('refresh');
            }
            i++;
        }
		htmlElem.settings.count = i;
        box.css ({width: $('#styleSelector'+options.name).width(), overflow: "auto"}).addClass('ui-corner-all ui-widget-content');
        box.css ({position: 'absolute', top: elem.position().top + elem.height(), left: elem.position().left});
        box.hide ();
        this._currentElement++;
		return htmlElem;
    },
    _toggleDrop: function (obj)
    {
        if (obj.settings.dropOpened) {
            $("#styleSelectorBox"+obj.settings.id).css ({display: "none"});
            $("#styleSelectorB"+obj.settings.id).button("option", {icons: { primary: "ui-icon-circle-triangle-s" }});
            obj.settings.dropOpened = false;
        }
        else {
			var elem = $('#styleSelector'+obj.settings.id);		
			var elemBox = $("#styleSelectorBox"+obj.settings.id);		
			//if ($(window).height() < elemBox.height() + elemBox.position().top) {
			// Get position of last element
            var iHeight = obj.settings.count * (obj.settings.height + 18);
			if (iHeight > $(window).height() - elem.position().top - elem.height() - 5)
				elemBox.height($(window).height() - elem.position().top - elem.height() - 5);
			else
				elemBox.height(iHeight + 5);
				
			var iWidth = $("#styleSelector"+obj.settings.id).width();
			elemBox.buttonset().find('table').width(iWidth - 37 - this._scrollWidth);
            $("#styleSelectorBox"+obj.settings.id).css ({display: "", width: elem.width(), top: elem.position().top + elem.height(), left: elem.position().left});			
            $("#styleSelectorB"+obj.settings.id).button("option", {icons: { primary: "ui-icon-circle-triangle-n" }});
            obj.settings.dropOpened = true;
        }
         
    },
    _select: function (obj, iStyle)
    {
        var nameImg  = "styleSelectorImg" +obj.settings.id;
        var nameText = "styleSelectorText"+obj.settings.id;
        $('#'+nameImg).removeClass (obj.settings.style);
        obj.settings.style = iStyle;
        $('#'+nameImg).addClass (obj.settings.style);
        $('#'+nameText).html (this._findTitle(obj.settings.styles, obj.settings.style));
		if (obj.settings.onchange)
			obj.settings.onchange (obj.settings.style, obj.settings.onchangeParam);     
    },
    destroy: function (htmlElem) {
		$("#styleSelectorBox"+htmlElem.settings.id).remove ();			
		$('#styleSelector'+htmlElem.settings.id).remove ();			
    }
};

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
        $("#dui_editor").prop("title", "DashUI " + dui.version)
           .dialog({
            modal: false,
            autoOpen: false,
            width: 500,
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