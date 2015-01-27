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

// visEdit - the ioBroker.vis Editor extensions

'use strict';

// Add words for bars
$.extend(systemDictionary, {
	"Select"              : {"en" : "Select",       "de": "Auswählen",            "ru": "Выбрать"},
	"Cancel"              : {"en" : "Cancel",       "de": "Abbrechen",            "ru": "Отмена"},
	"None"                : {"en": "None",          "de": "Vorgegeben",           "ru": "---"},
	"Default"             : {"en": "Default",       "de": "Vorgegeben",           "ru": "По умолчанию"},
	"Name"                : {"en" : "Name",         "de": "Name",                 "ru": "Имя"},
	"Location"            : {"en" : "Location",     "de": "Raum",                 "ru": "Комната"},
	"Interface"           : {"en" : "Interface",    "de": "Schnittstelle",        "ru": "Интерфейс"},
	"Type"                : {"en" : "Type",         "de": "Typ",                  "ru": "Тип"},
	"Address"             : {"en" : "Address",      "de": "Adresse",              "ru": "Адрес"},
	"Function"            : {"en" : "Function",     "de": "Gewerk",               "ru": "Функционал"},
	"Disable device filter:" : {
        "en" : "Disable device filter:",
        "de": "Schalte Ger&auml;tefilter aus:",
        "ru": "Убрать фильтр по устройствам:"
    },
	"Rooms"            : {"en" : "Rooms",        "de": "R&auml;ume",           "ru": "Комнаты"},
	"Functions"        : {"en" : "Functions",    "de": "Gewerke",              "ru": "Функции"},
	"Selected image: " : {"en" : "Selected file: ","de": "Ausgewählte Datei: ","ru": "Выбраный файл: "},
	"Programs"         : {"en" : "Programs",      "de": "Programme",           "ru": "Программы"},
	"Variables"        : {"en" : "Variables",     "de": "Variablen",           "ru": "Переменные"},
	"Devices"          : {"en" : "Devices",       "de": "Geräte",              "ru": "Устройства"}
});

