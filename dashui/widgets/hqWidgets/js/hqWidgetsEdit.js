/*
hqWidgets is a “high quality” home automation widgets library.
You can easy create the user interface for home automation with the help of this library using HTML, javascript and CSS.
 
The library supports desktop and mobile browsers versions.
Actually library has following widgets:
- On/Off Button – To present and/or control some switch (e.g. Lamp)
- Dimmer – To present and control dimmer
- Window blind – to present and control one blind and display up to 4 window leafs
- Indoor temperature – to display indoor temperature and humidity with desired temperature and valve state
- Outdoor temperature – to display outdoor temperature and humidity
- Door   – to present a door
- Lock   – to present and control lock
- Image  – to show a static image
- Text   – to show a static text with different colors and font styles
- Info   – To display some information. Supports format string, condition for active state and different icons for active and static state.
 
------ Version V0.1 ------
 
 
----
Used software and icons:
* jQuery http://jquery.com/
* jQuery UI http://jqueryui.com/
* door bell by Lorc http://lorcblog.blogspot.de/


 Copyright (c) 2013 Bluefox dogafox@gmail.com
 
It is licensed under the Creative Commons Attribution-Non Commercial-Share Alike 3.0 license.
The full text of the license you can get at http://creativecommons.org/licenses/by-nc-sa/3.0/legalcode
 
Short content:
Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
Licensees may distribute derivative works only under a license identical to the license that governs the original work.
Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
(Free for non-commercial use).
*/

