/**
 *
 *      ioBroker mqtt Adapter
 *
 *      (c) 2014 bluefox
 *
 *      MIT License
 *
 */

var utils =   require(__dirname + '/lib/utils'); // Get common adapter utils
var adapter = utils.adapter('vis');

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

    // create command variable
    adapter.getObject('command', function (err, obj) {
        if (!obj) {
            adapter.setObject('command', {
                common: {
                    name: 'Command interface for vis',
                    type: 'object',
                    desc: 'Write object: {instance: "FFFFFFFFF", command: "changeView", data: "ViewName"} to change the view'
                },
                type: 'state'
            }) ;
        }
    });

    // Create common user CSS file
    adapter.readFile('vis', 'css/vis-common-user.css', function (err, data) {
        if (err || !data) {
            adapter.writeFile('vis', 'css/vis-common-user.css', '');
        }
    });

    adapter.stop();
}