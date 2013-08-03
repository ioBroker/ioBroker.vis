# DashUI

* [DashUI Homepage](http://hobbyquaker.github.io/DashUI) 
* [DashUI Widget Wiki](https://github.com/hobbyquaker/DashUI/wiki/)


## Todo

* Mehr Widgets! ;-)
* Config-File, Editor und Engine sauber trennen
* Erweiterte Template-Attribute: Doku, Kompatibilitat, ...

## Changelog
### 0.8.x
* (Bluefox) Gauge widget 
            config.js - Bitte eigene IP Adresse einstellen
            Styles fur Button
            Fixed Fenster und Rolladen


### 0.8.6
* (Bluefox) Neue hqWidgets Komponente: Gong, IP Camera. 
            Soll Wert fuer Thermostat
            Fixed Problem mit Positionierung
            Letzte Statusanderung-Anzeige
            Status Changed- Animation
            Advanced Settings

## Changelog
### 0.8.4
* (hobbyquaker) CCU.IO integriert

### 0.8.3
* (Bluefox) diverse Fehler behoben
* (Eisbaer) diverse Fehler behoben

### 0.8.2
* (Bluefox) hqWidgets: Button, Shutter, Lock, Door, Text, Image, Info, InTemp, OutTemp

### 0.8.1
* Neuer Contributor: Bluefox - Herzlich Willkommen! :-)
* (Bluefox) Neuer Dialog zur Gerateauswahl
* (Bluefox) Neuer Dialog zur Bilderauswahl
* (Bluefox) Neuer Selector fur vodefinierte View-Hintergrunde 

### 0.8
* Fehler im Theme "Kiandra" behoben
* Snapping hinzugefugt: einfacheres Positionieren von Widgets wahlweise an einem Gitter oder an anderen Widgets
* Neuer Reiter "Editor" um das Snapping zu konfigurieren
* Fehler behoben der dazu fuhrte dass Variablen nicht richtig gesetzt wurden
* Widget "basic hm_val - String img src" hinzugefugt
* Neues Widget-Set "Knobs"
* 3 Neue Widgets zur animierten Navigation zwischen Views
* Neue Widgets im Widget-Set "fancyswitch"
* Neue Colorpicker-Widgets
* diverse neue Widgets im Widget-Set "basic"


### 0.7
* Container implementiert, Views konnen nun in Widgets und jQuery UI Dialogen dargestellet werden
* Fehler behoben - Buttons waren nicht mehr editierbar
* Dialog-Widgets mit zusatzlichen Attributen ausgestattet
* container und view id prafix, link disable im edit-mode
* neues Widget-Set: "fancyswitch"
* Widget-Definitionen und Bindings in eigene Files ausgelagert
* toggle Binding und neue Widgets
* diverse Fehler behoben, Pfade gekurzt (100-Zeichen-Limit...)

### 0.6

* Sind keine lokalen Views vorhanden wird nun automatisch versucht die Views von der CCU zu laden
* Wahrend des Ladevorgangs wird div#loader eingeblendet
* Widget-Select wird nun aktualisiert wenn Widgets gelascht werden
* Diverse Fehler beim duplizieren von Views behoben
* Beim U?ndern von Widget-Attributen werden Widgets nun neu gerendert, es ist kein Reload mehr notwendig
* View-Select ist jetzt alphabetisch sortiert
* Instanzen und Variablen fur externe Kommandos werden nicht mehr automatisch angelegt und konnen entfernt werden
* Widget "mfd-icon Shutter/Dimmer + jqui Dialog" neue Attribute autoclose und modal
* Widget "basic - Red Number" Zahl sitzt nun sauber in der Mitte
* Widget "jqui Button Link" und "jqui Button Link _blank" fehlendes Attribut erganzt


### 0.5

