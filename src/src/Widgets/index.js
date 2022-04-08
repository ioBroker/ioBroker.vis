import PropTypes from 'prop-types';
import I18n from '@iobroker/adapter-react-v5/i18n';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';

import { useState } from 'react';
import clsx from 'clsx';
import Widget from './Widget';
import { getWidgetTypes } from '../Utils';

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

const styles = theme => ({
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
    blockHeader: theme.classes.blockHeader,
    lightedPanel: theme.classes.lightedPanel,
    selectClearContainer: {
        display: 'flex',
    },
    selectClear: {
        flex: 1,
    },
});

const Widgets = props => {
    if (!props.widgetsLoaded) {
        return null;
    }
    const widgetsList = {};

    const widgetTypes = getWidgetTypes();
    widgetTypes.forEach(widgetType => {
        if (!widgetsList[widgetType.set]) {
            widgetsList[widgetType.set] = {};
        }
        widgetsList[widgetType.set][widgetType.name] = widgetType;
    });

    const [accordionOpen, setAccordionOpen] = useState(
        window.localStorage.getItem('widgets')
            ? JSON.parse(window.localStorage.getItem('widgets'))
            : Object.keys(widgetsList).map(() => false),
    );

    const [filter, setFilter] = useState('');
    const [type, setType] = useState('');

    return <>
        <Typography variant="h6" gutterBottom className={clsx(props.classes.blockHeader, props.classes.lightedPanel)}>
            {I18n.t('Add widget')}
        </Typography>
        <div>
            <TextField
                variant="standard"
                fullWidth
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
            <FormControl variant="standard" fullWidth>
                <InputLabel
                    shrink={false}
                    classes={{
                        root: props.classes.label,
                        shrink: props.classes.labelShrink,
                    }}
                >
                    {type.length ? ' ' : I18n.t('type')}
                </InputLabel>
                <div className={props.classes.selectClearContainer}>
                    <span className={props.classes.selectClear}>
                        <Select
                            fullWidth
                            variant="standard"
                            value={type}
                            onChange={e => setType(e.target.value)}
                            classes={{
                                root: props.classes.clearPadding,
                                select: props.classes.fieldContent,
                            }}
                        >
                            {selectItems.map(selectItem => <MenuItem
                                value={selectItem.value}
                                key={selectItem.value}
                            >
                                {I18n.t(selectItem.name)}
                            </MenuItem>)}
                        </Select>
                    </span>
                    {
                        type.length ? <IconButton size="small" onClick={() => setType('')}>
                            <ClearIcon />
                        </IconButton> : null
                    }
                </div>
            </FormControl>
        </div>
        <div className={props.classes.widgets}>
            {
                Object.keys(widgetsList).map((category, categoryKey) => <Accordion
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
                        {category}
                    </AccordionSummary>
                    <AccordionDetails>
                        <div>
                            {Object.keys(widgetsList[category]).map((widgetTypeName, widgetKey) =>
                                <Widget widgetType={widgetsList[category][widgetTypeName]} key={widgetKey} />)}
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
