/**
 *  DashUI
 *  https://github.com/GermanBluefox/DashUI/
 *
 *  Copyright (c) 2013 Bluefox https://github.com/GermanBluefox
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
 // duiEdit - the DashUI Editor Wizard

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
		return func;
	},
	// Try to find point for wirget
	wizardGetPoint: function (widgetName, channel) {
		if (dui.hm2Widget[widgetName].point) {
			for (var p in homematic.regaObjects[channel]["DPs"]) {
				if (p == dui.hm2Widget[widgetName].point) {
					return homematic.regaObjects[channel]["DPs"][p];
				}
			}
			var parent = homematic.regaObjects[channel]["Parent"];
			if (homematic.regaObjects[parent]["Channels"]) {
				for (var i = 0; i < homematic.regaObjects[parent]["Channels"].length; i++) {
					var chn = homematic.regaObjects[homematic.regaObjects[parent]["Channels"][i]];
					if (channel == homematic.regaObjects[parent]["Channels"][i]) {
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
			while (homematic.regaObjects[channel]["Parent"]) {
				channel = homematic.regaObjects[channel]["Parent"];
			}
		}	
		return channel;
	},
	findUniqueDeviceInRoom: function (devNames, roomID) {
		var idFound = null;
		// Find all HM Devices belongs to this room
		var elems = homematic.regaObjects[roomID]["Channels"];
		for (var i = 0; i < elems.length; i++) {
			var devID = homematic.regaObjects[elems[i]]["Parent"];
			for(var j = 0;j < devNames.length; j++) {
				if (homematic.regaObjects[devID]["HssType"] == devNames[j]) {
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
		var title = hmSelect._convertName(homematic.regaObjects[channel].Name);                                        
		// Remove ROOM from device name
		if (title.length > homematic.regaObjects[roomID]["Name"].length && title.substring(0, homematic.regaObjects[roomID]["Name"].length) == homematic.regaObjects[roomID]["Name"])
			title = title.substring(homematic.regaObjects[roomID]["Name"].length);
		// Remove the leading dot
		if (title.length > 0 && title[0] == '.')
			title = title.substring(1);
		
		// Get default settings
		var hqoptions = dui.binds.hqWidgetsExt.hqEditDefault(widgetName);
		hqoptions = $.extend(hqoptions, {"x": style.left,"y": style.top, "title": title, "hm_id": point, "room": homematic.regaObjects[roomID]["Name"]});
		
		// Set image of widget
		if (dui.hm2Widget[widgetName].findImage) {
			hqoptions['iconName'] = hmSelect._getImage(homematic.regaObjects[devID].HssType);
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
		
		var data = {"filterkey":func, "hqoptions": JSON.stringify (hqoptions)};
		var wid = dui.addWidget (widgetName, data, style, null, view);
        $("#select_active_widget").append("<option value='"+wid+"'>"+wid+" ("+$("#"+dui.views[view].widgets[wid].tpl).attr("data-dashui-name")+")</option>").multiselect("refresh");
		return wid;
	},
	// Create Date, time, history and may be weather
	wizardRunGeneral: function (view) {
	
	},
	wizardRunOneRoom: function (view, roomID, funcs, widgets) {
		// Find first created element belongs to this room
		var pos = null;
		var idCreated = null;
		for (var w in dui.views[view].widgets) {
			var wObj = dui.views[view].widgets[w];
			if (wObj.data.hqoptions && 
			    wObj.data.hqoptions.indexOf ('"room":"'+homematic.regaObjects[roomID]["Name"]+'"') != -1) {
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
		var elems = homematic.regaObjects[roomID]["Channels"];
		for (var i = 0; i < elems.length; i++) {
			var devID = homematic.regaObjects[elems[i]]["Parent"];
			var widgetName = dui.hmDeviceToWidget (homematic.regaObjects[devID]["HssType"]);
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
					var widgetId = dui.wizardCreateWidget (view, roomID, func, widgetName, devID, elems[i], hm_id, pos);

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
			var elems = homematic.regaIndex['ENUM_ROOMS'];// IDs of all ROOMS
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
			window.alert ("Place following widget to the room and start wizard again");
			for (var i = 0; i < widgetIds.length; i++) {
				dui.actionNewWidget (widgetIds[i]);
			}
			dui.inspectWidget(widgetIds[widgetIds.length - 1]);
		}
	},
	fillWizard: function () {
		var elems = homematic.regaIndex['ENUM_ROOMS'];// IDs of all ROOMS
		var jSelect = $('#wizard_rooms').html("").addClass('dashui-wizard-select');
		for (var r in elems) {
			jSelect.append("<option value='"+elems[r]+"'>"+homematic.regaObjects[elems[r]]["Name"]+"</option>\n");
		}
		jSelect.append('<option value="_general">'+dui.translate("General")+'</option>');
		jSelect.append('<option value="">'+dui.translate("All")+'</option>');
		
		elems = homematic.regaIndex['ENUM_FUNCTIONS'];// IDs of all ROOMS
		jSelect = $('#wizard_funcs').html("").addClass('dashui-wizard-select');
		jSelect.append('<option value="">'+dui.translate("All")+'</option>');
		for (var r in elems) {
			jSelect.append("<option value='"+elems[r]+"'>"+homematic.regaObjects[elems[r]]["Name"]+"</option>\n");
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
		$( "#wizard_run" ).bind( "click", function() {
			dui.wizardRun(dui.activeView);
		});
	}
});
