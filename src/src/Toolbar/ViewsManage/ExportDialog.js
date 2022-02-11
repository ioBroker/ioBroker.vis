import I18n from '@iobroker/adapter-react/i18n';
import AceEditor from 'react-ace';
import IODialog from '../../Components/IODialog';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-min-noconflict/ext-language_tools';

const ExportDialog = props => <IODialog
    open={props.open}
    onClose={props.onClose}
    title={`${I18n.t('Export')} ${props.view}`}
    closeTitle="Close"
>
    <AceEditor
        mode="json"
        value={JSON.stringify(props.project[props.view], null, 2)}
        height="200px"
    />
</IODialog>;

export default ExportDialog;
