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
        "hqwidgets",
        "plumb",
        "bars"
    ]
};

if (typeof exports != 'undefined') {
    exports.config = visConfig;
} else {
    visConfig.language = window.navigator.userLanguage || window.navigator.language;
}