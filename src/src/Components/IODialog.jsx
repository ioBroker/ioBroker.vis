import PropTypes from 'prop-types';
import I18n from '@iobroker/adapter-react-v5/i18n';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

const IODialog = props => (props.open ? <Dialog
    onClose={props.closeDisabled ? null : props.onClose}
    open={!0}
    fullScreen={!!props.fullScreen}
    maxWidth={props.maxWidth || 'md'}
>
    <DialogTitle>{props.noTranslation ? props.title : I18n.t(props.title)}</DialogTitle>
    <DialogContent onKeyUp={e => {
        if (props.action) {
            if (!props.actionDisabled && !props.keyboardDisabled) {
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
                {props.noTranslation ? props.actionTitle : I18n.t(props.actionTitle)}
            </Button> : null }
        <Button
            variant="contained"
            color="grey"
            onClick={props.onClose}
            disabled={props.closeDisabled}
            startIcon={<CloseIcon />}
        >
            {props.noTranslation && props.closeTitle ? props.closeTitle : I18n.t(props.closeTitle || 'Cancel')}
        </Button>
    </DialogActions>
</Dialog> : null);

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
    keyboardDisabled: PropTypes.bool,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    title: PropTypes.string,
    fullScreen: PropTypes.bool,
    maxWidth: PropTypes.string,
};

export default IODialog;
