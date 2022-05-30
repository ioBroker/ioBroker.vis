
function genListDiv(data) {
    let divList = [];
    genIcon(divList,data.attr('cardIconClosed'));
    genTitleContainer(divList,data);
    genSingleValue(divList,data);
    return  {widget: divList.join('')};
}
