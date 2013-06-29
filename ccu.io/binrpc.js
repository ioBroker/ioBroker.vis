/**
 *      HomeMatic BIN-RPC Schnittstelle für Node.js
 *
 *      Version 0.1
 *
 *      Copyright (c) 2013 http://hobbyquaker.github.io
 *
 *      CC BY-NC 3.0
 *
 *      Kommerzielle Nutzung nicht gestattet!
 *
 */
var Put = require('put'),
    net = require('net'),
    binary = require('binary');

var logger = require('./logger.js');

var binrpc = function(options) {
    logger.info("HomeMatic BIN-RPC");
    logger.info("press ctrl-c to stop");

    logger.verbose("Copyright (c) 2013 hobbyquaker");
    logger.verbose("Licensed under CC BY-NC 3.0");

    var that = this;
    this.options = options;
    this.prefix = options.prefix;
    this.methods = options.methods;

};

binrpc.prototype = {
    inits: [],
    options: {

    },
    server: {},
    serverRunning: false,
    request: function (port, method, data, callback) {
        logger.verbose("binrpc --> "+this.options.ccuIp+":"+port+" request " + method + " " + JSON.stringify(data));
        this.sendRequest(port, this.buildRequest(method, data), callback);
    },
    buildRequest: function (method, data) {
        //logger.info("this.buildRequest(" + method);
        //logger.info(data);
        //logger.info(");");
        if (!data) {
            data = [];
        }

        var dataLength = 0;

        for (var i = 0; i < data.length; i++) {
            dataLength += (8 + data[i].length);
        }

        var buf = Put()
            .put(new Buffer('Bin', 'ascii'))
            .word8(0)
            .word32be(8 + method.length + dataLength) // Msg Size
            .word32be(method.length)
            .put(new Buffer(method, 'ascii'))
            .word32be(data.length)
            .buffer()
        ;
        /*var databuf = Put()
            .word32be(0) // Data Length
            .buffer();*/



        for (var i = 0; i < data.length; i++) {
            buf = Buffer.concat([buf, this.buildString(data[i])]);
        }
        //logger.info(buf);
        return buf;
    },
    buildResponse: function(data) {

        var data = this.buildData(data);
        var buf = Put()
            .put(new Buffer('Bin', 'ascii'))
            .word8(1)
            .word32be(data.length) // Msg Size
            .buffer()
        ;

        buf = Buffer.concat([buf,data]);
        return buf;

    },
    buildData: function (obj) {
        var buf, objType = typeof obj;
        switch (objType) {
            case "number":
                // Float oder Integer??
                if (obj.match(/\./)) {
                    buf = this.buildFloat(obj);
                } else {
                    buf = this.buildInteger(obj);
                }
                break;

            case "string":
                buf = this.buildString(obj);
                break;

            case "boolean":
                buf = this.buildBoolean(obj);
                break;
            case "object":
                if (Object.prototype.toString.call( obj ) === '[object Array]') {
                    buf = this.buildArray(obj);
                } else {
                    buf = this.buildStruct(obj);
                }
                break;


            default:
                logger.error();

        }
        return buf;

    },
    buildArray: function (arr) {
        var buf,
            arrLength = arr.length;

        buf = Put()
            .word32be(0x100)
            .word32be(arrLength)
            .buffer();

        for (var i = 0; i < arrLength; i++) {
            buf = Buffer.concat([buf, this.buildData(arr[i])]);
        }
        return buf;

    },
    buildString: function (str) {

        var buf = Put()
            .word32be(0x03)
            .word32be(str.length)
            .put(new Buffer(str, 'ascii'))
            .buffer();
        return buf;
    },
    parseData: function (data) {
        //logger.info("parseData data.length="+data.length);
        //logger.info(data);
        if (!data) { return };
        var res = binary.parse(data)
            .word32bu("dataType")
            .buffer("elements", data.length)
            .vars;


        switch (res.dataType) {
            case 0x101:
                var struct = binary.parse(res.elements)
                    .word32bu("elementCount")
                    .buffer("elements", data.length)
                    .vars;
                logger.debug("struct.length "+struct.elementCount);

                var elements = struct.elements;
                var result = {};
                for (var i = 0; i < struct.elementCount; i++) {
                    logger.debug("struct["+i+"]");
                    var key = binary.parse(elements)
                        .word32bu("keylength")
                        .buffer("key", "keylength")
                        .buffer("rest", data.length)
                        .vars;
                    //logger.info(key.key.toString());


                    elements = key.rest;
                    var elem = (this.parseData(elements));
                    elements = elem.rest;
                    result[key.key.toString()] = elem.content;


                }
                //logger.info(elem.content);
                return {content: result, rest: elements};

                break;
            case 0x100:
                var arr = binary.parse(res.elements)
                    .word32bu("elementCount")
                    .buffer("elements", data.length)
                    .vars;
                logger.debug("array.length "+arr.elementCount);

                var elements = arr.elements;
                var result = [];
                for (var i = 0; i < arr.elementCount; i++) {
                    //logger.info("array["+i+"] ");
                    //logger.info("elements");
                    //logger.info(elements);
                    if (!elements) {
                        return {content: "", rest: undefined};
                    }
                    var res = this.parseData(elements);

                    elements = res.rest;
                    result.push(res.content);
                }
                logger.debug(result);
                return {content: result, rest: elements};
                break;
            case 0x04:
                var flt = binary.parse(res.elements)
                    .word32bs("mantissa")
                    .word32bs("exponent")
                    .buffer("rest", data.length)
                    .vars;
                flt.content = parseFloat(((Math.pow(2, flt.exponent)) * (flt.mantissa / (1 << 30))).toFixed(6));
                logger.debug("float "+flt.content);
                return flt;
                break;
            case 0x03:
                var str = binary.parse(res.elements)
                    .word32bu("strLength")
                    .buffer("strContent", "strLength")
                    .buffer("rest", data.length)
                     .vars;
                str.content = str.strContent.toString();
                logger.debug("string "+str.content)
                return str;
                break;
            case 0x02:
                var int = binary.parse(res.elements)
                    .word8("value")
                    .buffer("rest", data.length)
                    .vars;
                int.content = (int.value == 1 ? true : false);
                logger.debug("bool " + int.content);
                return (int);
                break;

                break;
            case 0x01:
                var int = binary.parse(res.elements)
                    .word32bu("value")
                    .buffer("rest", data.length)
                    .vars;
                int.content = int.value;
                logger.debug("integer " + int.content);
                return (int);
                break;
            case 0x42696E00:
                logger.debug("binrpc <-- next request");
                //this.parseRequest(data);
                return;
                break;
            default:
                logger.error("unknow data type " + res.dataType + " :(");
                return;

        }
    },
    parseResponse: function (data, name) {

        var vars = binary.parse(data)
                .buffer("head", 3)
                .word8("msgType")
                .word32bu("msgSize")
                .buffer("body", "msgSize")
                .vars
            ;
//logger.info("parseResponse data.length="+data.length+" msgSize="+vars.msgSize+ " body.length="+vars.body.length);
        if (vars.head.toString() != "Bin") {
           logger.error("malformed header " + vars.head.toString() );
            //return false;
        }

        vars.head = vars.head.toString();

        switch (vars.msgType) {
            case 0:
                logger.error("binrpc <-- wrong msgType in response");
                logger.silly(this.parseData(vars.body));
                break;
            case 1:
                var res = this.parseData(vars.body);
                logger.verbose("binrpc <-- "+name+" response " + JSON.stringify(res.content));
                logger.silly(res.content);
                break;
        }

        if (res.rest.length > 0) {
           logger.error("rest..... ");
           logger.verbose(res.rest);
        }
        return res.content;

    },
    parseStrangeRequest: function (data) {
        var that = this;
        var arr = [];
        var rec = function (data) {
            if (data) {
                var tmp = that.parseData(data);
                if (tmp) {
                    arr.push(tmp.content);
                    if (tmp.rest && tmp.rest.length > 0) {
                        rec(tmp.rest);
                    }
                }
            }
        }
        rec(data);
        return arr;
    },
    parseRequest: function (data, name) {
        var response;
        var vars = binary.parse(data)
                .buffer("head", 3)
                .word8("msgType")
                .word32bu("msgSize")
                .buffer("body", data.length)
                .vars
            ;

        if (vars.head.toString() != "Bin") {
            logger.error("malformed request header received");
            return false;
        }

        vars.head = vars.head.toString();

        var req = binary.parse(vars.body)
            .word32bu("strSize")
            .buffer("method", "strSize")
            .word32bu("elementcount")
            .buffer("body", data.length)
            .vars

        switch (vars.msgType) {
            case 0:
                var res = this.parseStrangeRequest(req.body);
                var method = req.method.toString();
                switch (method) {
                    case "system.multicall":
                        data = res[0];
                        logger.verbose("binrpc <-- "+name+" request system.multicall " + data.length);
                        response = [];
                        for (var i = 0; i < data.length; i++) {
                            response[i] = "";
                            if (this.methods[data[i].methodName]) {
                                logger.verbose("binrpc <-- "+name+" multicall["+i+"] " + data[i].methodName + " " + JSON.stringify(data[i].params));
                                var tmp = this.methods[data[i].methodName](data[i].params);
                                if (tmp) {
                                    response[i] = tmp;
                                }
                            } else {
                                logger.warn("method " + data[i].methodName + " undefined");
                                logger.debug(data[i].params);
                            }
                        }

                        break;
                    case "system.listMethods":
                        logger.verbose("binrpc <-- "+name+" request " + method + " " + JSON.stringify(res));
                        response = ["system.multicall", "system.listMethods"];
                        for (var name in this.methods) {
                            response.push(name);
                        }
                        break;
                    default:
                        response = "";
                        logger.verbose("binrpc <-- "+name+" request " + method + " " + JSON.stringify(res));
                        if (this.methods[method]) {
                            response = this.methods[method](res);
                        } else {
                            logger.error("method " + req.method.toString() + " undefined");
                        }
                }


                break;
            default:
               logger.error("wrong msgType in request");
        }

        return response;
    },
    sendRequest: function (port, buf, callback) {
        var that = this;
        var response = new Buffer(0);
        var chunk = 0;
        var length;

        var client = net.createConnection(port, this.options.ccuIp,
            function() { //'connect' listener
               //logger.verbose('sending to '+that.options.ccuIp+':'+port);
               //logger.silly(buf);
                client.write(buf.toString());
            });


        client.on('data', function(data) {
            logger.silly("receiving chunk "+chunk+" data.length="+data.length);

            if (chunk == 0) {
                var vars = binary.parse(data)
                    .buffer("head", 3)
                    .word8("msgType")
                    .word32bu("msgSize")
                    .vars;
                length = vars.msgSize;
                response = data;
            } else {
                response = Buffer.concat([response, data]);

            }
            chunk = chunk + 1;

           //debug(0,"response.length="+response.length);

            if (response.length >= (length + 8)) {
                var name = client.remoteAddress+":"+client.remotePort;
                client.end();
                var res = that.parseResponse(response, name);
                logger.verbose('binrpc --> '+name+ " closing connection");
                if (callback) {
                    callback(res, name);
                }


            }

            /*logger.info("##############################\n\n\n");
           logger.verbose("receiving: ");
           logger.verbose(data.length);
            var res = this.parseResponse(data);
            //debug(0,res);
            client.end();
            if (callback) { callback(res); }*/

        });

        client.on('end', function() {


        });
    },
    init: function (options) {
        var that = this;

        if (options.cuxd) {
            this.inits.push({id: "CUxD", port: options.cuxdPort || 8701});
        }
        if (options.rf) {
            this.inits.push({id: "BidCos-RF", port: options.rfPort || 2001});
        }
        if (options.wired) {
            this.inits.push({id: "BidCos-Wired", port: options.wiredPort || 2000});
        }

        if (this.inits.length < 1) {
            return false;
        }

        if (!this.serverRunning) {
            this.serverRunning = true;

            this.server = net.createServer(function(c) {
                var receiver = new Buffer(0);
                var chunk = 0;
                var length;
                var name = c.remoteAddress + ":" + c.remotePort

               logger.verbose('binrpc <-- '+name+' connected');

                c.on('end', function() {
                   logger.verbose('binrpc <-- '+name+' disconnected');
                });

                c.on('data', function (data) {
                    //logger.info("server receiving:");
                    //logger.info(data);

                    if (chunk == 0) {
                        var vars = binary.parse(data)
                            .buffer("head", 3)
                            .word8("msgType")
                            .word32bu("msgSize")
                            .vars;
                        length = vars.msgSize;
                        receiver = data;
                    } else {
                        receiver = Buffer.concat([receiver, data]);

                    }
                    chunk = chunk + 1;

                    //logger.info("receiver.length="+receiver.length);

                    if (receiver.length >= (length + 8)) {
                        //var res = this.parseResponse(receiver);
                        //if (callback) { callback(res); }
                        //logger.info(res.content);

                        var response = that.parseRequest(receiver, name);

                        var buf = that.buildResponse(response);
                        logger.verbose('binrpc --> '+name+' response ' + JSON.stringify(response));
                        logger.silly(buf);

                        c.write(buf);
                    }

                });

            });

            // RPC Init abmelden bevor Prozess beendet wird
            process.on('SIGINT', function () {
                logger.verbose("received SIGINT");
                for (var i = 0; i < that.inits.length; i++) {
                    var text = that.inits[i].id+" ("+that.options.ccuIp+":"+that.inits[i].port+")";
                    that.request(that.inits[i].port, "init", ["xmlrpc_bin://" + that.options.listenIp+":" + that.options.listenPort, ""]);
                    logger.info("binrpc stopping init on "+text+"");
                }
                setTimeout(function () {
                    that.server.close();
                    logger.info("binrpc stopping server");
                }, 1800);

            });

            this.server.listen(this.options.listenPort, function() { //'listening' listener
                logger.info('binrpc server listening on port '+that.options.listenPort);
                // RPC Init anmelden
                for (var i = 0; i < that.inits.length; i++) {
                    var thisInit = that.inits[i];
                    that.request(that.inits[i].port, "init", ["xmlrpc_bin://"+that.options.listenIp+":"+that.options.listenPort, that.inits[i].id], function(data, name) {
                        if (data === "") {
                            logger.info("binrpc init on "+name+" successful");
                        } else {
                            logger.error("binrpc init on "+name+" failure");
                        }
                    });
                }
            });
        } else {
            // RPC Init anmelden
            for (var i = 0; i < that.inits.length; i++) {
                var text = that.inits[i].id+" ("+that.options.ccuIp+":"+that.inits[i].port+")";
                that.request(that.inits[i].port, "init", ["xmlrpc_bin://"+that.options.listenIp+":"+that.options.listenPort, that.inits[i].id], function(data) {
                    logger.info("binrpc init on "+text+" successful");
                });
            }
        }



    }
};

