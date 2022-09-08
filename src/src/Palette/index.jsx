import PropTypes from 'prop-types';
import { useState } from 'react';
import withStyles from '@mui/styles/withStyles';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    IconButton,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';

import { i18n as I18n, Utils, Icon } from '@iobroker/adapter-react-v5';

import Widget from './Widget';
import { getWidgetTypes } from '../Utils';

const styles = theme => ({
    widgets: { textAlign: 'center', overflowY: 'auto', height: 'calc(100% - 84px)' },
    toggle: { width: 30, height: 30 },
    right: {
        float: 'right',
    },
    button: {
        padding: '0 4px',
    },
    label: {
        top: -10,
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
            borderRadius: 4,
            padding: 2,
        },
    },
    groupSummaryExpanded: {
        '&&&&&&': {
            marginTop: 20,
            borderTopRightRadius: 4,
            borderTopLeftRadius: 4,
            padding: 2,
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
    groupIcon: {
        width: 20,
        height: 20,
        marginRight: 4,
    },
});

const Palette = props => {
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
    const widgetSetProps = {};

    const widgetTypes = getWidgetTypes();

    // console.log(widgetTypes);

    widgetTypes.forEach(widgetType => {
        if (!widgetsList[widgetType.set]) {
            widgetsList[widgetType.set] = {};
        }
        const title = widgetType.label ? I18n.t(widgetType.label) : window.vis._(widgetType.title) || '';
        if (filter && !title.toLowerCase().includes(filter.toLowerCase())) {
            return;
        }
        if (widgetType.setLabel) {
            widgetSetProps[widgetType.set] = widgetSetProps[widgetType.set] || {};
            widgetSetProps[widgetType.set].label = I18n.t(widgetType.setLabel);
        }
        if (widgetType.setColor) {
            widgetSetProps[widgetType.set] = widgetSetProps[widgetType.set] || {};
            widgetSetProps[widgetType.set].color = widgetType.setColor;
        }
        if (widgetType.adapter) {
            widgetSetProps[widgetType.set] = widgetSetProps[widgetType.set] || {};
            if (window.location.port === '3000') {
                widgetSetProps[widgetType.set].icon = `./adapter/${widgetType.adapter}/${widgetType.adapter}.png`;
            } else {
                widgetSetProps[widgetType.set].icon = `../adapter/${widgetType.adapter}/${widgetType.adapter}.png`;
            }
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
        <Typography
            variant="h6"
            gutterBottom
            className={Utils.clsx(props.classes.blockHeader, props.classes.lightedPanel)}
            style={{ display: 'flex', lineHeight: '34px' }}
        >
            <span style={{ verticalAlign: 'middle' }}>{I18n.t('Palette')}</span>
            <div style={{ flex: 1 }}></div>
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
            {!allClosed ? <Tooltip size="small" title={I18n.t('Collapse all')}>
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
            <Tooltip title={I18n.t('Hide palette')}>
                <IconButton
                    size="small"
                    onClick={() =>
                        props.onHide(true)}
                >
                    <ClearIcon />
                </IconButton>
            </Tooltip>
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
                            root: Utils.clsx(props.classes.clearPadding, accordionOpen[category]
                                ? props.classes.groupSummaryExpanded : props.classes.groupSummary, props.classes.lightedPanel),
                            content: props.classes.clearPadding,
                            expandIcon: props.classes.clearPadding,
                        }}
                    >
                        {widgetSetProps[category]?.icon ?
                            <Icon className={props.classes.groupIcon} src={widgetSetProps[category].icon} />
                            :
                            null}
                        {widgetSetProps[category]?.label ?
                            (widgetSetProps[category].label.startsWith('Vis 2') ?
                                widgetSetProps[category].label : `Vis 2 - ${widgetSetProps[category].label}`)
                            :
                            category}
                    </AccordionSummary>
                    <AccordionDetails>
                        <div>
                            {Object.keys(widgetsList[category]).map((widgetTypeName, widgetKey) =>
                                (widgetTypeName === '_tplGroup' ? null : <Widget
                                    widgetType={widgetsList[category][widgetTypeName]}
                                    key={widgetKey}
                                    widgetSet={category}
                                    widgetSetProps={widgetSetProps[category]}
                                    widgetTypeName={widgetTypeName}
                                />))}
                        </div>
                    </AccordionDetails>
                </Accordion>)
            }
        </div>
    </>;
};

Palette.propTypes = {
    classes: PropTypes.object,
    onHide: PropTypes.func,
    widgetsLoaded: PropTypes.bool,
};

export default withStyles(styles)(Palette);