* externe Steuerung uber automatisch angelegte Systemvariablen, bisherige Befehle: alert, changeView, reload, popup
* Widget jqui Radio ValueList hinzugefugt
* Widget jqui Select ValueList hinzugefugt
* diverse Fehler behoben
* Widget jqui Input Datetime ausgearbeitet


### 0.4

* Views konnen nun unterschiedliche jQuery UI Themes zugewiesen werden, 3 Themes sind bisher mitgeliefert
* Ab sofort kann als Attribut hm_id neben der id auch eine Adresse in der Form BidCos-RF.EEQ0012345:1.LEVEL bzw ein Variablen- oder Programmname angegeben werden
* Uber http://ccu/addons/dashui/reset.html kann der Cache komplett geleert werden
* diverse Fehler beim Selektieren von Widgets und Wechseln der View behoben
* Views konnen nun geloscht und umbenannt werden
* Views werden nun erst beim erstmaligen Aufruf gerendert (merzt auch jqPlot Probleme aus)
* Views und Widget konnen nun CSS-Klassen zugewiesen werden
* Widget jqui-input und jqui-input-set-button mit weiteren Attributen ausgestattet
* Widget mfd-icon Shutter angepasst
* Widget basic - rednumber: Zeigt Ganzzahlwerte an, verschwindet bei Wert 0 (iOS-Like...)
* mfd-icons werden nun vollstandig mitgeliefert

### 0.3

* Erstes offentliches Release


## In DashUI verwendete Software

* jQuery http://jquery.com/
* CanJS http://canjs.com/
* lostorage.js https://github.com/js-coder/loStorage.js
* jqHomematic https://github.com/hobbyquaker/jqHomematic
* jQuery UI http://jqueryui.com/
* jQuery UI Multiselect Widget https://github.com/ehynds/jquery-ui-multiselect-widget
* jQuery UI Timepicker http://trentrichardson.com/examples/timepicker/
* jqPlot http://www.jqplot.com/
* CC-Lizensierte Icons aus dem KNX-User-Forum http://knx-user-forum.de mfd.gfx@gmail.com User: mfd

## Copyright, Lizenz, Bedingungen

DashUI

Copyright (c) 2013 hobbyquaker https://github.com/hobbyquaker

MIT Lizenz (MIT)

Hiermit wird unentgeltlich, jeder Person, die eine Kopie der Software und der zugehorigen Dokumentationen (die
"Software") erhalt, die Erlaubnis erteilt, sie uneingeschrankt zu benutzen, inklusive und ohne Ausnahme, dem Recht,
sie zu verwenden, kopieren, andern, fusionieren, verlegen, verbreiten, unterlizenzieren und/oder zu verkaufen, und
Personen, die diese Software erhalten, diese Rechte zu geben, unter den folgenden Bedingungen:

Der obige Urheberrechtsvermerk und dieser Erlaubnisvermerk sind in allen Kopien oder Teilkopien der Software beizulegen.

DIE SOFTWARE WIRD OHNE JEDE AUSDRU?CKLICHE ODER IMPLIZIERTE GARANTIE BEREITGESTELLT, EINSCHLIESSLICH DER GARANTIE ZUR
BENUTZUNG FU?R DEN VORGESEHENEN ODER EINEM BESTIMMTEN ZWECK SOWIE JEGLICHER RECHTSVERLETZUNG, JEDOCH NICHT DARAUF
BESCHRU?NKT. IN KEINEM FALL SIND DIE AUTOREN ODER COPYRIGHTINHABER FU?R JEGLICHEN SCHADEN ODER SONSTIGE ANSPRU?CHE
HAFTBAR ZU MACHEN, OB INFOLGE DER ERFU?LLUNG EINES VERTRAGES, EINES DELIKTES ODER ANDERS IM ZUSAMMENHANG MIT DER
SOFTWARE ODER SONSTIGER VERWENDUNG DER SOFTWARE ENTSTANDEN.


HomeMatic und das HomeMatic Logo sind eingetragene Warenzeichen der eQ-3 AG