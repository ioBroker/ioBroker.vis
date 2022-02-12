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

vis.editTemplatesInit = function () {
    var that = this;
    $('#toolbox').on('contextmenu click', function (e) {
        // Workaround for OSX. Ignore clicks without ctrl
        if (!e.button && !e.ctrlKey && !e.metaKey) return;

        if (!e.shiftKey && !e.altKey) {
            e.preventDefault();
        }
    });
    $(document).on('contextmenu click', '.templates_prev', function (e) {
        // Workaround for OSX. Ignore clicks without ctrl
        if (!e.button && !e.ctrlKey && !e.metaKey) return;

        if (!e.shiftKey && !e.altKey) {
            var parentOffset = $(this).parent().offset();
            //or $(this).offset(); if you really just want the current element's offset
            var options = {
                left: e.pageX - parentOffset.left,
                top:  e.pageY - parentOffset.top
            };

            options.scrollLeft = $(this).scrollLeft();
            options.scrollTop  = $(this).scrollTop();

            options.left += options.scrollLeft;
            options.top  += options.scrollTop;

            that.editTemplatesShowMenu(options);

            $('.context-template-submenu').data('template', $(this).data('template'));
            e.preventDefault();
        }
    });
    $('.context-template-submenu').click(function () {
        var action = $(this).data('action');
        that.editTemplateHideMenu();
        // get template name
        var template = $('.context-template-submenu').data('template');

        switch (action) {
            case 'edit':
                that.editTemplatesSettings(template, function (data) {
                    var template = $('.context-template-submenu').data('template');
                    var changed = false;

                    if (template !== data.name) {
                        that.views.___settings.templates[data.name] = that.views.___settings.templates[template];
                        delete that.views.___settings.templates[template];
                        changed = true;
                    }

                    if (that.views.___settings.templates[data.name].desc !== data.desc) {
                        that.views.___settings.templates[data.name].desc = data.desc;
                        changed = true;
                    }

                    if (changed) {
                        that.save();
                        that.editTemplatesInitPreview();
                    }
                });
                break;

            case 'delete':
                that.confirmMessage(_('Are you sure?'), _('Confirm'), 'alert', function (result) {
                    if (result) {
                        delete that.views.___settings.templates[template];
                        that.save();
                        that.editTemplatesInitPreview();
                    }
                });
                break;
        }
    });

    vis.editTemplatesInitPreview();
};

vis.editTemplatesInitPreview = function () {
    $('.templates_prev').remove();
    var $selectSet = $('#select_set');

    if (this.views.___settings && this.views.___settings.templates) {
        var $panel = $('#panel_body');
        var $toolbox = $('#toolbox');
        var templates = this.views.___settings.templates;
        for (var t in templates) {
            if (!templates.hasOwnProperty(t)) {
                continue;
            }
            var text = '<div class="wid-prev templates_prev widget-filters" data-keywords="templates" data-template="' + t + '" title="' + (templates[t].desc || t) + '"><div class="wid-prev-name" >' + t + '</div></div>';
            var $preview = $(text);
            $toolbox.append($preview);

            if (templates[t].icon) {
                $preview.append('<img class="wid-prev-content" src="' + templates[t].icon + '" />');
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
        }
        if (!$selectSet.find('option[value="templates"]').length) {
            $selectSet.append('<option value="templates">' + _('templates') + '</option>');
            $selectSet.selectmenu('refresh');
        }
    }
};

vis.editTemplatesCreate = function (viewDiv, view, groupId) {
    this.views.___settings = this.views.___settings || {};
    this.views.___settings.templates = this.views.___settings.templates || {};
    var members = [];
    var that = this;
    this.editTemplatesSettings(function (data) {
        that.copyWidgets(viewDiv, view, false, groupId, members, 0);
        that.views.___settings.templates[data.name] = {
            widgets: members,
            icon: null,
            desc: data.desc
        };
        if (typeof html2canvas !== 'undefined') {
            that.getWidgetThumbnail(groupId, 0, 0, function (canvas) {
                if (canvas) {
                    that.views.___settings.templates[data.name].icon = canvas.toDataURL();
                }
                that.save(viewDiv, view);
                that.editTemplatesInitPreview();
            });
        } else {
            that.save(viewDiv, view);
            that.editTemplatesInitPreview();
        }

    });
};

vis.editTemplatesSettings = function (template, callback) {
    var that = this;
    var $dialog = $('#dialog-template');
    if (typeof template === 'function') {
        callback = template;
        template = '';
    }

    if (template) {
        $('#dialog_template_name').val(template);
        $('#dialog_template_desc').val(that.views.___settings.templates[template].desc || '');
    } else {
        var found;
        var i = 0;
        do {
            i++;
            found = false;
            for (var t in that.views.___settings.templates) {
                if (t === 'template' + i) {
                    found = true;
                    break;
                }
            }
        } while(found);

        template = 'template' + i;
        $('#dialog_template_name').val(template);
        $('#dialog_template_desc').val('');
    }

    $dialog
        .data('template', template)
        .dialog({
            autoPen:    true,
            width:      800,
            height:     250,
            modal:      true,
            draggable:  false,
            resizable:  false,
            open:    function () {
                $('[aria-describedby="dialog-template"]').css('z-index', 1002);
            },
            buttons: [
                {
                    id: 'ok',
                    text: _('Ok'),
                    click: function () {
                        var name = $('#dialog_template_name').val();
                        var desc = $('#dialog_template_desc').val();
                        var oldName = $dialog.data('template');

                        if (oldName !== name) {
                            if (that.views.___settings.templates[name]) {
                                that.showError(_('Duplicate name'));
                                return;
                            }
                        }

                        callback({desc: desc, name: name});

                        $dialog.dialog('close');
                    }
                },
                {
                    text: _('Cancel'),
                    click: function () {
                        $dialog.dialog('close');
                    }
                }
            ]
        });
};

vis.editTemplateHideMenu = function (e) {
    if (e) {
        e.stopImmediatePropagation();
        e.preventDefault();
    }

    $('#context_menu_template').hide();
};

vis.editTemplatesShowMenu = function (options) {
    var $contextMenu = $('#context_menu_template');
    this.hideContextMenu();

    $contextMenu.unbind('blur').blur(this.editTemplateHideMenu);

    $contextMenu.css(options)
        .show()
        .menu();

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
};

vis.editTemplatesShowWarning = function () {
    var isHideDialog = this.config['dialog/templates_is_show'] || false;
    if (!isHideDialog) {
        var that = this;

        $('#dialog_template_warning').dialog({
            autoOpen: true,
            width:    600,
            height:   400,
            modal:    true,
            title:    _('Hint'),
            open:    function (event, ui) {
                $(event.target).parent().find('.ui-dialog-titlebar-close .ui-button-text').html('');
                $('[aria-describedby="dialog_template_warning"]').css('z-index', 11002);
                $('.ui-widget-overlay').css('z-index', 1001);
            },
            buttons: [
                {
                    id: 'ok',
                    text: _('Ok'),
                    click: function () {
                        if ($('#dialog_template_warning_is_show').prop('checked')) {
                            that.editSaveConfig('dialog/templates_is_show', true);
                        }
                        $('#dialog_template_warning').dialog('close');
                    }
                }
            ]
        });
    }
};
