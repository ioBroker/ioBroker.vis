var visConfig = {
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
        {
            "name": "powertrust-fonts",
            "always": true
        },
        "spotify-premium",
        "swipe",
        "tabs",
        "timeandweather",
        "vis-material-advanced"
    ]
};
if (typeof exports !== 'undefined') {
    exports.config = visConfig;
} else {
    visConfig.language = window.navigator.userLanguage || window.navigator.language;
}
