/**
 * Copyright (c) 2014 Steffen Schorling http://github.com/smiling-Jack
 * Lizenz: [CC BY-NC 3.0](http://creativecommons.org/licenses/by-nc/3.0/de/)
 */

var fm_scriptEls = document.getElementsByTagName('script');
var fm_thisScriptEl = fm_scriptEls[fm_scriptEls.length - 1];
var fm_Folder = fm_thisScriptEl.src.substr(0, fm_thisScriptEl.src.lastIndexOf('/') + 1);

//$("head").append('<script type="text/javascript" src="../lib/js/dropzone.js"></script>');
$("head").append('<link rel="stylesheet" href="'+fm_Folder+'fm.css"/>');


(function ($) {

    $.fm = function (options, callback) {
        var fm_con;
        if (typeof SGI != "undefined") {
            fm_con = SGI.socket
        } else if ( typeof servConn != "undefined") {
            fm_con = servConn._socket;
        }
        jQuery.event.props.push('dataTransfer');
        var o = {
            lang: options.lang || "de",                              // de, en , ru
            root: options.root || "",                                // zb. "www/"
            path: options.path || "/",                               // zb. "www/dashui/"
            file_filter: options.file_filter || [],
            folder_filter: options.folder_filter || false,
            view: options.view || "table",                           // table , list
            mode: options.mode || "show",                            // open , save ,show
            data: "1",
            audio: ["mp3", "wav", "ogg"],
            img: ["gif","png", "bmp", "jpg", "jpeg", "tif", "svg"],
            icons: ["zip", "prg", "js", "css", "mp3", "wav"]
//            save_data : options.save_data,
//            save_mime : options.save_mime
        };

        var uploadArray = [];
        var sel_file = "";
        var sel_type = "";

        var fm_word = {
            'sort this column'                  : {'de': 'Spalte sortieren',               'en': 'sort this column',            'ru': 'Сортировать'},
            'Datei Manager'                     : {'de': 'Datei Manager',                  'en': 'File Manager',                'ru': 'Проводник'},
            'Zurück'                            : {'de': 'Zurück',                         'en': 'Back',                        'ru': 'Назад'},
            'Refresh'                           : {'de': 'Aktualisieren',                  'en': 'Refresh',                     'ru': 'Обновить'},
            'Neuer Ordner'                      : {'de': 'Neuer Ordner',                   'en': 'New Folder',                  'ru': 'Новая папка'},
            'Upload'                            : {'de': 'Upload',                         'en': 'Upload',                      'ru': 'Загрузить'},
            'Download'                          : {'de': 'Download',                       'en': 'Download',                    'ru': 'Скачать'},
            'Umbenennen'                        : {'de': 'Umbenennen',                     'en': 'Rename',                      'ru': 'Переименовать'},
            'Löschen'                           : {'de': 'Löschen',                        'en': 'Delete',                      'ru': 'Удалить'},
            'Listen Ansicht'                    : {'de': 'Listen Ansicht',                 'en': 'List View',                   'ru': 'Список'},
            'Icon Ansicht'                      : {'de': 'Vorschau',                       'en': 'Preview',                     'ru': 'Предпросмотр'},
            'Play'                              : {'de': 'Play',                           'en': 'Play',                        'ru': 'Воспр.'},
            'Stop'                              : {'de': 'Stop',                           'en': 'Stop',                        'ru': 'Стоп'},
            'Alle Datein anzeigen'              : {'de': 'Alle Datein anzeigen',           'en': 'Show all files',              'ru': 'Показать все'},
            'Datei Name:'                       : {'de': 'Datei Name:',                    'en': 'Filename:',                   'ru': 'Имя файла: '},
            'Speichern'                         : {'de': 'Speichern',                      'en': 'Save',                        'ru': 'Сохранить'},
            'Öffnen'                            : {'de': 'Öffnen',                         'en': 'Open',                        'ru': 'Открыть'},
            'Abbrechen'                         : {'de': 'Abbrechen',                      'en': 'Cancel',                      'ru': 'Отмена'},
            'Upload to'                         : {'de': 'Upload nach',                    'en': 'Upload to',                   'ru': 'Загрузить в'},
            'Dropbox'                           : {'de': 'Dropbox',                        'en': 'Dropbox',                     'ru': 'Dropbox'},
            'Hier Datein reinziehen'            : {'de': 'Hier Datein reinziehen',         'en': 'Drop files here',             'ru': 'Перетяните файлы сюда'},
            'Schliesen'                         : {'de': 'Schliesen',                      'en': 'Close',                       'ru': 'Закрыть'},
            'OK'                                : {'de': 'OK',                             'en': 'OK',                          'ru': 'Ok'},
            'Ordner erstellen nicht möglich'    : {'de': 'Ordner erstellen nicht möglich', 'en': 'Failed to create folder ',    'ru': 'Невозможно создать папку'},
            'Neuer Name'                        : {'de': 'Neuer Name',                     'en': 'New name',                    'ru': 'Новое имя'},
            'Rename nicht möglich'              : {'de': 'Rename nicht möglich',           'en': 'Rename failed',               'ru': 'Невозможно переименовать'},
            'Löschen nicht möglich'             : {'de': 'Löschen nicht möglich',          'en': 'Delete failed',               'ru': 'Невозможно удалить'},
            'no_con'                            : {'de': 'Keine Verbindung zu CCU.IO',     'en': 'Can not connect to CCU.IO',   'ru': 'Нет соединения с CCU.IO'},
            'Name'                              : {'de': 'Name',                           'en': 'Name',                        'ru': 'Имя'},
            'Type'                              : {'de': 'Type',                           'en': 'Type',                        'ru': 'Тип'},
            'Size'                              : {'de': 'Größe',                          'en': 'Size',                        'ru': 'Размер'},
            'Datum'                             : {'de': 'Datum',                          'en': 'Date',                        'ru': 'Дата'}

        };

        function fm_translate(text) {

            if (fm_word[text]) {
                if (fm_word[text][o.lang]) {
                    return fm_word[text][o.lang];

                } else if (fm_word[text]["de"])
                    console.warn(text);
                return fm_word[text]["de"];
            } else {
                console.warn(text);
                return text;
            }
        }

        function load(path) {
            try {
                fm_con.emit("readdirStat", path, function (data) {
                    o.data = data;
                    var p = path.replace(o.root, "");
                    $(".fm_path").text("Pfad: " + p);
                    build(o);
                });
            } catch (err) {
                alert("Keine Verbindung zu CCU.IO");
            }
        }

        function build(o) {

            $(".fm_files").empty();
            $("#fm_table_head").remove();
            $("#fm_bar_play, #fm_bar_stop, #fm_bar_down, #fm_bar_del").button("disable");

            if (o.data != undefined && o.view == "table") {

                $('<div id="fm_table_head">' +
                    ' <button id="fm_table_head_name" >' + fm_translate("Name") + '</button>' +
                    ' <button id="fm_table_head_type" >' + fm_translate("Type") + '</button>' +
                    ' <button id="fm_table_head_size" >' + fm_translate("Size") + '</button>' +
                    ' <button id="fm_table_head_datum" >' + fm_translate("Datum") + '</button>' +
                    '</div>').insertAfter(".fm_path");

                $("#fm_table_head_name").button({icons: {primary: "ui-icon-carat-2-n-s"}}).click(function () {
                    $("#fm_th_name").trigger("click")
                });
                $("#fm_table_head_type").button({icons: {primary: "ui-icon-carat-2-n-s"}}).click(function () {
                    $("#fm_th_type").trigger("click")
                });
                $("#fm_table_head_size").button({icons: {primary: "ui-icon-carat-2-n-s"}}).click(function () {
                    $("#fm_th_size_roh").trigger("click")
                });
                $("#fm_table_head_datum").button({icons: {primary: "ui-icon-carat-2-n-s"}}).click(function () {
                    $("#fm_th_datum").trigger("click")
                });

                $(".fm_files").append(
                        '<table id="fm_table"  width="560px">' +
                        ' <tbody width="560px" class="fm_file_table">' +
                        '  <tr id="fm_tr_head" class="ui-state-default ui-corner-top">' +
                        '   <th id="fm_th_icon"  class="fm_th" width="24px"></td>' +
                        '   <th id="fm_th_name" class="fm_th" >' + fm_translate("Name") + '</td>' +
                        '   <th id="fm_th_type" class="fm_th" class="fm_td_hide">' + fm_translate("Type") + '</td>' +
                        '   <th id="fm_th_size_roh" class="fm_th" class="fm_td_hide">Size_roh</td>' +
                        '   <th id="fm_th_size" class="fm_th"  style="text-align:right" width="70px">' + fm_translate("Size") + '</td>' +
                        '   <th id="fm_th_datum" class="fm_th" style="text-align:right" width="220px">' + fm_translate("Datum") + '</td>' +
                        '   <th class="fm_th" width="10px"></td>' +
                        '  </tr>' +
                        ' </tbody>' +
                        '</table>');

                $.each(o.data, function () {

                    function formatBytes(bytes) {
                        if (bytes < 1024) return bytes + " B";
                        else if (bytes < 1048576) return(bytes / 1024).toFixed(0) + " KB";
                        else if (bytes < 1073741824) return(bytes / 1048576).toFixed(0) + " MB";
                        else return(bytes / 1073741824).toFixed(0) + " GB";
                    }

                    if (this.stats.nlink > 1) {
                        var date = this.stats.ctime.split("T")[0];
                        var time = this.stats.ctime.split("T")[1].split(".")[0];
                        var type = this.file.split(".")[1] || "";
                        var filter = "fm_folder_filter";

                        $(".fm_file_table").append(
                                '<tr class="fm_tr_folder ' + filter + ' fm_tr ui-state-default no_background">' +
                                '<td width="24px"><img src="' + fm_Folder + '/icon/mine/24/folder-brown.png"/></td>' +
                                '<td>' + this.file + '</td>' +
                                '<td class="fm_td_hide">' + type + '</td>' +
                                '<td class="fm_td_hide">' + 0 + '</td>' +
                                '<td style="text-align:right" width="100px"></td>' +
                                '<td style="text-align:right ;margin-right: 20px" width="220px">' + date + ' ' + time + '</td>' +
                                '<th class="fm_th" width="10px"></td>' +
                                '</tr>');
                    } else {

                        var date = this.stats.ctime.split("T")[0];
                        var time = this.stats.ctime.split("T")[1].split(".")[0];
                        var type = this.file.split(".").pop() || "";
                        var icons = ["zip", "prg", "js", "png", "svg", "jpg", "gif", "bmp", "css", "mp3", "wav"];
                        var icon = "undef";
                        var filter = "";

                        if (icons.indexOf(type) > -1) {
                            icon = type
                        }
                        if (o.file_filter.indexOf(type) == -1) {
                            filter = "fm_file_filter"
                        }

                        $(".fm_file_table").append(
                                '<tr class="fm_tr_file ' + filter + ' fm_tr ui-state-default no_background">' +
                                '<td width="24px"><img src="' + fm_Folder + '/icon/mine/24/' + icon + '.png"/></td>' +
                                '<td>' + this.file + '</td>' +
                                '<td class="fm_td_hide">' + type + '</td>' +
                                '<td class="fm_td_hide">' + this.stats.size + '</td>' +
                                '<td style="text-align:right" width="100px">' + formatBytes(this.stats.size) + '</td>' +
                                '<td style="text-align:right ;margin-right: 20px" width="220px">' + date + ' ' + time + '</td>' +
                                '<th class="fm_th" width="10px"></td>' +
                                '</tr>');
                    }
                });

                $("#fm_th_name, #fm_th_type, #fm_th_size, #fm_th_datum")
                    .mouseenter(function () {
                        $(this).addClass("ui-state-focus")
                    })
                    .mouseleave(function () {
                        $(this).removeClass("ui-state-focus")
                    })
                    .click(function () {
                        $(this).effect("highlight")
                    });

                // sort Table _____________________________________________________
                var table = $('#fm_table');
                $('#fm_th_name, #fm_th_type, #fm_th_size_roh, #fm_th_datum')
                    .wrapInner('<span title="' + fm_translate("sort this column") + '"/>')
                    .each(function () {
                        var th = $(this),
                            thIndex = th.index(),
                            inverse = false;
                        th.click(function () {
                            table.find('td').filter(function () {
                                return $(this).index() === thIndex;
                            }).sortElements(function (a, b) {

                                if (parseInt($(a).text())) {
                                    return parseInt($.text([a])) > parseInt($.text([b])) ?
                                        inverse ? -1 : 1
                                        : inverse ? 1 : -1;
                                } else {

                                    return $.text([a]).toLowerCase() > $.text([b]).toLowerCase() ?
                                        inverse ? -1 : 1
                                        : inverse ? 1 : -1;
                                }

                            }, function () {
                                return this.parentNode;
                            });
                            inverse = !inverse;
                        });
                    });
                $("#fm_th_name").trigger("click");
                $("#fm_th_type").trigger("click");

                // sort Table----------------------------------------------------------

                $(".fm_tr > *").click(function (e) {

                    $(".fm_table_selected").addClass("ui-state-default no_background");
                    $(".fm_table_selected").removeClass("fm_table_selected ui-state-highlight");
                    if ($(e.target).hasClass("fm_tr")) {
                        $(this).addClass("fm_table_selected ui-state-highlightt");
                        $(this).removeClass("ui-state-default no_background");
                    } else {
                        $(this).parent(".fm_tr").addClass("fm_table_selected ui-state-highlight");
                        $(this).parent(".fm_tr").removeClass("ui-state-default no_background");
                    }

                    var type = $($(".fm_table_selected").children().toArray()[2]).text();
                    var name = $($(".fm_table_selected").children().toArray()[1]).text();

                    if (type == "") {
                        sel_type = "folder";
                        sel_file = name;
                        $("#fm_bar_down").button("disable");
                        $("#fm_bar_del").button("enable");

                    } else {
                        sel_type = "file";
                        sel_file = name;
                        $("#fm_inp_save").val(sel_file.split(".")[0]);
                        $("#fm_bar_down").button("enable");
                        $("#fm_bar_del").button("enable");
                    }

                    if (o.audio.indexOf(type) > -1) {
                        $("#fm_bar_play , #fm_bar_stop").button("enable")
                    } else {
                        $("#fm_bar_play, #fm_bar_stop").button("disable");
                    }
                });

                $(".fm_tr_folder").dblclick(function () {
                    o.path += $((this).children[1]).text() + "/";
                    load(o.path)
                });

                if (document.getElementById("script_scrollbar")) {
                    $(".fm_files").css({
                        height: "auto",
                        overflow: "visible"
                    });
                    $('#fm_scroll_pane').css({
                        height: "calc(100% - 187px) ",
                        scrollTop: 0
                    });
                    $('#fm_scroll_pane').scrollTop(0);
                    $('#fm_scroll_pane').perfectScrollbar('update');

                } else {
                    $(".fm_files").css({
                        height: "calc(100% - 188px) "
                    });
                }
            }

            if (o.data != undefined && o.view == "prev") {

                $.each(o.data, function () {

                    if (this.stats.nlink > 1) {
                        var type = "_";
                        $(".fm_files").append(
                                '<div class="fm_prev_container fm_folder_filter" data-sort="' + type + '">' +
                                '<div class="fm_prev_img_container"><img class="fm_prev_img" src="' + fm_Folder + '/icon/mine/128/folder-brown.png"/></div>' +
                                '<div class="fm_prev_name">' + this.file + '</div>' +
                                '<div class="fm_prev_overlay"></div>' +
                                '</div>')

                    } else {
                        var name = this.file.split(".")[0];
                        var type = this.file.split(".")[1] || "";
                        var icon = "undef";
                        var filter = "";
                        if (o.file_filter.indexOf(type) == -1) {
                            filter = "fm_file_filter"
                        }

                        if (name.length > 0) {
                            if (o.img.indexOf(type) > -1) {

                                var path = o.path.split("www")[1];

                                $(".fm_files").append(
                                        '<div class="fm_prev_container ' + filter + '" data-sort="' + type + '">' +
                                        '<div class="fm_prev_img_container"><img class="fm_prev_img" src="' + path + this.file + '"/></div>' +
                                        '<div class="fm_prev_name">' + this.file + '</div>' +
                                        '<div class="fm_prev_overlay"></div>' +
                                        '</div>')

                            } else {
                                if (o.icons.indexOf(type) > -1) {
                                    icon = type
                                }

                                $(".fm_files").append(
                                        '<div class="fm_prev_container ' + filter + '" data-sort="' + type + '">' +
                                        '<div class="fm_prev_img_container"><img class="fm_prev_img" src="' + fm_Folder + '/icon/mine/128/' + icon + '.png"/></div>' +
                                        '<div class="fm_prev_name">' + this.file + '</div>' +
                                        '<div class="fm_prev_overlay"></div>' +
                                        '</div>')
                            }
                        }
                    }
                });

                var div = $('.fm_files');
                var listitems = div.children('.fm_prev_container').get();
                listitems.sort(function (a, b) {

                    return ($(a).attr('data-sort') < $(b).attr('data-sort')) ?
                        -1 : ($(a).attr('data-sort') > $(b).attr('data-sort')) ?
                        1 : 0;
                });

                $.each(listitems, function (idx, itm) {
                    div.append(itm);
                });

                if (document.getElementById("script_scrollbar")) {

                    $(".fm_files").css({
                        height: "auto",
                        overflow: "visible"
                    });
                    $('#fm_scroll_pane').css({
                        height: "calc(100% - 150px) ",
                        scrollTop: 0
                    });
                    $('#fm_scroll_pane').scrollTop(0);
                    $('#fm_scroll_pane').perfectScrollbar('update');

                } else {
                    $(".fm_files").css({
                        height: "calc(100% - 151px)"
                    });
                }

                $(".fm_prev_overlay").click(function () {
                    var type = $(this).parent().data("sort");

                    $(".fm_prev_selected").removeClass("fm_prev_selected");
                    $(this).addClass("fm_prev_selected");

                    if (type == "_") {
                        sel_type = "folder";
                        sel_file = $(this).prev().text();

                        $("#fm_bar_down").button("disable");
                        $("#fm_bar_del").button("enable");

                    } else {
                        sel_type = "file";
                        sel_file = $(this).prev().text();
                        $("#fm_inp_save").val(sel_file.split(".")[0]);
                        $("#fm_bar_down").button("enable");
                        $("#fm_bar_del").button("enable");

                    }

                    if (o.audio.indexOf(type) > -1) {
                        $("#fm_bar_play , #fm_bar_stop").button("enable")
                    } else {
                        $("#fm_bar_play, #fm_bar_stop").button("disable");
                    }
                });

                $(".fm_prev_overlay").dblclick(function () {
                    var type = $(this).parent().data("sort");

                    if (type == "_") {
                        o.path += $(this).prev().text() + "/";
                        load(o.path)
                    }
                });
            }

            if ($("#fm_bar_all").hasClass("ui-state-error")) {
                $(".fm_folder_filter").show();
                $(".fm_file_filter").show();
            } else {
                $(".fm_file_filter").hide();
                if (o.folder_filter == true) {
                    $(".fm_folder_filter").hide();
                }
            }

            if (o.view == "prev" && $("#fm_bar_all").hasClass("ui-state-error")) {
                $(".fm_file_filter").css({display: "inline-table"})
            }

            if (o.path == o.root) {

                $("#fm_bar_back").trigger("mouseleave");
                $("#fm_bar_back").button("option", "disabled", true)
            } else {
                $("#fm_bar_back").button("option", "disabled", false)
            }
        }

        $("body").append(
                '<div id="dialog_fm" class="fm_dialog" style="text-align: center" title="' + fm_translate("Datei Manager") + '">' +
                '<input class="focus_dummy" style="border:none;height: 1px;padding: 1px;width: 1px;background: transparent; display: flex;" type="button"/>' +
                '<div class="fm_iconbar ui-state-default ui-corner-all">' +
                '<div class="fm_bar_back_behind"></div>' +
                '<button id="fm_bar_back"    style="background-image: url(' + fm_Folder + 'icon/Circle-left-icon.png)"                                                                   title="' + fm_translate("Zurück") + '"/>' +
                '<img src="' + fm_Folder + '/icon/actions/refresh.png"       id="fm_bar_refresh"          style="margin-left:40px"   class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fm_translate("Refresh") + '" />' +
                '<img src="' + fm_Folder + '/icon/actions/folder-new-7.png"  id="fm_bar_addfolder"         style="margin-left:20px"   class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fm_translate("Neuer Ordner") + '" />' +
                '<img src="' + fm_Folder + '/icon/actions/up.png"            id="fm_bar_add"              style=""                    class="fm_bar_icon ui-corner-all ui-state-default" title="' + fm_translate("Upload") + '" />' +
                '<img src="' + fm_Folder + '/icon/actions/down.png"          id="fm_bar_down"                                        class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fm_translate("Download") + '"/>' +
                '<img src="' + fm_Folder + '/icon/actions/edit-rename.png"   id="fm_bar_rename"                                      class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fm_translate("Umbenennen") + '"/>' +
                '<img src="' + fm_Folder + '/icon/actions/delete.png"        id="fm_bar_del"                                         class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fm_translate("Löschen") + '"/>' +
                '<img src="' + fm_Folder + '/icon/actions/list.png"          id="fm_bar_list"             style=" margin-left:20px"  class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fm_translate("Listen Ansicht") + '"/>' +
                '<img src="' + fm_Folder + '/icon/actions/icons.png"         id="fm_bar_prev"                                        class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fm_translate("Icon Ansicht") + '"/>' +
                '<img src="' + fm_Folder + '/icon/actions/play.png"          id="fm_bar_play"             style=" margin-left:20px"  class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fm_translate("Play") + '"/>' +
                '<img src="' + fm_Folder + '/icon/actions/stop.png"          id="fm_bar_stop"                                        class="fm_bar_icon ui-corner-all ui-state-default"  title="' + fm_translate("Stop") + '"/>' +
                '<button  id="fm_bar_all" class="fm_bar_all" title="' + fm_translate("Alle Datein anzeigen") + '"></button>' +
                '</div>' +
                '<div class="fm_path ui-state-default no_background">' +
                '</div>' +
                '<div class="fm_files ui-state-default no_background">' +
                '</div>' +
                '<div class="fm_buttonbar">' +
                '<div id="fm_save_wrap">' +
                '<div>' + fm_translate("Datei Name:") + '</div>' +
                '<input type="text" id="fm_inp_save">' +
                '</div>' +
                '<div id="fm_btn_wrap">' +
                '<button id="fm_btn_save" >' + fm_translate("Speichern") + '</button>' +
                '<button id="fm_btn_open" >' + fm_translate("Öffnen") + '</button>' +
                '<button id="fm_btn_cancel" >' + fm_translate("Abbrechen") + '</button>' +
                '</div>' +
                '</div>' +
                '</div>');

        $("#dialog_fm").dialog({
            height: $(window).height() - 100,
            width: 835,
            minWidth: 672,
            minHeight: 300,
            resizable: true,
            modal: true,
            close: function () {
                $("#dialog_fm").remove();
            }
        });

        if (o.mode == "show") {
            $(".fm_buttonbar").hide()
        }
        if (o.mode == "save") {
            $("#fm_btn_open").hide()
        }
        if (o.mode == "open") {
            $("#fm_save_wrap").hide();
            $("#fm_btn_save").hide()
        }

        $(".fm_bar_icon").button();
        $("#fm_bar_back")
            .button()
            .click(function () {
                var path_arry = o.path.split("/");
                path_arry.pop();
                path_arry.pop();
                if (path_arry.length == 0) {
                    o.path = "";
                } else {
                    o.path = path_arry.join("/") + "/";
                }
                if (o.path == o.root) {

                    $("#fm_bar_back").trigger("mouseleave");

                    $("#fm_bar_back").button("option", "disabled", true)

                }
                load(o.path)
            });

//        $("#fm_bar_play, #fm_bar_stop, #fm_bar_down").button("disable");

        if (document.getElementById("script_scrollbar")) {
            $(".fm_files").wrap('<div id="fm_scroll_pane" class="ui-state-default no_background"></div>');

            $(".fm_files").css({
                minHeight: "100%",
                height: "auto",
                width: "calc(100% - 4px)",
                border: "none"
            });

            $("#fm_scroll_pane").perfectScrollbar({
                wheelSpeed: 40,
                suppressScrollX: true
            });
        }
        if (o.folder_filter == false) {
            $("#fm_bar_folder").addClass("ui-state-error")
        }

        load(o.path);

        $("#fm_bar_all")
            .button({
                icons: {
                    primary: "ui-icon-gear"
                }
            })
            .click(function () {

                $(this).toggleClass("ui-state-error");
                if ($(this).hasClass("ui-state-error")) {

                    $(".fm_file_filter").show();
                    $(".fm_folder_filter").show();
                    if (o.view == "prev") {
                        $(".fm_file_filter").css({display: "inline-table"})
                    }
                } else {
                    $(".fm_file_filter").hide();
                    if (o.folder_filter == true) {
                        $(".fm_folder_filter").hide();
                    }
                }
                $(this).removeClass("ui-state-focus")
            });

        $(".fm_bar_icon")
            .mouseenter(function () {
                $(this).addClass("ui-state-focus")
            })
            .mouseleave(function () {
                $(this).removeClass("ui-state-focus")
            })
            .click(function () {
                var id = $(this).attr("id");


//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                if (id == "fm_bar_refresh") {
                    load(o.path)
                }
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                if (id == "fm_bar_add") {

                    $('#dialog_fm').append(
                            '<div id="dialog_fm_add" title="' + fm_translate("Upload to") + ' ' + $(".fm_path").text() + '">' +
                            '<div id="fm_add_dropzone" ondragover="return false" class="dropzone ui-corner-all ui-state-highlight">' +
                            '<p class="fm_dropbox_text">' + fm_translate("Dropbox") + '<br>' + fm_translate("Hier Datein reinziehen") + ' </p>' +
                            '</div>' +
                            '<div class="fm_add_buttonbar">' +
                            '    <button id="btn_fm_add_ok">' + fm_translate("Upload") + '</button>' +
                            '    <button id="btn_fm_add_close" >' + fm_translate("Schliesen") + '</button>' +
                            '</div>' +
                            '<input type="file" id="fm_open_file" style="height: 0; width: 0 "/>' +
                            '</div>');

                    $('#dialog_fm_add').dialog({
                        dialogClass: "dialog_fm_add",
                        resizable: false,
                        draggable: false,
                        close: function () {
                            $('#dialog_fm_add').remove()
                        }
                    });

                    var files = [];

                    $("#fm_dropbox_text").click(function () {
                        $("#fm_open_file").trigger("click");
                    });

                    $('#fm_add_dropzone').bind('drop', function (e) {
                        try {

                            $.each(e.dataTransfer.files, function () {
                                files.push(this)
                            });

                            $('.dialog_fm_add > *').css({cursor: "wait"})

                            function read() {

                                var reader = new FileReader();
                                reader.onload = function () {
                                    uploadArray.push({name: files[0].name, value: reader.result});


                                    var type = files[0].name.split(".").pop();
                                    var icon = "undef";
                                    var class_name = files[0].name.split(".")[0].replace(" ", "_");

                                    if (o.img.indexOf(type) > -1) {


                                        $("#fm_add_dropzone").append(
                                                '<div class="fm_prev_container ' + class_name + '" data-file="' + files[0].name + '">' +
                                                '<div class="fm_prev_img_container"><img class="fm_prev_img" src="' + reader.result + '"/></div>' +
                                                '<div class="fm_prev_name">' + files[0].name + '</div>' +
                                                '<div class="fm_prev_overlay"></div>' +
                                                '</div>');

                                    } else {
                                        if (o.icons.indexOf(type) > -1) {
                                            icon = type
                                        }

                                        $("#fm_add_dropzone").append(
                                                '<div class="fm_prev_container ' + class_name + '" data-file="' + files[0].name + '">' +
                                                '<div class="fm_prev_img_container"><img class="fm_prev_img" src="' + fm_Folder + '/icon/mine/128/' + icon + '.png"/></div>' +
                                                '<div class="fm_prev_name">' + files[0].name + '</div>' +
                                                '<div class="fm_prev_overlay"></div>' +
                                                '</div>');
                                    }
                                    files.shift();
                                    if (files.length > 0) {
                                        read()
                                    } else {
                                        $('.dialog_fm_add > *').css({cursor: "default"})
                                    }
                                };
                                reader.readAsDataURL(files[0]);
                            }
                            read();
                            return false;

                        }
                        catch (err) {
                            alert(err);
                            return false;
                        }
                    });
                    try {
                        $("#btn_fm_add_ok").button().click(function () {
                            function upload() {
                                try {
                                    fm_con.emit("writeBase64", o.path + uploadArray[0].name, uploadArray[0].value.split("base64,")[1], function (data) {

                                        // TODO Leerzeichem im Dateinmaen Berucksichtigen (da in classen keine leertzeichen sein dürfen)
                                        var class_name = uploadArray[0].name.split(".")[0].replace(" ", "_");
                                        $("." + class_name).remove();

                                        uploadArray.shift()
                                        if (uploadArray.length > 0) {

                                            upload()
                                        } else {
                                            $('.dialog_fm_add > *').css({cursor: "default"})
                                        }

                                    });

                                } catch
                                    (err) {
                                    console.log(err);
                                    $('.dialog_fm_add > *').css({cursor: "default"})
                                }
                            }

                            $('.dialog_fm_add > *').css({cursor: "wait"});
                            upload()
                        });

                        $("#btn_fm_add_close").button().click(function () {
                            $('#dialog_fm_add').remove()
                        });
                    } catch (err) {
                        alert(err)
                    }
                }
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                if (id == "fm_bar_addfolder") {
                    try {

                        $('#dialog_fm').append(
                                '<div id="dialog_fm_folder" style="text-align:center" title="' + fm_translate("Neuer Ordner") + '">' +
                                '<br>' +
                                '<input type="text" id="fm_inp_folder" style="width: 360px" value=""/>' +
                                '<br><br><button style="width: 150px;" id="fm_btn_folder">' + fm_translate("OK") + '</button>' +
                                '</div>');

                        $('#dialog_fm_folder').dialog({
                            dialogClass: "dialog_fm_rename",
                            resizable: false,
                            draggable: false,
                            modal: true,
                            close: function () {
                                $('#dialog_fm_folder').remove()
                            }
                        });

                        $("#fm_btn_folder").button().click(function () {
                            var new_folder = $("#fm_inp_folder").val();
                            $('#dialog_fm_folder').remove();

                            if (new_folder != "" || new_folder != undefined) {
                                fm_con.emit("mkDir", o.path + new_folder, function (ok) {
                                    if (ok != true) {
                                        console.log(ok);
                                        alert(fm_translate("Ordner erstellen nicht möglich"));
                                    } else {
                                        load(o.path)
                                    }
                                });
                            }
                        })
                    } catch (err) {
                        alert(err)
                    }

                }
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                if (id == "fm_bar_down") {
                    try {
                        fm_con.emit("readBase64", o.path + sel_file, function (data) {
                            console.log(data)
                            $("body").append('<a id="fm_download" href=" data:' + data["mime"] + ';base64,' + data["data"] + '" download="' + sel_file + '"></a>')
                            document.getElementById('fm_download').click();
                            document.getElementById('fm_download').remove();
                        });
                    } catch (err) {
                        alert(err)
                    }
                }
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                if (id == "fm_bar_rename") {
                    try {
                        $('#dialog_fm').append(
                                '<div id="dialog_fm_rename" style="text-align:center" title="' + fm_translate("Neuer Name") + '">' +
                                '<br>' +
                                '<input type="text" id="fm_inp_rename" style="width: 360px" value="' + sel_file + '"/>' +
                                '<br><br><button style="width: 150px;" id="fm_btn_rename">' + fm_translate("OK") + '</button>' +
                                '</div>');

                        $('#dialog_fm_rename').dialog({
                            dialogClass: "dialog_fm_rename",
                            resizable: false,
                            draggable: false,
                            modal: true,
                            close: function () {
                                $('#dialog_fm_rename').remove()
                            }
                        });

                        $("#fm_btn_rename").button().click(function () {
                            var new_name = $("#fm_inp_rename").val();
                            $('#dialog_fm_rename').remove()

                            if (new_name != "" || new_name != undefined) {
                                fm_con.emit("rename", o.path + sel_file, o.path + new_name, function (ok) {

                                    console.log(ok)
                                    if (ok != true) {
                                        console.log(ok)
                                        alert(fm_translate("Rename nicht möglich"));
                                    } else {
                                        load(o.path)
                                    }
                                });
                            }
                        })
                    } catch (err) {
                        alert(err)
                    }
                }
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                if (id == "fm_bar_del") {
                    try {
                        fm_con.emit("removeRecursive", o.path + sel_file, function (ok) {
                            if (ok != true) {
                                console.log(ok)
                                alert(fm_translate("Löschen nicht möglich"));
                            }
                            load(o.path)
                        })
                    } catch (err) {
                        alert("ordner \n" + err)
                    }

                }
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                if (id == "fm_bar_list") {
                    o.view = "table";
                    build(o)
                }
                if (id == "fm_bar_prev") {
                    o.view = "prev";
                    build(o)
                }
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                if (id == "fm_bar_play") {
                    if (document.getElementById('fm_sound_play')) {
                        document.getElementById('fm_sound_play').remove()
                    }
                    $("#dialog_fm").append('<audio id="fm_sound_play" src="' + o.path.split("www")[1] + sel_file + '"></audio>');
                    document.getElementById('fm_sound_play').play();

                }
                if (id == "fm_bar_stop") {
                    document.getElementById('fm_sound_play').remove()
                }
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

                $(this).effect("highlight")
            });


        $("#fm_btn_cancel").button().click(function () {
            $("#dialog_fm").remove();
        });

        $("#fm_btn_open").button().click(function () {
            $("#dialog_fm").remove();
            return callback({
                path: o.path,
                file: sel_file
            })
        });
        $("#fm_btn_save").button().click(function () {
            var file = $("#fm_inp_save").val();
            $("#dialog_fm").remove();
            return callback({
                path: o.path,
                file: file
            });
        });
    }
})
(jQuery);

jQuery.fn.sortElements = (function () {
    var sort = [].sort;
    return function (comparator, getSortable) {
        getSortable = getSortable || function () {
            return this;
        };
        var placements = this.map(function () {
            var sortElement = getSortable.call(this),
                parentNode = sortElement.parentNode,
            // Since the element itself will change position, we have
            // to have some way of storing it's original position in
            // the DOM. The easiest way is to have a 'flag' node:
                nextSibling = parentNode.insertBefore(
                    document.createTextNode(''),
                    sortElement.nextSibling
                );
            return function () {
                if (parentNode === this) {
                    throw new Error(
                        "You can't sort elements if any one is a descendant of another."
                    );
                }
//                Insert before flag:
                parentNode.insertBefore(this, nextSibling);
                // Remove flag:
                parentNode.removeChild(nextSibling);
            };
        });
        return sort.call(this, comparator).each(function (i) {
            placements[i].call(getSortable.call(this));
        });
    };
})();


