var hasTouch = 'ontouchend' in window, eventTimer;
var moveDirection = 'undefined', startX, startY, deltaX, deltaY, mouseDown = false;

function addTouchEvents(element){
    if (hasTouch) {
        element.addEventListener("touchstart", touch2Mouse, true);
        element.addEventListener("touchmove", touch2Mouse, true);
        element.addEventListener("touchend", touch2Mouse, true);
    }
}

function touch2Mouse(e)
{
    var theTouch = e.changedTouches[0];
    var mouseEv;

    switch(e.type)
    {
        case "touchstart": mouseEv="mousedown"; break;
        case "touchend":   mouseEv="mouseup"; break;
        case "touchmove":  mouseEv="mousemove"; break;
        default: return;
    }


    if (mouseEv == "mousedown") {
        eventTimer = (new Date()).getTime();
        startX = theTouch.clientX;
        startY = theTouch.clientY;
        mouseDown = true;
    }

    if (mouseEv == "mouseup") {
        if ((new Date()).getTime() - eventTimer <= 500) {
            mouseEv = "click";
        } else if ((new Date()).getTime() - eventTimer > 1000) {
            mouseEv = "longclick";
        }
        eventTimer = 0;
        mouseDown = false;
    }

    if (mouseEv == "mousemove") {
        if (mouseDown) {
            deltaX = theTouch.clientX - startX;
            deltaY = theTouch.clientY - startY;
            moveDirection = deltaX > deltaY ? 'horizontal' : 'vertical';
        }
    }

    var mouseEvent = document.createEvent("MouseEvent");
    mouseEvent.initMouseEvent(mouseEv, true, true, window, 1, theTouch.screenX, theTouch.screenY, theTouch.clientX, theTouch.clientY, false, false, false, false, 0, null);
    theTouch.target.dispatchEvent(mouseEvent);

    e.preventDefault();
}


