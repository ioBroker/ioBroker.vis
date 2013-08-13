# DashUI

* [DashUI Homepage](http://hobbyquaker.github.io/DashUI) 
* [DashUI Widget Wiki](https://github.com/hobbyquaker/DashUI/wiki/)

# Unbedingt IP Adressen einstellen!
  js/config.js Datei hat zwei wichtige Parameter, die fuer jeden Anwender unterschiedlich sind:
  ccu      - Ip Adresse von CCU
  ccuIoUrl - URL von CCU.IO, nur falls vorhanden, sonst auf "undefined" lassen.

## Todo
..

<<<<<<< HEAD
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
=======
* Mehr Widgets! ;-)
* Config-File, Editor und Engine sauber trennen
* Erweiterte Template-Attribute: Doku, Kompatibilitat, ...

## Changelog
### 0.8.x
* (Bluefox) Yahoo Weather widget.
            Htc Weather widget.
            Simple Clock
            Flip Clock


* (Bluefox) Kein neue Funktionalitaet, nur Umstrukturierung.
            config.js unbedingt updaten!
            Jedes Widget hat eigenes "js", "css" und "img" Verzeichnis 
            Edit und Engine geteilt.
            Um zu editieren, muss man edit.html (und nicht ?edit) aufrufen. Obwohl "?edit" wird umgeleitet.

* (Bluefox) Gauge widget 
            config.js - Bitte eigene IP Adresse einstellen
            Styles fur Button
            Fixed Fenster und Rolladen
>>>>>>> bluefox/master


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
<<<<<<< HEAD
* (Bluefox) Neuer Dialog zur Geräteauswahl
* (Bluefox) Neuer Dialog zur Bilderauswahl
* (Bluefox) Neuer Selector für vodefinierte View-Hintergründe 

### 0.8
* Fehler im Theme "Kiandra" behoben
* Snapping hinzugefügt: einfacheres Positionieren von Widgets wahlweise an einem Gitter oder an anderen Widgets
* Neuer Reiter "Editor" um das Snapping zu konfigurieren
* Fehler behoben der dazu führte dass Variablen nicht richtig gesetzt wurden
* Widget "basic hm_val - String img src" hinzugefügt
=======
* (Bluefox) Neuer Dialog zur Gerateauswahl
* (Bluefox) Neuer Dialog zur Bilderauswahl
* (Bluefox) Neuer Selector fur vodefinierte View-Hintergrunde 

### 0.8
* Fehler im Theme "Kiandra" behoben
* Snapping hinzugefugt: einfacheres Positionieren von Widgets wahlweise an einem Gitter oder an anderen Widgets
* Neuer Reiter "Editor" um das Snapping zu konfigurieren
* Fehler behoben der dazu fuhrte dass Variablen nicht richtig gesetzt wurden
* Widget "basic hm_val - String img src" hinzugefugt
>>>>>>> bluefox/master
* Neues Widget-Set "Knobs"
* 3 Neue Widgets zur animierten Navigation zwischen Views
* Neue Widgets im Widget-Set "fancyswitch"
* Neue Colorpicker-Widgets
* diverse neue Widgets im Widget-Set "basic"


### 0.7
<<<<<<< HEAD
* Container implementiert, Views können nun in Widgets und jQuery UI Dialogen dargestellet werden
* Fehler behoben - Buttons waren nicht mehr editierbar
* Dialog-Widgets mit zusätzlichen Attributen ausgestattet
* container und view id präfix, link disable im edit-mode
* neues Widget-Set: "fancyswitch"
* Widget-Definitionen und Bindings in eigene Files ausgelagert
* toggle Binding und neue Widgets
* diverse Fehler behoben, Pfade gekürzt (100-Zeichen-Limit...)
=======
* Container implementiert, Views konnen nun in Widgets und jQuery UI Dialogen dargestellet werden
* Fehler behoben - Buttons waren nicht mehr editierbar
* Dialog-Widgets mit zusatzlichen Attributen ausgestattet
* container und view id prafix, link disable im edit-mode
* neues Widget-Set: "fancyswitch"
* Widget-Definitionen und Bindings in eigene Files ausgelagert
* toggle Binding und neue Widgets
* diverse Fehler behoben, Pfade gekurzt (100-Zeichen-Limit...)
>>>>>>> bluefox/master

### 0.6

* Sind keine lokalen Views vorhanden wird nun automatisch versucht die Views von der CCU zu laden
<<<<<<< HEAD
* Während des Ladevorgangs wird div#loader eingeblendet
* Widget-Select wird nun aktualisiert wenn Widgets geläscht werden
* Diverse Fehler beim duplizieren von Views behoben
* Beim Ündern von Widget-Attributen werden Widgets nun neu gerendert, es ist kein Reload mehr notwendig
* View-Select ist jetzt alphabetisch sortiert
* Instanzen und Variablen für externe Kommandos werden nicht mehr automatisch angelegt und können entfernt werden
* Widget "mfd-icon Shutter/Dimmer + jqui Dialog" neue Attribute autoclose und modal
* Widget "basic - Red Number" Zahl sitzt nun sauber in der Mitte
* Widget "jqui Button Link" und "jqui Button Link _blank" fehlendes Attribut ergänzt
=======
* Wahrend des Ladevorgangs wird div#loader eingeblendet
* Widget-Select wird nun aktualisiert wenn Widgets gelascht werden
* Diverse Fehler beim duplizieren von Views behoben
* Beim U?ndern von Widget-Attributen werden Widgets nun neu gerendert, es ist kein Reload mehr notwendig
* View-Select ist jetzt alphabetisch sortiert
* Instanzen und Variablen fur externe Kommandos werden nicht mehr automatisch angelegt und konnen entfernt werden
* Widget "mfd-icon Shutter/Dimmer + jqui Dialog" neue Attribute autoclose und modal
* Widget "basic - Red Number" Zahl sitzt nun sauber in der Mitte
* Widget "jqui Button Link" und "jqui Button Link _blank" fehlendes Attribut erganzt
>>>>>>> bluefox/master


### 0.5

<<<<<<< HEAD
* externe Steuerung über automatisch angelegte Systemvariablen, bisherige Befehle: alert, changeView, reload, popup
* Widget jqui Radio ValueList hinzugefügt
* Widget jqui Select ValueList hinzugefügt
=======
* externe Steuerung uber automatisch angelegte Systemvariablen, bisherige Befehle: alert, changeView, reload, popup
* Widget jqui Radio ValueList hinzugefugt
* Widget jqui Select ValueList hinzugefugt
>>>>>>> bluefox/master
* diverse Fehler behoben
* Widget jqui Input Datetime ausgearbeitet


### 0.4

<<<<<<< HEAD
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
=======
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
>>>>>>> bluefox/master


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

<<<<<<< HEAD
Hiermit wird unentgeltlich, jeder Person, die eine Kopie der Software und der zugehörigen Dokumentationen (die
"Software") erhält, die Erlaubnis erteilt, sie uneingeschränkt zu benutzen, inklusive und ohne Ausnahme, dem Recht,
sie zu verwenden, kopieren, ändern, fusionieren, verlegen, verbreiten, unterlizenzieren und/oder zu verkaufen, und
=======
Hiermit wird unentgeltlich, jeder Person, die eine Kopie der Software und der zugehorigen Dokumentationen (die
"Software") erhalt, die Erlaubnis erteilt, sie uneingeschrankt zu benutzen, inklusive und ohne Ausnahme, dem Recht,
sie zu verwenden, kopieren, andern, fusionieren, verlegen, verbreiten, unterlizenzieren und/oder zu verkaufen, und
>>>>>>> bluefox/master
Personen, die diese Software erhalten, diese Rechte zu geben, unter den folgenden Bedingungen:

Der obige Urheberrechtsvermerk und dieser Erlaubnisvermerk sind in allen Kopien oder Teilkopien der Software beizulegen.

<<<<<<< HEAD
DIE SOFTWARE WIRD OHNE JEDE AUSDRÜCKLICHE ODER IMPLIZIERTE GARANTIE BEREITGESTELLT, EINSCHLIESSLICH DER GARANTIE ZUR
BENUTZUNG FÜR DEN VORGESEHENEN ODER EINEM BESTIMMTEN ZWECK SOWIE JEGLICHER RECHTSVERLETZUNG, JEDOCH NICHT DARAUF
BESCHRÜNKT. IN KEINEM FALL SIND DIE AUTOREN ODER COPYRIGHTINHABER FÜR JEGLICHEN SCHADEN ODER SONSTIGE ANSPRÜCHE
HAFTBAR ZU MACHEN, OB INFOLGE DER ERFÜLLUNG EINES VERTRAGES, EINES DELIKTES ODER ANDERS IM ZUSAMMENHANG MIT DER
=======
DIE SOFTWARE WIRD OHNE JEDE AUSDRU?CKLICHE ODER IMPLIZIERTE GARANTIE BEREITGESTELLT, EINSCHLIESSLICH DER GARANTIE ZUR
BENUTZUNG FU?R DEN VORGESEHENEN ODER EINEM BESTIMMTEN ZWECK SOWIE JEGLICHER RECHTSVERLETZUNG, JEDOCH NICHT DARAUF
BESCHRU?NKT. IN KEINEM FALL SIND DIE AUTOREN ODER COPYRIGHTINHABER FU?R JEGLICHEN SCHADEN ODER SONSTIGE ANSPRU?CHE
HAFTBAR ZU MACHEN, OB INFOLGE DER ERFU?LLUNG EINES VERTRAGES, EINES DELIKTES ODER ANDERS IM ZUSAMMENHANG MIT DER
>>>>>>> bluefox/master
SOFTWARE ODER SONSTIGER VERWENDUNG DER SOFTWARE ENTSTANDEN.


HomeMatic und das HomeMatic Logo sind eingetragene Warenzeichen der eQ-3 AG
