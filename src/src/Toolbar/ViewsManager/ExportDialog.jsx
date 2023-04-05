import PropTypes from 'prop-types';

import FileCopyIcon from '@mui/icons-material/FileCopy';

import { Utils, I18n } from '@iobroker/adapter-react-v5';

import IODialog from '../../Components/IODialog';
import CustomAceEditor from '../../Components/CustomAceEditor';

const ExportDialog = props => <IODialog
    open={props.open}
    onClose={props.onClose}
    title={I18n.t('Export "%s"', props.view)}
    closeTitle="Close"
    action={() => Utils.copyToClipboard(JSON.stringify(props.project[props.view], null, 2))}
    actionTitle="Copy to clipboard"
    actionNoClose
    ActionIcon={FileCopyIcon}
>
    <CustomAceEditor
        type="json"
        themeType={props.themeType}
        value={JSON.stringify(props.project[props.view], null, 2)}
        height={200}
    />
</IODialog>;

ExportDialog.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    project: PropTypes.object,
    themeType: PropTypes.string,
    view: PropTypes.string,
};

export default ExportDialog;
