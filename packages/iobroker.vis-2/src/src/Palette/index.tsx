import React, { Component } from 'react';
import { withStyles } from '@mui/styles';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    IconButton, InputAdornment, LinearProgress,
    TextField,
    Tooltip,
    Typography,
    type Theme,
} from '@mui/material';

import {
    ExpandMore as ExpandMoreIcon,
    Clear as ClearIcon,
    UnfoldMore as UnfoldMoreIcon,
    UnfoldLess as UnfoldLessIcon,
    Search,
    Palette as IconPalette,
} from '@mui/icons-material';

import {
    I18n, Utils,
    Icon,
} from '@iobroker/adapter-react-v5';
import type {
    LegacyConnection,
    type ThemeType,
} from '@iobroker/adapter-react-v5';

import type { Marketplace, MarketplaceWidgetRevision, Project } from '@iobroker/types-vis-2';
import { store } from '@/Store';

import type { WidgetType } from '@/Vis/visWidgetsCatalog';
import { getWidgetTypes } from '@/Vis/visWidgetsCatalog';
import { loadComponent } from '@/Vis/visLoadWidgets';
import type { MarketplaceDialogProps } from '@/Marketplace/MarketplaceDialog';
import type { EditorClass } from '../Editor';
import Widget from './Widget';
import MarketplacePalette from '../Marketplace/MarketplacePalette';

// declare global {
//     interface Window {
//         marketplaceClient?: string;
//         VisMarketplace?: {
//             api: {
//                 apiGetWidgetRevision(widgetId: string, id: string): Promise<any>;
//                 apiGetWidget(widgetId: string): Promise<any>;
//             };
//             default: React.Component<VisMarketplaceProps>;
//         };
//         apiUrl: string;
//         webPrefix: string;
//     }
// }

