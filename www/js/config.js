var visConfig = {
    widgetSets: [
        "basic",
        {name: "metro",       depends: ["basic"]},
        {name: "fancyswitch", depends: ["basic"]},
        "tabs",
        "jqplot",
        "timeAndWeather"
        /*,
         "weather-adapter",
         {name: "jqui",        depends: ["basic"]}
        "bars",
        "colorpicker",

        {name: "homematic", depends: ["basic", "jqui"]},
        "knob",
//        {name: "hqWidgets", edit: "hqWidgetsEdit"},
        "jqplot",
        {name: "jqui-mfd", depends: ["basic", "jqui"]},
        {name: "lcars",    depends: ["basic"]},
        "RGraph",
        "special",
        "swipe",
        "table",
        "dev"*/
    ],
    language: window.navigator.userLanguage || window.navigator.language
};
