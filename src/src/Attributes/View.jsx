import PropTypes from 'prop-types';
import {
    useEffect,
    useRef,
    useState,
    useMemo,
} from 'react';
import { withStyles } from '@mui/styles';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary, Button,
    Checkbox, Fade,
    IconButton,
    ListItemText,
    MenuItem,
    Paper,
    Popper,
    Select,
    TextField,
    Autocomplete,
    Slider,
    Input,
    Tooltip,
} from '@mui/material';

import {
    ExpandMore as ExpandMoreIcon,
    Close as CloseIcon,
    Clear as ClearIcon,
    Info as InfoIcon,
} from '@mui/icons-material';

import {
    ColorPicker,
    Utils,
    I18n,
    IconPicker,
    SelectFile as SelectFileDialog,
    Confirm as ConfirmDialog,
    TextWithIcon, Icon,
} from '@iobroker/adapter-react-v5';

import { theme, background } from './ViewData';
import MaterialIconSelector from '../Components/MaterialIconSelector';
import { store } from '../Store';

const styles = _theme => ({
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
    fieldContentDiv: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
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
            marginTop: 10,
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
    lightedPanel: _theme.classes.lightedPanel,
    fieldContentSlider: {
        display: 'inline',
        width: 'calc(100% - 82px)',
        marginRight: 8,
    },
    fieldContentSliderInput: {
        display: 'inline',
        width: 50,
    },
    fieldContentSliderClear: {
        display: 'inline',
        width: 32,
    },
    fieldHelpText: {
        float: 'right',
        fontSize: 16,
    },
});

const resolution = [
    { value: 'none', label: 'not defined' },
    { value: 'user', label: 'User defined' },
    { value: '375x667', label: 'iPhone SE - Portrait' },
    { value: '667x375', label: 'iPhone SE - Landscape' },
    { value: '414x896', label: 'iPhone XR - Portrait' },
    { value: '896x414', label: 'iPhone XR - Landscape' },
    { value: '390x844', label: 'iPhone 12 Pro - Portrait' },
    { value: '844x390', label: 'iPhone 12 Pro - Landscape' },
    { value: '393x851', label: 'Pixel 5 - Portrait' },
    { value: '851x393', label: 'Pixel 5 - Landscape' },
    { value: '360x740', label: 'Samsung Galaxy S8+ - Portrait' },
    { value: '740x360', label: 'Samsung Galaxy S8+ - Landscape' },
    { value: '412x915', label: 'Samsung Galaxy S20 Ultra - Portrait' },
    { value: '915x412', label: 'Samsung Galaxy S20 Ultra - Landscape' },
    { value: '820x1180', label: 'iPad Air - Portrait' },
    { value: '1180x820', label: 'iPad Air - Landscape' },
    { value: '768x1024', label: 'iPad Mini - Portrait' },
    { value: '1024x768', label: 'iPad Mini - Landscape' },
    { value: '1024x1366', label: 'iPad Pro - Portrait' },
    { value: '1366x1024', label: 'iPad Pro - Landscape' },
    { value: '912x1368', label: 'Surface Pro 7 - Portrait' },
    { value: '1368x912', label: 'Surface Pro 7 - Landscape' },
    { value: '540x720', label: 'Surface Duo - Portrait' },
    { value: '720x540', label: 'Surface Duo - Landscape' },
    { value: '280x653', label: 'Galaxy Fold - Portrait' },
    { value: '653x280', label: 'Galaxy Fold - Landscape' },
    { value: '412x914', label: 'Samsung Galaxy A51/71 - Portrait' },
    { value: '914x412', label: 'Samsung Galaxy A51/71 - Landscape' },
    { value: '600x1024', label: 'Nest Hub - Portrait' },
    { value: '1024x600', label: 'Nest Hub - Landscape' },
    { value: '800x1280', label: 'Nest Hub Max - Portrait' },
    { value: '1280x800', label: 'Nest Hub Max - Landscape' },
    { value: '720x1280', label: 'HD - Portrait' },
    { value: '1280x720', label: 'HD - Landscape' },
    { value: '1080x1920', label: 'Full HD - Portrait' },
    { value: '1920x1080', label: 'Full HD - Landscape' },
];

const checkFunction = (funcText, settings) => {
    try {
        let _func;
        if (typeof funcText === 'function') {
            _func = funcText;
        } else {
            // eslint-disable-next-line no-new-func
            _func = new Function('data', `return ${funcText}`);
        }
        return _func(settings);
    } catch (e) {
        console.error(`Cannot execute hidden on "${funcText}": ${e}`);
    }
    return false;
};

function isPropertySameInAllViews(project, field, selectedView, views) {
    let value = project[selectedView].settings[field];
    views = views || Object.keys(project).filter(v => v !== '___settings' && v !== selectedView);
    if (field.type === 'checkbox') {
        value = !!value;
    } else {
        value = value || '';
    }

    if (!views.length) {
        return true;
    }

    for (let v = 0; v < views.length; v++) {
        let val = project[views[v]].settings[field];
        if (field.type === 'checkbox') {
            val = !!val;
        } else {
            val = val || '';
        }

        if (val !== value) {
            return false;
        }
    }

    return true;
}

