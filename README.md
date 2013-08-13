# DashUI

* [DashUI Homepage](http://hobbyquaker.github.io/DashUI) 
* [DashUI Widget Wiki](https://github.com/hobbyquaker/DashUI/wiki/)


## Todo
..

## Roadmap

### 0.9

* jqHomematic/WebAPI fliegt raus, komplette CCU-Kommunikation via CCU.IO
* diverse Todos CCU.IO
* Anpassung Kanalauswahl / Bildauswahl an CCU.IO
* mehr Widgets :)
* Editor: mehrere Widgets auf einmal Bewegen
* Editor/CSS-Inspector: Zauberstab-tool um Style-Eigenschaften von anderen Widgets zu übernehmen
* hm-ctrl valuelist view container widget (bestimmte view in abhängigkeit von Variable anzeigen)
* instanz-steuerung via eigenes (cuxd)gerät?
* Alle vorhandenen Widgets fixen
* Wunderground/yr.no Widgets via CCU.IO
* Hue Widgets via CCU.IO


### 1.0

* vollständige Trennung Engine/Editor, Performanceoptimierung
* Noch mehr Widgets! :)
* Doku
* Einfache Installation gemeinsam mit CCU.IO, Pakete für Raspbian und CCU2


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
* (Bluefox) Neuer Dialog zur Geräteauswahl
* (Bluefox) Neuer Dialog zur Bilderauswahl
* (Bluefox) Neuer Selector für vodefinierte View-Hintergründe 

### 0.8
* Fehler im Theme "Kiandra" behoben
* Snapping hinzugefügt: einfacheres Positionieren von Widgets wahlweise an einem Gitter oder an anderen Widgets
* Neuer Reiter "Editor" um das Snapping zu konfigurieren
* Fehler behoben der dazu führte dass Variablen nicht richtig gesetzt wurden
* Widget "basic hm_val - String img src" hinzugefügt
* Neues Widget-Set "Knobs"
* 3 Neue Widgets zur animierten Navigation zwischen Views
* Neue Widgets im Widget-Set "fancyswitch"
* Neue Colorpicker-Widgets
* diverse neue Widgets im Widget-Set "basic"


### 0.7
* Container implementiert, Views können nun in Widgets und jQuery UI Dialogen dargestellet werden
* Fehler behoben - Buttons waren nicht mehr editierbar
* Dialog-Widgets mit zusätzlichen Attributen ausgestattet
* container und view id präfix, link disable im edit-mode
* neues Widget-Set: "fancyswitch"
* Widget-Definitionen und Bindings in eigene Files ausgelagert
* toggle Binding und neue Widgets
* diverse Fehler behoben, Pfade gekürzt (100-Zeichen-Limit...)

### 0.6

* Sind keine lokalen Views vorhanden wird nun automatisch versucht die Views von der CCU zu laden
* Während des Ladevorgangs wird div#loader eingeblendet
* Widget-Select wird nun aktualisiert wenn Widgets geläscht werden
* Diverse Fehler beim duplizieren von Views behoben
* Beim Ündern von Widget-Attributen werden Widgets nun neu gerendert, es ist kein Reload mehr notwendig
* View-Select ist jetzt alphabetisch sortiert
* Instanzen und Variablen für externe Kommandos werden nicht mehr automatisch angelegt und können entfernt werden
* Widget "mfd-icon Shutter/Dimmer + jqui Dialog" neue Attribute autoclose und modal
* Widget "basic - Red Number" Zahl sitzt nun sauber in der Mitte
* Widget "jqui Button Link" und "jqui Button Link _blank" fehlendes Attribut ergänzt


### 0.5

* externe Steuerung über automatisch angelegte Systemvariablen, bisherige Befehle: alert, changeView, reload, popup
* Widget jqui Radio ValueList hinzugefügt
* Widget jqui Select ValueList hinzugefügt
* diverse Fehler behoben
* Widget jqui Input Datetime ausgearbeitet


### 0.4

* Views können nun unterschiedliche jQuery UI Themes zugewiesen werden, 3 Themes sind bisher mitgeliefert
* Ab sofort kann als Attribut hm_id neben der id auch eine Adresse in der Form BidCos-RF.EEQ0012345:1.LEVEL bzw ein Variablen- oder Programmname angegeben werden
* Über http://ccu/addons/dashui/reset.html kann der Cache komplett geleert werden
* diverse Fehler beim Selektieren von Widgets und Wechseln der View behoben
* Views können nun gelöscht und umbenannt werden
* Views werden nun erst beim erstmaligen Aufruf gerendert (merzt auch jqPlot Probleme aus)
* Views und Widget können nun CSS-Klassen zugewiesen werden
* Widget jqui-input und jqui-input-set-button mit weiteren Attributen ausgestattet
* Widget mfd-icon Shutter angepasst
* Widget basic - rednumber: Zeigt Ganzzahlwerte an, verschwindet bei Wert 0 (iOS-Like...)
* mfd-icons werden nun vollständig mitgeliefert

### 0.3

* Erstes öffentliches Release


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
