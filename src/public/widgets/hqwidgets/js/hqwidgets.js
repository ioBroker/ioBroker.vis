/*
    ioBroker.vis high quality Widget-Set

    version: "1.1.9"

    Copyright 6'2014-2021 bluefox <dogafox@gmail.com>

*/
'use strict';


(function ( $ ) {
    $.fn.scala = function (options, arg) {
        if (typeof options === 'string') {
            if (options === 'value') {
                if (arg === null || arg === undefined) arg = '0';
                return this.each(function () {
                    var $this = $(this);
                    var $input = $this.find('.scalaInput');
                    if ($input.val().toString() !== arg.toString()) {
                        $this.find('.scalaInput').val(arg).trigger('change');
                    }
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

            return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')';
        }

        var settings = $.extend({
            bgColor:    '#EEEEEE',
            value:      0,
            width:      0,
            thickness:  null,
            unit:       null,
            fontSize:   24,
            readOnly:   false,
            color:      '#FFCC00',
            alwaysShow: false,
            hideNumber: false,
            step:       1,
            change:     function (value) {
                console.log('change ' + value);
            },
            changing:   function (value) {},
            onshow:     function (isShow) {},
            onhide:     function (isShow) {},
            click:      function () {
                //console.log('click');
            },
            colorize:   function (color, value) {
                return h2rgba(color, (value - settings.min) / (settings.max - settings.min) + 0.5)
            },
            min:        0,
            max:        100,
            isComma:    false
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

            $this.prepend('<input type="text" value="' + settings.value + '" class="scalaInput" data-width="' + settings.width + '" data-height="' + settings.width + '" data-thickness="' + settings.thickness + '"/>');

            var $scalaInput   = $this.find('.scalaInput');
            var $scalaWrapped = $this.find('.scalaWrapped');

            if (typeof settings.step === 'string') {
                settings.step = parseFloat(settings.step.replace(',', '.') || 1);
            }

            var $knobDiv = $scalaInput.knobHQ({
                release: function (v, noAck) {
                    $knobDiv._mouseDown = false;

                    hide('release');

                    if ($knobDiv._pressTimer) {
                        $knobDiv._pressTimer = null;
                        setValue($knobDiv._oldValue);
                        if (settings.click) {
                            var newVal = settings.click($knobDiv._oldValue);
                            newVal !== undefined && newVal !== null && setValue(newVal);
                        }
                    } else {
                        // remove unit
                        var val = $scalaInput.val();
                        if (settings.unit !== null && val.substring(val.length - settings.unit.length, val.length) === settings.unit) {
                            val = val.substring(0, val.length - settings.unit.length);
                        }
                        if (settings.change/* && $knobDiv._oldValue != val*/) settings.change(val, noAck);
                    }
                },
                cancel:  function () {
                    $knobDiv._mouseDown = false;
                    hide('cancel');
                    // set old value
                    setValue($knobDiv._oldValue);

                },
                change:  function (value) {
                    if (settings.changing) settings.changing(value);
                },
                format:  function (v) {
                    if (settings.digits !== null) v = v.toFixed(settings.digits);
                    if (settings.isComma && v) v = v.toString().replace('.', ',');
                    if (settings.unit) v = v + settings.unit;
                    return v;
                },
                displayPrevious:  true,
                displayInput:     !settings.hideNumber,
                bgColor:          settings.bgColor,
                readOnly:         settings.readOnly,
                fgColor:          settings.color,
                inputColor:       settings.color,
                colorize:         settings.colorize ? settings.colorize : undefined,
                min:              settings.min,
                max:              settings.max,
                step:             parseFloat(settings.step || 1)
            });

            var w = $knobDiv.width();
            $this.data('$knobDiv', $knobDiv);

            function setValue(value) {
                console.log('Restore value ' + value);
                setTimeout(function () {
                    $scalaInput.data('setByUser', true);
                    $scalaInput.val(value).trigger('change');
                }, 200);
            }

            function hide(event){
                if (!settings.alwaysShow && !$knobDiv._mouseEnter && !$knobDiv._mouseDown) {
                    $knobDiv.hide();
                    $scalaWrapped.show();
                    if (settings.onhide) settings.onhide(false);
                }
                //console.log((event || '') +  ' (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown + ')');
            }
            function show(event){
                $knobDiv.show();
                if (settings.onshow) settings.onshow(true);

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
                    //console.log((new Date().getSeconds() + '.' + new Date().getMilliseconds())+ ' ' + (event || '') +  ' (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown + ')');
                    show(event);
                }
            }
            function unpress(event) {
                $knobDiv._mouseDown = false;
                //console.log((new Date().getSeconds() + '.' + new Date().getMilliseconds()) + ' ' + (event || '') +  ' (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown + ')');
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
            }).bind('mouseout', function (e) {
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

    $.fn.shineCheckbox = function (options, arg) {
        if (typeof options === 'string') {
            if (options === 'value') {
                return this.each(function () {
                    var $this = $(this);
                    var f = parseFloat(arg);
                    var val;
                    if (f.toString() == arg) {
                        val = f > 0;
                    } else {
                        val = arg === 'true' || arg === true;
                    }
                    if (val != $this.prop('checked')) {
                        $this.data('update', true);
                        $this.prop('checked', val).trigger('change');
                    }
                });
            }
            return;
        }

        if (!options) options = {};

        var settings = {
            backgroundCheckbox: '',//-webkit-linear-gradient(top, #fe9810 0%,#e75400 61%,#e75400 91%,#ea8810 100%)",
            backgroundButton: '',//"-webkit-linear-gradient(top, #efeeee 0%,#bcb9b8 100%);",
            checkboxSize:       options.checkboxSize    || 'big',
            checkboxColor:      options.checkboxColor   || 'grey',
            checkboxColorOn:    options.checkboxColorOn || options.checkboxColor || 'orange',
            readOnly:           options.readOnly        || false
        };

        return this.each(function () {
            // Do something to each element here.
            var $this = $(this);
            if ($this.data('shineCheckbox')) return;
            $this.data('shineCheckbox', true);
            $this.hide();
            var checkboxStyle = 'background: ' + settings.backgroundCheckbox;
            var buttonStyle   = 'background: ' + settings.backgroundButton;
            var color = $this.prop('checked') ? settings.checkboxColorOn : settings.checkboxColor;

            $this.wrap('<div class="checkbox-' + settings.checkboxSize + '-' + color + '-wrap" style="' + checkboxStyle + '"><div class="checkbox-' + settings.checkboxSize + '-' + color + '-button" style="' + buttonStyle + '"></div></div>');
            $this.change(function () {
                //console.log('change ' + $this.prop('checked'));
                var color;
                if ($this.prop('checked')) {
                    color = settings.checkboxColorOn;
                    setTimeout(function () {
                        $this.parent().addClass('checkbox-' + settings.checkboxSize + '-' + settings.checkboxColorOn + '-button-active');
                        $this.parent().parent().removeClass('checkbox-' + settings.checkboxSize + '-' + settings.checkboxColor + '-wrap').addClass('checkbox-' + settings.checkboxSize + '-' + settings.checkboxColorOn + '-wrap');
                    }, 100);
                } else {
                    color = settings.checkboxColor;
                    $this.parent().removeClass('checkbox-' + settings.checkboxSize + '-' + settings.checkboxColorOn + '-button-active');
                    $this.parent().parent().removeClass('checkbox-' + settings.checkboxSize + '-' + settings.checkboxColorOn + '-wrap').addClass('checkbox-' + settings.checkboxSize + '-' + settings.checkboxColor + '-wrap');
                }
            });

            if (!settings.readOnly) {
                $this.parent().parent().click(function () {
                    //console.log($this.prop('checked'));
                    $this.prop('checked', !$this.prop('checked')).trigger('change');
                });
            }

            if ($this.prop('checked')) $this.parent().addClass('checkbox-' + settings.checkboxSize + '-' + color + '-button-active');
        });
    };

    // possible options: waves wobble tada swing shake rubberBand pulse flash bounce
    $.fn.animateDiv = function (effect, options) {
        return this.each(function () {
            // Do something to each element here.
            var $this = $(this);
            options = options || {};
            effect  = effect || 'waves';

            if (options.speed != 1 && options.speed != 2 && options.speed != 2) {
                options.speed = 1;
            }

            if (effect === 'waves') {
                var borderThickness = (options.tickness || 3) - 1;
                var border = ';border: ' + borderThickness + 'px ' + (options.style || 'solid') +' ' + (options.color || 'grey');

                var text = '<div class="wave wave1" style="top:-' + borderThickness + 'px; left: -' + borderThickness + 'px;width: ' + Math.round($this.width()) +
                    'px;height: ' + Math.round($this.height()) + 'px;border-radius: ' + (options.radius || $this.css('border-radius')) +
                    border +
                    '; position: absolute"></div>';
                $this.prepend(text);
                $this.prepend(text.replace('wave1', 'wave2'));

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

    $.fn.popupShow  = function ($div, options, callback) {

        if (typeof options === 'function') {
            callback = options;
            options = null;
        }
        options = options || {};
        options.effect   = options.effect || 'zoomIn';
        options.speed    = options.speed  || '05';
        options.relative = options.relative || false;

        return this.each(function () {
            // Do something to each element here.
            var $this = $(this);
            if (!$div) {
                console.log('no div');
                return;
            }
            var offset = $this.position();
            var eTop  = options.relative ? 0 : offset.top; //get the offset top of the element
            var eLeft = options.relative ? 0 : offset.left; //get the offset top of the element

            var dh = $div.css({opacity: 0}).show().height();
            var dw = $div.width();
            // calculate center
            //var x = $this.width();
            //var y = $this.height();
            var zindex = $div.css('z-index');
            zindex = options.zindex || ((zindex === 'auto') ? 1 : (zindex || 0) + 1);
            $div.css({position: 'absolute', left: eLeft + ($this.width() - dw) / 2, top: eTop + ($this.height() - dh) / 2, 'z-index': zindex});
            setTimeout(function () {
                $div.addClass('animated' + options.speed + 's ' + options.effect);
            }, 0);
            setTimeout(function () {
                $div.removeClass('animated' + options.speed + 's ' + options.effect).css({opacity: 1});
                if (callback) callback();
            }, (options.speed === '05') ? 550 : parseInt(options.speed, 10) * 1000 + 50);
        });
    };
    $.fn.popupHide  = function ($div, options, callback) {
        if (typeof $div === 'function') {
            callback = $div;
            $div = null;
        }
        if (typeof options === 'function') {
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
            }, (options.speed === '05') ? 550 : parseInt(options.speed, 10) * 1000 + 50);
        });
    };

    $.fn.makeSlider = function (options, onChange, onIdle) {
        if (options === 'hide') {
            return this.each(function () {
                var $this = $(this);
                var timer = $this.data('hideTimer');
                if (timer) clearTimeout(timer);
                $this.data('hideTimer', null);
                $this.hide();
            });
        } else if (options === 'show') {
            return this.each(function () {
                var $this     = $(this).show();
                var hideTimer = $this.data('hideTimer');

                options = $this.data('options');

                if (onChange !== undefined && onChange !== null) {
                    if (options.invert) {
                        onChange = options.max - onChange + options.min;
                    }
                    $this.slider('value', onChange);
                }

                if (hideTimer) clearTimeout(hideTimer);

                if (options.timeout) {
                    $this.data('hideTimer', setTimeout(function () {
                        $this.data('hideTimer', null);
                        options.onIdle && options.onIdle();
                    }, options.timeout));
                }
            });
        }
        if (typeof options === 'string') {
            if (options === 'restart') {
                return this.each(function () {
                    var $this = $(this);
                    var options = $this.data('options');
                    if (options.timeout) {
                        $this.data('hideTimer', setTimeout(function () {
                            options.onIdle && options.onIdle();
                        }, options.timeout));
                    }
                });
            }
            return;
        }

        if (typeof options === 'function') {
            onIdle   = onChange;
            onChange = options;
            options  = null;
        }

        options = options || {};

        options.timeout  = (options.timeout === undefined) ? 2000  : options.timeout;
        options.min      = (options.min === undefined)     ? 0     : options.min;
        options.max      = (options.max === undefined)     ? 100   : options.max;
        options.value    = (options.value === undefined)   ? options.max : options.value;
        options.show     = (options.show === undefined)    ? true  : options.show;
        options.onIdle   = onIdle;
        options.onChange = onChange;

        if (options.invert) {
            options.value = options.max - options.value + options.min;
        }

        return this.each(function () {
            var $this = $(this);

            if (options.timeout && options.show) {
                $this.data('hideTimer', setTimeout(function () {
                    $this.data('hideTimer', null);
                    onIdle && onIdle();
                }, options.timeout));
            }

            $this.data('options', options);

            $this.slider({
                orientation:    'vertical',
                range:          'max',
                min:            options.min,
                max:            options.max,
                value:          options.value,
                start:          function () {
                    var timer = $this.data('hideTimer');
                    if (timer) {
                        clearTimeout(timer);
                        $this.data('hideTimer', null);
                    }
                },
                stop:           function (event, ui) {
                    var hideTimer = $this.data('hideTimer');

                    if (hideTimer) clearTimeout(hideTimer);

                    if (options.onChange) {
                        var val = ui.value;
                        if (options.invert) {
                            val = options.max - ui.value + options.min;
                        }

                        options.onChange(val);
                    }

                    if (options.timeout) {
                        $this.data('hideTimer', setTimeout(function () {
                            $this.data('hideTimer', null);
                            options.onIdle && options.onIdle();
                        }, options.timeout));
                    }
                }
            });

            $this.find('.ui-slider-range').removeClass('ui-widget-header').addClass('hq-blind-blind').css({'background-position': '0% 100%'});
        });
    };

    $.fn.batteryIndicator = function (options, args) {
        if (typeof options === 'string') {
            if (options === 'show') {
                return this.each(function () {
                    var $this = $(this);
                    if (args === undefined || args === null) {
                        args = true;
                    }

                    if (args) {
                        $this.find('.vis-hq-battery').show();
                    } else {
                        $this.find('.vis-hq-battery').hide();
                    }
                });
            } else
            if (options === 'hide') {
                return this.each(function () {
                    $(this).find('.vis-hq-battery').hide();
                });
            }
            return;
        }

        options = options || {};
        options.color = options.color || '#FF5555';
        options.angle = (options.angle !== undefined && options.angle !== null) ? options.angle : -90;
        options.size  = options.size  || 32;
        options.title = options.title || '';

        return this.each(function () {
            var $this = $(this);

            $this.data('options', options);
            if ($this.find('.vis-hq-battery').length) return;

            $this.append('<div class="vis-hq-battery ' + (options.classes || '') + '" title="' + options.title + '">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="' + options.size + '" height="' + options.size + '" viewBox="0 0 48 48">' +
                '<path d="M0 0h48v48h-48z" fill="none"/>' +
                '<path fill="' + options.color + '" transform="rotate(' + options.angle + ', 24, 24)" d="M31.33 8h-3.33v-4h-8v4h-3.33c-1.48 0-2.67 1.19-2.67 2.67v30.67c0 1.47 1.19 2.67 2.67 2.67h14.67c1.47 0 2.67-1.19 2.67-2.67v-30.67c-.01-1.48-1.2-2.67-2.68-2.67zm-5.33 28h-4v-4h4v4zm0-8h-4v-10h4v10z"/></svg>' +
                '</div>');
            if (!options.show) {
                $this.find('.vis-hq-battery').hide();
            }
        });
    };

    $.fn.popupDialog = function (options) {
        return this.each(function () {
            var $this = $(this);
            var $dialog;
            //    timeout: data.dialog_timeout,

            var dialog = $this.data('dialog');
            if (!dialog) {
                if (typeof options === 'string') {
                    console.log('Show prior init');
                    return;
                }
                var text = '<div class="vis-hq-dialog" style="display: none"></div>';
                $this.append(text);
                $dialog = $this.find('.vis-hq-dialog');

                $this.data('dialog', $dialog[0]);

                var dialogButtons = [
                    {
                        text: _('Ok'),
                        click: function () {
                            $dialog.dialog('close');
                        },
                        id: 'ok'
                    }
                ];

                dialogButtons[_('Ok')] = function () {
                    $dialog.dialog('close');
                };
                if (options.timeout) {
                    dialogButtons.unshift( {
                        id: 'donthide',
                        text: false,
                        icons: {primary: 'ui-icon-pin-w'},
                        click: function () {
                            $dialog.data('no-timeout', !$dialog.data('no-timeout'));
                            if ($dialog.data('no-timeout')) {
                                $(this).parent().find('#donthide').addClass('ui-state-error').button({
                                    icons: {primary: 'ui-icon-pin-s'}
                                });
                                var timeout = $dialog.data('timeout');
                                if (timeout) {
                                    clearTimeout(timeout);
                                    $dialog.data('timeout', null);
                                }
                            } else {
                                $(this).parent().find('#donthide').removeClass('ui-state-error').button({
                                    icons: {primary: 'ui-icon-pin-w'}
                                });
                                $dialog.data('timeout', setTimeout(function () {
                                    $dialog.dialog('close');
                                }, data.timeout));
                            }
                        }
                    });
                }
                $dialog.dialog({
                    autoOpen: options.open   || false,
                    width:    options.width  || 800,
                    height:   options.height || 400,
                    modal:    options.modal === undefined ? true : !!options.modal,
                    title:    options.title  || _('Chart'),
                    show:     {
                        effect: options.effect,
                        duration: 500
                    },
                    open:    function (event, ui) {
                        $dialog.height(options.height || 400);
                        $(this).parent().css('top', ($(window).height() - $(this).parent().height()) / 2);

                        $(this).parent().find('#donthide').css({width: 37, height: 37});
                        $(this).parent().find("#ok").focus();
                        if (options.effect) {
                            setTimeout(function () {
                                $dialog.html(options.content || '');
                            }, 500);
                        } else {
                            $dialog.html(options.content || '');
                        }
                        if (options.timeout && !$dialog.data('no-timeout')) {
                            $dialog.data('timeout', setTimeout(function () {
                                $dialog.dialog('close');
                            }, options.timeout));
                        }
                        //$('[aria-describedby="dialog_delete"]').css('z-index', 11002);
                        //$('.ui-widget-overlay').css('z-index', 1001);
                    },
                    close:   function () {
                        $dialog.html('');
                        var timeout = $dialog.data('timeout');
                        if (timeout) {
                            clearTimeout(timeout);
                            $dialog.data('timeout', null);
                        }
                    },
                    buttons: dialogButtons
                });
                $dialog.data('data', options);
            } else {
                $dialog = $(dialog);
            }
            var data = $dialog.data('data');

            if (typeof options === 'string') {
                switch (options) {
                    case 'show':
                        $dialog.dialog('open');
                        break;

                    case 'hide':
                        $dialog.dialog('close');
                        break;

                    default:
                        console.log('Unknown command ' + options);
                        break;
                }
            }
        });
    };
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
        "descriptionLeftDisabled":   {"en": "No description (left)",   "de": "Keine Beschreibung (links)", "ru": "Без подписи (слева)"},
        "infoLeftFontSize": {"en": "Left font size",    "de": "Schriftgrosse links",    "ru": "Размер шрифта слева"},
        "infoRight":        {"en": "Description (right)", "de": "Beschreibung (rechts)", "ru": "Подпись (справа)"},
        "infoFontRightSize": {"en": "Right font size",  "de": "Schriftgrosse rechts",   "ru": "Размер шрифта справа"},
        "group_styles":     {"en": "Styles",            "de": "Stil",                   "ru": "Стили"},
        "styleNormal":      {"en": "Normal",            "de": "Normal",                 "ru": "Нормальный"},
        "styleActive":      {"en": "Active",            "de": "Aktiv",                  "ru": "Активный"},
        "usejQueryStyle":   {"en": "Use jQuery Styles", "de": "jQuery Stil anwenden",   "ru": "Применить jQuery стили"},
        "changeEffect":     {"en": "Change effect",     "de": "Anderungseffekt",        "ru": "Эффект при изменении"},
        "waveColor":        {"en": "Wave color",        "de": "Wellenfarbe",            "ru": "Цвет волн"},
        "testActive":       {"en": "Test",              "de": "Test",                   "ru": "Тест"},
        "group_value":      {"en": "Value",             "de": "Wert",                   "ru": "Значение"},
        "unit":             {"en": "Unit",              "de": "Einheit",                "ru": "Единицы"},
        "readOnly":         {"en": "Read only",         "de": "Nur lesend",             "ru": "Не изменять"},
        "group_center":     {"en": "Center",            "de": "Zentrum",                "ru": "Центр"},
        "caption":          {"en": "Caption",           "de": "Beschriftung",           "ru": "Подпись"},
        "captionOn":        {"en": "Caption active",    "de": "Beschriftung bei aktiv", "ru": "Подпись когда активно"},
        "hideNumber":       {"en": "Hide number",       "de": "Nummer ausblenden",      "ru": "Скрыть число"},
        "group_arc":        {"en": "Arc",               "de": "Bogen",                  "ru": "Дуга"},
        "angleOffset":      {"en": "Angle offset",      "de": "Winkeloffset",           "ru": "Сдвиг дуги"},
        "angleArc":         {"en": "Angle arc",         "de": "Bogenwinkel",            "ru": "Угол дуги"},
        "displayPrevious":  {"en": "Display previous",  "de": "Letztes Wert zeigen",    "ru": "Показывать предыдущее значение"},
        "cursor":           {"en": "Cursor",            "de": "Griff",                  "ru": "Ручка"},
        "thickness":        {"en": "Thickness",         "de": "Dicke",                  "ru": "Толщина"},
        "bgcolor":          {"en": "Background color",  "de": "Hintergrundfarbe",       "ru": "Цвет фона"},
        "linecap":          {"en": "Line cap",          "de": "Linienende",             "ru": "Округлое окончание"},
        "anticlockwise":    {"en": "Anticlockwise",     "de": "Gegenuhrzeigersinn",     "ru": "Против часовой стрелки"},
        "oid-battery":      {"en": "Battery object ID", "de": "Battery ObjektID",       "ru": "ID батарейного индикатора"},
        "oid-signal":       {"en": "Signal object ID",  "de": "Signal ObjektID",        "ru": "ID качества сигнала"},
        "oid-humidity":     {"en": "Humidity ID",       "de": "Luftfeuchtigkeit ID",    "ru": "ID влажности"},
        "oid-drive":        {"en": "Valve ID",          "de": "Ventil ID",              "ru": "ID вентиля"},
        "oid-actual":       {"en": "Actual temperature ID", "de": "Ist ID",             "ru": "ID актуальной температуры"},
        "group_chart":      {"en": "Chart",             "de": "Grafik",                 "ru": "График"},
        "dialog_effect":    {"en": "Show effect",       "de": "Anzeigeeffekt",          "ru": "Эффект открытия"},
        "dialog_timeout":   {"en": "Hide timeout(ms)",  "de": "Zumachen nach(ms)",      "ru": "Закрыть после(мс)"},
        "dialog_open":      {"en": "Test open",         "de": "Testen",                 "ru": "Тест"},
        "border_width":     {"en": "Border width",      "de": "Rahmenbreite",           "ru": "Ширина рамы"},
        "slide_count":      {"en": "Slides count",      "de": "Flügelanzahl",           "ru": "Кол-во створок"},
        "hide_timeout":     {"en": "Timeout for hide",  "de": "Timeout für ",           "ru": "Интервал для скрытия"},
        "group_slides":     {"en": "Slides",            "de": "Flügel",                 "ru": "Створка"},
        "slide_type":       {"en": "Slide type",        "de": "Flügeltyp",              "ru": "Тип створки"},
        "oid-slide-sensor":         {"en": "Slide sensor",          "de": "Fensterblatt-Sensor",    "ru": "Сенсор на створке"},
        "oid-slide-sensor-lowbat":  {"en": "Slide sensor lowbat",   "de": "FB-Sensor lowbat",       "ru": "Сенсор на створке (lowbat)"},
        "oid-slide-handle":         {"en": "Slide handle",          "de": "Griff-Sensor",           "ru": "Сенсор на ручке"},
        "oid-slide-handle-lowbat":  {"en": "Slide handle lowbat",   "de": "Griff-Sensor lowbat",    "ru": "Сенсор на ручке (lowbat)"},
        "door_type":        {"en": "Door swing",         "de": "Türtyp",                "ru": "Тип двери"},
        "noAnimate":        {"en": "No animation",       "de": "Keine Animation",       "ru": "Не анимировать"},
        "popupHorizontalPos":        {"en": "Horizontal popup position",       "de": "Horizontale PopUp Position",       "ru": "Горизонтальное положение"},
        "popupVerticalPos":        {"en": "Vertical popup position",       "de": "Vertikale PopUp Position",       "ru": "Вертикальное положение"},
        "infoColor":        {"en": "Text color",         "de": "Textfarbe",             "ru": "Цвет текста"},
        "infoBackground":   {"en": "Background",         "de": "Hintergrund",           "ru": "Цвет фона"},
        "midTextColor":     {"en": "Middle text color",  "de": "Textfarbe Mitte",       "ru": "Цвет текста в середине"},
        "pushButton":       {"en": "Push-Button",        "de": "Taster",                "ru": "Кнопка"},
        "big":              {"en": "big",                "de": "groß",                  "ru": "большой"},
        "small":            {"en": "small",              "de": "klein",                 "ru": "маленький"},
        "orange":           {"en": "orange",             "de": "orange",                "ru": "оранжевый"},
        "blue":             {"en": "blue",               "de": "blau",                  "ru": "синий"},
        "green":            {"en": "green",              "de": "grün",                  "ru": "зелёный"},
        "grey":             {"en": "grey",               "de": "grau",                  "ru": "серый"},
        "show_value":       {"en": "Show value",         "de": "Wert anzeigen",         "ru": "Показывать значение"},
        "staticValue":      {"en": "Static value",       "de": "Statisches Wert",       "ru": "Статичное значение"},
        "staticValue_tooltip": {
            "en": "Static value used if no Object ID set",
            "de": "Statisches Wert wird nur dann verwendet,\x0Afalls keine ObjektID gesetzt ist",
            "ru": "Статичное значение используется если не задан ID объекта"
        },
        "checkboxSize":     {"en": "Size",               "de": "Größe",                 "ru": "Размер"},
        "checkboxColor":    {"en": "Color by OFF",       "de": "Farbe bei AUS",         "ru": "Цвет при 0"},
        "checkboxColorOn":  {"en": "Color by ON",        "de": "Farbe bei ON",          "ru": "Цвет при 1"},
        "group_style":      {"en": "Style",              "de": "Still",                 "ru": "Стиль"},
        "oid-open":         {"en": "Object ID Open",     "de": "Objekt-ID Aufmachen",   "ru": "Полностью открыть ID"},
        "group_image":      {"en": "Images",             "de": "Bilder",                "ru": "Кнопки"},
        "closedIcon":       {"en": "Icon-Closed",        "de": "Bild für Zu",           "ru": "Картинка 'Закрыть'"},
        "openedIcon":       {"en": "Icon-Opened",        "de": "Bild für Auf",          "ru": "Картинка 'Открыть'"},
        "group_popup":      {"en": "Popup",              "de": "Popup",                 "ru": "Popup"},
        "popupRadius":      {"en": "Popup radius",       "de": "Popup-Radius",          "ru": "Popup радиус"},
        "buttonRadius":     {"en": "Buttons radius",     "de": "Knopfe-Radius",         "ru": "Радиус кнопок"},
        "closeIcon":        {"en": "Close-Icon",         "de": "Zu-Bild",               "ru": "Закрыть-Картинка"},
        "closeValue":       {"en": "Close-Value",        "de": "Zu-Wert",               "ru": "Закрыть-Значение"},
        "closeStyle":       {"en": "Close-Style",        "de": "Zu-Still",              "ru": "Закрыть-Стиль"},
        "openIcon":         {"en": "Open Lock-Icon",     "de": "Schloss Auf-Bild",      "ru": "Открыть замок-Картинка"},
        "openValue":        {"en": "Open Lock-Value",    "de": "Schloss Auf-Wert",      "ru": "Открыть замок-Значение"},
        "openStyle":        {"en": "Open Lock-Style",    "de": "Schloss Auf-Still",     "ru": "Открыть замок-Стиль"},
        "openDoorIcon":     {"en": "Open Door-Icon",     "de": "Tür Auf-Bild",          "ru": "Открыть дверь-Картинка"},
        "openDoorValue":    {"en": "Open Door-Value",    "de": "Tür Auf-Wert",          "ru": "Открыть дверь-Значение"},
        "openDoorStyle":    {"en": "Open Door-Style",    "de": "Tür Auf-Still",         "ru": "Открыть дверь-Стиль"},
        "showTimeout":      {"en": "Popup timeout",      "de": "Popup-Timeout",         "ru": "Popup таймаут"},
        "val_false":        {"en": "Off value",          "de": "Aus-Wert",              "ru": "Выкл.-Значение"},
        "val_true":         {"en": "On value",           "de": "An-Wert",               "ru": "Вкл.-Значение"},
        "invert":           {"en": "Invert",             "de": "Invertieren",           "ru": "Инвертировать"},
        "infoLeftPaddingLeft":   {"en": "Left padding (left)",   "de": "Linker Abstand (Links)", "ru": "Отступ слева (левый текст)"},
        "infoLeftPaddingRight":  {"en": "Right padding (left",  "de": "Rechter Abstand (Links)", "ru": "Отступ справа (левый текст)"},
        "infoRightPaddingLeft":  {"en": "Left padding (right)",  "de": "Linker Abstand (Rechts)", "ru": "Отступ слева (правый текст)"},
        "infoRightPaddingRight": {"en": "Right padding (right)", "de": "Rechter Abstand (Rechts)", "ru": "Отступ справа (правый текст)"},
        "valveBinary":      {"en": "Valve only On/Off",  "de": "Ventil nur An/Aus",     "ru": "Вентиль только Откр/Закр"},
        "valve1":           {"en": "Valve is from 0 to 1", "de": "Ventil ist von 0 bis 1", "ru": "Вентиль от 0 до 1"}
    });
}

$.extend(true, systemDictionary, {
    "just&nbsp;now":            {"en": "just&nbsp;now", "de": "gerade&nbsp;jetzt", "ru": "только&nbsp;что"},
    "for&nbsp;%s&nbsp;min.":    {"en": "for&nbsp;%s&nbsp;min.", "de": "vor&nbsp;%s&nbsp;Min.", "ru": "%s&nbsp;мин.&nbsp;назад"},
    // plural hours
    "forHours": {
        "en": "for&nbsp;%s&nbsp;hrs.&nbsp;and&nbsp;%s&nbsp;min.",
        "de": "vor&nbsp;%s&nbsp;St.&nbsp;und&nbsp;%s&nbsp;Min.",
        "ru": "%s&nbsp;часов&nbsp;и&nbsp;%s&nbsp;мин.&nbsp;назад"
    },
    // singular hour
    "for1Hour": {
        "en": "for&nbsp;%s&nbsp;hr.&nbsp;and&nbsp;%s&nbsp;min.",
        "de": "vor&nbsp;%s&nbsp;St.&nbsp;und&nbsp;%s&nbsp;Min.",
        "ru": "%s&nbsp;час&nbsp;и&nbsp;%s&nbsp;мин.&nbsp;назад"
    },
    // 2-4 hour
    "for2-4Hours": {
        "en": "for&nbsp;%s&nbsp;hr.&nbsp;and&nbsp;%s&nbsp;min.",
        "de": "vor&nbsp;%s&nbsp;St.&nbsp;und&nbsp;%s&nbsp;Min.",
        "ru": "%s&nbsp;часа&nbsp;и&nbsp;%s&nbsp;мин.&nbsp;назад"
    },
    "yesterday":                {"en": "yesterday", "de": "gestern", "ru": "вчера"},
    "for&nbsp;%s&nbsp;hours":   {"en": "for&nbsp;%s&nbsp;hours", "de": "vor&nbsp;%s&nbsp;Stunden", "ru": "%s&nbsp;ч. назад"},
    "Chart":                    {"en": "Chart",     "de": "Grafik",  "ru": "График"},
    "opened":                   {"en": "opened",    "de": "auf",     "ru": "откр."},
    "closed":                   {"en": "closed",    "de": "zu",      "ru": "закр."}
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

vis.binds.hqwidgets = {
    version: "1.1.9",
    contextEnabled: true,
    zindex: [],
    preventDefault: function (e) {
        e.preventDefault();
    },
    contextMenu: function (isEnable) {
        if (isEnable && !vis.binds.hqwidgets.contextEnabled) {
            vis.binds.hqwidgets.contextEnabled = true;
            document.removeEventListener('contextmenu', vis.binds.hqwidgets.preventDefault, false);
        }
        if (!isEnable && vis.binds.hqwidgets.contextEnabled) {
            vis.binds.hqwidgets.contextEnabled = false;
            document.addEventListener('contextmenu', vis.binds.hqwidgets.preventDefault, false);
        }
    },
    showVersion: function () {
        if (vis.binds.hqwidgets.version) {
            console.log('Version vis-hqwidgets: ' + vis.binds.hqwidgets.version);
            vis.binds.hqwidgets.version = null;
        }
    },
    getTimeInterval: function (oldTime, hoursToShow) {
        // if less than 2000.01.01 00:00:00
        if (oldTime < 946681200000) oldTime = oldTime * 1000;

        var result = '';

        var newTime = new Date ();

        if (!oldTime) return '';
        if (typeof oldTime === 'string') {
            oldTime = new Date(oldTime);
        } else {
            if (typeof oldTime === 'number') {
                oldTime = new Date(oldTime);
            }
        }

        var seconds = (newTime.getTime() - oldTime.getTime ()) / 1000;

        if (hoursToShow && (seconds / 3600) > hoursToShow) return '';

        if (seconds < 60) {
            result = _('just&nbsp;now');
        } else
        if (seconds <= 3600) {
            result = _('for&nbsp;%s&nbsp;min.', Math.floor(seconds / 60));
        }
        else
        if (seconds <= 3600 * 24) { // between 1 und 24 hours
            var hrs = Math.floor(seconds / 3600);
            if (hrs === 1 || hrs === 21) {
                result = _('for1Hour',  hrs, (Math.floor(seconds / 60) % 60));
            } else if (hrs >= 2 && hrs <= 4) {
                result = _('for2-4Hours',  hrs, (Math.floor(seconds / 60) % 60));
            } else {
                result = _('forHours', hrs, (Math.floor(seconds / 60) % 60));
            }
        }
        else
        if (seconds > 3600 * 24 && seconds <= 3600 * 48) {
            result = _('yesterday');
        }
        else
        if (seconds > 3600 * 48) { // over 2 days
            result = _('for&nbsp;%s&nbsp;hours', Math.floor(seconds / 3600));
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
                    time = vis.binds.hqwidgets.getTimeInterval(data.lc, data.hoursLastAction);
                    $div.find('.vis-hq-time').html(time);
                    if (!vis.editMode) {
                        timer = $div.data('lastTimer');
                        if (!timer) {
                            timer = setInterval(function () {
                                var time = vis.binds.hqwidgets.getTimeInterval(data.lc, data.hoursLastAction);
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
                    time = vis.binds.basic.formatDate(data.lc, data.format_date);
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
            if (data.wType === 'number' && data.oid) {
                var html = (value === undefined || value === null ? data.min : value) + (data.unit === undefined || data.unit === null ? '' : data.unit);
                if (data.drive !== undefined && data.drive !== null) {
                    html += '<br><span class="vis-hq-drive">' + data.drive + '</span>';
                    if (!data.valveBinary) {
                        html += '%';
                    }
                }
                text = $div.find('.vis-hq-rightinfo-text').html(html);
            }

            // Hide right info if empty
            if (data.infoRight || time || (text && text.text())) {
                $div.find('.vis-hq-rightinfo').show();
            } else {
                $div.find('.vis-hq-rightinfo').hide();
            }

        },
        showCenterInfo: function ($div, isHide, reInit) {
            var data = $div.data('data');
            if (!data) return;

            var $c = $div.find('.vis-hq-centerinfo');
            if (reInit ||
                (data.humidity !== undefined && data.humidity !== null) ||
                (data.actual   !== undefined && data.actual   !== null)) {
                if (isHide) {
                    $c.hide();
                    $div.find('.vis-hq-middle').css('opacity', 1);
                } else {
                    if (!$div.is(':visible')) {
                        if (!data.showCenterInfo) {
                            data.showCenterInfo = setTimeout(function () {
                                data.showCenterInfo = null;
                                vis.binds.hqwidgets.button.showCenterInfo($div, isHide, reInit);
                            }, 1000);
                        }
                        return;
                    }

                    if (reInit || !$c.length) {
                        $c.remove();
                        var text = '<table class="vis-hq-centerinfo vis-hq-no-space" style="z-index: 2;position: absolute' +  (data.midTextColor ? ';color: ' + data.midTextColor : '') + '">';

                        if (data.actual   !== undefined && data.actual   !== null) {
                            text += '<tr class="vis-hq-actual-style vis-hq-no-space"><td class="vis-hq-no-space"><span class="vis-hq-actual"></span>' + (data.unit === undefined && data.unit === null ? '' : data.unit) + '</tr>';
                        }
                        if (data.humidity !== undefined && data.humidity !== null) {
                            text += '<tr class="vis-hq-humidity-style vis-hq-no-space"><td class="vis-hq-no-space"><span class="vis-hq-humidity"></span>%</td></tr>';
                        }

                        text += '</table>';
                        $div.find('.vis-hq-main').prepend(text);
                        $c = $div.find('.vis-hq-centerinfo');
                    } else {
                        $c.show();
                    }
                    $div.find('.vis-hq-middle').css('opacity', 0.7);
                    if (data.actual   !== undefined && data.actual !== null) {
                        if (typeof data.actual !== 'number') {
                            data.actual = parseFloat(data.actual) || 0;
                        }
                        var val = data.digits !== null ? (data.actual || 0).toFixed(data.digits) : (data.actual || 0);
                        if (data.is_comma) {
                            val = val.toString().replace('.', ',');
                        }

                        $div.find('.vis-hq-actual').html(val);
                    }

                    if (data.humidity !== undefined && data.humidity !== null) {
                        if (typeof data.humidity !== 'number') data.humidity = parseFloat(data.humidity) || 0;
                        $div.find('.vis-hq-humidity').html(Math.round(data.humidity || 0));
                    }

                    var $main   = $div.find('.vis-hq-main');
                    if ($c.length) {
                        $c.css({
                            top:  ($main.height() - $c.height()) / 2,
                            left: ($main.width()  - $c.width())  / 2
                        });
                    }
                }
            } else {
                $c.hide();
            }
        },
        centerImage: function ($div, data, $img) {
            // find the right position for image and caption in the middle
            var $main = $div.find('.vis-hq-main');
            if (!$img) $img = $div.find('.vis-hq-icon-img');

            if (data.offsetAuto) {
                if (!$div.is(':visible')) {
                    if (!data.centerImage) {
                        data.centerImage = setTimeout(function () {
                            data.centerImage = null;
                            vis.binds.hqwidgets.button.centerImage($div, data, $img);
                        }, 1000);
                    }
                } else {
                    var $middle = $div.find('.vis-hq-table');
                    $middle.css({
                        left: ($main.width()  - $middle.width())  / 2,
                        top:  ($main.height() - $middle.height()) / 2
                    });
                    $img[0] && ($img[0].onload = function () {
                        var $middle = $div.find('.vis-hq-table');
                        $middle.css({
                            left: ($main.width()  - $middle.width())  / 2,
                            top:  ($main.height() - $middle.height()) / 2
                        });
                    });
                }
            }
        },
        // Calculate state of button
        changeState: function ($div, isInit, isForce, isOwn) {
            var data = $div.data('data');
            if (!data) {
                return;
            }

            var value = data.tempValue !== undefined && data.tempValue !== null ? data.tempValue : data.value;

            if (!isForce && data.oldValue !== undefined && data.oldValue !== null && data.oldValue == value && !data.ack) {
                return;
            }

            if (data.wType === 'number') {
                value = parseFloat((value || 0).toString().replace(',', '.'));
            }
            data.oldValue = value;

            if (data.temperature) {
                data.state = 'normal';
            } else if (value == data.min) {
                data.state = 'normal';
            } else if (value == data.max) {
                data.state = 'active';
            } else if (data.max &&
                (value === null    ||
                 value === ''      ||
                 value === undefined ||
                 value === 'false' ||
                 value === false))  {
                data.state = 'normal';
            } else {
                if (data.wType === 'number') {
                    if (data.max) {
                        if (value > data.min) {
                            data.state = 'active';
                        } else {
                            data.state = 'normal';
                        }
                    } else if (value) {
                        data.state = 'active';
                    } else {
                        data.state = 'normal';
                    }
                } else {
                    if (data.max) {
                        if (value == data.max) {
                            data.state = 'active';
                        } else {
                            data.state = 'normal';
                        }
                    } else if (value) {
                        data.state = 'active';
                    } else {
                        data.state = 'normal';
                    }
                }
            }

            if (vis.editMode && data.testActive) {
                data.state = (data.state === 'normal') ? 'active' : 'normal';
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
                        var $img  = $div.find('.vis-hq-icon-img');

                        if ($img.attr('src') !== (data.iconName || '')) {
                            $img.attr('src', (data.iconName || ''));
                            vis.binds.hqwidgets.button.centerImage($div, data, $img);
                        }
                    }
                    if (data.captionOn) {
                        $div.find('.vis-hq-text-caption').html(data.caption || '');
                    }
                    break;
                case 'active':
                    $('#' + data.wid + ' .vis-hq-main')
                        .removeClass(data.styleNormal)
                        .addClass(data.styleActive);

                    if (data.iconName || data.iconOn) {
                        var $img  = $div.find('.vis-hq-icon-img');

                        if ($img.attr('src') !== (data.iconOn || data.iconName)) {
                            $img.attr('src', (data.iconOn || data.iconName));
                            vis.binds.hqwidgets.button.centerImage($div, data, $img);
                        }
                    }
                    if (data.captionOn) {
                        $div.find('.vis-hq-text-caption').html(data.captionOn);
                    }
                    break;
            }
            if (data.digits !== null && value !== null && value !== undefined) {
                if (typeof value !== 'number') {
                    value = parseFloat(value) || 0;
                }
                value = value.toFixed(data.digits);
            }
            if (data.is_comma && value) {
                value = value.toString().replace('.', ',');
            }

            vis.binds.hqwidgets.button.showRightInfo($div, value);

            if ((!data.ack && !data['oid-working']) || (data['oid-working'] && data.working)) {
                $div.find('.vis-hq-working').show();
            } else {
                $div.find('.vis-hq-working').hide();
            }

            if (data['oid-battery']) $div.batteryIndicator('show', data.battery || false);

            if (data['oid-signal']) {
                $div.find('.vis-hq-signal').html(data.signal);
            }

            if (data['oid-humidity']) {
                var $h = $div.find('.vis-hq-humidity');
                if (!$h.length) {
                    vis.binds.hqwidgets.button.showCenterInfo($div, false, true);
                } else {
                    $h.html(Math.round(data.humidity || 0));
                }
            }

            if (data['oid-actual']) {
                var $a = $div.find('.vis-hq-actual');
                if (!$a.length) {
                    vis.binds.hqwidgets.button.showCenterInfo($div, false, true);
                } else {
                    if (typeof data.actual !== 'number') {
                        data.actual = parseFloat(data.actual) || 0;
                    }
                    var val = data.digits !== null ? (data.actual || 0).toFixed(data.digits) : (data.actual || 0);
                    if (data.is_comma) {
                        val = val.toString().replace('.', ',');
                    }
                    $a.html(val);
                }
            }

            if (data['oid-drive']) {
                $div.find('.vis-hq-drive').html(data.drive || 0);
            }

            // Show change effect
            if (data.changeEffect && ((!isInit && !isOwn) || (vis.editMode && data.testActive))) {
                var $main = $div.find('.vis-hq-main');
                $main.animateDiv(data.changeEffect, {color: data.waveColor});
            }
        },
        draw: function ($div) {
            if (!$div.is(':visible')) {
                setTimeout(function () {
                    vis.binds.hqwidgets.button.draw($div);
                }, 100);
                return;
            }

            var data   = $div.data('data');
            data.state = data.state || 'normal';
            var radius = $div.css('borderTopLeftRadius') || vis.views[data.view].widgets[data.wid].style['border-radius'];

            // place left-info, right-info, caption and image
            if (!$div.find('.vis-hq-main').length) {
                var text = '';
                if (!data.descriptionLeftDisabled && data.descriptionLeft) {
                    if (data.infoLeftPaddingLeft  === undefined || data.infoLeftPaddingLeft  === null) data.infoLeftPaddingLeft = '15px';
                    if (data.infoLeftPaddingRight === undefined || data.infoLeftPaddingRight === null) data.infoLeftPaddingRight = '50px';
                    if (!data.infoLeftPaddingLeft.match(/px$|rem$|em$/))  data.infoLeftPaddingLeft  = data.infoLeftPaddingLeft  + 'px';
                    if (!data.infoLeftPaddingRight.match(/px$|rem$|em$/)) data.infoLeftPaddingRight = data.infoLeftPaddingRight + 'px';

                    text += '<div class="vis-hq-leftinfo" style="padding-left: ' + data.infoLeftPaddingLeft + '; padding-right: ' + data.infoLeftPaddingRight + '; font-size: ' + (data.infoLeftFontSize || 12) + 'px' + (data.infoColor ? ';color: ' + data.infoColor : '') + (data.infoBackground ? ';background: ' + data.infoBackground : '') + '"><span class="vis-hq-leftinfo-text">' +
                        (data.descriptionLeft || '').replace(/\s/g, '&nbsp;').replace(/\\n/g, '<br>') + '</span></div>\n';
                }
                if (data.infoRight || data.wType === 'number' || data.hoursLastAction) {
                    if (data.infoRightPaddingLeft  === undefined || data.infoRightPaddingLeft  === null) data.infoRightPaddingLeft = 0;
                    if (data.infoRightPaddingRight === undefined || data.infoRightPaddingRight === null) data.infoRightPaddingRight = '15px';
                    if (!data.infoRightPaddingRight.match(/px$|rem$|em$/)) data.infoRightPaddingRight = data.infoRightPaddingRight + 'px';

                    text += '<div class="vis-hq-rightinfo" style="padding-right: ' + data.infoRightPaddingRight + '; font-size: ' + (data.infoFontRightSize || 12) + 'px' + (data.infoColor ? ';color: ' + data.infoColor : '') + (data.infoBackground ? ';background: ' + data.infoBackground : '') + '"><span class="vis-hq-rightinfo-text">' +
                        (data.infoRight || '').replace(/\s/g, '&nbsp;').replace(/\\n/g, '<br>') + '</span>';

                    if (data.hoursLastAction) {
                        if (data.infoRight || data.wType === 'number') text += '<br>';
                        text += '<span class="vis-hq-time"></span>';
                    }

                    text += '</div>\n';
                }
                text += '<div class="vis-hq-main" style="z-index: 1"><div class="vis-hq-middle">\n';

                if (data.offsetAuto) {
                    text += '<table class="vis-hq-table vis-hq-no-space" style="position: absolute"><tr class="vis-hq-no-space"><td class="vis-hq-no-space"><div class="vis-hq-icon" style="text-align: center;"></div></td>\n';
                } else {
                    text += '<table class="vis-hq-table vis-hq-no-space" style="position: absolute;top:' + data.topOffset + '%;left:' + data.leftOffset + '%"><tr class="vis-hq-no-space"><td class="vis-hq-no-space"><div class="vis-hq-icon" style="text-align: center;"></div></td>\n';
                }

                if (data.caption || data.captionOn) {
                    if ($div.height() > $div.width()) text += '</tr><tr class="vis-hq-no-space">';
                    text += '<td class="vis-hq-no-space"><div class="vis-hq-text-caption" style="text-align: center;"></div></td>';
                }

                text += '</tr></table></div></div></div>';
                $div.append(text);
            }

            // Get the border radius from parent
            var $main = $div.find('.vis-hq-main');
            $main.css({'border-radius': radius});
            $div.find('.vis-hq-text-caption').html(data.caption || '');

            var width = $div.width();
            var offset = width - 20 - parseInt(radius, 10);
            if (offset < width / 2) {
                offset = width / 2;
            }
            $div.find('.vis-hq-leftinfo').css({right: offset + 'px'});
            $div.find('.vis-hq-rightinfo').css({'padding-left': (5 + (width / 2) + (parseInt(data.infoRightPaddingLeft, 10) || 0)) + 'px'});

            // Place icon
            var img = null;
            if (data.iconName || data.iconOn) {
                img = (data.state === 'normal') ? (data.iconName || '') : (data.iconOn || '');
                $div.find('.vis-hq-icon').html('<img class="vis-hq-icon-img" style="height: ' + data.btIconWidth + 'px; width: auto;" src="' + (img || '') + '"/>').css('opacity', img ? 1 : 0);
            } else {
                $div.find('.vis-hq-icon').html('');
            }

            if (data['oid-battery']) $div.batteryIndicator();

            if (data['oid-working']) {
                $div.append('<div class="vis-hq-working"><span class="ui-icon ui-icon-gear"></span></div>');
            }

            // find the right position for image and caption in the middle
            if (data.offsetAuto) {
                vis.binds.hqwidgets.button.centerImage($div, data);
            }

            function onChange(e, newVal, oldVal) {
                if (e.type === data.oid + '.val') {
                    if (data.wType === 'number') {
                        data.value = parseFloat(newVal || 0);
                    } else {
                        data.value = newVal;
                    }
                    data.ack   = vis.states[data.oid + '.ack'];
                    data.lc    = vis.states[data.oid + '.lc'];

                    if (data.wType === 'number') {
                        if (newVal === false || newVal === 'false') {
                            data.value = data.min;
                        }
                        if (newVal === true  || newVal === 'true')  {
                            data.value = data.max;
                        }
                    }
                    data.tempValue = undefined;

                    vis.binds.hqwidgets.button.changeState($div);

                    if (data.wType === 'number') {
                        if (typeof data.value !== 'number') {
                            data.value = parseFloat(data.value) || 0;
                        }
                        var val = data.digits !== null ? data.value.toFixed(data.digits) : data.value;
                        if (data.is_comma) {
                            val = val.toString().replace('.', ',');
                        }
                        $main.scala('value', val);
                    }
                    return;
                } else if (e.type === data.oid + '.ack') {
                    data.ack   = vis.states[data.oid + '.ack'];
                    data.lc    = vis.states[data.oid + '.lc'];

                    vis.binds.hqwidgets.button.changeState($div);
                    return;
                } else if (e.type === data['oid-working'] + '.val') {
                    data.working = newVal;
                } else if (e.type === data['oid-battery'] + '.val') {
                    data.battery = newVal;
                } else if (e.type === data['oid-signal'] + '.val') {
                    data.signal = newVal;
                } else if (e.type === data['oid-humidity'] + '.val') {
                    data.humidity = newVal;
                } else if (e.type === data['oid-actual'] + '.val') {
                    data.actual = newVal;
                } else if (e.type === data['oid-drive'] + '.val') {
                    if (data.valveBinary === 'true' || data.valveBinary === true) {
                        if (newVal === null || newVal === undefined) {
                            newVal = 0;
                        }
                        if (newVal === 'true') {
                            newVal = true;
                        } else if (parseFloat(newVal).toString() === newVal.toString()) {
                            newVal = !!parseFloat(newVal);
                        } else if (newVal === 'false') {
                            newVal = false;
                        }
                        newVal = newVal ? _('opened') : _('closed');
                    } else if (data.valve1 === 'true' || data.valve1 === true) {
                        // value is from 0 to 1.01
                        newVal = Math.round((parseFloat(newVal) || 0) * 100);
                        if (newVal < 0) {
                            newVal = 0;
                        } else if (newVal > 100) {
                            newVal = 100;
                        }
                    } else {
                        // no digits after comma
                        newVal = Math.round(parseFloat(newVal) || 0);
                    }

                    data.drive = newVal;
                }
                vis.binds.hqwidgets.button.changeState($div, false, true);
            }

            // action
            if (1 || !vis.editMode) {

                var bound = [];
                if (data.oid) {

                    $div.append('<div class="vis-hq-nodata"><span class="ui-icon ui-icon-cancel"></span></div>');

                    vis.states.bind(data.oid + '.val', onChange);
                    vis.states.bind(data.oid + '.ack', onChange);
                    bound.push(data.oid + '.val');
                    bound.push(data.oid + '.ack');
                }
                if (data['oid-working']) {
                    vis.states.bind(data['oid-working'] + '.val', onChange);
                    bound.push(data['oid-working'] + '.val');
                }

                if (data['oid-battery']) {
                    vis.states.bind(data['oid-battery'] + '.val', onChange);
                    bound.push(data['oid-battery'] + '.val');
                }

                if (data['oid-signal']) {
                    vis.states.bind(data['oid-signal'] + '.val', onChange);
                    bound.push(data['oid-signal'] + '.val');
                }

                if (data['oid-humidity']) {
                    vis.states.bind(data['oid-humidity'] + '.val', onChange);
                    bound.push(data['oid-humidity'] + '.val');
                }

                if (data['oid-actual']) {
                    vis.states.bind(data['oid-actual'] + '.val', onChange);
                    bound.push(data['oid-actual'] + '.val');
                }

                if (data['oid-drive']) {
                    vis.states.bind(data['oid-drive'] + '.val', onChange);
                    bound.push(data['oid-drive'] + '.val');
                }
                // remember all ids, that bound
                $div.data('bound', bound);
                // remember bind handler
                $div.data('bindHandler', onChange);
            }

            // initiate state
            vis.binds.hqwidgets.button.changeState($div, true);

            // If dimmer or number
            if (data.wType === 'number') {
                var scalaOptions;
                if (data.oid) {
                    scalaOptions = {
                        change:     function (value, notAck) {
                            //console.log(data.wid + ' filtered out:' + value + '(' + notAck + ')');
                            if (!notAck) {
                                return;
                            }

                            if (data.readOnly || (data.value || 0).toString() === value.toString()) {
                                return;
                            }
                            var setValue = parseFloat(value.toString().replace(',', '.')) || 0;

                            if (data.digits !== null) {
                                data.value = setValue.toFixed(data.digits);
                            } else {
                                data.value = setValue;
                            }
                            if (data.is_comma) {
                                data.value = data.value.toString().replace('.', ',');
                            }
                            data.ack       = false;
                            data.tempValue = undefined;

                            vis.binds.hqwidgets.button.changeState($div, false, false, true);
                            vis.setValue(data.oid, setValue);
                        },
                        min:        data.min,
                        max:        data.max,
                        changing:   function (value) {
                            // round to step
                            data.tempValue = Math.round(parseFloat(value) / data.step) * data.step;
                            vis.binds.hqwidgets.button.changeState($div, false, false, true);
                        },
                        click:      function (val) {
                            val = data.value;
                            if (!data.temperature) {
                                if (val - data.min > ((data.max - data.min) / 2)) {
                                    val = data.min;
                                } else {
                                    val = data.max;
                                }
                            } else {
                                data.tempValue = undefined;
                                vis.binds.hqwidgets.button.changeState($div, false, false, true);

                                // Show dialog
                                if (data.url) $div.popupDialog('show');
                            }
                            return val;
                        },
                        alwaysShow: data.alwaysShow,
                        onshow:     function () {
                            if (!data.alwaysShow) {
                                vis.binds.hqwidgets.button.showCenterInfo($div, true);
                            }
                        },
                        onhide:     function () {
                            vis.binds.hqwidgets.button.showCenterInfo($div);
                        },
                        hideNumber: !data.showValue || (data.temperature && data.alwaysShow),
                        readOnly:   vis.editMode || data.readOnly,
                        step:       data.step,
                        digits:     data.digits,
                        isComma:    data.is_comma,
                        width:      ((100 + parseInt(data.circleWidth || 50, 10)) * width / 100).toFixed(0)
                    };
                }

                // show for temperature color depends on value
                if (data.temperature) {
                    vis.binds.hqwidgets.button.showCenterInfo($div);

                    if (scalaOptions) {
                        scalaOptions.color    = 'black';
                        scalaOptions.colorize = function (color, value, isPrevious) {
                            var ratio = (value - data.min) / (data.max - data.min);
                            return 'hsla(' + (180 + Math.round(180 * ratio)) + ', 70%, 50%, ' + ((isPrevious) ? 0.7 : 0.9) + ')';
                        }
                    }
                }
                if (scalaOptions) {
                    $main.scala(scalaOptions);
                    $main.scala('value', data.value);
                }
            } else {
                if (!data.oidFalse && data.oidTrue) data.oidFalse = data.oidTrue;
                if (!data.urlFalse && data.urlTrue) data.urlFalse = data.urlTrue;
                if (data.min === undefined || data.min === 'false' || data.min === null) data.min = false;
                if (data.max === undefined || data.max === 'true'  || data.max === null) data.max = true;
                if (data.oidTrueVal === undefined || data.oidTrueVal === null) data.oidTrueVal = data.max;
                if (data.oidTrueVal === 'false') data.oidTrueVal = false;
                if (data.oidTrueVal === 'true')  data.oidTrueVal = true;
                if (data.oidFalseVal === undefined || data.oidFalseVal === null) data.oidFalseVal = data.min;
                if (data.oidFalseVal === 'false') data.oidFalseVal = false;
                if (data.oidFalseVal === 'true')  data.oidFalseVal = true;
                var f = parseFloat(data.oidFalseVal);
                if (f.toString() == data.oidFalseVal) data.oidFalseVal = f;

                f = parseFloat(data.oidTrueVal);
                if (f.toString() == data.oidTrueVal) data.oidTrueVal = f;

                f = parseFloat(data.min);
                if (f.toString() == data.min) data.min = f;

                f = parseFloat(data.max);
                if (f.toString() == data.max) data.max = f;

                if (!vis.editMode && !data.readOnly && (data.oid || data.urlFalse || data.urlTrue || data.oidFalse || data.oidTrue)) {
                    if (!data.pushButton) {
                        $main.on('click touchstart', function () {
                            // Protect against two events
                            if (vis.detectBounce(this)) return;

                            data.value = (data.state === 'normal') ? data.max : data.min;
                            data.ack   = false;

                            vis.binds.hqwidgets.button.changeState($div, false, false, true);

                            if (data.oidTrue) {
                                if (data.state !== 'normal') {
                                    vis.setValue(data.oidTrue,  data.oidTrueVal);
                                } else {
                                    vis.setValue(data.oidFalse, data.oidFalseVal);
                                }
                            }

                            if (data.urlTrue) {
                                if (data.state !== 'normal') {
                                    vis.conn.httpGet(data.urlTrue)
                                } else {
                                    vis.conn.httpGet(data.urlFalse);
                                }
                            }

                            // show new state
                            if (data.oid && data.oid !== 'nothing_selected') {
                                vis.setValue(data.oid, data.value);
                            }
                        });
                    } else {
                        $main.on('mousedown touchstart', function (e) {
                            // Protect against two events
                            if (vis.detectBounce(this)) return;

                            vis.binds.hqwidgets.contextMenu(false);

                            data.value = data.max;
                            data.ack   = false;
                            vis.binds.hqwidgets.button.changeState($div, false, false, true);

                            if (data.oidTrue) vis.setValue(data.oidTrue,  data.oidTrueVal);
                            if (data.urlTrue) vis.conn.httpGet(data.urlTrue);
                            if (data.oid && data.oid !== 'nothing_selected') vis.setValue(data.oid, data.value);
                        });
                        $main.on('mouseup mouseout touchend', function (e) {

                            // Protect against two events
                            if (vis.detectBounce(this, true)) return;

                            data.value = data.min;
                            data.ack   = false;
                            vis.binds.hqwidgets.button.changeState($div, false, false, true);

                            if (data.oidFalse) vis.setValue(data.oidFalse, data.oidFalseVal);
                            if (data.urlFalse) vis.conn.httpGet(data.urlFalse);
                            if (data.oid && data.oid !== 'nothing_selected') vis.setValue(data.oid, data.value);

                            vis.binds.hqwidgets.contextMenu(true);
                        });
                    }
                } else if (data.readOnly) {
                    $div.addClass('vis-hq-readonly');
                }
            }

            // Chart dialog
            if (data.url/* && !vis.editMode*/) {
                $div.popupDialog({
                    content: '<iframe src="' + (data.url || '') + '" style="width: 100%; height: calc(100% - 5px); border: 0"></iframe>',
                    width:   data.dialog_width,
                    height:  data.dialog_height,
                    effect:  data.dialog_effect,
                    timeout: data.dialog_timeout,
                    modal:   data.dialog_modal,
                    title:   data.dialog_title || data['oid-actual'],
                    open:    data.dialog_open && vis.editMode
                });
                if (!data.oid) {
                    $main.on('click touchstart', function () {
                        // Protect against two events
                        if (vis.detectBounce(this)) return;

                        $div.popupDialog('show');
                    });
                }
            }
            if (!data.oid && !data.url) {
                $main.addClass('vis-hq-main-none');
                $div.css({cursor: 'auto'});
            }
        },
        init: function (wid, view, data, style, wType) {
            vis.binds.hqwidgets.showVersion();
            var $div = $('#' + wid).addClass('vis-hq-button-base');
            if (!$div.length) {
                setTimeout(function () {
                    vis.binds.hqwidgets.button.init(wid, view, data, style, wType);
                }, 100);
                return;
            }
            var _data = {wid: wid, view: view, wType: wType};
            for (var a in data) {
                if (!data.hasOwnProperty(a) || typeof data[a] === 'function') continue;
                if (a[0] !== '_') {
                    _data[a] = data[a];
                }
            }
            data = _data;

            if (!data.wType) {
                if (data.min === undefined || data.min === null || data.min === '') data.min = false;
                if (data.max === undefined || data.max === null || data.max === '') data.max = true;
            }

            data.styleNormal    = data.usejQueryStyle ? 'ui-state-default' : (data.styleNormal || 'vis-hq-button-base-normal');
            data.styleActive    = data.usejQueryStyle ? 'ui-state-active'  : (data.styleActive || 'vis-hq-button-base-on');
            data.digits         = (data.digits || data.digits === 0) ? parseInt(data.digits, 10) : null;
            if (typeof data.step === 'string') {
                data.step = data.step.replace(',', '.');
            }
            data.step           = parseFloat(data.step || 1);
            data.is_comma       = (data.is_comma === 'true' || data.is_comma === true);
            data.readOnly       = (data.readOnly === 'true' || data.readOnly === true);
            data.midTextColor   = data.midTextColor || '';
            data.infoColor      = data.infoColor || '';
            data.infoBackground = data.infoBackground || 'rgba(182,182,182,0.6)';
            data.pushButton     = (data.pushButton === 'true' || data.pushButton === true);

            if (data.wType === 'number') {
                data.min = (data.min === 'true' || data.min === true) ? true : ((data.min === 'false' || data.min === false) ? false : (data.min !== undefined && data.min !== null ? parseFloat(data.min) : 0));
                data.max = (data.max === 'true' || data.max === true) ? true : ((data.max === 'false' || data.max === false) ? false : (data.max !== undefined && data.max !== null ? parseFloat(data.max) : 100));
            } else {
                data.min = (data.min === 'true' || data.min === true) ? true : ((data.min === 'false' || data.min === false) ? false : (data.min !== undefined && data.min !== null && data.min !== '' ? data.min : 0));
                data.max = (data.max === 'true' || data.max === true) ? true : ((data.max === 'false' || data.max === false) ? false : (data.max !== undefined && data.max !== null && data.max !== '' ? data.max : 100));
            }
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
            if (data['oid-actual'])   data.actual   = vis.states.attr(data['oid-actual']   + '.val');
            if (data['oid-drive'])    {
                var val = vis.states.attr(data['oid-drive'] + '.val');
                if (val === null || val === undefined) {
                    val = 0;
                }
                if (data.valveBinary === 'true' || data.valveBinary === true) {
                    if (val === 'true') {
                        val = true;
                    } else if (parseFloat(val).toString() === val.toString()) {
                        val = !!parseFloat(val);
                    } else if (val === 'false') {
                        val = false;
                    }
                    val = val ? _('opened') : _('closed');
                } else if (data.valve1 === 'true' || data.valve1 === true) {
                    // value is from 0 to 1.01
                    val = Math.round((parseFloat(val) || 0) * 100);
                    if (val < 0) {
                        val = 0;
                    } else if (val > 100) {
                        val = 100;
                    }
                }  else {
                    val = Math.round(parseFloat(val) || 0);
                }

                data.drive = val;
            }

            vis.binds.hqwidgets.button.draw($div);
        }
    },
    window: {
        drawOneWindow: function (index, options) {
            var bWidth = options.border_width;
            var div1 = '<div class="hq-blind-blind1" style="' +
                'border-width: ' + bWidth + 'px;' + //'px 2px 2px 2px; ' +
                'border-color: #a9a7a8;' +
                '">';

            var div2 = '<div class="hq-blind-blind2" style="' +
                'border-width: ' + bWidth + 'px; ' +
                '">';
            options.shutterPos = options.shutterPos || 0;

            var div3 = '<div class="hq-blind-blind3"><table class="vis-hq-no-space" style="width: 100%; height: 100%; position: absolute"><tr class="vis-hq-no-space hq-blind-position" style="height: ' + options.shutterPos + '%"><td class="vis-hq-no-space hq-blind-blind"></td></tr><tr class="vis-hq-no-space" style="height: ' + (100 - options.shutterPos) + '%"><td class="vis-hq-no-space"></td></tr></table>';

            var hanldePos  = null;
            var slidePos   = null;

            if (options.handleOid) {
                hanldePos = vis.states[options.handleOid + '.val'];
                /* problem ?? */
                if (hanldePos == 2) {
                    hanldePos = 1;
                } else if (hanldePos == 1) {
                    hanldePos = 2;
                }
                slidePos = hanldePos;
            }
            if (options.slideOid) {
                slidePos = vis.states[options.slideOid + '.val'];
                if (!options.handleOid) hanldePos = slidePos;
                if (hanldePos == 2) slidePos = 2;
            }

            var div4 = '<div class="hq-blind-blind4';
            if ((slidePos == 1 || slidePos === true   || slidePos === 'true' || slidePos === 'open' || slidePos === 'opened') && options.type) {
                div4 +=' hq-blind-blind4-opened-' + options.type;
            }
            if ((slidePos == 2 || slidePos === 'tilt' || slidePos === 'tilted') && options.type) {
                div4 +=' hq-blind-blind4-tilted';
            }
            options.shutterPos = options.shutterPos || 0;
            div4 +='" style="' +
                'border-width: ' + bWidth + 'px;' + //'3px 1px 1px 1px;' +
                'border-color: #a5aaad;' +
                '">';

            var div5 = '';

            //console.log('HOID: ' + options.handleOid + ', ' + hanldePos);
            if (options.type) {
                div5 = '<div class="hq-blind-handle hq-blind-handle-bg';
                if (hanldePos == 2 || hanldePos === 'tilt' || hanldePos === 'tilted') {
                    div5 += ' hq-blind-handle-tilted-bg';
                }
                var bbWidth = Math.round(bWidth / 3);
                if (bbWidth < 1) bbWidth = 1;
                div5 += '" style="border-width: ' + bbWidth + 'px;';
                if (options.type === 'left' || options.type === 'right') {
                    div5 += 'top: 50%;	width: ' + bWidth + 'px; height: 15%;'
                } else if (options.type === 'top' || options.type === 'bottom') {
                    div5 += 'left: 50%; height: ' + bWidth + 'px; width: 15%;'
                }
                if (options.type === 'left') {
                    div5 += 'left: calc(100% - ' + (bbWidth * 2 + bWidth) + 'px);'
                } else if (options.type === 'bottom') {
                    div5 += 'top: calc(100% - ' + (bbWidth * 2 + bWidth) + 'px);'
                }

                if (hanldePos) {
                    var format =
                        '-moz-transform-origin: ------;' +
                        '-ms-transform-origin: ------;' +
                        '-o-transform-origin: ------;' +
                        '-webkit-transform-origin: ------;' +
                        'transform-origin: ------;' +
                        '-moz-transform: rotate(DDDdeg);' +
                        '-ms-transform: rotate(DDDdeg);' +
                        '-o-transform: rotate(DDDdeg);' +
                        '-webkit-transform: rotate(DDDdeg);' +
                        'transform: rotate(DDDdeg);';

                    var w = Math.round(bbWidth + bWidth / 2);
                    if (options.type === 'right' || options.type === 'bottom') {
                        if (hanldePos == 1 || hanldePos === true || hanldePos === 'true' || hanldePos === 'open' || hanldePos === 'opened') {
                            div5 += format.replace(/------/g, w + 'px ' + w + 'px').replace(/DDD/g, '-90');
                        } else
                        if (hanldePos == 2 || hanldePos === 'tilt' || hanldePos === 'tilted') {
                            div5 += format.replace(/------/g, w + 'px ' + w + 'px').replace(/DDD/g, '180');
                        }
                    } else {
                        if (hanldePos == 1 || hanldePos === true || hanldePos === 'true' || hanldePos === 'open' || hanldePos === 'opened') {
                            div5 += format.replace(/------/g, w + 'px ' + w + 'px').replace(/DDD/g, '90');
                        } else
                        if (hanldePos == 2 || hanldePos === 'tilt' || hanldePos === 'tilted') {
                            div5 += format.replace(/------/g, w + 'px ' + w + 'px').replace(/DDD/g, '180');
                        }
                    }
                }

                div5 += '"></div>';
            }

            return div1 + div2 + div3 + div4 + div5 + '</div></div></div></div></div>';
        },
        hidePopup: function ($div) {
            var data = $div.data('data');
            if (!data) return;

            for (var z = 0; z < vis.binds.hqwidgets.zindex.length; z++) {
                if (vis.binds.hqwidgets.zindex[z] === $div.css('z-index')) {
                    vis.binds.hqwidgets.zindex.splice(z, 1);
                    break;
                }
            }

            var $big = $div.find('.hq-blind-big');
            if (data.noAnimate) {
                //$big.makeSlider('hide');
                setTimeout(function () {
                    $big.find('.hq-blind-big-slider').makeSlider('hide');
                    $big.hide();
                    $big.data('show', false);
                    // restore zindex
                    $div.css('z-index', $div.data('zindex'));
                }, 200);
            } else {
                $big.animate({width: $div.width(), height: $div.height(), opacity: 0, top: 0, left: 0}, 500, 'swing', function () {
                    $big.find('.hq-blind-big-slider').makeSlider('hide');
                    $big.hide();
                    $big.data('show', false);
                    // restore zindex
                    $div.css('z-index', $div.data('zindex'));
                });
            }

        },
        openPopup: function ($div) {
            var data = $div.data('data');
            if (!data) return;

            // make temporary z-index maximal
            var zindex = $div.data('zindex');
            // remember z-index
            if (zindex === null || zindex === undefined) {
                zindex = $div.css('z-index');
                $div.data('zindex', zindex);
            }
            // find maximal z-index
            var zindexMax = 900;
            /*$('.vis-widget').each(function () {
                var z = $(this).css('z-index');
                if (z > zindexMax) zindexMax = z;
            });*/
            for (var z = 0; z < vis.binds.hqwidgets.zindex.length; z++) {
                if (vis.binds.hqwidgets.zindex[z] > zindexMax) zindexMax = vis.binds.hqwidgets.zindex[z];
            }
            zindexMax++;

            // set this widget to maximal zindex
            $div.css('z-index', zindexMax);
            vis.binds.hqwidgets.zindex.push($div.css('z-index'));

            var $big = $div.find('.hq-blind-big');
            if (!$big.length) {
                var text = '<table class="hq-blind-big vis-hq-no-space" style="display:none">' +
                    '    <tr><td><div class="hq-blind-big-button hq-blind-big-button-up"></div></td></tr>' +
                    '    <tr style="height: 100%"><td><div class="hq-blind-big-slider"></div></td></tr>' +
                    '    <tr><td><div class="hq-blind-big-button hq-blind-big-button-down"></div></td></tr>' +
                    '</table>';
                $div.append(text);
                $div.find('.hq-blind-big-slider').makeSlider({
                    max:      data.max,
                    min:      data.min,
                    invert:   !data.invert,
                    show:     false,
                    relative: true,
                    value:    data.value,
                    timeout:  data.hide_timeout
                }, function (newValue) {
                    vis.setValue(data.oid, newValue);
                    vis.binds.hqwidgets.window.hidePopup($div);
                }, function () {
                    vis.binds.hqwidgets.window.hidePopup($div);
                });
                $div.find('.hq-blind-big-button-down').click(function () {
                    vis.setValue(data.oid, data.invert ? data.min : data.max);
                    vis.binds.hqwidgets.window.hidePopup($div);
                });
                $div.find('.hq-blind-big-button-up').click(function () {
                    vis.setValue(data.oid, data.invert ? data.max : data.min);
                    vis.binds.hqwidgets.window.hidePopup($div);
                });
                $big = $div.find('.hq-blind-big');
            }

            $big.data('show', true);

            if (data.bigLeft === undefined || data.bigLeft === null) {
                var pos = $div.position();
                var w   = $div.width();
                var h   = $div.height();

                data.bigWidth  = $big.width();
                data.bigHeight = $big.height();

                //default will still be center
                var popUpHorPos = Math.round((h - data.bigHeight) / 2);
                var popUpVerPos = Math.round((w - data.bigWidth) / 2);

                if ( data.popupVerticalPos === "left" ) {
                	  popUpVerPos = Math.round(w - data.bigWidth);
                }
                else if ( data.popupVerticalPos === "right" ) {
                	  popUpVerPos = 0;
                }
                data.bigLeft   = popUpVerPos;


                if ( data.popupHorizontalPos === "top" ) {
                    popUpHorPos = Math.round(h - data.bigHeight);
                }
                else if ( data.popupHorizontalPos === "bottom" ) {
                	  popUpHorPos = 0;
                }
                data.bigTop = popUpHorPos;


                if (pos.top  + data.bigTop < 0)  data.bigTop  = -pos.top;
                if (pos.left + data.bigLeft < 0) data.bigLeft = -pos.left;
            }

            $big.css({top: data.bigTop, left: data.bigLeft});

            if (data.noAnimate) {
                $big.find('.hq-blind-big-slider').makeSlider('show', data.value);
                $big.show();
            } else {
                $big.css({top:0, left: 0, width: $div.width(), height: $div.height(), opacity: 0}).show();
                $big.find('.hq-blind-big-slider').makeSlider('show', data.value);
                $big.animate({top: data.bigTop, left: data.bigLeft, width: data.bigWidth, height: data.bigHeight, opacity: 1}, 500);
            }
        },
        draw: function ($div) {
            var data = $div.data('data');
            if (!data) return;

            $div.css({
                'padding-top':    data.border_width,
                'padding-bottom': data.border_width - 1,
                'padding-right':  data.border_width + 1,
                'padding-left':   data.border_width + 1
            });

            // get position
            data.shutterPos = 0;
            if (data.oid) {
                data.value      = vis.states[data.oid + '.val'];
                data.shutterPos = data.value;
                if (data.shutterPos === undefined || data.shutterPos === null) {
                    data.shutterPos = 0;
                } else {
                    if (data.shutterPos < data.min) data.shutterPos = data.min;
                    if (data.shutterPos > data.max) data.shutterPos = data.max;

                    data.shutterPos = Math.round(100 * (data.shutterPos - data.min) / (data.max - data.min));
                }
                if (data.invert) data.shutterPos = 100 - data.shutterPos;
            }

            var text = '<table class="hq-blind vis-hq-no-space" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"><tr>';
            if (!data.descriptionLeftDisabled && data.descriptionLeft) {
                if (data.infoLeftPaddingLeft  === undefined || data.infoLeftPaddingLeft  === null) data.infoLeftPaddingLeft = '15px';
                if (data.infoLeftPaddingRight === undefined || data.infoLeftPaddingRight === null) data.infoLeftPaddingRight = '50px';
                if (!data.infoLeftPaddingLeft.match(/px$|rem$|em$/))  data.infoLeftPaddingLeft  = data.infoLeftPaddingLeft  + 'px';
                if (!data.infoLeftPaddingRight.match(/px$|rem$|em$/)) data.infoLeftPaddingRight = data.infoLeftPaddingRight + 'px';

                text += '<div class="vis-hq-leftinfo" style="padding-left: ' + data.infoLeftPaddingLeft + '; padding-right: ' + data.infoLeftPaddingRight + '; font-size: ' + (data.infoLeftFontSize || 12) + 'px' + (data.infoColor ? ';color: ' + data.infoColor : '') + (data.infoBackground ? ';background: ' + data.infoBackground : '') + '"><span class="vis-hq-leftinfo-text">' +
                    (data.descriptionLeft || '').replace(/\s/g, '&nbsp;').replace(/\\n/g, '<br>') + '</span></div>\n';
            }
            if (data.show_value) {
                if (data.infoRightPaddingLeft  === undefined || data.infoRightPaddingLeft  === null) data.infoRightPaddingLeft = '15px';
                if (data.infoRightPaddingRight === undefined || data.infoRightPaddingRight === null) data.infoRightPaddingRight = '15px';
                if (!data.infoRightPaddingRight.match(/px$|rem$|em$/)) data.infoRightPaddingRight = data.infoRightPaddingRight + 'px';

                text += '<div class="vis-hq-rightinfo" style="padding-right: ' + data.infoRightPaddingRight + '; font-size: ' + (data.infoFontRightSize || 12) + 'px' + (data.infoColor ? ';color: ' + data.infoColor : '') + (data.infoBackground ? ';background: ' + data.infoBackground : '') + '"><span class="vis-hq-rightinfo-text">' +
                    (data.infoRight || '').replace(/\s/g, '&nbsp;').replace(/\\n/g, '<br>') + '</span>';

                text += '</div>\n';
            }
            for (var i = 1; i <= data.slide_count; i++) {
                var options = {
                    slideOid:     data['oid-slide-sensor' + i],
                    handleOid:    data['oid-slide-handle' + i],
                    type:         data['slide_type' + i],
                    border_width: data.border_width,
                    shutterPos:   data.shutterPos
                };
                text += '<td style="height: 100%">' + this.drawOneWindow(i, options) + '</td>';
            }
            text += '</tr></table>';
            $div.html(text);

            $div.find('.hq-blind-blind2').each(function (id) {
                id++;
                if (data['oid-slide-sensor-lowbat' + id]) {
                    data['oid-slide-sensor-lowbat'][id] = vis.states[data['oid-slide-sensor-lowbat' + id] + '.val'];
                    $(this).batteryIndicator({
                        show:    data['oid-slide-sensor-lowbat'][id] || false,
                        title:   _('Low battery on sash sensor'),
                        classes: 'slide-low-battery'
                    });
                }
            });
            $div.find('.hq-blind-blind3').each(function (id) {
                id++;
                if (data['oid-slide-handle-lowbat' + id]) {
                    data['oid-slide-handle-lowbat'][id] = vis.states[data['oid-slide-handle-lowbat' + id] + '.val'];
                    $(this).batteryIndicator({
                        show:    data['oid-slide-handle-lowbat'][id] || false,
                        color:   '#FF55FA',
                        title:   _('Low battery on handle sensor'),
                        classes: 'handle-low-battery'
                    });
                    $(this).find('.handle-low-battery').css({top: 8});
                }
            });

            var width = $div.width();
            var offset = width - 20;
            if (offset < width / 2) offset = width / 2;
            $div.find('.vis-hq-leftinfo').css({right: offset + 'px'});
            $div.find('.vis-hq-rightinfo').css({'padding-left': (5 + (width / 2) + (parseInt(data.infoRightPaddingLeft, 10) || 0)) + 'px'});
        },
        init: function (wid, view, data, style) {
            vis.binds.hqwidgets.showVersion();

            var $div = $('#' + wid).addClass('vis-hq-button-base');
            if (!$div.length) {
                setTimeout(function () {
                    vis.binds.hqwidgets.window.init(wid, view, data, style);
                }, 100);
                return;
            }
            var _data = {wid: wid, view: view};
            for (var a in data) {
                if (!data.hasOwnProperty(a) || typeof data[a] === 'function') continue;
                if (a[0] !== '_') _data[a] = data[a];
            }
            data = _data;

            data.hide_timeout = data.hide_timeout === 0 || data.hide_timeout === '0' ? 0 : parseInt(data.hide_timeout, 10) || 2000;
            data.min          = data.min !== undefined && data.min !== null ? parseFloat(data.min) : 0;
            data.max          = data.max !== undefined && data.max !== null ? parseFloat(data.max) : 100;
            data.digits       = data.digits || data.digits === 0 ? parseInt(data.digits, 10) : null;
            data.noAnimate    = data.noAnimate === 'true' || data.noAnimate === true || data.noAnimate === 1 || data.noAnimate === '1';

            if (!data.border_width && data.border_width !== '0') {
                data.border_width = 3;
            }
            data.border_width = parseInt(data.border_width, 10);

            $div.data('data',  data);
            $div.data('style', style);

            data.min = parseFloat(data.min);
            data.max = parseFloat(data.max);
            if (data.max < data.min) {
                var tmp  = data.min;
                data.min = data.max;
                data.max = tmp;
            }
            data['oid-slide-sensor-lowbat'] = [];
            data['oid-slide-handle-lowbat'] = [];

            if (data['oid-working']) {
                data.working = vis.states.attr(data['oid-working']  + '.val');
            }

            vis.binds.hqwidgets.window.draw($div);

            function onChange(e, newVal /* , oldVal */) {
                if (e.type === data.oid + '.val') {
                    var shutterPos = newVal;
                    data.value = shutterPos;
                    if (shutterPos === undefined || shutterPos === null) {
                        data.shutterPos = 0;
                    } else {
                        if (shutterPos < data.min) shutterPos = data.min;
                        if (shutterPos > data.max) shutterPos = data.max;

                        data.shutterPos = Math.round(100 * (shutterPos - data.min) / (data.max - data.min));
                    }

                    if (data.invert) data.shutterPos = 100 - data.shutterPos;

                    if (!data.noAnimate) {
                        $div.find('.hq-blind-position').animate({'height': data.shutterPos + '%'}, 500);
                    } else {
                        $div.find('.hq-blind-position').css({'height': data.shutterPos + '%'});
                    }
                    $div.find('.vis-hq-rightinfo-text').html(data.shutterPos + '%');
                } else {
                    for (var t = 1; t <= data.slide_count; t++) {
                        if (e.type === data['oid-slide-sensor' + t] + '.val' || e.type === data['oid-slide-handle' + t] + '.val') {
                            vis.binds.hqwidgets.window.draw($div);
                            break;
                        } else if (e.type === data['oid-slide-sensor-lowbat' + t] + '.val') {
                            data['oid-slide-sensor-lowbat'][t] = vis.states[data['oid-slide-sensor-lowbat' + t] + '.val'];
                            $div.find('.slide-low-battery').each(function (id) {
                                id++;
                                if (data['oid-slide-sensor-lowbat' + id]) {
                                    if (data['oid-slide-sensor-lowbat'][id]) {
                                        $(this).show();
                                    } else {
                                        $(this).hide();
                                    }
                                }
                            });
                        } else if (e.type === data['oid-slide-handle-lowbat' + t] + '.val') {
                            data['oid-slide-handle-lowbat'][t] = vis.states[data['oid-slide-handle-lowbat' + t] + '.val'];
                            $div.find('.handle-low-battery').each(function (id) {
                                id++;
                                if (data['oid-slide-handle-lowbat' + id]) {
                                    if (data['oid-slide-handle-lowbat'][id]) {
                                        $(this).show();
                                    } else {
                                        $(this).hide();
                                    }
                                }
                            });
                        }
                    }
                }
            }

            var bound = [];

            for (var i = 1; i <= data.slide_count; i++) {
                if (data['oid-slide-sensor' + i]) {
                    vis.states.bind(data['oid-slide-sensor' + i] + '.val', onChange);
                    bound.push(data['oid-slide-sensor' + i] + '.val');
                }
                if (data['oid-slide-handle' + i]) {
                    vis.states.bind(data['oid-slide-handle' + i] + '.val', onChange);
                    bound.push(data['oid-slide-handle' + i] + '.val');
                }
                if (data['oid-slide-sensor-lowbat' + i]) {
                    vis.states.bind(data['oid-slide-sensor-lowbat' + i] + '.val', onChange);
                    bound.push(data['oid-slide-sensor-lowbat' + i] + '.val');
                }
                if (data['oid-slide-handle-lowbat' + i]) {
                    vis.states.bind(data['oid-slide-handle-lowbat' + i] + '.val', onChange);
                    bound.push(data['oid-slide-handle-lowbat' + i] + '.val');
                }
            }

            if (data.oid) {
                if (!vis.editMode) {
                    // prepare big window
                    $div.click(function () {
                        var $big = $div.find('.hq-blind-big');
                        if (!$big.length || !$big.data('show')) {
                            vis.binds.hqwidgets.window.openPopup($div);
                        }
                    });
                }

                vis.states.bind(data.oid + '.val', onChange);
                bound.push(data.oid + '.val');
            }

            if (bound.length) {
                // remember all ids, that bound
                $div.data('bound', bound);
                // remember bind handler
                $div.data('bindHandler', onChange);
            }

            var shutterPos = vis.states[data.oid + '.val'] || 0;
            if (shutterPos < data.min) shutterPos = data.min;
            if (shutterPos > data.max) shutterPos = data.max;
            shutterPos = Math.round(100 * (shutterPos - data.min) / (data.max - data.min));
            if (data.invert) shutterPos = 100 - shutterPos;
            $div.find('.vis-hq-rightinfo-text').html(shutterPos + '%');

            if (vis.editMode && vis.activeWidgets.indexOf(wid) !== -1) {
                $div.resizable('destroy');
                vis.resizable($div);
            }
        }
    },
    door: {
        changeState: function ($div, notUpdateDoor, isFirst) {
            var data = $div.data('data');
            if (!data) return;

            var value = data.value;

            if (data['oid-battery']) $div.batteryIndicator('show', data.battery || false);

            if (data['oid-signal']) {
                $div.find('.vis-hq-signal').html(data.signal);
            }

            if (!notUpdateDoor) {
                if (value) {
                    if (data.noAnimate || isFirst) {
                        $div.find('.vis-hq-door-sheet').css({width: '80%'});
                        $div.find('.vis-hq-door-empty-' + (data.door_type || 'left')).css({width: '20%'});
                        $div.find('.vis-hq-door-handle').css({left: (data.door_type !== 'right') ? '60%': '30%'});
                    } else {
                        $div.find('.vis-hq-door-sheet').animate({width: '80%'}, 500);
                        $div.find('.vis-hq-door-empty-' + (data.door_type || 'left')).animate({width: '20%'}, 500);
                        $div.find('.vis-hq-door-handle').animate({left: (data.door_type !== 'right') ? '60%': '30%'}, 500);
                    }
                } else {
                    if (data.noAnimate || isFirst) {
                        $div.find('.vis-hq-door-sheet').css({width: '100%'});
                        $div.find('.vis-hq-door-empty-' + (data.door_type || 'left')).css({width: 0});
                        $div.find('.vis-hq-door-handle').css({left: (data.door_type !== 'right') ? '85%': '15%'});
                    } else {
                        $div.find('.vis-hq-door-sheet').animate({width: '100%'}, 500);
                        $div.find('.vis-hq-door-empty-' + (data.door_type || 'left')).animate({width: 0});
                        $div.find('.vis-hq-door-handle').animate({left: (data.door_type !== 'right') ? '85%': '15%'}, 500);
                    }
                }
            }
        },
        draw: function ($div) {
            var data = $div.data('data');
            if (!data) return;

            // place left-info, right-info, caption and image
            if (!$div.find('.vis-hq-main').length) {
                var text = '';
                if (!data.descriptionLeftDisabled && data.descriptionLeft) {
                    if (data.infoLeftPaddingLeft  === undefined || data.infoLeftPaddingLeft  === null) data.infoLeftPaddingLeft = '15px';
                    if (data.infoLeftPaddingRight === undefined || data.infoLeftPaddingRight === null) data.infoLeftPaddingRight = '50px';
                    if (!data.infoLeftPaddingLeft.match(/px$|rem$|em$/))  data.infoLeftPaddingLeft  = data.infoLeftPaddingLeft  + 'px';
                    if (!data.infoLeftPaddingRight.match(/px$|rem$|em$/)) data.infoLeftPaddingRight = data.infoLeftPaddingRight + 'px';

                    text += '<div class="vis-hq-leftinfo" style="padding-left: ' + data.infoLeftPaddingLeft + '; padding-right: ' + data.infoLeftPaddingRight + '; font-size: ' + (data.infoLeftFontSize || 12) + 'px' + (data.infoColor ? ';color: ' + data.infoColor : '') + (data.infoBackground ? ';background: ' + data.infoBackground : '') + '"><span class="vis-hq-leftinfo-text">' +
                        (data.descriptionLeft || '').replace(/\s/g, '&nbsp;').replace(/\\n/g, '<br>') + '</span></div>\n';
                }
                if (data.infoRight || data.wType === 'number' || data.hoursLastAction) {
                    if (data.infoRightPaddingLeft  === undefined || data.infoRightPaddingLeft  === null) data.infoRightPaddingLeft = '15px';
                    if (data.infoRightPaddingRight === undefined || data.infoRightPaddingRight === null) data.infoRightPaddingRight = '15px';
                    if (!data.infoRightPaddingRight.match(/px$|rem$|em$/)) data.infoRightPaddingRight = data.infoRightPaddingRight + 'px';

                    text += '<div class="vis-hq-rightinfo" style="padding-right: ' + data.infoRightPaddingRight + '; font-size: ' + (data.infoFontRightSize || 12) + 'px' + (data.infoColor ? ';color: ' + data.infoColor : '') + (data.infoBackground ? ';background: ' + data.infoBackground : '') + '"><span class="vis-hq-rightinfo-text">' +
                        (data.infoRight || '').replace(/\s/g, '&nbsp;').replace(/\\n/g, '<br>') + '</span>';

                    if (data.hoursLastAction) {
                        if (data.infoRight || data.wType === 'number') text += '<br>';
                        text += '<span class="vis-hq-time"></span>';
                    }

                    text += '</div>\n';
                }
                text += '<table class="vis-hq-main vis-hq-door vis-hq-no-space" style="z-index: 1; position: absolute; top: 0; right: 0;">' +
                    '<tr class="vis-hq-no-space">' +
                        '<td class="vis-hq-no-space vis-hq-door-empty-right"></td>' +
                        '<td class="vis-hq-no-space vis-hq-door-sheet"><div class="vis-hq-door-handle"></div></td>' +
                        '<td class="vis-hq-no-space vis-hq-door-empty-left"></td>' +
                    '</tr></table>\n';
                $div.append(text);
            }
            $div.find('.vis-hq-door-empty-' + (data.door_type || 'left')).css({background: data.emptyColor || '#515151'});
            if (data.door_type === 'right') {
                $div.find('.vis-hq-door-handle').css({left: '15%'});
            } else {
                $div.find('.vis-hq-door-handle').css({left: '85%'});
            }

            $div.css({
                'padding-top':     data.border_width,
                'padding-bottom' : data.border_width - 1,
                'padding-right':   data.border_width + 1,
                'padding-left':    data.border_width + 1
            });

            var width = $div.width();
            var offset = width - 20;
            if (offset < width / 2) offset = width / 2;
            $div.find('.vis-hq-leftinfo').css({right: offset + 'px'});
        },
        init: function (wid, view, data, style) {
            vis.binds.hqwidgets.showVersion();

            var $div = $('#' + wid).addClass('vis-hq-button-base');
            if (!$div.length) {
                setTimeout(function () {
                    vis.binds.hqwidgets.door.init(wid, view, data, style);
                }, 100);
                return;
            }
            var _data = {wid: wid, view: view};
            for (var a in data) {
                if (!data.hasOwnProperty(a) || typeof data[a] === 'function') continue;
                if (a[0] !== '_') _data[a] = data[a];
            }
            data = _data;

            if (!data.border_width && data.border_width !== '0') data.border_width = 3;
            data.border_width = parseInt(data.border_width, 10);
            if (data['oid-battery'])  data.battery  = vis.states.attr(data['oid-battery']  + '.val');
            if (data['oid-signal'])   data.signal   = vis.states.attr(data['oid-signal']   + '.val');

            $div.data('data',  data);
            $div.data('style', style);

            vis.binds.hqwidgets.door.draw($div);

            function onChange(e, newVal) {
                if (e.type === data.oid + '.val') {
                    var doorState = newVal;
                    if (newVal === 'true' || newVal === true)  {
                        doorState = true;
                    } else if (newVal === 'false' || newVal === false) {
                        doorState = false;
                    } else if (typeof newVal === 'string') {
                        doorState = parseFloat(newVal) > 0;
                    } else {
                        doorState = !!newVal;
                    }

                    if (data.invert) doorState = !doorState;
                    data.value = doorState;

                    vis.binds.hqwidgets.door.changeState($div);
                } else if (e.type === data['oid-signal'] + '.val') {
                    data.signal = newVal;
                    vis.binds.hqwidgets.door.changeState($div, true);
                } else if (e.type === data['oid-battery'] + '.val') {
                    data.battery = newVal;
                    vis.binds.hqwidgets.door.changeState($div, true);
                }
            }
            var bound = [];

            if (data.oid) {
                if (!vis.editMode) {
                    // prepare big window
                    $div.click(function () {
                        var $big = $div.find('.hq-blind-big');
                        if (!$big.length || !$big.data('show')) {
                            //vis.binds.hqwidgets.window.openPopup($div);
                        }
                    });
                }

                vis.states.bind(data.oid + '.val', onChange);
                bound.push(data.oid + '.val');
                var newVal = vis.states.attr(data.oid + '.val');
                var doorState;

                if (newVal === 'true' || newVal === true)  {
                    doorState = true;
                } else if (newVal === 'false' || newVal === false) {
                    doorState = false;
                } else if (typeof newVal === 'string') {
                    doorState = parseFloat(newVal) > 0;
                } else {
                    doorState = !!newVal;
                }

                if (data.invert) doorState = !doorState;
                data.value = doorState;
            }
            if (data['oid-battery']) {
                $div.batteryIndicator();
                vis.states.bind(data['oid-battery'] + '.val', onChange);
                bound.push(data['oid-battery'] + '.val');
            }

            if (data['oid-signal']) {
                vis.states.bind(data['oid-signal'] + '.val', onChange);
                bound.push(data['oid-signal'] + '.val');
            }
            if (bound.length) {
                // remember all ids, that bound
                $div.data('bound', bound);
                // remember bind handler
                $div.data('bindHandler', onChange);
            }
            vis.binds.hqwidgets.door.changeState($div, false, true);
        }
    },
    lock: {
        draw: function ($div, isInit) {
            var data = $div.data('data');
            if (!data) return;

            var $img = $div.find('img:first');
            if (!$img.length) {
                if (!$div.is(':visible')) {
                    return setTimeout(function () {
                        vis.binds.hqwidgets.lock.draw($div, isInit);
                    }, 400);
                }

                $div.html('<img src="" class="vis-hq-lock1" style="width: 100%; height:100%;"/>' +
                    '<div class="vis-hq-biglock" style="display: none">' +
                    '    <div class="vis-hq-biglock-button vis-hq-biglock-close '    + (data.closeStyle    || '') + '"><img src="' + (data.closeIcon     || '') + '" style="width: 100%; height:100%"/></div>' +
                    '    <div class="vis-hq-biglock-button vis-hq-biglock-open '     + (data.openStyle     || '') + '"><img src="' + (data.openIcon      || '') + '" style="width: 100%; height:100%"/></div>' +
                    '    <div class="vis-hq-biglock-button vis-hq-biglock-openDoor ' + (data.openDoorStyle || '') + '"><img src="' + (data.openDoorIcon  || '') + '" style="width: 100%; height:100%"/></div>' +
                    '</div>');
                $img = $div.find('.vis-hq-lock1');
                var $big = $div.find('.vis-hq-biglock');
                data.popupRadius = parseInt(data.popupRadius, 10) || 75;
                $big.css({'border-radius': data.popupRadius, width: data.popupRadius * 2, height: data.popupRadius * 2});
                $div.find('.vis-hq-biglock-button').css({borderRadius: parseInt(data.buttonRadius, 10) || 0});

                $big.css({top: ($div.height() - $big.height()) / 2, left: ($div.width()  - $big.width()) / 2});

                if (data.oid && data.oid !== 'nothing_selected') {
                    if (data.openValue === undefined || data.openValue === null || data.openValue === '') {
                        data.openValue = true;
                    } else {
                        if (data.openValue === 'true')  data.openValue = true;
                        if (data.openValue === 'false') data.openValue = false;
                        if (parseFloat(data.openValue).toString() == data.openValue) data.openValue = parseFloat(data.openValue);
                    }
                    if (data.closeValue === undefined || data.closeValue === null || data.closeValue === '') {
                        data.closeValue = false;
                    } else {
                        if (data.closeValue === 'true')  data.closeValue = true;
                        if (data.closeValue === 'false') data.closeValue = false;
                        if (parseFloat(data.closeValue).toString() == data.closeValue) data.closeValue = parseFloat(data.closeValue);
                    }

                    $img.click(function () {
                        $div.popupShow($big, {relative: true});
                        // hide
                        if (data.showTimeout) {
                            data.timer = setTimeout(function () {
                                data.timer = null;
                                $div.popupHide($big, {relative: true});
                            }, data.showTimeout)
                        }
                    });
                    if (!vis.editMode) {
                        $div.find('.vis-hq-biglock-close').click(function () {
                            if (data.timer) {
                                clearTimeout(data.timer);
                                data.timer = null;
                            }
                            $div.popupHide($big, {relative: true});
                            vis.setValue(data.oid, data.closeValue);
                        });
                        $div.find('.vis-hq-biglock-open').click(function () {
                            if (data.timer) {
                                clearTimeout(data.timer);
                                data.timer = null;
                            }
                            $div.popupHide($big, {relative: true});
                            vis.setValue(data.oid, data.openValue);
                        });
                    }
                }
                if (!data['oid-open']) {
                    $div.find('.vis-hq-biglock-openDoor').hide();
                } else {
                    if (data.openDoorValue === undefined || data.openDoorValue === null || data.openDoorValue === '') {
                        data.openDoorValue = true;
                    } else {
                        if (data.openDoorValue === 'true')  data.openDoorValue = true;
                        if (data.openDoorValue === 'false') data.openDoorValue = false;
                        if (parseFloat(data.openDoorValue).toString() == data.openDoorValue) data.openDoorValue = parseFloat(data.openDoorValue);
                    }
                    if (!vis.editMode) {
                        $div.find('.vis-hq-biglock-openDoor').click(function () {
                            $div.popupHide($big, {relative: true});
                            if (data.timer) {
                                clearTimeout(data.timer);
                                data.timer = null;
                            }
                            vis.setValue(data['oid-open'], data.openDoorValue);
                        });
                    }
                }
            }
            if (!data.oid || data.oid === 'nothing_selected' || vis.binds.hqwidgets.lock.isFalse(vis.states.attr(data.oid  + '.val'), data.closeValue, data.openValue)) {
                $div.removeClass(data.styleActive).addClass(data.styleNormal);
                $img.attr('src', data.closedIcon || '');
            } else {
                $div.removeClass(data.styleNormal).addClass(data.styleActive);
                $img.attr('src', data.openedIcon || data.closedIcon || '');
            }

            // Show change effect
            if (data.changeEffect && (!isInit || (vis.editMode && data.testActive))) {
                $div.animateDiv(data.changeEffect, {color: data.waveColor});
            }
        },
        isFalse: function (val, min, max) {
            if (min !== undefined && min !== null && min !== '') {
                if (max !== undefined && max !== null && max !== '') {
                    return val != max;
                } else {
                    return val == min;
                }
            }
            if (val === undefined || val === null || val === false || val === 'false' || val === '') return true;
            if (val === '0' || val === 0) return true;
            var f = parseFloat(val);
            if (f.toString() !== 'NaN') return !f;
            return false;
        },
        init: function (wid, view, data, style) {
            vis.binds.hqwidgets.showVersion();
            var $div = $('#' + wid).addClass('vis-hq-button-base');
            if (!$div.length) {
                setTimeout(function () {
                    vis.binds.hqwidgets.lock.init(wid, view, data, style);
                }, 100);
                return;
            }
            var _data = {wid: wid, view: view};
            for (var a in data) {
                if (!data.hasOwnProperty(a) || typeof data[a] === 'function') continue;
                if (a[0] !== '_') {
                    _data[a] = data[a];
                }
            }
            data = _data;

            if (data.closeValue === undefined || data.closeValue === null || data.closeValue === '') data.closeValue = false;
            if (data.openValue  === undefined || data.openValue  === null || data.openValue  === '') data.openValue  = true;

            data.styleNormal = data.usejQueryStyle ? 'ui-state-default' : (data.styleNormal || 'hq-button-no-background');
            data.styleActive = data.usejQueryStyle ? 'ui-state-active'  : (data.styleActive || 'hq-button-no-background');
            $div.data('data', data);
            function onChange(e, newVal, oldVal) {
                data.signal = newVal;
                vis.binds.hqwidgets.lock.draw($div);
            }

            if (data.oid) {
                vis.states.bind(data.oid + '.val', onChange);
                // remember all ids, that bound
                $div.data('bound', [data.oid + '.val']);
                // remember bind handler
                $div.data('bindHandler', onChange);
            }

            vis.binds.hqwidgets.lock.draw($div, true);
        }
    },
    circle: {
        init: function (wid, view, data) {
            vis.binds.hqwidgets.showVersion();

            var $div = $('#' + wid);
            if (!$div.length) {
                setTimeout(function () {
                    vis.binds.hqwidgets.circle.init(wid, view, data);
                }, 100);
                return;
            }

            var settings = data;
            var $scalaInput = $div.find('input');
            $div.addClass('vis-hq-button-base');

            function onChange(e, newVal, oldVal) {
                settings.value = newVal;
                $scalaInput.val(settings.value).trigger('change');
            }

            if (settings.oid) {
                $scalaInput.val(vis.states.attr(settings.oid + '.val'));
                if (1 || !vis.editMode) {
                    vis.states.bind(settings.oid + '.val', onChange);
                    // remember all ids, that bound
                    $div.data('bound', [settings.oid + '.val']);
                    // remember bind handler
                    $div.data('bindHandler', onChange);
                }
            } else {
                $scalaInput.val(settings.min);
            }

            var offset = settings.angleOffset;
            if (settings.angleArc !== undefined && settings.angleArc !== null && !offset && offset !== 0 && offset !== '0') {
                offset = 180 + (360 - parseInt(settings.angleArc, 10)) / 2;
            }

            $scalaInput.attr('data-angleOffset', offset);
            $scalaInput.attr('data-angleArc',    settings.angleArc);
            $scalaInput.attr('data-thickness',   settings.thickness);
            $scalaInput.attr('data-linecap',     (settings.linecap === 'true' || settings.linecap === true) ? 'round' : 'butt');
            $scalaInput.show();

            $scalaInput.knobHQ({
                width:   parseInt($div.width(),  10),
                height:  parseInt($div.height(), 10),
                release: function () {
                    if (settings.readOnly) return;
                    // remove unit
                    var oldValue = $scalaInput.data('oldValue');
                    var val = $scalaInput.val();

                    if ((settings.unit || settings.unit === 0) && val.substring(val.length - settings.unit.length, val.length) === settings.unit) {
                        val = val.substring(0, val.length - settings.unit.length);
                    }
                    if (oldValue != val && !vis.editMode && settings.oid) {
                        $scalaInput.data('oldValue', val);
                        val = parseFloat(val.toString().replace(',', '.'));
                        vis.setValue(settings.oid, val);
                    }
                },
                cancel:  function () {
                },
                change:  function (value) {
                },
                format:  function (v) {
                    v = parseFloat(v) || 0;
                    if (settings.digits !== null) v = v.toFixed(settings.digits);
                    if ((settings.is_comma === 'true' || settings.is_comma === true) && v) v = v.toString().replace('.', ',');
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
                min:              parseFloat(settings.min),
                max:              parseFloat(settings.max),
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
            if (font !== parentFont) $scalaInput.css('font-size', font);

            parentFont = $div.parent().css('font-weight');
            font       = $div.css('font-weight');
            if (font !== parentFont) $scalaInput.css('font-weight', font);

            parentFont = $div.parent().css('font-style');
            font       = $div.css('font-style');
            if (font !== parentFont) $scalaInput.css('font-style', font);

            parentFont = $div.parent().css('font-variant');
            font       = $div.css('font-variant');
            if (font !== parentFont) $scalaInput.css('font-variant', font);
        }
    },
    checkbox: {
        styles: [
            'orange', 'blue', 'green', 'grey'
        ],
        isTrue: function (value, max) {
            if (value === 'true')  value = true;
            if (value === 'false') value = false;
            if (value == parseFloat(value)) value = parseFloat(value);
            if (max === true && typeof value === 'number') {
                value = value > 0;
            }

            return value == max;
         },
        init: function (wid, view, data) {
            vis.binds.hqwidgets.showVersion();

            var $div = $('#' + wid);
            if (!$div.length) {
                setTimeout(function () {
                    vis.binds.hqwidgets.checkbox.init(wid, view, data);
                }, 100);
                return;
            }
            if (data.val_false === undefined || data.val_false === null || data.val_false === 'false') {
                data.val_false = false;
            }
            if (data.val_false === 'true') {
                data.val_false = true;
            }
            if (data.val_false == parseFloat(data.val_false)) {
                data.val_false = parseFloat(data.val_false);
            }

            if (data.val_true === undefined || data.val_true === null || data.val_true === 'true') {
                data.val_true = true;
            }
            if (data.val_true === 'false')   {
                data.val_true = false;
            }
            if (data.val_true == parseFloat(data.val_true)) {
                data.val_true = parseFloat(data.val_true);
            }

            var settings = {
                oid:             data.oid             || null,
                staticValue:     data.staticValue,
                checkboxSize:    data.checkboxSize    || 'big',
                checkboxColor:   data.checkboxColor   || 'grey',
                checkboxColorOn: data.checkboxColorOn || data.checkboxColor || 'orange',
                readOnly:        vis.editMode         || data.readOnly || false,
                min:             data.val_false,
                max:             data.val_true
            };
            if (settings.checkboxSize === 'small') {
                $div.css({width: 108, height: 34});
            }

            if (!$div.find('input').length) $div.append('<input type="checkbox"/>');
            var $input = $div.find('input');

            var $shineCheckbox = $input.shineCheckbox(settings);
            function onChange(e, newVal, oldVal) {
                $shineCheckbox.shineCheckbox('value', vis.binds.hqwidgets.checkbox.isTrue(newVal, settings.max));
            }

            if (settings.oid && settings.oid !== 'nothing_selected') {
                $shineCheckbox.shineCheckbox('value', vis.binds.hqwidgets.checkbox.isTrue(vis.states.attr(settings.oid + '.val'), settings.max));
                $shineCheckbox.data('update', false);
                vis.states.bind(settings.oid + '.val', onChange);
                // remember all ids, that bound
                $div.data('bound', [settings.oid + '.val']);
                // remember bind handler
                $div.data('bindHandler', onChange);

                $div.find('input').change(function (evt) {
                    if ($(this).data('update')) {
                        $(this).data('update', false);
                    } else {
                        vis.setValue(settings.oid, $(this).prop('checked') ? settings.max : settings.min);
                    }
                });
            } else {
                $shineCheckbox.shineCheckbox('value', vis.binds.hqwidgets.checkbox.isTrue(settings.staticValue, settings.max));
            }
        }
    },
    odometer: function (view, data) {
        vis.binds.hqwidgets.showVersion();

        var $div = $('#' + data.wid);
        if (!$div.length) {
            setTimeout(function () {
                vis.binds.hqwidgets.odometer(view, data);
            }, 100);
            return;
        } else
        if (!$div.is(':visible')) {
            setTimeout(function () {
                vis.binds.hqwidgets.odometer(view, data);
            }, 500);
            return;
        }

        Odometer.prototype.watchForMutations = function() {};

        var oid    = data.oid;
        var format = data.format || '(.ddd),dd';
        var factor = parseFloat(data.factor) || 1;
        var max = 0;
        var $od = $div.find('.odometer');
        if ($od.length) {
            $od.innerHTML = '';
            $od.remove();
        }
        $div.append('<div class="odometer"></div>');
        $od = $div.find('.odometer');

        if (data.leadingZeros) {
            var m = format.match(/\([,.\s]?(d+)\)/);
            if (m && m[1]) {
                max = m[1].length;
                max = Math.pow(10, max);
            }
            m = format.match(/(\(+\))?[,.](d+)/);
            if (m && m[2]) {
                format += 'd';
                max += Math.pow(0.1, m[2].length + 1);
            } else {
                max *= 10;
                format = format.replace('d', 'dd');
                factor *= 10;
            }
            $od.parent().addClass('odometer-leading');
        }

        var od = new Odometer({
            el:         $od[0],
            value:      (vis.states[oid + '.val'] || 0) * factor + max,
            duration:   parseInt(data.duration, 10) || 3000,
            theme:      data.style || 'car',
            format:     format
        });


        if (oid && oid !== 'nothing_selected') {
            vis.states.bind(oid + '.val', function (e, newVal) {
                od.update(parseFloat(newVal) * factor + max);
            });
            od.update(parseFloat(vis.states[oid + '.val']) * factor + max);
        } else {
            od.update(max);
        }
    }
};

if (vis.editMode) {
/*
		"tpl": "tplHqShutter",
        "hqoptions" : "{
			"x":1095,
			"y":336,
			"height":54,
			"width":54,
			"radius":0,
			"zindex":3,
			"buttonType":3,
			"windowConfig":"1",
			"title":"Schlaffzimmer.Rolladen.Aktor",
			"room":"Schlafzimmer",

		}",

        *  /
	  /*
		"tpl": "tplHqButton",
        "hqoptions": "{
			"x":1040,
			"y":429,
			"height":46,
			"width":46,
			"radius":22,
			"zindex":2,
			"iconName":"img/KinderBug.png",
			"title":"LampeAmFenster.Aktor",
			"room":"Kinderzimmer",
			"hm_id":"7480"
		}",
	*/
	  /*
		"tpl": "tplHqOutTemp",
        "hqoptions": "{
			"x":481,
			"y":45,
			"width":46,
			"radius":22,
			"zindex":2,
			"buttonType":2,
			"iconName":"Temperature.png",
			"title":"Temperatur.Sensor",
			"room":"Balkon",
			"hm_id":"12871",
			"charts":{
				"navigator":"",
				"percentaxis":"true",
				"period":"72",
				"theme":"dark-blue",
				"range":"24",
				"scrollbar":"true",
				"grouping":"true",
				"legend":"inline",
				"zoom":"true",
				"loader":"false"
			}
		}",
        "informWindow": "{"x":85,
			"y":20,
			"width":656,
			"height":491}"
		},
*//*
      "tpl": "tplHqInTemp",
        "hqoptions": "{
			"x":877,
			"y":430,
			"height":44,
			"width":46,
			"radius":22,
			"zindex":2,
			"buttonType":1,
			"iconName":"Temperature.png",
			"title":"Heizung.Regler",
			"room":"Kinderzimmer",
			"hm_id":"3837",
			"hm_idV":"3822",
			"charts":{
				"navigator":"",
				"percentaxis":"true",
				"period":"72",
				"theme":"dark-green",
				"range":"24",
				"scrollbar":"true",
				"grouping":"true",
				"legend":"inline",
				"zoom":"true",
				"loader":"false"
			}
		}",
        "informWindow": "{
			"x":500,
			"y":253,
			"width":800,
			"height":400
		}"
 */

    vis.binds.hqwidgets.convertOldWidgets = function (widget) {
        if (widget.data && widget.data.hqoptions) {
            try {
                var hqoptions = JSON.parse(widget.data.hqoptions);
                widget.style.height = 45;
                widget.style.width  = 45;
                for (var opt in hqoptions) {
                    if (opt === 'width') {
                        widget.style.width = hqoptions.width || 45;
                    } else if (opt === 'height') {
                        widget.style.height = hqoptions.height || 45;
                    } else if (opt === 'radius') {
                        widget.style['border-radius'] = hqoptions.radius + 'px';
                    } else if (opt === 'zindex') {
                        widget.style['z-index'] = hqoptions.zindex;
                    } else if (opt === 'iconName') {
                        widget.data.btIconWidth = 32;
                        if (hqoptions.iconName === 'Temperature.png') {
                            widget.data.iconName = 'img/Heating.png'
                        } else
                        if (hqoptions.iconName === 'Lamp.png') {
                            widget.data.iconName = 'img/Lamp.png'
                        } else
                        if (hqoptions.iconName && hqoptions.iconName.indexOf('http://') === -1 && hqoptions.iconName[0] !== '/') {
                            widget.data.iconName = '/' + vis.conn.namespace + '/' + vis.projectPrefix + hqoptions.iconName;
                        } else {
                            widget.data.iconName = hqoptions.iconName;
                        }
                    } else if (opt === 'iconOn') {
                        if (hqoptions.iconOn === 'Temperature.png') {
                            widget.data.iconOn = 'img/Heating.png'
                        } else
                        if (hqoptions.iconOn === 'Lamp.png') {
                            widget.data.iconOn = 'img/Lamp.png'
                        } else
                        if (hqoptions.iconOn && hqoptions.iconOn.indexOf('http://') === -1 && hqoptions.iconOn[0] !== '/') {
                            widget.data.iconOn = '/' + vis.conn.namespace + '/' + vis.projectPrefix + hqoptions.iconOn;
                        } else {
                            widget.data.iconOn = hqoptions.iconOn;
                        }
                    } else if (opt === 'title') {
                        widget.data.descriptionLeft = hqoptions.title;
                    } else if (opt === 'room') {
                        widget.data.descriptionLeft += '<br>' + hqoptions.room;
                    } else if (opt === 'windowConfig') {
                        var parts = hqoptions.windowConfig.split(',');
                        widget.data.slide_count = parts.length || 1;
                        for (var p = 0; p < parts.length; p++) {
                            if (parts[p] === '0') {
                                widget.data['slide_type' + (p + 1)] = '';
                            } else if (parts[p] === '1') {
                                widget.data['slide_type' + (p + 1)] = 'left';
                            } else if (parts[p] === '2') {
                                widget.data['slide_type' + (p + 1)] = 'right';
                            } else if (parts[p] === '3') {
                                widget.data['slide_type' + (p + 1)] = 'top';
                            }
                        }
                        widget.data.border_width = 1;
                        if (widget.data.hm_id  !== undefined && widget.data.hm_id  !== null) delete widget.data.hm_id;
                        if (widget.data.digits !== undefined && widget.data.digits !== null) delete widget.data.digits;
                        if (widget.data.factor !== undefined && widget.data.factor !== null) delete widget.data.factor;
                    }
                }
            } catch (e) {
                console.log('Cannot convert. Invalid JSON in hqoptions: ' + widget.data.hqoptions);
            }
            delete widget.data.hqoptions;
        }
        return widget;
    };

    vis.binds.hqwidgets.changedSensorId = function (widgetID, view, newId, attr, isCss, oldValue) {
        var index = attr.match(/(\d+)$/);
        var bName = (attr === 'oid-slide-handle' + index[1]) ? 'oid-slide-handle-lowbat' : 'oid-slide-sensor-lowbat';
        bName += index[1];
        var fields = {};
        fields[bName] = 'indicator.battery';

        return vis.binds.hqwidgets.changedId (widgetID, view, newId, fields);
    };

    vis.binds.hqwidgets.changedWindowId = function (widgetID, view, newId, attr, isCss, oldValue) {
        if (oldValue && oldValue !== 'nothing_selected') return;
        return vis.binds.hqwidgets.changedId (widgetID, view, newId, {
            'oid-battery':  'indicator.battery',
            'oid-working':  'indicator.working',
            'oid-signal':   'indicator.signal',
            'oid-humidity': 'value.humidity'
        });
    };

    vis.binds.hqwidgets.changedId = function (widgetID, view, newId, fields) {
        var obj = vis.objects[newId];
        var changed = [];
        // If it is real object and SETPOINT
        if (obj && obj.common && obj.type === 'state') {
            var roles = [];

            // If some attributes are not set
            for (var field in fields) {
                if (!fields.hasOwnProperty(field)) continue;
                if (!vis.views[view].widgets[widgetID].data[field]) roles.push(fields[field]);
            }

            if (roles.length) {
                var result = vis.findByRoles(newId, roles);
                if (result) {
                    var name;
                    for (var r in result) {
                        if (!result.hasOwnProperty(r)) continue;
                        name = null;
                        for (field in fields) {
                            if (!fields.hasOwnProperty(field)) continue;
                            if (fields[field] == r) {
                                name = field;
                                break;
                            }
                        }
                        if (name) {
                            changed.push(name);
                            vis.views[view].widgets[widgetID].data[name] = result[r];
                            vis.widgets[widgetID].data[name] = result[r];
                        }
                    }
                }
            }

            if (!vis.views[view].widgets[widgetID].data.descriptionLeft && obj.common.name) {
                vis.views[view].widgets[widgetID].data.descriptionLeft = obj.common.name;
            }
        }

        return changed.length ? changed : null;
    };

    vis.binds.hqwidgets.changedTempId = function (widgetID, view, newId, attr, isCss, oldValue) {
        if (oldValue && oldValue !== 'nothing_selected') return;
        return vis.binds.hqwidgets.changedId (widgetID, view, newId, {
            'oid-battery':  'indicator.battery',
            'oid-working':  'indicator.working',
            'oid-signal':   'indicator.signal',
            'oid-humidity': 'value.humidity'
        });
    };

    vis.binds.hqwidgets.changedButtonId = function (widgetID, view, newId, attr, isCss, oldValue) {
        if (oldValue && oldValue !== 'nothing_selected') return;
        return vis.binds.hqwidgets.changedId (widgetID, view, newId, {
            'oid-battery':  'indicator.battery',
            'oid-working':  'indicator.working',
            'oid-signal':   'indicator.signal'
        });
    };

    vis.binds.hqwidgets.changedLockId = function (widgetID, view, newId, attr, isCss, oldValue) {
        if (oldValue && oldValue !== 'nothing_selected') return;
        return vis.binds.hqwidgets.changedId (widgetID, view, newId, {
            'oid-battery':  'indicator.battery',
            'oid-working':  'indicator.working',
            'oid-signal':   'indicator.signal'
        });
    };

    vis.binds.hqwidgets.changedTemperatureId = function (widgetID, view, newId, attr, isCss, oldValue) {
        if (oldValue && oldValue !== 'nothing_selected') return;
        return vis.binds.hqwidgets.changedId (widgetID, view, newId, {
            'oid-humidity': 'value.humidity'
        });
    };
}