const View = props => {
    if (!store.getState().visProject || !store.getState().visProject[props.selectedView]) {
        return null;
    }

    const [triggerAllOpened, setTriggerAllOpened] = useState(0);
    const [triggerAllClosed, setTriggerAllClosed] = useState(0);
    const [showAllViewDialog, setShowAllViewDialog] = useState(null);

    const view = store.getState().visProject[props.selectedView];

    let resolutionSelect = `${view.settings.sizex}x${view.settings.sizey}`;
    if (view.settings.sizex === undefined && view.settings.sizey === undefined) {
        resolutionSelect = 'none';
    } else if (!resolution.find(item => item.value === resolutionSelect)) {
        resolutionSelect = 'user';
    }

    const fields = useMemo(() => ([
        {
            name: 'CSS Common',
            fields: [
                {
                    name: 'display',
                    field: 'display',
                    type: 'select',
                    options: [
                        { label: 'flex', value: 'flex' },
                        { label: 'block', value: 'block' },
                    ],
                    noTranslation: true,
                    title: 'For widgets with relative position',
                },
                { name: 'Comment', field: 'comment', notStyle: true },
                { name: 'CSS Class', field: 'class', notStyle: true },
                {
                    name: 'Initial filter', field: 'filterkey', notStyle: true, type: 'filter',
                },
                {
                    name: 'Only for groups',
                    field: 'group',
                    notStyle: true,
                    type: 'groups',
                    title: 'This view will be shown only to defined groups',
                },
                {
                    name: 'Theme',
                    field: 'theme',
                    notStyle: true,
                    type: 'select',
                    options: theme,
                    noTranslation: true,
                },
                {
                    name: 'If user not in group',
                    field: 'group_action',
                    notStyle: true,
                    type: 'select',
                    options: [
                        { label: 'Disabled', value: 'disabled' },
                        { label: 'Hide', value: 'hide' },
                    ],
                },
            ],
        },
        {
            name: 'CSS background (background-...)',
            fields: [
                {
                    name: 'Image',
                    field: 'bg-image',
                    type: 'image',
                    hidden: 'data.useBackground || (data.style && (!!data.style.background_class || !!data.style["background-color"] || !!data.style["background-image"] || !!data.style["background-size"] || !!data.style["background-repeat"] || !!data.style["background-position"] || !!data.style["background-attachment"]))',
                    notStyle: true,
                },
                {
                    name: 'Position left',
                    field: 'bg-position-x',
                    type: 'slider',
                    hidden: '!data["bg-image"]',
                    notStyle: true,
                    min: -100,
                    max: 500,
                },
                {
                    name: 'Position top',
                    field: 'bg-position-y',
                    type: 'slider',
                    hidden: '!data["bg-image"]',
                    notStyle: true,
                    min: -100,
                    max: 500,
                },
                {
                    name: 'Width',
                    field: 'bg-width',
                    type: 'type',
                    hidden: '!data["bg-image"]',
                    notStyle: true,
                },
                {
                    name: 'Height',
                    field: 'bg-height',
                    type: 'text',
                    hidden: '!data["bg-image"]',
                    notStyle: true,
                },
                {
                    name: 'Color',
                    field: 'bg-color',
                    type: 'color',
                    hidden: '!data["bg-image"]',
                    notStyle: true,
                },
                {
                    name: 'Background class',
                    type: 'select',
                    options: background,
                    field: 'background_class',
                    // eslint-disable-next-line react/no-unstable-nested-components
                    itemModify: item => <>
                        <span className={`${props.classes.backgroundClassSquare} ${item.value}`} />
                        {I18n.t(item.name)}
                    </>,
                    renderValue: value => <div className={props.classes.backgroundClass}>
                        <span className={`${props.classes.backgroundClassSquare} ${value}`} />
                        {I18n.t(background.find(item => item.value === value).name)}
                    </div>,
                    hidden: '!!data["bg-image"]',
                },
                {
                    name: 'One parameter',
                    type: 'checkbox',
                    field: 'useBackground',
                    notStyle: true,
                    hidden: '!!data.background_class || !!data["bg-image"]',
                },
                { name: 'background', field: 'background', hidden: '!data.useBackground || !!data.background_class || !!data["bg-image"]'  },
                {
                    name: '-color', type: 'color', field: 'background-color', hidden: 'data.useBackground || !!data.background_class || !!data["bg-image"]',
                },
                { name: '-image', field: 'background-image', hidden: 'data.useBackground || !!data.background_class || !!data["bg-image"]' },
                {
                    name: '-repeat',
                    type: 'autocomplete',
                    field: 'background-repeat',
                    hidden: 'data.useBackground || !!data.background_class || !!data["bg-image"]',
                    options: [
                        'repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'initial', 'inherit',
                    ],
                },
                {
                    name: '-attachment',
                    field: 'background-attachment',
                    type: 'autocomplete',
                    hidden: 'data.useBackground || !!data.background_class || !!data["bg-image"]',
                    options: ['scroll', 'fixed', 'local', 'initial', 'inherit'],
                },
                {
                    name: '-position',
                    field: 'background-position',
                    type: 'autocomplete',
                    hidden: 'data.useBackground || !!data.background_class || !!data["bg-image"]',
                    options: ['left top', 'left center', 'left bottom', 'right top', 'right center', 'right bottom', 'center top', 'center center', 'center bottom', 'initial', 'inherit'],
                },
                {
                    name: '-size',
                    field: 'background-size',
                    type: 'autocomplete',
                    hidden: 'data.useBackground || !!data.background_class || !!data["bg-image"]',
                    options: ['auto', 'cover', 'contain', 'initial', 'inherit'],
                },
                {
                    name: '-clip',
                    field: 'background-clip',
                    type: 'autocomplete',
                    hidden: 'data.useBackground || !!data.background_class || !!data["bg-image"]',
                    options: ['border-box', 'padding-box', 'content-box', 'initial', 'inherit'],
                },
                {
                    name: '-origin',
                    field: 'background-origin',
                    type: 'autocomplete',
                    hidden: 'data.useBackground || !!data.background_class || !!data["bg-image"]',
                    options: ['border-box', 'padding-box', 'content-box', 'initial', 'inherit'],
                },
            ],
        },
        {
            name: 'CSS Font & Text',
            fields: [
                { name: 'color', type: 'color', field: 'color' },
                { name: 'text-shadow', field: 'text-shadow' },
                { name: 'font-family', field: 'font-family' },
                { name: 'font-style', field: 'font-style' },
                { name: 'font-variant', field: 'font-variant' },
                { name: 'font-weight', field: 'font-weight' },
                { name: 'font-size', field: 'font-size' },
                { name: 'line-height', field: 'line-height' },
                { name: 'letter-spacing', field: 'letter-spacing' },
                { name: 'word-spacing', field: 'word-spacing' },
            ],
        },
        {
            name: 'Options',
            fields: [
                {
                    type: 'checkbox', name: 'Default', field: 'useAsDefault', notStyle: true,
                },
                {
                    type: 'checkbox', name: 'Render always', field: 'alwaysRender', notStyle: true,
                },
                {
                    type: 'select',
                    name: 'Grid',
                    field: 'snapType',
                    options: [
                        { label: 'Disabled', value: 0 },
                        { label: 'Elements', value: 1 },
                        { label: 'Grid', value: 2 },
                    ],
                    notStyle: true,
                },
                {
                    type: 'color',
                    name: 'Grid color',
                    field: 'snapColor',
                    hidden: 'data.snapType !== 2',
                    notStyle: true,
                },
                {
                    type: 'number',
                    name: 'Grid size',
                    field: 'gridSize',
                    notStyle: true,
                    hidden: 'data.snapType !== 2',
                },
                {
                    type: 'select',
                    name: 'Resolution',
                    options: resolution,
                    width: 236,
                    value: resolutionSelect,
                    onChange: e => {
                        const project = JSON.parse(JSON.stringify(store.getState().visProject));
                        if (e.target.value === 'none') {
                            delete project[props.selectedView].settings.sizex;
                            delete project[props.selectedView].settings.sizey;
                        } else if (e.target.value === 'user') {
                            project[props.selectedView].settings.sizex = project[props.selectedView].settings.sizex || 0;
                            project[props.selectedView].settings.sizey = project[props.selectedView].settings.sizey || 0;
                            const _resolutionSelect = `${project[props.selectedView].settings.sizex}x${project[props.selectedView].settings.sizey}`;
                            if (resolution.find(item => item.value === _resolutionSelect)) {
                                project[props.selectedView].settings.sizex++;
                            }
                        } else {
                            const match = e.target.value.match(/^([0-9]+)x([0-9]+)$/);
                            project[props.selectedView].settings.sizex = match[1];
                            project[props.selectedView].settings.sizey = match[2];
                        }
                        props.changeProject(project);
                    },
                    notStyle: true,
                },
                {
                    type: 'raw',
                    name: 'Width x height (px)',
                    hidden: 'data.sizex === undefined && data.sizey === undefined',
                    Component: <span style={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                            variant="standard"
                            value={view.settings.sizex === undefined ? '' : view.settings.sizex}
                            disabled={!props.editMode || resolutionSelect !== 'user'}
                            InputProps={{
                                classes: {
                                    input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                                },
                            }}
                            onChange={e => {
                                const project = JSON.parse(JSON.stringify(store.getState().visProject));
                                project[props.selectedView].settings.sizex = e.target.value;
                                props.changeProject(project);
                            }}
                        />
                        <CloseIcon
                            fontSize="small"
                            style={{
                                padding: '0px 10px',
                            }}
                        />
                        <TextField
                            variant="standard"
                            value={view.settings.sizey === undefined ? '' : view.settings.sizey}
                            disabled={!props.editMode || resolutionSelect !== 'user'}
                            InputProps={{
                                classes: {
                                    input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                                },
                            }}
                            onChange={e => {
                                const project = JSON.parse(JSON.stringify(store.getState().visProject));
                                project[props.selectedView].settings.sizey = e.target.value;
                                props.changeProject(project);
                            }}
                        />
                    </span>,
                    notStyle: true,
                },
                {
                    type: 'checkbox',
                    name: 'Limit screen',
                    field: 'limitScreen',
                    hidden: 'data.sizex === undefined && data.sizey === undefined',
                    notStyle: true,
                },
                {
                    type: 'slider',
                    name: 'Limit border width',
                    field: 'limitScreenBorderWidth',
                    min: 0,
                    max: 20,
                    hidden: '(data.sizex === undefined && data.sizey === undefined) || !data.limitScreen',
                    notStyle: true,
                },
                {
                    type: 'color',
                    name: 'Limit border color',
                    field: 'limitScreenBorderColor',
                    hidden: '(data.sizex === undefined && data.sizey === undefined) || !data.limitScreen || !data.limitScreenBorderWidth',
                    notStyle: true,
                },
                {
                    type: 'select',
                    name: 'Limit border style',
                    field: 'limitScreenBorderStyle',
                    noTranslation: true,
                    options: [
                        { label: 'solid', value: 'solid' },
                        { label: 'dotted', value: 'dotted' },
                        { label: 'dashed', value: 'dashed' },
                        { label: 'double', value: 'double' },
                        { label: 'groove', value: 'groove' },
                        { label: 'ridge', value: 'ridge' },
                        { label: 'inset', value: 'inset' },
                        { label: 'outset', value: 'outset' },
                    ],
                    hidden: '(data.sizex === undefined && data.sizey === undefined) || !data.limitScreen || !data.limitScreenBorderWidth',
                    notStyle: true,
                },
                {
                    type: 'color',
                    name: 'Limit background color',
                    field: 'limitScreenBackgroundColor',
                    hidden: '(data.sizex === undefined && data.sizey === undefined) || !data.limitScreen',
                    notStyle: true,
                },
            ],
        },
        {
            name: 'Navigation',
            fields: [
                {
                    type: 'checkbox', name: 'Show navigation', field: 'navigation', notStyle: true, applyToAll: true, groupApply: true,
                },
                {
                    type: 'text', name: 'Title', field: 'navigationTitle', notStyle: true, hidden: '!data.navigation',
                },
                {
                    type: 'number', name: 'Order', field: 'navigationOrder', notStyle: true, hidden: '!data.navigation',
                },
                {
                    type: 'icon64', name: 'Icon', field: 'navigationIcon', notStyle: true, hidden: '!data.navigation || data.navigationImage',
                },
                {
                    type: 'image', name: 'Image', field: 'navigationImage', notStyle: true, hidden: '!data.navigation || data.navigationIcon',
                },
                {
                    type: 'select',
                    name: 'Orientation',
                    field: 'navigationOrientation',
                    notStyle: true,
                    default: 'vertical',
                    hidden: '!data.navigation',
                    applyToAll: true,
                    options: [
                        { value: 'vertical', label: 'Vertical' },
                        { value: 'horizontal', label: 'Horizontal' },
                    ],
                },
                {
                    type: 'checkbox', name: 'Only icon', field: 'navigationOnlyIcon', notStyle: true, default: true, hidden: '!data.navigation || data.navigationOrientation !== "horizontal"', applyToAll: true,
                },
                {
                    type: 'color', name: 'Background color', field: 'navigationBackground', notStyle: true, hidden: '!data.navigation || data.navigationOrientation === "horizontal"', applyToAll: true,
                },
                {
                    type: 'checkbox', name: 'Hide menu', field: 'navigationHideMenu', notStyle: true, hidden: '!data.navigation || data.navigationOrientation === "horizontal"', applyToAll: true,
                },
                {
                    type: 'text', name: 'Menu header text', field: 'navigationHeaderText', notStyle: true, hidden: '!data.navigation || data.navigationOrientation === "horizontal" || !data.navigationBar', applyToAll: true,
                },
                {
                    type: 'checkbox', name: 'Do not hide menu', field: 'navigationNoHide', notStyle: true, hidden: '!data.navigation || data.navigationOrientation === "horizontal"', applyToAll: true,
                },
                {
                    type: 'checkbox', name: 'Show background of button', field: 'navigationButtonBackground', notStyle: true, hidden: '!data.navigation || data.navigationNoHide || data.navigationOrientation === "horizontal"', applyToAll: true,
                },
            ],
        },
        {
            name: 'App bar',
            hidden: '!!data.navigation && data.navigationOrientation === "horizontal"',
            fields: [
                {
                    type: 'checkbox', name: 'Show app bar', field: 'navigationBar', notStyle: true, default: true, applyToAll: true, groupApply: true,
                },
                {
                    type: 'color', name: 'Bar color', field: 'navigationBarColor', notStyle: true, hidden: '!data.navigationBar', applyToAll: true,
                },
                {
                    type: 'text', name: 'Bar text', field: 'navigationBarText', notStyle: true, hidden: '!data.navigationBar', applyToAll: true,
                },
                {
                    type: 'icon64', name: 'Bar icon', field: 'navigationBarIcon', notStyle: true, hidden: '!data.navigationBar || !!data.navigationBarImage', applyToAll: true,
                },
                {
                    type: 'image', name: 'Bar image', field: 'navigationBarImage', notStyle: true, hidden: '!data.navigationBar || !!data.navigationBarIcon', applyToAll: true,
                },
            ],
        },
        {
            name: 'Responsive settings',
            fields: [
                /*
                {
                    type: 'select',
                    name: 'Direction',
                    field: 'flexDirection',
                    notStyle: true,
                    options: [
                        { label: 'Column', value: 'column' },
                        { label: 'Row', value: 'row' },
                    ],
                },
                {
                    type: 'select',
                    name: 'Wrap',
                    field: 'flexWrap',
                    notStyle: true,
                    options: [
                        { label: 'Wrap', value: 'wrap' },
                        { label: 'No wrap', value: 'nowrap' },
                    ],
                },
                {
                    type: 'select',
                    name: 'Justify content',
                    field: 'justifyContent',
                    notStyle: true,
                    options: [
                        { label: 'flex-start', value: 'flex-start' },
                        { label: 'center', value: 'center' },
                        { label: 'flex-end', value: 'flex-end' },
                        { label: 'space-between', value: 'space-between' },
                        { label: 'space-around', value: 'space-around' },
                        { label: 'space-evenly', value: 'space-evenly' },
                    ],
                },
                {
                    type: 'select',
                    name: 'Align items',
                    field: 'alignItems',
                    notStyle: true,
                    options: [
                        { label: 'flex-start', value: 'flex-start' },
                        { label: 'center', value: 'center' },
                        { label: 'flex-end', value: 'flex-end' },
                        { label: 'stretch', value: 'stretch' },
                        { label: 'baseline', value: 'baseline' },
                    ],
                },
                {
                    type: 'select',
                    name: 'Align content',
                    field: 'alignContent',
                    hidden: data => data.flexWrap === 'nowrap',
                    notStyle: true,
                    options: [
                        { label: 'flex-start', value: 'flex-start' },
                        { label: 'center', value: 'center' },
                        { label: 'flex-end', value: 'flex-end' },
                        { label: 'stretch', value: 'stretch' },
                        { label: 'space-between', value: 'space-between' },
                        { label: 'space-around', value: 'space-around' },
                    ],
                },
                */
                {
                    type: 'slider',
                    name: 'Column width',
                    field: 'columnWidth',
                    min: 200,
                    max: 2000,
                    step: 10,
                    notStyle: true,
                },
                {
                    type: 'slider',
                    name: 'Column gap',
                    field: 'columnGap',
                    min: 0,
                    max: 200,
                    step: 1,
                    notStyle: true,
                },
                {
                    type: 'slider',
                    name: 'Row gap',
                    field: 'rowGap',
                    min: 0,
                    max: 200,
                    step: 1,
                    notStyle: true,
                },
            ],
        },
    ]), [resolutionSelect, `${view.settings.sizex}x${view.settings.sizey}`]);

    const [accordionOpen, setAccordionOpen] = useState(
        window.localStorage.getItem('attributesView')
            ? JSON.parse(window.localStorage.getItem('attributesView'))
            : fields.map(() => false),
    );
    const [showDialog, setShowDialog] = useState(false);
    const [showDialog64, setShowDialog64] = useState(false);
    const [textDialogFocused, setTextDialogFocused] = useState(false);
    const [textDialogEnabled, setTextDialogEnabled] = useState(true);
    const textRef = useRef();

    useEffect(() => {
        const newAccordionOpen = {};
        if (props.triggerAllOpened !== triggerAllOpened) {
            fields.forEach((group, key) => newAccordionOpen[key] = true);
            setTriggerAllOpened(props.triggerAllOpened);
            window.localStorage.setItem('attributesView', JSON.stringify(newAccordionOpen));
            setAccordionOpen(newAccordionOpen);
        }
        if (props.triggerAllClosed !== triggerAllClosed) {
            fields.forEach((group, key) => newAccordionOpen[key] = false);
            setTriggerAllClosed(props.triggerAllClosed);
            window.localStorage.setItem('attributesView', JSON.stringify(newAccordionOpen));
            setAccordionOpen(newAccordionOpen);
        }
    }, [props.triggerAllOpened, props.triggerAllClosed]);

    const allOpened = !fields.find((group, key) => !accordionOpen[key]);
    const allClosed = !fields.find((group, key) => accordionOpen[key]);

    if (props.isAllClosed !== allClosed) {
        setTimeout(() => props.setIsAllClosed(allClosed), 50);
    }
    if (props.isAllOpened !== allOpened) {
        setTimeout(() => props.setIsAllOpened(allOpened), 50);
    }

    const viewList = Object.keys(store.getState().visProject).filter(v => v !== '___settings' && v !== props.selectedView);

    let allViewDialog = null;
    if (showAllViewDialog) {
        const viewsToChange = [];
        if (showAllViewDialog.groupApply) {
            // find all fields with applyToAll flag, and if any is not equal show button
            for (let f = 0; f < showAllViewDialog.group.fields.length; f++) {
                const field = showAllViewDialog.group.fields[f];
                if (field.applyToAll && !field.groupApply) {
                    let selectedViewValue = store.getState().visProject[props.selectedView].settings[field.field];
                    if (field.type === 'boolean') {
                        selectedViewValue = !!selectedViewValue;
                    } else {
                        selectedViewValue = selectedViewValue || '';
                    }
                    viewList.forEach(_view => {
                        let viewValue = store.getState().visProject[_view].settings[field.field];
                        if (field.type === 'boolean') {
                            viewValue = !!viewValue;
                        } else {
                            viewValue = viewValue || '';
                        }

                        if (store.getState().visProject[_view].settings.navigation &&
                            viewValue !== selectedViewValue &&
                            !viewsToChange.includes(store.getState().visProject[_view].name || _view)
                        ) {
                            viewsToChange.push(store.getState().visProject[_view].name || _view);
                        }
                    });
                }
            }
        } else {
            let selectedViewValue =  store.getState().visProject[props.selectedView].settings[showAllViewDialog.field];

            if (showAllViewDialog.field.type === 'boolean') {
                selectedViewValue = !!selectedViewValue;
            } else {
                selectedViewValue = selectedViewValue || '';
            }
            viewList.forEach(_view => {
                let viewValue = store.getState().visProject[_view].settings[showAllViewDialog.field];
                if (showAllViewDialog.field.type === 'boolean') {
                    viewValue = !!viewValue;
                } else {
                    viewValue = viewValue || '';
                }
                if (store.getState().visProject[_view].settings.navigation && viewValue !== selectedViewValue) {
                    viewsToChange.push(store.getState().visProject[_view].name || _view);
                }
            });
        }

        allViewDialog = <ConfirmDialog
            title={I18n.t(showAllViewDialog.groupApply ? 'Apply ALL navigation properties to all views' : 'Apply to all views')}
            text={I18n.t('Following views will be changed: %s', viewsToChange.join(', '))}
            onClose={result => {
                if (result) {
                    const project = JSON.parse(JSON.stringify(store.getState().visProject));
                    if (showAllViewDialog.groupApply) {
                        // find all fields with applyToAll flag, and if any is not equal show button
                        for (let f = 0; f < showAllViewDialog.group.fields.length; f++) {
                            const field = showAllViewDialog.group.fields[f];
                            if (field.applyToAll && !field.groupApply) {
                                viewList.forEach(_view => {
                                    if (project[_view].settings.navigation) {
                                        project[_view].settings[field.field] = project[props.selectedView].settings[field.field];
                                    }
                                });
                            }
                        }
                    } else {
                        viewList.forEach(_view => {
                            if (project[_view].settings.navigation) {
                                project[_view].settings[showAllViewDialog.field] = project[props.selectedView].settings[showAllViewDialog.field];
                            }
                        });
                    }

                    props.changeProject(project);
                }
                setShowAllViewDialog(null);
            }}
        />;
    }

    return <div style={{ height: '100%', overflowY: 'auto' }}>
        {fields.map((group, key) => {
            if (group.hidden && checkFunction(group.hidden, store.getState().visProject[props.selectedView].settings)) {
                return null;
            }
            return <Accordion
                classes={{
                    root: props.classes.clearPadding,
                    expanded: props.classes.clearPadding,
                }}
                square
                key={key}
                elevation={0}
                expanded={accordionOpen[key]}
                onChange={(e, expanded) => {
                    const newAccordionOpen = JSON.parse(JSON.stringify(accordionOpen));
                    newAccordionOpen[key] = expanded;
                    window.localStorage.setItem('attributesView', JSON.stringify(newAccordionOpen));
                    setAccordionOpen(newAccordionOpen);
                }}
            >
                <AccordionSummary
                    classes={{
                        root: Utils.clsx(props.classes.clearPadding, accordionOpen[key]
                            ? props.classes.groupSummaryExpanded : props.classes.groupSummary, props.classes.lightedPanel),
                        content: props.classes.clearPadding,
                        expanded: props.classes.clearPadding,
                        expandIcon: props.classes.clearPadding,
                    }}
                    expandIcon={<ExpandMoreIcon />}
                >
                    {I18n.t(group.name)}
                </AccordionSummary>
                {accordionOpen[key] ? <AccordionDetails style={{ flexDirection: 'column', padding: 0, margin: 0 }}>
                    <table style={{ width: '100%' }}>
                        <tbody>
                            {group.fields.map((field, key2) => {
                                let error;
                                let disabled = false;
                                if (field.hidden) {
                                    if (field.hidden === true) {
                                        return null;
                                    }
                                    if (field.hidden !== false && checkFunction(field.hidden, store.getState().visProject[props.selectedView].settings)) {
                                        return null;
                                    }
                                }
                                if (field.error) {
                                    error = checkFunction(field.error, store.getState().visProject[props.selectedView].settings);
                                }
                                if (field.disabled) {
                                    if (field.disabled === true) {
                                        disabled = true;
                                    } else if (field.disabled === false) {
                                        disabled = false;
                                    } else {
                                        disabled = !!checkFunction(field.disabled, store.getState().visProject[props.selectedView].settings);
                                    }
                                }
                                let value = field.notStyle ? view.settings[field.field] : view.settings.style[field.field];
                                if (value === null || value === undefined) {
                                    value = '';
                                }

                                const change = changeValue => {
                                    const project = JSON.parse(JSON.stringify(store.getState().visProject));
                                    if (field.notStyle) {
                                        project[props.selectedView].settings[field.field] = changeValue;
                                    } else {
                                        project[props.selectedView].settings.style[field.field] = changeValue;
                                    }
                                    props.changeProject(project);
                                };

                                const urlPopper = field.type === 'image' && !disabled ? <Popper
                                    open={textDialogFocused && textDialogEnabled && !!value && value.toString().startsWith(window.location.origin)}
                                    anchorEl={textRef.current}
                                    placement="bottom"
                                    transition
                                >
                                    {({ TransitionProps }) => <Fade {...TransitionProps} timeout={350}>
                                        <Paper>
                                            <Button
                                                style={{ textTransform: 'none' }}
                                                onClick={() => change(`.${value.toString().slice(window.location.origin.length)}`)}
                                            >
                                                {I18n.t('Replace to ')}
                                                {`.${value.toString().slice(window.location.origin.length)}`}
                                            </Button>
                                            <IconButton size="small" onClick={() => setTextDialogEnabled(false)}>
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        </Paper>
                                    </Fade>}
                                </Popper> : null;

                                let result;

                                if (field.type === 'autocomplete' || field.type === 'filter') {
                                    let options;
                                    if (field.type === 'filter') {
                                        options = window.vis ? window.vis.updateFilter() : [];
                                        options.unshift('');
                                    } else {
                                        options = field.options;
                                    }

                                    result = <Autocomplete
                                        freeSolo
                                        options={options}
                                        disabled={!props.editMode || disabled}
                                        inputValue={value}
                                        value={value}
                                        onInputChange={(e, inputValue) => change(inputValue)}
                                        onChange={(e, inputValue) => change(inputValue)}
                                        classes={{
                                            input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                                        }}
                                        renderInput={params => (
                                            <TextField
                                                variant="standard"
                                                {...params}
                                            />
                                        )}
                                    />;
                                } else if (field.type === 'checkbox') {
                                    result = <Checkbox
                                        disabled={!props.editMode || disabled}
                                        checked={!!value}
                                        classes={{
                                            root: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding),
                                        }}
                                        size="small"
                                        onChange={e => change(e.target.checked)}
                                    />;
                                } else if (field.type === 'select') {
                                    result = <Select
                                        disabled={!props.editMode || disabled}
                                        variant="standard"
                                        value={field.value ? field.value : value}
                                        classes={{
                                            root: props.classes.clearPadding,
                                            select: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding),
                                        }}
                                        onChange={field.onChange ? field.onChange : e => change(e.target.value)}
                                        renderValue={field.renderValue}
                                        fullWidth
                                    >
                                        {field.options.map(selectItem => <MenuItem
                                            value={selectItem.value}
                                            key={selectItem.value}
                                        >
                                            {field.itemModify ? field.itemModify(selectItem) : (field.noTranslation ? selectItem.label : I18n.t(selectItem.label))}
                                        </MenuItem>)}
                                    </Select>;
                                } else if (field.type === 'multi-select') {
                                    result = <Select
                                        disabled={!props.editMode || disabled}
                                        variant="standard"
                                        renderValue={selected => selected.join(', ')}
                                        classes={{
                                            root: props.classes.clearPadding,
                                            select: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding),
                                        }}
                                        value={value || []}
                                        onChange={e => change(e.target.value)}
                                        multiple
                                        fullWidth
                                    >
                                        {field.options.map(selectItem => <MenuItem
                                            value={selectItem.value}
                                            key={selectItem.value}
                                        >
                                            <Checkbox checked={value.includes(selectItem.value)} />
                                            <ListItemText primary={field.noTranslation ? selectItem.label : I18n.t(selectItem.label)} />
                                        </MenuItem>)}
                                    </Select>;
                                } else if (field.type === 'groups') {
                                    result = <Select
                                        variant="standard"
                                        disabled={!props.editMode || disabled}
                                        value={value || []}
                                        fullWidth
                                        multiple
                                        classes={{
                                            root: props.classes.clearPadding,
                                            select: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding),
                                        }}
                                        renderValue={selected => <div style={{ display: 'flex' }}>
                                            {Object.values(props.userGroups)
                                                .filter(_group => selected.includes(_group._id.split('.')[2]))
                                                .map(_group =>
                                                    <span key={_group._id} style={{ padding: '4px 4px' }}>
                                                        <TextWithIcon
                                                            value={_group._id}
                                                            t={I18n.t}
                                                            lang={I18n.getLanguage()}
                                                            list={[_group]}
                                                        />
                                                    </span>)}
                                        </div>}
                                        onChange={e => change(e.target.value)}
                                    >
                                        {Object.values(props.userGroups).map((_group, i) => <MenuItem
                                            value={_group._id.split('.')[2]}
                                            key={`${_group._id.split('.')[2]}_${i}`}
                                        >
                                            <Checkbox
                                                disabled={disabled}
                                                checked={(value || []).includes(_group._id.split('.')[2])}
                                            />
                                            <TextWithIcon
                                                value={_group._id}
                                                t={I18n.t}
                                                lang={I18n.getLanguage()}
                                                list={[_group]}
                                            />
                                        </MenuItem>)}
                                    </Select>;
                                } else if (field.type === 'raw') {
                                    result = field.Component;
                                } else if (field.type === 'color') {
                                    result = <ColorPicker
                                        value={value}
                                        className={props.classes.fieldContentColor}
                                        disabled={!props.editMode || disabled}
                                        onChange={color => change(color)}
                                        openAbove
                                        color={field.value || ''}
                                    />;
                                } else if (field.type === 'icon') {
                                    result = <IconPicker
                                        t={I18n.t}
                                        lang={I18n.getLanguage()}
                                        value={value}
                                        onChange={fileBlob => change(fileBlob)}
                                        previewClassName={props.classes.iconPreview}
                                        disabled={!props.editMode || disabled}
                                        // icon={ImageIcon}
                                        // classes={props.classes}
                                    />;
                                } else if (field.type === 'image') {
                                    let _value;
                                    if (showDialog) {
                                        _value = value;
                                        if (_value.startsWith('../')) {
                                            _value = _value.substring(3);
                                        } else if (_value.startsWith('_PRJ_NAME')) {
                                            _value = _value.replace('_PRJ_NAME', `../${props.adapterName}.${props.instance}/${props.projectName}/`);
                                        }
                                    }
                                    result = <>
                                        <TextField
                                            variant="standard"
                                            fullWidth
                                            error={!!error}
                                            helperText={typeof error === 'string' ? I18n.t(error) : null}
                                            disabled={!props.editMode || disabled}
                                            InputProps={{
                                                classes: { input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent) },
                                                endAdornment: [
                                                    value ?
                                                        <IconButton key="clear" onClick={() => change('')} size="small"><ClearIcon /></IconButton> : null,
                                                    <Button
                                                        key="select"
                                                        disabled={!props.editMode || disabled}
                                                        size="small"
                                                        onClick={() => setShowDialog(true)}
                                                    >
                                                        ...
                                                    </Button>,
                                                ],
                                            }}
                                            ref={textRef}
                                            value={value}
                                            onFocus={() => setTextDialogFocused(true)}
                                            onBlur={() => setTextDialogFocused(false)}
                                            onChange={e => change(e.target.value)}
                                        />
                                        {urlPopper}
                                        {showDialog ? <SelectFileDialog
                                            title={I18n.t('Select file')}
                                            onClose={() => setShowDialog(false)}
                                            restrictToFolder={`${props.adapterName}.${props.instance}/${props.projectName}`}
                                            allowNonRestricted
                                            allowUpload
                                            allowDownload
                                            allowCreateFolder
                                            allowDelete
                                            allowView
                                            showToolbar
                                            imagePrefix="../"
                                            selected={_value}
                                            filterByType="images"
                                            onSelect={(selected, isDoubleClick) => {
                                                const projectPrefix = `${props.adapterName}.${props.instance}/${props.projectName}/`;
                                                if (selected.startsWith(projectPrefix)) {
                                                    selected = `_PRJ_NAME/${selected.substring(projectPrefix.length)}`;
                                                } else if (selected.startsWith('/')) {
                                                    selected = `..${selected}`;
                                                } else if (!selected.startsWith('.')) {
                                                    selected = `../${selected}`;
                                                }
                                                change(selected);
                                                isDoubleClick && setShowDialog(false);
                                            }}
                                            onOk={selected => {
                                                const projectPrefix = `${props.adapterName}.${props.instance}/${props.projectName}/`;
                                                if (selected.startsWith(projectPrefix)) {
                                                    selected = `_PRJ_NAME/${selected.substring(projectPrefix.length)}`;
                                                } else if (selected.startsWith('/')) {
                                                    selected = `..${selected}`;
                                                } else if (!selected.startsWith('.')) {
                                                    selected = `../${selected}`;
                                                }
                                                change(selected);
                                                setShowDialog(false);
                                            }}
                                            socket={props.socket}
                                        /> : null}
                                    </>;
                                } else if (field.type === 'slider') {
                                    result = <div style={{ display: 'flex' }}>
                                        <Slider
                                            disabled={!props.editMode || disabled}
                                            className={props.classes.fieldContentSlider}
                                            size="small"
                                            onChange={(e, newValue) => change(newValue)}
                                            value={typeof value === 'number' ? value : 0}
                                            min={field.min}
                                            max={field.max}
                                            step={field.step}
                                            marks={field.marks}
                                            valueLabelDisplay={field.valueLabelDisplay}
                                        />
                                        <Input
                                            className={props.classes.fieldContentSliderInput}
                                            value={value}
                                            disabled={!props.editMode || disabled}
                                            size="small"
                                            onChange={e => change(parseFloat(e.target.value))}
                                            classes={{ input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent) }}
                                            inputProps={{
                                                step: field.step,
                                                min: field.min,
                                                max: field.max,
                                                type: 'number',
                                            }}
                                        />
                                        <IconButton disabled={!props.editMode || disabled} onClick={() => change(null)}><ClearIcon /></IconButton>
                                    </div>;
                                } else if (field.type === 'icon64') {
                                    result = <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            variant="standard"
                                            value={value}
                                            error={!!error}
                                            disabled={!props.editMode || disabled}
                                            onChange={e => change(e.target.value)}
                                            InputProps={{
                                                endAdornment: value ? <IconButton
                                                    disabled={!props.editMode || disabled}
                                                    size="small"
                                                    onClick={() => change('')}
                                                >
                                                    <ClearIcon />
                                                </IconButton> : null,
                                                classes: {
                                                    input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                                                },
                                            }}
                                        />
                                        <Button
                                            disabled={!props.editMode || disabled}
                                            variant={value ? 'outlined' : undefined}
                                            color={value ? 'grey' : undefined}
                                            onClick={() => setShowDialog64(true)}
                                        >
                                            {value ? <Icon src={value} style={{ width: 36, height: 36 }} /> : '...'}
                                        </Button>
                                        {showDialog64 &&
                                            <MaterialIconSelector
                                                themeType={props.themeType}
                                                value={value}
                                                onClose={icon => {
                                                    setShowDialog64(false);
                                                    if (icon !== null) {
                                                        change(icon);
                                                    }
                                                }}
                                            />}
                                    </div>;
                                } else {
                                    result = <TextField
                                        disabled={!props.editMode || disabled}
                                        variant="standard"
                                        fullWidth
                                        InputProps={{
                                            classes: {
                                                input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                                            },
                                        }}
                                        value={value}
                                        onChange={e => change(e.target.value)}
                                        type={field.type}
                                        error={!!error}
                                        helperText={typeof error === 'string' ? I18n.t(error) : null}
                                    />;
                                }

                                let helpText = null;
                                if (field.title) {
                                    helpText = <Tooltip title={I18n.t(field.title)}>
                                        <InfoIcon className={props.classes.fieldHelpText} />
                                    </Tooltip>;
                                }

                                if (field.applyToAll) {
                                    if (field.groupApply) {
                                        // find all fields with applyToAll flag, and if any is not equal show button
                                        const isShow = group.fields.find(_field =>
                                            _field.applyToAll &&
                                            !isPropertySameInAllViews(store.getState().visProject, _field.field, props.selectedView, viewList));

                                        if (isShow) {
                                            result = <div style={{ display: 'flex', width: '100%' }}>
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        lineHeight: '36px',
                                                        marginRight: 4,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    {result}
                                                </div>
                                                <Tooltip title={I18n.t('Apply ALL navigation properties to all views')}>
                                                    <span>
                                                        <Button
                                                            disabled={!props.editMode || disabled}
                                                            variant="contained"
                                                            onClick={() => setShowAllViewDialog({ ...field, group })}
                                                        >
                                                            {I18n.t('apply_to_all')}
                                                        </Button>
                                                    </span>
                                                </Tooltip>
                                            </div>;
                                        }
                                    } else if (!isPropertySameInAllViews(store.getState().visProject, field.field, props.selectedView, viewList)) {
                                        result = <div style={{ display: 'flex', width: '100%' }}>
                                            <div
                                                style={{
                                                    flex: 1,
                                                    lineHeight: '36px',
                                                    marginRight: 4,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {result}
                                            </div>
                                            <Tooltip title={I18n.t('Apply to all views')}>
                                                <span>
                                                    <Button
                                                        disabled={!props.editMode || disabled}
                                                        variant="outlined"
                                                        onClick={() => setShowAllViewDialog(field)}
                                                    >
                                                        {I18n.t('apply_to_all')}
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                        </div>;
                                    }
                                }

                                return <tr key={key2}>
                                    <td
                                        className={props.classes.fieldTitle}
                                        title={!field.title ? null : I18n.t(field.title)}
                                    >
                                        {I18n.t(field.name)}
                                        {helpText}
                                    </td>
                                    <td className={props.classes.fieldContent}>{result}</td>
                                </tr>;
                            })}
                        </tbody>
                    </table>
                </AccordionDetails> : null}
            </Accordion>;
        })}
        {allViewDialog}
    </div>;
};

View.propTypes = {
    changeProject: PropTypes.func,
    classes: PropTypes.object,
    userGroups: PropTypes.object,
    selectedView: PropTypes.string,
    themeType: PropTypes.string,

    setIsAllOpened: PropTypes.func,
    setIsAllClosed: PropTypes.func,
    isAllOpened: PropTypes.bool,
    isAllClosed: PropTypes.bool,
    triggerAllOpened: PropTypes.number,
    triggerAllClosed: PropTypes.number,

    adapterName: PropTypes.string,
    instance: PropTypes.number,
    projectName: PropTypes.string,
};

export default withStyles(styles)(View);
