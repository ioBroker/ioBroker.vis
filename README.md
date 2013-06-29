CCU.IO
======

Socket.IO basierte Schnittstelle für die HomeMatic CCU (Funk, Wired und CUxD)

CCU.IO ist eine Node.js Applikation die via BIN-RPC mit rfd, hs485d und cuxd kommuniziert. CCU.IO kann - aber muss nicht -
auf der CCU2 installiert werden. Ein integrierter Websocket Server dient dazu Webbrowsern oder anderen Servern die von
der CCU empfangene Events durchzureichen. Somit ist es möglich Weboberflächen für die CCU2 zu erstellen die ohne zusätzlichen
Server auskommen und per Push-Prinzip über Änderungen informiert werden - das Ressourcenintensive Polling der CCU wie es z.B.
WebMatic und HQ WebUI betreiben ist somit nur noch für Variablen notwendig.

Die enthaltene BIN RPC Bibliothek binrpc.js kann auch losgelöst von CCU.IO in anderen Node basierten Projekten als Schnittstelle
zur CCU eingesetzt werden.

## Vorraussetzungen

CCU.IO benötigt Node.js:
* Binärfile für die CCU2 hab ich gebaut und hier veröffentlicht: https://github.com/hobbyquaker/node-ccu2
* Binärpakete für Raspbian gibt es hier: https://gist.github.com/adammw/3245130
* Installer für Linux, OSX, Sun, Windows sowie die Sourcen gibt es hier: http://nodejs.org/download/


## Ausprobieren!

* in der Datei ccu.io.js müssen die IP des Hosts auf dem Node.js läuft sowie die IP der CCU angepasst werden. (Läuft CCU.IO auf
der CCU2 selbst kann hier an beiden stellen 127.0.0.1 eingetragen werden.)
* In test.html die IP des Node-Servers anpassen
* Den Server starten: node ccu.io.js
* die Datei test.html im Browser aufrufen. -> Events sollten nun in der Browser-Konsole erscheinen

## Todo/Roadmap

## Changelog

0.1 - erstes öffentliches Release

## Lizenz

Copyright (c) 2013 hobbyquaker
Lizenz: CC BY-NC 3.0

Sie dürfen:

das Werk bzw. den Inhalt vervielfältigen, verbreiten und öffentlich zugänglich machen
Abwandlungen und Bearbeitungen des Werkes bzw. Inhaltes anfertigen
Zu den folgenden Bedingungen:

Namensnennung - Sie müssen den Namen des Autors/Rechteinhabers in der von ihm festgelegten Weise nennen.
Keine kommerzielle Nutzung — Dieses Werk bzw. dieser Inhalt darf nicht für kommerzielle Zwecke verwendet werden.
Wobei gilt:

Verzichtserklärung - Jede der vorgenannten Bedingungen kann aufgehoben werden, sofern Sie die ausdrückliche Einwilligung des Rechteinhabers dazu erhalten.
Die Veröffentlichung dieser Software erfolgt in der Hoffnung, daß sie Ihnen von Nutzen sein wird, aber OHNE IRGENDEINE GARANTIE, sogar ohne die implizite Garantie der MARKTREIFE oder der VERWENDBARKEIT FÜR EINEN BESTIMMTEN ZWECK.

Die Nutzung dieser Software erfolgt auf eigenes Risiko. Der Author dieser Software kann für eventuell auftretende Folgeschäden nicht haftbar gemacht werden!