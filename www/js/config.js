var visConfig = {
    widgetSets: [
        "basic",
        {name: "fancyswitch", depends: ["basic"]},
        "tabs",
        "jqplot",
        "timeAndWeather",
        {name: "jqui",        depends: ["basic"]},
        {name: "jqui-mfd",    depends: ["basic", "jqui"]},
        "weather-adapter",
        "RGraph",
        "hqWidgets",
        "plumb",
        "bars",
        {name: "lcars",       depends: ["basic"]}
    ]
};

if (typeof exports != 'undefined') {
    exports.config = visConfig;
} else {
    visConfig.language = window.navigator.userLanguage || window.navigator.language;
}