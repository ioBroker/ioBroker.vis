import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import {
    Accordion, AccordionDetails, AccordionSummary,
    Checkbox, Divider, Button, IconButton,
    Tooltip,
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
} from '@mui/icons-material';

import { I18n, Utils } from '@iobroker/adapter-react-v5';
import { store, recalculateFields, updateWidget } from '../../Store';

import WidgetField from './WidgetField';
import IODialog from '../../Components/IODialog';
import { getWidgetTypes, parseAttributes } from '../../Vis/visWidgetsCatalog';
import WidgetCSS from './WidgetCSS';
import WidgetJS from './WidgetJS';
import WidgetBindingField from './WidgetBindingField';
import { deepClone } from '../../Utils/utils';

const ICONS = {
    'group.fixed': <FilterAltIcon fontSize="small" />,
    locked: <LockIcon fontSize="small" />,
};

const styles = theme => ({
    backgroundClass: {
        display: 'flex',
        alignItems: 'center',
    },
    backgroundClassSquare: {
        width: 40,
        height: 40,
        display: 'inline-block',
        marginRight: 4,
    },
    clearPadding: {
        '&&&&': {
            padding: 0,
            margin: 0,
            minHeight: 'initial',
        },
    },
    menuItem: {
        cursor: 'pointer',
    },
    selected: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
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
    fieldTitleError: {
        color: theme.palette.error.main,
    },
    colorize: {
        display: 'none',
        float: 'right',
        right: 0,
        cursor: 'pointer',
        opacity: 0.3,
        '&:hover': {
            opacity: 1,
        },
        '&:active': {
            transform: 'scale(0.8)',
        },
    },
    fieldRow: {
        '&:hover $colorize': {
            display: 'initial',
        },
    },
    groupButton: {
        width: 24,
        height: 24,
    },
    grow: {
        flexGrow: 1,
    },
    fieldContent: {
        '&&&&&&': {
            fontSize: '80%',
        },
        '& svg': {
            fontSize: '1rem',
        },
    },
    fieldInput: {
        width: '100%',
    },
    fieldContentColor: {
        '&&&&&& label': {
            display: 'none',
        },
        '&&&&&& input': {
            fontSize: '80%',
        },
    },
    fieldContentSlider: {
        display: 'inline',
        width: 'calc(100% - 50px)',
        marginRight: 8,
    },
    fieldContentSliderInput: {
        display: 'inline',
        width: 50,
    },
    groupSummary: {
        '&&&&&&': {
            marginTop: 20,
            borderRadius: '4px',
            padding: '2px',
        },
    },
    groupSummaryExpanded: {
        '&&&&&&': {
            marginTop: 20,
            borderTopRightRadius: '4px',
            borderTopLeftRadius: '4px',
            padding: '2px',
        },
    },
    lightedPanel: theme.classes.lightedPanel,
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
    fieldHelp: {
        fontSize: 12,
        fontStyle: 'italic',
        paddingLeft: 16,
        color: theme.palette.mode === 'dark' ? '#00931a' : '#014807',
    },
});

const WIDGET_ICON_HEIGHT = 34;
const IMAGE_TYPES = ['.png', '.jpg', '.svg', '.gif', '.apng', '.avif', '.webp'];

class Widget extends Component {
    constructor(props) {
        super(props);

        this.state = {
            cssDialogOpened: false,
            jsDialogOpened: false,
            clearGroup: null,
            showWidgetCode: window.localStorage.getItem('showWidgetCode') === 'true',
            triggerAllOpened: 0,
            triggerAllClosed: 0,
            accordionOpen: window.localStorage.getItem('attributesWidget') && window.localStorage.getItem('attributesWidget')[0] === '{'
                ? JSON.parse(window.localStorage.getItem('attributesWidget'))
                : {},
            widgetsLoaded: props.widgetsLoaded,
            widgetTypes: null,
            fields: null,
            transitionTime: 0,
        };

        this.fieldsBefore = Widget.getFieldsBefore();
        this.fieldsSignals = [];
        for (let i = 0; i <= 3; i++) {
            this.fieldsSignals.push(Widget.getSignals(i, props.adapterName));
        }

        this.imageRef = React.createRef();
    }

