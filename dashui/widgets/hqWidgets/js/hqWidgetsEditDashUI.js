// Init words
dui.translate("");
// Add words for bars
jQuery.extend(true, dui.words, {
    "hm_id"            : {"en": "Object ID",     "de": "Objekt ID",            "ru": "ID объекта"},
	"hm_ids"           : {"en": "Object IDs",    "de": "Objekt IDs",           "ru": "ID объектов"},
	/*"hm_id0"           : {"en": "Swing ID 1",    "de": "Fensterblatt 1",       "ru": "Первая створка"},
	"hm_id1"           : {"en": "Swing ID 2",    "de": "Fensterblatt 2",       "ru": "Вторая створка"},
	"hm_id2"           : {"en": "Swing ID 3",    "de": "Fensterblatt 3",       "ru": "Третья створка"},
	"hm_id3"           : {"en": "Swing ID 4",    "de": "Fensterblatt 4",       "ru": "Четвертая створка"},*/
	"hm_id_hnd0"       : {"en": "Handle ID 1",   "de": "Griffkontakt 1",       "ru": "Первая ручка"},
	"hm_id_hnd1"       : {"en": "Handle ID 2",   "de": "Griffkontakt 2",       "ru": "Вторая ручка"},
	"hm_id_hnd2"       : {"en": "Handle ID 3",   "de": "Griffkontakt 3",       "ru": "Третья ручка"},
	"hm_id_hnd3"       : {"en": "Handle ID 4",   "de": "Griffkontakt 4",       "ru": "Четвертая ручка"},
	"hm_idV"           : {"en": "Valve",         "de": "Ventilsteuerung",      "ru": "Вентиль"},
	"hm_idB"           : {"en": "Brightness ID", "de": "Lichthelligkeit&nbsp;ID","ru": "ID Освещённости:"},
	"hm_idL"           : {"en": "Lock ID",       "de": "Schloss ID",           "ru": "ID замка"},
	"hm_idH"           : {"en": "Humidity ID",   "de": "Feuchtigkeit ID",      "ru": "ID влажности"},
	"hm_wid"           : {"en": "Working ID",    "de": "Working ID",           "ru": "ID в процессе"},
	"hm_idC_On"        : {"en": "id on",         "de": "id an",                "ru": "ID объекта для включения"},
	"hm_idC_Off"       : {"en": "id off",        "de": "id aus",               "ru": "ID объекта для выключения"},
	"ramp_time:"       : {"en" : "Ramp time(s)", "de": "Dauer - Aus (sek)",    "ru": "Длительность выключения (сек)"},
	"on_time:"         : {"en" : "On time(s)",   "de": "Dauer - An (sek)",     "ru": "Длительность включения (сек)"},
	"newVersion"       : {"en" : "Handler ab V1.6",  "de": "Griff ab V1.6",    "ru": "Версия выше V1.5"},
	"Service messages" : {"en" : "Service messages", "de": "Servicemeldungen ","ru": "Сервисные сообщения"},
	"Navigator:"       : {"en" : "Navigator:",   "de": "Navigator:",           "ru": "Навигация"},
	"Show top and bottom": {"en" : "Show top and bottom", "de": "Anzeigen oben und unten", "ru": "Показать сверху и снизу"},
	"Show bottom"      : {"en" : "Show bottom",  "de": "Anzeigen unten",       "ru": "Показать снизу"},
	"Do not show"      : {"en" : "Do not show",  "de": "Nicht anzeigen",       "ru": "Не показывать"},
	"Load period:"     : {"en" : "Load period:", "de": "Von CCU laden:",       "ru": "Загрузить период за:"},
	"1 Hour"           : {"en" : "1 Hour",       "de": "1 Stunde",             "ru": "1 час"},
	"2 Hours"          : {"en" : "2 Hours",      "de": "2 Stunden",            "ru": "2 часа"},
	"6 Hours"          : {"en" : "6 Hours",      "de": "6 Stunden",            "ru": "6 часов"},
	"12 Hours"         : {"en" : "12 Hours",     "de": "12 Stunden",           "ru": "12 часов"},
	"1 Day"            : {"en" : "1 Day",        "de": "1 Tag",                "ru": "1 день"},
	"3 Days"           : {"en" : "3 Days",       "de": "3 Tage",               "ru": "2 дня"},
	"5 Days"           : {"en" : "5 Days",       "de": "5 Tage",               "ru": "5 дней"},
	"1 Week"           : {"en" : "1 Week",       "de": "1 Woche",              "ru": "1 неделю"},
	"2 Weeks"          : {"en" : "2 Weeks",      "de": "2 Wochen",             "ru": "2 недели"},
	"1 Month"          : {"en" : "1 Month",      "de": "1 Monat",              "ru": "1 месяц"},
	"3 Months"         : {"en" : "3 Months",     "de": "3 Monate",             "ru": "3 месяца"},
	"6 Months"         : {"en" : "6 Months",     "de": "6 Monate",             "ru": "6 месяцев"},
	"1 Year"           : {"en" : "1 Year",       "de": "1 Jahr",               "ru": "1 год"},
	"All"              : {"en" : "All",          "de": "Alle",                 "ru": "Все данные"},
	"Theme:"           : {"en" : "Theme:",       "de": "Theme:",               "ru": "Тема:"},
	"Description with percent:": {"en" : "Description with percent:", "de": "Beschriftung y-Achse mit %", "ru": "Подписи оси Y в процентах"},
	"Zoom level:"      : {"en" : "Zoom level:",  "de": "Zoom-Stufe:",          "ru": "Уровень увеличения:"},
	"Scrollbar:"       : {"en" : "Scrollbar:",   "de": "Scrollbar:",           "ru": "Scroll:"},
	"Dynamic aggregation:": {"en" : "Dynamic aggregation:", "de": "Dynamische Aggregation:", "ru": "Динамическое объединение:"},
	"Legend:"          : {"en" : "Legend:",      "de": "Legende:",             "ru": "Легенда:"},
	"Left"             : {"en" : "Left",         "de": "Links",                "ru": "Слева"},
	"Inside"           : {"en" : "Inside",       "de": "im Chart",             "ru": "На графике"},
	"Hide"             : {"en" : "Hide",         "de": "nicht anzeigen",       "ru": "Скрыть"},
	"Zoom active:"     : {"en" : "Zoom active:", "de": "Zoomen aktiviert:",    "ru": "Активировать увеличение:"},
	"Charts..."        : {"en" : "Charts...",    "de": "Charts...",            "ru": "Графики..."},
	"Chart"            : {"en" : "Chart",        "de": "Chart",                "ru": "График"},
	"History"          : {"en" : "History",      "de": "Verlauf",              "ru": "История событий"},
	"General"          : {"en" : "General",       "de": "Allgemein",           "ru": "Основные"},
	"startValue"       : {"en" : "ON value [1-100]%", "de": "EIN Wert [1-100]%","ru": "Включить на [1-100]%"},
	"Invert state:"    : {"en" : "Invert state:", "de": "Invertiere Zustand:", "ru": "Инвертировать состояние:"},
	"Action on click:" : {"en" : "Action on click:", "de": "Aktion beim Anklicken:","ru": "Реакция при нажаттии"},
    "Advanced..."      : {"en" : "Advanced...",  "de": "Erweitert...",         "ru": "Дополнительно"},
    "Styles..."        : {"en" : "Styles...",    "de": "Styles...",            "ru": "Стили..."},
    "Show loading:"    : {"en": "Show loading:",   "de": "Zeige Ladeprozess:",    "ru": "Показать загрузку:"}
});


