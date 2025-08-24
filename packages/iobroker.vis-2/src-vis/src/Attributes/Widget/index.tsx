import React, { Component } from 'react';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Checkbox,
    Divider,
    Button,
    IconButton,
    Tooltip,
    Box,
} from '@mui/material';

import {
    ArrowDownward,
    ArrowUpward,
    ExpandMore as ExpandMoreIcon,
    Lock as LockIcon,
    FilterAlt as FilterAltIcon,
    Colorize as ColorizeIcon,
    Code as CodeIcon,
    Info as InfoIcon,
    Delete,
    Add,
    LinkOff,
    Link as LinkIcon,
    ContentCopy,
} from '@mui/icons-material';

import { I18n, Icon, Utils, type LegacyConnection, type ThemeType } from '@iobroker/adapter-react-v5';

import { store, recalculateFields, updateWidget, selectWidget } from '@/Store';

import {
    type WidgetAttributeInfoStored,
    type WidgetAttributeIterable,
    type WidgetAttributesGroupInfoStored,
    type WidgetType,
    getWidgetTypes,
    parseAttributes,
} from '@/Vis/visWidgetsCatalog';
import { deepClone } from '@/Utils/utils';
import type {
    AnyWidgetId,
    Project,
    Widget as SingleGroupWidget,
    VisTheme,
    WidgetData,
    WidgetStyle,
    GroupData,
    RxWidgetInfoGroup,
    AdditionalIconSet,
} from '@iobroker/types-vis-2';

import commonStyles from '@/Utils/styles';
import WidgetField from './WidgetField';
import IODialog from '../../Components/IODialog';
import WidgetCSS from './WidgetCSS';
import WidgetJS from './WidgetJS';
import WidgetBindingField from './WidgetBindingField';

const ICONS: Record<string, React.JSX.Element> = {
    'group.fixed': <FilterAltIcon fontSize="small" />,
    locked: <LockIcon fontSize="small" />,
};

type GroupAction = 'add' | 'delete' | 'down' | 'up' | 'clone';

const styles: Record<string, any> = {
    accordionRoot: {
        p: 0,
        m: 0,
        minHeight: 'initial',
        '&:before': {
            opacity: 0,
        },
    },
    checkBox: {
        marginTop: '-4px !important',
    },
    emptyMoreIcon: {
        width: 24,
        height: 24,
    },
    fieldTitle: {
        width: 190,
        fontSize: '80%',
        position: 'relative',
        lineHeight: '21px',
    },
    fieldTitleDisabled: {
        opacity: 0.8,
    },
    fieldTitleError: (theme: VisTheme) => ({
        color: theme.palette.error.main,
    }),
    colorizeDiv: {
        '& svg:hover': {
            opacity: 1,
        },
        '& svg::active': {
            transform: 'scale(0.8)',
        },
    },
    colorize: {
        display: 'none',
        float: 'right',
        right: 0,
        cursor: 'pointer',
        opacity: 0.3,
    },
    fieldRow: {
        '&:hover $colorize': {
            display: 'initial',
        },
    },
    fieldDivider: {
        width: '100%',
        height: 2,
        backgroundColor: '#999999',
    },
    groupButton: {
        width: 24,
        height: 24,
    },
    grow: {
        flexGrow: 1,
    },
    fieldInput: {
        width: '100%',
    },
    groupSummary: {
        marginTop: '10px',
        borderRadius: '4px',
        padding: '2px',
    },
    groupSummaryExpanded: {
        marginTop: '10px',
        borderTopRightRadius: '4px',
        borderTopLeftRadius: '4px',
        padding: '2px',
    },
    accordionOpenedSummary: {
        fontWeight: 'bold',
    },
    lightedPanel: (theme: VisTheme) => theme.classes.lightedPanel,
    accordionDetails: (theme: VisTheme) => ({
        ...theme.classes.lightedPanel,
        borderRadius: '0 0 4px 4px',
        flexDirection: 'column',
        p: 0,
        m: 0,
    }),
    infoIcon: {
        verticalAlign: 'middle',
        marginLeft: 3,
    },
    bindIconSpan: {
        verticalAlign: 'middle',
        marginLeft: 3,
        float: 'right',
        cursor: 'pointer',
    },
    bindIcon: {
        width: 16,
        height: 16,
    },
    smallImageDiv: {
        width: 30,
        height: 30,
        display: 'inline-block',
        float: 'right',
    },
    smallImage: {
        maxWidth: '100%',
        maxHeight: '100%',
    },
    widgetIcon: {
        overflow: 'hidden',
        width: 40,
        height: 40,
        display: 'inline-block',
        marginRight: 4,
    },
    icon: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    widgetImage: {
        display: 'block',
        width: 30,
        height: 30,
        transformOrigin: '0 0',
    },
    iconFolder: {
        verticalAlign: 'middle',
        marginRight: 6,
        marginTop: -3,
        fontSize: 20,
        color: '#00dc00',
    },
    listFolder: {
        backgroundColor: 'inherit',
        lineHeight: '36px',
    },
    coloredWidgetSet: {
        padding: '0 3px',
        borderRadius: 3,
    },
    widgetName: {
        verticalAlign: 'top',
        display: 'inline-block',
    },
    widgetType: {
        verticalAlign: 'top',
        display: 'inline-block',
        fontSize: 12,
        fontStyle: 'italic',
        marginLeft: 8,
    },
    widgetNameText: {
        lineHeight: '20px',
    },
    fieldHelp: (theme: VisTheme) => ({
        fontSize: 12,
        fontStyle: 'italic',
        pl: '16px',
        color: theme.palette.mode === 'dark' ? '#00931a' : '#014807',
    }),
};

const WIDGET_ICON_HEIGHT = 34;
const IMAGE_TYPES = ['.png', '.jpg', '.svg', '.gif', '.apng', '.avif', '.webp'];

interface PaletteGroup extends WidgetAttributesGroupInfoStored {
    isStyle?: boolean;
    hasValues?: boolean;
}

interface WidgetProps {
    selectedView: string;
    selectedWidgets: AnyWidgetId[];
    socket: LegacyConnection;
    themeType: ThemeType;
    theme: VisTheme;
    projectName: string;
    adapterName: string;
    instance: number;
    widgetsLoaded: boolean;
    changeProject: (newProject: Project) => void;
    editMode: boolean;
    isAllClosed: boolean;
    setIsAllClosed: (isAllClosed: boolean) => void;
    isAllOpened: boolean;
    setIsAllOpened: (isAllOpened: boolean) => void;
    triggerAllOpened: number;
    triggerAllClosed: number;
    fonts: string[];
    cssClone: (attr: string, cb: (value: string | number | boolean | null) => void) => void;
    onPxToPercent: (widgets: string[], attr: string, cb: (newValues: string[]) => void) => void;
    onPercentToPx: (widgets: string[], attr: string, cb: (newValues: string[]) => void) => void;
    userGroups: ioBroker.UserGroup[];
    additionalSets: AdditionalIconSet;
}

interface WidgetState {
    cssDialogOpened: boolean;
    jsDialogOpened: boolean;
    clearGroup: PaletteGroup | null;
    showWidgetCode: boolean;
    triggerAllOpened: number;
    triggerAllClosed: number;
    accordionOpen: Record<string, 0 | 1 | 2>; // 0 - closed, 1 - opened, 2 - closing
    widgetsLoaded: boolean;
    widgetTypes: WidgetType[] | null;
    fields: PaletteGroup[] | null;
    transitionTime: number;
    bindFields: string[];
    customFields: WidgetAttributesGroupInfoStored[];
    isDifferent: { [fieldName: string]: boolean };
    commonValues: { data?: WidgetData; style?: WidgetStyle };
    widgetType: WidgetType | undefined;
}

class Widget extends Component<WidgetProps, WidgetState> {
    private readonly fieldsBefore: PaletteGroup[];

    private readonly fieldsSignals: PaletteGroup[];

    private readonly imageRef: React.RefObject<HTMLImageElement>;

    private recalculateTimer: ReturnType<typeof setTimeout> | null = null;

