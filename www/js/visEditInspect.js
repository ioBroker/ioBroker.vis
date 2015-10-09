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

// visEdit - the ioBroker.vis Editor
/* jshint browser:true */
/* global document */
/* global console */
/* global session */
/* global window */
/* global location */
/* global setTimeout */
/* global clearTimeout */
/* global io */
/* global $ */
/* global vis:true */
/* global local */
/* global can */
/* global colorSelect */
/* global storage */
/* global html2canvas */
/* global translateAll */
/* global ace */
/* global _ */
/* jshint -W097 */// jshint strict:false


// Format: attr_name(start-end)[default_value]/type/onChangeFunc
// attr_name can be extended with numbers (1-2) means it will be attr_name1 and attr_name2 created
//     end number can be other attribute, e.g (1-count)
// defaultValue: If defaultValue has ';' it must be replaced by §
// defaultValue: If defaultValue has '/' it must be replaced by ~
// defaultValue: If defaultValue has '"' it must be replaced by ^
// defaultValue: If defaultValue has '^' it must be replaced by ^^
// Type format: id - Object ID Dialog
//              checkbox
//              image - image
//              number,min,max,step - non-float number. min,max,step are optional
//              color - color picker
//              views - Name of the view
//              effect - jquery UI show/hide effects
//              eff_opt - additional option to effect slide (up, down, left, right)
//              fontName - Font name
//              slider,min,max,step - Default step is ((max - min) / 100)
//              select,value1,value2,... - dropdown select
//              nselect,value1,value2,... - same as select, but without translation of items
//              style,fileFilter,nameFilter,attrFilter
//              custom,functionName,options,... - custom editor - functionName is starting from vis.binds.[widgetset.funct]. E.g. custom/timeAndWeather.editWeather,short
//              group.name - define new or old group. All following attributes belongs to new group till new group.xyz
//              group.name/byindex - like group, but all following attributes will be grouped by ID. Like group.windows/byindex;slide(1-4)/id;slide_type(1-4)/select,open,closed  Following groups will be created Windows1(slide1,slide_type1), Windows2(slide2,slide_type2), Windows3(slide3,slide_type3), Windows4(slide4,slide_type4)
//              text - dialog box with html editor
//              html - dialog box with html editor

'use strict';

