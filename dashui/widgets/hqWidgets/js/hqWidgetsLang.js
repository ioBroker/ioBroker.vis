/*
hqWidgets is a "high quality" home automation widgets library.
You can easy create the user interface for home automation with the help of this library using HTML, javascript and CSS.
 
The library supports desktop and mobile browsers versions.
Actually library has following widgets:
- On/Off Button - To present and/or control some switch (e.g. Lamp)
- Dimmer - To present and control dimmer
- Window blind - to present and control one blind and display up to 4 window leafs
- Indoor temperature - to display indoor temperature and humidity with desired temperature and valve state
- Outdoor temperature - to display outdoor temperature and humidity
- Door   - to present a door
- Lock   - to present and control lock
- Image  - to show a static image
- Text   - to show a static text with different colors and font styles
- Info   - To display some information. Supports format string, condition for active state and different icons for active and static state.
 
------ Version V0.1 ------
 
 
----
Used software and icons:
* jQuery http://jquery.com/
* jQuery UI http://jqueryui.com/
* door bell by Lorc http://lorcblog.blogspot.de/


 Copyright (c) 2013 Bluefox dogafox@gmail.com
 
It is licensed under the Creative Commons Attribution-Non Commercial-Share Alike 3.0 license.
The full text of the license you can get at http://creativecommons.org/licenses/by-nc-sa/3.0/legalcode
 
Short content:
Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
Licensees may distribute derivative works only under a license identical to the license that governs the original work.
Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
(Free for non-commercial use).
*/

