import {
    Accordion, AccordionDetails, AccordionSummary, Checkbox, FormControl, FormControlLabel, InputLabel, ListItemText, MenuItem, Select, TextField, withStyles,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import I18n from '@iobroker/adapter-react/i18n';

import ColorPicker from '@iobroker/adapter-react/Components/ColorPicker';

import './backgrounds.css';
import { useState } from 'react';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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
});

const theme = [
    { value: 'black-tie', name: 'black-tie' },
    { value: 'blitzer', name: 'blitzer' },
    { value: 'cupertino', name: 'cupertino' },
    { value: 'custom-dark', name: 'custom-dark' },
    { value: 'custom-light', name: 'custom-light' },
    { value: 'dark-hive', name: 'dark-hive' },
    { value: 'dot-luv', name: 'dot-luv' },
    { value: 'eggplant', name: 'eggplant' },
    { value: 'excite-bike', name: 'excite-bike' },
    { value: 'flick', name: 'flick' },
    { value: 'hot-sneaks', name: 'hot-sneaks' },
    { value: 'humanity', name: 'humanity' },
    { value: 'overcast', name: 'overcast' },
    { value: 'redmond', name: 'redmond' },
    { value: 'smoothness', name: 'smoothness' },
    { value: 'start', name: 'start' },
    { value: 'sunny', name: 'sunny' },
    { value: 'ui-darkness', name: 'ui-darkness' },
    { value: 'ui-lightness', name: 'ui-lightness' },
    { value: 'vader', name: 'vader' },
];

const background = [
    { value: '', name: 'none' },
    { value: 'fm-dark-background', name: 'Fm dark background' },
    { value: 'fm-light-background', name: 'Fm light background' },
    { value: 'no_background', name: 'No background' },
    { value: 'hq-background-blue-marine-lines', name: 'Blue marine lines' },
    { value: 'hq-background-blue-marine', name: 'Blue marine' },
    { value: 'hq-background-radial-blue', name: 'Radial blue' },
    { value: 'hq-background-gradient-box', name: 'Gradient box' },
    { value: 'hq-background-h-gradient-black-0', name: 'H gradient black 0' },
    { value: 'hq-background-h-gradient-black-1', name: 'H gradient black 1' },
    { value: 'hq-background-h-gradient-black-2', name: 'H gradient black 2' },
    { value: 'hq-background-h-gradient-black-3', name: 'H gradient black 3' },
    { value: 'hq-background-h-gradient-black-4', name: 'H gradient black 4' },
    { value: 'hq-background-h-gradient-black-5', name: 'H gradient black 5' },
    { value: 'hq-background-h-gradient-orange-0', name: 'H gradient orange 0' },
    { value: 'hq-background-h-gradient-orange-1', name: 'H gradient orange 1' },
    { value: 'hq-background-h-gradient-orange-2', name: 'H gradient orange 2' },
    { value: 'hq-background-h-gradient-orange-3', name: 'H gradient orange 3' },
    { value: 'hq-background-h-gradient-blue-0', name: 'H gradient blue 0' },
    { value: 'hq-background-h-gradient-blue-1', name: 'H gradient blue 1' },
    { value: 'hq-background-h-gradient-blue-2', name: 'H gradient blue 2' },
    { value: 'hq-background-h-gradient-blue-3', name: 'H gradient blue 3' },
    { value: 'hq-background-h-gradient-blue-4', name: 'H gradient blue 4' },
    { value: 'hq-background-h-gradient-blue-5', name: 'H gradient blue 5' },
    { value: 'hq-background-h-gradient-blue-6', name: 'H gradient blue 6' },
    { value: 'hq-background-h-gradient-blue-7', name: 'H gradient blue 7' },
    { value: 'hq-background-h-gradient-yellow-0', name: 'H gradient yellow 0' },
    { value: 'hq-background-h-gradient-yellow-1', name: 'H gradient yellow 1' },
    { value: 'hq-background-h-gradient-yellow-2', name: 'H gradient yellow 2' },
    { value: 'hq-background-h-gradient-yellow-3', name: 'H gradient yellow 3' },
    { value: 'hq-background-h-gradient-green-0', name: 'H gradient green 0' },
    { value: 'hq-background-h-gradient-green-1', name: 'H gradient green 1' },
    { value: 'hq-background-h-gradient-green-2', name: 'H gradient green 2' },
    { value: 'hq-background-h-gradient-green-3', name: 'H gradient green 3' },
    { value: 'hq-background-h-gradient-green-4', name: 'H gradient green 4' },
    { value: 'hq-background-gray-0', name: 'Gray 0' },
    { value: 'hq-background-gray-1', name: 'Gray 1' },
    { value: 'hq-background-h-gradient-gray-0', name: 'H gradient gray 0' },
    { value: 'hq-background-h-gradient-gray-1', name: 'H gradient gray 1' },
    { value: 'hq-background-h-gradient-gray-2', name: 'H gradient gray 2' },
    { value: 'hq-background-h-gradient-gray-3', name: 'H gradient gray 3' },
    { value: 'hq-background-h-gradient-gray-4', name: 'H gradient gray 4' },
    { value: 'hq-background-h-gradient-gray-5', name: 'H gradient gray 5' },
    { value: 'hq-background-h-gradient-gray-6', name: 'H gradient gray 6' },
    { value: 'hq-background-aluminium1', name: 'Aluminium1' },
    { value: 'hq-background-aluminium2', name: 'Aluminium2' },
    { value: 'hq-background-colorful', name: 'Colorful' },
    { value: 'hq-background-carbon-fibre1', name: 'Carbon fibre1' },
    { value: 'hq-background-carbon-fibre', name: 'Carbon fibre' },
    { value: 'hq-background-bricks', name: 'Bricks' },
    { value: 'hq-background-lined-paper', name: 'Lined paper' },
    { value: 'hq-background-blueprint-grid', name: 'Blueprint grid' },
    { value: 'hq-background-blue-flowers', name: 'Blue flowers' },
    { value: 'group-view-css-background', name: 'Group view css background' },
];

