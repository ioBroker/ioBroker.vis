
# DashUI

## Installation & Dokumentation

siehe [DashUI Homepage](http://hobbyquaker.github.io/DashUI)


## Todo/Roadmap

### 0.9

* "basic - hm_val valuelist-view-container" widget (bestimmte View in Container-Widget in abhängigkeit von Variable anzeigen)
* "basic - static iframe" widget mit attribut refresh-interval, persistent

### 1.0

* Doku!
* Alle vorhandenen Widgets testen & Bugs fixen
* Bild-Upload (im Reiter Editor unterbringen?)
* Editor: mehrere Widgets auf einmal Bewegen
* Editor/CSS-Inspector: Zauberstab-tool um Style-Eigenschaften von anderen Widgets zu übernehmen
* Noch mehr Widgets! :)
* Editor "aufhübschen"
* Einfache Installation gemeinsam mit CCU.IO
* Web-based Setup
* Javascript-Files minifiziert und teilweise gemerged ausliefern
* Paket für Raspbian
* RaspberryPi Speicherkartenimage
* Mehr Widgets! Doku! ;-)

## Changelog

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
* (Smiling-Jack)            Swipe-Widget (Navigation via Touch-Gesten)
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
