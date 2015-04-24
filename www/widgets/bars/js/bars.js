// Init words
/* jshint -W097 */// jshint strict:false
/* jshint browser:true */

"use strict";

_("");
// Add words for bars
if (vis.editMode) {
    $.extend(true, systemDictionary, {
        // Bars
        "One at time:"     : {"en" : "One at time:",  "de": "Nur eine auswahlbar:","ru": "Только один фильтр:"},
        "Geometry..."      : {"en" : "Geometry...",   "de": "Geometrie...",        "ru": "Позиция и размер..."},
        "Show"             : {"en" : "Show",          "de": "Zeigen",              "ru": "Показать"},
        "Bar type:"        : {"en" : "Bar type:",     "de": "Bartyp:",             "ru": "Тип:"},
        "Button width:"    : {"en" : "Button width:", "de": "Knopfbreite:",        "ru": "Ширина кнопок:"},
        "Button height:"   : {"en" : "Button height:","de": "Knopfh&ouml;he:",     "ru": "Высота кнопок:"},
        "bSpace"           : {"en" : "Button space:", "de": "Zwischenplatz:",      "ru": "Промежуток:"},
        "bRadius"          : {"en" : "Border radius:","de": "Randradius:",         "ru": "Радиус закруглений:"},
        "Text offset %:"   : {"en" : "Text offset %:","de": "Textoffset in %:",    "ru": "Смещение текста в %:"},
        "bTextAlign"       : {"en" : "Text align:",   "de": "Textausrichtung:",    "ru": "Позиция текста:"},
        "Image align:"     : {"en" : "Image align:",  "de": "Bildausrichtung:",    "ru": "Позиция миниатюры:"},
        "Effects..."       : {"en" : "Effects...",    "de": "Effekte...",          "ru": "Эффекты..."},
        "Hide effect:"     : {"en" : "Hide effect:",  "de": "Verbergeneffekt:",    "ru": "Исчезновение:"},
        "Show effect:"     : {"en" : "Show effect:",  "de": "Anzeigeeffekt:",      "ru": "Появление:"},
        "Test"             : {"en" : "Test",          "de": "Test",                "ru": "Тест"},
        "Buttons..."       : {"en" : "Buttons...",    "de": "Kn&ouml;pfe",         "ru": "Кнопки..."},
        "Icon:"            : {"en" : "Icon:",         "de": "Bildchen:",           "ru": "Миниатюра:"},
        "Caption:"         : {"en" : "Caption:",      "de": "Beschriftung:",       "ru": "Подпись:"},
        "Filter key:"      : {"en" : "Filter key:",   "de": "Filterwort:",         "ru": "Значение фильтра:"},
        "Add"              : {"en" : "Add",           "de": "Neu",                 "ru": "Добавить"},
        "Up"               : {"en" : "Up",            "de": "Nach oben",           "ru": "На верх"},
        "Down"             : {"en" : "Down",          "de": "Nach unten",          "ru": "Вниз"},
        "Delete"           : {"en" : "Delete",        "de": "L&ouml;schen",        "ru": "Удалить"},
        "Horizontal"       : {"en" : "Horizontal",    "de": "Horizontal",          "ru": "Горизонтально"},
        "Vertical"         : {"en" : "Vertical",      "de": "Senkrecht",           "ru": "Вертикально"},
        "Docked at top"    : {"en" : "Docked at top", "de": "Angedockt oben",      "ru": "Панель сверху"},
        "Docked at bottom" : {"en" : "Docked at bottom", "de": "Angedockt unten",  "ru": "Панель снизу"},
        "Docked at left"   : {"en" : "Docked at left","de": "Angedockt links",     "ru": "Панель слева"},
        "Docked at right"  : {"en" : "Docked at right","de": "Angedockt rechts",   "ru": "Панель справа"},
        "Center"           : {"en" : "Center",        "de": "In der MItte",        "ru": "В середине"},
        "Left"             : {"en" : "Left",          "de": "Links",               "ru": "Слева"},
        "Right"            : {"en" : "Right",         "de": "Rechts",              "ru": "Справа"},
        "floatHorizontal": {"en": "floatHorizontal", "de": "floatHorizontal", "ru": "floatHorizontal"},
        "floatVertical": {"en": "floatVertical", "de": "floatVertical", "ru": "floatVertical"},
        "dockTop": {"en": "dockTop", "de": "dockTop", "ru": "dockTop"},
        "dockBottom": {"en": "dockBottom", "de": "dockBottom", "ru": "dockBottom"},
        "dockLeft": {"en": "dockLeft", "de": "dockLeft", "ru": "dockLeft"},
        "dockRight": {"en": "dockRight", "de": "dockRight", "ru": "dockRight"},
        "center": {"en": "center", "de": "center", "ru": "center"},
        "bTheme": {"en": "bTheme", "de": "bTheme", "ru": "bTheme"},
        "bWidth": {"en": "bWidth", "de": "bWidth", "ru": "bWidth"},
        "bHeight": {"en": "bHeight", "de": "bHeight", "ru": "bHeight"},
        "bImageAlign": {"en": "bImageAlign", "de": "bImageAlign", "ru": "bImageAlign"},
        "bOnlyOneSelected": {"en": "bOnlyOneSelected", "de": "bOnlyOneSelected", "ru": "bOnlyOneSelected"},
        "bStyleNormal": {"en": "bStyleNormal", "de": "bStyleNormal", "ru": "bStyleNormal"},
        "bStyleNormalHover": {"en": "bStyleNormalHover", "de": "bStyleNormalHover", "ru": "bStyleNormalHover"},
        "bStyleActive": {"en": "bStyleActive", "de": "bStyleActive", "ru": "bStyleActive"},
        "bStyleActiveHoverbShowEffect": {"en": "bStyleActiveHoverbShowEffect", "de": "bStyleActiveHoverbShowEffect", "ru": "bStyleActiveHoverbShowEffect"},
        "bShowEffectMs": {"en": "bShowEffectMs", "de": "bShowEffectMs", "ru": "bShowEffectMs"},
        "bHideEffect": {"en": "bHideEffect", "de": "bHideEffect", "ru": "bHideEffect"},
        "bHideEffectMs": {"en": "bHideEffectMs", "de": "bHideEffectMs", "ru": "bHideEffectMs"}
    });
}

