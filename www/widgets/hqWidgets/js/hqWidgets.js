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
            h = h.substring(1,7)
            rgb = [
                parseInt(h.substring(0,2), 16),
                parseInt(h.substring(2,4), 16),
                parseInt(h.substring(4,6), 16)
            ];

            return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
        };
        var settings = $.extend({
            bgColor:   "#EEEEEE",
            value:     0,
            width:     0,
            thickness: null,
            unit:      null,
            fontSize:  24,
            readOnly:  false,
            color:     '#FFCC00',

            change:    function (value) {
                console.log('change ' + value);
            },
            changing:  function (value) {},
            onshow:    function (isShow) {},
            onhide:    function (isShow) {},
            click:     function () {
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
                            if (newVal !== undefined) {
                                setValue(newVal);
                            }
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
                displayInput:     true,
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
                if (!$knobDiv._mouseEnter && !$knobDiv._mouseDown) {
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
                    console.log('click detected');
                    clearTimeout($knobDiv._pressTimer);
                }
            }

            $knobDiv.css({
                position: 'absolute',
                left:      '-' + ((w - divW)  / 2) + 'px',
                top:       '-' + ((w - divH) / 2) + 'px',
                'z-index': 2,
                cursor:    'pointer',
                'opacity': 0.7
            }).hide().bind('mouseleave',function (e) {
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

}(jQuery));

// Add words for bars
if (vis.editMode) {
    $.extend(true, systemDictionary, {

    });
}

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
    button: {
        changeState: function ($div) {
            var data = $div.data('data');

            if (data.oldValue == data.value) return;

            console.log('New state ' + data.value);

            if (vis.editMode && data.testActive) {
                data.state = 'active';
            } else
            if (data.value == data.min ||
                data.value === null ||
                data.value === '' ||
                data.value === undefined ||
                data.value === 'false'||
                data.value === false) {
                data.state = 'normal';
            } else {
                data.state = 'active';
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
            if (data.wType == 'number') {
                $div.find('.vis-hq-rightinfo').html(((data.value === undefined || data.value === null) ? data.min : data.value) + ((data.unit === undefined) ? '' : data.unit));
            }

        },
        changedId: function (wid, view, newId, attr, isCss) {
            // Try to extract whole information

        },
        draw: function ($div) {
            var data = $div.data('data');
            data.state = data.state || 'normal';
            var radius = $div.css('borderRadius');

            if (!$div.find('.vis-hq-main').length) {
                var text = '';
                if (data.descriptionLeft) {
                    text += '<div class="vis-hq-leftinfo" style="padding-left: 15px; padding-right:50px">' +
                        (data.descriptionLeft || '').replace(/\s/g, '&nbsp;').replace(/\\n/g, '<br>') + '</div>\n';
                }
                if (data.infoRight || data.wType == 'number') {
                    text += '<div class="vis-hq-rightinfo" style="padding-right: 15px;">' +
                        (data.infoRight || '').replace(/\s/g, '&nbsp;').replace(/\\n/g, '<br>') + '</div>\n';
                }
                text += '<div class="vis-hq-main" style="z-index: 1">\n';
                if ($div.height() > $div.width()) {
                    text += '    <div class="vis-hq-middle"><table class="hq-no-space vis-hq-middle-vertical" style="margin-top:' + (-1 * (100 - data.topOffset)) + '%"><tr><td><div class="vis-hq-icon" style="text-align: center;"></div></td></tr>\n';
                    text += '    <tr><td><div class="vis-hq-text-caption" style="text-align: center;"></div></td></tr></table></div>\n';
                } else {
                    text += '    <div class="vis-hq-middle"><table class="hq-no-space vis-hq-middle-vertical" style="margin-top:' + (-1 * data.topOffset) + '%"><tr><td><div class="vis-hq-icon" style="text-align: center;"></div></td>\n';
                    text += '    <td><div class="vis-hq-text-caption" style="text-align: center;"></div></td></tr></table></div>\n';
                }
                text += '</div>';
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

            if (data.iconName || data.iconOn) {
                var img = (data.state == 'normal') ? (data.iconName || ''): (data.iconOn || '');
                $div.find('.vis-hq-icon').html('<img class="vis-hq-icon-img" style="height: ' + data.btIconWidth + 'px; width: auto;" src="' + img + '"/>')
            } else {
                $div.find('.vis-hq-icon').html('');
            }
            vis.binds.hqWidgets.button.changeState($div);

            if (!vis.editMode && data.oid) {
                vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                    data.value = newVal;
                    if (data.wType == 'number') {
                        if (newVal === false || newVal === 'false') data.value = data.min;
                        if (newVal === true  || newVal === 'true')  data.value = data.max;
                    }

                    vis.binds.hqWidgets.button.changeState($div);
                    if (data.wType == 'number') {
                        $main.scala('value', data.value);
                    }

                });

                if (data.wType == 'number') {
                    $main.scala({
                        change: function (value) {
                            data.value = parseFloat(value);
                            if (data.digits !== null) data.value = data.value.toFixed(data.digits);
                            if (data.is_comma) data.value = data.value.toString().replace('.', ',');
                            data.value = parseFloat(data.value);
                            vis.binds.hqWidgets.button.changeState($div);
                            vis.setValue(data.oid, data.value);
                        },
                        changing: function (value) {
                            data.value = value;
                            if (data.digits !== null) data.value = data.value.toFixed(data.digits);
                            if (data.is_comma) data.value = data.value.toString().replace('.', ',');
                            data.value = parseFloat(data.value);
                            vis.binds.hqWidgets.button.changeState($div);
                        },
                        click: function (val) {
                            if (val - data.min > ((data.max - data.min) / 2)) {
                                val = data.min;
                            } else {
                                val = data.max;
                            }
                            return val;
                        }
                    });

                    $main.click(function () {
                        /*if (data.value - data.min > ((data.max - data.min) / 2)) {
                            data.value = data.min;
                        } else {
                            data.value = data.max;
                        }
                        $main.scala('value', data.value);
                        vis.binds.hqWidgets.button.changeState($div);
                        vis.setValue(data.oid, data.value);*/
                    });
                } else {
                    $main.click(function () {
                        data.value = (data.state == 'normal') ? data.max : data.min
                        vis.binds.hqWidgets.button.changeState($div);
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
            data.min = (data.min !== undefined) ? parseFloat(data.min) : 0;
            data.max = (data.max !== undefined) ? parseFloat(data.max) : 100;
            data.digits = (!data.digits && data.digits !== 0) ? parseInt(data.digits, 10) : null;

            $div.data('data',  data);
            $div.data('style', style);

            data.value = vis.states.attr(data.oid + '.val');

            vis.binds.hqWidgets.button.draw($div);
        }
    }
};