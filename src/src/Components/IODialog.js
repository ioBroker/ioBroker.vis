import I18n from '@iobroker/adapter-react/i18n';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';

const IODialog = props => <Dialog onClose={props.onClose} open={props.open}>
    <DialogTitle>{I18n.t(props.title)}</DialogTitle>
    <DialogContent>{props.children}</DialogContent>
    <DialogActions>
        <Button onClick={props.action} startIcon={<props.ActionIcon />}>{I18n.t(props.actionTitle)}</Button>
        <Button onClick={props.onClose} startIcon={<CloseIcon />}>{I18n.t('Cancel')}</Button>
    </DialogActions>
</Dialog>;

export default IODialog;
