
# DashUI

## Installation & Dokumentation

siehe [DashUI Homepage](http://hobbyquaker.github.io/DashUI)

## Changelog

### 0.9beta94
* (Hobbyquaker) hqWidgets added HM-LC-Sw4-PCB
* (Hobbyquaker) additional css files for specific themes
* (Hobbyquaker) Fix Editor Tabs
* (Hobbyquaker) Fix CSS for theme Kiandra

### 0.9beta93
* (Hobbyquaker) Fix checkNewView, dupView, delView, addView, importView

### 0.9beta92
* (Hobbyquaker) Fix addView: check if view already exists
* (smiling-Jack) Editor Style
* (Bluefox) Implement all communication functions in servConn (Offline mode is possible)
* (Bluefox) hqWidget / Charts: make 8 lines possible.

### 0.9beta91
* (Hobbyquaker) Fix keep multi-selected-widgets on undo
* (Hobbyquaker) Fix saveRemote on undo
* (Hobbyquaker) Show message on loadscreen after update

### 0.9beta90
* (Hobbyquaker) new Widget: special - Sound onClick
* (Hobbyquaker) new Widget: jqui - ContainerDialogExternal
* (Hobbyquaker) new external command: dialog
* (Hobbyquaker) new external command: playSound
* (Hobbyquaker) Swipe Wigdet: same style as special widgets
* (Hobbyquaker) Fix external command data

### 0.9beta89
* (Hobbyquaker) Fix getUsedWidgetSets - find dependencies not working
* (Hobbyquaker) Fix dui_editor close - forward to viewfile
* (Hobbyquaker) Fix widgetset_counter on loadscreen
* (Bluefox) Fix widget-set basic
* (Bluefox) Fix RGraph/Gauge widget if start/end of scale changed.

### 0.9beta88
* (Hobbyquaker) multiple View-Files via Querystring (f.e. /dashui/?viewfile1#view1)
* (Hobbyquaker) decreased editor width
* (Hobbyquaker) hmSelect changed z-index, modal

### 0.9beta87
* (Hobbyquaker) Fix CSS steal border-* and padding on Firefox
* (Hobbyquaker) Fix CSS steal text-align

### 0.9beta86
* (Hobbyquaker) Mehrere Widgets auf einmal selektieren (Shift-Click) und gemeinsames Verschieben
* (Hobbyquaker) Fix Undo
* (Hobbyquaker) Fix View CSS Inspector

### 0.9beta85
* (Hobbyquaker) Undo-Funktion über Button und ctrl-z bzw cmd-z
* (Hobbyquaker) Editor-Position: Symbole statt Text

### 0.9beta84
* (Hobbyquaker) Fix mehrfaches gleichzeitiges Speichern unterbunden. Sollte Bug beheben der die dashui-views.json zerstört
* (Hobbyquaker) export und import von Views
* (Hobbyquaker) Fix Hintergrundklasse wurde nicht gespeichert
* (Hobbyquaker) Fix CSS steal

### 0.9beta83
* (Hobbyquaker) reorganized CSS inspector, removed shorthand attributes
* (smiling-Jack) editor position
* (smiling-Jack) swipe widget fixes and improvements


### 0.9beta82
* (Bluefox) prepare for new select dialog
* (Bluefox) make dashui grunt-able

### 0.9beta81
* (Hobbyquaker) neues Widget-Set homematic mit Widget zum Anzeigen/Bestätigen der Servicemeldungen

### 0.9beta80
* (Hobbyquaker) Fix Widget "jqui Icon HTTP Get"

### 0.9beta79
* (Hobbyquaker) Fix Widgets "basic static Image" und "basic static iFrame": Refresh von unsichtbaren Bildern/iFrames unterbunden

### 0.9beta78
* (Hobbyquaker) Fehler abgefangen beim Anlegen von uiState Objekten

### 0.9beta77
* (Hobbyquaker) Fix "Aufklappdreieck" im Select-ID Dialog

### 0.9beta76
* (Hobbyquaker) Fix Dialog Container Widgets

### 0.9beta75
* (Kivas) hqWidgets: Support of HM-TC-IT-WM-W-EU
* (Hobbyquaker) loadWidgetSet() gibt DashUI-Version im Querystring mit um Cache-Probleme zu vermeiden
* (Bluefox) Fix offline mode

### 0.9beta74
* (Hobbyquaker) added cache.manifest to prevent Safari/iOS cache problems
* (Bluefox) Support of local snapshot for debug
* (Bluefox) Fix yahooWidget under Firefox
* (Bluefox) Fix select dialog
* (Bluefox) Fix CSS background selector
* (Bluefox) Optimize dashuiEdit.js

### 0.9beta73
* (Hobbyquaker) Fix Hue Widgets
* (Hobbyquaker) Fix getDataPoints()

### 0.9beta72
* (Bluefox) Change widget dependencies
* (Bluefox) "use strict" by some files
* (Bluefox) basic widgets: add "test_html" to see widget itself, if its data point has no value
* (Bluefox) Fix small error in hqWidgets/Lock
* (Bluefox) table widget support object as input and can work without event_id (If only table_id set, the whole table will be updated)

### 0.9beta71
* (Hobbyquaker) Fix Name Attribute on init uiState - Bedienung war nicht mehr möglich

### 0.9beta70
* (Hobbyquaker) Fix changeView() - Views wurden überlagert dargestellt, Navigation hat nicht immer funktioniert
* (Hobbyquaker) Fix changeFilter() - Filter haben nicht funktioniert wenn keine hqWidgets vorhanden waren

### 0.9beta69
* (Hobbyquaker) Fix loadRemote() - eventuell eine Ursache für iPad-Bugs
* (Hobbyquaker) Fix getDataPoints() - direktes befüllen des Canjs Observable, sollte Ladezeit wieder verbessern
* (Hobbyquaker) Waitscreen umgebaut, Progressbar verbessert

### 0.9beta68
* (Hobbyquaker) Fix double JSON.stringify on saveRemote()

### 0.9beta67
* (Hobbyquaker) jqui Dialog Widgets: new Attribute preload
* (BKo) new Widget SliderTabs
* (Smiling-Jack) Fixes Swipe
* (Smiling-Jack) neues Widget: Karusell

### 0.9beta66
* (Hobbyquaker) Fix increment bind
* (Hobbyquaker) prevent longClick for IE

### 0.9beta65
* (Bluefox) Communication adapter to abstract the transport layer
* (Bluefox) New widgets: Rgraph/LiveChart, Highchart/LiveChart, Highchart/Bars, Highchart/Clock
* (Bluefox) Remove js files provided by ccu.io/www/lib
* (Bluefox) Fix saveRemote function
* (Bluefox) Fix small syntax errors
* (Bluefox) Add connection parameter to config.js
* (Bluefox) Make offline mode passable
* (Hobbyquaker) Fix initInstance() call
* (Hobbyquaker) Fix Widget "lcars - warpcore", "lcars - dna" in Firefox
* (Hobbyquaker) Fix diverse Widgets lcars default Attribute

### 0.9beta64
* (Hobbyquaker) Fehler abgefangen in inspectWidget-Methode

### 0.9beta63
* (Hobbyquaker) Bugfix: betrifft viele Widgets, habe beim Refactoring ein Fehler gemacht...

### 0.9beta62
* (Hobbyquaker) neues Widget-Set: LCARS (Star Trek)
* (Hobbyquaker) Refactoring

### 0.9beta61
* (Hobbyquaker) Bugfix state Binding (betrifft verschiedene basic/jqui/jqui-mfd Widgets)
* (Hobbyquaker) Bugfix diverse Widgets basic und jqui: Workaround für 404 __!!__ - siehe https://github.com/bitovi/canjs/issues/157
* (Hobbyquaker) Bugfix Widget jqui - ctrl - slider. Wert wird auf 0 gesetzt falls isNaN
* (Hobbyquaker) Widget "colorpicker rgb spectrum" fertiggestellt
* (Hobbyquaker) neues Widget "colorpicker rgb farbtastic"
* (Hobbyquaker) Fehler abgefangen falls versucht wird ein Widget zu rendern dessen Template nicht vorhanden ist

### 0.9beta60
* (Hobbyquaker) Bugfix toggle Binding (betrifft verschiedene basic/jqui/jqui-mfd Widgets)
* (Hobbyquaker) Code cleanup

### 0.9beta59
* (Hobbyquaker) Bugfix Instance (hat dazu geführt das Chrome/Android unter Umständen nach "lade Daten..." hängengeblieben ist)
* (Hobbyquaker) Bugfix Widget jqui - Icon Toggle: Binding neu aufgebaut (Flicker bei Aktualisierungen verhindern)
* (Hobbyquaker) Bugfix beim Neuladen der Datenpunkte nach Socket.IO-Reconnect
* (Hobbyquaker) Bugfix beim unterbinden von Markierung auf Android/Webkit
* (Hobbyquaker) Neues Widget: basic - val - Show on Value (Wird nur angezeigt wenn Datenpunkt ein vorgegebenen Wert beinhaltet)
* (Hobbyquaker) Neues Widget: colorpicker - ctrl rgb spectrum
* (Hobbyquaker) unfertige colorpicker Widgets auskommentiert

### 0.9beta58
* (Hobbyquaker) Fehler abgefangen falls parsen der dashui-views.json fehlschlägt (erfodert CCU.IO 1.0.28)
* (Hobbyquaker) Bugfix Zeitstempel Formatierung
* (Hobbyquaker) neues Widget: dev - Debug uiState[id] History
* (Hobbyquaker) Bugfix Widget special - remove Focus - Fokus nicht entfernen auf Eingabefeldern
* (Hobbyquaker) Attribut widgetSet wird in addWidget-Methode gesetzt
* (Hobbyquaker) Code cleanup

### 0.9beta57
* (Hobbyquaker) neues Widget: special - remove Focus
* (Hobbyquaker) Bugfix Widget jqui - ctrl - Icon Bool
* (Hobbyquaker) Widget jqui - ctrl Icon Increment: Delay implementiert
* (Hobbyquaker) Markieren unterbunden

### 0.9beta56
* (Hobbyquaker) neue Widgets: special - Instance, special - preRenderView
* (Hobbyquaker) Instanzen: CCU.IO Variablen
* (Hobbyquaker) neues Widget: dev - Debug uiState[id]
* (Hobbyquaker) neues Widget: basic - LastChange Timestamp
* (Hobbyquaker) Bugfix: jqui slider initial state
* (Hobbyquaker) Debug Widgets für uiState und setState getrennt
* (Hobbyquaker) Style Korrekturen - Whitespace in Funktionsaufrufen - bitte in Zukunft an diesen Styleguide halten: https://github.com/hobbyquaker/Javascript
* (geolin) Basic Changed state and toggle Eventhandler to support Touchevents (touchend). (Click Event did not work on Windows 8.1 Prof. Tablet with Chrome installed).
* (Thorque) Adding a new widget: jqui Icon Toggle
* (Bluefox) Remove double include in RGraph
* (Bluefox) Add switch language for DashUI (settings is not stored)
* (Bluefox) Fix bug with the shadow of RGraph
* (Bluefox) Fix bug with helper selection box
* (Bluefox) New Widget: basic - Note
* (Bluefox) Fix Basic- RedNumber if value null
* (Bluefox) new widget basic-tplFrame

### 0.9beta55
* (Hobbyquaker) lib Update: jQuery 1.11.0 (erfordert CCU.IO >= 1.0.24)
* (Hobbyquaker) neues Widget: basic - val - AckFlag HTML
* (Hobbyquaker) neues Widget: basic - val - Timestamp
* (Hobbyquaker) neues Widget: jqui - ctrl - Icon Increment

### 0.9beta54
* (Hobbyquaker) removed double meta viewport width

### 0.9beta53
* (Lueghi) Übersetzungen
* (Bluefox) Neue Widgets: RGraph / Thermometer and RGRaph / Gauge
* (Bluefox) Do not load unused widgetSets
* (Bluefox) Übersetzungen
* (Hobbyquaker) Bugfix beim Anlegen und Duplizieren von Views
* (Hobbyquaker) Bugfix initialer Status von Stateful-Widgets
* (Hobbyquaker) Bugfix initialer Status von Widget jqui Datetime
* (Hobbyquaker) Widget jqui Input Datetime - neue Attribute: hideSeconds, timeOnly
* (Hobbyquaker) neues Widget: jqui Input Date


### 0.9beta52
* (Bluefox) Change image path calculation
* (Bluefox) Bugfixes
* (Geolin) Widgets Set "Basic" hm_val - Drehgriff und hm_val - TFK: Bugfix, beliebiger HTML Code für die Zustände

### 0.9beta51
* (Hobbyquaker) Bugfix CCU.IO Version Check
* (Bluefox) Fix hqWidget/ipCam => Open function
* (Bluefox) Fix bars: image source not only in dashui/img/
* (Bluefox) Add startValue for hqWidget/Dimmer
* (Bluefox) Trim styleSelection drop down box to 150px.
* (Bluefox) Write startValue 100 if not exists.
* (Bluefox) startValue in % from 0 to 100.
* (Bluefox) Fix error with Dimmer and startValue display.
* (Bluefox) Add do not animate property to hqWidgets
* (Bluefox) Add font property to hqWidgets/Temperature and Inside Temperature
* (Bluefox) Add basic/Bool ctrl SVG
* (Bluefox) Add background option to basic navigation HTML

### 0.9beta50
* (Bluefox) Support invert position for hqWidget/Blinds
* (Bluefox) Fix timeAndWeather/htcWeather the second page.
* (Bluefox) Support of new timeAndWeather/CoolClock Widget
* (Bluefox) Fix error in CoolClock
* (Bluefox) Fix timeAndWeather/htcWeather
* (Bluefox) Add classicWhite skin to CoolClock


### 0.9beta49
* (Bluefox) Fix the Problem with hqWidgets: hqWidgets will be shown wrong if view is invisible during render.
* (Bluefox) Fix hmSelect dialog for programs.
* (Bluefox) Fix problem with popup in hqWidgest
* (Hobbyquaker) Fix initial state jqui select

### 0.9beta48
* (Hobbyquaker) neue Widgets im Widget-set "basic": stateful (anzeige von iFrame, View oder Bild in Abhängigkeit von Zustand)
* (Hobbyquaker) neuer Style für editmode-helper
* (Hobbyquaker, Bluefox) Support für dashui-user.css
* (Hobbyquaker) Bugfix Widget jqui input: initialer Zustand
* (Hobbyquaker) Bugfix Widget fancyswitch
* (Hobbyquaker) Bugfix View umbenennen
* (Bluefox) Fix problem with chart and hqWidget/Motion detector
* (Hobbyquaker) Basic Widgets: unnötige Borders entfernt
* (Hobbyquaker) Bugfix jqui Slider - kein Update wenn WORKING=true
* (Hobbyquaker) Style-Anpassung Editor
* (Hobbyquaker) Fixed jqui/jqui-mfd Modal and Autoclose Attributes


### 0.9beta47
* (Bluefox) "basic - hm_val HTML 8" padding entfernt
* (Hobbyquaker) fancyswitch Bugfix: initialer Status
* (Hobbyquaker) "basic hm_val - Bool HTML" grauen Hintergrund entfernt

### 0.9beta46
* (Hobbyquaker) Re-arranged Editor Dialog, more compact, style changes
* (Hobbyquaker) Bugfix: Resizable and Draggable where lost after widget attribute change

### 0.9beta45
* (Bluefox) The edit buttons have the icons now
* (Bluefox) Fix small problem in StyleSelector
* (Bluefox) Translate simpleTime and simpleDate
* (Bluefox) Play sound with HTML5 tag
* (Bluefox) Support of "say it" adapter in dashui.
* (Bluefox) Additional properties by swipe: body background
* (Bluefox) Blink feature by simpleClock (active only if no seconds are visible)
* (Bluefox)	Create alarm.png
* (Bluefox) Feature: do not use predefined class for simpleClock and simpleDate
* (Bluefox) Translate noClass for simpleClock and simpleDate
* (Hobbyquaker) simpleClock table entfernt
* (Hobbyquaker) Widget-Sets basic/jqui/jqui-mfd /checkbox für ein paar Attribute angewendet


### 0.9beta44
* (Hobbyquaker) Screen-size indicator (rot/grüne Linien die anzeigen wie groß der Bildschirm ist, einstellbar im Tab "Editor")
* (Hobbyquaker) refreshAddons (über CCU.IO Oberfläche kann DashUI veranlasst werden sich neu zu laden)
* (Hobbyquaker) Bugfix: steal css attribute color

### 0.9beta43
* (Bluefox) Fix style selector together with slider
* (Bluefox) Support of local mode. DashUI can be started locally without CCU.IO for Demo
* (Bluefox) Fix demo mode Add one image for device in HM Select dialog
* (Bluefox) Fix problem with Edit dialog and still hidden control elements because of CSS
* (Bluefox) Fix problem with initial LastAction show for hqWidgets/Info
* (Bluefox) Add Common room to Wizard
* (Bluefox) Fix HM-CC-RT-DN
* (Bluefox) Show all variables in HM_Dialog
* (Bluefox) Fix small error in tplHmWindowRotary
* (Bluefox) Add Sonos images to HM_Dialog
* (Bluefox) Fix HmSelect Dialog for variables
* (Bluefox) Remove wrong div by basic widgets
* (Bluefox) Fix Window without shutter
* (Bluefox) Fix error with ipCam

### 0.9beta42
* (Bluefox) Add invert state to hqButton and hqDoor
* (Bluefox) Small changes in Wizard (All except "Low battery")

### 0.9beta41
* (Hobbyquaker) Bugfix jqui Icon ProgramExecute (dui.binds.basic.program)
* (Hobbyquaker) Style-Korrekturen Editor-Dialog

### 0.9beta40
* (Bluefox) Change default time format for german to TT.MM.JJJJ hh:mm:ss
* (Bluefox)	Update hqWidgetsDashUI.js
* (Bluefox) Wizard should be ready now
* (Bluefox) Fix hmSelect Dialog to find images for some new types
* (Bluefox) Small bug fixes in bars
* (Bluefox) Add HM-ES-PMSw1-Pl to hqWidgets/On-Off

### 0.9beta39
* (Hobbyquaker) Bugfix: Edit-Mode: Widget resize funktionierte nicht nach Änderung von Attributen im Reiter Widget
* (Hobbyquaker) Editor: Tab Scrolling
* (Hobbyquaker) Editor: Animation wenn Widget per Dropdown ausgewählt wird
* (Hobbyquaker) Mehr jquery-ui Themes, werden nun aus ccu.io/lib geladen
* (Hobbyquaker) CSS-Stealer: es können eine oder mehrere Style-Eigenschaften eines anderen Widgets "geklaut" werden
* (Hobbyquaker) alle jqui-mfd-Widgets und alle jqui-Icon-Widgets mit zusätzlichem Attribut "invert_icon" ausgestattet (macht aus weissen Icons schwarze Icons und umgekehrt)
* (Bluefox) Fix doc window in FireFox (Show scrollbars)



### 0.9beta38
* (Bluefox) Fix hqWidget/Info - Control
* (Bluefox) Fix time format editing
* (Bluefox) hqWidgets/Info change status, if On and Off IDs are set
* (Bluefox) Support of TimeFormat for last action in hqWidgets
* (Bluefox) Wizard preparation: now Only On/Off and LowBat are usable
* (Bluefox) Editable text-shadow CSS property for all widgets
* (Bluefox) Add favicon
* (Bluefox) Make widget immediately movable after creation
* (Bluefox) Try to format edit mode
* (Bluefox) Fix and improve simple clock
* (Bluefox) Preparation for widget
* (Bluefox) hqWidget: Fix show last activation time if widget is filtered out
* (Bluefox) Translate edit buttons
* (Bluefox) Move some function from dashui.js to edit
* (Hobbyquaker) Fixed Bug on copying Widget to another View
* (Hobbyquaker) jqui Bugfix classes bind

### 0.9beta37
* (Hobbyquaker) Neue Hue-Widgets im Widget-Set jqui-mfd

### 0.9beta36

* (Bluefox) Extend Navigation bar: Better View name edition.
* (Bluefox) Fill the name of the Button by NavigationBar
* (Bluefox) Fix edit selector.
* (Bluefox) Store visibility of edit groups global and not for every widget.
* (Hobbyquaker) Neue Widgets für DWD-Wetterwarnungen (Widget-Set "weather-adapter")

### 0.9beta35
* (Hobbyquaker) Bugfixes Widget-Sets basic, jqui und jqui-mfd
* (Bluefox) Support of socket authentication
* (Bluefox) Fix errors with widgets on more than one views. Data sometimes are not updated.
* (Bluefox)	Fix hqWidgets/Shutter if no shutter used but only sensor
* (Bluefox) Fix Shutter on touch devices.
* (Bluefox) Support of roof window (handle is top)
* (Bluefox) Fix very BAD Error!!! If widget used on multiple views, nextId will be calculated invalid
* (Bluefox) Add URL control for hqWidgets/Info

### 0.9beta34
* (Hobbyquaker) neues Widget "basic - static iFrame"
* (Hobbyquaker) neues Widget "jqui - Icon HTTP GET"
* (Hobbyquaker) Widget "basic - static image" refreshInterval Attribut hinzugefügt
* (Hobbyquaker) Bugfix falls CCU.IO fehlerhafte regaObjects liefert

### 0.9beta33
* (Hobbyquaker) hideSecond Attribut für simpleClock Widget
* (Hobbyquaker) neues Widget: simpleDate
* (Bluefox) Fix switch views if no effect selected
* (Bluefox) Show History for hqWidgets/Door & Ping
* (Bluefox) hide hqWidgets at start if filtered out

### 0.9beta32
* (Bluefox) Add hqWidgets/"Ping device" widget
* (Bluefox) Add UP and DOWN buttons to Shutter control
* (Bluefox) DashUI Bug: Check before control if ID exists
* (Bluefox) hqWidgets / Info: Change condition. Warning! For all hqWidgets/INFO the condition must be changed
* (Bluefox) Add initial value to filter bar
* (Bluefox) Fixed Font by hqWidgets/Gauge

### 0.9beta31

* (Bluefox) Add feature: show in multiple views
* (Bluefox) hqWidgets Add HM-LC-Bl1-PB-FM to Shutter aktor
* (Bluefox) hqWidgets Add transparent style for buttons
* (Hobbyquaker) jqui Widgets Bugfixes
* (Hobbyquaker) Reload uiState on CCU.IO Reconnect



### 0.9beta30

* (Hobbyquaker) Bild-Upload
* (Hobbyquaker) Bugfixes Basic-Widgets
* (Bluefox) Fix translate error
* (Bluefox) Translate bars and add icons to Add/Delete/Up/Down buttons
* (Bluefox) Fix image for bars
* (Bluefox) Small fixes for image select dialog
* (Bluefox) Fixed Icon upload dialog
* (Bluefox) Remove CUxD devices from standard HMselect dialog (It can be selected now with "Use no device filter" option)


### 0.9beta29

* (Bluefox) Fix filter of untagged widgets
* (Bluefox) Small errors fixed
* (Bluefox) Format code with WebStorm/PhpStorm
* (Bluefox) Fix possible error with Filter Bar
* (Bluefox) Add filter icons
* (Bluefox) Small changes
* (Bluefox) Add Camera icon for filters
* (Bluefox) Fix lastActionTime for widgets (use only states and not battery, percent and so on)

### 0.9beta28

* (Bluefox) New widgets Filter Bar and Navigation Bar
* (Bluefox) Support of Active color for INFO hqWidget
* (Bluefox) Add effect selector
* (Hobbyquaker) Bugfixes Widget-Set jqui
* (Hobbyquaker) neuer Parameter sync in Methode changeView
* (Hobbyquaker) neue Attribute min,max,step für Widgets "jqui - hm_ctrl - Slider"
* (Hobbyquaker) relative statt absolute Pfade für /lib und /socket.io
* (Hobbyquaker) weitere Bibliotheken aus /lib geladen...
* (Hobbyquaker) diverse console.log entfernt
* (Hobbyquaker) Code-Style (geschweifte Klammern beim jedem if/else)


### 0.9beta27

* (Hobbyquaker) Bugfix filter
* (Hobbyquaker) Widget "jqui-mfd - hm_ctrl - heating"
* (Bluefox) dashuiEdit.js Fix error if no CSS loaded

### 0.9beta26
* (Hobbyquaker) Filter implementiert

### 0.9beta25
* (Bluefox) Fixed bugs

### 0.9beta24
* (Bluefox) Fix error in hqSlider
* (Bluefox) Fix error if hqWidgets is invisible. e.g. Wrong position of all pop up windows (including Shutter)
* (Bluefox) Place hqStyleSelector to dui.styleSelector
* (Bluefox) Move translate to extra file dashuiLang.js and hqWidgetsLang.js
* (Bluefox) Fix documentation for Motion Detection
* (Bluefox) Fix selection of BackgroundStyle at first load
* (Bluefox) Add dashuiLang.js to edit.html


### 0.9beta23

* (Bluefox) Fix hqWidget/Eventlist. Filter by ID
* (Bluefox) hqWidgets Try to support HM-CC-RT-DN
* (Bluefox) New widget hqWidgets/Motion Detector
* (Bluefox) Fix last activated time in Firefox
* (Bluefox) Fix Charts/History in Firefox in PopUp
* (Bluefox) Fixed Position of the Pin Button in PopUp Window
* (Bluefox) Documentation for Motion Detector
* (Bluefox) Neuer Style für Dokumentation

### 0.9beta22

* (Hobbyquaker) Fixed RAMP_TIME hqWidget Dimmer (benötigt CCU.IO >= 0.9.53)

### 0.9beta21

* (Hobbyquaker) Fixed Theme Change, Background Change and Effects - Immer noch ein Flickern beim Change auf noch nicht gerenderte View und beim Theme Change da das da früher nicht war - suche noch die Ursache
* (Hobbyquaker) diverse console.log entfernt
* (Hobbyquaker) Bugfix Widgets "basic - hm_val - Hide on 0/false" und "basic - hm_val - Hide on >0/true"
* (Bluefox, smiling-Jack) Transparente Geräte Icons für hqWidgets

### 0.9beta20
* (Bluefox) Fixed problem with background in different views
* (Bluefox) Fixed hmSelect Dialog
* (smiling-Jack) Knob Widgets: Dezimal stellen

### 0.9beta19
* (Bluefox) New option by IpCam Widget: Show Pop up (Enable/Disable the show of the PopUp Window
* (Bluefox) Fix error by ipCam Widget. (Load immediately the picture, Remove cancel icon in the corner of the IpCam)

### 0.9beta18

* (Bluefox) Change a bit the style of edit dialog
* (Bluefox) Prepare translate of edit dialog
* (Bluefox) Change Homematic ID selection dialog
* (Bluefox) Fix small error in Eventlist and Chart widgets
* (Bluefox) New widget Battery indicator
* (Bluefox) New setting for Widget: Show description. To show description of the widget on the left.
* (Bluefox) hqWidgets Documentation

### 0.9beta17

* (hobbyquaker) Style-Anpassung für Schließen-Button im Editor-Dialog und anderen jQueryUI Dialogen
* (hobbyquaker) erzwungener Reload falls automatischer Reconnect bei verlorener CCU.IO-Verbindung nicht funktioniert
* (hobbyquaker) Widgets "basic red Number" und "basic hm_val number" mit getrennten html_append Eigenschaften für Singular und Plural ausgetattet

### 0.9beta16

* (smiling-Jack) Add minimize Button to Editor
* (smiling-Jack) CSS anpassung für Editor minimize
* (smiling-Jack) Add Glow effekt
* (Bluefox) Einstellbare Anzahl von Ereignissen auf der Seite

### 0.9beta15

* (Hobbyquaker) Bugfix basic widgets, added yr-adapter
* (Bluefox) Add images for chart and eventlist buttons
* (Bluefox) Add HM-LC-Bl1PBU-FM

### 0.9beta14
* (Bluefox) Enable activation of programs with hqWidget Button
* (Bluefox) New feature: Control by hqWidget/Info (e.g. to control the garage door)
* (Bluefox) Remove Time_ON property for Dimmer.
* (Bluefox) Fixed: Error if wired dimmer used
* (Bluefox) Alert window if incompatible data point used for hqWidget
* (Bluefox) Bugfixes hqDimmer

### 0.9beta13
* (Bluefox) Neue hqWidgets: Eventlist und Chart

### 0.9beta12
* (Hobbyquaker) Neues Widget "basic - hm_ctrl - HTML State" - setzt bei Klick einen Wert

### 0.9beta11
* (Hobbyquaker) Bugfixes in diversen Widget-Sets
* (Hobbyquaker) Widget-Dokumentation
* (Bluefox) Fix für LastChange Timestamp

### 0.9beta10
* (Hobbyquaker) Doku für das Widget-Set "basic" ausgearbeitet
* (Hobbyquaker) Widgets "basic hm_val Bar horizontal/vertical" mit zusätzlichem Attribut "reverse" ausgestattet
* (Hobbyquaker) Bugfixes diverse Widgets aus dem Widget-Set "basic"

### 0.9beta9
* (Hobbyquaker) Widget-Dokumentation direkt aus Editor öffnen

### 0.9beta8
* (Hobbyquaker) Fehler behoben beim ausführen von externen Kommandos (Instanzen)
* (Hobbyquaker) Fehler behoben beim Wechsel zwischen Views (Container-Views wurden u.U. nicht angezeigt)
* (Bluefox) Fehler behoben Wetter-Widgets

### 0.9beta7

* (Hobbyquaker) Fixed various Bugs in jqui and jqui-mfd Widget-Sets
* (Bluefox) Description for ID 40 and 41 …
* (Bluefox) Preparation for Temperature Graphics
* (Bluefox) Delete jqhomematic.js
* (Bluefox) Fix problem with select background in edit mode.
* (Bluefox) Add kde-folder.png again.
* (Bluefox) hqWidgest: Show charts for In/Out temperature widget …
* (Bluefox) hqWidgets: Save position of information window, e.g. Camera
* (Bluefox) Extend settings for charts
* (Bluefox) Support of lastStateChanged timestamp
* (Bluefox) Translate Charts settings
* (Bluefox) Fix error with ipCam and auto open info window

### 0.9beta6

* (Bluefox)	Fix problem with Info and logical value Do not show control for window if no actor projected
* (Bluefox) Show battery problems by door and window widgets.
* (Bluefox) Description for battery problem if window widget.
* (Bluefox) Fix hwWidget/Window in Firefox
* (Bluefox) Fix error if HM_ID not exist

### 0.9beta5

* (Bluefox) Fix image of button if pressed

### 0.9beta4

* (Hobbyquaker) Bugfixes: diverse Widgets aus den Widget-Sets Basic, jqui und jqui-mfd

### 0.9beta3

* (Bluefox) HqWidgets Update Geräte

### 0.9beta2

* (Hobbyquaker) Popup wenn Verbindung zu CCU.IO unterbrochen ist

### 0.9beta1

* (Hobbyquaker) Aufgeräumt

### 0.9dev

* (Hobbyquaker, Bluefox)    Anpassung an CCU.IO, Bugfixes
* (Smiling-Jack)* (Bluefox) Swipe-Widget (Navigation via Touch-Gesten)
* Neuer Contributor: Smiling-Jack - Herzlich Willkommen! :-)

### 0.8.4-0.8.6

* (Bluefox) Yahoo Weather widget.
* (Bluefox) Htc Weather widget.
* (Bluefox) Simple Clock
* (Bluefox) Flip Clock
* (Bluefox) Kein neue Funktionalitaet, nur Umstrukturierung.
* (Bluefox) Jedes Widget-Set hat eigenes "js", "css" und "img" Verzeichnis
* (Bluefox) Edit und Engine geteilt.
* (Bluefox) Gauge widget 
* (Bluefox) Styles fur Button
* (Bluefox) Fixed Fenster und Rolladen
* (Bluefox) Neue hqWidgets Komponente: Gong, IP Camera. 
* (Bluefox) Soll Wert fuer Thermostat
* (Bluefox) Fixed Problem mit Positionierung
* (Bluefox) Letzte Statusanderung-Anzeige
* (Bluefox) Status Changed- Animation
* (Bluefox) Advanced Settings
* (hobbyquaker) CCU.IO integriert

### 0.8.3
* (Bluefox) diverse Fehler behoben
* (Eisbaer) diverse Fehler behoben
* Neuer Contributor: Eisbaer - Herzlich Willkommen! :-)

### 0.8.2
* (Bluefox) hqWidgets: Button, Shutter, Lock, Door, Text, Image, Info, InTemp, OutTemp

### 0.8.1

* (Bluefox) Neuer Dialog zur Geräteauswahl
* (Bluefox) Neuer Dialog zur Bilderauswahl
* (Bluefox) Neuer Selector für vodefinierte View-Hintergründe
* Neuer Contributor: Bluefox - Herzlich Willkommen! :-)

