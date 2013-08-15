/**
 *  jQuery HomeMatic Plugin
 *  https://github.com/hobbyquaker/jqhomematic/
 *
 *  Copyright (c) 2013 hobbyquaker https://github.com/hobbyquaker
 *  MIT License (MIT)
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 *  documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 *  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 *  permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 *  the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 *  THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 *  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */
;

var homematic = {
    uiState: {},                // can Observable fur UI
    setState: {},               // can Observable zum setzen von Werten
    ccu: {},                    // Logikschicht-Daten
    dpWorking: {},
    cancelUpdateList: []            // Datenpunkte die beim nachsten Refresh ausgespart werden sollen
};

(function ($) {

var version =               '0.10',

    connected =             false,
    ready =                 false,
    setStateTimers =        {},
    refreshTimer,
    cancelNextRefresh =     false,

    settings =      {
        'ccu':              undefined,
        'ccuIoUrl':         undefined,
        'api':              '/addons/webapi/',
        'socket':           undefined,
        'protocol':         'http',
        'debug':            true,
        'loadCcuData':      true,
        "ccuSocket":        true,
        'cache':            true,
        'dataTypes': [
            "variables",
            "programs",
            "rooms",
            "functions",
            "devices"
        ],
        'storageKey':       'jqhm',
        'setStateDelay':    1250,
        'autoRefresh':      false,
        'refreshInterval':  7500,
        'regaDown':         function() {},
        'regaUp':           function() {},
        'connected':        function() {},
        'ready':            function() { funcs.debug("ready"); },
        'loading':          function(txt) {}
    },

    funcs = {
        init: function (options) {
            if (connected) {
                $.error( 'jQuery.homematic already connected!' );
                return false;
            }



            settings = $.extend(settings, options);

            if (settings.ccu) {
                settings.url = settings.protocol + '://' + settings.ccu + settings.api;
            } else {
                settings.url = settings.api;
            }


            homematic.uiState = new can.Observe({"_65535":{"Value":0}});
            homematic.setState = new can.Observe({"_65535":{"Value":0}});

            if (typeof io !== "undefined" && settings.ccuIoUrl) {
                funcs.debug("jqHomematic socket found");
                var socket = io.connect(settings.ccuIoUrl);
                socket.on('event', function(obj) {
                    var id = funcs.escape(obj[0]);
                    if (homematic.uiState["_"+id]) {
                        homematic.uiState.attr("_"+id+".Value", ''+obj[1]);
                        homematic.uiState.attr("_"+id+".Timestamp", (new Date()).getTime());
                    }
                });
            }


            funcs.loadCcuDataAll ();
        },                 // Homematic Plugin initialisieren
        setState: function (id, val) {
            //console.log("setState("+id+","+val+")");
           id = funcs.escape(id);

            cancelNextRefresh = true;
            homematic.setState.attr("_"+id, {Value:"\""+val+"\""});
            // ??? @hobbyquaker: Eigentlich, state muss wieder vom CCU 
            // gelesen werden um den richtigen status zu bekommen (vielleciht wurde die lampe gar nicht eingeshaltet
            // oder man kann quality von dem signal einfugen
            funcs.uiState(id, val);
        },                 // Wert-Anderung in homematic.setState schreiben
        uiState: function (id, val) {
            homematic.uiState.attr("_"+id+".Value", val);
        },                 // Wert-Anderung in homematic.uiState schreiben
        stateDelayed: function (attr, val) {
            if (!setStateTimers[attr]) {
                funcs.state(attr.slice(1), val);
                homematic.setState.removeAttr(attr);
                setStateTimers[attr] = setTimeout(function () {
                    if (homematic.setState[attr]) {
                        setStateTimers[attr] = undefined;
                        funcs.stateDelayed(attr, homematic.setState.attr(attr + ".Value"));
                    }
                    setStateTimers[attr] = undefined;
                }, settings.setStateDelay);
            }
        },                // Wert-Anderungs-Frequenz begrenzen
        clearCache: function () {
            storage.set(settings.storageKey, null);
            window.location.reload();
        },                // Clear cached data in object ccu and trigger reload
        script: function (script, success, error) {
            //funcs.debug(script);
            var url = settings.url + 'hmscript.cgi?content=plain';
            if (settings.session) {
                url += '&session=' + settings.session;
            }
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'text',
                data: script,
                success: success,
                error: error
            });
        },    // Runs a Homematic Script
        state: function(id, value) {
            if (value && id != 65535) {
                if ((''+id).indexOf("__") !== -1) {
                    id = id.replace(/__d__/g, ".");
                    id = id.replace(/__c__/g, ":");
                }
                if (id != parseInt(id,10)) {
                    id = "\"" + id + "\"";
                }
                funcs.script('dom.GetObject('+id+').State('+value+');', function () { cancelNextRefresh = false; });
            }
        },                   // Sets a Homematic Datapoint
        programExecute: function(id) {
            funcs.script('dom.GetObject("'+id+'").ProgramExecute();');
        },                     // Starts a Homematic Program
        checkRega: function(success, error) {
            funcs.debug("checkRega()");
            var url = '/addons/webapi/checkrega.cgi';
            if (settings.ccu) {
                url = settings.protocol + '://' + settings.ccu + url;
            }
            $.ajax({
                url: url,
                success: function(data) {
                    if (data == 'OK') {
                        settings.regaUp();
                        if (success) { success(); }
                    } else {
                        settings.regaDown(data);
                        if (error) { error(data); }
                    }
                },
                error: function(a, b, c) {
                    settings.regaDown("Cannot get checkrega.cgi");
                    if (error) {error(a,b,c);}
                }
            });
        },          // ReGaHss running? (= Port 8181 reachable)
        loadCcuDataAll: function (callback) {
            if (callback != null && callback != undefined && !settings.loadCcuData){
                settings.loadCcuData = true;
                ready = false;
                settings.ready = callback;
            }
            
            funcs.checkRega(function() {
                connected = true;

                if (settings.loadCcuData && settings.cache) {
                    var cache = storage.get(settings.storageKey);
                    var cacheReady = false;
                    if (cache && cache !== null) {
                        cacheReady = true;
                        for (var index in settings.dataTypes) {
                            if (!cache[settings.dataTypes[index]]) {
                                cacheReady = false

                            } else {
                                settings.loading("cache hit " + settings.dataTypes[index])

                            }
                        }
                    }

                    if (cacheReady) {
                        homematic.ccu = $.extend(homematic.ccu, cache);
                        console.log(homematic.ccu);
                        ready = true;
                        settings.ready();
                    }
                }
                if (settings.loadCcuData) {
                    if (!ready) {
                        for (var index in settings.dataTypes) {
                            funcs.loadCcuData(settings.dataTypes[index]);
                        }
                        funcs.waitTillReady();
                    }
                } else {
                    if (!ready) {
                        ready = true;
                        settings.ready();
                    }
                }

                funcs.refreshVisible();

                homematic.setState.bind("change", function (e, attr, how, newVal, oldVal) {
                if (how == "set" || how == "add") {
                    funcs.stateDelayed(attr, newVal.Value);
                    }
                });

            }, function () {
                connected = false;
                settings.regaDown();
            });
        },          // loads programs, rooms, devices and variables
        loadCcuData: function (dataType) {
            // Achtung jQuery Version
            // Wird in Zukunft $.ajax.active
            if ($.active > 0) {
                setTimeout(function() {
                    funcs.loadCcuData(dataType);
                }, 100);
                return false;
            }
            settings.loading("loadCcuData("+dataType+")")
            funcs.debug("loadCcuData("+dataType+")");
            $.ajax({
                url: 'fn/' + dataType + '.fn',
                type: 'GET',
                dataType: 'text',
                success: function (data) {
                    var url = settings.url + 'hmscript.cgi?content=json';
                    if (settings.session) {
                        url += '&session=' + settings.session;
                    }
                    $.ajax({
                        url: url,
                        type: 'POST',
                        dataType: 'json',
                        data: data,
                        /*
                        // Debug answer
                        complete: function (res, status) {
                            var i = res;
                        },*/
                        success: function (res) {
                            settings.loading("loadCcuData("+dataType+") finished");
                            funcs.debug("loadCcuData("+dataType+") finished");
							
                            homematic.ccu[dataType] = res;
                            if (settings.cache) {
                                settings.loading("caching " + dataType);
                                funcs.debug("caching " + dataType);
                                storage.extend(settings.storageKey, homematic.ccu);
                            }
                        }
                    });
                }
            });
            return true;
        },             // Run homematic scripts and insert results in Object ccu
        getFileList: function (dirName, ready, readyPrm, filter) {
            if (filter === undefined || filter == null || filter == "")
                filter = "*";
        
            var cache = storage.get(settings.storageKey);
            if (cache && cache !== null && cache["DIR_"+dirName]) {
                if (ready) {
                    ready (cache["DIR_"+dirName], readyPrm);
                }
                return;
            }       

            if ($.active > 0) {
                setTimeout(function() {
                    funcs.getFileList(dirName, ready, readyPrm);
                }, 100);
                return false;
            }
                
            var url   = settings.url + 'tclscript.cgi?content=html';
            var surl  = document.URL;
            var _url  = url.split('/');
            var _urls = surl.split('/');
            if (_url[2] != _urls[2]) {
                url = url.replace (_url[2], _urls[2]);
                dirName = "/var/" + dirName;
            }
            
            // If the http server is not on the CCU, so get the images from the server
            
            if (settings.session) {
                url += '&session=' + settings.session;
            }
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'html',
                data: "puts [glob "+dirName+filter+"]",
                
                // Debug answer
                complete: function (res, status) {
                    var i = res;
                },
                success: function (res) {
                    // dummy names for test
                    settings.loading("getFileList("+dirName+") finished");
                    funcs.debug("getFileList("+dirName+") finished");
                    res = res.replace(/^\s+|\s+$/g, '');
                    var i = res.indexOf (String.fromCharCode(10));
                    while (i != -1) {
                        res = res.replace(String.fromCharCode(10), " ");
                        i = res.indexOf (String.fromCharCode(10));
                    }
                    homematic.ccu["DIR_"+dirName] = res.split(' ');
                    for (var i=0; i<homematic.ccu["DIR_"+dirName].length; i++)
                        homematic.ccu["DIR_"+dirName][i] = homematic.ccu["DIR_"+dirName][i].replace (dirName, "");
                    if (settings.cache) {
                        settings.loading("caching images " + dirName);
                        funcs.debug("caching images" + dirName);
                        storage.extend(settings.storageKey, homematic.ccu);
                    }
                    if (ready) {
                        ready (homematic.ccu["DIR_"+dirName], readyPrm);
                    }
                }
            });                   
        },        // Get list of images in the directory
        addStringVariable: function (name, desc, callback) {
            var script = "object test = dom.GetObject('"+name+"');\n" +
                "if (test) {\n" +
                "} else {\n" +
                "object o = dom.CreateObject(OT_VARDP);\n" +
                "o.Name('"+name+"');\n" +
                "dom.GetObject(ID_SYSTEM_VARIABLES).Add(o.ID());\n" +
                "o.DPInfo('"+desc+"');\n" +
                "o.DPArchive(false);\n" +
                "o.ValueUnit('');\n" +
                "o.ValueType(20);\n" +
                "o.ValueSubType(11);\n" +
                "o.State('');\n" +
                "}";
            funcs.script(script, callback);
        },
        delVariable: function (name, callback) {
            var script = "object o = dom.GetObject('"+name+"');\n" +
                "if (o) {\n" +
                "  object ch = dom.GetObject(o.Channel());\n" +
                "  if (ch) {\n" +
                "    ch.DPs().Remove(o.ID());\n" +
                "  }\n" +
                "  dom.DeleteObject(o.ID());\n" +
                "}";
            funcs.script(script, callback);
        },
        refresh: function (DPs) {
            if (cancelNextRefresh) {
                cancelNextRefresh = false;
                $(".jqhmRefresh").hide();

                return false;
            }
            if (DPs.length == 0) {
                $(".jqhmRefresh").hide();
                return false;
            }
            var script = funcs.buildRefreshScript(DPs);
            funcs.script(script, function(data) {
                try {
                    data = $.parseJSON(data);
                    if (cancelNextRefresh) {
                        cancelNextRefresh = false;
                        $(".jqhmRefresh").hide();

                        return false;
                    }
                    for (var dp in data) {
                        //jqhm[dp].attr('Value', data[dp].Value);
                        //jqhm[dp].attr('Timestamp', data[dp].Timestamp);
                        var xdp = ''+dp;

                        xdp = funcs.escape(xdp);
                      //  homematic.uiState.attr(xdp, {Value: unescape(data[dp].Value), Timestamp: data[dp].Timestamp, certain: true});

                        homematic.uiState.attr(xdp + ".Value", unescape(data[dp].Value));
                        homematic.uiState.attr(xdp + ".Timestamp", data[dp].Timestamp);
                        homematic.uiState.attr(xdp + ".certain", true);
                    }
                    $(".jqhmRefresh").hide();
                }
                catch (e) {
                    console.log (e.name + ". May be invalid Homematic ID??"+ data);
                }


            });
        },                      // Refresh of all Datapoints in Array DPs
        addUiState: function(id) {
            //console.log("addUiState("+id+")");
            id = funcs.escape(id);
            var sid = '_' + id;
            homematic.uiState.attr(sid, {'id':id,'wid':undefined,'Value':0,'Timestamp':'','certain':false});
        },                     // uiState Objekt initialisieren
        viewsVisible: function () {
            var views = [];
            $("*[data-hm-id]").each(function () {
                var id = $(this).attr("data-hm-id");
                var wid = $(this).attr("data-hm-wid");
                if (wid) {
                    homematic.dpWorking["_"+id] = wid;
                }
                if (views.indexOf(id) === -1) {
                    // Don't Poll BidCos-Adresses if ccu.io is available
                    if (typeof io === "undefined" || homematic.uiState["_"+funcs.escape(id)].Timestamp == "") {
                        views.push(id);
                    } else {
                        if (!id.match(/BidCos/) && !id.match(/CUxD/)) {
                            views.push(id);
                        }
                    }
                }
            });
            return views;
        },                    // Returns Array of all visible Datapoints
        setInterval: function (ms) {
            settings.refreshInterval = ms;
        },
        refreshVisible: function () {
            funcs.debug("refreshVisible()");
            $(".jqhmRefresh").show();
            funcs.refresh(funcs.viewsVisible());
            if (settings.autoRefresh) {
                clearTimeout(refreshTimer)
                refreshTimer = setTimeout(funcs.refreshVisible, settings.refreshInterval);
            }
        },                  // Wraps funcs.refresh(funcs.viewsVisible())
        shell: function (cmdline, success, error) {
            var url = settings.url + 'process.cgi';
            if (settings.session) {
                url += '&session=' + settings.session;
            }
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'text',
                data: cmdline,
                success: success,
                error: error
            });
        },    // Ubergibt Commandline an /bin/sh, success(data) beinhaltet stdout
        buildRefreshScript: function (DPs) {

            var refreshScript = 'var first = true;\nobject o;\nobject w;\nWrite("{");\n';

            var first = true;
            for (var dp in DPs) {

                var id = DPs[dp];

                if (id != 65535) {

                    var type; // PROGRAMME ERKENNEN?

                    if (homematic.dpWorking["_"+id]) { // WORKING ID
                       // if ((''+homematic.dpWorking["_"+id]).indexOf(":") !== -1) 
                            refreshScript += 'w = dom.GetObject("' + homematic.dpWorking["_"+id] + '");\n';
                        //else
                        //    refreshScript += 'w = dom.GetObject(' + homematic.dpWorking["_"+id] + ');\n';
                        refreshScript += 'if (w.Value() == false) {\n';
                    }

                    refreshScript += 'if (first) {\nfirst = false;\n } else {\n WriteLine(",");\n}\n';


                    //if ((''+id).indexOf(":") !== -1 || (''+id).indexOf("_") !== -1)
                        refreshScript += 'o = dom.GetObject("' + id + '");\n';
                    //else
                    //    refreshScript += 'o = dom.GetObject(' + id + ');\n';

                    refreshScript += 'Write("\\"_' + id + '\\":{");\n';
                    if (type !== "PROGRAM") {
                        refreshScript += 'Write("\\"Value\\":\\"");\n';
                        refreshScript += 'WriteURL(o.Value());\nWrite("\\",");\n';
                    }
                    refreshScript += 'Write("\\"Timestamp\\":\\"" # o.Timestamp() # "\\"}");\n';

                    if (homematic.dpWorking["_"+id]) { // Working ID
                        refreshScript += '}\n';
                    }
                }
            }
            refreshScript += 'Write("}");';
            return refreshScript;
        },           // Homematic Script zum Refresh der Datenpunkte erzeugen
        waitTillReady: function () {
            var allReady = true;
            for (var index in settings.dataTypes) {
				
                if (homematic.ccu[settings.dataTypes[index]] === undefined) {
                    allReady = false;
                }
            }
            if (allReady) {
                ready = true;
                settings.ready();
                return true;
            } else {
                setTimeout(funcs.waitTillReady, 80);
                return false;
            }
        },                   // Warten bis das Plugin initialisiert. Feuert ready Event
        debug: function (txt) {
            if (settings.debug) {
                //console.log(txt);
            }
        },                         // Debugausgabe in die Browserconsole
        escape: function (id) {
            //return id;
            //return encodeURIComponent(id);
            if ((''+id).indexOf(".") !== -1 || (''+id).indexOf(":") !== -1) {
                id = id.replace(/\./g, "__d__");
                id = id.replace(/:/g, "__c__");
            }
            return id;
        },
        unescape: function (id) {
            //return decodeURIComponent(id);
            //return id;
            if ((''+id).indexOf("__c__") !== -1 || (''+id).indexOf("__d__") !== -1) {
                id = id.replace(/__c__/g, ":");
                id = id.replace(/__d__/g, ".");
            }
            return id;
        }

    },
    methods = {};

    $.fn.homematic = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.homematic' );
        }
    }
    $.homematic = function( func ) {
        if ( funcs[func] ) {
            return funcs[ func ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof func === 'object' || ! func ) {
            return funcs.init.apply( this, arguments );
        } else {
            $.error( 'Function ' +  func + ' does not exist on jQuery.homematic' );
        } 
    }



})(jQuery);