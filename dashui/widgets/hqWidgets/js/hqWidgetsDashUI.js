if ((typeof hqWidgets !== 'undefined')) {
    jQuery.extend(true, dui.binds, {
        hqWidgetsExt: {
            version: "0.1.11",
            inited:  false,
            hqIgnoreNextUpdate: null, // id of controlled element
            hqMapping: {},
            hqInit: function () {
                if (!localData || !localData.uiState || !localData.uiState.bind)
                    return;
                    
                if (dui.binds.hqWidgetsExt.inited)
                    return;
                
                dui.binds.hqWidgetsExt.inited = true;
                
                // Extend types with specific types
                hqWidgets.gButtonType = $.extend (hqWidgets.gButtonType, 
                    {gTypeCharts:     100,
                     gTypeEventlist:  101
                    });
                
                // Init hqWidgets engine
                hqWidgets.Init ({gPictDir: "widgets/hqWidgets/img/", gLocale: dui.language});
                if (hqWidgets.version != dui.binds.hqWidgetsExt.version) {
                    window.alert ("The versions of hqWidgets.js and hqWidgets.html are different. Expected version of hqWidgets.js is " +dui.binds.hqWidgetsExt.version);
                }
                
                // Why this does not work?
                /*localData.uiState.bind("change", function( e, attr, how, newVal, oldVal ) {
                    if (how != "set") 
                        return;
                    
                    // extract name
                    attr = attr.substring (1);
                    var i = attr.indexOf (".");
                    if (i != -1)
                        attr = attr.substring (0, i);
                    if (localData.uiState["_" + attr]["Certain"])
                        dui.binds.hqWidgetsExt.hqMonitor (this, attr, localData.uiState["_" + attr]["Value"], true, localData.uiState["_" + attr]["Timestamp"]);
                });*/
                dui.registerOnChange (dui.binds.hqWidgetsExt.hqMonitor, this);
                
                if (dui.binds.hqWidgetsExt.hqEditInit) {
                    dui.binds.hqWidgetsExt.hqEditInit ();
                }
            },
            // Save settings of all widgets
            hqEditSave: function () {
                if (dui.binds.hqWidgetsExt.hqEditSaveTimer != null) {
                    clearTimeout(dui.binds.hqWidgetsExt.hqEditSaveTimer);
                }
                    
                dui.binds.hqWidgetsExt.hqEditSaveTimer = setTimeout (function () { 
                    dui.saveRemote (); 
                    console.log ("Saved!"); 
                    dui.binds.hqWidgetsExt.hqEditSaveTimer = null;
                }, 2000);
            },
            // Return widget for hqWidgets Button
            hqGetWidgetByObj: function (obj) {
                var duiWidget = dui.views[dui.activeView].widgets[obj.advSettings.elemName];
                if (duiWidget === undefined) {
                    for (var view in dui.views) {
                        if (dui.views[view].widgets[obj.advSettings.elemName]) {
                            duiWidget = dui.views[view].widgets[obj.advSettings.elemName];
                            break;
                        }
                    }
                }
                
                return duiWidget;
            },
            // Save settings of one widget
            hqEditStore: function (obj, opt) {
                var newOpt = JSON.stringify (opt);
                //var newOpt = opt; TODO hqoptions stringify
                var duiWidget = dui.binds.hqWidgetsExt.hqGetWidgetByObj (obj);
                
                if (duiWidget) {
                    duiWidget.data.hqoptions = newOpt;
                    //obj.intern._jelement.attr ('hqoptions', newOpt);
                    dui.binds.hqWidgetsExt.hqEditSave ();
                }
                else
                    console.log ("Cannot find " + duiWidget.advSettings.elemName + " in any view");
            },
            // Save settings of one widget
            hqEditStoreInfoWindow: function (obj, opt) {
                // Fix position of window
                if (opt.y < -10) {
                    opt.y = -10;
                }
                if (opt.x < 0 && opt.x < 60 - opt.width) {
                    opt.x = 60 - opt.width;
                }
                var newOpt = JSON.stringify (opt);
                    
                var duiWidget = dui.binds.hqWidgetsExt.hqGetWidgetByObj (obj);
                
                if (duiWidget) {
                    duiWidget.data.informWindow = newOpt;                        
                    obj.intern._jelement.attr ('informWindow', newOpt);
                    console.log ("Stored info window: " + newOpt);
                    dui.binds.hqWidgetsExt.hqEditSave ();
                }
                else
                    console.log ("Cannot find " + duiWidget.advSettings.elemName + " in any view");
            },
            hqOnShow: function (widgetDiv, widgetId) {
                var btn = hqWidgets.Get(widgetId);
                btn.show();
            },
            hqOnHide: function (widgetDiv, widgetId) {
                var btn = hqWidgets.Get(widgetId);
                btn.hide();
            },
            hqButtonExt: function (el, options, wtype, view) {
                if (options && typeof options == "string"){
                    try {
                        options = $.parseJSON(options);
                    } catch (e) {
                        options = {};
                        servConn.logError("Cannot parse hqoptions: " + e);
                    }
                }

                var opt = options || dui.binds.hqWidgetsExt.hqEditDefault (wtype);
                var hm_ids = [];
                // Define store settings function
                var adv = {store: dui.binds.hqWidgetsExt.hqEditStore};
                
                // Set default type to button
                if (opt.buttonType === undefined) {
                    opt.buttonType = hqWidgets.gButtonType.gTypeButton;
                }
                
                // If first creation in non-edit mode
                if (wtype === undefined) {
                    // non-edit mode => define event handlers
                    if (opt.buttonTypeEx !== undefined && opt.buttonTypeEx == hqWidgets.gButtonType.gTypeCharts) {
                        adv = $.extend (adv, {action: function (obj, what, state) {
                            // Show grafik in a new window
                            var hm_id = opt['hm_ids'];
                            var points = [];
                            if (hm_id != null && hm_id != "") {
                                points = hm_id.split(',');
                            }
                            if (points[0]) {
                                var src = document.location.href;
                                var i = src.lastIndexOf("/dashui");
                                if (i > 0) {
                                    src = src.substring (0, i) + "/charts/";
                                    var url = src+'?dp=';
                                    for (var t = 0; t < points.length; t++) {
                                        url += ((t > 0) ? ',' : '') + points[t];
                                    }
                                    url += '&navserie='+points[0];
                                    if (opt["charts"] !== undefined) {
                                        for(var property in opt["charts"]) {
                                           // you can get the value like this: myObject[propertyName]
                                           url += '&'+property+'='+opt["charts"][property];
                                        }
                                    }
                                    else
                                        url += '&theme=&percentaxis=true&loader=false&legend=inline&period=72&range=24';
                                    var win=window.open(url, 'myCharts');
                                    win.focus();                            
                                }
                            }
                        }});
                    }
                    else
                    if (opt.buttonTypeEx !== undefined && opt.buttonTypeEx == hqWidgets.gButtonType.gTypeEventlist) {
                        adv = $.extend (adv, {action: function (obj, what, state) {
                            // Show grafik in a new window
                            var src = document.location.href;
                            var i = src.lastIndexOf("/dashui");
                            if (i > 0) {
                                src = src.substring (0, i) + "/eventlist/";
                                 var url = "";
                                if (opt['hm_ids'] !== undefined && opt['hm_ids'] != "") {
                                    url += ((url !="") ? "&" : "?") + "hmid=" + opt['hm_ids'];
                                }
                                if (opt['exLoading'] !== undefined && opt['exLoading'] !== "") {
                                    url += ((url !="") ? "&" : "?") + "loading=" + opt['exLoading'];
                                }
                                if (opt['exAdvanced'] !== undefined && opt['exAdvanced'] !== "") {
                                    url += ((url !="") ? "&" : "?") + "advanced=" + opt['exAdvanced'];
                                }
                                if (opt['exStatesOnly'] !== undefined && opt['exStatesOnly'] !== "") {
                                    url += ((url !="") ? "&" : "?") + "states=" + opt['exStatesOnly'];
                                }
                                if (opt['exWidth'] !== undefined && opt['exWidth'] != "" && opt['exWidth'] != "0" && opt['exWidth'] != 0) {
                                    url += ((url !="") ? "&" : "?") + "width=" + opt['exWidth'];
                                }
                                if (opt['exTypes'] !== undefined && opt['exTypes'] !== "") {
                                    url += ((url !="") ? "&" : "?") + "types=" + opt['exTypes'];
                                }
                                if (opt['exPcount'] !== undefined && opt['exPcount'] !== "") {
                                    url += ((url !="") ? "&" : "?") + "pcount=" + opt['exPcount'];
                                }
                                var win=window.open(src+url, 'myCharts');
                                win.focus();                            
                            }
                        }});
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeDimmer) {
                        adv = $.extend (adv, {action: function (obj, what, state) {
                            var hm_id   = obj.GetSettings ('hm_id');
                            var time_id = hm_id;
                            if (hm_id != null && hm_id != "") {
                                if (localData.metaObjects[hm_id] && localData.metaObjects[hm_id]["DPs"] && localData.metaObjects[hm_id]["DPs"]["LEVEL"]) {
                                    hm_id = localData.metaObjects[hm_id]["DPs"]["LEVEL"];
                                } else {
                                    time_id = null;
                                }
                                if (what == 'state') {
                                    var startValue = obj.GetSettings ('startValue') || 100;
                                    startValue = parseInt (startValue);

                                    // Send on time to dimmer
                                    if (time_id != null) {
                                        if (localData.metaObjects[time_id] && localData.metaObjects[time_id]["DPs"] && localData.metaObjects[time_id]["DPs"]["RAMP_TIME"]) {
                                            time_id = localData.metaObjects[time_id]["DPs"]["RAMP_TIME"];
                                            var on_time = obj.GetSettings ('dimmerRampTime');
                                        }
                                    }
                                    if (state != hqWidgets.gState.gStateOn) {
                                        obj.SetStates ({percentState: startValue, state: hqWidgets.gState.gStateOn, isRefresh: true});
                                        // Send command to HM
                                        if (on_time !== undefined && on_time != null && on_time != "") {
                                            localData.setValue( time_id, parseFloat(on_time));
                                        }
                                        localData.setValue( hm_id, startValue / 100);
                                    } else {
                                        obj.SetStates ({percentState: 0, state: hqWidgets.gState.gStateOff, isRefresh: true});
                                        // Send command to HM
                                        if (on_time !== undefined && on_time != null && on_time != "") {
                                            localData.setValue( time_id, parseFloat(on_time));
                                        }
                                        localData.setValue( hm_id, 0);
                                    }
                                } else {
                                    if (state != 0) {
                                        obj.SetStates ({state: hqWidgets.gState.gStateOn});
                                    }
                                    else {
                                        obj.SetStates ({state: hqWidgets.gState.gStateOff});
                                    }
                                    //console.log ("SetState: "+ hm_id + " = " + (state / 100));
                                    // Send command to HM
                                    localData.setValue( hm_id, state / 100);
                                }  
                            }                                                
                        }});
                        // Fill up the required IDs
                        var w = 0;
                        if (opt["hm_id"] != null && opt["hm_id"] != "") {
                            if (localData.metaObjects[opt["hm_id"]] && localData.metaObjects[opt["hm_id"]]["DPs"] && localData.metaObjects[opt["hm_id"]]["DPs"]["LEVEL"]) {
                                hm_ids[w++] = {'hm_id': localData.metaObjects[opt["hm_id"]]["DPs"]["LEVEL"],    option: 'percentState'}; // First is always main element
                                hm_ids[w++] = {'hm_id': localData.metaObjects[opt["hm_id"]]["DPs"]["WORKING"],  option: 'isWorking'};
                                if (localData.metaObjects[opt["hm_id"]]["DPs"]["RAMP_TIME"]) {
                                    hm_ids[w++] = {'hm_id': localData.metaObjects[opt["hm_id"]]["DPs"]["RAMP_TIME"],option: 'dimmerRampTime'};
                                }
                            }
                            else if (localData.metaObjects[opt["hm_id"]]){
                                hm_ids[w++] = {'hm_id': opt['hm_id'], option: 'percentState'};
                            }
                        }                        
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeButton) {
						if (opt["exShowGrafik"] === undefined) {
							adv = $.extend (adv, {action: function (obj, what, state) {
								var hm_id = obj.GetSettings ('hm_id');
								if (hm_id != null && hm_id != "") {
									
									if (localData.metaObjects [opt['hm_id']] &&
										localData.metaObjects [opt['hm_id']]["TypeName"] !== undefined &&
										localData.metaObjects [opt['hm_id']]["TypeName"] == "PROGRAM") {
										console.log ("Activate programm " + localData.metaObjects [opt['hm_id']]["Name"]);
										// Execute program
                                        servConn.execProgramm(opt['hm_id']);
									}
									else {    
										if (localData.metaObjects[opt['hm_id']] && localData.metaObjects[opt['hm_id']]["DPs"] && localData.metaObjects[opt['hm_id']]["DPs"]["STATE"])
											hm_id = localData.metaObjects[opt['hm_id']]["DPs"]["STATE"];
										if (state != hqWidgets.gState.gStateOn) {
											state = hqWidgets.gState.gStateOn;
										}
										else {
											state = hqWidgets.gState.gStateOff;
										}
										
										obj.SetStates ({state: state, isRefresh: true});
										// Send command to HM
										var invertState = obj.GetSettings("invertState");
										if (invertState) {
											localData.setValue(hm_id, (state != hqWidgets.gState.gStateOn));
										} else {
											localData.setValue(hm_id, (state == hqWidgets.gState.gStateOn));
										}
									}
								}                                
							}});
						}
                        // Fill up the required IDs
                        var z = 0;
                        if (opt['hm_id'] != null && opt['hm_id'] != "") {
                            if (localData.metaObjects[opt['hm_id']] && localData.metaObjects[opt['hm_id']]["DPs"] && localData.metaObjects[opt['hm_id']]["DPs"]["STATE"]) {
                                hm_ids[z++] = {'hm_id': localData.metaObjects[opt['hm_id']]["DPs"]["STATE"], option: 'state'};
                            }
                            else if (localData.metaObjects[opt["hm_id"]]){
                                hm_ids[z++] = {'hm_id': opt["hm_id"], option: 'state'};
                            }
                        }
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeBlind) {
                        adv = $.extend (adv, {action: function (obj, what, state) {
                            var hm_id = obj.GetSettings ('hm_id');
                            if (hm_id != null && hm_id != "") {
                                if (localData.metaObjects[hm_id] && localData.metaObjects[hm_id]["DPs"] && localData.metaObjects[hm_id]["DPs"]["LEVEL"]) {
                                    hm_id = localData.metaObjects[hm_id]["DPs"]["LEVEL"];
                                }
                                obj.SetStates ({isRefresh: true});
								// Send command to HM
								var invertState = obj.GetSettings("invertState");
								if (invertState) {
									localData.setValue( hm_id, state / 100);
								} 
								else {
									localData.setValue( hm_id, (100 - state) / 100);
								}
                            }                                
                        }});
                        // Fill up the required IDs
                        var t = 0;
                        if (opt['hm_id'] != null && opt['hm_id'] != "") {
                            if (localData.metaObjects[opt["hm_id"]] && localData.metaObjects[opt["hm_id"]]["DPs"] && localData.metaObjects[opt["hm_id"]]["DPs"]["LEVEL"]) {
                                hm_ids[t++] = {'hm_id': localData.metaObjects[opt["hm_id"]]["DPs"]["LEVEL"],   option: 'percentState'}; // First is always main element
                                hm_ids[t++] = {'hm_id': localData.metaObjects[opt["hm_id"]]["DPs"]["WORKING"], option: 'isWorking'};
                            } else if (localData.metaObjects[opt["hm_id"]]){
                                hm_ids[t++] = {'hm_id': opt['hm_id'], option: 'percentState'};
                            }
                        }
                        for (var i = 0; i < 4; i++) {
							if (opt['hm_id'+i] && localData.metaObjects[opt['hm_id'+i]] && localData.metaObjects[opt['hm_id'+i]]["DPs"]) {
								if (localData.metaObjects[opt['hm_id'+i]]["DPs"]["STATE"])
									hm_ids[t++] = {'hm_id': localData.metaObjects[opt['hm_id'+i]]["DPs"]["STATE"],  option: 'windowState',  index:i};
								if (localData.metaObjects[opt['hm_id'+i]]["DPs"]["LOWBAT"])
									hm_ids[t++] = {'hm_id': localData.metaObjects[opt['hm_id'+i]]["DPs"]["LOWBAT"], option: 'lowBatteryS',  index:i};
							}
							if (opt['hm_id_hnd'+i] && localData.metaObjects[opt['hm_id_hnd'+i]] && localData.metaObjects[opt['hm_id_hnd'+i]]["DPs"]) {
								if (localData.metaObjects[opt['hm_id_hnd'+i]]["DPs"]["STATE"])
									hm_ids[t++] = {'hm_id': localData.metaObjects[opt['hm_id_hnd'+i]]["DPs"]["STATE"],  option: 'handleState',  index:i};
								if (localData.metaObjects[opt['hm_id_hnd'+i]]["DPs"]["LOWBAT"])
									hm_ids[t++] = {'hm_id': localData.metaObjects[opt['hm_id_hnd'+i]]["DPs"]["LOWBAT"], option: 'lowBatteryH',  index:i};
							}
                        }                   
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeInTemp) {
                        adv = $.extend (adv, {action: function (obj, what, state) {
                            var hm_id = obj.GetSettings ('hm_id');
                            if (hm_id != null && hm_id != "") {
                                if (localData.metaObjects[opt['hm_id']] && localData.metaObjects[opt['hm_id']]["Channels"]) {
                                    if (localData.metaObjects[opt['hm_id']]["HssType"] == "HM-CC-TC") {
                                        hm_id = localData.metaObjects[localData.metaObjects[opt['hm_id']]["Channels"][2]]["DPs"]["SETPOINT"];
                                    }
                                    else // HM-CC-RT-DN
                                    if (localData.metaObjects[opt['hm_id']]["HssType"] == "HM-CC-RT-DN") {
                                        hm_id = localData.metaObjects[localData.metaObjects[opt['hm_id']]["Channels"][4]]["DPs"]["SET_TEMPERATURE"];
                                    }
                                    else // HM-TC-IT-WM
                                    if (localData.metaObjects[opt['hm_id']]["HssType"] == "HM-TC-IT-WM-W-EU") {
                                        hm_id = localData.metaObjects[localData.metaObjects[opt['hm_id']]["Channels"][2]]["DPs"]["SET_TEMPERATURE"];
                                    }

                                }

                                console.log ("SetTemp: "+ hm_id + " = " + state);
                                // Send command to HM
                                localData.setValue (hm_id, state);
                            }
                        }});
                        // Fill up the required IDs
                        var t = 0;

                        if (opt['hm_id'] != null && opt['hm_id'] != "") {
                            var isHM_CC_RT_DN = false;
                            if (localData.metaObjects[opt['hm_id']] && localData.metaObjects[opt['hm_id']]["HssType"] == "HM-CC-TC") {
                                var weatherId = localData.metaObjects[opt['hm_id']]["Channels"][1];
                                var controlId = localData.metaObjects[opt['hm_id']]["Channels"][2];
                                hm_ids[t++] = {'hm_id': localData.metaObjects[controlId]["DPs"]["SETPOINT"],    option: 'valueSet'}; // First is always control element
                                hm_ids[t++] = {'hm_id': localData.metaObjects[weatherId]["DPs"]["TEMPERATURE"], option: 'temperature'};
                                hm_ids[t++] = {'hm_id': localData.metaObjects[weatherId]["DPs"]["HUMIDITY"],    option: 'humidity'};
                            }
                            else
                            if (localData.metaObjects[opt['hm_id']] && localData.metaObjects[opt['hm_id']]["HssType"] == "HM-CC-RT-DN") {
                                isHM_CC_RT_DN = true;
                                var controlId = localData.metaObjects[opt['hm_id']]["Channels"][4];
                                hm_ids[t++] = {'hm_id': localData.metaObjects[controlId]["DPs"]["SET_TEMPERATURE"],    option: 'valueSet'}; // First is always control element
                                hm_ids[t++] = {'hm_id': localData.metaObjects[controlId]["DPs"]["ACTUAL_TEMPERATURE"], option: 'temperature'};
                                hm_ids[t++] = {'hm_id': localData.metaObjects[controlId]["DPs"]["VALVE_STATE"],        option: 'valve'};
                                adv = $.extend (adv, {'hideHumidity': true});
                            } else
                            if (localData.metaObjects[opt['hm_id']] && localData.metaObjects[opt['hm_id']]["HssType"] == "HM-TC-IT-WM-W-EU") {
                                var weatherId = localData.metaObjects[opt['hm_id']]["Channels"][1];
                                var controlId = localData.metaObjects[opt['hm_id']]["Channels"][2];
                                hm_ids[t++] = {'hm_id': localData.metaObjects[controlId]["DPs"]["SET_TEMPERATURE"],    option: 'valueSet'}; // First is always control element
                                hm_ids[t++] = {'hm_id': localData.metaObjects[weatherId]["DPs"]["TEMPERATURE"], option: 'temperature'};
                                hm_ids[t++] = {'hm_id': localData.metaObjects[weatherId]["DPs"]["HUMIDITY"],    option: 'humidity'};
                                //Testweise - Button dafür nicht ausgelegt
                                if (localData.metaObjects[controlId]["DPs"]["LOWBAT_REPORTING"] !== undefined) {
                                    hm_ids[t++] = {'hm_id': localData.metaObjects[controlId]["DPs"]["LOWBAT_REPORTING"], option: 'lowBattery'};
                                }
                            }

                            if (localData.metaObjects[opt['hm_id']] && localData.metaObjects[opt['hm_id']]["DPs"] && localData.metaObjects[opt['hm_id']]["DPs"]["ACTUAL_TEMPERATURE"]) {
                                isHM_CC_RT_DN = true;
                                hm_ids[t++] = {'hm_id': localData.metaObjects[opt['hm_id']]["DPs"]["SET_TEMPERATURE"],    option: 'valueSet'}; // First is always control element
                                hm_ids[t++] = {'hm_id': localData.metaObjects[opt['hm_id']]["DPs"]["ACTUAL_TEMPERATURE"], option: 'temperature'};
                                hm_ids[t++] = {'hm_id': localData.metaObjects[opt['hm_id']]["DPs"]["VALVE_STATE"],        option: 'valve'};
                                adv = $.extend (adv, {'hideHumidity': true});
                            }
                            else if (localData.metaObjects[opt["hm_id"]]){
                                hm_ids[t++] = {'hm_id': opt['hm_id'], option: 'temperature'};
                            }

                            if (!isHM_CC_RT_DN) {
                                if (opt["hm_idV"]) {
                                    if (localData.metaObjects[opt["hm_idV"]] && localData.metaObjects[opt["hm_idV"]]["DPs"])
                                        hm_ids[t++] = {'hm_id': localData.metaObjects[opt["hm_idV"]]["DPs"]["VALVE_STATE"], option: 'valve'};
                                    else if (localData.metaObjects[opt["hm_idV"]])
                                        hm_ids[t++] = {'hm_id': opt["hm_idV"], option: 'valve'};
                                    adv = $.extend (adv, {'hideValve': false});
                                }
                                else {
                                    adv = $.extend (adv, {'hideValve': true});
                                }
                            }
                        }
                    } else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeOutTemp) {
                        // Fill up the required IDs
                        var t = 0;
                        if (opt['hm_id'] != null && opt['hm_id'] != "") {
                            if (localData.metaObjects[opt['hm_id']] && localData.metaObjects[opt['hm_id']]["DPs"]) {
                                hm_ids[t++] = {'hm_id': localData.metaObjects[opt['hm_id']]["DPs"]["TEMPERATURE"], option: 'temperature'};
                                hm_ids[t++] = {'hm_id': localData.metaObjects[opt['hm_id']]["DPs"]["HUMIDITY"],    option: 'humidity'};
                            }
                            else if (localData.metaObjects[opt["hm_id"]]){
                                hm_ids[t++] = {'hm_id': opt['hm_id'], option: 'temperature'};
                                if (opt["hm_idH"] && localData.metaObjects[opt["hm_idH"]]){
	                                hm_ids[t++] = {'hm_id': opt['hm_idH'], option: 'humidity'};
                                }
                            }
                        }  
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeDoor) {
                        // Fill up the required IDs
                        var t = 0;
                        if (opt['hm_id'] != null && opt['hm_id'] != "") {
                            if (localData.metaObjects[opt["hm_id"]] && localData.metaObjects[opt["hm_id"]]["DPs"] && localData.metaObjects[opt["hm_id"]]["DPs"]["STATE"]) {
                                hm_ids[t++] = {'hm_id': localData.metaObjects[opt["hm_id"]]["DPs"]["STATE"],  option: 'state'};
                                if (localData.metaObjects[opt['hm_id']]["DPs"]["LOWBAT"] !== undefined) {
                                    hm_ids[t++] = {'hm_id': localData.metaObjects[opt['hm_id']]["DPs"]["LOWBAT"], option: 'lowBattery'};
                                }                                
                            }
                            else if (localData.metaObjects[opt["hm_id"]]){
                                hm_ids[t++] = {'hm_id': opt['hm_id'], option: 'state'};
                            }
                        }  
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeLock) {
                       adv = $.extend (adv, {action: function (obj, what, state) {
                            var hm_id = obj.GetSettings ('hm_id');
                            if (hm_id != null && hm_id != "") {
                                obj.SetStates ({isRefresh: true});
                                if (state == hqWidgets.gLockType.gLockClose ||
                                    state == hqWidgets.gLockType.gLockOpen)
                                {
                                    if (localData.metaObjects[hm_id] && localData.metaObjects[hm_id]["DPs"] && localData.metaObjects[hm_id]["DPs"]["STATE"]){
                                        hm_id = localData.metaObjects[hm_id]["DPs"]["STATE"];
									}
                                     // Send command to HM
                                    localData.setValue( hm_id, (state == hqWidgets.gLockType.gLockClose) ? false : true);
                                }
                                else { // Open door
                                    if (localData.metaObjects[hm_id] && localData.metaObjects[hm_id]["DPs"] && localData.metaObjects[hm_id]["DPs"]["OPEN"])
                                        hm_id = localData.metaObjects[hm_id]["DPs"]["OPEN"];
                                    // Send command to HM
                                    localData.setValue( hm_id, true);
                                }
                            }                            
                        }});
                        // Fill up the required IDs
                        var t = 0;
                        if (opt['hm_id'] != null && opt['hm_id'] != "") {
                            if (localData.metaObjects[opt["hm_id"]] && localData.metaObjects[opt["hm_id"]]["DPs"] && localData.metaObjects[opt["hm_id"]]["DPs"]["STATE"]) {
                                hm_ids[t++] = {'hm_id': localData.metaObjects[opt["hm_id"]]["DPs"]["STATE"],   option: 'state'};
                                if (localData.metaObjects[opt["hm_id"]]["DPs"]["WORKING"]) {
                                    hm_ids[t++] = {'hm_id': localData.metaObjects[opt["hm_id"]]["DPs"]["WORKING"], option: 'isWorking'};
                                }
                                hm_ids[t++] = {'hm_id': localData.metaObjects[opt["hm_id"]]["DPs"]["OPEN"],    option: 'open'};
								if (localData.metaObjects[opt['hm_id']]["DPs"]["LOWBAT"] !== undefined)
									hm_ids[t++] = {'hm_id': localData.metaObjects[opt['hm_id']]["DPs"]["LOWBAT"], option: 'lowBattery'};
                                //hm_ids[t++] = {'hm_id': opt['hm_id'] + ".WORKING", option: 'isWorking'};
                            }
                            else if (localData.metaObjects[opt["hm_id"]]){
                                hm_ids[t++] = {'hm_id': opt['hm_id'], option: 'state'};
                            }
                        }  
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeInfo) {
                       adv = $.extend (adv, {action: function (obj, what, state) {
                            var hm_idOn   = obj.GetSettings ('hm_idC_On');
                            var hm_idOff  = obj.GetSettings ('hm_idC_Off');
                            var hm_valOn  = obj.GetSettings ('ctrlValueOn');
                            var hm_valOff = obj.GetSettings ('ctrlValueOff');
                            var htmlOn    = obj.GetSettings ('htmlOn');
                            var htmlOff   = obj.GetSettings ('htmlOff');
							
							var hm_id     = btn.GetSettings("hm_id");
							var isChangeState = (!hm_id && 
							  hm_idOn  !== undefined && hm_idOn  != null && hm_idOn  != "" && 
							  hm_idOff !== undefined && hm_idOff != null && hm_idOff != "");
                            
                            if (hm_idOn) {
                                if (hm_valOn === undefined || hm_valOn == null == hm_valOn == "")
                                    hm_valOn = true;
                                    
                                if (hm_valOff === undefined || hm_valOff == null == hm_valOff == "")
                                    hm_valOff = hm_valOn;
                                    
                                //If control depends of state
                                if (!hm_idOff)
                                    hm_idOff = hm_idOn;
                                    
                                var states = obj.GetStates ();
                                // Get actual state
                                if (states.state == hqWidgets.gState.gStateOn) {
                                    localData.setValue(hm_idOff, hm_valOff);
									if (isChangeState) {
										obj.SetStates({state: hqWidgets.gState.gStateOff});
									}
								} else {
                                    localData.setValue(hm_idOn, hm_valOn);
									if (isChangeState) {
										obj.SetStates({state: hqWidgets.gState.gStateOn});
									}
								}
                            } else 
							// Call URL
							if (htmlOn) {
								isChangeState = (!hm_id && htmlOn && htmlOff);
								
                                //If control depends of state
                                if (!htmlOff)
                                    htmlOff = htmlOn;

                                // Get actual state
                                var states = obj.GetStates ();
								
                                if (states.state == hqWidgets.gState.gStateOn) {
                                    servConn.getUrl(htmlOff);
									if (isChangeState) {
										obj.SetStates({state: hqWidgets.gState.gStateOff});
									}
								} else {
                                    servConn.getUrl(htmlOn);
									if (isChangeState) {
										obj.SetStates({state: hqWidgets.gState.gStateOn});
									}
								}
							}
                        }});
                        // Fill up the required IDs
                        var t = 0;
                        if (opt['hm_id'] != null && opt['hm_id'] != "" && localData.metaObjects[opt["hm_id"]]) {
                            hm_ids[t++] = {'hm_id': opt['hm_id'], option: 'infoText'};
                        }				
                    }                
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeMotion) {
                        adv = $.extend (adv, {action: function (obj, what, state) {
                            if (obj.GetSettings ('isPopupEnabled')) {
                                var isValueChart = obj.GetSettings ('exIsChart');
                                if (isValueChart) {
                                    // Show chart of value
                                }
                                else {
                                    // Show history of state
                                }
                            }
                                                
                        }});
                        // Fill up the required IDs
                        var t = 0;
                        if (opt["hm_id"] != null && opt["hm_id"] != "") {
                            var isBright = false;
                            if (localData.metaObjects[opt["hm_id"]] && localData.metaObjects[opt["hm_id"]]["DPs"]) {
                                if (localData.metaObjects[opt["hm_id"]]["DPs"]["MOTION"]) {
                                    hm_ids[t++] = {'hm_id': localData.metaObjects[opt["hm_id"]]["DPs"]["MOTION"],      option: 'state'}; // First is always main element
                                    hm_ids[t++] = {'hm_id': localData.metaObjects[opt["hm_id"]]["DPs"]["BRIGHTNESS"],  option: 'percentState'};
									opt = $.extend (opt, {'isShowPercent': true});
                                    isBright = true;
                                }
                                                      
                                else 
                                if (localData.metaObjects[opt["hm_id"]]["DPs"]["STATE"]){
                                    hm_ids[t++] = {'hm_id': localData.metaObjects[opt["hm_id"]]["DPs"]["STATE"], option: 'state'};
									opt = $.extend (opt, {'isShowPercent': false});
                                }
								// no else here
                                if (localData.metaObjects[opt['hm_id']]["DPs"]["LOWBAT"] !== undefined) {
                                    hm_ids[t++] = {'hm_id': localData.metaObjects[opt['hm_id']]["DPs"]["LOWBAT"], option: 'lowBattery'};
									opt = $.extend (opt, {'isShowPercent': false});
                                }                                
                            }
                            else
                            if (localData.metaObjects[opt["hm_id"]] && localData.metaObjects[opt["hm_id"]]["Name"] && localData.metaObjects[opt["hm_id"]]["Name"].indexOf(".MOTION") != -1) {
                                hm_ids[t++] = {'hm_id': opt["hm_id"],      option: 'state'}; // First is always main element
                                
                                if (localData.metaObjects[opt["hm_id"]]["Parent"]) {
                                    var parent = localData.metaObjects[opt["hm_id"]]["Parent"];
                                    if (localData.metaObjects[parent] && localData.metaObjects[parent]["DPs"] && localData.metaObjects[parent]["DPs"]["BRIGHTNESS"]) {
                                        hm_ids[t++] = {'hm_id': localData.metaObjects[parent]["DPs"]["BRIGHTNESS"],  option: 'percentState'};
                                        opt = $.extend (opt, {'isShowPercent': true});
                                        isBright = true;
                                        parent = localData.metaObjects[parent]["Parent"];
                                        if (parent != null && localData.metaObjects[parent] &&
                                            localData.metaObjects[parent]["Channels"] && localData.metaObjects[parent]["Channels"][0]) {
                                            parent = localData.metaObjects[parent]["Channels"][0];
                                            if (localData.metaObjects[parent]["DPs"] && localData.metaObjects[parent]["DPs"]["LOWBAT"]) {
                                                hm_ids[t++] = {'hm_id': localData.metaObjects[parent]["DPs"]["LOWBAT"], option: 'lowBattery'};
                                            
                                            }
                                        }
                                    }
                                }
                            }          
                            else if (localData.metaObjects[opt["hm_id"]]){
                                hm_ids[t++] = {'hm_id': opt["hm_id"], option: 'state'};                                    
                            }
                            
                            if (!isBright && opt['hm_idB'] !== undefined && opt['hm_idB'] != null && opt['hm_idB'] != "") {
                                hm_ids[t++] = {'hm_id': opt['hm_idB'],  option: 'percentState'};                         
								opt = $.extend (opt, {'isShowPercent': true});
                            }
                        }                        
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeCam) {
                        if (!dui.editMode) {
                            adv = $.extend (adv, {/*state: hqWidgets.gState.gStateOff, */isWorking: false,
                                action: function (obj, what, state) {                                    
                                    var hm_id = obj.GetSettings ('hm_idL');
                                    if (hm_id != null && hm_id != "") {
                                        if (localData.metaObjects[hm_id] && localData.metaObjects[hm_id]["DPs"] && localData.metaObjects[hm_id]["DPs"]["OPEN"]) {
                                            hm_id = localData.metaObjects[hm_id]["DPs"]["OPEN"];
                                        }
                                        else
                                        if (localData.metaObjects[hm_id] && localData.metaObjects[hm_id]["DPs"] && localData.metaObjects[hm_id]["DPs"]["STATE"]) {
                                            hm_id = localData.metaObjects[hm_id]["DPs"]["STATE"];
                                        }
                                        // Send command to HM
                                        localData.setValue( hm_id, true);
                                    }                            
                                }});
                        }                    
                        // Fill up the required IDs
                        var t = 0;
                        if (opt['hm_id'] != null && opt['hm_id'] != "") {
                            if (localData.metaObjects[opt["hm_id"]] && localData.metaObjects[opt["hm_id"]]["DPs"] && localData.metaObjects[opt["hm_id"]]["DPs"]["STATE"]) {
                                hm_ids[t++] = {'hm_id': localData.metaObjects[opt["hm_id"]]["DPs"]["STATE"], option: 'state'};
                            }
                            else if (localData.metaObjects[opt["hm_id"]]){
                                hm_ids[t++] = {'hm_id': opt['hm_id'], option: 'state'};
                            }
                        }
                         
                        if (opt['hm_idL'] != null && opt['hm_idL'] != "") {
                            if (localData.metaObjects[opt["hm_idL"]] && localData.metaObjects[opt["hm_idL"]]["DPs"] && localData.metaObjects[opt["hm_idL"]]["DPs"]["STATE"]) {
                                hm_ids[t++] = {'hm_id': localData.metaObjects[opt["hm_idL"]]["DPs"]["STATE"], option: 'open'};
							}
                            else if (localData.metaObjects[opt["hm_idL"]])
                                hm_ids[t++] = {'hm_id': opt['hm_idL'], option: 'open'};
                        }     
                          
                    }   
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeGong) {
                        adv = $.extend (adv, {action: function (obj, what, state) {
                            if (!dui.editMode) {
                                // Open the door
                                if (what == 'open') {
                                    var hm_id = obj.GetSettings ('hm_idL');
                                    if (hm_id != null && hm_id != "") {
                                        if (localData.metaObjects[hm_id] && localData.metaObjects[hm_id]["DPs"] && localData.metaObjects[hm_id]["DPs"]["OPEN"]) {
                                            hm_id = localData.metaObjects[hm_id]["DPs"]["OPEN"];
                                        }
                                        // Send command to HM
                                        localData.setValue( hm_id, true);
                                    }   
                                }
                                else { // Play melody or blink with LED
                                    var hm_id = obj.GetSettings ('hm_id');
                                    if (hm_id != null && hm_id != "") {
                                        if (localData.metaObjects[opt["hm_id"]] && localData.metaObjects[opt["hm_id"]]["DPs"] && localData.metaObjects[opt["hm_id"]]["DPs"]["STATE"]) {
                                            hm_id = localData.metaObjects[opt["hm_id"]]["DPs"]["STATE"];
                                        }
                                        // Send command to HM
                                        localData.setValue( hm_id, true);
                                        // Switch of in 2 seconds
                                        setTimeout (function (id) { localData.setValue( id, false);}, 2000, hm_id);
                                    }                            
                                }  
                            }                                
                        }});
                        // Fill up the required IDs
                        var t = 0;
                        if (opt['hm_id'] != null && opt['hm_id'] != "") {
                            if (localData.metaObjects[opt["hm_id"]] && localData.metaObjects[opt["hm_id"]]["DPs"] && localData.metaObjects[opt["hm_id"]]["DPs"]["STATE"]) {
                                hm_ids[t++] = {'hm_id': localData.metaObjects[opt["hm_id"]]["DPs"]["STATE"], option: 'state'};
								if (localData.metaObjects[opt['hm_id']]["DPs"]["LOWBAT"] !== undefined)
									hm_ids[t++] = {'hm_id': localData.metaObjects[opt['hm_id']]["DPs"]["LOWBAT"], option: 'lowBattery'};
                            }
                            else if (localData.metaObjects[opt["hm_id"]]){
                                hm_ids[t++] = {'hm_id': opt['hm_id'], option: 'state'};
                            }
                        }  
                        if (opt['hm_idL'] != null && opt['hm_idL'] != "") {
                            if (localData.metaObjects[opt["hm_idL"]] && localData.metaObjects[opt["hm_idL"]]["DPs"] && localData.metaObjects[opt["hm_idL"]]["DPs"]["STATE"]) {
                                hm_ids[t++] = {'hm_id': localData.metaObjects[opt["hm_idL"]]["DPs"]["STATE"], option: 'open'};
								if (localData.metaObjects[opt['hm_idL']]["DPs"]["LOWBAT"] !== undefined)
									hm_ids[t++] = {'hm_id': localData.metaObjects[opt['hm_idL']]["DPs"]["LOWBAT"], option: 'lowBattery'};
							}
                            else if (localData.metaObjects[opt["hm_idL"]])
                                hm_ids[t++] = {'hm_id': opt['hm_idL'], option: 'open'};
                        }
                    }   
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeImage) {
                        if (opt.width === 0 || opt.width === "0")
                            opt.width = undefined;
                        if (opt.height === 0 || opt.height === "0")
                            opt.height = undefined;
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeGauge) {
                        // Fill up the required IDs
                        var t = 0;
                        if (opt['hm_id'] != null && opt['hm_id'] != "" && localData.metaObjects[opt["hm_id"]]) {
                            hm_ids[t++] = {'hm_id': opt['hm_id'], option: 'valueSet'}; 
                        }  
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeLowbat) {
                        // Fill up the required IDs
                        var t = 0;
                        if (opt['hm_id'] != null && opt['hm_id'] != "") {
                            if (localData.metaObjects[opt["hm_id"]] && localData.metaObjects[opt["hm_id"]]["DPs"] && localData.metaObjects[opt["hm_id"]]["DPs"]["LOWBAT"]) {
                                hm_ids[t++] = {'hm_id': localData.metaObjects[opt['hm_id']]["DPs"]["LOWBAT"], option: 'state'};
                            }
                            else if (localData.metaObjects[opt["hm_id"]]){
                                hm_ids[t++] = {'hm_id': opt['hm_id'], option: 'state'};
                            }
                        }  
                    }
                }
                
                var btn = hqWidgets.Create(opt, {elemName: el, parent: $("#duiview_"+view)});//dui.activeView)});
 
                // Create signal translators
                if (wtype === undefined) {                  
                    if (opt.buttonTypeEx !== undefined && opt.buttonTypeEx == hqWidgets.gButtonType.gTypeCharts) {
                        // Get stored settings for info window
                        var wObj = dui.binds.hqWidgetsExt.hqGetWidgetByObj (btn);
                        btn.SetStates({state: hqWidgets.gState.gStateOff});
                        if (opt.exPopup == true) {
                            var storedInfo = null;
                            if (wObj !== undefined && wObj.data !== undefined && wObj.data !== null && wObj.data.informWindow !== undefined) {
                                storedInfo = $.parseJSON(wObj.data.informWindow);
                                // Fix position
                                if (storedInfo.x && storedInfo.x < 0 && storedInfo.x < 60 - storedInfo.width) {
                                    storedInfo.x = 60 - storedInfo.width;
                                }
                                if (storedInfo.y && storedInfo.y < -10) {
                                    storedInfo.y = -10;
                                }
                            }
                            var infoWindow = btn.GetInfoWindowSettings ();
                            infoWindow.isEnabled     = true;
                            infoWindow.content       = "";
                            infoWindow.isShowButtons = true;
                            infoWindow.pinShow       = true;
                            infoWindow.showPinned    = true;
                            infoWindow.width         = (storedInfo == null) ? 800:  storedInfo.width;
                            infoWindow.height        = (storedInfo == null) ? 400:  storedInfo.height;
                            infoWindow.x             = (storedInfo == null) ? null: storedInfo.x;
                            infoWindow.y             = (storedInfo == null) ? null: storedInfo.y;
                            infoWindow.title         = ((opt.room != "" && opt.room != null) ? ("[" + opt.room + "] ") : "") + (opt.title || dui.translate("Chart"));
                            infoWindow.onShow        = function (obj, jContent) {
                                // update information if older than 5 minutes
                                if (obj.lastBigShow === undefined || Date.now() - obj.lastBigShow > 60000) {
                                    jContent.html ("");
                                    var infoWnd = {'content': obj.graficIframe};
                                    obj.SetInfoWindowSettings (infoWnd);
                                    obj.lastBigShow = Date.now();
                                }
                            };
                            infoWindow.onHide         = function (obj, jContent) {
                                // Store position and size of this big window
                                var iWnd = obj.GetInfoWindowSettings ();
                                var infoWindow = {'x': Math.round(iWnd.x), 'y': Math.round(iWnd.y), 'width': Math.round(iWnd.width), 'height': Math.round(iWnd.height)};
                                dui.binds.hqWidgetsExt.hqEditStoreInfoWindow (obj, infoWindow);
                            };
                            // Show grafik
                            var hm_id = opt['hm_ids'];
                            var points = [];
                            if (hm_id != null && hm_id != "") {
                                points = hm_id.split(',');
                            }
                            if (points[0]) {
                                var src = document.location.href;
                                var i = src.lastIndexOf("/dashui");
                                if (i > 0) {
                                    src = src.substring (0, i) + "/charts/";
                                    btn.graficIframe = '<iframe width="100%" height="100%" style="border: 0px" scrolling="no" '+
                                                         'src="'+src+'?dp=';
                                    for (var t = 0; t < points.length; t++) {
                                        btn.graficIframe += ((t > 0) ? ',' : '') + points[t];
                                    }
                                    btn.graficIframe += '&navserie='+points[0];
                                    if (opt["charts"] !== undefined) {
                                        for(var property in opt["charts"]) {
                                           // you can get the value like this: myObject[propertyName]
                                           btn.graficIframe += '&'+property+'='+opt["charts"][property];
                                        }
                                    }
                                    else
                                        btn.graficIframe += '&theme=&percentaxis=true&loader=false&legend=inline&period=72&range=24';
                                    btn.graficIframe += '"></iframe>';
                                    //console.log("Highchart: " + btn.graficIframe);
                                    btn.SetInfoWindowSettings (infoWindow);
                                }
                            }
                        }
                    }
                    else
                    if (opt.buttonTypeEx !== undefined && opt.buttonTypeEx == hqWidgets.gButtonType.gTypeEventlist) {
                         // Get stored settings for info window
                        var wObj = dui.binds.hqWidgetsExt.hqGetWidgetByObj (btn);
                        btn.SetStates({state: hqWidgets.gState.gStateOff});
                        if (opt.exPopup == true) {
                            var storedInfo = null;
                            if (wObj !== undefined && wObj.data !== undefined && wObj.data !== null && wObj.data.informWindow !== undefined){
                                storedInfo = $.parseJSON(wObj.data.informWindow);

                                // Fix position
                                if (storedInfo.x && storedInfo.x < 0 && storedInfo.x < 60 - storedInfo.width) {
                                    storedInfo.x = 60 - storedInfo.width;
                                }
                                if (storedInfo.y && storedInfo.y < 0 && storedInfo.y < -10) {
                                    storedInfo.y = -10;
                                }
                            }
                            var infoWindow = btn.GetInfoWindowSettings ();
                            infoWindow.isEnabled     = true;
                            infoWindow.content       = "";
                            infoWindow.isShowButtons = true;
                            infoWindow.pinShow       = true;
                            infoWindow.showPinned    = true;
                            infoWindow.width         = (storedInfo == null) ? 800:  storedInfo.width;
                            infoWindow.height        = (storedInfo == null) ? 400:  storedInfo.height;
                            infoWindow.x             = (storedInfo == null) ? null: storedInfo.x;
                            infoWindow.y             = (storedInfo == null) ? null: storedInfo.y;
                            infoWindow.title         = ((opt.room != "" && opt.room != null) ? ("[" + opt.room + "] ") : "") + (opt.title || dui.translate("History"));
                            infoWindow.onShow        = function (obj, jContent) {
                                // update information if older than 5 minutes
                                if (obj.lastBigShow === undefined || Date.now() - obj.lastBigShow > 60000) {
                                    jContent.html ("");
                                    var infoWnd = {'content': obj.graficIframe};
                                    obj.SetInfoWindowSettings (infoWnd);
                                    obj.lastBigShow = Date.now();
                                }
                            };
                            infoWindow.onHide         = function (obj, jContent) {
                                // Store position and size of this big window
                                var iWnd = obj.GetInfoWindowSettings ();
                                var infoWindow = {'x': Math.round(iWnd.x), 'y': Math.round(iWnd.y), 'width': Math.round(iWnd.width), 'height': Math.round(iWnd.height)};
                                dui.binds.hqWidgetsExt.hqEditStoreInfoWindow (obj, infoWindow);
                            };
                            // Show history in popup window
                            var src = document.location.href;
                            var i = src.lastIndexOf("/dashui");
                            if (i > 0) {
                                src = src.substring (0, i) + "/eventlist/";
                                btn.graficIframe = '<iframe width="100%" height="100%" style="border: 0" scrolling="no" '+
                                                         'src="'+src;
                                var url = "";
                                if (opt['hm_ids'] !== undefined && opt['hm_ids'] != "") {
                                    url += ((url !="") ? "&" : "?") + "hmid=" + opt['hm_ids'];
                                }
                                if (opt['exLoading'] !== undefined && opt['exLoading'] !== "") {
                                    url += ((url !="") ? "&" : "?") + "loading=" + opt['exLoading'];
                                }
                                if (opt['exAdvanced'] !== undefined && opt['exAdvanced'] !== "") {
                                    url += ((url !="") ? "&" : "?") + "advanced=" + opt['exAdvanced'];
                                }
                                if (opt['exStatesOnly'] !== undefined && opt['exStatesOnly'] !== "") {
                                    url += ((url !="") ? "&" : "?") + "states=" + opt['exStatesOnly'];
                                }
                                if (opt['exWidth'] !== undefined && opt['exWidth'] != "" && opt['exWidth'] != "0" && opt['exWidth'] != 0) {
                                    url += ((url !="") ? "&" : "?") + "width=" + opt['exWidth'];
                                }
                                if (opt['exTypes'] !== undefined && opt['exTypes'] !== "") {
                                    url += ((url !="") ? "&" : "?") + "types=" + opt['exTypes'];
                                }
                                if (opt['exPcount'] !== undefined && opt['exPcount'] !== "") {
                                    url += ((url !="") ? "&" : "?") + "pcount=" + opt['exPcount'];
                                }
                                btn.graficIframe += url +'"></iframe>';
                                btn.SetInfoWindowSettings (infoWindow);
                            }
                        }
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeButton) {
                        btn = $.extend (btn, {translateSignal: function (option, value) {
                            if (option == 'lowBattery' || option == 'isWorking') {
                                return (value === true || value === "true") ? true : false;
                            }
                            else {
								var invertState = btn.GetSettings("invertState");
                                if (invertState) {
									return (value === true || value === "true" || value === 1 || value === "1") ? hqWidgets.gState.gStateOff : hqWidgets.gState.gStateOn;
								} else {
									return (value === true || value === "true" || value === 1 || value === "1") ? hqWidgets.gState.gStateOn : hqWidgets.gState.gStateOff;
								}
							}
                        }});
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeDimmer) {
                        btn = $.extend (btn, {translateSignal: function (option, value) {
                            if (option == 'lowBattery' || option == 'isWorking') {
                                return (value === true || value === "true") ? true : false;
                            }
                            else
                            if (option == "percentState")
                                return Math.floor (value * 100);
                            else // state
                                return (value === true || value === "true") ? true : false;
                        }});
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeBlind) {
                        btn = $.extend (btn, {
							batteryStates: { sensors: [false, false, false, false], handlers: [false, false, false, false]},
							getBatteryState: function () { if (this.batteryStates.sensors[0]  || this.batteryStates.sensors[1]  || this.batteryStates.sensors[2]  || this.batteryStates.sensors[3] ||
							                                   this.batteryStates.handlers[0] || this.batteryStates.handlers[1] || this.batteryStates.handlers[2] || this.batteryStates.handlers[3])
															   return true;
														    return false;
														},
							translateSignal: function (option, value) {
								if (option == "percentState") {
									var invertState = btn.GetSettings("invertState");
									if (invertState) {
										return Math.floor (value * 100);
									} else {
										return Math.floor (100 - (value * 100));
									}
								}
								else
								if (option == "handleState")
									return value;
								else // working
									return (value === true || value === "true") ? true : false;
							}
						});
												
                        var hm_id = btn.GetSettings("hm_id");
                        if (hm_id == null || hm_id == "") {
                            var infoWindow = btn.GetInfoWindowSettings ();
                            infoWindow.isEnabled = false;
                            btn.SetInfoWindowSettings(infoWindow);
							btn.SetStates ({percentState: 0, state: hqWidgets.gState.gStateOff});
                        }
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeInTemp ||
                        opt.buttonType == hqWidgets.gButtonType.gTypeOutTemp) {
                        // remove "--"
                        btn.SetStates ({temperature: 0, valve: 0, humidity: 0, valueSet: 0});
                        btn = $.extend (btn, {translateSignal: function (option, value) {
                            if (option == "valueSet")
                                return (value == 0) ? dui.translate ("Off") : ((value == 100) ? dui.translate ("On") : value);
                            else // temperature, humidity, valve
                                return value;
                        }});  
                        // Get stored settings for info window
                        var wObj = dui.binds.hqWidgetsExt.hqGetWidgetByObj (btn);
                        var storedInfo = null;
                        if (wObj !== undefined && wObj.data !== undefined && wObj.data !== null && wObj.data.informWindow !== undefined) {
							storedInfo = $.parseJSON(wObj.data.informWindow);

                            // Fix position
                            if (storedInfo.x && storedInfo.x < 0 && storedInfo.x < 60 - storedInfo.width) {
                                storedInfo.x = 60 - storedInfo.width;
                            }
                            if (storedInfo.y && storedInfo.y < -10) {
                                storedInfo.y = -10;
                            }
						}
                        var infoWindow = btn.GetInfoWindowSettings ();
                        infoWindow.isEnabled     = true;
                        infoWindow.content       = "";
                        infoWindow.isShowButtons = true;
                        infoWindow.pinShow       = true;
                        infoWindow.showPinned    = true;
                        infoWindow.width         = (storedInfo == null) ? 800:  storedInfo.width;
                        infoWindow.height        = (storedInfo == null) ? 400:  storedInfo.height;
                        infoWindow.x             = (storedInfo == null) ? null: storedInfo.x;
                        infoWindow.y             = (storedInfo == null) ? null: storedInfo.y;
                        infoWindow.title         = ((opt.room != "" && opt.room != null) ? ("[" + opt.room + "] ") : "") + opt.title;
                        infoWindow.onShow        = function (obj, jContent) {
                            // update information if older than 5 minute
                            if (obj.lastBigShow === undefined || Date.now() - obj.lastBigShow > 5*60000) {
                                jContent.html ("");
                                var infoWnd = {'content': obj.graficIframe};
                                obj.SetInfoWindowSettings (infoWnd);
                                obj.lastBigShow = Date.now();
                            }
                        };
                        infoWindow.onHide         = function (obj, jContent) {
                            // Store position and size of this big window
                            var iWnd = obj.GetInfoWindowSettings ();
                            var infoWindow = {'x': Math.round(iWnd.x), 'y': Math.round(iWnd.y), 'width': Math.round(iWnd.width), 'height': Math.round(iWnd.height)};
                            dui.binds.hqWidgetsExt.hqEditStoreInfoWindow (obj, infoWindow);
                        };
                        // Show grafik
                        var hm_id = opt['hm_id'];
                        var points = [];
                        if (hm_id != null && hm_id != "") {
                            var cnt = 0;
                            if (localData.metaObjects[hm_id] && localData.metaObjects[hm_id]["DPs"] && localData.metaObjects[hm_id]["DPs"]["TEMPERATURE"]) {
                                points[cnt++] = localData.metaObjects[hm_id]["DPs"]["TEMPERATURE"];
                                points[cnt++] = localData.metaObjects[hm_id]["DPs"]["HUMIDITY"];
                            } else
                            if (localData.metaObjects[opt['hm_id']] &&
                                localData.metaObjects[opt['hm_id']]["Channels"] &&
                                localData.metaObjects[opt['hm_id']]["Channels"][1] &&
                                localData.metaObjects[localData.metaObjects[opt['hm_id']]["Channels"][1]]["DPs"]["TEMPERATURE"]) {
                                var weatherId = localData.metaObjects[opt['hm_id']]["Channels"][1];
                                points[cnt++] = localData.metaObjects[weatherId]["DPs"]["TEMPERATURE"];
                                points[cnt++] = localData.metaObjects[weatherId]["DPs"]["HUMIDITY"];
                            } else
                            if (localData.metaObjects[hm_id] && localData.metaObjects[hm_id]["DPs"] && localData.metaObjects[hm_id]["DPs"]["ACTUAL_TEMPERATURE"]) {
                                points[cnt++] = localData.metaObjects[hm_id]["DPs"]["ACTUAL_TEMPERATURE"];
                                points[cnt++] = localData.metaObjects[hm_id]["DPs"]["SET_TEMPERATURE"];
                            } else
                            if (localData.metaObjects[opt['hm_id']] &&
                                localData.metaObjects[opt['hm_id']]["Channels"] &&
                                localData.metaObjects[opt['hm_id']]["Channels"][5] &&
                                localData.metaObjects[localData.metaObjects[opt['hm_id']]["Channels"][5]]["DPs"]["ACTUAL_TEMPERATURE"]) {
                                var weatherId = localData.metaObjects[opt['hm_id']]["Channels"][5];
                                points[cnt++] = localData.metaObjects[weatherId]["DPs"]["ACTUAL_TEMPERATURE"];
                                points[cnt++] = localData.metaObjects[weatherId]["DPs"]["SET_TEMPERATURE"];
                            }
                        }
                        if (points[0]) {
                            var src = document.location.href;
                            var i = src.lastIndexOf("/dashui");
                            if (i > 0) {
                                src = src.substring (0, i) + "/charts/";
                                btn.graficIframe = '<iframe width="100%" height="100%" style="border: 0" scrolling="no" '+
                                                     'src="'+src+'?dp=';
                                for (var t = 0; t < points.length; t++) {
                                    btn.graficIframe += ((t > 0) ? ',' : '') + points[t];
                                }
                                btn.graficIframe += '&navserie='+points[0];
                                if (opt["charts"] !== undefined) {
                                    for(var property in opt["charts"]) {
                                       // you can get the value like this: myObject[propertyName]
                                       btn.graficIframe += '&'+property+'='+opt["charts"][property];
                                    }
                                }
                                else
                                    btn.graficIframe += '&theme=&percentaxis=true&loader=false&legend=inline&period=72&range=24';
                                btn.graficIframe += '"></iframe>';
                                //console.log("Highchart: " + btn.graficIframe);
                                btn.SetInfoWindowSettings (infoWindow);
                            }
                        }
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeLock) {
                        btn = $.extend (btn, {translateSignal: function (option, value) {
                            if (option == 'lowBattery' || option == 'isWorking') {
                                return (value === true || value === "true") ? true : false;
                            }
                            else
                                return (value === false || value === "false") ? hqWidgets.gState.gStateOn : hqWidgets.gState.gStateOff;
                        }});
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeInfo ||
                        opt.buttonType == hqWidgets.gButtonType.gTypeGauge) {
                        btn = $.extend (btn, {translateSignal: function (option, value) {
                            return value;
                        }});
						
						// Remove not ready icon if no status given
						if (opt.buttonType == hqWidgets.gButtonType.gTypeInfo) {
							var hm_id = btn.GetSettings("hm_id");
							if (hm_id == null || hm_id == "") {
								btn.SetStates ({state: hqWidgets.gState.gStateOff});
							}
						}
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeMotion) {
                        btn = $.extend (btn, {translateSignal: function (option, value) {
                            if (option == 'lowBattery' || option == 'isWorking') {
                                return (value === true || value === "true" || value === 1 || value === "1") ? true : false;
                            }
                            else
                            if (option == "percentState") {
								return parseInt(value);
							}
                            else // state
                                return (value === false || value === "false") ? hqWidgets.gState.gStateOff : hqWidgets.gState.gStateOn;
                        }});
					}
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeLowbat) {
                        btn = $.extend (btn, {translateSignal: function (option, value) {
                            if (option == 'state')
                                return (value === true || value === "true") ? hqWidgets.gState.gStateOn : hqWidgets.gState.gStateOff;
                            else
                                return value;
                        }});
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeDoor) {
                        btn = $.extend (btn, {translateSignal: function (option, value) {
                            if (option == 'lowBattery' || option == 'isWorking') {
                                return (value === true || value === "true") ? true : false;
                            }
                            else {
								var invertState = btn.GetSettings("invertState");
                                if (invertState) {
									return (value === true || value === "true" || value === 1 || value === "1") ? hqWidgets.gState.gStateOff : hqWidgets.gState.gStateOn;
								} else {
									return (value === true || value === "true" || value === 1 || value === "1") ? hqWidgets.gState.gStateOn : hqWidgets.gState.gStateOff;
								}
							}                        
						}});					
					}
                    else {
                        btn = $.extend (btn, {translateSignal: function (option, value) {
                            if (option == 'lowBattery' || option == 'isWorking') {
                                return (value === true || value === "true") ? true : false;
                            }
                            else
                            return (value === true || value === "true" || value === 1 || value === "1") ? hqWidgets.gState.gStateOn : hqWidgets.gState.gStateOff;
                        }});
                    }
					// Show history or grafic
					if (opt["exShowGrafik"] === 'history' || opt["exShowGrafik"] === 'grafic') {
						var storedInfo = null;
                        var wObj = dui.binds.hqWidgetsExt.hqGetWidgetByObj (btn);
						if (wObj !== undefined && wObj.data !== undefined && wObj.data !== null && wObj.data.informWindow !== undefined) {
                            storedInfo = $.parseJSON(wObj.data.informWindow);
                            // Fix position
                            if (storedInfo.x && storedInfo.x < 0 && storedInfo.x < 60 - storedInfo.width) {
                                storedInfo.x = 60 - storedInfo.width;
                            }
                            if (storedInfo.y && storedInfo.y < -10) {
                                storedInfo.y = -10;
                            }
                        }
						var infoWindow = btn.GetInfoWindowSettings ();
						infoWindow.isEnabled     = true;
						infoWindow.content       = "";
						infoWindow.isShowButtons = true;
						infoWindow.pinShow       = true;
						infoWindow.showPinned    = true;
						infoWindow.x             = (storedInfo == null) ? null: storedInfo.x;
						infoWindow.y             = (storedInfo == null) ? null: storedInfo.y;
						if (opt["exShowGrafik"] === 'grafic') {
							infoWindow.width         = (storedInfo == null) ? 800:  storedInfo.width;
							infoWindow.height        = (storedInfo == null) ? 400:  storedInfo.height;
							infoWindow.title         = ((opt.room != "" && opt.room != null) ? ("[" + opt.room + "] ") : "") + (opt.title || dui.translate("Chart"));
						}
						else if (opt["exShowGrafik"] === 'history'){
							infoWindow.width         = (storedInfo == null) ? 350:  storedInfo.width;
							infoWindow.height        = (storedInfo == null) ? 300:  storedInfo.height;
							infoWindow.title         = (opt.title || dui.translate("History"));
						}
						infoWindow.onShow        = function (obj, jContent) {
							// update information if older than 5 minutes
							if (obj.lastBigShow === undefined || Date.now() - obj.lastBigShow > 60000) {
								jContent.html ("");
								var infoWnd = {'content': obj.graficIframe};
								obj.SetInfoWindowSettings (infoWnd);
								obj.lastBigShow = Date.now();
							}
						};
						infoWindow.onHide         = function (obj, jContent) {
							// Store position and size of this big window
							var iWnd = obj.GetInfoWindowSettings ();
							var infoWindow = {'x': Math.round(iWnd.x), 'y': Math.round(iWnd.y), 'width': Math.round(iWnd.width), 'height': Math.round(iWnd.height)};
							dui.binds.hqWidgetsExt.hqEditStoreInfoWindow (obj, infoWindow);
						};
						
						if (opt["exShowGrafik"] === 'grafic') {
							// Show grafik
							var hm_id = opt['hm_id'];
							if (localData.metaObjects[hm_id] && localData.metaObjects[hm_id]["DPs"]) {
								if (localData.metaObjects[hm_id]["DPs"]["MOTION"]) {
									hm_id = localData.metaObjects[opt["hm_id"]]["DPs"]["BRIGHTNESS"];
								}                                                          
							}
							else
							if (localData.metaObjects[hm_id] && localData.metaObjects[hm_id]["Name"] && localData.metaObjects[hm_id]["Name"].indexOf(".MOTION") != -1) {
								if (localData.metaObjects[hm_id]["Parent"]) {
									var parent = localData.metaObjects[hm_id]["Parent"];
									if (localData.metaObjects[parent] && localData.metaObjects[parent]["DPs"] && localData.metaObjects[parent]["DPs"]["BRIGHTNESS"]) {
										hm_id = localData.metaObjects[parent]["DPs"]["BRIGHTNESS"];
									}
								}
							}          

							var points = [hm_id];
							if (points[0]) {
								var src = document.location.href;
								var i = src.lastIndexOf("/dashui");
								if (i > 0) {
									src = src.substring (0, i) + "/charts/";
									btn.graficIframe = '<iframe width="100%" height="100%" style="border: 0" scrolling="no" src="'+src+'?dp=';
									for (var t = 0; t < points.length; t++) {
										btn.graficIframe += ((t > 0) ? ',' : '') + points[t];
									}
									btn.graficIframe += '&loader=false&navserie='+points[0];
									if (opt["charts"] !== undefined) {
										for(var property in opt["charts"]) {
										   // you can get the value like this: myObject[propertyName]
										   btn.graficIframe += '&'+property+'='+opt["charts"][property];
										}
									}
									else
										btn.graficIframe += '&theme=&percentaxis=true&loader=false&legend=inline&period=72&range=24';
									btn.graficIframe += '"></iframe>';
									//console.log("Highchart: " + btn.graficIframe);
									btn.SetInfoWindowSettings (infoWindow);
								}
							}
						} else 
						if (opt["exShowGrafik"] === 'history') {
							// Show history in popup window
							var src = document.location.href;
							var i = src.lastIndexOf("/dashui");
							if (i > 0) {
								src = src.substring (0, i) + "/eventlist/";
								btn.graficIframe = '<iframe width="100%" height="100%" style="border: 0" scrolling="no" '+
														 'src="'+src;
								var url = "";
								var hm_id = opt['hm_id'];
								if (localData.metaObjects[opt["hm_id"]] && localData.metaObjects[opt["hm_id"]]["DPs"] && localData.metaObjects[opt["hm_id"]]["DPs"]["MOTION"]) {
									hm_id = localData.metaObjects[opt["hm_id"]]["DPs"]["MOTION"];
									url += ((url !="") ? "&" : "?") + "value=true&compact=true";
								} else
								if (localData.metaObjects[opt["hm_id"]] && localData.metaObjects[opt["hm_id"]]["Name"] && localData.metaObjects[opt["hm_id"]]["Name"].indexOf(".MOTION") != -1) {
									hm_id = opt["hm_id"];
									url += ((url !="") ? "&" : "?") + "value=true&compact=true";                                    
								} else
								if (localData.metaObjects[opt["hm_id"]] && localData.metaObjects[opt["hm_id"]]["DPs"] && localData.metaObjects[opt["hm_id"]]["DPs"]["STATE"]) {
									hm_id = localData.metaObjects[opt["hm_id"]]["DPs"]["STATE"];
									if (localData.metaObjects[opt["hm_id"]]["HssType"] == "PING") {
										url += ((url !="") ? "&" : "?") + "true=online&false=offline&compact=true";
									} else {
										url += ((url !="") ? "&" : "?") + "true=opened&false=closed&compact=true";
									}
								} else
								if (localData.metaObjects[opt["hm_id"]] && localData.metaObjects[opt["hm_id"]]["Name"] && localData.metaObjects[opt["hm_id"]]["Name"].indexOf(".STATE") != -1) {
									hm_id = opt["hm_id"];
									url += ((url !="") ? "&" : "?") + "true=opened&false=closed&compact=true";                                    
								}
								url += ((url !="") ? "&" : "?") + "hmid=" + hm_id;

								url += ((url !="") ? "&" : "?") + "pcount=25";
								url += "&loading=false";
								btn.graficIframe += url +'"></iframe>';
								btn.SetInfoWindowSettings (infoWindow);
							}						
						}
					}

                
                    // Restore size of information window
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeCam  ||
                        opt.buttonType == hqWidgets.gButtonType.gTypeGong) {
                        // Get stored settings for info window
                        var wObj = dui.binds.hqWidgetsExt.hqGetWidgetByObj (btn);
                        var storedInfo = null;
                        if (wObj !== undefined && wObj.data !== undefined && wObj.data !== null && wObj.data.informWindow !== undefined) {
                            storedInfo = $.parseJSON(wObj.data.informWindow);
                            // Fix position
                            if (storedInfo.x && storedInfo.x < 0 && storedInfo.x < 60 - storedInfo.width) {
                                storedInfo.x = 60 - storedInfo.width;
                            }
                            if (storedInfo.y && storedInfo.y < -10) {
                                storedInfo.y = -10;
                            }
                        }
                        var infoWindow = btn.GetInfoWindowSettings ();
                        
                        infoWindow.width         = (storedInfo == null) ? infoWindow.width:  storedInfo.width;
                        infoWindow.height        = (storedInfo == null) ? infoWindow.height: storedInfo.height;
                        infoWindow.x             = (storedInfo == null) ? infoWindow.x:      storedInfo.x;
                        infoWindow.y             = (storedInfo == null) ? infoWindow.y:      storedInfo.y;
                        infoWindow.isEnabled     = true;
                        
                        infoWindow.onHide         = function (obj, jContent) {
                            // Store position and size of this big window
                            var iWnd = obj.GetInfoWindowSettings ();
                            var infoWindow = {'x': Math.round(iWnd.x), 'y': Math.round(iWnd.y), 'width': Math.round(iWnd.width), 'height': Math.round(iWnd.height)};
                            dui.binds.hqWidgetsExt.hqEditStoreInfoWindow (obj, infoWindow);
	                        if (obj.dynStates.infoWindow._onHide) {
								obj.dynStates.infoWindow._onHide (obj);
							}
						};                     
                        btn.SetInfoWindowSettings (infoWindow);
                    }
                }
 
                // Enable edit mode
                var mWidget = document.getElementById(el);
                if (dui.editMode) {
                    btn.SetEditMode (true);
                    // Install special handlers
                    if (mWidget) {
                        mWidget._customHandlers = {
                            onMoveEnd:      dui.binds.hqWidgetsExt.hqEditOnMove,
                            onDelete:       dui.binds.hqWidgetsExt.hqEditOnDelete,
                            onMove:         dui.binds.hqWidgetsExt.hqEditOnMove,
                            onCssEdit:      dui.binds.hqWidgetsExt.hqEditOnCssEdit,
                            onOptionEdited: dui.binds.hqWidgetsExt.hqEditOnOptionEdited,
                            isOptionEdited: dui.binds.hqWidgetsExt.hqEditIsOptionEdited,
                            onShow:         dui.binds.hqWidgetsExt.hqOnShow,
                            onHide:         dui.binds.hqWidgetsExt.hqOnHide,
                            isRerender:     true
                        };
                    }
                } 
                else {
                    if (mWidget) {
                        mWidget._customHandlers = {
                            onShow:         dui.binds.hqWidgetsExt.hqOnShow,
                            onHide:         dui.binds.hqWidgetsExt.hqOnHide,
                            isRerender:     true
                        };
                    }

                    for (var i = 0; i < hm_ids.length; i++) {
                         // Register hm_id to detect changes
                        //$.homematic("addUiState", hm_ids[i].hm_id);
                        // Store mapping
                        var j = 0;
                        while (dui.binds.hqWidgetsExt.hqMapping[hm_ids[i].hm_id+'_'+j])
                            j++;
                            
                        dui.binds.hqWidgetsExt.hqMapping[hm_ids[i].hm_id+'_'+j] = {button: btn, option: hm_ids[i].option, index: hm_ids[i].index};
                        // Set actual state
                        // Convert string to time
                        if (localData.uiState["_"+hm_ids[i].hm_id] && localData.uiState["_"+hm_ids[i].hm_id].Value !== undefined) {
                            var dt = undefined;
                            if (localData.uiState["_"+hm_ids[i].hm_id].LastChange !== undefined &&
							    localData.uiState["_"+hm_ids[i].hm_id].LastChange != null) {
                                dt = new Date(localData.uiState["_"+hm_ids[i].hm_id].LastChange.replace(' ', 'T') + "Z");//('2011-04-11T11:51:00') "T" Means GMT (We do not have GMT)
								dt.setMinutes(dt.getMinutes() + new Date().getTimezoneOffset());
							}
                            this.hqMonitor (this, hm_ids[i].hm_id, localData.uiState["_"+hm_ids[i].hm_id].Value, true, dt);
                        }
                        else {
                            if (localData.uiState["_"+hm_ids[i].hm_id])
                                console.log("DATAPOINT " + hm_ids[i].hm_id + " does not exist in homematic.uiState !!!!!!!!!!!!!!");
                            else
                                console.log("DATAPOINT " + hm_ids[i].hm_id + " does not have Value!!!!!!!!!!!!!!");
                        }
                    }
                }
                 
                btn.SetStates (adv);
                btn.intern._jelement.addClass("dashui-widget");
                
                // Store options
                //var newOpt = JSON.stringify (btn.GetSettings (false, true));
                //var newOpt = btn.GetSettings (false, true);
                //var duiWidget = dui.binds.hqWidgetsExt.hqGetWidgetByObj(btn);
                //if (duiWidget) {
                //    duiWidget.data.hqoptions = newOpt;
                //}
            },
            hqMonitor: function (arg, wid, newState, isFromDevice, lastchange) {
                if (!isFromDevice) {
                    return;
                }
                // Play sound in the browser for sayIt adapter
				if (wid == "72900") {
					if (newState) {
						var d = new Date ();
						$('#sound__').remove ();
						$('body').append('<audio id="sound__"  preload="auto" autobuffer></audio>');										
						$('#sound__').on('canplaythrough', function() {   
							this.play ();
						});
                        if (localData.uiState["_72901"] && localData.uiState["_72901"].Value) {
						    document.getElementById('sound__').src = "../" + localData.uiState["_72901"].Value + "?"+d.getTime();
                        }
                        else{
                            document.getElementById('sound__').src = "../say.mp3?"+d.getTime();
                        }
					}
					else
						return;
				}	
                //console.log(wid+"["+dui.getObjDesc (wid)+"] = "+newState);
                var i = 0;
                while (dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i]) {
                
                    var change = {};
					var option = dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].option;
					
                    change[option] = dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.translateSignal (option, newState);
                    change['isRefresh'] = false;
                    
                    if (lastchange != undefined && (option == 'state' || option == 'infoText')) {
                        change['lastAction'] = lastchange;
                    }
					
					if (option == 'infoText') {
                    	change[option] = (change[option] !== undefined && change[option] !== null) ? change[option] : "";
                    }
                    else
                    if (option == 'lowBatteryS') {
						dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.batteryStates.sensors[dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].index] = newState;
                        dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.SetStates ({'lowBattery': dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.getBatteryState (), 'lowBatteryDesc': "BAT:"+dui.getObjDesc (wid)});
					}
                    else
                    if (option == 'lowBatteryH') {
						dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.batteryStates.handlers[dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].index] = newState;
                        dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.SetStates ({'lowBattery': dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.getBatteryState (), 'lowBatteryDesc': "BAT:"+dui.getObjDesc (wid)});                        
					}
                    else
                    // If new percent state
                    if (option == 'percentState') {
                        var type = dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.GetSettings('buttonType');
                        // Remove unknown state of the button and if dimmer select valid state
                        if (type == hqWidgets.gButtonType.gTypeDimmer)
                            change['state'] = (newState > 0) ? hqWidgets.gState.gStateOn : hqWidgets.gState.gStateOff;
                        else 
						if (type != hqWidgets.gButtonType.gTypeMotion)
                            change['state'] = hqWidgets.gState.gStateOff; // Remove unknown state
                    }
                    else
                    if (option == 'windowState') {
                        change['state'] = hqWidgets.gState.gStateOff; // Remove unknown state
                        dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.SetWindowState (dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].index, (newState == true) ? hqWidgets.gWindowState.gWindowOpened : hqWidgets.gWindowState.gWindowClosed);
                        var hm_id = dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.GetSettings("hm_id");
                        if (hm_id == null || hm_id == "")
                            dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.SetStates ({'state': hqWidgets.gState.gStateOff}); // Remove unknown state                       
                        i++;
                        continue;
                    }
                    else
                    if (option == 'handleState') {
                        // 0. CLOSED, 1. TILTED, 2.OPEN ab  V1.6 ???
                        // 0. Closed, 1. tilted, 2.open bis V1.6
                        var wndState = undefined;
                        var opt    = dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.GetSettings('hm_id'+dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].index);
                        // Get sensor version
                        var newVer = dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.GetSettings('newVersion');
                        if (newVer === undefined || newVer === null)
                            newVer = false;
                        var nState = newState;
                            
                        if ((!newVer && newState == "2") || (newVer && newState == "2")) {
                            wndState = hqWidgets.gWindowState.gWindowOpened;
                            nState = hqWidgets.gHandlePos.gPosOpened;
                        }
                        else
                        if ((!newVer && newState == "1") || (newVer && newState == "1")) {
                            wndState = hqWidgets.gWindowState.gWindowTilted;
                            nState = hqWidgets.gHandlePos.gPosTilted;
                        }
                        else {
                            wndState = hqWidgets.gWindowState.gWindowClosed;
                            nState = hqWidgets.gHandlePos.gPosClosed;
                        }
                        
                        // If contact sensor => set the valid position from sensor
                        if (opt !== undefined && opt != null && opt != "") 
                            wndState = undefined;
                            
                        dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.SetWindowState (dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].index, wndState, nState);
                        var hm_id = dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.GetSettings("hm_id");
                        if (hm_id == null || hm_id == "")
                            dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.SetStates ({'state': hqWidgets.gState.gStateOff}); // Remove unknown state                       
                        i++;
                        continue;
                    }
                        
                    dui.binds.hqWidgetsExt.hqMapping[wid+'_'+i].button.SetStates (change);
                    i++;
                }
            }  // End of hqMonitor
        }
    });

    dui.binds.hqWidgetsExt.hqInit ();
}
