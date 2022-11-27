/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2013-2022 bluefox https://github.com/GermanBluefox,
 *  Copyright (c) 2013-2014 hobbyquaker https://github.com/hobbyquaker
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
/* global document */
/* global console */
/* global session */
/* global window */
/* global location */
/* global setTimeout */
/* global clearTimeout */
/* global io */
/* global visConfig */
/* global systemLang:true */
/* global _ */
/* global can */
/* global storage */
/* global servConn */
/* global systemDictionary */
/* global $ */
/* global app */
/* global Audio */
/* global cordova */
/* global translateAll */
/* global jQuery */
/* global document */
/* global moment */
/* jshint -W097 */// jshint strict:false
'use strict';

if (typeof systemDictionary !== 'undefined') {
    $.extend(systemDictionary, {
        'No connection to Server':  {'en': 'No connection to Server',   'de': 'Keine Verbindung zum Server', 'ru': 'Нет соединения с сервером',
            "pt": "Nenhuma conexão ao servidor",
            "nl": "Geen verbinding met server",
            "fr": "Pas de connexion au serveur",
            "it": "Nessuna connessione al server",
            "es": "Sin conexión al servidor",
            "pl": "Brak połączenia z serwerem",
            "zh-cn": "没有与服务器的连接"},
        'Loading Views...':         {'en': 'Loading Views...',          'de': 'Lade Views...',          'ru': 'Загрузка пользовательских страниц...',
            "pt": "Carregando páginas ...",
            "nl": "Pagina's laden ...",
            "fr": "Chargement des pages ...",
            "it": "Caricamento pagine ...",
            "es": "Cargando páginas ...",
            "pl": "Ładowanie stron ...",
            "zh-cn": "加载页面......"},
        'Connecting to Server...':  {'en': 'Connecting to Server...',   'de': 'Verbinde mit dem Server...', 'ru': 'Соединение с сервером...',
            "pt": "Conectando ao servidor...",
            "nl": "Verbinden met de server...",
            "fr": "Connexion au serveur...",
            "it": "Connessione al server...",
            "es": "Conectando al servidor...",
            "pl": "Łączenie z serwerem...",
            "zh-cn": "连接到服务器..."},
        'Loading data objects...':  {'en': 'Loading data...',           'de': 'Lade Daten...',          'ru': 'Загрузка данных...',
            "pt": "Carregando dados...",
            "nl": "Data laden...",
            "fr": "Chargement des données...",
            "it": "Caricamento dati...",
            "es": "Cargando datos...",
            "pl": "Ładowanie danych...",
            "zh-cn": "加载数据中..."},
        'Loading data values...':   {'en': 'Loading values...',         'de': 'Lade Werte...',          'ru': 'Загрузка значений...',
            "pt": "Carregando valores ...",
            "nl": "Waarden laden ...",
            "fr": "Chargement des valeurs ...",
            "it": "Caricamento valori ...",
            "es": "Cargando valores ...",
            "pl": "Ładowanie wartości ...",
            "zh-cn": "载入值..."},
        'error - View doesn\'t exist': {'en': 'View doesn\'t exist!',   'de': 'View existiert nicht!',  'ru': 'Страница не существует!',
            "pt": "erro - a página não existe",
            "nl": "error - Page bestaat niet",
            "fr": "error - La page n'existe pas",
            "it": "errore - La pagina non esiste",
            "es": "error - la página no existe",
            "pl": "błąd - strona nie istnieje",
            "zh-cn": "错误 - 页面不存在"},
        'no views found!':          {'en': 'No views found!',           'de': 'Keine Views gefunden!',  'ru': 'Не найдено страниц!',
            "pt": "Nenhuma página encontrada!",
            "nl": "Geen pagina's gevonden!",
            "fr": "Aucune page trouvée!",
            "it": "Nessuna pagina trovata!",
            "es": "No se encontraron páginas!",
            "pl": "Nie znaleziono stron!",
            "zh-cn": "找不到页面！"},
        "No valid license found!": {
            "en": "No valid vis license found! Please check vis settings.",
            "de": "Keine gültige vis Lizenz gefunden! Bitte vis Einstellungen prüfen.",
            "ru": "Действительная лицензия не найдена! Пожалуйста, проверьте настройки.",
            "pt": "Nenhuma licença válida encontrada! Por favor, verifique vis instance.",
            "nl": "Geen geldige licentie gevonden! Controleer de vis-aankondiging.",
            "fr": "Aucune licence valide trouvée ! Veuillez vérifier vis instance.",
            "it": "Nessuna licenza valida trovata! Si prega di controllare di persona.",
            "es": "No se encontró ninguna licencia válida! Por favor, compruebe la instancia de visita.",
            "pl": "Nie znaleziono ważnej licencji! Proszę sprawdzić vis instance.",
            "zh-cn": "找不到有效的许可证！请检查vis实例。"
        },
        'No Views found on Server': {
            'en': 'No Views found on Server',
            'de': 'Keine Views am Server gefunden.',
            'ru': 'На сервере не найдено никаких страниц.',
            "pt": "Nenhuma página encontrada no servidor",
            "nl": "Geen pagina's gevonden op server",
            "fr": "Aucune page trouvée sur le serveur",
            "it": "Nessuna pagina trovata sul server",
            "es": "No se encontraron páginas en el servidor",
            "pl": "Nie znaleziono stron na serwerze",
            "zh-cn": "在服务器上找不到页面"
        },
        'All changes are saved locally. To reset changes clear the cache.': {
            'en': 'All changes are saved locally. To reset changes clear the browser cache.',
            'de': 'Alle Änderungen sind lokal gespeichert. Um Änderungen zu löschen, lösche Browsercache.',
            'ru': 'Все изменения сохранены локально. Для отмены локальных изменений очистите кеш броузера.',
            "pt": "Todas as alterações são salvas localmente. Para redefinir as alterações, limpe o cache do navegador.",
            "nl": "Alle wijzigingen worden lokaal opgeslagen. Als u de wijzigingen opnieuw wilt instellen, wist u de cache van de browser.",
            "fr": "Toutes les modifications sont enregistrées localement. Pour réinitialiser les modifications, effacez le cache du navigateur.",
            "it": "Tutte le modifiche sono salvate localmente. Per ripristinare le modifiche, cancellare la cache del browser.",
            "es": "Todos los cambios se guardan localmente. Para restablecer los cambios borra el caché del navegador.",
            "pl": "Wszystkie zmiany są zapisywane lokalnie. Aby zresetować zmiany, wyczyść pamięć podręczną przeglądarki.",
            "zh-cn": "所有更改都保存在本地。要重置更改，请清除浏览器缓存。"
        },
        'please use /vis/edit.html instead of /vis/?edit': {
            'en': 'Please use /vis/edit.html instead of /vis/?edit',
            'de': 'Bitte geben Sie /vis/edit.html statt /vis/?edit',
            'ru': 'Используйте /vis/edit.html вместо /vis/?edit',
            "pt": "Por favor, use /vis/edit.html em vez de /vis/?edit",
            "nl": "Gebruik alsjeblieft /vis/edit.html in plaats van /vis/?edit",
            "fr": "Veuillez utiliser /vis/edit.html au lieu de /vis/?edit",
            "it": "Utilizza /vis/edit.html invece di /vis/?edit",
            "es": "Utilice /vis/edit.html en lugar de /vis/?edit",
            "pl": "Użyj /vis/edit.html zamiast /vis/?edit",
            "zh-cn": "请使用/vis/edit.html而不是/vis/?edit"
        },
        'no views found on server.\nCreate new %s ?': {
            'en': 'no views found on server.\nCreate new %s?',
            'de': 'Keine Views am Server gefunden am.\nErzeugen %s?',
            'ru': 'На сервере не найдено никаких страниц. Создать %s?',
            "pt": "nenhuma vista encontrada no servidor.\nCrie novos %s?",
            "nl": "geen weergaven gevonden op server.\nNieuwe %s maken?",
            "fr": "aucune vue trouvée sur le serveur.\nCréer un nouveau %s?",
            "it": "nessuna vista trovata sul server.\nCrea nuovo %s?",
            "es": "No se han encontrado vistas en el servidor.\nCrear nuevo %s?",
            "pl": "nie znaleziono widoków na serwerze.\nUtwórz nowy %s?",
            "zh-cn": "在服务器上找不到任何视图\n创建新的 %s？"
        },
        'Update found, loading new Files...': {
            'en': 'Update found.<br/>Loading new Files...',
            'de': 'Neue Version gefunden.<br/>Lade neue Dateien...',
            'ru': 'Обнаружено Обновление.<br/>Загружаю новые файлы...',
            "pt": "Atualização encontrada. <br/> Carregando novos arquivos ...",
            "nl": "Update gevonden. <br/> Nieuwe bestanden laden ...",
            "fr": "Mise à jour trouvée. <br/> Chargement de nouveaux fichiers ...",
            "it": "Aggiornamento trovato. <br/> Caricamento di nuovi file ...",
            "es": "Actualización encontrada. <br/> Cargando nuevos archivos ...",
            "pl": "Znaleziono aktualizację. <br/> Ładowanie nowych plików ...",
            "zh-cn": "找到更新。<br/>加载新文件..."
        },
        'Loading Widget-Sets...': {
            'en': 'Loading Widget-Sets...',
            'de': 'Lade Widget-Sätze...',
            'ru': 'Загрузка наборов элементов...',
            "pt": "Carregando Conjuntos de Widget ...",
            "nl": "Widgetsets laden ...",
            "fr": "Chargement des ensembles de widgets ...",
            "it": "Caricamento widget-set ...",
            "es": "Cargando conjuntos de widgets ...",
            "pl": "Ładowanie zestawów widgetów ...",
            "zh-cn": "正在加载Widget-Sets ..."
        },
        'error: view not found.': {
            'en': 'Error: view not found',
            'de': 'Fehler: View wurde nicht gefunden',
            'ru': 'Ошибка: Страница не существует',
            "pt": "Erro: página não encontrada",
            "nl": "Fout: pagina niet gevonden",
            "fr": "Erreur: page non trouvée",
            "it": "Errore: pagina non trovata",
            "es": "Error: página no encontrada",
            "pl": "Błąd: strona nie znaleziona",
            "zh-cn": "错误：找不到页面"
        },
        'error: view container recursion.': {
            'en': 'Error: view container recursion',
            'de': 'Fehler: View ist rekursiv',
            'ru': 'Ошибка: Страница вызывет саму себя',
            "pt": "Erro: recursão do contêiner de página",
            "nl": "Fout: paginacontainer-recursie",
            "fr": "Erreur: récursivité du conteneur de page",
            "it": "Errore: ricorsione del contenitore della pagina",
            "es": "Error: página de recursión del contenedor.",
            "pl": "Błąd: rekursja kontenera strony",
            "zh-cn": "错误：页面容器递归"
        },
        "Cannot execute %s for %s, because of insufficient permissions": {
            "en": "Cannot execute %s for %s, because of insufficient permissions.",
            "de": "Kann das Kommando \"%s\" für %s nicht ausführen, weil nicht genügend Zugriffsrechte vorhanden sind.",
            "ru": "Не могу выполнить \"%s\" для %s, так как недостаточно прав.",
            "pt": "Não é possível executar %s para %s, devido a permissões insuficientes.",
            "nl": "Kan %s niet uitvoeren voor %s, vanwege onvoldoende machtigingen.",
            "fr": "Impossible d'exécuter %s pour %s en raison d'autorisations insuffisantes.",
            "it": "Impossibile eseguire %s per %s, a causa di autorizzazioni insufficienti.",
            "es": "No se puede ejecutar %s para %s, debido a permisos insuficientes.",
            "pl": "Nie można wykonać %s dla %s, z powodu niewystarczających uprawnień.",
            "zh-cn": "由于权限不足，无法为％s执行%s。"
        },
        "Insufficient permissions": {
            "en": "Insufficient permissions",
            "de": "Nicht genügend Zugriffsrechte",
            "ru": "Недостаточно прав",
            "pt": "Permissões insuficientes",
            "nl": "Onvoldoende rechten",
            "fr": "Permissions insuffisantes",
            "it": "Permessi insufficienti",
            "es": "Permisos insuficientes",
            "pl": "Niewystarczające uprawnienia",
            "zh-cn": "权限不足"
        },
        "View disabled for user %s": {
            "en": "View disabled for user <b>%s</b>",
            "de": "View ist für Anwender <b>%s</b> deaktiviert",
            "ru": "Страница недоступна для пользователя <b>%s</b>",
            "pt": "Visualização desativada para o usuário <b>%s</b>",
            "nl": "Weergave uitgeschakeld voor gebruiker <b>%s</b>",
            "fr": "Affichage désactivé pour l'utilisateur <b>%s</b>",
            "it": "Visualizza disabilitato per l'utente <b>%s</b>",
            "es": "Vista deshabilitada para el usuario <b>%s</b>",
            "pl": "Widok wyłączony dla użytkownika <b>%s</b>",
            "zh-cn": "用户<b>%s</b>的视图已停用"
        },
        "Today": {
            "en": "Today",
            "de": "Heute",
            "ru": "Cегодня",
            "pt": "Hoje",
            "nl": "Vandaag",
            "fr": "Aujourd'hui",
            "it": "Oggi",
            "es": "Hoy",
            "pl": "Dzisiaj",
            "zh-cn": "今天"
        },
        "Yesterday": {
            "en": "Yesterday",
            "de": "Gestern",
            "ru": "Вчерашний день",
            "pt": "Ontem",
            "nl": "Gisteren",
            "fr": "Hier",
            "it": "Ieri",
            "es": "Ayer",
            "pl": "Wczoraj",
            "zh-cn": "昨天"
        }
    });
}

if (typeof systemLang !== 'undefined' && typeof cordova === 'undefined') {
    systemLang = visConfig.language || systemLang;
}

