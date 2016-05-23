var visConfig = {
    "widgetSets": [
        "bars",
        "basic",
        "colorpicker",
        {
            "name": "communicate",
            "depends": []
        },
        "dev",
        {
            "name": "fancyswitch",
            "depends": [
                "basic"
            ]
        },
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
        "knob",
        {
            "name": "lcars",
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
        "plumb",
        "RGraph",
        "special",
        "swipe",
        "tabs",
        "timeandweather",
        "vkb",
        "weather-adapter",
        "weather"
    ]
};
if (typeof exports != 'undefined') {
    exports.config = visConfig;
} else {
    visConfig.language = window.navigator.userLanguage || window.navigator.language;
}
