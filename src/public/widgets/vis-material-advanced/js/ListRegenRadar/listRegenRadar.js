function genListRegenRadar(data) {
    let divList = [];
    startSkeleton(divList,data);
    //genIcon(divList,data.attr('cardIcon'));
    //genTitleContainer(divList,data);
    genSingleImageValue(divList,data);
    endSkeleton(divList);
    var html = divList.join('');
    return  {widget: divList.join('')};
}