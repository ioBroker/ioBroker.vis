import type React from 'react';
import type { Connection } from '@iobroker/adapter-react-v5';
import { CustomPaletteProperties, WidgetAttributeInfo, WidgetAttributesGroupInfo } from '@/Vis/visRxWidget';
import { CommonType } from '@iobroker/types/build/objects';
import { store } from '@/Store';
import { RxWidgetAttributeType, RxWidgetInfoAttributesField } from '@/allInOneTypes';

export type Timer = ReturnType<typeof setTimeout>;

export interface Permissions {
    /** Accessible in Runtime */
    read: boolean;
    /** Accessible in Editor */
    write: boolean;
}

interface UserPermissions {
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
    permissions?: UserPermissions;
}

export type SingleWidgetId = `w${string}`
export type GroupWidgetId = `g${string}`
export type AnyWidgetId = SingleWidgetId | GroupWidgetId

interface WidgetData {
    /** Only exists if given by user in tab general */
    name?: string;
    bindings?: string[];
    [other: string]: unknown;
}

interface WidgetStyle {
    bindings?: string[];
    [other: string]: unknown;
}

interface SingleWidget  {
    /** Internal wid */
    _id?: string;
    data: WidgetData;
    style: WidgetStyle;
    /** @deprecated The widget type */
    set?: string;
    /** The widget type */
    wSet?: string;
    tpl: string;
    widgetSet: string;
    /** The id of the group, if the widget is grouped */
    groupid?: GroupWidgetId;
    /** If the widget is grouped */
    grouped?: boolean;
    /** Permissions for each user for the widget */
    permissions?: UserPermissions;
    /** This widget was taken from marketplace */
    marketplace?: any;
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

export interface ViewSettings {
    /** Permissions for each user for the view */
    permissions?: UserPermissions;
    display?: 'flex' | 'grid' | null | '';
    comment?: string;
    class?: string;
    filterkey?: string;
    group?: string[];
    theme?: string;
    group_action?: 'disabled' | 'hide' | null | '';

    'bg-image'?: string;
    'bg-position-x'?: string;
    'bg-position-y'?: string;
    'bg-width'?: string;
    'bg-height'?: string;
    'bg-color'?: string;
    background_class?: string;
    useBackground?: boolean;
    background?: string;
    'background-color'?: string;
    'background-image'?: string;
    'background-repeat'?:  'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | 'initial' | 'inherit' | null | '';
    'background-attachment'?: 'scroll' | 'fixed' | 'local' | 'initial' | 'inherit' | null | '';
    'background-position'?: 'left top' | 'left center' | 'left bottom' | 'right top' | 'right center' | 'right bottom' | 'center top' | 'center center' | 'center bottom' | 'initial' | 'inherit' | null | '';
    'background-size'?: 'auto' | 'cover' | 'contain' | 'initial' | 'inherit' | null | '';
    'background-clip'?: 'border-box' | 'padding-box' | 'content-box' | 'initial' | 'inherit' | null | '';
    'background-origin'?: 'padding-box' | 'border-box' | 'content-box' | 'initial' | 'inherit' | null | '';

    color?: string;
    'text-shadow'?: string;
    'font-family'?: string;
    'font-style'?: string;
    'font-variant'?: string;
    'font-weight'?: string;
    'font-size'?: string;
    'line-height'?: string;
    'letter-spacing'?: string;
    'word-spacing'?: string;

    useAsDefault?: boolean;
    alwaysRender?: boolean;
    snapType?: 0 | 1 | 2 | null;
    snapColor?: string;
    gridSize?: number;
    sizex?: number;
    sizey?: number;
    limitScreen?: boolean;
    limitScreenDesktop?: boolean;
    limitScreenBorderWidth?: number;
    limitScreenBorderColor?: string;
    limitScreenBorderStyle?: string;
    limitScreenBackgroundColor?: string;

    navigation?: boolean;
    navigationTitle?: string;
    navigationOrder?: number;
    navigationIcon?: string;
    navigationImage?: string;
    navigationOrientation?: 'horizontal' | 'vertical';
    navigationOnlyIcon?: boolean;
    navigationBackground?: string;
    navigationSelectedBackground?: string;
    navigationSelectedColor?: string;
    navigationHeaderTextColor?: string;
    navigationColor?: string;

    navigationChevronColor?: string;
    navigationHideMenu?: boolean;
    navigationHideOnSelection?: boolean;
    navigationHeaderText?: string;
    navigationNoHide?: boolean;
    navigationButtonBackground?: string;

