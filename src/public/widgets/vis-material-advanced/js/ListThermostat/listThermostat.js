function genListThermostat(data) {
    let divList = [];
    startSkeleton(divList,data);
    genIcon(divList,data.attr('cardIcon'));
    genTitleContainer(divList,data);
    // genDoubleValue(divList,data);
    // endSkeleton(divList);
    return  {widget: divList.join('')};
}