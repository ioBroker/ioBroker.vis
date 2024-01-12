import type React from 'react';
import type { Connection } from '@iobroker/adapter-react-v5';

export type Timer = ReturnType<typeof setTimeout>;

export interface Permissions {
    /** Accessible in Runtime */
    read: boolean;
    /** Accessible in Editor */
    write: boolean;
}

interface ProjectPermissions {
    /** Which user has read or write access for the project */
    [user: string]: Permissions;
}

export interface ProjectSettings {
    darkReloadScreen: boolean;
    destroyViewsAfter: number;
    folders: {id: string; name: string; parentId: string}[];
    openedViews: string[];
    reconnectInterval: number;
    reloadOnEdit: boolean;
    reloadOnSleep: number;
    statesDebounceTime: number;
    scripts: unknown;
    /** Which user has read or write access for the project */
    permissions?: ProjectPermissions;
}

interface SingleWidget  {
    /** Internal wid */
    _id?: string;
    data: Record<string, unknown>;
    style: Record<string, unknown>;
    tpl: string;
    widgetSet: string;
    /** The id of the group, if the widget is grouped */
    groupid?: string;
    /** If the widget is grouped */
    grouped?: boolean;
}

interface GroupWidget extends SingleWidget {
    tpl: '_tplGroup';
    data: {
        /** Widget IDs of the members */
        members: string[];
        [other: string]: unknown;
    };
}

export type Widget = SingleWidget | GroupWidget;

export type SingleWidgetId = `w${string}`
export type GroupWidgetId = `g${string}`
export type AnyWidgetId = SingleWidgetId | GroupWidgetId

export interface View {
    activeWidgets: string[];
    filterList: string[];
    rerender: boolean;
    settings: Record<string, unknown>;
    /** Widgets on this view */
    widgets: {
        [groupId: GroupWidgetId]: GroupWidget;
        [widgetId: SingleWidgetId]: SingleWidget;
    };
}

export interface Project {
    // @ts-expect-error this type has bad code-style, we should refactor the views in a views: Record<string, View> attribute
    ___settings: ProjectSettings;
    [view: string]: View;
}

export interface RxRenderWidgetProps {
    className: string;
    overlayClassNames: string[];
    style: React.CSSProperties;
    id: string;
    refService: React.Ref<HTMLDivElement>;
    widget: object;
}

interface ArgumentChanged {
    callback: any;
    arg: string;
    wid: string;
}
interface Subscribing {
    activeViews: string[];
    byViews: Record<string, string[]>;
    active: string[];
    IDs: string[];
}

export interface VisLegacy {
    instance: string;
    navChangeCallbacks: (() => void)[];
    findNearestResolution: (width?: number, height?: number) => string;
    version: number;
    states: any;
    objects: Record<string, any>;
    isTouch: boolean;
    activeWidgets: string[];
    editMode: boolean;
    binds: any;
    views: Project;
    activeView: string;
    language: string;
    user: string;
    projectPrefix: string;
    _: (word: string) => string;
    dateFormat: '';
    loginRequired: false;
    viewsActiveFilter: Record<string, string[]>;
    onChangeCallbacks: ArgumentChanged[];
    subscribing: Subscribing;
    conn: any;
    lastChangedView: string | null; // used in vis-2 to save last sent view name over vis-2.0.command
    updateContainers: () => void;
    renderView: (viewDiv: string, view: string, hidden: boolean, cb: () => void) => void;
    updateFilter: (view: string) => string[];
    destroyUnusedViews: () => void;
    changeFilter: (view: string, filter: string, showEffect?: string, showDuration?: number, hideEffect?: string, hideDuration?: number) => boolean;
    // setValue: this.setValue;
    changeView: (viewDiv: string, view: string, hideOptions: any, showOptions: any, sync: boolean, cb: () => void) => void;
    getCurrentPath: () => string;
    navigateInView: (path: string) => void;
    onWakeUp: (callback: () => void | string, wid?: string) => void;
    // inspectWidgets: (viewDiv: string, view: string, addWidget, delWidget, onlyUpdate: boolean) => void,
    // showMessage: (message: string, title: string, icon, width, callback) => void,
    showWidgetHelper: (viewDiv: string, view: string, wid: string, isShow: boolean) => void;
    addFont: (fontName: string) => void;
    // registerOnChange: (callback, arg, wid: string) => void;
    // unregisterOnChange: (callback, arg, wid: string) => void;
    generateInstance: () => string;
    // findByRoles: (stateId: string, roles) => any,
    // findByName: (stateId: string, objName) => any,
    hideShowAttr: (widAttr: string) => void;
    // bindingsCache: {},
    extractBinding: (format: string, doNotIgnoreEditMode?: boolean) => any;
    // formatBinding: (format: string, view: string, wid: string, widget, widgetData, values) => string,
    getViewOfWidget: (wid: string) => string | null;
    confirmMessage: (message: string, title: string, icon: string, width: number, callback: () => boolean) => void;
    // config: {}, // storage of dialog positions and size (Deprecated)
    showCode: (code: string, title: string, mode?: 'html' | 'json' | 'css') => void;
    // findCommonAttributes: (/* view, widgets */) => void;
    bindWidgetClick: () => void;
    preloadImages: (sources: string[]) => void;
    // updateStates: data => void,
    getHistory: (id: string, options: any, callback: () => void) => void;
    getHttp: (url: string, callback: () => string) => void;
    formatDate: (dateObj: Date | string | number, isDuration?: boolean, _format?: string) => string;
    widgets: any;
    editSelect: (widAttr: string, values: any, notTranslate: boolean, init: () => void, onchange: () => void) => string | null;
    isWidgetHidden: (view: string, widget: string, visibilityOidValue: null | number | string | undefined | boolean, widgetData: any) => boolean;
    getUserGroups: () => Record<string, string[]>;
    detectBounce: (el: any, isUp?: boolean) => boolean;
}