### 0.8

* (Hobbyquaker) Fehler im Theme "Kiandra" behoben
* (Hobbyquaker) Snapping hinzugefügt: einfacheres Positionieren von Widgets wahlweise an einem Gitter oder an anderen Widgets
* (Hobbyquaker) Neuer Reiter "Editor" um das Snapping zu konfigurieren
* (Hobbyquaker) Fehler behoben der dazu führte dass Variablen nicht richtig gesetzt wurden
* (Hobbyquaker) Widget "basic hm_val - String img src" hinzugefügt
* (Bluefox) Neuer Dialog zur Gerateauswahl
* (Bluefox) Neuer Dialog zur Bilderauswahl
* (Bluefox) Neuer Selector fur vodefinierte View-Hintergrunde 

### 0.8

* (Hobbyquaker) Neues Widget-Set "Knobs"
* (Hobbyquaker) 3 Neue Widgets zur animierten Navigation zwischen Views
* (Hobbyquaker) Neue Widgets im Widget-Set "fancyswitch"
* (Hobbyquaker) Neue Colorpicker-Widgets
* (Hobbyquaker) diverse neue Widgets im Widget-Set "basic"


### 0.7

* (Hobbyquaker) Container implementiert, Views können nun in Widgets und jQuery UI Dialogen dargestellet werden
* (Hobbyquaker) Fehler behoben - Buttons waren nicht mehr editierbar
* (Hobbyquaker) Dialog-Widgets mit zusätzlichen Attributen ausgestattet
* (Hobbyquaker) container und view id präfix, link disable im edit-mode
* (Hobbyquaker) neues Widget-Set: "fancyswitch"
* (Hobbyquaker) Widget-Definitionen und Bindings in eigene Files ausgelagert
* (Hobbyquaker) toggle Binding und neue Widgets
* (Hobbyquaker) diverse Fehler behoben, Pfade gekürzt (100-Zeichen-Limit...)


