/**
 *  ioBroker.vis
 *  https://github.com/hobbyquaker/vis/
 *
 *  Copyright (c) 2013-2014 bluefox https://github.com/GermanBluefox, hobbyquaker https://github.com/hobbyquaker
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */

// visEdit - the ioBroker.vis Editor

"use strict";
var dockManager;

vis = $.extend(true, vis, {
    toolbox:                $("#vis_editor"),
    selectView:             $("#select_view"),
    activeWidget:           '',
    isStealCss:             false,
    gridWidth:              undefined,
    undoHistoryMaxLength:   50,
    multiSelectedWidgets:   [],
    clipboard:              null,
    undoHistory:            [],
    selectable:             true,
    groupsState:            {'fixed': true, 'common': true},
    // Array with all objects (Descriptions of objects)
    objects:                null,

    renameView: function (newName) {
            vis.views[newName] = $.extend(true, {}, vis.views[vis.activeView]);
            $("#vis_container").hide();
            delete vis.views[vis.activeView];
            vis.activeView = newName;
            vis.renderView(newName);
            vis.changeView(newName);
            vis.saveRemote(function () {
                window.location.reload();
            });
    },
    delView: function (view) {
        if (confirm(_("Really delete view %s?", view))) {
            delete vis.views[view];
            vis.saveRemote(function () {
                window.location.href = "edit.html" + window.location.search;
            });
           }
    },
    dupView: function (val) {
        vis.views[val] = $.extend(true, {}, vis.views[vis.activeView]);

        // Allen Widgets eine neue ID verpassen...
        for (var widget in vis.views[val].widgets) {
            vis.views[val].widgets[vis.nextWidget()] = vis.views[val].widgets[widget];
            delete vis.views[val].widgets[widget];
        }
        vis.saveRemote(function () {
            vis.renderView(val);
            vis.changeView(val);
            window.location.reload();
        });
    },
    exportView: function (isAll) {
        var exportView = $.extend(true, {}, isAll ? vis.views : vis.views[vis.activeView]);
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
        var name = vis.checkNewView($("#name_import_view").val());
        var importObject;
        if (name === false) return;
        try {
            var text = $("#textarea_import_view").val();
            importObject = JSON.parse(text);
        } catch (e) {
            alert(_("invalid JSON") + "\n\n"+e);
            return;
        }
        if (isAll) {
            vis.views = importObject;
            vis.saveRemote(function () {
                window.location.reload();
            });
        } else {
            vis.views[name] = importObject;

            // Allen Widgets eine neue ID verpassen...
            for (var widget in vis.views[name].widgets) {
                vis.views[name].widgets[vis.nextWidget()] = vis.views[name].widgets[widget];
                delete vis.views[name].widgets[widget];
            }
            vis.saveRemote(function () {
                vis.renderView(name);
                vis.changeView(name);
                window.location.reload();
            });
        }
    },
    checkNewView: function (name) {
        name = name || $("#new_view_name").val().trim();
        if (name == '') {
            alert(_("Please enter the name for the new view!"));
            return false;
        } else if (vis.views[name]) {
            alert(_("The view with the same name yet exists!"));
            return false;
        } else {
            return name;
        }
    },
    nextWidget: function () {
        var next = 1;
        var used = [];
        var key = "w" + (("000000" + next).slice(-5));
        for (var view in vis.views) {
            for (var wid in vis.views[view].widgets) {
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
		for (var v in vis.views) {
			if (vis.views[v] && vis.views[v].widgets && vis.views[v].widgets[id]) {
				view = v;
				break;
			}
		}
		return view;
	},
	getViewsOfWidget: function (id) {
		if (id.indexOf('_') == -1) {
			var view = vis.getViewOfWidget(id);
			if (view) {
				return [view];
			} else {
				return [];
			}
		} else {
			var wids = id.split('_', 2);
			var wid = wids[0];
			var result = [];
			for (var v in vis.views) {
				if (vis.views[v].widgets[wid+'_'+v] !== undefined) {
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
			var views = vis.getViewsOfWidget(id);
			var wids = id.split('_', 2);
			for (var i = 0; i < views.length; i++) {
				vis.delWidgetHelper(wids[0] + '_' + views[i], false);
			}
			vis.inspectWidget("none");
			return;
		}

        var $select_active_widget = $('#select_active_widget');
        $select_active_widget.find('option[value="' + id + '"]').remove();
        $select_active_widget.multiselect('refresh');

		var view = vis.getViewOfWidget(id);
		
		var widget_div = document.getElementById(id);
		if (widget_div && widget_div.visCustomEdit && widget_div.visCustomEdit['delete']) {
			widget_div.visCustomEdit['delete'](id);
		}

        if (widget_div && widget_div._customHandlers && widget_div._customHandlers.onDelete) {
            widget_div._customHandlers.onDelete(widget_div, id);
        }

		$("#"+id).remove();
		if (view) {
			delete(vis.views[view].widgets[id]);
		}
		if (vis.widgets[id]) {
			delete vis.widgets[id]; 
			var widgets = [];
			// Delete old from array
			for (var w in vis.widgets) {
				if (w != id) {
					widgets[w] = vis.widgets[w];
				}
			}
			vis.widgets = widgets;
		}
	},
	delWidget: function (widget, noSave) {
        if (typeof widget != "string") {
            widget = null;
        }
        if (!widget) {
            vis.clearWidgetHelper();
        }
		vis.delWidgetHelper(widget || vis.activeWidget, true);
		if (!noSave) {
            vis.save();
        }
        if (!widget) {
            vis.inspectWidget("none");
        }
    },
    bindWidgetClick: function (id) {

        $("#" + id).click(function (e) {
            if (vis.dragging) return;

            var widgetId = $(this).attr('id');
            var widgetData = vis.widgets[widgetId]["data"];
            //console.log("click id="+widgetId+" active="+vis.activeWidget);
            //console.log(vis.multiSelectedWidgets);
            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                if (vis.activeWidget && vis.activeWidget != "none" && vis.activeWidget != widgetId) {
                    if (vis.multiSelectedWidgets.indexOf(widgetId) != -1) {
                        //console.log("splice "+id)
                        vis.multiSelectedWidgets.splice(vis.multiSelectedWidgets.indexOf(widgetId), 1);
                        var $widget = $("#" + widgetId);
                        $widget.removeClass("ui-selected");

                        //console.log("-> "+vis.multiSelectedWidgets);
                        vis.allWidgetsHelper();
                        $("#widget_multi_helper_"+widgetId).remove();
                        if ($widget.hasClass("ui-draggable")) {
                            try {
                                $widget.draggable("destroy");
                            } catch (e) {
                                servConn.logError('inspectWidget - Cannot destroy draggable ' + widgetId + ' ' + e);
                            }
                        }
                    } else {
                        vis.inspectWidgetMulti(widgetId);
                    }
                } else if (vis.activeWidget == widgetId && vis.multiSelectedWidgets.length) {
                    //console.log("click inspected Widget",widgetId, vis.multiSelectedWidgets);

                    var newActive = vis.multiSelectedWidgets.pop();
                    var multiSelectedWidgets = vis.multiSelectedWidgets;
                    $("#widget_multi_helper_"+newActive).remove();
                    $("#" + newActive).removeClass("ui-selected");
                    vis.inspectWidget(newActive);
                    for (var i = 0; i < multiSelectedWidgets.length; i++) {
                        vis.inspectWidgetMulti(multiSelectedWidgets[i]);
                    }
                    vis.allWidgetsHelper();

                }
            } else {
                if (vis.activeWidget != widgetId) {
                    vis.inspectWidget(widgetId);
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
		var isViewExist    = (document.getElementById("visview_"+view) != null);
        var renderVisible  = data.renderVisible;

        if (renderVisible) delete data.renderVisible;

		if (view === undefined) view = this.activeView;
		
        if (isSelectWidget && !isViewExist) {

            this.renderView(view, true, false);
			isViewExist = true;
        }
		
		if (isSelectWidget) {
            this.clearWidgetHelper();
		}

        var widgetId = wid || this.nextWidget();

        this.widgets[widgetId] = {
			wid: widgetId,
			data: new can.Map($.extend({
				"wid":      widgetId,
				"title":    undefined,
				"subtitle": undefined,
				"html":     undefined,
				"hm_id":    'nothing_selected',
				"hm_wid":   undefined,
				"factor":   1,
				"digits":   '',
				"min":      0,
				"max":      1,
				"step":     0.01,
				off_text:   undefined,
				on_text:    undefined,
				buttontext: undefined
			}, data))
		};

        if (renderVisible) this.widgets[widgetId].renderVisible = true;

        if (isViewExist) {
			$("#visview_"+view).append(can.view(tpl, {
                hm:   this.states[this.widgets[widgetId].data.oid + '.Value'],
                ts:   this.states[this.widgets[widgetId].data.oid + '.TimeStamp'],
                ack:  this.states[this.widgets[widgetId].data.oid + '.Certain'],
                lc:   this.states[this.widgets[widgetId].data.oid + '.LastChange'],
                data: this.widgets[widgetId]["data"],
                view: view
            }));
		}

        this.views[view].widgets           = this.views[view].widgets || {};
        this.views[view].widgets[widgetId] = this.views[view].widgets[widgetId] || {};
		
        var $jWidget = $('#' + widgetId);
        style = style || this.findFreePosition(view, widgetId, null, $jWidget.width(), $jWidget.height());

		if(this.views[view].widgets[widgetId].data !== undefined) {
			data = $.extend(data, this.views[view].widgets[widgetId].data, true);
		}

        vis.views[view].widgets[widgetId] = {
            tpl:        tpl,
            data:       data,
            style:      style,
            widgetSet:  $("#" + tpl).attr("data-vis-set")
        };

        if (renderVisible) this.views[view].widgets[widgetId].renderVisible = true;

        if (style) $jWidget.css(style);

	    if (isSelectWidget && this.binds.jqueryui) {
            this.binds.jqueryui._disable();
	    }

		if (isSelectWidget) {
            this.activeWidget = widgetId;
            this.actionNewWidget(widgetId);
		}

        if (!noSave) this.save();

        this.bindWidgetClick(widgetId);

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
            targetView = vis.activeView;
            activeView = widget.view;
            tpl = objWidget.tpl;
            data = objWidget.data;
            style = objWidget.style;
            widget.view = vis.activeView;
        } else {
            activeView = vis.activeView;
            targetView = $("#select_view_copy option:selected").val();
        //console.log(activeView + "." + vis.activeWidget + " -> " + targetView);
            tpl = vis.views[vis.activeView].widgets[vis.activeWidget].tpl;
            data = $.extend({}, vis.views[vis.activeView].widgets[vis.activeWidget].data);
            style = $.extend({}, vis.views[vis.activeView].widgets[vis.activeWidget].style);
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
            vis.activeWidget = vis.addWidget(tpl, data, style, undefined, undefined, undefined, noSave);

            $('#select_active_widget').append("<option value='"+vis.activeWidget+"'>"+vis.activeWidget+" ("+$("#"+vis.views[vis.activeView].widgets[vis.activeWidget].tpl).attr("data-vis-name")+")</option>")
            .multiselect('refresh');

            if (!widget || !widget.widget) {
                setTimeout(function () {
                    vis.inspectWidget(vis.activeWidget);
                    if (!noSave) {
                        vis.save();
                    }
                }, 50);
            }
        } else {
            if ($("#vis_container").find("#visview_"+targetView).html() == undefined) {
                vis.renderView(targetView, true, true);
            }
            vis.addWidget(tpl, data, style, vis.nextWidget(), targetView, true);
            if (!noSave) {
                vis.save();
            }
            if (!widget || !widget.widget) {
                vis.showHint(_("Widget copied to view %s", targetView) + ".", 30000);
            }
        }
    },
    renameWidget: function (oldId, newId) {
		// find view of this widget
		var view = this.getViewOfWidget(oldId);
		
		// create new widget with the same properties
		if (view) {
            var widgetData = this.views[view].widgets[oldId];
            this.addWidget(widgetData.tpl, widgetData.data, widgetData.style, newId, view);
            $('#select_active_widget').append('<option value=' + newId + '">' + this.getWidgetName(view, newId) + '</option>')
            .multiselect('refresh');

            this.delWidgetHelper(oldId, false);
		}
        this.inspectWidget(newId);
        this.save();
	},
    reRenderWidgetEdit: function (wid) {
        this.reRenderWidget(wid);
        if (wid == this.activeWidget) {
            var $wid = $('#'+wid);
            // User interaction
            if (!vis.widgets[wid].data._no_move) {
                vis.draggable($wid);
            }
            if (!vis.widgets[wid].data._no_resize) {
                vis.resizable($wid);
            }            
        }
    },
    getObjDesc: function (id) {
        if (this.objects[id] && this.objects[id].common && this.objects[id].common.name) {
            return this.objects[id].common.name;
        }
            /*var parent = "";
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
        }*/
        return id;
    },
	// find this wid in all views,
	// delete where it is no more exist, 
	// create where it should exist and
	// sync data
	syncWidget: function (id, views) {
		// find view of this widget
		var view = vis.getViewOfWidget(id);
		
		if (views === undefined) {
			views = vis.getViewsOfWidget(id);
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
			for (var v_ in vis.views) {
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
				
				if (vis.views[v_].widgets[wid+'_'+v_] !== undefined) {
					vis.delWidgetHelper(wid+'_'+v_, false);
				}
				
				if (isFound) {	
					// Create 
					vis.addWidget(vis.views[view].widgets[id].tpl, vis.views[view].widgets[id].data, vis.views[view].widgets[id].style, wid+'_'+v_, v_);
				}
			}
			
			
			if (views.length < 2 && (id.indexOf('_') != -1)) {
				// rename this widget from "wid_view" to "wid"
				var wids = id.split('_', 2);
				vis.renameWidget(id, wids[0]);
			} else if (views.length > 1 && (id.indexOf('_') == -1)) {
				vis.renameWidget(id, id + '_' + view);
			}
		}
	},
    editObjectID: function (widget, wid_attr, widgetFilter) {
        var that = this;
        // Edit for Object ID
        var line = [
            {
                input: '<input type="text" id="inspect_' + wid_attr + '">',
                button: {
                    icon:  'ui-icon-note',
                    text:  false,
                    title: _('Select object ID'),
                    click: function () {
                        var attr   = $(this).data('data-attr');
                        var view   = $(this).data('data-view');
                        var widget = $(this).data('data-widget');

                        $('#dialog-select-member-' + attr).selectId('show', that.views[view].widgets[widget].data[attr], function (newId, oldId) {
                            if (oldId != newId) {
                                $("#inspect_" + attr).val(newId);
                                $("#inspect_" + attr).trigger('change');

                                if (document.getElementById('inspect_hm_wid')) {
                                    if (that.objects[newId]["Type"] !== undefined && that.objects[value]["Parent"] !== undefined &&
                                        (that.objects[newId]["Type"] == "STATE" ||
                                            that.objects[newId]["Type"] == "LEVEL")) {

                                        var parent = that.objects[newId]["Parent"];
                                        if (that.objects[parent]["DPs"] !== undefined &&
                                            that.objects[parent]["DPs"]["WORKING"] !== undefined) {
                                            $("#inspect_hm_wid").val(that.objects[parent]["DPs"]["WORKING"]);
                                            $("#inspect_hm_wid").trigger('change');
                                        }
                                    }
                                }

                                // Try to find Function of the device and fill the Filter field
                                var $filterkey = $('#inspect_filterkey');
                                if ($filterkey.length) {
                                    if ($filterkey.val() == '') {
                                        var oid = newId;
                                        var func = null;
                                        if (that.metaIndex && that.metaIndex["ENUM_FUNCTIONS"]) {
                                            while (oid && that.objects[oid]) {
                                                for (var t = 0; t < that.metaIndex["ENUM_FUNCTIONS"].length; t++) {
                                                    var list = that.objects[that.metaIndex["ENUM_FUNCTIONS"][t]];
                                                    for (var z = 0; z < list['Channels'].length; z++) {
                                                        if (list['Channels'][z] == oid) {
                                                            func = list.Name;
                                                            break;
                                                        }
                                                    }
                                                    if (func) break;
                                                }
                                                if (func) break;

                                                oid = that.objects[oid]['Parent'];
                                            }
                                        }
                                        if (func) $filterkey.val(func).trigger('change');
                                    }
                                }
                            }
                        });
                    }
                },
                onchange: function (val) {
                    var attr     = $(this).data('data-attr');
                    $("#inspect_" + attr + "_desc").html(that.getObjDesc(val));
                }
            },
            {
                input: '<div id="inspect_' + wid_attr + '_desc"></div>'
            }
        ];

        // Init select dialog
        if (!$('#dialog-select-member-' + wid_attr).length) {
            $('body').append('<div id="dialog-select-member-' + wid_attr + '" style="display:none">');
            $('#dialog-select-member-' + wid_attr).selectId('init', {
                texts: {
                    select:   _('Select'),
                    cancel:   _('Cancel'),
                    all:      _('All'),
                    id:       _('ID'),
                    name:     _('Name'),
                    role:     _('Role'),
                    room:     _('Room'),
                    value:    _('Value'),
                    selectid: _('Select ID')
                },
                imgPath: '/lib/css/fancytree/',
                objects: this.objects,
                states:  this.states,
                zindex:  1001
            });
        }

        return line;
    },
    editSelect: function (widget, wid_attr, values) {
        // Select
        var text = '<tr id="option_' + wid_attr + '" class="vis-add-option"><td class="vis-edit-td-caption">' + _(wid_attr) + ':</td><td><select id="inspect_' + wid_attr + '">';
        for (var t = 0; t < values.length; t++) {
            text += "<option value='" + values[t] + "' " + ((values[t] == widget.data[wid_attr]) ? 'selected' : '') + ">" + _(values[t]) + "</option>";
        }
        text += "</select></td></tr>";
        $('#widget_attrs').append(text);
    },
    editFontName: function (widget, wid_attr) {
        // Select
        var values = ['', "Arial", "Times", "Andale Mono", "Comic Sans", "Impact"];
        vis.editSelect(widget, wid_attr, values);
    },
    editColor: function (widget, wid_attr) {
        var line = {
            input:  '<input type="text" id="inspect_' + wid_attr + '"/>'
        };
        if ((typeof colorSelect != 'undefined' && $().farbtastic)) {
            line.button = {
                icon:  'ui-icon-note',
                text:  false,
                title: _('Select color'),
                click: function (/*event*/) {
                    var data = $(this).data('data-attr');
                    var _settings = {
                        current:     $('#inspect_' + data).val(),
                        onselectArg: data,
                        onselect:    function (img, _data) {
                            $('#inspect_' + _data).val(colorSelect.GetColor()).trigger('change');
                        }};

                    colorSelect.show(_settings);
                }
           };
        }
        return line;
    },
    editViewName: function (widget, wid_attr) {
        var that = this;
        var line = {
            input: '<input type="text" id="inspect_' + wid_attr + '"/>',
            init:  function (attr, val) {
                // autocomplete for filter key
                var $attr = $('#inspect_' + attr);

                if ($attr.length) {
                    $attr.data('data_save', function () {
                        var $this = $(this);

                        if ($this.data('timer')) clearTimeout($this.data('timer'));

                        $this.data('timer', _setTimeout(function (elem_) {
                            // If really changed
                            var $this = $(elem_);
                            var attr   = $this.data('data-attr');
                            var view   = $this.data('data-view');
                            var widget = $this.data('data-widget');
                            that.widgets[widget].data.attr(attr, $this.val());
                            that.views[view].widgets[widget].data[attr] = $this.val();
                            that.reRenderWidgetEdit(widget);
                            that.save();
                        }, 200, this));
                    });

                    $attr.autocomplete({
                        minLength: 0,
                        source: function (request, response) {
                            var views = [];
                            for (var v in that.views) {
                                views[views.length] = v;
                            }

                            var data = $.grep(views, function (value) {
                                return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
                            });

                            response(data);
                        },
                        select: function (/*event, ui*/) {
                            $(this).data('data_save').call(this);
                        },
                        change: function (/*event, ui*/) {
                            $(this).data('data_save').call(this);
                        }
                    }).focus(function () {
                        $(this).autocomplete("search", '');
                    }).keyup(function () {
                        $(this).data('data_save').call(this);
                    });
                }
            }
        };

        return line;
    },
    editEffects: function (widget, wid_attr) {
        // Effect selector
        $('#widget_attrs').append('<tr nowrap id="option_' + wid_attr + '" class="vis-add-option"><td class="vis-edit-td-wid_attr">' + _(wid_attr.split("_")[0] + " effect") + ':</td><td><input type="text" id="inspect_' + wid_attr + '" size="34"/></td></tr>');

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
                    var attr = $this.attr('id').slice(8);
                    vis.widgets[vis.activeWidget].data.attr(attr, $this.val());
                    vis.views[vis.activeView].widgets[vis.activeWidget].data[attr] = $this.val();
                    vis.save();
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
                $(this).autocomplete("search", '');
            }).keyup(function () {
                this._save();
            }).val(widget.data[wid_attr]);
        }
    },
    editEffects_opt: function (widget, wid_attr) {
        // Effect selector
        $('#widget_attrs').append('<tr nowrap id="option_' + wid_attr + '" class="vis-add-option"><td class="vis-edit-td-wid_attr">' + _(wid_attr.split("_")[0] + " opt.") + ':</td><td><input type="text" id="inspect_' + wid_attr + '" size="34"/></td></tr>');

        // autocomplete for filter key
        var elem = document.getElementById('inspect_' + wid_attr);
        if (elem) {
            elem._save = function () {
                if (this.timer)
                    clearTimeout(this.timer);

                this.timer = _setTimeout(function (elem_) {
                    // If really changed
                    var $this = $(elem_);
                    var attr = $this.attr('id').slice(8);
                    vis.widgets[vis.activeWidget].data.attr(attr, $this.val());
                    vis.views[vis.activeView].widgets[vis.activeWidget].data[attr] = $this.val();
                    vis.save();
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
                $(this).autocomplete("search", '');
            }).keyup(function () {
                this._save();
            }).val(_(widget.data[wid_attr]));

            var $sel = $('#inspect_' + wid_attr.split('_eff_opt')[0] + ('_effect'));
            choice_opt($sel.val());

            $sel.change(function (event, data) {
                choice_opt(data)
            });
        }

        function choice_opt(_data) {
            if (_data == 'slide') {
                $('#option_' + wid_attr).show();
                $(elem).autocomplete('option', 'source', [
                    {label: _('left'),  value:'left'},
                    {label: _('right'), value:'right'},
                    {label: _('up'),    value:'up'},
                    {label: _('down'),  value:'down'}
                ]);
            } else {
                $(elem).autocomplete('option', 'source', ['']);
                widget.data[wid_attr] = '';
                $('#option_' + wid_attr).hide();
            }
        }
    },
    hr: function (widget, wid_attr) {
        // Effect selector
        $('#widget_attrs').append('<tr class="vis-add-option"><td colspan="2" class="vis-edit-td-wid_attr"><hr></td></tr>');
    },
    br: function (widget, wid_attr) {
        // Effect selector
        $('#widget_attrs').append('<tr class="vis-add-option"><td colspan="2" class="vis-edit-td-wid_attr">&nbsp</td></tr>');
    },
    editImage: function (widget, wid_attr) {
        var that = this;
        // Image src
        $('#widget_attrs').append('<tr id="option_' + wid_attr + '" class="vis-add-option"><td>' + _(wid_attr) + ':</td><td><input type="text" id="inspect_' + wid_attr + '" size="34"/><input type="button" id="inspect_' + wid_attr + '_btn" value="..."></td></tr>');

        // Filemanager Dialog
        $("#inspect_" + wid_attr + "_btn").click(function () {
                $.fm({
                    root:          "www/",
                    lang:          that.language,
                    path:          "www/vis/img/",
                    file_filter:   ["gif","png", "bmp", "jpg", "jpeg", "tif", "svg"],
                    folder_filter: false,
                    mode:          "open",
                    view:          "prev"

                },function(_data){
                    var src = _data.path.split("www")[1] + _data.file;
                    $("#inspect_" + wid_attr).val(src).trigger('change');
                });
        });
    },
    editUrl: function (widget, wid_attr) {
        // Image src
        $('#widget_attrs').append('<tr id="option_' + wid_attr + '" class="vis-add-option"><td>' + _(wid_attr) + ':</td><td><input type="text" id="inspect_' + wid_attr + '" size="34"/><input type="button" id="inspect_' + wid_attr + '_btn" value="..."></td></tr>');

        // Filemanager Dialog
        $('#inspect_' + wid_attr + '_btn').click(function () {

            $.fm({
                root:          "www/",
                lang:          this.language ,
                path:          "www/vis/img/",
                file_filter:   ["mp3", "wav", "ogg"],
                folder_filter: false,
                mode:          "open",
                view:          "table"

            },function(_data){
                var url = _data.path.split('www')[1] + _data.file;
                $('#inspect_' + wid_attr).val(url).trigger('change');
            });
        });
    },
    editSlider: function (widget, wid_attr, min, max, step) {
        min = (min === undefined || min === null || min == '') ? 0 : parseFloat(min);
        max = (max === undefined || max === null || max == '') ? 0 : parseFloat(max);
        step = (!step) ? (max - min) / 100 : parseFloat(step);
        // Image src
        $('#widget_attrs').append('<tr id="option_'+wid_attr+'" class="vis-add-option"><td>'+_(wid_attr)+':</td><td><table style="width:100%" class="vis-no-spaces"><tr class="vis-no-spaces"><td  class="vis-no-spaces" style="width:50px"><input type="text" id="inspect_'+wid_attr+'" size="5"/></td><td  class="vis-no-spaces" style="width:20px">'+min+'</td><td><div id="inspect_'+wid_attr+'_slider"></div></td><td  class="vis-no-spaces" style="width:20px;text-align:right">'+max+'</td></tr></table></td></tr>');

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
                    var attr = $this.attr('id').slice(8);
                    var text = $("#inspect_"+wid_attr);
                    if (text.val() != value) {
                        text.val(value).trigger('change');
                    }
                }, 200, this, ui.value);*/
                var $this = $(this);
                var text = $("#inspect_"+wid_attr);
                if (text.val() != ui.value) {
                    text.val(ui.value).trigger('change');
                }
            }
        });
        var inspect = $("#inspect_"+wid_attr);

        inspect.val(widget.data[wid_attr]);

        inspect.change(function () {
            var attribute = $(this).attr('id').slice(8);
            var val = $(this).val();
            var slider = $( "#inspect_"+wid_attr+"_slider");
            if (slider.slider("option", "value") != val) {
                slider.slider("option", "value", val);
            }
            vis.widgets[vis.activeWidget].data.attr(attribute, val);
            vis.views[vis.activeView].widgets[vis.activeWidget].data[attribute] = val;
            vis.save();
            vis.reRenderWidgetEdit(vis.activeWidget);
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
        if (vis.multiSelectedWidgets.indexOf(id) == -1 && id != vis.activeWidget) {
            vis.multiSelectedWidgets.push(id);
        }

        $("#vis_container").append('<div id="widget_multi_helper_'+id+'" class="widget_multi_helper"><div class="widget_multi_inner_helper"></div></div>');

        $("#widget_multi_helper_"+id).css({
            left   : pos.left - 2,
            top    : pos.top - 2,
            height : $this.outerHeight() + 2,
            width  : $this.outerWidth() + 2}
        ).show();
        vis.allWidgetsHelper();
        vis.draggable($this);

    },
    addToInspect: function (widget, _wid_attr, group, options, onchange) {
        // Format: attr_name(start-end)[default_value]/type
        // attr_name can be extended with numbers (1-2) means it will be attr_name1 and attr_name2 created
        // defaultValue: If defaultValue has ';' it must be replaced by §
        // Type format: id - Object ID Dialog
        //              checkbox
        //              image - image
        //              number[,min,max] - non-float number
        //              color - color picker
        //              views - Name of the view
        //              effect - jquery UI show/hide effects
        //              eff_opt - additional option to effect slide (up, down, left, right)
        //              fontName - Font name
        //              slider,min,max,step - Default step is ((max - min) / 100)
        //              select_value1,select_value2,... - dropdown select
        //              hr
        //              br
        if (!this.regexAttr) this.regexAttr = /([a-zA-Z0-9._-]+)(\([0-9-]+\))?(\[.+\])?(\/.+)?/;
        var view        = this.getViewOfWidget(widget)
        var match       = this.regexAttr.exec(_wid_attr);

        var wid_attr    = match[1];
        var wid_repeats = match[2];
        var wid_default = match[3];
        var wid_type    = match[4];
        var index       = '';

        // remove /
        if (wid_type) wid_type = wid_type.substring(1);
        // remove ()
        if (wid_repeats) {
            wid_repeats = wid_repeats.substring(1, wid_repeats.length - 1);
            var parts = wid_repeats.split('-');
            if (parts.length == 2) {
                wid_repeats = {
                    start: parseInt(parts[0], 10),
                    end:   parseInt(parts[1], 10)
                };
                index = wid_repeats.start;
            } else {
                throw 'Invalid repeat argument: ' + wid_repeats;
            }
        }
        // remove []
        if (wid_default) {
            wid_default = wid_default.substring(1, wid_default.length - 1);
            wid_default = wid_default.replace(/§/g, ';');
        } else {
            wid_default = undefined;
        }

        if (typeof group =='function') {
            onchange = group;
            group = null;
        }
        if (typeof options =='function') {
            onchange = options;
            options = null;
        }

        options = options || {};

        group = group || 'common';
        this.groups[group] = this.groups[group] || {};

        /*else if (wid_attr_ === "oid" || type == 'id') {
            vis.editObjectID (widget, wid_attr_, widgetFilter);
        } else if (wid_attr_ === "oid-working") {
            vis.editObjectID (widget, wid_attr_, 'WORKING');
        } else if (wid_attr_.indexOf ("src") == wid_attr_.length - 3 || type == "image") {
            vis.editImage(widget, wid_attr_);
        }else if (wid_attr_  == "url") {
            vis.editUrl (widget, wid_attr_);
        } else if (wid_attr_ === "weoid") {
            // Weather ID
            $('#widget_attrs').append('<tr class="vis-add-option"><td id="option_' + wid_attr_ + '" ></td></tr>');
            $('#inspect_comment_tr').hide();
            $('#inspect_class_tr').hide();
            $('#option_'+wid_attr_).jweatherCity({
                lang: vis.language, currentValue: widget.data[wid_attr_],
                onselect: function (wid, text) {
                    vis.widgets[vis.activeWidget].data.attr('weoid', text);
                    vis.views[vis.activeView].widgets[vis.activeWidget].data['weoid'] = text;
                    vis.save();
                    vis.reRenderWidgetEdit(vis.activeWidget);
                }
            });
        } else
        */
        if (wid_attr == 'color') wid_type = 'color';
        if (wid_attr == 'oid' || wid_attr.match(/^oid-/)) wid_type = 'id';
        if (wid_attr.match(/nav_view$/)) wid_type = 'views';

        var widgetData = this.views[view].widgets[widget].data;
        var input;
        var line;
        do {
            // set default value if attr is empty
            if (wid_default !== undefined && (widgetData[wid_attr + index] === null || widgetData[wid_attr + index] === undefined)) {
                widgetData[wid_attr + index] = wid_default;
                this.reRenderWidgetEdit(widget);
            }

            // Depends on attribute type
            switch (wid_type) {
                case 'id':
                    line = this.editObjectID(widget, (wid_attr + index));
                    break;
                case 'checkbox':
                    // All other attributes
                    line = '<input id="inspect_' + (wid_attr + index) + '" type="checkbox"/>';
                    break;

                case 'select-views':
                    line = '<select multiple="multiple" id="inspect_' + (wid_attr + index) + '" class="select-views"></select>';
                    break;
                case 'color':
                    line = this.editColor(widget, (wid_attr + index));
                    break;
                case 'views':
                    line = this.editViewName(widget, (wid_attr + index));
                    break;
                default:
                    line = '<input type="text" id="inspect_' + (wid_attr + index) + '"/>';
            }
            if (typeof line == 'string') line = {input: line};

            if (line[0]) {
                line[0].attrName  = wid_attr;
                line[0].attrIndex = index;
            } else {
                line.attrName  = wid_attr;
                line.attrIndex = index;
            }

            // <tr><td>title:</td><td><input /></td><td>button</td></tr>
            this.groups[group][wid_attr + index] = line;
        } while (wid_repeats && ((++index) <= wid_repeats.end));
    },
    getWidgetName: function (view, widget) {
        var widgetData = this.views[view].widgets[widget];
        var name = (widgetData.data ? widgetData.data.name : '');
        name = name ? (name + '[' + widget + ']') : widget;
        name += ' (' + $('#' + widgetData.tpl).attr('data-vis-name') + ')';
        return name;
    },
    showInspect: function (view, widget) {
        var $widgetAttrs = $('#widget_attrs');
        var that = this;
        for (var group in this.groups) {
            if (this.groupsState[group] === undefined) this.groupsState[group] = false;
            $widgetAttrs.append('<tr data-group="' + group + '" class="ui-state-default"><td colspan="2">' + _('group_' + group) + '</td><td><button class="group-control" data-group="' + group + '">' + group + '</button></td>')

            for (var wid_attr in this.groups[group]) {
                var line = this.groups[group][wid_attr];
                if (line[0]) line = line[0];
                if (typeof line == 'string') line = {input: line};
                var text = '<tr class="vis-edit-td-caption group-' + group + '"><td>' + _(line.attrName) + (line.attrIndex !== '' ? ('[' + line.attrIndex + ']') : '') + ':</td><td class="vis-edit-td-field"';

                if (!line.button) text += ' colspan="2"'

                text += '>' + line.input + '</td>';

                if (line.button) {
                    if (!line.button.html){
                        text += '<td><button id="inspect_' + wid_attr + '_btn">' + (line.button.text || line.button.title || '') + '</button></td>';
                    } else {
                        text += '<td>' + line.button.html + '</td>';
                    }
                }

                text += '</tr>';

                $widgetAttrs.append(text);

                // Init button
                if (line.button) {
                    // If init function specified => call it
                    if (typeof line.button.code == 'function') {
                        line.button.code(line.button);
                    } else {
                        // init button
                        var $btn = $('#inspect_' + wid_attr + '_btn').button({
                            text: line.button.text || false,
                            icons: {
                                primary: line.button.icon || ''
                            }
                        }).css({width: line.button.width || 22, height: line.button.height || 22});
                        if (line.button.click) $btn.click(line.button.click);
                        if (line.button.data)  $btn.data('data-custom', line.button.data);

                        $btn.data('data-attr',   wid_attr);
                        $btn.data('data-widget', widget);
                        $btn.data('data-view',   view);
                    }
                }

                // Init value
                var $input = $('#inspect_' + wid_attr);

                if ($input.attr('type') == 'text') $input.addClass('vis-edit-textbox');

                // Set the value
                if ($input.attr('type') == 'checkbox') {
                    $input.prop('checked', this.widgets[widget].data[wid_attr]);
                } else {
                    $input.val(this.widgets[widget].data[wid_attr]);
                    $input.keyup(function () {
                        var $this = $(this);
                        var timer = $this.data('timer');
                        if (timer) clearTimeout(timer);

                        $this.data('timer', setTimeout(function () {
                            $this.data('timer', null);
                            $this.trigger('change');
                        }, 500));
                    });
                }
                $input.data('data-attr',   wid_attr);
                $input.data('data-widget', widget);
                $input.data('data-view',   view);
                if (line.onchange) $input.data('data-onchange', line.onchange);
                $input.addClass('vis-inspect-widget');


                if (this.groups[group][wid_attr][0]) {
                    for (var i = 1; i < this.groups[group][wid_attr].length; i++) {
                        text = '<tr class="vis-edit-td-caption group-' + group + '"><td></td><td class="vis-edit-td-field" colspan="2">' + this.groups[group][wid_attr][i].input + '</td>';
                        $widgetAttrs.append(text);
                    }
                }

                // Call on change
                if (typeof line.onchange == 'function') {
                    line.onchange.call($input[0], this.widgets[widget].data[wid_attr]);
                }
                if (typeof line.init == 'function') {
                    line.init.call($input[0], wid_attr, this.widgets[widget].data[wid_attr]);
                }
            }

            // Hide elements
            if (!this.groupsState[group]) $('.group-' + group).hide();
        }

        var that = this;
        $('.vis-inspect-widget').change(function (e) {
            var $this    = $(this);
            var attr     = $this.data('data-attr');
            var widget   = $this.data('data-widget');
            var view     = $this.data('data-view');
            var onchange = $this.data('data-onchange');

            if ($this.attr('type') == 'checkbox') {
                that.widgets[widget].data[attr] = $this.prop('checked');
            } else {
                that.widgets[widget].data[attr] = $this.val();
            }
            that.views[view].widgets[widget].data[attr] = that.widgets[widget].data[attr];

            // Some user adds ui-draggable and ui-resizable as class to widget.
            // The result is DashUI tries to remove draggable and resizable properties and fails
            if (attr == 'class') {
                var val = that.views[view].widgets[widget].data[attr];
                if (val.indexOf("ui-draggable") != -1 || val.indexOf("ui-resizable") != -1) {
                    var vals = val.split(' ');
                    val = '';
                    for (var j = 0; j < vals.length; j++) {
                        if (vals[j] && vals[j] != "ui-draggable" && vals[j] != "ui-resizable") {
                            val += ((val) ? ' ' : '') + vals[j];
                        }
                    }
                    that.views[view].widgets[widget].data[attr] = val;
                    $this.val(val);
                }
            }

            // Update select widget dropdown
            if (attr == 'name') {
                $('#select_active_widget option[value="' + widget + '"]').text(that.getWidgetName(view, widget));
                $('#select_active_widget').multiselect('refresh');
            }

            if (typeof onchange == 'function') onchange.call(this, that.widgets[widget].data[attr]);

            that.save();
            that.reRenderWidgetEdit(widget);
        });
        
        $('.group-control').each(function () {
            var group = $(this).attr('data-group');
            $(this).button({
                text: false,
                icons: {
                    primary: that.groupsState[group] ? "ui-icon-triangle-1-n" : "ui-icon-triangle-1-s"
                }
            }).css({width: 22, height: 22}).click(function () {
                var group = $(this).attr('data-group');
                that.groupsState[group] = !that.groupsState[group];
                $(this).button("option", {
                    icons: { primary: that.groupsState[group] ? "ui-icon-triangle-1-n" : "ui-icon-triangle-1-s"}
                });
                if (that.groupsState[group]) {
                    $('.group-' + group).show();
                } else {
                    $('.group-' + group).hide();
                }
                if (typeof storage != 'undefined') {
                    storage.set('groups', JSON.stringify(that.groupsState));
                }
            });
        });
    },
    inspectWidget: function (wid, onlyUpdate) {
        if (vis.isStealCss) return false;

        // find view
        var view = this.getViewOfWidget(wid);

        if (!onlyUpdate) {
            $(".widget_multi_helper").remove();
            vis.multiSelectedWidgets = [];
            $("#allwidgets_helper").hide();

            $('#select_active_widget').find('option[value="' + wid + '"]').prop('selected', true);
            $('#select_active_widget').multiselect('refresh');

            // Remove selection from all widgets and remove resizable and draggable properties
            $(".vis-widget").each(function () {
                var $this = $(this);
                $this.removeClass("vis-widget-edit");

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

        var $widgetAttrs = $('#widget_attrs');
        this.groups = {};
        // Clear Inspector
        $widgetAttrs.html('');
            //.html('<tr><th class="widgetAttrs_header"></th><th></th></tr>');

        $(".vis-inspect-css").each(function () {
            $(this).val('');
        });

        if (!wid || wid === 'none') {
            vis.clearWidgetHelper();

            vis.activeWidget = null;
            return false;
        }

        this.activeWidget = wid;
        var widget = vis.views[vis.activeView].widgets[wid];

        if (!widget) {
            console.log('inspectWidget ' + wid + ' undefined');
            return false;
        }

        // Fill Inspector


        // Fill the css values
        $(".vis-inspect-widget").each(function () {
            var $this_ = $(this);
            var attr = $this_.attr('id').slice(8);
            if (vis.views[vis.activeView].widgets[vis.activeWidget] && vis.views[vis.activeView].widgets[vis.activeWidget].data) {
                $this_.val(vis.views[vis.activeView].widgets[vis.activeWidget].data[attr]);
            }
        });

        if (!widget.tpl) return false;

        var $widgetTpl = $("#" + widget.tpl);
        if (!$widgetTpl) {
            console.log(widget.tpl + " is not included");
            return false;
        }
        var widgetAttrs  = $widgetTpl.attr('data-vis-attrs').split(";");
        var widgetFilter = $widgetTpl.attr('data-vis-filter');

        $('#inspect_comment_tr').show();
        $('#inspect_class_tr').show();
        var widgetDiv = document.getElementById(vis.activeWidget);

        $widgetAttrs.css({"width": "100%"});


        // Add fixed attributes
        var group = 'fixed';
        this.addToInspect(wid, 'name',      group);
        this.addToInspect(wid, 'comment',   group);
        this.addToInspect(wid, 'class',     group);
        this.addToInspect(wid, 'filterkey', group);
        this.addToInspect(wid, 'views/select-views', group);

        // Edit all attributes
        group = 'common';
        for (var i = 0; i < widgetAttrs.length; i++) {
            if (widgetAttrs[i].match(/^group\./)) {
                group = widgetAttrs[i].substring('group.'.length);
                continue;
            }
            if (widgetAttrs[i] != '') this.addToInspect(wid, widgetAttrs[i], group);
            continue;

            if (widgetAttrs[attr] != '') {
                // Format: attr_name(start-end)[default_value]/type
                // attr_name can be extended with numbers (1-2) means it will be attr_name1 and attr_name2 created
                // defaultValue: If defaultValue has ';' it must be replaced by §
                // Type format: id - Object ID Dialog
                //              checkbox 
                //              image - image
                //              color - color picker
                //              views - Name of the view
                //              effect - jquery UI show/hide effects
                //              eff_opt - additional option to effect slide (up, down, left, right)
                //              fontName - Font name
                //              slider,min,max,step - Default step is ((max - min) / 100)
                //              select_value1,select_value2,... - dropdown select
                //              hr
                //              br

				var isValueSet = false;
				var wid_attrs = widgetAttrs[attr].split('/');
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
                if (type && type.indexOf(',') != -1) {
                    if (type.substring (0, 'slider'.length) == 'slider') {
                        type = 'slider';
                    } else {
                        type = 'select';
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
                    var wid_attr_ = wid_attr + ((instancesStart !== null) ? instancesStart : '');
                    var isCustomEdit = false;

                    if (defaultValue !== null && (widget.data[wid_attr_] == null || widget.data[wid_attr_] === undefined)) {
                        widget.data[wid_attr_] = defaultValue;
                        vis.reRenderWidgetEdit(vis.activeWidget);
                    }

                    // If completely custom edit
                    if (widgetDiv && widgetDiv.visCustomEdit && widgetDiv.visCustomEdit[wid_attr_]) {
                        widgetDiv.visCustomEdit[wid_attr_](vis.activeWidget, $widgetAttrs);
                    } else if (widgetDiv &&
                        // If only one attribute is custom edited, eg hqoptions
                        widgetDiv._customHandlers &&
                        widgetDiv._customHandlers.onOptionEdited &&
                        widgetDiv._customHandlers.isOptionEdited(wid_attr_)){
                        widgetDiv._customHandlers.onOptionEdited({
                            widgetDiv:   widgetDiv,
                            widgetId:    vis.activeWidget,
                            attr:        wid_attr_,
                            parent:      $widgetAttrs,
                            imgSelect:   vis.imageSelect,
                            clrSelect:   colorSelect,
                            styleSelect: vis.styleSelect
                        });
                    }
                    else if (wid_attr_ === "oid" || type == 'id') {
                        vis.editObjectID (widget, wid_attr_, widgetFilter);
                    } else if (wid_attr_ === "oid-working") {
                        vis.editObjectID (widget, wid_attr_, 'WORKING');
                    } else if (wid_attr_.indexOf ("src") == wid_attr_.length - 3 || type == "image") {
                        vis.editImage(widget, wid_attr_);
                    }else if (wid_attr_  == "url") {
                        vis.editUrl (widget, wid_attr_);
                    } else if (wid_attr_ === "weoid") {
                        // Weather ID
                        $('#widget_attrs').append('<tr class="vis-add-option"><td id="option_' + wid_attr_ + '" ></td></tr>');
                        $('#inspect_comment_tr').hide();
                        $('#inspect_class_tr').hide();
                        $('#option_' + wid_attr_).jweatherCity({
                            lang: this.language, currentValue: widget.data[wid_attr_],
                            onselect: function (wid, text/*, obj*/) {
                                vis.widgets[vis.activeWidget].data.attr('weoid', text);
                                vis.views[vis.activeView].widgets[vis.activeWidget].data['weoid'] = text;
                                vis.save();
                                vis.reRenderWidgetEdit(vis.activeWidget);
                            }
                        });
                    } else if (wid_attr_ === "color" || type == "color") {
                        vis.editColor(widget, wid_attr_);
                    } else if (type === "checkbox") {
                        isValueSet = true;
                        vis.editCheckbox(widget, wid_attr_);
                    } else if (type === "fontName") {
                        isValueSet = true;
                        vis.editFontName(widget, wid_attr_);
                    } else if (type === "slider") {
                        isValueSet = true;
                        var values = wid_attrs[1].split(',');
                        vis.editSlider (widget, wid_attr_, values[1], values[2], values[3]);
                        isCustomEdit = true;
                    } else if (type === "select") {
                        isValueSet = true;
                        var values = wid_attrs[1].split(',');
                        vis.editSelect (widget, wid_attr_, values);
                    } else if (wid_attr_.indexOf("nav_view") != -1|| type == "views") {
                        vis.editViewName (widget, wid_attr_);
                        isCustomEdit = true;
                    } else if (type == "hidden") {
                        isCustomEdit = true;
                    } else if (wid_attr_.indexOf("_effect") != -1 || type == "effect") {
                        vis.editEffects (widget, wid_attr_);
                        isCustomEdit = true;
                    } else if (wid_attr_.indexOf("_eff_opt") != -1 || type == "effect_opt") {
                        vis.editEffects_opt(widget, wid_attr_);
                        isCustomEdit = true;
                    } else if (wid_attr_.indexOf( '_hr') != -1) {
                        vis.hr(widget, wid_attr_);
                        isCustomEdit = true;
                    } else if (wid_attr_.indexOf( '_br') != -1) {
                        vis.br(widget, wid_attr_);
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
                                    $('#widget_attrs').append('<tr id="option_'+wid_attr_+'" class="vis-add-option"><td class="vis-edit-td-caption">'+_(wid_attr_)+':</td><td><input type="text" id="inspect_'+wid_attr_+'" size="34"/></td></tr>');
                                }
                            }

                            if (type !== null) {
                                if (typeof type == 'object') {
                                    var title = _(wid_attr_);
                                    var hint  = '';
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
                                        $('#widget_attrs').append('<tr id="option_'+wid_attr_+'" class="vis-add-option"><td class="vis-edit-td-caption" title="'+hint+'">'+title+':</td><td><input title="'+hint+'" id="inspect_'+wid_attr_+'" type="checkbox"' +(widget.data[wid_attr_] ? "checked": '')+'></td></tr>');
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
                                        var text = '<tr id="option_' + wid_attr_ + '" class="vis-add-option"><td class="vis-edit-td-caption">' + _(wid_attr_) + ':</td><td><select id="inspect_' + wid_attr_ + '">';
                                        for (var t = 0; t < values.length; t++) {
                                            text += "<option value='" + values[t] + "' " + ((values[t] == widget.data[wid_attr_]) ? 'selected' : '') + ">" + _(values[t])+"</option>";
                                        }
                                        text += "</select></td></tr>";
                                        $('#widget_attrs').append(text);
                                        isValueSet = true;
                                    }

                                } else {
                                    // Simple type
                                    servConn.logError('Unknown attribute type ' + wid_attr_ +" Type: " + type);
                                }
                            }
                        } else {
                            // html
                            $('#widget_attrs').append('<tr id="option_'+wid_attr_+'" class="vis-add-option"><td class="vis-edit-td-caption">'+_(wid_attr_)+':</td><td><input type="text" id="inspect_'+wid_attr_+'" size="34"/></td></tr>');
                        }
                    } else {
                        // Text area
                        $('#widget_attrs').append('<tr id="option_'+wid_attr_+'" class="vis-add-option"><td class="vis-edit-td-caption">'+_(wid_attr_)+':</td><td><textarea id="inspect_'+wid_attr_+'" rows="2" cols="34"></textarea></td></tr>');
                    }

                    if (!isCustomEdit) {
                        var inspect = $("#inspect_"+wid_attr_);

                        if (!isValueSet) {
                            inspect.val(widget.data[wid_attr_]);
                        }
                        inspect.change(function () {
                            var attribute = $(this).attr('id').slice(8);
                            var val = $(this).val();
                            if (this.type == "checkbox") {
                                val = $(this).prop("checked");
                            }
                            if (attribute == "oid" || attribute == "oid-working") {
                                $("#inspect_" + attribute + "_desc").html(vis.getObjDesc (val));
                            }
                            vis.widgets[vis.activeWidget].data.attr(attribute, val);
                            vis.views[vis.activeView].widgets[vis.activeWidget].data[attribute] = val;
                            vis.save();
                            vis.reRenderWidgetEdit(vis.activeWidget);
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

        this.showInspect(view, wid);
        // If widget was rerendered, it can have new div
        var $this = $('#' + wid);
        
        $(".vis-inspect-css").each(function () {
            var attr = $(this).attr('id').slice(12)
            var css = $this.css(attr);

            // combine shorthand top/right/bottom/left
            if (attr.match(/border-/) || attr.match(/padding/)) {
                css = vis.combineCssShorthand($this, attr);
            }
            $(this).val(css);
        });

        // autocomplete for filter key
        var elem = document.getElementById('inspect_filterkey');
        if (elem) {
            vis.updateFilter();
            elem._save = function () {
                if (this.timer)  {
                    clearTimeout (this.timer);
                }

                this.timer = _setTimeout (function (elem_) {
                     // If really changed
                    var $this = $(elem_);
                    var attr = $this.attr('id').slice(8);
                    vis.views[vis.activeView].widgets[vis.activeWidget].data[attr] = $this.val();
                    vis.save();                  
                }, 200, this);            
            };
            
            $(elem).autocomplete({
                minLength: 0,
                source: function (request, response) {
                    var data = $.grep(vis.views[vis.activeView].filterList, function (value) {
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
                $(this).autocomplete("search", '');
            }).keyup(function () {
                this._save();               
            }); 
        }
		
        // Put all view names in the select element
		$('#inspect_views').html('');
		var views = vis.getViewsOfWidget(vis.activeWidget);
		for (var v in vis.views) {
			if (v != vis.activeView) {
				var selected = '';
				for (var i = 0; i < views.length; i++) {
					if (views[i] == v) {
						selected = 'selected';
						break;
					}
				}
				$("#inspect_views").append("<option value='" + v + "' " + selected + ">" + v + "</option>");
			}
		}

        $('#inspect_views').multiselect({
//            minWidth: 300,
            height:   260,
            noneSelectedText: _("Single view"),
            selectedText: function (numChecked, numTotal, checkedItems) {
                var text = '';
                for (var i = 0; i < checkedItems.length; i++) {
                    text += ((text == '') ? '' : ",") + checkedItems[i].title;
                }
                return text;
            },
            multiple: true,
            checkAllText:     _("Check all"),
            uncheckAllText:   _("Uncheck all")
            //noneSelectedText: _("Select options")
        }).change (function () {
            vis.syncWidget (vis.activeWidget, $(this).val());
            vis.save ();
        });

        // Select Widget
        $('#select_active_widget option').removeAttr('selected');
        $('#select_active_widget option[value="' + wid + '"]').prop('selected', true);
        $('#select_active_widget').multiselect('refresh');

        if ($('#snap_type option:selected').val() == 2) {
            vis.gridWidth = parseInt($('#grid_size').val());

            if (vis.gridWidth < 1 || isNaN(vis.gridWidth) ) {
                vis.gridWidth = 10;
            }

            var x = parseInt($this.css('left'));
            var y = parseInt($this.css('top'));

            x = Math.floor(x / vis.gridWidth) * vis.gridWidth;
            y = Math.floor(y / vis.gridWidth) * vis.gridWidth;

            $this.css({'left': x, 'top': y});
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
        $("#widget_helper").css({
            left: pos.left - 2,
            top:  pos.top - 2,
            height: $this.outerHeight() + 2,
            width: $this.outerWidth() + 2}).show();

        // User interaction
        if (!vis.widgets[wid].data._no_move) {
            vis.draggable($this);
        }
        if (!vis.widgets[wid].data._no_resize) {
            vis.resizable($this);
        }

        // Inspector
        $('#inspect_wid').html(wid);

        // Show the edit tab
        var tabs = $('#tabs');
        var tabActive = tabs.tabs('option', 'active');

        if (tabActive !== 1 && tabActive !== 2) {
            tabs.tabs('option', 'active', 1);
        }
    },

    // Draw a border around all selected widgets
    allWidgetsHelper: function () {
        //console.log("allWidgetsHelper "+vis.multiSelectedWidgets.length);
        var $allwidgets_helper = $("#allwidgets_helper");

        if (vis.multiSelectedWidgets.length < 1) {
            $allwidgets_helper.hide();
            return;
        }

        // This caused this annoying Bug with multiple occurance of widgets in vis.multiSelectedWidgets array:
        // var selectedWidgets = vis.multiSelectedWidgets;
        // this fixes it:
        var selectedWidgets = [];
        for (var i = 0; i < vis.multiSelectedWidgets.length; i++) {
            selectedWidgets.push(vis.multiSelectedWidgets[i]);
        }

        var l, r, t, b;
        selectedWidgets.push(vis.activeWidget);

        // Find outer edges of all selected widgets
        for (var i = 0; i < selectedWidgets.length; i++) {
            var $widget = $("#" + selectedWidgets[i]);
            var pos = $widget.position();
            pos.right = pos.left + $widget.width();
            pos.bottom = pos.top + $widget.height();
            if (!l || pos.left < l)   l = pos.left;
            if (!r || pos.right > r)  r = pos.right;
            if (!t || pos.top < t)    t = pos.top;
            if (!b || pos.bottom > b) b = pos.bottom;
        }

        $allwidgets_helper
            .css('left',   (l - 3))
            .css("width",  (r + 6 - l))
            .css('top',    (t - 3))
            .css("height", (b + 6 - t))
            .show();
    },

    // Init all edit fields for one view
    changeViewEdit: function (view, noChange) {

        if (this.selectable) {
            $(".vis-view.ui-selectable").selectable("destroy");
            var that = this;
            $("#visview_"+view).selectable({
                filter:    "div.vis-widget",
                tolerance: "fit",
				cancel:    "div.vis-widget",
                start: function (e, ui) {

                },
                stop: function (e, ui) {
                    //console.log('stop ' + $(".ui-selected").length)
                    var $allwidgets_helper = $("#allwidgets_helper");
                    switch ($(".ui-selected").length) {
                        case 0:
                            $(".widget-multi-helper").remove();
                            that.multiSelectedWidgets = [];
                            that.inspectWidget("none");
                            $allwidgets_helper.hide();
                            break;
                        case 1:
                            $(".widget-multi-helper").remove();
                            that.multiSelectedWidgets = [];
                            that.inspectWidget($(".ui-selected").attr('id'));
                            $allwidgets_helper.hide();
                            break;
                        default:
                            vis.allWidgetsHelper();
                    }
                },
                selecting: function (e, ui) {
                    //console.log('selecting ' + ui.selecting.id)
                    if (!that.activeWidget || that.activeWidget == "none") {
                        that.inspectWidget(ui.selecting.id);
                    } else if (ui.selecting.id != that.activeWidget) {
                        //console.log("selecting id="+ui.selecting.id+" active="+vis.activeWidget);
                        that.inspectWidgetMulti(ui.selecting.id);
                    }
                },
                selected: function (e, ui) {
                },
                unselecting: function (e, ui) {
                    //console.log('unselecting ' + ui.unselecting.id)
                    if ($("#widget_multi_helper_" + ui.unselecting.id).html()) {
                        $("#widget_multi_helper_" + ui.unselecting.id).remove();
                        that.multiSelectedWidgets.splice(that.multiSelectedWidgets.indexOf(ui.unselecting.id), 1);
                    }
                },
                unselected: function (e, ui) {
                }
            });
        }

        if (!noChange) {
            this.undoHistory = [$.extend(true, {}, this.views[this.activeView])];
            $('#button_undo').addClass('ui-state-disabled').removeClass('ui-state-hover');
        }

        // Load meta data if not yet loaded
        if (!this.objects) {
            // Read all data objects from server
            this.conn.getObjects(function (data) {
                that.objects = data;
            });
        }

        // Init background selector
        if (this.styleSelect && this.views[view] && this.views[view].settings) {
            this.styleSelect.Show({ width: 152,
                name:       'inspect_view_bkg_def',
                filterName: 'background',
                //filterFile: "backgrounds.css",
                style:      vis.views[view].settings.style.background_class,
                parent:     $("#inspect_view_bkg_parent"),
                onchange:   function (newStyle, obj) {
                    if (vis.views[vis.activeView].settings.style['background_class']) {
                        $("#visview_" + vis.activeView).removeClass(vis.views[vis.activeView].settings.style['background_class']);
                    }
                    vis.views[vis.activeView].settings.style['background_class'] = newStyle;
                    $("#visview_" + vis.activeView).addClass(vis.views[vis.activeView].settings.style['background_class']);
                    vis.save();
                }
            });
        }

        $("#inspect_view").html(view);

        if (this.views[view] && this.views[view].settings) {
            // Try to find this resolution in the list
            var res = this.views[this.activeView].settings.sizex + 'x' + this.views[this.activeView].settings.sizey;
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

            $("#screen_size_x").val(this.views[vis.activeView].settings.sizex || '').trigger('change');
            $("#screen_size_y").val(this.views[vis.activeView].settings.sizey || '').trigger('change');

            $("#screen_hide_description").prop('checked', this.views[this.activeView].settings.hideDescription).trigger('change');
            
            /*if (typeof hqWidgets != 'undefined') {
                hqWidgets.SetHideDescription(vis.views[vis.activeView].settings.hideDescription);
            }*/

            $("#grid_size").val(this.views[this.activeView].settings.gridSize || '').trigger('change');

            var snapType = this.views[this.activeView].settings.snapType || 0;

            $("#snap_type option").removeAttr('selected');
            $("#snap_type option[value='" + snapType + "']").attr('selected', true);
        }

        var $selectWidget = $('#select_active_widget').html('<option value="none">' + _('none selected') + '</option>');

        if (this.views[this.activeView].widgets) {
            for (var widget in this.views[this.activeView].widgets) {
                $selectWidget.append('<option value="' + widget + '">' + this.getWidgetName(this.activeView, widget) + '</option>');
            }
        }

        $selectWidget.multiselect('refresh');

        if ($("#select_view option:selected").val() != view) {
            $("#select_view option").removeAttr('selected');
            $("#select_view option[value='" + view + "']").prop('selected', 'selected');
            $("#select_view").multiselect('refresh');
        }
        $("#select_view_copy option").removeAttr('selected');
        $("#select_view_copy option[value='" + view + "']").prop('selected', 'selected');
        $("#select_view_copy").multiselect('refresh');

        // View CSS Inspector
        $(".vis-inspect-view-css").each(function () {
            var $this = $(this);
            var attr = $this.attr('id').slice(17);
            var css = $("#visview_"+vis.activeView).css(attr);
            $this.val(css);
        });

        if (this.views[view] && this.views[view].settings){
            $(".vis-inspect-view").each(function () {
                var $this = $(this);
                var attr = $this.attr('id').slice(13);
                $("#" + $this.attr('id')).val(that.views[that.activeView].settings[attr]);
            });

            this.views[this.activeView].settings['theme'] = this.views[this.activeView].settings['theme'] || 'redmond';

            $("#inspect_view_theme option[value='" + this.views[this.activeView].settings.theme + "']").prop('selected', true);
        }
        $("#inspect_view_theme").multiselect('refresh');
    },
    dragging: false,
    draggable: function (obj) {
        var origX, origY;
        var draggableOptions = {

            cancel: false,
            start: function (event, ui) {
                vis.dragging = true;
                origX = ui.position.left;
                origY = ui.position.top;
                //var widget = ui.helper.attr('id');

                //console.log(vis.multiSelectedWidgets);
            },
            stop: function (event, ui) {
                var widget = vis.activeWidget;
                var mWidget = document.getElementById(widget);
                var pos = $(mWidget).position();

                $("#inspect_css_top").val(pos.top + "px");
                $("#inspect_css_left").val(pos.left + "px");
                if (!vis.views[vis.activeView].widgets[widget].style) {
                    vis.views[vis.activeView].widgets[widget].style = {};
                }
                vis.views[vis.activeView].widgets[widget].style.left = pos.left;
                vis.views[vis.activeView].widgets[widget].style.top  = pos.top;

                if (mWidget._customHandlers && mWidget._customHandlers.onMoveEnd) {
                    mWidget._customHandlers.onMoveEnd(mWidget, widget);
                }

                for (var i = 0; i < vis.multiSelectedWidgets.length; i++) {
                    var mid = vis.multiSelectedWidgets[i];
                    mWidget = document.getElementById(mid);
                    pos = $(mWidget).position();
                    if (!vis.views[vis.activeView].widgets[mid].style) {
                        vis.views[vis.activeView].widgets[mid].style = {};
                    }
                    vis.views[vis.activeView].widgets[mid].style.left = pos.left;
                    vis.views[vis.activeView].widgets[mid].style.top  = pos.top;

                    if (mWidget._customHandlers && mWidget._customHandlers.onMoveEnd) {
                        mWidget._customHandlers.onMoveEnd(mWidget, mid);
                    }
                }
                vis.save();
                setTimeout(function () {
                    vis.dragging = false;
                }, 20);

            },
            drag: function (event, ui) {

                var moveX = ui.position.left - origX;
                var moveY = ui.position.top  - origY;

                origX = ui.position.left;
                origY = ui.position.top;

                for (var i = 0; i < vis.multiSelectedWidgets.length; i++) {
                    var mWidget = document.getElementById(vis.multiSelectedWidgets[i]);
                    var $mWidget = $(mWidget);
                    var pos = $mWidget.position();
                    var x = pos.left + moveX;
                    var y = pos.top + moveY;

                    $("#widget_multi_helper_"+vis.multiSelectedWidgets[i]).css({left: x - 2, top: y - 2});

                    if (ui.helper.attr('id') != vis.multiSelectedWidgets[i]) {
                        $mWidget.css({left: x, top: y });
                    }

                    if (mWidget._customHandlers && mWidget._customHandlers.onMove) {
                        mWidget._customHandlers.onMove(mWidget, vis.multiSelectedWidgets[i]);
                    }
                }
                var mWidget = document.getElementById(vis.activeWidget);

                if (ui.helper.attr('id') == vis.activeWidget) {
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
                    mWidget._customHandlers.onMove(mWidget, vis.activeWidget);
                }
                if ($("#allwidgets_helper").is(":visible")) {
                    var pos = $("#allwidgets_helper").position();
                    $("#allwidgets_helper").css({left: pos.left + moveX, top: pos.top + moveY});
                }
            }
        };
        if ($("#snap_type option:selected").val() == 1) {
            draggableOptions.snap = "#vis_container div.vis-widget";
        }
        if ($("#snap_type option:selected").val() == 2) {
            draggableOptions.grid = [vis.gridWidth, vis.gridWidth];
        }
        obj.draggable(draggableOptions);
    },
    resizable: function (obj) {
        var resizableOptions;
        if (obj.attr("data-vis-resizable")) {
            resizableOptions = $.parseJSON(obj.attr("data-vis-resizable"));
        }
        if (!resizableOptions) {
            resizableOptions = {};
        }
        if (resizableOptions.disabled !== true) {
            resizableOptions.disabled = false;
            obj.resizable($.extend({
                stop: function (event, ui) {
                    var widget = ui.helper.attr('id')
                    $("#inspect_css_width").val(ui.size.width + "px");
                    $("#inspect_css_height").val(ui.size.height + "px");
                    if (!vis.views[vis.activeView].widgets[widget].style) {
                        vis.views[vis.activeView].widgets[widget].style = {};
                    }
                    vis.views[vis.activeView].widgets[widget].style.width = ui.size.width;
                    vis.views[vis.activeView].widgets[widget].style.height = ui.size.height;
                    vis.save();

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
        vis.multiSelectedWidgets = [];
    },
    //todo

    // todo
    editInit: function () {
        var that = this;

        vis.editInit_dialogs();
        vis.editInit_menu();
        vis.editInit_iconbar();
        vis.editInit_dockspawn();

        $(".vis-version").html(this.version);


        $("#tabs").tabs();
        $("#widget_helper").hide();

        $('#language [value="' + ((typeof this.language === 'undefined') ? 'en' : (this.language || 'en')) + '"]').attr('selected', 'selected');

        $("#language").change(function () {
            that.language = $(this).val();
            if (typeof systemLang != 'undefined') systemLang = that.language;
            translateAll();
        });

        $("input.vis-editor").button();
        $("button.vis-editor").button();

        $("select.vis-editor").each(function () {
            $(this).multiselect({
                multiple:        false,
                header:          false,
                selectedList:    1,
                minWidth:        $(this).attr("data-multiselect-width"),
                height:          $(this).attr("data-multiselect-height"),
                checkAllText:    _("Check all"),
                uncheckAllText:  _("Uncheck all"),
                noneSelectedText:_("Select options")
            });
        });

        $("select.vis-editor-large").each(function () {
            $(this).multiselect({
                multiple:         false,
                header:           false,
                //noneSelectedText: false,
                selectedList:     1,
                minWidth:         250,
                height:           410,
                checkAllText:     _("Check all"),
                uncheckAllText:   _("Uncheck all"),
                noneSelectedText: _("Select options")
            });
        });

        $("select.vis-editor-xlarge").each(function () {
            $(this).multiselect({
                multiple:         false,
                header:           false,
                // noneSelectedText: false,
                selectedList:     1,
                minWidth:         420,
                height:           340,
                checkAllText:     _("Check all"),
                uncheckAllText:   _("Uncheck all"),
                noneSelectedText: _("Select options")
            });
        });

        // Button Click Handler

        $("#export_view").click(function(){vis.exportView(false);});

        $("#import_view").click(function () {
            $("#textarea_import_view").html('');
            $("#dialog_import_view").dialog({
                autoOpen: true,
                width: 800,
                height: 600,
                modal: true,
                open: function (event, ui) {
                    $('[aria-describedby="dialog_import_view"]').css('z-index',1002);
                    $('.ui-widget-overlay').css('z-index',1001);
                    $("#start_import_view").click(function () {
                        vis.importView();
                    });
                    $("#name_import_view").show();
                }
            });
        });

		$('#widget_doc').button({icons: {primary: 'ui-icon-script'}}).click(function () {
            var tpl = vis.views[vis.activeView].widgets[vis.activeWidget].tpl;
            var widgetSet = $('#' + tpl).attr('data-vis-set');
            var docUrl = 'widgets/' + widgetSet + '/doc.html#' + tpl;
            window.open(docUrl, "WidgetDoc", "height=640,width=500,menubar=no,resizable=yes,scrollbars=yes,status=yes,toolbar=no,location=no");
        });



		$("#dup_widget").button({icons: {primary: "ui-icon-copy"}}).click(function () {
            vis.dupWidget();
        });

		$("#add_widget").button({icons: {primary: "ui-icon-plusthick"}}).click(function () {
            var tpl = $("#select_tpl option:selected").val();
            var $tpl = $('#' + tpl);
            var renderVisible = $tpl.attr('data-vis-render-visible');

            // Widget attributs default values
            var attrs = $tpl.attr('data-vis-attrs');
            var data = {};
            if (attrs) {
                attrs = attrs.split(';');
                if (attrs.indexOf('oid') != -1) data.oid = 'nothing_selected';
            }
            if (renderVisible) data.renderVisible = true;

            that.addWidget(tpl, data);

            $('#select_active_widget').append('<option value="' + that.activeWidget + '">' + that.getWidgetName(that.activeView, that.activeWidget) + ')</option>')
            .multiselect('refresh');

            setTimeout(function () {
                that.inspectWidget(that.activeWidget)
            }, 50);
        });

		$("#add_view").button({icons: {primary: "ui-icon-plusthick"}}).click(function () {
            var name = vis.checkNewView();
            if (name === false) {
                return;
            }
            vis.addView(name);
        });

		$("#dup_view").button({icons: {primary: "ui-icon-copy"}}).click(function () {
            var name = vis.checkNewView();
            if (name === false) return;
            vis.dupView(name);
        });

		$("#del_view").button({icons: {primary: 'ui-icon-trash'}}).click(function () {
            vis.delView(vis.activeView);
        });

		$("#rename_view").button({icons: {primary: 'ui-icon-pencil'}}).click(function () {
            var name = vis.checkNewView($("#new_name").val());
            if (name === false) return;
            vis.renameView(name);
        });

		$('#create_instance').button({icons: {primary: 'ui-icon-plus'}}).click(vis.generateInstance);
		
        $('.vis-inspect-css').change(function () {
            var $this = $(this);
            var style = $this.attr('id').substring(12);
			if (!vis.views[vis.activeView].widgets[vis.activeWidget].style) {
				vis.views[vis.activeView].widgets[vis.activeWidget].style = {};
			}
            vis.views[vis.activeView].widgets[vis.activeWidget].style[style] = $this.val();
            vis.save();
            var activeWidget = document.getElementById(vis.activeWidget);
            var $activeWidget = $(activeWidget);
            $activeWidget.css(style, $this.val());
            $("#widget_helper").css({
                left:   parseInt($activeWidget.css('left')) - 2,
                top:    parseInt($activeWidget.css('top'))  - 2,
                height: $activeWidget.outerHeight() + 2,
                width:  $activeWidget.outerWidth()  + 2
            });

            if (activeWidget._customHandlers && activeWidget._customHandlers.onCssEdit) {
                activeWidget._customHandlers.onCssEdit(activeWidget, vis.activeWidget);
            }
        }).keyup(function () {
            $(this).trigger('change');
        });

        vis.initStealHandlers();

        $('.vis-inspect-view-css').change(function () {
            var $this = $(this);
            var attr = $this.attr('id').slice(17);
            var val = $this.val();
            $('#visview_' + vis.activeView).css(attr, val);
			if (!vis.views[vis.activeView].settings.style) {
				vis.views[vis.activeView].settings.style = {};
			}
            vis.views[vis.activeView].settings.style[attr] = val;
            vis.save();
        }).keyup(function () {
            $(this).trigger('change');
        });
		
        $('.vis-inspect-view').change(function () {
            var $this = $(this);
            var attr = $this.attr('id').slice(13);
            var val = $this.val();
            vis.views[vis.activeView].settings[attr] = val;
            vis.save();
        }).keyup(function () {
            $(this).trigger('change');
        });
		


        $('#select_active_widget').change(function () {
            var widgetId = $(this).val();
            //console.log("select_active_widget change "+widgetId);
            vis.inspectWidget(widgetId);
            vis.actionNewWidget(widgetId);
        });

        $("#css_view_inspector").click(function () {
            vis.inspectWidget("none");
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
                $("#size_x").css('left', (parseInt(x,10)+1)+"px").show();
                $("#size_y").css("width", (parseInt(x,10)+3)+"px");
                if (y > 0) {
                    $("#size_x").css("height", (parseInt(y,10)+3)+"px");
                }
            } else {
                $("#size_x").hide();
            }
            if (vis.views[vis.activeView].settings.sizex != x) {
                vis.views[vis.activeView].settings.sizex = x;
                vis.setViewSize(vis.activeView);
                vis.save();
            }

        }).keyup(function () {
            $(this).trigger('change');
        });

        $("#screen_hide_description").change(function () {
            var val = $("#screen_hide_description")[0].checked
            if (vis.views[vis.activeView].settings.hideDescription != val) {
                vis.views[vis.activeView].settings.hideDescription = val;
                if (typeof hqWidgets != 'undefined') {
                    hqWidgets.SetHideDescription(val);
                }
                vis.save();
            }

        }).keyup(function () {
            $(this).trigger('change');
        });


        $("#screen_size_y").change(function () {
            var x = $("#screen_size_x").val();
            var y = $("#screen_size_y").val();
            if (y > 0) {
                $("#size_y").css('top', (parseInt(y, 10) + 1) + "px").show();
                $("#size_x").css("height", (parseInt(y, 10) + 3) + "px");
                if (x > 0) {
                    $("#size_y").css("width", (parseInt(x, 10) + 3) + "px");
                }
            } else {
                $("#size_y").hide();

            }
            if (vis.views[vis.activeView].settings.sizey != y) {
                vis.views[vis.activeView].settings.sizey = y;
                vis.setViewSize(vis.activeView);
                vis.save();
            }

        }).keyup(function () {
            $(this).trigger('change');
        });

        $("#snap_type").change(function () {
            var snapType = $("#snap_type option:selected").val();
            if (vis.views[vis.activeView].settings.snapType != snapType) {
                vis.views[vis.activeView].settings.snapType = snapType;
                vis.save();
            }
        });

        $("#grid_size").change(function () {
            var gridSize = $(this).val();
            if (vis.views[vis.activeView].settings.gridSize != gridSize) {
                vis.views[vis.activeView].settings.gridSize = gridSize;
                vis.save();
            }
        });
        // Bug in firefox or firefox is too slow or too fast
        /*setTimeout(function() {

            if (document.getElementById('select_active_widget')._isOpen === undefined) {
                $('#select_active_widget').html('<option value="none">' + _('none selected') + '</option>');
                if (vis.activeView && vis.views && vis.views[vis.activeView] && vis.views[vis.activeView].widgets) {
                    for (var widget in vis.views[vis.activeView].widgets) {
                        var obj = $("#" + vis.views[vis.activeView].widgets[widget].tpl);
                        $('#select_active_widget').append("<option value='" + widget + "'>" + this.getWidgetName(vis.activeView, widget) + </option>");
                    }
                }
                $('#select_active_widget').multiselect('refresh');
            }

        }, 10000);*/

        // Instances
        if (typeof storage !== 'undefined') {
            // Show what's new
            if (storage.get('lastVersion') != vis.version) {
                // Read
                storage.set('lastVersion', vis.version);
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
                                        text = ioaddon.whatsNew[i][that.language] || ioaddon.whatsNew[i]['en'];
                                    }
                                    // Remove modifier information like (Bluefox) or (Hobbyquaker)
                                    if (text[0] == '(') {
                                        var j = text.indexOf(')');
                                        if (j != -1) {
                                            text = text.substring(j + 1);
                                        }
                                    }
                                    vis.showHint('<b>' + _('New:') + '</b>' + text, 30000, 'info');
                                }
                            }
                        } catch (e) {
                            servConn.logError('Cannot parse io-addon.json ' + e);
                        }
                    }
                });
            }
            try {
                // Load groups state and positions
                var groups = storage.get('groups');
                try {
                    if (groups) this.groupsState = JSON.parse(groups);
                } catch (e) {
                    console.log('Cannot parse groups: ' + groups);
                }
            } catch (e) {

            }
        }
    },

    editInit_dialogs: function(){

        $("#dialog_about").dialog({
            autoOpen: false,
            width: 600,
            height:500,
            position:{ my: "center", at: "center", of: $("#main") }
        });
        $("#dialog_setup").dialog({
            autoOpen: false,
            width: 600,
            height:500,
            position:{ my: "center", at: "center", of: $("#main") }
        });

    },
    editInit_menu:function(){
        $("#menu.sf-menu").superclick({
            hoverClass: 'sfHover',
            uiClass: 'ui-state-hover',  // jQuery-UI modified
            pathClass: 'overideThisToUse',
            pathLevels: 1,
            disableHI: false
        });

        $('li.ui-state-default').hover(
            function () {
                $(this).addClass('ui-state-hover')
            },
            function () {
                $(this).removeClass('ui-state-hover')
            }
        );

        // Theme auswahl
        $("#ul_theme li a").click(function () {
            var theme = $(this).data('info');
            vis.views[vis.activeView].settings.theme = theme;
            $("#jqui_theme").remove();
            $('style[data-href$="jquery-ui.min.css"]').remove();
            $("head").prepend('<link rel="stylesheet" type="text/css" href="../lib/css/themes/jquery-ui/' + theme + '/jquery-ui.min.css" id="jqui_theme"/>');
            vis.additionalThemeCss(theme);
            vis.save();
        });

        $(".pan_state").click(function () {
            var pan = $(this).attr("id").replace("_state", "");
            var panel;
            if (this.checked) {
                panel = vis.get_panel_by_id(pan);
                panel._floatingDialog.show()
            } else {
                panel = vis.get_panel_by_id(pan);
                if (panel._floatingDialog) {
                    panel._floatingDialog.hide()
                } else {

                    var dialog = dockManager.requestUndockToDialog(panel);
                    dialog.hide()
                }

            }
        });

        $("#m_about").click(function(){
            $("#dialog_about").dialog("open")
        });
        $("#m_setup").click(function(){
            $("#dialog_setup").dialog("open")
        });
    },
    editInit_iconbar:function(){

        $("#ibar_wid-del").click(function () {
            vis.delWidget()
            $(this).stop(true, true).effect("highlight")

        }).hover(
            function () {
                $(this).addClass("ui-state-focus");
            }, function () {
                $(this).removeClass("ui-state-focus");
            }
        );
    },
    editInit_dockspawn:function(){
        var storeKey = "vis.dock_manager";

        var divDockManager = document.getElementById("main");
        dockManager = new dockspawn.DockManager(divDockManager);
        dockManager.initialize();
        var onResized = function (e) {
            dockManager.resize(window.innerWidth - (divDockManager.clientLeft + divDockManager.offsetLeft), window.innerHeight - (divDockManager.clientTop + divDockManager.offsetTop));
        };
        window.onresize = onResized;
        onResized(null);

        dockManager.addLayoutListener({
            onDock: function (self, dockNode) {
                //console.info('onDock: ', self, dockNode);
                localStorage.setItem(storeKey, dockManager.saveState());
            },
            onUndock: function (self, dockNode) {
                //console.info('onUndock: ', self, dockNode);
                localStorage.setItem(storeKey, dockManager.saveState());
            },
            onCreateDialog: function (self, dialog) {
                //console.info('onCreateDialog: ', self, dialog);
                localStorage.setItem(storeKey, dockManager.saveState());
            },
            onChangeDialogPosition: function (self, dialog, x, y) {
                //console.info('onCreateDialog: ', self, dialog, x, y);
                localStorage.setItem(storeKey, dockManager.saveState());
            },
            onResumeLayout: function (self) {
                //console.info('onResumeLayout: ', self);
                localStorage.setItem(storeKey, dockManager.saveState());
            },
            onClosePanel: function (self, panel) {
                //console.info('onClosePanel: ', self, panel);

                localStorage.setItem(storeKey, dockManager.saveState());
            },
            onHideDialog: function (self, dialog) {
                //console.info('onHideDialog: ', self, dialog);
                localStorage.setItem(storeKey, dockManager.saveState());
            },
            onShowDialog: function (self, dialog) {
                //console.info('onShowDialog: ', self, dialog);
                $("#" + dialog.panel.elementContent.id + "_state").attr("checked", true);
                localStorage.setItem(storeKey, dockManager.saveState());
            }

        });

        var lastState = localStorage.getItem(storeKey);
        //if (!lastState) {
        //    dockManager.loadState(lastState);
        //
        //}else{

        var documentNode = dockManager.context.model.documentManagerNode;

        var _pan_vis_container = new dockspawn.PanelContainer(document.getElementById("vis_container"), dockManager);
        var _pan_add_view = new dockspawn.PanelContainer(document.getElementById("pan_add_view"), dockManager);

        var _pan_css_view = new dockspawn.PanelContainer(document.getElementById("pan_css_view"), dockManager);
        var _pan_css_wid = new dockspawn.PanelContainer(document.getElementById("pan_css_wid"), dockManager);
        var _pan_add_wid = new dockspawn.PanelContainer(document.getElementById("pan_add_wid"), dockManager);
        var _pan_wid_attr = new dockspawn.PanelContainer(document.getElementById("pan_wid_attr"), dockManager);


        var pan_vis_container = dockManager.dockFill(documentNode, _pan_vis_container);
        //var pan_vis_container = dockManager.dockFill(documentNode, _pan_add_view);
        //var pan_vis_container = dockManager.dockFill(documentNode, _pan_add_wid);
        //var pan_vis_container = dockManager.dockFill(documentNode, _pan_css_wid);
        //var pan_vis_container = dockManager.dockFill(documentNode, _pan_css_view);

        var pan_add_view = dockManager.dockLeft(documentNode, _pan_add_view, 0.30);
        var pan_add_widget = dockManager.dockFill(pan_add_view, _pan_add_wid);
        var pan_css_wid = dockManager.dockRight(documentNode,_pan_css_wid,0.08  );
        var pan_wid_attr = dockManager.dockUp(pan_css_wid,_pan_wid_attr,0.5  );
        var pan_css_view = dockManager.dockFill(pan_css_wid, _pan_css_view);

console.log(pan_vis_container)
        pan_vis_container.container.canUndock(false)
    },

    //todo

    //todo


    editInitNext: function () {
        // ioBroker.vis Editor Init
        var that = this;
        var sel;

        var keys = Object.keys(vis.views);
        var len  = keys.length;
        var i;
        var k;

        keys.sort();

        var $select_view      = $("#select_view");
        var $select_view_copy = $("#select_view_copy");
        var $select_set       = $("#select_set");

        for (i = 0; i < len; i++) {
            k = keys[i];

            if (k == this.activeView) {
                $("#inspect_view").html(this.activeView);
                sel = " selected";
            } else {
                sel = '';
            }
            $select_view.append("<option value='" + k + "'" + sel + ">" + k + "</option>");
            $select_view_copy.append("<option value='" + k + "'" + sel + ">" + k + "</option>");
        }

        $select_view.multiselect('refresh');

        $select_view_copy.multiselect({
            minWidth: 200,
            checkAllText:_("Check all"),
            uncheckAllText:_("Uncheck all"),
            noneSelectedText:_("Select options")
        }).multiselect('refresh');

        $select_view.change(function () {
            that.changeView($(this).val());
        });

        $select_set.change(vis.refreshWidgetSelect);
        $select_set.html('');

        for (i = 0; i < this.widgetSets.length; i++) {
            if (this.widgetSets[i].name !== undefined) {
                $select_set.append("<option value='" + this.widgetSets[i].name + "'>" + this.widgetSets[i].name + "</option>");
            } else {
                $select_set.append("<option value='" + this.widgetSets[i] + "'>" + this.widgetSets[i] + "</option>");
            }
        }
        $select_set.multiselect('refresh');

        vis.refreshWidgetSelect();

        //console.log("TOOLBOX OPEN");


        // Create background_class property if does not exist
        if (this.views[vis.activeView] != undefined) {
            if (this.views[vis.activeView].settings == undefined) {
                this.views[vis.activeView].settings = {};
            }
            if (this.views[vis.activeView].settings.style == undefined) {
                this.views[vis.activeView].settings.style = {};
            }
            if (this.views[vis.activeView].settings.style['background_class'] == undefined) {
                this.views[vis.activeView].settings.style['background_class'] = '';
            }
        }

        if (this.fillWizard) this.fillWizard();

        // Deselect active widget if click nowhere. Not required if selectable is active
        if (!this.selectable) {
            $('#vis_container').click (function () {
                that.inspectWidget("none");
            });
        }

        if (this.conn.getType() == 'local') {
            $("#export_local_view").click(function () {
                that.exportView(true);
            }).show();

            $("#import_local_view").click(function () {
                $("#textarea_import_view").html('');
                $("#dialog_import_view").dialog({
                    autoOpen: true,
                    width: 800,
                    height: 600,
                    modal: true,
                    open: function (event, ui) {
                        $('[aria-describedby="dialog_import_view"]').css('z-index',1002);
                        $('.ui-widget-overlay').css('z-index',1001);
                        $("#start_import_view").click(function () {
                            that.importView(true);
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

    refreshWidgetSelect: function () {
        var $select_tpl = $("#select_tpl");
        $select_tpl.html('');
        var current_set = $("#select_set option:selected").val();
        $(".vis-tpl[data-vis-set='" + current_set + "']").each(function () {
            $("#select_tpl").append("<option value='" + $(this).attr('id') + "'>" + $(this).attr("data-vis-name") + "</option>")
        });
        $select_tpl.multiselect('refresh');
    },
	// Find free place for new widget
	findFreePosition: function (view, id, field, widgetWidth, widgetHeight) {
		var editPos = $('.ui-dialog:first').position();
		field = $.extend({x: 0, y: 0, width: editPos.left}, field);
		widgetWidth  = (widgetWidth  || 60);
		widgetHeight = (widgetHeight || 60);

		if (widgetWidth > field.width) field.width = widgetWidth + 1;

		var step = 20;
		var y = field.y;
		var x = field.x || step;
		
		// Prepare coordinates
		var positions = [];
		for (var w in this.views[view].widgets) {
			if (w == id || !this.views[view].widgets[w].tpl) {
				continue;
			}

			if (this.views[view].widgets[w].tpl.indexOf("Image") == -1 &&
                this.views[view].widgets[w].tpl.indexOf("image") == -1) {
				var $jW = $('#' + w);
                if ($jW.length) {
                    var s = $jW.position();
                    s['width']  = $jW.width();
                    s['height'] = $jW.height();
                    if (s.width > 300 && s.height > 300) {
                        continue;
                    }
                    positions[positions.length] = s;
                }
			}
		}
		
		while (!this.checkPosition(positions, x, y, widgetWidth, widgetHeight)) {
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
			addClass('vis-show-new').
			css(_css2).
			animate(_css1, 1500, 'swing', function () {
				$(this).remove();
			}).click(function () {
				$(this).stop().remove();
			});

		text = text.replace('action1', 'action2');
		$('body').append(text);
		$('#'+id+'__action2').
			addClass('vis-show-new').
			css(_css2).
			animate(_css1, 3000, 'swing', function () {
                $(this).remove();
            });
	},
    // collect all filter keys for given view
    updateFilter: function () {
        if (this.activeView && this.views) {
            var widgets = this.views[this.activeView].widgets;
            this.views[this.activeView].filterList = [];
            
            for (var widget in widgets) {
                if (widgets[widget] && widgets[widget].data &&
                    widgets[widget].data.filterkey != '' &&
                    widgets[widget].data.filterkey !== undefined) {
					var isFound = false;
					for (var z = 0; z < this.views[this.activeView].filterList.length; z++) {
						if (this.views[this.activeView].filterList[z] == widgets[widget].data.filterkey) {
							isFound = true;
							break;
						}
					}					
					if (!isFound) {
                        this.views[vis.activeView].filterList[this.views[this.activeView].filterList.length] = widgets[widget].data.filterkey;
					}
                }
            }
            return this.views[this.activeView].filterList;
        } else {
            return [];
        }
    },
    initStealHandlers: function () {
        var that = this;
        $(".vis-steal-css").each(function () {
            $(this).button({
                icons: {
                    primary: "ui-icon-star"
                },
                text: false
            }).click(function (e) {
                if (!$(this).attr("checked")) {
                    $(this).attr("checked", true).button('refresh');
                } else {
                    $(this).removeAttr("checked").button('refresh');
                }
                var isSelected = false;
                $(".vis-steal-css").each(function () {
                    if ($(this).attr("checked")) {
                        isSelected = true;
                    }
                });

                if (isSelected && !that.isStealCss) {
                    that.stealCssMode();
                } else if (!isSelected && that.isStealCss) {
                    that.stealCssModeStop();
                }

                e.stopPropagation();
                e.preventDefault();
                return false;
            });
        })
    },
    stealCssModeStop: function () {
        this.isStealCss = false;
        $("#stealmode_content").remove();
        if (this.selectable) {
            $("#visview_" + this.activeView).selectable("enable");
        }
        $(".vis-steal-css").removeAttr("checked").button('refresh');
        $("#vis_container").removeClass("vis-steal-cursor");

    },
    stealCssMode: function () {
        if (this.selectable) {
            $("#visview_" + this.activeView).selectable("disable");
        }
        this.isStealCss = true;
        $(".widget_multi_helper").remove();
        this.multiSelectedWidgets = [];

        if (!$('#stealmode_content').length) {
            $('body').append('<div id="stealmode_content" style="display:none" class="vis-stealmode">CSS steal mode</div>')
            $("#stealmode_content").fadeIn('fast')
                .click(function() {
                    $(this).fadeOut("slow");
                });
        }

        $(".vis-widget").one("click", function (e) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();

            vis.stealCss(e);
        });
        $("#vis_container").addClass("vis-steal-cursor");
    },
    stealCss: function (e) {
        if (this.isStealCss) {
            var that = this;
            var target= "#" + this.activeWidget;
            var src= "#" + e.currentTarget.id;

            $(".vis-steal-css").each(function () {
                if ($(this).attr("checked")) {
                    $(this).removeAttr("checked").button('refresh');
                    var cssAttribute = $(this).attr("data-vis-steal");
                    if (cssAttribute.match(/border-/) || cssAttribute.match(/padding/)) {
                        var val = that.combineCssShorthand($(src), cssAttribute);
                    } else {
                        var val = $(src).css(cssAttribute);
                    }
                    $(target).css(cssAttribute, val);
                    that.views[that.activeView].widgets[that.activeWidget].style[cssAttribute] = val;
                }
            });

            this.save(function () {

                that.stealCssModeStop();
                that.inspectWidget(that.activeWidget);

            });

        }
    },
    combineCssShorthand: function (that, attr) {
        var css;
        var parts = attr.split("-");
        var baseAttr = parts[0];

        if (attr == "border-radius") {
            // TODO second attribute
            var cssTop =    that.css(attr.replace(RegExp(baseAttr), baseAttr + "-top-left"));
            var cssRight =  that.css(attr.replace(RegExp(baseAttr), baseAttr + "-top-right"));
            var cssBottom = that.css(attr.replace(RegExp(baseAttr), baseAttr + "-bottom-right"));
            var cssLeft =   that.css(attr.replace(RegExp(baseAttr), baseAttr + "-bottom-left"));
        } else {
            var cssTop =    that.css(attr.replace(RegExp(baseAttr), baseAttr + "-top"));
            var cssRight =  that.css(attr.replace(RegExp(baseAttr), baseAttr + "-right"));
            var cssBottom = that.css(attr.replace(RegExp(baseAttr), baseAttr + "-bottom"));
            var cssLeft =   that.css(attr.replace(RegExp(baseAttr), baseAttr + "-left"));
        }
        if (cssLeft == cssRight && cssLeft == cssTop && cssLeft == cssBottom) {
            css = cssLeft;
        } else if (cssTop == cssBottom && cssRight == cssLeft) {
            css = cssTop + ' ' + cssLeft;
        } else if (cssRight == cssLeft) {
            css = cssTop + ' ' + cssLeft + ' ' + cssBottom;
        } else {
            css = cssTop + ' ' + cssRight + ' ' + cssBottom + ' ' + cssLeft;
        }
        return css;
    },
    _saveTimer: null, // Timeout to save the configuration
    _saveToServer: function () {
        if (!this.undoHistory || this.undoHistory.length == 0 ||
            (JSON.stringify(this.views[this.activeView]) != JSON.stringify(this.undoHistory[this.undoHistory.length - 1]))) {
            this.undoHistory = this.undoHistory || [];
            $("#button_undo").removeClass("ui-state-disabled");
            if (this.undoHistory.push($.extend(true, {}, this.views[this.activeView])) > this.undoHistoryMaxLength) {
                this.undoHistory.splice(0, 1);
            }
        }
        var that = this;
        this.saveRemote(function() {
            that._saveTimer = null;
            $('#savingProgress').hide().next().button('enable');
        });
    },
    save: function (cb) {
        if (this._saveTimer) {
            clearTimeout(this._saveTimer);
            this._saveTimer = null;
        }
        // Store the changes if nothing changed for 2 seconds
        this._saveTimer = _setTimeout(function (_vis) {
            _vis._saveToServer();
        }, 2000, this);

        $('#savingProgress').show().next().button('disable');
        if (cb) {
            cb();
        }
    },
    undo: function () {
        if (this.undoHistory.length <= 1) return;

        var activeWidget = this.activeWidget;
        var multiSelectedWidgets = this.multiSelectedWidgets;

        this.inspectWidget("none");
        $("#visview_" + this.activeView).remove();

        this.undoHistory.pop();
        this.views[vis.activeView] = $.extend(true, {}, this.undoHistory[this.undoHistory.length - 1]);
        this.saveRemote();

        if (this.undoHistory.length <= 1) {
            $("#button_undo").addClass("ui-state-disabled").removeClass("ui-state-hover");
        }

        this.renderView(this.activeView);
        this.changeViewEdit(this.activeView, true);
        this.inspectWidget(activeWidget);
        for (var i = 0; i < multiSelectedWidgets.length; i++) {
            this.inspectWidgetMulti(multiSelectedWidgets[i]);
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
        if (!this.growlInited) {
            this.growlInited = true;
            // Init jGrowl
            $.jGrowl.defaults.closer = true;
            $.jGrowl.defaults.check = 1000;
        }

        $('#growl_informator').jGrowl(content, {
            theme:  type,
            life:   (life === undefined) ? 10000 : life,
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
        if (!$focused.length && this.activeView) {
            // Go through all widgets
            if (!this.activeWidget || this.activeWidget == "none") {
                // Get first one
                for (var widget in this.views[this.activeView].widgets) {
                    this.inspectWidget(widget);
                    break;
                }
            }
            for (var widget in this.views[this.activeView].widgets) {
                if (widget == this.activeWidget) continue;

                this.inspectWidgetMulti(widget);
            }
            return true;
        } else {
            return false;
        }
    },
    deselectAll: function () {
        // Select all widgets on view
        var $focused = $(':focus');
        if (!$focused.length && vis.activeView) {
            this.clearWidgetHelper();

            if (this.activeWidget && this.activeWidget != "none") {
                this.inspectWidget('none');
            }
            return true;
        } else {
            return false;
        }
    },
    paste: function () {
        var $focused = $(':focus');
        if (!$focused.length) {
            if (this.clipboard && this.clipboard.length) {
                var widgets = [];
                for (var i = 0, len = this.clipboard.length; i < len; i++) {
                    this.dupWidget(this.clipboard[i], true);
                    widgets.push(this.activeWidget);
                }
                this.save();                // Select main widget and add to selection the secondary ones
                this.inspectWidget(widgets[0]);
                for (var j = 1, jlen = widgets.length; j < jlen; j++) {
                    this.inspectWidgetMulti(widgets[j]);
                }
            }
        }
    },
    copy: function (isCut) {
        var $focused = $(':focus');
        if (!$focused.length && this.activeWidget) {
            var $clipboard_content = $('#clipboard_content');
            if (!$clipboard_content.length) {
                $('body').append('<div id="clipboard_content" style="display:none" class="vis-clipboard" title="'+_('Click to hide')+'"></div>');
                $clipboard_content = $('#clipboard_content');
            }

            this.clipboard = [];
            this.clipboard[0] = {
                widget: $.extend(true, {}, this.views[this.activeView].widgets[this.activeWidget]),
                view:   (!isCut) ? this.activeView : '---copied---'
            };
            var widgetNames = this.activeWidget;
            if (this.multiSelectedWidgets.length) {
                for (var i = 0, len = this.multiSelectedWidgets.length; i < len; i++) {
                    widgetNames += ', ' + this.multiSelectedWidgets[i];
                    this.clipboard[i + 1] = {widget: $.extend(true, {}, this.views[this.activeView].widgets[this.multiSelectedWidgets[i]]), view: (!isCut) ? this.activeView : '---copied---'};
                }
            }

           /* this.showHint('<table><tr><td>' + _('Clipboard:') + '&nbsp;<b>' + widgetNames + '</b></td><td id="thumbnail" width="200px"></td></tr></table>', 0, null, function () {
            if (html2canvas) {
            this.getWidgetThumbnail(this.activeWidget, 0, 0, function (canvas) {
                    $('#thumbnail').html(canvas);
                });
            }

            });
            */
            $clipboard_content.html('<table><tr><td>' + _('Clipboard:') + '&nbsp;<b>' + widgetNames + '</b></td><td id="thumbnail"></td></tr></table>');

            var that = this;
            if (typeof html2canvas != "undefined") {
                this.getWidgetThumbnail(this.activeWidget, 0, 0, function (canvas) {
                    $('#thumbnail').html(canvas);
                    if (isCut) {
                        for (var i = 0, len = that.multiSelectedWidgets.length; i < len; i++) {
                            that.delWidget(that.multiSelectedWidgets[i]);
                        }
                        that.delWidget(that.activeWidget);
                        that.inspectWidget("none");
                    }
                });
            } else {
                if (isCut) {
                    for (var i = 0, len = this.multiSelectedWidgets.length; i < len; i++) {
                        this.delWidget(this.multiSelectedWidgets[i]);
                    }
                    this.delWidget(this.activeWidget);
                    this.inspectWidget("none");
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
        if (!$focused.length && this.activeWidget) {
            var isHideDialog = false;
            if (typeof storage != "undefined") {
                isHideDialog = storage.get("dialog_delete_is_show");
            }
    
            if (!isHideDialog) {
                if (this.multiSelectedWidgets.length) {
                    $("#dialog_delete_content").html(_("Do you want delete %s widgets?", this.multiSelectedWidgets.length + 1));
                } else {
                    $("#dialog_delete_content").html(_("Do you want delete widget %s?", this.activeWidget));
                }
    
                var dialog_buttons = {};
    
                var delText = _("Delete").replace("&ouml;", "ö");
                var that = this;
                dialog_buttons[delText] = function () {
                    if ($('#dialog_delete_is_show').prop('checked')) {
                        if (typeof storage != "undefined") {
                            storage.set("dialog_delete_is_show", true);
                        }
                    }
                    $(this).dialog( "close" );
    
                    for (var i = 0, len = that.multiSelectedWidgets.length; i < len; i++) {
                        that.delWidget(that.multiSelectedWidgets[i]);
                    }
                    that.delWidget(that.activeWidget);
                    // vis.clearWidgetHelper(); - will be done in inspectWidget("none")
                    that.inspectWidget("none");
                }
                dialog_buttons[_("Cancel")] = function () {
                    $(this).dialog("close");
                };
    
                $("#dialog_delete").dialog({
                    autoOpen: true,
                    width:  500,
                    height: 220,
                    modal:  true,
                    title:  _("Confirm widget deletion"),
                    open:   function (event, ui) {
                        $('[aria-describedby="dialog_delete"]').css('z-index',1002);
                        $(".ui-widget-overlay").css('z-index', 1001);
                    },
                    buttons: dialog_buttons
                });
            } else {
                for (var i = 0, len = this.multiSelectedWidgets.length; i < len; i++) {
                    this.delWidget(this.multiSelectedWidgets[i]);
                }
                this.delWidget(this.activeWidget);
                // this.clearWidgetHelper(); - will be done in inspectWidget("none")
                this.inspectWidget("none");
            }
            return true;
        } else {
            return false;
        }
    },
    onButtonArrows: function (key, isSize, factor) {
        factor = factor || 1;
        var $focused = $(':focus');
        if (!$focused.length && vis.activeWidget) {
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
                    what = 'left';
                    shift = 1;
                } else if (key == 37) {
                    // Left
                    what = 'left';
                    shift = -1;
                } else if (key == 40) {
                    // Down
                    what = 'top';
                    shift = 1;
                } else if (key == 38) {
                    // Up
                    what = 'top';
                    shift = -1;
                }
            }

            shift = shift * factor;

            for (var i = -1, len = vis.multiSelectedWidgets.length; i < len; i++) {
                var widgetId;
                if (i == -1) {
                    widgetId = vis.activeWidget;
                } else {
                    widgetId = vis.multiSelectedWidgets[i];
                }
                var $actualWidget = $('#' + widgetId);
                if (vis.views[vis.activeView].widgets[widgetId].style[what] === undefined && $actualWidget.length) {
                    vis.views[vis.activeView].widgets[widgetId].style[what] = $actualWidget.css(what);
                }
                vis.views[vis.activeView].widgets[widgetId].style[what] = parseInt(vis.views[vis.activeView].widgets[widgetId].style[what], 10) + shift;
                if ($actualWidget.length) {
                    var setCss = {};
                    setCss[what] = vis.views[vis.activeView].widgets[widgetId].style[what];
                    $actualWidget.css(setCss);
                    if (i == -1) {
                        $("#widget_helper").css({
                            left:   parseInt($actualWidget.css('left')) - 2,
                            top:    parseInt($actualWidget.css('top'))  - 2,
                            height: $actualWidget.outerHeight() + 2,
                            width:  $actualWidget.outerWidth() + 2
                        });
                    } else {
                        $("#widget_multi_helper_" + widgetId).css({
                            left:   parseInt($actualWidget.css('left')) - 2,
                            top:    parseInt($actualWidget.css('top'))  - 2,
                            height: $actualWidget.outerHeight() + 2,
                            width:  $actualWidget.outerWidth() + 2
                        });
                    }
                }
            }

            vis.allWidgetsHelper();

            if (vis.delayedSettings) {
                clearTimeout(vis.delayedSettings);
            }
            vis.delayedSettings = _setTimeout(function(widgetId) {
                // Save new settings
                var mWidget = document.getElementById(widgetId);
                if ((what == 'top' || what== 'left') && mWidget._customHandlers && mWidget._customHandlers.onMoveEnd) {
                    mWidget._customHandlers.onMoveEnd(mWidget, widgetId);
                } else
                if (mWidget._customHandlers && mWidget._customHandlers.onCssEdit) {
                    mWidget._customHandlers.onCssEdit(mWidget, widgetId);
                }

                if (mWidget._customHandlers && mWidget._customHandlers.isRerender) {
                    vis.reRenderWidgetEdit(widgetId);
                }
                vis.inspectWidget(widgetId, true);
                var multiSelectedWidgets = vis.multiSelectedWidgets;
                vis.multiSelectedWidgets = [];
                for (var i = 0, len = multiSelectedWidgets.length; i < len; i++) {
                    mWidget = document.getElementById(multiSelectedWidgets[i]);

                    if ((what == 'top' || what== 'left') && mWidget._customHandlers && mWidget._customHandlers.onMoveEnd) {
                        mWidget._customHandlers.onMoveEnd(mWidget, multiSelectedWidgets[i]);
                    } else
                    if (mWidget._customHandlers && mWidget._customHandlers.onCssEdit) {
                        mWidget._customHandlers.onCssEdit(mWidget, multiSelectedWidgets[i]);
                    }
                    if (mWidget._customHandlers && mWidget._customHandlers.isRerender) {
                        vis.reRenderWidgetEdit(multiSelectedWidgets[i]);
                    }
                    vis.inspectWidgetMulti(multiSelectedWidgets[i]);
                }
                vis.delayedSettings = null;

            }, 1000, vis.activeWidget);

            vis.save();

            return true;
        } else {
            return false;
        }
    },
    onPageClosing: function () {
        // If not saved
        if (this._saveTimer) {
            if (confirm(_("Changes are not saved. Are you sure?"))) {
                return null;
            } else {
                return "Configuration not saved.";
            }
        }
        return null;
    },
    get_panel_by_id: function (id) {
        var panels = dockManager.getPanels()
        var panel;
        $.each(panels,function () {
            if (this.elementContent.id == id) {
                panel = this;
                return false
            }
        });
        return panel
    }
});

$(document).keydown(function (e) {
    // Capture ctrl-z (Windows/Linux) and cmd-z (MacOSX)
    if (e.which === 90 && (e.ctrlKey || e.metaKey)) {
        vis.undo();
        e.preventDefault();
    } else if (e.which === 65 && (e.ctrlKey || e.metaKey)) {
        // Ctrl+A
        if (vis.selectAll()) {
            e.preventDefault();
        };
    } else if (e.which === 27) {
        // Esc
        if (vis.deselectAll()) {
            e.preventDefault();
        }
    }else if (e.which === 46) {
        // Capture Delete button
        if (vis.onButtonDelete()) {
            e.preventDefault();
        }
    } else
    // Capture down, up, left, right for shift
    if (e.which === 37 || e.which === 38 || e.which === 40 || e.which === 39) {
        if (vis.onButtonArrows(e.which, e.shiftKey, (e.ctrlKey || e.metaKey ? 10 : 1))) {
            e.preventDefault();
        }
    }
});

// Copy paste mechanism
$(window).on("paste", function (e) {
    vis.paste();
}).on("copy cut", function (e) {
    vis.copy(e.type == "cut");
});

window.onbeforeunload = function() {
    return vis.onPageClosing();
};
