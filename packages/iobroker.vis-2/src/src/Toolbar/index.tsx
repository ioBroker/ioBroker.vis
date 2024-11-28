import React, { useRef, useState } from 'react';

import {
    IconButton,
    Tooltip,
    Menu as DropMenu,
    MenuItem as DropMenuItem, Box,
} from '@mui/material';

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

import type {
    LegacyConnection,
    ThemeName,
    ThemeType,
} from '@iobroker/adapter-react-v5';
import {
    Icon,
    Utils,
    I18n,
    ToggleThemeMenu,
} from '@iobroker/adapter-react-v5';

import type Editor from '@/Editor';
import commonStyles from '@/Utils/styles';
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
    heightButton: {

    },
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

const Toolbar = (props: ToolbarProps): React.JSX.Element => {
    const [right, setRight] = useState(false);
    const [lastCommand, setLastCommand] = useState(window.localStorage.getItem('Vis.lastCommand') || 'close');
    const rightRef = useRef(null);

    const lang = I18n.getLanguage();

    const runtimeURL = window.location.pathname.endsWith('/edit.html') ?
        `./?${props.projectName}#${props.selectedView}`
        :
        `?${props.projectName}&runtime=true#${props.selectedView}`;

    const onReload = () => {
        window.localStorage.setItem('Vis.lastCommand', 'reload');
        setLastCommand('reload');
        props.socket.setState(`${props.adapterName}.${props.instance}.control.instance`, { val: '*', ack: true });
        props.socket.setState(`${props.adapterName}.${props.instance}.control.data`, { val: null, ack: true });
        props.socket.setState(`${props.adapterName}.${props.instance}.control.command`, { val: 'refresh', ack: true });
        setRight(false);
    };

    const dropMenu = <DropMenu
        open={right}
        anchorEl={rightRef.current}
        onClose={() => setRight(false)}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
        }}
        // getContentAnchorEl={null}
    >
        <DropMenuItem onClick={() => {
            window.localStorage.setItem('Vis.lastCommand', 'close');
            setLastCommand('close');
            setRight(false);
            window.location.href = runtimeURL;
        }}
        >
            <CloseIcon style={{ marginRight: 8, color: props.themeType === 'dark' ? '#6388fd' : '#5fa5fe' }} />
            {I18n.t('Close editor')}
        </DropMenuItem>
        <DropMenuItem onClick={() => {
            window.localStorage.setItem('Vis.lastCommand', 'open');
            setLastCommand('open');
            setRight(false);
            window.open(runtimeURL, 'vis-2.runtime');
        }}
        >
            <PlayArrowIcon style={{ marginRight: 8, color: props.themeType === 'dark' ? '#50ff50' : '#008800' }} />
            {I18n.t('Open runtime in new window')}
        </DropMenuItem>
        <DropMenuItem onClick={onReload}>
            <SyncIcon style={{ marginRight: 8, color: props.themeType === 'dark' ? '#ffa947' : '#884900' }} />
            {I18n.t('Reload all runtimes')}
        </DropMenuItem>
    </DropMenu>;

    let heightButton;
    if (props.toolbarHeight === 'narrow') {
        heightButton = <Tooltip title={I18n.t('Narrow panel')} componentsProps={{ popper: { sx: commonStyles.tooltip } }}>
            <IconButton
                style={styles.heightButton}
                onClick={() => props.setToolbarHeight('veryNarrow')}
            >
                <HeightNarrowIcon />
            </IconButton>
        </Tooltip>;
    } else if (props.toolbarHeight === 'veryNarrow') {
        heightButton = <Tooltip title={I18n.t('Full panel')} componentsProps={{ popper: { sx: commonStyles.tooltip } }}>
            <IconButton
                style={styles.heightButton}
                onClick={() => props.setToolbarHeight('full')}
            >
                <HeightVeryNarrowIcon />
            </IconButton>
        </Tooltip>;
    } else {
        heightButton = <Tooltip title={I18n.t('Hide panel names')} componentsProps={{ popper: { sx: commonStyles.tooltip } }}>
            <IconButton
                style={styles.heightButton}
                onClick={() => props.setToolbarHeight('narrow')}
            >
                <HeightFullIcon />
            </IconButton>
        </Tooltip>;
    }

    const currentUser = props.currentUser ?
        <div style={styles.rightBlock}>
            {props.currentUser?.common?.icon ? <Icon src={props.currentUser?.common?.icon || ''} style={styles.icon} /> : <PersonIcon fontSize="small" />}
            <span style={{ paddingRight: 8, marginLeft: 8 }}>
                { Utils.getObjectNameFromObj(props.currentUser, lang) }
            </span>
            { props.socket.isSecure
                ? <Tooltip title={I18n.t('Exit')} componentsProps={{ popper: { sx: commonStyles.tooltip } }}>
                    <IconButton
                        size="small"
                        onClick={async () => {
                            try {
                                await props.socket.logout();
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
                : null}
        </div>
        :
        null;

    let lastCommandButton;
    if (lastCommand === 'close') {
        lastCommandButton = <Tooltip title={I18n.t('Close editor')} componentsProps={{ popper: { sx: commonStyles.tooltip } }}>
            <IconButton size="small" onClick={() => window.location.href = runtimeURL}>
                <CloseIcon style={{ color: props.themeType === 'dark' ? '#6388fd' : '#5fa5fe' }} />
            </IconButton>
        </Tooltip>;
    } else if (lastCommand === 'open') {
        lastCommandButton = <Tooltip title={I18n.t('Open runtime in new window')} componentsProps={{ popper: { sx: commonStyles.tooltip } }}>
            <IconButton size="small" onClick={() => window.open(runtimeURL, 'vis-2.runtime')}>
                <PlayArrowIcon style={{ color: props.themeType === 'dark' ? '#50ff50' : '#008800' }} />
            </IconButton>
        </Tooltip>;
    } else if (lastCommand === 'reload') {
        lastCommandButton = <Tooltip title={I18n.t('Reload all runtimes')} componentsProps={{ popper: { sx: commonStyles.tooltip } }}>
            <IconButton size="small" onClick={onReload}>
                <SyncIcon style={{ color: props.themeType === 'dark' ? '#ffa947' : '#884900' }} />
            </IconButton>
        </Tooltip>;
    }

    return <Box component="div" sx={styles.lightedPanel}>
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
        <span style={styles.right}>
            <div style={styles.rightBlock}>
                {props.needSave ? <SaveIcon fontSize="small" style={Utils.getStyle(props.theme, styles.saveIcon)} /> : null}
                {props.toolbarHeight === 'veryNarrow' ? currentUser : null}
                {heightButton}
                <ToggleThemeMenu
                    toggleTheme={props.toggleTheme}
                    themeName={props.themeName as any}
                    t={I18n.t}
                />
                {lastCommandButton}
                <IconButton ref={rightRef} onClick={() => setRight(!right)} size="small">
                    <ArrowDropDownIcon />
                </IconButton>
                {dropMenu}
            </div>
            {props.toolbarHeight !== 'veryNarrow' ? currentUser : null}
            {props.toolbarHeight === 'full' && props.version ? <span style={styles.version}>
                v
                {props.version}
            </span> : null}
        </span>
        <Box
            component="div"
            sx={Utils.getStyle(props.theme, styles.toolbar, props.toolbarHeight !== 'full' && styles.narrowToolbar)}
            style={{ alignItems: 'initial' }}
        >
            <Views
                toolbarHeight={props.toolbarHeight}
                changeProject={props.changeProject}
                changeView={props.changeView}
                editMode={props.editMode}
                projectName={props.projectName}
                selectedGroup={props.selectedGroup}
                selectedView={props.selectedView}
                setProjectsDialog={props.setProjectsDialog}
                setSelectedWidgets={props.setSelectedWidgets}
                setViewsManager={props.setViewsManager}
                themeName={props.themeName}
                themeType={props.themeType}
                theme={props.theme}
                toggleView={props.toggleView}
                viewsManager={props.viewsManager}
            />
            <Widgets
                toolbarHeight={props.toolbarHeight}
                alignWidgets={props.alignWidgets}
                changeProject={props.changeProject}
                cloneWidgets={props.cloneWidgets}
                copyWidgets={props.copyWidgets}
                cutWidgets={props.cutWidgets}
                deleteWidgets={props.deleteWidgets}
                editMode={props.editMode}
                history={props.history}
                historyCursor={props.historyCursor}
                lockDragging={props.lockDragging}
                openedViews={props.openedViews}
                orderWidgets={props.orderWidgets}
                pasteWidgets={props.pasteWidgets}
                redo={props.redo}
                selectedGroup={props.selectedGroup}
                selectedView={props.selectedView}
                selectedWidgets={props.selectedWidgets}
                setSelectedWidgets={props.setSelectedWidgets}
                themeType={props.themeType}
                theme={props.theme}
                toggleLockDragging={props.toggleLockDragging}
                toggleWidgetHint={props.toggleWidgetHint}
                undo={props.undo}
                widgetHint={props.widgetHint}
                widgetsClipboard={props.widgetsClipboard}
                widgetsLoaded={props.widgetsLoaded}
            />
            <Projects
                theme={props.theme}
                toolbarHeight={props.toolbarHeight}
                adapterName={props.adapterName}
                changeProject={props.changeProject}
                instance={props.instance}
                projectName={props.projectName}
                projectsDialog={props.projectsDialog}
                selectedView={props.selectedView}
                setProjectsDialog={props.setProjectsDialog}
                setSelectedWidgets={props.setSelectedWidgets}
                socket={props.socket}
                themeType={props.themeType}
                addProject={props.addProject}
                deleteProject={props.deleteProject}
                loadProject={props.loadProject}
                projects={props.projects}
                refreshProjects={props.refreshProjects}
                renameProject={props.renameProject}
            />
        </Box>
    </Box>;
};

export default Toolbar;
