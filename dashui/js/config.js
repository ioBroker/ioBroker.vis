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
        {name: "metro",    depends: ["basic"]},
        "RGraph",
        "special",
        "swipe",
        "timeAndWeather",
        "weather-adapter",
        "table",
        "dev"
    ],
    currentLang:        "de",
    auth: {
        users: ["User", "Admin"]
    },
    connLink: "", // default "..". E.g for signalR "http://localhost:8081", for socket.io "http://raspberrypi:2100", android emulation "http://10.0.2.2:8083"
    connType: 'socket.io' // signalr, socket.io, local
};
