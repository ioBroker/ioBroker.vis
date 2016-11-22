var visConfig = {
    "widgetSets": [
        {
            "name": "bars",
            "depends": []
        },
        "basic",
        "chromecast",
        "colorpicker",
        "canvas-gauges",
        "dwd",
        {
            "name": "google-fonts",
            "always": true
        },
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
        {
            "name": "justgage",
            "depends": []
        },
        {
            "name": "keyboard",
            "depends": []
        },
        {
            "name": "lcars",
            "depends": [
                "basic"
            ]
        },
        "map",
        {
            "name": "metro",
            "depends": [
                "jqui-mfd",
                "basic"
            ]
        },
        "plumb",
        "rgraph",
        "starline",
        "tabs",
        "timeandweather"
    ]
};
if (typeof exports != 'undefined') {
    exports.config = visConfig;
} else {
    visConfig.language = window.navigator.userLanguage || window.navigator.language;
}
