import type React from 'react';
import { WidgetAttributeInfo } from '@/Vis/visRxWidget';
import type { Connection } from '@iobroker/adapter-react-v5';
import { AnyWidgetId, Project } from '@/types';

export type RxWidgetAttributeType = 'text' | 'delimiter' | 'help' | 'html' | 'json' | 'id' | 'instance' | 'select' | 'nselect' | 'auto' | 'checkbox' | 'number' | 'select-views' | 'custom' | 'image' | 'color' | 'password' | 'history' | 'hid' | 'icon' | 'dimension' | 'fontname' | 'groups' | 'class' | 'filters' | 'views' | 'style' | 'icon64';

export type RxWidgetInfoAttributesField = {
    /** Field type */
    type: 'text';
    /** Field default value */
    default?: string;
    /** if true, no edit button will be shown. Default is true. */
    noButton?: boolean;

    /** Name of the widget field */
    name: string;
    /** Field label (i18n) */
    label?: string;
    /** JS Function for conditional visibility */
    hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    tooltip?: string;
    /** JS Function for conditional disability */
    disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    noBinding?: boolean;
    /** Callback called if the field value changed */
    onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
} | {
    /** Field type */
    type: 'delimiter';
    /** It is not required here */
    name: string;
    /** JS Function for conditional visibility */
    hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
} | {
    /** Field type */
    type: 'help';
    /** i18n help text - This text will be shown without a label */
    text: string;
    /** if true, the text will not be translated  */
    noTranslation?: boolean;
    /** this style will be applied to the text */
    style?: React.CSSProperties;

    /** Name of the widget field */
    name: string;
    /** Field label (i18n) */
    label?: string;
    /** JS Function for conditional visibility */
    hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    tooltip?: string;
    /** JS Function for conditional disability */
    disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    noBinding?: boolean;
    /** Callback called if the field value changed */
    onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
} | {
    /** Field type */
    type: 'html' | 'json';
    /** Field default value */
    default?: string;
    /** show multi-line editor */
    multiline?: boolean;

    /** Name of the widget field */
    name: string;
    /** Field label (i18n) */
    label?: string;
    /** JS Function for conditional visibility */
    hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    tooltip?: string;
    /** JS Function for conditional disability */
    disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    noBinding?: boolean;
    /** Callback called if the field value changed */
    onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
} | {
    /** Field type */
    type: 'id';
    /** Field default value */
    default?: string;
    /** Do not write 'nothing_selected' into the field by creation */
    noInit?: boolean;
    /** Do not subscribe on changes of the object */
    noSubscribe:? boolean;
    /** Filter of objects (not JSON string, it is an object), like:
     - `{common: {custom: true}}` - show only objects with some custom settings
     - `{common: {custom: 'sql.0'}}` - show only objects with sql.0 custom settings (only of the specific instance)
     - `{common: {custom: '_dataSources'}}` - show only objects of adapters `influxdb' or 'sql' or 'history'
     - `{common: {custom: 'adapterName.'}}` - show only objects of the custom settings for specific adapter (all instances)
     - `{type: 'channel'}` - show only channels
     - `{type: ['channel', 'device']}` - show only channels and devices
     - `{common: {type: 'number'}` - show only states of type 'number
     - `{common: {type: ['number', 'string']}` - show only states of type 'number and string
     - `{common: {role: 'switch']}` - show only states with roles starting from switch
     - `{common: {role: ['switch', 'button]}` - show only states with roles starting from `switch` and `button`
     */
    filter?: {
        common?: {
            custom?: true | string | '_dataSources';
            type?: ioBroker.CommonType | ioBroker.CommonType[];
            role?: string | string[];
        };
        type?: ioBroker.ObjectType | ioBroker.ObjectType[];
    };

    /** Name of the widget field */
    name: string;
    /** Field label (i18n) */
    label?: string;
    /** JS Function for conditional visibility */
    hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    tooltip?: string;
    /** JS Function for conditional disability */
    disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    noBinding?: boolean;
    /** Callback called if the field value changed */
    onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
} | {
    /** Field type */
    type: 'instance';
    /** Field default value */
    default?: string;
    /** Additionally, you can provide `adapter` to filter the instances of specific adapter. With special adapter name `_dataSources` you can get all adapters with flag `common.getHistory`. */
    adapter?: string;
    /** In this case only instance number (like `0`) is shown and not `history.0`. It can be set to true only with non-empty `adapter` setting. */
    iShort?: boolean;

    /** Name of the widget field */
    name: string;
    /** Field label (i18n) */
    label?: string;
    /** JS Function for conditional visibility */
    hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    tooltip?: string;
    /** JS Function for conditional disability */
    disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    noBinding?: boolean;
    /** Callback called if the field value changed */
    onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
} | {
    /** Field type */
    type: 'select' | 'nselect' | 'auto';
    /** Options for select type */
    options: { value: string; label: string }[] | string[];
    /** Field default value */
    default?: string;
    /** Do not translate options */
    noTranslation?: boolean;

    /** Name of the widget field */
    name: string;
    /** Field label (i18n) */
    label?: string;
    /** JS Function for conditional visibility */
    hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    tooltip?: string;
    /** JS Function for conditional disability */
    disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    noBinding?: boolean;
    /** Callback called if the field value changed */
    onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
} | {
    /** Field type */
    type: 'checkbox';
    /** Field default value */
    default?: boolean;

    /** Name of the widget field */
    name: string;
    /** Field label (i18n) */
    label?: string;
    /** JS Function for conditional visibility */
    hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    tooltip?: string;
    /** JS Function for conditional disability */
    disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    noBinding?: boolean;
    /** Callback called if the field value changed */
    onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
} | {
    /** Field type */
    type: 'number';
    /** Field default value */
    default?: number;
    /** Number min value */
    min?: number;
    /** Number max value */
    max? : number;
    /** Number step */
    step? : number;

    /** Name of the widget field */
    name: string;
    /** Field label (i18n) */
    label?: string;
    /** JS Function for conditional visibility */
    hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    tooltip?: string;
    /** JS Function for conditional disability */
    disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    noBinding?: boolean;
    /** Callback called if the field value changed */
    onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
} | {
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
    /** Slider marks?: array of possible marks. Like `[{value: 1, label: 'one'}, {value: 10}, {value: 100}] */
    marks?: { value: number; label: string }[];
    /** Controls when the value label is displayed: `auto` the value label will display when the thumb is hovered or focused. `on` will display persistently. `off` will never display. */
    valueLabelDisplay?: 'on' | 'off' | 'auto';

    /** Name of the widget field */
    name: string;
    /** Field label (i18n) */
    label?: string;
    /** JS Function for conditional visibility */
    hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    tooltip?: string;
    /** JS Function for conditional disability */
    disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    noBinding?: boolean;
    /** Callback called if the field value changed */
    onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
} | {
    /** Field type */
    type: 'widget';
    /** Field default value */
    default?: string;
    /** type of the widget, like `tplMaterial2Switches` */
    tpl?: string;
    /** if true, all widgets of all views will be shown, not only from the current view. Default is false. */
    all?: boolean;
    /**  if true, grouped widgets will be shown too. Default is false. */
    withGroups?: boolean;
    /** if true, current widget will be shown in the list too. */
    withSelf?: boolean;
    /** if true, it will be checked if the widget is used somewhere else and user will be asked. */
    checkUsage?: boolean;
    /** if true, only widgets will be shown, which are not used in some view. Default is false. */
    hideUsed?: boolean;

    /** Name of the widget field */
    name: string;
    /** Field label (i18n) */
    label?: string;
    /** JS Function for conditional visibility */
    hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    tooltip?: string;
    /** JS Function for conditional disability */
    disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    noBinding?: boolean;
    /** Callback called if the field value changed */
    onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
} | {
    /** Field type */
    type: 'select-views';
    /** Field default value */
    default?: string;
    /** if false, only one view can be selected. Default is true. */
    multiple?: boolean;

    /** Name of the widget field */
    name: string;
    /** Field label (i18n) */
    label?: string;
    /** JS Function for conditional visibility */
    hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    tooltip?: string;
    /** JS Function for conditional disability */
    disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    noBinding?: boolean;
    /** Callback called if the field value changed */
    onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
} | {
    /** Field type */
    type: 'custom';
    /** Field default value */
    default?: string | number | boolean;
    /** if false, only one view can be selected. Default is true. */
    component: (
        field: RxWidgetInfoAttributesField,
        data: Record<string, any>,
        onDataChange: (newData: Record<string, any>) => void,
        props: {
            context: {
                socket: Connection;
                projectName: string;
                instance: number;
                adapterName: string;
                views: Project;
            };
            selectedView: string;
            selectedWidgets: AnyWidgetId[];
            selectedWidget: AnyWidgetId;
        },
    ) => React.JSX.Element | React.JSX.Element[] ;

    /** Name of the widget field */
    name: string;
    /** Field label (i18n) */
    label?: string;
    /** JS Function for conditional visibility */
    hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    tooltip?: string;
    /** JS Function for conditional disability */
    disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    noBinding?: boolean;
    /** Callback called if the field value changed */
    onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
} | {
    /** Field type */
    type: 'image' | 'color' | 'password' | 'history' | 'hid' | 'icon' | 'dimension' | 'fontname' | 'groups' | 'class' | 'filters' | 'views' | 'style' | 'icon64';
    /** Field default value */
    default?: string;

    /** Name of the widget field */
    name: string;
    /** Field label (i18n) */
    label?: string;
    /** JS Function for conditional visibility */
    hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    tooltip?: string;
    /** JS Function for conditional disability */
    disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    noBinding?: boolean;
    /** Callback called if the field value changed */
    onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
} | {
    /** Field default value */
    default?: string;

    /** Name of the widget field */
    name: string;
    /** Field label (i18n) */
    label?: string;
    /** JS Function for conditional visibility */
    hidden?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Tooltip (i18n) */
    tooltip?: string;
    /** JS Function for conditional disability */
    disabled?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** JS Function for error */
    error?: string | ((data: any) => boolean) | ((data: any, index: number) => boolean);
    /** Do not show binding symbol fot this field */
    noBinding?: boolean;
    /** Callback called if the field value changed */
    onChange?: (field: WidgetAttributeInfo, data: Record<string, any>, changeData: (newData: Record<string, any>) => void, socket: Connection, index?: number) => Promise<void>;
}
