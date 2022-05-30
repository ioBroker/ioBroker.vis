function genListTempHumid(data) {
    let divList = [];
    startSkeleton(divList,data);
    genIcon(divList,data.attr('cardIconClosed'));
    genTitleContainer(divList,data);
    genDoubleValue(divList,data);
    endSkeleton(divList);
    return  {widget: divList.join('')};
}