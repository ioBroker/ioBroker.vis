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
// onChangeFunc has following attributes (widgetID, view, newId, attr, isCss) and must return back the array with changed attributes or null
// Type format: id - Object ID Dialog
//              hid
//              checkbox
//              image - image
//              number,min,max,step - non-float number. min,max,step are optional
//              dimension - text input with button for px or %
//              color - color picker
//              views - Name of the view
//              effect - jquery UI show/hide effects
//              eff_opt - additional option to effect slide (up, down, left, right)
//              fontname - Font name
//              slider,min,max,step - Default step is ((max - min) / 100)
//              select,value1,value2,... - dropdown select
//              nselect,value1,value2,... - same as select, but without translation of items
//              auto,value1,value2,... - autocomplete
//              style,fileFilter,nameFilter,attrFilter
//              custom,functionName,options,... - custom editor - functionName is starting from vis.binds.[widgetset.funct]. E.g. custom/timeAndWeather.editWeather,short
//              group.name - define new or old group. All following attributes belongs to new group till new group.xyz
//              group.name/byindex/icon - like group, but all following attributes will be grouped by ID. Icon is optional. Like group.windows/byindex;slide(1-4)/id;slide_type(1-4)/select,open,closed  Following groups will be created Windows1(slide1,slide_type1), Windows2(slide2,slide_type2), Windows3(slide3,slide_type3), Windows4(slide4,slide_type4)
//              text - dialog box with html editor
//              html - dialog box with html editor
//              widget - existing widget selector
//              history - select history instances
//              password - password

'use strict';