// Main object and container
if ((typeof hqWidgets !== 'undefined')) {
hqWidgets = $.extend (true, hqWidgets, {
    // Creates in the parent table lines with settings
    hqEditButton: function (options, obj, additionalSettingsFunction) {
        var e_settings = {
            parent:      null,
            elemName:    'inspect',
            width:       305,
            imgSelect:   null,   // image selection dialog
            timeout:     500,    // object update timeout
            clrSelect:   null,   // color selection dialog
            styleSelect: null    // style selection dialog
        };
        var e_internal = {
            attr:            null,
            controlRadius:   null,
            obj:             null,
            iconChanged:     null, //function
            inactiveChanged: null,
            timer:           null,
            textChanged:     null,
            textFontChanged: null,
            textColorChanged:null,
            infoChanged:     null,
            infoFontChanged: null,
            infoColorChanged:null,
            parent:          null,
            state:           hqWidgets.gState.gStateOff, // Simulate state
            extra:           null
        };
        this.e_settings = $.extend (e_settings, options);
        
        if (this.e_settings.parent == null)
            return;
            
        this.e_internal        = e_internal;
        this.e_internal.attr   = obj.GetSettings ();
        this.e_internal.obj    = obj;
        this.e_internal.parent = this;
        this.e_internal.extra  = additionalSettingsFunction;
        
        // clear all
        this.e_settings.parent.html("");
        
        var sText       = "";
        var sTextAdv    = "";
        var sTextCtrl   = "";
        var sTextStyle  = "";
        var iCtrlCount  = 0;
        var iAdvCount   = 0;
        var iStyleCount = 0;
        
        this._EditTextHandler = function (eee, filter, isStates) {
            var elem;
            if ((elem = document.getElementById (this.e_settings.elemName+'_'+eee)) != null) {
                elem.parent   = this;
                elem.ctrlAttr = eee;
                elem.filter   = (filter === undefined) ? null : filter;
                elem.isStates = isStates;
                var jeee = $('#'+this.e_settings.elemName+'_'+eee).change (function () {
                    // If really changed
                    var settings    = this.parent.e_internal.attr;
                    var name        = this.ctrlAttr;
                    var newSettings = {};
                    var nSettings   = newSettings;
                    
                    if (name.indexOf ("_") != -1) {
                        var t = name.split('_');
                        var i = 0;
                        nSettings = newSettings;
                        while (i < t.length - 1) {
                            settings = settings[t[i]];
                            nSettings[t[i]] = {};
                            nSettings = nSettings[t[i]];
                            i++;
                        }
                        name = t[t.length-1];
                    }
                    
                    if (!elem.isStates) {
                        if (settings[name] != $(this).val()) {
                            settings[name] = $(this).val();
                            
                            if (settings[name] == "" && name != 'infoFormat')
                                settings[name] = null;
                            
                            if (name == 'ctrlBtnText') {            
                                settings['ctrlActionBtn'] = (settings[name] != null);
                                newSettings['ctrlActionBtn'] = settings['ctrlActionBtn'];
                            } else
							if (name == 'infoCondition') {
								settings['infoCondition'] = $('#'+this.parent.e_settings.elemName+'_infoConditionSelect').val() + $('#'+this.parent.e_settings.elemName+'_infoCondition').val();
							}
                            
                            nSettings[name] = settings[name];
                            this.parent.e_internal.obj.SetSettings (newSettings, true);
                        }
                    }
                    else {
                        if (this.parent.e_internal.obj.dynStates[this.ctrlAttr] != $(this).val()) {
                            this.parent.e_internal.obj.dynStates[this.ctrlAttr] = $(this).val();
                            
                            if (this.parent.e_internal.obj.dynStates[this.ctrlAttr] == "")
                                this.parent.e_internal.obj.dynStates[this.ctrlAttr] = null;
                            
                            var newSettings = {};
                            newSettings[this.ctrlAttr] = this.parent.e_internal.obj.dynStates[this.ctrlAttr];
                            this.parent.e_internal.obj.SetStates (newSettings, true);
                        }
                    }
                });

                jeee.keyup (function () {
                    if (this.parent.e_internal.timer) 
                        clearTimeout (this.parent.e_internal.timer);
                        
                    this.parent.e_internal.timer = setTimeout (function(elem_) {
                        $(elem_).trigger('change');
                        elem_.parent.e_internal.timer=null;
                    }, this.parent.e_settings.timeout, this);
                });            
                if (this.e_settings.imgSelect) {
                    var btn = document.getElementById (this.e_settings.elemName+'_'+eee+'Btn');
                    if (btn) {
                        btn.ctrlAttr = eee;
                        btn.filter   = document.getElementById (this.e_settings.elemName+'_'+eee).filter;
                        $(btn).bind("click", {msg: this}, function (event) {
                            var _obj = event.data.msg;
                            var ctrlAttr = this.ctrlAttr;
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
                                $('#'+_obj.e_settings.elemName+'_'+ctrlAttr).val(src).trigger("change");
                                $("#inspect_"+wid_attr).val(src).trigger("change");
                            });
                        });
                    }
                }
            }	
        }
        this._EditCheckboxHandler = function (eee, isStates, valFalse, valTrue, onChange) {
            var elem;
            if ((elem = document.getElementById (this.e_settings.elemName+'_'+eee)) != null) {
                elem.parent   = this;
                elem.ctrlAttr = eee;
                elem.isStates = (isStates == undefined) ? true : isStates;
                elem.valFalse = (valFalse == undefined) ? hqWidgets.gState.gStateOff : valFalse;
                elem.valTrue  = (valTrue  == undefined) ? hqWidgets.gState.gStateOn  : valTrue;
                elem.onChange = onChange;
                
                $('#'+this.e_settings.elemName+'_'+eee).change (function () { 
                    this.parent.e_internal.attr[this.ctrlAttr] = $(this).prop('checked') ? this.valTrue : this.valFalse;
                    var newSettings = {};
                    newSettings[this.ctrlAttr] = this.parent.e_internal.attr[this.ctrlAttr];
                    
                    if (this.isStates)
                        this.parent.e_internal.obj.SetStates (newSettings);
                    else
                        this.parent.e_internal.obj.SetSettings (newSettings, true);
                    
                    if (this.onChange)
                        this.onChange (this.parent.e_internal.attr[this.ctrlAttr], this.parent);
                });
            }        
        }
        this._EditColorHandler = function (eee) {
            var elem;
            if ((elem = document.getElementById (this.e_settings.elemName+'_'+eee)) != null) {
                elem.parent   = this;
                elem.ctrlAttr = eee;
                var jeee = $('#'+this.e_settings.elemName+'_'+eee).change (function () {
                    // If really changed                  
                    if (this.parent.e_internal.attr[this.ctrlAttr] != $(this).val()) {
                        this.parent.e_internal.attr[this.ctrlAttr] = $(this).val();
                        
                        if (this.parent.e_internal.attr[this.ctrlAttr] == "")
                            this.parent.e_internal.attr[this.ctrlAttr] = null;
                        
                        var newSettings = {};
                        newSettings[this.ctrlAttr] = this.parent.e_internal.attr[this.ctrlAttr];
                        this.parent.e_internal.obj.SetSettings (newSettings, true);
                    }
                });

                jeee.keyup (function () {
                    if (this.parent.e_internal.timer) 
                        clearTimeout (this.parent.e_internal.timer);
                        
                    this.parent.e_internal.timer = setTimeout (function(elem_) {
                        $(elem_).trigger('change');
                        elem_.parent.e_internal.timer=null;
                    }, this.parent.e_settings.timeout, this);
                });            
                if (this.e_settings.clrSelect) {
                    var btn = document.getElementById (this.e_settings.elemName+'_'+eee+'Btn');
                    if (btn) {
                        btn.ctrlAttr = eee;
                        btn.elemName = this.e_settings.elemName;
                        $(btn).bind("click", {msg: this}, function (event) {
                            var _obj = event.data.msg;
                            var _settings = {
                                current:     _obj.e_internal.attr[this.ctrlAttr],
                                onselectArg: this.ctrlAttr,
                                onselect:    function (img, ctrlAttr) {
                                    $('#'+_obj.e_settings.elemName+'_'+ctrlAttr).val(_obj.e_settings.clrSelect.GetColor()).trigger("change");
                                }};
                            _obj.e_settings.clrSelect.Show (_settings);                    
                        });
                    }
                }
            }	
        }
        this._EditStyleHandler = function (eee, filterFile, filterName, filterAttrs) {
            var elem;
            if ((elem = document.getElementById (this.e_settings.elemName+'_'+eee+'Parent')) != null) {
                elem.parent   = this;
                elem.ctrlAttr = eee;
                if (this.e_settings.styleSelect) {
                    this.e_settings.styleSelect.Show ({ width: 180,
                        name:          this.e_settings.elemName+'_'+eee,
                        style:         this.e_internal.attr[elem.ctrlAttr],     
                        parent:        $('#'+this.e_settings.elemName+'_'+eee+'Parent'),
                        filterFile:    filterFile,
                        filterName:    filterName,
                        filterAttrs:   filterAttrs,
                        onchangeParam: elem,
                        onchange: function (newStyle, obj) {
                            // If really changed                  
                            if (obj.parent.e_internal.attr[obj.ctrlAttr] != newStyle) {
                                obj.parent.e_internal.attr[obj.ctrlAttr] = newStyle;
                                
                                if (obj.parent.e_internal.attr[obj.ctrlAttr] == "")
                                    obj.parent.e_internal.attr[obj.ctrlAttr] = null;
                                
                                var newSettings = {};
                                newSettings[obj.ctrlAttr] = obj.parent.e_internal.attr[obj.ctrlAttr];
                                obj.parent.e_internal.obj.SetSettings (newSettings, true);
                            }
                        }
                    });  
                }
                else {
                    // set here just textbox to input desired style
                }                
            }	
        }
        this._EditSelectHandler = function (eee, onchange) {
            var elem;
            if ((elem = document.getElementById (this.e_settings.elemName+'_'+eee)) != null) {
                // Set actual value
                for (var i = 0; i < elem.options.length; i++)
                    if (elem.options[i].value == this.e_internal.attr[eee]) {
                        elem.options[i].selected = true;
                        break;
                    }
                
                elem.parent    = this;
                elem.ctrlAttr  = eee;
				elem._onchange = onchange;
                $('#'+this.e_settings.elemName+'_'+eee).change (function () { 
                    var newSettings = {};
					if (this.ctrlAttr == 'infoConditionSelect') {
						newSettings['infoCondition'] = $('#'+this.parent.e_settings.elemName+'_infoConditionSelect').val() + $('#'+this.parent.e_settings.elemName+'_infoCondition').val();
						this.parent.e_internal.attr[this.ctrlAttr] = newSettings['infoCondition'];
					} else {
						this.parent.e_internal.attr[this.ctrlAttr] = $(this).prop('value');
						newSettings[this.ctrlAttr] = this.parent.e_internal.attr[this.ctrlAttr];
					}
                    this.parent.e_internal.obj.SetSettings (newSettings, true);
					if (this._onchange) {
						this._onchange (this.parent, this.ctrlAttr, this.parent.e_internal.attr[this.ctrlAttr]);
					}
                });
            }        
        }          
        // Active/Inactive state
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind  &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage  &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText   &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam    && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeGauge) {
            sText += "<tr id='tr"+this.e_settings.elemName+"_state'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Test state:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_state'>";
        }
        
        // Simulate click
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeCam  ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong) {
            sText += "<tr><td class='hq-edit-td-caption'></td><td><input type='button' value='"+hqWidgets.translate("Simulate click")+"' id='"+this.e_settings.elemName+"_popUp'>";
        }
        
        // Radius and Is Use jQuery Style
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeLock  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDoor  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Radius:")+"</td><td id='"+this.e_settings.elemName+"_radius'></td></tr>";
            if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeGauge)
                sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("jQuery Styles:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_usejQueryStyle' "+((this.e_internal.attr.usejQueryStyle) ? "checked" : "")+">";
        }

        // Door swing type
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeDoor) {
            sText += "<tr><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Slide:")+"</td><td><select style='width: "+this.e_settings.width+"px'  id='"+this.e_settings.elemName+"_door'>";
            sText += "<option value='"+hqWidgets.gSwingType.gSwingLeft +"' "+((this.e_internal.attr.doorType == hqWidgets.gSwingType.gSwingLeft)  ? "selected" : "") +">"+hqWidgets.translate("Left")+"</option>";
            sText += "<option value='"+hqWidgets.gSwingType.gSwingRight+"' "+((this.e_internal.attr.doorType == hqWidgets.gSwingType.gSwingRight) ? "selected" : "") +">"+hqWidgets.translate("Right")+"</option>";
            sText += "</select></td></tr>";
        }
        
        // Blind window types
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeBlind) {
            var wnd = this.e_internal.attr.windowConfig;
            var a = wnd.split(',');
            
            sText += "<tr><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Slide&nbsp;count:")+"</td><td><select style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_wndCount'>";
            sText += "<option value='1' "+((a.length==1) ? "selected" : "") +">1</option>";
            sText += "<option value='2' "+((a.length==2) ? "selected" : "") +">2</option>";
            sText += "<option value='3' "+((a.length==3) ? "selected" : "") +">3</option>";
            sText += "<option value='4' "+((a.length==4) ? "selected" : "") +">4</option>";
            sText += "</select></td></tr>";
            
            var i;
            for (i =0 ; i < a.length; i++)
            {
                sText += "<tr><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Slide&nbsp;type:")+"</td><td><select style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_wnd"+i+"'>";
                sText += "<option value='"+hqWidgets.gSwingType.gSwingDeaf +"' " +((a[i] == hqWidgets.gSwingType.gSwingDeaf)  ? "selected" : "") +">"+hqWidgets.translate("Not opened")+"</option>";
                sText += "<option value='"+hqWidgets.gSwingType.gSwingLeft +"' " +((a[i] == hqWidgets.gSwingType.gSwingLeft)  ? "selected" : "") +">"+hqWidgets.translate("Left")+"</option>";
                sText += "<option value='"+hqWidgets.gSwingType.gSwingRight+"' " +((a[i] == hqWidgets.gSwingType.gSwingRight) ? "selected" : "") +">"+hqWidgets.translate("Right")+"</option>";
                sText += "<option value='"+hqWidgets.gSwingType.gSwingTop  +"' " +((a[i] == hqWidgets.gSwingType.gSwingTop)   ? "selected" : "") +">"+hqWidgets.translate("Top")+"</option>";
                sText += "</select></td></tr>";
            }
        }
        
        // Normal icon image
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDoor  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam   && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeGauge) {
            sText += "<tr><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Icon:")+"</td><td>";
            sText += "<input id='"+this.e_settings.elemName+"_iconName' style='width: "+(this.e_settings.width - 30)+"px' type='text' value='"+(this.e_internal.attr.iconName || "")+"'>";
            sText += "<input id='"+this.e_settings.elemName+"_iconNameBtn' style='width: 30px' type='button' value='...'>";
            sText += "</td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Icon width:")+"</td><td id='"+this.e_settings.elemName+"_btIconWidth'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Icon height:")+"</td><td id='"+this.e_settings.elemName+"_btIconHeight'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Icon size:")+"</td><td><input id='"+this.e_settings.elemName+"_iconAutoBtn' type='button' value='Auto'></td></tr>";
        }

        // Do not show animation
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeBlind     ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeLock      ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeCam       ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong      ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeMotion    ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeCharts    ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeEventlist ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInfo      ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInTemp    ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeOutTemp) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("No animation:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_doNotAnimate' "+((this.e_internal.attr.doNotAnimate) ? "checked" : "")+">";
        }

        // Do not show status change
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeButton  ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong    ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeDimmer  ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeDoor) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Animation:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_showChanging' "+((this.e_internal.attr.showChanging) ? "checked" : "")+">";
        }

        // Info Text color, font, type
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDoor   && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText   && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeLock   && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDimmer && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeButton &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam    && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeGong && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeLowbat && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeMotion) {
            if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeGauge)
                sText    += "<tr><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Test text:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoText'  type='text' value='"+(this.e_internal.obj.dynStates.infoText || "")+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Font:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoTextFont'  type='text' value='"+this.e_internal.attr.infoTextFont+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Text color:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoTextColor' type='text' value='"+this.e_internal.attr.infoTextColor+"'>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_infoTextColorBtn' style='width: 30px' type='button' value='...'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Active text color:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoTextColorActive' type='text' value='"+(this.e_internal.attr.infoTextColorActive || "")+"'>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_infoTextColorActiveBtn' style='width: 30px' type='button' value='...'></td></tr>";
        }

        // Info Text color, font, type for Temperature
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInTemp ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeOutTemp) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Font:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoTextFont'  type='text' value='"+(this.e_internal.attr.infoTextFont || 'bold 11px "Tahoma", sans-serif')+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Text color:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoTextColor' type='text' value='"+(this.e_internal.attr.infoTextColor || 'black')+"'>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_infoTextColorBtn' style='width: 30px' type='button' value='...'></td></tr>";
        }

        // Percent min value, max value
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGauge ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeMotion) {
            sText    += "<tr><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Min value:")  +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_valueMin'  type='text' value='"+this.e_internal.obj.settings.valueMin+"'></td></tr>";
            sText    += "<tr><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Max value:")  +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_valueMax'  type='text' value='"+this.e_internal.obj.settings.valueMax+"'></td></tr>";
        }
        
        // Gauge test value, gauge color
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGauge) {
            sText    += "<tr><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Test value:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_valueSet'  type='text' value='"+((this.e_internal.obj.settings.valueMax - this.e_internal.obj.settings.valueMin) / 2)+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Color:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_gaugeColor' type='text' value='"+this.e_internal.attr.gaugeColor+"'>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_gaugeColorBtn' style='width: 30px' type='button' value='...'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Horizontal:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_gaugeHorz' "+((this.e_internal.attr.gaugeHorz) ? "checked" : "")+">";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("From top/left:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_gaugeStart' "+((this.e_internal.attr.gaugeStart) ? "checked" : "")+">";
            sText    += "<tr><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Accuracy:")  +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoAccuracy'  type='text' value='"+((this.e_internal.obj.settings.infoAccuracy === undefined || this.e_internal.obj.settings.infoAccuracy == null) ? "" : this.e_internal.obj.settings.infoAccuracy)+"'></td></tr>";
        }        
        
        // Static Text color, font, type
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeText) {
            sText    += "<tr><td>"+ hqWidgets.translate("Text:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_staticText'  type='text' value='"+this.e_internal.attr.staticText+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Font:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_staticTextFont'  type='text' value='"+this.e_internal.attr.staticTextFont+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Text color:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_staticTextColor' type='text' value='"+this.e_internal.attr.staticTextColor+"'>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_staticTextColorBtn' style='width: 30px' type='button' value='...'></td></tr>";
        }  

        // Active state icon
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDoor   && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeBlind  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText   &&
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam    && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeGauge) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td  class='hq-edit-td-caption' id='td1_"+this.e_settings.elemName+"_iconOn'>"+ hqWidgets.translate("Icon active:")+"</td><td id='td2_"+this.e_settings.elemName+"_iconOn'>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_iconOn' style='width: "+(this.e_settings.width - 30)+"px' type='text' value='"+(this.e_internal.attr.iconOn || "")+"'>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_iconOnBtn' style='width: 30px' type='button' value='...'>";
            sTextAdv += "</td></tr>";
        } 
        
        // Camera URL, pop up delay, if show open door button
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeCam ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong) {
            var s = "<td class='hq-edit-td-caption'>"+ hqWidgets.translate("Camera URL:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_ipCamImageURL'  type='text' value='"+(this.e_internal.attr.ipCamImageURL || "")+"'></td></tr>";
            if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeCam) {
                sText += "<tr>"+s;
				sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Video URL:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_ipCamVideoURL'  type='text' value='"+(this.e_internal.attr.ipCamVideoURL || "")+"'></td></tr>";
            }else{
                sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'>"+s;
            }
			sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Show Pop up:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_isPopupEnabled' "+((this.e_internal.attr.isPopupEnabled) ? "checked" : "")+">";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Pop up delay (ms):") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_popUpDelay'  type='text' value='"+this.e_internal.attr.popUpDelay+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Open door button:") +"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_ctrlActionBtn' "+(this.e_internal.attr.ctrlActionBtn ? "checked" : "")+" ></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Open door text:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_ctrlBtnText'  type='text' value='"+this.e_internal.attr.ctrlBtnText+"'></td></tr>";
        }

        // Camera update interval for small image
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeCam) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Small image update(sec):") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_ipCamUpdateSec'  type='text' value='"+this.e_internal.attr.ipCamUpdateSec+"'></td></tr>";
        }
        
        // Show percent
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeBlind || 
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGauge) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Show percent:") +"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_isShowPercent' "+((this.e_internal.attr.isShowPercent) ? "checked" : "")+"></td></tr>";
        }
        
        // gong wav, gong question, gong question image
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong) {
            sText    += "<tr><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Gong wav file:")+"</td><td>";
            sText    += "<input id='"+this.e_settings.elemName+"_gongMelody' style='width: "+(this.e_settings.width - 30)+"px' type='text' value='"+((this.e_internal.attr.gongMelody == undefined) ? "":this.e_internal.attr.gongMelody)+"'>";
            sText    += "<input id='"+this.e_settings.elemName+"_gongMelodyBtn' style='width: 30px' type='button' value='...'>";
            sText    += "</td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Gong question:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_ctrlQuestion'  type='text' value='"+this.e_internal.attr.ctrlQuestion+"'></td></tr>";
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Gong question image:")+"</td><td>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_ctrlQuestionImg' style='width: "+(this.e_settings.width - 30)+"px' type='text' value='"+((this.e_internal.attr.ctrlQuestionImg == undefined) ? "":this.e_internal.attr.ctrlQuestionImg)+"'>";
            sTextAdv += "<input id='"+this.e_settings.elemName+"_ctrlQuestionImgBtn' style='width: 30px' type='button' value='...'>";
            sTextAdv += "</td></tr>";
        }
        
        // Control question, Control question image
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInfo) {
            sTextCtrl += "<tr id='idCtrl"+(iCtrlCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Show control popup:") +"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_ctrlActionBtn' "+(this.e_internal.attr.ctrlActionBtn ? "checked" : "")+" ></td></tr>";
            sTextCtrl += "<tr id='idCtrl"+(iCtrlCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Control question:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_ctrlQuestion'  type='text' value='"+this.e_internal.attr.ctrlQuestion+"'></td></tr>";
            sTextCtrl += "<tr id='idCtrl"+(iCtrlCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Control question image:")+"</td><td>";
            sTextCtrl += "<input id='"+this.e_settings.elemName+"_ctrlQuestionImg' style='width: "+(this.e_settings.width - 30)+"px' type='text' value='"+((this.e_internal.attr.ctrlQuestionImg == undefined) ? "":this.e_internal.attr.ctrlQuestionImg)+"'>";
            sTextCtrl += "<input id='"+this.e_settings.elemName+"_ctrlQuestionImgBtn' style='width: 30px' type='button' value='...'>";
            sTextCtrl += "</td></tr>";
            sTextCtrl += "<tr id='idCtrl"+(iCtrlCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Button text:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_ctrlBtnText'  type='text' value='"+this.e_internal.attr.ctrlBtnText+"'></td></tr>";
        }
            
        // if hide last action info after x hours
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeText   && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeImage  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeCam    && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeDimmer && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeGauge  && 
            this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeLowbat) {            
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption' id='td1_"+this.e_settings.elemName+"_hoursLastAction'>"+ hqWidgets.translate("Last action:")+"</td><td id='td2_"+this.e_settings.elemName+"_hoursLastAction'><select id='"+this.e_settings.elemName+"_hoursLastAction' style='width: "+this.e_settings.width+"px'>";
            sTextAdv += "<option value='-1' >"+hqWidgets.translate("Do not show")+"</option>";
            sTextAdv += "<option value='-2'>" +hqWidgets.translate("Show always")+"</option>";
            sTextAdv += "<option value='1' >" +hqWidgets.translate("Hide after 1 hour")+"</option>";
            sTextAdv += "<option value='2' >" +hqWidgets.translate("Hide after 2 hours")+"</option>";
            sTextAdv += "<option value='6' >" +hqWidgets.translate("Hide after 6 hours")+"</option>";
            sTextAdv += "<option value='12' >"+hqWidgets.translate("Hide after 12 hours")+"</option>";
            sTextAdv += "<option value='24' >"+hqWidgets.translate("Hide after 1 day")+"</option>";
            sTextAdv += "<option value='24' >"+hqWidgets.translate("Hide after 2 days")+"</option>";
            sTextAdv += "</select></td></tr>";                
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Action time format:") +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_timeFormat'  type='text' value='"+(this.e_internal.attr.timeFormat || "") + "'></td></tr>";
        }
        
        // Format string
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInfo  ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGauge) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Format string:")    +"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_infoFormat'     type='text' value='"+this.e_internal.attr.infoFormat+"'></td></tr>";
        }
        
        // Active condition, If hide when incative state
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInfo) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Active condition:") +"</td><td>\n";
			var c    = ((this.e_internal.attr.infoCondition !== undefined && this.e_internal.attr.infoCondition.length > 3) ? this.e_internal.attr.infoCondition.substring(0,3) : "==");
			var cval = ((this.e_internal.attr.infoCondition !== undefined && this.e_internal.attr.infoCondition.length > 3) ? this.e_internal.attr.infoCondition.substring(3) : "");
			sTextAdv += "<select id='"+this.e_settings.elemName+"_infoConditionSelect' style='width:60px'>";
			for(var t in hqWidgets.gOperations) {
				sTextAdv += "<option value='"+hqWidgets.gOperations[t]+"' "+((c == hqWidgets.gOperations[t]) ? "selected" : "")+">"+hqWidgets.gOperations[t]+"</option>";
			}
			sTextAdv += "</select>";
			sTextAdv += "<input style='width: "+(this.e_settings.width - 60)+"px' id='"+this.e_settings.elemName+"_infoCondition' type='text' value='"+cval+"'>\n";
			sTextAdv += "</td></tr>";
            
			sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Hide inactive:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_infoIsHideInactive' "+((this.e_internal.attr.infoIsHideInactive) ? "checked" : "")+">";
        }  
        
        // Lowbat, If hide when incative state
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeLowbat) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td>"+ hqWidgets.translate("Hide inactive:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_infoIsHideInactive' "+((this.e_internal.attr.infoIsHideInactive) ? "checked" : "")+">";
        }  
        
        // No background
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInfo   ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeButton ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong   ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeMotion ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeLowbat) {
            sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("No background:")+"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_noBackground' "+((this.e_internal.attr.noBackground) ? "checked" : "")+">";
        }
        
        // Styles
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInfo   ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeButton ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong   ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeOutTemp|| 
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeInTemp ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeDimmer || 
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeLowbat || 
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeMotion) {
            sTextStyle += "<tr id='idStyle"+(iStyleCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Normal:")+"</td><td id='"+this.e_settings.elemName+"_styleNormalParent' ></td></tr>";
            if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeLowbat) {
                sTextStyle += "<tr id='idStyle"+(iStyleCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Normal hover:")+"</td><td id='"+this.e_settings.elemName+"_styleNormalHoverParent' ></td></tr>";
            }
            if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeOutTemp && 
                this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeInTemp) {
                sTextStyle += "<tr id='idStyle"+(iStyleCount++)+"'><td class='hq-edit-td-caption' id='td1_"+this.e_settings.elemName+"_styleActiveParent'>"+ hqWidgets.translate("Active:")+"</td><td id='"+this.e_settings.elemName+"_styleActiveParent'></td></tr>";
                if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeLowbat) {
                    sTextStyle += "<tr id='idStyle"+(iStyleCount++)+"'><td class='hq-edit-td-caption' id='td1_"+this.e_settings.elemName+"_styleActiveHoverParent'>"+ hqWidgets.translate("Active hover:")+"</td><td id='"+this.e_settings.elemName+"_styleActiveHoverParent' ></td></tr>";
                }
            }
        }
        
        // If show description
        sTextAdv += "<tr id='idAdv"+(iAdvCount++)+"'><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Show description:") +"</td><td><input type='checkbox' id='"+this.e_settings.elemName+"_showDescription' "+(this.e_internal.attr.showDescription ? "checked" : "")+" ></td></tr>";
        
        
        // Description and Room
        sText += "<tr><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Description:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_title' type='text' value='"+((this.e_internal.attr.title) || "")+"'></td></tr>";
        sText += "<tr><td class='hq-edit-td-caption'>"+ hqWidgets.translate("Room:")+"</td><td><input style='width: "+this.e_settings.width+"px' id='"+this.e_settings.elemName+"_room' type='text' value='"+((this.e_internal.attr.room) || "")+"'></td></tr>";

        // Show all styles
        if (this.e_internal.obj.stylesVisible === undefined)
            this.e_internal.obj.stylesVisible = false;
                    
        this.e_settings.parent.append (sText);
        if (iStyleCount == 1)
            this.e_settings.parent.append (sTextStyle);
        else 
        if (iStyleCount > 1) {
            sTextStyle = "<tr><td colspan=2><button id='idShowStyle' class='dashui-group-button-width'>"+hqWidgets.translate("Styles...")+"</button></td></tr>" + sTextStyle;
            this.e_settings.parent.append (sTextStyle);
            var advBtn = document.getElementById ('idShowStyle');
            advBtn.obj   = this;
            advBtn.state = (hqWidgets.visibility) ? hqWidgets.visibility["Styles"] : false;
            
            $('#idShowStyle').button({icons: {primary: (!advBtn.state) ?  "ui-icon-carat-1-s" : "ui-icon-carat-1-n"}}).click(function( event ) {
                this.state = !(this.state);
				if (!hqWidgets.visibility) {
					hqWidgets.visibility = {};
				}
				hqWidgets.visibility["Styles"] = this.state;
                if (this.state) {
                    $('#idShowStyle').button("option", {icons: { primary: "ui-icon-carat-1-n" }});
                    var i = 0;
                    while (document.getElementById ('idStyle'+i)) {
                        $('#idStyle'+i).show();
                        i++;
                    }
                }
                else {
                    $('#idShowStyle').button("option", {icons: { primary: "ui-icon-carat-1-s" }});
                    var i = 0;
                    while (document.getElementById ('idStyle'+i)) {
                        $('#idStyle'+i).hide();
                        i++;
                    }                                        
                }
            });
            if (!advBtn.state) {
                // Hide all                      
                var i = 0;
                while (document.getElementById ('idStyle'+i)) {
                    $('#idStyle'+i).hide();
                    i++;
                }
            }
        }
        
        if (iAdvCount == 1) {
            this.e_settings.parent.append (sTextAdv);
        }
        else
        if (iAdvCount > 0) {
            sTextAdv = "<tr><td colspan=2><button id='idShowAdv' class='dashui-group-button-width'>"+hqWidgets.translate("Advanced...")+"</button></td></tr>" + sTextAdv;
            this.e_settings.parent.append (sTextAdv);
            var advBtn = document.getElementById ('idShowAdv');
            advBtn.obj   = this;
            advBtn.state = (hqWidgets.visibility) ? hqWidgets.visibility["Advanced"] : false;
            
            $('#idShowAdv').button({icons: {primary: (!advBtn.state) ?  "ui-icon-carat-1-s" : "ui-icon-carat-1-n"}}).click(function( event ) {
                this.state = !(this.state);
				if (!hqWidgets.visibility) {
					hqWidgets.visibility = {};
				}
				hqWidgets.visibility["Advanced"] = this.state;
                if (this.state) {
                    $('#idShowAdv').button("option", {icons: { primary: "ui-icon-carat-1-n" }});
                    var i = 0;
                    while (document.getElementById ('idAdv'+i)) {
                        $('#idAdv'+i).show();
                        i++;
                    }
                }
                else {
                    $('#idShowAdv').button("option", {icons: { primary: "ui-icon-carat-1-s" }});
                    var i = 0;
                    while (document.getElementById ('idAdv'+i)) {
                        $('#idAdv'+i).hide();
                        i++;
                    }                                        
                }
            });
            if (!advBtn.state){
                // Hide all                      
                var i = 0;
                while (document.getElementById ('idAdv'+i)) {
                    $('#idAdv'+i).hide();
                    i++;
                }
            }
        }
        
        // Show controls
        if (this.e_internal.obj.controlsVisible === undefined)
            this.e_internal.obj.controlsVisible = false;

        if (iCtrlCount > 0) {
            sTextCtrl = "<tr><td colspan=2><button id='idShowCtrl' class='dashui-group-button-width'>"+hqWidgets.translate("Control...")+"</button></td></tr>" + sTextCtrl;
            this.e_settings.parent.append (sTextCtrl);
            var ctrlBtn = document.getElementById ('idShowCtrl');
            ctrlBtn.obj   = this;
            ctrlBtn.state = (hqWidgets.visibility) ? hqWidgets.visibility["Control"] : false;
            
            $('#idShowCtrl').button({icons: {primary: (!advBtn.state) ?  "ui-icon-carat-1-s" : "ui-icon-carat-1-n"}}).click(function( event ) {
                this.state = !(this.state);
				if (!hqWidgets.visibility) {
					hqWidgets.visibility = {};
				}
				hqWidgets.visibility["Control"] = this.state;
                if (this.state) {
                    $('#idShowCtrl').button("option", {icons: { primary: "ui-icon-carat-1-n" }});
                    var i = 0;
                    while (document.getElementById ('idCtrl'+i)) {
                        $('#idCtrl'+i).show();
                        i++;
                    }
                }
                else {
                    $('#idShowCtrl').button("option", {icons: { primary: "ui-icon-carat-1-s" }});
                    var i = 0;
                    while (document.getElementById ('idCtrl'+i)) {
                        $('#idCtrl'+i).hide();
                        i++;
                    }                                        
                }
            });
            if (!advBtn.state){
                // Hide all                      
                var i = 0;
                while (document.getElementById ('idCtrl'+i)) {
                    $('#idCtrl'+i).hide();
                    i++;
                }
            }
        }
          
        // Apply functionality
        this._EditCheckboxHandler ('state');
    
        var elem;
        if ((elem = document.getElementById (this.e_settings.elemName+'_popUp')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_popUp').click (function () { 
                this.parent.e_internal.obj.OnClick (true);
                $(this).attr('checked', false);
            });
        }        

        if (document.getElementById (this.e_settings.elemName+'_radius') != null) {
            this.e_internal.controlRadius = new this.hqSlider ({parent: $('#'+this.e_settings.elemName+'_radius'), 
                                                     withText: true, 
                                                     position: this.e_internal.attr.radius, 
                                                     max:      ((this.e_internal.attr.height>this.e_internal.attr.width) ? this.e_internal.attr.width/ 2:this.e_internal.attr.height/ 2), 
                                                     min:      0, 
                                                     width:    this.e_settings.width, 
                                                     onchangePrm: this, 
                                                     onchange: function (pos, obj_){
                                                        if (obj_.e_internal.attr.radius != pos) {
                                                            obj_.e_internal.attr.radius = pos;
                                                            
                                                            if (!isNaN(obj_.e_internal.attr.radius))
                                                                obj_.e_internal.obj.SetSettings ({radius: obj_.e_internal.attr.radius}, true);
                                                        }
                                                     }
            });
        }	
        // Icon width
        if (document.getElementById (this.e_settings.elemName+'_btIconWidth') != null) {
            this.e_internal.controlRadius = new this.hqSlider ({parent: $('#'+this.e_settings.elemName+'_btIconWidth'), 
                                                     withText: true, 
                                                     position: this.e_internal.attr.btIconWidth, 
                                                     max:      this.e_internal.attr.width, 
                                                     min:      0, 
                                                     width:    this.e_settings.width, 
                                                     onchangePrm: this, 
                                                     onchange: function (pos, obj_){
                                                        if (obj_.e_internal.attr.btIconWidth != pos) {
                                                            obj_.e_internal.attr.btIconWidth = pos;
                                                            
                                                            if (!isNaN(obj_.e_internal.attr.btIconWidth))
                                                                obj_.e_internal.obj.SetSettings ({btIconWidth: obj_.e_internal.attr.btIconWidth}, true);
                                                        }
                                                     }
            });
        }	
        // Icon height
        if (document.getElementById (this.e_settings.elemName+'_btIconHeight') != null) {
            this.e_internal.controlRadius = new this.hqSlider ({parent: $('#'+this.e_settings.elemName+'_btIconHeight'), 
                                                     withText: true, 
                                                     position: this.e_internal.attr.btIconHeight, 
                                                     max:      this.e_internal.attr.height, 
                                                     min:      0, 
                                                     width:    this.e_settings.width, 
                                                     onchangePrm: this, 
                                                     onchange: function (pos, obj_){
                                                        if (obj_.e_internal.attr.btIconHeight != pos) {
                                                            obj_.e_internal.attr.btIconHeight = pos;
                                                            
                                                            if (!isNaN(obj_.e_internal.attr.btIconHeight))
                                                                obj_.e_internal.obj.SetSettings ({btIconHeight: obj_.e_internal.attr.btIconHeight}, true);
                                                        }
                                                     }
            });
        }	
        
        // Auto height and width
        if (document.getElementById (this.e_settings.elemName+'_iconAutoBtn') != null) {
            document.getElementById (this.e_settings.elemName+'_iconAutoBtn').jControl = this;
            $('#'+this.e_settings.elemName+'_iconAutoBtn').click (function () {
                var obj = this.jControl;
                var newSettings = {};
                newSettings["btIconHeight"] = obj.e_internal.attr["height"] - 10;
                if (newSettings["btIconHeight"] < 0)
                    newSettings["btIconHeight"] = obj.e_internal.attr["height"];
                newSettings["btIconWidth"] = obj.e_internal.attr["width"] - 10;
                if (newSettings["btIconWidth"] < 0)
                    newSettings["btIconWidth"] = obj.e_internal.attr["width"];
                    
                obj.e_internal.obj.SetSettings (newSettings, true);
            });
        }
         
        // Process doorType changes
        if ((elem = document.getElementById (this.e_settings.elemName+'_door')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_door').change (function () {
                    this.parent.e_internal.attr.doorType = $(this).val();
                    this.parent.e_internal.obj.SetSettings ({doorType: this.parent.e_internal.attr.doorType}, true);
                });
        }		
        // Process window count changes
        if ((elem = document.getElementById (this.e_settings.elemName+'_wndCount')) != null) {
            elem.parent = this;
            $('#'+this.e_settings.elemName+'_wndCount').change (function () {
                    var iCnt = $(this).val();
                    var a = this.parent.e_internal.attr.windowConfig.split(',');
                    var i;
                    var newS = "";
                    for (i = 0; i < iCnt; i++) {
                        newS  += ((newS  == "") ? "" : ",") + ((i < a.length) ? a[i] : hqWidgets.gSwingType.gSwingRight);
                    }
                    
                    this.parent.e_internal.attr.windowConfig = newS;
                    this.parent.e_internal.obj.SetSettings ({windowConfig: this.parent.e_internal.attr.windowConfig}, true);
                    hqWidgets.hqEditButton (this.parent.e_settings, this.parent.e_internal.obj, this.parent.e_internal.extra);
                });
        }	
        // Process window types changes
        var i;
        for (i =0 ; i < 4; i++) {
            elem = document.getElementById (this.e_settings.elemName+'_wnd'+i);
            if (elem)
            {
                elem.parent = this;
                elem.index = i;
                $('#'+this.e_settings.elemName+'_wnd'+i).change (function () {
                        var a = this.parent.e_internal.attr.windowConfig.split(',');
                        var i;
                        var newS = "";
                        for (i = 0; i < a.length; i++)
                            newS  += ((newS  == "") ? "" : ",") + ((this.index != i) ? a[i] : $(this).val());
                        
                        this.parent.e_internal.attr.windowConfig = newS;
                        this.parent.e_internal.obj.SetSettings ({windowConfig: this.parent.e_internal.attr.windowConfig}, true);
                    });
            }	
        }				
        // Process center image
        this._EditTextHandler('iconName');
        this._EditTextHandler('iconOn');   
        
        this._EditTextHandler('infoText', '', true);   
        this._EditTextHandler('infoTextFont');   
        this._EditColorHandler('infoTextColor');   
        this._EditColorHandler('infoTextColorActive');   
        this._EditTextHandler('infoFormat');   
        this._EditTextHandler('infoCondition');
        this._EditSelectHandler('infoConditionSelect');
		
        
        this._EditTextHandler('staticText');   
        this._EditTextHandler('staticTextFont');   
        this._EditColorHandler('staticTextColor'); 
        
        this._EditTextHandler('valueSet', null, true);   
        this._EditColorHandler('gaugeColor');   
        this._EditTextHandler('valueMin');   
        this._EditTextHandler('valueMax');   
        this._EditTextHandler('infoAccuracy');
        this._EditCheckboxHandler ('gaugeHorz', false, false, true);
        this._EditCheckboxHandler ('gaugeStart', false, false, true);
        this._EditCheckboxHandler ('showDescription', false, false, true);
        this._EditCheckboxHandler ('isPopupEnabled', false, false, true);
        this._EditCheckboxHandler ('doNotAnimate', false, false, true);
        this._EditCheckboxHandler ('showChanging', false, false, true);

        this._EditTextHandler('title');   
        this._EditTextHandler('room');   
        this._EditSelectHandler('hoursLastAction', function (obj, attr, value) {
			$('#'+obj.e_settings.elemName+"_timeFormat").prop("disabled", (value != "-2"));
		});   
        this._EditTextHandler('timeFormat');
		var e = document.getElementById (this.e_settings.elemName+"_timeFormat");
		if (e) {
			$(e).prop("disabled", (this.e_internal.attr.hoursLastAction != "-2"));
		}
               
        this._EditCheckboxHandler ('infoIsHideInactive', false, false, true);
        this._EditCheckboxHandler ('noBackground', false, false, true);

        this._EditCheckboxHandler ('usejQueryStyle', false, false, true);
        this._EditCheckboxHandler ('isShowPercent', false, false, true, function (isChecked, obj) {
            if (!document.getElementById(obj.e_settings.elemName+'_hoursLastAction'))
                return;
            if (isChecked)
                document.getElementById(obj.e_settings.elemName+'_hoursLastAction').value = "-1";
            document.getElementById(obj.e_settings.elemName+'_hoursLastAction').disabled = isChecked;
        });
        this._EditTextHandler('ipCamImageURL');   
        this._EditTextHandler('ipCamVideoURL');   
        this._EditTextHandler('popUpDelay');   
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeCam ||
            this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGong) {
            this._EditCheckboxHandler ('ctrlActionBtn', false, false, true, function (isChecked, obj) {
                document.getElementById(obj.e_settings.elemName+'_ctrlBtnText').disabled = !isChecked;
            });
        }
        else {
            this._EditCheckboxHandler ('ctrlActionBtn', false, false, true, function (isChecked, obj) {
                $('#'+obj.e_settings.elemName+'_ctrlQuestion').prop('disabled', !isChecked);
                $('#'+obj.e_settings.elemName+'_ctrlQuestionImg').prop('disabled', !isChecked);
                $('#'+obj.e_settings.elemName+'_ctrlQuestionImgBtn').prop('disabled', !isChecked);
                $('#'+obj.e_settings.elemName+'_ctrlBtnText').prop('disabled', !isChecked);
            });
        }
        if (document.getElementById(this.e_settings.elemName+'_ctrlBtnText')) {
            document.getElementById(this.e_settings.elemName+'_ctrlBtnText').disabled = !this.e_internal.attr.ctrlActionBtn;
        }
        this._EditTextHandler ('ctrlBtnText');
        this._EditTextHandler ('hoursLastAction');
        if (this.e_internal.attr.buttonType != hqWidgets.gButtonType.gTypeMotion &&
     		document.getElementById(this.e_settings.elemName+'_hoursLastAction') && 
			this.e_internal.attr.isShowPercent) {
            document.getElementById(this.e_settings.elemName+'_hoursLastAction').value = "-1";
            document.getElementById(this.e_settings.elemName+'_hoursLastAction').disabled = this.e_internal.attr.isShowPercent;
        }
        if (document.getElementById(this.e_settings.elemName+"_ctrlActionBtn") != null) {
            $('#'+this.e_settings.elemName+'_ctrlQuestion').prop('disabled', !this.e_internal.attr.ctrlActionBtn);
            $('#'+this.e_settings.elemName+'_ctrlQuestionImg').prop('disabled', !this.e_internal.attr.ctrlActionBtn);
            $('#'+this.e_settings.elemName+'_ctrlQuestionImgBtn').prop('disabled', !this.e_internal.attr.ctrlActionBtn);
            $('#'+this.e_settings.elemName+'_ctrlBtnText').prop('disabled', !this.e_internal.attr.ctrlActionBtn);
        }
        
        this._EditTextHandler ('ctrlQuestion');
        this._EditTextHandler ('ctrlQuestionImg');
        
        this._EditTextHandler ('ipCamUpdateSec');
       
        this._EditTextHandler ('gongMelody', ".mp3;.wav");
        
        this._EditTextHandler ('ctrlQuestionImg');

        this._EditStyleHandler ('styleNormal',      null, '-button', 'background');
        this._EditStyleHandler ('styleNormalHover', null, '-button', 'background');
        this._EditStyleHandler ('styleActive',      null, '-button', 'background');
        this._EditStyleHandler ('styleActiveHover', null, '-button', 'background');

        
        this.e_internal.iAdvCount   = iAdvCount;
        this.e_internal.iStyleCount = iStyleCount;
        
        if (this.e_internal.attr.buttonType == hqWidgets.gButtonType.gTypeGauge) {
            $('#'+this.e_settings.elemName+'_valueSet').trigger('change');
        }
        
        if (this.e_internal.extra)
            this.e_internal.extra (this);
    },
    // Slider element for e_settings
    hqSlider: function (options){
        var settings = {
            parent:   $('body'),
            x:        null,
            y:        null,
            width:    100,  // - default horizontal
            height:   null, // - if vertical
            withText: true,
            min:      0,
            max:      100,
            position: null,
            onchange: null,   //- function (newPos, param)
            onchangePrm: null,
            orientation: 'horizontal'
        };
        var internal = {
            elemName:   null,
            isVertical: false,
            maxLength:  5,
            sposition:  999999,
            isVisible:  true,
            jelement:   null,
            element:    null,
            slider:     null,
            scale:      null,
            scalePos:   null,
            handler:    null,
            changed:    null, // function
            timer:      null,
            text:       null
        };
        
        this.settings = $.extend (settings, options);
        this.internal = internal;
        var i = 0;
        while (document.getElementById ("slider_"+i)) i++;
        this.internal.elemName = "slider_"+i;
        this.internal.isVertical = (this.settings.orientation == 'vertical') || (this.settings.height != undefined);
        if (this.internal.isVertical) 
            this.settings.height = this.settings.height || 100;
        this.internal.maxLength  = (this.settings.max >= 10000) ? 5 : ((this.settings.max >= 1000) ? 4 : ((this.settings.max >= 100) ? 3: ((this.settings.max >= 10) ? 2 : 1)));

        var sText = "<table id='"+this.internal.elemName+"'><tr>";
        if (this.settings.withText) {
            sText += "<td><input type='text' id='"+this.internal.elemName+"_text' maxlength='"+this.internal.maxLength+"'></td>";
            if (this.internal.isVertical) 
                sText += "</tr><tr>";
        }
        sText += "<td><div id='"+this.internal.elemName+"_bar'></div></td></tr></table>";
        
        this.settings.parent.append (sText);
        this.internal.jelement = $('#'+this.internal.elemName).addClass("h-no-select");
        this.internal.slider   = $('#'+this.internal.elemName+'_bar').addClass("h-no-select");
        this.internal.slider.parent = this;
        
        if (this.settings.x != undefined)
            this.internal.jelement.css ({position: 'absolute', left: this.settings.x, top: (this.settings.y !== null) ? this.settings.y: 0});
        
        // Add class
        if (this.internal.isVertical) 
            this.internal.slider.addClass ('hq-slider-base-vert').css({height: '100%'});
        else 
            this.internal.slider.addClass ('hq-slider-base-horz').css({width: '100%'});
        
        this.internal.slider.append("<div id='"+this.internal.elemName+"_scale'></div>");
        this.internal.element = document.getElementById (this.internal.elemName+'_bar');
        this.internal.scale = $('#'+this.internal.elemName+"_scale");
        
        if (this.internal.isVertical) 
            this.internal.scale.css({position: 'absolute', top: 0, left: (this.internal.slider.width() - 9/*this.internal.scale.height()*/)/2}).addClass (".ui-widget-content").addClass ("hq-slider-control-vert");
        else 
            this.internal.scale.css({position: 'absolute', left: 0, top: (this.internal.slider.height() - 9/*this.internal.scale.height()*/)/2}).addClass (".ui-widget-content").addClass ("hq-slider-control-horz");
        
        this.internal.scale.append("<div id='"+this.internal.elemName+"_scalePos'></div>").addClass("h-no-select");
        this.internal.scalePos = $('#'+this.internal.elemName+"_scalePos");
        this.internal.scalePos.css({position: 'absolute', left: 0, top: 0}).addClass("h-no-select");
        
        if (this.internal.isVertical) 
            this.internal.scalePos.addClass("ui-state-hover").addClass("hq-slider-control-pos-vert");
        else  
            this.internal.scalePos.addClass("ui-state-hover").addClass ("hq-slider-control-pos-horz");
        
        this.internal.slider.append("<div id='"+this.internal.elemName+"_handler'></div>");
        this.internal.handler = $('#'+this.internal.elemName+"_handler");
        this.internal.handler.css({position: 'absolute', left: 0, top: 0}).addClass("h-no-select");
        
        if (this.internal.isVertical) 
            this.internal.handler.addClass ("ui-state-active").addClass ("hq-slider-handler-vert");
        else 
            this.internal.handler.addClass ("ui-state-active").addClass ("hq-slider-handler-horz");
        
        if (this.settings.withText) {
            this.internal.text = $('#'+this.internal.elemName+'_text').addClass('hq-slider-info');
            var elem = document.getElementById (this.internal.elemName+'_text');
            var timeout = 500;
            if (elem) {
                elem.parent = this;
                this.internal.parent = this;
                this.internal.changed = function (){
                    var iPos = parseInt($('#'+this.elemName+'_text').val());
                    if (!isNaN(iPos))
                    {
                        this.parent.SetPosition (iPos);
                    }						
                };

                this.internal.text.change (function () {
					this.parent.internal.changed ();
				});
                this.internal.text.keyup (function () {
                    if (this.parent.internal.timer) {
						clearTimeout (this.parent.internal.timer);
					}
                    this.parent.internal.timer = setTimeout (function(elem) { 
						elem.internal.changed (); 
					}, 500, this.parent);
                });
            }		
            
            this.internal.text.change (function () {			
                this.parent.SetPosition (parseInt ($(this).val()));
            });	}
            
        if (this.internal.isVertical) 
            this.internal.slider.css({height: this.settings.height - ((this.internal.text) ? this.internal.text.height() : 0)});
        else 
            this.internal.slider.css({width: this.settings.width   - ((this.internal.text) ? this.internal.text.width() : 0)});

        this.SetPosition = function (newPos, isForce) {
            newPos = parseInt (newPos);
            if (newPos < this.settings.min) newPos = this.settings.min;
            if (newPos > this.settings.max) newPos = this.settings.max;
            
            if (this.internal.sposition != newPos || isForce)
            {
                this.internal.sposition=newPos;
                if (this.internal.isVertical)
                {
                    var k = this.internal.slider.height()*(this.internal.sposition - this.settings.min)/(this.settings.max - this.settings.min);
                    this.internal.scalePos.css({height:k});
                    this.internal.handler.css({top:k - this.internal.handler.height()/2});
                }
                else
                {
                    var k = this.internal.slider.width()*(this.internal.sposition - this.settings.min)/(this.settings.max - this.settings.min);
                    this.internal.scalePos.css({width:k});
                    this.internal.handler.css({left:k - this.internal.handler.width()/2});
                }
                if (this.internal.text)
                    document.getElementById (this.internal.elemName + "_text").value = ""+newPos;
                    
                if (this.settings.onchange)
                    this.settings.onchange (this.internal.sposition, this.settings.onchangePrm);
            }
        };
        this.SetRange = function (min, max) {
            this.settings.min = min;
            this.settings.max = max;
            this.SetPosition (this.internal.sposition, true);
        }
        // Set length or height
        this.SetSize = function (size) {
            if (size != undefined)
            {
                if (this.internal.isVertical)
                {
                    this.settings.height = size;
                    this.internal.slider.css({height: this.settings.height - ((this.internal.text) ? this.internal.text.height() : 0)});
                }
                else 
                {
                    this.settings.width = size;
                    this.internal.slider.css({width: this.settings.width - ((this.internal.text) ? this.internal.text.width() : 0)});
                }

                this.SetPosition(this.internal.sposition, true);
            }
        }
        
        document.getElementById (this.internal.elemName+'_bar').parentQuery = this;
        this.OnMouseMove = function (x, y) {
            var pos;
            if (this.internal.isVertical)
            {
                var yOffset = y - this.internal.slider.offset().top;// - this.slider.position().top;
                pos = (this.settings.max - this.settings.min)/this.internal.slider.height () * yOffset + this.settings.min;
            }
            else
            {
                var xOffset = x - this.internal.slider.offset().left; //this.slider.position().left;
                pos = (this.settings.max - this.settings.min)/this.internal.slider.width () * xOffset + this.settings.min;
            }
            this.SetPosition (pos);
        }
        this.OnMouseDown = function (x, y, isTouch) {
            hqWidgets.gDynamics.gActiveSlider = this;
            hqWidgets.onMouseMove (x, y);	
            return false;
        }
        this.internal.slider.bind ("mousedown", {msg: this}, function (e) {
            if (e.data.msg.OnMouseDown(e.pageX, e.pageY, false)) e.preventDefault();	
            return false;
        });
        this.internal.element.addEventListener('touchstart', function(e) {
            e.preventDefault();
            hqWidgets.gDynamics.gIsTouch=true;
            e.target.parentQuery.OnMouseDown (e.touches[0].pageX, e.touches[0].pageY, true);
        }, false);
        this.Position = function () {
            return this.internal.sposition;
        }
        this.Show = function () {
            this.internal.isVisible = true;
            this.internal.jelement.show();
            return this;
        }
        this.Hide = function () {
            this.internal.isVisible = false;
            this.internal.jelement.hide();
            return this;
        }	
        this.SetPosition ((this.settings.position !== null) ? this.settings.position : this.settings.min);
    }
});
}