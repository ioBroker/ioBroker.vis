import React from 'react';

import { IconButton, Tooltip, Menu as DropMenu, MenuItem as DropMenuItem, Box, LinearProgress } from '@mui/material';

import {
    Close as CloseIcon,
    Sync as SyncIcon,
    PlayArrow as PlayArrowIcon,
    ArrowDropDown as ArrowDropDownIcon,
    Person as PersonIcon,
    ExitToApp as ExitToAppIcon,
    KeyboardArrowUp as HeightFullIcon,
    KeyboardDoubleArrowUp as HeightNarrowIcon,
    KeyboardDoubleArrowDown as HeightVeryNarrowIcon,
    Save as SaveIcon,
} from '@mui/icons-material';

import {
    Icon,
    Utils,
    I18n,
    ToggleThemeMenu,
    type LegacyConnection,
    type ThemeName,
    type ThemeType,
} from '@iobroker/adapter-react-v5';

import type Editor from '@/Editor';
import type { AnyWidgetId, GroupWidgetId, VisTheme } from '@iobroker/types-vis-2';
import Views from './Views';
import Widgets from './Widgets';
import Projects from './Projects';

const styles: Record<string, any> = {
    text: {
        paddingRight: 4,
    },
    button: {
        margin: 4,
    },
    textInput: {
        margin: '0px 4px',
        width: 120,
    },
    right: {
        float: 'right',
        display: 'inline-flex',
        flexDirection: 'column',
        position: 'relative',
    },
    rightBlock: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'end',
    },
    icon: {
        width: 22,
        height: 22,
    },
    lightedPanel: (theme: VisTheme): React.CSSProperties => theme.classes.lightedPanel,
    toolbar: (theme: VisTheme): React.CSSProperties => theme.classes.toolbar,
    narrowToolbar: {
        pt: '4px',
        pb: '4px',
    },
    heightButton: {},
    saveIcon: (theme: VisTheme): React.CSSProperties => ({
        animation: `blink 2000ms ${theme.transitions.easing.easeInOut}`,
        color: theme.palette.primary.main,
    }),
    version: {
        fontStyle: 'italic',
        marginRight: 10,
        opacity: 0.7,
        fontSize: 10,
        textAlign: 'right',
    },
};

interface ToolbarProps {
    adapterName: string;
    addProject: Editor['addProject'];
    alignWidgets: Editor['alignWidgets'];
    changeProject: Editor['changeProject'];
    changeView: Editor['changeView'];
    cloneWidgets: Editor['cloneWidgets'];
    copyWidgets: Editor['copyWidgets'];
    currentUser: Record<string, any>;
    cutWidgets: Editor['cutWidgets'];
    deleteProject: Editor['deleteProject'];
    deleteWidgets: Editor['deleteWidgets'];
    editMode: boolean;
    history: Editor['state']['history'];
    historyCursor: Editor['state']['historyCursor'];
    instance: number;
    loadProject: Editor['loadProject'];
    lockDragging: boolean;
    needSave: boolean;
    openedViews: string[];
    orderWidgets: Editor['orderWidgets'];
    pasteWidgets: Editor['pasteWidgets'];
    projectName: string;
    projects: string[];
    projectsDialog: boolean;
    redo: Editor['redo'];
    refreshProjects: Editor['refreshProjects'];
    renameProject: Editor['renameProject'];
    selectedGroup: GroupWidgetId;
    selectedView: string;
    selectedWidgets: AnyWidgetId[];
    setProjectsDialog: Editor['setProjectsDialog'];
    setSelectedWidgets: Editor['setSelectedWidgets'];
    setToolbarHeight: (value: 'narrow' | 'veryNarrow' | 'full') => void;
    setViewsManager: Editor['setViewsManager'];
    socket: LegacyConnection;
    theme: VisTheme;
    themeName: ThemeName;
    themeType: ThemeType;
    toggleLockDragging: Editor['toggleLockDragging'];
    toggleTheme: Editor['toggleTheme'];
    toggleView: Editor['toggleView'];
    toggleWidgetHint: Editor['toggleWidgetHint'];
    toolbarHeight: 'full' | 'narrow' | 'veryNarrow';
    undo: Editor['undo'];
    version: string;
    viewsManager: boolean;
    widgetHint: string;
    widgetsClipboard: Editor['state']['widgetsClipboard'];
    widgetsLoaded: boolean;
}