vis.binds.bars = {
    bType : {
        filters:    0,
        navigation: 1
    },
    width: 308, // width of edit fields
    created: [],
    themes: [{cssClass: 'sidebar-dark', name: 'Dark glass'},
             {cssClass: 'sidebar-blue', name: 'Blue glass'},
             {cssClass: 'sidebar-red',  name: 'Red glass'}
             ],
    
    // Return widget for hqWidgets Button
    getWidgetByObj: function (div) {
        var visWidget = vis.views[vis.activeView].widgets[barsIntern.wid];
        if (visWidget === undefined) {
            for (var view in vis.views) {
                if (vis.views[view].widgets[barsIntern.wid]) {
                    visWidget = vis.views[view].widgets[barsIntern.wid];
                    break;
                }
            }
        }

        return visWidget;
    },
    // Save settings of this widgets
    /*editSave: function (div) {
        if (div !== undefined) {
            // Save settings of one widget
            var newOpt = JSON.stringify(barsOptions);
            var visWidget = vis.binds.bars.getWidgetByObj (div);

            if (visWidget) {
                visWidget.data = newOpt;
            } else {
                if (!vis.views[vis.activeView].widgets) {
                    vis.views[vis.activeView].widgets = {};
                }
                if (!vis.views[vis.activeView].widgets[barsIntern.wid]) {
                    vis.views[vis.activeView].widgets[barsIntern.wid] = {};
                }
                if (!vis.views[vis.activeView].widgets[barsIntern.wid].data) {
                    vis.views[vis.activeView].widgets[barsIntern.wid].data = {};
                }
                vis.views[vis.activeView].widgets[barsIntern.wid].data = newOpt;
            }
        }

        if (vis.binds.bars.editSaveTimer != null) {
            clearTimeout(vis.binds.bars.editSaveTimer);
        }

        vis.binds.bars.editSaveTimer = setTimeout (function () {
            vis.saveRemote ();
            console.log ("Saved!");
            vis.binds.bars.editSaveTimer = null;
        }, 2000);
    },
    _editSliderHandler: function (attrName, div, min, max) {
        var elem = document.getElementById ('inspect_' + attrName);
        if (elem !== null) {
            elem.ctrlAttr = attrName;
            elem.parent   = div;
            var parent = $('#inspect_' + attrName);
            parent.html("<table style='vis-vis-no-spaces'><tr style='vis-vis-no-spaces'><td style='vis-vis-no-spaces'><input type='text' size='3' value='" + barsOptions[attrName] + "' id='inspect_" + attrName + "_text'></td><td style='vis-vis-no-spaces'><div style='width: " + (vis.binds.bars.width - 40) + "px' id='inspect_" + attrName + "_slider'></div></td></tr></table>");

            var slider = document.getElementById ("inspect_" + attrName+ "_slider");
            var text   = document.getElementById ("inspect_" + attrName+ "_text");
            slider.jText     = text;
            slider.ctrl      = div;
            slider.attrName = attrName;
            text.slider      = slider;
            text.ctrl        = div;
            text.attrName   = attrName;

            $("#inspect_" + attrName + "_slider").slider({
                min: min,
                max: max,
                range: "min",
                value: barsOptions[attrName],
                slide: function (event, ui) {
                    var div = this.ctrl;
                    var attrName = this.attrName;
                    $(this.jText).val(ui.value);
                    if (barsOptions[attrName] != ui.value) {
                        barsOptions[attrName] = ui.value;
                        if (!isNaN(barsOptions[attrName])) {
                            vis.binds.bars.init(barsIntern.wid);
                            vis.binds.bars.editSave(div);
                        }
                    }
                }
            });
            $("#inspect_" + attrName + "_text").change(function () {
                this.slider.slider("value", $(this).val());
            });
        }
    },
    _editSelectHandler: function (attrName, div, _onPreChange, _onPostChange) {
        var elem;
        if ((elem = document.getElementById ('inspect_'+attrName)) != null) {
            // Set actual value
            for (var i = 0; i < elem.options.length; i++)
                if (elem.options[i].value == barsOptions[attrName]) {
                    elem.options[i].selected = true;
                    break;
                }

            elem.parent   = div;
            elem.ctrlAttr = attrName;
            elem._onPreChange = _onPreChange;
            elem._onPostChange = _onPostChange;
            $(elem).change (function () {
                var div = this.parent;
                barsOptions[this.ctrlAttr] = $(this).prop('value');
                if (this._onPreChange)
                    this._onPreChange (div, this.ctrlAttr, barsOptions[this.ctrlAttr]);
                vis.binds.bars.init (barsIntern.wid);
                vis.binds.bars.editSave(div);
                if (this._onPostChange)
                    this._onPostChange (div, this.ctrlAttr, barsOptions[this.ctrlAttr]);
            });
        }
    },
    _editTextHandler: function (attrName, div, i) {
        var elem;
        if (((elem = document.getElementById ('inspect_' + attrName + "" + i)) != null) ||
            ((elem = document.getElementById ('inspect_' + attrName)) != null)){
            elem.parent   = div;
            elem.ctrlAttr = attrName;
            elem.ctrlId   = i;
            var jeee = $(elem).change (function () {
                // If really changed
                var div = this.parent;
                if (this.ctrlId != -1) {
                    barsOptions.buttons[this.ctrlId][this.ctrlAttr] = $(this).prop('value');
                    vis.binds.bars.init (barsIntern.wid);
                }
                else{
                    barsOptions[this.ctrlAttr] = $(this).prop('value');
                    vis.binds.bars.init (barsIntern.wid);
                }
                vis.binds.bars.editSave(div);
            });

            jeee.keyup (function () {
                if (this.parent.timer)
                    clearTimeout (this.parent.timer);

                this.parent.timer = _setTimeout (function(elem_) {
                    $(elem_).trigger('change');
                    elem_.parent.timer=null;
                }, 200, this);
            });

            var btn = document.getElementById ('inspect_' + attrName + "" + i + 'Btn');
            if (btn) {
                btn.parent   = div;
                btn.ctrlAttr = attrName;
                btn.ctrlId   = i;
                $(btn).bind("click", {msg: div}, function (event) {
                    var attr =  this.ctrlAttr+this.ctrlId;
                    $.fm({
                        root: "www/",
                        lang: vis.language ,
                        path: "www/vis/img/",
                        file_filter: ["gif","png", "bmp", "jpg", "jpeg", "tif", "svg"],
                        folder_filter: false,
                        mode: "open",
                        view:"prev"
                    },function(_data){
                        var src = _data.path.split("www")[1] + _data.file;
                        $('#inspect_'+attr).val(src).trigger("change");
                    });
                });
            }
        }
    },
    _editTextAutoCompleteHandler: function (attrName, div, _sourceFnc) {
            // auto complete for class key
            var elem = document.getElementById ('inspect_' + attrName);
            if (elem) {
                elem.ctrlAttr = attrName;
                elem.ctrl = div;

                elem._save = function () {
                    if (this.timer)
                        clearTimeout (this.timer);

                    this.timer = _setTimeout (function(elem_) {
                        var div = elem_.ctrl;
                         // If really changed
                        div._oldAttr = barsOptions[elem_.ctrlAttr];
                        barsOptions[elem_.ctrlAttr] = $(elem_).prop('value');
                        vis.binds.bars.init (barsIntern.wid);
                        vis.binds.bars.editSave(div);
                    }, 200, this);
                };

                $(elem).autocomplete({
                    minLength: 0,
                    source: _sourceFnc,
                    select: function (event, ui){
                        this._save();
                    },
                    change: function (event, ui) {
                        this._save();
                    }
                }).focus(function () {
                    $(this).autocomplete("search", "");
                }).keyup (function () {
                    this._save();
                });
            }
    },
    _editCheckboxHandler: function (attrName, div) {
        var elem;
        if ((elem = document.getElementById ('inspect_'+attrName)) != null) {
            elem.ctrl     = div;
            elem.ctrlAttr = attrName;

            $(elem).change (function () {
                var div = this.ctrl;
                barsOptions[this.ctrlAttr] = $(this).prop('checked');
                vis.binds.bars.init (barsIntern.wid);
                vis.binds.bars.editSave(div);
            });
        }
    },
    _editStyleHandler: function (attrName, div, filterFile, filterName, filterAttrs) {
        var elem;
        if ((elem = document.getElementById ('inspect_' + attrName + 'Parent'))) {
            elem.ctrl     = div;
            elem.ctrlAttr = attrName;
            if (vis.styleSelect) {
                vis.styleSelect.Show ({ width: 180,
                    name:          'inspect__' + attrName,
                    style:         barsOptions[elem.ctrlAttr],
                    parent:        $('#inspect_' + attrName + 'Parent'),
                    filterFile:    filterFile,
                    filterName:    filterName,
                    filterAttrs:   filterAttrs,
                    onchangeParam: elem,
                    onchange: function (newStyle, obj) {
                        var div_ = obj.ctrl;
                        // If really changed
                        if (div_.barsOptions[obj.ctrlAttr] != newStyle) {
                            div_.barsOptions[obj.ctrlAttr] = newStyle;

                            if (div_.barsOptions[obj.ctrlAttr] == "")
                                div_.barsOptions[obj.ctrlAttr] = null;

                            vis.binds.bars.init (div_.barsIntern.wid);
                            vis.binds.bars.editSave(div_);
                        }
                    }
                });
            }
            //else {
                // set here just textbox to input desired style
            //}
        }
    },
    _showGroupButton: function (groupName, div) {
        var advBtn = document.getElementById (groupName + '_BtnGroup');
        advBtn.obj       = div;
        advBtn.groupName = groupName;
        advBtn.state = (vis.visibility) ? vis.visibility[groupName] : false;

        $(advBtn).button({icons: {primary: (!advBtn.state) ?  "ui-icon-carat-1-s" : "ui-icon-carat-1-n"}}).click(function( event ) {
            this.state = !(this.state);
            if (!vis.visibility) {
                vis.visibility = {};
            }
            vis.visibility[this.groupName] = this.state;
            if (this.state) {
                $(this).button("option", {icons: { primary: "ui-icon-carat-1-n" }});
                var i = 0;
                var $htmlBtn;
                while ($htmlBtn = document.getElementById (this.groupName + "" + i)) {
                    $($htmlBtn).show();
                    i++;
                }
            }
            else {
                $(this).button("option", {icons: { primary: "ui-icon-carat-1-s" }});
                var i = 0;
                var btn__;
                while (btn__ = document.getElementById (this.groupName + "" + i)) {
                    $(btn__).hide();
                    i++;
                }
            }
        });
        if (!advBtn.state) {
            // Hide all
            var i = 0;
            var btn___;
            while (btn___ = document.getElementById (groupName + "" + i)) {
                $(btn___).hide();
                i++;
            }
        }
    },*/
    drawButton: function (wid, i, opt) {
        //var style = "style='" + (opt.bWidth ? ("width:" + opt.bWidth + "px;") : "") + (opt.bHeight ? ("height:" + opt.bHeight + "px;") : "") + "'";
        var style = 'style="height:100%"';//'style="height:100%; width: 100%"';
        var cssClass = opt.bStyleNormal;
        cssClass = cssClass || 'ui-state-default ui-button ui-widget';

        var text = "<div id='" + wid + "_btn" + i + "' " + style + " class='" + cssClass + "'>\n";
        var isTable = true || (opt['buttonsImage' + i] && opt['buttonsText' + i]);
        if (isTable) {
            text += '<table ' + style + ' class="vis-no-spaces"><tr style="width:100%;height:100%" class="vis-no-spaces">\n';
            text += "<td class='vis-no-spaces' style='width:" + opt.bOffset + "%; vertical-align: bottom; text-align: " + opt.bImageAlign + "'>\n";
        }
        if (opt['buttonsImage' + i]) {
            text += "<img class='vis-no-spaces' src='" + ((opt['buttonsImage' + i].indexOf("/") != -1) ?
                    opt['buttonsImage' + i] : "img/" + opt['buttonsImage' + i]) +"' style='" + (opt.bWidth ? ("max-width:" + (opt.bWidth - 5) + "px;") : "") + (opt.bHeight ? ("max-height:"+(opt.bHeight - 5)+"px;") : "") + "' />\n";
        }
        if (isTable) {
            text += "</td><td class='vis-no-spaces' style='width:" + (100 - opt.bOffset) + "%; text-align: " + opt.bTextAlign+"'>\n";
        }
        if (opt['buttonsText' + i]) {
            text += "<span style='text-align: " + opt.bTextAlign + "'>" + opt['buttonsText' + i] + "</span>\n";
        }
        if (isTable) {
            text += "</td></tr></table>\n";
        }
        text += "</div>\n";
        return text;
    },
    draw: function($div) {
        var barsOptions = $div.data('barsOptions');
        var barsIntern  = $div.data('barsIntern');

        var isHorizontal = (barsOptions.position === 'floatHorizontal' ||
                            barsOptions.position === 'dockTop' ||
                            barsOptions.position === 'dockBottom');

        var text = '';
        var calc = (barsOptions.bTheme && barsOptions.bSpace) ? 'calc(100% - ' + (barsOptions.bSpace * 2) + 'px)' : '100%';
        text += '<table style="width:' + calc + '; height: ' + calc + '; ' + (barsOptions.bLayout === 'fixed' ? 'table-layout: fixed' : '') + '" class="vis-no-spaces">';
        if (isHorizontal) {
            text += '<tr class="vis-no-spaces">';
            for (var d = 1; d <= barsOptions.bCount; d++) {
               text += '<td class="vis-no-spaces">' + this.drawButton(barsIntern.wid, d, barsOptions) + '</td>';

                if (barsOptions.bSpace && d != barsOptions.bCount){
                   text += '<td class="vis-no-spaces" style="width:' + barsOptions.bSpace + 'px"></td>';
               }
            }
            text += '</tr>';
        }
        else { // vertical
            for (var i = 1; i <= barsOptions.bCount; i++) {
                text += "<tr class='vis-no-spaces'><td class='vis-no-spaces'>" +
                    this.drawButton(barsIntern.wid, i, barsOptions) + "</td></tr>";

                if (barsOptions.bSpace && i != barsOptions.bCount) {
                    text += "<tr class='vis-no-spaces'><td class='vis-no-spaces' style='height:" + barsOptions.bSpace + "px'></td></tr>";
                }
            }
        }
        text += "</table>";

        $div.html(text).css({'border-radius': 0, padding: 0});

        for (var u = 1; u <= barsOptions.bCount; u++) {
            var $htmlBtn = $('#' + barsIntern.wid + '_btn' + u);
            $htmlBtn.data('ctrl', {div: $div[0], id: u});

            $htmlBtn.css({borderRadius: barsOptions.bRadius + 'px'});

            $htmlBtn.hover(function () {
                var div__ = $(this).data('ctrl').div;
                var barsOptions = $(div__).data('barsOptions');
                if ($(this).data('state') === 1) {
                    if (barsOptions.bStyleActiveHover) {
                        $(this).removeClass(barsOptions.bStyleActive).
                            removeClass(barsOptions.bStyleNormal).
                            addClass(barsOptions.bStyleActiveHover);
                    } else if (barsOptions.bStyleNormalHover) {
                        $(this).removeClass(barsOptions.bStyleActive).
                            removeClass(barsOptions.bStyleNormal).
                            addClass(barsOptions.bStyleNormalHover);
                    } else {
                        $(this).addClass('ui-state-hover');
                    }
                } else {
                    if (barsOptions.bStyleNormalHover) {
                        $(this).removeClass(barsOptions.bStyleActive).
                            removeClass(barsOptions.bStyleNormal).
                            addClass(barsOptions.bStyleNormalHover);
                    } else {
                        $(this).addClass('ui-state-hover');
                    }
                }
            },
            function () {
                var div__ = $(this).data('ctrl').div;
                var barsOptions = $(div__).data('barsOptions');

                $(this).removeClass('ui-state-hover').
                    removeClass(barsOptions.bStyleActiveHover).
                    removeClass(barsOptions.bStyleNormalHover);

                if ($(this).data('state') === 1) {
                    if (barsOptions.bStyleActive) {
                        $(this).removeClass(barsOptions.bStyleNormalHover).
                            removeClass(barsOptions.bStyleActiveHover).
                            removeClass(barsOptions.bStyleNormal).
                            addClass(barsOptions.bStyleActive);
                    }
                }else  {
                    if (barsOptions.bStyleNormal) {
                        $(this).removeClass(barsOptions.bStyleActiveHover).
                            removeClass(barsOptions.bStyleNormalHover).
                            addClass(barsOptions.bStyleNormal);
                    }
                }
            });

            $htmlBtn.click (function () {
                var div__ = $(this).data('ctrl').div;
                var onClick = $(div__).data('onClick');
                if (onClick) onClick(this, div__, $(this).data('ctrl').id);
            });
        }

        // Remove previous class
        //if (div._oldAttr) $div.removeClass(div._oldAttr);

        if (barsOptions.position === 'floatHorizontal' ||
            barsOptions.position === 'floatVertical') {
            $div.css({'position': 'absolute'});

            for (var q = 0; q < vis.binds.bars.themes.length; q++) {
                $div.removeClass(vis.binds.bars.themes[q].cssClass);
            }
            if (barsOptions.bTheme) {
                $div.addClass(barsOptions.bTheme);
                $div.css({'border-radius': 10, padding: barsOptions.bSpace});
                $div.parent().css({'border-radius': 10});
            }
            if (vis.editMode && vis.activeWidgets.indexOf(barsIntern.wid) !== -1) {
                vis.showWidgetHelper(barsIntern.wid, true);
            }

            $('#jquerySideBar_' + barsIntern.wid).remove();
        }
        else {
            if (!$().sidebar) {
                window.alert("Float types are not supported, while sidebars are not included");
                return;
            }

            $div.css({left: 'auto', top: 'auto'});
            var position;

            switch(barsOptions.position) {
                case 'dockTop':
                    position = "top";
                    break;
                case 'dockLeft':
                    position = "left";
                    break;
                case 'dockRight':
                    position = "right";
                    break;
                default:
                    position = "bottom";
                    break;
            }
            var w = $div.width();
            var h = $div.height();
            $div.css({width: w, height: h});

            $div.sidebar({
                position: position,
                width:    $div.width()  + 20,
                height:   $div.height() + 20,
                open:     'click',
                id:       barsIntern.wid,
                root:     $('#visview_' + barsIntern.view)
            });

            if (barsOptions.bOpen && vis.editMode) $div.sidebar('open');

            if (0 && barsOptions.bTest && vis.editMode) {
                if (barsIntern.wType === 'tplBarFilter') {
                    // Hide all
                    vis.changeFilter("$", barsOptions.bShowEffect, barsOptions.bShowEffectMs, barsOptions.bHideEffect, barsOptions.bHideEffectMs);

                    // Show all
                    setTimeout (function () {
                        vis.changeFilter ("", barsOptions.bShowEffect, barsOptions.bShowEffectMs, barsOptions.bHideEffect, barsOptions.bHideEffectMs);
                    }, 500 + parseInt(barsOptions.bShowEffectMs, 10));
                }
                else
                if (barsIntern.wType === 'tplBarNavigator'){
                    var v = vis.activeView;
                    // find other view
                    for (var t in vis.views) {
                        if (t != v) break;
                    }

                    vis.changeView (t,
                        {effect: barsOptions.bHideEffect, duration: barsOptions.bHideEffectMs},
                        {effect: barsOptions.bShowEffect, duration: barsOptions.bShowEffectMs});

                    // Show all
                    setTimeout (function () {
                        vis.changeView (v,
                            {effect: barsOptions.bHideEffect, duration: barsOptions.bHideEffectMs},
                            {effect: barsOptions.bShowEffect, duration: barsOptions.bShowEffectMs});
                        vis.inspectWidgets(barsIntern.wid);
                    }, 500 + parseInt (barsOptions.bShowEffectMs, 10));
                }
            }
            $('#jquerySideBar_' + barsIntern.wid).addClass(barsOptions.bTheme);

            if (vis.editMode) {
                if (vis.activeWidgets.indexOf(barsIntern.wid) != -1) {
                    vis.showWidgetHelper(barsIntern.wid, true);
                }
            }

            for (var k = 1; k <= barsOptions.bCount; k++) {
                $('#' + barsIntern.wid + '_btn' + k).css({borderRadius: barsOptions.bRadius + 'px'});
            }
        }
    },
    /*editButton: function (div, i, isInit) {
        var sText = "";
        var iBtnCount = 0;
        if (!isInit) {
            sText += "<tr id='idButtons"+(i*5+(iBtnCount++))+"'><td colspan=2 class='bars_line'></td></tr>";
            // Image
            sText += "<tr id='idButtons"+(i*5+(iBtnCount++))+"'><td class='vis-edit-td-caption'>"+ _("Icon:")+"</td><td>";
            sText += "<input id='inspect_image"+i+"' style='width: "+(vis.binds.bars.width - 30)+"px' type='text' value='"+(barsOptions['buttonsImage' + i] || "")+"'>";
            sText += "<input id='inspect_image"+i+"Btn' style='width: 30px' type='button' value='...'>";
            sText += "</td></tr>";

            // Name
            sText += "<tr id='idButtons"+(i*5+(iBtnCount++))+"'><td class='vis-edit-td-caption'>"+ _("Caption:") +"</td><td><input style='width: "+vis.binds.bars.width+"px' id='inspect_text"+i+"' type='text' value='"+(barsOptions['buttonsText' + i] || "")+"'></td></tr>";

            // option
            if (barsIntern.wType == 'tplBarFilter') {
                sText += "<tr id='idButtons"+(i*5+(iBtnCount++))+"'><td class='vis-edit-td-caption'>"+ _("Filter key:") +"</td><td><input style='width: "+vis.binds.bars.width+"px' id='inspect_option"+i+"' value='"+(barsOptions['buttonsOption' + i] || "")+"'></td></tr>";
            }
            else
            if (barsIntern.wType == 'tplBarNavigator') {
                sText += "<tr id='idButtons"+(i*5+(iBtnCount++))+"'><td>"+ _("View name:") +"</td><td><input style='width: "+vis.binds.bars.width+"px' id='inspect_option"+i+"' type='text' value='"+(barsOptions['buttonsOption' + i] || "")+"'></td></tr>";
            }
            else{
                sText += "<tr id='idButtons"+(i*5+(iBtnCount++))+"'><td class='vis-edit-td-caption'>"+ _("Option:") +"</td><td><input style='width: "+vis.binds.bars.width+"px' id='inspect_option"+i+"' type='text' value='"+(barsOptions['buttonsOption' + i] || "")+"'></td></tr>";
            }

            if (barsOptions.bCount > 1) {
                sText += "<tr id='idButtons"+(i*5+(iBtnCount++))+"'><td class='vis-edit-td-caption'></td><td>";
                sText += "<table class='no-space'><tr class='no-space'>";
                sText +="<td style='width:90px' class='no-space'><button id='barsDel"+i+"' style='height: 30px'>"+_('Delete')+"</button></td>";
                if (i > 0) {
                    sText +="<td style='width:90px;text-align: center' class='no-space'><button id='barsUp" +i+"' style='height: 30px'>"+""+"</button></td>";
                }else {
                    sText +="<td style='width:90px' class='no-space'></td><td style='width:90px' class='no-space'></td>";
                }

                sText +="<td style='width:90px' class='no-space'>";
                if (i != barsOptions.bCount - 1) {
                    sText +="<button id='barsDown" +i+"' style='height: 30px'>"+""+"</button>";
                }
                sText +="</td>";


                sText += "</tr></table></td></tr>";
            }

        }
        else {
            vis.binds.bars._editTextHandler ("image",  div, i);
            vis.binds.bars._editTextHandler ("text",   div, i);
            if (barsIntern.wType == 'tplBarFilter') {
                var elem = document.getElementById ('inspect_option'+i);
                if (elem) {
                    elem.parent   = div;
                    elem.ctrlAttr = 'option';
                    elem.ctrlId   = i;

                    $(elem).autocomplete({
                        minLength: 0,
                        source: function(request, response) {
                            var data = $.grep(vis.views[vis.activeView].filterList, function(value) {
                                return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
                            });

                            response(data);
                        },
                        select: function (event, ui){
                            // If really changed
                            var div = this.parent;
                            barsOptions.buttons[this.ctrlId][this.ctrlAttr] = ui.item.value;
                            vis.binds.bars.init (barsIntern.wid);
                            vis.binds.bars.editSave(div);
                        },
                        change: function (event, ui) {
                            // If really changed
                            var div = this.parent;
                            barsOptions.buttons[this.ctrlId][this.ctrlAttr] = $(this).prop('value');
                            vis.binds.bars.init (barsIntern.wid);
                            vis.binds.bars.editSave(div);
                        }
                    }).focus(function () {
                        $(this).autocomplete("search", "");
                    }).keyup (function () {
                        if (this.parent.timer)
                            clearTimeout (this.parent.timer);

                        this.parent.timer = _setTimeout (function(elem_) {
                             // If really changed
                            var div = elem_.parent;
                            barsOptions.buttons[elem_.ctrlId][elem_.ctrlAttr] = $(elem_).prop('value');
                            vis.binds.bars.init (barsIntern.wid);
                            vis.binds.bars.editSave(div);
                            elem_.parent.timer=null;
                        }, 200, this);
                    });
                }
            }
            else
            if (barsIntern.wType == 'tplBarNavigator') {
                var elem = document.getElementById ('inspect_option'+i);
                if (elem) {
                    elem.parent   = div;
                    elem.ctrlAttr = 'option';
                    elem.ctrlId   = i;

                    $(elem).autocomplete({
                        minLength: 0,
                        source: function(request, response) {
                            var views = [];
                            for (var v in vis.views) {
                                views[views.length] = v;
                            }
                            var data = $.grep(views, function(value) {
                                return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
                            });

                            response(data);
                        },
                        select: function (event, ui){
                            // If really changed
                            var div = this.parent;
                            barsOptions.buttons[this.ctrlId][this.ctrlAttr] = ui.item.value;
                            if (!barsOptions.buttons[this.ctrlId]['text']) {
                                var s = barsOptions.buttons[this.ctrlId][this.ctrlAttr];
                                barsOptions.buttons[this.ctrlId]['text'] = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
                                $("#inspect_text"+this.ctrlId).val(barsOptions.buttons[this.ctrlId]['text']).trigger("change");
                            }
                            vis.binds.bars.init (barsIntern.wid);
                            vis.binds.bars.editSave(div);
                        },
                        change: function (event, ui) {
                            // If really changed
                            var div = this.parent;
                            barsOptions.buttons[this.ctrlId][this.ctrlAttr] = $(this).prop('value');
                            if (!barsOptions.buttons[this.ctrlId]['text']) {
                                var s = barsOptions.buttons[this.ctrlId][this.ctrlAttr];
                                barsOptions.buttons[this.ctrlId]['text'] = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
                                $("#inspect_text"+this.ctrlId).val(barsOptions.buttons[this.ctrlId]['text']).trigger("change");
                            }
                            vis.binds.bars.init (barsIntern.wid);
                            vis.binds.bars.editSave(div);
                        }
                    }).focus(function () {
                        $(this).autocomplete("search", "");
                    }).keyup (function () {
                        if (this.parent.timer)
                            clearTimeout (this.parent.timer);

                        this.parent.timer = _setTimeout (function(elem_) {
                             // If really changed
                            var div = elem_.parent;
                            barsOptions.buttons[elem_.ctrlId][elem_.ctrlAttr] = $(elem_).prop('value');
                            if (!barsOptions.buttons[elem_.ctrlId]['text']) {
                                var s = barsOptions.buttons[elem_.ctrlId][elem_.ctrlAttr];
                                barsOptions.buttons[elem_.ctrlId]['text'] = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
                                $("#inspect_text"+elem_.ctrlId).val(barsOptions.buttons[elem_.ctrlId]['text']).trigger("change");
                            }
                            vis.binds.bars.init (barsIntern.wid);
                            vis.binds.bars.editSave(div);
                            elem_.parent.timer=null;
                        }, 200, this);
                    });
                }
            }
            else {
                vis.binds.bars._editTextHandler ("option", div, i);
            }

            // Use delete button
            var btn = $('#barsDel' + i);
            if (btn) {
                btn.button({icons: {primary: "ui-icon ui-icon-circle-close"}});
                var htmlbtn4 = document.getElementById ('barsDel'+i);
                if (htmlbtn4) {
                    htmlbtn4.parent = div;
                    htmlbtn4.ctrlId = i;
                }
                btn.click (function () {
                    var div = this.parent;
                    for (var i = this.ctrlId; i < barsOptions.bCount - 1; i++){
                        barsOptions['buttons' + i] = barsOptions.['buttons' + (i + 1)];
                    }
                    barsOptions.bCount = barsOptions.bCount - 1;
                    vis.binds.bars.init (barsIntern.wid);
                    vis.binds.bars.edit (barsIntern.wid, barsIntern.editParent);
                    vis.binds.bars.editSave(div);
                    vis.inspectWidget (barsIntern.wid);
                });
            }
            btn = $('#barsUp'+i);
            if (btn) {
                btn.button( {icons: {primary: "ui-icon-arrowthick-1-n"}});
                var htmlbtn_ = document.getElementById ('barsUp'+i);
                if (htmlbtn_) {
                    htmlbtn_.parent = div;
                    htmlbtn_.ctrlId = i;
                }
                btn.click (function () {
                    var div = this.parent;
                    var temp = barsOptions.buttons[i - 1];
                    barsOptions.buttons[i - 1] = barsOptions['buttons' + i];
                    barsOptions['buttons' + i] = temp;
                    vis.binds.bars.init (barsIntern.wid);
                    vis.binds.bars.edit (barsIntern.wid, barsIntern.editParent);
                    vis.binds.bars.editSave(div);
                });
            }
            btn = $('#barsDown'+i);
            if (btn) {
                btn.button({icons: {primary: "ui-icon-arrowthick-1-s"}});
                var htmlbtn = document.getElementById ('barsDown'+i);
                if (htmlbtn) {
                    htmlbtn.parent = div;
                    htmlbtn.ctrlId = i;
                }
                btn.click (function () {
                    var div = this.parent;
                    var temp = barsOptions.buttons[i + 1];
                    barsOptions.buttons[i + 1] = barsOptions['buttons' + i];
                    barsOptions['buttons' + i] = temp;
                    vis.binds.bars.init (barsIntern.wid);
                    vis.binds.bars.edit (barsIntern.wid, barsIntern.editParent);
                    vis.binds.bars.editSave(div);
                });
            }
        }
        return sText;
    },
    edit: function (wid, jParent) {
        var div  = document.getElementById (wid);
        if (barsOptions) {
            barsIntern.editParent = jParent;
            var sText = "<table id='barsEditElements' style='width:100%'>";
            sText += "<tr><td class='vis-edit-td-caption'>"+_("Theme:")+"</td><td class='vis-edit-td-field'><input type='text' id='inspect_bTheme' value='"+(barsOptions.bTheme || "") + "' size='44' /></td></tr>";

            if (barsIntern.wType == 'tplBarFilter') {
                sText += "<tr><td class='vis-edit-td-caption'>"+ _("One at time:")+"</td><td class='vis-edit-td-field'><input id='inspect_bOnlyOneSelected' type='checkbox' "+((barsOptions.bOnlyOneSelected ) ? "checked" : "")+"></td></tr>";
                sText += "<tr><td class='vis-edit-td-caption'>"+ _("Initial filter:")+"</td><td class='vis-edit-td-field'><input id='inspect_bValue' type='text' size='44' value='"+(barsOptions.bValue || "") + "'></td></tr>";
            }

            var iGeomCount = 0;
            sText += "<tr><td colspan=2><button id='idGeometry_BtnGroup' class='vis-group-button-width'>"+_("Geometry...")+"</button></td></tr>";
            sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='vis-edit-td-caption'>"+ _("Bar type:")+"</td><td class='vis-edit-td-field'><select id='inspect_position' style='width: "+vis.binds.bars.width+"px'>";
            sText += "<option value='0'>" +_("Horizontal")+"</option>";
            sText += "<option value='1'>" +_("Vertical")+"</option>";
            sText += "<option value='2'>" +_("Docked at top")+"</option>";
            sText += "<option value='3'>" +_("Docked at bottom")+"</option>";
            sText += "<option value='4'>" +_("Docked at left")+"</option>";
            sText += "<option value='5'>" +_("Docked at right")+"</option>";
            sText += "</select></td></tr>";
            sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='vis-edit-td-caption'></td><td class='vis-edit-td-field'><input id='inspect_barShow' type='button' value='"+_("Show")+"'></td></tr>";

            sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='vis-edit-td-caption'>"+ _("Button width:")+"</td><td id='inspect_bWidth' class='vis-edit-td-field vis-no-spaces'></td></tr>";
            sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='vis-edit-td-caption'>"+ _("Button height:")+"</td><td id='inspect_bHeight' class='vis-edit-td-field vis-no-spaces'></td></tr>";
            sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='vis-edit-td-caption'>"+ _("Button space:")+"</td><td id='inspect_bSpace' class='vis-edit-td-field vis-no-spaces'></td></tr>";
            sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='vis-edit-td-caption'>"+ _("Border radius:")+"</td><td id='inspect_bRadius' class='vis-edit-td-field vis-no-spaces'></td></tr>";
            sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='vis-edit-td-caption'>"+ _("Text offset %:")+"</td><td id='inspect_bOffset' class='vis-edit-td-field vis-no-spaces'></td></tr>";

            sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='vis-edit-td-caption'>"+ _("Image align:")+"</td><td><select id='inspect_bImageAlign' style='width: "+vis.binds.bars.width+"px'>";
            sText += "<option value='center'>" +_("Center")+"</option>";
            sText += "<option value='left'>"   +_("Left")+"</option>";
            sText += "<option value='right'>"  +_("Right")+"</option>";
            sText += "</select></td></tr>";

            sText += "<tr id='idGeometry"+(iGeomCount++)+"'><td class='vis-edit-td-caption'>"+ _("Text align:")+"</td><td><select id='inspect_bTextAlign' style='width: "+vis.binds.bars.width+"px'>";
            sText += "<option value='center'>" +_("Center")+"</option>";
            sText += "<option value='left'>"   +_("Left")+"</option>";
            sText += "<option value='right'>"  +_("Right")+"</option>";
            sText += "</select></td></tr>";

            // Styles
            var iStyleCount = 0;
            sText += "<tr><td colspan=2><button id='idStyle_BtnGroup' class='vis-group-button-width'>"+_("Styles...")+"</button></td></tr>";
            sText += "<tr id='idStyle"+(iStyleCount++)+"'><td class='vis-edit-td-caption'>"+ _("Normal:")+"</td><td id='inspect_bStyleNormalParent' ></td></tr>";
            sText += "<tr id='idStyle"+(iStyleCount++)+"'><td class='vis-edit-td-caption'>"+ _("Normal hover:")+"</td><td id='inspect_bStyleNormalHoverParent' ></td></tr>";
            sText += "<tr id='idStyle"+(iStyleCount++)+"'><td class='vis-edit-td-caption'>"+ _("Active:")+"</td><td id='inspect_bStyleActiveParent'></td></tr>";
            sText += "<tr id='idStyle"+(iStyleCount++)+"'><td class='vis-edit-td-caption'>"+ _("Active hover:")+"</td><td id='inspect_bStyleActiveHoverParent' ></td></tr>";


            // Add effects for filters
            if (barsIntern.wType == 'tplBarFilter' ||
                barsIntern.wType == 'tplBarNavigator') {
                var iEffectsCount = 0;
                vis.updateFilter();
                sText += "<tr><td colspan=2><button id='idEffect_BtnGroup' class='vis-group-button-width'>"+_("Effects...")+"</button></td></tr>";
                sText += "<tr id='idEffect"+(iEffectsCount++)+"'><td class='vis-edit-td-caption'>"+ _("Hide effect:")+"</td><td><select id='inspect_bHideEffect' style='width: "+(vis.binds.bars.width - 40)+"px'>";
                var sEffects = "";
                sEffects += "<option value=''>Show/Hide</option>";
                //sEffects += "<option value='show'>Show/Hide</option>";
                sEffects += "<option value='blind'>Blind</option>";
                sEffects += "<option value='bounce'>Bounce</option>";
                sEffects += "<option value='clip'>Clip</option>";
                sEffects += "<option value='drop'>Drop</option>";
                sEffects += "<option value='explode'>Explode</option>";
                sEffects += "<option value='fade'>Fade</option>";
                sEffects += "<option value='fold'>Fold</option>";
                sEffects += "<option value='highlight'>Highlight</option>";
                sEffects += "<option value='puff'>Puff</option>";
                sEffects += "<option value='pulsate'>Pulsate</option>";
                sEffects += "<option value='scale'>Scale</option>";
                sEffects += "<option value='shake'>Shake</option>";
                sEffects += "<option value='size'>Size</option>";
                sEffects += "<option value='slide'>Slide</option>";
                //sEffects += "<option value='transfer'>Transfer</option>";
                sText += sEffects + "</select><input id='inspect_bHideEffectMs' value='"+barsOptions.bShowEffectMs+"' style='width:40px'></td></tr>";

                sText += "<tr id='idEffect"+(iEffectsCount++)+"'><td class='vis-edit-td-caption'>"+ _("Show effect:")+"</td><td><select id='inspect_bShowEffect' style='width: "+(vis.binds.bars.width - 40)+"px'>";
                sText += sEffects + "</select><input id='inspect_bShowEffectMs' value='"+barsOptions.bShowEffectMs+"' style='width:40px'></td></tr>";

                sText += "<tr id='idEffect"+(iEffectsCount++)+"'><td class='vis-edit-td-caption'></td><td><input id='inspect_test' type='button' value='"+_("Test")+"'></td></tr>";

            }


            sText += "<tr><td colspan=2><button id='idButtons_BtnGroup' class='vis-group-button-width'>"+_("Buttons...")+"</button></td></tr>";

            for (var m = 0; m < barsOptions.bCount; m++) {
                sText += vis.binds.bars.editButton (div, m);
            }
            sText += "<tr id='idButtons"+(barsOptions.bCount*5)+"'><td class='vis-edit-td-caption'><button id='barsAdd' >"+_("Add")+"</button></td></tr></table>";
            $('#barsEditElements').remove ();
            jParent.append (sText);

            for (var n = 0; n < barsOptions.bCount; n++) {
                sText += vis.binds.bars.editButton (div, n, true);
            }
            vis.binds.bars._editSelectHandler ('position', div, function (div, ctrlAttr, val) {
                if (val > 1) {
                    $('#inspect_css_left').val("auto").trigger("change");
                    $('#inspect_css_top').val("auto").trigger("change");
                }
                $('#inspect_barShow').button((barsOptions.position == 'floatHorizontal' ||
                                              barsOptions.position == 'floatVertical') ? "disable" : "enable");
            },
            function (div, ctrlAttr, val) {
                vis.inspectWidget (barsIntern.wid);
            });

            document.getElementById ('barsAdd').parent = div;
            $('#barsAdd').button({icons : {primary :'ui-icon-circle-plus'}}).click (function () {
                var div = this.parent;
                barsOptions.buttons[barsOptions.bCount] = {"image": "", "text": "Caption", "option": ""};
                vis.binds.bars.init (barsIntern.wid);
                vis.binds.bars.edit (barsIntern.wid, barsIntern.editParent);
                vis.binds.bars.editSave(div);
                vis.inspectWidget (barsIntern.wid);
            });

            // autocomplete for class key
            vis.binds.bars._editTextAutoCompleteHandler ('bTheme', div, function(request, response) {
                var classes = [];
                for (var i = 0; i < vis.binds.bars.themes.length; i++){
                    classes[i] = vis.binds.bars.themes[i].cssClass;
                }

                var data = $.grep(classes, function(value) {
                    return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
                });

                response(data);
            });

            // Style button
            vis.binds.bars._showGroupButton('idStyle',    div);
            vis.binds.bars._showGroupButton('idGeometry', div);
            vis.binds.bars._showGroupButton('idEffect',   div);
            vis.binds.bars._showGroupButton('idButtons',  div);

            vis.binds.bars._editSliderHandler("bWidth",  div, 10, 300);
            vis.binds.bars._editSliderHandler("bHeight", div, 10, 300);
            vis.binds.bars._editSliderHandler("bSpace",  div, 0,  50);
            vis.binds.bars._editSliderHandler("bRadius", div, 0,  150);
            vis.binds.bars._editSliderHandler("bOffset", div, 0,  100);
            vis.binds.bars._editSelectHandler("bTextAlign",  div, null, null);
            vis.binds.bars._editSelectHandler("bImageAlign", div, null, null);
            vis.binds.bars._editCheckboxHandler("bOnlyOneSelected", div);

            vis.binds.bars._editStyleHandler('bStyleNormal',      div, null, '-button', 'background');
            vis.binds.bars._editStyleHandler('bStyleNormalHover', div, null, '-button', 'background');
            vis.binds.bars._editStyleHandler('bStyleActive',      div, null, '-button', 'background');
            vis.binds.bars._editStyleHandler('bStyleActiveHover', div, null, '-button', 'background');

            // Create autocomplete for initial value
            if (barsIntern.wType == 'tplBarFilter') {
                var elem = document.getElementById ('inspect_bValue');
                if (elem) {
                    elem.parent   = div;
                    elem.ctrlAttr = 'bValue';

                    $(elem).autocomplete({
                        minLength: 0,
                        source: function(request, response) {
                            var data = $.grep(vis.views[vis.activeView].filterList, function(value) {
                                return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
                            });

                            response(data);
                        },
                        select: function (event, ui){
                            // If really changed
                            var div = this.parent;
                            barsOptions[this.ctrlAttr] = ui.item.value;
                            vis.binds.bars.editSave(div);
                        },
                        change: function (event, ui) {
                            // If really changed
                            var div = this.parent;
                            barsOptions[this.ctrlAttr] = ui.item.value;
                            vis.binds.bars.editSave(div);
                        }
                    }).focus(function () {
                        $(this).autocomplete("search", "");
                    }).keyup (function () {
                        if (this.parent.timer)
                            clearTimeout (this.parent.timer);

                        this.parent.timer = _setTimeout (function(elem_) {
                             // If really changed
                            var div = elem_.parent;
                            barsOptions[elem_.ctrlAttr] = $(elem_).prop('value');
                            vis.binds.bars.editSave(div);
                            elem_.parent.timer=null;
                        }, 200, this);
                    });
                }
            }


            if (barsIntern.wType == 'tplBarFilter' ||
                barsIntern.wType == 'tplBarNavigator') {
                vis.binds.bars._editSelectHandler ("bShowEffect", div, null, null);
                vis.binds.bars._editSelectHandler ("bHideEffect", div, null, null);
                vis.binds.bars._editTextHandler ("bShowEffectMs", div, -1);
                vis.binds.bars._editTextHandler ("bHideEffectMs", div, -1);
                $('#inspect_test').button().click (function () {
                    if (barsIntern.wType == 'tplBarFilter') {
                        // Hide all
                        vis.changeFilter ("$", barsOptions.bShowEffect, barsOptions.bShowEffectMs, barsOptions.bHideEffect, barsOptions.bHideEffectMs);

                        // Show all
                        setTimeout (function () {
                            vis.changeFilter ("", barsOptions.bShowEffect, barsOptions.bShowEffectMs, barsOptions.bHideEffect, barsOptions.bHideEffectMs);
                        }, 500 + parseInt (barsOptions.bShowEffectMs));
                    }
                    else
                    if (barsIntern.wType == 'tplBarNavigator'){
                        var v = vis.activeView;
                        // find other view
                        for (var t in vis.views) {
                            if (t != v)
                                break;
                        }

                        vis.changeView (t,
                            {effect:barsOptions.bHideEffect, duration:barsOptions.bHideEffectMs},
                            {effect:barsOptions.bShowEffect, duration:barsOptions.bShowEffectMs});

                        // Show all
                        setTimeout (function () {
                            vis.changeView (v,
                                {effect:barsOptions.bHideEffect, duration:barsOptions.bHideEffectMs},
                                {effect:barsOptions.bShowEffect, duration:barsOptions.bShowEffectMs});
                            vis.inspectWidget (barsIntern.wid);
                        }, 500 + parseInt (barsOptions.bShowEffectMs));

                    }
                });
            }
            document.getElementById ('inspect_barShow').parent = div;
            $('#inspect_barShow').button().click (function () {
                if (this.parent.barsOptions.position != 'floatHorizontal' &&
                    this.parent.barsOptions.position != 'floatVertical') {
                    if ($().sidebar) {
                        $(this.parent).sidebar("open");
                    } else {
                        console.log("Sidebar is not included.");
                    }

                }
            }).button((barsOptions.position == 'floatHorizontal' ||
                       barsOptions.position == 'floatVertical') ? "disable" : "enable");

        }
    },
    editDelete: function (wid) {
        var div = document.getElementById (wid);
        if (div) {
            $('#jquerySideBar_'+barsIntern.wid).remove ();
            $('#'+barsIntern.wid).remove ();
            vis.binds.bars.created[barsIntern.wid] = undefined;
            var createdOld = vis.binds.bars.created;
            vis.binds.bars.created = [];
            for (var i = 0; i < createdOld.length; i++) {
                if (createdOld[i] != wid) {
                    vis.binds.bars.created[vis.binds.bars.created.length] = createdOld[i];
                }
            }
        }
    },*/
    setState: function (div, newFilter) {
        var newFilters = (newFilter || newFilter === 0) ? newFilter.split(',') : [];
        var $div = $(div);
        var barsOptions = $div.data('barsOptions');
        var barsIntern  = $div.data('barsIntern');

        for (var i = 1; i <= barsOptions.bCount; i++) {
            var $htmlBtn = $('#' + barsIntern.wid + '_btn' + i);
            var isFound = false;
            for (var z = 0; z < newFilters.length; z++) {
                if (barsOptions['buttonsOption' + i] == newFilters[z]) {
                    isFound = true;
                    break;
                }
            }
            if (isFound) {
                $htmlBtn.data(state, true);
                if (barsOptions.bStyleActive) {
                    $htmlBtn.addClass (barsOptions.bStyleActive).
                        removeClass (barsOptions.bStyleNormal);
                } else {
                    $htmlBtn.addClass ('ui-state-active');
                }
            }
            else {
                $htmlBtn.data(state, false);
                $htmlBtn.removeClass ('ui-state-active').
                    removeClass (barsOptions.bStyleActive);

                if (barsOptions.bStyleNormal) $htmlBtn.addClass(barsOptions.bStyleNormal);
            }
        }
    },
    filterChanged: function (view, newFilter) {
        for (var i = 0; i < vis.binds.bars.created.length; i++) {
            var $div = $('#' + vis.binds.bars.created[i]);

            if ($div.length) {
                var barsIntern = $div.data('barsIntern');
                if (barsIntern && barsIntern.view == view && barsIntern.wType == 'tplBarFilter') {
                    vis.binds.bars.setState(div, newFilter);
                }
            }
        }
    },
    initOptions: function (tpl, barsOptions) {
        var $tpl = $('#' + tpl);

        if ($tpl.attr('id') === 'tplBarFilter') {
            var filter = vis.updateFilter();
            if (filter.length > 0) {
                barsOptions.buttonsImage1  = '';
                barsOptions.buttonsText1   = _('All');
                barsOptions.buttonsOption1 = '';
                for (var x = 0; x < filter.length; x++) {
                    barsOptions['buttonsImage'  + (x + 2)] = "";
                    barsOptions['buttonsText'   + (x + 2)] = filter[x].charAt(0).toUpperCase() + filter[x].slice(1).toLowerCase();
                    barsOptions['buttonsOption' + (x + 2)] = filter[x];
                }
                barsOptions.bCount = 1 + filter.length;
            }
            else {
                barsOptions.buttonsImage1  = '';
                barsOptions.buttonsText1   = _('Caption');
                barsOptions.buttonsOption1 = '';
                barsOptions.bCount = 1;
            }
        }
        else
        if ($tpl.attr('id') === 'tplBarNavigator') {
            var cnt = 0;
            for (var s in vis.views) {
                cnt++;
                barsOptions['buttonsImage'  + cnt] = "";
                barsOptions['buttonsText'   + cnt] = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
                barsOptions['buttonsOption' + cnt] = s;
            }
            barsOptions.bCount = cnt;
        }
    },
    init: function(wid, options, view, wType) {
        var $div = $('#' + wid);
        if (!$div.length) return;

        if (!$div.find('.vis-widget-body').length) {
            $div.append('<div class="vis-widget-body" style="overflow: hidden"></div>');
        }
        $div = $('#' + wid + ' .vis-widget-body');

        var barsIntern = {
            wid:        wid,
            wType:      wType,
            view:       view
            //editParent: null
        };
        var barsOptions = options;

        var isFound = false;
        for (var g = 0; g < vis.binds.bars.created.length; g++) {
            if (vis.binds.bars.created[g] == wid) {
                isFound = true;
                break;
            }
        }

        if (!isFound) vis.binds.bars.created[vis.binds.bars.created.length] = wid;

        $div.data('barsIntern',  barsIntern);
        $div.data('barsOptions', barsOptions);

        this.draw($div);

        // non edit mode
        if (!vis.editMode) {
            // Select by default buttons
            if (barsIntern.wType === 'tplBarFilter') {
                if (barsOptions.bValue) {
                    var values = barsOptions.bValue.split(",");
                    for (var p = 1; p <= barsOptions.bCount; p++) {
                        var isFound2 = false;
                        for (var j = 0; j < values.length; j++) {
                            if(values[j] === barsOptions.buttons[p].option) {
                                isFound2 = true;
                                break;
                            }
                        }
                        if (isFound2) {
                            var $htmlBtn2 = $('#' + barsIntern.wid + '_btn' + p);
                            if ($htmlBtn2.length) {
                                $htmlBtn2.data('state', true);
                                if (barsOptions.bStyleActive) {
                                    $htmlBtn2.addClass(barsOptions.bStyleActive).
                                        removeClass(barsOptions.bStyleNormal);
                                } else {
                                    $htmlBtn2.addClass('ui-state-active');
                                }
                            }
                        }
                    }
                    // Set active filter
                    vis.changeFilter(barsOptions.bValue, barsOptions.bShowEffect, barsOptions.bShowEffectMs, barsOptions.bHideEffect, barsOptions.bHideEffectMs);
                }
            }
            else
            if (barsIntern.wType === 'tplBarNavigator') {
                for (var u = 1; u <= barsOptions.bCount; u++) {
                    if (barsIntern.view === barsOptions['buttonsOption' + u]) {
                        var $htmlBtn = $('#' + barsIntern.wid + '_btn' + u);
                        if ($htmlBtn.length) {
                            $htmlBtn.data('state', true);
                            $htmlBtn.addClass(barsOptions.bStyleActive || 'ui-state-active');
                        }
                        break;
                    }
                }
            }

            // Install on click function
            if (!$div.data('onClick')) {
                $div.data('onClick', function (htmlBtn, div, r) {
                    var barsIntern =  $(div).data('barsIntern');
                    var barsOptions = $(div).data('barsOptions');

                    $htmlBtn = $('#' + barsIntern.wid + '_btn' + r);

                    if (barsIntern.wType === 'tplBarNavigator') {
                        vis.changeView(barsOptions['buttonsOption' + r],
                            {effect: barsOptions.bHideEffect, duration: barsOptions.bHideEffectMs},
                            {effect: barsOptions.bShowEffect, duration: barsOptions.bShowEffectMs});
                    }
                    else
                    {
                        // Save actual state
                        var actState = $htmlBtn.data('state') || false;

                        if (barsOptions.bOnlyOneSelected) {
                            for (var f = 1; f <= barsOptions.bCount; f++) {
                                var $htmlBtn3 = $('#' + barsIntern.wid + '_btn' + f);
                                $htmlBtn3.data('state', false);
                                $htmlBtn3.removeClass('ui-state-active').
                                    removeClass(barsOptions.bStyleActive);

                                if (barsOptions.bStyleNormal) $htmlBtn3.addClass (barsOptions.bStyleNormal);
                            }
                            // Restore state
                            $htmlBtn.data('state', actState);
                        }

                        if ($htmlBtn.data('state')) {
                            $htmlBtn.data('state', false);
                            $htmlBtn.removeClass('ui-state-active').
                                removeClass(barsOptions.bStyleActive);

                            if (barsOptions.bStyleNormal) $htmlBtn.addClass (barsOptions.bStyleNormal);
                        }
                        else {
                            $htmlBtn.data('state', true);
                            $htmlBtn.removeClass(barsOptions.bStyleNormal);
                            if (barsOptions.bStyleActive) {
                                $htmlBtn.addClass (barsOptions.bStyleActive);
                            } else {
                                $htmlBtn.addClass ('ui-state-active');
                            }
                        }

                        // install filters handler
                        if (barsIntern.wType == 'tplBarFilter') {
                            var filter = "";
                            for (var w = 1; w <= barsOptions.bCount; w++) {
                                var $btn = $('#' + barsIntern.wid + '_btn' + w);
                                if ($btn.length && $btn.data('state')) {
                                    if (barsOptions['buttonsOption' + w]) {
                                        filter += (!filter ? '' : ',') + barsOptions['buttonsOption' + w];
                                    } else {
                                        // If disable all filters
                                        filter = "";
                                        for (var q = 1; q <= barsOptions.bCount; q++) {
                                            $btn = $('#' + barsIntern.wid + '_btn' + q);
                                            $btn.data('state', false);
                                            $btn.removeClass('ui-state-active').
                                                removeClass(barsOptions.bStyleActive);

                                            if (barsOptions.bStyleNormal) $btn.addClass(barsOptions.bStyleNormal);
                                        }
                                        break;
                                    }
                                }
                            }

                            vis.changeFilter(filter, barsOptions.bShowEffect, barsOptions.bShowEffectMs, barsOptions.bHideEffect, barsOptions.bHideEffectMs);
                        }
                    }
                });
            }
        }
        else {
            //$div.attr('data-vis-resizable', '{"disabled":true}');
            //div.visCustomEdit = {'baroptions': vis.binds.bars.edit, 'delete': vis.binds.bars.editDelete};
            // Install on click function
            /*if (div._onClick === undefined) {
                div._onClick = function (htmlBtn, div, r) {
                    vis.inspectWidget(barsIntern.wid);
                };
            }*/
        }
    }
};