module.exports = binrpc;






/*
if (argv.wired) {
    binrpc.init({
        connectIp: argv.ccu,
        connectPort: 2000,
        listenIp: argv.listen,
        listenPort: argv.lport,
        identifier: argv.identifier || "BidCos-Wired",
    });
    logger.info("starting rs485 init");
}

if (argv.rf) {
    binrpc.init({
        connectIp: argv.ccu,
        connectPort: 2001,
        listenIp: argv.listen,
        listenPort: argv.lport,
        identifier: argv.identifier || "BidCos-RF"

    });
    logger.info("starting rf init");
}

if (argv.cux) {
    binrpc.init({
        connectIp: argv.ccu,
        connectPort: 8701,
        listenIp: argv.listen,
        listenPort: argv.lport,
        identifier: argv.identifier || "CUxD"
    });
    logger.info("starting cux init");
}


//var buf = binrpc.buildRequest("getValue", ["CUX0100001:1", "TEMPERATURE"]);
//var buf = binrpc.buildRequest("getDeviceDescription", ["CUX0100002"]);
//var buf = binrpc.buildRequest("getParamset", ["CUX0100002:1", "MASTER"]);
//var buf = binrpc.buildRequest("system.listMethods");
//var buf = binrpc.buildRequest("listDevices");


/*
binrpc.request("listDevices", [], function(res) {
   binrpc.debug(0,res);
});

binrpc.request("system.listMethods", [], function(res) {
   binrpc.debug(0,res);
});*/

