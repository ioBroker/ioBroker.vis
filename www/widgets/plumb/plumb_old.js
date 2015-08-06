/**
 * Created by jack on 26.07.2014.
 */
//Phase1 endpoints erstellen
//Phase2 verbindungen erstellen
//Phase3 bind Routing
//Phase4 bind value
//Phase5 set con type

dui.plumb_inst = {};

dui.binds.plumb = {

    _add_endpoint: function (id, _posi, _max) {
        console.log("add endpoint");
        var max = _max || -1;
        var posi;
        var endpointStyle;
        if (dui.editMode) {
            endpointStyle = {fillStyle: "blue"};
        } else {
            endpointStyle = {fillStyle: "transparent"};
        }
        if (!_posi) {
            posi = [0.50, 1, 0, 0, 0, 0];
        } else if (_posi == "Left") {
            posi = [0, 0.5, -1, 0, 0, 0];
        } else if (_posi == "Right") {
            posi = [1, 0.5, 1, 0, 0, 0];
        }else if (_posi == "Center") {
            posi = "Center";
        }

        console.log(posi)
        var ep = dui.plumb_inst[dui.activeView].addEndpoint(id.toString(), { uuid: id.toString() }, {
            anchor: posi,
            isSource: true,
            isTarget: true,
            paintStyle: endpointStyle,
            endpoint: [ "Dot", {radius: 5} ],
//          connectorStyle: { strokeStyle: "#5c96bc", lineWidth: 2, outlineColor: "transparent", outlineWidth: 4 },

            maxConnections: max
        });

        return ep;
    },

    con_manager: function (el, data) {
        console.clear()
        var $this = jQuery(el);
        var duiWidget = dui.views[dui.activeView].widgets[$($this).attr("id")] || $($($this).attr("id"));
        var opt = duiWidget.data.opt;
        var HPS;
        var PS = { lineWidth: data.width, strokeStyle: data.standart };
        var view = dui.activeView;

        if (dui.editMode) {
            $($this).show();
            (function ($) {
                $.event.special.destroyed = {
                    remove: function (o) {
                        if (o.handler) {
                            o.handler()
                        }
                    }
                }
            })(jQuery);

            HPS = {strokeStyle: "red", lineWidth: data.width };

            $('<style id="plumb_z">._jsPlumb_endpoint {z-index: ' + duiWidget.data["Z-high"] + 1 + '}._jsPlumb_connector{z-index:' + duiWidget.data["Z-high"] + '}.plumb_wg{z-index:' + duiWidget.data["Z-high"] + '} </style>').appendTo('head');

            $($this).on("click touchstart", "#clear", function () {
                dui.plumb_inst[dui.activeView].detachEveryConnection();
                duiWidget.data.opt = {};
                dui.saveRemote();
            });
            $($this).on("click touchstart", "#repaint", function () {
                dui.plumb_inst[dui.activeView].repaintEverything()
            });
            $($this).on("click touchstart", "#front", function () {
                $("#plumb_z").remove();
                $('<style id="plumb_z">._jsPlumb_endpoint {z-index: ' + duiWidget.data["Z-high"] + '}._jsPlumb_connector{z-index:' + duiWidget.data["Z-high"] + '}.plumb_wg{z-index:' + duiWidget.data["Z-high"] + '} </style>').appendTo('head');

                dui.plumb_inst[dui.activeView].repaintEverything()
            });
            $($this).on("click touchstart", "#back", function () {


                $("#plumb_z").remove();
                $('<style id="plumb_z">._jsPlumb_endpoint {z-index: ' + duiWidget.data["Z-low"] + '}._jsPlumb_connector{z-index:' + duiWidget.data["Z-low"] + '}.plumb_wg{z-index:' + duiWidget.data["Z-low"] + '} </style>').appendTo('head');

                dui.plumb_inst[dui.activeView].repaintEverything()
            });

        } else {
            $('<style id="plumb_z">._jsPlumb_endpoint {z-index: ' + duiWidget.data["Z-low"] + 1 + '}._jsPlumb_connector{z-index:' + duiWidget.data["Z-low"] + '}.plumb_wg{z-index:' + duiWidget.data["Z-low"] + '} </style>').appendTo('head');
//            HPS = PS;
            HPS = null;
//                HPS = {strokeStyle: "red", lineWidth: 2 }
            $($this).css({
                visibility: "hidden"
            });
            $($this).bind("filter_hide",function(){
                console.log("hide")
                $("#duiview_"+ dui.activeView).find(".plumb_wg, ._jsPlumb_connector").hide()
            });
            $($this).bind("filter_show",function(){
                $("#duiview_"+ dui.activeView).find(".plumb_wg, ._jsPlumb_connector").show()
            });
        }

        if (opt == undefined) {
            opt = {};
            duiWidget.data.opt = opt;
            dui.saveRemote();
        }

        $("#dui_container").on("rendert", "#duiview_" + dui.activeView, function () {

            jsPlumb.ready(function () {
                console.log("plumb ready");
                dui.plumb_inst[view] = jsPlumb.getInstance({
//                    PaintStyle: PS,
//                    HoverPaintStyle: HPS,
                    Container: "duiview_" + dui.activeView,
                    Connector: "Flowchart"
                });

                dui.plumb_inst[view].registerConnectionType("default", {
                    paintStyle: PS
                });

                if (dui.editMode) {
                    dui.plumb_inst[view].bind("dblclick", function (c) {
                        dui.plumb_inst[dui.activeView].detach(c)

                    });
                    dui.plumb_inst[view].bind("connectionDetached", function (c) {

                        delete duiWidget.data.opt[c.connection.id];
                        dui.saveRemote();
                    });
                    dui.plumb_inst[view].bind("connection", function (c) {
                        console.log(c);
                        duiWidget.data.opt[c.connection.id] = [c.sourceId, c.targetId];
                        dui.saveRemote();
                        console.log(duiWidget.data.opt)
                    });

                }

                console.log("plumb_phase1")
                $("#duiview_" + dui.activeView).trigger("plumb_phase1");

                console.log("plumb_phase2")
//              Phase 2
//              $("#duiview_" + dui.activeView).trigger("plumb_phase2");
                var cons = $.extend({}, duiWidget.data.opt);
                duiWidget.data.opt = {};
                $.each(cons, function () {
                    var c = dui.plumb_inst[view].connect({uuids: this});
                    c.setType("default");
                });

                console.log("plumb_phase3")
                $("#duiview_" + dui.activeView).trigger("plumb_phase3");

                console.log("plumb_phase4")
                $("#duiview_" + dui.activeView).trigger("plumb_phase4");

                console.log("plumb_phase5")
                $("#duiview_" + dui.activeView).trigger("plumb_phase5");
            });
        });
    },

    pumpe: function (el, data) {
        var $this = jQuery(el);
        var id = $($this).attr("id");
        var state = localData.uiState["_" + data.hm_id ].Value;
        if (dui.editMode) {

        } else {
            $($this).css({
                color: "transparent",
                border: "none",
                background: "none"

            });
        }
        function set_con(newVal) {


            var _con1 = dui.plumb_inst[dui.activeView].getConnections({source: id});
            var _con2 = dui.plumb_inst[dui.activeView].getConnections({target: id});
            var con = _con1.concat(_con2);
            if (newVal >= 1) {
                $.each(con, function (c) {
                    this.setType(id);
                    if (this.targetId == id) {
                        $("#" + this.sourceId).trigger("con_change", [id, this])
                    }
                    else {
                        $("#" + this.targetId).trigger("con_change", [id, this])
                    }
                });
            } else {
                $.each(con, function (c) {
                    this.setType("default");
                    if (this.targetId == id) {
                        $("#" + this.sourceId).trigger("con_change", ["default", this])
                    }
                    else {
                        $("#" + this.targetId).trigger("con_change", ["default", this])
                    }
                });
            }

        }

        function add_ep() {
            dui.plumb_inst[dui.activeView].registerConnectionType(id, {
                    paintStyle: {strokeStyle: data.standart, lineWidth: data.stroke  }
                }
            );
            dui.binds.plumb._add_endpoint(id);

            $($this).on("remove", function () {
                dui.plumb_inst[dui.activeView].deleteEndpoint(id)
            });

            $("#dui_container").on("moved resized", "#" + id, function () {
                dui.plumb_inst[dui.activeView].repaint(id)
            });
        }

        function bind_val() {
            localData.uiState.bind("_" + data.hm_id + ".Value", function (e, newVal) {
                state = newVal;
                set_con(newVal)
            });
        }

        function route() {
//          var cons = dui.plumb_inst[dui.activeView].getConnections(ep)
            var _con1 = dui.plumb_inst[dui.activeView].getConnections({source: id});
            var _con2 = dui.plumb_inst[dui.activeView].getConnections({target: id});
            var cons = _con1.concat(_con2);
            $($this).bind("con_change", function (e, type, con) {
                var num = parseFloat(state, 10);
                if (num > 0 || state === "true" || state === true) {
                    if (con.getType() == "default") {
                        con.setType(id);
                        if (con.targetId == id) {
                            $("#" + con.sourceId).trigger("con_change", [id, con])
                        }
                        else {
                            $("#" + con.targetId).trigger("con_change", [id, con])
                        }
                    }
                }
            })
        }

        if (dui.plumb_inst[dui.activeView]) {
            setTimeout(function () {
                add_ep();
                bind_val();
                set_con(localData.uiState["_" + data.hm_id + ".Value"]);
            }, 0);
        } else {

            $("#duiview_" + dui.activeView).bind("plumb_phase1", function () {
                add_ep()
            });
            $("#duiview_" + dui.activeView).bind("plumb_phase2", function () {

            });
            $("#duiview_" + dui.activeView).bind("plumb_phase3", function () {
                route()
            });
            $("#duiview_" + dui.activeView).bind("plumb_phase4", function () {
                bind_val()
            });
            $("#duiview_" + dui.activeView).bind("plumb_phase5", function () {
                set_con(state)
            });
        }
    },

    zp: function (el) {
        var $this = jQuery(el);
        var id = $($this).attr("id");
        var ep;
        if (dui.editMode) {

        } else {
            $($this).css({
                color: "transparent",
                border: "none",
                background: "none"

            });
        }

        function add_ep() {
            dui.binds.plumb._add_endpoint(id);

            $($this).on("remove", function () {
                dui.plumb_inst[dui.activeView].deleteEndpoint(id)
            });

            $("#dui_container").on("moved resized", "#" + id, function () {
                dui.plumb_inst[dui.activeView].repaint(id)
            });
        }

        function route() {
//          var cons = dui.plumb_inst[dui.activeView].getConnections(ep)
            var _con1 = dui.plumb_inst[dui.activeView].getConnections({source: id});
            var _con2 = dui.plumb_inst[dui.activeView].getConnections({target: id});
            var cons = _con1.concat(_con2);
            $($this).bind("con_change", function (e, type, con) {
                $.each(cons, function () {
                    if (this != con) {
                        this.setType(type);
                        if (this.targetId == id) {
                            $("#" + this.sourceId).trigger("con_change", [type, this])
                        }
                        else {
                            $("#" + this.targetId).trigger("con_change", [type, this])
                        }
                    } else {
//                        console.log("loop back")
                    }
                });
            })
        }

        if (dui.plumb_inst[dui.activeView]) {
            setTimeout(function () {
                add_ep();
                route()
            }, 0);
        } else {
            $("#duiview_" + dui.activeView).bind("plumb_phase1", function () {
                add_ep()
            });
            $("#duiview_" + dui.activeView).bind("plumb_phase3", function () {
                route()
            });
        }
    },

    zp_img: function (el, data) {
        var $this = jQuery(el);
        var id = $($this).attr("id");
        var ep;
        if (dui.editMode) {
            $($this).bind("rerender", function () {
                set_opt()
            })


        } else {

            $($this).find("img").hide()
        }

        function set_opt(){
            $($this).find("img").attr("src", data.image );
        }

        function add_ep() {
            dui.binds.plumb._add_endpoint(id, "Center");

            $($this).on("remove", function () {
                dui.plumb_inst[dui.activeView].deleteEndpoint(id )
            });

            $("#dui_container").on("moved resized", "#" + id, function () {
                dui.plumb_inst[dui.activeView].repaint(id)
            });
        }

        function route() {
//          var cons = dui.plumb_inst[dui.activeView].getConnections(ep)
            var _con1 = dui.plumb_inst[dui.activeView].getConnections({source: id});
            var _con2 = dui.plumb_inst[dui.activeView].getConnections({target: id});
            var cons = _con1.concat(_con2);
            $($this).bind("con_change", function (e, type, con) {
                $.each(cons, function () {
                    if (this != con) {
                        this.setType(type);
                        if (this.targetId == id) {
                            $("#" + this.sourceId).trigger("con_change", [type, this])
                        }
                        else {
                            $("#" + this.targetId).trigger("con_change", [type, this])
                        }
                    } else {
                    }
                });
                console.log(con.getType().toString())
                if(con.getType().toString() == "default"){
                    $("#" + id + "_img").hide()
                }else{
                    $("#" + id + "_img").show()
                }
            })

        }

        if (dui.plumb_inst[dui.activeView]) {
            setTimeout(function () {
                add_ep();
                route()
            }, 0);
        } else {
            $("#duiview_" + dui.activeView).bind("plumb_phase1", function () {
                add_ep()
            });
            $("#duiview_" + dui.activeView).bind("plumb_phase3", function () {
                route()
                $($this).find("img").attr("src", data.image );
            });
            $("#duiview_" + dui.activeView).bind("plumb_phase5", function () {
                set_image();
                set_opt();
            });
        }
    },

    zp_i_sprinkler: function (el, data) {
        var $this = jQuery(el);
        var id = $($this).attr("id");
        var ep;
        if (dui.editMode) {
            $($this).bind("rerender", function () {
                set_opt()
            })


        } else {

            $($this).find("img").hide()
        }

        function set_opt(){
            var time = data.time || 4;
            var start = data.start || 0;
            var end = data.ende || 180;
            var stroke = data.stroke || 10;

            $("#"+id+"_svg").remove();
            $("#"+id+"_body").append('\
                <svg\
                xmlns:svg="http://www.w3.org/2000/svg"\
                xmlns="http://www.w3.org/2000/svg"\
                width="100%"\
                height="100%"\
                viewBox="0 0 500 500"\
                id = "'+id+'_svg"\
                >\
                    <g>\
                        <circle cx="250" cy="250" r="'+stroke+'" fill="black"  />\
                        <path\
                        style="fill:none;stroke:blue; stroke-width:'+stroke+'px;stroke-linecap:round;stroke-opacity:0.5"\
                        d="m  250,250 0,-240"\
                        id="path2987"\
                        />\
                        <animateTransform id="t_one'+id+'"\
                        attributeName="transform"\
                        type="rotate"\
                        from="'+start+' 250 250" to="'+end+' 250 250"\
                        begin="0s ; t_two'+id+'.end" dur="'+time+'s"\
                        />\
                        <animateTransform id="t_two'+id+'"\
                        attributeName="transform"\
                        type="rotate"\
                        begin="t_one'+id+'.end" dur="'+time /3+'s"\
                        from="'+end+' 250 250" to="' +start+ ' 250 250"\
                        />\
                    </g>\
                </svg>\
            ')
        }

        function add_ep() {
            dui.binds.plumb._add_endpoint(id, "Center");

            $($this).on("remove", function () {
                dui.plumb_inst[dui.activeView].deleteEndpoint(id )
            });

            $("#dui_container").on("moved resized" , "#" + id, function () {
                dui.plumb_inst[dui.activeView].repaint(id)
            });
        }

        function route() {
//          var cons = dui.plumb_inst[dui.activeView].getConnections(ep)
            var _con1 = dui.plumb_inst[dui.activeView].getConnections({source: id});
            var _con2 = dui.plumb_inst[dui.activeView].getConnections({target: id});
            var cons = _con1.concat(_con2);
            $($this).bind("con_change", function (e, type, con) {
                $.each(cons, function () {
                    if (this != con) {
                        this.setType(type);
                        if (this.targetId == id) {
                            $("#" + this.sourceId).trigger("con_change", [type, this])
                        }
                        else {
                            $("#" + this.targetId).trigger("con_change", [type, this])
                        }
                    } else {
                    }
                });
                console.log(con.getType().toString())
                if(con.getType().toString() == "default"){
                    $("#" + id + "_img").hide()
                }else{
                    $("#" + id + "_img").show()
                }
            })

        }

        if (dui.plumb_inst[dui.activeView]) {
            setTimeout(function () {
                add_ep();
                route()
            }, 0);
        } else {
            $("#duiview_" + dui.activeView).bind("plumb_phase1", function () {
                add_ep()
            });
            $("#duiview_" + dui.activeView).bind("plumb_phase3", function () {
                route()
                $($this).find("img").attr("src", data.image );
            });
            $("#duiview_" + dui.activeView).bind("plumb_phase5", function () {

                set_opt();
            });
        }
    },

    zp_r_sprinkler: function (el, data) {
        var $this = jQuery(el);
        var id = $($this).attr("id");
        var ep;
        if (dui.editMode) {
            $($this).bind("rerender", function () {
                set_opt()
            })
        } else {

            $($this).find("img").hide()
        }

        function set_opt(){
            var time = data.time || 36;
            var start = data.start || 0;
            var end = data.ende || 180;
            var stroke = data.stroke || 10;


            var _turn_winkel = start * Math.PI / 180;
            var r = 250;
            var x1 =250+r * Math.sin(_turn_winkel);
            var y1 =250-r * Math.cos(_turn_winkel);
            var winkel_max = (start - end) * -1;
            var x2 =250+r * Math.sin(end* Math.PI / 180);
            var y2 =250-r * Math.cos(end* Math.PI / 180);

            if ((end - start) < 180) {

                var p = "M" + x1 + "," + y1 + " A" + r + "," + r + " 0 0,1 " + x2 + "," + y2 + "L 250 250 z";
            } else {
                var p = "M" + x1 + "," + y1 + " A" + r + "," + r + " 0 1,1 " + x2 + "," + y2 + " L 250 250 z"
            }

            $("#"+id+"_svg").remove();
            $("#"+id+"_body").append('\
                <svg\
                xmlns:svg="http://www.w3.org/2000/svg"\
                xmlns="http://www.w3.org/2000/svg"\
                id = "'+id+'_svg"\
                width="100%"\
                height="100%"\
                viewBox="0 0 500 500"\
                >\
           <clipPath id="starfoo">\
                <path d="'+p+'"/>\
                </clipPath>\
                    <g\
                     <g\
            transform="translate(0,0)" clip-path="url(#starfoo)">\
                        <g style="stroke:#0000ff;stroke-width:'+stroke+';stroke-linecap:round;stroke-opacity:0.5" >\
                            <path d="M 250,250 250,10"    />\
                            <path d="M 250,250 208,13.8"  />\
                            <path d="M 250,250 168,24.1"  />\
                            <path d="M 250,250 130,41.4"  />\
                            <path d="M 250,250 96.3,65.6" />\
                            <path d="M 250,250 67.3,95.6" />\
                            <path d="M 250,250 43.3,131"  />\
                            <path d="M 250,250 24.3,168"  />\
                            <path d="M 250,250 11.2,209"  />\
                            <path d="M 250,250 9.2,250"   />\
                            <path d="M 250,250 12.2,292"  />\
                            <path d="M 250,250 24.2,332"  />\
                            <path d="M 250,250 41.2,369"  />\
                            <path d="M 250,250 67.2,403"  />\
                            <path d="M 250,250 97.2,433"  />\
                            <path d="M 250,250 130,459"   />\
                            <path d="M 250,250 168,477"   />\
                            <path d="M 250,250 208,488"   />\
                            <path d="M 250,250 248,491"   />\
                            <path d="M 250,250 292,488"   />\
                            <path d="M 250,250 330,479"   />\
                            <path d="M 250,250 365,459"   />\
                            <path d="M 250,250 400,434"   />\
                            <path d="M 250,250 432,408"   />\
                            <path d="M 250,250 461,374"   />\
                            <path d="M 250,250 475,334"   />\
                            <path d="M 250,250 489,293"   />\
                            <path d="M 250,250 492,251"   />\
                            <path d="M 250,250 485,213"   />\
                            <path d="M 250,250 474,171"   />\
                            <path d="M 250,250 457,132"   />\
                            <path d="M 250,250 433,97.1"  />\
                            <path d="M 250,250 406,71"    />\
                            <path d="M 250,250 372,46"    />\
                            <path d="M 250,250 334,28"    />\
                            <path d="M 250,250 293,15"    />\
                                <animateTransform id="t_two" attributeName="transform" type="rotate" from="0 250 250" to=" 360 250 250" begin="0s" dur="'+time+'" repeatCount="indefinite"   />\
                        </g>\
                    </g>\
                    <circle cx="250" cy="250" r="8"  fill="black"  />\
                </svg>\
            ')
        }

        function add_ep() {
            dui.binds.plumb._add_endpoint(id, "Center");

            $($this).on("remove", function () {
                dui.plumb_inst[dui.activeView].deleteEndpoint(id )
            });

            $("#dui_container").on("moved resized" , "#" + id, function () {
                dui.plumb_inst[dui.activeView].repaint(id)
            });
        }

        function route() {
//          var cons = dui.plumb_inst[dui.activeView].getConnections(ep)
            var _con1 = dui.plumb_inst[dui.activeView].getConnections({source: id});
            var _con2 = dui.plumb_inst[dui.activeView].getConnections({target: id});
            var cons = _con1.concat(_con2);
            $($this).bind("con_change", function (e, type, con) {
                $.each(cons, function () {
                    if (this != con) {
                        this.setType(type);
                        if (this.targetId == id) {
                            $("#" + this.sourceId).trigger("con_change", [type, this])
                        }
                        else {
                            $("#" + this.targetId).trigger("con_change", [type, this])
                        }
                    } else {
                    }
                });
                console.log(con.getType().toString())
                if(con.getType().toString() == "default"){
                    $("#" + id + "_img").hide()
                }else{
                    $("#" + id + "_img").show()
                }
            })

        }

        if (dui.plumb_inst[dui.activeView]) {
            setTimeout(function () {
                add_ep();
                route()
            }, 0);
        } else {
            $("#duiview_" + dui.activeView).bind("plumb_phase1", function () {
                add_ep()
            });
            $("#duiview_" + dui.activeView).bind("plumb_phase3", function () {
                route()
                $($this).find("img").attr("src", data.image );
            });
            $("#duiview_" + dui.activeView).bind("plumb_phase5", function () {

                set_opt();
            });
        }
    },

    valve: function (el, data) {
        var $this = jQuery(el);
        var id = $($this).attr("id");
        var img_on = data["on"] || "widgets/plumb/img/valve_on.png";
        var img_off = data["off"] || "widgets/plumb/img/valve_off.png";
        var ep_left;
        var ep_right;
        var state = localData.uiState["_" + data.hm_id].Value;
        var cons;
        var last_con;

        if (dui.editMode) {
            $($this).bind("rerender", function () {
                set_opt();
            })
        }else{


        }

        $($this).find("img").attr("src", img_off);

        function set_opt() {
            if (data.ctrl) {
                $("#" + id + "_img").unbind("click touchstart").bind("click touchstart", function () {
                    console.log("click");
                    var num = parseFloat(state, 10);
                    if (num > 0 || state === "true" || state === true) {
                        localData.setValue(data.hm_id, 0);
                    } else {
                        localData.setValue(data.hm_id, 1);
                    }
                });
            } else {
                $("#" + id + "_img").unbind("click touchstart")
            }
            if (data.vertical) {
                ep_left.setAnchor("Top");
                ep_right.setAnchor("Bottom");
                $("#" + id + "_img").css("transform", "rotate(90deg)");
            }else{
                ep_left.setAnchor("Left");
                ep_right.setAnchor("Right");
                $("#" + id + "_img").css("transform", "rotate(0deg)");
            }
        }

        function add_ep() {
            ep_left = dui.binds.plumb._add_endpoint(id + "_l", "Left", 1);
            ep_right = dui.binds.plumb._add_endpoint(id + "_r", "Right", 1);
            $($this).on("remove", function () {
                dui.plumb_inst[dui.activeView].deleteEndpoint(id + "_l");
                dui.plumb_inst[dui.activeView].deleteEndpoint(id + "_r");
            });

            $("#dui_container").on("moved resized", "#" + id, function () {
                dui.plumb_inst[dui.activeView].repaint(id + "_l");
                dui.plumb_inst[dui.activeView].repaint(id + "_r");
            });
        }

        function bind_val() {
            localData.uiState.bind("_" + data.hm_id + ".Value", function (e, newVal) {
//                if (localData.uiState["_" + data.hm_id].Certain) {
                state = newVal;
                var num = parseFloat(state, 10);
                set_image()
                if (num > 0 || state === "true" || state === true) {
                    set_con_open();
                } else {
                    set_con_close()
                }
//                }
            });
        }

        function set_con_close() {

            var con0 = cons[0].getType().toString();
            var con1 = cons[1].getType().toString();

            if (last_con == cons[1] && con0 == con1 && con1 != "default") {

                cons[0].setType("default");
                if (cons[0].targetId == id + "_l" || cons[0].targetId == id + "_r") {
                    $("#" + cons[0].sourceId).trigger("con_change", ["default", cons[0]])
                }
                else {
                    $("#" + cons[0].targetId).trigger("con_change", ["default", cons[0]])
                }
            } else if (last_con == cons[0] && con0 == con1 && con0 != "default") {

                cons[1].setType("default");

                if (cons[1].targetId == id + "_l" || cons[1].targetId == id + "_r") {
                    $("#" + cons[1].sourceId).trigger("con_change", ["default", cons[1]])
                }
                else {
                    $("#" + cons[1].targetId).trigger("con_change", ["default", cons[1]])
                }
            }

        }

        function set_con_open() {
            var con0 = cons[0].getType().toString();
            var con1 = cons[1].getType().toString();

            if (last_con == cons[1] && con0 != con1) {
                cons[0].setType(con1);
                if (cons[0].targetId == id + "_l" || cons[0].targetId == id + "_r") {
                    $("#" + cons[0].sourceId).trigger("con_change", [con1, cons[0]])
                }
                else {
                    $("#" + cons[0].targetId).trigger("con_change", [con1, cons[0]])
                }
            } else if (last_con == cons[0] && con0 != con1) {
                console.log(2)
                cons[1].setType(con0);

                if (cons[1].targetId == id + "_l" || cons[1].targetId == id + "_r") {
                    $("#" + cons[1].sourceId).trigger("con_change", [con0, cons[1]])
                }
                else {
                    $("#" + cons[1].targetId).trigger("con_change", [con0, cons[1]])
                }
            }
        }


        function bind_con() {
            var _con1 = dui.plumb_inst[dui.activeView].getConnections({source: [id + "_l", id + "_r"]});
            var _con2 = dui.plumb_inst[dui.activeView].getConnections({target: [id + "_l", id + "_r"]});
            cons = _con1.concat(_con2);

            $($this).bind("con_change", function (e, type, con) {
                last_con = con;
                console.log(last_con.id)
                var num = parseFloat(state, 10);
                if (num > 0 || state === "true" || state === true) {
                    set_con_open()
                }
            })

        }

        function set_image() {
            var num = parseFloat(state, 10);
            if (num > 0 || state === "true" || state === true) {
                $("#" + id + "_img").attr("src", img_on)
            } else {
                $("#" + id + "_img").attr("src", img_off)
            }
        }


        if (dui.plumb_inst[dui.activeView]) {
            setTimeout(function () {
                add_ep();
                bind_val();
                bind_con()
            }, 0);
        } else {

            $("#duiview_" + dui.activeView).bind("plumb_phase1", function () {
                add_ep()
            });
            $("#duiview_" + dui.activeView).bind("plumb_phase2", function () {

            });
            $("#duiview_" + dui.activeView).bind("plumb_phase3", function () {

            });
            $("#duiview_" + dui.activeView).bind("plumb_phase4", function () {
                bind_val();
                bind_con();
            });
            $("#duiview_" + dui.activeView).bind("plumb_phase5", function () {
                set_image();
                set_opt();
            });
        }
    }


};