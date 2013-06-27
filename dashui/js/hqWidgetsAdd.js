    jQuery.extend(true, dui.binds, {
        hqWidgetsExt: {
            hqMapping: {},
            hqSaveTimer : null,
            hqSave: function () {
                if (dui.binds.hqWidgetsExt.hqSaveTimer != null) 
                    clearTimeout(dui.binds.hqWidgetsExt.hqSaveTimer);
                    
                dui.binds.hqWidgetsExt.hqSaveTimer = setTimeout (function () { 
                    dui.saveLocal (); 
                    console.log ("Saved!"); 
                    dui.binds.hqWidgetsExt.hqSaveTimer = null;
                }, 2000);
            },
            hqButtonExt: function (el, options, wtype) {
                var opt = (options != undefined && options != null) ? $.parseJSON(options) : {x:50, y: 50};
                var hm_ids = new Array ();
                // Define store settings function
                var adv = {store: function (obj, opt) {
                    var newOpt = JSON.stringify (opt);
                    dui.views[dui.activeView].widgets[obj.advSettings.elemName].data.hqoptions = newOpt;
                    //$('#inspect_hqoptions').val(newOpt);
                    obj.settings._jelement.attr ('hqoptions', newOpt);
                    console.log ("Stored: " + newOpt);
                    dui.binds.hqWidgetsExt.hqSave ();
                }};
                
                // If first creation
                if (wtype != undefined) {
                    // Set default settings
                    if (wtype == 'tplHqButton') {
                        opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeButton, 
                                              iconName: 'Lamp.png', 
                                              zindex: 2, 
                                              hm_id: '',
                                              });
                    }
                    else
                    if (wtype == 'tplHqInfo') {
                        opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeInfo, 
                                              zindex: 2,
                                              hm_id: '',
                                              });
                    }
                    else
                    if (wtype == 'tplHqDimmer') {
                        opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeDimmer, 
                                              iconName: 'Lamp.png', 
                                              zindex: 3,
                                              hm_id: '',
                                              });
                    }
                    else
                    if (wtype == 'tplHqShutter') {
                        opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeBlind, 
                                              windowConfig: hqWidgets.gSwingType.gSwingLeft, 
                                              zindex: 2,
                                              hm_id: '',
                                              });
                    }
                    else
                    if (wtype == 'tplHqInTemp') {
                        opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeInTemp, 
                                              iconName: 'Temperature.png', 
                                              zindex: 2,
                                              hm_id: '',
                                              hm_idV:'',
                                              });
                    }
                    else
                    if (wtype == 'tplHqOutTemp') {
                        opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeOutTemp, 
                                              iconName: 'Temperature.png', 
                                              zindex: 2,
                                              hm_id: '',
                                              });
                    }
                    else
                    if (wtype == 'tplHqDoor') {
                        opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeDoor, 
                                              zindex: 2,
                                              hm_id: '',
                                              });
                    }
                    else
                    if (wtype == 'tplHqLock') {
                        opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeLock, 
                                              iconName: 'unlocked.png', 
                                              iconOn: 'locked.png', 
                                              zindex: 3,
                                              hm_id: '',
                                              });
                    }
                    else
                    if (wtype == 'tplHqText') {
                        opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeText, radius: 0, zindex: 2});
                    }
                    else
                    if (wtype == 'tplHqImage') {
                        opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeImage, iconName:'flat.jpg', radius: 0});
                    }
                }
                else {
                    // non-edit mode => define event handlers
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeDimmer) {
                        adv = $.extend (adv, {action: function (obj, what, state) {
                            var hm_id = obj.GetSettings ('hm_id');
                            if (hm_id != null && hm_id != "") {
                                if (hm_id.indexOf(".LEVEL") == -1)
                                    hm_id += ".LEVEL";
                                
                                if (what == 'state') {
                                    if (state != hqWidgets.gState.gStateOn) {
                                        obj.SetStates ({percentState: 100, state: hqWidgets.gState.gStateOn, isRefresh: true});
                                        // Send command to HM
                                        $.homematic("setState", hm_id, 1);                        
                                    }
                                    else {
                                        obj.SetStates ({percentState: 0, state: hqWidgets.gState.gStateOff, isRefresh: true});
                                        // Send command to HM
                                        $.homematic("setState", hm_id, 0);                        
                                    }
                                }
                                else {
                                    if (state != 0) {
                                        obj.SetStates ({state: hqWidgets.gState.gStateOn});
                                    }
                                    else {
                                        obj.SetStates ({state: hqWidgets.gState.gStateOff});
                                    }
                                    // Send command to HM
                                    $.homematic("setState", hm_id, state / 100);                                  
                                }  
                            }                                
                        }});
                        // Fill up the required IDs
                        var t = 0;
                        if (opt.hm_id != null && opt.hm_id != "") {
                            if (opt.hm_id.indexOf(".LEVEL") == -1) {
                                hm_ids[t++] = {hm_id: opt.hm_id + ".LEVEL",   option: 'percentState'}; // First is always main element
                                hm_ids[t++] = {hm_id: opt.hm_id + ".WORKING", option: 'isWorking'};
                            }
                            else {
                                hm_ids[t++] = {hm_id: opt.hm_id, option: 'percentState'};
                            }
                        }                        
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeButton) {
                        adv = $.extend (adv, {action: function (obj, what, state) {
                            var hm_id = obj.GetSettings ('hm_id');
                            if (hm_id != null && hm_id != "") {
                                if (hm_id.indexOf(".STATE") == -1)
                                    hm_id += ".STATE";
                                if (state != hqWidgets.gState.gStateOn) {
                                    state = hqWidgets.gState.gStateOn;
                                }
                                else {
                                    state = hqWidgets.gState.gStateOff;
                                }
                                obj.SetStates ({state: state, isRefresh: true, isRefresh: true});
                                // Send command to HM
                                $.homematic("setState", hm_id, (state == hqWidgets.gState.gStateOn)); 
                            }                                
                        }});
                        // Fill up the required IDs
                        var t = 0;
                        if (opt.hm_id != null && opt.hm_id != "") {
                            if (opt.hm_id.indexOf(".STATE") == -1) {
                                hm_ids[t++] = {hm_id: opt.hm_id + ".STATE", option: 'state'};
                            }
                            else {
                                hm_ids[t++] = {hm_id: opt.hm_id, option: 'state'};
                            }
                        }
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeBlind) {
                        adv = $.extend (adv, {action: function (obj, what, state) {
                            var hm_id = obj.GetSettings ('hm_id');
                            if (hm_id != null && hm_id != "") {
                                if (hm_id.indexOf(".LEVEL") == -1)
                                    hm_id += ".LEVEL";
                                obj.SetStates ({isRefresh: true});
                                // Send command to HM
                                $.homematic("setState", hm_id, (100 - state) / 100);  
                            }                                
                        }});
                        // Fill up the required IDs
                        var t = 0;
                        if (opt.hm_id != null && opt.hm_id != "") {
                            if (opt.hm_id.indexOf(".LEVEL") == -1) {
                                hm_ids[t++] = {hm_id: opt.hm_id + ".LEVEL",   option: 'percentState'}; // First is always main element
                                hm_ids[t++] = {hm_id: opt.hm_id + ".WORKING", option: 'isWorking'};
                                for (var i = 0; i < 4; i++) {
                                    if (opt['hm_id'+i] != undefined) {
                                        if (opt['hm_id'+i] != null && opt['hm_id'+i] != "")
                                            hm_ids[t++] = {hm_id: opt['hm_id'+i] + ".STATE", option: 'windowState', index:i};   
                                    }
                                }
                            }
                            else {
                                hm_ids[t++] = {hm_id: opt.hm_id, option: 'percentState'};
                            }
                        }                        
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeInTemp) {
                        /*adv = $.extend (adv, {action: function (obj, what, state) {
                            var hm_id = obj.GetSettings ('hm_id');
                            if (hm_id != null && hm_id != "") {
                                if (hm_id.indexOf(".LEVEL") == -1)
                                    hm_id += ".LEVEL";
                                obj.SetStates ({isRefresh: true});
                                // Send command to HM
                                $.homematic("setState", hm_id, (100 - state) / 100);  
                            }                                
                        }});*/
                        // Fill up the required IDs
                        var t = 0;
                        if (opt.hm_id != null && opt.hm_id != "") {
                            if (opt.hm_id.indexOf(":1.TEMPERATURE") == -1) {
                                hm_ids[t++] = {hm_id: opt.hm_id + ":2.SETPOINT",    option: 'setTemp'}; // First is always control element
                                hm_ids[t++] = {hm_id: opt.hm_id + ":1.TEMPERATURE", option: 'temperature'}; 
                                hm_ids[t++] = {hm_id: opt.hm_id + ":1.HUMIDITY",    option: 'humidity'};
                            }
                            else {
                                hm_ids[t++] = {hm_id: opt.hm_id, option: 'temperature'};
                            }
                            if (opt.hm_idV) {
                                if (opt.hm_id.indexOf(".VALVE_STATE") == -1)
                                    hm_ids[t++] = {hm_id: opt.hm_idV + ".VALVE_STATE", option: 'valve'};
                                else
                                    hm_ids[t++] = {hm_id: opt.hm_idV, option: 'valve'};
                                adv = $.extend (adv, {'hideValve': false});
                            }
                            else {
                                adv = $.extend (adv, {'hideValve': true});
                            }
                        }  
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeOutTemp) {
                        /*adv = $.extend (adv, {action: function (obj, what, state) {
                            var hm_id = obj.GetSettings ('hm_id');
                            if (hm_id != null && hm_id != "") {
                                if (hm_id.indexOf(".LEVEL") == -1)
                                    hm_id += ".LEVEL";
                                obj.SetStates ({isRefresh: true});
                                // Send command to HM
                                $.homematic("setState", hm_id, (100 - state) / 100);  
                            }                                
                        }});*/
                        // Fill up the required IDs
                        var t = 0;
                        if (opt['hm_id'] != null && opt['hm_id'] != "") {
                            if (opt['hm_id'].indexOf(".TEMPERATURE") == -1) {
                                hm_ids[t++] = {'hm_id': opt['hm_id'] + ".TEMPERATURE", option: 'temperature'}; 
                                hm_ids[t++] = {'hm_id': opt['hm_id'] + ".HUMIDITY",    option: 'humidity'};
                            }
                            else {
                                hm_ids[t++] = {'hm_id': opt['hm_id'], option: 'temperature'};
                            }
                        }  
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeDoor) {
                        // Fill up the required IDs
                        var t = 0;
                        if (opt['hm_id'] != null && opt['hm_id'] != "") {
                            if (opt['hm_id'].indexOf(".STATE") == -1) {
                                hm_ids[t++] = {'hm_id': opt['hm_id'] + ".STATE", option: 'state'}; 
                            }
                            else {
                                hm_ids[t++] = {'hm_id': opt['hm_id'], option: 'state'};
                            }
                        }  
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeLock) {
                       adv = $.extend (adv, {action: function (obj, what, state) {
                            var hm_id = obj.GetSettings ('hm_id');
                            if (hm_id != null && hm_id != "") {
                                if (state == hqWidgets.gLockType.gLockClose ||
                                    state == hqWidgets.gLockType.gLockOpen)
                                {
                                    if (hm_id.indexOf(".STATE") == -1)
                                        hm_id += ".STATE";
                                    obj.SetStates ({isRefresh: true});
                                    // Send command to HM
                                    $.homematic("setState", hm_id, (state == hqWidgets.gLockType.gLockClose) ? "false" : "true");
                                }
                                else { // Open door
                                    if (hm_id.indexOf(".OPEN") == -1)
                                        hm_id += ".OPEN";
                                    // Send command to HM
                                    $.homematic("setState", hm_id, "true");
                                }
                            }                            
                        }});
                        // Fill up the required IDs
                        var t = 0;
                        if (opt['hm_id'] != null && opt['hm_id'] != "") {
                            if (opt['hm_id'].indexOf(".STATE") == -1) {
                                hm_ids[t++] = {'hm_id': opt['hm_id'] + ".STATE", option: 'state'}; 
                                hm_ids[t++] = {'hm_id': opt['hm_id'] + ".OPEN",  option: 'open'}; 
                            }
                            else {
                                hm_ids[t++] = {'hm_id': opt['hm_id'], option: 'state'};
                            }
                        }  
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeInfo) {
                        // Fill up the required IDs
                        var t = 0;
                        if (opt['hm_id'] != null && opt['hm_id'] != "") {
                                hm_ids[t++] = {'hm_id': opt['hm_id'], option: 'infoText'};
                        }  
                    }                
                }
                
                
                var btn = hqWidgets.Create (opt, {elemName: el, parent: $("#duiview_"+dui.activeView)});
                
                // Enable edit mode
                if (dui.urlParams["edit"] === "") {
                    btn.SetEditMode (true);
                } 
                else
                {
                    for (var i = 0; i < hm_ids.length; i++) {
                         // Register hm_id to detect changes
                        $.homematic("addUiState", hm_ids[i].hm_id);
                        // Store mapping
                        dui.binds.hqWidgetsExt.hqMapping[hm_ids[i].hm_id] = {button: btn, option: hm_ids[i].option, index: hm_ids[i].index};
                        if (i > 0) {
                            btn.settings._jelement.append ("<div id='"+el+"helper_"+i+"' data-hm-id='"+hm_ids[i].hm_id +"' style='display: none' />");
                        } 
                        else {
                            btn.settings._jelement.attr('data-hm-id', hm_ids[0].hm_id);
                        }                        
                    }
                }
                 
                btn.SetStates (adv);
                
                // Store options
                var newOpt = JSON.stringify (btn.GetSettings ());
                $('#'+el).attr ('hqoptions', newOpt);
                
                // Create signal translators
                if (wtype == undefined) {
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeButton) {
                        btn = $.extend (btn, {translateSignal: function (options, value) {
                            return (value == "true") ? hqWidgets.gState.gStateOn : hqWidgets.gState.gStateOff;
                        }});
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeDimmer) {
                        btn = $.extend (btn, {translateSignal: function (options, value) {
                            if (options == "percentState")
                                return Math.floor (value * 100);
                            else // working
                                return (value == "true") ? true : false;
                        }});
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeBlind) {
                        btn = $.extend (btn, {translateSignal: function (options, value) {
                            if (options == "percentState")
                                return Math.floor (100 - (value * 100));
                            else // working
                                return (value == "true") ? true : false;
                        }});
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeInTemp ||
                        opt.buttonType == hqWidgets.gButtonType.gTypeOutTemp) {
                        // remove "--"
                        btn.SetStates ({temperature: 0, valve: 0, humidity: 0, setTemp: 0});
                        btn = $.extend (btn, {translateSignal: function (options, value) {
                            if (options == "setTemp")
                                return (value == 0) ? dui.translate ("Off") : ((value == 100) ? dui.Tramslate ("On") : value);
                            else // temperature, humidity, valve
                                return value;
                        }});                        
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeLock) {
                        btn = $.extend (btn, {translateSignal: function (options, value) {
                            return (value == "false") ? hqWidgets.gState.gStateOn : hqWidgets.gState.gStateOff;
                        }});
                    }
                    else
                    if (opt.buttonType == hqWidgets.gButtonType.gTypeInfo) {
                        btn = $.extend (btn, {translateSignal: function (options, value) {
                            return value;
                        }});
                    }
                    else {
                        btn = $.extend (btn, {translateSignal: function (options, value) {
                            return (value == "true") ? hqWidgets.gState.gStateOn : hqWidgets.gState.gStateOff;
                        }});
                     }
                }
            },
            hqMonitor: function (wid, newState){
                console.log(wid+"="+newState);
                if (dui.binds.hqWidgetsExt.hqMapping[wid]) {
                    var change = {};
                    change[dui.binds.hqWidgetsExt.hqMapping[wid].option] = dui.binds.hqWidgetsExt.hqMapping[wid].button.translateSignal (dui.binds.hqWidgetsExt.hqMapping[wid].option, newState);
                    change['isRefresh'] = false;
                    
                    // If new percent state
                    if (dui.binds.hqWidgetsExt.hqMapping[wid].option == 'percentState') {
                        var type = dui.binds.hqWidgetsExt.hqMapping[wid].button.GetSettings('buttonType');
                        // Remove unknown state of the button and if dimmer select valid state
                        if (type == hqWidgets.gButtonType.gTypeDimmer)
                            change['state'] = (newState > 0) ? hqWidgets.gState.gStateOn : hqWidgets.gState.gStateOff;
                        else
                            change['state'] = hqWidgets.gState.gStateOff; // Remove unknown state
                    }
                    else
                    if (dui.binds.hqWidgetsExt.hqMapping[wid].option == 'windowState') {
                        change['state'] = hqWidgets.gState.gStateOff; // Remove unknown state
                        dui.binds.hqWidgetsExt.hqMapping[wid].button.SetWindowState (dui.binds.hqWidgetsExt.hqMapping[wid].index, (newState == "true") ? hqWidgets.gWindowState.gWindowOpened : hqWidgets.gWindowState.gWindowClosed);
                        return;
                    }
                        
                    dui.binds.hqWidgetsExt.hqMapping[wid].button.SetStates (change);
                }
            },    
            hqButtonEdit: function (obj, parent, devFilter) {
                var opt = obj.GetSettings ();
                var devFilters = (devFilter) ? devFilter.split (';') : [null, null];
                if (opt.hm_id != undefined) {
                    var attr = 'hm_id';
                    parent.append('<tr id="option_'+attr+'" class="dashui-add-option"><td>'+dui.translate(attr)+'</td><td><input type="text" id="inspect_'+attr+'" size="44" value="'+opt.hm_id+'" style="width:90%"><input type="button" id="inspect_'+attr+'_btn" value="..."  style="width:8%"></td></tr>');
                    document.getElementById ("inspect_"+attr+"_btn").jControl  = attr;
                    document.getElementById ("inspect_"+attr+"_btn").devFilter = devFilters[0];
                    // Select Homematic ID Dialog
                    $("#inspect_"+attr+"_btn").click ( function () {
                        hmSelect.value = $("#inspect_"+this.jControl).val();
                        hmSelect.show (homematic.ccu, this.jControl, function (obj, value, valueObj) {
                            $("#inspect_"+obj).val(value).trigger("change");
                            if (valueObj) {
                                var btn = hqWidgets.Get (dui.activeWidget);
                                if (btn) {
                                    var settings = btn.GetSettings ();
                                    btn.SetSettings ({room: valueObj.room});
                                    if (settings.title == undefined || settings.title == null || settings.title == "") {
                                        var title = hmSelect._convertName(valueObj.Name);
                                        // Remove ROOM from device name
                                        if (title.length > valueObj.room.length && title.substring(0, valueObj.room.length) == valueObj.room)
                                            title = title.substring(valueObj.room.length);
                                        // Remove the leading dot
                                        if (title.length > 0 && title[0] == '.')
                                            title = title.substring(1);
                                        $('#inspect_title').val (title);
                                        $('#inspect_title').trigger ('change');
                                    }
                                }
                            }
                        }, null, this.devFilter);
                    });
                    $("#inspect_"+attr).change(function (el) {
                        var btn = hqWidgets.Get (dui.activeWidget);
                        if (btn) {
                            btn.SetSettings ({hm_id: $(this).val()}, true);
                        }
                    });
                    $("#inspect_"+attr).keyup (function () {
                        if (hqWidgets.e_internal.timer) 
                            clearTimeout (hqWidgets.e_internal.timer);
                                
                        hqWidgets.e_internal.timer = setTimeout (function(elem) {
                            elem.trigger("change");
                        }, hqWidgets.e_settings.timeout, $(this));
                    });
                }
                if (opt.buttonType == hqWidgets.gButtonType.gTypeBlind) {
                    var wnd = opt.windowConfig;
                    var a = wnd.split(',');
                    for (var i = 0; i < a.length; i++) {
                        var attr = 'hm_id'+i;
                        parent.append('<tr id="option_'+attr+'" class="dashui-add-option"><td>'+dui.translate(attr)+'</td><td><input type="text" id="inspect_'+attr+'" size="44" value="'+((opt[attr] != undefined) ? opt[attr] : "")+'" style="width:90%"><input type="button" id="inspect_'+attr+'_btn" value="..."  style="width:8%"></td></tr>');
                        document.getElementById ("inspect_"+attr+"_btn").jControl  = attr;
                        document.getElementById ("inspect_"+attr).jControl = attr;
                        document.getElementById ("inspect_"+attr+"_btn").devFilter = (devFilters.length > i + 1) ? devFilters[i+1] : devFilters[devFilters.length -1];
                        // Select Homematic ID Dialog
                        $("#inspect_"+attr+"_btn").click ( function () {
                            hmSelect.value = $("#inspect_"+this.jControl).val();
                            hmSelect.show (homematic.ccu, this.jControl, function (obj, value, valueObj) {
                                $("#inspect_"+obj).val(value).trigger("change");
                            }, null, this.devFilter);
                        });
                        $("#inspect_"+attr).change(function (el) {
                            var btn = hqWidgets.Get (dui.activeWidget);
                            
                            var wnd = btn.GetSettings ('windowConfig');
                            var a = wnd.split(',');
                            
                            if (btn) {
                                var option = {};
                                option[this.jControl] = $(this).val();
                                for (var j = a.length; j < 4; j++)
                                    option['hm_id'+j] = null;
                                btn.SetSettings (option, true);
                            }
                        });
                        $("#inspect_"+attr).keyup (function () {
                            if (hqWidgets.e_internal.timer) 
                                clearTimeout (hqWidgets.e_internal.timer);
                                    
                            hqWidgets.e_internal.timer = setTimeout (function(elem) {
                                elem.trigger("change");
                            }, hqWidgets.e_settings.timeout, $(this));
                        });                        
                    }
                }
                if (opt.buttonType == hqWidgets.gButtonType.gTypeInTemp) {
                    var attr = 'hm_idV';
                    parent.append('<tr id="option_'+attr+'" class="dashui-add-option"><td>'+dui.translate(attr)+'</td><td><input type="text" id="inspect_'+attr+'" size="44" value="'+((opt[attr] != undefined) ? opt[attr] : "")+'" style="width:90%"><input type="button" id="inspect_'+attr+'_btn" value="..."  style="width:8%"></td></tr>');
                    document.getElementById ("inspect_"+attr+"_btn").jControl  = attr;
                    document.getElementById ("inspect_"+attr).jControl = attr;
                    document.getElementById ("inspect_"+attr+"_btn").devFilter = (devFilters.length > i + 1) ? devFilters[i+1] : devFilters[devFilters.length -1];
                    // Select Homematic ID Dialog
                    $("#inspect_"+attr+"_btn").click ( function () {
                        hmSelect.value = $("#inspect_"+this.jControl).val();
                        hmSelect.show (homematic.ccu, this.jControl, function (obj, value, valueObj) {
                            $("#inspect_"+obj).val(value).trigger("change");
                        }, null, this.devFilter);
                    });
                    $("#inspect_"+attr).change(function (el) {
                        var btn = hqWidgets.Get (dui.activeWidget);
                        if (btn) {
                            var option = {};
                            option[this.jControl] = $(this).val();
                            btn.SetSettings (option, true);
                        }
                    });
                    $("#inspect_"+attr).keyup (function () {
                        if (hqWidgets.e_internal.timer) 
                            clearTimeout (hqWidgets.e_internal.timer);
                                
                        hqWidgets.e_internal.timer = setTimeout (function(elem) {
                            elem.trigger("change");
                        }, hqWidgets.e_settings.timeout, $(this));
                    });                        
                }
            },      
        }
    });