### 0.6

* (Hobbyquaker) Sind keine lokalen Views vorhanden wird nun automatisch versucht die Views von der CCU zu laden
* (Hobbyquaker) Wahrend des Ladevorgangs wird div#loader eingeblendet
* (Hobbyquaker) Widget-Select wird nun aktualisiert wenn Widgets gelascht werden
* (Hobbyquaker) Diverse Fehler beim duplizieren von Views behoben
* (Hobbyquaker) Beim U?ndern von Widget-Attributen werden Widgets nun neu gerendert, es ist kein Reload mehr notwendig
* (Hobbyquaker) View-Select ist jetzt alphabetisch sortiert
* (Hobbyquaker) Instanzen und Variablen fur externe Kommandos werden nicht mehr automatisch angelegt und konnen entfernt werden
* (Hobbyquaker) Widget "mfd-icon Shutter/Dimmer + jqui Dialog" neue Attribute autoclose und modal
* (Hobbyquaker) Widget "basic - Red Number" Zahl sitzt nun sauber in der Mitte
* (Hobbyquaker) Widget "jqui Button Link" und "jqui Button Link _blank" fehlendes Attribut erganzt



### 0.5

* (Hobbyquaker) externe Steuerung über automatisch angelegte Systemvariablen, bisherige Befehle: alert, changeView, reload, popup
* (Hobbyquaker) Widget jqui Radio ValueList hinzugefügt
* (Hobbyquaker) Widget jqui Select ValueList hinzugefügt
* (Hobbyquaker) diverse Fehler behoben
* (Hobbyquaker) Widget jqui Input Datetime ausgearbeitet


