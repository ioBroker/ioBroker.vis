/**
 *  DashUI
 *  https://github.com/hobbyquaker/dashui/
 *
 *  Copyright (c) 2013-2014 hobbyquaker https://github.com/hobbyquaker, bluefox https://github.com/GermanBluefox
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */

dui.createDemoView = function () {
    dui.demoTranslate = function (text, arg) {
        if (!dui.demoWords) {
            dui.demoWords =  {
                'Bath'             : {'en': 'Bath',          'de': 'Badezimmer',           'ru': 'Ванная'},
                'Kitchen'          : {'en': 'Kitchen',       'de': 'Küche',                'ru': 'Кухня'},
                'Living room'      : {'en': 'Living room',   'de': 'Wohnzimmer',           'ru': 'Студия'},
                'Apartment'        : {'en': 'Apartment',     'de': 'Wohnung',              'ru': 'Квартира'},
                'WebCam'           : {'en': 'WebCam',        'de': 'IP Kamera',            'ru': 'Камера'},
                'Edit'             : {'en': 'Edit',          'de': 'Editieren',            'ru': 'Редактировать'},
                'Instruction'      : {
                    'en': 'Click here, Press Ctrl+A and \nthen "Del" to delete all widgets',
                    'de': 'Um alle Widgets zu löschen: \nklicke hier, \ndann drücke Strg+A and dann Löschtaste',
                    'ru': 'Что бы удалить все элементы: \nКликни сюда, \nнажми Ctrl+A и нажми Del'
                }
            };
        }

        if (dui.demoWords[text]) {
            var newText = dui.demoWords[text][dui.language];
            if (newText) {
                text = newText;
            } else {
                newText = dui.demoWords[text]["en"];
                if (newText) {
                    text = newText;
                }
            }
        }

        if (arg !== undefined) {
            text = text.replace('%s', arg);
        }
        return text;
    };

    var obj =
    {
        "settings" : {
            "style" : {
                "background_class": "hq-background-blue-marine-lines"
            },
            "theme" : "dhive",
            "sizex" : "1024",
            "sizey" : "748",
            "hideDescription" : false,
            "gridSize" : ""
        },
        "widgets" : {
            "w00001" : {
                "tpl" : "tplImage",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "src" : "img/eg_trans.png"
                },
                "style" : {
                    "left" : 266,
                    "top" : 40,
                    "width" : 761,
                    "height" : 727,
                    "z-index" : "0"
                },
                "widgetSet" : "basic"
            },
            "w00002" : {
                "tpl" : "tplTwYahooWeather",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "weoid" : "Miami, Miami-Dade, Florida, United States [2450022]"
                },
                "style" : {
                    "left" : 4,
                    "top" : 358,
                    "width" : 263,
                    "height" : 384
                },
                "widgetSet" : "timeAndWeather"
            },
            "w00003" : {
                "tpl" : "tplTwSimpleDate",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "prependZero" : "true",
                    "shortYear" : true,
                    "showWeekDay" : true,
                    "shortWeekDay" : true,
                    "shortMonth" : false,
                    "monthWord" : false
                },
                "style" : {
                    "left" : 46,
                    "top" : 0
                },
                "widgetSet" : "timeAndWeather"
            },
            "w00004" : {
                "tpl" : "tplTwSimpleClock",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "blink" : true,
                    "hideSeconds" : true
                },
                "style" : {
                    "left" : 18,
                    "top" : 22
                },
                "widgetSet" : "timeAndWeather"
            },
            "w00005" : {
                "tpl" : "tplFrame",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "title" : dui.demoTranslate("Apartment"),

                    "title_color" : "white",
                    "title_top" : "3",
                    "title_left" : "15",
                    "header_height" : "34",
                    "header_color" : "black",
                    "title_font" : "Arial"
                },
                "style" : {
                    "left" : 271,
                    "top" : 3,
                    "width" : 750,
                    "height" : 739,
                    "z-index" : "0",
                    "font-family" : "Arial",
                    "font-size" : "24px",
                    "font-weight" : "bold",
                    "border-radius" : "5px",
                    "border-width" : "2px"
                },
                "widgetSet" : "basic"
            },
            "w00006" : {
                "tpl" : "tplHqButton",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "hqoptions": "{\"x\":704,\"y\":346,\"radius\":22,\"zindex\":2,\"iconName\":\"Lamp.png\",\"room\":\"\",\"hm_id\":\"65555\",\"invertState\":false}"
                },
                "style" : {
                    "left" : 704,
                    "top" : 346
                },
                "widgetSet" : "hqWidgets",
                "renderVisible" : true
            },
            "w00007" : {
                "tpl" : "tplHqShutter",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "hqoptions": "{\"x\":692,\"y\":211,\"height\":52,\"width\":54,\"radius\":0,\"zindex\":3,\"buttonType\":3,\"windowConfig\":\"1\",\"room\":\"\",\"hm_id\":\"65555\",\"newVersion\":true,\"invertState\":false}"
                },
                "style" : {
                    "left" : 692,
                    "top" : 211,
                    "width" : 54,
                    "height" : 52
                },
                "widgetSet" : "hqWidgets",
                "renderVisible" : true
            },
            "w00008" : {
                "tpl" : "tplHqShutter",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "hqoptions": "{\"x\":767,\"y\":211,\"height\":118,\"width\":55,\"radius\":0,\"zindex\":3,\"buttonType\":3,\"windowConfig\":\"1\",\"room\":\"\",\"hm_id\":\"65555\",\"newVersion\":true,\"invertState\":false}"
                },
                "style" : {
                    "left" : 767,
                    "top" : 211,
                    "width" : 55,
                    "height" : 118
                },
                "widgetSet" : "hqWidgets",
                "renderVisible" : true
            },
            "w00009" : {
                "tpl" : "tplHqButton",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "hqoptions" : "{\"x\":484,\"y\":490,\"radius\":22,\"zindex\":2,\"iconName\":\"Lamp.png\",\"room\":\"\",\"hm_id\":\"65555\",\"invertState\":false}"
                },
                "style" : {
                    "left" : 484,
                    "top" : 490
                },
                "widgetSet" : "hqWidgets",
                "renderVisible" : true
            },
            "w00010" : {
                "tpl" : "tplHqButton",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "hqoptions" : "{\"x\":608,\"y\":617,\"radius\":22,\"zindex\":2,\"iconName\":\"Lamp.png\",\"room\":\"\",\"hm_id\":\"65555\",\"invertState\":false}"
                },
                "style" : {
                    "left" : 608,
                    "top" : 617
                },
                "widgetSet" : "hqWidgets",
                "renderVisible" : true
            },
            "w00011" : {
                "tpl" : "tplHtml",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "html" : dui.demoTranslate("Bath")

                },
                "style" : {
                    "left" : 367,
                    "top" : 346,
                    "font-family" : "Arial",
                    "font-size" : "24px",
                    "font-weight" : "bold",
                    "width" : 200,
                    "height" : 36
                },
                "widgetSet" : "basic"
            },
            "w00012" : {
                "tpl" : "tplHtml",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "html" : dui.demoTranslate("Kitchen")

                },
                "style" : {
                    "left" : 530,
                    "top" : 183,
                    "font-family" : "Arial",
                    "font-size" : "24px",
                    "font-weight" : "bold",
                    "width" : 200,
                    "height" : 36
                },
                "widgetSet" : "basic"
            },
            "w00013" : {
                "tpl" : "tplHtml",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "html" : dui.demoTranslate("Living room")

                },
                "style" : {
                    "left" : 600,
                    "top" : 471,
                    "font-family" : "Arial",
                    "font-size" : "24px",
                    "font-weight" : "bold",
                    "width" : 200,
                    "height" : 36
                },
                "widgetSet" : "basic"
            },
            "w00014" : {
                "tpl" : "tplImage",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "src" : "http://www.transferinrome.com/wp-content/uploads/2014/01/miami5.jpg"
                },
                "style" : {
                    "left" : 7,
                    "top" : 167,
                    "width" : 253,
                    "height" : 169
                },
                "widgetSet" : "basic"
            },
            "w00015" : {
                "tpl" : "tplFrame",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "title" : dui.demoTranslate("WebCam"),

                    "title_color" : "white",
                    "title_top" : "3",
                    "title_left" : "15",
                    "header_height" : "34",
                    "header_color" : "black",
                    "title_font" : "Arial"
                },
                "style" : {
                    "left" : 3,
                    "top" : 117,
                    "width" : 259,
                    "height" : 231,
                    "z-index" : "0",
                    "font-family" : "Arial",
                    "font-size" : "24px",
                    "font-weight" : "bold",
                    "border-radius" : "5px",
                    "border-width" : "2px"
                },
                "widgetSet" : "basic"
            },
            "w00016" : {
                "tpl" : "tplHtml",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "html" : dui.demoTranslate("Instruction")

                },
                "style" : {
                    "left" : 1044,
                    "top" : 87,
                    "font-family" : "Arial",
                    "width" : 280,
                    "height" : 65,
                    "color" : "red"
                },
                "widgetSet" : "basic"
            },
            "w00017" : {
                "tpl" : "tplHqOutTemp",
                "data" : {
                    "hm_id" : 65535,
                    "digits" : "",
                    "factor" : 1,
                    "min" : 0,
                    "max" : 1,
                    "step" : 0.01,
                    "hqoptions" : "{\"x\":582,\"y\":375,\"radius\":22,\"zindex\":2,\"buttonType\":2,\"iconName\":\"Temperature.png\",\"room\":\"\",\"hm_id\":\"65555\",\"hm_idH\":\"\",\"charts\":{\"navigator\":\"false\",\"percentaxis\":\"true\",\"period\":\"72\",\"theme\":\"\",\"range\":\"24\",\"scrollbar\":\"true\",\"grouping\":\"true\",\"legend\":\"inline\",\"zoom\":\"true\",\"loader\":\"false\"}}"
                },
                "style" : {
                    "left" : 582,
                    "top" : 375
                },
                "widgetSet" : "hqWidgets",
                "renderVisible" : true
            },
            "w00018": {
                "tpl": "tplJquiButtonLink",
                "data": {
                    "hm_id": 65535,
                    "digits": "",
                    "factor": 1,
                    "min": 0,
                    "max": 1,
                    "step": 0.01,
                    "buttontext": dui.demoTranslate("Edit"),
                    "href": "edit.html"
                },
                "style": {
                    "left": 1044,
                    "top": 150
                },
                "widgetSet": "jqui"
            }
        },
        "rerender" : false,
        "filterList" : []
    };
    return obj;
};