export interface Window {
    vis: VisLegacy;
}

export interface BaseWidgetState extends React.ComponentState {
    width: number;
    height: number;
    defaultView: string;
    draggable: boolean;
    data: Record<string, string | number | boolean>;
    style: Record<string, string | number>;
    applyBindings: boolean;
    editMode: boolean;
    multiViewWidget: boolean;
    selected: boolean;
    selectedOne: boolean;
    resizable: boolean;
    resizeHandles: string[];
    widgetHint: string;
    isHidden: boolean;
    gap: number;
}

export interface RxWidgetState extends BaseWidgetState {
    rxData: Record<string, string | number | boolean>;
    rxStyle: Record<string, string | number>;
    values: Record<string, string | number | boolean | null>;
    visible: boolean;
    disabled: boolean;
}

export interface CanWidgetStore {
    style: Record<string, string | number>;
    data: Record<string, string | number | boolean>;
    wid: string;
}

export interface VisContext {
    // $$: any;
    // VisView: any;
    activeView: string;
    adapterName: string;
    allWidgets: Record<string, CanWidgetStore>;
    askAboutInclude: (wid: string, toWid: string, cb: () => void) => void;
    buildLegacyStructures: () => void;
    // can: any;
    // canStates: any;
    changeProject: (project: Project, ignoreHistory?: boolean) => Promise<void>;
    changeView: (view: string, subView?: string) => void;
    dateFormat: string;
    editModeComponentClass: string;
    // formatUtils: this.formatUtils;
    instance: string; // vis instance number (not browser instance)
    // jQuery: any;
    lang: string;
    // linkContext: any;
    lockDragging: boolean;
    // onWidgetsChanged: (changedData: any, view?: string, viewSettings?: any) => void | null;
    projectName: string;
    runtime: boolean;
    setTimeInterval: (timeInterval: string) => void;
    setTimeStart: (timeStart: string) => void;
    setValue: (id: string, value: string | boolean | number | null) => void;
    showWidgetNames: boolean;
    socket: Connection;
    // systemConfig: any;
    // theme: any;
    themeName: string;
    themeType: string;
    timeInterval: string;
    timeStart:string;
    user: string;
    userGroups: Record<string, string[]>;
    views: Project; // project
    widgetHint: 'light' | 'dark' | 'hide';
    // registerEditorCallback: (name: string, view: string, cb: any) => void | null;
    setSelectedGroup: (groupId: string) => void;
    setSelectedWidgets: (widgets: string[]) => void;
    onIgnoreMouseEvents: (ignore: boolean) => void;
    // disableInteraction: this.props.disableInteraction;
    toggleTheme: () => void;
    // onCommand: (view: string, command: string, data?: any) => void
    // moment: any;
}

export interface RxWidgetProps extends RxRenderWidgetProps {
    id: string;
    context: VisContext;
    view: string;
    editMode: boolean;
    isRelative: boolean;
    // refParent: React.RefObject<any>,
    // askView: (command: string, props?: any) => any,
    selectedWidgets: string[];
    viewsActiveFilter: Record<string, string[]>;
}

type RxWidgetAttributeType = 'id' | 'number' | 'slider' | 'image' | 'checkbox' | 'color';

type RxWidgetInfoAttributesField = {
    /** Name of the widget field */
    name: string;
    /** Field default value */
    default?: string;
    /** Field type */
    type?: 'id' | 'image' | 'color';
} | {
    /** Name of the widget field */
    name: string;
    /** Field type */
    type: 'select';
    /** Field default value */
    default?: string;
    /** Options for select type */
    options: { value: string; label: string }[];
} | {
    /** Name of the widget field */
    name: string;
    /** Field type */
    type: 'checkbox';
    /** Field default value */
    default?: boolean;
} | {
    /** Name of the widget field */
    name: string;
    /** Field type */
    type: 'number';
    /** Field default value */
    default?: number;
} | {
    /** Name of the widget field */
    name: string;
    /** Field type */
    type: 'slider';
    /** Field default value */
    default?: number;
    /** Slider min value */
    min: number;
    /** Slider max value */
    max: number;
    /** Slider max value */
    step?: number;
}

interface RxWidgetInfoAttributes {
    /** Name of the attributes section */
    name: string;
    /** Fields of this attribute section */
    fields: RxWidgetInfoAttributesField[];
}

interface RxWidgetInfo {
    /** ID of the widget */
    id: string;
    /** Vis widget set name */
    visSet: string;
    /** Name in vis */
    visName: string;
    /** Preview image */
    visPrev: string;
    /** Defines the widget attributes */
    visAttrs: RxWidgetInfoAttributes[];
    /** TODO */
    visResizeLocked?: boolean;
    /** TODO */
    resizable?: boolean;
    /** TODO */
    visResizable?: boolean;
    /** TODO */
    visDraggable?: boolean;
    /** TODO */
    resizeHandles?: string[];
    /** TODO */
    visResizeHandles?: string[];
}

type AttributeTypeToDataType<TType extends RxWidgetAttributeType> = TType extends 'checkbox' ? boolean : TType extends 'number' | 'slider' ? number :
    string;

/** Infer the RxData from VisAttrs */
type GetRxDataFromVisAttrs<T extends Record<string, any>> = {
    [K in T['visAttrs'][number]['fields'][number] as K['name']]: AttributeTypeToDataType<K['type']>
}

/** Infers the RxData from a given Widget */
type GetRxDataFromWidget<T extends { getWidgetInfo: () => Record<string, any> }> =  GetRxDataFromVisAttrs<ReturnType<(T['getWidgetInfo'])>>
