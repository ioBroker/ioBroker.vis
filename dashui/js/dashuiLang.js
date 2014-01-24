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
                "hm_id"            : {"en": "Object ID",     "de": "Objekt ID",            "ru": "ID объекта:"},
                "hm_ids"           : {"en": "Object IDs",    "de": "Objekt IDs",           "ru": "ID объектов:"},
                "hm_id0"           : {"en": "Swing ID 1",    "de": "Fensterblatt 1",       "ru": "Первая створка"},
                "hm_id1"           : {"en": "Swing ID 2",    "de": "Fensterblatt 2",       "ru": "Вторая створка"},
                "hm_id2"           : {"en": "Swing ID 3",    "de": "Fensterblatt 3",       "ru": "Третья створка"},
                "hm_id3"           : {"en": "Swing ID 4",    "de": "Fensterblatt 4",       "ru": "Четвертая створка"},
                "hm_id_hnd0"       : {"en": "Handle ID 1",   "de": "Griffkontakt 1",       "ru": "Первая ручка"},
                "hm_id_hnd1"       : {"en": "Handle ID 2",   "de": "Griffkontakt 2",       "ru": "Вторая ручка"},
                "hm_id_hnd2"       : {"en": "Handle ID 3",   "de": "Griffkontakt 3",       "ru": "Третья ручка"},
                "hm_id_hnd3"       : {"en": "Handle ID 4",   "de": "Griffkontakt 4",       "ru": "Четвертая ручка"},
                "hm_idV"           : {"en": "Valve",         "de": "Ventilsteuerung",      "ru": "Вентиль"},
                "hm_idB"           : {"en": "Brightness ID", "de": "Lichthelligkeit&nbsp;ID","ru": "ID Освещённости:"},
                "hm_idL"           : {"en": "Lock ID",       "de": "Schloss ID",           "ru": "ID замка"},
                "hm_idH"           : {"en": "Humidity ID",   "de": "Feuchtigkeit ID",      "ru": "ID влажности"},
                "hm_wid"           : {"en": "Working ID",    "de": "Working ID",           "ru": "ID в процессе"},
                "hm_idC_On"        : {"en": "id on",  "de": "id an",         "ru": "ID объекта для включения"},
                "hm_idC_Off"       : {"en": "id off", "de": "id aus",        "ru": "ID объекта для выключения"},
                "default_filter_key":{"en": "Default filter:","de": "Voreingestellter Filter:", "ru": "Фильтр по умолчанию:"},
                "class"             :{"en": "CSS Class",     "de": "CSS Klasse:",          "ru": "CSS Класс"},
                "theme"             :{"en": "Theme:",        "de": "Thema:",               "ru": "Тема:"},
                "comment"          : {"en" : "Comment:",     "de": "Kommentar:",           "ru": "Комментарий"},
                "Select HM parameter" : {"en" : "Select object ID", "de": "Objekt ID ausw&auml;hlen",       "ru": "Выбрать ID объекта"},	
                "Select"           : {"en" : "Select",       "de": "Auswählen",            "ru": "Выбрать"},
                "Cancel"           : {"en" : "Cancel",       "de": "Abbrechen",            "ru": "Отмена"},	
                "None"             : {"en": "None",          "de": "Vorgegeben",           "ru": "---"},
                "Default"          : {"en": "Default",       "de": "Vorgegeben",           "ru": "По умолчанию"},
                "Name"             : {"en" : "Name",         "de": "Name",                 "ru": "Имя"},	
                "Location"         : {"en" : "Location",     "de": "Raum",                 "ru": "Комната"},	
                "Interface"        : {"en" : "Interface",    "de": "Schnittstelle",        "ru": "Интерфейс"},	
                "Type"             : {"en" : "Type",         "de": "Typ",                  "ru": "Тип"},	
                "Address"          : {"en" : "Address",      "de": "Adresse",              "ru": "Адрес"},	
                "Function"         : {"en" : "Function",     "de": "Gewerk",               "ru": "Функционал"},	
                "ramp_time:"       : {"en" : "Ramp time(s)", "de": "Dauer - Aus (sek)",    "ru": "Длительность выключения (сек)"},
                "on_time:"         : {"en" : "On time(s)",   "de": "Dauer - An (sek)",     "ru": "Длительность включения (сек)"},
                "newVersion"       : {"en" : "Handler ab V1.6",  "de": "Griff ab V1.6",    "ru": "Версия выше V1.5"},
                "weoid"            : {"en" : "City",         "de": "Stadt",                "ru": "Город"},
                "Service messages" : {"en" : "Service messages", "de": "Servicemeldungen ","ru": "Сервисные сообщения"},
                "Navigator:"       : {"en" : "Navigator:",   "de": "Navigator:",           "ru": "Навигация"},
                "Show top and bottom": {"en" : "Show top and bottom", "de": "Anzeigen oben und unten", "ru": "Показать сверху и снизу"},
                "Show bottom"      : {"en" : "Show bottom",  "de": "Anzeigen unten",       "ru": "Показать снизу"},
                "Do not show"      : {"en" : "Do not show",  "de": "Nicht anzeigen",       "ru": "Не показывать"},
                "Load period:"     : {"en" : "Load period:", "de": "Von CCU laden:",       "ru": "Загрузить период за:"},
                "1 Hour"           : {"en" : "1 Hour",       "de": "1 Stunde",             "ru": "1 час"},
                "2 Hours"          : {"en" : "2 Hours",      "de": "2 Stunden",            "ru": "2 часа"},
                "6 Hours"          : {"en" : "6 Hours",      "de": "6 Stunden",            "ru": "6 часов"},
                "12 Hours"         : {"en" : "12 Hours",     "de": "12 Stunden",           "ru": "12 часов"},
                "1 Day"            : {"en" : "1 Day",        "de": "1 Tag",                "ru": "1 день"},
                "3 Days"           : {"en" : "3 Days",       "de": "3 Tage",               "ru": "2 дня"},
                "5 Days"           : {"en" : "5 Days",       "de": "5 Tage",               "ru": "5 дней"},
                "1 Week"           : {"en" : "1 Week",       "de": "1 Woche",              "ru": "1 неделю"},
                "2 Weeks"          : {"en" : "2 Weeks",      "de": "2 Wochen",             "ru": "2 недели"},
                "1 Month"          : {"en" : "1 Month",      "de": "1 Monat",              "ru": "1 месяц"},
                "3 Months"         : {"en" : "3 Months",     "de": "3 Monate",             "ru": "3 месяца"},
                "6 Months"         : {"en" : "6 Months",     "de": "6 Monate",             "ru": "6 месяцев"},
                "1 Year"           : {"en" : "1 Year",       "de": "1 Jahr",               "ru": "1 год"},
                "All"              : {"en" : "All",          "de": "Alle",                 "ru": "Все данные"},
                "Theme:"           : {"en" : "Theme:",       "de": "Theme:",               "ru": "Тема:"},
                "Description with percent:": {"en" : "Description with percent:", "de": "Beschriftung y-Achse mit %", "ru": "Подписи оси Y в процентах"},
                "Zoom level:"      : {"en" : "Zoom level:",  "de": "Zoom-Stufe:",          "ru": "Уровень увеличения:"},
                "Scrollbar:"       : {"en" : "Scrollbar:",   "de": "Scrollbar:",           "ru": "Scroll:"},
                "Dynamic aggregation:": {"en" : "Dynamic aggregation:", "de": "Dynamische Aggregation:", "ru": "Динамическое объединение:"},
                "Legend:"          : {"en" : "Legend:",      "de": "Legende:",             "ru": "Легенда:"},
                "Left"             : {"en" : "Left",         "de": "Links",                "ru": "Слева"},
                "Inside"           : {"en" : "Inside",       "de": "im Chart",             "ru": "На графике"},
                "Hide"             : {"en" : "Hide",         "de": "nicht anzeigen",       "ru": "Скрыть"},
                "Zoom active:"     : {"en" : "Zoom active:", "de": "Zoomen aktiviert:",    "ru": "Активировать увеличение:"},
                "Charts..."        : {"en" : "Charts...",    "de": "Charts...",            "ru": "Графики..."},
                "Chart"            : {"en" : "Chart",        "de": "Chart",                "ru": "График"},
                "History"          : {"en" : "History",      "de": "Verlauf",              "ru": "История событий"},
                "Rooms"            : {"en" : "Rooms",        "de": "R&auml;ume",           "ru": "Комнаты"},
                "Room:"            : {"en" : "Room:",        "de": "Raum:",                "ru": "Комната:"},
                "Functions"        : {"en" : "Functions",    "de": "Gewerke",              "ru": "Функции"},
                "Function:"        : {"en" : "Function:",    "de": "Gewerk:",              "ru": "Функциональность:"},
                "Widget:"          : {"en" : "Widget:",      "de": "Widget:",              "ru": "Элемент:"},
                "New View"         : {"en" : "New View:",    "de": "Neue View",            "ru": "Новая страница"},
                "Current View"     : {"en" : "Current View", "de": "Aktuelle View",        "ru": "Текущая страница"},
                "View Attributes"  : {"en" : "View Attributes","de": "View-Eigenschaften", "ru": "Свойства страницы"},
                "External Commands": {"en" : "External Commands", "de": "Externe Befehle", "ru": "Внешние комманды"},
                "View:"            : {"en" : "View:",        "de": "View:",                "ru": "Страница:"},
                "wizard_run"       : {"en" : "Run",          "de": "Ausführen",            "ru": "Выполнить"},
                "add_view"         : {"en" : "Add",          "de": "Hinzufügen",           "ru": "Добавить"},
                "dup_view"         : {"en" : "Duplicate",    "de": "Duplizieren",          "ru": "Копировать"},
                "del_view"         : {"en" : "Delete",       "de": "Löschen",              "ru": "Удалить"}, 		
                "rename_view"      : {"en" : "Rename",       "de": "Umbenennen",           "ru": "Перемменовать"}, 	
                "create_instance"  : {"en" : "Create instance", "de": "Instanz erzeugen",  "ru": "Создать идентификатор броузера"}, 
                "remove_instance"  : {"en" : "Remove instance","de": "Instanz löschen",    "ru": "Удалить идентификатор броузера"}, 
                "add_widget"       : {"en" : "Add widget",    "de": "Einfügen",            "ru": "Добавить"},
                "del_widget"       : {"en" : "Delete widget", "de": "Löschen",             "ru": "Удалить"},
                "dup_widget"       : {"en" : "Copy to:","de": "Kopieren nach:",            "ru": "Скопировать в:"},
                "widget_doc"       : {"en" : "Widget help",   "de": "Widgethilfe",         "ru": "Помощь"},
                "Add Widget:"      : {"en" : "Add Widget:",   "de": "Widget einf&uuml;gen:","ru": "Добавить элемент:"},
                "Inspecting Widget:":{"en" : "Inspecting Widget:", "de": "Widget inspizieren:","ru": "Редактировать элемет:"},
                "Widget Attributes:":{"en" : "Widget Attributes:", "de": "Widget-Eigenschaften:","ru": "Свойства элемета:"},
                "Action on click:" : {"en" : "Action on click:", "de": "Aktion beim Anklicken:","ru": "Реакция при нажаттии"},
                "Disable device filter:" : {"en" : "Disable device filter:", "de": "Schalte Ger&auml;tefilter aus:", "ru": "Убрать фильтр по устройствам:"},
                "filter_key"       : {"en" : "Filter key:",  "de": "Filterwort:",          "ru": "Фильтр:"},
                "Show in views:"   : {"en" : "Show in views:","de": "Zeige in Views:",     "ru": "Показать на страницах:"},
                "Single mode"      : {"en" : "Only in actual view",  "de": "Nur in aktueller View", "ru": "Только на текущей странице"},
                "Invert state:"    : {"en" : "Invert state:", "de": "Invertiere Zustand:", "ru": "Инвертировать состояние:"},
                "All except Low battery": {"en" : "All except 'Battery Indicator'", "de": "Alle außer 'Battery Indicator'", "ru": "Все, кроме 'Battery Indicator'"},
                "General"          : {"en" : "General",       "de": "Allgemein",           "ru": "Основные"},
                "hideSeconds"      : {"en" : "Hide seconds",  "de": "Zeige keine Sekunden","ru": "Скрыть секунды"},
                "blink"            : {"en" : "Blink",         "de": "Blinken",             "ru": "Мигать"},
                "showWeekDay"      : {"en" : "Show day of week", "de": "Wochenstag",       "ru": "День недели"},
                "noClass"          : {"en" : "No predefined style", "de": "Kein vordefinierter Stil","ru": "Не применять стиль по умолчанию"},
                "startValue"       : {"en" : "ON value [1-100]%", "de": "EIN Wert [1-100]%","ru": "Включить на [1-100]%"},
				// Bars
                "One at time:"     : {"en" : "One at time:",  "de": "Nur eine auswahlbar:","ru": "Только один фильтр:"},
                "Geometry..."      : {"en" : "Geometry...",   "de": "Geometrie...",        "ru": "Позиция и размер..."},
                "Show"             : {"en" : "Show",          "de": "Zeigen",              "ru": "Показать"},
                "Bar type:"        : {"en" : "Bar type:",     "de": "Bartyp:",             "ru": "Тип:"},
                "Button width:"    : {"en" : "Button width:", "de": "Knopfbreite:",        "ru": "Ширина кнопок:"},
                "Button height:"   : {"en" : "Button height:","de": "Knopfh&ouml;he:",     "ru": "Высота кнопок:"},
                "Button space:"    : {"en" : "Button space:", "de": "Zwischenplatz:",      "ru": "Промежуток:"},
                "Border radius:"   : {"en" : "Border radius:","de": "Randradius:",         "ru": "Радиус закруглений:"},
                "Text offset %:"   : {"en" : "Text offset %:","de": "Textoffset in %:",    "ru": "Смещение текста в %:"},
                "Text align:"      : {"en" : "Text align:",   "de": "Textausrichtung:",    "ru": "Позиция текста:"},
                "Image align:"     : {"en" : "Image align:",  "de": "Bildausrichtung:",    "ru": "Позиция миниатюры:"},
                "Effects..."       : {"en" : "Effects...",    "de": "Effekte...",          "ru": "Эффекты..."},
                "Hide effect:"     : {"en" : "Hide effect:",  "de": "Verbergeneffekt:",    "ru": "Исчезновение:"},
                "Show effect:"     : {"en" : "Show effect:",  "de": "Anzeigeeffekt:",      "ru": "Появление:"},
                "Test"             : {"en" : "Test",          "de": "Test",                "ru": "Тест"},
                "Buttons..."       : {"en" : "Buttons...",    "de": "Kn&ouml;pfe",         "ru": "Кнопки..."},
                "Icon:"            : {"en" : "Icon:",         "de": "Bildchen:",           "ru": "Миниатюра:"},
                "Caption:"         : {"en" : "Caption:",      "de": "Beschriftung:",       "ru": "Подпись:"},
                "Filter key:"      : {"en" : "Filter key:",   "de": "Filterwort:",         "ru": "Значение фильтра:"},
                "Add"              : {"en" : "Add",           "de": "Neu",                 "ru": "Добавить"},
                "Up"               : {"en" : "Up",            "de": "Nach oben",           "ru": "На верх"},
                "Down"             : {"en" : "Down",          "de": "Nach unten",          "ru": "Вниз"},
                "Delete"           : {"en" : "Delete",        "de": "L&ouml;schen",        "ru": "Удалить"},
                "Horizontal"       : {"en" : "Horizontal",    "de": "Horizontal",          "ru": "Горизонтально"},
                "Vertical"         : {"en" : "Vertical",      "de": "Senkrecht",           "ru": "Вертикально"},
                "Docked at top"    : {"en" : "Docked at top", "de": "Angedockt oben",      "ru": "Панель сверху"},
                "Docked at bottom" : {"en" : "Docked at bottom", "de": "Angedockt unten",  "ru": "Панель снизу"},
                "Docked at left"   : {"en" : "Docked at left","de": "Angedockt links",     "ru": "Панель слева"},
                "Docked at right"  : {"en" : "Docked at right","de": "Angedockt rechts",   "ru": "Панель справа"},
                "Center"           : {"en" : "Center",        "de": "In der MItte",        "ru": "В середине"},
                "Left"             : {"en" : "Left",          "de": "Links",               "ru": "Слева"},
                "Right"            : {"en" : "Right",         "de": "Rechts",              "ru": "Справа"},
                "Programs"         : {"en" : "Programs",      "de": "Programme"},
                "Variables"        : {"en" : "Variables",     "de": "Variablen"},
                "Devices"          : {"en" : "Devices",       "de": "Geräte"}

            };
        }
        if (this.words[text]) {
            if (this.words[text][this.language])
                return this.words[text][this.language];
            else 
            if (this.words[text]["en"])
                return this.words[text]["en"];
        }

        return text;
    }
});