const View = props => {
    const view = props.project[props.selectedView];

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
            key={key}
            elevation={4}
            expanded={accordionOpen[key]}
            onChange={(e, expanded) => {
                const newAccordionOpen = JSON.parse(JSON.stringify(accordionOpen));
                newAccordionOpen[key] = expanded;
                window.localStorage.setItem('attributesView', JSON.stringify(newAccordionOpen));
                setAccordionOpen(newAccordionOpen);
            }}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>{group.name}</AccordionSummary>
            <AccordionDetails style={{ flexDirection: 'column' }}>
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

                        if (field.type === 'autocomplete') {
                            return <div key={key2}>
                                <Autocomplete
                                    freeSolo
                                    options={field.items}
                                    inputValue={value}
                                    value={value}
                                    onInputChange={(e, inputValue) => change(inputValue)}
                                    onChange={(e, inputValue) => change(inputValue)}
                                    renderInput={params => (
                                        <TextField {...params} label={I18n.t(field.name)} />
                                    )}
                                />
                            </div>;
                        }
                        if (field.type === 'checkbox') {
                            return <div key={key2}>
                                <FormControlLabel
                                    key={key}
                                    control={<Checkbox checked={value} />}
                                    onChange={e => change(e.target.checked)}
                                    label={I18n.t(field.name)}
                                />
                            </div>;
                        }
                        if (field.type === 'select') {
                            return <FormControl key={key2}>
                                <InputLabel>{I18n.t(field.name)}</InputLabel>
                                <Select value={value} onChange={e => change(e.target.value)} renderValue={field.renderValue}>
                                    {field.items.map(selectItem => <MenuItem
                                        value={selectItem.value}
                                        key={selectItem.value}
                                    >
                                        {field.itemModify ? field.itemModify(selectItem) : I18n.t(selectItem.name)}
                                    </MenuItem>)}
                                </Select>
                            </FormControl>;
                        }
                        if (field.type === 'multi-select') {
                            return <FormControl key={key2}>
                                <InputLabel>{I18n.t(field.name)}</InputLabel>
                                <Select
                                    renderValue={selected => selected.join(', ')}
                                    value={value || []}
                                    onChange={e => change(e.target.value)}
                                    multiple
                                >
                                    {field.items.map(selectItem => <MenuItem
                                        value={selectItem.value}
                                        key={selectItem.value}
                                    >
                                        <Checkbox checked={value.includes(selectItem.value)} />
                                        <ListItemText primary={I18n.t(selectItem.name)} />
                                    </MenuItem>)}
                                </Select>
                            </FormControl>;
                        }
                        if (field.type === 'color') {
                            return <div key={key2}>
                                <ColorPicker
                                    name={I18n.t(field.name)}
                                    value={value}
                                    onChange={color => change(color)}
                                    openAbove
                                    color={field.value || ''}
                                />
                            </div>;
                        }
                        return <div key={key2}>
                            <TextField
                                fullWidth
                                value={value}
                                onChange={e => change(e.target.value)}
                                label={I18n.t(field.name)}
                                type={field.type}
                            />
                        </div>;
                    })
                }
            </AccordionDetails>
        </Accordion>)}
    </div>;
};

export default withStyles(styles)(View);
