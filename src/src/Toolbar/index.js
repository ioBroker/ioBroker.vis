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

    return <div>
        <span className={props.classes.right}>
            <div className={props.classes.rightBlock}>
                {props.needSave ? <CircularProgress size={20} /> : null}
                <Tooltip title={I18n.t('Close editor')}>
                    <IconButton size="small">
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
                    <DropMenuItem>
                        <CloseIcon />
                        {I18n.t('Close editor')}
                    </DropMenuItem>
                    <DropMenuItem>
                        <PlayArrowIcon />
                        {I18n.t('Open runtime in new window')}
                    </DropMenuItem>
                    <DropMenuItem>
                        <SyncIcon />
                        {I18n.t('Reload all runtimes')}
                    </DropMenuItem>
                </DropMenu>
            </div>
            {props.currentUser
                ? <div className={props.classes.rightBlock}>
                    <PersonIcon fontSize="small" />
                    <span>{props.currentUser}</span>
                    <Tooltip title={I18n.t('Exit')}>
                        <IconButton size="small" onClick={() => window.location.reload()}>
                            <ExitToAppIcon />
                        </IconButton>
                    </Tooltip>
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

export default withStyles(styles)(Toolbar);
