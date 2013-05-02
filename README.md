# DashUI 0.3

## Installation auf der CCU

Es wird ein Zugang zur CCU via FTP oder SCP benötigt.

* Addon "WebAPI" installieren: den Ordner "webapi" auf diesem Zip-File https://github.com/hobbyquaker/WebAPI/archive/master.zip nach /www/addons/ kopieren)
* Den Ordner "dashui" aus diesem Zip-File https://github.com/hobbyquaker/DashUI/archive/master.zip ebenfalls nach /www/addons kopieren
* auf der CCU leeren Ordner "dashui" in /usr/local/addons/ erstellen (hier werden Konfigurationen gespeichert)

## Dokumentation

### Schnellstart

* http://ccu/addons/dashui/?edit aufrufen
* Nun können Widgets und Views hinzugefügt und konfiguriert werden
* Widgets werden automatisch aktualisiert sobald der Editor geschlossen wird
* Man muss manuell über die Buttons "auf CCU speichern" und "von CCU laden" im Reiter Homematic die Konfiguration auf der CCU sichern und laden. Automatisch gesichert wird nur im "localstorage" des Browsers.
* Bestimmte Widget-Attribute erfordern das Neuladen mit dem Browser damit Änderungen sichtbar werden.
* Bestimmte Views können über http://ccu/addons/dashui/#NameDerView direkt aufgerufen werden

### Widgets

#### Homematic-Attribute

* hm_id ist die ID eines Datepunkts (STATE, LEVEL, TEMPERATURE, ...). Zum nachschauen dieser IDs bietet sich das CCU-Addon HQ WebUI an.
* hm_wid (kann weggelassen werden) ist die ID des zugehörigen WORKING Datenpunkts, sinnvoll bei Dimmern und Rollläden um springende Slider während Aktivität der Aktoren zu verhindern.

#### basic - HTML

Zeigt beliebigen HTML Code an. Hiermit können z.B. auch Bilder oder Iframes angezeigt eingebunden werden.

#### basic - Value List

Zeigt eine Homematic-Variable vom Typ Werteliste an.
Der Parameter valuelist muss als ; (Semikolon) getrennte Liste angegeben werden

#### jqplot - MeterGauge Widget

Zeigt Homematic Zahlenwerte (Variablen, Datenpunkte) als Tachometer an.
Alle weiteren Parameter sind hier dokumentiert: <a href="http://www.jqplot.com/docs/files/plugins/jqplot-meterGaugeRenderer-js.html" target="_blank">jqPlot Docs meterGauge</a></li>

Die Parameter ticks, intervals, intervalColors können als ; (Semikolon) getrennte Liste angegeben werden

### Navigation

* Zur Navigation können normale Links oder Link-Widgets mit href="#NameDerView" genutzt werden.


### Rohdaten bearbeiten

Das Javascript Object in dem alle Views und Widgets gespeichert werden kann über http://homematic/addons/dashui/views.html bearbeitet werden.

## Todo / Bekannte Fehler / Roadmap

* Views duplizieren, umbenennen und löschen implementieren
* Fehler beheben - manchmal erscheint kein Inspect-Helper (gestrichelte Linie um Widget) wenn neu eingefügtes Widget angeklickt wird
* Fehler beheben bei Widget auf andere View kopieren (wird erst nach Reload sichtbar)
* Fehler beheben jqPlot Gauge Widget: Wird nur Fehlerfrei auf der sichtbaren View gerendert :(
* Config-File
* Mehr Widgets! ;-)
* Erweiterte Template-Attribute: Doku, Kompatibilität, ...
* Erweiterte Widget-Attribute: CSS-Klassen, Kommentar, ...
* Erweiterte View-Attribute: CSS-Klassen, jqui-Theme?
* Navigations-Effekte (Beim Wechseln der View konfigurierbare Animationen)

## Changelog

### 0.4

* mfd-icon Shutter Widget an Homematic angepasst (umgedreht)

### 0.3

* Erstes Öffentliches Release


## In DashUI verwendete Software
* jQuery http://jquery.com/
* CanJS http://canjs.com/
* jqHomematic https://github.com/hobbyquaker/jqHomematic
* jQuery UI http://jqueryui.com/
* jqPlot http://www.jqplot.com/
* lostorage.js https://github.com/js-coder/loStorage.js
* jQuery UI Multiselect Widget https://github.com/ehynds/jquery-ui-multiselect-widget
* Icons aus dem KNX-User-Forum http://knx-user-forum.de mfd.gfx@gmail.com User: mfd (CC Lizensiert)

## Copyright, Lizenz, Bedingungen

DashUI

Copyright (c) 2013 hobbyquaker https://github.com/hobbyquaker

MIT Lizenz (MIT)

Hiermit wird unentgeltlich, jeder Person, die eine Kopie der Software und der zugehörigen Dokumentationen (die
"Software") erhält, die Erlaubnis erteilt, sie uneingeschränkt zu benutzen, inklusive und ohne Ausnahme, dem Recht,
sie zu verwenden, kopieren, ändern, fusionieren, verlegen, verbreiten, unterlizenzieren und/oder zu verkaufen, und
Personen, die diese Software erhalten, diese Rechte zu geben, unter den folgenden Bedingungen:

Der obige Urheberrechtsvermerk und dieser Erlaubnisvermerk sind in allen Kopien oder Teilkopien der Software beizulegen.

DIE SOFTWARE WIRD OHNE JEDE AUSDRÜCKLICHE ODER IMPLIZIERTE GARANTIE BEREITGESTELLT, EINSCHLIESSLICH DER GARANTIE ZUR
BENUTZUNG FÜR DEN VORGESEHENEN ODER EINEM BESTIMMTEN ZWECK SOWIE JEGLICHER RECHTSVERLETZUNG, JEDOCH NICHT DARAUF
BESCHRÄNKT. IN KEINEM FALL SIND DIE AUTOREN ODER COPYRIGHTINHABER FÜR JEGLICHEN SCHADEN ODER SONSTIGE ANSPRÜCHE
HAFTBAR ZU MACHEN, OB INFOLGE DER ERFÜLLUNG EINES VERTRAGES, EINES DELIKTES ODER ANDERS IM ZUSAMMENHANG MIT DER
SOFTWARE ODER SONSTIGER VERWENDUNG DER SOFTWARE ENTSTANDEN.


HomeMatic und das HomeMatic Logo sind eingetragene Warenzeichen der eQ-3 AG