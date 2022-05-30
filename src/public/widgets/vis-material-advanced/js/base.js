
function hideIconInWidget(data, $div) {

    if (data.attr('showIcon') && data.attr('showTitle')) {
        // show Icon AND show Title Container
        $div.find('.vma_picture').removeAttr('hidden');
        $div.find('.vma_title_subtitle_id').removeAttr('hidden');

        $div.find('.vma_title_subtitle_id').addClass('vma_title_subtitle_container');
        $div.find('.vma_title_subtitle_id').removeClass('vma_title_subtitle_container_without_icon');

        $div.find('.vma_value_id').removeClass('vma_value_container_without_icon');
        $div.find('.vma_value_id').removeClass('vma_value_container_without_icon_and_title');
        $div.find('.vma_value_id').removeClass('vma_value_container_without_title');
        $div.find('.vma_value_id').addClass('vma_value_container');
    }
    else if (!data.attr('showIcon') && data.attr('showTitle')) {
        // hide Icon AND show Title Container
        $div.find('.vma_picture').attr('hidden', true);
        $div.find('.vma_title_subtitle_id').removeAttr('hidden');

        $div.find('.vma_title_subtitle_id').removeClass('vma_title_subtitle_container');
        $div.find('.vma_title_subtitle_id').addClass('vma_title_subtitle_container_without_icon');

        $div.find('.vma_value_id').addClass('vma_value_container_without_icon');
        $div.find('.vma_value_id').removeClass('vma_value_container_without_icon_and_title');
        $div.find('.vma_value_id').removeClass('vma_value_container_without_title');
        $div.find('.vma_value_id').removeClass('vma_value_container');
    }
    else if (data.attr('showIcon') && !data.attr('showTitle')) {
        // show Icon AND hide Title Container
        $div.find('.vma_picture').removeAttr('hidden');
        $div.find('.vma_title_subtitle_id').attr('hidden', true);

        $div.find('.vma_title_subtitle_id').addClass('vma_hidden');
        $div.find('.vma_title_subtitle_id').removeClass('vma_title_subtitle_container_without_icon');


        $div.find('.vma_value_id').removeClass('vma_value_container_without_icon');
        $div.find('.vma_value_id').removeClass('vma_value_container_without_icon_and_title');
        $div.find('.vma_value_id').addClass('vma_value_container_without_title');
        $div.find('.vma_value_id').removeClass('vma_value_container');
    }
    else if (!data.attr('showIcon') && !data.attr('showTitle')) {
        // hide Icon AND hide Title Container
        $div.find('.vma_picture').attr('hidden', true);
        $div.find('.vma_title_subtitle_id').attr('hidden', true);

        $div.find('.vma_title_subtitle_id').addClass('vma_hidden');
        $div.find('.vma_title_subtitle_id').removeClass('vma_title_subtitle_container_without_icon');


        $div.find('.vma_value_id').removeClass('vma_value_container_without_icon');
        $div.find('.vma_value_id').addClass('vma_value_container_without_icon_and_title');
        $div.find('.vma_value_id').removeClass('vma_value_container_without_title');
        $div.find('.vma_value_id').removeClass('vma_value_container');
    }

    var height = setHeight(data, $div);
    //$div.find('.vma_outer_div').css('min-height', height + 'px');
    $div.css('min-height', height + 'px');
    if (parseInt($div.css('height')) < height) {
        $div.css('height', height + "px");
    }
    // $div.find('.vma_inner_container_div').css('min-height', height + 'px');
}

function grayOutWhenInactive(data, $div) {
    var curTime = new Date().getTime();
    var lcTime = vis.states[data.oid + '.lc'];
    var seconds = (curTime - lcTime) / 1000;
    if (seconds > 86400) {
        $div.find('.vma_overlay').css('opacity', '0.5');
    }
}

function setBorderAndOpacColor(data,border, $div, original_class) {
    if (border) {
        $div.find('.vma_inner_container_div').css('border', '1px solid '+ data.attr('borderColor'));
    }
    if ( data.attr('boxShadow'))
    {
        var size = data.attr('shadowWidth');
        $div.find('.vma_inner_container_div').css('box-shadow', size+'px '+ size +'px '+ size +'px 0px rgba(0,0,0,1)') ;
    }

    $div.find('.vma_overlay').css('background-color', original_class);
}

function getPostFix(val_type) {
    var type;
    switch (val_type) {
        case 'temp':
        case 'Celsius': {
            type = ' °C';
            break;
        }
        case 'Fahrenheit': {
            type = ' °F';
            break;
        }
        case 'humid':
        case 'valve':
        case 'percent': {
            type = ' %';
            break;
        }
        case 'pressure': {
            type = ' hPa';
            break;
        }
        default: {
            type = val_type;
        }
    }
    return type;
}

function setRadius(data, $div) {
    const radius = data.attr('borderRadius');
    const splittedRoundedValue = data.attr('useOverallRoundedValues');
    if ( splittedRoundedValue ) {
    $div.find('.vma_overlay').css('border-radius', radius + "px");
    $div.find('.vma_outer_div').css('border-radius', radius + "px");
    $div.find('.vma_inner_container_div').css('border-radius', radius + "px");
    }
    else {
        setRadiusCorner($div,'top-left',data.attr("roundLeftUp"));
        setRadiusCorner($div,'bottom-left',data.attr("roundLeftBottom"));
        setRadiusCorner($div,'top-right',data.attr("roundRightUp"));
        setRadiusCorner($div,'bottom-right',data.attr("roundRightBottom"));
    }
    

    
    return true;
}

