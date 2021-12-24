import {
    Accordion, AccordionDetails, AccordionSummary, Checkbox, FormControl, FormControlLabel, InputLabel, ListItemText, MenuItem, Select, TextField,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import I18n from '@iobroker/adapter-react/i18n';

import ColorPicker from '@iobroker/adapter-react/Components/ColorPicker';

const theme = [
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

const fields = [
    {
        name: 'CSS Common',
        fields: [
            { name: 'Comment' },
            { name: 'CSS Class' },
            { name: 'Initial filter' },
            { name: 'Theme', type: 'select', items: theme },
            {
                name: 'Only for groups',
                type: 'multi-select',
                value: ['user'],
                items: [
                    { name: 'Administrator', value: 'administrator' },
                    { name: 'user', value: 'user' },
                ],
            },
            {
                name: 'If user not in group',
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
            { name: 'Use background', type: 'checkbox' },
            { name: '-color', type: 'color' },
            { name: '-image' },
            {
                name: '-repeat',
                type: 'autocomplete',
                items: [
                    'repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'initial', 'inherit',
                ],
            },
            {
                name: '-attachment',
                type: 'autocomplete',
                items: ['scroll', 'fixed', 'local', 'initial', 'inherit'],
            },
            {
                name: '-position',
                type: 'autocomplete',
                items: ['left top', 'left center', 'left bottom', 'right top', 'right center', 'right bottom', 'center top', 'center center', 'center bottom', 'initial', 'inherit'],
            },
            {
                name: '-size',
                type: 'autocomplete',
                items: ['auto', 'cover', 'contain', 'initial', 'inherit'],
            },
            {
                name: '-clip',
                type: 'autocomplete',
                items: ['border-box', 'padding-box', 'content-box', 'initial', 'inherit'],
            },
            {
                name: '-origin',
                type: 'autocomplete',
                items: ['border-box', 'padding-box', 'content-box', 'initial', 'inherit'],
            },

        ],
    },
    {
        name: 'CSS Font & Text',
        fields: [
            { name: 'color', type: 'color' },
            { name: 'text-shadow' },
            { name: 'font-family' },
            { name: 'font-style' },
            { name: 'font-variant' },
            { name: 'font-weight' },
            { name: 'font-size' },
            { name: 'line-height' },
            { name: 'letter-spacing' },
            { name: 'word-spacing' },
        ],
    },
];

const View = () => <div>
    {fields.map((group, key) => <Accordion key={key}>
        <AccordionSummary>{group.name}</AccordionSummary>
        <AccordionDetails style={{ flexDirection: 'column' }}>
            {
                group.fields.map((field, key2) => {
                    if (field.type === 'autocomplete') {
                        return <div key={key2}>
                            <Autocomplete
                                freeSolo
                                options={field.items}
                                renderInput={params => (
                                    <TextField {...params} label={I18n.t(field.name)} margin="normal" />
                                )}
                            />
                        </div>;
                    }
                    if (field.type === 'checkbox') {
                        return <div key={key2}>
                            <FormControlLabel
                                key={key}
                                control={<Checkbox />}
                                label={I18n.t(field.name)}
                            />
                        </div>;
                    }
                    if (field.type === 'select') {
                        return <FormControl key={key2}>
                            <InputLabel>{I18n.t(field.name)}</InputLabel>
                            <Select>
                                {field.items.map(selectItem => <MenuItem
                                    value={selectItem.value}
                                    key={selectItem.value}
                                >
                                    {I18n.t(selectItem.name)}
                                </MenuItem>)}
                            </Select>
                        </FormControl>;
                    }
                    if (field.type === 'multi-select') {
                        return <FormControl key={key2}>
                            <InputLabel>{I18n.t(field.name)}</InputLabel>
                            <Select value={field.value} onChange={field.onChange} renderValue={selected => selected.join(', ')} multiple>
                                {field.items.map(selectItem => <MenuItem
                                    value={selectItem.value}
                                    key={selectItem.value}
                                >
                                    <Checkbox checked={field.value.includes(selectItem.value)} />
                                    <ListItemText primary={I18n.t(selectItem.name)} />
                                </MenuItem>)}
                            </Select>
                        </FormControl>;
                    }
                    if (field.type === 'color') {
                        return <div key={key2}>
                            <ColorPicker
                                name={I18n.t(field.name)}
                                openAbove
                                color={field.value || ''}
                            />
                        </div>;
                    }
                    return <div key={key2}>
                        <TextField label={I18n.t(field.name)} />
                    </div>;
                })
            }
        </AccordionDetails>
    </Accordion>)}
</div>;

export default View;