    private triggerTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(props: WidgetProps) {
        super(props);

        const accordionOpenStr = window.localStorage.getItem('attributesWidget');
        let accordionOpen: Record<string, 0 | 1 | 2>;
        if (accordionOpenStr && accordionOpenStr[0] === '{') {
            try {
                accordionOpen = JSON.parse(accordionOpenStr) as Record<string, 0 | 1 | 2>;
                // convert from old
                Object.keys(accordionOpen).forEach(key => {
                    if ((accordionOpen[key] as any) === true || accordionOpen[key] === 1) {
                        accordionOpen[key] = 1;
                    } else {
                        accordionOpen[key] = 0;
                    }
                });
            } catch {
                accordionOpen = {};
            }
        } else {
            accordionOpen = {};
        }

        this.state = {
            cssDialogOpened: false,
            jsDialogOpened: false,
            clearGroup: null,
            showWidgetCode: window.localStorage.getItem('showWidgetCode') === 'true',
            triggerAllOpened: 0,
            triggerAllClosed: 0,
            accordionOpen,
            widgetsLoaded: props.widgetsLoaded,
            widgetTypes: null,
            fields: null,
            transitionTime: 0,
            bindFields: null,
            customFields: null,
            isDifferent: null,
            commonValues: null,
            widgetType: null,
        };

        this.fieldsBefore = Widget.getFieldsBefore();
        this.fieldsSignals = [];
        for (let i = 0; i <= 3; i++) {
            this.fieldsSignals.push(Widget.getSignals(i));
        }

        this.imageRef = React.createRef();
    }

    static getFieldsBefore(): PaletteGroup[] {
        return [
            {
                name: 'fixed',
                fields: [
                    { name: 'name' },
                    { name: 'comment' },
                    { name: 'class', type: 'class' },
                    { name: 'filterkey', type: 'filters' },
                    { name: 'multi-views', type: 'select-views' },
                    { name: 'locked', type: 'checkbox' },
                ],
            },
            {
                name: 'visibility',
                fields: [
                    { name: 'visibility-oid', type: 'id' },
                    {
                        name: 'visibility-cond',
                        type: 'select',
                        options: ['==', '!=', '<=', '>=', '<', '>', 'consist', 'not consist', 'exist', 'not exist'],
                        default: '==',
                    },
                    { name: 'visibility-val', default: 1 },
                    { name: 'visibility-groups', type: 'groups' },
                    {
                        name: 'visibility-groups-action',
                        type: 'select',
                        options: ['hide', 'disabled'],
                        default: 'hide',
                    },
                ],
            },
        ];
    }

    static getSignals(count: number): PaletteGroup {
        const result: PaletteGroup = {
            name: 'signals',
            fields: [
                {
                    name: 'signals-count',
                    label: 'signals-count',
                    type: 'select',
                    // noTranslation: true,
                    options: ['0', '1', '2', '3', '4', '5', '6'],
                    default: '0',
                    noTranslation: true,
                    immediateChange: true,
                },
            ],
        };

        for (let i = 0; i < count; i++) {
            const moreFields: WidgetAttributeInfoStored[] = [
                { type: 'delimiter', name: 'ignored' },
                { name: `signals-oid-${i}`, type: 'id' },
                {
                    name: `signals-cond-${i}`,
                    type: 'select',
                    noTranslation: true,
                    options: ['==', '!=', '<=', '>=', '<', '>', 'consist', 'not consist', 'exist', 'not exist'],
                    default: '==',
                },
                { name: `signals-val-${i}`, default: 'true' },
                {
                    name: `signals-icon-${i}`,
                    type: 'image',
                    default: '',
                    hidden: `!!data["signals-smallIcon-${i}"]`,
                },
                {
                    name: `signals-smallIcon-${i}`,
                    type: 'icon64',
                    default: '',
                    label: `signals-smallIcon-${i}`,
                    hidden: `!!data["signals-icon-${i}"]`,
                },
                {
                    name: `signals-color-${i}`,
                    type: 'color',
                    label: 'signals-color',
                    default: '',
                    hidden: `!data["signals-smallIcon-${i}"] && !data["signals-text-${i}"]`,
                },
                {
                    name: `signals-icon-size-${i}`,
                    type: 'slider',
                    min: 1,
                    max: 120,
                    step: 1,
                    default: 0,
                },
                { name: `signals-icon-style-${i}` },
                { name: `signals-text-${i}`, label: 'signals-text', tooltip: 'signals-text-tooltip' },
                { name: `signals-text-style-${i}` },
                { name: `signals-text-class-${i}` },
                { name: `signals-blink-${i}`, type: 'checkbox', default: false },
                {
                    name: `signals-horz-${i}`,
                    type: 'slider',
                    min: -20,
                    max: 120,
                    step: 1,
                    default: 0,
                },
                {
                    name: `signals-vert-${i}`,
                    type: 'slider',
                    min: -20,
                    max: 120,
                    step: 1,
                    default: 0,
                },
                { name: `signals-hide-edit-${i}`, type: 'checkbox', default: false },
            ];

            result.fields = result.fields.concat(moreFields);
        }

        return result;
    }

