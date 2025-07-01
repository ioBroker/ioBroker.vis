import type React from 'react';

import type { LegacyConnection, ThemeType, ObjectBrowserCustomFilter } from '@iobroker/adapter-react-v5';
import type {
    GroupWidgetId,
    Project,
    RxWidgetInfoGroup,
    SingleWidgetId,
    CustomPaletteProperties,
    RxWidgetInfoAttributesField,
    WidgetData,
    RxWidgetAttributeType,
    Widget,
    WidgetStyle,
    VisTheme,
    AnyWidgetId,
} from '@iobroker/types-vis-2';
import type VisRxWidget from '@/Vis/visRxWidget';

import { getRemoteWidgets, type VisRxWidgetWithInfo } from './visLoadWidgets';
import WIDGETS from './Widgets';

const DEFAULT_SET_COLORS: Record<string, string> = {
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

export interface RxFieldOption {
    readonly value: string;
    readonly label: string;
    readonly icon?: string;
    readonly color?: string;
}

export type RxWidgetInfoAttributesFieldAll = {
    /** Field type */
    type?: RxWidgetAttributeType;
    /** Used by counted fields */
    index?: number;
    /** Field default value */
    default?: string | number | boolean;
    /** If sizes should be deleted or set to specific value. `false` - delete sizes, or {width: 100, height: 100} */
    desiredSize?: { width: number; height: number } | boolean;
    /** if true, no edit button will be shown. Default is true. */
    readonly noButton?: boolean;
    /** do not wait 300 ms after the value was changed to redraw the widget */
    readonly immediateChange?: boolean;
    /** if true, the text will not be translated  */
    readonly noTranslation?: boolean;
    /** this style will be applied to the text */
    readonly style?: React.CSSProperties;
    /** show multi-line editor */
    readonly multiline?: boolean;
    /** Do not write 'nothing_selected' into the field by creation */
    readonly noInit?: boolean;
    /** Do not subscribe on changes of the object */
    readonly noSubscribe?: boolean;
    /**
     * Filter of objects (not JSON string, it is an object), like:
     - `{common: {custom: true}}` - show only objects with some custom settings
     - `{common: {custom: 'sql.0'}}` - show only objects with sql.0 custom settings (only of the specific instance)
     - `{common: {custom: '_dataSources'}}` - show only objects of adapters `influxdb' or 'sql' or 'history'
     - `{common: {custom: 'adapterName.'}}` - show only objects of the custom settings for specific adapter (all instances)
     - `{type: 'channel'}` - show only channels
     - `{type: ['channel', 'device']}` - show only channels and devices
     - `{common: {type: 'number'}` - show only states of type 'number
     - `{common: {type: ['number', 'string']}` - show only states of type 'number and string
     - `{common: {role: 'switch'}` - show only states with roles starting from switch
     - `{common: {role: ['switch', 'button']}` - show only states with roles starting from `switch` and `button`
     */
    filter?:
        | ObjectBrowserCustomFilter
        // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
        | ioBroker.ObjectType
        | ((data: WidgetData, index: number) => Record<string, any>)
        | string;
    /** Additionally, you can provide `adapter` to filter the instances of specific adapter. With special adapter name `_dataSources` you can get all adapters with flag `common.getHistory`. */
    readonly adapter?: string;
    /** Additionally, you can provide `adapters` to filter the instances of specific adapters. */
    readonly adapters?: string[];
    /** In this case, only instance number (like `0`) is shown and not `history.0`. It can be set to true only with non-empty `adapter` setting. */
    readonly isShort?: boolean;
    /** Options for a select type */
    options?: RxFieldOption[] | string[];
    /** Number min value */
    min?: number;
    /** Number max value */
    max?: number;
    /** Number step */
    step?: number;
    /** Slider marks?: array of possible marks. Like `[{value: 1, label: 'one'}, {value: 10}, {value: 100}] */
    readonly marks?: { readonly value: number; readonly label: string }[] | boolean;
    /** Controls when the value label is displayed: `auto` the value label will display when the thumb is hovered or focused. `on` will display persistently. `off` will never display. */
    readonly valueLabelDisplay?: 'on' | 'off' | 'auto';
    /** type of the widget, like `tplMaterial2Switches` */
    readonly tpl?: string;
    /** if true, all widgets of all views will be shown, not only from the current view. Default is false. */
    readonly all?: boolean;
    /**  if true, grouped widgets will be shown too. Default is false. */
    readonly withGroups?: boolean;
    /** if true, the current widget will be shown in the list too. */
    readonly withSelf?: boolean;
    /** if true, it will be checked if the widget is used somewhere else and user will be asked. */
    readonly checkUsage?: boolean;
    /** if true, only widgets will be shown, which are not used in some view. Default is false. */
    readonly hideUsed?: boolean;
    /** if false, only one view can be selected. Default is true. */
    readonly multiple?: boolean;
    /** show clear button near the field */
    readonly clearButton?: boolean;
    /** if false, only one view can be selected. Default is true. */
    component?: (
        field: RxWidgetInfoAttributesField,
        data: WidgetData,
        onDataChange: (newData: WidgetData) => void,
        props: {
            context: {
                socket: LegacyConnection;
                projectName: string;
                instance: number;
                adapterName: string;
                views: Project;
                theme: VisTheme;
            };
            Editor?: React.FC<{ field: RxWidgetInfoAttributesFieldAll; index?: number; disabled?: boolean }>;
            selectedView: string;
            selectedWidgets: AnyWidgetId[];
            selectedWidget: `w${string}` | `g${string}`;
        },
    ) => React.JSX.Element | React.JSX.Element[];

    /** i18n help text - This text will be shown without a label */
    readonly text?: string;
    /** Name of the widget field */
    name: string;
    /** Field label (i18n) */
    label?: string;
    /** JS Function for conditional visibility */
    hidden?: string | ((data: Record<string, any>, index?: number, style?: React.CSSProperties) => boolean) | boolean;
    /** Tooltip (i18n) */
    tooltip?: string;
    /** JS Function for conditional disability */
    disabled?: string | ((data: Record<string, any>, index?: number, style?: React.CSSProperties) => boolean) | boolean;
    /** JS Function for error */
    error?: string | ((data: Record<string, any>, index?: number, style?: React.CSSProperties) => boolean);
    /** Do not show binding symbol fot this field */
    readonly noBinding?: boolean;
    /** Callback called if the field value changed */
    onChange?: (
        field: RxWidgetInfoAttributesField,
        data: Record<string, any>,
        changeData: (newData: Record<string, any>) => void,
        socket: LegacyConnection,
        index?: number,
    ) => Promise<void> | string;
};

export interface WidgetAttributeInfoStored extends RxWidgetInfoAttributesFieldAll {
    onChangeFunc?: string;
    filterFile?: string;
    filterName?: string;
    filterAttrs?: string;
    removeName?: string;
    singleName?: string;
    set?: string;
    index?: number;
    indexFrom?: string | number;
    indexTo?: string | number;
    iterable?: {
        group: string;
        isFirst: boolean;
        isLast: boolean;
        indexTo: number | string | undefined;
        indexFrom: number | string | undefined;
    };
}
export interface WidgetAttributeIterable {
    group: string;
    isFirst: boolean;
    isLast: boolean;
    indexTo: number | string | undefined;
    indexFrom: number | string | undefined;
}

export interface WidgetAttributesGroupInfoStored {
    name?: string;
    label?: string;
    singleName?: string;
    index?: number;
    hidden?: string | ((data: Record<string, any>, index: number, style: React.CSSProperties) => boolean) | boolean;
    fields?: RxWidgetInfoAttributesFieldAll[];
    indexFrom?: number | string;
    indexTo?: number | string;
    iterable?: WidgetAttributeIterable;
}

export interface WidgetType {
    name: string;
    title?: string;
    label?: string;
    preview?: string;
    help?: string;
    set?: string;
    imageHTML?: string;
    init?: string;
    color?: string;
    resizable?: boolean;
    resizeLocked?: boolean;
    draggable?: boolean;
    params:
        | string
        | readonly RxWidgetInfoGroup[]
        | ((
              data: WidgetData,
              ignore: null,
              context: {
                  views: Project;
                  view: string;
                  socket: LegacyConnection;
                  themeType: ThemeType;
                  projectName: string;
                  adapterName: string;
                  instance: number;
                  id: string;
                  widget: Widget;
              },
          ) => RxWidgetInfoGroup[]);

    setLabel?: string;
    setColor?: string;
    setIcon?: string;

    order?: number;
    hidden?: boolean;
    style?: WidgetStyle;
    customPalette?: (context: CustomPaletteProperties) => React.JSX.Element;

    adapter?: string;
    version?: string;
    rx?: boolean;
    developerMode?: boolean;
    i18nPrefix?: string;
}

interface VisRxWidgetLoaded extends VisRxWidget<any> {
    readonly i18nPrefix?: string | undefined;
    readonly adapter?: string;
    readonly version?: string;
    readonly visHidden?: boolean;
    readonly url?: string;
    readonly setIcon?: string;
}

export const getWidgetTypes = (usedWidgetSets?: string[]): WidgetType[] => {
    if (!window.visWidgetTypes) {
        window.visSets = {};
        VisWidgetsCatalog.allWidgetsList = [];

        if (!VisWidgetsCatalog.rxWidgets) {
            return [];
        }

        // Old CanJS widgets
        window.visWidgetTypes = Array.from(document.querySelectorAll('script[type="text/ejs"]'))
            .map(script => {
                const name: string | null = script.getAttribute('id');
                if (!name || !VisWidgetsCatalog.rxWidgets) {
                    return null;
                }
                // only if RX widget with the same name not found
                let info;
                if (VisWidgetsCatalog.rxWidgets[name]?.getWidgetInfo) {
                    info = VisWidgetsCatalog.rxWidgets[name].getWidgetInfo();
                    if (info?.visAttrs && typeof info.visAttrs !== 'string') {
                        return null;
                    }
                }

                const widgetSet = script.getAttribute('data-vis-set') || 'basic';
                if (usedWidgetSets && !usedWidgetSets.includes(widgetSet)) {
                    console.log(`Ignored ${widgetSet}/${name} because not used in project`);
                    return null;
                }

                const color = script.getAttribute('data-vis-color');
                window.visSets[widgetSet] ||= {};
                if (color) {
                    window.visSets[widgetSet].color = color;
                } else if (!window.visSets[widgetSet].color && DEFAULT_SET_COLORS[widgetSet]) {
                    window.visSets[widgetSet].color = DEFAULT_SET_COLORS[widgetSet];
                }
                const widgetObj: WidgetType = {
                    name,
                    title: info?.visName || script.getAttribute('data-vis-name') || undefined,
                    label: info?.visWidgetLabel || info?.visWidgetLabel === '' ? info.visWidgetLabel : undefined, // new style with translation
                    preview: info?.visPrev || script.getAttribute('data-vis-prev') || undefined,
                    help: script.getAttribute('data-vis-help') || undefined,
                    set: info?.visSet || widgetSet,
                    imageHTML: script.getAttribute('data-vis-prev') || '',
                    init: script.getAttribute('data-vis-init') || undefined,
                    color: info?.visWidgetColor || undefined,
                    params:
                        info?.visAttrs ||
                        Object.values(script.attributes)
                            .filter(attribute => attribute.name.startsWith('data-vis-attrs'))
                            .map(attribute => attribute.value)
                            .join(''),
                    setLabel: info?.visSetLabel || undefined,
                    setColor: info?.visSetColor || undefined,
                    order:
                        info?.visOrder === undefined || info?.visOrder === null
                            ? 1000
                            : typeof info.visOrder === 'string'
                              ? parseInt(info.visOrder, 10)
                              : info.visOrder,
                    hidden: script.getAttribute('data-vis-no-palette') === 'true',
                };

                VisWidgetsCatalog.allWidgetsList?.push(widgetObj.name);

                return widgetObj;
            })
            .filter(w => w);

        // React widgets
        // We have here two types of widgets: native (from this repository - function) and loaded via getRemoteWidgets (objects)
        const widgets: VisRxWidgetLoaded[] = Object.values(VisWidgetsCatalog.rxWidgets);
        widgets.forEach(widget => {
            const widgetInfo = widget.getWidgetInfo();
            const i18nPrefix = widget.i18nPrefix || '';

            const widgetObj: WidgetType = {
                name: widgetInfo.id,
                preview: widgetInfo.visPrev,
                title: widgetInfo.visName, // old style without translation
                params: widgetInfo.visAttrs,
                set: widgetInfo.visSet,
                style: widgetInfo.visDefaultStyle,
                label: widgetInfo.visWidgetLabel
                    ? i18nPrefix + widgetInfo.visWidgetLabel
                    : widgetInfo.visWidgetLabel === ''
                      ? ''
                      : undefined, // new style with translation
                setLabel: widgetInfo.visSetLabel ? i18nPrefix + widgetInfo.visSetLabel : undefined, // new style with translation
                setColor: widgetInfo.visSetColor,
                setIcon:
                    widgetInfo.visSetIcon ||
                    (widget.setIcon && widget.adapter && widget.setIcon
                        ? `../adapter/${widget.adapter}/${widget.setIcon}`
                        : undefined),
                color: widgetInfo.visWidgetColor,
                resizable: widgetInfo.visResizable,
                resizeLocked: widgetInfo.visResizeLocked,
                draggable: widgetInfo.visDraggable,
                adapter: widget.adapter || undefined,
                version: widget.version || undefined,
                hidden: widget.visHidden,
                order: widgetInfo.visOrder === undefined ? 1000 : widgetInfo.visOrder,
                // custom: widgetInfo.custom, not used
                customPalette: widgetInfo.customPalette,
                rx: true,
                developerMode: widget.url?.startsWith('http://'),
                i18nPrefix,
            };
            if (VisWidgetsCatalog.allWidgetsList && !VisWidgetsCatalog.allWidgetsList.includes(widgetObj.name)) {
                VisWidgetsCatalog.allWidgetsList.push(widgetObj.name);
            }

            const index = (window as any).visWidgetTypes.findIndex((item: WidgetType) => item.name === widgetObj.name);
            if (index > -1) {
                (window as any).visWidgetTypes[index] = widgetObj; // replace old widget with RX widget
            } else {
                (window as any).visWidgetTypes.push(widgetObj);
            }

            if (i18nPrefix && typeof widgetInfo.visAttrs === 'object') {
                widgetInfo.visAttrs.forEach(group => {
                    if (group.label && !group.label.startsWith(i18nPrefix)) {
                        (group as WidgetAttributesGroupInfoStored).label = i18nPrefix + group.label;
                    }
                    if (group.fields) {
                        group.fields.forEach(field => {
                            const _field = field as unknown as WidgetAttributeInfoStored;
                            if (_field.label && !_field.label.startsWith(i18nPrefix)) {
                                _field.label = i18nPrefix + _field.label;
                            }
                            if (_field.tooltip && !_field.tooltip.startsWith(i18nPrefix)) {
                                _field.tooltip = i18nPrefix + _field.tooltip;
                            }
                            if (_field.options && !_field.noTranslation && Array.isArray(_field.options)) {
                                _field.options.forEach(option => {
                                    if (typeof option === 'object') {
                                        if (option.label && !option.label.startsWith(i18nPrefix)) {
                                            // we must add a prefix to the label
                                            (option as any).label = i18nPrefix + option.label;
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

    return (window as any).visWidgetTypes;
};

class VisWidgetsCatalog {
    static rxWidgets: Record<string, VisRxWidgetLoaded> | null = null;

    static allWidgetsList: string[] | null = null;

    static getUsedWidgetSets(project: Project): string[] | false {
        let anyWithoutSet = false;
        const widgetSets: string[] = [];

        // load in runtime only used widget sets
        const views = Object.keys(project);
        for (let v = 0; v < views.length; v++) {
            if (views[v] === '___settings') {
                continue;
            }
            const widgets = project[views[v]].widgets;
            const keys: (GroupWidgetId | SingleWidgetId)[] = Object.keys(widgets) as (GroupWidgetId | SingleWidgetId)[];
            for (let w = 0; w < keys.length; w++) {
                const widgetSet = widgets[keys[w]].widgetSet;
                if (!widgetSet || widgets[keys[w]].wSet || widgets[keys[w]].set) {
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

    static setUsedWidgetSets(project: Project): Project {
        // provide for all widgets the widget set and set
        let views: Project;
        const widgetTypes = window.visWidgetTypes; // getWidgetTypes();
        const viewKeys = Object.keys(project);

        for (let v = 0; v < viewKeys.length; v++) {
            if (viewKeys[v] === '___settings') {
                continue;
            }
            const widgets = project[viewKeys[v]].widgets;
            const keys: (GroupWidgetId | SingleWidgetId)[] = Object.keys(widgets) as (GroupWidgetId | SingleWidgetId)[];
            for (let w = 0; w < keys.length; w++) {
                // remove deprecated attributes
                if (widgets[keys[w]].set) {
                    views ||= JSON.parse(JSON.stringify(project));
                    delete views[viewKeys[v]].widgets[keys[w]].set;
                }
                if (widgets[keys[w]].wSet) {
                    views ||= JSON.parse(JSON.stringify(project));
                    delete views[viewKeys[v]].widgets[keys[w]].wSet;
                }
                if (widgets[keys[w]].widgetSet) {
                    continue;
                }
                const tpl = widgets[keys[w]].tpl;

                if (tpl === '_tplGroup') {
                    views ||= JSON.parse(JSON.stringify(project));
                    views[viewKeys[v]].widgets[keys[w]].widgetSet = 'basic';
                } else {
                    const tplWidget = widgetTypes.find(item => item.name === tpl);
                    if (tplWidget) {
                        views ||= JSON.parse(JSON.stringify(project));
                        views[viewKeys[v]].widgets[keys[w]].widgetSet = tplWidget.set;
                    }
                }
            }
        }

        return views;
    }

    static collectRxInformation(
        socket: LegacyConnection,
        project: Project,
        changeProject?: (newProject: Project) => void,
    ): Promise<Record<string, VisRxWidget<any>>> {
        if (!VisWidgetsCatalog.rxWidgets) {
            VisWidgetsCatalog.rxWidgets = {};
            // collect all widget sets used in a project
            let usedWidgetSets: string[] | false | null = null;
            if (project) {
                usedWidgetSets = VisWidgetsCatalog.getUsedWidgetSets(project);
            }

            return new Promise(resolve => {
                setTimeout(
                    () =>
                        getRemoteWidgets(socket, !changeProject && usedWidgetSets ? usedWidgetSets : false).then(
                            (widgetSets: void | VisRxWidgetWithInfo<any>[]) => {
                                const collectedWidgets: VisRxWidgetWithInfo<any>[] = [
                                    ...WIDGETS,
                                    ...(widgetSets || []),
                                ] as VisRxWidgetWithInfo<any>[];

                                collectedWidgets.forEach((WidgetEl: VisRxWidgetWithInfo<any>) => {
                                    if (!WidgetEl?.getWidgetInfo) {
                                        console.error(
                                            `Invalid widget without getWidgetInfo: ${WidgetEl.constructor.name}`,
                                        );
                                    } else {
                                        const info = WidgetEl.getWidgetInfo();
                                        if (!info.visSet) {
                                            console.error(`No visSet in info for "${WidgetEl.constructor.name}"`);
                                        }

                                        if (!info.id) {
                                            console.error(`No id in info for "${WidgetEl.constructor.name}"`);
                                        } else if (VisWidgetsCatalog.rxWidgets) {
                                            VisWidgetsCatalog.rxWidgets[info.id] = WidgetEl;
                                        }
                                    }
                                });

                                // init all widgets
                                if (changeProject) {
                                    getWidgetTypes();
                                } else if (usedWidgetSets) {
                                    getWidgetTypes(usedWidgetSets);
                                } else {
                                    getWidgetTypes();
                                }

                                if (usedWidgetSets === false && changeProject) {
                                    // some widgets without set found
                                    const newProject = VisWidgetsCatalog.setUsedWidgetSets(project);
                                    if (newProject) {
                                        console.warn('Found widgets without widget set. Project updated');
                                        changeProject(newProject);
                                    }
                                }

                                resolve(VisWidgetsCatalog.rxWidgets as Record<string, VisRxWidget<any>>);
                            },
                        ),
                    0,
                );
            });
        }

        return Promise.resolve(VisWidgetsCatalog.rxWidgets);
    }
}

function deepCloneRx(obj: any[] | Record<string, any>): any[] | Record<string, any> {
    if (Array.isArray(obj)) {
        const newObj: any[] = [];
        for (let key = 0; key < obj.length; key++) {
            if (obj[key] !== undefined) {
                if (Array.isArray(obj[key]) || typeof obj[key] === 'object') {
                    // If it is ReactJS object
                    if (Object.prototype.hasOwnProperty.call(obj, '$$typeof')) {
                        newObj[key] = obj[key];
                    } else {
                        newObj[key] = deepCloneRx(obj[key]);
                    }
                } else {
                    newObj[key] = obj[key];
                }
            }
        }
        return newObj;
    }

    const newObj: Record<string, any> = {};
    for (const key in obj) {
        if (obj[key] !== undefined) {
            if (Array.isArray(obj[key]) || typeof obj[key] === 'object') {
                // If it is ReactJS object
                if (Object.prototype.hasOwnProperty.call(obj, '$$typeof')) {
                    newObj[key] = obj[key];
                } else {
                    newObj[key] = deepCloneRx(obj[key]);
                }
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    return newObj;
}

export interface CommonGroups {
    common: number;
    [key: string]: number;
}

export const parseAttributes = (
    widgetParams: string | RxWidgetInfoGroup[],
    widgetIndex?: number,
    commonGroups?: CommonGroups,
    commonFields?: Record<string, number>,
    widgetSet?: string,
    widgetData?: Record<string, any>,
): null | WidgetAttributesGroupInfoStored[] => {
    if (typeof widgetParams === 'string') {
        let groupName = 'common';
        let indexedGroups: { [key: number]: WidgetAttributesGroupInfoStored } = {};
        let isIndexedGroup = false;
        commonGroups ||= { common: 1 };
        commonFields ||= {};
        const fields: WidgetAttributesGroupInfoStored[] = [
            {
                name: 'common',
                singleName: 'common',
                fields: [],
            },
        ];
        let currentGroup: WidgetAttributesGroupInfoStored | undefined = fields[0];
        widgetIndex ||= 0;

        widgetParams.split(';').forEach(fieldString => {
            if (!fieldString) {
                return;
            }

            if (fieldString.startsWith('group.')) {
                const pparts = fieldString.split('/');
                groupName = pparts[0].split('.')[1];
                if (widgetIndex !== undefined && widgetIndex > 0 && commonGroups && !commonGroups[groupName]) {
                    return;
                }
                indexedGroups = {};
                if (pparts[1] !== 'byindex') {
                    currentGroup = fields.find(group => group.name === groupName);
                    if (!currentGroup) {
                        fields.push({
                            name: groupName,
                            singleName: groupName,
                            fields: [],
                        });
                        currentGroup = fields[fields.length - 1];
                    }
                    if (commonGroups) {
                        if (!commonGroups[groupName]) {
                            commonGroups[groupName] = 0;
                        }
                        commonGroups[groupName]++;
                    }
                    isIndexedGroup = false;
                } else {
                    isIndexedGroup = true;
                }
            } else {
                const match = fieldString.match(
                    /([a-zA-Z0-9._-]+)(\([a-zA-Z.0-9-_]*\))?(\[.*])?(\/[-_,^§~\s:/.a-zA-Z0-9]+)?/,
                );
                if (!match) {
                    console.warn(`Invalid attribute ${fieldString}`);
                    return;
                }

                const repeats = match[2];
                let type: RxWidgetAttributeType | null;
                let onChangeFunc: string | undefined;
                if (match[4]) {
                    const parts = match[4].substring(1).split('/');
                    type = parts[0] as RxWidgetAttributeType;
                    onChangeFunc = parts[1];
                } else {
                    type = null;
                }
                const field: WidgetAttributeInfoStored = {
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
                        .replace(/\^\^/g, '^') as RxWidgetAttributeType;
                }
                if (typeof field.default === 'string') {
                    field.default = field.default
                        .replace(/§/g, ';')
                        .replace(/~/g, '/')
                        .replace(/\^/g, '"')
                        .replace(/\^\^/g, '^');
                }

                // special case for Object ID filter
                if (field.onChangeFunc?.startsWith('filterType')) {
                    field.filter = field.onChangeFunc.substring('filterType'.length).toLowerCase();
                    delete field.onChangeFunc;
                }

                if (
                    widgetIndex &&
                    widgetIndex > 0 &&
                    !repeats &&
                    commonFields &&
                    !commonFields[`${groupName}.${field.name}`]
                ) {
                    return;
                }

                if (field.name === 'oid' || field.name.match(/^oid-/)) {
                    field.type ||= 'id';
                } else if (field.name === 'color') {
                    field.type = 'color';
                } else if (field.name.match(/nav_view$/)) {
                    field.type = 'views';
                } else if (field.name === 'sound') {
                    // field.type = 'sound';
                    field.type = 'text';
                } else if (field.name.includes('_effect')) {
                    // field.type = 'effect';
                    field.type = 'text';
                } else if (field.name.includes('_eff_opt')) {
                    // field.type = 'effect-options';
                    field.type = 'text';
                } else if (!field.type) {
                    field.type = 'text';
                }

                if (field.type && field.type.startsWith('id,')) {
                    const options = field.type.split(',');
                    field.type = options[0] as RxWidgetAttributeType;
                    field.filter = options[1];
                }
                if (
                    field.type &&
                    (field.type.startsWith('select,') ||
                        field.type.startsWith('nselect,') ||
                        field.type.startsWith('auto,'))
                ) {
                    const options = field.type.split(',');
                    field.type = options[0] as RxWidgetAttributeType;
                    field.options = options.slice(1);
                }
                if (field.type && (field.type.startsWith('slider,') || field.type.startsWith('number,'))) {
                    const options = field.type.split(',');
                    field.type = options[0] as RxWidgetAttributeType;
                    field.min = parseInt(options[1]);
                    field.max = parseInt(options[2]);
                    field.step = parseInt(options[3]);
                    if (!field.step) {
                        field.step = field.max - field.min / 100;
                    }
                }
                if (field.type && field.type.startsWith('style,')) {
                    const options = field.type.split(',');
                    field.type = options[0] as RxWidgetAttributeType;
                    field.filterFile = options[1];
                    field.filterName = options[2];
                    field.filterAttrs = options[3];
                    field.removeName = options[4];
                    if (!field.step && field.max !== undefined && field.min !== undefined) {
                        field.step = field.max - field.min / 100;
                    }
                }
                // remove comma from type
                if (field.type?.startsWith('style,')) {
                    console.warn(`Attribute "${field.name}" of ${widgetSet} has wrong type: ${field.type}`);
                    field.type = field.type.split(',')[0] as RxWidgetAttributeType;
                }

                field.singleName = field.name;
                field.set = widgetSet;
                if (repeats) {
                    const repeatsMatch = repeats.match(/\(([0-9a-z_]+)-([0-9a-z_]+)\)/i);
                    const name = field.name;
                    if (repeatsMatch) {
                        let from = 1;
                        let to = 1;
                        if (!repeatsMatch[1].match(/^[0-9]$/)) {
                            from = widgetData ? parseInt(widgetData[repeatsMatch[1]]) : 0;
                        }
                        if (!repeatsMatch[2].match(/^[0-9]$/)) {
                            to = widgetData ? parseInt(widgetData[repeatsMatch[2]]) : 0;
                        }
                        for (let i = from; i <= to; i++) {
                            if (isIndexedGroup) {
                                if (
                                    commonGroups &&
                                    widgetIndex &&
                                    widgetIndex > 0 &&
                                    !commonGroups[`${groupName}-${i}`]
                                ) {
                                    return;
                                }
                                if (
                                    commonFields &&
                                    widgetIndex &&
                                    widgetIndex > 0 &&
                                    !commonFields[`${groupName}-${i}.${field.name}`]
                                ) {
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
                                if (commonGroups) {
                                    if (!commonGroups[`${groupName}-${i}`]) {
                                        commonGroups[`${groupName}-${i}`] = 0;
                                    }
                                    commonGroups[`${groupName}-${i}`]++;
                                }

                                field.name = `${name}${i}`;
                                indexedGroups[i]?.fields?.push({ ...field });
                                if (commonFields) {
                                    if (!commonFields[`${groupName}-${i}.${field.name}`]) {
                                        commonFields[`${groupName}-${i}.${field.name}`] = 0;
                                    }
                                    commonFields[`${groupName}-${i}.${field.name}`]++;
                                }
                            } else {
                                field.name = `${name}${i}`;
                                field.index = i;
                                currentGroup?.fields?.push({ ...field });
                                if (commonFields) {
                                    if (!commonFields[`${groupName}.${field.name}`]) {
                                        commonFields[`${groupName}.${field.name}`] = 0;
                                    }
                                    commonFields[`${groupName}.${field.name}`]++;
                                }
                            }
                        }
                    }
                } else {
                    currentGroup?.fields?.push(field);
                    if (commonFields) {
                        if (!commonFields[`${groupName}.${field.name}`]) {
                            commonFields[`${groupName}.${field.name}`] = 0;
                        }
                        commonFields[`${groupName}.${field.name}`]++;
                    }
                }
            }
        });

        return fields;
    }

    if (Array.isArray(widgetParams)) {
        commonGroups ||= { common: 1 };
        commonFields ||= {};
        const fields = deepCloneRx(widgetParams) as WidgetAttributesGroupInfoStored[];
        let groupIndex = fields.findIndex(group => typeof group.indexFrom === 'number');

        // if enumerable
        while (groupIndex > -1) {
            const group = fields[groupIndex];
            group.singleName = group.name;
            let from: number;
            let indexFrom;
            if (Number.isInteger(group.indexFrom)) {
                from = group.indexFrom as number;
            } else {
                from = parseInt(widgetData?.[group.indexFrom || 1]);
                indexFrom = from;
            }
            let to: number;
            let indexTo;
            if (Number.isInteger(group.indexTo)) {
                to = parseInt((group.indexTo as string) || '1', 10);
            } else {
                to = parseInt(widgetData?.[group.indexTo || 1]);
                indexTo = group.indexTo;
            }
            delete group.indexFrom;
            delete group.indexTo;
            const indexedGroups = [];

            for (let i = from; i <= to; i++) {
                const indexedGroup: WidgetAttributesGroupInfoStored = {
                    ...deepCloneRx(group),
                    index: i,
                    name: `${group.singleName}-${i}`,
                    hidden: group.hidden,
                    iterable: {
                        group: group.singleName || '',
                        isFirst: i === from,
                        isLast: i === to,
                        indexTo,
                        indexFrom,
                    },
                };
                indexedGroup.fields?.forEach((field: WidgetAttributeInfoStored, ii) => {
                    field.singleName = field.name;
                    field.name = `${field.name}${i}`;
                    field.index = i;
                    if (group.fields && group.fields[ii]) {
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
                    }
                });

                indexedGroups.push(indexedGroup);
            }
            fields.splice(groupIndex, 1, ...indexedGroups);
            groupIndex = fields.findIndex(_group => _group.indexFrom);
        }

        fields.forEach(group => {
            if (!group.name) {
                group.name = 'common';
            }
            if (!group.singleName) {
                group.singleName = group.name;
            }
            if (commonGroups) {
                if (!commonGroups[group.name]) {
                    commonGroups[group.name] = 0;
                }
                commonGroups[group.name]++;
            }
            if (group.fields) {
                // fields can be interable too
                let fieldIndex = group.fields.findIndex((field: WidgetAttributeInfoStored) => field.indexFrom);
                while (fieldIndex > -1) {
                    const field = group.fields[fieldIndex] as WidgetAttributeInfoStored;
                    field.singleName = field.name;
                    let from = 1;
                    let indexFrom;
                    if (Number.isInteger(field.indexFrom)) {
                        from = parseInt(field.indexFrom as string, 10);
                    } else if (typeof field.indexFrom === 'string') {
                        from = parseInt(widgetData?.[field.indexFrom]);
                        indexFrom = from;
                    }
                    let to = 1;
                    let indexTo;
                    if (Number.isInteger(field.indexTo)) {
                        to = parseInt(field.indexTo as string, 10);
                    } else if (typeof field.indexTo === 'string') {
                        to = parseInt(widgetData?.[field.indexTo]);
                        indexTo = field.indexTo;
                    }
                    delete field.indexFrom;
                    delete field.indexTo;
                    const indexedFields = [];
                    for (let i = from; i <= to; i++) {
                        const indexedField = deepCloneRx(field) as WidgetAttributeInfoStored;
                        indexedField.index = i;
                        indexedField.name = `${field.singleName}${i}`;
                        indexedField.iterable = {
                            group: field.singleName,
                            isFirst: i === from,
                            isLast: i === to,
                            indexFrom,
                            indexTo,
                        };
                        indexedFields.push(indexedField);
                    }

                    group.fields?.splice(fieldIndex, 1, ...indexedFields);

                    fieldIndex = group.fields.findIndex((_field: WidgetAttributeInfoStored) => _field.indexFrom);
                }

                group.fields.forEach((field: WidgetAttributeInfoStored) => {
                    if (!field.singleName) {
                        field.singleName = field.name;
                    }
                    field.set = widgetSet;
                    if (commonFields) {
                        if (!commonFields[`${group.name}.${field.name}`]) {
                            commonFields[`${group.name}.${field.name}`] = 0;
                        }
                        commonFields[`${group.name}.${field.name}`]++;
                    }
                });
            }
        });

        return fields;
    }

    return null;
};

export default VisWidgetsCatalog;
