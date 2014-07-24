/**
 *  DashUI
 *  https://github.com/hobbyquaker/dashui/
 *
 *  Copyright (c) 2013-2014 hobbyquaker https://github.com/hobbyquaker, bluefox https://github.com/GermanBluefox
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */

// duiEdit - the DashUI Editor

"use strict";

dui = $.extend(true, dui, {
    toolbox:                $("#dui_editor"),
    selectView:             $("#select_view"),
    activeWidget:           "",
    isStealCss:             false,
    gridWidth:              undefined,
    editorPos:              "free",
    undoHistoryMaxLength:   50,
    multiSelectedWidgets:   [],
    clipboard:              null,
    undoHistory:            [],
    selectable:             true,

    renameView: function (newName) {
            dui.views[newName] = $.extend(true, {}, dui.views[dui.activeView]);
            $("#dui_container").hide();
            delete dui.views[dui.activeView];
            dui.activeView = newName;
            dui.renderView(newName);
            dui.changeView(newName);
            dui.saveRemote(function () {
                window.location.reload();
            });
    },
    delView: function (view) {
        if (confirm(dui.translate("Really delete view %s?", view))) {
            delete dui.views[view];
            dui.saveRemote(function () {
                window.location.href = "edit.html" + window.location.search;
            });
           }
    },
    dupView: function (val) {
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
    },
    exportView: function (isAll) {
        var exportView = $.extend(true, {}, isAll ? dui.views : dui.views[dui.activeView]);
        // Allen Widgets eine neue ID verpassen...
        var num = 1;
        var wid;
        if (!isAll) {
            for (var widget in exportView.widgets) {
                wid = "e" + (("0000" + num).slice(-5));
                num += 1;
                exportView.widgets[wid] = exportView.widgets[widget];
                delete exportView.widgets[widget];
            }
        }
        $("#textarea_export_view").html(JSON.stringify(exportView, null, "  "));
        $("#dialog_export_view").dialog({
            autoOpen: true,
            width: 800,
            height: 600,
            modal: true,
            open: function (/*event, ui*/) {
                $('[aria-describedby="dialog_export_view"]').css('z-index',1002);
                $(".ui-widget-overlay").css('z-index', 1001);
            }
        });
    },
    importView: function (isAll) {
        var name = dui.checkNewView($("#name_import_view").val());
        var importObject;
        if (name === false) return;
        try {
            var text = $("#textarea_import_view").val();
            importObject = JSON.parse(text);
        } catch (e) {
            alert(dui.translate("invalid JSON") + "\n\n"+e);
            return;
        }
        if (isAll) {
            dui.views = importObject;
            dui.saveRemote(function () {
                window.location.reload();
            });
        } else {
            dui.views[name] = importObject;

            // Allen Widgets eine neue ID verpassen...
            for (var widget in dui.views[name].widgets) {
                dui.views[name].widgets[dui.nextWidget()] = dui.views[name].widgets[widget];
                delete dui.views[name].widgets[widget];
            }
            dui.saveRemote(function () {
                dui.renderView(name);
                dui.changeView(name);
                window.location.reload();
            });
        }
    },
    checkNewView: function (name) {
        name = name || $("#new_view_name").val().trim();
        if (name == "") {
            alert(dui.translate("Please enter the name for the new view!"));
            return false;
        } else if (dui.views[name]) {
            alert(dui.translate("The view with the same name yet exists!"));
            return false;
        } else {
            return name;
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
		if (id.indexOf('_') == -1) {
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

        if (!id) {
            return;
        }

		if (isAll && id.indexOf('_') != -1) {
			var views = dui.getViewsOfWidget(id);
			var wids = id.split('_', 2);
			for (var i = 0; i < views.length; i++) {
				dui.delWidgetHelper(wids[0] + '_' + views[i], false);
			}
			dui.inspectWidget("none");
			return;
		}

        var $select_active_widget = $("#select_active_widget");
        $select_active_widget.find('option[value="' + id + '"]').remove();
        $select_active_widget.multiselect("refresh");

		var view = dui.getViewOfWidget(id);
		
		var widget_div = document.getElementById(id);
		if (widget_div && widget_div.dashuiCustomEdit && widget_div.dashuiCustomEdit['delete']) {
			widget_div.dashuiCustomEdit['delete'](id);
		}

        if (widget_div && widget_div._customHandlers && widget_div._customHandlers.onDelete) {
            widget_div._customHandlers.onDelete(widget_div, id);
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
	delWidget: function (widget, noSave) {
        if (typeof widget != "string") {
            widget = null;
        }
        if (!widget) {
            dui.clearWidgetHelper();
        }
		dui.delWidgetHelper(widget || dui.activeWidget, true);
		if (!noSave) {
            dui.save();
        }
        if (!widget) {
            dui.inspectWidget("none");
        }
    },
    bindWidgetClick: function (id) {

        $("#" + id).click(function (e) {
            if (dui.dragging) return;

            var widgetId = $(this).attr('id');
            var widgetData = dui.widgets[widgetId]["data"];
            //console.log("click id="+widgetId+" active="+dui.activeWidget);
            //console.log(dui.multiSelectedWidgets);
            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                if (dui.activeWidget && dui.activeWidget != "none" && dui.activeWidget != widgetId) {
                    if (dui.multiSelectedWidgets.indexOf(widgetId) != -1) {
                        //console.log("splice "+id)
                        dui.multiSelectedWidgets.splice(dui.multiSelectedWidgets.indexOf(widgetId), 1);
                        var $widget = $("#" + widgetId);
                        $widget.removeClass("ui-selected");

                        //console.log("-> "+dui.multiSelectedWidgets);
                        dui.allWidgetsHelper();
                        $("#widget_multi_helper_"+widgetId).remove();
                        if ($widget.hasClass("ui-draggable")) {
                            try {
                                $widget.draggable("destroy");
                            } catch (e) {
                                servConn.logError('inspectWidget - Cannot destroy draggable ' + widgetId + ' ' + e);
                            }
                        }
                    } else {
                        dui.inspectWidgetMulti(widgetId);
                    }
                } else if (dui.activeWidget == widgetId && dui.multiSelectedWidgets.length) {
                    //console.log("click inspected Widget",widgetId, dui.multiSelectedWidgets);

                    var newActive = dui.multiSelectedWidgets.pop();
                    var multiSelectedWidgets = dui.multiSelectedWidgets;
                    $("#widget_multi_helper_"+newActive).remove();
                    $("#" + newActive).removeClass("ui-selected");
                    dui.inspectWidget(newActive);
                    for (var i = 0; i < multiSelectedWidgets.length; i++) {
                        dui.inspectWidgetMulti(multiSelectedWidgets[i]);
                    }
                    dui.allWidgetsHelper();

                }
            } else {
                if (dui.activeWidget != widgetId) {
                    dui.inspectWidget(widgetId);
                }
            }

            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    },
    addWidget: function (tpl, data, style, wid, view, hidden, noSave) {
        //console.log("addWidget "+wid);
		var isSelectWidget = (wid === undefined);
		var isViewExist    = (document.getElementById("duiview_"+view) != null);
        var renderVisible  = data.renderVisible;
        if (renderVisible) {
            delete data.renderVisible;
        }

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
				"wid":      widgetId,
				"title":    undefined,
				"subtitle": undefined,
				"html":     undefined,
				"hm_id":    65535,
				"hm_wid":   undefined,
				"factor":   1,
				"digits":   "",
				"min":      0,
				"max":      1,
				"step":     0.01,
				off_text:   undefined,
				on_text:    undefined,
				buttontext: undefined
			}, data))
		};

        if (renderVisible) {
            dui.widgets[widgetId].renderVisible = true;
        }

        if (isViewExist) {
			$("#duiview_"+view).append(can.view(tpl, {hm: localData.uiState["_" + dui.widgets[widgetId].data.hm_id], "data": dui.widgets[widgetId]["data"], "view": view}));
		}

        if (!dui.views[view].widgets) {
            dui.views[view].widgets = {};
        }

        if (!dui.views[view].widgets[widgetId]) {
            dui.views[view].widgets[widgetId] = {};
        }
		
        var $jWidget = $('#'+widgetId);
		if (!style) {
			style = dui.findFreePosition(view, widgetId, null, $jWidget.width(), $jWidget.height());
		}
		
		if(dui.views[view].widgets[widgetId].data !== undefined) {
			data = $.extend(data, dui.views[view].widgets[widgetId].data, true);
		}

        dui.views[view].widgets[widgetId] = {
            tpl:        tpl,
            data:       data,
            style:      style,
            widgetSet:  $("#" + tpl).attr("data-dashui-set")
        };
        if (renderVisible) {
            dui.views[view].widgets[widgetId].renderVisible = true;
        }

        if (style) {
            $jWidget.css(style);
        }

	    if (isSelectWidget) {
            if (dui.binds.jqueryui) {
                dui.binds.jqueryui._disable();
            }
	    }

		if (isSelectWidget) {
			dui.activeWidget = widgetId;
			dui.actionNewWidget(widgetId);
		}

        if (!noSave) {
            dui.save();
        }

        dui.bindWidgetClick(widgetId);

        return widgetId;
    },
    dupWidget: function (widget, noSave) {
        var activeView;
        var targetView;
        var tpl;
        var data;
        var style;

        if (widget && widget.widget) {
            var objWidget = widget.widget;
            targetView = dui.activeView;
            activeView = widget.view;
            tpl = objWidget.tpl;
            data = objWidget.data;
            style = objWidget.style;
            widget.view = dui.activeView;
        } else {
            activeView = dui.activeView;
            targetView = $("#select_view_copy option:selected").val();
        //console.log(activeView + "." + dui.activeWidget + " -> " + targetView);
            tpl = dui.views[dui.activeView].widgets[dui.activeWidget].tpl;
            data = $.extend({}, dui.views[dui.activeView].widgets[dui.activeWidget].data);
            style = $.extend({}, dui.views[dui.activeView].widgets[dui.activeWidget].style);
        }

        if (activeView == targetView) {
            style.top = parseInt(style.top, 10);
            style.left = parseInt(style.left, 10);

            style.top  += 10;
            style.left += 10;
            // Store new settings
            if (widget && widget.widget) {
                // If after copy to clipboard, the copied widget was changed, so the new modified version will be pasted and not the original one.
                // So use JSON.
                widget.widget = $.extend(true, {}, objWidget);
            }

            // addWidget Params: tpl, data, style, wid, view, hidden, noSave
            dui.activeWidget = dui.addWidget(tpl, data, style, undefined, undefined, undefined, noSave);

            $("#select_active_widget").append("<option value='"+dui.activeWidget+"'>"+dui.activeWidget+" ("+$("#"+dui.views[dui.activeView].widgets[dui.activeWidget].tpl).attr("data-dashui-name")+")</option>")
            .multiselect("refresh");

            if (!widget || !widget.widget) {
                setTimeout(function () {
                    dui.inspectWidget(dui.activeWidget);
                    if (!noSave) {
                        dui.save();
                    }
                }, 50);
            }
        } else {
            if ($("#dui_container").find("#duiview_"+targetView).html() == undefined) {
                dui.renderView(targetView, true, true);
            }
            dui.addWidget(tpl, data, style, dui.nextWidget(), targetView, true);
            if (!noSave) {
                dui.save();
            }
            if (!widget || !widget.widget) {
                dui.showHint(dui.translate("Widget copied to view %s", targetView) + ".", 30000);
            }
        }
    },
	renameWidget: function (oldId, newId) {
		// find view of this widget
		var view = dui.getViewOfWidget(oldId);
		
		// create new widget with the same properties
		if (view) {
			dui.addWidget(dui.views[view].widgets[oldId].tpl, dui.views[view].widgets[oldId].data, dui.views[view].widgets[oldId].style, newId, view);
            $("#select_active_widget").append("<option value='"+newId+"'>"+newId+" ("+$("#"+dui.views[view].widgets[newId].tpl).attr("data-dashui-name")+")</option>")
            .multiselect("refresh");
			dui.delWidgetHelper(oldId, false);
		}
		dui.inspectWidget(newId);
		dui.save();
	},
    reRenderWidgetEdit: function (wid) {
        this.reRenderWidget(wid);
        if (wid == this.activeWidget) {
            var $wid = $('#'+wid);
            // User interaction
            if (!dui.widgets[wid].data._no_move) {
                dui.draggable($wid);
            }
            if (!dui.widgets[wid].data._no_resize) {
                dui.resizable($wid);
            }            
        }
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
				isFound = false;
				if (v_ == view) {
					continue;
				}
				
				for (var j = 0; j < views.length; j++) {
					if (views[j] == v_) {
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
			} else if (views.length > 1 && (id.indexOf('_') == -1)) {
				dui.renameWidget(id, id + '_' + view);
			}
		}
	},
    editObjectID: function (widget, wid_attr, widget_filter) {
        // Edit for Homematic ID
        $("#widget_attrs").append('<tr id="option_' + wid_attr + '" class="dashui-add-option"><td>' + this.translate(wid_attr) + ':</td><td><input type="text" id="inspect_' + wid_attr + '" size="5"><input type="button" id="inspect_' + wid_attr + '_btn" value="..."  style="width:30px"><div id="inspect_' + wid_attr + '_desc"></div></td></tr>');
        document.getElementById("inspect_"+wid_attr+"_btn").jControl = wid_attr;
        $("#inspect_"+wid_attr+"_desc").html(dui.getObjDesc(widget.data[wid_attr]));
        // Select Homematic ID Dialog
        $("#inspect_"+wid_attr+"_btn").click( function () {
            function onSuccess(obj, value) {
                $("#inspect_" + obj).val(value);
                $("#inspect_" + obj).trigger('change');
                if (document.getElementById('inspect_hm_wid')) {
                    if (localData.metaObjects[value]["Type"] !== undefined && localData.metaObjects[value]["Parent"] !== undefined &&
                        (localData.metaObjects[value]["Type"] == "STATE" ||
                            localData.metaObjects[value]["Type"] == "LEVEL")) {

                        var parent = localData.metaObjects[value]["Parent"];
                        if (localData.metaObjects[parent]["DPs"] !== undefined &&
                            localData.metaObjects[parent]["DPs"]["WORKING"] !== undefined) {
                            $("#inspect_hm_wid").val(localData.metaObjects[parent]["DPs"]["WORKING"]);
                            $("#inspect_hm_wid").trigger('change');
                        }
                    }
                }
                // Try to find Function of the device and fill the Filter field
                if (document.getElementById('inspect_filterkey')) {
                    if ($('#inspect_filterkey').val() == "") {
                        var hm_id = value;
                        var func = null;
                        if (localData.metaIndex["ENUM_FUNCTIONS"]) {
                            while (hm_id && localData.metaObjects[hm_id]) {
                                for (var t = 0; t < localData.metaIndex["ENUM_FUNCTIONS"].length; t++) {
                                    var list = localData.metaObjects[localData.metaIndex["ENUM_FUNCTIONS"][t]];
                                    for (var z = 0; z < list['Channels'].length; z++) {
                                        if (list['Channels'][z] == hm_id) {
                                            func = list.Name;
                                            break;
                                        }
                                    }
                                    if (func) break;
                                }
                                if (func) break;

                                hm_id = localData.metaObjects[hm_id]['Parent'];
                            }
                        }
                        if (func)
                            $('#inspect_filterkey').val(func).trigger('change');
                    }
                }
            }

            if (dui.useNewSelectDialog) {
                idSelect.Show(localData, {
                    selectedID: $("#inspect_" + this.jControl).val(),
                    userArg: this.jControl,
                    filter: {channel: widget_filter},
                    onSuccess: onSuccess
                });
            } else {
                hmSelect.value = $("#inspect_" + this.jControl).val();
                hmSelect.show(localData, this.jControl, onSuccess, widget_filter);
            }
        });
    },
    editSelect: function (widget, wid_attr, values) {
        // Select
        var text = '<tr id="option_' + wid_attr + '" class="dashui-add-option"><td class="dashui-edit-td-caption">' + this.translate(wid_attr) + ':</td><td><select id="inspect_' + wid_attr + '">';
        for (var t = 0; t < values.length; t++) {
            text += "<option value='" + values[t] + "' " + ((values[t] == widget.data[wid_attr]) ? "selected" : "") + ">"+this.translate(values[t]) + "</option>";
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
        $("#widget_attrs").append('<tr id="option_' + wid_attr+'" class="dashui-add-option"><td class="dashui-edit-td-caption">' + this.translate(wid_attr) + ':</td><td><input id="inspect_'+wid_attr+'" type="checkbox"' + (widget.data[wid_attr] ? "checked": "") + '></td></tr>');
    },
    editColor: function (widget, wid_attr) {
        // Color selector
        $("#widget_attrs").append('<tr id="option_' + wid_attr + '" class="dashui-add-option"><td>' + this.translate(wid_attr) + ':</td><td><input type="text" id="inspect_'+wid_attr+'" size="34" />' + ((typeof colorSelect != 'undefined' && $().farbtastic) ? '<input id="inspect_' + wid_attr + 'Btn"  style="width:8%" type="button" value="...">' : '') + '</td></tr>');
        if (typeof colorSelect != 'undefined' && $().farbtastic) {
            var btn = document.getElementById("inspect_" + wid_attr + "Btn");
            if (btn) {
                btn.ctrlAttr = wid_attr;
                $(btn).bind("click", {msg: this}, function (/*event*/) {
                    var _settings = {
                        current:     $('#inspect_' + this.ctrlAttr).val(),
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
        $("#widget_attrs").append('<tr id="option_'+wid_attr+'" class="dashui-add-option"><td>'+this.translate(wid_attr)+':</td><td><input type="text" id="inspect_'+wid_attr+'" size="34"/></td></tr>');

        // autocomplete for filter key
        var elem = document.getElementById('inspect_'+wid_attr);
        if (elem) {
            elem._save = function () {
                if (this.timer) {
                    clearTimeout(this.timer);
                }

                this.timer = _setTimeout(function (elem_) {
                    // If really changed
                    var $this = $(elem_);
                    var attr = $this.attr("id").slice(8);
                    dui.widgets[dui.activeWidget].data.attr(attr, $this.val());
                    dui.views[dui.activeView].widgets[dui.activeWidget].data[attr] = $this.val();
                    var bt = $('#inspect_buttontext');
                    if (bt && bt.val() == "") {
                        bt.val($this.val().charAt(0).toUpperCase() + $this.val().slice(1).toLowerCase()).trigger('change');
                    }
                    dui.reRenderWidgetEdit(dui.activeWidget);
                    dui.save();
                }, 200, this);
            };

            $(elem).autocomplete({
                minLength: 0,
                source: function (request, response) {
                    var views = [];
                    for (var v in dui.views) {
                        views[views.length] = v;
                    }

                    var data = $.grep(views, function (value) {
                        return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
                    });

                    response(data);
                },
                select: function (/*event, ui*/) {
                    this._save();
                },
                change: function (/*event, ui*/) {
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
        $("#widget_attrs").append('<tr nowrap id="option_' + wid_attr + '" class="dashui-add-option"><td class="dashui-edit-td-wid_attr">' + this.translate(wid_attr.split("_")[0] + " effect") + ':</td><td><input type="text" id="inspect_' + wid_attr + '" size="34"/></td></tr>');

        // autocomplete for filter key
        var elem = document.getElementById('inspect_' + wid_attr);
        if (elem) {
            elem._save = function () {
                if(this.timer) {
                    clearTimeout(this.timer);
                }

                this.timer = _setTimeout(function (elem_) {
                    // If really changed
                    var $this = $(elem_);
                    var attr = $this.attr("id").slice(8);
                    dui.widgets[dui.activeWidget].data.attr(attr, $this.val());
                    dui.views[dui.activeView].widgets[dui.activeWidget].data[attr] = $this.val();
                    dui.save();
                }, 200, this);
            };

            $(elem).autocomplete({
                minLength: 0,
                source: function (request, response) {
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

                    var data = $.grep(effects, function (value) {
                        return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
                    });

                    response(data);
                },
                select: function (event, ui) {
                    this._save();

                    $(elem).trigger('change', ui.item.value)
                },
                change: function (event, ui) {
                    this._save();
                    $(elem).trigger('change', ui.item.value);
                }
            }).focus(function () {
                $(this).autocomplete("search", "");
            }).keyup(function () {
                this._save();
            }).val(widget.data[wid_attr]);
        }
    },
    editEffects_opt: function (widget, wid_attr) {
        // Effect selector
        $("#widget_attrs").append('<tr nowrap id="option_' + wid_attr + '" class="dashui-add-option"><td class="dashui-edit-td-wid_attr">' + this.translate(wid_attr.split("_")[0] + " opt.") + ':</td><td><input type="text" id="inspect_' + wid_attr + '" size="34"/></td></tr>');

        // autocomplete for filter key
        var elem = document.getElementById('inspect_' + wid_attr);
        if (elem) {
            elem._save = function () {
                if (this.timer)
                    clearTimeout(this.timer);

                this.timer = _setTimeout(function (elem_) {
                    // If really changed
                    var $this = $(elem_);
                    var attr = $this.attr("id").slice(8);
                    dui.widgets[dui.activeWidget].data.attr(attr, $this.val());
                    dui.views[dui.activeView].widgets[dui.activeWidget].data[attr] = $this.val();
                    dui.save();
                }, 200, this);
            };

            $(elem).autocomplete({
                minLength: 0,
                appendTo: $(elem).parent(),
                source: [''],
//                create: function (event, ui) {
//                  $($(elem).parent()).find("ul").css({position: "relative"})
//                },
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
            }).val(dui.translate(widget.data[wid_attr]));

            var $sel = $('#inspect_' + wid_attr.split('_eff_opt')[0] + ('_effect'));
            choice_opt($sel.val());

            $sel.change(function (event, data) {
                choice_opt(data)
            });
        }

        function choice_opt(_data) {
            if (_data == "slide") {
                $('#option_' + wid_attr).show();
                $(elem).autocomplete('option', 'source', [{label:'links',value:'left'},{label:'rechts',value:'right'},{label:'hoch',value:'up'},{label:'runter',value:'down'}]);
            } else {
                $(elem).autocomplete('option', 'source', ['']);
                widget.data[wid_attr] = "";
                $('#option_' + wid_attr).hide();

            }
        }
    },
    hr: function (widget, wid_attr) {
        // Effect selector
        $("#widget_attrs").append('<tr class="dashui-add-option"><td colspan="2" class="dashui-edit-td-wid_attr"><hr></td></tr>');
    },
    br: function (widget, wid_attr) {
        // Effect selector
        $("#widget_attrs").append('<tr class="dashui-add-option"><td colspan="2" class="dashui-edit-td-wid_attr">&nbsp</td></tr>');
    },

    editImage: function (widget, wid_attr) {
        // Image src
        $("#widget_attrs").append('<tr id="option_' + wid_attr + '" class="dashui-add-option"><td>' + this.translate(wid_attr) + ':</td><td><input type="text" id="inspect_' + wid_attr + '" size="34"/><input type="button" id="inspect_' + wid_attr + '_btn" value="..."></td></tr>');
        document.getElementById("inspect_" + wid_attr + "_btn").jControl = wid_attr;
        // Filemanager Dialog
        $("#inspect_"+wid_attr+"_btn").click(function () {
// todo delete wenn der neue Dialog läuft
//            var settings = {
//                current: $("#inspect_"+this.jControl).val(),
//                onselectArg: this.jControl,
//                onselect:    function (img, obj) {
//                    $("#inspect_"+obj).val(img).trigger("change");
//                }};
//            dui.imageSelect.Show(settings);

                $.fm({
                    root: "www/",
                    lang: dui.language ,
                    path: "www/dashui/img/",
                    file_filter: ["gif","png", "bmp", "jpg", "jpeg", "tif", "svg"],
                    folder_filter: false,
                    mode: "open",
                    view:"prev"

                },function(_data){
                    var src = _data.path.split("www")[1] + _data.file;
                    $("#inspect_"+wid_attr).val(src).trigger("change");
                });
        });
    },
    editUrl: function (widget, wid_attr) {
        // Image src
        $("#widget_attrs").append('<tr id="option_' + wid_attr + '" class="dashui-add-option"><td>' + this.translate(wid_attr) + ':</td><td><input type="text" id="inspect_' + wid_attr + '" size="34"/><input type="button" id="inspect_' + wid_attr + '_btn" value="..."></td></tr>');
        document.getElementById("inspect_" + wid_attr + "_btn").jControl = wid_attr;
        // Filemanager Dialog
        $("#inspect_"+wid_attr+"_btn").click(function () {

            $.fm({
                root: "www/",
                lang: dui.language ,
                path: "www/dashui/img/",
                file_filter: ["mp3", "wav", "ogg"],
                folder_filter: false,
                mode: "open",
                view:"table"

            },function(_data){
                var url = _data.path.split("www")[1] + _data.file;
                $("#inspect_"+wid_attr).val(url).trigger("change");
            });
        });
    },
    editSlider: function (widget, wid_attr, min, max, step) {
        min = (min === undefined || min === null || min == "") ? 0 : parseFloat(min);
        max = (max === undefined || max === null || max == "") ? 0 : parseFloat(max);
        step = (!step) ? (max - min) / 100 : parseFloat(step);
        // Image src
        $("#widget_attrs").append('<tr id="option_'+wid_attr+'" class="dashui-add-option"><td>'+this.translate(wid_attr)+':</td><td><table style="width:100%" class="dashui-no-spaces"><tr class="dashui-no-spaces"><td  class="dashui-no-spaces" style="width:50px"><input type="text" id="inspect_'+wid_attr+'" size="5"/></td><td  class="dashui-no-spaces" style="width:20px">'+min+'</td><td><div id="inspect_'+wid_attr+'_slider"></div></td><td  class="dashui-no-spaces" style="width:20px;text-align:right">'+max+'</td></tr></table></td></tr>');

        var slider = $("#inspect_"+wid_attr+"_slider");
        slider.slider({
            value: widget.data[wid_attr],
            min:   min,
            max:   max,
            step:  step,
            slide: function (event, ui) {
                /*if (this.timer)
                    clearTimeout (this.timer);

                this.timer = _setTimeout (function (elem_, value) {
                    // If really changed
                    var $this = $(elem_);
                    var attr = $this.attr("id").slice(8);
                    var text = $("#inspect_"+wid_attr);
                    if (text.val() != value) {
                        text.val(value).trigger("change");
                    }
                }, 200, this, ui.value);*/
                var $this = $(this);
                var text = $("#inspect_"+wid_attr);
                if (text.val() != ui.value) {
                    text.val(ui.value).trigger("change");
                }
            }
        });
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
            dui.save();
            dui.reRenderWidgetEdit(dui.activeWidget);
        }).keyup(function () {
            $(this).trigger('change');
        });
    },
    inspectWidgetMulti: function (id) {
        var $this = $("#"+id);
        var pos = $this.position();
        // May be bug?
        if (pos.left == 0 && pos.top == 0) {
            pos.left = $this[0].style.left;
            pos.top  = $this[0].style.top;
            if (typeof pos.left == 'string') {
                pos.left = parseInt(pos.left.replace('px', ''), 10);
            }
            if (typeof pos.top == 'string') {
                pos.top = parseInt(pos.top.replace('px', ''), 10);
            }
        }
        if (dui.multiSelectedWidgets.indexOf(id) == -1 && id != dui.activeWidget) {
            dui.multiSelectedWidgets.push(id);
        }

        $("#dui_container").append('<div id="widget_multi_helper_'+id+'" class="widget_multi_helper"><div class="widget_multi_inner_helper"></div></div>');

        $("#widget_multi_helper_"+id).css({
            left   : pos.left - 2,
            top    : pos.top - 2,
            height : $this.outerHeight() + 2,
            width  : $this.outerWidth() + 2}
        ).show();
        dui.allWidgetsHelper();
        dui.draggable($this);

    },
    inspectWidget: function (id, onlyUpdate) {
        if (dui.isStealCss) {
            return false;
        }

        if (!onlyUpdate) {
            $(".widget_multi_helper").remove();
            dui.multiSelectedWidgets = [];
            $("#allwidgets_helper").hide();

            $("#select_active_widget").find("option[value='"+id+"']").prop("selected", true);
            $("#select_active_widget").multiselect("refresh");

            // Remove selection from all widgets and remove resizable and draggable properties
            $(".dashui-widget").each(function () {
                var $this = $(this);
                $this.removeClass("dashui-widget-edit");

                if ($this.hasClass("ui-draggable")) {
                    try {
                        $this.draggable("destroy");
                    } catch (e) {
                        servConn.logError('inspectWidget - Cannot destroy draggable ' + $this.attr('id') + ' ' + e);
                    }
                }

                if ($this.hasClass("ui-resizable")) {
                    try {
                        $this.resizable("destroy");
                    } catch (e) {
                        servConn.logError('inspectWidget - Cannot destroy resizable ' + $this.attr('id') + ' ' + e);
                    }
                }
            });
        }

        // Clear Inspector
        $("#widget_attrs").html("")
            .html('<tr><th class="widget_attrs_header"></th><th></th></tr>');
        $(".dashui-inspect-css").each(function () {
            $(this).val("");
        });

        if (!id || id === "none") {
            dui.clearWidgetHelper();
            $(".dashui-widget-tools").hide();
            $("#view_inspector").show();
            dui.activeWidget = null;
            return false;
        }

        dui.activeWidget = id;
        var widget = dui.views[dui.activeView].widgets[id];

        if (!widget) {
            console.log("inspectWidget "+id+" undefined");
            return false;
        }

        // Inspector aufbauen
        $(".dashui-widget-tools").show();
        $("#view_inspector").hide();

        $(".dashui-inspect-widget").each(function () {
            var $this_ = $(this);
            var attr = $this_.attr("id").slice(8);
            if (dui.views[dui.activeView].widgets[dui.activeWidget] && dui.views[dui.activeView].widgets[dui.activeWidget].data) {
                $this_.val(dui.views[dui.activeView].widgets[dui.activeWidget].data[attr]);
            }
        });
        if (!widget.tpl) {
            return false;
        }
        var $widgetTpl    = $("#" + widget.tpl);
        var widget_attrs  = $widgetTpl.attr("data-dashui-attrs").split(";");
        var widget_filter = $widgetTpl.attr("data-dashui-filter");

        $('#inspect_comment_tr').show();
        $('#inspect_class_tr').show();
        var widget_div = document.getElementById(dui.activeWidget);
        var editParent = $("#widget_attrs").css({"width": "100%"});
       
        // Edit all attributes
        for (var attr in widget_attrs) {
            if (widget_attrs[attr] != "") {
                // Format: attr_name(start-end)[default_value]/type
                // attr_name can be extended with numbers (1-2) means it will be attr_name1 and attr_name2 created 
                // Type format: id - Object ID Dialog
                //              checkbox
                //              image
                //              color
                //              views
                //              effect
                //              eff_opt
                //              fontName
                //              slider,min,max,step - Default step is ((max - min) / 100)
                //              select_value1,select_value2,...
                //              hr
                //              br

				var isValueSet = false;
				var wid_attrs = widget_attrs[attr].split('/');
				var wid_attr  = wid_attrs[0];
                // Try to extract default value
                var uu = wid_attr.indexOf("[");
                var defaultValue = null;
                if (uu != -1) {
                    var defaultValue = wid_attr.substring(uu + 1);
                    defaultValue = defaultValue.substring(0, defaultValue.length - 1);
                    defaultValue = defaultValue.replace(/§/g, ';');
                    wid_attr = wid_attr.substring(0, uu);
                }
                var type = (wid_attrs.length > 1) ? wid_attrs[1] : null;
                if (type && type.indexOf(",") != -1) {
                    if (type.substring (0, "slider".length) == "slider") {
                        type = "slider";
                    } else {
                        type = "select";
                    }
                }
                // Try to extract repeat value
                uu = wid_attr.indexOf("(");
                var instancesStart = null;
                var instancesStop  = null;
                if (uu != -1) {
                    var instances = wid_attr.substring(uu + 1);
                    instances = instances.substring(0, instances.length - 1);
                    wid_attr = wid_attr.substring(0, uu);
                    // Now instances has 1-8
                    instances = instances.split('-');
                    if (instances.length > 1) {
                        instancesStart = parseInt(instances[0], 10);
                        instancesStop  = parseInt(instances[1], 10);
                        if (instancesStart > instancesStop) {
                            var tmp = instancesStop;
                            instancesStop = instancesStart;
                            instancesStart = tmp;
                        }
                        instancesStop++;
                    }
                }
                
                do {
                    var wid_attr_ = wid_attr + ((instancesStart !== null) ? instancesStart : "");
                    var isCustomEdit = false;

                    if (defaultValue !== null && (widget.data[wid_attr_] == null || widget.data[wid_attr_] === undefined)) {
                        widget.data[wid_attr_] = defaultValue;
                        dui.reRenderWidgetEdit(dui.activeWidget);
                    }

                    // If completely custom edit
                    if (widget_div && widget_div.dashuiCustomEdit && widget_div.dashuiCustomEdit[wid_attr_]) {
                        widget_div.dashuiCustomEdit[wid_attr_](dui.activeWidget, editParent);
                    } else if (widget_div &&
                        // If only one attribute is custom edited, eg hqoptions
                        widget_div._customHandlers &&
                        widget_div._customHandlers.onOptionEdited &&
                        widget_div._customHandlers.isOptionEdited(wid_attr_)){
                        widget_div._customHandlers.onOptionEdited({
                            widgetDiv:   widget_div,
                            widgetId:    dui.activeWidget,
                            attr:        wid_attr_,
                            parent:      editParent,
                            imgSelect:   dui.imageSelect,
                            clrSelect:   colorSelect,
                            styleSelect: dui.styleSelect
                        });
                    }
                    else if (wid_attr_ === "hm_id" || type == "id") {
                        dui.editObjectID (widget, wid_attr_, widget_filter);
                    } else if (wid_attr_ === "hm_wid") {
                        dui.editObjectID (widget, wid_attr_, 'WORKING');
                    } else if (wid_attr_.indexOf ("src") == wid_attr_.length - 3 || type == "image") {
                        dui.editImage(widget, wid_attr_);
                    }else if (wid_attr_  == "url") {
                        dui.editUrl (widget, wid_attr_);
                    } else if (wid_attr_ === "weoid") {
                        // Weather ID
                        $("#widget_attrs").append('<tr class="dashui-add-option"><td id="option_' + wid_attr_ + '" ></td></tr>');
                        $('#inspect_comment_tr').hide();
                        $('#inspect_class_tr').hide();
                        $('#option_'+wid_attr_).jweatherCity({
                            lang: dui.language, currentValue: widget.data[wid_attr_],
                            onselect: function (wid, text/*, obj*/) {
                                dui.widgets[dui.activeWidget].data.attr('weoid', text);
                                dui.views[dui.activeView].widgets[dui.activeWidget].data['weoid'] = text;
                                dui.save();
                                dui.reRenderWidgetEdit(dui.activeWidget);
                            }
                        });
                    } else if (wid_attr_ === "color" || type == "color") {
                        dui.editColor(widget, wid_attr_);
                    } else if (type === "checkbox") {
                        isValueSet = true;
                        dui.editCheckbox(widget, wid_attr_);
                    } else if (type === "fontName") {
                        isValueSet = true;
                        dui.editFontName(widget, wid_attr_);
                    } else if (type === "slider") {
                        isValueSet = true;
                        var values = wid_attrs[1].split(',');
                        dui.editSlider (widget, wid_attr_, values[1], values[2], values[3]);
                        isCustomEdit = true;
                    } else if (type === "select") {
                        isValueSet = true;
                        var values = wid_attrs[1].split(',');
                        dui.editSelect (widget, wid_attr_, values);
                    } else if (wid_attr_.indexOf("nav_view") != -1|| type == "views") {
                        dui.editViewName (widget, wid_attr_);
                        isCustomEdit = true;
                    } else if (type == "hidden") {
                        isCustomEdit = true;
                    } else if (wid_attr_.indexOf("_effect") != -1 || type == "effect") {
                        dui.editEffects (widget, wid_attr_);
                        isCustomEdit = true;
                    } else if (wid_attr_.indexOf("_eff_opt") != -1 || type == "effect_opt") {
                        dui.editEffects_opt(widget, wid_attr_);
                        isCustomEdit = true;
                    } else if (wid_attr_.indexOf( '_hr') != -1) {
                        dui.hr(widget, wid_attr_);
                        isCustomEdit = true;
                    } else if (wid_attr_.indexOf( '_br') != -1) {
                        dui.br(widget, wid_attr_);
                        isCustomEdit = true;
                    } else if (wid_attr_.slice(0,4) !== "html") {
                        if (type !== null) {
                            // If description is JSON object
						    if (type.indexOf('{') != -1) {
                                try {
								    type = jQuery.parseJSON(type);
                                }
                                catch (e) {
                                    type = null;
                                    $("#widget_attrs").append('<tr id="option_'+wid_attr_+'" class="dashui-add-option"><td class="dashui-edit-td-caption">'+this.translate(wid_attr_)+':</td><td><input type="text" id="inspect_'+wid_attr_+'" size="34"/></td></tr>');
                                }
                            }

                            if (type !== null) {
                                if (typeof type == 'object') {
                                    var title = this.translate(wid_attr_);
                                    var hint  = "";
                                    if (type["name"]) {
                                        if (typeof type["name"] == 'object') {
                                            if (type["name"][this.language]) {
                                                title = type["name"][this.language];
                                            } else
                                            if (type["name"]['en']) {
                                                title = type["name"]['en'];
                                            }
                                        } else {
                                            title = type["name"];
                                        }
                                    }


                                    if (type['type'] == "checkbox") {
                                        isValueSet = true;
                                        // All other attributes
                                        $("#widget_attrs").append('<tr id="option_'+wid_attr_+'" class="dashui-add-option"><td class="dashui-edit-td-caption" title="'+hint+'">'+title+':</td><td><input title="'+hint+'" id="inspect_'+wid_attr_+'" type="checkbox"' +(widget.data[wid_attr_] ? "checked": "")+'></td></tr>');
                                    } else if (type['type'] == "view") {
                                    } else if (type['type'] == "color") {
                                    } else if (type['type'] == "font") {
                                    } else if (type['type'] == "rooms") {
                                    } else if (type['type'] == "favorites") {
                                    } else if (type['type'] == "functions") {
                                    } else if (type['type'] == "rooms") {
                                    } else if (type['type'] == "select") {
                                        // Select
                                        var values = type['values'];
                                        var text = '<tr id="option_' + wid_attr_ + '" class="dashui-add-option"><td class="dashui-edit-td-caption">' + this.translate(wid_attr_) + ':</td><td><select id="inspect_' + wid_attr_ + '">';
                                        for (var t = 0; t < values.length; t++) {
                                            text += "<option value='" + values[t] + "' " + ((values[t] == widget.data[wid_attr_]) ? "selected" : "") + ">" + this.translate(values[t])+"</option>";
                                        }
                                        text += "</select></td></tr>";
                                        $("#widget_attrs").append(text);
                                        isValueSet = true;
                                    }

                                } else {
                                    // Simple type
                                    servConn.logError('Unknown attribute type ' + wid_attr_ +" Type: " + type);
                                }
                            }
                        } else {
                            // html
                            $("#widget_attrs").append('<tr id="option_'+wid_attr_+'" class="dashui-add-option"><td class="dashui-edit-td-caption">'+this.translate(wid_attr_)+':</td><td><input type="text" id="inspect_'+wid_attr_+'" size="34"/></td></tr>');
                        }
                    } else {
                        // Text area
                        $("#widget_attrs").append('<tr id="option_'+wid_attr_+'" class="dashui-add-option"><td class="dashui-edit-td-caption">'+this.translate(wid_attr_)+':</td><td><textarea id="inspect_'+wid_attr_+'" rows="2" cols="34"></textarea></td></tr>');
                    }

                    if (!isCustomEdit) {
                        var inspect = $("#inspect_"+wid_attr_);

                        if (!isValueSet) {
                            inspect.val(widget.data[wid_attr_]);
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
                            dui.save();
                            dui.reRenderWidgetEdit(dui.activeWidget);
                        }).keyup(function () {
                                $(this).trigger('change');
                        });
                    }

                    if (instancesStart !== null) {
                        instancesStart++;
                    }
                } while (instancesStart != instancesStop);
            }
        }
        
        // If widget was rerendered, it can have new div
        var $this = $("#"+id);  
        
        $(".dashui-inspect-css").each(function () {
            var attr = $(this).attr("id").slice(12)
            var css = $this.css(attr);

            // combine shorthand top/right/bottom/left
            if (attr.match(/border-/) || attr.match(/padding/)) {
                css = dui.combineCssShorthand($this, attr);
            }
            $(this).val(css);
        });

        // autocomplete for filter key
        var elem = document.getElementById('inspect_filterkey');
        if (elem) {
            dui.updateFilter();
            elem._save = function () {
                if (this.timer)  {
                    clearTimeout (this.timer);
                }

                this.timer = _setTimeout (function (elem_) {
                     // If really changed
                    var $this = $(elem_);
                    var attr = $this.attr("id").slice(8);
                    dui.views[dui.activeView].widgets[dui.activeWidget].data[attr] = $this.val();
                    dui.save();                  
                }, 200, this);            
            };
            
            $(elem).autocomplete({
                minLength: 0,
                source: function (request, response) {
                    var data = $.grep(dui.views[dui.activeView].filterList, function (value) {
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
            }); 
        }
		
        // Put all view names in the select element
		$('#inspect_views').html("");
		var views = dui.getViewsOfWidget(dui.activeWidget);
		for (var v in dui.views) {
			if (v != dui.activeView) {
				var selected = "";
				for (var i = 0; i < views.length; i++) {
					if (views[i] == v) {
						selected = "selected";
						break;
					}
				}
				$("#inspect_views").append("<option value='" + v + "' " + selected + ">" + v + "</option>");
			}
		}

        $('#inspect_views').multiselect({
            minWidth: 300,
            height: 260,
            noneSelectedText: dui.translate("Single view"),
            selectedText: function (numChecked, numTotal, checkedItems) {
                var text = "";
                for (var i = 0; i < checkedItems.length; i++) {
                    text += ((text == "") ? "" : ",") + checkedItems[i].title;
                }
                return text;
            },
            multiple: true,
            checkAllText:     dui.translate("Check all"),
            uncheckAllText:   dui.translate("Uncheck all")
            //noneSelectedText: dui.translate("Select options")
        }).change (function () {
            dui.syncWidget (dui.activeWidget, $(this).val());
            dui.save ();
        });

        // Select Widget
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
		var pos = $this.position();
        // May be bug?
        if (pos.left == 0 && pos.top == 0) {
            pos.left = $this[0].style.left;
            pos.top  = $this[0].style.top;
            if (typeof pos.left == 'string') {
                pos.left = parseInt(pos.left.replace('px', ''), 10);
            }
            if (typeof pos.top == 'string') {
                pos.top = parseInt(pos.top.replace('px', ''), 10);
            }
        }
		var w = $this.width();
		var h = $this.height();
        $("#widget_helper").css({left: pos.left - 2, top:  pos.top - 2,  height: $this.outerHeight() + 2, width: $this.outerWidth()  + 2}).show();

        // User interaction
        if (!dui.widgets[id].data._no_move) {
            dui.draggable($this);
        }
        if (!dui.widgets[id].data._no_resize) {
            dui.resizable($this);
        }

        // Inspector aufrufen
        $("#inspect_wid").html(id);
        $("#inspect_wid2").html(id);
        var tabs = $("#tabs");
        var tabActive = tabs.tabs("option", "active");

        if (tabActive !== 1 && tabActive !== 2) {
            tabs.tabs("option", "active", 1);
        }
    },

    // Draw a border around all selected widgets
    allWidgetsHelper: function () {
        //console.log("allWidgetsHelper "+dui.multiSelectedWidgets.length);
        var $allwidgets_helper = $("#allwidgets_helper");

        if (dui.multiSelectedWidgets.length < 1) {
            $allwidgets_helper.hide();
            return;
        }

        // This caused this annoying Bug with multiple occurance of widgets in dui.multiSelectedWidgets array:
        // var selectedWidgets = dui.multiSelectedWidgets;
        // this fixes it:
        var selectedWidgets = [];
        for (var i = 0; i < dui.multiSelectedWidgets.length; i++) {
            selectedWidgets.push(dui.multiSelectedWidgets[i]);
        }

        var l, r, t, b;
        selectedWidgets.push(dui.activeWidget);

        // Find outer edges of all selected widgets
        for (var i = 0; i < selectedWidgets.length; i++) {
            var $widget = $("#" + selectedWidgets[i]);
            var pos = $widget.position();
            pos.right = pos.left + $widget.width();
            pos.bottom = pos.top + $widget.height();
            if (!l || pos.left < l) l = pos.left;
            if (!r || pos.right > r) r = pos.right;
            if (!t || pos.top < t) t = pos.top;
            if (!b || pos.bottom > b) b = pos.bottom;
        }

        $allwidgets_helper
            .css("left", (l - 3))
            .css("width", (r + 6 - l))
            .css("top", (t - 3))
            .css("height", (b + 6 - t))
            .show();
    },

    // Init all edit fields for one view
    changeViewEdit: function (view, noChange) {

        if (dui.selectable) {
            $(".dashui-view.ui-selectable").selectable("destroy");

            $("#duiview_"+view).selectable({
                filter: "div.dashui-widget",
                tolerance: "fit",
				cancel: "div.dashui-widget",
                start: function (e, ui) {

                },
                stop: function (e, ui) {
                    //console.log('stop ' + $(".ui-selected").length)
                    var $allwidgets_helper = $("#allwidgets_helper");
                    switch ($(".ui-selected").length) {
                        case 0:
                            $(".widget-multi-helper").remove();
                            dui.multiSelectedWidgets = [];
                            dui.inspectWidget("none");
                            $allwidgets_helper.hide();
                            break;
                        case 1:
                            $(".widget-multi-helper").remove();
                            dui.multiSelectedWidgets = [];
                            dui.inspectWidget($(".ui-selected").attr("id"));
                            $allwidgets_helper.hide();
                            break;
                        default:
                            dui.allWidgetsHelper();
                    }
                },
                selecting: function (e, ui) {
                    //console.log('selecting ' + ui.selecting.id)
                    if (!dui.activeWidget || dui.activeWidget == "none") {
                        dui.inspectWidget(ui.selecting.id);
                    } else if (ui.selecting.id != dui.activeWidget) {
                        //console.log("selecting id="+ui.selecting.id+" active="+dui.activeWidget);
                        dui.inspectWidgetMulti(ui.selecting.id);
                    }
                },
                selected: function (e, ui) {
                },
                unselecting: function (e, ui) {
                    //console.log('unselecting ' + ui.unselecting.id)
                    if ($("#widget_multi_helper_" + ui.unselecting.id).html()) {
                        $("#widget_multi_helper_" + ui.unselecting.id).remove();
                        dui.multiSelectedWidgets.splice(dui.multiSelectedWidgets.indexOf(ui.unselecting.id), 1);
                    }
                },
                unselected: function (e, ui) {
                }
            });
        }

        if (!noChange) {
            dui.undoHistory = [$.extend(true, {}, dui.views[dui.activeView])];
            $("#button_undo").addClass("ui-state-disabled").removeClass("ui-state-hover");
        }

        // Load meta data if not yet loaded
        var isMetaLoaded = false;
        for (var v in localData.metaObjects) {
            isMetaLoaded = true;
            break;
        }
        if (!isMetaLoaded) {
            // Read all data objects from server
            dui.conn.getDataObjects(function (data) {
                localData.metaObjects = data;
            });
            dui.conn.getDataIndex(function (data) {
                localData.metaIndex = data;
            });
        }

        // Init background selector
        if (dui.styleSelect && dui.views[view] && dui.views[view].settings) {
            dui.styleSelect.Show({ width: 152,
                name:       "inspect_view_bkg_def",
                filterName: 'background',
                //filterFile: "backgrounds.css",
                style:      dui.views[view].settings.style.background_class,
                parent:     $('#inspect_view_bkg_parent'),
                onchange:   function (newStyle, obj) {
                    if (dui.views[dui.activeView].settings.style['background_class']) {
                        $("#duiview_" + dui.activeView).removeClass(dui.views[dui.activeView].settings.style['background_class']);
                    }
                    dui.views[dui.activeView].settings.style['background_class'] = newStyle;
                    $("#duiview_" + dui.activeView).addClass(dui.views[dui.activeView].settings.style['background_class']);
                    dui.save();
                }
            });
        }

        $("#inspect_view").html(view);

        if (dui.views[view] && dui.views[view].settings) {
            // Try to find this resolution in the list
            var res = dui.views[dui.activeView].settings.sizex + 'x' + dui.views[dui.activeView].settings.sizey;
            $('#screen_size option').each(function () {
                if ($(this).val() == res) {
                    $(this).attr('selected', true);
                    res = null;
                }
            });
            if (!res) {
                $("#screen_size_x").prop('disabled', true);
                $("#screen_size_y").prop('disabled', true);
            }

            $("#screen_size_x").val(dui.views[dui.activeView].settings.sizex || "").trigger("change");
            $("#screen_size_y").val(dui.views[dui.activeView].settings.sizey || "").trigger("change");

            $("#screen_hide_description").prop('checked', dui.views[dui.activeView].settings.hideDescription).trigger("change");
            if (typeof hqWidgets != 'undefined') {
                hqWidgets.SetHideDescription(dui.views[dui.activeView].settings.hideDescription);
            }

            $("#grid_size").val(dui.views[dui.activeView].settings.gridSize || "").trigger("change");

            var snapType = dui.views[dui.activeView].settings.snapType || 0;

            $("#snap_type option").removeAttr("selected");
            $("#snap_type option[value='"+snapType+"']").attr("selected", true);
        }

        $("#select_active_widget").html('<option value="none">' + dui.translate('none selected') + '</option>');
        if (dui.views[dui.activeView].widgets) {
            for (var widget in dui.views[dui.activeView].widgets) {
                var obj = $("#" + dui.views[dui.activeView].widgets[widget].tpl);
                $("#select_active_widget").append("<option value='" + widget + "'>" + widget + " (" + obj.attr("data-dashui-set") + " " + obj.attr("data-dashui-name") + ")</option>");
            }
        }

        $("#select_active_widget").multiselect("refresh");

        if ($("#select_view option:selected").val() != view) {
            $("#select_view option").removeAttr("selected");
            $("#select_view option[value='" + view + "']").prop("selected", "selected");
            $("#select_view").multiselect("refresh");
        }
        $("#select_view_copy option").removeAttr("selected");
        $("#select_view_copy option[value='" + view + "']").prop("selected", "selected");
        $("#select_view_copy").multiselect("refresh");

        // View CSS Inspector
        $(".dashui-inspect-view-css").each(function () {
            var $this = $(this);
            var attr = $this.attr("id").slice(17);
            var css = $("#duiview_"+dui.activeView).css(attr);
            $this.val(css);
        });

        if (dui.views[view] && dui.views[view].settings){
            $(".dashui-inspect-view").each(function () {
                var $this = $(this);
                var attr = $this.attr("id").slice(13);
                $("#" + $this.attr("id")).val(dui.views[dui.activeView].settings[attr]);
            });

            if(!dui.views[dui.activeView].settings["theme"]) {
                dui.views[dui.activeView].settings["theme"] = "dhive";
            }
            $("#inspect_view_theme option[value='" + dui.views[dui.activeView].settings.theme + "']").prop("selected", true);
        }
        $("#inspect_view_theme").multiselect("refresh");
    },
    dragging: false,
    draggable: function (obj) {
        var origX, origY;
        var draggableOptions = {

            cancel: false,
            start: function (event, ui) {
                dui.dragging = true;
                origX = ui.position.left;
                origY = ui.position.top;
                //var widget = ui.helper.attr("id");

                //console.log(dui.multiSelectedWidgets);
            },
            stop: function (event, ui) {
                var widget = dui.activeWidget;
                var mWidget = document.getElementById(widget);
                var pos = $(mWidget).position();

                $("#inspect_css_top").val(pos.top + "px");
                $("#inspect_css_left").val(pos.left + "px");
                if (!dui.views[dui.activeView].widgets[widget].style) {
                    dui.views[dui.activeView].widgets[widget].style = {};
                }
                dui.views[dui.activeView].widgets[widget].style.left = pos.left;
                dui.views[dui.activeView].widgets[widget].style.top  = pos.top;

                if (mWidget._customHandlers && mWidget._customHandlers.onMoveEnd) {
                    mWidget._customHandlers.onMoveEnd(mWidget, widget);
                }

                for (var i = 0; i < dui.multiSelectedWidgets.length; i++) {
                    var mid = dui.multiSelectedWidgets[i];
                    mWidget = document.getElementById(mid);
                    pos = $(mWidget).position();
                    if (!dui.views[dui.activeView].widgets[mid].style) {
                        dui.views[dui.activeView].widgets[mid].style = {};
                    }
                    dui.views[dui.activeView].widgets[mid].style.left = pos.left;
                    dui.views[dui.activeView].widgets[mid].style.top  = pos.top;

                    if (mWidget._customHandlers && mWidget._customHandlers.onMoveEnd) {
                        mWidget._customHandlers.onMoveEnd(mWidget, mid);
                    }
                }
                dui.save();
                setTimeout(function () {
                    dui.dragging = false;
                }, 20);

            },
            drag: function (event, ui) {

                var moveX = ui.position.left - origX;
                var moveY = ui.position.top  - origY;

                origX = ui.position.left;
                origY = ui.position.top;

                for (var i = 0; i < dui.multiSelectedWidgets.length; i++) {
                    var mWidget = document.getElementById(dui.multiSelectedWidgets[i]);
                    var $mWidget = $(mWidget);
                    var pos = $mWidget.position();
                    var x = pos.left + moveX;
                    var y = pos.top + moveY;

                    $("#widget_multi_helper_"+dui.multiSelectedWidgets[i]).css({left: x - 2, top: y - 2});

                    if (ui.helper.attr("id") != dui.multiSelectedWidgets[i]) {
                        $mWidget.css({left: x, top: y });
                    }

                    if (mWidget._customHandlers && mWidget._customHandlers.onMove) {
                        mWidget._customHandlers.onMove(mWidget, dui.multiSelectedWidgets[i]);
                    }
                }
                var mWidget = document.getElementById(dui.activeWidget);

                if (ui.helper.attr("id") == dui.activeWidget) {
                    $("#widget_helper").css({left: origX - 2, top: origY - 2});
                } else {
                    var $mWidget = $(mWidget);
                    var pos = $mWidget.position();
                    var x = pos.left + moveX;
                    var y = pos.top  + moveY;
                    $mWidget.css({left: x, top: y});
                    $("#widget_helper").css({left: x - 2, top: y - 2});
                }

                if (mWidget._customHandlers && mWidget._customHandlers.onMove) {
                    mWidget._customHandlers.onMove(mWidget, dui.activeWidget);
                }
                if ($("#allwidgets_helper").is(":visible")) {
                    var pos = $("#allwidgets_helper").position();
                    $("#allwidgets_helper").css({left: pos.left + moveX, top: pos.top + moveY});
                }
            }
        };
        if ($("#snap_type option:selected").val() == 1) {
            draggableOptions.snap = "#dui_container div.dashui-widget";
        }
        if ($("#snap_type option:selected").val() == 2) {
            draggableOptions.grid = [dui.gridWidth, dui.gridWidth];
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
                stop: function (event, ui) {
                    var widget = ui.helper.attr("id")
                    $("#inspect_css_width").val(ui.size.width + "px");
                    $("#inspect_css_height").val(ui.size.height + "px");
                    if (!dui.views[dui.activeView].widgets[widget].style) {
                        dui.views[dui.activeView].widgets[widget].style = {};
                    }
                    dui.views[dui.activeView].widgets[widget].style.width = ui.size.width;
                    dui.views[dui.activeView].widgets[widget].style.height = ui.size.height;
                    dui.save();

                },
                resize: function (event,ui) {
                    $("#widget_helper").css({width: ui.element.outerWidth() + 2, height: ui.element.outerHeight() + 2});
                }
            }, resizableOptions));
        }
    },
    clearWidgetHelper: function () {
        $("#widget_helper").hide();
        $(".widget_multi_helper").remove();
        dui.multiSelectedWidgets = [];
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
                dui.saveRemote(function () {
					// Show hint how to get back to edit mode
					if (typeof storage !== 'undefined') {						
						if (!storage.get("isEditHintShown")) {
							alert(dui.translate('To get back to edit mode just call "%s" in browser', location.href));
							storage.set('isEditHintShown', true);
						}
					}				
                	
                    // Some systems (e.g. offline mode) show here the content of directory if called without index.html
                    location.href = "./index.html" + window.location.search + "#" + dui.activeView;
                });
            },
            open: function () {
                dui.editPosition();
            }
        });

        if ($().dialogExtend) {
            $("#dui_editor").dialogExtend({
                "minimizable" : true,
                "icons" : {
                    "maximize": "ui-icon-arrow-4-diag"
                },
                "minimize" : function (evt) {
                    $("#dui_editor_mode").hide();
                    if (dui.editorPos == "right" || dui.editorPos == "free") {
                        $("#dui_editor").dialog("option", "position", { my: "right top", at: "right top", of: window });
                    }
                    if (dui.editorPos == "left") {
                        $("#dui_editor").dialog("option", "position", { my: "left top", at: "left top", of: window });
                    }
                },
                restore: function () {
                    $("#dui_editor_mode").show();
                    $(".dui-editor-dialog").css({
                        width: "450px",
                        height: "610px"
                    })
                }
            });
        }

        $("#tabs").tabs();
        $("#widget_helper").hide();

        $("#language [value='"+ ((typeof ccuIoLang === 'undefined') ? 'en' : (ccuIoLang || 'en'))+"']").attr("selected", "selected");

        $("#language").change(function () {
            dui.language = $(this).val();
            dui.translateAll();
        });

        $("input.dashui-editor").button();
        $("button.dashui-editor").button();

        $("select.dashui-editor").each(function () {
            $(this).multiselect({
                multiple: false,
                header: false,
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
                //noneSelectedText: false,
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
                // noneSelectedText: false,
                selectedList: 1,
                minWidth: 420,
                height: 340,
                checkAllText:dui.translate("Check all"),
                uncheckAllText:dui.translate("Uncheck all"),
                noneSelectedText:dui.translate("Select options")
            });
        });

        // Button Click Handler

        $("#export_view").click(function(){dui.exportView(false);});

        $("#import_view").click(function () {
            $("#textarea_import_view").html("");
            $("#dialog_import_view").dialog({
                autoOpen: true,
                width: 800,
                height: 600,
                modal: true,
                open: function (event, ui) {
                    $('[aria-describedby="dialog_import_view"]').css('z-index',1002);
                    $('.ui-widget-overlay').css('z-index',1001);
                    $("#start_import_view").click(function () {
                        dui.importView();
                    });
                    $("#name_import_view").show();
                }
            });
        });

		$("#widget_doc").button({icons: {primary: "ui-icon ui-icon-script"}}).click(function () {
            var tpl = dui.views[dui.activeView].widgets[dui.activeWidget].tpl;
            var widgetSet = $("#" + tpl).attr("data-dashui-set");
            var docUrl = "widgets/" + widgetSet + "/doc.html#" + tpl;
            window.open(docUrl,"WidgetDoc", "height=640,width=500,menubar=no,resizable=yes,scrollbars=yes,status=yes,toolbar=no,location=no");
        });


		$("#del_widget").button({icons: {primary: "ui-icon-trash"}}).click(dui.delWidget);

		$("#dup_widget").button({icons: {primary: "ui-icon-copy"}}).click(function () {
            dui.dupWidget();
        });

		$("#add_widget").button({icons: {primary: "ui-icon-plusthick"}}).click(function () {
            var tpl = $("#select_tpl option:selected").val();
            var renderVisible = $('#'+tpl).attr("data-dashui-render-visible");
            // Widget attributs default values

            // TODO: we dont need it anymore (except hm_id), while default settings can be set in tpl itself
            var data = {
                hm_id:  65535,
                digits: "",
                factor: 1,
                min:    0.00,
                max:    1.00,
                step:   0.01
            };
            if (renderVisible) {
                data.renderVisible = true;
            }
            dui.addWidget(tpl, data);

            $("#select_active_widget").append("<option value='"+dui.activeWidget+"'>"+dui.activeWidget+" ("+$("#"+dui.views[dui.activeView].widgets[dui.activeWidget].tpl).attr("data-dashui-name")+")</option>");
            $("#select_active_widget").multiselect("refresh");
            setTimeout(function () {
                dui.inspectWidget(dui.activeWidget)
            }, 50);

        });
		$("#add_view").button({icons: {primary: "ui-icon-plusthick"}}).click(function () {
            var name = dui.checkNewView();
            if (name === false) {
                return;
            }
            dui.addView(name);
        });
		$("#dup_view").button({icons: {primary: "ui-icon-copy"}}).click(function () {
            var name = dui.checkNewView();
            if (name === false) {
                return;
            }
            dui.dupView(name);
        });
		$("#del_view").button({icons: {primary: "ui-icon-trash"}}).click(function () {
            dui.delView(dui.activeView);
        });
		$("#rename_view").button({icons: {primary: "ui-icon-pencil"}}).click(function () {
            var name = dui.checkNewView($("#new_name").val());
            if (name === false) {
                return;
            }
            dui.renameView(name);
        });

		$("#create_instance").button({icons: {primary: "ui-icon-plus"}}).click(dui.generateInstance);

        // Inspector Change Handler
        $(".dashui-inspect-widget").change(function () {
            var $this = $(this);
            var attr = $this.attr("id").slice(8);
            dui.views[dui.activeView].widgets[dui.activeWidget].data[attr] = $this.val();

            // Some user adds ui-draggable and ui-resizable as class to widget.
            // The result is DashUI tries to remove draggable and resizable properties and fails
            if (attr == "class") {
                var val = dui.views[dui.activeView].widgets[dui.activeWidget].data[attr];
                if (val.indexOf("ui-draggable") != -1 || val.indexOf("ui-resizable") != -1) {
                    var vals = val.split(" ");
                    val = "";
                    for (var j = 0; j < vals.length; j++) {
                        if (vals[j] && vals[j] != "ui-draggable" && vals[j] != "ui-resizable") {
                            val += ((val) ? " " : "") + vals[j];
                        }
                    }
                    dui.views[dui.activeView].widgets[dui.activeWidget].data[attr] = val;
                    $this.val(val);
                }
            }

            dui.save();
            dui.reRenderWidgetEdit(dui.activeWidget);
        }).keyup(function () {
            $(this).trigger("change");
        });
		
        $(".dashui-inspect-css").change(function () {
            var $this = $(this);
            var style = $this.attr("id").substring(12);
			if (!dui.views[dui.activeView].widgets[dui.activeWidget].style) {
				dui.views[dui.activeView].widgets[dui.activeWidget].style = {};
			}
            dui.views[dui.activeView].widgets[dui.activeWidget].style[style] = $this.val();
            dui.save();
            var activeWidget = document.getElementById(dui.activeWidget);
            var $activeWidget = $(activeWidget);
            $activeWidget.css(style, $this.val());
            $("#widget_helper").css({
                left:   parseInt($activeWidget.css("left")) - 2,
                top:    parseInt($activeWidget.css("top"))  - 2,
                height: $activeWidget.outerHeight() + 2,
                width:  $activeWidget.outerWidth()  + 2
            });

            if (activeWidget._customHandlers && activeWidget._customHandlers.onCssEdit) {
                activeWidget._customHandlers.onCssEdit(activeWidget, dui.activeWidget);
            }
        }).keyup(function () {
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
            dui.save();
        }).keyup(function () {
            $(this).trigger('change');
        });
		
        $(".dashui-inspect-view").change(function () {
            var $this = $(this);
            var attr = $this.attr("id").slice(13);
            var val = $this.val();
            //console.log("change "+attr+" "+val);
            dui.views[dui.activeView].settings[attr] = val;
            dui.save();
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
            dui.additionalThemeCss(theme);
            dui.save();
        });
        $("#select_active_widget").change(function () {
            var widgetId = $(this).val();
            //console.log("select_active_widget change "+widgetId);
            dui.inspectWidget(widgetId);
            dui.actionNewWidget(widgetId);
        });

        $("#css_view_inspector").click(function () {
            dui.inspectWidget("none");
        });

        $('#screen_size').change(function() {
            var val = $(this).find('option:selected').val();
            if (val != 'user') {
                var size = val.split('x');
                $("#screen_size_x").val(size[0]).trigger('change').prop('disabled', true);
                $("#screen_size_y").val(size[1]).trigger('change').prop('disabled', true);
            } else {
                $("#screen_size_x").removeAttr('disabled');
                $("#screen_size_y").removeAttr('disabled');
            }

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
            if (dui.views[dui.activeView].settings.sizex != x) {
                dui.views[dui.activeView].settings.sizex = x;
                dui.setViewSize(dui.activeView);
                dui.save();
            }

        }).keyup(function () {
            $(this).trigger("change");
        });

        $("#screen_hide_description").change(function () {
            var val = $("#screen_hide_description")[0].checked
            if (dui.views[dui.activeView].settings.hideDescription != val) {
                dui.views[dui.activeView].settings.hideDescription = val;
                if (typeof hqWidgets != 'undefined') {
                    hqWidgets.SetHideDescription(val);
                }
                dui.save();
            }

        }).keyup(function () {
            $(this).trigger("change");
        });


        $("#screen_size_y").change(function () {
            var x = $("#screen_size_x").val();
            var y = $("#screen_size_y").val();
            if (y > 0) {
                $("#size_y").css("top", (parseInt(y, 10) + 1) + "px").show();
                $("#size_x").css("height", (parseInt(y, 10) + 3) + "px");
                if (x > 0) {
                    $("#size_y").css("width", (parseInt(x, 10) + 3) + "px");
                }
            } else {
                $("#size_y").hide();

            }
            if (dui.views[dui.activeView].settings.sizey != y) {
                dui.views[dui.activeView].settings.sizey = y;
                dui.setViewSize(dui.activeView);
                dui.save();
            }

        }).keyup(function () {
            $(this).trigger("change");
        });

        $("#snap_type").change(function () {
            var snapType = $("#snap_type option:selected").val();
            if (dui.views[dui.activeView].settings.snapType != snapType) {
                dui.views[dui.activeView].settings.snapType = snapType;
                dui.save();
            }
        });

        $("#grid_size").change(function () {
            var gridSize = $(this).val();
            if (dui.views[dui.activeView].settings.gridSize != gridSize) {
                dui.views[dui.activeView].settings.gridSize = gridSize;
                dui.save();
            }
        });
        // Bug in firefox or firefox is too slow or too fast
        setTimeout(function() {
            if (document.getElementById('select_active_widget')._isOpen === undefined) {
                $("#select_active_widget").html('<option value="none">' + dui.translate('none selected') + '</option>');
                if (dui.activeView && dui.views && dui.views[dui.activeView] && dui.views[dui.activeView].widgets) {
                    for (var widget in dui.views[dui.activeView].widgets) {
                        var obj = $("#" + dui.views[dui.activeView].widgets[widget].tpl);
                        $("#select_active_widget").append("<option value='" + widget + "'>" + widget + " (" + obj.attr("data-dashui-set") + " " + obj.attr("data-dashui-name") + ")</option>");
                    }
                }
                $("#select_active_widget").multiselect("refresh");
            }
        }, 10000);

        // Instances
        if (typeof storage !== 'undefined') {
            // Show what's new
            if (storage.get('lastVersion') != dui.version) {
                // Read
                storage.set('lastVersion', dui.version);
                // Read io-addon.json
                $.ajax({
                    url: "io-addon.json",
                    cache: false,
                    success: function (data) {

                        try {
                            var ioaddon = data; // @bluefox: this is already parsed by jQuery.ajax! JSON.parse(data);
                            if (ioaddon.whatsNew) {
                                for (var i = 0; i < ioaddon.whatsNew.length; i++) {
                                    var text = ioaddon.whatsNew[i];
                                    if (typeof text != 'string') {
                                        text = ioaddon.whatsNew[i][dui.language] || ioaddon.whatsNew[i]['en'];
                                    }
                                    // Remove modifier information like (Bluefox) or (Hobbyquaker)
                                    if (text[0] == '(') {
                                        var j = text.indexOf(')');
                                        if (j != -1) {
                                            text = text.substring(j + 1);
                                        }
                                    }
                                    dui.showHint('<b>' + dui.translate('New:') + '</b>' + text, 30000, 'info');
                                }
                            }
                        } catch (e) {
                            servConn.logError('Cannot parse io-addon.json ' + e);
                        }
                    }
                });
            }
        }
    },
    editInitNext: function () {
		// DashUI Editor Init
		var sel;

		var keys = Object.keys(dui.views),
			i, k, len = keys.length;

		keys.sort();

        var $select_view      = $("#select_view");
        var $select_view_copy = $("#select_view_copy");
        var $select_set       = $("#select_set");

		for (i = 0; i < len; i++) {
			k = keys[i];

			if (k == dui.activeView) {
				$("#inspect_view").html(dui.activeView);
				sel = " selected";
			} else {
				sel = "";
			}
            $select_view.append("<option value='" + k + "'" + sel + ">" + k + "</option>");
            $select_view_copy.append("<option value='" + k + "'" + sel + ">" + k + "</option>");
		}

        $select_view.multiselect("refresh");

        $select_view_copy.multiselect({
            minWidth: 200,
            checkAllText:dui.translate("Check all"),
            uncheckAllText:dui.translate("Uncheck all"),
            noneSelectedText:dui.translate("Select options")
        }).multiselect("refresh");

        $select_view.change(function () {
			dui.changeView($(this).val());
		});

        $select_set.change(dui.refreshWidgetSelect);
        $select_set.html("");

		for (i = 0; i < dui.widgetSets.length; i++) {
			if (dui.widgetSets[i].name !== undefined) {
                $select_set.append("<option value='" + dui.widgetSets[i].name + "'>" + dui.widgetSets[i].name + "</option>");
			} else {
                $select_set.append("<option value='" + dui.widgetSets[i] + "'>" + dui.widgetSets[i] + "</option>");
			}
		}
        $select_set.multiselect("refresh");

		dui.refreshWidgetSelect();

		//console.log("TOOLBOX OPEN");
		$("#dui_editor").dialog("open");
        $('.ui-dialog').css({'z-index':1000});
        if (dui.binds.jqueryui) {
		    dui.binds.jqueryui._disable();
        }

		// Create background_class property if does not exist
		if (dui.views[dui.activeView] != undefined) {
			if (dui.views[dui.activeView].settings == undefined) {
				dui.views[dui.activeView].settings = {};
			}
			if (dui.views[dui.activeView].settings.style == undefined) {
				dui.views[dui.activeView].settings.style = {};
			}
			if (dui.views[dui.activeView].settings.style['background_class'] == undefined) {
				dui.views[dui.activeView].settings.style['background_class'] = "";
			}
		}

		if (dui.fillWizard) {
			dui.fillWizard();
		}

        // Deselect active widget if click nowhere. Not required if selectable is active
        if (!dui.selectable) {
            $('#dui_container').click (function () {
                dui.inspectWidget("none");
            });
        }

        if (servConn.getType() == 2 /* local */) {
            $("#export_local_view").click(function () {
                dui.exportView(true);
            }).show();

            $("#import_local_view").click(function () {
                $("#textarea_import_view").html("");
                $("#dialog_import_view").dialog({
                    autoOpen: true,
                    width: 800,
                    height: 600,
                    modal: true,
                    open: function (event, ui) {
                        $('[aria-describedby="dialog_import_view"]').css('z-index',1002);
                        $('.ui-widget-overlay').css('z-index',1001);
                        $("#start_import_view").click(function () {
                            dui.importView(true);
                        });
                        $("#name_import_view").hide();
                    }
                });
            }).show();

            $("#clear_local_view").click(function () {
                if (typeof storage !== 'undefined') {
                    localStorage.clear();
                    window.location.reload();
                }
            }).show();
            $('#local_view').show();
        }


    },
    editPosition: function () {

        function left() {
            $(".ui-dialog-titlebar-minimize").show();
            if ($(".dui-editor-dialog").parent().attr("id") == "dui-editor-dialog-wrap") {
                $(".dui-editor-dialog").unwrap();
            }
            $("#dui_editor")
                .dialog("option", "resizable", false)
                .dialog("option", "draggable", false)
                .css("height", "calc(100% - 58px)");

            $(".dui-editor-dialog").css({
                height: "calc(100% - 9px)",
                width: "450px",
                left: 0,
                position: "absolute",
                right: "auto",
                top: 0
            })
        }

        function right() {
            $(".ui-dialog-titlebar-minimize").show();
            if ($(".dui-editor-dialog").parent().attr("id") == "dui-editor-dialog-wrap") {
                $(".dui-editor-dialog").unwrap();
            }
            $("#dui_editor")
                .dialog("option", "resizable", false)
                .dialog("option", "draggable", false)
                .css("height", "calc(100% - 58px)");
            $(".dui-editor-dialog").css({
                height: "calc(100% - 9px)",
                width: "450px",
                position: "absolute",
                right: 0,
                left: "auto",
                top: 0
            })
        }

        function left_ah() {
            var delay;
            $(".ui-dialog-titlebar-minimize").hide();
            if ($(".dui-editor-dialog").parent().attr("id") == "dui-editor-dialog-wrap") {
                $(".dui-editor-dialog").unwrap();
            }
            $("#dui_editor")
                .dialog("option", "resizable", false)
                .dialog("option", "draggable", false)
                .css("height", "calc(100% - 58px)");

            $(".dui-editor-dialog")
                .wrapAll('<div id="dui-editor-dialog-wrap"></div>')
                .css({
                    height: "calc(100% - 9px)",
                    width: "450px",
                    left: 0,
                    position: "relative",
                    right: "auto",
                    top: 0
                })
                .hide("slide", {direction: "left"});

            $("#dui-editor-dialog-wrap")
                .css({
                    height: "100%",
                    width: "auto",
                    left: 0,
                    position: "absolute",
                    right: "auto",
                    top: 0,
                    minWidth: "20px"
                })
                .mouseenter(function () {
                    clearTimeout(delay);
                    $(".dui-editor-dialog").show("slide", {direction: "left"})
                })
                .mouseleave(function () {
                    if ($(".ui-multiselect-menu:visible").length) {
                        return;
                    }
                    delay = setTimeout(function () {
                        $(".dui-editor-dialog").hide("slide", {direction: "left"})
                    }, 750);
                });
        }

        function right_ah() {
            var delay;
            $(".ui-dialog-titlebar-minimize").hide();
            if ($(".dui-editor-dialog").parent().attr("id") == "dui-editor-dialog-wrap") {
                $(".dui-editor-dialog").unwrap();
            }
            $("#dui_editor")
                .dialog("option", "resizable", false)
                .dialog("option", "draggable", false)
                .css("height", "calc(100% - 58px)");

            $(".dui-editor-dialog")
                .wrapAll('<div id="dui-editor-dialog-wrap"></div>')
                .css({
                    height: "100%",
                    width: "450px",
                    left: "auto",
                    position: "relative",
                    right: 0,
                    top: 0

                })
                .hide("slide", {direction: "right"});

            $("#dui-editor-dialog-wrap")
                .css({
                    height: "calc(100% - 9px)",
                    width: "auto",
                    left: "auto",
                    position: "absolute",
                    right: 0,
                    top: 0,
                    minWidth: "20px"
                })
                .mouseenter(function () {
                    clearTimeout(delay);
                    $(".dui-editor-dialog").show("slide", {direction: "right"})
                })
                .mouseleave(function () {
                    if ($(".ui-multiselect-menu:visible").length) {
                         return;
                    }
                    delay = setTimeout(function () {
                        $(".dui-editor-dialog").hide("slide", {direction: "right"})
                    }, 750);
                });
        }

        function free() {

            $(".ui-dialog-titlebar-minimize").show();
            if ($(".dui-editor-dialog").parent().attr("id") == "dui-editor-dialog-wrap") {
                $(".dui-editor-dialog").unwrap();
            }
            $("#dui_editor")
                .dialog("option", "resizable", true)
                .dialog("option", "draggable", true)
                .css("height", "calc(100% - 58px)");

            $(".dui-editor-dialog").css({
                position: "absolute",
                right: 0,
                left: "auto",
                top: 0,
                width: "450px",
                height: "610px"
            });

        }

        var save_posi;
        if (typeof storage !== 'undefined') {
            save_posi = storage.get("Dashui_Editor_Position");
        }
        save_posi = save_posi || ["free","*"];
        dui.editorPos = save_posi[0];

        $(".dui-editor-dialog .ui-dialog-titlebar-buttonpane")
            .append('<div id="dui_editor_mode"></div>')
            .css({"z-index": 100});

        if ($().xs_combo) {
            $("#dui_editor_mode").xs_combo({
                cssText: "xs_text_editor_mode",
                time: 750,
                val: save_posi[1],
                data: ["|<", ">|", "<", ">", "*"]
            });
            $("#dui_editor_mode").change(function () {
                var val = $(this).xs_combo();
                var settings = null;
                if (val == "|<") {
                    left();
                    dui.editorPos = "left";
                } else if (val == ">|") {
                    right();
                    dui.editorPos = "right";
                    settings = ["right", val];
                } else if (val == "<") {
                    left_ah();
                    dui.editorPos = "left_ah";
                    settings = ["left_ah", val];
                } else if (val == ">") {
                    right_ah();
                    dui.editorPos = "right_ah";
                    settings = ["right_ah", val];
                } else if (val == "*") {
                    free();
                    dui.editorPos = "free";
                    settings = ["free", val];
                }
                if (typeof storage != 'undefined' && settings) {
                    storage.set("Dashui_Editor_Position", settings);
                }
            });
        }

        $(".dui-editor-dialog .ui-dialog-titlebar-buttonpane").append('<span id="button_undo" href="#" role="button">undo (ctrl-z)</span>');
        $("#button_undo").button({
            text: false,
            icons: { primary: "ui-icon-arrowreturnthick-1-w"}
        }).click(dui.undo).addClass("ui-state-disabled");

        $(".dui-editor-dialog .ui-dialog-titlebar-buttonpane").prepend('<span id="savingProgress" role="button">Saving in progress</span>');
        $("#savingProgress").button({
            text: false,
            icons: { primary: "ui-icon-disk"}
        }).click(dui._saveToServer).hide().addClass("ui-state-active");


        var _save_posi = save_posi[0] + "()";
        eval(_save_posi);


    },
    refreshWidgetSelect: function () {
        var $select_tpl = $("#select_tpl");
        $select_tpl.html("");
        var current_set = $("#select_set option:selected").val();
        $(".dashui-tpl[data-dashui-set='" + current_set + "']").each(function () {
            $("#select_tpl").append("<option value='" + $(this).attr("id") + "'>" + $(this).attr("data-dashui-name") + "</option>")
        });
        $select_tpl.multiselect("refresh");
    },
	// Find free place for new widget
	findFreePosition: function (view, id, field, widgetWidth, widgetHeight) {
		var editPos = $('.ui-dialog:first').position();
		field = $.extend({x: 0, y: 0, width: editPos.left}, field);
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
		
		while (!dui.checkPosition(positions, x, y, widgetWidth, widgetHeight)) {
			x += step;
			if (x + widgetWidth > field.x + field.width) {
				x = field.x;
				y += step;
			}
		};
		
		// No free place on the screen
		if (y >= $(window).height()) {
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
				 (s.top  <= y + widgetHeight && (s.top  + s.height) >= y + widgetHeight))) {
				return false;
			}
			if (((x <= s.left                &&  s.left             <= x + widgetWidth) ||
				 (x <= (s.left + s.width)    && (s.left + s.width)  <= x + widgetWidth)) &&
				((y <= s.top                 && s.top               <= y + widgetHeight) ||
				 (y <= (s.top  + s.height)   && (s.top  + s.height) <= y + widgetHeight))) {
				return false;
			}			
		}
		return true;
	},
	actionNewWidget: function (id) {
        if (id == "none") {
            return;
        }
		var $jWidget = $('#'+id);
        if (!$jWidget.length) {
            return;
        }

		var s = $jWidget.position ();
		s['width']  = $jWidget.width();
		s['height'] = $jWidget.height();
		s['radius'] = parseInt($jWidget.css('border-radius'));
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
			animate(_css1, 1500, 'swing', function () {
				$(this).remove();
			}).click(function () {
				$(this).stop().remove();
			});

		text = text.replace('action1', 'action2');
		$('body').append(text);
		$('#'+id+'__action2').
			addClass('dashui-show-new').
			css(_css2).
			animate(_css1, 3000, 'swing', function () {
                $(this).remove();
            });
	},
    translateAll: function () {
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
	    // translate <input type="button>
	    $(".translateV").each(function (idx) {
            var text = $(this).attr('data-lang');
            if (!text) {
                text = $(this).attr('value');
                $(this).attr('data-lang', text);
            }

            var transText = dui.translate(text);
            if (transText) {
                $(this).attr('value', transText);
            }
	    });
        $(".translateB").each(function (idx) {
            //<span class="ui-button-text">Save</span>
            var text = $(this).attr('data-lang');
            if (!text) {
                text = $(this).html();
                text = text.replace('<span class="ui-button-text">', '').replace('</span>', '');
                $(this).attr('data-lang', text);
            }
            var transText = dui.translate(text);
            if (transText) {
                text = $(this).html();
                if (text.indexOf('<span') != -1) {
                    $(this).html('<span class="ui-button-text">' + transText + '</span>');
                } else {
                    $(this).html(transText);
                }
            }
        });
        // translate <div title="text">
        $(".translateT").each(function (idx) {
            var text = $(this).attr('data-lang');
            if (!text) {
                text = $(this).attr('title');
                $(this).attr('data-lang', text);
            }

            var transText = dui.translate(text);
            if (transText) {
                $(this).attr('title', transText);
            }
        });
	},
    // collect all filter keys for given view
    updateFilter: function () {
        if (dui.activeView && dui.views) {
            var widgets = dui.views[dui.activeView].widgets;
            dui.views[dui.activeView].filterList = [];
            
            for (var widget in widgets) {
                if (widgets[widget] && widgets[widget].data &&
                    widgets[widget].data.filterkey != "" &&
                    widgets[widget].data.filterkey !== undefined) {
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
                    $(this).attr("checked", true).button("refresh");
                } else {
                    $(this).removeAttr("checked").button("refresh");
                }
                var isSelected = false;
                $(".dashui-steal-css").each(function () {
                    if ($(this).attr("checked")) {
                        isSelected = true;
                    }
                });

                if (isSelected && !dui.isStealCss) {
                    dui.stealCssMode();
                } else if (!isSelected && dui.isStealCss) {
                    dui.stealCssModeStop();
                }

                e.stopPropagation();
                e.preventDefault();
                return false;
            });
        })
    },
    stealCssModeStop: function () {
        dui.isStealCss = false;
        $("#stealmode_content").remove();
        if (dui.selectable) {
            $("#duiview_" + dui.activeView).selectable("enable");
        }
        $(".dashui-steal-css").removeAttr("checked").button("refresh");
        $("#dui_container").removeClass("dashui-steal-cursor");

    },
    stealCssMode: function () {
        if (dui.selectable) {
            $("#duiview_" + dui.activeView).selectable("disable");
        }
        dui.isStealCss = true;
        $(".widget_multi_helper").remove();
        dui.multiSelectedWidgets = [];

        if (!$('#stealmode_content').length) {
            $('body').append('<div id="stealmode_content" style="display:none" class="dashui-stealmode">CSS steal mode</div>')
            $("#stealmode_content").fadeIn('fast')
                .click(function() {
                    $(this).fadeOut("slow");
                });
        }

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
                    $(this).removeAttr("checked").button("refresh");
                    var cssAttribute = $(this).attr("data-dashui-steal");
                    if (cssAttribute.match(/border-/) || cssAttribute.match(/padding/)) {
                        var val = dui.combineCssShorthand($(src), cssAttribute);
                    } else {
                        var val = $(src).css(cssAttribute);
                    }
                    $(target).css(cssAttribute, val);
                    dui.views[dui.activeView].widgets[dui.activeWidget].style[cssAttribute] = val;
                }
            });

            dui.save(function () {

                dui.stealCssModeStop();
                dui.inspectWidget(dui.activeWidget);

            });

        }
    },
    combineCssShorthand: function (that, attr) {
        var css;
        var parts = attr.split("-");
        var baseAttr = parts[0];

        if (attr == "border-radius") {
            // TODO second attribute
            var cssTop = that.css(attr.replace(RegExp(baseAttr), baseAttr + "-top-left"));
            var cssRight = that.css(attr.replace(RegExp(baseAttr), baseAttr + "-top-right"));
            var cssBottom = that.css(attr.replace(RegExp(baseAttr), baseAttr + "-bottom-right"));
            var cssLeft = that.css(attr.replace(RegExp(baseAttr), baseAttr + "-bottom-left"));
        } else {
            var cssTop = that.css(attr.replace(RegExp(baseAttr), baseAttr + "-top"));
            var cssRight = that.css(attr.replace(RegExp(baseAttr), baseAttr + "-right"));
            var cssBottom = that.css(attr.replace(RegExp(baseAttr), baseAttr + "-bottom"));
            var cssLeft = that.css(attr.replace(RegExp(baseAttr), baseAttr + "-left"));
        }
        if (cssLeft == cssRight && cssLeft == cssTop && cssLeft == cssBottom) {
            css = cssLeft;
        } else if (cssTop == cssBottom && cssRight == cssLeft) {
            css = cssTop + " " + cssLeft;
        } else if (cssRight == cssLeft) {
            css = cssTop + " " + cssLeft + " " + cssBottom;
        } else {
            css = cssTop + " " + cssRight + " " + cssBottom + " " + cssLeft;
        }
        return css;
    },
    _saveTimer: null, // Timeout to save the configuration
    _saveToServer: function () {
        if (dui.undoHistory.length == 0 ||
            (JSON.stringify(dui.views[dui.activeView]) != JSON.stringify(dui.undoHistory[dui.undoHistory.length - 1]))) {
            $("#button_undo").removeClass("ui-state-disabled");
            if (dui.undoHistory.push($.extend(true, {}, dui.views[dui.activeView])) > dui.undoHistoryMaxLength) {
                dui.undoHistory.splice(0, 1);
            }
        }
        dui.saveRemote(function() {
            dui._saveTimer = null;
            $('#savingProgress').hide().next().button('enable');
        });
    },
    save: function (cb) {
        if (this._saveTimer) {
            clearTimeout(this._saveTimer);
            this._saveTimer = null;
        }
        // Store the changes if nothing changed for 2 seconds
        this._saveTimer = _setTimeout(function (dash) {
            dash._saveToServer();
        }, 2000, this);

        $('#savingProgress').show().next().button('disable');
        if (cb) {
            cb();
        }
    },
    undo: function () {
        if (dui.undoHistory.length <= 1) {
            return;
        }

        var activeWidget = dui.activeWidget;
        var multiSelectedWidgets = dui.multiSelectedWidgets;

        dui.inspectWidget("none");
        $("#duiview_" + dui.activeView).remove();

        dui.undoHistory.pop();
        dui.views[dui.activeView] = $.extend(true, {}, dui.undoHistory[dui.undoHistory.length - 1]);
        dui.saveRemote();

        if (dui.undoHistory.length <= 1) {
            $("#button_undo").addClass("ui-state-disabled").removeClass("ui-state-hover");
        }

        dui.renderView(dui.activeView);
        dui.changeViewEdit(dui.activeView, true);
        dui.inspectWidget(activeWidget);
        for (var i = 0; i < multiSelectedWidgets.length; i++) {
            dui.inspectWidgetMulti(multiSelectedWidgets[i]);
        }

    },
    getWidgetThumbnail: function (widget, maxWidth, maxHeight, callback) {
        var widObj = document.getElementById(widget);
        if (!widObj || !callback) {
            return;
        }
        maxWidth  = maxWidth  || 200;
        maxHeight = maxHeight || 40;

        if (!widObj.innerHTML || widObj.innerHTML.length > 20000) {
            var $elem = $(widObj);
            var newCanvas = document.createElement('canvas');
            newCanvas.height = maxHeight;
            newCanvas.width  = Math.ceil($elem.width() / $elem.height() * newCanvas.height);
            if (newCanvas.width > maxWidth) {
                newCanvas.width  = maxWidth;
                newCanvas.height = Math.ceil($elem.height / $elem.width * newCanvas.width);
            }

            var ctx = newCanvas.getContext("2d");
            ctx.clearRect (0, 0, newCanvas.width, newCanvas.height);
            ctx.fillStyle="#FF0000";
            ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
            ctx.font="5px Arial";
            ctx.fillText("Cannot render", 0, 0);
            callback(newCanvas);
        } else {
            html2canvas(widObj, {
                onrendered: function(canvas) {
                    var newCanvas = document.createElement('canvas');
                    newCanvas.height = maxHeight;
                    newCanvas.width  = Math.ceil(canvas.width / canvas.height * newCanvas.height);
                    if (newCanvas.width > maxWidth) {
                        newCanvas.width  = maxWidth;
                        newCanvas.height = Math.ceil(canvas.height / canvas.width * newCanvas.width);
                    }
                    var ctx = newCanvas.getContext("2d");
                    ctx.clearRect (0, 0, newCanvas.width, newCanvas.height);
                    ctx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
                    callback(newCanvas);
                }
            });
        }
    },
    showHint: function (content, life, type, onShow) {
        if (!$.jGrowl) {
            alert(content);
            return;
        }
        if (!dui.growlInited) {
            dui.growlInited = true;
            // Init jGrowl
            $.jGrowl.defaults.closer = true;
            $.jGrowl.defaults.check = 1000;
        }

        $('#growl_informator').jGrowl(content, {
            theme: type,
            life: (life === undefined) ? 10000 : life,
            sticky: (life === undefined) ? false : !life,
            afterOpen: function (e,m,o) {
                e.click(function () {
                    $(this).find('.jGrowl-close').trigger('jGrowl.close');
                });
                if (onShow) {
                    onShow(content);
                }
            }
        });
    },
    selectAll: function () {
        // Select all widgets on view
        var $focused = $(':focus');
        if (!$focused.length && dui.activeView) {
            // Go through all widgets
            if (!dui.activeWidget || dui.activeWidget == "none") {
                // Get first one
                for (var widget in dui.views[dui.activeView].widgets) {
                    dui.inspectWidget(widget);
                    break;
                }
            }
            for (var widget in dui.views[dui.activeView].widgets) {
                if (widget == dui.activeWidget) {
                    continue;
                }
                dui.inspectWidgetMulti(widget);
            }
            return true;
        } else {
            return false;
        }
    },
    deselectAll: function () {
        // Select all widgets on view
        var $focused = $(':focus');
        if (!$focused.length && dui.activeView) {
            dui.clearWidgetHelper();

            if (dui.activeWidget && dui.activeWidget != "none") {
                dui.inspectWidget('none');
            }
            return true;
        } else {
            return false;
        }
    },
    paste: function () {
        var $focused = $(':focus');
        if (!$focused.length) {
            if (dui.clipboard && dui.clipboard.length) {
                var widgets = [];
                for (var i = 0, len = dui.clipboard.length; i < len; i++) {
                    dui.dupWidget(dui.clipboard[i], true);
                    widgets.push(dui.activeWidget);
                }
                dui.save();                // Select main widget and add to selection the secondary ones
                dui.inspectWidget(widgets[0]);
                for (var j = 1, jlen = widgets.length; j < jlen; j++) {
                    dui.inspectWidgetMulti(widgets[j]);
                }
            }
        }
    },
    copy: function (isCut) {
        var $focused = $(':focus');
        if (!$focused.length && dui.activeWidget) {
            var $clipboard_content = $('#clipboard_content');
            if (!$clipboard_content.length) {
                $('body').append('<div id="clipboard_content" style="display:none" class="dashui-clipboard" title="'+dui.translate('Click to hide')+'"></div>');
                $clipboard_content = $('#clipboard_content');
            }

            dui.clipboard = [];
            dui.clipboard[0] = {
                widget: $.extend(true, {}, dui.views[dui.activeView].widgets[dui.activeWidget]),
                view: (!isCut) ? dui.activeView : '---copied---'
            };
            var widgetNames = dui.activeWidget;
            if (dui.multiSelectedWidgets.length) {
                for (var i = 0, len = dui.multiSelectedWidgets.length; i < len; i++) {
                    widgetNames += ', ' + dui.multiSelectedWidgets[i];
                    dui.clipboard[i + 1] = {widget: $.extend(true, {}, dui.views[dui.activeView].widgets[dui.multiSelectedWidgets[i]]), view: (!isCut) ? dui.activeView : '---copied---'};
                }
            }

           /* dui.showHint('<table><tr><td>' + dui.translate('Clipboard:') + '&nbsp;<b>' + widgetNames + '</b></td><td id="thumbnail" width="200px"></td></tr></table>', 0, null, function () {
            if (html2canvas) {
                dui.getWidgetThumbnail(dui.activeWidget, 0, 0, function (canvas) {
                    $('#thumbnail').html(canvas);
                });
            }

            });
            */
            $clipboard_content.html('<table><tr><td>' + dui.translate('Clipboard:') + '&nbsp;<b>' + widgetNames + '</b></td><td id="thumbnail"></td></tr></table>');

            if (typeof html2canvas != "undefined") {
                dui.getWidgetThumbnail(dui.activeWidget, 0, 0, function (canvas) {
                    $('#thumbnail').html(canvas);
                    if (isCut) {
                        for (var i = 0, len = dui.multiSelectedWidgets.length; i < len; i++) {
                            dui.delWidget(dui.multiSelectedWidgets[i]);
                        }
                        dui.delWidget(dui.activeWidget);
                        dui.inspectWidget("none");
                    }
                });
            } else {
                if (isCut) {
                    for (var i = 0, len = dui.multiSelectedWidgets.length; i < len; i++) {
                        dui.delWidget(dui.multiSelectedWidgets[i]);
                    }
                    dui.delWidget(dui.activeWidget);
                    dui.inspectWidget("none");
                }
            }

            $clipboard_content.css({left: ($(document).width() - $clipboard_content.width()) / 2})
            .click(function(){
                $(this).slideUp("slow");
            })
            .fadeIn('fast');
        } else {
            $('#clipboard_content').remove();
        }
    },
    onButtonDelete: function () {
        var $focused = $(':focus');
        if (!$focused.length && dui.activeWidget) {
            var isHideDialog = false;
            if (typeof storage != "undefined") {
                isHideDialog = storage.get("dialog_delete_is_show");
            }
    
            if (!isHideDialog) {
                if (dui.multiSelectedWidgets.length) {
                    $("#dialog_delete_content").html(dui.translate("Do you want delete %s widgets?", dui.multiSelectedWidgets.length + 1));
                } else {
                    $("#dialog_delete_content").html(dui.translate("Do you want delete widget %s?", dui.activeWidget));
                }
    
                var dialog_buttons = {};
    
                var delText = dui.translate("Delete").replace("&ouml;", "ö");
                dialog_buttons[delText] = function () {
                    if ($('#dialog_delete_is_show').prop('checked')) {
                        if (typeof storage != "undefined") {
                            storage.set("dialog_delete_is_show", true);
                        }
                    }
                    $(this).dialog( "close" );
    
                    for (var i = 0, len = dui.multiSelectedWidgets.length; i < len; i++) {
                        dui.delWidget(dui.multiSelectedWidgets[i]);
                    }
                    dui.delWidget(dui.activeWidget);
                    // dui.clearWidgetHelper(); - will be done in inspectWidget("none")
                    dui.inspectWidget("none");
                }
                dialog_buttons[dui.translate("Cancel")] = function () {
                    $(this).dialog("close");
                };
    
                $("#dialog_delete").dialog({
                    autoOpen: true,
                    width: 500,
                    height: 220,
                    modal: true,
                    title: dui.translate("Confirm widget deletion"),
                    open: function (event, ui) {
                        $('[aria-describedby="dialog_delete"]').css('z-index',1002);
                        $(".ui-widget-overlay").css('z-index', 1001);
                    },
                    buttons: dialog_buttons
                });
            } else {
                for (var i = 0, len = dui.multiSelectedWidgets.length; i < len; i++) {
                    dui.delWidget(dui.multiSelectedWidgets[i]);
                }
                dui.delWidget(dui.activeWidget);
                // dui.clearWidgetHelper(); - will be done in inspectWidget("none")
                dui.inspectWidget("none");
            }
            return true;
        } else {
            return false;
        }
    },
    onButtonArrows: function (key, isSize, factor) {
        factor = factor || 1;
        var $focused = $(':focus');
        if (!$focused.length && dui.activeWidget) {
            var what = null;
            var shift = 0;
            if (isSize) {
                if (key == 39) {
                    //Right
                    what = "width";
                    shift = 1;
                } else if (key == 37) {
                    // Left
                    what = "width";
                    shift = -1;
                } else if (key == 40) {
                    // Down
                    what = "height";
                    shift = 1;
                } else if (key == 38) {
                    // Up
                    what = "height";
                    shift = -1;
                }
            } else {
                if (key == 39) {
                    //Right
                    what = "left";
                    shift = 1;
                } else if (key == 37) {
                    // Left
                    what = "left";
                    shift = -1;
                } else if (key == 40) {
                    // Down
                    what = "top";
                    shift = 1;
                } else if (key == 38) {
                    // Up
                    what = "top";
                    shift = -1;
                }

            }

            shift = shift * factor;

            for (var i = -1, len = dui.multiSelectedWidgets.length; i < len; i++) {
                var widgetId;
                if (i == -1) {
                    widgetId = dui.activeWidget;
                } else {
                    widgetId = dui.multiSelectedWidgets[i];
                }
                var $actualWidget = $('#' + widgetId);
                if (dui.views[dui.activeView].widgets[widgetId].style[what] === undefined && $actualWidget.length) {
                    dui.views[dui.activeView].widgets[widgetId].style[what] = $actualWidget.css(what);
                }
                dui.views[dui.activeView].widgets[widgetId].style[what] = parseInt(dui.views[dui.activeView].widgets[widgetId].style[what], 10) + shift;
                if ($actualWidget.length) {
                    var setCss = {};
                    setCss[what] = dui.views[dui.activeView].widgets[widgetId].style[what];
                    $actualWidget.css(setCss);
                    if (i == -1) {
                        $("#widget_helper").css({
                            left:   parseInt($actualWidget.css("left")) - 2,
                            top:    parseInt($actualWidget.css("top"))  - 2,
                            height: $actualWidget.outerHeight() + 2,
                            width:  $actualWidget.outerWidth() + 2
                        });
                    } else {
                        $("#widget_multi_helper_" + widgetId).css({
                            left:   parseInt($actualWidget.css("left")) - 2,
                            top:    parseInt($actualWidget.css("top"))  - 2,
                            height: $actualWidget.outerHeight() + 2,
                            width:  $actualWidget.outerWidth() + 2
                        });
                    }
                }
            }

            dui.allWidgetsHelper();

            if (dui.delayedSettings) {
                clearTimeout(dui.delayedSettings);
            }
            dui.delayedSettings = _setTimeout(function(widgetId) {
                // Save new settings
                var mWidget = document.getElementById(widgetId);
                if ((what == 'top' || what== 'left') && mWidget._customHandlers && mWidget._customHandlers.onMoveEnd) {
                    mWidget._customHandlers.onMoveEnd(mWidget, widgetId);
                } else
                if (mWidget._customHandlers && mWidget._customHandlers.onCssEdit) {
                    mWidget._customHandlers.onCssEdit(mWidget, widgetId);
                }

                if (mWidget._customHandlers && mWidget._customHandlers.isRerender) {
                    dui.reRenderWidgetEdit(widgetId);
                }
                dui.inspectWidget(widgetId, true);
                var multiSelectedWidgets = dui.multiSelectedWidgets;
                dui.multiSelectedWidgets = [];
                for (var i = 0, len = multiSelectedWidgets.length; i < len; i++) {
                    mWidget = document.getElementById(multiSelectedWidgets[i]);

                    if ((what == 'top' || what== 'left') && mWidget._customHandlers && mWidget._customHandlers.onMoveEnd) {
                        mWidget._customHandlers.onMoveEnd(mWidget, multiSelectedWidgets[i]);
                    } else
                    if (mWidget._customHandlers && mWidget._customHandlers.onCssEdit) {
                        mWidget._customHandlers.onCssEdit(mWidget, multiSelectedWidgets[i]);
                    }
                    if (mWidget._customHandlers && mWidget._customHandlers.isRerender) {
                        dui.reRenderWidgetEdit(multiSelectedWidgets[i]);
                    }
                    dui.inspectWidgetMulti(multiSelectedWidgets[i]);
                }
                dui.delayedSettings = null;

            }, 1000, dui.activeWidget);

            dui.save();

            return true;
        } else {
            return false;
        }
    },
    onPageClosing: function () {
        // If not saved
        if (this._saveTimer) {
            if (confirm(this.translate("Changes are not saved. Are you sure?"))) {
                return null;
            } else {
                return "Configuration not saved.";
            }
        }
        return null;
    }
});

