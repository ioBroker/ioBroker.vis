/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2013-2022 bluefox https://github.com/GermanBluefox,
 *  Copyright (c) 2013-2014 hobbyquaker https://github.com/hobbyquaker
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */
/* jshint browser:true */
/* global _ */
/* global $ */
/* global systemDictionary */
/* global vis:true */
/* jshint -W097 */// jshint strict:false

'use strict';

$.extend(systemDictionary, {
    'Bath'             : {"en": 'Bath',         "de": 'Badezimmer',         "ru": 'Ванная'},
    'Kitchen'          : {"en": 'Kitchen',      "de": 'Küche',              "ru": 'Кухня'},
    'Living room'      : {"en": 'Living room',  "de": 'Wohnzimmer',         "ru": 'Студия'},
    'Apartment'        : {"en": 'Apartment',    "de": 'Wohnung',            "ru": 'Квартира'},
    'WebCam'           : {"en": 'WebCam',       "de": 'IP Kamera',          "ru": 'Камера'},
    'Edit'             : {"en": 'Edit',         "de": 'Editieren',          "ru": 'Редактировать'},
    'Click here, Press Ctrl+A and then "Del" to<br>delete all widgets'      : {
        "en": 'Click here, Press Ctrl+A and then "Del" to<br>delete all widgets',
        "de": 'Um alle Widgets zu löschen:<br>klicke hier,<br>dann drücke Strg+A and dann Löschtaste',
        "ru": 'Что бы удалить все элементы:<br>Кликни сюда,<br>нажми Ctrl+A и нажми Del'
    },
    "OFF":              {"en": "OFF",           "de": "AUS",                "ru": "ВЫКЛ"},
    "ON":               {"en": "ON",            "de": "AN",                 "ru": "ВКЛ"},
    "Click me!":        {"en": "Click me!",     "de": "Klick mich!",        "ru": "Нажми!"},
    "off":              {"en": "off",           "de": "aus",                "ru": "выкл"},
    "on":               {"en": "on",            "de": "an",                 "ru": "вкл"},
    "light":            {"en": "light",         "de": "Licht",              "ru": "Свет"},
    "Outside":          {"en": "Outside",       "de": "Außen",              "ru": "Снаружи"},
    "You can install more widget-sets and icon-sets (over 20)": {
        "en": "You can install more widget-sets and icon-sets (over 20)",
        "de": "Es können auch weiter schöne Widgets und Icons installiert werden (über 20)",
        "ru": "Можно установить другие наборы элементов и картинки (свыше 20ти)"
    },
    "Filter:":          {"en": "Filter:",       "de": "Filter:",            "ru": "Фильтр:"}
});
vis.createDemoView = function () {

    var obj =
    {
        "settings": {
            "style": {
                "background_class": "hq-background-blue-marine-lines"
            },
            "theme": "redmond",
            "sizex": "1024",
            "sizey": "748",
            "hideDescription": false,
            "gridSize": ""
        },
        "widgets": {
            "w00001": {
                "tpl": "tplImage",
                "data": {
                    "src": "img/eg_trans.png",
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "refreshInterval": "0",
                    "refreshOnWakeUp": "false",
                    "refreshOnViewChange": "false",
                    "locked": true
                },
                "style": {
                    "left": "5px",
                    "top": "3px",
                    "width": 761,
                    "height": 727,
                    "z-index": "0"
                },
                "widgetSet": "basic"
            },
            "w00002": {
                "tpl": "tplBulbOnOffCtrl",
                "data": {
                    "oid": "dev1",
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "icon_off": "img/bulb_off.png",
                    "icon_on": "img/bulb_on.png",
                    "readOnly": true,
                    "filterkey": _("light"),
                    "name": "Sleeping Room Status"
                },
                "style": {
                    "left": "335.5px",
                    "top": "457px",
                    "z-index": "1",
                    "box-shadow": "0 0 30px 10px #4575b5",
                    "border-radius": "40px",
                    "background-color": "#4575b5",
                    "width": "55px",
                    "height": "57px"
                },
                "widgetSet": "basic"
            },
            "w00004": {
                "tpl": "tplBulbOnOffCtrl",
                "data": {
                    "oid": "dev2",
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "icon_off": "img/bulb_off.png",
                    "icon_on": "img/bulb_on.png",
                    "filterkey": _("light"),
                    "name": "Bath Control"
                },
                "style": {
                    "left": "185px",
                    "top": "317px",
                    "z-index": "1",
                    "box-shadow": "0 0 30px 10px #4575b5",
                    "border-radius": "40px",
                    "background-color": "#4575b5",
                    "width": "55px",
                    "height": "57px"
                },
                "widgetSet": "basic"
            },
            "w00005": {
                "tpl": "tplBulbOnOffCtrl",
                "data": {
                    "oid": "dev3",
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "icon_off": "img/bulb_off.png",
                    "icon_on": "img/bulb_on.png",
                    "filterkey": _("light"),
                    "name": "Living Room Status"
                },
                "style": {
                    "left": "417px",
                    "top": "261px",
                    "z-index": "1",
                    "background-color": "#4575b5",
                    "border-radius": "40px",
                    "width": "55px",
                    "height": "57px",
                    "box-shadow": "0 0 30px 10px #4575b5"
                },
                "widgetSet": "basic"
            },
            "w00009": {
                "tpl": "tplJquiRadio",
                "data": {
                    "oid": "dev1",
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "off_text": _("OFF"),
                    "on_text": _("ON"),
                    "padding": "5",
                    "filterkey": _("light"),
                    "name": "Sleeping Room Control"
                },
                "style": {
                    "left": "287px",
                    "top": "523px",
                    "z-index": "1",
                    "border-radius": "5px"
                },
                "widgetSet": "jqui"
            },
            "w00008": {
                "tpl": "tplHtml",
                "data": {
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "refreshInterval": "0",
                    "html": "<style>\n.blink {\n  animation: blinker 5s linear infinite;\n}\n\n@keyframes blinker {  \n  50% { opacity: 0.0; \n}\n}\n</style>\n\n<div class=\"blink\">" + _("Click me!") + "</div>",
                    "filterkey": _("light"),
                    "name": "Click me"
                },
                "style": {
                    "left": 177,
                    "top": 367,
                    "width": "74px",
                    "height": "17px",
                    "font-family": "Arial, sans-serif",
                    "color": "#001bf5",
                    "font-weight": "bold",
                    "z-index": "1"
                },
                "widgetSet": "basic"
            },
            "w00010": {
                "tpl": "tplJquiButtonState",
                "data": {
                    "oid": "dev3",
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "buttontext": _("off"),
                    "value": "0",
                    "filterkey": _("light"),
                    "name": "Living Room Off"
                },
                "style": {
                    "left": "327px",
                    "top": "271px",
                    "z-index": "1",
                    "border-radius": "5px"
                },
                "widgetSet": "jqui"
            },
            "w00011": {
                "tpl": "tplJquiButtonState",
                "data": {
                    "oid": "dev3",
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "buttontext": _("on"),
                    "value": "1",
                    "filterkey": _("light"),
                    "name": "Living Room On"
                },
                "style": {
                    "left": "475px",
                    "top": "271px",
                    "z-index": "1",
                    "border-radius": "5px"
                },
                "widgetSet": "jqui"
            },
            "w00012": {
                "tpl": "tplJquiSlider",
                "data": {
                    "oid": "dev4",
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "min": "0",
                    "max": "100",
                    "filterkey":_( "data"),
                    "name": "Demo Slider"
                },
                "style": {
                    "left": "563px",
                    "top": "701px",
                    "z-index": "1"
                },
                "widgetSet": "jqui"
            },
            "w00013": {
                "tpl": "tplValueFloat",
                "data": {
                    "oid": "demoTemperature",
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "is_comma": "true",
                    "factor": "1",
                    "html_append_singular": " C°",
                    "html_append_plural": " C°",
                    "filterkey":_( "data"),
                    "name": "Outside Temperature"
                },
                "style": {
                    "left": "695px",
                    "top": "47px",
                    "width": "66px",
                    "height": "17px",
                    "z-index": "2",
                    "font-family": "Arial, Helvetica, sans-serif",
                    "text-shadow": "",
                    "color": "#ffffff"
                },
                "widgetSet": "basic"
            },
            "w00015": {
                "tpl": "tplValueFloat",
                "data": {
                    "oid": "demoHumidity",
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "is_comma": "true",
                    "factor": "1",
                    "html_append_singular": " %",
                    "html_append_plural": " %",
                    "filterkey":_( "data"),
                    "name": "Outside Humidity"
                },
                "style": {
                    "left": "695px",
                    "top": "66px",
                    "width": "66px",
                    "height": "17px",
                    "z-index": "2",
                    "font-family": "Arial, Helvetica, sans-serif",
                    "color": "#ffffff"
                },
                "widgetSet": "basic"
            },
            "w00016": {
                "tpl": "tplValueFloatBar",
                "data": {
                    "oid": "dev4",
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "min": "0",
                    "max": "100",
                    "orientation": "horizontal",
                    "color": "blue",
                    "filterkey":_( "data"),
                    "name": "Demo Bar"
                },
                "style": {
                    "left": "560px",
                    "top": "672px",
                    "width": "164px",
                    "height": "18px",
                    "z-index": "1"
                },
                "widgetSet": "basic"
            },
            "w00014": {
                "tpl": "tplValueString",
                "data": {
                    "oid": "dev4",
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "filterkey":_( "data"),
                    "name": "Demo Text"
                },
                "style": {
                    "left": "616px",
                    "top": "674px",
                    "z-index": "2",
                    "text-align": "center",
                    "color": "#ffffff",
                    "font-family": "Arial, sans-serif"
                },
                "widgetSet": "basic"
            },
            "w00017": {
                "tpl": "tplFilterDropdown",
                "data": {
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "filters": _("light") + ";data",
                    "filterkey": _("light") + ";" + ("data"),
                    "name": "Filter selector"
                },
                "style": {
                    "left": "76px",
                    "top": "47px",
                    "width": "103px",
                    "height": "22px"
                },
                "widgetSet": "basic"
            },
            "w00019": {
                "tpl": "tplImage",
                "data": {
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "refreshInterval": "30000",
                    "refreshOnWakeUp": "false",
                    "refreshOnViewChange": "false",
                    "src": "http://www.kernspin-lindau.de/images/Bodensee2.jpg",
                    "name": "Webcam Image"
                },
                "style": {
                    "left": "5px",
                    "top": "599px",
                    "border-width": "3px",
                    "border-style": "ridge",
                    "border-color": "#ccfaff",
                    "border-radius": "5px"
                },
                "widgetSet": "basic"
            },
            "w00018": {
                "tpl": "tplHtml",
                "data": {
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "refreshInterval": "0",
                    "html": _("WebCam"),
                    "name": "WebCam Label"
                },
                "style": {
                    "left": "7px",
                    "top": "576px",
                    "width": "152px",
                    "height": "19px",
                    "color": "#ffffff",
                    "font-family": "Arial, sans-serif",
                    "font-size": "large",
                    "font-weight": "bold"
                },
                "widgetSet": "basic"
            },
            "w00020": {
                "tpl": "tplFrame",
                "data": {
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "title": _("Outside"),
                    "title_color": "#ffffff",
                    "title_top": "0",
                    "title_left": "15",
                    "header_height": "17",
                    "header_color": "#5297ff",
                    "name": "Frame Temperature"
                },
                "style": {
                    "left": "677px",
                    "top": "26px",
                    "width": "85px",
                    "height": "58px",
                    "background-color": "#0067d6",
                    "font-family": "Arial, sans-serif",
                    "z-index": "1",
                    "border-radius": "5px"
                },
                "widgetSet": "basic"
            },
            "w00021": {
                "tpl": "tplHtml",
                "data": {
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "refreshInterval": "0",
                    "html": _("You can install more widget-sets and icon-sets (over 20)"),
                    "name": "Comment"
                },
                "style": {
                    "left": "50%",
                    "top": "calc(100% - 50px)",
                    "width": "50%",
                    "height": "42px",
                    "color": "#ffffff",
                    "font-family": "Arial, sans-serif"
                },
                "widgetSet": "basic"
            },
            "w00022": {
                "tpl": "tplHtml",
                "data": {
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "refreshInterval": "0",
                    "html": _("Filter:"),
                    "name": "Label Filter"
                },
                "style": {
                    "left": "14px",
                    "top": "48px",
                    "width": "60px",
                    "height": "17px",
                    "color": "#ffffff",
                    "font-family": "Arial, sans-serif"
                },
                "widgetSet": "basic"
            },
            "w00023": {
                "tpl": "tplRedNumber",
                "data": {
                    "oid": "dev4",
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "type": "circle",
                    "name": "Demo RedNumber"
                },
                "style": {
                    "left": "732px",
                    "top": "668px"
                },
                "widgetSet": "basic"
            },
            "w00028": {
                "tpl": "tplHtml",
                "data": {
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "refreshInterval": "0",
                    "html": _("Living room"),
                    "name": "Living room Label"
                },
                "style": {
                    "left": "310px",
                    "top": "422px",
                    "width": "152px",
                    "height": "19px",
                    "color": "#000000",
                    "font-size": "large",
                    "font-weight": "bold",
                    "font-family": "Arial, Helvetica, sans-serif"
                },
                "widgetSet": "basic"
            },
            "w00029": {
                "tpl": "tplHtml",
                "data": {
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "refreshInterval": "0",
                    "html": _("Kitchen"),
                    "name": "Kitchen Label"
                },
                "style": {
                    "left": "352px",
                    "top": "222px",
                    "width": "152px",
                    "height": "19px",
                    "color": "#000000",
                    "font-size": "large",
                    "font-weight": "bold",
                    "font-family": "Arial, Helvetica, sans-serif"
                },
                "widgetSet": "basic"
            },
            "w00030": {
                "tpl": "tplHtml",
                "data": {
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "refreshInterval": "0",
                    "html": _("Bath"),
                    "name": "Bath Label"
                },
                "style": {
                    "left": "91px",
                    "top": "324px",
                    "width": "108px",
                    "height": "19px",
                    "color": "#000000",
                    "font-size": "large",
                    "font-weight": "bold",
                    "font-family": "Arial, Helvetica, sans-serif"
                },
                "widgetSet": "basic"
            },
            "w00031": {
                "tpl": "tplHtml",
                "data": {
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "refreshInterval": "0",
                    "html": _("Apartment"),
                    "name": "Apartment Label"
                },
                "style": {
                    "left": "11px",
                    "top": "5px",
                    "width": "162px",
                    "height": "32px",
                    "color": "#c7c7c7",
                    "font-size": "2em",
                    "font-weight": "bold",
                    "font-family": "Arial, Helvetica, sans-serif"
                },
                "widgetSet": "basic"
            },
            "w00032": {
                "tpl": "tplJquiButtonLink",
                "data": {
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "buttontext": _("Edit"),
                    "padding": "0",
                    "href": "/vis/edit.html#DemoView"
                },
                "style": {
                    "left": "calc(100% - 200px)",
                    "top": "5px"
                },
                "widgetSet": "jqui"
            },
            "w00033": {
                "tpl": "tplHtml",
                "data": {
                    "visibility-cond": "==",
                    "visibility-val": 1,
                    "refreshInterval": "0",
                    "html": _("Click here, Press Ctrl+A and then \"Del\" to<br>delete all widgets"),
                    "name": "Comment"
                },
                "style": {
                    "left": "9px",
                    "top": "159px",
                    "width": "173px",
                    "height": "90px",
                    "color": "#ffffff",
                    "font-family": "Arial, sans-serif"
                },
                "widgetSet": "basic"
            }

        },
        "rerender": false,
        "filterList": [
            _("light"),
           _( "data")
        ],
        "activeWidgets": []
    };
    return obj;
};