var FORBIDDEN_CHARS = /[^._\-/ :!#$%&()+=@^{}|~]+/g; // from https://github.com/ioBroker/ioBroker.js-controller/blob/master/packages/common/lib/common/tools.js
// var FORBIDDEN_CHARS = /[^._\-/ :!#$%&()+=@^{}|~\p{Ll}\p{Lu}\p{Nd}]+/gu; // it must be like this, but old browsers does not support Unicode

var vis = {
    version: '1.4.15',
    requiredServerVersion: '0.0.0',

    storageKeyViews:    'visViews',
    storageKeySettings: 'visSettings',
    storageKeyInstance: 'visInstance',

    instance:           null,
    urlParams:          {},
    settings:           {},
    views:              null,
    widgets:            {},
    activeView:         '',
    activeViewDiv:      '',
    widgetSets:         visConfig.widgetSets,
    initialized:        false,
    toLoadSetsCount:    0, // Count of widget sets that should be loaded
    isFirstTime:        true,
    useCache:           false,
    authRunning:        false,
    cssChecked:         false,
    isTouch:            'ontouchstart' in document.documentElement,
    binds:              {},
    onChangeCallbacks:  [],
    viewsActiveFilter:  {},
    projectPrefix:      window.location.search ? window.location.search.slice(1) + '/' : 'main/',
    navChangeCallbacks: [],
    editMode:           false,
    language:           (typeof systemLang !== 'undefined') ? systemLang : visConfig.language,
    statesDebounce:     {},
    statesDebounceTime: 1000,
    visibility:         {},
    signals:            {},
    lastChanges:        {},
    bindings:           {},
    bindingsCache:      {},
    subscribing:        {
        IDs:         [],
        byViews:     {},
        active:      [],
        activeViews: []
    },
    commonStyle:        null,
    debounceInterval:   700,
    user:               '',   // logged in user
    loginRequired:      false,
    sound:              /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent) ? $('<audio id="external_sound" autoplay muted></audio>').appendTo('body') : null,
    _setValue:          function (id, state, isJustCreated) {
        var that = this;
        var oldValue = this.states.attr(id + '.val');

        // If ID starts from 'local_', do not send changes to the server, we assume that it is a local variable of the client
        if (id.indexOf('local_') === 0) {
            that.states.attr(state);

            // Inform other widgets, that does not support canJS
            for (var i = 0, len = that.onChangeCallbacks.length; i < len; i++) {
                try {
                    that.onChangeCallbacks[i].callback(that.onChangeCallbacks[i].arg, id, state);
                } catch (e) {
                    that.conn.logError('Error: can\'t update states object for ' + id + '(' + e + '): ' + JSON.stringify(e.stack));
                }
            }

            // update local variable state -> needed for binding, etc.
            vis.updateState(id, state);

            return;
        }

        this.conn.setState(id, state[id + '.val'], function (err) {
            if (err) {
                //state[id + '.val'] = oldValue;
                that.showMessage(_('Cannot execute %s for %s, because of insufficient permissions', 'setState', id), _('Insufficient permissions'), 'alert', 600);
            }

            var val = that.states.attr(id + '.val');

            if (that.states.attr(id) || val !== undefined || val !== null) {
                that.states.attr(state);

                // If error set value back, but we need generate the edge
                if (err) {
                    if (isJustCreated) {
                        that.states.removeAttr(id + '.val');
                        that.states.removeAttr(id + '.q');
                        that.states.removeAttr(id + '.from');
                        that.states.removeAttr(id + '.ts');
                        that.states.removeAttr(id + '.lc');
                        that.states.removeAttr(id + '.ack');
                    } else {
                        state[id + '.val'] = oldValue;
                        that.states.attr(state);
                    }
                }

                // Inform other widgets, that does not support canJS
                for (var i = 0, len = that.onChangeCallbacks.length; i < len; i++) {
                    try {
                        that.onChangeCallbacks[i].callback(that.onChangeCallbacks[i].arg, id, state);
                    } catch (e) {
                        that.conn.logError('Error: can\'t update states object for ' + id + '(' + e + '): ' + JSON.stringify(e.stack));
                    }
                }
            }
        });
    },
    setValue:           function (id, val) {
        if (!id) {
            console.log('ID is null for val=' + val);
            return;
        }

        var d = new Date();
        var t = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + " " + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
        var o = {};
        var created = false;
        if (this.states.attr(id + '.val') != val) {
            o[id + '.lc'] = t;
        } else {
            o[id + '.lc'] = this.states.attr(id + '.lc');
        }
        o[id + '.val'] = val;
        o[id + '.ts'] = t;
        o[id + '.ack'] = false;

        var _val = this.states.attr(id + '.val');
        // Create this value
        if (_val === undefined || _val === null) {
            created = true;
            this.states.attr(o);
        }

        var that = this;

        // if no de-bounce running
        if (!this.statesDebounce[id]) {
            // send control command
            this._setValue(id, o, created);
            // Start timeout
            this.statesDebounce[id] = {
                timeout: _setTimeout(function () {
                    if (that.statesDebounce[id]) {
                        if (that.statesDebounce[id].state) that._setValue(id, that.statesDebounce[id].state);
                        delete that.statesDebounce[id];
                    }
                }, that.statesDebounceTime, id),
                state: null
            };
        } else {
            // If some de-bounce running, change last value
            this.statesDebounce[id].state = o;
        }
    },
    loadWidgetSet:      function (name, callback) {
        var url = './widgets/' + name + '.html?visVersion=' + this.version;
        var that = this;
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'html',
            cache: this.useCache,
            success: function (data) {
                setTimeout(function () {
                    try {
                        $('head').append(data);
                    } catch (e) {
                        console.error('Cannot load widget set "' + name + '": ' + e);
                    }
                    that.toLoadSetsCount -= 1;
                    if (that.toLoadSetsCount <= 0) {
                        that.showWaitScreen(true, null, null, 100);
                        setTimeout(function () {
                            callback.call(that);
                        }, 100);
                    } else {
                        that.showWaitScreen(true, null, null, parseInt((100 - that.waitScreenVal) / that.toLoadSetsCount, 10));
                    }
                }, 0);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                that.conn.logError('Cannot load widget set ' + name + ' ' + errorThrown);
            }
        });
    },
    // Return as array used widgetSets or null if no information about it
    getUsedWidgetSets:  function () {
        var widgetSets = [];

        if (!this.views) {
            console.log('Check why views are not yet loaded!');
            return null;
        }

        // Convert visConfig.widgetSets to object for easier dependency search
        var widgetSetsObj = {};
        for (var i = 0; i < visConfig.widgetSets.length; i++) {
            if (typeof visConfig.widgetSets[i] === 'object') {
                if (!visConfig.widgetSets[i].depends) {
                    visConfig.widgetSets[i].depends = [];
                }
                widgetSetsObj[visConfig.widgetSets[i].name] = visConfig.widgetSets[i];

            } else {
                widgetSetsObj[visConfig.widgetSets[i]] = {depends: []};
            }
        }

        for (var view in this.views) {
            if (!this.views.hasOwnProperty(view) ||  view === '___settings') {
                continue;
            }
            for (var id in this.views[view].widgets) {
                if (!this.views[view].widgets.hasOwnProperty(id)) {
                    continue;
                }

                if (!this.views[view].widgets[id].widgetSet) {
                    // Views are not yet converted and have no widgetSet information)
                    return null;
                } else if (widgetSets.indexOf(this.views[view].widgets[id].widgetSet) === -1) {
                    var wset = this.views[view].widgets[id].widgetSet;
                    widgetSets.push(wset);

                    // Add dependencies
                    if (widgetSetsObj[wset]) {
                        for (var u = 0, ulen = widgetSetsObj[wset].depends.length; u < ulen; u++) {
                            if (widgetSets.indexOf(widgetSetsObj[wset].depends[u]) === -1) {
                                widgetSets.push(widgetSetsObj[wset].depends[u]);
                            }
                        }
                    }
                }
            }
        }
        return widgetSets;
    },
    // Return as array used widgetSets or null if no information about it
    getUsedObjectIDs:   function () {
        var result = getUsedObjectIDs(this.views, !this.editMode);
        if (!result) {
            return result;
        }
        this.visibility  = result.visibility;
        this.bindings    = result.bindings;
        this.signals     = result.signals;
        this.lastChanges = result.lastChanges;

        return {IDs: result.IDs, byViews: result.byViews};
    },
    getWidgetGroup:     function (view, widget) {
        return getWidgetGroup(this.views, view, widget);
    },
    loadWidgetSets:     function (callback) {
        this.showWaitScreen(true, '<br>' + _('Loading Widget-Sets...') + ' <span id="widgetset_counter"></span>', null, 20);
        var arrSets = [];

        // If widgets are preloaded
        if (this.binds && this.binds.stateful !== undefined && this.binds.stateful !== null) {
            this.toLoadSetsCount = 0;
        } else {
            // Get list of used widget sets. if Edit mode list is null.
            var widgetSets = this.editMode ? null : this.getUsedWidgetSets();

            // First calculate how many sets to load
            for (var i = 0; i < this.widgetSets.length; i++) {
                var name = this.widgetSets[i].name || this.widgetSets[i];

                // Skip unused widget sets in non-edit mode
                if (!this.widgetSets[i].always) {
                    if (this.widgetSets[i].widgetSets && widgetSets.indexOf(name) === -1) {
                        continue;
                    }
                } else {
                    if (widgetSets && widgetSets.indexOf(name) === -1) widgetSets.push(name);
                }

                arrSets[arrSets.length] = name;

                if (this.editMode && this.widgetSets[i].edit) {
                    arrSets[arrSets.length] = this.widgetSets[i].edit;
                }
            }
            this.toLoadSetsCount = arrSets.length;
            $('#widgetset_counter').html('<span style="font-size: 10px">(' + this.toLoadSetsCount + ')</span>');
        }

        var that = this;
        if (this.toLoadSetsCount) {
            for (var j = 0, len = this.toLoadSetsCount; j < len; j++) {
                _setTimeout(function (_i) {
                    that.loadWidgetSet(arrSets[_i], callback);
                }, 100, j);
            }
        } else {
            callback && callback.call(this);
        }
    },
    bindInstance:       function () {
        if (typeof app !== 'undefined' && app.settings) {
            this.instance = app.settings.instance;
        }
        if (typeof storage !== 'undefined') {
            this.instance = this.instance || storage.get(this.storageKeyInstance);
        }
        if (this.editMode) {
            this.bindInstanceEdit();
        }
        this.states.attr({'instance.val': this.instance, 'instance': this.instance});
    },
    init:               function (onReady) {
        if (this.initialized) {
            return;
        }

        if (typeof storage !== 'undefined') {
            var settings = storage.get(this.storageKeySettings);
            if (settings) {
                this.settings = $.extend(this.settings, settings);
            }
        }

        // Late initialization (used only for debug)
        /*if (this.binds.hqWidgetsExt) {
         this.binds.hqWidgetsExt.hqInit();
         }*/

        var that = this;
        //this.loadRemote(this.loadWidgetSets, this.initNext);
        this.loadWidgetSets(function () {
            that.initNext(onReady);
        });
    },
    initNext:           function (onReady) {
        this.showWaitScreen(false);
        var that = this;
        // First start.
        if (!this.views) {
            this.initViewObject();
        } else {
            this.showWaitScreen(false);
        }

        var hash = decodeURIComponent(window.location.hash.substring(1));

        // create demo states
        if (this.views && this.views.DemoView) this.createDemoStates();

        if (!this.views || (!this.views[hash] && typeof app !== 'undefined')) {
            hash = null;
        }

        // View selected?
        if (!hash) {
            // Take first view in the list
            this.activeView = this.findNearestResolution(true);
            this.activeViewDiv = this.activeView;

            // Create default view in demo mode
            if (typeof io === 'undefined') {
                if (!this.activeView) {
                    if (!this.editMode) {
                        window.alert(_('error - View doesn\'t exist'));
                        if (typeof app === 'undefined') {
                            // try to find first view
                            window.location.href = 'edit.html?' + this.projectPrefix.substring(0, this.projectPrefix.length - 1);
                        }
                    } else {
                        this.views.DemoView = this.createDemoView ? this.createDemoView() : {
                            settings: {style: {}},
                            widgets: {}
                        };
                        this.activeView = 'DemoView';
                        this.activeViewDiv = this.activeView;
                    }
                }
            } else if (!this.activeView) {
                if (!this.editMode) {
                    if (typeof app === 'undefined') {
                        window.alert(_('error - View doesn\'t exist'));
                        window.location.href = 'edit.html?' + this.projectPrefix.substring(0, this.projectPrefix.length - 1);
                    }
                } else {
                    // All views were deleted, but file exists. Create demo View
                    //window.alert("unexpected error - this should not happen :(");
                    //$.error("this should not happen :(");
                    // create demoView
                    this.views.DemoView = this.createDemoView ? this.createDemoView() : {
                        settings: {style: {}},
                        widgets: {}
                    };
                    this.activeView = 'DemoView';
                    this.activeViewDiv = this.activeView;
                }
            }
        } else {
            if (this.views[hash]) {
                this.activeView = hash;
                this.activeViewDiv = this.activeView;
            } else {
                window.alert(_('error - View doesn\'t exist'));
                if (typeof app === 'undefined') {
                    window.location.href = 'edit.html?' + this.projectPrefix.substring(0, this.projectPrefix.length - 1);
                }
                $.error('vis Error can\'t find view');
            }
        }

        if (this.views && this.views.___settings) {
            if (this.views.___settings.reloadOnSleep !== undefined) {
                this.conn.setReloadTimeout(this.views.___settings.reloadOnSleep);
            }
            if (this.views.___settings.darkReloadScreen) {
                $('#server-disconnect').removeClass('disconnect-light').addClass('disconnect-dark');
            }
            if (this.views.___settings.reconnectInterval !== undefined) {
                this.conn.setReconnectInterval(this.views.___settings.reconnectInterval);
            }
            if (this.views.___settings.destroyViewsAfter !== undefined) {
                this.views.___settings.destroyViewsAfter = parseInt(this.views.___settings.destroyViewsAfter, 10);
            }
            if (this.views.___settings.statesDebounceTime > 0) {
                this.statesDebounceTime = parseInt(this.views.___settings.statesDebounceTime);
            }
        }

        // Navigation
        $(window).bind('hashchange', function (/* e */) {
            var view = window.location.hash.slice(1);
            that.changeView(view, view);
        });

        this.bindInstance();

        // EDIT mode
        this.editMode && this.editInitNext();

        this.initialized = true;

        // If this function called earlier, it makes problems under FireFox.
        // render all views, that should be always rendered
        var containers = [];
        var cnt = 0;
        if (this.views && !this.editMode) {
            for (var view in this.views) {
                if (!this.views.hasOwnProperty(view) || view === '___settings') {
                    continue;
                }
                if (this.views[view].settings.alwaysRender) {
                    containers.push({view: view});
                }
            }
            if (containers.length) {
                cnt++;
                this.renderViews(that.activeViewDiv, containers, function () {
                    cnt--;
                    if (that.activeView) {
                        that.changeView(that.activeViewDiv, that.activeView, function () {
                            if (!cnt && onReady) {
                                onReady();
                            }
                        });
                    }
                });
            }
            this.checkLicense();
        }

        if (!containers.length && this.activeView) {
            this.changeView(this.activeViewDiv, this.activeView, onReady);
        }
    },
    initViewObject:     function () {
        if (!this.editMode) {
            if (typeof app !== 'undefined') {
                this.showMessage(_('no views found!'));
            } else {
                window.location.href = 'edit.html?' + this.projectPrefix.substring(0, this.projectPrefix.length - 1);
            }
        } else {
            if (window.confirm(_('no views found on server.\nCreate new %s ?', this.projectPrefix + 'vis-views.json'))) {
                this.views = {};
                this.views.DemoView = this.createDemoView ? this.createDemoView() : {
                    settings: {style: {}},
                    widgets: {}
                };
                if (this.saveRemote) {
                    this.saveRemote(true, function () {
                        //window.location.reload();
                    });
                }
            } else {
                window.location.reload();
            }
        }
    },
    setViewSize:        function (viewDiv, view) {
        var $view = $('#visview_' + viewDiv);
        var width;
        var height;
        if (this.views[view]) {
            // Because of background, set the width and height of the view
            width  = parseInt(this.views[view].settings.sizex, 10);
            height = parseInt(this.views[view].settings.sizey, 10);
        }
        var $vis_container = $('#vis_container');
        if (!width  || width < $vis_container.width())   {
            width  = '100%';
        }
        if (!height || height < $vis_container.height()) {
            height = '100%';
        }
        $view.css({width: width, height: height});
    },
    updateContainers:   function (viewDiv, view) {
        var that = this;
        // Set ths views for containers
        $('#visview_' + viewDiv).find('.vis-view-container').each(function () {
            var cview = $(this).attr('data-vis-contains');
            if (!that.views[cview]) {
                $(this).html('<span style="color: red" class="container-error">' + _('error: view not found.') + '</span>');
            } else if (cview === view || cview === viewDiv) {
                $(this).html('<span style="color: red" class="container-error">' + _('error: view container recursion.') + '</span>');
            } else {
                if ($(this).find('.container-error').length) {
                    $(this).html('');
                }
                var targetView = this;
                if (!$(this).find('.vis-widget:first').length) {
                    that.renderView(cview, cview, function (_viewDiv) {
                        $('#visview_' + _viewDiv)
                            .appendTo(targetView)
                            .show();
                    });
                } else {
                    $('#visview_' + cview)
                        .appendTo(targetView)
                        .show();
                }
            }
        });
    },
    renderViews:        function (viewDiv, views, index, callback) {
        if (typeof index === 'function') {
            callback = index;
            index = 0;
        }
        index = index || 0;

        if (!views || index >= views.length) {
            return callback && callback(viewDiv, views);
        }
        var item = views[index];
        var that = this;
        this.renderView(this.views[item.view] ? item.view : viewDiv, item.view, true, function () {
            that.renderViews(viewDiv, views, index + 1, callback);
        });
    },
    renderView:         function (viewDiv, view, hidden, callback) {
        var that = this;

        if (typeof hidden === 'function') {
            callback = hidden;
            hidden = undefined;
        }
        if (typeof view === 'boolean') {
            callback = hidden;
            hidden   = undefined;
            view     = viewDiv;
        }

        viewDiv = decodeURIComponent(viewDiv);
        view = decodeURIComponent(view);

        if (!this.editMode && !$('#commonTheme').length) {
            $('head').prepend('<link rel="stylesheet" type="text/css" href="' + ((typeof app === 'undefined') ? '../../' : '') + 'lib/css/themes/jquery-ui/' + (this.calcCommonStyle() || 'redmond') + '/jquery-ui.min.css" id="commonTheme"/>');
        }

        if (!this.views[view] || !this.views[view].settings) {
            window.alert('Cannot render view ' + view + '. Invalid settings');
            if (callback) {
                setTimeout(function () {
                    callback(viewDiv, view);
                }, 0);
            }
            return false;
        }

        // try to render background


        // collect all IDs, used in this view and in containers
        this.subscribeStates(view, function () {
            var isViewsConverted = false; // Widgets in the views hav no information which WidgetSet they use, this info must be added and this flag says if that happens to store the views

            that.views[view].settings.theme = that.views[view].settings.theme || 'redmond';

            if (that.views[view].settings.filterkey) {
                that.viewsActiveFilter[view] = that.views[view].settings.filterkey.split(',');
            } else {
                that.viewsActiveFilter[view] = [];
            }
            //noinspection JSJQueryEfficiency
            var $view = $('#visview_' + viewDiv);

            // apply group policies
            if (!that.editMode && that.views[view].settings.group && that.views[view].settings.group.length) {
                if (that.views[view].settings.group_action === 'hide') {
                    if (!that.isUserMemberOf(that.conn.getUser(), that.views[view].settings.group)) {
                        if (!$view.length) {
                            $('#vis_container').append('<div id="visview_' + viewDiv + '" class="vis-view vis-user-disabled"></div>');
                            $view = $('#visview_' + viewDiv);
                        }
                        $view.html('<div class="vis-view-disabled-text">' + _('View disabled for user %s', that.conn.getUser()) + '</div>');
                        if (callback) {
                            setTimeout(function () {
                                callback(viewDiv, view);
                            }, 0);
                        }
                        return;
                    }
                }
            }
            if (!$view.length) {
                $('#vis_container').append('<div style="display: none;" id="visview_' + viewDiv + '" ' +
                    'data-view="' + view + '" ' +
                    'class="vis-view ' + (viewDiv !== view ? 'vis-edit-group' : '') + '" ' +
                    (that.views[view].settings.alwaysRender ? 'data-persistent="true"' : '') + '>' +
                    '<div class="vis-view-disabled" style="display: none"></div>' +
                    '</div>');
                that.addViewStyle(viewDiv, view, that.views[view].settings.theme);

                $view = $('#visview_' + viewDiv);

                $view.css(that.views[view].settings.style);

                if (that.views[view].settings.style.background_class) {
                    $view.addClass(that.views[view].settings.style.background_class);
                }

                var id;
                if (viewDiv !== view && that.editMode) {
                    //noinspection JSJQueryEfficiency
                    var $widget = $('#' + viewDiv);
                    if (!$widget.length) {
                        that.renderWidget(view, view, viewDiv);
                        $widget = $('#' + viewDiv);
                    }
                    $view.append('<div class="group-edit-header" data-view="' + viewDiv + '">' + _('Edit group:') + ' <b>' + viewDiv + '</b><button class="group-edit-close"></button></div>');
                    $view.find('.group-edit-close').button({
                        icons: {
                            primary: 'ui-icon-close'
                        },
                        text: false
                    }).data('view', view).css({width: 20, height: 20}).click(function () {
                        var view = $(this).data('view');
                        that.changeView(view, view);
                    });

                    $widget.appendTo($view);
                    $widget.css({top: 0, left: 0});
                    /*$widget.unbind('click dblclick');
                     $widget.find('.vis-widget').each(function () {
                     var id = $(this).attr('id');
                     that.bindWidgetClick(view, id, true);
                     });*/
                } else {
                    that.setViewSize(viewDiv, view);
                    // Render all widgets
                    for (id in that.views[view].widgets) {
                        if (!that.views[view].widgets.hasOwnProperty(id)) {
                            continue;
                        }
                        // Try to complete the widgetSet information to optimize the loading of widgetSets
                        if (id[0] !== 'g' && !that.views[view].widgets[id].widgetSet) {
                            var obj = $('#' + that.views[view].widgets[id].tpl);
                            if (obj) {
                                that.views[view].widgets[id].widgetSet = obj.attr('data-vis-set');
                                isViewsConverted = true;
                            }
                        }

                        if (!that.views[view].widgets[id].renderVisible && !that.views[view].widgets[id].grouped) {
                            that.renderWidget(viewDiv, view, id);
                        }
                    }
                }

                if (that.editMode) {
                    if (that.binds.jqueryui) {
                        that.binds.jqueryui._disable();
                    }
                    that.droppable(viewDiv, view);
                }
            }

            // move views in container
            var containers = [];
            $view.find('.vis-view-container').each(function () {
                var cview = $(this).attr('data-vis-contains');
                if (!that.views[cview]) {
                    $(this).append('error: view not found.');
                    return false;
                } else if (cview === view) {
                    $(this).append('error: view container recursion.');
                    return false;
                }
                containers.push({thisView: this, view: cview});
            });
            // add view class
            if (that.views[view].settings['class']) {
                $view.addClass(that.views[view].settings['class'])
            }
            var wait = false;
            if (containers.length) {
                wait = true;
                that.renderViews(viewDiv, containers, function (_viewDiv, _containers) {
                    for (var c = 0; c < _containers.length; c++) {
                        $('#visview_' + _containers[c].view)
                            .appendTo(_containers[c].thisView)
                            .show();
                    }
                    !hidden && $view.show();

                    $('#visview_' + _viewDiv).trigger('rendered');
                    callback && callback(_viewDiv, view);
                });
            }

            // Store modified view
            isViewsConverted && that.saveRemote && that.saveRemote();

            if (that.editMode && $('#wid_all_lock_function').prop('checked')) {
                $('.vis-widget').addClass('vis-widget-lock');
                if (viewDiv !== view) {
                    $('#' + viewDiv).removeClass('vis-widget-lock');
                }
            }

            if (!wait) {
                !hidden && $view.show();

                setTimeout(function () {
                    $('#visview_' + viewDiv).trigger('rendered');
                    callback && callback(viewDiv, view);
                }, 0);
            }

            // apply group policies
            if (!that.editMode && that.views[view].settings.group && that.views[view].settings.group.length) {
                if (that.views[view].settings.group_action !== 'hide') {
                    if (!that.isUserMemberOf(that.conn.getUser(), that.views[view].settings.group)) {
                        $view.addClass('vis-user-disabled');
                    }
                }
            }
        });
    },
    addViewStyle:       function (viewDiv, view, theme) {
        var _view = 'visview_' + viewDiv;

        if (this.calcCommonStyle() === theme) {
            return;
        }

        $.ajax({
            url: ((typeof app === 'undefined') ? '../../' : '') + 'lib/css/themes/jquery-ui/' + theme + '/jquery-ui.min.css',
            cache: false,
            success: function (data) {
                $('#' + viewDiv + '_style').remove();
                data = data.replace('.ui-helper-hidden', '#' + _view + ' .ui-helper-hidden');
                data = data.replace(/(}.)/g, '}#' + _view + ' .');
                data = data.replace(/,\./g, ',#' + _view + ' .');
                data = data.replace(/images/g, ((typeof app === 'undefined') ? '../../' : '') + 'lib/css/themes/jquery-ui/' + theme + '/images');
                var $view = $('#' + _view);
                $view.append('<style id="' + viewDiv + '_style">' + data + '</style>');

                $('#' + viewDiv + '_style_common_user').remove();
                $view.append('<style id="' + viewDiv + '_style_common_user" class="vis-common-user">' + $('#vis-common-user').html() + '</style>');

                $('#' + viewDiv + '_style_user').remove();
                $view.append('<style id="' + viewDiv + '_style_user" class="vis-user">' + $('#vis-user').html() + '</style>');
            }
        });
    },
    preloadImages:      function (srcs) {
        this.preloadImages.cache = this.preloadImages.cache || [];

        var img;
        for (var i = 0; i < srcs.length; i++) {
            img = new Image();
            img.src = srcs[i];
            this.preloadImages.cache.push(img);
        }
    },
    destroyWidget:      function (viewDiv, view, widget) {
        var $widget = $('#' + widget);
        if ($widget.length) {
            var widgets = this.views[view].widgets[widget].data.members;

            if (widgets) {
                for (var w = 0; w < widgets.length; w++) {
                    if (widgets[w] !== widget) {
                        this.destroyWidget(viewDiv, view, widgets[w]);
                    } else {
                        console.warn('Cyclic structure in ' + widget + '!');
                    }
                }
            }

            try {
                // get array of bound OIDs
                var bound = $widget.data('bound');
                if (bound) {
                    var bindHandler = $widget.data('bindHandler');
                    for (var b = 0; b < bound.length; b++) {
                        if (typeof bindHandler === 'function') {
                            this.states.unbind(bound[b], bindHandler);
                        } else {
                            this.states.unbind(bound[b], bindHandler[b]);
                        }
                    }
                    $widget.data('bindHandler', null);
                    $widget.data('bound', null);
                }
                // If destroy function exists => destroy it
                var destroy = $widget.data('destroy');
                if (typeof destroy === 'function') {
                    destroy(widget, $widget);
                }
            } catch (e) {
                console.error('Cannot destroy "' + widget + '": ' + e);
            }
        }
    },
    reRenderWidget:     function (viewDiv, view, widget) {
        var $widget = $('#' + widget);
        var updateContainers = $widget.find('.vis-view-container').length;
        view    = view    || this.activeView;
        viewDiv = viewDiv || this.activeViewDiv;

        this.destroyWidget(viewDiv, view, widget);
        this.renderWidget(viewDiv, view, widget, !this.views[viewDiv] && viewDiv !== widget ?
            viewDiv :
            (vis.views[view].widgets[widget].groupid ? vis.views[view].widgets[widget].groupid : null));

        updateContainers && this.updateContainers(viewDiv, view);
    },
    changeFilter:       function (view, filter, showEffect, showDuration, hideEffect, hideDuration) {
        view = view || this.activeView;
        // convert from old style
        if (!this.views[view]) {
            hideDuration = hideEffect;
            hideEffect = showDuration;
            showDuration = showEffect;
            showEffect = filter;
            filter = view;
            view = this.activeView;
        }

        var widgets = this.views[view].widgets;
        var that = this;
        var widget;
        var mWidget;
        if (!(filter || '').trim()) {
            // show all
            for (widget in widgets) {
                if (!widgets.hasOwnProperty(widget)) {
                    continue;
                }
                if (widgets[widget] && widgets[widget].data && widgets[widget].data.filterkey) {
                    $('#' + widget).show(showEffect, null, parseInt(showDuration));
                }
            }
            // Show complex widgets
            setTimeout(function () {
                var mWidget;
                for (var widget in widgets) {
                    if (!widgets.hasOwnProperty(widget)) {
                        continue;
                    }
                    mWidget = document.getElementById(widget);
                    if (widgets[widget] &&
                        widgets[widget].data &&
                        widgets[widget].data.filterkey &&
                        mWidget &&
                        mWidget._customHandlers &&
                        mWidget._customHandlers.onShow) {
                        mWidget._customHandlers.onShow(mWidget, widget);
                    }
                }
            }, parseInt(showDuration) + 10);

        } else if (filter === '$') {
            // hide all
            for (widget in widgets) {
                if (!widgets.hasOwnProperty(widget)) {
                    continue;
                }
                if (!widgets[widget] || !widgets[widget].data || !widgets[widget].data.filterkey) {
                    continue;
                }
                mWidget = document.getElementById(widget);
                if (mWidget &&
                    mWidget._customHandlers &&
                    mWidget._customHandlers.onHide) {
                    mWidget._customHandlers.onHide(mWidget, widget);
                }
                $('#' + widget).hide(hideEffect, null, parseInt(hideDuration));
            }
        } else {
            this.viewsActiveFilter[this.activeView] = filter.split(',');
            var vFilters = this.viewsActiveFilter[this.activeView];
            for (widget in widgets) {
                if (!widgets.hasOwnProperty(widget) || !widgets[widget] || !widgets[widget].data) {
                    continue;
                }
                var wFilters = widgets[widget].data.filterkey;

                if (wFilters) {
                    if (typeof wFilters !== 'object') {
                        widgets[widget].data.filterkey = wFilters.split(/[;,]+/);
                        wFilters = widgets[widget].data.filterkey;
                    }
                    var found = false;
                    // optimization
                    if (wFilters.length === 1) {
                        found = vFilters.indexOf(wFilters[0]) !== -1;
                    } else if (vFilters.length === 1) {
                        found = wFilters.indexOf(vFilters[0]) !== -1;
                    } else {
                        for (var f = 0; f < wFilters.length; f++) {
                            if (vFilters.indexOf(wFilters[f]) !== -1) {
                                found = true;
                                break;
                            }
                        }
                    }

                    if (!found) {
                        mWidget = document.getElementById(widget);
                        if (mWidget &&
                            mWidget._customHandlers &&
                            mWidget._customHandlers.onHide) {
                            mWidget._customHandlers.onHide(mWidget, widget);
                        }
                        $('#' + widget).hide(hideEffect, null, parseInt(hideDuration));
                    } else {
                        mWidget = document.getElementById(widget);
                        if (mWidget && mWidget._customHandlers && mWidget._customHandlers.onShow) {
                            mWidget._customHandlers.onShow(mWidget, widget);
                        }
                        $('#' + widget).show(showEffect, null, parseInt(showDuration));
                    }
                }
            }
            setTimeout(function () {
                var mWidget;

                // Show complex widgets like hqWidgets or bars
                for (var widget in widgets) {
                    if (!widgets.hasOwnProperty(widget)) {
                        continue;
                    }
                    mWidget = document.getElementById(widget);
                    if (mWidget &&
                        mWidget._customHandlers &&
                        mWidget._customHandlers.onShow) {
                        if (widgets[widget] && widgets[widget].data && widgets[widget].data.filterkey) {
                            if (!(that.viewsActiveFilter[that.activeView].length > 0 &&
                                that.viewsActiveFilter[that.activeView].indexOf(widgets[widget].data.filterkey) === -1)) {
                                mWidget._customHandlers.onShow(mWidget, widget);
                            }
                        }
                    }
                }
            }, parseInt(showDuration) + 10);
        }

        if (this.binds.bars && this.binds.bars.filterChanged) {
            this.binds.bars.filterChanged(view, filter);
        }
    },
    isSignalVisible:    function (view, widget, index, val, widgetData) {
        widgetData = widgetData || this.views[view].widgets[widget].data;
        var oid = widgetData['signals-oid-' + index];

        if (oid) {
            if (val === undefined || val === null) {
                val = this.states.attr(oid + '.val');
            }

            var condition = widgetData['signals-cond-' + index];
            var value     = widgetData['signals-val-' + index];

            if (val === undefined || val === null) {
                return condition === 'not exist';
            }

            if (!condition || value === undefined || value === null) {
                return condition === 'not exist';
            }

            if (val === 'null' && condition !== 'exist' && condition !== 'not exist') {
                return false;
            }

            var t = typeof val;
            if (t === 'boolean' || val === 'false' || val === 'true') {
                value = value === 'true' || value === true || value === 1 || value === '1';
            } else
            if (t === 'number') {
                value = parseFloat(value);
            } else
            if (t === 'object') {
                val = JSON.stringify(val);
            }

            switch (condition) {
                case '==':
                    value = value.toString();
                    val = val.toString();
                    if (val === '1') val = 'true';
                    if (value === '1') value = 'true';
                    if (val === '0') val = 'false';
                    if (value === '0') value = 'false';
                    return value === val;
                case '!=':
                    value = value.toString();
                    val = val.toString();
                    if (val === '1') val = 'true';
                    if (value === '1') value = 'true';
                    if (val === '0') val = 'false';
                    if (value === '0') value = 'false';
                    return value !== val;
                case '>=':
                    return val >= value;
                case '<=':
                    return val <= value;
                case '>':
                    return val > value;
                case '<':
                    return val < value;
                case 'consist':
                    value = value.toString();
                    val = val.toString();
                    return val.toString().indexOf(value) !== -1;
                case 'not consist':
                    value = value.toString();
                    val = val.toString();
                    return val.toString().indexOf(value) === -1;
                case 'exist':
                    return (value !== 'null');
                case 'not exist':
                    return (value === 'null');
                default:
                    console.log('Unknown signals condition for ' + widget + ': ' + condition);
                    return false;
            }
        } else {
            return false;
        }
    },
    addSignalIcon:      function (view, wid, data, index) {
        // show icon
        var display = (this.editMode || this.isSignalVisible(view, wid, index, undefined, data)) ? '' : 'none';
        if (this.editMode && data['signals-hide-edit-' + index]) {
            display = 'none';
        }

        $('#' + wid).append('<div class="vis-signal ' + (data['signals-blink-' + index] ? 'vis-signals-blink' : '') + ' ' + (data['signals-text-class-' + index] || '') + ' " data-index="' + index + '" style="display: ' + display + '; pointer-events: none; position: absolute; z-index: 10; top: ' + (data['signals-vert-' + index] || 0) + '%; left: ' + (data['signals-horz-' + index] || 0) + '%"><img class="vis-signal-icon" src="' + data['signals-icon-' + index] + '" style="width: ' + (data['signals-icon-size-' + index] || 32) + 'px; height: auto;' + (data['signals-icon-style-' + index] || '') + '"/>' +
            (data['signals-text-' + index] ? ('<div class="vis-signal-text " style="' + (data['signals-text-style-' + index] || '') + '">' + data['signals-text-' + index] + '</div>') : '') + '</div>');
    },
    addChart:           function ($wid, wData) {
        $wid.on('click', function () {
            console.log('Show dialog with chart for ' + wData['echart-oid']);
        });
    },
    addGestures:        function (id, wdata) {
        // gestures
        var gestures = ['swipeRight', 'swipeLeft', 'swipeUp', 'swipeDown', 'rotateLeft', 'rotateRight', 'pinchIn', 'pinchOut', 'swiping', 'rotating', 'pinching'];
        var $$wid = $$('#' + id);
        var $wid = $('#' + id);
        var offsetX = parseInt(wdata['gestures-offsetX']) || 0;
        var offsetY = parseInt(wdata['gestures-offsetY']) || 0;
        var that = this;

        gestures.forEach(function (gesture) {
            if (wdata && wdata['gestures-' + gesture + '-oid']) {
                var oid = wdata['gestures-' + gesture + '-oid'];
                if (oid) {
                    var val = wdata['gestures-' + gesture + '-value'];
                    var delta = parseInt(wdata['gestures-' + gesture + '-delta']) || 10;
                    var limit = parseFloat(wdata['gestures-' + gesture + '-limit']) || false;
                    var max = parseFloat(wdata['gestures-' + gesture + '-maximum']) || 100;
                    var min = parseFloat(wdata['gestures-' + gesture + '-minimum']) || 0;
                    var valState = that.states.attr(oid + '.val');
                    var newVal = null;
                    var $indicator;
                    if (valState !== undefined && valState !== null) {
                        $wid.on('touchmove', function (evt) {
                            evt.preventDefault();
                        });

                        $wid.css({
                            '-webkit-user-select': 'none',
                            '-khtml-user-select': 'none',
                            '-moz-user-select': 'none',
                            '-ms-user-select': 'none',
                            'user-select': 'none'
                        });

                        $$wid[gesture](function (data) {
                            valState = that.states.attr(oid + '.val');
                            if (val === 'toggle') {
                                if (valState === true) {
                                    newVal = false;
                                } else if (valState === false) {
                                    newVal = true;
                                } else {
                                    newVal = null;
                                    return;
                                }
                            } else if (gesture === 'swiping' || gesture === 'rotating' || gesture === 'pinching') {
                                if (newVal === null) {
                                    $indicator = $('#' + wdata['gestures-indicator']);
                                    // create default indicator
                                    if (!$indicator.length) {
                                        //noinspection JSJQueryEfficiency
                                        $indicator = $('#gestureIndicator');
                                        if (!$indicator.length) {
                                            $('body').append('<div id="gestureIndicator" style="position: absolute; pointer-events: none; z-index: 100; box-shadow: 2px 2px 5px 1px gray;height: 21px; border: 1px solid #c7c7c7; border-radius: 5px; text-align: center; padding-top: 6px; padding-left: 2px; padding-right: 2px; background: lightgray;"></div>');
                                            $indicator = $('#gestureIndicator');

                                            $indicator.on('gestureUpdate', function (event, evData) {
                                                if (evData.val === null) {
                                                    $(this).hide();
                                                } else {
                                                    $(this).html(evData.val);
                                                    $(this).css({
                                                        left: parseInt(evData.x) - $(this).width()  / 2 + 'px',
                                                        top:  parseInt(evData.y) - $(this).height() / 2 + 'px'
                                                    }).show();
                                                }
                                            });
                                        }
                                    }

                                    $('#vis_container').css({
                                        '-webkit-user-select': 'none',
                                        '-khtml-user-select': 'none',
                                        '-moz-user-select': 'none',
                                        '-ms-user-select': 'none',
                                        'user-select': 'none'
                                    });

                                    $(document).on('mouseup.gesture touchend.gesture', function () {
                                        if (newVal !== null) {
                                            that.setValue(oid, newVal);
                                            newVal = null;
                                        }
                                        $indicator.trigger('gestureUpdate', {val: null});
                                        $(document).off('mouseup.gesture touchend.gesture');

                                        $('#vis_container').css({
                                            '-webkit-user-select': 'text',
                                            '-khtml-user-select': 'text',
                                            '-moz-user-select': 'text',
                                            '-ms-user-select': 'text',
                                            'user-select': 'text'
                                        });
                                    });
                                }
                                var swipeDelta, indicatorX, indicatorY = 0;
                                switch (gesture) {
                                    case 'swiping':
                                        swipeDelta = Math.abs(data.touch.delta.x) > Math.abs(data.touch.delta.y) ? data.touch.delta.x : data.touch.delta.y * (-1);
                                        swipeDelta = swipeDelta > 0 ? Math.floor(swipeDelta / delta) : Math.ceil(swipeDelta / delta);
                                        indicatorX = data.touch.x;
                                        indicatorY = data.touch.y;
                                        break;

                                    case 'rotating':
                                        swipeDelta = data.touch.delta;
                                        swipeDelta = swipeDelta > 0 ? Math.floor(swipeDelta / delta) : Math.ceil(swipeDelta / delta);
                                        if (data.touch.touches[0].y < data.touch.touches[1].y) {
                                            indicatorX = data.touch.touches[1].x;
                                            indicatorY = data.touch.touches[1].y;
                                        } else {
                                            indicatorX = data.touch.touches[0].x;
                                            indicatorY = data.touch.touches[0].y;
                                        }
                                        break;

                                    case 'pinching':
                                        swipeDelta = data.touch.delta;
                                        swipeDelta = swipeDelta > 0 ? Math.floor(swipeDelta / delta) : Math.ceil(swipeDelta / delta);
                                        if (data.touch.touches[0].y < data.touch.touches[1].y) {
                                            indicatorX = data.touch.touches[1].x;
                                            indicatorY = data.touch.touches[1].y;
                                        } else {
                                            indicatorX = data.touch.touches[0].x;
                                            indicatorY = data.touch.touches[0].y;
                                        }
                                        break;

                                    default:
                                        break;
                                }

                                newVal = (parseFloat(valState) || 0) + (parseFloat(val) || 1) * swipeDelta;
                                newVal = Math.max(min, Math.min(max, newVal));
                                $indicator.trigger('gestureUpdate', {
                                    val: newVal,
                                    x: indicatorX + offsetX,
                                    y: indicatorY + offsetY
                                });
                                return;
                            } else if (limit !== false) {
                                newVal = (parseFloat(valState) || 0) + (parseFloat(val) || 1);
                                if (parseFloat(val) > 0 && newVal > limit) {
                                    newVal = limit;
                                } else if (parseFloat(val) < 0 && newVal < limit) {
                                    newVal = limit;
                                }
                            } else {
                                newVal = val;
                            }
                            that.setValue(oid, newVal);
                            newVal = null;
                        });
                    }
                }
            }
        });
    },
    addLastChange:      function (view, wid, data) {
        // show last change
        var border = (parseInt(data['lc-border-radius'], 10) || 0) + 'px';
        var css = {
            background: 'rgba(182,182,182,0.6)',
            'font-family': 'Tahoma',
            position: 'absolute',
            'z-index': 0,
            'border-radius': data['lc-position-horz'] === 'left' ? (border + ' 0 0 ' + border) : (data['lc-position-horz'] === 'right' ? '0 ' + border + ' ' + border + ' 0' : border),
            'white-space': 'nowrap'
        };
        if (data['lc-font-size']) {
            css['font-size'] = data['lc-font-size'];
        }
        if (data['lc-font-style']) {
            css['font-style'] = data['lc-font-style'];
        }
        if (data['lc-font-family']) {
            css['font-family'] = data['lc-font-family'];
        }
        if (data['lc-bkg-color']) {
            css['background'] = data['lc-bkg-color'];
        }
        if (data['lc-color']) {
            css['color'] = data['lc-color'];
        }
        if (data['lc-border-width']) {
            css['border-width'] = parseInt(data['lc-border-width'], 10) || 0;
        }
        if (data['lc-border-style']) {
            css['border-style'] = data['lc-border-style'];
        }
        if (data['lc-border-color']) {
            css['border-color'] = data['lc-border-color'];
        }
        if (data['lc-padding']) {
            css['padding'] = data['lc-padding'];
        } else {
            css['padding-top']    = 3;
            css['padding-bottom'] = 3;
        }
        if (data['lc-zindex']) {
            css['z-index'] = data['lc-zindex'];
        }
        if (data['lc-position-vert'] === 'top') {
            css.top = parseInt(data['lc-offset-vert'], 10);
        } else if (data['lc-position-vert'] === 'bottom') {
            css.bottom = parseInt(data['lc-offset-vert'], 10);
        } else if (data['lc-position-vert'] === 'middle') {
            css.top = 'calc(50% + ' + (parseInt(data['lc-offset-vert'], 10) - 10) + 'px)';
        }
        var offset = parseFloat(data['lc-offset-horz']) || 0;
        if (data['lc-position-horz'] === 'left') {
            css.right = 'calc(100% - ' + offset + 'px)';
            if (!data['lc-padding']) {
                css['padding-right'] = 10;
                css['padding-left']  = 10;
            }
        } else if (data['lc-position-horz'] === 'right') {
            css.left = 'calc(100% + ' + offset + 'px)';
            if (!data['lc-padding']) {
                css['padding-right'] = 10;
                css['padding-left']  = 10;
            }
        } else if (data['lc-position-horz'] === 'middle') {
            css.left = 'calc(50% + ' + offset + 'px)';
        }
        var text = '<div class="vis-last-change" data-type="' + data['lc-type'] + '" data-format="' + data['lc-format'] + '" data-interval="' + data['lc-is-interval'] + '">' + this.binds.basic.formatDate(this.states.attr(data['lc-oid'] + '.' + (data['lc-type'] === 'last-change' ? 'lc' : 'ts')), data['lc-format'], data['lc-is-interval'], data['lc-is-moment']) + '</div>';
        $('#' + wid).prepend($(text).css(css)).css('overflow', 'visible');
    },
    isUserMemberOf:     function (user, userGroups) {
        if (!this.userGroups) {
            return true;
        }
        if (typeof userGroups !== 'object') userGroups = [userGroups];
        for (var g = 0; g < userGroups.length; g++) {
            var group = this.userGroups['system.group.' + userGroups[g]];
            if (!group || !group.common || !group.common.members || !group.common.members.length) {
                continue;
            }
            if (group.common.members.indexOf('system.user.' + user) !== -1) {
                return true;
            }
        }
        return false;
    },
    renderWidget:       function (viewDiv, view, id, groupId) {
        var $view;
        var that = this;
        if (!groupId) {
            $view = $('#visview_' + viewDiv);
        } else {
            $view = $('#' + groupId);
        }
        if (!$view.length) {
            return;
        }

        var widget = this.views[view].widgets[id];

        if (groupId && widget) {
            widget = JSON.parse(JSON.stringify(widget));
            var aCount = parseInt(this.views[view].widgets[groupId].data.attrCount, 10);
            if (aCount) {
                $.map(widget.data, function (val, key) {
                    if (typeof val === 'string') {
                        var result = replaceGroupAttr(val, that.views[view].widgets[groupId].data);
                        if (result.doesMatch) {
                            widget.data[key] = result.newString || '';
                        }
                    }
                });
            }
        }

        var isRelative = widget && widget.style && (widget.style.position === 'relative' || widget.style.position === 'static' || widget.style.position === 'sticky');

        // if widget has relative position => insert it into relative div
        if (this.editMode && isRelative && viewDiv === view) {
            if (this.views[view].settings && this.views[view].settings.sizex) {
                var $relativeView = $view.find('.vis-edit-relative');
                if (!$relativeView.length) {
                    var ww = this.views[view].settings.sizex;
                    var hh = this.views[view].settings.sizey;
                    if (parseFloat(ww).toString() === ww.toString()) {
                        ww = parseFloat(ww);
                    }
                    if (parseFloat(hh).toString() === hh.toString()) {
                        hh = parseFloat(hh);
                    }

                    if (typeof ww === 'number' || ww[ww.length - 1] < '0' || ww[ww.length - 1] > '9') {
                        ww = ww + 'px';
                    }
                    if (typeof hh === 'number' || hh[hh.length - 1] < '0' || hh[hh.length - 1] > '9') {
                        hh = hh + 'px';
                    }

                    $view.append('<div class="vis-edit-relative" style="width: ' + ww + '; height: ' + hh + '"></div>');
                    $view = $view.find('.vis-edit-relative');
                } else {
                    $view = $relativeView;
                }
            }
        }

        // Add to the global array of widgets
        try {
            var userGroups;
            if (!this.editMode && widget.data['visibility-groups'] && widget.data['visibility-groups'].length) {
                userGroups = widget.data['visibility-groups'];

                if (widget.data['visibility-groups-action'] === 'hide') {
                    if (!this.isUserMemberOf(this.conn.getUser(), userGroups)) return;
                    userGroups = null;
                }
            }

            this.widgets[id] = {
                wid: id,
                data: new can.Map($.extend({wid: id}, widget.data))
            };
        } catch (e) {
            console.log('Cannot bind data of widget widget:' + id);
            return;
        }
        // Register oid to detect changes
        // if (widget.data.oid !== 'nothing_selected')
        //   $.homematic("advisState", widget.data.oid, widget.data.hm_wid);

        var widgetData = this.widgets[id].data;

        try {
            //noinspection JSJQueryEfficiency
            var $widget = $('#' + id);
            if ($widget.length) {
                var destroy = $widget.data('destroy');

                if (typeof destroy === 'function') {
                    $widget.off('resize'); // remove resize handler
                    destroy(id, $widget);
                    $widget.data('destroy', null);
                }
                if (isRelative && !$view.find('#' + id).length) {
                    $widget.remove();
                    $widget.length = 0;
                } else {
                    $widget.html('<div></div>').attr('id', id + '_removed');
                }
            }

            var canWidget;
            // Append html element to view
            if (widget.data && widget.data.oid) {
                canWidget = can.view(widget.tpl, {
                    val:     this.states.attr(widget.data.oid + '.val'),
                    data:    widgetData,
                    viewDiv: viewDiv,
                    view:    view,
                    style:   widget.style
                });
                if ($widget.length) {
                    if ($widget.parent().attr('id') !== $view.attr('id')) $widget.appendTo($view);
                    $widget.replaceWith(canWidget);
                    // shift widget to group if required
                } else {
                    $view.append(canWidget);
                }
            } else if (widget.tpl) {
                canWidget = can.view(widget.tpl, {
                    data:    widgetData,
                    viewDiv: viewDiv,
                    view:    view,
                    style:   widget.style
                });
                if ($widget.length) {
                    if ($widget.parent().attr('id') !== $view.attr('id')) {
                        $widget.appendTo($view);
                    }
                    $widget.replaceWith(canWidget);
                    // shift widget to group if required
                } else {
                    $view.append(canWidget);
                }
            } else {
                console.error('Widget "' + id + '" is invalid. Please delete it.');
                return;
            }

            var $wid = null;

            if (widget.style && !widgetData._no_style) {
                $wid = $('#' + id);

                // fix position
                for (var attr in widget.style) {
                    if (!widget.style.hasOwnProperty(attr)) {
                        continue;
                    }
                    if (attr === 'top' || attr === 'left' || attr === 'width' || attr === 'height') {
                        var val = widget.style[attr];
                        if (val !== '0' && val !== 0 && val !== null && val !== '' && val.toString().match(/^[-+]?\d+$/)) {
                            widget.style[attr] = val + 'px';
                        }
                    }
                }

                $wid.css(widget.style);
            }

            if (widget.data && widget.data.class) {
                $wid = $wid || $('#' + id);
                $wid.addClass(widget.data.class);
            }

            var $tpl = $('#' + widget.tpl);

            $wid && $wid.addClass('vis-tpl-' + $tpl.data('vis-set') + '-' + $tpl.data('vis-name'));

            if (!this.editMode) {
                if (this.isWidgetFilteredOut(view, id) || this.isWidgetHidden(view, id, undefined, widget.data)) {
                    var mWidget = document.getElementById(id);
                    $(mWidget).hide();
                    if (mWidget &&
                        mWidget._customHandlers &&
                        mWidget._customHandlers.onHide) {
                        mWidget._customHandlers.onHide(mWidget, id);
                    }
                }

                // Processing of gestures
                if (typeof $$ !== 'undefined') {
                    this.addGestures(id, widget.data);
                }
            }

            // processing of signals
            var s = 0;
            while (widget.data['signals-oid-' + s]) {
                this.addSignalIcon(view, id, widget.data, s);
                s++;
            }
            if (widget.data['lc-oid']) {
                this.addLastChange(view, id, widget.data);
            }
            if (!this.editMode && widget.data['echart-oid']) {
                this.addChart($wid, widget.data);
            }

            // If edit mode, bind on click event to open this widget in edit dialog
            if (this.editMode) {
                this.bindWidgetClick(viewDiv, view, id);

                // @SJ cannot select menu and dialogs if it is enabled
                /*if ($('#wid_all_lock_f').hasClass("ui-state-active")) {
                 $('#' + id).addClass("vis-widget-lock")
                 }*/
            }

            $(document).trigger('wid_added', id);

            if (id[0] === 'g') {
                for (var w = 0; w < widget.data.members.length; w++) {
                    if (widget.data.members[w] !== id) {
                        this.renderWidget(viewDiv, view, widget.data.members[w], id);
                    }
                }
            }
        } catch (e) {
            var lines = (e.toString() + e.stack.toString()).split('\n');
            this.conn.logError('can\'t render ' + widget.tpl + ' ' + id + ' on "' + view + '": ');
            for (var l = 0; l < lines.length; l++) {
                this.conn.logError(l + ' - ' + lines[l]);
            }
        }

        if (userGroups && $wid && $wid.length) {
            if (!this.isUserMemberOf(this.conn.getUser(), userGroups)) {
                $wid.addClass('vis-user-disabled');
            }
        }
    },
    changeView:         function (viewDiv, view, hideOptions, showOptions, sync, callback) {
        var that = this;

        if (typeof view === 'object') {
            callback = sync;
            sync = showOptions;
            hideOptions = showOptions;
            view = viewDiv;
        }

        if (!view && viewDiv) {
            view = viewDiv;
        }

        if (typeof hideOptions === 'function') {
            callback = hideOptions;
            hideOptions = undefined;
        }
        if (typeof showOptions === 'function') {
            callback = showOptions;
            showOptions = undefined;
        }
        if (typeof sync === 'function') {
            callback = sync;
            sync = undefined;
        }

        var effect = hideOptions !== undefined && hideOptions !== null && hideOptions.effect !== undefined && hideOptions.effect !== null && hideOptions.effect;
        if (!effect) {
            effect = showOptions !== undefined && showOptions !== null && showOptions.effect !== undefined && showOptions.effect !== null && showOptions.effect;
        }
        if (effect && (showOptions === undefined || showOptions === null || !showOptions.effect)) {
            showOptions = {effect: hideOptions.effect, options: {}, duration: hideOptions.duration};
        }
        if (effect && (hideOptions === undefined || hideOptions === null || !hideOptions.effect)) {
            hideOptions = {effect: showOptions.effect, options: {}, duration: showOptions.duration};
        }
        hideOptions = $.extend(true, {effect: undefined, options: {}, duration: 0}, hideOptions);
        showOptions = $.extend(true, {effect: undefined, options: {}, duration: 0}, showOptions);
        if (hideOptions.effect === 'show') effect = false;

        if (this.editMode && this.activeView !== this.activeViewDiv) {
            this.destroyGroupEdit(this.activeViewDiv, this.activeView);
        }

        if (!this.views[view]) {
            //noinspection JSUnusedAssignment
            view = null;
            for (var prop in this.views) {
                if (prop === '___settings') {
                    continue;
                }
                view = prop;
                break;
            }
        }

        // If really changed
        if (this.activeView !== viewDiv) {
            if (effect) {
                this.renderView(viewDiv, view, true, function (_viewDiv, _view) {
                    var $view = $('#visview_' + _viewDiv);

                    // Get the view, if required, from Container
                    if ($view.parent().attr('id') !== 'vis_container') {
                        $view.appendTo('#vis_container');
                    }

                    var oldView = that.activeView;
                    that.postChangeView(_viewDiv, _view, callback);

                    // If hide and show at the same time
                    if (sync) {
                        $view.show(showOptions.effect, showOptions.options, parseInt(showOptions.duration, 10)).dequeue();
                    }

                    $('#visview_' + oldView).hide(hideOptions.effect, hideOptions.options, parseInt(hideOptions.duration, 10), function () {
                        // If first hide, then show
                        if (!sync) {
                            $view.show(showOptions.effect, showOptions.options, parseInt(showOptions.duration, 10), function () {
                                that.destroyUnusedViews();
                            });
                        } else {
                            that.destroyUnusedViews();
                        }
                    });
                });
            } else {
                var $oldView = $('#visview_' + that.activeViewDiv);
                // disable view and show some action
                $oldView.find('> .vis-view-disabled').show();
                this.renderView(viewDiv, view, true, function (_viewDiv, _view) {
                    var $oldView;
                    if (that.activeViewDiv !== _viewDiv) {
                        $oldView = $('#visview_' + that.activeViewDiv);
                        // hide old view
                        $oldView.hide();
                        $oldView.find('.vis-view-disabled').hide();
                    }
                    var $view = $('#visview_' + _viewDiv);

                    // Get the view, if required, from Container
                    if ($view.parent().attr('id') !== 'vis_container') {
                        $view.appendTo('#vis_container');
                    }

                    // show new view
                    $view.show();
                    $view.find('.vis-view-disabled').hide();

                    if (that.activeViewDiv !== _viewDiv) {
                        if ($oldView.hasClass('vis-edit-group')) {
                            that.destroyView(that.activeViewDiv, that.activeView);
                        } else {
                            $oldView.hide();
                        }
                    }

                    that.postChangeView(_viewDiv, _view, callback);
                    that.destroyUnusedViews();
                });
            }
            // remember last click for de-bounce
            this.lastChange = Date.now();
        } else {
            this.renderView(viewDiv, view, false, function (_viewDiv, _view) {
                var $view = $('#visview_' + _viewDiv);

                // Get the view, if required, from Container
                if ($view.parent().attr('id') !== 'vis_container') {
                    $view.appendTo('#vis_container');
                }
                $view.show();

                that.postChangeView(_viewDiv, _view, callback);
                that.destroyUnusedViews();
            });
        }
    },
    selectAutoFocus: function () {
        var $view = $('#visview_' + this.activeView);
        var $inputs = $view.find('input[autofocus]');
        if (!$inputs.length) {
            $inputs = $view.find('select[autofocus]');
        }
        if ($inputs.length) {
            if ($inputs[0] !== document.activeElement) {
                $inputs[0].focus();
            }
            $inputs[0].select();
        }
    },
    postChangeView:     function (viewDiv, view, callback) {
        this.activeView = view;
        this.activeViewDiv = viewDiv;
        /*$('#visview_' + viewDiv).find('.vis-view-container').each(function () {
         $('#visview_' + $(this).attr('data-vis-contains')).show();
         });*/

        this.updateContainers(viewDiv, view);

        if (!this.editMode) {
            this.conn.sendCommand(this.instance, 'changedView', this.projectPrefix ? (this.projectPrefix + this.activeView) : this.activeView);
            $(window).trigger('viewChanged', viewDiv);
        }

        if (window.location.hash.slice(1) !== view) {
            if (history && history.pushState) {
                history.pushState({}, '', '#' + viewDiv);
            }
        }

        // Navigation-Widgets
        for (var i = 0; i < this.navChangeCallbacks.length; i++) {
            this.navChangeCallbacks[i](viewDiv, view);
        }

        this.selectAutoFocus();

        // --------- Editor -----------------
        if (this.editMode) {
            this.changeViewEdit(viewDiv, view, false, callback);
        } else if (typeof callback === 'function') {
            callback(viewDiv, view);
        }
        this.updateIframeZoom();
    },
    loadRemote:         function (callback, callbackArg) {
        var that = this;
        if (!this.projectPrefix) {
            return callback && callback.call(that, callbackArg);
        }
        this.conn.readFile(this.projectPrefix + 'vis-views.json', function (err, data) {
            if (err) {
                window.alert(that.projectPrefix + 'vis-views.json ' + err);
                if (err === 'permissionError') {
                    that.showWaitScreen(true, '', _('Loading stopped', location.protocol + '//' + location.host, location.protocol + '//' + location.host), 0);
                    // do nothing anymore
                    return;
                }
            }
            if (typeof app !== 'undefined' && app.replaceFilesInViewsWeb) {
                data = app.replaceFilesInViewsWeb(data);
            }

            if (data) {
                if (typeof data === 'string') {
                    try {
                        that.views = JSON.parse(data.trim());
                    } catch (e) {
                        console.log('Cannot parse views file "' + that.projectPrefix + 'vis-views.json"');
                        window.alert('Cannot parse views file "' + that.projectPrefix + 'vis-views.json"');
                        that.views = null;
                    }
                } else {
                    that.views = data;
                }
                var _data = that.getUsedObjectIDs();
                that.subscribing.IDs = _data.IDs;
                that.subscribing.byViews = _data.byViews;
            } else {
                that.views = null;
            }

            callback && callback.call(that, callbackArg);
        });
    },
    wakeUpCallbacks:    [],
    initWakeUp:         function () {
        var that = this;
        var oldTime = Date.now();
        setInterval(function () {
            var currentTime = Date.now();
            //console.log("checkWakeUp "+ (currentTime - oldTime));
            if (currentTime > (oldTime + 10000)) {
                oldTime = currentTime;
                for (var i = 0; i < that.wakeUpCallbacks.length; i++) {
                    //console.log("calling wakeUpCallback!");
                    that.wakeUpCallbacks[i]();
                }
            } else {
                oldTime = currentTime;
            }
        }, 2500);
    },
    onWakeUp:           function (callback) {
        this.wakeUpCallbacks.push(callback);
    },
    showMessage:        function (message, title, icon, width, callback) {
        // load some theme to show message
        if (!this.editMode && !$('#commonTheme').length) {
            $('head').prepend('<link rel="stylesheet" type="text/css" href="' + ((typeof app === 'undefined') ? '../../' : '') + 'lib/css/themes/jquery-ui/' + (this.calcCommonStyle() || 'redmond') + '/jquery-ui.min.css" id="commonTheme"/>');
        }
        if (typeof icon === 'number') {
            callback = width;
            width = icon;
            icon = null;
        }
        if (typeof title === 'function') {
            callback = title;
            title = null;
        } else if (typeof icon === 'function') {
            callback = icon;
            icon = null;
        } else if (typeof width === 'function') {
            callback = width;
            width = null;
        }

        if (!this.$dialogMessage) {
            this.$dialogMessage = $('#dialog-message');
            this.$dialogMessage.dialog({
                autoOpen: false,
                modal: true,
                open: function () {
                    $(this).parent().css({'z-index': 1003});
                    var callback = $(this).data('callback');
                    if (callback) {
                        $(this).find('#dialog_message_cancel').show();
                    } else {
                        $(this).find('#dialog_message_cancel').hide();
                    }
                },
                buttons: [
                    {
                        text: _('Ok'),
                        click: function () {
                            var callback = $(this).data('callback');
                            $(this).dialog('close');
                            if (typeof callback === 'function') {
                                callback(true);
                                $(this).data('callback', null);
                            }
                        }
                    },
                    {
                        id: 'dialog_message_cancel',
                        text: _('Cancel'),
                        click: function () {
                            var callback = $(this).data('callback');
                            $(this).dialog('close');
                            if (typeof callback === 'function') {
                                callback(false);
                                $(this).data('callback', null);
                            }
                        }
                    }
                ]
            });
        }
        this.$dialogMessage.dialog('option', 'title', title || _('Message'));
        if (width) {
            this.$dialogMessage.dialog('option', 'width', width);
        } else {
            this.$dialogMessage.dialog('option', 'width', 300);
        }
        $('#dialog-message-text').html(message);

        this.$dialogMessage.data('callback', callback ? callback : null);

        if (icon) {
            $('#dialog-message-icon')
                .show()
                .attr('class', '')
                .addClass('ui-icon ui-icon-' + icon);
        } else {
            $('#dialog-message-icon').hide();
        }
        this.$dialogMessage.dialog('open');
    },
    showError:          function (error) {
        this.showMessage(error, _('Error'), 'alert', 400);
    },
    waitScreenVal:      0,
    showWaitScreen:     function (isShow, appendText, newText, step) {
        var waitScreen = document.getElementById("waitScreen");
        if (!waitScreen && isShow) {
            $('body').append('<div id="waitScreen" class="vis-wait-screen"><div id="waitDialog" class="waitDialog"><div class="vis-progressbar"></div><div class="vis-wait-text" id="waitText"></div></div></div>');
            waitScreen = document.getElementById("waitScreen");
            this.waitScreenVal = 0;
        }

        $('.vis-progressbar').progressbar({value: this.waitScreenVal}).height(19);

        if (isShow) {
            $(waitScreen).show();
            if (newText !== null && newText !== undefined) {
                $('#waitText').html(newText);
            }
            if (appendText !== null && appendText !== undefined) {
                $('#waitText').append(appendText);
            }
            if (step !== undefined && step !== null) {
                this.waitScreenVal += step;
                _setTimeout(function (_val) {
                    $('.vis-progressbar').progressbar('value', _val);
                }, 0, this.waitScreenVal);
            }
        } else if (waitScreen) {
            $(waitScreen).remove();
        }
    },
    registerOnChange:   function (callback, arg) {
        for (var i = 0, len = this.onChangeCallbacks.length; i < len; i++) {
            if (this.onChangeCallbacks[i].callback === callback &&
                this.onChangeCallbacks[i].arg === arg) {
                return;
            }
        }
        this.onChangeCallbacks[this.onChangeCallbacks.length] = {callback: callback, arg: arg};
    },
    unregisterOnChange: function (callback, arg) {
        for (var i = 0, len = this.onChangeCallbacks.length; i < len; i++) {
            if (this.onChangeCallbacks[i].callback === callback &&
                (arg === undefined || arg === null || this.onChangeCallbacks[i].arg === arg)) {
                this.onChangeCallbacks.slice(i, 1);
                return;
            }
        }
    },
    isWidgetHidden:     function (view, widget, val, widgetData) {
        widgetData = widgetData || this.views[view].widgets[widget].data;
        var oid = widgetData['visibility-oid'];
        var condition = widgetData['visibility-cond'];
        if (oid) {
            if (val === undefined || val === null) {
                val = this.states.attr(oid + '.val');
            }
            if (val === undefined || val === null) {
                return (condition === 'not exist');
            }

            var value = widgetData['visibility-val'];

            if (!condition || value === undefined || value === null) {
                return (condition === 'not exist');
            }

            if (val === 'null' && condition !== 'exist' && condition !== 'not exist') {
                return false;
            }

            var t = typeof val;
            if (t === 'boolean' || val === 'false' || val === 'true') {
                value = value === 'true' || value === true || value === 1 || value === '1';
            } else
            if (t === 'number') {
                value = parseFloat(value);
            } else
            if (t === 'object') {
                val = JSON.stringify(val);
            }

            // Take care: return true if widget is hidden!
            switch (condition) {
                case '==':
                    value = value.toString();
                    val = val.toString();
                    if (val === '1') val = 'true';
                    if (value === '1') value = 'true';
                    if (val === '0') val = 'false';
                    if (value === '0') value = 'false';
                    return value !== val;
                case '!=':
                    value = value.toString();
                    val = val.toString();
                    if (val === '1') val = 'true';
                    if (value === '1') value = 'true';
                    if (val === '0') val = 'false';
                    if (value === '0') value = 'false';
                    return value === val;
                case '>=':
                    return val < value;
                case '<=':
                    return val > value;
                case '>':
                    return val <= value;
                case '<':
                    return val >= value;
                case 'consist':
                    value = value.toString();
                    val = val.toString();
                    return val.toString().indexOf(value) === -1;
                case 'not consist':
                    value = value.toString();
                    val = val.toString();
                    return val.toString().indexOf(value) !== -1;
                case 'exist':
                    return val === 'null';
                case 'not exist':
                    return val !== 'null';
                default:
                    console.log('Unknown visibility condition for ' + widget + ': ' + condition);
                    return false;
            }
        } else {
            return (condition === 'not exist');
        }
    },
    isWidgetFilteredOut: function (view, widget) {
        var w = this.views[view].widgets[widget];
        var v = this.viewsActiveFilter[view];
        return (w &&
        w.data &&
        w.data.filterkey &&
        widget &&
        widget.data &&
        v.length > 0 &&
        v.indexOf(widget.data.filterkey) === -1);
    },
    calcCommonStyle:    function (recalc) {
        if (!this.commonStyle || recalc) {
            if (this.editMode) {
                this.commonStyle = this.config.editorTheme || 'redmond';
                return this.commonStyle;
            }
            var styles = {};
            if (this.views) {
                for (var view in this.views) {
                    if (!this.views.hasOwnProperty(view) ||
                        view === '___settings' ||
                        !this.views[view] ||
                        !this.views[view].settings.theme
                    ) {
                        continue;
                    }
                    if (this.views[view].settings.theme && styles[this.views[view].settings.theme]) {
                        styles[this.views[view].settings.theme]++;
                    } else {
                        styles[this.views[view].settings.theme] = 1;
                    }
                }
            }
            var max = 0;
            this.commonStyle = '';
            for (var s in styles) {
                if (styles[s] > max) {
                    max = styles[s];
                    this.commonStyle = s;
                }
            }
        }
        return this.commonStyle;
    },
    formatValue:        function formatValue(value, decimals, _format) {
        if (typeof decimals !== 'number') {
            decimals = 2;
            _format = decimals;
        }

        //format = (_format === undefined) ? (that.isFloatComma) ? ".," : ",." : _format;
        // does not work...
        // using default german...
        var format = _format === undefined || _format === null ? '.,' : _format;

        if (typeof value !== 'number') {
            value = parseFloat(value);
        }
        return isNaN(value) ? '' : value.toFixed(decimals || 0).replace(format[0], format[1]).replace(/\B(?=(\d{3})+(?!\d))/g, format[0]);
    },
    formatMomentDate: function formatMomentDate(dateObj, _format, useTodayOrYesterday) {
        useTodayOrYesterday = typeof useTodayOrYesterday !== 'undefined' ? useTodayOrYesterday : false;

        if (!dateObj) return '';
        var type = typeof dateObj;
        if (type === 'string') {
            dateObj = moment(dateObj);
        }

        if (type !== 'object') {
            var j = parseInt(dateObj, 10);
            if (j == dateObj) {
                // may this is interval
                if (j < 946681200) {
                    dateObj = moment(dateObj);
                } else {
                    // if less 2000.01.01 00:00:00
                    dateObj = (j < 946681200000) ? moment(j * 1000) : moment(j);
                }
            } else {
                dateObj = moment(dateObj);
            }
        }
        var format = _format || this.dateFormat || 'DD.MM.YYYY';

        if (useTodayOrYesterday) {
            if (dateObj.isSame(moment(), 'day')) {
                var todayStr = _('Today');
                return moment(dateObj).format(format.replace('dddd', todayStr).replace('ddd', todayStr).replace('dd', todayStr));
            } else if (dateObj.isSame(moment().subtract(1, 'day'), 'day')) {
                var yesterdayStr = _('Yesterday');
                return moment(dateObj).format(format.replace('dddd', yesterdayStr).replace('ddd', yesterdayStr).replace('dd', yesterdayStr));
            }
        } else {
            return moment(dateObj).format(format);
        }
    },
    formatDate:         function formatDate(dateObj, isDuration, _format) {
        // copied from js-controller/lib/adapter.js
        if ((typeof isDuration === 'string' && isDuration.toLowerCase() === 'duration') || isDuration === true) {
            isDuration = true;
        }
        if (typeof isDuration !== 'boolean') {
            _format = isDuration;
            isDuration = false;
        }

        if (!dateObj) return '';
        var type = typeof dateObj;
        if (type === 'string') dateObj = new Date(dateObj);

        if (type !== 'object') {
            var j = parseInt(dateObj, 10);
            if (j == dateObj) {
                // may this is interval
                if (j < 946681200) {
                    isDuration = true;
                    dateObj = new Date(dateObj);
                } else {
                    // if less 2000.01.01 00:00:00
                    dateObj = (j < 946681200000) ? new Date(j * 1000) : new Date(j);
                }
            } else {
                dateObj = new Date(dateObj);
            }
        }
        var format = _format || this.dateFormat || 'DD.MM.YYYY';

        isDuration && dateObj.setMilliseconds(dateObj.getMilliseconds() + dateObj.getTimezoneOffset() * 60 * 1000);

        var validFormatChars = 'YJГMМDTДhSчmмsс';
        var s = '';
        var result = '';

        function put(s) {
            var v = '';
            switch (s) {
                case 'YYYY':
                case 'JJJJ':
                case 'ГГГГ':
                case 'YY':
                case 'JJ':
                case 'ГГ':
                    v = dateObj.getFullYear();
                    if (s.length === 2) v %= 100;
                    break;
                case 'MM':
                case 'M':
                case 'ММ':
                case 'М':
                    v = dateObj.getMonth() + 1;
                    if ((v < 10) && (s.length === 2)) v = '0' + v;
                    break;
                case 'DD':
                case 'TT':
                case 'D':
                case 'T':
                case 'ДД':
                case 'Д':
                    v = dateObj.getDate();
                    if ((v < 10) && (s.length === 2)) v = '0' + v;
                    break;
                case 'hh':
                case 'SS':
                case 'h':
                case 'S':
                case 'чч':
                case 'ч':
                    v = dateObj.getHours();
                    if ((v < 10) && (s.length === 2)) v = '0' + v;
                    break;
                case 'mm':
                case 'm':
                case 'мм':
                case 'м':
                    v = dateObj.getMinutes();
                    if ((v < 10) && (s.length === 2)) v = '0' + v;
                    break;
                case 'ss':
                case 's':
                case 'cc':
                case 'c':
                    v = dateObj.getSeconds();
                    if ((v < 10) && (s.length === 2)) v = '0' + v;
                    v = v.toString();
                    break;
                case 'sss':
                case 'ссс':
                    v = dateObj.getMilliseconds();
                    if (v < 10) {
                        v = '00' + v;
                    } else if (v < 100) {
                        v = '0' + v;
                    }
                    v = v.toString();
            }
            return result += v;
        }

        for (var i = 0; i < format.length; i++) {
            if (validFormatChars.indexOf(format[i]) >= 0)
                s += format[i];
            else {
                put(s);
                s = '';
                result += format[i];
            }
        }
        put(s);
        return result;
    },
    extractBinding:     function (format, doNotIgnoreEditMode) {
        if ((!doNotIgnoreEditMode && this.editMode) || !format) {
            return null;
        }
        if (this.bindingsCache[format]) {
            return JSON.parse(JSON.stringify(this.bindingsCache[format]));
        }

        var result = extractBinding(format);

        // cache bindings
        if (result) {
            this.bindingsCache = this.bindingsCache || {};
            this.bindingsCache[format] = JSON.parse(JSON.stringify(result));
        }

        return result;
    },
    getSpecialValues:   function (name, view, wid, widget) {
        switch (name) {
            case 'username.val':
                return this.user;
            case 'login.val':
                return this.loginRequired;
            case 'instance.val':
                return this.instance;
            case 'language.val':
                return this.language;
            case 'wid.val':
                return wid;
            case 'wname.val':
                return widget && (widget.data.name || wid);
            case 'view.val':
                return view;
            default:
                return undefined;
        }
    },
    formatBinding:      function (format, view, wid, widget, doNotIgnoreEditMode) {
        var oids = this.extractBinding(format, doNotIgnoreEditMode);
        for (var t = 0; t < oids.length; t++) {
            var value;
            if (oids[t].visOid) {
                value = this.getSpecialValues(oids[t].visOid, view, wid, widget);
                if (value === undefined || value === null) {
                    value = this.states.attr(oids[t].visOid);
                }
            }
            if (oids[t].operations) {
                for (var k = 0; k < oids[t].operations.length; k++) {
                    switch (oids[t].operations[k].op) {
                        case 'eval':
                            var string = '';//'(function() {';
                            for (var a = 0; a < oids[t].operations[k].arg.length; a++) {
                                if (!oids[t].operations[k].arg[a].name) {
                                    continue;
                                }
                                value = this.getSpecialValues(oids[t].operations[k].arg[a].visOid, view, wid, widget);
                                if (value === undefined || value === null) {
                                    value = this.states.attr(oids[t].operations[k].arg[a].visOid);
                                }
                                try {
                                    value = JSON.parse(value);
                                    // if array or object, we format it correctly, else it should be a string
                                    if (typeof value === 'object') {
                                        string += 'var ' + oids[t].operations[k].arg[a].name + ' = JSON.parse("' + JSON.stringify(value).replace(/\x22/g, '\\\x22') + '");';
                                    } else {
                                        string += 'var ' + oids[t].operations[k].arg[a].name + ' = "' + value + '";';
                                    }
                                } catch (e) {
                                    string += 'var ' + oids[t].operations[k].arg[a].name + ' = "' + value + '";';
                                }
                            }
                            var formula = oids[t].operations[k].formula;
                            if (formula && formula.indexOf('widget.') !== -1) {
                                string += 'var widget = ' + JSON.stringify(widget) + ';';
                            }
                            string += 'return ' + oids[t].operations[k].formula + ';';

                            if (string.indexOf('\\"') >= 0) {
                                string = string.replace(/\\"/g, '"');
                            }

                            //string += '}())';
                            try {
                                value = new Function(string)();
                            } catch (e) {
                                console.error('Error in eval[value]: ' + format);
                                console.error('Error in eval[script]: ' + string);
                                console.error('Error in eval[error]: ' + e);
                                value = 0;
                            }
                            break;
                        case '*':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                value = parseFloat(value) * oids[t].operations[k].arg;
                            }
                            break;
                        case '/':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                value = parseFloat(value) / oids[t].operations[k].arg;
                            }
                            break;
                        case '+':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                value = parseFloat(value) + oids[t].operations[k].arg;
                            }
                            break;
                        case '-':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                value = parseFloat(value) - oids[t].operations[k].arg;
                            }
                            break;
                        case '%':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                value = parseFloat(value) % oids[t].operations[k].arg;
                            }
                            break;
                        case 'round':
                            if (oids[t].operations[k].arg === undefined && oids[t].operations[k].arg !== null) {
                                value = Math.round(parseFloat(value));
                            } else {
                                value = parseFloat(value).toFixed(oids[t].operations[k].arg);
                            }
                            break;
                        case 'pow':
                            if (oids[t].operations[k].arg === undefined && oids[t].operations[k].arg !== null) {
                                value = Math.pow(parseFloat(value), 2);
                            } else {
                                value = Math.pow(parseFloat(value), oids[t].operations[k].arg);
                            }
                            break;
                        case 'sqrt':
                            value = Math.sqrt(parseFloat(value));
                            break;
                        case 'hex':
                            value = Math.round(parseFloat(value)).toString(16);
                            break;
                        case 'hex2':
                            value = Math.round(parseFloat(value)).toString(16);
                            if (value.length < 2) {
                                value = '0' + value;
                            }
                            break;
                        case 'HEX':
                            value = Math.round(parseFloat(value)).toString(16).toUpperCase();
                            break;
                        case 'HEX2':
                            value = Math.round(parseFloat(value)).toString(16).toUpperCase();
                            if (value.length < 2) {
                                value = '0' + value;
                            }
                            break;
                        case 'value':
                            value = this.formatValue(value, parseInt(oids[t].operations[k].arg, 10));
                            break;
                        case 'array':
                            value = oids[t].operations[k].arg [~~value];
                            break;
                        case 'date':
                            value = this.formatDate(value, oids[t].operations[k].arg);
                            break;
                        case 'momentDate':
                            if (oids[t].operations[k].arg !== undefined && oids[t].operations[k].arg !== null) {
                                var params = oids[t].operations[k].arg.split(',');

                                if (params.length === 1) {
                                    value = this.formatMomentDate(value, params[0]);
                                } else if (params.length === 2) {
                                    value = this.formatMomentDate(value, params[0], params[1]);
                                } else {
                                    value = 'error';
                                }
                            }
                            break;
                        case 'min':
                            value = parseFloat(value);
                            value = (value < oids[t].operations[k].arg) ? oids[t].operations[k].arg : value;
                            break;
                        case 'max':
                            value = parseFloat(value);
                            value = (value > oids[t].operations[k].arg) ? oids[t].operations[k].arg : value;
                            break;
                        case 'random':
                            if (oids[t].operations[k].arg === undefined && oids[t].operations[k].arg !== null) {
                                value = Math.random();
                            } else {
                                value = Math.random() * oids[t].operations[k].arg;
                            }
                            break;
                        case 'floor':
                            value = Math.floor(parseFloat(value));
                            break;
                        case 'ceil':
                            value = Math.ceil(parseFloat(value));
                            break;
                    } //switch
                }
            } //if for
            format = format.replace(oids[t].token, value);
        }//for
        format = format.replace(/{{/g, '{').replace(/}}/g, '}');
        return format;
    },
    findNearestResolution: function (resultRequiredOrX, height) {
        var w;
        var h;
        if (height !== undefined && height !== null) {
            w = resultRequiredOrX;
            h = height;
            resultRequiredOrX = false;
        } else {
            w = $(window).width();
            h = $(window).height();
        }
        var result = null;
        var views = [];
        var difference = 10000;

        // First find all with best fitting width
        for (var view in this.views) {
            if (!this.views.hasOwnProperty(view) || view === '___settings') {
                continue;
            }
            if (this.views[view].settings && this.views[view].settings.useAsDefault &&
                // If difference less than 20%
                Math.abs(this.views[view].settings.sizex - w) / this.views[view].settings.sizex < 0.2
            ) {
                views.push(view);
            }
        }

        for (var i = 0; i < views.length; i++) {
            if (Math.abs(this.views[views[i]].settings.sizey - h) < difference) {
                result = views[i];
                difference = Math.abs(this.views[views[i]].settings.sizey - h);
            }
        }

        // try to find by ratio
        if (!result) {
            var ratio = w / h;
            difference = 10000;

            for (var view_ in this.views) {
                if (!this.views.hasOwnProperty(view_) || view_ === '___settings') {
                    continue;
                }
                if (this.views[view_].settings && this.views[view_].settings.useAsDefault &&
                    // If difference less than 20%
                    this.views[view_].settings.sizey && Math.abs(ratio - (this.views[view_].settings.sizex / this.views[view_].settings.sizey)) < difference
                ) {
                    result = view_;
                    difference = Math.abs(ratio - (this.views[view_].settings.sizex / this.views[view_].settings.sizey));
                }
            }
        }

        if (!result && resultRequiredOrX) {
            for (var view__ in this.views) {
                if (this.views.hasOwnProperty(view__) && view__ !== '___settings') {
                    return view__;
                }
            }
        }

        return result;
    },
    orientationChange:  function () {
        if (this.resolutionTimer) {
            return;
        }
        var that = this;
        this.resolutionTimer = setTimeout(function () {
            that.resolutionTimer = null;
            var view = that.findNearestResolution();
            if (view && view !== that.activeView) {
                that.changeView(view, view);
            }
        }, 200);
    },
    detectBounce:       function (el, isUp) {
        if (!this.isTouch) {
            return false;
        }

        // Protect against two events
        var now = Date.now();
        //console.log('gclick: ' + this.lastChange + ' ' + (now - this.lastChange));
        if (this.lastChange && now - this.lastChange < this.debounceInterval) {
            //console.log('gclick: filtered');
            return true;
        }
        var $el = $(el);
        var tag = $(el).prop('tagName').toLowerCase();
        while (tag !== 'div') {
            $el = $el.parent();
            tag = $el.prop('tagName').toLowerCase();
        }
        var lastClick = $el.data(isUp ? 'lcu' : 'lc');
        //console.log('click: ' + lastClick + ' ' + (now - lastClick));
        if (lastClick && now - lastClick < this.debounceInterval) {
            //console.log('click: filtered');
            return true;
        }
        $el.data(isUp ? 'lcu' : 'lc', now);
        return false;
    },
    createDemoStates:   function () {
        // Create demo variables
        this.states.attr({'demoTemperature.val': 25.4});
        this.states.attr({'demoHumidity.val': 55});
    },
    getHistory:         function (id, options, callback) {
        // Possible options:
        // - **instance - (mandatory) sql.x or history.y
        // - **start** - (optional) time in ms - *Date.now()*'
        // - **end** - (optional) time in ms - *Date.now()*', by default is (now + 5000 seconds)
        // - **step** - (optional) used in aggregate (m4, max, min, average, total) step in ms of intervals
        // - **count** - number of values if aggregate is 'onchange' or number of intervals if other aggregate method. Count will be ignored if step is set.
        // - **from** - if *from* field should be included in answer
        // - **ack** - if *ack* field should be included in answer
        // - **q** - if *q* field should be included in answer
        // - **addId** - if *id* field should be included in answer
        // - **limit** - do not return more entries than limit
        // - **ignoreNull** - if null values should be included (false), replaced by last not null value (true) or replaced with 0 (0)
        // - **aggregate** - aggregate method:
        //    - *minmax* - used special algorithm. Splice the whole time range in small intervals and find for every interval max, min, start and end values.
        //    - *max* - Splice the whole time range in small intervals and find for every interval max value and use it for this interval (nulls will be ignored).
        //    - *min* - Same as max, but take minimal value.
        //    - *average* - Same as max, but take average value.
        //    - *total* - Same as max, but calculate total value.
        //    - *count* - Same as max, but calculate number of values (nulls will be calculated).
        //    - *none* - no aggregation

        this.conn.getHistory(id, options, callback);
    },
    destroyView:        function (viewDiv, view) {
        var $view = $('#visview_' + viewDiv);

        console.debug('Destroy ' + view);

        // Get all widgets and try to destroy them
        for (var wid in this.views[view].widgets) {
            if (!this.views[view].widgets.hasOwnProperty(wid)) {
                continue;
            }
            this.destroyWidget(viewDiv, view, wid);
        }

        $view.remove();
        this.unsubscribeStates(view);
    },
    checkLicense: function () {
        if (!this.licTimeout && (typeof visConfig === 'undefined' || visConfig.license === false)) {
            this.licTimeout = setTimeout(function () {
                this.licTimeout = setTimeout(function () {
                    $('#vis_container').hide();
                    $('#vis_license').css('background', '#000');
                }.bind(this), 10000);

                var $lic = $('#vis_license');
                var $text = $lic.find('.vis-license-text');
                $text.text(_($text.text()));
                $lic.show();
            }.bind(this), 10000);
        }
    },
    findAndDestroyViews: function () {
        if (this.destroyTimeout) {
            clearTimeout(this.destroyTimeout);
            this.destroyTimeout = null;
        }
        var containers = [];
        var $createdViews = $('.vis-view');
        for (var view in this.views) {
            if (!this.views.hasOwnProperty(view) || view === '___settings') {
                continue;
            }
            if (this.views[view].settings.alwaysRender || view === this.activeView) {
                if (containers.indexOf(view) === -1) {
                    containers.push(view);
                }
                var $containers = $('#visview_' + view).find('.vis-view-container');
                $containers.each(function () {
                    var cview = $(this).attr('data-vis-contains');
                    if (containers.indexOf(cview) === -1) {
                        containers.push(cview);
                    }
                });
                // check dialogs too
                var $dialogs = $('.vis-widget-dialog');
                $dialogs.each(function () {
                    if ($(this).is(':visible')) {
                        var $containers = $(this).find('.vis-view-container');
                        $containers.each(function () {
                            var cview = $(this).attr('data-vis-contains');
                            if (containers.indexOf(cview) === -1) {
                                containers.push(cview);
                            }
                        });
                    }
                });
            }
        }
        var that = this;
        $createdViews.each(function () {
            var $this = $(this);
            var view = $this.data('view');
            var viewDiv = $this.attr('id').substring('visview_'.length);
            // If this view is used as container
            if (containers.indexOf(viewDiv) !== -1 || $this.hasClass('vis-edit-group') || $this.data('persistent')) {
                return;
            }

            that.destroyView(viewDiv, view);
        });
    },
    destroyUnusedViews: function () {
        this.destroyTimeout && clearTimeout(this.destroyTimeout);
        this.destroyTimeout = null;
        var timeout = 30000;
        if (this.views.___settings && this.views.___settings.destroyViewsAfter !== undefined) {
            timeout = this.views.___settings.destroyViewsAfter * 1000;
        }
        if (timeout) {
            this.destroyTimeout = _setTimeout(function (that) {
                that.destroyTimeout = null;
                that.findAndDestroyViews();
            }, timeout, this);
        }
    },
    generateInstance:   function () {
        if (typeof storage !== 'undefined') {
            this.instance = (Math.random() * 4294967296).toString(16);
            this.instance = '0000000' + this.instance;
            this.instance = this.instance.substring(this.instance.length - 8);
            $('#vis_instance').val(this.instance);
            storage.set(this.storageKeyInstance, this.instance);
        }
    },
    subscribeStates:    function (view, callback) {
        if (!view || this.editMode) {
            return callback && callback();
        }

        // view yet active
        if (this.subscribing.activeViews.indexOf(view) !== -1) {
            return callback && callback();
        }

        this.subscribing.activeViews.push(view);

        this.subscribing.byViews[view] = this.subscribing.byViews[view] || [];

        // subscribe
        var oids = [];
        for (var i = 0; i < this.subscribing.byViews[view].length; i++) {
            if (this.subscribing.active.indexOf(this.subscribing.byViews[view][i]) === -1) {
                this.subscribing.active.push(this.subscribing.byViews[view][i]);
                oids.push(this.subscribing.byViews[view][i]);
            }
        }
        if (oids.length) {
            var that = this;
            console.debug('[' + Date.now() + '] Request ' + oids.length + ' states.');
            this.conn.getStates(oids, function (error, data) {
                error && that.showError(error);

                that.updateStates(data);
                that.conn.subscribe(oids);
                callback && callback();
            });
        } else {
            callback && callback();
        }
    },
    unsubscribeStates:  function (view) {
        if (!view || this.editMode) return;

        // view yet active
        var pos = this.subscribing.activeViews.indexOf(view);
        if (pos === -1) {
            return;
        }
        this.subscribing.activeViews.splice(pos, 1);

        // unsubscribe
        var oids = [];
        // check every OID
        for (var i = 0; i < this.subscribing.byViews[view].length; i++) {
            var id = this.subscribing.byViews[view][i];

            pos = this.subscribing.active.indexOf(id);
            if (pos !== -1) {
                var isUsed = false;
                // Is OID is used something else
                for (var v = 0; v < this.subscribing.activeViews.length; v++) {
                    if (this.subscribing.byViews[this.subscribing.activeViews[v]].indexOf(id) !== -1) {
                        isUsed = true;
                        break;
                    }
                }
                if (!isUsed) {
                    oids.push(id);
                    this.subscribing.active.splice(pos, 1);
                }
            }
        }
        oids.length && this.conn.unsubscribe(oids);
    },
    updateState:        function (id, state) {
        if (id.indexOf('local_') !== 0) {
            // not needed for local variables
            if (this.editMode) {
                this.states[id + '.val'] = state.val;
                this.states[id + '.ts']  = state.ts;
                this.states[id + '.ack'] = state.ack;
                this.states[id + '.lc']  = state.lc;
                if (state.q !== undefined && state.q !== null) {
                    this.states[id + '.q'] = state.q;
                }
            } else {
                var o = {};
                // Check new model
                o[id + '.val'] = state.val;
                o[id + '.ts']  = state.ts;
                o[id + '.ack'] = state.ack;
                o[id + '.lc']  = state.lc;
                if (state.q !== undefined && state.q !== null) {
                    o[id + '.q'] = state.q;
                }
                try {
                    this.states.attr(o);
                } catch (e) {
                    this.conn.logError('Error: can\'t create states object for ' + id + '(' + e + '): ' + JSON.stringify(e.stack));
                }
            }
        }

        if (!this.editMode && this.visibility[id]) {
            for (var k = 0; k < this.visibility[id].length; k++) {
                var mmWidget = document.getElementById(this.visibility[id][k].widget);
                if (!mmWidget) continue;
                if (this.isWidgetHidden(this.visibility[id][k].view, this.visibility[id][k].widget, state.val) ||
                    this.isWidgetFilteredOut(this.visibility[id][k].view, this.visibility[id][k].widget)) {
                    $(mmWidget).hide();
                    if (mmWidget &&
                        mmWidget._customHandlers &&
                        mmWidget._customHandlers.onHide) {
                        mmWidget._customHandlers.onHide(mmWidget, id);
                    }
                } else {
                    $(mmWidget).show();
                    if (mmWidget &&
                        mmWidget._customHandlers &&
                        mmWidget._customHandlers.onShow) {
                        mmWidget._customHandlers.onShow(mmWidget, id);
                    }
                }
            }
        }

        // process signals
        if (!this.editMode && this.signals[id]) {
            for (var s = 0; s < this.signals[id].length; s++) {
                var signal = this.signals[id][s];
                var mWidget = document.getElementById(signal.widget);

                if (!mWidget) {
                    continue;
                }

                if (this.isSignalVisible(signal.view, signal.widget, signal.index, state.val)) {
                    $(mWidget).find('.vis-signal[data-index="' + signal.index + '"]').show();
                } else {
                    $(mWidget).find('.vis-signal[data-index="' + signal.index + '"]').hide();
                }
            }
        }

        // Process last update
        if (!this.editMode && this.lastChanges[id]) {
            for (var l = 0; l < this.lastChanges[id].length; l++) {
                var update = this.lastChanges[id][l];
                var uWidget = document.getElementById(update.widget);
                if (uWidget) {
                    var $lc = $(uWidget).find('.vis-last-change');
                    var isInterval = $lc.data('interval');
                    $lc.html(this.binds.basic.formatDate($lc.data('type') === 'last-change' ? state.lc : state.ts, $lc.data('format'), isInterval === 'true' || isInterval === true));
                }
            }
        }

        // Bindings on every element
        if (!this.editMode && this.bindings[id]) {
            for (var i = 0; i < this.bindings[id].length; i++) {
                var widget = this.views[this.bindings[id][i].view].widgets[this.bindings[id][i].widget];
                var value = this.formatBinding(this.bindings[id][i].format, this.bindings[id][i].view, this.bindings[id][i].widget, widget);

                widget[this.bindings[id][i].type][this.bindings[id][i].attr] = value;
                if (this.widgets[this.bindings[id][i].widget] && this.bindings[id][i].type === 'data') {
                    this.widgets[this.bindings[id][i].widget][this.bindings[id][i].type + '.' + this.bindings[id][i].attr] = value;
                }

                this.subscribeOidAtRuntime(value);
                this.visibilityOidBinding(this.bindings[id][i], value);

                this.reRenderWidget(this.bindings[id][i].view, this.bindings[id][i].view, this.bindings[id][i].widget);
            }
        }

        // Inform other widgets, that do not support canJS
        for (var j = 0, len = this.onChangeCallbacks.length; j < len; j++) {
            try {
                this.onChangeCallbacks[j].callback(this.onChangeCallbacks[j].arg, id, state.val, state.ack);
            } catch (e) {
                this.conn.logError('Error: can\'t update states object for ' + id + '(' + e + '): ' + JSON.stringify(e.stack));
            }
        }
        this.editMode && $.fn.selectId && $.fn.selectId('stateAll', id, state);
    },
    updateStates:       function (data) {
        if (data) {
            for (var id in data) {
                if (!data.hasOwnProperty(id)) {
                    continue;
                }
                var obj = data[id];

                if (id.indexOf('local_') === 0) {
                    // if it is a local variable, we have to initiate this
                    obj = {
                        val: this.getUrlParameter(id),              // using url parameter to set initial value of local variable
                        ts: Date.now(),
                        lc: Date.now(),
                        ack: false,
                        from: 'system.adapter.vis.0',
                        user: vis.user ? 'system.user.' + vis.user : 'system.user.admin',
                        q: 0
                    }
                }

                if (!obj) {
                    continue;
                }

                try {
                    if (this.editMode) {
                        this.states[id + '.val'] = obj.val;
                        this.states[id + '.ts'] = obj.ts;
                        this.states[id + '.ack'] = obj.ack;
                        this.states[id + '.lc'] = obj.lc;
                        if (obj.q !== undefined && obj.q !== null) {
                            this.states[id + '.q'] = obj.q;
                        }
                    } else {
                        var oo = {};
                        oo[id + '.val'] = obj.val;
                        oo[id + '.ts'] = obj.ts;
                        oo[id + '.ack'] = obj.ack;
                        oo[id + '.lc'] = obj.lc;
                        if (obj.q !== undefined && obj.q !== null) {
                            oo[id + '.q'] = obj.q;
                        }
                        this.states.attr(oo);
                    }
                } catch (e) {
                    this.conn.logError('Error: can\'t create states object for ' + id + '(' + e + ')');
                }

                if (!this.editMode && this.bindings[id]) {
                    for (var i = 0; i < this.bindings[id].length; i++) {
                        var widget = this.views[this.bindings[id][i].view].widgets[this.bindings[id][i].widget];
                        var value = this.formatBinding(this.bindings[id][i].format, this.bindings[id][i].view, this.bindings[id][i].widget, widget);

                        widget[this.bindings[id][i].type][this.bindings[id][i].attr] = value;

                        this.subscribeOidAtRuntime(value);
                        this.visibilityOidBinding(this.bindings[id][i], value);
                    }
                }
            }
        }
    },
    updateIframeZoom:   function (zoom) {
        if (zoom === undefined || zoom === null) {
            zoom = document.body.style.zoom;
        }
        if (zoom) {
            $('iframe').each(function () {
                if (this.contentWindow.document.body) {
                    this.contentWindow.document.body.style.zoom = zoom;
                }
            }).unbind('onload').load(function () {
                if (this.contentWindow.document.body) {
                    this.contentWindow.document.body.style.zoom = zoom;
                }
            });
        }
    },
    getUrlParameter: function (localId) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        var sParameterName;

        for (var i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === localId) {
                return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
        return '';
    },
    subscribeOidAtRuntime: function (oid, callback, force) {
        // if state value is an oid, and it is not subscribe then subscribe it at runtime, can happen if binding are used in oid attributes
        // the id with invalid contains characters not allowed in oid's
        if (!FORBIDDEN_CHARS.test(oid) && (this.subscribing.active.indexOf(oid) === -1 || force) && oid.length < 300) {
            if ((/^[^.]*\.\d*\..*|^[^.]*\.[^.]*\.[^.]*\.\d*\..*/).test(oid)) {
                this.subscribing.active.push(oid);

                var that = this;
                this.conn._socket.emit('getStates', oid, function (error, data) {
                    console.log('Create inner vis object ' + oid + 'at runtime');
                    that.updateStates(data);
                    that.conn.subscribe(oid);

                    callback && callback();
                });
            }
        }
    },
    visibilityOidBinding: function (binding, oid) {
        // if attribute 'visibility-oid' contains binding
        if (binding.attr === 'visibility-oid') {
            // runs only if we have a valid id
            if ((/^[^.]*\.\d*\..*|^[^.]*\.[^.]*\.[^.]*\.\d*\..*/).test(oid)) {
                var obj = {
                    view: binding.view,
                    widget: binding.widget
                }

                for (var id in this.visibility) {
                    // remove or add widget to existing oid's in visibility list
                    if (this.visibility.hasOwnProperty(id)) {
                        var widgetIndex = this.visibility[id].findIndex(function (x) {
                            return x.widget === obj.widget;
                        });

                        if (widgetIndex >= 0) {
                            // widget exists in visibility list
                            if (id !== oid) {
                                this.visibility[id].splice(widgetIndex, 1);
                                // console.log('widget ' + obj.widget + ' removed from ' + id);
                            }
                        } else {
                            // widget not exists in visibility list
                            if (id === oid) {
                                this.visibility[id].push(obj);
                                // console.log('widget ' + obj.widget + ' added to ' + id);
                            }
                        }
                    }
                }

                if (!this.visibility[oid]) {
                    // oid not exist in visibility list -> add oid and widget to visibility list
                    this.visibility[oid] = [];
                    this.visibility[oid].push(obj);
                    // console.log('widget ' + obj.widget + ' added to ' + id + ' - oid not exist in visibility list');
                }

                // on runtime load oid, check if oid need subscribe
                if (!this.editMode) {
                    var val = this.states.attr(oid + '.val');
                    if (val === undefined || val === null || val === 'null') {
                        var that = this;
                        this.subscribeOidAtRuntime(oid, function () {
                            if (that.isWidgetHidden(obj.view, obj.widget)) {
                                var mWidget = document.getElementById(obj.widget);
                                $(mWidget).hide();
                                if (mWidget &&
                                    mWidget._customHandlers &&
                                    mWidget._customHandlers.onHide) {
                                    mWidget._customHandlers.onHide(mWidget, obj.widget);
                                }
                            }
                        }, true);
                    }
                }
            }
        }
    }
};

