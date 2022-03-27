window.systemLang = 'en';
window.systemDictionary = {};

function translateWord(text, lang, dictionary) {
    if (!text) {
        return '';
    }
    lang = lang || window.systemLang;
    dictionary = dictionary || window.systemDictionary;

    if (dictionary[text]) {
        let newText = dictionary[text][lang];
        if (newText) {
            return newText;
        } else
        if (lang !== 'en') {
            newText = dictionary[text].en;
            if (newText) {
                return newText;
            }
        }
    } else if (typeof text === 'string' && !text.match(/_tooltip$/)) {
        console.log(`"${text}": {"en": "${text}", "de": "${text}", "ru": "${text}"},`);
    } else if (typeof text !== 'string') {
        console.warn(`Trying to translate non-text: ${text}`);
    }

    return text;
}

// make possible _('words to translate')
window._ = function (text, arg1, arg2, arg3) {
    text = translateWord(text);

    let pos = text.indexOf('%s');
    if (pos !== -1) {
        text = text.replace('%s', arg1);
    } else {
        return text;
    }

    pos = text.indexOf('%s');
    if (pos !== -1) {
        text = text.replace('%s', arg2);
    } else {
        return text;
    }

    pos = text.indexOf('%s');
    if (pos !== -1) {
        text = text.replace('%s', arg3);
    }

    return text;
};

window.addWords = function (words) {
    Object.assign(window.systemDictionary, words);
};

addWords({
    'No connection to Server': {
        'en': 'No connection to Server',
        'de': 'Keine Verbindung zum Server',
        'ru': 'Нет соединения с сервером',
        "pt": "Nenhuma conexão ao servidor",
        "nl": "Geen verbinding met server",
        "fr": "Pas de connexion au serveur",
        "it": "Nessuna connessione al server",
        "es": "Sin conexión al servidor",
        "pl": "Brak połączenia z serwerem",
        "zh-cn": "没有与服务器的连接"
    },
    'Loading Views...': {
        'en': 'Loading Views...',
        'de': 'Lade Views...',
        'ru': 'Загрузка пользовательских страниц...',
        "pt": "Carregando páginas ...",
        "nl": "Pagina's laden ...",
        "fr": "Chargement des pages ...",
        "it": "Caricamento pagine ...",
        "es": "Cargando páginas ...",
        "pl": "Ładowanie stron ...",
        "zh-cn": "加载页面......"
    },
    'Connecting to Server...': {
        'en': 'Connecting to Server...',
        'de': 'Verbinde mit dem Server...',
        'ru': 'Соединение с сервером...',
        "pt": "Conectando ao servidor...",
        "nl": "Verbinden met de server...",
        "fr": "Connexion au serveur...",
        "it": "Connessione al server...",
        "es": "Conectando al servidor...",
        "pl": "Łączenie z serwerem...",
        "zh-cn": "连接到服务器..."
    },
    'Loading data objects...': {
        'en': 'Loading data...',
        'de': 'Lade Daten...',
        'ru': 'Загрузка данных...',
        "pt": "Carregando dados...",
        "nl": "Data laden...",
        "fr": "Chargement des données...",
        "it": "Caricamento dati...",
        "es": "Cargando datos...",
        "pl": "Ładowanie danych...",
        "zh-cn": "加载数据中..."
    },
    'Loading data values...': {
        'en': 'Loading values...',
        'de': 'Lade Werte...',
        'ru': 'Загрузка значений...',
        "pt": "Carregando valores ...",
        "nl": "Waarden laden ...",
        "fr": "Chargement des valeurs ...",
        "it": "Caricamento valori ...",
        "es": "Cargando valores ...",
        "pl": "Ładowanie wartości ...",
        "zh-cn": "载入值..."
    },
    'error - View doesn\'t exist': {
        'en': 'View doesn\'t exist!',
        'de': 'View existiert nicht!',
        'ru': 'Страница не существует!',
        "pt": "erro - a página não existe",
        "nl": "error - Page bestaat niet",
        "fr": "error - La page n'existe pas",
        "it": "errore - La pagina non esiste",
        "es": "error - la página no existe",
        "pl": "błąd - strona nie istnieje",
        "zh-cn": "错误 - 页面不存在"
    },
    'no views found!': {
        'en': 'No views found!',
        'de': 'Keine Views gefunden!',
        'ru': 'Не найдено страниц!',
        "pt": "Nenhuma página encontrada!",
        "nl": "Geen pagina's gevonden!",
        "fr": "Aucune page trouvée!",
        "it": "Nessuna pagina trovata!",
        "es": "No se encontraron páginas!",
        "pl": "Nie znaleziono stron!",
        "zh-cn": "找不到页面！"
    },
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
    },
});