vis.styleSelect = {
        // local variables
        _currentElement: 0,
        _scrollWidth:    -1,
        _internalList:   null,
        // Default settings
        settings: {
            // List of styles
            styles:        null,
            width:         100,
            style:         "",     // Init style as text
            onchange:      null,   // onchange fuction: handler (newStyle, onchangeParam);
            onchangeParam: null,   // user parameter for onchange function
            parent:        null,
            height:        30,
            dropOpened:    false,
            name:          null,
            id:            -1,
            filterFile:    null,
            filterName:    null,
            filterAttrs:   null
        },
        _findTitle: function (styles, style) {
            for (var st in styles) {
                if (styles[st] == style) {
                    return ((st == "") ? style : st);
                }
            }
            return style;
        },
        
        // Functions
        Show: function (options) {
            // Fill the list of styles
            if (this._internalList == null) {
                this._internalList = {};
                var sSheetList = document.styleSheets;
                for (var sSheet = 0; sSheet < sSheetList.length; sSheet++) {
                    var ruleList = document.styleSheets[sSheet].cssRules;
                    if (ruleList !== undefined && ruleList != null) {
                        var bglen = "hq-background-".length;
                        for (var rule = 0; rule < ruleList.length; rule ++) {
                            if (ruleList[rule].selectorText === undefined || ruleList[rule].selectorText == null || ruleList[rule].selectorText == "")
                                continue;
                                
                            var styles = ruleList[rule].selectorText.split(' ');
                            for (var i = 0; i < styles.length; i++) {
                                if (styles[i] == "" || styles[i][0] != '.' || styles[i].indexOf(':') != -1)
                                    break;
                                    
                                var name = styles[i];
                                name = name.replace(",", "");
                                if (name.length > 0 && (name[0] == '.' || name[0] == '#'))
                                    name = name.substring(1);                       
                                var val  = name;
                                if (name.length >= bglen && name.substring(0, bglen) == "hq-background-")
                                    name = name.substring(bglen);
                                    
                                if (name.substring(0, "hq-".length) == "hq-")
                                    name = name.substring(3);
                                    
                                if (name.substring(0, "ui-".length) == "ui-")
                                    name = name.substring(3);
                                    
                                name = name.replace(/-/g, " ");
                                if (name.length > 0) {
                                    name = name[0].toUpperCase() + name.substring(1);
                                    var fff = document.styleSheets[sSheet].href;
                                    if (fff != null && fff != "" && fff.indexOf('/') != -1)
                                        fff = fff.substring(fff.lastIndexOf('/')+1);
                                    this._internalList[name] = {style: val, file: fff, attrs: ruleList[rule].style};
                                }
                                break;
                            }
	                    }
                    }
                }        
            }

            // Detect scrollbar width
            if (this._scrollWidth == -1) {
                // Create the measurement node
                var scrollDiv = document.createElement("div");
                scrollDiv.style.width = 100;
                scrollDiv.style.height = 100;
                scrollDiv.style.overflow = "scroll";
                scrollDiv.style.position = "absolute";
                scrollDiv.style.top = "-9999px";
                document.body.appendChild(scrollDiv);

                // Get the scrollbar width
                this._scrollWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
                
                // Delete the DIV 
                document.body.removeChild(scrollDiv);
            }
            if (options.name === undefined || options.name == "") {
                options.name = ""+ this._currentElement;
            }
            
            var nameImg  = "styleSelectImg" +options.name;
            var nameText = "styleSelectText"+options.name;
            var nameBtn  = "styleSelectB"   +options.name;
            var nameElem = "styleSelect"    +options.name;
            if (document.getElementById(nameElem) != undefined) {
                $('#'+nameElem).remove();
                $('#styleSelectBox'+options.name).remove();
            }
            var text = "<table id='"+nameElem+"'><tr><td>";
                text += "<table><tr><td><div id='"+nameImg+"'></div></td><td width=10></td><td style='text-align: left; vertical-align: middle;'><div  style='text-align: left; vertical-align: middle;' id='"+nameText+"'></div>";
                text += "</td></tr></table></td><td>";
                text += "<button id='"+nameBtn+"' />";
                text += "</td></tr></table>";
                
            var parent = (options.parent == null) ? $("body") : options.parent;
            parent.append(text);
            var htmlElem = document.getElementById(nameElem);
            htmlElem.settings = {};
            htmlElem.settings = $.extend(htmlElem.settings, this.settings);
            htmlElem.settings = $.extend(htmlElem.settings, options);
            htmlElem.settings.parent = parent;
            htmlElem.settings.id = options.name;
            htmlElem.settings.styles = {};
            htmlElem.settings.styles[_("Default")] = {style: null, file: null};
            
            if (options.styles) {
                htmlElem.settings.styles = $.extend(htmlElem.settings.styles, options.styles);
            } else {
                // IF filter defined
                if (htmlElem.settings.filterFile != null || htmlElem.settings.filterName != null) {
                    var filters = null;
                    if (htmlElem.settings.filterName != null && htmlElem.settings.filterName != "")
                        filters = htmlElem.settings.filterName.split(' ');
                        
                    var attrs = null;
                    if (htmlElem.settings.filterAttrs != null && htmlElem.settings.filterAttrs != "")
                        attrs = htmlElem.settings.filterAttrs.split(' ');
                
                    for (var name in this._internalList) {
                        if (htmlElem.settings.filterFile == null || 
                           (this._internalList[name].file != null && this._internalList[name].file.indexOf(htmlElem.settings.filterFile) != -1)) {
                            var isFound = (filters == null);
                            if (!isFound) {
                                for (var k = 0; k < filters.length; k++) {
                                    if (this._internalList[name].style.indexOf(filters[k]) != -1) {
                                        isFound = true;
                                        break;
                                    }
                                }
                            }
                            if (isFound) {
                                isFound = (attrs == null);
                                if (!isFound) {
                                    for (var k = 0; k < attrs.length; k++) {
                                        var t = this._internalList[name].attrs[attrs[k]];
                                        if (t !== undefined && t != null && t != "") {
                                            isFound = true;
                                            break;
                                        }
                                    }
                                }
                            }                            
                            if (isFound) {
                                htmlElem.settings.styles[name] = {style: this._internalList[name].style, file: this._internalList[name].file};
                            }
                        }
                    }
                } else {
                    htmlElem.settings.styles = $.extend(htmlElem.settings.styles, this._internalList);
                }
            }
            
            $('#' + nameImg).css({width: htmlElem.settings.height * 2, height: htmlElem.settings.height - 4}).addClass('ui-corner-all');
            $('#' + nameText).css({width: htmlElem.settings.width});
            $('#' + nameBtn).button({icons: {primary: "ui-icon-circle-triangle-s"}, text: false});
            $('#' + nameBtn).click(htmlElem, function (e) {
                vis.styleSelect._toggleDrop(e.data);
            });
            $('#' + nameBtn).height(htmlElem.settings.height).width(htmlElem.settings.height);
            var elem = $('#styleSelect' + options.name);
            elem.addClass('ui-corner-all ui-widget-content');
            if (htmlElem.settings.style != "") {
                $('#' + nameImg).addClass(htmlElem.settings.style);
                $('#' + nameText).html(this._findTitle(htmlElem.settings.styles, htmlElem.settings.style));
            } else {
                $('#' + nameText).html(_('None'));
            }
            
            // Build dropdown box
            if (document.getElementById('styleSelectBox' + options.name) == undefined) {
                var text = '<form id="styleSelectBox' + options.name + '" style="z-index:4">';
                var i = 0;
                for (var st in htmlElem.settings.styles) {
                    text += '<input type="radio" id="styleSelectBox' + options.name + i + '" name="radio"/><label for="styleSelectBox' + options.name + i +'">';
                    text += '<table><tr><td width="' + (htmlElem.settings.height * 2 + 4)+'px">' +
                        '<div class="ui-corner-all ' + htmlElem.settings.styles[st].style + '" style="padding: 0px; margin; 0px; z-index: auto; display: block; position: relative; width:' + (htmlElem.settings.height * 2) + 'px; height:' + (htmlElem.settings.height - 4) + 'px">' +
                        '</div></td><td width="10"></td>';
					text += '<td style="text-align: left; vertical-align: middle;"><div style="text-align: left; vertical-align: middle">';
                    text += ((st != '') ? st : htmlElem.settings.styles[st].style) + '</div></td></tr></table>';
                    text += '</label><br>';
                    i++;
                }
                text += "</form>";            
                htmlElem.settings.parent.append(text);
            }
            
            var box = $('#styleSelectBox'+options.name);
            box.buttonset();
            $('#styleSelectBox'+options.name+" :radio").click(htmlElem, function (e) {
                var rawElement = this;
                vis.styleSelect._select (e.data, rawElement.iStyle);
                vis.styleSelect._toggleDrop(e.data);
            });
            i = 0;
            // Set context
            for (var st in htmlElem.settings.styles) {
                document.getElementById("styleSelectBox"+options.name+""+i).iStyle = htmlElem.settings.styles[st].style;
                // Select current button
                if (htmlElem.settings.style == htmlElem.settings.styles[st].style) {
                    $("#styleSelectBox"+options.name+""+i).attr("checked","checked");
                    box.buttonset('refresh');
                }
                i++;
            }
            htmlElem.settings.count = i;
            box.css({width: $('#styleSelect'+options.name).width(), overflow: "auto"}).addClass('ui-corner-all ui-widget-content');
            box.css({position: 'absolute', top: elem.position().top + elem.height(), left: elem.position().left});
            box.hide ();
            this._currentElement++;
            return htmlElem;
        },
        _toggleDrop: function (obj) {
            if (obj.settings.dropOpened) {
                $("#styleSelectBox" + obj.settings.id).css({display: "none"});
                $("#styleSelectB" + obj.settings.id).button("option", {icons: { primary: "ui-icon-circle-triangle-s" }});
                obj.settings.dropOpened = false;
            } else {
                var elem = $('#styleSelect'+obj.settings.id);		
                var elemBox = $("#styleSelectBox"+obj.settings.id);		
                //if ($(window).height() < elemBox.height() + elemBox.position().top) {
                // Get position of last element
                var iHeight = 150;/*obj.settings.count * (obj.settings.height + 18);
                var wHeight = $(window).height() - $(window).scrollTop();
                if (iHeight > wHeight - elem.offset().top - elem.height() - 5) {
                    iHeight = wHeight - elem.offset().top - elem.height() - 5;
                } else {
                    iHeight += 5;
                }

                if (iHeight > obj.settings.height * 4) {
                    iHeight = obj.settings.height * 4;
                }*/
                elemBox.height(iHeight + 5);
                    
                var iWidth = $("#styleSelect"+obj.settings.id).width();
                elemBox.buttonset().find('table').width(iWidth - 37 - this._scrollWidth);
                $("#styleSelectBox"+obj.settings.id).css({display: "", width: elem.width(), top: elem.position().top + elem.height(), left: elem.position().left});			
                $("#styleSelectB"+obj.settings.id).button("option", {icons: { primary: "ui-icon-circle-triangle-n" }});
                obj.settings.dropOpened = true;
            }
             
        },
        _select: function (obj, iStyle) {
            var nameImg  = "styleSelectImg" +obj.settings.id;
            var nameText = "styleSelectText"+obj.settings.id;
            $('#'+nameImg).removeClass(obj.settings.style);
            obj.settings.style = iStyle;
            $('#'+nameImg).addClass(obj.settings.style);
            $('#'+nameText).html(this._findTitle(obj.settings.styles, obj.settings.style));
            if (obj.settings.onchange) {
                obj.settings.onchange (obj.settings.style, obj.settings.onchangeParam);
            }
        },
        destroy: function (htmlElem) {
            $("#styleSelectBox"+htmlElem.settings.id).remove();			
            $('#styleSelect'+htmlElem.settings.id).remove();			
        }
    };

