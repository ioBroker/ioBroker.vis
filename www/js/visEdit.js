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
    editIcons:             {
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
        lock:       'vis-preview-lock'
    },
    removeUnusedFields:     function () {
        var regExp = /^gestures-/;
        for (var view in this.views) {
            if (!this.views.hasOwnProperty(view) || view === '___settings') {
                continue;
            }
            for (var id in this.views[view].widgets) {
                if (!this.views[view].widgets.hasOwnProperty(id)) {
                    continue;
                }
                // Check all attributes
                var data = this.views[view].widgets[id].data;
                for (var attr in data) {
                    if (!data.hasOwnProperty(attr)) {
                        continue;
                    }
                    if ((data[attr] === '' || data[attr] === null) && regExp.test(attr)) {
                        delete data[attr];
                    }
                }
            }
        }
    },
    saveRemote:             function (mode, callback) {
        // remove all unused fields
        this.removeUnusedFields();

        if (typeof mode === 'function') {
            callback = mode;
            mode     = null;
        }
        if (typeof app !== 'undefined') {
            console.warn('Do not allow save of views from Cordova!');
            if (typeof callback === 'function') callback();
            return;
        }

        var that = this;
        if (this.permissionDenied) {
            if (this.showHint) this.showHint(_('Cannot save file "%s": ', that.projectPrefix + 'vis-views.json') + _('permissionError'),
                5000, 'ui-state-error');
            if (typeof callback === 'function') callback();
            return;
        }

        if (this.saveRemoteActive % 10) {
            this.saveRemoteActive--;
            setTimeout(function () {
                that.saveRemote(mode, callback);
            }, 1000);
        } else {
            if (!this.saveRemoteActive) this.saveRemoteActive = 30;
            if (this.saveRemoteActive === 10) {
                console.log('possible no connection');
                this.saveRemoteActive = 0;
                return;
            }
            // Sync widget before it will be saved
            if (this.activeWidgets) {
                for (var t = 0; t < this.activeWidgets.length; t++) {
                    if (this.activeWidgets[t].indexOf('_') !== -1 && this.syncWidgets) {
                        this.syncWidgets(this.activeWidgets);
                        break;
                    }
                }
            }
            // sort view names
            var keys = [];
            var k;
            for (k in this.views) {
                if (!this.views.hasOwnProperty(k)) continue;
                if (k === '___settings') continue;
                keys.push(k);
            }

            // case insensitive sorting
            keys.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
            var views = {};
            views.___settings = this.views.___settings;
            for (k = 0; k < keys.length; k++) {
                views[keys[k]] = this.views[keys[k]];
            }
            this.views = views;

            // replace all bounded variables with initial values
            var viewsToSave = JSON.parse(JSON.stringify(this.views));
            for (var b in this.bindings) {
                if (!this.bindings.hasOwnProperty(b)) continue;
                for (var h = 0; h < this.bindings[b].length; h++) {
                    try {
                        if (this.bindings[b][h].systemOid && this.bindings[b][h].systemOid.match(/^dev\d+$/)) {
                            // if widget still exists
                            if (viewsToSave[this.bindings[b][h].view].widgets[this.bindings[b][h].widget]) {
                                viewsToSave[this.bindings[b][h].view].widgets[this.bindings[b][h].widget][this.bindings[b][h].type][this.bindings[b][h].attr] = this.bindings[b][h].format;
                            }
                        }
                    } catch (e) {
                        console.warn('error by saving of binding: ' + this.bindings[b][h].view)
                    }
                }
            }
            viewsToSave = JSON.stringify(viewsToSave, null, 2);
            if (this.lastSave === viewsToSave) {
                if (typeof callback === 'function') callback(null);
                return;
            }

            this.conn.writeFile(this.projectPrefix + 'vis-views.json', viewsToSave, mode, function (err) {
                if (err) {
                    if (err === 'permissionError') {
                        that.permissionDenied = true;
                    }
                    that.showMessage(_('Cannot save file "%s": ', that.projectPrefix + 'vis-views.json') + _(err), _('Error'), 'alert', 430);
                } else {
                    that.lastSave = viewsToSave;
                }
                that.saveRemoteActive = 0;
                if (typeof callback === 'function') callback(err);

                // If not yet checked => check if project css file exists
                if (!that.cssChecked) {
                    that.conn.readFile(that.projectPrefix + 'vis-user.css', function (_err, data) {
                        that.cssChecked = true;
                        // Create vis-user.css file if not exist
                        if (err !== 'permissionError' && (_err || data === null || data === undefined)) {
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
    editShowHideViewBackground: function (view, isInit) {
        if (!this.views[view].settings) {
            this.views[view].settings = {};
        }
        if (this.groupsState['view-css-background']) {
            var $back = $('#inspect_view_css_background');
            if ($('#inspect_view_css_only_background').prop('checked')) {
                this.views[view].settings.useBackground = true;
                var that = this;
                $back.parent().parent().show();
                $('.vis-inspect-view-css').each(function () {
                    var attr = $(this).attr('id').slice(17);
                    if (attr.match(/^background-/)) {
                        $(this).parent().parent().hide();
                        if (that.views[view].settings.style) {
                            delete that.views[view].settings.style[attr];
                        }
                    }
                });
                if (!isInit) {
                    $back.val($('#visview_' + view).css('background'));
                }
            } else {
                this.views[view].settings.useBackground = false;
                $back.parent().parent().hide();
                var $view;
                if (!isInit) {
                    $view = $('#visview_' + view);
                }
                $('.vis-inspect-view-css').each(function () {
                    var attr = $(this).attr('id').slice(17);
                    if (attr.match(/^background-/)) {
                        $(this).parent().parent().show();
                        if (!isInit) {
                            $(this).val($view.css(attr));
                        }
                    }
                });
                if (this.views[view].settings.style) {
                    delete this.views[view].settings.style.background;
                }
            }
        }

    },
    editInit:               function () {
        var that = this;
        // Create debug variables
        this.states.attr({'dev1.val': 0});
        this.states.attr({'dev2.val': 0});
        this.states.attr({'dev3.val': 0});
        this.states.attr({'dev4.val': 0});
        this.states.attr({'dev6.val': 'string'});
        this.editLoadConfig();

        // create settings view if not exists
        if (this.views && !this.views.___settings) {
            this.views.___settings = {
                reloadOnSleep:      30, // seconds
                reconnectInterval:  10000, // milliseconds
                darkReloadScreen:   false,
                destroyViewsAfter:  30,  // seconds
                statesDebounceTime: 1000
            };
        }
        this.$selectView           = $('#select_view');
        this.$copyWidgetSelectView = $('#rib_wid_copy_view');
        this.$selectActiveWidgets  = $('#select_active_widget');

        this.editInitDialogs();
        this.editInitMenu();
        this.editInitCSSEditor();
        this.editInitScriptEditor();

        var $panAttr = $('#pan_attr');
        $panAttr.tabs({
            //activate: function(event, ui) {
            //    // Find out index
            //    //var i = 0;
            //    //$(this).find('a').each(function () {
            //    //    if ($(this).attr('href') === ui.newPanel.selector) {
            //    //        return false;
            //    //    }
            //    //    i++;
            //    //});
            //    //that.editSaveConfig('tabs/pan_attr', i);
            //}
        }).resizable({
            handles:  'w',
            maxWidth: 670,
            minWidth: 100,
            resize:   function () {
                $(this).css('left', 'auto');
            }

        });
        var $panAddWidget = $('#pan_add_wid');
        $panAddWidget.resizable({
            handles:  'e',
            maxWidth: 570,
            minWidth: 190,
            resize:   function () {
                $('#filter_set').clearSearch('update');
            }
        });

        if (this.config['size/pan_add_wid']) $panAddWidget.width(this.config['size/pan_add_wid']);
        if (this.config['size/pan_attr'])    $panAttr.width(this.config['size/pan_attr']);

        $(window).resize(layout);

        function layout() {
            $('#panel_body').height(parseInt($(window).height() - $('#menu_body').height() - 3));
            var panWidth = $('#pan_add_wid').width();
            $('#vis_wrap').width(parseInt($(window).width() - panWidth - $panAttr.width() - 1));
            that.editSaveConfig('size/pan_add_wid', panWidth);
            that.editSaveConfig('size/pan_attr',    $panAttr.width());
            if (that.css_editor) that.css_editor.resize();
        }

        layout();

        $('#vis-version').html(this.version);
        if (typeof visConfig !== 'undefined' && visConfig.license === false) {
            $('#vis-version').addClass('vis-license-error').attr('title', _('License error! Please check logs for details.'));
        }

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
                classes:          $(this).attr('id'),
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
            classes:          this.$selectActiveWidgets.attr('id'),
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
                if (pos === -1) that.activeWidgets.splice(i, 1);
            }
            for (var j = 0; j < widgets.length; j++) {
                if (that.activeWidgets.indexOf(widgets[j]) === -1) {
                    that.activeWidgets.push(widgets[j]);
                    that.actionHighlightWidget(widgets[j]);
                }
            }
            that.inspectWidgets(that.activeViewDiv, that.activeView);
        });
        // Button Click Handler

        $('#export_view').click(function () {
            that.exportView(that.activeViewDiv, that.activeView, false);
        });

        $('#export_widgets').click(function () {
            that.exportWidgets();
        });

        $('#import_widgets').click(function () {
            that.importWidgets();
        });

        if (this.conn.getType() === 'local') {
            // @SJ cannot select menu and dialogs if it is enabled
            //$('#wid_all_lock_function').trigger('click');
            $('#ribbon_tab_datei').show();
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
                    $(event.target).parent().find('.ui-dialog-titlebar-close .ui-button-text').html('');
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
                    var $mode = $('#vis_access_mode');
                    $mode.prop('checked', !$mode.prop('checked')).prop('disabled');
                }
            });
        });

        this.initStealHandlers();

        $('#inspect_view_css_only_background').change(function () {
            that.editShowHideViewBackground(that.activeView);
            that.save();
        });

        $('.vis-inspect-view-css').change(function () {
            var $this = $(this);
            var attr  = $this.attr('id').slice(17);
            var val   = $this.val();
            var $view = $('#visview_' + that.activeViewDiv);
            $view.css(attr, val);

            if (!that.views[that.activeView].settings.style) {
                that.views[that.activeView].settings.style = {};
            }
            that.views[that.activeView].settings.style[attr] = val;
            that.save();
        }).keyup(function () {
            $(this).trigger('change');
        }).each(function () {
            var options = $(this).data('options');
            if (options) {
                var values = options.split(';');
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
                } else if (val === 'user') {
                    $('#screen_size_x').prop('disabled', false);
                    $('#screen_size_y').prop('disabled', false);
                    $('.vis-screen-default').prop('disabled', false);
                    $('.rib_tool_resolution_toggle').button('enable');
                    $('#rib_tools_resolution_fix').toggle();
                    $('#rib_tools_resolution_manuel').toggle();
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
            var $sizeX = $('#size_x');
            if (x <= 0) {
                $sizeX.hide();
            } else {
                $sizeX.css('left', (parseInt(x, 10) + 1) + 'px').show();
                $('#size_y').css('width', (parseInt(x, 10) + 3) + 'px');
                if (y > 0) {
                    $sizeX.css('height', (parseInt(y, 10) + 3) + 'px');
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
                (e.keyCode === 65 && ( e.ctrlKey === true || e.metaKey === true ) ) ||
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
            var $sizeY = $('#size_y');
            if (y > 0) {
                $sizeY.css('top',    (parseInt(y, 10) + 1) + 'px').show();
                $('#size_x').css('height', (parseInt(y, 10) + 3) + 'px');
                if (x > 0) {
                    $sizeY.css('width', (parseInt(x, 10) + 3) + 'px');
                }
            } else {
                $sizeY.hide();
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
                that.save(that.activeViewDiv, that.activeView);
                that.inspectWidgets(that.activeViewDiv, that.activeView, []);
                that.editSetGrid(that.activeViewDiv, that.activeView);
                setTimeout(function () {
                    that.inspectWidgets(that.activeViewDiv, that.activeView, JSON.parse(aw));
                }, 200);
            }
        }).keyup(function () {
            $(this).trigger('change');
        });

        $('#snap_type').selectmenu({
            change: function () {
                var aw = JSON.stringify(that.activeWidgets);
                that.views[that.activeView].settings.snapType = parseInt($(this).val(), 10);
                var $gridSize = $('#grid_size');

                $gridSize.prop('disabled', that.views[that.activeView].settings.snapType !== 2);

                if (that.views[that.activeView].settings.snapType === 2 && !$gridSize.val()) $gridSize.val(10).trigger('change');
                that.editSetGrid(that.activeViewDiv, that.activeView);
                that.save(that.activeViewDiv, that.activeView);
                that.inspectWidgets(that.activeViewDiv, that.activeView, []);
                setTimeout(function () {
                    that.inspectWidgets(that.activeViewDiv, that.activeView, JSON.parse(aw));
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

                html = '<div id="prev_' + that.views[that.activeView].widgets[widID].tpl + '" style="position: relative; text-align: initial; padding: 4px ">' + html.toString() + '</div>';
                text += html;
            }
            $('body').append('<div id="dec_html_code"><textarea style="width: 100%; height: 100%">data-vis-prev=\'' + text + '\'</textarea></div>');
            $('#dec_html_code').dialog({
                width:  800,
                height: 600,
                open: function (event) {
                    $(event.target).parent().find('.ui-dialog-titlebar-close .ui-button-text').html('');
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
         $('#select_active_widget').append('<option value="' + widget + '">' + this.getWidgetName(this.activeView, widget) + </option>");
         }
         }
         $('#select_active_widget').multiselect('refresh');
         }

         }, 10000);*/

        // Instances (Actually not used)
        /*if (typeof storage !== 'undefined' && local === false) {
            // Show what's new
            if (storage.get('lastVersion') !== this.version) {
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
                                    if (typeof text !== 'string') {
                                        text = ioaddon.whatsNew[i][that.language] || ioaddon.whatsNew[i]['en'];
                                    }
                                    // Remove modifier information like (Bluefox) or (Hobbyquaker)
                                    if (text[0] === '(') {
                                        var j = text.indexOf(')');
                                        if (j !== -1) {
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
    editSetGrid:            function (viewDiv, view) {
        var grid = parseInt(this.views[view].settings.gridSize, 10);
        var $container = $('#vis_container');
        if (this.views[view].settings.snapType === 2 && grid > 2) {
            var $grid = $container.find('.vis-grid');
            if (!$grid.length) {
                $container.prepend('<div class="vis-grid"></div>');
                $grid = $container.find('.vis-grid');
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
                    'background-size':  this.views[view].settings.gridSize + 'px ' + this.views[view].settings.gridSize + 'px',
                    'background-image': 'url(img/' + img + ')'
                });
        } else {
            $container.find('.vis-grid').remove();
        }
    },
    editShowLeadingLines:   function (view, isHide) {
        view = view || this.activeView;
        if (!this.views[view]) view = this.getViewOfWidget(this.activeWidgets[0]);

        var $container = $('#vis_container');
        $container.find('.vis-leading-line').remove();
        if (isHide) return;
        var viewOffset = this.editGetViewOffset(view);

        // there are following lines
        // horz-top
        // horz-bottom
        // horz-middle
        // vert-left
        // vert-right
        // vert-center
        var line = 0;
        var l;
        for (var i = 0; i < this.activeWidgets.length; i++) {
            var $awid = $('#' + this.activeWidgets[i]);
            var aData = $awid.offset();
            aData.top  -= viewOffset.top;
            aData.left -= viewOffset.left;

            aData.top    = parseInt(aData.top, 10);
            aData.bottom = aData.top + parseInt($awid.height(), 10);
            aData.middle = (aData.bottom + aData.top) / 2;

            aData.left   = parseInt(aData.left, 10);
            aData.right  = aData.left + parseInt($awid.width(), 10);
            aData.center = (aData.left + aData.right) / 2;

            var lines = {
                horz: [],
                vert: []
            };
            var isLeft   = false;
            var isRight  = false;
            var isTop    = false;
            var isBottom = false;
            for (var wid in this.views[view].widgets) {
                if (this.activeWidgets.indexOf(wid) === -1 && !this.views[view].widgets[wid].grouped) {
                    var $wid = $('#' + wid);
                    if (!$wid.length) continue;
                    var data = $wid.offset();
                    if (!data) continue;

                    data.top  -= viewOffset.top;
                    data.left -= viewOffset.left;

                    isLeft   = false;
                    isRight  = false;
                    isTop    = false;
                    isBottom = false;

                    data.top    = parseInt(data.top, 10);
                    data.bottom = data.top + parseInt($wid.height(), 10);
                    data.middle = (data.bottom + data.top) / 2;

                    data.left   = parseInt(data.left, 10);
                    data.right  = data.left + parseInt($wid.width(), 10);
                    data.center = (data.left + data.right) / 2;

                    if (aData.left   === data.left) {
                        if (lines.horz.indexOf(aData.left) === -1) lines.horz.push(aData.left);
                        isLeft = true;
                    }
                    if (aData.left   === data.right) {
                        if (lines.horz.indexOf(aData.left) === -1) lines.horz.push(aData.left);
                        isLeft = true;
                    }
                    if (aData.left   === data.center) {
                        if (lines.horz.indexOf(aData.left) === -1) lines.horz.push(aData.left);
                        isLeft = true;
                    }

                    if (aData.right  === data.left) {
                        if (lines.horz.indexOf(aData.right) === -1) lines.horz.push(aData.right);
                        isRight  = true;
                    }
                    if (aData.right  === data.right) {
                        if (lines.horz.indexOf(aData.right) === -1) lines.horz.push(aData.right);
                        isRight  = true;
                    }
                    if (aData.right  === data.center) {
                        if (lines.horz.indexOf(aData.right) === -1) lines.horz.push(aData.right);
                        isRight  = true;
                    }

                    if (!isRight || !isLeft) {
                        if (aData.center === data.left) {
                            if (lines.horz.indexOf(aData.center) === -1) lines.horz.push(aData.center);
                        }
                        if (aData.center === data.right) {
                            if (lines.horz.indexOf(aData.center) === -1) lines.horz.push(aData.center);
                        }
                        if (aData.center === data.center) {
                            if (lines.horz.indexOf(aData.center) === -1) lines.horz.push(aData.center);
                        }
                    }

                    if (aData.top    === data.top) {
                        if (lines.vert.indexOf(aData.top) === -1) lines.vert.push(aData.top);
                        isTop = true;
                    }
                    if (aData.top    === data.bottom) {
                        if (lines.vert.indexOf(aData.top) === -1) lines.vert.push(aData.top);
                        isTop = true;
                    }
                    if (aData.top    === data.middle) {
                        if (lines.vert.indexOf(aData.top) === -1) lines.vert.push(aData.top);
                        isTop = true;
                    }

                    if (aData.bottom === data.top) {
                        if (lines.vert.indexOf(aData.bottom) === -1) lines.vert.push(aData.bottom);
                        isBottom = true;
                    }
                    if (aData.bottom === data.bottom) {
                        if (lines.vert.indexOf(aData.bottom) === -1) lines.vert.push(aData.bottom);
                        isBottom = true;
                    }
                    if (aData.bottom === data.middle) {
                        if (lines.vert.indexOf(aData.bottom) === -1) lines.vert.push(aData.bottom);
                        isBottom = true;
                    }

                    if (!isTop || !isBottom) {
                        if (aData.middle === data.top) {
                            if (lines.vert.indexOf(aData.middle) === -1) lines.vert.push(aData.middle);
                        }
                        if (aData.middle === data.bottom) {
                            if (lines.vert.indexOf(aData.middle) === -1) lines.vert.push(aData.middle);
                        }
                        if (aData.middle === data.middle) {
                            if (lines.vert.indexOf(aData.middle) === -1) lines.vert.push(aData.middle);
                        }
                    }
                }
            }
            for (l = 0; l < lines.horz.length; l++) {
                $container.append('<div class="vis-leading-line" style="top: 0; bottom: -' + viewOffset.top + 'px; left: ' + lines.horz[l] + 'px; width: 1px"></div>');
            }
            for (l = 0; l < lines.vert.length; l++) {
                $container.append('<div class="vis-leading-line" style="left: 0; right: -' + viewOffset.left + 'px; top: ' + lines.vert[l] + 'px; height: 1px"></div>');
            }
        }
    },
    editUpdateAccordeon:    function () {
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
                            icons: {primary: that.groupsState[group] ? 'ui-icon-triangle-1-n' : 'ui-icon-triangle-1-s'}
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
    editInitDialogs:        function () {
        var $pbody = $('#panel_body');

		if (typeof fillAbout !== 'undefined') {
			$('#dialog_about')
                .html(fillAbout())
                .dialog({
                    autoOpen: false,
                    width:    600,
                    height:   550,
                    open:     function (event /* , ui*/) {
                        $(event.target).parent().find('.ui-dialog-titlebar-close .ui-button-text').html('');
                        $('[aria-describedby="dialog_about"]').css('z-index', 1002);
                        $('.ui-widget-overlay').css('z-index', 1001);
                    },
                    position: {
                        my: 'center',
                        at: 'center',
                        of: $pbody
                    }
                });
		}

        $('#dialog_shortcuts').dialog({
            autoOpen: false,
            width: 600,
            height: 500,
            open:     function (event /* , ui*/) {
                $(event.target).parent().find('.ui-dialog-titlebar-close .ui-button-text').html('');
                $('[aria-describedby="dialog_shortcuts"]').css('z-index', 1002);
                $('.ui-widget-overlay').css('z-index', 1001);
            },
            position: {my: 'center', at: 'center', of: $pbody}
        });

    },
    editFileHandler:        function(event) {
        event.preventDefault();
        var file = event.dataTransfer ? event.dataTransfer.files[0] : event.target.files[0];

        var $dz = $('.vis-drop-zone').show();
        if (!file || !file.name || !file.name.match(/\.zip$/)) {
            $('.vis-drop-text').html(_('Invalid file extenstion!'));
            $dz.addClass('vis-dropzone-error').animate({opacity: 0}, 1000, function () {
                $dz.hide().removeClass('vis-dropzone-error').css({opacity: 1});
                $('.vis-drop-text').html(_('Drop the files here'));
            });
            return false;
        }

        if (file.size > 50000000) {
            $('.vis-drop-text').html(_('File is too big!'));
            $dz.addClass('vis-dropzone-error').animate({opacity: 0}, 1000, function () {
                $dz.hide().removeClass('vis-dropzone-error').css({opacity: 1});
                $('.vis-drop-text').html(_('Drop the files here'));
            });
            return false;
        }
        $dz.hide();
        var that = this;
        var reader = new FileReader();
        reader.onload = function (evt) {
            var $name = $('.vis-file-name');
            var $project = $('#name_import_project');
            $name.html('<img src="img/zip.png" /><br><span style="color: black; font-weight: bold">[' + that.editGetReadableSize(file.size) + ']</span><br><span style="color: black; font-weight: bold">' + file.name + '</span>');
                // string has form data:;base64,TEXT==
            $name.data('file', evt.target.result.split(',')[1]);

                $('.vis-import-text-drop-plus').hide();
            // try to extract project name from 2016-05-09-project.zip
            var m = file.name.match(/^\d{4}-\d{2}-\d{2}-([\w\d_-]+)\.zip$/);
            if (m && !$project.val()) $project.val(m[1]);

            $('#start_import_project').prop('disabled', !$name.data('file') || !$project.val());
        };
        reader.readAsDataURL(file);
    },
    editFillProjects:       function () {
        var that = this;
        // fill projects
        this.conn.readProjects(function (err, projects) {
            var text = '';
            if (projects.length) {
                for (var d = 0; d < projects.length; d++) {
                    text += '<li class="ui-state-default project-select ' + (projects[d].name + '/' === that.projectPrefix ? 'ui-state-active' : '') +
                        ' menu-item" data-project="' + projects[d].name + '"><a>' + projects[d].name + (projects[d].readOnly ? ' (' + _('readOnly') + ')' : '') + '</a></li>\n';
                    if (projects[d].name + '/' === that.projectPrefix) {
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
        });
    },
    editGetReadableSize:    function (bytes) {
        var text;
        if (bytes < 1024) {
            text = bytes + ' ' + _('bytes');
        } else if (bytes < 1024 * 1024) {
            text = Math.round(bytes * 10 / 1024) / 10 + ' ' + _('Kb');
        } else {
            text = Math.round(bytes * 10 / (1024 * 1024)) / 10 + ' ' + _('Mb');
        }
        if (this.isFloatComma) text = text.replace('.', ',');
        return text;
    },
    editGetViewOffset:      function (view, viewDiv, widget) {
        view = view || this.activeView;
        viewDiv = viewDiv || this.activeViewDiv || this.activeView;
        var viewOffset;
        if (viewDiv !== view) {
            viewOffset = $('#' + viewDiv).offset();
        } else {
            viewOffset = $('#visview_' + viewDiv).offset();
        }
        if (!widget) return viewOffset;
        var aData = $('#' + widget).offset();
        if (!aData) return null;
        aData.left -= viewOffset.left;
        aData.top  -= viewOffset.top;
        return aData;
    },
    editInitMenu:           function () {
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
                    if ($(this).attr('href') === ui.newPanel.selector) {
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
            $('li .menu-item [data-theme=' + this.config.editorTheme + ']').addClass('ui-state-active');
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
                if (view === '___settings') continue;
                if ($('.vis-view #visview' + view).length &&
                    (that.views[view].settings.theme === theme || that.views[view].settings.theme === oldValue)) {
                    that.renderView(view);
                }
            }

            setTimeout(function () {
                $('#scrollbar_style').remove();
                $('head').prepend('<style id="scrollbar_style">html{}::-webkit-scrollbar-thumb {background-color: ' + $('.ui-widget-header').first().css('background-color') + '}</style>');
            }, 300);

            // Select active theme in menu
            $('li .menu-item [data-theme=' + theme + ']').addClass('ui-state-active');

            that.save();
        });

        //language
        $('[data-language=' + ((typeof this.language === 'undefined') ? 'en' : (this.language || 'en')) + ']').addClass('ui-state-active');

        $('.language-select').click(function () {
            $('[data-language=' + that.language + ']').removeClass('ui-state-active');
            that.language = $(this).data('language');
            $(this).addClass('ui-state-active');
            if (typeof systemLang !== 'undefined') {
                systemLang = that.language;
            }
            // set moment language
            if (typeof moment !== 'undefined') {
                moment.lang(that.language);
            }
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
        //$('#m_setup').click(function () {
        //    $('#dialog_setup').dialog('open');
        //});

        // fill projects
        this.editFillProjects();

        $('#new-project-name').keypress(function (e) {
            if (e.which === 13) {
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
                open:    function (event) {
                    $(event.target).parent().find('.ui-dialog-titlebar-close .ui-button-text').html('');
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
                                if ($(this).data('project') === name) {
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
        $('.setup-settings').click(function () {
            $('#reloadOnSleep').val(that.views.___settings.reloadOnSleep);
            $('#darkReloadScreen').prop('checked', that.views.___settings.darkReloadScreen);
            $('#reconnectInterval').val(that.views.___settings.reconnectInterval);
            if (that.views.___settings.destroyViewsAfter === undefined) that.views.___settings.destroyViewsAfter = 30;
            $('#destroyViewsAfter').val(that.views.___settings.destroyViewsAfter);
            $('#statesDebounceTime').val(that.views.___settings.statesDebounceTime);
            $('#dialog-settings').dialog({
                autoPen:    true,
                width:      800,
                height:     300,
                modal:      true,
                draggable:  false,
                resizable:  false,
                open:    function (event) {
                    $(event.target).parent().find('.ui-dialog-titlebar-close .ui-button-text').html('');
                    $('[aria-describedby="dialog-settings"]').css('z-index', 1002);
                    //$('.ui-widget-overlay').css('z-index', 1001);
                },
                buttons: [
                    {
                        id: 'ok',
                        text: _('Ok'),
                        click: function () {
                            var changed = false;
                            var val = $('#reloadOnSleep').val();
                            if (that.views.___settings.reloadOnSleep != val) {
                                that.views.___settings.reloadOnSleep = val;
                                changed = true;
                            }
                            val = $('#destroyViewsAfter').val();
                            if (that.views.___settings.destroyViewsAfter != val) {
                                that.views.___settings.destroyViewsAfter = val;
                                changed = true;
                            }
                            val = $('#reconnectInterval').val();
                            if (that.views.___settings.reconnectInterval != val) {
                                that.views.___settings.reconnectInterval = val;
                                that.conn.setReconnectInterval(that.views.___settings.reconnectInterval);
                                changed = true;
                            }
                            val = $('#darkReloadScreen').prop('checked');
                            if (that.views.___settings.darkReloadScreen != val) {
                                that.views.___settings.darkReloadScreen = val;
                                changed = true;
                            }
                            val = $('#statesDebounceTime').val();
                            if (that.views.___settings.statesDebounceTime != val) {
                                that.views.___settings.statesDebounceTime = val;
                                changed = true;
                            }
                            if (changed) {
                                that.conn.setReloadTimeout(that.views.___settings.reloadOnSleep);
                                that.save();
                            }
                            $('#dialog-settings').dialog('close');
                        }
                    },
                    {
                        text: _('Cancel'),
                        click: function () {
                            $('#dialog-settings').dialog('close');
                        }
                    }
                ]
            });
        });

        $('.export-normal').click(function () {
            that.conn.readDirAsZip(that.projectPrefix, false, function (err, data) {
                if (err) {
                    that.showError(err);
                } else {
                    var d = new Date();
                    var date = d.getFullYear();
                    var m = d.getMonth() + 1;
                    if (m < 10) m = '0' + m;
                    date += '-' + m;
                    m = d.getDate();
                    if (m < 10) m = '0' + m;
                    date += '-' + m + '-';
                    $('body').append('<a id="zip_download" href="data: application/zip;base64,' + data + '" download="' + date + that.projectPrefix.substring(0, that.projectPrefix.length - 1) + '.zip"></a>');
                    document.getElementById('zip_download').click();
                    document.getElementById('zip_download').remove();
                }
            });
        });
        $('.export-anonymized').click(function () {
            that.conn.readDirAsZip(that.projectPrefix, true, function (err, data) {
                if (err) {
                    that.showError(err);
                } else {
                    var d = new Date();
                    var date = d.getFullYear();
                    var m = d.getMonth() + 1;
                    if (m < 10) m = '0' + m;
                    date += '-' + m;
                    m = d.getDate();
                    if (m < 10) m = '0' + m;
                    date += '-' + m + '-';
                    $('body').append('<a id="zip_download" href="data: application/zip;base64,' + data + '" download="' + date + that.projectPrefix.substring(0, that.projectPrefix.length - 1) + '.zip"></a>');
                    document.getElementById('zip_download').click();
                    document.getElementById('zip_download').remove();
                }
            });
        });
        $('#name_import_project').on('change', function () {
            $('#start_import_project').prop('disabled', !$('.vis-file-name').data('file') || !$(this).val());
        }).keyup(function () {
            $(this).trigger('change');
        });
        $('.vis-drop-file').change(function (e) {
            that.editFileHandler(e);
        });
        $('.vis-import-text-drop').click(function () {
            $('.vis-drop-file').trigger('click');
        });
        $('#start_import_project').button();
        $('.import-normal').click(function () {
            $('#dialog_import_project').dialog({
                autoOpen:   true,
                resizable:  false,
                width:      600,
                height:     320,
                modal:      true,
                open: function (event, ui) {
                    $(event.target).parent().find('.ui-dialog-titlebar-close .ui-button-text').html('');
                    $('[aria-describedby="dialog_import_project"]').css('z-index', 1002);
                    $('.ui-widget-overlay').css('z-index', 1001);
                    $('#name_import_project').val('');
                    $('.vis-file-name').data('file', null).html(_('Drop files here or click to select one'));
                    $('#start_import_project').prop('disabled', true);
                    $('.vis-drop-file').val('');
                    $('.vis-import-text-drop-plus').show();

                    var $dropZone = $('#dialog_import_project');
                    if (typeof(window.FileReader) !== 'undefined' && !$dropZone.data('installed')) {
                        $dropZone.data('installed', true);
                        var $dz = $('.vis-drop-zone');
                        $('.vis-drop-text').html(_('Drop the files here'));
                        $dropZone[0].ondragover = function() {
                            $dz.unbind('click');
                            $dz.show();
                            return false;
                        };
                        $dz.click(function () {
                            $dz.hide();
                        });

                        $dz[0].ondragleave = function() {
                            $dz.hide();
                            return false;
                        };

                        $dz[0].ondrop = function (e) {
                            that.editFileHandler(e);
                        }
                    }
                }
            });
        });
        $('#start_import_project').click(function () {
            $('#dialog_import_project').dialog('close');
            // Check if the name exists
            that.conn.readProjects(function (err, projects){
                var text = '';
                var name = $('#name_import_project').val();
                if (projects.length) {
                    for (var d = 0; d < projects.length; d++) {
                        if (projects[d].name === name) {
                            that.confirmMessage(_('Project "%s" yet exists. Do you want to overwrite it?', name), null, null, 700, function (result) {
                                if (result) {
                                    that.conn.writeDirAsZip(name, $('.vis-file-name').data('file'), function (err) {
                                        $('.vis-file-name').data('file', null);
                                        if (err) {
                                            that.showError(err);
                                        } else {
                                            if (name === that.projectPrefix.substring(0, that.projectPrefix.length - 1)) {
                                                // reload project
                                                window.location.reload();
                                            } else {
                                                that.confirmMessage(_('Project "%s" was succseffully imported. Open it?', name), null, null, 700, function (result) {
                                                    if (result) {
                                                        var url = window.location.href.split('#')[0].split('?')[0];
                                                        window.location = url + '?' + name;
                                                    } else {
                                                        // fill projects
                                                        that.editFillProjects();
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                            return;
                        }
                    }
                }
                that.conn.writeDirAsZip(name, $('.vis-file-name').data('file'), function (err) {
                    $('.vis-file-name').data('file', null);
                    if (err) {
                        that.showError(err);
                    } else {
                        that.confirmMessage(_('Project "%s" was succseffully imported. Open it?', name), null, null, 700, function (result) {
                            if (result) {
                                var url = window.location.href.split('#')[0].split('?')[0];
                                window.location = url + '?' + name;
                            } else {
                                // fill projects
                                that.editFillProjects();
                            }
                        });
                    }
                });
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
                $('body').append('<div id="dialog-select-member-object-browser" style="display: none"></div>');
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
                $(this).stop(true, true).effect('highlight');
            });

        // Widget ----------------------------------------------------------------

        $('#rib_wid_del').button({icons: {primary: 'ui-icon-trash', secondary: null}, text: false}).click(function () {
            that.delWidgets(that.activeViewDiv, that.activeView);
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
        $('#rib_wid_copy_cancel').button({icons: {primary: 'ui-icon-cancel', secondary: null}, text: false}).click(function () {
            $('#rib_wid').show();
            $('#rib_wid_copy_tr').hide();
        });

        $('#rib_wid_copy_ok').button({icons: {primary: 'ui-icon-check', secondary: null}, text: false}).click(function () {
            var widgets = that.dupWidgets($('#rib_wid_copy_view').val(), $('#rib_wid_copy_view').val());
            that.save($('#rib_wid_copy_view').val(), $('#rib_wid_copy_view').val());
            that.inspectWidgets(that.activeViewDiv, that.activeView, widgets);
            $('#rib_wid').show();
            $('#rib_wid_copy_tr').hide();
        });

        // Widget Align ---------------------
        $('#wid_align_left').click(function () {
            var data = [];
            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }

            var viewOffset = that.editGetViewOffset();

            for (var w = 0; w < that.activeWidgets.length; w++) {
                data.push({
                    wid: that.activeWidgets[w],
                    pos: parseInt($('#' + that.activeWidgets[w]).offset().left, 10) - viewOffset.left
                });
            }

            data.sort(function (a, b) {
                var aName = a.pos;
                var bName = b.pos;
                return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
            });
            var pos = data.shift().pos;

            for (var ww = 0; ww < data.length; ww++) {
                $('#' + data[ww].wid).css('left', pos  + 'px');
                that.editApplyPosition(that.activeViewDiv, that.activeView, data[ww].wid, null, pos);
                that.showWidgetHelper(that.activeViewDiv, that.activeView, data[ww].wid, true);
            }

            that.save();
        });
        $('#wid_align_right').click(function () {
            var data = [];
            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }

            var viewOffset = that.editGetViewOffset();

            for (var w = 0; w < that.activeWidgets.length; w++) {
                var $w = $('#' + that.activeWidgets[w]);
                var obj = {
                    wid:  that.activeWidgets[w],
                    pos:  parseInt($w.offset().left, 10) - viewOffset.left,
                    size: $w.width()
                };
                obj.pos += obj.size;
                data.push(obj);
            }

            data.sort(function (a, b) {
                var aName = a.pos;
                var bName = b.pos;
                return ((aName < bName) ? 1 : ((aName > bName) ? -1 : 0));
            });
            var pos = data.shift().pos;

            for (var ww = 0; ww < data.length; ww++) {
                var $ww = $('#' + data[ww].wid);
                $ww.css('left', pos - data[ww].size);
                that.editApplyPosition(that.activeViewDiv, that.activeView, data[ww].wid, null, (pos - data[ww].size));
                that.showWidgetHelper(that.activeViewDiv, that.activeView, data[ww].wid, true);
            }
            that.save();
        });
        $('#wid_align_top').click(function () {
            var data = [];
            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }

            var viewOffset = that.editGetViewOffset();

            for (var w = 0; w < that.activeWidgets.length; w++) {
                data.push({
                    wid: that.activeWidgets[w],
                    pos: parseInt($('#' + that.activeWidgets[w]).offset().top, 10) - viewOffset.top
                });
            }

            data.sort(function (a, b) {
                var aName = a.pos;
                var bName = b.pos;
                return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
            });
            var pos = data.shift().pos;

            for (var ww = 0; ww < data.length; ww++) {
                $('#' + data[ww].wid).css('top', pos  + 'px');
                that.editApplyPosition(that.activeViewDiv, that.activeView, data[ww].wid, pos, null);
                that.showWidgetHelper(that.activeViewDiv, that.activeView, data[ww].wid, true);
            }

            that.save();
        });
        $('#wid_align_bottom').click(function () {
            var data = [];

            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }
            var viewOffset = that.editGetViewOffset();

            for (var w = 0; w < that.activeWidgets.length; w++) {
                var $w = $('#' + that.activeWidgets[w]);
                var obj = {
                    wid:  that.activeWidgets[w],
                    pos:  parseInt($w.offset().top, 10) - viewOffset.top,
                    size: $w.height()
                };
                obj.pos += obj.size;
                data.push(obj);
            }

            data.sort(function (a, b) {
                var aName = a.pos;
                var bName = b.pos;
                return ((aName < bName) ? 1 : ((aName > bName) ? -1 : 0));
            });

            var pos = data.shift().pos;

            for (var ww = 0; ww < data.length; ww++) {
                var $ww = $('#' + data[ww].wid);
                $ww.css('top', pos - data[ww].size);
                that.editApplyPosition(that.activeViewDiv, that.activeView, data[ww].wid, (pos - data[ww].size), null);
                that.showWidgetHelper(that.activeViewDiv, that.activeView, data[ww].wid, true);
            }

            that.save();
        });
        $('#wid_align_vc').click(function () {
            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }

            var min  = 99990;
            var max  = -90000;
            var data = [];
            var viewOffset = that.editGetViewOffset();

            for (var w = 0; w < that.activeWidgets.length; w++) {
                var $w = $('#' + that.activeWidgets[w]);
                var obj = {
                    $w:     $w,
                    wid:    that.activeWidgets[w],
                    pos:    parseInt($w.offset().top, 10) - viewOffset.top,
                    size:   $w.height()
                };
                if (min > obj.pos) min = obj.pos;
                obj.pos += obj.size;
                if (max < obj.pos) max = obj.pos;
                data.push(obj);
            }

            var middle = (max + min) / 2;

            for (var ww = 0; ww < data.length; ww++) {
                var pos = middle - (data[ww].size / 2);
                data[ww].$w.css('top', pos + 'px');
                that.editApplyPosition(that.activeViewDiv, that.activeView, data[ww].wid, pos, null);
                that.showWidgetHelper(that.activeViewDiv, that.activeView, data[ww].wid, true);
            }
            that.save();
        });
        $('#wid_align_hc').click(function () {
            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }

            var min  = 99990;
            var max  = -90000;
            var data = [];
            var viewOffset = that.editGetViewOffset();

            for (var w = 0; w < that.activeWidgets.length; w++) {
                var $w = $('#' + that.activeWidgets[w]);
                var obj = {
                    $w:     $w,
                    wid:    that.activeWidgets[w],
                    pos:    parseInt($w.offset().left, 10) - viewOffset.left,
                    size:   $w.width()
                };
                if (min > obj.pos) min = obj.pos;
                obj.pos += obj.size;
                if (max < obj.pos) max = obj.pos;
                data.push(obj);
            }

            var middle = (max + min) / 2;

            for (var ww = 0; ww < data.length; ww++) {
                var pos = middle - (data[ww].size / 2);
                data[ww].$w.css('left', pos + 'px');
                that.editApplyPosition(that.activeViewDiv, that.activeView, data[ww].wid, null, pos);
                that.showWidgetHelper(that.activeViewDiv, that.activeView, data[ww].wid, true);
            }
        });
        $('#wid_dis_h').click(function () {
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
                var left = parseInt($('#' + this).css('left'));
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
                var $wid = $('#' + this.wid).css('left', left + 'px');
                that.editApplyPosition(that.activeViewDiv, that.activeView, this.wid, null, left);
                left = left + $wid.width();
                that.showWidgetHelper(that.activeViewDiv, that.activeView, this.wid, true);
            });
            that.save();
        });
        $('#wid_dis_v').click(function () {
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
                var $this = $('#' + this);
                var top = parseInt($this.css('top'));
                var bottom = top + $this.height();
                cont_size = cont_size + $this.height();
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
                var $wid = $('#' + this.wid).css('top', top + 'px');
                that.editApplyPosition(that.activeViewDiv, that.activeView, this.wid, top, null);
                top = top + $wid.height();
                that.showWidgetHelper(that.activeViewDiv, that.activeView, this.wid, true);
            });
            that.save();
        });
        $('#wid_align_width').click(function () {
            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }
            if (that.alignType !== 'wid_align_width') {
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
                that.editApplySize(that.activeViewDiv, that.activeView, that.activeWidgets[k], that.alignValues[that.alignIndex], null);
                that.showWidgetHelper(that.activeViewDiv, that.activeView, that.activeWidgets[k], true);
            }
            that.save();
        });
        $('#wid_align_height').click(function () {
            if (that.activeWidgets.length < 2) {
                that.showMessage(_('Select more than one widget and try again.'), _('Too less widgets'), 'info', 500);
                return;
            }
            if (that.alignType !== 'wid_align_height') {
                that.alignIndex  = 0;
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
                that.editApplySize(that.activeViewDiv, that.activeView, that.activeWidgets[u], null, that.alignValues[that.alignIndex]);
                that.showWidgetHelper(that.activeViewDiv, that.activeView, that.activeWidgets[u], true);
            }
            that.save();
        });

        // All Widget ---------------------
        $('#wid_all_lock_function').button({icons: {primary: 'ui-icon-locked', secondary: null}, text: false}).click(function () {
            var lock = $('#wid_all_lock_function').prop('checked');
            if (lock) {
                $('#vis_container').find('.vis-widget').addClass('vis-widget-lock');
                $('#wid_all_lock_f').addClass('ui-state-focus');
                if (that.activeView !== that.activeViewDiv) {
                    $('#' + that.activeViewDiv).removeClass('vis-widget-lock');
                }
            } else {
                $('#vis_container').find('.vis-widget').removeClass('vis-widget-lock');
                $('#wid_all_lock_f').removeClass('ui-state-focus');
            }
            that.editSaveConfig('button/wid_all_lock_function', lock);
        });

        // Enable by default widget lock function
        if (this.config['button/wid_all_lock_function'] === undefined ||
            this.config['button/wid_all_lock_function']) {
            setTimeout(function () {
                $('#wid_all_lock_function').prop('checked', true);
                $('#vis_container').find('.vis-widget').addClass('vis-widget-lock');
                $('#wid_all_lock_f').addClass('ui-state-focus ui-state-active');
            }, 200);
        }

        $('#wid_all_lock_drag').button({icons: {primary: 'ui-icon-extlink', secondary: null}, text: false}).click(function () {
            $('#wid_all_lock_d').removeClass('ui-state-focus');
            that.inspectWidgets(that.activeViewDiv, that.activeView, []);
            //that.editSaveConfig('checkbox/wid_all_lock_function', $('#wid_all_lock_function').prop('checked'));
        });

        // View ----------------------------------------------------------------

        // Add View -----------------
        $('#rib_view_add').button({icons: {primary: 'ui-icon-plusthick', secondary: null}, text: false}).click(function () {
            $('#rib_view').hide();
            $('#rib_view_add_tr').show();
            $('#rib_view_addname').val('').focus();
        });
        $('#rib_view_add_cancel').button({icons: {primary: 'ui-icon-cancel', secondary: null}, text: false}).click(function () {
            $('#rib_view').show();
            $('#rib_view_add_tr').hide();
        });
        $('#rib_view_addname').keyup(function (e) {
            // On enter
            if (e.which === 13) $('#rib_view_add_ok').trigger('click');
            // esc
            if (e.which === 27) $('#rib_view_add_cancel').trigger('click');
        });

        $('#rib_view_add_ok').button({icons: {primary: 'ui-icon-check', secondary: null}, text: false}).click(function () {
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
        $('#rib_view_rename_cancel').button({icons: {primary: 'ui-icon-cancel', secondary: null}, text: false}).click(function () {
            $('#rib_view').show();
            $('#rib_view_rename_tr').hide();
        });
        $('#rib_view_newname').keyup(function (e) {
            // On enter
            if (e.which === 13) $('#rib_view_rename_ok').trigger('click');
            // esc
            if (e.which === 27) $('#rib_view_rename_cancel').trigger('click');
        });
        $('#rib_view_rename_ok').button({icons: {primary: 'ui-icon-check', secondary: null}, text: false}).click(function () {
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
            $('#rib_view_copyname').val(that.activeView + '_new').focus();
        });
        $('#rib_view_copy_cancel').button({icons: {primary: 'ui-icon-cancel', secondary: null}, text: false}).click(function () {
            $('#rib_view').show();
            $('#rib_view_copy_tr').hide();
        });
        $('#rib_view_copyname').keyup(function (e) {
            // On enter
            if (e.which === 13) $('#rib_view_copy_ok').trigger('click');
            // esc
            if (e.which === 27) $('#rib_view_copy_cancel').trigger('click');
        });
        $('#rib_view_copy_ok').button({icons: {primary: 'ui-icon-check', secondary: null}, text: false}).click(function () {
            var name = that.checkNewViewName($('#rib_view_copyname').val().trim());
            if (name === false) return;
            that.dupView(that.activeView, name);
            $('#rib_view').show();
            $('#rib_view_copy_tr').hide();
        });

        // Tools ----------------------------------------------------------------
        // Resolution -----------------

        $('.rib_tool_resolution_toggle').button({
            text:  false,
            icons: {primary: 'ui-icon-refresh'}
        }).css({width: 22, height: 22}).click(function () {
            $('#rib_tools_resolution_fix').toggle();
            $('#rib_tools_resolution_manuel').toggle();
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

                if (that.config['button/closeMode'] === 'refresh') {
                    that.conn.sendCommand('*', 'refresh', null, false);
                } else if (that.config['button/closeMode'] === 'play') {
                    try {
                        var win = window.open(document.location.protocol + '//' + document.location.host + document.location.pathname.replace('edit', 'index') + window.location.search + '#' + that.activeView, 'vis-runtime');
                        if (win) {
                            if (navigator.userAgent.indexOf("Firefox") > 0) {
                                // give to firefox time to update location
                                setTimeout(function () {
                                    win.location.reload();
                                    win.focus();
                                }, 1000);
                            } else {
                                win.location.reload();
                                win.focus();
                            }
                        } else {
                            that.showError(_('Popup window blocked!'), _('Cannot open new window'), 'alert');
                        }
                    } catch (err) {
                        that.showError(_('Popup window blocked: %s!', err), _('Cannot open new window'), 'alert');
                    }
                } else {
                    // Show hint how to get back to edit mode
                    if (!that.config['dialog/isEditHintShown']) {
                        that.editSaveConfig('dialog/isEditHintShown', true);
                        window.alert(_('To get back to edit mode just call "%s" in browser', location.href));
                    }

                    setTimeout(function () {
                        // Some systems (e.g. offline mode) show here the content of directory if called without index.html
                        location.href = 'index.html' + window.location.search + '#' + that.activeView;
                    }, 100);
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
                }).trigger('click');
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
        $('.oid-dev').change(function () {
            var timer = $(this).data('timer');
            if (timer) clearTimeout(timer);
            var $that = $(this);
            $that.data('timer', setTimeout(function () {
                $that.data('timer', null);
                var val = $that.val();
                if ($that.attr('type') === 'number') {
                    if ($that.attr('step') == '0.1') {
                        val = val.replace(',', '.');
                        that.setValue($that.attr('id').split('_')[1], parseFloat(val));
                    } else {
                        that.setValue($that.attr('id').split('_')[1], parseInt(val, 10));
                    }
                } else {
                    that.setValue($that.attr('id').split('_')[1], $that.val());
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
                var options = {
                    left: e.pageX - parentOffset.left,
                    top:  e.pageY - parentOffset.top
                };

                options.scrollLeft = $(this).scrollLeft();
                options.scrollTop  = $(this).scrollTop();

                options.left += options.scrollLeft;
                options.top  += options.scrollTop;

                that.showContextMenu(that.activeViewDiv, that.activeView, options);

                e.preventDefault();
            }
        });

        // show current project
        $('#current-project').html(that.projectPrefix.substring(0, that.projectPrefix.length - 1));
    },
    editOneWidgetPreview:   function (tplElem) {
        var tpl           = $(tplElem).attr('id');
        var $tpl          = $('#' + tpl);
        var type          = $tpl.data('vis-type') || '';
        var beta          = '';
        var classTypes    = '';
        var behaviorIcons = [];
        var types;

        if (type) {
            types = type.split(',');
            if (types.length < 2) types = type.split(';');
            var noIconTypes = [];

            for (var z = 0; z < types.length; z++) {
                types[z] = types[z].trim();
                classTypes += types[z] + ' ';

                if (!this.editIcons[types[z]]) {
                    noIconTypes.push(types[z]);
                } else {
                    behaviorIcons.push('<div class="vis-preview-informer ' + this.editIcons[types[z]] + '"></div>');
                }
                types[z] = _(types[z]);
            }
            type = '<div class="wid-prev-type">' + noIconTypes.join(',') + '</div>';
        } else {
            types = [];
        }

        if ($tpl.data('vis-beta')) {
            beta = '<div style="color: red; width: 100%;  z-index: 100; top: 50% ; font-size: 15px;">!!! BETA !!!</div>';
        }

        var set = $tpl.data('vis-set');
        classTypes += set + ' ' + $tpl.data('vis-name');
        classTypes = classTypes.toLowerCase().replace('ctrl', 'control').replace('val', 'value');

        return '<div id="prev_container_' + tpl + '" class="wid-prev ' + set + '_prev widget-filters" data-keywords="' + classTypes + '" data-tpl="' + tpl + '" title="' + types.join(', ') + '">' + type + '<div class="wid-prev-name" >' + $tpl.data('vis-name') + '</div>'  + beta + '<div class="vis-preview-informers-container">' + behaviorIcons.join('') + '</div></div>';
    },
    editInitWidgetPreview:  function () {
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
                $('.wid-prev').removeClass('wid-prev-k');
                $('.wid-prev-content').css('zoom', 1);
            } else {
                that.editSaveConfig('button/btn_prev_zoom', true);
                $(this).addClass('ui-state-active');
                $('.wid-prev').addClass('wid-prev-k');
                $('.wid-prev-content').css('zoom', 0.5);
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
                $('.wid-prev-type').hide();
            } else {
                that.editSaveConfig('button/btn_prev_type', true);
                $(this).addClass('ui-state-active');
                $('.wid-prev-type').show();
            }
        });

        var $panel = $('#panel_body');
        var $toolbox = $('#toolbox');
        // create widget sets
        $.each(this.widgetSets, function () {
            var set = this.name || this;
            var tplList = $('.vis-tpl[data-vis-set="' + set + '"]');

            for (var i = 0; i < tplList.length; i++) {
                var tpl = $(tplList[i]).attr('id');
                if (tpl === '_tplGroup') continue; // do not show group widget
                var text = that.editOneWidgetPreview(tplList[i]);
                var $preview = $(text);
                $toolbox.append($preview);

                var $tpl     = $('#' + tpl);
                var $prev    = $tpl.data('vis-prev');

                if ($prev) {
                    var content = $preview.append($prev);
                    $(content).children().last().addClass('wid-prev-content');
                }

                $preview.draggable({
                    helper:      'clone',
                    appendTo:    $panel,
                    containment: $panel,
                    zIndex:      10000,
                    cursorAt:    {top: 0, left: 0},

                    start: function (event, ui) {
                        if (ui.helper.children().length < 3) {
                            $(ui.helper).addClass('ui-state-highlight ui-corner-all').css({padding: '2px', 'font-size': '12px'});
                        } else {
                            $(ui.helper).find('.wid-prev-type').remove();
                            $(ui.helper).find('.wid-prev-name').remove();
                            $(ui.helper).css('border', 'none');
                            $(ui.helper).css('width',  'auto');
                        }
                    }
                });
                // Add widget by double click
                /*$('#prev_container_' + tpl).dblclick(function () {
                 var tpl = $(this).data('tpl');
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
                 if (attrs.indexOf('oid') !== -1) data.oid = 'nothing_selected';
                 }
                 if (renderVisible) data.renderVisible = true;

                 var widgetId = that.addWidget({tpl: tpl, data: data});

                 that.$selectActiveWidgets.append('<option value="' + widgetId + '">' + that.getWidgetName(that.activeView, widgetId) + '</option>')
                 .multiselect('refresh');

                 setTimeout(function () {
                 that.inspectWidgets();
                 }, 50);
                 });*/
            }
        });

        $('.wid-prev').dblclick(function () {
            that.editShowWizard(that.activeViewDiv, that.activeView, $(this).clone());
        });

        if (this.config['button/btn_prev_type']) {
            $('#btn_prev_type').trigger('click');
        }

        if (this.config['button/btn_prev_type'] === undefined) {
            $('#btn_prev_type').trigger('click');
        }

        if (this.config['button/btn_prev_zoom']) {
            $('#btn_prev_zoom').trigger('click');
        }
    },
    editBuildSelectView:    function () {
        var keys = [];
        var k;
        for (k in this.views) {
            if (!this.views.hasOwnProperty(k)) continue;
            if (k === '___settings') continue;
            keys.push(k);
        }

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
    editInitSelectView:     function () {
        var that = this;
        $('#view_select_tabs_wrap').resize(function () {
            var o = {
                parent_w: $('#view_select_tabs_wrap').width(),
                self_w:   $('#view_select_tabs').width(),
                self_l:   parseInt($('#view_select_tabs').css('left'))
            };
            if (o.parent_w >= (o.self_w + o.self_l)) {
                $('#view_select_tabs').css('left', (o.parent_w - o.self_w) + 'px');
            }
        });

        $('#view_select_left').button({
            icons: {
                primary: 'ui-icon-carat-1-w'
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
                    $('#view_select_tabs').css('left', o.self_l + 50 + 'px');
                } else {
                    $('#view_select_tabs').css('left', 0);
                }
            }
        });

        $('#view_select_list').button({
            icons: {
                primary: 'ui-icon-clipboard'
            },
            text: false
        }).click(function () {
            var tempList = that.$selectView.clone();
            tempList.val(that.activeView);
            tempList.selectmenu({
                position: { my: "left top", at: "left bottom", of: "#view_select_list", collision: "none" },
                change: function (event, ui) {
                    var view = $(this).val();
                    that.changeView(view, view);
                },
                close: function( event, ui ) {
                    tempList.selectmenu('destroy');
                    tempList.remove();
                }
            });
            tempList.selectmenu('menuWidget').css('max-height', '400px')
                .parent()
                .css('max-height', 'calc(100vh - 135px)')
                .css('overflow-x', 'hidden')
                .css('overflow-y', 'scroll');
            tempList.selectmenu('open');
        });

        $('#view_select_right').button({
            icons: {
                primary: 'ui-icon-carat-1-e'
            },
            text: false
        }).click(function () {
            var o = {
                parent_w: $('#view_select_tabs_wrap').width(),
                self_w:   $('#view_select_tabs').width(),
                self_l:   parseInt($('#view_select_tabs').css('left'))
            };

            if (o.self_w != o.parent_w) {
                if ((o.parent_w - o.self_w) <= (o.self_l - 50)) {
                    $('#view_select_tabs').css('left', o.self_l - 50 + 'px');
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
                        $('#view_select_tabs').css('left', o.self_l - 20 + 'px');
                    } else {
                        $('#view_select_tabs').css('left', (o.parent_w - o.self_w) + 'px');
                    }
                }
            } else {
                if (o.self_w != o.parent_w) {
                    if ((o.self_l + 20) <= 0) {
                        $('#view_select_tabs').css('left', o.self_l + 20 + 'px');
                    } else {
                        $('#view_select_tabs').css('left', 0);
                    }
                }
            }
        });

        $('#view_select_tabs').unbind('click').on('click', '.view-select-tab', function () {
            var view = $(this).attr('id').replace('view_tab_', '');
            $('.view-select-tab').removeClass('ui-tabs-active ui-state-active');
            $(this).addClass('ui-tabs-active ui-state-active');
            that.changeView(view, view);
        });
        this.editBuildSelectView();
    },
    editInitCSSEditor:      function () {
        var that      = this;

        var file      = 'vis-common-user';
        var editor    = ace.edit('css_editor');
        var timer     = null;
        var selecting = false;

        //editor.setTheme('ace/theme/monokai');
        editor.getSession().setMode('ace/mode/css');
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion:  true
        });
        editor.$blockScrolling = Infinity;
        editor.getSession().setUseWrapMode(true);

        if (that.config['select/select_css_file']) {
            file = that.config['select/select_css_file'];
            $('#select_css_file').val(file);
        }

        $('#select_css_file').selectmenu({
            change: function (event, ui) {
                // Save file
                if (file === 'vis-user') {
                    that.conn.writeFile(that.projectPrefix + 'vis-user.css' , editor.getValue(), function () {
                        $('#css_file_save').button('disable');
                    });
                } else if (file === 'vis-common-user') {
                    that.conn.writeFile('/vis/css/vis-common-user.css', editor.getValue(), function () {
                        $('#css_file_save').button('disable');
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
                $('.' + file).text(editor.getValue());
                $('#css_file_save').button('enable');

                // Trigger autosave after 2 seconds
                setTimeout(function () {
                    $('#css_file_save').trigger('click');
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

        $('#css_find_prev').button({
            icons: {
                primary: 'ui-icon-arrowthick-1-n'
            },
            text: false
        }).click(function(){
            editor.findPrevious();
        });

        $('#css_find_next').button({
            icons: {
                primary: 'ui-icon-arrowthick-1-s'
            },
            text: false
        }).click(function(){
            editor.findNext();
        });

        $('#css_file_save').button({
            icons: {
                primary: 'ui-icon-disk'
            },
            text: false
        }).click(function() {
            var val = $('#select_css_file').val();
            if (val === 'vis-user') {
                that.conn.writeFile(that.projectPrefix + 'vis-user.css' , editor.getValue(), function () {
                    $('#css_file_save').button('disable');
                });
            } else if (val === 'vis-common-user') {
                that.conn.writeFile('/vis/css/vis-common-user.css', editor.getValue(), function () {
                    $('#css_file_save').button('disable');
                });
            }
        }).button('disable');
    },
    editInitScriptEditor:   function () {
        var that      = this;
        var editor    = ace.edit('script_editor');
        var timer     = null;

        //editor.setTheme('ace/theme/monokai');
        editor.getSession().setMode('ace/mode/javascript');
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion:  true
        });
        editor.$blockScrolling = Infinity;
        editor.getSession().setUseWrapMode(true);

        if (this.views && this.views.___settings && this.views.___settings.scripts) {
            editor.setValue(this.views.___settings.scripts);
        }

        editor.getSession().on('change', function(e) {
            if (timer !== null) return;
            timer = setTimeout(function () {
                timer = null;
                $('#script_file_save').button('enable');

                // Trigger autosave after 2 seconds
                setTimeout(function () {
                    $('#script_file_save').trigger('click');
                }, 2000);
            }, 400);
        });

        $('#script_editor_tab').click(function(){
            editor.focus();
        });

        $('#pan_attr').resize(function(){
            editor.resize();
        });

        $('#script_find').change(function(){
            editor.find($(this).val(),{
                backwards: false,
                wrap: false,
                caseSensitive: false,
                wholeWord: false,
                regExp: false
            });
        });

        $('#script_find_prev').button({
            icons: {
                primary: 'ui-icon-arrowthick-1-n'
            },
            text: false
        }).click(function(){
            editor.findPrevious();
        });

        $('#script_find_next').button({
            icons: {
                primary: 'ui-icon-arrowthick-1-s'
            },
            text: false
        }).click(function(){
            editor.findNext();
        });

        $('#script_file_save').button({
            icons: {
                primary: 'ui-icon-disk'
            },
            text: false
        }).click(function() {
            that.views.___settings = !that.views.___settings || {};
            that.views.___settings.scripts = editor.getValue();

            that.saveRemote(function () {
                $('#script_file_save').button('disable');
            });
        }).button('disable');
    },
    editInitNext:           function () {
        // vis Editor Init
        var that = this;

        this.editInitSelectView();
        this.updateViewLists();

        $('#select_view-menu').css('max-height', '400px');

        $('#inspect_view_theme').selectmenu({
            width: '100%',
            change: function () {
                var theme = $(this).val();
                that.views[that.activeView].settings.theme = theme;
                that.addViewStyle(that.activeViewDiv, that.activeView, theme);
                //that.additionalThemeCss(theme);
                that.save();
            }
        });
        // set max height of select menu and autocomplete
        $('#inspect_view_theme-menu').css('max-height', '300px');

        var $inspectGroups = $('#inspect_view_group');

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
                    that.save();
                }
            }
            //noneSelectedText: _("Select options")
        }).change(function () {
            that.views[that.activeView].settings.group = $(this).val();
            that.save();
        }).data('changed', false);

        $inspectGroups.next().css('width', '100%');

        $('#inspect_view_group-menu').css('max-height', '300px');

        $('#inspect_view_group_action').change(function () {
            that.views[that.activeView].settings.group_action = $(this).val();
            that.save();
        });

        // end old select View xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        var $selectSet = $('#select_set');
        //$select_set.html('');
        $selectSet.append('<option value="all">*</option>');
        this.widgetSets.sort(function (a, b) {
            if ((a.name || a) > (b.name || b)) return 1;
            if ((a.name || a) < (b.name || b)) return -1;
            return 0;
        });
        for (var i = 0; i < this.widgetSets.length; i++) {
            // skip empty sets, like google fonts
            if (!$('.vis-tpl[data-vis-set="' + (this.widgetSets[i].name || this.widgetSets[i]) + '"]').length) continue;

            if (this.widgetSets[i].name !== undefined ) {
                $selectSet.append('<option value="' + this.widgetSets[i].name + '">' + this.widgetSets[i].name + '</option>');
            } else {
                $selectSet.append('<option value="' + this.widgetSets[i] + '">' + this.widgetSets[i] + '</option>');
            }
        }

        if (this.config['select/select_set']) {
            $selectSet.find('option[value="' + this.config['select/select_set'] + '"]').prop('selected', true);
        }

        this.editInitWidgetPreview();

        $selectSet.selectmenu({
            change: function (event, ui) {
                var tpl = ui.item.value;
                that.editSaveConfig('select/select_set', tpl);
                if (tpl === 'all') {
                    $('.wid-prev').css('display', 'inline-block');
                } else {
                    $('.wid-prev').hide();
                    $('.' + tpl + '_prev').css('display', 'inline-block');

                    // Remove filter
                    if ($filter_set.val() && $filter_set.val() !== '*') {
                        $filter_set.val('*');
                        var textToShow = $filter_set.find(':selected').text();
                        $filter_set.parent().find('span').find('input').val(textToShow);
                        filterWidgets();
                    }
                }
            }
        });

        if (this.editTemplatesInit) {
            this.editTemplatesInit();
        }

        // set maximal height
        $('#select_set-menu').css('max-height', '400px');

        // Create list of filters
        this.filterList = [];
        $('.widget-filters').each(function () {
            var keywords = $(this).data('keywords').split(' ');
            for (var k = 0; k < keywords.length; k++) {
                if (that.filterList.indexOf(keywords[k]) === -1) that.filterList.push(keywords[k]);
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
                    if (value !== '' && value !== '*' && $selectSet.val() !== 'all') {
                        $selectSet.val('all');
                        $selectSet.selectmenu('refresh');
                    }
                    var keywords = $(this).data('keywords');
                    if (value === '' || value === '*' || keywords.indexOf(value) !== -1) {
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
                    return value.substring(0, request.term.length).toLowerCase() === request.term.toLowerCase();
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
            if ($filter_set.val() && $filter_set.val() !== '*') {
                $filter_set.val('*');
                var textToShow = $filter_set.find(':selected').text();
                $filter_set.parent().find('span').find('input').val(textToShow);
                filterWidgets();
            }
        }).clearSearch();

        if (this.config['select/select_set'] !== 'all' && this.config['select/select_set']) {
            $('.wid-prev').hide();
            $('.' + this.config['select/select_set'] + '_prev').show();
        }

        if (this.config['select/filter_set'] && this.config['select/filter_set'] !== '*') {
            $filter_set.val(this.config['select/filter_set']);
            var textToShow = $filter_set.find(':selected').text();
            $filter_set.parent().find('span').find('input').val(textToShow);
            setTimeout(filterWidgets, 500);
        }

        // Expand/Collapse view settings
        $('.view-group').each(function () {
            $(this).button({
                icons: {
                    primary: 'ui-icon-triangle-1-s'
                },
                text: false
            }).css({width: 22, height: 22}).click(function () {
                var group = $(this).attr('data-group');
                that.groupsState[group] = !that.groupsState[group];
                $(this).button('option', {
                    icons: {primary: that.groupsState[group] ? 'ui-icon-triangle-1-n' : 'ui-icon-triangle-1-s'}
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

            if (type === 'color') {
                if ((typeof colorSelect !== 'undefined' && $().farbtastic)) {
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
                that.inspectWidgets(that.activeViewDiv, that.activeView, []);
            });
        }

        if (this.conn.getType() === 'local') {
            $('#export_local_view').click(function () {
                that.exportView(that.activeViewDiv, that.activeView, true);
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
                        $(event.target).parent().find('.ui-dialog-titlebar-close .ui-button-text').html('');
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
        $('head').prepend('<style id="scrollbar_style">html{}::-webkit-scrollbar-thumb {background-color: ' + $('.ui-widget-header').first().css('background-color') + '}</style>');

        $filter_set.clearSearch('update');
    },
    editLoadConfig:         function () {
        // Read all positions, selected widgets for every view,
        // Selected view, selected menu page,
        // Selected widget or view page
        // Selected filter
        if (typeof storage !== 'undefined') {
            try {
                var stored = storage.get('visConfig');
                this.config = stored ? JSON.parse(stored) : {};
            } catch (e) {
                console.log('Cannot load edit config');
                this.config = {};
            }
        }
    },
    editSaveConfig:         function (attr, value) {
        if (attr) this.config[attr] = value;

        if (typeof storage !== 'undefined') {
            storage.set('visConfig', JSON.stringify(this.config));
        }
    },
    /**
     * Change order of widgets in th e view.
     *
     * @view {string} view name. If empty then activeView
     * @wid {string} widget name.
     * @direction {string} "next" or "prev". If no orderWid will be given, so the order will change according to actual position.
     * @orderWid {string} optional name of widget after (next) or before (prev) of which
     */
    editWidgetOrder:        function (view, wid, direction, orderWid) {
        var w;
        view = view || this.activeView;
        if (!orderWid) {
            if (direction === 'next' || direction === 'n') {
                for (w in this.views[view].widgets) {
                    if (!this.views[view].widgets.hasOwnProperty(w)) continue;
                    if (orderWid === true) {
                        var position = this.views[view].widgets[w].style.position;
                        if (position === 'relative' || position === 'static' || position === 'sticky') {
                            orderWid = w;
                            break;
                        }
                    }
                    if (w === wid) orderWid = true;
                }
            } else {
                for (w in this.views[view].widgets) {
                    if (!this.views[view].widgets.hasOwnProperty(w)) continue;
                    if (w === wid) break;

                    var position = this.views[view].widgets[w].style.position;
                    if (position === 'relative' || position === 'static' || position === 'sticky') {
                        orderWid = w;
                    }
                }
            }
        }

        if (orderWid && orderWid !== true && this.views[view].widgets[orderWid]) {
            var newOrder = {};
            for (w in this.views[view].widgets) {
                if (!this.views[view].widgets.hasOwnProperty(w)) continue;
                if (w === wid) continue;
                if (w === orderWid) {
                    if (direction === 'next' || direction === 'n') {
                        newOrder[w]   = this.views[view].widgets[w];
                        newOrder[wid] = this.views[view].widgets[wid];
                        $('#' + wid).detach().insertAfter('#' + w);
                    } else {
                        newOrder[wid] = this.views[view].widgets[wid];
                        newOrder[w]   = this.views[view].widgets[w];
                        $('#' + wid).detach().insertBefore('#' + w);
                    }
                } else {
                    newOrder[w] = this.views[view].widgets[w];
                }
            }
            this.views[view].widgets = null;
            this.views[view].widgets = newOrder;
        }
    },
    confirmMessage:         function (message, title, icon, width, callback) {
        if (typeof width === 'function') {
            callback = width;
            width = '400';
        }

        if (!this.$dialogConfirm) {
            this.$dialogConfirm = $('#dialog-confirm');
            this.$dialogConfirm.dialog({
                autoOpen: false,
                modal:    true,
                open: function (event) {
                    $(event.target).parent().find('.ui-dialog-titlebar-close .ui-button-text').html('');
                    $(this).parent().css({'z-index': 1001});
                },
                width: width,
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
            $('#dialog-confirm-icon')
                .show()
                .attr('class', '')
                .addClass('ui-icon ui-icon-' + icon);
        } else {
            $('#dialog-confirm-icon').hide();
        }
        this.$dialogConfirm.data('callback', callback);
        this.$dialogConfirm.dialog('open');
    },
    addView:                function (view) {
        var _view = view.replace(/\s/g, '_').replace(/\./g, '_');
        if (this[_view]) return false;

        this.views[_view] = {settings: {style: {}}, widgets: {}, name: view};
        var that = this;
        this.saveRemote(function () {
            //$(window).off('hashchange');
            //window.location.hash = '#' + view;

            //noinspection JSJQueryEfficiency
            $('#view_tab_' + that.activeView).removeClass('ui-tabs-active ui-state-active');
            that.changeView(_view, _view);

            that.editBuildSelectView();
            //noinspection JSJQueryEfficiency
            $('#view_tab_' + that.activeView).addClass('ui-tabs-active ui-state-active');

            that.updateViewLists();
        });
    },
    renameView:             function (oldName, newName) {
        var _newName = newName.replace(/\s/g, '_').replace(/\./g, '_');
        this.views[_newName] = $.extend(true, {}, this.views[oldName]);
        this.views[_newName].name = newName;

        $('#vis_container').html('');
        delete this.views[oldName];
        this.activeView    = _newName;
        this.activeViewDiv = this.activeView;
        var that = this;
        this.renderView(_newName, _newName, function () {
            that.changeView(_newName, _newName, function (_viewName, _view) {
                // Rebuild tabs, select, selectCopyTo
                $('#view_tab_' + oldName).attr('id', 'view_tab_' + _newName);
                $('#view_tab_' + _newName).removeClass('sel_opt_' + oldName).addClass('ui-tabs-active ui-state-active sel_opt_' + _newName).html(newName);
                var $opt = that.$selectView.find('option[value="' + oldName + '"]');
                $opt.html(newName).attr('value', _newName);
                that.$selectView.val(_newName);
                that.$selectView.selectmenu('refresh');

                $opt = that.$copyWidgetSelectView.find('option[value="' + oldName + '"]');
                $opt.html(newName).attr('value', _newName);
                that.$copyWidgetSelectView.val(_newName);
                that.$copyWidgetSelectView.selectmenu('refresh');
                that.saveRemote();
            });
        });
    },
    updateViewLists:        function () {
        var keys = [];
        var i;
        var k;
        for (k in this.views) {
            if (!this.views.hasOwnProperty(k)) continue;
            if (k === '___settings') continue;
            keys.push(k);
        }
        var len = keys.length;

        // case insensitive sorting
        keys.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        var text = '';
        for (i = 0; i < len; i++) {
            text += '<option value="' + keys[i] + '">' + keys[i] + '</option>';
        }
        this.$selectView.html(text);
        this.$selectView.val(this.activeView);

        // if not yet created
        if (!this.$selectView.data('inited')) {
            this.$selectView.data('inited', true);
            var that = this;
            this.$selectView.selectmenu({
                change: function (event, ui) {
                    var view = $(this).val();
                    that.changeView(view, view);
                }
            }).selectmenu('menuWidget').parent().addClass('view-select-menu');
        } else {
            this.$selectView.selectmenu('refresh');
        }

        this.$copyWidgetSelectView.html(text);
        this.$copyWidgetSelectView.val(this.activeView);

        // if not yet created
        if (!this.$copyWidgetSelectView.data('inited')) {
            this.$copyWidgetSelectView.data('inited', true);
            this.$copyWidgetSelectView.selectmenu();
        } else {
            this.$copyWidgetSelectView.selectmenu('refresh');
        }
    },
    delView:                function (view) {
        var that = this;
        this.confirmMessage(_('Really delete view %s?', view), null, 'help', function (result) {
            if (result) {
                if (view === that.activeView) that.nextView();

                if (that.views[view]) delete that.views[view];
                that.saveRemote(function () {
                    $('#view_tab_' + view).remove();
                    $('#visview_'  + view).remove();

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
    dupView:                function (source, dest) {
        var _dest = dest.replace(/\s/g, '_').replace(/\./g, '_');
        this.views[_dest] = $.extend(true, {}, this.views[source]);
        this.views[_dest].name = dest;

        // Give to all widgets new IDs...
        var that = this;

        var rename = function(widget, force) {
            if (!force && that.views[_dest].widgets[widget].grouped) return widget;
            if (that.views[_dest].widgets[widget].data.members) {
                var members_new = [];
                for (var i = 0; i < that.views[_dest].widgets[widget].data.members.length; i++) {
                    var member = that.views[_dest].widgets[widget].data.members[i];
                    members_new.push(rename(member, true));
                }
                var group_new = that.nextGroup();
                that.views[_dest].widgets[widget].data.members = members_new;
                that.views[_dest].widgets[group_new] = that.views[_dest].widgets[widget];
                delete that.views[_dest].widgets[widget];
                return group_new;
            } else {
                var name_new = that.nextWidget();
                that.views[_dest].widgets[name_new] = that.views[_dest].widgets[widget];
                delete that.views[_dest].widgets[widget];
                return name_new;
            }
        };
        for (var widget in this.views[_dest].widgets) {
            if (!this.views[_dest].widgets.hasOwnProperty(widget)) continue;
            rename(widget, false);
        }


        this.saveRemote(function () {
            that.renderView(_dest, _dest, function (_view) {
                that.changeView(_view, _view);
                $('.view-select-tab').removeClass('ui-tabs-active ui-state-active');

                that.editBuildSelectView();
                $('#view_tab_' + _view).addClass('ui-tabs-active ui-state-active');

                that.$selectView.append('<option value="' + _view + '">' + dest + '</option>');
                that.$selectView.val(_view);
                that.$selectView.selectmenu('refresh');

                that.$copyWidgetSelectView.append('<option value="' + _view + '">' + dest + '</option>');
                that.$copyWidgetSelectView.val(_view);
                that.$copyWidgetSelectView.selectmenu('refresh');
            });
        });
    },
    nextView:               function () {
        var $select = $('.view-select-tab.ui-state-active');
        var $next = $select.parent().next().children().first();

        if ($next.hasClass('view-select-tab')) {
            $next.trigger('click');
        } else {
            $select.parent().parent().children().first().children().first().trigger('click');
        }
    },
    prevView:               function () {
        var $select = $('.view-select-tab.ui-state-active');
        var $prev = $select.parent().prev().children().first();

        if ($prev.hasClass('view-select-tab')) {
            $prev.trigger('click');
        } else {
            $select.parent().parent().children().last().children().first().trigger('click');
        }
    },
    editGetWidgets:         function (view, widget, _result) {
        view = view || this.activeView;
        _result = _result || [];
        if (_result.indexOf(widget) === -1) _result.push(widget);
        if (widget[0] === 'g') {
            var wid = this.views[view].widgets[widget];
            for (var j = 0; j < wid.data.members.length; j++) {
                this.editGetWidgets(view, wid.data.members[j], _result);
            }
        }
        return _result;
    },
    exportWidgetsAsZip:     function (view, widgets) {
        // create image, get all widgets into widgets.txt
    },
    exportWidgets:          function (widgets) {
        this.removeUnusedFields();

        var exportW = [];
        widgets = widgets || this.activeWidgets;

        for (var i = 0; i < widgets.length; i++) {
            var list = this.editGetWidgets(null, widgets[i]);
            for (var j = 0; j < list.length; j++) {
                var obj = JSON.parse(JSON.stringify(this.views[this.activeView].widgets[list[j]]));
                if (this.activeView !== this.activeViewDiv && obj.grouped) {
                    delete obj.grouped;
                } else if (obj.grouped) {
                    obj.groupName = list[j];
                }

                exportW.push(obj);
            }
        }

        $('#textarea_export_widgets').val(JSON.stringify(exportW)).select();

        $('#dialog_export_widgets').dialog({
            autoOpen: true,
            width:    800,
            height:   600,
            modal:    true,
            open:     function (event /*, ui*/) {
                $(event.target).parent().find('.ui-dialog-titlebar-close .ui-button-text').html('');
                $('[aria-describedby="dialog_export_widgets"]').css('z-index', 1002);
                $('.ui-widget-overlay').css('z-index', 1001);
            }
        });
    },
    importWidgets:          function (viewDiv, view) {
        $('#textarea_import_widgets').val('');
        var that = this;
        viewDiv = viewDiv || this.activeViewDiv;
        view    = view    || this.activeView;

        $('#dialog_import_widgets').dialog({
            autoOpen: true,
            width:    800,
            height:   600,
            modal:    true,
            open:     function (event, ui) {
                $('[aria-describedby="dialog_import_widgets"]').css('z-index', 1002);
                $('.ui-widget-overlay').css('z-index', 1001);
                $(event.target).parent().find('.ui-dialog-titlebar-close .ui-button-text').html('');

                $('#start_import_widgets').unbind('click').click(function () {
                    $('#dialog_import_widgets').dialog('close');
                    var importObject;
                    try {
                        var text = $('#textarea_import_widgets').val();
                        importObject = JSON.parse(text);
                    } catch (e) {
                        that.showMessage(_('invalid JSON') + '\n\n' + e, _('Error'));
                        return;
                    }

                    var widgets = [];
                    var mapping = {};

                    // inverted order because of groups
                    for (var widget = importObject.length - 1; widget >= 0; widget--) {
                        if (that.binds.bars && that.binds.bars.convertOldBars && importObject[widget].data.baroptions) {
                            importObject[widget] = that.binds.bars.convertOldBars(importObject[widget]);
                        }

                        if (importObject[widget].tpl === '_tplGroup') {
                            // try to convert members
                            for (var d = 0; d < importObject[widget].data.members.length; d++) {
                                if (mapping[importObject[widget].data.members[d]]) {
                                    importObject[widget].data.members[d] = mapping[importObject[widget].data.members[d]];
                                } else {
                                    console.error('Unexpected error: widget "' + importObject[widget].data.members[d] + '" not found in export.');
                                }
                            }
                        }

                        var widgetId = that.addWidget(viewDiv, view, {
                            widgetSet: importObject[widget].widgetSet,
                            tpl:       importObject[widget].tpl,
                            data:      importObject[widget].data,
                            style:     importObject[widget].style,
                            grouped:   importObject[widget].grouped,
                            noSave:    true,
                            noAnimate: true
                        }, true);

                        if (importObject[widget].groupName) {
                            mapping[importObject[widget].groupName] = widgetId;
                        }

                        // (tpl, data, style, wid, view, noSave, noAnimate)
                        if (!importObject[widget].grouped) widgets.push(widgetId);
                    }
                    // update widget select
                    that.updateSelectWidget(viewDiv, view);

                    that.saveRemote(function () {
                        //that.renderView(viewDiv, view, function (viewDiv, view) {that.inspectWidgets(viewDiv, view, activeWidgets);});
                        that.inspectWidgets(viewDiv, view, widgets);
                    });
                });
            }
        });
    },
    exportView:             function (viewDiv, view, isAll) {
        var exportView = $.extend(true, {}, isAll ? this.views : this.views[view]);
        // Set to all widgets the new ID...
        var num = 1;
        var wid;
        if (!isAll) {
            for (var widget in exportView.widgets) {
                wid = 'e' + ('0000' + num).slice(-5);
                num += 1;
                exportView.widgets[wid] = exportView.widgets[widget];
                delete exportView.widgets[widget];
            }
            if (exportView.activeWidgets) {
                delete exportView.activeWidgets;
            }
        }

        $('#textarea_export_view').val(JSON.stringify(exportView, null, 4));

        document.getElementById('textarea_export_view').select();

        $('#dialog_export_view').dialog({
            autoOpen: true,
            width:    800,
            height:   600,
            modal:    true,
            open:     function (event /* , ui*/) {
                $(event.target).parent().find('.ui-dialog-titlebar-close .ui-button-text').html('');
                $('[aria-describedby="dialog_export_view"]').css('z-index', 1002);
                $('.ui-widget-overlay').css('z-index', 1001);
            }
        });
    },
    importView:             function (isAll) {
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
            that.showMessage(_('invalid JSON') + '\n\n' + e, _('Error'), 'alert');
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
                that.renderView(_name, _name, function (_viewDiv, _view) {
                    that.changeView(_viewDiv, _view);
                });
            });
        }
    },
    checkNewViewName:       function (name) {
        if (name === undefined || name === null) name = '';
        if (name === 0) name = '0';

        name = name.trim();
        name = name.replace(/\s/g, '_').replace(/\./g, '_');
        if (!name && name !== 0) {
            this.showMessage(_('Please enter the name for the new view!'));
            return false;
        } else if (this.views[name] || name === '___settings') {
            this.showMessage(_('The view with the same name yet exists!'));
            return false;
        } else {
            return name;
        }
    },
    nextWidget:             function () {
        var next = 1;
        var used = [];
        var key = 'w' + (('000000' + next).slice(-5));
        for (var view in this.views) {
            if (!this.views.hasOwnProperty(view) || view === '___settings') continue;
            for (var wid in this.views[view].widgets) {
                if (!this.views[view].widgets.hasOwnProperty(wid)) continue;
                wid = wid.split('_');
                wid = wid[0];
                used.push(wid);
            }
            while (used.indexOf(key) > -1) {
                next += 1;
                key = 'w' + (('000000' + next).slice(-5));
            }
        }
        return key;
    },
    nextGroup:              function () {
        var next = 1;
        var used = [];
        var key = 'g' + (('000000' + next).slice(-5));
        for (var view in this.views) {
            if (!this.views.hasOwnProperty(view) || view === '___settings') continue;
            for (var wid in this.views[view].widgets) {
                if (!this.views[view].widgets.hasOwnProperty(wid)) continue;
                wid = wid.split('_');
                wid = wid[0];
                used.push(wid);
            }
            while (used.indexOf(key) > -1) {
                next++;
                key = 'g' + (('000000' + next).slice(-5));
            }
        }
        return key;
    },
    getViewOfWidget:        function (id) {
        // find view of this widget
        var view = null;
        for (var v in this.views) {
            if (v === '___settings') continue;
            if (this.views[v] && this.views[v].widgets && this.views[v].widgets[id]) {
                view = v;
                break;
            }
        }
        return view;
    },
    getViewsOfWidget:       function (id) {
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
                if (v === '___settings') continue;
                if (this.views[v].widgets[wid + '_' + v] !== undefined) {
                    result[result.length] = v;
                }
            }
            return result;
        }
    },
    getUserGroups:          function () {
        return this.userGroups;
    },
    delWidgetHelper:        function (viewDiv, view, id, isAll, groupId) {
        if (!id) return;

        if (isAll && id.indexOf('_') !== -1) {
            var views = this.getViewsOfWidget(id);
            var wids = id.split('_', 2);
            for (var i = 0; i < views.length; i++) {
                var viewDivs = viewDiv.split('_', 2);
                this.delWidgetHelper(viewDivs[0] + '_' + views[i], views[i], wids[0] + '_' + views[i], false);
            }
            this.inspectWidgets(viewDiv, view, []);
            return;
        }

        // Remove widget from the list
        this.updateSelectWidget(viewDiv, view, null, id);

        var widgetDiv = document.getElementById(id);
        if (widgetDiv && widgetDiv.visCustomEdit && widgetDiv.visCustomEdit['delete']) {
            widgetDiv.visCustomEdit['delete'](id);
        }

        if (widgetDiv && widgetDiv._customHandlers && widgetDiv._customHandlers.onDelete) {
            widgetDiv._customHandlers.onDelete(widgetDiv, id);
        }
        if (this.views[view].widgets[id] && this.views[view].widgets[id].data.members) {
            var list = this.views[view].widgets[id].data.members.slice();
            for (var m = 0; m < list.length; m++) {
                if (list[m] !== id) {
                    this.delWidgetHelper(viewDiv, view, list[m], isAll, id);
                }
            }
        }

        this.destroyWidget(viewDiv, view, id);

        $('#' + id).remove();
        if (this.views[view].widgets[id] && this.views[view].widgets[id].grouped) {
            // find group
            var pos = -1;
            if (!groupId && viewDiv == view) {
                var widgets = this.views[view].widgets;
                for (var w in widgets) {
                    if (!widgets.hasOwnProperty(w)) continue;
                    var members = this.views[view].widgets[w].data.members;
                    if (members && ((pos = members.indexOf(id)) !== -1)) {
                        groupId = w;
                    }
                }
            }
            else {
                pos = this.views[view].widgets[groupId || viewDiv].data.members.indexOf(id);
            }

            if (pos !== -1) this.views[view].widgets[groupId || viewDiv].data.members.splice(pos, 1);
        }
        if (view) delete this.views[view].widgets[id];

        if (this.widgets[id]) delete this.widgets[id];

        var pos = this.activeWidgets.indexOf(id);
        if (pos !== -1) this.activeWidgets.splice(pos, 1);
    },
    delWidgets:             function (viewDiv, view, widgets, noSave) {
        if (typeof widgets !== 'object') widgets = null;

        if (!widgets) {
            // Store array, because it will be modified in delWidgetHelper
            widgets = JSON.parse(JSON.stringify(this.activeWidgets));
        }

        for (var j = 0; j < widgets.length; j++) {
            this.delWidgetHelper(viewDiv, view, widgets[j], true);
        }
        if (!noSave) this.save(viewDiv, view);

        this.inspectWidgets(viewDiv, view, []);
    },
    bindWidgetClick:        function (viewDiv, view, id) {
        var that = this;
        if (!this.views[view] || !this.views[view].widgets[id]) {
            console.warn('View:' + view + ', id: ' + id + ' not found');
            return;
        }
        var $wid = $('#' + id);

        if (viewDiv === view && this.views[view].widgets[id].grouped) return;

        if (id === viewDiv) return;

        if (!this.views[view].widgets[id].data.locked) {
            $wid.unbind('click dblclick').bind('click', function (e) {
                if (that.dragging) return;

                var widgetId = $(this).attr('id');
                // if shift or control pressed
                if (e.shiftKey || e.ctrlKey || e.metaKey) {
                    var pos = that.activeWidgets.indexOf(widgetId);

                    // Add to list
                    if (pos === -1) {
                        that.inspectWidgets(viewDiv, view, widgetId);
                    } else {
                        // Remove from list
                        that.inspectWidgets(viewDiv, view, null, widgetId);
                    }
                } else {
                    // Simple click on some widget
                    if (that.activeWidgets.length !== 1 || that.activeWidgets[0] !== widgetId) {
                        that.inspectWidgets(viewDiv, view, [widgetId]);
                    }
                }

                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            if (id[0] === 'g') {
                $wid.bind('dblclick', function (e) {
                    if (that.dragging) return;
                    var widgetId = $(this).attr('id');
                    if (widgetId[0] !== 'g') return;

                    that.changeView(widgetId, view, undefined, undefined, true, function (_viewDiv, _view) {
                        // deselect all
                        that.inspectWidgets(_viewDiv, _view, []);
                    });
                });
            }
        } else {
            $wid.addClass('vis-widget-edit-locked').removeClass('ui-selectee').unbind('click');
        }
    },
    addWidget:              function (viewDiv, view, options, isCopied) {
        // tpl, data, style, wid, view, noSave, noAnimate
        var isSelectWidget = (options.wid === undefined);
        var $view          =  $('#visview_' + viewDiv);
        var renderVisible  = options.data.renderVisible;

        if (renderVisible) delete options.data.renderVisible;

        if (isSelectWidget && !$view.length) {
            var that = this;
            this.renderView(viewDiv, view, false, function (_viewDiv, _view) {
                that.addWidget(_viewDiv, _view, options, isCopied);
            });
            return;
        }

        var widgetId;
        if (options.data.members) {
            widgetId = options.wid || this.nextGroup();
        } else {
            widgetId = options.wid || this.nextWidget();
        }
        var $tpl;
        $tpl = $('#' + options.tpl);

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

        this.views[view].widgets           = this.views[view].widgets || {};
        this.views[view].widgets[widgetId] = this.views[view].widgets[widgetId] || {};

        var findPos = !options.style;
        options.style = options.style || {};

        if (this.views[view].widgets[widgetId].data !== undefined) {
            options.data = $.extend(options.data, this.views[view].widgets[widgetId].data, true);
        }

        this.views[view].widgets[widgetId] = {
            tpl:       options.tpl,
            data:      options.data,
            style:     options.style,
            widgetSet: options.tpl === '_tplGroup' ? null : ($tpl ? $tpl.attr('data-vis-set') : undefined)
        };

        if (options.grouped || viewDiv !== view) this.views[view].widgets[widgetId].grouped = true;
        // if group edit
        if (viewDiv !== view) {
            this.views[view].widgets[viewDiv].data.members.push(widgetId);
        }

        if (renderVisible) this.views[view].widgets[widgetId].renderVisible = true;

        //if (options.style) $jWidget.css(options.style);

        if ($view.length) {
            /*var position = options.style ? options.style.position : '';
             // if widget has relative position => insert it into relative div
             if (this.editMode && (position === 'relative' || position === 'static' || position === 'sticky')) {
             if (this.views[options.view].settings && this.views[options.view].settings.sizex) {
             var $relativeView = $view.find('.vis-edit-relative');
             if (!$relativeView.length) {
             $view.append('<div class="vis-edit-relative" style="width: ' + this.views[view].settings.sizex + 'px; height: ' + this.views[view].settings.sizey + 'px"></div>');
             $view = $view.find('.vis-edit-relative');
             } else {
             $view = $relativeView;
             }
             }
             }

             var obj = {
             //ts:   this.states.attr(this.widgets[widgetId].data.oid + '.ts'),
             // ack:  this.states.attr(this.widgets[widgetId].data.oid + '.ack'),
             // lc:   this.states.attr(this.widgets[widgetId].data.oid + '.lc'),
             data: this.widgets[widgetId].data,
             view: options.view
             };
             if (this.states[this.widgets[widgetId].data.oid + '.val'] !== undefined) {
             obj.val = this.states.attr(this.widgets[widgetId].data.oid + '.val');
             }
             $view.append(can.view(options.tpl, obj));*/
            this.reRenderWidgetEdit(viewDiv, view, widgetId);

            if (viewDiv === view || viewDiv !== widgetId) {
                $('#' + widgetId).addClass('vis-widget-lock');
            }

            if (findPos) {
                var $widget = $('#' + widgetId);

                var pos = this.findFreePosition(view, widgetId, null, $widget.width(), $widget.height());
                $widget.css(pos);
                this.views[view].widgets[widgetId].style.top  = pos.top;
                this.views[view].widgets[widgetId].style.left = pos.left;
            }

            // if group edit
            if (view !== viewDiv) {
                // convert all coordinates and sizes into %
                var wRect = this.editConvertToPercent(viewDiv, view, widgetId, viewDiv);
                this.views[view].widgets[widgetId].style.top    = wRect.top;
                this.views[view].widgets[widgetId].style.left   = wRect.left;
                this.views[view].widgets[widgetId].style.width  = wRect.width;
                this.views[view].widgets[widgetId].style.height = wRect.height;
            }
        }
        if (isSelectWidget) {
            this.activeWidgets = [widgetId];
            if (!options.noAnimate) {
                this.actionHighlightWidget(widgetId);
            }
        }

        if (!isCopied) {
            // mark all groups as disabled
            options.data.g_fixed              = false;
            options.data.g_visibility         = false;
            options.data.g_css_font_text      = false;
            options.data.g_css_background     = false;
            options.data.g_css_shadow_padding = false;
            options.data.g_css_border         = false;
            options.data.g_gestures           = false;
            options.data.g_signals            = false;
            options.data.g_last_change        = false;
        }

        if (!options.noSave) this.save();

        this.bindWidgetClick(viewDiv, view, widgetId);

        return widgetId;
    },
    dupWidgets:             function (targetViewDiv, targetView, widgets, offsetX, offsetY, grouped) {
        // make a copy
        if (widgets) widgets = JSON.parse(JSON.stringify(widgets));

        if (typeof widgets === 'string') {
            try {
                widgets = JSON.parse(widgets);
            } catch (e) {
                console.error('Cannot parse clipboard');
                return;
            }
        }
        if (typeof offsetX === 'boolean') {
            grouped = offsetX;
            offsetX = undefined;
        }

        if (!widgets) {
            widgets = JSON.parse(JSON.stringify(this.activeWidgets));
        }

        var srcViewDiv;
        var srcView;
        var tpl;
        var data;
        var style;
        var newWidgets   = [];
        var firstOffsetX = null;
        var firstOffsetY = null;

        for (var i = 0; i < widgets.length; i++) {
            var objWidget;
            if (widgets[i].wid) continue;

            // if from clipboard
            if (widgets[i].widget) {
                objWidget       = widgets[i].widget;
                tpl             = objWidget.tpl;
                data            = objWidget.data;
                style           = objWidget.style;
                grouped         = objWidget.grouped && grouped;
                srcView         = widgets[i].view;
                srcViewDiv      = widgets[i].viewDiv;
            } else {
                srcViewDiv      = this.activeViewDiv;
                srcView         = this.activeView;
                // From active view
                tpl             = this.views[srcView].widgets[widgets[i]].tpl;
                data            = $.extend({}, this.views[srcView].widgets[widgets[i]].data);
                style           = $.extend({}, this.views[srcView].widgets[widgets[i]].style);
                grouped         = this.views[srcView].widgets[widgets[i]].grouped && grouped;
            }

            if (offsetX !== undefined && typeof offsetX !== 'boolean') {
                if (firstOffsetX === null) {
                    firstOffsetX = parseInt(style.left, 10);
                    firstOffsetY = parseInt(style.top, 10);

                    style.left = offsetX;
                    style.top  = offsetY;
                } else {
                    style.top  = parseInt(style.top, 10);
                    style.left = parseInt(style.left, 10);

                    style.top  = firstOffsetY - style.top  + offsetY;
                    style.left = firstOffsetX - style.left + offsetX;
                }
            }
            var obj = {
                tpl:      tpl,
                data:     data,
                style:    style,
                noSave:   true
            };
            if (srcViewDiv === targetViewDiv) {
                if (!grouped && offsetX === undefined) {
                    style.top  = parseInt(style.top,  10);
                    style.left = parseInt(style.left, 10);

                    style.top  += 10;
                    style.left += 10;
                }

                // Store new settings
                if (widgets[i].widget) {
                    // If after copy to clipboard, the copied widget was changed, so the new modified version will be pasted and not the original one.
                    // So use JSON.
                    widgets[i].widget = JSON.parse(JSON.stringify(objWidget));
                }
            } else {
                if (!$('#vis_container').find('#visview_' + targetViewDiv).length) {
                    this.renderView(targetViewDiv, targetView, true);
                }
                obj.wid     = this.nextWidget();
                obj.view    = targetView;
                obj.viewDiv = targetViewDiv;
            }
            if (grouped) obj.grouped = grouped;

            // if group
            if (obj.data.members) {
                var ws = [];
                for (var w = 0; w < obj.data.members.length; w++) {
                    var found = false;
                    for (var f = 0; f < widgets.length; f++) {
                        if (widgets[f].wid && widgets[f].wid === obj.data.members[w]) {
                            widgets[f].wid = false;
                            widgets[f].view = srcView;
                            widgets[f].viewDiv = srcViewDiv;
                            ws.push(widgets[f]);
                            found = true;
                            break;
                        }
                    }
                    if (!found && this.views[srcView].widgets[obj.data.members[w]]) {
                        ws.push({
                            view: srcView,
                            viewDiv: srcViewDiv,
                            widget: this.views[srcView].widgets[obj.data.members[w]]
                        });
                    }
                }

                obj.data.members = this.dupWidgets(targetViewDiv, targetView, ws, true);
                obj.wid = '';
            }
            newWidgets.push(this.addWidget(targetViewDiv, targetView, obj, true));
        }

        if (this.activeView === targetViewDiv && !grouped) {
            this.updateSelectWidget(targetViewDiv, targetView, newWidgets);
        }

        if (widgets[0] && !widgets[0].widget) {
            this.showHint(_('Widget(s) copied to view %s', targetViewDiv) + '.', 30000);
        }

        return newWidgets;
    },
    renameWidget:           function (viewDiv, view, oldId, newId) {
        var widgetData = this.views[view].widgets[oldId];
        var obj = {
            tpl:    widgetData.tpl,
            data:   $.extend(true, {}, widgetData.data),
            style:  widgetData.style,
            wid:    newId,
            noSave: true
        };
        if (widgetData.grouped){
            obj.grouped = true;
            // get viewDiv
            if (viewDiv == view) {
                var widgets = this.views[view].widgets;
                for (var w in widgets) {
                    if (!widgets.hasOwnProperty(w)) continue;
                    var members = this.views[view].widgets[w].data.members;
                    var pos;
                    if (members && ((pos = members.indexOf(oldId)) !== -1)) {
                        viewDiv = w;
                    }
                }
            }
        }

        this.addWidget(viewDiv, view, obj, true);

        if (viewDiv === this.activeView) this.updateSelectWidget(view, view, newId);
        delete this.views[view].widgets[oldId].data.members;
        this.delWidgetHelper(viewDiv, view, oldId, false);

        if (viewDiv === this.activeView) this.inspectWidgets(viewDiv, view, [newId]);
        this.save();
    },
    reRenderWidgetEdit:     function (viewDiv, view, wid) {
        this.reRenderWidget(viewDiv, view, wid);
        this.editApplyDragAndMove(viewDiv, view, wid);
    },
    editApplyDragAndMove:   function (viewDiv, view, wid) {
        var editGroup = (viewDiv !== view);

        if (this.activeWidgets.indexOf(wid) !== -1) {
            var $wid = $('#' + wid);

            // User interaction
            if (!$('#wid_all_lock_d').hasClass('ui-state-active') &&
                !this.widgets[wid].data._no_move &&
                (editGroup || !this.widgets[wid].grouped)
            ) {
                this.draggable(viewDiv, view, $wid);
            }
            if ($('#wid_all_lock_function').prop('checked')) {
                if (viewDiv === view || viewDiv !== wid) $wid.addClass('vis-widget-lock');
            }

            // If only one selected
            if (this.activeWidgets.length === 1 &&
                !this.widgets[wid].data._no_resize &&
                !this.widgets[wid].grouped) {
                this.resizable(viewDiv, view, $wid);
            }
        }
    },
    getObjDesc:             function (id) {
        if (this.objects[id] && this.objects[id].common && this.objects[id].common.name) {
            return this.objects[id].common.name || id;
        }
        return id;
    },
    // find this wid in all views,
    // delete where it is no more exist,
    // create where it should exist and
    // sync data
    syncWidgets:            function (widgets, views) {
        for (var i = 0; i < widgets.length; i++) {
            // find view of this widget
            var view = this.getViewOfWidget(widgets[i]);

            if (views === undefined) {
                views = this.getViewsOfWidget(widgets[i]);
            }

            if (view) {
                //if widget is a group first sync widgets within this group
                if (this.views[view].widgets[widgets[i]].data.members && this.views[view].widgets[widgets[i]].data.members.length) {
                    this.syncWidgets(this.views[view].widgets[widgets[i]].data.members.slice(), views);
                    if (this.activeView == this.activeViewDiv) this.reRenderWidgetEdit(view, view, widgets[i]);
                }

                if (views === null) views = [];

                var isFound = false;
                for (var l = 0; l < views.length; l++) {
                    if (views[l] === view) {
                        isFound = true;
                        break;
                    }
                }

                if (!isFound) views[views.length] = view;

                var wids = widgets[i].split('_', 2);
                var wid = wids[0];

                // First sync views
                for (var v_ in this.views) {
                    if (!this.views.hasOwnProperty(v_)) continue;
                    if (v_ === '___settings') continue;
                    isFound = false;
                    if (v_ === view) {
                        continue;
                    }

                    for (var k = 0; k < views.length; k++) {
                        if (views[k] === v_) {
                            isFound = true;
                            break;
                        }
                    }

                    if (this.views[v_].widgets[wid + '_' + v_] !== undefined) {
                        if (isFound) {
                            //do not delete members
                            delete this.views[v_].widgets[wid + '_' + v_].data.members;
                        }
                        this.delWidgetHelper(v_, v_, wid + '_' + v_, false);
                    }

                    if (isFound) {
                        var data = null;
                        if (this.views[view].widgets[widgets[i]].data.members) {
                            data = $.extend(true, {}, this.views[view].widgets[widgets[i]].data);
                            for (var j = 0; j < data.members.length; j++) {
                                data.members[j] = data.members[j].split('_', 2)[0] + '_' + v_;
                            }
                        }
                        // Create
                        this.addWidget(this.views[v_] ? v_: this.getViewOfWidget(v_), v_, {
                            tpl:    this.views[view].widgets[widgets[i]].tpl,
                            data:   data || this.views[view].widgets[widgets[i]].data,
                            style:  this.views[view].widgets[widgets[i]].style,
                            wid:    wid + '_' + v_,
                            view:   v_,
                            noSave: true,
                            grouped:this.views[view].widgets[widgets[i]].grouped || false
                        }, true);
                    }
                }


                if (views.length < 2 && (widgets[i].indexOf('_') !== -1)) {
                    // rename this widget from "wid_view" to "wid"
                    var _wids = widgets[i].split('_', 2);
                    this.renameWidget(view, view, widgets[i], _wids[0]);
                } else if (views.length > 1 && (widgets[i].indexOf('_') === -1)) {
                    this.renameWidget(view, view, widgets[i], widgets[i] + '_' + view);
                }
            }
        }
    },
    // adds extracted attributes to array
    getWidgetName:          function (view, widget) {
        if (view && !widget) {
            widget = view;
            view = null;
        }
        if (!view || !this.views[view]) view = this.getViewOfWidget(widget);

        var widgetData = this.views[view].widgets[widget];
        var name = (widgetData && widgetData.data ? widgetData.data.name : '');
        name = name ? (name + '[' + widget + ']') : widget;
        if (widgetData) {
            if (widget[0] === 'g') {
                name += ' ('  + _('Group') + ')';
            } else {
                name += ' ('  + widgetData.widgetSet + ' - ' + $('#' + widgetData.tpl).attr('data-vis-name') + ')';
            }
        }
        return name;
    },
    showWidgetHelper:       function (viewDiv, view, wid, isShow) {
        if (typeof view === 'boolean' || !wid) {
            wid     = viewDiv;
            isShow  = view;
            view    = this.activeView;
            viewDiv = this.activeViewDiv;
        }
        var $widget = $('#' + wid);

        if ($widget.attr('data-vis-hide-helper') === 'true') isShow = false;

        // noinspection JSJQueryEfficiency
        var $helper = $('#widget_helper_' + wid);
        if (isShow) {
            if ($widget && !$widget.length) {
                console.log('Cannot find in DOM ' + wid);
                return;
            }
            // disable transform while editing
            if ($widget.css('transform')) {
                $widget.css('transform', '').attr('data-tmodified', true);
            }

            var pos = this.editWidgetsRect(viewDiv, view, wid);

            if (!$helper.length) {
                $('#visview_' + viewDiv).append('<div id="widget_helper_' + wid + '" class="widget-helper"><div class="widget_inner_helper"></div></div>');
                $helper = $('#widget_helper_' + wid);
            }

            $helper.css({
                    left:   parseInt(pos.left)   - 2 + 'px',
                    top:    parseInt(pos.top)    - 2 + 'px',
                    height: parseInt(pos.height) + 3 + 'px',
                    width:  parseInt(pos.width)  + 3 + 'px'
                }
            ).show();
        } else {
            $helper.remove();
        }
        return $widget;
    },
    installSelectable:      function (viewDiv, view, isDestroy) {
        var that = this;

        if (this.selectable) {
            if (isDestroy) $('.vis-view.ui-selectable').selectable('destroy');

            $('#visview_' + viewDiv).selectable({
                filter:    'div.vis-widget:not(.vis-widget-edit-locked)',
                tolerance: 'fit',
                cancel:    'div.vis-widget:not(.vis-widget-edit-locked)',
                stop: function (e, ui) {
                    var $selected = $('.ui-selected');

                    if (!$selected.length) {
                        that.inspectWidgets(viewDiv, view, []);
                    } else {
                        var newWidgets = [];
                        $selected.each(function () {
                            var id = $(this).attr('id');
                            if (id && !$(this).hasClass('vis-widget-edit-locked') &&
                                that.views[view].widgets[id] &&
                                (viewDiv !== view || !that.views[view].widgets[id].grouped)) {
                                if (viewDiv !== view && id === viewDiv) return;
                                newWidgets.push(id);
                            }
                        });
                        that.inspectWidgets(viewDiv, view, newWidgets);
                    }
                    //$('#allwidgets_helper').hide();
                },
                selecting: function (e, ui) {
                    if (ui.selecting.id &&
                        that.activeWidgets.indexOf(ui.selecting.id) === -1 &&
                        that.views[view].widgets[ui.selecting.id] &&
                        (viewDiv !== view || !that.views[view].widgets[ui.selecting.id].grouped) && // group edit
                        !that.views[view].widgets[ui.selecting.id].data.locked) {

                        // if edit group and it is group itself
                        if (viewDiv !== view && ui.selecting.id === viewDiv) return;

                        that.activeWidgets.push(ui.selecting.id);
                        that.showWidgetHelper(viewDiv, view, ui.selecting.id, true);
                    }
                },
                unselecting: function (e, ui) {
                    var pos = that.activeWidgets.indexOf(ui.unselecting.id);
                    if (pos !== -1) {
                        that.activeWidgets.splice(pos, 1);
                        that.showWidgetHelper(viewDiv, view, ui.unselecting.id, false);
                    }
                    /*if ($('#widget_helper_' + ui.unselecting.id).html()) {
                     $('#widget_helper_' + ui.unselecting.id).remove();
                     that.activeWidgets.splice(that.activeWidgets.indexOf(ui.unselecting.id), 1);
                     }*/
                }
            });

            $('.vis-widget-edit-locked').removeClass('ui-selectee');
        }
    },
    // Init all edit fields for one view
    changeViewEdit:         function (viewDiv, view, noChange, callback) {
        //always save changes when changing views to ensure views are synced
        if (this._saveTimer) {
            clearTimeout(this._saveTimer);
            this._saveTimer = null;
        }
        this._saveToServer(this.activeViewDiv, this.activeView);
        $('#saving_progress').hide();

        var that = this;
        this.installSelectable(viewDiv, view, true);

        // remove all binds from all views
        $('.vis-widget').unbind('click').unbind('dblclick');

        var $view = $('#visview_' + viewDiv);
        if (viewDiv !== view) {
            $view
                .removeClass('.vis-widget-lock')
                    .find('#' + viewDiv)
                    .addClass('vis-edit-group-widget')
                        .find('> .vis-widget').each(function () {
                            that.bindWidgetClick(viewDiv, view, $(this).attr('id'));
                        });
        } else {
            $view.find('> .vis-widget').each(function () {
                that.bindWidgetClick(viewDiv, view, $(this).attr('id'));
            });
            // install on relative widgets too
            $view.find('.vis-edit-relative').find('> .vis-widget').each(function () {
                that.bindWidgetClick(viewDiv, view, $(this).attr('id'));
            });
        }

        if (!noChange) {
            this.undoHistory = [$.extend(true, {}, this.views[view])];
            $('#button_undo').addClass('ui-state-disabled').removeClass('ui-state-hover');
            this.inspectWidgets(viewDiv, view, viewDiv !== view || !this.views[view] ? [] : (this.views[view].activeWidgets || []));
        }

        // Disable rename if enabled
        $('#rib_view_copy_cancel').trigger('click');
        $('#rib_view_rename_cancel').trigger('click');
        $('#rib_view_add_cancel').trigger('click');

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
                    var $view = $('#visview_' + viewDiv);
                    if (that.views[view].settings.style.background_class) {
                        $view.removeClass(that.views[view].settings.style.background_class);
                    }
                    that.views[view].settings.style.background_class = newStyle;
                    if (newStyle) $('#inspect_view_css_background').val('').trigger('change');

                    $view.addClass(that.views[view].settings.style.background_class);
                    that.save();
                }
            });
        }

        var viewGroups;
        if (viewDiv === view) {
            $('#ribbon_view').find('.ribbon_tab_content').show();
            $('#view_inspector').show();
            var $screenSize  = $('#screen_size');
            var $screenSizeX = $('#screen_size_x');
            var $screenSizeY = $('#screen_size_y');
            // View (Resolution) settings
            if (this.views[view] && this.views[view].settings) {
                // Try to find this resolution in the list
                var res = this.views[view].settings.sizex + 'x' + this.views[view].settings.sizey;
                $screenSize.find('option').each(function () {
                    if ($(this).attr('value') === res) {
                        $(this).attr('selected', true);
                        res = null;
                        return false;
                    }
                });
                if (!res) {
                    $screenSizeX.prop('disabled', true);
                    $screenSizeY.prop('disabled', true);
                } else if (res === 'x') {
                    $screenSizeX.prop('disabled', true);
                    $screenSizeY.prop('disabled', true);
                    $screenSize.val('');
                } else {
                    $screenSize.val('user');
                }

                $screenSize.selectmenu('refresh').selectmenu('enable');

                $screenSizeX.val(this.views[view].settings.sizex || '').trigger('change').prop('disabled', false);
                $screenSizeY.val(this.views[view].settings.sizey || '').trigger('change').prop('disabled', false);
                $('.rib_tool_resolution_toggle').button((res === 'x') ? 'disable' : 'enable');

                $('#grid_size')
                    .val(this.views[view].settings.gridSize || '')
                    .trigger('change')
                    .prop('disabled', this.views[view].settings.snapType !== 2);

                $('#snap_type').val(this.views[view].settings.snapType || 0).selectmenu('refresh');

                if (this.views[view].settings.sizex) {
                    $('.vis-screen-default').prop('checked', this.views[view].settings.useAsDefault);
                } else {
                    $('.vis-screen-default').prop('checked', false).prop('disabled', true);
                }
                $('.vis-screen-render-always').prop('checked', this.views[view].settings.alwaysRender);

                this.editSetGrid(viewDiv, view);

                // show userGroups
                viewGroups = this.views[view].settings.group || [];
                $('#inspect_view_group_action').val(this.views[view].settings.group_action);
            } else {
                $screenSize.val('').selectmenu('refresh').selectmenu('enable');
                $screenSizeX.val(this.views[view].settings.sizex || '').trigger('change').prop('disabled', false);
                $screenSizeY.val(this.views[view].settings.sizey || '').trigger('change').prop('disabled', false);
                viewGroups = [];
            }
        } else {
            $('#ribbon_view').find('.ribbon_tab_content').hide();
            $('#view_inspector').hide();
        }

        // fill userGroups
        var $inspectGroups = $('#inspect_view_group');
        $inspectGroups.html('');
        if (viewDiv === view) {
            var userGroups = this.getUserGroups();
            for (var g in userGroups) {
                if (!userGroups.hasOwnProperty(g)) continue;
                var val = g.substring('system.group.'.length);
                $inspectGroups.append('<option value="' + val + '" ' + ((viewGroups.indexOf(val) !== -1) ? 'selected' : '') + '>' + (userGroups[g] && userGroups[g].common ? userGroups[g].common.name || val : val) + '</option>');
            }
            $inspectGroups.multiselect('refresh');
        } else {
            $inspectGroups.multiselect('disable');
        }
        $inspectGroups.next().css('width', 'calc(100% - 5px)');

        this.updateSelectWidget(viewDiv, view);

        if (viewDiv === view) {
            // Show current view
            if (this.$selectView.val() !== viewDiv) {
                this.$selectView.val(viewDiv);
                this.$selectView.selectmenu('refresh');
            }
            this.$copyWidgetSelectView.val(view);
            this.$copyWidgetSelectView.selectmenu('refresh');

            // Show tab
            $('.view-select-tab').removeClass('ui-tabs-active ui-state-active');
            $('#view_tab_' + view).addClass('ui-tabs-active ui-state-active');

            if (that.views[view] && that.views[view].settings) {
                $('#inspect_view_css_only_background').prop('checked', that.views[view].settings.useBackground);
            }
            that.editShowHideViewBackground(view, true);

            // View CSS Inspector
            $('.vis-inspect-view-css').each(function () {
                var $this = $(this);
                var attr = $this.attr('id').slice(17);

                var css;
                if (that.views[view] && that.views[view].settings && that.views[view].settings.style) {
                    css = that.views[view].settings.style[attr];
                    $this.val(css);
                } else {
                    css = $view.css(attr);
                }
                $this.val(css || '');
                if (attr.match(/color$/)) {
                    $this.css('background-color', css || '');
                    that._editSetFontColor($this.attr('id'));
                }
            });

            var $themeSelect = $('#inspect_view_theme');
            if (this.views[view] && this.views[view].settings) {
                $('.vis-inspect-view').each(function () {
                    var $this = $(this);
                    var attr = $this.attr('id').slice(13);
                    $('#' + $this.attr('id')).val(that.views[view].settings[attr]);
                });

                this.views[view].settings.theme = this.views[view].settings.theme || 'redmond';

                $themeSelect.val(this.views[view].settings.theme);
            }
            $themeSelect.selectmenu('refresh');
        } else {
            this.editResizeGroup(viewDiv, view);
        }
        if (typeof callback === 'function') callback(viewDiv, view);
    },
    destroyGroupEdit:       function (viewDiv, view) {
        // destroy group view and view of group
        this.views[view].activeWidgets = [viewDiv];
        this.activeWidgets = [viewDiv];
        // change size of group
        //var rect = this.editWidgetsRect(viewDiv, view, viewDiv);
        this.destroyView(viewDiv, view);
        this.destroyView(view,    view);

        // group has percent as position
        //this.editApplySize(viewDiv, view, viewDiv, rect.width, rect.height);
    },
    editApplyPosition:      function (viewDiv, view, wid, top, left) {
        var oldT = this.views[view].widgets[wid].style.top;
        var oldL = this.views[view].widgets[wid].style.left;

        var posT = oldT.toString().indexOf('%') !== -1;
        var posL = oldL.toString().indexOf('%') !== -1;
        if (posT || posL) {
            var wRect = this.editConvertToPercent(viewDiv, view, wid, viewDiv !== view ? viewDiv : null);
            if (posL && left !== null) left = wRect.left;
            if (posT && top  !== null) top  = wRect.top;
        }

        if (left !== null) {
            if (!posL) {
                if (typeof left === 'string' && left.indexOf('px') === -1) {
                    left += 'px';
                } else {
                    left = Math.round(left) + 'px';
                }
            }
            this.views[view].widgets[wid].style.left = left;
        }
        if (top  !== null) {
            if (!posT) {
                if (typeof top === 'string' && top.indexOf('px') === -1) {
                    top += 'px';
                } else {
                    top = Math.round(top) + 'px';
                }
            }

            this.views[view].widgets[wid].style.top = top;
        }
    },
    editApplySize:          function (viewDiv, view, wid, width, height) {
        var oldW = this.views[view].widgets[wid].style.width;
        var oldH = this.views[view].widgets[wid].style.height;
        var posH;
        var posW;

        // Convert to percent if required
        if (oldW !== undefined && oldH !== undefined) {
            posW = oldW.toString().indexOf('%') !== -1;
            posH = oldH.toString().indexOf('%') !== -1;
            if (posW || posH) {
                var wRect = this.editConvertToPercent(viewDiv, view, wid, viewDiv !== view ? viewDiv : null);
                if (posH && height !== null) height = wRect.height;
                if (posW && width  !== null) width  = wRect.width;
            }
        } else {
            posH = false;
            posW = false;
        }
        if (width !== null) {
            if (!posW && width.toString().indexOf('px')  === -1) width  += 'px';
            this.views[view].widgets[wid].style.width  = width;
        }
        if (height !== null) {
            if (!posH && height.toString().indexOf('px') === -1) height += 'px';
            this.views[view].widgets[wid].style.height = height;
        }
    },
    dragging:               false,
    draggable:              function (viewDiv, view, obj) {
        var origX, origY;
        var that = this;
        var draggableOptions;
        viewDiv = viewDiv || this.activeView;
        view = view || viewDiv;

        draggableOptions = {
            cancel: false,
            start:  function (event, ui) {
                $('#context_menu').hide();
                $('#context_menu_template').hide();

                that.gridWidth = parseInt(that.views[view].settings.gridSize, 10);
                if (that.gridWidth < 1 || isNaN(that.gridWidth)) that.gridWidth = 10;
                that.views[view].settings.snapType = parseInt(that.views[view].settings.snapType, 10);

                origX = ui.position.left;
                origY = ui.position.top;
                that.dragging = true;
            },
            stop:   function (event, ui) {
                var grid;
                if (that.views[view].settings.snapType === 2) {
                    grid = parseInt(that.views[view].settings.gridSize, 10);
                } else {
                    grid = 0;
                }

                for (var i = 0; i < that.activeWidgets.length; i++) {
                    var wid = that.activeWidgets[i];
                    var $wid = $('#' + that.activeWidgets[i]);
                    var pos = {
                        left: parseInt($wid.css('left'), 10),
                        top:  parseInt($wid.css('top'),  10)
                    };
                    // if grid enabled
                    if (grid) {
                        var xDiff = pos.left % grid;
                        var yDiff = pos.top  % grid;
                        if (xDiff) {
                            if (xDiff < grid / 2) {
                                pos.left -= xDiff;
                            }  else {
                                pos.left += grid - xDiff;
                            }
                            $wid.css('left', pos.left);
                        }

                        if (yDiff) {
                            if (yDiff < grid / 2) {
                                pos.top -= yDiff;
                            } else {
                                pos.top += grid - yDiff;
                            }
                            $wid.css('top', pos.top);
                        }
                    }
                    if (!that.views[view].widgets[wid]) continue;
                    if (!that.views[view].widgets[wid].style) that.views[view].widgets[wid].style = {};

                    if ($wid[0]._customHandlers && $wid[0]._customHandlers.onMoveEnd) {
                        $wid[0]._customHandlers.onMoveEnd($wid[0], wid);
                    }
                    $('#widget_helper_' + wid).css({
                        left: pos.left - 2 + 'px',
                        top:  pos.top  - 2 + 'px'
                    });

                    that.editApplyPosition(viewDiv, view, wid, pos.top, pos.left);

                    $('#vis_container').find('.vis-leading-line').remove();
                }
                $('#inspect_css_top').val(that.findCommonValue(view, that.activeWidgets,  'top', true));
                $('#inspect_css_left').val(that.findCommonValue(view, that.activeWidgets, 'left', true));
                that.save();
                setTimeout(function () {
                    that.dragging = false;
                }, 20);

            },
            drag:   function (event, ui) {
                var grid;
                if (that.views[view].settings.snapType === 2) {
                    grid = parseInt(that.views[view].settings.gridSize, 10);
                } else {
                    grid = 0;
                }

                var elementPosition = ui.offset;
                var parentPosition = ui.helper.parent().offset();
                if (!parentPosition) return;
                var position = {left: elementPosition.left - parentPosition.left, top: elementPosition.top - parentPosition.top};

                var moveX = position.left - origX;
                var moveY = position.top  - origY;

                var xDiff;
                var yDiff;
                // if grid enabled
                if (grid) {
                    xDiff = position.left % grid;
                    yDiff = position.top  % grid;
                    if (xDiff) {
                        if (xDiff < grid / 2) {
                            position.left += xDiff;
                        } else {
                            position.left += grid - xDiff;
                        }
                    }

                    if (yDiff) {
                        if (yDiff < grid / 2) {
                            position.top += yDiff;
                        } else {
                            position.top += grid - yDiff;
                        }
                    }
                }

                origX = position.left;
                origY = position.top;

                for (var i = 0; i < that.activeWidgets.length; i++) {
                    if (!that.views[view].widgets[that.activeWidgets[i]])  {
                        console.error('Something is wrong! "' + that.activeWidgets[i] + '" is not in "' + view + '"');
                        continue;
                    }
                    var _position = that.views[view].widgets[that.activeWidgets[i]].style['position'];
                    if (_position === 'relative' || _position === 'static' || _position === 'sticky') continue;
                    var mWidget  = document.getElementById(that.activeWidgets[i]);
                    var $mWidget = $(mWidget);
                    var pos = {
                        left: parseInt($mWidget.css('left'), 10),
                        top:  parseInt($mWidget.css('top'),  10)
                    };
                    var x = pos.left + moveX;
                    var y = pos.top  + moveY;

                    // if grid enabled
                    if (grid) {
                        xDiff = x % grid;
                        yDiff = y % grid;
                        if (xDiff) {
                            if (xDiff < grid / 2) {
                                x -= xDiff;
                            } else {
                                x += grid - xDiff;
                            }
                        }

                        if (yDiff) {
                            if (yDiff < grid / 2) {
                                y -= yDiff;
                            } else {
                                y += grid - yDiff;
                            }
                        }
                    }

                    $('#widget_helper_' + that.activeWidgets[i]).css({left: x - 2, top: y - 2});

                    if (grid || ui.helper.attr('id') !== that.activeWidgets[i]) $mWidget.css({left: x, top: y});

                    if (mWidget._customHandlers && mWidget._customHandlers.onMove) {
                        mWidget._customHandlers.onMove(mWidget, that.activeWidgets[i]);
                    }
                }
                that.editShowLeadingLines(viewDiv, view);
            }
        };
        if (this.views[view].settings.snapType === 1) {
            draggableOptions.snap = '#vis_container div.vis-widget';
        } else
        if (this.views[view].settings.snapType === 2) {
            this.gridWidth = parseInt(this.views[view].settings.gridSize, 10);
            if (this.gridWidth < 1 || isNaN(this.gridWidth)) this.gridWidth = 10;

            draggableOptions.grid = [this.gridWidth, this.gridWidth];
        }

        obj.each(function () {
            var $this = $(this);
            var wid = $this.attr('id');
            if (that.views[view].widgets[wid].style['position'] === 'relative') return;

            if ($this.attr('data-vis-draggable')) draggableOptions = JSON.parse($this.attr('data-vis-draggable'));
            if (!draggableOptions) draggableOptions = {};

            if (draggableOptions.disabled) return;

            $this.draggable(draggableOptions);
        });
    },
    editResizeGroup:        function (viewDiv, view) {
        var that = this;
        var $group = $('#' + viewDiv).addClass('vis-resize-group');

        var stop   = function (event, ui) {
            var w = ui.element.width();
            var h = ui.element.height();
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

            if (!that.views[view].widgets[viewDiv]) return;

            if (!that.views[view].widgets[viewDiv].style) that.views[view].widgets[viewDiv].style = {};

            w = parseInt(ui.element.innerWidth(),  10);
            h = parseInt(ui.element.innerHeight(), 10);
            that.views[view].widgets[viewDiv].style.width  = w;
            that.views[view].widgets[viewDiv].style.height = h;
            that.save();
        };

        $group.resizable({stop: stop});
    },
    resizable:              function (viewDiv, view, obj) {
        var that = this;

        if (!view) {
            obj     = viewDiv;
            view    = this.activeView;
            viewDiv = this.activeViewDiv;
        }
        if (!obj) {
            console.warn('obj is null');
            return;
        }

        this.gridWidth = parseInt(this.views[view].settings.gridSize, 10);
        if (this.gridWidth < 1 || isNaN(this.gridWidth)) this.gridWidth = 10;

        var stop   = function (event, ui) {
            var widget = ui.helper.attr('id');
            if (!that.views[view].widgets[widget]) return;

            if (!that.views[view].widgets[widget].style) that.views[view].widgets[widget].style = {};

            var elementPosition = ui.element.offset();
            var parentPosition = ui.element.parent().offset();
            var position = {left: elementPosition.left - parentPosition.left, top: elementPosition.top - parentPosition.top};

            position.top  = parseInt(position.top, 10);
            position.left = parseInt(position.left, 10);
            var w = parseInt(ui.element.innerWidth(),  10);
            var h = parseInt(ui.element.innerHeight(), 10);

            $('.widget-helper').css({
                top:    position.top   - 2,
                left:   position.left  - 2,
                width:  ui.size.width  + 3,
                height: ui.size.height + 3
            });

            that.editApplySize(viewDiv, view, widget, w, h);
            that.editApplyPosition(viewDiv, view, widget, position.top, position.left);

            if ($('#' + that.views[view].widgets[widget].tpl).attr('data-vis-update-style')) {
                that.reRenderWidgetEdit(viewDiv, view, widget);
            }
            $('#inspect_css_width').val(that.views[view].widgets[widget].style.width);
            $('#inspect_css_height').val(that.views[view].widgets[widget].style.height);
            $('#inspect_css_top').val(that.views[view].widgets[widget].style.top);
            $('#inspect_css_left').val(that.views[view].widgets[widget].style.left);

            that.save();
            $('#vis_container').find('.vis-leading-line').remove();
        };
        var resize = function (event, ui) {
            var grid = parseInt(that.views[view].settings.gridSize, 10);

            var elementPosition = ui.element.offset();
            var parentPosition = ui.element.parent().offset();
            var position = {left: elementPosition.left - parentPosition.left, top: elementPosition.top - parentPosition.top};

            // if grid enabled
            if (that.views[view].settings.snapType === 2 && grid) {
                var oldSize = ui.oldSize || ui.originalSize;

                var pos   = position;
                // Check if size or position was changed
                /*if (position.top !== oldSize.top || position.left !== oldSize.left) {
                    var lDiff = pos.left % grid;
                    var tDiff = pos.top  % grid;

                    if (lDiff && oldSize.left  !== position.left) {
                        if (lDiff < grid / 2) {
                            ui.element.css({left: position.left - lDiff, width: ui.size.width + lDiff});
                        } else {
                            ui.element.css({left: position.left + grid - lDiff, width: ui.size.width + grid - lDiff});
                        }
                    }
                    if (tDiff && oldSize.top  !== position.top) {
                        if (lDiff < grid / 2) {
                            ui.element.css('top', position.top - tDiff);
                        } else {
                            ui.element.css('top', position.top + grid - tDiff);
                        }
                    }
                } else */{
                    // snap size to grid
                    var wDiff = (ui.size.width  + pos.left) % grid;
                    var hDiff = (ui.size.height + pos.top)  % grid;

                    if (wDiff && oldSize.width  !== oldSize.width) {
                        if (wDiff < grid / 2) {
                            ui.element.width(oldSize.width - wDiff);
                        } else {
                            ui.element.width(oldSize.width + grid - wDiff);
                        }
                    }

                    if (hDiff && oldSize.height !== oldSize.height) {
                        if (hDiff < grid / 2) {
                            ui.element.height(oldSize.height - hDiff);
                        } else {
                            ui.element.height(oldSize.height + grid - hDiff);
                        }
                    }
                }

            }
            $('.widget-helper').css({
                top:    position.top   - 2,
                left:   position.left  - 2,
                width:  ui.size.width  + 3,
                height: ui.size.height + 3
            });
            ui.oldSize = {width: ui.size.width, height:  ui.size.height, top: position.top, left: position.left};
            that.editShowLeadingLines(viewDiv, view);
        };
        obj.each(function () {
            var $this = $(this);
            var wid = $this.attr('id');
            var position = that.views[view].widgets[wid].style['position'];
            var resizableOptions;
            if (obj.attr('data-vis-resizable')) resizableOptions = JSON.parse(obj.attr('data-vis-resizable'));

            if (!resizableOptions) resizableOptions = {};
            if (resizableOptions.disabled !== true) resizableOptions.disabled = false;
            if (resizableOptions.disabled) return;

            // Why resizable brings the flag position: relative within?
            $this.css({position: position || 'absolute'});

            resizableOptions.stop   = stop;
            resizableOptions.resize = resize;
            if ((position !== 'relative' && position !== 'static' && position !== 'sticky')) {
                resizableOptions.handles = 'n, e, s, w, nw, ne, sw, se';
            }
            $this.resizable(resizableOptions);
        });
    },
    droppable:              function (viewDiv, view) {
        var $view = $('#visview_' + viewDiv);
        var that = this;

        $view.droppable({
            accept: '.wid-prev',
            drop: function (event, ui) {
                var $container = $('#vis_container');
                var viewPos = $container.position();
                var addPos = {
                    left: ui.position.left - $('#toolbox').width() + $container.scrollLeft() + 5,
                    top:  ui.position.top  - viewPos.top           + $container.scrollTop()  + 8
                };

                addPos.left = addPos.left.toFixed(0) + 'px';
                addPos.top  = addPos.top.toFixed(0)  + 'px';

                var widgetId;
                var template = $(ui.draggable).data('template');

                if (!template) {
                    var tpl = $(ui.draggable).data('tpl');
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
                        if (attrs.indexOf('oid') !== -1) data.oid = 'nothing_selected';
                    }

                    if (renderVisible) data.renderVisible = true;

                    //tpl, data, style, wid, view, noSave, noAnimate
                    widgetId = that.addWidget(viewDiv, view, {
                        tpl:        tpl,
                        data:       data,
                        style:      addPos,
                        noAnimate:  true
                    }, false);
                } else {
                    if (that.editTemplatesShowWarning) {
                        that.editTemplatesShowWarning();
                    }
                    widgetId = that.dupWidgets(viewDiv, view, that.views.___settings.templates[template].widgets, addPos.left, addPos.top);
                }

                if (viewDiv === that.activeView) {
                    that.updateSelectWidget(viewDiv, view, widgetId);
                }

                setTimeout(function () {
                    that.inspectWidgets(viewDiv, view, [widgetId]);
                }, 50);
            }
        });

    },
    // Find free place for new widget
    findFreePosition:       function (view, id, field, widgetWidth, widgetHeight) {
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
            if (w === id || !this.views[view].widgets[w].tpl) continue;

            if (this.views[view].widgets[w].tpl.indexOf('Image') === -1 &&
                this.views[view].widgets[w].tpl.indexOf('image') === -1) {
                var $jW = $('#' + w);
                if ($jW.length) {
                    var s    = $jW.position();
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
    checkPosition:          function (positions, x, y, widgetWidth, widgetHeight) {
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
    actionHighlightWidget:  function (viewDiv, view, id) {
        if (id === 'none') return;

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

        //noinspection JSJQueryEfficiency
        var $action1 = $('#' + id + '__action1');
        var text = '';
        if (!$action1.length) {
            text = '<div id="' + id + '__action1" style="z-index:2000; top:' + (s.top - 3.5) + 'px; left:' + (s.left - 3.5) + 'px; width: ' + s.width + 'px; height: ' + s.height + 'px; position: absolute"></div>';
            $('#visview_' + viewDiv).append(text);
            //noinspection JSJQueryEfficiency
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

        //noinspection JSJQueryEfficiency
        var $action2 = $('#' + id + '__action2');
        if (!$action2.length) {
            text = text.replace('action1', 'action2');
            $('#visview_' + viewDiv).append(text);
            //noinspection JSJQueryEfficiency
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
    updateFilter:           function (view) {
        if (view && this.views && this.views[view]) {
            var widgets = this.views[view].widgets;
            this.views[view].filterList = [];

            for (var widget in widgets) {
                if (widgets.hasOwnProperty(widget) &&
                    widgets[widget] &&
                    widgets[widget].data &&
                    widgets[widget].data.filterkey) {
                    var isFound = false;
                    for (var z = 0; z < this.views[view].filterList.length; z++) {
                        if (this.views[this.activeView].filterList[z] === widgets[widget].data.filterkey) {
                            isFound = true;
                            break;
                        }
                    }
                    if (!isFound) {
                        this.views[view].filterList[this.views[view].filterList.length] = widgets[widget].data.filterkey;
                    }
                }
            }
            return this.views[view].filterList;
        } else {
            return [];
        }
    },
    getWidgetIds:           function (view, tpl) {
        if (view && this.views && this.views[view]) {
            var widgets = this.views[view].widgets;
            var list = [];
            for (var widget in widgets) {
                if (!widgets.hasOwnProperty(widget)) continue;
                if (widgets[widget] && widgets[widget].data) {
                    if (tpl === undefined || tpl === null || tpl === widgets[widget].tpl) {
                        list.push(widget);
                    }
                }
            }
            return list;
        } else {
            return [];
        }
    },
    initStealHandlers:      function () {
        var that = this;
        $('.vis-steal-css').each(function () {
            $(this).button({
                icons: {
                    primary: 'ui-icon-star'
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
    stealCssModeStop:       function (viewDiv, view) {
        this.isStealCss = false;
        $('#stealmode_content').remove();

        if (this.selectable) $('#visview_' + viewDiv).selectable('enable');

        $('.vis-steal-css').removeAttr('checked').button('refresh');
        $('#vis_container').removeClass('vis-steal-cursor');

    },
    stealCssMode:           function (viewDiv, view) {
        var that = this;
        if (this.selectable) $('#visview_' + viewDiv).selectable('disable');

        this.isStealCss = true;

        //noinspection JSJQueryEfficiency
        if (!$('#stealmode_content').length) {
            $('body').append('<div id="stealmode_content" style="display: none" class="vis-stealmode">CSS steal mode</div>');
            $('#stealmode_content').fadeIn('fast')
                .click(function () {
                    $(this).fadeOut('slow');
                });
        }

        $('.vis-widget').one('click', function (e) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();

            that.stealCss(e, viewDiv, view);
        });
        $('#vis_container').addClass('vis-steal-cursor');
    },
    stealCss:               function (e, viewDiv, view) {
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
                        that.views[view].widgets[that.activeWidgets[i]].style[cssAttribute] = val;
                        that.showWidgetHelper(viewDiv, view, that.activeWidgets[i], true);
                    }
                }
            });

            this.save(function () {
                that.stealCssModeStop(viewDiv, view);
                that.inspectWidgets(viewDiv, view);
            });
        }
    },
    combineCssShorthand:    function (that, attr) {
        var css;
        var parts = attr.split('-');
        var baseAttr = parts[0];
        var cssTop;
        var cssRight;
        var cssBottom;
        var cssLeft;

        if (attr === 'border-radius') {
            // TODO second attribute
            cssTop    = that.css(attr.replace(new RegExp(baseAttr), baseAttr + '-top-left'));
            cssRight  = that.css(attr.replace(new RegExp(baseAttr), baseAttr + '-top-right'));
            cssBottom = that.css(attr.replace(new RegExp(baseAttr), baseAttr + '-bottom-right'));
            cssLeft   = that.css(attr.replace(new RegExp(baseAttr), baseAttr + '-bottom-left'));
        } else {
            cssTop    = that.css(attr.replace(new RegExp(baseAttr), baseAttr + '-top'));
            cssRight  = that.css(attr.replace(new RegExp(baseAttr), baseAttr + '-right'));
            cssBottom = that.css(attr.replace(new RegExp(baseAttr), baseAttr + '-bottom'));
            cssLeft   = that.css(attr.replace(new RegExp(baseAttr), baseAttr + '-left'));
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
    _saveTimer:             null, // Timeout to save the configuration
    _saveToServer:          function (viewDiv, view) {
        if (!this.undoHistory || !this.undoHistory.length ||
            (JSON.stringify(this.views[view]) !== JSON.stringify(this.undoHistory[this.undoHistory.length - 1]))) {
            this.undoHistory = this.undoHistory || [];
            $('#button_undo').removeClass('ui-state-disabled');
            if (this.undoHistory.push($.extend(true, {}, this.views[view])) > this.undoHistoryMaxLength) {
                this.undoHistory.splice(0, 1);
            }
        }
        var that = this;
        this.saveRemote(function () {
            that._saveTimer = null;
            $('#saving_progress').hide();
        });
    },
    save:                   function (viewDiv, view, cb) {
        if (this._saveTimer) {
            clearTimeout(this._saveTimer);
            this._saveTimer = null;
        }
        if (typeof viewDiv === 'function') {
            cb = viewDiv;
            viewDiv = null;
        }

        if (!viewDiv) {
            viewDiv = this.activeViewDiv;
            view    = this.activeView;
        }

        var that = this;
        // Store the changes if nothing changed during next 2 seconds
        this._saveTimer = setTimeout(function () {
            that._saveToServer(viewDiv, view);
        }, 2000);

        $('#saving_progress').show();
        if (cb) cb(viewDiv, view);
    },
    undo:                   function (viewDiv, view) {
        if (this.undoHistory.length <= 1) return;

        if (!viewDiv) {
            viewDiv = this.activeViewDiv;
            view    = this.activeView;
        }

        var activeWidgets = this.activeWidgets;

        this.inspectWidgets(viewDiv, view, []);
        $('#visview_' + viewDiv).remove();

        this.undoHistory.pop();
        this.views[view] = $.extend(true, {}, this.undoHistory[this.undoHistory.length - 1]);
        this.saveRemote();

        if (this.undoHistory.length <= 1) {
            $('#button_undo').addClass('ui-state-disabled').removeClass('ui-state-hover');
        }

        var that = this;
        this.renderView(viewDiv, view, function (viewDiv, view) {
            that.changeViewEdit(viewDiv, view, true);
            that.inspectWidgets(viewDiv, view, activeWidgets);
        });
    },
    getWidgetThumbnail:     function (widget, maxWidth, maxHeight, callback) {
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
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
            ctx.font = '5px Arial';
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
    showHint:               function (content, life, type, onShow) {
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
    selectAll:              function (viewDiv, view) {
        // Select all widgets on view
        var $focused = $(':focus');

        if (!view)    view    = this.activeView;
        if (!viewDiv) viewDiv = this.activeViewDiv;

        // Workaround
        if (!$focused.length && viewDiv) {
            var newWidgets = [];

            if (viewDiv !== view) {
                newWidgets = JSON.parse(JSON.stringify(this.views[view].widgets[viewDiv].data.members));
            } else {
                // Go through all widgets
                for (var widget in this.views[view].widgets) {
                    if (!this.views[view].widgets.hasOwnProperty(widget)) continue;
                    if (!this.views[view].widgets[widget].grouped) newWidgets.push(widget);
                }
            }
            this.inspectWidgets(viewDiv, view, newWidgets);
            return true;
        } else {
            return false;
        }
    },
    deselectAll:            function (viewDiv, view) {
        // Select all widgets on view
        var $focused = $(':focus');
        if (!$focused.length && viewDiv) {
            if (!view)    view    = this.activeView;
            if (!viewDiv) viewDiv = this.activeViewDiv;
            this.inspectWidgets(viewDiv, view, []);
            return true;
        } else {
            return false;
        }
    },
    paste:                  function (viewDiv, view) {
        var $focused = $(':focus');
        if (!$focused.length) {
            if (this.clipboard && this.clipboard.length) {
                if (!view)    view    = this.activeView;
                if (!viewDiv) viewDiv = this.activeViewDiv;

                var widgets = this.dupWidgets(viewDiv, view, this.clipboard);
                this.save(viewDiv, view);                // Select main widget and add to selection the secondary ones
                this.inspectWidgets(viewDiv, view, widgets);
            }
        }
    },
    copyWidgets:            function (viewDiv, view, isCut, widget, clipboard, index, wid) {
        if (this.views[view].widgets[widget]) {
            var w = this.views[view].widgets[widget];
            var members;
            if (w.data && w.data.members) {
                members = [];
                for (var m = 0; m < w.data.members.length; m++) {
                    index++;
                    index = this.copyWidgets(viewDiv, view, isCut, w.data.members[m], clipboard, index, index);
                    members.push(index);
                }
            }
            var obj = {
                widget:  $.extend(true, {}, w),
                view:    isCut ? '---copied---' : view,
                viewDiv: isCut ? '---copied---' : viewDiv
            };
            if (wid) {
                obj.wid = wid;
            }
            if (members) {
                obj.widget.data.members = members;
            }
            clipboard.push(obj);
        }
        return index;
    },
    copy:                   function (viewDiv, view, isCut, widgets) {
        var $focused = $(':focus');
        if (!view)    view    = this.activeView;
        if (!viewDiv) viewDiv = this.activeViewDiv;

        if (widgets || (!$focused.length && this.activeWidgets.length)) {
            //noinspection JSJQueryEfficiency
            var $clipboard_content = $('#clipboard_content');
            if (!$clipboard_content.length) {
                $('body').append('<div id="clipboard_content" style="display: none" class="vis-clipboard" title="' + _('Click to hide') + '"></div>');
                $clipboard_content = $('#clipboard_content');
            }

            this.clipboard = [];
            var widgetNames = '';
            widgets = widgets || this.activeWidgets;
            if (widgets.length) {
                var index = 0;
                for (var i = 0, len = widgets.length; i < len; i++) {
                    widgetNames += (widgetNames ? ', ' : '') + widgets[i];
                    index = this.copyWidgets(viewDiv, view, isCut, widgets[i], this.clipboard, index);
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
            if (typeof html2canvas !== 'undefined') {
                this.getWidgetThumbnail(widgets[0], 0, 0, function (canvas) {
                    $('#thumbnail').html(canvas);
                    if (isCut) {
                        that.delWidgets(viewDiv, view, widgets);
                        that.inspectWidgets(viewDiv, view, []);
                    }
                });
            } else {
                if (isCut) {
                    this.delWidgets(viewDiv, view, widgets);
                    this.inspectWidgets(viewDiv, view, []);
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
    onButtonDelete:         function (widgets) {
        var $focused = $(':focus');
        if (widgets || (!$focused.length && this.activeWidgets.length)) {
            widgets = widgets || JSON.parse(JSON.stringify(this.activeWidgets));
            var isHideDialog = this.config['dialog/delete_is_show'] || false;

            var viewDiv = this.activeViewDiv;
            var view    = this.activeView;

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
                    that.delWidgets(viewDiv, view, widgets);
                    that.inspectWidgets(viewDiv, view, []);
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
                        $(event.target).parent().find('.ui-dialog-titlebar-close .ui-button-text').html('');
                        $('[aria-describedby="dialog_delete"]').css('z-index', 11002);
                        $('.ui-widget-overlay').css('z-index', 1001);
                    },
                    buttons: dialog_buttons
                });
            } else {
                this.delWidgets(viewDiv, view, widgets);
                this.inspectWidgets(viewDiv, view, []);
            }
            return true;
        } else {
            return false;
        }
    },
    onButtonArrows:         function (key, isSize, factor) {
        factor = factor || 1;
        var $focused = $(':focus');
        if (!$focused.length && this.activeWidgets.length) {
            var what = null;
            var shift = 0;
            var direction = 'n';
            key = parseInt(key, 10);
            if (isSize) {
                if (key === 39) {
                    //Right
                    what = 'width';
                    shift = 1;
                } else if (key === 37) {
                    // Left
                    what = 'width';
                    shift = -1;
                } else if (key === 40) {
                    // Down
                    what = 'height';
                    shift = 1;
                } else if (key === 38) {
                    // Up
                    what = 'height';
                    shift = -1;
                }
            } else {
                if (key === 39) {
                    //Right
                    what = 'left';
                    shift = 1;
                } else if (key === 37) {
                    // Left
                    what = 'left';
                    shift = -1;
                    direction = 'p';
                } else if (key === 40) {
                    // Down
                    what = 'top';
                    shift = 1;
                } else if (key === 38) {
                    // Up
                    what = 'top';
                    shift = -1;
                    direction = 'p';
                }
            }

            shift = shift * factor;

            var viewDiv = this.activeViewDiv;
            var view    = this.activeView;
            var viewOffset = this.editGetViewOffset();

            for (var i = 0, len = this.activeWidgets.length; i < len; i++) {
                var widgetId = this.activeWidgets[i];
                var $actualWidget = $('#' + widgetId);
                var position = this.views[view].widgets[widgetId].style.position;
                if (!isSize && (position === 'relative' || position === 'static' || position === 'sticky')) {
                    this.editWidgetOrder(null, widgetId, direction);
                    this.showWidgetHelper(viewDiv, view, widgetId, true);
                } else {
                    if (this.views[view].widgets[widgetId].style[what] === undefined && $actualWidget.length) {
                        this.views[view].widgets[widgetId].style[what] = $actualWidget.css(what);
                    }
                    var value;
                    var oldValue;

                    if (what === 'width') {
                        oldValue = $actualWidget.innerWidth();
                        if (shift > 0) {
                            value = Math.ceil(oldValue + shift);
                        } else {
                            value =  Math.floor(oldValue + shift);
                        }
                        $actualWidget.css(what, value);
                        if ($actualWidget.innerWidth() === oldValue) {
                            value += shift;
                            $actualWidget.css(what, value);
                        }
                        this.editApplySize(viewDiv, view, widgetId, value, null);
                    } else
                    if (what === 'height') {
                        oldValue = $actualWidget.innerHeight();
                        if (shift > 0) {
                            value = Math.ceil(oldValue + shift)
                        } else {
                            value =  Math.floor(oldValue + shift);
                        }
                        $actualWidget.css(what, value);
                        if ($actualWidget.innerHeight() === oldValue) {
                            value += shift;
                            $actualWidget.css(what, value);
                        }
                        this.editApplySize(viewDiv, view, widgetId, null, value);
                    } else
                    if (what === 'top') {
                        oldValue = $actualWidget.offset().top - viewOffset.top;
                        if (shift > 0) {
                            value = Math.ceil(oldValue + shift)
                        } else {
                            value = Math.floor(oldValue + shift);
                        }
                        $actualWidget.css(what, value);
                        if ($actualWidget.offset().top - viewOffset.top === oldValue) {
                            value += shift;
                            $actualWidget.css(what, value);
                        }
                        this.editApplyPosition(viewDiv, view, widgetId, value, null);
                    } else
                    if (what === 'left') {
                        oldValue = $actualWidget.offset().left - viewOffset.left;
                        if (shift > 0) {
                            value = Math.ceil(oldValue + shift);
                        } else {
                            value =  Math.floor(oldValue + shift);
                        }
                        $actualWidget.css(what, value);
                        if ($actualWidget.offset().left - viewOffset.left === oldValue) {
                            value += shift;
                            $actualWidget.css(what, value);
                        }
                        this.editApplyPosition(viewDiv, view, widgetId, null, value);
                    }
                    if ($actualWidget.length) {
                        var setCss = {};
                        setCss[what] = this.views[view].widgets[widgetId].style[what];
                        $actualWidget.css(setCss);
                        this.showWidgetHelper(viewDiv, view, widgetId, true);
                    }
                }
            }
            this.editShowLeadingLines();

            if (this.delayedSettings) clearTimeout(this.delayedSettings);

            var that = this;
            this.delayedSettings = setTimeout(function () {
                that.editShowLeadingLines(null, true); // hide lines
                // Save new settings
                var activeWidgets = JSON.parse(JSON.stringify(that.activeWidgets));
                that.activeWidgets = [];
                for (var i = 0, len = activeWidgets.length; i < len; i++) {
                    var mWidget = document.getElementById(activeWidgets[i]);

                    if ((what === 'top' || what === 'left') && mWidget._customHandlers && mWidget._customHandlers.onMoveEnd) {
                        mWidget._customHandlers.onMoveEnd(mWidget, activeWidgets[i]);
                    } else if (mWidget._customHandlers && mWidget._customHandlers.onCssEdit) {
                        mWidget._customHandlers.onCssEdit(mWidget, activeWidgets[i]);
                    }

                    if (mWidget._customHandlers && mWidget._customHandlers.isRerender) that.reRenderWidgetEdit(that.activeViewDiv, that.activeView, activeWidgets[i]);
                }
                that.delayedSettings = null;
                that.activeWidgets   = activeWidgets;
                that.inspectWidgets(viewDiv, view, true);
            }, 1000);

            this.save(viewDiv, view);

            return true;
        } else {
            return false;
        }
    },
    onPageClosing:          function () {
        // If not saved
        if (this._saveTimer || !$('#css_file_save').prop('disabled')) {
            if (window.confirm(_('Changes are not saved. Are you sure?'))) {
                return null;
            } else {
                return _('Configuration not saved.');
            }
        }
        return null;
    },
    bindInstanceEdit:       function () {
        var that = this;
        !this.instance && this.generateInstance();

        $('#vis_instance').change(function () {
            that.instance = $(this).val();
            if (typeof storage !== 'undefined') storage.set(that.storageKeyInstance, that.instance);
        }).val(this.instance);
    },
    lockWidgets:            function (viewDiv, view, widgets) {
        // Disable selectee for all widgets
        widgets = widgets || this.activeWidgets;

        if (widgets.length && !this.views[view]) {
            view = this.getViewOfWidget(widgets[0]);
        }

        if (widgets.length) {
            for (var w = 0; w < widgets.length; w++) {
                $('#' + widgets[w]).addClass('vis-widget-edit-locked').removeClass('ui-selectee ui-selected').unbind('click dblclick');
                this.views[view].widgets[widgets[w]].data.locked = true;
            }
            this.inspectWidgets(viewDiv, view, widgets);
        }
    },
    unlockWidgets:          function (viewDiv, view, widgets) {
        // Disable selectee for all widgets
        widgets = widgets || this.activeWidgets;

        if (widgets.length && !this.views[view]) {
            view = this.getViewOfWidget(widgets[0]);
        }
        if (widgets.length) {
            // Enable select for all widgets
            for (var w = 0; w < widgets.length; w++) {
                $('#' + widgets[w]).removeClass('vis-widget-edit-locked').addClass('ui-selectee');
                if (this.views[view].widgets[widgets[w]].data.locked !== undefined) {
                    delete this.views[view].widgets[widgets[w]].data.locked;
                }
                this.bindWidgetClick(viewDiv, view, widgets[w]);
            }
            this.inspectWidgets(viewDiv, view, widgets);
        }
    },
    bringTo:                function (viewDiv, view, widgets, isToFront) {
        widgets = widgets || this.activeWidgets;
        var x = {min: 10000, max: -10000};
        var y = {min: 10000, max: -10000};
        var z = {min: 10000, max: -10000};
        var offset;
        var $wid;
        var zindex;
        var w;
        var viewObj = this.views[view];

        // Calculate biggest square
        for (w = 0; w < widgets.length; w++) {
            $wid = $('#' + widgets[w]);
            offset = $wid.position();
            var width  = $wid.outerWidth();
            var height = $wid.outerHeight();
            if (viewObj.widgets[widgets[w]].style['z-index'] === undefined ||
                viewObj.widgets[widgets[w]].style['z-index'] === null ||
                viewObj.widgets[widgets[w]].style['z-index'] === '') {
                viewObj.widgets[widgets[w]].style['z-index'] = 0;
                $wid.css({'z-index': 0});
            }
            zindex = parseInt(viewObj.widgets[widgets[w]].style['z-index'], 10) || 0;
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
        var $list = $('#visview_' + viewDiv + ' .vis-widget').filter(function() {
            var wid = $(this).attr('id');
            if (widgets.indexOf(wid) !== -1) return false;
            if (!viewObj.widgets[wid]) return false;
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
            if ((tl.x <= x.min  && x.min <= br.x) &&
                (tl.y <= y.min  && y.min <= br.y)) {
                isInside = true;
            } else
            if ((tl.x <= x.max  && x.max <= br.x) &&
                (tl.y <= y.min  && y.min <= br.y)) {
                isInside = true;
            } else
            if ((tl.x <= x.max  && x.max <= br.x) &&
                (tl.y <= y.max  && y.max <= br.y)) {
                isInside = true;
            } else
            if ((tl.x <= x.min  && x.min <= br.x) &&
                (tl.y <= y.max  && y.max <= br.y)) {
                isInside = true;
            }

            if (isInside) {
                var z = viewObj.widgets[wid] ? parseInt(viewObj.widgets[wid].style['z-index'], 10) || 0 : 0;
                if (minZ > z) minZ = z;
                if (maxZ < z) maxZ = z;
                console.log('Widget in square: ' + $(this).attr('id') + ', zindex ' + z);
            }

            return isInside;
        });

        if (!$list.length) {
            //reset z-index
            for (var w = 0; w < widgets.length; w++) {
                $wid = $('#' + widgets[w]);
                zindex = undefined;
                console.log('reset z-index of ' + widgets[w]);
                $wid.css('z-index', zindex);
                viewObj.widgets[widgets[w]].style['z-index'] = zindex;
            }
            this.inspectWidgets(viewDiv, view, true);
            return;
        }

        var that = this;
        // Move all widgets
        if (isToFront) {
            // If z-index will be over 900
            if (z.max - z.min >= 700 - maxZ) {
                offset = z.max - z.min - (700 - maxZ) + 1;
                // Move all widgets to let place under them
                $list.each(function () {
                    var zindex = parseInt(viewObj.widgets[$(this).attr('id')].style['z-index'], 10) || 0;
                    zindex = zindex - offset < 0 ? 0 : zindex - offset;
                    $(this).css('z-index', zindex);
                    viewObj.widgets[$(this).attr('id')].style['z-index'] = zindex;
                });
                maxZ -= offset;
            }

            // If everything is OK
            if (maxZ < z.min) return;
            if (maxZ === z.min) maxZ++;
            for (var w = 0; w < widgets.length; w++) {
                $wid = $('#' + widgets[w]);
                zindex = parseInt(viewObj.widgets[widgets[w]].style['z-index'], 10) || 0;
                console.log('Move ' + widgets[w] + ' from ' + zindex  + ' to ' + (maxZ + zindex - z.min));
                zindex = maxZ + zindex - z.min + 1;
                $wid.css('z-index', zindex);
                viewObj.widgets[widgets[w]].style['z-index'] = zindex;
            }
        } else {
            // If z-index will be negative
            if (z.max - z.min >= minZ) {
                offset = z.max - z.min - minZ + 1;
                // Move all widgets to let place under them
                $list.each(function () {
                    var zindex = parseInt(viewObj.widgets[$(this).attr('id')].style['z-index'], 10) || 0;
                    zindex = zindex + offset > 700 ? 700 : zindex + offset;
                    $(this).css('z-index', zindex);
                    viewObj.widgets[$(this).attr('id')].style['z-index'] = zindex;
                });
                minZ += offset;
            }
            if (z.max < minZ) return;

            for (var w = 0; w < widgets.length; w++) {
                $wid = $('#' + widgets[w]);
                zindex = parseInt(viewObj.widgets[widgets[w]].style['z-index'], 10) || 0;
                console.log('Move ' + widgets[w] + ' from ' + zindex  + ' to ' + (maxZ + zindex - z.min));
                zindex = minZ - z.max + zindex - 1;
                $wid.css('z-index', zindex);
                viewObj.widgets[widgets[w]].style['z-index'] = zindex;
            }
        }
        this.inspectWidgets(viewDiv, view, true);
    },
    hideContextMenu:        function (e, viewDiv, view) {
        if (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
        }
        if (!viewDiv) viewDiv = this.activeViewDiv;
        if (!view)    view    = this.activeView;

        var $contextMenu = $('#context_menu');

        if ($contextMenu.parent().attr('id') !== 'vis_container') {
            try {
                $contextMenu.appendTo($('#vis_container'));
            } catch (e) {

            }
        }

        if ($contextMenu.is(':visible')) {
            $contextMenu.hide();

            $('#visview_' + viewDiv)
                .unbind('click', this.editOnClickInMenu)
                .find('.vis-widget')
                .removeClass('vis-widgets-highlight');

            this.installSelectable(viewDiv, view);
        }
    },
    editOnClickInMenu:      function (e) {
        // called by jQuery and this is not vis
        vis.hideContextMenu();
    },
    editGetWidgetsUnderCursor: function ($viewDiv, view, options) {
        var viewDiv = $viewDiv.attr('id').substring('visview_'.length);
        var that = this;
        return $viewDiv.find('.vis-widget').filter(function() {
            var offset = $(this).position();

            if (!$(this).length) {
                return false;
            }
            //if ($(this).hasClass('vis-widget-edit-locked')) return false;
            var id = $(this).attr('id');
            if (viewDiv === id) {
                return false;
            }

            if (that.views[view].widgets[id] && that.views[view].widgets[id].grouped) {
                return false;
            }

            var range = {
                x: [offset.left + options.scrollLeft, offset.left + options.scrollLeft + $(this).outerWidth()],
                y: [offset.top  + options.scrollTop,  offset.top  + options.scrollTop  + $(this).outerHeight()]
            };
            return (options.left >= range.x[0] && options.left <= range.x[1]) && (options.top >= range.y[0] && options.top <= range.y[1]);
        });
    },
    showContextMenu:        function (viewDiv, view, options) {
        var that = this;
        var offset;
        var range;
        var wid;
        var $listSelected = [];
        var $listToSelect;
        var $contextMenu = $('#context_menu');
        var $view = $('#visview_' + viewDiv);

        if (this.editTemplatesHideMenu) {
            this.editTemplatesHideMenu();
        }
        // Remove selectable to prevent widgets selection after click
        if (this.selectable && $view.hasClass('ui-selectable')) $view.selectable('destroy');

        $view.click(this.editOnClickInMenu);
        var $contextMenuPaste = $('#context_menu_paste');

        // remember position of click

        $contextMenuPaste.data('posX', options.left);
        $contextMenuPaste.data('posY', options.top);

        if (!$contextMenuPaste.data('inited')) {
            $contextMenuPaste
                .data('inited', true)
                .click(function (e) {
                    that.hideContextMenu(e, viewDiv, view);
                    var x = $(this).data('posX');
                    var y = $(this).data('posY');
                    // modify position of widget
                    var widgets = that.dupWidgets(viewDiv, view, that.clipboard, x, y);
                    that.save(viewDiv, view);                // Select main widget and add to selection the secondary ones
                    that.inspectWidgets(viewDiv, view, widgets);
                });

            $('#context_menu_import').click(function (e) {
                that.hideContextMenu(e, viewDiv, view);
                that.importWidgets(viewDiv, view);
            });
        }
        $contextMenu.unbind('blur').blur(this.editOnClickInMenu);

        $('.context-menu-ul').remove();
        $('.context-menu-wid').remove();
        var $contextSubmenu = $('.context-submenu').unbind('click');
        var $contextMenuWid = $('#context_menu_wid').html('').hide();

        // If some widgets selected => find out if click on some widget
        if (this.activeWidgets && this.activeWidgets.length) {
            var isHit = false;

            // Find if some active widgets clicked
            for (var w = 0; w < this.activeWidgets.length; w++) {
                var $wid = $('#' + this.activeWidgets[w]);
                if (!$wid.length) continue;
                offset = $wid.position();
                range = {
                    x: [offset.left + options.scrollLeft, offset.left + options.scrollLeft + $wid.outerWidth() ],
                    y: [offset.top  + options.scrollTop,  offset.top  + options.scrollTop  + $wid.outerHeight()]
                };
                if ((options.left >= range.x[0] && options.left <= range.x[1]) &&
                    (options.top  >= range.y[0] && options.top  <= range.y[1])) {
                    isHit = true;
                    break;
                }
            }

            if (isHit) {
                $listSelected = $view.find('.vis-widget').filter(function() {
                    return that.activeWidgets.indexOf($(this).attr('id')) !== -1;
                });
            } else {
                // Check if one widget clicked
                // Find all widgets under the cursor
                $listToSelect = this.editGetWidgetsUnderCursor($view, view, options);

                if ($listToSelect.length === 1) {
                    // Select one
                    this.inspectWidgets(viewDiv, view, [$($listToSelect[0]).attr('id')]);
                    $listSelected = $listToSelect;
                    $listToSelect = [];
                } else {
                    // Remove selection
                    this.inspectWidgets(viewDiv, view, []);
                }
            }

            if ($listSelected.length > 1) {
                $('#context_menu_group').show();
            } else {
                $('#context_menu_group').hide();
            }
        } else {
            $('#context_menu_group').hide();
        }

        // Find all widgets under the cursor
        if (!$listToSelect) {
            $listToSelect = this.editGetWidgetsUnderCursor($view, view, options);
        }

        // If no active widgets clicked, but only one other clicked => select it
        if (!$listSelected.length && $listToSelect.length === 1) {
            // Select one
            this.inspectWidgets(viewDiv, view, [$($listToSelect[0]).attr('id')]);
            $listSelected = $listToSelect;
            $listToSelect = [];
        }

        // If selected only one and it is group => show ungroup
        if ($listSelected.length === 1 && $($listSelected[0]).attr('id')[0] === 'g' && this.editTemplatesCreate) {
            $('#context_menu_ungroup').show();
            $('#context_menu_group2template').show();
        } else {
            $('#context_menu_ungroup').hide();
            $('#context_menu_group2template').hide();
        }

        // show title of menu
        if ($listSelected.length === 1) {
            $contextMenuWid.append(that.getWidgetName($($listSelected[0]).attr('id'))).show();
        } else if ($listSelected.length > 1) {
            $contextMenuWid.append(_('%s widgets', $listSelected.length)).show();
        } else {
            $contextMenuWid.hide();
        }

        if ($listToSelect.length) {
            var allSelected = true;
            // If yet selected => do not show menu element
            if ($listSelected && $listSelected.length) {
                $listToSelect.each(function () {
                    var wid = $(this).attr('id');
                    var found = false;
                    $listSelected.each(function () {
                        if ($(this).attr('id') === wid) {
                            found = true;
                            return false;
                        }
                    });
                    if (!found) {
                        allSelected = false;
                        return false;
                    }
                });
            }

            if ($listSelected && $listSelected.length && allSelected) {
                $('#context_menu_select').hide();
            } else {
                var widgets = [];
                var text = '';

                $listToSelect.each(function () {
                    var wid = $(this).attr('id');
                    text += '<li data-wid="' + wid + '" class="context-menu-common-item">' +  that.getWidgetName(wid) + '</li>';
                    widgets.push(wid);
                });
                text = '<li data-wid="' + widgets.join(' ') + '">' +  _('all') + '</li>' + text;
                $('#context_menu_select').show();

                $contextSubmenu.append('<span class="context-menu-wid">...</span><ul class="context-menu-ul" style="min-width: 200px">' + text + '</ul>');
            }
        } else {
            $('#context_menu_select').hide();
        }

        if (($listSelected && $listSelected.length > 0) || $listToSelect.length > 0) {
            $contextSubmenu.removeClass('ui-state-disabled');
            if ($listSelected.length > 1) {
                $('#context-menu-action').show();
            } else {
                $('#context-menu-action').hide();
            }

            $('.context-menu-common-item').click(function (e) {
                that.hideContextMenu(e, viewDiv, view);
                var widgets  = that.activeWidgets;
                var action = $(this).data('action');
                if (!action) action = $(this).parent().parent().data('action');

                switch(action) {
                    case 'lock':
                        that.lockWidgets(viewDiv, view, widgets);
                        break;
                    case 'unlock':
                        that.unlockWidgets(viewDiv, view, widgets);
                        break;
                    case 'export':
                        that.exportWidgets(widgets);
                        break;
                    case 'bringToBack':
                        that.bringTo(viewDiv, view, widgets, false);
                        break;
                    case 'bringToFront':
                        that.bringTo(viewDiv, view, widgets, true);
                        break;
                    case 'copy':
                        that.copy(viewDiv, view, false, widgets);
                        break;
                    case 'select':
                        that.inspectWidgets(viewDiv, view, $(e.target).data('wid') ? $(e.target).data('wid').split(' ') : []);
                        break;
                    case 'delete':
                        that.onButtonDelete(widgets);
                        break;
                    case 'cut':
                        that.copy(viewDiv, view, true, widgets);
                        break;
                    case 'group':
                        that.editCreateGroup(viewDiv, view, widgets);
                        break;
                    case 'ungroup':
                        that.editDestroyGroup(viewDiv, view, widgets[0]);
                        break;
                    case 'group2template':
                        that.editTemplatesCreate(viewDiv, view, widgets[0]);
                        break;
                }
            });
        }

        // Enable paste if something in clipboard
        if (this.clipboard && this.clipboard.length) {
            $contextMenuPaste.removeClass('ui-state-disabled');
        } else {
            $contextMenuPaste.addClass('ui-state-disabled');
        }
        if (!$contextMenu.data('inited')) {
            $contextMenu.data('inited', true);
        } else {
            $contextMenu.menu('destroy');
        }

        $contextMenu.css(options)
            .appendTo($view)
            .show()
            .menu({
                focus: function (event, ui) {
                    $('#visview_' + viewDiv).find('.vis-widgets-highlight').removeClass('vis-widgets-highlight');
                    var widgets = ui.item.data('wid');
                    if (!widgets) return;
                    widgets = widgets.split(' ');
                    for (var i = 0; i < widgets.length; i++) {
                        $('#' + widgets[i]).addClass('vis-widgets-highlight');
                    }
                },
                blur: function (/* event, ui */) {
                    $('#visview_' + viewDiv).find('.vis-widgets-highlight').removeClass('vis-widgets-highlight');
                }
            });

        // var pos = $contextMenu.position();
        var h   = $contextMenu.height();
        var ww  = $contextMenu.width();

        if (options.top - h > options.scrollTop) {
            $contextMenu.css({top: options.top - h});
        }
        if (options.left - ww > options.scrollLeft) {
            $contextMenu.css({left: options.left - ww});
        }

        $contextMenu.focus();
    },
    editShowWizard:         function (viewDiv, view, $tplElem) {
        var tpl = $tplElem.attr('id').substring('prev_container_'.length);
        $tplElem.attr('id', '');
        var that = this;

        //noinspection JSJQueryEfficiency
        var $dlg = $('#dialog_wizard');
        if (!$dlg.length) {
            $('body').append('<div id="dialog_wizard" style="display: none"></div>');
            $dlg = $('#dialog_wizard');
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
                noDialog: false,
                noMultiselect: false,
                filter: {type: 'state'},
                roleExactly: true,
                columns: ['image', 'name', 'role', 'room', 'value'],
                imgPath: '/lib/css/fancytree/',
                objects: this.objects,
                states:  this.states,
                zindex:  1001
            });
        }

        $dlg.selectId('show', function (newIds) {
            if (!newIds || !newIds.length) return;
            var $tpl = $('#' + tpl);
            var renderVisible = $tpl.attr('data-vis-render-visible');
            var widgets = [];
             // Go through all selected OIDs
            for (var i = 0; i < newIds.length; i++) {
                var data = {};
                var attrs = $dlg.data('attrs');
                var onlyAttrs = $dlg.data('onlyAttrs');
                if (attrs.indexOf('oid') !== -1) data.oid = 'nothing_selected';
                if (renderVisible) data.renderVisible = true;
                var oid = $dlg.find('.dialog-wizard-select').val();
                var found = false;

                if (oid) {
                    data[oid] = newIds[i];
                    // Try to find onChange handler
                    for (var j = 0; j < attrs.length; j++) {
                        var pos = attrs[j].indexOf('[');
                        found = false;
                        if (pos !== -1 && oid === attrs[j].substring(0, pos)) {
                            found = true;
                        } else {
                            pos = attrs[j].indexOf('/');
                            if (pos !== -1 && oid === attrs[j].substring(0, pos)) {
                                found = true;
                            }
                        }
                        if (found) {
                            found = attrs[j].split('/')[2];
                            break;
                        }
                    }
                }
                // Try to
                /*if (that.objects[newIds[i]].common && that.objects[newIds[i]].common.name) {
                    if (attrs.indexOf('title') !== -1) data.title = that.objects[newIds[i]].common.name;
                    if (attrs.indexOf('descriptionLeft') !== -1) data.descriptionLeft = that.objects[newIds[i]].common.name;
                    data.name = that.objects[newIds[i]].common.name;
                }*/

                var widgetId = that.addWidget(viewDiv, view, {tpl: tpl, data: data});

                // call default onChange handler
                if (found) {
                    if (vis.binds[$tpl.data('vis-set')] && vis.binds[$tpl.data('vis-set')][found]) {
                        vis.binds[$tpl.data('vis-set')][found](widgetId, view, newIds[i], oid, false);
                    }
                }

                widgets.push(widgetId);
            }

            that.updateSelectWidget(viewDiv, view, widgets);

            setTimeout(function () {
                that.inspectWidgets(viewDiv, view, widgets);
            }, 50);
        });
        var $realDlg = $('[aria-describedby="dialog_wizard"]');
        $realDlg.find('.ui-dialog-title').html(_('Wizard to create widgets...'));
        $realDlg.find('.ui-button-text').each(function () {
            var id = $(this).parent().attr('id');
            if (id && id.indexOf('button-ok') !== -1) {
                $(this).html(_('Generate'));
            }
        });
        if (!$dlg.find('.dialog-wizard-preview').length) {
            $dlg.find('div').first().css('height', 'calc(100% - 140px)');
            $dlg.dialog('option', 'height', 700);
            $dlg.prepend('<table><tr><td><div class="dialog-wizard-preview"></div></td><td class="padding-left: 15px">' +
                '<label for="dialog-wizard-select">' + _('Attribute for OID:') + ' </label>' +
                '<select class="dialog-wizard-select" id="dialog-wizard-select"></select><br>' +
                '</td></tr></table>');
        }

        $dlg.find('.dialog-wizard-preview').html($tplElem);
        var $widgetTpl = $('#' + tpl);
        // fill attributes in select
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
        $dlg.data('attrs', JSON.parse(JSON.stringify(widgetAttrs)));

        var options = '<option value="">' + _('none') + '</option>';
        attr = null;
        for (var w = 0; w < widgetAttrs.length; w++) {
            var pos = widgetAttrs[w].indexOf('/');
            if (pos !== -1) widgetAttrs[w] = widgetAttrs[w].substring(0, pos);
            pos = widgetAttrs[w].indexOf('[');
            if (pos !== -1) widgetAttrs[w] = widgetAttrs[w].substring(0, pos);
            if (widgetAttrs[w] === 'systemOid' ||
                widgetAttrs[w] === 'oidTrueValue' ||
                widgetAttrs[w] === 'oidFalseValue' ||
                widgetAttrs[w].match(/oid\d{0,2}$/) ||
                widgetAttrs[w].match(/^oid/) || widgetAttrs[w].match(/^signals-oid-/)) {
                if (!attr) attr = widgetAttrs[w];
                options += '<option value="' + widgetAttrs[w] + '">' + _(widgetAttrs[w]) + '</option>';
            }
        }
        $dlg.find('.dialog-wizard-select').html(options);
        if (attr) $dlg.find('.dialog-wizard-select').val(attr);
    },
    editWidgetsRect:        function (viewDiv, view, widgets, groupId) {
        if (typeof widgets !== 'object') widgets = [widgets];
        var pos = {
            top:    null,
            left:   null,
            width:  null,
            height: null
        };
        var viewOffset;
        if (groupId) {
            viewOffset = $('#' + groupId).offset();
        } else {
            viewOffset = $('#visview_' + viewDiv).offset();
        }
        // find common coordinates
        for (var w = 0; w < widgets.length; w++) {
            var $w = $('#' + widgets[w]);
            if (!$w.length) continue;
            var offset = $w.offset();
            var top  = offset.top  - viewOffset.top;
            var left = offset.left - viewOffset.left;
            // May be bug?
            if (!left && !top) {
                left = parseInt($w[0].style.left || '0', 10) + parseInt($w[0].offsetLeft, 10);
                top  = parseInt($w[0].style.top  || '0', 10) + parseInt($w[0].offsetTop, 10);
                left = left || 0;
                top  = top || 0;
            }
            var height = $w.innerHeight();
            var width  = $w.innerWidth();

            if (pos.top === null) {
                pos.top    = top;
                pos.left   = left;
                pos.height = top  + height;
                pos.width  = left + width;
            } else {
                if (top  < pos.top)  pos.top  = top;
                if (left < pos.left) pos.left = left;
                if (top  + height > pos.height) pos.height = top  + height;
                if (left + width  > pos.width)  pos.width  = left + width;
            }
        }
        pos.width  = Math.round(pos.width  - pos.left);
        pos.height = Math.round(pos.height - pos.top);
        return pos;
    },
    editConvertToPercent:   function (viewDiv, view, wid, groupId, pRect, isShift) {
        if (!pRect) {
            var $v;
            if (groupId) {
                //pRect = this.editWidgetsRect(viewDiv, view, this.views[view].widgets[groupId].data.members, groupId);
                $v = $('#' + viewDiv);
            } else {
                $v = $('#visview_' + viewDiv);
            }
            pRect = $v.offset();
            pRect.height = $v.innerHeight();
            pRect.width  = $v.innerWidth();
        }
        var wRect = this.editWidgetsRect(viewDiv, view, wid, groupId);
        if (isShift) {
            wRect.top  -= pRect.top;
            wRect.left -= pRect.left;
        }
        wRect.top    = wRect.top  * 100 / pRect.height;
        wRect.left   = wRect.left * 100 / pRect.width;
        wRect.width  = (wRect.width  / pRect.width)  * 100;
        wRect.height = (wRect.height / pRect.height) * 100;
        wRect.top    = Math.round(wRect.top    * 100) / 100 + '%';
        wRect.left   = Math.round(wRect.left   * 100) / 100 + '%';
        wRect.width  = Math.round(wRect.width  * 100) / 100 + '%';
        wRect.height = Math.round(wRect.height * 100) / 100 + '%';
        return wRect;
    },
    editConvertToPx:        function (viewDiv, view, wid, groupId) {
        var wRect = this.editWidgetsRect(viewDiv, view, wid, groupId);
        wRect.top    = Math.round(wRect.top)    + 'px';
        wRect.left   = Math.round(wRect.left)   + 'px';
        wRect.width  = Math.round(wRect.width)  + 'px';
        wRect.height = Math.round(wRect.height) + 'px';
        return wRect;
    },
    editCreateGroup:        function (viewDiv, view, widgets, groupId) {
        if (!groupId) groupId = this.nextGroup();

        var rect = this.editWidgetsRect(viewDiv, view, widgets);
        for (var w = 0; w < widgets.length; w++) {
            var wRect = this.editConvertToPercent(viewDiv, view, widgets[w], null, rect, true);
            this.views[view].widgets[widgets[w]].style.top    = wRect.top;
            this.views[view].widgets[widgets[w]].style.left   = wRect.left;
            this.views[view].widgets[widgets[w]].style.width  = wRect.width;
            this.views[view].widgets[widgets[w]].style.height = wRect.height;

            $('#' + widgets[w]).remove();
            this.views[view].widgets[widgets[w]].grouped = true;
            this.views[view].widgets[widgets[w]].groupid = groupId;
        }
        this.views[view].widgets[groupId] = {
            tpl: '_tplGroup',
            data: {
                members: widgets
            },
            widgetSet: null,
            style: {
                top:    rect.top,
                left:   rect.left,
                width:  rect.width,
                height: rect.height
            }
        };
        if (this.activeView === viewDiv) this.updateSelectWidget(viewDiv, view);
        this.renderWidget(viewDiv, view, groupId);
        this.inspectWidgets(viewDiv, view, [groupId]);
        this.save(viewDiv, view);
    },
    editDestroyGroup:       function (viewDiv, view, groupId) {
        if (groupId && this.views[view].widgets[groupId]) {
            var widgets = this.views[view].widgets[groupId].data.members;
            delete this.views[view].widgets[groupId];

            var w;
            //var rect = this.editWidgetsRect(viewDiv, view, groupId);
            for (w = 0; w < widgets.length; w++) {
                if (!this.views[view].widgets[widgets[w]]) continue;
                if (this.views[view].widgets[widgets[w]].grouped !== undefined) {
                    delete this.views[view].widgets[widgets[w]].grouped;
                }
                if (this.views[view].widgets[widgets[w]].groupid !== undefined) {
                    delete this.views[view].widgets[widgets[w]].groupid;
                }
                var wRect = this.editWidgetsRect(viewDiv, view, widgets[w]);
                this.views[view].widgets[widgets[w]].style.top    = wRect.top    + 'px';
                this.views[view].widgets[widgets[w]].style.left   = wRect.left   + 'px';
                this.views[view].widgets[widgets[w]].style.width  = wRect.width  + 'px';
                this.views[view].widgets[widgets[w]].style.height = wRect.height + 'px';
            }
            $('#' + groupId).remove();

            for (w = 0; w < widgets.length; w++) {
                this.renderWidget(viewDiv, view, widgets[w]);
            }
            if (this.activeView === viewDiv) {
                this.updateSelectWidget(viewDiv, view, null);
                this.inspectWidgets(viewDiv, view, widgets);
            }
        }
    },
    updateSelectWidget:     function (viewDiv, view, added, removed) {
        if (!viewDiv) viewDiv = this.activeViewDiv;
        if (!view)    view    = this.activeView;

        if (added   && typeof added   === 'string') added   = [added];
        if (removed && typeof removed === 'string') removed = [removed];

        if (removed) {
            for (var r = 0; r < removed.length; r++) {
                this.$selectActiveWidgets.find('option[value="' + removed[r] + '"]').remove();
            }
        }
        if (added) {
            for (var a = 0; a < added.length; a++) {
                this.$selectActiveWidgets.append('<option value="' + added[a] + '">' + this.getWidgetName(view, added[a]) + '</option>')
            }
        }
        if (!added && !removed) {
            this.$selectActiveWidgets.html('');
            if (viewDiv !== view) {
                if (this.views[view] && this.views[view].widgets && this.views[view].widgets[viewDiv]) {
                    var _widgets = this.views[view].widgets[viewDiv].data.members;
                    for (var i = 0; i < _widgets.length; i++) {
                        this.$selectActiveWidgets.append('<option value="' + _widgets[i] + '" ' + ((this.activeWidgets.indexOf(_widgets[i]) !== -1) ? 'selected' : '')+ '>' + this.getWidgetName(view, _widgets[i]) + '</option>');
                    }
                }
            } else {
                if (this.views[view] && this.views[view].widgets) {
                    var widgets = this.views[view].widgets;
                    for (var w in widgets) {
                        if (!widgets.hasOwnProperty(w)) continue;
                        if (widgets[w].grouped) continue;
                        this.$selectActiveWidgets.append('<option value="' + w + '" ' + ((this.activeWidgets.indexOf(w) !== -1) ? 'selected' : '')+ '>' + this.getWidgetName(view, w) + '</option>');
                    }
                }
            }
        }
        this.sortSelectWidget();
        this.$selectActiveWidgets.multiselect('refresh');
    },
    sortSelectWidget:       function() {
        this.$selectActiveWidgets.append(this.$selectActiveWidgets.find("option").remove().sort(function(a, b) {
            var at = $(a).text().toLowerCase();
            var bt = $(b).text().toLowerCase();
            return (at > bt) ? 1 : ((at < bt) ? - 1 : 0);
        }));
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
    } else
    if (e.which === 65 && (e.ctrlKey || e.metaKey)) {
        // Ctrl+A
        if (vis.selectAll()) e.preventDefault();
    } else
    if (e.which === 83 && (e.ctrlKey || e.metaKey)) {
        // Ctrl+S
        e.preventDefault();
        vis.saveRemote();
    } else
    if (e.which === 27) {
        // Esc
        if (vis.deselectAll()) e.preventDefault();
    } else if (e.which === 46) {
        // Capture Delete button
        if (vis.onButtonDelete()) e.preventDefault();
    } else
    if (e.which === 37 || e.which === 38 || e.which === 40 || e.which === 39) {
        // Capture down, up, left, right for shift
        if (vis.onButtonArrows(e.which, e.shiftKey, (e.ctrlKey || e.metaKey ? 10 : 1))) {
            e.preventDefault();
        }
    } else
    if (e.which === 113) {
        var $ribbon = $('#ribbon_tab_dev');
        $ribbon.toggle();
        vis.editSaveConfig(['show/ribbon_tab_dev'], $ribbon.is(':visible'));
        e.preventDefault();
    } else if (e.which === 114) {
        // Full screen
        var $container = $('#vis_container');
        var $attrWrap  = $('#attr_wrap');
        var $panAttr   = $('#pan_attr');
        var delay;

        if ($container.hasClass('fullscreen')) {
            $attrWrap.unbind('mouseenter').unbind('mouseleave');
            $panAttr.show();
            $container.addClass('vis_container');
            $container.removeClass('fullscreen').appendTo('#vis_wrap');
            $attrWrap.removeClass('fullscreen-pan-attr').appendTo('#panel_body');
        } else {
            $container.removeClass('vis_container');
            $container.prependTo('body').addClass('fullscreen');
            $attrWrap.prependTo('body').addClass('fullscreen-pan-attr');

            $attrWrap
                .bind('mouseenter', function () {
                clearTimeout(delay);
                    $panAttr.show('slide', {direction: 'right'});
            })
                .bind('mouseleave', function () {
                    delay = setTimeout(function () {
                        if ($attrWrap.hasClass('fullscreen-pan-attr')){
                            $panAttr.hide('slide', {direction: 'right'});
                        }
                    }, 750);
                });
            $panAttr.hide();
        }

        e.preventDefault();
    } else if (e.which === 33) {
        // Next View
        vis.nextView();
        e.preventDefault();
    } else
    if (e.which === 34) {
        // Prev View
        vis.prevView();
        e.preventDefault();
    }
});

// Copy paste mechanism
$(window).on('paste', function (/*e*/) {
    vis.paste();
}).on('copy cut', function (e) {
    vis.copy(null, null, e.type === 'cut');
});

window.onbeforeunload = function () {
    return vis.onPageClosing();
};