// WebApp Cache Management
if ('applicationCache' in window) {
    window.addEventListener('load', function (/* e */) {
        window.applicationCache.addEventListener('updateready', function (e) {
            if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
                vis.showWaitScreen(true, null, _('Update found, loading new Files...'), 100);
                $('#waitText').attr('id', 'waitTextDisabled');
                $('.vis-progressbar').hide();
                try {
                    window.applicationCache.swapCache();
                } catch (_e) {
                    servConn.logError('Cannot execute window.applicationCache.swapCache - ' + _e);
                }
                setTimeout(function () {
                    window.location.reload();
                }, 1000);
            }
        }, false);
    }, false);
}

// Parse Querystring
window.onpopstate = function () {
    var match;
    var pl = /\+/g;
    var search = /([^&=]+)=?([^&]*)/g;
    var decode = function (s) {
        return decodeURIComponent(s.replace(pl, ' '));
    };
    var query = window.location.search.substring(1);
    vis.urlParams = {};

    while ((match = search.exec(query))) {
        vis.urlParams[decode(match[1])] = decode(match[2]);
    }

    vis.editMode = (
        window.location.href.indexOf('edit.html')      !== -1 ||
        window.location.href.indexOf('edit.full.html') !== -1 ||
        window.location.href.indexOf('edit.src.html')  !== -1 ||
        vis.urlParams.edit === ''
    );
};

