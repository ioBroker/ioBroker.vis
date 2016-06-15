/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2013-2016 bluefox https://github.com/GermanBluefox, hobbyquaker https://github.com/hobbyquaker
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */

// visEdit - the vis Editor
/* jshint browser:true */
/* global document */
/* global console */
/* global session */
/* global window */
/* global location */
/* global setTimeout */
/* global clearTimeout */
/* global systemLang:true */
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

'use strict';

vis = $.extend(true, vis, {
    $copyWidgetSelectView: null,
    undoHistoryMaxLength:  50,
    $selectView:           null,
    $selectActiveWidgets:  null,
    activeWidgets:         [],
    oldActiveWidgets:      [],
    isStealCss:            false,
    gridWidth:             undefined,
    clipboard:             null,
    undoHistory:           [],
    selectable:            true,
    groupsState:           {'fixed': true, 'common': true},
    // Array with all objects (Descriptions of objects)
    objects:               {},
    config:                {},
    objectSelector:        false, // if object select ID activated
    alignIndex:            0,
    alignType:             '',
    widgetAccordeon:       false,
    saveRemoteActive:      0,
    removeUnusedFields: function () {
        var regExp = /^gestures\-/;
        for (var view in this.views) {
            for (var id in this.views[view].widgets) {
                // Check all attributes
                var data = this.views[view].widgets[id].data;
                for (var attr in data) {
                    if ((data[attr] === '' || data[attr] === null) && regExp.test(attr)) {
                        delete data[attr];
                    }
                }
            }
        }
    },
    saveRemote: function (mode, callback) {
        // remove all unused fields
        this.removeUnusedFields();

        if (typeof mode == 'function') {
            callback = mode;
            mode     = null;
        }
        if (typeof app !== 'undefined') {
            console.warn('Do not allow save of views from Cordova!');
            if (typeof callback == 'function') callback();
            return;
        }

        var that = this;
        if (this.permissionDenied) {
            if (this.showHint) this.showHint(_('Cannot save file "%s": ', that.projectPrefix + 'vis-views.json') + _('permissionError'),
                5000, 'ui-state-error');
            if (typeof callback == 'function') callback();
            return;
        }


        if (this.saveRemoteActive % 10) {
            this.saveRemoteActive--;
            setTimeout(function () {
                that.saveRemote(mode, callback);
            }, 1000);
        } else {
            if (!this.saveRemoteActive) this.saveRemoteActive = 30;
            if (this.saveRemoteActive == 10) {
                console.log('possible no connection');
                this.saveRemoteActive = 0;
                return;
            }
            // Sync widget before it will be saved
            if (this.activeWidgets) {
                for (var t = 0; t < this.activeWidgets.length; t++) {
                    if (this.activeWidgets[t].indexOf('_') != -1 && this.syncWidgets) {
                        this.syncWidgets(this.activeWidgets);
                        break;
                    }
                }
            }

            // replace all bounded variables with initial values
            var viewsToSave = JSON.parse(JSON.stringify(this.views));
            for (var b in this.bindings) {
                for (var h = 0; h < this.bindings[b].length; h++) {
                    viewsToSave[this.bindings[b][h].view].widgets[this.bindings[b][h].widget][this.bindings[b][h].type][this.bindings[b][h].attr] = this.bindings[b][h].format;
                }
            }
            viewsToSave = JSON.stringify(viewsToSave, null, 2);
            if (this.lastSave == viewsToSave) {
                if (typeof callback == 'function') callback(null);
                return;
            }

            this.conn.writeFile(this.projectPrefix + 'vis-views.json', viewsToSave, mode, function (err) {
                if (err) {
                    if (err == 'permissionError') {
                        that.permissionDenied = true;
                    }
                    that.showMessage(_('Cannot save file "%s": ', that.projectPrefix + 'vis-views.json') + _(err), _('Error'), 'alert', 430);
                } else {
                    that.lastSave = viewsToSave;
                }
                that.saveRemoteActive = 0;
                if (typeof callback == 'function') callback(err);

                // If not yet checked => check if project css file exists
                if (!that.cssChecked) {
                    that.conn.readFile(that.projectPrefix + 'vis-user.css', function (_err, data) {
                        that.cssChecked = true;
                        // Create vis-user.css file if not exist
                        if (err != 'permissionError' && (_err || data === null || data === undefined)) {
                            // Create empty css file
                            that.conn.writeFile(that.projectPrefix + 'vis-user.css', '', function (___err) {
                                if (___err) {
                                    that.showMessage(_('Cannot create file %s: ', 'vis-user.css') + _(___err), _('Error'), 'alert');
                                }
                            });
                        }
                    });
                }
            });
        }
    },
    editInit: function () {
        var that = this;
        // Create debug variables
        vis.states.attr({'dev1.val': 0});
        vis.states.attr({'dev2.val': 0});
        vis.states.attr({'dev3.val': 0});
        vis.states.attr({'dev4.val': 0});
        vis.states.attr({'dev5.val': 1});
        vis.states.attr({'dev6.val': 'string'});
        this.editLoadConfig();

        this.$selectView           = $('#select_view');
        this.$copyWidgetSelectView = $('#rib_wid_copy_view');
        this.$selectActiveWidgets  = $('#select_active_widget');

        this.editInitDialogs();
        this.editInitMenu();
        this.editInitCSSEditor();

        $('#pan_attr').tabs({
            //activate: function(event, ui) {
            //    // Find out index
            //    //var i = 0;
            //    //$(this).find('a').each(function () {
            //    //    if ($(this).attr('href') == ui.newPanel.selector) {
            //    //        return false;
            //    //    }
            //    //    i++;
            //    //});
            //    //that.editSaveConfig('tabs/pan_attr', i);
            //}
        }).resizable({
            handles: 'w',
            maxWidth: 670,
            minWidth: 100,
            resize: function () {
                $(this).css("left", "auto");
            }

        });
        $('#pan_add_wid').resizable({
            handles:  'e',
            maxWidth: 570,
            minWidth: 190,
            resize: function () {
                $('#filter_set').clearSearch('update');
            }
        });

        if (this.config['size/pan_add_wid']) $('#pan_add_wid').width(this.config['size/pan_add_wid']);
        if (this.config['size/pan_attr'])    $('#pan_attr').width(this.config['size/pan_attr']);

        $(window).resize(layout);

        function layout() {
            $('#panel_body').height(parseInt($(window).height() - $('#menu_body').height() - 3));
            $('#vis_wrap').width(parseInt($(window).width() - $('#pan_add_wid').width() - $('#pan_attr').width() - 1));
            that.editSaveConfig('size/pan_add_wid', $('#pan_add_wid').width());
            that.editSaveConfig('size/pan_attr',    $('#pan_attr').width());
            if (vis.css_editor) vis.css_editor.resize();
        }

        layout();

        $('#vis-version').html(this.version);

        $('#button_undo').button({
                icons: {primary: 'ui-icon ui-icon-arrowreturnthick-1-w'},
                text: false
            })
            .css({height: 28})
            .click(function () {
                that.undo();
            })
            .addClass('ui-state-disabled').attr('title', _('Undo'))
            .hover(
                function () {
                    $(this).addClass('ui-state-hover');
                },
                function () {
                    $(this).removeClass('ui-state-hover');
                });

        $('.widget-helper').remove();

        $('input.vis-editor').button();

        $('button.vis-editor').button();

        $('select.vis-editor').each(function () {
            $(this).multiselect({
                multiple:         false,
                classes:          $(this).attr("id"),
                header:           false,
                selectedList:     1,
                minWidth:         $(this).attr('data-multiselect-width'),
                height:           $(this).attr('data-multiselect-height'),
                checkAllText:     _('Check all'),
                uncheckAllText:   _('Uncheck all'),
                noneSelectedText: _('Select options')
            });
        });

        $('select.vis-editor-large').each(function () {
            $(this).multiselect({
                multiple: false,
                header: false,
                //noneSelectedText: false,
                selectedList: 1,
                minWidth: 250,
                height: 410,
                checkAllText: _('Check all'),
                uncheckAllText: _('Uncheck all'),
                noneSelectedText: _('Select options')
            });

        });

        $('select.vis-editor-xlarge').each(function () {
            $(this).multiselect({
                multiple: false,
                header: false,
                // noneSelectedText: false,
                selectedList: 1,
                minWidth: 420,
                height: 340,
                checkAllText: _('Check all'),
                uncheckAllText: _('Uncheck all'),
                noneSelectedText: _('Select options')
            });
        });

        this.$selectActiveWidgets.multiselect({
            classes:          this.$selectActiveWidgets.attr("id"),
            header:           true,
            selectedList:     2,
            minWidth:         this.$selectActiveWidgets.attr('data-multiselect-width'),
            height:           this.$selectActiveWidgets.attr('data-multiselect-height'),
            checkAllText:     _('Check all'),
            uncheckAllText:   _('Uncheck all'),
            noneSelectedText: _('none selected')
        }).change(function () {
            var widgets = [];
            $(this).multiselect('getChecked').each(function () {
                widgets.push(this.value);
            });
            for (var i = that.activeWidgets.length - 1; i >= 0; i--) {
                var pos = widgets.indexOf(that.activeWidgets[i]);
                if (pos === -1) that.activeWidgets.splice(pos, 1);
            }
            for (var j = 0; j < widgets.length; j++) {
                if (that.activeWidgets.indexOf(widgets[j]) === -1) {
                    that.activeWidgets.push(widgets[j]);
                    that.actionHighlightWidget(widgets[j]);
                }
            }
            that.inspectWidgets();
        });
        // Button Click Handler

        $('#export_view').click(function () {
            that.exportView(false);
        });

        $('#export_widgets').click(function () {
            that.exportWidgets();
        });

        $('#import_widgets').click(function () {
            that.importWidgets();
        });

        if (this.conn.getType() == 'local') {
            // @SJ cannot select menu and dialogs if it is enabled
            //$("#wid_all_lock_function").trigger("click");
            $("#ribbon_tab_datei").show();
        }

        $('#start_import_view').button();
        $('#start_import_widgets').button();

        $('#name_import_view').keyup(function (e) {
            if (e.which === 13 && $(this).val()) {
                $('#start_import_view').trigger('click');
            }
            $(this).trigger('change');
        }).change(function () {
            if ($(this).val()) {
                $('#start_import_view').button('enable');
            } else {
                $('#start_import_view').button('disable');
            }
        });

        $('#import_view').click(function () {
            $('#textarea_import_view').val('');
            if ($('#name_import_view').val()) {
                $('#start_import_view').button('enable');
            } else {
                $('#start_import_view').button('disable');
            }
            $('#dialog_import_view').dialog({
                autoOpen: true,
                width:    800,
                height:   600,
                modal:    true,
                open: function (event, ui) {
                    $('[aria-describedby="dialog_import_view"]').css('z-index', 1002);
                    $('.ui-widget-overlay').css('z-index', 1001);
                    $('#start_import_view').unbind('click').click(function () {
                        that.importView();
                        $('#dialog_import_view').dialog('close');
                    });
                    $('#name_import_view').show();
                }
            });
        });

        $('#create_instance').button({icons: {primary: 'ui-icon-plus'}}).click(this.generateInstance);

        $('#vis_access_mode').change(function () {
            that.conn.chmodProject(that.projectPrefix, $(this).prop('checked') ? 0x644 : 0x600, function (err, files) {
                if (err) {
                    that.showError(err);
                    $('#vis_access_mode').prop('checked', !$('#vis_access_mode').prop('checked')).prop('disabled');
                }
            });
        });

        this.initStealHandlers();

        $('.vis-inspect-view-css').change(function () {
            var $this = $(this);
            var attr = $this.attr('id').slice(17);
            var val = $this.val();
            $('#visview_' + that.activeView).css(attr, val);
            // Update background-xxx if changed background and vice versa
            if (attr.match(/^background-/)) {
                $('#inspect_view_css_background').val($('#visview_' + that.activeView).css('background'));
            } else if (attr == 'background') {
                $('.vis-inspect-view-css').each(function () {
                    var attr = $(this).attr('id').slice(17);
                    if (attr.match(/^background-/)) {
                        $(this).val($('#visview_' + that.activeView).css(attr));
                    }
                });
            }

            if (!that.views[that.activeView].settings.style) that.views[that.activeView].settings.style = {};
            that.views[that.activeView].settings.style[attr] = val;
            that.save();
        }).keyup(function () {
            $(this).trigger('change');
        });

        $('.vis-inspect-view').change(function () {
            var $this = $(this);
            var attr = $this.attr('id').slice(13);
            that.views[that.activeView].settings[attr] = $this.val();
            that.save();
        }).keyup(function () {
            $(this).trigger('change');
        });

        $('#screen_size').selectmenu({
            change: function () {
                var val = $(this).val();
                if (!val) {
                    $('#screen_size_x').prop('disabled', true).val('').trigger('change');
                    $('#screen_size_y').prop('disabled', true).val('').trigger('change');
                    $('.vis-screen-default').prop('disabled', true).prop('checked', false);
                    $('.rib_tool_resolution_toggle').button('disable');
                } else if (val == 'user') {
                    $('#screen_size_x').prop('disabled', false);
                    $('#screen_size_y').prop('disabled', false);
                    $('.vis-screen-default').prop('disabled', false);
                    $('.rib_tool_resolution_toggle').button('enable');
                    $("#rib_tools_resolution_fix").toggle();
                    $("#rib_tools_resolution_manuel").toggle();
                } else {
                    var size = val.split('x');
                    $('.rib_tool_resolution_toggle').button('enable');
                    $('.vis-screen-default').prop('disabled', false);
                    $('#screen_size_x').val(size[0]).trigger('change').prop('disabled', true);
                    $('#screen_size_y').val(size[1]).trigger('change').prop('disabled', true);
                }
            },
            width: '100%'
        });

        $('#screen_size-menu').css({'max-height': '400px'});

        $('#screen_size_x').change(function () {
            var x = $('#screen_size_x').val();
            var y = $('#screen_size_y').val();
            if (x <= 0) {
                $('#size_x').hide();
            } else {
                $('#size_x').css('left', (parseInt(x, 10) + 1) + 'px').show();
                $('#size_y').css('width', (parseInt(x, 10) + 3) + 'px');
                if (y > 0) {
                    $('#size_x').css('height', (parseInt(y, 10) + 3) + 'px');
                }
            }
            if (that.views[that.activeView].settings.sizex != x) {
                that.views[that.activeView].settings.sizex = x;
                that.setViewSize(that.activeView);
                that.save();
            }
        }).keyup(function () {
            $(this).trigger('change');
        }).keydown(function (e) {
            // Allow: backspace, delete, tab, escape, enter and .
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode == 65 && ( e.ctrlKey === true || e.metaKey === true ) ) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });

        $('.vis-screen-default').change(function () {
            if (that.views[that.activeView].settings.useAsDefault != $(this).prop('checked')) {
                that.views[that.activeView].settings.useAsDefault = $(this).prop('checked');
                $('.vis-screen-default').prop('checked', $(this).prop('checked'));
                that.save();
            }
        });

        $('.vis-screen-render-always').change(function () {
            if (that.views[that.activeView].settings.alwaysRender != $(this).prop('checked')) {
                that.views[that.activeView].settings.alwaysRender  = $(this).prop('checked');
                $('.vis-screen-render-always').prop('checked', $(this).prop('checked'));
                that.save();
            }
        });

        $('#screen_size_y').change(function () {
            var x = $('#screen_size_x').val();
            var y = $('#screen_size_y').val();
            if (y > 0) {
                $('#size_y').css('top', (parseInt(y, 10) + 1) + 'px').show();
                $('#size_x').css('height', (parseInt(y, 10) + 3) + 'px');
                if (x > 0) {
                    $('#size_y').css('width', (parseInt(x, 10) + 3) + 'px');
                }
            } else {
                $('#size_y').hide();

            }
            if (that.views[that.activeView].settings.sizey != y) {
                that.views[that.activeView].settings.sizey = y;
                that.setViewSize(that.activeView);
                that.save();
            }

        }).keyup(function () {
            $(this).trigger('change');
        }).keydown(function (e) {
            // Allow: backspace, delete, tab, escape, enter and .
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode == 65 && ( e.ctrlKey === true || e.metaKey === true ) ) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });

        $('#grid_size').change(function () {
            var gridSize = $(this).val();
            if (that.views[that.activeView].settings.gridSize != gridSize) {
                var aw = JSON.stringify(that.activeWidgets);
                that.views[that.activeView].settings.gridSize = gridSize;
                that.save();
                that.inspectWidgets([]);
                that.editSetGrid();
                setTimeout(function () {
                    that.inspectWidgets(JSON.parse(aw));
                }, 200);
            }
        }).keyup(function () {
            $(this).trigger('change');
        });

        $('#snap_type').selectmenu({
            change: function () {
                var aw = JSON.stringify(that.activeWidgets);
                that.views[that.activeView].settings.snapType = $(this).val();

                $('#grid_size').prop('disabled', that.views[that.activeView].settings.snapType != 2);

                if (that.views[that.activeView].settings.snapType == 2 && !$('#grid_size').val()) $('#grid_size').val(10).trigger('change');
                that.editSetGrid();
                that.save();
                that.inspectWidgets([]);
                setTimeout(function () {
                    that.inspectWidgets(JSON.parse(aw));
                }, 200);
            },
            width: '100%'
        });

        $('#dev_show_html').button({}).click(function () {
            var text = '';
            for (var i = 0; i < that.activeWidgets.length; i++) {
                var widID = $('#' + that.activeWidgets[i]).attr('id');

                var xid =  (new Date()).valueOf().toString(32);

                var $target = $('#' + widID);
                var $clone = $target.clone();
                $clone.wrap('<div>');
                var html = $clone.parent().html();

                html = html
                    .replace(/id="[-_\w\d]+"/, '')
                    .replace(/data-[\w+]="[-_\w\d]+"/, '')
                    .replace('vis-widget ', 'vis-widget_prev ')
                    .replace('vis-widget-body', 'vis-widget-prev-body')
                    .replace('vis-widget-lock', ' ')
                    .replace('ui-selectee', ' ')
                    .replace('ui-draggable-handle', ' ')
                    .replace('ui-draggable', ' ')
                    .replace('ui-resizable', ' ')
                    .replace('<div class="editmode-helper"></div>', '')
                    //.replace(/(id=")[A-Za-z0-9\[\]._]+"/g, '')
                    .replace(/w([0-9]){5}/g, xid)
                    .replace(/(?:\r\n|\r|\n)/g, '')
                    .replace(/\t/g, ' ')
                    .replace(/[ ]{2,}/g, ' ');

                html = html
                    .replace('<div class="ui-resizable-handle ui-resizable-e" style="z-index: 90;"></div>', '')
                    .replace('<div class="ui-resizable-handle ui-resizable-s" style="z-index: 90;"></div>', '')
                    .replace('<div class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se" style="z-index: 90;"></div>', '')
                    .replace('<div></div>', '');

                html = '<div id="prev_' + that.views[that.activeView].widgets[widID].tpl + '" style="position: relative; text-align: initial;padding: 4px ">' + html.toString() + '</div>';
                text += html;
            }
            $('body').append('<div id="dec_html_code"><textarea style="width: 100%; height: 100%">data-vis-prev=\'' + text + '\'</textarea></div>');
            $('#dec_html_code').dialog({
                width: 800,
                height: 600,
                open: function () {
                    $(this).parent().css({'z-index': 1001});
                },
                close: function () {
                    $('#dec_html_code').remove();
                }
            });
        });

        $('#btn_accordeon').
            button({icons: {primary: 'ui-icon-grip-dotted-horizontal', secondary: null}, text: false}).
            css({width: 18, height: 18}).
            click(function () {
                that.widgetAccordeon = !that.widgetAccordeon;
                that.editUpdateAccordeon();
            });

        if (this.config.widgetAccordeon) {
            this.widgetAccordeon = true;
            this.editUpdateAccordeon();
        }

        // Bug in firefox or firefox is too slow or too fast
        /*setTimeout(function() {

         if (document.getElementById('select_active_widget')._isOpen === undefined) {
         $('#select_active_widget').html('<option value="none">' + _('none selected') + '</option>');
         if (this.activeView && this.views && this.views[this.activeView] && this.views[this.activeView].widgets) {
         for (var widget in this.views[this.activeView].widgets) {
         var obj = $('#' + this.views[this.activeView].widgets[widget].tpl);
         $('#select_active_widget').append("<option value='" + widget + "'>" + this.getWidgetName(this.activeView, widget) + </option>");
         }
         }
         $('#select_active_widget').multiselect('refresh');
         }

         }, 10000);*/

        // Instances (Actually not used)
        /*if (typeof storage !== 'undefined' && local == false) {
            // Show what's new
            if (storage.get('lastVersion') != this.version) {
                // Read
                storage.set('lastVersion', this.version);
                // Read io-addon.json
                $.ajax({
                    url: 'io-addon.json',
                    cache: false,
                    success: function (data) {

                        try {
                            var ioaddon = data;
                            if (ioaddon.whatsNew) {
                                for (var i = 0; i < ioaddon.whatsNew.length; i++) {
                                    var text = ioaddon.whatsNew[i];
                                    if (typeof text != 'string') {
                                        text = ioaddon.whatsNew[i][that.language] || ioaddon.whatsNew[i]['en'];
                                    }
                                    // Remove modifier information like (Bluefox) or (Hobbyquaker)
                                    if (text[0] == '(') {
                                        var j = text.indexOf(')');
                                        if (j != -1) {
                                            text = text.substring(j + 1);
                                        }
                                    }
                                    that.showHint('<b>' + _('New:') + '</b>' + text, 30000, 'info');
                                }
                            }
                        } catch (e) {
                            that.conn.logError('Cannot parse io-addon.json ' + e);
                        }
                    }
                });
            }
        }*/
        if (this.config.groupsState) this.groupsState = this.config.groupsState;
    },
    editSetGrid: function () {
        var grid = parseInt(this.views[this.activeView].settings.gridSize, 10);
        if (this.views[this.activeView].settings.snapType == 2 && grid > 2) {
            var $grid = $('#vis_container .vis-grid');
            if (!$grid.length) {
                $('#vis_container').prepend('<div class="vis-grid"></div>');
                $grid = $('#vis_container .vis-grid');
            }

            var img;
            if (grid <= 6) {
                img = 'bg-dots-5.svg';
            } else if (grid <= 12) {
                img = 'bg-dots-10.svg';
            } else if (grid <= 17) {
                img = 'bg-dots-15.svg';
            } else if (grid <= 25) {
                img = 'bg-dots-20.svg';
            } else if (grid <= 35) {
                img = 'bg-dots-30.svg';
            } else if (grid <= 45) {
                img = 'bg-dots-40.svg';
            } else {
                img = 'bg-dots-50.svg';
            }

            $grid
                .addClass('vis-grid')
                .css({
                    'background-size':  this.views[this.activeView].settings.gridSize + 'px ' + this.views[this.activeView].settings.gridSize + 'px',
                    'background-image': 'url(img/' + img + ')'
                });
        } else {
            $('#vis_container .vis-grid').remove();
        }
    },
    editShowLeadingLines: function () {
        // there are following lines
        // horz-top
        // horz-bottom
        // horz-center
        // vert-left
        // vert-right
        // vert-middle
    },
    editUpdateAccordeon: function () {
        var that = this;

        if (that.widgetAccordeon) {
            $('#btn_accordeon').addClass('ui-state-error');
            var opened = '';
            $('.group-control').each(function () {
                var group = $(this).attr('data-group');
                if (that.groupsState[group]) {
                    if (!opened) {
                        opened = group;
                    } else {
                        that.groupsState[group] = false;
                        $(this).button('option', {
                            icons: {primary: that.groupsState[group] ? "ui-icon-triangle-1-n" : "ui-icon-triangle-1-s"}
                        });
                        if (that.groupsState[group]) {
                            $('.group-' + group).show();
                        } else {
                            $('.group-' + group).hide();
                        }
                    }
                }

                that.editSaveConfig('groupsState', that.groupsState);
            });
        } else {
            $('#btn_accordeon').removeClass('ui-state-error');
        }
        that.editSaveConfig('widgetAccordeon', that.widgetAccordeon);
    },
    editInitDialogs: function () {
		if (typeof fillAbout !== 'undefined') {
			$('#dialog_about').html(fillAbout());
			$('#dialog_about').dialog({
				autoOpen: false,
				width:    600,
				height:   550,
                open:     function (/*event, ui*/) {
                    $('[aria-describedby="dialog_about"]').css('z-index', 1002);
                    $('.ui-widget-overlay').css('z-index', 1001);
                },
				position: {
					my: 'center',
					at: 'center',
					of: $('#panel_body')
				}
			});
		}

        $('#dialog_shortcuts').dialog({
            autoOpen: false,
            width: 600,
            height: 500,
            open:     function (/*event, ui*/) {
                $('[aria-describedby="dialog_shortcuts"]').css('z-index', 1002);
                $('.ui-widget-overlay').css('z-index', 1001);
            },
            position: {my: 'center', at: 'center', of: $('#panel_body')}
        });

    },
    editInitMenu: function () {
        var that = this;
        $('#menu.sf-menu').superclick({
            hoverClass: 'sfHover',
            uiClass:    'ui-state-hover',  // jQuery-UI modified
            pathLevels: 1,
            cssArrows:  false,
            disableHI:  false
        });

        $('li.ui-state-default').hover(
            function () {
                $(this).addClass('ui-state-hover');
            },
            function () {
                $(this).removeClass('ui-state-hover');
            }
        );

        $('#menu_body').tabs({
            active:      this.config['tabs/menu_body'] === undefined ? 2 : this.config['tabs/menu_body'],
            collapsible: true,
            activate: function (event, ui) {
                // Find out index
                var i = 0;
                $(this).find('a').each(function () {
                    if ($(this).attr('href') == ui.newPanel.selector) {
                        return false;
                    }
                    i++;
                });
                that.editSaveConfig('tabs/menu_body', i);
            }
        });

        // Tabs open Close
        $('#menu_body > ul > li').click(function () {
            // TODO store if collapsed or not
            if (!$('#menu_body').tabs('option', 'active')) that.editSaveConfig('tabs/menu_body', false);
            $(window).trigger('resize');
        });

        if (this.config['show/ribbon_tab_dev']) $('#ribbon_tab_dev').toggle();

        // Theme select Editor
        if (this.config.editorTheme) {
            $('#commonTheme').remove();
            $('head').prepend('<link rel="stylesheet" type="text/css" href="../../lib/css/themes/jquery-ui/' + this.config.editorTheme + '/jquery-ui.min.css" id="commonTheme"/>');
            $('[data-theme=' + this.config.editorTheme + ']').addClass('ui-state-active');
        }

        $('#ul_theme li a').click(function () {
            var theme = $(this).data('info');
            // deselect all
            $('#ul_theme li').removeClass('ui-state-active');
            $('#commonTheme').remove();
            $('head').prepend('<link rel="stylesheet" type="text/css" href="../../lib/css/themes/jquery-ui/' + theme + '/jquery-ui.min.css" id="commonTheme"/>');
            //that.additionalThemeCss(theme);

            var oldValue = that.config.editorTheme;
            that.editSaveConfig('editorTheme', theme);
            that.calcCommonStyle(true);
            // We must re-render all opened views
            for (var view in that.views) {
                if ($('.vis-view #visview' + view).length &&
                    (that.views[view].settings.theme == theme || that.views[view].settings.theme == oldValue)) {
                    that.renderView(view, false);
                }
            }

            setTimeout(function () {
                $('#scrollbar_style').remove();
                $('head').prepend('<style id="scrollbar_style">html{}::-webkit-scrollbar-thumb {background-color: ' + $(".ui-widget-header ").first().css("background-color") + '}</style>');
            }, 300);

            // Select active theme in menu
            $('[data-theme=' + theme + ']').addClass('ui-state-active');

            that.save();
        });


        //language
        $('[data-language=' + ((typeof this.language === 'undefined') ? 'en' : (this.language || 'en')) + ']').addClass('ui-state-active');

        $('.language-select').click(function () {
            $('[data-language=' + that.language + ']').removeClass('ui-state-active');
            that.language = $(this).data('language');
            $(this).addClass('ui-state-active');
            if (typeof systemLang != 'undefined') systemLang = that.language;
            setTimeout(function () {
                translateAll();
            }, 0);
        });


        $('#m_about').click(function () {
            $('#dialog_about').dialog('open');
        });
        $('#m_shortcuts').click(function () {
            $('#dialog_shortcuts').dialog('open');
        });
        //$("#m_setup").click(function () {
        //    $("#dialog_setup").dialog("open");
        //});


        // fill projects
        this.conn.readProjects(function (err, projects){
            var text = '';
            if (projects.length) {
                for (var d = 0; d < projects.length; d++) {
                    text += '<li class="ui-state-default project-select ' + (projects[d].name + '/' == this.projectPrefix ? 'ui-state-active' : '') +
                        ' menu-item" data-project="' + projects[d].name + '"><a>' + projects[d].name + (projects[d].readOnly ? ' (' + _('readOnly') + ')' : '') + '</a></li>\n';
                    if (projects[d].name + '/' == that.projectPrefix) {
                        $('#vis_access_mode').prop('checked', projects[d].mode & 0x60);
                    }
                }
                $('#menu_projects').html(text);
                $('.project-select').unbind('click').click(function () {
                    window.location.href = 'edit.html?' + $(this).attr('data-project');
                });
            } else {
                $('#li_menu_projects').hide();
            }
        }.bind(this));

        $('#new-project-name').keypress(function(e) {
            if (e.which == 13) {
                $('#dialog-new-project').parent().find('#ok').trigger('click');
            }
        });
        $('.project-new').click(function () {
            $('#dialog-new-project').dialog({
                autoPen: true,
                width:   400,
                height:  190,
                modal: true,
                draggable: false,
                resizable: false,
                open:    function () {
                    $('[aria-describedby="dialog-new-project"]').css('z-index', 1002);
                    //$('.ui-widget-overlay').css('z-index', 1001);
                },
                buttons: [
                    {
                        id: 'ok',
                        text: _('Ok'),
                        click: function () {
                            var name = $('#new-project-name').val();
                            if (!name) {
                                window.alert(_('Empty name is not allowed!'));
                                return;
                            }
                            $('.project-select').each(function () {
                                if ($(this).data('project') == name) {
                                    window.alert(_('Project yet exists!'));
                                }
                            });

                            window.location.href = 'edit.html?' + name;

                            $('#dialog-new-project').dialog('close');
                        }
                    },
                    {
                        text: _('Cancel'),
                        click: function () {
                            $('#dialog-new-project').dialog('close');
                        }
                    }
                ]
            });
        });

        if ($.fm) {
            $('#li_menu_file_manager').click(function () {
                var defPath = ('/' + (that.conn.namespace ? that.conn.namespace + '/' : '') + that.projectPrefix + 'img/');

                $.fm({
                    lang:         that.language,
                    defaultPath:  defPath,
                    path:         that.lastUserPath || defPath,
                    uploadDir:    '/' + (that.conn.namespace ? that.conn.namespace + '/' : ''),
                    fileFilter:   [],
                    folderFilter: false,
                    mode:         'show',
                    view:         'prev',
                    conn:         that.conn,
                    zindex:       1001
                }, function (_data) {
                    that.lastUserPath = _data.path;
                });
            });
        } else {
            $('#li_menu_file_manager').hide();
        }

        $('#li_menu_object_browser').click(function () {
            var $dlg = $('#dialog-select-member-object-browser');
            if (!$dlg.length) {
                $('body').append('<div id="dialog-select-member-object-browser" style="display:none"></div>');
                $dlg = $('#dialog-select-member-object-browser');
                $dlg.selectId('init', {
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
                    noMultiselect: true,
                    columns: ['image', 'name', 'type', 'role', 'enum', 'room', 'value'],
                    imgPath: '/lib/css/fancytree/',
                    objects: that.objects,
                    states:  that.states,
                    zindex:  1001
                });
            }

            $dlg.selectId('show', function (newId, oldId) {
                var $temp = $('<input>');
                $dlg.append($temp);
                $temp.val(newId).select();
                document.execCommand('copy');
                $temp.remove();
                that.showHint(_('Object ID "%s" copied to clipboard', newId) + '.', 15000);
            });
        });

        // Ribbon icons Global

        $('.icon-on-iconbar')
            .hover(
            function () {
                $(this).parent().addClass('ui-state-hover');
            },
            function () {
                $(this).parent().removeClass('ui-state-hover');
            })
            .click(function () {
                $(this).stop(true, true).effect("highlight");
            });

        // Widget ----------------------------------------------------------------

        $('#rib_wid_del').button({icons: {primary: 'ui-icon-trash', secondary: null}, text: false}).click(function () {
            that.delWidgets();
        });

        $('#rib_wid_doc').button({icons: {primary: 'ui-icon-info', secondary: null}, text: false}).click(function () {
            if (that.activeWidgets[0]) {
                var tpl = that.views[that.activeView].widgets[that.activeWidgets[0]].tpl;
                var widgetSet = $('#' + tpl).attr('data-vis-set');
                var docUrl = 'widgets/' + widgetSet + '/doc.html#' + tpl;
                window.open(docUrl, 'WidgetDoc', 'height=640,width=500,menubar=no,resizable=yes,scrollbars=yes,status=yes,toolbar=no,location=no');
            }
        });

        // Copy Widget to -----------------
        $('#rib_wid_copy').button({icons: {primary: 'ui-icon-copy', secondary: null}, text: false}).click(function () {
            $('#rib_wid').hide();
            $('#rib_wid_copy_tr').show();
        });
        $("#rib_wid_copy_cancel").button({icons: {primary: 'ui-icon-cancel', secondary: null}, text: false}).click(function () {
            $('#rib_wid').show();
            $('#rib_wid_copy_tr').hide();
        });

        $("#rib_wid_copy_ok").button({icons: {primary: 'ui-icon-check', secondary: null}, text: false}).click(function () {
            that.dupWidgets(null, $('#rib_wid_copy_view').val());
            $('#rib_wid').show();
            $('#rib_wid_copy_tr').hide();
        });

        // Widget Align ---------------------
        $("#wid_align_left").click(function () {
            var data = [];
            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }

            $.each(that.activeWidgets, function () {
                var _data = {
                    wid:  this,
                    left: parseInt($('#' + this).css("left"))
                };
                data.push(_data);
            });

            function sortByLeft(a, b) {
                var aName = a.left;
                var bName = b.left;
                return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
            }

            data.sort(sortByLeft);
            var left = data.shift().left;

            $.each(data, function () {
                $('#' + this.wid).css('left', left  + 'px');
                that.views[that.activeView].widgets[this.wid].style.left = left + "px";
                that.showWidgetHelper(this.wid, true);
            });
            that.save();
        });
        $("#wid_align_right").click(function () {
            var data = [];
            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }
            $.each(that.activeWidgets, function () {
                var _data = {
                    wid:  this,
                    left: parseInt($('#' + this).css("left"))
                };
                data.push(_data);
            });

            function sortByLeft(a, b) {
                var aName = a.left;
                var bName = b.left;
                return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
            }

            data.sort(sortByLeft);
            var left = data.pop().left;

            $.each(data, function(){
                $('#' + this.wid).css("left", left + "px");
                that.views[that.activeView].widgets[this.wid].style.left = left + "px";
                that.showWidgetHelper(this.wid, true);
            });
            that.save();
        });
        $("#wid_align_top").click(function () {
            var data = [];
            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }
            $.each(that.activeWidgets, function () {
                var _data = {
                    wid: this,
                    top: parseInt($('#' + this).css("top"))
                };
                data.push(_data);
            });

            function sortByTop(a, b) {
                var aName = a.top;
                var bName = b.top;
                return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
            }

            data.sort(sortByTop);
            var top = data.shift().top;

            $.each(data, function () {
                $('#' + this.wid).css("top", top  +"px");
                that.views[that.activeView].widgets[this.wid].style.top = top + "px";
                that.showWidgetHelper(this.wid, true);
            });
            that.save();
        });
        $("#wid_align_bottom").click(function () {
            var data = [];

            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }

            $.each(that.activeWidgets, function () {
                var _data = {
                    wid: this,
                    top: parseInt($('#' + this).css("top"))
                };
                data.push(_data);
            });

            function sortByTop(a, b) {
                var aName = a.top;
                var bName = b.top;
                return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
            }

            data.sort(sortByTop);
            var top = data.pop().top;

            $.each(data, function () {
                $('#' + this.wid).css("top", top  +"px");
                that.views[that.activeView].widgets[this.wid].style.top = top + "px";
                that.showWidgetHelper(this.wid, true);
            });
            that.save();
        });
        $("#wid_align_vc").click(function () {
            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }

            var min_top = 9999;
            var max_bottom = 0;
            var middle;
            $.each(that.activeWidgets, function () {
                var top = parseInt($('#' + this).css('top'));
                var bottom = top + $('#' + this).height();
                if (min_top > top) min_top = top;
                if (max_bottom < bottom) max_bottom = bottom;
            });
            middle = min_top + (max_bottom - min_top) / 2;
            $.each(that.activeWidgets, function () {
                var top = middle - ($('#' + this).height() / 2);
                $('#' + this).css("top", top + "px");
                that.views[that.activeView].widgets[this].style.top = top + "px";
                that.showWidgetHelper(this.wid, true);
            });
            that.save();
        });
        $("#wid_align_hc").click(function () {
            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }

            var min_left = 9999;
            var max_right = 0;
            var middle;
            $.each(that.activeWidgets, function () {
                var left = parseInt($('#' + this).css("left"));
                var right = left + $('#' + this).width();
                if (min_left > left) min_left = left;
                if (max_right < right) max_right = right;
            });
            middle = min_left + (max_right - min_left) / 2;
            $.each(that.activeWidgets, function () {
                var left = middle - ($('#' + this).width() / 2);
                $('#' + this).css("left", left +"px");
                that.views[that.activeView].widgets[this].style.left = left + "px";
                that.showWidgetHelper(this.wid, true);
            });
            that.save();
        });
        $("#wid_dis_h").click(function () {
            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }

            var data = [];
            var min_left = 9999;
            var max_right = 0;
            var cont_size = 0;
            var between;
            $.each(that.activeWidgets, function () {
                var left = parseInt($('#' + this).css("left"));
                var right = left + $('#' + this).width();
                cont_size = cont_size + $('#' + this).width();
                if (min_left > left) min_left = left;
                if (max_right < right) max_right = right;
                var _data = {
                    wid:  this,
                    left: left
                };
                data.push(_data);
            });

            between = (max_right - min_left - cont_size) / (that.activeWidgets.length - 1);

            if (between < 0 ) between = 0;

            function sortByLeft(a, b) {
                var aName = a.left;
                var bName = b.left;
                return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
            }

            data.sort(sortByLeft);
            var first = data.shift();
            var left  = first.left + $('#' + first.wid).width();

            $.each(data, function(){
                left = left + between;
                $('#' + this.wid).css("left", left + "px");
                that.views[that.activeView].widgets[this.wid].style.left = left + "px";
                left = left + $('#' + this.wid).width();
                that.showWidgetHelper(this.wid, true);
            });
            that.save();
        });
        $("#wid_dis_v").click(function () {
            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }

            var data = [];
            var min_top = 9999;
            var max_bottom = 0;
            var cont_size = 0;
            var between;

            $.each(that.activeWidgets, function () {
                var top = parseInt($('#' + this).css("top"));
                var bottom = top + $('#' + this).height();
                cont_size = cont_size + $('#' + this).height();
                if (min_top > top) min_top = top;
                if (max_bottom < bottom) max_bottom = bottom;

                var _data = {
                    wid: this,
                    top: top
                };
                data.push(_data);
            });

            between = (max_bottom - min_top - cont_size) / (that.activeWidgets.length - 1);
            if (between < 0 ) between = 0;
            function sortByTop(a, b) {
                var aName = a.top;
                var bName = b.top;
                return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
            }

            data.sort(sortByTop);
            var first = data.shift();
            var top  = first.top + $('#' + first.wid).height();

            $.each(data, function () {
                top = top + between;
                $('#' + this.wid).css("top", top + "px");
                that.views[that.activeView].widgets[this.wid].style.top = top + "px";
                top = top + $('#' + this.wid).height();
                that.showWidgetHelper(this.wid, true);
            });
            that.save();
        });
        $("#wid_align_width").click(function () {
            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }
            if (that.alignType != 'wid_align_width') {
                that.alignIndex = 0;
                that.alignValues = [];
                for (var t = 0; t < that.activeWidgets.length; t++) {
                    var w = $('#' + that.activeWidgets[t]).width();
                    if (that.alignValues.indexOf(w) === -1)
                    that.alignValues.push(w);
                }

                that.alignType = 'wid_align_width';
            }
            that.alignIndex++;
            if (that.alignIndex >= that.alignValues.length) that.alignIndex = 0;

            for (var k = 0; k < that.activeWidgets.length; k++) {
                $('#' + that.activeWidgets[k]).width(that.alignValues[that.alignIndex]);
                that.views[that.activeView].widgets[that.activeWidgets[k]].style.width = that.alignValues[that.alignIndex] + "px";
                that.showWidgetHelper(that.activeWidgets[k], true);
            }
            that.save();
        });
        $("#wid_align_height").click(function () {
            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }
            if (that.alignType != 'wid_align_height') {
                that.alignIndex = 0;
                that.alignValues = [];
                for (var t = 0; t < that.activeWidgets.length; t++) {
                    var h = $('#' + that.activeWidgets[t]).height();
                    if (that.alignValues.indexOf(h) === -1)
                        that.alignValues.push(h);
                }

                that.alignType = 'wid_align_height';
            }
            that.alignIndex++;
            if (that.alignIndex >= that.alignValues.length) that.alignIndex = 0;

            for (var u = 0; u < that.activeWidgets.length; u++) {
                $('#' + that.activeWidgets[u]).height(that.alignValues[that.alignIndex]);
                that.views[that.activeView].widgets[that.activeWidgets[u]].style.height = that.alignValues[that.alignIndex] + "px";
                that.showWidgetHelper(that.activeWidgets[u], true);
            }
            that.save();
        });

        // All Widget ---------------------
        $("#wid_all_lock_function").button({icons: {primary: 'ui-icon-locked', secondary: null}, text: false}).click(function () {
            if ($('#wid_all_lock_function').prop('checked')) {
                $("#vis_container").find(".vis-widget").addClass("vis-widget-lock");
                $('#wid_all_lock_f').addClass("ui-state-focus");
            } else {
                $("#vis_container").find(".vis-widget").removeClass("vis-widget-lock");
                $('#wid_all_lock_f').removeClass("ui-state-focus");
            }
            that.editSaveConfig('button/wid_all_lock_function', $('#wid_all_lock_function').prop('checked'));
        });

        // Enable by default widget lock function
        if (this.config['button/wid_all_lock_function'] === undefined ||
            this.config['button/wid_all_lock_function']) {
            setTimeout(function () {
                $('#wid_all_lock_function').prop('checked', true);
                $("#vis_container").find(".vis-widget").addClass("vis-widget-lock");
                $('#wid_all_lock_f').addClass("ui-state-focus ui-state-active");
            }, 200);
        }

        $("#wid_all_lock_drag").button({icons: {primary: 'ui-icon-extlink', secondary: null}, text: false}).click(function () {
            $('#wid_all_lock_d').removeClass("ui-state-focus");
            that.inspectWidgets([]);
            //that.editSaveConfig('checkbox/wid_all_lock_function', $('#wid_all_lock_function').prop('checked'));
        });

        // View ----------------------------------------------------------------

        // Add View -----------------
        $('#rib_view_add').button({icons: {primary: 'ui-icon-plusthick', secondary: null}, text: false}).click(function () {
            $('#rib_view').hide();
            $('#rib_view_add_tr').show();
            $('#rib_view_addname').val('').focus();
        });
        $("#rib_view_add_cancel").button({icons: {primary: 'ui-icon-cancel', secondary: null}, text: false}).click(function () {
            $('#rib_view').show();
            $('#rib_view_add_tr').hide();
        });
        $('#rib_view_addname').keyup(function (e) {
            // On enter
            if (e.which === 13) $("#rib_view_add_ok").trigger('click');
            // esc
            if (e.which === 27) $("#rib_view_add_cancel").trigger('click');
        });

        $("#rib_view_add_ok").button({icons: {primary: 'ui-icon-check', secondary: null}, text: false}).click(function () {
            var name = that.checkNewViewName($('#rib_view_addname').val().trim());
            if (name !== false) {
                setTimeout(function () {
                    that.addView(name);
                    $('#rib_view').show();
                    $('#rib_view_add_tr').hide();
                }, 0);
            }
        });

        // Delete View -----------------
        $('#rib_view_del').button({icons: {primary: 'ui-icon-trash', secondary: null}, text: false}).click(function () {
            that.delView(that.activeView);
        });
        // Rename View -----------------

        $('#rib_view_rename').button({icons: {primary: 'ui-icon-pencil', secondary: null}, text: false}).click(function () {
            $('#rib_view').hide();
            $('#rib_view_rename_tr').show();
            $('#rib_view_newname').val(that.activeView).focus();
        });
        $("#rib_view_rename_cancel").button({icons: {primary: 'ui-icon-cancel', secondary: null}, text: false}).click(function () {
            $('#rib_view').show();
            $('#rib_view_rename_tr').hide();
        });
        $('#rib_view_newname').keyup(function (e) {
            // On enter
            if (e.which === 13) $("#rib_view_rename_ok").trigger('click');
            // esc
            if (e.which === 27) $("#rib_view_rename_cancel").trigger('click');
        });
        $("#rib_view_rename_ok").button({icons: {primary: 'ui-icon-check', secondary: null}, text: false}).click(function () {
            var name = that.checkNewViewName($('#rib_view_newname').val().trim());
            if (name === false) return;
            that.renameView(that.activeView, name);
            $('#rib_view').show();
            $('#rib_view_rename_tr').hide();
        });

        // Copy View -----------------
        $('#rib_view_copy').button({icons: {primary: 'ui-icon-copy', secondary: null}, text: false}).click(function () {
            $('#rib_view').hide();
            $('#rib_view_copy_tr').show();
            $('#rib_view_copyname').val(that.activeView + "_new").focus();
        });
        $("#rib_view_copy_cancel").button({icons: {primary: 'ui-icon-cancel', secondary: null}, text: false}).click(function () {
            $('#rib_view').show();
            $('#rib_view_copy_tr').hide();
        });
        $('#rib_view_copyname').keyup(function (e) {
            // On enter
            if (e.which === 13) $("#rib_view_copy_ok").trigger('click');
            // esc
            if (e.which === 27) $("#rib_view_copy_cancel").trigger('click');
        });
        $("#rib_view_copy_ok").button({icons: {primary: 'ui-icon-check', secondary: null}, text: false}).click(function () {
            var name = that.checkNewViewName($('#rib_view_copyname').val().trim());
            if (name === false) return;
            that.dupView(that.activeView, name);
            $('#rib_view').show();
            $('#rib_view_copy_tr').hide();
        });


        // Tools ----------------------------------------------------------------
        // Resolution -----------------

        $(".rib_tool_resolution_toggle").button({
            text:  false,
            icons: {primary: 'ui-icon-refresh'}
        }).css({width: 22, height: 22}).click(function () {
            $("#rib_tools_resolution_fix").toggle();
            $("#rib_tools_resolution_manuel").toggle();
        });

        $('#saving_progress').button({
            text:  false,
            icons: {primary: 'ui-icon-disk'}
        }).click(function () {
            that._saveToServer();
        }).hide().addClass('ui-state-active');

        this.config['button/closeMode'] = this.config['button/closeMode'] || 'close';

        $('#exit_button').button({
            text:  false,
            icons: {
                primary: 'ui-icon-' + this.config['button/closeMode']
            }
        }).click(function () {
            that.saveRemote(function () {
                if (that._saveTimer) {
                    $('#saving_progress').hide();
                    clearTimeout(that._saveTimer);
                    that._saveTimer = null;
                }

                if (that.config['button/closeMode'] == 'refresh') {
                    that.conn.sendCommand('*', 'refresh', null, false);
                } else if (that.config['button/closeMode'] == 'play') {
                    try {
                        var win = window.open(document.location.protocol + '//' + document.location.host + document.location.pathname.replace('edit', 'index') + window.location.search + '#' + that.activeView, 'vis-runtime');
                        if (win) {
                            win.location.reload();
                            win.focus();
                        } else {
                            that.showError(_('Popup window blocked!'), _('Cannot open new window'), 'alert');
                        }
                    } catch (err) {
                        that.showError(_('Popup window blocked: %s!', err), _('Cannot open new window'), 'alert');
                    }
                } else {
                    // Show hint how to get back to edit mode
                    if (!that.config['dialog/isEditHintShown']) {
                        window.alert(_('To get back to edit mode just call "%s" in browser', location.href));
                        that.editSaveConfig('button/isEditHintShown', true);
                    }

                    // Some systems (e.g. offline mode) show here the content of directory if called without index.html
                    location.href = 'index.html' + window.location.search + '#' + that.activeView;
                }
            });
        });

        $('#exit_button_select').button({
            text: false,
            icons: {
                primary: 'ui-icon-triangle-1-s'
            }
        }).click(function () {
            var $menu = $('#exit_button_select_menu').show().position({
                my:     'left top',
                at:     'left bottom',
                of:     this
            });

            $(document).one('click', function() {
                $menu.hide();
            });

            return false;
        }).css({width: 16, height: 26}).parent().buttonset();

        $('#exit_button_select_menu').menu({
            select: function (event, ui) {
                that.editSaveConfig('button/closeMode', ui.item.data('value'));

                $('#exit_button').button('option', 'icons', {
                    primary: 'ui-icon-' + that.config['button/closeMode']
                });
                $('#exit_button').trigger('click');
            }
        });

        if (this.conn.getIsLoginRequired && this.conn.getIsLoginRequired()) {
            $('#logout_button').button({
                text:  false,
                icons: {primary: 'ui-icon-logout'}
            }).click(function () {
                that.saveRemote(function () {
                    if (that._saveTimer) {
                        $('#saving_progress').hide();
                        clearTimeout(that._saveTimer);
                        that._saveTimer = null;
                    }
                    that.conn.logout(function () {
                        location.reload();
                    });
                });
            }).show().css({width: '26px', height: '26px'});
        }

        if (this.conn.getUser) {
            var user = this.conn.getUser();
            $('#current-user').html(user ? user[0].toUpperCase() + user.substring(1).toLowerCase() : '');
        }

        // Dev ----------------------------------------------------------------
        $(".oid-dev").change(function () {
            var timer = $(this).data('timer');
            if (timer) clearTimeout(timer);
            var $that = $(this);
            $that.data('timer', setTimeout(function () {
                $that.data('timer', null);
                var val = $that.val();
                if ($that.attr('type') == 'number') {
                    if ($that.attr('step') == '0.1') {
                        val = val.replace(',', '.');
                        that.setValue($that.attr("id").split("_")[1], parseFloat(val));
                    } else {
                        that.setValue($that.attr("id").split("_")[1], parseInt(val, 10));
                    }
                } else {
                    that.setValue($that.attr("id").split("_")[1], $that.val());
                }
            }, 500));
        }).keyup(function () {
            $(this).trigger('change');
        });

        $('#vis_container').on('contextmenu click', function (e) {
            // Workaround for OSX. Ignore clicks without ctrl
            if (!e.button && !e.ctrlKey && !e.metaKey) return;

            if (!e.shiftKey && !e.altKey) {
                var parentOffset = $(this).offset();
                //or $(this).offset(); if you really just want the current element's offset
                var relX = e.pageX - parentOffset.left;
                var relY = e.pageY - parentOffset.top;

                relX += $("#vis_container").scrollLeft();
                relY += $("#vis_container").scrollTop();

                vis.showContextMenu({left: relX, top: relY});

                e.preventDefault();
            }
        });

        // show current project
        $('#current-project').html(that.projectPrefix.substring(0, that.projectPrefix.length - 1));
    },
    editInitWidgetPreview: function () {
        var that = this;
        $('#btn_prev_zoom').hover(
            function () {
                $(this).addClass('ui-state-hover');
            },
            function () {
                $(this).removeClass('ui-state-hover');
            }
        ).click(function () {
            if ($(this).hasClass('ui-state-active')) {
                that.editSaveConfig('button/btn_prev_zoom', false);
                $(this).removeClass('ui-state-active');
                $('.wid_prev').removeClass('wid_prev_k');
                $('.wid_prev_content').css('zoom', 1);
            } else {
                that.editSaveConfig('button/btn_prev_zoom', true);
                $(this).addClass("ui-state-active");
                $('.wid_prev').addClass('wid_prev_k');
                $('.wid_prev_content').css('zoom', 0.5);
            }
        });

        $('#btn_prev_type').hover(
            function () {
                $(this).addClass('ui-state-hover');
            },
            function () {
                $(this).removeClass('ui-state-hover');
            }
        ).click(function () {
            if ($(this).hasClass('ui-state-active')) {
                that.editSaveConfig('button/btn_prev_type', false);
                $(this).removeClass('ui-state-active');
                $('.wid_prev_type').hide();
            } else {
                that.editSaveConfig('button/btn_prev_type', true);
                $(this).addClass("ui-state-active");
                $('.wid_prev_type').show();
            }
        });

        var icons = {
            filter:     'vis-preview-filter',
            ctrl:       'vis-preview-control',
            control:    'vis-preview-control',
            navigation: 'vis-preview-navigation',
            nav:        'vis-preview-navigation',
            timestamp:  'vis-preview-timestamp',
            dialog:     'vis-preview-dialog',
            static:     'vis-preview-static',
            val:        'vis-preview-val',
            value:      'vis-preview-val',
            container:  'vis-preview-container',
            rgb:        'vis-preview-rgb',
            stateful:   'vis-preview-stateful',
            table:      'vis-preview-table',
            tools:      'vis-preview-tools',
            bar:        'vis-preview-bar',
            temperature: 'vis-preview-temperature',
            window:     'vis-preview-window',
            shutter:    'vis-preview-shutter',
            door:       'vis-preview-door',
            lamp:       'vis-preview-lamp',
            checkbox:   'vis-preview-checkbox', // boolean value with control
            dimmer:     'vis-preview-dimmer',
            state:      'vis-preview-state',    // boolean value
            lock:      'vis-preview-lock'
        };

        $.each(this.widgetSets, function () {
            var set = this.name || this;
            var tpl_list = $('.vis-tpl[data-vis-set="' + set + '"]');

            $.each(tpl_list, function (i) {
                var tpl           = $(tpl_list[i]).attr('id');
                var type          = $('#' + tpl).data('vis-type') || '';
                var beta          = '';
                var classTypes    = '';
                var behaviorIcons = [];
                var types;

                if (type) {
                    var types = type.split(',');
                    if (types.length < 2) types = type.split(';');
                    var noIconTypes = [];

                    for (var z = 0; z < types.length; z++) {
                        types[z] = types[z].trim();
                        classTypes += types[z] + ' ';

                        if (!icons[types[z]]) {
                            noIconTypes.push(types[z]);
                        } else {
                            behaviorIcons.push('<div class="vis-preview-informer ' + icons[types[z]] + '"></div>');
                        }
                        types[z] = _(types[z]);
                    }
                    type = '<div class="wid_prev_type">' + noIconTypes.join(',') + '</div>';
                } else {
                    types = [];
                }
                if ($('#' + tpl).data('vis-beta')) {
                    beta = '<div style="color: red; width: 100%;  z-index: 100; top: 50% ; font-size: 15px;">!!! BETA !!!</div>';
                }

                classTypes += set + ' ' + $('#' + tpl).data('vis-name');
                classTypes = classTypes.toLowerCase().replace('ctrl', 'control').replace('val', 'value');

                $('#toolbox').append('<div id="prev_container_' + tpl + '" class="wid_prev ' + set + '_prev widget-filters" data-keywords="' + classTypes + '" data-tpl="' + tpl + '" title="' + types.join(', ') + '">' + type + '<div class="wid_prev_name" >' + $('#' + tpl).data('vis-name') + '</div>'  + beta + '<div class="vis-preview-informers-container">' + behaviorIcons.join('') + '</div></div>');

                if ($(tpl_list[i]).data('vis-prev')) {
                    var content = $('#prev_container_' + tpl).append($(tpl_list[i]).data('vis-prev'));
                    $(content).children().last().addClass('wid_prev_content');
                }

                $('#prev_container_' + tpl).draggable({
                    helper:      'clone',
                    appendTo:    $('#panel_body'),
                    containment: $('#panel_body'),
                    zIndex:      10000,
                    cursorAt:    {top: 0, left: 0},

                    start: function (event, ui) {
                        if (ui.helper.children().length < 3) {
                            $(ui.helper).addClass('ui-state-highlight ui-corner-all').css({padding: '2px', "font-size": '12px'});

                        } else {
                            $(ui.helper).find('.wid_prev_type').remove();
                            $(ui.helper).find('.wid_prev_name').remove();
                            $(ui.helper).css('border', 'none');
                            $(ui.helper).css('width',  'auto');
                        }

                    }
                });
                // Add widget by double click
                $('#prev_container_' + tpl).dblclick(function () {
                    var tpl = $(this).data('tpl');
                    var $tpl = $('#' + tpl);
                    var renderVisible = $tpl.attr('data-vis-render-visible');

                    // Widget attributes default values
                    var attrs = $tpl.attr('data-vis-attrs');
                    // Combine atrributes from data-vis-attrs, data-vis-attrs0, data-vis-attrs1, ...
                    var t = 0;
                    var attr;
                    while ((attr = $tpl.attr('data-vis-attrs' + t))) {
                        attrs += attr;
                        t++;
                    }
                    var data = {};
                    if (attrs) {
                        attrs = attrs.split(';');
                        if (attrs.indexOf('oid') != -1) data.oid = 'nothing_selected';
                    }
                    if (renderVisible) data.renderVisible = true;

                    var widgetId = that.addWidget({tpl: tpl, data: data});

                    that.$selectActiveWidgets.append('<option value="' + widgetId + '">' + that.getWidgetName(that.activeView, widgetId) + '</option>')
                        .multiselect('refresh');

                    setTimeout(function () {
                        that.inspectWidgets();
                    }, 50);
                });
            });
        });

        if (this.config['button/btn_prev_type']) $('#btn_prev_type').trigger('click');
        if (this.config['button/btn_prev_type'] === undefined) $('#btn_prev_type').trigger('click');

        if (this.config['button/btn_prev_zoom']) $('#btn_prev_zoom').trigger('click');
    },
    editBuildSelectView: function () {
        var keys = Object.keys(this.views);

        // case insensitive sorting
        keys.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        var text = '<table class="table-no-space"><tr class="table-no-space">';
        for (var view = 0; view < keys.length; view++) {
            text += '<td class="table-no-space">';
            //$('#view_select_tabs').append('<div id="view_tab_' + view + '" class="view-select-tab ui-state-default ui-corner-top sel_opt_' + k + '">' + k + '</div>');
            text += '<div id="view_tab_' + keys[view] + '" class="view-select-tab ui-state-default ui-corner-top sel_opt_' + keys[view] + '">' + keys[view] + '</div>';
        }
        text += '</tr></table>';
        $('#view_select_tabs').html(text);
        $('#view_tab_' + this.activeView).addClass('ui-tabs-active ui-state-active');
    },
    editInitSelectView: function () {
        var that = this;
        $('#view_select_tabs_wrap').resize(function () {
            var o = {
                parent_w: $('#view_select_tabs_wrap').width(),
                self_w:   $('#view_select_tabs').width(),
                self_l:   parseInt($('#view_select_tabs').css('left'))
            };
            if (o.parent_w >= (o.self_w + o.self_l)) {
                $('#view_select_tabs').css('left', (o.parent_w - o.self_w) + "px");
            }
        });

        $('#view_select_left').button({
            icons: {
                primary: "ui-icon-carat-1-w"
            },
            text: false
        }).click(function () {
            var o = {
                parent_w: $('#view_select_tabs_wrap').width(),
                self_w:   $('#view_select_tabs').width(),
                self_l:   parseInt($('#view_select_tabs').css('left'))
            };

            if (o.self_w != o.parent_w) {
                if ((o.self_l + 50) <= 0) {
                    $('#view_select_tabs').css('left', o.self_l + 50 + "px");
                } else {
                    $('#view_select_tabs').css('left', "0px");
                }
            }
        });

        $('#view_select_right').button({
            icons: {
                primary: "ui-icon-carat-1-e"
            },
            text: false
        }).click(function () {
            var o = {
                parent_w: $('#view_select_tabs_wrap').width(),
                self_w: $('#view_select_tabs').width(),
                self_l: parseInt($('#view_select_tabs').css('left'))
            };

            if (o.self_w != o.parent_w) {
                if ((o.parent_w - o.self_w) <= (o.self_l - 50)) {
                    $('#view_select_tabs').css('left', o.self_l - 50 + "px");
                } else {
                    $('#view_select_tabs').css('left', (o.parent_w - o.self_w) + 'px');
                }
            }
        });

        $('#view_select').bind('mousewheel DOMMouseScroll', function (event) {
            var o = {
                parent_w: $('#view_select_tabs_wrap').width(),
                self_w: $('#view_select_tabs').width(),
                self_l: parseInt($('#view_select_tabs').css('left'))
            };
            if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {

                if (o.self_w != o.parent_w) {
                    if ((o.parent_w - o.self_w) <= (o.self_l - 20)) {
                        $('#view_select_tabs').css('left', o.self_l - 20 + "px");
                    } else {
                        $('#view_select_tabs').css('left', (o.parent_w - o.self_w) + "px");
                    }
                }
            } else {
                if (o.self_w != o.parent_w) {
                    if ((o.self_l + 20) <= 0) {
                        $('#view_select_tabs').css('left', o.self_l + 20 + "px");
                    } else {
                        $('#view_select_tabs').css('left', "0px");
                    }
                }
            }
        });

        $('#view_select_tabs').on('click', '.view-select-tab', function () {
            var view = $(this).attr('id').replace('view_tab_', '');
            $('.view-select-tab').removeClass('ui-tabs-active ui-state-active');
            $(this).addClass('ui-tabs-active ui-state-active');
            that.changeView(view);
        });
        this.editBuildSelectView();
    },
    editInitCSSEditor:function(){
        var that      = this;

        var file      = 'vis-common-user';
        var editor    = ace.edit("css_editor");
        var timer     = null;
        var selecting = false;

        //editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/css");
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion:  true
        });
        editor.$blockScrolling = Infinity;
        editor.getSession().setUseWrapMode(true);

        if (that.config['select/select_css_file']) {
            file = that.config['select/select_css_file'];
            $("#select_css_file").val(file);
        }

        $("#select_css_file").selectmenu({
            change: function (event, ui) {
                // Save file
                if (file == 'vis-user') {
                    that.conn.writeFile(that.projectPrefix + 'vis-user.css' , editor.getValue(), function () {
                        $("#css_file_save").button('disable');
                    });
                } else if (file == 'vis-common-user') {
                    that.conn.writeFile('/vis/css/vis-common-user.css', editor.getValue(), function () {
                        $("#css_file_save").button('disable');
                    });
                }
                file = $(this).val();
                // Ignore next onchange
                selecting = true;
                editor.setValue($('#' + file).text());
                editor.navigateFileEnd();
                editor.focus();
                that.editSaveConfig('select/select_css_file', file);
                // enable flag again in 500 ms
                setTimeout(function () {
                    selecting = false;
                }, 500);
            }
        });

        editor.setValue($('#' + file).text());

        editor.getSession().on('change', function(e) {
            if (selecting) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                return;
            }
            if (timer !== null) return;
            timer = setTimeout(function () {
                timer = null;
                $("." + file).text(editor.getValue());
                $("#css_file_save").button('enable');

                // Trigger autosave after 2 seconds
                setTimeout(function () {
                    $("#css_file_save").trigger('click');
                }, 2000);
            }, 400);
        });

        $(document).bind('vis-common-user', function (e) {
            editor.setValue($('#vis-common-user').text());
            editor.navigateFileEnd();
        })
        .bind('vis-user', function (e) {
            editor.setValue($('#vis-user').text());
            editor.navigateFileEnd();
        });

        $('#cssEditor_tab').click(function(){
            editor.focus();
        });

        $('#pan_attr').resize(function(){
            editor.resize();
        });

        $('#css_find').change(function(){
            editor.find($(this).val(),{
                backwards: false,
                wrap: false,
                caseSensitive: false,
                wholeWord: false,
                regExp: false
            });
        });

        $("#css_find_prev").button({
            icons: {
                primary: " ui-icon-arrowthick-1-n"
            },
            text: false
        }).click(function(){
            editor.findPrevious();
        });

        $("#css_find_next").button({
            icons: {
                primary: "ui-icon-arrowthick-1-s"
            },
            text: false
        }).click(function(){
            editor.findNext();
        });

        $("#css_file_save").button({
            icons: {
                primary: " ui-icon-disk"
            },
            text: false
        }).click(function() {
            if ($("#select_css_file").val() == 'vis-user') {
                that.conn.writeFile(that.projectPrefix + 'vis-user.css' , editor.getValue(), function () {
                    $("#css_file_save").button('disable');
                });
            }

            if ($("#select_css_file").val() == 'vis-common-user') {
                that.conn.writeFile('/vis/css/vis-common-user.css', editor.getValue(), function () {
                    $("#css_file_save").button('disable');
                });
            }
        }).button('disable');
    },
    editInitNext: function () {
        // vis Editor Init
        var that = this;

        this.editInitSelectView();

        var keys = Object.keys(this.views);
        var len = keys.length;
        var i;
        var k;

        keys.sort();

        for (i = 0; i < len; i++) {
            k = '<option value="' + keys[i] + '">' + keys[i] + '</option>';
            this.$selectView.append(k);
            this.$copyWidgetSelectView.append(k);
        }
        this.$selectView.val(this.activeView);
        this.$selectView.selectmenu({
            change: function (event, ui) {
                that.changeView($(this).val());
            }
        }).selectmenu("menuWidget").parent().addClass("view-select-menu");
        $('#select_view-menu').css('max-height', '400px');
        this.$copyWidgetSelectView.val(this.activeView);
        this.$copyWidgetSelectView.selectmenu();
        $('#inspect_view_theme').selectmenu({
            width: '100%',
            change: function () {
                var theme = $(this).val();
                that.views[that.activeView].settings.theme = theme;
                that.addViewStyle(that.activeView, theme);
                //that.additionalThemeCss(theme);
                that.save();
            }
        });
        // set max height of select menu and autocomplete
        $('#inspect_view_theme-menu').css('max-height', '300px');

        // end old select View xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


        var $select_set = $('#select_set');
        //$select_set.html('');
        $select_set.append('<option value="all">*</option>');
        for (i = 0; i < this.widgetSets.length; i++) {
            // skip empty sets, like google fonts
            if (!$('.vis-tpl[data-vis-set="' + (this.widgetSets[i].name || this.widgetSets[i]) + '"]').length) continue;

            if (this.widgetSets[i].name !== undefined ) {
                $select_set.append('<option value="' + this.widgetSets[i].name + '">' + this.widgetSets[i].name + '</option>');
            } else {
                $select_set.append('<option value="' + this.widgetSets[i] + '">' + this.widgetSets[i] + '</option>');
            }
        }

        if (this.config['select/select_set']) {
            $('#select_set option[value="' + this.config['select/select_set'] + '"]').prop('selected', true);
        }

        this.editInitWidgetPreview();

        $select_set.selectmenu({
            change: function (event, ui) {
                var tpl = ui.item.value;
                that.editSaveConfig('select/select_set', tpl);
                if (tpl == "all") {
                    $('.wid_prev').css("display", "inline-block");
                } else {
                    $('.wid_prev').hide();
                    $('.' + tpl + '_prev').css("display", "inline-block");

                    // Remove filter
                    if ($filter_set.val() && $filter_set.val() != '*') {
                        $filter_set.val('*');
                        var textToShow = $filter_set.find(":selected").text();
                        $filter_set.parent().find("span").find("input").val(textToShow);
                        filterWidgets();
                    }
                }
            }
        });

        // set maximal height
        $('#select_set-menu').css('max-height', '400px');

        // Create list of filters
        this.filterList = [];
        $('.widget-filters').each(function () {
            var keywords = $(this).data('keywords').split(' ');
            for (var k = 0; k < keywords.length; k++) {
                if (that.filterList.indexOf(keywords[k]) == -1) that.filterList.push(keywords[k]);
            }
        });

        var $filter_set = $('#filter_set');

        function filterWidgets () {
            if ($filter_set.data('timeout')) return;
            $filter_set.data('timeout', setTimeout(function () {
                $filter_set.data('timeout', null);
                var value = $filter_set.val().toLowerCase();
                that.editSaveConfig('select/filter_set', value);
                $('.widget-filters').each(function () {
                    if (value !== '' && value !== '*' && $select_set.val() != 'all') {
                        $select_set.val('all');
                        $select_set.selectmenu('refresh');
                    }
                    var keywords = $(this).data('keywords');
                    if (value === '' || value === '*' || keywords.indexOf(value) != -1) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
            }, 400));
        }

        $filter_set.autocomplete({
            minLength: 0,
            source: function (request, response) {
                var data = $.grep(that.filterList, function (value) {
                    return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
                });
                data = data.slice(0, 50);
                response(data);
            },
            select: filterWidgets,
            change: filterWidgets
        }).focus(function () {
            $(this).autocomplete('search', '');
        }).keyup(function (e) {
            if (e.keyCode == 13) {
                $filter_set.autocomplete('close');
            }
            filterWidgets();
        }).bind('dblclick', function () {
            if ($filter_set.val() && $filter_set.val() != '*') {
                $filter_set.val('*');
                var textToShow = $filter_set.find(":selected").text();
                $filter_set.parent().find("span").find("input").val(textToShow);
                filterWidgets();
            }
        }).clearSearch();

        if (this.config['select/select_set'] != "all" && this.config['select/select_set']) {
            $('.wid_prev').hide();
            $('.' + this.config['select/select_set'] + '_prev').show();
        }

        if (this.config['select/filter_set'] && this.config['select/filter_set'] != '*') {
            $filter_set.val(this.config['select/filter_set']);
            var textToShow = $filter_set.find(":selected").text();
            $filter_set.parent().find("span").find("input").val(textToShow);
            setTimeout(filterWidgets, 500);
        }

        // Expand/Collapse view settings
        $('.view-group').each(function () {
            $(this).button({
                icons: {
                    primary: "ui-icon-triangle-1-s"
                },
                text: false
            }).css({width: 22, height: 22}).click(function () {
                var group = $(this).attr('data-group');
                that.groupsState[group] = !that.groupsState[group];
                $(this).button('option', {
                    icons: {primary: that.groupsState[group] ? "ui-icon-triangle-1-n" : "ui-icon-triangle-1-s"}
                });
                if (that.groupsState[group]) {
                    $('.group-' + group).show();
                } else {
                    $('.group-' + group).hide();
                }
                that.editSaveConfig('groupsState', that.groupsState);
            });
            var group = $(this).attr('data-group');
            if (that.groupsState && !that.groupsState[group]) $('.group-' + group).hide();
        });

        // Init inspect view settings buttons
        $('.view-edit-button').each(function () {
            var type = $(this).attr('data-type');

            if (type == 'color') {
                if ((typeof colorSelect != 'undefined' && $().farbtastic)) {
                    $(this).button({
                        text: false,
                        icons: {
                            primary: 'ui-icon-note'
                        }
                    }).click(function () {
                        var attr = $(this).attr('data-attr');
                        var _settings = {
                            current: $('#inspect_' + attr).val(),
                            onselectArg: attr,
                            onselect: function (img, _data) {
                                var value = colorSelect.GetColor();
                                $('#inspect_' + _data).css('background-color', value || '').val(value).trigger('change');
                                that._editSetFontColor('inspect_' + _data);
                            }
                        };
                        colorSelect.show(_settings);
                    }).css({width: 22, height: 22}).attr('title', _('Select color'));
                }
            }
        });

        // Create background_class property if does not exist
        if (this.views[this.activeView] !== undefined) {
            if (this.views[this.activeView].settings === undefined) {
                this.views[this.activeView].settings = {};
            }
            if (this.views[this.activeView].settings.style === undefined) {
                this.views[this.activeView].settings.style = {};
            }
            if (this.views[this.activeView].settings.style.background_class === undefined) {
                this.views[this.activeView].settings.style.background_class = '';
            }
        }

        if (this.fillWizard) this.fillWizard();

        // Deselect active widget if click nowhere. Not required if selectable is active
        if (!this.selectable) {
            $('#vis_container').click(function () {
                that.inspectWidgets([]);
            });
        }

        if (this.conn.getType() == 'local') {
            $('#export_local_view').click(function () {
                that.exportView(true);
            }).show();
            $('#import_local_view').click(function () {
                $('#textarea_import_view').val('');
                $('#name_import_view').show();
                $('#dialog_import_view').dialog({
                    autoOpen: true,
                    width: 800,
                    height: 600,
                    modal: true,
                    open: function (event, ui) {
                        $('[aria-describedby="dialog_import_view"]').css('z-index', 1002);
                        $('.ui-widget-overlay').css('z-index', 1001);
                        $('#start_import_view').unbind('click').click(function () {
                            that.importView(true);
                        });
                        $('#name_import_view').hide();
                    }
                });
            }).show();
            $('#clear_local_view').click(function () {
                if (typeof storage !== 'undefined') {
                    localStorage.clear();
                    window.location.reload();
                }
            }).show();
            $('#local_view').show();
        }

        this.showWaitScreen(false);
        $('#menu_body').show();
        $('#panel_body').show();
        $('head').prepend('<style id="scrollbar_style">html{}::-webkit-scrollbar-thumb {background-color: ' + $(".ui-widget-header ").first().css("background-color") + '}</style>');

        $('#filter_set').clearSearch('update');

    },
    editLoadConfig: function () {
        // Read all positions, selected widgets for every view,
        // Selected view, selected menu page,
        // Selected widget or view page
        // Selected filter
        if (typeof storage != 'undefined') {
            try {
                var stored = storage.get('visConfig');
                this.config = stored ? JSON.parse(stored) : {};
            } catch (e) {
                console.log('Cannot load edit config');
                this.config = {};
            }
        }
    },
    editSaveConfig: function (attr, value) {
        if (attr) this.config[attr] = value;

        if (typeof storage != 'undefined') {
            storage.set('visConfig', JSON.stringify(this.config));
        }
    },
    confirmMessage: function (message, title, icon, callback) {
        if (!this.$dialogConfirm) {
            this.$dialogConfirm = $('#dialog-confirm');
            this.$dialogConfirm.dialog({
                autoOpen: false,
                modal:    true,
                open: function () {
                    $(this).parent().css({'z-index': 1001});
                },
                buttons: [
                    {
                        text: _('Ok'),
                        click: function () {
                            var cb = $(this).data('callback');
                            $(this).dialog('close');
                            if (cb) cb(true);
                        }
                    },
                    {
                        text: _('Cancel'),
                        click: function () {
                            var cb = $(this).data('callback');
                            $(this).dialog('close');
                            if (cb) cb(false);
                        }
                    }
                ]
            });
        }
        this.$dialogConfirm.dialog('option', 'title', title || _('Confirm'));
        $('#dialog-confirm-text').html(message);
        if (icon) {
            $('#dialog-confirm-icon').show();
            $('#dialog-confirm-icon').attr('class', '');
            $('#dialog-confirm-icon').addClass('ui-icon ui-icon-' + icon);
        } else {
            $('#dialog-confirm-icon').hide();
        }
        this.$dialogConfirm.data('callback', callback);
        this.$dialogConfirm.dialog('open');
    },
    addView: function (view) {
        var _view = view.replace(/\s/g, '_').replace(/\./g, '_');
        if (this[_view]) return false;

        this.views[_view] = {settings: {style: {}}, widgets: {}, name: view};
        var that = this;
        this.saveRemote(function () {
            //$(window).off('hashchange');
            //window.location.hash = '#' + view;

            $('#view_tab_' + that.activeView).removeClass('ui-tabs-active ui-state-active');
            that.changeView(_view);

            that.editBuildSelectView();
            $('#view_tab_' + that.activeView).addClass('ui-tabs-active ui-state-active');

            that.$selectView.append('<option value="' + _view + '">' + _view + '</option>');
            that.$selectView.val(_view);
            that.$selectView.selectmenu('refresh');

            that.$copyWidgetSelectView.append('<option value="' + _view + '">' + _view + '</option>');
            that.$copyWidgetSelectView.val(_view);
            that.$copyWidgetSelectView.selectmenu('refresh');
        });
    },
    renameView: function (oldName, newName) {
        var _newName = newName.replace(/\s/g, '_').replace(/\./g, '_');
        this.views[_newName] = $.extend(true, {}, this.views[oldName]);
        this.views[_newName].name = newName;

        $('#vis_container').html('');
        delete this.views[oldName];
        this.activeView = _newName;
        this.renderView(_newName);
        this.changeView(_newName);

        // Rebuild tabs, select, selectCopyTo
        $('#view_tab_' + oldName).attr('id', 'view_tab_' + _newName);
        $('#view_tab_' + _newName).removeClass('sel_opt_' + oldName).addClass('ui-tabs-active ui-state-active sel_opt_' + _newName).html(newName);
        var $opt = this.$selectView.find('option[value="' + oldName + '"]');
        $opt.html(newName).attr('value', _newName);
        this.$selectView.val(_newName);
        this.$selectView.selectmenu('refresh');

        $opt = this.$copyWidgetSelectView.find('option[value="' + oldName + '"]');
        $opt.html(newName).attr('value', _newName);
        this.$copyWidgetSelectView.val(_newName);
        this.$copyWidgetSelectView.selectmenu('refresh');
        this.saveRemote(function () {

        });
    },
    delView: function (view) {
        var that = this;
        this.confirmMessage(_('Really delete view %s?', view), null, 'help', function (result) {
            if (result) {
                if (view == that.activeView) that.nextView();

                if (that.views[view]) delete that.views[view];
                that.saveRemote(function () {
                    $('#view_tab_' + view).remove();
                    $('#visview_' + view).remove();

                    that.$selectView.find('option[value="' + view + '"]').remove();
                    that.$copyWidgetSelectView.find('option[value="' + view + '"]').remove();
                    if (!that.$selectView.find('option').length) {
                        that.$selectView.append('<option value="">' + _('none') + '</option>');
                        that.$copyWidgetSelectView.append('<option value="">' + _('none') + '</option>');
                        that.$selectView.val('');
                        that.$copyWidgetSelectView.val('');
                    }

                    that.$selectView.selectmenu('refresh');
                    that.$copyWidgetSelectView.selectmenu('refresh');
                });
            }
        });
    },
    dupView: function (source, dest) {
        var _dest = dest.replace(/\s/g, '_').replace(/\./g, '_');
        this.views[_dest] = $.extend(true, {}, this.views[source]);
        this.views[_dest].name = dest;

        // Give to all widgets new IDs...
        for (var widget in this.views[_dest].widgets) {
            this.views[_dest].widgets[this.nextWidget()] = this.views[_dest].widgets[widget];
            delete this.views[_dest].widgets[widget];
        }
        var that = this;
        this.saveRemote(function () {
            that.renderView(_dest);
            that.changeView(_dest);
            $('.view-select-tab').removeClass('ui-tabs-active ui-state-active');

            that.editBuildSelectView();
            $('#view_tab_' + _dest).addClass('ui-tabs-active ui-state-active');

            that.$selectView.append('<option value="' + _dest + '">' + dest + '</option>');
            that.$selectView.val(_dest);
            that.$selectView.selectmenu('refresh');

            that.$copyWidgetSelectView.append('<option value="' + _dest + '">'+ dest + '</option>');
            that.$copyWidgetSelectView.val(_dest);
            that.$copyWidgetSelectView.selectmenu('refresh');

        });
    },
    nextView: function () {
        var $next = $('.view-select-tab.ui-state-active').next();

        if ($next.hasClass('view-select-tab')) {
            $next.trigger('click');
        } else {
            $('.view-select-tab.ui-state-active').parent().children().first().trigger('click');
        }
    },
    prevView: function () {
        var $prev = $('.view-select-tab.ui-state-active').prev();

        if ($prev.hasClass('view-select-tab')) {
            $prev.trigger('click');
        } else {
            $('.view-select-tab.ui-state-active').parent().children().last().trigger('click');
        }
    },
    exportWidgets: function (widgets) {
        this.removeUnusedFields();

        var exportW = [];
        widgets = widgets || this.activeWidgets;
        for (var i = 0; i < widgets.length; i++) {
            exportW.push(this.views[this.activeView].widgets[widgets[i]]);
        }

        $('#textarea_export_widgets').text(JSON.stringify(exportW));
        document.getElementById('textarea_export_widgets').select();
        $('#dialog_export_widgets').dialog({
            autoOpen: true,
            width:    800,
            height:   600,
            modal:    true,
            open:     function (/*event, ui*/) {
                $('[aria-describedby="dialog_export_widgets"]').css('z-index', 1002);
                $('.ui-widget-overlay').css('z-index', 1001);
            }
        });
    },
    importWidgets: function () {
        $('#textarea_import_widgets').val('');
        var that = this;

        $('#dialog_import_widgets').dialog({
            autoOpen: true,
            width:    800,
            height:   600,
            modal:    true,
            open:     function (event, ui) {
                $('[aria-describedby="dialog_import_widgets"]').css('z-index', 1002);
                $('.ui-widget-overlay').css('z-index', 1001);
                $('#start_import_widgets').unbind('click').click(function () {
                    $('#dialog_import_widgets').dialog('close');
                    var importObject;
                    try {
                        var text = $('#textarea_import_widgets').val();
                        importObject = JSON.parse(text);
                    } catch (e) {
                        that.showMessage(_('invalid JSON') + "\n\n" + e, _('Error'));
                        return;
                    }
                    var activeWidgets = [];
                    for (var widget = 0;widget < importObject.length; widget++) {
                        if (vis.binds.bars && vis.binds.bars.convertOldBars && importObject[widget].data.baroptions) {
                            importObject[widget] = that.binds.bars.convertOldBars(importObject[widget]);
                        }
                        //(tpl, data, style, wid, view, noSave, noAnimate)
                        activeWidgets.push(that.addWidget({
                            tpl:        importObject[widget].tpl,
                            data:       importObject[widget].data,
                            style:      importObject[widget].style,
                            noSave:     true,
                            noAnimate: true
                        }));
                    }

                    that.saveRemote(function () {
                        //that.renderView(that.activeView);
                        that.inspectWidgets(activeWidgets);
                    });

                });
            }
        });
    },
    exportView: function (isAll) {
        var exportView = $.extend(true, {}, isAll ? this.views : this.views[this.activeView]);
        // Set to all widgets the new ID...
        var num = 1;
        var wid;
        if (!isAll) {
            for (var widget in exportView.widgets) {
                wid = "e" + (('0000' + num).slice(-5));
                num += 1;
                exportView.widgets[wid] = exportView.widgets[widget];
                delete exportView.widgets[widget];
            }
            if (exportView.activeWidgets) delete exportView.activeWidgets;
        }
        $('#textarea_export_view').html(JSON.stringify(exportView, null, '  '));
        document.getElementById("textarea_export_view").select();
        $('#dialog_export_view').dialog({
            autoOpen: true,
            width:    800,
            height:   600,
            modal:    true,
            open:     function (/*event, ui*/) {
                $('[aria-describedby="dialog_export_view"]').css('z-index', 1002);
                $('.ui-widget-overlay').css('z-index', 1001);
            }
        });
    },
    importView: function (isAll) {
        var that = this;
        var name = this.checkNewViewName($('#name_import_view').val());
        var importObject;
        if (name === false) {
            that.showMessage(_('View yet exists or name of view is empty'));
            return;
        }
        try {
            var text = $('#textarea_import_view').val();
            importObject = JSON.parse(text);
        } catch (e) {
            that.showMessage(_('invalid JSON') + "\n\n" + e, _('Error'), 'alert');
            return;
        }
        if (isAll) {
            for (var v in importObject) {
                for (var w in importObject[v]) {
                    if (vis.binds.bars && vis.binds.bars.convertOldBars && importObject[v][w].data.baroptions) {
                        importObject[v][w] = vis.binds.bars.convertOldBars(importObject[v][w]);
                    }
                    if (vis.binds.hqwidgets && vis.binds.hqwidgets.convertOldWidgets && importObject[v][w].data.hqoptions) {
                        importObject[v][w] = vis.binds.hqwidgets.convertOldWidgets(importObject[v][w]);
                    }
                }
                // Remove active widgets
                if (importObject[v].activeWidgets) delete importObject[v].activeWidgets;
            }

            this.views = importObject;
            this.saveRemote(function () {
                window.location.reload();
            });
        } else {
            var _name = name.replace(/\s/g, '_').replace(/\./g, '_');
            this.addView(_name);
            this.views[_name] = importObject;
            this.views[_name].name = name;

            // Set for all widgets the new ID...
            for (var widget in this.views[_name].widgets) {
                if (this.binds.bars && this.binds.bars.convertOldBars && this.views[_name].widgets[widget].data.baroptions) {
                    this.views[_name].widgets[widget] = this.binds.bars.convertOldBars(this.views[_name].widgets[widget]);
                }
                if (vis.binds.hqwidgets && vis.binds.hqwidgets.convertOldWidgets && this.views[_name].widgets[widget].data.hqoptions) {
                    this.views[_name].widgets[widget] = vis.binds.hqwidgets.convertOldWidgets(this.views[_name].widgets[widget]);
                }

                this.views[_name].widgets[this.nextWidget()] = this.views[_name].widgets[widget];
                delete this.views[_name].widgets[widget];
            }
            // Remove active widgets
            if (this.views[_name].activeWidgets) delete this.views[_name].activeWidgets;
            this.saveRemote(function () {
                that.renderView(_name);
                that.changeView(_name);
            });
        }
    },
    checkNewViewName: function (name) {
        if (name === undefined || name === null) name = '';
        if (name === 0) name = '0';

        name = name.trim();
        name = name.replace(/\s/g, '_').replace(/\./g, '_');
        if (!name && name !== 0) {
            this.showMessage(_('Please enter the name for the new view!'));
            return false;
        } else if (this.views[name]) {
            this.showMessage(_('The view with the same name yet exists!'));
            return false;
        } else {
            return name;
        }
    },
    nextWidget: function () {
        var next = 1;
        var used = [];
        var key = "w" + (('000000' + next).slice(-5));
        for (var view in this.views) {
            for (var wid in this.views[view].widgets) {
                wid = wid.split('_');
                wid = wid[0];
                used.push(wid);
            }
            while (used.indexOf(key) > -1) {
                next += 1;
                key = "w" + (('000000' + next).slice(-5));
            }
        }
        return key;
    },
    getViewOfWidget: function (id) {
        // find view of this widget
        var view = null;
        for (var v in this.views) {
            if (this.views[v] && this.views[v].widgets && this.views[v].widgets[id]) {
                view = v;
                break;
            }
        }
        return view;
    },
    getViewsOfWidget: function (id) {
        if (id.indexOf('_') === -1) {
            var view = this.getViewOfWidget(id);
            if (view) {
                return [view];
            } else {
                return [];
            }
        } else {
            var wids = id.split('_', 2);
            var wid = wids[0];
            var result = [];
            for (var v in this.views) {
                if (this.views[v].widgets[wid + '_' + v] !== undefined) {
                    result[result.length] = v;
                }
            }
            return result;
        }
    },
    delWidgetHelper: function (id, isAll) {
        if (!id) return;

        if (isAll && id.indexOf('_') != -1) {
            var views = this.getViewsOfWidget(id);
            var wids = id.split('_', 2);
            for (var i = 0; i < views.length; i++) {
                this.delWidgetHelper(wids[0] + '_' + views[i], false);
            }
            this.inspectWidgets([]);
            return;
        }

        // Remove widget from the list
        this.$selectActiveWidgets.find('option[value="' + id + '"]').remove();
        this.$selectActiveWidgets.multiselect('refresh');

        var view = this.getViewOfWidget(id);

        var widget_div = document.getElementById(id);
        if (widget_div && widget_div.visCustomEdit && widget_div.visCustomEdit['delete']) {
            widget_div.visCustomEdit['delete'](id);
        }

        if (widget_div && widget_div._customHandlers && widget_div._customHandlers.onDelete) {
            widget_div._customHandlers.onDelete(widget_div, id);
        }

        $('#' + id).remove();
        if (view) delete this.views[view].widgets[id];

        if (this.widgets[id]) {
            delete this.widgets[id];

            /*var widgets = [];
            // Delete old from array
            for (var w in this.widgets) {
                if (w != id) widgets[w] = this.widgets[w];
            }
            this.widgets = widgets;*/
        }
        var pos = this.activeWidgets.indexOf(id);
        if (pos != -1) this.activeWidgets.splice(pos, 1);
    },
    delWidgets: function (widgets, noSave) {
        if (typeof widgets != 'object') widgets = null;

        if (!widgets) {
            // Store array, because it will be modified in delWidgetHelper
            widgets = [];
            for (var i = 0; i < this.activeWidgets.length; i++) {
                widgets.push(this.activeWidgets[i]);
            }
        }

        for (var j = 0; j < widgets.length; j++) {
            this.delWidgetHelper(widgets[j], true);
        }
        if (!noSave) this.save();

        this.inspectWidgets([]);
    },
    bindWidgetClick: function (view, id) {
        var that = this;
        var $wid = $('#' + id);
        if (!this.views[view] || !this.views[view].widgets[id]) {
            console.warn('View:' + view + ', id: ' + id + ' not found');
            return;
        }
        if (!this.views[view].widgets[id].data.locked) {
            $('#' + id).unbind('click').click(function (e) {
                if (that.dragging) return;

                var widgetId = $(this).attr('id');
                // if shift or control pressed
                if (e.shiftKey || e.ctrlKey || e.metaKey) {
                    var pos = that.activeWidgets.indexOf(widgetId);

                    // Add to list
                    if (pos === -1) {
                        that.inspectWidgets(widgetId);
                    } else {
                        // Remove from list
                        that.inspectWidgets(null, widgetId);
                    }
                } else {
                    // Simple click on some widget
                    if (that.activeWidgets.length != 1 || that.activeWidgets[0] != widgetId) {
                        that.inspectWidgets([widgetId]);
                    }
                }

                e.preventDefault();
                e.stopPropagation();
                return false;
            });
        } else {
            $wid.addClass('vis-widget-edit-locked').removeClass('ui-selectee').unbind('click');
        }
    },
    addWidget: function (options) {
        // tpl, data, style, wid, view, noSave, noAnimate
        if (!options.view) options.view = this.activeView;

        var isSelectWidget = (options.wid === undefined);
        var isViewExist    = (document.getElementById('visview_' + options.view) !== null);
        var renderVisible  = options.data.renderVisible;

        if (renderVisible) delete options.data.renderVisible;

        if (isSelectWidget && !isViewExist) {
            this.renderView(options.view, true, false);
            isViewExist = true;
        }

        var widgetId = options.wid || this.nextWidget();
        var $tpl = $('#' + options.tpl);

        // call custom init function
        if (!options.noSave && $tpl.attr('data-vis-init')) {
            var init = $tpl.attr('data-vis-init');
            if (this.binds[$tpl.attr('data-vis-set')][init]) {
                this.binds[$tpl.attr('data-vis-set')][init](options.tpl, options.data);
            }
        }

        this.widgets[widgetId] = {
            wid: widgetId,
            data: new can.Map($.extend({
                'wid': widgetId
            }, options.data))
        };

        if (renderVisible) this.widgets[widgetId].renderVisible = true;

        this.views[options.view].widgets = this.views[options.view].widgets || {};
        this.views[options.view].widgets[widgetId] = this.views[options.view].widgets[widgetId] || {};

        if (isViewExist) {
            $('#visview_' + options.view).append(can.view(options.tpl, {
                val:  this.states.attr(this.widgets[widgetId].data.oid + '.val'),
                /*ts:   this.states.attr(this.widgets[widgetId].data.oid + '.ts'),
                ack:  this.states.attr(this.widgets[widgetId].data.oid + '.ack'),
                lc:   this.states.attr(this.widgets[widgetId].data.oid + '.lc'),*/
                data: this.widgets[widgetId].data,
                view: options.view
            }));
        }

        var $jWidget = $('#' + widgetId);
        options.style = options.style || this.findFreePosition(options.view, widgetId, null, $jWidget.width(), $jWidget.height());

        if (this.views[options.view].widgets[widgetId].data !== undefined) {
            options.data = $.extend(options.data, this.views[options.view].widgets[widgetId].data, true);
        }

        this.views[options.view].widgets[widgetId] = {
            tpl:       options.tpl,
            data:      options.data,
            style:     options.style,
            widgetSet: $('#' + options.tpl).attr('data-vis-set')
        };

        if (renderVisible) this.views[options.view].widgets[widgetId].renderVisible = true;

        if (options.style) $jWidget.css(options.style);

        //if (isSelectWidget && this.binds.jqueryui) this.binds.jqueryui._disable();

        if (isSelectWidget) {
            this.activeWidgets = [widgetId];
            if (!options.noAnimate) {
                this.actionHighlightWidget(widgetId);
            }
        }

        if (!options.noSave) this.save();

        this.bindWidgetClick(options.view, widgetId);

        if ($('#wid_all_lock_function').prop('checked')) {
            $jWidget.addClass('vis-widget-lock');
        }

        return widgetId;
    },
    dupWidgets: function (widgets, targetView, offsetX, offsetY) {
        if (!widgets)    widgets    = this.activeWidgets;
        if (!targetView) targetView = this.activeView;

        var activeView;
        var tpl;
        var data;
        var style;
        var newWidgets = [];
        var firstOffsetX = null;
        var firstOffsetY = null;

        for (var i = 0; i < widgets.length; i++) {
            var objWidget;

            // if from clipboard
            if (widgets[i].widget) {
                objWidget       = widgets[i].widget;
                activeView      = widgets[i].view;
                tpl             = objWidget.tpl;
                data            = objWidget.data;
                style           = objWidget.style;
                widgets[i].view = this.activeView;
            } else {
                // From active view
                activeView = this.activeView;
                tpl        = this.views[this.activeView].widgets[widgets[i]].tpl;
                data       = $.extend({}, this.views[this.activeView].widgets[widgets[i]].data);
                style      = $.extend({}, this.views[this.activeView].widgets[widgets[i]].style);
            }

            if (offsetX !== undefined) {
                if (firstOffsetX === null) {
                    firstOffsetX = parseInt(style.left, 10);
                    firstOffsetY = parseInt(style.top, 10);

                    style.left = offsetX;
                    style.top  = offsetY;
                } else {
                    style.top  = parseInt(style.top, 10);
                    style.left = parseInt(style.left, 10);

                    style.top = firstOffsetY  - style.top  + offsetY;
                    style.left = firstOffsetX - style.left + offsetX;
                }
            }
            if (activeView == targetView) {
                if (offsetX === undefined) {
                    style.top  = parseInt(style.top,  10);
                    style.left = parseInt(style.left, 10);

                    style.top  += 10;
                    style.left += 10;
                }

                // Store new settings
                if (widgets[i].widget) {
                    // If after copy to clipboard, the copied widget was changed, so the new modified version will be pasted and not the original one.
                    // So use JSON.
                    widgets[i].widget = $.extend(true, {}, objWidget);
                }

                // addWidget Params: tpl, data, style, wid, view, noSave
                newWidgets.push(this.addWidget({
                    tpl:    tpl, 
                    data:   data, 
                    style:  style, 
                    noSave: true
                }));
            } else {
                if ($('#vis_container').find('#visview_' + targetView).html() === undefined) {
                    this.renderView(targetView, true, true);
                }
                newWidgets.push(this.addWidget({
                    tpl:    tpl, 
                    data:   data, 
                    style:  style, 
                    wid:    this.nextWidget(), 
                    view:   targetView, 
                    noSave: true
                }));
            }

            if (this.activeView === targetView) {
                this.$selectActiveWidgets
                    .append('<option value="' + newWidgets[newWidgets.length - 1] + '">' + newWidgets[newWidgets.length - 1] + ' (' + $('#' + this.views[this.activeView].widgets[newWidgets[newWidgets.length - 1]].tpl).attr("data-vis-name") + ')</option>')
                    .multiselect('refresh');

            }
        }
        if (!widgets[0].widget) {
            this.showHint(_('Widget(s) copied to view %s', targetView) + '.', 30000);
        } else {
            this.activeWidgets = newWidgets;
        }

        var that = this;
        setTimeout(function () {
            that.inspectWidgets();
            that.save();
        }, 200);
    },
    renameWidget: function (oldId, newId) {
        // find view of this widget
        var view = this.getViewOfWidget(oldId);

        // create new widget with the same properties
        if (view) {
            var widgetData = this.views[view].widgets[oldId];
            this.addWidget({
                tpl:    widgetData.tpl, 
                data:   widgetData.data, 
                style:  widgetData.style, 
                wid:    newId, 
                view:   view,
                noSave: true
            });
            this.$selectActiveWidgets
                .append('<option value=' + newId + '">' + this.getWidgetName(view, newId) + '</option>')
                .multiselect('refresh');

            this.delWidgetHelper(oldId, false);
        }
        this.inspectWidgets([newId]);
        this.save();
    },
    reRenderWidgetEdit: function (wid) {
        this.reRenderWidget(null, wid);
        if (this.activeWidgets.indexOf(wid) != -1) {
            var $wid = $('#' + wid);
            // User interaction
            if (!$("#wid_all_lock_d").hasClass("ui-state-active") && !this.widgets[wid].data._no_move) {
                this.draggable($wid);
            }
            if ($('#wid_all_lock_function').prop('checked')) {
                $wid.addClass("vis-widget-lock");
            }

            // If only one selected
            if (this.activeWidgets.length == 1 && !this.widgets[wid].data._no_resize) this.resizable($wid);
        }
    },
    getObjDesc: function (id) {
        if (this.objects[id] && this.objects[id].common && this.objects[id].common.name) {
            return this.objects[id].common.name || id;
        }
        return id;
    },
    // find this wid in all views,
    // delete where it is no more exist,
    // create where it should exist and
    // sync data
    syncWidgets: function (widgets, views) {
        for (var i = 0; i < widgets.length; i++) {
            // find view of this widget
            var view = this.getViewOfWidget(widgets[i]);

            if (views === undefined) {
                views = this.getViewsOfWidget(widgets[i]);
            }

            if (view) {
                if (views === null) views = [];

                var isFound = false;
                for (var j = 0; j < views.length; j++) {
                    if (views[j] == view) {
                        isFound = true;
                        break;
                    }
                }

                if (!isFound) views[views.length] = view;

                var wids = widgets[i].split('_', 2);
                var wid = wids[0];

                // First sync views
                for (var v_ in this.views) {
                    isFound = false;
                    if (v_ == view) {
                        continue;
                    }

                    for (var k = 0; k < views.length; k++) {
                        if (views[k] == v_) {
                            isFound = true;
                            break;
                        }
                    }

                    if (this.views[v_].widgets[wid + '_' + v_] !== undefined) {
                        this.delWidgetHelper(wid + '_' + v_, false);
                    }

                    if (isFound) {
                        // Create
                        this.addWidget({
                            tpl:    this.views[view].widgets[widgets[i]].tpl, 
                            data:   this.views[view].widgets[widgets[i]].data, 
                            style:  this.views[view].widgets[widgets[i]].style, 
                            wid:    wid + '_' + v_, 
                            view:   v_,
                            noSave: true
                        });
                    }
                }


                if (views.length < 2 && (widgets[i].indexOf('_') != -1)) {
                    // rename this widget from "wid_view" to "wid"
                    var _wids = widgets[i].split('_', 2);
                    this.renameWidget(widgets[i], _wids[0]);
                } else if (views.length > 1 && (widgets[i].indexOf('_') === -1)) {
                    this.renameWidget(widgets[i], widgets[i] + '_' + view);
                }
            }
        }
    },
    // adds extracted attributes to array
    getWidgetName: function (view, widget) {
        var widgetData = this.views[view].widgets[widget];
        var name = (widgetData && widgetData.data ? widgetData.data.name : '');
        name = name ? (name + '[' + widget + ']') : widget;
        if (widgetData) {
            name += ' ('  + widgetData.widgetSet + ' - ' + $('#' + widgetData.tpl).attr('data-vis-name') + ')';
        }
        return name;
    },
    showWidgetHelper: function (wid, isShow) {
        var $widget = $('#' + wid);

        if ($widget.attr('data-vis-hide-helper') === 'true') isShow = false;

        if (isShow) {
            if (!$widget.length) {
                console.log('Cannot find in DOM ' + wid);
                return;
            }

            var pos = {};//$widget.position();
            pos.top  = $widget[0].offsetTop;
            pos.left = $widget[0].offsetLeft;
            // May be bug?
            if (!pos.left && !pos.top) {
                pos.left = $widget[0].style.left;
                pos.top  = $widget[0].style.top + $widget[0].offsetTop;
                if (typeof pos.left == 'string') pos.left = parseInt(pos.left.replace('px', ''), 10);
                if (typeof pos.top  == 'string') pos.top  = parseInt(pos.top.replace('px', ''), 10);
            }

            if (!$('#widget_helper_' + wid).length) {
                $('#visview_' + this.activeView).append('<div id="widget_helper_' + wid + '" class="widget-helper"><div class="widget_inner_helper"></div></div>');
            }

            $('#widget_helper_' + wid).css({
                    left:   parseInt(pos.left) - 2 +"px" ,
                    top:    parseInt(pos.top) - 2 + "px" ,
                    height: parseInt($widget.outerHeight()) + 2 +'px',
                    width:  parseInt($widget.outerWidth()) + 2 +'px'
                }
            ).show();
        } else {
            $('#widget_helper_' + wid).remove();
        }
    },
    installSelectable: function (view, isDestroy) {
        var that = this;
        view = view || this.activeView;
        if (this.selectable) {
            if (isDestroy) $('.vis-view.ui-selectable').selectable('destroy');

            $('#visview_' + view).selectable({
                filter:    'div.vis-widget:not(.vis-widget-edit-locked)',
                tolerance: 'fit',
                cancel:    'div.vis-widget:not(.vis-widget-edit-locked)',
                stop: function (e, ui) {
                    if (!$('.ui-selected').length) {
                        that.inspectWidgets([]);
                    } else {
                        var newWidgets = [];
                        $('.ui-selected').each(function () {
                            var id = $(this).attr('id');
                            if (id && !$(this).hasClass('vis-widget-edit-locked')) {
                                newWidgets.push(id);
                            }
                        });
                        that.inspectWidgets(newWidgets);
                    }
                    //$('#allwidgets_helper').hide();
                },
                selecting: function (e, ui) {
                    if (ui.selecting.id &&
                        that.activeWidgets.indexOf(ui.selecting.id) === -1 &&
                        !that.views[that.activeView].widgets[ui.selecting.id].data.locked) {
                        that.activeWidgets.push(ui.selecting.id);
                        that.showWidgetHelper(ui.selecting.id, true);
                    }
                },
                unselecting: function (e, ui) {
                    var pos = that.activeWidgets.indexOf(ui.unselecting.id);
                    if (pos != -1) {
                        that.activeWidgets.splice(pos, 1);
                        that.showWidgetHelper(ui.unselecting.id, false);
                    }
                    /*if ($('#widget_helper_' + ui.unselecting.id).html()) {
                     $("#widget_helper_" + ui.unselecting.id).remove();
                     that.activeWidgets.splice(that.activeWidgets.indexOf(ui.unselecting.id), 1);
                     }*/
                }
            });

            $('.vis-widget-edit-locked').removeClass('ui-selectee');
        }
    },
    // Init all edit fields for one view
    changeViewEdit: function (view, noChange) {
        var that = this;
        this.installSelectable(view, true);

        if (!noChange) {
            this.undoHistory = [$.extend(true, {}, this.views[view])];
            $('#button_undo').addClass('ui-state-disabled').removeClass('ui-state-hover');
            this.inspectWidgets(this.views[view].activeWidgets || []);
        }

        // Disable rename if enabled
        $("#rib_view_copy_cancel").trigger('click');
        $("#rib_view_rename_cancel").trigger('click');
        $("#rib_view_add_cancel").trigger('click');

        // Load meta data if not yet loaded
        if (!this.objects) {
            // Read all data objects from server
            this.conn.getObjects(function (data) {
                that.objects = data;
            });
        }

        // Init background selector
        if (this.styleSelect && this.views[view] && this.views[view].settings) {
            this.styleSelect.show({
                width:      '100%',
                name:       'inspect_view_bkg_def',
                filterName: 'background',
                //filterFile: "backgrounds.css",
                style: this.views[view].settings.style.background_class,
                parent: $('#inspect_view_bkg_parent'),
                onchange: function (newStyle) {
                    if (that.views[view].settings.style.background_class) {
                        $('#visview_' + view).removeClass(that.views[view].settings.style.background_class);
                    }
                    that.views[view].settings.style.background_class = newStyle;
                    if (newStyle) $('#inspect_view_css_background').val('').trigger('change');

                    $('#visview_' + view).addClass(that.views[view].settings.style.background_class);
                    that.save();
                }
            });
        }

        // View (Resolution) settings
        if (this.views[view] && this.views[view].settings) {
            // Try to find this resolution in the list
            var res = this.views[view].settings.sizex + 'x' + this.views[view].settings.sizey;
            $('#screen_size option').each(function () {
                if ($(this).attr('value') == res) {
                    $(this).attr('selected', true);
                    res = null;
                    return false;
                }
            });
            if (!res) {
                $('#screen_size_x').prop('disabled', true);
                $('#screen_size_y').prop('disabled', true);
            } else if (res == 'x') {
                $('#screen_size_x').prop('disabled', true);
                $('#screen_size_y').prop('disabled', true);
                $('#screen_size').val('');
            } else {
                $('#screen_size').val('user');
            }

            $('#screen_size').selectmenu('refresh');

            $('#screen_size_x').val(this.views[view].settings.sizex || '').trigger('change');
            $('#screen_size_y').val(this.views[view].settings.sizey || '').trigger('change');
            $('.rib_tool_resolution_toggle').button((res == 'x') ? 'disable' : 'enable');

            $('#grid_size').val(this.views[view].settings.gridSize || '').trigger('change');
            $('#snap_type').val(this.views[view].settings.snapType || 0).selectmenu('refresh');
            $('#grid_size').prop('disabled', this.views[view].settings.snapType != 2);

            if (this.views[view].settings.sizex) {
                $('.vis-screen-default').prop('checked', this.views[view].settings.useAsDefault);
            } else {
                $('.vis-screen-default').prop('checked', false).prop('disabled', true);
            }
            $('.vis-screen-render-always').prop('checked', this.views[view].settings.alwaysRender);

            this.editSetGrid();

        } else {
            $('#screen_size').val('').selectmenu('refresh');
            $('#screen_size_x').val(this.views[view].settings.sizex || '').trigger('change');
            $('#screen_size_y').val(this.views[view].settings.sizey || '').trigger('change');
        }

        this.$selectActiveWidgets.html('');//('<option value="none">' + _('none selected') + '</option>');

        if (this.views[view].widgets) {
            for (var widget in this.views[view].widgets) {
                this.$selectActiveWidgets.append('<option value="' + widget + '" ' + ((this.activeWidgets.indexOf(widget) != -1) ? 'selected' :'')+ '>' + this.getWidgetName(view, widget) + '</option>');
            }
        }

        this.$selectActiveWidgets.multiselect('refresh');

        // Show current view
        if (this.$selectView.val() != view) {
            this.$selectView.val(view);
            this.$selectView.selectmenu('refresh');
        }
        this.$copyWidgetSelectView.val(view);
        this.$copyWidgetSelectView.selectmenu('refresh');

        // Show tab
        $('.view-select-tab').removeClass('ui-tabs-active ui-state-active');
        $('#view_tab_' + view).addClass('ui-tabs-active ui-state-active');

        // View CSS Inspector
        $('.vis-inspect-view-css').each(function () {
            var $this = $(this);
            var attr = $this.attr('id').slice(17);
            var css = $('#visview_' + view).css(attr);
            $this.val(css);
            if (attr.match(/color$/)) {
                $this.css("background-color", css || '');
                that._editSetFontColor($this.attr('id'));
            }
        });

        if (this.views[view] && this.views[view].settings) {
            $('.vis-inspect-view').each(function () {
                var $this = $(this);
                var attr = $this.attr('id').slice(13);
                $('#' + $this.attr('id')).val(that.views[view].settings[attr]);
            });

            this.views[view].settings.theme = this.views[view].settings.theme || 'redmond';

            $('#inspect_view_theme').val(this.views[view].settings.theme);
        }
        $('#inspect_view_theme').selectmenu('refresh');

        /*if (view == "_project"){
            wid_prev
        }*/
    },
    dragging: false,
    draggable: function (obj) {
        var origX, origY;
        var that = this;
        var draggableOptions;
        if (obj.attr('data-vis-draggable')) draggableOptions = JSON.parse(obj.attr('data-vis-draggable'));

        if (!draggableOptions) draggableOptions = {};

        if (draggableOptions.disabled) return;

        draggableOptions = {
            cancel: false,
            start:  function (event, ui) {
                $('#context_menu').hide();
                that.dragging = true;
                origX = ui.position.left;
                origY = ui.position.top;
            },
            stop:   function (event, ui) {
                //var pos = $('#' + widget).position();

                /*if (!that.views[that.activeView].widgets[widget].style) {
                    that.views[that.activeView].widgets[widget].style = {};
                }

                if (pos) {
                    $('#inspect_css_top').val(pos.top + 'px');
                    $('#inspect_css_left').val(pos.left + 'px');
                    that.views[that.activeView].widgets[widget].style.left = pos.left;
                    that.views[that.activeView].widgets[widget].style.top  = pos.top;
                }*/


                //if (mWidget._customHandlers && mWidget._customHandlers.onMoveEnd) {
                //    mWidget._customHandlers.onMoveEnd(mWidget, widget);
                //}

                for (var i = 0; i < that.activeWidgets.length; i++) {
                    var wid = that.activeWidgets[i];
                    var $wid = $('#' + that.activeWidgets[i]);
                    var pos = {
                        left: parseInt($wid.css("left")),
                        top:  parseInt($wid.css("top"))
                    };
                    if (!that.views[that.activeView].widgets[wid]) continue;
                    if (!that.views[that.activeView].widgets[wid].style) that.views[that.activeView].widgets[wid].style = {};

                    if (typeof pos.left == 'string' && pos.left.indexOf('px') === -1) {
                        pos.left += 'px';
                    } else {
                        pos.left = pos.left.toFixed(0) + 'px';
                    }
                    if (typeof pos.top == 'string' && pos.top.indexOf('px') === -1) {
                        pos.top += 'px';
                    } else {
                        pos.top = pos.top.toFixed(0) + 'px';
                    }

                    that.views[that.activeView].widgets[wid].style.left = pos.left;
                    that.views[that.activeView].widgets[wid].style.top  = pos.top;

                    if ($wid[0]._customHandlers && $wid[0]._customHandlers.onMoveEnd) {
                        $wid[0]._customHandlers.onMoveEnd($wid[0], wid);
                    }
                    $('#widget_helper_' + wid).css({
                        left: parseInt($wid.css("left")) - 2 + 'px',
                        top: parseInt($wid.css("top")) - 2 + 'px'
                    });
                }
                $('#inspect_css_top').val(that.findCommonValue(that.activeWidgets, 'top', true));
                $('#inspect_css_left').val(that.findCommonValue(that.activeWidgets, 'left', true));
                that.save();
                setTimeout(function () {
                    that.dragging = false;
                }, 20);

            },
            drag:   function (event, ui) {
                var moveX = ui.position.left - origX;
                var moveY = ui.position.top  - origY;
                origX = ui.position.left;
                origY = ui.position.top;
                for (var i = 0; i < that.activeWidgets.length; i++) {
                    var mWidget = document.getElementById(that.activeWidgets[i]);
                    var $mWidget = $(mWidget);
                    var pos = {
                        left : parseInt($mWidget.css("left")),
                        top : parseInt($mWidget.css("top"))
                    };
                    var x = pos.left + moveX;
                    var y = pos.top  + moveY;

                    $('#widget_helper_' + that.activeWidgets[i]).css({left: x - 2, top: y -2});

                    if (ui.helper.attr('id') != that.activeWidgets[i]) $mWidget.css({left: x, top: y});

                    if (mWidget._customHandlers && mWidget._customHandlers.onMove) {
                        mWidget._customHandlers.onMove(mWidget, that.activeWidgets[i]);
                    }
                }
                /*var mWidget = document.getElementById(that.activeWidget);

                if (ui.helper.attr('id') == that.activeWidget) {
                    $('#widget_helper').css({left: origX - 2, top: origY - 2});
                } else {
                    var $mWidget = $(mWidget);
                    var pos = $mWidget.position();
                    var x = pos.left + moveX;
                    var y = pos.top + moveY;
                    $mWidget.css({left: x, top: y});
                    $('#widget_helper').css({left: x - 2, top: y - 2});
                }

                if ($('#allwidgets_helper').is(':visible')) {
                    var pos = $('#allwidgets_helper').position();
                    $('#allwidgets_helper').css({left: pos.left + moveX, top: pos.top + moveY});
                }*/
            }
        };
        if (this.views[this.activeView].settings.snapType == 1) {
            draggableOptions.snap = '#vis_container div.vis-widget';
        } else
        if (this.views[this.activeView].settings.snapType == 2) {
            this.gridWidth = parseInt(this.views[that.activeView].settings.gridSize, 10);
            if (this.gridWidth < 1 || isNaN(this.gridWidth)) this.gridWidth = 10;

            draggableOptions.grid = [this.gridWidth, this.gridWidth];
        }
        obj.draggable(draggableOptions);
    },
    resizable: function (obj) {
        var resizableOptions;
        var that = this;
        if (obj.attr('data-vis-resizable')) resizableOptions = JSON.parse(obj.attr('data-vis-resizable'));

        // Why resizable brings the flag position: relative within?
        obj.css({position: 'absolute'});

        if (!resizableOptions) resizableOptions = {};

        if (resizableOptions.disabled !== true) {
            resizableOptions.disabled = false;

            this.gridWidth = parseInt(this.views[that.activeView].settings.gridSize, 10);
            if (this.gridWidth < 1 || isNaN(this.gridWidth)) this.gridWidth = 10;

            obj.resizable($.extend({
                stop: function (event, ui) {
                    var widget = ui.helper.attr('id');
                    var w = ui.size.width;
                    var h = ui.size.height;
                    if (typeof w === 'string' && w.indexOf('px') === -1) {
                        w += 'px';
                    } else {
                        w = w.toFixed(0) + 'px';
                    }
                    if (typeof h === 'string' && h.indexOf('px') === -1) {
                        h += 'px';
                    } else {
                        h = h.toFixed(0) + 'px';
                    }

                    $('#inspect_css_width').val(w);
                    $('#inspect_css_height').val(h);
                    if (!that.views[that.activeView].widgets[widget]) return;

                    if (!that.views[that.activeView].widgets[widget].style) that.views[that.activeView].widgets[widget].style = {};

                    that.views[that.activeView].widgets[widget].style.width  = w;
                    that.views[that.activeView].widgets[widget].style.height = h;

                    if ($('#' + that.views[that.activeView].widgets[widget].tpl).attr('data-vis-update-style')) {
                        that.reRenderWidgetEdit(widget);
                    }
                    var w = parseInt(ui.element.outerWidth(),  10);
                    var h = parseInt(ui.element.outerHeight(), 10);
                    $('.widget-helper').css({
                        width:  w + 2,
                        height: h + 2
                    });
                    that.save();
                },
                resize: function (event, ui) {
                    var grid = parseInt(that.views[that.activeView].settings.gridSize, 10);
                    // if grid enabled
                    var w = parseInt(ui.element.outerWidth(),  10);
                    var h = parseInt(ui.element.outerHeight(), 10);

                    if (that.views[that.activeView].settings.snapType == 2 && grid) {
                        // snap size to grid
                        var pos = ui.element.position();
                        var wDiff = (w + pos.left) % grid;
                        var hDiff = (h + pos.top)  % grid;
                        if (wDiff) {
                            if (wDiff < grid / 2) grid = 0;
                            ui.element.width((w + grid - wDiff));
                            //$('.widget-helper').css('width', (w + grid - wDiff + 2));
                        }

                        if (hDiff) {
                            if (hDiff < grid / 2) grid = 0;
                            ui.element.height((h + grid - hDiff));
                            //$('.widget-helper').css('height', (h + grid - hDiff - 2));
                        }
                    }
                    $('.widget-helper').css({
                        width:  w + 2,
                        height: h + 2
                    });
                }
            }, resizableOptions));
        }
    },
    droppable: function (view) {
        var $view = $("#visview_" + view);
        var that = this;

        $view.droppable({
            accept: ".wid_prev",
            drop: function (event, ui) {
                var tpl = $(ui.draggable).data("tpl");
                var view_pos = $("#vis_container").position();
                var addPos = {
                    left: ui.position.left - $('#toolbox').width() + $("#vis_container").scrollLeft() + 5,
                    top:  ui.position.top - view_pos.top + $("#vis_container").scrollTop() + 8
                };

                addPos.left = addPos.left.toFixed(0) + 'px';
                addPos.top  = addPos.top.toFixed(0)  + 'px';

                var $tpl = $('#' + tpl);
                var renderVisible = $tpl.attr('data-vis-render-visible');

                // Widget attributes default values
                var attrs = $tpl.attr('data-vis-attrs');
                // Combine attributes from data-vis-attrs, data-vis-attrs0, data-vis-attrs1, ...
                var t = 0;
                var attr;
                while ((attr = $tpl.attr('data-vis-attrs' + t))) {
                    attrs += attr;
                    t++;
                }
                var data = {};
                if (attrs) {
                    attrs = attrs.split(';');
                    if (attrs.indexOf('oid') != -1) data.oid = 'nothing_selected';
                }
                if (renderVisible) data.renderVisible = true;
                //tpl, data, style, wid, view, noSave, noAnimate
                var widgetId = that.addWidget({
                    tpl:        tpl, 
                    data:       data, 
                    style:      addPos,
                    noAnimate:  true
                });

                that.$selectActiveWidgets.append('<option value="' + widgetId + '">' + that.getWidgetName(that.activeView, widgetId) + '</option>')
                    .multiselect('refresh');

                setTimeout(function () {
                    that.inspectWidgets();
                }, 50);

            }
        });

    },
    // Find free place for new widget
    findFreePosition: function (view, id, field, widgetWidth, widgetHeight) {
        var editPos = $('.ui-dialog:first').position();
        field = $.extend({x: 0, y: 0, width: editPos.left}, field);
        widgetWidth  = (widgetWidth || 60);
        widgetHeight = (widgetHeight || 60);

        if (widgetWidth > field.width) field.width = widgetWidth + 1;

        var step = 20;
        var y = field.y;
        var x = field.x || step;

        // Prepare coordinates
        var positions = [];
        for (var w in this.views[view].widgets) {
            if (w == id || !this.views[view].widgets[w].tpl) {
                continue;
            }

            if (this.views[view].widgets[w].tpl.indexOf('Image') === -1 &&
                this.views[view].widgets[w].tpl.indexOf('image') === -1) {
                var $jW = $('#' + w);
                if ($jW.length) {
                    var s = $jW.position();
                    s.width  = $jW.width();
                    s.height = $jW.height();

                    if (s.width > 300 && s.height > 300) continue;

                    positions[positions.length] = s;
                }
            }
        }

        while (!this.checkPosition(positions, x, y, widgetWidth, widgetHeight)) {
            x += step;
            if (x + widgetWidth > field.x + field.width) {
                x = field.x;
                y += step;
            }
        }

        // No free place on the screen
        if (y >= $(window).height()) {
            x = 50;
            y = 50;
        }

        return {left: x, top: y};
    },
    // Check overlapping
    checkPosition: function (positions, x, y, widgetWidth, widgetHeight) {
        for (var i = 0; i < positions.length; i++) {
            var s = positions[i];

            if (((s.left <= x && (s.left + s.width) >= x) ||
                (s.left <= x + widgetWidth && (s.left + s.width) >= x + widgetWidth)) &&
                ((s.top <= y && (s.top + s.height) >= y) ||
                (s.top <= y + widgetHeight && (s.top + s.height) >= y + widgetHeight))) {
                return false;
            }
            if (((x <= s.left && s.left <= x + widgetWidth) ||
                (x <= (s.left + s.width) && (s.left + s.width) <= x + widgetWidth)) &&
                ((y <= s.top && s.top <= y + widgetHeight) ||
                (y <= (s.top + s.height) && (s.top + s.height) <= y + widgetHeight))) {
                return false;
            }
        }
        return true;
    },
    actionHighlightWidget: function (id) {
        if (id == "none") return;

        var $jWidget = $('#' + id);
        if (!$jWidget.length) return;
        if ($jWidget.attr('data-vis-hide-helper') === 'false') return;
        var s = $jWidget.position();
        s.width  = $jWidget.width();
        s.height = $jWidget.height();
        s.radius = parseInt($jWidget.css('border-radius'));

        var _css1 = {
            left:         s.left - 3.5,
            top:          s.top - 3.5,
            height:       s.height,
            width:        s.width,
            opacity:      1,
            borderRadius: 15
        };

        var $action1 = $('#' + id + '__action1');
        var text = '';
        if (!$action1.length) {
            text = "<div id='" + id + "__action1' style='z-index:2000; top:" + (s.top - 3.5) + "px; left:" + (s.left - 3.5) + "px; width: " + s.width + "px; height: " + s.height + "px; position: absolute'></div>";
            $('#visview_' + this.activeView).append(text);
            $action1 = $('#' + id + '__action1');
        }
        var _css2 = {
            left:         s.left - 4 - s.width,
            top:          s.top - 4 - s.height,
            height:       s.height * 3,
            width:        s.width * 3,
            opacity:      0,
            //borderWidth: 1,
            borderRadius: s.radius + (s.height > s.width) ? s.width : s.height
        };
        $action1.
            addClass('vis-show-new').
            css(_css2).
            animate(_css1, 1500, 'swing', function () {
                $(this).remove();
            }).click(function () {
                $(this).stop().remove();
            });

        var $action2 = $('#' + id + '__action2');
        if (!$action2.length) {
            text = text.replace('action1', 'action2');
            $('#visview_' + this.activeView).append(text);
            $action2 = $('#' + id + '__action2');
        }
        $action2.
            addClass('vis-show-new').
            css(_css2).
            animate(_css1, 3000, 'swing', function () {
                $(this).remove();
            });
    },
    // collect all filter keys for given view
    updateFilter: function () {
        if (this.activeView && this.views) {
            var widgets = this.views[this.activeView].widgets;
            this.views[this.activeView].filterList = [];

            for (var widget in widgets) {
                if (widgets[widget] &&
                    widgets[widget].data &&
                    widgets[widget].data.filterkey) {
                    var isFound = false;
                    for (var z = 0; z < this.views[this.activeView].filterList.length; z++) {
                        if (this.views[this.activeView].filterList[z] == widgets[widget].data.filterkey) {
                            isFound = true;
                            break;
                        }
                    }
                    if (!isFound) {
                        this.views[this.activeView].filterList[this.views[this.activeView].filterList.length] = widgets[widget].data.filterkey;
                    }
                }
            }
            return this.views[this.activeView].filterList;
        } else {
            return [];
        }
    },
    getWidgetIds: function (tpl) {
        if (this.activeView && this.views) {
            var widgets = this.views[this.activeView].widgets;
            var list = [];
            for (var widget in widgets) {
                if (widgets[widget] && widgets[widget].data) {
                    if (tpl === undefined || tpl === null || tpl == widgets[widget].tpl){
                        list.push(widget);
                    }
                }
            }
            return list;
        } else {
            return [];
        }
    },
    initStealHandlers: function () {
        var that = this;
        $('.vis-steal-css').each(function () {
            $(this).button({
                icons: {
                    primary: "ui-icon-star"
                },
                text: false
            }).click(function (e) {
                if (!$(this).attr('checked')) {
                    $(this).attr('checked', true).button('refresh');
                } else {
                    $(this).removeAttr('checked').button('refresh');
                }
                var isSelected = false;
                $('.vis-steal-css').each(function () {
                    if ($(this).attr('checked')) {
                        isSelected = true;
                    }
                });

                if (isSelected && !that.isStealCss) {
                    that.stealCssMode();
                } else if (!isSelected && that.isStealCss) {
                    that.stealCssModeStop();
                }

                e.stopPropagation();
                e.preventDefault();
                return false;
            });
        });
    },
    stealCssModeStop: function () {
        this.isStealCss = false;
        $('#stealmode_content').remove();

        if (this.selectable) $('#visview_' + this.activeView).selectable('enable');

        $('.vis-steal-css').removeAttr('checked').button('refresh');
        $('#vis_container').removeClass('vis-steal-cursor');

    },
    stealCssMode: function () {
        var that = this;
        if (this.selectable) $("#visview_" + this.activeView).selectable('disable');

        this.isStealCss = true;

        if (!$('#stealmode_content').length) {
            $('body').append('<div id="stealmode_content" style="display:none" class="vis-stealmode">CSS steal mode</div>');
            $('#stealmode_content').fadeIn('fast')
                .click(function () {
                    $(this).fadeOut('slow');
                });
        }

        $('.vis-widget').one('click', function (e) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();

            that.stealCss(e);
        });
        $('#vis_container').addClass('vis-steal-cursor');
    },
    stealCss: function (e) {
        if (this.isStealCss) {
            var that = this;
            var src  = '#' + e.currentTarget.id;

            $('.vis-steal-css').each(function () {
                if ($(this).attr('checked')) {
                    $(this).removeAttr('checked').button('refresh');
                    var cssAttribute = $(this).attr('data-vis-steal');
                    var val;
                    if (cssAttribute.match(/border-/) || cssAttribute.match(/padding/)) {
                        val = that.combineCssShorthand($(src), cssAttribute);
                    } else {
                        val = $(src).css(cssAttribute);
                    }
                    for (var i = 0; i < that.activeWidgets.length; i++) {
                        $('#' + that.activeWidgets[i]).css(cssAttribute, val);
                        that.views[that.activeView].widgets[that.activeWidgets[i]].style[cssAttribute] = val;
                        that.showWidgetHelper(that.activeWidgets[i], true);
                    }
                }
            });

            this.save(function () {
                that.stealCssModeStop();
                that.inspectWidgets();
            });
        }
    },
    combineCssShorthand: function (that, attr) {
        var css;
        var parts = attr.split('-');
        var baseAttr = parts[0];
        var cssTop;
        var cssRight;
        var cssBottom;
        var cssLeft;

        if (attr == "border-radius") {
            // TODO second attribute
            cssTop    = that.css(attr.replace(new RegExp(baseAttr), baseAttr + "-top-left"));
            cssRight  = that.css(attr.replace(new RegExp(baseAttr), baseAttr + "-top-right"));
            cssBottom = that.css(attr.replace(new RegExp(baseAttr), baseAttr + "-bottom-right"));
            cssLeft   = that.css(attr.replace(new RegExp(baseAttr), baseAttr + "-bottom-left"));
        } else {
            cssTop    = that.css(attr.replace(new RegExp(baseAttr), baseAttr + "-top"));
            cssRight  = that.css(attr.replace(new RegExp(baseAttr), baseAttr + "-right"));
            cssBottom = that.css(attr.replace(new RegExp(baseAttr), baseAttr + "-bottom"));
            cssLeft   = that.css(attr.replace(new RegExp(baseAttr), baseAttr + "-left"));
        }
        if (cssLeft == cssRight && cssLeft == cssTop && cssLeft == cssBottom) {
            css = cssLeft;
        } else if (cssTop == cssBottom && cssRight == cssLeft) {
            css = cssTop + ' ' + cssLeft;
        } else if (cssRight == cssLeft) {
            css = cssTop + ' ' + cssLeft + ' ' + cssBottom;
        } else {
            css = cssTop + ' ' + cssRight + ' ' + cssBottom + ' ' + cssLeft;
        }
        return css;
    },
    _saveTimer: null, // Timeout to save the configuration
    _saveToServer: function () {
        if (!this.undoHistory || !this.undoHistory.length ||
            (JSON.stringify(this.views[this.activeView]) != JSON.stringify(this.undoHistory[this.undoHistory.length - 1]))) {
            this.undoHistory = this.undoHistory || [];
            $('#button_undo').removeClass('ui-state-disabled');
            if (this.undoHistory.push($.extend(true, {}, this.views[this.activeView])) > this.undoHistoryMaxLength) {
                this.undoHistory.splice(0, 1);
            }
        }
        var that = this;
        this.saveRemote(function () {
            that._saveTimer = null;
            $('#saving_progress').hide();

            /*for (var v in vis.views) {
                console.log('View: ' + v + ' ' + vis.views[v].settings.useAsDefault);
            }*/
        });
    },
    save: function (cb) {
        if (this._saveTimer) {
            clearTimeout(this._saveTimer);
            this._saveTimer = null;
        }
        var that = this;
        // Store the changes if nothing changed during next 2 seconds
        this._saveTimer = setTimeout(function () {
            that._saveToServer();
        }, 2000);

        $('#saving_progress').show();
        if (cb) cb();
    },
    undo: function () {
        if (this.undoHistory.length <= 1) return;

        var activeWidgets = this.activeWidgets;

        this.inspectWidgets([]);
        $('#visview_' + this.activeView).remove();

        this.undoHistory.pop();
        this.views[this.activeView] = $.extend(true, {}, this.undoHistory[this.undoHistory.length - 1]);
        this.saveRemote();

        if (this.undoHistory.length <= 1) {
            $('#button_undo').addClass('ui-state-disabled').removeClass('ui-state-hover');
        }

        this.renderView(this.activeView);
        this.changeViewEdit(this.activeView, true);
        this.inspectWidgets(activeWidgets);
    },
    getWidgetThumbnail: function (widget, maxWidth, maxHeight, callback) {
        var widObj = document.getElementById(widget);
        if (!widObj || !callback) {
            return;
        }
        maxWidth = maxWidth || 200;
        maxHeight = maxHeight || 40;

        if (!widObj.innerHTML || widObj.innerHTML.length > 20000) {
            var $elem = $(widObj);
            var newCanvas = document.createElement('canvas');
            newCanvas.height = maxHeight;
            newCanvas.width = Math.ceil($elem.width() / $elem.height() * newCanvas.height);
            if (newCanvas.width > maxWidth) {
                newCanvas.width = maxWidth;
                newCanvas.height = Math.ceil($elem.height / $elem.width * newCanvas.width);
            }

            var ctx = newCanvas.getContext('2d');
            ctx.clearRect(0, 0, newCanvas.width, newCanvas.height);
            ctx.fillStyle = "#FF0000";
            ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
            ctx.font = "5px Arial";
            ctx.fillText('Cannot render', 0, 0);
            callback(newCanvas);
        } else {
            html2canvas(widObj, {
                onrendered: function (canvas) {
                    var newCanvas = document.createElement('canvas');
                    newCanvas.height = maxHeight;
                    newCanvas.width = Math.ceil(canvas.width / canvas.height * newCanvas.height);
                    if (newCanvas.width > maxWidth) {
                        newCanvas.width = maxWidth;
                        newCanvas.height = Math.ceil(canvas.height / canvas.width * newCanvas.width);
                    }
                    var ctx = newCanvas.getContext('2d');
                    ctx.clearRect(0, 0, newCanvas.width, newCanvas.height);
                    ctx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
                    callback(newCanvas);
                }
            });
        }
    },
    showHint: function (content, life, type, onShow) {
        if (!$.jGrowl) {
            this.showMessage(content);
            return;
        }
        if (!this.growlInited) {
            this.growlInited = true;
            // Init jGrowl
            $.jGrowl.defaults.closer = true;
            $.jGrowl.defaults.check = 1000;
        }

        $('#growl_informator').jGrowl(content, {
            theme: type,
            life: (life === undefined) ? 10000 : life,
            sticky: (life === undefined) ? false : !life,
            afterOpen: function (e, m, o) {
                e.click(function () {
                    $(this).find('.jGrowl-close').trigger('jGrowl.close');
                });
                if (onShow) {
                    onShow(content);
                }
            }
        });
    },
    selectAll: function () {
        // Select all widgets on view
        var $focused = $(':focus');

        // Workaround


        if (!$focused.length && this.activeView) {
            var newWidgets = [];
            // Go through all widgets
            for (var widget in this.views[this.activeView].widgets) {
                newWidgets.push(widget);
            }
            this.inspectWidgets(newWidgets);
            return true;
        } else {
            return false;
        }
    },
    deselectAll: function () {
        // Select all widgets on view
        var $focused = $(':focus');
        if (!$focused.length && this.activeView) {
            this.inspectWidgets([]);
            return true;
        } else {
            return false;
        }
    },
    paste: function () {
        var $focused = $(':focus');
        if (!$focused.length) {
            if (this.clipboard && this.clipboard.length) {
                this.dupWidgets(this.clipboard);
                this.save();                // Select main widget and add to selection the secondary ones
                this.inspectWidgets();
            }
        }
    },
    copy: function (isCut, widgets) {
        var $focused = $(':focus');
        if (widgets || (!$focused.length && this.activeWidgets.length)) {
            var $clipboard_content = $('#clipboard_content');
            if (!$clipboard_content.length) {
                $('body').append('<div id="clipboard_content" style="display:none" class="vis-clipboard" title="' + _('Click to hide') + '"></div>');
                $clipboard_content = $('#clipboard_content');
            }

            this.clipboard = [];
            var widgetNames = '';
            widgets = widgets || this.activeWidgets;
            if (widgets.length) {
                for (var i = 0, len = widgets.length; i < len; i++) {
                    widgetNames += (widgetNames ? ', ' : '') + widgets[i];
                    this.clipboard.push({
                        widget: $.extend(true, {}, this.views[this.activeView].widgets[widgets[i]]),
                        view: (!isCut) ? this.activeView : '---copied---'
                    });
                }
            }

            /* this.showHint('<table><tr><td>' + _('Clipboard:') + '&nbsp;<b>' + widgetNames + '</b></td><td id="thumbnail" width="200px"></td></tr></table>', 0, null, function () {
             if (html2canvas) {
             this.getWidgetThumbnail(this.activeWidget, 0, 0, function (canvas) {
             $('#thumbnail').html(canvas);
             });
             }

             });
             */
            $clipboard_content.html('<table><tr><td>' + _('Clipboard:') + '&nbsp;<b>' + widgetNames + '</b></td><td id="thumbnail"></td></tr></table>');

            var that = this;
            if (typeof html2canvas != "undefined") {
                this.getWidgetThumbnail(widgets[0], 0, 0, function (canvas) {
                    $('#thumbnail').html(canvas);
                    if (isCut) {
                        that.delWidgets(widgets);
                        that.inspectWidgets([]);
                    }
                });
            } else {
                if (isCut) {
                    this.delWidgets(widgets);
                    this.inspectWidgets([]);
                }
            }

            $clipboard_content.css({left: ($(document).width() - $clipboard_content.width()) / 2})
                .click(function () {
                    $(this).slideUp('slow');
                })
                .fadeIn('fast');
        } else {
            $('#clipboard_content').remove();
        }
    },
    onButtonDelete: function (widgets) {
        var $focused = $(':focus');
        if (widgets || (!$focused.length && this.activeWidgets.length)) {
            widgets = widgets || JSON.parse(JSON.stringify(this.activeWidgets));
            var isHideDialog = this.config['dialog/delete_is_show'] || false;

            if (!isHideDialog) {
                if (widgets.length > 1) {
                    $('#dialog_delete_content').html(_('Do you want delete %s widgets?', widgets.length));
                } else {
                    $('#dialog_delete_content').html(_('Do you want delete widget %s?', widgets[0]));
                }

                var dialog_buttons = {};

                var delText = _('Delete').replace('&ouml;', 'ö');
                var that = this;
                dialog_buttons[delText] = function () {
                    if ($('#dialog_delete_is_show').prop('checked')) {
                        that.editSaveConfig('dialog/delete_is_show', true);
                    }
                    $(this).dialog('close');
                    that.delWidgets(widgets);
                    that.inspectWidgets([]);
                };
                dialog_buttons[_('Cancel')] = function () {
                    $(this).dialog('close');
                };

                $('#dialog_delete').dialog({
                    autoOpen: true,
                    width:    500,
                    height:   220,
                    modal:    true,
                    title:    _('Confirm widget deletion'),
                    open:    function (event, ui) {
                        $('[aria-describedby="dialog_delete"]').css('z-index', 11002);
                        $('.ui-widget-overlay').css('z-index', 1001);
                    },
                    buttons: dialog_buttons
                });
            } else {
                this.delWidgets(widgets);
                this.inspectWidgets([]);
            }
            return true;
        } else {
            return false;
        }
    },
    onButtonArrows: function (key, isSize, factor) {
        factor = factor || 1;
        var $focused = $(':focus');
        if (!$focused.length && this.activeWidgets.length) {
            var what = null;
            var shift = 0;
            if (isSize) {
                if (key == 39) {
                    //Right
                    what = 'width';
                    shift = 1;
                } else if (key == 37) {
                    // Left
                    what = 'width';
                    shift = -1;
                } else if (key == 40) {
                    // Down
                    what = 'height';
                    shift = 1;
                } else if (key == 38) {
                    // Up
                    what = 'height';
                    shift = -1;
                }
            } else {
                if (key == 39) {
                    //Right
                    what = 'left';
                    shift = 1;
                } else if (key == 37) {
                    // Left
                    what = 'left';
                    shift = -1;
                } else if (key == 40) {
                    // Down
                    what = 'top';
                    shift = 1;
                } else if (key == 38) {
                    // Up
                    what = 'top';
                    shift = -1;
                }
            }

            shift = shift * factor;

            for (var i = 0, len = this.activeWidgets.length; i < len; i++) {
                var widgetId = this.activeWidgets[i];
                var $actualWidget = $('#' + widgetId);
                if (this.views[this.activeView].widgets[widgetId].style[what] === undefined && $actualWidget.length) {
                    this.views[this.activeView].widgets[widgetId].style[what] = $actualWidget.css(what);
                }

                this.views[this.activeView].widgets[widgetId].style[what] = (parseInt(this.views[this.activeView].widgets[widgetId].style[what], 10) + shift) + 'px';

                if ($actualWidget.length) {
                    var setCss = {};
                    setCss[what] = this.views[this.activeView].widgets[widgetId].style[what];
                    $actualWidget.css(setCss);
                    this.showWidgetHelper(widgetId, true);
                }
            }

            if (this.delayedSettings) clearTimeout(this.delayedSettings);

            var that = this;
            this.delayedSettings = setTimeout(function () {
                // Save new settings
                var activeWidgets = JSON.parse(JSON.stringify(that.activeWidgets));
                that.activeWidgets = [];
                for (var i = 0, len = activeWidgets.length; i < len; i++) {
                    var mWidget = document.getElementById(activeWidgets[i]);

                    if ((what == 'top' || what == 'left') && mWidget._customHandlers && mWidget._customHandlers.onMoveEnd) {
                        mWidget._customHandlers.onMoveEnd(mWidget, activeWidgets[i]);
                    } else if (mWidget._customHandlers && mWidget._customHandlers.onCssEdit) {
                        mWidget._customHandlers.onCssEdit(mWidget, activeWidgets[i]);
                    }

                    if (mWidget._customHandlers && mWidget._customHandlers.isRerender) that.reRenderWidgetEdit(activeWidgets[i]);
                }
                that.delayedSettings = null;
                that.activeWidgets   = activeWidgets;
                that.inspectWidgets(true);
            }, 1000);

            this.save();

            return true;
        } else {
            return false;
        }
    },
    onPageClosing: function () {
        // If not saved
        if (this._saveTimer || !$("#css_file_save").prop('disabled')) {
            if (window.confirm(_('Changes are not saved. Are you sure?'))) {
                return null;
            } else {
                return _("Configuration not saved.");
            }
        }
        return null;
    },
    generateInstance: function () {
        if (typeof storage !== 'undefined') {
            this.instance = (Math.random() * 4294967296).toString(16);
            this.instance = '0000000' + this.instance;
            this.instance = this.instance.substring(this.instance.length - 8);
            $('#vis_instance').val(this.instance);
            storage.set(this.storageKeyInstance, this.instance);
        }
    },
    bindInstanceEdit: function () {
        var that = this;
        if (!this.instance) this.generateInstance();

        $('#vis_instance').change(function () {
            that.instance = $(this).val();
            if (typeof storage !== 'undefined') storage.set(that.storageKeyInstance, that.instance);
        }).val(this.instance);
    },
    lockWidgets: function (view, widgets) {
        view = view || this.activeView;
        // Disable selecte for all widgets
        var activeWidgets = $('#context_menu_paste').data('old-widgets');
        if (activeWidgets) activeWidgets = activeWidgets.split(' ');
        for (var w = 0; w < widgets.length; w++) {
            $('#' + widgets[w]).addClass('vis-widget-edit-locked').removeClass('ui-selectee ui-selected').unbind('click');
            this.views[view].widgets[widgets[w]].data.locked = true;
            if (activeWidgets && activeWidgets.indexOf(widgets[w]) != -1) {
                activeWidgets.splice(activeWidgets.indexOf(widgets[w]), 1);
            }
        }
        if (activeWidgets) $('#context_menu_paste').data('old-widgets', activeWidgets.join(' '));
    },
    unlockWidgets: function (view, widgets) {
        view = view || this.activeView;
        // Enable select for all widgets
        for (var w = 0; w < widgets.length; w++) {
            $('#' + widgets[w]).removeClass('vis-widget-edit-locked').addClass('ui-selectee');
            if (this.views[view].widgets[widgets[w]].data.locked !== undefined) {
                delete this.views[view].widgets[widgets[w]].data.locked;
            }
            this.bindWidgetClick(view, widgets[w]);
        }
    },
    bringTo: function (widgets, isToFront) {
        widgets = widgets || this.activeWidgets;
        var x = {min: 10000, max: -10000};
        var y = {min: 10000, max: -10000};
        var z = {min: 10000, max: -10000};

        // Calculate biggest square
        for (var w = 0; w < widgets.length; w++) {
            var $wid = $('#' + widgets[w]);
            var offset = $wid.position();
            var width  = $wid.outerWidth();
            var height = $wid.outerHeight();
            var zindex = parseInt($wid.css('z-index'), 10) || 0;
            if (offset.left < x.min) x.min = offset.left;
            if (offset.left + width > x.max) x.max = offset.left + width;
            if (offset.top  < y.min) y.min = offset.top;
            if (offset.top  + height > y.max) y.max = offset.top + height;
            if (zindex < z.min) z.min = zindex;
            if (zindex > z.max) z.max = zindex;
        }
        var minZ = 10000;
        var maxZ = -10000;

        console.log('Square (x.min ' + x.min + ', y.min ' +  y.min + '; x.max ' + x.max + ', y.max ' + y.max + ') z.min: '+ z.min + ', z.max: ' + z.max);

        // Find all widgets in this square
        var $list = $('#visview_' + this.activeView + ' .vis-widget').filter(function() {
            if (widgets.indexOf($(this).attr('id')) != -1) return false;
            var offset = $(this).position();
            var tl = {x: offset.left, y: offset.top}; // top left
            var br = {x: offset.left + $(this).outerWidth(), y: offset.top + $(this).outerHeight()};  // bottom right

            var isInside = false;
            if ((x.min <= tl.x  && tl.x <= x.max) &&
                (y.min <= tl.y  && tl.y <= y.max)) {
                isInside = true;
            } else
            if ((x.min <= br.x  && br.x <= x.max) &&
                (y.min <= tl.y  && tl.y <= y.max)) {
                isInside = true;
            } else
            if ((x.min <= tl.x  && tl.x <= x.max) &&
                (y.min <= br.y  && br.y <= y.max)) {
                isInside = true;
            } else
            if ((x.min <= br.x  && br.x <= x.max) &&
                (y.min <= br.y  && br.y <= y.max)) {
                isInside = true;
            } else
            if ((tl.x <= x.min  && x.max <= br.x) &&
                (tl.y <= y.min  && y.max <= br.y)) {
                isInside = true;
            }

            if (isInside) {
                var z = parseInt($(this).css('z-index'), 10) || 0;
                if (minZ > z) minZ = z;
                if (maxZ < z) maxZ = z;
                console.log('Widget in square: ' + $(this).attr('id') + ', zindex ' + z);
            }

            return isInside;
        });

        if (!$list.length) return;
        var that = this;
        // Move all widgets
        if (isToFront) {
            // If z-index will be over 900
            if (z.max - z.min >= 900 - maxZ) {
                var offset = z.max - z.min - (900 - maxZ) + 1;
                // Move all widgets to let place under them
                $list.each(function () {
                    var zindex = parseInt($(this).css('z-index'), 10) || 0;
                    zindex = zindex - offset < 0 ? 0 : zindex - offset;
                    $(this).css('z-index', zindex);
                    that.views[that.activeView].widgets[$(this).attr('id')].style['z-index'] = zindex;
                });
                maxZ -= offset;
            }

            // If everything is OK
            if (maxZ < z.min) return;
            if (maxZ == z.min) maxZ++;
            for (var w = 0; w < widgets.length; w++) {
                var $wid = $('#' + widgets[w]);
                var zindex = parseInt($wid.css('z-index'), 10) || 0;
                console.log('Move ' + widgets[w] + ' from ' + zindex  + ' to ' + (maxZ + zindex - z.min));
                zindex = maxZ + zindex - z.min + 1;
                $wid.css('z-index', zindex);
                this.views[this.activeView].widgets[widgets[w]].style['z-index'] = zindex;
            }
        } else {
            // If z-index will be negative
            if (z.max - z.min >= minZ) {
                var offset = z.max - z.min - minZ + 1;
                // Move all widgets to let place under them
                $list.each(function () {
                    var zindex = parseInt($(this).css('z-index'), 10) || 0;
                    zindex = zindex + offset > 900 ? 900 : zindex + offset;
                    $(this).css('z-index', zindex);
                    that.views[that.activeView].widgets[$(this).attr('id')].style['z-index'] = zindex;
                });
                minZ += offset;
            }
            if (z.max < minZ) return;
            if (minZ == z.max) minZ--;

            for (var w = 0; w < widgets.length; w++) {
                var $wid = $('#' + widgets[w]);
                var zindex = parseInt($wid.css('z-index'), 10) || 0;
                console.log('Move ' + widgets[w] + ' from ' + zindex  + ' to ' + (maxZ + zindex - z.min));
                zindex = minZ - zindex + z.max - 1;
                $wid.css('z-index', zindex);
                this.views[this.activeView].widgets[widgets[w]].style['z-index'] = zindex;
            }
        }
    },
    hideContextMenu: function (e) {
        if (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
        }
        var that = this;
        setTimeout(function () {
            var oldWidgets = $('#context_menu_paste').data('old-widgets');
            if (oldWidgets == 'null') return;

            oldWidgets = oldWidgets.split(' ');

            that.inspectWidgets(oldWidgets);
        }, 200);
        $('#context_menu').hide();
    },
    showContextMenu: function (options) {
        var that = this;
        var offset;
        var range;
        var $list = [];

        // Remove selectable to prevent widgets selection after click
        //if (this.selectable) $('#visview_' + this.activeView).selectable('destroy');
        $('#context_menu_paste').data('old-widgets', this.activeWidgets.join(' '));

        $('#context_menu_paste').data('posX', options.left);
        $('#context_menu_paste').data('posY', options.top);

        if (!$('#context_menu_paste').data('inited')) {
            $('#context_menu_paste').data('inited', true);
            $('#context_menu_paste').click(function (e) {
                that.hideContextMenu(e);
                var x = $('#context_menu_paste').data('posX');
                var y = $('#context_menu_paste').data('posY');
                // modify position of widget
                that.dupWidgets(that.clipboard, that.activeView, x, y);
                that.save();                // Select main widget and add to selection the secondary ones
                that.inspectWidgets();
            });
            $('#context_menu').blur(function () {
                $('#context_menu').hide();
            });
            $('#context_menu_import').click(function (e) {
                that.hideContextMenu(e);
                that.importWidgets();
            });
        }

        $('.context-menu-ul').remove();
        $('.context-menu-wid').remove();
        $('.context-submenu').unbind('click');
        $('#context_menu_wid').html('').hide();

        // If some widgets selected => find out if click on some widget
        if (this.activeWidgets && this.activeWidgets.length) {
            var isHit = false;
            // Find all widgets under the cursor
            for (var w = 0; w < this.activeWidgets.length; w++) {
                var $wid = $('#' + this.activeWidgets[w]);
                if (!$wid.length) continue;
                offset = $wid.position();
                range = {
                    x: [ offset.left, offset.left + $wid.outerWidth()  ],
                    y: [ offset.top,  offset.top  + $wid.outerHeight() ]
                };
                if ((options.left >= range.x[0] && options.left <= range.x[1]) &&
                    (options.top  >= range.y[0] && options.top  <= range.y[1])) {
                    isHit = true;
                    break;
                }
            }
            if (isHit) {
                $list = $('#visview_' + this.activeView + ' .vis-widget').filter(function() {
                    return that.activeWidgets.indexOf($(this).attr('id')) != -1;
                });
            } else {
                // Remove selection
                this.inspectWidgets([]);
            }
        }

        if (!$list.length) {
            // Find all widgets under the cursor
            $list = $('#visview_' + this.activeView + ' .vis-widget').filter(function() {
                offset = $(this).position();
                if (!$(this).length) return false;
                range = {
                    x: [ offset.left, offset.left + $(this).outerWidth() ],
                    y: [ offset.top,  offset.top  + $(this).outerHeight()]
                };
                return (options.left >= range.x[0] && options.left <= range.x[1]) && (options.top >= range.y[0] && options.top <= range.y[1]);
            });
        }

        if ($list.length == 1) {
            var wid = $($list[0]).attr('id');
            $('#context_menu_paste').data('widgets', wid);
            if (this.activeWidgets.length == 1 && wid == this.activeWidgets[0]) {
                $('#context_menu_select').hide();
            } else {
                $('#context_menu_select').show();
            }
            wid = that.getWidgetName(that.activeView, wid);
            $('#context_menu_wid').append(wid).show();

        } else if ($list.length > 1) {
            var widgets = [];
            var text = '<li data-wid="">' +  _('all') + '</li>';
            $list.each(function () {
                var wid = $(this).attr('id');
                text += '<li data-wid="' + wid + '" class="context-menu-common-item">' +  that.getWidgetName(that.activeView, wid) + '</li>';
                widgets.push(wid);
            });
            $('#context_menu_paste').data('widgets', widgets.join(' '));
            $('#context_menu_select').show();

            $('.context-submenu').append('<span class="context-menu-wid">...</span><ul class="context-menu-ul" style="min-width:300px">'   + text + '</ul>');
        } else {
            $('#context_menu_paste').data('widgets', '');
            $('.context-submenu').hide();
        }
        if ($list.length > 0) {
            $('.context-submenu').removeClass('ui-state-disabled');

            /*$('#context_menu_copy li, #context_menu_copy').click(function (e) {
                that.hideContextMenu(e);
                var widgets = [$(this).data('wid')];
                if (!widgets[0]) {
                    widgets = $('#context_menu_paste').data('widgets').split(' ');
                }
                that.copy(false, widgets);
            });

            $('#context_menu_delete li, #context_menu_delete').click(function (e) {
                that.hideContextMenu(e);
                var widgets = [$(this).data('wid')];
                if (!widgets[0]) {
                    widgets = $('#context_menu_paste').data('widgets').split(' ');
                }
                that.onButtonDelete(widgets);
            });

            $('#context_menu_select li, #context_menu_select').click(function (e) {
                that.hideContextMenu(e);
                var widgets = [$(this).data('wid')];
                if (!widgets[0]) {
                    widgets = $('#context_menu_paste').data('widgets').split(' ');
                }
                that.inspectWidgets(widgets);
            });

            $('#context_menu_cut li, #context_menu_cut').click(function (e) {
                that.hideContextMenu(e);
                var widgets = [$(this).data('wid')];
                if (!widgets[0]) {
                    widgets = $('#context_menu_paste').data('widgets').split(' ');
                }
                that.copy(true, widgets);
            });

            $('#context_menu_front li, #context_menu_front').click(function (e) {
                that.hideContextMenu(e);
                var widgets = [$(this).data('wid')];
                if (!widgets[0]) {
                    widgets = $('#context_menu_paste').data('widgets').split(' ');
                }
                that.bringTo(widgets, true);
            });

            $('#context_menu_back li, #context_menu_back').click(function (e) {
                that.hideContextMenu(e);
                var widgets = [$(this).data('wid')];
                if (!widgets[0]) {
                    widgets = $('#context_menu_paste').data('widgets').split(' ');
                }
                that.bringTo(widgets, false);
            });*/

            /*$('#context_menu_export li, #context_menu_export')*/
            $('.context-menu-common-item').click(function (e) {
                that.hideContextMenu(e);
                var widgets = [$(this).data('wid')];
                if (!widgets[0]) {
                    widgets = $('#context_menu_paste').data('widgets').split(' ');
                }
                var action = $(this).data('action');
                if (!action) action = $(this).parent().parent().data('action');
                switch(action) {
                    case 'lock':
                        that.lockWidgets(null, widgets);
                        break;
                    case 'unlock':
                        that.unlockWidgets(null, widgets);
                        break;
                    case 'export':
                        that.exportWidgets(widgets);
                        break;
                    case 'bringToBack':
                        that.bringTo(widgets, false);
                        break;
                    case 'bringToFront':
                        that.bringTo(widgets, true);
                        break;
                    case 'copy':
                        that.copy(false, widgets);
                        break;
                    case 'select':
                        $('#context_menu_paste').data('old-widgets', 'null');
                        that.inspectWidgets(widgets);
                        break;
                    case 'delete':
                        that.onButtonDelete(widgets);
                        break;
                    case 'cut':
                        that.copy(true, widgets);
                        break;
                }
            });
        }

        // Enable paste if something in clipboard
        if (this.clipboard && this.clipboard.length) {
            $('#context_menu_paste').removeClass('ui-state-disabled');
        } else {
            $('#context_menu_paste').addClass('ui-state-disabled');
        }
        if (!$('#context_menu').data('inited')) {
            $('#context_menu').data('inited', true);
        } else {
            $('#context_menu').menu('destroy');
        }

        $('#context_menu').css(options)
            .appendTo('#visview_' + this.activeView)
            .show()
            .focus()
            .menu({
            focus: function (event, ui) {
                var widgets = [ui.item.data('wid')];
                if (!widgets[0]) {
                    widgets = $('#context_menu_paste').data('widgets').split(' ');
                }
                for (var i = 0; i < widgets.length; i++) {
                    $('#' + widgets[i]).addClass('vis-widgets-highlight');
                }
            },
            blur: function (event, ui) {
                var widgets = $('#context_menu_paste').data('widgets').split(' ');
                for (var i = 0; i < widgets.length; i++) {
                    $('#' + widgets[i]).removeClass('vis-widgets-highlight');
                }
            }
        });
    }
});

