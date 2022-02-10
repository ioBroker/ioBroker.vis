import {
    Accordion, AccordionDetails, AccordionSummary, Checkbox, ListItemText, MenuItem, Select, TextField, withStyles,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import I18n from '@iobroker/adapter-react/i18n';

import ColorPicker from '@iobroker/adapter-react/Components/ColorPicker';

import './backgrounds.css';
import { useState } from 'react';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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
    },
});

const View = props => {
    if (!props.project[props.selectedView]) {
        return null;
    }

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
                    root: props.classes.clearPadding,
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
                                        input: props.classes.clearPadding,
                                    }}
                                    renderInput={params => (
                                        <TextField
                                            {...params}
                                        />
                                    )}
                                />;
                            } else if (field.type === 'checkbox') {
                                result = <Checkbox
                                    checked={value}
                                    classes={{
                                        root: props.classes.clearPadding,
                                    }}
                                    size="small"
                                    onChange={e => change(e.target.checked)}
                                />;
                            } else if (field.type === 'select') {
                                result = <Select
                                    value={value}
                                    classes={{
                                        root: props.classes.clearPadding,
                                    }}
                                    onChange={e => change(e.target.value)}
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
                                    renderValue={selected => selected.join(', ')}
                                    classes={{
                                        root: props.classes.clearPadding,
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
                            } else if (field.type === 'color') {
                                result = <ColorPicker
                                    value={value}
                                    onChange={color => change(color)}
                                    openAbove
                                    color={field.value || ''}
                                    classes={{
                                        root: props.classes.clearPadding,
                                    }}
                                />;
                            } else {
                                result = <TextField
                                    fullWidth
                                    InputProps={{
                                        classes: {
                                            input: props.classes.clearPadding,
                                        },
                                    }}
                                    value={value}
                                    onChange={e => change(e.target.value)}
                                    type={field.type}
                                />;
                            }

                            return <tr key={key2}>
                                <td className={props.classes.fieldTitle}>{I18n.t(field.name)}</td>
                                <td>{result}</td>
                            </tr>;
                        })
                    }
                </table>
            </AccordionDetails>
        </Accordion>)}
    </div>;
};

export default withStyles(styles)(View);
