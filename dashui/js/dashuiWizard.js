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
 // duiEdit - the DashUI Editor Wizard

"use strict";

// Init words
dui.translate("");
// Add words for bars
jQuery.extend(true, dui.words, {
	"All except Low battery": {"en" : "All except 'Battery Indicator'", "de": "Alle außer 'Battery Indicator'", "ru": "Все, кроме 'Battery Indicator'"},
	"Place following widget to the room and start wizard again": {
		"en" : "Place following widget to the room and start wizard again", 
		"de" : "Platziere diesen Widget auf dem View im zugehörigen Raum und starte Wizard neu", 
		"ru" : "Поместите элемент в комнате, где он должен быть и запустите Помошника снова"
		}
});
dui = $.extend(true, dui, {
	hm2Widget: {
		'tplHqButton' : {findImage: false, hssType: ['HM-LC-Sw1-Pl', 'HM-LC-Sw1-FM', 'HM-LC-Sw1-PB-FM', 'HM-LC-Sw2-PB-FM', 'HM-LC-Sw2-FM','HM-ES-PMSw1-Pl','HM-LC-Sw1PBU-FM','HM-LC-Sw1-SM','HM-LC-Sw4-SM']},
		'tplHqLowbat' : {findImage: true,  hssType: ['HM-PB-4-WM', 'HM-PB-2-WM', 'HM-PB-4Dis-WM', 
		                                             'HM-PB-2-WM55','HM-CC-VD',//'HM-SCI-3-FM',
													 'HM-Sec-WDS','HM-Sec-SD','HM-Sec-TiS',
													 'HM-RC-4-2', 'HM-RC-Key4-2', 'HM-RC-Sec4-2',
													 'HM-RC-4', 'HM-RC-4-B', 'HM-RC-Sec3', 
													 'HM-RC-Key3', 'HM-RC-Key3-B', 'HM-RC-12', 
													 'HM-RC-12-B', 'HM-RC-19', 'HM-RC-19-B',
													 'HM-RC-P1', 'HM-PB-6-WM55', 'HM-Sen-EP', 
													 'HM-SCI-3-FM', 'HM-SwI-3-FM', 'HM-PBI-4-FM',
													 'HM-LC-Sw4-Ba-PCB', 'HM-WDS30-OT2-SM','HM-Sen-Wa-Od',
													 'HM-Dis-TD-T'], point: "LOWBAT"},
		'tplHqMotion' : {findImage: false, hssType: ['HM-Sen-MDIR-O', 'HM-Sec-MDIR'], point: 'MOTION'},
		'tplHqIp'     : {findImage: false, hssType: ['PING']},
		'tplHqGong'   : {findImage: false, hssType: ['HM-OU-CF-PL', 'HM-OU-CFM-Pl']},
		'tplHqOutTemp': {findImage: false, hssType: ['HM-WDC7000','HM-WDS10-TH-O','HM-WDS40-TH-I','HM-WDS100-C6-O','HM-WDS30-T-O']},
		'tplHqInTemp' : {findImage: false, hssType: ['HM-CC-TC','HM-CC-RT-DN'], aux: [{hssType: ['HM-CC-VD'], attr:'hm_idV'}], useDevice: true},
		'tplHqShutter': {findImage: false, hssType: ['HM-LC-Bl1-SM','HMW-LC-Bl1-DR','HM-LC-Bl1-FM','HM-LC-Bl1-PB-FM','HM-LC-Bl1PBU-FM'], 
		                 aux : [{hssType: ['HM-Sec-RHS'], attr:'hm_id_hnd0'}, 
						        {hssType: ['HM-Sec-SC','CC-SC-Rd-WM-W-R5','FHT80TF-2'],  attr:'hm_id0'}]},
		'tplHqDimmer' : {findImage: false, hssType: ['HM-LC-Dim1TPBU-FM','HM-LC-Dim1PWM-CV','HM-LC-Dim1T-FM','HM-LC-Dim1T-CV','HM-LC-Dim1T-PI','HM-LC-Dim1L-CV','HM-LC-Dim1L-Pl','HM-LC-Dim2L-SM','HMW-LC-Dim1L-DR']},
		'tplHqLock'   : {findImage: false, hssType: ['HM-Sec-Key-S']}
	},
	hmDeviceToWidget: function (device) {
		for (var w in dui.hm2Widget) {
			for (var j = 0; j < dui.hm2Widget[w].hssType.length; j++) {
				if (dui.hm2Widget[w].hssType[j] == device) {
					return w;
				}
			}
		}
		return null;
	},
	wizardGetFunction : function (channel) {
		var hm_id = channel;
		var func = null;
		while (hm_id && localData.metaObjects[hm_id]) {
			for (var t = 0; t < localData.metaIndex["ENUM_FUNCTIONS"].length; t++) {
				var list = localData.metaObjects[localData.metaIndex["ENUM_FUNCTIONS"][t]];
				for (var z = 0; z < list['Channels'].length; z++) {
					if (list['Channels'][z] == hm_id) {
						func = localData.metaIndex["ENUM_FUNCTIONS"][t];//list.Name;
						break;
					}
				}
				if (func)
					break;
			}
			if (func)
				break;
				
			hm_id = localData.metaObjects[hm_id]['Parent'];
		}
		return func;
	},
	// Try to find point for wirget
	wizardGetPoint: function (widgetName, channel) {
		if (dui.hm2Widget[widgetName].point) {
			for (var p in localData.metaObjects[channel]["DPs"]) {
				if (p == dui.hm2Widget[widgetName].point) {
					return localData.metaObjects[channel]["DPs"][p];
				}
			}
			var parent = localData.metaObjects[channel]["Parent"];
			if (localData.metaObjects[parent]["Channels"]) {
				for (var i = 0; i < localData.metaObjects[parent]["Channels"].length; i++) {
					var chn = localData.metaObjects[localData.metaObjects[parent]["Channels"][i]];
					if (channel == localData.metaObjects[parent]["Channels"][i]) {
						continue;
					}
					for (var p in chn["DPs"]) {
						if (p == dui.hm2Widget[widgetName].point) {
							return chn["DPs"][p];
						}
					}
				}
			}
		} else
		if (dui.hm2Widget[widgetName].useDevice) {
			while (localData.metaObjects[channel]["Parent"]) {
				channel = localData.metaObjects[channel]["Parent"];
			}
		}	
		return channel;
	},
	findUniqueDeviceInRoom: function (devNames, roomID) {
		var idFound = null;
		// Find all HM Devices belongs to this room
		var elems = localData.metaObjects[roomID]["Channels"];
		for (var i = 0; i < elems.length; i++) {
			var devID = localData.metaObjects[elems[i]]["Parent"];
			for(var j = 0;j < devNames.length; j++) {
				if (localData.metaObjects[devID]["HssType"] == devNames[j]) {
					if (idFound) {
						return null;
					}
					idFound = elems[i];
					break;
				}
			}
		}
		return idFound;
	},
	wizardCreateWidget: function (view, roomID, func, widgetName, devID, channel, point, pos) {
		var field = null;
		if (pos) {
			field = {x: pos.left, y: pos.top, width: 500};
		}
	
		// Find empty position for new widget
		var style = dui.findFreePosition (view, null, field, hqWidgets.gOptions.gBtWidth, hqWidgets.gOptions.gBtHeight);
		
		// Find function of the widget for filter key
		func = func || dui.wizardGetFunction (channel);
		
		// get device description
		var title = hmSelect._convertName(localData.metaObjects[channel].Name);
		// Remove ROOM from device name
		if (title.length > localData.metaObjects[roomID]["Name"].length && title.substring(0, localData.metaObjects[roomID]["Name"].length) == localData.metaObjects[roomID]["Name"])
			title = title.substring(localData.metaObjects[roomID]["Name"].length);
		// Remove the leading dot
		if (title.length > 0 && title[0] == '.')
			title = title.substring(1);
		
		// Get default settings
		var hqoptions = dui.binds.hqWidgetsExt.hqEditDefault(widgetName);
		hqoptions = $.extend(hqoptions, {"x": style.left,"y": style.top, "title": title, "hm_id": point, "room": localData.metaObjects[roomID]["Name"]});
		
		// Set image of widget
		if (dui.hm2Widget[widgetName].findImage) {
			hqoptions['iconName'] = hmSelect._getImage(localData.metaObjects[devID].HssType);
		}
		if (dui.hm2Widget[widgetName].aux) {
			for (var t = 0; t < dui.hm2Widget[widgetName].aux.length; t++) {
				// Try to find if only one device are in the room
				var hmId = dui.findUniqueDeviceInRoom (dui.hm2Widget[widgetName].aux[t].hssType, roomID);
				if (hmId) {
					hqoptions[dui.hm2Widget[widgetName].aux[t].attr] = hmId;
				}
			}
		}
		
		//var data = {"filterkey":func, "hqoptions": hqoptions}; TODO hqoptions stringify
        var data = {"filterkey":func, "hqoptions": JSON.stringify (hqoptions)};
		var wid = dui.addWidget (widgetName, data, style, null, view);
        $("#select_active_widget").append("<option value='"+wid+"'>"+wid+" ("+$("#"+dui.views[view].widgets[wid].tpl).attr("data-dashui-name")+")</option>");
        $("#select_active_widget").multiselect("refresh");
		return wid;
	},
	wizardIsWidgetExists: function (view, widgetName) {
		for (var w in dui.views[view].widgets) {
			if (dui.views[view].widgets[w].tpl == widgetName) {
				return true;
			}
		}
		return false;
	},
	// Create Date, time, history and may be weather
	wizardRunGeneral: function (view) {
		var data = {
			hm_id: 65535,
			digits: "",
			factor: 1,
			min: 0.00,
			max: 1.00,
			step: 0.01
		};
	
		if (!dui.wizardIsWidgetExists (view, "tplTwSimpleClock")) {
			var wid = dui.addWidget ("tplTwSimpleClock", {"hideSeconds": "true"});
			$("#select_active_widget").append("<option value='"+wid+"'>"+wid+" ("+$("#"+dui.views[view].widgets[wid].tpl).attr("data-dashui-name")+")</option>");
            $("#select_active_widget").multiselect("refresh");
		}
		if (!dui.wizardIsWidgetExists (view, "tplTwSimpleDate")) {
			var wid = dui.addWidget ("tplTwSimpleDate", {"showWeekDay": "true"});
			$("#select_active_widget").append("<option value='"+wid+"'>"+wid+" ("+$("#"+dui.views[view].widgets[wid].tpl).attr("data-dashui-name")+")</option>");
            $("#select_active_widget").multiselect("refresh");
		}
		if (!dui.wizardIsWidgetExists (view, "tplTwYahooWeather")) {
			var wid = dui.addWidget ("tplTwYahooWeather", data, {"width": 205, "height": 229});
			$("#select_active_widget").append("<option value='"+wid+"'>"+wid+" ("+$("#"+dui.views[view].widgets[wid].tpl).attr("data-dashui-name")+")</option>");
            $("#select_active_widget").multiselect("refresh");
		}
		if (!dui.wizardIsWidgetExists (view, "tplHqEventlist")) {
			var wid = dui.addWidget ("tplHqEventlist", data);
			$("#select_active_widget").append("<option value='"+wid+"'>"+wid+" ("+$("#"+dui.views[view].widgets[wid].tpl).attr("data-dashui-name")+")</option>");
            $("#select_active_widget").multiselect("refresh");
		}
	},
	wizardRunOneRoom: function (view, roomID, funcs, widgets) {
		// Find first created element belongs to this room
		var pos = null;
		var idCreated = null;
		for (var w in dui.views[view].widgets) {
			var wObj = dui.views[view].widgets[w];
			if (wObj.data.hqoptions &&
			    wObj.data.hqoptions.indexOf ('"room":"' + localData.metaObjects[roomID]["Name"] + '"') != -1) {
//                wObj.data.hqoptions.room == localData.metaObjects[roomID]["Name"]) { TODO hqoptions stringify
				if (pos == null) {
					pos = {left: wObj.style.left, top: wObj.style.top};
				} else {
					if (pos.left > wObj.style.left) {
						pos.left = wObj.style.left;
					}
					if (pos.top > wObj.style.top) {
						pos.top = wObj.style.top;
					}
				}	
				break;
			}
		}

		// Find all HM Devices belongs to this room
		var elems = localData.metaObjects[roomID]["Channels"];
		for (var i = 0; i < elems.length; i++) {
			var devID = localData.metaObjects[elems[i]]["Parent"];
			var widgetName = dui.hmDeviceToWidget (localData.metaObjects[devID]["HssType"]);
			if (widgetName) {
				// filter out not selected widgets
				if (widgets) {
					if (widgets == "_nobat") {
						if (widgetName == "tplHqLowbat") {
							continue;
						}
					} else 
					if (widgetName != widgets) {
						continue;				
					}
				}
			
				var isFound = false;
				var func = null;
				var hm_id = dui.wizardGetPoint(widgetName, elems[i]);
				
				// Check if this widget exists
				for (var w in dui.views[view].widgets) {
					if (dui.views[view].widgets[w].data.hqoptions) {
						var btn = hqWidgets.Get (w);
						if (btn) {
							var opt = btn.GetSettings();
							if (elems[i] == opt["hm_id"] || opt["hm_id"] == hm_id) {
								isFound = true;
								break;
							}
						}
					}
				}
				// Check function
				if (funcs) {
					func = dui.wizardGetFunction (elems[i]);
					if (funcs != func) {
						continue;
					}
				}
								
				if (!isFound) {
					if (pos == null && idCreated) {
						return idCreated;
					}
					// Create this widget
					var widgetId = dui.wizardCreateWidget (view, roomID, localData.metaObjects[func]["Name"], widgetName, devID, elems[i], hm_id, pos);

					if (pos == null) {
						idCreated = widgetId;
					}
				}
			}
		}
		return null;
	},
	wizardRun: function (view) {
		var room = $('#wizard_rooms').val();
		var widgetIds = [];
		if (!room) {
			var elems = localData.metaIndex['ENUM_ROOMS'];// IDs of all ROOMS
			for (var r in elems) {
				if (room != '_general') {
					var wid = dui.wizardRunOneRoom (view, elems[r], $('#wizard_funcs').val(), $('#wizard_widgets').val());
					if (wid) {
						widgetIds[widgetIds.length] = wid;
					}
				} else {
					dui.wizardRunGeneral (view);
				}
			}		
		} else {
			if (room != '_general') {
				var wid = dui.wizardRunOneRoom (view, room, $('#wizard_funcs').val(), $('#wizard_widgets').val());
				if (wid) {
					widgetIds[widgetIds.length] = wid;
				}
			} else {
				dui.wizardRunGeneral (view);
			}
		}
		if (widgetIds.length) {
			window.alert (dui.translate ("Place following widget to the room and start wizard again"));
			for (var i = 0; i < widgetIds.length; i++) {
				dui.actionNewWidget (widgetIds[i]);
			}
			dui.inspectWidget(widgetIds[widgetIds.length - 1]);
		}
		
		// Save the changes
		dui.binds.hqWidgetsExt.hqEditSave ();
	},
	fillWizard: function () {
		var elems = localData.metaIndex['ENUM_ROOMS'];// IDs of all ROOMS
		var jSelect = $('#wizard_rooms').html("").addClass('dashui-wizard-select');
		for (var r in elems) {
			jSelect.append("<option value='"+elems[r]+"'>"+localData.metaObjects[elems[r]]["Name"]+"</option>\n");
		}
		jSelect.append('<option value="_general">'+dui.translate("General")+'</option>');
		jSelect.append('<option value="">'+dui.translate("All")+'</option>');
		
		elems = localData.metaIndex['ENUM_FUNCTIONS'];// IDs of all ROOMS
		jSelect = $('#wizard_funcs').html("").addClass('dashui-wizard-select');
		jSelect.append('<option value="">'+dui.translate("All")+'</option>');
		for (var r in elems) {
			jSelect.append("<option value='"+elems[r]+"'>"+localData.metaObjects[elems[r]]["Name"]+"</option>\n");
		}
		jSelect = $('#wizard_widgets').html("").addClass('dashui-wizard-select');
		jSelect.append('<option value="_nobat">'+dui.translate("All except Low battery")+'</option>');
		jSelect.append('<option value="">'+dui.translate("All")+'</option>');
		for (var r in dui.hm2Widget) {
			for (var i = 0; i < dui.widgetSets.length; i++) {
				var name = dui.widgetSets[i].name || dui.widgetSets[i];
				$(".dashui-tpl[data-dashui-set='" + name + "']").each(function () {
					if (r == $(this).attr("id")) {
						$('#wizard_widgets').append("<option value='"+$(this).attr("id")+"'>"+$(this).attr("data-dashui-name")+"</option>\n");
					}
				});	
			}
		}
		$( "#wizard_run" ).button ({icons: {primary: "ui-icon-wrench"}}).bind( "click", function() {
			dui.wizardRun(dui.activeView);
		});
	}
});
