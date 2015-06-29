var visConfig = {
    widgetSets: [
        "basic",
        {name: "metro",       depends: ["basic", "jqui-mfd"]},
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
        //"vkb"
        /*
         "bars",
         "colorpicker",
         {name: "homematic", depends: ["basic", "jqui"]},
         //        {name: "hqWidgets", edit: "hqWidgetsEdit"},
         "knob"
         "special",
         "swipe",
         "dev"*/
    ]
};

if (typeof exports != 'undefined') {
    exports.config = visConfig;
} else {
    visConfig.language = window.navigator.userLanguage || window.navigator.language;
}