window.onpopstate();

if (!vis.editMode) {
    // Protection after view change
    $(window).on('click touchstart mousedown', function (e) {
        if (Date.now() - vis.lastChange < vis.debounceInterval) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
    });
    /*$(window).on('touchend mouseup', function () {
        vis.lastChange = null;
        var $log = $('#w00039');
        var $log1 = $('#w00445');
        $log.append('<br>gclick touchend: ' + vis.lastChange);
        $log1.append('<br>gclick touchend: ' + vis.lastChange);
    });*/
}

function main($, onReady) {
    // parse arguments
    var args = document.location.href.split('?')[1];
    vis.args = {};
    if (args) {
        vis.projectPrefix = 'main/';
        var pos = args.indexOf('#');
        if (pos !== -1) {
            args = args.substring(0, pos);
        }
        args = args.split('&');
        for (var a = 0; a < args.length; a++) {
            var parts = args[a].split('=');
            vis.args[parts[0]] = parts[1];
            if (!parts[1]) vis.projectPrefix = parts[0] + '/';
        }
        if (vis.args.project) vis.projectPrefix = vis.args.project + '/';
    }
    // If cordova project => take cordova project name
    if (typeof app !== 'undefined') {
        vis.projectPrefix = app.settings.project ? app.settings.project + '/' : null;
    }

    // On some platforms, the can.js is not immediately ready
    vis.states = new can.Map({'nothing_selected.val': null});

    if (vis.editMode) {
        vis.states.__attrs = vis.states.attr;
        vis.states.attr = function (attr, val) {
            var type = typeof attr;
            if (type !== 'string' && type !== 'number') {
                for (var o in attr) {
                    // allow only dev1, dev2, ... to be bound
                    if (o && attr.hasOwnProperty(o) && o.match(/^dev\d+(.val|.ack|.tc|.lc)+/)) {
                        return this.__attrs(attr, val);
                    }
                }
            } else if (arguments.length === 1 && attr) {
                if (attr.match(/^dev\d+(.val|.ack|.tc|.lc)+/)) {
                    can.__reading(this, attr);
                    return this._get(attr);
                } else {
                    return vis.states[attr];
                }
            } else {
                console.log('This is ERROR!');
                this._set(attr, val);
                return this;
            }
        };

        // binding
        vis.states.___bind = vis.states.bind;
        vis.states.bind = function (id, callback) {
            // allow only dev1, dev2, ... to be bound
            if (id && id.match(/^dev\d+(.val|.ack|.tc|.lc)+/)) {
                return vis.states.___bind(id, callback);
            }
            //console.log('ERROR: binding in edit mode is not allowed on ' + id);
        };
    }

    // für iOS Safari - wirklich notwendig?
    $('body').on('touchmove', function (e) {
        !$(e.target).closest('body').length && e.preventDefault();
    });

    vis.preloadImages(['img/disconnect.png']);

    /*$('#server-disconnect').dialog({
     modal:         true,
     closeOnEscape: false,
     autoOpen:      false,
     dialogClass:   'noTitle',
     width:         400,
     height:        90
     });*/

    $('.vis-version').html(vis.version);

    vis.showWaitScreen(true, null, _('Connecting to Server...') + '<br/>', 0);

    function compareVersion(instVersion, availVersion) {
        var instVersionArr = instVersion.replace(/beta/, '.').split('.');
        var availVersionArr = availVersion.replace(/beta/, '.').split('.');

        var updateAvailable = false;

        for (var k = 0; k < 3; k++) {
            instVersionArr[k] = parseInt(instVersionArr[k], 10);
            if (isNaN(instVersionArr[k])) {
                instVersionArr[k] = -1;
            }
            availVersionArr[k] = parseInt(availVersionArr[k], 10);
            if (isNaN(availVersionArr[k])) {
                availVersionArr[k] = -1;
            }
        }

        if (availVersionArr[0] > instVersionArr[0]) {
            updateAvailable = true;
        } else if (availVersionArr[0] === instVersionArr[0]) {
            if (availVersionArr[1] > instVersionArr[1]) {
                updateAvailable = true;
            } else if (availVersionArr[1] === instVersionArr[1]) {
                if (availVersionArr[2] > instVersionArr[2]) {
                    updateAvailable = true;
                }
            }
        }
        return updateAvailable;
    }

    vis.conn = servConn;

    // old !!!
    // First of all load project/vis-user.css
    //$('#project_css').attr('href', '/' + vis.conn.namespace + '/' + vis.projectPrefix + 'vis-user.css');
    if (typeof app === 'undefined') {
        $.ajax({
            url:      'css/vis-common-user.css',
            type:     'GET',
            dataType: 'html',
            cache:    vis.useCache,
            success:  function (data) {
                if (data && typeof app !== 'undefined' && app.replaceFilesInViewsWeb) {
                    data = app.replaceFilesInViewsWeb(data);
                }

                if (data || vis.editMode) $('head').append('<style id="vis-common-user" class="vis-common-user">' + data + '</style>');
                $(document).trigger('vis-common-user');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                vis.conn.logError('Cannot load vis-common-user.css - ' + errorThrown);
                $('head').append('<style id="vis-common-user" class="vis-common-user"></style>');
                $(document).trigger('vis-common-user');
            }
        });

        $.ajax({
            url:      '/' + vis.conn.namespace + '/' + vis.projectPrefix + 'vis-user.css',
            type:     'GET',
            dataType: 'html',
            cache:    vis.useCache,
            success:  function (data) {
                if (data && typeof app !== 'undefined' && app.replaceFilesInViewsWeb) {
                    data = app.replaceFilesInViewsWeb(data);
                }
                if (data || vis.editMode) {
                    $('head').append('<style id="vis-user" class="vis-user">' + data + '</style>');
                }
                $(document).trigger('vis-user');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                vis.conn.logError('Cannot load /' + vis.conn.namespace + '/' + vis.projectPrefix + 'vis-user.css - ' + errorThrown);
                $('head').append('<style id="vis-user" class="vis-user"></style>');
                $(document).trigger('vis-user');
            }
        });
    }

    function createIds(IDs, index, callback) {
        if (typeof index === 'function') {
            callback = index;
            index = 0;
        }
        index = index || 0;
        var j;
        var now = Date.now();
        var obj = {};
        for (j = index; j < vis.subscribing.IDs.length && j < index + 100; j++) {
            var _id = vis.subscribing.IDs[j];
            if (vis.states[_id + '.val'] === undefined || vis.states[_id + '.val'] === null) {
                if (!_id || !_id.match(/^dev\d+$/)) {
                    console.log('Create inner vis object ' + _id);
                }
                if (vis.editMode) {
                    vis.states[_id + '.val'] = 'null';
                    vis.states[_id + '.ts']  = now;
                    vis.states[_id + '.ack'] = false;
                    vis.states[_id + '.lc']  = now;
                } else {
                    obj[_id + '.val'] = 'null';
                    obj[_id + '.ts']  = now;
                    obj[_id + '.ack'] = false;
                    obj[_id + '.lc']  = now;
                }

                if (!vis.editMode && vis.bindings[_id]) {
                    for (var kk = 0; kk < vis.bindings[_id].length; kk++) {
                        var __widget = vis.views[vis.bindings[_id][kk].view].widgets[vis.bindings[_id][kk].widget];
                        __widget[vis.bindings[_id][kk].type][vis.bindings[_id][kk].attr] = vis.formatBinding(vis.bindings[_id][kk].format, vis.bindings[_id][kk].view, vis.bindings[_id][kk].widget, __widget);
                    }
                }
            } else if (!vis.editMode && vis.bindings[_id] && (_id === 'username' || _id === 'login')) {
                for (var k = 0; k < vis.bindings[_id].length; k++) {
                    var _widget = vis.views[vis.bindings[_id][k].view].widgets[vis.bindings[_id][k].widget];
                    _widget[vis.bindings[_id][k].type][vis.bindings[_id][k].attr] = vis.formatBinding(vis.bindings[_id][k].format, vis.bindings[_id][k].view, vis.bindings[_id][k].widget, _widget);
                }
            }
        }
        try {
            vis.states.attr(obj);
        } catch (e) {
            vis.conn.logError('Error: can\'t create states objects (' + e + ')');
        }

        if (j < vis.subscribing.IDs.length) {
            setTimeout(function () {
                createIds(IDs, j, callback);
            }, 0)
        } else {
            callback();
        }
    }

    function afterInit(error, onReady) {
        if (error) {
            console.log('Possibly not authenticated, wait for request from server');
            // Possibly not authenticated, wait for request from server
        } else {
            // Get user groups info
            vis.conn.getGroups(function (err, userGroups) {
                vis.userGroups = userGroups || {};
                // Get Server language
                vis.conn.getConfig(function (err, config) {
                    systemLang = vis.args.lang || config.language || systemLang;
                    vis.language = systemLang;
                    vis.dateFormat = config.dateFormat;
                    vis.isFloatComma = config.isFloatComma;
                    // set moment language
                    if (typeof moment !== 'undefined') {
                        //moment.lang(vis.language);
                        moment.locale(vis.language);
                    }
                    translateAll();
                    if (vis.isFirstTime) {
                        // Init edit dialog
                        vis.editMode && vis.editInit && vis.editInit();
                        vis.isFirstTime = false;
                        vis.init(onReady);
                    }
                });
            });

            // If metaIndex required, load it
            if (vis.editMode) {
                /* socket.io */
                vis.isFirstTime && vis.showWaitScreen(true, _('Loading data objects...'), null, 20);

                // Read all data objects from server
                vis.conn.getObjects(function (err, data) {
                    vis.objects = data;
                    // Detect if objects are loaded
                    for (var ob in data) {
                        if (data.hasOwnProperty(ob)) {
                            vis.objectSelector = true;
                            break;
                        }
                    }
                    if (vis.editMode && vis.objectSelector) {
                        vis.inspectWidgets(vis.activeViewDiv, vis.activeView, true);
                    }
                });
            }

            //console.log((new Date()) + " socket.io reconnect");
            if (vis.isFirstTime) {
                setTimeout(function () {
                    if (vis.isFirstTime) {
                        // Init edit dialog
                        vis.editMode && vis.editInit && vis.editInit();
                        vis.isFirstTime = false;
                        vis.init(onReady);
                    }
                }, 1000);
            }
        }
    }

    vis.conn.init(null, {
        mayReconnect: typeof app !== 'undefined' ? app.mayReconnect : null,
        onAuthError:  typeof app !== 'undefined' ? app.onAuthError  : null,
        onConnChange: function (isConnected) {
            //console.log("onConnChange isConnected="+isConnected);
            if (isConnected) {
                //$('#server-disconnect').dialog('close');
                if (vis.isFirstTime) {
                    vis.conn.getVersion(function (version) {
                        if (version) {
                            if (compareVersion(version, vis.requiredServerVersion)) {
                                vis.showMessage(_('Warning: requires Server version %s - found Server version %s - please update Server.',  vis.requiredServerVersion, version));
                            }
                        }
                        //else {
                        // Possible not authenticated, wait for request from server
                        //}
                    });

                    vis.showWaitScreen(true, _('Loading data values...') + '<br>', null, 20);
                }

                vis.conn.getLoggedUser(function (authReq, user) {
                    vis.user = user;
                    vis.loginRequired = authReq;
                    vis.states.attr({
                        'username.val' : vis.user,
                        'login.val' : vis.loginRequired,
                        'username' : vis.user,
                        'login' : vis.loginRequired
                    });

                    // first try to load views
                    vis.loadRemote(function () {
                        vis.subscribing.IDs = vis.subscribing.IDs || [];
                        vis.subscribing.byViews = vis.subscribing.byViews || {};

                        vis.conn.subscribe([vis.conn.namespace + '.control.instance', vis.conn.namespace + '.control.data', vis.conn.namespace + '.control.command']);

                        // then add custom scripts
                        if (!vis.editMode && vis.views && vis.views.___settings) {
                            if (vis.views.___settings.scripts) {
                                var script = document.createElement('script');
                                script.innerHTML = vis.views.___settings.scripts;
                                document.head.appendChild(script);
                            }
                        }
                        // Hide old disabled layer
                        $('.vis-view-disabled').hide();

                        // Read all states from server
                        console.debug('Request ' + (vis.editMode ? 'all' : vis.subscribing.active.length) + ' states.');
                        vis.conn.getStates(vis.editMode ? null : vis.subscribing.active, function (error, data) {
                            error && vis.showError(error);

                            vis.updateStates(data);

                            if (vis.subscribing.active.length) {
                                vis.conn.subscribe(vis.subscribing.active);
                            }
                            // Create non-existing IDs
                            if (vis.subscribing.IDs) {
                                createIds(vis.subscribing.IDs, function () {
                                    afterInit(error, onReady);
                                });
                            } else {
                                afterInit(error, onReady);
                            }
                        });
                    });
                });
            } else {
                //console.log((new Date()) + " socket.io disconnect");
                //$('#server-disconnect').dialog('open');
            }
        },
        onRefresh:    function () {
            window.location.reload();
        },
        onUpdate:     function (id, state) {
            _setTimeout(function (_id, _state) {
                vis.updateState(_id, _state);
            }, 0, id, state);
        },
        onAuth:       function (message, salt) {
            if (vis.authRunning) {
                return;
            }
            vis.authRunning = true;
            var users;
            if (visConfig.auth.users && visConfig.auth.users.length) {
                users = '<select id="login-username" class="login-input-field">';
                for (var z = 0; z < visConfig.auth.users.length; z++) {
                    users += '<option value="' + visConfig.auth.users[z] + '" ' + (!z ? 'selected' : '') + '>' + visConfig.auth.users[z] + '</option>';
                }
                users += '</select>';
            } else {
                users = '<input id="login-username" value="" type="text" autocomplete="on" class="login-input-field" placeholder="' + _('User name') + '">';
            }

            var text = '<div id="login-box" class="login-popup" style="display:none">' +
                '<div class="login-message">' + message + '</div>' +
                '<div class="login-input-field">' +
                '<label class="username">' +
                '<span class="_">' + _('User name') + '</span>' +
                users +
                '</label>' +
                '<label class="password">' +
                '<span class="_">' + _('Password') + '</span>' +
                '<input id="login-password" value="" type="password" class="login-input-field" placeholder="' + _('Password') + '">' +
                '</label>' +
                '<button class="login-button" type="button"  class="_">' + _('Sign in') + '</button>' +
                '</div>' +
                '</div>';

            // Add the mask to body
            $('body')
                .append(text)
                .append('<div id="login-mask"></div>');

            var loginBox = $('#login-box');

            //Fade in the Popup
            $(loginBox).fadeIn(300);

            //Set the center alignment padding + border see css style
            var popMargTop = ($(loginBox).height() + 24) / 2;
            var popMargLeft = ($(loginBox).width() + 24) / 2;

            $(loginBox).css({
                'margin-top': -popMargTop,
                'margin-left': -popMargLeft
            });

            $('#login-mask').fadeIn(300);
            // When clicking on the button close or the mask layer the popup closed
            $('#login-password').keypress(function (e) {
                if (e.which === 13) {
                    $('.login-button').trigger('click');
                }
            });
            $('.login-button').bind('click', function () {
                var user = $('#login-username').val();
                var pass = $('#login-password').val();
                $('#login_mask , .login-popup').fadeOut(300, function () {
                    $('#login-mask').remove();
                    $('#login-box').remove();
                });
                setTimeout(function () {
                    vis.authRunning = false;
                    console.log('user ' + user + ', ' + pass + ' ' + salt);
                    vis.conn.authenticate(user, pass, salt);
                }, 500);
                return true;
            });
        },
        onCommand:    function (instance, command, data) {
            var parts;
            if (!instance || (instance !== vis.instance && instance !== 'FFFFFFFF' && instance.indexOf('*') === -1)) {
                return false;
            }
            if (command) {
                if (vis.editMode && command !== 'tts' && command !== 'playSound') {
                    return;
                }
                // external Commands
                switch (command) {
                    case 'alert':
                        parts = data.split(';');
                        vis.showMessage(parts[0], parts[1], parts[2]);
                        break;
                    case 'changedView':
                        // Do nothing
                        return false;
                    case 'changeView':
                        parts = data.split('/');
                        if (parts[1]) {
                            // detect actual project
                            var actual = vis.projectPrefix ? vis.projectPrefix.substring(0, vis.projectPrefix.length - 1) : 'main';
                            if (parts[0] !== actual) {
                                document.location.href = 'index.html?' + actual + '#' + parts[1];
                                return;
                            }
                        }
                        var view = parts[1] || parts[0];
                        vis.changeView(view, view);
                        break;
                    case 'refresh':
                    case 'reload':
                        setTimeout(function () {
                            window.location.reload();
                        }, 1);
                        break;
                    case 'dialog':
                    case 'dialogOpen':
                        //noinspection JSJQueryEfficiency
                        $('#' + data + '_dialog').dialog('open');
                        break;
                    case 'dialogClose':
                        //noinspection JSJQueryEfficiency
                        $('#' + data + '_dialog').dialog('close');
                        break;
                    case 'popup':
                        window.open(data);
                        break;
                    case 'playSound':
                        setTimeout(function () {
                            var href;
                            if (data && data.match(/^http(s)?:\/\//)) {
                                href = data;
                            } else {
                                href = location.protocol + '//' + location.hostname + ':' + location.port + data;
                            }
                            // force read from server
                            href += '?' + Date.now();
                            if (vis.sound) {
                                vis.sound.attr('src', href);
                                vis.sound.attr('muted', false);
                                document.getElementById('external_sound').play();
                            } else {
                                if (typeof Audio !== 'undefined') {
                                    var snd = new Audio(href); // buffers automatically when created
                                    snd.play();
                                } else {
                                    //noinspection JSJQueryEfficiency
                                    var $sound = $('#external_sound');
                                    if (!$sound.length) {
                                        $('body').append('<audio id="external_sound"></audio>');
                                        $sound = $('#external_sound');
                                    }
                                    $sound.attr('src', href);
                                    document.getElementById('external_sound').play();
                                }
                            }
                        }, 1);
                        break;
                    case 'tts':
                        if (typeof app !== 'undefined') {
                            app.tts(data);
                        }
                        break;
                    default:
                        vis.conn.logError('unknown external command ' + command);
                }
            }

            return true;
        },
        onObjectChange: function(id, obj) {
            if (!vis.objects || !vis.editMode) return;
            if (obj) {
                vis.objects[id] = obj;
            } else {
                if (vis.objects[id]) {
                    delete vis.objects[id];
                }
            }

            if ($.fn.selectId) $.fn.selectId('objectAll', id, obj);
        },
        onError:      function (err) {
            if (err.arg === 'vis.0.control.instance' || err.arg === 'vis.0.control.data' || err.arg === 'vis.0.control.command') {
                console.warn('Cannot set ' + err.arg + ', because of insufficient permissions');
            } else {
                vis.showMessage(_('Cannot execute %s for %s, because of insufficient permissions', err.command, err.arg), _('Insufficient permissions'), 'alert', 600);
            }
        }
    }, vis.editMode, vis.editMode);

    if (!vis.editMode) {
        // Listen for resize changes
        window.addEventListener('orientationchange', function () {
            vis.orientationChange();
        }, false);
        window.addEventListener('resize', function () {
            vis.orientationChange();
        }, false);
    }

    //vis.preloadImages(["../../lib/css/themes/jquery-ui/redmond/images/modalClose.png"]);
    vis.initWakeUp();
}

// Start of initialisation: main ()
if (typeof app === 'undefined') {
    $(document).ready(function () {
        main(jQuery);
    });
}

// IE8 indexOf compatibility
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, start) {
        for (var i = start || 0, j = this.length; i < j; i++) {
            if (this[i] === obj) {
                return i;
            }
        }
        return -1;
    };
}

