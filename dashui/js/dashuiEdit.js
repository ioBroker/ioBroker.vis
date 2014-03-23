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

// duiEdit - the DashUI Editor

dui = $.extend(true, dui, {
    editVersion:        '0.9beta58',
    toolbox:            $("#dui_editor"),
    selectView:         $("#select_view"),
    activeWidget:       "",
    isStealCss:         false,
    gridWidth:          undefined,



    renameView: function () {
        var val = $("#new_name").val();
        if (val != "" && dui.views[val] === undefined) {
            dui.views[val] = $.extend(true, {}, dui.views[dui.activeView]);
            $("#dui_container").hide();
            delete dui.views[dui.activeView];
            dui.saveRemote();
            dui.activeView = val;
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
                dui.saveRemote();
                window.location.href = "edit.html";
           }
    },
    dupView: function (val) {
        //console.log("dupView("+val+")");
        if (val != "" && dui.views[val] === undefined) {
            dui.views[val] = $.extend(true, {}, dui.views[dui.activeView]);
            // Allen Widgets eine neue ID verpassen...
            for (var widget in dui.views[val].widgets) {
                dui.views[val].widgets[dui.nextWidget()] = dui.views[val].widgets[widget];
                delete dui.views[val].widgets[widget];
            }
            dui.saveRemote(function () {
                dui.renderView(val);
                dui.changeView(val);
                window.location.reload();
            });

        }
    },
    checkNewView: function() {
        if ($("#new_view_name").val() == "") {
            alert("Bitte einen Namen für die neue View eingeben!");
            return false;
        } else {
            return $("#new_view_name").val();
        }
    },
    nextWidget: function () {
        var next = 1;
        var used = [];
        var key = "w" + (("000000" + next).slice(-5));
        for (var view in dui.views) {
            for (var wid in dui.views[view].widgets) {
				wid = wid.split('_');
				wid = wid[0];
                used.push(wid);
            }
            while (used.indexOf(key) > -1) {
                next += 1;
                key = "w" + (("000000" + next).slice(-5));
            }
        }
        return key;
    },
    getViewOfWidget: function (id) {
		// find view of this widget
		var view = null;
		for (var v in dui.views) {
			if (dui.views[v] && dui.views[v].widgets && dui.views[v].widgets[id]) {
				view = v;
				break;
			}
		}
		
		return view;
	},
	getViewsOfWidget: function (id) {
		if (id.indexOf ('_') == -1) {
			var view = dui.getViewOfWidget(id);
			if (view) {
				return [view];
			} else {
				return [];
			}
		} else {
			var wids = id.split('_', 2);
			var wid = wids[0];
			var result = [];
			for (var v in dui.views) {
				if (dui.views[v].widgets[wid+'_'+v] !== undefined) {
					result[result.length] = v;
				}
			}
			return result;
		}
	},
	delWidgetHelper: function (id, isAll) {
		if (isAll && id.indexOf('_') != -1) {
			var views = dui.getViewsOfWidget(id);
			var wids = id.split('_', 2);
			for (var i = 0; i < views.length; i++) {
				dui.delWidgetHelper(wids[0] + '_' + views[i], false);
			}
			dui.inspectWidget("none");
			return;
		}
	
		if (id === undefined || id == null || id == "") {
			return;
		}
		
		$("#select_active_widget option[value='"+id+"']").remove();
		$("#select_active_widget").multiselect("refresh");       

		var view = dui.getViewOfWidget(id);
		
		var widget_div = document.getElementById(id);
		if (widget_div && widget_div.dashuiCustomEdit && widget_div.dashuiCustomEdit['delete']) {
			widget_div.dashuiCustomEdit['delete'](id);
		}
        
		$("#"+id).remove();
		if (view) {
			delete(dui.views[view].widgets[id]);
		}
		if (dui.widgets[id]) {
			delete dui.widgets[id]; 
			var widgets = [];
			// Delete old from array
			for (var w in dui.widgets) {
				if (w != id) {
					widgets[w] = dui.widgets[w];
				}
			}
			dui.widgets = widgets;
		}		
	},
	delWidget: function () {
		dui.clearWidgetHelper();
		dui.delWidgetHelper(dui.activeWidget, true);
		dui.saveRemote();
		dui.inspectWidget("none");
    },
    addWidget: function (tpl, data, style, wid, view, hidden) {
		var isSelectWidget = (wid === undefined);
		var isViewExist    = (document.getElementById("duiview_"+view) != null);

		if (view === undefined) {
			view = dui.activeView;
		}
		
        if (isSelectWidget && !isViewExist) {

            dui.renderView(view, true, false);
			isViewExist = true;
        }
		
		if (isSelectWidget) {
			dui.clearWidgetHelper();
		}

        var widgetId = wid || dui.nextWidget();

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
				"digits": "",
				"min": 0,
				"max": 1,
				"step": 0.01,
				off_text: undefined,
				on_text: undefined,
				buttontext: undefined
			}, data))
		};
		if (isViewExist) {
			$("#duiview_"+view).append(can.view(tpl, {hm: homematic.uiState["_"+dui.widgets[widgetId].data.hm_id], "data": dui.widgets[widgetId]["data"], "view": view}));
		}

        if (!dui.views[view].widgets) {
            dui.views[view].widgets = {};
        }
        if (!dui.views[view].widgets[widgetId]) {
            dui.views[view].widgets[widgetId] = {};
        }
		
		if (!style) {
			var jWidgetId = $('#'+widgetId);
			style = dui.findFreePosition (view, widgetId, null, jWidgetId.width(), jWidgetId.height());
		}
		
		if(dui.views[view].widgets[widgetId].data !== undefined) {
			data = $.extend(data, dui.views[view].widgets[widgetId].data, true);
		}
		
        dui.views[view].widgets[widgetId] = {
            tpl:   tpl,
            data:  data,
            style: style
        };

        if (style) {
            $("#"+widgetId).css(style);
        }
		

		if (isSelectWidget) {
            dui.binds.basic._disable();
			dui.binds.jqueryui._disable();
		}
		
        $("#"+widgetId).click(function (e) {
            console.log("click "+widgetId+" isStealCss="+dui.isStealCss);
            if (!dui.isStealCss) {

                e.preventDefault();
                e.stopPropagation();
                dui.inspectWidget(widgetId);
                return false;
            }
        });
		
		if (isSelectWidget) {
			dui.activeWidget = widgetId;
			dui.actionNewWidget(widgetId);
		}
		
		
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
            style.top  += 10;
            style.left += 10;
            dui.activeWidget = dui.addWidget(tpl, data, style);

            $("#select_active_widget").append("<option value='"+dui.activeWidget+"'>"+dui.activeWidget+" ("+$("#"+dui.views[dui.activeView].widgets[dui.activeWidget].tpl).attr("data-dashui-name")+")</option>").multiselect("refresh");

            setTimeout(function() {
                dui.inspectWidget(dui.activeWidget);
                dui.saveRemote();
            }, 50);
        } else {
            if ($("#dui_container").find("#duiview_"+targetView).html() == undefined) {
                dui.renderView(targetView, true, true);
            }
            dui.addWidget(tpl, data, style, dui.nextWidget(), targetView, true);
            dui.saveRemote();

            alert("Widget copied to view " + targetView + ".");
        }
    },
	renameWidget: function (oldId, newId) {
		// find view of this widget
		var view = dui.getViewOfWidget(oldId);
		
		// create new widget with the same properties
		if (view) {
			dui.addWidget(dui.views[view].widgets[oldId].tpl, dui.views[view].widgets[oldId].data, dui.views[view].widgets[oldId].style, newId, view);
            $("#select_active_widget").append("<option value='"+newId+"'>"+newId+" ("+$("#"+dui.views[view].widgets[newId].tpl).attr("data-dashui-name")+")</option>").multiselect("refresh");
			dui.delWidgetHelper(oldId, false);
		}
		dui.inspectWidget(newId);
		dui.saveRemote();
	},
	// find this wid in all views, 
	// delete where it is no more exist, 
	// create where it should exist and
	// sync data
	syncWidget: function (id, views) {
		// find view of this widget
		var view = dui.getViewOfWidget(id);
		
		if (views === undefined) {
			views = dui.getViewsOfWidget(id);
		}
		
		if (view) {
			if (views == null) {
				views = [];
			}
		
			var isFound = false;
			for (var i = 0; i < views.length; i++) {
				if (views[i] == view) {
					isFound = true;
					break;
				}
			}
		
			if (!isFound) {
				views[views.length] = view;
			}
			var wids = id.split('_', 2);
			var wid = wids[0];
			
			// First sync views
			for (var v_ in dui.views) {
				var isFound = false;
				if (v_ == view) {
					continue;
				}
				
				for (var i = 0; i < views.length; i++) {
					if (views[i] == v_) {
						isFound = true;
						break;
					}
				}
				
				if (dui.views[v_].widgets[wid+'_'+v_] !== undefined) {
					dui.delWidgetHelper(wid+'_'+v_, false);
				}
				
				if (isFound) {	
					// Create 
					dui.addWidget(dui.views[view].widgets[id].tpl, dui.views[view].widgets[id].data, dui.views[view].widgets[id].style, wid+'_'+v_, v_);
				}
			}
			
			
			if (views.length < 2 && (id.indexOf('_') != -1)) {
				// rename this widget from "wid_view" to "wid"
				var wids = id.split('_', 2);
				dui.renameWidget(id, wids[0]);
			}
			else
			if (views.length > 1 && (id.indexOf('_') == -1)) {
				dui.renameWidget(id, id+'_'+view);
			}
		}
	},
    editObjectID: function (widget, wid_attr, widget_filter) {
        // Edit for Homematic ID
        $("#widget_attrs").append('<tr id="option_'+wid_attr+'" class="dashui-add-option"><td>'+this.translate(wid_attr)+':</td><td><input type="text" id="inspect_'+wid_attr+'" size="5"><input type="button" id="inspect_'+wid_attr+'_btn" value="..."  style="width:30px"><div id="inspect_'+wid_attr+'_desc"></div></td></tr>');
        document.getElementById("inspect_"+wid_attr+"_btn").jControl = wid_attr;
        $("#inspect_"+wid_attr+"_desc").html(dui.getObjDesc(widget.data[wid_attr]));
        // Select Homematic ID Dialog
        $("#inspect_"+wid_attr+"_btn").click( function () {
            hmSelect.value = $("#inspect_"+this.jControl).val();
            hmSelect.show(homematic, this.jControl, function (obj, value) {
                $("#inspect_"+obj).val(value);
                $("#inspect_"+obj).trigger('change');
                if (document.getElementById('inspect_hm_wid')) {
                    if (homematic.regaObjects[value]["Type"] !== undefined && homematic.regaObjects[value]["Parent"] !== undefined &&
                        (homematic.regaObjects[value]["Type"] == "STATE" ||
                            homematic.regaObjects[value]["Type"] == "LEVEL")) {
                        var parent = homematic.regaObjects[value]["Parent"];
                        if (homematic.regaObjects[parent]["DPs"] !== undefined &&
                            homematic.regaObjects[parent]["DPs"]["WORKING"] !== undefined) {
                            $("#inspect_hm_wid").val(homematic.regaObjects[parent]["DPs"]["WORKING"]);
                            $("#inspect_hm_wid").trigger('change');
                        }
                    }
                }
                // Try to find Function of the device and fill the Filter field
                if (document.getElementById('inspect_filterkey')) {
                    if ($('#inspect_filterkey').val() == "") {
                        var hm_id = value;
                        var func = null;
                        while (hm_id && homematic.regaObjects[hm_id]) {
                            for (var t = 0; t < homematic.regaIndex["ENUM_FUNCTIONS"].length; t++) {
                                var list = homematic.regaObjects[homematic.regaIndex["ENUM_FUNCTIONS"][t]];
                                for (var z = 0; z < list['Channels'].length; z++) {
                                    if (list['Channels'][z] == hm_id) {
                                        func = list.Name;
                                        break;
                                    }
                                }
                                if (func)
                                    break;
                            }
                            if (func)
                                break;

                            hm_id = homematic.regaObjects[hm_id]['Parent'];
                        }
                        if (func)
                            $('#inspect_filterkey').val(func).trigger('change');
                    }
                }
            }, widget_filter);
        });
    },
    editSelect: function (widget, wid_attr, values) {
        // Select
        var text = '<tr id="option_'+wid_attr+'" class="dashui-add-option"><td class="dashui-edit-td-caption">'+this.translate(wid_attr)+':</td><td><select id="inspect_'+wid_attr+'">';
        for (var t = 0; t < values.length; t++) {
            text += "<option value='"+values[t]+"' "+((values[t] == widget.data[wid_attr]) ? "selected" : "")+">"+this.translate(values[t])+"</option>";
        }
        text += "</select></td></tr>";
        $("#widget_attrs").append(text);
    },
    editFontName: function (widget, wid_attr) {
        // Select
        var values = ["", "Arial", "Times", "Andale Mono", "Comic Sans", "Impact"];
        dui.editSelect(widget, wid_attr, values);
    },
    editCheckbox: function (widget, wid_attr) {
        // All other attributes
        $("#widget_attrs").append('<tr id="option_'+wid_attr+'" class="dashui-add-option"><td class="dashui-edit-td-caption">'+this.translate(wid_attr)+':</td><td><input id="inspect_'+wid_attr+'" type="checkbox"' +(widget.data[wid_attr] ? "checked": "")+'></td></tr>');
    },
    editColor: function (widget, wid_attr) {
        // Color selector
        $("#widget_attrs").append('<tr id="option_'+wid_attr+'" class="dashui-add-option"><td>'+this.translate(wid_attr)+':</td><td><input type="text" id="inspect_'+wid_attr+'" size="44" style="width:90%" /><input id="inspect_'+wid_attr+'Btn"  style="width:8%" type="button" value="..."></td></tr>');
        if (colorSelect) {
            var btn = document.getElementById("inspect_"+wid_attr+"Btn");
            if (btn) {
                btn.ctrlAttr = wid_attr;
                $(btn).bind("click", {msg: this}, function (event) {
                    var _settings = {
                        current:     $('#inspect_'+this.ctrlAttr).val(),
                        onselectArg: this.ctrlAttr,
                        onselect:    function (img, ctrlAttr) {
                            $('#inspect_'+ctrlAttr).val(colorSelect.GetColor()).trigger("change");
                        }};
                    colorSelect.Show(_settings);
                });
            }
        }
    },
    editViewName: function (widget, wid_attr) {
        // View selector
        $("#widget_attrs").append('<tr id="option_'+wid_attr+'" class="dashui-add-option"><td>'+this.translate(wid_attr)+':</td><td><input type="text" id="inspect_'+wid_attr+'" size="44"/></td></tr>');

        // autocomplete for filter key
        var elem = document.getElementById('inspect_'+wid_attr);
        if (elem) {
            elem._save = function () {
                if (this.timer)
                    clearTimeout(this.timer);

                this.timer = setTimeout(function(elem_) {
                    // If really changed
                    var $this = $(elem_);
                    var attr = $this.attr("id").slice(8);
                    dui.widgets[dui.activeWidget].data.attr(attr, $this.val());
                    dui.views[dui.activeView].widgets[dui.activeWidget].data[attr] = $this.val();
                    var bt = $('#inspect_buttontext');
                    if (bt && bt.val() == "") {
                        bt.val($this.val().charAt(0).toUpperCase() + $this.val().slice(1).toLowerCase()).trigger('change');
                    }
                    dui.reRenderWidget(dui.activeWidget);
                    dui.saveRemote();
                }, 200, this);
            };

            $(elem).autocomplete({
                minLength: 0,
                source: function(request, response) {
                    var views = [];
                    for (var v in dui.views) {
                        views[views.length] = v;
                    }

                    var data = $.grep(views, function(value) {
                        return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
                    });

                    response(data);
                },
                select: function (event, ui) {
                    this._save();
                },
                change: function (event, ui) {
                    this._save();
                }
            }).focus(function () {
                    $(this).autocomplete("search", "");
                }).keyup(function () {
                this._save();
            }).val(widget.data[wid_attr]);
        }
    },
    editEffects: function (widget, wid_attr) {
        // Effect selector
        $("#widget_attrs").append('<tr id="option_'+wid_attr+'" class="dashui-add-option"><td>'+this.translate(wid_attr)+':</td><td><input type="text" id="inspect_'+wid_attr+'" size="44"/></td></tr>');

        // autocomplete for filter key
        var elem = document.getElementById('inspect_'+wid_attr);
        if (elem) {
            elem._save = function () {
                if(this.timer)
                    clearTimeout(this.timer);

                this.timer = setTimeout(function(elem_) {
                    // If really changed
                    var $this = $(elem_);
                    var attr = $this.attr("id").slice(8);
                    dui.widgets[dui.activeWidget].data.attr(attr, $this.val());
                    dui.views[dui.activeView].widgets[dui.activeWidget].data[attr] = $this.val();
                    dui.saveRemote();
                }, 200, this);
            };

            $(elem).autocomplete({
                minLength: 0,
                source: function(request, response) {
                    var effects = ['',
                        'show',
                        'blind',
                        'bounce',
                        'clip',
                        'drop',
                        'explode',
                        'fade',
                        'fold',
                        'highlight',
                        'puff',
                        'pulsate',
                        'scale',
                        'shake',
                        'size',
                        'slide'];

                    var data = $.grep(effects, function(value) {
                        return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
                    });

                    response(data);
                },
                select: function (event, ui) {
                    this._save();
                },
                change: function (event, ui) {
                    this._save();
                }
            }).focus(function () {
                    $(this).autocomplete("search", "");
                }).keyup(function () {
                this._save();
            }).val(widget.data[wid_attr]);
        }
    },
    editImage: function (widget, wid_attr) {
        // Image src
        $("#widget_attrs").append('<tr id="option_'+wid_attr+'" class="dashui-add-option"><td>'+this.translate(wid_attr)+':</td><td><input type="text" id="inspect_'+wid_attr+'" size="44"/><input type="button" id="inspect_'+wid_attr+'_btn" value="..."></td></tr>');
        document.getElementById("inspect_"+wid_attr+"_btn").jControl = wid_attr;
        // Select image Dialog
        $("#inspect_"+wid_attr+"_btn").click( function () {
            var settings = {
                current: $("#inspect_"+this.jControl).val(),
                onselectArg: this.jControl,
                onselect:    function (img, obj)
                {
                    $("#inspect_"+obj).val(img);
                    $("#inspect_"+obj).trigger("change");
                }};
            dui.imageSelect.Show(settings);
        });
    },
    editSlider: function (widget, wid_attr, min, max, step) {
        min = (min === undefined || min === null || min == "") ? 0 : parseFloat(min);
        max = (max === undefined || max === null || max == "") ? 0 : parseFloat(max);
        step = (!step) ? (max - min) / 100 : parseFloat(step);
        // Image src
        $("#widget_attrs").append('<tr id="option_'+wid_attr+'" class="dashui-add-option"><td>'+this.translate(wid_attr)+':</td><td><table style="width:100%" class="dashui-no-spaces"><tr class="dashui-no-spaces"><td  class="dashui-no-spaces" style="width:50px"><input type="text" id="inspect_'+wid_attr+'" size="5"/></td><td  class="dashui-no-spaces" style="width:20px">'+min+'</td><td><div id="inspect_'+wid_attr+'_slider"></div></td><td  class="dashui-no-spaces" style="width:20px;text-align:right">'+max+'</td></tr></table></td></tr>');

        var slider = $( "#inspect_"+wid_attr+"_slider");
        slider.slider({
            value: widget.data[wid_attr],
            min: min,
            max: max,
            step: step,
            slide: function( event, ui ) {
                /*if (this.timer)
                    clearTimeout (this.timer);

                this.timer = setTimeout (function(elem_, value) {
                    // If really changed
                    var $this = $(elem_);
                    var attr = $this.attr("id").slice(8);
                    var text = $("#inspect_"+wid_attr);
                    if (text.val() != value) {
                        text.val(value).trigger("change");
                    }
                }, 200, this, ui.value);*/
                var $this = $(this);
                var attr = $this.attr("id").slice(8);
                var text = $("#inspect_"+wid_attr);
                if (text.val() != ui.value) {
                    text.val(ui.value).trigger("change");
                }
            }
        })
        var inspect = $("#inspect_"+wid_attr);

        inspect.val(widget.data[wid_attr]);

        inspect.change(function () {
            var attribute = $(this).attr("id").slice(8);
            var val = $(this).val();
            var slider = $( "#inspect_"+wid_attr+"_slider");
            if (slider.slider("option", "value") != val) {
                slider.slider("option", "value", val);
            }
            dui.widgets[dui.activeWidget].data.attr(attribute, val);
            dui.views[dui.activeView].widgets[dui.activeWidget].data[attribute] = val;
            dui.saveRemote();
            dui.reRenderWidget(dui.activeWidget);
        }).keyup(function () {
            $(this).trigger('change');
        });
    },
    inspectWidget: function (id) {

        if (dui.isStealCss) { return false; }
        if (dui.widgets[id]) {
            //console.log(dui.widgets[id].data);
        }
        $("#select_active_widget option[value='"+id+"']").prop("selected", true);
        $("#select_active_widget").multiselect("refresh");

        // Alle Widgets de-selektieren und Interaktionen entfernen
        $(".dashui-widget").each(function() { $(this).removeClass("dashui-widget-edit");
            if ($(this).hasClass("ui-draggable")) {
                $(this).draggable("destroy");
            }
            if ($(this).hasClass("ui-resizable")) {
                $(this).resizable("destroy");
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

        if (!widget) {
            console.log("inspectWidget Widget undefined");
        }

        // Inspector aufbauen
        $(".dashui-widget-tools").show();

        $(".dashui-inspect-widget").each(function () {
            var $this = $(this);
            var attr = $this.attr("id").slice(8);
            if (dui.views[dui.activeView].widgets[dui.activeWidget]) {
                $this.val(dui.views[dui.activeView].widgets[dui.activeWidget].data[attr]);
            }
        });

        var widget_attrs  = $("#" + widget.tpl).attr("data-dashui-attrs").split(";");
        var widget_filter = $("#" + widget.tpl).attr("data-dashui-filter");

        $('#inspect_comment_tr').show();
        $('#inspect_class_tr').show();
        var widget_div = document.getElementById(dui.activeWidget);
        var editParent = $("#widget_attrs").css({"width": "100%"});
       
        // Edit all attributes
        for (var attr in widget_attrs) {
            if (widget_attrs[attr] != "") {
                // Format: attr_name[default_value]/type
                // Type format: id - Object ID Dialog
                //              checkbox
                //              image
                //              color
                //              views
                //              effect
                //              fontName
                //              slide,min,max,step - Default step is ((max - min) / 100)
                //              select_value1,select_value2,...

				var isValueSet = false;
				var wid_attrs = widget_attrs[attr].split('/');
				var wid_attr  = wid_attrs[0];
                // Try to extract default value
                var uu = wid_attr.indexOf("[");
                if (uu != -1) {
                    var defaultValue = wid_attr.substring (uu + 1);
                    defaultValue = defaultValue.substring (0, defaultValue.length -1);
                    wid_attr = wid_attr.substring(0,uu);
                    if (widget.data[wid_attr] == null || widget.data[wid_attr] === undefined) {
                        widget.data[wid_attr] = defaultValue;
                        dui.reRenderWidget(dui.activeWidget);
                    }
                }
                var type = (wid_attrs.length > 1) ? wid_attrs[1] : null;
                if (type && type.indexOf(",") != -1) {
                    if (type.substring(0, "slider".length) == "slider") {
                        type = "slider";
                    }
                    else {
                        type = "select";
                    }
                }
					
                if (widget_div && widget_div.dashuiCustomEdit && widget_div.dashuiCustomEdit[wid_attr]) {
                    widget_div.dashuiCustomEdit[wid_attr](dui.activeWidget, editParent);
                } else 
				if (wid_attr === "hm_id" || type == "id") {
                    dui.editObjectID(widget, wid_attr, widget_filter);
                } else 
				if (wid_attr === "hm_wid") {
                    dui.editObjectID(widget, wid_attr, 'WORKING');
                    /*// Eidt for Homematic Working ID
                    $("#widget_attrs").append('<tr id="option_'+wid_attr+'" class="dashui-add-option"><td>'+this.translate(wid_attr)+':</td><td><input type="text" id="inspect_'+wid_attr+'" size="5"><input type="button" id="inspect_'+wid_attr+'_btn" value="..."  style="width:30px"><div id="inspect_'+wid_attr+'_desc"></div></td></tr>');
                    document.getElementById ("inspect_"+wid_attr+"_btn").jControl = wid_attr;
                    $("#inspect_"+wid_attr+"_desc").html(dui.getObjDesc (widget.data[wid_attr]));
                    // Select Homematic ID Dialog
                    $("#inspect_"+wid_attr+"_btn").click ( function () {
                        hmSelect.value = $("#inspect_"+this.jControl).val();
                        hmSelect.show (homematic, this.jControl, function (obj, value) {
                            $("#inspect_"+obj).val(value);
                            $("#inspect_"+obj).trigger('change');
                        }, 'WORKING');
                    });*/
                } else 
				if (wid_attr.indexOf("src") == 0 || type == "image") {
                    dui.editImage(widget, wid_attr);
                } else
				if (wid_attr === "hqoptions") {
                    // hqWidgets options
                    $('#inspect_comment_tr').hide();
                    $('#inspect_class_tr').hide();
                    // Common settings
                    if (dui.binds.hqWidgetsExt) {
                        hqWidgets.hqEditButton({parent: editParent, imgSelect: dui.imageSelect, clrSelect: colorSelect, styleSelect: dui.styleSelect}, hqWidgets.Get (dui.activeWidget), function (editEl) {
                            // Special HM settings
                            dui.binds.hqWidgetsExt.hqEditButton (hqWidgets.Get (dui.activeWidget), editParent, $("#" + dui.views[dui.activeView].widgets[dui.activeWidget].tpl).attr("data-hqwidgets-filter"), editEl);                    
                        });
                    }
                } else 
				if (wid_attr === "weoid") {
                    // Weather ID
                    $("#widget_attrs").append('<tr class="dashui-add-option"><td id="option_'+wid_attr+'" ></td></tr>');
                    $('#inspect_comment_tr').hide();
                    $('#inspect_class_tr').hide();
                    $('#option_'+wid_attr).jweatherCity({lang: dui.language, currentValue: widget.data[wid_attr], onselect: function (wid, text, obj) {
                            dui.widgets[dui.activeWidget].data.attr('weoid', text);
                            dui.views[dui.activeView].widgets[dui.activeWidget].data['weoid'] = text;
                            dui.saveRemote();
                            dui.reRenderWidget(dui.activeWidget);					
                        }
                    });
                } else 
				if (wid_attr === "color" || type == "color") {
                    dui.editColor(widget, wid_attr);
                } else
                if (type === "checkbox") {
                    isValueSet = true;
                    dui.editCheckbox(widget, wid_attr);
                } else
                if (type === "fontName") {
                    isValueSet = true;
                    dui.editFontName(widget, wid_attr);
                } else
                if (type === "slider") {
                    isValueSet = true;
                    var values = wid_attrs[1].split(',');
                    dui.editSlider(widget, wid_attr, values[1], values[2], values[3]);
                    continue;
                } else
                if (type === "select") {
                    isValueSet = true;
                    var values = wid_attrs[1].split(',');
                    dui.editSelect(widget, wid_attr, values);
                } else
                if (wid_attr.indexOf("nav_view") != -1|| type == "views") {
				    dui.editViewName(widget, wid_attr);
					continue;
				} else 
				if (wid_attr.indexOf("_effect") != -1 || type == "effect") {
                    dui.editEffects(widget, wid_attr);
					continue;
				} else 
				if (wid_attr.slice(0,4) !== "html") {
                    if (type !== null) {
						// If description is JSON object
						if (type.indexOf('{') != -1) {
							try {
								type = jQuery.parseJSON(type);
							}
							catch (e) {
								type = null;
								$("#widget_attrs").append('<tr id="option_'+wid_attr+'" class="dashui-add-option"><td class="dashui-edit-td-caption">'+this.translate(wid_attr)+':</td><td><input type="text" id="inspect_'+wid_attr+'" size="44"/></td></tr>');
							}
						}
						
						if (type !== null) {
							if (typeof type == 'object') {
								var title = this.translate(wid_attr);
								var hint  = "";
								if (type["name"]) {
									if (typeof type["name"] == 'object') {
										if (type["name"][this.language]) {
											title = type["name"][this.language];
										} else
										if (type["name"]['en']) {
											title = type["name"]['en'];
										}
									}
									else {
										title = type["name"];
									}
								}
								
								
								if (type['type'] == "checkbox") {
									isValueSet = true;
									// All other attributes
									$("#widget_attrs").append('<tr id="option_'+wid_attr+'" class="dashui-add-option"><td class="dashui-edit-td-caption" title="'+hint+'">'+title+':</td><td><input title="'+hint+'" id="inspect_'+wid_attr+'" type="checkbox"' +(widget.data[wid_attr] ? "checked": "")+'></td></tr>');
								} else 
								if (type['type'] == "view") {
								} else
								if (type['type'] == "color") {
								} else
								if (type['type'] == "font") {
								} else
								if (type['type'] == "rooms") {
								} else
								if (type['type'] == "favorites") {
								} else
								if (type['type'] == "functions") {
								} else
								if (type['type'] == "rooms") {
								} else
								if (type['type'] == "select") {
									// Select
									var values = type['values'];
									var text = '<tr id="option_'+wid_attr+'" class="dashui-add-option"><td class="dashui-edit-td-caption">'+this.translate(wid_attr)+':</td><td><select id="inspect_'+wid_attr+'">';
									for (var t = 0; t < values.length; t++) {
										text += "<option value='"+values[t]+"' "+((values[t] == widget.data[wid_attr]) ? "selected" : "")+">"+this.translate(values[t])+"</option>";
									}
									text += "</select></td></tr>";
									$("#widget_attrs").append(text);
									isValueSet = true;
								}
							
							}
							else { // Simple type
								console.log ("Error: " + wid_attr +" Type: " + type );
							}
						}
					} else {
						// html
						$("#widget_attrs").append('<tr id="option_'+wid_attr+'" class="dashui-add-option"><td class="dashui-edit-td-caption">'+this.translate(wid_attr)+':</td><td><input type="text" id="inspect_'+wid_attr+'" size="44"/></td></tr>');
					}
                } else {
                    // Text area
                    $("#widget_attrs").append('<tr id="option_'+wid_attr+'" class="dashui-add-option"><td class="dashui-edit-td-caption">'+this.translate(wid_attr)+':</td><td><textarea id="inspect_'+wid_attr+'" rows="2" cols="44"></textarea></td></tr>');
                }
				
				var inspect = $("#inspect_"+wid_attr);
                
				if (!isValueSet) {
					inspect.val(widget.data[wid_attr]);
				}
                inspect.change(function () {
                        var attribute = $(this).attr("id").slice(8);
                        var val = $(this).val();
                        if (this.type == "checkbox") {
							val = $(this).prop("checked");
						}

						if (attribute == "hm_id" || attribute == "hm_wid") {
                            $("#inspect_"+attribute+"_desc").html(dui.getObjDesc (val));
                        }
                        dui.widgets[dui.activeWidget].data.attr(attribute, val);
                        dui.views[dui.activeView].widgets[dui.activeWidget].data[attribute] = val;
                        dui.saveRemote();
                        dui.reRenderWidget(dui.activeWidget);
                }).keyup(function () {
                    $(this).trigger('change');
                });
            }
        }

        $(".dashui-inspect-css").each(function () {
            $(this).val($this.css($(this).attr("id").slice(12)));
        });

        // autocomplete for filter key
        var elem = document.getElementById ('inspect_filterkey');
        if (elem) {
            dui.updateFilter();
            elem._save = function () {
                if (this.timer) 
                    clearTimeout (this.timer);
                    
                this.timer = setTimeout (function(elem_) {
                     // If really changed
                    var $this = $(elem_);
                    var attr = $this.attr("id").slice(8);
                    dui.views[dui.activeView].widgets[dui.activeWidget].data[attr] = $this.val();
                    dui.saveRemote();                  
                }, 200, this);            
            };
            
            $(elem).autocomplete({
                minLength: 0,
                source: function(request, response) {            
                    var data = $.grep(dui.views[dui.activeView].filterList, function(value) {
                        return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
                    });            

                    response(data);
                },
                select: function (event, ui) {
                    this._save();               
                },
                change: function (event, ui) {
                    this._save();               
                }
            }).focus(function () {
                $(this).autocomplete("search", "");
            }).keyup (function () {
                this._save();               
            }); 
        }
		
		$('#inspect_views').html("");
		var views = dui.getViewsOfWidget (dui.activeWidget);
		for (var v in dui.views) {
			if (v != dui.activeView) {
				var selected = "";
				for (var i = 0; i < views.length; i++) {
					if (views[i] == v) {
						selected = "selected";
						break;
					}
				}
			
				$("#inspect_views").append("<option value='"+v+"' "+ selected +">"+v+"</option>");
			}
		}
		
        $('#inspect_views').multiselect({
			minWidth: 300,
			height: 260,
			noneSelectedText: dui.translate("Single view"),
			selectedText: function(numChecked, numTotal, checkedItems){
				var text = "";
				for (var i = 0; i < checkedItems.length; i++) {
					text += ((text == "") ? "" : ",") + checkedItems[i].title;
				}
				return text;
			},
			multiple: true,
			checkAllText:     dui.translate("Check all"),
			uncheckAllText:   dui.translate("Uncheck all"),
			noneSelectedText: dui.translate("Select options")
		}).change (function () {
			dui.syncWidget (dui.activeWidget, $(this).val());
			dui.saveRemote ();
		});
        
        // Widget selektieren
        $("#select_active_widget option").removeAttr("selected");
        $("#select_active_widget option[value='"+id+"']").prop("selected", true);
        $("#select_active_widget").multiselect("refresh");

        if ($("#snap_type option:selected").val() == 2) {
            dui.gridWidth = parseInt($("#grid_size").val());

            if (dui.gridWidth < 1 || isNaN(dui.gridWidth) ) {
                dui.gridWidth = 10;
            }

            var x = parseInt($this.css("left")),
                y = parseInt($this.css("top"));

            x = Math.floor(x / dui.gridWidth) * dui.gridWidth;
            y = Math.floor(y / dui.gridWidth) * dui.gridWidth;

            $this.css({"left": x, "top": y});
        }
		var pos = $this.position ();
        // May be bug?
        if (pos.left == 0 && pos.top == 0) {
            pos.left = $this[0].style.left;
            pos.top  = $this[0].style.top;
            if (typeof pos.left == "string") {
                pos.left = parseInt (pos.left.replace("px", ""));
            }
            if (typeof pos.top == "string") {
                pos.top = parseInt (pos.top.replace("px", ""));
            }

        }
		var w = $this.width ();
		var h = $this.height ();
        $("#widget_helper").css({left: pos.left - 2, top:  pos.top - 2,  height: $this.outerHeight() + 2, width: $this.outerWidth()  + 2}).show();

        // Interaktionen
        dui.draggable($this);
        dui.resizable($this);

        // Inspector aufrufen
        $("#inspect_wid").html(id);
        $("#inspect_wid2").html(id);
        var tabActive = $("#tabs").tabs("option", "active");
        if (tabActive !== 1 && tabActive !== 2) {
            $("#tabs").tabs("option", "active", 1);
        }
    },
    draggable: function (obj) {
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
                dui.saveRemote();

            },
            drag: function(event, ui) {
                $("#widget_helper").css({left: ui.position.left - 2, top: ui.position.top - 2});
            }
        };
        if ($("#snap_type option:selected").val() == 1) {
            draggableOptions.snap = "#dui_container div.dashui-widget";
        }
        if ($("#snap_type option:selected").val() == 2) {
            draggableOptions.grid = [dui.gridWidth,dui.gridWidth];
        }
        obj.draggable(draggableOptions);
    },
    resizable: function (obj) {
        var resizableOptions;
        if (obj.attr("data-dashui-resizable")) {
            resizableOptions = $.parseJSON(obj.attr("data-dashui-resizable"));
        }
        if (!resizableOptions) {
            resizableOptions = {};
        }
        if (resizableOptions.disabled !== true) {
            resizableOptions.disabled = false;
            obj.resizable($.extend({
                stop: function(event, ui) {
                    var widget = ui.helper.attr("id")
                    $("#inspect_css_width").val(ui.size.width + "px");
                    $("#inspect_css_height").val(ui.size.height + "px");
                    if (!dui.views[dui.activeView].widgets[widget].style) {
                        dui.views[dui.activeView].widgets[widget].style = {};
                    }
                    dui.views[dui.activeView].widgets[widget].style.width = ui.size.width;
                    dui.views[dui.activeView].widgets[widget].style.height = ui.size.height;
                    dui.saveRemote();

                },
                resize: function (event,ui) {
                    $("#widget_helper").css({width: ui.element.outerWidth() + 2, height: ui.element.outerHeight() + 2});
                }
            }, resizableOptions));
        }
    },
    clearWidgetHelper: function () {
        $("#widget_helper").hide();
    },
    editInit: function () {
        $(".dashui-version").html(dui.version);
        $("#dui_editor").prop("title", "DashUI " + dui.version)
           .dialog({
            modal: false,
            autoOpen: false,
            width:  420,
            minWidth: 420,
            height: 610,
            position: { my: "right top", at: "right top", of: window },
            dialogClass: "dui-editor-dialog",
            close: function () {
                dui.saveRemote();
                location.href = "./#"+dui.activeView;
            }
        });
         $("#dui_editor").dialogExtend({
            "minimizable" : true,
            "icons" : { "maximize" : "ui-icon-arrow-4-diag" },
            "minimize" : function(evt) {
               $("#dui_editor").dialog( "option", "position", { my: "right top", at: "right top", of: window });
            }
        });
		/*$(".ui-dialog-titlebar-buttonpane").append("<button id='dialog_dock'></button>");
		$("#dialog_dock").button({icons: {primary: "ui-icon ui-icon-pin-w"}, text: false}).css({"height": 30});
		*/
        $("#tabs").tabs();
        $("#widget_helper").hide();

        $("#language [value='"+(ccuIoLang || 'en')+"']").attr("selected", "selected");

        $("#language").change(function () {
            dui.language = $(this).val();
            ccuIoLang = dui.language;
            dui.translateAll (dui.language);
        });

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
                height: $(this).attr("data-multiselect-height"),
			    checkAllText:dui.translate("Check all"),
			    uncheckAllText:dui.translate("Uncheck all"),
			    noneSelectedText:dui.translate("Select options")

            });
        });
        $("select.dashui-editor-large").each(function () {
            $(this).multiselect({
                multiple: false,
                header: false,
                noneSelectedText: false,
                selectedList: 1,
                minWidth: 250,
                height: 410,
			    checkAllText:dui.translate("Check all"),
			    uncheckAllText:dui.translate("Uncheck all"),
			    noneSelectedText:dui.translate("Select options")

            });
        });
        $("select.dashui-editor-xlarge").each(function () {
            $(this).multiselect({
                multiple: false,
                header: false,
                noneSelectedText: false,
                selectedList: 1,
                minWidth: 420,
                height: 340,
			    checkAllText:dui.translate("Check all"),
			    uncheckAllText:dui.translate("Uncheck all"),
			    noneSelectedText:dui.translate("Select options")

            });
        });


        // Button Click Handler

		$("#widget_doc").button ({icons: {primary: "ui-icon ui-icon-script"}}).click(function () {
            var tpl = dui.views[dui.activeView].widgets[dui.activeWidget].tpl;
            var widgetSet = $("#"+tpl).attr("data-dashui-set");
            var docUrl = "widgets/"+widgetSet+"/doc.html#"+tpl;
            window.open(docUrl,"WidgetDoc", "height=640,width=500,menubar=no,resizable=yes,scrollbars=yes,status=yes,toolbar=no,location=no");
        });

        $("#convert_ids").click(dui.convertIds);
        $("#clear_cache").click(function() {
            // TODO - Entfällt $.homematic("clearCache");
        });
        $("#refresh").click(function() {
            // TODO Entfällt $.homematic("refreshVisible");
        });
		$("#del_widget").button ({icons: {primary: "ui-icon-trash"}}).click(dui.delWidget);

		$("#dup_widget").button ({icons: {primary: "ui-icon-copy"}}).click(dui.dupWidget);

		$("#add_widget").button ({icons: {primary: "ui-icon-plusthick"}}).click(function () {
            var tpl = $("#select_tpl option:selected").val();
            var data = {
                hm_id: 65535,
                digits: "",
                factor: 1,
                min: 0.00,
                max: 1.00,
                step: 0.01
            };
            dui.addWidget(tpl, data);
            $("#select_active_widget").append("<option value='"+dui.activeWidget+"'>"+dui.activeWidget+" ("+$("#"+dui.views[dui.activeView].widgets[dui.activeWidget].tpl).attr("data-dashui-name")+")</option>").multiselect("refresh");

            setTimeout(function () { dui.inspectWidget(dui.activeWidget) }, 50);

        });
		$("#add_view").button ({icons: {primary: "ui-icon-plusthick"}}).click(function () {
            dui.addView(dui.checkNewView());
        });
		$("#dup_view").button ({icons: {primary: "ui-icon-copy"}}).click(function () {
            dui.dupView(dui.checkNewView());
        });
		$("#del_view").button ({icons: {primary: "ui-icon-trash"}}).click(function () {
            dui.delView(dui.activeView);
        });
		$("#rename_view").button ({icons: {primary: "ui-icon-pencil"}}).click(function () {
            dui.renameView(dui.activeView, $("#new_name").val());
        });

		$("#create_instance").button ({icons: {primary: "ui-icon-plus"}}).click(dui.createInstance);
		$("#remove_instance").button ({icons: {primary: "ui-icon-trash"}}).click(dui.removeInstance);

        // Inspector Change Handler
        $(".dashui-inspect-widget").change(function () {
            var $this = $(this);
            var attr = $this.attr("id").slice(8);
            dui.views[dui.activeView].widgets[dui.activeWidget].data[attr] = $this.val();
            dui.saveRemote();
            dui.reRenderWidget(dui.activeWidget);
        });
		
        $(".dashui-inspect-css").change(function () {
            var $this = $(this);
            var style = $this.attr("id").substring(12);
			if (!dui.views[dui.activeView].widgets[dui.activeWidget].style) {
				dui.views[dui.activeView].widgets[dui.activeWidget].style = {};
			}
            dui.views[dui.activeView].widgets[dui.activeWidget].style[style] = $this.val();
            dui.saveRemote();
            var activeWidget = $("#"+dui.activeWidget);
            $("#"+dui.activeWidget).css(style, $this.val());
            $("#widget_helper").css( {left:   parseInt(activeWidget.css("left")) - 2,
                                      top:    parseInt(activeWidget.css("top"))  - 2,
                                      height: activeWidget.outerHeight() + 2,
                                      width:  activeWidget.outerWidth()  + 2});

            // Update hqWidgets if width or height changed
            if (dui.views[dui.activeView].widgets[dui.activeWidget] && hqWidgets) {
                var hq = hqWidgets.Get (dui.activeWidget);
                if (hq != null) {
                    hq.SetSettings ({width:  activeWidget.width(), 
                                     height: activeWidget.height(),
                                     top:    activeWidget.position().top,
                                     left:   activeWidget.position().left,
                                     zindex: activeWidget.zIndex()});             
                }
            }

        }).keyup (function () {
            $(this).trigger("change");
        });

        dui.initStealHandlers();

        $(".dashui-inspect-view-css").change(function () {
            var $this = $(this);
            var attr = $this.attr("id").slice(17);
            var val = $this.val();
            //console.log("change "+attr+" "+val);
            $("#duiview_"+dui.activeView).css(attr, val);
			if (!dui.views[dui.activeView].settings.style) {
				dui.views[dui.activeView].settings.style = {};
			}
            dui.views[dui.activeView].settings.style[attr] = val;
            dui.saveRemote();
        }).keyup(function () { 
            $(this).trigger('change');
        });
		
        $(".dashui-inspect-view").change(function () {
            var $this = $(this);
            var attr = $this.attr("id").slice(13);
            var val = $this.val();
            //console.log("change "+attr+" "+val);
            dui.views[dui.activeView].settings[attr] = val;
            dui.saveRemote();
        }).keyup(function () { 
            $(this).trigger('change');
        });
		
        $("#inspect_view_theme").change(function () {
            var theme = $("#inspect_view_theme option:selected").val();
            //console.log("change theme "+"css/"+theme+"/jquery-ui.min.css");
            dui.views[dui.activeView].settings.theme = theme;
            $("#jqui_theme").remove();
            $("style[data-href$='jquery-ui.min.css']").remove();
            $("head").prepend('<link rel="stylesheet" type="text/css" href="../lib/css/themes/jquery-ui/'+theme+'/jquery-ui.min.css" id="jqui_theme"/>');
            //attr("data-href", "css/"+theme+"/jquery-ui.min.css");
            dui.saveRemote();
        }).keyup(function () { 
            $(this).trigger('change');
        });
        $("#select_active_widget").change(function () {
            var widgetId = $(this).val();
            console.log("select_active_widget change "+widgetId);
            dui.inspectWidget(widgetId);
            dui.actionNewWidget(widgetId);
        });

        $("#screen_size_x").change(function () {
            var x = $("#screen_size_x").val();
            var y = $("#screen_size_y").val();
            if (x > 0) {
                $("#size_x").css("left", (parseInt(x,10)+1)+"px").show();
                $("#size_y").css("width", (parseInt(x,10)+3)+"px");
                if (y > 0) {
                    $("#size_x").css("height", (parseInt(y,10)+3)+"px");
                }
            } else {
                $("#size_x").hide();
            }
            dui.views[dui.activeView].settings.sizex = x;
            dui.saveRemote();
        }).keyup(function() { $(this).trigger("change"); });

        $("#screen_size_y").change(function () {
            var x = $("#screen_size_x").val();
            var y = $("#screen_size_y").val();
            if (y > 0) {
                $("#size_y").css("top", (parseInt(y,10)+1)+"px").show();
                $("#size_x").css("height", (parseInt(y,10)+3)+"px");
                if (x > 0) {
                    $("#size_y").css("width", (parseInt(x,10)+3)+"px");
                }
            } else {
                $("#size_y").hide();

            }
            dui.views[dui.activeView].settings.sizey = y;
            dui.saveRemote();
        }).keyup(function() { $(this).trigger("change"); });

        // Instances
        dui.instance = storage.get(dui.storageKeyInstance);
        if (!dui.instance) {
            $("#instance").hide();
        } else {

        }

    },
    editInitNext: function () {
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
			$("#select_view").append("<option value='" + k + "'" + sel + ">" + k + "</option>")
			$("#select_view_copy").append("<option value='" + k + "'" + sel + ">" + k + "</option>")
		}
		$("#select_view").multiselect("refresh");
		
		$("#select_view_copy").multiselect({
			minWidth: 200, 
		    checkAllText:dui.translate("Check all"),
		    uncheckAllText:dui.translate("Uncheck all"),
		    noneSelectedText:dui.translate("Select options")
		}).multiselect("refresh");
		
		$("#select_view").change(function () {
			dui.changeView($(this).val());
		});

		$("#select_set").change(dui.refreshWidgetSelect);
		$("#select_set").html("");

		for (i = 0; i < dui.widgetSets.length; i++) {
			if (dui.widgetSets[i].name !== undefined) {
				$("#select_set").append("<option value='" + dui.widgetSets[i].name + "'>" + dui.widgetSets[i].name + "</option>");
			} else {
				$("#select_set").append("<option value='" + dui.widgetSets[i] + "'>" + dui.widgetSets[i] + "</option>");
			}
		}
		$("#select_set").multiselect("refresh");
		dui.refreshWidgetSelect();


		//console.log("TOOLBOX OPEN");
		$("#dui_editor").dialog("open");
		dui.binds.jqueryui._disable();

		// Create background_class property if does not exist
		if (dui.views[dui.activeView] != undefined) {
			if (dui.views[dui.activeView].settings == undefined) {
				dui.views[dui.activeView].settings = new Object();
			}
			if (dui.views[dui.activeView].settings.style == undefined) {
				dui.views[dui.activeView].settings.style = new Object();
			}
			if (dui.views[dui.activeView].settings.style['background_class'] == undefined) {
				dui.views[dui.activeView].settings.style['background_class'] = "";
			}
		}


		// Init background selector
		if (dui.styleSelect) {
			dui.styleSelect.Show({ width: 180,
				name:       "inspect_view_bkg_def",
				filterFile: "backgrounds.css",
				style:      dui.views[dui.activeView].settings.style['background_class'],
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
	
		if (dui.fillWizard) {
			dui.fillWizard ();
		}		
 	},
    refreshWidgetSelect: function () {
        $("#select_tpl").html("");
        var current_set = $("#select_set option:selected").val();
        $(".dashui-tpl[data-dashui-set='" + current_set + "']").each(function () {
            $("#select_tpl").append("<option value='" + $(this).attr("id") + "'>" + $(this).attr("data-dashui-name") + "</option>")
        });
        $("#select_tpl").multiselect("refresh");
    },
	// Find free place for new widget
	findFreePosition: function (view, id, field, widgetWidth, widgetHeight) {
		var editPos = $('.ui-dialog:first').position ();
		field = $.extend ({x: 0, y:0, width: editPos.left}, field);
		widgetWidth  = (widgetWidth  || 60);
		widgetHeight = (widgetHeight || 60);
		if (widgetWidth > field.width) {
			field.width = widgetWidth + 1;
		}
		var step = 20;
		var y = field.y;
		var x = field.x || step;
		
		// Prepare coordinates
		var positions = [];
		for (var w in dui.views[view].widgets) {
			if (w == id || !dui.views[view].widgets[w].tpl) {
				continue;
			}

			if (dui.views[view].widgets[w].tpl.indexOf("Image") == -1 &&
			    dui.views[view].widgets[w].tpl.indexOf("image") == -1) {
				var jW = $('#'+w);
				var s = jW.position();
				s['width']  = jW.width();
				s['height'] = jW.height();
				if (s.width > 300 && s.height > 300) {
					continue;
				}
				positions[positions.length] = s;
			}
		}
		
		while (!dui.checkPosition (positions, x, y, widgetWidth, widgetHeight)) {
			x += step;
			if (x + widgetWidth > field.x + field.width) {
				x = field.x;
				y += step;
			}
		};
		
		// No free place on the screen
		if (y >= $(window).height ()) {
			x = 50;
			y = 50;
		}
		
		return {left: x, top: y};
	},
	// Check overlapping
	checkPosition: function (positions, x, y, widgetWidth, widgetHeight) {
		for (var i = 0; i < positions.length; i++) {
			var s = positions[i];
			
			if (((s.left <= x                && (s.left + s.width)  >= x) ||
				 (s.left <= x + widgetWidth  && (s.left + s.width)  >= x + widgetWidth)) &&
				((s.top  <= y                && (s.top  + s.height) >= y) ||
				 (s.top  <= y + widgetHeight && (s.top  + s.height) >= y + widgetHeight))){
				return false;
			}
			if (((x <= s.left                &&  s.left             <= x + widgetWidth) ||
				 (x <= (s.left + s.width)    && (s.left + s.width)  <= x + widgetWidth)) &&
				((y <= s.top                 && s.top               <= y + widgetHeight) ||
				 (y <= (s.top  + s.height)   && (s.top  + s.height) <= y + widgetHeight))){
				return false;
			}			
		}
		return true;
	},
	actionNewWidget: function (id) {
		var jID = $('#'+id);
		var s = jID.position ();
		s['width']  = jID.width();
		s['height'] = jID.height();
		s['radius'] = parseInt(jID.css('border-radius'));
		var _css1 = {
			left:        s.left - 3.5,
			top:         s.top  - 3.5,
			height:      s.height,
			width:       s.width,
			opacity:     1,
			borderRadius: 15};

		
		var text = "<div id='"+id+"__action1' style='z-index:2000; top:"+(s.top-3.5)+"px; left:"+(s.left-3.5)+"px; width: "+s.width+"px; height: "+s.height+"px; position: absolute'></div>";
		$('body').append(text);
		var _css2 = {
			left:        s.left - 4 - s.width,
			top:         s.top  - 4 - s.height,
			height:      s.height * 3,
			width:       s.width  * 3,
			opacity:     0,
			//borderWidth: 1,
			borderRadius: s['radius']+(s.height > s.width) ? s.width : s.height};

		$('#'+id+'__action1').
			addClass('dashui-show-new').
			css(_css2).
			animate(_css1, 1500, 'swing', function (){
				$(this).remove();
			}).click (function () {
				$(this).stop ().remove ();
			});

		text = text.replace("action1", "action2");
		$('body').append(text);
		$('#'+id+'__action2').
			addClass('dashui-show-new').
			css(_css2).
			animate(_css1, 3000, 'swing', function (){$(this).remove();});
	},
	translate: function (text, lang) {
        return text;
    },
	translateBack: function (text, lang) {
        return text;
    },
    translateAll: function (lang) {
	   	lang  = lang || dui.language || 'en';

	    $(".translate").each(function (idx) {
	        var curlang = $(this).attr ('data-lang');
	        var text    = $(this).html ();
	        if (curlang != lang) {
	            if (curlang) {
	                text = dui.translateBack (text, curlang);
	            }
	
	            var transText = dui.translate (text, lang);
	            if (transText) {
	                $(this).html (transText);
	                $(this).attr ('data-lang', lang);
	            }
	        }
	    });
	    // translate <input type="button>
	    $(".translateV").each(function (idx) {
	        var text    = $( this ).attr ('value');
	        var curlang = $(this).attr ('data-lang');
	        if (curlang != lang) {
	            if (curlang) {
	                text = dui.translateBack (text, curlang);
	            }
	
	            var transText = dui.translate (text, lang);
	            if (transText) {
	                $(this).attr ('value', transText);
	                $(this).attr ('data-lang', lang);
	            }
	        }
	    });
	    $(".translateB").each(function (idx) {
	        //<span class="ui-button-text">Save</span>
	        var text = $( this ).html ();
	        if (text.indexOf ("<span") != -1) {
                var i = text.indexOf ('<span class="ui-button-text">');
                var t = text.substring (i + '<span class="ui-button-text">'.length);
                var q = t.indexOf ("</span>");
                t = t.substring(0,q);
		        var curlang = $(this).attr ('data-lang');
		        if (curlang != lang) {
		            if (curlang) {
		                text = dui.translateBack (t, curlang);
		            }
		
		            var transText = dui.translate (t, lang);
		            if (transText) {
		                $(this).html (text.substring (0,i+'<span class="ui-button-text">'.length) + transText + '</span>');
		                $(this).attr ('data-lang', lang);
		            }
		        }
	        }
	        else {
		        var curlang = $(this).attr ('data-lang');
		        if (curlang != lang) {
		            if (curlang) {
		                text = dui.translateBack (text, curlang);
		            }
		
		            var transText = dui.translate (text, lang);
		            if (transText) {
		                $(this).html (transText);
		                $(this).attr ('data-lang', lang);
		            }
		        }
	        }
	    });
	},
    // collect all filter keys for given view
    updateFilter: function () {
        if (dui.activeView && dui.views) {
            var widgets = dui.views[dui.activeView].widgets;
            dui.views[dui.activeView].filterList = [];
            
            for (var widget in widgets) {
                if (widgets[widget] && widgets[widget].data.filterkey != "" && widgets[widget].data.filterkey !== undefined) {
					var isFound = false;
					for (var z = 0; z < dui.views[dui.activeView].filterList.length; z++) {
						if (dui.views[dui.activeView].filterList[z] == widgets[widget].data.filterkey) {
							isFound = true;
							break;
						}
					}					
					if (!isFound) {
						dui.views[dui.activeView].filterList[dui.views[dui.activeView].filterList.length] = widgets[widget].data.filterkey;
					}
                }
            }
            return dui.views[dui.activeView].filterList;
        } else {
            return [];
        }
    },
    initStealHandlers: function () {
        $(".dashui-steal-css").each(function () {
            $(this).button({
                icons: {
                    primary: "ui-icon-star"
                },
                text: false
            }).click(function (e) {
                if (!$(this).attr("checked")) {
                    $(this).attr("checked", true);
                }
                var isSelected = false;
                $(".dashui-steal-css").each(function () {
                    if ($(this).attr("checked")) {
                        isSelected = true;
                    }
                });

                if (isSelected && !dui.isStealCss) {
                    dui.stealCssMode();
                } else {

                }
                e.stopPropagation();

            });
        })
    },
    stealCssMode: function () {
        dui.isStealCss = true;
        $(".dashui-widget").one("click", function (e) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();

            dui.stealCss(e);
        });
        $("#dui_container").addClass("dashui-steal-cursor");
    },
    stealCss: function (e) {
        if (dui.isStealCss) {
            var target= "#"+dui.activeWidget;
            var src= "#"+e.currentTarget.id;

            $(".dashui-steal-css").each(function () {
                if ($(this).attr("checked")) {
                    var cssAttribute = $(this).attr("data-dashui-steal");
                    var val = $(src).css(cssAttribute)
                    $(target).css(cssAttribute, val);
                    dui.views[dui.activeView].widgets[dui.activeWidget].style[cssAttribute] = val;

                }
            });

            dui.saveRemote();

            setTimeout(function () {
                dui.isStealCss = false;
                dui.inspectWidget(target.slice(1));
                $(".dashui-steal-css").removeAttr("checked").button("refresh");
                $("#dui_container").removeClass("dashui-steal-cursor");
            }, 200);


        }
    }
});

$(document).ready(function () {
    dui.translateAll (ccuIoLang);
});

