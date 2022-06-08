import PropTypes from 'prop-types';
import I18n from '@iobroker/adapter-react-v5/i18n';
import copy from 'copy-to-clipboard';
import AceEditor from 'react-ace';

import FileCopyIcon from '@mui/icons-material/FileCopy';

import IODialog from '../../Components/IODialog';

import ace from 'ace-builds/src-noconflict/ace';
import jsonWorkerUrl from 'ace-builds/src-noconflict/worker-json?url';

ace.config.setModuleUrl('ace/mode/json_worker', jsonWorkerUrl);
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/theme-clouds_midnight';
import 'ace-builds/src-noconflict/theme-chrome';

const ExportDialog = props => <IODialog
    open={props.open}
    onClose={props.onClose}
    title={`${I18n.t('Export')} ${props.view}`}
    closeTitle="Close"
    action={() => copy(JSON.stringify(props.project[props.view], null, 2))}
    actionTitle="Copy to clipboard"
    actionNoClose
    ActionIcon={FileCopyIcon}
>
    <AceEditor
        mode="json"
        theme={props.themeName === 'dark' ? 'clouds_midnight' : 'chrome'}
        value={JSON.stringify(props.project[props.view], null, 2)}
        height="200px"
    />
</IODialog>;

ExportDialog.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    project: PropTypes.object,
    themeName: PropTypes.string,
    view: PropTypes.string,
};

export default ExportDialog;