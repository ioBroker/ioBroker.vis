"use strict";
// Following classes should be used if variable table_class="tclass"
// <table class="tclass">
//    <tr class="tclass-th">
//       <th class="tclass-th1">Time</th>
//       <th class="tclass-th2">Event</th>
//    </tr>
//    <tr class="tclass-tr tclass-tr-even tclass-tr-selected">
//       <td>12:34:34</td>
//       <td>Door opened</td>
//    </tr>
//    <tr class="tclass-tr tclass-tr-odd tclass-tr-red">
//       <td>12:34:35</td>
//       <td>Door closed</td>
//    </tr>
//    <tr class="tclass-tr tclass-tr-even">
//       <td>12:34:36</td>
//       <td>Window opened</td>
//    </tr>
// </table>
//
// following json string or object is expected:
//    '[\
//       {"Time": "12:34:34", "Event": "Door opened",   "_data":{"Type": "1", "Event" : "SomeEvent1"}, "_class": "selected"},\
//       {"Time": "12:34:35", "Event": "Door closed",   "_data":{"Type": "2", "Event" : "SomeEvent2"}, "_class": "red" },\
//       {"Time": "12:34:36", "Event": "Window opened", "_data":{"Type": "3", "Event" : "SomeEvent3"}}\
//     ]'
//
//  If _detail object found and detailed_wid is defined
//  following object will be created by selecting of one row:
// <table class="tclass-detail">
//     <tr class="tclass-detail-tr tclass-detail-tr-even"><td class="tclass-detail-td-name">Type</td><td class="tclass-detail-td-value">1</td></tr>
//     <tr class="tclass-detail-tr tclass-detail-tr-odd"><td class="tclass-detail-td-name">Event</td><td class="tclass-detail-td-value">SomeEvent1</td></tr>
// </table>
//
// Dialog
// Can be opened by writing "open" into trigger_id.
// As dialog closed the trigger_id will be written with the text of button
// "show" option is active only in edit mode and has no effect
//

if (vis.editMode) {
    // Add words for basic widgets
    $.extend(true, systemDictionary, {
        "table_oid":        {"en": "Table Object ID",           "de": "Table Object ID",        "ru": "ID таблицы"},
        "static_value":     {"en": "Static JSON(If no ID)",     "de": "Static JSON(If no ID)",  "ru": "Значение, если нет ID таблицы"},
        "event_oid":        {"en": "Event ID",                  "de": "Ereigniss ID",           "ru": "ID события"},
        "selected_oid":     {"en": "Selected ID",               "de": "Ausgewählt ID",          "ru": "ID для отмеченного"},
        "hide_header":      {"en": "Hide header",               "de": "Kein Header",            "ru": "Скрыть заголовок"},
        "show_scroll":      {"en": "Show scroll",               "de": "Zeige Scrollbar",        "ru": "Показать прокрутку"},
        "detailed_wid":     {"en": "Detailed widget",           "de": "Detailed widget",        "ru": "Виджет детализации"},
        "colCount":         {"en": "Column count",              "de": "Kolumnanzahl",           "ru": "Кол-во колонок"},
        "group_header":     {"en": "Headers",                   "de": "Headers",                "ru": "Заголовок"},
        "colName":          {"en": "Name",                      "de": "Name",                   "ru": "Имя"},
        "colWidth":         {"en": "Width",                     "de": "Width",                  "ru": "Ширина"},
        "colAttr":          {"en": "Attribute in JSON",         "de": "Attribut in JSON",       "ru": "Атрибут в JSON"},
        "ack_oid":          {"en": "Acknowledge ID",            "de": "Bestätigung ID",         "ru": "ID для подтверждения"},
        "new_on_top":       {"en": "New event on top",          "de": "Neus Ereignis am Anfang", "ru": "Новые события сначала"}
    });
}