function _setTimeout(func, timeout, arg1, arg2, arg3, arg4, arg5, arg6) {
    return setTimeout(function () {
        func(arg1, arg2, arg3, arg4, arg5, arg6);
    }, timeout);
}
function _setInterval(func, timeout, arg1, arg2, arg3, arg4, arg5, arg6) {
    return setInterval(function () {
        func(arg1, arg2, arg3, arg4, arg5, arg6);
    }, timeout);
}

/*if (window.location.search === '?edit') {
 window.alert(_('please use /vis/edit.html instead of /vis/?edit'));
 location.href = './edit.html' + window.location.hash;
 }*/

// TODO find out if iPad 1 has map or not.
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {
    Array.prototype.map = function(callback, thisArg) {
        var T, A, k;

        if (this === null || this === undefined || this === 0) {
            throw new TypeError('this is null or not defined');
        }

        // 1. Let O be the result of calling ToObject passing the |this|
        //    value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal
        //    method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }

        // 6. Let A be a new array created as if by the expression new Array(len)
        //    where Array is the standard built-in constructor with that name and
        //    len is the value of len.
        A = new Array(len);

        // 7. Let k be 0
        k = 0;

        // 8. Repeat, while k < len
        while (k < len) {

            var kValue, mappedValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal
            //    method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal
                //    method of O with argument Pk.
                kValue = O[k];

                // ii. Let mappedValue be the result of calling the Call internal
                //     method of callback with T as this value and argument
                //     list containing kValue, k, and O.
                mappedValue = callback.call(T, kValue, k, O);

                // iii. Call the DefineOwnProperty internal method of A with arguments
                // Pk, Property Descriptor
                // { Value: mappedValue,
                //   Writable: true,
                //   Enumerable: true,
                //   Configurable: true },
                // and false.

                // In browsers that support Object.defineProperty, use the following:
                // Object.defineProperty(A, k, {
                //   value: mappedValue,
                //   writable: true,
                //   enumerable: true,
                //   configurable: true
                // });

                // For best browser support, use the following:
                A[k] = mappedValue;
            }
            // d. Increase k by 1.
            k++;
        }

        // 9. return A
        return A;
    };
}
