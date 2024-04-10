import PropTypes from 'prop-types';
import { useState, useMemo, useEffect } from 'react';
import { withStyles } from '@mui/styles';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    IconButton, InputAdornment, LinearProgress,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';

import {
    ExpandMore as ExpandMoreIcon,
    Clear as ClearIcon,
    UnfoldMore as UnfoldMoreIcon,
    UnfoldLess as UnfoldLessIcon,
    Search,
    Palette as IconPalette,
} from '@mui/icons-material';

import { I18n, Utils, Icon } from '@iobroker/adapter-react-v5';

import Widget from './Widget';
import { getWidgetTypes } from '../Vis/visWidgetsCatalog';
import MarketplacePalette from '../Marketplace/MarketplacePalette';
import { loadComponent } from '../Vis/visLoadWidgets';
import { store } from '../Store';

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
    searchLabel: {
        '& label': {
            marginLeft: 32,
            marginTop: -5,
        },
    },
});

const DEVELOPER_MODE = window.localStorage.getItem('developerMode') === 'true';

const Palette = props => {
    const [filter, setFilter] = useState('');
    const [marketplaceUpdates, setMarketplaceUpdates] = useState(null);
    const [marketplaceDeleted, setMarketplaceDeleted] = useState(null);
    const [marketplaceLoading, setMarketplaceLoading] = useState(false);

    const [accordionOpen, setAccordionOpen] = useState(
        window.localStorage.getItem('widgets')
            ? JSON.parse(window.localStorage.getItem('widgets'))
            : {},
    );

    const { widgetsList, widgetSetProps } = useMemo(() => {
        let _widgetsList = {
            __marketplace: {},
        };
        const _widgetSetProps = {
            __marketplace: {
                icon: 'img/marketplace.png',
            },
        };
        if (!props.widgetsLoaded) {
            return { widgetsList: _widgetsList, widgetSetProps: _widgetSetProps };
        }
        const widgetTypes = getWidgetTypes();
        widgetTypes.forEach(widgetType => {
            const widgetTypeName = widgetType.set;
            if (widgetType.developerMode) {
                _widgetSetProps[widgetTypeName] = _widgetSetProps[widgetTypeName] || {};
                _widgetSetProps[widgetTypeName].developerMode = true;
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
            if (widgetType.rx) {
                _widgetSetProps[widgetTypeName] = _widgetSetProps[widgetTypeName] || {};
                _widgetSetProps[widgetTypeName].rx = true;
            }
            if (widgetType.version) {
                _widgetSetProps[widgetTypeName] = _widgetSetProps[widgetTypeName] || {};
                _widgetSetProps[widgetTypeName].version = widgetType.version;
            }

            const title = widgetType.label ? I18n.t(widgetType.label) : window.vis._(widgetType.title) || '';
            if (widgetType.hidden || (filter && !title.toLowerCase().includes(filter.toLowerCase()))) {
                return;
            }

            _widgetsList[widgetTypeName] = _widgetsList[widgetTypeName] || {};
            _widgetsList[widgetTypeName][widgetType.name] = widgetType;
        });

        // sort widget sets: __marketplace, basic, rx, jqui, other
        const sets = Object.keys(_widgetsList);
        const posBasic = sets.indexOf('basic');
        if (posBasic !== -1) {
            sets.splice(posBasic, 1);
        }
        const posMarket = sets.indexOf('__marketplace');
        if (posMarket !== -1) {
            sets.splice(posMarket, 1);
        }
        const posJQui = sets.indexOf('jqui');
        if (posJQui !== -1) {
            sets.splice(posJQui, 1);
        }
        const rxSets = sets.filter(set => _widgetSetProps[set]?.rx).sort();
        const nonRxSets = sets.filter(set => !_widgetSetProps[set]?.rx).sort();

        if (posJQui !== -1) {
            nonRxSets.unshift('jqui');
        }
        const resultSet = [...rxSets, ...nonRxSets];

        if (posBasic !== -1) {
            resultSet.unshift('basic');
        }
        if (posMarket !== -1) {
            resultSet.unshift('__marketplace');
        }
        const sorted = {};
        resultSet.forEach(key => sorted[key] = _widgetsList[key]);
        _widgetsList = sorted;

        if (filter) {
            Object.keys(_widgetsList).forEach(widgetType => {
                if (!Object.keys(_widgetsList[widgetType]).length) {
                    delete _widgetsList[widgetType];
                    delete _widgetSetProps[widgetType];
                }
            });
        }

        // convert the objects to array
        Object.keys(_widgetsList).forEach(widgetType => {
            _widgetsList[widgetType] = Object.values(_widgetsList[widgetType]);
            // sort items
            _widgetsList[widgetType].sort((a, b) => a.order - b.order);
        });

        return { widgetsList: _widgetsList, widgetSetProps: _widgetSetProps };
    }, [filter, props.widgetsLoaded]);

    useEffect(() => {
        if (accordionOpen.__marketplace && window.marketplaceClient && !marketplaceUpdates && !marketplaceLoading) {
            // load marketplace
            setMarketplaceLoading(true);
            const tPromise = loadComponent('__marketplace', 'default', './translations', `${window.marketplaceClient}/customWidgets.js`)()
                .then(translations => I18n.extendTranslations(translations.default));

            const mPromise = loadComponent('__marketplace', 'default', './VisMarketplace', `${window.marketplaceClient}/customWidgets.js`)()
                .then(marketplace => window.VisMarketplace = marketplace);

            Promise.all([tPromise, mPromise])
                .then(async () => {
                    const updates = [];
                    const deleted = [];
                    if (store.getState().visProject?.___settings?.marketplace && window.VisMarketplace?.api) {
                        for (const i in store.getState().visProject.___settings.marketplace) {
                            const widget = store.getState().visProject.___settings.marketplace[i];
                            try {
                                const data = await window.VisMarketplace.api.apiGetWidget(widget.widget_id);
                                if (data.version !== widget.version) {
                                    updates.push(data);
                                }
                            } catch (e) {
                                if (e.statusCode === 404) {
                                    deleted.push(widget.widget_id);
                                } else {
                                    console.error(`Cannot check updates for ${widget.widget_id}: ${e}`);
                                }
                            }
                        }
                    }

                    setMarketplaceUpdates(updates);
                    setMarketplaceDeleted(deleted);
                    setMarketplaceLoading(false);
                })
                .catch(e => console.error(`Cannot load marketplace: ${e}`));
        }
    }, [accordionOpen.__marketplace]);

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
            <IconPalette style={{ marginTop: 4, marginRight: 4 }} />
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
                    onClick={() => props.onHide(true)}
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
                label={filter ? ' ' : I18n.t('Search')}
                className={props.classes.searchLabel}
                InputProps={{
                    className: props.classes.clearPadding,
                    endAdornment: filter ? <IconButton size="small" onClick={() => setFilter('')}>
                        <ClearIcon />
                    </IconButton> : null,
                    startAdornment: <InputAdornment position="start">
                        <Search />
                    </InputAdornment>,
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
        <div className={props.classes.widgets} style={!props.editMode ? { opacity: 0.3 } : null}>
            {Object.keys(widgetsList).map((category, categoryKey) => {
                let version = null;
                if (widgetSetProps[category]?.version) {
                    if (DEVELOPER_MODE) {
                        version = <div
                            className={props.classes.version}
                            style={{
                                cursor: 'pointer',
                                color: widgetSetProps[category].developerMode ? '#ff4242' : 'inherit',
                                fontWeight: widgetSetProps[category].developerMode ? 'bold' : 'inherit',
                            }}
                            onClick={async () => {
                                const objects = await props.socket.getObjectViewSystem(
                                    'instance',
                                    'system.adapter.',
                                    'system.adapter.\u9999',
                                );
                                const instances = Object.values(objects);
                                let reload = false;

                                // find widgetSet
                                const wSetObj = instances.find(obj => obj.common.visWidgets && obj.common.name === category);
                                if (widgetSetProps[category].developerMode) {
                                    if (wSetObj) {
                                        // find any set with http://localhost:4173/customWidgets.js
                                        if (Object.keys(wSetObj.common.visWidgets).find(key => wSetObj.common.visWidgets[key].url?.startsWith('http'))) {
                                            Object.keys(wSetObj.common.visWidgets).forEach(key => wSetObj.common.visWidgets[key].url = `${wSetObj.common.name}/customWidgets.js`);
                                            await props.socket.setObject(wSetObj._id, wSetObj);
                                            reload = true;
                                        }
                                    }
                                } else {
                                    const dynamicWidgetInstances = instances.filter(obj => obj.common.visWidgets);
                                    // disable all widget sets
                                    for (let i = 0; i < dynamicWidgetInstances.length; i++) {
                                        const visWidgets = dynamicWidgetInstances[i].common.visWidgets;
                                        if (dynamicWidgetInstances[i] !== wSetObj) {
                                            // find any set with http://localhost:4173/customWidgets.js
                                            if (Object.keys(visWidgets).find(key => visWidgets[key].url?.startsWith('http'))) {
                                                // disable the load over http
                                                Object.keys(visWidgets).forEach(key => visWidgets[key].url = `${dynamicWidgetInstances[i].common.name}/customWidgets.js`);
                                                await props.socket.setObject(dynamicWidgetInstances[i]._id, dynamicWidgetInstances[i]);
                                                reload = true;
                                            }
                                        } else {
                                            // check if http://localhost:4173/customWidgets.js available
                                            try {
                                                await fetch('http://localhost:4173/customWidgets.js');
                                                Object.keys(visWidgets).forEach(key => visWidgets[key].url = 'http://localhost:4173/customWidgets.js');
                                                await props.socket.setObject(wSetObj._id, wSetObj);
                                                reload = true;
                                            } catch (e) {
                                                window.alert(`Please start the widget development of ${wSetObj._id.split('.')[2]} first`);
                                            }
                                        }
                                    }
                                }
                                reload && setTimeout(() => window.location.reload(), 1000);
                            }}
                        >
                            {widgetSetProps[category]?.version}
                        </div>;
                    } else {
                        version = <div className={props.classes.version}>{widgetSetProps[category]?.version}</div>;
                    }
                }

                return <Accordion
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
                        {accordionOpen.__marketplace && marketplaceLoading && category === '__marketplace' &&
                            <LinearProgress />}
                        {accordionOpen.__marketplace && category === '__marketplace' && marketplaceUpdates && <div>
                            <MarketplacePalette setMarketplaceDialog={props.setMarketplaceDialog} />
                            {store.getState().visProject.___settings.marketplace?.map(item => <div key={item.id}>
                                <Widget
                                    editMode={props.editMode}
                                    key={item.id}
                                    marketplace={item}
                                    marketplaceDeleted={marketplaceDeleted}
                                    marketplaceUpdates={marketplaceUpdates}
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
                        </div>}
                        {version}
                        <div>
                            {accordionOpen[category] ? widgetsList[category].map(widgetItem =>
                                (widgetItem.name === '_tplGroup' ? null : <Widget
                                    changeProject={props.changeProject}
                                    editMode={props.editMode}
                                    key={widgetItem.name}
                                    project={store.getState().visProject}
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
                </Accordion>;
            })}
        </div>
    </>;
};

Palette.propTypes = {
    classes: PropTypes.object,
    onHide: PropTypes.func,
    uninstallWidget: PropTypes.func,
    setMarketplaceDialog: PropTypes.func,
    updateWidgets: PropTypes.func,
    widgetsLoaded: PropTypes.bool,
    socket: PropTypes.object,
    themeType: PropTypes.string,
};

export default withStyles(styles)(Palette);
