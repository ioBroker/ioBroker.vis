var visConfig = {
    "widgetSets": [
        "basic",
        "hqwidgets",
        "jqplot",
        {
            "name": "jqui",
            "depends": [
                "basic"
            ]
        },
        "map",
        {
            "name": "material",
            "depends": []
        },
        {
            "name": "metro",
            "depends": [
                "jqui-mfd",
                "basic"
            ]
        },
        "swipe",
        "tabs",
        "template"
    ]
};
if (typeof exports !== 'undefined') {
    exports.config = visConfig;
} else {
    visConfig.language = window.navigator.userLanguage || window.navigator.language;
}
