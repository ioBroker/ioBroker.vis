// Init words
/* jshint -W097 */// jshint strict:false
/* jshint browser:true */

'use strict';

// Add words for bars
if (vis.editMode) {
    $.extend(true, systemDictionary, {
        // Bars
        "bSpace":           {"en": "Button space",      "de": "Zwischenplatz",      "ru": "Промежуток"},
        "bPosition":        {"en": "Position",          "de": "Position",           "ru": "Расположeние"},
        "floatHorizontal":  {"en": "Horizontal",        "de": "Horizontal",         "ru": "горизонтально"},
        "floatVertical":    {"en": "Vertical",          "de": "Senkrecht",          "ru": "вертикально"},
        "dockTop":          {"en": "Dock at top",       "de": "Angedockt oben",     "ru": "панель сверху"},
        "dockBottom":       {"en": "Dock at bottom",    "de": "Angedockt unten",    "ru": "панель снизу"},
        "dockLeft":         {"en": "Dock at left",      "de": "Angedockt links",    "ru": "панель слева"},
        "dockRight":        {"en": "Dock at right",     "de": "Angedockt rechts",   "ru": "панель справа"},
        "center":           {"en": "Center",            "de": "In der Mitte",       "ru": "по центру"},
        "bTheme":           {"en": "Theme",             "de": "Thema",              "ru": "Тема"},
        "bImageAlign":      {"en": "Image align",       "de": "Bildposition",       "ru": "Позиция картинки"},
        "bOnlyOneSelected": {"en": "Selected only one", "de": "Nur eine auswahlbar", "ru": "Только один фильтр"},
        "bStyleNormal":     {"en": "Normal",            "de": "Normal",             "ru": "Нормальное"},
        "bStyleActive":     {"en": "Active",            "de": "Aktiv",              "ru": "Активное"},
        "bShowEffect":      {"en": "Show",              "de": "Anzeigen",           "ru": "Показать"},
        "bShowEffectMs":    {"en": "Show in ms",        "de": "Anzeigen in ms",     "ru": "Показ в мс"},
        "bHideEffect":      {"en": "Hide",              "de": "Verbergen",          "ru": "Скрыть"},
        "bHideEffectMs":    {"en": "Hide in ms",        "de": "Verbergen in ms",    "ru": "Скрытие в мс"},
        "fixed":            {"en": "fixed",             "de": "fest",               "ru": "фиксировано"},
        "bTest":            {"en": "Test",              "de": "Test",               "ru": "Тест"},
        "bOpen":            {"en": "Open",              "de": "Open",               "ru": "Открыть"},
        "bOffset":          {"en": "Text offset %",     "de": "Textabsetzung %",    "ru": "Отступ текста в %"},
        "bValue":           {"en": "Default value",     "de": "Startwert",          "ru": "Начальное значение"},
        "bLayout":          {"en": "Layout",            "de": "Layout",             "ru": "Размещение"},
        "bCount":           {"en": "Buttons count",     "de": "Knopfanzahl",        "ru": "Количество кнопок"},
        "group_buttons":    {"en": "Button",            "de": "Knopf",              "ru": "Кнопка"},
        "buttonsImage":     {"en": "Image",             "de": "Bild",               "ru": "Картинка"},
        "buttonsText":      {"en": "Text",              "de": "Text",               "ru": "Текст"},
        "buttonsOption":    {"en": "Value",             "de": "Wert",               "ru": "Значение"},
        "bRadius":          {"en": "Button radius",     "de": "Knopfradius",        "ru": "Радиус закругления"},
        "bTextAlign":       {"en": "Text align",        "de": "Textposition",       "ru": "Позиция текста"},
        "group_button_options": {"en": "Button options", "de": "Knopfeinstellungen", "ru": "Опции кнопки"},
        "group_style":      {"en": "Style",             "de": "Stil",               "ru": "Стиль"},
        "group_test":       {"en": "Test",              "de": "Test",               "ru": "Тест"},
        "alwaysOpened":     {"en": "Always opened",     "de": "Immer auf",          "ru": "Всегда открыта"},
        "imagePaddingLeft": {"en": "Image padding left", "de": "Bildoffset von links", "ru": "Сдвиг картинки слева"},
        "imagePaddingTop":  {"en": "Image padding top", "de": "Bildooffset von oben", "ru": "Сдвиг картинки сверху"}
    });
}