hqWidgets = $.extend (hqWidgets, {
    translate: function (text) {
        if (!this.words) {
            this.words = {
                "IP Camera"                 : {"en": "IP Camera",       "de": "IP Kamera",             "ru": "IP Камера"},
                "Description:"              : {"en": "Description:",    "de": "Beschreibung:",         "ru": "Описание:"},
                "Close"                     : {"en": "Hide",            "de": "Abbrechen",             "ru": "Отмена"},
                "Advanced..."               : {"en": "Advanced...",     "de": "Erweitert...",          "ru": "Продвинутые..."},
                "Pop up delay (ms):"        : {"en": "Pop up delay (ms):", "de": "Verzogerung (ms)",   "ru": "Задержка закрытия (мс):"},
                "Open door button:"         : {"en": "Open door button:",  "de": "'Tur aufmachen' Knopf:", "ru": "Кнопка 'Открыть дверь':"},
                "Small image update(sec):"  : {"en": "Small image update(sec):",    "de": "Kleines Bild erneuern(Sek):", "ru": "Обновлять миниатюру (сек):"},
                "Open door text:"           : {"en": "Open door text:", "de": "Knopfbeschrieftung:",   "ru": "Текст кнопки"},
                "Open lock"                 : {"en": "Open",            "de": "Aufmachen",             "ru": "Открыть"},
                "Open the door?"            : {"en": "Open the door?",  "de": "Tur aufmachen?",        "ru": "Открыть дверь?"},
                "Simulate click"            : {"en": "Simulate click",  "de": "Simuliere Click",       "ru": "Тестовое нажатие"},
                "Test state"                : {"en": "Test state",      "de": "Zustand testen",        "ru": "Прперить состояние"},
                "Last action:"              : {"en": "Last action:",    "de": "Lezte Status&auml;nderung:",    "ru": "Последнее изменение:"},
                "Do not show"               : {"en": "Do not show",     "de": "Nicht zeigen",          "ru": "Не показывать"},
                "Show always"               : {"en": "Show always",     "de": "Immer zeigen",          "ru": "Всегда показывать"},
                "Hide after 1 hour"         : {"en": "Hide after 1 hour",  "de": "Ausblenden nach 1 Stunde",   "ru": "Скрыть через 1 час"},
                "Hide after 2 hours"        : {"en": "Hide after 2 hours", "de": "Ausblenden nach 2 Stunden",  "ru": "Скрыть через 2 часа"},
                "Hide after 6 hours"        : {"en": "Hide after 6 hours", "de": "Ausblenden nach 6 Stunden",  "ru": "Скрыть через 6 часов"},
                "Hide after 12 hours"       : {"en": "Hide after 12 hours","de": "Ausblenden nach 12 Stunden", "ru": "Скрыть через 12 часов"},
                "Hide after 1 day"          : {"en": "Hide after 1 day",   "de": "Ausblenden nach 1 Tag",      "ru": "Скрыть через 1 день"},
                "Hide after 2 days"         : {"en": "Hide after 2 days",  "de": "Ausblenden nach 2 Tagen",    "ru": "Скрыть через 2 дня"},
                "Battery problem"           : {"en": "Battery problem", "de": "Akku-Problem",          "ru": "Проблема батарейки"},
                "Test state:"               : {"en": "Test state:",     "de": "Zustand antesten:",     "ru": "Протестировать состояние:"},
                "Icon:"                     : {"en": "Icon:",           "de": "Kleinbild:",            "ru": "Миниатюра:"},
                "Styles..."                 : {"en": "Styles...",       "de": "Stil...",               "ru": "Стили..."},
                "jQuery Styles:"            : {"en": "Use jQuery Styles:","de": "jQuery Stil anwenden:","ru": "Применить jQuery стили:"},
                "Radius:"                   : {"en": "Border Radius:",  "de": "Eckenradius:",          "ru": "Радиус закруглений:"},
                "No animation:"             : {"en": "No animation:",   "de": "Keine Animation:",      "ru": "Без анимации:"},
                "Font:"                     : {"en": "Font:",           "de": "Font:",                 "ru": "Шрифт:"},
                "Slide count:"              : {"en": "Slide count:",    "de": "Fensternanzahl:",       "ru": "Кол.во створок:"},
                "Slide type:"               : {"en": "Slide type:",     "de": "Fenstertyp:",           "ru": "Тип створки:"},
                "Normal:"                   : {"en": "Normal:",         "de": "Normal:",               "ru": "Нормальное состояние:"},
                "Active:"                   : {"en": "Active:",         "de": "Aktive:",               "ru": "Активное состояние:"},
                "Normal hover:"             : {"en": "Normal hover:",   "de": "Normal unter Kursor:",  "ru": "Нормальное под курсором:"},
                "Active hover:"             : {"en": "Active hover:",   "de": "Aktive unter Kursor:",  "ru": "Активное под курсором:"},
                "Text color:"               : {"en": "Text color:",     "de": "Textfarbe:",            "ru": "Цвет текста:"},
                "Test value:"               : {"en": "Test value:",     "de": "Testwert:",             "ru": "Тестовое значение:"},
                "Icon width:"               : {"en": "Icon width:",     "de": "Bildbreite:",           "ru": "Ширина миниатюры:"},
                "Icon height:"              : {"en": "Icon height:",    "de": "Bildh&ouml;he:",        "ru": "Высота миниатюры:"},
                "Icon size:"                : {"en": "Icon size:",      "de": "Bildgr&ouml;&szlig;e:", "ru": "Размер миниатюры:"},
                "Icon active:"              : {"en": "Active icon:",    "de": "Aktivbild:",            "ru": "Активная миниатюра:"},
                "Hide inactive:"            : {"en": "Hide if incative:","de": "Verstecken falls inaktiv:", "ru": "Скрыть в неактивном состоянии:"},
                "No background:"            : {"en": "No background:",  "de": "Kein Hintergrund:",     "ru": "Не показывать фон:"},
                "Show description:"         : {"en": "Show description:","de": "Zeige Beschreibung:",  "ru": "Показывать описание:"},
                "Room:"                     : {"en": "Room:",           "de": "Raum:",                 "ru": "Комната:"},
                "Min value:"                : {"en": "Min value:",      "de": "Min Wert:",             "ru": "Мин. значение:"},
                "Max value:"                : {"en": "Max value:",      "de": "Max Wert:",             "ru": "Макс. значение:"},
                "Accuracy:"                 : {"en": "Accuracy:",       "de": "Nachkommastellen:",     "ru": "Чисел после запятой:"},
                "Not opened"                : {"en": "Not opened",      "de": "Geht nicht auf",        "ru": "Не открывается"},
                "Left"                      : {"en": "Left",            "de": "Links",                 "ru": "На лево"},
                "Right"                     : {"en": "Right",           "de": "Rechts",                "ru": "На право"},
                "Top"                       : {"en": "Top",             "de": "Oben",                  "ru": "Наверх"},
                "YYYY.MM.DD hh:mm:ss"       : {"en": "YYYY.MM.DD hh:mm:ss", "de": "TT.MM.JJJJ SS:mm:ss","ru": "TT.MM.YYYY SS:mm:ss"}
           };
        }
        if (this.words[text]) {
            if (this.words[text][this.gOptions.gLocale])
                return this.words[text][this.gOptions.gLocale];
            else 
            if (this.words[text]["en"])
                return this.words[text]["en"];
        }

        return text;
    }
});
