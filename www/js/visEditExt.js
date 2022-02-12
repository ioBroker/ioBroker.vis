/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2013-2022 bluefox https://github.com/GermanBluefox,
 *  Copyright (c) 2013-2014 hobbyquaker https://github.com/hobbyquaker
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
/* global jQuery */
/* global console */
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
        "en": "Disable device filter:",
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
    _internalList:   null,
    // Functions
    collectClasses: function () {
        var result = [];
        var sSheetList = document.styleSheets;
        for (var sSheet = 0; sSheet < sSheetList.length; sSheet++) {
            if (!document.styleSheets[sSheet]) continue;
            try {
                var ruleList = document.styleSheets[sSheet].cssRules;
                if (ruleList) {
                    for (var rule = 0; rule < ruleList.length; rule ++) {
                        if (!ruleList[rule].selectorText) continue;
                        var _styles = ruleList[rule].selectorText.split(',');
                        for (var s = 0; s < _styles.length; s++) {
                            var substyles = _styles[s].trim().split(' ');
                            var _style = substyles[substyles.length - 1].replace('::before', '').replace('::after', '').replace(':before', '').replace(':after', '');

                            if (!_style || _style[0] !== '.' || _style.indexOf(':') !== -1) continue;

                            var name = _style;
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

                                if (fff && fff.indexOf('/') !== -1) {
                                    fff = fff.substring(fff.lastIndexOf('/') + 1);
                                }

                                if (!result[val]) {
                                    if (substyles.length > 1) {
                                        result[val] = {name: name, file: fff, attrs: ruleList[rule].style, parentClass: substyles[0].replace('.', '')};
                                    } else {
                                        result[val] = {name: name, file: fff, attrs: ruleList[rule].style};
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
        return result;
    },
    show: function (options) {
        // Fill the list of styles
        if (!this._internalList) this._internalList = vis.styleSelect.collectClasses();

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
                var files   = (options.filterFile)  ? options.filterFile.split(' ')  : [''];

                for (var style in this._internalList) {
                    if (!this._internalList.hasOwnProperty(style)) continue;
                    for (var f = 0; f < files.length; f++) {
                        if (!options.filterFile ||
                            (this._internalList[style].file && this._internalList[style].file.indexOf(files[f]) !== -1)) {
                            var isFound = !filters;
                            if (!isFound) {
                                for (var k = 0; k < filters.length; k++) {
                                    if (style.indexOf(filters[k]) !== -1) {
                                        isFound = true;
                                        break;
                                    }
                                }
                            }
                            if (isFound) {
                                isFound = !attrs;
                                if (!isFound) {
                                    for (var u = 0; u < attrs.length; u++) {
                                        var t = this._internalList[style].attrs[attrs[u]];
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
                }
            } else {
                styles = $.extend(styles, this._internalList);
            }
        }

        var text = '';
        //noinspection JSJQueryEfficiency
        if (!$('#' + options.name + '_styles').length) {
            text = '<select id="' + options.name + '_styles"><option value="">' + _('nothing') + '</option>';
            for (var style_ in styles) {
                if (styles.hasOwnProperty(style_)) {
                    text += '<option ' + ((options.style === style_) ? 'selected' : '') + ' value="' + style_ + '" data-parent-style="' +  styles[style_].parentClass + '">' + styles[style_].name + '</option>\n';
                }
            }
            text += '</select>';
        }

        if (!$.fn.iconselectmenu) {
            $.widget('custom.iconselectmenu', $.ui.selectmenu, {
                _renderItem: function (ul, item) {
                    var li = $('<li>', {text: item.label});
                    var styles = ul.data('styles');

                    if (item.disabled) {
                        li.addClass('ui-state-disabled');
                    }

                    $('<span>', {
                        style:  'padding: 0px; margin; 0px; z-index: auto; display: inline-block; margin-right: 10px; position: relative; width: 50px; height: 20px;',
                        'class': 'ui-corner-all ' + item.value
                    }).prependTo(li);

                    li.css('font-size', '16px');

                    if (styles[item.value] && styles[item.value].parentClass) li.addClass(styles[item.value].parentClass);

                    return li.appendTo( ul );
                }
            });
        }

        $('#' + options.name).hide().after(text);

        var $styles = $('#' + options.name + '_styles');
        $styles.iconselectmenu({
            width: '100%',
            style: 'dropdown',
            change: function (event, ui) {
                 if (options.onchange) options.onchange(ui.item.value);

                var $text = $('#' + options.name + '_styles-button').find('.ui-selectmenu-text');
                $('<span>', {
                    style:  'padding: 0px; margin; 0px; z-index: auto; display: inline-block; margin-right: 10px; position: relative; width: 50px; height: 20px;',
                    'class': 'ui-corner-all vis-current-style ' + ui.item.value
                }).prependTo($text);

                $text.css('font-size', '16px');

                if (styles[ui.item.value] && styles[ui.item.value].parentClass) {
                    $text.parent().addClass(styles[ui.item.value].parentClass);
                }
            }
        }).iconselectmenu('menuWidget').data('styles', styles).addClass('selectmenu-overflow');

        $('#' + options.name + '_styles-menu').addClass('custom-vis-menu');

        var $curStyle = $('#' + options.name + '_styles-button .vis-current-style');
        if ($curStyle.length) {
            $curStyle.remove();

            $styles.val(options.style)
                .iconselectmenu('refresh');
        }

        var $text = $('#' + options.name + '_styles-button').find('.ui-selectmenu-text');
        $('<span>', {
            style:  'padding: 0px; margin; 0px; z-index: auto; display: inline-block; margin-right: 10px; position: relative; width: 50px; height: 20px;',
            'class': 'ui-corner-all vis-current-style ' + options.style
        }).prependTo($text);

        $text.css('font-size', '16px');

        if (styles[options.style] && styles[options.style].parentClass) {
            $text.parent().addClass(styles[options.style].parentClass);
        }
    }
};

// Color selection Dialog
var colorSelect = {
    // possible settings
    settings: {
        onselect:    null,
        onselectArg: null,
        result:      '',
        current:     null,   // current value
        parent:      $('body'),
        elemName:    'idialog_',
        zindex:      5050
    },
    _selectText: '',
    _cancelText: '',
    _titleText:  '',

    show:  function (options) {
        if (!this._selectText) {
            this._selectText = _('Select');
            this._cancelText = _('Cancel');
            this._titleText  = _('Select color');
        }

        if (!options.elemName) {
            options.elemName = 'idialog_';
        }
        if (!options.parent) {
            options.parent = $('body');
        }

        if (document.getElementById(options.elemName) !== undefined) {
            $('#' + options.elemName).remove();
        }
        options.parent.append('<div class="dialog" id="colorSelect" title="' + this._titleText + '" style="text-align: center;"><div style="display: inline-block;" id="colorpicker"></div><input type="text" id="colortext"/></div>');
        var htmlElem = document.getElementById("colorSelect");
        htmlElem.settings = {};
        htmlElem.settings = $.extend(htmlElem.settings, this.settings);
        htmlElem.settings = $.extend(htmlElem.settings, options);
        $(htmlElem).css({'z-index': htmlElem.settings.zindex});

         // Define dialog buttons
        var dialog_buttons = {};
        dialog_buttons[this._selectText] = function () {
            $(this).dialog('close');
            if (this.settings.onselect)
                this.settings.onselect ($('#colortext').val(), this.settings.onselectArg);
            $(this).remove();
        };
        dialog_buttons[this._cancelText] = function () {
            $(this).dialog('close');
            $(this).remove();
        };
        $('#colorSelect').dialog({
            resizable: false,
            height:    385,
            width:     340,
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
        $.widget('dash.multiselect', {
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
                div += '</table>';
                this.table = $(div);
                this.table.insertAfter(elem);
                this._build();
            },

            _build: function () {
                this.table.empty();
                var div = "";
                this.element.find("option").each(function () {
                    div += '<tr class="ui-widget-content"><td><input type="checkbox" ' + ($(this).is(':selected') ? 'checked' : '') + ' data-value="' + $(this).attr('value') + '">' + $(this).html() + '</td>';
                    console.log($(this).attr('value'));
                });
                this.table.html(div);
                var that = this;
                this.table.find('input').each(function () {
                    this._parent = that;
                    $(this).on('click', function () {
                        var val = $(this).attr('data-value');
                        var checked =  $(this).is(':checked');
                        // change state on the original option tags
                        this._parent.element.find('option').each(function () {
                            if(this.value === val) {
                                $(this).prop('selected', checked);
                            }
                        });

                        this._parent.element.trigger('change');
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
