import React, { Component } from 'react';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    IconButton,
    InputAdornment,
    LinearProgress,
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

import { I18n, Utils, Icon, type LegacyConnection, type ThemeType } from '@iobroker/adapter-react-v5';

import type { Marketplace, MarketplaceWidgetRevision, VisTheme } from '@iobroker/types-vis-2';
import { store } from '@/Store';

import { getWidgetTypes, type WidgetType } from '@/Vis/visWidgetsCatalog';
import commonStyles from '@/Utils/styles';
import type Editor from '../Editor';
import Widget from './Widget';
import MarketplacePalette from '../Marketplace/MarketplacePalette';
import { loadRemote, registerRemotes } from '@module-federation/runtime';

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

const styles: Record<string, any> = {
    widgets: {
        textAlign: 'center',
        overflowY: 'auto',
        height: 'calc(100% - 86px)',
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
        p: 0,
        m: 0,
        width: '100%',
        minHeight: 'initial',
        '&:before': {
            opacity: 0,
        },
    },
    accordionOpenedSummary: {
        fontWeight: 'bold',
    },
    groupSummary: {
        borderRadius: '4px',
        p: '2px',
        minHeight: 0,
    },
    groupSummaryExpanded: {
        minHeight: 0,
        mt: 0,
        mb: 0,
        borderTopRightRadius: '4px',
        borderTopLeftRadius: '4px',
        p: '2px',
    },
    blockHeader: (theme: VisTheme) => theme.classes.blockHeader,
    lightedPanel: (theme: VisTheme) => theme.classes.lightedPanel,
    accordionDetails: (theme: VisTheme) => ({
        ...theme.classes.lightedPanel,
        borderRadius: '0 0 4px 4px',
        flexDirection: 'column',
    }),
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
        display: 'block',
        '& label': {
            ml: '32px',
            mt: '-5px',
        },
    },
};

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
    onHide: (hide: boolean) => void;
    changeView: Editor['changeView'];
    changeProject: Editor['changeProject'];
    uninstallWidget: Editor['uninstallWidget'];
    setMarketplaceDialog: Editor['setMarketplaceDialog'];
    updateWidgets: Editor['updateWidgets'];
    widgetsLoaded: boolean;
    socket: LegacyConnection;
    themeType: ThemeType;
    theme: VisTheme;
    editMode: boolean;
    selectedView: string;
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

    private readonly lang: ioBroker.Languages = I18n.getLanguage();

    constructor(props: PaletteProps) {
        super(props);
        const accordionOpenStr = window.localStorage.getItem('widgets');
        let accordionOpen: Record<string, boolean>;
        try {
            accordionOpen = accordionOpenStr ? JSON.parse(accordionOpenStr) : {};
        } catch {
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

    componentDidMount(): void {
        if (this.state.accordionOpen.__marketplace) {
            this.loadMarketplace();
        }
    }

    loadMarketplace(): void {
        if (
            this.state.accordionOpen.__marketplace &&
            window.marketplaceClient &&
            !this.state.marketplaceUpdates &&
            !this.state.marketplaceLoading &&
            !this.marketplaceLoadingStarted
        ) {
            this.marketplaceLoadingStarted = true;
            // load marketplace

            registerRemotes(
                [
                    {
                        name: '__marketplace',
                        entry: `${window.marketplaceClient}/customWidgets.js`,
                        // type: this.props.schema.bundlerType || undefined,
                    },
                ],
                // force: true // may be needed to side-load remotes after the fact.
            );

            this.setState({ marketplaceLoading: true }, () => {
                const tPromise = loadRemote<any>('__marketplace/translations').then((translations: any) =>
                    I18n.extendTranslations(translations.default),
                );

                const mPromise = loadRemote<any>('__marketplace/VisMarketplace').then(
                    marketplace => (window.VisMarketplace = marketplace as Marketplace),
                );

                Promise.all([tPromise, mPromise])
                    .then(async () => {
                        const updates: MarketplaceWidgetRevision[] = [];
                        const deleted = [];
                        const marketplace = store.getState().visProject?.___settings?.marketplace;
                        if (marketplace && window.VisMarketplace?.api) {
                            for (const widget of marketplace) {
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

    buildWidgetList(): void {
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
                widgetSetProps[widgetTypeName] ||= {};
                widgetSetProps[widgetTypeName].developerMode = true;
            }
            if (widgetType.setLabel) {
                widgetSetProps[widgetTypeName] ||= {};
                widgetSetProps[widgetTypeName].label = I18n.t(widgetType.setLabel);
            }
            if (widgetType.setColor) {
                widgetSetProps[widgetTypeName] ||= {};
                widgetSetProps[widgetTypeName].color = widgetType.setColor;
            }
            if (widgetType.setIcon) {
                widgetSetProps[widgetTypeName] ||= {};
                widgetSetProps[widgetTypeName].icon = widgetType.setIcon;
            } else if (widgetType.adapter && !widgetSetProps[widgetTypeName]?.icon) {
                widgetSetProps[widgetTypeName] ||= {};
                if (window.location.port === '3000') {
                    widgetSetProps[widgetTypeName].icon = `./adapter/${widgetType.adapter}/${widgetType.adapter}.png`;
                } else {
                    widgetSetProps[widgetTypeName].icon = `../adapter/${widgetType.adapter}/${widgetType.adapter}.png`;
                }
            }
            if (widgetType.rx) {
                widgetSetProps[widgetTypeName] ||= {};
                widgetSetProps[widgetTypeName].rx = true;
            }
            if (widgetType.version) {
                widgetSetProps[widgetTypeName] ||= {};
                widgetSetProps[widgetTypeName].version = widgetType.version;
            }

            const title = widgetType.label ? I18n.t(widgetType.label) : window.vis._(widgetType.title) || '';
            if (
                widgetType.hidden ||
                (this.state.filter && !title.toLowerCase().includes(this.state.filter.toLowerCase()))
            ) {
                return;
            }

            _widgetsList[widgetTypeName] ||= {};
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
        resultSet.forEach(key => (sorted[key] = _widgetsList[key]));
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

    renderMarketplace(): React.JSX.Element {
        const opened = this.state.accordionOpen.__marketplace;

        return (
            <Accordion
                sx={{
                    ...styles.accordionRoot,
                    '&.Mui-expanded': { margin: 0 },
                }}
                elevation={0}
                expanded={opened || false}
                onChange={(_e, expanded) => {
                    const accordionOpen = JSON.parse(JSON.stringify(this.state.accordionOpen));
                    accordionOpen.__marketplace = expanded;
                    window.localStorage.setItem('widgets', JSON.stringify(accordionOpen));
                    this.setState({ accordionOpen }, () => expanded && this.loadMarketplace());
                }}
            >
                <AccordionSummary
                    id="summary___marketplace"
                    expandIcon={<ExpandMoreIcon />}
                    className={Utils.clsx('vis-palette-widget-set', opened && 'vis-palette-summary-expanded')}
                    sx={{
                        ...Utils.getStyle(
                            this.props.theme,
                            commonStyles.clearPadding,
                            opened ? styles.groupSummaryExpanded : styles.groupSummary,
                            styles.lightedPanel,
                            { minHeight: 0 },
                        ),
                        '& .MuiAccordionSummary-content': {
                            ...commonStyles.clearPadding,
                            ...(opened ? styles.accordionOpenedSummary : undefined),
                        },
                        // '& .MuiAccordionSummary-expandIcon': commonStyles.clearPadding,
                    }}
                >
                    <Icon
                        style={styles.groupIcon}
                        src="img/marketplace.png"
                    />
                    {I18n.t('__marketplace')}
                </AccordionSummary>
                <AccordionDetails sx={styles.accordionDetails}>
                    {opened && this.state.marketplaceLoading ? <LinearProgress /> : null}
                    {opened && this.state.marketplaceUpdates && (
                        <div>
                            <MarketplacePalette setMarketplaceDialog={this.props.setMarketplaceDialog} />
                            {store.getState().visProject.___settings.marketplace?.map(item => (
                                <div key={item.id}>
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
                                </div>
                            ))}
                        </div>
                    )}
                </AccordionDetails>
            </Accordion>
        );
    }

    async toggleDebugVersion(category: string): Promise<void> {
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
                if (
                    Object.keys(wSetObj.common.visWidgets).find(key =>
                        wSetObj.common.visWidgets[key].url?.startsWith('http'),
                    )
                ) {
                    Object.keys(wSetObj.common.visWidgets).forEach(key => {
                        if (typeof wSetObj.common.name === 'object') {
                            wSetObj.common.visWidgets[key].url =
                                `${wSetObj.common.name[this.lang] || wSetObj.common.name.en}/customWidgets.js`;
                        } else {
                            wSetObj.common.visWidgets[key].url = `${wSetObj.common.name}/customWidgets.js`;
                        }
                    });
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
                        Object.keys(visWidgets).forEach(key => {
                            const name: ioBroker.StringOrTranslated = dynamicWidgetInstances[i].common.name;
                            if (typeof name === 'object') {
                                visWidgets[key].url = `${name[this.lang] || name.en}/customWidgets.js`;
                            } else {
                                visWidgets[key].url = `${name}/customWidgets.js`;
                            }
                        });
                        await this.props.socket.setObject(dynamicWidgetInstances[i]._id, dynamicWidgetInstances[i]);
                        reload = true;
                    }
                } else {
                    // check if http://localhost:4173/customWidgets.js available
                    try {
                        await fetch('http://localhost:4173/customWidgets.js');
                        Object.keys(visWidgets).forEach(
                            key => (visWidgets[key].url = 'http://localhost:4173/customWidgets.js'),
                        );
                        await this.props.socket.setObject(wSetObj._id, wSetObj);
                        reload = true;
                    } catch {
                        window.alert(`Please start the widget development of ${wSetObj._id.split('.')[2]} first`);
                    }
                }
            }
        }
        if (reload) {
            setTimeout(() => window.location.reload(), 1000);
        }
    }

    buildListTrigger(immediate?: boolean): void {
        if (this.buildWidgetListTimeout) {
            clearTimeout(this.buildWidgetListTimeout);
            this.buildWidgetListTimeout = null;
        }
        this.buildWidgetListTimeout =
            this.buildWidgetListTimeout ||
            setTimeout(
                () => {
                    this.buildWidgetListTimeout = null;
                    this.buildWidgetList();
                },
                immediate ? 0 : 100,
            );
    }

    render(): React.JSX.Element | null {
        if (!this.props.widgetsLoaded) {
            return null;
        }
        if (!this.state.widgetsList) {
            this.buildListTrigger(true);
            return null;
        }

        const allOpened = !Object.keys(this.state.widgetsList).find(group => !this.state.accordionOpen[group]);
        const allClosed = !Object.keys(this.state.widgetsList).find(group => this.state.accordionOpen[group]);

        return (
            <>
                <Typography
                    variant="h6"
                    gutterBottom
                    sx={Utils.getStyle(this.props.theme, styles.blockHeader, styles.lightedPanel)}
                    style={{ display: 'flex', lineHeight: '34px' }}
                >
                    <IconPalette style={{ marginTop: 4, marginRight: 4 }} />
                    <span style={{ verticalAlign: 'middle' }}>{I18n.t('Palette')}</span>
                    <div style={{ flex: 1 }} />
                    {!allOpened ? (
                        <Tooltip
                            title={I18n.t('Expand all')}
                            slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                        >
                            <IconButton
                                size="small"
                                onClick={() => {
                                    // save the state of marketplace and do not open it if it is not opened
                                    const __marketplace = this.state.accordionOpen.__marketplace;
                                    const accordionOpen: Record<string, boolean> = {};
                                    Object.keys(this.state.widgetsList).forEach(group => (accordionOpen[group] = true));
                                    Object.assign(this.state.accordionOpen, { __marketplace });
                                    window.localStorage.setItem('widgets', JSON.stringify(accordionOpen));
                                    this.setState({ accordionOpen });
                                }}
                            >
                                <UnfoldMoreIcon />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <IconButton
                            size="small"
                            disabled
                        >
                            <UnfoldMoreIcon />
                        </IconButton>
                    )}
                    {!allClosed ? (
                        <Tooltip
                            title={I18n.t('Collapse all')}
                            slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                        >
                            <IconButton
                                size="small"
                                onClick={() => {
                                    const accordionOpen: Record<string, boolean> = {};
                                    Object.keys(this.state.widgetsList).forEach(
                                        group => (accordionOpen[group] = false),
                                    );
                                    Object.assign(this.state.accordionOpen, { __marketplace: false });
                                    window.localStorage.setItem('widgets', JSON.stringify(accordionOpen));
                                    this.setState({ accordionOpen });
                                }}
                            >
                                <UnfoldLessIcon />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <IconButton
                            size="small"
                            disabled
                        >
                            <UnfoldLessIcon />
                        </IconButton>
                    )}
                    <Tooltip
                        title={I18n.t('Hide palette')}
                        slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                    >
                        <IconButton
                            size="small"
                            onClick={() => this.props.onHide(true)}
                        >
                            <ClearIcon />
                        </IconButton>
                    </Tooltip>
                </Typography>
                <TextField
                    variant="standard"
                    fullWidth
                    value={this.state.filter}
                    onChange={e => this.setState({ filter: e.target.value }, () => this.buildListTrigger())}
                    placeholder={I18n.t('Search')}
                    sx={styles.searchLabel}
                    slotProps={{
                        input: {
                            sx: styles.clearPadding,
                            endAdornment: this.state.filter ? (
                                <IconButton
                                    size="small"
                                    onClick={() => this.setState({ filter: '' }, () => this.buildListTrigger())}
                                >
                                    <ClearIcon style={{ width: 22, height: 22 }} />
                                </IconButton>
                            ) : null,
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 10,
                        textAlign: 'center',
                        overflowY: 'auto',
                        height: 'calc(100% - 86px)',
                        opacity: !this.props.editMode ? 0.3 : undefined,
                    }}
                >
                    {/* gap on the very top */}
                    <div style={{ width: '100%' }} />
                    {this.renderMarketplace()}
                    {Object.keys(this.state.widgetsList).map((category, categoryKey) => {
                        let version = null;
                        if (this.state.widgetSetProps[category]?.version) {
                            if (DEVELOPER_MODE) {
                                version = (
                                    <div
                                        style={{
                                            ...styles.version,
                                            cursor: 'pointer',
                                            color: this.state.widgetSetProps[category].developerMode
                                                ? '#ff4242'
                                                : 'inherit',
                                            fontWeight: this.state.widgetSetProps[category].developerMode
                                                ? 'bold'
                                                : 'inherit',
                                        }}
                                        onClick={() => this.toggleDebugVersion(category)}
                                    >
                                        {this.state.widgetSetProps[category]?.version}
                                    </div>
                                );
                            } else {
                                version = (
                                    <div style={styles.version}>{this.state.widgetSetProps[category]?.version}</div>
                                );
                            }
                        }

                        return (
                            <Accordion
                                sx={{
                                    ...styles.accordionRoot,
                                    '&.Mui-expanded': { margin: 0 },
                                }}
                                key={categoryKey}
                                elevation={0}
                                expanded={this.state.accordionOpen[category] || false}
                                onChange={(_e, expanded) => {
                                    const accordionOpen = JSON.parse(JSON.stringify(this.state.accordionOpen));
                                    accordionOpen[category] = expanded;
                                    window.localStorage.setItem('widgets', JSON.stringify(accordionOpen));
                                    this.setState({ accordionOpen });
                                }}
                            >
                                <AccordionSummary
                                    id={`summary_${category}`}
                                    expandIcon={<ExpandMoreIcon />}
                                    className={Utils.clsx(
                                        'vis-palette-widget-set',
                                        this.state.accordionOpen[category] && 'vis-palette-summary-expanded',
                                    )}
                                    sx={{
                                        ...Utils.getStyle(
                                            this.props.theme,
                                            commonStyles.clearPadding,
                                            this.state.accordionOpen[category]
                                                ? styles.groupSummaryExpanded
                                                : styles.groupSummary,
                                            styles.lightedPanel,
                                        ),
                                        '&.Mui-expanded': { minHeight: 0 },
                                        '& .MuiAccordionSummary-content': {
                                            ...commonStyles.clearPadding,
                                            ...(this.state.accordionOpen[category]
                                                ? styles.accordionOpenedSummary
                                                : undefined),
                                        },
                                    }}
                                >
                                    {this.state.widgetSetProps[category]?.icon ? (
                                        <Icon
                                            style={styles.groupIcon}
                                            src={this.state.widgetSetProps[category].icon}
                                        />
                                    ) : null}
                                    {this.state.widgetSetProps[category]?.label
                                        ? this.state.widgetSetProps[category].label.startsWith('Vis 2 - ')
                                            ? this.state.widgetSetProps[category].label.substring(8)
                                            : this.state.widgetSetProps[category].label
                                        : I18n.t(category)}
                                </AccordionSummary>
                                <AccordionDetails sx={styles.accordionDetails}>
                                    {version}
                                    <div>
                                        {this.state.accordionOpen[category]
                                            ? this.state.widgetsList[category].map(widgetItem =>
                                                  widgetItem.name === '_tplGroup' ? null : (
                                                      <Widget
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
                                                      />
                                                  ),
                                              )
                                            : null}
                                    </div>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </div>
            </>
        );
    }
}

export default Palette;
