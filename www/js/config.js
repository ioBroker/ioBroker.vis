var visConfig = {
    widgetSets: [
        "basic",
        {name: "jqui",        depends: ["basic"]},
        "weather-adapter",
        "tabs",
        "jqplot"
    ]
};

if (typeof exports != 'undefined') {
    exports.config = visConfig;
} else {
    visConfig.language = window.navigator.userLanguage || window.navigator.language;
}