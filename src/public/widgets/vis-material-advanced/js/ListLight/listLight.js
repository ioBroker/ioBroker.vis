function genListLight(data) {
    let divList = [];
    startSkeleton(divList,data);
    genIcon(divList,data.attr('cardIconOn'));
    genTitleContainer(divList,data);
    genButtonValue(divList,data);
    endSkeleton(divList);
    return  {widget: divList.join('')};
}