### 0.4

* (Hobbyquaker) Views können nun unterschiedliche jQuery UI Themes zugewiesen werden, 3 Themes sind bisher mitgeliefert
* (Hobbyquaker) Ab sofort kann als Attribut hm_id neben der id auch eine Adresse in der Form BidCos-RF.EEQ0012345:1.LEVEL bzw ein Variablen- oder Programmname angegeben werden
* (Hobbyquaker) Über http://ccu/addons/dashui/reset.html kann der Cache komplett geleert werden
* (Hobbyquaker) diverse Fehler beim Selektieren von Widgets und Wechseln der View behoben
* (Hobbyquaker) Views können nun gelöscht und umbenannt werden
* (Hobbyquaker) Views werden nun erst beim erstmaligen Aufruf gerendert (merzt auch jqPlot Probleme aus)
* (Hobbyquaker) Views und Widget können nun CSS-Klassen zugewiesen werden
* (Hobbyquaker) Widget jqui-input und jqui-input-set-button mit weiteren Attributen ausgestattet
* (Hobbyquaker) Widget mfd-icon Shutter angepasst
* (Hobbyquaker) Widget basic - rednumber: Zeigt Ganzzahlwerte an, verschwindet bei Wert 0 (iOS-Like...)
* (Hobbyquaker) mfd-icons werden nun vollständig mitgeliefert

