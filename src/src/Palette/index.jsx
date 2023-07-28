import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
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

import { I18n, Utils, Icon } from '@iobroker/adapter-react-v5';

import Widget from './Widget';
import { getWidgetTypes } from '../Vis/visWidgetsCatalog';
import MarketplacePalette from '../Marketplace/MarketplacePalette';

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
            marginTop: 10,
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
        marginRight: 8,
    },
    version: {
        fontSize: 10,
        opacity: 0.7,
        fontStyle: 'italic',
        textAlign: 'left',
    },
});

const Palette = props => {
    const [filter, setFilter] = useState('');

    const [accordionOpen, setAccordionOpen] = useState(
        window.localStorage.getItem('widgets')
            ? JSON.parse(window.localStorage.getItem('widgets'))
            : {},
    );

    const { widgetsList, widgetSetProps } = useMemo(() => {
        const _widgetsList = window.VisMarketplace && props.marketplaceUpdates ? {
            __marketplace: {},
        } : {};
        const _widgetSetProps = window.VisMarketplace && props.marketplaceUpdates ? {
            __marketplace: {
                icon: 'img/marketplace.png',
            },
        } : {};
        if (!props.widgetsLoaded) {
            return { widgetsList: _widgetsList, widgetSetProps: _widgetSetProps };
        }
        const widgetTypes = getWidgetTypes();
        widgetTypes.forEach(widgetType => {
            const widgetTypeName = widgetType.set;
            _widgetsList[widgetTypeName] = _widgetsList[widgetTypeName] || {};
            const title = widgetType.label ? I18n.t(widgetType.label) : window.vis._(widgetType.title) || '';
            if (widgetType.hidden || (filter && !title.toLowerCase().includes(filter.toLowerCase()))) {
                return;
            }

            if (widgetType.setLabel) {
                _widgetSetProps[widgetTypeName] = _widgetSetProps[widgetTypeName] || {};
                _widgetSetProps[widgetTypeName].label = I18n.t(widgetType.setLabel);
            }
            if (widgetType.setColor) {
                _widgetSetProps[widgetTypeName] = _widgetSetProps[widgetTypeName] || {};
                _widgetSetProps[widgetTypeName].color = widgetType.setColor;
            }
            if (widgetType.setIcon) {
                _widgetSetProps[widgetTypeName] = _widgetSetProps[widgetTypeName] || {};
                _widgetSetProps[widgetTypeName].icon = widgetType.setIcon;
            } else if (widgetType.adapter && !_widgetSetProps[widgetTypeName]?.icon) {
                _widgetSetProps[widgetTypeName] = _widgetSetProps[widgetTypeName] || {};
                if (window.location.port === '3000') {
                    _widgetSetProps[widgetTypeName].icon = `./adapter/${widgetType.adapter}/${widgetType.adapter}.png`;
                } else {
                    _widgetSetProps[widgetTypeName].icon = `../adapter/${widgetType.adapter}/${widgetType.adapter}.png`;
                }
            }

            if (widgetType.version) {
                _widgetSetProps[widgetTypeName].version = widgetType.version;
            }

            _widgetsList[widgetTypeName][widgetType.name] = widgetType;
        });

        if (filter) {
            Object.keys(_widgetsList).forEach(widgetType => {
                if (!Object.keys(_widgetsList[widgetType]).length) {
                    delete _widgetsList[widgetType];
                }
            });
        }

        // convert the objects to array
        Object.keys(_widgetsList).forEach(widgetType => {
            _widgetsList[widgetType] = Object.values(_widgetsList[widgetType]);
            // sort items
            _widgetsList[widgetType].sort((a, b) => {
                if (a.order === undefined) {
                    a.order = 1000;
                }
                if (b.order === undefined) {
                    b.order = 1000;
                }
                return a.order - b.order;
            });
        });

        return { widgetsList: _widgetsList, widgetSetProps: _widgetSetProps };
    }, [filter, props.widgetsLoaded]);

    if (!props.widgetsLoaded) {
        return null;
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
            <div style={{ flex: 1 }} />
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
                        id={`summary_${category}`}
                        expandIcon={<ExpandMoreIcon />}
                        className={Utils.clsx('vis-palette-widget-set', accordionOpen[category] && 'vis-palette-summary-expanded')}
                        classes={{
                            root: Utils.clsx(
                                props.classes.clearPadding,
                                accordionOpen[category] ? props.classes.groupSummaryExpanded : props.classes.groupSummary,
                                props.classes.lightedPanel,
                            ),
                            content: props.classes.clearPadding,
                            expandIcon: props.classes.clearPadding,
                        }}
                    >
                        {widgetSetProps[category]?.icon ?
                            <Icon className={props.classes.groupIcon} src={widgetSetProps[category].icon} />
                            :
                            null}
                        {widgetSetProps[category]?.label ?
                            (widgetSetProps[category].label.startsWith('Vis 2 - ') ?
                                widgetSetProps[category].label.substring(8) : widgetSetProps[category].label)
                            :
                            I18n.t(category)}
                    </AccordionSummary>
                    <AccordionDetails>
                        {
                            category === '__marketplace' && props.marketplaceUpdates && <div>
                                <MarketplacePalette setMarketplaceDialog={props.setMarketplaceDialog} />
                                {props.project.___settings.marketplace?.map(item => <div key={item.id}>
                                    <Widget
                                        editMode={props.editMode}
                                        key={item.id}
                                        marketplace={item}
                                        marketplaceDeleted={props.marketplaceDeleted}
                                        marketplaceUpdates={props.marketplaceUpdates}
                                        uninstallWidget={props.uninstallWidget}
                                        updateWidgets={props.updateWidgets}
                                        widgetSet={category}
                                        widgetSetProps={widgetSetProps[category]}
                                        widgetType={{
                                            id: item.id,
                                            widget_id: item.widget_id,
                                            label: item.name,
                                            preview: `${window.apiUrl + window.webPrefix}/images/${item.image_id}`,
                                        }}
                                        widgetTypeName={item.name}
                                    />
                                </div>)}
                            </div>
                        }
                        {widgetSetProps[category]?.version ?
                            <div className={props.classes.version}>{widgetSetProps[category]?.version}</div> : null}
                        <div>
                            {accordionOpen[category] ? widgetsList[category].map(widgetItem =>
                                (widgetItem.name === '_tplGroup' ? null : <Widget
                                    changeProject={props.changeProject}
                                    editMode={props.editMode}
                                    key={widgetItem.name}
                                    project={props.project}
                                    selectedView={props.selectedView}
                                    socket={props.socket}
                                    themeType={props.themeType}
                                    widgetSet={category}
                                    widgetSetProps={widgetSetProps[category]}
                                    widgetType={widgetItem}
                                    widgetTypeName={widgetItem.name}
                                />)) : null}
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
    uninstallWidget: PropTypes.func,
    setMarketplaceDialog: PropTypes.func,
    updateWidgets: PropTypes.func,
    project: PropTypes.object,
    widgetsLoaded: PropTypes.bool,
    marketplaceUpdates: PropTypes.array,
    marketplaceDeleted: PropTypes.array,
    socket: PropTypes.object,
    themeType: PropTypes.string,
};

export default withStyles(styles)(Palette);
