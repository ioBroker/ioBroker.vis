/**
 *  DashUI
 *  https://github.com/hobbyquaker/dashui/
 *
 *  Copyright (c) 2013-2014 Bluefox https://github.com/GermanBluefox
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
"use strict";

// Languages
dui = $.extend(true, dui, {
    translate: function (text, arg) {
    	var lang = dui.language || 'en';
        if (!this.words) {
            this.words = {
                'Views'            : {'en': 'Views',         'de': 'Views',                'ru': 'Страницы'},
                'Widgets'          : {'en': 'Widgets',       'de': 'Widgets',              'ru': 'Элементы'},
                'CSS Inspector'    : {'en': 'CSS Inspector', 'de': 'CSS Inspektor',        'ru': 'CSS Инспектор'},
                'Misc'             : {'en': 'Misc',          'de': 'Versch.',              'ru': 'Разное'},
                'Info'             : {'en': 'Info',          'de': 'Info',                 'ru': 'Инфо'},
                'default_filter_key':{'en': 'Default filter:','de': 'Voreinge. Filter:', 'ru': 'Фильтр по умолчанию:'},
                'class'            : {'en': 'CSS Class',     'de': 'CSS Klasse:',          'ru': 'CSS Класс'},
                'Snapping'         : {'en': 'Snapping',      'de': 'Ausrichten',           'ru': 'Опорные точки'},
                'disabled'         : {'en': 'Disabled',      'de': 'Inaktiv',              'ru': 'не активно'},
                'elements'         : {'en': 'Elements',      'de': 'Elemente',             'ru': 'элементы'},
                'grid'             : {'en': 'Grid',          'de': 'Raster',               'ru': 'таблица'},
                'grid size'        : {'en': 'Grid size:',    'de': 'Rastermaß:',           'ru': 'Шаг:'},
                'theme'            : {'en': 'Theme:',        'de': 'Thema:',               'ru': 'Тема:'},
                'Screensize'       : {'en': 'Screensize:',   'de': 'Bildschirmgröße',      'ru': 'Размер экрана'},
                'Width'            : {'en': 'Width (px):',   'de': 'Breite (px):',         'ru': 'Ширина (пикс.):'},
                'Height'           : {'en': 'Height (px):',  'de': 'Höhe (px):',           'ru': 'Высота (пикс.):'},
                'comment'          : {'en': 'Comment:',      'de': 'Kommentar:',           'ru': 'Комментарий'},
                'Room:'            : {'en': 'Room:',         'de': 'Raum:',                'ru': 'Комната:'},
                'Function:'        : {'en': 'Function:',     'de': 'Gewerk:',              'ru': 'Функциональность:'},
                'Widget:'          : {'en': 'Widget:',       'de': 'Widget:',              'ru': 'Элемент:'},
                'New View'         : {'en': 'New View:',     'de': 'Neue View',            'ru': 'Новая страница'},
                'Current View'     : {'en': 'Current View',  'de': 'Aktuelle View',        'ru': 'Текущая страница'},
                'View Attributes'  : {'en': 'View Attributes','de': 'View-Eigenschaften',  'ru': 'Свойства страницы'},
                'External Commands': {'en': 'External Commands','de': 'Externe Befehle',   'ru': 'Внешние комманды'},
                'View:'            : {'en': 'View:',         'de': 'View:',                'ru': 'Страница:'},
                'Wizard'           : {'en': 'Wizard',        'de': 'Wizard',               'ru': 'Помошник'},
                'wizard_run'       : {'en': 'Run',           'de': 'Ausführen',            'ru': 'Выполнить'},
                'add_view'         : {'en': 'Add',           'de': 'Hinzufügen',           'ru': 'Добавить'},
                'dup_view'         : {'en': 'Duplicate',     'de': 'Duplizieren',          'ru': 'Копировать'},
                'del_view'         : {'en': 'Delete',        'de': 'Löschen',              'ru': 'Удалить'},
                'rename_view'      : {'en': 'Rename',        'de': 'Umbenennen',           'ru': 'Перемменовать'},
                'create_instance'  : {'en': 'Create instance','de': 'Instanz erzeugen',    'ru': 'Создать идентификатор броузера'},
                'remove_instance'  : {'en': 'Remove instance','de': 'Instanz löschen',     'ru': 'Удалить идентификатор броузера'},
                'add_widget'       : {'en': 'Add widget',    'de': 'Einfügen',             'ru': 'Добавить'},
                'del_widget'       : {'en': 'Delete widget', 'de': 'Löschen',              'ru': 'Удалить'},
                'dup_widget'       : {'en': 'Copy to:',      'de': 'Kopieren nach:',       'ru': 'Скопировать в:'},
                'Clipboard: '      : {'en': 'Clipboard:',    'de': 'Zwischenablage:',      'ru': 'Буфер:'},
                'New:'             : {'en': 'New:',          'de': 'Neues:',               'ru': 'Новое:'},
                'Widget copied to view %s': {
                    'en': 'Widget copied to view %s',
                    'de': 'Widget wurde in die View "%s" kopiert',
                    'ru': 'Элемент скопирован на страницу %s'
                },
                'Really delete view %s?' : {
                    'en': 'Really delete view %s?',
                    'de': 'Wirklich View "%s" löschen?',
                    'ru': 'Вы действительно хотите удалить страницу %s?'
                },
                'Do you want delete %s widgets?' : {
                    'en' : 'Do you want delete %s widgets?',
                    'de': 'Wirklich %s Widgets löschen?',
                    'ru': 'Вы действительно хотите удалить %s элемента(ов)?'
                },
                'Update found, loading new Files...'  : {
                    'en' : 'Update found.<br/>Loading new Files...',
                    'de': 'Neue Version gefunden.<br/>Lade neue Dateien...',
                    'ru': 'Обнаружено Обновление.<br/>Загружаю новые файлы...'
                },
                'error - View doesn\'t exist'  : {
                    'en': 'View doesn\'t exist!',
                    'de': 'View existiert nicht!',
                    'ru': 'Страница не существует!'
                },
                'no views found on server.\nCreate new %s ?' : {
                    'en': 'no views found on server.\nCreate new %s?',
                    'de': 'Keine Views gefunden auf dem Server.\n%s neu erstellen?',
                    'ru': 'На сервеое не найдено никаких страниц. Создать %s?'
                },
                'No Views found on Server' : {
                    'en': 'No Views found on Server',
                    'de': 'Keine Views gefunden am Server.',
                    'ru': 'На сервеое не найдено никаких страниц.'
                },
                'widget_doc'       : {'en': 'Widget help',  'de': 'Widgethilfe',          'ru': 'Помощь'},
                'Add Widget:'      : {'en': 'Add Widget:',  'de': 'Widget einf&uuml;gen:','ru': 'Добавить элемент:'},
                'Inspecting Widget:':{'en': 'Inspecting Widget:', 'de': 'Widget inspizieren:','ru': 'Редактировать элемет:'},
                'Widget Attributes:':{'en': 'Widget Attributes:', 'de': 'Widget-Eigenschaften:','ru': 'Свойства элемета:'},
                'filter_key'       : {'en': 'Filter key:',  'de': 'Filterwort:',          'ru': 'Фильтр:'},
                'Show in views:'   : {'en': 'Show in views:','de': 'Zeige in Views:',     'ru': 'Показать на страницах:'},
                'Background class' : {'en': 'Background class:','de': 'Hintergrundklasse:','ru': 'CSS класс фона:'},
                'Background'       : {'en': 'Background:',  'de': 'Hintergrund:',         'ru': 'CSS класс фона:'},
                'Webseite'         : {'en': 'Web link',     'de': 'Webseite',             'ru': 'Веб сайт'},
                'none selected'    : {'en': 'none selected','de': 'nichst selektiert',    'ru': 'ничего не выбрано'},
                'Unterstützung'    : {'en': 'Hilfe',        'de': 'Unterstützung',        'ru': 'Помощь'},
                'User name'        : {'en': 'User name',    'de': 'Anwendername',         'ru': 'Imja polzovatelja'},
                'Password'         : {'en': 'Password',     'de': 'Kennwort',             'ru': 'Parol'},
                'Sign in'          : {'en': 'Sign in',      'de': 'Anmelden',             'ru': 'Voiti'},
                'Check all'        : {'en': 'Check all',    'de': 'Alle selektieren',     'ru': 'Выбрать все'},
                'Uncheck all'      : {'en': 'Uncheck all',  'de': 'Alle deselektieren',   'ru': 'Убрать все'},
                'Select options'   : {'en': 'Select options','de': 'Selekteingensch.',    'ru': 'Свойства выбора'},
                'Änderungs-Historie': {'en': 'Change log',  'de': 'Änderungs-Historie:',  'ru': 'Список изменений'},
                'invalid JSON'     : {'en': 'Invalid JSON', 'de': 'Invalid JSON',         'ru': 'Неправильный формат'},
                'please use /dashui/edit.html instead of /dashui/?edit': {
                    'en': 'Please use /dashui/edit.html instead of /dashui/?edit',
                    'de': 'Bitte geben Sie /dashui/edit.html statt /dashui/?edit',
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
                'No connection to Server': {
                    'en' : 'No connection to Server',
                    'de': 'Keine Verbindung zum Server',
                    'ru': 'Нет соединения с сервером'
                },
                'Loading Widget-Sets... <span id="widgetset_counter"></span>' : {
                    'en': 'Loading Widget-Sets... <span id="widgetset_counter"></span>',
                    'de': 'Lade Widget-Sätze... <span id="widgetset_counter"></span>',
                    'ru': 'Загрузка наборов элементов... <span id="widgetset_counter"></span>'},
                ' done.<br/>'                  : {'en': ' done.<br/>',                  'de': ' - erledigt.<br/>',           'ru': '. Закончено.<br/>'},
                '<br/>Loading Views...<br/>'   : {'en': '<br/>Loading Views...<br/>',   'de': '<br/>Lade Views...<br/>',     'ru': '<br/>Загрузка пользовательских страниц...<br/>'},
                'Connecting to Server...<br/>' : {'en': 'Connecting to Server...<br/>', 'de': 'Verbinde mit Server...<br/>', 'ru': 'Соединение с сервером...<br/>'},
                'Loading data objects...'      : {'en': 'Loading data...',              'de': 'Lade Daten...',               'ru': 'Загрузка данных...'},
                'Loading data values...'       : {'en': 'Loading values...<br>',        'de': 'Lade Werte...<br>',           'ru': 'Загрузка значений...<br>'},
                'Instance ID'      : {'en' : 'Instance ID ',      'de': 'Instanz ID ',            'ru': 'Instance ID '},
                'Single view'      : {'en' : 'Single view',  'de': 'Nur in aktueller View','ru': 'Только на текущей странице'},
//                'Single mode'      : {'en' : 'Only in actual view',  'de': 'Nur in aktueller View', 'ru': 'Только на текущей странице'},
                'MIT Lizenz (MIT)' : {'en' : 'MIT License (MIT)','de': 'MIT Lizenz (MIT)', 'ru': 'Лицензия MIT (MIT)'},
                'license1'         : {
                    'en': 'Users of this software do so at their own risk. The authors of this software cannot be held liable for possible complications that may arise.',
                    'de': 'Die Nutzung dieser Software erfolgt auf eigenes Risiko. Der Author dieser Software kann für eventuell auftretende Folgeschäden nicht haftbar gemacht werden!',
                    'ru': 'Пользователь использует это программное обеспечение на свой страх и риск. Обязательным условием использования Вами этого программного обеспечения является согласие Вами с отказом авторов программного обеспечения от какой-либо ответственности за любые потери, упущенную выгоду, затраты или убытки в какой-либо форме в связи с использованием Вами или третьими лицами этого программного обеспечения. Используя это программное обеспечене, Вы соглашаетесь с такой дискламацией (отказом от ответственности). В любом другом случае Вы должны немедленно удалить это программное обеспечение.'},
                'license2'      : {
                    'en': 'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:',
                    'de': 'Hiermit wird unentgeltlich jeder Person, die eine Kopie der Software und der zugehörigen Dokumentationen (die "Software") erhält, die Erlaubnis erteilt, sie uneingeschränkt zu benutzen, inklusive und ohne Ausnahme dem Recht, sie zu verwenden, kopieren, ändern, fusionieren, verlegen, verbreiten, unterlizenzieren und/oder zu verkaufen, und Personen, die diese Software erhalten, diese Rechte zu geben, unter den folgenden Bedingungen:',
                    'ru': 'Данная лицензия разрешает лицам, получившим копию данного программного обеспечения и сопутствующей документации (в дальнейшем именуемыми «Программное Обеспечение»), безвозмездно использовать Программное Обеспечение без ограничений, включая неограниченное право на использование, копирование, изменение, добавление, публикацию, распространение, сублицензирование и/или продажу копий Программного Обеспечения, также как и лицам, которым предоставляется данное Программное Обеспечение, при соблюдении следующих условий:'},
                'license3'      : {
                    'en': 'The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.',
                    'de': 'Der obige Urheberrechtsvermerk und dieser Erlaubnisvermerk sind in allen Kopien oder Teilkopien der Software beizulegen.',
                    'ru': 'Указанное выше уведомление об авторском праве и данные условия должны быть включены во все копии или значимые части данного Программного Обеспечения.'},
                'license4'      : {
                    'en': 'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.',
                    'de': 'DIE SOFTWARE WIRD OHNE JEDE AUSDRÜCKLICHE ODER IMPLIZIERTE GARANTIE BEREITGESTELLT, EINSCHLIESSLICH DER GARANTIE ZUR BENUTZUNG FÜR DEN VORGESEHENEN ODER EINEM BESTIMMTEN ZWECK SOWIE JEGLICHER RECHTSVERLETZUNG, JEDOCH NICHT DARAUF BESCHRÄNKT. IN KEINEM FALL SIND DIE AUTOREN ODER COPYRIGHTINHABER FÜR JEGLICHEN SCHADEN ODER SONSTIGE ANSPRÜCHE HAFTBAR ZU MACHEN, OB INFOLGE DER ERFÜLLUNG EINES VERTRAGES, EINES DELIKTES ODER ANDERS IM ZUSAMMENHANG MIT DER SOFTWARE ODER SONSTIGER VERWENDUNG DER SOFTWARE ENTSTANDEN.',
                    'ru': 'ДАННОЕ ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ ПРЕДОСТАВЛЯЕТСЯ «КАК ЕСТЬ», БЕЗ КАКИХ-ЛИБО ГАРАНТИЙ, ЯВНО ВЫРАЖЕННЫХ ИЛИ ПОДРАЗУМЕВАЕМЫХ, ВКЛЮЧАЯ, НО НЕ ОГРАНИЧИВАЯСЬ ГАРАНТИЯМИ ТОВАРНОЙ ПРИГОДНОСТИ, СООТВЕТСТВИЯ ПО ЕГО КОНКРЕТНОМУ НАЗНАЧЕНИЮ И ОТСУТСТВИЯ НАРУШЕНИЙ ПРАВ. НИ В КАКОМ СЛУЧАЕ АВТОРЫ ИЛИ ПРАВООБЛАДАТЕЛИ НЕ НЕСУТ ОТВЕТСТВЕННОСТИ ПО ИСКАМ О ВОЗМЕЩЕНИИ УЩЕРБА, УБЫТКОВ ИЛИ ДРУГИХ ТРЕБОВАНИЙ ПО ДЕЙСТВУЮЩИМ КОНТРАКТАМ, ДЕЛИКТАМ ИЛИ ИНОМУ, ВОЗНИКШИМ ИЗ, ИМЕЮЩИМ ПРИЧИНОЙ ИЛИ СВЯЗАННЫМ С ПРОГРАММНЫМ ОБЕСПЕЧЕНИЕМ ИЛИ ИСПОЛЬЗОВАНИЕМ ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ ИЛИ ИНЫМИ ДЕЙСТВИЯМИ С ПРОГРАММНЫМ ОБЕСПЕЧЕНИЕМ.'},
                'license5'      : {
                    'en': 'HomeMatic and the HomeMatic Logo are the registered trademarks of eQ-3 AG',
                    'de': 'HomeMatic und das HomeMatic Logo sind eingetragene Warenzeichen der eQ-3 AG',
                    'ru': 'HomeMatic и HomeMatic логотип являются зарегистрированными тоговыми марками фирмы eQ-3 Inc.'},
                'All changes are saved locally. To reset changes clear the cache.'      : {
                    'en': 'All changes are saved locally. To reset changes clear the browser cache.',
                    'de': 'Alle Änderungen sind lokal gespeichert. Um Änderungen zu löschen, lösche Browsercache.',
                    'ru': 'Все изменения сохранены локально. Для отмены локальных изменений очистите кеш броузера.'}
            };
        }

        if (this.words[text]) {
            var newText = this.words[text][lang];
            if (newText) {
                text = newText;
            } else {
                newText = this.words[text]["en"];
                if (newText) {
                    text = newText;
                }
            }
        }

        if (arg !== undefined) {
            text = text.replace('%s', arg);
        }
        return text;
    }
});
