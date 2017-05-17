/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2013-2017 bluefox https://github.com/GermanBluefox, hobbyquaker https://github.com/hobbyquaker
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 */
vis.editInitTemplatesPreview = function () {
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
            var text = '<div id="prev_container_temp_' + t + '" class="wid-prev templates_prev widget-filters" data-keywords="templates" data-template="' + t + '" title="' + t + '"><div class="wid-prev-name" >' + t + '</div></div>';
            $toolbox.append(text);
            var $preview = $('#prev_container_temp_' + t);

            if (templates[t].icon) {
                var content = $preview.append('<img class="wid-prev-content" src="' + templates[t].icon + '" />');
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

vis.editCreateTemplate = function (viewDiv, view, groupId, name) {
    this.views.___settings = this.views.___settings || {};
    this.views.___settings.templates = this.views.___settings.templates || {};
    if (!name || this.views.___settings.templates[name]) {
        name = 'template1';
    }
    var members = [];
    var that = this;
    this.editTemplateSettings(function (data) {
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
                that.editInitTemplatesPreview();
            });
        } else {
            that.save(viewDiv, view);
            that.editInitTemplatesPreview();
        }

    });
};

vis.editTemplateSettings = function (template, callback) {
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