"use strict";


(function ( $ ) {
    $.fn.scala = function (options, arg) {
        if (typeof options == 'string') {
            if (options == 'value') {
                return this.each(function () {
                    var $this = $(this);
                    $this.find('.scalaInput').val(arg).trigger('change');
                });
            }
            return;
        }

        function h2rgba (h, a) {
            var rgb;
            h = h.substring(1,7);
            rgb = [
                parseInt(h.substring(0,2), 16),
                parseInt(h.substring(2,4), 16),
                parseInt(h.substring(4,6), 16)
            ];

            return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
        }

        var settings = $.extend({
            bgColor:    "#EEEEEE",
            value:      0,
            width:      0,
            thickness:  null,
            unit:       null,
            fontSize:   24,
            readOnly:   false,
            color:      '#FFCC00',
            alwaysShow: false,
            hideNumber: false,
            change:      function (value) {
                console.log('change ' + value);
            },
            changing:   function (value) {},
            onshow:     function (isShow) {},
            onhide:     function (isShow) {},
            click:      function () {
                console.log('click');
            },
            colorize: function (color, value) {
                return h2rgba(color, (value - settings.min) / (settings.max - settings.min) + 0.5)
            },
            min: 0,
            max: 100
        }, options);

        return this.each(function () {
            // Do something to each element here.
            var $this = $(this);
            if ($this.data('scaled')) return;
            $this.data('scaled', true);
            $this.wrapInner('<div class="scalaWrapped"></div>');
            var divW = $this.width();
            var divH = $this.height();
            var divMax = ((divW > divH) ? divW : divH);

            // calculate thickness
            if (!settings.width)     settings.width = Math.round(divMax + 30) + '';
            if (!settings.thickness) settings.thickness = 1 - (divMax / settings.width);

            $this.prepend('<input type="text" value="' + settings.value + '" class="scalaInput" data-width="' + settings.width + '" data-thickness="' + settings.thickness + '"/>');

            var $scalaInput   = $this.find('.scalaInput');
            var $scalaWrapped = $this.find('.scalaWrapped');

            var $knobDiv = $scalaInput.knob({
                release: function () {
                    $knobDiv._mouseDown = false;

                    hide('release');

                    if ($knobDiv._pressTimer) {
                        $knobDiv._pressTimer = null;
                        setValue($knobDiv._oldValue);
                        if (settings.click) {
                            var newVal = settings.click($knobDiv._oldValue);

                            if (newVal !== undefined) setValue(newVal);
                        }
                    } else {
                        // remove unit
                        var val = $scalaInput.val();
                        if (settings.unit !== null && val.substring(val.length - settings.unit.length, val.length) == settings.unit) {
                            val = val.substring(0, val.length - settings.unit.length);
                        }
                        if (settings.change && $knobDiv._oldValue != val) settings.change(val);
                    }
                },
                cancel: function () {
                    $knobDiv._mouseDown = false;
                    hide('cancel');
                    // set old value
                    setValue($knobDiv._oldValue);

                },
                change: function (value) {
                    if (settings.changing) settings.changing(value);
                },
                format: function (v) {
                    if (settings.unit) v = v + settings.unit;
                    return v;
                },
                displayPrevious : true,
                displayInput:     !settings.hideNumber,
                bgColor:          settings.bgColor,
                readOnly:         settings.readOnly,
                fgColor:          settings.color,
                inputColor:       settings.color,
                colorize:         settings.colorize ? settings.colorize : undefined,
                min:              settings.min,
                max:              settings.max
            });

            var w = $knobDiv.width();
            $this.data('$knobDiv', $knobDiv);

            function setValue(value) {
                console.log('Restore value ' + value);
                setTimeout(function () {
                    $scalaInput.val(value).trigger('change');
                }, 200);
            }

            function hide(event){
                if (!settings.alwaysShow && !$knobDiv._mouseEnter && !$knobDiv._mouseDown) {
                    $knobDiv.hide();
                    $scalaWrapped.show();
                }
                //console.log((event || '') +  ' (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown + ')');
            }
            function show(event){
                $knobDiv.show();
                //console.log((event || '') +  ' (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown + ')');
            }

            function press(event) {
                if (!$knobDiv._mouseDown) {
                    var val = $scalaInput.val();
                    if (settings.unit !== null) {
                        val = val.substring(0, val.length - settings.unit.length);
                    }

                    $knobDiv._oldValue = val;
                    $knobDiv._mouseDown = true;
                    $knobDiv._pressTimer = setTimeout(function () {
                        $knobDiv._pressTimer = null;
                    }, 300);
                    console.log((new Date().getSeconds() + '.' + new Date().getMilliseconds())+ ' ' + (event || '') +  ' (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown + ')');
                    show(event);
                }
            }
            function unpress(event) {
                $knobDiv._mouseDown = false;
                console.log((new Date().getSeconds() + '.' + new Date().getMilliseconds()) + ' ' + (event || '') +  ' (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown + ')');
                hide(event);

                if ($knobDiv._pressTimer) {
                    clearTimeout($knobDiv._pressTimer);
                }
            }

            $knobDiv.css({
                position: 'absolute',
                left:      '-' + ((w - divW) / 2) + 'px',
                top:       '-' + ((w - divH) / 2) + 'px',
                'z-index': 2,
                cursor:    'pointer',
                'opacity': 0.7
            }).bind('mouseleave',function (e) {
                $knobDiv._mouseEnter = false;
                hide(e.type);
            }).bind('mousedown', function (e) {
                press(e.type);
            }).bind('mouseup', function (e) {
                unpress(e.type);
            }).bind('mouseenter', function (e) {
                $knobDiv._mouseEnter = true;
                show(e.type);
            }).bind('touchend', function (e) {
                $knobDiv._mouseEnter = false;
                unpress(e.type);
            });
            if (!settings.alwaysShow) {
                $knobDiv.hide();
            }

            $this.bind('mouseenter', function (e) {
                $knobDiv._mouseEnter = true;
                show(e.type);
            }).bind('touchstart', function (e) {
                if (e.simulated) {
                    e.preventDefault();
                    return;
                }
                press(e.type);
                var event = $.Event(e.type, {simulated: true, originalEvent: {touches: [{pageX: e.originalEvent.touches[e.originalEvent.touches.length - 1].pageX, pageY: e.originalEvent.touches[e.originalEvent.touches.length - 1].pageY}]}} );
                $knobDiv.find('canvas').trigger(event);
                e.preventDefault();
            }).bind('mousedown', function (e) {
                if (e.simulated) {
                    e.preventDefault();
                    return;
                }
                press(e.type);
                var event = $.Event(e.type, {simulated: true, pageX: e.pageX, pageY: e.pageY});
                $knobDiv.find('canvas').trigger(event);
                e.preventDefault();
            });

            $scalaInput.bind('focusout', function (e) {
                $knobDiv._mouseEnter = false;
                hide(e.type)
            }).bind('focusin', function (e) {
                unpress(e.type);
            }).css({
                'font-size': settings.fontSize,
                cursor: 'pointer',
                '-webkit-touch-callout': 'none',
                '-webkit-user-select': 'none',
                '-khtml-user-select': 'none',
                '-moz-user-select': 'none',
                '-ms-user-select': 'none',
                'user-select': 'none'
            }).prop('readonly', true);
        });
    };

    // possible options: waves wobble tada swing shake rubberBand pulse flash bounce
    $.fn.animateDiv = function (effect, options) {
        return this.each(function () {
            // Do something to each element here.
            var $this = $(this);
            options = options || {};
            effect = effect || 'waves';

            if (options.speed != 1 && options.speed != 2 && options.speed != 2) options.speed = 1;

            if (effect == 'waves') {
                var borderThickness = (options.tickness || 3) - 1;
                var border = ';border: ' + borderThickness + 'px ' + (options.style || 'solid') +' ' + (options.color || 'grey');

                var text = '<div class="wave wave1" style="top:-' + borderThickness + 'px; left: -' + borderThickness + 'px;width: ' + Math.round($this.width()) +
                    'px;height: ' + Math.round($this.height()) + 'px;border-radius: ' + (options.radius || $this.css('border-radius')) +
                    border +
                    '; position: absolute"></div>';
                $this.append(text);
                $this.append(text.replace('wave1', 'wave2'));

                $this.find('.wave1').show().addClass('animated' + options.speed + 's zoomIn1');
                $this.find('.wave2').show().addClass('animated' + options.speed + 's zoomIn2');

                setTimeout(function () {
                    $this.find('.wave1').remove();
                    $this.find('.wave2').remove();
                }, 2050);
            } else {
                $this.addClass('animated' + options.speed + 's ' + effect);
                setTimeout(function () {
                    $this.removeClass('animated' + options.speed + 's ' + effect);
                }, 2100);
            }
        });
    };

    $.fn.popupShow = function ($div, options, callback) {

        if (typeof options == 'function') {
            callback = options;
            options = null;
        }
        options = options || {};
        options.effect = options.effect || 'zoomIn';
        options.speed  = options.speed  || '05';
        return this.each(function () {
            // Do something to each element here.
            var $this = $(this);
            if (!$div) {
                console.log('no div');
                return;
            }
            var offset = $this.position();
            var eTop  = offset.top; //get the offset top of the element
            var eLeft = offset.left; //get the offset top of the element

            var dh = $div.show().height();
            var dw = $div.width();
            // calculate center
            var x = $this.width();
            var y = $this.height();
            var zindex = $div.css('z-index');
            zindex = options.zindex || ((zindex == 'auto') ? 1 : (zindex || 0) + 1);
            $div.css({position: 'absolute', left: eLeft + ($this.width() - dw) / 2, top: eTop + ($this.height() - dh) / 2, 'z-index': zindex});
            setTimeout(function () {
                $div.addClass('animated' + options.speed + 's ' + options.effect);
            }, 0);
            setTimeout(function () {
                $div.removeClass('animated' + options.speed + 's ' + options.effect);
                if (callback) callback();
            }, (options.speed == '05') ? 550 : parseInt(options.speed, 10) * 1000 + 50);
        });
    };
    $.fn.popupHide = function ($div, options, callback) {
        if (typeof $div == 'function') {
            callback = $div;
            $div = null;
        }
        if (typeof options == 'function') {
            callback = options;
            options = null;
        }
        options = options || {};
        options.effect = options.effect || 'zoomOut';
        options.speed  = options.speed  || '05';

        return this.each(function () {
            // Do something to each element here.
            if (!$div) {
                $div = $(this);
            }
            setTimeout(function () {
                $div.addClass('animated' + options.speed + 's ' + options.effect);
            }, 0);
            setTimeout(function () {
                $div.removeClass('animated' + options.speed + 's ' + options.effect);
                $div.hide();
                if (callback) callback();
            }, (options.speed == '05') ? 550 : parseInt(options.speed, 10) * 1000 + 50);
        });
    };

    $.fn.makeSlider = function (options, onChange, onIdle) {

        if (typeof options == 'string') {
            if (options == 'restart') {
                return this.each(function () {
                    var $this = $(this);
                    var options = $this.data('options');
                    if (options.timeout) {
                        $this.data('hideTimer', setTimeout(function () {
                            if (options.onIdle) options.onIdle();
                        }, options.timeout));
                    }
                });
            }
            return;
        }


        if (typeof options == 'function') {
            onIdle   = onChange;
            onChange = options;
            options  = null;
        }


        options = options || {};
        options.timeout  = (options.timeout === undefined) ? 2000 : options.timeout;
        options.min      = (options.min === undefined) ? 0: options.min;
        options.max      = (options.max === undefined) ? 100: options.max;
        options.value    = (options.value === undefined) ? options.max : options.value;
        options.show     = (options.show === undefined)  ? true : options.show;
        options.onIdle   = onIdle;
        options.onChange = onChange;

        return this.each(function () {
            var $this = $(this);

            if (options.timeout && options.show) {
                $this.data('hideTimer', setTimeout(function () {
                    if (onIdle) onIdle();
                }, options.timeout));
            }

            $this.data('options', options);

            $this.slider({
                orientation: "vertical",
                range:       "max",
                min:         options.min,
                max:         options.max,
                value:       options.value,
                slide: function( event, ui ) {
                    var timer     = $this.data('timer');
                    var hideTimer = $this.data('hideTimer');

                    if (timer)     clearTimeout(timer);
                    if (hideTimer) clearTimeout(hideTimer);

                    $this.data('timer', setTimeout(function () {
                        $this.data('timer', null);
                        if (options.onChange) options.onChange(ui.value);
                    }, 500));

                    if (options.timeout) {
                        $this.data('hideTimer', setTimeout(function () {
                            $this.data('hideTimer', null);
                            if (options.onIdle) options.onIdle();
                        }, options.timeout));
                    }
                }
            });
            //$this.find('.ui-slider-range').removeClass("ui-widget-header").css({background: 'blue'});
        });
    };

    $.fn.batteryIndicator = function (options, args) {
        if (typeof options == 'string') {
            if (options == 'show') {
                return this.each(function () {
                    var $this = $(this);
                    if (args === undefined) args = true;

                    if (args) {
                        $this.find('.vis-hq-battery').show();
                    } else {
                        $this.find('.vis-hq-battery').hide();
                    }
                });
            } else
            if (options == 'show') {
                return this.each(function () {
                    $(this).find('.vis-hq-battery').show();
                });
            } else
            if (options == 'hide') {
                return this.each(function () {
                    $(this).find('.vis-hq-battery').hide();
                });
            }
            return;
        }

        options = options || {};
        options.color = options.color || '#FF5555';
        options.angle = (options.angle !== undefined) ? options.angle : -90;
        options.size  = options.size || 32;

        return this.each(function () {
            var $this = $(this);

            $this.data('options', options);
            if ($this.find('.vis-hq-battery').length) return;

            $this.append('<div class="vis-hq-battery">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="' + options.size + '" height="' + options.size + '" viewBox="0 0 48 48">' +
                '<path d="M0 0h48v48h-48z" fill="none"/>' +
                '<path fill="' + options.color + '" transform="rotate(' + options.angle + ', 24, 24)" d="M31.33 8h-3.33v-4h-8v4h-3.33c-1.48 0-2.67 1.19-2.67 2.67v30.67c0 1.47 1.19 2.67 2.67 2.67h14.67c1.47 0 2.67-1.19 2.67-2.67v-30.67c-.01-1.48-1.2-2.67-2.68-2.67zm-5.33 28h-4v-4h4v4zm0-8h-4v-10h4v10z"/></svg>' +
                '</div>');
            if (!options.show) {
                $this.find('.vis-hq-battery').hide();
            }
        });
    }
}(jQuery));

