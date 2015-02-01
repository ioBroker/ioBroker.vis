/*!
 * jquery.sidebar v1.0.2
 * http://sideroad.secret.jp/
 *
 * Copyright (c) 2009 sideroad
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * Date: 2009-09-01
 */
(function( $, _window ) {
    $.fn.sidebar = function(options){

        return this.each(function(){
            var elem = $(this),
                data = elem.data("sidebar")||{},
                margin,
                width,
                height,
                duration = data.duration,
                injectWidth,
                injectHeight,
                injectCss,
                containerCss,
                bodyCss,
                position,
                enter,
                leave,
                opened,
                closed,
                isInnerElement,
                container = $("<div><div/>"),
                inject = $("<div><div/>"),
                body = $("<div><div/>"),
                root,
                parent,
                open = function(){
                    var data = elem.data("sidebar") || {},
                        opened = data.callback.sidebar.open,
                        container = data.container,
                        inject = data.inject,
                        body = data.body;
                    
                    if (data.isEnter || data.isProcessing) {
                        return;
                    }
                    data.isEnter = true;
                    data.isProcessing = true;
                    container.animate(data.animate.container.enter, {
                        duration: duration,
                        complete: function(){
                            inject.fadeOut(duration, function(){
                                body.show("clip", duration,function(){
                                    data.isProcessing = false;
                                    if(opened) {
                                        opened();
                                    }
                                });
                            });
                        }
                    });
                },
                close = function(){
                    var data = elem.data("sidebar") || {},
                        closed = data.callback.sidebar.close,
                        container = data.container,
                        inject = data.inject,
                        body = data.body;
                       
                    if(!data.isEnter || data.isProcessing ) {
                        return;
                    }
                    data.isProcessing = true;
                    container.animate(data.animate.container.leave, {
                        duration: duration,
                        complete: function(){
                            body.hide("clip", duration, function(){
                                inject.fadeIn(duration, function(){
                                    data.isEnter = false;
                                    data.isProcessing = false;
                                    if(closed) {
                                        closed();
                                    }
                                });
                            });
                        }
                    });
                };
            
            
            if(typeof options === "string"){
                switch(options){
                    case "open" :
                        open();
                        break;
                    case "close" : 
                        close();
                        break;
                }
                return;
            }
                
            //default setting
            options = $.extend(true, {
                root : $(document.body),
                position : "left",
				width:  400,
				height: 200,
				id: null,
                callback: {
                    item : {
                        enter : function(){
                            $(this).animate({marginLeft:"5px"},250);
                        },
                        leave : function(){
                            $(this).animate({marginLeft:"0px"},250);
                        }
                    },
                    sidebar : {
                        open : function(){
                            
                        },
                        close : function(){
                            
                        }
                    }
                },
                animate : {
                    container : {
                        enter : {},
                        leave : {}
                    }
                },
                duration : 200,
                open : "mouseenter.sidebar",
                close : "mouseleave.sidebar"
            }, options);
            
            root = options.root;
            isInnerElement = !root.is(document.body);
            parent = ( isInnerElement ) ? root.addClass("sidebar-root") : $(_window);
            
            position = options.position;
            duration = options.duration;
			
			// Use old container
			if (options.id != null) {
				$('#jquerySideBar_' + options.id).remove ();
			}
            
            container.attr("id", "jquerySideBar_" + ((options.id == null) ? (new Date().getTime()) : options.id)).addClass("sidebar-container").addClass(position);
            inject.addClass("sidebar-inject").addClass(position);
            body.addClass("sidebar-body");
            
            //append to body
			body.append(this);
				
			container.css ({width: options.width, height: options.height});
            container.append(body);
            container.append(inject);
            root.append(container);
			
            width = container.width();
            height = container.height();
            injectWidth = inject.width();
            injectHeight = inject.height();
            
            containerCss = {
                height: height,
                width: width
            };
            bodyCss = {
                height: height,
                width: width
            };
            
            if (position === "left" || position === "right") {
                margin = width - injectWidth;
                injectCss = {
                    height : height,
                    width : injectWidth
                };
                containerCss.top = options.top || (parent.height()/2) - (height/2) + "px";
                
            } else {
                margin = height - injectHeight;
                injectCss = {
                    height : injectHeight,
                    width : width
                };
                containerCss.left = options.left || (parent.width()/2) - (width/2) + "px";
            }
            
            containerCss[position] = "-" + margin + "px";
            injectCss[position] = margin + "px";
            options.animate.container.enter[position] = 0;
            options.animate.container.leave[position] = "-" + margin;
            
            //container
            container.css(containerCss);
            
            //inject
            inject.css(injectCss);
            
            //body
            body.css(bodyCss).hide();
                        
            //container events
            if(options.open) {
                container.bind(options.open,open);
            }
            if(options.close) {
                container.bind(options.close,close);
            }
            
            //store data
            options.container = container;
            options.inject = inject;
            options.body = body;
            elem.data("sidebar", options);
            
            $(window).resize(function(){
                if(position === "left" || position === "right") {
                    container.css({top:($(this).height()/2) - (height/2) + "px"});
                } else {
                    container.css({left:($(this).width()/2) - (width/2) + "px"});
                }
            });
            
        });
    };
}(jQuery, this));
