var duiConfig = {

    // TODO why not {name: "jqui", depends: ["basic"]} instead of extra dependencies object?

    widgetSets: [
        "basic",
        "bars",
        "colorpicker",
        "fancyswitch",
        "highcharts",
        "knob",
        {name: "hqWidgets", edit: "hqWidgetsEdit"},
        "jqplot",
        "jqui",
        "jqui-mfd",
        "lcars",
        "RGraph",
        "special",
        "swipe",
        "timeAndWeather",
        "weather-adapter",
        "dev"
    ],
    dependencies:       {
        "jqui":     ["basic"],
        "jqui-mfd": ["basic", "jqui"],
        "lcars":    ["basic"]
    },
    currentLang:        "de",
	connLink: ""

};