// Add words for bars
if (vis.editMode) {
    $.extend(true, systemDictionary, {
        "circleWidth":      {"en": "Сircle width",      "de": "Kreisbreite",            "ru": "Ширина дуги"},
        "showValue":        {"en": "Show value",        "de": "Wert anzeigen",          "ru": "Показать значение"},
        "alwaysShow":       {"en": "Always show circle", "de": "Kreis immer zeigen",    "ru": "Показывать круг всегда"},
        "iconName":         {"en": "Icon",              "de": "Kleinbild",              "ru": "Миниатюра"},
        "iconOn":           {"en": "Active icon",       "de": "Aktivbild",              "ru": "Активная миниатюра"},
        "btIconWidth":      {"en": "Icon width",        "de": "Bildbreite",             "ru": "Ширина миниатюры"},
        "offsetAuto":       {"en": "Auto positioning",  "de": "Positionieren(Auto)",    "ru": "Автоматическое позиционирование"},
        "leftOffset":       {"en": "Left offset",       "de": "Offset links",           "ru": "Сдвиг слева"},
        "topOffset":        {"en": "Top offset",        "de": "Offset von Oben",        "ru": "Сдвиг сверху"},
        "group_leftRight":  {"en": "Descriptions",      "de": "Beschreibungen",         "ru": "Подписи"},
        "hoursLastAction":  {"en": "Hide last action after(hrs)", "de": "Ausblenden letze Anderungszeit nach(Std)", "ru": "Скрыть последнее изменение(часов)"},
        "timeAsInterval":   {"en": "Time as interval",  "de": "Zeit als Intervall",     "ru": "Время, как интервал"},
        "descriptionLeft":  {"en": "Description (left)", "de": "Beschreibung (links)",  "ru": "Подпись (слева)"},
        "infoLeftFontSize": {"en": "Left font size",    "de": "Schriftgrosse links",    "ru": "Размер шрифта слева"},
        "infoRight":        {"en": "Description (right)", "de": "Beschreibung (rechts)", "ru": "Подпись (справа)"},
        "infoFontRightSize": {"en": "Right font size",  "de": "Schriftgrosse rechts",   "ru": "Размер шрифта справа"},
        "group_styles":     {"en": "Styles",            "de": "Stil",                   "ru": "Стили"},
        "styleNormal":      {"en": "Normal",            "de": "Normal",                 "ru": "Нормальный"},
        "styleActive":      {"en": "Active",            "de": "Aktiv",                 "ru": "Активный"},
        "usejQueryStyle":   {"en": "Use jQuery Styles", "de": "jQuery Stil anwenden",   "ru": "Применить jQuery стили"},
        "changeEffect":     {"en": "Change effect",     "de": "Anderungseffekt",        "ru": "Эффект при изменении"},
        "waveColor":        {"en": "Wave color",        "de": "Wellenfarbe",            "ru": "Цвет волн"},
        "testActive":       {"en": "Test",              "de": "Test",                   "ru": "Тест"},
        "oid-battery":      {"en": "Battery object ID", "de": "Battery ObjektID",       "ru": "ID батарейного индикатора"},
        "oid-signal":       {"en": "Signal object ID",  "de": "Signal ObjektID",        "ru": "ID качества сигнала"},
        "group_value":      {"en": "Value",             "de": "Wert",                   "ru": "Значение"},
        "unit":             {"en": "Unit",              "de": "Einheit",                "ru": "Единицы"},
        "readOnly":         {"en": "Read only",         "de": "Nur lesend",             "ru": "Не изменять"},
        "group_center":     {"en": "Center",            "de": "Zentrum",                "ru": "Центр"},
        "caption":          {"en": "Caption",           "de": "Beschriftung",           "ru": "Подпись"},
        "hideNumber":       {"en": "Hide number",       "de": "Nummer ausblenden",      "ru": "Скрыть число"},
        "group_arc":        {"en": "Arc",               "de": "Bogen",                  "ru": "Дуга"},
        "angleOffset":      {"en": "Angle offset",      "de": "Winkeloffset",           "ru": "Сдвиг дуги"},
        "angleArc":         {"en": "Angle arc",         "de": "Bogenwinkel",            "ru": "Угол дуги"},
        "displayPrevious":  {"en": "Display previous",  "de": "Letztes Wert zeigen",    "ru": "Показывать предыдущее значение"},
        "cursor":           {"en": "Cursor",            "de": "Griff",                  "ru": "Ручка"},
        "thickness":        {"en": "Thickness",         "de": "Dicke",                  "ru": "Толщина"},
        "bgcolor":          {"en": "Background color",  "de": "Hintergrundfarbe",       "ru": "Цвет фона"},
        "linecap":          {"en": "Line cap",          "de": "Linienende",             "ru": "Округлое окончание"},
        "anticlockwise":    {"en": "Anticlockwise",     "de": "Gegenuhrzeigersinn",     "ru": "Против часовой стрелки"}
    });
}

