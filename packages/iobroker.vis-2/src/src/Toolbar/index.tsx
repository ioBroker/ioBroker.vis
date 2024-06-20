import React, { useRef, useState } from 'react';

import {
    IconButton,
    Tooltip,
    Menu as DropMenu,
    MenuItem as DropMenuItem,
} from '@mui/material';

import type { CSSProperties, Styles } from '@mui/styles';
import { withStyles } from '@mui/styles';

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
    IobTheme,
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

import type { EditorClass } from '@/Editor';
import type { AnyWidgetId, GroupWidgetId } from '@iobroker/types-vis-2';
import Views from './Views';
import Widgets from './Widgets';
import Projects from './Projects';

const styles: Styles<IobTheme & {classes: Record<string, CSSProperties>} | any, any> = theme => ({
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
    lightedPanel: theme.classes.lightedPanel,
    toolbar: theme.classes.toolbar,
    narrowToolbar: {
        paddingTop: 4,
        paddingBottom: 4,
    },
    tooltip: {
        pointerEvents: 'none',
    },
    heightButton: {

    },
    '@keyframes blink': {
        '0%': {
            opacity: 1,
        },
        '50%': {
            opacity: 0,
        },
        '100%': {
            opacity: 1,
        },
    },
    saveIcon: {
        animation: `blink 2000ms ${theme.transitions.easing.easeInOut}`,
        color: theme.palette.primary.main,
    },
    version: {
        fontStyle: 'italic',
        marginRight: 10,
        opacity: 0.7,
        fontSize: 10,
        textAlign: 'right',
    },
});

interface ToolbarProps {
    classes: Record<string, string>;
    currentUser: Record<string, any>;
    needSave: boolean;
    socket: LegacyConnection;
    toggleTheme: EditorClass['toggleTheme'];
    themeName: ThemeName;
    themeType: ThemeType;
    editMode: boolean;
    selectedGroup: GroupWidgetId;
    setToolbarHeight: (value: 'narrow' | 'veryNarrow' | 'full') => void;
    projectsDialog: boolean;
    setProjectsDialog: EditorClass['setProjectsDialog'];
    toolbarHeight: 'full' | 'narrow' | 'veryNarrow';
    adapterName: string;
    instance: number;
    projectName: string;
    version: string;
    setSelectedWidgets: EditorClass['setSelectedWidgets'];
    selectedView: string;
    changeProject: EditorClass['changeProject'];
    changeView: EditorClass['changeView'];
    viewsManager: boolean;
    setViewsManager: EditorClass['setViewsManager'];
    toggleView: EditorClass['toggleView'];
    alignWidgets: EditorClass['alignWidgets'];
    cloneWidgets: EditorClass['cloneWidgets'];
    copyWidgets: EditorClass['copyWidgets'];
    cutWidgets: EditorClass['cutWidgets'];
    deleteWidgets: EditorClass['deleteWidgets'];
    history: EditorClass['state']['history'];
    historyCursor: EditorClass['state']['historyCursor'];
    lockDragging: boolean;
    openedViews: string[];
    orderWidgets: EditorClass['orderWidgets'];
    pasteWidgets: EditorClass['pasteWidgets'];
    redo: EditorClass['redo'];
    selectedWidgets: AnyWidgetId[];
    toggleLockDragging: EditorClass['toggleLockDragging'];
    toggleWidgetHint: EditorClass['toggleWidgetHint'];
    undo: EditorClass['undo'];
    widgetHint: string;
    widgetsClipboard: EditorClass['state']['widgetsClipboard'];
    widgetsLoaded: boolean;
    addProject: EditorClass['addProject'];
    deleteProject: EditorClass['deleteProject'];
    loadProject: EditorClass['loadProject'];
    projects: string[];
    refreshProjects: EditorClass['refreshProjects'];
    renameProject: EditorClass['renameProject'];
}

