import { getRemoteWidgets } from './visUtils';
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

    static collectRxInformation(socket) {
        if (!VisWidgetsCatalog.rxWidgets) {
            VisWidgetsCatalog.rxWidgets = {};
            return new Promise(resolve => {
                setTimeout(() =>
                    getRemoteWidgets(socket)
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
                            getWidgetTypes(socket);

                            resolve(VisWidgetsCatalog.rxWidgets);
                        }), 0);
            });
        }

        return Promise.resolve(VisWidgetsCatalog.rxWidgets);
    }
}

export const getWidgetTypes = () => {
    if (!window.visWidgetTypes) {
        window.visSets = {};
        VisWidgetsCatalog.allWidgetsList = [];

        // Old CanJS widgets
        window.visWidgetTypes = Array.from(document.querySelectorAll('script[type="text/ejs"]'))
            .map(script => {
                const widgetSet = script.attributes['data-vis-set'] ? script.attributes['data-vis-set'].value : 'basic';
                const color = script.attributes['data-vis-color']?.value;
                window.visSets[widgetSet] = window.visSets[widgetSet] || {};
                if (color) {
                    window.visSets[widgetSet].color = color;
                } else if (!window.visSets[widgetSet].color && DEFAULT_SET_COLORS[widgetSet]) {
                    window.visSets[widgetSet].color = DEFAULT_SET_COLORS[widgetSet];
                }
                const widgetObj = {
                    name: script.attributes.id.value,
                    title: script.attributes['data-vis-name']?.value,
                    preview: script.attributes['data-vis-prev']?.value,
                    help: script.attributes['data-vis-help']?.value,
                    set: widgetSet,
                    imageHTML: script.attributes['data-vis-prev'] ? script.attributes['data-vis-prev'].value : '',
                    init: script.attributes['data-vis-init']?.value,
                    params: Object.values(script.attributes)
                        .filter(attribute => attribute.name.startsWith('data-vis-attrs'))
                        .map(attribute => attribute.value)
                        .join(''),
                };

                VisWidgetsCatalog.allWidgetsList.push(widgetObj.name);

                return widgetObj;
            });

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
                label: widgetInfo.visWidgetLabel ? i18nPrefix + widgetInfo.visWidgetLabel : undefined, // new style with translation
                setLabel: widgetInfo.visSetLabel ? i18nPrefix + widgetInfo.visSetLabel : undefined, // new style with translation
                setColor: widgetInfo.visSetColor,
                color: widgetInfo.visWidgetColor,
                resizable: widgetInfo.visResizable,
                resizeLocked: widgetInfo.visResizeLocked,
                draggable: widgetInfo.visDraggable,
                adapter: widget.adapter || undefined,
                i18nPrefix,
            };
            VisWidgetsCatalog.allWidgetsList.push(widgetObj.name);

            window.visWidgetTypes.push();
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
                if (Object.hasOwn(obj, '$$typeof')) {
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

                const field = {
                    name: match[1],
                    default: match[3] ? match[3].substring(1, match[3].length - 1) : undefined,
                    type: match[4] ? match[4].substring(1).split('/')[0] : undefined,
                    onChangeFunc: match[4] ? match[4].substring(1).split('/')[1] : undefined,
                };

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
                } else
                if (field.name === 'sound') {
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
        let groupIndex = fields.findIndex(group => group.indexFrom);
        while (groupIndex > -1) {
            const group = fields[groupIndex];
            group.singleName = group.name;
            const from = Number.isInteger(group.indexFrom) ? group.indexFrom : widgetData?.[group.indexFrom];
            const to = Number.isInteger(group.indexTo) ? group.indexTo : widgetData?.[group.indexTo];
            delete group.indexFrom;
            delete group.indexTo;
            const indexedGroups = [];
            for (let i = from; i <= to; i++) {
                const indexedGroup = {
                    ...deepClone(group),
                    index: i,
                    name: `${group.singleName}-${i}`,
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
                const from = Number.isInteger(field.indexFrom) ? field.indexFrom : parseInt(widgetData?.[field.indexFrom]);
                const to = Number.isInteger(field.indexTo) ? field.indexTo : parseInt(widgetData?.[field.indexTo]);
                delete field.indexFrom;
                delete field.indexTo;
                const indexedFields = [];
                for (let i = from; i <= to; i++) {
                    const indexedField = {
                        ...deepClone(field),
                        index: i,
                        name: `${field.singleName}${i}`,
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