$.extend(true, systemDictionary, {
    "just&nbsp;now":  {"en": "just&nbsp;now", "de": "gerade&nbsp;jetzt", "ru": "только&nbsp;что"},
    "for&nbsp;%s&nbsp;min.":  {"en": "for&nbsp;%s&nbsp;min.", "de": "vor&nbsp;%s&nbsp;Min.", "ru": "%s&nbsp;мин. назад"},
    "for&nbsp;%s&nbsp;hr.&nbsp;and&nbsp;%s&nbsp;min.": {
        "en": "for&nbsp;%s&nbsp;hr.&nbsp;and&nbsp;%s&nbsp;min.",
        "de": "vor&nbsp;%s&nbsp;St.&nbsp;und&nbsp;%s&nbsp;Min.",
        "ru": "%s&nbsp;часов&nbsp;и&nbsp;%s&nbsp;мин. назад"
    },
    "yesterday":              {"en": "yesterday", "de": "gestern", "ru": "вчера"},
    "for&nbsp;%s&nbsp;hours": {"en": "for&nbsp;%s&nbsp;hours", "de": "vor&nbsp;%s&nbsp;Stunden", "ru": "%s&nbsp;часов назад"}
});
// widget can has following parts:
// left info (descriptionLeft)
// right info (additional info)
// working/cancel icon
// center icon
// main form
// <div class="vis-widget-body">
//     <div class="vis-hq-rightinfo" style='position: absolite; z-index: 0"></div>
//     <div class="vis-hq-leftinfo"  style='position: absolite; z-index: 0"></div>
//     <div class="vis-hq-main"      style='z-index: 1">
//          <div class="vis-hq-icon" style='z-index: 1"></div>
//          <div class="vis-hq-text" style='z-index: 1"></div>
//     </div>
//     <div class="vis-hq-info-icon"  style='position: absolite; z-index: 2"></div>
// </div>

