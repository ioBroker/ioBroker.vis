function genListNumber(data) {
    let divList = [];
    startSkeleton(divList,data);
    //genIcon(divList,'widgets/vis-material-advanced/img/123.png');
    genTitleContainer(divList,data);
    genSingleValue(divList,data);
    endSkeleton(divList);
    return  {widget: divList.join('')};
}