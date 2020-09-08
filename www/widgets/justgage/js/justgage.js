/*
    ioBroker.vis justgage Widget-Set

    version: "1.0.2"

    Copyright 10.2015-2019 Pmant<patrickmo@gmx.de>

*/
'use strict';

/* globals vis, $, systemDictionary, JustGage */

// add translations for edit mode
if (vis.editMode) {
    $.extend(true, systemDictionary, {
        /**
         * tplJustgageValueColored
         */
        "color1":           {"en": "color 1",                   "de": "Farbe 1",                    "ru": "Цвет 1"},
        "color2":           {"en": "color 2",                   "de": "Farbe 2",                    "ru": "Цвет 2"},
        "color3":           {"en": "color 3",                   "de": "Farbe 3",                    "ru": "Цвет 3"},
        "min":              {"en": "min",                       "de": "min",                        "ru": "мин"},
        "mid":              {"en": "mid",                       "de": "mid",                        "ru": "середина"},
        "max":              {"en": "max",                       "de": "max",                        "ru": "макс"},
        "balance1":         {"en": "mid color 1+2 at",          "de": "Mitte Farbe 1+2 bei",        "ru": "средний цвет 1+2 при"},
        "balance2":         {"en": "mid color 2+3 at",          "de": "Mitte Farbe 2+3 bei",        "ru": "средний цвет 2+3 при"},
        "digits":           {"en": "Digits after comma",        "de": "Zeichen nach Komma",         "ru": "Знаков после запятой"},
        "is_comma":         {"en": "Divider comma",             "de": "Komma als Trennung",         "ru": "Запятая-разделитель"},
        "is_tdp":           {"en": "Use thousands separator",   "de": "Tausender Trennzeichen",     "ru": "Use thousands separator"},
        "factor":           {"en": "Multiply factor",           "de": "Wert multiplizieren",        "ru": "Фактор-множитель"},
        "html_prepend":     {"en": "Prepend value",             "de": "Voranstellen HTML",          "ru": "Префикс значения"},
        "html_append_singular": {
            "en": "Append to value (Singular)",
            "de": "HTML anhängen (Singular)",
            "ru": "Суффикс значения(един.ч.)"
        },
        "html_append_plural": {
            "en": "Append to value (Plural)",
            "de": "HTML anhängen(Plural)",
            "ru": "Суффикс значения(множ.ч.)"
        },
        "group_html":       {"en": "html",                      "de": "Html",                       "ru": "HTML"},
        "group_color":      {"en": "color",                     "de": "Farbe",                      "ru": "Цвет"},

        /**
         * tplJustgageJustGage
         */
        "min_oid":          {"en": "min",                       "de": "min",                        "ru": "мин"},
        "mid_oid":          {"en": "mid",                       "de": "mid",                        "ru": "середина"},
        "max_oid":          {"en": "max",                       "de": "max",                        "ru": "макс"},
        "group_value":      {"en": "value",                     "de": "Wert",                       "ru": "Значение"},
        "hideValue":        {"en": "hide value",                "de": "verstecke Wert",             "ru": "Скрыть значение"},
        "unit":             {"en": "unit",                      "de": "Einheit",                    "ru": "Единицы"},
        "valueFontColor":   {"en": "color",                     "de": "Farbe",                      "ru": "Цвет"},
        "valueFontFamily":  {"en": "font-family",               "de": "Schriftfamilie",             "ru": "font-family"},
        "valueOffsetY":     {"en": "Offset Y",                  "de": "Versatz Y",                  "ru": "Сдвиг по Y"},
        "group_title1":     {"en": "title",                     "de": "Titel",                      "ru": "Название"},
        "title":            {"en": "title",                     "de": "Titel",                      "ru": "Название"},
        "titleFontColor":   {"en": "color",                     "de": "Farbe",                      "ru": "Цвет"},
        "titleFontFamily":  {"en": "font-family",               "de": "Schriftfamilie",             "ru": "font-family"},
        "titleBelow":       {"en": "title below",               "de": "Titel unten",                "ru": "Название знизу"},
        "titleOffsetY":     {"en": "Offset Y",                  "de": "Versatz Y",                  "ru": "Сдвиг по Y"},
        "group_label":      {"en": "label",                     "de": "Beschriftung",               "ru": "Подпись"},
        "label_oid":        {"en": "label",                     "de": "Beschriftung",               "ru": "Подпись"},
        "labelFontColor":   {"en": "color",                     "de": "Farbe",                      "ru": "Цвет"},
        "labelFontFamily":  {"en": "font-family",               "de": "Schriftfamilie",             "ru": "font-family"},
        "labelOffsetY":     {"en": "Offset Y",                  "de": "Versatz Y",                  "ru": "Сдвиг по Y"},
        "group_pointer":    {"en": "pointer",                   "de": "Zeiger",                     "ru": "Стрелка"},
        "pointer":          {"en": "show pointer",              "de": "zeige Zeiger",               "ru": "Показать стрелку"},
        "pointerMid":       {"en": "show mid",                  "de": "zeige Mitte",                "ru": "Показать середину"},
        "pointerColor":     {"en": "color",                     "de": "Farbe",                      "ru": "Цвет"},
        "pointerOptions":   {"en": "pointerOptions",            "de": "pointerOptions",             "ru": "pointerOptions"},
        "hideInnerShadow":  {"en": "hide shadow",               "de": "verstecke Schatten",         "ru": "Скрыть тень"},
        "shadowOpacity":    {"en": "shadowOpacity",             "de": "shadowOpacity",              "ru": "Прозрачность тени"},
        "shadowSize":       {"en": "shadowSize",                "de": "shadowSize",                 "ru": "Размер тени"},
        "shadowVerticalOffset": {"en": "shadowVerticalOffset",  "de": "shadowVerticalOffset",       "ru": "Сдвиг тени"},
        "group_layout":     {"en": "layout",                    "de": "Layout",                     "ru": "Расположение"},
        "hideMinMax":       {"en": "hide min/max",              "de": "verstecke min/max",          "ru": "Скрыть min/max"},
        "donut":            {"en": "donut",                     "de": "donut",                      "ru": "Круг"},
        "donutStartAngle":  {"en": "donut start angle",         "de": "donut Startwinkel",          "ru": "Угол начала круга"},
        "noGradient":       {"en": "no gradient",               "de": "kein Farbverlauf",           "ru": "no gradient"},
        "sector1":          {"en": "End Sector 1",              "de": "Ende Sektor 1",              "ru": "End Sector 1"},
        "sector2":          {"en": "End Sector 2",              "de": "Ende Sektor 2",              "ru": "End Sector 2"},
        "gaugeColor":       {"en": "background color",          "de": "Hintergrundfarbe",           "ru": "Цвет фона"},
        "gaugeWidthScale":  {"en": "gauge width %",             "de": "Gauge Breite %",             "ru": "Ширина шкалы %"},

        /**
         * tplJustgageIndicatorColored
         */
        "equalAfter":       {"en": "equal after",               "de": "gleichbleibend nach",        "ru": "не изменяемое после"},
        "equalAfter_tooltip": {
            "en": "Time in seconds after that the\x0Avalue meant to be unchanged.",
            "de": "Zeit in Sekunden, nach welcher\x0Ader Wert als unverädert gilt.",
            "ru": "Время в секундах, после которого\x0Aсчитается, что значение не изменяется."
        },
        "group_text":       {"en": "text",                      "de": "Text",                       "ru": "Текст"},
        "up":               {"en": "up",                        "de": "hoch",                       "ru": "вверх"},
        "equal":            {"en": "equal",                     "de": "gleich",                     "ru": "равно"},
        "changeBgColor":    {"en": "change background",         "de": "ändere Hintergrund",         "ru": "change background"},
        "fullBri":          {"en": "max brightness",            "de": "maximale Helligkeit",        "ru": "max brightness"},
        "down":             {"en": "down",                      "de": "runter",                     "ru": "вниз"}
    });
}

