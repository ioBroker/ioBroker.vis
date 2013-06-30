/**
 *      CCU.IO version 0.2
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
var socketlist = [];

process.on('SIGINT', function () {
    /*socketlist.forEach(function(socket) {
        logger.info("socket.io --> "  + " destroying socket");

        socket.destroy();
    });

    */
    logger.info("socket.io closing server");
    io.server.close();

});

io.sockets.on('connection', function (socket) {
    socketlist.push(socket);

    logger.info("socket.io <-- "  + " connected");
    socket.on('disconnect', function () {
        logger.info("socket.io <-- "  + " disconnected");
        socketlist.splice(socketlist.indexOf(socket), 1);
    });
    socket.on('close', function () {
        logger.info("socket.io <-- "  + " socket closed");
        socketlist.splice(socketlist.indexOf(socket), 1);
    });

});

var homematic = new binrpc({
    ccuIp: "172.16.23.3",
    listenIp: "172.16.23.153",
    listenPort: 2101,
    inits: [
        { id: "io_cuxd", port: 8701 },
        { id: "io_rf", port: 2001 },
        { id: "io_wired", port: 2000 }
    ],
    methods: {
        // system.multicall und system.listMethods sind bereits in binrpc.js implementiert
        // Nicht-implementierte Methoden werden mit einem leeren String beantwortet und als Error auf der Konsole ausgegeben
        event: function (obj) {
            var res = [];
            switch (obj[0]) {
                case "io_cuxd":
                case "CUxD":
                    res = ["CUxD." + obj[1] + "." + obj[2], obj[3]];
                    break;
                case "io_rf":
                    res = ["BidCos-RF." + obj[1] + "." + obj[2], obj[3]];
                    break;
                case "io_wired":
                    res = ["BidCos-Wired." + obj[1] + "." + obj[2], obj[3]];
                    break;
                default:
                    res = [obj[0] + "." + obj[1] + "." + obj[2], obj[3]];
            }
            io.sockets.emit("event", res);
            return "";
        }
    }
});
