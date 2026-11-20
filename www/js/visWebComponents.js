/**
 *  ioBroker.vis
 *  https://github.com/ioBroker/ioBroker.vis
 *
 *  Copyright (c) 2026 bluefox https://github.com/GermanBluefox,
 *  MIT License
 */
/* global vis, systemDictionary, systemLang, $ */
/* jshint browser:true, esversion:6 */
'use strict';

/**
 * Host of ioBroker web components (https://github.com/ioBroker/web-components) in vis
 *
 * An adapter lists its components in `common.webComponents` of its io-package.json. The runtime and the editor read
 * the instance objects, load the manifests and create for every component a widget template of the virtual widget
 * set "webcomponents": the settings of the component become the attributes of the widget. The element itself is
 * created only when the widget is shown. It gets a socket (on top of servConn), its settings, the theme and whether
 * it is shown in the editor.
 *
 * The helpers of the contract are the ES modules in lib/js/iobroker-web-components/ (copied from the package by the
 * build). They and the components are loaded with `import()`, so a browser without ES modules simply has no web
 * components - this file itself must stay parsable by it.
 */
(function () {
    if (typeof vis === 'undefined') {
        return;
    }

    var SET = 'webcomponents';
    var TPL_PREFIX = 'tplWebComponent_';
    var LIB_PATH = 'lib/js/iobroker-web-components/index.js';
    // the runtime does not wait longer for the components
    var LOAD_TIMEOUT = 15000;
    // an element that is only moved (its widget is rendered again) subscribes the same states at once
    var UNSUBSCRIBE_DELAY = 2000;
    var NAVIGATE_EVENT = 'iob-navigate';

    // attributes of the widget that are no settings of the component: how vis shows it
    var THEME_GROUP = 'wc_theme';
    var THEME_ATTR = 'iobTheme';
    var PRIMARY_ATTR = 'iobPrimary';

    // names that vis uses itself for every widget or treats by their name: such a setting gets another attribute name
    var RESERVED = ['wid', 'name', 'comment', 'class', 'filterkey', 'views', 'locked', 'sound', 'members', 'attrCount', 'renderVisible', 'tpl', 'data', 'style', 'widgetSet', THEME_ATTR, PRIMARY_ATTR];
    var RESERVED_PATTERN = /^(g_|visibility-|signals-|lc-|gestures-|css_|echart-|groupAttr)|nav_view$|_effect|_eff_opt|_tooltip$/;

    var WORDS = {
        group: {
            en: 'Web component',
            de: 'Web-Komponente',
            ru: 'Веб-компонент',
            pt: 'Componente web',
            nl: 'Webcomponent',
            fr: 'Composant web',
            it: 'Componente web',
            es: 'Componente web',
            pl: 'Komponent webowy',
            uk: 'Веб-компонент',
            'zh-cn': 'Web 组件'
        },
        theme: {
            en: 'Theme',
            de: 'Theme',
            ru: 'Тема',
            pt: 'Tema',
            nl: 'Thema',
            fr: 'Thème',
            it: 'Tema',
            es: 'Tema',
            pl: 'Motyw',
            uk: 'Тема',
            'zh-cn': '主题'
        },
        themeHelp: {
            en: 'auto: dark, if the text of the view is light',
            de: 'auto: dunkel, wenn der Text der View hell ist',
            ru: 'авто: тёмная, если текст вида светлый',
            pt: 'auto: escuro, se o texto da vista for claro',
            nl: 'auto: donker, als de tekst van de view licht is',
            fr: 'auto : sombre si le texte de la vue est clair',
            it: 'auto: scuro, se il testo della vista è chiaro',
            es: 'auto: oscuro, si el texto de la vista es claro',
            pl: 'auto: ciemny, jeśli tekst widoku jest jasny',
            uk: 'авто: темна, якщо текст виду світлий',
            'zh-cn': '自动：视图文字为浅色时使用深色'
        },
        auto: {
            en: 'auto',
            de: 'automatisch',
            ru: 'авто',
            pt: 'automático',
            nl: 'automatisch',
            fr: 'automatique',
            it: 'automatico',
            es: 'automático',
            pl: 'automatyczny',
            uk: 'авто',
            'zh-cn': '自动'
        },
        light: {
            en: 'light',
            de: 'hell',
            ru: 'светлая',
            pt: 'claro',
            nl: 'licht',
            fr: 'clair',
            it: 'chiaro',
            es: 'claro',
            pl: 'jasny',
            uk: 'світла',
            'zh-cn': '浅色'
        },
        dark: {
            en: 'dark',
            de: 'dunkel',
            ru: 'тёмная',
            pt: 'escuro',
            nl: 'donker',
            fr: 'sombre',
            it: 'scuro',
            es: 'oscuro',
            pl: 'ciemny',
            uk: 'темна',
            'zh-cn': '深色'
        },
        primary: {
            en: 'Primary color',
            de: 'Primärfarbe',
            ru: 'Основной цвет',
            pt: 'Cor primária',
            nl: 'Primaire kleur',
            fr: 'Couleur principale',
            it: 'Colore primario',
            es: 'Color primario',
            pl: 'Kolor główny',
            uk: 'Основний колір',
            'zh-cn': '主色'
        },
        notAvailable: {
            en: 'Web component "%s" is not available. Is its adapter installed?',
            de: 'Web-Komponente "%s" ist nicht verfügbar. Ist ihr Adapter installiert?',
            ru: 'Веб-компонент "%s" недоступен. Установлен ли его адаптер?'
        },
        notSupported: {
            en: 'This browser cannot show web components',
            de: 'Dieser Browser kann keine Web-Komponenten anzeigen',
            ru: 'Этот браузер не может показывать веб-компоненты'
        },
        cannotLoad: {
            en: 'Cannot load web component "%s"',
            de: 'Web-Komponente "%s" kann nicht geladen werden',
            ru: 'Не удаётся загрузить веб-компонент "%s"'
        }
    };

    function getLang() {
        return vis.language || (typeof systemLang !== 'undefined' && systemLang) || 'en';
    }

    /** A text of the manifest (a string or {en, de, ...}) in the language of vis */
    function getText(text) {
        if (text === undefined || text === null) {
            return '';
        }
        if (typeof text === 'object') {
            var lang = getLang();
            if (text[lang]) {
                return String(text[lang]);
            }
            if (text.en) {
                return String(text.en);
            }
            for (var key in text) {
                if (text.hasOwnProperty(key) && text[key]) {
                    return String(text[key]);
                }
            }
            return '';
        }
        return String(text);
    }

    function word(name, arg) {
        var text = getText(WORDS[name]);
        return arg === undefined ? text : text.replace('%s', arg);
    }

    function escapeHtml(text) {
        return String(text === undefined || text === null ? '' : text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function isNumber(value) {
        return typeof value === 'number' && isFinite(value);
    }

    var logger = {
        error: function (text) {
            console.error('[webcomponents] ' + text);
        },
        warn: function (text) {
            console.warn('[webcomponents] ' + text);
        }
    };

    var importer = null;
    /** The native `import()`: in a classic script a syntax error for an old browser, so it is not written here */
    function getImporter() {
        if (importer === null) {
            try {
                importer = new Function('url', 'return import(url);');
            } catch (e) {
                importer = false;
            }
        }
        return importer;
    }

    /** The template of a component: an ID that jQuery takes as a selector */
    function getTemplateId(tag) {
        return TPL_PREFIX + tag.replace(/[^a-z0-9_-]/g, '_');
    }

    var host = {
        /** Name of the virtual widget set */
        set: SET,
        /** The module @iobroker/web-components, once loaded */
        lib: null,
        /** The loaded components, by tag */
        components: {},
        /** The instance objects, as read while loading */
        instances: [],
        /** The element shown by a widget, by widget ID: it is taken again if its widget is rendered again */
        _elements: {},
        /** The number of the last rendering of a widget, by widget ID */
        _renders: {},
        _socket: null,
        _loaded: false
    };

    /** Whether this browser can show web components: custom elements and ES modules */
    host.isSupported = function () {
        try {
            return !!(
                window.customElements &&
                window.Promise &&
                typeof window.URL === 'function' &&
                typeof HTMLScriptElement !== 'undefined' &&
                'noModule' in HTMLScriptElement.prototype &&
                getImporter()
            );
        } catch (e) {
            return false;
        }
    };

    /** Whether a view shows a web component */
    function isUsedInViews() {
        if (!vis.views) {
            return false;
        }
        for (var view in vis.views) {
            if (!vis.views.hasOwnProperty(view) || view === '___settings' || !vis.views[view]) {
                continue;
            }
            var widgets = vis.views[view].widgets || {};
            for (var wid in widgets) {
                if (widgets.hasOwnProperty(wid) && widgets[wid] && typeof widgets[wid].tpl === 'string' && widgets[wid].tpl.indexOf(TPL_PREFIX) === 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function canConnect() {
        return !!(
            vis.conn &&
            vis.conn._socket &&
            (!vis.conn.getType || vis.conn.getType() !== 'local') &&
            typeof window.app === 'undefined' // cordova app: no server to load the components from
        );
    }

    /** All instance objects: the ones whose adapter brings web components have common.webComponents */
    function readInstances() {
        return new Promise(function (resolve, reject) {
            vis.conn._socket.emit(
                'getObjectView',
                'system',
                'instance',
                {startkey: 'system.adapter.', endkey: 'system.adapter.\u9999'},
                function (err, res) {
                    if (err) {
                        reject(err instanceof Error ? err : new Error(String(err)));
                    } else {
                        resolve(((res && res.rows) || [])
                            .map(function (row) {
                                return row.value;
                            })
                            .filter(function (obj) {
                                return obj && obj._id && obj.common;
                            }));
                    }
                }
            );
        });
    }

    /**
     * Load the web components of the installed adapters and create their widget templates. Called by vis.init()
     * after the widget sets: the editor needs them for its palette, the runtime to render its views.
     *
     * @param {function} callback called when done - also if there are none or loading failed
     */
    host.load = function (callback) {
        var done = false;
        var timer = null;
        var reason = '';

        function finish() {
            if (done) {
                return;
            }
            done = true;
            timer && clearTimeout(timer);
            createMissingTemplates(reason);
            callback && callback();
        }

        if (host._loaded) {
            return finish();
        }
        host._loaded = true;

        // the runtime loads them only if a view shows one
        if (!vis.editMode && !isUsedInViews()) {
            return finish();
        }
        if (!host.isSupported()) {
            reason = word('notSupported');
            return finish();
        }
        if (!canConnect()) {
            return finish();
        }

        timer = setTimeout(function () {
            timer = null;
            logger.warn('Loading of web components takes too long: continue without them');
            finish();
        }, LOAD_TIMEOUT);

        getImporter()(new URL(LIB_PATH, document.baseURI).href)
            .then(function (lib) {
                host.lib = lib;
                NAVIGATE_EVENT = lib.NAVIGATE_EVENT || NAVIGATE_EVENT;
                return readInstances();
            })
            .then(function (instances) {
                host.instances = instances;
                // a host under a path of its own (/vis/) finds /adapter/<name>/ next to it, web serves it from <name>.admin
                var sources = host.lib.getWebComponentSources(instances, document.baseURI);
                return host.lib.loadWebComponents(sources, {log: logger});
            })
            .then(function (components) {
                if (done) {
                    return;
                }
                var count = 0;
                for (var i = 0; i < components.length; i++) {
                    try {
                        if (register(components[i])) {
                            count++;
                        }
                    } catch (e) {
                        logger.error('Cannot register <' + components[i].manifest.tag + '>: ' + (e && e.message ? e.message : e));
                    }
                }
                if (count) {
                    console.log('[webcomponents] ' + count + ' web component(s) found');
                }
                // the editor shows the set in its palette like the other widget sets
                if (count && vis.editMode && vis.widgetSets && vis.widgetSets.indexOf(SET) === -1) {
                    vis.widgetSets.push(SET);
                }
            })
            .catch(function (e) {
                logger.error('Cannot load the web components: ' + (e && e.message ? e.message : e));
            })
            .then(finish);
    };

    /**
     * The attributes of the widget out of the settings of the component - in the syntax of "data-vis-attrs" - and
     * what this syntax cannot carry ("data-vis-attrs-meta"): labels, options with labels, hidden, disabled
     */
    function describe(component) {
        var lib = host.lib;
        var manifest = component.manifest;
        var tagId = manifest.tag.replace(/[^a-zA-Z0-9]/g, '_');
        var groups = {};
        var used = {};
        var renamed = {}; // setting -> attribute, for the settings whose name vis uses itself
        var toAttr = {}; // setting -> attribute
        var items = []; // in the order of the manifest: {group} or {setting, name}
        var groupCount = 0;

        function startGroup(label) {
            var id = 'wc_' + tagId + '_' + groupCount++;
            groups[id] = label;
            items.push({group: id});
        }

        var settingsGroups = lib.getSettingsGroups(manifest);
        for (var g = 0; g < settingsGroups.length; g++) {
            if (manifest.settings.type === 'tabs') {
                startGroup(settingsGroups[g].label || settingsGroups[g].name);
            }
            var panelItems = settingsGroups[g].panel.items || {};
            for (var name in panelItems) {
                if (!panelItems.hasOwnProperty(name)) {
                    continue;
                }
                var setting = panelItems[name];
                if (!setting || typeof setting !== 'object') {
                    continue;
                }
                if (setting.type === 'header') {
                    startGroup(setting.text || setting.label || name);
                    continue;
                }
                if (setting.type === 'staticText' || setting.type === 'divider') {
                    continue;
                }
                var visType = toVisType(setting);
                var attr = name;
                if (!isNameUsable(attr, visType.type) || used[attr]) {
                    attr = 'wc_' + name.replace(/[^a-zA-Z0-9_]/g, '_');
                    while (used[attr]) {
                        attr += '_';
                    }
                    renamed[name] = attr;
                }
                used[attr] = true;
                toAttr[name] = attr;
                items.push({setting: setting, name: name, attr: attr, visType: visType});
            }
        }

        // the settings that hidden and disabled of any setting read: a change of them builds the inspector again
        var depends = [];
        for (var i = 0; i < items.length; i++) {
            if (items[i].setting) {
                collectNames(items[i].setting.hidden, toAttr, depends);
                collectNames(items[i].setting.disabled, toAttr, depends);
            }
        }

        var lines = [];
        var meta = {};
        var attrs = [];
        for (var j = 0; j < items.length; j++) {
            var item = items[j];
            if (item.group) {
                lines.push('group.' + item.group);
                continue;
            }
            var s = item.setting;
            lines.push(item.attr + (item.visType.type ? '/' + item.visType.type : ''));
            var m = {
                // HTML, as the inspector shows the translated names of the attributes
                label: escapeHtml(getText(s.label) || item.name)
            };
            if (s.help) {
                m.title = escapeHtml(getText(s.help));
            }
            if (s.default !== undefined && s.default !== null) {
                m.default = s.default;
            }
            if (item.visType.options) {
                m.options = item.visType.options;
            }
            if (s.type === 'number' || s.type === 'slider') {
                m.valueType = 'number';
            } else if (s.type === 'checkbox') {
                m.valueType = 'boolean';
            }
            var hidden = toExpression(s.hidden, renamed);
            if (hidden) {
                m.hidden = hidden;
            }
            var disabled = toExpression(s.disabled, renamed);
            if (disabled) {
                m.disabled = disabled;
            }
            if (depends.length) {
                m.depends = depends;
            }
            meta[item.attr] = m;
            attrs.push({attr: item.attr, setting: item.name, type: s.type, default: m.default});
        }

        // how vis shows the component
        lines.push('group.' + THEME_GROUP);
        lines.push(THEME_ATTR + '/select');
        meta[THEME_ATTR] = {
            label: escapeHtml(word('theme')),
            title: escapeHtml(word('themeHelp')),
            default: 'auto',
            options: [
                {value: 'auto', label: word('auto')},
                {value: 'light', label: word('light')},
                {value: 'dark', label: word('dark')}
            ]
        };
        lines.push(PRIMARY_ATTR + '/color');
        meta[PRIMARY_ATTR] = {label: escapeHtml(word('primary'))};

        return {lines: lines, meta: meta, attrs: attrs, groups: groups};
    }

    /** The type of the attribute in vis for a setting of JSON-Config, and its options */
    function toVisType(setting) {
        var options;
        switch (setting.type) {
            case 'objectId':
                return {type: 'id'};
            case 'checkbox':
                return {type: 'checkbox'};
            case 'color':
                return {type: 'color'};
            case 'password':
                return {type: 'password'};
            case 'number':
                options = {};
                isNumber(setting.min) && (options.min = setting.min);
                isNumber(setting.max) && (options.max = setting.max);
                isNumber(setting.step) && (options.step = setting.step);
                return {type: 'number', options: options};
            case 'slider':
                options = {
                    min: isNumber(setting.min) ? setting.min : 0,
                    max: isNumber(setting.max) ? setting.max : 100,
                    step: isNumber(setting.step) ? setting.step : 1
                };
                return {type: 'slider,' + options.min + ',' + options.max + ',' + options.step, options: options};
            case 'text':
                // vis "text" is a field with more lines and an editor
                return {type: setting.minRows > 1 ? 'text' : ''};
            case 'select':
                return {type: 'select', options: toSelectOptions(setting.options || [], setting.default)};
            case 'instance':
                return {type: 'select', options: getInstanceOptions(setting.adapter)};
            case 'autocompleteSendTo':
                // the answer of the instance is not asked for in the editor: a text field, with the options it brings
                if (Array.isArray(setting.options) && setting.options.length) {
                    return {
                        type: 'auto',
                        options: setting.options.map(function (option) {
                            return String(option && typeof option === 'object' ? option.value : option);
                        })
                    };
                }
                return {type: ''};
            default:
                // selectSendTo and anything else: a text field, so the value stays editable
                return {type: ''};
        }
    }

    function toSelectOptions(options, defaultValue) {
        var result = [];
        // without a default the field may stay empty, as in JSON-Config
        if (defaultValue === undefined || defaultValue === null) {
            result.push({value: '', label: ''});
        }
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            if (option && typeof option === 'object') {
                result.push({value: option.value, label: getText(option.label) || String(option.value)});
            } else if (option !== undefined && option !== null) {
                result.push({value: option, label: String(option)});
            }
        }
        return result;
    }

    /** The instances to choose for a setting of type "instance": `<adapter>.<n>`, as JSON-Config stores them */
    function getInstanceOptions(adapter) {
        var result = [{value: '', label: ''}];
        host.instances.forEach(function (obj) {
            var id = obj._id.replace(/^system\.adapter\./, '');
            if (!adapter || id.replace(/\.\d+$/, '') === adapter) {
                result.push({value: id, label: id});
            }
        });
        return result;
    }

    function isNameUsable(name, visType) {
        if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name)) {
            return false;
        }
        // vis shows these as a color or an object ID, whatever their type
        if (name === 'color') {
            return visType === 'color';
        }
        if (/^oid(-|$)/.test(name)) {
            return visType === 'id';
        }
        return RESERVED.indexOf(name) === -1 && !RESERVED_PATTERN.test(name);
    }

    var EXPRESSION_NAMES = [/\bdata\s*\.\s*([A-Za-z_$][\w$]*)/g, /\bdata\s*\[\s*['"]([^'"]+)['"]\s*]/g];

    /** The names of settings an expression reads, as attributes */
    function collectNames(expression, toAttr, result) {
        if (typeof expression !== 'string') {
            return;
        }
        EXPRESSION_NAMES.forEach(function (regex) {
            regex.lastIndex = 0;
            var match;
            while ((match = regex.exec(expression))) {
                var attr = toAttr[match[1]];
                if (attr && result.indexOf(attr) === -1) {
                    result.push(attr);
                }
            }
        });
    }

    /** hidden or disabled of a setting, over the attributes of the widget: renamed settings are renamed there too */
    function toExpression(expression, renamed) {
        if (typeof expression === 'boolean') {
            return expression ? 'true' : '';
        }
        if (typeof expression !== 'string' || !expression.trim()) {
            return '';
        }
        return expression
            .replace(EXPRESSION_NAMES[0], function (all, name) {
                return renamed[name] ? 'data.' + renamed[name] : all;
            })
            .replace(EXPRESSION_NAMES[1], function (all, name) {
                return renamed[name] ? 'data["' + renamed[name] + '"]' : all;
            });
    }

    /** Translations for the editor, like the widget sets bring them */
    function addWords(key, text) {
        if (typeof systemDictionary === 'undefined') {
            return;
        }
        var entry = {};
        if (text && typeof text === 'object') {
            for (var lang in text) {
                if (text.hasOwnProperty(lang) && text[lang]) {
                    entry[lang] = escapeHtml(text[lang]);
                }
            }
        } else if (text) {
            entry.en = escapeHtml(text);
        }
        if (!entry.en) {
            entry.en = escapeHtml(getText(text));
        }
        systemDictionary[key] = entry;
    }

    /** Create the widget template of a component; false if it is not one for vis */
    function register(component) {
        var manifest = component.manifest;
        // vis keeps no values: a component that edits one is for JSON-Config
        if (manifest.editsValue) {
            return false;
        }
        var tag = manifest.tag;
        var tplId = getTemplateId(tag);
        if (document.getElementById(tplId)) {
            return false;
        }

        var description = describe(component);
        component.attrs = description.attrs;
        component.types = host.lib.getSettingTypes(manifest);
        host.components[tag] = component;

        for (var group in description.groups) {
            if (description.groups.hasOwnProperty(group)) {
                addWords('group_' + group, description.groups[group]);
            }
        }
        addWords('group_' + THEME_GROUP, WORDS.group);

        var size = manifest.size || {width: 200, height: 150};
        var name = getText(manifest.name) || tag;
        var icon = manifest.icon ? host.lib.resolveManifestUrl(manifest.icon, component.url) : '';

        var preview = '<div class="vis-web-component-prev" style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; overflow: hidden">' +
            (icon ?
                '<img src="' + escapeHtml(icon) + '" style="max-width: 100%; max-height: 100%" alt="">' :
                '<div style="font-size: 11px; text-align: center; word-break: break-all">&lt;' + escapeHtml(tag) + '&gt;</div>') +
            '</div>';

        var tpl = document.createElement('script');
        tpl.id = tplId;
        tpl.type = 'text/ejs';
        tpl.className = 'vis-tpl';
        tpl.setAttribute('data-vis-set', SET);
        tpl.setAttribute('data-vis-name', escapeHtml(name));
        tpl.setAttribute('data-vis-prev', preview);
        tpl.setAttribute('data-vis-attrs', description.lines.join(';'));
        tpl.setAttribute('data-vis-attrs-meta', JSON.stringify(description.meta));
        tpl.setAttribute('data-vis-web-component', tag);
        // the filter of the palette finds the widget by the adapter too, e.g. "witmotion" for "Wit Motion"
        tpl.setAttribute('data-vis-keywords', [component.adapter, tag].filter(Boolean).join(' ').toLowerCase());
        if (manifest.description) {
            tpl.setAttribute('title', getText(manifest.description));
        }
        // the tag is checked by the manifest: [a-z0-9._-] only, so it may stand in quotes
        tpl.text =
            '<div class="vis-widget <%== this.data.attr(\'class\') %>" style="width: ' + size.width + 'px; height: ' + size.height + 'px;" id="<%= this.data.attr(\'wid\') %>"' +
            (size.noResize ? ' data-vis-resizable=\'{"disabled":true}\'' : '') + '>' +
            '<div class="vis-widget-body vis-web-component" style="width: 100%; height: 100%;" <%= (el) -> vis.binds.webcomponents.render(el, \'' + tag + '\', this.data, this.view) %>></div>' +
            '</div>';
        document.head.appendChild(tpl);
        return true;
    }

    /**
     * Templates for the widgets of components that are not there (adapter removed, browser too old), so the views
     * still render and the editor can select and delete such a widget
     */
    function createMissingTemplates(reason) {
        if (!vis.views) {
            return;
        }
        var missing = {};
        for (var view in vis.views) {
            if (!vis.views.hasOwnProperty(view) || view === '___settings' || !vis.views[view]) {
                continue;
            }
            var widgets = vis.views[view].widgets || {};
            for (var wid in widgets) {
                if (!widgets.hasOwnProperty(wid) || !widgets[wid]) {
                    continue;
                }
                var tplId = widgets[wid].tpl;
                if (typeof tplId === 'string' && tplId.indexOf(TPL_PREFIX) === 0 && !document.getElementById(tplId)) {
                    missing[tplId] = true;
                }
            }
        }
        for (var id in missing) {
            if (!missing.hasOwnProperty(id) || !/^[\w-]+$/.test(id)) {
                continue;
            }
            var name = id.substring(TPL_PREFIX.length);
            // stands in quotes in the template
            var message = (reason || word('notAvailable', name)).replace(/['\\\r\n]/g, '').replace(/%>/g, '');
            var tpl = document.createElement('script');
            tpl.id = id;
            tpl.type = 'text/ejs';
            // no class "vis-tpl": not for the palette
            tpl.setAttribute('data-vis-set', SET);
            tpl.setAttribute('data-vis-name', name);
            tpl.setAttribute('data-vis-attrs', '');
            tpl.text =
                '<div class="vis-widget <%== this.data.attr(\'class\') %>" style="width: 200px; height: 60px;" id="<%= this.data.attr(\'wid\') %>">' +
                '<div class="vis-widget-body vis-web-component-missing" style="width: 100%; height: 100%;" <%= (el) -> vis.binds.webcomponents.showMessage(el, \'' +
                message +
                '\') %>></div>' +
                '</div>';
            document.head.appendChild(tpl);
        }
    }

    /** The element of a hook in a template: can.js may give it wrapped */
    function toElement(el) {
        return el && !el.nodeType && typeof el.length === 'number' ? el[0] : el;
    }

    function showMessage(el, text) {
        el = toElement(el);
        if (!el) {
            return;
        }
        el.innerHTML = '';
        var div = document.createElement('div');
        div.style.cssText = 'padding: 4px; font-size: 12px; opacity: 0.7; overflow: hidden';
        div.textContent = text;
        el.appendChild(div);
    }

    /** The settings for the element out of the attributes of the widget */
    function getSettings(component, values) {
        var raw = {};
        for (var i = 0; i < component.attrs.length; i++) {
            var a = component.attrs[i];
            var value = values[a.attr];
            // the editor sets the defaults when the widget is selected the first time
            if (value === undefined || value === null) {
                value = a.default;
            }
            // an emptied field has no value - only a text may be empty
            if (value === '' && a.type !== 'text' && a.type !== 'password') {
                value = undefined;
            }
            if (value !== undefined && value !== null) {
                raw[a.setting] = value;
            }
        }
        return host.lib.toSettings(component.types, raw);
    }

    /** Whether a CSS color is light, e.g. the text of the view */
    function isLightColor(color) {
        var m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?/.exec(color || '');
        if (!m || (m[4] !== undefined && parseFloat(m[4]) === 0)) {
            return false;
        }
        return (0.299 * parseFloat(m[1]) + 0.587 * parseFloat(m[2]) + 0.114 * parseFloat(m[3])) / 255 > 0.6;
    }

    /** The theme for the element: light or dark, and the font and the text color the widget has in its view */
    function getTheme(el, values) {
        var style = null;
        try {
            style = window.getComputedStyle(el);
        } catch (e) {
            // not in the document
        }
        var mode = values[THEME_ATTR];
        var theme = {};
        if (mode === 'light' || mode === 'dark') {
            theme.type = mode;
        } else {
            theme.type = style && isLightColor(style.color) ? 'dark' : 'light';
        }
        if (style) {
            // the element inherits this color anyway: the same for what it draws itself
            if (style.color) {
                theme.text = style.color;
            }
            if (style.fontFamily) {
                theme.fontFamily = style.fontFamily;
            }
            var fontSize = parseFloat(style.fontSize);
            if (fontSize > 0) {
                theme.fontSize = fontSize;
            }
        }
        if (values[PRIMARY_ATTR]) {
            theme.primary = values[PRIMARY_ATTR];
        }
        return host.lib.toWebComponentTheme(theme);
    }

    function onNavigate(e) {
        if (vis.editMode) {
            return;
        }
        var view = e.detail && e.detail.view;
        if (view && vis.views && vis.views[view]) {
            e.preventDefault();
            vis.changeView(view, view);
        }
    }

    function createElement(tag) {
        var element = document.createElement(tag);
        // the box of the widget, for a component without ":host { display: block; ... }"
        element.style.display = 'block';
        element.style.width = '100%';
        element.style.height = '100%';
        element.addEventListener(NAVIGATE_EVENT, onNavigate);
        return element;
    }

    /**
     * Show a component in a widget - called by the template of the widget
     *
     * @param {HTMLElement} el the body of the widget
     * @param {string} tag the tag of the component
     * @param {object} data the attributes of the widget (can.Map)
     */
    host.render = function (el, tag, data /* , view */) {
        el = toElement(el);
        if (!el) {
            return;
        }
        var component = host.components[tag];
        if (!component) {
            showMessage(el, word('notAvailable', tag));
            return;
        }
        var values = data && typeof data.attr === 'function' ? data.attr() : data || {};
        var wid = values.wid || '';
        var render = (host._renders[wid] || 0) + 1;
        host._renders[wid] = render;

        // the module is imported when the first widget of the component is shown
        host.lib.importWebComponent(component)
            .then(function () {
                // the widget was rendered again in the meantime
                if (host._renders[wid] !== render) {
                    return;
                }
                var element = host._elements[wid];
                // the element of the last rendering is taken again (no new subscriptions, no flicker), unless it
                // is still shown, e.g. the same view in two containers
                if (!element || element.localName !== tag || element.isConnected) {
                    element = createElement(tag);
                    host._elements[wid] = element;
                }
                element.socket = host.getSocket();
                element.settings = getSettings(component, values);
                element.theme = getTheme(el, values);
                element.editMode = !!vis.editMode;
                el.appendChild(element);
            })
            .catch(function (e) {
                logger.error('Cannot show <' + tag + '> from ' + component.moduleUrl + ': ' + (e && e.message ? e.message : e));
                if (host._renders[wid] === render) {
                    showMessage(el, word('cannotLoad', tag));
                }
            });
    };

    /**
     * Whether a web component still needs the state: vis does not unsubscribe it then when a view is left, the
     * socket of the components does it when they no longer need it
     *
     * @param {string} id the state
     * @returns {boolean}
     */
    host.adoptState = function (id) {
        return host._socket ? host._socket._adoptState(id) : false;
    };

    /** A state changed: called by vis.updateState() */
    host.onStateChange = function (id, state) {
        host._socket && host._socket._onStateChange(id, state);
    };

    /** An object changed: called for the objectChange of servConn */
    host.onObjectChange = function (id, obj) {
        host._socket && host._socket._onObjectChange(id, obj);
    };

    host.getSocket = function () {
        if (!host._socket) {
            host._socket = createSocket();
        }
        return host._socket;
    };

    /**
     * The connection for the elements: the part of `Connection` (@iobroker/socket-client) a component relies on
     * (`WebComponentSocket`), on top of servConn and the subscriptions of vis
     */
    function createSocket() {
        var stateHandlers = {}; // id or pattern -> [handler]
        var objectHandlers = {}; // id or pattern -> [handler]
        var ownStates = {}; // states subscribed at the server for the components, not for the views
        var ownObjects = {};
        var toSubscribe = []; // states to subscribe at the server, together in the next task
        // unsubscribed later together: an element that is only moved subscribes the same again at once
        var toUnsubscribe = {states: {}, objects: {}};
        var unsubscribeTimer = null;
        var batch = null;

        function toIds(ids) {
            return (Array.isArray(ids) ? ids : [ids]).filter(function (id) {
                return typeof id === 'string' && !!id;
            });
        }

        function getSocket() {
            return vis.conn && vis.conn._socket;
        }

        function notConnected() {
            return Promise.reject(new Error('not connected'));
        }

        function isPattern(id) {
            return id.indexOf('*') !== -1;
        }

        function matches(pattern, id) {
            return new RegExp('^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$').test(id);
        }

        function call(handlers, id, value) {
            if (!handlers) {
                return;
            }
            handlers = handlers.slice();
            for (var i = 0; i < handlers.length; i++) {
                try {
                    handlers[i](id, value);
                } catch (e) {
                    logger.error('Error in the handler of ' + id + ': ' + (e && e.stack ? e.stack : e));
                }
            }
        }

        function dispatch(all, id, value) {
            call(all[id], id, value);
            for (var key in all) {
                if (all.hasOwnProperty(key) && key !== id && isPattern(key) && matches(key, id)) {
                    call(all[key], id, value);
                }
            }
        }

        function isLocal(id) {
            return id.indexOf('local_') === 0;
        }

        // the editor has subscribed all states
        function isAutoSubscribed() {
            return !!(vis.conn && vis.conn._autoSubscribe);
        }

        function isSubscribedByVis(id) {
            return !!(vis.subscribing && vis.subscribing.active && vis.subscribing.active.indexOf(id) !== -1);
        }

        function subscribeAtServer(id) {
            if (toUnsubscribe.states[id]) {
                // still subscribed
                delete toUnsubscribe.states[id];
                return;
            }
            if (ownStates[id] || isLocal(id) || isAutoSubscribed() || isSubscribedByVis(id)) {
                return;
            }
            ownStates[id] = true;
            toSubscribe.push(id);
            if (toSubscribe.length === 1) {
                setTimeout(function () {
                    var ids = toSubscribe.filter(function (_id) {
                        return ownStates[_id];
                    });
                    toSubscribe = [];
                    ids.length && getSocket() && vis.conn.subscribe(ids);
                }, 0);
            }
        }

        function subscribeObjectAtServer(id) {
            if (toUnsubscribe.objects[id]) {
                delete toUnsubscribe.objects[id];
                return;
            }
            // the editor has subscribed all objects
            if (ownObjects[id] || vis.editMode || !getSocket()) {
                return;
            }
            ownObjects[id] = true;
            getSocket().emit('subscribeObjects', id);
        }

        function unsubscribeLater(kind, id) {
            toUnsubscribe[kind][id] = true;
            if (!unsubscribeTimer) {
                unsubscribeTimer = setTimeout(flushUnsubscribe, UNSUBSCRIBE_DELAY);
            }
        }

        function flushUnsubscribe() {
            unsubscribeTimer = null;
            var states = [];
            Object.keys(toUnsubscribe.states).forEach(function (id) {
                if (!stateHandlers[id]) {
                    delete ownStates[id];
                    // a view may have subscribed it meanwhile
                    !isSubscribedByVis(id) && states.push(id);
                }
            });
            var objects = Object.keys(toUnsubscribe.objects).filter(function (id) {
                if (objectHandlers[id]) {
                    return false;
                }
                delete ownObjects[id];
                return true;
            });
            toUnsubscribe = {states: {}, objects: {}};
            var socket = getSocket();
            if (socket) {
                states.length && vis.conn.unsubscribe(states);
                objects.forEach(function (id) {
                    socket.emit('unsubscribeObjects', id);
                });
            }
        }

        /** A local_ state lives only in this browser */
        function getLocalState(id) {
            function get(attr) {
                var key = id + '.' + attr;
                return vis.editMode ? vis.states[key] : vis.states.attr(key);
            }
            var val = get('val');
            if (val === undefined) {
                return null;
            }
            return {val: val, ack: !!get('ack'), ts: get('ts'), lc: get('lc'), q: get('q') || 0, from: ''};
        }

        /** The states of all components that ask in the same moment, with one request */
        function getStates(ids) {
            return new Promise(function (resolve) {
                if (!batch) {
                    batch = {ids: [], waiting: []};
                    setTimeout(flush, 0);
                }
                ids.forEach(function (id) {
                    batch.ids.indexOf(id) === -1 && batch.ids.push(id);
                });
                batch.waiting.push(resolve);
            });
        }

        function flush() {
            var current = batch;
            batch = null;
            var result = {};
            var remote = [];
            var patterns = [];
            current.ids.forEach(function (id) {
                if (isLocal(id)) {
                    var state = getLocalState(id);
                    state && (result[id] = state);
                } else if (isPattern(id)) {
                    patterns.push(id);
                } else {
                    remote.push(id);
                }
            });
            var requests = remote.length ? [remote] : [];
            patterns.forEach(function (pattern) {
                requests.push(pattern);
            });
            var count = requests.length;

            function done() {
                current.waiting.forEach(function (resolve) {
                    resolve(result);
                });
            }

            var socket = getSocket();
            if (!count || !socket) {
                return done();
            }
            requests.forEach(function (request) {
                socket.emit('getStates', request, function (err, states) {
                    if (!err && states) {
                        for (var id in states) {
                            if (states.hasOwnProperty(id) && states[id]) {
                                result[id] = states[id];
                            }
                        }
                    }
                    if (!--count) {
                        done();
                    }
                });
            });
        }

        function removeHandler(all, id, handler) {
            var list = all[id];
            if (!list) {
                return false;
            }
            if (handler) {
                var pos = list.indexOf(handler);
                pos !== -1 && list.splice(pos, 1);
            } else {
                list.length = 0;
            }
            if (!list.length) {
                delete all[id];
                return true;
            }
            return false;
        }

        var socket = {
            get systemLang() {
                return getLang();
            },

            subscribeState: function (ids, handler) {
                ids = toIds(ids);
                if (typeof handler !== 'function' || !ids.length) {
                    return Promise.resolve();
                }
                ids.forEach(function (id) {
                    var list = (stateHandlers[id] = stateHandlers[id] || []);
                    list.indexOf(handler) === -1 && list.push(handler);
                    subscribeAtServer(id);
                });
                // socket-client calls the handler with the current values too
                return getStates(ids).then(function (states) {
                    for (var id in states) {
                        if (!states.hasOwnProperty(id)) {
                            continue;
                        }
                        for (var i = 0; i < ids.length; i++) {
                            var list = stateHandlers[ids[i]];
                            if (list && list.indexOf(handler) !== -1 && (ids[i] === id || (isPattern(ids[i]) && matches(ids[i], id)))) {
                                call([handler], id, states[id]);
                                break;
                            }
                        }
                    }
                });
            },

            unsubscribeState: function (ids, handler) {
                toIds(ids).forEach(function (id) {
                    if (removeHandler(stateHandlers, id, handler) && ownStates[id]) {
                        unsubscribeLater('states', id);
                    }
                });
            },

            getState: function (id) {
                if (typeof id !== 'string' || !id) {
                    return Promise.resolve(null);
                }
                return getStates([id]).then(function (states) {
                    return states[id] || null;
                });
            },

            setState: function (id, val, ack) {
                // a SettableState: {val, ack, ...}
                if (val !== null && typeof val === 'object' && !Array.isArray(val) && val.hasOwnProperty('val')) {
                    if (val.ack !== undefined) {
                        ack = val.ack;
                    }
                    val = val.val;
                }
                if (ack && !isLocal(id)) {
                    if (!getSocket()) {
                        return notConnected();
                    }
                    return new Promise(function (resolve, reject) {
                        vis.conn.setState(id, {val: val, ack: true}, function (err) {
                            err ? reject(err instanceof Error ? err : new Error(String(err))) : resolve();
                        });
                    });
                }
                // as the widgets of vis do: debounced, the other widgets follow at once, local_ states too
                vis.setValue(id, val);
                return Promise.resolve();
            },

            getObject: function (id) {
                if (vis.editMode && vis.objects && vis.objects[id]) {
                    return Promise.resolve(vis.objects[id]);
                }
                if (!getSocket()) {
                    return notConnected();
                }
                return new Promise(function (resolve, reject) {
                    vis.conn.getObject(id, false, function (err, obj) {
                        err ? reject(err instanceof Error ? err : new Error(String(err))) : resolve(obj || null);
                    });
                });
            },

            subscribeObject: function (ids, handler) {
                if (typeof handler !== 'function') {
                    return Promise.resolve();
                }
                toIds(ids).forEach(function (id) {
                    var list = (objectHandlers[id] = objectHandlers[id] || []);
                    list.indexOf(handler) === -1 && list.push(handler);
                    subscribeObjectAtServer(id);
                });
                return Promise.resolve();
            },

            unsubscribeObject: function (ids, handler) {
                toIds(ids).forEach(function (id) {
                    if (removeHandler(objectHandlers, id, handler) && ownObjects[id]) {
                        unsubscribeLater('objects', id);
                    }
                });
                return Promise.resolve();
            },

            getHistory: function (id, options) {
                if (!getSocket()) {
                    return notConnected();
                }
                options = $.extend({}, options);
                // servConn gives up after 2 seconds by default
                options.timeout = options.timeout || 20000;
                return new Promise(function (resolve, reject) {
                    vis.conn.getHistory(id, options, function (err, result) {
                        err ? reject(err instanceof Error ? err : new Error(String(err))) : resolve(result || []);
                    });
                });
            },

            getObjectViewSystem: function (type, start, end) {
                var socket = getSocket();
                if (!socket) {
                    return notConnected();
                }
                return new Promise(function (resolve, reject) {
                    socket.emit('getObjectView', 'system', type, {startkey: start || '', endkey: end || '\u9999'}, function (err, res) {
                        if (err) {
                            reject(err instanceof Error ? err : new Error(String(err)));
                            return;
                        }
                        var result = {};
                        ((res && res.rows) || []).forEach(function (row) {
                            if (row && row.id) {
                                result[row.id] = row.value;
                            }
                        });
                        resolve(result);
                    });
                });
            },

            sendTo: function (instance, command, data) {
                if (!getSocket()) {
                    return notConnected();
                }
                return new Promise(function (resolve) {
                    vis.conn.sendTo(instance, command, data, function (result) {
                        resolve(result);
                    });
                });
            },

            _onStateChange: function (id, state) {
                // vis gives local_ states as {"<id>.val": ...}
                if (state && state.val === undefined && state[id + '.val'] !== undefined) {
                    state = {
                        val: state[id + '.val'],
                        ack: !!state[id + '.ack'],
                        ts: state.ts || state[id + '.ts'],
                        lc: state.lc || state[id + '.lc'],
                        q: 0,
                        from: ''
                    };
                }
                dispatch(stateHandlers, id, state);
            },

            _onObjectChange: function (id, obj) {
                dispatch(objectHandlers, id, obj);
            },

            _adoptState: function (id) {
                if (!stateHandlers[id] || isLocal(id)) {
                    return false;
                }
                ownStates[id] = true;
                return true;
            }
        };
        return socket;
    }

    vis.webComponents = host;
    vis.binds.webcomponents = {
        render: host.render,
        showMessage: showMessage
    };
})();
