
function genIcon(divList, icon) {

    divList.push('<div class="vma_picture"> ');
    divList.push('<img class="vma_icon" src="' + icon + '"></div>');

}

function genJustIcon(divList, icon) {

    divList.push('<div class=" vis-widget-body vma_icon2"> ');
    divList.push('<img class="just-icon" src="' + icon + '"></div>');
    divList.push('</div>');

}

function genTitleContainer(divList, data) {

    divList.push('<div class="vma_title_subtitle_container vma_title_subtitle_id" style="color:' + data.TextColor + '; ">');
    if (data.onlyTitle) {
        divList.push('<div  class="vma_title vma_only_title" style="font-size: ' + data.titleSize + ';">');
    }
    else {
        divList.push('<div  class="vma_title" style="font-size: ' + data.titleSize + ';">');
    }
    divList.push(data.title);

    if (data.onlyTitle) {
        divList.push('</div>');

        divList.push('</div>');
    }
    else {
        divList.push('</div><div  class="vma_subtitle " style=" color: ' + data.TextColor + ';font-size: ' + data.subtitleSize + '; ">');
        if (data.valueAsSubtitle == true ) {
            divList.push("VALUE"+ '</div></div>');
        }
        else {
            if (typeof data.subtitle == 'undefined') {
                divList.push('</div></div>');
            }
            else {
                divList.push(data.subtitle + '</div></div>');
            }
        }
    }
    return { widget: divList.join('') }
}

function genSingleTitleContainer(divList, data) {

    divList.push('<div class="vma_title_subtitle_container vma_title_subtitle_id" style="color:' + data.TextColor + '; ">');
    divList.push('<div  class="vma_title vma_only_title" style="font-size: ' + data.titleSize + ';">');
    divList.push(data.title);
    divList.push('</div>');

    divList.push('</div>');

    return { widget: divList.join('') }
}


function genSingleValue(divList, data) {
    divList.push('<div  class="vma_value_container vma_value_id">  ');
    divList.push('<div  class="vma_value"   style="color:  ' + data.TextColor + '; text-align:' + data.attr('valueAlign') + '; vertical-align:' + data.attr('valueVertical') + ';font-size:' + data.valueSize + ';" >');
    divList.push('</div></div>');
    //divList.push('<div class="vma_overlay ms-button-op vis-widget-body" ></div>');
    //return {widget: divList.join('')}
}


function genSingleImageValue(divList, data) {
    divList.push('<div  class="vma_value_container vma_value_id">  ');
    divList.push('<div  class="vma_value"   style="color:  ' + data.TextColor + '; text-align:' + data.attr('valueAlign') + '; vertical-align:' + data.attr('valueVertical') + ';font-size:' + data.valueSize + ';" >');
    if (typeof data.oid == "undefined") {
        divList.push('<img src="/vis/widgets/vis-material-advanced/img/123.png">');
    }
    else {
        divList.push('<iframe src="' + data.oid + '" width="100%" height="100%">');
    }
    divList.push('</div></div>');
    divList.push('<div class="vma_overlay ms-button-op vis-widget-body" ></div>');
    var html = divList.join('');
    //return {widget: divList.join('')}
}

function genDoubleValue(divList, data) {
    divList.push('<div  class="vma_value_container vma_value_id">  ');
    divList.push('<div  class="vma_value2_1"   style="color:  ' + data.TextColor + '; text-align:' + data.attr('valueAlign') + '; vertical-align:' + data.attr('valueVertical') + ';font-size:' + data.valueSize + ';" >');
    divList.push('</div>');
    divList.push('<div  class="vma_value2_2"   style="color:  ' + data.TextColor + '; text-align:' + data.attr('valueAlign') + '; vertical-align:' + data.attr('valueVertical') + ';font-size:' + data.valueSize + ';" >');
    divList.push('</div></div>');
    divList.push('<div class="vma_overlay ms-button-op vis-widget-body" ></div>');
    //return {widget: divList.join('')}
}

function genSliderValue(divList, data) {
    divList.push('<div  class="vma_value_container vma_value_id">  ');
    divList.push('<div  class="vma_value"   style="color:  ' + data.TextColor + '; text-align:' + data.attr('valueAlign') + '; vertical-align:' + data.attr('valueVertical') + ';font-size:' + data.valueSize + ';" >');
    if (!data.readOnly) {
        divList.push('<div class="sliderJQUI" id="' + data.attr('wid') + '_slider" ');
        divList.push(' data-oid="' + data.attr('oid') + '" data-oid2="' + data.attr('oid-2') + '" data-oid-working="' + data.attr('oid-working') + '"  , ');
        divList.push('data-oid2-working="' + data.attr('oid-2-working') + '"');
        divList.push(vis.binds.jqueryui.slider({ min: 0, max: 100, step: 1, inverted: false }) + '/>');

        divList.push('</div><label for="' + data.attr('wid') + '_checkbox"><label>');
    }
    divList.push('</div></div>');
    divList.push('<div class="vma_overlay ms-button-op vis-widget-body" ></div>');
}

function genButtonValue(divList, data) {
    divList.push('<div  class="vma_value_container vma_value_id">  ');
    divList.push('<div  class="vma_value"   style="color:  ' + data.TextColor + '; text-align:' + data.attr('valueAlign') + '; vertical-align:' + data.attr('valueVertical') + ';text-size:' + data.valueSize + ';" >');
    if (!data.readOnly) {
        divList.push('<label class="vma-switch">');
        divList.push(' <input type="checkbox" checked="" name="' + data.attr('wid') + '_checkbox" id="' + data.attr('wid') + '_checkbox"  data-oid="' + data.attr('oid') + '">  ');
        divList.push('<span class="vma-slider-switch round"></span>');
    }
    divList.push('</div></div>');
    // divList.push('<div class="vma_overlay ms-button-op vis-widget-body" ></div>');
}

function startSkeleton(divList, data) {
    // divList.push('<div class="vis-widget susi mdw-list vma_outer_div '+ data.attr( 'class') +'" id="'+ data.attr('wid') +'" ');
    // divList.push('style="background-color:'+ data.attr('widgetBackground') +';"></div>');
    divList.push('<div class="vis-widget-body vma_inner_container_div" style="background-color: ' + data.attr('widgetBackground') + ';" > ');
}

function endSkeleton(divList) {
    divList.push('</div>');
    divList.push('<div class="vma_overlay ms-button-op vis-widget-body" ></div>');
}
function endSkeletonSlider() {
    divList.push('<div class="vma_overlay ms-button-op vis-widget-body" ></div>');
    divList.push('</div>');
}
/*filter: invert(1);
transform: scaleX(1) rotateZ(0deg);
animation: blink 0s infinite;
}*/