vis.binds.table = {
    getBrowserScrollSize: function (){
        var css = {
            "border":  "none",
            "height":  "200px",
            "margin":  "0",
            "padding": "0",
            "width":   "200px"
        };

        var inner = $("<div>").css($.extend({}, css));
        var outer = $("<div>").css($.extend({
            "left":       "-1000px",
            "overflow":   "scroll",
            "position":   "absolute",
            "top":        "-1000px"
        }, css)).append(inner).appendTo("body")
            .scrollLeft(1000)
            .scrollTop(1000);

        var scrollSize = {
            height: (outer.offset().top - inner.offset().top) || 0,
            width: (outer.offset().left - inner.offset().left) || 0
        };

        outer.remove();
        return scrollSize;
    },

    // Show detailed information
    onRowClick: function  () {
        var $this = $(this);
        var data = $this.data('options');

        // Deselect all rows
        $('#' + data.wid + ' .vis-table-row').removeClass(data.tClass + '-tr-selected');
        // Select a new one
        $this.addClass(data.tClass + '-tr-selected');

        if (data.selected_oid) {
            vis.setValue(data.selected_oid, typeof data.content === 'string' ? data.content : JSON.stringify(data.content));
        }

        // Get container for detailed information
        var $el = $('#' + data.detailed_wid);
        if ($el.length) {
            var text = '';

            if (data.content._detail) {
                text += '<table class="' + data.tClass + '-detail">';
                // Show that object
                var r = 0;
                var obj = '_detail';
                // Go through all attributes
                if (typeof data.content[obj] == 'object') {
                    for (var odata in data.content[obj]) {
                        if (typeof data.content[obj][odata] === 'function') continue;
                        var val = data.content[obj][odata].toString();
                        if (odata.length > 1 && odata[0] === '_' && obj !== '_class' && obj.substring(0, 4) !== '_btn' && obj !== '_id') {
                            continue;
                        }
                        text += '<tr class="' + data.tClass + '-detail-tr ' + data.tClass + '-detail-tr-' + ((r % 2) ? 'odd' : 'even') + '"><td class="' + data.tClass + '-detail-td-name">' + odata + '</td>' +
                            '<td class="' + data.tClass + '-detail-td-value">' + val + '</td></tr>';
                        if (val && val.length > 6 && val.substring(val.length - 6) === '&nbsp;') {
                            text += '<tr class="' + data.tClass + '-detail-tr"><td colspan="2">&nbsp;</td></tr>';
                        }
                        r++;
                    }
                } else {
                    var val = data.content[obj].toString();

                    text += '<tr class="' + data.tClass + '-detail-tr ' + data.tClass + '-detail-tr-' + ((r % 2) ? 'odd' : 'even') + '"><td class="' + data.tClass + '-detail-td-name">' + obj.substring(1) + '</td>' +
                        '<td class="' + data.tClass + '-detail-td-value">' + val + '</td></tr>';

                    if (val && val.length > 6 && val.substring(val.length - 6) === '&nbsp;') {
                        text += '<tr class="' + data.tClass + '-detail-tr"><td colspan="2">&nbsp;</td></tr>';
                    }
                    r++;
                }
                text += '</table>';
            } else {
                // Try to find special attributes starting with '_'
                for (var obj in data.content) {
                    if (!data.content.hasOwnProperty(obj) || typeof data.content[obj] === 'function') continue;
                    if (obj.length > 0 && obj[0] === '_' && obj !== '_class' && obj.substring(0, 4) !== '_btn' && obj !== '_id') {
                        text += '<table class="' + data.tClass + '-detail">';
                        // Show that object
                        var r = 0;
                        // Go through all attributes
                        if (typeof data.content[obj] === 'object') {
                            for (var odata in data.content[obj]) {
                                if (typeof data.content[obj][odata] === 'function') continue;
                                var val = data.content[obj][odata].toString();
                                if (odata.length > 1 && odata[0] === '_' && obj !== '_class' && obj.substring(0, 4) !== '_btn' && obj !== '_id') {
                                    continue;
                                }
                                text += '<tr class="' + data.tClass + '-detail-tr ' + data.tClass + '-detail-tr-' + ((r % 2) ? 'odd' : 'even') + '"><td class="' + data.tClass + '-detail-td-name">' + odata + '</td>' +
                                    '<td class="' + data.tClass + '-detail-td-value">' + val + '</td></tr>';
                                if (val && val.length > 6 && val.substring(val.length - 6) === '&nbsp;') {
                                    text += '<tr class="' + data.tClass + '-detail-tr"><td colspan="2">&nbsp;</td></tr>';
                                }
                                r++;
                            }
                        } else {
                            var val = data.content[obj].toString();

                            text += '<tr class="' + data.tClass + '-detail-tr ' + data.tClass + '-detail-tr-' + ((r % 2) ? 'odd' : 'even') + '"><td class="' + data.tClass + '-detail-td-name">' + obj.substring(1) + '</td>' +
                                '<td class="' + data.tClass + '-detail-td-value">' + val + '</td></tr>';

                            if (val && val.length > 6 && val.substring(val.length - 6) === '&nbsp;') {
                                text += '<tr class="' + data.tClass + '-detail-tr"><td colspan="2">&nbsp;</td></tr>';
                            }
                            r++;
                        }
                        text += '</table>';
                    }
                }
            }


            // If no special _data object found => show standard elements
            if (!text) {
                text = '<table class="' + data.tClass + '-detail">';
                // Go through all attributes
                var row = 0;
                for (var data_obj in data.content) {
                    // Show that object
                    if (!data.content.hasOwnProperty(data_obj) ||
                        (data_obj.length > 1 && data_obj[0] === '_' && data_obj !== '_class' && data_obj.substring(0, 4) !== '_btn' && data_obj !== '_id')) {
                        continue;
                    }
                    var val = data.content[data_obj].toString();

                    text += '<tr class="' + data.tClass + '-detail-tr ' + data.tClass + '-detail-tr-' + ((row % 2) ? 'odd' : 'even') + '"><td class="' + data.tClass + '-detail-td-name">' + data_obj + '</td>' +
                        '<td class="' + data.tClass + '-detail-td-value">' + data.content[data_obj]+'</td></tr>';

                    if (val.length > 6 && val.substring(val.length - 6) === '&nbsp;') {
                        text += '<tr class="' + data.tClass + '-detail-tr"><td colspan="2">&nbsp;</td></tr>';
                    }
                    row++;
                }
                text += '</table>';
            }

            $el.html(text);

            /*if (options.btn_print) {
                $(el).append ('<button id="print_'+that._parent._wid+'" class="'+data.tClass+'-print-button">' + options.btn_print + '</button>');
                var btn = document.getElementById ('print_'+that._parent._wid);
                btn._parent = that._parent;
                btn._print_id = that._data._print_id || JSON.stringify(that._data);

                if (btn && !vis.editMode) {
                    $(btn).bind('click', function () {
                        if (that._parent._options.ack_oid) {
                            vis.setValue(that._parent._options.ack_oid, that._print_id);
                        }

                        if (that._parent._options.view_for_print) {
                            vis.changeView(that._parent._options.view_for_print);
                        }
                        setTimeout(function () {
                            window.print();
                            window.location.reload()
                        }, 500);
                    });
                }
            }*/
        }
    },

    onAckButton: function () {
        var data = $(this).data('options');
        if (data.ack_oid) {
            vis.setValue(data.ack_oid, data.ack_id);
        }
    },

    createRow: function  (rowData, wid, options, rowNumber, noTR, index, serverID) {
        var tClass   = options['class'] || 'tclass';
        var _classes = rowData['_class'] ? rowData['_class'].split(' ') : null;
        var text;
        // Create row
        if (!noTR) {
            text = '<tr class="vis-table-row ' + tClass + '-tr ' +
                tClass + ((rowNumber % 2) ? '-tr-even' : '-tr-odd');

            if (_classes) {
                for (var t = 0, len = _classes.length; t < len; t++)  {
                    text += ' ' + (tClass + '-tr-' + _classes[t]);
                }
            }
            text += '" data-index="' + index + '" data-server-id="' + serverID + '">';
        } else {
            text = '';
        }
        var k = 1;
        for (var obj in rowData) {
            if (!rowData.hasOwnProperty(obj) ||
                obj.match(/^jQuery/) ||
                typeof rowData[obj] === 'function') {
                continue;
            }

            var attr = options['colAttr' + k] || obj;

            if (attr && attr[0] === '_') {
                if (attr.match(/^_btn/) || options['colAttr' + k]) {
                    var btnText  = '';
                    var btnClass = '';
                    text += '<td class="' + tClass + '-th' + k + '" ' + (options['colWidth' + k] ? 'style="width:' + options['colWidth' + k] + '"' : '') + '>';
                    if (attr.match(/^_btn/)){
                        if (typeof rowData[attr] === 'string') {
                            btnText  = rowData[attr];
                        } else {
                            btnText  = rowData[attr].caption;
                            btnClass = rowData[attr]._class;
                        }
                        if (btnText) {
                            text += '<button data-index="' + index + '" data-server-id="' + serverID + '" class="vis-table-ack-button ' + tClass + '-ack-button ' + (btnClass ? ('-' + btnClass) : '') + '">' + btnText + '</button>';
                        }
                    } else {
                        text += rowData[attr];
                    }

                    text += '</td>';
                    k++;
                }

                continue;
            }

            if (!options.colCount || k <= options.colCount) {
                text += '<td class="' + tClass + '-th' + k + '" ' + (options['colWidth' + k] ? 'style="width:' + options['colWidth' + k] + '"' : '') + '>' + rowData[attr] + '</td>';
            }
            k++;
        }

        if (!noTR) text += '</tr>';

        return text;
    },

    showTable: function  (view, wid, options) {
        var $div = $('#' + wid);
        if (!$div.length) {
            setTimeout(function () {
                vis.binds.table.showTable(view, wid, options);
            }, 100);
            return;
        }
        //vis.binds.table.initTable();
        var tClass = options['class'] || 'tclass';

        // read actual table as json string
        var tableJson = options.table_oid ? vis.states.attr(options.table_oid + '.val') : (options.static_value || '');
        var table = [];
        if (typeof app !== 'undefined' && app.replaceFilePathJson) {
            tableJson = app.replaceFilePathJson(tableJson);
        }
        if (tableJson && typeof tableJson === 'string') {
            try {
                table = JSON.parse(tableJson);
            }
            catch (e) {
                console.log ("showTable: Cannot parse json table");
                table = [];
            }
        } else {
            table = tableJson;
        }

        if (!table) table = [];

        // Create widget container
        var $elem = $('#' + wid);

        // Start creation of table
        var header = '<table class="vis-table-header ' + tClass + '">';
        var text   = '<div class="vis-table-div ' + tClass + '-inner' + ((options.show_scroll) ? ' tclass-inner-overflow' : '') + '"><table class="vis-table-body ' + tClass + '">';
        var headerDone = false;
        var j = 0;
        var selectedId = null;

        if (options.max_rows) options.max_rows = parseInt(options.max_rows);

        // Go through all lines
        for (var ii = 0, ilen = table.length; ii < ilen; ii++) {
            if (!table[ii]) continue;

            var _classes = table[ii]['_class'] ? table[ii]['_class'].split(' ') : null;

            //  Create table header
            if (!headerDone) {
                header += '<tr class="' + tClass + '-th">';
                var k = 1;
                for (var obj in table[ii]) {
                    if (!table[ii].hasOwnProperty(obj) ||
                        obj.match(/^jQuery/) ||
                        typeof table[ii][obj] === 'function') {
                        continue;
                    }

                    var attr = options['colAttr' + k] || obj;

                    if (attr && attr[0] === '_') {
                        if (attr.match(/^_btn/) || options['colAttr' + k]) {
                            header += '<th class="' + tClass + '-th' + k + '" ' + (options['colWidth' + k] ? 'style="width:' + options['colWidth' + k] + '"' : '') + '>' + (options['colName' + k] || '') + '</th>';
                            k++;
                        }
                        continue;
                    }
                    if (!options.colCount || k <= options.colCount) {
                        header += '<th class="' + tClass + '-th' + k + '" ' + (options['colWidth' + k] ? 'style="width:' + options['colWidth' + k] + '"' : '') + '>' + (options['colName' + k] || attr) + '</th>';
                    }
                    k++;
                }
                if (options.show_scroll !== 'false' && options.show_scroll !== false && options.show_scroll !== undefined){
                    // Get the scroll width once
                    if (!vis.binds.table.scrollSize) vis.binds.table.scrollSize = vis.binds.table.getBrowserScrollSize();

                    header += '<td style="width:' + (vis.binds.table.scrollSize.width - 6) + 'px"></td></tr>';
                }
                //header += '</tr>';
                headerDone = true;
            }

            if (_classes &&_classes.indexOf('selected') !== -1) selectedId = ii;

            text += vis.binds.table.createRow(table[ii], wid, options, j, false, ii, table[ii]._id);
            j++;
            if (options.max_rows && j >= options.max_rows) break;
        }
        text += '</table></div>\n';
        header += '</table>\n';

        $elem.find('.vis-table-div').remove();
        $elem.find('.vis-table-header').remove();
        // Insert table into container
        $elem.append((options.hide_header ? '' : header) + text);
        var data = {
            options: options,
            wid:     wid,
            view:    view
        };

        $elem.find('.vis-table-ack-button').unbind('click touchstart').bind('click touchstart', function (e) {
            // Protect against two events
            if (vis.detectBounce(this)) return;

            vis.binds.table.onAckButton.call(this, e);
        });

        // Set additional data for every row
        for (var i = 0, len = table.length; i < len; i++) {
            if (!table[i]) continue;

            $elem.find('.vis-table-ack-button[data-index="' + i + '"]')
                .data('options', {
                        ack_id: table[i]._ack_id || JSON.stringify(table[i]),
                        ack_oid: options.ack_oid
                    });
        }
        // If detailed information desired
        if (options.detailed_wid) {
            // Bind on click event for every row
            $elem.find('.vis-table-row').unbind('click touchstart').bind('click touchstart', function (e) {
                // Protect against two events
                if (vis.detectBounce(this)) return;

                vis.binds.table.onRowClick.call(this, e);
            });

            // Set additional data for every row
            for (i = 0, len = table.length; i < len; i++) {
                if (!table[i]) continue;
                $elem.find('.vis-table-row[data-index="' + i + '"]')
                .data('options', {
                    content:      table[i],
                    detailed_wid: options.detailed_wid,
                    tClass:       tClass,
                    wid:          wid,
                    selected_oid: options.selected_oid,
                });
            }

            if (selectedId) {
                setTimeout (function () {
                    $elem.find('.vis-table-row[data-index="' + selectedId + '"]').trigger('click');
                }, 200);
            }
        } else if (options.selected_oid) {
            $elem.find('.vis-table-row').unbind('click touchstart').bind('click touchstart', function (e) {
                // Protect against two events
                if (vis.detectBounce(this)) return;

                vis.binds.table.onRowClick.call(this, e);
                // Set additional data for every row
                for (i = 0, len = table.length; i < len; i++) {
                    if (!table[i]) continue;
                    $elem.find('.vis-table-row[data-index="' + i + '"]')
                        .data('options', {
                            content:      table[i],
                            wid:          wid,
                            selected_oid: options.selected_oid,
                        });
                }
            });
        }

        // Remember index to calculate even or odd
        data.rowNum = options.new_on_top ? 0 : ((j - 1) >= 0 ? j - 1 : 0);

        function cbNewTable (e, newVal, oldVal) {
            $elem.trigger('newTable', newVal);
        }
        function cbNewEvent (e, newVal, oldVal) {
            $elem.trigger('newEvent', newVal);
        }

        if (!$('#' + wid).data('inited')) {
            $('#' + wid).data('inited', true);
            // New event coming
            $elem.on('newEvent', function (e, newVal) {
                if (e.handled) return;
                e.handled = true;
                var newEvent;
                var data = $(this).data('options');
                // Convert event to json
                if (newVal) {
                    if (typeof newVal === 'string') {
                        try {
                            newEvent = JSON.parse(newVal);
                        }
                        catch (e)
                        {
                            console.log('elem.triggered: Cannot parse json new event ' + newVal);
                            return;
                        }
                    } else {
                        newEvent = newVal;
                    }
                }
                else {
                    return;
                }

                // Try to find, if this event yet exists
                var $row = (newEvent._id !== undefined) ? $(this).find('tr[data-index="' + newEvent._id + '"]') : [];

                // get next row number for new line
                if (!$row.length) data.rowNum++;

                var text = vis.binds.table.createRow(newEvent, data.wid, data.options, data.rowNum, ($row.length > 0), (newEvent._id === undefined) ? data.rowNum : newEvent._id);

                if ($row.length) {
                    $row.html(text).addClass(newEvent._class || '');
                } else {
                    // If add to the top of table
                    if (data.options.new_on_top) {
                        $('#' + this.id).find('.vis-table-body').prepend(text);
                    } else {
                        // Add to the bottom of table
                        $('#' + this.id).find('.vis-table-body').append(text);
                    }
                }
                var $el;
                // If detailed widget desired
                if (data.options.detailed_wid) {
                    $el = $('#' + this.id).find('.vis-table-row[data-index="' + ((newEvent._id === undefined) ? data.rowNum : newEvent._id) + '"]')
                        .data('options', {
                            content:      newEvent,
                            detailed_wid: options.detailed_wid,
                            tClass:       tClass,
                            wid:          wid
                        }).unbind('click touchstart').bind('click touchstart', function (e) {
                            // Protect against two events
                            if (vis.detectBounce(this)) return;

                            vis.binds.table.onRowClick.call(this, e);
                        });
                    $el = $(this).find('.tr_' + ((newEvent._id === undefined) ? data.rowNum : newEvent._id));
                }

                $('#' + this.id).find('.ack_button_' + ((newEvent._id === undefined) ? data.rowNum : newEvent._id))
                    .data('options', {data: newEvent, parent: this, ack_id: newEvent._ack_id || JSON.stringify(newEvent)})
                    .unbind('click touchstart').bind('click touchstart', function (e) {
                        // Protect against two events
                        if (vis.detectBounce(this)) return;

                        vis.binds.table.onAckButton.call(this, e);
                    });
            })
            .on('newTable', function (e, newVal) {
                if (e.handled) return;
                e.handled = true;
                var data = $(this).data('options');
                // Update whole table
                _setTimeout(vis.binds.table.showTable, 50, data.view, data.wid, data.options);
            });
        }
        $('#' + wid).data('options', data);

        if (options.event_oid) {
            if ($('#' + wid).data('binded') !== options.event_oid) {
                $('#' + wid).data('binded', options.event_oid);
                vis.states.bind(options.event_oid + '.val', cbNewEvent);
            }
        } else {
            if ($('#' + wid).data('binded') !== options.table_oid) {
                $('#' + wid).data('binded', options.table_oid);
                vis.states.bind(options.table_oid + '.val', cbNewTable);
            }
        }
    },

    showDialog: function  (view, wid, options) {
        var trigger_value = vis.states.attr(options.trigger_id + '.val');
        // Register callback in dashUI
        if (options.trigger_id) vis.binds.table.registerIds(wid, options.trigger_id);

        // Create widget container
        $('#' + wid).remove();
        $('#visview_' + view).append('<div class="vis-widget ' + (options._class || "") + '" id="' + wid + '" data-oid="' + (options.trigger_id || '') + '" title="'+options.title+'">' +
            '<table  style="margin-left: ' + options.margin_left + 'px;margin-top:' + options.margin_top + 'px"><tr><td>' + (options.image ? '<img src="' + options.image + '"/>': '') + '</td><td>' + options.text + '</td></tr></table>' +
            '</div>');

        var elem = document.getElementById(wid);

        var buttons = {};
        for (var t = 0, len = options.buttons.length; t < len; t++) {
            if (options.buttons[t]) {
                buttons[options.buttons[t]] = {
                    text: options.buttons[t],
                    data: {data: options.buttons[t], trigger_id: options.trigger_id},
                    click: function (evt, ui) {
                        if (1 || !vis.editMode) {
                            if (vis.binds.dialog_trigger_id) {
                                vis.setValue(vis.binds.dialog_trigger_id, evt.currentTarget.textContent);
                            }
                        }
                        $(this).dialog('close');
                    }
                }
            }
        }
        elem._options = options;

        // Disable autofocus in edit mode
        if (vis.editMode) {
            $.ui.dialog.prototype._focusTabbable = function () {
            };
        }

        $(elem).dialog({
            resizable: false,
            height:    options.height || 200,
            width:     options.width || 400,
            autoOpen:  false,
            modal:     (options.modal === true || options.modal === 'true'),
            draggable: false,
            buttons:   buttons
        });

        if ((vis.editMode && options.show) || trigger_value === 'open') {
            $(elem).dialog('open');
            vis.binds.dialog_trigger_id = options.trigger_id;
        }

        elem.triggered = function (objId, _newEvent) {
            if (_newEvent === 'open') {
                $(this).dialog('open');
                vis.binds.dialog_trigger_id = this._options.trigger_id;
            }
        }
    }
};