(function( $ ) {
    $.widget("metro.tileTransform", {

        version: "1.0.0",

        options: {
        },

        _create: function(){
            var element = this.element;
            var dim = {w: element.width(), h: element.height()};

            element.on('mousedown.metroTransform', function(e){
                var X = e.pageX - $(this).offset().left, Y = e.pageY - $(this).offset().top;
                var transform = 'top';

                if (X < dim.w * 1/3 && (Y < dim.h * 1/2 || Y > dim.h * 1/2 )) {
                    transform = 'left';
                } else if (X > dim.w * 2/3 && (Y < dim.h * 1/2 || Y > dim.h * 1/2 )) {
                    transform = 'right'
                } else if (X > dim.w*1/3 && X<dim.w*2/3 && Y > dim.h/2) {
                    transform = 'bottom';
                }



                setTimeout(function ($this) {
                    $this.addClass("tile-transform-"+transform);
                }, 10, $(this));

            });

            element.on('mouseup.metroTransform', function(){


                setTimeout(function ($this) {
                    $this.removeClass("tile-transform-left")
                        .removeClass("tile-transform-right")
                        .removeClass("tile-transform-top")
                        .removeClass("tile-transform-bottom");
                }, 10, $(this));



            });
            element.on('mouseleave.metroTransform', function(){
                $(this)
                    .removeClass("tile-transform-left")
                    .removeClass("tile-transform-right")
                    .removeClass("tile-transform-top")
                    .removeClass("tile-transform-bottom");
            });
        },

        _destroy: function(){

        },

        _setOption: function(key, value){
            this._super('_setOption', key, value);
        }
    })

    $.widget("metro.inputControl", {

        version: "1.0.0",

        options: {
        },

        _create: function(){
            var that = this,
                control = this.element;

            if (control.hasClass('text')) {
                this.initTextInput(control, that);
            } else if (control.hasClass('password')) {
                this.initPasswordInput(control, that);
            } else if (control.hasClass('checkbox') || control.hasClass('radio') || control.hasClass('switch')) {
                this.initCheckboxInput(control, that);
            } else if (control.hasClass('file')) {
                this.initFileInput(control, that);
            }
        },

        initCheckboxInput: function(el, that) {
        },

        initFileInput: function(el, that){
            var button, input, wrapper;
            wrapper = $("<input type='text' id='__input_file_wrapper__' readonly style='z-index: 1; cursor: default;'>");
            button = el.children('.btn-file');
            input = el.children('input[type="file"]');
            input.css('z-index', 0);
            wrapper.insertAfter(input);
            input.attr('tabindex', '-1');
            //button.attr('tabindex', '-1');
            button.attr('type', 'button');

            input.on('change', function(){
                var val = $(this).val();
                if (val != '') {
                    wrapper.val(val);
                }
            });

            button.on('click', function(){
                input.trigger('click');
            });
        },

        initTextInput: function(el, that){
            var button = el.children('.btn-clear'),
                input = el.children('input[type=text]');

            //console.log(button.length);
            //button = el.children('.btn-clear');

            if (button.length == 0) return;

            button.attr('tabindex', '-1');
            button.attr('type', 'button');

            button.on('click', function(){
                input = el.children('input');
                if (input.prop('readonly')) return;
                input.val('');
                input.focus();
                that._trigger("onClear", null, el);
            });

            if (!input.attr("disabled")) input.on('click', function(){$(this).focus();});
        },

        initPasswordInput: function(el, that){
            var button = el.children('.btn-reveal'),
                input = el.children('input[type=password]');
            var wrapper;

            if (button.length == 0) return;

            button.attr('tabindex', '-1');
            button.attr('type', 'button');

            button.on('mousedown', function(e){
                input.attr('type', 'text');
                //e.preventDefault();

//                wrapper = el.find(".__wrapper__").length == 0 ? $('<input type="text" class="__wrapper__" />') : el.find(".__wrapper__");
//
//                input.hide();
//                wrapper.appendTo(that.element);
//                wrapper.val(input.val());
//
//                that._trigger("onPasswordShow", null, that.element);
            });

            button.on('mouseup, mouseleave, blur', function(e){
                input.attr('type', 'password').focus();
                //e.preventDefault();


//                input.show().focus();
//                wrapper.remove();
//
//                that._trigger("onPasswordHide", null, that.element);
            });

            if (!input.attr("disabled")) input.on('click', function(){$(this).focus();});
        },

        _destroy: function(){

        },

        _setOption: function(key, value){
            this._super('_setOption', key, value);
        }
    });

    $.widget("metro.inputTransform", {

        version: "1.0.0",

        options: {
            transformType: "text"
        },

        _create: function(){
            var that = this,
                element = this.element,
                inputType;


            var checkTransform = element.parent().hasClass("input-control");
            if (checkTransform) return;

            inputType = element.get(0).tagName.toLowerCase();

            if (inputType == "textarea") {
                this.options.transformType = "textarea";
            } else if (inputType == "select") {
                this.options.transformType = "select";
            } else {
                if (element.data('transformType') != undefined) {
                    this.options.transformType = element.data('transformType');
                } else {
                    this.options.transformType = element.attr("type");
                }
            }

            var control = undefined;

            switch (this.options.transformType) {
                case "password": control = this._createInputPassword(); break;
                case "file": control = this._createInputFile(); break;
                case "checkbox": control = this._createInputCheckbox(); break;
                case "radio": control = this._createInputRadio(); break;
                case "switch": control = this._createInputSwitch(); break;
                case "select": control = this._createInputSelect(); break;
                case "textarea": control = this._createInputTextarea(); break;
                case "search": control = this._createInputSearch(); break;
                case "email": control = this._createInputEmail(); break;
                case "tel": control = this._createInputTel(); break;
                case "number": control = this._createInputNum(); break;
                default: control = this._createInputText();
            }

            control.inputControl();
        },

        _createInputTextarea: function(){
            var element = this.element;

            var wrapper = $("<div/>").addClass("input-control").addClass("textarea");
            var clone = element.clone(true);
            var parent = element.parent();

            clone.appendTo(wrapper);
            wrapper.insertBefore(element);

            element.remove();

            return wrapper;
        },

        _createInputSelect: function(){
            var element = this.element;

            var wrapper = $("<div/>").addClass("input-control").addClass("select");
            var clone = element.clone(true);
            var parent = element.parent();

            clone.val(element.val()).appendTo(wrapper);
            wrapper.insertBefore(element);

            element.remove();

            return wrapper;
        },

        _createInputSwitch: function(){
            var element = this.element;

            var wrapper = $("<div/>").addClass("input-control").addClass("switch");
            var label  = $("<label/>");
            var button = $("<span/>").addClass("check");
            var clone = element.clone(true);
            var parent = element.parent();
            var caption = $("<span/>").addClass("caption").html( element.data('caption') != undefined ? element.data('caption') : "" );

            label.appendTo(wrapper);
            clone.appendTo(label);
            button.appendTo(label);
            caption.appendTo(label);

            wrapper.insertBefore(element);
            element.remove();

            return wrapper;
        },

        _createInputCheckbox: function(){
            console.log('checkbox!');
            var element = this.element;

            var wrapper = $("<div/>").addClass("input-control").addClass("checkbox");
            var label  = $("<label/>");
            var button = $("<span/>").addClass("check");
            var clone = element.clone(true);
            var parent = element.parent();
            var caption = $("<span/>").addClass("caption").html( element.data('caption') != undefined ? element.data('caption') : "" );

            label.appendTo(wrapper);
            clone.appendTo(label);
            button.appendTo(label);
            caption.appendTo(label);

            wrapper.insertBefore(element);
            element.remove();

            return wrapper;
        },

        _createInputRadio: function(){
            var element = this.element;

            var wrapper = $("<div/>").addClass("input-control").addClass("radio");
            var label  = $("<label/>");
            var button = $("<span/>").addClass("check");
            var clone = element.clone(true);
            var parent = element.parent();
            var caption = $("<span/>").addClass("caption").html( element.data('caption') != undefined ? element.data('caption') : "" );

            label.appendTo(wrapper);
            clone.appendTo(label);
            button.appendTo(label);
            caption.appendTo(label);

            wrapper.insertBefore(element);
            element.remove();

            return wrapper;
        },

        _createInputSearch: function(){
            return this._createInputVal("text", "btn-search");
        },

        _createInputNum: function(){
            return this._createInputVal("number", "btn-clear");
        },

        _createInputTel: function(){
            return this._createInputVal("tel", "btn-clear");
        },

        _createInputEmail: function(){
            return this._createInputVal("email", "btn-clear");
        },

        _createInputText: function(){
            return this._createInputVal("text", "btn-clear");
        },

        _createInputPassword: function(){
            return this._createInputVal("password", "btn-reveal");
        },

        _createInputFile: function(){
            return this._createInputVal("file", "btn-file");
        },

        _createInputVal: function(name, buttonName) {
            var element = this.element;

            var wrapper = $("<div/>").addClass("input-control").addClass(name);
            var button = $("<button/>").addClass(buttonName);
            var clone = element.clone(true);
            var parent = element.parent();

            clone.appendTo(wrapper);
            button.appendTo(wrapper);

            wrapper.insertBefore(element);
            element.remove();

            return wrapper;
        },

        _destroy: function(){},

        _setOption: function(key, value){
            this._super('_setOption', key, value);
        }
    });




/* To add touch support for element need create listeners for component dom element
 if (hasTouch) {
 element.addEventListener("touchstart", touch2Mouse, true);
 element.addEventListener("touchmove", touch2Mouse, true);
 element.addEventListener("touchend", touch2Mouse, true);
 }
 */


    $.widget("metro.metroSlider", {

        version: "1.0.2",



        options: {
            position: 0,
            accuracy: 0,
            color: 'default',
            completeColor: 'default',
            markerColor: 'default',
            colors: [],
            showHint: false,
            sliderActive: false,
            change: function(value, slider){},
            changed: function(value, slider){},
            min: 0,
            max: 100,
            animate: true,

            _slider: {
                vertical: false,
                offset: 0,
                length: 0,
                marker: 0,
                ppp: 0,
                start: 0,
                stop: 0
            }
        },


        _create: function(){
            var that = this,
                element = this.element,

                o = this.options,
                s = this.options._slider;

            if (element.data('accuracy') != undefined) {
                o.accuracy = element.data('accuracy') > 0 ? element.data('accuracy') : 0;
            }
            if (element.data('animate') != undefined) {
                o.animate = element.data('animate');
            }
            if (element.data('min') != undefined) {
                o.min = element.data('min');
            }
            o.min = o.min < 0 ? 0 : o.min;
            o.min = o.min > o.max ? o.max : o.min;
            if (element.data('max') != undefined) {
                o.max = element.data('max');
            }
            o.max = o.max > 100 ? 100 : o.max;
            o.max = o.max < o.min ? o.min : o.max;
            if (element.data('position') != undefined) {
                o.position = this._correctValue(element.data('position') > this.options.min ? (element.data('position') > this.options.max ? this.options.max : element.data('position')) : this.options.min);
            }
            if (element.data('color') != undefined) {
                o.color = element.data('color');
            }
            if (element.data('completeColor') != undefined) {
                o.completeColor = element.data('completeColor');
            }
            if (element.data('markerColor') != undefined) {
                o.markerColor = element.data('markerColor');
            }
            if (element.data('colors') != undefined) {
                o.colors = element.data('colors').split(",");
            }
            if (element.data('showHint') != undefined) {
                o.showHint = element.data('showHint');
            }

            s.vertical = element.hasClass("vertical");

            this._createSlider();
            setTimeout(function (_this, _that, _element) {
                _this._initPoints();
                _this._placeMarker(o.position);

                addTouchEvents(_element[0]);

                _element.children('.marker').on('mousedown.metroSlider', function (e) {
                    e.preventDefault();
                    _that._startMoveMarker(e);
                });

                _element.on('mousedown.metroSlider', function (e) {
                    e.preventDefault();
                    _that._startMoveMarker(e);
                });
            }, 0, this, that, element);

        },

        _startMoveMarker: function(e){
            var element = this.element, o = this.options, that = this, hint = element.children('.hint');
            that.sliderActive = true;
            $(document).on('mousemove.metroSlider', function (event) {
                that._movingMarker(event);
                if (!element.hasClass('permanent-hint')) {
                    hint.css('display', 'block');
                }
            });
            $(document).on('mouseup.metroSlider', function () {
                that.sliderActive = false;
                $(document).off('mousemove.metroSlider');
                $(document).off('mouseup.metroSlider');
                element.data('value', that.options.position);
                element.trigger('changed', that.options.position);
                o.changed(that.options.position, element);
                if (!element.hasClass('permanent-hint')) {
                    hint.css('display', 'none');
                }
            });

            this._initPoints();

            this._movingMarker(e)
        },

        _movingMarker: function (event) {
            var cursorPos,
                percents,
                valuePix,

                vertical = this.options._slider.vertical,
                sliderOffset = this.options._slider.offset,
                sliderStart = this.options._slider.start,
                sliderEnd = this.options._slider.stop,
                sliderLength = this.options._slider.length,
                markerSize = this.options._slider.marker;

            if (vertical) {
                cursorPos = event.pageY - sliderOffset;
            } else {
                cursorPos = event.pageX - sliderOffset;
            }

            if (cursorPos < sliderStart) {
                cursorPos = sliderStart;
            } else if (cursorPos > sliderEnd) {
                cursorPos = sliderEnd;
            }

            if (vertical) {
                valuePix = sliderLength - cursorPos - markerSize / 2;
            } else {
                valuePix = cursorPos - markerSize / 2;
            }

            percents = this._pixToPerc(valuePix);

            this._placeMarker(percents);

            this.options.position = percents;

            this.options.change(Math.round(percents), this.element);
        },

        _placeMarker: function (value) {
            var size, size2, o = this.options, colorParts = 0, colorIndex = 0, colorDelta = 0,
                marker = this.element.children('.marker'),
                complete = this.element.children('.complete'),
                hint = this.element.children('.hint'),
                oldPos = this._percToPix(this.options.position);

            colorParts = o.colors.length;
            colorDelta = o._slider.length / colorParts;

            if (this.options._slider.vertical) {
                var oldSize = this._percToPix(this.options.position) + this.options._slider.marker,
                    oldSize2 = this.options._slider.length - oldSize;
                size = this._percToPix(value) + this.options._slider.marker;
                size2 = this.options._slider.length - size;
                this._animate(marker.css('top', oldSize2),{top: size2});
                this._animate(complete.css('height', oldSize),{height: size});
                if (colorParts) {
                    colorIndex = Math.round(size / colorDelta)-1;
                    complete.css('background-color', o.colors[colorIndex<0?0:colorIndex]);
                }
                if (o.showHint) {
                    hint.html(Math.round(value)).css('top', size2 - hint.height()/2);
                }
            } else {
                size = this._percToPix(value);
                this._animate(marker.css('left', oldPos),{left: size});
                this._animate(complete.css('width', oldPos),{width: size});
                if (colorParts) {
                    colorIndex = Math.round(size / colorDelta)-1;
                    complete.css('background-color', o.colors[colorIndex<0?0:colorIndex]);
                }
                if (o.showHint) {
                    this._animate(hint.html(Math.round(value)).css('left', oldPos - hint.width() / 2), {left: size - hint.width() / 2});
                }
            }

        },

        _animate: function (obj, val) {
            if(this.options.animate) {
                obj.stop(true).animate(val);
            } else {
                obj.css(val);
            }
        },

        _pixToPerc: function (valuePix) {
            var valuePerc;
            valuePerc = valuePix * this.options._slider.ppp;
            return this._correctValue(valuePerc);
        },

        _percToPix: function (value) {
            if (this.options._slider.ppp === 0) {
                return 0;
            }
            return value / this.options._slider.ppp;
        },

        _correctValue: function (value) {
            var accuracy = this.options.accuracy;
            var max = this.options.max;
            var min = this.options.min;
            if (accuracy === 0) {
                return value;
            }
            if (value === max) {
                return max;
            }
            if (value === min) {
                return min;
            }
            value = Math.floor(value / accuracy) * accuracy + Math.round(value % accuracy / accuracy) * accuracy;
            if (value > max) {
                return max;
            }
            if (value < min) {
                return min;
            }
            return value;
        },

        _initPoints: function(){
            var s = this.options._slider, element = this.element;

            if (s.vertical) {
                s.offset = element.offset().top;
                s.length = element.height();
                s.marker = element.children('.marker').height();
            } else {
                s.offset = element.offset().left;
                s.length = element.width();
                s.marker = element.children('.marker').width();
            }
            s.ppp = this.options.max / (s.length - s.marker);
            s.start = s.marker / 2;
            s.stop = s.length - s.marker / 2;
        },

        _createSlider: function(){
            var element = this.element,
                options = this.options,
                complete, marker, hint;

            element.html('');

            complete = $("<div/>").addClass("complete").appendTo(element);
            marker = $("<a/>").addClass("marker").appendTo(element);

            if (options.showHint) {
                hint = $("<span/>").addClass("hint").appendTo(element);
            }

            if (options.color != 'default') {
                element.css('background-color', options.color);
            }
            if (options.completeColor != 'default') {
                complete.css('background-color', options.completeColor);
            }
            if (options.markerColor != 'default') {
                marker.css('background-color', options.markerColor);
            }
        },

        value: function (value) {
            if (this.sliderActive) return false;
            value = value > this.options.max ? this.options.max : value;
            value = value < this.options.min ? this.options.min : value;
            if (typeof value !== 'undefined') {
                this._placeMarker(parseInt(value));
                this.options.position = parseInt(value);
                //this.options.change(Math.round(parseInt(value)), this.element);
                return this;
            } else {
                return Math.round(this.options.position);
            }
        },

        _destroy: function(){},

        _setOption: function(key, value){
            this._super('_setOption', key, value);
        }
    });

    if (typeof METRO_DIALOG == "undefined") {
        var METRO_DIALOG = false;
    }

    $.metroDialog = function (params) {

        if (!$.metroDialog.opened) {
            $.metroDialog.opened = true;
        } else {
            return METRO_DIALOG;
        }

        $.metroDialog.settings = params;

        params = $.extend({
            icon: false,
            title: '',
            content: '',
            flat: false,
            shadow: false,
            overlay: false,
            width: 'auto',
            height: 'auto',
            position: 'default',
            padding: false,
            overlayClickClose: false,
            sysButtons: {
                btnClose: true
            },
            onShow: function(_dialog){},
            sysBtnCloseClick: function(event){},
            sysBtnMinClick: function(event){},
            sysBtnMaxClick: function(event){}
        }, params);

        var  _overlay, _window, _caption, _content;

        _overlay = $("<div/>").addClass("metro window-overlay");

        if (params.overlay) {
            _overlay.css({
                backgroundColor: 'rgba(0,0,0,.7)'
            });
        }

        _window = $("<div/>").addClass("window");
        if (params.flat) _window.addClass("flat");
        if (params.shadow) _window.addClass("shadow").css('overflow', 'hidden');
        _caption = $("<div/>").addClass("caption");
        _content = $("<div/>").addClass("content");
        _content.css({
            paddingTop: params.padding, // +32
            paddingLeft: params.padding,
            paddingRight: params.padding,
            paddingBottom: params.padding
        });

        if (params.sysButtons) {
            if (params.sysButtons.btnClose) {
                $("<button/>").addClass("btn-close").on('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    $.metroDialog.close();
                    params.sysBtnCloseClick(e);
                }).appendTo(_caption);
            }
            if (params.sysButtons.btnMax) {
                $("<button/>").addClass("btn-max").on('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    params.sysBtnMaxClick(e);
                }).appendTo(_caption);
            }
            if (params.sysButtons.btnMin) {
                $("<button/>").addClass("btn-min").on('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    params.sysBtnMinClick(e);
                }).appendTo(_caption);
            }
        }

        if (params.icon) $(params.icon).addClass("icon").appendTo(_caption);
        $("<div/>").addClass("title").html(params.title).appendTo(_caption);

        _content.html(params.content);

        _caption.appendTo(_window);
        _content.appendTo(_window);
        _window.appendTo(_overlay);

        if (params.width != 'auto') _window.css('width', params.width);
        if (params.height != 'auto') _window.css('height', params.height);

        _overlay.hide().appendTo('body').fadeIn('fast');

        METRO_DIALOG = _window;

        _window
            .css("position", "fixed")
            .css("z-index", parseInt(_overlay.css('z-index'))+1)
            .css("top", ($(window).height() - METRO_DIALOG.outerHeight()) / 2 )
            .css("left", ($(window).width() - _window.outerWidth()) / 2)
        ;

        addTouchEvents(_window[0]);

        if(params.draggable) {
            _caption.on("mousedown", function(e) {
                $.metroDialog.drag = true;
                _caption.css('cursor', 'move');

                var z_idx = _window.css('z-index'),
                    drg_h = _window.outerHeight(),
                    drg_w = _window.outerWidth(),
                    pos_y = _window.offset().top + drg_h - e.pageY,
                    pos_x = _window.offset().left + drg_w - e.pageX;

                _window.css('z-index', 99999).parents().on("mousemove", function(e) {
                    var t = (e.pageY > 0)?(e.pageY + pos_y - drg_h):(0);
                    var l = (e.pageX > 0)?(e.pageX + pos_x - drg_w):(0);

                    if ($.metroDialog.drag) {
                        if(t >= 0 && t <= window.innerHeight - _window.outerHeight()) {
                            _window.offset({top: t});
                        }
                        if(l >= 0 && l <= window.innerWidth - _window.outerWidth()) {
                            _window.offset({left: l});
                        }
                    }
                });
                e.preventDefault();
            }).on("mouseup", function () {
                    _window.removeClass('draggable');
                    $.metroDialog.drag = false;
                    _caption.css('cursor', 'default');
                });
        }

        _window.on('click', function (e){
            e.stopPropagation();
        });

        if (params.overlayClickClose) {
            _overlay.on('click', function (e){
                e.preventDefault();
                $.metroDialog.close();
            });
        }

        params.onShow(METRO_DIALOG);

        $.metroDialog.autoResize();

        return METRO_DIALOG;
    }

    $.metroDialog.content = function(newContent) {
        if(!$.metroDialog.opened || METRO_DIALOG == undefined) {
            return false;
        }

        if(newContent) {
            METRO_DIALOG.children(".content").html(newContent);
            $.metroDialog.autoResize();
            return true;
        } else {
            return METRO_DIALOG.children(".content").html();
        }
    }

    $.metroDialog.title = function(newTitle) {
        if(!$.metroDialog.opened || METRO_DIALOG == undefined) {
            return false;
        }

        var _title = METRO_DIALOG.children('.caption').children('.title');

        if(newTitle) {
            _title.html(newTitle);
        } else {
            _title.html();
        }

        return true;
    };

    $.metroDialog.autoResize = function () {
        if(!$.metroDialog.opened || METRO_DIALOG == undefined) {
            return false;
        }

        var _content = METRO_DIALOG.children(".content");

        var top = ($(window).height() - METRO_DIALOG.outerHeight()) / 2;
        var left = ($(window).width() - METRO_DIALOG.outerWidth()) / 2;

        METRO_DIALOG.css({
            width: _content.outerWidth(),
            height: _content.outerHeight(),
            top: top,
            left: left
        });

        return true;
    };

    $.metroDialog.close = function () {
        if(!$.metroDialog.opened || !METRO_DIALOG) {
            return false;
        }

        $.metroDialog.opened = false;
        var _overlay = METRO_DIALOG.parent(".window-overlay");
        _overlay.fadeOut(function () {
            $(this).remove();
            METRO_DIALOG = false;
        });

        return false;
    }
})(jQuery);