### 0.3

* (Hobbyquaker) Erstes öffentliches Release



## In DashUI verwendete Software

* jQuery http://jquery.com/
* CanJS http://canjs.com/
* lostorage.js https://github.com/js-coder/loStorage.js
* jQuery UI http://jqueryui.com/
* jQuery UI Multiselect Widget https://github.com/ehynds/jquery-ui-multiselect-widget
* jQuery UI Timepicker http://trentrichardson.com/examples/timepicker/
* jqPlot http://www.jqplot.com/
* CC-Lizensierte Icons aus dem KNX-User-Forum http://knx-user-forum.de mfd.gfx@gmail.com User: mfd

## Copyright, Lizenz, Bedingungen

DashUI

Copyright (c) 2013 hobbyquaker https://github.com/hobbyquaker

MIT Lizenz (MIT)

Hiermit wird unentgeltlich, jeder Person, die eine Kopie der Software und der zugehörigen Dokumentationen (die
"Software") erhält, die Erlaubnis erteilt, sie uneingeschränkt zu benutzen, inklusive und ohne Ausnahme, dem Recht,
sie zu verwenden, kopieren, ändern, fusionieren, verlegen, verbreiten, unterlizenzieren und/oder zu verkaufen, und

Personen, die diese Software erhalten, diese Rechte zu geben, unter den folgenden Bedingungen:

Der obige Urheberrechtsvermerk und dieser Erlaubnisvermerk sind in allen Kopien oder Teilkopien der Software beizulegen.

DIE SOFTWARE WIRD OHNE JEDE AUSDRÜCKLICHE ODER IMPLIZIERTE GARANTIE BEREITGESTELLT, EINSCHLIESSLICH DER GARANTIE ZUR
BENUTZUNG FÜR DEN VORGESEHENEN ODER EINEM BESTIMMTEN ZWECK SOWIE JEGLICHER RECHTSVERLETZUNG, JEDOCH NICHT DARAUF
BESCHRÜNKT. IN KEINEM FALL SIND DIE AUTOREN ODER COPYRIGHTINHABER FÜR JEGLICHEN SCHADEN ODER SONSTIGE ANSPRÜCHE
HAFTBAR ZU MACHEN, OB INFOLGE DER ERFÜLLUNG EINES VERTRAGES, EINES DELIKTES ODER ANDERS IM ZUSAMMENHANG MIT DER
SOFTWARE ODER SONSTIGER VERWENDUNG DER SOFTWARE ENTSTANDEN.


HomeMatic und das HomeMatic Logo sind eingetragene Warenzeichen der eQ-3 AG
