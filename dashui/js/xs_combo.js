/** jQuery
 *
 *  xtreme simpel select
 *
 *  Copyright (c) 2014 Steffen Schorling http://github.com/smiling-Jack
 *  Lizenz: [CC BY-NC 3.0](http://creativecommons.org/licenses/by-nc/3.0/de/)
 */


(function ($) {
    $.fn.xs_combo = function (_options) {

        if (typeof _options == "string") {
            var text = $(this).children("span");
            $(text).text(_options);
            $(this).val(_options);
            $(this).trigger("change");
        } else if (_options == undefined) {
            return $(this).val();
        } else {

            var $this = this;

            var o = {
                cssButton: _options.cssButton || "ui-widget ui-state-default ui-corner-all " + (_options.addcssButton || ""),
                cssMenu: _options.cssMenu || "ui-widget-content ui-corner-all " + (_options.addcssMenu || ""),
                cssFocus: _options.cssFocus || "ui-state-focus ui-corner-all " + (_options.addcssFocus || ""),
                cssText: _options.cssText || "",
                width: _options.width || false,
                height: _options.height || false,
                data: _options.data || [],
                time: _options.time || 750,
                val: _options.val || "",
                combo: _options.combo
            };

            var liste = "";

            var timer;
            var readonly ="";

            if (!o.combo){
                readonly = "readonly=\"readonly\" onfocus=\"this.blur()\"";
            }
            $.each(o.data, function () {
                liste += ('<p class="' + o.cssText + '">' + this + '</p>')
            });

            this.addClass(o.cssButton);
            this.append('<input '+readonly +' style="border: none; background-color: transparent;padding-top: 0;padding-bottom: 0 ; height:100%; width: 100%;"  type="text" value="' + o.val + '" class="' + o.cssText + '"></input>');
            this.append('<div class="' + o.cssMenu + '">' + liste.toString() + '</div>');

            this.find("div").hide();
            text = this.children("input");
            var list = this.children("div");
            var list_elem = this.children("div").children("p");

            $(list_elem)
                .mouseenter(function () {
                    $(this).addClass(o.cssFocus);
                })
                .mouseleave(function () {
                    $(this).removeClass(o.cssFocus)
                })
                .click(function () {
                    $($this).val($(this).text());
                    $(text).val($(this).text());
                    $($this).trigger("change");
                    clearTimeout(timer);
                });
            $(this)
                .mouseenter(function () {
                    $(this).addClass(o.cssFocus)
                })
                .mouseleave(function () {
                    $(this).removeClass(o.cssFocus);
                    $(this).addClass(o.cssButton)
                })
                .click(function () {
                    clearTimeout(timer);
                });

            $(list)
                .mouseenter(function () {
                    clearTimeout(timer);
                })
                .mouseleave(function () {
                    timer = setTimeout(function () {
                        $(list).hide();
                    }, o.time)
                });

            this.click(function () {
                $(list).toggle();
            })
                .keydown(function(){
                    $(list).hide();
                });

            $($this).val(o.val);
            $(text).change(function(){
                $($this).val($(this).val());
                $($this).trigger("change");
            });
        }
    }

})(jQuery);