const Toolbar: React.FC<ToolbarProps> = props => {
    const { classes } = props;
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
            <CloseIcon />
            {I18n.t('Close editor')}
        </DropMenuItem>
        <DropMenuItem onClick={() => {
            window.localStorage.setItem('Vis.lastCommand', 'open');
            setLastCommand('open');
            setRight(false);
            window.open(runtimeURL, 'vis-2.runtime');
        }}
        >
            <PlayArrowIcon />
            {I18n.t('Open runtime in new window')}
        </DropMenuItem>
        <DropMenuItem onClick={onReload}>
            <SyncIcon />
            {I18n.t('Reload all runtimes')}
        </DropMenuItem>
    </DropMenu>;

    let heightButton;
    if (props.toolbarHeight === 'narrow') {
        heightButton = <Tooltip title={I18n.t('Narrow panel')}>
            <IconButton
                className={classes.heightButton}
                onClick={() => props.setToolbarHeight('veryNarrow')}
            >
                <HeightNarrowIcon />
            </IconButton>
        </Tooltip>;
    } else if (props.toolbarHeight === 'veryNarrow') {
        heightButton = <Tooltip title={I18n.t('Full panel')}>
            <IconButton
                className={classes.heightButton}
                onClick={() => props.setToolbarHeight('full')}
            >
                <HeightVeryNarrowIcon />
            </IconButton>
        </Tooltip>;
    } else {
        heightButton = <Tooltip title={I18n.t('Hide panel names')}>
            <IconButton
                className={classes.heightButton}
                onClick={() => props.setToolbarHeight('narrow')}
            >
                <HeightFullIcon />
            </IconButton>
        </Tooltip>;
    }

    const currentUser = props.currentUser ?
        <div className={classes.rightBlock}>
            {props.currentUser?.common?.icon ? <Icon src={props.currentUser?.common?.icon || ''} className={classes.icon} /> : <PersonIcon fontSize="small" />}
            <span style={{ paddingRight: 8, marginLeft: 8 }}>
                { Utils.getObjectNameFromObj(props.currentUser, lang) }
            </span>
            { props.socket.isSecure
                ? <Tooltip title={I18n.t('Exit')} classes={{ popper: classes.tooltip }}>
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
        lastCommandButton = <Tooltip title={I18n.t('Close editor')} classes={{ popper: classes.tooltip }}>
            <IconButton size="small" onClick={() => window.location.href = runtimeURL}>
                <CloseIcon />
            </IconButton>
        </Tooltip>;
    } else if (lastCommand === 'open') {
        lastCommandButton = <Tooltip title={I18n.t('Open runtime in new window')} classes={{ popper: classes.tooltip }}>
            <IconButton size="small" onClick={() => window.open(runtimeURL, 'vis-2.runtime')}>
                <PlayArrowIcon />
            </IconButton>
        </Tooltip>;
    } else if (lastCommand === 'reload') {
        lastCommandButton = <Tooltip title={I18n.t('Reload all runtimes')} classes={{ popper: classes.tooltip }}>
            <IconButton size="small" onClick={onReload}>
                <SyncIcon />
            </IconButton>
        </Tooltip>;
    }

    return <div className={classes.lightedPanel}>
        <span className={classes.right}>
            <div className={classes.rightBlock}>
                {props.needSave ? <SaveIcon fontSize={20 as any} className={classes.saveIcon} /> : null}
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
            {props.toolbarHeight === 'full' && props.version ? <span className={props.classes.version}>
                v
                {props.version}
            </span> : null}
        </span>
        <div className={Utils.clsx(classes.toolbar, props.toolbarHeight !== 'full' && classes.narrowToolbar)} style={{ alignItems: 'initial' }}>
            <Views
                classes={{}}
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
                toggleLockDragging={props.toggleLockDragging}
                toggleWidgetHint={props.toggleWidgetHint}
                undo={props.undo}
                widgetHint={props.widgetHint}
                widgetsClipboard={props.widgetsClipboard}
                widgetsLoaded={props.widgetsLoaded}
            />
            <Projects
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
        </div>
    </div>;
};

export default withStyles(styles)(Toolbar) as React.FC<ToolbarProps>;
