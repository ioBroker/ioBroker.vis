/**
 *
 *      ioBroker mqtt Adapter
 *
 *      (c) 2014 bluefox
 *
 *      MIT License
 *
 */

var adapter = require(__dirname + '/../../lib/adapter.js')('vis');

adapter.on('ready', function () {
    main();
});

function main() {
    var widgetSets = [
        "basic",
        "bars",
        "bko",
        "colorpicker",
        "fancyswitch",
        {name: "homematic", depends: ["basic", "jqui"]},
        "knob",
//        {name: "hqWidgets", edit: "hqWidgetsEdit"},
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
    ];

    adapter.stop();
}