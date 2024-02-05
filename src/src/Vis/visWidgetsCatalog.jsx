import { getRemoteWidgets } from './visUtils';
// eslint-disable-next-line import/no-cycle
import WIDGETS from './Widgets';

const DEFAULT_SET_COLORS = {
    basic: '#f1f1f1',
    bars: '#f6594e',
    dwd: '#cb8928',
    echarts: '#98B1C0',
    eventlist: '#c52699',
    hqwidgets: '#005067',
    jqplot: '#00e753',
    jqui: '#008be0',
    metro: '#9f8ad8',
    swipe: '#858585',
    tabs: '#00d5a3',
    'spotify-premium': '#00ae03',
};

class VisWidgetsCatalog {
    static rxWidgets = null;

    static allWidgetsList = null;

    static getUsedWidgetSets(project) {
        let anyWithoutSet = false;
        const widgetSets = [];

        // load in runtime only used widget sets
        const views = Object.keys(project);
        for (let v = 0; v < views.length; v++) {
            if (views[v] === '___settings') {
                continue;
            }
            const widgets = project[views[v]].widgets;
            const keys = Object.keys(widgets);
            for (let w = 0; w < keys.length; w++) {
                const widgetSet = widgets[keys[w]].widgetSet;
                if (!widgetSet || widgets[keys[w]].set || widgets[keys[w]].wSet) {
                    anyWithoutSet = true;
                    break;
                }
                if (!widgetSets.includes(widgetSet)) {
                    widgetSets.push(widgetSet);
                }
            }
            if (anyWithoutSet) {
                console.warn('Found widgets without widget set. Will load all widget sets');
                break;
            }
        }
        !anyWithoutSet && widgetSets.sort();

        return anyWithoutSet ? false : widgetSets;
    }

    static setUsedWidgetSets(project) {
        // provide for all widgets the widget set and set
        let views;
        const widgetTypes = window.visWidgetTypes; // getWidgetTypes();
        const viewKeys = Object.keys(project);

        for (let v = 0; v < viewKeys.length; v++) {
            if (viewKeys[v] === '___settings') {
                continue;
            }
            const widgets = project[viewKeys[v]].widgets;
            const keys = Object.keys(widgets);
            for (let w = 0; w < keys.length; w++) {
                // remove deprecated attributes
                if (widgets[keys[w]].set) {
                    views = views || JSON.parse(JSON.stringify(project));
                    delete views[viewKeys[v]].widgets[keys[w]].set;
                }
                if (widgets[keys[w]].wSet) {
                    views = views || JSON.parse(JSON.stringify(project));
                    delete views[viewKeys[v]].widgets[keys[w]].wSet;
                }
                if (widgets[keys[w]].widgetSet) {
                    continue;
                }
                const tpl = widgets[keys[w]].tpl;

                if (tpl === '_tplGroup') {
                    views = views || JSON.parse(JSON.stringify(project));
                    views[viewKeys[v]].widgets[keys[w]].widgetSet = 'basic';
                } else {
                    const tplWidget = widgetTypes.find(item => item.name === tpl);
                    if (tplWidget) {
                        views = views || JSON.parse(JSON.stringify(project));
                        views[viewKeys[v]].widgets[keys[w]].widgetSet = tplWidget.set;
                    }
                }
            }
        }

        return views;
    }

    static collectRxInformation(socket, project, changeProject) {
        if (!VisWidgetsCatalog.rxWidgets) {
            VisWidgetsCatalog.rxWidgets = {};
            // collect all widget sets used in a project
            let usedWidgetSets = null;
            if (project) {
                usedWidgetSets = VisWidgetsCatalog.getUsedWidgetSets(project);
            }

            return new Promise(resolve => {
                setTimeout(() =>
                    getRemoteWidgets(socket, !changeProject && usedWidgetSets)
                        .then(widgetSets => {
                            const collectedWidgets = [...WIDGETS, ...widgetSets];
                            collectedWidgets.forEach(Widget => {
                                if (!Widget.getWidgetInfo) {
                                    console.error(`Invalid widget without getWidgetInfo: ${Widget.constructor.name}`);
                                } else {
                                    const info = Widget.getWidgetInfo();
                                    if (!info.visSet) {
                                        console.error(`No visSet in info for "${Widget.constructor.name}"`);
                                    }

                                    if (!info.id) {
                                        console.error(`No id in info for "${Widget.constructor.name}"`);
                                    } else {
                                        VisWidgetsCatalog.rxWidgets[info.id] = Widget;
                                    }
                                }
                            });

                            // init all widgets
                            // eslint-disable-next-line no-use-before-define
                            getWidgetTypes(!changeProject && usedWidgetSets);

                            if (usedWidgetSets === false && changeProject) {
                                // some widgets without set found
                                const newProject = VisWidgetsCatalog.setUsedWidgetSets(project);
                                if (newProject) {
                                    console.warn('Found widgets without widget set. Project updated');
                                    changeProject(newProject);
                                }
                            }

                            resolve(VisWidgetsCatalog.rxWidgets);
                        }), 0);
            });
        }

        return Promise.resolve(VisWidgetsCatalog.rxWidgets);
    }
}