interface ToolbarState {
    right: boolean;
    lastCommand: string;
    upload: number;
}

class Toolbar extends React.Component<ToolbarProps, ToolbarState> {
    private readonly rightRef: React.RefObject<HTMLButtonElement>;
    private readonly lang: ioBroker.Languages;
    private readonly runtimeURL: string;

    constructor(props: ToolbarProps) {
        super(props);
        this.state = {
            right: false,
            lastCommand: window.localStorage.getItem('Vis.lastCommand') || 'close',
            upload: 0,
        };
        this.rightRef = React.createRef();
        this.lang = I18n.getLanguage();
        this.runtimeURL = window.location.pathname.endsWith('/edit.html')
            ? `./?${props.projectName}#${props.selectedView}`
            : `?${props.projectName}&runtime=true#${props.selectedView}`;
    }

    componentDidMount(): void {
        void this.props.socket.subscribeState(`system.adapter.${this.props.adapterName}.upload`, this.onUpload);
    }

    componentWillUnmount(): void {
        void this.props.socket.unsubscribeState(`system.adapter.${this.props.adapterName}.upload`, this.onUpload);
    }

    onUpload = (_id: string, state: ioBroker.State | null | undefined): void => {
        if (state?.val || state?.val === 0) {
            this.setState({ upload: state.val as number });
        }
    };

    async onReload(): Promise<void> {
        window.localStorage.setItem('Vis.lastCommand', 'reload');
        await this.props.socket.setState(`${this.props.adapterName}.${this.props.instance}.control.instance`, {
            val: '*',
            ack: true,
        });
        await this.props.socket.setState(`${this.props.adapterName}.${this.props.instance}.control.data`, {
            val: null,
            ack: true,
        });
        await this.props.socket.setState(`${this.props.adapterName}.${this.props.instance}.control.command`, {
            val: 'refresh',
            ack: true,
        });
        this.setState({ right: false, lastCommand: 'reload' });
    }

    renderDropMenu(): React.JSX.Element {
        return (
            <DropMenu
                open={this.state.right}
                anchorEl={this.rightRef.current}
                onClose={() => this.setState({ right: false })}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                // getContentAnchorEl={null}
            >
                <DropMenuItem
                    onClick={() => {
                        window.localStorage.setItem('Vis.lastCommand', 'close');
                        this.setState({ lastCommand: 'close', right: false });
                        window.location.href = this.runtimeURL;
                    }}
                >
                    <CloseIcon
                        style={{ marginRight: 8, color: this.props.themeType === 'dark' ? '#6388fd' : '#5fa5fe' }}
                    />
                    {I18n.t('Close editor')}
                </DropMenuItem>
                <DropMenuItem
                    onClick={() => {
                        window.localStorage.setItem('Vis.lastCommand', 'open');
                        this.setState({ lastCommand: 'open', right: false });
                        window.open(this.runtimeURL, 'vis-2.runtime');
                    }}
                >
                    <PlayArrowIcon
                        style={{ marginRight: 8, color: this.props.themeType === 'dark' ? '#50ff50' : '#008800' }}
                    />
                    {I18n.t('Open runtime in new window')}
                </DropMenuItem>
                <DropMenuItem onClick={() => this.onReload()}>
                    <SyncIcon
                        style={{ marginRight: 8, color: this.props.themeType === 'dark' ? '#ffa947' : '#884900' }}
                    />
                    {I18n.t('Reload all runtimes')}
                </DropMenuItem>
            </DropMenu>
        );
    }

