import I18n from '@iobroker/adapter-react/i18n';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    FormControl, InputLabel, MenuItem, Select, TextField, Typography, withStyles,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Widget from './Widget';
import { useState } from 'react';

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

    return <>
        <Typography variant="h6" gutterBottom>
            {I18n.t('Add widget')}
        </Typography>
        <div>
            <Autocomplete
                freeSolo
                options={[]}
                renderInput={params => (
                    <TextField {...params} label={I18n.t('filter')} />
                )}
            />
        </div>
        <div>
            <FormControl fullWidth>
                <InputLabel>{I18n.t('type')}</InputLabel>
                <Select>
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
                    expanded={accordionOpen[categoryKey]}
                    onChange={(e, expanded) => {
                        const newAccordionOpen = JSON.parse(JSON.stringify(accordionOpen));
                        newAccordionOpen[categoryKey] = expanded;
                        window.localStorage.setItem('widgets', JSON.stringify(newAccordionOpen));
                        setAccordionOpen(newAccordionOpen);
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>{category.name}</AccordionSummary>
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

export default withStyles(styles)(Widgets);
