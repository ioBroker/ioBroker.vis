import PropTypes from 'prop-types';
import {
    IconButton,
    Tooltip,
    Menu as DropMenu,
    MenuItem as DropMenuItem,
} from '@mui/material';

import withStyles from '@mui/styles/withStyles';

import { useRef, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import SyncIcon from '@mui/icons-material/Sync';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HeightFullIcon from '@mui/icons-material/KeyboardArrowUp';
import HeightNarrowIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import HeightVeryNarrowIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import SaveIcon from '@mui/icons-material/Save';

import {
    Icon,
    Utils,
    I18n,
    ToggleThemeMenu,
} from '@iobroker/adapter-react-v5';

import Views from './Views';
import Widgets from './Widgets';
import Projects from './Projects';

const styles = theme => ({
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

const Toolbar = props => {
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
        getContentAnchorEl={null}
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
                {props.needSave ? <SaveIcon size={20} className={classes.saveIcon} /> : null}
                {props.toolbarHeight === 'veryNarrow' ? currentUser : null}
                {heightButton}
                <ToggleThemeMenu
                    toggleTheme={props.toggleTheme}
                    themeName={props.themeName}
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
            <Views {...props} classes={{}} toolbarHeight={props.toolbarHeight} />
            <Widgets {...props} classes={{}} toolbarHeight={props.toolbarHeight} />
            <Projects {...props} classes={{}} toolbarHeight={props.toolbarHeight} />
        </div>
    </div>;
};

Toolbar.propTypes = {
    classes: PropTypes.object,
    currentUser: PropTypes.object,
    needSave: PropTypes.bool,
    socket: PropTypes.object,
    toggleTheme: PropTypes.func,
    themeName: PropTypes.string,
    themeType: PropTypes.string,
    editMode: PropTypes.bool,
    selectedGroup: PropTypes.string,
    setToolbarHeight: PropTypes.func,
    projectsDialog: PropTypes.bool,
    setProjectsDialog: PropTypes.func,
    toolbarHeight: PropTypes.string,
    adapterName: PropTypes.string,
    instance: PropTypes.number,
    projectName: PropTypes.string,
    version: PropTypes.string,
    setSelectedWidgets: PropTypes.func.isRequired,
};

export default withStyles(styles)(Toolbar);
