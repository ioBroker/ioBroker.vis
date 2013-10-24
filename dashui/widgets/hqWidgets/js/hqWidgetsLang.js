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
 
 
Copyright (c) 2013 Denis Khaev deniskhaev@gmail.com
 
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
                "IP Camera"                 : {"en": "IP Camera",       "de": "IP Kamera"},
                "Description:"              : {"en": "Description:",    "de": "Beschreibung:"},
                "Close"                     : {"en": "Hide",            "de": "Abbrechen"},
                "Advanced..."               : {"en": "Advanced...",     "de": "Erweitert..."},
                "Pop up delay (ms):"        : {"en": "Pop up delay (ms):", "de": "Verzogerung (ms)"},
                "Open door button:"         : {"en": "Open door button:",  "de": "'Tur aufmachen' Knopf:"},
                "Small image update(sec):"  : {"en": "Small image update(sec):",    "de": "Kleines Bild erneuern(Sek):"},
                "Open door text:"           : {"en": "Open door text:", "de": "Knopfbeschrieftung:"},
                "Open&nbsp;lock"            : {"en": "Open&nbsp;lock",  "de": "Aufmachen"},
                "Open the door?"            : {"en": "Open the door?",  "de": "Tur aufmachen?"},
                "Simulate click"            : {"en": "Simulate click",  "de": "Simuliere Click"},
                "Test state"                : {"en": "Test state",      "de": "Zustand testen"},
                "Last action:"              : {"en": "Last action:",    "de": "Lezte Status&auml;nderung:"},
                "Do not show"               : {"en": "Do not show",     "de": "Nicht zeigen"},
                "Show always"               : {"en": "Show always",     "de": "Immer zeigen"},
                "Hide after 1 hour"         : {"en": "Hide after 1 hour",  "de": "Ausblenden nach 1 Stunde"},
                "Hide after 2 hours"        : {"en": "Hide after 2 hours", "de": "Ausblenden nach 2 Stunden"},
                "Hide after 6 hours"        : {"en": "Hide after 6 hours", "de": "Ausblenden nach 6 Stunden"},
                "Hide after 12 hours"       : {"en": "Hide after 12 hours","de": "Ausblenden nach 12 Stunden"},
                "Hide after 1 day"          : {"en": "Hide after 1 day",   "de": "Ausblenden nach 1 Tag"},
                "Hide after 2 days"         : {"en": "Hide after 2 days",  "de": "Ausblenden nach 2 Tagen"},
                "Battery problem"           : {"en": "Battery problem", "de": "Akku-Problem"},
                "Test state:"               : {"en": "Test state:",     "de": "Zustand antesten:"},
                "Icon:"                     : {"en": "Icon:",           "de": "Kleinbild:"},
                "Test state:"               : {"en": "Test state:",     "de": "Zustand antesten:"},
                "Test state:"               : {"en": "Test state:",     "de": "Zustand antesten:"},
                "Styles..."                 : {"en": "Styles...",       "de": "Stile..."},
                "jQuery Styles:"            : {"en": "Use&nbsp;jQuery&nbsp;Styles:", "de": "jQuery&nbsp;Stil&nbsp;anwenden:"},
                "Radius:"                   : {"en": "Border&nbsp;Radius:", "de": "Eckenradius:"},
                "Icon width:"               : {"en": "Icon width:",     "de": "Bildbreite:"},
                "Icon height:"              : {"en": "Icon height:",    "de": "Bildh&ouml;he:"},
                "Icon size:"                : {"en": "Icon size:",      "de": "Bildgr&ouml;&szlig;e:"},
                "Icon active:"              : {"en": "Active&nbsp;icon:","de": "Aktivbild:"},
                "Hide inactive:"            : {"en": "Hide&nbsp;if&nbsp;incative:", "de": "Verstecken&nbsp;falls&nbsp;inaktiv:"},
                "No background:"            : {"en": "No&nbsp;background:",         "de": "Kein&nbsp;Hintergrund:"},
                "Show description:"         : {"en": "Show&nbsp;description:",      "de": "Zeige&nbspBeschreibung:"},
                "Room:"                     : {"en": "Room:",           "de": "Raum:"},
                "Min value:"                : {"en": "Min value:",      "de": "Min Wert:"},
                "Max value:"                : {"en": "Max value:",      "de": "Max Wert:"}
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
