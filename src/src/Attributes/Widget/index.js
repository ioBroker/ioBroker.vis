import PropTypes from 'prop-types';
import { useState } from 'react';
import { withStyles } from '@mui/styles';

import {
    Accordion, AccordionDetails, AccordionSummary, Divider,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import i18n from '@iobroker/adapter-react-v5/i18n';
import Utils from '@iobroker/adapter-react-v5/Components/Utils';

import WidgetField from './WidgetField';

const getWidgetTypes = () => Array.from(document.querySelectorAll('script[type="text/ejs"]'))
    .map(script => ({
        name: script.attributes.id.value,
        set: script.attributes['data-vis-set'] ? script.attributes['data-vis-set'].value : null,
        params: Object.values(script.attributes)
            .filter(attribute => attribute.name.startsWith('data-vis-attrs'))
            .map(attribute => attribute.value)
            .join(''),
    }));

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
    fieldTitle: {
        width: 140,
        fontSize: '80%',
    },
    fieldContent: {
        '&&&&&&': {
            fontSize: '80%',
        },
        '& svg': {
            fontSize: '1rem',
        },
    },
    fieldContentColor: {
        '&&&&&& label': {
            display: 'none',
        },
        '&&&&&& input': {
            fontSize: '80%',
        },
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
});

const getFieldsBefore = () => [
    {
        name: 'general',
        fields: [
            { name: 'name' },
            { name: 'comment' },
            { name: 'class', type: 'class' },
            { name: 'filterkey', type: 'auto' },
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

const getFieldsAfter = widgets => [
    {
        name: 'css_common',
        isStyle: true,
        fields: [{ name: 'position', type: 'nselect', options: ['', 'relative', 'sticky'] },
            { name: 'display', type: 'nselect', options: ['', 'inline-block'] },
            { name: 'left', type: 'dimension' },
            { name: 'top', type: 'dimension' },
            { name: 'width', type: 'dimension' },
            { name: 'height', type: 'dimension' },
            { name: 'z-index' },
            { name: 'overflow-x', type: 'nselect', options: ['', 'visible', 'hidden', 'scroll', 'auto', 'initial', 'inherit'] },
            { name: 'overflow-y', type: 'nselect', options: ['', 'visible', 'hidden', 'scroll', 'auto', 'initial', 'inherit'] },
            { name: 'opacity' },
            { name: 'cursor', type: 'auto' },
            { name: 'transform' }],
    },
    {
        name: 'css_font',
        isStyle: true,
        fields: [{ name: 'color', type: 'color' },
            { name: 'text-align', type: 'nselect', options: ['', 'left', 'right', 'center', 'justify', 'initial', 'inherit'] },
            { name: 'text-shadow' },
            {
                name: 'font-family',
                type: 'auto',
                options: ['Verdana, Geneva, sans-serif',
                    'Georgia, "Times New Roman", Times, serif',
                    '"Courier New", Courier, monospace',
                    'Arial, Helvetica, sans-serif',
                    'Tahoma, Geneva, sans-serif',
                    '"Trebuchet MS", Arial, Helvetica, sans-serif',
                    '"Arial Black", Gadget, sans-serif',
                    '"Times New Roman", Times, serif',
                    '"Palatino Linotype", "Book Antiqua", Palatino, serif',
                    '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
                    '"MS Serif", "New York", serif',
                    '"Comic Sans MS", cursive'],
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
        fields: [{ name: 'border-width' },
            { name: 'border-style' },
            { name: 'border-color', type: 'color' },
            { name: 'border-radius' }],
    },
    {
        name: 'css_padding',
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
                options: Object.keys(widgets).filter(widget => widgets[widget].tpl === 'tplValueGesture'),
            },
            { name: 'gestures-offsetX', default: 0, type: 'number' },
            { name: 'gestures-offsetY', default: 0, type: 'number' },
            { type: 'delimeter' },
            ...(['swiping', 'rotating', 'pinching'].flatMap(gesture => [
                { name: `gestures-${gesture}-oid`,        type: 'id' },
                { name: `gestures-${gesture}-value`,      default: '' },
                { name: `gestures-${gesture}-minimum`,    type: 'number' },
                { name: `gestures-${gesture}-maximum`,    type: 'number' },
                { name: `gestures-${gesture}-delta`,      type: 'number' },
                { type: 'delimeter' },
            ])),
            ...(['swipeRight', 'swipeLeft', 'swipeUp', 'swipeDown', 'rotateLeft', 'rotateRight', 'pinchIn', 'pinchOut'].flatMap(gesture => [
                { name: `gestures-${gesture}-oid`,    type: 'id' },
                { name: `gestures-${gesture}-value`,  default: '' },
                { name: `gestures-${gesture}-limit`,  type: 'number' },
                { type: 'delimeter' },
            ])),
        ],
    },
    {
        name: 'notification',
        fields: [...([0, 1, 2].flatMap(i => [
            { name: `signals-oid-${i}`, type: 'id' },
            {
                name: `signals-cond-${i}`, type: 'select', options: ['==', '!=', '<=', '>=', '<', '>', 'consist', 'not consist', 'exist', 'not exist'], default: '==',
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
            { type: 'delimeter' },
        ]))],
    },
    {
        name: 'show_last',
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

const Widget = props => {
    if (props.widgetsLoaded && props.selectedWidgets && props.selectedWidgets.length) {
        let widget;
        let widgetType;

        const selectedWidgetsFields = [];

        const commonFields = {};
        const commonGroups = { common: props.selectedWidgets.length };

        props.selectedWidgets.forEach((selectedWidget, widgetIndex) => {
            const fields = [{
                name: 'common',
                singleName: 'common',
                fields: [],
            }];

            widget = props.project[props.selectedView].widgets[selectedWidget];
            if (!widget) {
                return;
            }
            widgetType = getWidgetTypes().find(type => type.name === widget.tpl);
            if (!widgetType) {
                return;
            }

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
                    const match = fieldString.match(/([a-zA-Z0-9._-]+)(\([a-zA-Z.0-9-_]*\))?(\[.*])?(\/[-_,^§~\s:\/\.a-zA-Z0-9]+)?/);

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
                    } else if (field.name.indexOf('_effect') !== -1) {
                        field.type = 'effect';
                    } else if (field.name.indexOf('_eff_opt') !== -1) {
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
                        const repeatsMatch = repeats.match(/\(([0-9a-z]+)-([0-9a-z]+)\)/i);
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

            selectedWidgetsFields.push(fields);
        });

        let fields;
        const commonValues = {};
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
                const currentWidget = props.project[props.selectedView].widgets[selectedWidget];
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
                        }
                    });
                    Object.keys(commonValues.style).forEach(field => {
                        if (commonValues.style[field] !== currentWidget.style[field]) {
                            commonValues.style[field] = null;
                        }
                    });
                }
            });
        } else {
            fields = selectedWidgetsFields[0];
        }

        if (!selectedWidgetsFields.length) {
            return null;
        }

        const fieldsManual = [...fields];

        fields = [...getFieldsBefore(), ...fields, ...getFieldsAfter(props.project[props.selectedView].widgets)];

        const [accordionOpen, setAccordionOpen] = useState(
            window.localStorage.getItem('attributesWidget') && window.localStorage.getItem('attributesWidget')[0] === '{'
                ? JSON.parse(window.localStorage.getItem('attributesWidget'))
                : {},
        );

        return <div>
            <h4>{props.selectedWidgets.join(', ')}</h4>
            <pre>
                {JSON.stringify(widgetType, null, 2)}
                {JSON.stringify(fieldsManual, null, 2)}
            </pre>
            {fields.map((group, key) => <Accordion
                classes={{
                    root: props.classes.clearPadding,
                    expanded: props.classes.clearPadding,
                }}
                square
                key={group.name}
                elevation={0}
                expanded={!!accordionOpen[group.name]}
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
                    expandIcon={<ExpandMoreIcon />}
                >
                    {window._(group.singleName || group.name) + (group.index !== undefined ? ` [${group.index}]` : '')}
                </AccordionSummary>
                <AccordionDetails style={{ flexDirection: 'column', padding: 0, margin: 0 }}>
                    <table style={{ width: '100%' }}>
                        <tbody>
                            {
                                group.fields.map((field, key2) => <tr key={key2}>
                                    {field.type === 'delimeter' ?
                                        <td colSpan="2">
                                            <Divider style={{ borderBottomWidth: 'thick' }} />
                                        </td>
                                        : <>
                                            <td className={props.classes.fieldTitle}>
                                                {window._(field.singleName || field.name) + (field.index !== undefined ? ` [${field.index}]` : '')}
                                            </td>
                                            <td className={props.classes.fieldContent}>
                                                <WidgetField
                                                    field={field}
                                                    widget={props.selectedWidgets.length > 1 ? commonValues : widget}
                                                    isStyle={group.isStyle}
                                                    {...props}
                                                />
                                            </td>
                                        </>}
                                </tr>)
                            }
                        </tbody>
                    </table>
                </AccordionDetails>
            </Accordion>)}
            <pre>
                {/* {JSON.stringify(widget, null, 2)} */}
            </pre>
        </div>;
    }
    return null;
};

Widget.propTypes = {
    selectedView: PropTypes.string,
    selectedWidgets: PropTypes.array,
    project: PropTypes.object,
    adapterName: PropTypes.string.isRequired,
    instance: PropTypes.number.isRequired,
    projectName: PropTypes.string.isRequired,
};

export default withStyles(styles)(Widget);
