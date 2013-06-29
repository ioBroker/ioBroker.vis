/**
 *      CCU.IO version 0.1
 *
 *      Socket.IO based HomeMatic Interface
 *
 *      Copyright (c) 2013 http://hobbyquaker.github.io
 *
 *      CC BY-NC 3.0
 *
 *      Kommerzielle Nutzung nicht gestattet!
 *
 */

var logger = require('./logger.js');
var binrpc = require("./binrpc.js");

var io = require('socket.io').listen(2100);



io.sockets.on('connection', function (socket) {
    logger.info("socket.io <-- "  + " connected");
    socket.on('disconnect', function () {
        logger.info("socket.io <-- "  + " disconnected");
    });

});



var homematic = new binrpc({
    ccuIp: "172.16.23.3",
    requestInit: {
        wired: {

        }

    },
    listenIp: "172.16.23.153",
    listenPort: 2101,
    methods: {
        // system.multicall und system.listMethods sind bereits in binrpc.js implementiert
        // Nicht-implementierte Methoden werden mit einem leeren String beantwortet und als Error auf der Konsole ausgegeben
        event: function (obj) {
            io.sockets.emit("event", obj);
            return "";
        }
    }
});

homematic.init({
    //wired: true,
    rf: true,
    cuxd: true
});