var visConfig = {
    "widgetSets": [
        "basic",
        "jqplot",
        {
            "name": "jqui",
            "depends": [
                "basic"
            ]
        },
        "tabs"
    ]
};
if (typeof exports != 'undefined') {
    exports.config = visConfig;
} else {
    visConfig.language = window.navigator.userLanguage || window.navigator.language;
}
