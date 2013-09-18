
# DashUI

## Installation & Dokumentation

siehe [DashUI Homepage](http://hobbyquaker.github.io/DashUI)


## Todo/Roadmap

### 0.9

* Alle vorhandenen Widgets testen & Bugs fixen
* "basic - hm_val valuelist-view-container" widget (bestimmte View in Container-Widget in abhängigkeit von Variable anzeigen)
* "basic - static iframe" widget mit attribut refresh-interval, persistent
* neues Widget-Attribut: Integrierte Doku -> im Editor anzeigbar
* neues Widget-Attribut: Kompatibilitat um ID-Auswahl vorab einzugrenzen
* neues Widget-Attribut: Widgetset - um vorab zu prüfen welche Widget-Sets geladen werden müssen (im Editmodus immer alle laden)


### 1.0

* Doku!
* Alle vorhandenen Widgets testen & Bugs fixen
* Bild-Upload (im Reiter Editor unterbringen?)
* Editor: mehrere Widgets auf einmal Bewegen
* Editor/CSS-Inspector: Zauberstab-tool um Style-Eigenschaften von anderen Widgets zu übernehmen
* Wunderground/yr.no Widgets via CCU.IO
* Hue Widgets via CCU.IO
* Noch mehr Widgets! :)
* Editor "aufhübschen"
* Einfache Installation gemeinsam mit CCU.IO
* Web-based Setup
* Javascript-Files minifiziert und teilweise gemerged ausliefern
* Paket für Raspbian
* RaspberryPi Speicherkartenimage
* Mehr Widgets! Doku! ;-)

## Changelog

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
