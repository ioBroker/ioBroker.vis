import type React from 'react';
import { WidgetAttributeInfo } from '@/Vis/visRxWidget';
import type { Connection } from '@iobroker/adapter-react-v5';
import { AnyWidgetId, Project, WidgetData } from '@/types';

export type RxWidgetAttributeType = 'text' | 'delimiter' | 'help' | 'html' | 'json' | 'id' | 'instance' | 'select' | 'nselect' | 'auto' | 'checkbox' | 'number' | 'select-views' | 'custom' | 'image' | 'color' | 'password' | 'history' | 'hid' | 'icon' | 'dimension' | 'fontname' | 'groups' | 'class' | 'filters' | 'views' | 'style' | 'icon64' | string;

export interface RxWidgetInfoCustomComponentContext {
    readonly socket: Connection;
    readonly projectName: string;
    readonly instance: number;
    readonly adapterName: string;
    readonly views: Project;
}

export interface RxWidgetInfoCustomComponentProperties {
    readonly context: RxWidgetInfoCustomComponentContext;
    readonly selectedView: string;
    readonly selectedWidgets: AnyWidgetId[];
    readonly selectedWidget: AnyWidgetId;
}

export type RxWidgetInfoAttributesField = {
    /** Field type */
    readonly type?: RxWidgetAttributeType;
    /** Field default value */
    readonly default?: string | number | boolean;
    /** if true, no edit button will be shown. Default is true. */
    readonly noButton?: boolean;
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
    /** Filter of objects (not JSON string, it is an object), like:
     - `{common: {custom: true}}` - show only objects with some custom settings
     - `{common: {custom: 'sql.0'}}` - show only objects with sql.0 custom settings (only of the specific instance)
     - `{common: {custom: '_dataSources'}}` - show only objects of adapters `influxdb' or 'sql' or 'history'
     - `{common: {custom: 'adapterName.'}}` - show only objects of the custom settings for specific adapter (all instances)
     - `{type: 'channel'}` - show only channels
     - `{type: ['channel', 'device']}` - show only channels and devices
     - `{common: {type: 'number'}` - show only states of type 'number
     - `{common: {type: ['number', 'string']}` - show only states of type 'number and string
     - `{common: {role: 'switch'}` - show only states with roles starting from switch
     - `{common: {role: ['switch', 'button]}` - show only states with roles starting from `switch` and `button`
     */
    readonly filter?: {
        readonly common?: {
            readonly custom?: true | string | '_dataSources';
            readonly type?: ioBroker.CommonType | ioBroker.CommonType[];
            readonly role?: string | string[];
        };
        readonly type?: ioBroker.ObjectType | ioBroker.ObjectType[];
    } | string;
    /** Additionally, you can provide `adapter` to filter the instances of specific adapter. With special adapter name `_dataSources` you can get all adapters with flag `common.getHistory`. */
    readonly adapter?: string;
    /** In this case only instance number (like `0`) is shown and not `history.0`. It can be set to true only with non-empty `adapter` setting. */
    readonly iShort?: boolean;
    /** Options for select type */
    readonly options?: { readonly value: string; readonly label: string }[] | string[];
    /** Number min value */
    readonly min?: number;
    /** Number max value */
    readonly max?: number;
    /** Number step */
    readonly step?: number;
    /** Slider marks?: array of possible marks. Like `[{value: 1, label: 'one'}, {value: 10}, {value: 100}] */
    readonly marks?: { readonly value: number; readonly label: string }[];
    /** Controls when the value label is displayed: `auto` the value label will display when the thumb is hovered or focused. `on` will display persistently. `off` will never display. */
    readonly valueLabelDisplay?: 'on' | 'off' | 'auto';
    /** type of the widget, like `tplMaterial2Switches` */
    readonly tpl?: string;
    /** if true, all widgets of all views will be shown, not only from the current view. Default is false. */
    readonly all?: boolean;
    /**  if true, grouped widgets will be shown too. Default is false. */
    readonly withGroups?: boolean;
    /** if true, current widget will be shown in the list too. */
    readonly withSelf?: boolean;
    /** if true, it will be checked if the widget is used somewhere else and user will be asked. */
    readonly checkUsage?: boolean;
    /** if true, only widgets will be shown, which are not used in some view. Default is false. */
    readonly hideUsed?: boolean;
    /** if false, only one view can be selected. Default is true. */
    readonly multiple?: boolean;
    /** if false, only one view can be selected. Default is true. */
    readonly component?: (
        field: RxWidgetInfoAttributesField,
        data: WidgetData,
        onDataChange: (newData: WidgetData) => void,
        props: RxWidgetInfoCustomComponentProperties,
    ) => React.JSX.Element | React.JSX.Element[] ;

    /** Name of the widget field */
    readonly name: string;
    /** Field label (i18n) */
    readonly label?: string;
    /** JS Function for conditional visibility */
    readonly hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    readonly tooltip?: string;
    /** JS Function for conditional disability */
    readonly disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    readonly error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    readonly noBinding?: boolean;
    /** Callback called if the field value changed */
    readonly onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
}
