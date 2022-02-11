import PropTypes from 'prop-types';
import I18n from '@iobroker/adapter-react/i18n';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';

const IODialog = props => <Dialog onClose={props.onClose} open={props.open}>
    <DialogTitle>{I18n.t(props.title)}</DialogTitle>
    <DialogContent>{props.children}</DialogContent>
    <DialogActions>
        { props.actionTitle
            ? <Button
                variant="contained"
                onClick={() => {
                    props.action();
                    props.onClose();
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
    actionTitle: PropTypes.string,
    children: PropTypes.any,
    closeTitle: PropTypes.string,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    title: PropTypes.string,
};

export default IODialog;
