function genListLightKelvin(data) {
    let divList = [];
    startSkeleton(divList,data);
    genIcon(divList,data.attr('cardIcon-warmwhite'));
    genTitleContainer(divList,data);
    //genSliderValue(divList,data);
    //endSkeleton(divList);
    return  {widget: divList.join('')};
}