    static getFieldsBefore() {
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
                fields: [{ name: 'visibility-oid', type: 'id' },
                    {
                        name: 'visibility-cond', type: 'select', options: ['==', '!=', '<=', '>=', '<', '>', 'consist', 'not consist', 'exist', 'not exist'], default: '==',
                    },
                    { name: 'visibility-val', default: 1 },
                    { name: 'visibility-groups', type: 'groups' },
                    {
                        name: 'visibility-groups-action', type: 'select', options: ['hide', 'disabled'], default: 'hide',
                    }],
            },
        ];
    }

    static getSignals(count /* , adapterName */) {
        const result = {
            name: 'signals',
            fields: [
                {
                    name: 'signals-count',
                    label: 'signals-count',
                    type: 'select',
                    // noTranslation: true,
                    options: ['0', '1', '2', '3'],
                    default: '0',
                    immediateChange: true,
                },
            ],
        };

        for (let i = 0; i < count; i++) {
            result.fields = result.fields.concat([
                { type: 'delimiter' },
                { name: `signals-oid-${i}`, type: 'id' },
                {
                    name: `signals-cond-${i}`,
                    type: 'select',
                    noTranslation: true,
                    options: ['==', '!=', '<=', '>=', '<', '>', 'consist', 'not consist', 'exist', 'not exist'],
                    default: '==',
                },
                { name: `signals-val-${i}`, default: true },
                {
                    name: `signals-icon-${i}`, type: 'image', default: '', hidden: `!!data["signals-smallIcon-${i}"]`, // `${adapterName}/signals/lowbattery.png` },
                },
                {
                    name: `signals-smallIcon-${i}`, type: 'icon64', default: '', label: `signals-smallIcon-${i}`, hidden: `!!data["signals-icon-${i}"]`,
                },
                {
                    name: `signals-color-${i}`, type: 'color', default: '', hidden: `!data["signals-smallIcon-${i}"] && !data["signals-text-${i}"]`,
                }, // `${adapterName}/signals/lowbattery.png` },
                {
                    name: `signals-icon-size-${i}`, type: 'slider', min: 1, max: 120, step: 1, default: 0,
                },
                { name: `signals-icon-style-${i}` },
                { name: `signals-text-${i}` },
                { name: `signals-text-style-${i}` },
                { name: `signals-text-class-${i}` },
                { name: `signals-blink-${i}`, type: 'checkbox', default: false },
                {
                    name: `signals-horz-${i}`, type: 'slider', min: -20, max: 120, step: 1, default: 0,
                },
                {
                    name: `signals-vert-${i}`, type: 'slider', min: -20, max: 120, step: 1, default: 0,
                },
                { name: `signals-hide-edit-${i}`, type: 'checkbox', default: false },
            ]);
        }

        return result;
    }

    static getFieldsAfter(widget, widgets, fonts) {
        return [
            {
                name: 'css_common',
                isStyle: true,
                fields: [
                    { name: 'position', type: 'nselect', options: ['', 'relative', 'sticky'] },
                    { name: 'display', type: 'nselect', options: ['', 'inline-block'] },
                    ...(['relative', 'sticky'].includes(widget.style.position) ? [] :
                        [
                            { name: 'left', type: 'dimension' },
                            { name: 'top', type: 'dimension' },
                        ]),
                    { name: 'width', type: 'dimension' },
                    { name: 'height', type: 'dimension' },
                    {
                        name: 'z-index', type: 'number', min: -200, max: 200,
                    },
                    { name: 'overflow-x', type: 'nselect', options: ['', 'visible', 'hidden', 'scroll', 'auto', 'initial', 'inherit'] },
                    { name: 'overflow-y', type: 'nselect', options: ['', 'visible', 'hidden', 'scroll', 'auto', 'initial', 'inherit'] },
                    { name: 'opacity' },
                    { name: 'cursor', type: 'auto' },
                    { name: 'transform' },
                ],
            },
            {
                name: 'css_font_text',
                isStyle: true,
                fields: [{ name: 'color', type: 'color' },
                    { name: 'text-align', type: 'nselect', options: ['', 'left', 'right', 'center', 'justify', 'initial', 'inherit'] },
                    { name: 'text-shadow' },
                    {
                        name: 'font-family',
                        type: 'auto',
                        options: fonts,
                    },
                    { name: 'font-style', type: 'nselect', options: ['', 'normal', 'italic', 'oblique', 'initial', 'inherit'] },
                    { name: 'font-variant', type: 'nselect', options: ['', 'normal', 'small-caps', 'initial', 'inherit'] },
                    { name: 'font-weight', type: 'auto', options: ['normal', 'bold', 'bolder', 'lighter', 'initial', 'inherit'] },
                    { name: 'font-size', type: 'auto', options: ['medium', 'xx-small', 'x-small', 'small', 'large', 'x-large', 'xx-large', 'smaller', 'larger', 'initial', 'inherit'] },
                    { name: 'line-height' },
                    { name: 'letter-spacing' },
                    { name: 'word-spacing' }],
            },
            {
                name: 'css_background',
                isStyle: true,
                fields: [{ name: 'background' },
                    { name: 'background-color', type: 'color' },
                    { name: 'background-image' },
                    { name: 'background-repeat', type: 'nselect', options: ['', 'repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'initial', 'inherit'] },
                    { name: 'background-attachment', type: 'nselect', options: ['', 'scroll', 'fixed', 'local', 'initial', 'inherit'] },
                    { name: 'background-position' },
                    { name: 'background-size' },
                    { name: 'background-clip', type: 'nselect', options: ['', 'border-box', 'padding-box', 'content-box', 'initial', 'inherit'] },
                    { name: 'background-origin', type: 'nselect', options: ['', 'padding-box', 'border-box', 'content-box', 'initial', 'inherit'] }],
            },
            {
                name: 'css_border',
                isStyle: true,
                fields: [
                    // { name: 'box-sizing', type: 'nselect', options: ['', 'border-box', 'content-box']  },
                    { name: 'border-width' },
                    { name: 'border-style', type: 'nselect', options: ['', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'hidden'] },
                    { name: 'border-color', type: 'color' },
                    { name: 'border-radius' }],
            },
            {
                name: 'css_shadow_padding',
                isStyle: true,
                fields: [{ name: 'padding' },
                    { name: 'padding-left' },
                    { name: 'padding-top' },
                    { name: 'padding-right' },
                    { name: 'padding-bottom' },
                    { name: 'box-shadow' },
                    { name: 'margin-left' },
                    { name: 'margin-top' },
                    { name: 'margin-right' },
                    { name: 'margin-bottom' }],
            },
            {
                name: 'last_change',
                fields: [
                    { name: 'lc-oid', type: 'id' },
                    {
                        name: 'lc-type', type: 'select', options: ['last-change', 'timestamp'], default: 'last-change',
                    },
                    { name: 'lc-is-interval', type: 'checkbox', default: true },
                    { name: 'lc-is-moment', type: 'checkbox', default: false },
                    {
                        name: 'lc-format', type: 'auto', options: ['YYYY.MM.DD hh:mm:ss', 'DD.MM.YYYY hh:mm:ss', 'YYYY.MM.DD', 'DD.MM.YYYY', 'YYYY/MM/DD hh:mm:ss', 'YYYY/MM/DD', 'hh:mm:ss'], default: '',
                    },
                    {
                        name: 'lc-position-vert', type: 'select', options: ['top', 'middle', 'bottom'], default: 'top',
                    },
                    {
                        name: 'lc-position-horz', type: 'select', options: ['left', /* 'middle', */'right'], default: 'right',
                    },
                    {
                        name: 'lc-offset-vert', type: 'slider', min: -120, max: 120, step: 1, default: 0,
                    },
                    {
                        name: 'lc-offset-horz', type: 'slider', min: -120, max: 120, step: 1, default: 0,
                    },
                    {
                        name: 'lc-font-size', type: 'auto', options: ['', 'medium', 'xx-small', 'x-small', 'small', 'large', 'x-large', 'xx-large', 'smaller', 'larger', 'initial', 'inherit'], default: '12px',
                    },
                    {
                        name: 'lc-font-family', type: 'auto', default: '', options: fonts,
                    },
                    {
                        name: 'lc-font-style', type: 'auto', options: ['', 'normal', 'italic', 'oblique', 'initial', 'inherit'], default: '',
                    },
                    { name: 'lc-bkg-color', type: 'color', default: '' },
                    { name: 'lc-color', type: 'color', default: '' },
                    { name: 'lc-border-width', default: '0' },
                    {
                        name: 'lc-border-style', type: 'auto', options: ['', 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'initial', 'inherit'], default: '',
                    },
                    { name: 'lc-border-color', type: 'color', default: '' },
                    {
                        name: 'lc-border-radius', type: 'slider', min: 0, max: 20, step: 1, default: 10,
                    },
                    {
                        name: 'lc-padding', type: 'slider', min: 0, max: 20, step: 1, default: 3,
                    },
                    {
                        name: 'lc-zindex', type: 'slider', min: -10, max: 20, step: 1, default: 0,
                    },
                ],
            },
        ];
    }

    static checkFunction(funcText, project, selectedView, selectedWidgets, index) {
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
                const widget = project[selectedView].widgets[selectedWidgets[i]];
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

    componentDidMount() {
        if (this.state.widgetsLoaded) {
            this.setState({ widgetTypes: getWidgetTypes() }, () => this.recalculateFields());
        }
        this.setAccordionState();
    }

    static getDerivedStateFromProps(props, state) {
        let newState = null;
        if (props.widgetsLoaded && !state.widgetsLoaded) {
            newState = {};
            newState.widgetsLoaded = true;
            newState.widgetTypes = getWidgetTypes();
            store.dispatch(recalculateFields(true));
        }

        return newState;
    }

    recalculateFields() {
        if (!this.state.widgetTypes) {
            return;
        }
        console.log('Recalculate fields');
        const widgets = store.getState().visProject[this.props.selectedView]?.widgets;

        let widget;
        let widgetType;
        const commonFields = {};
        const commonGroups = { common: this.props.selectedWidgets.length };
        const selectedWidgetsFields = [];

        widgets && this.props.selectedWidgets.forEach((wid, widgetIndex) => {
            widget = widgets[wid];
            if (!widget) {
                return;
            }

            widgetType = this.state.widgetTypes.find(type => type.name === widget.tpl);
            if (!widgetType) {
                return;
            }

            let params = widgetType.params;
            if (typeof widgetType.params === 'function') {
                params = widgetType.params(widget.data, null, {
                    views: store.getState().visProject,
                    view: this.props.selectedView,
                    socket: this.props.socket,
                    themeType: this.props.themeType,
                    projectName: store.getState().visProjectName,
                    adapterName: this.props.adapterName,
                    instance: this.props.instance,
                    id: wid,
                    widget,
                });
            }

            const fields = parseAttributes(params, widgetIndex, commonGroups, commonFields, widgetType.set, widget.data);

            selectedWidgetsFields.push(fields);
        });

        let fields;
        const bindFields = [];
        const commonValues = {};
        const isDifferent = {};
        const newState = {};

        if (this.props.selectedWidgets.length > 1) {
            fields = selectedWidgetsFields[0]?.filter(group => {
                if (commonGroups[group.name] < this.props.selectedWidgets.length) {
                    return false;
                }
                group.fields = group.fields.filter(field =>
                    commonFields[`${group.name}.${field.name}`] === this.props.selectedWidgets.length);
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
                    Object.keys(commonValues.style).forEach(field => {
                        if (commonValues.style[field] !== currentWidget.style[field]) {
                            commonValues.style[field] = null;
                            isDifferent[field] = true;
                        }
                    });

                    currentWidget.data.bindings.forEach(attr => !bindFields.includes(`data_${attr}`) && bindFields.push(`data_${attr}`));
                    currentWidget.style.bindings.forEach(attr => !bindFields.includes(`style_${attr}`) && bindFields.push(`style_${attr}`));
                }
            });
        } else {
            fields = selectedWidgetsFields[0];

            widgets[this.props.selectedWidgets[0]].data.bindings?.forEach(attr => !bindFields.includes(`data_${attr}`) && bindFields.push(`data_${attr}`));
            widgets[this.props.selectedWidgets[0]].style.bindings?.forEach(attr => !bindFields.includes(`style_${attr}`) && bindFields.push(`style_${attr}`));
        }

        newState.bindFields = bindFields.sort();
        newState.customFields = fields;
        newState.isDifferent = isDifferent;
        newState.commonValues = commonValues;
        newState.widget = widget;
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
                    store.dispatch(updateWidget({ widgetId: this.props.selectedWidgets[0], viewId: this.props.selectedView, data: { ...widget, data: { ...widget.data, 'signals-count': signalsCount } } }));
                }
            } else {
                signalsCount = parseInt(widgetData['signals-count'], 10);
            }
        }

        newState.signalsCount = signalsCount;

        const fieldsAfter = Widget.getFieldsAfter(
            this.props.selectedWidgets.length === 1 ? widget : commonValues,
            store.getState().visProject[this.props.selectedView].widgets,
            this.props.fonts,
        );
        const fieldsSignals = this.fieldsSignals[signalsCount] || this.fieldsSignals[3];
        if (fields) {
            fields = [...this.fieldsBefore, ...fields, ...fieldsAfter, ...[fieldsSignals]];
        }
        newState.fields = fields;

        widgets && fields?.forEach(group => {
            const type = group.isStyle ? 'style' : 'data';
            const found = this.props.selectedWidgets.find(selectedWidget => {
                const fieldFound = group.fields.find(field => {
                    const fieldValue = widgets[selectedWidget][type][field.name];
                    if (fieldValue === undefined) {
                        return false;
                    }
                    // if ((field.default || field.default === 0 || field.default === false || field.default === '') && fieldValue === field.default) {
                    //     return false;
                    // }
                    // console.log(`Group "${group.name}" is not empty because of ${field.name}: [${JSON.stringify(field.default)}/${typeof field.default}] !== [${JSON.stringify(fieldValue)}/${typeof fieldValue}]`);
                    return true;
                });
                return fieldFound !== undefined;
            });
            group.hasValues = found !== undefined;
        });

        newState.transitionTime = 0;

        this.setState(newState, () => this.setAccordionState());
        store.dispatch(recalculateFields(false));
    }

    componentWillUnmount() {
        this.recalculateTimer && clearTimeout(this.recalculateTimer);
        this.recalculateTimer = null;

        this.triggerTimer && clearTimeout(this.triggerTimer);
        this.triggerTimer = null;
    }

    renderHeader(widgets) {
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
                    img = <img src={m[1]} className={this.props.classes.icon} alt={this.props.selectedWidgets[0]} />;
                }
            } else if (_widgetType?.preview && IMAGE_TYPES.find(ext => _widgetType.preview.toLowerCase().endsWith(ext))) {
                img = <img src={_widgetType?.preview} className={this.props.classes.icon} alt={this.props.selectedWidgets[0]} />;
            }

            if (!img) {
                img = <span
                    className={this.props.classes.widgetImage}
                    ref={this.imageRef}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={
                        { __html: _widgetType?.preview }
                    }
                />;
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
            list = <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {widgetIcon ? <div className={this.props.classes.widgetIcon}>{img}</div> : null}
                <div className={this.props.classes.widgetName}>{this.props.selectedWidgets[0]}</div>
                <div className={this.props.classes.widgetType}>
                    <div
                        style={{
                            fontWeight: 'bold',
                            color: widgetColor,
                            backgroundColor: widgetBackColor,
                        }}
                        className={Utils.clsx(this.props.classes.widgetNameText, widgetBackColor && this.props.classes.coloredWidgetSet)}
                    >
                        {setLabel}
                    </div>
                    <div className={this.props.classes.widgetNameText}>{widgetLabel}</div>
                </div>
                {!widgets[this.props.selectedWidgets[0]].marketplace && <>
                    {window.location.port === '3000' ? <Button onClick={() => this.setState({ cssDialogOpened: true })}>CSS</Button> : null}
                    {window.location.port === '3000' ? <Button onClick={() => this.setState({ jsDialogOpened: true })}>JS</Button> : null}
                    {this.state.cssDialogOpened ? <WidgetCSS
                        onClose={() => this.setState({ cssDialogOpened: false })}
                        widget={widgets[this.props.selectedWidgets[0]]}
                        onChange={value => {
                            const project = JSON.parse(JSON.stringify(store.getState().visProject));
                            project[this.props.selectedView].widgets[this.props.selectedWidgets[0]].css = value;
                            this.props.changeProject(project);
                        }}
                        editMode={this.props.editMode}
                    /> : null}
                    {this.state.jsDialogOpened ? <WidgetJS
                        onClose={() => this.setState({ jsDialogOpened: false })}
                        widget={widgets[this.props.selectedWidgets[0]]}
                        onChange={value => {
                            const project = JSON.parse(JSON.stringify(store.getState().visProject));
                            project[this.props.selectedView].widgets[this.props.selectedWidgets[0]].js = value;
                            this.props.changeProject(project);
                        }}
                        editMode={this.props.editMode}
                    /> : null}
                </>}
            </div>;
        } else {
            list = this.props.selectedWidgets.join(', ');
        }
        return <div key="header" style={{ width: '100%', overflow: 'hidden' }}>
            {list}
        </div>;
    }

    setAccordionState(accordionOpen, cb) {
        if (!this.state.fields) {
            return;
        }

        const _accordionOpen = accordionOpen || this.state.accordionOpen;
        const allOpened = !this.state.fields.find(group => !_accordionOpen[group.name]);
        const allClosed = !this.state.fields.find(group => _accordionOpen[group.name]);

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

    componentDidUpdate(/* prevProps, prevState, snapshot */) {
        // scale the old style HTML widget icon
        if (this.imageRef.current?.children[0]) {
            const height = this.imageRef.current.children[0].clientHeight;
            if (height > WIDGET_ICON_HEIGHT) {
                this.imageRef.current.style.transform = `scale(${WIDGET_ICON_HEIGHT / height})`;
            }
        }
    }

    onGroupMove(e, index, iterable, direction) {
        e.stopPropagation();
        const project = JSON.parse(JSON.stringify(store.getState().visProject));
        const oldGroup = this.state.fields.find(f => f.name === `${iterable.group}-${index}`);
        const _widgets = project[this.props.selectedView].widgets;
        const accordionOpen = { ...this.state.accordionOpen };

        // if deletion
        if (!direction) {
            if (iterable.indexTo) {
                const lastGroup = this.state.fields.find(f => f.singleName  === iterable.group && f.iterable?.isLast);
                for (let idx = index; idx < lastGroup.index; idx++) {
                    const idxGroup = this.state.fields.find(f => f.name === `${iterable.group}-${idx}`);
                    const idxGroupPlus = this.state.fields.find(f => f.name === `${iterable.group}-${idx + 1}`);
                    // for every selected widget
                    this.props.selectedWidgets.forEach(wid => {
                        const widgetData = _widgets[wid].data;
                        // move all fields of the group to -1
                        idxGroup.fields.forEach((attr, i) =>
                            widgetData[idxGroup.fields[i].name] = widgetData[idxGroupPlus.fields[i].name]);

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

        if (direction === true) {
            const lastGroup = this.state.fields.find(f => f.singleName  === iterable.group && f.iterable?.isLast);
            // add one line
            const newIndex = lastGroup.index + 1;
            this.props.selectedWidgets.forEach(wid => {
                // order all attributes for better readability
                const widgetData = _widgets[wid].data;

                lastGroup.fields.forEach((attr, i) => {
                    const name = lastGroup.fields[i].name.replace(/\d?\d+$/, newIndex);
                    widgetData[name] = null;
                });

                // enable group-used flag
                widgetData[`g_${iterable.group}-${newIndex}`] = true;

                // enable the opened flag
                accordionOpen[`${iterable.group}-${newIndex}`] = true;
                widgetData[iterable.indexTo] = newIndex;
            });
            this.setAccordionState(accordionOpen, () => {
                this.props.changeProject(project);
                store.dispatch(recalculateFields(true));
            });
        } else {
            const newIndex = index + direction;
            const newGroup = this.state.fields.find(f => f.name === `${iterable.group}-${newIndex}`);

            // for every selected widget
            this.props.selectedWidgets.forEach(wid => {
                // order all attributes for better readability
                const oldWidgetData = _widgets[wid].data;
                const widgetData = {};
                Object.keys(oldWidgetData).sort().forEach(key => widgetData[key] = oldWidgetData[key]);
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

    renderGroupHeader(group) {
        return <AccordionSummary
            classes={{
                root: Utils.clsx(this.props.classes.clearPadding, this.state.accordionOpen[group.name]
                    ? this.props.classes.groupSummaryExpanded : this.props.classes.groupSummary, this.props.classes.lightedPanel),
                content: this.props.classes.clearPadding,
                expanded: this.props.classes.clearPadding,
                expandIcon: this.props.classes.clearPadding,
            }}
            expandIcon={group.hasValues ? <ExpandMoreIcon /> : <div className={this.props.classes.emptyMoreIcon} />}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    alignItems: 'center',
                }}
            >
                <div>
                    {ICONS[`group.${group.singleName || group.name}`] ? ICONS[`group.${group.singleName || group.name}`] : null}
                    {group.label ?
                        I18n.t(group.label) + (group.index !== undefined ? ` [${group.index}]` : '')
                        :
                        (window.vis._(`group_${group.singleName || group.name}`) + (group.index !== undefined ? ` [${group.index}]` : ''))}
                </div>
                {group.iterable ? <>
                    <div className={this.props.classes.grow} />
                    {group.iterable.indexTo ? <Tooltip title={I18n.t('Delete')}>
                        <IconButton
                            className={this.props.classes.groupButton}
                            size="small"
                            onClick={e => this.onGroupMove(e, group.index, group.iterable, 0)}
                        >
                            <Delete />
                        </IconButton>
                    </Tooltip> : null}
                    {group.iterable.isFirst ?
                        <div className={this.props.classes.groupButton} /> :
                        <Tooltip title={I18n.t('Move up')}>
                            <IconButton
                                className={this.props.classes.groupButton}
                                size="small"
                                onClick={e => this.onGroupMove(e, group.index, group.iterable, -1)}
                            >
                                <ArrowUpward />
                            </IconButton>
                        </Tooltip>}
                    {group.iterable.isLast ?
                        (group.iterable.indexTo ? <Tooltip title={I18n.t('Add')}>
                            <IconButton
                                className={this.props.classes.groupButton}
                                size="small"
                                onClick={e => this.onGroupMove(e, group.index, group.iterable, true)}
                            >
                                <Add />
                            </IconButton>
                        </Tooltip> : <div className={this.props.classes.groupButton} />)
                        :
                        <Tooltip title={I18n.t('Move down')}>
                            <IconButton
                                className={this.props.classes.groupButton}
                                size="small"
                                onClick={e => this.onGroupMove(e, group.index, group.iterable, 1)}
                            >
                                <ArrowDownward />
                            </IconButton>
                        </Tooltip>}
                </> : null}
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
                                        const value = store.getState().visProject[this.props.selectedView].widgets[selectedWidget][type][groupField.name];
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
                                const project = JSON.parse(JSON.stringify(store.getState().visProject));
                                const type = group.isStyle ? 'style' : 'data';
                                this.props.selectedWidgets.forEach(wid => {
                                    group.fields.forEach(field => {
                                        if (project[this.props.selectedView].widgets[wid][type][field.name] === undefined) {
                                            project[this.props.selectedView].widgets[wid][type][field.name] = field.default || null;
                                        }
                                    });
                                    project[this.props.selectedView].widgets[wid].data[`g_${group.name}`] = true;
                                });
                                const accordionOpen = { ...this.state.accordionOpen };
                                accordionOpen[group.name] = true;
                                this.setAccordionState(accordionOpen, () => this.props.changeProject(project));
                            }
                            e.stopPropagation();
                            store.dispatch(recalculateFields(true));
                        }}
                        size="small"
                        classes={{ root: Utils.clsx(this.props.classes.fieldContent, this.props.classes.clearPadding, this.props.classes.checkBox) }}
                    />
                </div>
            </div>
        </AccordionSummary>;
    }

    changeBinding(isStyle, attr) {
        const project = JSON.parse(JSON.stringify(store.getState().visProject));
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

    renderFieldRow(group, field, fieldIndex) {
        if (!field) {
            return null;
        }
        let error;
        let disabled;
        if (field.hidden) {
            if (Widget.checkFunction(field.hidden, store.getState().visProject, this.props.selectedView, this.props.selectedWidgets, field.index)) {
                return null;
            }
        }
        if (field.type === 'help') {
            return <tr key={fieldIndex} className={this.props.classes.fieldRow}>
                <td colSpan={2} className={this.props.classes.fieldHelp} style={field.style}>
                    {field.noTranslation ? field.text : I18n.t(field.text)}
                </td>
            </tr>;
        }

        if (field.error) {
            error = Widget.checkFunction(field.error, store.getState().visProject, this.props.selectedView, this.props.selectedWidgets, field.index);
        }
        if (field.disabled) {
            if (field.disabled === true) {
                disabled = true;
            } else {
                disabled = !!Widget.checkFunction(field.disabled, store.getState().visProject, this.props.selectedView, this.props.selectedWidgets, field.index);
            }
        }
        let label;
        if (field.label === '') {
            label = '';
        } else if (field.title) {
            label = field.title;
        } else if (field.label) {
            label = I18n.t(field.label);
        } else {
            label = window.vis._(field.singleName || field.name) + (field.index !== undefined ? ` [${field.index}]` : '');
        }

        const labelStyle = {};

        if (label.trim().startsWith('<b')) {
            label = label.match(/<b>(.*?)<\/b>/)[1];
            labelStyle.fontWeight = 'bold';
            labelStyle.color = '#4dabf5';
        }
        if (label.trim().startsWith('<i')) {
            label = label.match(/<i>(.*?)<\/i>/)[1];
            labelStyle.fontStyle = 'italic';
        }

        const isBoundField = this.state.bindFields.includes(group.isStyle ? `style_${field.name}` : `data_${field.name}`);

        return <tr key={fieldIndex} className={this.props.classes.fieldRow}>
            {field.type === 'delimiter' ?
                // eslint-disable-next-line jsx-a11y/control-has-associated-label
                <td colSpan="2">
                    <Divider style={{ borderBottomWidth: 'thick' }} />
                </td>
                : <>
                    <td
                        className={Utils.clsx(this.props.classes.fieldTitle, disabled && this.props.classes.fieldTitleDisabled, error && this.props.classes.fieldTitleError)}
                        title={field.tooltip ? I18n.t(field.tooltip) : null}
                        style={labelStyle}
                    >
                        {ICONS[field.singleName || field.name] ? ICONS[field.singleName || field.name] : null}
                        {label}
                        {field.type === 'image' && !this.state.isDifferent[field.name] && this.state.widget && this.state.widget.data[field.name] ?
                            <div className={this.props.classes.smallImageDiv}>
                                <img
                                    src={this.state.widget.data[field.name].startsWith('_PRJ_NAME/') ?
                                        this.state.widget.data[field.name].replace('_PRJ_NAME/', `../${this.props.adapterName}.${this.props.instance}/${store.getState().visProjectName}/`)
                                        :
                                        this.state.widget.data[field.name]}
                                    className={this.props.classes.smallImage}
                                    onError={e => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                    }}
                                    alt={field.name}
                                />
                            </div> : null}
                        {field.type !== 'custom' || field.label ? (isBoundField ?
                            <span
                                className={this.props.classes.bindIconSpan}
                                title={I18n.t('Deactivate binding and use field as standard input')}
                            >
                                <LinkOff
                                    onClick={() => this.props.editMode && this.changeBinding(group.isStyle, field.name)}
                                    className={this.props.classes.bindIcon}
                                    style={disabled ? { cursor: 'default' } : null}
                                />
                            </span> :
                            <span
                                className={this.props.classes.bindIconSpan}
                                title={I18n.t('Use field as binding')}
                            >
                                <LinkIcon
                                    className={this.props.classes.bindIcon}
                                    style={disabled ? { cursor: 'default' } : null}
                                    onClick={() => this.props.editMode && this.changeBinding(group.isStyle, field.name)}
                                />
                            </span>) : null}
                        {group.isStyle ?
                            <ColorizeIcon
                                fontSize="small"
                                className={this.props.classes.colorize}
                                onClick={() => this.props.cssClone(field.name, newValue => {
                                    if (newValue !== null && newValue !== undefined) {
                                        const project = deepClone(store.getState().visProject);
                                        this.props.selectedWidgets.forEach(wid => {
                                            if (project[this.props.selectedView].widgets[wid]) {
                                                project[this.props.selectedView].widgets[wid].style = project[this.props.selectedView].widgets[wid].style || {};
                                                project[this.props.selectedView].widgets[wid].style[field.name] = newValue;
                                            }
                                        });
                                        this.props.changeProject(project);
                                    }
                                })}
                            />
                            : null}
                        {field.tooltip ? <InfoIcon className={this.props.classes.infoIcon} /> : null}
                    </td>
                    <td className={this.props.classes.fieldContent}>
                        <div className={this.props.classes.fieldInput}>
                            {isBoundField ?
                                <WidgetBindingField
                                    error={error}
                                    disabled={disabled}
                                    field={field}
                                    label={label}
                                    widget={this.props.selectedWidgets.length > 1 ? this.state.commonValues : this.state.widget}
                                    widgetId={this.props.selectedWidgets.length > 1 ? null : this.props.selectedWidgets[0]}
                                    isStyle={group.isStyle}
                                    selectedView={this.props.selectedView}
                                    selectedWidgets={this.props.selectedWidgets}
                                    isDifferent={this.state.isDifferent[field.name]}
                                    project={store.getState().visProject}
                                    socket={this.props.socket}
                                    changeProject={this.props.changeProject}
                                />
                                : <WidgetField
                                    widgetType={this.state.widgetType}
                                    themeType={this.props.themeType}
                                    error={error}
                                    disabled={disabled}
                                    field={field}
                                    widget={this.props.selectedWidgets.length > 1 ? this.state.commonValues : this.state.widget}
                                    widgetId={this.props.selectedWidgets.length > 1 ? null : this.props.selectedWidgets[0]}
                                    isStyle={group.isStyle}
                                    index={group.index}
                                    isDifferent={this.state.isDifferent[field.name]}
                                    {...this.props}
                                />}
                        </div>
                    </td>
                </>}
        </tr>;
    }

    renderGroupBody(group) {
        if (!this.state.accordionOpen[group.name] || !group.hasValues) {
            return null;
        }
        return <AccordionDetails style={{ flexDirection: 'column', padding: 0, margin: 0 }}>
            <table style={{ width: '100%' }}>
                <tbody>
                    {group.fields.map((field, fieldIndex) => this.renderFieldRow(group, field, fieldIndex))}
                </tbody>
            </table>
        </AccordionDetails>;
    }

    renderGroup(group) {
        return <Accordion
            classes={{
                root: this.props.classes.clearPadding,
                expanded: this.props.classes.clearPadding,
            }}
            square
            key={group.name}
            elevation={0}
            expanded={!!(this.state.accordionOpen[group.name] && group.hasValues)}
            onChange={(e, expanded) => {
                const accordionOpen = { ...this.state.accordionOpen };
                accordionOpen[group.name] = expanded;
                this.setAccordionState(accordionOpen);
            }}
            TransitionProps={{ timeout: this.state.transitionTime }}
        >
            {this.renderGroupHeader(group)}
            {this.renderGroupBody(group)}
        </Accordion>;
    }

    onGroupDelete(group) {
        const project = JSON.parse(JSON.stringify(store.getState().visProject));
        const type = group.isStyle ? 'style' : 'data';
        this.props.selectedWidgets.forEach(wid => {
            group.fields.forEach(field => {
                delete project[this.props.selectedView].widgets[wid][type][field.name];
            });
            delete project[this.props.selectedView].widgets[wid].data[`g_${group.name}`];
        });

        this.props.changeProject(project);
        store.dispatch(recalculateFields(true));
    }

    render() {
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
        widgets && this.props.selectedWidgets.forEach(selectedWidget => {
            if (widgets[selectedWidget] && this.state.widgetTypes.find(type => type.name === widgets[selectedWidget].tpl)) {
                widgetsExist++;
            }
        });
        if (!widgets || this.props.selectedWidgets.length !== widgetsExist) {
            return null;
        }

        // detect triggers from parent to open all groups
        if (this.props.triggerAllOpened !== this.state.triggerAllOpened) {
            this.triggerTimer = this.triggerTimer || setTimeout(() => {
                this.triggerTimer = null;
                const accordionOpen = {};
                this.state.fields?.forEach(group => accordionOpen[group.name] = true);
                this.setState({ triggerAllOpened: this.props.triggerAllOpened }, () => this.setAccordionState(accordionOpen));
            }, 50);
        }
        // detect triggers from parent to close all groups
        if (this.props.triggerAllClosed !== this.state.triggerAllClosed) {
            this.triggerTimer = this.triggerTimer || setTimeout(() => {
                this.triggerTimer = null;
                const accordionOpen = {};
                this.state.fields?.forEach(group => accordionOpen[group.name] = false);
                this.setState({ triggerAllClosed: this.props.triggerAllClosed }, () => this.setAccordionState(accordionOpen));
            }, 50);
        }

        let jsonCustomFields = null;
        if (this.state.showWidgetCode) {
            try {
                jsonCustomFields = JSON.stringify(this.state.customFields, null, 2);
            } catch (e) {
                // ignore
            }
        }

        return [
            this.renderHeader(widgets),
            this.state.fields ? <div key="groups" style={{ height: 'calc(100% - 34px)', overflowY: 'auto' }}>
                {this.state.fields.map(group => {
                    if (group.hidden) {
                        if (Widget.checkFunction(group.hidden, store.getState().visProject, this.props.selectedView, this.props.selectedWidgets)) {
                            return null;
                        }
                    }

                    return this.renderGroup(group);
                })}

                {this.state.clearGroup ? <IODialog
                    title="Are you sure"
                    onClose={() => this.setState({ clearGroup: null })}
                    open={!0}
                    action={() => this.onGroupDelete(this.state.clearGroup)}
                    actionTitle="Clear"
                >
                    {I18n.t('Fields of group will be cleaned')}
                </IODialog> : null}

                <Button
                    style={{ opacity: this.state.showWidgetCode ? 1 : 0 }}
                    onClick={() => {
                        window.localStorage.setItem('showWidgetCode', this.state.showWidgetCode ? 'false' : 'true');
                        this.setState({ showWidgetCode: !this.state.showWidgetCode });
                    }}
                    startIcon={<CodeIcon />}
                >
                    { this.state.showWidgetCode ? I18n.t('hide code') : I18n.t('show code') }
                </Button>

                {this.state.showWidgetCode ? <pre>
                    {JSON.stringify(store.getState().visProject[this.props.selectedView].widgets[this.props.selectedWidgets[0]], null, 2)}
                    {jsonCustomFields}
                </pre> : null}
            </div> : null,
        ];
    }
}

Widget.propTypes = {
    adapterName: PropTypes.string.isRequired,
    themeType: PropTypes.string.isRequired,
    changeProject: PropTypes.func,
    classes: PropTypes.object,
    cssClone: PropTypes.func,
    fonts: PropTypes.array,
    instance: PropTypes.number.isRequired,
    project: PropTypes.object,
    projectName: PropTypes.string.isRequired,
    selectedView: PropTypes.string,
    selectedWidgets: PropTypes.array,
    widgetsLoaded: PropTypes.bool,

    setIsAllOpened: PropTypes.func,
    setIsAllClosed: PropTypes.func,
    isAllOpened: PropTypes.bool,
    isAllClosed: PropTypes.bool,
    triggerAllOpened: PropTypes.number,
    triggerAllClosed: PropTypes.number,
};

export default withStyles(styles)(Widget);