vis = $.extend(true, vis, {
    editObjectID: function (widAttr, widgetFilter) {
        var that = this;
        // Edit for Object ID
        var line = [
            {
                input: '<input type="text" id="inspect_' + widAttr + '">'
            }
        ];

        if (this.objectSelector) {
            line[0].button = {
                icon: 'ui-icon-note',
                text: false,
                title: _('Select object ID'),
                click: function () {
                    var wdata = $(this).data('data-wdata');

                    $('#dialog-select-member-' + wdata.attr).selectId('show', that.views[wdata.view].widgets[wdata.widgets[0]].data[wdata.attr], function (newId, oldId) {
                        if (oldId != newId) {
                            $('#inspect_' + wdata.attr).val(newId).trigger('change');

                            if ($('#inspect_min').length) {
                                if (that.objects[newId] && that.objects[newId].common && that.objects[newId].common.min !== undefined) {
                                    $('#inspect_min').val(that.objects[newId].common.min).trigger('change');
                                }
                            }

                            if ($('#inspect_max').length) {
                                if (that.objects[newId] && that.objects[newId].common && that.objects[newId].common.max !== undefined) {
                                    $('#inspect_max').val(that.objects[newId].common.max).trigger('change');
                                }
                            }

                            if ($('#inspect_oid-working').length) {
                                if (that.objects[newId] && that.objects[newId].common && that.objects[newId].common.workingID) {
                                    if (that.objects[newId].common.workingID.indexOf('.') != -1) {
                                        $('#inspect_oid-working').val(that.objects[newId].common.workingID).trigger('change');
                                    } else {
                                        var parts = newId.split('.');
                                        parts.pop();
                                        parts.push(that.objects[newId].common.workingID);
                                        $('#inspect_oid-working').val(parts.join('.')).trigger('change');
                                    }
                                }
                            }

                            /*
                             if (document.getElementById('inspect_hm_wid')) {
                             if (that.objects[newId]['Type'] !== undefined && that.objects[value]['Parent'] !== undefined &&
                             (that.objects[newId]['Type'] == 'STATE' ||
                             that.objects[newId]['Type'] == 'LEVEL')) {

                             var parent = that.objects[newId]['Parent'];
                             if (that.objects[parent]['DPs'] !== undefined &&
                             that.objects[parent]['DPs']['WORKING'] !== undefined) {
                             $('#inspect_hm_wid').val(that.objects[parent]['DPs']['WORKING']);
                             $('#inspect_hm_wid').trigger('change');
                             }
                             }
                             }

                             // Try to find Function of the device and fill the Filter field
                             var $filterkey = $('#inspect_filterkey');
                             if ($filterkey.length) {
                             if ($filterkey.val() == '') {
                             var oid = newId;
                             var func = null;
                             if (that.metaIndex && that.metaIndex['ENUM_FUNCTIONS']) {
                             while (oid && that.objects[oid]) {
                             for (var t = 0; t < that.metaIndex['ENUM_FUNCTIONS'].length; t++) {
                             var list = that.objects[that.metaIndex['ENUM_FUNCTIONS'][t]];
                             for (var z = 0; z < list['Channels'].length; z++) {
                             if (list['Channels'][z] == oid) {
                             func = list.Name;
                             break;
                             }
                             }
                             if (func) break;
                             }
                             if (func) break;

                             oid = that.objects[oid]['Parent'];
                             }
                             }
                             if (func) $filterkey.val(func).trigger('change');
                             }
                             }*/
                        }
                    });
                }
            };
            line[0].onchange = function (val) {
                var wdata = $(this).data('data-wdata');
                $('#inspect_' + wdata.attr + '_desc').html(that.getObjDesc(val));
            };

            line.push({input: '<div id="inspect_' + widAttr + '_desc"></div>'});

            // Init select dialog
            if (!$('#dialog-select-member-' + widAttr).length) {
                $('body').append('<div id="dialog-select-member-' + widAttr + '" style="display:none"></div>');
                $('#dialog-select-member-' + widAttr).selectId('init', {
                    texts: {
                        select:          _('Select'),
                        cancel:          _('Cancel'),
                        all:             _('All'),
                        id:              _('ID'),
                        name:            _('Name'),
                        role:            _('Role'),
                        room:            _('Room'),
                        value:           _('Value'),
                        selectid:        _('Select ID'),
                        enum:            _('Members'),
                        from:            _('from'),
                        lc:              _('lc'),
                        ts:              _('ts'),
                        ack:             _('ack'),
                        expand:          _('expand'),
                        collapse:        _('collapse'),
                        refresh:         _('refresh'),
                        edit:            _('edit'),
                        ok:              _('ok'),
                        wait:            _('wait'),
                        list:            _('list'),
                        tree:            _('tree'),
                        copyToClipboard: _('Copy to clipboard')
                    },
                    filterPresets:  {role: widgetFilter},
                    noMultiselect: true,
                    columns: ['image', 'name', 'type', 'role', 'enum', 'room', 'value'],
                    imgPath: '/lib/css/fancytree/',
                    objects: this.objects,
                    states:  this.states,
                    zindex:  1001
                });
            } else {
                $('#dialog-select-member-' + widAttr).selectId('option', 'filterPresets',  {role: widgetFilter});
            }
        }

        return line;
    },
    editSelect: function (widAttr, values, notTranslate, init, onchange) {
        if (typeof notTranslate == 'function') {
            onchange = init;
            init = notTranslate;
            notTranslate = false;
        }

        // Select
        var line = {
            input: '<select type="text" id="inspect_' + widAttr + '">'
        };
        if (onchange) line.onchange = onchange;
        if (init)     line.init = init;
        if (values.length && values[0] !== undefined) {
            for (var t = 0; t < values.length; t++) {
                line.input += '<option value="' + values[t] + '">' + (notTranslate ? values[t] : _(values[t])) + '</option>';
            }
        } else {
            for (var name in values) {
                line.input += '<option value="' + values[name] + '">' + name + '</option>';
            }
        }
        line.input += '</select>';
        return line;
    },
    editStyle: function (widAttr, options) {
        var that = this;
        // options[0] fileFilter
        // options[1] nameFilter
        // options[2] attrFilter
        // Effect selector
        var line = {
            input: '<input type="text" id="inspect_' + widAttr + '" class="vis-edit-textbox"/>',
            init: function (_wid_attr, data) {
                if (that.styleSelect) {
                    that.styleSelect.show({
                        width:      '100%',
                        name:       'inspect_' + _wid_attr,
                        filterFile:  options[0],
                        filterName:  options[1],
                        filterAttrs: options[2],
                        removeName:  options[3],
                        style:       data,
                        parent:      $(this).parent(),
                        onchange:    function (newStyle) {
                            $('#inspect_' + widAttr).val(newStyle).trigger('change');
                        }
                    });
                    $('#inspect_' + widAttr).hide();
                }
            }
        };
        return line;
    },
    editFontName: function (widAttr) {
        // Select
        var values = ['', 'Arial', 'Times', 'Andale Mono', 'Comic Sans', 'Impact'];
        return this.editSelect(widAttr, values);
    },
    editAutoComplete: function (widAttr, values) {
        // Autocomplete
        var line = {
            input: '<input type="text" id="inspect_' + widAttr + '" class="vis-edit-textbox"/>',
            init: function (_wid_attr, data) {
                $(this).autocomplete({
                    minLength: 0,
                    source: function (request, response) {
                        var _data = $.grep(values, function (value) {
                            return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
                        });

                        response(_data);
                    },
                    select: function (event, ui) {
                        $(this).val(ui.item.value);
                        $(this).trigger('change', ui.item.value);
                    }
                }).focus(function () {
                    // Show dropdown menu
                    $(this).autocomplete('search', '');
                });
            }
        };
        return line;
    },
    _editSetFontColor: function(element) {
        try {
            var r;
            var b;
            var g;
            var hsp;
            var a = $('#' + element).css('background-color');
            if (a.match(/^rgb/)) {
                a = a.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
                r = a[1];
                g = a[2];
                b = a[3];
            } else {
                a = '0x' + a.slice(1).replace(a.length < 5 && /./g, '$&$&');
                r = a >> 16;
                g = a >> 8 & 255;
                b = a & 255;
            }
            hsp = Math.sqrt(
                0.299 * (r * r) +
                0.587 * (g * g) +
                0.114 * (b * b)
            );
            if (hsp > 127.5) {
                $('#' + element).css("color", "#000000");
            } else {
                $('#' + element).css("color", "#FFFFFF");
            }
        }catch (err){}
    },
    editColor: function (widAttr) {
        var that = this;
        var line = {
            input: '<input type="text" id="inspect_' + widAttr + '"/>',
            onchange: function (value) {
                $(this).css("background-color", value || '');
                that._editSetFontColor('inspect_' + widAttr);
            }
        };
        if ((typeof colorSelect != 'undefined' && $().farbtastic)) {
            line.button = {
                icon: 'ui-icon-note',
                text: false,
                title: _('Select color'),
                click: function (/*event*/) {
                    var wdata = $(this).data('data-wdata');
                    var _settings = {
                        current: $('#inspect_' + wdata.attr).val(),
                        onselectArg: wdata,
                        onselect: function (img, _data) {
                            $('#inspect_' + wdata.attr).val(colorSelect.GetColor()).trigger('change');
                        }
                    };

                    colorSelect.show(_settings);
                }
            };
        }

        return line;
    },
    editViewName: function (widAttr) {
        var views = [''];
        for (var v in this.views) {
            views.push(v);
        }

        return this.editAutoComplete(widAttr, views);
    },
    editFilterName: function (widAttr) {
        var filters = vis.updateFilter();
        filters.unshift('');

        //return this.editSelect(widAttr, filters, true);
        return this.editAutoComplete(widAttr, filters);
    },
    editEffect: function (widAttr) {
        var that = this;
        return this.editSelect(widAttr, [
            '',
            'show',
            'blind',
            'bounce',
            'clip',
            'drop',
            'explode',
            'fade',
            'fold',
            'highlight',
            'puff',
            'pulsate',
            'scale',
            'shake',
            'size',
            'slide'
        ], null, function (_widAttr, data) {
            if (_widAttr.indexOf('_effect') != -1) {
                var eff = _widAttr.replace('_effect', '_options');
                var $elem = $('#inspect_' + eff);
                if ($elem.length) {
                    if (data == 'slide') {
                        that.hideShowAttr(eff, true);
                    } else {
                        that.hideShowAttr(eff, false);
                        $('#inspect_' + eff).val('').trigger('change');
                    }
                }
            }
        });
    },
    editNumber: function (widAttr, options, onchange) {
        // options = {min: ?,max: ?,step: ?}
        // Select
        var line = {
            input: '<input id="inspect_' + widAttr + '" style="width: 100%"/>',
            init: function (w, data) {
                var platform = window.navigator.oscpu || window.navigator.platform;
                // Do not show spin on MAc OS
                if (platform.indexOf('Mac') === -1) {
                    options = options || {};
                    options.spin = function () {
                        var $this = $(this);
                        var timer = $this.data('timer');
                        if (timer) clearTimeout(timer);
                        $this.data('timer', setTimeout(function () {
                            $this.trigger('change');
                        },200));
                    };
                    $(this).spinner(options);
                    $(this).parent().css({width: '100%'});
                } else {
                    $(this).parent().css({width: '98%'});
                }
                // Allow only numbers
                $(this).on('keypress', function(e) {
                    var code = e.keyCode || e.charCode;
                    return (code >= 48 && code <= 57) || (code == 110);
                });
            }
        };
        if (onchange) line.onchange = onchange;
        return line;
    },
    editButton: function (widAttr, options, onchange) {
        // options = {min: ?,max: ?,step: ?}
        // Select
        var line = {
            input: '<button id="inspect_' + widAttr + '">' + widAttr + '</button>',
            init: function (w, data) {
                $(this).button().click(function () {
                    var that = this;
                    $(this).val(true).trigger('change');
                });
            }
        };
        if (onchange) line.onchange = onchange;
        return line;
    },
    editUrl: function (widAttr, filter) {
        var line = {
            input: '<input type="text" id="inspect_' + widAttr + '"/>'
        };
        var that = this;

        if ($.fm) {
            line.button = {
                icon: 'ui-icon-note',
                text: false,
                title: _('Select image'),
                click: function (/*event*/) {
                    var wdata = $(this).data('data-wdata');
                    var defPath = ('/' + (that.conn.namespace ? that.conn.namespace + '/' : '') + that.projectPrefix + 'img/');

                    var current = that.widgets[wdata.widgets[0]].data[wdata.attr];
                    //workaround, that some widgets calling direct the img/picure.png without /vis/
                    if (current && current.substring(0, 4) == 'img/') {
                        current = '/vis/' + current;
                    }

                    $.fm({
                        lang:         that.language,
                        defaultPath:  defPath,
                        path:         current || defPath,
                        uploadDir:    '/' + (that.conn.namespace ? that.conn.namespace + '/' : ''),
                        fileFilter:   filter || ['gif', 'png', 'bmp', 'jpg', 'jpeg', 'tif', 'svg'],
                        folderFilter: false,
                        mode:         'open',
                        view:         'prev',
                        userArg:      wdata,
                        conn:         that.conn,
                        zindex:       1001
                    }, function (_data, userData) {
                        var src = _data.path + _data.file;
                        $('#inspect_' + wdata.attr).val(src).trigger('change');
                    });
                }
            };
        }
        return line;
    },
    editCustom: function (widAttr, options) {
        if (!options) {
            console.log('No path to custom function');
        } else {
            var funcs = options[0].split('.');
            options.unshift();
            if (funcs[0] == 'vis') funcs.unshift();
            if (funcs[0] == 'binds') funcs.unshift();
            if (funcs.length == 1) {
                if (typeof this.binds[funcs[0]] == 'function') {
                    return this.binds[funcs[0]](widAttr, options);
                } else {
                    console.log('No function: vis.binds.' + funcs.join('.'));
                }
            } else if (funcs.length == 2) {
                if (this.binds[funcs[0]] && typeof this.binds[funcs[0]][funcs[1]] == 'function') {
                    return this.binds[funcs[0]][funcs[1]](widAttr, options);
                } else {
                    console.log('No function: vis.binds.' + funcs.join('.'));
                }
            } else if (funcs.length == 3) {
                if (this.binds[funcs[0]] && this.binds[funcs[0]][funcs[1]] && typeof this.binds[funcs[0]][funcs[1]][funcs[2]] == 'function') {
                    return this.binds[funcs[0]][funcs[1]][funcs[2]](widAttr, options);
                } else {
                    console.log('No function: vis.binds.' + funcs.join('.'));
                }
            } else {
                if (!funcs.length) {
                    console.log('Function name is too short: vis.binds');
                } else {
                    console.log('Function name is too long: vis.binds.' + funcs.join('.'));
                }
            }
            return {};
        }
    },
    editSlider: function (widAttr, options) {
        options.min = (!options.min) ? 0 : options.min;
        options.max = (!options.max) ? 0 : options.max;
        options.step = (!options.step) ? (options.max - options.min) / 100 : options.step;
        var that = this;
        var line = {
            input: '<table width="100%"><tr><td style="width:50px"><input style="width:50px" id="inspect_' + widAttr + '"/></td><td width="100%"><div id="inspect_' + widAttr + '_slider"></div></td></tr>',
            init: function (w, data) {
                options.value = (data === undefined) ? options.min : data;
                var input = this;
                options.slide = function (event, ui) {
                    $(input).val(ui.value).trigger('change');
                };
                $('#inspect_' + widAttr + '_slider').slider(options);
            },
            onchange: function (value) {
                $('#inspect_' + widAttr + '_slider').slider('value', (value === undefined) ? options.min : value);
            }
        };
        return line;
    },
    editCssCommon: function () {
        var group = 'css_common';
        var line;
        this.groups[group] = this.groups[group] || {};

        this.groups[group].css_left   = {input: '<input type="text" id="inspect_css_left"/>'};
        this.groups[group].css_top    = {input: '<input type="text" id="inspect_css_top"/>'};
        this.groups[group].css_width  = {input: '<input type="text" id="inspect_css_width"/>'};
        this.groups[group].css_height = {input: '<input type="text" id="inspect_css_height"/>'};
        this.groups[group]['css_z-index']    = this.editNumber('css_z-index');
        this.groups[group]['css_overflow-x'] = this.editSelect('css_overflow-x', ['', 'visible', 'hidden', 'scroll', 'auto', 'initial', 'inherit'], true);
        this.groups[group]['css_overflow-y'] = this.editSelect('css_overflow-y', ['', 'visible', 'hidden', 'scroll', 'auto', 'initial', 'inherit'], true);
        this.groups[group].css_opacity       = {input: '<input type="text" id="inspect_css_opacity"/>'};

        for(var attr in this.groups[group]) {
            this.groups[group][attr].css = true;
            this.groups[group][attr].attrName = attr;
            this.groups[group][attr].attrIndex = '';
        }
    },
    editCssFontText: function () {
        var group = 'css_font_text';
        var line;
        this.groups[group] = this.groups[group] || {};

        this.groups[group].css_color             = this.editColor('css_color');
        this.groups[group]['css_text-align']     = this.editSelect('css_text-align', ['', 'left', 'right', 'center' ,'justify', 'initial', 'inherit'], true);
        this.groups[group]['css_text-shadow']    = {input: '<input type="text" id="inspect_css_text-shadow"/>'};
        this.groups[group]['css_font-family']    = this.editAutoComplete('css_font-family', ['',
            'Verdana, Geneva, sans-serif',
            'Georgia, "Times New Roman", Times, serif',
            '"Courier New", Courier, monospace',
            'Arial, Helvetica, sans-serif',
            'Tahoma, Geneva, sans-serif',
            '"Trebuchet MS", Arial, Helvetica, sans-serif',
            '"Arial Black", Gadget, sans-serif',
            '"Times New Roman", Times, serif',
            '"Palatino Linotype", "Book Antiqua", Palatino, serif',
            '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
            '"MS Serif", "New York", serif',
            '"Comic Sans MS", cursive']);//{input: '<input type="text" id="inspect_css_font-family"/>'};
        this.groups[group]['css_font-style']     = this.editSelect('css_font-style', ['', 'normal', 'italic', 'oblique', 'initial', 'inherit'], true);
        this.groups[group]['css_font-variant']   = this.editSelect('css_font-variant', ['', 'normal', 'small-caps', 'initial', 'inherit'], true);
        this.groups[group]['css_font-weight']    = this.editAutoComplete('css_font-weight', ['', 'normal', 'bold', 'bolder', 'lighter', 'initial', 'inherit']);
        this.groups[group]['css_font-size']      = this.editAutoComplete('css_font-size', ['', 'medium', 'xx-small', 'x-small', 'small', 'large', 'x-large', 'xx-large', 'smaller', 'larger', 'initial', 'inherit']);
        this.groups[group]['css_line-height']    = {input: '<input type="text" id="inspect_css_line-height"/>'};
        this.groups[group]['css_letter-spacing'] = {input: '<input type="text" id="inspect_css_letter-spacing"/>'};
        this.groups[group]['css_word-spacing']   = {input: '<input type="text" id="inspect_css_word-spacing"/>'};

        for(var attr in this.groups[group]) {
            this.groups[group][attr].css = true;
            this.groups[group][attr].attrName = attr;
            this.groups[group][attr].attrIndex = '';
        }
    },
    editCssBackground: function () {
        var group = 'css_background';
        var line;
        this.groups[group] = this.groups[group] || {};

        this.groups[group].css_background               = {input: '<input type="text" id="inspect_css_background" class="vis-edit-textbox vis-inspect-widget"/>'};
        this.groups[group]['css_background-color']      = this.editColor('css_background-color');
        this.groups[group]['css_background-image']      = {input: '<input type="text" id="inspect_background-image"  class="vis-edit-textbox vis-inspect-widget"/>'};
        this.groups[group]['css_background-repeat']     = this.editSelect('css_background-repeat', ['', 'repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'initial', 'inherit'], true);
        this.groups[group]['css_background-attachment'] = this.editSelect('css_background-attachment', ['', 'scroll', 'fixed', 'local', 'initial', 'inherit'], true);
        this.groups[group]['css_background-position']   = {input: '<input type="text" id="inspect_background-position"  class="vis-edit-textbox vis-inspect-widget"/>'};
        this.groups[group]['css_background-size']       = {input: '<input type="text" id="inspect_background-size"  class="vis-edit-textbox vis-inspect-widget"/>'};
        this.groups[group]['css_background-clip']       = this.editSelect('css_background-clip', ['', 'border-box', 'padding-box', 'content-box', 'initial', 'inherit'], true);
        this.groups[group]['css_background-origin']     = this.editSelect('css_background-origin', ['', 'padding-box', 'border-box', 'content-box', 'initial', 'inherit'], true);

        for(var attr in this.groups[group]) {
            this.groups[group][attr].css = true;
            this.groups[group][attr].attrName = attr;
            this.groups[group][attr].attrIndex = '';
        }
    },
    editDimensionOnChangeHelper: function (elem, value) {
        if (value && typeof value != 'object') {
            var e = value.substring(value.length - 2);
            if (e != 'px' && e != 'em') {
                var wdata = $(elem).data('data-wdata');
                for (var t = 0; t < wdata.widgets.length; t++) {
                    this.views[wdata.view].widgets[wdata.widgets[t]].style[wdata.attr.substring(4)] = value + 'px';
                    $('#' + wdata.widgets[t]).css(wdata.attr.substring(4), value + 'px');
                }
            }
        }
    },
    editCssBorder: function () {
        var group = 'css_border';
        var line;
        var that = this;
        this.groups[group] = this.groups[group] || {};

        this.groups[group]['css_border-width']  = {
            input: '<input type="text" id="inspect_css_border-width"/>',
            onchange: function (value) {
                that.editDimensionOnChangeHelper(this, value);
            }
        };
        this.groups[group]['css_border-style']  = this.editAutoComplete('css_border-style', ['', 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'initial', 'inherit']);
        this.groups[group]['css_border-color']  = this.editColor('css_border-color');
        this.groups[group]['css_border-radius'] = {
            input: '<input type="text" id="inspect_css_border-radius"/>',
            onchange: function (value) {
                that.editDimensionOnChangeHelper(this, value);
            }
        };

        for(var attr in this.groups[group]) {
            this.groups[group][attr].css = true;
            this.groups[group][attr].attrName = attr;
            this.groups[group][attr].attrIndex = '';
        }
    },
    editCssShadowPadding: function () {
        var group = 'css_shadow_padding';
        this.groups[group] = this.groups[group] || {};

        this.groups[group].css_padding           = {input: '<input type="text" id="inspect_css_padding"/>'};
        this.groups[group]['css_padding-left']   = {input: '<input type="text" id="inspect_css_padding-left"/>'};
        this.groups[group]['css_padding-top']    = {input: '<input type="text" id="inspect_css_padding-top"/>'};
        this.groups[group]['css_padding-right']  = {input: '<input type="text" id="inspect_css_padding-right"/>'};
        this.groups[group]['css_padding-bottom'] = {input: '<input type="text" id="inspect_css_padding-bottom"/>'};
        this.groups[group]['css_box-shadow']     = {input: '<input type="text" id="inspect_css_box-shadow"/>'};
        this.groups[group]['css_margin-left']    = {input: '<input type="text" id="inspect_css_margin-left"/>'};
        this.groups[group]['css_margin-top']     = {input: '<input type="text" id="inspect_css_margin-top"/>'};
        this.groups[group]['css_margin-right']   = {input: '<input type="text" id="inspect_css_margin-right"/>'};
        this.groups[group]['css_margin-bottom']  = {input: '<input type="text" id="inspect_css_margin-bottom"/>'};

        for(var attr in this.groups[group]) {
            this.groups[group][attr].css = true;
            this.groups[group][attr].attrName = attr;
            this.groups[group][attr].attrIndex = '';
        }
    },
    editCssAnimation: function () {
        var group = 'css_animation';
        this.groups[group] = this.groups[group] || {};

        this.groups[group]['css_animation-name']     = {input: '<input type="text" id="inspect_css_animation-name"/>'};
        this.groups[group]['css_animation-duration'] = {input: '<input type="text" id="inspect_css_animation-duration"/>'};

        for(var attr in this.groups[group]) {
            this.groups[group][attr].css = true;
            this.groups[group][attr].attrName = attr;
            this.groups[group][attr].attrIndex = '';
        }
    },
    editText: function (widAttr) {
        var that = this;
        var line = {
            input: '<textarea id="inspect_' + widAttr + '"></textarea>'
        };

        line.button = {
            icon: 'ui-icon-note',
            text: false,
            title: _('Select color'),
            click: function (/*event*/) {
                var wdata = $(this).data('data-wdata');
                var data = {};
                if (that.config['dialog-edit-text']) {
                    data = JSON.parse(that.config['dialog-edit-text']);
                }
                var editor = ace.edit('dialog-edit-text-textarea');
                var changed = false;
                $('#dialog-edit-text').dialog({
                    autoOpen: true,
                    width:    data.width  || 800,
                    height:   data.height || 600,
                    modal:    true,
                    open:     function () {
                        $(this).parent().css({'z-index': 1000});
                        if (data.top !== undefined) {
                            if (data.top >= 0) {
                                $(this).parent().css({top:  data.top});
                            } else {
                                $(this).parent().css({top:  0});
                            }
                        }
                        if (data.left !== undefined) {
                            if (data.left >= 0) {
                                $(this).parent().css({left: data.left});
                            } else {
                                $(this).parent().css({left: 0});
                            }
                        }
                        editor.getSession().setMode("ace/mode/html");
                        editor.setOptions({
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion:  true
                        });
                        editor.$blockScrolling = Infinity;
                        editor.getSession().setUseWrapMode(true);
                        editor.setValue($('#inspect_' + wdata.attr).val());
                        editor.navigateFileEnd();
                        editor.focus();
                        editor.getSession().on('change', function(e) {
                            changed = true;
                        });
                    },
                    beforeClose: function () {
                        var pos = $('#dialog-edit-text').parent().position();
                        that.editSaveConfig('dialog-edit-text', JSON.stringify({
                            top:    pos.top  > 0 ? pos.top  : 0,
                            left:   pos.left > 0 ? pos.left : 0,
                            width:  $('#dialog-edit-text').parent().width(),
                            height: $('#dialog-edit-text').parent().height() + 9
                        }));

                        if (changed) {
                            if (!window.confirm(_('Changes are not saved!. Continue?'))) {
                                return false;
                            }
                        }
                    },
                    buttons:  [
                        {
                            text: _('Ok'),
                            click: function () {
                                $('#inspect_' + wdata.attr).val(editor.getValue()).trigger('change');
                                changed = false;
                                $(this).dialog('close');
                            }
                        },
                        {
                            text: _('Cancel'),
                            click: function () {
                                $(this).dialog('close');
                            }
                        }
                    ]
                }).show();
            }
        };
        return line;
    },
    // find states with requested roles of device
    findByRoles: function (stateId, roles) {
        if (typeof roles != 'object') {
            roles = [roles];
        } else {
            roles = JSON.parse(JSON.stringify(roles));
        }
        var result = {};
        // try to detect other values

        // Go trough all channels of this device
        var parts = stateId.split('.');
        parts.pop(); // remove state
        var channel = parts.join('.');
        var reg = new RegExp("^" + channel.replace(/\./g, '\\.') + '\\.');

        // channels
        for (var id in this.objects) {
            if (reg.test(id) &&
                this.objects[id].common &&
                this.objects[id].type == 'state') {
                for (var r = 0; r < roles.length; r++) {
                    if (this.objects[id].common.role == roles[r]) {
                        result[roles[r]] = id;
                        roles.splice(r, 1);
                        break;
                    }
                    if (!roles.length) break;
                }
            }
        }
        // try to search in channels
        if (roles.length) {
            parts.pop(); // remove channel
            var device = parts.join('.');
            var reg = new RegExp("^" + device.replace(/\./g, '\\.') + '\\.');
            for (var id in this.objects) {
                if (reg.test(id) &&
                    this.objects[id].common &&
                    this.objects[id].type == 'state') {

                    for (var r = 0; r < roles.length; r++) {
                        if (this.objects[id].common.role == roles[r]) {
                            result[roles[r]] = id;
                            roles.splice(r, 1);
                            break;
                        }
                    }
                    if (!roles.length) break;
                }
            }
        }
        return result;
    },
    findByName: function (stateId, objName) {
        var result = {};
        // try to detect other values

        // Go trough all channels of this device
        var parts = stateId.split('.');
        parts.pop(); // remove state
        var channel = parts.join('.');

        // check same channel
        var id = channel + '.' + objName;
        if ((id in this.objects) &&
            this.objects[id].common &&
            this.objects[id].type == 'state') {

            return id;
        }

        // try to search in channels
        parts.pop(); // remove channel
        var device = parts.join('.');
        var reg = new RegExp('^' + device.replace(/\./g, '\\.') + '\\.' + '.*\\.' + objName);
        for (var id in this.objects) {
            if (reg.test(id) &&
                this.objects[id].common &&
                this.objects[id].type == 'state') {

                return id;
            }
        }
        return false;
    },
    hideShowAttr: function (widAttr, isShow) {
        if (isShow) {
            $('#td_' + widAttr).show();
        } else {
            $('#td_' + widAttr).hide();
        }
    },
    addToInspect: function (widgets, widAttr, group, options, onchange) {
        if (widgets === 'delimiter') {
            this.groups[widAttr || group] = this.groups[widAttr || group] || {};
            this.groups[widAttr || group]['delimiter'] = 'delimiter';
            return;
        }
        if (typeof widAttr != 'object') {
            widAttr = {name: widAttr};
        }
        if (widAttr.clearName === undefined) widAttr.clearName = widAttr.name;
        if (widAttr.index     === undefined) widAttr.index     = '';

        if (typeof group   == 'function') {
            onchange = group;
            group = null;
        }
        if (typeof options == 'function') {
            onchange = options;
            options = null;
        }

        options = options || {};

        var input;
        var line;
        // set default value if attr is empty
        if (widAttr.default !== undefined) {
            for (var i = 0; i < widgets.length; i++) {
                var view         = this.getViewOfWidget(widgets[i]);
                var widgetData   = this.views[view].widgets[widgets[i]].data;

                if (widgetData[widAttr.name] === null || widgetData[widAttr.name] === undefined) {
                    widgetData[widAttr.name] = widAttr.default;
                    this.reRenderList = this.reRenderList || [];
                    if (this.reRenderList.indexOf(widgets[i]) == -1) this.reRenderList.push(widgets[i]);
                }
            }
        }

        // Depends on attribute type
        switch (widAttr.type) {
            case 'id':
                line = this.editObjectID(widAttr.name, widAttr.options);
                break;
            case 'checkbox':
                // All other attributes
                line = '<input id="inspect_' + widAttr.name + '" type="checkbox"/>';
                break;
            case 'select-views':
                line = '<select multiple="multiple" id="inspect_' + widAttr.name + '" class="select-views"></select>';
                break;
            case 'color':
                line = this.editColor(widAttr.name);
                break;
            case 'text':
                line = this.editText(widAttr.name);
                break;
            case 'html':
                line = this.editText(widAttr.name);
                break;
            case 'number':
                line = this.editNumber(widAttr.name, widAttr.options);
                break;
            case 'button':
                line = this.editButton(widAttr.name, widAttr.options);
                break;
            case 'auto':
                line = this.editAutoComplete(widAttr.name, widAttr.options);
                break;
            case 'slider':
                line = this.editSlider(widAttr.name, widAttr.options);
                break;
            case 'views':
                line = this.editViewName(widAttr.name);
                break;
            case 'filters':
                line = this.editFilterName(widAttr.name);
                break;
            case 'custom':
                line = this.editCustom(widAttr.name, widAttr.options);
                break;
            case 'image':
                line = this.editUrl(widAttr.name);
                break;
            case 'sound':
                line = this.editUrl(widAttr.name, ['mp3', 'wav', 'ogg']);
                break;
            case 'select':
                line = this.editSelect(widAttr.name, widAttr.options, widAttr.notTranslate);
                break;
            case 'style':
                line = this.editStyle(widAttr.name, widAttr.options);
                break;
            case 'effect':
                line = this.editEffect(widAttr.name);
                break;
            case 'effect-options':
                line = this.editSelect(widAttr.name, {
                    'left':   _('left'),
                    'right':  _('right'),
                    'top':    _('top'),
                    'bottom': _('bottom')
                });
                break;
            case 'hidden':
                return;
            case 'fontname':
                line = this.editFontName(widAttr.name);
                break;
            default:
                line = '<input type="text" id="inspect_' + widAttr.name + '"/>';
        }

        if (typeof line == 'string') line = {input: line};

        if (line[0]) {
            line[0].attrName       = widAttr.clearName;
            line[0].attrIndex      = widAttr.index;
            line[0].type           = widAttr.type;
            line[0].onChangeWidget = widAttr.onChangeWidget;
            if (widAttr.depends && widAttr.depends.length) line[0].depends = widAttr.depends;
        } else {
            line.attrName       = widAttr.clearName;
            line.attrIndex      = widAttr.index;
            line.type           = widAttr.type;
            line.onChangeWidget = widAttr.onChangeWidget;
            if (widAttr.depends && widAttr.depends.length) line.depends = widAttr.depends;
        }


        // <tr><td>title:</td><td><input /></td><td>button</td></tr>
        this.groups[group] = this.groups[group] || {};
        this.groups[group][widAttr.name] = line;
    },
    // Render edit panel
    showInspect: function (view, widgets) {
        var $widgetAttrs = $('#widget_attrs');
        var that = this;
        var depends = [];
        var values = {};
        var widAttr;
        for (var group in this.groups) {
            if (this.groupsState[group] === undefined) this.groupsState[group] = false;
            var groupName = group;
            if (groupName.indexOf('_§') != -1) {
                var m = groupName.match(/^([\w_]+)_§([0-9]+)/);
                groupName = _('group_' + m[1]) + '[' + m[2] + ']';
            } else {
                groupName = _('group_' + group);
            }
            $widgetAttrs.append('<tr data-group="' + group + '" class="ui-state-default"><td colspan="3">' + groupName + '</td><td><button class="group-control" data-group="' + group + '">' + group + '</button></td>');

            for (var widAttr in this.groups[group]) {
                var line = this.groups[group][widAttr];
                if (line == 'delimiter') {
                    $widgetAttrs.append('<tr><td colspan="5" style="height: 2px" class="ui-widget-header"></td></tr>');
                    continue;
                }
                if (line[0]) line = line[0];
                if (typeof line == 'string') line = {input: line};
                var title = _(widAttr + '_tooltip');
                var icon;
                if (title == widAttr + '_tooltip') {
                    title = '';
                    icon = '';
                } else {
                    icon = '<div class="ui-icon ui-icon-notice" style="float: right"/>';
                }
                var text = '<tr class="vis-edit-td-caption group-' + group + '" id="td_' + widAttr + '"><td ' + (title ? 'title="' + title + '"' : '') + '>' + (icon ? '<i>' : '') + _(line.attrName) + (line.attrIndex !== '' ? ('[' + line.attrIndex + ']') : '') + ':' + (icon ? '</i>' : '') + '</td><td class="vis-edit-td-field"';

                if (!line.button && !line.css) {
                    text += ' colspan="3"';
                } else if (!line.css){
                    if (!line.button && !line.css) text += ' colspan="2"';
                } else if (!line.button){
                    text += ' colspan="2"';
                }

                text += '>' + (line.input || '') + '</td>';

                if (line.button) {
                    if (!line.button.html) {
                        text += '<td><button id="inspect_' + widAttr + '_btn">' + (line.button.text || line.button.title || '') + '</button></td>';
                    } else {
                        text += '<td>' + line.button.html + '</td>';
                    }
                }
                if (line.css) {
                    text += '<td><input id="steal_' + widAttr + '" type="checkbox" data-vis-steal="' + widAttr.substring(4) + '" class="vis-steal-css"/><label class="vis-steal-label" for="steal_' + widAttr + '">steal</label></td>';
                }

                text += '</tr>';

                $widgetAttrs.append(text);

                // Init button
                if (line.button) {
                    // If init function specified => call it
                    if (typeof line.button.code == 'function') {
                        line.button.code(line.button);
                    } else {
                        // init button
                        var $btn = $('#inspect_' + widAttr + '_btn').button({
                            text: line.button.text || false,
                            icons: {
                                primary: line.button.icon || ''
                            }
                        }).css({width: line.button.width || 22, height: line.button.height || 22});
                        if (line.button.click) $btn.click(line.button.click);
                        if (line.button.data)  $btn.data('data-custom', line.button.data);

                        $btn.data('data-wdata', {
                            attr:    widAttr,
                            widgets: widgets,
                            view:    view
                        });
                    }
                }

                // Init value
                var $input = $('#inspect_' + widAttr);
                var val;

                if ($input.attr('type') == 'text' || $input.prop("tagName") == 'TEXTAREA') $input.addClass('vis-edit-textbox');

                // Set the value
                this.setAttrValue(this.activeWidgets, widAttr, line.css, values);

                var wdata = {
                    attr:           widAttr,
                    widgets:        widgets,
                    view:           view,
                    type:           line.type,
                    css:            line.css,
                    onChangeWidget: line.onChangeWidget
                };
                if (line.onchange) wdata.onchange = line.onchange;

                $input.addClass('vis-inspect-widget');
                $input.data('data-wdata', wdata);

                if (this.groups[group][widAttr][0]) {
                    for (var i = 1; i < this.groups[group][widAttr].length; i++) {
                        text = '<tr class="vis-edit-td-caption group-' + group + '"><td></td><td class="vis-edit-td-field" colspan="2">' + this.groups[group][widAttr][i].input + '</td>';
                        $widgetAttrs.append(text);
                    }
                }
                // Collect list of attribute names on which depends other attributes
                if (line.depends) {
                    for (var u = 0; u < line.depends.length; u++) {
                        if (depends.indexOf(line.depends[u]) === -1) depends.push(line.depends[u]);
                    }
                }
            }

            // Hide elements
            if (!this.groupsState[group]) $('.group-' + group).hide();
        }

        // Init all elements together
        for (group in this.groups) {
            for (widAttr in this.groups[group]) {
                var line_ = this.groups[group][widAttr];
                var $input_ = $('#inspect_' + widAttr);
                var wdata_ = $input_.data('data-wdata');
                if (depends.length) $input_.data('data-depends', depends);

                if (line_[0]) line_ = line_[0];
                if (typeof line_ == 'string') line_ = {input: line_};
                if (typeof line_.init == 'function') {
                    if (wdata_.css) {
                        var cwidAttr = widAttr.substring(4);
                        if (values[cwidAttr] === undefined) values[cwidAttr] = this.findCommonValue(widgets, cwidAttr);
                        line_.init.call($input_[0], cwidAttr, values[cwidAttr]);
                    } else {
                        if (values[widAttr] === undefined) values[widAttr] = this.findCommonValue(widgets, widAttr);
                        line_.init.call($input_[0], widAttr, values[widAttr]);
                    }
                }
                // Call on change
                if (typeof line_.onchange == 'function') {
                    if (wdata_.css) {
                        var cwidAttr = widAttr.substring(4);
                        if (values[cwidAttr] === undefined) values[cwidAttr] = this.findCommonValue(widgets, cwidAttr);
                        line_.onchange.call($input_[0], values[cwidAttr]);
                    } else {
                        if (values[widAttr] === undefined) values[widAttr] = this.findCommonValue(widgets, widAttr);
                        line_.onchange.call($input_[0], values[widAttr]);
                    }
                }
            }
        }
        this.initStealHandlers();

        $('.vis-inspect-widget').change(function (e) {
            var $this   = $(this);
            var wdata   = $this.data('data-wdata');
            var depends = $this.data('data-depends');
            var diff    = $this.data('different');

            // Set flag, that value was modified
            if (diff) $this.data('different', false).removeClass('vis-edit-different');

            for (var i = 0; i < wdata.widgets.length; i++) {
                if (wdata.css) {
                    var css = wdata.attr.substring(4);
                    if (!that.views[wdata.view].widgets[wdata.widgets[i]].style) {
                        that.views[wdata.view].widgets[wdata.widgets[i]].style = {};
                    }
                    var val = $this.val();
                    that.views[wdata.view].widgets[wdata.widgets[i]].style[css] = val;
                    var $widget = $('#' + wdata.widgets[i]);
                    if (val !== '' && (css == 'left' || css == 'top')) {
                        if (val.indexOf('%') === -1 && val.indexOf('px') === -1 && val.indexOf('em') === -1) {
                            val += 'px';
                        }
                    }
                    $widget.css(css, val);
                    if (that.activeWidgets.indexOf(wdata.widgets[i]) != -1) {
                        that.showWidgetHelper(wdata.widgets[i], true);
                    }

                    if ($('#' + that.views[wdata.view].widgets[wdata.widgets[i]].tpl).attr('data-vis-update-style')) {
                        that.reRenderWidgetEdit(wdata.widgets[i]);
                    }
                } else {
                    if ($this.attr('type') == 'checkbox') {
                        that.widgets[wdata.widgets[i]].data[wdata.attr] = $this.prop('checked');
                    } else {
                        that.widgets[wdata.widgets[i]].data[wdata.attr] = $this.val();
                    }
                    that.views[wdata.view].widgets[wdata.widgets[i]].data[wdata.attr] = that.widgets[wdata.widgets[i]].data[wdata.attr];
                }

                // Some user adds ui-draggable and ui-resizable as class to widget.
                // The result is DashUI tries to remove draggable and resizable properties and fails
                if (wdata.attr == 'class') {
                    var val = that.views[wdata.view].widgets[wdata.widgets[i]].data[wdata.attr];
                    if (val.indexOf('ui-draggable') != -1 || val.indexOf('ui-resizable') != -1) {
                        var vals = val.split(' ');
                        val = '';
                        for (var j = 0; j < vals.length; j++) {
                            if (vals[j] && vals[j] != 'ui-draggable' && vals[j] != 'ui-resizable') {
                                val += ((val) ? ' ' : '') + vals[j];
                            }
                        }
                        that.views[wdata.view].widgets[wdata.widgets[i]].data[wdata.attr] = val;
                        $this.val(val);
                    }
                }

                // Update select widget dropdown
                if (wdata.attr == 'name') {
                    that.$selectActiveWidgets.find('option[value="' + wdata.widgets[i] + '"]').text(that.getWidgetName(wdata.view, wdata.widgets[i]));
                    that.$selectActiveWidgets.multiselect('refresh');
                }

                if (typeof wdata.onchange == 'function'){
                    if (wdata.css) {
                        var css = wdata.attr.substring(4);
                        wdata.onchange.call(this, that.views[wdata.view].widgets[wdata.widgets[i]].style[css]);
                    } else {
                        wdata.onchange.call(this, that.widgets[wdata.widgets[i]].data[wdata.attr]);
                    }
                }
                var changed = false;
                if (wdata.onChangeWidget) {
                    var widgetSet = $('#' + that.views[wdata.view].widgets[wdata.widgets[i]].tpl).attr('data-vis-set');
                    if (that.binds[widgetSet] && that.binds[widgetSet][wdata.onChangeWidget]) {
                        if (wdata.css) {
                            var css = wdata.attr.substring(4);
                            changed = that.binds[widgetSet][wdata.onChangeWidget](wdata.widgets[i], wdata.view, that.views[wdata.view].widgets[wdata.widgets[i]].style[css], css, true);
                        } else {
                            changed = that.binds[widgetSet][wdata.onChangeWidget](wdata.widgets[i], wdata.view, that.widgets[wdata.widgets[i]].data[wdata.attr], wdata.attr, false);
                        }
                    }
                }

                that.save();
                if (!wdata.css) that.reRenderWidgetEdit(wdata.widgets[i]);

                // Rebuild attr list
                if (changed || (depends && depends.indexOf(wdata.attr) != -1)) that.inspectWidgets();
            }

            //Update containers
            if (wdata.type == 'views') {
                // Set ths views for containers
                that.updateContainers(wdata.view);
            }
        });

        $('.group-control').each(function () {
            var group = $(this).attr('data-group');
            $(this).button({
                text: false,
                icons: {
                    primary: that.groupsState[group] ? "ui-icon-triangle-1-n" : "ui-icon-triangle-1-s"
                }
            }).css({width: 22, height: 22}).click(function () {
                var group = $(this).attr('data-group');
                that.groupsState[group] = !that.groupsState[group];
                $(this).button('option', {
                    icons: {primary: that.groupsState[group] ? "ui-icon-triangle-1-n" : "ui-icon-triangle-1-s"}
                });
                if (that.groupsState[group]) {
                    $('.group-' + group).show();

                    if (that.widgetAccordeon) {
                        //close others
                        $('.group-control').each(function () {
                            var _group = $(this).attr('data-group');
                            if (_group != group && that.groupsState[_group]) {
                                that.groupsState[_group] = false;
                                $('.group-control[data-group="' + _group + '"]').button('option', {icons: {primary: "ui-icon-triangle-1-s"}});
                                $('.group-' + _group).hide();
                            }
                        });
                    }

                } else {
                    $('.group-' + group).hide();
                }
                that.editSaveConfig('groupsState', that.groupsState);
            });
        });
    },
    extractAttributes: function (_wid_attr, widget) {

        //returns array of all attributes with groups
        /*var oneAttr = {
         name:         '',
         type:         '',
         default:      '',
         options:      '',
         notTranslate: false,
         depends:      []
         }
         Result: array of oneAttr
         */

        if (!this.regexAttr) this.regexAttr = /([a-zA-Z0-9._-]+)(\([a-zA-Z.0-9-_]*\))?(\[.*])?(\/[-_,^§~\s:\/\.a-zA-Z0-9]+)?/;
        var match = this.regexAttr.exec(_wid_attr);

        var widAttr       = match[1];
        var wid_repeats   = match[2];
        var wid_default   = match[3];
        var wid_type      = match[4];
        var wid_on_change = null;
        var wid_type_opt  = null;
        var notTranslate  = false;
        var index         = '';
        var attrDepends   = [];


        // remove /
        if (wid_type) {
            wid_type = wid_type.substring(1);
            // extract on change function
            var _parts = wid_type.split('/');
            wid_type = _parts[0];
            wid_on_change =  _parts[1];

            wid_type = wid_type.replace(/§/g, ';');
            wid_type = wid_type.replace(/~/g, '/');
            wid_type = wid_type.replace(/\^/g, '"');
            wid_type = wid_type.replace(/\^\^/g, '^');

            parts = wid_type.split(',');
            // extract min,max,step or select values
            if (parts.length > 1) {
                wid_type = parts.shift();
                wid_type_opt = parts;
            }
        }
        // remove ()
        if (wid_repeats) {
            wid_repeats = wid_repeats.substring(1, wid_repeats.length - 1);
            var parts = wid_repeats.split('-', 2);
            if (parts.length == 2) {
                wid_repeats = {
                    start: parseInt(parts[0], 10),
                    end:   parseInt(parts[1], 10)
                };
                // If end is not number, it can be attribute
                if (parts[1][0] < '0' || parts[1][0] > '9') {
                    var view         = this.getViewOfWidget(widget);
                    var widgetData   = this.views[view].widgets[widget].data;
                    wid_repeats.end = (widgetData[parts[1]] !== undefined) ? parseInt(widgetData[parts[1]], 10) : 1;
                    attrDepends.push(parts[1]);
                }

                index = wid_repeats.start;
            } else {
                throw 'Invalid repeat argument: ' + wid_repeats;
            }
        }
        // remove []
        if (wid_default) {
            wid_default = wid_default.substring(1, wid_default.length - 1);
            wid_default = wid_default.replace(/§/g, ';');
            wid_default = wid_default.replace(/~/g, '/');
            wid_default = wid_default.replace(/\^/g, '"');
            wid_default = wid_default.replace(/\^\^/g, '^');
        } else {
            wid_default = undefined;
        }

        if (widAttr == 'color') {
            wid_type = 'color';
        } else if (widAttr == 'oid' || widAttr.match(/^oid-/)) {
            wid_type = 'id';
        } else if (widAttr.match(/nav_view$/)) {
            wid_type = 'views';
        } else
        /*if (widAttr.match(/src$/)) {
         wid_type = 'image';
         } else*/
        if (widAttr == 'sound') {
            wid_type = 'sound';
        } else if (widAttr.indexOf('_effect') != -1) {
            wid_type = 'effect';
        } else if (widAttr.indexOf('_eff_opt') != -1) {
            wid_type = 'effect-options';
        }
        if (wid_type == 'nselect') {
            wid_type = 'select';
            notTranslate = true;
        }

        // Extract min, max, step for number and slider
        if ((wid_type == 'number' || wid_type == 'slider') && wid_type_opt) {
            var old = wid_type_opt;
            var wid_type_opt = {};
            if (old[0] !== undefined) {
                wid_type_opt.min = parseFloat(old[0]);
                if (old[1] !== undefined) {
                    wid_type_opt.max = parseFloat(old[1]);
                    if (old[2] !== undefined) {
                        wid_type_opt.step = parseFloat(old[2]);
                    }
                }
            }
        }
        var result = [];
        do {
            result.push({
                name:           (widAttr + index),
                type:           wid_type,
                default:        wid_default,
                options:        wid_type_opt,
                onChangeWidget: wid_on_change,
                notTranslate:   notTranslate,
                depends:        attrDepends,
                clearName:      widAttr,
                index:          index
            });
        } while (wid_repeats && ((++index) <= wid_repeats.end));
        return result;
    },
    findCommonAttributes: function (widgets) {
        var allWidgetsAttr = null;
        for (var i = 0; i < widgets.length; i++) {
            var widget = this.views[this.activeView].widgets[widgets[i]];

            if (!widget) {
                console.log('inspectWidget ' + widgets[i] + ' undefined');
                return [];
            }

            if (!widget.tpl) return false;

            var $widgetTpl = $('#' + widget.tpl);
            if (!$widgetTpl) {
                console.log(widget.tpl + " is not included");
                return [];
            }
            var widgetAttrs = $widgetTpl.attr('data-vis-attrs');
            // Combine atrributes from data-vis-attrs, data-vis-attrs0, data-vis-attrs1, ...
            var t = 0;
            var attr;
            while ((attr = $widgetTpl.attr('data-vis-attrs' + t))) {
                widgetAttrs += attr;
                t++;
            }
            if (widgetAttrs) {
                widgetAttrs = widgetAttrs.split(';');
            } else {
                widgetAttrs = [];
            }
            var group = 'common';
            var groupMode = 'normal';
            var attrs = {};
            for (var j = 0; j < widgetAttrs.length; j++) {
                if (widgetAttrs[j].match(/^group\./)) {
                    group = widgetAttrs[j].substring('group.'.length);
                    // extract group mode
                    if (group.indexOf('/') != -1) {
                        var parts = group.split('/');
                        group     = parts[0];
                        groupMode = parts[1];
                    } else {
                        groupMode = 'normal';
                    }
                    continue;
                }
                if (!widgetAttrs[j]) continue;

                var a = this.extractAttributes(widgetAttrs[j], widgets[i]);
                if (groupMode == 'byindex') {
                    for (var k = 0; k < a.length; k++) {
                        attrs[group + '_§' + k] = attrs[group + '_§' + k] || {};
                        attrs[group + '_§' + k][a[k].name] = a[k];
                    }
                } else {
                    attrs[group] = attrs[group] || {};
                    for (var k = 0; k < a.length; k++) {
                        attrs[group][a[k].name] = a[k];
                    }
                }
            }

            if (!allWidgetsAttr) {
                allWidgetsAttr = attrs;
            } else {
                // Combine these too groups
                for (group in allWidgetsAttr) {
                    if (!attrs[group]) delete allWidgetsAttr[group];
                }
                for (group in attrs) {
                    if (!allWidgetsAttr[group]) delete attrs[group];
                }
                for (group in allWidgetsAttr) {
                    for (var name in allWidgetsAttr[group]) {
                        if (!attrs[group][name]) delete allWidgetsAttr[group][name];
                    }
                    for (name in attrs[group]) {
                        if (!allWidgetsAttr[group][name]) delete attrs[group][name];
                    }
                    for (name in allWidgetsAttr[group]) {
                        var d1 = allWidgetsAttr[group][name].default;
                        delete allWidgetsAttr[group][name].default;
                        delete attrs[group][name].default;
                        if (JSON.stringify(allWidgetsAttr[group][name]) != JSON.stringify(attrs[group][name])){
                            delete allWidgetsAttr[group][name];
                        } else {
                            allWidgetsAttr[group][name].default = d1;
                        }
                    }
                }
            }
        }

        return allWidgetsAttr;
    },
    findCommonValue: function (widgets, attr, isStyle) {
        var widgetValues = [];
        var values = [];
        for (var i = 0; i < widgets.length; i++) {
            var widget = this.views[this.activeView].widgets[widgets[i]];
            var obj = isStyle ? widget.style : widget.data;
            var val = (isStyle && (!obj || obj[attr] === undefined)) ? '' : (obj ? obj[attr] : '');

            widgetValues[i] = val;
            if (values.indexOf(val) === -1) values.push(val);
        }
        if (values.length == 1) {
            return values[0];
        } else {
            return {
                values:       values,
                widgetValues: widgetValues
            };
        }
    },
    setAttrValue: function (widgets, attr, isStyle, values) {
        var $input = $('#inspect_' + attr);
        if (isStyle && attr.substring(0, 4) == 'css_') attr = attr.substring(4);

        if (values[attr] === undefined) values[attr] = this.findCommonValue(widgets, attr, isStyle);
        if ($input.attr('type') == 'checkbox') {
            if (typeof values[attr] == 'object') {
                $input.prop('indeterminate', true);
            } else {
                $input.prop('checked', values[attr]);
            }
        } else {
            if (typeof values[attr] == 'object') {
                $input.addClass('vis-edit-different').val(_('--different--')).data('value', values[attr]).data('different', true);
                $input.autocomplete({
                    minLength: 0,
                    source: function (request, response) {
                        var data = $.grep(this.element.data('value').values, function (value) {
                            if (value === undefined || value === null) return false;
                            value = value.toString();
                            return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
                        });
                        response(data);
                    },
                    select: function (event, ui) {
                        $(this).val(ui.item.value).trigger('change');
                    },
                    change: function (event, ui) {
                        //$(this).trigger('change');
                    }
                }).focus(function (event, ui) {
                    if ($(this).data('different')) {
                        $(this).val('');
                    }
                    $(this).autocomplete('search', '');
                }).blur(function (event, ui) {
                    if ($(this).data('different')) {
                        $(this).val(_('--different--')).addClass('vis-edit-different');
                    }
                });
            } else {
                $input.val(values[attr]);
            }
        }
        $input.keyup(function () {
            var $this = $(this);
            var timer = $this.data('timer');
            if (timer) clearTimeout(timer);

            $this.data('timer', setTimeout(function () {
                $this.data('timer', null);
                $this.trigger('change');
            }, 500));
        });
    },
    inspectWidgets: function (addWidget, delWidget, onlyUpdate) {
        if (this.isStealCss) return false;

        // Deselect all elements
        $(':focus').blur();

        // Hide context menu
        $('#context_menu').hide();

        if (typeof addWidget == 'boolean') {
            onlyUpdate = addWidget;
            addWidget = undefined;
            delWidget = undefined;
        }
        if (addWidget) {
            if (typeof addWidget == 'object') {
                this.activeWidgets = addWidget;
            } else {
                if (this.activeWidgets.indexOf(addWidget) === -1) this.activeWidgets.push(addWidget);
            }
        }
        if (typeof delWidget == 'string') {
            var pos = this.activeWidgets.indexOf(delWidget);
            if (pos != -1) this.activeWidgets.splice(pos, 1);
        }
        var that = this;
        var wid  = this.activeWidgets[0] || 'none';
        // find view
        var view = this.getViewOfWidget(wid);

        if (!onlyUpdate) {
            this.alignIndex = 0;

            var s = JSON.stringify(this.activeWidgets);
            if (JSON.stringify(this.views[this.activeView].activeWidgets) != s) {
                this.views[this.activeView].activeWidgets = JSON.parse(s);
                // Store selected widgets
                this.save();
            }

            //this.$selectActiveWidgets.find('option[value="' + wid + '"]').prop('selected', true);
            //this.$selectActiveWidgets.multiselect('refresh');
            var $widget;
            var select   = [];
            var deselect = [];

            for (var i = 0; i < this.activeWidgets.length; i++) {
                if (this.oldActiveWidgets.indexOf(this.activeWidgets[i]) === -1) select.push(this.activeWidgets[i]);
            }
            for (i = 0; i < this.oldActiveWidgets.length; i++) {
                if (this.activeWidgets.indexOf(this.oldActiveWidgets[i]) === -1) deselect.push(this.oldActiveWidgets[i]);
            }

            // Deselect unselected widgets
            for (i = 0; i < deselect.length; i++) {
                this.showWidgetHelper(deselect[i], false);
                var $widget = $('#' + deselect[i]);
                $widget.removeClass('ui-selected');
                this.$selectActiveWidgets.find('option[value="' + deselect[i] + '"]').removeAttr('selected');

                if ($widget.hasClass('ui-draggable')) {
                    try {
                        $widget.draggable('destroy');
                    } catch (e) {
                        this.conn.logError('inspectWidget - Cannot destroy draggable ' + deselect[i] + ' ' + e);
                    }
                }

                if ($widget.hasClass('ui-resizable')) {
                    try {
                        $widget.resizable('destroy');
                    } catch (e) {
                        this.conn.logError('inspectWidget - Cannot destroy resizable ' + deselect[i] + ' ' + e);
                    }
                }
            }
            // disable resize if widget not more selected alone
            if (this.oldActiveWidgets.length == 1 && this.activeWidgets.length != 1) {
                var $widget = $('#' + this.oldActiveWidgets[0]);
                if ($widget.hasClass('ui-resizable')) {
                    try {
                        $widget.resizable('destroy');
                    } catch (e) {
                        this.conn.logError('inspectWidget - Cannot destroy resizable ' + deselect[i] + ' ' + e);
                    }
                }
            }

            // Select selected widgets
            for (var p = 0; p < select.length; p++) {
                try {
                    $widget = $('#' + select[p]);
                    this.$selectActiveWidgets.find('option[value="' + select[p] + '"]').attr('selected', 'selected');
                    this.showWidgetHelper(select[p], true);

                    if(!$("#wid_all_lock_d").hasClass("ui-state-active")) {
                        this.draggable($widget);
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            // Enable disable buttons
            if (this.activeWidgets.length) {
                $('#rib_wid_del').button('enable');
                $('#rib_wid_copy').button('enable');
                $('#rib_wid_doc').button('enable');
                $('#export_widgets').button('enable');
            } else {
                $('#rib_wid_del').button('disable');
                $('#rib_wid_copy').button('disable');
                $('#rib_wid_doc').button('disable');
                $('#export_widgets').button('disable');
            }

            if (this.activeWidgets.length == 1) {
                try {
                    $widget = $('#' + this.activeWidgets[0]);
                    if (!$widget.hasClass('ui-resizable') && (!this.widgets[wid].data._no_resize)) {
                        this.resizable($widget);
                    }
                } catch (e) {
                    console.log(e);
                }
            }
            this.oldActiveWidgets = [];
            for (var k = 0; k < this.activeWidgets.length; k++) {
                this.oldActiveWidgets.push(this.activeWidgets[k]);
            }
            // update selected widgets dropdown
            this.$selectActiveWidgets.multiselect('refresh');

            // Disable copy widget if was active
            $("#rib_wid_copy_cancel").trigger('click');

            this.actualAttrs = this.findCommonAttributes(this.activeWidgets);
        }

        var $widgetAttrs = $('#widget_attrs');
        this.groups = {};
        // Clear Inspector
        $widgetAttrs.html('');

        if (!wid || wid === 'none') {
            // Switch tabs to View settings
            $('#pan_attr').tabs('option', 'disabled', [1]).tabs({active: 0});
            $('#widget_tab').text(_("Widget"));
            return false;
        }
        $('#pan_attr').tabs('option', 'disabled', []).tabs({active: 1});
        $('#widget_tab').text(_("Widget") + ": " + ((this.activeWidgets.length == 1) ? wid : this.activeWidgets.length));

        var widget = this.views[this.activeView].widgets[wid];

        if (!widget) {
            console.log('inspectWidget ' + wid + ' undefined');
            return false;
        }

        if (!widget.tpl) return false;

        var $widgetTpl = $('#' + widget.tpl);
        if (!$widgetTpl) {
            console.log(widget.tpl + " is not included");
            return false;
        }
        var widgetAttrs = $widgetTpl.attr('data-vis-attrs');
        // Combine atrributes from data-vis-attrs, data-vis-attrs0, data-vis-attrs1, ...
        var t = 0;
        var attr;
        while ((attr = $widgetTpl.attr('data-vis-attrs' + t))) {
            widgetAttrs += attr;
            t++;
        }
        if (widgetAttrs) {
            widgetAttrs = widgetAttrs.split(';');
        } else {
            widgetAttrs = [];
        }
        var widgetFilter = $widgetTpl.attr('data-vis-filter');

        $('#inspect_comment_tr').show();
        $('#inspect_class_tr').show();
        var widgetDiv = document.getElementById(wid);

        $widgetAttrs.css({"width": "100%"});

        // Add fixed attributes
        var group = 'fixed';
        this.addToInspect(this.activeWidgets, 'name',      group);
        this.addToInspect(this.activeWidgets, 'comment',   group);
        this.addToInspect(this.activeWidgets, 'class',     group);
        this.addToInspect(this.activeWidgets, {name: 'filterkey', type: 'auto', options: this.updateFilter()}, group);
        this.addToInspect(this.activeWidgets, {name: 'views',     type: 'select-views'}, group);
        this.addToInspect(this.activeWidgets, {name: 'locked',    type: 'checkbox'}, group);

        group = 'visibility';
        this.addToInspect(this.activeWidgets, {name: 'visibility-oid', type: 'id'},   group);
        this.addToInspect(this.activeWidgets, {name: 'visibility-cond', type: 'select', options: ['==','!=','<=','>=','<','>','consist'], default: '=='},   group);
        this.addToInspect(this.activeWidgets, {name: 'visibility-val', default: 1},     group);
        this.addToInspect('delimiter', group);
        // Edit all attributes
        group = 'common';
        for (group in this.actualAttrs) {
            for (var attr in this.actualAttrs[group]) {
                this.addToInspect(this.activeWidgets, this.actualAttrs[group][attr], group);
            }
        }

        this.addToInspect('delimiter', group);
        // Add common css
        this.editCssCommon();
        this.editCssFontText();
        this.editCssBackground();
        this.editCssBorder();
        this.editCssShadowPadding();
        //this.editCssAnimation();

        // Rerender all widgets, where default values applied
        if (this.reRenderList && this.reRenderList.length) {
            for (var r = 0; r < this.reRenderList.length; r++) {
                this.reRenderWidgetEdit(this.reRenderList[r]);
            }
            this.reRenderList = [];
        }

        this.showInspect(view, this.activeWidgets);

        // snap objects to the grid, elsewise cannot move
        if (this.views[view].settings.snapType == 2) {
            this.gridWidth = parseInt(this.views[view].settings.gridSize);

            if (this.gridWidth < 1 || isNaN(this.gridWidth)) this.gridWidth = 10;

            for (var i = 0; i < this.activeWidgets.length; i++) {
                var $this = $('#' + this.activeWidgets[i]);
                var x = parseInt($this.css('left'));
                var y = parseInt($this.css('top'));

                x = Math.round(x / this.gridWidth) * this.gridWidth;
                y = Math.round(y / this.gridWidth) * this.gridWidth;

                $this.css({'left': x, 'top': y});
                this.showWidgetHelper(this.activeWidgets[i], true);
            }
        }

        // Put all view names in the select element
        $('#inspect_views').html('');
        // TODO
        var views = this.getViewsOfWidget(this.activeWidgets[0]);
        for (var v in this.views) {
            if (v != this.activeView) {
                var selected = '';
                for (var i = 0; i < views.length; i++) {
                    if (views[i] == v) {
                        selected = 'selected';
                        break;
                    }
                }
                $('#inspect_views').append('<option value=\'' + v + "' " + selected + ">" + v + "</option>");
            }
        }

        $('#inspect_views').multiselect({
            maxWidth: 180,
            height: 260,
            noneSelectedText: _('Single view'),
            selectedText: function (numChecked, numTotal, checkedItems) {
                var text = '';
                for (var i = 0; i < checkedItems.length; i++) {
                    text += (!text ? '' : ",") + checkedItems[i].title;
                }
                return text;
            },
            multiple: true,
            checkAllText: _('Check all'),
            uncheckAllText: _('Uncheck all'),
            close: function () {
                if ($('#inspect_views').data('changed')) {
                    $('#inspect_views').data('changed', false);
                    that.syncWidgets(that.activeWidgets, $(this).val());
                    that.save();
                }
            }
            //noneSelectedText: _("Select options")
        }).change(function () {
            $('#inspect_views').data('changed', true);
            //that.syncWidgets(that.activeWidgets, $(this).val());
            //that.save();
        }).data('changed', false);

        $("#inspect_views").next().css('width', '100%');

        // If tab Widget is not selected => select it
        if ($('#menu_body').tabs('option', 'active') == 1) {
            $('#menu_body').tabs({'active': 2});
        }
    }
});