$(document).keydown(function (e) {
    // Capture ctrl-z (Windows/Linux) and cmd-z (MacOSX)
    if (e.which === 90 && (e.ctrlKey || e.metaKey)) {
        dui.undo();
        e.preventDefault();
    } else if (e.which === 65 && (e.ctrlKey || e.metaKey)) {
        // Ctrl+A
        if (dui.selectAll()) {
            e.preventDefault();
        };
    } else if (e.which === 27) {
        // Esc
        if (dui.deselectAll()) {
            e.preventDefault();
        }
    }else if (e.which === 46) {
        // Capture Delete button
        if (dui.onButtonDelete()) {
            e.preventDefault();
        }
    } else
    // Capture down, up, left, right for shift
    if (e.which === 37 || e.which === 38 || e.which === 40 || e.which === 39) {
        if (dui.onButtonArrows(e.which, e.shiftKey, (e.ctrlKey || e.metaKey ? 10 : 1))) {
            e.preventDefault();
        }
    }
});

// Copy paste mechanism
$(window).on("paste", function (e) {
    dui.paste();
}).on("copy cut", function (e) {
    dui.copy(e.type == "cut");
});

window.onbeforeunload = function() {
    return dui.onPageClosing();
};

$(document).ready(function () {
    dui.translateAll();
});
