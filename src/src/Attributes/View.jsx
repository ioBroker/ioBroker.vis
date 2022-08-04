import PropTypes from 'prop-types';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Checkbox,
    IconButton,
    ListItemText,
    MenuItem,
    Select,
    TextField,
    Tooltip,
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import Autocomplete from '@mui/material/Autocomplete';

import I18n from '@iobroker/adapter-react-v5/i18n';

import { ColorPicker, Utils } from '@iobroker/adapter-react-v5';

import './backgrounds.css';
import { useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';

import { theme, background } from './ViewData';

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
    lightedPanel: _theme.classes.lightedPanel,
});

const resolution = [
    { value: 'none', name: 'not defined' },
    { value: 'user', name: 'User defined' },
    { value: '375x667', name: 'iPhone SE - Portrait' },
    { value: '667x375', name: 'iPhone SE - Landscape' },
    { value: '414x896', name: 'iPhone XR - Portrait' },
    { value: '896x414', name: 'iPhone XR - Landscape' },
    { value: '390x844', name: 'iPhone 12 Pro - Portrait' },
    { value: '844x390', name: 'iPhone 12 Pro - Landscape' },
    { value: '393x851', name: 'Pixel 5 - Portrait' },
    { value: '851x393', name: 'Pixel 5 - Landscape' },
    { value: '360x740', name: 'Samsung Galaxy S8+ - Portrait' },
    { value: '740x360', name: 'Samsung Galaxy S8+ - Landscape' },
    { value: '412x915', name: 'Samsung Galaxy S20 Ultra - Portrait' },
    { value: '915x412', name: 'Samsung Galaxy S20 Ultra - Landscape' },
    { value: '820x1180', name: 'iPad Air - Portrait' },
    { value: '1180x820', name: 'iPad Air - Landscape' },
    { value: '768x1024', name: 'iPad Mini - Portrait' },
    { value: '1024x768', name: 'iPad Mini - Landscape' },
    { value: '912x1368', name: 'Surface Pro 7 - Portrait' },
    { value: '1368x912', name: 'Surface Pro 7 - Landscape' },
    { value: '540x720', name: 'Surface Duo - Portrait' },
    { value: '720x540', name: 'Surface Duo - Landscape' },
    { value: '280x653', name: 'Galaxy Fold - Portrait' },
    { value: '653x280', name: 'Galaxy Fold - Landscape' },
    { value: '412x914', name: 'Samsung Galaxy A51/71 - Portrait' },
    { value: '914x412', name: 'Samsung Galaxy A51/71 - Landscape' },
    { value: '600x1024', name: 'Nest Hub - Portrait' },
    { value: '1024x600', name: 'Nest Hub - Landscape' },
    { value: '800x1280', name: 'Nest Hub Max - Portrait' },
    { value: '1280x800', name: 'Nest Hub Max - Landscape' },
    { value: '720x1280', name: 'HD - Portrait' },
    { value: '1280x720', name: 'HD - Landscape' },
    { value: '1080x1920', name: 'Full HD - Portrait' },
    { value: '1920x1080', name: 'Full HD - Landscape' },
];

