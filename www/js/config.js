var visConfig = {license: false,
    "widgetSets": [
        "basic",
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
        {
            "name": "justgage",
            "depends": []
        },
        "map",
        "mihome-vacuum",
        "sip-asterisk",
        "swipe",
        "tabs"
    ]
};
if (typeof exports !== 'undefined') {
    exports.config = visConfig;
} else {
    visConfig.language = window.navigator.userLanguage || window.navigator.language;
}