    navigationBar?: boolean;
    navigationBarColor?: string;
    navigationBarText?: string;
    navigationBarIcon?: string;
    navigationBarImage?: string;

    columnWidth?: number;
    columnGap?: number;
    rowGap?: number;
}

export interface View {
    activeWidgets: string[];
    filterList: string[];
    rerender: boolean;
    settings?: ViewSettings;
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
    updateFilter: (view?: string) => string[];
    destroyUnusedViews: () => void;
    changeFilter: (view: string, filter: string, showEffect?: string, showDuration?: number, hideEffect?: string, hideDuration?: number) => boolean;
    // setValue: this.setValue;
    changeView: (viewDiv: string, view: string, hideOptions: any, showOptions: any, sync: boolean, cb: () => void) => void;
    getCurrentPath: () => string;
    navigateInView: (path: string) => void;
    onWakeUp: (callback: null | (() => void | string), wid?: string) => void;
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

export interface CustomPaletteProperties {
    socket: Connection;
    project: Project;
    changeProject: (project: Project, ignoreHistory?: boolean) => Promise<void>;
    selectedView: string;
    themeType: 'dark' | 'light';
    helpers: {
        deviceIcons: Record<string, React.JSX.Element>
        detectDevices: (socket: Connection) => Promise<any[]>;
        getObjectIcon: (obj: ioBroker.Object, id?: string, imagePrefix?: string) => React.JSX.Element;
        allObjects: (socket: Connection) => Promise<Record<string, ioBroker.Object>>;
        getNewWidgetId: (project: Project, offset = 0) => SingleWidgetId;
        /** @deprecated use "getNewWidgetId" instead, it will give you the full wid like "w000001" */
        getNewWidgetIdNumber: (isWidgetGroup: boolean, project: Project, offset = 0) => number;
    };
}


interface RxWidgetInfoAttributes {
    /** Name of the attributes section */
    name: string;
    /** Fields of this attribute section */
    fields: RxWidgetInfoAttributesField[];
    /** I18n Label */
    label?: string;
    indexFrom?: number;
    indexTo?: string;
    hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
}

interface RxWidgetInfo {
    /** Unique ID of the widget. Starts with 'tpl...' */
    id: string;

    /** Name of a widget set */
    visSet: string;
    /** Label of widget set for GUI (normally it exists a translation in i18n for it) */
    visSetLabel?: string;
    /** Icon of a widget set */
    visSetIcon?: string;
    /** Color of a widget set */
    visSetColor?: string;

    /** Name of widget */
    visName: string;
    /** Label of widget for GUI (normally it exists a translation in i18n for it) */
    visWidgetLabel?: string;
    /** Preview link (image URL, like 'widgets/basic/img/Prev_RedNumber.png') */
    visPrev: string;
    /** Color of widget in palette. If not set, the visSetColor will be taken */
    visWidgetColor?: string;

    /** Groups of attributes */
    visAttrs: RxWidgetInfoAttributes[];
    /** Default style for widget */
    visDefaultStyle?: React.CSSProperties;
    /** Position in the widget set */
    visOrder?: number;
    /* required, that width is always equal to height (quadratic widget) */
    visResizeLocked?: boolean;
    /* if false, if widget is not resizable */
    visResizable?: boolean;
    /* @deprecated use visResizable */
    resizable?: boolean;
    /* if false, if widget is not draggable  */
    visDraggable?: boolean;
    /* Show specific handlers  */
    visResizeHandles?: ('n' | 'e' |'s' | 'w' | 'nw' | 'ne' | 'sw' | 'se')[];
    /* @deprecated use visResizeHandles */
    resizeHandles?: ('n' | 'e' |'s' | 'w' | 'nw' | 'ne' | 'sw' | 'se')[];

    /* Function to generate custom palette element */
    customPalette?: (context: CustomPaletteProperties) => React.JSX.Element;
}

type AttributeTypeToDataType<TType extends RxWidgetAttributeType> = TType extends 'checkbox' ? boolean : TType extends 'number' | 'slider' ? number :
    string;

/** Infer the RxData from VisAttrs */
type GetRxDataFromVisAttrs<T extends Record<string, any>> = {
    [K in T['visAttrs'][number]['fields'][number] as K['name']]: AttributeTypeToDataType<K['type']>
}

/** Infers the RxData from a given Widget */
type GetRxDataFromWidget<T extends { getWidgetInfo: () => Record<string, any> }> =  GetRxDataFromVisAttrs<ReturnType<(T['getWidgetInfo'])>>
