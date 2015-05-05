"use strict";

// Add words for bars
if (vis.editMode) {
    $.extend(true, systemDictionary, {

    });
}

// widget can has following parts:
// left info (description)
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
    drawRight: function ($div) {

    },
    drawLeft: function ($div) {

    },
    changeState: function ($div) {
        var data = $div.data('data');

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
        console.log(wid + ' ' + attr);
    },
    drawButton: function ($div) {
        var data = $div.data('data');
        data.state = data.state || 'normal';
        var radius = $div.css('borderRadius');

        if (!$div.find('.vis-hq-main').length) {
            var text = '';
            if (data.description) {
                text += '<div class="vis-hq-leftinfo" style="padding-left: 15px; padding-right:50px">' +
                    (data.description || '') + '</div>\n';
            }
            text += '<div class="vis-hq-rightinfo" style="position: absolute; z-index: 0"></div>\n';
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

        if (data.iconName || data.iconOn) {
            var img = (data.state == 'normal') ? (data.iconName || ''): (data.iconOn || '');
            $div.find('.vis-hq-icon').html('<img class="vis-hq-icon-img" style="height: ' + data.btIconWidth + 'px; width: auto;" src="' + img + '"/>')
        } else {
            $div.find('.vis-hq-icon').html('');
        }
        vis.binds.hqWidgets.changeState($div);
    },
    init: function (wid, view, wType, data, style) {
        var $div = $('#' + wid).addClass('hq-button-base');
        if (!$div.length) {
            setTimeout(function () {
                vis.binds.hqWidgets.init(wid, view, wType, data, style);
            }, 100);
            return;
        } else {
            var timer = $('#' + wid).data('timer');
            if (!timer) {
                $('#' + wid).data('timer', function () {
                    vis.binds.hqWidgets.init(wid, view, wType, data, style);
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

        var options = JSON.parse(JSON.stringify(data));
        $div.data('data',  data);
        $div.data('style', style);

        data.state = vis.states.attr(data.oid + '.val');

        if ((vis.editMode && !data.testActive) ||
            data.state === '0' ||
            data.state === 0 ||
            data.state === null ||
            data.state === '' ||
            data.state === undefined ||
            data.state === 'false'||
            data.state === false) {
            data.state = 'normal';
        } else {
            data.state = 'active';
        }

        if (wType == 'button') {
            vis.binds.hqWidgets.drawButton($div);
        }
    }
};