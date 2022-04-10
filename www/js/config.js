var visConfig = {license: false,
    "widgetSets": [
        {
            "name": "bars",
            "depends": []
        },
        "basic",
        "consumption",
        "dwd",
        "echarts",
        "eventlist",
        {
            "name": "google-fonts",
            "always": true
        },
        "hqwidgets",
        "jqplot",
        {
            "name": "jqui",
            "depends": [
                "basic"
            ]
        },
        {
            "name": "metro",
            "depends": [
                "jqui-mfd",
                "basic"
            ]
        },
        "spotify-premium",
        "swipe",
        "tabs"
    ]
};
if (typeof exports !== 'undefined') {
    exports.config = visConfig;
} else {
    visConfig.language = window.navigator.userLanguage || window.navigator.language;
}