function setRadiusCorner($div,position, radius) {
    $div.find('.vma_overlay').css('border-'+position+'-radius', radius + "px");
    $div.find('.vma_outer_div').css('border-'+position+'-radius', radius + "px");
    $div.find('.vma_inner_container_div').css('border-'+position+'-radius', radius + "px");
}

function setPositionSingle($this, data, $div) {
    //console.log($div.find('.vma_outer_div').css('height'));
    var height = $this.innerHeight();
    const value_height = $div.find('.vma_value').height();
    const empty_space = height - value_height;
    var top = 0;

    posIconHeight($div, data.centerIcon);
    posTitleHeight($div, data.valueVertical);
    posValueHeight($div, data.valueVertical);
    
    setRadius(data, $div);
    return true;
}

function setPosition($this, data, $div) {
    var height = $this.innerHeight();

    const value_height2 = $div.find('.vma_value2_1').outerHeight(true) + $div.find('.vma_value2_2').outerHeight(true);

    const empty_space = height - value_height2;

    var top = 0;

    if (empty_space >= 0) {
        switch (data.attr('valueVertical')) {
            case 'top': {
                top = 4;
                break;
            }
            case 'center': {
                top = empty_space / 2;
                break;
            }
            case 'bottom': {
                top = empty_space - 4;
                break;
            }
        }
    }
    $div.find('.vma_value2_1').css('padding-top', top + "px");
    setRadius(data, $div);
    return true;
}

function setHeight(data, $div) {
    var max_height = 0;


    var title_line_height = getTitleHeight($div);
    var subtitle_line_height = getSubTitleHeight($div);
    var value_line_height = getValueHeight($div, value_line_height);

    if (data.showIcon) {
        max_height = setMinHeight(max_height, 48);
    }

    if (data.showTitle) {
        if (data.onlyTitle) {
            max_height = setMinHeight(max_height, title_line_height);
        }
        else {
            max_height = setMinHeight(max_height, title_line_height + subtitle_line_height);
        }
    }

    max_height = setMinHeight(max_height, value_line_height);

    return max_height;
}

function getValueHeight($div) {
    if ($div.find('.vma_value2_1').length) {
        value_line_height = parseInt($div.find('.vma_value2_1').css('font-size')) * 1.2 + parseInt($div.find('.vma_value2_2').css('font-size')) * 1.2;
    }
    else {
        value_line_height = parseInt($div.find('.vma_value').css('font-size')) * 1.2;
    }
    return value_line_height;
}

function getSubTitleHeight($div) {
    var subheight = 0;
    if ($div.find('.vma_subtitle').length) {
        subheight = parseInt($div.find('.vma_subtitle').css('font-size')) * 1.2;
        subheight = parseInt($div.find('.vma_subtitle').outerHeight()) ;
    }

    return subheight;
}

function getTitleHeight($div) {
    var height = 0;
    if ($div.find('.vma_title').length) {
        height = parseInt($div.find('.vma_title').css('font-size')) * 1.2;
        height = parseInt($div.find('.vma_title').outerHeight());
    }
    return height;
}
function getCompleteTitleHeight($div) {
    var titleHeight = getTitleHeight($div);
    var subheight   = getSubTitleHeight($div);
    return titleHeight + subheight; 
}

function getIconHeight($div) {
    var height =  parseInt($div.find('.vma_picture').css('height'));
    return height;
}

function getDivHeight($div) {
    var height = parseInt($div.css('height'));
    return height;
}

function posIconHeight($div, pos) {
    var iconHeight = getIconHeight($div);
    var divHeight = getDivHeight($div);
    var emptySpace = divHeight - iconHeight;

    if (!pos) {
        $div.find('.vma_picture').css('padding-top', '2px');

    }
    else {
        $div.find('.vma_picture').css('padding-top', emptySpace / 2 + 1 + 'px');

    }

}

function posTitleHeight($div, pos) {
    var titleHeight = getCompleteTitleHeight($div);
    var divHeight = getDivHeight($div);
    var emptySpace = divHeight - titleHeight;

    switch (pos) {
        case 'top': {
            $div.find('.vma_title_subtitle_container').css('padding-top', '2px');
            $div.find('.vma_title_subtitle_container_without_icon').css('padding-top', '2px');
            break;
        }
        case 'middle':
        case 'center': {
            $div.find('.vma_title_subtitle_container').css('padding-top', emptySpace / 2 + 1 + 'px');
            $div.find('.vma_title_subtitle_container_without_icon').css('padding-top', emptySpace / 2 + 1 + 'px');
            break;
        }
        case 'bottom': {
            $div.find('.vma_title_subtitle_container').css('padding-top', emptySpace - 2 + 'px');
            $div.find('.vma_title_subtitle_container_without_icon').css('padding-top', emptySpace - 2 + 'px');
            break;
        }
        default: {
            console.log('Something went wrong while processing : ' + pos);
            break;
        }
    }

}


function posValueHeight($div, pos) {
    var valueHeight = getValueHeight($div);
    var divHeight = getDivHeight($div);
    var emptySpace = divHeight - valueHeight;

    switch (pos) {
        case 'top': {
            $div.find('.vma_value_container').css('padding-top', '2px');
            break;
        }
        case 'middle':
        case 'center': {
            $div.find('.vma_value_container').css('padding-top', emptySpace / 2 + 1 + 'px');
            break;
        }
        case 'bottom': {
            $div.find('.vma_value_container').css('padding-top', emptySpace - 2 + 'px');
            break;
        }
        default: {
            console.log('Something went wrong while processing : ' + pos);
            break;
        }
    }

}

function setMinHeight(old, new_h) {
    if (new_h > old) {
        return new_h;
    }
    return old;
}