// add translations for non-edit mode
$.extend(true, systemDictionary, {
    'Instance':  {'en': 'Instance', 'de': 'Instanz', 'ru': 'Инстанция'}
});

// this code can be placed directly in justgage.html
vis.binds.justgage = {
    version: "1.0.2",
    showVersion: function () {
        if (vis.binds.justgage.version) {
            console.log('Version justgage: ' + vis.binds.justgage.version);
            vis.binds.justgage.version = null;
        }
    },

    formatValue: function formatValue(value, decimals, _format) {
        if (typeof decimals !== 'number') {
            decimals = 2;
            _format = decimals;
        }
        var format = (_format === undefined) ? '.,' : _format;
        if (typeof value !== 'number') value = parseFloat(value);
        return isNaN(value) ? '' : value.toFixed(decimals || 0).replace(format[0], format[1]).replace(/\B(?=(\d{3})+(?!\d))/g, format[0]);
    },

    getVal: function (oid, defaultVal) {
        var f;
        if (vis.binds.justgage.isOID(oid)) {
            f = parseFloat(vis.states[oid + '.val']);
        } else {
            f = parseFloat(oid);
        }
        return isNaN(f) ? defaultVal : f;
    },

    isOID: function (oid) {
        return oid !== '' &&
               oid !== null &&
               oid !== undefined &&
               vis.states[oid + '.val'] !== undefined &&
               vis.states[oid + '.val'] !== null &&
               vis.states[oid + '.val'] !== 'null';
    },

    createValueColored: function (widgetID, view, data, style, withIndicator) {
        var $div = $('#' + widgetID);
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.justgage.createValueColored(widgetID, view, data, style, withIndicator);
            }, 100);
        }

        function textRenderer(value) {
            var val = parseFloat(value) || 0;
            if (data.factor !== undefined && data.factor !== '') {
                val = val * parseFloat(data.factor);
            }
            if (data.digits !== undefined && data.digits !== '') {
                val = val.toFixed(parseFloat(data.digits, 10));
            }
            if (data.attr('is_tdp')) {
                val = vis.binds.justgage.formatValue(val, data.digits ? parseInt(data.digits) : 2, data.attr('is_comma') ? '.,' : ',.');
            } else if (data.attr('is_comma')) {
                val = '' + val;
                val = val.replace('.', ',');
            }
            val += data.unit || '';
            return val;
        }

        var val = vis.binds.justgage.getVal(data.oid, 0);
        var min = vis.binds.justgage.getVal(data.min_oid, 0);
        var max = vis.binds.justgage.getVal(data.max_oid, 100);
        var mid = vis.binds.justgage.getVal(data.mid_oid, (min + max) / 2);
        var balance1 = clamp(parseFloat(data.balance1) || 50, 0.01, 99.99);
        var balance2 = clamp(parseFloat(data.balance2) || 50, 0.01, 99.99);

        var colors = [
            {
                pct: 0,
                color: data.color1 || '#0000aa',
                pow: Math.log(balance1 / 100) / Math.log(0.5)
            },
            {
                pct: (clamp(mid, min, Math.max(min + 1, max)) - min) / (Math.max(min + 1, max) - min),
                color: data.color2 || '#00aa00',
                pow: 1.0
            },
            {
                pct: 1.0,
                color: data.color3 || '#aa0000',
                pow: Math.log(0.5) / Math.log(balance2 / 100)
            }
        ];

        var color, text, ts, eqA, timeout, oldIndicator = '';
        $div.html('<div class="justgage-valueColored" data-oid="' + data.oid + '"></div>');
        var $content = $('#' + widgetID + ' .justgage-valueColored');

        eqA = parseFloat(data.equalAfter || 0) * 1000;

        oldIndicator = data.equal || '→';

        function refresh(refreshVal, direction) {
            colors[1].pct = (clamp(mid, min, Math.max(min + 1, max)) - min) / (Math.max(min + 1, max) - min);
            color = getColorGrad(pctInterval(min, Math.max(min + 1, max), clamp(val, min, max)), colors, data.fullBri);
            text = data.html_prepend || '';
            text += textRenderer(val);
            text += parseFloat(textRenderer(val)) === 1 ? data.html_append_singular || '' : data.html_append_plural || '';
            if (withIndicator && refreshVal) {
                var isStart;
                if (direction > 0) {
                    oldIndicator = data.up || '↑';
                    text += oldIndicator;
                    ts = Date.now();
                    isStart = true;
                } else if (direction < 0) {
                    oldIndicator = data.down || '↓';
                    text += data.down || '↓';
                    isStart = true;
                } else if (Date.now() - ts >= eqA) {
                    oldIndicator = data.equal || '→';
                    text += data.equal || '→';
                } else {
                    text += oldIndicator;
                }
                if (isStart && eqA) {
                    if (timeout) clearTimeout(timeout);

                    timeout = setTimeout(function () {
                        timeout = null;
                        refresh(true, 0);
                    }, eqA);
                }
            }
            text = '<span>' + text + '</span>';

            if (refreshVal) {
                if (data.changeBgColor) {
                    $content.html(text).animate({'background-color': color}, 700);
                } else {
                    $content.html(text).animate({color: color}, 700);
                }
            } else {
                if (data.changeBgColor) {
                    $content.animate({'background-color': color}, 700);
                } else {
                    $content.animate({color: color}, 700);
                }
            }
        }

        refresh(true, 0);

        function onChange(e, newVal, oldVal) {
            if (e.type === data.oid + '.val') {
                val = parseFloat(newVal) || 0;
                refresh(true, newVal - oldVal);
            } else
            if (e.type === data.mid_oid + '.val') {
                mid = parseFloat(newVal) || 0;
                refresh(false);
            } else
            if (e.type === data.max_oid + '.val') {
                max = parseFloat(newVal) || 0;
                refresh(false);
            } else
            if (e.type === data.min_oid + '.val') {
                min = parseFloat(newVal) || 0;
                refresh(false);
            }
        }

        var bound = [];

        // subscribe on updates of value
        if (vis.binds.justgage.isOID(data.oid)) {
            bound.push(data.oid + '.val');
            vis.states.bind(data.oid + '.val', onChange);
        }
        // subscribe on updates of mid
        if (vis.binds.justgage.isOID(data.mid_oid)) {
            bound.push(data.mid_oid + '.val');
            vis.states.bind(data.mid_oid + '.val', onChange);
        }
        // subscribe on updates of min
        if (vis.binds.justgage.isOID(data.min_oid)) {
            bound.push(data.min_oid + '.val');
            vis.states.bind(data.min_oid + '.val', onChange);
        }
        // subscribe on updates of max
        if (vis.binds.justgage.isOID(data.max_oid)) {
            bound.push(data.max_oid + '.val');
            vis.states.bind(data.max_oid + '.val', onChange);
        }

        if (bound.length) {
            $div.data('bound', bound);
            // remember bind handler
            $div.data('bindHandler', onChange);
        }

        if (vis.editMode && vis.activeWidgets.indexOf(widgetID) !== -1) {
            $div.hasClass('ui-resizable') && $div.resizable('destroy');
            vis.resizable($div);
        }
    },

    createIndicatorColored: function (widgetID, view, data, style) {
        var $div = $('#' + widgetID);
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.justgage.createIndicatorColored(widgetID, view, data, style);
            }, 100);
        }

        var val = vis.binds.justgage.getVal(data.oid, 0);
        var min = vis.binds.justgage.getVal(data.min_oid, 0);
        var max = vis.binds.justgage.getVal(data.max_oid, 100);
        var mid = vis.binds.justgage.getVal(data.mid_oid, (min + max) / 2);
        var balance1 = clamp(parseFloat(data.balance1) || 50, 0.01, 99.99);
        var balance2 = clamp(parseFloat(data.balance2) || 50, 0.01, 99.99);
        var colors = [
            {
                pct: 0,
                color: data.color1 || '#0000aa',
                pow: Math.log(balance1 / 100) / Math.log(0.5)
            },
            {
                pct: (clamp(mid, min, Math.max(min + 1, max)) - min) / (Math.max(min + 1, max) - min),
                color: data.color2 || '#00aa00',
                pow: 1.0
            },
            {
                pct: 1.0,
                color: data.color3 || '#aa0000',
                pow: Math.log(0.5) / Math.log(balance2 / 100)
            }
        ];

        var color, text, ts, eqA, timeout, oldIndicator = '';
        $div.html('<div class="justgage-indicatorColored" data-oid="' + data.oid + '"></div>');
        var $content = $('#' + widgetID + ' .justgage-indicatorColored');
        ts = Date.now();
        eqA = parseFloat(data.equalAfter || 0) * 1000;

        oldIndicator = data.equal || '→';

        function refresh(refreshVal, direction) {
            colors[1].pct = (clamp(mid, min, Math.max(min + 1, max)) - min) / (Math.max(min + 1, max) - min);
            color = getColorGrad(pctInterval(min, Math.max(min + 1, max), clamp(val, min, max)), colors, data.fullBri);
            if (refreshVal) {
                var isStart;
                if (direction > 0) {
                    oldIndicator = data.up || '↑';
                    text = oldIndicator;
                    ts = Date.now();
                    isStart = true;
                } else if (direction < 0) {
                    oldIndicator = data.down || '↓';
                    text = data.down || '↓';
                    isStart = true;
                } else if (Date.now() - ts >= eqA) {
                    oldIndicator = data.equal || '→';
                    text = data.equal || '→';
                } else {
                    text = oldIndicator;
                }

                if (data.changeBgColor) {
                    $content.html(text).animate({'background-color': color}, 700);
                } else {
                    $content.html(text).animate({color: color}, 700);
                }
                if (isStart && eqA) {
                    if (timeout) clearTimeout(timeout);

                    timeout = setTimeout(function () {
                        timeout = null;
                        refresh(true, 0);
                    }, eqA);
                }
            } else {
                if (data.changeBgColor) {
                    $content.animate({'background-color': color}, 700);
                } else {
                    $content.animate({color: color}, 700);
                }
            }
        }

        refresh(true, 0);

        function onChange(e, newVal, oldVal) {
            if (e.type === data.oid + '.val') {
                val = parseFloat(newVal) || 0;
                refresh(true, newVal - oldVal);
            } else
            if (e.type === data.mid_oid + '.val') {
                mid = parseFloat(newVal) || 0;
                refresh(false);
            } else
            if (e.type === data.max_oid + '.val') {
                max = parseFloat(newVal) || 0;
                refresh(false);
            } else
            if (e.type === data.min_oid + '.val') {
                min = parseFloat(newVal) || 0;
                refresh(false);
            }
        }

        var bound = [];

        // subscribe on updates of value
        if (vis.binds.justgage.isOID(data.oid)) {
            bound.push(data.oid + '.val');
            vis.states.bind(data.oid + '.val', onChange);
        }
        // subscribe on updates of mid
        if (vis.binds.justgage.isOID(data.mid_oid)) {
            bound.push(data.mid_oid + '.val');
            vis.states.bind(data.mid_oid + '.val', onChange);
        }
        // subscribe on updates of min
        if (vis.binds.justgage.isOID(data.min_oid)) {
            bound.push(data.min_oid + '.val');
            vis.states.bind(data.min_oid + '.val', onChange);
        }
        // subscribe on updates of max
        if (vis.binds.justgage.isOID(data.max_oid)) {
            bound.push(data.max_oid + '.val');
            vis.states.bind(data.max_oid + '.val', onChange);
        }

        if (bound.length) {
            $div.data('bound', bound);
            // remember bind handler
            $div.data('bindHandler', onChange);
        }

        if (vis.editMode && vis.activeWidgets.indexOf(widgetID) !== -1) {
            $div.hasClass('ui-resizable') && $div.resizable('destroy');
            vis.resizable($div);
        }
    },

    createJustGage: function (widgetID, view, data, style) {
        var $div = $('#' + widgetID);
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.justgage.createJustGage(widgetID, view, data, style);
            }, 100);
        }

        function textRenderer(value) {
            var val = parseFloat(value);
            if (data.factor !== undefined && data.factor !== '') val = val * parseFloat(data.factor);
            if (data.digits !== undefined && data.digits !== '') val = val.toFixed(parseFloat(data.digits, 10));
            if (data.attr('is_tdp')) {
                val = vis.binds.justgage.formatValue(val, data.digits ? parseInt(data.digits) : 2, data.attr('is_comma') ? '.,' : ',.');
            } else if (data.attr('is_comma')) {
                val = '' + val;
                val = val.replace('.', ',');
            }
            val += data.unit || '';
            return val;
        }

        var val = vis.binds.justgage.getVal(data.oid, 0);
        var min = vis.binds.justgage.getVal(data.min_oid, 0);
        var max = vis.binds.justgage.getVal(data.max_oid, 100);
        var mid = vis.binds.justgage.getVal(data.mid_oid, (min + max) / 2);
        var balance1 = clamp(parseFloat(data.balance1) || 50, 0.01, 99.99);
        var balance2 = clamp(parseFloat(data.balance2) || 50, 0.01, 99.99);
        var colors  = [
            {
                pct:    0,
                color:  data.color1 || '#0000aa',
                pow:    Math.log(balance1 / 100) / Math.log(0.5)
            },
            {
                pct:    (clamp(mid, min, Math.max(min + 1, max)) - min) / (Math.max(min + 1, max) - min),
                color:  data.color2 || '#00aa00',
                pow:    1.0
            },
            {
                pct:    1.0,
                color:  data.color3 || '#aa0000',
                pow:    Math.log(0.5) / Math.log(balance2 / 100)
            }
        ];

        // justGage
        var pointerOptions;
        try {
            pointerOptions = JSON.parse(data.pointerOptions);
        } catch (e) {
            pointerOptions = {
                toplength:      -15,
                bottomlength:   10,
                bottomwidth:    12,
                color:          data.pointerColor   || '#8e8e93',
                stroke:         data.gaugeColor     || '#edebeb',
                stroke_width:   3,
                stroke_linecap: 'round'
            };
        }
        // delete old object
        $div.find('svg').length && $div.html('');

        var g = new JustGage({
            id: widgetID,
            textRenderer: textRenderer,
            value: val,
            min: min,
            max: Math.max(min + 1, max),
            mid: clamp(mid, min, Math.max(min + 1, max)),

            hideValue:          data.hideValue          || false,
            valueFontColor:     data.valueFontColor     || '#010101',
            valueFontFamily:    data.valueFontFamily    || 'Arial',
            valueMinFontSize:   10,
            valueOffsetY:       data.valueOffsetY       || 0,

            title:              data.title              || '',
            titleFontColor:     data.titleFontColor     || '#999999',
            titleFontFamily:    data.titleFontFamily    || 'sans-serif',
            titlePosition:      data.titleBelow         ? 'below' : 'above',
            titleOffsetY:       data.titleOffsetY       || 0,

            label:              vis.binds.justgage.isOID(data.label_oid + '.val') ? vis.states[data.label_oid + '.val'] : data.label_oid || '',
            labelFontColor:     data.labelFontColor     || '#b3b3b3',
            labelFontFamily:    data.labelFontFamily    || 'Arial',
            labelOffsetY:       data.labelOffsetY       || 0,

            hideMinMax:         data.hideMinMax         || false,
            donut:              data.donut              || false,
            pointer:            data.pointer            || false,
            pointerMid:         data.pointerMid         || false,
            pointerOptions:     pointerOptions,

            startAnimationTime: 0,
            refreshAnimationTime: 700,
            counter:            false,

            gaugeColor:         data.gaugeColor         || '#ebebeb',
            fullBrightness:     !!data.fullBri,
            customSectors:      data.noGradient ? [
                {
                    color: colors[0].color,
                    lo: min,
                    hi: data.sector1 || mid
                },
                {
                    color: colors[1].color,
                    lo: data.sector1 || mid,
                    hi: data.sector2 || mid
                },
                {
                    color: colors[2].color,
                    lo: data.sector2 || mid,
                    hi: max
                }
            ] : [],
            levelColors: colors,
            gaugeWidthScale:    data.gaugeWidthScale ? data.gaugeWidthScale / 100 : 1.0,
            donutStartAngle:    data.donutStartAngle || 90,

            shadowOpacity:      parseFloat(data.shadowOpacity) || 0.2,
            shadowSize:         parseInt(data.shadowSize) || 5,
            shadowVerticalOffset: parseInt(data.shadowVerticalOffset) || 3,
            hideInnerShadow:    data.hideInnerShadow || false
        });

        function onChange(e, newVal) {
            if (e.type === data.oid + '.val') {
                val = parseFloat(newVal) || 0;
            } else
            if (e.type === data.mid_oid + '.val') {
                mid = parseFloat(newVal) || 0;
            } else
            if (e.type === data.max_oid + '.val') {
                max = parseFloat(newVal) || 0;
            } else
            if (e.type === data.min_oid + '.val') {
                min = parseFloat(newVal) || 0;
            } else
            if (e.type === data.label_oid + '.val') {
                g.config.label = newVal;
            }

            g.config.value = val;
            g.config.min = min;
            g.config.max = Math.max(min + 1, max);
            g.config.mid = clamp(mid, min, Math.max(min + 1, max));
            colors[1].pct = (clamp(mid, min, Math.max(min + 1, max)) - min) / (Math.max(min + 1, max) - min);
            g.config.levelColors = colors;
            g.refresh(val);
        }

        var bound = [];
        // subscribe on updates of value
        if (vis.binds.justgage.isOID(data.oid)) {
            bound.push(data.oid + '.val');
            vis.states.bind(data.oid + '.val', onChange);
        }
        // subscribe on updates of mid
        if (vis.binds.justgage.isOID(data.mid_oid)) {
            bound.push(data.mid_oid + '.val');
            vis.states.bind(data.mid_oid + '.val', onChange);
        }
        // subscribe on updates of min
        if (vis.binds.justgage.isOID(data.min_oid)) {
            bound.push(data.min_oid + '.val');
            vis.states.bind(data.min_oid + '.val', onChange);
        }
        // subscribe on updates of max
        if (vis.binds.justgage.isOID(data.max_oid)) {
            bound.push(data.max_oid + '.val');
            vis.states.bind(data.max_oid + '.val', onChange);
        }
        // subscribe on updates of label
        if (vis.binds.justgage.isOID(data.label_oid)) {
            bound.push(data.label_oid + '.val');
            vis.states.bind(data.label_oid + '.val', onChange);
        }

        $div.data('destroy', function () {
            g.destroy && g.destroy();
        });

        if (bound.length) {
            $div.data('bound', bound);
            // remember bind handler
            $div.data('bindHandler', onChange);
        }

        if (vis.editMode && vis.activeWidgets.indexOf(widgetID) !== -1) {
            $div.hasClass('ui-resizable') && $div.resizable('destroy');
            vis.resizable($div);
        }
    },

    changedId: function (widgetID, view, newId, fields) {
        var obj = vis.objects[newId];
        var changed = [];
        // If it is real object and state
        if (obj && obj.common && obj.type === 'state') {
            if (obj.common.min !== undefined && !vis.views[view].widgets[widgetID].data.min_oid) {
                changed.push('min_oid');
                vis.views[view].widgets[widgetID].data.min_oid = obj.common.min;
                vis.widgets[widgetID].data.min_oid = obj.common.min;
            }
            if (obj.common.max !== undefined && !vis.views[view].widgets[widgetID].data.max_oid) {
                changed.push('max_oid');
                vis.views[view].widgets[widgetID].data.max_oid = obj.common.max;
                vis.widgets[widgetID].data.max_oid = obj.common.max;
            }
            if (obj.common.unit && !vis.views[view].widgets[widgetID].data.unit) {
                changed.push('unit');
                vis.views[view].widgets[widgetID].data.unit = obj.common.unit;
                vis.widgets[widgetID].data.unit = obj.common.unit;
            }
        }
        return changed.length ? changed : null;
    }
};

