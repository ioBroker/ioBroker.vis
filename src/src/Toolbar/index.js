import PropTypes from 'prop-types';
import {
    IconButton, Tooltip, withStyles,
    Menu as DropMenu, MenuItem as DropMenuItem, CircularProgress,
} from '@material-ui/core';

import { useRef, useState } from 'react';

import CloseIcon from '@material-ui/icons/Close';
import SyncIcon from '@material-ui/icons/Sync';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import PersonIcon from '@material-ui/icons/Person';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import I18n from '@iobroker/adapter-react/i18n';
import ToggleThemeMenu from '@iobroker/adapter-react/Components/ToggleThemeMenu';

import Views from './Views';
import Widgets from './Widgets';
import Projects from './Projects';

const styles = () => ({
    text: { paddingRight: 4 },
    button: { margin: 4 },
    textInput: { margin: '0px 4px', width: 120 },
    right: { float: 'right', display: 'inline-flex', flexDirection: 'column' },
    rightBlock: { display: 'flex', alignItems: 'center', justifyContent: 'end' },
});

const Toolbar = props => {
    const [right, setRight] = useState(false);
    const rightRef = useRef(null);

    return <div className={props.classes.lightedPanel}>
        <span className={props.classes.right}>
            <div className={props.classes.rightBlock}>
                {props.needSave ? <CircularProgress size={20} /> : null}
                <ToggleThemeMenu
                    toggleTheme={props.toggleTheme}
                    themeName={props.themeName}
                    t={I18n.t} />
                <Tooltip title={I18n.t('Close editor')}>
                    <IconButton
                        size="small"
                        onClick={() => {
                            window.location.href = `${window.location.protocol}//${window.location.host}/vis/index.html`;
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
                <IconButton ref={rightRef} onClick={() => setRight(!right)} size="small">
                    <ArrowDropDownIcon />
                </IconButton>
                <DropMenu
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
                        window.location.href = `${window.location.protocol}//${window.location.host}/vis/index.html`;
                        setRight(false);
                    }}
                    >
                        <CloseIcon />
                        {I18n.t('Close editor')}
                    </DropMenuItem>
                    <DropMenuItem onClick={() => {
                        window.open(`${window.location.protocol}//${window.location.host}/vis/index.html`, '_blank');
                        setRight(false);
                    }}
                    >
                        <PlayArrowIcon />
                        {I18n.t('Open runtime in new window')}
                    </DropMenuItem>
                    <DropMenuItem onClick={() => {
                        props.socket.setState(`${props.adapterName}.${props.instance}.control.instance`, { val: '*', ack: true });
                        props.socket.setState(`${props.adapterName}.${props.instance}.control.data`, { val: null, ack: true });
                        props.socket.setState(`${props.adapterName}.${props.instance}.control.command`, { val: 'refresh', ack: true });
                        setRight(false);
                    }}
                    >
                        <SyncIcon />
                        {I18n.t('Reload all runtimes')}
                    </DropMenuItem>
                </DropMenu>
            </div>
            {props.currentUser
                ? <div className={props.classes.rightBlock}>
                    <PersonIcon fontSize="small" />
                    <span style={{ paddingRight: 8 }}>{props.currentUser}</span>
                    { props.socket.isSecure
                        ? <Tooltip title={I18n.t('Exit')}>
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
                : null }
        </span>
        <div className={props.classes.toolbar} style={{ alignItems: 'initial' }}>
            <Views {...props} />
            <Widgets {...props} />
            <Projects {...props} />
        </div>
    </div>;
};

Toolbar.propTypes = {
    classes: PropTypes.object,
    currentUser: PropTypes.string,
    needSave: PropTypes.bool,
    socket: PropTypes.object,
    toggleTheme: PropTypes.func,
    themeName: PropTypes.string,
};

export default withStyles(styles)(Toolbar);