vis.binds.bars = {
    version: "0.1.4",
    showVersion: function () {
        if (vis.binds.bars.version) {
            console.log('Version vis-bars:' + vis.binds.bars.version);
            vis.binds.bars.version = null;
        }
    },
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
                if (view === '___settings') continue;
                if (vis.views[view].widgets[barsIntern.wid]) {
                    visWidget = vis.views[view].widgets[barsIntern.wid];
                    break;
                }
            }
        }

        return visWidget;
    },
    drawButton: function (wid, i, opt) {
        //var style = "style='" + (opt.bWidth ? ("width:" + opt.bWidth + "px;") : '') + (opt.bHeight ? ("height:" + opt.bHeight + "px;") : '') + "'";
        var style = 'style="height:100%;width: 100%"';//'style="height:100%; width: 100%"';
        var cssClass = opt.bStyleNormal;
        cssClass = cssClass || 'ui-state-default ui-button ui-widget';

        var text = '<div id="' + wid + '_btn' + i + '" ' + style + ' class="' + cssClass + '">\n';
        var isTable = true || (opt['buttonsImage' + i] && opt['buttonsText' + i]);
        if (isTable) {
            text += '<table style="height:100%;width:100%" class="vis-no-spaces"><tr style="width:100%;height:100%" class="vis-no-spaces">\n';
            text += '<td class="vis-no-spaces" style="width:' + opt.bOffset + '%; vertical-align: middle; text-align: ' + opt.bImageAlign + '">\n';
        }
        if (opt['buttonsImage' + i]) {
            text += '<img class="vis-no-spaces" src="' + ((opt['buttonsImage' + i].indexOf('/') !== -1) ?
                    opt['buttonsImage' + i] : 'img/' + opt['buttonsImage' + i]) + '" style="' +
                (opt.bWidth  ? ('max-width:'  + (opt.bWidth  - 5) + 'px;') : '') +
                (opt.bHeight ? ('max-height:' + (opt.bHeight - 5) + 'px;') : '') +
                'width: 100%;' +
                'padding-left: ' + (opt.imagePaddingLeft || 0) + 'px;' +
                'padding-top: '  + (opt.imagePaddingTop  || 0) + 'px;' +
                '" />\n';
        }
        if (isTable) {
            text += '</td><td class="vis-no-spaces" style="width: ' + (100 - opt.bOffset) + '%; text-align: ' + opt.bTextAlign + '">\n';
        }
        if (opt['buttonsText' + i]) {
            text += '<span style="text-align: ' + opt.bTextAlign + '">' + opt['buttonsText' + i] + '</span>\n';
        }
        if (isTable) {
            text += '</td></tr></table>\n';
        }
        text += '</div>\n';
        return text;
    },
    draw: function($div) {
        var barsOptions = $div.data('barsOptions');
        var barsIntern  = $div.data('barsIntern');

        var isHorizontal = (barsOptions.bPosition === 'floatHorizontal' ||
                            barsOptions.bPosition === 'dockTop' ||
                            barsOptions.bPosition === 'dockBottom');

        $('#jquerySideBar_' + barsIntern.wid).remove();
        
        var text = '';
        var calcH = '100%';//(barsOptions.bTheme && barsOptions.bSpace) ? 'calc(100% - ' + (barsOptions.bSpace * 2) + 'px)' : '100%';
        var calcW = '100%';//(barsOptions.bTheme && barsOptions.bSpace) ? 'calc(100% - ' + (barsOptions.bSpace * 2) + 'px)' : '100%';
        if (barsOptions.bPosition === 'dockTop' || barsOptions.bPosition === 'dockBottom') {
            calcH = 'calc(100% - 10px)';
        } else if (barsOptions.bPosition === 'dockLeft' || barsOptions.bPosition === 'dockRight') {
            calcW = 'calc(100% - 10px)';
        }
        text += '<table style="width:' + calcW + '; height: ' + calcH + '; ' + (barsOptions.bLayout === 'fixed' ? 'table-layout: fixed' : '') + '" class="vis-no-spaces">';
        if (isHorizontal) {
            text += '<tr class="vis-no-spaces">';
            for (var d = 1; d <= barsOptions.bCount; d++) {
               text += '<td class="vis-no-spaces" style="height:100%">' + this.drawButton(barsIntern.wid, d, barsOptions, false) + '</td>';

                if (barsOptions.bSpace && d != barsOptions.bCount){
                   text += '<td class="vis-no-spaces" style="width:' + barsOptions.bSpace + 'px"></td>';
               }
            }
            text += '</tr>';
        }
        else { // vertical
            var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            for (var i = 1; i <= barsOptions.bCount; i++) {
                text += '<tr class="vis-no-spaces"><td class="vis-no-spaces" ' + (isFirefox && barsOptions.bLayout === 'fixed' ? 'style="height:' + (100 / barsOptions.bCount).toFixed(2) : '') + '%">' +
                    this.drawButton(barsIntern.wid, i, barsOptions, true) + '</td></tr>';

                if (barsOptions.bSpace && i != barsOptions.bCount) {
                    text += '<tr class="vis-no-spaces"><td class="vis-no-spaces" style="height:' + barsOptions.bSpace + 'px"></td></tr>';
                }
            }
        }
        text += '</table>';

        $div.html(text).css({'border-radius': 0, padding: 0});

        for (var u = 1; u <= barsOptions.bCount; u++) {
            var $htmlBtn = $('#' + barsIntern.wid + '_btn' + u);
            $htmlBtn.data('ctrl', {div: $div[0], id: u});

            $htmlBtn.css({borderRadius: barsOptions.bRadius + 'px'});

            $htmlBtn.on('click touchstart', function () {
                // Protect against two events
                if (vis.detectBounce(this)) return;

                var div__ = $(this).data('ctrl').div;
                var onClick = $(div__).data('onClick');
                if (onClick) onClick(this, div__, $(this).data('ctrl').id);
            });
        }

        // Remove previous class
        //if (div._oldAttr) $div.removeClass(div._oldAttr);

        if (!barsOptions.bPosition ||
            barsOptions.bPosition === 'floatHorizontal' ||
            barsOptions.bPosition === 'floatVertical') {
            $('#' + barsIntern.wid).show();
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
        }
        else {
            if (!$().sidebar) {
                window.alert('Float types are not supported, while sidebars are not included');
                return;
            }

            $div.css({left: 'auto', top: 'auto'});
            var position;

            switch(barsOptions.bPosition) {
                case 'dockTop':
                    position = 'top';
                    break;
                case 'dockLeft':
                    position = 'left';
                    break;
                case 'dockRight':
                    position = 'right';
                    break;
                default:
                    position = 'bottom';
                    break;
            }
            var w = $div.width();
            var h = $div.height();
            $div.css({width: w, height: h});

            $div.sidebar({
                position: position,
                width:    $div.width()  + ((position === 'top' || position === 'bottom') ? 20 : 10),
                height:   $div.height() + ((position === 'top' || position === 'bottom') ? 10 : 20),
                open:     'click',
                close:    (barsOptions.alwaysOpened) ? 'none': undefined,
                id:       barsIntern.wid,
                root:     $('#visview_' + barsIntern.view)
            });

            if (barsOptions.alwaysOpened) $div.sidebar('open');

            if (0 && barsOptions.bTest && vis.editMode) {

                // Remove test flag
                vis.widgets[barsIntern.wid].data['bTest'] = false;
                vis.view[barsIntern.view].widgets[barsIntern.wid].data['bTest'] = false;

                if (barsIntern.wType === 'tplBarFilter') {
                    // Hide all
                    vis.changeFilter(null, '$', barsOptions.bShowEffect, barsOptions.bShowEffectMs, barsOptions.bHideEffect, barsOptions.bHideEffectMs);

                    // Show all
                    setTimeout (function () {
                        vis.changeFilter (null, '', barsOptions.bShowEffect, barsOptions.bShowEffectMs, barsOptions.bHideEffect, barsOptions.bHideEffectMs);
                    }, 500 + parseInt(barsOptions.bShowEffectMs, 10));
                }
                else
                if (barsIntern.wType === 'tplBarNavigator'){
                    var v = vis.activeView;
                    // find other view
                    for (var t in vis.views) {
                        if (t === '___settings') continue;
                        if (t !== v) break;
                    }

                    vis.changeView (t,
                        {effect: barsOptions.bHideEffect, duration: barsOptions.bHideEffectMs},
                        {effect: barsOptions.bShowEffect, duration: barsOptions.bShowEffectMs});

                    // Show all
                    setTimeout (function () {
                        vis.changeView (v,
                            {effect: barsOptions.bHideEffect, duration: barsOptions.bHideEffectMs},
                            {effect: barsOptions.bShowEffect, duration: barsOptions.bShowEffectMs});
                        vis.inspectWidgets([barsIntern.wid]);
                    }, 500 + parseInt (barsOptions.bShowEffectMs, 10));
                }
            }
            $('#jquerySideBar_' + barsIntern.wid).addClass(barsOptions.bTheme + ' vis-widget');

            $('#' + barsIntern.wid).hide();
            if (vis.editMode) {
                if (vis.activeWidgets.indexOf(barsIntern.wid) !== -1) {
                    vis.showWidgetHelper(barsIntern.wid, true);
                }
            }

            for (var k = 1; k <= barsOptions.bCount; k++) {
                $('#' + barsIntern.wid + '_btn' + k).css({borderRadius: barsOptions.bRadius + 'px'});
            }
        }
    },
    setState: function (div, newFilter) {
        var newFilters = (newFilter || newFilter === 0) ? newFilter.split(',') : [];
        var $div = $(div);
        var barsOptions = $div.data('barsOptions');
        var barsIntern  = $div.data('barsIntern');

        for (var i = 1; i <= barsOptions.bCount; i++) {
            var $htmlBtn = $('#' + barsIntern.wid + '_btn' + i);
            var isFound = false;
            for (var z = 0; z < newFilters.length; z++) {
                if (barsOptions['buttonsOption' + i] === newFilters[z]) {
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
                if (barsIntern && barsIntern.view === view && barsIntern.wType === 'tplBarFilter') {
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
                    barsOptions['buttonsImage'  + (x + 2)] = '';
                    barsOptions['buttonsText'   + (x + 2)] = filter[x].charAt(0).toUpperCase() + filter[x].slice(1).toLowerCase();
                    barsOptions['buttonsOption' + (x + 2)] = filter[x];
                }
                barsOptions.bCount = 1 + filter.length;
            }
            else {
                barsOptions.buttonsImage1  = '';
                barsOptions.buttonsText1   = _('Caption');
                barsOptions.buttonsOption1 = '';
                barsOptions.bCount         = 1;
            }
        }
        else
        if ($tpl.attr('id') === 'tplBarNavigator') {
            var cnt = 0;
            for (var s in vis.views) {
                if (!vis.views.hasOwnProperty(s)) continue;
                if (s === '___settings') continue;
                cnt++;
                barsOptions['buttonsImage'  + cnt] = '';
                barsOptions['buttonsText'   + cnt] = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
                barsOptions['buttonsOption' + cnt] = s;
            }
            barsOptions.bCount = cnt;
        }
    },
    init: function(wid, options, view, wType) {
        vis.binds.bars.showVersion();
        var $div = $('#' + wid);
        if (!$div.length) {
            setTimeout(function () {
                vis.binds.bars.init(wid, options, view, wType);
            }, 100);
        } else {
            var timer = $div.data('timer');
            if (timer) clearTimeout(timer);
            $div.data('timer', setTimeout(function () {
                vis.binds.bars._init(wid, options, view, wType);
            }, 100));
        }
    },
    _init: function(wid, options, view, wType) {
        var $div = $('#' + wid);
        if (!$div.length) {
            setTimeout(function () {
                vis.binds.bars.init(wid, options, view, wType);
            }, 100);
            return;
        } else {
            var timer = $div.data('timer');
            if (!timer) {
                $div.data('timer', function () {
                    vis.binds.bars.init(wid, options, view, wType);
                });
            } else {
                $div.data('timer', null);
            }
        }

        if (!$div.find('.vis-widget-body').length) {
            $div.append('<div class="vis-widget-body" style="overflow: visible"></div>');
        }
        $div = $div.find('.vis-widget-body');

        var barsIntern = {
            wid:        wid,
            wType:      wType,
            view:       view
            //editParent: null
        };
        var barsOptions = options;

        var isFound = false;
        for (var g = 0; g < vis.binds.bars.created.length; g++) {
            if (vis.binds.bars.created[g] === wid) {
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
                    var values = barsOptions.bValue.split(',');
                    for (var p = 1; p <= barsOptions.bCount; p++) {
                        var isFound2 = false;
                        for (var j = 0; j < values.length; j++) {
                            if(values[j] === barsOptions['buttonsOption' + p]) {
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
                    vis.changeFilter(null, barsOptions.bValue, barsOptions.bShowEffect, barsOptions.bShowEffectMs, barsOptions.bHideEffect, barsOptions.bHideEffectMs);
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
                        if (barsIntern.wType === 'tplBarFilter') {
                            var filter = '';
                            for (var w = 1; w <= barsOptions.bCount; w++) {
                                var $btn = $('#' + barsIntern.wid + '_btn' + w);
                                if ($btn.length && $btn.data('state')) {
                                    if (barsOptions['buttonsOption' + w]) {
                                        filter += (!filter ? '' : ',') + barsOptions['buttonsOption' + w];
                                    } else {
                                        // If disable all filters
                                        filter = '';
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

                            vis.changeFilter(null, filter, barsOptions.bShowEffect, barsOptions.bShowEffectMs, barsOptions.bHideEffect, barsOptions.bHideEffectMs);
                        }
                    }
                });
            }
        }
        else {
            // Install on click function
            if (!$div.data('onClick')) {
                $div.data('onClick', function (htmlBtn, div, r) {
                    var barsIntern = $(div).data('barsIntern');
                    var barsOptions = $(div).data('barsOptions');
                    vis.inspectWidgets([barsIntern.wid]);
                    //$htmlBtn = $('#' + barsIntern.wid + '_btn' + r);
                });
            }
        }
    }
};
if (vis.editMode) {
    vis.binds.bars.convertOldBars = function (widget) {
        if (widget.data && widget.data.baroptions) {
            try {
                var baroptions = JSON.parse(widget.data.baroptions);
                for (var opt in baroptions) {
                    if (baroptions.hasOwnProperty(opt) && opt === 'position') {
                        switch (baroptions[opt]) {
                            case '0':
                            case 0:
                                widget.data.bPosition = 'floatHorizontal';
                                widget.style.height = baroptions.bHeight + 10;
                                widget.style.width  = ((baroptions.bWidth + baroptions.bSpace) * baroptions.buttons.length) + 10;
                                break;
                            case '1':
                            case 1:
                                widget.data.bPosition = 'floatVertical';
                                widget.style.width = baroptions.bWidth + 10;
                                widget.style.height  = ((baroptions.bHeight + baroptions.bSpace) * baroptions.buttons.length) + 10;
                                break;
                            case '2':
                            case 2:
                                widget.data.bPosition = 'dockTop';
                                widget.style.height = baroptions.bHeight + 10;
                                widget.style.width  = ((baroptions.bWidth + baroptions.bSpace) * baroptions.buttons.length) + 10;
                                break;
                            case '3':
                            case 3:
                                widget.data.bPosition = 'dockBottom';
                                widget.style.height = baroptions.bHeight + 10;
                                widget.style.width  = ((baroptions.bWidth + baroptions.bSpace) * baroptions.buttons.length) + 10;
                                break;
                            case '4':
                            case 4:
                                widget.data.bPosition = 'dockLeft';
                                widget.style.width = baroptions.bWidth + 10;
                                widget.style.height  = ((baroptions.bHeight + baroptions.bSpace) * baroptions.buttons.length) + 10;
                                break;
                            case '5':
                            case 5:
                                widget.data.bPosition = 'dockRight';
                                widget.style.width = baroptions.bWidth + 10;
                                widget.style.height  = ((baroptions.bHeight + baroptions.bSpace) * baroptions.buttons.length) + 10;
                                break;
                        }
                    } else if (opt === 'buttons') {
                        widget.data.bCount = baroptions.buttons.length;
                        for (var button = 0; button < baroptions.buttons.length; button++) {
                            widget.data['buttonsText'   + (button + 1)] = baroptions.buttons[button].text;
                            widget.data['buttonsImage'  + (button + 1)] = baroptions.buttons[button].image;
                            widget.data['buttonsOption' + (button + 1)] = baroptions.buttons[button].option;
                        }
                    } else {
                        widget.data[opt] = baroptions[opt];
                    }
                }
            } catch (e) {
                console.log('Cannot convert. Invalid JSON in baroptions: ' + widget.data.baroptions);
            }
            delete widget.data.baroptions;
        }
        return widget;
    };
}
