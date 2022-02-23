import PropTypes from 'prop-types';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Checkbox,
    Input,
    ListItemText,
    MenuItem,
    Select,
    TextField,
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import Autocomplete from '@mui/material/Autocomplete';
import clsx from 'clsx';

import I18n from '@iobroker/adapter-react-v5/i18n';

import ColorPicker from '@iobroker/adapter-react-v5/Components/ColorPicker';

import './backgrounds.css';
import { useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import CloseIcon from '@mui/icons-material/Close';
import { theme, background } from './ViewData';

const styles = () => ({
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
});

const resolution = [
    { value: 'none', name: 'not defined' },
    { value: 'user', name: 'User defined' },
    { value: '320x460', name: 'iPhone 3G, 3GS, 4, 4S - Portrait' },
    { value: '480x300', name: 'iPhone 3G, 3GS, 4, 4S - Landscape' },
    { value: '320x548', name: 'iPhone 5, 5S - Portrait' },
    { value: '568x300', name: 'iPhone 5, 5S - Landscape' },
    { value: '768x1004', name: 'iPad - Portrait' },
    { value: '1024x748', name: 'iPad - Landscape' },
    { value: '320x533', name: 'Samsung S2 - Portrait' },
    { value: '533x320', name: 'Samsung S2 - Landscape' },
    { value: '360x640', name: 'Samsung S3, Note 2 - Portrait' },
    { value: '640x360" selected="selected', name: 'Samsung S3, Note 2 - Landscape' },
    { value: '360x640', name: 'Samsung S4, S5, Note 3 - Portrait' },
    { value: '640x360', name: 'Samsung S4, S5, Note 3 - Landscape' },
    { value: '384x640', name: 'Nexus 4 - Portrait' },
    { value: '640x384', name: 'Nexus 4 - Landscape' },
    { value: '360x640', name: 'Nexus 5 - Portrait' },
    { value: '640x360', name: 'Nexus 5 - Landscape' },
    { value: '604x966', name: 'Nexus 7 (2012) - Portrait' },
    { value: '966x604', name: 'Nexus 7 (2012) - Landscape' },
    { value: '800x1280', name: 'Nexus 10 - Portrait' },
    { value: '1280x800', name: 'Nexus 10 - Landscape' },
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
                { name: 'Comment', field: 'comment', notStyle: true },
                { name: 'CSS Class', field: 'class', notStyle: true },
                { name: 'Initial filter', field: 'filterkey', notStyle: true },
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
                        <span className={`${props.classes.backgroundClassSquare} ${item.value}`}></span>
                        {I18n.t(item.name)}
                    </>,
                    renderValue: value => <div className={props.classes.backgroundClass}>
                        <span className={`${props.classes.backgroundClassSquare} ${value}`}></span>
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
                    type: 'number', name: 'Grid size', field: 'gridSize', notStyle: true,
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
                        <TextField variant="standard"
                            value={view.settings.sizex}
                            InputProps={{
                                classes: {
                                    input: clsx(props.classes.clearPadding, props.classes.fieldContent),
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
                        <TextField variant="standard"
                            value={view.settings.sizey}
                            InputProps={{
                                classes: {
                                    input: clsx(props.classes.clearPadding, props.classes.fieldContent),
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
    ];

    const [accordionOpen, setAccordionOpen] = useState(
        window.localStorage.getItem('attributesView')
            ? JSON.parse(window.localStorage.getItem('attributesView'))
            : fields.map(() => false),
    );

    return <div>
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
                    root: clsx(props.classes.clearPadding, accordionOpen[key]
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
                <table>
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

                            if (field.type === 'autocomplete') {
                                result = <Autocomplete
                                    freeSolo
                                    options={field.items}
                                    inputValue={value}
                                    value={value}
                                    onInputChange={(e, inputValue) => change(inputValue)}
                                    onChange={(e, inputValue) => change(inputValue)}
                                    classes={{
                                        input: clsx(props.classes.clearPadding, props.classes.fieldContent),
                                    }}
                                    renderInput={params => (
                                        <TextField variant="standard"
                                            {...params}
                                        />
                                    )}
                                />;
                            } else if (field.type === 'checkbox') {
                                result = <Checkbox
                                    checked={value}
                                    classes={{
                                        root: clsx(props.classes.fieldContent, props.classes.clearPadding),
                                    }}
                                    size="small"
                                    onChange={e => change(e.target.checked)}
                                />;
                            } else if (field.type === 'select') {
                                result = <Select variant="standard"
                                    value={field.value ? field.value : value}
                                    classes={{
                                        root: props.classes.clearPadding,
                                        select: props.classes.fieldContent,
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
                                result = <Select variant="standard"
                                    renderValue={selected => selected.join(', ')}
                                    classes={{
                                        root: props.classes.clearPadding,
                                        select: props.classes.fieldContent,
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
                                    onChange={color => change(color)}
                                    openAbove
                                    color={field.value || ''}
                                    classes={{
                                        root: props.classes.clearPadding,
                                    }}
                                />;
                            } else {
                                result = <TextField variant="standard"
                                    fullWidth
                                    InputProps={{
                                        classes: {
                                            input: clsx(props.classes.clearPadding, props.classes.fieldContent),
                                        },
                                    }}
                                    value={value}
                                    onChange={e => change(e.target.value)}
                                    type={field.type}
                                />;
                            }

                            return <tr key={key2}>
                                <td className={props.classes.fieldTitle}>{I18n.t(field.name)}</td>
                                <td className={props.classes.fieldContent}>{result}</td>
                            </tr>;
                        })
                    }
                </table>
            </AccordionDetails>
        </Accordion>)}
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
