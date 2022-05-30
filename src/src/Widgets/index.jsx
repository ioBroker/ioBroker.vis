import PropTypes from 'prop-types';
import I18n from '@iobroker/adapter-react-v5/i18n';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    IconButton,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';

import { useState } from 'react';
import clsx from 'clsx';
import Widget from './Widget';
import { getWidgetTypes } from '../Utils';

const styles = theme => ({
    widgets: { textAlign: 'center', overflowY: 'auto', height: 'calc(100% - 80px)' },
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
    const [filter, setFilter] = useState('');

    const [accordionOpen, setAccordionOpen] = useState(
        window.localStorage.getItem('widgets')
            ? JSON.parse(window.localStorage.getItem('widgets'))
            : {},
    );

    if (!props.widgetsLoaded) {
        return null;
    }
    const widgetsList = {};

    const widgetTypes = getWidgetTypes();
    widgetTypes.forEach(widgetType => {
        if (!widgetsList[widgetType.set]) {
            widgetsList[widgetType.set] = {};
        }
        const title = window._(widgetType.title) || '';
        if (filter && !title.toLowerCase().includes(filter.toLowerCase())) {
            return;
        }
        widgetsList[widgetType.set][widgetType.name] = widgetType;
    });
    if (filter) {
        Object.keys(widgetsList).forEach(widgetType => {
            if (!Object.keys(widgetsList[widgetType]).length) {
                delete widgetsList[widgetType];
            }
        });
    }

    const allOpened = !Object.keys(widgetsList).find(group => !accordionOpen[group]);
    const allClosed = !Object.keys(widgetsList).find(group => accordionOpen[group]);

    return <>
        <Typography variant="h6" gutterBottom className={clsx(props.classes.blockHeader, props.classes.lightedPanel)}>
            {!allOpened ? <Tooltip title={I18n.t('Expand all')}>
                <IconButton
                    size="small"
                    onClick={() => {
                        const newAccordionOpen = {};
                        Object.keys(widgetsList).forEach(group => newAccordionOpen[group] = true);
                        window.localStorage.setItem('widgets', JSON.stringify(newAccordionOpen));
                        setAccordionOpen(newAccordionOpen);
                    }}
                >
                    <UnfoldMoreIcon />
                </IconButton>
            </Tooltip> : <IconButton size="small" disabled><UnfoldMoreIcon /></IconButton>}
            { !allClosed ? <Tooltip size="small" title={I18n.t('Collapse all')}>
                <IconButton onClick={() => {
                    const newAccordionOpen = {};
                    Object.keys(widgetsList).forEach(group => newAccordionOpen[group] = false);
                    window.localStorage.setItem('widgets', JSON.stringify(newAccordionOpen));
                    setAccordionOpen(newAccordionOpen);
                }}
                >
                    <UnfoldLessIcon />
                </IconButton>
            </Tooltip> : <IconButton size="small" disabled><UnfoldLessIcon /></IconButton> }
            {I18n.t('Palette')}
        </Typography>
        <div>
            <TextField
                variant="standard"
                fullWidth
                value={filter}
                onChange={e => setFilter(e.target.value)}
                label={filter.length ? ' ' : I18n.t('Filter')}
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
        <div className={props.classes.widgets}>
            {
                Object.keys(widgetsList).map((category, categoryKey) => <Accordion
                    key={categoryKey}
                    elevation={0}
                    expanded={accordionOpen[category] || false}
                    onChange={(e, expanded) => {
                        const newAccordionOpen = JSON.parse(JSON.stringify(accordionOpen));
                        newAccordionOpen[category] = expanded;
                        window.localStorage.setItem('widgets', JSON.stringify(newAccordionOpen));
                        setAccordionOpen(newAccordionOpen);
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        classes={{
                            root: clsx(props.classes.clearPadding, accordionOpen[category]
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
                                <Widget widgetType={widgetsList[category][widgetTypeName]} key={widgetKey} widgetSet={category} />)}
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