    renderUserPart(): React.JSX.Element {
        let heightButton: React.JSX.Element;

        if (this.props.toolbarHeight === 'narrow') {
            heightButton = (
                <Tooltip
                    title={I18n.t('Narrow panel')}
                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                >
                    <IconButton
                        style={styles.heightButton}
                        onClick={() => this.props.setToolbarHeight('veryNarrow')}
                    >
                        <HeightNarrowIcon />
                    </IconButton>
                </Tooltip>
            );
        } else if (this.props.toolbarHeight === 'veryNarrow') {
            heightButton = (
                <Tooltip
                    title={I18n.t('Full panel')}
                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                >
                    <IconButton
                        style={styles.heightButton}
                        onClick={() => this.props.setToolbarHeight('full')}
                    >
                        <HeightVeryNarrowIcon />
                    </IconButton>
                </Tooltip>
            );
        } else {
            heightButton = (
                <Tooltip
                    title={I18n.t('Hide panel names')}
                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                >
                    <IconButton
                        style={styles.heightButton}
                        onClick={() => this.props.setToolbarHeight('narrow')}
                    >
                        <HeightFullIcon />
                    </IconButton>
                </Tooltip>
            );
        }

        const currentUser: React.JSX.Element = this.props.currentUser ? (
            <div style={styles.rightBlock}>
                {this.props.currentUser?.common?.icon ? (
                    <Icon
                        src={this.props.currentUser?.common?.icon || ''}
                        style={styles.icon}
                    />
                ) : (
                    <PersonIcon fontSize="small" />
                )}
                <span style={{ paddingRight: 8, marginLeft: 8 }}>
                    {Utils.getObjectNameFromObj(this.props.currentUser, this.lang)}
                </span>
                {this.props.socket.isSecure ? (
                    <Tooltip
                        title={I18n.t('Exit')}
                        slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                    >
                        <IconButton
                            size="small"
                            onClick={async () => {
                                try {
                                    await this.props.socket.logout();
                                } catch (e) {
                                    console.error(e);
                                    return;
                                }
                                window.location.reload();
                            }}
                        >
                            <ExitToAppIcon />
                        </IconButton>
                    </Tooltip>
                ) : null}
            </div>
        ) : null;

        let lastCommandButton: React.JSX.Element;
        if (this.state.lastCommand === 'close') {
            lastCommandButton = (
                <Tooltip
                    title={I18n.t('Close editor')}
                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                >
                    <IconButton
                        size="small"
                        onClick={() => (window.location.href = this.runtimeURL)}
                    >
                        <CloseIcon style={{ color: this.props.themeType === 'dark' ? '#6388fd' : '#5fa5fe' }} />
                    </IconButton>
                </Tooltip>
            );
        } else if (this.state.lastCommand === 'open') {
            lastCommandButton = (
                <Tooltip
                    title={I18n.t('Open runtime in new window')}
                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                >
                    <IconButton
                        size="small"
                        onClick={() => window.open(this.runtimeURL, 'vis-2.runtime')}
                    >
                        <PlayArrowIcon style={{ color: this.props.themeType === 'dark' ? '#50ff50' : '#008800' }} />
                    </IconButton>
                </Tooltip>
            );
        } else if (this.state.lastCommand === 'reload') {
            lastCommandButton = (
                <Tooltip
                    title={I18n.t('Reload all runtimes')}
                    slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                >
                    <IconButton
                        size="small"
                        onClick={() => void this.onReload()}
                    >
                        <SyncIcon style={{ color: this.props.themeType === 'dark' ? '#ffa947' : '#884900' }} />
                    </IconButton>
                </Tooltip>
            );
        }

        return (
            <span style={styles.right}>
                {this.state.upload ? (
                    <LinearProgress
                        variant="determinate"
                        value={this.state.upload}
                        style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
                    />
                ) : null}
                <div style={styles.rightBlock}>
                    {this.props.needSave ? (
                        <SaveIcon
                            fontSize="small"
                            style={Utils.getStyle(this.props.theme, styles.saveIcon)}
                        />
                    ) : null}
                    {this.props.toolbarHeight === 'veryNarrow' ? currentUser : null}
                    {heightButton}
                    <ToggleThemeMenu
                        toggleTheme={this.props.toggleTheme}
                        themeName={this.props.themeName as any}
                        t={I18n.t}
                    />
                    {lastCommandButton}
                    <IconButton
                        ref={this.rightRef}
                        onClick={() => this.setState({ right: !this.state.right })}
                        size="small"
                    >
                        <ArrowDropDownIcon />
                    </IconButton>
                    {this.renderDropMenu()}
                </div>
                {this.props.toolbarHeight !== 'veryNarrow' ? currentUser : null}
                {this.props.toolbarHeight === 'full' && this.props.version ? (
                    <span style={styles.version}>v{this.props.version}</span>
                ) : null}
            </span>
        );
    }