vis.binds.justgage.showVersion();

/** Get color for value */
function getColorGrad(pct, col, maxBri) {
    var no, inc, colors, percentage, rval, gval, bval, lower, upper, range, rangePct, pctLower, pctUpper, color, pow;

    no = col.length;
    if (no === 1) return col[0];
    inc = 1 / (no - 1);
    colors = [];
    for (var i = 0; i < col.length; i++) {
        var colr;
        if (typeof col[i] === 'object') {
            percentage = col[i].pct ? col[i].pct : inc * i;
            pow = col[i].pow || 1;
            colr = cutHex(col[i].color);
        } else {
            percentage = inc * i;
            pow = 1;
            colr = cutHex(col[i]);
        }

        rval = parseInt(colr.substring(0, 2), 16);
        gval = parseInt(colr.substring(2, 4), 16);
        bval = parseInt(colr.substring(4, 6), 16);

        colors[i] = {
            pct: percentage,
            pow: pow,
            color: {
                r: rval,
                g: gval,
                b: bval
            }
        };
    }

    if (pct === 0) {
        return 'rgb(' + [colors[0].color.r, colors[0].color.g, colors[0].color.b].join(',') + ')';
    }

    for (var j = 0; j < colors.length; j++) {
        if (pct <= colors[j].pct) {
            var colorMax = Math.max(colors[j].color.r, colors[j].color.g, colors[j].color.b);
            lower = colors[j - 1];
            upper = colors[j];
            range = upper.pct - lower.pct;
            rangePct = Math.pow((pct - lower.pct) / range, colors[j].pow / colors[j - 1].pow);
            pctLower = 1 - rangePct;
            pctUpper = rangePct;
            color = {
                r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
                g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
                b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
            };

            if (maxBri) {
                var colorMax2 = Math.max(color.r, color.g, color.b);
                return 'rgb(' + [Math.floor(color.r / colorMax2 * colorMax), Math.floor(color.g / colorMax2 * colorMax), Math.floor(color.b / colorMax2 * colorMax)].join(',') + ')';
            } else {
                return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
            }
        }
    }
}

function cutHex(str) {
    return str.charAt(0) === '#' ? str.substring(1, 7) : str;
}

//Helper Functions
function clamp(x, min, max) {
    if (x < min) {
        return min;
    }
    if (x > max) {
        return max;
    }
    return x;
}

function pctInterval(min, max, val) {
    var valClamp = clamp(val, min, max);
    return (valClamp - min) / (max - min);
}
