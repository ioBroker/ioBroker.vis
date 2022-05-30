function genListVolume(data) {
    let divList = [];
    startSkeleton(divList,data);
    genIcon(divList,data.attr('widgets/vis-material-advanced/img/fts_shutter_100.png'));
    genTitleContainer(divList,data);
    //genSliderValue(divList,data);
    //endSkeleton(divList);
    return  {widget: divList.join('')};
}