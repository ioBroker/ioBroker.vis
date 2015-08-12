var visConfig = {
    widgetSets: [
        "basic",
        {name: "fancyswitch", depends: ["basic"]},
        {name: "jqui",        depends: ["basic"]},
        {name: "jqui-mfd",    depends: ["basic", "jqui"]},
        "timeAndWeather",
        "weather-adapter",
        "tabs",
        "jqplot",
        "RGraph"
    ]
};

if (typeof exports != 'undefined') {
    exports.config = visConfig;
} else {
    visConfig.language = window.navigator.userLanguage || window.navigator.language;
}