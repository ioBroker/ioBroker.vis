var duiConfig = {

    widgetSets: [
        "basic",
        "bars",
        "bko",
        "colorpicker",
        "fancyswitch",
        "highcharts",
        {name: "homematic", depends: ["basic", "jqui"]},
        "knob",
        {name: "hqWidgets", edit: "hqWidgetsEdit"},
        "jqplot",
        {name: "jqui",     depends: ["basic"]},
        {name: "jqui-mfd", depends: ["basic", "jqui"]},
        {name: "lcars",    depends: ["basic"]},
        "RGraph",
        "special",
        "swipe",
        "timeAndWeather",
        "weather-adapter",
        "dev"
    ],
    currentLang:        "de",
    auth: {
        users: ["User", "Admin"]
    },
    connLink: "" // default "..". E.g for signalR "http://localhost:8081", for socket.io "http://raspberrypi:2100"

};
