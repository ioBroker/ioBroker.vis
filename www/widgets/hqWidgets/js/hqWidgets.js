"use strict";


(function ( $ ) {
    $.fn.scala = function (options, arg) {
        if (typeof options == 'string') {
            if (options == 'value') {
                return this.each(function () {
                    var $this = $(this);
                    $this.find('.scalaInput').val(arg);
                });
            }
            return;
        }

        var settings = $.extend({
            bgColor:   "#EEEEEE",
            value:     0,
            width:     0,
            thickness: null,
            unit:      null,
            fontSize:  24,
            readOnly:  false,
            color:     '#FFCE00',

            change:    function (value) {},
            changing:  function (value) {},
            onshow:    function (isShow) {},
            onhide:    function (isShow) {}
        }, options);

        return this.each(function () {
            // Do something to each element here.
            var $this = $(this);
            if ($this.data('scaled')) return;
            $this.data('scaled', true);
            $this.wrapInner('<div class="scalaWrapped"></div>');
            var divW = $this.width();

            // calculate thickness
            if (!settings.width) settings.width = divW + 30;
            if (!settings.thickness) settings.thickness = 1 - (divW / settings.width);

            $this.prepend('<input type="text" value="' + settings.value + '" class="scalaInput" data-width="' + settings.width + '" data-thickness="' + settings.thickness + '"/>');

            var $scalaInput   = $this.find('.scalaInput');
            var $scalaWrapped = $this.find('.scalaWrapped');

            var $knobDiv = $scalaInput.knob({
                release: function () {
                    $knobDiv._mouseDown = false;

                    if (!$knobDiv._mouseEnter && !$knobDiv._mouseDown) {
                        $knobDiv.hide();
                        $scalaWrapped.show();

                        if (settings.change) settings.change($scalaInput.val());
                    }
                },
                cancel: function () {
                    $knobDiv._mouseDown = false;

                    if (!$knobDiv._mouseEnter && !$knobDiv._mouseDown) {
                        $knobDiv.hide();
                        $scalaWrapped.show();
                    }
                },
                change: function (value) {
                    if (settings.changing) settings.changing(value);
                },
                format: function (v) {
                    if (settings.unit) v = v + settings.unit;
                    return v;
                },
                displayPrevious : true,
                displayInput: true,
                bgColor:      settings.bgColor,
                readOnly:     settings.readOnly,
                fgcolor:      settings.color,
                inputColor:   settings.color
            });

            var w = $knobDiv.width();
            $this.data('$knobDiv', $knobDiv);

            $knobDiv.css({
                position: 'absolute',
                left: '-' + ((w - divW)  / 2) + 'px',
                top:  '-' + ((w - $this.height()) / 2) + 'px',
                'z-index': 2,
                cursor: 'hand'
            })
                .hide()
                .bind('mouseleave',function () {
                    $knobDiv._mouseEnter = false;
                    if (!$knobDiv._mouseEnter && !$knobDiv._mouseDown) {
                        $knobDiv.hide();
                        $scalaWrapped.show();
                    }
                    //console.log('mouseleave (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown);
                })
                .bind('mousedown', function () {
                    $knobDiv._mouseDown = true;
                    //console.log('mousedown (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown);
                }).bind('mouseup', function () {
                    $knobDiv._mouseDown = false;
                    //console.log('mousedown (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown);
                })
                .bind('mouseenter', function () {
                    $knobDiv._mouseEnter = true;
                    $knobDiv.show();
                    //console.log('mouseenter (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown);
                }).bind('touchend', function (e) {
                    $knobDiv._mouseEnter = false;

                    if (!$knobDiv._mouseEnter && !$knobDiv._mouseDown) {
                        $knobDiv.hide();
                        $scalaWrapped.show();
                    }
                    //console.log('touchend (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown);
                });

            $this.bind('mouseenter', function () {
                $knobDiv._mouseEnter = true;
                $knobDiv.show();
                //console.log('mouseenter (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown);
            }).bind('touchstart', function (e) {
                if (e.simulated) {
                    e.preventDefault();
                    return;
                }
                $knobDiv.show();
                //$scalaWrapped.hide();
                var event = $.Event(e.type, {simulated: true, originalEvent: {touches: [{pageX: e.originalEvent.touches[e.originalEvent.touches.length - 1].pageX, pageY: e.originalEvent.touches[e.originalEvent.touches.length - 1].pageY}]}} );
                $knobDiv.find('canvas').trigger(event);
                e.preventDefault();
                //console.log('touchstart (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown);
            }).bind('mousedown', function (e) {
                if (e.simulated) {
                    e.preventDefault();
                    return;
                }
                $knobDiv.show();
                //$scalaWrapped.hide();
                var event = $.Event(e.type, {simulated: true, pageX: e.pageX, pageY: e.pageY});
                $knobDiv.find('canvas').trigger(event);
                e.preventDefault();
                //console.log('touchstart (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown);
            });


            $scalaInput.prop('disabled', true)
                .bind('focusout', function () {
                    $knobDiv._mouseEnter = false;

                    if (!$knobDiv._mouseEnter && !$knobDiv._mouseDown) {
                        $knobDiv.hide();
                        $scalaWrapped.show();
                    }
                    console.log('focusout (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown);
                })
                .bind('focusin', function () {
                    $knobDiv._mouseDown = false;

                    if (!$knobDiv._mouseEnter && !$knobDiv._mouseDown) {
                        $knobDiv.hide();
                        $scalaWrapped.show();
                    }
                    console.log('focusin (enter: ' + $knobDiv._mouseEnter + ', down: ' + $knobDiv._mouseDown);
                })
                .css({
                    'font-size': settings.fontSize,
                    cursor: 'hand',
                    '-webkit-touch-callout': 'none',
                    '-webkit-user-select': 'none',
                    '-khtml-user-select': 'none',
                    '-moz-user-select': 'none',
                    '-ms-user-select': 'none',
                    'user-select': 'none'
                });
        });
    };

}( jQuery ));

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

            console.log(data.value);

            if (vis.editMode && data.testActive) {
                data.state = 'active';
            } else
            if (data.value === data.min ||
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
                if (data.infoRight) {
                    text += '<div class="vis-hq-rightinfo" style="padding-right: 15px;">' +
                        (data.infoRight || '').replace(/\s/g, '&nbsp;').replace(/\\n/g, '<br>') + '</div>\n';
                }
                text += '<div class="vis-hq-main" style="z-index: 1">\n';
                if ($div.height() > $div.width()) {
                    text += '    <div class="vis-hq-middle"><table class="hq-no-space vis-hq-middle-vertical" style="margin-top:-' + (100 - data.topOffset) + '%"><tr><td><div class="vis-hq-icon" style="text-align: center;"></div></td></tr>\n';
                    text += '    <tr><td><div class="vis-hq-text-caption" style="text-align: center;"></div></td></tr></table></div>\n';
                } else {
                    text += '    <div class="vis-hq-middle"><table class="hq-no-space vis-hq-middle-vertical" style="margin-top:-' + data.topOffset + '%"><tr><td><div class="vis-hq-icon" style="text-align: center;"></div></td>\n';
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
                        if (newVal === true || newVal === 'true')   data.value = data.max;
                    }

                    vis.binds.hqWidgets.button.changeState($div);
                    if (data.wType == 'number') {
                        $main.scala('value', data.value);
                    }

                });

                if (data.wType == 'number') {
                    $main.scala({
                        change: function (value) {
                            data.value = value;
                            vis.binds.hqWidgets.button.changeState($div);
                            vis.setValue(data.oid, value);
                        },
                        changing: function (value) {
                            data.value = value;
                            vis.binds.hqWidgets.button.changeState($div);
                        }
                    });
                    $main.click(function () {
                        if (data.value - data.min > ((data.max - data.min) / 2)) {
                            data.value = data.min;
                        } else {
                            data.value = data.max;
                        }
                        $main.scala('value', data.value);
                        vis.binds.hqWidgets.button.changeState($div);
                        vis.setValue(data.oid, data.value);
                    });
                } else {
                    $main.click(function () {
                        data.value = (data.state == 'normal') ? data.max : data.min
                        vis.binds.hqWidgets.button.changeState($div);
                        vis.setValue(data.oid, (data.state == 'normal'));
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

            var options = JSON.parse(JSON.stringify(data));
            $div.data('data',  data);
            $div.data('style', style);

            data.value = vis.states.attr(data.oid + '.val');

            vis.binds.hqWidgets.button.draw($div);
        }
    }
};