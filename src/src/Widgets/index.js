import PropTypes from 'prop-types';
import I18n from '@iobroker/adapter-react/i18n';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Typography, withStyles,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ClearIcon from '@material-ui/icons/Clear';

import { useState } from 'react';
import clsx from 'clsx';
import Widget from './Widget';

const selectItems = [
    { value: 'all', name: '*' },
    { value: 'basic', name: 'basic' },
    { value: 'echarts', name: 'echarts' },
    { value: 'eventlist', name: 'eventlist' },
    { value: 'info', name: 'info' },
    { value: 'jqplot', name: 'jqplot' },
    { value: 'jqui', name: 'jqui' },
    { value: 'swipe', name: 'swipe' },
    { value: 'tabs', name: 'tabs' },
];

const styles = () => ({
    widgets: { textAlign: 'center' },
    toggle: { width: 30, height: 30 },
    right: {
        float: 'right',
    },
    button: {
        padding: '0px 4px',
    },
    label: {
        top: '-10px',
    },
    labelShrink: {
        display: 'none',
    },
    clearPadding: {
        '&&&&': {
            padding: 0,
            margin: 0,
            minHeight: 'initial',
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

const widgetsList = [
    { name: 'Category 1', items: Array(4).fill(null) },
    { name: 'Category 2', items: Array(4).fill(null) },
];

const Widgets = props => {
    const [accordionOpen, setAccordionOpen] = useState(
        window.localStorage.getItem('widgets')
            ? JSON.parse(window.localStorage.getItem('widgets'))
            : widgetsList.map(() => false),
    );

    const [filter, setFilter] = useState('');
    const [type, setType] = useState('');

    return <>
        <Typography variant="h6" gutterBottom className={clsx(props.classes.blockHeader, props.classes.lightedPanel)}>
            {I18n.t('Add widget')}
        </Typography>
        <div>
            <TextField
                value={filter}
                onChange={e => setFilter(e.target.value)}
                label={filter.length ? ' ' : I18n.t('filter')}
                InputProps={{
                    className: props.classes.clearPadding,
                    endAdornment: filter.length ? <IconButton size="small" onClick={() => setFilter('')}>
                        <ClearIcon />
                    </IconButton> : null,
                }}
                InputLabelProps={{
                    shrink: false,
                    classes: {
                        root: props.classes.label,
                        shrink: props.classes.labelShrink,
                    },
                }}
            />
        </div>
        <div>
            <FormControl fullWidth>
                <InputLabel
                    shrink={false}
                    classes={{
                        root: props.classes.label,
                        shrink: props.classes.labelShrink,
                    }}
                >
                    {type.length ? ' ' : I18n.t('type')}
                </InputLabel>
                <Select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    classes={{
                        root: props.classes.clearPadding,
                        select: props.classes.fieldContent,
                    }}
                    endAdornment={
                        type.length ? <IconButton size="small" onClick={() => setType('')}>
                            <ClearIcon />
                        </IconButton> : null
                    }
                >
                    {selectItems.map(selectItem => <MenuItem
                        value={selectItem.value}
                        key={selectItem.value}
                    >
                        {I18n.t(selectItem.name)}
                    </MenuItem>)}
                </Select>
            </FormControl>
        </div>
        <div className={props.classes.widgets}>
            {
                widgetsList.map((category, categoryKey) => <Accordion
                    key={categoryKey}
                    elevation={0}
                    expanded={accordionOpen[categoryKey]}
                    onChange={(e, expanded) => {
                        const newAccordionOpen = JSON.parse(JSON.stringify(accordionOpen));
                        newAccordionOpen[categoryKey] = expanded;
                        window.localStorage.setItem('widgets', JSON.stringify(newAccordionOpen));
                        setAccordionOpen(newAccordionOpen);
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        classes={{
                            root: clsx(props.classes.clearPadding, accordionOpen[categoryKey]
                                ? props.classes.groupSummaryExpanded : props.classes.groupSummary, props.classes.lightedPanel),
                            content: props.classes.clearPadding,
                            expandIcon: props.classes.clearPadding,
                        }}
                    >
                        {category.name}
                    </AccordionSummary>
                    <AccordionDetails>
                        <div>
                            {category.items.map((value, widgetKey) => <Widget key={widgetKey} />)}
                        </div>
                    </AccordionDetails>
                </Accordion>)
            }
        </div>
    </>;
};

Widgets.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(Widgets);
