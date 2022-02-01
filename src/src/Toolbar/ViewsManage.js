import I18n from '@iobroker/adapter-react/i18n';
import {
    Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
} from '@material-ui/core';

import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

const ViewsManage = props => <Dialog open={props.open} onClose={props.onClose}>
    <DialogTitle>{I18n.t('Manage views')}</DialogTitle>
    <DialogContent>
        {Object.keys(props.project).map((name, key) => <div key={key}>
            {props.openedViews.includes(name)
                ? <IconButton onClick={() => props.toggleView(name, false)}>
                    <VisibilityIcon />
                </IconButton>
                : <IconButton onClick={() => props.toggleView(name, true)}>
                    <VisibilityOffIcon />
                </IconButton>}
            <span>{name}</span>
        </div>)}
    </DialogContent>
    <DialogActions></DialogActions>
</Dialog>;

export default ViewsManage;
