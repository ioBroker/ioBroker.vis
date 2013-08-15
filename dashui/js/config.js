var duiConfig = {
    widgetSets:         ["basic","colorpicker","fancyswitch", {name: "hqWidgets", edit: "hqWidgetsEdit"},"timeAndWeather","knob","jqplot","jqui","jqui-mfd","swipe","dev"],
    currentLang:        "de",
    useCache:           true,
    fileViews:          "/usr/local/addons/dashui.views",
    ccu:                null,      // Hier IP Adresse von CCU: "192.168.1.100",
    ccuIoUrl:           undefined, // Hier (falls vorhanden) URL von CCU.IO Server: "http://rasppi:2100",
    defaultHmInterval:  7500,      // Update interval in ms
};
