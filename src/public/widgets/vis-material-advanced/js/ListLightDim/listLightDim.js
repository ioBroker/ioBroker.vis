function genListLightDim(data) {
    let divList = [];
    startSkeleton(divList,data);
    genIcon(divList,data.attr('cardIconOn'));
    genTitleContainer(divList,data);
    //genSliderValue(divList,data);
    //endSkeleton(divList);
    return  {widget: divList.join('')};
}