    render(): React.JSX.Element {
        return (
            <Box
                component="div"
                sx={styles.lightedPanel}
            >
                <style>
                    {`
                @keyframes blink {
                    0% {
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                    }
                }
            `}
                </style>
                {this.renderUserPart()}
                <Box
                    component="div"
                    sx={Utils.getStyle(
                        this.props.theme,
                        styles.toolbar,
                        this.props.toolbarHeight !== 'full' && styles.narrowToolbar,
                    )}
                    style={{ alignItems: 'initial' }}
                >
                    <Views
                        toolbarHeight={this.props.toolbarHeight}
                        changeProject={this.props.changeProject}
                        changeView={this.props.changeView}
                        editMode={this.props.editMode}
                        projectName={this.props.projectName}
                        selectedGroup={this.props.selectedGroup}
                        selectedView={this.props.selectedView}
                        setProjectsDialog={this.props.setProjectsDialog}
                        setSelectedWidgets={this.props.setSelectedWidgets}
                        setViewsManager={this.props.setViewsManager}
                        themeName={this.props.themeName}
                        themeType={this.props.themeType}
                        theme={this.props.theme}
                        toggleView={this.props.toggleView}
                        viewsManager={this.props.viewsManager}
                    />
                    <Widgets
                        toolbarHeight={this.props.toolbarHeight}
                        alignWidgets={this.props.alignWidgets}
                        changeProject={this.props.changeProject}
                        cloneWidgets={this.props.cloneWidgets}
                        copyWidgets={this.props.copyWidgets}
                        cutWidgets={this.props.cutWidgets}
                        deleteWidgets={this.props.deleteWidgets}
                        editMode={this.props.editMode}
                        history={this.props.history}
                        historyCursor={this.props.historyCursor}
                        lockDragging={this.props.lockDragging}
                        openedViews={this.props.openedViews}
                        orderWidgets={this.props.orderWidgets}
                        pasteWidgets={this.props.pasteWidgets}
                        redo={this.props.redo}
                        selectedGroup={this.props.selectedGroup}
                        selectedView={this.props.selectedView}
                        selectedWidgets={this.props.selectedWidgets}
                        setSelectedWidgets={this.props.setSelectedWidgets}
                        themeType={this.props.themeType}
                        theme={this.props.theme}
                        toggleLockDragging={this.props.toggleLockDragging}
                        toggleWidgetHint={this.props.toggleWidgetHint}
                        undo={this.props.undo}
                        widgetHint={this.props.widgetHint}
                        widgetsClipboard={this.props.widgetsClipboard}
                        widgetsLoaded={this.props.widgetsLoaded}
                    />
                    <Projects
                        theme={this.props.theme}
                        toolbarHeight={this.props.toolbarHeight}
                        adapterName={this.props.adapterName}
                        changeProject={this.props.changeProject}
                        instance={this.props.instance}
                        projectName={this.props.projectName}
                        projectsDialog={this.props.projectsDialog}
                        selectedView={this.props.selectedView}
                        setProjectsDialog={this.props.setProjectsDialog}
                        setSelectedWidgets={this.props.setSelectedWidgets}
                        socket={this.props.socket}
                        themeType={this.props.themeType}
                        addProject={this.props.addProject}
                        deleteProject={this.props.deleteProject}
                        loadProject={this.props.loadProject}
                        projects={this.props.projects}
                        refreshProjects={this.props.refreshProjects}
                        renameProject={this.props.renameProject}
                    />
                </Box>
            </Box>
        );
    }
}

export default Toolbar;