export const getWidgetTypes = usedWidgetSets => {
    if (!window.visWidgetTypes) {
        window.visSets = {};
        VisWidgetsCatalog.allWidgetsList = [];

        // Old CanJS widgets
        window.visWidgetTypes = Array.from(document.querySelectorAll('script[type="text/ejs"]'))
            .map(script => {
                const name = script.attributes.id.value;
                // only if RX widget with the same name not found
                let info;
                if (VisWidgetsCatalog.rxWidgets[name] && VisWidgetsCatalog.rxWidgets[name].getWidgetInfo) {
                    info = VisWidgetsCatalog.rxWidgets[name].getWidgetInfo();
                    if (info?.visAttrs && typeof info.visAttrs !== 'string') {
                        return null;
                    }
                }

                const widgetSet = script.attributes['data-vis-set'] ? script.attributes['data-vis-set'].value : 'basic';
                if (usedWidgetSets && !usedWidgetSets.includes(widgetSet)) {
                    console.log(`Ignored ${widgetSet}/${name} because not used in project`);
                    return null;
                }

                const color = script.attributes['data-vis-color']?.value;
                window.visSets[widgetSet] = window.visSets[widgetSet] || {};
                if (color) {
                    window.visSets[widgetSet].color = color;
                } else if (!window.visSets[widgetSet].color && DEFAULT_SET_COLORS[widgetSet]) {
                    window.visSets[widgetSet].color = DEFAULT_SET_COLORS[widgetSet];
                }
                const widgetObj = {
                    name,
                    title: info?.visName || script.attributes['data-vis-name']?.value,
                    label: info?.visWidgetLabel ? info.visWidgetLabel : (info?.visWidgetLabel === '' ? '' : undefined), // new style with translation
                    preview: info?.visPrev || script.attributes['data-vis-prev']?.value,
                    help: script.attributes['data-vis-help']?.value,
                    set: info?.visSet || widgetSet,
                    imageHTML: script.attributes['data-vis-prev'] ? script.attributes['data-vis-prev'].value : '',
                    init: script.attributes['data-vis-init']?.value,
                    color: info?.visWidgetColor || undefined,
                    params: info?.visAttrs || Object.values(script.attributes)
                        .filter(attribute => attribute.name.startsWith('data-vis-attrs'))
                        .map(attribute => attribute.value)
                        .join(''),
                    setLabel: info?.visSetLabel || undefined,
                    setColor: info?.visSetColor || undefined,
                    order: info?.visOrder === undefined || info?.visOrder === null ? 1000 : parseInt(info.visOrder, 10),
                    hidden: script.attributes['data-vis-no-palette']?.value === 'true',
                };

                VisWidgetsCatalog.allWidgetsList.push(widgetObj.name);

                return widgetObj;
            }).filter(w => w);

        // React widgets
        Object.values(VisWidgetsCatalog.rxWidgets).forEach(widget => {
            const widgetInfo = widget.getWidgetInfo();
            const i18nPrefix = widget.i18nPrefix || '';

            const widgetObj = {
                name: widgetInfo.id,
                preview: widgetInfo.visPrev,
                title: widgetInfo.visName, // old style without translation
                params: widgetInfo.visAttrs,
                set: widgetInfo.visSet,
                style: widgetInfo.visDefaultStyle,
                label: widgetInfo.visWidgetLabel ? i18nPrefix + widgetInfo.visWidgetLabel : (widgetInfo.visWidgetLabel === '' ? '' : undefined), // new style with translation
                setLabel: widgetInfo.visSetLabel ? i18nPrefix + widgetInfo.visSetLabel : undefined, // new style with translation
                setColor: widgetInfo.visSetColor,
                setIcon: widgetInfo.visSetIcon,
                color: widgetInfo.visWidgetColor,
                resizable: widgetInfo.visResizable,
                resizeLocked: widgetInfo.visResizeLocked,
                draggable: widgetInfo.visDraggable,
                adapter: widget.adapter || undefined,
                version: widget.version || undefined,
                hidden: widget.visHidden,
                order: widgetInfo.visOrder === undefined ? 1000 : widgetInfo.visOrder,
                custom: widgetInfo.custom,
                customPalette: widgetInfo.customPalette,
                rx: true,
                developerMode: widget.url?.startsWith('http://'),
                i18nPrefix,
            };
            !VisWidgetsCatalog.allWidgetsList.includes(widgetObj.name) && VisWidgetsCatalog.allWidgetsList.push(widgetObj.name);

            const index = window.visWidgetTypes.findIndex(item => item.name === widgetObj.name);
            if (index > -1) {
                window.visWidgetTypes[index] = widgetObj; // replace old widget with RX widget
            } else {
                window.visWidgetTypes.push(widgetObj);
            }

            if (i18nPrefix && typeof widgetInfo.visAttrs === 'object') {
                widgetInfo.visAttrs.forEach(group => {
                    if (group.label && !group.label.startsWith(i18nPrefix)) {
                        group.label = i18nPrefix + group.label;
                    }
                    if (group.fields) {
                        group.fields.forEach(field => {
                            if (field.label && !field.label.startsWith(i18nPrefix)) {
                                field.label = i18nPrefix + field.label;
                            }
                            if (field.tooltip && !field.tooltip.startsWith(i18nPrefix)) {
                                field.tooltip = i18nPrefix + field.tooltip;
                            }
                            if (field.options && !field.noTranslation && Array.isArray(field.options)) {
                                field.options.forEach(option => {
                                    if (typeof option === 'object') {
                                        if (option.label && !option.label.startsWith(i18nPrefix)) {
                                            option.label = i18nPrefix + option.label;
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    return window.visWidgetTypes;
};

const deepClone = obj => {
    const newObj = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (obj[key] !== undefined) {
            if (Array.isArray(obj[key]) || typeof obj[key] === 'object') {
                // If it is ReactJS object
                if (Object.prototype.hasOwnProperty.call(obj, '$$typeof')) {
                    newObj[key] = obj[key];
                } else {
                    newObj[key] = deepClone(obj[key]);
                }
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    return newObj;
};

export const parseAttributes = (widgetParams, widgetIndex, commonGroups, commonFields, widgetSet, widgetData) => {
    if (typeof widgetParams === 'string') {
        let groupName = 'common';
        let indexedGroups = {};
        let isIndexedGroup = false;
        commonGroups = commonGroups || { common: 1 };
        commonFields = commonFields || {};
        const fields = [{
            name: 'common',
            singleName: 'common',
            fields: [],
        }];
        let currentGroup = fields[0];

        widgetParams.split(';').forEach(fieldString => {
            if (!fieldString) {
                return;
            }
            if (fieldString.split('/')[0].startsWith('group.')) {
                groupName = fieldString.split('/')[0].split('.')[1];
                if (widgetIndex > 0 && commonGroups && !commonGroups[groupName]) {
                    return;
                }
                indexedGroups = {};
                if (fieldString.split('/')[1] !== 'byindex') {
                    currentGroup = fields.find(group => group.name === groupName);
                    if (!currentGroup) {
                        fields.push(
                            {
                                name: groupName,
                                singleName: groupName,
                                fields: [],
                            },
                        );
                        currentGroup = fields[fields.length - 1];
                    }
                    if (!commonGroups[groupName]) {
                        commonGroups[groupName] = 0;
                    }
                    commonGroups[groupName]++;
                    isIndexedGroup = false;
                } else {
                    isIndexedGroup = true;
                }
            } else {
                const match = fieldString.match(/([a-zA-Z0-9._-]+)(\([a-zA-Z.0-9-_]*\))?(\[.*])?(\/[-_,^§~\s:/.a-zA-Z0-9]+)?/);

                const repeats = match[2];
                const [type, onChangeFunc] = match[4] ? match[4].substring(1).split('/') : [];
                const field = {
                    name: match[1],
                    default: match[3] ? match[3].substring(1, match[3].length - 1) : undefined, // remove []
                    type,
                    onChangeFunc,
                };

                if (field.type) {
                    field.type = field.type
                        .replace(/§/g, ';')
                        .replace(/~/g, '/')
                        .replace(/\^/g, '"')
                        .replace(/\^\^/g, '^');
                }
                if (field.default) {
                    field.default = field.default
                        .replace(/§/g, ';')
                        .replace(/~/g, '/')
                        .replace(/\^/g, '"')
                        .replace(/\^\^/g, '^');
                }

                // special case for Object ID filter
                if (field.onChangeFunc && field.onChangeFunc.startsWith('filterType')) {
                    field.filter = field.onChangeFunc.substring('filterType'.length).toLowerCase();
                    delete field.onChangeFunc;
                }

                if (widgetIndex > 0 && !repeats && commonFields && !commonFields[`${groupName}.${field.name}`]) {
                    return;
                }

                if (field.name === 'oid' || field.name.match(/^oid-/)) {
                    field.type = field.type || 'id';
                } else if (field.name === 'color') {
                    field.type = 'color';
                } else if (field.name.match(/nav_view$/)) {
                    field.type = 'views';
                } else if (field.name === 'sound') {
                    field.type = 'sound';
                } else if (field.name.includes('_effect')) {
                    field.type = 'effect';
                } else if (field.name.includes('_eff_opt')) {
                    field.type = 'effect-options';
                }

                if (field.type && (field.type.startsWith('id,'))) {
                    [field.type, field.filter] = field.type.split(','); // options
                }
                if (field.type && (field.type.startsWith('select,') || field.type.startsWith('nselect,') || field.type.startsWith('auto,'))) {
                    const options = field.type.split(',');
                    [field.type] = options;
                    field.options = options.slice(1);
                }
                if (field.type && (field.type.startsWith('slider,') || field.type.startsWith('number,'))) {
                    const options = field.type.split(',');
                    field.type = options[0];
                    field.min = parseInt(options[1]);
                    field.max = parseInt(options[2]);
                    field.step = parseInt(options[3]);
                    if (!field.step) {
                        field.step = (field.max - field.min / 100);
                    }
                }
                if (field.type && field.type.startsWith('style,')) {
                    const options = field.type.split(',');
                    field.type = options[0];
                    field.filterFile = options[1];
                    field.filterName = options[2];
                    field.filterAttrs = options[3];
                    field.removeName = options[4];
                    if (!field.step) {
                        field.step = (field.max - field.min / 100);
                    }
                }
                // remove comma from type
                if (field.type?.startsWith('style,')) {
                    console.warn(`Attribute "${field.name}" of ${widgetSet} has wrong type: ${field.type}`);
                    field.type = field.type.split(',')[0];
                }

                field.singleName = field.name;
                field.set = widgetSet;
                if (repeats) {
                    const repeatsMatch = repeats.match(/\(([0-9a-z_]+)-([0-9a-z_]+)\)/i);
                    const name = field.name;
                    if (repeatsMatch) {
                        if (!repeatsMatch[1].match(/^[0-9]$/)) {
                            repeatsMatch[1] = widgetData ? parseInt(widgetData[repeatsMatch[1]]) : 0;
                        }
                        if (!repeatsMatch[2].match(/^[0-9]$/)) {
                            repeatsMatch[2] = widgetData ? parseInt(widgetData[repeatsMatch[2]]) : 0;
                        }
                        for (let i = repeatsMatch[1]; i <= repeatsMatch[2]; i++) {
                            if (isIndexedGroup) {
                                if (widgetIndex > 0 && !commonGroups[`${groupName}-${i}`]) {
                                    return;
                                }
                                if (widgetIndex > 0 && !commonFields[`${groupName}-${i}.${field.name}`]) {
                                    return;
                                }
                                if (!indexedGroups[i]) {
                                    currentGroup = {
                                        name: `${groupName}-${i}`,
                                        singleName: groupName,
                                        index: i,
                                        fields: [],
                                    };
                                    indexedGroups[i] = currentGroup;
                                    fields.push(currentGroup);
                                }
                                if (!commonGroups[`${groupName}-${i}`]) {
                                    commonGroups[`${groupName}-${i}`] = 0;
                                }
                                commonGroups[`${groupName}-${i}`]++;

                                field.name = `${name}${i}`;
                                indexedGroups[i].fields.push({ ...field });
                                if (!commonFields[`${groupName}-${i}.${field.name}`]) {
                                    commonFields[`${groupName}-${i}.${field.name}`] = 0;
                                }
                                commonFields[`${groupName}-${i}.${field.name}`]++;
                            } else {
                                field.name = `${name}${i}`;
                                field.index = i;
                                currentGroup.fields.push({ ...field });
                                if (!commonFields[`${groupName}.${field.name}`]) {
                                    commonFields[`${groupName}.${field.name}`] = 0;
                                }
                                commonFields[`${groupName}.${field.name}`]++;
                            }
                        }
                    }
                } else {
                    currentGroup.fields.push(field);
                    if (!commonFields[`${groupName}.${field.name}`]) {
                        commonFields[`${groupName}.${field.name}`] = 0;
                    }
                    commonFields[`${groupName}.${field.name}`]++;
                }
            }
        });

        return fields;
    }

    if (Array.isArray(widgetParams)) {
        commonGroups = commonGroups || { common: 1 };
        commonFields = commonFields || {};
        const fields = deepClone(widgetParams);
        let groupIndex = fields.findIndex(group => typeof group.indexFrom === 'number');

        while (groupIndex > -1) {
            const group = fields[groupIndex];
            group.singleName = group.name;
            let from;
            let indexFrom;
            if (Number.isInteger(group.indexFrom)) {
                from = group.indexFrom;
            } else {
                from = parseInt(widgetData?.[group.indexFrom]);
                indexFrom = from;
            }
            let to;
            let indexTo;
            if (Number.isInteger(group.indexTo)) {
                to = group.indexTo;
            } else {
                to = parseInt(widgetData?.[group.indexTo]);
                indexTo = group.indexTo;
            }
            delete group.indexFrom;
            delete group.indexTo;
            const indexedGroups = [];

            for (let i = from; i <= to; i++) {
                const indexedGroup = {
                    ...deepClone(group),
                    index: i,
                    name: `${group.singleName}-${i}`,
                    iterable: {
                        group: group.singleName,
                        isFirst: i === from,
                        isLast: i === to,
                        indexTo,
                        indexFrom,
                    },
                };
                indexedGroup.fields.forEach((field, ii) => {
                    field.singleName = field.name;
                    field.name = `${field.name}${i}`;
                    field.index = i;
                    if (typeof group.fields[ii].hidden === 'function') {
                        field.hidden = group.fields[ii].hidden;
                    }
                    if (typeof group.fields[ii].component === 'function') {
                        field.component = group.fields[ii].component;
                    }
                    if (typeof group.fields[ii].onChange === 'function') {
                        field.onChange = group.fields[ii].onChange;
                    }
                    if (typeof group.fields[ii].disabled === 'function') {
                        field.disabled = group.fields[ii].disabled;
                    }
                    if (typeof group.fields[ii].error === 'function') {
                        field.error = group.fields[ii].error;
                    }
                });

                indexedGroups.push(indexedGroup);
            }
            fields.splice(groupIndex, 1, ...indexedGroups);
            groupIndex = fields.findIndex(_group => _group.indexFrom);
        }
        fields.forEach(group => {
            if (!group.singleName) {
                group.singleName = group.name;
            }
            if (!commonGroups[group.name]) {
                commonGroups[group.name] = 0;
            }
            commonGroups[group.name]++;
            let fieldIndex = group.fields.findIndex(field => field.indexFrom);
            while (fieldIndex > -1) {
                const field = group.fields[fieldIndex];
                field.singleName = field.name;
                let from;
                let indexFrom;
                if (Number.isInteger(field.indexFrom)) {
                    from = field.indexFrom;
                } else {
                    from = parseInt(widgetData?.[field.indexFrom]);
                    indexFrom = from;
                }
                let to;
                let indexTo;
                if (Number.isInteger(field.indexTo)) {
                    to = field.indexTo;
                } else {
                    to = parseInt(widgetData?.[field.indexTo]);
                    indexTo = field.indexTo;
                }
                delete field.indexFrom;
                delete field.indexTo;
                const indexedFields = [];
                for (let i = from; i <= to; i++) {
                    const indexedField = {
                        ...deepClone(field),
                        index: i,
                        name: `${field.singleName}${i}`,
                        iterable: {
                            group: field.singleName,
                            isFirst: i === from,
                            isLast: i === to,
                            indexFrom,
                            indexTo,
                        },
                    };
                    indexedFields.push(indexedField);
                }

                group.fields.splice(fieldIndex, 1, ...indexedFields);

                fieldIndex = group.fields.findIndex(_field => _field.indexFrom);
            }

            group.fields.forEach(field => {
                if (!field.singleName) {
                    field.singleName = field.name;
                }
                field.set = widgetSet;
                if (!commonFields[`${group.name}.${field.name}`]) {
                    commonFields[`${group.name}.${field.name}`] = 0;
                }
                commonFields[`${group.name}.${field.name}`]++;
            });
        });

        return fields;
    }

    return null;
};

export default VisWidgetsCatalog;
