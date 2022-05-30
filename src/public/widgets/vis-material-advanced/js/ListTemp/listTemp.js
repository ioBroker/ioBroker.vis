function genListTemperature(data) {
    let divList = [];
    startSkeleton(divList,data);
    genIcon(divList,data.attr('cardIcon'));
    genTitleContainer(divList,data);
    genSingleValue(divList,data);
    endSkeleton(divList);
    return  {widget: divList.join('')};
}