// Color selection Dialog
var colorSelect = {
    // possible settings
    settings: {
        onselect:    null,
        onselectArg: null,
        result:      "",
        current:     null,   // current value
        parent:      $('body'), 
        elemName:    "idialog_",
        zindex:      5050
    },
    _selectText: "",
    _cancelText: "",    
    _titleText:  "",
    
    show:  function (options) {
        var i = 0;
        
        if (this._selectText == "") {
            this._selectText = _("Select");
            this._cancelText = _("Cancel");
            this._titleText  = _("Select color");
        }
           
        if (!options.elemName || options.elemName == "") {
            options.elemName = "idialog_";
        }
        if (!options.parent) {
            options.parent = $('body');
        }
        
        if (document.getElementById(options.elemName) != undefined) {
            $('#'+options.elemName).remove();
        }
        options.parent.append("<div class='dialog' id='colorSelect' title='" + this._titleText + "' style='text-align: center;' ><div style='display: inline-block;' id='colorpicker'></div><input type='text' id='colortext'/></div>");
        var htmlElem = document.getElementById("colorSelect");
        htmlElem.settings = {};
        htmlElem.settings = $.extend(htmlElem.settings, this.settings);
        htmlElem.settings = $.extend(htmlElem.settings, options);
        $(htmlElem).css({'z-index': htmlElem.settings.zindex});
        
         // Define dialog buttons
        var dialog_buttons = {}; 
        dialog_buttons[this._selectText] = function () { 
            $(this).dialog( "close" ); 
            if (this.settings.onselect)
                this.settings.onselect ($('#colortext').val(), this.settings.onselectArg);
            $(this).remove();
        };
        dialog_buttons[this._cancelText] = function () {
            $(this).dialog( "close" ); 
            $(this).remove();
        };
        $('#colorSelect').dialog({
            resizable: false,
            height:    380,
            width:     320,
            modal:     true,
            buttons:   dialog_buttons
        });     
        if (htmlElem.settings.current != null && htmlElem.settings.current != "") {
            $('#colortext').val(htmlElem.settings.current);
        } else {
            $('#colortext').val('#FFFFFF');
        }
        if ($().farbtastic) {
            $('#colorpicker').farbtastic('#colortext');
        }
    },
    GetColor: function () {
        return $('#colortext').val();
    }
};

