// Init words

"use strict";

dui.translate("");
// Add words for bars
jQuery.extend(true, dui.words, {
	// Bars
	"One at time:"     : {"en" : "One at time:",  "de": "Nur eine auswahlbar:","ru": "Только один фильтр:"},
	"Geometry..."      : {"en" : "Geometry...",   "de": "Geometrie...",        "ru": "Позиция и размер..."},
	"Show"             : {"en" : "Show",          "de": "Zeigen",              "ru": "Показать"},
	"Bar type:"        : {"en" : "Bar type:",     "de": "Bartyp:",             "ru": "Тип:"},
	"Button width:"    : {"en" : "Button width:", "de": "Knopfbreite:",        "ru": "Ширина кнопок:"},
	"Button height:"   : {"en" : "Button height:","de": "Knopfh&ouml;he:",     "ru": "Высота кнопок:"},
	"Button space:"    : {"en" : "Button space:", "de": "Zwischenplatz:",      "ru": "Промежуток:"},
	"Border radius:"   : {"en" : "Border radius:","de": "Randradius:",         "ru": "Радиус закруглений:"},
	"Text offset %:"   : {"en" : "Text offset %:","de": "Textoffset in %:",    "ru": "Смещение текста в %:"},
	"Text align:"      : {"en" : "Text align:",   "de": "Textausrichtung:",    "ru": "Позиция текста:"},
	"Image align:"     : {"en" : "Image align:",  "de": "Bildausrichtung:",    "ru": "Позиция миниатюры:"},
	"Effects..."       : {"en" : "Effects...",    "de": "Effekte...",          "ru": "Эффекты..."},
	"Hide effect:"     : {"en" : "Hide effect:",  "de": "Verbergeneffekt:",    "ru": "Исчезновение:"},
	"Show effect:"     : {"en" : "Show effect:",  "de": "Anzeigeeffekt:",      "ru": "Появление:"},
	"Test"             : {"en" : "Test",          "de": "Test",                "ru": "Тест"},
	"Buttons..."       : {"en" : "Buttons...",    "de": "Kn&ouml;pfe",         "ru": "Кнопки..."},
	"Icon:"            : {"en" : "Icon:",         "de": "Bildchen:",           "ru": "Миниатюра:"},
	"Caption:"         : {"en" : "Caption:",      "de": "Beschriftung:",       "ru": "Подпись:"},
	"Filter key:"      : {"en" : "Filter key:",   "de": "Filterwort:",         "ru": "Значение фильтра:"},
	"Add"              : {"en" : "Add",           "de": "Neu",                 "ru": "Добавить"},
	"Up"               : {"en" : "Up",            "de": "Nach oben",           "ru": "На верх"},
	"Down"             : {"en" : "Down",          "de": "Nach unten",          "ru": "Вниз"},
	"Delete"           : {"en" : "Delete",        "de": "L&ouml;schen",        "ru": "Удалить"},
	"Horizontal"       : {"en" : "Horizontal",    "de": "Horizontal",          "ru": "Горизонтально"},
	"Vertical"         : {"en" : "Vertical",      "de": "Senkrecht",           "ru": "Вертикально"},
	"Docked at top"    : {"en" : "Docked at top", "de": "Angedockt oben",      "ru": "Панель сверху"},
	"Docked at bottom" : {"en" : "Docked at bottom", "de": "Angedockt unten",  "ru": "Панель снизу"},
	"Docked at left"   : {"en" : "Docked at left","de": "Angedockt links",     "ru": "Панель слева"},
	"Docked at right"  : {"en" : "Docked at right","de": "Angedockt rechts",   "ru": "Панель справа"},
	"Center"           : {"en" : "Center",        "de": "In der MItte",        "ru": "В середине"},
	"Left"             : {"en" : "Left",          "de": "Links",               "ru": "Слева"},
	"Right"            : {"en" : "Right",         "de": "Rechts",              "ru": "Справа"}
});
//jQuery.extend(true, dui.binds, {
	dui.binds.bars = {
		position : {
			floatHorizontal: 0,
			floatVertical:   1,
			dockTop:         2,
			dockBottom:      3,
			dockLeft:        4,
			dockRight:       5
		},
		bType : {
			filters:    0,
			navigation: 1
		},
        width: 308, // width of edit fields
		created: [],
		themes: [{css_class: 'sidebar-dark', name: 'Dark glass'},
				 {css_class: 'sidebar-blue', name: 'Blue glass'},
				 {css_class: 'sidebar-red',  name: 'Red glass'}
				 ],
        // Return widget for hqWidgets Button
        getWidgetByObj: function (div) {
            var duiWidget = dui.views[dui.activeView].widgets[div.barsIntern.wid];
            if (duiWidget === undefined) {
                for (var view in dui.views) {
                    if (dui.views[view].widgets[div.barsIntern.wid]) {
                        duiWidget = dui.views[view].widgets[div.barsIntern.wid];
                        break;
                    }
                }
            }
            
            return duiWidget;
        },
        // Save settings of this widgets
        editSave: function (div) {
            if (div !== undefined) {
                // Save settings of one widget
                var newOpt = JSON.stringify(div.barsOptions);
                //var newOpt = div.barsOptions; TODO
                var duiWidget = dui.binds.bars.getWidgetByObj (div);
                
                if (duiWidget) {
                    duiWidget.data['baroptions'] = newOpt;
                    //$(div).attr ('baroptions', newOpt);
                } else {
					if (!dui.views[dui.activeView].widgets) {
						dui.views[dui.activeView].widgets = {};
					}
					if (!dui.views[dui.activeView].widgets[div.barsIntern.wid]) {
						dui.views[dui.activeView].widgets[div.barsIntern.wid] = {};
					}
					if (!dui.views[dui.activeView].widgets[div.barsIntern.wid].data) {
						dui.views[dui.activeView].widgets[div.barsIntern.wid].data = {};
					}
                    dui.views[dui.activeView].widgets[div.barsIntern.wid].data['baroptions'] = newOpt;
                    //$(div).attr ('baroptions', newOpt);
				}
            }
            
            if (dui.binds.bars.editSaveTimer != null) {
                clearTimeout(dui.binds.bars.editSaveTimer);
            }
                
            dui.binds.bars.editSaveTimer = setTimeout (function () { 
                dui.saveRemote (); 
                console.log ("Saved!"); 
                dui.binds.bars.editSaveTimer = null;
            }, 2000);
        },
        _editSliderHandler: function (attr_name, div, min, max) {
            var elem = document.getElementById ('inspect_' + attr_name);
            if (elem == null) {
            } else {
                elem.ctrlAttr = attr_name;
                elem.parent   = div;
                var parent = $('#inspect_' + attr_name);
                parent.html("<table style='dashui-dashui-no-spaces'><tr style='dashui-dashui-no-spaces'><td style='dashui-dashui-no-spaces'><input type='text' size='3' value='" + div.barsOptions[attr_name] + "' id='inspect_" + attr_name + "_text'></td><td style='dashui-dashui-no-spaces'><div style='width: " + (dui.binds.bars.width - 40) + "px' id='inspect_" + attr_name + "_slider'></div></td></tr></table>");

                var slider = document.getElementById ("inspect_" + attr_name+ "_slider");
                var text   = document.getElementById ("inspect_" + attr_name+ "_text");
                slider.jText     = text;
                slider.ctrl      = div;
                slider.attr_name = attr_name;
                text.slider      = slider;
                text.ctrl        = div;
                text.attr_name   = attr_name;
                
                $("#inspect_" + attr_name + "_slider").slider({
                    min: min,
                    max: max,
                    range: "min",
                    value: div.barsOptions[attr_name],
                    slide: function (event, ui) {
                        var div = this.ctrl;
                        var attr_name = this.attr_name;
                        $(this.jText).val(ui.value);
                        if (div.barsOptions[attr_name] != ui.value) {
                            div.barsOptions[attr_name] = ui.value;
                            if (!isNaN(div.barsOptions[attr_name])) {
                                dui.binds.bars.init(div.barsIntern.wid);
                                dui.binds.bars.editSave(div);
                            }
                        }
                    }
                });
                $("#inspect_" + attr_name + "_text").change(function () {
                    this.slider.slider("value", $(this).val());
                });                
            }	        
        },
		_editSelectHandler: function (attr_name, div, _onPreChange, _onPostChange) {
            var elem;
            if ((elem = document.getElementById ('inspect_'+attr_name)) != null) {
                // Set actual value
                for (var i = 0; i < elem.options.length; i++)
                    if (elem.options[i].value == div.barsOptions[attr_name]) {
                        elem.options[i].selected = true;
                        break;
                    }
                
                elem.parent   = div;
                elem.ctrlAttr = attr_name;
				elem._onPreChange = _onPreChange;
				elem._onPostChange = _onPostChange;
                $(elem).change (function () { 
                    var div = this.parent;
                    div.barsOptions[this.ctrlAttr] = $(this).prop('value');
					if (this._onPreChange)
						this._onPreChange (div, this.ctrlAttr, div.barsOptions[this.ctrlAttr]);
                    dui.binds.bars.init (div.barsIntern.wid);
                    dui.binds.bars.editSave(div);
					if (this._onPostChange)
						this._onPostChange (div, this.ctrlAttr, div.barsOptions[this.ctrlAttr]);
                });
            }        
        },       	
        _editTextHandler: function (attr_name, div, i) {
            var elem;
            if (((elem = document.getElementById ('inspect_' + attr_name + "" + i)) != null) ||
                ((elem = document.getElementById ('inspect_' + attr_name)) != null)){
                elem.parent   = div;
                elem.ctrlAttr = attr_name;
                elem.ctrlId   = i;
                var jeee = $(elem).change (function () {
                    // If really changed
                    var div = this.parent;
                    if (this.ctrlId != -1) {
                        div.barsOptions.buttons[this.ctrlId][this.ctrlAttr] = $(this).prop('value');
                        dui.binds.bars.init (div.barsIntern.wid);
                    }
                    else{
                        div.barsOptions[this.ctrlAttr] = $(this).prop('value');
                        dui.binds.bars.init (div.barsIntern.wid);
                    }
                    dui.binds.bars.editSave(div);
                });

                jeee.keyup (function () {
                    if (this.parent.timer) 
                        clearTimeout (this.parent.timer);
                        
                    this.parent.timer = _setTimeout (function(elem_) {
                        $(elem_).trigger('change');
                        elem_.parent.timer=null;
                    }, 200, this);
                });            

                var btn = document.getElementById ('inspect_' + attr_name + "" + i + 'Btn');
                if (btn) {
                    btn.parent   = div;
                    btn.ctrlAttr = attr_name;
                    btn.ctrlId   = i;
                    $(btn).bind("click", {msg: div}, function (event) {
                        var attr =  this.ctrlAttr+this.ctrlId;
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
                            $('#inspect_'+attr).val(src).trigger("change");
                        });
                    });
                }
            }	
        },
		_editTextAutoCompleteHandler: function (attr_name, div, _sourceFnc) {
				// auto complete for class key
				var elem = document.getElementById ('inspect_' + attr_name);
				if (elem) {
					elem.ctrlAttr = attr_name;
					elem.ctrl = div;

					elem._save = function () {
						if (this.timer) 
							clearTimeout (this.timer);
							
						this.timer = _setTimeout (function(elem_) {
							var div = elem_.ctrl;
							 // If really changed
							div._oldAttr = div.barsOptions[elem_.ctrlAttr];
							div.barsOptions[elem_.ctrlAttr] = $(elem_).prop('value');
							dui.binds.bars.init (div.barsIntern.wid);
							dui.binds.bars.editSave(div);
						}, 200, this);            
					};
					
					$(elem).autocomplete({
						minLength: 0,
						source: _sourceFnc,
						select: function (event, ui){
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
		},
        _editCheckboxHandler: function (attr_name, div) {
            var elem;
            if ((elem = document.getElementById ('inspect_'+attr_name)) != null) {
                elem.ctrl     = div;
                elem.ctrlAttr = attr_name;
                
                $(elem).change (function () { 
                    var div = this.ctrl;
					div.barsOptions[this.ctrlAttr] = $(this).prop('checked');
					dui.binds.bars.init (div.barsIntern.wid);
                    dui.binds.bars.editSave(div);
                });
            }        
        },
        _editStyleHandler: function (attr_name, div, filterFile, filterName, filterAttrs) {
            var elem;
            if ((elem = document.getElementById ('inspect_'+attr_name+'Parent')) != null) {
                elem.ctrl     = div;
                elem.ctrlAttr = attr_name;
                if (dui.styleSelect) {
                    dui.styleSelect.Show ({ width: 180,
                        name:          'inspect__'+attr_name,
                        style:         div.barsOptions[elem.ctrlAttr],
                        parent:        $('#inspect_'+attr_name+'Parent'),
                        filterFile:    filterFile,
                        filterName:    filterName,
                        filterAttrs:   filterAttrs,
                        onchangeParam: elem,
                        onchange: function (newStyle, obj) {
                            var div_ = obj.ctrl;
                            // If really changed
                            if (div_.barsOptions[obj.ctrlAttr] != newStyle) {
                                div_.barsOptions[obj.ctrlAttr] = newStyle;

                                if (div_.barsOptions[obj.ctrlAttr] == "")
                                    div_.barsOptions[obj.ctrlAttr] = null;

                                dui.binds.bars.init (div_.barsIntern.wid);
                                dui.binds.bars.editSave(div_);
                            }
                        }
                    });
                }
                else {
                    // set here just textbox to input desired style
                }
            }
        },
		_showGroupButton: function (groupName, div) {
			var advBtn = document.getElementById (groupName + '_BtnGroup');
			advBtn.obj       = div;
			advBtn.groupName = groupName;				
			advBtn.state = (dui.visibility) ? dui.visibility[groupName] : false;

			$(advBtn).button({icons: {primary: (!advBtn.state) ?  "ui-icon-carat-1-s" : "ui-icon-carat-1-n"}}).click(function( event ) {
				this.state = !(this.state);
				if (!dui.visibility) {
					dui.visibility = {};
				}
				dui.visibility[this.groupName] = this.state;
				if (this.state) {
					$(this).button("option", {icons: { primary: "ui-icon-carat-1-n" }});
					var i = 0;
					var btn_;
					while (btn_ = document.getElementById (this.groupName + "" + i)) {
						$(btn_).show();
						i++;
					}
				}
				else {
					$(this).button("option", {icons: { primary: "ui-icon-carat-1-s" }});
					var i = 0;
					var btn__;
					while (btn__ = document.getElementById (this.groupName + "" + i)) {
						$(btn__).hide();
						i++;
					}
				}
			});
			if (!advBtn.state) {
				// Hide all
				var i = 0;
				var btn___;
				while (btn___ = document.getElementById (groupName + "" + i)) {
					$(btn___).hide();
					i++;
				}
			}
		},
		drawButton: function (wid, i, opt) {
            var style="style='"+(opt.bWidth ? ("width:"+opt.bWidth+"px;") : "")+(opt.bHeight ? ("height:"+opt.bHeight+"px;") : "") + "'";
			var cssClass = opt.bStyleNormal;
			if (!cssClass || cssClass == "") {
				cssClass = 'ui-state-default ui-button ui-widget';
			}
			
			
			var text = "<div id='"+wid+"_btn"+i+"' "+style+" class='"+cssClass+"'>\n";
			var isTable = true || (opt.buttons[i].image && opt.buttons[i].text);
			if (isTable) {
				text += "<table "+style+" class='dashui-no-spaces'><tr style='width:100%;height:100%' class='dashui-no-spaces'>\n";
				text += "<td class='dashui-no-spaces' style='width:"+opt.bOffset+"%; vertical-align: bottom; text-align: "+opt.bImageAlign+"'>\n";
			}
			if (opt.buttons[i].image) {
				text += "<img class='dashui-no-spaces' src='"+((opt.buttons[i].image.indexOf("/") != -1) ? opt.buttons[i].image : "img/" + opt.buttons[i].image) +"' style='"+(opt.bWidth ? ("max-width:"+(opt.bWidth - 5)+"px;") : "")+(opt.bHeight ? ("max-height:"+(opt.bHeight - 5)+"px;") : "") + "' />\n";
			}
			if (isTable) {
				text += "</td><td class='dashui-no-spaces' style='width:"+(100 - opt.bOffset)+"%; text-align: "+opt.bTextAlign+"'>\n";
			}
			if (opt.buttons[i].text) {
				text += "<span style='text-align: "+opt.bTextAlign+"'>" + opt.buttons[i].text + "</span>\n";
			}
			if (isTable) {
				text += "</td></tr></table>\n";
			}
			text += "</div>\n";
			return text;
		},
		draw: function(div, jDiv) {			
            var isHorizontal = (div.barsOptions.position == dui.binds.bars.position.floatHorizontal ||
			    div.barsOptions.position == dui.binds.bars.position.dockTop ||
			    div.barsOptions.position == dui.binds.bars.position.dockBottom);
           
            var w,h,text="";
            if (isHorizontal) {
                w = div.barsOptions.bWidth * div.barsOptions.buttons.length + div.barsOptions.bSpace * (div.barsOptions.buttons.length - 1);
                h = div.barsOptions.bHeight + 4;
            }
            else  {
                h = div.barsOptions.bHeight * div.barsOptions.buttons.length + div.barsOptions.bSpace * (div.barsOptions.buttons.length - 1) + 15;
                w = div.barsOptions.bWidth + 4;
            }
				
			text += '<table style="width:' + w + 'px; height:' + h + 'px" class="dashui-no-spaces">';
			if (isHorizontal) {
				text += "<tr class='dashui-no-spaces' style='height:" + div.barsOptions.bHeight + "px'>";
				for (var d = 0; d < div.barsOptions.buttons.length; d++) {
					text += "<td class='dashui-no-spaces' style='height:"+div.barsOptions.bHeight+"px;width:"+div.barsOptions.bWidth+"px'>" + this.drawButton (div.barsIntern.wid, d, div.barsOptions) + "</td>";
                                       if (div.barsOptions.bSpace && d != div.barsOptions.buttons.length - 1)
                                           text += "<td class='dashui-no-spaces' style='width:"+div.barsOptions.bSpace+"px'></td>";
				}
				text += "</tr>";
			}
			else { // vertical
				for (var i = 0; i < div.barsOptions.buttons.length; i++) {
					text += "<tr class='dashui-no-spaces'  style='height:"+div.barsOptions.bHeight+"px;width:"+div.barsOptions.bWidth+"px'><td class='dashui-no-spaces' style='height:"+div.barsOptions.bHeight+"px;width:"+div.barsOptions.bWidth+"px'>" + this.drawButton (div.barsIntern.wid, i, div.barsOptions) + "</td></tr>";
                    if (div.barsOptions.bSpace && i != div.barsOptions.buttons.length - 1)
                        text += "<tr class='dashui-no-spaces'><td class='dashui-no-spaces' style='height:"+div.barsOptions.bSpace+"px'></td></tr>";
				}
			}
			text += "</table>";

			jDiv.html (text);
            jDiv.css ({width: w, height: h});
			var elem = document.getElementById (div.barsIntern.wid+"_button");
			if (elem) {
				elem.ctrlId = div.barsIntern.wid;
				$('#'+div.barsIntern.wid+"_button").button ({
				  icons: {
					primary: "ui-icon-carat-1-n"
				  },
				  text: false
				}).click (function () {
					var j = $("#"+this.ctrlId+"_content");
					if (j.css ('display') == 'none') {
						$('#'+this.ctrlId+"_button").button ('option', {icons: {primary: "ui-icon-carat-1-s"}});
					} else {
						$('#'+this.ctrlId+"_button").button ('option', {icons: {primary: "ui-icon-carat-1-n"}});
                    }
                    j.slideToggle("slow");
				});
			}
		
            var hMax = 0;
            var wMax = 0;
			for (var b = 0; b < div.barsOptions.buttons.length; b++) {
                var btn = $('#'+div.barsIntern.wid+"_btn"+b);
				//btn.button();
                if (hMax < btn.height()) {
                    hMax = btn.height();
                }
                if (wMax < btn.width()) {
                    wMax = btn.width();
                }
			}
            if (wMax != 0 && hMax != 0) {
                for (var u = 0; u < div.barsOptions.buttons.length; u++) {
                    var html_btn = document.getElementById (div.barsIntern.wid+"_btn"+u);
                    html_btn.ctrl = div;
                    html_btn.ctrlId = u;
                    var btn_ = $(html_btn);
                    btn_.width(wMax);
                    btn_.height(hMax);
                    btn_.css ({'border-radius': div.barsOptions.bRadius});
                    btn_.hover (function () { 
						var div__ = this.ctrl;
						if (this._state === 1) {
							if (div__.barsOptions.bStyleActiveHover) {
								$(this).removeClass (div__.barsOptions.bStyleActive);
								$(this).removeClass (div__.barsOptions.bStyleNormal);
								$(this).addClass (div__.barsOptions.bStyleActiveHover);
							} else if (div__.barsOptions.bStyleNormalHover) {
								$(this).removeClass (div__.barsOptions.bStyleActive);
								$(this).removeClass (div__.barsOptions.bNormalActive);
								$(this).addClass (div__.barsOptions.bStyleNormalHover);
							} else {
								$(this).addClass ('ui-state-hover');
							}
						}else  {
							if (div__.barsOptions.bStyleNormalHover) {
								$(this).removeClass (div__.barsOptions.bStyleActive);
								$(this).removeClass (div__.barsOptions.bStyleNormal);
								$(this).addClass (div__.barsOptions.bStyleNormalHover);
							} else {
								$(this).addClass ('ui-state-hover');
							}
						}
					},
					function () { 
						var div__ = this.ctrl;
						$(this).removeClass ('ui-state-hover');
						$(this).removeClass (div__.barsOptions.bStyleActiveHover);
						$(this).removeClass (div__.barsOptions.bStyleNormalHover);
						
						if (this._state === 1) {
							if (div__.barsOptions.bStyleActive) {
								$(this).removeClass (div__.barsOptions.bStyleNormalHover);
								$(this).removeClass (div__.barsOptions.bStyleActiveHover);
								$(this).removeClass (div__.barsOptions.bStyleNormal);
								$(this).addClass (div__.barsOptions.bStyleActive);
							}
						}else  {
							if (div__.barsOptions.bStyleNormal) {
								$(this).removeClass (div__.barsOptions.bStyleActiveHover);
								$(this).removeClass (div__.barsOptions.bStyleNormalHover);
								$(this).addClass (div__.barsOptions.bStyleNormal);
							}
						}
					});
                    btn_.click (function () {
                        if (this.ctrl._onClick)
                            this.ctrl._onClick (this, this.ctrl, this.ctrlId)
                    });
                }
            }
			
			jDiv.css ({'border-radius': 0, padding: 0});
			
			// Remove previous class
			if (div._oldAttr)
				jDiv.removeClass(div._oldAttr);
			
			if (div.barsOptions.position == dui.binds.bars.position.floatHorizontal ||
			    div.barsOptions.position == dui.binds.bars.position.floatVertical) {
				jDiv.css ({'position':'absolute'});

				for (var q = 0; q < dui.binds.bars.themes.length; q++) {
					jDiv.removeClass(dui.binds.bars.themes[q].css_class);
				}
				if (div.barsOptions.bTheme != "") {
					jDiv.addClass(div.barsOptions.bTheme);
					jDiv.css ({'border-radius': 10, padding: 15});
				}
				else {
				}
			}
			else {
                if (!$().sidebar) {
                    window.alert("Float types are not supported, while sidebars are not included");
                    return;
                }

				jDiv.css ({left: 'auto', top: 'auto'});
				var position = "bottom";
				if (div.barsOptions.position == dui.binds.bars.position.dockTop) position = "top";
				else
				if (div.barsOptions.position == dui.binds.bars.position.dockLeft) position = "left";
				else
				if (div.barsOptions.position == dui.binds.bars.position.dockRight) position = "right";
				
				div.sidebar = jDiv.sidebar({position: position, width: jDiv.width() + 20, height: jDiv.height() + 20, open:"click", id: div.barsIntern.wid, root: $('#duiview_' + div.barsIntern.view)});
				$('#jquerySideBar_'+div.barsIntern.wid).addClass(div.barsOptions.bTheme);
			}
		},
		editButton: function (div, i, isInit) {
            var sText = "";
			var iBtnCount = 0;
            if (!isInit) {
                sText += "<tr id='idButtons"+(i*5+(iBtnCount++))+"'><td colspan=2 class='bars_line'></td></tr>";
                // Image
                sText += "<tr id='idButtons"+(i*5+(iBtnCount++))+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Icon:")+"</td><td>";
                sText += "<input id='inspect_image"+i+"' style='width: "+(dui.binds.bars.width - 30)+"px' type='text' value='"+(div.barsOptions.buttons[i].image || "")+"'>";
                sText += "<input id='inspect_image"+i+"Btn' style='width: 30px' type='button' value='...'>";
                sText += "</td></tr>";
                    
                // Name
                sText += "<tr id='idButtons"+(i*5+(iBtnCount++))+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Caption:") +"</td><td><input style='width: "+dui.binds.bars.width+"px' id='inspect_text"+i+"' type='text' value='"+(div.barsOptions.buttons[i].text || "")+"'></td></tr>";
                
                // option
                if (div.barsIntern.wType == 'tplBarFilter') {
                    sText += "<tr id='idButtons"+(i*5+(iBtnCount++))+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Filter key:") +"</td><td><input style='width: "+dui.binds.bars.width+"px' id='inspect_option"+i+"' value='"+(div.barsOptions.buttons[i].option || "")+"'></td></tr>";
                }
				else
                if (div.barsIntern.wType == 'tplBarNavigator') {
                    sText += "<tr id='idButtons"+(i*5+(iBtnCount++))+"'><td>"+ dui.translate("View name:") +"</td><td><input style='width: "+dui.binds.bars.width+"px' id='inspect_option"+i+"' type='text' value='"+(div.barsOptions.buttons[i].option || "")+"'></td></tr>";
                }
                else{
                    sText += "<tr id='idButtons"+(i*5+(iBtnCount++))+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Option:") +"</td><td><input style='width: "+dui.binds.bars.width+"px' id='inspect_option"+i+"' type='text' value='"+(div.barsOptions.buttons[i].option || "")+"'></td></tr>";
                }
                
                if (div.barsOptions.buttons.length > 1) {
                    sText += "<tr id='idButtons"+(i*5+(iBtnCount++))+"'><td class='dashui-edit-td-caption'></td><td>";
					sText += "<table class='no-space'><tr class='no-space'>";
                    sText +="<td style='width:90px' class='no-space'><button id='barsDel"+i+"' style='height: 30px'>"+dui.translate('Delete')+"</button></td>";
                    if (i > 0) {
                        sText +="<td style='width:90px;text-align: center' class='no-space'><button id='barsUp" +i+"' style='height: 30px'>"+/*dui.translate('Up')*/""+"</button></td>";
                    }else {
						sText +="<td style='width:90px' class='no-space'></td><td style='width:90px' class='no-space'></td>";
					}
					
					sText +="<td style='width:90px' class='no-space'>";
                    if (i != div.barsOptions.buttons.length - 1) {
                        sText +="<button id='barsDown" +i+"' style='height: 30px'>"+/*dui.translate('Down')*/""+"</button>";
                    }
					sText +="</td>";
					
                    
                    sText += "</tr></table></td></tr>";
                }
                
            }
            else {
                dui.binds.bars._editTextHandler ("image",  div, i);
                dui.binds.bars._editTextHandler ("text",   div, i);
                if (div.barsIntern.wType == 'tplBarFilter') {
                    var elem = document.getElementById ('inspect_option'+i);
                    if (elem) {
                        elem.parent   = div;
                        elem.ctrlAttr = 'option';
                        elem.ctrlId   = i;
                  
                        $(elem).autocomplete({
                            minLength: 0,
                            source: function(request, response) {            
                                var data = $.grep(dui.views[dui.activeView].filterList, function(value) {
                                    return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
                                });            

                                response(data);
                            },
                            select: function (event, ui){
                                // If really changed
                                var div = this.parent;
                                div.barsOptions.buttons[this.ctrlId][this.ctrlAttr] = ui.item.value;
                                dui.binds.bars.init (div.barsIntern.wid);
                                dui.binds.bars.editSave(div);
                            },
                            change: function (event, ui) {
                                // If really changed
                                var div = this.parent;
                                div.barsOptions.buttons[this.ctrlId][this.ctrlAttr] = $(this).prop('value');
                                dui.binds.bars.init (div.barsIntern.wid);
                                dui.binds.bars.editSave(div);
                            }
                        }).focus(function () {
                            $(this).autocomplete("search", "");
                        }).keyup (function () {
                            if (this.parent.timer) 
                                clearTimeout (this.parent.timer);
                                
                            this.parent.timer = _setTimeout (function(elem_) {
                                 // If really changed
                                var div = elem_.parent;
                                div.barsOptions.buttons[elem_.ctrlId][elem_.ctrlAttr] = $(elem_).prop('value');
                                dui.binds.bars.init (div.barsIntern.wid);
                                dui.binds.bars.editSave(div);
                                elem_.parent.timer=null;
                            }, 200, this);
                        });   
                    }
                }
                else
				if (div.barsIntern.wType == 'tplBarNavigator') {
                    var elem = document.getElementById ('inspect_option'+i);
                    if (elem) {
                        elem.parent   = div;
                        elem.ctrlAttr = 'option';
                        elem.ctrlId   = i;
                  
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
                            select: function (event, ui){
                                // If really changed
                                var div = this.parent;
                                div.barsOptions.buttons[this.ctrlId][this.ctrlAttr] = ui.item.value;
								if (!div.barsOptions.buttons[this.ctrlId]['text']) {
									var s = div.barsOptions.buttons[this.ctrlId][this.ctrlAttr];
									div.barsOptions.buttons[this.ctrlId]['text'] = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
									$("#inspect_text"+this.ctrlId).val(div.barsOptions.buttons[this.ctrlId]['text']).trigger("change");
								}
                                dui.binds.bars.init (div.barsIntern.wid);
                                dui.binds.bars.editSave(div);
                            },
                            change: function (event, ui) {
                                // If really changed
                                var div = this.parent;
                                div.barsOptions.buttons[this.ctrlId][this.ctrlAttr] = $(this).prop('value');
								if (!div.barsOptions.buttons[this.ctrlId]['text']) {
									var s = div.barsOptions.buttons[this.ctrlId][this.ctrlAttr];
									div.barsOptions.buttons[this.ctrlId]['text'] = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
									$("#inspect_text"+this.ctrlId).val(div.barsOptions.buttons[this.ctrlId]['text']).trigger("change");
								}
                                dui.binds.bars.init (div.barsIntern.wid);
                                dui.binds.bars.editSave(div);
                            }
                        }).focus(function () {
                            $(this).autocomplete("search", "");
                        }).keyup (function () {
                            if (this.parent.timer) 
                                clearTimeout (this.parent.timer);
                                
                            this.parent.timer = _setTimeout (function(elem_) {
                                 // If really changed
                                var div = elem_.parent;
                                div.barsOptions.buttons[elem_.ctrlId][elem_.ctrlAttr] = $(elem_).prop('value');
								if (!div.barsOptions.buttons[elem_.ctrlId]['text']) {
									var s = div.barsOptions.buttons[elem_.ctrlId][elem_.ctrlAttr];
									div.barsOptions.buttons[elem_.ctrlId]['text'] = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
									$("#inspect_text"+elem_.ctrlId).val(div.barsOptions.buttons[elem_.ctrlId]['text']).trigger("change");
								}
                                dui.binds.bars.init (div.barsIntern.wid);
                                dui.binds.bars.editSave(div);
                                elem_.parent.timer=null;
                            }, 200, this);
                        });   
                    }
                }
                else {
                    dui.binds.bars._editTextHandler ("option", div, i);
                }
                
                // Use delete button
                var btn = $('#barsDel'+i);
                if (btn) {
                    btn.button({icons: {primary: "ui-icon ui-icon-circle-close"}});
                    var htmlbtn4 = document.getElementById ('barsDel'+i);
                    if (htmlbtn4) {
                        htmlbtn4.parent = div;
                        htmlbtn4.ctrlId = i;
                    }
                    btn.click (function () {
                        var div = this.parent;
                        for (var i = this.ctrlId; i < div.barsOptions.buttons.length - 1; i++){
                            div.barsOptions.buttons[i] = div.barsOptions.buttons[i + 1];
                        }
                        div.barsOptions.buttons.length = div.barsOptions.buttons.length - 1;
                        dui.binds.bars.init (div.barsIntern.wid);
                        dui.binds.bars.edit (div.barsIntern.wid, div.barsIntern.editParent);
                        dui.binds.bars.editSave(div);
						dui.inspectWidget (div.barsIntern.wid);
                    });
                }
                btn = $('#barsUp'+i);
                if (btn) {
                    btn.button( {icons: {primary: "ui-icon-arrowthick-1-n"}});
                    var htmlbtn_ = document.getElementById ('barsUp'+i);
                    if (htmlbtn_) {
                        htmlbtn_.parent = div;
                        htmlbtn_.ctrlId = i;
                    }
                    btn.click (function () {
                        var div = this.parent;
                        var temp = div.barsOptions.buttons[i - 1];
                        div.barsOptions.buttons[i - 1] = div.barsOptions.buttons[i];
                        div.barsOptions.buttons[i] = temp;
                        dui.binds.bars.init (div.barsIntern.wid);
                        dui.binds.bars.edit (div.barsIntern.wid, div.barsIntern.editParent);
                        dui.binds.bars.editSave(div);
                    });                    
                }
                btn = $('#barsDown'+i);
                if (btn) {
                    btn.button({icons: {primary: "ui-icon-arrowthick-1-s"}});
                    var htmlbtn = document.getElementById ('barsDown'+i);
                    if (htmlbtn) {
                        htmlbtn.parent = div;
                        htmlbtn.ctrlId = i;
                    }
                    btn.click (function () {
                        var div = this.parent;
                        var temp = div.barsOptions.buttons[i + 1];
                        div.barsOptions.buttons[i + 1] = div.barsOptions.buttons[i];
                        div.barsOptions.buttons[i] = temp;
                        dui.binds.bars.init (div.barsIntern.wid);
                        dui.binds.bars.edit (div.barsIntern.wid, div.barsIntern.editParent);
                        dui.binds.bars.editSave(div);
                    });                    
                }            
            }
            return sText;
        },
        edit: function (wid, jParent) {
            var div  = document.getElementById (wid);
            if (div.barsOptions) {
                div.barsIntern.editParent = jParent;
                var sText = "<table id='barsEditElements' style='width:100%'>";
                sText += "<tr><td class='dashui-edit-td-caption'>"+dui.translate("Theme:")+"</td><td class='dashui-edit-td-field'><input type='text' id='inspect_bTheme' value='"+(div.barsOptions.bTheme || "") + "' size='44' /></td></tr>";

				if (div.barsIntern.wType == 'tplBarFilter') {
					sText += "<tr><td class='dashui-edit-td-caption'>"+ dui.translate("One at time:")+"</td><td class='dashui-edit-td-field'><input id='inspect_bOnlyOneSelected' type='checkbox' "+((div.barsOptions.bOnlyOneSelected ) ? "checked" : "")+"></td></tr>";
					sText += "<tr><td class='dashui-edit-td-caption'>"+ dui.translate("Initial filter:")+"</td><td class='dashui-edit-td-field'><input id='inspect_bValue' type='text' size='44' value='"+(div.barsOptions.bValue || "") + "'></td></tr>";
				}

				var iGeomCount = 0;
                sText += "<tr><td colspan=2><button id='idGeometry_BtnGroup' class='dashui-group-button-width'>"+dui.translate("Geometry...")+"</button></td></tr>";
                sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Bar type:")+"</td><td class='dashui-edit-td-field'><select id='inspect_position' style='width: "+dui.binds.bars.width+"px'>";
                sText += "<option value='0'>" +dui.translate("Horizontal")+"</option>";
                sText += "<option value='1'>" +dui.translate("Vertical")+"</option>";
                sText += "<option value='2'>" +dui.translate("Docked at top")+"</option>";
                sText += "<option value='3'>" +dui.translate("Docked at bottom")+"</option>";
                sText += "<option value='4'>" +dui.translate("Docked at left")+"</option>";
                sText += "<option value='5'>" +dui.translate("Docked at right")+"</option>";
                sText += "</select></td></tr>";           
				sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='dashui-edit-td-caption'></td><td class='dashui-edit-td-field'><input id='inspect_barShow' type='button' value='"+dui.translate("Show")+"'></td></tr>";
                
                sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Button width:")+"</td><td id='inspect_bWidth' class='dashui-edit-td-field dashui-no-spaces'></td></tr>";
                sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Button height:")+"</td><td id='inspect_bHeight' class='dashui-edit-td-field dashui-no-spaces'></td></tr>";
                sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Button space:")+"</td><td id='inspect_bSpace' class='dashui-edit-td-field dashui-no-spaces'></td></tr>";
                sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Border radius:")+"</td><td id='inspect_bRadius' class='dashui-edit-td-field dashui-no-spaces'></td></tr>";
                sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Text offset %:")+"</td><td id='inspect_bOffset' class='dashui-edit-td-field dashui-no-spaces'></td></tr>";

                sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Image align:")+"</td><td><select id='inspect_bImageAlign' style='width: "+dui.binds.bars.width+"px'>";
                sText += "<option value='center'>" +dui.translate("Center")+"</option>";
                sText += "<option value='left'>"   +dui.translate("Left")+"</option>";
                sText += "<option value='right'>"  +dui.translate("Right")+"</option>";
                sText += "</select></td></tr>";           

                sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Text align:")+"</td><td><select id='inspect_bTextAlign' style='width: "+dui.binds.bars.width+"px'>";
                sText += "<option value='center'>" +dui.translate("Center")+"</option>";
                sText += "<option value='left'>"   +dui.translate("Left")+"</option>";
                sText += "<option value='right'>"  +dui.translate("Right")+"</option>";
                sText += "</select></td></tr>";           

                // Styles
                var iStyleCount = 0;
                sText += "<tr><td colspan=2><button id='idStyle_BtnGroup' class='dashui-group-button-width'>"+dui.translate("Styles...")+"</button></td></tr>";
                sText += "<tr id='idStyle"+(iStyleCount++)+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Normal:")+"</td><td id='inspect_bStyleNormalParent' ></td></tr>";
                sText += "<tr id='idStyle"+(iStyleCount++)+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Normal hover:")+"</td><td id='inspect_bStyleNormalHoverParent' ></td></tr>";
                sText += "<tr id='idStyle"+(iStyleCount++)+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Active:")+"</td><td id='inspect_bStyleActiveParent'></td></tr>";
                sText += "<tr id='idStyle"+(iStyleCount++)+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Active hover:")+"</td><td id='inspect_bStyleActiveHoverParent' ></td></tr>";


                // Add effects for filters
                if (div.barsIntern.wType == 'tplBarFilter' ||
				    div.barsIntern.wType == 'tplBarNavigator') {
					var iEffectsCount = 0;
					dui.updateFilter();
					sText += "<tr><td colspan=2><button id='idEffect_BtnGroup' class='dashui-group-button-width'>"+dui.translate("Effects...")+"</button></td></tr>";
                    sText += "<tr id='idEffect"+(iEffectsCount++)+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Hide effect:")+"</td><td><select id='inspect_bHideEffect' style='width: "+(dui.binds.bars.width - 40)+"px'>";
					var sEffects = "";
                    sEffects += "<option value=''>Show/Hide</option>";
                    //sEffects += "<option value='show'>Show/Hide</option>";
                    sEffects += "<option value='blind'>Blind</option>";
                    sEffects += "<option value='bounce'>Bounce</option>";
                    sEffects += "<option value='clip'>Clip</option>";
                    sEffects += "<option value='drop'>Drop</option>";
                    sEffects += "<option value='explode'>Explode</option>";
                    sEffects += "<option value='fade'>Fade</option>";
                    sEffects += "<option value='fold'>Fold</option>";
                    sEffects += "<option value='highlight'>Highlight</option>";
                    sEffects += "<option value='puff'>Puff</option>";
                    sEffects += "<option value='pulsate'>Pulsate</option>";
                    sEffects += "<option value='scale'>Scale</option>";
                    sEffects += "<option value='shake'>Shake</option>";
                    sEffects += "<option value='size'>Size</option>";
                    sEffects += "<option value='slide'>Slide</option>";
                    //sEffects += "<option value='transfer'>Transfer</option>";
                    sText += sEffects + "</select><input id='inspect_bHideEffectMs' value='"+div.barsOptions.bShowEffectMs+"' style='width:40px'></td></tr>";  

                    sText += "<tr id='idEffect"+(iEffectsCount++)+"'><td class='dashui-edit-td-caption'>"+ dui.translate("Show effect:")+"</td><td><select id='inspect_bShowEffect' style='width: "+(dui.binds.bars.width - 40)+"px'>";
                    sText += sEffects + "</select><input id='inspect_bShowEffectMs' value='"+div.barsOptions.bShowEffectMs+"' style='width:40px'></td></tr>";     
                    
					sText += "<tr id='idEffect"+(iEffectsCount++)+"'><td class='dashui-edit-td-caption'></td><td><input id='inspect_test' type='button' value='"+dui.translate("Test")+"'></td></tr>";

                }

                
				sText += "<tr><td colspan=2><button id='idButtons_BtnGroup' class='dashui-group-button-width'>"+dui.translate("Buttons...")+"</button></td></tr>";

                for (var m = 0; m < div.barsOptions.buttons.length; m++) {
                    sText += dui.binds.bars.editButton (div, m);
                }   
                sText += "<tr id='idButtons"+(div.barsOptions.buttons.length*5)+"'><td class='dashui-edit-td-caption'><button id='barsAdd' >"+dui.translate("Add")+"</button></td></tr></table>";
                $('#barsEditElements').remove ();
                jParent.append (sText);
                			
                for (var n = 0; n < div.barsOptions.buttons.length; n++) {
                    sText += dui.binds.bars.editButton (div, n, true);
                }                   
                dui.binds.bars._editSelectHandler ('position', div, function (div, ctrlAttr, val) {
					if (val > 1) {
						$('#inspect_css_left').val("auto").trigger("change");
						$('#inspect_css_top').val("auto").trigger("change");
					}
					$('#inspect_barShow').button((div.barsOptions.position == dui.binds.bars.position.floatHorizontal || 
										          div.barsOptions.position == dui.binds.bars.position.floatVertical) ? "disable" : "enable");
				},
				function (div, ctrlAttr, val) {
					dui.inspectWidget (div.barsIntern.wid);
				});
                
                document.getElementById ('barsAdd').parent = div;
                $('#barsAdd').button({icons : {primary :'ui-icon-circle-plus'}}).click (function () {
                    var div = this.parent;
                    div.barsOptions.buttons[div.barsOptions.buttons.length] = {"image": "", "text": "Caption", "option": ""};
                    dui.binds.bars.init (div.barsIntern.wid);
                    dui.binds.bars.edit (div.barsIntern.wid, div.barsIntern.editParent);
                    dui.binds.bars.editSave(div);
					dui.inspectWidget (div.barsIntern.wid);
                });
                	
				// autocomplete for class key
				dui.binds.bars._editTextAutoCompleteHandler ('bTheme', div, function(request, response) {
					var classes = [];
					for (var i = 0; i < dui.binds.bars.themes.length; i++){
						classes[i] = dui.binds.bars.themes[i].css_class;
					}
				
					var data = $.grep(classes, function(value) {
						return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
					});            

					response(data);
				});

                // Style button
				dui.binds.bars._showGroupButton ('idStyle',    div);
				dui.binds.bars._showGroupButton ('idGeometry', div);
				dui.binds.bars._showGroupButton ('idEffect',   div);
				dui.binds.bars._showGroupButton ('idButtons',  div);

                dui.binds.bars._editSliderHandler ("bWidth",  div, 10, 300);
                dui.binds.bars._editSliderHandler ("bHeight", div, 10, 300);
                dui.binds.bars._editSliderHandler ("bSpace",  div, 0,  50);
                dui.binds.bars._editSliderHandler ("bRadius", div, 0,  150);
                dui.binds.bars._editSliderHandler ("bOffset", div, 0,  100);
                dui.binds.bars._editSelectHandler ("bTextAlign",  div, null, null);
                dui.binds.bars._editSelectHandler ("bImageAlign", div, null, null);
                dui.binds.bars._editCheckboxHandler ("bOnlyOneSelected", div);

                dui.binds.bars._editStyleHandler ('bStyleNormal',      div, null, '-button', 'background');
                dui.binds.bars._editStyleHandler ('bStyleNormalHover', div, null, '-button', 'background');
                dui.binds.bars._editStyleHandler ('bStyleActive',      div, null, '-button', 'background');
                dui.binds.bars._editStyleHandler ('bStyleActiveHover', div, null, '-button', 'background');

				// Create autocomplete for initial value
				if (div.barsIntern.wType == 'tplBarFilter') {
                    var elem = document.getElementById ('inspect_bValue');
                    if (elem) {
                        elem.parent   = div;
                        elem.ctrlAttr = 'bValue';
                  
                        $(elem).autocomplete({
                            minLength: 0,
                            source: function(request, response) {            
                                var data = $.grep(dui.views[dui.activeView].filterList, function(value) {
                                    return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
                                });            

                                response(data);
                            },
                            select: function (event, ui){
                                // If really changed
                                var div = this.parent;
                                div.barsOptions[this.ctrlAttr] = ui.item.value;
                                dui.binds.bars.editSave(div);
                            },
                            change: function (event, ui) {
                                // If really changed
                                var div = this.parent;
                                div.barsOptions[this.ctrlAttr] = ui.item.value;
                                dui.binds.bars.editSave(div);
                            }
                        }).focus(function () {
                            $(this).autocomplete("search", "");
                        }).keyup (function () {
                            if (this.parent.timer) 
                                clearTimeout (this.parent.timer);
                                
                            this.parent.timer = _setTimeout (function(elem_) {
                                 // If really changed
                                var div = elem_.parent;
                                div.barsOptions[elem_.ctrlAttr] = $(elem_).prop('value');
                                dui.binds.bars.editSave(div);
                                elem_.parent.timer=null;
                            }, 200, this);
                        });   
                    }
                }				
				
				
                if (div.barsIntern.wType == 'tplBarFilter' ||
				    div.barsIntern.wType == 'tplBarNavigator') {
                    dui.binds.bars._editSelectHandler ("bShowEffect", div, null, null);
                    dui.binds.bars._editSelectHandler ("bHideEffect", div, null, null);
                    dui.binds.bars._editTextHandler ("bShowEffectMs", div, -1);
                    dui.binds.bars._editTextHandler ("bHideEffectMs", div, -1);
					$('#inspect_test').button().click (function () {
						if (div.barsIntern.wType == 'tplBarFilter') {
							// Hide all
							dui.changeFilter ("$", div.barsOptions.bShowEffect, div.barsOptions.bShowEffectMs, div.barsOptions.bHideEffect, div.barsOptions.bHideEffectMs);
							
							// Show all
							setTimeout (function () {
								dui.changeFilter ("", div.barsOptions.bShowEffect, div.barsOptions.bShowEffectMs, div.barsOptions.bHideEffect, div.barsOptions.bHideEffectMs);
							}, 500 + parseInt (div.barsOptions.bShowEffectMs));
						}
						else 
						if (div.barsIntern.wType == 'tplBarNavigator'){
							var v = dui.activeView;
							// find other view
							for (var t in dui.views) {
								if (t != v)
									break;
							}
							
							dui.changeView (t, 
								{effect:div.barsOptions.bHideEffect, duration:div.barsOptions.bHideEffectMs}, 
								{effect:div.barsOptions.bShowEffect, duration:div.barsOptions.bShowEffectMs});

							// Show all
							setTimeout (function () {
								dui.changeView (v, 
									{effect:div.barsOptions.bHideEffect, duration:div.barsOptions.bHideEffectMs}, 
									{effect:div.barsOptions.bShowEffect, duration:div.barsOptions.bShowEffectMs});
								dui.inspectWidget (div.barsIntern.wid);
							}, 500 + parseInt (div.barsOptions.bShowEffectMs));
								
						}
					});
                }
                document.getElementById ('inspect_barShow').parent = div;
				$('#inspect_barShow').button().click (function () {
					if (this.parent.barsOptions.position != dui.binds.bars.position.floatHorizontal &&
						this.parent.barsOptions.position != dui.binds.bars.position.floatVertical) {
                        if ($().sidebar) {
                            $(this.parent).sidebar("open");
                        } else {
                            console.log("Sidebar is not included.");
                        }

					}
				}).button((div.barsOptions.position == dui.binds.bars.position.floatHorizontal || 
						   div.barsOptions.position == dui.binds.bars.position.floatVertical) ? "disable" : "enable");
				
            }
        },	
		editDelete: function (wid) {
			var div = document.getElementById (wid);
			if (div) {
				$('#jquerySideBar_'+div.barsIntern.wid).remove ();
				$('#'+div.barsIntern.wid).remove ();
				dui.binds.bars.created[div.barsIntern.wid] = undefined;
				var createdOld = dui.binds.bars.created;
				dui.binds.bars.created = [];
				for (var i = 0; i < createdOld.length; i++) {
					if (createdOld[i] != wid) {
						dui.binds.bars.created[dui.binds.bars.created.length] = createdOld[i];
					}
				}
			}
		},
		setState: function (div, newFilter) {
			var newFilters = (newFilter !== undefined && newFilter != null && newFilter != "") ? newFilter.split(',') : [];
			for (var i = 0; i < div.barsOptions.buttons.length; i++) {
				var htmlBtn = document.getElementById (div.barsIntern.wid+"_btn"+i);
				var isFound = false;
				for (var z = 0; z < newFilters.length; z++) {
					if (div.barsOptions.buttons[i].option == newFilters[z]) {
						isFound = true;
						break;
					}
				}
				if (isFound) {
					htmlBtn._state = 1;
					if (div.barsOptions.bStyleActive) {
						$(htmlBtn).addClass (div.barsOptions.bStyleActive);
						$(htmlBtn).removeClass (div.barsOptions.bStyleNormal);
					} else {
						$(htmlBtn).addClass ('ui-state-active');
					}
				}
				else {
					htmlBtn._state = 0;
					$(htmlBtn).removeClass ('ui-state-active');
					$(htmlBtn).removeClass (div.barsOptions.bStyleActive);
					if (div.barsOptions.bStyleNormal) {
						$(htmlBtn).addClass (div.barsOptions.bStyleNormal);
					}
				}
			}
		},
		filterChanged: function (view, newFilter) {
			for (var i = 0; i < dui.binds.bars.created.length; i++) {
				var div = document.getElementById (dui.binds.bars.created[i]);
				if (div && div.barsIntern && div.barsIntern.view == view && div.barsIntern.wType == 'tplBarFilter') {
					dui.binds.bars.setState (div, newFilter);
				}
			}
		},
		init: function(wid, options, view, wType) {
			var settings = {
				position:          0,
                bWidth:            100,  // Width of the button. 0 - every button has own width
                bHeight:           50,   // Height of the button. 0 - every button has own height
                bSpace:            5,    // Between buttons
                bRadius:           5,    // Button radius
                bOffset:           0,    // 0% Image, 70% Text
                bTextAlign:        'center',
                bImageAlign:       'right',
                bValue:            '',   // start value
                bShowEffect:       'show',
                bHideEffect:       'show',
                bShowEffectMs:     100,
                bHideEffectMs:     100,
				bStyleNormal:      null,
				bStyleNormalHover: null,
				bStyleActive:      null,
				bStyleActiveHover: null,
				buttons:           [],
				bOnlyOneSelected:  false, // If only one element can be selected
				bTheme:            "sidebar-dark"
			};			
							
			if (document.getElementById (wid) == null) {
				$('#duiview_' + view).append ('<div id="' + wid + '" class="dashui-widget"></div>');
			}
			var div = document.getElementById (wid);
			var barsIntern = null;
            var barsOptions = null;
			
			if (div.barsIntern) {
				barsIntern  = div.barsIntern;
				barsOptions = div.barsOptions;
			}
			
			if (document.getElementById ('jquerySideBar_'+wid)) {
				$('#jquerySideBar_'+div.barsIntern.wid).remove ();
				
                if (document.getElementById(wid) != null) {
                } else {
                    $('#duiview_' + barsIntern.view).append("<div id='" + wid + "'></div>");
				}
				div = document.getElementById (wid);
				div.barsOptions = barsOptions;
				div.barsIntern  = barsIntern;
			}				
			
			var jDiv = $(div);
            
            if (div.barsOptions === undefined)
                div.barsOptions = {};
                
			var isFound = false;
			for (var g = 0; g < dui.binds.bars.created.length; g++) {
				if (dui.binds.bars.created[g] == wid) {
					isFound = true;
					break;
				}
			}
			if (!isFound) {
				dui.binds.bars.created[dui.binds.bars.created.length] = wid;
			}		
				
            if (wType !== undefined) {
                if (options !== undefined) {
                    if (typeof options == "string") {
                        div.barsOptions = $.parseJSON(options);
                    } else {
                        div.barsOptions = options;
                    }
                }
                div.barsOptions = $.extend(settings, div.barsOptions, true);
                div.barsIntern = {
                    wid:   wid,
                    wType: wType,
                    view:  view,
                    editParent: null
				};
				if (dui.editMode) {
					if (div.barsOptions.buttons.length == 0) {
						if (div.barsIntern.wType == 'tplBarFilter') {
							var filter = dui.updateFilter();
							if (filter.length > 0) {
								div.barsOptions.buttons[0] = {'image': "", "text" : dui.translate("All"), "option": ""};
								for (var x = 0; x < filter.length; x++) {
									div.barsOptions.buttons[x + 1] = {'image': "", "text" : filter[x].charAt(0).toUpperCase() + filter[x].slice(1).toLowerCase(), "option": filter[x]};
								}
							}
							else
								div.barsOptions.buttons[0] = {'image': "", "text" : "Caption", "option": ""};
						}
						else
						if (div.barsIntern.wType == 'tplBarNavigator') {
							for (var s in dui.views) {
								div.barsOptions.buttons[div.barsOptions.buttons.length] = {'image': "", "text" : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(), "option": s};
							}
						}
						// Save default configuration
						dui.binds.bars.editSave(div);
					}
				}
            }
			
			this.draw(div, jDiv);

			// non edit mode
			if (!dui.editMode) {
                // Select by default buttons
                if (div.barsIntern.wType == 'tplBarFilter') {
                    if (div.barsOptions.bValue != "") {
                        var values = div.barsOptions.bValue.split(",");
                        for (var p = 0; p < div.barsOptions.buttons.length; p++) {
                            var isFound2 = false;
                            for(var j = 0; j < values.length; j++) {
                                if(values[j] === div.barsOptions.buttons[p].option) {
                                    isFound2 = true;
                                    break;
                                }
                            }
                            if (isFound2) {
								var htmlBtn2 = document.getElementById (div.barsIntern.wid+"_btn"+p);
								if (htmlBtn2) {
                                    htmlBtn2._state = 1;
									if (div.barsOptions.bStyleActive) {
										$(htmlBtn2).addClass (div.barsOptions.bStyleActive);
										$(htmlBtn2).removeClass (div.barsOptions.bStyleNormal);
									} else {
										$(htmlBtn2).addClass ('ui-state-active');
									}
								}
                            }
                        }
						// Set active filter
						dui.changeFilter (div.barsOptions.bValue, div.barsOptions.bShowEffect, div.barsOptions.bShowEffectMs, div.barsOptions.bHideEffect, div.barsOptions.bHideEffectMs);
						
                    }
                }
				else
				if (div.barsIntern.wType == 'tplBarNavigator') {
					var v = null;//dui.activeView;
					if (!v) v =  div.barsIntern.view;
				    for (var u = 0; u < div.barsOptions.buttons.length; u++) {
						if(v === div.barsOptions.buttons[u].option) {
							var htmlBtn = document.getElementById (div.barsIntern.wid+"_btn"+u);
							if (htmlBtn) {
								htmlBtn._state = 1;
								if (div.barsOptions.bStyleActive) {
									$(htmlBtn).addClass (div.barsOptions.bStyleActive);
								} else {
									$(htmlBtn).addClass ('ui-state-active');
								}
							}
							break;
						}
					}
				}

                // Install on click function 
                if (div._onClick === undefined) {
                    div._onClick = function (htmlBtn, div, r) {
						if (div.barsIntern.wType == 'tplBarNavigator') {
							dui.changeView (div.barsOptions.buttons[r].option,
								{effect:div.barsOptions.bHideEffect, duration:div.barsOptions.bHideEffectMs}, 
								{effect:div.barsOptions.bShowEffect, duration:div.barsOptions.bShowEffectMs});
						}
						else
						{
							// Save actual state
							var actState = (htmlBtn._state === 1) ? 1 : 0;
							
                            if (!div.barsOptions.bOnlyOneSelected) {
                            } else {
                                for (var f = 0; f < div.barsOptions.buttons.length; f++) {
                                    var btn3 = document.getElementById(div.barsIntern.wid + "_btn" + f);
                                    btn3._state = 0;
                                    $(btn3).removeClass('ui-state-active');
                                    $(btn3).removeClass(div.barsOptions.bStyleActive);
									
									if (div.barsOptions.bStyleNormal) {
										$(btn3).addClass (div.barsOptions.bStyleNormal);
									}
								}
								// Restore state
								htmlBtn._state = actState;
							}						
						
							if (htmlBtn._state === 1) {
								htmlBtn._state = 0;
                                $(htmlBtn).removeClass('ui-state-active');
								$(htmlBtn).removeClass(div.barsOptions.bStyleActive);
								
								if (div.barsOptions.bStyleNormal) {
									$(htmlBtn).addClass (div.barsOptions.bStyleNormal);
								}
							}
							else {
								htmlBtn._state = 1;
								$(htmlBtn).removeClass(div.barsOptions.bStyleNormal);
								if (div.barsOptions.bStyleActive) {
									$(htmlBtn).addClass (div.barsOptions.bStyleActive);
								} else {
									$(htmlBtn).addClass ('ui-state-active');
								}
							}
							// install filters handler
							if (div.barsIntern.wType == 'tplBarFilter') {
								var filter = "";
								for (var w = 0; w < div.barsOptions.buttons.length; w++) {
									if (document.getElementById (div.barsIntern.wid+"_btn"+w)._state === 1) {
										if (div.barsOptions.buttons[w].option != "") {
											filter += (filter == "" ? "" : ",") + div.barsOptions.buttons[w].option;
										}
										// If disable all filters
										else {
											filter = "";
											for (var q = 0; q < div.barsOptions.buttons.length; q++) {
												var btn = document.getElementById (div.barsIntern.wid+"_btn"+q);
												btn._state = 0;
												$(btn).removeClass('ui-state-active');
												$(btn).removeClass(div.barsOptions.bStyleActive);
												
												if (div.barsOptions.bStyleNormal) {
													$(btn).addClass(div.barsOptions.bStyleNormal);
												}											
											}
											break;
										}
									}
								}
								
								dui.changeFilter (filter, div.barsOptions.bShowEffect, div.barsOptions.bShowEffectMs, div.barsOptions.bHideEffect, div.barsOptions.bHideEffectMs);
							}
						}
					};
                }
			}
            else {
				jDiv.attr('data-dashui-resizable', '{"disabled":true}');
                div.dashuiCustomEdit = {'baroptions': dui.binds.bars.edit, 'delete': dui.binds.bars.editDelete};
                // Install on click function
                if (div._onClick === undefined) {
                    console.log('bar');
                    div._onClick = function (htmlBtn, div, r) {
                        dui.inspectWidget(div.barsIntern.wid);
                    };
                }
            }
		}
	};
//});
