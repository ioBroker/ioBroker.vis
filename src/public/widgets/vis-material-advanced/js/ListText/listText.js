function genListText(data) {
    let divList = [];
    startSkeleton(divList,data);
    //genIcon(divList,'widgets/vis-material-advanced/img/abc.png');
 
    genTitleContainer(divList,data);
    genSingleValue(divList,data);
    endSkeleton(divList);
    return  {widget: divList.join('')};
}