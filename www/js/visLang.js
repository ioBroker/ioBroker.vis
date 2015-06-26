/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2013-2015 bluefox https://github.com/GermanBluefox, hobbyquaker https://github.com/hobbyquaker
 *  Creative Common Attribution-NonCommercial (CC BY-NC)
 *
 *  http://creativecommons.org/licenses/by-nc/4.0/
 *
 * Short content:
 * Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.
 * Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.
 * (Free for non-commercial use).
 */
/* jshint browser:true */
/* jshint -W097 */// jshint strict:false
/* global $ */
/* global systemDictionary */


'use strict';


// Languages
$.extend(systemDictionary, {
    'Views':                {'en': 'Views', 'de': 'Views', 'ru': 'Страницы'},
    'Widgets':              {'en': 'Widgets', 'de': 'Widgets', 'ru': 'Элементы'},
    'CSS Inspector':        {'en': 'CSS Inspector', 'de': 'CSS Inspektor', 'ru': 'CSS'},
    'Misc':                 {'en': 'Misc', 'de': 'Versch.', 'ru': 'Разное'},
    'Info':                 {'en': 'Info', 'de': 'Info', 'ru': 'Инфо'},
    'default_filter_key':   {'en': 'Default filter:', 'de': 'Voreinge. Filter:', 'ru': 'Фильтр по умолчанию:'},
    'class':                {'en': 'CSS Class', 'de': 'CSS Klasse:', 'ru': 'CSS Класс'},
    'Snapping':             {'en': 'Snapping', 'de': 'Ausrichten', 'ru': 'Опорные точки'},
    'disabled':             {'en': 'Disabled', 'de': 'Inaktiv', 'ru': 'не&nbsp;активно'},
    'elements':             {'en': 'Elements', 'de': 'Elemente', 'ru': 'элементы'},
    'grid':                 {'en': 'Grid', 'de': 'Raster', 'ru': 'таблица'},
    'grid size':            {'en': 'Grid size:', 'de': 'Rastermaß:', 'ru': 'Шаг:'},
    'theme':                {'en': 'Theme:', 'de': 'Thema:', 'ru': 'Тема:'},
    '--different--':        {'en': 'different:', 'de': 'verschiedene', 'ru': 'разное'},
    'Screensize':           {'en': 'Screensize:', 'de': 'Bildschirmgröße', 'ru': 'Размер экрана'},
    'Width':                {'en': 'Width (px)', 'de': 'Breite (px)', 'ru': 'Ширина'},
    'Height':               {'en': 'Height (px)', 'de': 'Höhe (px)', 'ru': 'Высота'},
    'comment':              {'en': 'Comment', 'de': 'Kommentar', 'ru': 'Комментарий'},
    'Room:':                {'en': 'Room:', 'de': 'Raum:', 'ru': 'Комната:'},
    'Function:':            {'en': 'Function:', 'de': 'Gewerk:', 'ru': 'Функциональность:'},
    'Widget:':              {'en': 'Widget:', 'de': 'Widget:', 'ru': 'Элемент:'},
    'New View':             {'en': 'New View:', 'de': 'Neue View', 'ru': 'Новая страница'},
    'Current View':         {'en': 'Current View', 'de': 'Aktuelle View', 'ru': 'Текущая страница'},
    'New Name:':            {'en': 'New Name:', 'de': 'Neuer Name:', 'ru': 'Новое имя:'},
    'Name:':                {'en': 'Name:', 'de': 'Name:', 'ru': 'Имя:'},
    'Mode:':                {'en': 'Mode:', 'de': 'Mode:', 'ru': 'Режим:'},
    'Widget Set:':          {'en': 'Widget Set:', 'de': 'Widget Set:', 'ru': 'Пакет элементов:'},
    'View Attributes':      {'en': 'View Attributes', 'de': 'View-Eigenschaften', 'ru': 'Свойства страницы'},
    'External Commands':    {'en': 'External Commands', 'de': 'Externe Befehle', 'ru': 'Внешние комманды'},
    'View:':                {'en': 'View:', 'de': 'View:', 'ru': 'Страница:'},
    'Wizard':               {'en': 'Wizard', 'de': 'Wizard', 'ru': 'Помошник'},
    'wizard_run':           {'en': 'Run', 'de': 'Ausführen', 'ru': 'Выполнить'},
    'add_view':             {'en': 'Add', 'de': 'Hinzufügen', 'ru': 'Добавить'},
    'dup_view':             {'en': 'Duplicate', 'de': 'Duplizieren', 'ru': 'Копировать'},
    'del_view':             {'en': 'Delete', 'de': 'Löschen', 'ru': 'Удалить'},
    'rename_view':          {'en': 'Rename', 'de': 'Umbenennen', 'ru': 'Перемменовать'},
    'create_instance':      {'en': 'Create instance', 'de': 'Browser ID erzeugen', 'ru': 'Создать ID броузера'},
    'add_widget':           {'en': 'Add widget', 'de': 'Einfügen', 'ru': 'Добавить'},
    'del_widget':           {'en': 'Delete widget', 'de': 'Löschen', 'ru': 'Удалить'},
    'dup_widget':           {'en': 'Copy to:', 'de': 'Kopieren nach:', 'ru': 'Копия в:'},
    'Clipboard: ':          {'en': 'Clipboard:', 'de': 'Zwischenablage:', 'ru': 'Буфер:'},
    'New:':                 {'en': 'New:', 'de': 'Neues:', 'ru': 'Новое:'},
    "name":                 {"en": "Name", "de": "Name", "ru": "Имя"},
    "Select color":                 {"en": "Select color", "de": "Farbe auswählen", "ru": "Выбрать цвет"},
    'Confirm widget deletion': {
        'en': 'Confirm widget deletion',
        'de': 'Bestätigung',
        'ru': 'Подтвердите'
    },
    'Widget copied to view %s': {
        'en': 'Widget copied to view %s',
        'de': 'Widget wurde in die View "%s" kopiert',
        'ru': 'Элемент скопирован на страницу %s'
    },
    'Really delete view %s?': {
        'en': 'Really delete view %s?',
        'de': 'Wirklich View "%s" löschen?',
        'ru': 'Вы действительно хотите удалить страницу %s?'
    },
    'Do you want delete %s widgets?': {
        'en': 'Do you want delete %s widgets?',
        'de': 'Wirklich %s Widgets löschen?',
        'ru': 'Вы действительно хотите удалить %s элемента(ов)?'
    },
    'Do you want delete widget %s?': {
        'en': 'Do you want delete widget %s?',
        'de': 'Wirklich %s Widget löschen?',
        'ru': 'Вы действительно хотите удалить элемент %s?'
    },
    'Hide widget description': {
        'en': 'Hide widget description',
        'de': 'Zeige Widget-Beschreibung nicht',
        'ru': 'Скрыть описание элементов'
    },
    'Is hide':              {'en': 'Is hide', 'de': 'Verbergen', 'ru': 'Скрыть'},
    'User defined':         {'en': 'User defined', 'de': 'Vom Anwender definiert', 'ru': 'Пользовательское'},
    'Resolution':           {'en': 'Resolution:', 'de': 'Auflösung:', 'ru': 'Разрешение:'},
    'widget_doc':           {'en': 'Widget help', 'de': 'Widgethilfe', 'ru': 'Помощь'},
    'Add Widget:':          {'en': 'Add Widget:', 'de': 'Widget einf&uuml;gen:', 'ru': 'Добавить элемент:'},
    'Inspecting Widget:':   {'en': 'Inspecting Widget:', 'de': 'Widget inspizieren:', 'ru': 'Редактировать элемент:'},
    'Widget Attributes:':   {'en': 'Widget Attributes:', 'de': 'Widget-Eigenschaften:', 'ru': 'Свойства элемента:'},
    'filterkey':            {'en': 'Filter key', 'de': 'Filterwort', 'ru': 'Фильтр'},
    'views':                {'en': 'Show in views', 'de': 'Zeige in Views', 'ru': 'Показать на страницах'},
    'Background class':     {'en': 'Background class:', 'de': 'Hintergrundklasse:', 'ru': 'CSS класс фона:'},
    'Background':           {'en': 'Background:', 'de': 'Hintergrund:', 'ru': 'CSS класс фона:'},
    'Webseite':             {'en': 'Web link', 'de': 'Webseite', 'ru': 'Веб сайт'},
    'none selected':        {'en': 'none selected', 'de': 'nichts selektiert', 'ru': 'ничего не выбрано'},
    'Unterstützung':        {'en': 'Hilfe', 'de': 'Unterstützung', 'ru': 'Помощь'},
    'User name':            {'en': 'User name', 'de': 'Anwendername', 'ru': 'Imja polzovatelja'},
    'Password':             {'en': 'Password', 'de': 'Kennwort', 'ru': 'Parol'},
    'Sign in':              {'en': 'Sign in', 'de': 'Anmelden', 'ru': 'Voiti'},
    'Check all':            {'en': 'Check all', 'de': 'Alle selektieren', 'ru': 'Выбрать все'},
    'Uncheck all':          {'en': 'Uncheck all', 'de': 'Alle deselektieren', 'ru': 'Убрать все'},
    'Select options':       {'en': 'Select options', 'de': 'Selekteingensch.', 'ru': 'Свойства выбора'},
    'Änderungs-Historie':   {'en': 'Change log', 'de': 'Änderungs-Historie:', 'ru': 'Список изменений'},
    'invalid JSON':         {'en': 'Invalid JSON', 'de': 'Invalid JSON', 'ru': 'Неправильный формат'},
    'Do not ask again':     {'en': 'Don\'t ask again', 'de': 'Nicht mehr fragen', 'ru': 'Больше не спрашивать'},
    'import':               {'en': 'Import', 'de': 'Importieren', 'ru': 'Импорт'},
    'export view':          {'en': 'Export view', 'de': 'Exportieren', 'ru': 'Экспорт'},
    'export':               {'en': 'Export (Ctrl+A, Ctrl+C)', 'de': 'Exportieren (Strg+A, Strg+C)', 'ru': 'Экспорт (Ctrl+A, Ctrl+C)'},
    'import view':          {'en': 'Import view', 'de': 'Importieren', 'ru': 'Импорт'},
    'export views':         {'en': 'Export views', 'de': 'Exportieren', 'ru': 'Экспорт'},
    'import views':         {'en': 'Import views', 'de': 'Importieren', 'ru': 'Импорт'},
    "export widgets":       {"en": "Export widgets", "de": "Widgets Exportieren", "ru": "Экспорт элементов"},
    "import widgets":       {"en": "Import widgets", "de": "Widgets Importieren", "ru": "Импорт элементов"},
    "More":                 {"en": "More...",           "de": "Mehr...",                "ru": "Дальше..."},
    "locked":               {
        "en": '<div class="ui-icon ui-icon-locked" style="width: 15px;height: 13px;display:inline-block"></div>Locked',
        "de": '<div class="ui-icon ui-icon-locked" style="width: 15px;height: 13px;display:inline-block"></div>Inaktiv(locked)',
        "ru": '<div class="ui-icon ui-icon-locked" style="width: 15px;height: 13px;display:inline-block"></div>Не выбирать'
    },
    'clear cached views':   {'en': 'Clear views from cache', 'de': 'Views aus Browser-Cache löschen', 'ru': 'Очистить страницы из броузера'},
    'Select object ID':     {"en": "Select object ID",  "de": "Id vom Objekt auswählen", "ru": "Выбрать ID объекта"},
    'Select image':         {"en": "Select image",      "de": "Bild auswählen",         "ru": "Выбрать изображение"},
    "all":                  {"en": "All",               "de": "Alle",                   "ru": "Все"},
    "Copy":                 {"en": "Copy",              "de": "Kopieren",               "ru": "Скопировать"},
    "Paste":                {"en": "Paste",             "de": "Einfügen",               "ru": "Вставить"},
    "Delete":               {"en": "Delete",            "de": "Löschen",                "ru": "Удалить"},
    'from':                 {"en": "From",              "de": "von",                    "ru": "Выбрать изображение"},
    'lc':                   {"en": "Last change",       "de": "Letzte Änderung",        "ru": "Последнее изменение"},
    'ts':                   {"en": "Time stamp",        "de": "Zeitstämpel",            "ru": "Время"},
    'ack':                  {"en": "Acknowledged",      "de": "Bestätigt",              "ru": "Подтверждено"},
    'expand':               {"en": "Expand all nodes",  "de": "Alle ausklappen",        "ru": "Развернуть все узлы"},
    'collapse':             {"en": "Collapse all nodes", "de": "Alle zusammenklappen",  "ru": "Свернуть все узлы"},
    'refresh':              {"en": "Refresh tree/list", "de": "Baum neu aufbauen",      "ru": "Построить дерево заново"},
    'edit':                 {"en": "Edit",              "de": "Ändern",                 "ru": "Изменить"},
    'ok':                   {"en": "Ok",                "de": "Ok",                     "ru": "Ok"},
    'wait':                 {"en": "Processing...",     "de": "In Bearbeitung...",      "ru": "Обработка..."},
    'list':                 {"en": "Show list view",    "de": "Liste zeigen",           "ru": "Показать список"},
    'tree':                 {"en": "Show tree view",    "de": "Baum zeigen",            "ru": "Показать дерево"},
    'All':                  {"en": "All",               "de": "alle",                   "ru": "все"},
    'ID':                   {"en": "ID",                "de": "ID",                     "ru": "ID"},
    'Role':                 {"en": "Role",              "de": "Rolle",                  "ru": "Роль"},
    'Room':                 {"en": "Room",              "de": "Zimmer",                 "ru": "Комната"},
    'Value':                {"en": "Value",             "de": "Wert",                   "ru": "Значение"},
    'Members':              {"en": "Members",           "de": "Mitglieder",             "ru": "Объекты"},
    "nothing":              {"en": "none",              "de": "keins",                  "ru": "ничего"},
    "Cut":                  {"en": "Cut",               "de": "Ausschneiden",           "ru": "Вырезать"},
    "Bring to front":       {"en": "Bring to front",    "de": "Zum Fordergrund",        "ru": "Вынести наверх"},
    "Move to back":         {"en": "Move to back",      "de": "Zum Hintergrund",        "ru": "Убрать вниз"},
    'Import / Export View': {
        'en': 'Import / Export View',
        'de': 'Importieren / Exportieren View',
        'ru': 'Импортировать / Экспортировать страницу'
    },
    'Local Views': {
        'en': 'Local Views (cached)',
        'de': 'Lokal gespeicherte Views',
        'ru': 'Страницы в кеше броузера'
    },
    'please use /dashui/edit.html instead of /dashui/?edit': {
        'en': 'Please use /dashui/edit.html instead of /dashui/?edit',
        'de': 'Bitte /dashui/edit.html statt /dashui/?edit nutzen',
        'ru': 'Используйте /dashui/edit.html вместо /dashui/?edit'
    },
    'The view with the same name yet exists!': {
        'en': 'The view with the same name yet exists!',
        'de': 'Eine View mit diesem Namen existiert bereits!',
        'ru': 'The view with the same name yet exists!'
    },
    'Please enter the name for the new view!': {
        'en': 'Please enter the name for the new view!',
        'de': 'Bitte einen Namen für die neue View eingeben!',
        'ru': 'Пожалуста введите имя для новой страницы!'
    },
    'Instance ID': {'en': 'Instance ID', 'de': 'Instanz ID', 'ru': 'ID броузера'},
    'Single view': {'en': 'Single view', 'de': 'Nur in aktueller View', 'ru': 'Только на текущей странице'},
//                'Single mode'      : {'en' : 'Only in actual view',  'de': 'Nur in aktueller View', 'ru': 'Только на текущей странице'},
    'CC BY-NC License': {'en': 'CC BY-NC License', 'de': 'CC BY-NC Lizenz', 'ru': 'Лицензия CC BY-NC'},
    /*'license1'         : {
     'en': 'Short content:',
     'de': 'Die Nutzung dieser Software erfolgt auf eigenes Risiko. Der Author dieser Software kann für eventuell auftretende Folgeschäden nicht haftbar gemacht werden!',
     'ru': 'Пользователь использует это программное обеспечение на свой страх и риск. Обязательным условием использования Вами этого программного обеспечения является согласие Вами с отказом авторов программного обеспечения от какой-либо ответственности за любые потери, упущенную выгоду, затраты или убытки в какой-либо форме в связи с использованием Вами или третьими лицами этого программного обеспечения. Используя это программное обеспечене, Вы соглашаетесь с такой дискламацией (отказом от ответственности). В любом другом случае Вы должны немедленно удалить это программное обеспечение.'},
     'license2'      : {
     'en': 'Licensees may copy, distribute, display and perform the work and make derivative works based on it only if they give the author or licensor the credits in the manner specified by these.',
     'de': 'Hiermit wird unentgeltlich jeder Person, die eine Kopie der Software und der zugehörigen Dokumentationen (die "Software") erhält, die Erlaubnis erteilt, sie uneingeschränkt zu benutzen, inklusive und ohne Ausnahme dem Recht, sie zu verwenden, kopieren, ändern, fusionieren, verlegen, verbreiten, unterlizenzieren und/oder zu verkaufen, und Personen, die diese Software erhalten, diese Rechte zu geben, unter den folgenden Bedingungen:',
     'ru': 'Данная лицензия разрешает лицам, получившим копию данного программного обеспечения и сопутствующей документации (в дальнейшем именуемыми «Программное Обеспечение»), безвозмездно использовать Программное Обеспечение без ограничений, включая неограниченное право на использование, копирование, изменение, добавление, публикацию, распространение, сублицензирование и/или продажу копий Программного Обеспечения, также как и лицам, которым предоставляется данное Программное Обеспечение, при соблюдении следующих условий:'},
     'license3'      : {
     'en': 'Licensees may copy, distribute, display, and perform the work and make derivative works based on it only for noncommercial purposes.',
     'de': 'Der obige Urheberrechtsvermerk und dieser Erlaubnisvermerk sind in allen Kopien oder Teilkopien der Software beizulegen.',
     'ru': 'Указанное выше уведомление об авторском праве и данные условия должны быть включены во все копии или значимые части данного Программного Обеспечения.'},
     'license4'      : {
     'en': '(Free for non-commercial use)',
     'de': 'DIE SOFTWARE WIRD OHNE JEDE AUSDRÜCKLICHE ODER IMPLIZIERTE GARANTIE BEREITGESTELLT, EINSCHLIESSLICH DER GARANTIE ZUR BENUTZUNG FÜR DEN VORGESEHENEN ODER EINEM BESTIMMTEN ZWECK SOWIE JEGLICHER RECHTSVERLETZUNG, JEDOCH NICHT DARAUF BESCHRÄNKT. IN KEINEM FALL SIND DIE AUTOREN ODER COPYRIGHTINHABER FÜR JEGLICHEN SCHADEN ODER SONSTIGE ANSPRÜCHE HAFTBAR ZU MACHEN, OB INFOLGE DER ERFÜLLUNG EINES VERTRAGES, EINES DELIKTES ODER ANDERS IM ZUSAMMENHANG MIT DER SOFTWARE ODER SONSTIGER VERWENDUNG DER SOFTWARE ENTSTANDEN.',
     'ru': 'ДАННОЕ ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ ПРЕДОСТАВЛЯЕТСЯ «КАК ЕСТЬ», БЕЗ КАКИХ-ЛИБО ГАРАНТИЙ, ЯВНО ВЫРАЖЕННЫХ ИЛИ ПОДРАЗУМЕВАЕМЫХ, ВКЛЮЧАЯ, НО НЕ ОГРАНИЧИВАЯСЬ ГАРАНТИЯМИ ТОВАРНОЙ ПРИГОДНОСТИ, СООТВЕТСТВИЯ ПО ЕГО КОНКРЕТНОМУ НАЗНАЧЕНИЮ И ОТСУТСТВИЯ НАРУШЕНИЙ ПРАВ. НИ В КАКОМ СЛУЧАЕ АВТОРЫ ИЛИ ПРАВООБЛАДАТЕЛИ НЕ НЕСУТ ОТВЕТСТВЕННОСТИ ПО ИСКАМ О ВОЗМЕЩЕНИИ УЩЕРБА, УБЫТКОВ ИЛИ ДРУГИХ ТРЕБОВАНИЙ ПО ДЕЙСТВУЮЩИМ КОНТРАКТАМ, ДЕЛИКТАМ ИЛИ ИНОМУ, ВОЗНИКШИМ ИЗ, ИМЕЮЩИМ ПРИЧИНОЙ ИЛИ СВЯЗАННЫМ С ПРОГРАММНЫМ ОБЕСПЕЧЕНИЕМ ИЛИ ИСПОЛЬЗОВАНИЕМ ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ ИЛИ ИНЫМИ ДЕЙСТВИЯМИ С ПРОГРАММНЫМ ОБЕСПЕЧЕНИЕМ.'},
     */
    'license5': {
        'en': 'HomeMatic and the HomeMatic Logo are the registered trademarks of eQ-3 AG',
        'de': 'HomeMatic und das HomeMatic Logo sind eingetragene Warenzeichen der eQ-3 AG',
        'ru': 'HomeMatic и HomeMatic логотип являются зарегистрированными тоговыми марками фирмы eQ-3 Inc.'
    },
    'group_fixed':  {'en': 'General',  'de': 'Generell',      'ru': 'Фиксированные'},
    'group_common': {'en': 'Common', 'de': 'Allgemein', 'ru': 'Общие'},
    'group_css_common': {'en': 'CSS Common', 'de': 'CSS Allgemein', 'ru': 'CSS Основные'},
    'group_css_font_text': {'en': 'CSS Font & Text', 'de': 'CSS Font & Text', 'ru': 'CSS шрифт и текст'},
    'group_css_background': {'en': 'CSS background (background-...)', 'de': 'CSS Hintergrund (background-...)', 'ru': 'CSS фон (background-...)'},
    "File":                 {"en": "File", "de": "Datei", "ru": "Файл"},
    "Dev": {"en": "Dev", "de": "Dev", "ru": "Dev"},
    "Tools": {"en": "Tools", "de": "Tools", "ru": "Инструменты"},
    "Setup": {"en": "Setup", "de": "Setup", "ru": "Настройки"},
    "Theme": {"en": "Theme", "de": "Thema", "ru": "Темы"},
    "Language": {"en": "Language", "de": "Sprache", "ru": "Язык"},
    "Help": {"en": "Help", "de": "Hilfe", "ru": "Помощь"},
    "Shortcuts": {"en": "Shortcuts", "de": "Shortcuts", "ru": "Быстрые клавиши"},
    "About": {"en": "About", "de": "Über das Projekt", "ru": "О проекте"},
    "Active View:": {"en": "Active View:", "de": "Aktiv View:", "ru": "Выбранная страница:"},
    "To View:": {"en": "To View:", "de": "In View:", "ru": "На страницу:"},
    "Active Widget:": {"en": "Active widget:", "de": "Aktiv Widget:", "ru": "Выбранный элемент:"},
    "Resolution:": {"en": "Resolution: ", "de": "Auflöung: ", "ru": "Разрешение экрана: "},
    "Widget": {"en": "Widget", "de": "Widget", "ru": "Элемент"},
    "View": {"en": "View", "de": "View", "ru": "Страница"},
    "filter_key": {"en": "Initial filter", "de": "Anfangsfilter", "ru": "Фильтр при показе"},
    "filter_key_tooltip": {
        "en": "If set only widgets with this filter key will be shown.\x0A" +
              "Many filter words can be set deivided by comma.",
        "de": "Falls gesetzt nur die Widgets mit diesem Filterwort werden angezeig.\x0A" +
              "Es können mehere Filterworte mit Komma geteilt gesetzt werden.",
        "ru": "Если задано, то элементы только с таким ключём фильтра будут показаны.\x0A" +
              "Можно задать несколько ключей через запятую"
    },
    "Projects":             {"en": "Projects",          "de": "Projekte",               "ru": "Проекты"},
    "Lock":                 {"en": "Lock",              "de": "Sperren",                "ru": "Lock"},
    "Unlock":               {"en": "Unlock",            "de": "Entsperren",             "ru": "Unlock"},
    "max_rows":             {"en": "Maximum rows",      "de": "Maximale Zeilenanzahl",  "ru": "Максимальное кол-во строк"},
    "CSS:":                 {"en": "CSS:",              "de": "CSS:",                   "ru": "CSS:"},
    "Web":                  {"en": "Web",               "de": "Web",                    "ru": "Веб"},
    "Community":            {"en": "Community",         "de": "Community",              "ru": "Разработка"},
    "Change log":           {"en": "Change log",        "de": "Änderungen",             "ru": "Изменения"},
    "CC BY-NC License 4.0": {"en": "CC BY-NC License 4.0", "de": "CC BY-NC Lizenz 4.0", "ru": "CC BY-NC лицензия 4.0"},
    "not defined":          {"en": "not defined",       "de": "nicht definiert",        "ru": "не задано"},
    "PgUp":                 {"en": "PgUp",              "de": "BildOben",               "ru": "PgUp"},
    "Prev. View":           {"en": "Previous view",     "de": "Prev. View",             "ru": "Предыдущая страница"},
    "PgDown":               {"en": "PgDown",            "de": "BildUnten",              "ru": "PgDown"},
    "Move Widget 1px":      {"en": "Move Widget 1px",   "de": "Schiebe Widget auf 1px", "ru": "Сдвинуть элемент на 1 пиксель"},
    "Arrow Keys":           {"en": "Arrow Keys",        "de": "Pfeiltasten",            "ru": "Стрелки"},
    "Move Widget 10px":     {"en": "Move Widget 10px",  "de": "Schiebe Widget auf 10px", "ru": "Сдвинуть элемент на 10 пикселей"},
    "Ctrl / CMD":           {"en": "Ctrl / CMD",        "de": "Strg / CMD", "           ru": "Ctrl / CMD"},
    "Show develop ribbon":  {"en": "Show develop ribbon", "de": "Zeige Entwicklerpanel", "ru": "Показать панель разработчика"},
    "Full screen":          {"en": "Full screen",       "de": "Vollbild",               "ru": "Полный экран"},
    "Next View":            {"en": "Next View",         "de": "Nächste View",           "ru": "Следующая страница"},
    "Add Widget":           {"en": "Add Widget",        "de": "Einfügen",               "ru": "Добавить"},
    "Attributes":           {"en": "Attributes",        "de": "Eigenschaften",          "ru": "Свойства"},
    "Align widgets:":       {"en": "Align widgets:",    "de": "Widgets ausrichten:",    "ru": "Выровнять элементы:"},
    "Undo":                 {"en": "Undo",              "de": "Undo",                   "ru": "Отменить последние действия"},
    "Add new view":         {"en": "Add new view",      "de": "Neue View einfügen",     "ru": "Добавить новую страницу"},
    "Delete actual view":   {"en": "Delete actual view", "de": "Löschen aktuelle View", "ru": "Удалить текущую страницу"},
    "Rename view":          {"en": "Rename view",       "de": "View umbennenen",        "ru": "Переименовать страницу"},
    "Copy view":            {"en": "Copy view",         "de": "View kopieren",          "ru": "Скопировать страницу"},
    "Delete widget":        {"en": "Delete widget",     "de": "Widget löschen",         "ru": "Удалить элемент"},
    "Copy widget":          {"en": "Copy widget",       "de": "Widget kopieren",        "ru": "Скопировать элемент"},
    "Help about widget":    {"en": "Help about widget", "de": "Hilfe über Widget",      "ru": "Помощь к элементу"},
    "Align horizontal/left": {"en": "Align horizontal/left", "de": "Ausrichten waagerecht links", "ru": "Выровнять по горизонтали налево"},
    "Align horizontal/right": {"en": "Align horizontal/right", "de": "Ausrichten waagerecht rechts", "ru": "Выровнять по горизонтали направо"},
    "Align vertical/top":   {"en": "Align vertical/top",  "de": "Ausrichten senkrecht oben", "ru": "Выровнять по вертикали наверх"},
    "Align vertical/bottom": {"en": "Align vertical/bottom", "de": "Ausrichten senkrecht unten", "ru": "Выровнять по вертикали к низу"},
    "Align horizontal/center": {"en": "Align horizontal/center", "de": "Ausrichten waagerecht zentriert", "ru": "Выровнять по горизонтали по центру"},
    "Align vertical/center": {"en": "Align vertical/center", "de": "Ausrichten senkrecht zentriert", "ru": "Выровнять по вертикали по центру"},
    "Align horizontal/equal": {"en": "Align horizontal/equal", "de": "Ausrichten waagerecht/gleicher Abstand", "ru": "Выровнять по горизонтали на равном расстоянии"},
    "Align vertical/equal": {"en": "Align vertical/equal", "de": "Ausrichten senkrecht/gleicher Abstand", "ru": "Выровнять по вертикали на равном расстоянии"},
    "All widgets:":         {"en": "All widgets:",      "de": "Alle Widgets:",          "ru": "Все элементы:"},
    "Grid":                 {"en": "Grid",              "de": "Gitter",                 "ru": "Сетка"},
    "Lock all Widgets":     {"en": "Lock all Widgets",  "de": "Alle Widgets fixieren",  "ru": "Блокировать все элементы"},
    "Widgets filter. Double click to clear.": {
        "en": "Widgets filter. Double click to clear.",
        "de": "Widgets-Filter. Double click um Field zu löschen.",
        "ru": "Фильтр элементов. Что бы очистить поле ввода - двойной щелчок."
    },
    "Cannot save file \"%s\": ": {
        "en": "Cannot save file \"%s\": ",
        "de": "Kann die Datei \"%s\" nicht speichern: ",
        "ru": "Не могу сохранить файл \"%s\": "
    },
    "permissionError": {
        "en": "permission denied",
        "de": "keine Zulassung",
        "ru": "отказано в доступе"
    },
    "Logout":               {"en": "Logout", "de": "Logout", "ru": "Выйти"},
    "Error":                {"en": "Error", "de": "Fehler", "ru": "Ошибка"},
    "dev1":                 {"en": "dev 1", "de": "dev 1", "ru": "dev 1"},
    "dev2":                 {"en": "dev 2", "de": "dev 2", "ru": "dev 2"},
    "dev3":                 {"en": "dev 3", "de": "dev 3", "ru": "dev 3"},
    "dev4":                 {"en": "dev 4", "de": "dev 4", "ru": "dev 4"},
    "dev5":                 {"en": "dev 5", "de": "dev 5", "ru": "dev 5"},
    "dev6":                 {"en": "dev6",  "de": "dev6",   "ru": "dev6"},

    "Configuration not saved.": {
        "en": "Project does not saved.",
        "de": "Projekt ist noch nicht gespeichert.",
        "ru": "Проект не сохранён."
    },
    "Clipboard:": {"en": "Clipboard:", "de": "Zwischenablage:", "ru": "Буфер обмена:"},
    "Click to hide": {"en": "Click to hide", "de": "Anklicken um zu verbergen", "ru": "Нажать, что бы скрыть"},
    "Lock Widget function": {"en": "Disable interaction with widget", "de": "Deaktiviere Widget-Interaktion", "ru": "Деактивировать взаимодействие с элементом"},
    "Lock Widget dragging": {"en": "Lock widget dragging", "de": "Deaktiviere Widget herumschieben", "ru": "Дективировать перенос виджетов мышкой"},
    "Show type of widgets": {"en": "Show type of widgets", "de": "Zeige Widgettyp", "ru": "Показать тип элемента"},
    "Small widgets": {"en": "Small widgets", "de": "Kleine Widgets", "ru": "Показать маленькие элементы"},
    "Select more than one widget and try again.": {
        "en": "Select more than one widget and try again.",
        "de": "Es muss mehr als ein Widget seleketiert werden.",
        "ru": "Выберите больше одного элемента и попробуйте ещё раз."
    },
    "Too less widgets": {
        "en": "Too less widgets selected",
        "de": "Zu wenig selektierte Widgets",
        "ru": "Слишком мало выбрано элементов"
    },
    "==": {"en": "==", "de": "==", "ru": "=="},
    "!=": {"en": "!=", "de": "!=", "ru": "!="},
    "<=": {"en": "<=", "de": "<=", "ru": "<="},
    ">=": {"en": ">=", "de": ">=", "ru": ">="},
    "<": {"en": "<", "de": "<", "ru": "<"},
    ">": {"en": ">", "de": ">", "ru": ">"},
    "consist": {"en": "consist", "de": "bestehend aus", "ru": "содержит"},
    "group_visibility": {"en": "Visibility", "de": "Sichtbarkeit", "ru": "Видимость"},
    "visibility-oid": {"en": "Object ID", "de": "Object ID", "ru": "ID Объекта"},
    "visibility-oid_tooltip": {
        "en": "Depends on state of object with this ID,\x0Athe widget can be shown or hidden",
        "de": "Abhängig von dem Zustand des Objektes mit\x0Adiesem ID kann Widget verborgen oder angezeigt sein.",
        "ru": "Элемент можно показать или скрыть\x0Aв зависимости от состояние объекта с таким ID"
    },
    "visibility-cond": {"en": "Сondition", "de": "Bedingung", "ru": "Условие"},
    "visibility-cond_tooltip": {
        "en": "E.g. 'Value of Object ID' >= 'Value of condition'",
        "de": "Z.B. 'Wert von dem Objekt' >= 'Wert für die Bedienung'",
        "ru": "Например 'Значение объекта' >= 'Значения для условия"
    },
    "visibility-val": {"en": "Vavue for condition", "de": "Wert für die Bedingung", "ru": "Значение для условия"},

    "Global": {"en": "Global", "de": "Global", "ru": "Общая"},
    "Project": {"en": "Project", "de": "Projekt", "ru": "Проект"},
    "Align width": {
        "en": "Align width. Press more time to get the desired width.",
        "de": "Gleiche Breite. Mehrmals druken um gewünschte Breite einzustellen.",
        "ru": "Одинаковая ширина. Нажать несколько раз для получения желаемой ширина"
    },
    "Align height": {
        "en": "Align height. Press more time to get the desired height.",
        "de": "Gleiche Höhe. Mehrmals druken um gewünschte Höhe einzustellen.",
        "ru": "Одинаковая высота. Нажать несколько раз для получения желаемой высоты"
    },
    "Find previous": {"en": "Find previous", "de": "Finde vorherige", "ru": "Искать назад"},
    "Find next": {"en": "Find next", "de": "Finde nächste", "ru": "Искать вперёд"},
    "Save CSS": {"en": "Save CSS", "de": "Speichern CSS", "ru": "Сохранить CSS"},
    "CSS": {"en": "CSS", "de": "CSS", "ru": "CSS"},

    "css_left": {"en": "left", "de": "left", "ru": "left"},
    "css_top": {"en": "top", "de": "top", "ru": "top"},
    "css_width": {"en": "width", "de": "width", "ru": "width"},
    "css_height": {"en": "height", "de": "height", "ru": "height"},
    "css_z-index": {"en": "z-index", "de": "z-index", "ru": "z-index"},
    "css_overflow-x": {"en": "overflow-x", "de": "overflow-x", "ru": "overflow-x"},
    "css_overflow-y": {"en": "overflow-y", "de": "overflow-y", "ru": "overflow-y"},
    "css_color": {"en": "color", "de": "color", "ru": "color"},
    "css_opacity": {"en": "opacity", "de": "opacity", "ru": "opacity"},
    "css_text-align": {"en": "text-align", "de": "text-align", "ru": "text-align"},
    "css_text-shadow": {"en": "text-shadow", "de": "text-shadow", "ru": "text-shadow"},
    "css_font-family": {"en": "font-family", "de": "font-family", "ru": "font-family"},
    "css_font-style": {"en": "font-style", "de": "font-style", "ru": "font-style"},
    "css_font-variant": {"en": "font-variant", "de": "font-variant", "ru": "font-variant"},
    "css_font-weight": {"en": "font-weight", "de": "font-weight", "ru": "font-weight"},
    "css_font-size": {"en": "font-size", "de": "font-size", "ru": "font-size"},
    "css_line-height": {"en": "line-height", "de": "line-height", "ru": "line-height"},
    "css_letter-spacing": {"en": "letter-spacing", "de": "letter-spacing", "ru": "letter-spacing"},
    "css_word-spacing": {"en": "word-spacing", "de": "word-spacing", "ru": "word-spacing"},
    "css_background": {"en": "background", "de": "background", "ru": "background"},
    "css_background-color": {"en": "-color", "de": "-color", "ru": "-color"},
    "css_background-image": {"en": "-image", "de": "-image", "ru": "-image"},
    "css_background-repeat": {"en": "-repeat", "de": "-repeat", "ru": "-repeat"},
    "css_background-attachment": {"en": "-attachment", "de": "-attachment", "ru": "-attachment"},
    "css_background-position": {"en": "-position", "de": "-position", "ru": "-position"},
    "css_background-size": {"en": "-size", "de": "-size", "ru": "-size"},
    "css_background-clip": {"en": "-clip", "de": "-clip", "ru": "-clip"},
    "css_background-origin": {"en": "-origin", "de": "-origin", "ru": "-origin"},
    "group_css_border": {"en": "CSS Border (border-...)", "de": "CSS Ränder (border-...)", "ru": "CSS рамка (border-...)"},
    "css_border-width": {"en": "-width", "de": "-width", "ru": "-width"},
    "css_border-style": {"en": "-style", "de": "-style", "ru": "-style"},
    "css_border-color": {"en": "-color", "de": "-color", "ru": "-color"},
    "css_border-radius": {"en": "-radius", "de": "-radius", "ru": "-radius"},
    "group_css_shadow_padding": {"en": "CSS padding & shadow", "de": "CSS Schatten und Abstand", "ru": "CSS Тень и отступы"},
    "css_padding":          {"en": "padding",           "de": "padding",            "ru": "padding"},
    "css_padding-left":     {"en": "padding-left",      "de": "padding-left",       "ru": "padding-left"},
    "css_padding-top":      {"en": "padding-top",       "de": "padding-top",        "ru": "padding-top"},
    "css_padding-right":    {"en": "padding-right",     "de": "padding-right",      "ru": "padding-right"},
    "css_padding-bottom":   {"en": "padding-bottom",    "de": "padding-bottom",     "ru": "padding-bottom"},
    "css_margin-left":      {"en": "margin-left",       "de": "margin-left",        "ru": "margin-left"},
    "css_margin-top":       {"en": "margin-top",        "de": "margin-top",         "ru": "margin-top"},
    "css_margin-right":     {"en": "margin-right",      "de": "margin-right",       "ru": "margin-right"},
    "css_margin-bottom":    {"en": "margin-bottom",     "de": "margin-bottom",      "ru": "margin-bottom"},
    "css_box-shadow":       {"en": "box-shadow",        "de": "box-shadow",         "ru": "box-shadow"},
    "css_box-shadow_tooltip": {
        "en": "h-shadow v-shadow blur spread color\x0A" +
              "h-shadow: Required. The position of the horizontal shadow. Negative values are allowed\x0A" +
              "v-shadow: Required. The position of the vertical shadow. Negative values are allowed\x0A" +
              "blur: Optional. The blur distance\x0A" +
              "spread: Optional. The size of shadow\x0A" +
              "color: Optional. The color of the shadow. The default value is black. Look at CSS Color Values for a complete list of possible color values.\x0A" +
              "inset: Optional. Changes the shadow from an outer shadow (outset) to an inner shadow.",
        "de": "inset [<X-Verschiebung> <Y-Verschiebung> <Unschärfe-Radius> <Ausbreitungsradius> <Farbe>]\x0A" +
              "inset: Die Angabe ist optional. Wenn nicht festgelegt, wird angenommen, dass es sich um einen Schlagschatten handelt.\x0A" +
              "X-Verschiebung Y-Verschiebung: Eine Angabe ist erforderlich. Es gibt zwei Längenwerte, die die Verschiebung des Schattens angeben. Negative Werte sind auch möglich.\x0A" +
              "Unschärfe-Radius: Die Angabe ist optional und Null, wenn kein <Unschärfe-Radius> gesetzt wurde. Je großer der Wert, desto größer die Unschärfe.\x0A" +
              "Ausbreitungsradius: Eine weitere Längenangabe, deren Angabe optional ist. Wenn nicht festgelegt ist der Ausbreitungsradius 0 und der Schatten hat die gleiche Größe wie das Element.\x0A" +
              "Farbe: Die Angabe ist optional. Wenn nicht festgelegt, hängt die Farbe vom Browser ab. In Gecko (Firefox) wird der Wert der color Eigenschaft verwendet.\x0A",
        "ru": "inset <сдвиг по x> <сдвиг по y> <радиус размытия> <растяжение> <цвет>\x0A" +
              "inset: Тень выводится внутри элемента. Необязательный параметр.\x0A" +
              "сдвиг по x: Смещение тени по горизонтали относительно элемента. Положительное значение этого параметра задает сдвиг тени вправо, отрицательное — влево. Обязательный параметр.\x0A" +
              "сдвиг по y: Смещение тени по вертикали относительно элемента. Положительное значение задает сдвиг тени вниз, отрицательное — вверх. Обязательный параметр.\x0A" +
              "радиус размытия: Задает радиус размытия тени. Чем больше это значение, тем сильнее тень сглаживается, становится шире и светлее. Если этот параметр не задан, по умолчанию устанавливается равным 0, тень при этом будет четкой, а не размытой.\x0A" +
              "растяжение: Положительное значение растягивает тень, отрицательное, наоборот, ее сжимает. Если этот параметр не задан, по умолчанию устанавливается 0, при этом тень будет того же размера, что и элемент.\x0A" +
              "цвет: Цвет тени в любом доступном CSS формате, по умолчанию тень черная. Необязательный параметр."
    },
    "group_css_animation":      {"en": "CSS Animation",         "de": "CSS Animation",          "ru": "CSS Анимация"},
    "css_animation-name":       {"en": "animation-name",        "de": "animation-name",         "ru": "animation-name"},
    "css_animation-duration":   {"en": "animation-duration",    "de": "animation-duration",     "ru": "animation-duration"}

});