vis = $.extend(true, vis, {
    fontNames: [
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
        '"Comic Sans MS", cursive'
    ],
    editObjectID:       function (widAttr, widgetFilter, isHistory, onChange) {
        var that = this;
        if (typeof isHistory === 'function') {
            onChange = isHistory;
            isHistory = false;
        }

        if (onChange && onChange.match(/^filterType/)) {
            var typeFilter = onChange.substring('filterType'.length).toLowerCase();

            // Select
            var tLine = {
                input: '<select type="text" id="inspect_' + widAttr + '">'
            };
            if (onChange) {
                tLine.onchange = onChange;
            }

            // get values
            var values = Object.keys(that.objects)
                .filter(function (id) {return that.objects[id].type === typeFilter})
                .filter(function (id) {return typeFilter !== 'chart' || id.match(/^echarts\./)})
                .sort();

            if (values.length && values[0] !== undefined) {
                for (var t = 0; t < values.length; t++) {
                    tLine.input += '<option value="' + values[t] + '">' + values[t] + '</option>';
                }
            }
            tLine.input += '</select>';
            return tLine;
        }

        // Edit for Object ID
        var line = [
            {
                input: '<input type="text" id="inspect_' + widAttr + '" data-onchange="' + (onChange || '') + '">'
            }
        ];

        if (this.objectSelector) {
            line[0].button = {
                icon: 'ui-icon-note',
                text: false,
                title: _('Select object ID'),
                click: function () {
                    var wdata = $(this).data('wdata');

                    $('#dialog-select-member-' + wdata.attr).selectId('show', that.views[wdata.view].widgets[wdata.widgets[0]].data[wdata.attr], function (newId, oldId) {
                        if (oldId !== newId) {
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
                                    if (that.objects[newId].common.workingID.indexOf('.') !== -1) {
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
                             (that.objects[newId]['Type'] === 'STATE' ||
                             that.objects[newId]['Type'] === 'LEVEL')) {

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
                             if ($filterkey.val() === '') {
                             var oid = newId;
                             var func = null;
                             if (that.metaIndex && that.metaIndex['ENUM_FUNCTIONS']) {
                             while (oid && that.objects[oid]) {
                             for (var t = 0; t < that.metaIndex['ENUM_FUNCTIONS'].length; t++) {
                             var list = that.objects[that.metaIndex['ENUM_FUNCTIONS'][t]];
                             for (var z = 0; z < list['Channels'].length; z++) {
                             if (list['Channels'][z] === oid) {
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

            line[0].onchange = function (val, oldValue) {
                var wdata = $(this).data('wdata');
                $('#inspect_' + wdata.attr + '_desc').html(that.getObjDesc(val));
                var userOnchange = $(this).data('onchange');
                if (userOnchange) {
                    for (var w = 0; w < wdata.widgets.length; w++) {
                        var widgetSet = $('#' + that.views[wdata.view].widgets[wdata.widgets[w]].tpl).attr('data-vis-set');
                        if (that.binds[widgetSet] && that.binds[widgetSet][userOnchange]) {
                            return that.binds[widgetSet][userOnchange](wdata.widgets[w], wdata.view, that.widgets[wdata.widgets[w]].data[wdata.attr], wdata.attr, false, oldValue);
                        }
                    }
                }
            };

            line.push({input: '<div id="inspect_' + widAttr + '_desc"></div>'});

            var $dialog = $('#dialog-select-member-' + widAttr);
            // Init select dialog
            if (!$dialog.length) {
                $('body').append('<div id="dialog-select-member-' + widAttr + '" style="display: none"></div>');
                $('#dialog-select-member-' + widAttr).selectId('init', {
                    filter: {
                        common: {
                            history: isHistory ? {
                                enabled: true
                            } : undefined
                        }
                    },
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
                $dialog.selectId('option', 'filterPresets', {role: widgetFilter});
                $dialog.selectId('option', 'filter', {
                    common: {
                        history: isHistory ? {
                            enabled: true
                        } : undefined
                    }
                });
            }
        }

        return line;
    },
    editWidgetNames:    function (widAttr, options) {
        // options[0] all views
        var widgets =  [''];
        if (options && options[0] === 'all') {
            for (var w in this.widgets) {
                widgets.push(w);
            }
        } else {
            for (var w in this.views[this.activeView].widgets) {
                widgets.push(w);
            }
        }

        return this.editSelect(widAttr, widgets, true);
    },
    editSelect:         function (widAttr, values, notTranslate, init, onchange) {
        if (typeof notTranslate === 'function') {
            onchange = init;
            init = notTranslate;
            notTranslate = false;
        }

        // Select
        var line = {
            input: '<select type="text" id="inspect_' + widAttr + '">'
        };
        if (onchange) {
            line.onchange = onchange;
        }
        if (init) {
            line.init = init;
        }
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
    editStyle:          function (widAttr, options) {
        var that = this;
        // options[0] fileFilter
        // options[1] nameFilter
        // options[2] attrFilter
        // Effect selector
        return {
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
    },
    editFontName:       function (widAttr) {
        var that = this;
        // Auto-complete
        return {
            input: '<input type="text" id="inspect_' + widAttr + '" class="vis-edit-textbox"/>',
            init: function (_wid_attr, data) {
                $(this).autocomplete({
                    minLength: 0,
                    source: function (request, response) {
                        var _data = $.grep(that.fontNames, function (value) {
                            return value.substring(0, request.term.length).toLowerCase() === request.term.toLowerCase();
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
                }).autocomplete('instance')._renderItem = function (ul, item) {
                    return $('<li>')
                        .append('<a><span style="font-family: ' + item.label + '">' + item.label + '(En, Рус, Äü)</span></a>')
                        .appendTo(ul);
                };
            }
        };
    },
    editHistoryInstance: function (widAttr) {
        if (!this.historyInstances) {
            for (var id in this.objects) {
                if (this.objects[id].type === 'instance' && this.objects[id].common && this.objects[id].common.type === 'storage') {
                    this.historyInstances = this.historyInstances || [];
                    id = id.substring('system.adapter.'.length);
                    if (this.historyInstances.indexOf(id) === -1) this.historyInstances.push(id);
                }
            }
        }

        return this.editAutoComplete(widAttr, this.historyInstances);
    },
    editClass:          function (widAttr) {
        var that = this;
        if (!this.styleClasses) {
            this.styleClasses = [];
            var classes = vis.styleSelect.collectClasses();
            var reg = /^vis-style-/;
            for (var c in classes) {
                if (reg.test(c) && this.styleClasses.indexOf(c) === -1) this.styleClasses.push(c);
            }
            classes = null;
        }

        return this.editAutoComplete(widAttr, this.styleClasses);
    },
    editAutoComplete:   function (widAttr, values) {
        // Auto-complete
        return {
            input: '<input type="text" id="inspect_' + widAttr + '" class="vis-edit-textbox"/>',
            init: function (_wid_attr, data) {
                $(this).autocomplete({
                    minLength: 0,
                    source: function (request, response) {
                        var _data = $.grep(values, function (value) {
                            return value.substring(0, request.term.length).toLowerCase() === request.term.toLowerCase();
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
    },
    _editSetFontColor:  function (element) {
        try {
            var r;
            var b;
            var g;
            var hsp;
            var $element = $('#' + element);
            var a = $element.css('background-color');
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
                $element.css('color', '#000000');
            } else {
                $element.css('color', '#FFFFFF');
            }
        } catch (err) {

        }
    },
    editColor:          function (widAttr) {
        var that = this;
        var line = {
            input: '<input type="text" id="inspect_' + widAttr + '"/>',
            onchange: function (value) {
                $(this).css('background-color', value || '');
                that._editSetFontColor('inspect_' + widAttr);
            }
        };
        if ((typeof colorSelect !== 'undefined' && $().farbtastic)) {
            line.button = {
                icon: 'ui-icon-note',
                text: false,
                title: _('Select color'),
                click: function (/*event*/) {
                    var wdata = $(this).data('wdata');
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
    editViewName:       function (widAttr) {
        var views = [''];
        for (var v in this.views) {
            if (!this.views.hasOwnProperty(v) || v === '___settings') continue;
            views.push(v);
        }

        return this.editAutoComplete(widAttr, views);
    },
    editFilterName:     function (widAttr) {
        var filters = this.updateFilter();
        filters.unshift('');

        //return this.editSelect(widAttr, filters, true);
        return this.editAutoComplete(widAttr, filters);
    },
    editEffect:         function (widAttr) {
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
            if (_widAttr.indexOf('_effect') !== -1) {
                var eff = _widAttr.replace('_effect', '_options');
                var $elem = $('#inspect_' + eff);
                if ($elem.length) {
                    if (data === 'slide') {
                        that.hideShowAttr(eff, true);
                    } else {
                        that.hideShowAttr(eff, false);
                        $elem.val('').trigger('change');
                    }
                }
            }
        });
    },
    editNumber:         function (widAttr, options, onchange) {
        // options = {min: ?,max: ?,step: ?}
        // Select
        var line = {
            input: '<input id="inspect_' + widAttr + '" style="width: calc(100% - 2px);"/>',
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
                    $(this).parent().css({width: 'calc(100% - 2px)'});
                } else {
                    $(this).parent().css({width: 'calc(100% - 8px)'});
                }
                // Allow only numbers
                $(this).on('keypress', function(e) {
                    var code = e.keyCode || e.charCode;
                    return (code >= 48 && code <= 57) || (code === 110);
                });
            }
        };
        if (onchange) line.onchange = onchange;
        return line;
    },
    editDimension: function (widAttr, options, onchange) {
        var line = {
            input: '<input class="vis-edit-textbox-with-button" type="text" id="inspect_' + widAttr + '"/><button class="vis-edit-dimension-calc" data-attr="' + widAttr + '"></button>',
            init: function (w, data) {
                var $btn = $(this).parent().children('.vis-edit-dimension-calc');
                var val = $(this).val();

                if (val.toString().indexOf('%') === -1 && val.toString().indexOf('px') === -1) {
                    if (val) {
                        if (!isNaN(val)) {
                            $(this).val(val + 'px').trigger('change');
                        } else {
                            $(this).val('').trigger('change');
                        }
                    }
                    $btn.html('px');
                } else if (val.toString().indexOf('%') === -1) {
                    $btn.html('px');
                } else {
                    $btn.html('%');
                }

                $btn.button().css({ width: 18, height: 18 }).click(function () {
                    var attr = $(this).data('attr');
                    var $input = $(this).parent().children('#inspect_' + attr);
                    var val = $input.val();

                    if (val.toString().indexOf('%') === -1 && val.toString().indexOf('px') === -1) {
                        $(this).html('px');
                        $input.val(val + 'px');
                    } else if (val.toString().indexOf('%') === -1) {
                        // convert to %
                        $(this).html('%');
                        $input.val(val.replace('px', '%'));
                    } else {
                        // convert to px
                        $(this).html('px');
                        if (val.toString().indexOf('px') === -1) {
                            $input.val(val.replace('%', 'px'));
                        } else {
                            $input.val(val + 'px');
                        }
                    }

                    $input.trigger('change');
                });
            }
        };
        if (onchange) line.onchange = onchange;
        return line;
    },
    editButton:         function (widAttr, options, onchange) {
        // options = {min: ?,max: ?,step: ?}
        // Select
        var line = {
            input: '<button id="inspect_' + widAttr + '">' + widAttr + '</button>',
            init: function (w, data) {
                $(this).button().click(function () {
                    $(this).val(true).trigger('change');
                });
            }
        };
        if (onchange) line.onchange = onchange;
        return line;
    },
    editUrl:            function (widAttr, filter) {
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
                    var wdata = $(this).data('wdata');
                    var defPath = ('/' + (that.conn.namespace ? that.conn.namespace + '/' : '') + that.projectPrefix + 'img/');

                    var current = that.widgets[wdata.widgets[0]].data[wdata.attr];
                    //workaround, that some widgets calling direct the img/picure.png without /vis/
                    if (current && current.substring(0, 4) === 'img/') {
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
    editCustom:         function (widAttr, options) {
        if (!options) {
            console.log('No path to custom function');
        } else {
            var funcs = options[0].split('.');
            options.unshift();
            if (funcs[0] === 'vis') funcs.unshift();
            if (funcs[0] === 'binds') funcs.unshift();
            if (funcs.length === 1) {
                if (typeof this.binds[funcs[0]] === 'function') {
                    return this.binds[funcs[0]](widAttr, options);
                } else {
                    console.log('No function: vis.binds.' + funcs.join('.'));
                }
            } else if (funcs.length === 2) {
                if (this.binds[funcs[0]] && typeof this.binds[funcs[0]][funcs[1]] === 'function') {
                    return this.binds[funcs[0]][funcs[1]](widAttr, options);
                } else {
                    console.log('No function: vis.binds.' + funcs.join('.'));
                }
            } else if (funcs.length === 3) {
                if (this.binds[funcs[0]] && this.binds[funcs[0]][funcs[1]] && typeof this.binds[funcs[0]][funcs[1]][funcs[2]] === 'function') {
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
    editSlider:         function (widAttr, options) {
        options.min = (!options.min) ? 0 : options.min;
        options.max = (!options.max) ? 0 : options.max;
        options.step = (!options.step) ? (options.max - options.min) / 100 : options.step;
        return {
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
    },
    editEnableAbsolute: function () {
        var val = $('#inspect_css_position').val();
        if (val === 'relative' || val === 'static' || val === 'sticky') {
            // disable
            $('#inspect_css_left').val('').prop('disabled', true);
            $('#inspect_css_top').val('').prop('disabled', true);
            $('#inspect_css_display').prop('disabled', false);
        } else {
            // enable
            $('#inspect_css_left').prop('disabled', false);
            $('#inspect_css_top').prop('disabled', false);
            $('#inspect_css_display').val('').prop('disabled', true);
        }
    },
    editCssCommon:      function (viewDiv, view) {
        var that = this;
        var group = 'css_common';
        this.groups[group] = this.groups[group] || {};

        this.groups[group].css_position      = this.editSelect('css_position', ['', /*'absolute', 'fixed',*/ 'relative', /*'static', */'sticky'], true, function () {
            $(this).data('old-value', $(this).val());
        }, function () {
            var val = $('#inspect_css_position').val();
            var oldVal = $(this).data('old-value');

            if (val === 'relative' || val === 'static' || val === 'sticky') {
                if (oldVal !== 'relative' && oldVal !== 'static' && oldVal !== 'sticky') {
                    $(this).data('old-value', val);
                    // disable
                    $('#inspect_css_display').prop('disabled', false);
                    $('#inspect_css_left').val('').prop('disabled', true).trigger('change');
                    $('#inspect_css_top').val('').prop('disabled', true).trigger('change');
                    setTimeout(function () {
                        for (var r = 0; r < that.activeWidgets.length; r++) {
                            that.reRenderWidgetEdit(viewDiv, view, that.activeWidgets[r]);
                        }
                    } , 100);
                }
            } else {
                if (oldVal === 'relative' || oldVal === 'static' || oldVal === 'sticky') {
                    $(this).data('old-value', val);
                    // enable
                    $('#inspect_css_left').prop('disabled', false).val('0px').trigger('change');
                    $('#inspect_css_top').prop('disabled', false).val('0px').trigger('change');
                    $('#inspect_css_display').prop('disabled', true);

                    setTimeout(function () {
                        for (var r = 0; r < that.activeWidgets.length; r++) {
                            that.reRenderWidgetEdit(viewDiv, view, that.activeWidgets[r]);
                        }
                    } , 100);
                }
            }
        });
        this.groups[group].css_display       = this.editSelect('css_display', ['', /*'inline', 'block', */'inline-block'/*, 'flex', 'list-item', 'run-in'*/], true, this.editEnableAbsolute);

        this.groups[group].css_left          = {input: '<input class="vis-edit-textbox-with-button" type="text" id="inspect_css_left"/><button class="vis-edit-percent-calc" data-attr="left"></button>', init: this.editEnableAbsolute};
        this.groups[group].css_top           = {input: '<input class="vis-edit-textbox-with-button" type="text" id="inspect_css_top"/><button class="vis-edit-percent-calc" data-attr="top"></button>', init: this.editEnableAbsolute};
        this.groups[group].css_width         = {input: '<input class="vis-edit-textbox-with-button" type="text" id="inspect_css_width"/><button class="vis-edit-percent-calc" data-attr="width"></button>'};
        this.groups[group].css_height        = {input: '<input class="vis-edit-textbox-with-button" type="text" id="inspect_css_height"/><button class="vis-edit-percent-calc" data-attr="height"></button>'};

        this.groups[group]['css_z-index']    = this.editNumber('css_z-index');
        this.groups[group]['css_overflow-x'] = this.editSelect('css_overflow-x', ['', 'visible', 'hidden', 'scroll', 'auto', 'initial', 'inherit'], true);
        this.groups[group]['css_overflow-y'] = this.editSelect('css_overflow-y', ['', 'visible', 'hidden', 'scroll', 'auto', 'initial', 'inherit'], true);
        this.groups[group].css_opacity       = {input: '<input type="text" id="inspect_css_opacity"/>'};
        this.groups[group].css_cursor        = this.editAutoComplete('css_cursor', ['', 'pointer', 'auto', 'alias', 'all-scroll', 'cell', 'context-menu', 'col-resize', 'copy', 'crosshair', 'default', 'e-resize', 'ew-resize', 'grab', 'grabbing', 'help', 'move', 'n-resize', 'ne-resize', 'nesw-resize', 'ns-resize', 'nw-resize', 'nwse-resize', 'no-drop', 'none', 'not-allowed', 'progress', 'row-resize', 's-resize', 'se-resize', 'sw-resize', 'text', 'vertical-text', 'w-resize', 'wait', 'zoom-in', 'zoom-out', 'initial', 'inherit']);
        this.groups[group].css_transform     = {input: '<input type="text" id="inspect_css_transform"/>'};

        for (var attr in this.groups[group]) {
            if (!this.groups[group].hasOwnProperty(attr)) continue;
            this.groups[group][attr].css       = true;
            this.groups[group][attr].attrName  = attr;
            this.groups[group][attr].attrIndex = '';
        }
    },
    editCssFontText:    function () {
        var group = 'css_font_text';
        this.groups[group] = this.groups[group] || {};

        this.groups[group].css_color             = this.editColor('css_color');
        this.groups[group]['css_text-align']     = this.editSelect('css_text-align', ['', 'left', 'right', 'center' ,'justify', 'initial', 'inherit'], true);
        this.groups[group]['css_text-shadow']    = {input: '<input type="text" id="inspect_css_text-shadow"/>'};
        this.groups[group]['css_font-family']    = this.editFontName('css_font-family');
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
    editCssBackground:  function () {
        var group = 'css_background';
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
        if (value && typeof value !== 'object') {
            var e = value.substring(value.length - 2);
            if (e !== 'px' && e !== 'em' && value[value.length - 1] !== '%') {
                var wdata = $(elem).data('wdata');
                for (var t = 0; t < wdata.widgets.length; t++) {
                    this.views[wdata.view].widgets[wdata.widgets[t]].style[wdata.attr.substring(4)] = value + 'px';
                    $('#' + wdata.widgets[t]).css(wdata.attr.substring(4), value + 'px');
                }
            }
        }
    },
    editCssBorder:      function () {
        var group = 'css_border';
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
            if (!this.groups[group].hasOwnProperty(attr)) continue;
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
    editCssAnimation:   function () {
        var group = 'css_animation';
        this.groups[group] = this.groups[group] || {};

        this.groups[group]['css_animation-name']     = {input: '<input type="text" id="inspect_css_animation-name"/>'};
        this.groups[group]['css_animation-duration'] = {input: '<input type="text" id="inspect_css_animation-duration"/>'};

        for(var attr in this.groups[group]) {
            this.groups[group][attr].css      = true;
            this.groups[group][attr].attrName  = attr;
            this.groups[group][attr].attrIndex = '';
        }
    },
    editSignalIcons:    function () {
        var group = 'signals';
        this.groups[group] = this.groups[group] || {};
        var i = 0;
        for (var i = 0; i < 3; i++) {
            // oid
            this.addToInspect(this.activeWidgets, {name: 'signals-oid-'  + i, type: 'id'},   group);
            // condition
            this.addToInspect(this.activeWidgets, {name: 'signals-cond-' + i, type: 'select', options: ['==', '!=', '<=', '>=', '<', '>', 'consist', 'not consist', 'exist', 'not exist'], default: '=='}, group);
            // value
            this.addToInspect(this.activeWidgets, {name: 'signals-val-'  + i, default: true},   group);

            // icon path
            this.addToInspect(this.activeWidgets, {name: 'signals-icon-' + i, type: 'image', default: '/vis/signals/lowbattery.png'}, group);
            // icon size in px
            this.addToInspect(this.activeWidgets, {name: 'signals-icon-size-' + i, type: 'slider', options: {min: 1, max: 120, step: 1}, default: 0}, group);
            // icon style
            this.addToInspect(this.activeWidgets, {name: 'signals-icon-style-' + i}, group);

            // icon text
            this.addToInspect(this.activeWidgets, {name: 'signals-text-' + i}, group);
            // text style
            this.addToInspect(this.activeWidgets, {name: 'signals-text-style-' + i}, group);
            // text class
            this.addToInspect(this.activeWidgets, {name: 'signals-text-class-' + i}, group);
            // blink
            this.addToInspect(this.activeWidgets, {name: 'signals-blink-' + i, type: 'checkbox', default: false}, group);


            // icon position vertical
            this.addToInspect(this.activeWidgets, {name: 'signals-horz-' + i, type: 'slider', options: {min: -20, max: 120, step: 1}, default: 0}, group);
            // icon position horizontal
            this.addToInspect(this.activeWidgets, {name: 'signals-vert-' + i, type: 'slider', options: {min: -20, max: 120, step: 1}, default: 0}, group);

            // icon hide by edit
            this.addToInspect(this.activeWidgets, {name: 'signals-hide-edit-' + i, type: 'checkbox', default: false}, group);

            if (i < 2) this.addToInspect('delimiterInGroup', group);
        }

    },
    editChart:          function () {
        var group = 'echart';
        this.groups[group] = this.groups[group] || {};
        this.addToInspect(this.activeWidgets, {name: 'echart-oid', type: 'id', onChangeWidget: 'filterTypeChart'}, group);
    },
    editLastChange:     function () {
        var group = 'last_change';
        this.groups[group] = this.groups[group] || {};
        // oid
        this.addToInspect(this.activeWidgets, {name: 'lc-oid', type: 'id'},   group);
        // type (or timestamp)
        this.addToInspect(this.activeWidgets, {name: 'lc-type', type: 'select', options: ['last-change', 'timestamp'], default: 'last-change'}, group);
        // is interval
        this.addToInspect(this.activeWidgets, {name: 'lc-is-interval', type: 'checkbox', default: true}, group);
        // is moment.js
        this.addToInspect(this.activeWidgets, {name: 'lc-is-moment', type: 'checkbox', default: false}, group);
        // format
        this.addToInspect(this.activeWidgets, {name: 'lc-format', type: 'auto', options: ['YYYY.MM.DD hh:mm:ss','DD.MM.YYYY hh:mm:ss','YYYY.MM.DD','DD.MM.YYYY','YYYY/MM/DD hh:mm:ss','YYYY/MM/DD','hh:mm:ss'], default: ''}, group);
        // position vertical
        this.addToInspect(this.activeWidgets, {name: 'lc-position-vert', type: 'select', options: ['top', 'middle', 'bottom'], default: 'top'},   group);
        // position horizontal
        this.addToInspect(this.activeWidgets, {name: 'lc-position-horz', type: 'select', options: ['left', /*'middle', */'right'], default: 'right'},   group);
        // offset vertical
        this.addToInspect(this.activeWidgets, {name: 'lc-offset-vert', type: 'slider', options: {min: -120, max: 120, step: 1}, default: 0},   group);
        // offset horizontal
        this.addToInspect(this.activeWidgets, {name: 'lc-offset-horz', type: 'slider', options: {min: -120, max: 120, step: 1}, default: 0},   group);

        this.addToInspect('delimiterInGroup', group);

        // font-size
        this.addToInspect(this.activeWidgets, {name: 'lc-font-size', type: 'auto', options: ['', 'medium', 'xx-small', 'x-small', 'small', 'large', 'x-large', 'xx-large', 'smaller', 'larger', 'initial', 'inherit'], default: '12px'}, group);
        // font-family
        this.addToInspect(this.activeWidgets, {name: 'lc-font-family', type: 'fontname', default: ''}, group);
        // font-style
        this.addToInspect(this.activeWidgets, {name: 'lc-font-style', type: 'auto', options: ['', 'normal', 'italic', 'oblique', 'initial', 'inherit'], default: ''}, group);
        // background-color
        this.addToInspect(this.activeWidgets, {name: 'lc-bkg-color', type: 'color', default: ''}, group);
        // color
        this.addToInspect(this.activeWidgets, {name: 'lc-color', type: 'color', default: ''}, group);

        // border-width
        this.addToInspect(this.activeWidgets, {name: 'lc-border-width', default: '0'}, group);
        // border-style
        this.addToInspect(this.activeWidgets, {name: 'lc-border-style', type: 'auto', options: ['', 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'initial', 'inherit'], default: ''}, group);
        // border-color
        this.addToInspect(this.activeWidgets, {name: 'lc-border-color', type: 'color', default: ''}, group);
        // border-radius
        this.addToInspect(this.activeWidgets, {name: 'lc-border-radius', type: 'slider', options: {min: 0, max: 20, step: 1}, default: 10}, group);
        // padding
        this.addToInspect(this.activeWidgets, {name: 'lc-padding'}, group);
        // z-index
        this.addToInspect(this.activeWidgets, {name: 'lc-zindex', type: 'slider', options: {min: -10, max: 20, step: 1}, default: 0}, group);
    },
    editGestures:       function (view) {
        var group = 'gestures';
        this.groups[group] = this.groups[group] || {};
        var gesturesAnalog = ['swiping', 'rotating', 'pinching'];
        var gestures = ['swipeRight', 'swipeLeft', 'swipeUp', 'swipeDown', 'rotateLeft', 'rotateRight', 'pinchIn', 'pinchOut'];

        this.addToInspect(this.activeWidgets, {name: 'gestures-indicator', type: 'auto', options: this.getWidgetIds(view, 'tplValueGesture')}, group);
        this.addToInspect(this.activeWidgets, {name: 'gestures-offsetX', default: 0, type: 'number'},   group);
        this.addToInspect(this.activeWidgets, {name: 'gestures-offsetY', default: 0, type: 'number'},   group);
        this.addToInspect('delimiterInGroup', group);
        var j;
        var gesture;
        for (j = 0; j < gesturesAnalog.length; j++) {
            gesture = gesturesAnalog[j];
            this.addToInspect(this.activeWidgets, {name: 'gestures-' + gesture + '-oid',        type: 'id'},     group);
            this.addToInspect(this.activeWidgets, {name: 'gestures-' + gesture + '-value',      default: ''},    group);
            this.addToInspect(this.activeWidgets, {name: 'gestures-' + gesture + '-minimum',    type: 'number'}, group);
            this.addToInspect(this.activeWidgets, {name: 'gestures-' + gesture + '-maximum',    type: 'number'}, group);
            this.addToInspect(this.activeWidgets, {name: 'gestures-' + gesture + '-delta',      type: 'number'}, group);
            this.addToInspect('delimiterInGroup', group);
        }

        for (j = 0; j < gestures.length; j++) {
            gesture = gestures[j];
            this.addToInspect(this.activeWidgets, {name: 'gestures-' + gesture + '-oid',    type: 'id'},     group);
            this.addToInspect(this.activeWidgets, {name: 'gestures-' + gesture + '-value',  default: ''},    group);
            this.addToInspect(this.activeWidgets, {name: 'gestures-' + gesture + '-limit',  type: 'number'}, group);
            if (j < gestures.length - 1) {
                this.addToInspect('delimiterInGroup', group);
            }
        }
        var that = this;
        // install handlers
        setTimeout(function () {
            for (var j = 0; j < gesturesAnalog.length; j++) {
                gesture = gesturesAnalog[j];
                $('#inspect_gestures-' + gesture + '-oid').on('change', function () {
                    var id  = $(this).attr('id');
                    var val = $(this).val();
                    var g   = id.split('-');

                    if (that.objects[val] && that.objects[val].common) {
                        if (that.objects[val].common.min !== undefined) {
                            var $min = $('#inspect_gestures-' + g[1] + '-minimum');
                            if ($min.val() === '') {
                                $min.val(that.objects[val].common.min);
                            }
                        }
                        if (that.objects[val].common.max !== undefined) {
                            var $max = $('#inspect_gestures-' + g[1] + '-maximum');
                            if ($max.val() === '') {
                                $max.val(that.objects[val].common.max);
                            }
                        }
                    }
                }).keyup(function () {
                    $(this).trigger('change');
                });
            }
        }, 300);
    },
    editText:           function (widAttr) {
        var that = this;
        var line = {
            input: '<textarea id="inspect_' + widAttr + '"></textarea>'
        };

        line.button = {
            icon: 'ui-icon-note',
            text: false,
            title: _('Select color'),
            click: function (/*event*/) {
                var wdata = $(this).data('wdata');
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
                    resize:   function () {
                        editor.resize();
                    },
                    open:     function (event) {
                        $(event.target).parent().find('.ui-dialog-titlebar-close .ui-button-text').html('');
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
                        editor.getSession().setMode('ace/mode/html');
                        editor.setOptions({
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion:  true
                        });
                        editor.$blockScrolling = Infinity;
                        editor.getSession().setUseWrapMode(true);
                        editor.setValue($('#inspect_' + wdata.attr).val());
                        editor.navigateFileEnd();
                        editor.focus();
                        editor.getSession().on('change', function() {
                            changed = true;
                        });
                    },
                    beforeClose: function () {
                        var $parent = $('#dialog-edit-text').parent();
                        var pos = $parent.position();
                        that.editSaveConfig('dialog-edit-text', JSON.stringify({
                            top:    pos.top  > 0 ? pos.top  : 0,
                            left:   pos.left > 0 ? pos.left : 0,
                            width:  $parent.width(),
                            height: $parent.height() + 9
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
    // add font name to font selector (used in adapters, eg. vis-google-fonts
    addFont:            function (fontName) {
        if (this.fontNames.indexOf(fontName) === -1) this.fontNames.push(fontName);
    },
    // find states with requested roles of device
    findByRoles:        function (stateId, roles) {
        if (typeof roles !== 'object') {
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
        var reg = new RegExp('^' + channel.replace(/\./g, '\\.') + '\\.');

        // channels
        for (var id in this.objects) {
            if (reg.test(id) &&
                this.objects[id].common &&
                this.objects[id].type === 'state') {
                for (var r = 0; r < roles.length; r++) {
                    if (this.objects[id].common.role === roles[r]) {
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
                    this.objects[id].type === 'state') {

                    for (var r = 0; r < roles.length; r++) {
                        if (this.objects[id].common.role === roles[r]) {
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
    findByName:         function (stateId, objName) {
        // try to detect other values

        // Go trough all channels of this device
        var parts = stateId.split('.');
        parts.pop(); // remove state
        var channel = parts.join('.');

        // check same channel
        var id = channel + '.' + objName;
        if ((id in this.objects) &&
            this.objects[id].common &&
            this.objects[id].type === 'state') {

            return id;
        }

        // try to search in channels
        parts.pop(); // remove channel
        var device = parts.join('.');
        var reg = new RegExp('^' + device.replace(/\./g, '\\.') + '\\.' + '.*\\.' + objName);
        for (var id in this.objects) {
            if (reg.test(id) &&
                this.objects[id].common &&
                this.objects[id].type === 'state') {

                return id;
            }
        }
        return false;
    },
    hideShowAttr:       function (widAttr, isShow) {
        if (isShow) {
            $('#td_' + widAttr).show();
        } else {
            $('#td_' + widAttr).hide();
        }
    },
    addToInspect:       function (widgets, widAttr, group, options, onchange) {
        if (widgets === 'delimiter') {
            this.groups[widAttr || group] = this.groups[widAttr || group] || {};
            var d = 0;
            while (this.groups[widAttr || group]['delimiter' + d]) d++;
            this.groups[widAttr || group]['delimiter' + d] = 'delimiter';
            return;
        }
        if (widgets === 'delimiterInGroup') {
            this.groups[widAttr || group] = this.groups[widAttr || group] || {};
            var d = 0;
            while (this.groups[widAttr || group]['delimiterInGroup' + d]) d++;
            this.groups[widAttr || group]['delimiterInGroup' + d] = 'delimiterInGroup';
            return;
        }
        if (typeof widAttr !== 'object') {
            widAttr = {name: widAttr};
        }
        if (widAttr.clearName === undefined) widAttr.clearName = widAttr.name;
        if (widAttr.index     === undefined) widAttr.index     = '';

        if (typeof group   === 'function') {
            onchange = group;
            group = null;
        }
        if (typeof options === 'function') {
            onchange = options;
            options = null;
        }

        options = options || {};

        var input;
        var line;
        // set default value if attr is empty
        if (widAttr.default !== undefined) {
            for (var i = 0; i < widgets.length; i++) {
                var view       = this.getViewOfWidget(widgets[i]);
                var widgetData = this.views[view].widgets[widgets[i]].data;

                if (widgetData && (widgetData[widAttr.name] === null || widgetData[widAttr.name] === undefined) && !widAttr.name.match(/^gestures-/)) {
                    widgetData[widAttr.name] = widAttr.default;
                    this.reRenderList = this.reRenderList || [];
                    if (this.reRenderList.indexOf(widgets[i]) === -1) {
                        this.reRenderList.push(widgets[i]);
                    }
                }
            }
        } else if (widAttr.name === 'lc-oid' && widgets.length === 1) {
            var _view       = this.getViewOfWidget(widgets[0]);
            var _widgetData = this.views[_view].widgets[widgets[0]].data;
            if (!_widgetData['lc-oid'] && _widgetData['g_last_change']) {
                // find any oid value
                for (var a in _widgetData) {
                    if (_widgetData.hasOwnProperty(a) && a.match(/^oid|oid$/)) {
                        if (_widgetData[a] && _widgetData[a] !== 'nothing_selected') {
                            _widgetData['lc-oid'] = _widgetData[a];
                        }
                        break;
                    }
                }
            }
        }

        // Depends on attribute type
        switch (widAttr.type) {
            case 'id':
                line = this.editObjectID(widAttr.name, widAttr.options, false, widAttr.onChangeWidget);
                break;
            case 'hid':
            case 'history-id':
                line = this.editObjectID(widAttr.name, widAttr.options, true, widAttr.onChangeWidget);
                break;
            case 'checkbox':
                // All other attributes
                line = '<input id="inspect_' + widAttr.name + '" type="checkbox"/>';
                break;
            case 'select-views':
                line = '<select multiple="multiple" id="inspect_' + widAttr.name + '" class="select-views"></select>';
                break;
            case 'groups':
                line = '<select multiple="multiple" id="inspect_' + widAttr.name + '" class="select-groups"></select>';
                break;
            case 'color':
                line = this.editColor(widAttr.name);
                break;
            case 'class':
                line = this.editClass(widAttr.name);
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
            case 'dimension':
                line = this.editDimension(widAttr.name);
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
            case 'widget':
                line = this.editWidgetNames(widAttr.name, widAttr.options);
                break;
            case 'effect-options':
                var _opts = {};
                _opts[_('left')] = 'left';
                _opts[_('right')] = 'right';
                _opts[_('top')] = 'top';
                _opts[_('bottom')] = 'bottom';
                line = this.editSelect(widAttr.name, _opts);
                break;
            case 'hidden':
                return;
            case 'fontname':
                line = this.editFontName(widAttr.name);
                break;
            case 'history':
                line = this.editHistoryInstance(widAttr.name);
                break;
            case 'password':
                line = '<input type="password" id="inspect_' + widAttr.name + '"/>';
                break;
            default:
                line = '<input type="text" id="inspect_' + widAttr.name + '"/>';
        }

        if (typeof line === 'string') line = {input: line};

        if (line[0]) {
            line[0].attrName       = widAttr.clearName;
            line[0].attrIndex      = widAttr.index;
            line[0].type           = widAttr.type;
            line[0].onChangeWidget = widAttr.onChangeWidget;
            if (widAttr.title) {
                line[0].attrTitle = widAttr.title;
            }
            if (widAttr.depends && widAttr.depends.length) {
                line[0].depends = widAttr.depends;
            }
        } else {
            line.attrName       = widAttr.clearName;
            line.attrIndex      = widAttr.index;
            line.type           = widAttr.type;
            line.onChangeWidget = widAttr.onChangeWidget;
            if (widAttr.title) {
                line.attrTitle = widAttr.title;
            }
            if (widAttr.depends && widAttr.depends.length) {
                line.depends = widAttr.depends;
            }
        }

        // <tr><td>title:</td><td><input /></td><td>button</td></tr>
        this.groups[group] = this.groups[group] || {};
        this.groups[group][widAttr.name] = line;
    },
    // Render edit panel
    showInspect:        function (viewDiv, view, widgets) {
        var $widgetAttrs = $('#widget_attrs');
        var that   = this;
        var depends = [];
        var values  = {};
        var widAttr;
        for (var group in this.groups) {
            if (!this.groups.hasOwnProperty(group)) continue;
            if (this.groupsState[group] === undefined) this.groupsState[group] = false;

            var groupName = group;
            if (groupName.indexOf('_§') !== -1) {
                var m = groupName.match(/^([\w_]+)_§([0-9]+)/);
                groupName = _('group_' + m[1]) + '[' + m[2] + ']';
            } else {
                groupName = _('group_' + group);
            }
//            $widgetAttrs.append('<tr data-group="' + group + '" class="ui-state-default vis-inspect-group"><td colspan="3" style="background: url(this.groupsIcons[group]) no-repeat center center;">' + (this.groupsIcons[group] ? '<img class="vis-group-icon" src="' + this.groupsIcons[group] + '"/><div>' + groupName + '</div>' : groupName) + '</td><td><button class="group-control" data-group="' + group + '">' + group + '</button></td>');
            var gText = '<tr data-group="' + group + '" class="ui-state-default vis-inspect-group"><td colspan="2"';
            if (this.groupsIcons[group]) {
                gText += ' style="background: url(' + (this.groupsIcons[group] || '') + ') no-repeat left center; padding-left: 30px"'
            }
            gText += '>' + groupName + '</td>';
            var isGroupEnabledObj = group === 'common' || group === 'css_common' ? true : this.findCommonValue(view, widgets, 'g_' + group);
            var isGroupEnabled = false;
            var isGroupEnabledIndeterminate = false;
            if (typeof isGroupEnabledObj === 'object' && isGroupEnabledObj.values) {
                for (var g = 0; g < isGroupEnabledObj.values.length; g++) {
                    if (isGroupEnabledObj.values[g] !== false) {
                        isGroupEnabled = true;
                        isGroupEnabledIndeterminate = true;
                        break;
                    }
                }
            } else {
                isGroupEnabled = isGroupEnabledObj;
            }
            isGroupEnabled = isGroupEnabled !== false;
            this.groups[group].___enabled = isGroupEnabled;
            if (group === 'common' || group === 'css_common') {
                gText += '<td></td>';
            } else {
                gText += '<td><input type="checkbox" ' + (!isGroupEnabledIndeterminate && isGroupEnabled ? 'checked ' : '') + ' data-indeterminate="' + isGroupEnabledIndeterminate + '" class="group-enable" data-group="' + group + '"/></td>';
            }
            if (isGroupEnabled) {
                gText += '<td><button class="group-control" data-group="' + group + '">' + group + '</button></td>';
            } else {
                gText += '<td></td>';
            }
            $widgetAttrs.append(gText);

            if (isGroupEnabled) {
                for (widAttr in this.groups[group]) {
                    if (!this.groups[group].hasOwnProperty(widAttr) || widAttr === '___enabled') {
                        continue;
                    }

                    var line = this.groups[group][widAttr];
                    if (line === 'delimiter') {
                        $widgetAttrs.append('<tr><td colspan="5" style="height: 2px" class="ui-widget-header"></td></tr>');
                        continue;
                    }
                    if (line === 'delimiterInGroup') {
                        $widgetAttrs.append('<tr><td colspan="5" style="height: 2px" class="ui-widget-header group-' + group + '"></td></tr>');
                        continue;
                    }
                    if (line[0]) {
                        line = line[0];
                    }
                    if (typeof line === 'string') {
                        line = {input: line};
                    }

                    var title = line.attrTitle;

                    title = title || _(widAttr + '_tooltip');
                    var icon;
                    if (title === widAttr + '_tooltip') {
                        title = '';
                        icon = '';
                    } else {
                        icon = '<div class="ui-icon ui-icon-notice" style="float: right"/>';
                    }

                    var text = '<tr class="vis-edit-td-caption group-' + group + '" id="td_' + widAttr + '"><td ' + (title ? 'title="' + title + '"' : '') + '>' + (icon ? '<i>' : '') + _(line.attrName) + (line.attrIndex !== '' ? ('[' + line.attrIndex + ']') : '') + ':' + (icon ? '</i>' : '') + '</td><td class="vis-edit-td-field"';

                    if (!line.button && !line.css) {
                        text += ' colspan="3"';
                    } else if (!line.css) {
                        if (!line.button && !line.css) text += ' colspan="2"';
                    } else if (!line.button) {
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
                        if (typeof line.button.code === 'function') {
                            line.button.code(line.button);
                        } else {
                            // init button
                            var $btn = $widgetAttrs.find('#inspect_' + widAttr + '_btn').button({
                                text: line.button.text || false,
                                icons: {
                                    primary: line.button.icon || ''
                                }
                            }).css({width: line.button.width || 22, height: line.button.height || 22});
                            if (line.button.click) $btn.click(line.button.click);
                            if (line.button.data)  $btn.data('data-custom', line.button.data);

                            $btn.data('wdata', {
                                attr:    widAttr,
                                widgets: widgets,
                                view:    view
                            });
                        }
                    }

                    // Init value
                    var $input = $widgetAttrs.find('#inspect_' + widAttr);

                    if ($input.attr('type') === 'text' || $input.prop('tagName') === 'TEXTAREA') {
                        if (!$input.hasClass('vis-edit-textbox-with-button')){
                            $input.addClass('vis-edit-textbox');
                        }
                    }

                    // Set the value
                    this.setAttrValue(view, this.activeWidgets, widAttr, line.css, values);

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
                    $input.data('wdata', wdata);

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
                if (!this.groupsState[group]) $widgetAttrs.find('.group-' + group).hide();
            }
        }

        $('.vis-edit-percent-calc').each(function () {
            var attr = $(this).data('attr');
            var val = $('#inspect_css_' + attr).val();

            if (val.toString().indexOf('%') === -1) {
                $(this).html('px');
            } else {
                $(this).html('%');
            }

            $(this).button().css({width: 18, height: 18}).click(function () {
                var attr   = $(this).data('attr');
                var $input = $('#inspect_css_' + attr);
                var val    = $input.val();
                if (val.toString().indexOf('%') === -1) {
                    // convert to %
                    for (var i = 0; i < that.activeWidgets.length; i++) {
                        var rect = that.editConvertToPercent(viewDiv, view, that.activeWidgets[i], viewDiv !== view ? viewDiv : null);
                        that.views[view].widgets[that.activeWidgets[i]].style[attr] = rect[attr];
                        $('#' + that.activeWidgets[i]).css(attr, rect[attr]);
                    }
                    that.setAttrValue(view, that.activeWidgets, 'css_' + attr, true, {});
                    $(this).html('%');
                } else {
                    // convert to px
                    for (var j = 0; j < that.activeWidgets.length; j++) {
                        var pRect = that.editConvertToPx(viewDiv, view, that.activeWidgets[j], viewDiv !== view ? viewDiv : null);
                        that.views[view].widgets[that.activeWidgets[j]].style[attr] = pRect[attr];
                        $('#' + that.activeWidgets[j]).css(attr, pRect[attr]);
                    }
                    that.setAttrValue(view, that.activeWidgets, 'css_' + attr, true, {});
                    $(this).html('px');
                }
            });
        });

        // Init all elements together
        for (group in this.groups) {
            if (!this.groups.hasOwnProperty(group) || !this.groups[group].___enabled) continue;
            for (widAttr in this.groups[group]) {
                var line_ = this.groups[group][widAttr];
                var $input_ = $widgetAttrs.find('#inspect_' + widAttr);
                var wdata_ = $input_.data('wdata');
                if (depends.length) $input_.data('depends', depends);

                if (line_[0]) line_ = line_[0];
                if (typeof line_ === 'string') line_ = {input: line_};
                if (typeof line_.init === 'function') {
                    if (wdata_.css) {
                        var cwidAttr_ = widAttr.substring(4);
                        if (values[cwidAttr_] === undefined) values[cwidAttr_] = this.findCommonValue(view, widgets, cwidAttr_);
                        line_.init.call($input_[0], cwidAttr_, values[cwidAttr_]);
                    } else {
                        if (values[widAttr] === undefined) values[widAttr] = this.findCommonValue(view, widgets, widAttr);
                        line_.init.call($input_[0], widAttr, values[widAttr]);
                    }
                }
                // Call on change
                if (typeof line_.onchange === 'function') {
                    if (wdata_.css) {
                        var cwidAttr = widAttr.substring(4);
                        if (values[cwidAttr] === undefined) values[cwidAttr] = this.findCommonValue(view, widgets, cwidAttr);
                        line_.onchange.call($input_[0], values[cwidAttr]);
                    } else {
                        if (values[widAttr] === undefined) values[widAttr] = this.findCommonValue(view, widgets, widAttr);
                        line_.onchange.call($input_[0], values[widAttr]);
                    }
                }
            }
        }
        this.initStealHandlers();

        $widgetAttrs.find('.vis-inspect-widget').change(function () {
            var $this    = $(this);
            var wdata    = $this.data('wdata');
            var depends  = $this.data('depends');
            var diff     = $this.data('different');
            var oldValue = null;

            // Set flag, that value was modified
            if (diff) $this.data('different', false).removeClass('vis-edit-different');
            var css = wdata.attr.substring(4);
            var val = ($this.attr('type') === 'checkbox') ? $this.prop('checked') : $this.val();

            for (var i = 0; i < wdata.widgets.length; i++) {
                if (wdata.css) {
                    if (!that.views[wdata.view].widgets[wdata.widgets[i]].style) {
                        that.views[wdata.view].widgets[wdata.widgets[i]].style = {};
                    }
                    oldValue = that.views[wdata.view].widgets[wdata.widgets[i]].style[css];
                    that.views[wdata.view].widgets[wdata.widgets[i]].style[css] = val;
                    if (css !== 'transform') {
                        var $widget = $('#' + wdata.widgets[i]);
                        if (val !== '' && (css === 'left' || css === 'top') &&
                            (val.indexOf('%') === -1 && val.indexOf('px') === -1 && val.indexOf('em') === -1)) {
                            $widget.css(css, val + 'px');
                        } else {
                            $widget.css(css, val);
                        }
                    }

                    if (that.activeWidgets.indexOf(wdata.widgets[i]) !== -1) {
                        that.showWidgetHelper(viewDiv, view, wdata.widgets[i], true);
                    }

                    if ($('#' + that.views[wdata.view].widgets[wdata.widgets[i]].tpl).attr('data-vis-update-style')) {
                        that.reRenderWidgetEdit(viewDiv, view, wdata.widgets[i]);
                    }
                } else {
                    oldValue = that.widgets[wdata.widgets[i]].data[wdata.attr];
                    that.views[wdata.view].widgets[wdata.widgets[i]].data[wdata.attr] = that.widgets[wdata.widgets[i]].data[wdata.attr] = val;
                }

                // Some user adds ui-draggable and ui-resizable as class to widget.
                // The result is DashUI tries to remove draggable and resizable properties and fails
                if (wdata.attr === 'class') {
                    var _val_ = that.views[wdata.view].widgets[wdata.widgets[i]].data[wdata.attr];
                    if (_val_.indexOf('ui-draggable') !== -1 || _val_.indexOf('ui-resizable') !== -1) {
                        var vals = _val_.split(' ');
                        _val_ = '';
                        for (var j = 0; j < vals.length; j++) {
                            if (vals[j] && vals[j] !== 'ui-draggable' && vals[j] !== 'ui-resizable') {
                                _val_ += ((_val_) ? ' ' : '') + vals[j];
                            }
                        }
                        that.views[wdata.view].widgets[wdata.widgets[i]].data[wdata.attr] = _val_;
                        $this.val(_val_);
                    }
                }

                // Update select widget dropdown
                if (wdata.attr === 'name') {
                    that.$selectActiveWidgets.find('option[value="' + wdata.widgets[i] + '"]').text(that.getWidgetName(wdata.view, wdata.widgets[i]));
                    that.sortSelectWidget();
                    that.$selectActiveWidgets.multiselect('refresh');
                }

                var changed = false;
                if (typeof wdata.onchange === 'function') {
                    if (wdata.css) {
                        var _css = wdata.attr.substring(4);
                        changed = wdata.onchange.call(this, that.views[wdata.view].widgets[wdata.widgets[i]].style[_css], oldValue) || false;
                    } else {
                        changed = wdata.onchange.call(this, that.widgets[wdata.widgets[i]].data[wdata.attr], oldValue) || false;
                    }
                }

                if (wdata.onChangeWidget) {
                    var widgetSet = $('#' + that.views[wdata.view].widgets[wdata.widgets[i]].tpl).attr('data-vis-set');
                    if (that.binds[widgetSet] && that.binds[widgetSet][wdata.onChangeWidget]) {
                        var _changed;
                        if (wdata.css) {
                            var __css = wdata.attr.substring(4);
                            _changed = that.binds[widgetSet][wdata.onChangeWidget](wdata.widgets[i], wdata.view, that.views[wdata.view].widgets[wdata.widgets[i]].style[__css], __css, true, oldValue);
                        } else {
                            _changed = that.binds[widgetSet][wdata.onChangeWidget](wdata.widgets[i], wdata.view, that.widgets[wdata.widgets[i]].data[wdata.attr], wdata.attr, false, oldValue);
                        }
                        if (!changed) changed = _changed;
                    }
                }

                that.save(viewDiv, view);
                if (!wdata.css) that.reRenderWidgetEdit(viewDiv, view, wdata.widgets[i]);

                // Rebuild attr list
                if (changed || (depends && depends.indexOf(wdata.attr) !== -1)) that.inspectWidgets(viewDiv, view);
            }

            //Update containers
            if (wdata.type === 'views') {
                // Set ths views for containers
                that.updateContainers(wdata.view, wdata.view);
            }
        });

        $widgetAttrs.find('.group-control').each(function () {
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
                            if (_group !== group && that.groupsState[_group]) {
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

        function deleteAttrs(group, widgets, viewDiv, view, value) {
            var isCss = group.substring(0, 4) === 'css_';

            for (var i = 0; i < widgets.length; i++) {
                if (!value) {
                    var cssChanged = false;
                    var $style;
                    if (isCss) $style = $('#' + wdata.widgets[i]).prop('style');

                    for (var attr in that.groups[group]) {
                        if (!that.groups[group].hasOwnProperty(attr)) continue;
                        if (isCss) {
                            if (that.views[view].widgets[widgets[i]].style) {
                                attr = attr.substring(4);
                                delete that.views[view].widgets[widgets[i]].style[attr];
                                cssChanged = true;
                                $style.removeProperty(attr);
                            }
                        } else {
                            delete that.views[view].widgets[widgets[i]].data[attr];
                        }
                    }

                    if (cssChanged && $('#' + that.views[view].widgets[widgets[i]].tpl).attr('data-vis-update-style')) {
                        that.reRenderWidgetEdit(viewDiv, view, widgets[i]);
                    }
                }
                that.widgets[widgets[i]].data['g_' + group] = value;
                that.views[view].widgets[widgets[i]].data['g_' + group] = value;
            }
            that.save(viewDiv, view);
            // Rebuild attr list
            that.inspectWidgets(viewDiv, view);
        }

        $widgetAttrs.find('.group-enable').change(function () {
            var $this = $(this);
            var group = $this.attr('data-group');
            var wdata = $this.data('wdata');
            var checked = $this.prop('checked');
            // Set flag, that value was modified
            var isCss = group.substring(0, 4) === 'css_';
            var isEmpty = true;
            if (!checked) {
                // check all attributes in this group and if some are not empty, ask
                for (var i = 0; i < wdata.widgets.length; i++) {
                    for (var attr in that.groups[group]) {
                        var val;
                        if (isCss) {
                            val = that.views[wdata.view].widgets[wdata.widgets[i]].style[attr.substring(4)];
                        } else {
                            val = that.views[wdata.view].widgets[wdata.widgets[i]].data[attr];
                        }
                        if (val !== undefined && val !== null && val !== '') {
                            isEmpty = false;
                            break;
                        }
                    }
                    if (!isEmpty) break;
                }

                if (!isEmpty) {
                    vis.showMessage(_('Some field are not empty. Sure?'), _('Are you sure?'), 450, function (result) {
                        if (result) {
                            deleteAttrs(group, wdata.widgets, wdata.viewDiv, wdata.view, false);
                        } else {
                            $this.prop('checked', true);
                        }
                    });
                } else {
                    deleteAttrs(group, wdata.widgets, wdata.viewDiv, wdata.view, false);
                }
            } else {
                deleteAttrs(group, wdata.widgets, wdata.viewDiv, wdata.view, true);
            }
        }).each(function() {
            $(this).data('wdata', {
                widgets: widgets,
                view:    view,
                viewDiv: viewDiv
            });
            if ($(this).data('indeterminate')) {
                $(this).prop('indeterminate', true)
            }
        });
    },
    extractAttributes:  function (_wid_attr, widget) {

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
            if (parts.length === 2) {
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

        if (widAttr === 'color') {
            wid_type = 'color';
        } else if (widAttr === 'oid' || widAttr.match(/^oid-/)) {
            wid_type = wid_type || 'id';
        } else if (widAttr.match(/nav_view$/)) {
            wid_type = 'views';
        } else
        /*if (widAttr.match(/src$/)) {
         wid_type = 'image';
         } else*/
        if (widAttr === 'sound') {
            wid_type = 'sound';
        } else if (widAttr.indexOf('_effect') !== -1) {
            wid_type = 'effect';
        } else if (widAttr.indexOf('_eff_opt') !== -1) {
            wid_type = 'effect-options';
        }
        if (wid_type === 'nselect') {
            wid_type = 'select';
            notTranslate = true;
        }

        // Extract min, max, step for number and slider
        if ((wid_type === 'number' || wid_type === 'slider') && wid_type_opt) {
            var old = wid_type_opt;
            wid_type_opt = {};
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
    findCommonAttributes: function (view, widgets) {
        view = view || this.activeView;
        var allWidgetsAttr = null;
        for (var i = 0; i < widgets.length; i++) {
            var widget = this.views[view].widgets[widgets[i]];

            if (!widget) {
                console.log('inspectWidget ' + widgets[i] + ' undefined');
                return [];
            }

            if (!widget.tpl) return false;

            var $widgetTpl = $('#' + widget.tpl);
            if (!$widgetTpl) {
                console.log(widget.tpl + ' is not included');
                return [];
            }
            var widgetAttrs = $widgetTpl.attr('data-vis-attrs');
            // Combine attributes from data-vis-attrs, data-vis-attrs0, data-vis-attrs1, ...
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
            var group     = 'common';
            var groupMode = 'normal';
            var attrs = {};
            for (var j = 0; j < widgetAttrs.length; j++) {
                if (widgetAttrs[j].match(/^group\./)) {
                    group = widgetAttrs[j].substring('group.'.length);
                    // extract group mode
                    if (group.indexOf('/') !== -1) {
                        var parts = group.split('/');
                        group     = parts[0];
                        groupMode = parts[1] || 'normal';
                        // if icon
                        if (parts[2]) this.groupsIcons[group] = groupMode;
                    } else {
                        groupMode = 'normal';
                    }
                    continue;
                }
                if (!widgetAttrs[j]) continue;

                var a = this.extractAttributes(widgetAttrs[j], widgets[i]);
                if (groupMode === 'byindex') {
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
                        if (JSON.stringify(allWidgetsAttr[group][name]) !== JSON.stringify(attrs[group][name])){
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
    // If only one widget, it returns the value
    // If array of widgets, ot returns object {values, widgetValues}, where values are all found different values and widgetValues is array with values for every widget
    findCommonValue:    function (view, widgets, attr, isStyle) {
        view = view || this.activeView;
        var widgetValues = [];
        var values = [];
        for (var i = 0; i < widgets.length; i++) {
            var widget = this.views[view].widgets[widgets[i]];
            var obj = isStyle ? widget.style : widget.data;
            var val = (isStyle && (!obj || obj[attr] === undefined)) ? '' : (obj ? obj[attr] : '');

            widgetValues[i] = val;
            if (values.indexOf(val) === -1) values.push(val);
        }
        if (values.length === 1) {
            return values[0];
        } else {
            return {
                values:       values,
                widgetValues: widgetValues
            };
        }
    },
    setAttrValue:       function (view, widgets, attr, isStyle, values) {
        var $input = $('#inspect_' + attr);
        if (isStyle && attr.substring(0, 4) === 'css_') attr = attr.substring(4);

        if (values[attr] === undefined) values[attr] = this.findCommonValue(view, widgets, attr, isStyle);
        if ($input.attr('type') === 'checkbox') {
            if (typeof values[attr] === 'object') {
                $input.prop('indeterminate', true);
            } else {
                $input.prop('checked', values[attr]);
            }
        } else {
            if (typeof values[attr] === 'object') {
                $input.addClass('vis-edit-different').val(_('--different--')).data('value', values[attr]).data('different', true);
                $input.autocomplete({
                    minLength: 0,
                    source: function (request, response) {
                        var data = $.grep(this.element.data('value').values, function (value) {
                            if (value === undefined || value === null) return false;
                            value = value.toString();
                            return value.substring(0, request.term.length).toLowerCase() === request.term.toLowerCase();
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
        $input.unbind('keyup').keyup(function () {
            var $this = $(this);
            var timer = $this.data('timer');
            if (timer) clearTimeout(timer);

            $this.data('timer', setTimeout(function () {
                $this.data('timer', null);
                $this.trigger('change');
            }, 500));
        });
    },
    inspectWidgets:     function (viewDiv, view, addWidget, delWidget, onlyUpdate) {
        if (this.isStealCss) return false;
        var that = this;

        if (typeof viewDiv === 'object') {
            addWidget = viewDiv;
            viewDiv   = this.activeViewDiv;
            view      = this.activeView;
        }

        var oldView;
        $('.vis-widget[data-zmodified="true"]').each(function () {
            var wid = $(this).attr('id');

            $(this).removeAttr('data-zmodified');

            oldView = oldView || that.getViewOfWidget(wid);

            var zIndex = that.views[oldView].widgets[wid] && that.views[oldView].widgets[wid].style && that.views[oldView].widgets[wid].style['z-index'];

            if (!zIndex && zIndex !== '0' && zIndex !== 0) {
                $(this).prop('style').removeProperty('z-index');
            } else {
                $(this).css('z-index', zIndex);
            }
        });
        $('.vis-widget[data-tmodified="true"]').each(function () {
            var wid = $(this).attr('id');

            $(this).removeAttr('data-tmodified');

            oldView = oldView || that.getViewOfWidget(wid);

            var transform = that.views[oldView].widgets[wid] && that.views[oldView].widgets[wid].style && that.views[oldView].widgets[wid].style.transform;

            if (!transform) {
                $(this).prop('style').removeProperty('transform');
            } else {
                $(this).css('transform', transform);
            }
        });

        // Deselect all elements
        $(':focus').blur();

        // Hide context menu
        $('#context_menu').hide();

        if (typeof addWidget === 'boolean') {
            onlyUpdate = addWidget;
            addWidget  = undefined;
            delWidget  = undefined;
        }
        if (addWidget) {
            if (typeof addWidget === 'object') {
                this.activeWidgets = addWidget;
            } else {
                if (this.activeWidgets.indexOf(addWidget) === -1) this.activeWidgets.push(addWidget);
            }
        }
        if (typeof delWidget === 'string') {
            var pos = this.activeWidgets.indexOf(delWidget);
            if (pos !== -1) this.activeWidgets.splice(pos, 1);
        }
        var wid  = this.activeWidgets[0] || 'none';

        this.groups = {};
        this.groupsIcons = {
            fixed: 'icon/groupFixed.png'
        };

        if (view !== viewDiv) {
            // disable group resize
            var $group = $('#' + viewDiv);
            if ($group.hasClass('vis-resize-group')) {
                $group.resizable('destroy').removeClass('vis-resize-group');
            }
        }
        if (!onlyUpdate) {
            this.alignIndex = 0;

            var s = JSON.stringify(this.activeWidgets);
            if (this.views[view] && JSON.stringify(this.views[view].activeWidgets) !== s) {
                this.views[view].activeWidgets = JSON.parse(s);
                // Store selected widgets
                this.save(viewDiv, view);
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
                this.showWidgetHelper(viewDiv, view, deselect[i], false);
                $widget = $('#' + deselect[i]);
                $widget.removeClass('ui-selected');

                if ($widget.hasClass('ui-draggable')) {
                    try {
                        $widget.draggable('destroy');
                    } catch (e) {
                        this.conn.logError('inspectWidgets - Cannot destroy draggable ' + deselect[i] + ' ' + e);
                    }
                }

                if ($widget.hasClass('ui-resizable')) {
                    try {
                        $widget.resizable('destroy');
                    } catch (e) {
                        this.conn.logError('inspectWidgets - Cannot destroy resizable ' + deselect[i] + ' ' + e);
                    }
                }
            }
            // disable resize if widget not more selected alone
            if (this.oldActiveWidgets.length === 1 && this.activeWidgets.length !== 1) {
                $widget = $('#' + this.oldActiveWidgets[0]);
                if ($widget.hasClass('ui-resizable')) {
                    try {
                        $widget.resizable('destroy');
                    } catch (e) {
                        this.conn.logError('inspectWidgets - Cannot destroy resizable ' + deselect[i] + ' ' + e);
                    }
                }
            }

            // Select selected widgets
            for (var p = 0; p < select.length; p++) {
                try {
                    $widget = this.showWidgetHelper(viewDiv, view, select[p], true);

                    if ($widget && !$('#wid_all_lock_d').hasClass('ui-state-active')) {
                        this.draggable(viewDiv, view, $widget);
                    }
                } catch (e) {
                    console.log(e);
                }
            }
            this.$selectActiveWidgets.val(this.activeWidgets);

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

            if (this.activeWidgets.length === 1) {
                try {
                    $widget = $('#' + this.activeWidgets[0]);
                    if (!$widget.hasClass('ui-resizable') && this.widgets[wid] && this.widgets[wid].data && !this.widgets[wid].data._no_resize) {
                        this.resizable(viewDiv, view, $widget);
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
            $('#rib_wid_copy_cancel').trigger('click');

            this.actualAttrs = this.findCommonAttributes(view, this.activeWidgets);
        }

        var $widgetAttrs = $('#widget_attrs').hide();
        // Clear Inspector
        $widgetAttrs[0].innerHTML = '';
        //$widgetAttrs.empty();

        if (!wid || wid === 'none') {
            // Switch tabs to View settings
            $('#pan_attr').tabs('option', 'disabled', [1]).tabs({active: 0});
            $('#widget_tab').text(_('Widget'));

            if (view !== viewDiv) {
                // enable group resize of nothing selected
                this.editResizeGroup(viewDiv, view);
            }
            return false;
        }

        $('#pan_attr').tabs('option', 'disabled', []).tabs({active: 1});
        $('#widget_tab').text((this.activeWidgets.length === 1) ? wid : _('Widget') + ': ' + this.activeWidgets.length);

        if (!this.views[view]) {
            console.warn('No view "' + view + ' for ' + wid + ' found');
            return;
        }
        var widget = this.views[view].widgets[wid];

        if (!widget) {
            console.log('inspectWidget ' + wid + ' undefined');
            return false;
        }

        if (!widget.tpl) return false;

        var $widgetTpl = $('#' + widget.tpl);
        if (!$widgetTpl) {
            console.log(widget.tpl + ' is not included');
            return false;
        }
        /*var widgetAttrs = $widgetTpl.attr('data-vis-attrs');
        // Combine attributes from data-vis-attrs, data-vis-attrs0, data-vis-attrs1, ...
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
        var widgetFilter = $widgetTpl.attr('data-vis-filter');*/

        $('#inspect_comment_tr').show();
        $('#inspect_class_tr').show();

        $widgetAttrs.css({width: '100%'});

        // Add fixed attributes
        var group = 'fixed';
        this.addToInspect(this.activeWidgets, 'name',      group);
        this.addToInspect(this.activeWidgets, 'comment',   group);
        this.addToInspect(this.activeWidgets, {name: 'class',     type: 'class'}, group);
        this.addToInspect(this.activeWidgets, {name: 'filterkey', type: 'auto', options: this.updateFilter(view)}, group);
        this.addToInspect(this.activeWidgets, {name: 'views',     type: 'select-views'}, group);
        this.addToInspect(this.activeWidgets, {name: 'locked',    type: 'checkbox'}, group);

        group = 'visibility';
        this.addToInspect(this.activeWidgets, {name: 'visibility-oid',           type: 'id'},   group);
        this.addToInspect(this.activeWidgets, {name: 'visibility-cond',          type: 'select', options: ['==', '!=', '<=', '>=', '<', '>', 'consist', 'not consist', 'exist', 'not exist'], default: '=='},   group);
        this.addToInspect(this.activeWidgets, {name: 'visibility-val', default: 1},     group);
        this.addToInspect(this.activeWidgets, {name: 'visibility-groups',        type: 'groups'}, group);
        this.addToInspect(this.activeWidgets, {name: 'visibility-groups-action', type: 'select', options: ['hide', 'disabled'], default: 'hide'}, group);

        this.addToInspect('delimiter', group);

        // special case for group widget
        group = 'common';
        if ($widgetTpl.attr('id') === '_tplGroup' && this.activeWidgets.length === 1) {
            var _wid = this.activeWidgets[0];
            var id = 1;
            var _data = this.views[view].widgets[_wid].data;
            var maxCount = parseInt(_data.attrCount, 10);
            if (maxCount) {
                for (var a = 1; a <= maxCount; a++) {
                    this.addToInspect(this.activeWidgets, {
                        name:       'groupAttr' + a,
                        type:       _data['attrType' + a],
                        clearName:  _data['attrName' + a] || ('attrName' + a),
                        title:      _('Use inside of group groupAttr%s', a)
                    }, group);
                }
            }
        }

        // Edit all attributes
        for (group in this.actualAttrs) {
            if (!this.actualAttrs.hasOwnProperty(group)) continue;
            for (var attr in this.actualAttrs[group]) {
                if (!this.actualAttrs[group].hasOwnProperty(attr)) continue;
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

        this.addToInspect('delimiter', 'css_shadow_padding');
        if ($widgetTpl.attr('data-vis-no-gestures') !== 'true') {
            this.editGestures(view);
        }
        if ($widgetTpl.attr('data-vis-no-signals') !== 'true') {
            this.editSignalIcons(view);
        }
        if ($widgetTpl.attr('data-vis-no-ls') !== 'true') {
            this.editLastChange(view);
        }
        if ($widgetTpl.attr('data-vis-no-echart') !== 'true') {
            //this.editChart(view);
        }
        // Re-render all widgets, where default values applied
        if (this.reRenderList && this.reRenderList.length) {
            for (var r = 0; r < this.reRenderList.length; r++) {
                this.reRenderWidgetEdit(viewDiv, view, this.reRenderList[r]);
            }
            this.reRenderList = [];
        }

        this.showInspect(viewDiv, view, this.activeWidgets);

        // snap objects to the grid, elsewise cannot move
        /*if (this.views[view].settings.snapType == 2) {
            this.gridWidth = parseInt(this.views[view].settings.gridSize, 10);

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
            // show grid

        }*/

        // Put all view names in the select element
        var $inspectViews = $('#inspect_views');
        if ($inspectViews.length) {
            $inspectViews.html('');

            var views = this.getViewsOfWidget(this.activeWidgets[0]);
            for (var v in this.views) {
                if (v === '___settings') continue;
                if (v !== this.activeView) {
                    var selected = '';
                    for (var m = 0; m < views.length; m++) {
                        if (views[m] === v) {
                            selected = 'selected';
                            break;
                        }
                    }
                    $inspectViews.append('<option value="' + v + '" ' + selected + '>' + v + '</option>');
                }
            }

            $inspectViews.multiselect({
                maxWidth:           180,
                height:             260,
                noneSelectedText:   _('Single view'),
                selectedText:       function (numChecked, numTotal, checkedItems) {
                    var text = '';
                    for (var i = 0; i < checkedItems.length; i++) {
                        text += (!text ? '' : ',') + checkedItems[i].title;
                    }
                    return text;
                },
                multiple:           true,
                checkAllText:       _('Check all'),
                uncheckAllText:     _('Uncheck all'),
                close:              function () {
                    if ($inspectViews.data('changed')) {
                        $inspectViews.data('changed', false);
                        that.syncWidgets(that.activeWidgets, $(this).val());
                        that.save(viewDiv, view);
                    }
                }
                //noneSelectedText: _("Select options")
            }).change(function () {
                $inspectViews.data('changed', true);
            }).data('changed', false);

            $inspectViews.next().css('width', '100%');
        }

        // Put all view names in the select element
        var $inspectGroups = $('#inspect_visibility-groups');
        if ($inspectGroups.length) {
            $inspectGroups.html('');

            var groups    = this.getUserGroups();
            var widGroups = this.findCommonValue(view, this.activeWidgets, 'visibility-groups');
            if (widGroups && !(widGroups instanceof Array)) widGroups = widGroups.values;
            widGroups = widGroups || [];
            for (var g in groups) {
                var val = g.substring('system.group.'.length);
                $inspectGroups.append('<option value="' + val + '" ' + ((widGroups.indexOf(val) !== -1) ? 'selected' : '') + '>' + (groups[g] && groups[g].common ?  groups[g].common.name || val : val) + '</option>');
            }

            $inspectGroups.multiselect({
                maxWidth:           180,
                height:             260,
                noneSelectedText:   _('All groups'),
                selectedText:       function (numChecked, numTotal, checkedItems) {
                    var text = '';
                    for (var i = 0; i < checkedItems.length; i++) {
                        text += (!text ? '' : ',') + checkedItems[i].title;
                    }
                    return text;
                },
                multiple:           true,
                checkAllText:       _('Check all'),
                uncheckAllText:     _('Uncheck all'),
                close:              function () {
                    if ($inspectGroups.data('changed')) {
                        $inspectGroups.data('changed', false);
                        that.save(viewDiv, view);
                    }
                }
                //noneSelectedText: _("Select options")
            }).change(function () {
                $inspectGroups.data('changed', true);
            }).data('changed', false);

            $inspectGroups.next().css('width', '100%');
        }

        // If tab Widget is not selected => select it
        var $menu = $('#menu_body');
        if ($menu.tabs('option', 'active') === 1) $menu.tabs({'active': 2});
        $widgetAttrs.show();

        // modify by all selected widgets the z-index
        if (this.views[view]) {
            for (var w in this.views[view].widgets) {
                if (!this.views[view].widgets.hasOwnProperty(w)) continue;
                if (this.activeWidgets.indexOf(w) !== -1) {
                    $('#' + w)
                        .attr('data-zmodified', 'true')
                        .css('z-index', 700);
                } else {
                    var wwidget = this.views[view].widgets[w];
                    $('#' + w)
                        .attr('data-zmodified', 'true')
                        .css('z-index', (wwidget && wwidget.style) ? (wwidget.style['z-index'] || 0) : 0);
                }
            }
        }
    }
});