vis.binds.hqWidgets = {
    getTimeInterval: function (oldTime, hoursToShow) {
        var result = '';

        var newTime = new Date ();

        if (!oldTime) return '';
        if (typeof oldTime == 'string') {
            oldTime = new Date(oldTime);
        } else {
            if (typeof oldTime == 'number') oldTime = new Date(oldTime * 1000);
        }

        var seconds = (newTime.getTime() - oldTime.getTime ()) / 1000;

        if (hoursToShow && (seconds / 3600) > hoursToShow) return '';

        if (seconds < 60) {
            result = _('just&nbsp;now');
        } else
        if (seconds <= 3600)
            result = _('for&nbsp;%s&nbsp;min.', Math.floor (seconds / 60));
        else
        if (seconds <= 3600 * 24)
            result = _('for&nbsp;%s&nbsp;hr.&nbsp;and&nbsp;%s&nbsp;min.', Math.floor (seconds / 3600), (Math.floor (seconds / 60) % 60));
        else
        if (seconds > 3600 * 24 && seconds <= 3600 * 48)
            result = _('yesterday');
        else
        if (seconds > 3600*48) {
            result = _('for&nbsp;%s&nbsp;hours', Math.floor (seconds / 3600));
        }

        return result;
    },
    button: {
        showRightInfo: function ($div, value) {
            var data = $div.data('data');

            var time  = null;
            var timer = null;
            if (data.hoursLastAction) {
                // show time interval. It must be updated every minute
                if (data.timeAsInterval) {
                    time = vis.binds.hqWidgets.getTimeInterval(data.lc, data.hoursLastAction);
                    $div.find('.vis-hq-time').html(time);
                    if (!vis.editMode) {
                        timer = $div.data('lastTimer');
                        if (!timer) {
                            timer = setInterval(function () {
                                var time = vis.binds.hqWidgets.getTimeInterval(data.lc, data.hoursLastAction);
                                $div.find('.vis-hq-time').html(time);

                                if (time && $div.find('.vis-hq-time').text()){
                                    $div.find('.vis-hq-rightinfo').show();
                                } else {
                                    $div.find('.vis-hq-rightinfo').hide();
                                }
                            }, 60000);

                            $div.data('lastTimer', timer);
                        }
                    }

                } else {
                    // Show static date
                    time = vis.binds.basic.formatDate(data.lc, true, data.format_date);
                    $div.find('.vis-hq-time').html(time);
                }
            }

            // Kill timer if not required
            if (!timer) {
                var t = $div.data('lastTimer');
                if (t) clearTimeout(t);
            }

            // Set number value
            var text = null;
            if (data.wType == 'number') {
                text = $div.find('.vis-hq-rightinfo-text').html(((value === undefined || value === null) ? data.min : value) + ((data.unit === undefined) ? '' : data.unit));
            }

            // Hide right info if empty
            if (data.infoRight || time || (text && text.text())) {
                $div.find('.vis-hq-rightinfo').show();
            } else {
                $div.find('.vis-hq-rightinfo').hide();
            }

        },
        // Calculate state of button
        changeState: function ($div, isInit, isForce, isOwn) {
            var data = $div.data('data');

            var value = (data.tempValue !== undefined) ? data.tempValue : data.value;

            if (!isForce && data.oldValue !== undefined && data.oldValue == value) return;

            data.oldValue = value;

            if (data.temperature  ||
                value == data.min ||
                value === null    ||
                value === ''      ||
                value === undefined ||
                value === 'false' ||
                value === false) {
                data.state = 'normal';
            } else {
                data.state = 'active';
            }

            if (vis.editMode && data.testActive) {
                data.state = (data.state == 'normal') ? 'active' : 'normal';
            }

            if (value !== null && value !== undefined) {
                $div.find('.vis-hq-nodata').remove();
            }

            switch (data.state) {
                case 'normal':
                    $('#' + data.wid + ' .vis-hq-main')
                        .removeClass(data.styleActive)
                        .addClass(data.styleNormal);

                    if (data.iconName || data.iconOn) {
                        $div.find('.vis-hq-icon-img').attr('src', (data.iconName || ''));
                    }
                    break;
                case 'active':
                    $('#' + data.wid + ' .vis-hq-main')
                        .removeClass(data.styleNormal)
                        .addClass(data.styleActive);

                    if (data.iconName || data.iconOn) {
                        $div.find('.vis-hq-icon-img').attr('src', (data.iconOn || data.iconName));
                    }

                    break;
            }

            vis.binds.hqWidgets.button.showRightInfo($div, value);

            if (!data.ack || (data['oid-working'] && data.working)) {
                $div.find('.vis-hq-working').show();
            } else {
                $div.find('.vis-hq-working').hide();
            }

            if (data['oid-battery']) $div.batteryIndicator('show', data.battery || false);

            if (data['oid-signal']) {
                data.signal;
            }

            if (data['oid-humidity']) {
                $div.find('.vis-hq-humidity').html(data.humidity);
            }

            if (data['set-oid']) {
                $div.find('.vis-hq-set-temperature').html(data.set);
            }

            if (data['drive-oid']) {
                $div.find('.vis-hq-drive').html(data.drive);
            }

            // Show change effect
            if (data.changeEffect && ((!isInit && !isOwn) || (vis.editMode && data.testActive))) {
                var $main = $div.find('.vis-hq-main');
                $main.animateDiv(data.changeEffect, {color: data.waveColor});
            }
        },
        changedId: function (wid, view, newId, attr, isCss) {
            // Try to extract whole information

        },
        draw: function ($div) {
            var data = $div.data('data');
            data.state = data.state || 'normal';
            var radius = $div.css('borderRadius');

            // place left-info, right-info, caption and image
            if (!$div.find('.vis-hq-main').length) {
                var text = '';
                if (data.descriptionLeft) {
                    text += '<div class="vis-hq-leftinfo" style="padding-left: 15px; padding-right:50px; font-size: ' + (data.infoLeftFontSize || 12) + 'px"><span class="vis-hq-leftinfo-text">' +
                        (data.descriptionLeft || '').replace(/\s/g, '&nbsp;').replace(/\\n/g, '<br>') + '</span></div>\n';
                }
                if (data.infoRight || data.wType == 'number' || data.hoursLastAction) {
                    text += '<div class="vis-hq-rightinfo" style="padding-right: 15px; font-size: ' + (data.infoFontRightSize || 12) + 'px"><span class="vis-hq-rightinfo-text">' +
                        (data.infoRight || '').replace(/\s/g, '&nbsp;').replace(/\\n/g, '<br>') + '</span>';

                    if (data.hoursLastAction) {
                        if (data.infoRight || data.wType == 'number') text += '<br>';
                        text += '<span class="vis-hq-time"></span>';
                    }

                    text += '</div>\n';
                }
                text += '<div class="vis-hq-main" style="z-index: 1"><div class="vis-hq-middle">\n';

                if (data.offsetAuto) {
                    text += '<table class="vis-hq-table hq-no-space" style="position: absolute"><tr class="hq-no-space"><td class="hq-no-space"><div class="vis-hq-icon" style="text-align: center;"></div></td>\n';
                } else {
                    text += '<table class="vis-hq-table hq-no-space" style="position: absolute;top:' + data.topOffset + '%;left:' + data.leftOffset + '%"><tr class="hq-no-space"><td class="hq-no-space"><div class="vis-hq-icon" style="text-align: center;"></div></td>\n';
                }

                if (data.caption) {
                    if ($div.height() > $div.width()) text += '</tr><tr class="hq-no-space">';
                    text += '<td class="hq-no-space"><div class="vis-hq-text-caption" style="text-align: center;"></div></td>';
                }

                text += '</tr></table></div></div></div>';
                $div.append(text);
            }
            // Get the border radius from parent
            var $main = $div.find('.vis-hq-main');
            $main.css({borderRadius: radius});
            $div.find('.vis-hq-text-caption').html(data.caption || '');

            var width = $div.width();
            var offset = width - 20 - parseInt(radius, 10);
            if (offset < width / 2) offset = width / 2;
            $div.find('.vis-hq-leftinfo').css({right: offset + 'px'});
            $div.find('.vis-hq-rightinfo').css({'padding-left': 5 + (width / 2) + 'px'});

            // Place icon
            var img = null;
            if (data.iconName || data.iconOn) {
                img = (data.state == 'normal') ? (data.iconName || ''): (data.iconOn || '');
                $div.find('.vis-hq-icon').html('<img class="vis-hq-icon-img" style="height: ' + data.btIconWidth + 'px; width: auto;" src="' + img + '"/>')
            } else {
                $div.find('.vis-hq-icon').html('');
            }

            if (data['oid-battery']) $div.batteryIndicator();

            if (data['oid-working']) {
                $div.append('<div class="vis-hq-working"><span class="ui-icon ui-icon-gear"></span></div>');
            }

            // find the right position for image and caption in the middle
            if (data.offsetAuto) {
                var $middle = $div.find('.vis-hq-table');
                $middle.css({
                    left: ($main.width()  - $middle.width()) / 2,
                    top:  ($main.height() - $middle.height()) / 2
                });
                if (img) {
                    $div.find('.vis-hq-icon-img').load(function () {
                        var $middle = $div.find('.vis-hq-table');
                        $middle.css({
                            left: ($main.width()  - $middle.width()) / 2,
                            top:  ($main.height() - $middle.height()) / 2
                        });
                    });
                }
            }

            // action
            if (1 || !vis.editMode) {
                if (data.oid) {

                    $div.append('<div class="vis-hq-nodata"><span class="ui-icon ui-icon-cancel"></span></div>');

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        data.value = newVal;
                        data.ack   = vis.states[data.oid + '.ack'];
                        data.lc    = vis.states[data.oid + '.lc'];

                        if (data.wType == 'number') {
                            if (newVal === false || newVal === 'false') data.value = data.min;
                            if (newVal === true  || newVal === 'true')  data.value = data.max;
                        }

                        vis.binds.hqWidgets.button.changeState($div);

                        if (data.wType == 'number') {
                            $main.scala('value', data.value);
                        }
                    });
                }

                if (data['oid-working']) {
                    vis.states.bind(data['oid-working'] + '.val', function (e, newVal, oldVal) {
                        data.working = newVal;
                        vis.binds.hqWidgets.button.changeState($div, false, true);
                    });
                }

                if (data['oid-battery']) {
                    vis.states.bind(data['oid-battery'] + '.val', function (e, newVal, oldVal) {
                        data.battery = newVal;
                        vis.binds.hqWidgets.button.changeState($div, false, true);
                    });
                }

                if (data['oid-signal']) {
                    vis.states.bind(data['oid-signal'] + '.val', function (e, newVal, oldVal) {
                        data.signal = newVal;
                        vis.binds.hqWidgets.button.changeState($div, false, true);
                    });
                }

                if (data['oid-humidity']) {
                    vis.states.bind(data['oid-humidity'] + '.val', function (e, newVal, oldVal) {
                        data.humidity = newVal;
                        vis.binds.hqWidgets.button.changeState($div, false, true);
                    });
                }

                if (data['set-oid']) {
                    vis.states.bind(data['set-oid'] + '.val', function (e, newVal, oldVal) {
                        data.set = newVal;
                        vis.binds.hqWidgets.button.changeState($div, false, true);
                    });
                }

                if (data['drive-oid']) {
                    vis.states.bind(data['drive-oid'] + '.val', function (e, newVal, oldVal) {
                        data.drive = newVal;
                        vis.binds.hqWidgets.button.changeState($div, false, true);
                    });
                }
            }

            // initiate state
            vis.binds.hqWidgets.button.changeState($div, true);

            // If dimmer or number
            if (data.wType == 'number') {
                var scalaOptions = {
                    change: function (value) {
                        data.value = parseFloat(value);
                        if (data.digits !== null) data.value = data.value.toFixed(data.digits);
                        if (data.is_comma) data.value = data.value.toString().replace('.', ',');
                        data.value = parseFloat(data.value);
                        data.ack   = false;
                        console.log('Set value: ' + data.value);
                        data.tempValue = undefined;
                        vis.binds.hqWidgets.button.changeState($div, false, false, true);
                        vis.setValue(data.oid, data.value);
                    },
                    changing: function (value) {
                        data.tempValue = value;
                        if (data.digits !== null) data.tempValue = data.tempValue.toFixed(data.digits);
                        if (data.is_comma) data.tempValue = data.tempValue.toString().replace('.', ',');
                        data.tempValue = parseFloat(data.tempValue);
                        vis.binds.hqWidgets.button.changeState($div, false, false, true);
                    },
                    click: function (val) {
                        val = data.value;
                        if (val - data.min > ((data.max - data.min) / 2)) {
                            val = data.min;
                        } else {
                            val = data.max;
                        }
                        console.log('Click. Set value ' + val);
                        return val;
                    },
                    alwaysShow: data.alwaysShow,
                    hideNumber: !data.showValue,
                    readOnly: vis.editMode,
                    width: ((100 + parseInt(data.circleWidth, 10)) * width / 100).toFixed(0)
                };

                // show for temperature color depends on value
                if (data.temperature) {
                    scalaOptions.colorize = function (color, value, isPrevious) {
                        var ratio = (value - data.min) / (data.max - data.min);
                        return 'hsla(' + (180 + Math.round(180 * ratio)) + ', 70%, 50%, ' + ((isPrevious) ? 0.7 : 0.9) + ')';
                    }
                }
                $main.scala(scalaOptions);
            } else {
                if (!vis.editMode && data.oid) {
                    $main.click(function () {
                        data.value = (data.state == 'normal') ? data.max : data.min;
                        data.ack   = false;
                        vis.binds.hqWidgets.button.changeState($div, false, false, true);
                        vis.setValue(data.oid, data.value);
                    });
                }
            }
        },
        init: function (wid, view, data, style, wType) {
            var $div = $('#' + wid).addClass('hq-button-base');
            if (!$div.length) {
                setTimeout(function () {
                    vis.binds.hqWidgets.button.init(wid, view, data, style, wType);
                }, 100);
                return;
            } else {
                var timer = $('#' + wid).data('timer');
                if (!timer) {
                    $('#' + wid).data('timer', function () {
                        vis.binds.hqWidgets.button.init(wid, view, data, style, wType);
                    });
                } else {
                    $('#' + wid).data('timer', null);
                }
            }
            var _data = {wid: wid, view: view, wType: wType};
            for (var a in data) {
                if (a[0] != '_') {
                    _data[a] = data[a];
                }
            }
            data = _data;

            data.styleNormal = data.usejQueryStyle ? 'ui-state-default' : (data.styleNormal || 'hq-button-base-normal');
            data.styleActive = data.usejQueryStyle ? 'ui-state-active'  : (data.styleActive || 'hq-button-base-on');
            data.min = (data.min === 'true' || data.min === true) ? true : ((data.min === 'false' || data.min === false) ? false : ((data.min !== undefined) ? parseFloat(data.min) : 0));
            data.max = (data.max === 'true' || data.max === true) ? true : ((data.max === 'false' || data.max === false) ? false : ((data.max !== undefined) ? parseFloat(data.max) : 100));
            data.digits = (!data.digits && data.digits !== 0) ? parseInt(data.digits, 10) : null;

            $div.data('data',  data);
            $div.data('style', style);

            if (data.oid) {
                data.value = vis.states.attr(data.oid + '.val');
                data.ack   = vis.states.attr(data.oid + '.ack');
                data.lc    = vis.states.attr(data.oid + '.lc');
            }
            if (data['oid-working'])  data.working  = vis.states.attr(data['oid-working']  + '.val');
            if (data['oid-battery'])  data.battery  = vis.states.attr(data['oid-battery']  + '.val');
            if (data['oid-signal'])   data.signal   = vis.states.attr(data['oid-signal']   + '.val');
            if (data['oid-humidity']) data.humidity = vis.states.attr(data['oid-humidity'] + '.val');
            if (data['set-oid'])      data.set      = vis.states.attr(data['set-oid']      + '.val');
            if (data['drive-oid'])    data.drive    = vis.states.attr(data['drive-oid']    + '.val');

            vis.binds.hqWidgets.button.draw($div);
        }
    },
    circle: {
        init: function (wid, view, data) {
            var $div = $('#' + wid).addClass('hq-button-base');
            if (!$div.length) {
                setTimeout(function () {
                    vis.binds.hqWidgets.circle.init(wid, view, data);
                }, 100);
                return;
            } else {
                var timer = $('#' + wid).data('timer');
                if (!timer) {
                    $('#' + wid).data('timer', function () {
                        vis.binds.hqWidgets.circle.init(wid, view, data);
                    });
                } else {
                    $('#' + wid).data('timer', null);
                }
            }
            var settings = data;
            var $scalaInput = $div.find('input');

            if (settings.oid) {
                $scalaInput.val(vis.states.attr(settings.oid + '.val'));
                if (1 || !vis.editMode) {
                    vis.states.bind(settings.oid + '.val', function (e, newVal, oldVal) {
                        data.value = newVal;
                        $scalaInput.val(data.value).trigger('change');
                    });
                }
            } else {
                $scalaInput.val(settings.min);
            }

            var offset = data.angleOffset;
            if (data.angleArc !== undefined && !offset && offset !== 0 && offset !== '0') {
                offset = 180 + (360 - parseInt(data.angleArc, 10)) / 2;
            }

            $scalaInput.attr('data-angleOffset', offset);
            $scalaInput.attr('data-angleArc',    data.angleArc);
            $scalaInput.attr('data-thickness',   data.thickness);
            $scalaInput.attr('data-linecap',     (settings.linecap === 'true' || settings.linecap === true) ? 'round' : 'butt');
            $scalaInput.show();
            var $knobDiv = $scalaInput.knob({
                width:   $div.width(),
                release: function () {
                    // remove unit
                    var oldValue = $scalaInput.data('oldValue');
                    var val = $scalaInput.val();

                    if ((settings.unit || settings.unit === 0) && val.substring(val.length - settings.unit.length, val.length) == settings.unit) {
                        val = val.substring(0, val.length - settings.unit.length);
                    }
                    if (oldValue != val && !vis.editMode && settings.oid) {
                        $scalaInput.data('oldValue', val);
                        vis.setValue(settings.oid, val);
                    }
                },
                cancel:  function () {
                },
                change:  function (value) {
                },
                format:  function (v) {
                    if (settings.unit) v = v + settings.unit;
                    return v;
                },
                displayPrevious : settings.displayPrevious,
                displayInput:     !settings.hideNumber,
                bgColor:          settings.bgcolor || undefined,
                readOnly:         settings.readOnly,
                fgColor:          settings.color,
                inputColor:       settings.color,
                colorize:         settings.colorize ? settings.colorize : undefined,
                min:              settings.min,
                max:              settings.max,
                step:             settings.step,
                cursor:           settings.cursor,
                rotation:         settings.anticlockwise ? 'anticlockwise' : 'clockwise'

            });
            if (settings.caption) {
                $scalaInput.after('<div style="position: absolute; left: 50%; top: 60%"><span style="position:relative; left: -50%" >' + settings.caption + '</span></div>');
            }

            $scalaInput.prop('readonly', true);
            var parentFont = $div.parent().css('font-size');
            var font       = $div.css('font-size');
            if (font != parentFont) $scalaInput.css('font-size', font);

            parentFont = $div.parent().css('font-weight');
            font       = $div.css('font-weight');
            if (font != parentFont) $scalaInput.css('font-weight', font);

            parentFont = $div.parent().css('font-style');
            font       = $div.css('font-style');
            if (font != parentFont) $scalaInput.css('font-style', font);

            parentFont = $div.parent().css('font-variant');
            font       = $div.css('font-variant');
            if (font != parentFont) $scalaInput.css('font-variant', font);
        }
    }
};