$(document).keydown(function (e) {
    //                          Keycodes
    //
    // | backspace 	 8    |   e 	            69   |    numpad 8          104
    // | tab 	     9    |   f 	            70   |    numpad 9          105
    // | enter 	     13   |   g 	            71   |    multiply          106
    // | shift 	     16   |   h 	            72   |    add           	107
    // | ctrl 	     17   |   i 	            73   |    subtract          109
    // | alt 	     18   |   j 	            74   |    decimal point     110
    // | pause/break 19   |   k 	            75   |    divide            111
    // | caps lock 	 20   |   l 	            76   |    f1            	112
    // | escape 	 27   |   m 	            77   |    f2            	113
    // | page up 	 33   |   n 	            78   |    f3            	114
    // | page down 	 34   |   o 	            79   |    f4            	115
    // | end 	     35   |   p 	            80   |    f5            	116
    // | home 	     36   |   q 	            81   |    f6            	117
    // | left arrow  37   |   r 	            82   |    f7            	118
    // | up arrow 	 38   |   s 	            83   |    f8            	119
    // | right arrow 39   |   t	                84   |    f9            	120
    // | down arrow  40   |   u 	            85   |    f10           	121
    // | insert 	 45   |   v 	            86   |    f11           	122
    // | delete 	 46   |   w 	            87   |    f12           	123
    // | 0 	         48   |   x 	            88   |    num lock          144
    // | 1 	         49   |   y 	            89   |    scroll lock      	145
    // | 2 	         50   |   z 	            90   |    semi-colon       	186
    // | 3 	         51   |   left window key   91   |    equal sign       	187
    // | 4 	         52   |   right window key  92   |    comma             188
    // | 5 	         53   |   select key 	    93   |    dash          	189
    // | 6 	         54   |   numpad 0 	        96   |    period            190
    // | 7 	         55   |   numpad 1 	        97   |    forward slash     191
    // | 8 	         56   |   numpad 2 	        98   |    grave accent      192
    // | 9 	         57   |   numpad 3 	        99   |    open bracket      219
    // | a 	         65   |   numpad 4 	        100  |    back slash        220
    // | b 	         66   |   numpad 5 	        101  |    close braket      221
    // | c 	         67   |   numpad 6 	        102  |    single quote 	    222
    // | d 	         68   |   numpad 7 	        103  |
    // Capture ctrl-z (Windows/Linux) and cmd-z (MacOSX)
    if (e.which === 90 && (e.ctrlKey || e.metaKey)) {
        vis.undo();
        e.preventDefault();
    } else if (e.which === 65 && (e.ctrlKey || e.metaKey)) {
        // Ctrl+A
        if (vis.selectAll()) e.preventDefault();
    } else if (e.which === 83 && (e.ctrlKey || e.metaKey)) {
        // Ctrl+S
        e.preventDefault();
        vis.saveRemote();
    } else if (e.which === 27) {
        // Esc
        if (vis.deselectAll()) e.preventDefault();
    } else if (e.which === 46) {
        // Capture Delete button
        if (vis.onButtonDelete()) e.preventDefault();
    } else if (e.which === 37 || e.which === 38 || e.which === 40 || e.which === 39) {
        // Capture down, up, left, right for shift
        if (vis.onButtonArrows(e.which, e.shiftKey, (e.ctrlKey || e.metaKey ? 10 : 1))) {
            e.preventDefault();
        }
    } else if (e.which === 113) {
        $('#ribbon_tab_dev').toggle();
        vis.editSaveConfig(['show/ribbon_tab_dev'], $('#ribbon_tab_dev').is(":visible"));
        e.preventDefault();
    } else if (e.which === 114) {
        // Fullscreen
        var $container = $('#vis_container');
        var $pan_attr  = $('#attr_wrap');
        var delay;

        if ($container.hasClass('fullscreen')) {
            $('#attr_wrap').unbind('mouseenter').unbind('mouseleave');
            $('#pan_attr').show();
            $container.addClass('vis_container');
            $container.removeClass('fullscreen').appendTo('#vis_wrap');
            $pan_attr.removeClass('fullscreen-pan-attr').appendTo('#panel_body');
        } else {
            $container.removeClass('vis_container');
            $container.prependTo('body').addClass('fullscreen');
            $pan_attr.prependTo('body').addClass('fullscreen-pan-attr');

            $('#attr_wrap').bind('mouseenter', function () {
                clearTimeout(delay);
                $("#pan_attr").show('slide', {direction: 'right'});
            })
            .bind('mouseleave', function () {
                    delay = setTimeout(function () {
                        if ($pan_attr.hasClass('fullscreen-pan-attr')){
                            $('#pan_attr').hide('slide', {direction: 'right'});
                        }
                    }, 750);
                });
            $('#pan_attr').hide();
        }

        e.preventDefault();
    } else if (e.which === 33) {
        // Next View
        vis.nextView();
        e.preventDefault();
    }
    if (e.which === 34) {
        // Prev View
        vis.prevView();
        e.preventDefault();
    }
});

// Copy paste mechanism
$(window).on('paste', function (e) {
    vis.paste();
}).on('copy cut', function (e) {
    vis.copy(e.type == 'cut');
});

window.onbeforeunload = function () {
    return vis.onPageClosing();
};