// Create multiselect if no default widget loaded
if (!$().multiselect) {
    (function ($, undefined) {
        $.widget("dash.multiselect", {
            // default options
            options: {
                multiple: true
            },
            // the constructor
            _create: function () {
                if (!this.options.multiple) {
                    return;
                }
                var elem = this.element.hide();
                var div = '<table class="ui-widget-content">';
                div += '</table>'
                this.table = $(div);
                this.table.insertAfter(elem);
                this._build();
            },

            _build: function () {
                this.table.empty();
                var div = "";
                this.element.find("option").each(function () {
                    div += '<tr class="ui-widget-content"><td><input type="checkbox" '+($(this).is(':selected') ? 'checked' : '')+' data-value="'+$(this).attr('value')+'">'+$(this).html()+'</td>';
                    console.log($(this).attr('value'));
                });
                this.table.html(div);
                var that = this;
                this.table.find('input').each(function () {
                    this._parent = that;
                    $(this).click(function () {
                        var val = $(this).attr('data-value');
                        var checked =  $(this).is(':checked');
                        // change state on the original option tags
                        this._parent.element.find("option").each(function () {
                            if(this.value === val) {
                                $(this).prop('selected', checked);
                            }
                        });

                        this._parent.element.trigger("change");
                    });
                });
            },
            _init: function () {
                if (!this.options.multiple) {
                    return;
                }
                this._build();
            },
            refresh: function () {
                if (!this.options.multiple) {
                    return;
                }
                this._build();
            },

            // events bound via _on are removed automatically
            // revert other modifications here
            _destroy: function () {
                if (!this.options.multiple) {
                    return;
                }
                this.table.remove();
                this.element.show();

                $.Widget.prototype.destroy.call(this);
            },

            _update: function () {
                if (!this.options.multiple) {
                    return;
                }
                this.refresh(false);
            }
        });
    })(jQuery);
}