if ((typeof hqWidgets !== 'undefined') && dui.binds.hqWidgetsExt !== undefined) {
    $.extend(true, dui.binds.hqWidgetsExt, {
        hqEditVersion: "0.1.11",
        hqEditTimerDetectMoving: null,
        hqEditSaveTimer : null,
        hqEditWords: {
             "hm_id0"           : {"en": "Swing ID 1",    "de": "Fensterblatt 1",       "ru": "Первая створка"},
             "hm_id1"           : {"en": "Swing ID 2",    "de": "Fensterblatt 2",       "ru": "Вторая створка"},
             "hm_id2"           : {"en": "Swing ID 3",    "de": "Fensterblatt 3",       "ru": "Третья створка"},
             "hm_id3"           : {"en": "Swing ID 4",    "de": "Fensterblatt 4",       "ru": "Четвертая створка"}
        },
        hqEditInit: function () {
            if (hqWidgets.version != dui.binds.hqWidgetsExt.version || dui.binds.hqWidgetsExt.version != dui.binds.hqWidgetsExt.hqEditVersion)
                window.alert ("The versions of hqWidgets.html and hqWidgetsEdit.html are different. Expected version of hqWidgets.html is " +dui.binds.hqWidgetsExt.hqEditVersion);
        },
        hqEditOnDelete: function (widgetDiv, widgetId) {
            var btn_ = hqWidgets.Get(widgetId);
            if (btn_) {
                hqWidgets.Delete(btn_);
            }
        },
        hqEditOnCssEdit: function (widgetDiv, widgetId) {
            var hq = hqWidgets.Get(widgetId);
            var $widgetDiv = $(widgetDiv);

            hq.SetSettings({
                width:  $widgetDiv.width(),
                height: $widgetDiv.height(),
                y:      $widgetDiv.position().top,
                x:      $widgetDiv.position().left,
                zindex: $widgetDiv.zIndex(),
                radius: parseInt($widgetDiv.css('borderRadius'))
            });
        },
        hqEditOnOptionEdited: function (options) {
            // hqWidgets options
            $('#inspect_comment_tr').hide();
            $('#inspect_class_tr').hide();
            // Common settings
            hqWidgets.hqEditButton({
                parent:    options.parent,
                imgSelect: options.imgSelect,
                clrSelect: options.clrSelect,
                styleSelect: options.styleSelect
            }, hqWidgets.Get(options.widgetId), function (editEl) {
                // Special HM settings
                dui.binds.hqWidgetsExt.hqEditButton (hqWidgets.Get(options.widgetId), options.parent, $("#" + dui.views[dui.activeView].widgets[options.widgetId].tpl).attr("data-hqwidgets-filter"), editEl);
            });
        },
        hqEditIsOptionEdited: function (attr) {
            return attr == 'hqoptions';
        },
        hqEditOnMove: function (widgetDiv, widgetId) {

            widgetId = widgetId || dui.activeWidget;

            if (widgetId) {
                if (dui.views[dui.activeView].widgets[widgetId] !== undefined) {
                    var btn_ = hqWidgets.Get(widgetId);
                    if (btn_) {
                        if (document.getElementById (btn_.advSettings.elemName)) {
                            var pos = btn_.intern._jelement.position();
                            pos.top  = Math.round(pos.top);
                            pos.left = Math.round(pos.left);
                            if (pos.left == 0 && pos.top == 0) {
                                // suspicious
                                btn_.intern._jelement = $('#' + btn_.advSettings.elemName);
                                pos = btn_.intern._jelement.position();
                                pos.top  = Math.round(pos.top);
                                pos.left = Math.round(pos.left);
                            }

                            // If position changed
                            if (pos.top != btn_.settings.y || pos.left != btn_.settings.x) {
                                btn_.SetPosition(pos.left, pos.top);
                            }
                        }
                        else {
                            hqWidgets.Delete(btn_);
                            if (widgetId == dui.activeWidget) {
                                dui.activeWidget = null;
                            }
                        }
                    }
                }
                else {
                    var btn = hqWidgets.Get(widgetId);
                    if (btn) {
                        if (!document.getElementById (btn.advSettings.elemName)) {
                            hqWidgets.Delete(btn);
                            if (widgetId == dui.activeWidget) {
                                dui.activeWidget = null;
                            }
                        }
                    }
                }
            }
        },
        hqEditDefault: function (wtype) {
            var opt = {x:50, y: 50};
            // If first creation
            if (wtype !== undefined) {
                // Set default settings
                if (wtype == 'tplHqButton') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeButton, 
                                          iconName: 'Lamp.png', 
                                          zindex: 2, 
                                          hm_id: '',
										  invertState: false
                                          });
                }
                else
                if (wtype == 'tplHqIp') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeButton, 
                                          iconName: 'pc.png', 
                                          zindex: 2,
										  radius: 15,
										  styleNormal: 'hq-button-base-normal-hover',
										  styleNormalHover: 'hq-button-base-normal',
										  styleActive: 'hq-button-green-normal',
										  styleActiveHover: 'hq-button-green-normal-hover',
                                          hm_id: '',
										  exShowGrafik: 'no'
                                          });
                }
                else
                if (wtype == 'tplHqInfo') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeInfo, 
                                          zindex: 2,
                                          hm_id: '',
                                          hm_idC_On:'', // On control (will be used for off if no hm_idC_Off projected                                          
                                          hm_idC_Off:'',
                                          ctrlActionBtn: false,
                                          ctrlQuestion: "",
                                          ctrlValueOn:  true,
                                          ctrlValueOff: false,
										  htmlOn:       "",
										  htmlOff:      ""
                                          });
                }
                else
                if (wtype == 'tplHqDimmer') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeDimmer, 
                                          iconName: 'Lamp.png', 
                                          zindex: 3,
                                          hm_id: '',
                                          hoursLastAction:-1,
                                          dimmerRampTime: 0.5,
                                          startValue: 100
                                          });
                }
                else
                if (wtype == 'tplHqShutter') {
                    opt = $.extend (opt, {buttonType:   hqWidgets.gButtonType.gTypeBlind, 
                                          windowConfig: hqWidgets.gSwingType.gSwingLeft, 
                                          zindex: 3,
                                          hm_id: '',
                                          newVersion: true,
										  invertState: false
                                          });
                }
                else
                if (wtype == 'tplHqInTemp') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeInTemp, 
                                          iconName: 'Temperature.png', 
                                          zindex: 2,
                                          hm_id: '',
                                          hm_idV:'',
                                          hoursLastAction:-1
                                          });
                }
                else
                if (wtype == 'tplHqOutTemp') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeOutTemp, 
                                          iconName: 'Temperature.png', 
                                          zindex: 2,
                                          hm_id: '',
                                          hm_idH: '',
                                          hoursLastAction:-1
                                          });
                }
                else
                if (wtype == 'tplHqDoor') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeDoor, 
                                          zindex: 3,
                                          hm_id: '',
										  exShowGrafik: 'no',
										  invertState: false
                                          });
                }
                else
                if (wtype == 'tplHqLock') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeLock, 
                                          iconName: 'unlocked.png', 
                                          iconOn: 'locked.png', 
                                          zindex: 21,
                                          hm_id: ''
                                          });
                }
                else
                if (wtype == 'tplHqText') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeText, 
                                          radius: 0, 
                                          zindex: 2, 
                                          hoursLastAction:-1});
                }
                else
                if (wtype == 'tplHqImage') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeImage, 
                                          iconName:'eg_trans.png', 
                                          radius: 0});
                }
                else
                if (wtype == 'tplHqCam') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeCam,  
                                          hm_id: '', 
                                          hm_idL:'',
                                          radius: 2, 
                                          width:100, 
                                          height:60, 
                                          zindex: 2, 
                                          popUpDelay: 10000, 
                                          ctrlActionBtn: false});
                }
                else
                if (wtype == 'tplHqGong') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeGong,  
                                          hm_id: '', 
                                          hm_idL:'',
                                          zindex: 2, 
                                          iconName: 'ringing-bell.png', 
                                          popUpDelay: 10000});
                }                
                else
                if (wtype == 'tplHqGauge') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeGauge,  
                                          hm_id: '', 
                                          zindex: 2, 
                                          radius: 2,
                                          valueMin: 0,
                                          valueMax: 100
                                          });
                }                
                else
				if (wtype == 'tplHqMotion') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeMotion, 
                                          iconName: 'motionOff.png', 
                                          iconOn: 'motionOn.png', 
                                          zindex: 3,
                                          hm_id: '',
                                          hm_idB: '', //Brightness
										  exShowGrafik: "history",
                                          hoursLastAction:-1,
                                          valueMin: 33,
                                          valueMax: 255
                                          });
                }
                else
                if (wtype == 'tplHqLowbat') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeLowbat, 
                                          iconName: '', 
                                          zindex: 2, 
                                          hm_id: '',
                                          radius: 3,
                                          showDescription: true,
                                          noBackground: false,
                                          infoIsHideInactive: true
                                          });
                }
                else
                if (wtype == 'tplHqCharts') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeButton,
                                          buttonTypeEx: hqWidgets.gButtonType.gTypeCharts,                 
                                          iconName: 'chart.png', 
                                          zindex: 2, 
                                          hm_ids: '',
                                          title: dui.translate("Chart"),
                                          exPopup: true
                                          });
                }
                else
                if (wtype == 'tplHqEventlist') {
                    opt = $.extend (opt, {buttonType: hqWidgets.gButtonType.gTypeButton, 
                                          buttonTypeEx: hqWidgets.gButtonType.gTypeEventlist,                 
                                          iconName: 'history.png', 
                                          zindex: 2, 
                                          hm_ids: '',
                                          exLoading: false,
                                          exStatesOnly: true,
                                          exTypes: 0,
                                          exWidth: 0,
                                          exPopup: true,
                                          exPcount: 250,
                                          title: dui.translate("History")
                                          });
                }
             }
            return opt;
        },
        // Create edit HM ID element with button and description
        hqEditHmID: function (obj, parent, devFilter, hqEditElem, attr, groupID, onChange) {
            var opt = obj.GetSettings (false, false);
            var devFilters = (devFilter) ? devFilter.split (';') : [null, null];
            
			if (!document.getElementById ('inspect_'+attr))
				parent.append('<tr '+((groupID === undefined) ? '': 'id="'+groupID+'"') + ' class="dashui-add-option"><td>'+dui.translate(attr)+':</td><td><input type="text" id="inspect_'+attr+'" size="5" value="'+(opt[attr] || "")+'"><input type="button" id="inspect_'+attr+'_btn" value="..."  style="width:30px"><div id="inspect_'+attr+'_desc"></div></td></tr>');
            
			document.getElementById ("inspect_"+attr).jControl         = attr;
            document.getElementById ("inspect_"+attr)._onChange        = onChange;
            document.getElementById ("inspect_"+attr+"_btn").jControl  = attr;
            document.getElementById ("inspect_"+attr+"_btn").devFilter = devFilters[0];
            $("#inspect_"+attr+"_desc").html(dui.getObjDesc (opt[attr]));
            
            // Select Homematic ID Dialog
            $("#inspect_"+attr+"_btn").click ( function () {
                hmSelect.value = $("#inspect_"+this.jControl).val();
                var pointFilter = "";
                var devFilter   = "";
                
                // Extract data points filter
                if (this.devFilter != null && this.devFilter != "") {
                    var f = this.devFilter.split(',');
                    for (var i = 0; i < f.length; i++) {
                        if (f[i].length > 0 && f[i][0] == '.') {
                            pointFilter += ((pointFilter == "") ? "" : ",") + f[i];
                        }
                        else {
                            devFilter += ((devFilter == "") ? "" : ",") + f[i];
                        }
                    }
                }
                
                hmSelect.show (localData, this.jControl, function (obj, value, valueObj) {
                    if (valueObj) {
                        var btn = hqWidgets.Get (dui.activeWidget);
                        if (btn) {
                            var stitle = btn.GetSettings ("title");
                            btn.SetSettings ({room: valueObj.room});
							// Update room text box
							$('#inspect_room').val (valueObj.room);
                            if (stitle == undefined || stitle == null || stitle == "") {
                                var title = hmSelect._convertName(valueObj.Name);                                        
                                // Remove ROOM from device name
                                if (title.length > valueObj.room.length && title.substring(0, valueObj.room.length) == valueObj.room)
                                    title = title.substring(valueObj.room.length);
                                // Remove the leading dot
                                if (title.length > 0 && title[0] == '.')
                                    title = title.substring(1);
                                $('#inspect_title').val (title).trigger ('change');
                            }
							// Try to find Function of the device and fill the Filter field
							if (document.getElementById ('inspect_filterkey')) {
                                var jInspect_filter = $('#inspect_filterkey');
								if (jInspect_filter.val() == "") {
									var hm_id = value;
									var func = null;
									while (hm_id && localData.metaObjects[hm_id]) {
										for (var t = 0; t < localData.metaIndex["ENUM_FUNCTIONS"].length; t++) {
											var list = localData.metaObjects[localData.metaIndex["ENUM_FUNCTIONS"][t]];
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
											
										hm_id = localData.metaObjects[hm_id]['Parent'];
									}
									// Fill up automatically filter for ping
									if (func == null && localData.metaObjects[value]["HssType"] == "PING") {
										func = "Network";
									}
									if (func) {
                                        jInspect_filter.val(func).trigger ('change');
									}
								}
                            }							
                        }
                    }
                    $("#inspect_"+obj).val(value).trigger("change");
                }, pointFilter, devFilter);
            });
            $("#inspect_"+attr).change(function (el) {
                $("#inspect_"+this.jControl+"_desc").html(dui.getObjDesc ($(this).val()));
                var btn = hqWidgets.Get (dui.activeWidget);
                if (this._onChange) {
                    this._onChange ($(this).val(), btn);
                }
                if (btn) {
                    var settings = {};
                    settings[this.jControl] = $(this).val();
                    btn.SetSettings (settings, true);
                }
            });
            $("#inspect_"+attr).keyup (function () {
                if (hqWidgets.e_internal.timer) 
                    clearTimeout (hqWidgets.e_internal.timer);
                        
                hqWidgets.e_internal.timer = setTimeout (function(elem) {
                    elem.trigger("change");
                }, hqWidgets.e_settings.timeout, $(this));
            });
        },
        // Check if the point is motion and if we can find brightness. Disable hm_idB if found
        _hqCheckBrightness: function (val, btn) {
            var isBright = false;
            if (localData.metaObjects[val] && localData.metaObjects[val]["Name"] && localData.metaObjects[val]["Name"].indexOf(".MOTION") != -1) {
                if (localData.metaObjects[val]["Parent"]) {
                    var parent = localData.metaObjects[val]["Parent"];
                    if (localData.metaObjects[parent] && localData.metaObjects[parent]["DPs"] && localData.metaObjects[parent]["DPs"]["BRIGHTNESS"]) {
                        isBright = true;
                    }
                }
            }
            if (isBright) {
                $('#inspect_hm_idB').prop('disabled', true).val("").trigger("change");
            }
            else {
                $('#inspect_hm_idB').prop('disabled', isBright);
            }
            $('#inspect_hm_idB_btn').prop('disabled', isBright);
        },
        hqEditButton: function (obj, parent, devFilter, hqEditElem) {
            var opt = obj.GetSettings (false, false);
            var devFilters = (devFilter) ? devFilter.split (';') : [null, null];
            var devFiltersNum = 0;
					
			// Invert state
			if (opt.buttonType == hqWidgets.gButtonType.gTypeButton ||
				opt.buttonType == hqWidgets.gButtonType.gTypeDoor   ||
				opt.buttonType == hqWidgets.gButtonType.gTypeBlind) {
                var sTextAdv  = "<tr id='idAdv"+(hqEditElem.e_internal.iAdvCount++)+"'>\n";
                    sTextAdv += "<td>"+ dui.translate("Invert state:") +"</td>\n";
                    sTextAdv += "<td><input id='"+hqEditElem.e_settings.elemName+"_invertState' type='checkbox' "+(hqEditElem.e_internal.attr.invertState ? "checked": "")+"></td></tr>";
                parent.append (sTextAdv);
                hqEditElem._EditCheckboxHandler ('invertState', false, false, true, null);
				if (!hqWidgets.visibility || !hqWidgets.visibility["Advanced"]) {
					$('#idAdv'+(hqEditElem.e_internal.iAdvCount -1)).hide();
				}
			}
			
            if (opt.buttonType == hqWidgets.gButtonType.gTypeDimmer) {
                // Add ramp_time and on_time
                var sTextAdv  = "<tr id='idAdv"+(hqEditElem.e_internal.iAdvCount++)+"'>\n";
                    sTextAdv += "<td>"+ dui.translate("ramp_time:") +"</td>\n";
                    sTextAdv += "<td><input style='width: "+hqEditElem.e_settings.width+"px' id='"+hqEditElem.e_settings.elemName+"_dimmerRampTime' type='text' value='"+hqEditElem.e_internal.attr.dimmerRampTime+"'></td></tr>";
                // Start value
                sTextAdv += "<tr id='idAdv"+(hqEditElem.e_internal.iAdvCount++)+"'>\n";
                sTextAdv += "<td>"+ dui.translate("startValue") +":</td>\n";
                sTextAdv += "<td><input style='width: "+hqEditElem.e_settings.width+"px' id='"+hqEditElem.e_settings.elemName+"_startValue' type='text' value='"+(hqEditElem.e_internal.attr.startValue || 100)+"'></td></tr>";

                parent.append (sTextAdv);
                hqEditElem._EditTextHandler ('dimmerRampTime');
                hqEditElem._EditTextHandler ('startValue');
				if (!hqWidgets.visibility || !hqWidgets.visibility["Advanced"]) {
					$('#idAdv'+(hqEditElem.e_internal.iAdvCount -2)).hide();
                    $('#idAdv'+(hqEditElem.e_internal.iAdvCount -1)).hide();
				}
            }
			else
            if (opt.buttonType == hqWidgets.gButtonType.gTypeMotion) {
                // Add ramp_time and on_time
                var sTextAdv  = "<tr id='idAdv"+(hqEditElem.e_internal.iAdvCount++)+"'>\n";
                    sTextAdv += "<td>"+ dui.translate("Action on click:") +"</td>\n";
                    sTextAdv += "<td><select id='"+hqEditElem.e_settings.elemName+"_exShowGrafik'>";
					sTextAdv += "  <option value='no'>" + dui.translate ("No action")+"</option>";
					sTextAdv += "  <option value='grafic'>" + dui.translate ("Chart")+"</option>";
					sTextAdv += "  <option value='history'>" + dui.translate ("History")+"</option>";
					sTextAdv += "</select>";
                parent.append (sTextAdv);
                hqEditElem._EditSelectHandler('exShowGrafik');   
				if (!hqWidgets.visibility || !hqWidgets.visibility["Advanced"]) {
					$('#idAdv'+(hqEditElem.e_internal.iAdvCount -1)).hide();
				}            
			}
			else
            if (opt.buttonType == hqWidgets.gButtonType.gTypeDoor ||
			    opt.exShowGrafik !== undefined) {
                // Add ramp_time and on_time
                var sTextAdv  = "<tr id='idAdv"+(hqEditElem.e_internal.iAdvCount++)+"'>\n";
                    sTextAdv += "<td>"+ dui.translate("Action on click:") +"</td>\n";
                    sTextAdv += "<td><select id='"+hqEditElem.e_settings.elemName+"_exShowGrafik'>";
					sTextAdv += "  <option value='no'>" + dui.translate ("No action")+"</option>";
					sTextAdv += "  <option value='history'>" + dui.translate ("History")+"</option>";
					sTextAdv += "</select>";
                parent.append (sTextAdv);
                hqEditElem._EditSelectHandler('exShowGrafik');   
				if (!hqWidgets.visibility || !hqWidgets.visibility["Advanced"]) {
					$('#idAdv'+(hqEditElem.e_internal.iAdvCount -1)).hide();
				}            
			}
			else
            if (opt.buttonType == hqWidgets.gButtonType.gTypeInfo) {
                // find next free index
                var j = 0;
                while (document.getElementById ('idCtrl'+j)) {
                    $('#idCtrl'+j).hide();
                    j++;
                }            
                var k = 0;
				var sTextC = "<tr id='idCtrl"+j+"'><td colspan='2'><table class='dashui-no-spaces' style='width: 100%'><tr><td style='width: 162px'>"+ dui.translate("URL control:")  +"</td><td><input id='"+hqEditElem.e_settings.elemName+"_urlControl' type='checkbox'></td></tr>";j++;
				
                sTextC += "<tr id='idHmCtrl"+k+"' class='dashui-add-option'><td>"+dui.translate("hm_idC_On")+":</td><td><input type='text' id='"+hqEditElem.e_settings.elemName+"_hm_idC_On' size='5' value='"+hqEditElem.e_internal.attr.hm_idC_On+"'><input type='button' id='"+hqEditElem.e_settings.elemName+"_hm_idC_On_btn' value='...'  style='width:30px'><div id='"+hqEditElem.e_settings.elemName+"_hm_idC_On_desc'></div></td></tr>";k++;
                sTextC += "<tr id='idHmCtrl"+k+"'><td>"+ dui.translate("Control value (ON):")  +"</td><td><input style='width: "+hqEditElem.e_settings.width+"px' id='"+hqEditElem.e_settings.elemName+"_ctrlValueOn'  type='text' value='"+hqEditElem.e_internal.attr.ctrlValueOn +"'></td></tr>";k++;
                
                sTextC += "<tr id='idHmCtrl"+k+"' class='dashui-add-option'><td>"+dui.translate("hm_idC_Off")+":</td><td><input type='text' id='"+hqEditElem.e_settings.elemName+"_hm_idC_Off' size='5' value='"+hqEditElem.e_internal.attr.hm_idC_Off+"'><input type='button' id='"+hqEditElem.e_settings.elemName+"_hm_idC_Off_btn' value='...'  style='width:30px'><div id='"+hqEditElem.e_settings.elemName+"_hm_idC_Off_desc'></div></td></tr>";k++;
                sTextC += "<tr id='idHmCtrl"+k+"'><td>"+ dui.translate("Control value (OFF):") +"</td><td><input style='width: "+hqEditElem.e_settings.width+"px' id='"+hqEditElem.e_settings.elemName+"_ctrlValueOff' type='text' value='"+hqEditElem.e_internal.attr.ctrlValueOff+"'></td></tr>";k++;
				
				var m = 0;
                sTextC += "<tr id='idCtrlUrl"+m+"'><td>"+ dui.translate("URL (ON):")  +"</td><td><input style='width: "+hqEditElem.e_settings.width+"px' id='"+hqEditElem.e_settings.elemName+"_htmlOn'  type='text' value='"+(hqEditElem.e_internal.attr.htmlOn  || "")+"'></td></tr>";m++;
                sTextC += "<tr id='idCtrlUrl"+m+"'><td>"+ dui.translate("URL (OFF):") +"</td><td><input style='width: "+hqEditElem.e_settings.width+"px' id='"+hqEditElem.e_settings.elemName+"_htmlOff' type='text' value='"+(hqEditElem.e_internal.attr.htmlOff || "")+"'></td></tr></table></td></tr>";m++;
                parent.append(sTextC);
                
				if (devFilters[devFiltersNum+1] !== undefined) devFiltersNum++;
				dui.binds.hqWidgetsExt.hqEditHmID (obj, parent, devFilters[devFiltersNum], hqEditElem, "hm_idC_On", 'idHmCtrl0');
				if (devFilters[devFiltersNum+1] !== undefined) devFiltersNum++;
                dui.binds.hqWidgetsExt.hqEditHmID (obj, parent, devFilters[devFiltersNum], hqEditElem, "hm_idC_Off", 'idHmCtrl2');
				hqEditElem._EditTextHandler('ctrlValueOn');   
                hqEditElem._EditTextHandler('ctrlValueOff');   
                hqEditElem._EditTextHandler('htmlOn');   
                hqEditElem._EditTextHandler('htmlOff');

				// If URL or homematic
				var isUrl = ((hqEditElem.e_internal.attr.htmlOn  != undefined && hqEditElem.e_internal.attr.htmlOn  != "" && hqEditElem.e_internal.attr.htmlOn  != null) ||
				             (hqEditElem.e_internal.attr.htmlOff != undefined && hqEditElem.e_internal.attr.htmlOff != "" && hqEditElem.e_internal.attr.htmlOff != null));
				
				$('#'+hqEditElem.e_settings.elemName+"_urlControl").prop("checked", isUrl);
				var ctrl = document.getElementById (hqEditElem.e_settings.elemName+"_urlControl");
				$(ctrl).bind ("change", function () {
					var obj = this.elem;
					if (this.checked) {						
						var z = 0;
						while (document.getElementById ("idHmCtrl"+z)) {
							$('#idHmCtrl' + z).hide();
							z++;
						}
						z = 0;
						while (document.getElementById ("idCtrlUrl"+z)) {
							$('#idCtrlUrl' + z).show();
							z++;
						}
					} else {
						var z = 0;
						while (document.getElementById ("idHmCtrl"+z)) {
							$('#idHmCtrl' + z).show();
							z++;
						}
						z = 0;
						while (document.getElementById ("idCtrlUrl"+z)) {
							$('#idCtrlUrl' + z).hide();
							z++;
						}					
					}
				}).trigger("change");
				

                if (!hqEditElem.e_internal.obj.controlsVisible){
                    // Hide all                      
                    var i = 0;
                    while (document.getElementById ('idCtrl'+i)) {
                        $('#idCtrl'+i).hide();
                        i++;
                    }
                }
            }
            
            // Edit hm_id with help of dialog
            if (opt["hm_id"] !== undefined && 
                opt.buttonTypeEx != hqWidgets.gButtonType.gTypeCharts &&
                opt.buttonTypeEx != hqWidgets.gButtonType.gTypeEventlist) {              
                if (opt.buttonType == hqWidgets.gButtonType.gTypeLowbat) {
                    dui.binds.hqWidgetsExt.hqEditHmID (obj, parent, devFilters[devFiltersNum], hqEditElem, 'hm_id', null, function (val, btn) {
                        // Select automatically image for this element
                        var e = $('#inspect_iconName');
                        if (1 || e.val() == "") {
                            var p = val;
                            while (localData.metaObjects[p]["Parent"] !== undefined) {
                                p = localData.metaObjects[p]["Parent"];
                            }
                            p = hmSelect._getImage(localData.metaObjects[p]["HssType"]);
                            if (p !== null && p != "") {
                                e.val (p).trigger("change");
                            }
                        }
                        // Add battery probelm text
                        /*e = $('#inspect_title');
                        if (e.val().indexOf('<br>') == -1) {
                            e.val(e.val()+"<br>"+hqWidgets.translate("Battery problem")).trigger("change");
                        }*/
                    });
                }
                else {
                    dui.binds.hqWidgetsExt.hqEditHmID (obj, parent, devFilters[devFiltersNum], hqEditElem, 'hm_id', undefined, dui.binds.hqWidgetsExt._hqCheckBrightness);
                }
                if (devFilters[devFiltersNum+1] !== undefined) devFiltersNum++;
            }
            if (opt["hm_ids"] != undefined) {
                // This is multiselect
                /*
                var attr = 'hm_id';
                var sText = '<tr id="option_'+attr+'" class="dashui-add-option"><td>'+dui.translate(attr)+'</td><td><select id="inspect_'+attr+'" multiple="multiple"  value="'+opt[attr]+'" "inspect_'+attr+'">\n';
                for (var i = 0; i < homematic.metaIndex.HSSDP.length; i++) {
                    var id = homematic.metaIndex.HSSDP[i];
                    var chId = homematic.metaObjects[id].Parent;

                    var unit = "";
                    if (homematic.metaObjects[id].ValueUnit) {
                        unit = " ["+homematic.metaObjects[id].ValueUnit+"]";
                    }
                    var tmp = homematic.metaObjects[id].Name.split(".");
                    var dpName = tmp[2];

                    sText +="<option value='"+id+"'>HSSDP "+homematic.metaObjects[chId].Name+" "+dpName+unit+"</option>\n";
                }                
                sText += '</select></td></tr>\n';
                parent.append(sText);

                // Select Homematic ID Dialog
                $("#inspect_"+attr).multiselect({
                    minWidth: 300,
                    height: 260,
                    noneSelectedText: "Datenreihen: keine ausgewahlt",
                    selectedText: "Datenreihen: # ausgewahlt",

                    checkAllText: "alle auswahlen",
                    uncheckAllText: "Auswahl aufheben"
                }).multiselectfilter({
                    placeholder: ""
                });
                
                $("#inspect_"+attr).change(function () {
                    var btn = hqWidgets.Get (dui.activeWidget);
                    if (btn) {
                        btn.SetSettings ({"hm_ids": $(this).val()}, true);
                    }
                });*/
                var attr = 'hm_ids';
                var points = opt["hm_ids"];
                if (points.constructor != Array) {
                    points = points.split(',');
                }
                var cnt = 8;
                for (var i = 0; i < cnt; i++) {
                    if (points[i] === undefined) points[i] = "";
                    
                    parent.append('<tr class="dashui-add-option"><td>'+dui.translate(attr)+':</td><td><input type="text" id="inspect_'+attr+'_'+i+'" size="5" value="'+points[i]+'"><input type="button" id="inspect_'+attr+'_'+i+'_btn" value="..."  style="width:30px"><div id="inspect_'+attr+'_'+i+'_desc"></div></td></tr>');
                    document.getElementById ("inspect_"+attr+"_"+i+"_btn").jControl  = attr+"_"+i;
                    document.getElementById ("inspect_"+attr+"_"+i+"_btn").devFilter = devFilters[0];
                    $("#inspect_"+attr+"_"+i+"_desc").html(dui.getObjDesc (points[i]));
                    // Select Homematic ID Dialog
                    $("#inspect_"+attr+"_"+i+"_btn").click ( function () {
                        hmSelect.value = $("#inspect_"+this.jControl).val();
                        hmSelect.show (localData, this.jControl, function (obj, value, valueObj) {
                            $("#inspect_"+obj).val(value).trigger("change");
                            if (valueObj) {
                                var btn = hqWidgets.Get (dui.activeWidget);
                                if (btn) {
                                    var stitle = btn.GetSettings ("title");
                                    btn.SetSettings ({room: valueObj.room});
                                    if (stitle == undefined || stitle == null || stitle == "") {
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
                    $("#inspect_"+attr+"_"+i).change(function (el) {
                        var i = this.id.substring(this.id.length-2);
                        i = i.replace('_','');
                        $("#inspect_hm_ids_"+i+"_desc").html(dui.getObjDesc ($(this).val()));
                        var btn = hqWidgets.Get (dui.activeWidget);
                        if (btn) {
                            var j = 0;
                            var val = "";
                            var obj = null;
                            while (document.getElementById('inspect_hm_ids_'+j) != null) {
                                var v = $('#inspect_hm_ids_'+j).val();
                                if (v != "")
                                    val += ((val == "") ? "" : ",") + v;
                                j++;
                            }
                        
                            btn.SetSettings ({"hm_ids": val}, true);
                        }
                    });
                    $("#inspect_"+attr+"_"+i).keyup (function () {
                        if (hqWidgets.e_internal.timer) 
                            clearTimeout (hqWidgets.e_internal.timer);
                                
                        hqWidgets.e_internal.timer = setTimeout (function(elem) {
                            elem.trigger("change");
                        }, hqWidgets.e_settings.timeout, $(this));
                    });
                }
            }
            // no else hier
            if (opt.buttonType == hqWidgets.gButtonType.gTypeBlind) {
                var wnd = opt.windowConfig;
                var a = wnd.split(',');
                for (var i = 0; i < a.length; i++) {
                    var attr = 'hm_id'+i;
                    parent.append('<tr id="option_'+attr+'" class="dashui-add-option"><td>' +
                        (dui.binds.hqWidgetsExt.hqEditWords[attr] ? (dui.binds.hqWidgetsExt.hqEditWords[attr][dui.language] || dui.binds.hqWidgetsExt.hqEditWords[attr]['en']) : attr) +
                        ':</td><td><input type="text" id="inspect_'+attr+'" size="5" value="'+((opt[attr] != undefined) ? opt[attr] : "")+'"><input type="button" id="inspect_'+attr+'_btn" value="..."  style="width:30px"><div id="inspect_'+attr+'_desc"></div></td></tr>');
                    document.getElementById ("inspect_"+attr+"_btn").jControl = attr;
                    document.getElementById ("inspect_"+attr).jControl        = attr;
                    document.getElementById ("inspect_"+attr+"_btn").devFilter = (devFilters.length > 1) ? devFilters[1] : devFilters[0];
                    $("#inspect_"+attr+"_desc").html(dui.getObjDesc (opt[attr]));
                    // Select Homematic ID Dialog
                    $("#inspect_"+attr+"_btn").click ( function () {
                        hmSelect.value = $("#inspect_"+this.jControl).val();
                        hmSelect.show (localData, this.jControl, function (obj, value, valueObj) {
                            $("#inspect_"+obj).val(value).trigger("change");
                        }, null, this.devFilter);
                    });
                    $("#inspect_"+attr).change(function (el) {
                        var btn = hqWidgets.Get (dui.activeWidget);
                        
                        var wnd = btn.GetSettings ('windowConfig');
                        var a = wnd.split(',');

                        $("#inspect_"+this.jControl+"_desc").html(dui.getObjDesc ($(this).val()));
                        
                        if (btn) {
                            var option = {};
                            option[this.jControl] = $(this).val();
                            for (var j = a.length; j < 4; j++) {
                                option['hm_id'+j] = null;
                            }
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

                    //--------------- handler ------------------------
                    attr = 'hm_id_hnd'+i;
                    parent.append('<tr id="option_'+attr+'" class="dashui-add-option"><td>'+dui.translate(attr)+':</td><td><input type="text" id="inspect_'+attr+'" size="5" value="'+((opt[attr] != undefined) ? opt[attr] : "")+'"><input type="button" id="inspect_'+attr+'_btn" value="..."  style="width:30px"><div id="inspect_'+attr+'_desc"></div></td></tr>');
                    document.getElementById ("inspect_"+attr+"_btn").jControl  = attr;
                    document.getElementById ("inspect_"+attr).jControl = attr;
                    document.getElementById ("inspect_"+attr+"_btn").devFilter = (devFilters.length > 2) ? devFilters[2] : devFilters[0];
                    $("#inspect_"+attr+"_desc").html(dui.getObjDesc (opt[attr]));
                    // Select Homematic ID Dialog
                    $("#inspect_"+attr+"_btn").click ( function () {
                        hmSelect.value = $("#inspect_"+this.jControl).val();
                        hmSelect.show (localData, this.jControl, function (obj, value, valueObj) {
                            $("#inspect_"+obj).val(value).trigger("change");
                        }, null, this.devFilter);
                    });
                    $("#inspect_"+attr).change(function (el) {
                        var btn = hqWidgets.Get (dui.activeWidget);
                        
                        var wnd = btn.GetSettings ('windowConfig');
                        var a = wnd.split(',');
                        
                        $("#inspect_"+this.jControl+"_desc").html(dui.getObjDesc ($(this).val()));
                        
                        if (btn) {
                            var option = {};
                            option[this.jControl] = $(this).val();
                            for (var j = a.length; j < 4; j++)
                                option['hm_id_hnd'+j] = null;
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
                //--------------- handler version ------------------------
                /*var attr = 'newVersion';
                parent.append('<tr id="option_'+attr+'" class="dashui-add-option"><td>'+dui.translate(attr)+'</td><td><input type="checkbox" id="inspect_'+attr+'" '+((opt[attr] != undefined && opt[attr]) ? "checked" : "")+' ></td></tr>');
                document.getElementById ("inspect_"+attr).jControl = attr;
                $("#inspect_"+attr).change(function (el) {
                    var btn = hqWidgets.Get (dui.activeWidget);
                    if (btn) {
                        var option = {};
                        option[this.jControl] = $(this).prop('checked');
                        btn.SetSettings (option, true);
                    }
                });*/
            }
            else
            if (opt.buttonType == hqWidgets.gButtonType.gTypeInTemp) {
                dui.binds.hqWidgetsExt.hqEditHmID (obj, parent, devFilters[devFiltersNum], hqEditElem, 'hm_idV');
                if (devFilters[devFiltersNum+1] !== undefined) devFiltersNum++;
            }
            else
            if (opt.buttonType == hqWidgets.gButtonType.gTypeOutTemp) {
                dui.binds.hqWidgetsExt.hqEditHmID (obj, parent, devFilters[devFiltersNum], hqEditElem, 'hm_idH');
                if (devFilters[devFiltersNum+1] !== undefined) devFiltersNum++;
            }
            else
            if (opt.buttonType == hqWidgets.gButtonType.gTypeGong   || 
                opt.buttonType == hqWidgets.gButtonType.gTypeCam) {
                dui.binds.hqWidgetsExt.hqEditHmID (obj, parent, devFilters[devFiltersNum], hqEditElem, 'hm_idL');
                if (devFilters[devFiltersNum+1] !== undefined) devFiltersNum++;
            }
            else
            if (opt.buttonType == hqWidgets.gButtonType.gTypeMotion) {
                dui.binds.hqWidgetsExt.hqEditHmID (obj, parent, devFilters[devFiltersNum], hqEditElem, 'hm_idB');
                // Disable or enable hm_idB
                dui.binds.hqWidgetsExt._hqCheckBrightness (opt['hm_id'], obj);
                if (devFilters[devFiltersNum+1] !== undefined) devFiltersNum++;
            }
            
			
            // Highcharts settings
            if (opt.buttonType  == hqWidgets.gButtonType.gTypeInTemp  || 
                opt.buttonType  == hqWidgets.gButtonType.gTypeOutTemp ||
                (opt.buttonTypeEx !== undefined &&
                 opt.buttonTypeEx == hqWidgets.gButtonType.gTypeCharts)){
				                   
                var sTextChart    = "";
                var iChartCount   = 0;
                
                if (hqEditElem.e_internal.attr.charts === undefined) {
                    hqEditElem.e_internal.attr.charts = {
                        "navigator":   "",
                        "percentaxis": "true",
                        "period":      "72",
                        "theme":       "",
                        "range":       "24",
                        "scrollbar":   "true",
                        "grouping":    "true",
                        "legend":      "inline",
                        "zoom":        "true",
                        "loader":      "false"
                    };     
                }
                
                // Is Show Navigator
                sTextChart += "<tr id='iCharts"+(iChartCount++)+"'><td>"+ dui.translate("Navigator:")+"</td><td><select id='"+hqEditElem.e_settings.elemName+"_navigator' class='dashui-edit-select'>";
                sTextChart += "<option value=''     >"+dui.translate("Show top and bottom")+"</option>";
                sTextChart += "<option value='true' >"+dui.translate("Show bottom")+"</option>";
                sTextChart += "<option value='false'>"+dui.translate("Do not show")+"</option>";
                sTextChart += "</select>";                
                // Load from CCU: 1h, 2h, 6h, 12h, 1d, 3d, 5d, 1w, 2w, 1m, 3m, 6m, 1y, All
                sTextChart += "<tr id='iCharts"+(iChartCount++)+"'><td>"+ dui.translate("Load period:")+"</td><td><select id='"+hqEditElem.e_settings.elemName+"_period' class='dashui-edit-select'>";
                sTextChart += "<option value='1'    >"+dui.translate("1 Hour")+"</option>";
                sTextChart += "<option value='2'    >"+dui.translate("2 Hours")+"</option>";
                sTextChart += "<option value='6'    >"+dui.translate("6 Hours")+"</option>";
                sTextChart += "<option value='12'   >"+dui.translate("12 Hours")+"</option>";
                sTextChart += "<option value='24'   >"+dui.translate("1 Day")+"</option>";
                sTextChart += "<option value='72'   >"+dui.translate("3 Days")+"</option>";
                sTextChart += "<option value='120'  >"+dui.translate("5 Days")+"</option>";
                sTextChart += "<option value='168'  >"+dui.translate("1 Week")+"</option>";
                sTextChart += "<option value='336'  >"+dui.translate("2 Weeks")+"</option>";
                sTextChart += "<option value='720'  >"+dui.translate("1 Month")+"</option>";
                sTextChart += "<option value='2160' >"+dui.translate("3 Months")+"</option>";
                sTextChart += "<option value='4320' >"+dui.translate("6 Months")+"</option>";
                sTextChart += "<option value='8760' >"+dui.translate("1 Year")+"</option>";
                sTextChart += "<option value=''     >"+dui.translate("All")+"</option>";
                sTextChart += "</select>";

                // Theme: none, grid, dark-green, skies, dark-blue, gray 
                sTextChart += "<tr id='iCharts"+(iChartCount++)+"'><td>"+ dui.translate("Theme:")+"</td><td><select id='"+hqEditElem.e_settings.elemName+"_theme' class='dashui-edit-select'>";
                sTextChart += "<option value=''          >-</option>";
                sTextChart += "<option value='grid'      >Grid</option>";
                sTextChart += "<option value='dark-green'>Dark green</option>";
                sTextChart += "<option value='skies'     >Skies</option>";
                sTextChart += "<option value='dark-blue' >Dark blue</option>";
                sTextChart += "<option value='gray'      >Gray</option>";
                sTextChart += "</select>";                
                // Description left and right
                sTextChart += "<tr id='iCharts"+(iChartCount++)+"'><td>"+ dui.translate("Description with percent:")+"</td><td><input type='checkbox' id='"+hqEditElem.e_settings.elemName+"_percentaxis'>";
                // Zoom: 1h, 2h, 6h, 12h, 1d, 3d, 5d, 1w, 2w, 1m, 3m, 6m, 1y, Auto
                sTextChart += "<tr id='iCharts"+(iChartCount++)+"'><td>"+ dui.translate("Zoom level:")+"</td><td><select id='"+hqEditElem.e_settings.elemName+"_range' class='dashui-edit-select'>";
                sTextChart += "<option value='1'   >"+dui.translate("1 Hour")+"</option>";
                sTextChart += "<option value='2'   >"+dui.translate("2 Hours")+"</option>";
                sTextChart += "<option value='6'   >"+dui.translate("6 Hours")+"</option>";
                sTextChart += "<option value='12'  >"+dui.translate("12 Hours")+"</option>";
                sTextChart += "<option value='24'  >"+dui.translate("1 Day")+"</option>";
                sTextChart += "<option value='72'  >"+dui.translate("3 Days")+"</option>";
                sTextChart += "<option value='120' >"+dui.translate("5 Days")+"</option>";
                sTextChart += "<option value='168' >"+dui.translate("1 Week")+"</option>";
                sTextChart += "<option value='336' >"+dui.translate("2 Weeks")+"</option>";
                sTextChart += "<option value='720' >"+dui.translate("1 Month")+"</option>";
                sTextChart += "<option value='2160'>"+dui.translate("3 Months")+"</option>";
                sTextChart += "<option value='4320'>"+dui.translate("6 Months")+"</option>";
                sTextChart += "<option value='8760'>"+dui.translate("1 Year")+"</option>";
                sTextChart += "<option value=''    >"+dui.translate("All")+"</option>";
                sTextChart += "</select>";
                // Scrollbar
                sTextChart += "<tr id='iCharts"+(iChartCount++)+"'><td>"+ dui.translate("Scrollbar:")+"</td><td><input type='checkbox' id='"+hqEditElem.e_settings.elemName+"_scrollbar'>";
                // Dynamic aggregation
                sTextChart += "<tr id='iCharts"+(iChartCount++)+"'><td>"+ dui.translate("Dynamic aggregation:")+"</td><td><input type='checkbox' id='"+hqEditElem.e_settings.elemName+"_grouping'>";
                // Legend: Left, In chart, hide
                sTextChart += "<tr id='iCharts"+(iChartCount++)+"'><td>"+ dui.translate("Legend:")+"</td><td><select id='"+hqEditElem.e_settings.elemName+"_legend' class='dashui-edit-select'>";
                sTextChart += "<option value=''      >"+dui.translate("Left")+"</option>";
                sTextChart += "<option value='inline'>"+dui.translate("Inside")+"</option>";
                sTextChart += "<option value='false' >"+dui.translate("Hide")+"</option>";
                sTextChart += "</select>";                
                // Zoom active
                sTextChart += "<tr id='iCharts"+(iChartCount++)+"'><td>"+ dui.translate("Zoom active:")+"</td><td><input type='checkbox' id='"+hqEditElem.e_settings.elemName+"_zoom'>";
                // Show loading process
                sTextChart += "<tr id='iCharts"+(iChartCount++)+"'><td>"+ dui.translate("Show loading:")+"</td><td><input type='checkbox' id='"+hqEditElem.e_settings.elemName+"_loader'>";
                
                // Show button
                sTextChart = "<tr><td colspan=2><button id='idShowChart' class='dashui-group-button-width'>"+dui.translate("Charts...")+"</button></td></tr>" + sTextChart;
                hqEditElem.e_settings.parent.append (sTextChart);
                var advBtn = document.getElementById ('idShowChart');
                advBtn.obj   = hqEditElem;
                advBtn.state = (dui.visibility) ? dui.visibility["Charts"] : false;
                
                $('#idShowChart').button({icons: {primary: (!advBtn.state) ?  "ui-icon-carat-1-s" : "ui-icon-carat-1-n"}}).click(function( event ) {
                    this.state = !(this.state);
					if (!dui.visibility) {
						dui.visibility = {};
					}
                    dui.visibility["Charts"] = this.state;
                    if (this.state) {
                        $('#idShowChart').button("option", {icons: { primary: "ui-icon-carat-1-n" }});
                        var i = 0;
                        while (document.getElementById ('iCharts'+i)) {
                            $('#iCharts'+i).show();
                            i++;
                        }
                    }
                    else {
                        $('#idShowChart').button("option", {icons: { primary: "ui-icon-carat-1-s" }});
                        var i = 0;
                        while (document.getElementById ('iCharts'+i)) {
                            $('#iCharts'+i).hide();
                            i++;
                        }                                        
                    }
                });
                if (!advBtn.state) {
                    // Hide all                      
                    var i = 0;
                    while (document.getElementById ('iCharts'+i)) {
                        $('#iCharts'+i).hide();
                        i++;
                    }
                }
                hqEditElem._EditCheckboxHandlerEx = function (eee) {
                    var elem;
                    if ((elem = document.getElementById (this.e_settings.elemName+'_'+eee)) != null) {
                        if (this.e_internal.attr.charts[eee] == "true" || this.e_internal.attr.charts[eee] === true)
                            elem.checked = true;
                        elem.parent   = this;
                        elem.ctrlAttr = eee;
                        $('#'+this.e_settings.elemName+'_'+eee).change (function () { 
                            this.parent.e_internal.attr.charts[this.ctrlAttr] = $(this).prop('checked') ? "true" : "false";
                            this.parent.e_internal.obj.SetSettings ({"charts": this.parent.e_internal.attr.charts}, true);                            
                        });
                    }        
                };
                hqEditElem._EditSelectHandlerEx = function (eee) {
                    var elem;
                    if ((elem = document.getElementById (this.e_settings.elemName+'_'+eee)) != null) {
                        // Set actual value
                        for (var i = 0; i < elem.options.length; i++)
                            if (elem.options[i].value == this.e_internal.attr.charts[eee]) {
                                elem.options[i].selected = true;
                                break;
                            }
                        
                        elem.parent   = this;
                        elem.ctrlAttr = eee;
                        $('#'+this.e_settings.elemName+'_'+eee).change (function () { 
                            this.parent.e_internal.attr.charts[this.ctrlAttr] = $(this).prop('value');
                            this.parent.e_internal.obj.SetSettings ({"charts": this.parent.e_internal.attr.charts}, true);                            
                        });
                    }        
                };
                hqEditElem._EditSelectHandlerEx ('navigator');
                hqEditElem._EditSelectHandlerEx ('period');
                hqEditElem._EditSelectHandlerEx ('theme');
                hqEditElem._EditCheckboxHandlerEx ('percentaxis');
                hqEditElem._EditSelectHandlerEx ('range');
                hqEditElem._EditCheckboxHandlerEx ('scrollbar');
                hqEditElem._EditCheckboxHandlerEx ('grouping');
                hqEditElem._EditSelectHandlerEx ('legend');
                hqEditElem._EditCheckboxHandlerEx ('zoom');
                hqEditElem._EditCheckboxHandlerEx ('loader');
            }
            
            // Popup
            if (opt.buttonTypeEx !== undefined &&
                (opt.buttonTypeEx == hqWidgets.gButtonType.gTypeCharts ||
                 opt.buttonTypeEx == hqWidgets.gButtonType.gTypeEventlist)){
                var sText = "<tr><td>"+ dui.translate("As popup:") +"</td><td><input type='checkbox' id='"+hqEditElem.e_settings.elemName+"_exPopup' "+(hqEditElem.e_internal.attr.exPopup ? "checked" : "")+" ></td></tr>";
                parent.append(sText);
                hqEditElem._EditCheckboxHandler ('exPopup', false, false, true);
                
                // Hide all unused fields
                $("#tr"+hqEditElem.e_settings.elemName+"_state").hide();
                $("#td1_"+hqEditElem.e_settings.elemName+"_iconOn").hide();
                $("#td2_"+hqEditElem.e_settings.elemName+"_iconOn").hide();
                $("#td1_"+hqEditElem.e_settings.elemName+"_hoursLastAction").hide();
                $("#td2_"+hqEditElem.e_settings.elemName+"_hoursLastAction").hide();
                $("#td1_"+hqEditElem.e_settings.elemName+"_styleActiveParent").hide();
                $("#"+hqEditElem.e_settings.elemName+"_styleActiveParent").hide();
                $("#td1_"+hqEditElem.e_settings.elemName+"_styleActiveHoverParent").hide();
                $("#"+hqEditElem.e_settings.elemName+"_styleActiveHoverParent").hide();           
            }
            // Eventlist settings
            if (opt.buttonTypeEx !== undefined &&
                opt.buttonTypeEx == hqWidgets.gButtonType.gTypeEventlist) {
                var sText = "";
                sText += "<tr><td>"+ dui.translate("Show loading:") +"</td><td><input type='checkbox' id='"+hqEditElem.e_settings.elemName+"_exLoading' "+(hqEditElem.e_internal.attr.exLoading ? "checked" : "")+" ></td></tr>";
                sText += "<tr><td>"+ dui.translate("Only states:") +"</td><td><input type='checkbox' id='"+hqEditElem.e_settings.elemName+"_exStatesOnly' "+(hqEditElem.e_internal.attr.exStatesOnly ? "checked" : "")+" ></td></tr>";
                sText += "<tr><td>"+ dui.translate("Width:") +"</td><td><input style='width: "+hqEditElem.e_settings.width+"px' id='"+hqEditElem.e_settings.elemName+"_exWidth'  type='text' value='"+hqEditElem.e_internal.attr.exWidth+"'></td></tr>";
                sText += "<tr><td>"+ dui.translate("Show types:")+"</td><td><select id='"+hqEditElem.e_settings.elemName+"_exTypes' class='dashui-edit-select'>";
                sText += "<option value='0'>"+dui.translate("All")+"</option>";
                sText += "<option value='1'>"+dui.translate("Only devices")+"</option>";
                sText += "<option value='2'>"+dui.translate("Only variables")+"</option>";
                sText += "</select>";                
                sText += "<tr><td>"+ dui.translate("On one page:")+"</td><td><select id='"+hqEditElem.e_settings.elemName+"_exPcount' class='dashui-edit-select'>";
                sText += "<option value='25'>25</option>";
                sText += "<option value='50'>50</option>";
                sText += "<option value='100'>100</option>";
                sText += "<option value='250'>250</option>";
                sText += "<option value='500'>500</option>";
                sText += "<option value='750'>750</option>";
                sText += "<option value='1000'>1000</option>";
                sText += "</select>";                
                parent.append(sText);
                
                hqEditElem._EditCheckboxHandler ('exLoading', false, false, true);
                hqEditElem._EditCheckboxHandler ('exStatesOnly', false, false, true);
                hqEditElem._EditTextHandler('staticText');   
                hqEditElem._EditSelectHandler('exTypes');   
                hqEditElem._EditSelectHandler('exPcount');   
            }        
        }// end of hqEditButton     
    });
}
