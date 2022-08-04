import { useEffect, useRef } from 'react';
import { usePreview } from 'react-dnd-preview';
import VisView from './Vis/visView';

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

export const getWidgetTypes = () => {
    if (!window.visWidgetTypes) {
        window.visSets = {};

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

                return {
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
            });

        Object.values(VisView.widgets).forEach(widget => {
            const widgetInfo = widget.getWidgetInfo();

            window.visWidgetTypes.push({
                name: widgetInfo.id,
                preview: widgetInfo.visPrev,
                title: widgetInfo.visName,
                params: widgetInfo.visAttrs,
                set: widgetInfo.visSet,
                style: widgetInfo.visDefaultStyle,
                label: widgetInfo.visWidgetLabel,
                setLabel: widgetInfo.visSetLabel,
                setColor: widgetInfo.visSetColor,
                color: widgetInfo.visWidgetColor,
                resizable: widgetInfo.visResizable,
                resizeLocked: widgetInfo.visResizeLocked,
                draggable: widgetInfo.visDraggable,
            });
        });
    }

    return window.visWidgetTypes;
};

const deepClone = obj => {
    const newObj = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (obj[key] !== undefined) {
            if (Array.isArray(obj[key]) || typeof obj[key] === 'object') {
                newObj[key] = deepClone(obj[key]);
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
                    ...JSON.parse(JSON.stringify(group)),
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
                        ...JSON.parse(JSON.stringify(field)),
                        index: i,
                        name: `${field.singleName}${i}`,
                    };
                    if (typeof field.hidden === 'function') {
                        indexedField.hidden = field.hidden;
                    }
                    if (typeof field.disabled === 'function') {
                        indexedField.disabled = field.disabled;
                    }
                    if (typeof field.error === 'function') {
                        indexedField.error = field.error;
                    }
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

export const DndPreview = () => {
    const { display/* , itemType */, item, style } = usePreview();
    if (!display) {
        return null;
    }
    return <div style={{ ...style, zIndex: 1000 }}>{item.preview}</div>;
};

export function mobileCheck() {
    let check = false;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series([46])0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br([ev])w|bumb|bw-([nu])|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do([cp])o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly([-_])|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-([mpt])|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c([- _agpst])|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac([ \-/])|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja([tv])a|jbro|jemu|jigs|kddi|keji|kgt([ /])|klon|kpt |kwc-|kyo([ck])|le(no|xi)|lg( g|\/([klu])|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t([- ov])|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30([02])|n50([025])|n7(0([01])|10)|ne(([cm])-|on|tf|wf|wg|wt)|nok([6i])|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan([adt])|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c([-01])|47|mc|nd|ri)|sgh-|shar|sie([-m])|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel([im])|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c([- ])|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i
            .test(userAgent.substr(0, 4))
    ) {
        check = true;
    }
    return check;
}

export function isTouchDevice() {
    if (!mobileCheck()) {
        return false;
    }
    return (('ontouchstart' in window)
        || (navigator.maxTouchPoints > 0)
        || (navigator.msMaxTouchPoints > 0));
}

export const analyzeDraggableResizable = (el, result, widgetStyle) => {
    result = result || {};
    result.resizable = true;
    result.draggable = true;

    if (el && el.dataset) {
        let resizableOptions = el.dataset.visResizable;
        if (resizableOptions) {
            try {
                resizableOptions = JSON.parse(resizableOptions);
            } catch (error) {
                console.error(`Cannot parse resizable options by ${el.getAttribute('id')}: ${resizableOptions}`);
                resizableOptions = null;
            }
            if (resizableOptions) {
                if (resizableOptions.disabled !== undefined) {
                    result.resizable = !resizableOptions.disabled;
                }
                if (resizableOptions.handles !== undefined) {
                    result.resizeHandles = resizableOptions.handles.split(',').map(h => h.trim());
                }
            }
            if (widgetStyle && !result.resizable && (!widgetStyle.width || !widgetStyle.height)) {
                result.virtualHeight = el.clientHeight;
                result.virtualWidth = el.clientWidth;
            }
        }

        let draggableOptions = el.dataset.visDraggable;
        if (draggableOptions) {
            try {
                draggableOptions = JSON.parse(draggableOptions);
            } catch (error) {
                console.error(`Cannot parse draggable options by ${el.getAttribute('id')}: ${draggableOptions}`);
                draggableOptions = null;
            }
            if (draggableOptions) {
                if (draggableOptions.disabled !== undefined) {
                    result.draggable = !draggableOptions.disabled;
                }
            }
        }

        result.hideHelper = el.dataset.visHideHelper === 'true';
    }
    return result;
};

export const useFocus = (open, select, isAce) => {
    const inputField = useRef(null);

    useEffect(() => {
        let interval;
        if (open) {
            interval = setInterval(() => {
                if (isAce ? inputField.current?.editor : inputField.current) {
                    isAce ? inputField.current.editor.focus() : inputField.current.focus();
                    if (select) {
                        isAce ? inputField.current.editor.selectAll() : inputField.current.select();
                    }
                    clearInterval(interval);
                }
            }, 100);
        }
        return () => clearInterval(interval);
    }, [open]);

    return inputField;
};
