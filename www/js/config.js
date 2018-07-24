var visConfig = {
    "widgetSets": [
        "basic",
        "chromecast",
        "dwd",
        "hqwidgets",
        "jqplot",
        {
            "name": "jqui-mfd",
            "depends": [
                "basic",
                "jqui"
            ]
        },
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
        "mihome-vacuum",
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
