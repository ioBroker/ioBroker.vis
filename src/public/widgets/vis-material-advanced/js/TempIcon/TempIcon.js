function genTemperatureIcon(data) {
    let divList = [];
    //startSkeleton(divList,data);
    genJustIcon(divList,data.attr('cardIcon'));
    //genTitleContainer(divList,data);
    //genSingleValue(divList,data);
    //endSkeleton(divList);
    return  {widget: divList.join('')};
}