const styles: Record<string, any> = (theme: Theme) => ({
    widgets: {
        textAlign: 'center',
        overflowY: 'auto',
        height: 'calc(100% - 84px)',
    },
    toggle: {
        width: 30,
        height: 30,
    },
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
    accordionRoot: {
        '&&&&': {
            padding: 0,
            margin: 0,
            minHeight: 'initial',
        },
        '&:before': {
            opacity: 0,
        },
    },
    accordionOpenedSummary: {
        fontWeight: 'bold',
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
            marginTop: 10,
            borderTopRightRadius: 4,
            borderTopLeftRadius: 4,
            padding: 2,
        },
    },
    // @ts-expect-error no idea how to solve it
    blockHeader: theme.classes.blockHeader,
    // @ts-expect-error no idea how to solve it
    lightedPanel: theme.classes.lightedPanel,
    accordionDetails: {
        // @ts-expect-error no idea how to solve it
        ...theme.classes.lightedPanel,
        borderRadius: '0 0 4px 4px',
        flexDirection: 'column',
    },
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

interface WidgetSetProps {
    icon?: string;
    developerMode?: boolean;
    label?: string;
    color?: string;
    rx?: true;
    version?: string;
}

interface PaletteProps {
    classes: Record<string, string>;
    onHide: (hide: boolean) => void;
    changeView: EditorClass['changeView'];
    changeProject: EditorClass['changeProject'];
    uninstallWidget: EditorClass['uninstallWidget'];
    setMarketplaceDialog: EditorClass['setMarketplaceDialog'];
    updateWidgets: EditorClass['updateWidgets'];
    widgetsLoaded: boolean;
    socket: LegacyConnection;
    themeType: ThemeType;
    editMode: boolean;
    selectedView: string;
    project: Project;
}

interface PaletteState {
    filter: string;
    marketplaceUpdates: MarketplaceWidgetRevision[] | null;
    marketplaceDeleted: string[] | null;
    marketplaceLoading: boolean;
    accordionOpen: Record<string, boolean>;
    widgetsList: Record<string, WidgetType[]>;
    widgetSetProps: Record<string, WidgetSetProps>;
}

class Palette extends Component<PaletteProps, PaletteState> {
    private buildWidgetListTimeout: ReturnType<typeof setTimeout> | null = null;

    private marketplaceLoadingStarted = false;

    constructor(props: PaletteProps) {
        super(props);
        const accordionOpenStr = window.localStorage.getItem('widgets');
        let accordionOpen;
        try {
            accordionOpen = accordionOpenStr ? JSON.parse(accordionOpenStr) : {};
        } catch (e) {
            accordionOpen = {};
        }

        this.state = {
            filter: '',
            marketplaceUpdates: null,
            marketplaceDeleted: null,
            marketplaceLoading: false,
            accordionOpen,
            widgetsList: null,
            widgetSetProps: null,
        };
    }

    componentDidMount() {
        if (this.state.accordionOpen.__marketplace) {
            this.loadMarketplace();
        }
    }

    loadMarketplace() {
        if (
            this.state.accordionOpen.__marketplace &&
            window.marketplaceClient &&
            !this.state.marketplaceUpdates &&
            !this.state.marketplaceLoading &&
            !this.marketplaceLoadingStarted
        ) {
            this.marketplaceLoadingStarted = true;
            // load marketplace
            this.setState({ marketplaceLoading: true }, () => {
                // @ts-expect-error solve later
                const tPromise = loadComponent('__marketplace', 'default', './translations', `${window.marketplaceClient}/customWidgets.js`)()
                    .then((translations: any) => I18n.extendTranslations(translations.default));

                // @ts-expect-error solve later
                const mPromise = loadComponent('__marketplace', 'default', './VisMarketplace', `${window.marketplaceClient}/customWidgets.js`)()
                    .then(marketplace => window.VisMarketplace = marketplace as any as Marketplace);

                Promise.all([tPromise, mPromise])
                    .then(async () => {
                        const updates: MarketplaceWidgetRevision[] = [];
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

                        this.marketplaceLoadingStarted = false;
                        this.setState({
                            marketplaceUpdates: updates,
                            marketplaceDeleted: deleted,
                            marketplaceLoading: false,
                        });
                    })
                    .catch(e => console.error(`Cannot load marketplace: ${e}`));
            });
        }
    }

    buildWidgetList() {
        if (!this.props.widgetsLoaded) {
            if (this.state.widgetsList !== null || this.state.widgetSetProps !== null) {
                this.setState({ widgetsList: null, widgetSetProps: null });
            }
            return;
        }

        let _widgetsList: Record<string, Record<string, WidgetType>> = {};
        const widgetSetProps: Record<string, WidgetSetProps> = {};

        const widgetTypes = getWidgetTypes();
        widgetTypes.forEach(widgetType => {
            const widgetTypeName: string = widgetType.set;
            if (widgetType.developerMode) {
                widgetSetProps[widgetTypeName] = widgetSetProps[widgetTypeName] || {};
                widgetSetProps[widgetTypeName].developerMode = true;
            }

            if (widgetType.setLabel) {
                widgetSetProps[widgetTypeName] = widgetSetProps[widgetTypeName] || {};
                widgetSetProps[widgetTypeName].label = I18n.t(widgetType.setLabel);
            }
            if (widgetType.setColor) {
                widgetSetProps[widgetTypeName] = widgetSetProps[widgetTypeName] || {};
                widgetSetProps[widgetTypeName].color = widgetType.setColor;
            }
            if (widgetType.setIcon) {
                widgetSetProps[widgetTypeName] = widgetSetProps[widgetTypeName] || {};
                widgetSetProps[widgetTypeName].icon = widgetType.setIcon;
            } else if (widgetType.adapter && !widgetSetProps[widgetTypeName]?.icon) {
                widgetSetProps[widgetTypeName] = widgetSetProps[widgetTypeName] || {};
                if (window.location.port === '3000') {
                    widgetSetProps[widgetTypeName].icon = `./adapter/${widgetType.adapter}/${widgetType.adapter}.png`;
                } else {
                    widgetSetProps[widgetTypeName].icon = `../adapter/${widgetType.adapter}/${widgetType.adapter}.png`;
                }
            }
            if (widgetType.rx) {
                widgetSetProps[widgetTypeName] = widgetSetProps[widgetTypeName] || {};
                widgetSetProps[widgetTypeName].rx = true;
            }
            if (widgetType.version) {
                widgetSetProps[widgetTypeName] = widgetSetProps[widgetTypeName] || {};
                widgetSetProps[widgetTypeName].version = widgetType.version;
            }

            const title = widgetType.label ? I18n.t(widgetType.label) : window.vis._(widgetType.title) || '';
            if (widgetType.hidden || (this.state.filter && !title.toLowerCase().includes(this.state.filter.toLowerCase()))) {
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
        const posJQui = sets.indexOf('jqui');
        if (posJQui !== -1) {
            sets.splice(posJQui, 1);
        }
        const rxSets = sets.filter(set => widgetSetProps[set]?.rx).sort();
        const nonRxSets = sets.filter(set => !widgetSetProps[set]?.rx).sort();

        if (posJQui !== -1) {
            nonRxSets.unshift('jqui');
        }
        const resultSet = [...rxSets, ...nonRxSets];

        if (posBasic !== -1) {
            resultSet.unshift('basic');
        }
        const sorted: Record<string, Record<string, WidgetType>> = {};
        resultSet.forEach(key => sorted[key] = _widgetsList[key]);
        _widgetsList = sorted;

        if (this.state.filter) {
            Object.keys(_widgetsList).forEach(widgetType => {
                if (!Object.keys(_widgetsList[widgetType]).length) {
                    delete _widgetsList[widgetType];
                    delete widgetSetProps[widgetType];
                }
            });
        }

        const widgetsList: Record<string, WidgetType[]> = {};
        // convert the objects to array
        Object.keys(_widgetsList).forEach(widgetType => {
            widgetsList[widgetType] = Object.values(_widgetsList[widgetType]);
            // sort items
            widgetsList[widgetType].sort((a, b) => a.order - b.order);
        });

        this.setState({ widgetsList, widgetSetProps }, () => {
            this.buildWidgetListTimeout = null;
        });
    }

    renderMarketplace() {
        const classes = this.props.classes;
        const opened = this.state.accordionOpen.__marketplace;

        return <Accordion
            classes={{
                root: classes.accordionRoot,
                expanded: classes.clearPadding,
            }}
            elevation={0}
            expanded={opened || false}
            onChange={(e, expanded) => {
                const accordionOpen = JSON.parse(JSON.stringify(this.state.accordionOpen));
                accordionOpen.__marketplace = expanded;
                window.localStorage.setItem('widgets', JSON.stringify(accordionOpen));
                this.setState({ accordionOpen }, () =>
                    expanded && this.loadMarketplace());
            }}
        >
            <AccordionSummary
                id="summary___marketplace"
                expandIcon={<ExpandMoreIcon />}
                className={Utils.clsx('vis-palette-widget-set', opened && 'vis-palette-summary-expanded')}
                classes={{
                    root: Utils.clsx(
                        classes.clearPadding,
                        opened ? classes.groupSummaryExpanded : classes.groupSummary,
                        classes.lightedPanel,
                    ),
                    content: Utils.clsx(classes.clearPadding, opened && classes.accordionOpenedSummary),
                    // expandIcon: classes.clearPadding,
                }}
            >
                <Icon className={classes.groupIcon} src="img/marketplace.png" />
                {I18n.t('__marketplace')}
            </AccordionSummary>
            <AccordionDetails classes={{ root: classes.accordionDetails }}>
                {opened && this.state.marketplaceLoading ? <LinearProgress /> : null}
                {opened && this.state.marketplaceUpdates && <div>
                    <MarketplacePalette setMarketplaceDialog={this.props.setMarketplaceDialog} />
                    {store.getState().visProject.___settings.marketplace?.map(item => <div key={item.id}>
                        <Widget
                            editMode={this.props.editMode}
                            key={item.id}
                            themeType={this.props.themeType}
                            selectedView={this.props.selectedView}
                            marketplace={item}
                            marketplaceDeleted={this.state.marketplaceDeleted}
                            marketplaceUpdates={this.state.marketplaceUpdates}
                            uninstallWidget={this.props.uninstallWidget}
                            updateWidgets={this.props.updateWidgets}
                            widgetSet="__marketplace"
                            widgetType={{
                                name: item.id,
                                label: item.name,
                                preview: `${window.apiUrl + window.webPrefix}/images/${item.image_id}`,
                                params: 'simulated',
                            }}
                            widgetMarketplaceId={item.widget_id}
                            widgetTypeName={item.name}
                        />
                    </div>)}
                </div>}
            </AccordionDetails>
        </Accordion>;
    }

    async toggleDebugVersion(category: string) {
        const objects = await this.props.socket.getObjectViewSystem(
            'instance',
            'system.adapter.',
            'system.adapter.\u9999',
        );
        const instances = Object.values(objects);
        let reload = false;

        // find widgetSet
        const wSetObj = instances.find(obj => obj.common.visWidgets && obj.common.name === category);
        if (this.state.widgetSetProps[category].developerMode) {
            if (wSetObj) {
                // find any set with http://localhost:4173/customWidgets.js
                if (Object.keys(wSetObj.common.visWidgets).find(key => wSetObj.common.visWidgets[key].url?.startsWith('http'))) {
                    Object.keys(wSetObj.common.visWidgets).forEach(key => wSetObj.common.visWidgets[key].url = `${wSetObj.common.name}/customWidgets.js`);
                    await this.props.socket.setObject(wSetObj._id, wSetObj);
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
                        await this.props.socket.setObject(dynamicWidgetInstances[i]._id, dynamicWidgetInstances[i]);
                        reload = true;
                    }
                } else {
                    // check if http://localhost:4173/customWidgets.js available
                    try {
                        await fetch('http://localhost:4173/customWidgets.js');
                        Object.keys(visWidgets).forEach(key => visWidgets[key].url = 'http://localhost:4173/customWidgets.js');
                        await this.props.socket.setObject(wSetObj._id, wSetObj);
                        reload = true;
                    } catch (e) {
                        window.alert(`Please start the widget development of ${wSetObj._id.split('.')[2]} first`);
                    }
                }
            }
        }
        reload && setTimeout(() => window.location.reload(), 1000);
    }

    buildListTrigger(immediate?: boolean) {
        if (this.buildWidgetListTimeout) {
            clearTimeout(this.buildWidgetListTimeout);
            this.buildWidgetListTimeout = null;
        }
        this.buildWidgetListTimeout = this.buildWidgetListTimeout || setTimeout(() => {
            this.buildWidgetListTimeout = null;
            this.buildWidgetList();
        }, immediate ? 0 : 100);
    }

    render() {
        if (!this.props.widgetsLoaded) {
            return null;
        }
        if (!this.state.widgetsList) {
            this.buildListTrigger(true);
            return null;
        }

        const allOpened = !Object.keys(this.state.widgetsList).find(group => !this.state.accordionOpen[group]);
        const allClosed = !Object.keys(this.state.widgetsList).find(group => this.state.accordionOpen[group]);
        const classes = this.props.classes;

        return <>
            <Typography
                variant="h6"
                gutterBottom
                className={Utils.clsx(classes.blockHeader, classes.lightedPanel)}
                style={{ display: 'flex', lineHeight: '34px' }}
            >
                <IconPalette style={{ marginTop: 4, marginRight: 4 }} />
                <span style={{ verticalAlign: 'middle' }}>{I18n.t('Palette')}</span>
                <div style={{ flex: 1 }} />
                {!allOpened ? <Tooltip title={I18n.t('Expand all')}>
                    <IconButton
                        size="small"
                        onClick={() => {
                            // save the state of marketplace and do not open it if it is not opened
                            const __marketplace = this.state.accordionOpen.__marketplace;
                            const accordionOpen: Record<string, boolean> = {};
                            Object.keys(this.state.widgetsList).forEach(group => accordionOpen[group] = true);
                            this.state.accordionOpen.__marketplace = __marketplace;
                            window.localStorage.setItem('widgets', JSON.stringify(accordionOpen));
                            this.setState({ accordionOpen });
                        }}
                    >
                        <UnfoldMoreIcon />
                    </IconButton>
                </Tooltip> : <IconButton size="small" disabled><UnfoldMoreIcon /></IconButton>}
                {!allClosed ? <Tooltip title={I18n.t('Collapse all')}>
                    <IconButton onClick={() => {
                        const accordionOpen: Record<string, boolean> = {};
                        Object.keys(this.state.widgetsList).forEach(group => accordionOpen[group] = false);
                        this.state.accordionOpen.__marketplace = false;
                        window.localStorage.setItem('widgets', JSON.stringify(accordionOpen));
                        this.setState({ accordionOpen });
                    }}
                    >
                        <UnfoldLessIcon />
                    </IconButton>
                </Tooltip> : <IconButton size="small" disabled><UnfoldLessIcon /></IconButton> }
                <Tooltip title={I18n.t('Hide palette')}>
                    <IconButton
                        size="small"
                        onClick={() => this.props.onHide(true)}
                    >
                        <ClearIcon />
                    </IconButton>
                </Tooltip>
            </Typography>
            <div>
                <TextField
                    variant="standard"
                    fullWidth
                    value={this.state.filter}
                    onChange={e => this.setState({ filter: e.target.value }, () => this.buildListTrigger())}
                    label={this.state.filter ? ' ' : I18n.t('Search')}
                    className={classes.searchLabel}
                    InputProps={{
                        className: classes.clearPadding,
                        endAdornment: this.state.filter ? <IconButton size="small" onClick={() => this.setState({ filter: '' }, () => this.buildListTrigger())}>
                            <ClearIcon />
                        </IconButton> : null,
                        startAdornment: <InputAdornment position="start">
                            <Search />
                        </InputAdornment>,
                    }}
                    InputLabelProps={{
                        shrink: false,
                        classes: {
                            root: classes.label,
                            shrink: classes.labelShrink,
                        },
                    }}
                />
            </div>
            <div className={classes.widgets} style={!this.props.editMode ? { opacity: 0.3 } : null}>
                {this.renderMarketplace()}
                {Object.keys(this.state.widgetsList).map((category, categoryKey) => {
                    let version = null;
                    if (this.state.widgetSetProps[category]?.version) {
                        if (DEVELOPER_MODE) {
                            version = <div
                                className={classes.version}
                                style={{
                                    cursor: 'pointer',
                                    color: this.state.widgetSetProps[category].developerMode ? '#ff4242' : 'inherit',
                                    fontWeight: this.state.widgetSetProps[category].developerMode ? 'bold' : 'inherit',
                                }}
                                onClick={() => this.toggleDebugVersion(category)}
                            >
                                {this.state.widgetSetProps[category]?.version}
                            </div>;
                        } else {
                            version = <div className={classes.version}>{this.state.widgetSetProps[category]?.version}</div>;
                        }
                    }

                    return <Accordion
                        classes={{
                            root: classes.accordionRoot,
                            expanded: classes.clearPadding,
                        }}
                        key={categoryKey}
                        elevation={0}
                        expanded={this.state.accordionOpen[category] || false}
                        onChange={(e, expanded) => {
                            const accordionOpen = JSON.parse(JSON.stringify(this.state.accordionOpen));
                            accordionOpen[category] = expanded;
                            window.localStorage.setItem('widgets', JSON.stringify(accordionOpen));
                            this.setState({ accordionOpen });
                        }}
                    >
                        <AccordionSummary
                            id={`summary_${category}`}
                            expandIcon={<ExpandMoreIcon />}
                            className={Utils.clsx('vis-palette-widget-set', this.state.accordionOpen[category] && 'vis-palette-summary-expanded')}
                            classes={{
                                root: Utils.clsx(
                                    classes.clearPadding,
                                    this.state.accordionOpen[category] ? classes.groupSummaryExpanded : classes.groupSummary,
                                    classes.lightedPanel,
                                ),
                                content: Utils.clsx(classes.clearPadding, this.state.accordionOpen[category] && classes.accordionOpenedSummary),
                                // expandIcon: classes.clearPadding,
                            }}
                        >
                            {this.state.widgetSetProps[category]?.icon ?
                                <Icon className={classes.groupIcon} src={this.state.widgetSetProps[category].icon} />
                                :
                                null}
                            {this.state.widgetSetProps[category]?.label ?
                                (this.state.widgetSetProps[category].label.startsWith('Vis 2 - ') ?
                                    this.state.widgetSetProps[category].label.substring(8) : this.state.widgetSetProps[category].label)
                                :
                                I18n.t(category)}
                        </AccordionSummary>
                        <AccordionDetails classes={{ root: classes.accordionDetails }}>
                            {version}
                            <div>
                                {this.state.accordionOpen[category] ? this.state.widgetsList[category].map(widgetItem =>
                                    (widgetItem.name === '_tplGroup' ? null : <Widget
                                        changeProject={this.props.changeProject}
                                        changeView={this.props.changeView}
                                        editMode={this.props.editMode}
                                        key={widgetItem.name}
                                        selectedView={this.props.selectedView}
                                        socket={this.props.socket}
                                        themeType={this.props.themeType}
                                        widgetSet={category}
                                        widgetSetProps={this.state.widgetSetProps[category]}
                                        widgetType={widgetItem}
                                        widgetTypeName={widgetItem.name}
                                    />)) : null}
                            </div>
                        </AccordionDetails>
                    </Accordion>;
                })}
            </div>
        </>;
    }
}

export default withStyles(styles)(Palette);
