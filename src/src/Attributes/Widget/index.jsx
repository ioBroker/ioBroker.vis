import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { withStyles } from '@mui/styles';

import {
    Accordion, AccordionDetails, AccordionSummary, Checkbox, Divider, Button,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ColorizeIcon from '@mui/icons-material/Colorize';
import CodeIcon from '@mui/icons-material/Code';
import InfoIcon from '@mui/icons-material/Info';

import { I18n, Utils } from '@iobroker/adapter-react-v5';

import WidgetField from './WidgetField';
import IODialog from '../../Components/IODialog';
import { getWidgetTypes, parseAttributes } from '../../Utils';

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
    checkBox: {
        marginTop: '-4px !important',
    },
    fieldTitle: {
        width: 140,
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
        position: 'absolute',
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
        width: 16,
        verticalAlign: 'middle',
        marginLeft: 3,
    },
});

const getFieldsBefore = () => [
    {
        name: 'fixed',
        fields: [
            { name: 'name' },
            { name: 'comment' },
            { name: 'class', type: 'class' },
            { name: 'filterkey', type: 'filters' },
            { name: 'views', type: 'select-views' },
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

const getSignals = count => {
    const result = {
        name: 'signals',
        fields: [
            {
                name: 'signals-count',
                type: 'select',
                options: ['1', '2', '3'],
                default: '1',
                immediateChange: true,
            },
        ],
    };
    for (let i = 0; i < count; i++) {
        result.fields = result.fields.concat([
            { name: `signals-oid-${i}`, type: 'id' },
            {
                name: `signals-cond-${i}`,
                type: 'select',
                options: ['==', '!=', '<=', '>=', '<', '>', 'consist', 'not consist', 'exist', 'not exist'],
                default: '==',
            },
            { name: `signals-val-${i}`, default: true },
            { name: `signals-icon-${i}`, type: 'image', default: '/vis/signals/lowbattery.png' },
            {
                name: `signals-icon-size-${i}`, type: 'slider', options: { min: 1, max: 120, step: 1 }, default: 0,
            },
            { name: `signals-icon-style-${i}` },
            { name: `signals-text-${i}` },
            { name: `signals-text-style-${i}` },
            { name: `signals-text-class-${i}` },
            { name: `signals-blink-${i}`, type: 'checkbox', default: false },
            {
                name: `signals-horz-${i}`, type: 'slider', options: { min: -20, max: 120, step: 1 }, default: 0,
            },
            {
                name: `signals-vert-${i}`, type: 'slider', options: { min: -20, max: 120, step: 1 }, default: 0,
            },
            { name: `signals-hide-edit-${i}`, type: 'checkbox', default: false },
            { type: 'delimiter' },
        ]);
    }

    return result;
};

const getFieldsAfter = (widget, widgets, fonts) => [
    {
        name: 'css_common',
        isStyle: true,
        fields: [{ name: 'position', type: 'nselect', options: ['', 'relative', 'sticky'] },
            { name: 'display', type: 'nselect', options: ['', 'inline-block'] },
            ...(['relative', 'sticky'].includes(widget.style.position) ? [] :
                [{ name: 'left', type: 'dimension' },
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
            { name: 'transform' }],
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
            { name: 'box-sizing', type: 'nselect', options: ['', 'border-box', 'content-box']  },
            { name: 'border-width' },
            { name: 'border-style' },
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
        name: 'gestures',
        fields: [
            {
                name: 'gestures-indicator',
                type: 'auto',
                options: Object.keys(widgets).filter(wid => widgets[wid].tpl === 'tplValueGesture'),
            },
            { name: 'gestures-offsetX', default: 0, type: 'number' },
            { name: 'gestures-offsetY', default: 0, type: 'number' },
            { type: 'delimiter' },
            ...(['swiping', 'rotating', 'pinching'].flatMap(gesture => [
                { name: `gestures-${gesture}-oid`,        type: 'id' },
                { name: `gestures-${gesture}-value`,      default: '' },
                { name: `gestures-${gesture}-minimum`,    type: 'number' },
                { name: `gestures-${gesture}-maximum`,    type: 'number' },
                { name: `gestures-${gesture}-delta`,      type: 'number' },
                { type: 'delimiter' },
            ])),
            ...(['swipeRight', 'swipeLeft', 'swipeUp', 'swipeDown', 'rotateLeft', 'rotateRight', 'pinchIn', 'pinchOut'].flatMap(gesture => [
                { name: `gestures-${gesture}-oid`,    type: 'id' },
                { name: `gestures-${gesture}-value`,  default: '' },
                { name: `gestures-${gesture}-limit`,  type: 'number' },
                { type: 'delimiter' },
            ])),
        ],
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
                name: 'lc-offset-vert', type: 'slider', options: { min: -120, max: 120, step: 1 }, default: 0,
            },
            {
                name: 'lc-offset-horz', type: 'slider', options: { min: -120, max: 120, step: 1 }, default: 0,
            },
            {
                name: 'lc-font-size', type: 'auto', options: ['', 'medium', 'xx-small', 'x-small', 'small', 'large', 'x-large', 'xx-large', 'smaller', 'larger', 'initial', 'inherit'], default: '12px',
            },
            { name: 'lc-font-family', type: 'fontname', default: '' },
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
                name: 'lc-border-radius', type: 'slider', options: { min: 0, max: 20, step: 1 }, default: 10,
            },
            { name: 'lc-padding' },
            {
                name: 'lc-zindex', type: 'slider', options: { min: -10, max: 20, step: 1 }, default: 0,
            },
        ],
    },
];

const checkFunction = (funcText, project, selectedView, selectedWidgets, index) => {
    try {
        let _func;
        if (typeof funcText === 'function') {
            _func = funcText;
        } else {
            // eslint-disable-next-line no-new-func
            _func = new Function('data', 'index', `return ${funcText}`);
        }
        const isHidden = [];
        for (let i = 0; i < selectedWidgets.length; i++) {
            const data = project[selectedView].widgets[selectedWidgets].data;
            isHidden[i] = _func(data, index);
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
};

const Widget = props => {
    const widgetTypes = props.widgetTypes;
    const widgets = props.project[props.selectedView]?.widgets;

    const fieldsData = useMemo(() => {
        let widget;
        let widgetType;
        const commonFields = {};
        const commonGroups = { common: props.selectedWidgets.length };
        const selectedWidgetsFields = [];

        widgets && props.selectedWidgets.forEach((selectedWidget, widgetIndex) => {
            widget = widgets[selectedWidget];
            if (!widget) {
                return;
            }

            if (widget.tpl === '_tplGroup') {
                const groupFields = [{
                    name: 'common',
                    singleName: 'common',
                    fields: [],
                }, {
                    name: 'objects',
                    singleName: 'objects',
                    fields: [{
                        name: 'attrCount',
                        type: 'slider',
                        min: 1,
                        max: 19,
                        step: 1,
                    }],
                }];

                for (let i = 1; i <= widget.data.attrCount; i++) {
                    groupFields[0].fields.push({
                        name: `groupAttr${i}`,
                        title: widget.data[`attrName${i}`],
                        type: widget.data[`attrType${i}`],
                    });
                    groupFields[1].fields.push({
                        name: `attrName${i}`,
                        singleName: 'attrName',
                        index: i,
                    });
                }
                for (let i = 1; i <= widget.data.attrCount; i++) {
                    groupFields[1].fields.push({
                        name: `attrType${i}`,
                        singleName: 'attrType',
                        index: i,
                        type: 'select',
                        options: ['', 'checkbox', 'image', 'color', 'views', 'html', 'widget', 'history'],
                    });
                }
                selectedWidgetsFields.push(groupFields);
                return;
            }

            widgetType = widgetTypes.find(type => type.name === widget.tpl);
            if (!widgetType) {
                return;
            }

            /*
            let currentGroup = fields[fields.length - 1];
            let indexedGroups = {};
            let groupName = 'common';
            let isIndexedGroup = false;

            widgetType.params.split(';').forEach(fieldString => {
                if (!fieldString) {
                    return;
                }
                if (fieldString.split('/')[0].startsWith('group.')) {
                    groupName = fieldString.split('/')[0].split('.')[1];
                    if (widgetIndex > 0 && !commonGroups[groupName]) {
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

                    if (widgetIndex > 0 && !repeats && !commonFields[`${groupName}.${field.name}`]) {
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
                        const options = field.type.split(',');
                        [field.type, field.filter] = options;
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
                    field.set = widgetType.set;
                    if (repeats) {
                        const repeatsMatch = repeats.match(/\(([0-9a-z_]+)-([0-9a-z_]+)\)/i);
                        const name = field.name;
                        if (repeatsMatch) {
                            if (!repeatsMatch[1].match(/^[0-9]$/)) {
                                repeatsMatch[1] = parseInt(widget.data[repeatsMatch[1]]);
                            }
                            if (!repeatsMatch[2].match(/^[0-9]$/)) {
                                repeatsMatch[2] = parseInt(widget.data[repeatsMatch[2]]);
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
             */
            const fields = parseAttributes(widgetType.params, widgetIndex, commonGroups, commonFields, widgetType.set, widget.data);

            selectedWidgetsFields.push(fields);
        });

        return {
            widget, widgetType, commonFields, commonGroups, selectedWidgetsFields,
        };
    }, [props.selectedWidgets, props.project, props.selectedView]);

    const {
        widget, commonFields, commonGroups, selectedWidgetsFields,
    } = fieldsData;

    let fields;
    const commonValues = {};
    const isDifferent = {};

    if (props.selectedWidgets.length > 1) {
        fields = selectedWidgetsFields[0].filter(group => {
            if (commonGroups[group.name] < props.selectedWidgets.length) {
                return false;
            }
            group.fields = group.fields.filter(field =>
                commonFields[`${group.name}.${field.name}`] === props.selectedWidgets.length);
            return true;
        });

        props.selectedWidgets.forEach((selectedWidget, widgetIndex) => {
            const currentWidget = widgets[selectedWidget];
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
            }
        });
    } else {
        fields = selectedWidgetsFields[0];
    }

    let signalsCount = 3;

    if (props.selectedWidgets.length === 1) {
        const widgetData = widgets[props.selectedWidgets[0]].data;
        signalsCount = 0;
        // detect signals count
        if (!widgetData['signals-count']) {
            let i = 0;
            while (widgetData[`signals-oid-${i}`]) {
                i++;
            }
            signalsCount = i + 1;
            if (signalsCount > 1) {
                widgetData['signals-count'] = signalsCount;
            }
        } else {
            signalsCount = parseInt(widgetData['signals-count'], 10);
        }
    }

    const fieldsBefore = useMemo(getFieldsBefore, []);
    const fieldsAfter = useMemo(
        () => getFieldsAfter(
            props.selectedWidgets.length === 1 ? widget : commonValues,
            props.project[props.selectedView].widgets,

            props.fonts,
        ),
        [props.project, props.selectedView, props.fonts],
    );
    const fieldsSignals = useMemo(() => getSignals(signalsCount), [signalsCount]);
    const customFields = fields;
    if (!fields) {
        return null;
    }

    fields = [...fieldsBefore, ...fields, ...fieldsAfter, ...[fieldsSignals]];

    widgets && fields.forEach(group => {
        const found = props.selectedWidgets.find(selectedWidget => {
            const fieldFound = group.fields.find(field => {
                const fieldValue = widgets[selectedWidget][group.isStyle ? 'style' : 'data'][field.name];
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

    const [accordionOpen, setAccordionOpen] = useState(
        window.localStorage.getItem('attributesWidget') && window.localStorage.getItem('attributesWidget')[0] === '{'
            ? JSON.parse(window.localStorage.getItem('attributesWidget'))
            : {},
    );

    const [clearGroup, setClearGroup] = useState(null);
    const [showWidgetCode, setShowWidgetCode] = useState(window.localStorage.getItem('showWidgetCode') === 'true');
    const [triggerAllOpened, setTriggerAllOpened] = useState(0);
    const [triggerAllClosed, setTriggerAllClosed] = useState(0);

    useEffect(() => {
        const newAccordionOpen = {};
        if (props.triggerAllOpened !== triggerAllOpened) {
            fields.forEach(group => newAccordionOpen[group.name] = true);
            setTriggerAllOpened(props.triggerAllOpened);
            window.localStorage.setItem('attributesWidget', JSON.stringify(newAccordionOpen));
            setAccordionOpen(newAccordionOpen);
        }
        if (props.triggerAllClosed !== triggerAllClosed) {
            fields.forEach(group => newAccordionOpen[group.name] = false);
            setTriggerAllClosed(props.triggerAllClosed);
            window.localStorage.setItem('attributesWidget', JSON.stringify(newAccordionOpen));
            setAccordionOpen(newAccordionOpen);
        }
    }, [props.triggerAllOpened, props.triggerAllClosed]);

    if (!widgets) {
        return null;
    }

    const allOpened = !fields.find(group => !accordionOpen[group.name]);
    const allClosed = !fields.find(group => accordionOpen[group.name]);

    if (props.isAllClosed !== allClosed) {
        setTimeout(() => props.setIsAllClosed(allClosed), 50);
    }
    if (props.isAllOpened !== allOpened) {
        setTimeout(() => props.setIsAllOpened(allOpened), 50);
    }

    let list;
    if (props.selectedWidgets.length === 1) {
        const tpl = widgets[props.selectedWidgets[0]].tpl;
        const widgetType = getWidgetTypes().find(foundWidgetType => foundWidgetType.name === tpl);
        list = <div>
            <span>{props.selectedWidgets[0]}</span>
            <span style={{ fontSize: 12, fontStyle: 'italic', marginLeft: 8 }}>
                <span style={{ fontWeight: 'bold', marginRight: 4 }}>{widgetType?.set}</span>
                -
                <span style={{ marginLeft: 4 }}>{tpl === '_tplGroup' ? I18n.t('group') : widgetType?.title}</span>
            </span>
        </div>;
    } else {
        list = props.selectedWidgets.join(', ');
    }

    return <>
        <div style={{ width: '100%' }}>
            <div style={{ display: 'inline-block', width: '100%' }}>
                {list}
            </div>
        </div>

        <div style={{ height: 'calc(100% - 34px)', overflowY: 'auto' }}>
            {fields.map(group => {
                if (group.hidden) {
                    if (checkFunction(group.hidden, props.project, props.selectedView, props.selectedWidgets)) {
                        return null;
                    }
                }

                return <Accordion
                    classes={{
                        root: props.classes.clearPadding,
                        expanded: props.classes.clearPadding,
                    }}
                    square
                    key={group.name}
                    elevation={0}
                    expanded={!!(accordionOpen[group.name] && group.hasValues)}
                    onChange={(e, expanded) => {
                        const newAccordionOpen = JSON.parse(JSON.stringify(accordionOpen));
                        newAccordionOpen[group.name] = expanded;
                        window.localStorage.setItem('attributesWidget', JSON.stringify(newAccordionOpen));
                        setAccordionOpen(newAccordionOpen);
                    }}
                >
                    <AccordionSummary
                        classes={{
                            root: Utils.clsx(props.classes.clearPadding, accordionOpen[group.name]
                                ? props.classes.groupSummaryExpanded : props.classes.groupSummary, props.classes.lightedPanel),
                            content: props.classes.clearPadding,
                            expanded: props.classes.clearPadding,
                            expandIcon: props.classes.clearPadding,
                        }}
                        expandIcon={group.hasValues ? <ExpandMoreIcon /> : null}
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
                                    (window._(`group_${group.singleName || group.name}`) + (group.index !== undefined ? ` [${group.index}]` : ''))}
                            </div>
                            <div>
                                <Checkbox
                                    checked={group.hasValues}
                                    onClick={e => {
                                        if (group.hasValues) {
                                            setClearGroup(group);
                                        } else {
                                            const project = JSON.parse(JSON.stringify(props.project));
                                            props.selectedWidgets.forEach(selectedWidget => {
                                                group.fields.forEach(field => {
                                                    if (project[props.selectedView].widgets[selectedWidget][group.isStyle ? 'style' : 'data'][field.name] === undefined) {
                                                        project[props.selectedView].widgets[selectedWidget][group.isStyle ? 'style' : 'data'][field.name] = field.default || null;
                                                    }
                                                });
                                                project[props.selectedView].widgets[selectedWidget].data[`g_${group.name}`] = true;
                                            });
                                            const newAccordionOpen = JSON.parse(JSON.stringify(accordionOpen));
                                            newAccordionOpen[group.name] = true;
                                            window.localStorage.setItem('attributesWidget', JSON.stringify(newAccordionOpen));
                                            setAccordionOpen(newAccordionOpen);
                                            props.changeProject(project);
                                        }
                                        e.stopPropagation();
                                    }}
                                    size="small"
                                    classes={{ root: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding, props.classes.checkBox) }}
                                />
                            </div>
                        </div>
                    </AccordionSummary>
                    <AccordionDetails style={{ flexDirection: 'column', padding: 0, margin: 0 }}>
                        <table style={{ width: '100%' }}>
                            <tbody>{
                                group.fields.map((field, fieldIndex) => {
                                    let error;
                                    let disabled;
                                    if (field.hidden) {
                                        if (checkFunction(field.hidden, props.project, props.selectedView, props.selectedWidgets, field.index)) {
                                            return null;
                                        }
                                    }
                                    if (field.error) {
                                        error = checkFunction(field.error, props.project, props.selectedView, props.selectedWidgets, field.index);
                                    }
                                    if (field.disabled) {
                                        if (field.disabled === true) {
                                            disabled = true;
                                        } else {
                                            disabled = !!checkFunction(field.disabled, props.project, props.selectedView, props.selectedWidgets, field.index);
                                        }
                                    }

                                    return <tr key={fieldIndex} className={props.classes.fieldRow}>
                                        {field.type === 'delimiter' ?
                                            <td colSpan="2"><Divider style={{ borderBottomWidth: 'thick' }} /></td>
                                            : <>
                                                <td className={Utils.clsx(props.classes.fieldTitle, disabled && props.classes.fieldTitleDisabled, error && props.classes.fieldTitleError)} title={I18n.t(field.tooltip)}>
                                                    { ICONS[field.singleName || field.name] ? ICONS[field.singleName || field.name] : null }
                                                    { field.title || (field.label && I18n.t(field.label)) ||
                                                        (window._(field.singleName || field.name) + (field.index !== undefined ? ` [${field.index}]` : '')) }
                                                    { group.isStyle ?
                                                        <ColorizeIcon
                                                            fontSize="small"
                                                            className={props.classes.colorize}
                                                            onClick={() => props.cssClone(field.name, newValue => {
                                                                if (newValue !== null && newValue !== undefined) {
                                                                    const project = JSON.parse(JSON.stringify(props.project));
                                                                    props.selectedWidgets.forEach(selectedWidget =>
                                                                        project[props.selectedView].widgets[selectedWidget].style[field.name] = newValue);
                                                                    props.changeProject(project);
                                                                }
                                                            })}
                                                        /> : null }
                                                    {field.tooltip ? <InfoIcon className={props.classes.infoIcon} /> : null}
                                                </td>
                                                <td className={props.classes.fieldContent}>
                                                    <div className={props.classes.fieldContentDiv}>
                                                        <div className={props.classes.fieldInput}>
                                                            {accordionOpen[group.name] && group.hasValues ?
                                                                <WidgetField
                                                                    error={error}
                                                                    disabled={disabled}
                                                                    field={field}
                                                                    widget={props.selectedWidgets.length > 1 ? commonValues : widget}
                                                                    isStyle={group.isStyle}
                                                                    isDifferent={isDifferent[field.name]}
                                                                    {...props}
                                                                /> : null}
                                                        </div>
                                                    </div>
                                                </td>
                                            </>}
                                    </tr>;
                                })
                            }
                            </tbody>
                        </table>
                    </AccordionDetails>
                </Accordion>
            })}
            <IODialog
                title="Are you sure"
                onClose={() => setClearGroup(null)}
                open={!!clearGroup}
                action={() => {
                    const project = JSON.parse(JSON.stringify(props.project));
                    const group = clearGroup;
                    props.selectedWidgets.forEach(selectedWidget => {
                        group.fields.forEach(field => {
                            delete project[props.selectedView].widgets[selectedWidget][group.isStyle ? 'style' : 'data'][field.name];
                        });
                        delete project[props.selectedView].widgets[selectedWidget].data[`g_${group.name}`];
                    });
                    props.changeProject(project);
                }}
                actionTitle="Clear"
            >
                {I18n.t('Fields of group will be cleaned')}
            </IODialog>
            <Button
                style={{ opacity: showWidgetCode ? 1 : 0 }}
                onClick={() => {
                    setShowWidgetCode(!showWidgetCode);
                    window.localStorage.setItem('showWidgetCode', showWidgetCode ? 'false' : 'true');
                }}
                startIcon={<CodeIcon />}
            >
                { showWidgetCode ? I18n.t('hide code') : I18n.t('show code') }
            </Button>
            {showWidgetCode ? <pre>
                {JSON.stringify(widget, null, 2)}
                {JSON.stringify(customFields, null, 2)}
            </pre> : null}
        </div>
    </>;
};

const WidgetContainer = props => {
    const widgetTypes = useMemo(() => getWidgetTypes(), [props.widgetsLoaded]);
    const widgets = props.project[props.selectedView]?.widgets;

    let widgetsExist = 0;
    widgets && props.selectedWidgets.forEach(selectedWidget => {
        if (widgets[selectedWidget] && widgetTypes.find(type => type.name === widgets[selectedWidget].tpl)) {
            widgetsExist++;
        }
    });
    if (!widgets || props.selectedWidgets.length !== widgetsExist) {
        return null;
    }

    return <Widget widgetTypes={widgetTypes} {...props} />;
};

WidgetContainer.propTypes = {
    adapterName: PropTypes.string.isRequired,
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

export default withStyles(styles)(WidgetContainer);
