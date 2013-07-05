var binrpc = require("./binrpc.js");

var homematic = new binrpc({
    ccuAddress: "172.16.23.33",
    listenIp: "172.16.23.153",
    listenPort: 2013,
    methods: {
        // system.multicall und system.listMethods sind bereits in binrpc.js implementiert
        // Nicht-implementierte Methoden werden mit einem leeren String beantwortet und als Error auf der Konsole ausgegeben
        event: function (obj) {
            return "";
        }
    }
});

homematic.init({
    //wired: true,
    rf: true,
    cuxd: true
});

/*

homematic.request(2001, "listDevices", [], function (data) {
    console.log(data);
});

homematic.request(8701, "getValue", ["CUX0100001:1", "TEMPERATURE"], function (data) {
    console.log(data);
});

 */
