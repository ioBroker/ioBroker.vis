import PropTypes from 'prop-types';
import I18n from '@iobroker/adapter-react/i18n';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';

const IODialog = props => <Dialog
    onClose={props.closeDisabled ? null : props.onClose}
    open={props.open}
    fullScreen={!!props.fullScreen}
    maxWidth={props.maxWidth || 'md'}
>
    <DialogTitle>{I18n.t(props.title)}</DialogTitle>
    <DialogContent onKeyUp={e => {
        if (props.action) {
            if (!props.actionDisabled) {
                if (e.keyCode === 13) {
                    props.action();
                    if (!props.actionNoClose) {
                        props.onClose();
                    }
                }
            }
        }
    }}
    >
        {props.children}
    </DialogContent>
    <DialogActions>
        { props.dialogActions ? props.dialogActions : null}
        { props.actionTitle
            ? <Button
                variant="contained"
                onClick={() => {
                    props.action();
                    if (!props.actionNoClose) {
                        props.onClose();
                    }
                }}
                color={props.actionColor ? props.actionColor : 'primary'}
                disabled={props.actionDisabled}
                startIcon={props.ActionIcon ? <props.ActionIcon /> : undefined}
            >
                {I18n.t(props.actionTitle)}
            </Button> : null }
        <Button
            variant="contained"
            onClick={props.onClose}
            disabled={props.closeDisabled}
            startIcon={<CloseIcon />}
        >
            {I18n.t(props.closeTitle ? props.closeTitle : 'Cancel')}
        </Button>
    </DialogActions>
</Dialog>;

IODialog.propTypes = {
    ActionIcon: PropTypes.any,
    action: PropTypes.func,
    actionColor: PropTypes.string,
    actionDisabled: PropTypes.bool,
    actionNoClose: PropTypes.bool,
    actionTitle: PropTypes.string,
    children: PropTypes.any,
    closeTitle: PropTypes.string,
    closeDisabled: PropTypes.bool,
    dialogActions: PropTypes.any,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    title: PropTypes.string,
    fullScreen: PropTypes.bool,
    maxWidth: PropTypes.string,
};

export default IODialog;
