/**
 *  DashUI
 *  https://github.com/hobbyquaker/dashui/
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

// Languages
dui = $.extend(true, dui, {
    translate: function (text) {
        if (!this.words) {
            this.words = {
                "hm_id"            : {"en": "Homematic ID"},
                "hm_ids"           : {"en": "Homematic IDs"},
                "hm_id0"           : {"en": "Swing ID 1",    "de": "Fensterblatt 1"},
                "hm_id1"           : {"en": "Swing ID 2",    "de": "Fensterblatt 2"},
                "hm_id2"           : {"en": "Swing ID 3",    "de": "Fensterblatt 3"},
                "hm_id3"           : {"en": "Swing ID 4",    "de": "Fensterblatt 4"},
                "hm_id_hnd0"       : {"en": "Handle ID 1",   "de": "Griffkontakt 1"},
                "hm_id_hnd1"       : {"en": "Handle ID 2",   "de": "Griffkontakt 2"},
                "hm_id_hnd2"       : {"en": "Handle ID 3",   "de": "Griffkontakt 3"},
                "hm_id_hnd3"       : {"en": "Handle ID 4",   "de": "Griffkontakt 4"},
                "hm_idV"           : {"en": "Valve",         "de": "Ventilsteuerung"},
                "hm_idB"           : {"en": "Brightness ID", "de": "Lichthelligkeit&nbsp;ID"},
                "hm_idL"           : {"en": "Lock ID",       "de": "Schloss ID"},
                "hm_wid"           : {"en": "Working ID"},
                "hm_idC_On"        : {"en": "HM ID for ON",  "de": "HM ID für ON"},
                "hm_idC_Off"       : {"en": "HM ID for OFF", "de": "HM ID für OFF"},
                "default_filter_key":{"en": "Default filter:","de": "Voreingestellter Filter:"},
                "class"             :{"en": "CSS Class",     "de": "CSS Klasse:"},
                "theme"             :{"en": "Theme:",        "de": "Thema:"},
                "comment"          : {"en" : "Comment:",     "de": "Kommentar:"},
                "Select HM parameter" : {"en" : "Select HM parameter", "de": "HM parameter ausw&auml;hlen"},	
                "Select"           : {"en" : "Select",       "de": "Auswählen"},
                "Cancel"           : {"en" : "Cancel",       "de": "Abbrechen"},	
                "None"             : {"en": "None",          "de": "Vorgegeben"},
                "Default"          : {"en": "Default",       "de": "Vorgegeben"},
                "Name"             : {"en" : "Name",         "de": "Name"},	
                "Location"         : {"en" : "Location",     "de": "Raum"},	
                "Interface"        : {"en" : "Interface",    "de": "Schnittstelle"},	
                "Type"             : {"en" : "Type",         "de": "Typ"},	
                "Address"          : {"en" : "Address",      "de": "Adresse"},	
                "Function"         : {"en" : "Function",     "de": "Gewerk"},	
                "ramp_time:"       : {"en" : "Ramp time(s)", "de": "Dauer - Aus (sek)"},
                "on_time:"         : {"en" : "On time(s)",   "de": "Dauer - An (sek)"},
                "newVersion"       : {"en" : "Handler ab V1.6",  "de": "Griff ab V1.6"},
                "weoid"            : {"en" : "City",         "de": "Stadt"},
                "Service messages" : {"en" : "Service messages", "de": "Servicemeldungen "},
                "Navigator:"       : {"en" : "Navigator:",   "de": "Navigator:"},
                "Show top and bottom": {"en" : "Show top and bottom", "de": "Anzeigen oben und unten"},
                "Show bottom"      : {"en" : "Show bottom",  "de": "Anzeigen unten"},
                "Do not show"      : {"en" : "Do not show",  "de": "Nicht anzeigen"},
                "Load period:"     : {"en" : "Load period:", "de": "Von CCU laden:"},
                "1 Hour"           : {"en" : "1 Hour",       "de": "1 Stunde"},
                "2 Hours"          : {"en" : "2 Hours",      "de": "2 Stunden"},
                "6 Hours"          : {"en" : "6 Hours",      "de": "6 Stunden"},
                "12 Hours"         : {"en" : "12 Hours",     "de": "12 Stunden"},
                "1 Day"            : {"en" : "1 Day",        "de": "1 Tag"},
                "3 Days"           : {"en" : "3 Days",       "de": "3 Tage"},
                "5 Days"           : {"en" : "5 Days",       "de": "5 Tage"},
                "1 Week"           : {"en" : "1 Week",       "de": "1 Woche"},
                "2 Weeks"          : {"en" : "2 Weeks",      "de": "2 Wochen"},
                "1 Month"          : {"en" : "1 Month",      "de": "1 Monat"},
                "3 Months"         : {"en" : "3 Months",     "de": "3 Monate"},
                "6 Months"         : {"en" : "6 Months",     "de": "6 Monate"},
                "1 Year"           : {"en" : "1 Year",       "de": "1 Jahr"},
                "All"              : {"en" : "All",          "de": "Alle"},
                "Theme:"           : {"en" : "Theme:",       "de": "Theme:"},
                "Description with percent:": {"en" : "Description with percent:", "de": "Beschriftung y-Achse mit %"},
                "Zoom level:"      : {"en" : "Zoom level:",  "de": "Zoom-Stufe:"},
                "Scrollbar:"       : {"en" : "Scrollbar:",   "de": "Scrollbar:"},
                "Dynamic aggregation:": {"en" : "Dynamic aggregation:", "de": "Dynamische Aggregation:"},
                "Legend:"          : {"en" : "Legend:",      "de": "Legende:"},
                "Left"             : {"en" : "Left",         "de": "Links"},
                "Inside"           : {"en" : "Inside",       "de": "im Chart"},
                "Hide"             : {"en" : "Hide",         "de": "nicht anzeigen"},
                "Zoom active:"     : {"en" : "Zoom active:", "de": "Zoomen aktiviert:"},
                "Charts..."        : {"en" : "Charts...",    "de": "Charts..."},
                "Chart"            : {"en" : "Chart",        "de": "Chart"},
                "History"          : {"en" : "History",      "de": "Verlauf"},
                "Rooms"            : {"en" : "Rooms",        "de": "R&auml;ume"},
                "Room:"            : {"en" : "Room:",        "de": "Raum:"},
                "Functions"        : {"en" : "Functions",    "de": "Gewerke"},
                "Function:"        : {"en" : "Function:",    "de": "Gewerk:"},
                "Widget:"          : {"en" : "Widget:",      "de": "Widget:"},
                "New View"         : {"en" : "New View:",    "de": "Neue View"},
                "Current View"     : {"en" : "Current View", "de": "Aktuelle View"},
                "View Attributes"  : {"en" : "View Attributes","de": "View-Eigenschaften"},
                "External Commands": {"en" : "External Commands", "de": "Externe Befehle"},
                "View:"            : {"en" : "View:",        "de": "View:"},
                "wizard_run"       : {"en" : "Run",          "de": "Ausführen"},
                "add_view"         : {"en" : "Add",          "de": "Hinzufügen"},
                "dup_view"         : {"en" : "Duplicate",    "de": "Duplizieren"},
                "del_view"         : {"en" : "Delete",       "de": "Löschen"}, 		
                "rename_view"      : {"en" : "Rename",       "de": "Umbenennen"}, 	
                "create_instance"  : {"en" : "Create instance", "de": "Instanz erzeugen"}, 
                "remove_instance"  : {"en" : "Remove instance","de": "Instanz löschen"}, 
                "add_widget"       : {"en" : "Add widget",    "de": "Einfügen"},
                "del_widget"       : {"en" : "Delete widget", "de": "Löschen"},
                "dup_widget"       : {"en" : "Copy widget to:","de": "Widget kopieren nach:"},
                "widget_doc"       : {"en" : "Widget help",   "de": "Widgethilfe"},
                "Add Widget:"      : {"en" : "Add Widget:",   "de": "Widget einf&uuml;gen:"},
                "Inspecting Widget:":{"en" : "Inspecting Widget:", "de": "Widget inspizieren:"},
                "Widget Attributes:":{"en" : "Widget Attributes:", "de": "Widget-Eigenschaften:"},
                "Action on click:" : {"en" : "Action on click:", "de": "Aktion beim Anklicken:"},
                "Disable device filter:" : {"en" : "Disable device filter:", "de": "Schalte Ger&auml;tefilter aus:"},
                "filter_key"       : {"en" : "Filter key:",  "de": "Filterwort:"},
                "Show in views:"   : {"en" : "Show in views:","de": "Zeige in Views:"},
                "Single mode"      : {"en" : "Only in actual view",  "de": "Nur in aktueller View"},
                "Invert state:"    : {"en" : "Invert state:", "de": "Invertiere Zustand:"},
                "All except Low battery": {"en" : "All except 'Battery Indicator'", "de": "Alle außer 'Battery Indicator'"},
                "General"          : {"en" : "General",       "de": "Allgemein"},
				// Bars
                "One at time:"     : {"en" : "One at time:",  "de": "Nur eine auswahlbar:"},
                "Geometry..."      : {"en" : "Geometry...",   "de": "Geometrie..."},
                "Show"             : {"en" : "Show",          "de": "Zeigen"},
                "Bar type:"        : {"en" : "Bar type:",     "de": "Bartyp:"},
                "Button width:"    : {"en" : "Button width:", "de": "Knopfbreite:"},
                "Button height:"   : {"en" : "Button height:","de": "Knopfh&ouml;he:"},
                "Button space:"    : {"en" : "Button space:", "de": "Zwischenplatz:"},
                "Border radius:"   : {"en" : "Border radius:","de": "Randradius:"},
                "Text offset %:"   : {"en" : "Text offset %:","de": "Textoffset in %:"},
                "Text align:"      : {"en" : "Text align:",   "de": "Textausrichtung:"},
                "Image align:"     : {"en" : "Image align:",  "de": "Bildausrichtung:"},
                "Effects..."       : {"en" : "Effects...",    "de": "Effekte"},
                "Hide effect:"     : {"en" : "Hide effect:",  "de": "Verbergeneffekt:"},
                "Show effect:"     : {"en" : "Show effect:",  "de": "Anzeigeeffekt:"},
                "Test"             : {"en" : "Test",          "de": "Test"},
                "Buttons..."       : {"en" : "Buttons...",    "de": "Kn&ouml;pfe"},
                "Icon:"            : {"en" : "Icon:",         "de": "Bildchen:"},
                "Caption:"         : {"en" : "Caption:",      "de": "Beschriftung:"},
                "Filter key:"      : {"en" : "Filter key:",   "de": "Filterwort:"},
                "Add"              : {"en" : "Add",           "de": "Neu"},
                "Up"               : {"en" : "Up",            "de": "Nach oben"},
                "Down"             : {"en" : "Down",          "de": "Nach unten"},
                "Delete"           : {"en" : "Delete",        "de": "L&ouml;schen"},
                "Horizontal"       : {"en" : "Horizontal",    "de": "Horizontal"},
                "Vertical"         : {"en" : "Vertical",      "de": "Senkrecht"},
                "Docked at top"    : {"en" : "Docked at top", "de": "Angedockt oben"},
                "Docked at bottom" : {"en" : "Docked at bottom", "de": "Angedockt unten"},
                "Docked at left"   : {"en" : "Docked at left","de": "Angedockt links"},
                "Docked at right"  : {"en" : "Docked at right","de": "Angedockt rechts"},
                "Center"           : {"en" : "Center",        "de": "In der MItte"},
                "Left"             : {"en" : "Left",          "de": "Links"},
                "Right"            : {"en" : "Right",         "de": "Rechts"},
				
            };
        }
        if (this.words[text]) {
            if (this.words[text][this.currentLang])
                return this.words[text][this.currentLang];
            else 
            if (this.words[text]["en"])
                return this.words[text]["en"];
        }

        return text;
    }
});