const View = props => {
    if (!props.project[props.selectedView]) {
        return null;
    }

    const [userResolution, setUserResolution] = useState(false);

    const view = props.project[props.selectedView];

    let resolutionSelect = `${view.settings.sizex}x${view.settings.sizey}`;
    if (userResolution) {
        resolutionSelect = 'user';
    } else if (!(view.settings.sizex && view.settings.sizey)) {
        resolutionSelect = 'none';
    } else if (!resolution.find(item => item.value === `${view.settings.sizex}x${view.settings.sizey}`)) {
        resolutionSelect = 'user';
        setUserResolution(true);
    }

    const fields = [
        {
            name: 'CSS Common',
            fields: [
                {
                    name: 'display',
                    field: 'display',
                    type: 'select',
                    items: [
                        { name: 'flex', value: 'flex' },
                        { name: 'block', value: 'block' },
                    ],
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
                    type: 'multi-select',
                    items: props.groups.map(group => ({
                        name: typeof group.common.name === 'string' ? group.common.name : group.common.name[I18n.getLanguage()],
                        /* eslint no-underscore-dangle: 0 */
                        value: group._id.split('.')[2],
                    })),
                },
                {
                    name: 'Theme',
                    field: 'theme',
                    notStyle: true,
                    type: 'select',
                    items: theme,
                },
                {
                    name: 'If user not in group',
                    field: 'group_action',
                    notStyle: true,
                    type: 'select',
                    items: [
                        { name: 'Disabled', value: 'disabled' },
                        { name: 'hide', value: 'hide' },
                    ],
                },
            ],
        },
        {
            name: 'CSS background (background-...)',
            fields: [
                {
                    name: 'Background class',
                    type: 'select',
                    items: background,
                    field: 'background_class',
                    itemModify: item => <>
                        <span className={`${props.classes.backgroundClassSquare} ${item.value}`} />
                        {I18n.t(item.name)}
                    </>,
                    renderValue: value => <div className={props.classes.backgroundClass}>
                        <span className={`${props.classes.backgroundClassSquare} ${value}`} />
                        {I18n.t(background.find(item => item.value === value).name)}
                    </div>,
                },
                {
                    name: 'Use background', type: 'checkbox', field: 'useBackground', notStyle: true,
                },
                { name: 'background', field: 'background', hide: !view.settings.useBackground },
                {
                    name: '-color', type: 'color', field: 'background-color', hide: view.settings.useBackground,
                },
                { name: '-image', field: 'background-image', hide: view.settings.useBackground },
                {
                    name: '-repeat',
                    type: 'autocomplete',
                    field: 'background-repeat',
                    hide: view.settings.useBackground,
                    items: [
                        'repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'initial', 'inherit',
                    ],
                },
                {
                    name: '-attachment',
                    field: 'background-attachment',
                    type: 'autocomplete',
                    hide: view.settings.useBackground,
                    items: ['scroll', 'fixed', 'local', 'initial', 'inherit'],
                },
                {
                    name: '-position',
                    field: 'background-position',
                    type: 'autocomplete',
                    hide: view.settings.useBackground,
                    items: ['left top', 'left center', 'left bottom', 'right top', 'right center', 'right bottom', 'center top', 'center center', 'center bottom', 'initial', 'inherit'],
                },
                {
                    name: '-size',
                    field: 'background-size',
                    type: 'autocomplete',
                    hide: view.settings.useBackground,
                    items: ['auto', 'cover', 'contain', 'initial', 'inherit'],
                },
                {
                    name: '-clip',
                    field: 'background-clip',
                    type: 'autocomplete',
                    hide: view.settings.useBackground,
                    items: ['border-box', 'padding-box', 'content-box', 'initial', 'inherit'],
                },
                {
                    name: '-origin',
                    field: 'background-origin',
                    type: 'autocomplete',
                    hide: view.settings.useBackground,
                    items: ['border-box', 'padding-box', 'content-box', 'initial', 'inherit'],
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
                    items: [
                        { name: 'Disabled', value: 0 },
                        { name: 'Elements', value: 1 },
                        { name: 'Grid', value: 2 },
                    ],
                    notStyle: true,
                },
                {
                    type: 'color',
                    name: 'Grid color',
                    field: 'snapColor',
                    hide: view.settings.snapType !== 2,
                    notStyle: true,
                },
                {
                    type: 'number',
                    name: 'Grid size',
                    field: 'gridSize',
                    notStyle: true,
                    hide: view.settings.snapType !== 2,
                },
                {
                    type: 'select',
                    name: 'Resolution',
                    items: resolution,
                    width: 236,
                    value: resolutionSelect,
                    onChange: e => {
                        const project = JSON.parse(JSON.stringify(props.project));
                        const match = e.target.value.match(/^([0-9]+)x([0-9]+)$/);
                        if (e.target.value === 'none') {
                            project[props.selectedView].settings.sizex = 0;
                            project[props.selectedView].settings.sizey = 0;
                            setUserResolution(false);
                        } else if (e.target.value === 'user') {
                            setUserResolution(true);
                        } else {
                            [, project[props.selectedView].settings.sizex, project[props.selectedView].settings.sizey] = match;
                            setUserResolution(false);
                        }
                        props.changeProject(project);
                    },
                },
                {
                    type: 'raw',
                    name: 'Width x height (px)',
                    hide: !userResolution,
                    Component:
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                            variant="standard"
                            value={view.settings.sizex}
                            disabled={!props.editMode}
                            InputProps={{
                                classes: {
                                    input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                                },
                            }}
                            onChange={e => {
                                const project = JSON.parse(JSON.stringify(props.project));
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
                            value={view.settings.sizey}
                            disabled={!props.editMode}
                            InputProps={{
                                classes: {
                                    input: Utils.clsx(props.classes.clearPadding, props.classes.fieldContent),
                                },
                            }}
                            onChange={e => {
                                const project = JSON.parse(JSON.stringify(props.project));
                                project[props.selectedView].settings.sizey = e.target.value;
                                props.changeProject(project);
                            }}
                        />
                    </span>,
                },
            ],
        },
        {
            name: 'Navigation',
            fields: [
                {
                    type: 'checkbox', name: 'Show navigation', field: 'navigation', notStyle: true,
                },
                {
                    type: 'text', name: 'Title', field: 'navigationTitle', notStyle: true,
                },
                {
                    type: 'checkbox', name: 'Show app bar', field: 'navigationBar', notStyle: true, default: true,
                },
                {
                    type: 'color', name: 'Bar color', field: 'navigationColor', notStyle: true,
                },
            ],
        },
    ];

    const [accordionOpen, setAccordionOpen] = useState(
        window.localStorage.getItem('attributesView')
            ? JSON.parse(window.localStorage.getItem('attributesView'))
            : fields.map(() => false),
    );

    const allOpened = !fields.find((group, key) => !accordionOpen[key]);
    const allClosed = !fields.find((group, key) => accordionOpen[key]);

    return <div style={{ height: '100%', overflowY: 'hidden' }}>
        <div style={{ textAlign: 'right' }}>
            {!allOpened ? <Tooltip title={I18n.t('Expand all')}>
                <IconButton
                    size="small"
                    onClick={() => {
                        const newAccordionOpen = {};
                        fields.forEach((group, key) => newAccordionOpen[key] = true);
                        window.localStorage.setItem('attributesView', JSON.stringify(newAccordionOpen));
                        setAccordionOpen(newAccordionOpen);
                    }}
                >
                    <UnfoldMoreIcon />
                </IconButton>
            </Tooltip> : <IconButton size="small" disabled><UnfoldMoreIcon /></IconButton>}
            { !allClosed ? <Tooltip size="small" title={I18n.t('Collapse all')}>
                <IconButton onClick={() => {
                    const newAccordionOpen = {};
                    fields.forEach((group, key) => newAccordionOpen[key] = false);
                    window.localStorage.setItem('attributesView', JSON.stringify(newAccordionOpen));
                    setAccordionOpen(newAccordionOpen);
                }}
                >
                    <UnfoldLessIcon />
                </IconButton>
            </Tooltip> : <IconButton size="small" disabled><UnfoldLessIcon /></IconButton> }
        </div>
        <div style={{ height: 'calc(100% - 34px)', overflowY: 'auto' }}>
            {fields.map((group, key) => <Accordion
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
                    {group.name}
                </AccordionSummary>
                <AccordionDetails style={{ flexDirection: 'column', padding: 0, margin: 0 }}>
                    <table style={{ width: '100%' }}>
                        <tbody>
                            {
                                group.fields.map((field, key2) => {
                                    if (field.hide) {
                                        return null;
                                    }

                                    let value = field.notStyle ? view.settings[field.field] : view.settings.style[field.field];
                                    if (value === null || value === undefined) {
                                        value = '';
                                    }

                                    const change = changeValue => {
                                        const project = JSON.parse(JSON.stringify(props.project));
                                        if (field.notStyle) {
                                            project[props.selectedView].settings[field.field] = changeValue;
                                        } else {
                                            project[props.selectedView].settings.style[field.field] = changeValue;
                                        }
                                        props.changeProject(project);
                                    };

                                    let result = null;

                                    if (field.type === 'autocomplete' || field.type === 'filter') {
                                        let options;
                                        if (field.type === 'filter') {
                                            options = window.vis ? window.vis.updateFilter() : [];
                                            options.unshift('');
                                        } else {
                                            options = field.items;
                                        }

                                        result = <Autocomplete
                                            freeSolo
                                            options={options}
                                            disabled={!props.editMode}
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
                                            disabled={!props.editMode}
                                            checked={!!value}
                                            classes={{
                                                root: Utils.clsx(props.classes.fieldContent, props.classes.clearPadding),
                                            }}
                                            size="small"
                                            onChange={e => change(e.target.checked)}
                                        />;
                                    } else if (field.type === 'select') {
                                        result = <Select
                                            disabled={!props.editMode}
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
                                            {field.items.map(selectItem => <MenuItem
                                                value={selectItem.value}
                                                key={selectItem.value}
                                            >
                                                {field.itemModify ? field.itemModify(selectItem) : I18n.t(selectItem.name)}
                                            </MenuItem>)}
                                        </Select>;
                                    } else if (field.type === 'multi-select') {
                                        result = <Select
                                            disabled={!props.editMode}
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
                                            {field.items.map(selectItem => <MenuItem
                                                value={selectItem.value}
                                                key={selectItem.value}
                                            >
                                                <Checkbox checked={value.includes(selectItem.value)} />
                                                <ListItemText primary={I18n.t(selectItem.name)} />
                                            </MenuItem>)}
                                        </Select>;
                                    } else if (field.type === 'raw') {
                                        result = field.Component;
                                    } else if (field.type === 'color') {
                                        result = <ColorPicker
                                            value={value}
                                            className={props.classes.fieldContentColor}
                                            disabled={!props.editMode}
                                            onChange={color => change(color)}
                                            openAbove
                                            color={field.value || ''}
                                        />;
                                    } else {
                                        result = <TextField
                                            disabled={!props.editMode}
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
                                        />;
                                    }

                                    return <tr key={key2}>
                                        <td className={props.classes.fieldTitle} title={!field.title ? null : I18n.t(field.title)}>{I18n.t(field.name)}</td>
                                        <td className={props.classes.fieldContent}>{result}</td>
                                    </tr>;
                                })
                            }
                        </tbody>
                    </table>
                </AccordionDetails>
            </Accordion>)}
        </div>
    </div>;
};

View.propTypes = {
    changeProject: PropTypes.func,
    classes: PropTypes.object,
    groups: PropTypes.array,
    project: PropTypes.object,
    selectedView: PropTypes.string,
};

export default withStyles(styles)(View);
