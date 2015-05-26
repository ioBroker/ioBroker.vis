/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2013-2015 bluefox https://github.com/GermanBluefox, hobbyquaker https://github.com/hobbyquaker
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

/* jshint browser:true */
/* global _ */
/* global $ */
/* global systemDictionary */
/* global vis:true */
/* jshint -W097 */// jshint strict:false
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
    show: function (options) {
        // Fill the list of styles
        if (this._internalList == null) {
            this._internalList = {};
            var sSheetList = document.styleSheets;
            for (var sSheet = 0; sSheet < sSheetList.length; sSheet++) {
                var ruleList = document.styleSheets[sSheet].cssRules;
                if (ruleList) {
                    var bglen = "hq-background-".length;
                    for (var rule = 0; rule < ruleList.length; rule ++) {
                        if (!ruleList[rule].selectorText) continue;

                        var styles = ruleList[rule].selectorText.split(' ');
                        var style = styles[styles.length - 1].replace('::before', '').replace('::after', '');

                        if (!style || style[0] != '.' || style.indexOf(':') != -1) continue;

                        var name = style;
                        name = name.replace(',', '');
                        name = name.replace(/^\./, '');

                        var val  = name;
                        name = name.replace(/^hq-background-/, '');
                        name = name.replace(/^hq-/, '');
                        name = name.replace(/^ui-/, '');
                        name = name.replace(/[-_]/g, ' ');

                        if (name.length > 0) {
                            name = name[0].toUpperCase() + name.substring(1);
                            var fff = document.styleSheets[sSheet].href;

                            if (fff && fff.indexOf('/') != -1) {
                                fff = fff.substring(fff.lastIndexOf('/') + 1);
                            }

                            if (!this._internalList[val]) {
                                if (styles.length > 1) {
                                    this._internalList[val] = {name: name, file: fff, attrs: ruleList[rule].style, parentClass: styles[0].replace('.', '')};
                                } else {
                                    this._internalList[val] = {name: name, file: fff, attrs: ruleList[rule].style};
                                }
                            }
                        }
                    }
                }
            }
        }


        options.filterName  = options.filterName  || '';
        options.filterAttrs = options.filterAttrs || '';
        options.filterFile  = options.filterFile  || '';

        var styles = {};

        if (options.styles) {
            styles = $.extend(styles, options.styles);
        } else {
            // IF filter defined
            if (options.filterFile || options.filterName) {
                var filters = (options.filterName)  ? options.filterName.split(' ')  : null;
                var attrs   = (options.filterAttrs) ? options.filterAttrs.split(' ') : null;

                for (var style in this._internalList) {
                    if (!options.filterFile ||
                       (this._internalList[style].file && this._internalList[style].file.indexOf(options.filterFile) != -1)) {
                        var isFound = !filters;
                        if (!isFound) {
                            for (var k = 0; k < filters.length; k++) {
                                if (style.indexOf(filters[k]) != -1) {
                                    isFound = true;
                                    break;
                                }
                            }
                        }
                        if (isFound) {
                            isFound = !attrs;
                            if (!isFound) {
                                for (var k = 0; k < attrs.length; k++) {
                                    var t = this._internalList[style].attrs[attrs[k]];
                                    if (t || t === 0) {
                                        isFound = true;
                                        break;
                                    }
                                }
                            }
                        }

                        if (isFound) {
                            var n = this._internalList[style].name;
                            if (options.removeName) {
                                n = n.replace(options.removeName, '');
                                n = n[0].toUpperCase() + n.substring(1).toLowerCase();
                            }
                            styles[style] = {
                                name:        n,
                                file:        this._internalList[style].file,
                                parentClass: this._internalList[style].parentClass
                            };
                        }
                    }
                }
            } else {
                styles = $.extend(styles, this._internalList);
            }
        }

        if (!$('#' + options.name + '_styles').length) {
            var text = '<select id="' + options.name + '_styles"><option value="">' + _('nothing') + '</option>';
            for (var style in styles) {
                text += '<option ' + ((options.style == style) ? 'selected' : '') + ' value="' + style + '" data-parent-style="' +  styles[style].parentClass + '">' + styles[style].name + '</option>\n';
            }
            text += '</select>';
        }

        if (!$.fn.iconselectmenu) {
            $.widget("custom.iconselectmenu", $.ui.selectmenu, {
                _renderItem: function (ul, item) {
                    var li = $( "<li>", {text: item.label});
                    var styles = ul.data('styles');

                    if (item.disabled) {
                        li.addClass( "ui-state-disabled" );
                    }

                    $("<span>", {
                        style:  "padding: 0px; margin; 0px; z-index: auto; display: inline-block; margin-right: 10px; position: relative; width: 50px; height: 20px",
                        "class": 'ui-corner-all ' + item.value
                    }).prependTo(li);

                    li.css('font-size', '16px');
                    if (styles[item.value] && styles[item.value].parentClass) li.addClass(styles[item.value].parentClass);

                    return li.appendTo( ul );
                }
            });
        }

        $('#' + options.name).hide().after(text);

        var $div = $('#' + options.name + '_styles').iconselectmenu({
            width: '100%',
            style: 'dropdown',
            change: function (event, ui) {
                 if (options.onchange) options.onchange(ui.item.value);

                var $text = $('#' + options.name + '_styles-button').find('.ui-selectmenu-text');
                $("<span>", {
                    style:  "padding: 0px; margin; 0px; z-index: auto; display: inline-block; margin-right: 10px; position: relative; width: 50px; height: 20px",
                    "class": 'ui-corner-all vis-current-style ' + ui.item.value
                }).prependTo($text);

                $text.css('font-size', '16px');

                if (styles[ui.item.value] && styles[ui.item.value].parentClass) {
                    $text.parent().addClass(styles[ui.item.value].parentClass);
                }            }
        }).iconselectmenu("menuWidget").data('styles', styles);

        $('#' + options.name + '_styles-menu').addClass('custom-vis-menu');

        if ($('#' + options.name + '_styles-button .vis-current-style').length) {
            $('#' + options.name + '_styles-button .vis-current-style').remove();
            $('#' + options.name + '_styles').val(options.style);
            $('#' + options.name + '_styles').iconselectmenu('refresh');
        }

        var $text = $('#' + options.name + '_styles-button').find('.ui-selectmenu-text');
        $("<span>", {
            style:  "padding: 0px; margin; 0px; z-index: auto; display: inline-block; margin-right: 10px; position: relative; width: 50px; height: 20px",
            "class": 'ui-corner-all vis-current-style ' + options.style
        }).prependTo($text);

        $text.css('font-size', '16px');

        if (styles[options.style] && styles[options.style].parentClass) {
            $text.parent().addClass(styles[options.style].parentClass);
        }
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
    _select: function (obj, iStyle, iParentStyle) {
        var nameImg  = "styleSelectImg"  + obj.settings.id;
        var nameText = "styleSelectText" + obj.settings.id;
        $('#' + nameImg).removeClass(obj.settings.style);
        if (obj.settings.parentClass) {
            $('#' + nameImg).parent().removeClass(obj.settings.parentClass);
        }

        obj.settings.style = iStyle;
        obj.settings.parentClass = iParentStyle;

        $('#' + nameImg).addClass(obj.settings.style);
        if (iParentStyle) {
            $('#' + nameImg).parent().addClass(iParentStyle);
        }
        $('#' + nameText).html(this._findTitle(obj.settings.styles, obj.settings.style));

        if (obj.settings.onchange) {
            obj.settings.onchange (obj.settings.style, obj.settings.onchangeParam);
        }
    },
    destroy: function (htmlElem) {
        $("#styleSelectBox" + htmlElem.settings.id).remove();
        $('#styleSelect' +    htmlElem.settings.id).remove();
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
        $('div[aria-describedby="colorSelect"]').css({'z-index': htmlElem.settings.zindex});
        if (htmlElem.settings.current || htmlElem.settings.current === 0) {
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