    static getFieldsAfter(widget: { data?: WidgetData; style?: WidgetStyle }, fonts: string[]): PaletteGroup[] {
        const groups: PaletteGroup[] = [
            {
                name: 'css_common',
                isStyle: true,
                fields: [
                    { name: 'position', type: 'nselect', options: ['', 'relative', 'sticky'] },
                    { name: 'display', type: 'nselect', options: ['', 'inline-block'] },
                    { name: 'left', type: 'dimension' },
                    { name: 'top', type: 'dimension' },
                    { name: 'width', type: 'dimension' },
                    { name: 'height', type: 'dimension' },
                    {
                        name: 'z-index',
                        type: 'number',
                        min: -200,
                        max: 200,
                    },
                    {
                        name: 'overflow-x',
                        type: 'nselect',
                        options: ['', 'visible', 'hidden', 'scroll', 'auto', 'initial', 'inherit'],
                    },
                    {
                        name: 'overflow-y',
                        type: 'nselect',
                        options: ['', 'visible', 'hidden', 'scroll', 'auto', 'initial', 'inherit'],
                    },
                    { name: 'opacity', type: 'text' },
                    {
                        name: 'cursor',
                        type: 'auto',
                        options: [
                            'alias',
                            'all-scroll',
                            'auto',
                            'cell',
                            'col-resize',
                            'context-menu',
                            'copy',
                            'crosshair',
                            'default',
                            'e-resize',
                            'ew-resize',
                            'grab',
                            'grabbing',
                            'help',
                            'move',
                            'n-resize',
                            'ne-resize',
                            'nesw-resize',
                            'ns-resize',
                            'nw-resize',
                            'nwse-resize',
                            'no-drop',
                            'none',
                            'not-allowed',
                            'pointer',
                            'progress',
                            'row-resize',
                            's-resize',
                            'se-resize',
                            'sw-resize',
                            'text',
                            'vertical-text',
                            'w-resize',
                            'wait',
                            'zoom-in',
                            'zoom-out',
                            'initial',
                            'inherit',
                        ],
                    },
                    { name: 'transform' },
                ],
            },
            {
                name: 'css_font_text',
                isStyle: true,
                fields: [
                    { name: 'color', type: 'color' },
                    {
                        name: 'text-align',
                        type: 'nselect',
                        options: ['', 'left', 'right', 'center', 'justify', 'initial', 'inherit'],
                    },
                    { name: 'text-shadow' },
                    {
                        name: 'font-family',
                        type: 'auto',
                        options: fonts,
                    },
                    {
                        name: 'font-style',
                        type: 'nselect',
                        options: ['', 'normal', 'italic', 'oblique', 'initial', 'inherit'],
                    },
                    {
                        name: 'font-variant',
                        type: 'nselect',
                        options: ['', 'normal', 'small-caps', 'initial', 'inherit'],
                    },
                    {
                        name: 'font-weight',
                        type: 'auto',
                        options: ['normal', 'bold', 'bolder', 'lighter', 'initial', 'inherit'],
                    },
                    {
                        name: 'font-size',
                        type: 'auto',
                        options: [
                            'medium',
                            'xx-small',
                            'x-small',
                            'small',
                            'large',
                            'x-large',
                            'xx-large',
                            'smaller',
                            'larger',
                            'initial',
                            'inherit',
                        ],
                    },
                    { name: 'line-height' },
                    { name: 'letter-spacing' },
                    { name: 'word-spacing' },
                ],
            },
            {
                name: 'css_background',
                isStyle: true,
                fields: [
                    { name: 'background' },
                    { name: 'background-color', type: 'color' },
                    { name: 'background-image' },
                    {
                        name: 'background-repeat',
                        type: 'nselect',
                        options: ['', 'repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'initial', 'inherit'],
                    },
                    {
                        name: 'background-attachment',
                        type: 'nselect',
                        options: ['', 'scroll', 'fixed', 'local', 'initial', 'inherit'],
                    },
                    { name: 'background-position' },
                    { name: 'background-size' },
                    {
                        name: 'background-clip',
                        type: 'nselect',
                        options: ['', 'border-box', 'padding-box', 'content-box', 'initial', 'inherit'],
                    },
                    {
                        name: 'background-origin',
                        type: 'nselect',
                        options: ['', 'padding-box', 'border-box', 'content-box', 'initial', 'inherit'],
                    },
                ],
            },
            {
                name: 'css_border',
                isStyle: true,
                fields: [
                    // { name: 'box-sizing', type: 'nselect', options: ['', 'border-box', 'content-box']  },
                    { name: 'border-width' },
                    {
                        name: 'border-style',
                        type: 'nselect',
                        options: [
                            '',
                            'dotted',
                            'dashed',
                            'solid',
                            'double',
                            'groove',
                            'ridge',
                            'inset',
                            'outset',
                            'hidden',
                        ],
                    },
                    { name: 'border-color', type: 'color' },
                    { name: 'border-radius' },
                ],
            },
            {
                name: 'css_shadow_padding',
                isStyle: true,
                fields: [
                    { name: 'padding' },
                    { name: 'padding-left' },
                    { name: 'padding-top' },
                    { name: 'padding-right' },
                    { name: 'padding-bottom' },
                    { name: 'box-shadow' },
                    { name: 'margin-left' },
                    { name: 'margin-top' },
                    { name: 'margin-right' },
                    { name: 'margin-bottom' },
                ],
            },
            {
                name: 'last_change',
                fields: [
                    { name: 'lc-oid', type: 'id' },
                    {
                        name: 'lc-type',
                        type: 'select',
                        options: ['last-change', 'timestamp'],
                        default: 'last-change',
                    },
                    { name: 'lc-is-interval', type: 'checkbox', default: true },
                    { name: 'lc-is-moment', type: 'checkbox', default: false },
                    {
                        name: 'lc-format',
                        type: 'auto',
                        options: [
                            'YYYY.MM.DD hh:mm:ss',
                            'DD.MM.YYYY hh:mm:ss',
                            'YYYY.MM.DD',
                            'DD.MM.YYYY',
                            'YYYY/MM/DD hh:mm:ss',
                            'YYYY/MM/DD',
                            'hh:mm:ss',
                        ],
                        default: '',
                    },
                    {
                        name: 'lc-position-vert',
                        type: 'select',
                        options: ['top', 'middle', 'bottom'],
                        default: 'top',
                    },
                    {
                        name: 'lc-position-horz',
                        type: 'select',
                        options: ['left', /* 'middle', */ 'right'],
                        default: 'right',
                    },
                    {
                        name: 'lc-offset-vert',
                        type: 'slider',
                        min: -120,
                        max: 120,
                        step: 1,
                        default: 0,
                    },
                    {
                        name: 'lc-offset-horz',
                        type: 'slider',
                        min: -120,
                        max: 120,
                        step: 1,
                        default: 0,
                    },
                    {
                        name: 'lc-font-size',
                        type: 'auto',
                        options: [
                            '',
                            'medium',
                            'xx-small',
                            'x-small',
                            'small',
                            'large',
                            'x-large',
                            'xx-large',
                            'smaller',
                            'larger',
                            'initial',
                            'inherit',
                        ],
                        default: '12px',
                    },
                    {
                        name: 'lc-font-family',
                        type: 'auto',
                        default: '',
                        options: fonts,
                    },
                    {
                        name: 'lc-font-style',
                        type: 'auto',
                        options: ['', 'normal', 'italic', 'oblique', 'initial', 'inherit'],
                        default: '',
                    },
                    { name: 'lc-bkg-color', type: 'color', default: '' },
                    { name: 'lc-color', type: 'color', default: '' },
                    { name: 'lc-border-width', default: '0' },
                    {
                        name: 'lc-border-style',
                        type: 'auto',
                        options: [
                            '',
                            'none',
                            'hidden',
                            'dotted',
                            'dashed',
                            'solid',
                            'double',
                            'groove',
                            'ridge',
                            'inset',
                            'outset',
                            'initial',
                            'inherit',
                        ],
                        default: '',
                    },
                    { name: 'lc-border-color', type: 'color', default: '' },
                    {
                        name: 'lc-border-radius',
                        type: 'slider',
                        min: 0,
                        max: 20,
                        step: 1,
                        default: 10,
                    },
                    {
                        name: 'lc-padding',
                        type: 'slider',
                        min: 0,
                        max: 20,
                        step: 1,
                        default: 3,
                    },
                    {
                        name: 'lc-zindex',
                        type: 'slider',
                        min: -10,
                        max: 20,
                        step: 1,
                        default: 0,
                    },
                ],
            },
        ];
        if (widget.style.position === 'relative' || widget.style.position === 'sticky') {
            groups[0].fields = groups[0].fields.filter(f => f.name !== 'left' && f.name !== 'top');
        }

        return groups;
    }

    static checkFunction(
        funcText: string | ((data: Record<string, any>, index: number, style: React.CSSProperties) => boolean),
        project: Project,
        selectedView: string,
        selectedWidgets: AnyWidgetId[],
        index: number,
    ): boolean {
        try {
            let _func;
            if (typeof funcText === 'function') {
                _func = funcText;
            } else {
                // eslint-disable-next-line no-new-func
                _func = new Function('data', 'index', 'style', `return ${funcText}`);
            }
            const isHidden = [];
            for (let i = 0; i < selectedWidgets.length; i++) {
                const widget: SingleGroupWidget = project[selectedView].widgets[selectedWidgets[i]];
                const data = widget?.data;
                const style = widget?.style;
                if (!widget) {
                    // strange error
                    console.warn(`Strange error, that widget ${selectedWidgets[i]} does not exists`);
                    continue;
                }
                isHidden.push(_func(data || {}, index, style || {}));
            }
            let _isHdn = isHidden[0];
            if (_isHdn && isHidden.find((hidden, i) => i > 0 && !hidden)) {
                _isHdn = false;
            }
            if (_isHdn) {
                return true;
            }
        } catch (e) {
            console.error(`Cannot execute hidden on "${funcText}": ${e}`);
        }
        return false;
    }

    componentDidMount(): void {
        if (this.state.widgetsLoaded) {
            this.setState({ widgetTypes: getWidgetTypes() }, () => this.recalculateFields());
        }
        this.setAccordionState();
    }

    static getDerivedStateFromProps(props: WidgetProps, state: WidgetState): Partial<WidgetState> | null {
        let newState: Partial<WidgetState> | null = null;
        if (props.widgetsLoaded && !state.widgetsLoaded) {
            newState = {};
            newState.widgetsLoaded = true;
            newState.widgetTypes = getWidgetTypes();
            store.dispatch(recalculateFields(true));
        }

        return newState;
    }

    recalculateFields(): void {
        if (!this.state.widgetTypes) {
            return;
        }
        console.log('Recalculate fields');
        const widgets = store.getState().visProject[this.props.selectedView]?.widgets;

        let widget: SingleGroupWidget;
        let widgetType: WidgetType | undefined;
        const commonFields: Record<string, number> = {};
        const commonGroups: { common: number; [groupName: string]: number } = {
            common: this.props.selectedWidgets.length,
        };
        const selectedWidgetsFields: WidgetAttributesGroupInfoStored[][] = [];

        widgets &&
            this.props.selectedWidgets.forEach((wid, widgetIndex) => {
                widget = widgets[wid];
                if (!widget) {
                    return;
                }

                widgetType = this.state.widgetTypes.find(type => type.name === widget.tpl);
                if (!widgetType) {
                    return;
                }

                let params: string | RxWidgetInfoGroup[];
                if (typeof widgetType.params === 'function') {
                    params = widgetType.params(widget.data, null, {
                        views: store.getState().visProject,
                        view: this.props.selectedView,
                        socket: this.props.socket,
                        themeType: this.props.themeType,
                        projectName: this.props.projectName,
                        adapterName: this.props.adapterName,
                        instance: this.props.instance,
                        id: wid,
                        widget,
                    });
                } else {
                    params = widgetType.params as string | RxWidgetInfoGroup[];
                }

                const fields: null | WidgetAttributesGroupInfoStored[] = parseAttributes(
                    params,
                    widgetIndex,
                    commonGroups,
                    commonFields,
                    widgetType.set,
                    widget.data,
                );

                fields && selectedWidgetsFields.push(fields);
            });

        let fields: WidgetAttributesGroupInfoStored[];
        const bindFields: string[] = [];
        const commonValues: { data?: WidgetData; style?: WidgetStyle } = {};
        const isDifferent: { [fieldName: string]: boolean } = {};
        const newState: Partial<WidgetState> = {};

        if (this.props.selectedWidgets.length > 1) {
            fields =
                selectedWidgetsFields[0]?.filter(group => {
                    if (commonGroups[group.name] < this.props.selectedWidgets.length) {
                        return false;
                    }
                    group.fields = group.fields.filter(
                        field => commonFields[`${group.name}.${field.name}`] === this.props.selectedWidgets.length,
                    );
                    return true;
                }) || [];

            this.props.selectedWidgets.forEach((wid, widgetIndex) => {
                const currentWidget = widgets[wid];
                if (!currentWidget) {
                    return;
                }
                if (widgetIndex === 0) {
                    commonValues.data = { ...currentWidget.data };
                    commonValues.style = { ...currentWidget.style };
                } else {
                    Object.keys(commonValues.data).forEach(field => {
                        if (commonValues.data[field] !== currentWidget.data[field]) {
                            commonValues.data[field] = null;
                            isDifferent[field] = true;
                        }
                    });
                    const anyStyle: Record<string, number | string | boolean | null | undefined> =
                        commonValues.style as Record<string, number | string | boolean | null | undefined>;
                    Object.keys(anyStyle).forEach(field => {
                        if (
                            anyStyle[field] !==
                            (currentWidget.style as Record<string, number | string | boolean | null | undefined>)[field]
                        ) {
                            anyStyle[field] = null;
                            isDifferent[field] = true;
                        }
                    });

                    currentWidget.data.bindings?.forEach(
                        attr => !bindFields.includes(`data_${attr}`) && bindFields.push(`data_${attr}`),
                    );
                    currentWidget.style.bindings?.forEach(
                        attr => !bindFields.includes(`style_${attr}`) && bindFields.push(`style_${attr}`),
                    );
                }
            });
        } else {
            fields = selectedWidgetsFields[0];

            widgets[this.props.selectedWidgets[0]].data.bindings?.forEach(
                attr => !bindFields.includes(`data_${attr}`) && bindFields.push(`data_${attr}`),
            );
            widgets[this.props.selectedWidgets[0]].style.bindings?.forEach(
                attr => !bindFields.includes(`style_${attr}`) && bindFields.push(`style_${attr}`),
            );
        }

        newState.bindFields = bindFields.sort();
        newState.customFields = fields;
        newState.isDifferent = isDifferent;
        newState.commonValues = commonValues;
        newState.widgetType = widgetType;

        let signalsCount = 3;

        if (this.props.selectedWidgets.length === 1) {
            const widgetData = widgets[this.props.selectedWidgets[0]].data;
            signalsCount = 0;
            // detect signals count
            if (!widgetData['signals-count']) {
                let i = 0;
                while (widgetData[`signals-oid-${i}`]) {
                    i++;
                }
                signalsCount = i + 1;
                if (signalsCount > 1) {
                    store.dispatch(
                        updateWidget({
                            widgetId: this.props.selectedWidgets[0],
                            viewId: this.props.selectedView,
                            data: { ...widget, data: { ...widget.data, 'signals-count': signalsCount } },
                        }),
                    );
                }
            } else {
                signalsCount = parseInt(widgetData['signals-count'], 10);
            }
        }

        const fieldsAfter = Widget.getFieldsAfter(
            this.props.selectedWidgets.length === 1 ? widget : commonValues,
            this.props.fonts,
        );
        const fieldsSignals = this.fieldsSignals[signalsCount] || this.fieldsSignals[3];
        if (fields) {
            const customGroups: PaletteGroup[] = fields.map(group => ({
                fields: group.fields,
                name: group.name,
                hidden: group.hidden,
                label: group.label,
                index: group.index,
                iterable: group.iterable,
                singleName: group.singleName,
            }));

            newState.fields = [...this.fieldsBefore, ...customGroups, ...fieldsAfter, ...[fieldsSignals]];
        }

        widgets &&
            newState.fields?.forEach((group: PaletteGroup) => {
                const type = group.isStyle ? 'style' : 'data';
                const found = this.props.selectedWidgets.find(selectedWidget => {
                    const fieldFound = group.fields.find(field => {
                        const fieldValue: string | number | boolean | null | undefined = (
                            widgets[selectedWidget][type] as Record<string, string | number | boolean | null>
                        )[field.name];
                        return fieldValue !== undefined;
                    });
                    return fieldFound !== undefined;
                });
                group.hasValues = found !== undefined;
            });

        newState.transitionTime = 0;

        this.setState(newState as WidgetState, () => this.setAccordionState());
        store.dispatch(recalculateFields(false));
    }

    componentWillUnmount(): void {
        this.recalculateTimer && clearTimeout(this.recalculateTimer);
        this.recalculateTimer = null;

        this.triggerTimer && clearTimeout(this.triggerTimer);
        this.triggerTimer = null;
    }

    renderHeader(widgets: Record<string, SingleGroupWidget>): React.JSX.Element {
        let list;
        // If selected only one widget, show its icon
        if (this.props.selectedWidgets.length === 1) {
            const tpl = widgets[this.props.selectedWidgets[0]].tpl;
            const _widgetType = this.state.widgetTypes.find(foundWidgetType => foundWidgetType.name === tpl);
            let widgetLabel = _widgetType?.title || '';
            let widgetColor = _widgetType?.setColor;
            if (_widgetType?.label) {
                widgetLabel = I18n.t(_widgetType.label);
            }
            // remove legacy stuff
            widgetLabel = widgetLabel.split('<br')[0];
            widgetLabel = widgetLabel.split('<span')[0];
            widgetLabel = widgetLabel.split('<div')[0];

            let setLabel = _widgetType?.set;
            if (_widgetType?.setLabel) {
                setLabel = I18n.t(_widgetType.setLabel);
            } else if (setLabel) {
                const widgetWithSetLabel = this.state.widgetTypes.find(w => w.set === setLabel && w.setLabel);
                if (widgetWithSetLabel) {
                    widgetColor = widgetWithSetLabel.setColor;
                    setLabel = I18n.t(widgetWithSetLabel.setLabel);
                }
            }

            let widgetIcon = _widgetType?.preview || '';
            if (widgetIcon.startsWith('<img')) {
                const prev = widgetIcon.match(/src="([^"]+)"/);
                if (prev && prev[1]) {
                    widgetIcon = prev[1];
                }
            }

            let img;
            if (_widgetType?.preview?.startsWith('<img')) {
                const m = _widgetType?.preview.match(/src="([^"]+)"/) || _widgetType?.preview.match(/src='([^']+)'/);
                if (m) {
                    img = (
                        <img
                            src={m[1]}
                            style={styles.icon}
                            alt={this.props.selectedWidgets[0]}
                        />
                    );
                }
            } else if (
                _widgetType?.preview &&
                IMAGE_TYPES.find(ext => _widgetType.preview.toLowerCase().endsWith(ext))
            ) {
                img = (
                    <img
                        src={_widgetType?.preview}
                        style={styles.icon}
                        alt={this.props.selectedWidgets[0]}
                    />
                );
            }

            if (!img) {
                img = (
                    <span
                        style={styles.widgetImage}
                        ref={this.imageRef}
                        dangerouslySetInnerHTML={{ __html: _widgetType?.preview }}
                    />
                );
            }

            let widgetBackColor;
            if (widgetColor) {
                widgetBackColor = Utils.getInvertedColor(widgetColor, this.props.themeType, false);
                if (widgetBackColor === '#DDD') {
                    widgetBackColor = '#FFF';
                } else if (widgetBackColor === '#111') {
                    widgetBackColor = '#000';
                }
            }
            if (tpl === '_tplGroup') {
                widgetLabel = I18n.t('group');
            }
            if (widgets[this.props.selectedWidgets[0]].marketplace) {
                setLabel = `${widgets[this.props.selectedWidgets[0]].marketplace.name}`;
                widgetLabel = `${I18n.t('version')} ${widgets[this.props.selectedWidgets[0]].marketplace.version}`;
            }
            list = (
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {widgetIcon ? <div style={styles.widgetIcon}>{img}</div> : null}
                    <div style={styles.widgetName}>{this.props.selectedWidgets[0]}</div>
                    <div style={styles.widgetType}>
                        <div
                            style={{
                                ...styles.widgetNameText,
                                ...(widgetBackColor ? styles.coloredWidgetSet : undefined),
                                fontWeight: 'bold',
                                color: widgetColor,
                                backgroundColor: widgetBackColor,
                            }}
                        >
                            {setLabel}
                        </div>
                        <div style={styles.widgetNameText}>{widgetLabel}</div>
                    </div>
                    {!widgets[this.props.selectedWidgets[0]].marketplace && (
                        <>
                            {window.location.port === '3000' ? (
                                <Button onClick={() => this.setState({ cssDialogOpened: true })}>CSS</Button>
                            ) : null}
                            {window.location.port === '3000' ? (
                                <Button onClick={() => this.setState({ jsDialogOpened: true })}>JS</Button>
                            ) : null}
                            {this.state.cssDialogOpened ? (
                                <WidgetCSS
                                    onClose={() => this.setState({ cssDialogOpened: false })}
                                    widget={widgets[this.props.selectedWidgets[0]]}
                                    onChange={value => {
                                        const project = deepClone(store.getState().visProject);
                                        project[this.props.selectedView].widgets[this.props.selectedWidgets[0]].css =
                                            value;
                                        this.props.changeProject(project);
                                    }}
                                    themeType={this.props.themeType}
                                    editMode={this.props.editMode}
                                />
                            ) : null}
                            {this.state.jsDialogOpened ? (
                                <WidgetJS
                                    onClose={() => this.setState({ jsDialogOpened: false })}
                                    widget={widgets[this.props.selectedWidgets[0]]}
                                    onChange={value => {
                                        const project = deepClone(store.getState().visProject);
                                        project[this.props.selectedView].widgets[this.props.selectedWidgets[0]].js =
                                            value;
                                        this.props.changeProject(project);
                                    }}
                                    themeType={this.props.themeType}
                                    editMode={this.props.editMode}
                                />
                            ) : null}
                        </>
                    )}
                </div>
            );
        } else {
            list = this.props.selectedWidgets.join(', ');
        }
        return (
            <div
                key="header"
                style={{ width: '100%', overflow: 'hidden' }}
            >
                {list}
            </div>
        );
    }

    setAccordionState(accordionOpen?: { [groupName: string]: 0 | 1 | 2 }, cb?: () => void): void {
        if (!this.state.fields) {
            return;
        }

        const _accordionOpen = accordionOpen || this.state.accordionOpen;
        const allOpened = !this.state.fields.find(
            group => _accordionOpen[group.name] === 0 || _accordionOpen[group.name] === 2,
        );
        const allClosed = !this.state.fields.find(group => _accordionOpen[group.name] === 1);

        if (this.props.isAllClosed !== allClosed) {
            setTimeout(() => this.props.setIsAllClosed(allClosed), 50);
        }
        if (this.props.isAllOpened !== allOpened) {
            setTimeout(() => this.props.setIsAllOpened(allOpened), 50);
        }

        if (accordionOpen && JSON.stringify(accordionOpen) !== JSON.stringify(this.state.accordionOpen)) {
            window.localStorage.setItem('attributesWidget', JSON.stringify(accordionOpen));
            this.setState({ accordionOpen }, cb ? () => cb() : undefined);
        } else {
            cb && cb();
        }
        setTimeout(() => this.setState({ transitionTime: 200 }), 500);
    }

    componentDidUpdate(): void {
        // scale the old style HTML widget icon
        if (this.imageRef.current?.children[0]) {
            const height = this.imageRef.current.children[0].clientHeight;
            if (height > WIDGET_ICON_HEIGHT) {
                this.imageRef.current.style.transform = `scale(${WIDGET_ICON_HEIGHT / height})`;
            }
        }
    }

    onGroupMove(e: React.MouseEvent, index: number, iterable: WidgetAttributeIterable, direction: GroupAction): void {
        e.stopPropagation();
        const project = deepClone(store.getState().visProject);
        const oldGroup = this.state.fields.find(f => f.name === `${iterable.group}-${index}`);
        const _widgets = project[this.props.selectedView].widgets;
        const accordionOpen = { ...this.state.accordionOpen };

        // if deletion
        if (direction === 'delete') {
            if (iterable.indexTo) {
                const lastGroup = this.state.fields.find(f => f.singleName === iterable.group && f.iterable?.isLast);
                for (let idx = index; idx < lastGroup.index; idx++) {
                    const idxGroup = this.state.fields.find(f => f.name === `${iterable.group}-${idx}`);
                    const idxGroupPlus = this.state.fields.find(f => f.name === `${iterable.group}-${idx + 1}`);
                    // for every selected widget
                    this.props.selectedWidgets.forEach(wid => {
                        const widgetData = _widgets[wid].data;
                        // move all fields of the group to -1
                        idxGroup.fields.forEach(
                            (_attr, i) =>
                                (widgetData[idxGroup.fields[i].name] = widgetData[idxGroupPlus.fields[i].name]),
                        );

                        // move the group-used flag
                        widgetData[`g_${iterable.group}-${idx}`] = widgetData[`g_${iterable.group}-${idx + 1}`];

                        // move the opened flag
                        accordionOpen[`${iterable.group}-${idx}`] = accordionOpen[`${iterable.group}-${idx + 1}`];
                    });
                }

                // delete last group
                this.props.selectedWidgets.forEach(wid => {
                    // order all attributes for better readability
                    const widgetData = _widgets[wid].data;

                    // delete all fields of the group
                    lastGroup.fields.forEach(attr => {
                        delete widgetData[attr.name];
                    });

                    // delete group-used flag
                    delete widgetData[`g_${iterable.group}-${lastGroup.index}`];

                    // delete the opened flag
                    delete accordionOpen[`${iterable.group}-${lastGroup.index}`];
                    widgetData[iterable.indexTo]--;
                });

                this.setAccordionState(accordionOpen, () => {
                    this.props.changeProject(project);
                    store.dispatch(recalculateFields(true));
                });
            }
            return;
        }

        if (direction === 'clone') {
            const lastGroup = this.state.fields.find(f => f.singleName === iterable.group && f.iterable?.isLast);
            // move all indexes after the current one
            // add one line
            const maxIndex = lastGroup.index;
            this.props.selectedWidgets.forEach(wid => {
                // order all attributes for better readability
                const widgetData = _widgets[wid].data;
                for (let i = maxIndex; i > index; i--) {
                    lastGroup.fields.forEach(attr => {
                        const oldName = attr.name.replace(/\d?\d+$/, i.toString());
                        widgetData[oldName.replace(/\d?\d+$/, (i + 1).toString())] = widgetData[oldName];
                    });

                    // move group-used flag
                    widgetData[`g_${iterable.group}-${i + 1}`] = widgetData[`g_${iterable.group}-${i}`];

                    // move the opened flag
                    accordionOpen[`${iterable.group}-${i + 1}`] = accordionOpen[`${iterable.group}-${i}`];
                }
                // copy current into index + 1
                lastGroup.fields.forEach(attr => {
                    const oldName = attr.name.replace(/\d?\d+$/, index.toString());
                    widgetData[oldName.replace(/\d?\d+$/, (index + 1).toString())] = widgetData[oldName];
                });

                // enable group-used flag
                widgetData[`g_${iterable.group}-${index + 1}`] = true;

                // enable the opened flag
                accordionOpen[`${iterable.group}-${index + 1}`] = 1; // open
                widgetData[iterable.indexTo] = maxIndex + 1;
            });
            this.setAccordionState(accordionOpen, () => {
                this.props.changeProject(project);
                store.dispatch(recalculateFields(true));
            });
            return;
        }

        if (direction === 'add') {
            const lastGroup = this.state.fields.find(f => f.singleName === iterable.group && f.iterable?.isLast);
            // add one line
            const newIndex = lastGroup.index + 1;
            this.props.selectedWidgets.forEach(wid => {
                // order all attributes for better readability
                const widgetData = _widgets[wid].data;

                lastGroup.fields.forEach((_attr, i) => {
                    const name = lastGroup.fields[i].name.replace(/\d?\d+$/, newIndex.toString());
                    widgetData[name] = _attr.default ?? null;
                });

                // enable group-used flag
                widgetData[`g_${iterable.group}-${newIndex}`] = true;

                // enable the opened flag
                accordionOpen[`${iterable.group}-${newIndex}`] = 1; // open
                widgetData[iterable.indexTo] = newIndex;
            });
            this.setAccordionState(accordionOpen, () => {
                this.props.changeProject(project);
                store.dispatch(recalculateFields(true));
            });
        } else {
            const newIndex = index + (direction === 'up' ? -1 : 1);
            const newGroup = this.state.fields.find(f => f.name === `${iterable.group}-${newIndex}`);

            // for every selected widget
            this.props.selectedWidgets.forEach(wid => {
                // order all attributes for better readability
                const oldWidgetData = _widgets[wid].data;
                const widgetData: GroupData | WidgetData = {};
                Object.keys(oldWidgetData)
                    .sort()
                    .forEach(key => (widgetData[key] = oldWidgetData[key]));
                _widgets[wid].data = widgetData;

                // switch all fields of the group
                oldGroup.fields.forEach((attr, i) => {
                    const value = widgetData[newGroup.fields[i].name];
                    widgetData[newGroup.fields[i].name] = widgetData[attr.name];
                    widgetData[attr.name] = value;
                });

                // switch group-used flag
                let value = widgetData[`g_${iterable.group}-${newIndex}`];
                widgetData[`g_${iterable.group}-${newIndex}`] = widgetData[`g_${iterable.group}-${index}`];
                widgetData[`g_${iterable.group}-${index}`] = value;

                if (accordionOpen[`${iterable.group}-${newIndex}`] !== accordionOpen[`${iterable.group}-${index}`]) {
                    // copy the opened flag
                    value = accordionOpen[`${iterable.group}-${newIndex}`];
                    accordionOpen[`${iterable.group}-${newIndex}`] = accordionOpen[`${iterable.group}-${index}`];
                    accordionOpen[`${iterable.group}-${index}`] = value;
                    this.setState({ accordionOpen });
                }
            });

            this.setAccordionState(accordionOpen, () => {
                this.props.changeProject(project);
                store.dispatch(recalculateFields(true));
            });
        }
    }

    renderGroupHeader(group: PaletteGroup): React.JSX.Element {
        return (
            <AccordionSummary
                sx={{
                    '&.MuiAccordionSummary-root': Utils.getStyle(
                        this.props.theme,
                        commonStyles.clearPadding,
                        this.state.accordionOpen[group.name] === 1 && group.hasValues
                            ? styles.groupSummaryExpanded
                            : styles.groupSummary,
                        styles.lightedPanel,
                    ),
                    '& .MuiAccordionSummary-content': Utils.getStyle(
                        this.props.theme,
                        commonStyles.clearPadding,
                        this.state.accordionOpen[group.name] === 1 && group.hasValues && styles.accordionOpenedSummary,
                    ),
                    '& .Mui-expanded': commonStyles.clearPadding,
                    // expandIcon: classes.clearPadding,
                }}
                expandIcon={group.hasValues ? <ExpandMoreIcon /> : <div style={styles.emptyMoreIcon} />}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'center',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {ICONS[`group.${group.singleName || group.name}`]
                            ? ICONS[`group.${group.singleName || group.name}`]
                            : null}
                        {group.label
                            ? I18n.t(group.label) + (group.index !== undefined ? ` [${group.index}]` : '')
                            : window.vis._(`group_${group.singleName || group.name}`) +
                              (group.index !== undefined ? ` [${group.index}]` : '')}
                    </div>
                    {group.iterable ? (
                        <>
                            <div style={styles.grow} />
                            {group.iterable.indexTo ? (
                                <Tooltip
                                    title={I18n.t('Clone')}
                                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                                >
                                    <IconButton
                                        style={styles.groupButton}
                                        size="small"
                                        onClick={e => this.onGroupMove(e, group.index, group.iterable, 'clone')}
                                    >
                                        <ContentCopy />
                                    </IconButton>
                                </Tooltip>
                            ) : null}
                            {group.iterable.indexTo ? (
                                <Tooltip
                                    title={I18n.t('Delete')}
                                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                                >
                                    <IconButton
                                        style={styles.groupButton}
                                        size="small"
                                        onClick={e => this.onGroupMove(e, group.index, group.iterable, 'delete')}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Tooltip>
                            ) : null}
                            {group.iterable.isFirst ? (
                                <div style={styles.groupButton} />
                            ) : (
                                <Tooltip
                                    title={I18n.t('Move up')}
                                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                                >
                                    <IconButton
                                        style={styles.groupButton}
                                        size="small"
                                        onClick={e => this.onGroupMove(e, group.index, group.iterable, 'up')}
                                    >
                                        <ArrowUpward />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {group.iterable.isLast ? (
                                group.iterable.indexTo ? (
                                    <Tooltip
                                        title={I18n.t('Add')}
                                        slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                                    >
                                        <IconButton
                                            style={styles.groupButton}
                                            size="small"
                                            onClick={e => this.onGroupMove(e, group.index, group.iterable, 'add')}
                                        >
                                            <Add />
                                        </IconButton>
                                    </Tooltip>
                                ) : (
                                    <div style={styles.groupButton} />
                                )
                            ) : (
                                <Tooltip
                                    title={I18n.t('Move down')}
                                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                                >
                                    <IconButton
                                        style={styles.groupButton}
                                        size="small"
                                        onClick={e => this.onGroupMove(e, group.index, group.iterable, 'down')}
                                    >
                                        <ArrowDownward />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </>
                    ) : null}
                    <div>
                        <Checkbox
                            checked={group.hasValues}
                            onClick={e => {
                                if (group.hasValues) {
                                    const type = group.isStyle ? 'style' : 'data';
                                    // check is any attribute from this group is used
                                    let found = false;
                                    for (const selectedWidget of this.props.selectedWidgets) {
                                        for (const groupField of group.fields) {
                                            const value: number | string | boolean | null | undefined = (
                                                store.getState().visProject[this.props.selectedView].widgets[
                                                    selectedWidget
                                                ][type] as Record<string, number | string | boolean | null>
                                            )[groupField.name];
                                            if (value !== null && value !== undefined) {
                                                found = true;
                                                break;
                                            }
                                        }
                                    }

                                    if (found) {
                                        this.setState({ clearGroup: group });
                                    } else {
                                        this.onGroupDelete(group);
                                    }
                                } else {
                                    const project = deepClone(store.getState().visProject);
                                    const type = group.isStyle ? 'style' : 'data';
                                    this.props.selectedWidgets.forEach(wid => {
                                        group.fields.forEach(field => {
                                            const styleOrData: Record<
                                                string,
                                                number | string | boolean | null | undefined
                                            > = project[this.props.selectedView].widgets[wid][type] as Record<
                                                string,
                                                number | string | boolean | null | undefined
                                            >;
                                            if (styleOrData[field.name] === undefined) {
                                                styleOrData[field.name] = field.default || null;
                                            }
                                        });
                                        project[this.props.selectedView].widgets[wid].data[`g_${group.name}`] = true;
                                    });
                                    const accordionOpen = { ...this.state.accordionOpen };
                                    accordionOpen[group.name] = 1;
                                    this.setAccordionState(accordionOpen, () => this.props.changeProject(project));
                                }
                                e.stopPropagation();
                                store.dispatch(recalculateFields(true));
                            }}
                            size="small"
                            sx={Utils.getStyle(
                                this.props.theme,
                                commonStyles.fieldContent,
                                commonStyles.clearPadding,
                                styles.checkBox,
                            )}
                        />
                    </div>
                </div>
            </AccordionSummary>
        );
    }

    changeBinding(isStyle: boolean, attr: string): void {
        const project = deepClone(store.getState().visProject);
        const type = isStyle ? 'style' : 'data';
        for (const wid of this.props.selectedWidgets) {
            const widget = project[this.props.selectedView].widgets[wid];
            if (widget[type].bindings.includes(attr)) {
                widget[type].bindings.splice(widget[type].bindings.indexOf(attr), 1);
            } else {
                widget[type].bindings.push(attr);
            }
        }

        this.props.changeProject(project);
        store.dispatch(recalculateFields(true));
    }

    renderFieldRow(
        group: PaletteGroup,
        field: WidgetAttributeInfoStored,
        fieldIndex: number,
    ): React.JSX.Element | null {
        if (!field) {
            return null;
        }

        const selectedWidget = selectWidget(store.getState(), this.props.selectedView, this.props.selectedWidgets[0]);

        let error;
        let disabled;
        if (field.hidden) {
            if (field.hidden === true) {
                return null;
            }
            if (
                Widget.checkFunction(
                    field.hidden,
                    store.getState().visProject,
                    this.props.selectedView,
                    this.props.selectedWidgets,
                    field.index,
                )
            ) {
                return null;
            }
        }
        if (field.type === 'help') {
            return (
                <Box
                    component="tr"
                    key={fieldIndex}
                    sx={styles.fieldRow}
                >
                    <Box
                        component="td"
                        colSpan={2}
                        sx={styles.fieldHelp}
                        style={field.style}
                    >
                        {field.noTranslation ? field.text : I18n.t(field.text)}
                    </Box>
                </Box>
            );
        }
        if (field.type === 'delimiter') {
            return (
                <Box
                    component="tr"
                    key={fieldIndex}
                    sx={styles.fieldRow}
                >
                    <td
                        colSpan={2}
                        style={{ ...styles.fieldDivider, ...field.style }}
                    />
                </Box>
            );
        }

        if (field.error) {
            error = Widget.checkFunction(
                field.error,
                store.getState().visProject,
                this.props.selectedView,
                this.props.selectedWidgets,
                field.index,
            );
        }
        if (field.disabled) {
            if (field.disabled === true) {
                disabled = true;
            } else {
                disabled = !!Widget.checkFunction(
                    field.disabled,
                    store.getState().visProject,
                    this.props.selectedView,
                    this.props.selectedWidgets,
                    field.index,
                );
            }
        }
        let label;
        if (field.label === '') {
            label = '';
            // @ts-expect-error deprecated
        } else if (field.title) {
            // @ts-expect-error deprecated
            label = field.title;
        } else if (field.label) {
            label = I18n.t(field.label);
        } else {
            label =
                window.vis._(field.singleName || field.name) + (field.index !== undefined ? ` [${field.index}]` : '');
        }

        const labelStyle: React.CSSProperties = {};

        if (label.trim().startsWith('<b')) {
            label = label.match(/<b>(.*?)<\/b>/)[1];
            labelStyle.fontWeight = 'bold';
            labelStyle.color = '#4dabf5';
        }
        if (label.trim().startsWith('<i')) {
            label = label.match(/<i>(.*?)<\/i>/)[1];
            labelStyle.fontStyle = 'italic';
        }

        const isBoundField = this.state.bindFields.includes(
            group.isStyle ? `style_${field.name}` : `data_${field.name}`,
        );

        // @ts-expect-error fix later
        if (field.type === 'delimiter') {
            return (
                <Box
                    component="tr"
                    key={fieldIndex}
                    sx={styles.fieldRow}
                >
                    <td colSpan={2}>
                        <Divider style={{ borderBottomWidth: 'thick' }} />
                    </td>
                </Box>
            );
        }

        return (
            <Box
                component="tr"
                key={fieldIndex}
                sx={styles.fieldRow}
            >
                <Box
                    component="td"
                    sx={Utils.getStyle(
                        this.props.theme,
                        styles.fieldTitle,
                        disabled && styles.fieldTitleDisabled,
                        error && styles.fieldTitleError,
                    )}
                    title={field.tooltip ? I18n.t(field.tooltip) : null}
                    style={labelStyle}
                >
                    {ICONS[field.singleName || field.name] ? ICONS[field.singleName || field.name] : null}
                    {label}
                    {field.type === 'image' &&
                    !this.state.isDifferent[field.name] &&
                    selectedWidget?.data[field.name] ? (
                        <div style={styles.smallImageDiv}>
                            <Icon
                                src={
                                    selectedWidget.data[field.name].startsWith('_PRJ_NAME/')
                                        ? selectedWidget.data[field.name].replace(
                                              '_PRJ_NAME/',
                                              `../${this.props.adapterName}.${this.props.instance}/${this.props.projectName}/`,
                                          )
                                        : selectedWidget.data[field.name]
                                }
                                style={styles.smallImage}
                                onError={e => {
                                    (e.target as HTMLImageElement).onerror = null;
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                                alt={field.name}
                            />
                        </div>
                    ) : null}
                    {(field.type !== 'custom' || field.label) &&
                    // Checkboxes have no binding by default as widget must support value 'true' too. Bindings can deliver only strings
                    ((field.type === 'checkbox' && field.noBinding === false) ||
                        (field.type !== 'checkbox' && !field.noBinding)) ? (
                        isBoundField ? (
                            <span
                                style={styles.bindIconSpan}
                                title={I18n.t('Deactivate binding and use field as standard input')}
                            >
                                <LinkOff
                                    onClick={() => this.props.editMode && this.changeBinding(group.isStyle, field.name)}
                                    style={{ ...styles.bindIcon, cursor: disabled ? 'default' : undefined }}
                                />
                            </span>
                        ) : (
                            <span
                                style={styles.bindIconSpan}
                                title={I18n.t('Use field as binding')}
                            >
                                <LinkIcon
                                    style={{ ...styles.bindIcon, cursor: disabled ? 'default' : undefined }}
                                    onClick={() => this.props.editMode && this.changeBinding(group.isStyle, field.name)}
                                />
                            </span>
                        )
                    ) : null}
                    {group.isStyle ? (
                        <Box
                            component="span"
                            sx={styles.colorizeDiv}
                        >
                            <ColorizeIcon
                                fontSize="small"
                                style={styles.colorize}
                                onClick={() =>
                                    this.props.cssClone(field.name, newValue => {
                                        if (newValue !== null && newValue !== undefined) {
                                            const project = deepClone(store.getState().visProject);
                                            this.props.selectedWidgets.forEach(wid => {
                                                if (project[this.props.selectedView].widgets[wid]) {
                                                    project[this.props.selectedView].widgets[wid].style =
                                                        project[this.props.selectedView].widgets[wid].style || {};
                                                    (
                                                        project[this.props.selectedView].widgets[wid].style as Record<
                                                            string,
                                                            string | number | boolean | null
                                                        >
                                                    )[field.name] = newValue;
                                                }
                                            });
                                            this.props.changeProject(project);
                                        }
                                    })
                                }
                            />
                        </Box>
                    ) : null}
                    {field.tooltip ? <InfoIcon style={styles.infoIcon} /> : null}
                </Box>
                <Box component="td">
                    <div style={styles.fieldInput}>
                        {isBoundField ? (
                            <WidgetBindingField
                                theme={this.props.theme}
                                disabled={disabled}
                                field={field}
                                label={label}
                                widget={
                                    this.props.selectedWidgets.length > 1 ? this.state.commonValues : selectedWidget
                                }
                                isStyle={group.isStyle}
                                selectedView={this.props.selectedView}
                                selectedWidgets={this.props.selectedWidgets}
                                isDifferent={this.state.isDifferent[field.name]}
                                socket={this.props.socket}
                                changeProject={this.props.changeProject}
                            />
                        ) : (
                            <WidgetField
                                widgetType={this.state.widgetType}
                                themeType={this.props.themeType}
                                theme={this.props.theme}
                                disabled={disabled}
                                field={field}
                                widget={
                                    this.props.selectedWidgets.length > 1
                                        ? (this.state.commonValues as SingleGroupWidget)
                                        : selectedWidget
                                }
                                widgetId={this.props.selectedWidgets.length > 1 ? null : this.props.selectedWidgets[0]}
                                isStyle={group.isStyle}
                                index={group.index}
                                isDifferent={this.state.isDifferent[field.name]}
                                selectedView={this.props.selectedView}
                                socket={this.props.socket}
                                changeProject={this.props.changeProject}
                                fonts={this.props.fonts}
                                adapterName={this.props.adapterName}
                                instance={this.props.instance}
                                projectName={this.props.projectName}
                                onPxToPercent={this.props.onPxToPercent}
                                onPercentToPx={this.props.onPercentToPx}
                                userGroups={this.props.userGroups}
                                error={error}
                                selectedWidgets={this.props.selectedWidgets}
                                additionalSets={this.props.additionalSets}
                            />
                        )}
                    </div>
                </Box>
            </Box>
        );
    }

    renderGroupBody(group: PaletteGroup): React.JSX.Element {
        if (this.state.accordionOpen[group.name] === 0 || !group.hasValues) {
            return null;
        }
        return (
            <AccordionDetails sx={styles.accordionDetails}>
                <table style={{ width: '100%' }}>
                    <tbody>
                        {group.fields.map((field, fieldIndex) => this.renderFieldRow(group, field, fieldIndex))}
                    </tbody>
                </table>
            </AccordionDetails>
        );
    }

    renderGroup(group: PaletteGroup): React.JSX.Element {
        return (
            <Accordion
                sx={{
                    '&.MuiAccordion-root': styles.accordionRoot,
                    '& .Mui-expanded': commonStyles.clearPadding,
                }}
                square
                key={group.name}
                elevation={0}
                expanded={this.state.accordionOpen[group.name] === 1 && group.hasValues}
                onChange={(_e, expanded) => {
                    const accordionOpen = { ...this.state.accordionOpen };
                    accordionOpen[group.name] = expanded ? 1 : 2;
                    this.setAccordionState(accordionOpen, () => {
                        if (!expanded) {
                            setTimeout(() => {
                                const _accordionOpen = { ...this.state.accordionOpen };
                                _accordionOpen[group.name] = 0;
                            }, 200);
                        }
                    });
                }}
                TransitionProps={{ timeout: this.state.transitionTime }}
            >
                {this.renderGroupHeader(group)}
                {this.renderGroupBody(group)}
            </Accordion>
        );
    }

    onGroupDelete(group: PaletteGroup): void {
        const project = deepClone(store.getState().visProject);
        const type = group.isStyle ? 'style' : 'data';
        this.props.selectedWidgets.forEach(wid => {
            group.fields.forEach(field => {
                delete (project[this.props.selectedView].widgets[wid][type] as Record<string, any>)[field.name];
            });
            delete project[this.props.selectedView].widgets[wid].data[`g_${group.name}`];
        });

        this.props.changeProject(project);
        store.dispatch(recalculateFields(true));
    }

    render(): React.JSX.Element | React.JSX.Element[] | null {
        if (store.getState().recalculateFields && !this.recalculateTimer) {
            this.recalculateTimer = setTimeout(() => {
                this.recalculateTimer = null;
                this.recalculateFields();
            }, 50);
        }

        if (!this.state.widgetTypes) {
            return null;
        }

        // check that for all selected widgets the widget type loaded and exists
        const widgets = store.getState().visProject[this.props.selectedView]?.widgets;
        let widgetsExist = 0;
        widgets &&
            this.props.selectedWidgets.forEach(selectedWidget => {
                if (
                    widgets[selectedWidget] &&
                    this.state.widgetTypes.find(type => type.name === widgets[selectedWidget].tpl)
                ) {
                    widgetsExist++;
                }
            });
        if (!widgets || this.props.selectedWidgets.length !== widgetsExist) {
            return null;
        }

        // detect triggers from parent to open all groups
        if (this.props.triggerAllOpened !== this.state.triggerAllOpened) {
            this.triggerTimer =
                this.triggerTimer ||
                setTimeout(() => {
                    this.triggerTimer = null;
                    const accordionOpen: { [groupName: string]: 0 | 1 | 2 } = {};
                    this.state.fields?.forEach(group => (accordionOpen[group.name] = 1));
                    this.setState({ triggerAllOpened: this.props.triggerAllOpened }, () =>
                        this.setAccordionState(accordionOpen),
                    );
                }, 50);
        }
        // detect triggers from parent to close all groups
        if (this.props.triggerAllClosed !== this.state.triggerAllClosed) {
            this.triggerTimer =
                this.triggerTimer ||
                setTimeout(() => {
                    this.triggerTimer = null;
                    const accordionOpen: { [groupName: string]: 0 | 1 | 2 } = {};
                    this.state.fields?.forEach(group => (accordionOpen[group.name] = 0));
                    this.setState({ triggerAllClosed: this.props.triggerAllClosed }, () =>
                        this.setAccordionState(accordionOpen),
                    );
                }, 50);
        }

        let jsonCustomFields = null;
        if (this.state.showWidgetCode) {
            try {
                jsonCustomFields = JSON.stringify(this.state.customFields, null, 2);
            } catch {
                // ignore
            }
        }

        return [
            this.renderHeader(widgets),
            this.state.fields ? (
                <div
                    key="groups"
                    style={{ height: 'calc(100% - 34px)', overflowY: 'auto' }}
                >
                    {this.state.fields.map(group => {
                        if (group.hidden) {
                            if (group.hidden === true) {
                                return null;
                            }
                            if (
                                Widget.checkFunction(
                                    group.hidden,
                                    store.getState().visProject,
                                    this.props.selectedView,
                                    this.props.selectedWidgets,
                                    group.index,
                                )
                            ) {
                                return null;
                            }
                        }

                        return this.renderGroup(group);
                    })}

                    {this.state.clearGroup ? (
                        <IODialog
                            title="Are you sure"
                            onClose={() => this.setState({ clearGroup: null })}
                            action={() => this.onGroupDelete(this.state.clearGroup)}
                            actionTitle="Clear"
                        >
                            {I18n.t('Fields of group will be cleaned')}
                        </IODialog>
                    ) : null}

                    <Button
                        style={{ opacity: this.state.showWidgetCode ? 1 : 0 }}
                        onClick={() => {
                            window.localStorage.setItem('showWidgetCode', this.state.showWidgetCode ? 'false' : 'true');
                            this.setState({ showWidgetCode: !this.state.showWidgetCode });
                        }}
                        startIcon={<CodeIcon />}
                    >
                        {this.state.showWidgetCode ? I18n.t('hide code') : I18n.t('show code')}
                    </Button>

                    {this.state.showWidgetCode ? (
                        <pre>
                            {JSON.stringify(
                                selectWidget(store.getState(), this.props.selectedView, this.props.selectedWidgets[0]),
                                null,
                                2,
                            )}
                            {jsonCustomFields}
                        </pre>
                    ) : null}
                </div>
            ) : null,
        ];
    }
}

export default Widget;
