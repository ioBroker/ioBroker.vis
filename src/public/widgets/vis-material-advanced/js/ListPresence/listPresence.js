function genListPresence(data) {
    let divList = [];
    startSkeleton(divList,data);
    genIcon(divList,data.attr('iconMotion'));
    genTitleContainer(divList,data);
    genSingleValue(divList,data);
    endSkeleton(divList);
    return  {widget: divList.join('')};
}